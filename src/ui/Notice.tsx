import type { ReactNode } from 'react';
import type { ValidationIssue } from '../domain/validate';
import styles from './Notice.module.css';

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className={styles.empty} role="status">
      <div className={styles.emptyTitle}>{title}</div>
      {body && <div className={styles.emptyBody}>{body}</div>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

export function LoadingState({ label = '載入行程資料…' }: { label?: string }) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      {label}
    </div>
  );
}

export function ErrorBanner({
  title,
  message,
  issues,
  action,
}: {
  title: string;
  message?: string;
  issues?: ValidationIssue[];
  action?: ReactNode;
}) {
  return (
    <div className={`${styles.banner} ${styles.bannerDanger}`} role="alert">
      <div className={styles.bannerTitle}>{title}</div>
      {message && <div>{message}</div>}
      {issues && issues.length > 0 && (
        <ul className={styles.issueList}>
          {issues.map((i, idx) => (
            <li key={idx}>
              [{i.severity}] {i.path}: {i.message}
            </li>
          ))}
        </ul>
      )}
      {action}
    </div>
  );
}

export type InlineStatusKind = 'idle' | 'ok' | 'fail';

/** 行內狀態文字，例如「已複製」。用 role=status 讓輔助技術讀到。 */
export function InlineStatus({ kind, children }: { kind: InlineStatusKind; children?: ReactNode }) {
  return (
    <div
      className={`${styles.inline} ${kind === 'ok' ? styles.inlineOk : ''} ${kind === 'fail' ? styles.inlineFail : ''}`}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section className={styles.section} aria-labelledby={id ? `${id}-title` : undefined} id={id}>
      <h2 className={styles.sectionTitle} id={id ? `${id}-title` : undefined}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.card} ${className ?? ''}`}>{children}</div>;
}
