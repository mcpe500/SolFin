# Database Manager (`@solfin/data`)

This document details the architecture and usage of the `DatabaseManager` service, which is a core component for all persistence operations in SolFin (NFR-2).

## Purpose and Scope

The `DatabaseManager` acts as an abstraction layer for all database interactions. This design ensures that:

*   **Database Agnosticism:** The application logic is decoupled from the underlying database technology.
*   **Flexibility:** We can easily swap between different database implementations (SQLite, MySQL, PostgreSQL, MongoDB, JSON flat-file) without significant changes to the application code.
*   **Centralized Persistence Logic:** All data persistence goes through a single, well-defined interface, simplifying maintenance and ensuring consistency.

## `IDatabaseManager` Interface

The core of the `DatabaseManager` is the `IDatabaseManager` TypeScript interface, defined in the `@solfin/data` package. This interface specifies the contract for all database operations:

```typescript
interface IDatabaseManager {
  // CRUD generic
  create<T>(table: string, data: Partial<T>): Promise<string>;
  read<T>(table: string, id: string): Promise<T | null>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  query<T>(table: string, filters: Filter): Promise<T[]>;

  // Special Operations
  beginTx(): Promise<ITransaction>; // Starts a database transaction
  migrate(schemaVersion: number): Promise<void>; // Handles database schema migrations
  dump(): Promise<Buffer>; // Exports the entire database content (e.g., for backup or migration)
  restore(buf: Buffer): Promise<void>; // Restores database content from a buffer
}
```

*   `create<T>(table: string, data: Partial<T>): Promise<string>`: Inserts a new record into the specified table and returns its ID.
*   `read<T>(table: string, id: string): Promise<T | null>`: Retrieves a single record by its ID from the specified table.
*   `update<T>(table: string, id: string, data: Partial<T>): Promise<void>`: Updates an existing record in the specified table.
*   `delete(table: string, id: string): Promise<void>`: Deletes a record by its ID from the specified table.
*   `query<T>(table: string, filters: Filter): Promise<T[]>`: Retrieves multiple records from the specified table based on provided filters. (The `Filter` type would be defined in `@solfin/shared-types`).

## Implementations

The `IDatabaseManager` interface will have several concrete implementations, allowing for different database backends:

*   **`SqliteManager` (local):** Used for local, offline-first data storage on the client devices (mobile and web PWA). This will likely integrate with WatermelonDB for efficient local data handling.
*   **`PostgresManager`:** For PostgreSQL database backend.
*   **`MysqlManager`:** For MySQL database backend.
*   **`MongoManager`:** For MongoDB (NoSQL) database backend.
*   **`JsonFileManager` (for dev/tests):** A simple file-based implementation useful for development and testing purposes, allowing data to be stored and retrieved from JSON files.

## Usage Rule: Dependency Injection

A critical architectural rule for SolFin is that **any service layer that needs database access must accept an instance of `IDatabaseManager` via dependency injection.** This means:

*   Services will not directly instantiate database-specific managers.
*   The appropriate `IDatabaseManager` implementation will be provided to the service at runtime, depending on the environment (e.g., `SqliteManager` for the client, `PostgresManager` for the backend).
*   This promotes testability, modularity, and adherence to the Dependency Inversion Principle.

## Relationship with Backend API

The `DatabaseManager` service within the backend API (see Section 4: High-Level Architecture) will be responsible for orchestrating interactions with the chosen backend database (MySQL, PostgreSQL, MongoDB).