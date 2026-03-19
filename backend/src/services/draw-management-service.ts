import { NotFoundError } from "../errors";
import {
  DrawStructure,
  DrawMatch,
  DrawEntry,
  TournamentStatus,
  EventTypes,
  RoundTypeEnum,
} from "../types";
import { drawOrchestratorService } from "./draw/draw-orchestrator-service";
import { eventBus } from "../event-bus";
import { drawRepository } from "@models/repositories";
import { tournamentService } from "./tournament-service";
import { DrawEntryModel, DrawMatchModel } from "@models/draw";
import { DrawStructureModels } from "@models/repositories/DrawRepository";

function toDrawEntryDTO(model: DrawEntryModel): DrawEntry {
  return {
    id: model.id,
    tournamentId: model.tournamentId,
    position: model.position,
    playerId: model.playerId,
    seed: model.seed,
    round: model.round,
    matchId: model.matchId,
  };
}

function toDrawMatchDTO(model: DrawMatchModel): DrawMatch {
  return {
    id: model.id,
    tournamentId: model.tournamentId,
    round: model.round,
    position: model.position,
    player1Id: model.player1Id,
    player2Id: model.player2Id,
    winnerId: model.winnerId,
    nextMatchId: model.nextMatchId,
    status: model.status,
    courtId: model.courtId,
    startTime: model.startTime,
    endTime: model.endTime,
  };
}

function toDrawStructureDTO(models: DrawStructureModels): DrawStructure {
  return {
    tournamentId: models.tournamentId,
    drawSize: models.drawSize,
    entries: models.entries.map(toDrawEntryDTO),
    matches: models.matches.map(toDrawMatchDTO),
  };
}

function toDrawStructureModels(dto: DrawStructure): DrawStructureModels {
  return {
    tournamentId: dto.tournamentId,
    drawSize: dto.drawSize,
    entries: dto.entries.map(
      (e) =>
        new DrawEntryModel({
          id: e.id,
          tournamentId: e.tournamentId,
          position: e.position,
          playerId: e.playerId,
          seed: e.seed,
          round: e.round,
          matchId: e.matchId,
        }),
    ),
    matches: dto.matches.map(
      (m) =>
        new DrawMatchModel({
          id: m.id,
          tournamentId: m.tournamentId,
          round: m.round,
          position: m.position,
          player1Id: m.player1Id,
          player2Id: m.player2Id,
          winnerId: m.winnerId,
          nextMatchId: m.nextMatchId,
          status: m.status,
          courtId: m.courtId,
          startTime: m.startTime,
          endTime: m.endTime,
        }),
    ),
  };
}

export interface GenerateDrawData {
  players: Array<{ id: string; name: string; seed?: number }>;
}

export interface UpdateMatchResultData {
  winnerId: string;
}

class DrawManagementService {
  /**
   * Generate draw for a tournament
   */
  async generateDraw(
    tournamentId: string,
    data: GenerateDrawData,
  ): Promise<DrawStructure> {
    // Validate tournament status
    const tournament = await tournamentService.findTournamentById(tournamentId);

    if (tournament.status !== TournamentStatus.Upcoming) {
      throw new Error(
        `Cannot generate draw for tournament in status ${tournament.status}`,
      );
    }

    // Check if draw already exists
    const existingDrawModels =
      await drawRepository.findByTournamentId(tournamentId);
    if (existingDrawModels) {
      throw new Error(`Draw already exists for tournament ${tournamentId}`);
    }

    // Business logic: validate player count matches draw size
    if (data.players.length !== tournament.drawSize) {
      throw new Error(
        `Player count (${data.players.length}) must match draw size (${tournament.drawSize})`,
      );
    }

    // Generate the draw using DrawOrchestratorService
    const draw = drawOrchestratorService.generateDraw(
      tournamentId,
      data.players,
      tournament.drawSize,
    );

    // Store the draw (convert DTOs to models)
    await drawRepository.create(toDrawStructureModels(draw));

    // Update tournament status to Active
    await tournamentService.updateTournamentStatus(
      tournamentId,
      TournamentStatus.Active,
    );

    return draw;
  }

