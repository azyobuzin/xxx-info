export interface IMetricsQueryService {
  /** 現在稼働中かを取得します。 */
  isUp(): Promise<boolean>;

  /** 1日ごとの稼働率を30日分返します。 */
  getDailyUptime(): Promise<DailyUptime[]>;

  /** ローカルの投稿数と7日前との差分を取得します。 */
  getLocalStatusCount(): Promise<MetricWithDiff>;

  /** ローカルのユーザー数と7日前との差分を取得します。 */
  getLocalUserCount(): Promise<MetricWithDiff>;

  /** フェデレーションしているドメイン数と7日前との差分を取得します。 */
  getDomainCount(): Promise<MetricWithDiff>;

  /** 過去24時間における1時間ごとのリクエスト数の時系列データを取得します。 */
  getRequestCountTimeSeries(): Promise<TimeSeriesDataPoint[]>;

  /** 過去24時間における30分ごとのCPU使用率 (0〜1) を取得します。 */
  getCpuUsageTimeSeries(): Promise<TimeSeriesDataPoint[]>;

  /** 過去24時間における30分ごとのメモリ使用率 (0〜1) を取得します。 */
  getMemoryUsageTimeSeries(): Promise<TimeSeriesDataPoint[]>;
}

export type DailyUptime = {
  /** 日付 yyyy-MM-dd */
  date: string;

  /** 稼働率 0〜1 */
  uptimeRate: number;
};

export type MetricWithDiff = {
  /** メトリクスの値 */
  value: number;

  /** 一定期間前との差分（前回の値がない場合はnull） */
  diff: number | null;
};

export type TimeSeriesDataPoint = {
  /** タイムスタンプ */
  timestamp: Date;

  /** 値 */
  value: number;
};
