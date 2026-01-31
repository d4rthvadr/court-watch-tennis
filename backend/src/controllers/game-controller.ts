import { NotFoundError } from "../errors";
import { Game, GameStatus } from "../types";
import { initialGames } from "../data/games.data";

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
