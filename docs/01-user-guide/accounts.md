# Accounts

This section details how to manage your accounts in SolFin.

## Creating an Account (FR-1)

Each account in SolFin allows you to track different types of financial holdings. To create a new account:

1.  **Navigate to the Accounts section:** Access this from the main dashboard or navigation menu.
2.  **Add New Account:** Click on the "Add New Account" button or similar prompt.
3.  **Provide Account Details:**
    *   **Currency:** Select the primary currency for this account (e.g., USD, EUR, IDR). This ensures accurate financial tracking for multi-currency users.
    *   **Type:** Choose the type of account that best describes it. Options include:
        *   `Cash`: For physical money you hold.
        *   `Savings`: For bank savings accounts.
        *   `Credit`: For credit cards or lines of credit.
        *   `Loan`: For loans you have taken out.
        *   `Crypto`: For cryptocurrency holdings.
        *   ... (Other types can be added as needed)
    *   **Initial Balance:** Enter the starting amount of money in this account. For credit accounts or loans, this might be a negative value or the initial credit limit/loan amount.
4.  **Save Account:** Confirm and save your new account.

## Account Management (CRUD - Create, Read, Update, Delete)

SolFin supports full CRUD operations for accounts:

*   **Create:** As described above.
*   **Read:** View details of any existing account from the accounts list.
*   **Update:** Modify account details such as type, currency, or current balance (though balance is usually updated via transactions).
*   **Delete:** Remove an account. (Note: Deleting an account may affect linked transactions and historical data. Consider archiving or transferring balances before deletion for data integrity.)

## Account Usage

Accounts are fundamental to tracking your finances. All transactions (income, expenses, transfers) are linked to one or more accounts, providing a clear overview of your financial position.