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

export const drawRepositoryMock = {
  createDraw: vi.fn((tournamentId, size) => {
    if (size === 8) return Promise.resolve(mockDraw8);
    if (size === 16) return Promise.resolve(mockDraw16);
    if (size === 32) return Promise.resolve(mockDraw32);
    return Promise.reject(new Error("Invalid draw size"));
  }),
  findByTournamentId: vi.fn((tournamentId) => {
    if (tournamentId === "tournament-8") return Promise.resolve(mockDraw8);
    if (tournamentId === "tournament-16") return Promise.resolve(mockDraw16);
    if (tournamentId === "tournament-32") return Promise.resolve(mockDraw32);
    return Promise.resolve(null);
  }),
} as any;
