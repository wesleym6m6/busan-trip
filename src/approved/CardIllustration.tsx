import { useState } from 'react';
import catalog from '../data/card-illustrations.json';
import { assetUrl } from './assets';

type Illustration = { src: string; width: number; height: number; treatment: string };
const illustrations: Record<string, Illustration | undefined> = catalog;

/** Optional decoration: a missing image must never obstruct the itinerary. */
export function CardIllustration({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  const art = Object.hasOwn(illustrations, name) ? illustrations[name] : undefined;
  if (!art || failed) return null;

  return <span className={`trip-card-art trip-card-art--${art.treatment}`} aria-hidden="true">
    <img src={assetUrl(art.src)} width={art.width} height={art.height}
      alt="" loading="lazy" decoding="async" fetchPriority="low"
      onError={() => setFailed(true)} />
  </span>;
}
