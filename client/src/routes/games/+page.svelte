<script lang="ts">
	import { gamesStore, type Game } from "$lib/stores/games";
	import GameTable from "$lib/components/shared/game-table.svelte";
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from "$lib/components/ui/dialog";

	let games = $state<Game[]>([]);
	let dialogOpen = $state(false);

	// Form fields
	let courtNumber = $state('');
	let player1 = $state('');
	let player2 = $state('');
	let gameDate = $state('');
	let status = $state<Game['status']>('Scheduled');
	let aces = $state(0);
	let winners = $state(0);
	let doubleFaults = $state(0);
	let unforcedErrors = $state(0);

	// Mock data for dropdowns
	const courts = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5'];
	const players = [
		'Roger Federer',
		'Rafael Nadal',
		'Novak Djokovic',
		'Andy Murray',
		'Stan Wawrinka',
		'Dominic Thiem',
		'Alexander Zverev',
		'Stefanos Tsitsipas'
	];
	const statuses: Game['status'][] = ['Scheduled', 'Live', 'Completed'];

	// Subscribe to store
	gamesStore.subscribe((value) => {
		games = value;
	});

	function resetForm() {
		courtNumber = '';
		player1 = '';
		player2 = '';
		gameDate = '';
		status = 'Scheduled';
		aces = 0;
		winners = 0;
		doubleFaults = 0;
		unforcedErrors = 0;
	}

	function handleSubmit() {
		if (!courtNumber || !player1 || !player2 || !gameDate) {
			alert('Please fill in all required fields');
			return;
		}

		gamesStore.addGame({
			courtNumber,
			player1,
			player2,
			gameDate,
			status,
			stats: {
				aces,
				winners,
				doubleFaults,
				unforcedErrors
			}
		});

		resetForm();
		dialogOpen = false;
	}
</script>

<div class="container mx-auto py-8 px-4">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Games</h1>
			<p class="text-slate-500 mt-1">Manage and track ongoing tennis matches</p>
		</div>

		<Dialog bind:open={dialogOpen}>
			<DialogTrigger
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2"
			>
				Create Game
			</DialogTrigger>

			<DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Game</DialogTitle>
					<DialogDescription>
						Add a new tennis match with player details and initial stats
					</DialogDescription>
				</DialogHeader>

				<form class="grid gap-4 py-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
					<div class="grid grid-cols-2 gap-4">
						<!-- Court Number -->
						<div class="space-y-2">
							<label for="court" class="text-sm font-medium leading-none">
								Court Number <span class="text-red-500">*</span>
							</label>
							<select
								id="court"
								bind:value={courtNumber}
								class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
								required
							>
								<option value="">Select court</option>
								{#each courts as court}
									<option value={court}>{court}</option>
								{/each}
							</select>
						</div>

						<!-- Status -->
						<div class="space-y-2">
							<label for="status" class="text-sm font-medium leading-none">
								Status <span class="text-red-500">*</span>
							</label>
							<select
								id="status"
								bind:value={status}
								class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
								required
							>
								{#each statuses as statusOption}
									<option value={statusOption}>{statusOption}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<!-- Player 1 -->
						<div class="space-y-2">
							<label for="player1" class="text-sm font-medium leading-none">
								Player 1 <span class="text-red-500">*</span>
							</label>
							<select
								id="player1"
								bind:value={player1}
								class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
								required
							>
								<option value="">Select player</option>
								{#each players as player}
									<option value={player}>{player}</option>
								{/each}
							</select>
						</div>

						<!-- Player 2 -->
						<div class="space-y-2">
							<label for="player2" class="text-sm font-medium leading-none">
								Player 2 <span class="text-red-500">*</span>
							</label>
							<select
								id="player2"
								bind:value={player2}
								class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
								required
							>
								<option value="">Select player</option>
								{#each players as player}
									<option value={player}>{player}</option>
								{/each}
							</select>
						</div>
					</div>

					<!-- Game Date -->
					<div class="space-y-2">
						<label for="gameDate" class="text-sm font-medium leading-none">
							Game Date <span class="text-red-500">*</span>
						</label>
						<input
							id="gameDate"
							type="date"
							bind:value={gameDate}
							class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
							required
						/>
					</div>

					<!-- Stats Section -->
					<div class="border-t pt-4 mt-2">
						<h3 class="text-sm font-medium mb-3">Game Statistics</h3>
						<div class="grid grid-cols-2 gap-4">
							<!-- Aces -->
							<div class="space-y-2">
								<label for="aces" class="text-sm font-medium leading-none">Aces</label>
								<input
									id="aces"
									type="number"
									min="0"
									bind:value={aces}
									class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
								/>
							</div>

							<!-- Winners -->
							<div class="space-y-2">
								<label for="winners" class="text-sm font-medium leading-none">Winners</label>
								<input
									id="winners"
									type="number"
									min="0"
									bind:value={winners}
									class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
								/>
							</div>

							<!-- Double Faults -->
							<div class="space-y-2">
								<label for="doubleFaults" class="text-sm font-medium leading-none">
									Double Faults
								</label>
								<input
									id="doubleFaults"
									type="number"
									min="0"
									bind:value={doubleFaults}
									class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
								/>
							</div>

							<!-- Unforced Errors -->
							<div class="space-y-2">
								<label for="unforcedErrors" class="text-sm font-medium leading-none">
									Unforced Errors
								</label>
								<input
									id="unforcedErrors"
									type="number"
									min="0"
									bind:value={unforcedErrors}
									class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
								/>
							</div>
						</div>
					</div>

					<DialogFooter class="mt-4">
						<button
							type="button"
							onclick={() => { dialogOpen = false; }}
							class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-300 bg-white hover:bg-slate-100 h-10 px-4 py-2"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2"
						>
							Create Game
						</button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	</div>

	<GameTable {games} />
</div>
