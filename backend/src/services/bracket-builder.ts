import { v4 as uuidv4 } from "uuid";
import { DrawMatch, RoundTypeEnum, GameStatus } from "../types";

interface SeededPlayer {
  id: string;
  name: string;
  seed?: number;
}

/**
 * Handles tournament bracket construction and match tree generation
 * Creates single-elimination bracket structure with proper linking
 */
export class BracketBuilder {
  /**
   * Generate all matches for the tournament
   */
  generateMatches(
    tournamentId: string,
    drawPositions: Map<number, SeededPlayer>,
    drawSize: number,
  ): DrawMatch[] {
    const matches: DrawMatch[] = [];
    let currentMatchIds: string[] = [];
    let currentRoundSize = drawSize / 2;

    // Generate first round matches
    let matchPosition = 1;
    for (let i = 1; i <= drawSize; i += 2) {
      const player1 = drawPositions.get(i);
      const player2 = drawPositions.get(i + 1);

      const matchId = uuidv4();
      currentMatchIds.push(matchId);

      const match: DrawMatch = {
        id: matchId,
        tournamentId,
        round: this.getRoundType(currentRoundSize),
        position: matchPosition++,
        player1Id: player1?.id,
        player2Id: player2?.id,
        status:
          player1 && player2 ? GameStatus.Scheduled : GameStatus.Scheduled,
      };

      // Handle bye (only one player)
      if (player1 && !player2) {
        match.winnerId = player1.id;
        match.status = GameStatus.Completed;
      } else if (!player1 && player2) {
        match.winnerId = player2.id;
        match.status = GameStatus.Completed;
      }

      matches.push(match);
    }

    // Generate subsequent rounds
    while (currentRoundSize > 1) {
      const nextRoundSize = currentRoundSize / 2;
      const nextMatchIds: string[] = [];
      matchPosition = 1;

      for (let i = 0; i < currentMatchIds.length; i += 2) {
        const nextMatchId = uuidv4();
        nextMatchIds.push(nextMatchId);

        // Link current round matches to next round
        const match1 = matches.find((m) => m.id === currentMatchIds[i]);
        const match2 = matches.find((m) => m.id === currentMatchIds[i + 1]);

        if (match1) match1.nextMatchId = nextMatchId;
        if (match2) match2.nextMatchId = nextMatchId;

        // Create next round match
        const nextMatch: DrawMatch = {
          id: nextMatchId,
          tournamentId,
          round: this.getRoundType(nextRoundSize),
          position: matchPosition++,
          status: GameStatus.Scheduled,
        };

        // Auto-advance byes
        if (match1?.winnerId && !match2?.winnerId) {
          nextMatch.player1Id = match1.winnerId;
        } else if (!match1?.winnerId && match2?.winnerId) {
          nextMatch.player1Id = match2.winnerId;
        }

        matches.push(nextMatch);
      }

      currentMatchIds = nextMatchIds;
      currentRoundSize = nextRoundSize;
    }

    return matches;
  }

  /**
   * Get round name based on remaining matches
   */
  getRoundType(matchesInRound: number): RoundTypeEnum {
    switch (matchesInRound) {
      case 1:
        return RoundTypeEnum.F;
      case 2:
        return RoundTypeEnum.SF;
      case 4:
        return RoundTypeEnum.QF;
      case 8:
        return RoundTypeEnum.R4;
      case 16:
        return RoundTypeEnum.R3;
      case 32:
        return RoundTypeEnum.R2;
      case 64:
        return RoundTypeEnum.R1;
      default:
        return RoundTypeEnum.R1;
    }
  }
}

// Export singleton instance
export const bracketBuilder = new BracketBuilder();
