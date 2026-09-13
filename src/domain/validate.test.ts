import { describe, expect, it } from 'vitest';
import demo from '../../public/data/demo/trip.json';
import type { TripDataFile } from './types';
import { validateTripData } from './validate';

/** 深拷貝並以契約型別看待，讓測試能改寫欄位。 */
function clone(v: unknown): TripDataFile {
  return JSON.parse(JSON.stringify(v)) as TripDataFile;
}

describe('validateTripData', () => {
  it('示範資料通過驗證且無錯誤', () => {
    const result = validateTripData(demo);
    expect(result.ok).toBe(true);
    expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    if (result.ok) {
      expect(result.data.placesById.size).toBe(demo.places.length);
      expect(result.data.days).toHaveLength(3);
    }
  });

  it('缺少必要欄位 → schema 錯誤', () => {
    const bad = clone(demo) as unknown as Record<string, unknown>;
    delete bad.trip;
    const result = validateTripData(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path.startsWith('trip'))).toBe(true);
  });

  it('重複 id 被偵測', () => {
    const bad = clone(demo);
    bad.places.push(JSON.parse(JSON.stringify(bad.places[0])));
    const result = validateTripData(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('重複的 id'))).toBe(true);
  });

  it('無效的地點引用被偵測', () => {
    const bad = clone(demo);
    bad.events[0]!.placeId = 'place-does-not-exist';
    const result = validateTripData(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('找不到地點 id'))).toBe(true);
  });

  it('事件未排入 sequence 是錯誤', () => {
    const bad = clone(demo);
    bad.days[0]!.sequence = bad.days[0]!.sequence.filter((s) => s.id !== 'ev-d1-arrival');
    const result = validateTripData(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('未排入任何一天'))).toBe(true);
  });

  it('時間格式與先後順序', () => {
    const bad = clone(demo);
    const ev = bad.events.find((e) => e.id === 'ev-d2-haeundae')!;
    ev.start = { time: '25:00' };
    let result = validateTripData(bad);
    expect(result.ok).toBe(false);

    const bad2 = clone(demo);
    const ev2 = bad2.events.find((e) => e.id === 'ev-d2-haeundae')!;
    ev2.start = { time: '12:00' };
    ev2.end = { time: '11:00' };
    result = validateTripData(bad2);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('結束時間早於開始時間'))).toBe(true);
  });

  it('跨日交通（arrive 帶明確日期）合法', () => {
    const result = validateTripData(demo);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const tr = result.data.transitsById.get('tr-d2-home')!;
      expect(tr.arrive?.date).toBe('2026-10-18');
    }
  });

  it('非法 URL 被拒絕', () => {
    const bad = clone(demo);
    bad.tools.officialLinks[0]!.url = 'javascript:alert(1)';
    const result = validateTripData(bad);
    expect(result.ok).toBe(false);
  });

  it('demo 來源不可有 verifiedAt', () => {
    const bad = clone(demo);
    bad.places[1]!.sources[0]!.verifiedAt = '2026-09-01T00:00:00+09:00';
    const result = validateTripData(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('不可有 verifiedAt'))).toBe(true);
  });

  it('production 模式不接受示範日期與 demo 來源', () => {
    const bad = clone(demo);
    bad.mode = 'production';
    const result = validateTripData(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('示範日期'))).toBe(true);
    expect(result.issues.some((i) => i.message.includes('demo 來源'))).toBe(true);
  });

  it('住宿 id 必須指向 kind=lodging 的地點', () => {
    const bad = clone(demo);
    bad.trip.lodgingPlaceIds = ['place-gwangalli-beach'];
    const result = validateTripData(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes('不是 lodging'))).toBe(true);
  });
});
