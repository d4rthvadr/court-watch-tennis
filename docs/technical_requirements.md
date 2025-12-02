# Technical Requirements Document (TRD)

## CourtWatch MVP - Multi-Court Tennis Score Tracking

**Version:** 1.0  
**Date:** December 2, 2025  
**Based on:** CourtWatch PRD v1.0

---

## Document Purpose

This Technical Requirements Document translates the CourtWatch PRD into specific technical specifications for MVP development. It focuses on simplicity, rapid deployment, and core functionality.

---

## MVP Scope

### In Scope (MVP)

1. User authentication & profiles
2. Live score dashboard with real-time updates
3. Tournament/event selection
4. Player following with basic notifications
5. Simple leaderboard view
6. Match detail view

### Out of Scope (Post-MVP)

- News & articles
- Social features (chat, comments, reactions)
- Calendar integration
- Advanced analytics
- White-label tournament organizer tools

---

## Technical Stack

### Frontend

**Framework:** React 18+ with TypeScript

- **Rationale:** Industry standard, large ecosystem, TypeScript for type safety
- **State Management:** Zustand (simpler than Redux for MVP)
- **UI Framework:** Tailwind CSS + Headless UI
- **Real-time Client:** Socket.io-client
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Notifications:** React-Toastify (in-app) + native Push API

**Key Dependencies:**

```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "socket.io-client": "^4.6.0",
  "zustand": "^4.5.0",
  "tailwindcss": "^3.4.0",
  "axios": "^1.6.0",
  "react-router-dom": "^6.20.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0"
}
```

### Backend

**Framework:** Node.js with Express.js

- **Rationale:** JavaScript full-stack, fast development, excellent WebSocket support
- **Runtime:** Node.js v20 LTS
- **Database:** PostgreSQL 16
- **Caching:** Redis 7
- **Real-time:** Socket.io
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **ORM:** Prisma

**Key Dependencies:**

```json
{
  "express": "^4.18.0",
  "socket.io": "^4.6.0",
  "prisma": "^5.7.0",
  "@prisma/client": "^5.7.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "redis": "^4.6.0",
  "zod": "^3.22.0",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.0"
}
```

### Infrastructure (MVP)

**Hosting:** Single-server deployment

- **Provider:** Railway / Render / DigitalOcean
- **Server:** 2 vCPU, 4GB RAM minimum
- **Database:** Managed PostgreSQL instance
- **Cache:** Managed Redis instance
- **CDN:** Cloudflare (free tier)
- **Monitoring:** Sentry (error tracking)

**Environment:**

- **Development:** Local development with Docker Compose
- **Staging:** Single staging environment
- **Production:** Single production environment

---

## System Architecture

### High-Level Architecture

```
┌─────────────┐
│   Clients   │
│  (React)    │
└──────┬──────┘
       │
       ├─── HTTP/REST ───┐
       │                 │
       └─── WebSocket ───┤
                         │
                    ┌────▼─────┐
                    │  Express │
                    │  Server  │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │PostgreSQL│    │  Redis  │    │Socket.io│
    │Database  │    │  Cache  │    │ Server  │
    └──────────┘    └─────────┘    └─────────┘
```

### Component Architecture

**Frontend Components:**

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── MatchCard.tsx
│   │   ├── CourtFilter.tsx
│   │   └── ScoreDisplay.tsx
│   ├── tournaments/
│   │   ├── TournamentList.tsx
│   │   ├── TournamentCard.tsx
│   │   └── TournamentSelector.tsx
│   ├── matches/
│   │   ├── MatchDetail.tsx
│   │   ├── ScoreHistory.tsx
│   │   └── PlayerInfo.tsx
│   ├── leaderboard/
│   │   └── LeaderboardTable.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── authStore.ts
│   ├── matchStore.ts
│   └── notificationStore.ts
├── services/
│   ├── api.ts
│   ├── socket.ts
│   └── auth.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useMatches.ts
│   └── useNotifications.ts
└── utils/
    ├── scoreUtils.ts
    └── dateUtils.ts
