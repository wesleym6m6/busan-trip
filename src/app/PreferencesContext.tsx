/**
 * 本機偏好：動態效果開關、上次查看日期。
 * 動態效果的「實際生效」= 使用者開啟 且 系統未要求減少動態；結果反映到 <html data-motion>。
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppPreferences } from '../domain/types';
import { loadPreferences, savePreferences } from '../lib/preferences';

interface PreferencesContextValue {
  prefs: AppPreferences;
  /** 系統 prefers-reduced-motion */
  systemReducedMotion: boolean;
  /** 裝飾動畫是否實際生效 */
  motionEnabled: boolean;
  setMotion: (on: boolean) => void;
  setLastViewedDayId: (dayId: string | null) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    if (!('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AppPreferences>(() => loadPreferences());
  const systemReducedMotion = useSystemReducedMotion();
  const motionEnabled = prefs.motion && !systemReducedMotion;

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off';
  }, [motionEnabled]);

  const setMotion = useCallback((on: boolean) => setPrefs((p) => ({ ...p, motion: on })), []);
  const setLastViewedDayId = useCallback(
    (dayId: string | null) => setPrefs((p) => (p.lastViewedDayId === dayId ? p : { ...p, lastViewedDayId: dayId })),
    [],
  );

  const value = useMemo(
    () => ({ prefs, systemReducedMotion, motionEnabled, setMotion, setLastViewedDayId }),
    [prefs, systemReducedMotion, motionEnabled, setMotion, setLastViewedDayId],
  );
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences 必須在 PreferencesProvider 內使用');
  return ctx;
}
