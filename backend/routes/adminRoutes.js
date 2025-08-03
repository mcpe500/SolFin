/**
 * @module adminRoutes
 * @description Defines API routes for administrative tasks, including database migration and seeder management,
 * as well as health checks. These routes are typically protected and only accessible by authorized administrators.
 */
async function adminRoutes(fastify, options) {
  // Migration management endpoints

  /**
   * POST /admin/migrate
   * Runs database migrations for a specified shard or all shards.
   * @param {object} request - The request object.
   * @param {object} request.body - The request body.
   * @param {string} [request.body.shard] - The name of the shard to migrate. If not provided, all shards are migrated.
   * @returns {object} The result of the migration operation.
   * @throws {Error} If the migration fails.
   */
  fastify.post('/admin/migrate', async (request, reply) => {
    try {
      const { shard } = request.body;
      const result = await fastify.db.runMigrations(shard);
      reply.code(200).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * POST /admin/migrate/rollback
   * Rolls back the last database migration for a specified shard.
   * @param {object} request - The request object.
   * @param {object} request.body - The request body.
   * @param {string} request.body.shard - The name of the shard to rollback.
   * @returns {object} The result of the rollback operation.
   * @throws {Error} If the shard name is not provided or the rollback fails.
   */
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

  /**
   * GET /admin/migrate/status
   * Retrieves the current status of database migrations for all shards.
   * @returns {object} The migration status data.
   * @throws {Error} If fetching migration status fails.
   */
  fastify.get('/admin/migrate/status', async (request, reply) => {
    try {
      const status = await fastify.db.getMigrationStatus();
      reply.code(200).send(status);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Seeder management endpoints

  /**
   * POST /admin/seed
   * Runs database seeders for a specified shard or all shards, optionally for a specific seeder.
   * @param {object} request - The request object.
   * @param {object} request.body - The request body.
   * @param {string} [request.body.shard] - The name of the shard to seed. If not provided, all shards are seeded.
   * @param {string} [request.body.seeder] - The name of a specific seeder to run.
   * @returns {object} The result of the seeder operation.
   * @throws {Error} If running seeders fails.
   */
  fastify.post('/admin/seed', async (request, reply) => {
    try {
      const { shard, seeder } = request.body;
      const result = await fastify.db.runSeeders(shard, seeder);
      reply.code(200).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * POST /admin/seed/reset
   * Resets database seeders for a specified shard.
   * @param {object} request - The request object.
   * @param {object} request.body - The request body.
   * @param {string} request.body.shard - The name of the shard to reset.
   * @returns {object} The result of the seeder reset operation.
   * @throws {Error} If the shard name is not provided or resetting seeders fails.
   */
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

  /**
   * POST /admin/seed/refresh
   * Resets and then re-runs all seeders for a specified shard.
   * @param {object} request - The request object.
   * @param {object} request.body - The request body.
   * @param {string} request.body.shard - The name of the shard to refresh.
   * @returns {object} The result of the seeder refresh operation.
   * @throws {Error} If the shard name is not provided or refreshing seeders fails.
   */
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

  /**
   * GET /admin/seed/status
   * Retrieves the current status of database seeders for all shards.
   * @returns {object} The seeder status data.
   * @throws {Error} If fetching seeder status fails.
   */
  fastify.get('/admin/seed/status', async (request, reply) => {
    try {
      const status = await fastify.db.getSeederStatus();
      reply.code(200).send(status);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Database health and info endpoints

  /**
   * GET /admin/health
   * Performs a health check on the database service.
   * @returns {object} The health status data.
   * @throws {Error} If the health check fails.
   */
  fastify.get('/admin/health', async (request, reply) => {
    try {
      const health = await fastify.db.healthCheck();
      reply.code(200).send(health);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Combined setup endpoint for development

  /**
   * POST /admin/setup
   * Combines running migrations and seeders for development setup.
   * @param {object} request - The request object.
   * @param {object} request.body - The request body.
   * @param {boolean} [request.body.runMigrations=true] - Whether to run migrations.
   * @param {boolean} [request.body.runSeeders=false] - Whether to run seeders.
   * @returns {object} A message indicating completion and results of operations.
   * @throws {Error} If any setup step fails.
   */
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