const fs = require('fs');
const path = require('path');

class SeederManager {
  constructor(shardManager) {
    this.shardManager = shardManager;
    this.seedersPath = path.join(__dirname, '../seeders');
    this.ensureSeedersTable();
  }

  // Ensure seeders tracking table exists in each shard
  ensureSeedersTable() {
    const seederTableSQL = `
      CREATE TABLE IF NOT EXISTS seeders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create seeders table in each shard
    for (const shardName of this.shardManager.shards.keys()) {
      try {
        const db = this.shardManager.getWriteConnection(shardName);
        db.exec(seederTableSQL);
        console.log(`Seeders table ensured for shard: ${shardName}`);
      } catch (error) {
        console.error(`Failed to create seeders table for shard ${shardName}:`, error);
      }
    }
  }

  // Get executed seeders for a shard
  getExecutedSeeders(shardName) {
    const db = this.shardManager.getReadConnection(shardName);
    const seeders = db.prepare('SELECT name FROM seeders ORDER BY executed_at').all();
    return seeders.map(s => s.name);
  }

  // Record seeder execution
  recordSeeder(shardName, name) {
    const db = this.shardManager.getWriteConnection(shardName);
    db.prepare('INSERT INTO seeders (name) VALUES (?)').run(name);
  }

  // Get available seeder files
  getAvailableSeeders() {
    if (!fs.existsSync(this.seedersPath)) {
      fs.mkdirSync(this.seedersPath, { recursive: true });
      return [];
    }

    return fs.readdirSync(this.seedersPath)
      .filter(file => file.endsWith('.js'))
      .sort()
      .map(file => {
        const name = file.replace('.js', '');
        return { name, file };
      });
  }

  // Run specific seeder for a shard
  async runSeeder(shardName, seederName) {
    const executedSeeders = this.getExecutedSeeders(shardName);
    
    if (executedSeeders.includes(seederName)) {
      console.log(`Seeder ${seederName} already executed for shard: ${shardName}`);
      return;
    }

    try {
      const seederPath = path.join(this.seedersPath, `${seederName}.js`);
      
      if (!fs.existsSync(seederPath)) {
        throw new Error(`Seeder file not found: ${seederName}.js`);
      }

      const seederModule = require(seederPath);
      
      // Check if seeder applies to this shard
      if (seederModule.shards && !seederModule.shards.includes(shardName)) {
        console.log(`Skipping seeder ${seederName} for shard ${shardName} (not applicable)`);
        return;
      }

      console.log(`Executing seeder: ${seederName} on shard: ${shardName}`);
      
      const db = this.shardManager.getWriteConnection(shardName);
      
      // Execute seeder
      if (seederModule.seed) {
        await seederModule.seed(db, shardName);
      }
      
      // Record seeder execution
      this.recordSeeder(shardName, seederName);
      
      console.log(`Seeder completed: ${seederName} on shard: ${shardName}`);
    } catch (error) {
      console.error(`Seeder failed: ${seederName} on shard ${shardName}:`, error);
      throw error;
    }
  }

  // Run all pending seeders for a specific shard
  async runSeeders(shardName) {
    const executedSeeders = this.getExecutedSeeders(shardName);
    const availableSeeders = this.getAvailableSeeders();
    
    const pendingSeeders = availableSeeders.filter(
      seeder => !executedSeeders.includes(seeder.name)
    );

    console.log(`Running ${pendingSeeders.length} pending seeders for shard: ${shardName}`);

    for (const seeder of pendingSeeders) {
      await this.runSeeder(shardName, seeder.name);
    }
  }

  // Run seeders for all shards
  async runAllSeeders() {
    for (const shardName of this.shardManager.shards.keys()) {
      await this.runSeeders(shardName);
    }
  }

  // Reset seeders for a shard (remove all seeder records)
  async resetSeeders(shardName) {
    try {
      const db = this.shardManager.getWriteConnection(shardName);
      db.prepare('DELETE FROM seeders').run();
      console.log(`Seeders reset for shard: ${shardName}`);
    } catch (error) {
      console.error(`Failed to reset seeders for shard ${shardName}:`, error);
      throw error;
    }
  }

  // Reset and re-run all seeders for a shard
  async refreshSeeders(shardName) {
    await this.resetSeeders(shardName);
    await this.runSeeders(shardName);
  }

  // Get seeder status
  getSeederStatus() {
    const status = {};
    const availableSeeders = this.getAvailableSeeders();
    
    for (const shardName of this.shardManager.shards.keys()) {
      const executedSeeders = this.getExecutedSeeders(shardName);
      const pendingSeeders = availableSeeders.filter(
        seeder => !executedSeeders.includes(seeder.name)
      );
      
      status[shardName] = {
        executed: executedSeeders.length,
        pending: pendingSeeders.length,
        total: availableSeeders.length,
        executedList: executedSeeders,
        pendingList: pendingSeeders.map(s => s.name)
      };
    }
    
    return status;
  }
}

module.exports = SeederManager;