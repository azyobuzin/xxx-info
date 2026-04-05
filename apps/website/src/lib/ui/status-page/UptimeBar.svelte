<script lang="ts">
interface Props {
  uptimePercent: string;
  days: { status: "ok" | "partial" | "down"; tooltip?: string }[];
}

let { uptimePercent, days }: Props = $props();
</script>

<p class="big-uptime">
  <span class="big-uptime-num">{uptimePercent}</span>
  <span class="big-uptime-sub">過去{days.length}日間の総合稼働率</span>
</p>
<div class="uptime-bar">
  {#each days as day, i (i)}
    <div class="uptime-day {day.status}" title={day.tooltip}></div>
  {/each}
</div>
<p class="bar-labels">
  <span>{days.length}日前</span>
  <span>{Math.floor(days.length / 2)}日前</span>
  <span>今日</span>
</p>

<style>
.big-uptime {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.big-uptime-num {
  font-size: var(--text-xl);
  font-weight: 500;
  letter-spacing: -0.02em;
}

.big-uptime-sub {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.uptime-bar {
  display: flex;
  gap: 2px;
}

.uptime-day {
  flex: 1;
  height: 28px;
  border-radius: 2px;
  cursor: default;
}

.uptime-day.ok {
  background: var(--green);
  opacity: 0.6;
}

.uptime-day.ok:hover {
  opacity: 1;
}

.uptime-day.partial {
  background: var(--amber);
  opacity: 0.75;
}

.uptime-day.partial:hover {
  opacity: 1;
}

.uptime-day.down {
  background: var(--red, #e24b4a);
  opacity: 0.75;
}

.uptime-day.down:hover {
  opacity: 1;
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
