import { describe, it, expect, afterAll, vi, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/app";

import * as repositories from "../../src/models/repositories";
import {
  tournamentRepositoryMock,
  mockTournament,
} from "../mocks/tournamentRepository.mock";

beforeAll(() => {
  vi.spyOn(repositories, "tournamentRepository", "get").mockReturnValue(
    tournamentRepositoryMock,
  );
});

describe("Tournament Integration", () => {
  let tournamentId: string;

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should create a tournament", async () => {
    const payload = {
      name: "Spring Open",
      location: "London",
      startDate: "2026-04-01",
      endDate: "2026-04-10",
      surfaceType: "Clay",
      drawSize: 8,
    };

    const res = await request(app).post("/api/tournaments").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.name).toBe(payload.name);
    tournamentId = res.body.data.id;
  });

  it("should fetch all tournaments", async () => {
    const res = await request(app).get("/api/tournaments");
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data[0]).toHaveProperty("id");
    expect(res.body.data[0].name).toBe("Spring Open");
  });

  it("should fetch tournament by id", async () => {
    const res = await request(app).get(`/api/tournaments/${mockTournament.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.id).toBe(mockTournament.id);
    expect(res.body.data.name).toBe("Spring Open");
  });

  it("should return 404 if tournament does not exist", async () => {
    // Mock findById to return null for this test
    tournamentRepositoryMock.findById.mockResolvedValueOnce(null);
    const res = await request(app).get("/api/tournaments/nonexistent-id");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});
