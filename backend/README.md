# CourtWatch Backend

Express API server for tournament draw generation and match progression management.

## Tech Stack

- **Runtime:** Node.js v20
- **Framework:** Express + TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Validation:** Express-validator
- **Real-time:** Server-Sent Events (SSE)

## Database Entities

### Player (`players` table)

Represents tennis players participating in tournaments.

| Field     | Type     | Description                            |
| --------- | -------- | -------------------------------------- |
| id        | UUID     | Primary key                            |
| name      | String   | Player's full name                     |
| status    | String   | Player status (Active, Inactive, etc.) |
| rank      | Integer  | Player's ranking position              |
| createdAt | DateTime | Record creation timestamp              |
| updatedAt | DateTime | Record update timestamp                |

**Relations:**

- Games (as player one or player two)
- Draw entries (tournament participation)
- Draw matches (as player 1, player 2, or winner)

---

### Tournament (`tournaments` table)

Represents tennis tournaments with draw management.

| Field       | Type     | Default  | Description                                     |
| ----------- | -------- | -------- | ----------------------------------------------- |
| id          | UUID     | -        | Primary key                                     |
| name        | String   | -        | Tournament name                                 |
| location    | String   | -        | Tournament venue/location                       |
| startDate   | String   | -        | Tournament start date                           |
| endDate     | String   | -        | Tournament end date                             |
| surfaceType | Enum     | Hard     | Court surface (Hard, Clay, Grass, Carpet)       |
| drawSize    | Integer  | -        | Number of players (8, 16, 32, 64, 128)          |
| status      | Enum     | Upcoming | Tournament status (Upcoming, Active, Completed) |
| matchType   | Enum     | Singles  | Match format (Singles, Doubles)                 |
| createdAt   | DateTime | now()    | Record creation timestamp                       |
| updatedAt   | DateTime | now()    | Record update timestamp                         |

**Relations:**

- Draw entries (tournament participants)
- Draw matches (tournament bracket matches)

---

### Game (`games` table)

Represents regular matches/games outside of tournament context.

| Field       | Type              | Description                 |
| ----------- | ----------------- | --------------------------- |
| id          | UUID              | Primary key                 |
| name        | String (optional) | Match name/identifier       |
| status      | String            | Match status                |
| startTime   | String (optional) | Match start time            |
| endTime     | String (optional) | Match end time              |
| playerOneId | UUID              | Reference to player one     |
| playerTwoId | UUID              | Reference to player two     |
| courtId     | String            | Court assignment identifier |
| createdAt   | DateTime          | Record creation timestamp   |
| updatedAt   | DateTime          | Record update timestamp     |

**Relations:**

- Player one (many-to-one)
- Player two (many-to-one)

**Note:** Cascading delete - deleting a player removes their games.

---

### DrawEntry (`draw_entries` table)

Represents a player's position in a tournament draw.

| Field        | Type               | Description                             |
| ------------ | ------------------ | --------------------------------------- |
| id           | UUID               | Primary key                             |
| tournamentId | UUID               | Reference to tournament                 |
| position     | Integer            | Position in draw (1-based, e.g., 1-128) |
| playerId     | UUID (optional)    | Reference to player (null for byes)     |
| seed         | Integer (optional) | Player's seed (1-32 for seeded players) |
| round        | String             | Round identifier (R1, R2, QF, SF, F)    |
| matchId      | String (optional)  | Reference to match this player is in    |
| createdAt    | DateTime           | Record creation timestamp               |
| updatedAt    | DateTime           | Record update timestamp                 |

**Relations:**

- Tournament (many-to-one)
- Player (many-to-one, nullable)

**Indexes:** tournamentId, playerId

**Note:** Cascading delete with tournament, set null when player deleted.

---

### DrawMatch (`draw_matches` table)

Represents a match within a tournament bracket.

| Field        | Type              | Default   | Description                                             |
| ------------ | ----------------- | --------- | ------------------------------------------------------- |
| id           | UUID              | -         | Primary key                                             |
| tournamentId | UUID              | -         | Reference to tournament                                 |
| round        | String            | -         | Round identifier (R1, R2, R3, R4, QF, SF, F)            |
| position     | Integer           | -         | Match position within round                             |
| player1Id    | UUID (optional)   | -         | Reference to first player                               |
| player2Id    | UUID (optional)   | -         | Reference to second player                              |
| winnerId     | UUID (optional)   | -         | Reference to winning player                             |
| nextMatchId  | String (optional) | -         | Match where winner advances                             |
| status       | Enum              | Scheduled | Match status (Scheduled, Ongoing, Completed, Cancelled) |
| courtId      | String (optional) | -         | Court assignment                                        |
| startTime    | String (optional) | -         | Match start time                                        |
| endTime      | String (optional) | -         | Match end time                                          |
| createdAt    | DateTime          | now()     | Record creation timestamp                               |
| updatedAt    | DateTime          | now()     | Record update timestamp                                 |

**Relations:**

- Tournament (many-to-one)
- Player 1 (many-to-one, nullable)
- Player 2 (many-to-one, nullable)
- Winner (many-to-one, nullable)

**Indexes:** tournamentId, player1Id, player2Id, winnerId

**Note:** Cascading delete with tournament, set null when players deleted.

---

## Enums

### TournamentStatus

- `Upcoming` - Tournament not yet started (default)
- `Active` - Tournament in progress
- `Completed` - Tournament finished

### SurfaceType

- `Hard` - Hard court surface (default)
- `Clay` - Clay court surface
- `Grass` - Grass court surface
- `Carpet` - Carpet court surface

### MatchType

- `Singles` - One player per side (default)
- `Doubles` - Two players per side

### MatchStatus

- `Scheduled` - Match not yet started (default)
- `Ongoing` - Match in progress
- `Completed` - Match finished
- `Cancelled` - Match cancelled

---

## Database Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Reset database (dev only)
npm run prisma:migrate:reset

# Open Prisma Studio
npm run prisma:studio

# Push schema without migration (dev only)
npm run prisma:push

# Pull schema from database
npm run prisma:pull

# Validate schema
npm run prisma:validate
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/courtwatch"
PORT=4001
```
