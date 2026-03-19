import { Game, GameStatus } from "../types";
import { gameService } from "@services/game-service";
import type {
  CreateGameRequest,
  UpdateGameRequest,
} from "../validators/game-validator";

class GameController {
  async findAll(): Promise<Game[]> {
    return await gameService.findAllGames();
  }

  async find(id: string): Promise<Game | null> {
    try {
      return await gameService.findGameById(id);
    } catch (error) {
      return null;
    }
  }

  async save(data: CreateGameRequest): Promise<Game> {
    return await gameService.createGame({
      name: data.name,
      status: data.status,
      startTime: data.startTime,
      endTime: data.endTime,
      playerOneId: data.playerOneId,
      playerTwoId: data.playerTwoId,
      courtId: data.courtId,
    });
  }

  async update(id: string, data: UpdateGameRequest): Promise<Game> {
    return await gameService.updateGame(id, {
      name: data.name,
      status: data.status,
      startTime: data.startTime,
      endTime: data.endTime,
      playerOneId: data.playerOneId,
      playerTwoId: data.playerTwoId,
      courtId: data.courtId,
    });
  }

  async updateStatus(id: string, status: GameStatus): Promise<Game> {
    return await gameService.updateGameStatus(id, status);
  }

  async delete(id: string): Promise<void> {
    await gameService.deleteGame(id);
  }
}

export const gameController = new GameController();
