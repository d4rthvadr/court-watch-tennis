import { Player } from "../../types";
import { Database } from "../../db/database";

export class PlayerRepository extends Database {
  async findAll(): Promise<Player[]> {
    const players = await this.player.findMany({
      orderBy: { rank: "asc" },
    });

    return players.map(this.mapToPlayer);
  }

  async findById(id: string): Promise<Player | null> {
    const player = await this.player.findUnique({
      where: { id },
    });

    return player ? this.mapToPlayer(player) : null;
  }

  async create(data: Omit<Player, "id">): Promise<Player> {
    const player = await this.player.create({
      data: {
        name: data.name,
        status: data.status,
        rank: data.rank,
      },
    });

    return this.mapToPlayer(player);
  }

  async update(id: string, data: Partial<Player>): Promise<Player> {
    const player = await this.player.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
        ...(data.rank !== undefined && { rank: data.rank }),
      },
    });

    return this.mapToPlayer(player);
  }

  async delete(id: string): Promise<void> {
    await this.player.delete({
      where: { id },
    });
  }

  private mapToPlayer(dbPlayer: any): Player {
    return {
      id: dbPlayer.id,
      name: dbPlayer.name,
      status: dbPlayer.status,
      rank: dbPlayer.rank,
    };
  }
}
