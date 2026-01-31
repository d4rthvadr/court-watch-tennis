import { GameStatus } from "./game";

export enum RoundTypeEnum {
  R1 = "R1",
  R2 = "R2",
  R3 = "R3",
  R4 = "R4",
  QF = "QF",
  SF = "SF",
  F = "F",
}

export interface DrawEntry {
  id: string;
  tournamentId: string;
  position: number; // 1-based position in the draw (1-128)
  playerId?: string; // null for byes
  seed?: number; // 1-32 for seeded players, undefined for unseeded
  round: RoundTypeEnum;
  matchId?: string; // Reference to the match this player is in
}

export interface DrawMatch {
  id: string;
  tournamentId: string;
  round: RoundTypeEnum;
  position: number; // Position within the round (e.g., match 1 of 4 in QF)
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  nextMatchId?: string; // Match where winner advances to
  status: GameStatus;
  courtId?: string;
  startTime?: string;
  endTime?: string;
}

export interface DrawStructure {
  tournamentId: string;
  drawSize: number;
  entries: DrawEntry[];
  matches: DrawMatch[];
}
