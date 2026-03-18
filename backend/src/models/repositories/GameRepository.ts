import { Game as GameEntity } from "../../../generated/prisma";
import { Database } from "../../db/database";
import { GameModel } from "../game";
import { GameStatus } from "../../types";
import { convertToFamilyType } from "../util";

function mapToGame(entity: GameEntity): GameModel;
function mapToGame(entity: null): null;
function mapToGame(entity: GameEntity | null): GameModel | null;
function mapToGame(entity: GameEntity | null): GameModel | null {
  if (!entity) {
    return null;
  }
  return new GameModel({
    id: entity.id,
    name: entity.name || undefined,
    status: convertToFamilyType(entity.status, GameStatus),
    startTime: entity.startTime || undefined,
    endTime: entity.endTime || undefined,
    playerOneId: entity.playerOneId,
    playerTwoId: entity.playerTwoId,
    courtId: entity.courtId,
  });
}

export class GameRepository extends Database {
  async findAll(): Promise<GameModel[]> {
    const games = await this.game.findMany({
      orderBy: { createdAt: "desc" },
    });

    return games.map(mapToGame).filter((g): g is GameModel => g !== null);
  }

  async findById(id: string): Promise<GameModel | null> {
    const game = await this.game.findUnique({
      where: { id },
    });

    return mapToGame(game);
  }

  async save(data: GameModel): Promise<GameModel> {
    const game = await this.game.upsert({
      where: { id: data.id || "" },
      create: {
        id: data.id!,
        name: data.name,
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
        playerOneId: data.playerOneId,
        playerTwoId: data.playerTwoId,
        courtId: data.courtId,
      },
      update: {
        name: data.name,
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
        playerOneId: data.playerOneId,
        playerTwoId: data.playerTwoId,
        courtId: data.courtId,
      },
    });

    return mapToGame(game);
  }

  async delete(id: string): Promise<void> {
    await this.game.delete({
      where: { id },
    });
  }
}
