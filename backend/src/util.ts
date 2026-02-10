import { NextFunction } from "express";
import { connectedClients } from "./routes/sse-router";
import { Request, Response } from "express";
import prisma from "./db/prisma";

export const gracefulShutdown = (signal: "SIGINT" | "SIGTERM", server: any) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // sagely notify clients
  connectedClients.forEach((res, clientId) => {
    res.write(
      `data: ${JSON.stringify({ type: "shutdown", payload: null })}\n\n`,
    );
    res.end();
  });
  connectedClients.clear(); // clear the map for memory management

  // shutdown actual server
  server.close(async (err: any) => {
    // close database connections
    await prisma.$disconnect();

    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("Graceful shutdown complete. Exiting process.");
    process.exit(0);
  });

  setTimeout(async () => {
    console.warn(
      "Forcing shutdown after timeout. Some connections may not have closed gracefully.",
    );
    await prisma.$disconnect();
    process.exit(1);
  }, 10 * 1000);
};

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
