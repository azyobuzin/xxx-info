import type { QueryRangeRequest, QueryRequest } from "./request.ts";
import type { QueryRangeResponseData, QueryResponseData } from "./response.ts";

export interface IPrometheusClient {
  /** 指定されたクエリの最新の値を取得します。 */
  query: (parameters: Readonly<QueryRequest>) => Promise<QueryResponseData>;

  /** 指定した期間に対して、step間隔でqueryを計算します。 */
  queryRange: (
    parameters: Readonly<QueryRangeRequest>,
  ) => Promise<QueryRangeResponseData>;
}
