import { tz } from "@date-fns/tz";
import { format, startOfTomorrow, subDays, subHours } from "date-fns";
import {
  type IPrometheusClient,
  PrometheusClient,
} from "../prometheus-client/index.ts";
import type {
  DailyUptime,
  IMetricsQueryService,
  MetricWithDiff,
  TimeSeriesDataPoint,
} from "./interface.ts";
import {
  CPU_USAGE_PROMQL,
  DAILY_UPTIME_PROMQL,
  DOMAIN_COUNT_PROMQL,
  IS_UP_PROMQL,
  LATEST_CPU_USAGE_PROMQL,
  LOCAL_STATUS_COUNT_PROMQL,
  LOCAL_USER_COUNT_PROMQL,
  MEMORY_USAGE_PROMQL,
  REQUEST_COUNT_PROMQL,
} from "./queries.ts";

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
      uptimeRate: Number.isFinite(v.value) ? v.value : 0, // NaNは0%とみなす
    }));
  }

  async getLocalStatusCount(): Promise<MetricWithDiff> {
    return this.#getMetricWithDiff(LOCAL_STATUS_COUNT_PROMQL);
  }

  async getLocalUserCount(): Promise<MetricWithDiff> {
    return this.#getMetricWithDiff(LOCAL_USER_COUNT_PROMQL);
  }

  async getDomainCount(): Promise<MetricWithDiff> {
    return this.#getMetricWithDiff(DOMAIN_COUNT_PROMQL);
  }

  async getRequestCountTimeSeries(): Promise<TimeSeriesDataPoint[]> {
    const end = new Date();
    const start = subHours(end, 23);

    const data = await this.#prometheusClient.queryRange({
      query: REQUEST_COUNT_PROMQL,
      start,
      end,
      step: "1h",
    });

    return data.result[0]?.values.filter((v) => Number.isFinite(v.value)) ?? [];
  }

  async getCpuUsageTimeSeries(): Promise<TimeSeriesDataPoint[]> {
    const end = new Date();
    const start = subHours(end, 23.5);

    const data = await this.#prometheusClient.queryRange({
      query: CPU_USAGE_PROMQL,
      start,
      end,
      step: "30m",
    });

    return data.result[0]?.values.filter((v) => Number.isFinite(v.value)) ?? [];
  }

  async getMemoryUsageTimeSeries(): Promise<TimeSeriesDataPoint[]> {
    const end = new Date();
    const start = subHours(end, 23.5);

    const data = await this.#prometheusClient.queryRange({
      query: MEMORY_USAGE_PROMQL,
      start,
      end,
      step: "30m",
    });

    return data.result[0]?.values.filter((v) => Number.isFinite(v.value)) ?? [];
  }

  async getLatestCpuUsage(): Promise<number> {
    const data = await this.#prometheusClient.query({
      query: LATEST_CPU_USAGE_PROMQL,
    });
    return data.result[0]?.value.value ?? 0;
  }

  async #getMetricWithDiff(query: string): Promise<MetricWithDiff> {
    // step = 7d でデータポイントは現在と7日前の2点になる
    const end = new Date();
    const start = subDays(end, 7);

    const data = await this.#prometheusClient.queryRange({
      query,
      start,
      end,
      step: "7d",
    });

    const values = data.result[0]?.values ?? [];

    // 最新の値 = 配列の最後の要素
    const current = values.at(-1)?.value ?? Number.NaN;

    // 7日前の値。データポイントが1点しかない場合はNaNとみなす
    const previous = values.length >= 2 ? values[0].value : Number.NaN;

    return {
      value: Number.isFinite(current) ? current : 0,
      diff:
        Number.isFinite(current) && Number.isFinite(previous)
          ? current - previous
          : null,
    };
  }
}
