const ShardManager = require('./ShardManager');
const MigrationManager = require('./MigrationManager');
const SeederManager = require('./SeederManager');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  constructor() {
    console.log('DatabaseService: Initializing...');
    this.shardManager = new ShardManager();
    this.migrationManager = new MigrationManager(this.shardManager);
    this.seederManager = new SeederManager(this.shardManager);
    this.initializeTables();
    console.log('DatabaseService: Initialization complete.');
  }

  async initializeTables() {
    console.log('DatabaseService: Initializing tables for all shards...');
    // Initialize tables for each shard
    const schemas = {
      users: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS user_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
        
        CREATE TABLE IF NOT EXISTS user_preferences (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `,
      
      accounts: `
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          currency TEXT NOT NULL,
          initial_balance DECIMAL(15,2) DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS account_balances (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          balance DECIMAL(15,2) NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (account_id) REFERENCES accounts(id)
        );
      `,
      
      transactions: `
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          account_id TEXT NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          currency TEXT NOT NULL,
          description TEXT,
          category TEXT,
          tags TEXT,
          date DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS transaction_splits (
          id TEXT PRIMARY KEY,
          transaction_id TEXT NOT NULL,
          pouch_id TEXT NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          FOREIGN KEY (transaction_id) REFERENCES transactions(id)
        );
      `,
      
      pouches: `
        CREATE TABLE IF NOT EXISTS pouches (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT DEFAULT 'private',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS goals (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          pouch_id TEXT,
          title TEXT NOT NULL,
          target_amount DECIMAL(15,2) NOT NULL,
          target_date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (pouch_id) REFERENCES pouches(id)
        );
        
        CREATE TABLE IF NOT EXISTS pouch_shares (
          id TEXT PRIMARY KEY,
          pouch_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (pouch_id) REFERENCES pouches(id)
        );
      `,
      
      transfers: `
        CREATE TABLE IF NOT EXISTS transfers (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          from_account_id TEXT NOT NULL,
          to_account_id TEXT NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          currency TEXT NOT NULL,
          description TEXT,
          date DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `
    };

    // Execute schema creation for each shard
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
   * Basic validation for data objects.
   * @param {Object} data - The data object to validate.
   * @param {string} operation - The operation being performed (e.g., 'create', 'update').
   * @throws {Error} If the data is invalid.
   */
  _validateData(data, operation) {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new Error(`Invalid data provided for ${operation} operation.`);
    }
  }

  // Generic CRUD operations
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

  async rollbackMigration(shardName) {
    console.log(`DatabaseService: Rolling back migration for shard: ${shardName}`);
    try {
      return await this.migrationManager.rollbackMigration(shardName);
    } catch (error) {
      console.error(`DatabaseService: Failed to rollback migration for shard ${shardName}:`, error);
      throw error;
    }
  }

  getMigrationStatus() {
    console.log('DatabaseService: Getting migration status.');
    return this.migrationManager.getMigrationStatus();
  }

  // Seeder methods
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

  async runSeeder(shardName, seederName) {
    console.log(`DatabaseService: Running seeder '${seederName}' for shard: ${shardName}`);
    try {
      return await this.seederManager.runSeeder(shardName, seederName);
    } catch (error) {
      console.error(`DatabaseService: Failed to run seeder '${seederName}' for shard ${shardName}:`, error);
      throw error;
    }
  }

  async resetSeeders(shardName) {
    console.log(`DatabaseService: Resetting seeders for shard: ${shardName}`);
    try {
      return await this.seederManager.resetSeeders(shardName);
    } catch (error) {
      console.error(`DatabaseService: Failed to reset seeders for shard ${shardName}:`, error);
      throw error;
    }
  }

  async refreshSeeders(shardName) {
    console.log(`DatabaseService: Refreshing seeders for shard: ${shardName}`);
    try {
      return await this.seederManager.refreshSeeders(shardName);
    } catch (error) {
      console.error(`DatabaseService: Failed to refresh seeders for shard ${shardName}:`, error);
      throw error;
    }
  }

  getSeederStatus() {
    console.log('DatabaseService: Getting seeder status.');
    return this.seederManager.getSeederStatus();
  }

  // Health check for all shards
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

  close() {
    console.log('DatabaseService: Closing database connections.');
    this.shardManager.close();
    console.log('DatabaseService: Database connections closed.');
  }
}

module.exports = DatabaseService;