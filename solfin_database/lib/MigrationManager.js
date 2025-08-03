const fs = require('fs');
const path = require('path');

/**
 * Manages database migrations for sharded SQLite databases.
 * It ensures a migration tracking table exists in each shard,
 * tracks executed migrations, and runs pending migrations.
 */
class MigrationManager {
  /**
   * Creates an instance of MigrationManager.
   * @param {import('./ShardManager')} shardManager - The ShardManager instance to interact with database shards.
   */
  constructor(shardManager) {
    this.shardManager = shardManager;
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.ensureMigrationsTable();
  }

  /**
   * Ensures that the 'migrations' tracking table exists in all configured database shards.
   * This table is used to keep track of which migrations have been executed on each shard.
   */
  ensureMigrationsTable() {
    const migrationTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create migrations table in each shard
    for (const shardName of this.shardManager.shards.keys()) {
      try {
        const db = this.shardManager.getWriteConnection(shardName);
        db.exec(migrationTableSQL);
        console.log(`Migrations table ensured for shard: ${shardName}`);
      } catch (error) {
        console.error(`Failed to create migrations table for shard ${shardName}:`, error);
      }
    }
  }

  /**
   * Retrieves a list of executed migration versions for a specific shard.
   * @param {string} shardName - The name of the shard.
   * @returns {Array<string>} An array of migration versions that have been executed on the shard.
   */
  getExecutedMigrations(shardName) {
    const db = this.shardManager.getReadConnection(shardName);
    const migrations = db.prepare('SELECT version FROM migrations ORDER BY executed_at').all();
    return migrations.map(m => m.version);
  }

  /**
   * Records a successfully executed migration in the 'migrations' table for a given shard.
   * @param {string} shardName - The name of the shard where the migration was executed.
   * @param {string} version - The version identifier of the migration.
   * @param {string} name - The name of the migration file/module.
   */
  recordMigration(shardName, version, name) {
    const db = this.shardManager.getWriteConnection(shardName);
    db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(version, name);
  }

  /**
   * Retrieves a list of available migration files from the migrations directory.
   * Migration files are expected to be JavaScript files named in the format 'VERSION_NAME.js'.
   * @returns {Array<object>} An array of available migration objects, each containing version, name, and file path.
   */
  getAvailableMigrations() {
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
      return [];
    }

    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort()
      .map(file => {
        const version = file.split('_')[0];
        const name = file.replace('.js', '');
        return { version, name, file };
      });
  }

  /**
   * Runs all pending migrations for a specified shard.
   * Only migrations that have not yet been recorded as executed for the shard will be run.
   * @param {string} shardName - The name of the shard to run migrations for.
   * @returns {Promise<void>} A promise that resolves when all pending migrations for the shard have been attempted.
   * @throws {Error} If any migration fails during execution.
   */
  async runMigrations(shardName) {
    const executedMigrations = this.getExecutedMigrations(shardName);
    const availableMigrations = this.getAvailableMigrations();
    
    const pendingMigrations = availableMigrations.filter(
      migration => !executedMigrations.includes(migration.version)
    );

    console.log(`Running ${pendingMigrations.length} pending migrations for shard: ${shardName}`);

    for (const migration of pendingMigrations) {
      try {
        const migrationPath = path.join(this.migrationsPath, migration.file);
        const migrationModule = require(migrationPath);
        
        // Check if migration applies to this shard
        if (migrationModule.shards && !migrationModule.shards.includes(shardName)) {
          console.log(`Skipping migration ${migration.name} for shard ${shardName} (not applicable)`);
          continue;
        }

        console.log(`Executing migration: ${migration.name} on shard: ${shardName}`);
        
        const db = this.shardManager.getWriteConnection(shardName);
        
        // Execute migration
        if (migrationModule.up) {
          await migrationModule.up(db, shardName);
        }
        
        // Record migration
        this.recordMigration(shardName, migration.version, migration.name);
        
        console.log(`Migration completed: ${migration.name} on shard: ${shardName}`);
      } catch (error) {
        console.error(`Migration failed: ${migration.name} on shard ${shardName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Runs all pending migrations across all configured shards.
   * @returns {Promise<void>} A promise that resolves when all migrations for all shards have been attempted.
   */
  async runAllMigrations() {
    for (const shardName of this.shardManager.shards.keys()) {
      await this.runMigrations(shardName);
    }
  }

  /**
   * Rolls back the last executed migration for a specific shard.
   * This is typically used for development or recovery purposes.
   * @param {string} shardName - The name of the shard to rollback migration for.
   * @returns {Promise<void>} A promise that resolves when the last migration has been rolled back.
   * @throws {Error} If no migrations to rollback or if the rollback operation fails.
   */
  async rollbackMigration(shardName) {
    const executedMigrations = this.getExecutedMigrations(shardName);
    if (executedMigrations.length === 0) {
      console.log(`No migrations to rollback for shard: ${shardName}`);
      return;
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1];
    const availableMigrations = this.getAvailableMigrations();
    const migration = availableMigrations.find(m => m.version === lastMigration);

    if (!migration) {
      throw new Error(`Migration file not found for version: ${lastMigration}`);
    }

    try {
      const migrationPath = path.join(this.migrationsPath, migration.file);
      const migrationModule = require(migrationPath);
      
      console.log(`Rolling back migration: ${migration.name} on shard: ${shardName}`);
      
      const db = this.shardManager.getWriteConnection(shardName);
      
      // Execute rollback
      if (migrationModule.down) {
        await migrationModule.down(db, shardName);
      }
      
      // Remove migration record
      db.prepare('DELETE FROM migrations WHERE version = ?').run(lastMigration);
      
      console.log(`Migration rolled back: ${migration.name} on shard: ${shardName}`);
    } catch (error) {
      console.error(`Rollback failed: ${migration.name} on shard ${shardName}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves the current migration status for all shards.
   * @returns {object} An object where keys are shard names and values are their migration status (executed, pending, total, lastExecuted).
   */
  getMigrationStatus() {
    const status = {};
    const availableMigrations = this.getAvailableMigrations();
    
    for (const shardName of this.shardManager.shards.keys()) {
      const executedMigrations = this.getExecutedMigrations(shardName);
      const pendingMigrations = availableMigrations.filter(
        migration => !executedMigrations.includes(migration.version)
      );
      
      status[shardName] = {
        executed: executedMigrations.length,
        pending: pendingMigrations.length,
        total: availableMigrations.length,
        lastExecuted: executedMigrations[executedMigrations.length - 1] || null
      };
    }
    
    return status;
  }
}

module.exports = MigrationManager;