/**
 * @module 002_demo_accounts
 * @description Seeder to populate the 'accounts' shard with demo financial accounts for existing demo users.
 *              This seeder assumes that demo users (e.g., 'demo-user-1') have already been created
 *              by the `001_demo_users` seeder.
 */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  /**
   * @property {Array<string>} shards - Defines which shards this seeder applies to.
   *                                  This seeder only applies to the 'accounts' shard.
   */
  shards: ['accounts'],
  
  /**
   * @async
   * @method seed
   * @description Executes the seeding logic for the 'accounts' shard.
   *              Inserts demo financial accounts and their initial balance records into the database.
   * @param {import('better-sqlite3').Database} db - The database connection instance for the current shard.
   * @param {string} shardName - The name of the shard currently being seeded.
   * @returns {Promise<void>} A Promise that resolves when the seeding is complete.
   * @throws {Error} If any database operation fails during seeding.
   */
  async seed(db, shardName) {
    console.log(`Seeding demo accounts for shard: ${shardName}`);
    
    // Define an array of demo account objects.
    // Note: User IDs are hardcoded here for demo purposes. In a production system,
    // these would typically be dynamically fetched or managed.
    const demoAccounts = [
      {
        id: 'demo-account-1', // Hardcoded ID for consistency with other seeders
        user_id: 'demo-user-1', // Must match an existing user ID from 001_demo_users
        name: 'Main Checking',
        type: 'savings',
        currency: 'USD',
        initial_balance: 5000.00,
        current_balance: 5000.00
      },
      {
        id: 'demo-account-2', // Hardcoded ID for consistency
        user_id: 'demo-user-1',
        name: 'Credit Card',
        type: 'credit',
        currency: 'USD',
        initial_balance: -1200.00,
        current_balance: -1200.00
      },
      {
        id: 'demo-account-3', // Hardcoded ID for consistency
        user_id: 'demo-user-1',
        name: 'Emergency Fund',
        type: 'savings',
        currency: 'USD',
        initial_balance: 10000.00,
        current_balance: 10000.00
      },
      {
        id: 'demo-account-4', // Hardcoded ID for consistency
        user_id: 'demo-user-1',
        name: 'Cash Wallet',
        type: 'cash',
        currency: 'USD',
        initial_balance: 200.00,
        current_balance: 200.00
      }
    ];
    
    // Prepare the SQL statement for inserting accounts
    const insertAccount = db.prepare(`
      INSERT INTO accounts (id, user_id, name, type, currency, initial_balance, current_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Prepare the SQL statement for inserting account balances
    const insertBalance = db.prepare(`
      INSERT INTO account_balances (id, account_id, balance, balance_date)
      VALUES (?, ?, ?, DATE('now'))
    `);
    
    for (const account of demoAccounts) {
      try {
        // Insert the account record
        insertAccount.run(
          account.id,
          account.user_id,
          account.name,
          account.type,
          account.currency,
          account.initial_balance,
          account.current_balance
        );
        
        // Insert an initial balance record for the account
        insertBalance.run(uuidv4(), account.id, account.current_balance);
        
        console.log(`Created demo account: ${account.name} (${account.type})`);
        
      } catch (error) {
        // Handle errors during account creation.
        // For idempotent seeding, you might check for unique constraint violations here.
        console.error(`Failed to create account ${account.name}:`, error);
        throw error; // Re-throw to indicate seeding failure
      }
    }
    
    console.log(`Demo accounts seeded successfully for shard: ${shardName}`);
  }
};