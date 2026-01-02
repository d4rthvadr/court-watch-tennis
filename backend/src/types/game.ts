export type GameStatus = "Scheduled" | "Ongoing" | "Completed" | "Cancelled";

export interface Game {
  id?: string;
  name?: string;
  status: GameStatus;
  startTime?: string;
  endTime?: string;
  player_one_id: string;
  player_two_id: string;
  courtId: string;
}
