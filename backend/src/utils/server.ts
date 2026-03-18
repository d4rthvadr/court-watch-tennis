import { connectedClients } from "./../routes/sse-router";
import prisma from "./../db/prisma";

const isProduction = process.env.NODE_ENV === "production";

const shutdownServer = (server: any | null) => {
  if (!server) {
    return;
  }
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
};

const disconnectInMemoryClients = () => {
  connectedClients.forEach((res, clientId) => {
    res.write(
      `data: ${JSON.stringify({ type: "shutdown", payload: null })}\n\n`,
    );
    res.end();
  });
  connectedClients.clear();
};

/**
 * Performs a graceful shutdown of the server and database connections when a termination signal is received.
 * @param signal
 * @param server
 */
export const gracefulShutdown = (
  signal: "SIGINT" | "SIGTERM",
  server: any | null,
) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // sagely notify clients
  disconnectInMemoryClients();

  // Close the server and database connections
  shutdownServer(server);

  setTimeout(async () => {
    console.warn(
      "Forcing shutdown after timeout. Some connections may not have closed gracefully.",
    );
    await prisma.$disconnect();
    process.exit(1);
  }, 10 * 1000);
};

/**
 *  Sets up handlers for process events to ensure graceful shutdown of the server and database connections.
 * @param server
 * @returns void
 */
export const handleProcessEvents = (server: any | null) => {
  if (!server) {
    console.warn(
      "Server instance is not available for process event handling. Process events will not be handled.",
    );
    return;
  }
  process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));

  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    console.error("Unhandled Promise Rejection:", reason, promise);

    // In production, we might want to exit gracefully
    // In development, keep the server running for better DX
    if (!isProduction) {
      console.warn(
        "Server continuing in development mode. Fix the unhandled rejection above!",
      );
      return;
    }
    console.error("Initiating graceful shutdown due to unhandled rejection...");
    gracefulShutdown("SIGTERM", server);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error, error.stack);

    // In production, we should exit as the app state may be corrupted
    // In development, log but keep running for better DX
    if (!isProduction) {
      console.warn(
        "Server continuing in development mode. Fix the uncaught exception above!",
      );
      return;
    }
    console.error("Initiating graceful shutdown due to uncaught exception...");
    gracefulShutdown("SIGTERM", server);
  });
};
