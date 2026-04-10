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
 * 2. apps/api をcwdにして、nodeにstdinでコードを流し rawQuery / rawQueryRange を実行、
 *    実レスポンスのJSONを取得する（Google Cloud ADC が設定されていること）:
 *      cd apps/api
 *      node --input-type=module <<'EOF'
 *      import { PrometheusClient } from "./src/prometheus-client/index.ts";
 *      import { subDays } from "date-fns";
 *      const client = new PrometheusClient();
 *      const end = new Date();
 *      const start = subDays(end, 7);
 *      const res = await client.rawQueryRange({ query: "...", start, end, step: "7d" });
 *      console.log(JSON.stringify(res, null, 2));
 *      EOF
 * 3. 取得したJSONをテスト内の createQueryStub / createQueryRangeStub にそのまま渡す
 * 4. サービスメソッドを呼び出して期待値と deepStrictEqual で比較するテストを書く
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

test("getLocalStatusCount returns current value and diff from 7 days ago", async (t: TestContext) => {
  // Arrange
  const stubPrometheusClient = createQueryRangeStub({
    status: "success",
    data: {
      resultType: "matrix",
      result: [
        {
          metric: {
            __name__: "pleroma_instance_status_count",
            service: "xxx-prd",
          },
          values: [
            [1775218788.708, "19691"],
            [1775823588.708, "19725"],
          ],
        },
      ],
    },
  });
  const service = new MetricsQueryService(stubPrometheusClient);

  // Act
  const result = await service.getLocalStatusCount();

  // Assert
  t.assert.deepStrictEqual(result, { value: 19725, diff: 34 });
});

test("getLocalUserCount returns current value and diff from 7 days ago", async (t: TestContext) => {
  // Arrange
  const stubPrometheusClient = createQueryRangeStub({
    status: "success",
    data: {
      resultType: "matrix",
      result: [
        {
          metric: {
            __name__: "pleroma_instance_user_count",
            service: "xxx-prd",
          },
          values: [
            [1775218788.708, "164"],
            [1775823588.708, "164"],
          ],
        },
      ],
    },
  });
  const service = new MetricsQueryService(stubPrometheusClient);

  // Act
  const result = await service.getLocalUserCount();

  // Assert
  t.assert.deepStrictEqual(result, { value: 164, diff: 0 });
});

test("getDomainCount returns current value and diff from 7 days ago", async (t: TestContext) => {
  // Arrange
  const stubPrometheusClient = createQueryRangeStub({
    status: "success",
    data: {
      resultType: "matrix",
      result: [
        {
          metric: {
            __name__: "pleroma_instance_domain_count",
            service: "xxx-prd",
          },
          values: [
            [1775218788.708, "13069"],
            [1775823588.708, "13089"],
          ],
        },
      ],
    },
  });
  const service = new MetricsQueryService(stubPrometheusClient);

  // Act
  const result = await service.getDomainCount();

  // Assert
  t.assert.deepStrictEqual(result, { value: 13089, diff: 20 });
});
