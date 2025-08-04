#!/usr/bin/env node

const DatabaseService = require('./lib/DatabaseService');
const args = process.argv.slice(2);

/**
 * Displays the help message for the CLI.
 */
const displayHelp = () => {
  console.log(`
SolFin Database CLI - Command Line Interface for managing SolFin's sharded database.

Usage:
  node cli.js <command> [options]

Commands:
  migrate [shard]           - Run pending migrations for all shards or a specific shard.
  migrate:rollback <shard>  - Rollback the last executed migration for a specific shard.
  migrate:status            - Display the migration status for all shards.
  
  seed [shard] [seeder]     - Run seeders for all shards, a specific shard, or a specific seeder file.
  seed:reset <shard>        - Reset (delete all records of) executed seeders for a specific shard.
  seed:refresh <shard>      - Reset and then re-run all seeders for a specific shard.
  seed:status               - Display the seeder execution status for all shards.
  
  health                    - Perform a health check on all database shards.
  setup                     - A convenience command to run all pending migrations and then all seeders (ideal for development setup).

Examples:
  node cli.js migrate                    # Run all pending migrations across all configured shards.
  node cli.js migrate users              # Run pending migrations specifically for the 'users' shard.
  node cli.js seed                       # Run all pending seeders across all configured shards.
  node cli.js seed accounts              # Run seeders for accounts shard.
  node cli.js seed users 001_demo_users  # Run a specific seeder '001_demo_users' for the 'users' shard.
  node cli.js setup                      # Perform a full development database setup (migrate then seed all).
`);
};

if (args.length === 0) {
  displayHelp();
  process.exit(0);
}

/**
 * Main function to parse commands and execute corresponding DatabaseService methods.
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main() {
  const dbService = new DatabaseService();
  const command = args[0]; // The main command (e.g., 'migrate', 'seed', 'health')
  const shardArg = args[1]; // Optional shard name
  const seederArg = args[2]; // Optional seeder name

  try {
    switch (command) {
      case 'migrate':
        // Runs database migrations for all shards or a specified shard.
        console.log(`Running migrations${shardArg ? ` for shard: ${shardArg}` : ' for all shards'}...`);
        await dbService.runMigrations(shardArg);
        console.log('Migrations completed successfully!');
        break;

      case 'migrate:rollback':
        // Rolls back the last executed migration for a specific shard.
        if (!shardArg) {
          console.error('Error: Shard name is required for rollback. Usage: node cli.js migrate:rollback <shard_name>');
          process.exit(1);
        }
        console.log(`Rolling back migration for shard: ${shardArg}...`);
        await dbService.rollbackMigration(shardArg);
        console.log('Migration rolled back successfully!');
        break;

      case 'migrate:status':
        // Displays the current migration status for all configured shards.
        console.log('Migration Status:');
        const migrationStatus = dbService.getMigrationStatus();
        console.table(migrationStatus);
        break;

      case 'seed':
        // Runs seeders for all shards, a specific shard, or a specific seeder file within a shard.
        if (seederArg && shardArg) {
          console.log(`Running specific seeder: ${seederArg} for shard: ${shardArg}...`);
          await dbService.runSeeder(shardArg, seederArg);
        } else {
          console.log(`Running seeders${shardArg ? ` for shard: ${shardArg}` : ' for all shards'}...`);
          await dbService.runSeeders(shardArg);
        }
        console.log('Seeders completed successfully!');
        break;

      case 'seed:reset':
        // Resets (clears records of) executed seeders for a specific shard.
        if (!shardArg) {
          console.error('Error: Shard name is required for reset. Usage: node cli.js seed:reset <shard_name>');
          process.exit(1);
        }
        console.log(`Resetting seeders for shard: ${shardArg}...`);
        await dbService.resetSeeders(shardArg);
        console.log('Seeders reset successfully!');
        break;

      case 'seed:refresh':
        // Resets and then re-runs all seeders for a specific shard.
        if (!shardArg) {
          console.error('Error: Shard name is required for refresh. Usage: node cli.js seed:refresh <shard_name>');
          process.exit(1);
        }
        console.log(`Refreshing seeders for shard: ${shardArg}...`);
        await dbService.refreshSeeders(shardArg);
        console.log('Seeders refreshed successfully!');
        break;

      case 'seed:status':
        // Displays the current seeder execution status for all configured shards.
        console.log('Seeder Status:');
        const seederStatus = dbService.getSeederStatus();
        console.table(seederStatus);
        break;

      case 'health':
        // Performs a health check on all database shards.
        console.log('Checking shard health...');
        const health = await dbService.healthCheck();
        console.table(health);
        break;

      case 'setup':
        // Convenience command to set up the database for development (runs migrations then seeders).
        console.log('Setting up database for development...');
        console.log('Running migrations...');
        await dbService.runMigrations();
        console.log('Running seeders...');
        await dbService.runSeeders();
        console.log('Database setup completed successfully!');
        break;

      default:
        // Handles unknown commands and displays help.
        console.error(`Unknown command: "${command}"`);
        displayHelp(); // Show help for unknown commands
        process.exit(1);
    }

  } catch (error) {
    console.error('An error occurred during CLI execution:', error.message);
    process.exit(1);
  } finally {
    // Ensures database connections are closed after command execution.
    dbService.close();
  }
}

// Execute the main function if the script is run directly
if (require.main === module) {
  main();
}