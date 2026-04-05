<script lang="ts">
import "../app.css";
import Header from "$lib/ui/Header.svelte";

let { children } = $props();
</script>

<Header />

<main>{@render children()}</main>

<style>
main {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: var(--space-md);
}
</style>
