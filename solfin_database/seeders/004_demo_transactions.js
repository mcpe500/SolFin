// Seeder: Create demo transactions for demo accounts
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // This seeder only applies to the transactions shard
  shards: ['transactions'],
  
  async seed(db, shardName) {
    console.log(`Seeding demo transactions for shard: ${shardName}`);
    
    // Demo transactions for the demo user
    const demoTransactions = [
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        account_id: 'demo-account-1', // Main Checking
        amount: -45.67,
        currency: 'USD',
        description: 'Grocery Store Purchase',
        category: 'Groceries',
        tags: 'food,weekly',
        transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        merchant_name: 'SuperMart',
        merchant_category: 'Grocery',
        payment_method: 'debit_card'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        account_id: 'demo-account-1',
        amount: -12.50,
        currency: 'USD',
        description: 'Coffee Shop',
        category: 'Entertainment',
        tags: 'coffee,morning',
        transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        merchant_name: 'Brew & Bean',
        merchant_category: 'Restaurant',
        payment_method: 'credit_card'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        account_id: 'demo-account-1',
        amount: -85.00,
        currency: 'USD',
        description: 'Gas Station Fill-up',
        category: 'Transportation',
        tags: 'gas,car',
        transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        merchant_name: 'QuickFuel',
        merchant_category: 'Gas Station',
        payment_method: 'debit_card'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        account_id: 'demo-account-1',
        amount: 2500.00,
        currency: 'USD',
        description: 'Monthly Salary',
        category: 'Income',
        tags: 'salary,monthly',
        transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        merchant_name: 'TechCorp Inc',
        merchant_category: 'Employer',
        payment_method: 'direct_deposit'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        account_id: 'demo-account-2', // Credit Card
        amount: -156.78,
        currency: 'USD',
        description: 'Online Shopping',
        category: 'Shopping',
        tags: 'online,electronics',
        transaction_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        merchant_name: 'TechStore Online',
        merchant_category: 'Electronics',
        payment_method: 'credit_card'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        account_id: 'demo-account-1',
        amount: -25.00,
        currency: 'USD',
        description: 'Movie Theater',
        category: 'Entertainment',
        tags: 'movies,weekend',
        transaction_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
        merchant_name: 'Cinema Plus',
        merchant_category: 'Entertainment',
        payment_method: 'debit_card'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        account_id: 'demo-account-1',
        amount: -67.89,
        currency: 'USD',
        description: 'Restaurant Dinner',
        category: 'Food & Dining',
        tags: 'dinner,restaurant',
        transaction_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        merchant_name: 'Italian Bistro',
        merchant_category: 'Restaurant',
        payment_method: 'credit_card'
      }
    ];
    
    // Insert demo transactions
    const insertTransaction = db.prepare(`
      INSERT INTO transactions (
        id, user_id, account_id, amount, currency, description, category, tags,
        transaction_date, merchant_name, merchant_category, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertSplit = db.prepare(`
      INSERT INTO transaction_splits (id, transaction_id, pouch_id, amount, is_primary)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    // Demo pouch IDs (these should match the pouches seeder)
    const pouchMapping = {
      'Groceries': 'demo-pouch-1',
      'Entertainment': 'demo-pouch-2',
      'Transportation': 'demo-pouch-3',
      'Food & Dining': 'demo-pouch-1', // Use groceries pouch
      'Shopping': 'demo-pouch-2', // Use entertainment pouch
      'Income': null // No pouch for income
    };
    
    for (const transaction of demoTransactions) {
      try {
        insertTransaction.run(
          transaction.id,
          transaction.user_id,
          transaction.account_id,
          transaction.amount,
          transaction.currency,
          transaction.description,
          transaction.category,
          transaction.tags,
          transaction.transaction_date,
          transaction.merchant_name,
          transaction.merchant_category,
          transaction.payment_method
        );
        
        console.log(`Created demo transaction: ${transaction.description}`);
        
        // Create transaction split if applicable
        const pouchId = pouchMapping[transaction.category];
        if (pouchId && transaction.amount < 0) { // Only for expenses
          insertSplit.run(
            uuidv4(),
            transaction.id,
            pouchId,
            Math.abs(transaction.amount), // Store as positive amount
            1 // is_primary
          );
          console.log(`Created transaction split for pouch: ${pouchId}`);
        }
        
      } catch (error) {
        console.error(`Failed to create transaction ${transaction.description}:`, error);
      }
    }
    
    console.log(`Demo transactions seeded successfully for shard: ${shardName}`);
  }
};