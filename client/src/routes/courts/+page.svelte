<script lang="ts">
	import * as Card from "$lib/components/ui/card";

	const courts = [
		{
			id: 1,
			name: "Court 1",
			status: "Available",
			surface: "Hard Court"
		},
		{
			id: 2,
			name: "Court 2",
			status: "In Use",
			surface: "Clay Court"
		},
		{
			id: 3,
			name: "Court 3",
			status: "Available",
			surface: "Grass Court"
		},
		{
			id: 4,
			name: "Court 4",
			status: "Maintenance",
			surface: "Hard Court"
		}
	];
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Tennis Courts</h1>
		<p class="text-muted-foreground mt-2">View all available courts and their current status</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each courts as court (court.id)}
			<Card.Root>
				<Card.Header>
					<Card.Title>{court.name}</Card.Title>
					<Card.Description>{court.surface}</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center gap-2">
						<span
							class="h-2 w-2 rounded-full {court.status === 'Available'
								? 'bg-green-500'
								: court.status === 'In Use'
									? 'bg-yellow-500'
									: 'bg-red-500'}"
						></span>
						<span class="text-sm font-medium">{court.status}</span>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
