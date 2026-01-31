import { v4 as uuidv4 } from "uuid";
import {
  DrawEntry,
  DrawMatch,
  DrawStructure,
  RoundTypeEnum,
  DrawSize,
} from "../types";
import { seedingStrategy } from "./seeding-strategy";
import { bracketBuilder } from "./bracket-builder";
import { matchProgressionService } from "./match-progression";

interface SeededPlayer {
  id: string;
  name: string;
  seed?: number;
}

/**
 * Main orchestrator for tournament draw generation and management
 * Coordinates seeding, bracket building, and match progression
 */
export class DrawService {
  /**
   * Generate a single-elimination draw for a tournament
   * @param tournamentId - The tournament ID
   * @param players - Array of players with optional seed numbers
   * @param drawSize - Size of the draw (must be power of 2)
   * @returns Complete draw structure with entries and matches
   */
  generateDraw(
    tournamentId: string,
    players: SeededPlayer[],
    drawSize: DrawSize,
  ): DrawStructure {
    // Validate draw size is power of 2
    if (!this.isPowerOfTwo(drawSize)) {
      throw new Error(`Draw size must be a power of 2. Got: ${drawSize}`);
    }

    // Validate player count doesn't exceed draw size
    if (players.length > drawSize) {
      throw new Error(
        `Too many players (${players.length}) for draw size ${drawSize}`,
      );
    }

    // Sort players: seeded first (by seed number), then unseeded
    const sortedPlayers = seedingStrategy.sortPlayers(players);

    // Place seeded players in standard positions
    const drawPositions = seedingStrategy.placePlayersInDraw(
      sortedPlayers,
      drawSize as number,
    );

    // Generate matches for all rounds
    const matches = bracketBuilder.generateMatches(
      tournamentId,
      drawPositions,
      drawSize as number,
    );

    // Create draw entries
    const entries = this.createDrawEntries(
      tournamentId,
      drawPositions,
      matches,
    );

    return {
      tournamentId,
      drawSize: drawSize as number,
      entries,
      matches,
    };
  }

  /**
   * Advance winner to next round
   * @param matches - All matches in the draw
   * @param matchId - ID of completed match
   * @param winnerId - ID of winning player
   * @returns Updated matches array
   */
  advanceWinner(
    matches: DrawMatch[],
    matchId: string,
    winnerId: string,
  ): DrawMatch[] {
    return matchProgressionService.advanceWinner(matches, matchId, winnerId);
  }

  /**
   * Check if number is power of 2
   */
  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  /**
   * Create draw entries from positions and matches
   */
  private createDrawEntries(
    tournamentId: string,
    drawPositions: Map<number, SeededPlayer>,
    matches: DrawMatch[],
  ): DrawEntry[] {
    const entries: DrawEntry[] = [];

    drawPositions.forEach((player, position) => {
      // Find the first round match for this player
      const match = matches.find(
        (m) => m.player1Id === player.id || m.player2Id === player.id,
      );

      entries.push({
        id: uuidv4(),
        tournamentId,
        position,
        playerId: player.id,
        seed: player.seed,
        round: RoundTypeEnum.R1,
        matchId: match?.id,
      });
    });

    return entries;
  }
}

// Export singleton instance
export const drawService = new DrawService();
