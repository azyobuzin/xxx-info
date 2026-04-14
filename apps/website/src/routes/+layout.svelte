<script lang="ts">
import "../app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
import Header from "$lib/ui/Header.svelte";

let { children } = $props();

const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <Header />
  <main>{@render children()}</main>
</QueryClientProvider>

<style>
main {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: var(--space-md);
}
</style>
