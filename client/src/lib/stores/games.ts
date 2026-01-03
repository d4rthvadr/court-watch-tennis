import { writable } from 'svelte/store';

export interface GameStats {
	aces: number;
	winners: number;
	doubleFaults: number;
	unforcedErrors: number;
}

export interface Game {
	id: string;
	courtNumber: string;
	player1: string;
	player2: string;
	gameDate: string;
	status: 'Scheduled' | 'Live' | 'Completed';
	stats: GameStats;
}

function createGamesStore() {
	const { subscribe, set, update } = writable<Game[]>([]);

	return {
		subscribe,
		addGame: (game: Omit<Game, 'id'>) => {
			const newGame: Game = {
				...game,
				id: crypto.randomUUID()
			};
			update((games) => [...games, newGame]);
		},
		removeGame: (id: string) => {
			update((games) => games.filter((game) => game.id !== id));
		},
		updateGame: (id: string, updatedGame: Partial<Game>) => {
			update((games) => games.map((game) => (game.id === id ? { ...game, ...updatedGame } : game)));
		},
		reset: () => set([])
	};
}

export const gamesStore = createGamesStore();
