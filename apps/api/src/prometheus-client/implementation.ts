import { GoogleAuth } from "google-auth-library";
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
  #googleAuth: GoogleAuth;

  constructor() {
    this.#googleAuth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/monitoring.read",
    });
  }

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
    const url = `${await this.#urlPrefix()}/query?${searchParams}`;
    const response = await this.#googleAuth.fetch(url);
    return response.data;
  }

  async rawQueryRange(
    parameters: Readonly<QueryRangeRequest>,
  ): Promise<unknown> {
    const searchParams = queryRangeRequestToURLSearchParams(parameters);
    const url = `${await this.#urlPrefix()}/query_range?${searchParams}`;
    const response = await this.#googleAuth.fetch(url);
    return response.data;
  }

  async #urlPrefix(): Promise<string> {
    const projectId = await this.#googleAuth.getProjectId();
    return `https://monitoring.googleapis.com/v1/projects/${projectId}/location/global/prometheus/api/v1`;
  }
}
