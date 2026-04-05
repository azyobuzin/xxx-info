<script lang="ts">
import { Chart } from "chart.js/auto";
import { getChartColors } from "./colors.svelte.ts";

interface Props {
  title: string;
  latestValue: string;
  latestLabel: string;
  labels: string[];
  requestData: number[];
  errorData: number[];
  requestSeriesLabel?: string;
  errorSeriesLabel?: string;
}

let {
  title,
  latestValue,
  latestLabel,
  labels,
  requestData,
  errorData,
  requestSeriesLabel = "リクエスト数",
  errorSeriesLabel = "5xx エラー数",
}: Props = $props();

// biome-ignore lint/correctness/noUnusedVariables: used in {@attach}
function attach(canvas: HTMLCanvasElement) {
  const c = getChartColors();
  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: $state.snapshot(labels),
      datasets: [
        {
          label: requestSeriesLabel,
          data: $state.snapshot(requestData),
          borderColor: c.green,
          backgroundColor: c.greenFill,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHitRadius: 8,
          borderWidth: 1.5,
        },
        {
          label: errorSeriesLabel,
          data: $state.snapshot(errorData),
          borderColor: c.red,
          backgroundColor: c.redFill,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHitRadius: 8,
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: c.tick, font: { size: 11 }, maxTicksLimit: 6 },
        },
        y: {
          grid: { color: c.grid },
          ticks: {
            color: c.tick,
            font: { size: 11 },
            callback: (v) => Number(v).toLocaleString(),
          },
          min: 0,
        },
      },
    },
  });

  // カラースキームが変わったときにチャートの色も更新する
  $effect(() => {
    const c = getChartColors();
    // TODO: データ構造に依存しすぎてるからリファクタ
    const [reqDs, errDs] = chart.data.datasets;
    reqDs.borderColor = c.green;
    reqDs.backgroundColor = c.greenFill;
    errDs.borderColor = c.red;
    errDs.backgroundColor = c.redFill;
    chart.options.scales!.x!.ticks!.color = c.tick;
    chart.options.scales!.y!.grid!.color = c.grid;
    chart.options.scales!.y!.ticks!.color = c.tick;
    chart.update("none");
  });

  return () => chart.destroy();
}
</script>

<div class="chart-section">
  <div class="chart-header">
    <h3>{title}</h3>
    <p class="chart-latest">
      {latestValue} <span class="chart-latest-sub">{latestLabel}</span>
    </p>
  </div>
  <div class="chart-wrap"><canvas {@attach attach}></canvas></div>
</div>

<style>
.chart-section {
  margin-bottom: var(--space-lg);
}

.chart-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.chart-header h3 {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-muted);
  margin: 0;
}

.chart-latest {
  font-size: var(--text-base);
  font-weight: 500;
}

.chart-latest-sub {
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 4px;
}

.chart-wrap {
  position: relative;
  height: 160px;
}
</style>
