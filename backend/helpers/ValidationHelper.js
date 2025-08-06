// backend/helpers/ValidationHelper.js
// Purpose: Provides utility functions for input validation.

class ValidationHelper {
    /**
     * Validates user data.
     * @param {object} userData - The user data to validate.
     * @throws {Error} If validation fails.
     */
    static validateUserData(userData) {
        if (!userData.email || !userData.password) {
            throw new Error("Email and password are required.");
        }
        // Add more complex validation rules (e.g., email format, password strength)
        console.log("User data validated successfully.");
    }

    /**
     * Validates account data.
     * @param {object} accountData - The account data to validate.
     * @throws {Error} If validation fails.
     */
    static validateAccountData(accountData) {
        if (!accountData.name || !accountData.currency || !accountData.type || typeof accountData.initialBalance !== 'number') {
            throw new Error("Account name, currency, type, and initial balance are required.");
        }
        // Add more complex validation rules
        console.log("Account data validated successfully.");
    }

    // Add validation methods for other entities (e.g., transactions, pouches, goals)
    static validateTransactionData(transactionData) {
        if (!transactionData.amount || !transactionData.currency || !transactionData.date_time || !transactionData.accountId) {
            throw new Error("Transaction amount, currency, date, and account are required.");
        }
        console.log("Transaction data validated successfully.");
    }

    static validatePouchData(pouchData) {
        if (!pouchData.name) {
            throw new Error("Pouch name is required.");
        }
        console.log("Pouch data validated successfully.");
    }

    static validateGoalData(goalData) {
        if (!goalData.title || !goalData.target_amount || !goalData.target_date) {
            throw new Error("Goal title, target amount, and target date are required.");
        }
        console.log("Goal data validated successfully.");
    }

    static validateTransferData(transferData) {
        if (!transferData.source_account_id || !transferData.destination_account_id || !transferData.amount || !transferData.currency) {
            throw new Error("Transfer source, destination, amount, and currency are required.");
        }
        console.log("Transfer data validated successfully.");
    }
}

module.exports = ValidationHelper;