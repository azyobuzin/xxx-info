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

export const LOCAL_STATUS_COUNT_PROMQL = `{"__name__"="pleroma_instance_status_count","service"="xxx-prd"}`;

export const LOCAL_USER_COUNT_PROMQL = `{"__name__"="pleroma_instance_user_count","service"="xxx-prd"}`;

export const DOMAIN_COUNT_PROMQL = `{"__name__"="pleroma_instance_domain_count","service"="xxx-prd"}`;
