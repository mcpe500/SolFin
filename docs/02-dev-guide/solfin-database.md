# SolFin Database Service

This document describes the dedicated `solfin_database` service that handles all database operations for the SolFin application using a sharded SQLite architecture.

## Architecture Overview

The SolFin Database Service is a standalone microservice that provides:

- **Sharded SQLite Cluster**: Multiple SQLite databases for different data domains
- **Load Balancing**: Read/write separation with multiple read replicas
- **RESTful API**: HTTP endpoints for all database operations
- **High Availability**: Fault tolerance and connection pooling

## Sharding Strategy

Data is partitioned across multiple SQLite databases based on functional domains:

### Shard Configuration

- **Users Shard** (`users.db`): User accounts, sessions, preferences
- **Accounts Shard** (`accounts.db`): Financial accounts and balances
- **Transactions Shard** (`transactions.db`): Transaction records and splits
- **Pouches Shard** (`pouches.db`): Budget pouches, goals, and sharing
- **Transfers Shard** (`transfers.db`): Account-to-account transfers

### Load Balancing

Each shard maintains:
- **1 Write Connection**: For INSERT, UPDATE, DELETE operations
- **3 Read Replicas**: For SELECT operations with round-robin distribution
- **Connection Pooling**: Efficient resource management

## API Endpoints

### Health Check
```
GET /health
```
Returns the health status of all shards.

### Generic CRUD Operations
```
POST /{table}           # Create record
GET /{table}/{id}       # Read record by ID
PUT /{table}/{id}       # Update record
DELETE /{table}/{id}    # Delete record
POST /{table}/query     # Query with filters
```

### Specialized Endpoints
```
GET /users/{userId}/accounts              # Get user's accounts
GET /users/{userId}/transactions          # Get user's transactions
POST /transactions/with-splits            # Create transaction with splits
```

## Configuration

### Environment Variables
- `DB_PORT`: Service port (default: 3002)
- `DB_HOST`: Service host (default: 0.0.0.0)
- `NODE_ENV`: Environment (development/production)

### Database Configuration
Located in `config/database.js`:
- Shard definitions and table mappings
- Load balancer settings
- Connection limits and timeouts

## Performance Benefits

### Sharding Advantages
- **Reduced Query Complexity**: Smaller, focused databases
- **Parallel Processing**: Operations across different shards
- **Scalability**: Easy to add new shards for growing data
- **Isolation**: Issues in one shard don't affect others

### Read/Write Separation
- **Write Operations**: Single authoritative connection per shard
- **Read Operations**: Distributed across multiple replicas
- **Load Distribution**: Prevents read queries from blocking writes

## Development Setup

1. **Install Dependencies**:
   ```bash
   cd solfin_database
   npm install
   ```

2. **Setup Database** (run migrations and seeders):
   ```bash
   npm run db:setup
   ```

3. **Start the Service**:
   ```bash
   npm run dev
   ```

4. **Test Connection**:
   ```bash
   curl http://localhost:3002/health
   ```

## Database Management

### Migration Commands
```bash
# Run all migrations
npm run migrate

# Run migrations for specific shard
node cli.js migrate users

# Check migration status
npm run migrate:status

# Rollback last migration for specific shard
node cli.js migrate:rollback users
```

### Seeder Commands
```bash
# Run all seeders
npm run seed

# Run seeders for specific shard
node cli.js seed accounts

# Run specific seeder
node cli.js seed users 001_demo_users

# Check seeder status
npm run seed:status

# Reset seeders for shard
node cli.js seed:reset users

# Refresh seeders (reset and re-run)
node cli.js seed:refresh users
```

### Health Check
```bash
npm run health
```

## Integration with Backend

The main backend service connects to the database service through the `DatabaseRepository` class:

```javascript
const dbRepository = new DatabaseRepository();
const accounts = await dbRepository.getUserAccounts(userId);
```

This abstraction allows the backend to focus on business logic while the database service handles:
- Data persistence
- Query optimization
- Connection management
- Sharding logic

## Monitoring and Maintenance

### Health Monitoring
The `/health` endpoint provides real-time status of all shards:
```json
{
  "status": "ok",
  "shards": {
    "users": "healthy",
    "accounts": "healthy",
    "transactions": "healthy",
    "pouches": "healthy",
    "transfers": "healthy"
  }
}
```

### Performance Metrics
- Connection pool utilization
- Query response times per shard
- Read/write operation distribution
- Error rates and retry attempts

## Future Enhancements

- **Horizontal Scaling**: Add more read replicas as needed
- **Data Partitioning**: Time-based partitioning for transactions
- **Caching Layer**: Redis integration for frequently accessed data
- **Backup Strategy**: Automated backup and restore procedures
- **Monitoring Dashboard**: Real-time performance visualization