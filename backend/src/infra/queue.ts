import { Queue } from "bullmq";
import { redis } from "./redis";

export const tournamentQueue = new Queue("tournament", {
  connection: { host: redis.options.host, port: redis.options.port },
});
