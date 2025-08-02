async function pouchRoutes(fastify, options) {
  // Create Pouch
  fastify.post('/pouches', async (request, reply) => {
    try {
      const pouch = await fastify.db.createPouch(request.body);
      reply.code(201).send(pouch);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get user pouches
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

  // Get Pouch by ID
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

  // Update Pouch by ID
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

  // Delete Pouch by ID
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