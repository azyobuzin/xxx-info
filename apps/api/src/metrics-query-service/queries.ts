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

export const REQUEST_COUNT_PROMQL = `sum(increase({"__name__"="pleroma_prom_ex_phoenix_http_requests_total"}[1h]))`;

// CPU時間から計算する → 平均値になる
export const CPU_USAGE_PROMQL = `sum(increase({"__name__"="workload.googleapis.com/system.cpu.time","monitored_resource"="generic_node","node_id"="v133-18-241-95","state"!="idle"}[30m])) / sum(increase({"__name__"="workload.googleapis.com/system.cpu.time","monitored_resource"="generic_node","node_id"="v133-18-241-95"}[30m]))`;

export const MEMORY_USAGE_PROMQL = `sum({"__name__"="workload.googleapis.com/system.memory.utilization","monitored_resource"="generic_node","node_id"="v133-18-241-95","state"=~"(used|slab_unreclaimable)"})`;

export const LATEST_CPU_USAGE_PROMQL = `sum({"__name__"="workload.googleapis.com/system.cpu.utilization","monitored_resource"="generic_node","node_id"="v133-18-241-95","state"!="idle"}) / sum({"__name__"="workload.googleapis.com/system.cpu.utilization","monitored_resource"="generic_node","node_id"="v133-18-241-95"})`;
