export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavLink[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'About Me', href: '/about' },
  {
    label: 'Works',
    dropdown: [
      { label: 'Academic', href: '/writing/academic' },
      { label: 'Fiction', href: '/writing/fiction' },
      { label: 'Design', href: '/design' },
    ],
  },
  {
    label: 'Programming',
    dropdown: [
      { label: 'Artemis CE', href: '/rtmsce' },
      { label: 'ScheduleWhen', href: 'https://schedulewhen.net', external: true },
      { label: 'Nuclear Decay Visualizer', href: '/decay' },
      { label: 'Menstrual Clock', href: '/menstrualclock' },
      { label: 'Breaking News', href: '/breakingnews' },
    ],
  },
];
