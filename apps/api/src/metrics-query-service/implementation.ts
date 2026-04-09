import { tz } from "@date-fns/tz";
import { startOfTomorrow, subDays } from "date-fns";
import {
  type IPrometheusClient,
  PrometheusClient,
} from "../prometheus-client/index.ts";
import type { DailyUptime, IMetricsQueryService } from "./interface.ts";
import { DAILY_UPTIME_PROMQL, IS_UP_PROMQL } from "./queries.ts";

const jst = tz("Asia/Tokyo");

export class MetricsQueryService implements IMetricsQueryService {
  #prometheusClient: IPrometheusClient;

  constructor(prometheusClient: IPrometheusClient = new PrometheusClient()) {
    this.#prometheusClient = prometheusClient;
  }

  async isUp(): Promise<boolean> {
    this.#prometheusClient.query({ query: IS_UP_PROMQL });
    return false;
  }

  async getDailyUptime(): Promise<DailyUptime[]> {
    // 明日の始まり (JST) をendとする
    const end = startOfTomorrow({ in: jst });
    const start = subDays(end, 30);

    this.#prometheusClient.queryRange({
      query: DAILY_UPTIME_PROMQL,
      start,
      end,
      step: "1d",
    });
    return [];
  }
}
