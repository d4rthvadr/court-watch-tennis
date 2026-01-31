import { EventTypes, PlayerWithGameStatus } from "../types";
import { eventBus } from "../event-bus";
import { initialPlayers } from "../data/players.data";

interface EventData<T = unknown> {
  type: EventTypes;
  payload: T;
}

export const createEventData = (type: EventTypes, payload: unknown): string => {
  const data = {
    type,
    payload,
  } satisfies EventData;

  return JSON.stringify(data);
};
class PlayerController {
  players: PlayerWithGameStatus[] = initialPlayers;

  findAll() {
    return this.players;
  }

  find(id: string): PlayerWithGameStatus {
    const player = this.players.find((player) => player.id === id);

    if (!player) {
      throw new Error("Player not found");
    }
    return player;
  }

  create(player: PlayerWithGameStatus) {
    this.players.push(player);

    const eventData = createEventData(EventTypes.playerCreated, player);
    console.log("Player created and event emitted:", { player, eventData });

    eventBus.createEvent(EventTypes.playerCreated, player);
    eventBus.createEvent(EventTypes.sseNotification, eventData);
  }

  /**
   * Get seeded players for tournament draw generation
   * Returns players sorted by seed number
   */
  getSeededPlayers(): PlayerWithGameStatus[] {
    return this.players
      .filter((p) => p.seed !== undefined)
      .sort((a, b) => (a.seed || 0) - (b.seed || 0));
  }

  /**
   * Get players for tournament (with id, name, seed)
   */
  getPlayersForTournament() {
    return this.players.map((player) => ({
      id: player.id,
      name: player.name,
      seed: player.seed,
    }));
  }

  getPlayerRankings() {
    return this.players.map((player) => {
      const gameStatuses = ["Paid", "Pending", "Unpaid"];
      const playerStatuses = ["Playing", "Waiting"];
      const randomGameStatus =
        gameStatuses[Math.floor(Math.random() * gameStatuses.length)];
      return {
        ...player,
        rank: (Math.floor(Math.random() * 100) + 1).toString(),
        status:
          playerStatuses[Math.floor(Math.random() * playerStatuses.length)],
        gameStatus: randomGameStatus,
      };
    });
  }
}

export const playerController = new PlayerController();
