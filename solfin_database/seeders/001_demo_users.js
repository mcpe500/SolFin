// Seeder: Create demo users and related data
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // This seeder only applies to the users shard
  shards: ['users'],
  
  async seed(db, shardName) {
    console.log(`Seeding demo users for shard: ${shardName}`);
    
    const demoUsers = [
      {
        id: uuidv4(),
        email: 'demo@solfin.com',
        password_hash: '$2b$10$example.hash.for.demo.user', // In real app, use proper bcrypt
        first_name: 'Demo',
        last_name: 'User'
      },
      {
        id: uuidv4(),
        email: 'john.doe@example.com',
        password_hash: '$2b$10$example.hash.for.john.doe',
        first_name: 'John',
        last_name: 'Doe'
      },
      {
        id: uuidv4(),
        email: 'jane.smith@example.com',
        password_hash: '$2b$10$example.hash.for.jane.smith',
        first_name: 'Jane',
        last_name: 'Smith'
      }
    ];
    
    // Insert demo users
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const user of demoUsers) {
      try {
        insertUser.run(user.id, user.email, user.password_hash, user.first_name, user.last_name);
        console.log(`Created demo user: ${user.email}`);
        
        // Add some user preferences
        const insertPreference = db.prepare(`
          INSERT INTO user_preferences (id, user_id, key, value)
          VALUES (?, ?, ?, ?)
        `);
        
        const preferences = [
          { key: 'currency', value: 'USD' },
          { key: 'theme', value: 'light' },
          { key: 'notifications', value: 'true' },
          { key: 'language', value: 'en' }
        ];
        
        for (const pref of preferences) {
          insertPreference.run(uuidv4(), user.id, pref.key, pref.value);
        }
        
      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          console.log(`User ${user.email} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    console.log(`Demo users seeded successfully for shard: ${shardName}`);
  }
};