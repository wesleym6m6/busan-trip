/**
 * 工具頁：住宿、預約摘要、地點快速查、機場交通、官方連結、設定與資料版本。
 * 只顯示資料中存在的內容；沒有連結就不放按鈕。
 */
import { useOverlays } from '../../app/OverlayContext';
import { useTripDataState } from '../../app/TripDataContext';
import type { TripDataset } from '../../domain/types';
import { formatTimePoint } from '../../lib/dates';
import { PRECISION_LABEL, RESERVATION_STATUS_LABEL, TRANSIT_MODE_LABEL, formatIsoForDisplay, formatMinutes, formatMoney } from '../../lib/format';
import { Button, LinkButton } from '../../ui/Button';
import { IconExternal, IconMapPin, IconTextLarge } from '../../ui/Icons';
import { Card, EmptyState, Section } from '../../ui/Notice';
import { Tag } from '../../ui/Tag';
import { reservationTone } from '../itinerary/ReservationDetails';
import { MotionSettingsCard, MotionToggleButton } from './MotionSettings';
import styles from './ToolsPage.module.css';

function LodgingSection({ data }: { data: TripDataset }) {
  const { openAddress, openMap } = useOverlays();
  const lodgings = data.trip.lodgingPlaceIds.map((id) => data.placesById.get(id)).filter((p) => p !== undefined);
  return (
    <Section title="住宿" id="lodging">
      {lodgings.length === 0 ? (
        <EmptyState title="尚未提供住宿資料" body="住宿名稱與地址待使用者提供。" />
      ) : (
        lodgings.map((place) => {
          const area = place.areaId ? data.areasById.get(place.areaId) : null;
          const exact = place.precision === 'exact' && (place.address.ko || place.address.en);
          return (
            <Card key={place.id}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>{place.name.zh}</div>
                {place.name.ko && (
                  <div className={styles.rowKo} lang="ko">
                    {place.name.ko}
                  </div>
                )}
                <div className={styles.meta}>
                  {area && <span>{area.name.zh}{area.name.ko ? ` ${area.name.ko}` : ''}</span>}
                  <Tag tone={exact ? 'outline' : 'warn'}>{PRECISION_LABEL[place.precision]}</Tag>
                </div>
              </div>
              {exact ? (
                <div className={styles.rowBody} lang="ko" style={{ marginTop: 'var(--space-2)' }}>
                  {place.address.ko ?? place.address.en}
                </div>
              ) : (
                <div className={styles.notice} style={{ marginTop: 'var(--space-2)' }}>
                  精確地址待確認；目前只有區域位置，不提供司機用門牌畫面。
                </div>
              )}
              {place.notes && <div className={styles.rowBody} style={{ marginTop: 'var(--space-2)' }}>{place.notes}</div>}
              <div className={styles.rowActions}>
                <Button size="small" variant={exact ? 'primary' : 'secondary'} icon={<IconTextLarge />} onClick={() => openAddress(place.id)}>
                  給司機看
                </Button>
                <Button size="small" icon={<IconMapPin />} onClick={() => openMap(place.id)}>
                  地圖{exact ? '' : '（僅區域）'}
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </Section>
  );
}

function ReservationSection({ data }: { data: TripDataset }) {
  const days = [...data.days].sort((a, b) => a.dayNumber - b.dayNumber);
  const items = days.flatMap((day) =>
    day.sequence
      .filter((s) => s.kind === 'event')
      .map((s) => data.eventsById.get(s.id))
      .filter((ev) => {
        const r = ev?.reservation;
        if (!r || r.status === 'not-required') return false;
        // unknown 且沒有任何時間資訊的不列入摘要（與行程頁提醒規則一致）
        return r.status !== 'unknown' || r.sessionTime !== null || r.arriveBy !== null;
      })
      .map((ev) => ({ day, ev: ev! })),
  );
  return (
    <Section title="預約摘要" id="reservations">
      <Card>
        {items.length === 0 ? (
          <div className={styles.rowBody}>目前沒有需要預約的安排。</div>
        ) : (
          <ul className={styles.list}>
            {items.map(({ day, ev }) => {
              const r = ev.reservation!;
              const place = ev.placeId ? data.placesById.get(ev.placeId) : null;
              const meeting = [r.meetingPoint.placeId ? data.placesById.get(r.meetingPoint.placeId)?.name.zh : null, r.meetingPoint.text]
                .filter(Boolean)
                .join(' · ');
              return (
                <li key={ev.id} className={styles.reservationItem}>
                  <div className={styles.reservationTitle}>
                    <span>
                      Day {day.dayNumber} · {ev.title ?? place?.name.zh}
                    </span>
                    <Tag tone={reservationTone(r.status)}>{RESERVATION_STATUS_LABEL[r.status]}</Tag>
                  </div>
                  <div>場次：{formatTimePoint(r.sessionTime, day.date) ?? '待確認'}；抵達：{formatTimePoint(r.arriveBy, day.date) ? `${formatTimePoint(r.arriveBy, day.date)} 前` : '未指定'}</div>
                  <div>集合：{meeting || '待確認'}</div>
                  {r.publicNotes && <div className={styles.rowBody}>{r.publicNotes}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </Section>
  );
}

function PlaceQuickList({ data }: { data: TripDataset }) {
  const { openAddress, openMap } = useOverlays();
  // 只列行程中實際用到、且非住宿的地點，依 Day 出現順序
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const day of [...data.days].sort((a, b) => a.dayNumber - b.dayNumber)) {
    for (const item of day.sequence) {
      if (item.kind !== 'event') continue;
      const ev = data.eventsById.get(item.id);
      if (ev?.placeId && !seen.has(ev.placeId) && !data.trip.lodgingPlaceIds.includes(ev.placeId)) {
        seen.add(ev.placeId);
        ordered.push(ev.placeId);
      }
    }
  }
  const places = ordered.map((id) => data.placesById.get(id)).filter((p) => p !== undefined);
  return (
    <Section title="行程地點快速查" id="places">
      <Card>
        {places.length === 0 ? (
          <div className={styles.rowBody}>行程中尚無地點。</div>
        ) : (
          <ul>
            {places.map((p) => (
              <li key={p.id} className={styles.placeItem}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{p.name.zh}</div>
                  {p.name.ko && (
                    <div className={styles.rowKo} lang="ko">
                      {p.name.ko}
                    </div>
                  )}
                </div>
                <div className={styles.placeActions}>
                  <Button size="small" iconOnly aria-label={`${p.name.zh}：給司機看`} icon={<IconTextLarge />} onClick={() => openAddress(p.id)} />
                  <Button size="small" iconOnly aria-label={`${p.name.zh}：開啟地圖`} icon={<IconMapPin />} onClick={() => openMap(p.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Section>
  );
}

function AirportSection({ data }: { data: TripDataset }) {
  const { airportTransit, officialLinks } = data.tools;
  return (
    <>
      <Section title="機場交通" id="airport">
        {airportTransit.length === 0 ? (
          <EmptyState title="尚未整理機場交通" />
        ) : (
          airportTransit.map((o) => (
            <Card key={o.id}>
              <div className={styles.rowTitle}>
                {o.title}
                {!o.title.includes(TRANSIT_MODE_LABEL[o.mode]) && <span className={styles.rowKo}> · {TRANSIT_MODE_LABEL[o.mode]}</span>}
              </div>
              <div className={styles.rowBody} style={{ marginTop: 4 }}>
                {o.summary}
              </div>
              <div className={styles.meta} style={{ marginTop: 'var(--space-2)' }}>
                <span>{o.durationMinutes === null ? '時間待確認' : `${o.isEstimate ? '約 ' : ''}${formatMinutes(o.durationMinutes)}`}</span>
                <span>{formatMoney(o.cost)}</span>
                {o.isEstimate && <Tag tone="outline">估計</Tag>}
              </div>
              {o.link && (
                <div className={styles.rowActions}>
                  <LinkButton size="small" href={o.link.url} icon={<IconExternal />}>
                    {o.link.label}
                  </LinkButton>
                </div>
              )}
            </Card>
          ))
        )}
      </Section>
      <Section title="官方連結" id="links">
        {officialLinks.length === 0 ? (
          <EmptyState title="尚未整理官方連結" />
        ) : (
          <Card>
            <ul className={styles.list}>
              {officialLinks.map((l) => (
                <li key={l.url} className={styles.row}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>{l.label}</div>
                    {l.note && <div className={styles.rowBody}>{l.note}</div>}
                  </div>
                  <LinkButton size="small" href={l.url} icon={<IconExternal />} aria-label={`開啟 ${l.label}`}>
                    開啟
                  </LinkButton>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>
    </>
  );
}

function DataSection({ data }: { data: TripDataset }) {
  const { reload, state } = useTripDataState();
  const warnings = state.status === 'ok' ? state.warnings : [];
  return (
    <Section title="設定與資料" id="settings">
      <MotionSettingsCard />
      <Card>
        <dl className={styles.kv}>
          <dt>資料模式</dt>
          <dd>{data.mode === 'demo' ? '示範資料（demo）' : '正式資料（production）'}</dd>
          <dt>資料版本</dt>
          <dd>{data.dataVersion}</dd>
          <dt>最後更新</dt>
          <dd>{formatIsoForDisplay(data.updatedAt)}（Asia/Seoul）</dd>
          <dt>Schema</dt>
          <dd>v{data.schemaVersion}</dd>
          <dt>驗證警告</dt>
          <dd>{warnings.length === 0 ? '無' : `${warnings.length} 個（見主控台或 npm run validate:data）`}</dd>
        </dl>
        <div className={styles.rowActions}>
          <Button size="small" onClick={reload}>
            重新載入資料
          </Button>
        </div>
        <div className={styles.rowBody} style={{ marginTop: 'var(--space-3)' }}>
          偏好只存在這台裝置，不會同步給同行者；行程內容以重新部署的資料為準。
        </div>
      </Card>
    </Section>
  );
}

export function ToolsPage({ data }: { data: TripDataset }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>工具</h1>
        <MotionToggleButton />
      </div>
      <LodgingSection data={data} />
      <ReservationSection data={data} />
      <PlaceQuickList data={data} />
      <AirportSection data={data} />
      <DataSection data={data} />
    </div>
  );
}
