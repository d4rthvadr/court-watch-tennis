# Data Flow Architecture

## Layer Overview

CourtWatch follows a clean architecture pattern with clear separation of concerns across multiple layers:

```
HTTP Request
    ↓
Routes (Express Router)
    ↓
Controllers (HTTP Layer - Thin)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Database (Prisma/PostgreSQL)
```

---

## Layer Responsibilities

### 1. Routes (`src/routes/`)

**Purpose:** Define HTTP endpoints and route requests to controllers

**Responsibilities:**

- Map HTTP methods and paths to controller methods
- Apply middleware (validation, authentication)
- Handle request/response transformations

**Example:**

```typescript
// src/routes/tournament-router.ts
router.post(
  "/",
  createTournamentValidator,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const tournament = await tournamentController.createTournament(req.body);
    res.status(201).json({ data: tournament });
  }),
);
```

**Key Files:**

- `tournament-router.ts` - Tournament CRUD endpoints
- `draw-router.ts` - Draw generation and match endpoints
- `player-router.ts` - Player management endpoints
- `sse-router.ts` - Server-sent events for real-time updates

---

### 2. Controllers (`src/controllers/`)

**Purpose:** Thin HTTP layer that delegates to services

**Responsibilities:**

- Receive requests from routes
- Delegate to appropriate service methods
- Return responses (no business logic)

**Example:**

```typescript
// src/controllers/tournament-controller.ts
class TournamentController {
  async createTournament(data: CreateTournamentRequest): Promise<Tournament> {
    return await tournamentService.createTournament(data);
  }
}
```

**Key Files:**

- `tournament-controller.ts` - Tournament operations
- `draw-controller.ts` - Draw and match operations
- `player-controller.ts` - Player operations

**Rules:**

- ✅ Thin layer - just pass through to services
- ❌ No business logic
- ❌ No direct repository calls
- ❌ No data validation (handled in services)

---

### 3. Services (`src/services/`)

**Purpose:** Implement business logic, validation, and orchestration

**Responsibilities:**

- Business rule enforcement
- Data validation
- Cross-cutting concerns (events, notifications)
- Coordinate multiple repository operations
- Status transition logic

**Example:**

```typescript
// src/services/tournament-service.ts
class TournamentService {
  async createTournament(data: CreateTournamentData): Promise<Tournament> {
    // Business logic: validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      throw new Error("End date must be after start date");
    }

    // Create via repository
    const tournament = await tournamentRepository.save(
      new TournamentModel({ ...data, status: TournamentStatus.Upcoming }),
    );

    return toTournamentDTO(tournament);
  }
}
```

**Key Files:**

- `tournament-service.ts` - Tournament business logic
- `draw-management-service.ts` - Draw generation and match progression
- `draw/draw-orchestrator-service.ts` - Draw bracket generation
- `draw/bracket-builder.ts` - Bracket structure creation
- `draw/seeding-strategy.ts` - Player seeding logic

**Rules:**

- ✅ All business logic here
- ✅ Validate data
- ✅ Orchestrate operations
- ✅ Emit events
- ❌ No direct database calls (use repositories)
- ❌ No HTTP concerns

---

### 4. Repositories (`src/models/repositories/`)

**Purpose:** Data access layer - CRUD operations only

**Responsibilities:**

- Database queries via Prisma
- Map Prisma entities to domain models
- Handle relationships and joins

**Example:**

```typescript
// src/models/repositories/TournamentRepository.ts
export class TournamentRepository extends Database {
  async findAll(): Promise<TournamentModel[]> {
    const tournaments = await this.tournament.findMany({
      orderBy: { createdAt: "desc" },
    });
    return tournaments.map(mapToTournament);
  }

  async save(data: TournamentModel): Promise<TournamentModel> {
    const tournament = await this.tournament.upsert({
      where: { id: data.id },
      create: {
        /* ... */
      },
      update: {
        /* ... */
      },
    });
    return mapToTournament(tournament)!;
  }
}
```

**Key Files:**

- `TournamentRepository.ts` - Tournament data access
- `DrawRepository.ts` - Draw and match data access
- `PlayerRepository.ts` - Player data access

**Rules:**

- ✅ Extend Database class (which extends PrismaClient)
- ✅ Use mapper functions to convert Prisma → Domain models
- ✅ CRUD operations only
- ❌ No business logic
- ❌ No validation

---

### 5. Models (`src/models/`)

**Purpose:** Domain models with encapsulation

**Responsibilities:**

- Encapsulate entity data
- Private fields with getters/setters
- Type-safe data structures

**Example:**

