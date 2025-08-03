/**
 * @module pouchRoutes
 * @description Defines API routes for managing financial pouches.
 * Includes operations for creating, retrieving, updating, and deleting pouches.
 */
async function pouchRoutes(fastify, options) {
  /**
   * POST /pouches
   * Creates a new financial pouch.
   * @param {object} request - The request object.
   * @param {object} request.body - The pouch data.
   * @returns {object} The newly created pouch object.
   * @throws {Error} If pouch creation fails.
   */
  fastify.post('/pouches', async (request, reply) => {
    try {
      const pouch = await fastify.db.createPouch(request.body);
      reply.code(201).send(pouch);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * GET /pouches
   * Retrieves all pouches for a specific user.
   * @param {object} request - The request object.
   * @param {object} request.query - The query parameters.
   * @param {string} request.query.user_id - The ID of the user whose pouches to retrieve.
   * @returns {Array<object>} An array of pouch objects.
   * @throws {Error} If user_id is missing or fetching pouches fails.
   */
  fastify.get('/pouches', async (request, reply) => {
    try {
      const { user_id } = request.query;
      if (!user_id) {
        reply.code(400).send({ error: 'user_id query parameter is required' });
        return;
      }
      const pouches = await fastify.db.getUserPouches(user_id);
      reply.code(200).send(pouches);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * GET /pouches/:id
   * Retrieves a single pouch by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the pouch to retrieve.
   * @returns {object} The pouch object.
   * @throws {Error} If the pouch is not found or fetching fails.
   */
  fastify.get('/pouches/:id', async (request, reply) => {
    try {
      const pouch = await fastify.db.read('pouches', request.params.id);
      if (pouch) {
        reply.code(200).send(pouch);
      } else {
        reply.code(404).send({ error: 'Pouch not found' });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * PUT /pouches/:id
   * Updates a financial pouch by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the pouch to update.
   * @param {object} request.body - The updated pouch data.
   * @returns {object} The updated pouch object.
   * @throws {Error} If the pouch is not found or updating fails.
   */
  fastify.put('/pouches/:id', async (request, reply) => {
    try {
      const existingPouch = await fastify.db.read('pouches', request.params.id);
      if (!existingPouch) {
        reply.code(404).send({ error: 'Pouch not found' });
        return;
      }

      await fastify.db.update('pouches', request.params.id, request.body);
      const updatedPouch = await fastify.db.read('pouches', request.params.id);
      reply.code(200).send(updatedPouch);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * DELETE /pouches/:id
   * Deletes a financial pouch by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the pouch to delete.
   * @returns {object} An empty response with status 204.
   * @throws {Error} If the pouch is not found or deletion fails.
   */
  fastify.delete('/pouches/:id', async (request, reply) => {
    try {
      const existingPouch = await fastify.db.read('pouches', request.params.id);
      if (!existingPouch) {
        reply.code(404).send({ error: 'Pouch not found' });
        return;
      }

      await fastify.db.delete('pouches', request.params.id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = pouchRoutes;