import { v4 as uuidv4 } from "uuid";
import {
  DrawEntry,
  DrawMatch,
  DrawStructure,
  RoundTypeEnum,
  DrawSize,
  GameStatus,
} from "../types";
import { Player } from "../types";

interface SeededPlayer {
  id: string;
  name: string;
  seed?: number;
}

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
    if (!this.#isPowerOfTwo(drawSize)) {
      throw new Error(`Draw size must be a power of 2. Got: ${drawSize}`);
    }

    // Validate player count doesn't exceed draw size
    if (players.length > drawSize) {
      throw new Error(
        `Too many players (${players.length}) for draw size ${drawSize}`,
      );
    }

    // Sort players: seeded first (by seed number), then unseeded
    const sortedPlayers = this.#sortPlayers(players);

    // Place seeded players in standard positions
    const drawPositions = this.#placePlayersInDraw(
      sortedPlayers,
      drawSize as number,
    );

    // Generate matches for all rounds
    const matches = this.#generateMatches(
      tournamentId,
      drawPositions,
      drawSize as number,
    );

    // Create draw entries
    const entries = this.#createDrawEntries(
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
    const match = matches.find((m) => m.id === matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    // Validate winner is one of the match players
    if (match.player1Id !== winnerId && match.player2Id !== winnerId) {
      throw new Error(`Winner ${winnerId} is not a player in match ${matchId}`);
    }

    // Update match with winner
    match.winnerId = winnerId;
    match.status = GameStatus.Completed;

    // If there's a next match, advance winner
    if (match.nextMatchId) {
      const nextMatch = matches.find((m) => m.id === match.nextMatchId);
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

    return matches;
  }

  /**
   * Get round name based on remaining matches
   */
  #getRoundType(matchesInRound: number): RoundTypeEnum {
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

  /**
   * Check if number is power of 2
   */
  #isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  /**
   * Sort players: seeded first (by seed), then unseeded
   */
  #sortPlayers(players: SeededPlayer[]): SeededPlayer[] {
    const seeded = players
      .filter((p) => p.seed !== undefined)
      .sort((a, b) => (a.seed || 0) - (b.seed || 0));
    const unseeded = players.filter((p) => p.seed === undefined);

    return [...seeded, ...unseeded];
  }

  /**
   * Place players in draw positions using standard seeding placement
   */
  #placePlayersInDraw(
    players: SeededPlayer[],
    drawSize: number,
  ): Map<number, SeededPlayer> {
    const positions = new Map<number, SeededPlayer>();

    // Get standard seeding positions for this draw size
    const seedingPositions = this.#getStandardSeedingPositions(drawSize);

    // Get available positions for unseeded players (randomized once)
    const availablePositions = this.#getRandomizedAvailablePositions(
      drawSize,
      seedingPositions,
    );
    let availableIndex = 0;

    players.forEach((player, _) => {
      let position: number;

      if (player.seed && player.seed <= seedingPositions.length) {
        // Place seeded player in standard position
        position = seedingPositions[player.seed - 1];
      } else {
        // Place unseeded player in randomized available position
        position = availablePositions[availableIndex++];
      }

      positions.set(position, player);
    });

    return positions;
  }

  /**
   * Get standard seeding positions for draw size (ATP/WTA standard)
   */
  #getStandardSeedingPositions(drawSize: number): number[] {
    // Standard seeding positions for different draw sizes
    const seedingMap: { [key: number]: number[] } = {
      8: [1, 8, 4, 5, 3, 6, 2, 7],
      16: [1, 16, 8, 9, 4, 13, 5, 12, 3, 14, 6, 11, 2, 15, 7, 10],
      32: [
        1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21, 3, 30, 14,
        19, 6, 27, 11, 22, 2, 31, 15, 18, 7, 26, 10, 23,
      ],
    };

    return seedingMap[drawSize] || this.#generateDefaultPositions(drawSize);
  }

  /**
   * Get randomized available positions for unseeded players
   * Excludes positions reserved for seeded players
   */
  #getRandomizedAvailablePositions(
    drawSize: number,
    seedingPositions: number[],
  ): number[] {
    // Get all positions
    const allPositions = Array.from({ length: drawSize }, (_, i) => i + 1);

    // Filter out seeding positions
    const availablePositions = allPositions.filter(
      (pos) => !seedingPositions.includes(pos),
    );

    // Shuffle available positions (Fisher-Yates algorithm)
    return this.#shuffleArray(availablePositions);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  #shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate default positions (1, 2, 3, ...) for unsupported draw sizes
   */
  #generateDefaultPositions(drawSize: number): number[] {
    return Array.from({ length: drawSize }, (_, i) => i + 1);
  }

  /**
   * Generate all matches for the tournament
   */
  #generateMatches(
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
        round: this.#getRoundType(currentRoundSize),
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
          round: this.#getRoundType(nextRoundSize),
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
   * Create draw entries from positions and matches
   */
  #createDrawEntries(
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
