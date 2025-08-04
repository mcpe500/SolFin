/**
 * @module 003_demo_pouches
 * @description Seeder to populate the 'pouches' shard with demo financial pouches (budget buckets) and associated goals.
 *              This seeder assumes that demo users (e.g., 'demo-user-1') have already been created
 *              by the `001_demo_users` seeder.
 */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  /**
   * @property {Array<string>} shards - Defines which shards this seeder applies to.
   *                                  This seeder only applies to the 'pouches' shard.
   */
  shards: ['pouches'],
  
  /**
   * @async
   * @method seed
   * @description Executes the seeding logic for the 'pouches' shard.
   *              Inserts demo pouches and, for some pouches, creates associated goals.
   * @param {import('better-sqlite3').Database} db - The database connection instance for the current shard.
   * @param {string} shardName - The name of the shard currently being seeded.
   * @returns {Promise<void>} A Promise that resolves when the seeding is complete.
   * @throws {Error} If any database operation fails during seeding.
   */
  async seed(db, shardName) {
    console.log(`Seeding demo pouches and goals for shard: ${shardName}`);
    
    // Define an array of demo pouch objects.
    // User IDs are hardcoded for demo purposes.
    const demoPouches = [
      {
        id: 'demo-pouch-1', // Hardcoded ID for consistency with other seeders
        user_id: 'demo-user-1',
        name: 'Groceries',
        description: 'Monthly grocery budget',
        type: 'private',
        budget_amount: 800.00,
        budget_period: 'monthly',
        color: '#4CAF50', // Example color
        icon: 'basket'   // Example icon
      },
      {
        id: 'demo-pouch-2', // Hardcoded ID for consistency
        user_id: 'demo-user-1',
        name: 'Entertainment',
        description: 'Movies, games, and fun activities',
        type: 'private',
        budget_amount: 300.00,
        budget_period: 'monthly',
        color: '#FF9800',
        icon: 'game-controller'
      },
      {
        id: 'demo-pouch-3', // Hardcoded ID for consistency
        user_id: 'demo-user-1',
        name: 'Transportation',
        description: 'Gas, public transport, car maintenance',
        type: 'private',
        budget_amount: 400.00,
        budget_period: 'monthly',
        color: '#2196F3',
        icon: 'car'
      },
      {
        id: 'demo-pouch-4', // Hardcoded ID for consistency
        user_id: 'demo-user-1',
        name: 'Family Vacation',
        description: 'Shared vacation fund',
        type: 'shared', // Example of a shared pouch
        budget_amount: 5000.00,
        budget_period: 'yearly',
        color: '#E91E63',
        icon: 'airplane'
      }
    ];
    
    // Prepare the SQL statement for inserting pouches
    const insertPouch = db.prepare(`
      INSERT INTO pouches (id, user_id, name, description, type, budget_amount, budget_period, color, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Prepare the SQL statement for inserting goals
    const insertGoal = db.prepare(`
      INSERT INTO goals (id, user_id, pouch_id, title, description, target_amount, current_amount, target_date, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const pouch of demoPouches) {
      try {
        // Insert the pouch record
        insertPouch.run(
          pouch.id,
          pouch.user_id,
          pouch.name,
          pouch.description,
          pouch.type,
          pouch.budget_amount,
          pouch.budget_period,
          pouch.color,
          pouch.icon
        );
        
        console.log(`Created demo pouch: ${pouch.name}`);
        
        // Create some goals for specific pouches as examples
        if (pouch.name === 'Family Vacation') {
          insertGoal.run(
            uuidv4(), // Generate a new UUID for the goal
            pouch.user_id,
            pouch.id,
            'Summer 2025 Trip',
            'Family vacation to Europe',
            5000.00,
            1200.00, // Current amount saved
            '2025-07-01',
            1 // Priority
          );
          console.log(`Created goal 'Summer 2025 Trip' for pouch: ${pouch.name}`);
        }
        
        if (pouch.name === 'Entertainment') {
          insertGoal.run(
            uuidv4(), // Generate a new UUID for the goal
            pouch.user_id,
            pouch.id,
            'Gaming Setup',
            'New gaming console and accessories',
            800.00,
            250.00, // Current amount saved
            '2025-03-01',
            2 // Priority
          );
          console.log(`Created goal 'Gaming Setup' for pouch: ${pouch.name}`);
        }
        
      } catch (error) {
        // Handle errors during pouch creation.
        console.error(`Failed to create pouch ${pouch.name}:`, error);
        throw error; // Re-throw to indicate seeding failure
      }
    }
    
    console.log(`Demo pouches and goals seeded successfully for shard: ${shardName}`);
  }
};