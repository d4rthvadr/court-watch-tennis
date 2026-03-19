import { playerQueue } from "../queue";
import { AdvancePlayerQueueService } from "./advance-player.service";

export const advancePlayerQueueService = new AdvancePlayerQueueService(
  playerQueue,
);