```

**Backend Structure:**

```
src/
├── controllers/
│   ├── auth.controller.ts
│   ├── tournament.controller.ts
│   ├── match.controller.ts
│   ├── player.controller.ts
│   └── user.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── match.service.ts
│   ├── notification.service.ts
│   └── socket.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── errorHandler.middleware.ts
├── routes/
│   ├── auth.routes.ts
│   ├── tournament.routes.ts
│   ├── match.routes.ts
│   └── player.routes.ts
├── models/ (Prisma schemas)
├── utils/
│   ├── jwt.ts
│   └── redis.ts
└── socket/
    └── handlers.ts
```

---

## Database Schema

### PostgreSQL Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferences JSONB DEFAULT '{}'
);

-- Tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    surface_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(3),
    ranking INTEGER,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    court_number INTEGER NOT NULL,
    player1_id UUID REFERENCES players(id),
    player2_id UUID REFERENCES players(id),
    status VARCHAR(50) DEFAULT 'scheduled',
    score JSONB DEFAULT '{"sets": []}',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User following table
CREATE TABLE user_following (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, player_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_user_following_user ON user_following(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_tournaments_dates ON tournaments(start_date, end_date);
```

### Score Data Structure (JSONB)

```typescript
interface MatchScore {
  sets: SetScore[];
  currentSet: number;
  servingPlayer: 1 | 2;
  currentGame: GameScore;
}

interface SetScore {
  setNumber: number;
  player1Games: number;
  player2Games: number;
  tiebreak?: TiebreakScore;
  winner?: 1 | 2;
}

interface GameScore {
  player1Points: number; // 0, 15, 30, 40, or 'AD'
  player2Points: number;
}

interface TiebreakScore {
  player1Points: number;
  player2Points: number;
}
```

### Redis Cache Structure

```
Key Pattern                          | TTL    | Value Type | Purpose
------------------------------------|--------|------------|------------------
tournament:{id}                     | 1 hour | JSON       | Tournament details
matches:tournament:{id}             | 30 sec | JSON       | Active matches
match:{id}                          | 30 sec | JSON       | Match details
leaderboard:tournament:{id}         | 2 min  | JSON       | Standings
user:{id}:following                 | 5 min  | JSON       | Followed players
active_tournaments                  | 5 min  | JSON       | List of active tournaments
```

---

## API Specifications

### REST API Endpoints

#### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me
```

#### Tournaments

```
GET    /api/tournaments              # List all tournaments
GET    /api/tournaments/:id          # Get tournament details
GET    /api/tournaments/active       # Get active tournaments
```

#### Matches

```
GET    /api/tournaments/:id/matches  # Get all matches for tournament
GET    /api/matches/:id              # Get match details
```

#### Players

```
GET    /api/players                  # Search players
GET    /api/players/:id              # Get player details
```

#### User Actions

```
POST   /api/users/follow/:playerId   # Follow a player
DELETE /api/users/follow/:playerId   # Unfollow a player
GET    /api/users/following          # Get followed players
PATCH  /api/users/preferences        # Update notification preferences
```

#### Leaderboard

```
GET    /api/tournaments/:id/leaderboard  # Get tournament standings
```

### Request/Response Examples

**POST /api/auth/register**

```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}

Response (201):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

**GET /api/tournaments/:id/matches**

```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "courtNumber": 1,
      "status": "live",
      "player1": {
        "id": "uuid",
        "name": "John Doe",
        "country": "USA"
      },
      "player2": {
        "id": "uuid",
        "name": "Jane Smith",
        "country": "GBR"
      },
      "score": {
        "sets": [
          {
            "setNumber": 1,
            "player1Games": 6,
            "player2Games": 4,
            "winner": 1
          },
          {
            "setNumber": 2,
            "player1Games": 3,
            "player2Games": 5
          }
        ],
        "currentSet": 2,
        "servingPlayer": 2
      },
      "startTime": "2025-12-02T14:30:00Z"
    }
  ]
}
```

---

## WebSocket Protocol

### Connection

```javascript
// Client connects to WebSocket
const socket = io("wss://api.courtwatch.com", {
  auth: {
    token: "jwt-token",
  },
});
```

