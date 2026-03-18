import { Request, Response, Router } from "express";
import crypto from "node:crypto";
import { eventBus } from "../event-bus";
import { EventTypes } from "../types";
const router = Router();

const updateDefaultInterval = 15 * 1000;

export const connectedClients = new Map<string, Response>();

const getClientId = (clientId?: string): string => {
  return clientId || crypto.randomUUID();
};

const getUpdateInterval = (
  defaultInterval: number,
  interval?: string,
): number => {
  const parsed = parseInt(interval || "");
  return isNaN(parsed) ? defaultInterval : parsed;
};

router.get("/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const clientId = getClientId(req.query?.clientId?.toString());
  const clientUpdateInterval = getUpdateInterval(
    updateDefaultInterval,
    req.query?.updateInterval?.toString(),
  );

  console.log(
    `Client ${clientId} connected with update interval ${clientUpdateInterval}ms`,
  );

  connectedClients.set(clientId, res);

  console.log("Client connected to /sse");

  eventBus.registerListener(EventTypes.sseNotification, (payload) => {
    console.log(`Sending SSE to client ${clientId}:`, payload);
    res.write(`data: ${payload}\n\n`);
  });

  const sendEvent = () => {
    const rankings = [];
    const eventData = JSON.stringify({
      type: "update",
      payload: {
        rankings,
      },
    });
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
      isRemoved ? "" : "(was not found)",
    );
    clearInterval(intervalId);
  });
});

export const sseRouter = router;
