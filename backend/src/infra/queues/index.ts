import { Job, JobsOptions } from "bullmq";

export const defaultJobQueueOptions: JobsOptions = {
  attempts: 3, // TODO: make this dynamic based on the job type
  backoff: {
    type: "exponential",
    delay: 5000, // 5 seconds
  },
};

export const QUEUE_NAMES = {
  PLAYER_QUEUE: "player-queue",
};

export interface IQueueService<T = any> {
  addJob(data: T, options?: JobsOptions): Promise<Job<T>>;
  handleJob(data: T): Promise<void>;
}
