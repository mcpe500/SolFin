# Pouches

This section explains how to use pouches to manage your budget and expenses in SolFin.

## What are Pouches? (FR-2)

In SolFin, a "pouch" is a virtual envelope or budget bucket designed to help you categorize and manage your funds. You can create pouches for various purposes, such as "Groceries," "Rent," "Entertainment," or "Savings."

## Creating a Pouch (CRUD)

To create a new pouch:

1.  **Navigate to the Pouches section:** Access this from the main dashboard or navigation menu.
2.  **Add New Pouch:** Click on the "Add New Pouch" button.
3.  **Provide Pouch Details:**
    *   **Name:** Give your pouch a descriptive name (e.g., "Monthly Groceries").
    *   **Type:** Choose between:
        *   **Private:** Only visible and manageable by you.
        *   **Shared:** Can be shared with other users (real-time, multi-user functionality). This is part of Phase-2 development.
4.  **Save Pouch:** Confirm and save your new pouch.

## Pouch Management (CRUD)

SolFin supports full CRUD operations for pouches:

*   **Create:** As described above.
*   **Read:** View details and transactions associated with any existing pouch.
*   **Update:** Modify pouch details such as its name or type.
*   **Delete:** Remove a pouch. (Note: Deleting a pouch may affect linked transactions. Consider re-categorizing transactions before deletion for data integrity.)

## Shared Pouches (FR-2)

For shared pouches, you can define roles for other users:

*   **Owner:** Has full control over the pouch, including editing, viewing, and managing roles.
*   **Editor:** Can add, edit, and delete transactions within the pouch.
*   **Viewer:** Can only view transactions and the balance of the pouch.

Shared pouches enable real-time collaboration on budgets, making it easy for families or groups to track shared expenses.

## Splitting Transactions Across Pouches (FR-3)

SolFin allows you to split a single transaction across multiple pouches. This is useful when a purchase covers items from different budget categories. For example, a single supermarket receipt might include groceries (Groceries Pouch) and household items (Household Pouch).