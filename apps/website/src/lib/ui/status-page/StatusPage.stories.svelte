<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import type { InstanceStatusResponse } from "@xxx-info/api/client";
import StatusPage from "./StatusPage.svelte";

const { Story } = defineMeta({
  title: "StatusPage",
  component: StatusPage,
  parameters: {
    layout: "padded",
  },
});

function generateTimeSeriesPoints(
  base: number,
  amplitude: number,
  noise: number,
  clamp?: { min: number; max: number },
  count = 24,
): { timestamp: number; value: number }[] {
  const now = Date.now();
  const intervalMs = (24 * 60 * 60 * 1000) / count;
  return Array.from({ length: count }, (_, i) => {
    let v = base + Math.sin(i / 3) * amplitude + (Math.random() - 0.3) * noise;
    if (clamp) v = Math.min(Math.max(v, clamp.min), clamp.max);
    return {
      timestamp: now - (count - 1 - i) * intervalMs,
      value: Math.round(v),
    };
  });
}

function uptimeDays(
  rateFn: (i: number) => number,
  length = 30,
): { date: string; uptimeRate: number }[] {
  return Array.from({ length }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (length - i));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return { date: `${yyyy}-${mm}-${dd}`, uptimeRate: rateFn(i) };
  });
}

function makeTimeSeries(
  base: number,
  amplitude: number,
  noise: number,
  clamp?: { min: number; max: number },
  count = 24,
) {
  const points = generateTimeSeriesPoints(base, amplitude, noise, clamp, count);
  return {
    latestValue: points.at(-1)?.value ?? 0,
    points,
  };
}

const defaultData: InstanceStatusResponse = {
  uptimeSection: {
    isUp: true,
    dailyUptime: uptimeDays((i) => (i === 12 || i === 25 ? 0.952 : 1.0)),
  },
  usageSection: {
    localStatusCount: { value: 12847, diff: 38 },
    localUserCount: { value: 23, diff: 0 },
    domainCount: { value: 1204, diff: 12 },
  },
  performanceSection: {
    requestCount: makeTimeSeries(3200, 500, 300),
    cpuUsage: makeTimeSeries(0.2, 0.12, 0.08, { min: 0, max: 1 }),
    memoryUsage: makeTimeSeries(0.55, 0.08, 0.05, { min: 0, max: 1 }),
  },
};

const degradedData: InstanceStatusResponse = {
  uptimeSection: {
    isUp: true,
    dailyUptime: uptimeDays((i) =>
      i % 5 === 0 ? 0.952 : i === 3 || i === 18 ? 0 : 1.0,
    ),
  },
  usageSection: {
    localStatusCount: { value: 8204, diff: 5 },
    localUserCount: { value: 23, diff: -2 },
    domainCount: { value: 987, diff: -15 },
  },
  performanceSection: {
    requestCount: makeTimeSeries(1200, 800, 400),
    cpuUsage: makeTimeSeries(0.8, 0.15, 0.1, { min: 0, max: 1 }),
    memoryUsage: makeTimeSeries(0.88, 0.08, 0.05, { min: 0, max: 1 }),
  },
};
</script>

<Story name="Default" args={{ data: defaultData }} />
<Story name="Degraded" args={{ data: degradedData }} />
