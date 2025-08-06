# SolFin Database Technical Document

This document provides a detailed technical overview of the SolFin Database Service.

## 1. Overview

The SolFin Database Service is a dedicated microservice responsible for all data persistence operations within the SolFin financial planning application. It manages a sharded SQLite cluster and provides a RESTful API for the backend to interact with the data. This service abstracts the underlying database implementation, ensuring the backend remains database-agnostic.

## 2. Architecture and Technologies

*   **Database System:** Sharded SQLite Cluster
*   **Sharding Strategy:** Functional domain sharding (e.g., `users.db`, `accounts.db`, `transactions.db`, `pouches.db`, `transfers.db`)
*   **Load Balancing:** Read/write separation with multiple read replicas per shard
*   **API:** RESTful HTTP endpoints
*   **Management:** Migration system (versioning, rollback), Seeder system (sample data)
*   **Language:** TypeScript (shared between frontend & backend for `IDatabaseManager` interface)

## 3. IDatabaseManager Interface

The core of the database abstraction is the `IDatabaseManager` interface, defined in `00-overview.md` as part of the `@solfin/data` package. Any service layer requiring database access must accept an instance of `IDatabaseManager` via dependency injection.

```typescript
interface IDatabaseManager {
  // CRUD generic
  create<T>(table: string, data: Partial<T>): Promise<string>;
  read<T>(table: string, id: string): Promise<T | null>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  query<T>(table: string, filters: Filter): Promise<T[]>;

  // Special
  beginTx(): Promise<ITransaction>;
  migrate(schemaVersion: number): Promise<void>;
  dump(): Promise<Buffer>; // export
  restore(buf: Buffer): Promise<void>;
}
```

**Implementations:**

*   `SqliteManager` (local)
*   `PostgresManager`
*   `MysqlManager`
*   `MongoManager`
*   `JsonFileManager` (for dev/tests)

## 4. Functional Requirements (FR) - Database Service Perspective

The Database Service provides the persistence layer for all data related to the following functional requirements:

*   **FR-1 Accounts:** Stores account data.
*   **FR-2 Pouches:** Stores pouch data, including private/shared status and roles.
*   **FR-3 Transactions:** Stores transaction data, including splits, recurring flags, and related metadata.
*   **FR-4 Transfers:** Stores transfer data and ensures atomicity for linked transactions.
*   **FR-5 Recurring Income (Salary):** Stores recurring income schedules.
*   **FR-6 Asset vs Plain Spend:** Stores asset flags on transactions.
*   **FR-7 Goal-based Savings:** Stores goal definitions and progress.
*   **FR-8 Bill Calendar:** Stores recurring bill information.
*   **FR-9 Spending Heat-map:** Stores GPS data for transactions.
*   **FR-11 Receipt Scanning (backend mode):** Stores image hashes and receipt data.
*   **FR-12 Offline First & Conflict Resolution:** Manages data consistency and conflict resolution for synced data.
*   **FR-13 Auth Modes:** Stores user authentication data and preferences.

## 5. Non-Functional Requirements (NFR) - Database Service Responsibility

*   **NFR-2 Database Abstraction:** Provides the core abstraction layer for various database implementations.
*   **NFR-3 Security:** Device-level encryption for local DB (if SqliteManager is used locally).
*   **NFR-4 Performance:** Optimized for efficient data storage and retrieval, especially for large datasets (offline search through 5 years of data < 500ms).

## 6. Development Status (as per PROJECT-STATUS.md)

*   **Architecture Implementation:** Three-tier microservices architecture fully implemented with Sharded SQLite Database Service.
*   **Fully Implemented:**
    *   Database Service: 100% complete with sharding, migrations, seeders.
    *   Sharded architecture with domain-specific databases (`users.db`, `accounts.db`, `transactions.db`, `pouches.db`, `transfers.db`).
    *   Migration system with versioning and rollback support.
    *   Seeder system with demo data management.
    *   CLI tool for database management (`node cli.js`).
    *   RESTful API with comprehensive endpoints.
    *   Health monitoring for all shards.
    *   Connection pooling and efficient resource management.
    *   Load balancing with read/write separation.

## 7. API Endpoints (from api-spec.md)

### Database Service API Endpoints

*   **Generic CRUD**
    *   `POST /{table}` - Create record
    *   `GET /{table}/{id}` - Read record
    *   `PUT /{table}/{id}` - Update record
    *   `DELETE /{table}/{id}` - Delete record
    *   `POST /{table}/query` - Query with filters
*   **Specialized Operations**
    *   `GET /users/{userId}/accounts` - Get user accounts
    *   `GET /users/{userId}/transactions` - Get user transactions
    *   `POST /transactions/with-splits` - Create transaction with splits
*   **Management Operations**
    *   `POST /migrate` - Run migrations
    *   `POST /seed` - Run seeders
    *   `GET /health` - Health check

## 8. Next Steps for Database Service Development

As per `PROJECT-STATUS.md`, the Database Service is 100% complete. Future enhancements primarily relate to advanced features and production deployment.

## 9. Database Service Folder Structure

The SolFin Database Service is organized under the `solfin_database/` directory. Key sub-directories and files include:

*   `solfin_database/config/`: Configuration files for the database service.
    *   **Purpose**: Stores configuration settings for database connections, sharding logic, and schema definitions. This ensures flexibility in deploying with different database types or scaling strategies.
    *   **Key Files/Constructs**:
        *   `solfin_database/config/database.js`: Defines database connection settings, shard configurations, and possibly database type (SQLite, Postgres, etc.) mappings.
        *   `solfin_database/config/schemas.js`: Defines the database schemas for each functional shard. This would include table definitions, column types, and constraints, possibly using a schema definition language or ORM-agnostic format.
