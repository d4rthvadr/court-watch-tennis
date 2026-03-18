interface SeededPlayer {
  id: string;
  name: string;
  seed?: number;
}

/**
 * Handles player seeding and positioning logic for tournament draws
 * Implements ATP/WTA standard seeding positions
 */
export class SeedingStrategy {
  /**
   * Sort players: seeded first (by seed), then unseeded
   */
  sortPlayers(players: SeededPlayer[]): SeededPlayer[] {
    const seeded = players
      .filter((p) => p.seed !== undefined)
      .sort((a, b) => (a.seed || 0) - (b.seed || 0));
    const unseeded = players.filter((p) => p.seed === undefined);

    return [...seeded, ...unseeded];
  }

  /**
   * Place players in draw positions using standard seeding placement
   */
  placePlayersInDraw(
    players: SeededPlayer[],
    drawSize: number,
  ): Map<number, SeededPlayer> {
    // Step 1: Validate seeds
    const seedingPositions = this.getStandardSeedingPositions(drawSize);
    const seenSeeds = new Set<number>();
    players.forEach((p) => {
      if (p.seed !== undefined) {
        if (
          !Number.isInteger(p.seed) ||
          p.seed < 1 ||
          p.seed > seedingPositions.length
        ) {
          throw new Error(
            `Invalid seed ${p.seed} for player '${p.name}'. Seed must be 1..${seedingPositions.length}`,
          );
        }
        if (seenSeeds.has(p.seed)) {
          throw new Error(
            `Duplicate seed ${p.seed} found for player '${p.name}'. All seeds must be unique.`,
          );
        }
        seenSeeds.add(p.seed);
      }
    });

    // Step 2: Assign seeded players
    const positions = new Map<number, SeededPlayer>();
    players.forEach((player) => {
      if (player.seed !== undefined) {
        const pos = seedingPositions[player.seed - 1];
        if (positions.has(pos)) {
          throw new Error(
            `Position ${pos} already assigned. Check for duplicate seeds.`,
          );
        }
        positions.set(pos, player);
      }
    });

    // Step 3: Assign unseeded players to remaining positions (randomized)
    const allPositions = Array.from({ length: drawSize }, (_, i) => i + 1);
    const unassignedPositions = allPositions.filter(
      (pos) => !positions.has(pos),
    );
    const unseededPlayers = players.filter((p) => p.seed === undefined);
    const shuffledUnassigned = this.shuffleArray(unassignedPositions);
    if (unseededPlayers.length > shuffledUnassigned.length) {
      throw new Error(
        `Not enough positions for unseeded players. Unseeded: ${unseededPlayers.length}, available: ${shuffledUnassigned.length}`,
      );
    }
    unseededPlayers.forEach((player, idx) => {
      const pos = shuffledUnassigned[idx];
      positions.set(pos, player);
    });

    // Step 4: Final validation
    if (positions.size !== players.length) {
      throw new Error(
        `Mismatch: assigned positions (${positions.size}) != players (${players.length}).`,
      );
    }
    return positions;
  }

  /**
   * Get standard seeding positions for draw size (ATP/WTA standard)
   */
  getStandardSeedingPositions(drawSize: number): number[] {
    // Standard seeding positions for different draw sizes
    const seedingMap: { [key: number]: number[] } = {
      8: [1, 8, 4, 5, 3, 6, 2, 7],
      16: [1, 16, 8, 9, 4, 13, 5, 12, 3, 14, 6, 11, 2, 15, 7, 10],
      32: [
        1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21, 3, 30, 14,
        19, 6, 27, 11, 22, 2, 31, 15, 18, 7, 26, 10, 23,
      ],
    };

    return seedingMap[drawSize] || this.generateDefaultPositions(drawSize);
  }

  /**
   * Get randomized available positions for unseeded players
   * Excludes positions reserved for seeded players
   */
  private getRandomizedAvailablePositions(
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
    return this.shuffleArray(availablePositions);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffleArray<T>(array: T[]): T[] {
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
  private generateDefaultPositions(drawSize: number): number[] {
    return Array.from({ length: drawSize }, (_, i) => i + 1);
  }
}

// Export singleton instance
export const seedingStrategy = new SeedingStrategy();
