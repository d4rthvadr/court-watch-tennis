import { EventTypes, PlayerWithGameStatus } from "./types";
import { eventBus } from "./event-bus";

const initialPlayers: PlayerWithGameStatus[] = [
  {
    name: "Rodger Federer",
    status: "Active",
    rank: "1",
    gameStatus: "Playing",
    court: "Court 1",
  },
  {
    name: "Rafael Nadal",
    status: "Pending",
    rank: "2  ",
    gameStatus: "Waiting",
    court: "Court 2",
  },
  {
    name: "Novak Djokovic",
    status: "Unpaid",
    rank: "3",
    gameStatus: "Waiting",
    court: "Court 3",
  },
  {
    name: "Andy Murray",
    status: "Paid",
    rank: "4",
    gameStatus: "Playing",
    court: "Court 4",
  },
  {
    name: "Stan Wawrinka",
    status: "Paid",
    rank: "5",
    gameStatus: "Playing",
    court: "Court 5",
  },
  {
    name: "Nick Kyrgios",
    status: "Pending",
    rank: "6",
    gameStatus: "Waiting",
    court: "Court 6",
  },
  {
    name: "Juan Martin del Potro",
    status: "Unpaid",
    rank: "7",
    gameStatus: "Waiting",
    court: "Court 7",
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
    const player = this.players.find((player) => player.name === id);

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