*   `solfin_database/lib/`: Core library files for database operations.
    *   **Purpose**: Contains the fundamental logic and classes responsible for managing database interactions, sharding, migrations, and seeding.
    *   **Key Files/Constructs**:
        *   `solfin_database/lib/DatabaseService.js`: Implements the core logic for handling data persistence requests.
            *   **Purpose**: Acts as the central coordinator for routing requests to appropriate shards and executing operations. It translates generic CRUD requests from the backend into shard-specific operations.
            *   **Key Functions/Methods**:
                *   `constructor(shardManagerInstance)`: Initializes with an instance of `ShardManager` to interact with individual shards.
                *   `create(table, data)`: Routes the create request to the correct shard based on the table name (e.g., `users` table goes to `users.db`).
                    *   **Logic/Pseudocode**:
                        ```
                        ASYNC FUNCTION create(table, data):
                            shard = this.shardManager.getShardForTable(table)
                            result = await shard.execute(`INSERT INTO ${table} (...) VALUES (...)`, data)
                            RETURN result.id
                        END FUNCTION
                        ```
                *   `read(table, id)`: Routes the read request to the correct shard.
                *   `update(table, id, data)`: Routes the update request.
                *   `delete(table, id)`: Routes the delete request.
                *   `query(table, filters)`: Routes complex queries to the appropriate shard, potentially performing joins across shards at the application level if necessary.
                *   `getUsersAccounts(userId)`: Specialized method for fetching user-specific data, demonstrating cross-shard query capabilities.
                *   `createTransactionWithSplits(data)`: Handles complex transactions involving multiple tables and shards.
            *   **Flow Diagram (Mermaid)**:
                ```mermaid
                graph TD
                    A[Backend API Request] --> B(DatabaseService.operation);
                    B --> C{ShardManager.getShardForTable};
                    C -- Shard Instance --> D(Shard.execute SQL);
                    D --> E[Database File (e.g., users.db)];
                    E -- Result --> D;
                    D --> B;
                    B --> A[Return Result];
                ```
        *   `solfin_database/lib/MigrationManager.js`: Manages database schema migrations.
            *   **Purpose**: Ensures that the database structure evolves correctly with application changes, applying and reverting schema changes in a controlled manner.
            *   **Key Functions/Methods**: `runMigrations(version)`, `rollbackMigrations(version)`.
        *   `solfin_database/lib/SeederManager.js`: Manages the seeding of demo data.
            *   **Purpose**: Populates the database with initial or demo data for development and testing purposes, ensuring a consistent starting state.
            *   **Key Functions/Methods**: `runSeeders()`.
        *   `solfin_database/lib/ShardManager.js`: Manages connections and operations for individual SQLite database shards.
            *   **Purpose**: Provides an interface to execute queries on specific shards, handles connection pooling, and determines which shard a given table belongs to.
            *   **Key Functions/Methods**: `constructor(shardConfig)`, `getConnection()`, `execute(query, params)`, `getShardForTable(tableName)`.
*   `solfin_database/migrations/`: Contains SQL or JavaScript files defining database schema changes.
    *   **Purpose**: Version-controlled scripts that define how the database schema should be created, altered, or dropped. Each file represents a single migration step.
    *   **Key Files/Constructs**:
        *   `solfin_database/migrations/001_create_initial_tables.js`: Defines the initial set of database tables and their schemas for all shards.
        *   `solfin_database/migrations/002_add_enhanced_features.js`: Defines schema changes for additional features or updates to existing tables.
        *   **Key Functions/Methods (within migration files)**:
            *   `up(db)`: Applies the schema changes (e.g., `CREATE TABLE` statements).
            *   `down(db)`: Reverts the schema changes (e.g., `DROP TABLE` statements).
*   `solfin_database/seeders/`: Contains scripts for populating the database with initial or demo data.
    *   **Purpose**: Scripts that insert sample data into the database for development, testing, or demonstration purposes.
    *   **Key Files/Constructs**:
        *   `solfin_database/seeders/001_demo_users.js`: Seeds initial demo user data into the `users.db` shard.
        *   `solfin_database/seeders/002_demo_accounts.js`: Seeds demo financial account data.
        *   `solfin_database/seeders/003_demo_pouches.js`: Seeds demo budget pouch data.
        *   `solfin_database/seeders/004_demo_transactions.js`: Seeds demo transaction data.
        *   `solfin_database/seeders/005_demo_transfers.js`: Seeds demo transfer data.
        *   **Key Functions/Methods (within seeder files)**:
            *   `seed(db)`: Inserts records into the respective database shard.
*   `solfin_database/.env`: Environment variables for configuration.
    *   **Purpose**: Stores environment-specific configuration for the database service, such as database file paths, sharding rules, or API ports.
*   `solfin_database/cli.js`: Command-line interface tool for database management.
    *   **Purpose**: Provides a command-line interface for developers and administrators to interact with the database service, perform migrations, run seeders, and check health.
    *   **Key Functions/Methods**: `main()`, `migrateCommand()`, `seedCommand()`, `healthCommand()`.
*   `solfin_database/Dockerfile`: Dockerfile for containerizing the database service.
    *   **Purpose**: Defines the Docker image for the SolFin Database Service, enabling consistent and isolated deployment across different environments.
*   `solfin_database/package.json`: Project dependencies and scripts.
    *   **Purpose**: Manages Node.js dependencies specific to the database service and defines scripts for running the service or CLI tools.