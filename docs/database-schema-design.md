# SolFin Database Schema Design

This document details the planned database schema for the SolFin application, including table names, primary keys, foreign keys, and relevant columns, derived from the functional requirements and existing project structure.

## 1. Overview

The SolFin Database Service utilizes a sharded SQLite cluster, with functional domains mapping to individual SQLite databases. This design outlines the tables within these databases, focusing on data integrity and relationships.

## 2. Shard-wise Schema Breakdown

As per `PROJECT-STATUS.md` and `00-overview.md`, the sharded architecture includes:
*   `users.db` - User accounts, sessions, preferences
*   `accounts.db` - Financial accounts and balances
*   `transactions.db` - Transaction records and splits
*   `pouches.db` - Budget pouches, goals, and sharing
*   `transfers.db` - Account-to-account transfers

### 2.1. `users.db` Schema

**Table: `users`**
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `email` (TEXT, UNIQUE, NOT NULL)
*   `password_hash` (TEXT, NOT NULL)
*   `name` (TEXT)
*   `preferences` (JSON)
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

**Table: `sessions`**
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `user_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `users(id)`)
*   `token` (TEXT, UNIQUE, NOT NULL)
*   `expires_at` (INTEGER, NOT NULL)
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

### 2.2. `accounts.db` Schema

**Table: `accounts`**
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `user_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `users(id)`)
*   `name` (TEXT, NOT NULL)
*   `currency` (TEXT, NOT NULL)
*   `type` (TEXT, NOT NULL) -- e.g., 'cash', 'savings', 'credit', 'loan', 'crypto'
*   `initial_balance` (REAL, NOT NULL)
*   `current_balance` (REAL, NOT NULL)
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

### 2.3. `transactions.db` Schema

**Table: `transactions`**
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `user_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `users(id)`)
*   `account_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `accounts(id)`)
*   `amount` (REAL, NOT NULL)
*   `currency` (TEXT, NOT NULL)
*   `date_time` (INTEGER, NOT NULL) -- Unix timestamp
*   `description` (TEXT)
*   `category` (TEXT)
*   `tags` (TEXT) -- Comma-separated string or JSON array
*   `gps_latitude` (REAL)
*   `gps_longitude` (REAL)
*   `image_hash` (TEXT) -- SHA256 hash of receipt image
*   `is_expense` (INTEGER, NOT NULL) -- 1 for expense, 0 for income
*   `is_recurring` (INTEGER, NOT NULL, DEFAULT 0) -- 1 if recurring
*   `is_asset` (INTEGER, NOT NULL, DEFAULT 0) -- 1 if asset
*   `original_transaction_id` (TEXT, FOREIGN KEY REFERENCES `transactions(id)`) -- For linked recurring transactions
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `deleted_at` (INTEGER) -- Soft delete timestamp

**Table: `transaction_splits`**
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `transaction_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `transactions(id)`)
*   `pouch_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `pouches(id)`)
*   `amount` (REAL, NOT NULL)
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

### 2.4. `pouches.db` Schema

**Table: `pouches`**
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `user_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `users(id)`)
*   `name` (TEXT, NOT NULL)
*   `budget_amount` (REAL)
*   `current_amount` (REAL)
*   `is_shared` (INTEGER, NOT NULL, DEFAULT 0) -- 1 if shared
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

**Table: `pouch_members`** (for shared pouches)
*   `pouch_id` (TEXT, PRIMARY KEY, NOT NULL, FOREIGN KEY REFERENCES `pouches(id)`)
*   `user_id` (TEXT, PRIMARY KEY, NOT NULL, FOREIGN KEY REFERENCES `users(id)`)
*   `role` (TEXT, NOT NULL) -- 'Owner', 'Editor', 'Viewer'
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

**Table: `goals`**
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `user_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `users(id)`)
*   `title` (TEXT, NOT NULL)
*   `target_amount` (REAL, NOT NULL)
*   `target_date` (INTEGER, NOT NULL) -- Unix timestamp
*   `linked_pouch_id` (TEXT, FOREIGN KEY REFERENCES `pouches(id)`)
*   `current_progress` (REAL, NOT NULL, DEFAULT 0)
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

**Table: `recurring_bills`** (for Bill Calendar)
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `user_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `users(id)`)
*   `description` (TEXT, NOT NULL)
*   `amount` (REAL, NOT NULL)
*   `currency` (TEXT, NOT NULL)
*   `due_date` (INTEGER, NOT NULL) -- Next due date Unix timestamp
*   `frequency` (TEXT, NOT NULL) -- 'weekly', 'monthly', 'yearly', etc.
*   `last_paid_transaction_id` (TEXT, FOREIGN KEY REFERENCES `transactions(id)`)
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

### 2.5. `transfers.db` Schema

**Table: `transfers`**
*   `id` (TEXT, PRIMARY KEY, UUID)
*   `user_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `users(id)`)
*   `source_account_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `accounts(id)`)
*   `destination_account_id` (TEXT, NOT NULL, FOREIGN KEY REFERENCES `accounts(id)`)
*   `amount` (REAL, NOT NULL)
*   `currency` (TEXT, NOT NULL)
*   `date_time` (INTEGER, NOT NULL)
*   `description` (TEXT)
*   `linked_transaction_ids` (TEXT) -- JSON array of transaction IDs (for both debit and credit)
*   `created_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
*   `updated_at` (INTEGER, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

## 3. Data Types and Constraints

*   **TEXT**: Used for UUIDs, emails, names, descriptions, categories, tags, currency codes, roles, frequencies.
*   **REAL**: Used for monetary amounts, balances, latitude, longitude, progress.
*   **INTEGER**: Used for timestamps (Unix epoch seconds), and boolean flags (0 or 1).
*   **PRIMARY KEY**: Ensures uniqueness and provides a primary identifier for each record.
*   **FOREIGN KEY REFERENCES**: Enforces relational integrity between tables across different shards (handled at the application level in a sharded environment).
*   **UNIQUE**: Ensures uniqueness for `email` and `token`.
*   **NOT NULL**: Ensures required fields are always present.
*   **DEFAULT CURRENT_TIMESTAMP**: Automatically sets the creation and update timestamps.

## 4. Key Considerations for Sharding

*   **User-centric Sharding**: Most data is implicitly sharded by `user_id`, meaning a user's accounts, transactions, pouches, and transfers will reside within shards accessible via their user ID.
*   **Cross-Shard Relationships**: Foreign key relationships between tables in different shards (e.g., `user_id` in `accounts.db` referencing `users.db`) will be managed by the application logic within the `DatabaseService.js` and `DatabaseRepository.js`, rather than relying on native SQLite foreign key constraints across separate files.
*   **Transactions with Splits**: `transaction_splits` explicitly links to `pouches(id)` and `transactions(id)`, ensuring atomicity and consistency for split transactions.

## 5. Database Manager (`IDatabaseManager`) Interface

As defined in `00-overview.md`, the `IDatabaseManager` interface (implemented by `SqliteManager`, `PostgresManager`, `MysqlManager`, `MongoManager`, `JsonFileManager`) ensures a consistent API for database operations, regardless of the underlying database. The schema defined above adheres to the generic CRUD operations and specialized methods expected by this interface.

## 6. Future Schema Enhancements

*   **Receipt Data Storage**: If raw receipt data (beyond image hash) needs to be stored, consider a dedicated table or a blob storage solution.
*   **Depreciation Schedules (FR-6)**: Additional tables or columns for managing asset depreciation.
*   **Shared Pouch Permissions**: More granular permission management for shared pouches beyond basic roles.
*   **Audit Logs**: Tables for tracking changes to sensitive data.