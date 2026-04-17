<script lang="ts">
import type {
  InstanceStatusResponse,
  MetricWithDiff,
  TimeSeriesData,
} from "@xxx-info/api/client";
import MetricCard from "./MetricCard.svelte";
import MetricGrid from "./MetricGrid.svelte";
import TimeSeriesChart from "./TimeSeriesChart.svelte";
import UptimeBar from "./UptimeBar.svelte";

interface Props {
  data: InstanceStatusResponse;
}

let { data }: Props = $props();

function formatMetric(
  title: string,
  m: MetricWithDiff,
): { title: string; value: string; subtitle?: string; trend?: "up" | "down" } {
  const value = m.value.toLocaleString();
  if (m.diff == null) return { title, value };
  const sign = m.diff > 0 ? "+" : "";
  return {
    title,
    value,
    subtitle: `${sign}${m.diff.toLocaleString()} (7d)`,
    trend: m.diff > 0 ? "up" : m.diff < 0 ? "down" : undefined,
  };
}

function toXY(ts: TimeSeriesData): { x: number; y: number }[] {
  return ts.points.map((p) => ({ x: p.timestamp, y: p.value }));
}

// biome-ignore lint/correctness/noUnusedVariables: used in template
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

const metrics = $derived([
  formatMetric("ローカル投稿数", data.usageSection.localStatusCount),
  formatMetric("ローカルユーザー数", data.usageSection.localUserCount),
  formatMetric("ドメイン数", data.usageSection.domainCount),
]);
</script>

<section>
  <h2>サービス稼働状況</h2>
  <UptimeBar
    isUp={data.uptimeSection.isUp}
    dailyUptime={data.uptimeSection.dailyUptime}
  />
</section>

<hr>

<section>
  <h2>利用状況</h2>
  <MetricGrid>
    {#each metrics as metric (metric.title)}
      <MetricCard
        title={metric.title}
        value={metric.value}
        subtitle={metric.subtitle}
        trend={metric.trend}
      />
    {/each}
  </MetricGrid>
</section>

<hr>

<section>
  <h2>パフォーマンス</h2>

  <TimeSeriesChart
    title="リクエスト数"
    latestValue="{formatCount(data.performanceSection.requestCount.latestValue)} req/h"
    data={toXY(data.performanceSection.requestCount)}
    colorKey="green"
    unit="req/h"
    decimals={0}
  />

  <div class="charts-dual">
    <TimeSeriesChart
      title="CPU 使用率"
      latestValue="{Math.round(data.performanceSection.cpuUsage.latestValue * 100)}%"
      data={toXY({
        ...data.performanceSection.cpuUsage,
        points: data.performanceSection.cpuUsage.points.map((p) => ({
          ...p,
          value: p.value * 100,
        })),
      })}
      colorKey="purple"
      unit="%"
      yMax={100}
      decimals={1}
    />
    <TimeSeriesChart
      title="メモリ使用率"
      latestValue="{Math.round(data.performanceSection.memoryUsage.latestValue * 100)}%"
      data={toXY({
        ...data.performanceSection.memoryUsage,
        points: data.performanceSection.memoryUsage.points.map((p) => ({
          ...p,
          value: p.value * 100,
        })),
      })}
      colorKey="blue"
      unit="%"
      yMax={100}
      decimals={1}
    />
  </div>
</section>

<style>
.charts-dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 540px) {
  .charts-dual {
    grid-template-columns: 1fr;
  }
}
</style>
