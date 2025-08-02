async function userRoutes(fastify, options) {
  // Register new user
  fastify.post('/users/register', async (request, reply) => {
    try {
      const { email, password, first_name, last_name } = request.body;
      
      // Check if user already exists
      const existingUser = await fastify.db.getUserByEmail(email);
      if (existingUser) {
        reply.code(409).send({ error: 'User already exists with this email' });
        return;
      }

      // In a real application, hash the password
      const password_hash = `hashed_${password}`; // Replace with proper bcrypt hashing

      const user = await fastify.db.createUser({
        email,
        password_hash,
        first_name,
        last_name
      });

      // Don't return password hash
      const { password_hash: _, ...userResponse } = user;
      reply.code(201).send(userResponse);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // User login
  fastify.post('/users/login', async (request, reply) => {
    try {
      const { email, password } = request.body;
      
      const user = await fastify.db.getUserByEmail(email);
      if (!user) {
        reply.code(401).send({ error: 'Invalid credentials' });
        return;
      }

      // In a real application, verify password hash
      const isValidPassword = user.password_hash === `hashed_${password}`;
      if (!isValidPassword) {
        reply.code(401).send({ error: 'Invalid credentials' });
        return;
      }

      // In a real application, generate JWT token
      const token = `jwt_token_for_${user.id}`;

      // Don't return password hash
      const { password_hash: _, ...userResponse } = user;
      reply.code(200).send({
        user: userResponse,
        token
      });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get user profile
  fastify.get('/users/:id', async (request, reply) => {
    try {
      const user = await fastify.db.read('users', request.params.id);
      if (!user) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }

      // Don't return password hash
      const { password_hash: _, ...userResponse } = user;
      reply.code(200).send(userResponse);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update user profile
  fastify.put('/users/:id', async (request, reply) => {
    try {
      const existingUser = await fastify.db.read('users', request.params.id);
      if (!existingUser) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }

      // Don't allow password updates through this endpoint
      const { password, password_hash, ...updateData } = request.body;

      await fastify.db.update('users', request.params.id, updateData);
      const updatedUser = await fastify.db.read('users', request.params.id);
      
      // Don't return password hash
      const { password_hash: _, ...userResponse } = updatedUser;
      reply.code(200).send(userResponse);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get user preferences
  fastify.get('/users/:id/preferences', async (request, reply) => {
    try {
      const preferences = await fastify.db.query('user_preferences', { 
        user_id: request.params.id 
      });
      
      // Convert to key-value object
      const preferencesObj = {};
      preferences.forEach(pref => {
        preferencesObj[pref.key] = pref.value;
      });
      
      reply.code(200).send(preferencesObj);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update user preference
  fastify.put('/users/:id/preferences/:key', async (request, reply) => {
    try {
      const { value } = request.body;
      const { id: user_id, key } = request.params;

      // Check if preference exists
      const existingPrefs = await fastify.db.query('user_preferences', { 
        user_id, 
        key 
      });

      if (existingPrefs.length > 0) {
        // Update existing preference
        await fastify.db.update('user_preferences', existingPrefs[0].id, { value });
      } else {
        // Create new preference
        await fastify.db.create('user_preferences', {
          user_id,
          key,
          value
        });
      }

      reply.code(200).send({ key, value });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = userRoutes;