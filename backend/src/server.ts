import app from "./app";
import { gracefulShutdown } from "./util";
import prisma from "./db/prisma";

const PORT = process.env.PORT || 4001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✓ Database connected successfully");

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
    });

    process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
  } catch (error) {
    console.error("Shutting down server...", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
