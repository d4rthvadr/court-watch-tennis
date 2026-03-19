import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import {
  gameRouter,
  playerRouter,
  sseRouter,
  tournamentRouter,
  drawRouter,
} from "./routes/index";
import { HttpError, InternalServerError } from "./errors";
import { startBackgroundQueues } from "@infra/queues/queues";

const app = express();

app.use(cors());
app.use(express.json());

// Start background queues
startBackgroundQueues();

app.get("/health", (_, res: Response) => {
  res.status(200).send("OK\n");
});

app.use("/api/games", gameRouter);
app.use("/api/players", playerRouter);
app.use("/api/tournaments", tournamentRouter);
app.use("/api/tournaments", drawRouter);
app.use("/api/events", sseRouter);

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

export default app;
