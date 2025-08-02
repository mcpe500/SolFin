# Complete SolFin Development Setup

This guide provides step-by-step instructions for setting up the complete SolFin development environment with all three tiers of the architecture.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (LTS version 18+)
- **npm** or **bun** package manager
- **Git** for version control
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Capacitor CLI**: `npm install -g @capacitor/cli`

For mobile development:
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## Architecture Overview

SolFin uses a three-tier microservices architecture:

```
┌─────────────────────────┐
│   Frontend (Ionic)      │  Port 8100
│   Android/iOS/Web PWA   │
└──────────┬──────────────┘
           │ HTTP/REST
┌──────────┴──────────────┐
│   Backend API (Node)    │  Port 3001
│   Repository Pattern    │
│   Gemini-Flash Service  │
└──────────┬──────────────┘
           │ HTTP/REST
┌──────────┴──────────────┐
│  SolFin Database Service│  Port 3002
│  Sharded SQLite Cluster │
│  Load Balancer          │
│  Read/Write Separation  │
└─────────────────────────┘
```

## Quick Setup (Automated)

### Windows Users
```bash
# Clone the repository
git clone [repository-url] solfin
cd solfin

# Run the automated setup script
start-services.bat
```

This script will:
1. Install dependencies for all services
2. Setup the database with migrations and seeders
3. Start all three services in separate terminal windows

## Manual Setup (Step by Step)

### 1. Clone and Setup Repository

```bash
git clone [repository-url] solfin
cd solfin
```

### 2. Setup SolFin Database Service

```bash
# Navigate to database service
cd solfin_database

# Install dependencies
npm install

# Setup database (run migrations and seeders)
npm run db:setup

# Start the database service
npm run dev
```

The database service will be available at `http://localhost:3002`

### 3. Setup Backend API

```bash
# Navigate to backend (in a new terminal)
cd backend

# Install dependencies
npm install

# Start the backend service
npm run dev
```

The backend API will be available at `http://localhost:3001`

### 4. Setup Frontend Application

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
ionic serve
```

The frontend will be available at `http://localhost:8100`

## Service Verification

### 1. Database Service Health Check

```bash
# Using curl
curl http://localhost:3002/health

# Expected response
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

### 2. Backend API Health Check

```bash
# Using curl
curl http://localhost:3001/admin/health

# Expected response
{
  "status": "ok",
  "shards": { ... }
}
```

### 3. Frontend Access

Open your browser and navigate to `http://localhost:8100` to access the SolFin application.

## Database Management

### Migration Commands

```bash
cd solfin_database

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
cd solfin_database

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

### Database CLI Tool

The database service includes a comprehensive CLI tool:

```bash
cd solfin_database

# Show all available commands
node cli.js

# Complete database setup (migrations + seeders)
node cli.js setup

# Check health of all shards
node cli.js health
```

## Development Workflow

### 1. Starting Development

```bash
# Start all services (Windows)
start-services.bat

# Or manually start each service in separate terminals:
# Terminal 1: Database Service
cd solfin_database && npm run dev

# Terminal 2: Backend API
cd backend && npm run dev

# Terminal 3: Frontend
cd frontend && ionic serve
```

### 2. Making Database Changes

When you need to modify the database schema:

1. Create a new migration file in `solfin_database/migrations/`
2. Run the migration: `npm run migrate`
3. Update seeders if needed
4. Test the changes

### 3. Adding New Features

1. **Database Layer**: Add tables/columns via migrations
2. **Database Service**: Add new endpoints if needed
3. **Backend API**: Add business logic and routes
4. **Frontend**: Implement UI and connect to backend APIs

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Database Service: Change `DB_PORT` in `solfin_database/.env`
   - Backend API: Change `PORT` in `backend/.env`
   - Frontend: Use `ionic serve --port 8101`

2. **Database Connection Issues**
   - Ensure database service is running first
   - Check `DATABASE_SERVICE_URL` in `backend/.env`
   - Verify health endpoint: `curl http://localhost:3002/health`

3. **Migration Failures**
   - Check migration file syntax
   - Ensure proper shard targeting
   - Use `node cli.js migrate:status` to check current state

4. **Seeder Issues**
   - Verify migration completion first
   - Check for data conflicts
   - Use `node cli.js seed:status` to check current state

### Logs and Debugging

- **Database Service**: Logs appear in the database service terminal
- **Backend API**: Logs appear in the backend terminal
- **Frontend**: Check browser developer console

### Resetting Development Environment

```bash
# Stop all services
# Delete database files
rm -rf solfin_database/shards/*.db

# Reset and setup database
cd solfin_database
npm run db:setup

# Restart all services
```

## Production Considerations

While this setup is designed for development, consider these factors for production:

1. **Database**: Replace SQLite with PostgreSQL or MySQL
2. **Load Balancing**: Use proper load balancers (nginx, HAProxy)
3. **Monitoring**: Add logging and monitoring solutions
4. **Security**: Implement proper authentication and authorization
5. **Scaling**: Consider containerization with Docker/Kubernetes

## Next Steps

After completing the setup:

1. Explore the demo data created by seeders
2. Test CRUD operations through the frontend
3. Review the API documentation
4. Start building your custom features
5. Read the user guide for application features

For more detailed information, refer to:
- [Database Service Documentation](solfin-database.md)
- [API Specification](../api-spec.md)
- [User Guide](../user-guide.md)