# CourtWatch Tennis — Tournament Draw Engine

A simple, automated tournament draw and match progression system for tennis competitions. Eliminates manual bracket management by providing digital draw generation, automated match progression, and real-time tournament tracking.

## Problem We Solve

Tournament organizers traditionally manage draws and match progression by hand—creating brackets on paper, manually updating results, and tracking player advancement through rounds. CourtWatch automates this entire process, making tournament management efficient and accessible.

## Core Features

**For Administrators:**

- Create and manage tournaments (dates, location, surface type, draw size)
- Generate tournament draws with seeded and unseeded players
- Update match results and automatically progress winners
- Manage tournament status (Upcoming → Active → Completed)

**For Players & Guests:**

- View tournament draws and brackets
- Track match fixtures and schedules
- See live rankings and leaderboards
- Follow match results and progression through rounds

## Technical Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Frontend:** SvelteKit, TypeScript, Tailwind CSS
- **Validation:** Express-validator for API request validation
- **Real-time:** Server-Sent Events (SSE) for live updates

## Prerequisites

- **Node.js** (v20 or higher)
- **npm** (for package management)
- **Docker** and **Docker Compose** (for containerized deployment)
- **PostgreSQL** (for production database)

## Getting Started

### Local Development (Without Docker)

1. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd client
   npm install
   npm run dev
   ```

   The backend will run on `http://localhost:4001` and the frontend on `http://localhost:5173`.

### Docker Deployment (Recommended)

The application uses Docker Compose with Traefik as a reverse proxy to run all services together.

**Start all services:**

```bash
docker-compose up --build
```

**Start services in detached mode (background):**

```bash
docker-compose up -d --build
```

**Stop all services:**

```bash
docker-compose down
```

**View logs:**

```bash
docker-compose logs -f
```

**Rebuild specific service:**

```bash
docker-compose up --build backend
docker-compose up --build client
```

**Access Points:**

- **Frontend:** http://localhost:3030
- **Backend API:** http://localhost:3030/api
- **Traefik Dashboard:** http://localhost:8080

## Project Structure

```
backend/          # Express API server
  src/
    controllers/  # Business logic
    routes/       # API endpoints
    services/     # Draw generation & match progression
    validators/   # Request validation
    types/        # TypeScript definitions
  prisma/         # Database schema & migrations

client/           # SvelteKit frontend
  src/
    routes/       # Pages & layouts
    lib/          # Components & utilities
```

## API Overview

### Tournaments

- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `PATCH /api/tournaments/:id/status` - Update tournament status

### Draw Management

- `POST /api/tournaments/:id/draw` - Generate tournament draw
- `GET /api/tournaments/:id/draw` - View tournament draw
- `GET /api/tournaments/:id/matches` - Get all matches
- `PATCH /api/tournaments/:tournamentId/matches/:matchId` - Update match result

### Players

- `POST /api/players` - Create player
- `GET /api/players` - List all players

## Status & Next Steps

- ✅ Core API with validation
- ✅ Prisma ORM setup
- ✅ Draw generation engine
- ✅ Match progression system
- 🔄 Database migrations
- 📋 Frontend implementation
- 📋 Authentication & authorization

## Documentation

See [docs/](docs/) for detailed architecture and requirements.

- Technical Requirements (TRD): `docs/technical_requirements.md`

## License

See `LICENSE`.
