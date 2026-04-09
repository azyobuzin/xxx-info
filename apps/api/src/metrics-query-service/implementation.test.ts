import { type TestContext, test } from "node:test";
import type { IPrometheusClient } from "../prometheus-client/index.ts";
import {
  parseQueryRangeResponse,
  parseQueryResponse,
} from "../prometheus-client/response.ts";
import { MetricsQueryService } from "./implementation.ts";

/**
 * MAINTAIN: すべてのクエリに対して、レスポンスのパースが正しいことを確認するテストを追加すること
 * 1. queries.tsにクエリを追加し、そのクエリを利用するコードをimplementation.tsに実装する
 * 2. REPLでPrometheusClient.rawQueryまたはrawQueryRangeを使ってクエリを実行し、実際のレスポンスを取得する
 * 3. 取得したレスポンスをstubQueryResponsesまたはstubQueryRangeResponsesに追加する
 * 4. レスポンスのパースが正しいことを確認するテストを実装する
 */

function createQueryStub(rawResponse: unknown): IPrometheusClient {
  return {
    async query() {
      return parseQueryResponse(rawResponse);
    },
    async queryRange() {
      throw new Error("Not implemented");
    },
  };
}

function createQueryRangeStub(rawResponse: unknown): IPrometheusClient {
  return {
    async query() {
      throw new Error("Not implemented");
    },
    async queryRange() {
      return parseQueryRangeResponse(rawResponse);
    },
  };
}

test("isUp returns true when the query result is 1", async (t: TestContext) => {
  // Arrange
  const stubPrometheusClient = createQueryStub({
    status: "success",
    data: {
      resultType: "vector",
      result: [
        {
          metric: {},
          value: [1775747285.414, "1"],
        },
      ],
    },
  });
  const service = new MetricsQueryService(stubPrometheusClient);

  // Act
  const result = await service.isUp();

  // Assert
  t.assert.strictEqual(result, true);
});

test("isUp returns false when the query result is not 1", async (t: TestContext) => {
  // Arrange
  const stubPrometheusClient = createQueryStub({
    status: "success",
    data: {
      resultType: "vector",
      result: [
        {
          metric: {},
          value: [1775747285.414, "0.9"],
        },
      ],
    },
  });
  const service = new MetricsQueryService(stubPrometheusClient);

  // Act
  const result = await service.isUp();

  // Assert
  t.assert.strictEqual(result, false);
});

test("getDailyUptime returns daily uptime rates", async (t: TestContext) => {
  // Arrange
  // DAILY_UPTIME_PROMQL のレスポンス（3日分）
  // start: 2026-04-09T00:00:00+09:00, end: 2026-04-11T00:00:00+09:00, step: "1d"
  const stubPrometheusClient = createQueryRangeStub({
    status: "success",
    data: {
      resultType: "matrix",
      result: [
        {
          metric: {},
          values: [
            [1775660400, "1"],
            [1775746800, "1"],
            [1775833200, "1"],
          ],
        },
      ],
    },
  });
  const service = new MetricsQueryService(stubPrometheusClient);

  // Act
  const result = await service.getDailyUptime();

  // Assert
  // avg_over_time(...[1d]) のタイムスタンプは期間の終端なので、見出しはその前日
  t.assert.deepStrictEqual(result, [
    { date: "2026-04-08", uptimeRate: 1 },
    { date: "2026-04-09", uptimeRate: 1 },
    { date: "2026-04-10", uptimeRate: 1 },
  ]);
});
