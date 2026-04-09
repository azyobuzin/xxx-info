import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { MetricsQueryService } from "./metrics-query-service/index.ts";
import { type ApiRouteDependencies, createApiRoute } from "./routes.ts";

const deps: ApiRouteDependencies = {
  metricsQueryService: new MetricsQueryService(),
};

const app = new Hono().use(logger()).route("/api", createApiRoute(deps));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
