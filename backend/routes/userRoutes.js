const UserService = require('../services/UserService');
const { UserExistsError, InvalidCredentialsError } = require('../services/UserService');

async function userRoutes(fastify, options) {
  // Ensure UserService is available
  if (!fastify.userService) {
    fastify.decorate('userService', new UserService(fastify.db));
  }

  const userRegisterSchema = {
    body: {
      type: 'object',
      required: ['email', 'password', 'first_name', 'last_name'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        first_name: { type: 'string' },
        last_name: { type: 'string' }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          created_at: { type: 'string' },
          updated_at: { type: 'string' }
        }
      }
    }
  };

  const userLoginSchema = {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' }
            }
          },
          token: { type: 'string' }
        }
      }
    }
  };

  const userProfileSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          phone: { type: ['string', 'null'] },
          avatar_url: { type: ['string', 'null'] },
          timezone: { type: 'string' },
          is_active: { type: 'boolean' },
          last_login: { type: ['string', 'null'] },
          created_at: { type: 'string' },
          updated_at: { type: 'string' }
        }
      }
    }
  };

  const userUpdateProfileSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        phone: { type: 'string' },
        avatar_url: { type: 'string' },
        timezone: { type: 'string' },
        is_active: { type: 'boolean' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          phone: { type: ['string', 'null'] },
          avatar_url: { type: ['string', 'null'] },
          timezone: { type: 'string' },
          is_active: { type: 'boolean' },
          last_login: { type: ['string', 'null'] },
          created_at: { type: 'string' },
          updated_at: { type: 'string' }
        }
      }
    }
  };

  const userPreferencesSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        additionalProperties: true // Allows for arbitrary key-value pairs for preferences
      }
    }
  };

  const userUpdatePreferenceSchema = {
    params: {
      type: 'object',
      required: ['id', 'key'],
      properties: {
        id: { type: 'string' },
        key: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      required: ['value'],
      properties: {
        value: { type: 'string' } // Value can be anything, so string is a safe default
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          value: { type: 'string' }
        }
      }
    }
  };

  // Register new user
  /**
   * Route for user registration.
   * @name POST /users/register
   * @function
   * @param {object} request - The Fastify request object.
   * @param {object} reply - The Fastify reply object.
   * @returns {Promise<void>}
   */
  fastify.post('/users/register', { schema: userRegisterSchema }, async (request, reply) => {
    try {
      const user = await fastify.userService.registerUser(request.body);
      reply.code(201).send(user);
    } catch (error) {
      if (error instanceof UserExistsError) {
        reply.code(error.statusCode).send({ statusCode: error.statusCode, error: error.name, message: error.message });
      } else {
        throw error; // Re-throw other errors for the global error handler
      }
    }
  });

  // User login
  /**
   * Route for user login.
   * @name POST /users/login
   * @function
   * @param {object} request - The Fastify request object.
   * @param {object} reply - The Fastify reply object.
   * @returns {Promise<void>}
   */
  fastify.post('/users/login', { schema: userLoginSchema }, async (request, reply) => {
    const { email, password } = request.body;
    try {
      const { user, token } = await fastify.userService.loginUser(email, password);
      reply.code(200).send({ user, token });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        reply.code(error.statusCode).send({ statusCode: error.statusCode, error: error.name, message: error.message });
      } else {
        throw error; // Re-throw other errors for the global error handler
      }
    }
  });

  // Get user profile
  fastify.get('/users/:id', { schema: userProfileSchema, preHandler: [fastify.authenticate] }, async (request, reply) => {
    // Ensure authenticated user can only access their own profile (basic authorization)
    if (request.user.id !== request.params.id) {
      throw new Error('Forbidden: You can only access your own profile.');
    }
    const user = await fastify.userService.getUserProfile(request.params.id);
    if (!user) {
      reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' });
      return;
    }
    reply.code(200).send(user);
  });

  // Update user profile
  fastify.put('/users/:id', { schema: userUpdateProfileSchema, preHandler: [fastify.authenticate] }, async (request, reply) => {
    // Ensure authenticated user can only update their own profile (basic authorization)
    if (request.user.id !== request.params.id) {
      throw new Error('Forbidden: You can only update your own profile.');
    }
    const user = await fastify.userService.updateUserProfile(request.params.id, request.body);
    reply.code(200).send(user);
  });

  // Get user preferences
  fastify.get('/users/:id/preferences', { schema: userPreferencesSchema, preHandler: [fastify.authenticate] }, async (request, reply) => {
    // Ensure authenticated user can only access their own preferences (basic authorization)
    if (request.user.id !== request.params.id) {
      throw new Error('Forbidden: You can only access your own preferences.');
    }
    const preferences = await fastify.userService.getUserPreferences(request.params.id);
    reply.code(200).send(preferences);
  });

  // Update user preference
  fastify.put('/users/:id/preferences/:key', { schema: userUpdatePreferenceSchema, preHandler: [fastify.authenticate] }, async (request, reply) => {
    // Ensure authenticated user can only update their own preferences (basic authorization)
    if (request.user.id !== request.params.id) {
      throw new Error('Forbidden: You can only update your own preferences.');
    }
    const { value } = request.body;
    const { id: user_id, key } = request.params;
    const preference = await fastify.userService.updateUserPreference(user_id, key, value);
    reply.code(200).send(preference);
  });
}

module.exports = userRoutes;