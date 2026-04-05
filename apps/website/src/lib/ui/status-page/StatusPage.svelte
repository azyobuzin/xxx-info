<script lang="ts">
import MetricCard from "./MetricCard.svelte";
import MetricGrid from "./MetricGrid.svelte";
import RequestErrorChart from "./RequestErrorChart.svelte";
import TimeSeriesChart from "./TimeSeriesChart.svelte";
import UptimeBar from "./UptimeBar.svelte";

interface Props {
  uptime: {
    percent: string;
    label: string;
    days: { status: "ok" | "partial" | "down"; tooltip?: string }[];
  };
  metrics: {
    title: string;
    value: string;
    subtitle?: string;
    trend?: "up" | "down";
  }[];
  charts: {
    labels: string[];
    requestError: {
      title: string;
      latestValue: string;
      latestLabel: string;
      requestData: number[];
      errorData: number[];
    };
    responseTime: {
      title: string;
      latestValue: string;
      latestLabel: string;
      data: number[];
    };
    cpu: {
      title: string;
      latestValue: string;
      latestLabel: string;
      data: number[];
    };
    memory: {
      title: string;
      latestValue: string;
      latestLabel: string;
      data: number[];
    };
  };
}

let { uptime, metrics, charts }: Props = $props();
</script>

<section>
  <h2>サービス稼働状況</h2>
  <UptimeBar
    uptimePercent={uptime.percent}
    uptimeLabel={uptime.label}
    days={uptime.days}
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

  <div class="charts-dual">
    <RequestErrorChart
      title={charts.requestError.title}
      latestValue={charts.requestError.latestValue}
      latestLabel={charts.requestError.latestLabel}
      labels={charts.labels}
      requestData={charts.requestError.requestData}
      errorData={charts.requestError.errorData}
    />
    <TimeSeriesChart
      title={charts.responseTime.title}
      latestValue={charts.responseTime.latestValue}
      latestLabel={charts.responseTime.latestLabel}
      labels={charts.labels}
      data={charts.responseTime.data}
      colorKey="orange"
      unit="ms"
    />
  </div>

  <div class="charts-dual">
    <TimeSeriesChart
      title={charts.cpu.title}
      latestValue={charts.cpu.latestValue}
      latestLabel={charts.cpu.latestLabel}
      labels={charts.labels}
      data={charts.cpu.data}
      colorKey="purple"
      unit="%"
      yMax={100}
    />
    <TimeSeriesChart
      title={charts.memory.title}
      latestValue={charts.memory.latestValue}
      latestLabel={charts.memory.latestLabel}
      labels={charts.labels}
      data={charts.memory.data}
      colorKey="blue"
      unit="%"
      yMax={100}
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
