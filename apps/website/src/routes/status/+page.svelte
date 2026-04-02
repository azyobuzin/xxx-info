<script lang="ts">
import { Chart } from "chart.js/auto";

// ── Dummy data generators ──

function generateTimeSeries(
  base: number,
  amplitude: number,
  noise: number,
  clamp?: number,
): number[] {
  return Array.from({ length: 24 }, (_, h) => {
    let v = base + Math.sin(h / 3) * amplitude + (Math.random() - 0.3) * noise;
    if (clamp !== undefined) v = Math.min(Math.max(v, 0), clamp);
    return Math.round(v);
  });
}

const hours = Array.from({ length: 24 }, (_, h) => `${h}:00`);

// 30-day uptime: mostly ok, a couple partial
const uptimeDays = Array.from({ length: 30 }, (_, i) => {
  if (i === 12 || i === 25) return "partial";
  return "ok";
});

// ── Chart color palette ──

function getChartColors(dark: boolean) {
  return {
    green: dark ? "#5DCAA5" : "#1D9E75",
    greenFill: dark ? "rgba(93,202,165,0.08)" : "rgba(29,158,117,0.08)",
    red: dark ? "#F09595" : "#E24B4A",
    redFill: dark ? "rgba(240,149,149,0.25)" : "rgba(226,75,74,0.25)",
    orange: dark ? "#E8A86D" : "#C87A2E",
    orangeFill: dark ? "rgba(232,168,109,0.1)" : "rgba(200,122,46,0.08)",
    purple: dark ? "#AFA9EC" : "#534AB7",
    purpleFill: dark ? "rgba(175,169,236,0.1)" : "rgba(83,74,183,0.08)",
    blue: dark ? "#85B7EB" : "#378ADD",
    blueFill: dark ? "rgba(133,183,235,0.1)" : "rgba(55,138,221,0.08)",
    grid: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    tick: dark ? "#888" : "#999",
  };
}

// ── Reactive dark mode ──

const darkQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : undefined;

let isDark = $state(darkQuery?.matches ?? false);

$effect(() => {
  if (!darkQuery) return;
  const onChange = (e: MediaQueryListEvent) => {
    isDark = e.matches;
  };
  darkQuery.addEventListener("change", onChange);
  return () => darkQuery.removeEventListener("change", onChange);
});

// ── Chart rendering ──

function createChart(
  canvas: HTMLCanvasElement,
  data: number[],
  color: string,
  fillColor: string,
  unit: string,
  yMax?: number,
) {
  const c = getChartColors(isDark);
  return new Chart(canvas, {
    type: "line",
    data: {
      labels: hours,
      datasets: [
        {
          data,
          borderColor: color,
          backgroundColor: fillColor,
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
            label: (ctx) => ctx.parsed.y + unit,
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
            callback: (v) => v + unit,
          },
          min: 0,
          max: yMax,
        },
      },
    },
  });
}

// biome-ignore lint/correctness/noUnusedVariables: used in {@attach}
function chartAttachment(params: {
  data: number[];
  color: (c: ReturnType<typeof getChartColors>) => string;
  fill: (c: ReturnType<typeof getChartColors>) => string;
  unit: string;
  yMax?: number;
}) {
  return (canvas: HTMLCanvasElement) => {
    const c = getChartColors(isDark);
    const chart = createChart(
      canvas,
      params.data,
      params.color(c),
      params.fill(c),
      params.unit,
      params.yMax,
    );
    return () => chart.destroy();
  };
}

const respData = generateTimeSeries(110, 40, 30);
const cpuData = generateTimeSeries(20, 12, 8, 100);
const memData = generateTimeSeries(55, 8, 5, 100);

const reqData = generateTimeSeries(3200, 500, 300);
// 5xx: normally ~0.02% of requests, with occasional spikes
const errData = reqData.map((r) => {
  const spike = Math.random() < 0.08 ? Math.random() * 0.05 : 0;
  return Math.round(r * (0.0002 + spike));
});

