export enum PlayerStatus {
  Active = "Active",
  Inactive = "Inactive",
  Retired = "Retired",
  Injured = "Injured",
}

export interface Player {
  id: string;
  name: string;
  status: string;
  rank: number;
}

export interface PlayerWithGameStatus extends Player {
  gameStatus: string;
  court: string;
  seed?: number;
}

export enum EventTypes {
  playerCreated = "playerCreated",
  sseNotification = "sse-notification",
  matchCompleted = "matchCompleted",
  playerAdvanced = "playerAdvanced",
  roundCompleted = "roundCompleted",
  tournamentCompleted = "tournamentCompleted",
}
