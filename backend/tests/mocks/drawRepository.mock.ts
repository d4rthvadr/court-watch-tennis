import { vi } from "vitest";

export const mockDraw8 = {
  tournamentId: "tournament-8",
  drawSize: 8,
  entries: [
    {
      id: "A",
      tournamentId: "tournament-8",
      position: 1,
      playerId: "A",
      seed: 1,
      round: "First",
      matchId: "M1",
    },
    {
      id: "B",
      tournamentId: "tournament-8",
      position: 2,
      playerId: "B",
      seed: 2,
      round: "First",
      matchId: "M1",
    },
    // ... more entries
  ],
  matches: [
    {
      id: "M1",
      tournamentId: "tournament-8",
      round: "First",
      position: 1,
      player1Id: "A",
      player2Id: "B",
      winnerId: null,
      nextMatchId: "M2",
      status: "Scheduled",
      courtId: null,
      startTime: null,
      endTime: null,
    },
    // ... more matches
  ],
};

export const mockDraw16 = {
  tournamentId: "tournament-16",
  drawSize: 16,
  entries: [
    {
      id: "P1",
      tournamentId: "tournament-16",
      position: 1,
      playerId: "P1",
      seed: 1,
      round: "First",
      matchId: "M1",
    },
    // ... more entries
  ],
  matches: [
    {
      id: "M1",
      tournamentId: "tournament-16",
      round: "First",
      position: 1,
      player1Id: "P1",
      player2Id: "P2",
      winnerId: null,
      nextMatchId: "M2",
      status: "Scheduled",
      courtId: null,
      startTime: null,
      endTime: null,
    },
    // ... more matches
  ],
};

export const mockDraw32 = {
  tournamentId: "tournament-32",
  drawSize: 32,
  entries: [
    {
      id: "P1",
      tournamentId: "tournament-32",
      position: 1,
      playerId: "P1",
      seed: 1,
      round: "First",
      matchId: "M1",
    },
    // ... more entries
  ],
  matches: [
    {
      id: "M1",
      tournamentId: "tournament-32",
      round: "First",
      position: 1,
      player1Id: "P1",
      player2Id: "P2",
      winnerId: null,
      nextMatchId: "M2",
      status: "Scheduled",
      courtId: null,
      startTime: null,
      endTime: null,
    },
    // ... more matches
  ],
};
// Missing comma added here

// Internal state for created draws
let createdDraws: Record<string, any> = {};

export const drawRepositoryMock = {
  create: vi.fn(({ tournamentId, drawSize, entries, matches }) => {
    if (createdDraws[tournamentId]) {
      return Promise.reject(
        new Error(`Draw already exists for tournament ${tournamentId}`),
      );
    }
    if (drawSize !== 16) {
      return Promise.reject(new Error("Invalid draw size"));
    }
    // Store the draw object
    const draw = {
      drawSize: drawSize, // API expects 'drawSize'
      entries,
      matches,
    };
    createdDraws[tournamentId] = draw;
    return Promise.resolve(draw);
  }),
  findByTournamentId: vi.fn((tournamentId) => {
    return Promise.resolve(createdDraws[tournamentId] || null);
  }),
  // Utility to reset state for tests

  mockClear: () => {
    createdDraws = {};
  },
  _reset: () => {
    createdDraws = {};
  },
} as any;
