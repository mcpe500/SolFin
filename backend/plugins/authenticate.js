const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');

/**
 * Fastify plugin for JWT authentication.
 * Decorates Fastify with `authenticate` function to verify JWT tokens.
 */
async function authenticatePlugin(fastify, options) {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.code(401).send({ error: 'Authentication required: Bearer token missing' });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        reply.code(401).send({ error: 'Authentication required: Token missing' });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
      request.user = decoded; // Attach decoded user payload to request
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        reply.code(401).send({ error: `Invalid token: ${error.message}` });
      } else {
        reply.code(500).send({ error: 'Authentication failed' });
      }
      throw new Error('Authentication failed'); // Throw to stop further processing
    }
  });
}

module.exports = fp(authenticatePlugin);