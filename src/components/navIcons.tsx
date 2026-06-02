import type { ReactElement } from 'react';

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

function baseSvgProps({ size = 16, strokeWidth = 1.6, className, style }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style: { flexShrink: 0, ...style },
    'aria-hidden': true,
  };
}

export function IconAboutMe(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function IconAcademic(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <path d="M2 9l10-5 10 5-10 5L2 9z" />
      <path d="M6 11v5c2 1.5 4 2 6 2s4-.5 6-2v-5" />
      <path d="M22 9v5" />
    </svg>
  );
}

export function IconFiction(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}

export function IconDesign(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <circle cx="13.5" cy="6.5" r="1.5" />
      <circle cx="17.5" cy="10.5" r="1.5" />
      <circle cx="8.5" cy="7.5" r="1.5" />
      <circle cx="6.5" cy="12.5" r="1.5" />
      <path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-11z" />
    </svg>
  );
}

export function IconArtemis(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

export function IconScheduleWhen(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconDecay(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <circle cx="12" cy="12" r="1.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" />
    </svg>
  );
}

export function IconMenstrualClock(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconBreakingNews(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)}>
      <path d="M3 5h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
      <path d="M19 8h2v9a2 2 0 0 1-2 2" />
      <line x1="7" y1="9" x2="13" y2="9" />
      <line x1="7" y1="13" x2="15" y2="13" />
      <line x1="7" y1="17" x2="11" y2="17" />
    </svg>
  );
}

export function IconFavorites(props: IconProps) {
  return (
    <svg {...baseSvgProps(props)} fill="currentColor" stroke="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// Map href → icon component for easy lookup by themed navbars.
export const ICONS_BY_HREF: Record<string, (p: IconProps) => ReactElement> = {
  '/about': IconAboutMe,
  '/writing/academic': IconAcademic,
  '/writing/fiction': IconFiction,
  '/design': IconDesign,
  '/rtmsce': IconArtemis,
  'https://schedulewhen.net': IconScheduleWhen,
  '/decay': IconDecay,
  '/menstrualclock': IconMenstrualClock,
  '/breakingnews': IconBreakingNews,
  '/favorites': IconFavorites,
};
