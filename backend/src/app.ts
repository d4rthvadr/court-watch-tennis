import express, { Request, Response } from "express";
import crypto from "crypto";
import cors from "cors";
import { playerController } from "./player-controller";
import { eventBus } from "./event-bus";

const app = express();
const PORT = process.env.PORT || 4001;
const updateDefaultInterval = 15 * 1000;

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
    const randomizedPlayers = playerController.getPlayers();
    const eventData = JSON.stringify(randomizedPlayers);
    res.write(`data: ${eventData}\n\n`);
  };

  eventBus.on("playerCreated", (player) => {
    const eventData = JSON.stringify(player);
    res.write(`data: ${eventData}\n\n`);
  });

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
