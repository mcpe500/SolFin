# Backend Architecture - Clean Repository Pattern

This document describes the clean architecture of the SolFin backend, which uses the Repository Pattern to completely abstract database operations.

## Architecture Overview

The SolFin backend is designed with complete separation of concerns:

```
┌─────────────────────────┐
│   Frontend (Ionic)      │
└──────────┬──────────────┘
           │ HTTP/REST
┌──────────┴──────────────┐
│   Backend API (Node.js) │
│                         │
│  ┌─────────────────────┐│
│  │     Routes          ││  - User authentication
│  │  (Business Logic)   ││  - Input validation
│  │                     ││  - Response formatting
│  └──────────┬──────────┘│
│             │            │
│  ┌──────────┴──────────┐│
│  │  DatabaseRepository ││  - HTTP client to DB service
│  │  (Data Abstraction) ││  - Error handling
│  │                     ││  - Request/response mapping
│  └─────────────────────┘│
└──────────┬──────────────┘
           │ HTTP/REST
┌──────────┴──────────────┐
│  SolFin Database Service│
│  (Data Persistence)     │
└─────────────────────────┘
```

## Directory Structure

The backend has been completely cleaned of any direct database dependencies:

```
backend/
├── repositories/           # Data access layer
│   └── DatabaseRepository.js
├── routes/                # API endpoints
│   ├── userRoutes.js      # User authentication & profile
│   ├── accountRoutes.js   # Account management
│   ├── transactionRoutes.js # Transaction operations
│   ├── pouchRoutes.js     # Budget envelope management
│   ├── goalRoutes.js      # Goal tracking
│   ├── transferRoutes.js  # Account transfers
│   └── adminRoutes.js     # Database administration
├── node_modules/          # Dependencies (minimal)
├── .env                   # Environment configuration
├── .gitignore            # Git ignore rules
├── package.json          # Clean dependencies
└── server.js             # Application entry point
```

## Removed Components

The following database-related components have been completely removed:

### ❌ Removed Directories
- `config/` - Database configuration files
- `db/` - Direct database files
- `migrations/` - Database migrations (moved to database service)
- `models/` - Sequelize models (replaced with Repository Pattern)
- `seeders/` - Database seeders (moved to database service)
- `test/` - Old database-dependent tests
- `prisma/` - Prisma ORM files

### ❌ Removed Dependencies
- `@sequelize/sqlite3` - SQLite adapter for Sequelize
- `better-sqlite3` - Direct SQLite access
- `sequelize` - ORM framework
- `sequelize-cli` - Sequelize command line tools

### ✅ Retained Dependencies
- `axios` - HTTP client for database service communication
- `dotenv` - Environment variable management
- `fastify` - Web framework
- `jest` - Testing framework (dev dependency)
- `supertest` - API testing (dev dependency)

## Repository Pattern Implementation

### DatabaseRepository Class

The `DatabaseRepository` class provides complete abstraction from the database service:

```javascript
class DatabaseRepository {
  constructor() {
    this.baseURL = process.env.DATABASE_SERVICE_URL || 'http://localhost:3002';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Generic CRUD operations
  async create(table, data) { /* HTTP POST to database service */ }
  async read(table, id) { /* HTTP GET to database service */ }
  async update(table, id, data) { /* HTTP PUT to database service */ }
  async delete(table, id) { /* HTTP DELETE to database service */ }
  async query(table, filters) { /* HTTP POST to database service */ }

  // Specialized business operations
  async getUserAccounts(userId) { /* Business-specific queries */ }
  async createTransactionWithSplits(transaction, splits) { /* Complex operations */ }
  
  // Administrative operations
  async runMigrations() { /* Database management */ }
  async runSeeders() { /* Sample data management */ }
}
```

### Route Implementation

Routes focus purely on business logic and HTTP concerns:

```javascript
async function accountRoutes(fastify, options) {
  // Create Account
  fastify.post('/accounts', async (request, reply) => {
    try {
      // Input validation
      const account = await fastify.db.createAccount(request.body);
      reply.code(201).send(account);
    } catch (error) {
      // Error handling
      reply.code(500).send({ error: error.message });
    }
  });
  
  // No direct database code - all through repository
}
```

## Benefits of Clean Architecture

### 1. **Complete Separation of Concerns**
- **Routes**: Handle HTTP requests, validation, and responses
- **Repository**: Abstract data access through HTTP calls
- **Database Service**: Handle all data persistence and sharding

### 2. **Technology Independence**
- Backend is completely independent of database technology
- Can switch database implementations without changing backend code
- Database service can be scaled independently

### 3. **Testability**
- Repository can be easily mocked for unit testing
- Business logic is isolated from data access
- Integration tests can use test database service

### 4. **Maintainability**
- Clear boundaries between layers
- Single responsibility for each component
- Easy to understand and modify

### 5. **Scalability**
- Database service can be scaled independently
- Multiple backend instances can share same database service
- Load balancing at each tier

## Environment Configuration

The backend only needs minimal configuration:

```env
NODE_ENV=development
PORT=3001
DATABASE_SERVICE_URL=http://localhost:3002
```

## Error Handling

The repository layer handles all database service communication errors:

```javascript
async create(table, data) {
  try {
    const response = await this.client.post(`/${table}`, data);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create record in ${table}: ${error.response?.data?.error || error.message}`);
  }
}
```

## Testing Strategy

### Unit Tests
- Mock the `DatabaseRepository` class
- Test business logic in routes
- Validate request/response handling

### Integration Tests
- Use test database service instance
- Test complete request/response cycles
- Validate data persistence through API

### Example Test Structure
```javascript
describe('Account Routes', () => {
  let mockRepository;
  
  beforeEach(() => {
    mockRepository = {
      createAccount: jest.fn(),
      getUserAccounts: jest.fn(),
      // ... other methods
    };
  });
  
  test('POST /accounts creates account', async () => {
    mockRepository.createAccount.mockResolvedValue({ id: '123', name: 'Test Account' });
    // Test route logic
  });
});
```

## Development Workflow

1. **Start Database Service**: `cd solfin_database && npm run dev`
2. **Start Backend API**: `cd backend && npm run dev`
3. **Make Changes**: Modify routes or repository as needed
4. **Test**: Use API endpoints or automated tests
5. **Deploy**: Independent deployment of each service

## Future Enhancements

### Authentication & Security
- JWT token implementation
- Password hashing with bcrypt
- Rate limiting middleware
- CORS configuration

### Monitoring & Logging
- Request/response logging
- Performance metrics
- Error tracking
- Health check endpoints

### Advanced Features
- Caching layer (Redis)
- Request validation middleware
- API versioning
- WebSocket support for real-time features

The clean architecture provides a solid foundation for building scalable, maintainable, and testable applications while learning microservices patterns and database sharding concepts.