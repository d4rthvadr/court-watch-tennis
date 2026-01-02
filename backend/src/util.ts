import { connectedClients } from "./routes/sse-router";

export const gracefulShutdown = (signal: "SIGINT" | "SIGTERM", server: any) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  console.log(
    "Closing HTTP server...",
    connectedClients.size,
    "clients to notify."
  );

  // sagely notify clients
  connectedClients.forEach((res, clientId) => {
    console.log(`Notifying client ${clientId} of shutdown.`);
    res.write(
      `data: ${JSON.stringify({ type: "shutdown", payload: null })}\n\n`
    );
    res.end();
  });
  connectedClients.clear(); // clear the map for memory management

  // shutdown actual server
  server.close((err: any) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }
    console.log("HTTP server closed.");

    // drain other resources like DB connections

    console.log("Graceful shutdown complete. Exiting process.");
    process.exit(0);
  });

  setTimeout(() => {
    console.warn(
      "Forcing shutdown after timeout. Some connections may not have closed gracefully."
    );
    process.exit(1);
  }, 10 * 1000);
};
