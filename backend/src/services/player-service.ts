import { NotFoundError } from "../errors";
import { Player } from "../types";
import { playerRepository } from "@models/repositories";
import { PlayerModel } from "@models/player";

const toPlayerDTO = (p: PlayerModel): Player => ({
  id: p.id!,
  name: p.name,
  status: p.status,
  rank: p.rank,
});

export interface CreatePlayerData {
  name: string;
  status: string;
  rank: number;
}

export interface UpdatePlayerData {
  name?: string;
  status?: string;
  rank?: number;
}

class PlayerService {
  /**
   * Get all players
   */
  async findAllPlayers(): Promise<Player[]> {
    const players = await playerRepository.findAll();
    return players.map(toPlayerDTO);
  }

  /**
   * Get player by ID
   */
  async findPlayerById(id: string): Promise<Player> {
    const player = await playerRepository.findById(id);
    if (!player) {
      throw new NotFoundError(`Player not found with id: ${id}`);
    }
    return toPlayerDTO(player);
  }

  /**
   * Create a new player
   */
  async createPlayer(data: CreatePlayerData): Promise<Player> {
    // Business logic: validate rank
    if (data.rank < 1) {
      throw new Error("Player rank must be at least 1");
    }

    const player = await playerRepository.save(
      new PlayerModel({
        name: data.name,
        status: data.status,
        rank: data.rank,
      }),
    );

    return toPlayerDTO(player);
  }

  /**
   * Update player
   */
  async updatePlayer(id: string, data: UpdatePlayerData): Promise<Player> {
    const player = await playerRepository.findById(id);
    if (!player) {
      throw new NotFoundError(`Player not found with id: ${id}`);
    }

    // Business logic: validate rank if being updated
    if (data.rank !== undefined && data.rank < 1) {
      throw new Error("Player rank must be at least 1");
    }

    // Update fields if provided
    if (data.name !== undefined) {
      player.name = data.name;
    }
    if (data.status !== undefined) {
      player.status = data.status;
    }
    if (data.rank !== undefined) {
      player.rank = data.rank;
    }

    const updatedPlayer = await playerRepository.save(player);
    return toPlayerDTO(updatedPlayer);
  }

  /**
   * Delete player
   */
  async deletePlayer(id: string): Promise<void> {
    const player = await playerRepository.findById(id);
    if (!player) {
      throw new NotFoundError(`Player not found with id: ${id}`);
    }

    await playerRepository.delete(id);
  }

  /**
   * Get seeded players for tournament draw generation
   * Returns players sorted by rank
   */
  async getSeededPlayers(): Promise<Player[]> {
    const players = await playerRepository.findAll();
    return players
      .slice(0, 32) // Top 32 players
      .map(toPlayerDTO);
  }

  /**
   * Get players for tournament (with id, name, rank)
   */
  async getPlayersForTournament() {
    const players = await playerRepository.findAll();
    return players.map((player) => ({
      id: player.id!,
      name: player.name,
      seed: Math.ceil(players.length / player.rank), // Calculate seed based on rank
    }));
  }
}

// Export singleton instance
export const playerService = new PlayerService();
