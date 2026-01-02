# CourtWatch — Multi‑Court Tennis Score Tracking

A minimal MVP to follow multiple tennis matches happening simultaneously at a single venue. Built for tournament attendees, friends/family, and participants who need near‑real‑time, court‑by‑court updates.

> Source code scaffolding is pending. This README reflects the MVP plan from the Technical Requirements.

## MVP Scope

- User authentication & profiles
- Live score dashboard (multi‑court, near‑real‑time)
- Tournament/event selection (browse, search, quick switch)
- Player following with basic notifications
- Simple leaderboard view
- Match detail view

## Technical Stack (MVP)

- Frontend: React 18 + TypeScript, Zustand, Tailwind CSS, Socket.io client, React Router, React Hook Form + Zod
- Backend: Node.js (Express), PostgreSQL 16, Redis 7, Socket.io, Prisma, JWT + bcrypt, Zod
- Infra: Single‑server deploy (Railway/Render/DigitalOcean), managed Postgres + Redis, Cloudflare (CDN), Sentry (errors)
- Realtime: WebSocket with 15–30s polling fallback

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** or **yarn** (for package management)
- **Docker** and **Docker Compose** (for containerized deployment)

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

## Status & Next Steps

- Phase: MVP planning
- Next: Scaffold backend/frontend per TRD, set up CI, and add local dev tooling (Docker Compose, Prisma, etc.)

## Documentation

- Technical Requirements (TRD): `docs/technical_requirements.md`

## License

See `LICENSE`.
