const axios = require('axios');

/**
 * @class DatabaseRepository
 * @description Repository class for interacting with the external `solfin_database` service.
 * It provides methods for generic CRUD operations and specific data access patterns
 * by making HTTP requests to the database service API.
 */
class DatabaseRepository {
  /**
   * Creates an instance of DatabaseRepository.
   * Initializes an Axios client with the base URL for the database service.
   */
  constructor() {
    /**
     * Base URL for the database service.
     * @type {string}
     */
    this.baseURL = process.env.DATABASE_SERVICE_URL || 'http://localhost:3002';
    /**
     * Axios client instance configured for the database service.
     * @type {import('axios').AxiosInstance}
     */
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Performs a health check on the database service.
   * @returns {Promise<object>} The health status data from the service.
   * @throws {Error} If the health check fails.
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Database service health check failed: ${error.message}`);
    }
  }

  /**
   * Creates a new record in the specified table.
   * @param {string} table - The name of the table.
   * @param {object} data - The data to create.
   * @returns {Promise<object>} The created record's data.
   * @throws {Error} If the creation fails.
   */
  async create(table, data) {
    try {
      const response = await this.client.post(`/${table}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create record in ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Reads a record from the specified table by its ID.
   * @param {string} table - The name of the table.
   * @param {string} id - The ID of the record to read.
   * @returns {Promise<object|null>} The record data, or null if not found.
   * @throws {Error} If the read operation fails for reasons other than 404.
   */
  async read(table, id) {
    try {
      const response = await this.client.get(`/${table}/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to read record from ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Updates a record in the specified table by its ID.
   * @param {string} table - The name of the table.
   * @param {string} id - The ID of the record to update.
   * @param {object} data - The data to update.
   * @returns {Promise<object>} The updated record's data.
   * @throws {Error} If the update fails.
   */
  async update(table, id, data) {
    try {
      const response = await this.client.put(`/${table}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update record in ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Deletes a record from the specified table by its ID.
   * @param {string} table - The name of the table.
   * @param {string} id - The ID of the record to delete.
   * @returns {Promise<object>} The response data from the deletion.
   * @throws {Error} If the deletion fails.
   */
  async delete(table, id) {
    try {
      const response = await this.client.delete(`/${table}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete record from ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Queries the specified table with optional filters.
   * @param {string} table - The name of the table.
   * @param {object} [filters={}] - An object containing key-value pairs for filtering.
   * @returns {Promise<Array<object>>} An array of matching records.
   * @throws {Error} If the query fails.
   */
  async query(table, filters = {}) {
    try {
      const response = await this.client.post(`/${table}/query`, filters);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to query ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

  // Account-specific methods

  /**
   * Creates a new account.
   * @param {object} accountData - The account data.
   * @returns {Promise<object>} The created account data.
   */
  async createAccount(accountData) {
    return await this.create('accounts', accountData);
  }

  /**
   * Retrieves an account by ID.
   * @param {string} accountId - The ID of the account.
   * @returns {Promise<object|null>} The account data, or null if not found.
   */
  async getAccount(accountId) {
    return await this.read('accounts', accountId);
  }

  /**
   * Updates an account by ID.
   * @param {string} accountId - The ID of the account.
   * @param {object} accountData - The data to update.
   * @returns {Promise<object>} The updated account data.
   */
  async updateAccount(accountId, accountData) {
    return await this.update('accounts', accountId, accountData);
  }

  /**
   * Deletes an account by ID.
   * @param {string} accountId - The ID of the account.
   * @returns {Promise<object>} The response data from the deletion.
   */
  async deleteAccount(accountId) {
    return await this.delete('accounts', accountId);
  }

  /**
   * Retrieves all accounts for a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array<object>>} An array of user's accounts.
   * @throws {Error} If fetching user accounts fails.
   */
  async getUserAccounts(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/accounts`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user accounts: ${error.response?.data?.error || error.message}`);
    }
  }

  // Transaction-specific methods

  /**
   * Creates a new transaction.
   * @param {object} transactionData - The transaction data.
   * @returns {Promise<object>} The created transaction data.
   */
  async createTransaction(transactionData) {
    return await this.create('transactions', transactionData);
  }

  /**
   * Creates a transaction along with its splits.
   * @param {object} transactionData - The main transaction data.
   * @param {Array<object>} splits - An array of transaction split data.
   * @returns {Promise<object>} The response data from the transaction creation.
   * @throws {Error} If the transaction creation with splits fails.
   */
  async createTransactionWithSplits(transactionData, splits) {
    try {
      const response = await this.client.post('/transactions/with-splits', {
        transaction: transactionData,
        splits: splits
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create transaction with splits: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Retrieves transactions for a specific user.
   * @param {string} userId - The ID of the user.
   * @param {number} [limit=100] - The maximum number of transactions to retrieve.
   * @returns {Promise<Array<object>>} An array of user's transactions.
   * @throws {Error} If fetching user transactions fails.
   */
  async getUserTransactions(userId, limit = 100) {
    try {
      const response = await this.client.get(`/users/${userId}/transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user transactions: ${error.response?.data?.error || error.message}`);
    }
  }

  // Pouch-specific methods

  /**
   * Creates a new pouch.
   * @param {object} pouchData - The pouch data.
   * @returns {Promise<object>} The created pouch data.
   */
  async createPouch(pouchData) {
    return await this.create('pouches', pouchData);
  }

  /**
   * Retrieves all pouches for a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array<object>>} An array of user's pouches.
   */
  async getUserPouches(userId) {
    return await this.query('pouches', { user_id: userId });
  }

  // Goal-specific methods

  /**
   * Creates a new goal.
   * @param {object} goalData - The goal data.
   * @returns {Promise<object>} The created goal data.
   */
  async createGoal(goalData) {
    return await this.create('goals', goalData);
  }

  /**
   * Retrieves all goals for a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array<object>>} An array of user's goals.
   */
  async getUserGoals(userId) {
    return await this.query('goals', { user_id: userId });
  }

  // Transfer-specific methods

  /**
   * Creates a new transfer.
   * @param {object} transferData - The transfer data.
   * @returns {Promise<object>} The created transfer data.
   */
  async createTransfer(transferData) {
    return await this.create('transfers', transferData);
  }

  /**
   * Retrieves all transfers for a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array<object>>} An array of user's transfers.
   */
  async getUserTransfers(userId) {
    return await this.query('transfers', { user_id: userId });
  }

  // User-specific methods

  /**
   * Creates a new user.
   * @param {object} userData - The user data.
   * @returns {Promise<object>} The created user data.
   */
  async createUser(userData) {
    return await this.create('users', userData);
  }

  /**
   * Retrieves a user by email.
   * @param {string} email - The email of the user.
   * @returns {Promise<object|null>} The user data, or null if not found.
   */
  async getUserByEmail(email) {
    const users = await this.query('users', { email: email });
    return users.length > 0 ? users[0] : null;
  }

  // Migration methods

  /**
   * Runs database migrations.
   * @param {string|null} [shard=null] - The name of the shard to migrate, or null for all shards.
   * @returns {Promise<object>} The response data from the migration operation.
   * @throws {Error} If running migrations fails.
   */
  async runMigrations(shard = null) {
    try {
      const response = await this.client.post('/migrate', { shard });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to run migrations: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Rolls back the last database migration.
   * @param {string} shard - The name of the shard to rollback.
   * @returns {Promise<object>} The response data from the rollback operation.
   * @throws {Error} If rolling back migration fails.
   */
  async rollbackMigration(shard) {
    try {
      const response = await this.client.post('/migrate/rollback', { shard });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to rollback migration: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Retrieves the status of database migrations.
   * @returns {Promise<object>} The migration status data.
   * @throws {Error} If fetching migration status fails.
   */
  async getMigrationStatus() {
    try {
      const response = await this.client.get('/migrate/status');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get migration status: ${error.response?.data?.error || error.message}`);
    }
  }

  // Seeder methods

  /**
   * Runs database seeders.
   * @param {string|null} [shard=null] - The name of the shard to seed, or null for all shards.
   * @param {string|null} [seeder=null] - The name of a specific seeder to run.
   * @returns {Promise<object>} The response data from the seeder operation.
   * @throws {Error} If running seeders fails.
   */
  async runSeeders(shard = null, seeder = null) {
    try {
      const response = await this.client.post('/seed', { shard, seeder });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to run seeders: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Resets database seeders for a shard.
   * @param {string} shard - The name of the shard to reset.
   * @returns {Promise<object>} The response data from the seeder reset operation.
   * @throws {Error} If resetting seeders fails.
   */
  async resetSeeders(shard) {
    try {
      const response = await this.client.post('/seed/reset', { shard });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to reset seeders: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Refreshes database seeders for a shard (resets and then runs).
   * @param {string} shard - The name of the shard to refresh.
   * @returns {Promise<object>} The response data from the seeder refresh operation.
   * @throws {Error} If refreshing seeders fails.
   */
  async refreshSeeders(shard) {
    try {
      const response = await this.client.post('/seed/refresh', { shard });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to refresh seeders: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Retrieves the status of database seeders.
   * @returns {Promise<object>} The seeder status data.
   * @throws {Error} If fetching seeder status fails.
   */
  async getSeederStatus() {
    try {
      const response = await this.client.get('/seed/status');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get seeder status: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = DatabaseRepository;