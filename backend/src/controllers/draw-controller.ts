import { NotFoundError } from "../errors";
import {
  Tournament,
  DrawStructure,
  DrawMatch,
  TournamentStatus,
  SurfaceType,
  DrawSize,
  MatchType,
  EventTypes,
  RoundTypeEnum,
} from "../types";
import { drawOrchestratorService } from "../services/draw/draw-orchestrator-service";
import { eventBus } from "../event-bus";
import { tournamentRepository, drawRepository } from "../models/repositories";
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

interface GenerateDrawRequest {
  players: Array<{ id: string; name: string; seed?: number }>;
}

interface UpdateMatchResultRequest {
  winnerId: string;
}

class DrawController {
  /**
   * Get all tournaments
   */
  async findAllTournaments(): Promise<Tournament[]> {
    const tournaments = await tournamentRepository.findAll();

    console.log("Fetched tournaments:", tournaments[0].id); // Debug log

    // TODO: Implement pagination and filtering
    return tournaments.map(toTournamentDTO);
  }

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

  /**
   * Generate draw for a tournament
   */
  async generateDraw(
    tournamentId: string,
    data: Omit<GenerateDrawRequest, "name">,
  ): Promise<DrawStructure> {
    const tournament = await this.findTournament(tournamentId);

    if (tournament.status !== TournamentStatus.Upcoming) {
      throw new Error(
        `Cannot generate draw for tournament in status ${tournament.status}`,
      );
    }

    // Check if draw already exists
    const existingDraw = await drawRepository.findByTournamentId(tournamentId);
    if (existingDraw) {
      throw new Error(`Draw already exists for tournament ${tournamentId}`);
    }

    // Generate the draw using DrawOrchestratorService
    const draw = drawOrchestratorService.generateDraw(
      tournamentId,
      data.players,
      tournament.drawSize,
    );

    // Store the draw
    await drawRepository.create(draw);

    // Update tournament status to Active
    await this.updateTournamentStatus(tournamentId, TournamentStatus.Active);

    return draw;
  }

  /**
   * Get draw for a tournament
   */
  async getDraw(tournamentId: string): Promise<DrawStructure> {
    const draw = await drawRepository.findByTournamentId(tournamentId);
    if (!draw) {
      throw new NotFoundError(`Draw not found for tournament ${tournamentId}`);
    }
    return draw;
  }

  /**
   * Update match result and advance winner
   */
  async updateMatchResult(
    tournamentId: string,
    matchId: string,
    data: UpdateMatchResultRequest,
  ): Promise<DrawMatch> {
    const draw = await this.getDraw(tournamentId);

    // Find the match
    const match = draw.matches.find((m) => m.id === matchId);
    if (!match) {
      throw new NotFoundError(`Match not found with id: ${matchId}`);
    }

    // Advance winner using DrawOrchestratorService
    const updatedMatches = drawOrchestratorService.advanceWinner(
      draw.matches,
      matchId,
      data.winnerId,
    );

    // Update the draw in database
    await drawRepository.updateMatch(tournamentId, matchId, data.winnerId);

    // Emit player advanced event
    eventBus.createEvent(EventTypes.playerAdvanced, {
      tournamentId,
      matchId,
      winnerId: data.winnerId,
      round: match.round,
    });

    const eventData = JSON.stringify({
      type: EventTypes.playerAdvanced,
      payload: {
        tournamentId,
        matchId,
        winnerId: data.winnerId,
        round: match.round,
      },
    });
    eventBus.createEvent(EventTypes.sseNotification, eventData);

    // Check if round is complete
    await this.checkRoundCompletion(tournamentId, match.round);

    // Check if tournament is complete (final match has winner)
    const finalMatch = updatedMatches.find(
      (m) => m.round === RoundTypeEnum.F && m.winnerId,
    );
    if (finalMatch) {
      await this.updateTournamentStatus(
        tournamentId,
        TournamentStatus.Completed,
      );

      eventBus.createEvent(EventTypes.tournamentCompleted, {
        tournamentId,
        winnerId: finalMatch.winnerId,
      });

      const tournamentEventData = JSON.stringify({
        type: EventTypes.tournamentCompleted,
        payload: {
          tournamentId,
          winnerId: finalMatch.winnerId,
        },
      });
      eventBus.createEvent(EventTypes.sseNotification, tournamentEventData);
    }

    return match;
  }

  /**
   * Check if all matches in a round are complete
   */
  private async checkRoundCompletion(
    tournamentId: string,
    round: RoundTypeEnum,
  ) {
    const roundMatches = await drawRepository.getMatchesByRound(
      tournamentId,
      round,
    );
    const allComplete = roundMatches.every((m) => m.winnerId);

    if (allComplete) {
      eventBus.createEvent(EventTypes.roundCompleted, {
        tournamentId,
        round,
      });

      const eventData = JSON.stringify({
        type: EventTypes.roundCompleted,
        payload: {
          tournamentId,
          round,
        },
      });
      eventBus.createEvent(EventTypes.sseNotification, eventData);
    }
  }

  /**
   * Get all matches for a tournament
   */
  async getMatches(tournamentId: string): Promise<DrawMatch[]> {
    return await drawRepository.getMatches(tournamentId);
  }

  /**
   * Get matches by round
   */
  async getMatchesByRound(
    tournamentId: string,
    round: string,
  ): Promise<DrawMatch[]> {
    return await drawRepository.getMatchesByRound(tournamentId, round);
  }
}

// Export singleton instance
export const drawController = new DrawController();
