async function transactionRoutes(fastify, options) {
  // Create Transaction
  fastify.post('/transactions', async (request, reply) => {
    try {
      const transaction = await fastify.db.createTransaction(request.body);
      reply.code(201).send(transaction);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Create Transaction with Splits
  fastify.post('/transactions/with-splits', async (request, reply) => {
    try {
      const { transaction, splits } = request.body;
      const result = await fastify.db.createTransactionWithSplits(transaction, splits);
      reply.code(201).send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get user transactions
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

  // Get Transaction by ID
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

  // Update Transaction by ID
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

  // Delete Transaction by ID
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