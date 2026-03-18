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
  findAll: vi.fn().mockResolvedValue([mockTournament]),
  findById: vi.fn().mockResolvedValue(mockTournament),
  save: vi.fn().mockResolvedValue(mockTournament),
  // Additional methods can be mocked as needed
} as any;
