// Seeder: Create demo accounts for demo users
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // This seeder only applies to the accounts shard
  shards: ['accounts'],
  
  async seed(db, shardName) {
    console.log(`Seeding demo accounts for shard: ${shardName}`);
    
    // Note: In a real application, you'd need to coordinate user IDs across shards
    // For demo purposes, we'll use hardcoded user IDs that should match the users seeder
    const demoAccounts = [
      {
        id: uuidv4(),
        user_id: 'demo-user-1', // This should match actual user ID from users shard
        name: 'Main Checking',
        type: 'savings',
        currency: 'USD',
        initial_balance: 5000.00,
        current_balance: 5000.00
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        name: 'Credit Card',
        type: 'credit',
        currency: 'USD',
        initial_balance: -1200.00,
        current_balance: -1200.00
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        name: 'Emergency Fund',
        type: 'savings',
        currency: 'USD',
        initial_balance: 10000.00,
        current_balance: 10000.00
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        name: 'Cash Wallet',
        type: 'cash',
        currency: 'USD',
        initial_balance: 200.00,
        current_balance: 200.00
      }
    ];
    
    // Insert demo accounts
    const insertAccount = db.prepare(`
      INSERT INTO accounts (id, user_id, name, type, currency, initial_balance, current_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertBalance = db.prepare(`
      INSERT INTO account_balances (id, account_id, balance, balance_date)
      VALUES (?, ?, ?, DATE('now'))
    `);
    
    for (const account of demoAccounts) {
      try {
        insertAccount.run(
          account.id,
          account.user_id,
          account.name,
          account.type,
          account.currency,
          account.initial_balance,
          account.current_balance
        );
        
        // Create initial balance record
        insertBalance.run(uuidv4(), account.id, account.current_balance);
        
        console.log(`Created demo account: ${account.name} (${account.type})`);
        
      } catch (error) {
        console.error(`Failed to create account ${account.name}:`, error);
      }
    }
    
    console.log(`Demo accounts seeded successfully for shard: ${shardName}`);
  }
};