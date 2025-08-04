const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');

/**
 * Fastify plugin for JWT authentication.
 * Decorates Fastify with `authenticate` function to verify JWT tokens.
 */
/**
 * @function authenticatePlugin
 * @description Fastify plugin that decorates the Fastify instance with an `authenticate`
 *              function. This function is a preHandler hook used to verify JWT tokens
 *              from incoming requests.
 * @param {object} fastify - The Fastify instance.
 * @param {object} options - Plugin options (not used in this case).
 */
async function authenticatePlugin(fastify, options) {
  /**
   * @function authenticate
   * @description PreHandler hook for Fastify routes to authenticate requests using JWT.
   *              It expects a 'Bearer' token in the 'Authorization' header.
   *              If authentication is successful, the decoded JWT payload is attached to `request.user`.
   * @param {object} request - The Fastify request object.
   * @param {object} reply - The Fastify reply object.
   * @returns {Promise<void>}
   * @throws {Error} Throws an error if authentication fails (e.g., missing token, invalid token),
   *                 which will be caught by the global error handler.
   */
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.code(401).send({ error: 'Authentication required: Bearer token missing' });
        throw new Error('Authentication required: Bearer token missing'); // Throw to stop further processing
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        reply.code(401).send({ error: 'Authentication required: Token missing' });
        throw new Error('Authentication required: Token missing'); // Throw to stop further processing
      }

      // Verify the token. In a production environment, process.env.JWT_SECRET must be a strong,
      // securely managed secret. The 'supersecretjwtkey' fallback is for development only.
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
      request.user = decoded; // Attach decoded user payload to request for route handlers
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        // Handle specific JWT errors (e.g., token expired, invalid signature)
        reply.code(401).send({ error: `Invalid token: ${error.message}` });
      } else {
        // Handle other authentication-related errors
        reply.code(500).send({ error: 'Authentication failed', message: error.message });
      }
      // Re-throw the error to ensure Fastify's global error handler catches it
      // and prevents further processing of the request by the route handler.
      throw error;
    }
  });
}

module.exports = fp(authenticatePlugin);