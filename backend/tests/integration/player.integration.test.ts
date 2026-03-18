import { describe, it, expect, afterAll, vi, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/app";

import * as repositories from "../../src/models/repositories";
import {
  playerRepositoryMock,
  mockPlayer,
} from "../mocks/playerRepository.mock";

beforeAll(() => {
  vi.spyOn(repositories, "playerRepository", "get").mockReturnValue(
    playerRepositoryMock,
  );
});

describe("Player Integration", () => {
  let playerId: string;

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should create a player", async () => {
    const payload = {
      name: "Novak Djokovic",
      status: "Active",
      rank: 1,
    };

    const res = await request(app).post("/api/players").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.name).toBe(payload.name);
    playerId = res.body.data.id;
  });

  it("should fetch all players", async () => {
    const res = await request(app).get("/api/players");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data[0]).toHaveProperty("id");
    expect(res.body.data[0].name).toBe("Novak Djokovic");
  });

  it("should fetch player by id", async () => {
    const res = await request(app).get(`/api/players/${mockPlayer.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.id).toBe(mockPlayer.id);
    expect(res.body.data.name).toBe("Novak Djokovic");
  });

  it("should return 404 if player does not exist", async () => {
    playerRepositoryMock.findById.mockResolvedValueOnce(null);
    const res = await request(app).get("/api/players/nonexistent-id");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});
