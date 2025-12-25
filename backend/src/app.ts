import express, { Request, Response } from "express";
import crypto from "crypto";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4001;
const updateDefaultInterval = 5 * 1000; // 15 seconds

const connectedClients = new Map<string, Response>();

app.use(cors());

app.get("/health", (_, res: Response) => {
  res.status(200).send("OK\n");
});

const getClientId = (clientId?: string): string => {
  return clientId || crypto.randomUUID();
};

const getUpdateInterval = (
  defaultInterval: number,
  interval?: string
): number => {
  const parsed = parseInt(interval || "");
  return isNaN(parsed) ? defaultInterval : parsed;
};
interface Player {
  name: string;
  status: string;
  rank: string;
}
interface PlayerWithGameStatus extends Player {
  gameStatus: string;
  court: string;
}

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

const randomizePlayerData = (players: typeof initialPlayers) => {
  return players.map((player) => {
    const gameStatuses = ["Paid", "Pending", "Unpaid"];
    const playerStatuses = ["Playing", "Waiting"];
    const randomGameStatus =
      gameStatuses[Math.floor(Math.random() * gameStatuses.length)];
    return {
      ...player,
      rank: (Math.floor(Math.random() * 100) + 1).toString(),
      status: playerStatuses[Math.floor(Math.random() * playerStatuses.length)],
      gameStatus: randomGameStatus,
    };
  });
};
app.get("/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const clientId = getClientId(req.query?.clientId?.toString());
  const clientUpdateInterval = getUpdateInterval(
    updateDefaultInterval,
    req.query?.updateInterval?.toString()
  );

  console.log(
    `Client ${clientId} connected with update interval ${clientUpdateInterval}ms`
  );

  connectedClients.set(clientId, res);

  console.log("Client connected to /sse");

  const sendEvent = () => {
    const randomizedPlayers = randomizePlayerData(initialPlayers);
    const eventData = JSON.stringify(randomizedPlayers);
    res.write(`data: ${eventData}\n\n`);
  };

  const intervalId = setInterval(() => {
    sendEvent();
  }, clientUpdateInterval);

  req.on("close", () => {
    const isRemoved = connectedClients.delete(clientId);
    console.log(
      `Client ${clientId} disconnected from /sse`,
      " Remaining clients:",
      connectedClients.size,
      isRemoved ? "" : "(was not found)"
    );
    clearInterval(intervalId);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
