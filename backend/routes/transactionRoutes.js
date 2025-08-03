/**
 * @module transactionRoutes
 * @description Defines API routes for managing financial transactions.
 * Includes operations for creating, retrieving, updating, and deleting transactions,
 * as well as handling transactions with splits.
 */
async function transactionRoutes(fastify, options) {
  /**
   * POST /transactions
   * Creates a new financial transaction.
   * @param {object} request - The request object.
   * @param {object} request.body - The transaction data.
   * @returns {object} The newly created transaction object.
   * @throws {Error} If transaction creation fails.
   */
  fastify.post('/transactions', async (request, reply) => {
    try {
      const transaction = await fastify.db.createTransaction(request.body);
      reply.code(201).send(transaction);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * POST /transactions/with-splits
   * Creates a new financial transaction along with associated splits.
   * @param {object} request - The request object.
   * @param {object} request.body - The transaction and splits data.
   * @param {object} request.body.transaction - The main transaction details.
   * @param {Array<object>} request.body.splits - An array of split details.
   * @returns {object} The result of the transaction creation.
   * @throws {Error} If the transaction with splits creation fails.
   */
  fastify.post('/transactions/with-splits', async (request, reply) => {
    try {
      const { transaction, splits } = request.body;
      const result = await fastify.db.createTransactionWithSplits(transaction, splits);
      reply.code(201).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * GET /transactions
   * Retrieves transactions for a specific user, with an optional limit.
   * @param {object} request - The request object.
   * @param {object} request.query - The query parameters.
   * @param {string} request.query.user_id - The ID of the user whose transactions to retrieve.
   * @param {number} [request.query.limit=100] - The maximum number of transactions to retrieve.
   * @returns {Array<object>} An array of transaction objects.
   * @throws {Error} If user_id is missing or fetching transactions fails.
   */
  fastify.get('/transactions', async (request, reply) => {
    try {
      const { user_id, limit = 100 } = request.query;
      if (!user_id) {
        reply.code(400).send({ error: 'user_id query parameter is required' });
        return;
      }
      const transactions = await fastify.db.getUserTransactions(user_id, parseInt(limit));
      reply.code(200).send(transactions);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * GET /transactions/:id
   * Retrieves a single transaction by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the transaction to retrieve.
   * @returns {object} The transaction object.
   * @throws {Error} If the transaction is not found or fetching fails.
   */
  fastify.get('/transactions/:id', async (request, reply) => {
    try {
      const transaction = await fastify.db.read('transactions', request.params.id);
      if (transaction) {
        reply.code(200).send(transaction);
      } else {
        reply.code(404).send({ error: 'Transaction not found' });
      }
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * PUT /transactions/:id
   * Updates a financial transaction by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the transaction to update.
   * @param {object} request.body - The updated transaction data.
   * @returns {object} The updated transaction object.
   * @throws {Error} If the transaction is not found or updating fails.
   */
  fastify.put('/transactions/:id', async (request, reply) => {
    try {
      const existingTransaction = await fastify.db.read('transactions', request.params.id);
      if (!existingTransaction) {
        reply.code(404).send({ error: 'Transaction not found' });
        return;
      }

      await fastify.db.update('transactions', request.params.id, request.body);
      const updatedTransaction = await fastify.db.read('transactions', request.params.id);
      reply.code(200).send(updatedTransaction);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  /**
   * DELETE /transactions/:id
   * Deletes a financial transaction by its ID.
   * @param {object} request - The request object.
   * @param {object} request.params - The path parameters.
   * @param {string} request.params.id - The ID of the transaction to delete.
   * @returns {object} An empty response with status 204.
   * @throws {Error} If the transaction is not found or deletion fails.
   */
  fastify.delete('/transactions/:id', async (request, reply) => {
    try {
      const existingTransaction = await fastify.db.read('transactions', request.params.id);
      if (!existingTransaction) {
        reply.code(404).send({ error: 'Transaction not found' });
        return;
      }

      await fastify.db.delete('transactions', request.params.id);
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = transactionRoutes;