<script lang="ts">
 import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
 import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
 import { IsMobile } from "$lib/components/hooks/is-mobile.svelte.js";
 
 const isMobile = new IsMobile();
 
 const menuLinks: { title: string; href: string; }[] = [
  {
   title: "Home",
   href: "/",
  },
  {
   title: "Players",
   href: "/players",
  },
  {
   title: "Matches",
   href: "/matches",
  },
  {
   title: "Match Scores",
   href: "/scores",
  },
 
 ];
 

</script>
 
 
<NavigationMenu.Root viewport={isMobile.current}>
 <NavigationMenu.List class="flex-wrap">

  {#each menuLinks as menuLink, i (i) }
    <NavigationMenu.Item>
        <NavigationMenu.Link>
            {#snippet child()}
            <a href={menuLink.href}  class={navigationMenuTriggerStyle()} >{menuLink.title}</a>
            {/snippet}
        </NavigationMenu.Link>
    </NavigationMenu.Item>

  {/each}

 </NavigationMenu.List>
</NavigationMenu.Root>