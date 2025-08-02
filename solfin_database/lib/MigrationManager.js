const fs = require('fs');
const path = require('path');

class MigrationManager {
  constructor(shardManager) {
    this.shardManager = shardManager;
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.ensureMigrationsTable();
  }

  // Ensure migrations tracking table exists in each shard
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

  // Get executed migrations for a shard
  getExecutedMigrations(shardName) {
    const db = this.shardManager.getReadConnection(shardName);
    const migrations = db.prepare('SELECT version FROM migrations ORDER BY executed_at').all();
    return migrations.map(m => m.version);
  }

  // Record migration execution
  recordMigration(shardName, version, name) {
    const db = this.shardManager.getWriteConnection(shardName);
    db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(version, name);
  }

  // Get available migration files
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

  // Run pending migrations for a specific shard
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

  // Run migrations for all shards
  async runAllMigrations() {
    for (const shardName of this.shardManager.shards.keys()) {
      await this.runMigrations(shardName);
    }
  }

  // Rollback last migration for a shard
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

  // Get migration status
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