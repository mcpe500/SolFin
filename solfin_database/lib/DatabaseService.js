const ShardManager = require('./ShardManager');
const MigrationManager = require('./MigrationManager');
const SeederManager = require('./SeederManager');
const { v4: uuidv4 } = require('uuid');
const schemas = require('../config/schemas'); // Import externalized schemas

/**
 * @class DatabaseService
 * @description Centralized service for interacting with the sharded SQLite databases.
 *              Manages initialization of shards, migrations, seeders, and provides
 *              generic CRUD operations as well as specialized data access methods.
 */
class DatabaseService {
  /**
   * @constructor
   * @description Initializes the DatabaseService, including the ShardManager,
   *              MigrationManager, and SeederManager. Also ensures initial tables are created.
   */
  constructor() {
    console.log('DatabaseService: Initializing...');
    this.shardManager = new ShardManager();
    this.migrationManager = new MigrationManager(this.shardManager);
    this.seederManager = new SeederManager(this.shardManager);
    this.initializeTables();
    console.log('DatabaseService: Initialization complete.');
  }

  /**
   * @async
   * @method initializeTables
   * @description Initializes the database schema for all configured shards by executing
   *              the SQL defined in the external `schemas` module.
   *              Each schema creation is wrapped in a transaction for atomicity.
   */
  async initializeTables() {
    console.log('DatabaseService: Initializing tables for all shards...');
    // Execute schema creation for each shard using the imported schemas
    for (const [shardName, schema] of Object.entries(schemas)) {
      try {
        const db = this.shardManager.getWriteConnection(shardName);
        // Wrap schema creation in a transaction for atomicity
        db.transaction(() => {
          db.exec(schema);
        })(); // Immediately invoke the transaction
        console.log(`DatabaseService: Initialized schema for shard: ${shardName}`);
      } catch (error) {
        console.error(`DatabaseService: Failed to initialize schema for shard ${shardName}:`, error);
      }
    }
    console.log('DatabaseService: All schemas initialized.');
  }

