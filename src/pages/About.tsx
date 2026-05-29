import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

const TG_CHANNEL = 'lunamaltseva_blog';
const TG_POST_IDS: number[] = [274, 264, 257, 254, 253, 251, 244, 242, 240, 236, 221, 219, 215, 207, 200, 160, 154, 144, 128, 127, 113, 85, 77, 60, 26];

const IG_ACCOUNTS = ['lunamaltseva', 'rtms.ce', 'thezeraine'] as const;
const IG_POSTS: { account: typeof IG_ACCOUNTS[number]; shortcode: string }[] = [
  { account: 'lunamaltseva', shortcode: 'DYzUjovCIif' },
  { account: 'lunamaltseva', shortcode: 'DXocoPtCC29' },
  { account: 'lunamaltseva', shortcode: 'DXy2sSnCDZ0' },
  { account: 'thezeraine', shortcode: 'DYmxGq5jANa' },
  { account: 'rtms.ce', shortcode: 'DYfLZQoDf0k'},
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

export default function About() {
  const isMobile = useIsMobile();
  const feed = interleave();
  const hasIg = IG_POSTS.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
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
      const root = scrollRef.current;
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

  // Reveal the feed only after embeds have had a moment to process,
  // so users don't see raw blockquotes / unsized iframes flashing in.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 700);
    return () => clearTimeout(t);
  }, []);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const top = e.currentTarget.scrollTop;
    if (top > 24 && !collapsed) setCollapsed(true);
    else if (top <= 4 && collapsed) setCollapsed(false);
  }

  return (
    <div style={{
      backgroundColor: '#000000',
      height: isMobile ? 'auto' : 'calc(100vh - 120px)',
      minHeight: isMobile ? 'calc(100vh - 120px)' : undefined,
      padding: isMobile ? '1.5rem 1.5rem 0 1.5rem' : '3rem 3rem 0 3rem',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0' : '3rem',
      alignItems: 'stretch',
      boxSizing: 'border-box',
    }}>
      <style>{`
        .about-feed-scroll {
          scrollbar-color: rgba(255,255,255,0.18) transparent;
          scrollbar-width: thin;
        }
        .about-feed-scroll::-webkit-scrollbar { width: 6px; }
        .about-feed-scroll::-webkit-scrollbar-track { background: transparent; }
        .about-feed-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.14);
          border-radius: 3px;
        }
        .about-feed-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.28);
        }
        .about-feed-scroll .instagram-media,
        .about-feed-scroll .instagram-media iframe {
          min-width: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
        }
      `}</style>

      <div style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}>
        <header style={{ flexShrink: 0 }}>
          <h1 style={{
            fontFamily: 'CustomTitle, sans-serif',
            fontSize: isMobile ? '2rem' : '2.5rem',
            color: '#ffffff',
            margin: 0,
          }}>
            About Me
          </h1>
          <div style={{
            overflow: 'hidden',
            maxHeight: collapsed ? 0 : '600px',
            opacity: collapsed ? 0 : 1,
            transition: 'max-height 360ms ease, opacity 240ms ease, margin-top 360ms ease',
            marginTop: collapsed ? 0 : '1.25rem',
          }}>
            <p style={{
              fontFamily: 'CustomRegular, sans-serif',
              fontSize: '1rem',
              color: '#d4d0c8',
              lineHeight: '1.6',
              margin: 0,
            }}>
              My name is Luna Maltseva. I grew up between the United Kingdom and the Kyrgyz Republic, and as a result speak both English and Russian fluently. At the moment, I am doing an undergrad in Software Engineering at the American University of Central Asia, specializing in Data Science. I am active in the field of Civic Engagement, I mentor others as a Peer Advisor and a Teaching Assistant, and I do research, journalism, business coordination, and content creation as a side-kick. If you ever have a hackathon to win: you know whom to message ;)
            </p>
          </div>
        </header>

        <div
          ref={scrollRef}
          onScroll={isMobile ? undefined : handleScroll}
          className="about-feed-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            marginTop: isMobile ? '2rem' : '2rem',
            overflowY: isMobile ? 'visible' : 'auto',
            overflowX: 'hidden',
            paddingRight: isMobile ? 0 : '0.75rem',
            paddingBottom: isMobile ? '1.5rem' : '2rem',
            opacity: ready ? 1 : 0,
            transition: 'opacity 320ms ease',
          }}
        >
          <div style={{
            columnCount: isMobile ? 1 : 3,
            columnGap: '1rem',
          }}>
            {feed.map((item) => (
              <Card key={item.kind === 'tg' ? `tg-${item.id}` : `ig-${item.shortcode}`}>
                {item.kind === 'tg'
                  ? <TelegramEmbed id={item.id} />
                  : <InstagramEmbed shortcode={item.shortcode} />}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {isMobile ? (
        <img
          src="/design/Experte About.png"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '80%',
            maxHeight: '70%',
            objectFit: 'contain',
            objectPosition: 'bottom',
            opacity: 0.08,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ) : (
        <img
          src="/design/Experte About.png"
          alt="Experte"
          style={{
            width: '25.6%',
            maxWidth: '336px',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom',
            flexShrink: 0,
            alignSelf: 'stretch',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      breakInside: 'avoid',
      marginBottom: '1rem',
      background: 'transparent',
      border: 'none',
      overflow: 'hidden',
    }}>
      {children}
    </div>
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
