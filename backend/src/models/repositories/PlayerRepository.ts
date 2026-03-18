import { Player as PlayerEntity } from "../../../generated/prisma";
import { Database } from "../../db/database";
import { PlayerModel } from "../player";

function mapToPlayer(entity: PlayerEntity): PlayerModel;
function mapToPlayer(entity: null): null;
function mapToPlayer(entity: PlayerEntity | null): PlayerModel | null;
function mapToPlayer(entity: PlayerEntity | null): PlayerModel | null {
  if (!entity) {
    return null;
  }
  return new PlayerModel({
    id: entity.id,
    name: entity.name,
    status: entity.status,
    rank: entity.rank,
  });
}

export class PlayerRepository extends Database {
  async findAll(): Promise<PlayerModel[]> {
    const players = await this.player.findMany({
      orderBy: { rank: "asc" },
    });

    return players.map(mapToPlayer).filter((p): p is PlayerModel => p !== null);
  }

  async findById(id: string): Promise<PlayerModel | null> {
    const player = await this.player.findUnique({
      where: { id },
    });

    return mapToPlayer(player);
  }

  async save(data: PlayerModel): Promise<PlayerModel> {
    const player = await this.player.upsert({
      where: { id: data.id || "" },
      create: {
        id: data.id!,
        name: data.name,
        status: data.status,
        rank: data.rank,
      },
      update: {
        name: data.name,
        status: data.status,
        rank: data.rank,
      },
    });

    return mapToPlayer(player);
  }

  async delete(id: string): Promise<void> {
    await this.player.delete({
      where: { id },
    });
  }
}
