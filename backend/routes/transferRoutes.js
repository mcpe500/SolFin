async function transferRoutes(fastify, options) {
  // Create Transfer
  fastify.post('/transfers', async (request, reply) => {
    try {
      const transfer = await fastify.db.createTransfer(request.body);
      reply.code(201).send(transfer);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get user transfers
  fastify.get('/transfers', async (request, reply) => {
    try {
      const { user_id, limit = 100 } = request.query;
      if (!user_id) {
        reply.code(400).send({ error: 'user_id query parameter is required' });
        return;
      }
      const transfers = await fastify.db.getUserTransfers(user_id);
      reply.code(200).send(transfers);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get Transfer by ID
  fastify.get('/transfers/:id', async (request, reply) => {
    try {
      const transfer = await fastify.db.read('transfers', request.params.id);
      if (transfer) {
        reply.code(200).send(transfer);
      } else {
        reply.code(404).send({ error: 'Transfer not found' });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update Transfer by ID
  fastify.put('/transfers/:id', async (request, reply) => {
    try {
      const existingTransfer = await fastify.db.read('transfers', request.params.id);
      if (!existingTransfer) {
        reply.code(404).send({ error: 'Transfer not found' });
        return;
      }

      await fastify.db.update('transfers', request.params.id, request.body);
      const updatedTransfer = await fastify.db.read('transfers', request.params.id);
      reply.code(200).send(updatedTransfer);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Delete Transfer by ID
  fastify.delete('/transfers/:id', async (request, reply) => {
    try {
      const existingTransfer = await fastify.db.read('transfers', request.params.id);
      if (!existingTransfer) {
        reply.code(404).send({ error: 'Transfer not found' });
        return;
      }

      await fastify.db.delete('transfers', request.params.id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = transferRoutes;