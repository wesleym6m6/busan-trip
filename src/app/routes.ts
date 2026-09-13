/**
 * Hash routing：#/itinerary/:dayId、#/backups、#/tools。
 * 用 hash 是為了 GitHub Pages 靜態部署下直接開啟／重新整理不需要伺服器 rewrite。
 */
import { useCallback, useEffect, useState } from 'react';

export type Page = 'itinerary' | 'backups' | 'tools';

export interface Route {
  page: Page;
  /** 只有 itinerary 有；null 表示未指定（由頁面決定預設日） */
  dayId: string | null;
}

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+/, '');
  const [first, second] = path.split('/').map((s) => decodeURIComponent(s));
  switch (first) {
    case 'backups':
      return { page: 'backups', dayId: null };
    case 'tools':
      return { page: 'tools', dayId: null };
    case 'itinerary':
      return { page: 'itinerary', dayId: second && second.length > 0 ? second : null };
    default:
      return { page: 'itinerary', dayId: null };
  }
}

export function buildHash(route: Route): string {
  if (route.page === 'itinerary') {
    return route.dayId ? `#/itinerary/${encodeURIComponent(route.dayId)}` : '#/itinerary';
  }
  return `#/${route.page}`;
}

/** 完整可分享網址（含 base 子路徑與 hash）。 */
export function buildShareUrl(route: Route): string {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}${buildHash(route)}`;
}

export function useHashRoute(): [Route, (route: Route, opts?: { replace?: boolean }) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next: Route, opts?: { replace?: boolean }) => {
    const hash = buildHash(next);
    if (window.location.hash === hash) return;
    if (opts?.replace) {
      history.replaceState(null, '', hash);
      setRoute(parseHash(hash));
    } else {
      window.location.hash = hash; // 觸發 hashchange
    }
  }, []);

  return [route, navigate];
}
