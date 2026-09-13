/**
 * 動態效果開關：頁首的小按鈕與工具頁的設定卡共用同一個偏好。
 * 偏好只存本機；系統 prefers-reduced-motion 時一律靜態並說明原因。
 */
import { usePreferences } from '../../app/PreferencesContext';
import { Button } from '../../ui/Button';
import { IconMotion } from '../../ui/Icons';
import { Card } from '../../ui/Notice';
import styles from './ToolsPage.module.css';

export function MotionToggleButton({ className }: { className?: string }) {
  const { prefs, systemReducedMotion, setMotion } = usePreferences();
  const label = prefs.motion ? '動態效果：開（點擊關閉）' : '動態效果：關（點擊開啟）';
  return (
    <Button
      variant="ghost"
      size="small"
      className={className}
      aria-pressed={prefs.motion}
      aria-label={label}
      title={systemReducedMotion ? '系統已要求減少動態，裝飾動畫維持靜態' : label}
      icon={<IconMotion />}
      onClick={() => setMotion(!prefs.motion)}
    >
      {prefs.motion ? '動態 開' : '動態 關'}
    </Button>
  );
}

export function MotionSettingsCard() {
  const { prefs, systemReducedMotion, setMotion } = usePreferences();
  return (
    <Card>
      <div className={styles.row}>
        <div className={styles.rowMain}>
          <div className={styles.rowTitle}>裝飾動畫</div>
          <div className={styles.rowBody}>
            背景海面、大橋光暈與首次進入的海鷗。偏好只儲存在這台裝置。
            {systemReducedMotion && ' 目前系統已要求減少動態，裝飾動畫維持靜態。'}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={prefs.motion}
          aria-label="裝飾動畫"
          className={`${styles.switch} ${prefs.motion ? styles.switchOn : ''}`}
          onClick={() => setMotion(!prefs.motion)}
        >
          <span className={styles.switchKnob} />
        </button>
      </div>
    </Card>
  );
}
