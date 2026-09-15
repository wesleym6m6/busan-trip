import { AppShell } from './app/AppShell';
import { PreferencesProvider } from './app/PreferencesContext';
import { TripDataProvider, type TripDataState } from './app/TripDataContext';

/** 組合 providers；initialData 供測試直接注入資料。 */
export function LegacyApp({ initialData }: { initialData?: TripDataState }) {
  return (
    <PreferencesProvider>
      <TripDataProvider initial={initialData}>
        <AppShell />
      </TripDataProvider>
    </PreferencesProvider>
  );
}
