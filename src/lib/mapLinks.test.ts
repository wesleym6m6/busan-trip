import { describe, expect, it } from 'vitest';
import type { Area, Place } from '../domain/types';
import { buildMapLinks, buildSearchQuery } from './mapLinks';
import { formatMoney } from './format';

const area: Area = { id: 'area-haeundae', name: { zh: '海雲台', ko: '해운대', en: 'Haeundae' } };

function place(overrides: Partial<Place>): Place {
  return {
    id: 'p',
    kind: 'sight',
    name: { zh: '海雲台海水浴場', ko: '해운대해수욕장', en: null },
    areaId: area.id,
    address: { ko: '부산광역시 해운대구 해운대해변로 264', zh: null, en: null },
    precision: 'exact',
    coordinates: null,
    mapLinks: { naver: null, kakao: null, google: null },
    images: [],
    hours: null,
    notes: null,
    sources: [],
    ...overrides,
  };
}

describe('mapLinks', () => {
  it('精確地址 → 名稱 + 地址搜尋，並正確 encode', () => {
    const links = buildMapLinks(place({}), area);
    const naver = links.find((l) => l.provider === 'naver')!;
    expect(naver.kind).toBe('search');
    expect(naver.url).toBe(`https://map.naver.com/p/search/${encodeURIComponent('해운대해수욕장 부산광역시 해운대구 해운대해변로 264')}`);
    expect(naver.url).not.toContain(' ');
    const google = links.find((l) => l.provider === 'google')!;
    expect(google.url.startsWith('https://www.google.com/maps/search/?api=1&query=')).toBe(true);
  });

  it('有經核對連結時直接使用', () => {
    const links = buildMapLinks(place({ mapLinks: { naver: 'https://naver.me/abc', kakao: null, google: null } }), area);
    const naver = links.find((l) => l.provider === 'naver')!;
    expect(naver.kind).toBe('verified');
    expect(naver.url).toBe('https://naver.me/abc');
  });

  it('區域級位置只用區域 + 名稱，並標示僅區域位置', () => {
    const p = place({ precision: 'area-only', address: { ko: null, zh: null, en: null } });
    expect(buildSearchQuery(p, area)).toBe('해운대 해운대해수욕장');
    const links = buildMapLinks(p, area);
    expect(links.every((l) => l.note === '僅區域位置，非精確導航')).toBe(true);
  });

  it('有座標且精度足夠時 Google 用座標；區域級不用座標', () => {
    const exact = buildMapLinks(place({ coordinates: { lat: 35.1587, lng: 129.1604 } }), area);
    expect(exact.find((l) => l.provider === 'google')!.kind).toBe('coordinates');
    const areaOnly = buildMapLinks(place({ precision: 'area-only', coordinates: { lat: 35.1587, lng: 129.1604 } }), area);
    expect(areaOnly.find((l) => l.provider === 'google')!.kind).toBe('search');
  });
});

describe('formatMoney', () => {
  it('null 是待確認、0 是免費', () => {
    expect(formatMoney(null)).toBe('費用待確認');
    expect(formatMoney({ amount: 0, currency: 'KRW', note: null })).toBe('免費');
    expect(formatMoney({ amount: 12000, currency: 'KRW', note: null })).toBe('₩12,000');
  });
});
