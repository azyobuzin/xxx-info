import { type Context, Hono } from "hono";
import type { IMetricsQueryService } from "./metrics-query-service/index.ts";

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
  const [isUp, dailyUptime, localStatusCount, localUserCount, domainCount] =
    await Promise.all([
      metricsQueryService.isUp(),
      metricsQueryService.getDailyUptime(),
      metricsQueryService.getLocalStatusCount(),
      metricsQueryService.getLocalUserCount(),
      metricsQueryService.getDomainCount(),
    ]);

  // CDNに1分間キャッシュさせる
  c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

  return c.json({
    isUp,
    dailyUptime,
    localStatusCount,
    localUserCount,
    domainCount,
  });
}
