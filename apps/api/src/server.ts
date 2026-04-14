import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { MetricsQueryService } from "./metrics-query-service/index.ts";
import * as observability from "./observability.ts";
import { type ApiRouteDependencies, createApiRoute } from "./routes.ts";

await observability.start();

const deps: ApiRouteDependencies = {
  metricsQueryService: new MetricsQueryService(),
};

const app = new Hono()
  .use(logger())
  .use(observability.createMiddleware())
  .route("/api", createApiRoute(deps));

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT || 3000),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
