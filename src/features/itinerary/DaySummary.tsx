/**
 * 當日摘要：標題、區域、一句摘要、必要提醒（資料中的 reminders + 由預約自動產生的抵達提醒）、分享。
 */
import { useState } from 'react';
import { buildShareUrl } from '../../app/routes';
import type { DayPlan, TripDataset } from '../../domain/types';
import { copyText } from '../../lib/clipboard';
import { formatTimePoint } from '../../lib/dates';
import { RESERVATION_STATUS_LABEL } from '../../lib/format';
import { Button } from '../../ui/Button';
import { IconShare } from '../../ui/Icons';
import { InlineStatus, type InlineStatusKind } from '../../ui/Notice';
import { Tag } from '../../ui/Tag';
import { reservationTone } from './ReservationDetails';
import styles from './Itinerary.module.css';

export function DaySummary({ day, data }: { day: DayPlan; data: TripDataset }) {
  const [shareStatus, setShareStatus] = useState<{ kind: InlineStatusKind; text: string }>({ kind: 'idle', text: '' });
  const areas = day.areaIds.map((id) => data.areasById.get(id)?.name.zh).filter(Boolean).join(' · ');

  // 由預約自動產生的提醒：pending / confirmed 一律列出；unknown 只在有場次或抵達時間時列出
  const reservationReminders = day.sequence
    .filter((s) => s.kind === 'event')
    .map((s) => data.eventsById.get(s.id))
    .filter((ev) => {
      const r = ev?.reservation;
      if (!r || r.status === 'not-required') return false;
      return r.status !== 'unknown' || r.sessionTime !== null || r.arriveBy !== null;
    })
    .map((ev) => {
      const r = ev!.reservation!;
      const arrive = formatTimePoint(r.arriveBy, day.date);
      const session = formatTimePoint(r.sessionTime, day.date);
      const place = ev!.placeId ? data.placesById.get(ev!.placeId) : null;
      const title = ev!.title ?? place?.name.zh ?? '';
      const when = arrive ? `${arrive} 前抵達` : session ? `${session} 場次` : '時間待確認';
      return { id: ev!.id, text: `${when} · ${title}`, status: r.status };
    });

  const share = async () => {
    const url = buildShareUrl({ page: 'itinerary', dayId: day.id });
    const title = `${data.trip.name} Day ${day.dayNumber}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        setShareStatus({ kind: 'ok', text: '已開啟分享' });
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return; // 使用者取消
    }
    const result = await copyText(url);
    setShareStatus(
      result === 'copied' ? { kind: 'ok', text: '已複製此日網址' } : { kind: 'fail', text: `無法自動複製，網址：${url}` },
    );
  };

  return (
    <section className={styles.summary} aria-label="當日摘要">
      <div className={styles.summaryHead}>
        <div>
          <h2 className={styles.summaryTitle}>
            Day {day.dayNumber} · {day.title}
          </h2>
          {areas && <div className={styles.summaryAreas}>{areas}</div>}
        </div>
        <Button size="small" variant="ghost" className={styles.share} icon={<IconShare />} onClick={share} aria-label="分享此日">
          分享
        </Button>
      </div>
      {shareStatus.kind !== 'idle' && <InlineStatus kind={shareStatus.kind}>{shareStatus.text}</InlineStatus>}
      {day.summary && <p className={styles.summaryText}>{day.summary}</p>}
      {(day.reminders.length > 0 || reservationReminders.length > 0) && (
        <div className={styles.reminders}>
          <div className={styles.remindersTitle}>今日提醒</div>
          {reservationReminders.map((r) => (
            <div key={r.id} className={styles.reminderItem}>
              <span>{r.text}</span>
              <Tag tone={reservationTone(r.status)}>{RESERVATION_STATUS_LABEL[r.status]}</Tag>
            </div>
          ))}
          {day.reminders.map((r, i) => (
            <div key={i} className={styles.reminderItem}>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
