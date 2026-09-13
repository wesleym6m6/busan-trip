/**
 * 日期／時間工具。
 *
 * 原則：
 * - 行程時間一律以 Trip.timezone（Asia/Seoul）解讀；「今天」也用該時區判斷，不用裝置時區。
 * - 資料只存「當地日期 + HH:mm」，含 offset 的 ISO 字串由 toIsoWithOffset 推導。
 * - 不引入日期套件；Intl API 已足夠。
 */
import type { LocalDate, LocalTime, TimePoint } from '../domain/types';

export interface ZonedParts {
  date: LocalDate;
  time: LocalTime;
}

/** 取得某個時間點在指定時區的當地日期與時間。 */
export function getZonedParts(instant: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(fmt.formatToParts(instant).map((p) => [p.type, p.value]));
  // hourCycle h23 在部分舊版引擎會回傳 "24"，保險起見正規化
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
  };
}

/** 指定時區在某時間點的 UTC offset（分鐘）。Asia/Seoul 固定 +540，但保留通用計算。 */
export function getTimezoneOffsetMinutes(instant: Date, timeZone: string): number {
  const { date, time } = getZonedParts(instant, timeZone);
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const [hh, mm] = time.split(':').map(Number) as [number, number];
  const asUtc = Date.UTC(y, m - 1, d, hh, mm, instant.getUTCSeconds(), instant.getUTCMilliseconds());
  return Math.round((asUtc - instant.getTime()) / 60000);
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${sign}${hh}:${mm}`;
}

/**
 * 把「當地日期 + 當地時間」轉成含 offset 的 ISO 字串，例如 2026-10-16T14:30:00+09:00。
 * 先假設 offset 為 0 求出候選 instant，再用該 instant 的實際 offset 校正一次（無 DST 的時區一次即收斂）。
 */
export function toIsoWithOffset(localDate: LocalDate, localTime: LocalTime, timeZone: string): string {
  const [y, m, d] = localDate.split('-').map(Number) as [number, number, number];
  const [hh, mm] = localTime.split(':').map(Number) as [number, number];
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  const firstGuess = getTimezoneOffsetMinutes(new Date(naive), timeZone);
  // 用第一次推得的 instant 再查一次 offset；無 DST 的時區兩次相同
  const offset = getTimezoneOffsetMinutes(new Date(naive - firstGuess * 60000), timeZone);
  return `${localDate}T${localTime}:00${formatOffset(offset)}`;
}

/** 日期字串 → 星期（0=日 … 6=六），純日期計算，與時區無關。 */
export function weekdayIndex(localDate: LocalDate): number {
  const [y, m, d] = localDate.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六'] as const;

export function weekdayZh(localDate: LocalDate): string {
  return WEEKDAY_ZH[weekdayIndex(localDate)] ?? '';
}

/** "2026-10-16" → "10.16" */
export function formatMonthDay(localDate: LocalDate): string {
  const [, m, d] = localDate.split('-');
  return `${Number(m)}.${Number(d)}`;
}

/** "2026-10-16" → "10/16" */
export function formatMonthDaySlash(localDate: LocalDate): string {
  const [, m, d] = localDate.split('-');
  return `${Number(m)}/${Number(d)}`;
}

export function formatDateRange(start: LocalDate | null, end: LocalDate | null): string | null {
  if (!start && !end) return null;
  if (start && end) {
    const sameYear = start.slice(0, 4) === end.slice(0, 4);
    return sameYear
      ? `${start.slice(0, 4)}.${formatMonthDay(start)} – ${formatMonthDay(end)}`
      : `${start.replaceAll('-', '.')} – ${end.replaceAll('-', '.')}`;
  }
  return (start ?? end)!.replaceAll('-', '.');
}

/** 以 "YYYY-MM-DDTHH:mm" 形式比較（同時區可用字典序）。 */
export function timePointKey(tp: TimePoint, fallbackDate: LocalDate): string {
  return `${tp.date ?? fallbackDate}T${tp.time}`;
}

export function compareTimePoints(a: TimePoint, b: TimePoint, fallbackDate: LocalDate): number {
  const ka = timePointKey(a, fallbackDate);
  const kb = timePointKey(b, fallbackDate);
  return ka < kb ? -1 : ka > kb ? 1 : 0;
}

/**
 * 顯示用時間：同日只顯示 HH:mm；跨日顯示「翌日 HH:mm」或「M/D HH:mm」。
 * null → 「時間待確認」由呼叫端決定文案，這裡回傳 null。
 */
export function formatTimePoint(tp: TimePoint | null, dayDate: LocalDate): string | null {
  if (!tp) return null;
  const date = tp.date ?? dayDate;
  if (date === dayDate) return tp.time;
  const dayDiff = daysBetween(dayDate, date);
  if (dayDiff === 1) return `翌日 ${tp.time}`;
  return `${formatMonthDaySlash(date)} ${tp.time}`;
}

export function daysBetween(a: LocalDate, b: LocalDate): number {
  const toUtc = (s: LocalDate) => {
    const [y, m, d] = s.split('-').map(Number) as [number, number, number];
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}

/**
 * 從 URL 查詢字串讀取固定時間（僅供截圖／測試）：?now=2026-10-17T09:30:00+09:00
 * 無法解析時回傳 null，正常使用真實時間。
 */
export function parseFixedNow(search: string): Date | null {
  // 不用 URLSearchParams：它會把 offset 裡的 '+' 解成空白
  const m = /[?&]now=([^&]+)/.exec(search);
  if (!m?.[1]) return null;
  let raw: string;
  try {
    raw = decodeURIComponent(m[1]);
  } catch {
    return null;
  }
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : new Date(t);
}
