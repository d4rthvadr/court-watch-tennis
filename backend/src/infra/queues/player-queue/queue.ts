import { redis } from "@infra/redis";
import { Queue } from "bullmq";
import { QUEUE_NAMES } from "..";

const playerQueue = new Queue(QUEUE_NAMES.PLAYER_QUEUE, {
  connection: { host: redis.options.host, port: redis.options.port },
});

export { playerQueue };
