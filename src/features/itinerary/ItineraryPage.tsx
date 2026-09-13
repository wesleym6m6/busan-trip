/**
 * 行程頁：頁首 → 日期列（sticky） → 當日摘要 → 時間軸。
 * 預設日期：網址指定 > Asia/Seoul 今天（在行程內） > 上次查看 > Day 1。
 * 時鐘更新只影響「接下來」標示，不改變選取日期。
 */
import { useEffect, useMemo, useState } from 'react';
import { usePreferences } from '../../app/PreferencesContext';
import type { Route } from '../../app/routes';
import { useNow } from '../../app/useNow';
import type { TripDataset } from '../../domain/types';
import { getZonedParts } from '../../lib/dates';
import { EmptyState } from '../../ui/Notice';
import { DateSelector } from './DateSelector';
import { DaySummary } from './DaySummary';
import { ItineraryTimeline } from './ItineraryTimeline';
import { TripHeader } from './TripHeader';

interface Props {
  data: TripDataset;
  route: Route;
  navigate: (route: Route, opts?: { replace?: boolean }) => void;
}

export function ItineraryPage({ data, route, navigate }: Props) {
  const { prefs, setLastViewedDayId } = usePreferences();
  const now = useNow();
  const nowParts = getZonedParts(now, data.trip.timezone);
  const days = useMemo(() => [...data.days].sort((a, b) => a.dayNumber - b.dayNumber), [data.days]);

  // 只在首次進入時決定預設日，之後由網址控制；避免時鐘更新或偏好變動把使用者拉回今天
  const [defaultDayId] = useState<string | null>(() => {
    const today = days.find((d) => d.date === nowParts.date);
    const last = prefs.lastViewedDayId ? days.find((d) => d.id === prefs.lastViewedDayId) : undefined;
    return (today ?? last ?? days[0])?.id ?? null;
  });

  const routeDayValid = route.dayId !== null && data.daysById.has(route.dayId);
  const selectedDayId = routeDayValid ? route.dayId! : defaultDayId;
  const selectedDay = selectedDayId ? data.daysById.get(selectedDayId) : undefined;

  useEffect(() => {
    if (selectedDayId) setLastViewedDayId(selectedDayId);
  }, [selectedDayId, setLastViewedDayId]);

  // 截圖／測試用：?expand=<eventId> 預設展開指定卡片
  const expandedEventId = useMemo(() => new URLSearchParams(window.location.search).get('expand'), []);

  return (
    <>
      <TripHeader data={data} />
      {days.length === 0 || !selectedDay ? (
        <EmptyState title="尚無行程資料" body="資料檔中沒有任何一天的安排。" />
      ) : (
        <>
          <DateSelector
            days={days}
            selectedDayId={selectedDay.id}
            todayLocalDate={nowParts.date}
            onSelect={(dayId) => navigate({ page: 'itinerary', dayId })}
          />
          {route.dayId !== null && !routeDayValid && (
            <div style={{ paddingTop: 'var(--space-3)' }}>
              <EmptyState title="找不到網址指定的日期" body={`已改顯示 Day ${selectedDay.dayNumber}。`} />
            </div>
          )}
          <DaySummary day={selectedDay} data={data} />
          <ItineraryTimeline day={selectedDay} data={data} now={nowParts} expandedEventId={expandedEventId} />
        </>
      )}
    </>
  );
}
