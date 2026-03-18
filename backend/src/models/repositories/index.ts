export * from "./TournamentRepository";
export * from "./PlayerRepository";
export * from "./DrawRepository";
export * from "./GameRepository";

// Singleton instances
import { TournamentRepository } from "./TournamentRepository";
import { PlayerRepository } from "./PlayerRepository";
import { DrawRepository } from "./DrawRepository";
import { GameRepository } from "./GameRepository";

export const tournamentRepository = new TournamentRepository();
export const playerRepository = new PlayerRepository();
export const drawRepository = new DrawRepository();
export const gameRepository = new GameRepository();
