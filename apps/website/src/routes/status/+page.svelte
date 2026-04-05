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

const uptimeDays = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (30 - i));
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const status = (i === 12 || i === 25 ? "partial" : "ok") as
    | "ok"
    | "partial"
    | "down";
  const percent = status === "ok" ? "100%" : "95.2%";
  return { status, tooltip: `${yyyy}-${mm}-${dd} ${percent}` };
});

const reqData = generateTimeSeries(3200, 500, 300);
const errData = reqData.map((r) => {
  const spike = Math.random() < 0.08 ? Math.random() * 0.05 : 0;
  return Math.round(r * (0.0002 + spike));
});
</script>

<StatusPage
  uptime={{
		percent: "99.98%",
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
		requestError: {
			labels: hours,
			latestReqPerHour: 3200,
			requestData: reqData,
			errorData: errData,
		},
		responseTime: {
			labels: hours,
			latestMs: 124,
			data: generateTimeSeries(110, 40, 30),
		},
		cpu: {
			labels: hours,
			latestPercent: 23,
			data: generateTimeSeries(20, 12, 8, 100),
		},
		memory: {
			labels: hours,
			latestPercent: 58,
			data: generateTimeSeries(55, 8, 5, 100),
		},
	}}
/>
