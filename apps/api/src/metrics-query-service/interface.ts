export interface IMetricsQueryService {
  /** 現在稼働中かを取得します。 */
  isUp(): Promise<boolean>;

  /** 1日ごとの稼働率を30日分返します。 */
  getDailyUptime(): Promise<DailyUptime[]>;
}

export type DailyUptime = {
  /** 日付 yyyy-MM-dd */
  date: string;

  /** 稼働率 0〜1 */
  uptimeRate: number;
};
