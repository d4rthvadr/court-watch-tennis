<script lang="ts">
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<nav class="bg-slate-900 py-4 shadow-md">
  <div class="max-w-7xl mx-auto px-4 flex justify-between items-center">
    <a href="/" class="flex items-center gap-2 text-white no-underline text-2xl font-bold hover:text-emerald-400 transition-colors">
      Court Watch
    </a>

    <button 
      class="md:hidden bg-transparent border-none cursor-pointer p-2" 
      on:click={toggleMenu} 
      aria-label="Toggle menu"
    >
      <div class="w-6 h-0.5 bg-white mb-1.5 transition-all"></div>
      <div class="w-6 h-0.5 bg-white mb-1.5 transition-all"></div>
      <div class="w-6 h-0.5 bg-white transition-all"></div>
    </button>

    <ul class="hidden md:flex gap-8 list-none m-0 p-0">
      <li><a href="/" class="text-white no-underline text-base hover:text-emerald-400 transition-colors">Home</a></li>
      <li><a href="/about" class="text-white no-underline text-base hover:text-emerald-400 transition-colors">About</a></li>
    </ul>

    <!-- Mobile menu -->
    {#if isMenuOpen}
      <ul class="absolute top-full left-0 right-0 bg-slate-900 flex flex-col gap-0 p-4 md:hidden">
        <li class="py-3 border-b border-white/10"><a href="/" class="text-white no-underline text-base hover:text-emerald-400 transition-colors">Home</a></li>
        <li class="py-3 border-b border-white/10"><a href="/matches" class="text-white no-underline text-base hover:text-emerald-400 transition-colors">Matches</a></li>
        <li class="py-3 border-b border-white/10"><a href="/scores" class="text-white no-underline text-base hover:text-emerald-400 transition-colors">Live Scores</a></li>
        <li class="py-3"><a href="/about" class="text-white no-underline text-base hover:text-emerald-400 transition-colors">About</a></li>
      </ul>
    {/if}
  </div>
</nav>
