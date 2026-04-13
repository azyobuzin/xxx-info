import { hc } from "hono/client";
import type { createApiRoute } from "./routes.ts";

export type * from "./response-types.ts";

type RouteType = ReturnType<typeof createApiRoute>;
export type ApiClient = ReturnType<typeof hc<RouteType>>;

/**
 * APIクライアントを作成する。
 *
 * @example
 * ```ts
 * const client = createClient("http://localhost:3000/api");
 * ```
 */
export const createClient = (
  ...args: Parameters<typeof hc<RouteType>>
): ApiClient => hc<RouteType>(...args);
