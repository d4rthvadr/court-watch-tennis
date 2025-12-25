import { EventEmitter } from "stream";
import { PlayerWithGameStatus } from "./types";

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
class PlayerController {
  players: PlayerWithGameStatus[] = initialPlayers;
  #eventBus: EventEmitter | null = null;
  init(eventBus: EventEmitter) {
    this.#eventBus = eventBus;
  }

  get eventBus(): EventEmitter {
    if (!this.#eventBus) {
      throw new Error("Event bus not initialized");
    }
    return this.#eventBus;
  }

  getPlayers() {
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

  createPlayer(player: PlayerWithGameStatus) {
    this.players.push(player);
    console.log("Player created:", player);
    this.eventBus.emit("playerCreated", player);
  }
}

export const playerController = new PlayerController();
