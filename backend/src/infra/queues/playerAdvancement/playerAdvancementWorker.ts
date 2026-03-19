import { Worker, Job } from "bullmq";
import { redis } from "../../redis";

interface PlayerAdvancementJobData {
  tournamentId: string;
  matchId: string;
  winnerId: string;
  round: string;
  triggeredAt: string;
}

const worker = new Worker(
  "player-advancement",
  async (job: Job<PlayerAdvancementJobData>) => {
    console.log(
      "[PlayerAdvancementWorker] Processing job:",
      job.name,
      job.data,
    );
    // TODO: Call player advancement logic here
    return { result: "player advanced" };
  },
  { connection: { host: redis.options.host, port: redis.options.port } },
);

worker.on("completed", (job) => {
  console.log(`[PlayerAdvancementWorker] Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`[PlayerAdvancementWorker] Job failed: ${job?.id}`, err);
});
