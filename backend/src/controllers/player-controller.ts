import { EventTypes, PlayerWithGameStatus } from "../types";
import { eventBus } from "../event-bus";

const initialPlayers: PlayerWithGameStatus[] = [
  {
    id: "player-1",
    name: "Rodger Federer",
    status: "Active",
    rank: "1",
    seed: 1,
    gameStatus: "Playing",
    court: "Court 1",
  },
  {
    id: "player-2",
    name: "Rafael Nadal",
    status: "Pending",
    rank: "2",
    seed: 2,
    gameStatus: "Waiting",
    court: "Court 2",
  },
  {
    id: "player-3",
    name: "Novak Djokovic",
    status: "Unpaid",
    rank: "3",
    seed: 3,
    gameStatus: "Waiting",
    court: "Court 3",
  },
  {
    id: "player-4",
    name: "Andy Murray",
    status: "Paid",
    rank: "4",
    seed: 4,
    gameStatus: "Playing",
    court: "Court 4",
  },
  {
    id: "player-5",
    name: "Stan Wawrinka",
    status: "Paid",
    rank: "5",
    seed: 5,
    gameStatus: "Playing",
    court: "Court 5",
  },
  {
    id: "player-6",
    name: "Nick Kyrgios",
    status: "Pending",
    rank: "6",
    seed: 6,
    gameStatus: "Waiting",
    court: "Court 6",
  },
  {
    id: "player-7",
    name: "Juan Martin del Potro",
    status: "Unpaid",
    rank: "7",
    seed: 7,
    gameStatus: "Waiting",
    court: "Court 7",
  },
  {
    id: "player-8",
    name: "Dominic Thiem",
    status: "Paid",
    rank: "8",
    seed: 8,
    gameStatus: "Waiting",
    court: "Court 8",
  },
];

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
