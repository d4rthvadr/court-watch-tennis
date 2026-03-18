import { vi } from "vitest";
import {
  TournamentStatus,
  SurfaceType,
  MatchType,
  DrawSize,
} from "../../src/types";

export const mockTournament = {
  id: "mock-id-123",
  name: "Spring Open",
  location: "London",
  startDate: "2026-04-01",
  endDate: "2026-04-10",
  surfaceType: SurfaceType.Clay,
  drawSize: DrawSize.Eight,
  status: TournamentStatus.Upcoming,
  matchType: MatchType.Singles,
};

export const tournamentRepositoryMock = {
  findAll: vi.fn().mockResolvedValue([
    {
      ...mockTournament,
      id: "tournament-16",
      drawSize: 16,
    },
  ]),
  findById: vi.fn((id) => {
    if (id === "tournament-16") {
      return Promise.resolve({
        ...mockTournament,
        id: "tournament-16",
        drawSize: 16,
      });
    }
    return Promise.resolve(mockTournament);
  }),
  save: vi.fn().mockResolvedValue({
    ...mockTournament,
    id: "tournament-16",
    drawSize: 16,
  }),
  // Additional methods can be mocked as needed
} as any;
