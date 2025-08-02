const ShardManager = require('./ShardManager');
const MigrationManager = require('./MigrationManager');
const SeederManager = require('./SeederManager');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  constructor() {
    this.shardManager = new ShardManager();
    this.migrationManager = new MigrationManager(this.shardManager);
    this.seederManager = new SeederManager(this.shardManager);
    this.initializeTables();
  }

  async initializeTables() {
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
        db.exec(schema);
        console.log(`Initialized schema for shard: ${shardName}`);
      } catch (error) {
        console.error(`Failed to initialize schema for shard ${shardName}:`, error);
      }
    }
  }

  // Generic CRUD operations
  async create(table, data) {
    const id = uuidv4();
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (id, ${fields.join(', ')}) VALUES (?, ${placeholders})`;
    
    await this.shardManager.executeWrite(table, sql, [id, ...values]);
    return id;
  }

  async read(table, id) {
    const sql = `SELECT * FROM ${table} WHERE id = ?`;
    const results = await this.shardManager.executeRead(table, sql, [id]);
    return results[0] || null;
  }

  async update(table, id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await this.shardManager.executeWrite(table, sql, [...values, id]);
  }

  async delete(table, id) {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    await this.shardManager.executeWrite(table, sql, [id]);
  }

  async query(table, filters = {}) {
    let sql = `SELECT * FROM ${table}`;
    const params = [];
    
    if (Object.keys(filters).length > 0) {
      const conditions = Object.keys(filters).map(key => {
        params.push(filters[key]);
        return `${key} = ?`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    return await this.shardManager.executeRead(table, sql, params);
  }

  // Specialized methods for complex operations
  async getUserAccounts(userId) {
    return await this.query('accounts', { user_id: userId });
  }

  async getUserTransactions(userId, limit = 100) {
    const sql = `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT ?`;
    return await this.shardManager.executeRead('transactions', sql, [userId, limit]);
  }

  async createTransactionWithSplits(transactionData, splits) {
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
      operations.push({
        table: 'transaction_splits',
        sql: `INSERT INTO transaction_splits (id, transaction_id, pouch_id, amount) VALUES (?, ?, ?, ?)`,
        params: [uuidv4(), transactionId, split.pouch_id, split.amount]
      });
    });

    await this.shardManager.executeTransaction(operations);
    return transactionId;
  }

  // Migration methods
  async runMigrations(shardName = null) {
    if (shardName) {
      return await this.migrationManager.runMigrations(shardName);
    } else {
      return await this.migrationManager.runAllMigrations();
    }
  }

  async rollbackMigration(shardName) {
    return await this.migrationManager.rollbackMigration(shardName);
  }

  getMigrationStatus() {
    return this.migrationManager.getMigrationStatus();
  }

  // Seeder methods
  async runSeeders(shardName = null) {
    if (shardName) {
      return await this.seederManager.runSeeders(shardName);
    } else {
      return await this.seederManager.runAllSeeders();
    }
  }

  async runSeeder(shardName, seederName) {
    return await this.seederManager.runSeeder(shardName, seederName);
  }

  async resetSeeders(shardName) {
    return await this.seederManager.resetSeeders(shardName);
  }

  async refreshSeeders(shardName) {
    return await this.seederManager.refreshSeeders(shardName);
  }

  getSeederStatus() {
    return this.seederManager.getSeederStatus();
  }

  // Health check for all shards
  async healthCheck() {
    const health = {};
    
    for (const shardName of this.shardManager.shards.keys()) {
      try {
        const db = this.shardManager.getWriteConnection(shardName);
        db.prepare('SELECT 1').get();
        health[shardName] = 'healthy';
      } catch (error) {
        health[shardName] = 'unhealthy';
      }
    }
    
    return health;
  }

  close() {
    this.shardManager.close();
  }
}

module.exports = DatabaseService;