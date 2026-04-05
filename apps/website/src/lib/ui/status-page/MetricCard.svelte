<script lang="ts">
interface Props {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down";
}

let { title, value, subtitle, trend }: Props = $props();
</script>

<div class="metric-card">
  <h3>{title}</h3>
  <p class="metric-val">{value}</p>
  {#if subtitle}
    <p
      class="metric-sub"
      class:trend-up={trend === "up"}
      class:trend-down={trend === "down"}
    >
      {subtitle}
    </p>
  {/if}
</div>

<style>
.metric-card {
  background: var(--bg-muted);
  border-radius: var(--radius);
  padding: var(--space-md);
}

.metric-card h3 {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-muted);
  margin: 0 0 4px;
}

.metric-val {
  font-size: var(--text-lg);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.metric-sub {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: 2px;
}

.trend-up {
  color: var(--green);
}
</style>
