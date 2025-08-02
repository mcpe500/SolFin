# SolFin - Personal Finance Planner

SolFin is a cross-platform personal and family finance planner with offline-first capabilities and advanced features like receipt scanning.

## Architecture

SolFin uses a three-tier architecture:

1. **Frontend (Ionic React)**: Cross-platform app for Android, iOS, and Web PWA
2. **Backend API (Node.js/Fastify)**: Business logic and API endpoints
3. **SolFin Database Service**: Sharded SQLite cluster with load balancing

```
┌─────────────────────────┐
│   Frontend (Ionic)      │
│   Android/iOS/Web PWA   │
└──────────┬──────────────┘
           │ HTTP/REST
┌──────────┴──────────────┐
│   Backend API (Node)    │
│   Repository Pattern    │
│   Gemini-Flash Service  │
└──────────┬──────────────┘
           │ HTTP/REST
┌──────────┴──────────────┐
│  SolFin Database Service│
│  Sharded SQLite Cluster │
│  Load Balancer          │
│  Read/Write Separation  │
└─────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js (LTS version)
- npm or bun

### Start All Services (Windows)
```bash
start-services.bat
```

### Manual Startup

1. **Start Database Service**:
   ```bash
   cd solfin_database
   npm install
   npm run dev
   ```

2. **Start Backend API**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Frontend** (separate terminal):
   ```bash
   cd frontend
   npm install
   ionic serve
   ```

## Services

- **Database Service**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **Frontend Web**: http://localhost:8100

## Key Features

- **Offline First**: Works without internet connection
- **Cross Platform**: Single codebase for all platforms
- **Sharded Database**: Efficient data distribution and scaling
- **Receipt Scanning**: AI-powered transaction creation
- **Real-time Sync**: Multi-device synchronization
- **Budget Management**: Envelope-style budgeting with pouches

## Documentation

- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/dev-setup.md)
- [API Specification](docs/api-spec.md)
- [Database Architecture](docs/02-dev-guide/solfin-database.md)

## Project Structure

```
solfin/
├── frontend/           # Ionic React app
├── backend/           # Node.js API server
├── solfin_database/   # Database service
├── docs/             # Documentation
└── start-services.bat # Windows startup script
```

## Development

The project uses a microservices architecture with:
- **Repository Pattern**: Backend abstracts database operations
- **Sharded SQLite**: Multiple databases for different data domains
- **Load Balancing**: Read/write separation for performance
- **RESTful APIs**: Standard HTTP endpoints for all operations

## License

MIT License - see LICENSE file for details.