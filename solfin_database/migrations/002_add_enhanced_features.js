/**
 * @module 002_add_enhanced_features
 * @description This migration adds enhanced features and indexes to existing tables
 * across various shards for improved functionality and performance.
 * It includes adding new columns and creating additional indexes.
 */

/**
 * @module 002_add_enhanced_features
 * @description This migration adds enhanced features and indexes to existing tables
 * across various shards for improved functionality and performance.
 * It includes adding new columns and creating additional indexes.
 */
module.exports = {
  /**
   * @property {Array<string>} shards - Defines which shards this migration applies to.
   */
  shards: ['users', 'accounts', 'transactions', 'pouches', 'transfers'],
  
  /**
   * @async
   * @method up
   * @description Applies the migration to add enhanced features and indexes for the specified shard.
   * @param {import('better-sqlite3').Database} db - The database connection instance for the current shard.
   * @param {string} shardName - The name of the shard currently being migrated.
   * @returns {Promise<void>} A Promise that resolves when the features and indexes are added.
   */
  async up(db, shardName) {
    console.log(`Adding enhanced features for shard: ${shardName}`);
    
    switch (shardName) {
      case 'users':
        db.exec(`
          -- Add user profile enhancements
          ALTER TABLE users ADD COLUMN phone TEXT;
          ALTER TABLE users ADD COLUMN avatar_url TEXT;
          ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';
          ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;
          ALTER TABLE users ADD COLUMN last_login DATETIME;
          
          -- Add user preferences enhancements
          ALTER TABLE user_preferences ADD COLUMN category TEXT DEFAULT 'general';
          ALTER TABLE user_preferences ADD COLUMN is_public BOOLEAN DEFAULT 0;
          
          -- Add indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
          CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
          CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
          CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);
        `);
        break;
        
      case 'accounts':
        db.exec(`
          -- Add account enhancements
          ALTER TABLE accounts ADD COLUMN account_number TEXT;
          ALTER TABLE accounts ADD COLUMN bank_name TEXT;
          ALTER TABLE accounts ADD COLUMN interest_rate DECIMAL(5,4) DEFAULT 0;
          ALTER TABLE accounts ADD COLUMN credit_limit DECIMAL(15,2);
          ALTER TABLE accounts ADD COLUMN minimum_balance DECIMAL(15,2) DEFAULT 0;
          ALTER TABLE accounts ADD COLUMN last_transaction_date DATETIME;
          
          -- Add account balance history enhancements
          ALTER TABLE account_balances ADD COLUMN balance_type TEXT DEFAULT 'actual' CHECK (balance_type IN ('actual', 'available', 'pending'));
          ALTER TABLE account_balances ADD COLUMN notes TEXT;
          
          -- Add indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
          CREATE INDEX IF NOT EXISTS idx_accounts_bank_name ON accounts(bank_name);
          CREATE INDEX IF NOT EXISTS idx_accounts_last_transaction ON accounts(last_transaction_date);
          CREATE INDEX IF NOT EXISTS idx_account_balances_type ON account_balances(balance_type);
        `);
        break;
        
      case 'transactions':
        db.exec(`
          -- Add transaction enhancements
          ALTER TABLE transactions ADD COLUMN reference_number TEXT;
          ALTER TABLE transactions ADD COLUMN merchant_name TEXT;
          ALTER TABLE transactions ADD COLUMN merchant_category TEXT;
          ALTER TABLE transactions ADD COLUMN payment_method TEXT;
          ALTER TABLE transactions ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;
          ALTER TABLE transactions ADD COLUMN original_amount DECIMAL(15,2);
          ALTER TABLE transactions ADD COLUMN original_currency TEXT;
          ALTER TABLE transactions ADD COLUMN receipt_url TEXT;
          ALTER TABLE transactions ADD COLUMN notes TEXT;
          ALTER TABLE transactions ADD COLUMN is_verified BOOLEAN DEFAULT 0;
          ALTER TABLE transactions ADD COLUMN verified_at DATETIME;
          ALTER TABLE transactions ADD COLUMN verified_by TEXT;
          
          -- Add transaction splits enhancements
          ALTER TABLE transaction_splits ADD COLUMN percentage DECIMAL(5,2);
          ALTER TABLE transaction_splits ADD COLUMN is_primary BOOLEAN DEFAULT 0;
          
          -- Add indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_number);
          CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_name);
          CREATE INDEX IF NOT EXISTS idx_transactions_merchant_category ON transactions(merchant_category);
          CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
          CREATE INDEX IF NOT EXISTS idx_transactions_is_verified ON transactions(is_verified);
          CREATE INDEX IF NOT EXISTS idx_transaction_splits_percentage ON transaction_splits(percentage);
          CREATE INDEX IF NOT EXISTS idx_transaction_splits_primary ON transaction_splits(is_primary);
        `);
        break;
        
      case 'pouches':
        db.exec(`
          -- Add pouch enhancements
          ALTER TABLE pouches ADD COLUMN parent_pouch_id TEXT;
          ALTER TABLE pouches ADD COLUMN sort_order INTEGER DEFAULT 0;
          ALTER TABLE pouches ADD COLUMN budget_start_date DATE;
          ALTER TABLE pouches ADD COLUMN budget_end_date DATE;
          ALTER TABLE pouches ADD COLUMN auto_budget BOOLEAN DEFAULT 0;
          ALTER TABLE pouches ADD COLUMN budget_percentage DECIMAL(5,2);
          ALTER TABLE pouches ADD COLUMN alert_threshold DECIMAL(5,2) DEFAULT 80.0;
          ALTER TABLE pouches ADD COLUMN current_spent DECIMAL(15,2) DEFAULT 0;
          
          -- Add goal enhancements
          ALTER TABLE goals ADD COLUMN category TEXT;
          ALTER TABLE goals ADD COLUMN auto_contribute BOOLEAN DEFAULT 0;
          ALTER TABLE goals ADD COLUMN contribution_amount DECIMAL(15,2);
          ALTER TABLE goals ADD COLUMN contribution_frequency TEXT CHECK (contribution_frequency IN ('daily', 'weekly', 'monthly', 'yearly'));
          ALTER TABLE goals ADD COLUMN last_contribution_date DATE;
          ALTER TABLE goals ADD COLUMN image_url TEXT;
          ALTER TABLE goals ADD COLUMN notes TEXT;
          
          -- Add pouch shares enhancements
          ALTER TABLE pouch_shares ADD COLUMN permissions TEXT DEFAULT 'read,write';
          ALTER TABLE pouch_shares ADD COLUMN notification_settings TEXT DEFAULT 'all';
          
          -- Add indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_pouches_parent ON pouches(parent_pouch_id);
          CREATE INDEX IF NOT EXISTS idx_pouches_sort_order ON pouches(sort_order);
          CREATE INDEX IF NOT EXISTS idx_pouches_budget_dates ON pouches(budget_start_date, budget_end_date);
          CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category);
          CREATE INDEX IF NOT EXISTS idx_goals_auto_contribute ON goals(auto_contribute);
          CREATE INDEX IF NOT EXISTS idx_goals_contribution_date ON goals(last_contribution_date);
          
          -- Add foreign key constraint for parent pouch
          -- Note: SQLite doesn't support adding foreign keys to existing tables
          -- This would need to be handled in application logic
        `);
        break;
        
      case 'transfers':
        db.exec(`
          -- Add transfer enhancements
          ALTER TABLE transfers ADD COLUMN transfer_type TEXT DEFAULT 'internal' CHECK (transfer_type IN ('internal', 'external', 'wire', 'ach'));
          ALTER TABLE transfers ADD COLUMN scheduled_date DATE;
          ALTER TABLE transfers ADD COLUMN is_recurring BOOLEAN DEFAULT 0;
          ALTER TABLE transfers ADD COLUMN recurring_pattern TEXT;
          ALTER TABLE transfers ADD COLUMN next_occurrence DATE;
          ALTER TABLE transfers ADD COLUMN confirmation_code TEXT;
          ALTER TABLE transfers ADD COLUMN external_reference TEXT;
          ALTER TABLE transfers ADD COLUMN processing_fee DECIMAL(15,2) DEFAULT 0;
          ALTER TABLE transfers ADD COLUMN notes TEXT;
          ALTER TABLE transfers ADD COLUMN approved_by TEXT;
          ALTER TABLE transfers ADD COLUMN approved_at DATETIME;
          
          -- Add indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_transfers_type ON transfers(transfer_type);
          CREATE INDEX IF NOT EXISTS idx_transfers_scheduled_date ON transfers(scheduled_date);
          CREATE INDEX IF NOT EXISTS idx_transfers_is_recurring ON transfers(is_recurring);
          CREATE INDEX IF NOT EXISTS idx_transfers_next_occurrence ON transfers(next_occurrence);
          CREATE INDEX IF NOT EXISTS idx_transfers_confirmation ON transfers(confirmation_code);
          CREATE INDEX IF NOT EXISTS idx_transfers_approved_by ON transfers(approved_by);
        `);
        break;
    }
    
    console.log(`Enhanced features added successfully for shard: ${shardName}`);
  },
  
  /**
   * @async
   * @method down
   * @description Reverts the migration by dropping the added indexes for the specified shard.
   *              Note: SQLite does not support `DROP COLUMN`, so new columns added by this migration
   *              cannot be directly removed by a 'down' migration.
   * @param {import('better-sqlite3').Database} db - The database connection instance for the current shard.
   * @param {string} shardName - The name of the shard currently being reverted.
   * @returns {Promise<void>} A Promise that resolves when the indexes are dropped.
   */
  async down(db, shardName) {
    console.log(`Removing enhanced features for shard: ${shardName}`);
    
    // Note: SQLite doesn't support DROP COLUMN, so we would need to recreate tables
    // For development purposes, we'll just drop indexes
    
    switch (shardName) {
      case 'users':
        db.exec(`
          DROP INDEX IF EXISTS idx_users_phone;
          DROP INDEX IF EXISTS idx_users_is_active;
          DROP INDEX IF EXISTS idx_users_last_login;
          DROP INDEX IF EXISTS idx_user_preferences_category;
        `);
        break;
        
      case 'accounts':
        db.exec(`
          DROP INDEX IF EXISTS idx_accounts_account_number;
          DROP INDEX IF EXISTS idx_accounts_bank_name;
          DROP INDEX IF EXISTS idx_accounts_last_transaction;
          DROP INDEX IF EXISTS idx_account_balances_type;
        `);
        break;
        
      case 'transactions':
        db.exec(`
          DROP INDEX IF EXISTS idx_transactions_reference;
          DROP INDEX IF EXISTS idx_transactions_merchant;
          DROP INDEX IF EXISTS idx_transactions_merchant_category;
          DROP INDEX IF EXISTS idx_transactions_payment_method;
          DROP INDEX IF EXISTS idx_transactions_is_verified;
          DROP INDEX IF EXISTS idx_transaction_splits_percentage;
          DROP INDEX IF EXISTS idx_transaction_splits_primary;
        `);
        break;
        
      case 'pouches':
        db.exec(`
          DROP INDEX IF EXISTS idx_pouches_parent;
          DROP INDEX IF EXISTS idx_pouches_sort_order;
          DROP INDEX IF EXISTS idx_pouches_budget_dates;
          DROP INDEX IF EXISTS idx_goals_category;
          DROP INDEX IF EXISTS idx_goals_auto_contribute;
          DROP INDEX IF EXISTS idx_goals_contribution_date;
        `);
        break;
        
      case 'transfers':
        db.exec(`
          DROP INDEX IF EXISTS idx_transfers_type;
          DROP INDEX IF EXISTS idx_transfers_scheduled_date;
          DROP INDEX IF EXISTS idx_transfers_is_recurring;
          DROP INDEX IF EXISTS idx_transfers_next_occurrence;
          DROP INDEX IF EXISTS idx_transfers_confirmation;
          DROP INDEX IF EXISTS idx_transfers_approved_by;
        `);
        break;
    }
    
    console.log(`Enhanced features removed successfully for shard: ${shardName}`);
  }
};