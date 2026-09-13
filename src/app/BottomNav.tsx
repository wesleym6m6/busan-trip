import { buildHash, type Page } from './routes';
import { IconBackup, IconRoute, IconTools } from '../ui/Icons';
import styles from './AppShell.module.css';

const ITEMS: Array<{ page: Page; label: string; Icon: typeof IconRoute }> = [
  { page: 'itinerary', label: '行程', Icon: IconRoute },
  { page: 'backups', label: '備案', Icon: IconBackup },
  { page: 'tools', label: '工具', Icon: IconTools },
];

export function BottomNav({ current, itineraryDayId }: { current: Page; itineraryDayId: string | null }) {
  return (
    <nav className={styles.nav} aria-label="主要頁面">
      <div className={styles.navInner}>
        {ITEMS.map(({ page, label, Icon }) => {
          const active = page === current;
          // 行程頁保留目前選取的日期，切回來時不會跳掉
          const href = buildHash({ page, dayId: page === 'itinerary' ? itineraryDayId : null });
          return (
            <a
              key={page}
              href={href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