```typescript
// src/models/tournament.ts
export class TournamentModel {
  readonly #id: string;
  #name: string;
  #status: TournamentStatus;

  constructor(data: TournamentDataInput) {
    this.#id = data.id ?? uuidv4();
    this.#name = data.name;
    this.#status = data.status ?? TournamentStatus.Upcoming;
  }

  get id(): string {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  set name(name: string) {
    this.#name = name;
  }
}
```

---

## Data Flow Examples

### Creating a Tournament

```
1. POST /api/tournaments (with JSON body)
   ↓
2. tournament-router.ts
   - Validates request with express-validator
   - Calls tournamentController.createTournament()
   ↓
3. tournament-controller.ts
   - Passes data to tournamentService.createTournament()
   ↓
4. tournament-service.ts
   - Validates business rules (dates, etc.)
   - Creates TournamentModel instance
   - Calls tournamentRepository.save()
   ↓
5. TournamentRepository.ts
   - Executes Prisma upsert
   - Maps result to TournamentModel
   - Returns model
   ↓
6. Service converts to DTO → Controller → Route
   ↓
7. HTTP Response (201 Created with tournament data)
```

### Generating a Draw

```
1. POST /api/tournaments/:id/draw (with players)
   ↓
2. draw-router.ts
   - Validates players array
   - Calls drawController.generateDraw()
   ↓
3. draw-controller.ts
   - Passes to drawManagementService.generateDraw()
   ↓
4. draw-management-service.ts
   - Fetches tournament via tournamentService
   - Validates status (must be Upcoming)
   - Validates player count matches draw size
   - Calls drawOrchestratorService.generateDraw()
   - Saves draw via drawRepository.create()
   - Updates tournament status to Active
   - Returns draw structure
   ↓
5. drawOrchestratorService
   - Uses bracketBuilder to create bracket
   - Uses seedingStrategy to position players
   - Generates DrawMatch entries
   ↓
6. DrawRepository.ts
   - Saves draw entries and matches
   - Maps to domain models
   ↓
7. HTTP Response (201 Created with draw structure)
```

### Updating Match Result

```
1. PATCH /api/tournaments/:id/matches/:matchId
   ↓
2. draw-router.ts → drawController.updateMatchResult()
   ↓
3. draw-management-service.ts
   - Validates match exists
   - Validates match not already completed
   - Validates winner is a participant
   - Advances winner to next round
   - Updates database via drawRepository
   - Emits events (playerAdvanced, roundCompleted)
   - Checks tournament completion
   - Updates tournament status if final
   ↓
4. Events trigger SSE notifications to clients
   ↓
5. HTTP Response (200 OK with updated match)
```

---

## Event System

### Event Bus (`src/event-bus.ts`)

Used for cross-cutting concerns and real-time notifications:

**Events:**

- `playerAdvanced` - Player wins match and advances
- `roundCompleted` - All matches in a round finished
- `tournamentCompleted` - Final match decided
- `sseNotification` - Real-time update to connected clients

**Flow:**

```
Service emits event
    ↓
Event Bus broadcasts
    ↓
SSE Router sends to clients
    ↓
Frontend receives real-time update
```

---

## Validation Strategy

### Request Validation (express-validator)

- Applied at route level
- Validates request body, params, query
- Returns 400 Bad Request on validation failure

### Business Validation (Services)

- Applied in service layer
- Validates business rules
- Returns 400/409 with descriptive error messages

**Example:**

```typescript
// Route validation
router.post("/", createTournamentValidator, handleValidationErrors, ...);

// Service validation
if (endDate < startDate) {
  throw new Error("End date must be after start date");
}
```

---

## Database Pattern

### Prisma Integration

```typescript
// Database base class
class Database extends PrismaClient {
  constructor() {
    super();
  }
}

// Repositories extend Database
class TournamentRepository extends Database {
  // Access via this.tournament, this.player, etc.
}
```

### Mapper Functions

Convert Prisma entities to domain models:

```typescript
function mapToTournament(dbTournament: PrismaTournament): TournamentModel {
  return new TournamentModel({
    id: dbTournament.id,
    name: dbTournament.name,
    status: convertToFamilyType(dbTournament.status, TournamentStatus),
    // ...
  });
}
```

---

## Summary

**Keep Logic Where It Belongs:**

| Layer        | Concern                        | Example                     |
| ------------ | ------------------------------ | --------------------------- |
| Routes       | HTTP endpoint mapping          | URL paths, middleware       |
| Controllers  | Request/response handling      | Parse body, return JSON     |
| Services     | Business logic & orchestration | Validate dates, emit events |
| Repositories | Data access                    | Prisma queries, mappings    |
| Models       | Domain entity encapsulation    | Private fields, getters     |

**Data Always Flows Downward:** Routes → Controllers → Services → Repositories → Database

**Responses Flow Upward:** Database → Repositories → Services → Controllers → Routes → HTTP Response
