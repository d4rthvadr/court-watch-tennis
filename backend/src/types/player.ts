export interface Player {
  id: string;
  name: string;
  status: string;
  rank: string;
  seed?: number;
}
export interface PlayerWithGameStatus extends Player {
  gameStatus: string;
  court: string;
}

export enum EventTypes {
  playerCreated = "playerCreated",
  sseNotification = "sse-notification",
}
