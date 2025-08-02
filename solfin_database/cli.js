#!/usr/bin/env node

const DatabaseService = require('./lib/DatabaseService');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
SolFin Database CLI

Usage:
  node cli.js <command> [options]

Commands:
  migrate [shard]           - Run migrations for all shards or specific shard
  migrate:rollback <shard>  - Rollback last migration for specific shard
  migrate:status            - Show migration status for all shards
  
  seed [shard] [seeder]     - Run seeders for all shards, specific shard, or specific seeder
  seed:reset <shard>        - Reset seeders for specific shard
  seed:refresh <shard>      - Reset and re-run seeders for specific shard
  seed:status               - Show seeder status for all shards
  
  health                    - Check health of all shards
  setup                     - Run migrations and seeders (development setup)

Examples:
  node cli.js migrate                    # Run all migrations
  node cli.js migrate users              # Run migrations for users shard
  node cli.js seed                       # Run all seeders
  node cli.js seed accounts              # Run seeders for accounts shard
  node cli.js seed users 001_demo_users  # Run specific seeder
  node cli.js setup                      # Full development setup
  `);
  process.exit(0);
}

async function main() {
  const dbService = new DatabaseService();
  const command = args[0];
  
  try {
    switch (command) {
      case 'migrate':
        const migrateShard = args[1];
        console.log(`Running migrations${migrateShard ? ` for shard: ${migrateShard}` : ' for all shards'}...`);
        await dbService.runMigrations(migrateShard);
        console.log('Migrations completed successfully!');
        break;
        
      case 'migrate:rollback':
        const rollbackShard = args[1];
        if (!rollbackShard) {
          console.error('Error: Shard name is required for rollback');
          process.exit(1);
        }
        console.log(`Rolling back migration for shard: ${rollbackShard}...`);
        await dbService.rollbackMigration(rollbackShard);
        console.log('Migration rolled back successfully!');
        break;
        
      case 'migrate:status':
        console.log('Migration Status:');
        const migrationStatus = dbService.getMigrationStatus();
        console.table(migrationStatus);
        break;
        
      case 'seed':
        const seedShard = args[1];
        const seederName = args[2];
        
        if (seederName && seedShard) {
          console.log(`Running seeder: ${seederName} for shard: ${seedShard}...`);
          await dbService.runSeeder(seedShard, seederName);
        } else {
          console.log(`Running seeders${seedShard ? ` for shard: ${seedShard}` : ' for all shards'}...`);
          await dbService.runSeeders(seedShard);
        }
        console.log('Seeders completed successfully!');
        break;
        
      case 'seed:reset':
        const resetShard = args[1];
        if (!resetShard) {
          console.error('Error: Shard name is required for reset');
          process.exit(1);
        }
        console.log(`Resetting seeders for shard: ${resetShard}...`);
        await dbService.resetSeeders(resetShard);
        console.log('Seeders reset successfully!');
        break;
        
      case 'seed:refresh':
        const refreshShard = args[1];
        if (!refreshShard) {
          console.error('Error: Shard name is required for refresh');
          process.exit(1);
        }
        console.log(`Refreshing seeders for shard: ${refreshShard}...`);
        await dbService.refreshSeeders(refreshShard);
        console.log('Seeders refreshed successfully!');
        break;
        
      case 'seed:status':
        console.log('Seeder Status:');
        const seederStatus = dbService.getSeederStatus();
        console.table(seederStatus);
        break;
        
      case 'health':
        console.log('Checking shard health...');
        const health = await dbService.healthCheck();
        console.table(health);
        break;
        
      case 'setup':
        console.log('Setting up database for development...');
        console.log('Running migrations...');
        await dbService.runMigrations();
        console.log('Running seeders...');
        await dbService.runSeeders();
        console.log('Database setup completed successfully!');
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "node cli.js" without arguments to see available commands.');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    dbService.close();
  }
}

main();