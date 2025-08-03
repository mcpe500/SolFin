const fs = require('fs');
const path = require('path');

/**
 * Manages database seeding operations for sharded SQLite databases.
 * It ensures a seeder tracking table exists in each shard,
 * tracks executed seeders, and runs data population scripts.
 */
class SeederManager {
  /**
   * Creates an instance of SeederManager.
   * @param {import('./ShardManager')} shardManager - The ShardManager instance to interact with database shards.
   */
  constructor(shardManager) {
    this.shardManager = shardManager;
    this.seedersPath = path.join(__dirname, '../seeders');
    this.ensureSeedersTable();
  }

  /**
   * Ensures that the 'seeders' tracking table exists in all configured database shards.
   * This table is used to keep track of which seeders have been executed on each shard.
   */
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

  /**
   * Retrieves a list of executed seeder names for a specific shard.
   * @param {string} shardName - The name of the shard.
   * @returns {Array<string>} An array of seeder names that have been executed on the shard.
   */
  getExecutedSeeders(shardName) {
    const db = this.shardManager.getReadConnection(shardName);
    const seeders = db.prepare('SELECT name FROM seeders ORDER BY executed_at').all();
    return seeders.map(s => s.name);
  }

  /**
   * Records a successfully executed seeder in the 'seeders' table for a given shard.
   * @param {string} shardName - The name of the shard where the seeder was executed.
   * @param {string} name - The name of the seeder file/module.
   */
  recordSeeder(shardName, name) {
    const db = this.shardManager.getWriteConnection(shardName);
    db.prepare('INSERT INTO seeders (name) VALUES (?)').run(name);
  }

  /**
   * Retrieves a list of available seeder files from the seeders directory.
   * Seeder files are expected to be JavaScript files.
   * @returns {Array<object>} An array of available seeder objects, each containing name and file path.
   */
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

  /**
   * Runs a specific seeder for a given shard.
   * The seeder will only run if it hasn't been executed before on that shard.
   * @param {string} shardName - The name of the shard to run the seeder on.
   * @param {string} seederName - The name of the seeder to run.
   * @returns {Promise<void>} A promise that resolves when the seeder has been attempted.
   * @throws {Error} If the seeder file is not found or if the seeder fails during execution.
   */
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

  /**
   * Runs all pending seeders for a specific shard.
   * Only seeders that have not yet been recorded as executed for the shard will be run.
   * @param {string} shardName - The name of the shard to run seeders for.
   * @returns {Promise<void>} A promise that resolves when all pending seeders for the shard have been attempted.
   */
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

  /**
   * Runs all pending seeders across all configured shards.
   * @returns {Promise<void>} A promise that resolves when all seeders for all shards have been attempted.
   */
  async runAllSeeders() {
    for (const shardName of this.shardManager.shards.keys()) {
      await this.runSeeders(shardName);
    }
  }

  /**
   * Resets the seeders for a specific shard by removing all seeder records from its tracking table.
   * This effectively marks all seeders as unexecuted for that shard.
   * @param {string} shardName - The name of the shard to reset seeders for.
   * @returns {Promise<void>} A promise that resolves when the seeders have been reset.
   * @throws {Error} If the reset operation fails.
   */
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

  /**
   * Resets and then re-runs all seeders for a specific shard.
   * @param {string} shardName - The name of the shard to refresh seeders for.
   * @returns {Promise<void>} A promise that resolves when the seeders have been refreshed.
   */
  async refreshSeeders(shardName) {
    await this.resetSeeders(shardName);
    await this.runSeeders(shardName);
  }

  /**
   * Retrieves the current seeder status for all shards.
   * @returns {object} An object where keys are shard names and values are their seeder status (executed, pending, total, executedList, pendingList).
   */
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