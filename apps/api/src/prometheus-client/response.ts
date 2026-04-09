import * as z from "zod";

const SampleValue = z
  .tuple([z.number(), z.string()])
  .transform(([timestamp, value]) => ({
    timestamp: new Date(timestamp * 1000),
    value: parseFloat(value),
  }));

const InstantVectorData = z.object({
  resultType: z.literal("vector"),
  result: z.array(
    z.object({
      metric: z.record(z.string(), z.string()),
      value: SampleValue,
    }),
  ),
});

const QueryResponse = z.object({
  status: z.literal("success"),
  data: z.union([InstantVectorData]),
});

export type QueryResponseData = z.infer<typeof QueryResponse>["data"];

export function parseQueryResponse(response: unknown): QueryResponseData {
  const parsed = QueryResponse.parse(response);
  return parsed.data;
}

const QueryRangeResponse = z.object({
  status: z.literal("success"),
  data: z.union([
    // TODO
    InstantVectorData,
  ]),
});

export type QueryRangeResponseData = z.infer<typeof QueryRangeResponse>["data"];

export function parseQueryRangeResponse(
  response: unknown,
): QueryRangeResponseData {
  const parsed = QueryRangeResponse.parse(response);
  return parsed.data;
}
