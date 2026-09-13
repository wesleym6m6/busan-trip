import type { ReactNode } from 'react';
import styles from './Tag.module.css';

export type TagTone = 'neutral' | 'primary' | 'warn' | 'ok' | 'danger' | 'outline';

export function Tag({ tone = 'neutral', children, title }: { tone?: TagTone; children: ReactNode; title?: string }) {
  return (
    <span className={`${styles.tag} ${styles[tone]}`} title={title}>
      {children}
    </span>
  );
}
