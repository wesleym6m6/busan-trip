/**
 * 目前時間（每分鐘更新一次）。?now=ISO 可固定時間，供截圖與測試；正式使用不受影響。
 * 更新只影響「依計畫接下來」的標示，不會改變使用者選取的日期。
 */
import { useEffect, useState } from 'react';
import { parseFixedNow } from '../lib/dates';

export function useNow(intervalMs = 60_000): Date {
  const [fixed] = useState<Date | null>(() => parseFixedNow(window.location.search));
  const [now, setNow] = useState<Date>(() => fixed ?? new Date());

  useEffect(() => {
    if (fixed) return;
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [fixed, intervalMs]);

  return now;
}