### Events

**Client → Server:**

```
subscribe_tournament     # Subscribe to tournament updates
unsubscribe_tournament   # Unsubscribe from tournament
subscribe_match          # Subscribe to specific match
unsubscribe_match        # Unsubscribe from match
```

**Server → Client:**

```
match_update             # Score update for a match
match_started            # Match has started
match_completed          # Match has finished
tournament_update        # Tournament-level update
connection_status        # Connection health check
```

### Message Format

**match_update event:**

```json
{
  "event": "match_update",
  "data": {
    "matchId": "uuid",
    "courtNumber": 1,
    "score": {
      "sets": [...],
      "currentSet": 2,
      "servingPlayer": 1
    },
    "timestamp": "2025-12-02T15:45:23Z"
  }
}
```

---

## Authentication & Security

### JWT Token Structure

```javascript
{
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1701532800,
  "exp": 1701619200  // 24 hours
}
```

### Security Measures

1. **Password Requirements:**

   - Minimum 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number
   - Hashed with bcrypt (10 rounds)

2. **API Rate Limiting:**

   - Authentication endpoints: 5 requests/15 minutes
   - General API: 100 requests/15 minutes per IP
   - WebSocket: 1 connection per user

3. **CORS Configuration:**

   - Whitelist production domain
   - Allow credentials
   - Restrict methods to GET, POST, PATCH, DELETE

4. **Headers:**

   - Helmet.js for security headers
   - Content Security Policy
   - HTTPS only in production

5. **Input Validation:**
   - Zod schemas for all API inputs
   - Sanitize user-generated content
   - Parameterized SQL queries (via Prisma)

---

## Real-Time Update Strategy

### WebSocket Implementation

**Connection Management:**

```javascript
// Server-side room management
socket.on("subscribe_tournament", (tournamentId) => {
  socket.join(`tournament:${tournamentId}`);
});

// Broadcasting score updates
io.to(`tournament:${tournamentId}`).emit("match_update", data);
```

**Fallback Strategy:**

```javascript
// Client-side polling fallback
if (!socket.connected) {
  // Poll every 15 seconds
  setInterval(() => {
    fetchMatches();
  }, 15000);
}
```

### Update Frequency

- Live matches: Real-time via WebSocket
- Cache refresh: Every 30 seconds
- Fallback polling: Every 15 seconds
- Leaderboard: Every 2 minutes

---

## Notification System

### Push Notification Flow

```
Score Update → Match Service → Notification Service
                                      ↓
                              Check User Preferences
                                      ↓
                              Build Notification
                                      ↓
                              Queue in Redis
                                      ↓
                              Send to Client
```

### Notification Types (MVP)

1. **Match Start**

   - Trigger: 5 minutes before start
   - Target: Users following either player
   - Payload: Match details, court number, start time

2. **Match Point**

   - Trigger: When player reaches match point
   - Target: Users following either player
   - Payload: Current score, player at match point

3. **Match Completed**
   - Trigger: Immediately after match ends
   - Target: Users following either player
   - Payload: Final score, match duration

### Browser Push API (MVP)

```javascript
// Request permission
Notification.requestPermission();

// Send notification
new Notification("Match Starting", {
  body: "John Doe vs Jane Smith on Court 3",
  icon: "/icon.png",
  tag: "match-123",
});
```

**Note:** For MVP, use browser notifications. Native mobile push (FCM) is post-MVP.

---

## Performance Requirements

### Response Time Targets

- API response time: < 200ms (p95)
- WebSocket message latency: < 100ms
- Page load time: < 2 seconds
- Time to interactive: < 3 seconds

### Scalability Targets (MVP)

- Concurrent users: 500
- Concurrent WebSocket connections: 300
- API requests per second: 50
- Database connections: 20 pool size

### Optimization Strategies

1. **Database:**

   - Proper indexing on frequently queried columns
   - Connection pooling (max 20 connections)
   - Read-heavy workload optimization

2. **Caching:**

   - Redis for frequently accessed data
   - Cache tournament and match data
   - Cache-aside pattern