  /**
   * @private
   * @method _validateData
   * @description Basic validation for data objects used in CRUD operations.
   * @param {object} data - The data object to validate.
   * @param {string} operation - The operation being performed (e.g., 'create', 'update').
   * @throws {Error} If the data is invalid (null, not an object, or empty).
   */
  _validateData(data, operation) {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new Error(`Invalid data provided for ${operation} operation.`);
    }
  }

  // Generic CRUD operations

  /**
   * @async
   * @method create
   * @description Creates a new record in the specified table within its respective shard.
   * @param {string} table - The name of the table (e.g., 'users', 'accounts').
   * @param {object} data - The data payload for the new record. A unique ID will be generated.
   * @returns {Promise<string>} A Promise that resolves with the ID of the newly created record.
   * @throws {Error} If the data is invalid or the database operation fails.
   */
  async create(table, data) {
    console.log(`DatabaseService: Creating record in table '${table}'.`);
    this._validateData(data, 'create'); // Validate input data

    const id = uuidv4();
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (id, ${fields.join(', ')}) VALUES (?, ${placeholders})`;
    
    try {
      await this.shardManager.executeWrite(table, sql, [id, ...values]);
      console.log(`DatabaseService: Record created with ID '${id}' in table '${table}'.`);
      return id;
    } catch (error) {
      console.error(`DatabaseService: Failed to create record in table '${table}':`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method read
   * @description Reads a single record from the specified table by its ID.
   * @param {string} table - The name of the table.
   * @param {string} id - The ID of the record to read.
   * @returns {Promise<object|null>} A Promise that resolves with the record data, or `null` if not found.
   * @throws {Error} If the database operation fails.
   */
  async read(table, id) {
    console.log(`DatabaseService: Reading record with ID '${id}' from table '${table}'.`);
    const sql = `SELECT * FROM ${table} WHERE id = ?`;
    try {
      const results = await this.shardManager.executeRead(table, sql, [id]);
      console.log(`DatabaseService: Read successful for record with ID '${id}' from table '${table}'. Found: ${results.length > 0}`);
      return results[0] || null;
    } catch (error) {
      console.error(`DatabaseService: Failed to read record with ID '${id}' from table '${table}':`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method update
   * @description Updates an existing record in the specified table by its ID.
   * @param {string} table - The name of the table.
   * @param {string} id - The ID of the record to update.
   * @param {object} data - The partial data to update the record with.
   * @returns {Promise<void>} A Promise that resolves when the update is complete.
   * @throws {Error} If the data is invalid or the database operation fails.
   */
  async update(table, id, data) {
    console.log(`DatabaseService: Updating record with ID '${id}' in table '${table}'.`);
    this._validateData(data, 'update'); // Validate input data

    const fields = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    try {
      await this.shardManager.executeWrite(table, sql, [...values, id]);
      console.log(`DatabaseService: Record with ID '${id}' updated in table '${table}'.`);
    } catch (error) {
      console.error(`DatabaseService: Failed to update record with ID '${id}' in table '${table}':`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method delete
   * @description Deletes a record from the specified table by its ID.
   * @param {string} table - The name of the table.
   * @param {string} id - The ID of the record to delete.
   * @returns {Promise<void>} A Promise that resolves when the deletion is complete.
   * @throws {Error} If the database operation fails.
   */
  async delete(table, id) {
    console.log(`DatabaseService: Deleting record with ID '${id}' from table '${table}'.`);
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    try {
      await this.shardManager.executeWrite(table, sql, [id]);
      console.log(`DatabaseService: Record with ID '${id}' deleted from table '${table}'.`);
    } catch (error) {
      console.error(`DatabaseService: Failed to delete record with ID '${id}' from table '${table}':`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method query
   * @description Queries the specified table with optional filters.
   * @param {string} table - The name of the table.
   * @param {object} [filters={}] - An object containing key-value pairs for filtering.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of matching records.
   * @throws {Error} If the database operation fails.
   */
  async query(table, filters = {}) {
    console.log(`DatabaseService: Querying table '${table}' with filters:`, filters);
    let sql = `SELECT * FROM ${table}`;
    const params = [];
    
    if (Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map(key => {
        params.push(filters[key]);
        return `${key} = ?`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    try {
      const results = await this.shardManager.executeRead(table, sql, params);
      console.log(`DatabaseService: Query successful for table '${table}'. Found ${results.length} records.`);
      return results;
    } catch (error) {
      console.error(`DatabaseService: Failed to query table '${table}':`, error);
      throw error;
    }
  }

  // Specialized methods for complex operations

  /**
   * @async
   * @method getUserAccounts
   * @description Retrieves all accounts associated with a specific user ID.
   * @param {string} userId - The unique identifier of the user.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of account objects.
   * @throws {Error} If the database operation fails.
   */
  async getUserAccounts(userId) {
    console.log(`DatabaseService: Getting accounts for user ID: ${userId}`);
    try {
      const accounts = await this.query('accounts', { user_id: userId });
      console.log(`DatabaseService: Found ${accounts.length} accounts for user ID: ${userId}`);
      return accounts;
    } catch (error) {
      console.error(`DatabaseService: Failed to get accounts for user ID '${userId}':`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method getUserTransactions
   * @description Retrieves a limited number of transactions for a specific user, sorted by date.
   * @param {string} userId - The unique identifier of the user.
   * @param {number} [limit=100] - The maximum number of transactions to retrieve. Defaults to 100.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of transaction objects.
   * @throws {Error} If the database operation fails.
   */
  async getUserTransactions(userId, limit = 100) {
    console.log(`DatabaseService: Getting transactions for user ID: ${userId} with limit: ${limit}`);
    const sql = `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT ?`;
    try {
      const transactions = await this.shardManager.executeRead('transactions', sql, [userId, limit]);
      console.log(`DatabaseService: Found ${transactions.length} transactions for user ID: ${userId}`);
      return transactions;
    } catch (error) {
      console.error(`DatabaseService: Failed to get transactions for user ID '${userId}':`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method createTransactionWithSplits
   * @description Creates a new transaction along with its associated splits in a single atomic operation.
   * @param {object} transactionData - The main transaction data.
   * @param {Array<object>} splits - An array of transaction split data. Each split object should contain `pouch_id` and `amount`.
   * @returns {Promise<string>} A Promise that resolves with the ID of the newly created transaction.
   * @throws {Error} If the transaction data or splits data is invalid, or if the database transaction fails.
   */
  async createTransactionWithSplits(transactionData, splits) {
    console.log('DatabaseService: Creating transaction with splits.');
    this._validateData(transactionData, 'createTransactionWithSplits - transactionData');
    if (!Array.isArray(splits) || splits.length === 0) {
      throw new Error('Invalid splits data provided for createTransactionWithSplits operation.');
    }

    const operations = [];
    
    // Create transaction
    const transactionId = uuidv4();
    operations.push({
      table: 'transactions',
      sql: `INSERT INTO transactions (id, user_id, account_id, amount, currency, description, category, tags, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        transactionId,
        transactionData.user_id,
        transactionData.account_id,
        transactionData.amount,
        transactionData.currency,
        transactionData.description,
        transactionData.category,
        transactionData.tags,
        transactionData.date
      ]
    });
 
    // Create splits
    splits.forEach(split => {
      this._validateData(split, 'createTransactionWithSplits - split');
      operations.push({
        table: 'transaction_splits',
        sql: `INSERT INTO transaction_splits (id, transaction_id, pouch_id, amount) VALUES (?, ?, ?, ?)`,
        params: [uuidv4(), transactionId, split.pouch_id, split.amount]
      });
    });

    try {
      await this.shardManager.executeTransaction(operations);
      console.log(`DatabaseService: Transaction with splits created successfully. Transaction ID: ${transactionId}`);
      return transactionId;
    } catch (error) {
      console.error('DatabaseService: Failed to create transaction with splits:', error);
      throw error;
    }
  }

  // Migration methods

  /**
   * @async
   * @method runMigrations
   * @description Runs pending database migrations for all shards or a specified shard.
   * @param {string|null} [shardName=null] - The name of the specific shard to migrate. If `null`, migrations will be run for all shards.
   * @returns {Promise<void>} A Promise that resolves when migrations are completed.
   * @throws {Error} If running migrations fails for any reason.
   */
  async runMigrations(shardName = null) {
    console.log(`DatabaseService: Running migrations for shard: ${shardName || 'all'}`);
    try {
      if (shardName) {
        return await this.migrationManager.runMigrations(shardName);
      } else {
        return await this.migrationManager.runAllMigrations();
      }
    } catch (error) {
      console.error(`DatabaseService: Failed to run migrations for shard ${shardName || 'all'}:`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method rollbackMigration
   * @description Rolls back the last executed migration for a specific shard.
   * @param {string} shardName - The name of the shard to rollback the migration for.
   * @returns {Promise<void>} A Promise that resolves when the migration has been rolled back.
   * @throws {Error} If rolling back the migration fails.
   */
  async rollbackMigration(shardName) {
    console.log(`DatabaseService: Rolling back migration for shard: ${shardName}`);
    try {
      return await this.migrationManager.rollbackMigration(shardName);
    } catch (error) {
      console.error(`DatabaseService: Failed to rollback migration for shard ${shardName}:`, error);
      throw error;
    }
  }

  /**
   * @method getMigrationStatus
   * @description Retrieves the current migration status for all configured shards.
   * @returns {object} An object where keys are shard names and values contain their migration status (executed, pending, total, lastExecuted).
   */
  getMigrationStatus() {
    console.log('DatabaseService: Getting migration status.');
    return this.migrationManager.getMigrationStatus();
  }

  // Seeder methods

  /**
   * @async
   * @method runSeeders
   * @description Runs pending database seeders for all shards or a specified shard.
   * @param {string|null} [shardName=null] - The name of the specific shard to seed. If `null`, seeders will be run for all shards.
   * @returns {Promise<void>} A Promise that resolves when seeders are completed.
   * @throws {Error} If running seeders fails for any reason.
   */
  async runSeeders(shardName = null) {
    console.log(`DatabaseService: Running seeders for shard: ${shardName || 'all'}`);
    try {
      if (shardName) {
        return await this.seederManager.runSeeders(shardName);
      } else {
        return await this.seederManager.runAllSeeders();
      }
    } catch (error) {
      console.error(`DatabaseService: Failed to run seeders for shard ${shardName || 'all'}:`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method runSeeder
   * @description Runs a specific seeder for a given shard.
   * @param {string} shardName - The name of the shard to run the seeder on.
   * @param {string} seederName - The name of the seeder to run (e.g., '001_demo_users').
   * @returns {Promise<void>} A Promise that resolves when the seeder is completed.
   * @throws {Error} If the seeder file is not found or if the seeder fails during execution.
   */
  async runSeeder(shardName, seederName) {
    console.log(`DatabaseService: Running seeder '${seederName}' for shard: ${shardName}`);
    try {
      return await this.seederManager.runSeeder(shardName, seederName);
    } catch (error) {
      console.error(`DatabaseService: Failed to run seeder '${seederName}' for shard ${shardName}:`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method resetSeeders
   * @description Resets (clears records of) executed seeders for a specific shard.
   *              This effectively marks all seeders as unexecuted for that shard.
   * @param {string} shardName - The name of the shard to reset seeders for.
   * @returns {Promise<void>} A Promise that resolves when the seeders have been reset.
   * @throws {Error} If the reset operation fails.
   */
  async resetSeeders(shardName) {
    console.log(`DatabaseService: Resetting seeders for shard: ${shardName}`);
    try {
      return await this.seederManager.resetSeeders(shardName);
    } catch (error) {
      console.error(`DatabaseService: Failed to reset seeders for shard ${shardName}:`, error);
      throw error;
    }
  }

  /**
   * @async
   * @method refreshSeeders
   * @description Resets and then re-runs all seeders for a specific shard.
   * @param {string} shardName - The name of the shard to refresh seeders for.
   * @returns {Promise<void>} A Promise that resolves when the seeders have been refreshed.
   * @throws {Error} If refreshing seeders fails.
   */
  async refreshSeeders(shardName) {
    console.log(`DatabaseService: Refreshing seeders for shard: ${shardName}`);
    try {
      return await this.seederManager.refreshSeeders(shardName);
    } catch (error) {
      console.error(`DatabaseService: Failed to refresh seeders for shard ${shardName}:`, error);
      throw error;
    }
  }

  /**
   * @method getSeederStatus
   * @description Retrieves the current seeder execution status for all configured shards.
   * @returns {object} An object where keys are shard names and values contain their seeder status.
   */
  getSeederStatus() {
    console.log('DatabaseService: Getting seeder status.');
    return this.seederManager.getSeederStatus();
  }

  /**
   * @async
   * @method healthCheck
   * @description Performs a health check across all configured database shards.
   *              It attempts to execute a simple query on each shard's write connection
   *              to verify its connectivity and responsiveness.
   * @returns {Promise<object>} A Promise that resolves with an object containing the health status
   *                            of each shard (e.g., `{ users: 'healthy', accounts: 'unhealthy' }`).
   * @throws {Error} If there's a critical error preventing the health check from completing.
   */
  async healthCheck() {
    console.log('DatabaseService: Performing health check for all shards.');
    const health = {};
    
    for (const shardName of this.shardManager.shards.keys()) {
      try {
        const db = this.shardManager.getWriteConnection(shardName);
        db.prepare('SELECT 1').get();
        health[shardName] = 'healthy';
        console.log(`DatabaseService: Shard '${shardName}' is healthy.`);
      } catch (error) {
        health[shardName] = 'unhealthy';
        console.error(`DatabaseService: Shard '${shardName}' is unhealthy:`, error);
      }
    }
    console.log('DatabaseService: Health check complete.');
    return health;
  }

  /**
   * @method close
   * @description Closes all open database connections managed by the ShardManager.
   *              This should be called when the DatabaseService is no longer needed
   *              to free up resources.
   */
  close() {
    console.log('DatabaseService: Closing database connections.');
    this.shardManager.close();
    console.log('DatabaseService: Database connections closed.');
  }
}

module.exports = DatabaseService;