/** 少量線稿 icon，全部 currentColor、1.75px 線寬，避免引入 icon 套件。 */
import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export const IconMapPin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11Z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

export const IconCopy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
  </svg>
);

export const IconChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconShare = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3v12" />
    <path d="m8 7 4-4 4 4" />
    <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
  </svg>
);

export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconExternal = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 10 14" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </svg>
);

export const IconTextLarge = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 18 9 6l5 12" />
    <path d="M5.8 14h6.4" />
    <path d="M15 12h6M18 9v6" />
  </svg>
);

/* 底部導覽 */
export const IconRoute = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="18" cy="18" r="2.2" />
    <path d="M8 6h6a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h6" />
  </svg>
);

export const IconBackup = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path d="M4 10h16" />
    <path d="M9 14h6" />
  </svg>
);

export const IconTools = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M14.5 6.5a4 4 0 0 0-5.4 5.2L4 16.8 6.8 20l5.3-5.2a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.6-2.6 2.3-2.8Z" />
  </svg>
);

export const IconMotion = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3 12c2.5-3 5-3 7.5 0s5 3 7.5 0 3-3 3 0" />
    <path d="M3 17c2.5-3 5-3 7.5 0s5 3 7.5 0 3-3 3 0" opacity="0.5" />
  </svg>
);

export const IconWalk = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="13" cy="4.5" r="1.6" />
    <path d="m9 21 3-7 2.5 2.5V21" />
    <path d="M15 11.5 12.5 9 9 10.5 7.5 14" />
    <path d="m12.5 9-1.5 5" />
  </svg>
);

export const IconTransit = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="5" y="3" width="14" height="14" rx="3" />
    <path d="M5 11h14" />
    <path d="M8.5 14.5h.01M15.5 14.5h.01" />
    <path d="m7 21 1.5-4M17 21l-1.5-4" />
  </svg>
);

export const IconInfo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);
