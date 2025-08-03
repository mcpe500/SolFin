const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../config/database');

/**
 * Manages sharded SQLite database connections, including read and write operations,
 * and provides load balancing for read replicas.
 * This manager is responsible for determining the correct shard for a given table
 * and executing database operations.
 */
class ShardManager {
  /**
   * Creates an instance of ShardManager.
   * Initializes internal maps for shards, read replicas, and write connections,
   * then proceeds to initialize all configured shards.
   */
  constructor() {
    console.log('ShardManager: Initializing...');
    /**
     * Map to store shard configurations.
     * @type {Map<string, object>}
     */
    this.shards = new Map();
    /**
     * Map to store read replica connections for each shard.
     * @type {Map<string, Array<import('better-sqlite3').Database>>}
     */
    this.readReplicas = new Map();
    /**
     * Map to store write connections for each shard.
     * @type {Map<string, import('better-sqlite3').Database>}
     */
    this.writeConnections = new Map();
    this.initializeShards();
    console.log('ShardManager: Initialization complete.');
  }

  /**
   * Initializes all configured database shards.
   * Ensures the shards directory exists and then sets up connections for each shard.
   */
  initializeShards() {
    console.log('ShardManager: Initializing shards...');
    const shardsDir = path.join(__dirname, '../shards');
    if (!fs.existsSync(shardsDir)) {
      console.log(`ShardManager: Creating shards directory: ${shardsDir}`);
      fs.mkdirSync(shardsDir, { recursive: true });
    }

    Object.entries(config.shards).forEach(([shardName, shardConfig]) => {
      this.initializeShard(shardName, shardConfig);
    });
    console.log('ShardManager: All shards initialized.');
  }

  /**
   * Initializes a single database shard, setting up its write connection and read replicas.
   * @param {string} shardName - The name of the shard (e.g., 'users', 'accounts').
   * @param {object} shardConfig - The configuration object for the shard, including its path and tables.
   * @throws {Error} If there is an issue initializing the shard's database connections.
   */
  initializeShard(shardName, shardConfig) {
    console.log(`ShardManager: Initializing shard '${shardName}' at path: ${shardConfig.path}`);
    const dbPath = path.resolve(shardConfig.path);
    
    try {
      // Create write connection
      const writeDb = new Database(dbPath);
      writeDb.pragma('journal_mode = WAL');
      writeDb.pragma('synchronous = NORMAL');
      writeDb.pragma('cache_size = 1000');
      
      this.writeConnections.set(shardName, writeDb);
      console.log(`ShardManager: Write connection established for shard '${shardName}'.`);
      
      // Create read replicas (in production, these would be separate files)
      const readReplicas = [];
      for (let i = 0; i < config.loadBalancer.readReplicas; i++) {
        const readDb = new Database(dbPath, { readonly: true });
        readDb.pragma('cache_size = 1000');
        readReplicas.push(readDb);
      }
      
      this.readReplicas.set(shardName, readReplicas);
      this.shards.set(shardName, shardConfig);
      
      console.log(`ShardManager: Initialized shard: ${shardName} with ${readReplicas.length} read replicas`);
    } catch (error) {
      console.error(`ShardManager: Failed to initialize shard '${shardName}':`, error);
      throw error; // Re-throw to prevent partial initialization
    }
  }

  /**
   * Determines the appropriate shard name for a given table.
   * @param {string} table - The name of the database table.
   * @param {any} [shardingValue=null] - An optional value used for sharding key determination (e.g., user_id).
   * @returns {string} The name of the shard that contains the specified table.
   * @throws {Error} If no shard is found for the given table.
   */
  getShardForTable(table, shardingValue = null) {
    console.log(`ShardManager: Getting shard for table: ${table}`);
    for (const [shardName, shardConfig] of this.shards.entries()) {
      if (shardConfig.tables.includes(table)) {
        console.log(`ShardManager: Found shard '${shardName}' for table '${table}'.`);
        return shardName;
      }
    }
    console.error(`ShardManager: No shard found for table: ${table}`);
    throw new Error(`No shard found for table: ${table}`);
  }

  /**
   * Retrieves the write connection for a specific shard.
   * @param {string} shardName - The name of the shard.
   * @returns {import('better-sqlite3').Database} The write connection for the specified shard.
   * @throws {Error} If no write connection is found for the shard.
   */
  getWriteConnection(shardName) {
    console.log(`ShardManager: Getting write connection for shard: ${shardName}`);
    const connection = this.writeConnections.get(shardName);
    if (!connection) {
      console.error(`ShardManager: No write connection found for shard: ${shardName}`);
      throw new Error(`No write connection found for shard: ${shardName}`);
    }
    return connection;
  }

