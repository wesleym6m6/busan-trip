/**
 * 全站共用的覆蓋層：大字地址、地圖選單。任何卡片都可直接開啟，不必先切到工具頁。
 * 焦點返回由 Dialog 處理（關閉後回到開啟前的元素）。
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AddressDialog } from '../features/tools/AddressDialog';
import { MapMenuDialog } from '../features/tools/MapMenuDialog';
import type { TripDataset } from '../domain/types';

interface OverlayContextValue {
  openAddress: (placeId: string) => void;
  openMap: (placeId: string) => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

type OverlayState = { kind: 'none' } | { kind: 'address'; placeId: string } | { kind: 'map'; placeId: string };

export function OverlayProvider({ data, children }: { data: TripDataset; children: ReactNode }) {
  const [state, setState] = useState<OverlayState>({ kind: 'none' });
  const openAddress = useCallback((placeId: string) => setState({ kind: 'address', placeId }), []);
  const openMap = useCallback((placeId: string) => setState({ kind: 'map', placeId }), []);
  const close = useCallback(() => setState({ kind: 'none' }), []);
  const value = useMemo(() => ({ openAddress, openMap }), [openAddress, openMap]);

  const place = state.kind === 'none' ? null : (data.placesById.get(state.placeId) ?? null);
  const area = place?.areaId ? (data.areasById.get(place.areaId) ?? null) : null;

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <AddressDialog open={state.kind === 'address'} onClose={close} place={state.kind === 'address' ? place : null} area={area} />
      <MapMenuDialog open={state.kind === 'map'} onClose={close} place={state.kind === 'map' ? place : null} area={area} />
    </OverlayContext.Provider>
  );
}

export function useOverlays(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlays 必須在 OverlayProvider 內使用');
  return ctx;
}
