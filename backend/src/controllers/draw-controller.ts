import { DrawStructure, DrawMatch } from "../types";
import {
  drawManagementService,
  GenerateDrawData,
  UpdateMatchResultData,
} from "@services/draw-management-service";

export interface GenerateDrawRequest {
  players: Array<{ id: string; name: string; seed?: number }>;
}

export interface UpdateMatchResultRequest {
  winnerId: string;
}

class DrawController {
  /**
   * Generate draw for a tournament
   */
  async generateDraw(
    tournamentId: string,
    data: GenerateDrawData,
  ): Promise<DrawStructure> {
    return await drawManagementService.generateDraw(tournamentId, data);
  }

  /**
   * Get draw for a tournament
   */
  async getDraw(tournamentId: string): Promise<DrawStructure> {
    return await drawManagementService.getDraw(tournamentId);
  }

  /**
   * Update match result and advance winner
   */
  async updateMatchResult(
    tournamentId: string,
    matchId: string,
    data: UpdateMatchResultData,
  ): Promise<DrawMatch> {
    return await drawManagementService.updateMatchResult(
      tournamentId,
      matchId,
      data,
    );
  }

  /**
   * Get all matches for a tournament
   */
  async getMatches(tournamentId: string): Promise<DrawMatch[]> {
    return await drawManagementService.getMatches(tournamentId);
  }

  /**
   * Get matches by round
   */
  async getMatchesByRound(
    tournamentId: string,
    round: string,
  ): Promise<DrawMatch[]> {
    return await drawManagementService.getMatchesByRound(tournamentId, round);
  }
}

// Export singleton instance
export const drawController = new DrawController();
