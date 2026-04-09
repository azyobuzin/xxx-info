export type QueryRequest = {
  /** Prometheus expression query string. */
  query: string;
};

export function queryRequestToURLSearchParams(
  request: QueryRequest,
): URLSearchParams {
  return new URLSearchParams({ query: request.query });
}

export type QueryRangeRequest = {
  /** Prometheus expression query string. */
  query: string;

  /** Start timestamp, inclusive. */
  start: Date;

  /** End timestamp, inclusive. */
  end: Date;

  /** Query resolution step width in duration format or float number of seconds. */
  step: string | number;
};

export function queryRangeRequestToURLSearchParams(
  request: QueryRangeRequest,
): URLSearchParams {
  return new URLSearchParams({
    query: request.query,
    start: request.start.toISOString(),
    end: request.end.toISOString(),
    step: request.step.toString(),
  });
}
