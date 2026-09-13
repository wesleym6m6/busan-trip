/**
 * 可水平捲動的日期列。選取狀態用海藍實底；今天（Asia/Seoul）用邊框 + 「今天」標示。
 * 選取後自動捲到可視範圍；不會因時鐘更新而改變選取。
 */
import { useEffect, useRef } from 'react';
import type { DayPlan } from '../../domain/types';
import { formatMonthDay, weekdayZh } from '../../lib/dates';
import styles from './Itinerary.module.css';

interface Props {
  days: DayPlan[];
  selectedDayId: string;
  todayLocalDate: string;
  onSelect: (dayId: string) => void;
}

export function DateSelector({ days, selectedDayId, todayLocalDate, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = Array.from(listRef.current?.children ?? []).find(
      (c) => (c as HTMLElement).dataset.dayId === selectedDayId,
    ) as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
  }, [selectedDayId]);

  return (
    <div className={styles.dateBar}>
      <div className={styles.dateList} ref={listRef} role="tablist" aria-label="選擇日期">
        {days.map((day) => {
          const selected = day.id === selectedDayId;
          const isToday = day.date === todayLocalDate;
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={selected}
              data-day-id={day.id}
              className={[styles.dateItem, selected ? styles.dateItemSelected : '', isToday ? styles.dateItemToday : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(day.id)}
            >
              <span className={styles.dateItemDay}>
                DAY {day.dayNumber}
                {isToday && <span className={styles.todayDot}>今天</span>}
              </span>
              <span className={styles.dateItemDate}>{formatMonthDay(day.date)}</span>
              <span className={styles.dateItemWeekday}>週{weekdayZh(day.date)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
