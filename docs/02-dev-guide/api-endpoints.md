# SolFin API Endpoints Reference

This document provides a comprehensive reference for all API endpoints in the SolFin application.

## Architecture Overview

SolFin uses a three-tier architecture:
- **Frontend (Ionic React)** → **Backend API (Node.js/Fastify)** → **Database Service (Sharded SQLite)**

## Backend API Endpoints (Port 3001)

### User Management

#### Authentication
**Note:** The following examples use placeholder credentials for demonstration purposes only. Do not use these in a production environment.

```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### User Profile
```http
GET /users/{id}
PUT /users/{id}
GET /users/{id}/preferences
PUT /users/{id}/preferences/{key}
```

### Account Management

```http
GET /accounts?user_id={userId}     # Get user's accounts
POST /accounts                     # Create account
GET /accounts/{id}                 # Get specific account
PUT /accounts/{id}                 # Update account
DELETE /accounts/{id}              # Delete account
```

**Account Object:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Main Checking",
  "type": "savings",
  "currency": "USD",
  "initial_balance": 5000.00,
  "current_balance": 4500.00,
  "is_active": true
}
```

### Transaction Management

```http
GET /transactions?user_id={userId}&limit={limit}  # Get user's transactions
POST /transactions                                # Create transaction
POST /transactions/with-splits                    # Create transaction with pouch splits
GET /transactions/{id}                            # Get specific transaction
PUT /transactions/{id}                            # Update transaction
DELETE /transactions/{id}                         # Delete transaction
```

**Transaction Object:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "account_id": "uuid",
  "amount": -45.67,
  "currency": "USD",
  "description": "Grocery Store Purchase",
  "category": "Groceries",
  "tags": "food,weekly",
  "transaction_date": "2025-01-01T10:00:00Z",
  "merchant_name": "SuperMart",
  "payment_method": "debit_card"
}
```

**Transaction with Splits:**
```json
{
  "transaction": {
    "user_id": "uuid",
    "account_id": "uuid",
    "amount": -100.00,
    "description": "Mixed Purchase"
  },
  "splits": [
    {
      "pouch_id": "uuid",
      "amount": 60.00
    },
    {
      "pouch_id": "uuid",
      "amount": 40.00
    }
  ]
}
```

### Pouch Management (Budget Envelopes)

```http
GET /pouches?user_id={userId}      # Get user's pouches
POST /pouches                      # Create pouch
GET /pouches/{id}                  # Get specific pouch
PUT /pouches/{id}                  # Update pouch
DELETE /pouches/{id}               # Delete pouch
```

**Pouch Object:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Groceries",
  "description": "Monthly grocery budget",
  "type": "private",
  "budget_amount": 800.00,
  "budget_period": "monthly",
  "color": "#4CAF50",
  "icon": "basket"
}
```

### Goal Management

```http
GET /goals?user_id={userId}        # Get user's goals
POST /goals                        # Create goal
GET /goals/{id}                    # Get specific goal
PUT /goals/{id}                    # Update goal
DELETE /goals/{id}                 # Delete goal
PATCH /goals/{id}/progress         # Update goal progress
```

**Goal Object:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "pouch_id": "uuid",
  "title": "Summer Vacation",
  "description": "Family trip to Europe",
  "target_amount": 5000.00,
  "current_amount": 1200.00,
  "target_date": "2025-07-01",
  "priority": 1,
  "is_achieved": false
}
```

### Transfer Management

```http
GET /transfers?user_id={userId}    # Get user's transfers
POST /transfers                    # Create transfer
GET /transfers/{id}                # Get specific transfer
PUT /transfers/{id}                # Update transfer
DELETE /transfers/{id}             # Delete transfer
```

**Transfer Object:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "from_account_id": "uuid",
  "to_account_id": "uuid",
  "amount": 500.00,
  "currency": "USD",
  "description": "Emergency Fund Contribution",
  "transfer_date": "2025-01-01T10:00:00Z",
  "status": "completed",
  "transfer_type": "internal"
}
```

### Admin Endpoints

```http
POST /admin/migrate                # Run database migrations
POST /admin/migrate/rollback       # Rollback migration
GET /admin/migrate/status          # Get migration status
POST /admin/seed                   # Run database seeders
POST /admin/seed/reset             # Reset seeders
GET /admin/seed/status             # Get seeder status
GET /admin/health                  # Check database health
POST /admin/setup                  # Complete database setup
```

## Database Service Endpoints (Port 3002)

### Health Check
```http
GET /health
```

### Generic CRUD Operations
```http
POST /{table}                      # Create record
GET /{table}/{id}                  # Read record by ID
PUT /{table}/{id}                  # Update record
DELETE /{table}/{id}               # Delete record
POST /{table}/query                # Query with filters
```

### Specialized Database Operations
```http
GET /users/{userId}/accounts       # Get user's accounts
GET /users/{userId}/transactions   # Get user's transactions
POST /transactions/with-splits     # Create transaction with splits
```

### Migration Management
```http
POST /migrate                      # Run migrations
POST /migrate/rollback             # Rollback migration
GET /migrate/status                # Get migration status
```

### Seeder Management
```http
POST /seed                         # Run seeders
POST /seed/reset                   # Reset seeders
POST /seed/refresh                 # Refresh seeders
GET /seed/status                   # Get seeder status
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (for DELETE operations)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

## Query Parameters

### Pagination
```http
GET /transactions?user_id={userId}&limit=50&offset=0
```

### Filtering
```http
GET /transactions?user_id={userId}&category=Groceries&start_date=2025-01-01
```

### Sorting
```http
GET /transactions?user_id={userId}&sort=date&order=desc
```

## Authentication

Currently, the API uses simple token-based authentication. In production, implement proper JWT tokens with:
- Access tokens (short-lived)
- Refresh tokens (long-lived)
- Proper password hashing (bcrypt)
- Rate limiting
- HTTPS enforcement

## Rate Limiting

Consider implementing rate limiting for production:
- 100 requests per minute per IP for general endpoints
- 10 requests per minute for authentication endpoints
- 1000 requests per minute for authenticated users

## CORS Configuration

The backend should be configured to allow requests from:
- `http://localhost:8100` (Ionic dev server)
- Your production frontend domain
- Mobile app origins (for Capacitor)

## WebSocket Support (Future)

For real-time features like:
- Live transaction updates
- Shared pouch notifications
- Goal progress updates

Consider adding WebSocket endpoints:
```http
WS /ws/user/{userId}               # User-specific updates
WS /ws/pouch/{pouchId}             # Pouch-specific updates
```