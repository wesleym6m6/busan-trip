/**
 * 「地圖」選單：列出可用的地圖入口（經核對連結 / 搜尋 / 座標），並標示區域級位置的限制。
 */
import type { Area, Place } from '../../domain/types';
import { buildMapLinks, buildSearchQuery } from '../../lib/mapLinks';
import { LinkButton } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { IconExternal } from '../../ui/Icons';
import { Tag } from '../../ui/Tag';
import styles from './AddressDialog.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  place: Place | null;
  area: Area | null;
}

export function MapMenuDialog({ open, onClose, place, area }: Props) {
  if (!place) return <Dialog open={open} onClose={onClose} title="開啟地圖">{null}</Dialog>;
  const options = buildMapLinks(place, area);
  const query = buildSearchQuery(place, area);
  const hasVerified = options.some((o) => o.kind === 'verified');

  return (
    <Dialog open={open} onClose={onClose} title={`開啟地圖：${place.name.zh}`}>
      <div className={styles.wrap}>
        {!hasVerified && (
          <div className={styles.mapNote}>
            尚無經核對的地圖連結，以下為搜尋入口，查詢字串：<span lang="ko">{query}</span>
          </div>
        )}
        {(place.precision === 'area-only' || place.precision === 'unknown') && (
          <div className={styles.notice}>僅區域位置：地圖只會定位到大概區域，不是精確導航。</div>
        )}
        <div className={styles.mapList}>
          {options.map((o) => (
            <LinkButton key={o.provider} href={o.url} variant={o.kind === 'verified' ? 'primary' : 'secondary'} icon={<IconExternal />}>
              {o.label}
              {o.kind === 'verified' && <Tag tone="ok">已核對</Tag>}
            </LinkButton>
          ))}
        </div>
        {options.some((o) => o.note) && (
          <div className={styles.mapNote}>
            {options
              .filter((o) => o.note)
              .map((o) => `${o.label}：${o.note}`)
              .join('；')}
          </div>
        )}
      </div>
    </Dialog>
  );
}
