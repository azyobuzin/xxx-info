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

const defaultArgs = {
  uptime: {
    percent: "99.98%",
    label: "過去30日間の総合稼働率",
    days: Array.from({ length: 30 }, (_, i) => ({
      status: (i === 12 || i === 25 ? "partial" : "ok") as
        | "ok"
        | "partial"
        | "down",
      tooltip: `${30 - i}日前`,
    })),
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
    };
  })(),
};

const degradedArgs = {
  uptime: {
    percent: "95.20%",
    label: "過去30日間の総合稼働率",
    days: Array.from({ length: 30 }, (_, i) => ({
      status: (i % 5 === 0 ? "partial" : i === 3 || i === 18 ? "down" : "ok") as
        | "ok"
        | "partial"
        | "down",
      tooltip: `${30 - i}日前`,
    })),
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
      labels: hours,
      requestError: {
        title: "リクエスト数 / 5xx エラー",
        latestValue: "1.1k",
        latestLabel: "req/h",
        requestData: reqData,
        errorData: errData,
      },
      responseTime: {
        title: "レスポンスタイム",
        latestValue: "850 ms",
        latestLabel: "直近5分平均",
        data: generateTimeSeries(600, 300, 200),
      },
      cpu: {
        title: "CPU 使用率",
        latestValue: "87%",
        latestLabel: "直近5分平均",
        data: generateTimeSeries(80, 15, 10, 100),
      },
      memory: {
        title: "メモリ使用率",
        latestValue: "92%",
        latestLabel: "直近5分平均",
        data: generateTimeSeries(88, 8, 5, 100),
      },
    };
  })(),
};
</script>

<Story name="Default" args={defaultArgs} />
<Story name="Degraded" args={degradedArgs} />
