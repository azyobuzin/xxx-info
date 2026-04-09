import { googleAuth } from "../google-auth-singleton.ts";
import type { IPrometheusClient } from "./interface.ts";
import {
  type QueryRangeRequest,
  type QueryRequest,
  queryRangeRequestToURLSearchParams,
  queryRequestToURLSearchParams,
} from "./request.ts";
import {
  parseQueryRangeResponse,
  parseQueryResponse,
  type QueryRangeResponseData,
  type QueryResponseData,
} from "./response.ts";

export class PrometheusClient implements IPrometheusClient {
  // === IPrometheusClient implementation ===

  async query(parameters: Readonly<QueryRequest>): Promise<QueryResponseData> {
    const response = await this.rawQuery(parameters);
    return parseQueryResponse(response);
  }

  async queryRange(
    parameters: Readonly<QueryRangeRequest>,
  ): Promise<QueryRangeResponseData> {
    const response = await this.rawQueryRange(parameters);
    return parseQueryRangeResponse(response);
  }

  // === バリデーションなしのリクエスト（REPLでテストするために分離） ===

  async rawQuery(parameters: Readonly<QueryRequest>): Promise<unknown> {
    const searchParams = queryRequestToURLSearchParams(parameters);
    return await this.#get(`query?${searchParams}`);
  }

  async rawQueryRange(
    parameters: Readonly<QueryRangeRequest>,
  ): Promise<unknown> {
    const searchParams = queryRangeRequestToURLSearchParams(parameters);
    return await this.#get(`query_range?${searchParams}`);
  }

  /** GETリクエストを送信します。 */
  async #get(url: string): Promise<unknown> {
    const projectId = await googleAuth.getProjectId();
    const requestUrl = `https://monitoring.googleapis.com/v1/projects/${projectId}/location/global/prometheus/api/v1/${url}`;
    const response = await googleAuth.request({
      url: requestUrl,
      // HACK: instrumentation-undiciに捕捉させるためにfetchを直接渡す
      fetchImplementation: fetch,
    });
    return response.data;
  }
}
