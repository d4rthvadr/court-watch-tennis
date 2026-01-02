export interface Player {
  name: string;
  status: string;
  rank: string;
}
export interface PlayerWithGameStatus extends Player {
  gameStatus: string;
  court: string;
}

export enum EventTypes {
  playerCreated = "playerCreated",
  sseNotification = "sse-notification",
}
