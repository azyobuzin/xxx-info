<section>
  <h2>サービス稼働状況</h2>
  <p class="big-uptime">
    <span class="skel skel-num"></span>
    <span class="skel skel-sub"></span>
  </p>
  <div class="uptime-bar">
    {#each { length: 30 } as _}
      <div class="uptime-day-skel"></div>
    {/each}
  </div>
</section>

<hr>

<section>
  <h2>利用状況</h2>
  <div class="metric-grid">
    {#each { length: 3 } as _}
      <div class="metric-card-skel">
        <div class="skel skel-title"></div>
        <div class="skel skel-value"></div>
      </div>
    {/each}
  </div>
</section>

<hr>

<section>
  <h2>パフォーマンス</h2>
  <div class="chart-skel-section">
    <div class="skel skel-chart-header"></div>
    <div class="skel skel-chart"></div>
  </div>
  <div class="charts-dual">
    {#each { length: 2 } as _}
      <div class="chart-skel-section">
        <div class="skel skel-chart-header"></div>
        <div class="skel skel-chart"></div>
      </div>
    {/each}
  </div>
</section>

<style>
.skel {
  background: var(--border);
  border-radius: 4px;
}

.skel-num {
  display: inline-block;
  width: 120px;
  height: 2rem;
}

.skel-sub {
  display: inline-block;
  width: 160px;
  height: 0.875rem;
}

.big-uptime {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.uptime-bar {
  display: flex;
  gap: 2px;
}

.uptime-day-skel {
  flex: 1;
  height: 28px;
  border-radius: 2px;
  background: var(--border);
}

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

.metric-card-skel {
  background: var(--bg-muted);
  border-radius: var(--radius);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.skel-title {
  width: 80px;
  height: 1rem;
}

.skel-value {
  width: 60px;
  height: 1.5rem;
}

.chart-skel-section {
  margin-bottom: var(--space-lg);
}

.skel-chart-header {
  width: 140px;
  height: 1rem;
  margin-bottom: var(--space-sm);
}

.skel-chart {
  width: 100%;
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
