/**
 * 直式時間軸：依 DayPlan.sequence 依序渲染事件卡與交通段落。
 * 「接下來（依計畫）」只在所選日期等於 Asia/Seoul 今天時標示，且只標第一個尚未開始的事件。
 */
import type { DayPlan, TripDataset } from '../../domain/types';
import { timePointKey } from '../../lib/dates';
import { EmptyState } from '../../ui/Notice';
import { EventCard } from './EventCard';
import { TransitSegment } from './TransitSegment';
import styles from './Itinerary.module.css';

interface Props {
  day: DayPlan;
  data: TripDataset;
  /** Asia/Seoul 的現在（date/time），用來標示接下來的安排 */
  now: { date: string; time: string };
  /** 供截圖／測試：預設展開的事件 id */
  expandedEventId?: string | null;
}

export function findNextEventId(day: DayPlan, data: TripDataset, now: { date: string; time: string }): string | null {
  if (day.date !== now.date) return null;
  const nowKey = `${now.date}T${now.time}`;
  for (const item of day.sequence) {
    if (item.kind !== 'event') continue;
    const ev = data.eventsById.get(item.id);
    if (!ev || !ev.start) continue;
    if (timePointKey(ev.start, day.date) >= nowKey) return ev.id;
  }
  return null;
}

export function ItineraryTimeline({ day, data, now, expandedEventId = null }: Props) {
  if (day.sequence.length === 0) {
    return (
      <div className={styles.stateWrap}>
        <EmptyState title="這一天還沒有安排" body="正式行程確認後會在這裡顯示。" />
      </div>
    );
  }
  const nextId = findNextEventId(day, data, now);

  return (
    <ol className={styles.timeline} aria-label={`Day ${day.dayNumber} 時間軸`}>
      {day.sequence.map((item) => {
        if (item.kind === 'event') {
          const ev = data.eventsById.get(item.id);
          if (!ev) return null;
          return (
            <EventCard
              key={ev.id}
              event={ev}
              dayDate={day.date}
              data={data}
              isNext={ev.id === nextId}
              defaultExpanded={ev.id === expandedEventId}
            />
          );
        }
        const tr = data.transitsById.get(item.id);
        if (!tr) return null;
        return <TransitSegment key={tr.id} transit={tr} dayDate={day.date} data={data} />;
      })}
    </ol>
  );
}
