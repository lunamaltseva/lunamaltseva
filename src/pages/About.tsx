import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

const SKILLS: { category: string; items: string[] }[] = [
  { category: 'Programming', items: ['Python', 'PostgreSQL', 'Docker', 'Typescript', 'React', 'C', 'Linux', 'C++', 'Qt', 'Cisco IOS'] },
  { category: 'Design', items: ['Photoshop', 'Illustrator', 'InDesign', 'VEGAS Pro', 'Blender'] },
  { category: 'Writing', items: ['Research', 'Fiction', 'Journalism'] },
];

const ENCOURAGEMENTS: { label: string; href: string }[] = [
  { label: 'Check out my designs!', href: '/design' },
  { label: 'Catch up on Artemis CE!', href: '/rtmsce' },
  { label: 'A lot of myself is in my sci-fi novel, Thezeraine, which recently got its giant second chapter!', href: '/writing/fiction' },
  
];

const CONTACTS: { label: string; href: string; external: boolean; icon: React.ReactNode }[] = [
  {
    label: 'luna@lunamaltseva.dev',
    href: 'mailto:luna@lunamaltseva.dev',
    external: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    label: '@lunamaltseva',
    href: 'https://instagram.com/lunamaltseva',
    external: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function About() {
  const isMobile = useIsMobile();

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      padding: isMobile ? '1.5rem' : '3rem',
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontWeight: 700,
          fontSize: isMobile ? '2rem' : '2.5rem',
          color: '#ffffff',
          margin: 0,
        }}>
          About Me
        </h1>

        <p style={{
          fontFamily: 'var(--font-primary)',
          fontSize: '1rem',
          color: '#d4d0c8',
          lineHeight: '1.6',
          margin: '1.25rem 0 0 0',
        }}>
          My name is Luna Maltseva. I grew up between the United Kingdom and the Kyrgyz Republic, and as a result speak both English and Russian fluently. At the moment, I am doing an undergrad in Software Engineering at the American University of Central Asia, specializing in Data Analysis. I am active in the field of Civic Engagement, I mentor others as a Peer Advisor and a Teaching Assistant, and I do research, journalism, business coordination, and content creation as a side-kick. 'Bonum per definitionem' is my coat of arms.
        </p>

        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.45rem',
        }}>
          {SKILLS.map((group) => (
            <SkillGroup key={group.category} category={group.category} items={group.items} />
          ))}
        </div>

        <section style={{ marginTop: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontWeight: 700,
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            color: '#ffffff',
            margin: '0 0 1rem 0',
          }}>
            While you&rsquo;re here
          </h2>
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {ENCOURAGEMENTS.map((item) => (
              <li key={item.href} style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.65rem',
                color: '#c8c4bc',
                fontSize: '1rem',
                lineHeight: 1.5,
              }}>
                <span aria-hidden style={{ color: '#8a857c', flexShrink: 0 }}>&bull;</span>
                <a
                  href={item.href}
                  style={{
                    color: '#e6e2da',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    textDecorationColor: '#4a463f',
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer style={{
          marginTop: '4rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          {CONTACTS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.5rem 1rem',
                border: '1px solid #333',
                borderRadius: '2rem',
                color: '#ddd',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-primary)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ddd'; }}
            >
              {c.icon}
              {c.label}
            </a>
          ))}
        </footer>
      </div>
    </div>
  );
}

function SkillBubble({ skill }: { skill: string }) {
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: 'rgba(255,255,255,0.07)',
      color: '#c8c4bc',
      padding: '0.35rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.72rem',
      fontFamily: 'var(--font-primary)',
      border: '1px solid rgba(255,255,255,0.08)',
      whiteSpace: 'nowrap',
    }}>
      {skill}
    </span>
  );
}

const SKILL_PREVIEW_COUNT = 2;

function SkillGroup({ category, items }: { category: string; items: string[] }) {
  const [expanded, setExpanded] = useState(true);
  const hasOverflow = items.length > SKILL_PREVIEW_COUNT;
  const visible = expanded || !hasOverflow ? items : items.slice(0, SKILL_PREVIEW_COUNT);
  return (
    <span
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.45rem',
      }}
    >
      <span
        onClick={() => hasOverflow && setExpanded((v) => !v)}
        style={{
          fontFamily: 'var(--font-primary)',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#8a857c',
          padding: '0 0.35rem',
          cursor: hasOverflow ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {category}
      </span>
      {visible.map((s) => <SkillBubble key={s} skill={s} />)}
      {hasOverflow && !expanded && (
        <span
          role="button"
          aria-label={`Show all ${category} skills`}
          onClick={() => setExpanded(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.07)',
            color: '#c8c4bc',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            lineHeight: 1,
            fontFamily: 'var(--font-primary)',
            border: '1px solid rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          …
        </span>
      )}
    </span>
  );
}
