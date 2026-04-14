<script lang="ts">
import { Chart } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { getChartColors } from "./colors.svelte.ts";

interface Props {
  title: string;
  latestValue: string;
  data: { x: number; y: number }[];
  colorKey: "orange" | "purple" | "blue" | "green";
  unit: string;
  yMax?: number;
  /** tooltip・Y軸ラベルに表示する小数点以下の桁数 */
  decimals: number;
}

let { title, latestValue, data, colorKey, unit, yMax, decimals }: Props =
  $props();

const fillKeyMap = {
  orange: "orangeFill",
  purple: "purpleFill",
  blue: "blueFill",
  green: "greenFill",
} as const;

// biome-ignore lint/correctness/noUnusedVariables: used in {@attach}
function attach(canvas: HTMLCanvasElement) {
  const c = getChartColors();
  const chart = new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          data: $state.snapshot(data),
          borderColor: c[colorKey],
          backgroundColor: c[fillKeyMap[colorKey]],
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
          callbacks: {
            label: (ctx) => `${(ctx.parsed.y ?? 0).toFixed(decimals)} ${unit}`,
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            tooltipFormat: "H:mm",
            displayFormats: { hour: "H:mm" },
          },
          grid: { display: false },
          ticks: { color: c.tick, font: { size: 11 }, maxTicksLimit: 6 },
        },
        y: {
          grid: { color: c.grid },
          ticks: {
            color: c.tick,
            font: { size: 11 },
          },
          min: 0,
          max: yMax,
        },
      },
    },
  });

  // カラースキームが変わったときにチャートの色も更新する
  $effect(() => {
    const c = getChartColors();
    // TODO: データ構造に依存しすぎてるからリファクタ
    const ds = chart.data.datasets[0];
    ds.borderColor = c[colorKey];
    ds.backgroundColor = c[fillKeyMap[colorKey]];
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
    <p class="chart-latest">{latestValue}</p>
  </div>
  <div class="chart-wrap"><canvas {@attach attach}></canvas></div>
</div>

<style>
.chart-section {
  margin-bottom: var(--space-lg);
  min-width: 0;
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
  color: var(--text-muted);
}

.chart-wrap {
  position: relative;
  height: 160px;
  overflow: hidden;
}
</style>
