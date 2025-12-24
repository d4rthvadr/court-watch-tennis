import express, { Request, Response } from "express";
import crypto from "crypto";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4001;
const updateInterval = 5 * 1000; // 15 seconds

const clientStore = new Map<string, Response>();

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
    updateInterval,
    req.query?.updateInterval?.toString()
  );

  console.log(
    `Client ${clientId} connected with update interval ${clientUpdateInterval}ms`
  );

  clientStore.set(clientId, res);

  console.log("Client connected to /sse");

  const sendEvent = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  const intervalId = setInterval(() => {
    const eventData = `Current time is: ${new Date().toISOString()}`;
    sendEvent(eventData);
  }, clientUpdateInterval);

  req.on("close", () => {
    const isRemoved = clientStore.delete(clientId);
    console.log(
      `Client ${clientId} disconnected from /sse`,
      isRemoved ? "" : "(was not found)"
    );
    clearInterval(intervalId);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