  /**
   * Get draw for a tournament
   */
  async getDraw(tournamentId: string): Promise<DrawStructure> {
    const drawModels = await drawRepository.findByTournamentId(tournamentId);
    if (!drawModels) {
      throw new NotFoundError(`Draw not found for tournament ${tournamentId}`);
    }
    return toDrawStructureDTO(drawModels);
  }

  /**
   * Update match result and advance winner
   */
  async updateMatchResult(
    tournamentId: string,
    matchId: string,
    data: UpdateMatchResultData,
  ): Promise<DrawMatch> {
    const draw = await this.getDraw(tournamentId);

    // Find the match
    const match = draw.matches.find((m) => m.id === matchId);
    if (!match) {
      throw new NotFoundError(`Match not found with id: ${matchId}`);
    }

    // Business logic: validate match hasn't been completed
    if (match.winnerId) {
      throw new Error(`Match ${matchId} has already been completed`);
    }

    // Business logic: validate winner is a participant
    if (
      match.player1Id !== data.winnerId &&
      match.player2Id !== data.winnerId
    ) {
      throw new Error(
        `Winner ${data.winnerId} is not a participant in match ${matchId}`,
      );
    }

    // Advance winner using DrawOrchestratorService
    const updatedMatches = drawOrchestratorService.advanceWinner(
      draw.matches,
      matchId,
      data.winnerId,
    );

    // Update the draw in database
    const updatedMatchModel = await drawRepository.updateMatch(
      tournamentId,
      matchId,
      data.winnerId,
    );
    const updatedMatch = updatedMatchModel
      ? toDrawMatchDTO(updatedMatchModel)
      : match;

    // Emit player advanced event
    this.emitPlayerAdvancedEvent(
      tournamentId,
      matchId,
      data.winnerId,
      match.round,
    );

    // Check if round is complete
    await this.checkAndEmitRoundCompletion(tournamentId, match.round);

    // Check if tournament is complete (final match has winner)
    await this.checkAndCompleteTournament(tournamentId, updatedMatches);

    return match;
  }

  /**
   * Get all matches for a tournament
   */
  async getMatches(tournamentId: string): Promise<DrawMatch[]> {
    const matchModels = await drawRepository.getMatches(tournamentId);
    return matchModels.map(toDrawMatchDTO);
  }

  /**
   * Get matches by round
   */
  async getMatchesByRound(
    tournamentId: string,
    round: string,
  ): Promise<DrawMatch[]> {
    const matchModels = await drawRepository.getMatchesByRound(
      tournamentId,
      round,
    );
    return matchModels.map(toDrawMatchDTO);
  }

  /**
   * Emit player advanced event
   */
  private emitPlayerAdvancedEvent(
    tournamentId: string,
    matchId: string,
    winnerId: string,
    round: string,
  ): void {
    eventBus.createEvent(EventTypes.playerAdvanced, {
      tournamentId,
      matchId,
      winnerId,
      round,
    });

    const eventData = JSON.stringify({
      type: EventTypes.playerAdvanced,
      payload: {
        tournamentId,
        matchId,
        winnerId,
        round,
      },
    });
    eventBus.createEvent(EventTypes.sseNotification, eventData);
  }

  /**
   * Check if all matches in a round are complete and emit event
   */
  private async checkAndEmitRoundCompletion(
    tournamentId: string,
    round: RoundTypeEnum,
  ): Promise<void> {
    const roundMatches = await drawRepository.getMatchesByRound(
      tournamentId,
      round,
    );
    const allComplete = roundMatches.every((m: DrawMatch) => m.winnerId);

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
   * Check if tournament is complete and update status
   */
  private async checkAndCompleteTournament(
    tournamentId: string,
    matches: DrawMatch[],
  ): Promise<void> {
    const finalMatch = matches.find(
      (m) => m.round === RoundTypeEnum.F && m.winnerId,
    );

    if (finalMatch) {
      await tournamentService.updateTournamentStatus(
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
  }
}

// Export singleton instance
export const drawManagementService = new DrawManagementService();
