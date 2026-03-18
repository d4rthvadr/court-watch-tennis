import { NotFoundError } from "../errors";
import { Game, GameStatus, EventTypes } from "../types";
import { gameRepository } from "../models/repositories";
import { GameModel } from "../models/game";
import { eventBus } from "../event-bus";

const toGameDTO = (g: GameModel): Game => ({
  id: g.id!,
  name: g.name,
  status: g.status,
  startTime: g.startTime,
  endTime: g.endTime,
  playerOneId: g.playerOneId,
  playerTwoId: g.playerTwoId,
  courtId: g.courtId,
});

export interface CreateGameData {
  name?: string;
  status?: GameStatus;
  startTime?: string;
  endTime?: string;
  playerOneId: string;
  playerTwoId: string;
  courtId: string;
}

export interface UpdateGameData {
  name?: string;
  status?: GameStatus;
  startTime?: string;
  endTime?: string;
  playerOneId?: string;
  playerTwoId?: string;
  courtId?: string;
}

class GameService {
  /**
   * Get all games
   */
  async findAllGames(): Promise<Game[]> {
    const games = await gameRepository.findAll();
    return games.map(toGameDTO);
  }

  /**
   * Get game by ID
   */
  async findGameById(id: string): Promise<Game> {
    const game = await gameRepository.findById(id);
    if (!game) {
      throw new NotFoundError(`Game not found with id: ${id}`);
    }
    return toGameDTO(game);
  }

  /**
   * Create a new game
   */
  async createGame(data: CreateGameData): Promise<Game> {
    // Business logic: validate player IDs are different
    if (data.playerOneId === data.playerTwoId) {
      throw new Error("Player one and player two must be different");
    }

    // Business logic: validate times if provided
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (end < start) {
        throw new Error("End time must be after start time");
      }
    }

    const game = await gameRepository.save(
      new GameModel({
        name: data.name,
        status: data.status || GameStatus.Scheduled,
        startTime: data.startTime,
        endTime: data.endTime,
        playerOneId: data.playerOneId,
        playerTwoId: data.playerTwoId,
        courtId: data.courtId,
      }),
    );

    return toGameDTO(game);
  }

  /**
   * Update game
   */
  async updateGame(id: string, data: UpdateGameData): Promise<Game> {
    const game = await gameRepository.findById(id);
    if (!game) {
      throw new NotFoundError(`Game not found with id: ${id}`);
    }

    // Business logic: prevent updates to completed games
    if (game.status === GameStatus.Completed) {
      throw new Error("Cannot update a completed game");
    }

    // Business logic: validate player IDs if being updated
    const newPlayerOneId = data.playerOneId || game.playerOneId;
    const newPlayerTwoId = data.playerTwoId || game.playerTwoId;
    if (newPlayerOneId === newPlayerTwoId) {
      throw new Error("Player one and player two must be different");
    }

    // Update fields if provided
    if (data.name !== undefined) game.name = data.name;
    if (data.status !== undefined) {
      // Business logic: validate status transitions
      this.validateStatusTransition(game.status, data.status);

      game.status = data.status;

      // Emit event if match is newly completed
      // Note: Only games with non-Completed status can transition to Completed (enforced by validateStatusTransition)
      if (data.status === GameStatus.Completed) {
        const gameDTO = toGameDTO(game);
        eventBus.createEvent(EventTypes.matchCompleted, {
          gameId: id,
          game: gameDTO,
        });

        const eventData = JSON.stringify({
          type: EventTypes.matchCompleted,
          payload: gameDTO,
        });
        eventBus.createEvent(EventTypes.sseNotification, eventData);
      }
    }
    if (data.startTime !== undefined) game.startTime = data.startTime;
    if (data.endTime !== undefined) game.endTime = data.endTime;
    if (data.playerOneId !== undefined) game.playerOneId = data.playerOneId;
    if (data.playerTwoId !== undefined) game.playerTwoId = data.playerTwoId;
    if (data.courtId !== undefined) game.courtId = data.courtId;

    // Business logic: validate times
    if (game.startTime && game.endTime) {
      const start = new Date(game.startTime);
      const end = new Date(game.endTime);
      if (end < start) {
        throw new Error("End time must be after start time");
      }
    }

    const updatedGame = await gameRepository.save(game);
    return toGameDTO(updatedGame);
  }

  /**
   * Update game status
   */
  async updateGameStatus(id: string, newStatus: GameStatus): Promise<Game> {
    return this.updateGame(id, { status: newStatus });
  }

  /**
   * Delete game
   */
  async deleteGame(id: string): Promise<void> {
    const game = await gameRepository.findById(id);
    if (!game) {
      throw new NotFoundError(`Game not found with id: ${id}`);
    }

    await gameRepository.delete(id);
  }

  /**
   * Validate game status transitions
   */
  private validateStatusTransition(
    currentStatus: GameStatus,
    newStatus: GameStatus,
  ): void {
    const validTransitions: Record<GameStatus, GameStatus[]> = {
      [GameStatus.Scheduled]: [GameStatus.Ongoing, GameStatus.Cancelled],
      [GameStatus.Ongoing]: [GameStatus.Completed, GameStatus.Cancelled],
      [GameStatus.Completed]: [],
      [GameStatus.Cancelled]: [],
    };

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}

// Export singleton instance
export const gameService = new GameService();