3. **Frontend:**

   - Code splitting by route
   - Lazy loading components
   - Memoization for expensive computations
   - Debounce search inputs

4. **API:**
   - Response compression (gzip)
   - Pagination for list endpoints (20 items/page)
   - Efficient SQL queries via Prisma

---

## Data Management

### Score Entry (MVP Approach)

**Simple Admin Panel:**

- Manual score entry form
- Tournament admin credentials
- Real-time validation
- Undo last change capability

**Future:** Mobile app for scorekeepers, automated scoring system integration

### Data Validation Rules

```typescript
// Match score validation
const validateScoreUpdate = (score: MatchScore) => {
  // Games per set: 0-7 (with tiebreak at 6-6)
  // Points: 0, 15, 30, 40, ADV
  // Tiebreak: first to 7, win by 2
  // Sets: best of 3 or best of 5
};
```

### Backup & Recovery

- Automated daily database backups
- Point-in-time recovery capability
- 30-day retention policy
- Weekly backup restoration testing

---

## Testing Strategy

### Test Pyramid

```
         /\
        /E2E\          10% - Critical user flows
       /______\
      /        \
     /Integration\ 30% - API + Database
    /____________\
   /              \
  /     Unit       \  60% - Business logic
 /__________________|
```

### Test Coverage Requirements

- Unit tests: 70% coverage minimum
- Integration tests: Key API endpoints
- E2E tests: 3-5 critical user journeys

### Testing Tools

- **Unit:** Jest + React Testing Library
- **Integration:** Supertest
- **E2E:** Playwright
- **Load:** Artillery (basic load testing)

### Critical Test Scenarios

1. User registration and login
2. Tournament selection and match viewing
3. Real-time score updates via WebSocket
4. Player following and unfollowing
5. Notification delivery
6. Leaderboard accuracy

---

## Deployment Strategy

### CI/CD Pipeline

```
Git Push → GitHub Actions
             ↓
       Run Tests (Unit, Integration)
             ↓
       Build Docker Image
             ↓
       Push to Registry
             ↓
       Deploy to Staging
             ↓
       Smoke Tests
             ↓
       Manual Approval
             ↓
       Deploy to Production
             ↓
       Health Check
```

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.courtwatch.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/courtwatch
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# CORS
ALLOWED_ORIGINS=https://courtwatch.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis cache cleared
- [ ] SSL certificates valid
- [ ] Health check endpoint responding
- [ ] WebSocket connections working
- [ ] Error tracking active
- [ ] Backup system verified

---

## Monitoring & Observability

### Key Metrics to Track

**Application Metrics:**

- API response times (p50, p95, p99)
- Error rates by endpoint
- WebSocket connection count
- Active users (concurrent)
- Database query performance

**Business Metrics:**

- Daily active users
- Matches tracked per day
- Notification delivery rate
- User registration rate
- Average session duration

### Alerting Rules

```
CRITICAL:
- API error rate > 5%
- Database connections exhausted
- WebSocket server down
- Response time p95 > 2 seconds

WARNING:
- Error rate > 1%
- Response time p95 > 500ms
- Redis cache miss rate > 30%
- Disk usage > 80%
```

### Logging Strategy

```javascript
// Structured logging format
{
  "timestamp": "2025-12-02T15:30:00Z",
  "level": "info",
  "service": "api",
  "endpoint": "/api/matches/:id",
  "method": "GET",
  "userId": "uuid",
  "duration": 150,
  "statusCode": 200
}
```

**Log Levels:**

- ERROR: Application errors, failed requests
- WARN: Unusual behavior, slow queries
- INFO: Key events, user actions
- DEBUG: Detailed execution flow (dev only)

---

## Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd courtwatch

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start Docker services (PostgreSQL, Redis)
docker-compose up -d

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed database (optional)
npm run seed

