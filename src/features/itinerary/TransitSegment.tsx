/**
 * 交通段落：起點、終點、方式、時間、緩衝。估計值標「約」，缺資料顯示待確認。
 */
import type { TransitEndpoint, TransitLeg, TripDataset } from '../../domain/types';
import { formatTimePoint } from '../../lib/dates';
import { TRANSIT_MODE_LABEL, formatMinutes, formatMoney } from '../../lib/format';
import { IconTransit, IconWalk } from '../../ui/Icons';
import { Tag } from '../../ui/Tag';
import styles from './Itinerary.module.css';

function endpointLabel(ep: TransitEndpoint, data: TripDataset): string {
  if (ep.placeId) return data.placesById.get(ep.placeId)?.name.zh ?? ep.text ?? '—';
  return ep.text ?? '—';
}

export function TransitSegment({ transit, dayDate, data }: { transit: TransitLeg; dayDate: string; data: TripDataset }) {
  const depart = formatTimePoint(transit.depart, dayDate);
  const arrive = formatTimePoint(transit.arrive, dayDate);
  const Icon = transit.mode === 'walk' ? IconWalk : IconTransit;
  const durationText =
    transit.durationMinutes === null
      ? '時間待確認'
      : `${transit.isEstimate ? '約 ' : ''}${formatMinutes(transit.durationMinutes)}`;

  return (
    <li className={`${styles.node} ${styles.transit}`}>
      <Icon className={styles.transitIcon} />
      <div className={styles.transitMain}>
        <div className={styles.transitLine}>
          {TRANSIT_MODE_LABEL[transit.mode]}
          {transit.label ? ` · ${transit.label}` : ''}
        </div>
        <div>
          {endpointLabel(transit.from, data)} → {endpointLabel(transit.to, data)}
        </div>
        <div className={styles.transitMeta}>
          {(depart || arrive) && (
            <span>
              {depart ?? '?'} – {arrive ?? '?'}
            </span>
          )}
          <span>{durationText}</span>
          {transit.bufferMinutes !== null && <span>+ 緩衝 {formatMinutes(transit.bufferMinutes)}</span>}
          {transit.cost !== null && <span>{formatMoney(transit.cost)}</span>}
          {transit.isEstimate && <Tag tone="outline">估計</Tag>}
        </div>
        {transit.notes && <div>{transit.notes}</div>}
      </div>
    </li>
  );
}
