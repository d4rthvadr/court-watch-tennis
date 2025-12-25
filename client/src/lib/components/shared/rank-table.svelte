<script lang="ts">
 import * as Table from "$lib/components/ui/table/index.js";
 
interface Player {
  name: string;
  status: string;
  rank: string;
}
interface PlayerWithGameStatus extends Player {
  gameStatus: string;
    court: string;
}

 let playerGameStatusStore = $state<PlayerWithGameStatus[]>([]);

$effect(() => {
 const eventSource = new EventSource("http://localhost:4001/sse");

 eventSource.onmessage = (event) => {
  console.log("New event received:", event.data);
  const updatedPlayers = JSON.parse(event.data);
  playerGameStatusStore = updatedPlayers;

 };

 eventSource.onerror = (error) => {
  console.error("EventSource failed:", error);
 };

 return () => {
  eventSource.close();
 };
});
 
</script>
 

{#if playerGameStatusStore.length === 0 }
 <p>Loading player data...</p>
{:else}

<Table.Root>
 <Table.Caption>A list of your recent players.</Table.Caption>
 <Table.Header>
  <Table.Row>
   <Table.Head>Name</Table.Head>
   <Table.Head>Status</Table.Head>
   <Table.Head>Player Status</Table.Head>
   <Table.Head>Court</Table.Head>
   <Table.Head class="text-end">Rank</Table.Head>
  </Table.Row>
 </Table.Header>
 <Table.Body>
  {#each playerGameStatusStore as player, i (player.rank + i)}
   <Table.Row>
    <Table.Cell class="font-medium">{player.name}</Table.Cell>
    <Table.Cell>{player.status}</Table.Cell>
    <Table.Cell>{player.gameStatus}</Table.Cell>
    <Table.Cell>{player.court}</Table.Cell>
    <Table.Cell class="text-end">{player.rank}</Table.Cell>
   </Table.Row>
  {/each}
 </Table.Body>

</Table.Root>

{/if}