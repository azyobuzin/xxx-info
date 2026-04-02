<script lang="ts">
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    Tooltip,
  } from "chart.js";

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    Tooltip
  );

  // ── Dummy data generators ──

  function generateTimeSeries(
    base: number,
    amplitude: number,
    noise: number,
    clamp?: number
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

  // ── Chart rendering ──

  function createChart(
    canvas: HTMLCanvasElement,
    data: number[],
    color: string,
    fillColor: string,
    unit: string,
    yMax?: number
  ) {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const tickColor = isDark ? "#888" : "#999";

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
              label: (c) => c.parsed.y + unit,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor, font: { size: 11 }, maxTicksLimit: 6 },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
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

  function chartAttachment(params: {
    data: number[];
    color: string;
    fill: string;
    unit: string;
    yMax?: number;
  }) {
    return (canvas: HTMLCanvasElement) => {
      const chart = createChart(canvas, params.data, params.color, params.fill, params.unit, params.yMax);
      return () => chart.destroy();
    };
  }

  const isDark =
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const respData = generateTimeSeries(110, 40, 30);
  const cpuData = generateTimeSeries(20, 12, 8, 100);
  const memData = generateTimeSeries(55, 8, 5, 100);
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

<hr />

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

<hr />

<section>
  <h2>パフォーマンス</h2>

  <div class="chart-section">
    <div class="chart-header">
      <h3>レスポンスタイム</h3>
      <p class="chart-latest">124 ms <span class="chart-latest-sub">直近5分平均</span></p>
    </div>
    <div class="chart-wrap">
      <canvas {@attach chartAttachment({ data: respData, color: isDark ? "#5DCAA5" : "#1D9E75", fill: isDark ? "rgba(93,202,165,0.08)" : "rgba(29,158,117,0.08)", unit: "ms" })}></canvas>
    </div>
  </div>

  <div class="charts-dual">
    <div class="chart-section">
      <div class="chart-header">
        <h3>CPU 使用率</h3>
        <p class="chart-latest">23% <span class="chart-latest-sub">直近5分平均</span></p>
      </div>
      <div class="chart-wrap">
        <canvas {@attach chartAttachment({ data: cpuData, color: isDark ? "#AFA9EC" : "#534AB7", fill: isDark ? "rgba(175,169,236,0.1)" : "rgba(83,74,183,0.08)", unit: "%", yMax: 100 })}></canvas>
      </div>
    </div>
    <div class="chart-section">
      <div class="chart-header">
        <h3>メモリ使用率</h3>
        <p class="chart-latest">58% <span class="chart-latest-sub">直近5分平均</span></p>
      </div>
      <div class="chart-wrap">
        <canvas {@attach chartAttachment({ data: memData, color: isDark ? "#85B7EB" : "#378ADD", fill: isDark ? "rgba(133,183,235,0.1)" : "rgba(55,138,221,0.08)", unit: "%", yMax: 100 })}></canvas>
      </div>
    </div>
  </div>

  <div class="perf-cards">
    <div class="metric-card">
      <h3>5xx エラー率</h3>
      <p class="metric-val">0.02<span class="metric-unit">%</span></p>
      <p class="metric-sub">過去24時間</p>
    </div>
    <div class="metric-card">
      <h3>Oban キュー</h3>
      <p class="metric-val">12<span class="metric-unit"> jobs</span></p>
      <p class="metric-sub">処理待ち</p>
    </div>
    <div class="metric-card">
      <h3>DB コミット</h3>
      <p class="metric-val">284<span class="metric-unit">/s</span></p>
      <p class="metric-sub">過去1時間平均</p>
    </div>
  </div>

  <div class="gauge-section">
    <h3>リソース容量</h3>
    <div class="gauge-row">
      <span class="gauge-label">DB コネクション</span>
      <div class="gauge-bar-bg">
        <div class="gauge-bar-fill" style="width: 35%; background: var(--amber);"></div>
      </div>
      <span class="gauge-val">35 / 100</span>
    </div>
    <div class="gauge-row">
      <span class="gauge-label">ディスク使用量</span>
      <div class="gauge-bar-bg">
        <div class="gauge-bar-fill" style="width: 62%; background: var(--amber);"></div>
      </div>
      <span class="gauge-val">18.6 / 30 GB</span>
    </div>
  </div>
</section>

<p class="updated">最終更新: 2026-04-02 14:30 JST — 5分ごとに自動更新</p>

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
    font-size: var(--text-sm);
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
    margin-bottom: var(--space-md);
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
    margin: 0;
  }

  .chart-latest {
    font-size: var(--text-base);
    font-weight: 500;
  }

  .chart-latest-sub {
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
    gap: var(--space-md);
  }

  @media (max-width: 540px) {
    .charts-dual {
      grid-template-columns: 1fr;
    }
  }

  /* ── Perf cards ── */
  .perf-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm);
    margin-top: var(--space-md);
  }

  @media (max-width: 540px) {
    .perf-cards {
      grid-template-columns: 1fr;
    }
  }

  /* ── Gauges ── */
  .gauge-section {
    margin-top: var(--space-lg);
  }

  .gauge-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-muted);
    border-radius: var(--radius);
    margin-bottom: var(--space-sm);
  }

  .gauge-label {
    font-size: var(--text-base);
    color: var(--text-muted);
    width: 130px;
    flex-shrink: 0;
  }

  .gauge-bar-bg {
    flex: 1;
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }

  .gauge-bar-fill {
    height: 100%;
    border-radius: 3px;
  }

  .gauge-val {
    font-size: var(--text-base);
    font-weight: 500;
    width: 100px;
    text-align: right;
    flex-shrink: 0;
  }

  /* ── Footer ── */
  .updated {
    font-size: var(--text-sm);
    color: var(--text-muted);
    text-align: right;
  }
</style>
