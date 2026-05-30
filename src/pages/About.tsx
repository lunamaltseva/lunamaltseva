import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

const TG_CHANNEL = 'lunamaltseva_blog';
const TG_POST_IDS: number[] = [276, 274, 264, 257, 254, 253, 251, 244, 242, 240, 236, 221, 219, 215, 207, 200, 160, 154, 144, 128, 127, 113, 85, 77, 60, 26];

const IG_ACCOUNTS = ['lunamaltseva', 'rtms.ce', 'thezeraine'] as const;
const IG_POSTS: { account: typeof IG_ACCOUNTS[number]; shortcode: string }[] = [
  { account: 'lunamaltseva', shortcode: 'DYzUjovCIif' },
  { account: 'lunamaltseva', shortcode: 'DXocoPtCC29' },
  { account: 'lunamaltseva', shortcode: 'DXy2sSnCDZ0' },
  { account: 'lunamaltseva', shortcode: 'DY7VyQECCri'},
  { account: 'thezeraine', shortcode: 'DYmxGq5jANa' },
  { account: 'rtms.ce', shortcode: 'DYfLZQoDf0k' },
];

const SKILLS: { category: string; items: string[] }[] = [
  { category: 'Programming', items: ['C', 'C++', 'raylib', 'Qt', 'Python', 'Scikit-Learn', 'Typescript', 'React', 'Linux', 'Cisco IOS'] },
  { category: 'Design', items: ['Blender', 'aseprite', 'Photoshop', 'Illustrator', 'InDesign', 'VEGAS Pro', 'Figma'] },
  { category: 'Writing', items: ['Research', 'Fiction', 'Journalism'] },
];

type FeedItem =
  | { kind: 'tg'; id: number }
  | { kind: 'ig'; account: string; shortcode: string };

function interleave(): FeedItem[] {
  const tg: FeedItem[] = TG_POST_IDS.map((id) => ({ kind: 'tg', id }));
  const ig: FeedItem[] = IG_POSTS.map((p) => ({ kind: 'ig', account: p.account, shortcode: p.shortcode }));
  const out: FeedItem[] = [];
  const step = Math.max(1, Math.ceil(tg.length / (ig.length + 1)));
  let ii = 0, ti = 0;
  while (ti < tg.length || ii < ig.length) {
    for (let k = 0; k < step && ti < tg.length; k++) out.push(tg[ti++]);
    if (ii < ig.length) out.push(ig[ii++]);
  }
  return out;
}

// Greedy shortest-column distribution. Each post is placed into whichever
// column is currently shortest, using a per-type height estimate so taller
// Instagram embeds don't all clump into the same column. Assignment is
// deterministic and order-preserving, so async embed resizes only push the
// items beneath them within a column — never across columns.
const ESTIMATED_HEIGHT_TG = 280;
const ESTIMATED_HEIGHT_IG = 620;

function distribute(feed: FeedItem[], cols: number): FeedItem[][] {
  const out: FeedItem[][] = Array.from({ length: cols }, () => []);
  const heights = new Array(cols).fill(0);
  for (const item of feed) {
    let mi = 0;
    for (let i = 1; i < cols; i++) if (heights[i] < heights[mi]) mi = i;
    out[mi].push(item);
    heights[mi] += item.kind === 'tg' ? ESTIMATED_HEIGHT_TG : ESTIMATED_HEIGHT_IG;
  }
  return out;
}

