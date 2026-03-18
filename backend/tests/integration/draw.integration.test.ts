import {
  describe,
  it,
  expect,
  afterAll,
  vi,
  beforeAll,
  beforeEach,
} from "vitest";
import request from "supertest";
import app from "../../src/app";

import * as repositories from "../../src/models/repositories";
import {
  drawRepositoryMock,
  mockDraw8,
  mockDraw16,
  mockDraw32,
} from "../mocks/drawRepository.mock";
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
    drawRepositoryMock.createDraw.mockClear();
    drawRepositoryMock.findByTournamentId.mockClear();
    // Optionally reset any stateful tracking if needed
  });

  describe("Draw Integration", () => {
    afterAll(() => {
      vi.restoreAllMocks();
    });

    it("should create a draw for size 8", async () => {
      const players = [
        { id: "A", seed: 1 },
        { id: "B", seed: 2 },
      ];
      const res = await request(app)
        .post("/api/tournaments/tournament-8/draw")
        .send({ players });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("entries");
      expect(res.body.data.drawSize).toBe(8);
      expect(res.body.data.entries.length).toBeGreaterThan(0);
    });

    it("should create a draw for size 16", async () => {
      const players = [
        { id: "P1", seed: 1 },
        { id: "P2", seed: 2 },
      ];
      const res = await request(app)
        .post("/api/tournaments/tournament-16/draw")
        .send({ players });
      expect(res.status).toBe(201);
      expect(res.body.data.drawSize).toBe(16);
      expect(res.body.data.entries.length).toBeGreaterThan(0);
    });

    it("should create a draw for size 32", async () => {
      const players = [
        { id: "P1", seed: 1 },
        { id: "P2", seed: 2 },
      ];
      const res = await request(app)
        .post("/api/tournaments/tournament-32/draw")
        .send({ players });
      expect(res.status).toBe(201);
      expect(res.body.data.drawSize).toBe(32);
      expect(res.body.data.entries.length).toBeGreaterThan(0);
    });

    it("should fetch draw by tournament id", async () => {
      const res = await request(app).get("/api/tournaments/tournament-8/draw");
      expect(res.status).toBe(200);
      expect(res.body.data.size).toBe(8);
      expect(res.body.data.bracket.length).toBeGreaterThan(0);
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
      drawRepositoryMock.createDraw.mockRejectedValueOnce(
        new Error("Invalid draw size"),
      );
      const res = await request(app)
        .post("/api/tournaments/tournament-8/draw")
        .send({ size: 7 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid draw size/i);
    });
  });
});
