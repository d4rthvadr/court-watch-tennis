import { Worker } from "bullmq";
import { connectionOpts, redis } from "../redis";

const worker = new Worker(
  "tournament",
  async (job) => {
    console.log("[BullMQ Worker] Processing job:", job.name, job.data);
    // Simulate work
    return { result: "ok" };
  },
  {
    connection: connectionOpts,
  },
);

worker.on("completed", (job) => {
  console.log(`[BullMQ Worker] Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`[BullMQ Worker] Job failed: ${job?.id}`, err);
});
