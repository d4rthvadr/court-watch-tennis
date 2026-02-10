export * from "./TournamentRepository";
export * from "./PlayerRepository";
export * from "./DrawRepository";

// Singleton instances
import { TournamentRepository } from "./TournamentRepository";
import { PlayerRepository } from "./PlayerRepository";
import { DrawRepository } from "./DrawRepository";

export const tournamentRepository = new TournamentRepository();
export const playerRepository = new PlayerRepository();
export const drawRepository = new DrawRepository();
