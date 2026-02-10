import { NotFoundError } from "../errors";
import {
  DrawStructure,
  DrawMatch,
  TournamentStatus,
  EventTypes,
  RoundTypeEnum,
} from "../types";
import { drawOrchestratorService } from "../services/draw/draw-orchestrator-service";
import { eventBus } from "../event-bus";
import { drawRepository } from "../models/repositories";
import { tournamentController } from "./tournament-controller";

interface GenerateDrawRequest {
  players: Array<{ id: string; name: string; seed?: number }>;
}

interface UpdateMatchResultRequest {
  winnerId: string;
}

class DrawController {
  /**
   * Generate draw for a tournament
   */
  async generateDraw(
    tournamentId: string,
    data: Omit<GenerateDrawRequest, "name">,
  ): Promise<DrawStructure> {
    const tournament = await tournamentController.findTournament(tournamentId);

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
    await tournamentController.updateTournamentStatus(
      tournamentId,
      TournamentStatus.Active,
    );

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
      await tournamentController.updateTournamentStatus(
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
