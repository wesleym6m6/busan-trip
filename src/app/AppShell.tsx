/**
 * AppShell：載入狀態 → 頁面路由 → 底部導覽。資料錯誤時顯示明確狀態與重試，不 fallback 到示範資料。
 */
import { useEffect } from 'react';
import { BackupPage } from '../features/backups/BackupPage';
import { ItineraryPage } from '../features/itinerary/ItineraryPage';
import { ToolsPage } from '../features/tools/ToolsPage';
import { Button } from '../ui/Button';
import { ErrorBanner, LoadingState } from '../ui/Notice';
import { BottomNav } from './BottomNav';
import { OverlayProvider } from './OverlayContext';
import { usePreferences } from './PreferencesContext';
import { useHashRoute } from './routes';
import { SeaBackdrop } from './SeaBackdrop';
import { useTripDataState } from './TripDataContext';
import styles from './AppShell.module.css';

const PAGE_TITLE = { itinerary: '行程', backups: '備案', tools: '工具' } as const;

export function AppShell() {
  const { state, reload } = useTripDataState();
  const [route, navigate] = useHashRoute();
  const { prefs } = usePreferences();

  useEffect(() => {
    const tripName = state.status === 'ok' ? state.data.trip.name : '釜山行程';
    document.title = `${PAGE_TITLE[route.page]} · ${tripName}`;
  }, [route.page, state]);

  // 切換頁面時捲回頂部（同頁切日期不捲動，避免打斷閱讀）
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route.page]);

  if (state.status === 'loading') {
    return (
      <div className={styles.shell}>
        <SeaBackdrop />
        <main className={styles.main}>
          <LoadingState />
        </main>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.shell}>
        <SeaBackdrop />
        <main className={styles.main}>
          <div className={styles.stateWrap}>
            <ErrorBanner
              title="無法載入行程資料"
              message={`${state.message}（模式：${state.config.mode}，檔案：${state.config.path}）`}
              issues={state.issues}
              action={
                <div>
                  <Button size="small" onClick={reload}>
                    重試
                  </Button>
                </div>
              }
            />
          </div>
        </main>
      </div>
    );
  }

  const data = state.data;
  // 底部導覽的「行程」連結保留最近查看的日期
  const candidateDayId = route.page === 'itinerary' ? route.dayId : prefs.lastViewedDayId;
  const itineraryDayId = candidateDayId && data.daysById.has(candidateDayId) ? candidateDayId : null;

  return (
    <OverlayProvider data={data}>
      <div className={styles.shell}>
        <SeaBackdrop />
        {data.mode === 'demo' && route.page !== 'itinerary' && (
          <div className={styles.demoBar}>示範資料：內容僅供展示，時間與地址未核對</div>
        )}
        <main className={styles.main}>
          {route.page === 'itinerary' && <ItineraryPage data={data} route={route} navigate={navigate} />}
          {route.page === 'backups' && <BackupPage data={data} />}
          {route.page === 'tools' && <ToolsPage data={data} />}
        </main>
        <BottomNav current={route.page} itineraryDayId={itineraryDayId} />
      </div>
    </OverlayProvider>
  );
}
