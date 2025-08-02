async function adminRoutes(fastify, options) {
  // Migration management endpoints
  fastify.post('/admin/migrate', async (request, reply) => {
    try {
      const { shard } = request.body;
      const result = await fastify.db.runMigrations(shard);
      reply.code(200).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.post('/admin/migrate/rollback', async (request, reply) => {
    try {
      const { shard } = request.body;
      if (!shard) {
        reply.code(400).send({ error: 'Shard name is required for rollback' });
        return;
      }
      const result = await fastify.db.rollbackMigration(shard);
      reply.code(200).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/admin/migrate/status', async (request, reply) => {
    try {
      const status = await fastify.db.getMigrationStatus();
      reply.code(200).send(status);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Seeder management endpoints
  fastify.post('/admin/seed', async (request, reply) => {
    try {
      const { shard, seeder } = request.body;
      const result = await fastify.db.runSeeders(shard, seeder);
      reply.code(200).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.post('/admin/seed/reset', async (request, reply) => {
    try {
      const { shard } = request.body;
      if (!shard) {
        reply.code(400).send({ error: 'Shard name is required for reset' });
        return;
      }
      const result = await fastify.db.resetSeeders(shard);
      reply.code(200).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.post('/admin/seed/refresh', async (request, reply) => {
    try {
      const { shard } = request.body;
      if (!shard) {
        reply.code(400).send({ error: 'Shard name is required for refresh' });
        return;
      }
      const result = await fastify.db.refreshSeeders(shard);
      reply.code(200).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  fastify.get('/admin/seed/status', async (request, reply) => {
    try {
      const status = await fastify.db.getSeederStatus();
      reply.code(200).send(status);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Database health and info endpoints
  fastify.get('/admin/health', async (request, reply) => {
    try {
      const health = await fastify.db.healthCheck();
      reply.code(200).send(health);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Combined setup endpoint for development
  fastify.post('/admin/setup', async (request, reply) => {
    try {
      const { runMigrations = true, runSeeders = false } = request.body;
      const results = {};

      if (runMigrations) {
        console.log('Running migrations...');
        results.migrations = await fastify.db.runMigrations();
      }

      if (runSeeders) {
        console.log('Running seeders...');
        results.seeders = await fastify.db.runSeeders();
      }

      reply.code(200).send({
        message: 'Database setup completed',
        results
      });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = adminRoutes;