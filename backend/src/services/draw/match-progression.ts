import { DrawMatch, GameStatus } from "../../types";

/**
 * Handles match progression logic and winner advancement
 * Updates match status and moves winners to next round
 */
export class MatchProgressionService {
  /**
   * Advance winner to next round
   * @param matches - All matches in the draw
   * @param matchId - ID of completed match
   * @param winnerId - ID of winning player
   * @returns Updated matches array
   */
  /**
   * Advance winner to next round and return only updated matches
   * @returns Array of updated matches: [completedMatch, nextMatch?]
   */
  advanceWinner(
    matches: DrawMatch[],
    matchId: string,
    winnerId: string,
  ): DrawMatch[] {
    const match = matches.find((m) => m.id === matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    this.validateWinner(match, winnerId);

    // Update match with winner
    match.winnerId = winnerId;
    match.status = GameStatus.Completed;

    let nextMatch: DrawMatch | undefined = undefined;
    if (match.nextMatchId) {
      nextMatch = matches.find((m) => m.id === match.nextMatchId);
      if (nextMatch) {
        // Place winner in appropriate slot of next match
        if (!nextMatch.player1Id) {
          nextMatch.player1Id = winnerId;
        } else if (!nextMatch.player2Id) {
          nextMatch.player2Id = winnerId;
        }
        // If both players are now assigned, mark match as scheduled
        if (nextMatch.player1Id && nextMatch.player2Id) {
          nextMatch.status = GameStatus.Scheduled;
        }
      }
    }

    // Return only the updated matches
    return nextMatch ? [match, nextMatch] : [match];
  }

  /**
   * Validate that the winner is one of the match players
   */
  private validateWinner(match: DrawMatch, winnerId: string): void {
    if (match.player1Id !== winnerId && match.player2Id !== winnerId) {
      throw new Error(
        `Winner ${winnerId} is not a player in match ${match.id}`,
      );
    }
  }
}

// Export singleton instance
export const matchProgressionService = new MatchProgressionService();
