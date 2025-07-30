# Offline First & Conflict Resolution

This section explains how SolFin operates in an offline-first manner and how it handles data synchronization and conflict resolution (FR-12).

## Offline-First Principle

SolFin is designed to work fully offline first. This means:

*   **Local Storage:** All your data, including accounts, pouches, transactions, and transfers, is initially stored in a local SQLite database on your device.
*   **Uninterrupted Use:** You can continue to use the app, create new entries, edit existing ones, and perform all core functions even without an internet connection. This ensures a smooth and reliable user experience regardless of network availability.

## Data Synchronization

When you choose to log in (FR-13), SolFin enables optional synchronization with a backend.

*   **Transparent Sync:** All offline data is queued and transparently synchronized with the backend when connectivity returns. This process happens automatically in the background.
*   **Sync Layer:** A dedicated sync layer is responsible for pushing your local changes to the backend and pulling server changes to your device.

## Conflict Resolution (LWW + User Override Prompt)

In a multi-device or collaborative environment, conflicts can arise when the same data is modified both locally and on the server. SolFin employs a robust conflict resolution strategy:

*   **Last Write Wins (LWW):** The primary strategy is "Last Write Wins." This means that in case of a conflict, the most recent change (based on timestamp) will be preserved.
*   **User Override Prompt:** While LWW is the default, SolFin provides a user override prompt for critical conflicts. If a conflict cannot be resolved automatically or if it involves sensitive data, you will be prompted to review the conflicting versions and manually choose which version to keep. This ensures that you always have the final say over your data.
*   **Data Integrity:** The conflict resolution mechanism is designed to maintain data integrity and minimize data loss, providing a reliable and consistent financial record.