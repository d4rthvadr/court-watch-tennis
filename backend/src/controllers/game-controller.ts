import { NotFoundError } from "../errors";
import { Game, GameStatus, EventTypes } from "../types";
import { initialGames } from "../data/games.data";
import { eventBus } from "../event-bus";

class GameController {
  games: Game[] = initialGames;

  findAll() {
    return this.games;
  }

  find(id: string): Game | undefined {
    const game = this.games.find((game) => game.id === id);

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

    this.games = [...this.games, game];
  }

  /**
   * Update an existing game
   */
  update(id: string, updates: Partial<Game>): Game {
    const gameIndex = this.games.findIndex((g) => g.id === id);

    if (gameIndex === -1) {
      throw new NotFoundError(`Game not found with id: ${id}`);
    }

    const currentGame = this.games[gameIndex];
    const updatedGame = { ...currentGame, ...updates };

    this.games[gameIndex] = updatedGame;

    // Emit event if match is completed
    if (
      updates.status === GameStatus.Completed &&
      currentGame.status !== GameStatus.Completed
    ) {
      eventBus.createEvent(EventTypes.matchCompleted, {
        gameId: id,
        game: updatedGame,
      });

      const eventData = JSON.stringify({
        type: EventTypes.matchCompleted,
        payload: updatedGame,
      });
      eventBus.createEvent(EventTypes.sseNotification, eventData);
    }

    return updatedGame;
  }

  /**
   * Update game status
   */
  updateStatus(id: string, status: GameStatus): Game {
    return this.update(id, { status });
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
