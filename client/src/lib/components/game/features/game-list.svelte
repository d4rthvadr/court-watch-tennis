<script lang="ts">
	import { gamesStore, type Game } from "$lib/stores/games";
	import GameTable from "$lib/components/shared/game-table.svelte";

	let games = $state<Game[]>([]);

	// Subscribe to store
	gamesStore.subscribe((value) => {
		games = value;
	});
</script>

<GameTable {games} />
