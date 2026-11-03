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

// Header order: About Me | Favorites | Luna Maltseva | Works | Projects
export const NAV_LEFT: NavItem[] = [
  { label: 'About Me', href: '/about' },
  { label: 'Favorites', href: '/favorites' },
];

export const NAV_RIGHT: NavItem[] = [
  {
    label: 'Works',
    dropdown: [
      { label: 'Academic', href: '/writing/academic' },
      { label: 'Fiction', href: '/writing/fiction' },
      { label: 'Design', href: '/design' },
    ],
  },
  {
    label: 'Projects',
    dropdown: [
      { label: 'Artemis CE', href: '/rtmsce' },
      //{ label: "What's Wrong with That Graph?", href: '/wwwtg' },
      { label: 'ScheduleWhen', href: 'https://schedulewhen.net', external: true },
      { label: 'Nuclear Decay Visualizer', href: '/decay' },
      { label: 'Menstrual Clock', href: '/menstrualclock' },
      { label: 'Breaking News', href: '/breakingnews' },
      { label: 'Rockstar Level Composer', href: '/rockstar' },
    ],
  },
];

// Flattened order, used for the mobile dropdown menus.
export const NAV_ITEMS: NavItem[] = [...NAV_LEFT, ...NAV_RIGHT];
