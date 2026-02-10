# API Documentation

## Base URL

```
http://localhost:4001/api
```

---

## Tournaments

### Get All Tournaments

```http
GET /tournaments
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "US Open 2026",
      "location": "New York",
      "startDate": "2026-08-31",
      "endDate": "2026-09-13",
      "surfaceType": "Hard",
      "drawSize": 128,
      "status": "Upcoming",
      "matchType": "Singles"
    }
  ]
}
```

---

### Get Tournament by ID

```http
GET /tournaments/:id
```

**Response:** `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "name": "US Open 2026",
    "location": "New York",
    "startDate": "2026-08-31",
    "endDate": "2026-09-13",
    "surfaceType": "Hard",
    "drawSize": 128,
    "status": "Upcoming",
    "matchType": "Singles"
  }
}
```

**Errors:**

- `404 Not Found` - Tournament not found

---

### Create Tournament

```http
POST /tournaments
```

**Request Body:**

```json
{
  "name": "US Open 2026",
  "location": "New York",
  "startDate": "2026-08-31",
  "endDate": "2026-09-13",
  "surfaceType": "Hard",
  "drawSize": 128,
  "matchType": "Singles"
}
```

**Validation:**

- `name` - Required, non-empty string
- `location` - Required, non-empty string
- `startDate` - Required, valid date string
- `endDate` - Required, valid date string (must be after startDate)
- `surfaceType` - Required, one of: `Hard`, `Clay`, `Grass`, `Carpet`
- `drawSize` - Required, one of: `8`, `16`, `32`, `64`, `128`
- `matchType` - Optional, one of: `Singles`, `Doubles` (default: `Singles`)

**Response:** `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "name": "US Open 2026",
    "status": "Upcoming",
    ...
  }
}
```

**Errors:**

- `400 Bad Request` - Validation errors
- `400 Bad Request` - End date before start date

---

### Update Tournament Status

```http
PATCH /tournaments/:id/status
```

**Request Body:**

```json
{
  "status": "Active"
}
```

**Valid Status Transitions:**

- `Upcoming` → `Active`
- `Active` → `Completed`

**Response:** `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "status": "Active",
    ...
  }
}
```

**Errors:**

- `400 Bad Request` - Invalid status transition
- `404 Not Found` - Tournament not found

---

## Draw Management

### Generate Draw

```http
POST /tournaments/:tournamentId/draw
```

**Request Body:**

```json
{
  "players": [
    { "id": "uuid", "name": "Rafael Nadal", "seed": 1 },
    { "id": "uuid", "name": "Novak Djokovic", "seed": 2 },
    ...
  ]
}
```

**Validation:**

- `players` - Required array
- `players[].id` - Required UUID
- `players[].name` - Required non-empty string
- `players[].seed` - Optional integer (1-32)
- Player count must match tournament draw size

**Response:** `201 Created`

```json
{
  "data": {
    "tournamentId": "uuid",
    "drawSize": 128,
    "entries": [...],
    "matches": [
      {
        "id": "uuid",
        "round": "R1",
        "position": 1,
        "player1Id": "uuid",
        "player2Id": "uuid",
        "status": "Scheduled"
      }
    ]
  }
}
```

**Errors:**

- `400 Bad Request` - Validation errors
- `400 Bad Request` - Player count mismatch
- `400 Bad Request` - Draw already exists
- `400 Bad Request` - Tournament not in Upcoming status
- `404 Not Found` - Tournament not found

---

### Get Draw

```http
GET /tournaments/:tournamentId/draw
```

**Response:** `200 OK`

```json
{
  "data": {
    "tournamentId": "uuid",
    "drawSize": 128,
    "entries": [...],
    "matches": [...]
  }
}
```

**Errors:**

- `404 Not Found` - Draw not found

---

## Matches

### Get All Matches

```http
GET /tournaments/:tournamentId/matches
```

**Query Parameters:**

- `round` (optional) - Filter by round (`R1`, `R2`, `R3`, `R4`, `QF`, `SF`, `F`)

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "tournamentId": "uuid",
      "round": "R1",
      "position": 1,
      "player1Id": "uuid",
      "player2Id": "uuid",
      "winnerId": null,
      "status": "Scheduled"
    }
  ]
}
```

---

### Update Match Result

```http
PATCH /tournaments/:tournamentId/matches/:matchId
```

**Request Body:**

```json
{
  "winnerId": "uuid"
}
```

**Validation:**

- `winnerId` - Required UUID
- Winner must be one of the match participants
- Match must not already be completed

**Response:** `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "winnerId": "uuid",
    "status": "Completed",
    ...
  }
}
```

**Side Effects:**

- Winner advances to next round
- If round complete, emits `roundCompleted` event
- If final match, updates tournament status to `Completed`
- Triggers SSE notifications

**Errors:**

- `400 Bad Request` - Winner not a participant
- `400 Bad Request` - Match already completed
- `404 Not Found` - Match not found

---

## Players

### Get All Players

```http
GET /players
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Rafael Nadal",
      "status": "Active",
      "rank": 1
    }
  ]
}
```

---

## Real-time Events (SSE)

### Subscribe to Events

```http
GET /events
```

**Response:** Server-Sent Events stream

**Event Types:**

- `playerAdvanced` - Player wins match
- `roundCompleted` - All matches in round finished
- `tournamentCompleted` - Tournament winner decided

**Example Event:**

```
event: message
data: {"type":"playerAdvanced","payload":{"tournamentId":"uuid","matchId":"uuid","winnerId":"uuid","round":"QF"}}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Status Codes:**

- `400 Bad Request` - Validation error or business rule violation
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently no rate limiting implemented.

---

## Authentication

Currently no authentication required. All endpoints are public.
