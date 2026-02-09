import { Game, GameStatus } from "../types";

export const initialGames: Game[] = [
  {
    id: "game-1",
    name: "Match 1",
    status: GameStatus.Scheduled,
    startTime: "2024-07-01T10:00:00Z",
    endTime: "2024-07-01T12:00:00Z",
    player_one_id: "player-1",
    player_two_id: "player-2",
    courtId: "court-1",
  },
  {
    id: "game-2",
    name: "Match 2",
    status: GameStatus.Ongoing,
    startTime: "2024-07-01T12:30:00Z",
    endTime: "",
    player_one_id: "player-3",
    player_two_id: "player-4",
    courtId: "court-2",
  },
];
