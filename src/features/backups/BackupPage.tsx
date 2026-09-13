/**
 * 備案頁：尚未列入正式時間軸的餐廳、咖啡廳、室內景點等。
 * 區域／類型篩選；只有資料有 rainOk 標記時才提供「雨天可」篩選。
 * 備案與正式行程明確分開，不會自動插入時間軸。
 */
import { useId, useMemo, useState } from 'react';
import { useOverlays } from '../../app/OverlayContext';
import type { BackupCategory, BackupOption, TripDataset } from '../../domain/types';
import { BACKUP_CATEGORY_LABEL } from '../../lib/format';
import { Button } from '../../ui/Button';
import { IconChevronDown, IconMapPin } from '../../ui/Icons';
import { EmptyState } from '../../ui/Notice';
import { Tag } from '../../ui/Tag';
import { PlaceDetails, SourceList } from '../places/PlaceDetails';
import styles from './Backups.module.css';

const CATEGORY_ORDER: BackupCategory[] = ['food', 'cafe', 'indoor', 'sight', 'shop', 'other'];

function BackupCard({ backup, data }: { backup: BackupOption; data: TripDataset }) {
  const [expanded, setExpanded] = useState(false);
  const { openMap } = useOverlays();
  const id = useId();
  const place = data.placesById.get(backup.placeId);
  if (!place) return null;
  const area = place.areaId ? (data.areasById.get(place.areaId) ?? null) : null;

  return (
    <li className={styles.card}>
      <article aria-labelledby={`${id}-title`}>
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle} id={`${id}-title`}>
            {place.name.zh}
          </h3>
          {place.name.ko && (
            <div className={styles.cardKo} lang="ko">
              {place.name.ko}
            </div>
          )}
          <div className={styles.cardMeta}>
            {area && <Tag tone="outline">{area.name.zh}</Tag>}
            <Tag tone="neutral">{BACKUP_CATEGORY_LABEL[backup.category]}</Tag>
            {backup.rainOk === true && <Tag tone="primary">雨天可</Tag>}
            {backup.rainOk === false && <Tag tone="warn">雨天不宜</Tag>}
          </div>
          <p className={styles.cardSuitable}>{backup.suitableFor}</p>
        </div>
        <div className={styles.actions}>
          <Button size="small" icon={<IconMapPin />} onClick={() => openMap(place.id)}>
            地圖
          </Button>
          <Button
            size="small"
            variant="ghost"
            aria-expanded={expanded}
            aria-controls={`${id}-details`}
            icon={<IconChevronDown className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`} />}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '收合' : '詳情'}
          </Button>
        </div>
        {expanded && (
          <div className={styles.details} id={`${id}-details`}>
            <PlaceDetails place={place} area={area} showSources={false} hideMap />
            {backup.notes && (
              <div>
                <div className={styles.blockLabel}>備案備註</div>
                <div className={styles.text}>{backup.notes}</div>
              </div>
            )}
            <SourceList sources={[...backup.sources, ...place.sources]} />
          </div>
        )}
      </article>
    </li>
  );
}

export function BackupPage({ data }: { data: TripDataset }) {
  const [areaId, setAreaId] = useState<string | null>(null);
  const [category, setCategory] = useState<BackupCategory | null>(null);
  const [rainOnly, setRainOnly] = useState(false);

  const enriched = useMemo(
    () =>
      data.backups
        .map((b) => ({ backup: b, place: data.placesById.get(b.placeId) }))
        .filter((x): x is { backup: BackupOption; place: NonNullable<typeof x.place> } => x.place !== undefined),
    [data.backups, data.placesById],
  );

  const areaOptions = useMemo(() => {
    const ids = new Set(enriched.map((x) => x.place.areaId).filter((a): a is string => a !== null));
    return data.areas.filter((a) => ids.has(a.id));
  }, [enriched, data.areas]);
  const categoryOptions = useMemo(() => {
    const cats = new Set(enriched.map((x) => x.backup.category));
    return CATEGORY_ORDER.filter((c) => cats.has(c));
  }, [enriched]);
  const hasRainData = enriched.some((x) => x.backup.rainOk !== null);

  const filtered = enriched.filter(
    (x) =>
      (areaId === null || x.place.areaId === areaId) &&
      (category === null || x.backup.category === category) &&
      (!rainOnly || x.backup.rainOk === true),
  );

  const resetFilters = () => {
    setAreaId(null);
    setCategory(null);
    setRainOnly(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>備案</h1>
        <span className={styles.pageNote}>未排入正式行程的選項</span>
      </div>

      {enriched.length === 0 ? (
        <EmptyState title="目前沒有備案" body="資料檔中尚未整理備案地點。" />
      ) : (
        <>
          <div className={styles.filters} role="group" aria-label="篩選備案">
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>區域</span>
              <button type="button" className={`${styles.chip} ${areaId === null ? styles.chipOn : ''}`} aria-pressed={areaId === null} onClick={() => setAreaId(null)}>
                全部
              </button>
              {areaOptions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`${styles.chip} ${areaId === a.id ? styles.chipOn : ''}`}
                  aria-pressed={areaId === a.id}
                  onClick={() => setAreaId(areaId === a.id ? null : a.id)}
                >
                  {a.name.zh}
                </button>
              ))}
            </div>
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>類型</span>
              <button type="button" className={`${styles.chip} ${category === null ? styles.chipOn : ''}`} aria-pressed={category === null} onClick={() => setCategory(null)}>
                全部
              </button>
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.chip} ${category === c ? styles.chipOn : ''}`}
                  aria-pressed={category === c}
                  onClick={() => setCategory(category === c ? null : c)}
                >
                  {BACKUP_CATEGORY_LABEL[c]}
                </button>
              ))}
              {hasRainData && (
                <button type="button" className={`${styles.chip} ${rainOnly ? styles.chipOn : ''}`} aria-pressed={rainOnly} onClick={() => setRainOnly((v) => !v)}>
                  雨天可
                </button>
              )}
            </div>
            <div className={styles.count} role="status">
              {filtered.length} / {enriched.length} 個備案
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="沒有符合篩選的備案"
              body="換個區域或類型，或清除篩選。"
              action={
                <Button size="small" onClick={resetFilters}>
                  清除篩選
                </Button>
              }
            />
          ) : (
            <ul className={styles.list}>
              {filtered.map((x) => (
                <BackupCard key={x.backup.id} backup={x.backup} data={data} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
