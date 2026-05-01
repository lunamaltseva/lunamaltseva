import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface NavLink {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavLink[];
  rightAligned?: boolean;
}

const navItems: NavItem[] = [
  { label: 'About Me', href: '/about' },
  {
    label: 'Writing',
    dropdown: [
      { label: 'Academic', href: '/writing/academic' },
      { label: 'Fiction', href: '/writing/fiction' },
    ],
  },
  { label: 'Design', href: '/design' },
  { label: 'Programming', href: '/programming' },
  {
    label: 'Misc',
    rightAligned: true,
    dropdown: [
      { label: 'Nuclear Decay Sim', href: '/decay' },
      { label: 'Menstrual Clock', href: '/menstrualclock' },
    ],
  },
];

function Dropdown({ label, items, isMobile, onNavigate, rightAligned }: { label: string; items: NavLink[]; isMobile: boolean; onNavigate: () => void; rightAligned?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <li>
        <span
          className="nav-link"
          onClick={() => setIsOpen(!isOpen)}
          style={{ cursor: 'pointer' }}
        >
          {label}
        </span>
        {isOpen && (
          <ul className="dropdown-menu" style={{ opacity: 1, visibility: 'visible', transform: 'none' }}>
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="dropdown-item" onClick={onNavigate}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li
      className={`relative${rightAligned ? ' nav-item-right' : ''}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span className="nav-link dropdown-toggle">{label}</span>
      <ul
        className={`dropdown-menu${rightAligned ? ' dropdown-menu-right' : ''} ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2.5'}`}
      >
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="dropdown-item">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node) &&
          !(e.target as HTMLElement).closest('.hamburger-btn')) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-title">
          Luna Maltseva
        </a>
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        <ul ref={navRef} className={`navbar-nav${menuOpen ? ' open' : ''}`}>
          {navItems.map((item) =>
            item.dropdown ? (
              <Dropdown
                key={item.label}
                label={item.label}
                items={item.dropdown}
                isMobile={isMobile}
                onNavigate={() => setMenuOpen(false)}
                rightAligned={item.rightAligned}
              />
            ) : (
              <li key={item.href} className="nav-item">
                <a
                  href={item.href}
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
}
