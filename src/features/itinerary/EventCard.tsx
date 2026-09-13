/**
 * 事件卡。收合：時間、名稱、一句摘要、必要標籤、主要操作。
 * 展開：韓文名稱、地址、照片、補充說明、預約、攻略、來源。
 */
import { useId, useState } from 'react';
import { useOverlays } from '../../app/OverlayContext';
import type { ItineraryEvent, TripDataset } from '../../domain/types';
import { formatTimePoint } from '../../lib/dates';
import { EVENT_TYPE_LABEL, RESERVATION_STATUS_LABEL, formatMoney } from '../../lib/format';
import { Button } from '../../ui/Button';
import { IconChevronDown, IconMapPin, IconTextLarge } from '../../ui/Icons';
import { Tag } from '../../ui/Tag';
import { PlaceDetails, SourceList } from '../places/PlaceDetails';
import { ReservationDetails, reservationTone } from './ReservationDetails';
import styles from './Itinerary.module.css';

interface Props {
  event: ItineraryEvent;
  dayDate: string;
  data: TripDataset;
  isNext: boolean;
  defaultExpanded?: boolean;
}

export function EventCard({ event, dayDate, data, isNext, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { openAddress, openMap } = useOverlays();
  const detailsId = useId();

  const place = event.placeId ? (data.placesById.get(event.placeId) ?? null) : null;
  const area = place?.areaId ? (data.areasById.get(place.areaId) ?? null) : null;
  const title = event.title ?? place?.name.zh ?? '（未命名）';
  const start = formatTimePoint(event.start, dayDate);
  const end = formatTimePoint(event.end, dayDate);
  const arriveBy = formatTimePoint(event.arriveBy, dayDate);
  const showDriver = place && (event.toolLinks.includes('address-large') || event.toolLinks.includes('lodging'));
  const reservation = event.reservation;
  const guides = event.guideIds.map((id) => data.guidesById.get(id)).filter((g) => g !== undefined);
  const showCost = event.cost !== null || event.type === 'activity';

  return (
    <li className={`${styles.node} ${isNext ? styles.nodeNext : ''}`}>
      <article className={`${styles.card} ${isNext ? styles.cardNext : ''}`} aria-labelledby={`${detailsId}-title`}>
        <div className={styles.cardHead}>
          <div className={styles.timeRow}>
            {start ? (
              <span className={styles.time}>
                {start}
                {end ? ` – ${end}` : ''}
              </span>
            ) : (
              <span className={styles.timeUnknown}>時間待確認</span>
            )}
            {arriveBy && <span className={styles.muted}>{arriveBy} 前抵達</span>}
            {isNext && <span className={styles.nextLabel}>接下來（依計畫）</span>}
          </div>
          <h3 className={styles.title} id={`${detailsId}-title`}>
            {title}
          </h3>
          <p className={styles.summaryLine}>{event.summary}</p>
          {(area || event.tags.length > 0 || (reservation && reservation.status !== 'not-required')) && (
            <div className={styles.tags}>
              {area && <Tag tone="outline">{area.name.zh}</Tag>}
              {event.type === 'lodging' && <Tag tone="outline">{EVENT_TYPE_LABEL.lodging}</Tag>}
              {event.tags.map((t) => (
                <Tag key={t} tone="neutral">
                  {t}
                </Tag>
              ))}
              {reservation && reservation.status !== 'not-required' && (
                <Tag tone={reservationTone(reservation.status)}>{RESERVATION_STATUS_LABEL[reservation.status]}</Tag>
              )}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {place && (
            <Button size="small" icon={<IconMapPin />} onClick={() => openMap(place.id)}>
              地圖
            </Button>
          )}
          {showDriver && (
            <Button size="small" icon={<IconTextLarge />} onClick={() => openAddress(place.id)}>
              給司機看
            </Button>
          )}
          <Button
            size="small"
            variant="ghost"
            aria-expanded={expanded}
            aria-controls={detailsId}
            icon={<IconChevronDown className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`} />}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '收合' : '詳情'}
          </Button>
        </div>

        {expanded && (
          <div className={styles.details} id={detailsId}>
            {place && <PlaceDetails place={place} area={area} showSources={false} hideMap hideDriver={Boolean(showDriver)} />}

            {event.notes && (
              <div className={styles.block}>
                <div className={styles.blockLabel}>補充說明</div>
                <div className={styles.text}>{event.notes}</div>
              </div>
            )}

            {showCost && (
              <div className={styles.block}>
                <div className={styles.blockLabel}>費用</div>
                <div className={styles.text}>{formatMoney(event.cost)}</div>
              </div>
            )}

            {reservation && <ReservationDetails reservation={reservation} dayDate={dayDate} data={data} />}

            {guides.length > 0 && (
              <div className={styles.block}>
                <div className={styles.blockLabel}>相關攻略</div>
                {guides.map((g) => (
                  <div key={g.id} className={styles.guide}>
                    <div className={styles.guideTitle}>{g.title}</div>
                    <div className={styles.text}>{g.body}</div>
                  </div>
                ))}
              </div>
            )}

            <SourceList sources={[...event.sources, ...(place?.sources ?? [])]} />
          </div>
        )}
      </article>
    </li>
  );
}
