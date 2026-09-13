/**
 * 地點展開內容：韓文名稱、地址（複製／給司機看／地圖）、營業時間、照片、備註、來源。
 * 文字優先，不把每個欄位都做成彩色標籤。
 */
import { useOverlays } from '../../app/OverlayContext';
import type { Area, ImageRef, Place, SourceRef } from '../../domain/types';
import { withBase } from '../../data/config';
import { PRECISION_LABEL, SOURCE_SUMMARY_LABEL, SOURCE_TYPE_LABEL, formatIsoForDisplay, summarizeSources } from '../../lib/format';
import { Button } from '../../ui/Button';
import { IconCopy, IconMapPin, IconTextLarge } from '../../ui/Icons';
import { InlineStatus } from '../../ui/Notice';
import { Tag } from '../../ui/Tag';
import { useCopyStatus } from '../tools/AddressDialog';
import styles from './PlaceDetails.module.css';

export function SourceList({ sources }: { sources: SourceRef[] }) {
  const summary = summarizeSources(sources);
  return (
    <div className={styles.block}>
      <div className={styles.label}>資料來源 · {SOURCE_SUMMARY_LABEL[summary]}</div>
      {sources.length === 0 ? (
        <div className={styles.muted}>無來源紀錄</div>
      ) : (
        <ul className={styles.sources}>
          {sources.map((s, i) => (
            <li key={i}>
              [{SOURCE_TYPE_LABEL[s.type]}] {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a> : s.label}
              {s.verifiedAt ? ` · 核對於 ${formatIsoForDisplay(s.verifiedAt)}` : ' · 未核對'}
              {s.note ? ` · ${s.note}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PlaceImages({ images }: { images: ImageRef[] }) {
  if (images.length === 0) return null;
  return (
    <div className={styles.block}>
      {images.map((img, i) => (
        <figure key={i} className={styles.block}>
          <img
            className={styles.image}
            src={withBase(img.src)}
            alt={img.alt}
            width={img.width}
            height={img.height}
            loading="lazy"
            decoding="async"
          />
          {(img.caption || img.credit) && (
            <figcaption className={styles.caption}>
              {img.caption}
              {img.credit ? `（${img.credit}）` : ''}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

interface PlaceDetailsProps {
  place: Place;
  area: Area | null;
  showSources?: boolean;
  /** 外層卡片已經有「地圖」「給司機看」時，這裡不重複顯示 */
  hideMap?: boolean;
  hideDriver?: boolean;
}

export function PlaceDetails({ place, area, showSources = true, hideMap = false, hideDriver = false }: PlaceDetailsProps) {
  const { openAddress, openMap } = useOverlays();
  const { status, copy } = useCopyStatus();
  const nameKo = place.name.ko;
  const addressKo = place.address.ko ?? place.address.en;
  const canShowAddress = (place.precision === 'exact' || place.precision === 'approximate') && addressKo;

  return (
    <div className={styles.wrap}>
      <div className={styles.block}>
        {nameKo && (
          <div className={styles.nameKo} lang="ko">
            {nameKo}
          </div>
        )}
        {place.name.en && <div className={styles.nameEn}>{place.name.en}</div>}
        <div className={styles.tagRow}>
          {area && <Tag tone="outline">{area.name.zh}{area.name.ko ? ` ${area.name.ko}` : ''}</Tag>}
          <Tag tone={place.precision === 'exact' ? 'outline' : 'warn'}>{PRECISION_LABEL[place.precision]}</Tag>
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.label}>地址</div>
        {canShowAddress ? (
          <div className={styles.address} lang="ko">
            {addressKo}
          </div>
        ) : (
          <div className={styles.muted}>
            {place.precision === 'unknown' ? '地址待確認' : '僅有區域位置，精確地址待確認'}
          </div>
        )}
        <div className={styles.actions}>
          {!hideMap && (
            <Button size="small" icon={<IconMapPin />} onClick={() => openMap(place.id)}>
              地圖
            </Button>
          )}
          {!hideDriver && (
            <Button size="small" icon={<IconTextLarge />} onClick={() => openAddress(place.id)}>
              給司機看
            </Button>
          )}
          {canShowAddress && (
            <Button size="small" icon={<IconCopy />} onClick={() => copy('地址', addressKo)}>
              複製地址
            </Button>
          )}
          {nameKo && (
            <Button size="small" icon={<IconCopy />} onClick={() => copy('名稱', nameKo)}>
              複製名稱
            </Button>
          )}
        </div>
        {status.kind !== 'idle' && <InlineStatus kind={status.kind}>{status.text}</InlineStatus>}
      </div>

      {place.hours && (
        <div className={styles.block}>
          <div className={styles.label}>營業時間</div>
          <div className={styles.text}>{place.hours}</div>
        </div>
      )}

      <PlaceImages images={place.images} />

      {place.notes && (
        <div className={styles.block}>
          <div className={styles.label}>地點備註</div>
          <div className={styles.text}>{place.notes}</div>
        </div>
      )}

      {showSources && <SourceList sources={place.sources} />}
    </div>
  );
}
