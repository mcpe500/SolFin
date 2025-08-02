# SolFin API Specification

This document serves as the main entry point for the SolFin API Specification, detailing the communication between the Ionic React frontend and the Node.js backend.

## Three-Tier Architecture Communication

The SolFin application uses a three-tier architecture with clear separation of concerns:

### Frontend ↔ Backend Communication
The **Ionic React** frontend communicates with the **Node.js backend** through RESTful APIs for:
*   **Business Logic:** Authentication, validation, and application workflows
*   **Data Operations:** CRUD operations for Accounts, Pouches, Transactions, Transfers, and Goals
*   **Advanced Features:** Receipt scanning with Google Gemini-Flash integration
*   **Synchronization:** Offline-first data reconciliation

### Backend ↔ Database Service Communication
The **Node.js backend** communicates with the **SolFin Database Service** through:
*   **Repository Pattern:** Abstracted database operations via HTTP calls
*   **Sharded Operations:** Automatic routing to appropriate database shards
*   **Load Balancing:** Read/write separation for optimal performance
*   **Migration Management:** Database versioning and schema updates

## API Documentation

### Frontend API Endpoints (Backend)
The backend exposes RESTful endpoints for the frontend:

#### Account Management
- `GET /accounts?user_id={id}` - Get user's accounts
- `POST /accounts` - Create new account
- `GET /accounts/{id}` - Get specific account
- `PUT /accounts/{id}` - Update account
- `DELETE /accounts/{id}` - Delete account

#### Transaction Management
- `GET /transactions?user_id={id}` - Get user's transactions
- `POST /transactions` - Create transaction
- `POST /transactions/with-splits` - Create transaction with pouch splits
- `GET /transactions/{id}` - Get specific transaction
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction

#### Pouch Management
- `GET /pouches?user_id={id}` - Get user's pouches
- `POST /pouches` - Create pouch
- `GET /pouches/{id}` - Get specific pouch
- `PUT /pouches/{id}` - Update pouch
- `DELETE /pouches/{id}` - Delete pouch

#### Admin Endpoints
- `POST /admin/migrate` - Run database migrations
- `POST /admin/seed` - Run database seeders
- `GET /admin/health` - Check database service health
- `POST /admin/setup` - Complete database setup

### Database Service API Endpoints
The database service provides low-level data operations:

#### Generic CRUD
- `POST /{table}` - Create record
- `GET /{table}/{id}` - Read record
- `PUT /{table}/{id}` - Update record
- `DELETE /{table}/{id}` - Delete record
- `POST /{table}/query` - Query with filters

#### Specialized Operations
- `GET /users/{userId}/accounts` - Get user accounts
- `GET /users/{userId}/transactions` - Get user transactions
- `POST /transactions/with-splits` - Create transaction with splits

#### Management Operations
- `POST /migrate` - Run migrations
- `POST /seed` - Run seeders
- `GET /health` - Health check

Refer to the sub-sections for detailed information:

*   [OpenAPI Specification](03-api/openapi.yaml)
*   [Synchronization Protocol](03-api/sync-protocol.md)
*   [Database Service API](02-dev-guide/solfin-database.md)