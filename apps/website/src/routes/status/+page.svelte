<script lang="ts">
import StatusPage from "$lib/ui/status-page/StatusPage.svelte";

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

const uptimeDays = Array.from({ length: 30 }, (_, i) => ({
  status: (i === 12 || i === 25 ? "partial" : "ok") as
    | "ok"
    | "partial"
    | "down",
  tooltip: `${30 - i}日前`,
}));

const reqData = generateTimeSeries(3200, 500, 300);
const errData = reqData.map((r) => {
  const spike = Math.random() < 0.08 ? Math.random() * 0.05 : 0;
  return Math.round(r * (0.0002 + spike));
});
</script>

<StatusPage
  uptime={{
		percent: "99.98%",
		label: "過去30日間の総合稼働率",
		days: uptimeDays,
	}}
  metrics={[
		{ title: "ローカル投稿数", value: "12,847", subtitle: "+38 (24h)", trend: "up" },
		{ title: "ユーザー数", value: "23", subtitle: "±0 (7d)" },
		{ title: "フェデレーション先", value: "1,204", subtitle: "+12 (7d)", trend: "up" },
		{ title: "アクティブユーザー", value: "8", subtitle: "直近24時間" },
		{ title: "受信フェデレーション", value: "3.2k", subtitle: "リクエスト/h", trend: "up" },
		{ title: "送信フェデレーション", value: "842", subtitle: "リクエスト/h" },
	]}
  charts={{
		labels: hours,
		requestError: {
			title: "リクエスト数 / 5xx エラー",
			latestValue: "3.2k",
			latestLabel: "req/h",
			requestData: reqData,
			errorData: errData,
		},
		responseTime: {
			title: "レスポンスタイム",
			latestValue: "124 ms",
			latestLabel: "直近5分平均",
			data: generateTimeSeries(110, 40, 30),
		},
		cpu: {
			title: "CPU 使用率",
			latestValue: "23%",
			latestLabel: "直近5分平均",
			data: generateTimeSeries(20, 12, 8, 100),
		},
		memory: {
			title: "メモリ使用率",
			latestValue: "58%",
			latestLabel: "直近5分平均",
			data: generateTimeSeries(55, 8, 5, 100),
		},
	}}
/>
