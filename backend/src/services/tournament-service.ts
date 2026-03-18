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

export interface CreateTournamentData {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  surfaceType: SurfaceType;
  drawSize: DrawSize;
  matchType: MatchType;
}

class TournamentService {
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
  async findTournamentById(id: string): Promise<Tournament> {
    const tournament = await tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found with id: ${id}`);
    }
    return toTournamentDTO(tournament);
  }

  /**
   * Create a new tournament
   */
  async createTournament(data: CreateTournamentData): Promise<Tournament> {
    // Business logic: validate tournament dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      throw new Error("End date must be after start date");
    }

    console.log("Creating tournament with data:", data);
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

    console.log("Created tournament:", tournament);
    return toTournamentDTO(tournament);
  }

  /**
   * Update tournament status
   */
  async updateTournamentStatus(
    id: string,
    newStatus: TournamentStatus,
  ): Promise<Tournament> {
    const tournament = await tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found with id: ${id}`);
    }

    // Business logic: validate status transitions
    this.validateStatusTransition(tournament.status, newStatus);

    tournament.status = newStatus;
    const updatedTournament = await tournamentRepository.save(tournament);

    return toTournamentDTO(updatedTournament);
  }

  /**
   * Validate tournament status transitions
   */
  private validateStatusTransition(
    currentStatus: TournamentStatus,
    newStatus: TournamentStatus,
  ): void {
    const validTransitions: Record<TournamentStatus, TournamentStatus[]> = {
      [TournamentStatus.Upcoming]: [TournamentStatus.Active],
      [TournamentStatus.Active]: [TournamentStatus.Completed],
      [TournamentStatus.Completed]: [],
    };

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Check if tournament can have draw generated
   */
  async canGenerateDraw(tournamentId: string): Promise<boolean> {
    const tournament = await tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found with id: ${tournamentId}`);
    }
    return tournament.status === TournamentStatus.Upcoming;
  }
}

// Export singleton instance
export const tournamentService = new TournamentService();
