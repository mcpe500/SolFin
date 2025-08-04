// server.js
require('dotenv').config(); // Load environment variables

/**
 * @function buildFastify
 * @description Initializes and configures the Fastify server, setting up database
 *              repository, user service, authentication plugin, routes, and global error handling.
 *              It also performs an initial health check on the database service.
 * @returns {Promise<FastifyInstance>} A Promise that resolves to the configured Fastify server instance.
 * @throws {Error} If there's a critical error during Fastify app building or database connection fails.
 */
const buildFastify = async () => {
  const fastify = require('fastify')({ logger: true });
  const DatabaseRepository = require('./repositories/DatabaseRepository');
  const UserService = require('./services/UserService'); // Import UserService
  const authenticatePlugin = require('./plugins/authenticate'); // Import authentication plugin
  const accountRoutes = require('./routes/accountRoutes');

  // Initialize database repository (connects to solfin_database service)
  const dbRepository = new DatabaseRepository();
  
  // Make repository available to routes
  fastify.decorate('db', dbRepository);

  // Initialize and make UserService available
  const userService = new UserService(dbRepository);
  fastify.decorate('userService', userService);

  // Register authentication plugin
  fastify.register(authenticatePlugin);

  // Fastify automatically handles application/json parsing.
  // We can add a preHandler hook to inspect the body before it reaches the route.
  fastify.addHook('preHandler', (request, reply, done) => {
    if (request.body) {
      // Create a copy of the body to redact sensitive information
      const redactedBody = { ...request.body };
      if (redactedBody.password) {
        redactedBody.password = '[REDACTED]';
      }
      if (redactedBody.password_hash) {
        redactedBody.password_hash = '[REDACTED]';
      }
      fastify.log.info('Request Body:', redactedBody);
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

  // Set a global error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    request.log.error(error); // Log the error for debugging

    // Centralized error handling based on error properties or messages
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred.';
    let errorDetails = null;

    if (error.validation) {
      statusCode = 400;
      errorMessage = 'Bad Request';
      errorDetails = error.validation;
    } else if (error.message.includes('Authentication required')) {
      statusCode = 401;
      errorMessage = 'Unauthorized';
    } else if (error.message.includes('Forbidden')) {
      statusCode = 403;
      errorMessage = 'Forbidden';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'Not Found';
    } else if (error.message.includes('already exists')) {
      statusCode = 409;
      errorMessage = 'Conflict';
    } else {
      // For any other unhandled errors, use the error's message if available
      errorMessage = error.message || errorMessage;
    }

    reply.code(statusCode).send({
      statusCode: statusCode,
      error: errorMessage,
      message: error.message, // Provide original error message for more context
      details: errorDetails
    });
  });

  // Test database connection
  try {
    const health = await dbRepository.healthCheck();
    fastify.log.info('Database service connection established:', health);
  } catch (error) {
    fastify.log.error('Failed to connect to database service:', error);
    // Exit if essential service is unavailable on startup
    process.exit(1);
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