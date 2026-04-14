<script lang="ts">
import type { DailyUptime } from "@xxx-info/api/client";

interface Props {
  isUp: boolean;
  dailyUptime: DailyUptime[];
}

let { isUp, dailyUptime }: Props = $props();

function rateToStatus(rate: number): "ok" | "partial" | "down" {
  if (rate >= 0.999) return "ok";
  if (rate >= 0.8) return "partial";
  return "down";
}

const uptimePercent = $derived.by(() => {
  if (dailyUptime.length === 0) return "—";
  const avg =
    dailyUptime.reduce((sum, d) => sum + d.uptimeRate, 0) / dailyUptime.length;
  return `${(avg * 100).toFixed(2)}%`;
});

const days = $derived(
  dailyUptime.map((d) => ({
    status: rateToStatus(d.uptimeRate),
    tooltip: `${d.date}: ${(d.uptimeRate * 100).toFixed(1)}%`,
  })),
);
</script>

<div class="big-uptime">
  <span class="big-uptime-num">
    <span
      class="status-dot"
      class:up={isUp}
      class:down={!isUp}
      title={isUp ? "稼働中" : "停止中"}
    ></span>
    {uptimePercent}
  </span>
  <span class="big-uptime-sub">過去{days.length}日間の総合稼働率</span>
</div>
<div class="uptime-bar">
  {#each days as day, i (i)}
    <div class="uptime-day {day.status}" title={day.tooltip}></div>
  {/each}
</div>
<div class="bar-labels">
  <span>{days.length}日前</span>
  <span>{Math.floor(days.length / 2)}日前</span>
  <span>今日</span>
</div>

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
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.status-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  cursor: default;
}

.status-dot.up {
  background: var(--green);
}

.status-dot.down {
  background: var(--red, #e24b4a);
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
