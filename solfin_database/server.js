require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const DatabaseService = require('./lib/DatabaseService');

// Initialize database service
const dbService = new DatabaseService();

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  try {
    const health = await dbService.healthCheck();
    return { status: 'ok', shards: health };
  } catch (error) {
    reply.code(500);
    return { status: 'error', message: error.message };
  }
});

// Generic CRUD endpoints
fastify.post('/:table', async (request, reply) => {
  try {
    const { table } = request.params;
    const data = request.body;
    const id = await dbService.create(table, data);
    return { id, message: 'Created successfully' };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.get('/:table/:id', async (request, reply) => {
  try {
    const { table, id } = request.params;
    const result = await dbService.read(table, id);
    if (!result) {
      reply.code(404);
      return { error: 'Record not found' };
    }
    return result;
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.put('/:table/:id', async (request, reply) => {
  try {
    const { table, id } = request.params;
    const data = request.body;
    await dbService.update(table, id, data);
    return { message: 'Updated successfully' };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.delete('/:table/:id', async (request, reply) => {
  try {
    const { table, id } = request.params;
    await dbService.delete(table, id);
    return { message: 'Deleted successfully' };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

// Query endpoint with filters
fastify.post('/:table/query', async (request, reply) => {
  try {
    const { table } = request.params;
    const filters = request.body || {};
    const results = await dbService.query(table, filters);
    return results;
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

// Specialized endpoints
fastify.get('/users/:userId/accounts', async (request, reply) => {
  try {
    const { userId } = request.params;
    const accounts = await dbService.getUserAccounts(userId);
    return accounts;
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.get('/users/:userId/transactions', async (request, reply) => {
  try {
    const { userId } = request.params;
    const { limit = 100 } = request.query;
    const transactions = await dbService.getUserTransactions(userId, parseInt(limit));
    return transactions;
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.post('/transactions/with-splits', async (request, reply) => {
  try {
    const { transaction, splits } = request.body;
    const transactionId = await dbService.createTransactionWithSplits(transaction, splits);
    return { id: transactionId, message: 'Transaction with splits created successfully' };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

// Migration endpoints
fastify.post('/migrate', async (request, reply) => {
  try {
    const { shard } = request.body;
    await dbService.runMigrations(shard);
    return { message: 'Migrations completed successfully', shard: shard || 'all' };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.post('/migrate/rollback', async (request, reply) => {
  try {
    const { shard } = request.body;
    if (!shard) {
      reply.code(400);
      return { error: 'Shard name is required for rollback' };
    }
    await dbService.rollbackMigration(shard);
    return { message: 'Migration rolled back successfully', shard };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.get('/migrate/status', async (request, reply) => {
  try {
    const status = dbService.getMigrationStatus();
    return { status };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

// Seeder endpoints
fastify.post('/seed', async (request, reply) => {
  try {
    const { shard, seeder } = request.body;
    if (seeder && shard) {
      await dbService.runSeeder(shard, seeder);
      return { message: 'Seeder completed successfully', shard, seeder };
    } else {
      await dbService.runSeeders(shard);
      return { message: 'Seeders completed successfully', shard: shard || 'all' };
    }
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.post('/seed/reset', async (request, reply) => {
  try {
    const { shard } = request.body;
    if (!shard) {
      reply.code(400);
      return { error: 'Shard name is required for reset' };
    }
    await dbService.resetSeeders(shard);
    return { message: 'Seeders reset successfully', shard };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.post('/seed/refresh', async (request, reply) => {
  try {
    const { shard } = request.body;
    if (!shard) {
      reply.code(400);
      return { error: 'Shard name is required for refresh' };
    }
    await dbService.refreshSeeders(shard);
    return { message: 'Seeders refreshed successfully', shard };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.get('/seed/status', async (request, reply) => {
  try {
    const status = dbService.getSeederStatus();
    return { status };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  fastify.log.info('Shutting down database service...');
  dbService.close();
  process.exit(0);
});

// Start server
const start = async () => {
  try {
    const port = process.env.DB_PORT || 3002;
    const host = process.env.DB_HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`SolFin Database Service listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error('Failed to start database service:', err);
    process.exit(1);
  }
};

start();