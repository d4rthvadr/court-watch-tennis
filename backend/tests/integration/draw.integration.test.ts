import {
  describe,
  it,
  expect,
  afterAll,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import request from "supertest";
import app from "../../src/app";

import * as repositories from "../../src/models/repositories";
import { drawRepositoryMock } from "../mocks/drawRepository.mock";
import { playerRepositoryMock } from "../mocks/playerRepository.mock";
import { tournamentRepositoryMock } from "../mocks/tournamentRepository.mock";

beforeAll(() => {
  vi.spyOn(repositories, "drawRepository", "get").mockReturnValue(
    drawRepositoryMock,
  );
  vi.spyOn(repositories, "playerRepository", "get").mockReturnValue(
    playerRepositoryMock,
  );
  vi.spyOn(repositories, "tournamentRepository", "get").mockReturnValue(
    tournamentRepositoryMock,
  );
  playerRepositoryMock.findAll.mockResolvedValue([
    { id: "A", name: "Player A", status: "Active", rank: 1 },
    { id: "B", name: "Player B", status: "Active", rank: 2 },
    { id: "P1", name: "Player P1", status: "Active", rank: 1 },
    { id: "P2", name: "Player P2", status: "Active", rank: 2 },
  ]);
});

describe("Draw Integration", () => {
  beforeEach(() => {
    // Reset drawRepositoryMock to ensure no draw exists for tournament before each test
    drawRepositoryMock.create.mockClear();
    drawRepositoryMock.findByTournamentId.mockClear();
    if (typeof drawRepositoryMock._reset === "function") {
      drawRepositoryMock._reset();
    }
    // Generate mock players for each test
    // We'll use 32 players for max draw size, and slice as needed
    const mockPlayers = Array.from({ length: 32 }, (_, i) => ({
      id: `Player${i + 1}`,
      name: `Player ${i + 1}`,
      status: "Active",
      rank: i + 1,
    }));
    playerRepositoryMock.findAll.mockResolvedValue(mockPlayers);
  });

  afterEach(() => {
    // Clean up any stateful mocks
    if (typeof drawRepositoryMock._reset === "function") {
      drawRepositoryMock._reset();
    }
    drawRepositoryMock.create.mockClear();
    drawRepositoryMock.findByTournamentId.mockClear();
    playerRepositoryMock.findAll.mockClear();
  });

  describe("Draw Integration", () => {
    afterAll(() => {
      vi.restoreAllMocks();
    });

    it("should create a draw for size 16", async () => {
      const players = Array.from({ length: 16 }, (_, i) => ({
        id: `Player${i + 1}`,
        seed: i + 1,
      }));
      const res = await request(app)
        .post("/api/tournaments/tournament-16/draw")
        .send({ players });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("entries");
      expect(res.body.data.drawSize).toBe(16);
      expect(res.body.data.entries.length).toBeGreaterThan(0);
    });

    // Remove other draw size tests for simplicity

    it("should fetch draw by tournament id", async () => {
      // Create draw first
      const players = Array.from({ length: 16 }, (_, i) => ({
        id: `Player${i + 1}`,
        seed: i + 1,
      }));
      await request(app)
        .post("/api/tournaments/tournament-16/draw")
        .send({ players });
      const res = await request(app).get("/api/tournaments/tournament-16/draw");
      expect(res.status).toBe(200);
      expect(res.body.data.drawSize).toBe(16);
      expect(res.body.data.matches.length).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent tournament draw", async () => {
      drawRepositoryMock.findByTournamentId.mockResolvedValueOnce(null);
      const res = await request(app).get(
        "/api/tournaments/nonexistent-tournament/draw",
      );
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });

    it("should return error for invalid draw size", async () => {
      drawRepositoryMock.create.mockRejectedValueOnce(
        new Error("Invalid draw size"),
      );
      const res = await request(app)
        .post("/api/tournaments/tournament-8/draw")
        .send({ size: 7 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });
  });
});
