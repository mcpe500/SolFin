// backend/helpers/AuthHelper.js
// Purpose: Provides utility functions for authentication-related tasks.

class AuthHelper {
    /**
     * Hashes a plain-text password.
     * @param {string} password - The plain-text password.
     * @returns {Promise<string>} The hashed password.
     */
    static async hashPassword(password) {
        // Pseudocode: return hash(password)
        return `hashed_${password}`; // Placeholder
    }

    /**
     * Verifies a plain-text password against a hashed password.
     * @param {string} password - The plain-text password.
     * @param {string} hashedPassword - The hashed password to compare against.
     * @returns {Promise<boolean>} True if passwords match, false otherwise.
     */
    static async verifyPassword(password, hashedPassword) {
        // Pseudocode: return compare(password, hashedPassword)
        return `hashed_${password}` === hashedPassword; // Placeholder
    }

    /**
     * Generates a JWT token.
     * @param {object} payload - The payload to include in the token.
     * @returns {string} The generated JWT token.
     */
    static generateToken(payload) {
        // Pseudocode: return sign(payload, secret, options)
        return `jwt_token_for_${payload.userId}`; // Placeholder
    }

    /**
     * Verifies a JWT token.
     * @param {string} token - The JWT token to verify.
     * @returns {object} The decoded token payload.
     * @throws {Error} If the token is invalid or expired.
     */
    static verifyToken(token) {
        // Pseudocode: return verify(token, secret)
        if (token.startsWith("jwt_token_for_")) {
            return { userId: token.replace("jwt_token_for_", "") }; // Placeholder
        }
        throw new Error("Invalid token");
    }
}

module.exports = AuthHelper;