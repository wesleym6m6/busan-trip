/**
 * 載入並提供行程資料。UI 只從這裡拿 TripDataset；載入／錯誤狀態也在這裡。
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadTripData, type LoadTripResult } from '../data/loadTrip';
import type { TripDataset } from '../domain/types';

export type TripDataState = { status: 'loading' } | LoadTripResult;

interface TripDataContextValue {
  state: TripDataState;
  reload: () => void;
}

const TripDataContext = createContext<TripDataContextValue | null>(null);

export function TripDataProvider({ children, initial }: { children: ReactNode; initial?: TripDataState }) {
  const [state, setState] = useState<TripDataState>(initial ?? { status: 'loading' });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (initial) return; // 測試可直接注入資料
    let cancelled = false;
    loadTripData().then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadToken, initial]);

  const reload = useCallback(() => {
    // 在事件處理中切回 loading，再以 token 觸發重新載入
    setState({ status: 'loading' });
    setReloadToken((t) => t + 1);
  }, []);

  return <TripDataContext.Provider value={{ state, reload }}>{children}</TripDataContext.Provider>;
}

export function useTripDataState(): TripDataContextValue {
  const ctx = useContext(TripDataContext);
  if (!ctx) throw new Error('useTripDataState 必須在 TripDataProvider 內使用');
  return ctx;
}

/** 只在資料已載入的頁面使用；未載入時丟錯，避免元件各自判斷。 */
export function useTripData(): TripDataset {
  const { state } = useTripDataState();
  if (state.status !== 'ok') throw new Error('useTripData 只能在資料載入完成後使用');
  return state.data;
}
