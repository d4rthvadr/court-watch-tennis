import { BadRequestError, NotFoundError } from "../errors";
import {
  DrawStructure,
  DrawMatch,
  DrawEntry,
  TournamentStatus,
  EventTypes,
  RoundTypeEnum,
  GameStatus,
} from "../types";
import { drawOrchestratorService } from "./draw/draw-orchestrator-service";
import { drawRepository } from "@models/repositories";
import { tournamentService } from "./tournament-service";
import { DrawEntryModel, DrawMatchModel } from "@models/draw";
import { DrawStructureModels } from "@models/repositories/DrawRepository";
import { advancePlayerQueueService } from "@infra/queues/player-queue/services/container";

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

import { gameService } from "./game-service";

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
    // Fetch the current match directly
    const match = await drawRepository.getMatchById(tournamentId, matchId);
    if (!match) {
      throw new NotFoundError(`Match not found with id: ${matchId}`);
    }

    // Business logic: validate status transition (delegate to gameService)
    try {
      gameService["validateStatusTransition"](
        match.status,
        GameStatus.Completed,
      );
    } catch (err: any) {
      // Convert error to BadRequestError for consistency
      throw new BadRequestError(err.message);
    }

    // Business logic: validate winner is a participant
    if (
      match.player1Id !== data.winnerId &&
      match.player2Id !== data.winnerId
    ) {
      throw new BadRequestError(
        `Winner ${data.winnerId} is not a participant in match ${matchId}`,
      );
    }

    // Update the current match with the winner
    await drawRepository.updateMatchFields(tournamentId, matchId, {
      winnerId: data.winnerId,
      status: GameStatus.Completed,
    });

    // If there's a next match, update it directly
    // TODO: Move this into a queue job to handle player advancement asynchronously and ensure it happens even if this request fails after updating the current match
    let nextMatch: DrawMatchModel | null = null;
    if (match.nextMatchId) {
      nextMatch = await drawRepository.getMatchById(
        tournamentId,
        match.nextMatchId,
      );
      if (nextMatch) {
        let updateFields: {
          player1Id?: string | null;
          player2Id?: string | null;
          status?: GameStatus;
        } = {};
        if (!nextMatch.player1Id) {
          updateFields.player1Id = data.winnerId;
        } else if (!nextMatch.player2Id) {
          updateFields.player2Id = data.winnerId;
        }
        if (
          (updateFields.player1Id || nextMatch.player1Id) &&
          (updateFields.player2Id || nextMatch.player2Id)
        ) {
          updateFields.status = GameStatus.Scheduled;
        }
        await drawRepository.updateMatchFields(
          tournamentId,
          match.nextMatchId,
          updateFields,
        );
      }
    }

    // Check if tournament is complete (final match has winner)
    await this.checkAndCompleteTournament(tournamentId, match);

    // Fetch and return the updated match
    const updatedMatch = await drawRepository.getMatchById(
      tournamentId,
      matchId,
    );
    return toDrawMatchDTO(updatedMatch!);
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
   * Check if tournament is complete and update status
   */
  private async checkAndCompleteTournament(
    tournamentId: string,
    match: DrawMatch,
  ): Promise<void> {
    if (match.round === RoundTypeEnum.F && match.winnerId) {
      await tournamentService.updateTournamentStatus(
        tournamentId,
        TournamentStatus.Completed,
      );
      // Event bus logic can be re-enabled here if needed
    }
  }
}

// Export singleton instance
export const drawManagementService = new DrawManagementService();
