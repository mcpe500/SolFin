const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Custom error class for when a user with the given email already exists.
 * @extends Error
 */
class UserExistsError extends Error {
  constructor(message = 'User already exists with this email') {
    super(message);
    this.name = 'UserExistsError';
    this.statusCode = 409; // Conflict
  }
}

/**
 * Custom error class for invalid authentication credentials.
 * @extends Error
 */
class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
    this.statusCode = 401; // Unauthorized
  }
}

class UserService {
  /**
   * @property {object} dbRepository - Instance of DatabaseRepository for database interactions.
   * @property {number} saltRounds - The number of salt rounds for bcrypt hashing.
   * @property {string} jwtSecret - The secret key for JWT signing and verification.
   */
  constructor(dbRepository) {
    this.dbRepository = dbRepository;
    this.saltRounds = 10; // For bcrypt hashing
    // It is CRITICAL to use a strong, environment-variable-based secret in production.
    // The fallback 'supersecretjwtkey' is for development only.
    this.jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey';
  }

  /**
   * Registers a new user in the system.
   * Hashes the provided password before storing the user's data in the database.
   * @param {object} userData - An object containing user registration details.
   * @param {string} userData.email - The user's email address (must be unique).
   * @param {string} userData.password - The user's plain-text password.
   * @param {string} userData.first_name - The user's first name.
   * @param {string} userData.last_name - The user's last name.
   * @returns {Promise<object>} A Promise that resolves with the newly created user object,
   *                            excluding the password hash for security.
   * @throws {UserExistsError} If a user with the provided email already exists.
   * @throws {Error} If there's an issue during password hashing or database interaction.
   */
  async registerUser(userData) {
    const { email, password, first_name, last_name } = userData;

    // Check if a user with the given email already exists
    const existingUser = await this.dbRepository.getUserByEmail(email);
    if (existingUser) {
      throw new UserExistsError();
    }

    // Hash the user's password
    const password_hash = await bcrypt.hash(password, this.saltRounds);

    // Create the user record in the database
    const user = await this.dbRepository.createUser({
      email,
      password_hash,
      first_name,
      last_name
    });

    // Exclude the password hash from the response for security
    const { password_hash: _, ...userResponse } = user;
    return userResponse;
  }

  /**
   * Authenticates a user by verifying their email and password.
   * Upon successful authentication, a JSON Web Token (JWT) is generated and returned.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's plain-text password.
   * @returns {Promise<{user: object, token: string}>} A Promise that resolves with an object
   *                                                  containing the user's details (without password hash)
   *                                                  and the generated JWT token.
   * @throws {InvalidCredentialsError} If the provided email or password do not match a registered user.
   * @throws {Error} If there's an issue during password comparison or token generation.
   */
  async loginUser(email, password) {
    // Retrieve the user by email from the database
    const user = await this.dbRepository.getUserByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Compare the provided password with the stored hashed password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign({ id: user.id, email: user.email }, this.jwtSecret, { expiresIn: '1h' });

    // Exclude the password hash from the user response
    const { password_hash: _, ...userResponse } = user;
    return { user: userResponse, token };
  }

  /**
   * Retrieves a user's profile information by their unique ID.
   * @param {string} userId - The unique identifier of the user.
   * @returns {Promise<object|null>} A Promise that resolves with the user's profile object
   *                                 (excluding the password hash), or `null` if the user is not found.
   * @throws {Error} If there's an issue during database interaction.
   */
  async getUserProfile(userId) {
    const user = await this.dbRepository.read('users', userId);
    if (!user) {
      return null;
    }
    // Exclude the password hash from the user response
    const { password_hash: _, ...userResponse } = user;
    return userResponse;
  }

  /**
   * Updates an existing user's profile information.
   * This method explicitly prevents updates to the password hash for security reasons;
   * password changes should be handled by a dedicated function.
   * @param {string} userId - The unique identifier of the user to update.
   * @param {object} updateData - An object containing the fields and their new values to update.
   * @returns {Promise<object>} A Promise that resolves with the updated user object,
   *                            excluding the password hash.
   * @throws {Error} If the user is not found or if the update operation fails.
   */
  async updateUserProfile(userId, updateData) {
    const existingUser = await this.dbRepository.read('users', userId);
    if (!existingUser) {
      throw new Error('User not found'); // Consider a more specific error like UserNotFoundError
    }

    // Destructure to prevent password or password_hash from being updated through this method
    const { password, password_hash, ...dataToUpdate } = updateData;

    await this.dbRepository.update('users', userId, dataToUpdate);
    const updatedUser = await this.dbRepository.read('users', userId);
    
    // Exclude the password hash from the updated user response
    const { password_hash: _, ...userResponse } = updatedUser;
    return userResponse;
  }

  /**
   * Retrieves all preferences for a specific user.
   * @param {string} userId - The unique identifier of the user.
   * @returns {Promise<object>} A Promise that resolves with an object where keys are
   *                            preference names and values are their corresponding settings.
   * @throws {Error} If there's an issue during database interaction.
   */
  async getUserPreferences(userId) {
    const preferences = await this.dbRepository.query('user_preferences', { user_id: userId });
    
    // Transform the array of preference objects into a key-value pair object
    const preferencesObj = {};
    preferences.forEach(pref => {
      preferencesObj[pref.key] = pref.value;
    });
    
    return preferencesObj;
  }

  /**
   * Updates an existing user preference or creates a new one if it doesn't exist.
   * @param {string} userId - The unique identifier of the user.
   * @param {string} key - The name of the preference to update or create.
   * @param {string} value - The new value for the preference.
   * @returns {Promise<{key: string, value: string}>} A Promise that resolves with the
   *                                                   updated or newly created preference's key and value.
   * @throws {Error} If the update or creation operation fails.
   */
  async updateUserPreference(userId, key, value) {
    // Check if the preference already exists for the user
    const existingPrefs = await this.dbRepository.query('user_preferences', {
      user_id: userId,
      key
    });

    if (existingPrefs.length > 0) {
      // If preference exists, update its value
      await this.dbRepository.update('user_preferences', existingPrefs[0].id, { value });
    } else {
      // If preference does not exist, create a new one
      await this.dbRepository.create('user_preferences', {
        user_id: userId,
        key,
        value
      });
    }
    return { key, value };
  }
}

module.exports = UserService;