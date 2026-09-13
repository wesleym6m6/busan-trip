/**
 * 地圖連結集中在這裡建立；元件不得自行拼 URL。
 *
 * 規則：
 * - 有經核對的 place.mapLinks[provider] → 直接使用（kind: verified）。
 * - 否則提供「搜尋」入口（kind: search），以韓文名稱 + 韓文地址組查詢字串。
 * - 只有 Google 支援以座標開啟（官方 Maps URLs：?api=1&query=lat,lng）；Naver／Kakao 的座標 URL 未經核對，不使用。
 * - precision 為 area-only／unknown 時，note 明示「僅區域位置」，不假造精確導航。
 *
 * URL 格式依據（執行當時公開文件）：
 * - Google Maps URLs: https://developers.google.com/maps/documentation/urls/get-started
 * - Naver Map 網頁版搜尋路徑 /p/search/{query}、Kakao Map ?q={query} 為公開網頁行為，非官方 API 保證。
 */
import type { Area, Place } from '../domain/types';

export type MapProvider = 'naver' | 'kakao' | 'google';

export interface MapLinkOption {
  provider: MapProvider;
  label: string;
  url: string;
  kind: 'verified' | 'search' | 'coordinates';
  note: string | null;
}

export const MAP_PROVIDER_LABEL: Record<MapProvider, string> = {
  naver: 'Naver Map',
  kakao: 'Kakao Map',
  google: 'Google Maps',
};

/** 產生搜尋字串：優先韓文名稱；精確／大概位置再附韓文地址；區域級只用區域 + 名稱。 */
export function buildSearchQuery(place: Place, area: Area | null): string {
  const name = place.name.ko ?? place.name.en ?? place.name.zh;
  if (place.precision === 'exact' || place.precision === 'approximate') {
    const addr = place.address.ko ?? place.address.en;
    return addr ? `${name} ${addr}` : name;
  }
  const areaName = area?.name.ko ?? area?.name.en ?? area?.name.zh;
  return areaName ? `${areaName} ${name}` : name;
}

export function isAreaOnly(place: Place): boolean {
  return place.precision === 'area-only' || place.precision === 'unknown';
}

const AREA_ONLY_NOTE = '僅區域位置，非精確導航';

export function buildMapLinks(place: Place, area: Area | null): MapLinkOption[] {
  const query = buildSearchQuery(place, area);
  const q = encodeURIComponent(query);
  const areaNote = isAreaOnly(place) ? AREA_ONLY_NOTE : null;
  const options: MapLinkOption[] = [];

  const push = (provider: MapProvider, searchUrl: string) => {
    const verified = place.mapLinks[provider];
    if (verified) {
      options.push({ provider, label: MAP_PROVIDER_LABEL[provider], url: verified, kind: 'verified', note: null });
    } else {
      options.push({
        provider,
        label: `${MAP_PROVIDER_LABEL[provider]}（搜尋）`,
        url: searchUrl,
        kind: 'search',
        note: areaNote,
      });
    }
  };

  push('naver', `https://map.naver.com/p/search/${q}`);
  push('kakao', `https://map.kakao.com/?q=${q}`);

  // Google：有座標且精度足夠時用座標，否則搜尋
  const google = place.mapLinks.google;
  if (google) {
    options.push({ provider: 'google', label: MAP_PROVIDER_LABEL.google, url: google, kind: 'verified', note: null });
  } else if (place.coordinates && !isAreaOnly(place)) {
    const { lat, lng } = place.coordinates;
    options.push({
      provider: 'google',
      label: `${MAP_PROVIDER_LABEL.google}（座標）`,
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`,
      kind: 'coordinates',
      note: place.precision === 'approximate' ? '座標為大概位置' : null,
    });
  } else {
    options.push({
      provider: 'google',
      label: `${MAP_PROVIDER_LABEL.google}（搜尋）`,
      url: `https://www.google.com/maps/search/?api=1&query=${q}`,
      kind: 'search',
      note: areaNote,
    });
  }
  return options;
}
