import { RoundTypeEnum, GameStatus } from "../../types";
import { Database } from "../../db/database";
import { DrawEntryModel, DrawMatchModel } from "../draw";
import {
  DrawEntry as PrismaDrawEntry,
  DrawMatch as PrismaDrawMatch,
} from "../../../generated/prisma";
import { convertNullToUndefined, convertToFamilyType } from "../util";

/**
 *  Map Prisma DrawEntry entity to DrawEntryModel
 * @param entity Prisma DrawEntry entity or null
 * @returns DrawEntryModel instance or null if input is null
 * @param entity
 */
function mapToDrawEntry(entity: PrismaDrawEntry): DrawEntryModel;
function mapToDrawEntry(entity: null): null;
function mapToDrawEntry(entity: PrismaDrawEntry | null): DrawEntryModel | null;
function mapToDrawEntry(entity: PrismaDrawEntry | null): DrawEntryModel | null {
  if (!entity) {
    return null;
  }
  return new DrawEntryModel({
    id: entity.id,
    tournamentId: entity.tournamentId,
    position: entity.position,
    playerId: entity.playerId ?? undefined,
    seed: entity.seed ?? undefined,
    round: convertToFamilyType(entity.round, RoundTypeEnum),
    matchId: entity.matchId ?? undefined,
  });
}

/**
 *  Map Prisma DrawMatch entity to DrawMatchModel
 * @param entity Prisma DrawMatch entity or null
 * @returns DrawMatchModel instance or null if input is null
 * @param entity
 */
function mapToDrawMatch(entity: PrismaDrawMatch): DrawMatchModel;
function mapToDrawMatch(entity: null): null;
function mapToDrawMatch(entity: PrismaDrawMatch | null): DrawMatchModel | null;
function mapToDrawMatch(entity: PrismaDrawMatch | null): DrawMatchModel | null {
  if (!entity) {
    return null;
  }
  return new DrawMatchModel({
    id: entity.id,
    tournamentId: entity.tournamentId,
    round: convertToFamilyType(entity.round, RoundTypeEnum),
    position: entity.position,
    player1Id: convertNullToUndefined(entity.player1Id),
    player2Id: convertNullToUndefined(entity.player2Id),
    winnerId: convertNullToUndefined(entity.winnerId),
    nextMatchId: convertNullToUndefined(entity.nextMatchId),
    status: convertToFamilyType(entity.status, GameStatus),
    courtId: convertNullToUndefined(entity.courtId),
    startTime: convertNullToUndefined(entity.startTime),
    endTime: convertNullToUndefined(entity.endTime),
  });
}

export interface DrawStructureModels {
  tournamentId: string;
  drawSize: number;
  entries: DrawEntryModel[];
  matches: DrawMatchModel[];
}

export class DrawRepository extends Database {
  /**
   * Find draw structure by tournament ID
   * @param tournamentId
   *
   * @returns  Draw structure including entries and matches for the given tournament ID, or null if not found
   */
  async findByTournamentId(
    tournamentId: string,
  ): Promise<DrawStructureModels | null> {
    const entries = await this.drawEntry.findMany({
      where: { tournamentId },
      orderBy: { position: "asc" },
    });

    const matches = await this.drawMatch.findMany({
      where: { tournamentId },
      orderBy: [{ round: "asc" }, { position: "asc" }],
    });

    if (entries.length === 0 && matches.length === 0) {
      return null;
    }

    const tournament = await this.tournament.findUnique({
      where: { id: tournamentId },
    });

    const entryModels = entries
      .map(mapToDrawEntry)
      .filter((e): e is DrawEntryModel => e !== null);
    const matchModels = matches
      .map(mapToDrawMatch)
      .filter((m): m is DrawMatchModel => m !== null);

    return {
      tournamentId,
      drawSize: tournament?.drawSize || 0,
      entries: entryModels,
      matches: matchModels,
    };
  }

  async create(draw: DrawStructureModels): Promise<DrawStructureModels> {
    // Create draw entries
    await this.drawEntry.createMany({
      data: draw.entries.map((entry) => ({
        id: entry.id,
        tournamentId: entry.tournamentId,
        position: entry.position,
        playerId: entry.playerId,
        seed: entry.seed,
        round: entry.round,
        matchId: entry.matchId,
      })),
    });

    // Create draw matches
    await this.drawMatch.createMany({
      data: draw.matches.map((match) => ({
        id: match.id,
        tournamentId: match.tournamentId,
        round: match.round,
        position: match.position,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        winnerId: match.winnerId,
        nextMatchId: match.nextMatchId,
        status: match.status,
        courtId: match.courtId,
        startTime: match.startTime,
        endTime: match.endTime,
      })),
    });

    return draw;
  }

  async updateMatch(
    tournamentId: string,
    matchId: string,
    winnerId: string,
  ): Promise<DrawMatchModel | null> {
    const match = await this.drawMatch.update({
      where: { id: matchId, tournamentId },
      data: { winnerId },
    });

    return mapToDrawMatch(match);
  }

  async getMatches(tournamentId: string): Promise<DrawMatchModel[]> {
    const matches = await this.drawMatch.findMany({
      where: { tournamentId },
      orderBy: [{ round: "asc" }, { position: "asc" }],
    });

    return matches
      .map(mapToDrawMatch)
      .filter((m): m is DrawMatchModel => m !== null);
  }

  async getMatchesByRound(
    tournamentId: string,
    round: string,
  ): Promise<DrawMatchModel[]> {
    const matches = await this.drawMatch.findMany({
      where: {
        tournamentId,
        round,
      },
      orderBy: { position: "asc" },
    });

    return matches
      .map(mapToDrawMatch)
      .filter((m): m is DrawMatchModel => m !== null);
  }

  /**
   * Get a single match by tournamentId and matchId
   */
  async getMatchById(
    tournamentId: string,
    matchId: string,
  ): Promise<DrawMatchModel | null> {
    const match = await this.drawMatch.findUnique({
      where: { id: matchId, tournamentId },
    });
    return mapToDrawMatch(match);
  }
  /**
   * Update all relevant fields for a match (winnerId, player1Id, player2Id, status)
   */
  async updateMatchFields(
    tournamentId: string,
    matchId: string,
    fields: Partial<{
      winnerId: string | null;
      player1Id: string | null;
      player2Id: string | null;
      status: string;
    }>,
  ): Promise<DrawMatchModel | null> {
    const match = await this.drawMatch.update({
      where: { id: matchId, tournamentId },
      data: fields,
    });
    return mapToDrawMatch(match);
  }
}

export const drawRepository = new DrawRepository();
