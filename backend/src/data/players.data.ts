import { Player, PlayerWithGameStatus } from "../types";

export const initialPlayers: PlayerWithGameStatus[] = [
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

export const getMatchingPlayers = (
  drawEntries: { id: string; seed?: number }[],
  allPlayers: PlayerWithGameStatus[],
): Player[] => {
  const matchingPlayers: Player[] = [];
  drawEntries.map((entry) => {
    return allPlayers.map((player) => {
      if (player.id === entry.id) {
        matchingPlayers.push({
          ...player,
          seed: entry.seed,
        });
      }
    });
  });
  return matchingPlayers;
};
