/**
 * @module 001_create_initial_tables
 * @description This migration creates the initial table structure for all sharded databases.
 * It defines the schema for users, accounts, transactions, pouches, and transfers,
 * including primary keys, foreign keys, unique constraints, and initial indexes.
 */

/**
 * @module 001_create_initial_tables
 * @description This migration creates the initial table structure for all sharded databases.
 * It defines the schema for users, accounts, transactions, pouches, and transfers,
 * including primary keys, foreign keys, unique constraints, and initial indexes.
 */
module.exports = {
  /**
   * @property {Array<string>} shards - Defines which shards this migration applies to.
   *                                  If not specified, the migration applies to all shards.
   */
  shards: ['users', 'accounts', 'transactions', 'pouches', 'transfers'],
  
  /**
   * @async
   * @method up
   * @description Applies the migration to create initial tables for the specified shard.
   * @param {import('better-sqlite3').Database} db - The database connection instance for the current shard.
   * @param {string} shardName - The name of the shard currently being migrated.
   * @returns {Promise<void>} A Promise that resolves when the tables are created.
   */
  async up(db, shardName) {
    console.log(`Creating initial tables for shard: ${shardName}`);
    
    switch (shardName) {
      case 'users':
        db.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          
          CREATE TABLE IF NOT EXISTS user_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
          
          CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
          CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
          
          CREATE TABLE IF NOT EXISTS user_preferences (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, key)
          );
          
          CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
        `);
        break;
        
      case 'accounts':
        db.exec(`
          CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('cash', 'savings', 'credit', 'loan', 'crypto', 'investment')),
            currency TEXT NOT NULL DEFAULT 'USD',
            initial_balance DECIMAL(15,2) DEFAULT 0,
            current_balance DECIMAL(15,2) DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
          CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
          
          CREATE TABLE IF NOT EXISTS account_balances (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            balance DECIMAL(15,2) NOT NULL,
            balance_date DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
          );
          
          CREATE INDEX IF NOT EXISTS idx_account_balances_account_id ON account_balances(account_id);
          CREATE INDEX IF NOT EXISTS idx_account_balances_date ON account_balances(balance_date);
        `);
        break;
        
      case 'transactions':
        db.exec(`
          CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            account_id TEXT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            currency TEXT NOT NULL DEFAULT 'USD',
            description TEXT,
            category TEXT,
            tags TEXT,
            transaction_date DATETIME NOT NULL,
            location_lat DECIMAL(10,8),
            location_lng DECIMAL(11,8),
            receipt_image TEXT,
            is_recurring BOOLEAN DEFAULT 0,
            recurring_pattern TEXT,
            is_deleted BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
          CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
          CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
          CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
          
          CREATE TABLE IF NOT EXISTS transaction_splits (
            id TEXT PRIMARY KEY,
            transaction_id TEXT NOT NULL,
            pouch_id TEXT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
          );
          
          CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction_id ON transaction_splits(transaction_id);
          CREATE INDEX IF NOT EXISTS idx_transaction_splits_pouch_id ON transaction_splits(pouch_id);
        `);
        break;
        
      case 'pouches':
        db.exec(`
          CREATE TABLE IF NOT EXISTS pouches (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            type TEXT DEFAULT 'private' CHECK (type IN ('private', 'shared')),
            budget_amount DECIMAL(15,2),
            budget_period TEXT CHECK (budget_period IN ('weekly', 'monthly', 'yearly')),
            color TEXT,
            icon TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_pouches_user_id ON pouches(user_id);
          CREATE INDEX IF NOT EXISTS idx_pouches_type ON pouches(type);
          
          CREATE TABLE IF NOT EXISTS goals (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            pouch_id TEXT,
            title TEXT NOT NULL,
            description TEXT,
            target_amount DECIMAL(15,2) NOT NULL,
            current_amount DECIMAL(15,2) DEFAULT 0,
            target_date DATE,
            priority INTEGER DEFAULT 1,
            is_achieved BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pouch_id) REFERENCES pouches(id) ON DELETE SET NULL
          );
          
          CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
          CREATE INDEX IF NOT EXISTS idx_goals_pouch_id ON goals(pouch_id);
          CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
          
          CREATE TABLE IF NOT EXISTS pouch_shares (
            id TEXT PRIMARY KEY,
            pouch_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
            invited_by TEXT,
            invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            accepted_at DATETIME,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (pouch_id) REFERENCES pouches(id) ON DELETE CASCADE,
            UNIQUE(pouch_id, user_id)
          );
          
          CREATE INDEX IF NOT EXISTS idx_pouch_shares_pouch_id ON pouch_shares(pouch_id);
          CREATE INDEX IF NOT EXISTS idx_pouch_shares_user_id ON pouch_shares(user_id);
        `);
        break;
        
      case 'transfers':
        db.exec(`
          CREATE TABLE IF NOT EXISTS transfers (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            from_account_id TEXT NOT NULL,
            to_account_id TEXT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            currency TEXT NOT NULL DEFAULT 'USD',
            exchange_rate DECIMAL(10,6) DEFAULT 1.0,
            fee DECIMAL(15,2) DEFAULT 0,
            description TEXT,
            transfer_date DATETIME NOT NULL,
            status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
            reference_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id);
          CREATE INDEX IF NOT EXISTS idx_transfers_from_account ON transfers(from_account_id);
          CREATE INDEX IF NOT EXISTS idx_transfers_to_account ON transfers(to_account_id);
          CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(transfer_date);
          CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
        `);
        break;
    }
    
    console.log(`Initial tables created successfully for shard: ${shardName}`);
  },
  
  /**
   * @async
   * @method down
   * @description Reverts the migration by dropping the initial tables for the specified shard.
   *              Note: SQLite does not support `DROP COLUMN`, so this method focuses on dropping tables and indexes.
   * @param {import('better-sqlite3').Database} db - The database connection instance for the current shard.
   * @param {string} shardName - The name of the shard currently being reverted.
   * @returns {Promise<void>} A Promise that resolves when the tables are dropped.
   */
  async down(db, shardName) {
    console.log(`Dropping initial tables for shard: ${shardName}`);
    
    switch (shardName) {
      case 'users':
        db.exec(`
          DROP TABLE IF EXISTS user_preferences;
          DROP TABLE IF EXISTS user_sessions;
          DROP TABLE IF EXISTS users;
        `);
        break;
        
      case 'accounts':
        db.exec(`
          DROP TABLE IF EXISTS account_balances;
          DROP TABLE IF EXISTS accounts;
        `);
        break;
        
      case 'transactions':
        db.exec(`
          DROP TABLE IF EXISTS transaction_splits;
          DROP TABLE IF EXISTS transactions;
        `);
        break;
        
      case 'pouches':
        db.exec(`
          DROP TABLE IF EXISTS pouch_shares;
          DROP TABLE IF EXISTS goals;
          DROP TABLE IF EXISTS pouches;
        `);
        break;
        
      case 'transfers':
        db.exec(`
          DROP TABLE IF EXISTS transfers;
        `);
        break;
    }
    
    console.log(`Initial tables dropped successfully for shard: ${shardName}`);
  }
};