const axios = require('axios');

class DatabaseRepository {
  constructor() {
    this.baseURL = process.env.DATABASE_SERVICE_URL || 'http://localhost:3002';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Database service health check failed: ${error.message}`);
    }
  }

  // Generic CRUD operations
  async create(table, data) {
    try {
      const response = await this.client.post(`/${table}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create record in ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

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

  async update(table, id, data) {
    try {
      const response = await this.client.put(`/${table}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update record in ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

  async delete(table, id) {
    try {
      const response = await this.client.delete(`/${table}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete record from ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

  async query(table, filters = {}) {
    try {
      const response = await this.client.post(`/${table}/query`, filters);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to query ${table}: ${error.response?.data?.error || error.message}`);
    }
  }

  // Account-specific methods
  async createAccount(accountData) {
    return await this.create('accounts', accountData);
  }

  async getAccount(accountId) {
    return await this.read('accounts', accountId);
  }

  async updateAccount(accountId, accountData) {
    return await this.update('accounts', accountId, accountData);
  }

  async deleteAccount(accountId) {
    return await this.delete('accounts', accountId);
  }

  async getUserAccounts(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/accounts`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user accounts: ${error.response?.data?.error || error.message}`);
    }
  }

  // Transaction-specific methods
  async createTransaction(transactionData) {
    return await this.create('transactions', transactionData);
  }

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

  async getUserTransactions(userId, limit = 100) {
    try {
      const response = await this.client.get(`/users/${userId}/transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user transactions: ${error.response?.data?.error || error.message}`);
    }
  }

  // Pouch-specific methods
  async createPouch(pouchData) {
    return await this.create('pouches', pouchData);
  }

  async getUserPouches(userId) {
    return await this.query('pouches', { user_id: userId });
  }

  // Goal-specific methods
  async createGoal(goalData) {
    return await this.create('goals', goalData);
  }

  async getUserGoals(userId) {
    return await this.query('goals', { user_id: userId });
  }

  // Transfer-specific methods
  async createTransfer(transferData) {
    return await this.create('transfers', transferData);
  }

  async getUserTransfers(userId) {
    return await this.query('transfers', { user_id: userId });
  }

  // User-specific methods
  async createUser(userData) {
    return await this.create('users', userData);
  }

  async getUserByEmail(email) {
    const users = await this.query('users', { email: email });
    return users.length > 0 ? users[0] : null;
  }

  // Migration methods
  async runMigrations(shard = null) {
    try {
      const response = await this.client.post('/migrate', { shard });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to run migrations: ${error.response?.data?.error || error.message}`);
    }
  }

  async rollbackMigration(shard) {
    try {
      const response = await this.client.post('/migrate/rollback', { shard });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to rollback migration: ${error.response?.data?.error || error.message}`);
    }
  }

  async getMigrationStatus() {
    try {
      const response = await this.client.get('/migrate/status');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get migration status: ${error.response?.data?.error || error.message}`);
    }
  }

  // Seeder methods
  async runSeeders(shard = null, seeder = null) {
    try {
      const response = await this.client.post('/seed', { shard, seeder });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to run seeders: ${error.response?.data?.error || error.message}`);
    }
  }

  async resetSeeders(shard) {
    try {
      const response = await this.client.post('/seed/reset', { shard });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to reset seeders: ${error.response?.data?.error || error.message}`);
    }
  }

  async refreshSeeders(shard) {
    try {
      const response = await this.client.post('/seed/refresh', { shard });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to refresh seeders: ${error.response?.data?.error || error.message}`);
    }
  }

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