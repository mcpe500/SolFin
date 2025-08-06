// backend/controllers/AccountController.js
// Purpose: Handles all account-related API requests.

const DatabaseRepository = require('../repositories/DatabaseRepository');
const ValidationHelper = require('../helpers/ValidationHelper');

class AccountController {
    /**
     * Retrieves accounts for a user.
     * @param {object} request - The Fastify request object.
     * @param {object} reply - The Fastify reply object.
     */
    static async getAccounts(request, reply) {
        try {
            // 1. Extract user ID from authenticated request (e.g., request.user.id)
            const userId = request.user.id;
            // 2. Call the DatabaseRepository to fetch accounts for the user
            const accounts = await DatabaseRepository.query("accounts", { userId: userId });
            // 3. Respond with the fetched accounts
            reply.send(accounts);
        } catch (error) {
            console.error("Error in AccountController.getAccounts:", error);
            reply.code(500).send({ message: "Internal Server Error" });
        }
    }

    /**
     * Creates a new account.
     * @param {object} request - The Fastify request object.
     * @param {object} reply - The Fastify reply object.
     */
    static async createAccount(request, reply) {
        try {
            // 1. Extract account data from request body
            const accountData = request.body;
            // 2. Validate account data using ValidationHelper
            ValidationHelper.validateAccountData(accountData);
            // 3. Assign user ID from authenticated request to account data
            accountData.userId = request.user.id;
            // 4. Call the DatabaseRepository to create the new account
            const newAccount = await DatabaseRepository.create("accounts", accountData);
            // 5. Respond with the newly created account and 201 status
            reply.code(201).send(newAccount);
        } catch (error) {
            console.error("Error in AccountController.createAccount:", error);
            // More granular error handling can be added here (e.g., 400 for validation errors)
            reply.code(500).send({ message: "Internal Server Error" });
        }
    }

    /**
     * Retrieves a specific account by ID.
     * @param {object} request - The Fastify request object.
     * @param {object} reply - The Fastify reply object.
     */
    static async getAccountById(request, reply) {
        try {
            // 1. Extract account ID from request parameters
            const accountId = request.params.id;
            // 2. Extract user ID from authenticated request
            const userId = request.user.id;
            // 3. Call the DatabaseRepository to read the account
            const account = await DatabaseRepository.read("accounts", accountId);
            // 4. Check if account exists and belongs to the user
            if (!account || account.userId !== userId) {
                reply.code(404).send({ message: "Account not found or unauthorized" });
                return;
            }
            // 5. Respond with the fetched account
            reply.send(account);
        } catch (error) {
            console.error("Error in AccountController.getAccountById:", error);
            reply.code(500).send({ message: "Internal Server Error" });
        }
    }

    /**
     * Updates an existing account.
     * @param {object} request - The Fastify request object.
     * @param {object} reply - The Fastify reply object.
     */
    static async updateAccount(request, reply) {
        try {
            // 1. Extract account ID from request parameters
            const accountId = request.params.id;
            // 2. Extract updated data from request body
            const updates = request.body;
            // 3. Extract user ID from authenticated request
            const userId = request.user.id;
            // 4. Validate update data
            ValidationHelper.validateAccountData(updates); // Re-use or have specific update validation
            // 5. Verify ownership before updating
            const existingAccount = await DatabaseRepository.read("accounts", accountId);
            if (!existingAccount || existingAccount.userId !== userId) {
                reply.code(403).send({ message: "Unauthorized to update this account" });
                return;
            }
            // 6. Call the DatabaseRepository to update the account
            await DatabaseRepository.update("accounts", accountId, updates);
            // 7. Respond with 200 OK or updated object
            reply.send({ message: "Account updated successfully" });
        } catch (error) {
            console.error("Error in AccountController.updateAccount:", error);
            reply.code(500).send({ message: "Internal Server Error" });
        }
    }

    /**
     * Deletes an account.
     * @param {object} request - The Fastify request object.
     * @param {object} reply - The Fastify reply object.
     */
    static async deleteAccount(request, reply) {
        try {
            // 1. Extract account ID from request parameters
            const accountId = request.params.id;
            // 2. Extract user ID from authenticated request
            const userId = request.user.id;
            // 3. Verify ownership before deleting
            const existingAccount = await DatabaseRepository.read("accounts", accountId);
            if (!existingAccount || existingAccount.userId !== userId) {
                reply.code(403).send({ message: "Unauthorized to delete this account" });
                return;
            }
            // 4. Call the DatabaseRepository to delete the account
            await DatabaseRepository.delete("accounts", accountId);
            // 5. Respond with 204 No Content
            reply.code(204).send();
        } catch (error) {
            console.error("Error in AccountController.deleteAccount:", error);
            reply.code(500).send({ message: "Internal Server Error" });
        }
    }
}

module.exports = AccountController;