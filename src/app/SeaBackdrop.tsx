/**
 * 全頁海面背景（固定於視窗後方）：三層淡海藍浪帶、日出光暈、session 首次的一次性海鷗。
 * 動畫只用 transform；使用者關閉或系統 reduce-motion 時維持靜態；分頁進入背景時暫停（data-decor-paused）。
 */
import { useEffect, useState } from 'react';
import { hasGullFlownThisSession, markGullFlown } from '../lib/preferences';
import { usePreferences } from './PreferencesContext';
import styles from './SeaBackdrop.module.css';

/** 週期 600、總長 1200 的浪帶：translateX(-50%) 後與起點重合，形成無縫循環。 */
const WAVE_BAND =
  'M0 100 C150 60 300 140 600 100 C900 60 1050 140 1200 100 V200 H0 Z';
const WAVE_LINE = 'M0 20 C150 4 300 36 600 20 C900 4 1050 36 1200 20';

/** 遠景大橋（viewBox 1200×220）：兩座塔放在 430／770，讓手機以 slice 裁切時仍看得到主跨兩塔。 */
const BRIDGE_DECK = 'M0 150 H1200 M0 160 H1200';
const BRIDGE_TOWERS = 'M430 150 V36 M446 150 V36 M430 66 H446 M430 108 H446 M754 150 V36 M770 150 V36 M754 66 H770 M754 108 H770';
const BRIDGE_CABLES = 'M0 140 C160 140 300 36 438 36 S 540 120 600 120 S 660 36 762 36 S 1040 140 1200 140';
const BRIDGE_HANGERS = 'M80 135 V150 M160 118 V150 M240 92 V150 M320 64 V150 M400 42 V150 M480 70 V150 M520 95 V150 M560 112 V150 M600 120 V150 M640 112 V150 M680 95 V150 M720 70 V150 M800 42 V150 M880 64 V150 M960 92 V150 M1040 118 V150 M1120 135 V150';

/** 一隻簡單線稿海鷗（兩道弧）。 */
function Gull({ className, onAnimationEnd }: { className: string | undefined; onAnimationEnd?: () => void }) {
  return (
    <svg className={className} viewBox="0 0 22 12" aria-hidden="true" focusable="false" onAnimationEnd={onAnimationEnd}>
      <path d="M1 8 C 4 2, 8 2, 11 7 C 14 2, 18 2, 21 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function usePauseWhenHidden() {
  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.decorPaused = document.visibilityState === 'hidden' ? 'true' : 'false';
    };
    document.addEventListener('visibilitychange', apply);
    apply();
    return () => {
      document.removeEventListener('visibilitychange', apply);
      delete document.documentElement.dataset.decorPaused;
    };
  }, []);
}

export function SeaBackdrop() {
  const { motionEnabled } = usePreferences();
  usePauseWhenHidden();
  const [showGull, setShowGull] = useState(() => !hasGullFlownThisSession());
  const gullVisible = showGull && motionEnabled;

  return (
    <div className={`${styles.backdrop} motion-decor`} aria-hidden="true">
      <div className={styles.glow} />
      <svg className={styles.bridge} viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice">
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke">
          <path d={BRIDGE_DECK} vectorEffect="non-scaling-stroke" />
          <path d={BRIDGE_TOWERS} vectorEffect="non-scaling-stroke" />
          <path d={BRIDGE_CABLES} vectorEffect="non-scaling-stroke" />
          <path d={BRIDGE_HANGERS} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      <svg className={styles.wave} viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d={WAVE_BAND} fill="currentColor" style={{ opacity: 'calc(var(--sea-wave-opacity) * 0.55)' }} />
      </svg>
      <svg className={`${styles.wave} ${styles.wave2}`} viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d={WAVE_BAND} fill="currentColor" style={{ opacity: 'calc(var(--sea-wave-opacity) * 0.75)' }} />
      </svg>
      <svg className={`${styles.wave} ${styles.wave3}`} viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d={WAVE_BAND} fill="currentColor" style={{ opacity: 'var(--sea-wave-opacity)' }} />
      </svg>
      <svg className={styles.waveLine} viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path d={WAVE_LINE} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {gullVisible && (
        <>
          <Gull className={styles.gull} />
          {/* 第二隻飛完才算結束：移除並記錄本 session 已飛過 */}
          <Gull
            className={`${styles.gull} ${styles.gullSecond}`}
            onAnimationEnd={() => {
              markGullFlown();
              setShowGull(false);
            }}
          />
        </>
      )}
    </div>
  );
}
