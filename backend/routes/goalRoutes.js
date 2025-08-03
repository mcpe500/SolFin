/**
 * @module goalRoutes
 * @description Defines API routes for managing financial goals.
 * Includes operations for creating, retrieving, updating, deleting goals,
 * and updating goal progress.
 */
async function goalRoutes(fastify, options) {
  /**
   * POST /goals
   * Creates a new financial goal.
   * @param {object} request - The request object.
   * @param {object} request.body - The goal data.
   * @returns {object} The newly created goal object.
   * @throws {Error} If goal creation fails.
   */
  fastify.post('/goals', async (request, reply) => {
    try {
      const goal = await fastify.db.createGoal(request.body);
      reply.code(201).send(goal);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * GET /goals
   * Retrieves all goals for a specific user.
   * @param {object} request - The request object.
   * @param {object} request.query - The query parameters.
   * @param {string} request.query.user_id - The ID of the user whose goals to retrieve.
   * @returns {Array<object>} An array of goal objects.
   * @throws {Error} If user_id is missing or fetching goals fails.
   */
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

  /**
   * GET /goals/:id
   * Retrieves a single goal by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the goal to retrieve.
   * @returns {object} The goal object.
   * @throws {Error} If the goal is not found or fetching fails.
   */
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

  /**
   * PUT /goals/:id
   * Updates a financial goal by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the goal to update.
   * @param {object} request.body - The updated goal data.
   * @returns {object} The updated goal object.
   * @throws {Error} If the goal is not found or updating fails.
   */
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

  /**
   * DELETE /goals/:id
   * Deletes a financial goal by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the goal to delete.
   * @returns {object} An empty response with status 204.
   * @throws {Error} If the goal is not found or deletion fails.
   */
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

  /**
   * PATCH /goals/:id/progress
   * Updates the progress (current amount) of a financial goal.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the goal to update.
   * @param {object} request.body - The updated progress data.
   * @param {number} request.body.current_amount - The new current amount for the goal.
   * @returns {object} The updated goal object.
   * @throws {Error} If current_amount is missing, the goal is not found, or updating fails.
   */
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