  /**
   * Retrieves a read connection for a specific shard, applying a simple round-robin load balancing.
   * @param {string} shardName - The name of the shard.
   * @returns {import('better-sqlite3').Database} A read connection for the specified shard.
   * @throws {Error} If no read replicas are found for the shard.
   */
  getReadConnection(shardName) {
    console.log(`ShardManager: Getting read connection for shard: ${shardName}`);
    const replicas = this.readReplicas.get(shardName);
    if (!replicas || replicas.length === 0) {
      console.error(`ShardManager: No read replicas found for shard: ${shardName}`);
      throw new Error(`No read replicas found for shard: ${shardName}`);
    }
    
    // Simple round-robin load balancing
    const index = Math.floor(Math.random() * replicas.length);
    console.log(`ShardManager: Using read replica ${index + 1}/${replicas.length} for shard '${shardName}'.`);
    return replicas[index];
  }

  /**
   * Executes a write operation on the appropriate shard.
   * @param {string} table - The name of the table the operation is targeting.
   * @param {string} operation - The SQL query to execute.
   * @param {object} [params={}] - Parameters for the SQL query.
   * @returns {Promise<any>} The result of the write operation.
   * @throws {Error} If the write operation fails.
   */
  async executeWrite(table, operation, params = {}) {
    const shardName = this.getShardForTable(table);
    console.log(`ShardManager: Executing write on shard '${shardName}' for table '${table}'. Operation: ${operation}`);
    const db = this.getWriteConnection(shardName);
    
    try {
      const result = db.prepare(operation).run(params);
      console.log(`ShardManager: Write operation successful on shard '${shardName}' for table '${table}'.`);
      return result;
    } catch (error) {
      console.error(`ShardManager: Write operation failed on shard '${shardName}' for table '${table}':`, error);
      throw error;
    }
  }

  /**
   * Executes a read operation on the appropriate shard, leveraging read replicas for load balancing.
   * @param {string} table - The name of the table the operation is targeting.
   * @param {string} operation - The SQL query to execute.
   * @param {object} [params={}] - Parameters for the SQL query.
   * @returns {Promise<Array<any>>} The results of the read operation.
   * @throws {Error} If the read operation fails.
   */
  async executeRead(table, operation, params = {}) {
    const shardName = this.getShardForTable(table);
    console.log(`ShardManager: Executing read on shard '${shardName}' for table '${table}'. Operation: ${operation}`);
    const db = this.getReadConnection(shardName);
    
    try {
      const result = db.prepare(operation).all(params);
      console.log(`ShardManager: Read operation successful on shard '${shardName}' for table '${table}'.`);
      return result;
    } catch (error) {
      console.error(`ShardManager: Read operation failed on shard '${shardName}' for table '${table}':`, error);
      throw error;
    }
  }

  /**
   * Executes a series of database operations, grouped by shard, within their respective transactions.
   * IMPORTANT: This method does NOT provide distributed ACID transactions across multiple SQLite shards.
   * If an operation fails on one shard, operations on other shards that have already committed will NOT be rolled back.
   * For true multi-shard atomicity, a compensating transaction pattern or a distributed database system would be required.
   *
   * @param {Array<Object>} operations - An array of operation objects. Each object should have:
   *   - {string} table: The name of the table involved in the operation (used to determine the shard).
   *   - {string} sql: The SQL query to execute.
   *   - {Array<any>} [params]: Optional parameters for the SQL query.
   * @returns {Promise<Array<any>>} A promise that resolves to an array of results from each executed operation.
   * @throws {Error} If any operation within a shard's transaction fails.
   */
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

        try {
          results.push(...transaction());
        } catch (shardError) {
          console.error(`Transaction failed on shard ${shardName}:`, shardError);
          // Re-throw the error to ensure the calling code knows about the failure
          throw shardError;
        }
      }

      return results;
    } catch (error) {
      console.error('Overall multi-shard transaction failed:', error);
      throw error;
    }
  }

  /**
   * Closes all database connections managed by the ShardManager.
   */
  close() {
    console.log('ShardManager: Closing all database connections.');
    this.writeConnections.forEach((db, shardName) => {
      try {
        db.close();
        console.log(`ShardManager: Write connection for shard '${shardName}' closed.`);
      } catch (error) {
        console.error(`ShardManager: Failed to close write connection for shard '${shardName}':`, error);
      }
    });
    this.readReplicas.forEach((replicas, shardName) => {
      replicas.forEach((db, index) => {
        try {
          db.close();
          console.log(`ShardManager: Read replica ${index + 1} for shard '${shardName}' closed.`);
        } catch (error) {
          console.error(`ShardManager: Failed to close read replica ${index + 1} for shard '${shardName}':`, error);
        }
      });
    });
    console.log('ShardManager: All database connections closed.');
  }
}

module.exports = ShardManager;