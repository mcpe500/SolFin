// server.js
require('dotenv').config(); // Load environment variables

const buildFastify = async () => {
  const fastify = require('fastify')({ logger: true });
  const DatabaseRepository = require('./repositories/DatabaseRepository');
  const accountRoutes = require('./routes/accountRoutes');

  // Initialize database repository (connects to solfin_database service)
  const dbRepository = new DatabaseRepository();
  
  // Make repository available to routes
  fastify.decorate('db', dbRepository);

  // Fastify automatically handles application/json parsing.
  // We can add a preHandler hook to inspect the body before it reaches the route.
  fastify.addHook('preHandler', (request, reply, done) => {
    if (request.body) {
      fastify.log.info('Request Body:', request.body);
    }
    done();
  });

  // Register routes
  fastify.register(require('./routes/userRoutes'));
  fastify.register(accountRoutes);
  fastify.register(require('./routes/transactionRoutes'));
  fastify.register(require('./routes/pouchRoutes'));
  fastify.register(require('./routes/transferRoutes'));
  fastify.register(require('./routes/goalRoutes'));
  fastify.register(require('./routes/adminRoutes'));

  // Test database connection
  try {
    const health = await dbRepository.healthCheck();
    fastify.log.info('Database service connection established:', health);
  } catch (error) {
    fastify.log.error('Failed to connect to database service:', error);
    throw error;
  }

  return fastify;
};

if (require.main === module) {
  // This block will only run if server.js is executed directly
  buildFastify().then(fastify => {
    fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' }, (err) => {
      if (err) {
        fastify.log.error('Server startup error:', err);
        process.exit(1);
      }
      fastify.log.info(`server listening on ${fastify.server.address().port}`);
    });
  }).catch(err => {
    console.error('Failed to build Fastify app:', err);
    process.exit(1);
  });
}

module.exports = buildFastify;