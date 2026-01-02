import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { gameRouter, playerRouter, sseRouter } from "./routes";
import { HttpError, InternalServerError } from "./errors";
import { gracefulShutdown } from "./util";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get("/health", (_, res: Response) => {
  res.status(200).send("OK\n");
});

app.use("/games", gameRouter);
app.use("/players", playerRouter);
app.use("/events", sseRouter);

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

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// TODO: extract to separate module

process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));

export default app;
