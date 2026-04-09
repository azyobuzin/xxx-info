import { type TestContext, test } from "node:test";
import type { IPrometheusClient } from "../prometheus-client/index.ts";
import type {
  QueryRangeResponseData,
  QueryResponseData,
} from "../prometheus-client/response.ts";
import { MetricsQueryService } from "./implementation.ts";

/**
 * MAINTAIN: すべてのクエリに対して、レスポンスのパースが正しいことを確認するテストを追加すること
 * 1. queries.tsにクエリを追加し、そのクエリを利用するコードをimplementation.tsに実装する
 * 2. REPLでPrometheusClient.rawQueryまたはrawQueryRangeを使ってクエリを実行し、実際のレスポンスを取得する
 * 3. 取得したレスポンスをstubQueryResponsesまたはstubQueryRangeResponsesに追加する
 * 4. レスポンスのパースが正しいことを確認するテストを実装する
 */

test("isUp returns true when the query result is 1", async (t: TestContext) => {
  // Arrange
  const stubPrometheusClient: IPrometheusClient = {
    async query() {
      return {
        // TODO: 実際のレスポンスのdataフィールド
      };
    },
    async queryRange() {
      throw new Error("Not implemented");
    },
  };

  const service = new MetricsQueryService(stubPrometheusClient);

  // Act
  const result = await service.isUp();

  // Assert
  t.assert.strictEqual(result, true);
});
