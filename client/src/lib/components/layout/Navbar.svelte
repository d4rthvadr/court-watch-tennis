<script lang="ts">
	let isMenuOpen = $state(false);

	const menuLinks: { title: string; href: string }[] = [
		{
			title: "Home",
			href: "/"
		},
		{
			title: "Players",
			href: "/players"
		},
		{
			title: "Courts",
			href: "/courts"
		},
		{
			title: "Matches",
			href: "/matches"
		},
		{
			title: "Scores",
			href: "/scores"
		}
	];

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<nav class="bg-slate-900 border-b border-slate-800">
	<div class="max-w-7xl mx-auto px-4">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<a
				href="/"
				class="flex items-center gap-2 text-white text-xl font-bold hover:text-emerald-400 transition-colors"
			>
				<span class="text-2xl">🎾</span>
				Court Watch
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center gap-1">
				{#each menuLinks as link (link.href)}
					<a
						href={link.href}
						class="px-4 py-2 text-white hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
					>
						{link.title}
					</a>
				{/each}
			</div>

			<!-- Mobile menu button -->
			<button
				class="md:hidden text-white p-2 hover:bg-slate-800 rounded-md"
				onclick={toggleMenu}
				aria-label="Toggle menu"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		</div>

		<!-- Mobile Navigation -->
		{#if isMenuOpen}
			<div class="md:hidden pb-4 space-y-1">
				{#each menuLinks as link (link.href)}
					<a
						href={link.href}
						class="block px-4 py-2 text-white hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
					>
						{link.title}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</nav>