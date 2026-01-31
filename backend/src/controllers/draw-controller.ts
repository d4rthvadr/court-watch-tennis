import { v4 as uuidv4 } from "uuid";
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
import { drawService } from "../services/draw-service";
import { eventBus } from "../event-bus";

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
  private tournaments: Map<string, Tournament> = new Map();
  private draws: Map<string, DrawStructure> = new Map();

  /**
   * Get all tournaments
   */
  findAllTournaments(): Tournament[] {
    return Array.from(this.tournaments.values());
  }

  /**
   * Get tournament by ID
   */
  findTournament(id: string): Tournament {
    const tournament = this.tournaments.get(id);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found with id: ${id}`);
    }
    return tournament;
  }

  /**
   * Create a new tournament
   */
  createTournament(data: CreateTournamentRequest): Tournament {
    const tournament: Tournament = {
      id: uuidv4(),
      name: data.name,
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate,
      surfaceType: data.surfaceType,
      drawSize: data.drawSize,
      status: TournamentStatus.Upcoming,
      matchType: data.matchType,
    };

    this.tournaments.set(tournament.id, tournament);
    return tournament;
  }

  /**
   * Update tournament status
   */
  updateTournamentStatus(id: string, status: TournamentStatus): Tournament {
    const tournament = this.findTournament(id);
    tournament.status = status;
    this.tournaments.set(id, tournament);
    return tournament;
  }

  /**
   * Generate draw for a tournament
   */
  generateDraw(tournamentId: string, data: GenerateDrawRequest): DrawStructure {
    const tournament = this.findTournament(tournamentId);

    // Check if draw already exists
    if (this.draws.has(tournamentId)) {
      throw new Error(`Draw already exists for tournament ${tournamentId}`);
    }

    // Generate the draw using DrawService
    const draw = drawService.generateDraw(
      tournamentId,
      data.players,
      tournament.drawSize,
    );

    // Store the draw
    this.draws.set(tournamentId, draw);

    // Update tournament status to Active
    this.updateTournamentStatus(tournamentId, TournamentStatus.Active);

    return draw;
  }

  /**
   * Get draw for a tournament
   */
  getDraw(tournamentId: string): DrawStructure {
    const draw = this.draws.get(tournamentId);
    if (!draw) {
      throw new NotFoundError(`Draw not found for tournament ${tournamentId}`);
    }
    return draw;
  }

  /**
   * Update match result and advance winner
   */
  updateMatchResult(
    tournamentId: string,
    matchId: string,
    data: UpdateMatchResultRequest,
  ): DrawMatch {
    const draw = this.getDraw(tournamentId);

    // Find the match
    const match = draw.matches.find((m) => m.id === matchId);
    if (!match) {
      throw new NotFoundError(`Match not found with id: ${matchId}`);
    }

    // Advance winner using DrawService
    const updatedMatches = drawService.advanceWinner(
      draw.matches,
      matchId,
      data.winnerId,
    );

    // Update the draw
    draw.matches = updatedMatches;
    this.draws.set(tournamentId, draw);

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
    this.checkRoundCompletion(tournamentId, match.round);

    // Check if tournament is complete (final match has winner)
    const finalMatch = draw.matches.find(
      (m) => m.round === RoundTypeEnum.F && m.winnerId,
    );
    if (finalMatch) {
      this.updateTournamentStatus(tournamentId, TournamentStatus.Completed);

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
  private checkRoundCompletion(tournamentId: string, round: RoundTypeEnum) {
    const draw = this.getDraw(tournamentId);
    const roundMatches = draw.matches.filter((m) => m.round === round);
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
  getMatches(tournamentId: string): DrawMatch[] {
    const draw = this.getDraw(tournamentId);
    return draw.matches;
  }

  /**
   * Get matches by round
   */
  getMatchesByRound(tournamentId: string, round: string): DrawMatch[] {
    const draw = this.getDraw(tournamentId);
    return draw.matches.filter((m) => m.round === round);
  }
}

// Export singleton instance
export const drawController = new DrawController();
