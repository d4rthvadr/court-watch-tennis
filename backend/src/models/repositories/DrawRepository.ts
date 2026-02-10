import {
  DrawStructure,
  DrawMatch,
  DrawEntry,
  RoundTypeEnum,
  GameStatus,
} from "../../types";
import { Database } from "../../db/database";

export class DrawRepository extends Database {
  async findByTournamentId(
    tournamentId: string,
  ): Promise<DrawStructure | null> {
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

    return {
      tournamentId,
      drawSize: tournament?.drawSize || 0,
      entries: entries.map(this.mapToDrawEntry),
      matches: matches.map(this.mapToDrawMatch),
    };
  }

  async create(draw: DrawStructure): Promise<DrawStructure> {
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
  ): Promise<DrawMatch> {
    const match = await this.drawMatch.update({
      where: { id: matchId },
      data: { winnerId },
    });

    return this.mapToDrawMatch(match);
  }

  async getMatches(tournamentId: string): Promise<DrawMatch[]> {
    const matches = await this.drawMatch.findMany({
      where: { tournamentId },
      orderBy: [{ round: "asc" }, { position: "asc" }],
    });

    return matches.map(this.mapToDrawMatch);
  }

  async getMatchesByRound(
    tournamentId: string,
    round: string,
  ): Promise<DrawMatch[]> {
    const matches = await this.drawMatch.findMany({
      where: {
        tournamentId,
        round,
      },
      orderBy: { position: "asc" },
    });

    return matches.map(this.mapToDrawMatch);
  }

  private mapToDrawEntry(dbEntry: any): DrawEntry {
    return {
      id: dbEntry.id,
      tournamentId: dbEntry.tournamentId,
      position: dbEntry.position,
      playerId: dbEntry.playerId,
      seed: dbEntry.seed,
      round: dbEntry.round as RoundTypeEnum,
      matchId: dbEntry.matchId,
    };
  }

  private mapToDrawMatch(dbMatch: any): DrawMatch {
    return {
      id: dbMatch.id,
      tournamentId: dbMatch.tournamentId,
      round: dbMatch.round as RoundTypeEnum,
      position: dbMatch.position,
      player1Id: dbMatch.player1Id,
      player2Id: dbMatch.player2Id,
      winnerId: dbMatch.winnerId,
      nextMatchId: dbMatch.nextMatchId,
      status: dbMatch.status as GameStatus,
      courtId: dbMatch.courtId,
      startTime: dbMatch.startTime,
      endTime: dbMatch.endTime,
    };
  }
}
