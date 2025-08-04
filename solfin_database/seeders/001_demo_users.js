/**
 * @module 001_demo_users
 * @description Seeder to populate the 'users' shard with demo user data and associated preferences.
 *              This seeder creates sample user accounts which can be used for testing and demonstration.
 */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  /**
   * @property {Array<string>} shards - Defines which shards this seeder applies to.
   *                                  This seeder only applies to the 'users' shard.
   */
  shards: ['users'],
  
  /**
   * @async
   * @method seed
   * @description Executes the seeding logic for the 'users' shard.
   *              Inserts demo users and their preferences into the database.
   * @param {import('better-sqlite3').Database} db - The database connection instance for the current shard.
   * @param {string} shardName - The name of the shard currently being seeded.
   * @returns {Promise<void>} A Promise that resolves when the seeding is complete.
   * @throws {Error} If any database operation fails during seeding.
   */
  async seed(db, shardName) {
    console.log(`Seeding demo users for shard: ${shardName}`);
    
    const demoUsers = [
      {
        id: 'demo-user-1', // Hardcoded ID for consistency with other seeders
        email: 'demo@solfin.com',
        // In a real application, ensure proper bcrypt hashing with a strong salt.
        // This hash is for demo purposes only and should NOT be used in production.
        password_hash: '$2b$10$example.hash.for.demo.user',
        first_name: 'Demo',
        last_name: 'User'
      },
      {
        id: 'john-doe-1', // Hardcoded ID for consistency
        email: 'john.doe@example.com',
        password_hash: '$2b$10$example.hash.for.john.doe',
        first_name: 'John',
        last_name: 'Doe'
      },
      {
        id: 'jane-smith-1', // Hardcoded ID for consistency
        email: 'jane.smith@example.com',
        password_hash: '$2b$10$example.hash.for.jane.smith',
        first_name: 'Jane',
        last_name: 'Smith'
      }
    ];
    
    // Prepare the SQL statement for inserting users
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    // Prepare the SQL statement for inserting user preferences
    const insertPreference = db.prepare(`
      INSERT INTO user_preferences (id, user_id, key, value)
      VALUES (?, ?, ?, ?)
    `);

    for (const user of demoUsers) {
      try {
        // Run the insert operation for the user
        insertUser.run(user.id, user.email, user.password_hash, user.first_name, user.last_name);
        console.log(`Created demo user: ${user.email}`);
        
        // Define and insert some default user preferences
        const preferences = [
          { key: 'currency', value: 'USD' },
          { key: 'theme', value: 'light' },
          { key: 'notifications', value: 'true' },
          { key: 'language', value: 'en' }
        ];
        
        for (const pref of preferences) {
          insertPreference.run(uuidv4(), user.id, pref.key, pref.value);
        }
        console.log(`Added preferences for user: ${user.email}`);
        
      } catch (error) {
        // Handle unique constraint errors gracefully for idempotent seeding
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          console.log(`User ${user.email} already exists, skipping insertion.`);
        } else {
          // Re-throw other errors to indicate a failure in seeding
          console.error(`Failed to seed user ${user.email}:`, error);
          throw error;
        }
      }
    }
    
    console.log(`Demo users seeded successfully for shard: ${shardName}`);
  }
};