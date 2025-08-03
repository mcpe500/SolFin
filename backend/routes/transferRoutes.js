/**
 * @module transferRoutes
 * @description Defines API routes for managing financial transfers.
 * Includes operations for creating, retrieving, updating, and deleting transfers.
 */
async function transferRoutes(fastify, options) {
  /**
   * POST /transfers
   * Creates a new financial transfer.
   * @param {object} request - The request object.
   * @param {object} request.body - The transfer data.
   * @returns {object} The newly created transfer object.
   * @throws {Error} If transfer creation fails.
   */
  fastify.post('/transfers', async (request, reply) => {
    try {
      const transfer = await fastify.db.createTransfer(request.body);
      reply.code(201).send(transfer);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * GET /transfers
   * Retrieves all transfers for a specific user.
   * @param {object} request - The request object.
   * @param {object} request.query - The query parameters.
   * @param {string} request.query.user_id - The ID of the user whose transfers to retrieve.
   * @param {number} [request.query.limit=100] - The maximum number of transfers to retrieve.
   * @returns {Array<object>} An array of transfer objects.
   * @throws {Error} If user_id is missing or fetching transfers fails.
   */
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

  /**
   * GET /transfers/:id
   * Retrieves a single transfer by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the transfer to retrieve.
   * @returns {object} The transfer object.
   * @throws {Error} If the transfer is not found or fetching fails.
   */
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

  /**
   * PUT /transfers/:id
   * Updates a financial transfer by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the transfer to update.
   * @param {object} request.body - The updated transfer data.
   * @returns {object} The updated transfer object.
   * @throws {Error} If the transfer is not found or updating fails.
   */
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

  /**
   * DELETE /transfers/:id
   * Deletes a financial transfer by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the transfer to delete.
   * @returns {object} An empty response with status 204.
   * @throws {Error} If the transfer is not found or deletion fails.
   */
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