<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import StatusPage from "./StatusPage.svelte";

const { Story } = defineMeta({
  title: "StatusPage",
  component: StatusPage,
  parameters: {
    layout: "padded",
  },
});

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

function uptimeDays(
  statusFn: (i: number) => "ok" | "partial" | "down",
  length = 30,
) {
  return Array.from({ length }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (length - i));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const status = statusFn(i);
    const percent =
      status === "ok" ? "100%" : status === "partial" ? "95.2%" : "0%";
    return { status, tooltip: `${yyyy}-${mm}-${dd} ${percent}` };
  });
}

const defaultArgs = {
  uptime: {
    percent: "99.98%",
    days: uptimeDays((i) => (i === 12 || i === 25 ? "partial" : "ok")),
  },
  metrics: [
    {
      title: "ローカル投稿数",
      value: "12,847",
      subtitle: "+38 (24h)",
      trend: "up" as const,
    },
    { title: "ユーザー数", value: "23", subtitle: "±0 (7d)" },
    {
      title: "フェデレーション先",
      value: "1,204",
      subtitle: "+12 (7d)",
      trend: "up" as const,
    },
    { title: "アクティブユーザー", value: "8", subtitle: "直近24時間" },
    {
      title: "受信フェデレーション",
      value: "3.2k",
      subtitle: "リクエスト/h",
      trend: "up" as const,
    },
    { title: "送信フェデレーション", value: "842", subtitle: "リクエスト/h" },
  ],
  charts: (() => {
    const reqData = generateTimeSeries(3200, 500, 300);
    const errData = reqData.map((r) => {
      const spike = Math.random() < 0.08 ? Math.random() * 0.05 : 0;
      return Math.round(r * (0.0002 + spike));
    });
    return {
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
    };
  })(),
};

const degradedArgs = {
  uptime: {
    percent: "95.20%",
    days: uptimeDays((i) =>
      i % 5 === 0 ? "partial" : i === 3 || i === 18 ? "down" : "ok",
    ),
  },
  metrics: [
    { title: "ローカル投稿数", value: "8,204", subtitle: "+5 (24h)" },
    {
      title: "ユーザー数",
      value: "23",
      subtitle: "-2 (7d)",
      trend: "down" as const,
    },
    {
      title: "フェデレーション先",
      value: "987",
      subtitle: "-15 (7d)",
      trend: "down" as const,
    },
    { title: "アクティブユーザー", value: "3", subtitle: "直近24時間" },
    { title: "受信フェデレーション", value: "1.1k", subtitle: "リクエスト/h" },
    { title: "送信フェデレーション", value: "342", subtitle: "リクエスト/h" },
  ],
  charts: (() => {
    const reqData = generateTimeSeries(1200, 800, 400);
    const errData = reqData.map((r) => {
      const spike = Math.random() < 0.3 ? Math.random() * 0.15 : 0;
      return Math.round(r * (0.01 + spike));
    });
    return {
      requestError: {
        labels: hours,
        latestReqPerHour: 1100,
        requestData: reqData,
        errorData: errData,
      },
      responseTime: {
        labels: hours,
        latestMs: 850,
        data: generateTimeSeries(600, 300, 200),
      },
      cpu: {
        labels: hours,
        latestPercent: 87,
        data: generateTimeSeries(80, 15, 10, 100),
      },
      memory: {
        labels: hours,
        latestPercent: 92,
        data: generateTimeSeries(88, 8, 5, 100),
      },
    };
  })(),
};
</script>

<Story name="Default" args={defaultArgs} />
<Story name="Degraded" args={degradedArgs} />
