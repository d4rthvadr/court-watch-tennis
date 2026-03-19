import { Player } from "../types";
import {
  playerService,
  CreatePlayerData,
  UpdatePlayerData,
} from "@services/player-service";

export interface CreatePlayerRequest {
  name: string;
  status: string;
  rank: number;
}

export interface UpdatePlayerRequest {
  name?: string;
  status?: string;
  rank?: number;
}

class PlayerController {
  /**
   * Get all players
   */
  async findAllPlayers(): Promise<Player[]> {
    return await playerService.findAllPlayers();
  }

  /**
   * Get player by ID
   */
  async findPlayer(id: string): Promise<Player> {
    return await playerService.findPlayerById(id);
  }

  /**
   * Create a new player
   */
  async createPlayer(data: CreatePlayerRequest): Promise<Player> {
    return await playerService.createPlayer(data);
  }

  /**
   * Update player
   */
  async updatePlayer(id: string, data: UpdatePlayerRequest): Promise<Player> {
    return await playerService.updatePlayer(id, data);
  }

  /**
   * Delete player
   */
  async deletePlayer(id: string): Promise<void> {
    return await playerService.deletePlayer(id);
  }

  /**
   * Get seeded players for tournament draw generation
   */
  async getSeededPlayers(): Promise<Player[]> {
    return await playerService.getSeededPlayers();
  }

  /**
   * Get players for tournament (with id, name, seed)
   */
  async getPlayersForTournament() {
    return await playerService.getPlayersForTournament();
  }
}

// Export singleton instance
export const playerController = new PlayerController();
