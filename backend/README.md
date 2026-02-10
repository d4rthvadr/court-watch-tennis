# CourtWatch Backend

Express API server for tournament draw generation and match progression management.

## Tech Stack

- **Runtime:** Node.js v20
- **Framework:** Express + TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Validation:** Express-validator
- **Real-time:** Server-Sent Events (SSE)

## Architecture

Clean layered architecture with separation of concerns:

```
Routes → Controllers → Services → Repositories → Database
```

- **Routes**: HTTP endpoint mapping and middleware
- **Controllers**: Thin HTTP layer (request/response handling)
- **Services**: Business logic, validation, and orchestration
- **Repositories**: Data access layer (CRUD operations)
- **Models**: Domain entities with encapsulation

## Documentation

- **[API Documentation](docs/api.md)** - Complete API endpoints reference
- **[Database Entities](docs/entities.md)** - Database schema and entity details
- **[Data Flow](docs/dataflow.md)** - Architecture and layer responsibilities

## Quick Start

### Prerequisites

- Node.js v20+
- PostgreSQL database
- Docker (optional, for containerized setup)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/courtwatch"
PORT=4001
```

### Development

```bash
# Start development server with hot reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Management

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Create and apply new migration
npm run prisma:migrate

# Reset database (dev only - deletes all data)
npm run prisma:migrate:reset

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Push schema changes without migration (dev only)
npm run prisma:push

# Pull schema from existing database
npm run prisma:pull

# Validate Prisma schema
npm run prisma:validate
```

## Project Structure

```
backend/
├── docs/                    # Documentation
│   ├── api.md              # API endpoints
│   ├── entities.md         # Database schema
│   └── dataflow.md         # Architecture guide
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── controllers/        # HTTP layer (thin)
│   ├── services/           # Business logic
│   ├── models/             # Domain models
│   │   └── repositories/   # Data access layer
│   ├── routes/             # Express routes
│   ├── validators/         # Request validation
│   ├── types/              # TypeScript types
│   ├── db/                 # Database connection
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
└── package.json
```

## API Overview

### Base URL

```
http://localhost:4001/api
```

### Key Endpoints

- `GET /tournaments` - List all tournaments
- `POST /tournaments` - Create tournament
- `POST /tournaments/:id/draw` - Generate draw
- `PATCH /tournaments/:id/matches/:matchId` - Update match result
- `GET /events` - Subscribe to real-time updates (SSE)

See [API Documentation](docs/api.md) for complete endpoint details.

## Contributing

1. Follow the established architecture patterns (see [Data Flow](docs/dataflow.md))
2. Keep controllers thin - business logic belongs in services
3. Use TypeScript types throughout
4. Validate requests with express-validator
5. Write tests for new features

## License

MIT
