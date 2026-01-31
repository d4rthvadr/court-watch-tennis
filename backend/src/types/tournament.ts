export enum TournamentStatus {
  Upcoming = "Upcoming",
  Active = "Active",
  Completed = "Completed",
}

export enum SurfaceType {
  Hard = "Hard",
  Clay = "Clay",
  Grass = "Grass",
  Carpet = "Carpet",
}

export enum DrawSize {
  Eight = 8,
  Sixteen = 16,
  ThirtyTwo = 32,
  SixtyFour = 64,
  OneTwentyEight = 128,
}

export enum MatchType {
  Singles = "singles",
  Doubles = "doubles",
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  surfaceType: SurfaceType;
  drawSize: DrawSize;
  status: TournamentStatus;
  matchType: MatchType;
}
