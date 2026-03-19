import { Worker, Job } from "bullmq";
import { redis } from "@infra/redis";
import { advancePlayerQueueService } from "./services/container";
import { PlayerAdvancementJobData } from "./types";
import { IQueueService, QUEUE_NAMES } from "..";

const worker = new Worker(
  QUEUE_NAMES.PLAYER_QUEUE,
  async (job: Job) => {
    await handleJob(job);
  },
  { connection: { host: redis.options.host, port: redis.options.port } },
);

const handleJob = async (job: Job) => {
  try {
    const jobHandler = await getJobHandler(job);

    if (!jobHandler) {
      console.warn(`[PlayerQueueWorker] No handler found for job: ${job.name}`);
      return;
    }
    await jobHandler.handleJob(job.data as PlayerAdvancementJobData);
  } catch (error) {
    console.error(`[PlayerQueueWorker] Error processing job ${job.id}:`, error);
    throw error; // Ensure the job is marked as failed
  }
};

const getJobHandler = async (job: Job): Promise<IQueueService | undefined> => {
  switch (job.name) {
    case advancePlayerQueueService.name:
      return advancePlayerQueueService;
    default:
      console.warn(`[PlayerQueueWorker] Unknown job name: ${job.name}`);
      return;
  }
};

worker.on("completed", (job) => {
  console.log(`[PlayerQueueWorker] Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`[PlayerQueueWorker] Job failed: ${job?.id}`, err);
});
