import { vi } from "vitest";
import { PlayerStatus } from "../../src/types/player";

export const mockPlayer = {
  id: "mock-player-1",
  name: "Novak Djokovic",
  status: PlayerStatus.Active,
  rank: 1,
};

export const playerRepositoryMock = {
  findAll: vi.fn().mockResolvedValue([mockPlayer]),
  findById: vi.fn().mockResolvedValue(mockPlayer),
  save: vi.fn().mockResolvedValue(mockPlayer),
  delete: vi.fn().mockResolvedValue(undefined),
} as any;
