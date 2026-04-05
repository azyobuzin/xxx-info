<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
  children: Snippet;
}

let { children }: Props = $props();
</script>

<div class="metric-grid">{@render children()}</div>

<style>
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

@media (max-width: 540px) {
  .metric-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
