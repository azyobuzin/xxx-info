import { type Context, Hono } from "hono";
import type { IMetricsQueryService } from "./metrics-query-service/index.ts";
import type { TimeSeriesDataPoint as ServiceTimeSeriesDataPoint } from "./metrics-query-service/interface.ts";
import type {
  InstanceStatusResponse,
  TimeSeriesDataPoint,
} from "./response-types.ts";

export type ApiRouteDependencies = {
  metricsQueryService: IMetricsQueryService;
};

export function createApiRoute(deps: Readonly<ApiRouteDependencies>) {
  return new Hono()
    .get("/health", handleHealth)
    .get("/instance-status", (c) =>
      handleInstanceStatus(c, deps.metricsQueryService),
    );
}

function handleHealth(c: Context) {
  return c.text("It works!");
}

async function handleInstanceStatus(
  c: Context,
  metricsQueryService: IMetricsQueryService,
) {
  const [
    isUp,
    dailyUptime,
    localStatusCount,
    localUserCount,
    domainCount,
    requestCountTimeSeries,
    cpuUsageTimeSeries,
    memoryUsageTimeSeries,
    latestCpuUsage,
  ] = await Promise.all([
    metricsQueryService.isUp(),
    metricsQueryService.getDailyUptime(),
    metricsQueryService.getLocalStatusCount(),
    metricsQueryService.getLocalUserCount(),
    metricsQueryService.getDomainCount(),
    metricsQueryService.getRequestCountTimeSeries(),
    metricsQueryService.getCpuUsageTimeSeries(),
    metricsQueryService.getMemoryUsageTimeSeries(),
    metricsQueryService.getLatestCpuUsage(),
  ]);

  const mapTimeSeries = (
    points: ServiceTimeSeriesDataPoint[],
  ): TimeSeriesDataPoint[] =>
    points.map((p) => ({ timestamp: p.timestamp.getTime(), value: p.value }));

  const payload: InstanceStatusResponse = {
    uptimeSection: {
      isUp,
      dailyUptime,
    },
    usageSection: {
      localStatusCount,
      localUserCount,
      domainCount,
    },
    performanceSection: {
      requestCount: {
        latestValue: requestCountTimeSeries.at(-1)?.value ?? 0,
        points: mapTimeSeries(requestCountTimeSeries),
      },
      cpuUsage: {
        latestValue: latestCpuUsage,
        points: mapTimeSeries(cpuUsageTimeSeries),
      },
      memoryUsage: {
        latestValue: memoryUsageTimeSeries.at(-1)?.value ?? 0,
        points: mapTimeSeries(memoryUsageTimeSeries),
      },
    },
  };

  // CDNに1分間キャッシュさせる
  c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

  return c.json(payload);
}
