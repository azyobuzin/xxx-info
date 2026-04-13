import type {
  DailyUptime,
  MetricWithDiff,
} from "./metrics-query-service/index.ts";

export type { DailyUptime, MetricWithDiff };

export type UptimeSection = {
  /** 現在稼働中か */
  isUp: boolean;

  /** 1日ごとの稼働率 */
  dailyUptime: DailyUptime[];
};

export type UsageSection = {
  /** ローカルの投稿数と7日前との差分 */
  localStatusCount: MetricWithDiff;

  /** ローカルのユーザー数と7日前との差分 */
  localUserCount: MetricWithDiff;

  /** フェデレーションしているドメイン数と7日前との差分 */
  domainCount: MetricWithDiff;
};

export type PerformanceSection = {
  /** 過去24時間における1時間ごとのリクエスト数の時系列データ */
  requestCount: TimeSeriesData;

  /** 過去24時間における30分ごとのCPU使用率 (0〜1) の時系列データ */
  cpuUsage: TimeSeriesData;

  /** 過去24時間における30分ごとのメモリ使用率 (0〜1) の時系列データ */
  memoryUsage: TimeSeriesData;
};

export type TimeSeriesDataPoint = {
  /** タイムスタンプ (milliseconds since the epoch) */
  timestamp: number;

  /** 値 */
  value: number;
};

export type TimeSeriesData = {
  /** 最新の値 */
  latestValue: number;

  /** 時系列データのデータポイント */
  points: TimeSeriesDataPoint[];
};

export type InstanceStatusResponse = {
  uptimeSection: UptimeSection;
  usageSection: UsageSection;
  performanceSection: PerformanceSection;
};
