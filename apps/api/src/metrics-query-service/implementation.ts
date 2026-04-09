import { tz } from "@date-fns/tz";
import { format, startOfTomorrow, subDays } from "date-fns";
import {
  type IPrometheusClient,
  PrometheusClient,
} from "../prometheus-client/index.ts";
import type { DailyUptime, IMetricsQueryService } from "./interface.ts";
import { DAILY_UPTIME_PROMQL, IS_UP_PROMQL } from "./queries.ts";

const jst = tz("Asia/Tokyo");

/** Google Cloud MonitoringのPrometheus HTTP APIを使ってメトリクスを取得する実装 */
export class MetricsQueryService implements IMetricsQueryService {
  #prometheusClient: IPrometheusClient;

  constructor(prometheusClient: IPrometheusClient = new PrometheusClient()) {
    this.#prometheusClient = prometheusClient;
  }

  async isUp(): Promise<boolean> {
    const data = await this.#prometheusClient.query({ query: IS_UP_PROMQL });
    return data.result[0]?.value.value === 1;
  }

  async getDailyUptime(): Promise<DailyUptime[]> {
    // JST基準で30日分のデータを取得する。
    // 例: 今日が2026-04-10の場合
    //   start: 2026-03-12T00:00:00+09:00
    //   end  : 2026-04-11T00:00:00+09:00
    // データはstartからstepごとに1日ぶん遡って計算するので、出力されるデータは
    //   2026-03-11T00:00:00+09:00 から 2026-03-12T00:00:00+09:00 (start) の平均
    //   2026-03-12T00:00:00+09:00 から 2026-03-13T00:00:00+09:00 の平均
    //   ...
    //   2026-04-09T00:00:00+09:00 から 2026-04-10T00:00:00+09:00 (end) の平均
    // となる
    const end = startOfTomorrow({ in: jst });
    const start = subDays(end, 29);

    const data = await this.#prometheusClient.queryRange({
      query: DAILY_UPTIME_PROMQL,
      start,
      end,
      step: "1d",
    });

    return data.result[0].values.map((v) => ({
      // タイムスタンプはavg_over_time(...[1d])の期間終端なので、見出しはその前日
      date: format(subDays(v.timestamp, 1), "yyyy-MM-dd", { in: jst }),
      uptimeRate: Number.isNaN(v.value) ? 0 : v.value, // NaNは0%とみなす
    }));
  }
}