export default function About() {
  const isMobile = useIsMobile();
  const feed = interleave();
  const columns = distribute(feed, isMobile ? 1 : 3);
  const hasIg = IG_POSTS.length > 0;
  const tgScopeRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasIg) return;
    const existing = document.querySelector<HTMLScriptElement>('script[src*="instagram.com/embed.js"]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      document.body.appendChild(s);
    } else {
      // @ts-expect-error instgrm is injected by the embed script
      window.instgrm?.Embeds?.process?.();
    }
  }, [hasIg, feed.length]);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== 'https://t.me') return;
      let data: { event?: string; height?: number } | null = null;
      try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch { return; }
      if (!data || data.event !== 'resize' || !data.height) return;
      const root = tgScopeRef.current;
      if (!root) return;
      root.querySelectorAll('iframe').forEach((f) => {
        if ((f as HTMLIFrameElement).contentWindow === e.source) {
          (f as HTMLIFrameElement).style.height = data!.height + 'px';
        }
      });
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: 'calc(100vh - 120px)',
      padding: isMobile ? '1.5rem' : '3rem',
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      <style>{`
        .about-feed .instagram-media,
        .about-feed .instagram-media iframe {
          min-width: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
        }

        .caught-up-circle, .caught-up-mark {
          fill: none;
          stroke: #c8c4bc;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .caught-up-circle {
          stroke-dasharray: 226;
          stroke-dashoffset: 226;
        }
        .caught-up-mark {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
        }
        .caught-up-animate .caught-up-circle {
          animation: about-draw-circle 600ms ease-out forwards;
        }
        .caught-up-animate .caught-up-mark {
          animation: about-draw-mark 380ms 520ms ease-out forwards;
        }
        .caught-up-animate .caught-up-text {
          animation: about-fade-in 500ms 700ms ease-out forwards;
        }
        @keyframes about-draw-circle { to { stroke-dashoffset: 0; } }
        @keyframes about-draw-mark { to { stroke-dashoffset: 0; } }
        @keyframes about-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      <header style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontFamily: 'CustomTitle, sans-serif',
          fontSize: isMobile ? '2rem' : '2.5rem',
          color: '#ffffff',
          margin: 0,
        }}>
          About Me
        </h1>
        <div style={{ marginTop: '1.25rem' }}>
          <p style={{
            fontFamily: 'CustomRegular, sans-serif',
            fontSize: '1rem',
            color: '#d4d0c8',
            lineHeight: '1.6',
            margin: 0,
          }}>
            My name is Luna Maltseva. I grew up between the United Kingdom and the Kyrgyz Republic, and as a result speak both English and Russian fluently. At the moment, I am doing an undergrad in Software Engineering at the American University of Central Asia, specializing in Data Science. I am active in the field of Civic Engagement, I mentor others as a Peer Advisor and a Teaching Assistant, and I do research, journalism, business coordination, and content creation as a side-kick. If you ever have a hackathon to win: you know whom to message ;)
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
        </div>
      </header>

      <div
        ref={tgScopeRef}
        className="about-feed"
        style={{
          marginTop: '2rem',
          opacity: ready ? 1 : 0,
          transition: 'opacity 600ms ease',
        }}
      >
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          {columns.map((col, ci) => (
            <div key={ci} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {col.map((item) => (
                <div key={item.kind === 'tg' ? `tg-${item.id}` : `ig-${item.shortcode}`}>
                  {item.kind === 'tg'
                    ? <TelegramEmbed id={item.id} />
                    : <InstagramEmbed shortcode={item.shortcode} />}
                </div>
              ))}
            </div>
          ))}
        </div>

        <CaughtUp />
      </div>
    </div>
  );
}

function CaughtUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={shown ? 'caught-up-animate' : ''}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        margin: '4rem 0 2rem 0',
        textAlign: 'center',
      }}
    >
      <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden>
        <circle className="caught-up-circle" cx="40" cy="40" r="36" />
        <path className="caught-up-mark" d="M24 41 L36 53 L57 30" />
      </svg>
      <div
        className="caught-up-text"
        style={{
          fontFamily: 'CustomTitle, sans-serif',
          fontSize: '1.5rem',
          color: '#c8c4bc',
          opacity: shown ? undefined : 0,
        }}
      >
        That is all, for now
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
      fontFamily: 'CustomRegular, sans-serif',
      border: '1px solid rgba(255,255,255,0.08)',
      whiteSpace: 'nowrap',
    }}>
      {skill}
    </span>
  );
}

const SKILL_PREVIEW_COUNT = 2;

function SkillGroup({ category, items }: { category: string; items: string[] }) {
  const [expanded, setExpanded] = useState(false);
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
          fontFamily: 'CustomRegular, sans-serif',
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
            fontFamily: 'CustomRegular, sans-serif',
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

function TelegramEmbed({ id }: { id: number }) {
  return (
    <iframe
      src={`https://t.me/${TG_CHANNEL}/${id}?embed=1&dark=1`}
      style={{
        width: '100%',
        border: 'none',
        display: 'block',
        height: '220px',
        colorScheme: 'dark',
      }}
      scrolling="no"
      loading="lazy"
      title={`Telegram post ${id}`}
    />
  );
}

function InstagramEmbed({ shortcode }: { shortcode: string }) {
  return (
    <blockquote
      className="instagram-media"
      data-instgrm-captioned
      data-instgrm-permalink={`https://www.instagram.com/p/${shortcode}/?utm_source=ig_embed`}
      data-instgrm-version="14"
      style={{
        background: 'transparent',
        border: 0,
        margin: 0,
        padding: 0,
        width: '100%',
        minHeight: '320px',
      }}
    >
      <a href={`https://www.instagram.com/p/${shortcode}/`}>View on Instagram</a>
    </blockquote>
  );
}
