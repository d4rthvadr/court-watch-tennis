<script>
	import { onMount } from 'svelte';
	import { Navbar, RankTable } from "$lib/components";

    /**
	 * @type {any}
	 */
    let data;

	onMount(() => {
		const eventSource = new EventSource("http://localhost:4001/sse");
		
		eventSource.onmessage = (event) => {
			console.log("New event:", event.data);
            data = event.data;
		};

		eventSource.onerror = (error) => {
			console.error("EventSource failed:", error);
		};

		// Cleanup function to close EventSource when component unmounts
		return () => {
			eventSource.close();
		};
	});
</script>
<Navbar></Navbar>


<RankTable></RankTable>
