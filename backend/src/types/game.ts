export enum GameStatus {
  Scheduled = "Scheduled",
  Ongoing = "Ongoing",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface Game {
  id?: string;
  name?: string;
  status: GameStatus;
  startTime?: string;
  endTime?: string;
  playerOneId: string;
  playerTwoId: string;
  courtId: string;
}
