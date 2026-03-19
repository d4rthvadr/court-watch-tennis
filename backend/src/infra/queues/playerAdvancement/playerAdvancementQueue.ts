import { Queue } from "bullmq";
import { redis } from "../../redis";

export const playerAdvancementQueue = new Queue("player-advancement", {
  connection: { host: redis.options.host, port: redis.options.port },
});
