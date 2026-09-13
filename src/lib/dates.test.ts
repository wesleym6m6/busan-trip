import { describe, expect, it } from 'vitest';
import {
  daysBetween,
  formatDateRange,
  formatTimePoint,
  getTimezoneOffsetMinutes,
  getZonedParts,
  parseFixedNow,
  toIsoWithOffset,
  weekdayZh,
} from './dates';

describe('dates（Asia/Seoul）', () => {
  it('以行程時區決定當地日期，不用裝置時區', () => {
    // UTC 2026-10-16 16:30 = 首爾 10-17 01:30
    const instant = new Date('2026-10-16T16:30:00Z');
    expect(getZonedParts(instant, 'Asia/Seoul')).toEqual({ date: '2026-10-17', time: '01:30' });
    expect(getZonedParts(instant, 'Asia/Taipei')).toEqual({ date: '2026-10-17', time: '00:30' });
    expect(getZonedParts(instant, 'UTC')).toEqual({ date: '2026-10-16', time: '16:30' });
  });

  it('首爾 offset 為 +540 分鐘', () => {
    expect(getTimezoneOffsetMinutes(new Date('2026-10-16T00:00:00Z'), 'Asia/Seoul')).toBe(540);
  });

  it('當地日期時間 → 含 offset 的 ISO', () => {
    expect(toIsoWithOffset('2026-10-16', '14:30', 'Asia/Seoul')).toBe('2026-10-16T14:30:00+09:00');
    expect(toIsoWithOffset('2026-10-16', '00:05', 'Asia/Seoul')).toBe('2026-10-16T00:05:00+09:00');
  });

  it('星期與日期範圍', () => {
    expect(weekdayZh('2026-10-16')).toBe('五');
    expect(weekdayZh('2026-10-18')).toBe('日');
    expect(formatDateRange('2026-10-16', '2026-10-18')).toBe('2026.10.16 – 10.18');
    expect(formatDateRange(null, null)).toBeNull();
  });

  it('跨日時間顯示「翌日」', () => {
    expect(formatTimePoint({ time: '09:15' }, '2026-10-17')).toBe('09:15');
    expect(formatTimePoint({ date: '2026-10-18', time: '00:05' }, '2026-10-17')).toBe('翌日 00:05');
    expect(formatTimePoint({ date: '2026-10-19', time: '08:00' }, '2026-10-17')).toBe('10/19 08:00');
    expect(formatTimePoint(null, '2026-10-17')).toBeNull();
    expect(daysBetween('2026-10-17', '2026-10-19')).toBe(2);
  });

  it('?now= 只接受可解析的時間', () => {
    expect(parseFixedNow('?now=2026-10-17T09:30:00+09:00')?.toISOString()).toBe('2026-10-17T00:30:00.000Z');
    expect(parseFixedNow('?now=nope')).toBeNull();
    expect(parseFixedNow('')).toBeNull();
  });
});
