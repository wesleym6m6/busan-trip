/**
 * 大字地址模式（給司機看）。
 * - exact：顯示韓文名稱＋韓文地址，可複製。
 * - approximate：顯示地址但明確標示「大概位置」。
 * - area-only／unknown：只顯示名稱與區域，提示精確地址待確認，不顯示可誤認為門牌的文字。
 */
import { useState } from 'react';
import type { Area, Place } from '../../domain/types';
import { copyText } from '../../lib/clipboard';
import { PRECISION_LABEL } from '../../lib/format';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { IconCopy } from '../../ui/Icons';
import { InlineStatus, type InlineStatusKind } from '../../ui/Notice';
import { Tag } from '../../ui/Tag';
import styles from './AddressDialog.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  place: Place | null;
  area: Area | null;
}

export function useCopyStatus() {
  const [status, setStatus] = useState<{ kind: InlineStatusKind; text: string }>({ kind: 'idle', text: '' });
  const copy = async (label: string, text: string) => {
    const result = await copyText(text);
    setStatus(
      result === 'copied'
        ? { kind: 'ok', text: `已複製${label}` }
        : { kind: 'fail', text: `無法自動複製${label}，請長按文字選取後複製` },
    );
  };
  const reset = () => setStatus({ kind: 'idle', text: '' });
  return { status, copy, reset };
}

export function AddressDialog({ open, onClose, place, area }: Props) {
  const { status, copy, reset } = useCopyStatus();
  const handleClose = () => {
    reset();
    onClose();
  };
  if (!place) return <Dialog open={open} onClose={handleClose} title="地址">{null}</Dialog>;

  const nameKo = place.name.ko ?? place.name.en ?? place.name.zh;
  const addressKo = place.address.ko ?? place.address.en;
  const showAddress = (place.precision === 'exact' || place.precision === 'approximate') && addressKo;
  const areaLabel = area ? `${area.name.zh}${area.name.ko ? ` ${area.name.ko}` : ''}` : null;

  return (
    <Dialog open={open} onClose={handleClose} title="給司機看">
      <div className={styles.wrap}>
        <div className={styles.nameKo} lang="ko">
          {nameKo}
        </div>
        <div className={styles.zh}>{place.name.zh}{areaLabel ? ` · ${areaLabel}` : ''}</div>

        {showAddress ? (
          <>
            <div className={styles.addressKo} lang="ko">
              {addressKo}
            </div>
            {place.precision === 'approximate' && (
              <div className={styles.notice}>此為大概位置，不是門牌地址；請與司機確認目的地。</div>
            )}
          </>
        ) : (
          <div className={styles.notice}>
            精確地址待確認。目前只知道{areaLabel ? `區域（${areaLabel}）` : '大概區域'}，請勿當作門牌給司機。
          </div>
        )}

        <div className={styles.meta}>
          <Tag tone={place.precision === 'exact' ? 'primary' : 'warn'}>{PRECISION_LABEL[place.precision]}</Tag>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" icon={<IconCopy />} onClick={() => copy('名稱', nameKo)}>
            複製名稱
          </Button>
          <Button
            variant="primary"
            icon={<IconCopy />}
            disabled={!showAddress}
            onClick={() => showAddress && copy('地址', addressKo)}
          >
            複製地址
          </Button>
        </div>
        <InlineStatus kind={status.kind}>{status.text}</InlineStatus>
      </div>
    </Dialog>
  );
}
