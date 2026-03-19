import { Queue } from "bullmq";
import { connectionOpts } from "./redis";

const queue = new Queue("tournament", { connection: connectionOpts });

async function main() {
  const job = await queue.add("test-job", {
    hello: "world",
    time: new Date().toISOString(),
  });
  console.log(`[BullMQ Producer] Enqueued job: ${job.id}`);
  await queue.close();
}

main().catch((err) => {
  console.error("[BullMQ Producer] Error:", err);
  process.exit(1);
});
