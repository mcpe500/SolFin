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
/**
 * @class ShardManager
 * @description Manages sharded SQLite database connections, including read and write operations,
 *              and provides load balancing for read replicas. This manager is responsible
 *              for determining the correct shard for a given table and executing database operations.
 */
class ShardManager {
  /**
   * @constructor
   * @description Initializes an instance of ShardManager.
   *              Sets up internal maps for shard configurations, read replicas, and write connections,
   *              and then proceeds to initialize all configured shards.
   */
  constructor() {
    console.log('ShardManager: Initializing...');
    /**
     * @property {Map<string, object>} shards - Map to store shard configurations.
     *                                          Key: shardName (string), Value: shardConfig (object).
     */
    this.shards = new Map();
    /**
     * @property {Map<string, Array<import('better-sqlite3').Database>>} readReplicas - Map to store read replica connections for each shard.
     *                                                                                 Key: shardName (string), Value: Array of SQLite database connections.
     */
    this.readReplicas = new Map();
    /**
     * @property {Map<string, import('better-sqlite3').Database>} writeConnections - Map to store write connections for each shard.
     *                                                                             Key: shardName (string), Value: SQLite database connection.
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
   * @method getShardForTable
   * @description Determines the appropriate shard name for a given table based on its configuration.
   * @param {string} table - The name of the database table (e.g., 'users', 'accounts').
   * @param {any} [shardingValue=null] - An optional value that could be used for advanced sharding key determination (e.g., user_id for consistent hashing), though not currently implemented beyond direct table mapping.
   * @returns {string} The name of the shard that is configured to contain the specified table.
   * @throws {Error} If no configured shard is found for the given table, indicating a misconfiguration.
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
   * @method getWriteConnection
   * @description Retrieves the dedicated write connection for a specific database shard.
   * @param {string} shardName - The name of the shard (e.g., 'users').
   * @returns {import('better-sqlite3').Database} The `better-sqlite3` database instance for write operations on the specified shard.
   * @throws {Error} If no write connection has been established or found for the given shard name.
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
   * @method getReadConnection
   * @description Retrieves a read-only database connection for a specific shard,
   *              implementing a basic round-robin load balancing mechanism across configured read replicas.
   * @param {string} shardName - The name of the shard (e.g., 'transactions').
   * @returns {import('better-sqlite3').Database} A `better-sqlite3` database instance for read operations on the specified shard.
   * @throws {Error} If no read replicas are configured or found for the given shard name.
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
   * @async
   * @method executeWrite
   * @description Executes a SQL write operation (INSERT, UPDATE, DELETE) on the appropriate shard.
   *              It automatically determines the target shard based on the table name.
   * @param {string} table - The name of the table the write operation is targeting.
   * @param {string} sql - The SQL query string to execute.
   * @param {Array<any>|object} [params={}] - Optional parameters to bind to the SQL query. Can be an array for positional parameters or an object for named parameters.
   * @returns {Promise<import('better-sqlite3').RunResult>} A Promise that resolves with the result of the SQLite `run` operation (e.g., `lastInsertRowid`, `changes`).
   * @throws {Error} If the operation fails, including issues with shard lookup, connection, or SQL execution.
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
   * @async
   * @method executeRead
   * @description Executes a SQL read operation (SELECT) on the appropriate shard,
   *              utilizing read replicas for load distribution.
   * @param {string} table - The name of the table the read operation is targeting.
   * @param {string} sql - The SQL query string to execute.
   * @param {Array<any>|object} [params={}] - Optional parameters to bind to the SQL query. Can be an array for positional parameters or an object for named parameters.
   * @returns {Promise<Array<any>>} A Promise that resolves with an array of query results.
   * @throws {Error} If the operation fails, including issues with shard lookup, connection, or SQL execution.
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
   * @method close
   * @description Closes all open database connections (write and read replicas) managed by the ShardManager.
   *              This method should be called to gracefully shut down database connections and release resources.
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