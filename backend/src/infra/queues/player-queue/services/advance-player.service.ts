import { Job, Queue } from "bullmq";
import { PlayerAdvancementJobData } from "../types";
import { defaultJobQueueOptions, IQueueService } from "../../index";
export class AdvancePlayerQueueService<
  T extends PlayerAdvancementJobData,
> implements IQueueService<T> {
  #queue: Queue;
  #jobOptions: any;
  name = "player-advancement";

  constructor(queue: Queue, jobOptions = defaultJobQueueOptions) {
    this.#queue = queue;
    this.#jobOptions = jobOptions;
  }
  //
  async handleJob(data: T) {
    try {
      console.log("[AdvancePlayerService] Handling job with data:", data);
      // Implement the logic to advance the player in the tournament
      // This might involve updating the player's status, rank, etc. in the database
    } catch (error) {
      console.error("[AdvancePlayerService] Error handling job:", error);
      throw error; // Re-throw the error to ensure the job is marked as failed
    }
  }

  #generateJobId(parameters: {
    tournamentId: string;
    matchId: string;
    winnerId: string;
  }): string {
    return `advance-player-${parameters.tournamentId}-${parameters.matchId}-${parameters.winnerId}`;
  }

  async addJob(data: T, options?: any): Promise<Job<T>> {
    const jobId = this.#generateJobId({
      tournamentId: data.tournamentId,
      matchId: data.matchId,
      winnerId: data.winnerId,
    });

    console.log(
      `[AdvancePlayerService] Adding job to queue with ID: ${jobId} and data:`,
      data,
    );

    return await this.#queue.add(this.name, data, {
      ...this.#jobOptions,
      ...options,
      jobId: jobId,
    });
  }
}
