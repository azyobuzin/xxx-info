import { createQuery } from "@tanstack/svelte-query";
import {
  createClient,
  type InstanceStatusResponse,
} from "@xxx-info/api/client";
import { parseResponse } from "hono/client";
import { browser } from "$app/environment";

const client = createClient("/api");

export function createInstanceStatusQuery() {
  return createQuery(() => ({
    queryKey: ["instance-status"],
    queryFn: async (): Promise<InstanceStatusResponse> => {
      const res = await client["instance-status"].$get();
      return parseResponse(res);
    },
    enabled: browser,
    staleTime: 60_000, // Cache-Controlに合わせてある
    retry: 2,
  }));
}
