/**
 * 列舉值 → 繁中顯示文字，以及金額等格式化。集中在這裡避免文案散落。
 */
import type {
  BackupCategory,
  EventType,
  LocationPrecision,
  Money,
  ReservationStatus,
  SourceRef,
  TransitMode,
} from '../domain/types';

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmed: '預約已確認',
  pending: '預約待確認',
  unknown: '預約狀態未知',
  'not-required': '不需預約',
};

export const TRANSIT_MODE_LABEL: Record<TransitMode, string> = {
  walk: '步行',
  metro: '地鐵',
  bus: '公車',
  taxi: '計程車',
  train: '火車',
  'airport-bus': '機場巴士',
  'light-rail': '輕軌',
  ferry: '渡輪',
  car: '汽車',
  other: '其他',
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  sight: '景點',
  meal: '用餐',
  cafe: '咖啡',
  activity: '活動',
  transport: '交通',
  lodging: '住宿',
  free: '自由活動',
  note: '備註',
};

export const BACKUP_CATEGORY_LABEL: Record<BackupCategory, string> = {
  food: '餐廳',
  cafe: '咖啡廳',
  indoor: '室內',
  sight: '景點',
  shop: '購物',
  other: '其他',
};

export const PRECISION_LABEL: Record<LocationPrecision, string> = {
  exact: '精確地址',
  approximate: '大概位置',
  'area-only': '僅區域位置',
  unknown: '位置待確認',
};

export const SOURCE_TYPE_LABEL: Record<SourceRef['type'], string> = {
  official: '官方',
  'user-provided': '使用者提供',
  web: '網頁',
  demo: '示範',
  unverified: '未核對',
};

/** null → 未知（不可顯示免費）；0 → 免費；其他 → 金額。 */
export function formatMoney(money: Money | null): string {
  if (money === null) return '費用待確認';
  if (money.amount === 0) return '免費';
  const symbol: Record<Money['currency'], string> = { KRW: '₩', TWD: 'NT$', USD: 'US$', JPY: '¥' };
  const formatted = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(money.amount);
  return `${symbol[money.currency]}${formatted}${money.note ? `（${money.note}）` : ''}`;
}

/** 分鐘 → 「1 小時 20 分」；小於 60 → 「25 分」。 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} 分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} 小時` : `${h} 小時 ${m} 分`;
}

/** ISO 時間戳 → 「2026/9/13 18:30」（以 Asia/Seoul 顯示；用於資料更新時間）。 */
export function formatIsoForDisplay(iso: string, timeZone = 'Asia/Seoul'): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(t));
}

/** 來源狀態摘要：有任何 official / user-provided 且 verifiedAt 非空 → 已核對；否則未核對。 */
export function summarizeSources(sources: SourceRef[]): 'verified' | 'unverified' | 'demo' | 'none' {
  if (sources.length === 0) return 'none';
  if (sources.some((s) => s.verifiedAt !== null && (s.type === 'official' || s.type === 'user-provided'))) {
    return 'verified';
  }
  if (sources.every((s) => s.type === 'demo')) return 'demo';
  return 'unverified';
}

export const SOURCE_SUMMARY_LABEL = {
  verified: '資料已核對',
  unverified: '資料未核對',
  demo: '示範資料',
  none: '無來源紀錄',
} as const;
