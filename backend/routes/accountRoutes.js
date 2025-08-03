/**
 * @module accountRoutes
 * @description Defines API routes for managing financial accounts.
 * Includes operations for creating, retrieving, updating, and deleting accounts.
 */
async function accountRoutes (fastify, options) {
  // Create Account
  fastify.post('/accounts', async (request, reply) => {
    try {
      const account = await fastify.db.createAccount(request.body);
      reply.code(201).send(account);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get all Accounts for a user
  fastify.get('/accounts', async (request, reply) => {
    try {
      const { user_id } = request.query;
      if (!user_id) {
        reply.code(400).send({ error: 'user_id query parameter is required' });
        return;
      }
      const accounts = await fastify.db.getUserAccounts(user_id);
      reply.code(200).send(accounts);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get Account by ID
  fastify.get('/accounts/:id', async (request, reply) => {
    try {
      const account = await fastify.db.getAccount(request.params.id);
      if (account) {
        reply.code(200).send(account);
      } else {
        reply.code(404).send({ error: 'Account not found' });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update Account by ID
  fastify.put('/accounts/:id', async (request, reply) => {
    try {
      // First check if account exists
      const existingAccount = await fastify.db.getAccount(request.params.id);
      if (!existingAccount) {
        reply.code(404).send({ error: 'Account not found' });
        return;
      }

      await fastify.db.updateAccount(request.params.id, request.body);
      const updatedAccount = await fastify.db.getAccount(request.params.id);
      reply.code(200).send(updatedAccount);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Delete Account by ID
  fastify.delete('/accounts/:id', async (request, reply) => {
    try {
      // First check if account exists
      const existingAccount = await fastify.db.getAccount(request.params.id);
      if (!existingAccount) {
        reply.code(404).send({ error: 'Account not found' });
        return;
      }

      await fastify.db.deleteAccount(request.params.id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = accountRoutes;