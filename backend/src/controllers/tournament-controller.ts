import {
  Tournament,
  TournamentStatus,
  SurfaceType,
  DrawSize,
  MatchType,
} from "../types";
import {
  tournamentService,
  CreateTournamentData,
} from "../services/tournament-service";

export interface CreateTournamentRequest {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  surfaceType: SurfaceType;
  drawSize: DrawSize;
  matchType: MatchType;
}

class TournamentController {
  /**
   * Get all tournaments
   */
  async findAllTournaments(): Promise<Tournament[]> {
    return await tournamentService.findAllTournaments();
  }

  /**
   * Get tournament by ID
   */
  async findTournament(id: string): Promise<Tournament> {
    return await tournamentService.findTournamentById(id);
  }

  /**
   * Create a new tournament
   */
  async createTournament(data: CreateTournamentRequest): Promise<Tournament> {
    return await tournamentService.createTournament(data);
  }

  /**
   * Update tournament status
   */
  async updateTournamentStatus(
    id: string,
    status: TournamentStatus,
  ): Promise<Tournament> {
    return await tournamentService.updateTournamentStatus(id, status);
  }
}

// Export singleton instance
export const tournamentController = new TournamentController();
