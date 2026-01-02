import express, { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import cors from "cors";
import { createEventData, playerController } from "./player-controller";
import { eventBus } from "./event-bus";
import { EventTypes } from "./types";
import { gameRouter, playerRouter } from "./routes";
import { HttpError, InternalServerError } from "./errors";

const app = express();
const PORT = process.env.PORT || 4001;
const updateDefaultInterval = 15 * 1000;

const connectedClients = new Map<string, Response>();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res: Response) => {
  res.status(200).send("OK\n");
});

app.use("/games", gameRouter);
app.use("/players", playerRouter);

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

  eventBus.registerListener(EventTypes.sseNotification, (payload) => {
    console.log(`Sending SSE to client ${clientId}:`, payload);
    res.write(`data: ${payload}\n\n`);
  });

  const sendEvent = () => {
    const rankings = playerController.getPlayerRankings();

    const eventData = createEventData(EventTypes.sseNotification, rankings);
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

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error("Unexpected error type:", err);

  res.status(500).json({ error: new InternalServerError().message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
