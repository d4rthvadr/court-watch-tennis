import { vi } from "vitest";
import { GameStatus } from "../../src/types/game";

const defaultGameMock = [
  {
    id: "game-1",
    name: "Quarterfinal 1",
    status: GameStatus.Scheduled,
    startTime: "2026-04-01T10:00:00Z",
    endTime: null,
    playerOneId: "b1a7e8c0-1234-4abc-9def-000000000001",
    playerTwoId: "b1a7e8c0-1234-4abc-9def-000000000002",
    courtId: "court-1",
  },
  {
    id: "game-2",
    name: "Quarterfinal 2",
    status: GameStatus.Ongoing,
    startTime: "2026-04-01T12:00:00Z",
    endTime: null,
    playerOneId: "b1a7e8c0-1234-4abc-9def-000000000003",
    playerTwoId: "b1a7e8c0-1234-4abc-9def-000000000004",
    courtId: "court-2",
  },
];
let games = [...defaultGameMock];

export const gameRepositoryMock = {
  findAllGames: vi.fn(() => Promise.resolve([...games])),
  findGameById: vi.fn((id) =>
    Promise.resolve(games.find((g) => g.id === id) || null),
  ),
  findAll: vi.fn(() => Promise.resolve([...games])),
  findById: vi.fn((id) =>
    Promise.resolve(games.find((g) => g.id === id) || null),
  ),
  save: vi.fn((gameModel) => {
    const newGame = {
      id: `game-${games.length + 1}`,
      name: gameModel.name,
      status: gameModel.status,
      startTime: gameModel.startTime,
      endTime: gameModel.endTime,
      playerOneId: gameModel.playerOneId,
      playerTwoId: gameModel.playerTwoId,
      courtId: gameModel.courtId,
    };
    games.push(newGame);
    return Promise.resolve(newGame);
  }),
  update: vi.fn((id, data) => {
    const idx = games.findIndex((g) => g.id === id);
    if (idx === -1) return Promise.resolve(null);
    // Ensure keys are camelCase
    const updateData = { ...data };
    if (updateData.player_one_id) {
      updateData.playerOneId = updateData.player_one_id;
      delete updateData.player_one_id;
    }
    if (updateData.player_two_id) {
      updateData.playerTwoId = updateData.player_two_id;
      delete updateData.player_two_id;
    }
    games[idx] = {
      ...games[idx],
      name: updateData.name ?? games[idx].name,
      status: updateData.status ?? games[idx].status,
      startTime: updateData.startTime ?? games[idx].startTime,
      endTime: updateData.endTime ?? games[idx].endTime,
      playerOneId: updateData.playerOneId ?? games[idx].playerOneId,
      playerTwoId: updateData.playerTwoId ?? games[idx].playerTwoId,
      courtId: updateData.courtId ?? games[idx].courtId,
    };
    return Promise.resolve(games[idx]);
  }),
  _reset: () => {
    games = [...defaultGameMock];
  },
} as any;
