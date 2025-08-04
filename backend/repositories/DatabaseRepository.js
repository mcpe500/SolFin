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
   * @param {string} table - The name of the table (e.g., 'users', 'accounts').
   * @param {object} data - The data payload for the new record.
   * @returns {Promise<object>} A Promise that resolves with the data of the newly created record.
   * @throws {Error} If the API request fails or the database service returns an error.
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
   * @param {string} table - The name of the table (e.g., 'users', 'transactions').
   * @param {string} id - The unique identifier of the record to retrieve.
   * @returns {Promise<object|null>} A Promise that resolves with the record data if found, or `null` if not found (HTTP 404).
   * @throws {Error} If the API request fails for reasons other than a 404 (e.g., network error, server error).
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
   * @param {string} id - The unique identifier of the record to update.
   * @param {object} data - The partial data to apply to the record.
   * @returns {Promise<object>} A Promise that resolves with the updated record data.
   * @throws {Error} If the API request fails or the database service returns an error.
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
   * @param {string} id - The unique identifier of the record to delete.
   * @returns {Promise<object>} A Promise that resolves with the response data from the deletion operation.
   * @throws {Error} If the API request fails or the database service returns an error.
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
   * @param {object} [filters={}] - An optional object containing key-value pairs for filtering the records.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of matching records.
   * @throws {Error} If the API request fails or the database service returns an error.
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
   * @param {object} accountData - The data for the new account (e.g., user_id, name, type, currency, initial_balance).
   * @returns {Promise<object>} A Promise that resolves with the data of the newly created account.
   * @throws {Error} If the account creation fails.
   */
  async createAccount(accountData) {
    return await this.create('accounts', accountData);
  }

  /**
   * Retrieves an account by ID.
   * @param {string} accountId - The unique identifier of the account to retrieve.
   * @returns {Promise<object|null>} A Promise that resolves with the account data if found, or `null` if not found.
   * @throws {Error} If fetching the account fails for reasons other than a 404.
   */
  async getAccount(accountId) {
    return await this.read('accounts', accountId);
  }

  /**
   * Updates an account by ID.
   * @param {string} accountId - The unique identifier of the account to update.
   * @param {object} accountData - The partial data to update for the account.
   * @returns {Promise<object>} A Promise that resolves with the updated account data.
   * @throws {Error} If updating the account fails.
   */
  async updateAccount(accountId, accountData) {
    return await this.update('accounts', accountId, accountData);
  }

  /**
   * Deletes an account by ID.
   * @param {string} accountId - The unique identifier of the account to delete.
   * @returns {Promise<object>} A Promise that resolves with the response from the deletion operation.
   * @throws {Error} If deleting the account fails.
   */
  async deleteAccount(accountId) {
    return await this.delete('accounts', accountId);
  }

  /**
   * Retrieves all accounts for a specific user.
   * @param {string} userId - The unique identifier of the user whose accounts are to be retrieved.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of account objects belonging to the user.
   * @throws {Error} If the API request fails or the database service returns an error.
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
   * @param {object} transactionData - The data for the new transaction.
   * @returns {Promise<object>} A Promise that resolves with the data of the newly created transaction.
   * @throws {Error} If the transaction creation fails.
   */
  async createTransaction(transactionData) {
    return await this.create('transactions', transactionData);
  }

  /**
   * Creates a transaction along with its splits.
   * @param {object} transactionData - The main transaction data.
   * @param {Array<object>} splits - An array of transaction split data associated with the main transaction.
   * @returns {Promise<object>} A Promise that resolves with the response data indicating the success of the transaction and splits creation.
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
   * @param {string} userId - The unique identifier of the user whose transactions are to be retrieved.
   * @param {number} [limit=100] - The maximum number of transactions to retrieve. Defaults to 100.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of transaction objects belonging to the user.
   * @throws {Error} If the API request fails or the database service returns an error.
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
   * @param {object} pouchData - The data for the new pouch.
   * @returns {Promise<object>} A Promise that resolves with the data of the newly created pouch.
   * @throws {Error} If the pouch creation fails.
   */
  async createPouch(pouchData) {
    return await this.create('pouches', pouchData);
  }

  /**
   * Retrieves all pouches for a specific user.
   * @param {string} userId - The unique identifier of the user whose pouches are to be retrieved.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of pouch objects belonging to the user.
   * @throws {Error} If fetching user pouches fails.
   */
  async getUserPouches(userId) {
    return await this.query('pouches', { user_id: userId });
  }

  // Goal-specific methods

  /**
   * Creates a new goal.
   * @param {object} goalData - The data for the new goal.
   * @returns {Promise<object>} A Promise that resolves with the data of the newly created goal.
   * @throws {Error} If the goal creation fails.
   */
  async createGoal(goalData) {
    return await this.create('goals', goalData);
  }

  /**
   * Retrieves all goals for a specific user.
   * @param {string} userId - The unique identifier of the user whose goals are to be retrieved.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of goal objects belonging to the user.
   * @throws {Error} If fetching user goals fails.
   */
  async getUserGoals(userId) {
    return await this.query('goals', { user_id: userId });
  }

  // Transfer-specific methods

  /**
   * Creates a new transfer.
   * @param {object} transferData - The data for the new transfer.
   * @returns {Promise<object>} A Promise that resolves with the data of the newly created transfer.
   * @throws {Error} If the transfer creation fails.
   */
  async createTransfer(transferData) {
    return await this.create('transfers', transferData);
  }

  /**
   * Retrieves all transfers for a specific user.
   * @param {string} userId - The unique identifier of the user whose transfers are to be retrieved.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of transfer objects belonging to the user.
   * @throws {Error} If fetching user transfers fails.
   */
  async getUserTransfers(userId) {
    return await this.query('transfers', { user_id: userId });
  }

  // User-specific methods

  /**
   * Creates a new user.
   * @param {object} userData - The data for the new user (e.g., email, password_hash, first_name, last_name).
   * @returns {Promise<object>} A Promise that resolves with the data of the newly created user.
   * @throws {Error} If the user creation fails.
   */
  async createUser(userData) {
    return await this.create('users', userData);
  }

  /**
   * Retrieves a user by email.
   * @param {string} email - The email address of the user to retrieve.
   * @returns {Promise<object|null>} A Promise that resolves with the user data if found, or `null` if not found.
   * @throws {Error} If querying for the user by email fails.
   */
  async getUserByEmail(email) {
    const users = await this.query('users', { email: email });
    return users.length > 0 ? users[0] : null;
  }

  // Migration methods

  /**
   * Runs database migrations.
   * @param {string} [shard=null] - Optional. The name of the specific shard to migrate. If `null`, migrations will be run for all shards.
   * @returns {Promise<object>} A Promise that resolves with the response data from the migration operation.
   * @throws {Error} If the API request fails or running migrations on the database service encounters an error.
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
   * @param {string} shard - The name of the shard for which to roll back the last migration.
   * @returns {Promise<object>} A Promise that resolves with the response data from the rollback operation.
   * @throws {Error} If the API request fails or rolling back the migration on the database service encounters an error.
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
   * @returns {Promise<object>} A Promise that resolves with the migration status data for all shards.
   * @throws {Error} If the API request fails or fetching the migration status from the database service encounters an error.
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
   * @param {string} [shard=null] - Optional. The name of the specific shard to seed. If `null`, seeders will be run for all shards.
   * @param {string} [seeder=null] - Optional. The name of a specific seeder file to run within the specified shard or across all shards.
   * @returns {Promise<object>} A Promise that resolves with the response data from the seeder operation.
   * @throws {Error} If the API request fails or running seeders on the database service encounters an error.
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
   * @param {string} shard - The name of the shard for which to reset seeders.
   * @returns {Promise<object>} A Promise that resolves with the response data from the seeder reset operation.
   * @throws {Error} If the API request fails or resetting seeders on the database service encounters an error.
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
   * @param {string} shard - The name of the shard for which to refresh seeders (reset and then run).
   * @returns {Promise<object>} A Promise that resolves with the response data from the seeder refresh operation.
   * @throws {Error} If the API request fails or refreshing seeders on the database service encounters an error.
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
   * @returns {Promise<object>} A Promise that resolves with the seeder status data for all shards.
   * @throws {Error} If the API request fails or fetching the seeder status from the database service encounters an error.
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