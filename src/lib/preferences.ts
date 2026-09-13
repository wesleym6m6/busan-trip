/**
 * 僅存本機的偏好（localStorage）。不同步、不跨裝置；讀寫都包 try/catch，
 * 因為隱私模式或封鎖儲存時 localStorage 會拋錯。
 */
import { AppPreferencesSchema } from '../domain/schema';
import type { AppPreferences } from '../domain/types';

export const PREFS_STORAGE_KEY = 'busan-trip:prefs:v1';

export const DEFAULT_PREFERENCES: AppPreferences = {
  motion: true,
  lastViewedDayId: null,
};

export function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = AppPreferencesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: AppPreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // 無法儲存時靜默；偏好只影響本次瀏覽
  }
}

/** 海鷗每個瀏覽 session 只飛一次，用 sessionStorage 記錄。 */
export const GULL_SESSION_KEY = 'busan-trip:gull-shown';

export function hasGullFlownThisSession(): boolean {
  try {
    return sessionStorage.getItem(GULL_SESSION_KEY) === '1';
  } catch {
    return true; // 無法判斷時就不飛，避免每次重整都飛
  }
}

export function markGullFlown(): void {
  try {
    sessionStorage.setItem(GULL_SESSION_KEY, '1');
  } catch {
    // ignore
  }
}
