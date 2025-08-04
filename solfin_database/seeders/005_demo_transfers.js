/**
 * @module 005_demo_transfers
 * @description Seeder to populate the 'transfers' shard with demo inter-account transfer data.
 *              This seeder creates sample transfer records between various demo accounts.
 *              It assumes that demo users and accounts have already been created
 *              by previous seeders (`001_demo_users`, `002_demo_accounts`).
 */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  /**
   * @property {Array<string>} shards - Defines which shards this seeder applies to.
   *                                  This seeder only applies to the 'transfers' shard.
   */
  shards: ['transfers'],
  
  /**
   * @async
   * @method seed
   * @description Executes the seeding logic for the 'transfers' shard.
   *              Inserts demo transfer records into the database.
   * @param {import('better-sqlite3').Database} db - The database connection instance for the current shard.
   * @param {string} shardName - The name of the shard currently being seeded.
   * @returns {Promise<void>} A Promise that resolves when the seeding is complete.
   * @throws {Error} If any database operation fails during seeding.
   */
  async seed(db, shardName) {
    console.log(`Seeding demo transfers for shard: ${shardName}`);
    
    // Define an array of demo transfer objects.
    // Account and user IDs are hardcoded for demo purposes.
    const demoTransfers = [
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        from_account_id: 'demo-account-1', // Main Checking
        to_account_id: 'demo-account-3', // Emergency Fund
        amount: 500.00,
        currency: 'USD',
        description: 'Monthly Emergency Fund Contribution',
        transfer_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        status: 'completed',
        transfer_type: 'internal',
        reference_number: 'TXN-001'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        from_account_id: 'demo-account-1', // Main Checking
        to_account_id: 'demo-account-4', // Cash Wallet
        amount: 100.00,
        currency: 'USD',
        description: 'Cash Withdrawal for Weekend',
        transfer_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        status: 'completed',
        transfer_type: 'internal',
        reference_number: 'TXN-002'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        from_account_id: 'demo-account-2', // Credit Card
        to_account_id: 'demo-account-1', // Main Checking
        amount: 200.00,
        currency: 'USD',
        description: 'Credit Card Payment',
        transfer_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        status: 'completed',
        transfer_type: 'internal',
        reference_number: 'TXN-003'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        from_account_id: 'demo-account-1', // Main Checking
        to_account_id: 'demo-account-3', // Emergency Fund
        amount: 300.00,
        currency: 'USD',
        description: 'Additional Emergency Savings',
        transfer_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        status: 'completed',
        transfer_type: 'internal',
        reference_number: 'TXN-004'
      },
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        from_account_id: 'demo-account-1', // Main Checking
        to_account_id: 'external-account-1', // Example of an external account transfer
        amount: 150.00,
        currency: 'USD',
        description: 'Transfer to Friend',
        transfer_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
        status: 'completed',
        transfer_type: 'external',
        reference_number: 'TXN-005',
        external_reference: 'EXT-REF-001',
        processing_fee: 2.50
      }
    ];
    
    // Prepare the SQL statement for inserting transfers
    const insertTransfer = db.prepare(`
      INSERT INTO transfers (
        id, user_id, from_account_id, to_account_id, amount, currency, description,
        transfer_date, status, transfer_type, reference_number, external_reference, processing_fee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const transfer of demoTransfers) {
      try {
        // Insert the transfer record
        insertTransfer.run(
          transfer.id,
          transfer.user_id,
          transfer.from_account_id,
          transfer.to_account_id,
          transfer.amount,
          transfer.currency,
          transfer.description,
          transfer.transfer_date,
          transfer.status,
          transfer.transfer_type,
          transfer.reference_number,
          transfer.external_reference || null, // Use null if not provided
          transfer.processing_fee || 0       // Use 0 if not provided
        );
        
        console.log(`Created demo transfer: ${transfer.description} ($${transfer.amount})`);
        
      } catch (error) {
        // Handle errors during transfer creation.
        console.error(`Failed to create transfer ${transfer.description}:`, error);
        throw error; // Re-throw to indicate seeding failure
      }
    }
    
    console.log(`Demo transfers seeded successfully for shard: ${shardName}`);
  }
};