# 7. Start development servers
npm run dev        # Backend (port 3000)
npm run dev:client # Frontend (port 5173)
```

### Git Workflow

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/\***: Feature branches
- **fix/\***: Bug fix branches

**Commit Convention:**

```
feat: add match detail view
fix: correct score calculation
docs: update API documentation
test: add unit tests for score service
```

### Code Review Checklist

- [ ] Follows TypeScript best practices
- [ ] Includes unit tests
- [ ] Updates documentation if needed
- [ ] No console.logs in production code
- [ ] Proper error handling
- [ ] Validated with Zod schemas
- [ ] Performance considerations addressed

---

## Migration Plan (Development Phases)

### Phase 1: Foundation (Weeks 1-2)

- Set up project structure
- Configure database and Redis
- Implement authentication system
- Create basic API framework

### Phase 2: Core Features (Weeks 3-4)

- Tournament and match models
- Score management system
- Real-time WebSocket infrastructure
- Dashboard UI components

### Phase 3: User Features (Weeks 5-6)

- Player following system
- Notification system
- Leaderboard implementation
- Match detail views

### Phase 4: Polish & Testing (Weeks 7-8)

- UI/UX refinements
- Comprehensive testing
- Performance optimization
- Bug fixing

### Phase 5: Deployment (Week 9)

- Staging deployment
- User acceptance testing
- Production deployment
- Monitoring setup

---

## Acceptance Criteria

### MVP Launch Criteria

**Functional Requirements:**

- [ ] Users can register and log in
- [ ] Users can view active tournaments
- [ ] Live scores update within 30 seconds
- [ ] Users can follow/unfollow players (up to 5)
- [ ] Browser notifications work for match events
- [ ] Leaderboard displays correctly
- [ ] Match detail view shows complete information
- [ ] Mobile responsive design works on iOS/Android

**Non-Functional Requirements:**

- [ ] API response time < 200ms (p95)
- [ ] WebSocket latency < 100ms
- [ ] 70%+ test coverage
- [ ] Zero critical security vulnerabilities
- [ ] Works on Chrome, Safari, Firefox, Edge (latest versions)
- [ ] Handles 500 concurrent users
- [ ] SSL/HTTPS enabled
- [ ] Error tracking operational

**Documentation:**

- [ ] API documentation complete
- [ ] README with setup instructions
- [ ] Deployment runbook
- [ ] User guide (basic)

---

## Future Technical Considerations

### Post-MVP Enhancements

1. **Mobile Apps:** React Native for iOS/Android
2. **Advanced Caching:** GraphQL with Apollo cache
3. **Microservices:** Split notification service
4. **Message Queue:** RabbitMQ for async jobs
5. **CDN:** Serve static assets via CDN
6. **Analytics:** Mixpanel or Amplitude integration
7. **A/B Testing:** LaunchDarkly feature flags

### Scalability Path

- Horizontal scaling with load balancer
- Database read replicas
- Redis cluster for distributed cache
- WebSocket server clustering
- Container orchestration (Kubernetes)

---

## Appendix

### Technology Decision Rationale

**Why React over Vue/Angular?**

- Largest ecosystem and community
- Excellent TypeScript support
- Rich component library options
- Team expertise

**Why Node.js over Python/Go?**

- JavaScript full-stack (shared types)
- Excellent WebSocket support
- Faster MVP development
- Strong real-time capabilities

**Why PostgreSQL over MongoDB?**

- Structured relational data
- ACID compliance for scores
- Better query performance for leaderboards
- JSON support via JSONB

**Why Zustand over Redux?**

- Simpler API and less boilerplate
- Sufficient for MVP scope
- Easier to learn for new developers
- Better bundle size

### Glossary of Technical Terms

- **WebSocket:** Protocol for real-time bidirectional communication
- **JWT:** JSON Web Token for stateless authentication
- **ORM:** Object-Relational Mapping (Prisma)
- **JSONB:** Binary JSON storage in PostgreSQL
- **SSR:** Server-Side Rendering (future consideration)
- **PWA:** Progressive Web App (future consideration)

---

## Document Approval

**Required Approvals:**

- [ ] Engineering Lead
- [ ] Backend Engineer
- [ ] Frontend Engineer
- [ ] DevOps Engineer
- [ ] Product Manager

**Version History:**

- v1.0 (2025-12-02): Initial TRD for MVP

---

**Questions or Clarifications:** Contact engineering@courtwatch.com
