import { NotFoundError } from "./errors";
import { Game } from "./types";

const initialGames: Game[] = [
  {
    id: "game-1",
    name: "Match 1",
    status: "Scheduled",
    startTime: "2024-07-01T10:00:00Z",
    endTime: "2024-07-01T12:00:00Z",
    player_one_id: "player-1",
    player_two_id: "player-2",
    courtId: "court-1",
  },
  {
    id: "game-2",
    name: "Match 2",
    status: "Ongoing",
    startTime: "2024-07-01T12:30:00Z",
    endTime: "",
    player_one_id: "player-3",
    player_two_id: "player-4",
    courtId: "court-2",
  },
];

class GameController {
  games: Game[] = initialGames;
  findAll() {
    return initialGames;
  }
  find(id: string): Game | undefined {
    const game = initialGames.find((game) => game.id === id);

    if (!game) {
      throw new NotFoundError(`Game not found with id: ${id}`);
    }

    return game;
  }

  save(game: Game) {
    const matchingGames = this.games.filter((g) => g.id == game.id);

    if (matchingGames.length > 0) {
      throw new NotFoundError(`Game already exists with id: ${game.id}`);
    }

    this.games = [...matchingGames, game];
  }

  delete(id: string) {
    const matchingGames = this.games.filter((g) => g.id !== id);

    if (matchingGames.length === this.games.length) {
      console.warn("Game not found for deletion");
      return;
    }

    this.games = matchingGames;
  }
}

export const gameController = new GameController();
