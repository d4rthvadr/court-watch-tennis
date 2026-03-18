import app from "./app";
import { gracefulShutdown, handleProcessEvents } from "./utils/server";
import prisma from "./db/prisma";

const PORT = process.env.PORT || 4001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    handleProcessEvents(server);
  } catch (error) {
    // This only catches startup errors (connection, binding, etc.)
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
