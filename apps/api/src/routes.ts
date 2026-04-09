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

function handleInstanceStatus(
  c: Context,
  metricsQueryService: IMetricsQueryService,
) {
  return c.json({});
}
