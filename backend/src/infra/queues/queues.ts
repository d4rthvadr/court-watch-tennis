export const startBackgroundQueues = () => {
  console.log("Starting queues...");
  // Import all queues and workers to initialize them
  require("./player-queue/worker");
  // Add more workers here as you create them
};
