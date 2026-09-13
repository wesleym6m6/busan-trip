/**
 * 預約細節：狀態、場次、抵達要求、集合地點、分組、公開備註。
 * status 是預約本身的狀態；資料是否核對由來源另外表示。
 */
import type { ReservationInfo, TripDataset } from '../../domain/types';
import { formatTimePoint } from '../../lib/dates';
import { RESERVATION_STATUS_LABEL } from '../../lib/format';
import { Tag, type TagTone } from '../../ui/Tag';
import styles from './Itinerary.module.css';

export function reservationTone(status: ReservationInfo['status']): TagTone {
  switch (status) {
    case 'confirmed':
      return 'ok';
    case 'pending':
      return 'warn';
    case 'unknown':
      return 'neutral';
    case 'not-required':
      return 'outline';
  }
}

export function ReservationDetails({
  reservation,
  dayDate,
  data,
}: {
  reservation: ReservationInfo;
  dayDate: string;
  data: TripDataset;
}) {
  const meetingPlace = reservation.meetingPoint.placeId ? data.placesById.get(reservation.meetingPoint.placeId) : null;
  const session = formatTimePoint(reservation.sessionTime, dayDate);
  const arriveBy = formatTimePoint(reservation.arriveBy, dayDate);
  const meeting = [meetingPlace?.name.zh, reservation.meetingPoint.text].filter(Boolean).join(' · ');

  return (
    <div className={styles.reservation}>
      <div className={styles.reservationHead}>
        <span>預約</span>
        <Tag tone={reservationTone(reservation.status)}>{RESERVATION_STATUS_LABEL[reservation.status]}</Tag>
      </div>
      <dl className={styles.kv}>
        <dt>場次／搭乘</dt>
        <dd>{session ?? '待確認'}</dd>
        <dt>抵達要求</dt>
        <dd>
          {arriveBy ? `${arriveBy} 前抵達` : '未指定'}
          {reservation.arrivalRule ? `；${reservation.arrivalRule}` : ''}
        </dd>
        <dt>集合地點</dt>
        <dd>{meeting || '待確認'}</dd>
        <dt>分組</dt>
        <dd>
          {reservation.groups === null
            ? '尚未安排'
            : reservation.groups.length === 0
              ? '無分組'
              : reservation.groups.map((g) => `${g.label}：${g.members.join('、')}`).join('；')}
        </dd>
        {reservation.provider && (
          <>
            <dt>預約管道</dt>
            <dd>{reservation.provider}</dd>
          </>
        )}
        {reservation.publicNotes && (
          <>
            <dt>備註</dt>
            <dd>{reservation.publicNotes}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
