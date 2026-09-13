/**
 * 頁首：BUSAN 小標、旅行名稱、日期、示範標籤、動態開關。
 * 廣安大橋線稿、海面動畫與海鷗都在全頁背景 app/SeaBackdrop.tsx（大橋位於頁首後方）。
 */
import type { TripDataset } from '../../domain/types';
import { formatDateRange } from '../../lib/dates';
import { Tag } from '../../ui/Tag';
import { MotionToggleButton } from '../tools/MotionSettings';
import styles from './TripHeader.module.css';

export function TripHeader({ data }: { data: TripDataset }) {
  const days = [...data.days].sort((a, b) => a.dayNumber - b.dayNumber);
  const first = days[0];
  const last = days[days.length - 1];
  const official = formatDateRange(data.trip.startDate, data.trip.endDate);
  const derived = first && last ? formatDateRange(first.date, last.date) : null;
  const allDemoDates = days.length > 0 && days.every((d) => d.isDemoDate);

  return (
    <header className={styles.header}>
      <div className={styles.textBlock}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrow}>{data.trip.shortName}</span>
          {data.mode === 'demo' && <Tag tone="neutral">示範資料</Tag>}
        </div>
        <h1 className={styles.title}>{data.trip.name}</h1>
        <div className={styles.meta}>
          <span>{official ?? derived ?? '日期待確認'}</span>
          {days.length > 0 && <span>· {days.length} 天</span>}
        </div>
        {!official && derived && allDemoDates && <div className={styles.metaNote}>示範日期，正式日期待確認</div>}
      </div>
      <div className={styles.sideBlock}>
        <MotionToggleButton className={styles.motionToggle} />
      </div>
    </header>
  );
}
