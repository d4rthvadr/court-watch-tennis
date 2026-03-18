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
import { gameRepositoryMock } from "../mocks/gameRepository.mock";

beforeAll(() => {
  vi.spyOn(repositories, "gameRepository", "get").mockReturnValue(
    gameRepositoryMock,
  );
});

describe("Game Integration", () => {
  beforeEach(() => {
    if (typeof gameRepositoryMock._reset === "function") {
      gameRepositoryMock._reset();
    }
    gameRepositoryMock.findAll.mockClear();
    gameRepositoryMock.findById.mockClear();
    gameRepositoryMock.save.mockClear();
    gameRepositoryMock.update.mockClear();
  });

  afterEach(() => {
    if (typeof gameRepositoryMock._reset === "function") {
      gameRepositoryMock._reset();
    }
    gameRepositoryMock.findAll.mockClear();
    gameRepositoryMock.findById.mockClear();
    gameRepositoryMock.save.mockClear();
    gameRepositoryMock.update.mockClear();
  });

  it("should fetch all games", async () => {
    const res = await request(app).get("/api/games");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should fetch game by id", async () => {
    const res = await request(app).get("/api/games/game-1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("game-1");
    expect(res.body.name).toBe("Quarterfinal 1");
  });

  it("should return 404 for non-existent game", async () => {
    const res = await request(app).get("/api/games/nonexistent-game");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("should create a new game", async () => {
    const newGame = {
      name: "Semifinal 1",
      status: "Scheduled",
      startTime: "2026-04-02T10:00:00Z",
      endTime: "2026-04-02T11:00:00Z",
      playerOneId: "b1a7e8c0-1234-4abc-9def-000000000005",
      playerTwoId: "b1a7e8c0-1234-4abc-9def-000000000006",
      courtId: "court-3",
    };
    const res = await request(app).post("/api/games").send(newGame);
    console.log(res.body);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Semifinal 1");
    expect(res.body.playerOneId).toBe("b1a7e8c0-1234-4abc-9def-000000000005");
    expect(res.body.playerTwoId).toBe("b1a7e8c0-1234-4abc-9def-000000000006");
  });

  it("should update a game", async () => {
    // First, update status from Scheduled to Ongoing
    const updateOngoing = {
      status: "Ongoing",
    };
    const resOngoing = await request(app)
      .patch("/api/games/game-1")
      .send(updateOngoing);
    expect(resOngoing.status).toBe(200);
    expect(resOngoing.body.status).toBe("Ongoing");

    // Then, update status from Ongoing to Completed and update name/endTime
    const updateCompleted = {
      name: "Quarterfinal 1 Updated",
      status: "Completed",
      endTime: "2026-04-01T11:30:00Z",
    };
    const resCompleted = await request(app)
      .patch("/api/games/game-1")
      .send(updateCompleted);
    console.log(resCompleted.body);
    expect(resCompleted.status).toBe(200);
    expect(resCompleted.body.name).toBe("Quarterfinal 1 Updated");
    expect(resCompleted.body.status).toBe("Completed");
    expect(resCompleted.body.endTime).toBe("2026-04-01T11:30:00Z");
  });
});