// biome-ignore lint/correctness/noUnusedVariables: used in {@attach}
function reqErrorChartAttachment() {
  return (canvas: HTMLCanvasElement) => {
    const c = getChartColors(isDark);
    const chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: hours,
        datasets: [
          {
            label: "リクエスト数",
            data: reqData,
            borderColor: c.green,
            backgroundColor: c.greenFill,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHitRadius: 8,
            borderWidth: 1.5,
          },
          {
            label: "5xx エラー数",
            data: errData,
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
    return () => chart.destroy();
  };
}
</script>

<section>
  <h2>サービス稼働状況</h2>
  <p class="big-uptime">
    <span class="big-uptime-num">99.98%</span>
    <span class="big-uptime-sub">過去30日間の総合稼働率</span>
  </p>
  <div class="uptime-bar">
    {#each uptimeDays as day, i (i)}
      <div class="uptime-day {day}" title="{30 - i}日前"></div>
    {/each}
  </div>
  <p class="bar-labels">
    <span>30日前</span>
    <span>15日前</span>
    <span>今日</span>
  </p>
</section>

<hr>

<section>
  <h2>利用状況</h2>
  <div class="metric-grid">
    <div class="metric-card">
      <h3>ローカル投稿数</h3>
      <p class="metric-val">12,847</p>
      <p class="metric-sub trend-up">+38 (24h)</p>
    </div>
    <div class="metric-card">
      <h3>ユーザー数</h3>
      <p class="metric-val">23</p>
      <p class="metric-sub">±0 (7d)</p>
    </div>
    <div class="metric-card">
      <h3>フェデレーション先</h3>
      <p class="metric-val">1,204</p>
      <p class="metric-sub trend-up">+12 (7d)</p>
    </div>
    <div class="metric-card">
      <h3>アクティブユーザー</h3>
      <p class="metric-val">8</p>
      <p class="metric-sub">直近24時間</p>
    </div>
    <div class="metric-card">
      <h3>受信フェデレーション</h3>
      <p class="metric-val">3.2k</p>
      <p class="metric-sub trend-up">リクエスト/h</p>
    </div>
    <div class="metric-card">
      <h3>送信フェデレーション</h3>
      <p class="metric-val">842</p>
      <p class="metric-sub">リクエスト/h</p>
    </div>
  </div>
</section>

<hr>

<section>
  <h2>パフォーマンス</h2>

  <div class="charts-dual">
    <div class="chart-section">
      <div class="chart-header">
        <h3>リクエスト数 / 5xx エラー</h3>
        <p class="chart-latest">
          3.2k <span class="chart-latest-sub">req/h</span>
        </p>
      </div>
      <div class="chart-wrap">
        <canvas {@attach reqErrorChartAttachment()}></canvas>
      </div>
    </div>
    <div class="chart-section">
      <div class="chart-header">
        <h3>レスポンスタイム</h3>
        <p class="chart-latest">
          124 ms <span class="chart-latest-sub">直近5分平均</span>
        </p>
      </div>
      <div class="chart-wrap">
        <canvas
          {@attach chartAttachment({ data: respData, color: (c) => c.orange, fill: (c) => c.orangeFill, unit: "ms" })}
        ></canvas>
      </div>
    </div>
  </div>

  <div class="charts-dual">
    <div class="chart-section">
      <div class="chart-header">
        <h3>CPU 使用率</h3>
        <p class="chart-latest">
          23% <span class="chart-latest-sub">直近5分平均</span>
        </p>
      </div>
      <div class="chart-wrap">
        <canvas
          {@attach chartAttachment({ data: cpuData, color: (c) => c.purple, fill: (c) => c.purpleFill, unit: "%", yMax: 100 })}
        ></canvas>
      </div>
    </div>
    <div class="chart-section">
      <div class="chart-header">
        <h3>メモリ使用率</h3>
        <p class="chart-latest">
          58% <span class="chart-latest-sub">直近5分平均</span>
        </p>
      </div>
      <div class="chart-wrap">
        <canvas
          {@attach chartAttachment({ data: memData, color: (c) => c.blue, fill: (c) => c.blueFill, unit: "%", yMax: 100 })}
        ></canvas>
      </div>
    </div>
  </div>
</section>

<style>
/* ── Uptime ── */
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

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: 4px;
}

/* ── Metrics ── */
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

.metric-unit {
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--text-muted);
}

.metric-sub {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: 2px;
}

.trend-up {
  color: var(--green);
}

/* ── Charts ── */
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
