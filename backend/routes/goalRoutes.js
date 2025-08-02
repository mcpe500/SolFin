async function goalRoutes(fastify, options) {
  // Create Goal
  fastify.post('/goals', async (request, reply) => {
    try {
      const goal = await fastify.db.createGoal(request.body);
      reply.code(201).send(goal);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get user goals
  fastify.get('/goals', async (request, reply) => {
    try {
      const { user_id } = request.query;
      if (!user_id) {
        reply.code(400).send({ error: 'user_id query parameter is required' });
        return;
      }
      const goals = await fastify.db.getUserGoals(user_id);
      reply.code(200).send(goals);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get Goal by ID
  fastify.get('/goals/:id', async (request, reply) => {
    try {
      const goal = await fastify.db.read('goals', request.params.id);
      if (goal) {
        reply.code(200).send(goal);
      } else {
        reply.code(404).send({ error: 'Goal not found' });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update Goal by ID
  fastify.put('/goals/:id', async (request, reply) => {
    try {
      const existingGoal = await fastify.db.read('goals', request.params.id);
      if (!existingGoal) {
        reply.code(404).send({ error: 'Goal not found' });
        return;
      }

      await fastify.db.update('goals', request.params.id, request.body);
      const updatedGoal = await fastify.db.read('goals', request.params.id);
      reply.code(200).send(updatedGoal);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Delete Goal by ID
  fastify.delete('/goals/:id', async (request, reply) => {
    try {
      const existingGoal = await fastify.db.read('goals', request.params.id);
      if (!existingGoal) {
        reply.code(404).send({ error: 'Goal not found' });
        return;
      }

      await fastify.db.delete('goals', request.params.id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update goal progress
  fastify.patch('/goals/:id/progress', async (request, reply) => {
    try {
      const { current_amount } = request.body;
      if (current_amount === undefined) {
        reply.code(400).send({ error: 'current_amount is required' });
        return;
      }

      const existingGoal = await fastify.db.read('goals', request.params.id);
      if (!existingGoal) {
        reply.code(404).send({ error: 'Goal not found' });
        return;
      }

      // Check if goal is achieved
      const is_achieved = current_amount >= existingGoal.target_amount;

      await fastify.db.update('goals', request.params.id, {
        current_amount,
        is_achieved
      });

      const updatedGoal = await fastify.db.read('goals', request.params.id);
      reply.code(200).send(updatedGoal);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = goalRoutes;