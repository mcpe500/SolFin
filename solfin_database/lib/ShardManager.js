const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../config/database');

class ShardManager {
  constructor() {
    this.shards = new Map();
    this.readReplicas = new Map();
    this.writeConnections = new Map();
    this.initializeShards();
  }

  initializeShards() {
    // Ensure shards directory exists
    const shardsDir = path.join(__dirname, '../shards');
    if (!fs.existsSync(shardsDir)) {
      fs.mkdirSync(shardsDir, { recursive: true });
    }

    // Initialize each shard
    Object.entries(config.shards).forEach(([shardName, shardConfig]) => {
      this.initializeShard(shardName, shardConfig);
    });
  }

  initializeShard(shardName, shardConfig) {
    const dbPath = path.resolve(shardConfig.path);
    
    // Create write connection
    const writeDb = new Database(dbPath);
    writeDb.pragma('journal_mode = WAL');
    writeDb.pragma('synchronous = NORMAL');
    writeDb.pragma('cache_size = 1000');
    
    this.writeConnections.set(shardName, writeDb);
    
    // Create read replicas (in production, these would be separate files)
    const readReplicas = [];
    for (let i = 0; i < config.loadBalancer.readReplicas; i++) {
      const readDb = new Database(dbPath, { readonly: true });
      readDb.pragma('cache_size = 1000');
      readReplicas.push(readDb);
    }
    
    this.readReplicas.set(shardName, readReplicas);
    this.shards.set(shardName, shardConfig);
    
    console.log(`Initialized shard: ${shardName} with ${readReplicas.length} read replicas`);
  }

  // Determine which shard to use based on table and sharding key
  getShardForTable(table, shardingValue = null) {
    for (const [shardName, shardConfig] of this.shards.entries()) {
      if (shardConfig.tables.includes(table)) {
        return shardName;
      }
    }
    throw new Error(`No shard found for table: ${table}`);
  }

  // Get write connection for a shard
  getWriteConnection(shardName) {
    const connection = this.writeConnections.get(shardName);
    if (!connection) {
      throw new Error(`No write connection found for shard: ${shardName}`);
    }
    return connection;
  }

  // Get read connection with load balancing
  getReadConnection(shardName) {
    const replicas = this.readReplicas.get(shardName);
    if (!replicas || replicas.length === 0) {
      throw new Error(`No read replicas found for shard: ${shardName}`);
    }
    
    // Simple round-robin load balancing
    const index = Math.floor(Math.random() * replicas.length);
    return replicas[index];
  }

  // Execute write operation
  async executeWrite(table, operation, params = {}) {
    const shardName = this.getShardForTable(table);
    const db = this.getWriteConnection(shardName);
    
    try {
      return db.prepare(operation).run(params);
    } catch (error) {
      console.error(`Write operation failed on shard ${shardName}:`, error);
      throw error;
    }
  }

  // Execute read operation with load balancing
  async executeRead(table, operation, params = {}) {
    const shardName = this.getShardForTable(table);
    const db = this.getReadConnection(shardName);
    
    try {
      return db.prepare(operation).all(params);
    } catch (error) {
      console.error(`Read operation failed on shard ${shardName}:`, error);
      throw error;
    }
  }

  // Execute transaction across multiple shards if needed
  async executeTransaction(operations) {
    const shardTransactions = new Map();
    
    try {
      // Group operations by shard
      operations.forEach(op => {
        const shardName = this.getShardForTable(op.table);
        if (!shardTransactions.has(shardName)) {
          shardTransactions.set(shardName, []);
        }
        shardTransactions.get(shardName).push(op);
      });

      // Execute transactions per shard
      const results = [];
      for (const [shardName, shardOps] of shardTransactions.entries()) {
        const db = this.getWriteConnection(shardName);
        const transaction = db.transaction(() => {
          return shardOps.map(op => {
            return db.prepare(op.sql).run(op.params || {});
          });
        });
        
        results.push(...transaction());
      }
      
      return results;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Close all connections
  close() {
    this.writeConnections.forEach(db => db.close());
    this.readReplicas.forEach(replicas => {
      replicas.forEach(db => db.close());
    });
  }
}

module.exports = ShardManager;