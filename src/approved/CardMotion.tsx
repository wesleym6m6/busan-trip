import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

const motionQuery = '(prefers-reduced-motion: reduce)';
const MotionContext = createContext({ reduced: true, seen: new Set<string>() });
const systemReduced = () => typeof window.matchMedia === 'function' && window.matchMedia(motionQuery).matches;
const serverReduced = () => true;
function subscribeMotion(notify: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

/** Session-scoped: switching dates or tabs must not replay already-seen art. */
export function CardMotionProvider({ reduced, children }: { reduced: boolean; children: ReactNode }) {
  const [seen] = useState(() => new Set<string>());
  const systemPreference = useSyncExternalStore(subscribeMotion, systemReduced, serverReduced);
  const value = useMemo(() => ({ reduced: reduced || systemPreference, seen }), [reduced, systemPreference, seen]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

/** No hidden starting state: slow, missing or unsupported images never delay reading. */
export function useCardArtEntrance(id: string, enabled: boolean) {
  const ref = useRef<HTMLImageElement>(null);
  const { reduced, seen } = useContext(MotionContext);
  useEffect(() => {
    const image = ref.current;
    if (!image || !enabled || seen.has(id) || typeof IntersectionObserver === 'undefined') return;
    let visible = false;
    let animation: Animation | undefined;
    const reveal = () => {
      if (!visible || !image.complete || !image.naturalWidth || seen.has(id)) return;
      seen.add(id);
      observer.disconnect();
      if (!reduced && typeof image.animate === 'function') {
        animation = image.animate([
          { opacity: .55, transform: 'translateY(5px)' },
          { opacity: .94, transform: 'translateY(0)' },
        ], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      reveal();
    }, { rootMargin: '-64px 0px -64px 0px', threshold: .15 });
    observer.observe(image);
    image.addEventListener('load', reveal);
    return () => {
      observer.disconnect();
      image.removeEventListener('load', reveal);
      animation?.cancel();
    };
  }, [id, enabled, reduced, seen]);
  return ref;
}
