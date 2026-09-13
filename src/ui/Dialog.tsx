/**
 * 以原生 <dialog> 實作：showModal() 提供焦點限制、Esc 關閉、背景 inert。
 * 額外處理：關閉後焦點回到開啟前的元素、點背景關閉、開啟時鎖住 body 捲動。
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { IconClose } from './Icons';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 額外的標題列右側操作 */
  headerActions?: ReactNode;
}

export function Dialog({ open, onClose, title, children, headerActions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      restoreFocusTo.current = document.activeElement as HTMLElement | null;
      el.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => {
      document.body.style.overflow = '';
      restoreFocusTo.current?.focus?.();
      onClose();
    };
    // 原生 cancel（Esc）→ close 事件；我們統一在 close 事件收尾
    el.addEventListener('close', handleClose);
    return () => el.removeEventListener('close', handleClose);
  }, [onClose]);

  useEffect(() => () => {
    document.body.style.overflow = '';
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClick={(e) => {
        // 點在 backdrop（dialog 本身，而非內容）時關閉
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
          {headerActions}
          <Button variant="ghost" iconOnly aria-label="關閉" icon={<IconClose />} onClick={() => ref.current?.close()} />
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
