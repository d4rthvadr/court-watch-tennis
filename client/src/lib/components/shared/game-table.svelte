<script lang="ts">
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
	import type { Game } from "$lib/stores/games";

	let { games = [] }: { games: Game[] } = $props();

	function getStatusColor(status: Game['status']): string {
		const colors = {
			Scheduled: 'text-blue-600 bg-blue-50',
			Live: 'text-green-600 bg-green-50',
			Completed: 'text-gray-600 bg-gray-50'
		};
		return colors[status];
	}
</script>

<div class="rounded-md border">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead class="w-[100px]">Court</TableHead>
				<TableHead>Player 1</TableHead>
				<TableHead>Player 2</TableHead>
				<TableHead>Date</TableHead>
				<TableHead class="w-[120px]">Status</TableHead>
				<TableHead class="text-center">Aces</TableHead>
				<TableHead class="text-center">Winners</TableHead>
				<TableHead class="text-center">Double Faults</TableHead>
				<TableHead class="text-center">Unforced Errors</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#if games.length === 0}
				<TableRow>
					<TableCell colspan={9} class="h-24 text-center text-slate-500">
						No games created yet. Click "Create Game" to add one.
					</TableCell>
				</TableRow>
			{:else}
				{#each games as game (game.id)}
					<TableRow>
						<TableCell class="font-medium">{game.courtNumber}</TableCell>
						<TableCell>{game.player1}</TableCell>
						<TableCell>{game.player2}</TableCell>
						<TableCell>{new Date(game.gameDate).toLocaleDateString()}</TableCell>
						<TableCell>
							<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(game.status)}">
								{game.status}
							</span>
						</TableCell>
						<TableCell class="text-center">{game.stats.aces}</TableCell>
						<TableCell class="text-center">{game.stats.winners}</TableCell>
						<TableCell class="text-center">{game.stats.doubleFaults}</TableCell>
						<TableCell class="text-center">{game.stats.unforcedErrors}</TableCell>
					</TableRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
