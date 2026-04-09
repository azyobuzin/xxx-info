/** @file 実行するPromQLの定義 */

const UPTIME_SELECTOR = `
  {
    "__name__"="monitoring.googleapis.com/uptime_check/check_passed",
    "monitored_resource"="uptime_url",
    "checked_resource_id"="xxx.azyobuzi.net"
  }`;

// 複数リージョンからのデータがあるため、平均を取る
export const IS_UP_PROMQL = `avg(${UPTIME_SELECTOR})`;

export const DAILY_UPTIME_PROMQL = `avg(avg_over_time(${UPTIME_SELECTOR}[1d]))`;
