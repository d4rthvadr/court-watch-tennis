# Docker Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Traefik (Port 80)                   │
│                   Reverse Proxy & Load Balancer          │
└─────────┬───────────────────────────────────┬───────────┘
          │                                   │
          │ /api/*                           │ /*
          │ (strips /api prefix)             │
          ↓                                   ↓
┌─────────────────────┐           ┌─────────────────────┐
│   Backend Service   │           │   Client Service    │
│   Node.js + Express │           │   SvelteKit         │
│   Port: 4001        │           │   Port: 3000        │
└─────────────────────┘           └─────────────────────┘
```

## How It Works

### 1. **Traefik (Load Balancer)**
- Acts as the single entry point on port 80
- Automatically discovers services via Docker labels
- Routes traffic based on URL paths:
  - `http://localhost/api/*` → Backend (strips `/api` prefix)
  - `http://localhost/*` → Client
- Dashboard available at `http://localhost:8080`

### 2. **Backend Service**
- Runs Express API server
- Accessible via: `http://localhost/api/health`
- Example: `http://localhost/api/games`

### 3. **Client Service**
- Runs SvelteKit application
- Accessible via: `http://localhost/`
- Serves the web interface

## Quick Start

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

### Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View running containers
docker-compose ps
```

## Accessing Services

| Service | URL | Description |
|---------|-----|-------------|
| Client | http://localhost | Web interface |
| Backend API | http://localhost/api | API endpoints |
| Traefik Dashboard | http://localhost:8080 | Monitor routing & services |

## API Examples

```bash
# Health check
curl http://localhost/api/health

# Get games
curl http://localhost/api/games

# Get players
curl http://localhost/api/players
```

## Network Configuration

All services run on the `court-watch-network` bridge network:
- Services can communicate using their service names
- Backend is isolated from direct external access
- Only Traefik exposes ports to the host

## Traefik Labels Explained

### Backend Labels
```yaml
traefik.http.routers.backend.rule=PathPrefix(`/api`)
# Routes requests starting with /api to backend

traefik.http.middlewares.backend-stripprefix.stripprefix.prefixes=/api
# Removes /api prefix before forwarding to backend
# /api/health → /health

traefik.http.services.backend.loadbalancer.server.port=4001
# Backend listens on port 4001 inside container
```

### Client Labels
```yaml
traefik.http.routers.client.rule=PathPrefix(`/`)
# Routes all other requests to client

traefik.http.routers.client.priority=1
# Lower priority ensures /api routes are matched first
```

## Troubleshooting

### Services not accessible
```bash
# Check if containers are running
docker-compose ps

# Check Traefik dashboard
open http://localhost:8080
```

### View service logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f client
docker-compose logs -f traefik
```

### Rebuild after code changes
```bash
docker-compose down
docker-compose up -d --build
```

### Clean restart
```bash
# Remove containers, networks, and volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Production Considerations

For production deployment, consider:

1. **HTTPS/TLS**: Configure Let's Encrypt in Traefik
2. **Environment variables**: Use `.env` files
3. **Health checks**: Add Docker health check directives
4. **Resource limits**: Set memory/CPU limits
5. **Logging**: Configure log drivers
6. **Scaling**: Scale services with `docker-compose up -d --scale backend=3`

## File Structure

```
.
├── docker-compose.yml          # Orchestration config
├── backend/
│   ├── Dockerfile              # Backend container image
│   └── src/
└── client/
    ├── Dockerfile              # Client container image
    └── src/
```
