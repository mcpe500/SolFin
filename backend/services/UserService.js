const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
  constructor(dbRepository) {
    this.dbRepository = dbRepository;
    this.saltRounds = 10; // For bcrypt hashing
    this.jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey'; // Replace with a strong, environment-variable-based secret
  }

  /**
   * Registers a new user.
   * Hashes the password before storing the user in the database.
   * @param {object} userData - User data including email, password, first_name, last_name.
   * @returns {Promise<object>} The newly created user object, excluding the password hash.
   * @throws {Error} If a user with the given email already exists or if registration fails.
   */
  async registerUser(userData) {
    const { email, password, first_name, last_name } = userData;

    const existingUser = await this.dbRepository.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const password_hash = await bcrypt.hash(password, this.saltRounds);

    const user = await this.dbRepository.createUser({
      email,
      password_hash,
      first_name,
      last_name
    });

    const { password_hash: _, ...userResponse } = user;
    return userResponse;
  }

  /**
   * Authenticates a user and generates a JWT token upon successful login.
   * @param {string} email - The user's email.
   * @param {string} password - The user's plain-text password.
   * @returns {Promise<{user: object, token: string}>} An object containing the user details (without password hash) and a JWT token.
   * @throws {Error} If authentication fails due to invalid credentials.
   */
  async loginUser(email, password) {
    const user = await this.dbRepository.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, this.jwtSecret, { expiresIn: '1h' });

    const { password_hash: _, ...userResponse } = user;
    return { user: userResponse, token };
  }

  /**
   * Retrieves a user's profile by ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<object>} The user object, excluding the password hash, or null if not found.
   */
  async getUserProfile(userId) {
    const user = await this.dbRepository.read('users', userId);
    if (!user) {
      return null;
    }
    const { password_hash: _, ...userResponse } = user;
    return userResponse;
  }

  /**
   * Updates a user's profile.
   * Prevents password hash from being updated through this method.
   * @param {string} userId - The ID of the user to update.
   * @param {object} updateData - The data to update.
   * @returns {Promise<object>} The updated user object, excluding the password hash.
   * @throws {Error} If the user is not found or update fails.
   */
  async updateUserProfile(userId, updateData) {
    const existingUser = await this.dbRepository.read('users', userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const { password, password_hash, ...dataToUpdate } = updateData; // Prevent password updates

    await this.dbRepository.update('users', userId, dataToUpdate);
    const updatedUser = await this.dbRepository.read('users', userId);
    
    const { password_hash: _, ...userResponse } = updatedUser;
    return userResponse;
  }

  /**
   * Retrieves user preferences.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<object>} An object mapping preference keys to their values.
   */
  async getUserPreferences(userId) {
    const preferences = await this.dbRepository.query('user_preferences', { user_id: userId });
    
    const preferencesObj = {};
    preferences.forEach(pref => {
      preferencesObj[pref.key] = pref.value;
    });
    
    return preferencesObj;
  }

  /**
   * Updates or creates a user preference.
   * @param {string} userId - The ID of the user.
   * @param {string} key - The preference key.
   * @param {string} value - The preference value.
   * @returns {Promise<{key: string, value: string}>} The updated or created preference.
   * @throws {Error} If the update/create operation fails.
   */
  async updateUserPreference(userId, key, value) {
    const existingPrefs = await this.dbRepository.query('user_preferences', { 
      user_id: userId, 
      key 
    });

    if (existingPrefs.length > 0) {
      await this.dbRepository.update('user_preferences', existingPrefs[0].id, { value });
    } else {
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