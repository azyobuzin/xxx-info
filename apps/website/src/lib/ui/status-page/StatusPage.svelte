<script lang="ts">
import MetricCard from "./MetricCard.svelte";
import MetricGrid from "./MetricGrid.svelte";
import RequestErrorChart from "./RequestErrorChart.svelte";
import TimeSeriesChart from "./TimeSeriesChart.svelte";
import UptimeBar from "./UptimeBar.svelte";

interface Props {
  uptime: {
    percent: string;
    days: { status: "ok" | "partial" | "down"; tooltip?: string }[];
  };
  metrics: {
    title: string;
    value: string;
    subtitle?: string;
    trend?: "up" | "down";
  }[];
  charts: {
    requestError: {
      labels: string[];
      latestReqPerHour: number;
      requestData: number[];
      errorData: number[];
    };
    responseTime: {
      labels: string[];
      latestMs: number;
      data: number[];
    };
    cpu: {
      labels: string[];
      latestPercent: number;
      data: number[];
    };
    memory: {
      labels: string[];
      latestPercent: number;
      data: number[];
    };
  };
}

let { uptime, metrics, charts }: Props = $props();
</script>

<section>
  <h2>サービス稼働状況</h2>
  <UptimeBar uptimePercent={uptime.percent} days={uptime.days} />
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
      labels={charts.requestError.labels}
      latestReqPerHour={charts.requestError.latestReqPerHour}
      requestData={charts.requestError.requestData}
      errorData={charts.requestError.errorData}
    />
    <TimeSeriesChart
      title="レスポンスタイム"
      latestValue="{charts.responseTime.latestMs} ms"
      latestLabel="直近5分平均"
      labels={charts.responseTime.labels}
      data={charts.responseTime.data}
      colorKey="orange"
      unit="ms"
    />
  </div>

  <div class="charts-dual">
    <TimeSeriesChart
      title="CPU 使用率"
      latestValue="{charts.cpu.latestPercent}%"
      latestLabel="直近5分平均"
      labels={charts.cpu.labels}
      data={charts.cpu.data}
      colorKey="purple"
      unit="%"
      yMax={100}
    />
    <TimeSeriesChart
      title="メモリ使用率"
      latestValue="{charts.memory.latestPercent}%"
      latestLabel="直近5分平均"
      labels={charts.memory.labels}
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
