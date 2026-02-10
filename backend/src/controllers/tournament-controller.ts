import { NotFoundError } from "../errors";
import {
  Tournament,
  TournamentStatus,
  SurfaceType,
  DrawSize,
  MatchType,
} from "../types";
import { tournamentRepository } from "../models/repositories";
import { TournamentModel } from "../models/tournament";

const toTournamentDTO = (t: TournamentModel): Tournament => ({
  id: t.id!,
  name: t.name,
  location: t.location,
  startDate: t.startDate,
  endDate: t.endDate,
  surfaceType: t.surfaceType,
  drawSize: t.drawSize,
  status: t.status,
  matchType: t.matchType,
});

interface CreateTournamentRequest {
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
    const tournaments = await tournamentRepository.findAll();
    return tournaments.map(toTournamentDTO);
  }

  /**
   * Get tournament by ID
   */
  async findTournament(id: string): Promise<Tournament> {
    const tournament = await tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found with id: ${id}`);
    }
    return toTournamentDTO(tournament);
  }

  /**
   * Create a new tournament
   */
  async createTournament(data: CreateTournamentRequest): Promise<Tournament> {
    const tournament = await tournamentRepository.save(
      new TournamentModel({
        name: data.name,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        surfaceType: data.surfaceType,
        drawSize: data.drawSize,
        status: TournamentStatus.Upcoming,
        matchType: data.matchType,
      }),
    );
    return toTournamentDTO(tournament);
  }

  /**
   * Update tournament status
   */
  async updateTournamentStatus(
    id: string,
    status: TournamentStatus,
  ): Promise<Tournament> {
    const tournament = await tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found with id: ${id}`);
    }
    tournament.status = status;
    const updatedTournament = await tournamentRepository.save(tournament);
    return toTournamentDTO(updatedTournament);
  }
}

// Export singleton instance
export const tournamentController = new TournamentController();
