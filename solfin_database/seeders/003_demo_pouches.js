// Seeder: Create demo pouches and goals
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // This seeder only applies to the pouches shard
  shards: ['pouches'],
  
  async seed(db, shardName) {
    console.log(`Seeding demo pouches and goals for shard: ${shardName}`);
    
    const demoPouches = [
      {
        id: uuidv4(),
        user_id: 'demo-user-1',
        name: 'Groceries',
        description: 'Monthly grocery budget',
        type: 'private',
        budget_amount: 800.00,
        budget_period: 'monthly',
        color: '#4CAF50',
        icon: 'basket'
      },
      {
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
        user_id: 'demo-user-1',
        name: 'Family Vacation',
        description: 'Shared vacation fund',
        type: 'shared',
        budget_amount: 5000.00,
        budget_period: 'yearly',
        color: '#E91E63',
        icon: 'airplane'
      }
    ];
    
    // Insert demo pouches
    const insertPouch = db.prepare(`
      INSERT INTO pouches (id, user_id, name, description, type, budget_amount, budget_period, color, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertGoal = db.prepare(`
      INSERT INTO goals (id, user_id, pouch_id, title, description, target_amount, current_amount, target_date, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const pouch of demoPouches) {
      try {
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
        
        // Create some goals for certain pouches
        if (pouch.name === 'Family Vacation') {
          insertGoal.run(
            uuidv4(),
            pouch.user_id,
            pouch.id,
            'Summer 2025 Trip',
            'Family vacation to Europe',
            5000.00,
            1200.00,
            '2025-07-01',
            1
          );
          console.log(`Created goal for pouch: ${pouch.name}`);
        }
        
        if (pouch.name === 'Entertainment') {
          insertGoal.run(
            uuidv4(),
            pouch.user_id,
            pouch.id,
            'Gaming Setup',
            'New gaming console and accessories',
            800.00,
            250.00,
            '2025-03-01',
            2
          );
          console.log(`Created goal for pouch: ${pouch.name}`);
        }
        
      } catch (error) {
        console.error(`Failed to create pouch ${pouch.name}:`, error);
      }
    }
    
    console.log(`Demo pouches and goals seeded successfully for shard: ${shardName}`);
  }
};