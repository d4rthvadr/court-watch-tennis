import { playerAdvancementQueue } from "./playerAdvancementQueue";

async function main() {
  const job = await playerAdvancementQueue.add("advance-player", {
    tournamentId: "test-tournament-id",
    matchId: "test-match-id",
    winnerId: "test-winner-id",
    round: "QF",
    triggeredAt: new Date().toISOString(),
  });
  console.log(`[PlayerAdvancementProducer] Enqueued job: ${job.id}`);
  await playerAdvancementQueue.close();
}

main().catch((err) => {
  console.error("[PlayerAdvancementProducer] Error:", err);
  process.exit(1);
});
