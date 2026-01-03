<script lang="ts">
	import { GameAdd, GameList } from "$lib/components/game/features";
</script>

<div class="container mx-auto py-8 px-4">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Games</h1>
			<p class="text-slate-500 mt-1">Manage and track ongoing tennis matches</p>
		</div>

		<GameAdd />
	</div>

	<GameList />
</div>
