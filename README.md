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

## Status & Next Steps

- Phase: MVP planning
- Next: Scaffold backend/frontend per TRD, set up CI, and add local dev tooling (Docker Compose, Prisma, etc.)

## Documentation

- Technical Requirements (TRD): `docs/technical_requirements.md`

## License

See `LICENSE`.
