import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const SCARLET  = '#dc2626';
const SCARLET2 = '#b91c1c';
const BRAND    = '#005ea5';
const CALLOUT_BG = '#f7f6f1';

const B = {
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  brand600: '#005ea5',
  brand700: '#004b84',
  brand50:  '#e6f2fb',
  success: '#16a34a',
  warning: '#fbbf24',
  danger:  '#f87171',
  gold:    '#d3bc7a',
} as const;

const card: React.CSSProperties = {
  background: '#fff',
  border: `1px solid ${B.gray200}`,
  borderRadius: 12,
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
};

const eyebrow: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: B.gray500,
};

// ── Dev ticker (used inside BrowserMockup) ────────────────────────────────────
const TICKER_TEXT = "static preview: not actual system";
const TICKER_CHUNK = Array(15).fill(TICKER_TEXT).join(" • ") + " • ";

// ── Navbar ────────────────────────────────────────────────────────────────────
function ThemedNavbar() {
  const mob = useIsMobile();
  return (
    <nav style={{
      background: SCARLET,
      borderBottom: `1px solid ${SCARLET2}`,
      padding: mob ? '0 1rem' : '0 2rem',
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
      height: 56,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '0.75rem' : '1.5rem', minWidth: 0 }}>
        <a href="/" style={{ color: '#fff', fontSize: mob ? '1rem' : '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', textDecoration: 'none', flexShrink: 0 }}>
          Luna Maltseva
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 0 }}>
          {!mob && (
            <a
              href="/about"
              style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.9rem', fontWeight: 400, padding: '0.4rem 0.75rem', borderRadius: 4, textDecoration: 'none', whiteSpace: 'nowrap' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              About Me
            </a>
          )}
          <a
            href="/rtmsce"
            style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, padding: '0.4rem 0.75rem', borderRadius: 4, background: 'rgba(255,255,255,0.18)', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            GE26 RTMS CE
          </a>
        </nav>
      </div>
    </nav>
  );
}

// ── Mini chart components ─────────────────────────────────────────────────────
function MiniStackedBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div>
      <div style={{ display: 'flex', width: '100%', height: 18, borderRadius: 5, overflow: 'hidden', background: B.gray100 }}>
        {segments.map((s, i) => (
          <div key={i} title={s.label} style={{
            width: `${(s.value / total) * 100}%`, background: s.color,
            borderRight: i < segments.length - 1 ? '1px solid #fff' : 'none',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: 5 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ width: `${(s.value / total) * 100}%`, paddingRight: 4, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: B.gray600, fontVariantNumeric: 'tabular-nums' }}>{Math.round((s.value / total) * 100)}%</div>
            <div style={{ fontSize: 9, color: B.gray400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniSparkline({ data, color = BRAND }: { data: number[]; color?: string }) {
  const w = 90, h = 38;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(1, max - min);
  const pad = 4;
  const xAt = (i: number) => pad + i * (w - pad * 2) / Math.max(1, data.length - 1);
  const yAt = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(v)}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => <circle key={i} cx={xAt(i)} cy={yAt(v)} r="2" fill="#fff" stroke={color} strokeWidth="1.5" />)}
    </svg>
  );
}

function MiniChiplet({ label, value, delta, history, accent }: {
  label: string; value: string; delta?: number; history?: number[]; accent?: string;
}) {
  const up = delta !== undefined && delta > 0;
  const color = delta === undefined ? B.gray400 : up ? B.success : B.danger;
  const deltaStr = delta !== undefined ? `${up ? '+' : ''}${delta}` : null;
  return (
    <div style={{ ...card, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ ...eyebrow }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: accent ?? B.gray900, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{value}</div>
          {deltaStr !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {up ? <path d="M7 17 17 7 M9 7h8v8" /> : <path d="M7 7 17 17 M9 17h8v-8" />}
              </svg>
              <span style={{ fontSize: 10, fontWeight: 600, color }}>{deltaStr}</span>
            </div>
          )}
        </div>
        {history && <MiniSparkline data={history} color={accent ?? BRAND} />}
      </div>
    </div>
  );
}

function MiniDoubleBar({ label1, label2, data1, data2, cats, palette }: {
  label1: string; label2: string; data1: number[]; data2: number[];
  cats: string[]; palette?: string[];
}) {
  const fills = palette ?? [B.brand700, B.brand600, B.brand50, B.gold, B.gray500];
  const t1 = data1.reduce((a, b) => a + b, 0);
  const t2 = data2.reduce((a, b) => a + b, 0);
  const pct1 = data1.map(v => t1 ? v / t1 : 0);
  const pct2 = data2.map(v => t2 ? v / t2 : 0);
  const Bar = ({ pcts }: { pcts: number[] }) => (
    <div style={{ display: 'flex', width: '100%', height: 16, borderRadius: 4, overflow: 'hidden', background: B.gray100 }}>
      {pcts.map((p, i) => (
        <div key={i} title={cats[i]} style={{
          width: `${p * 100}%`, background: fills[i % fills.length],
          borderRight: i < pcts.length - 1 ? '1px solid #fff' : 'none',
        }} />
      ))}
    </div>
  );
  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 3 }}>
        {cats.map((c, i) => pct1[i] > 0.005 && (
          <div key={i} style={{ width: `${pct1[i] * 100}%`, paddingRight: 4, minWidth: 0 }}>
            <div style={{ fontSize: 8, color: B.gray700, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 8, fontWeight: 600, color: B.gray500, marginBottom: 2 }}>{label1}</div>
      <Bar pcts={pct1} />
      <div style={{ height: 5 }} />
      <div style={{ fontSize: 8, fontWeight: 600, color: B.gray500, marginBottom: 2 }}>{label2}</div>
      <Bar pcts={pct2} />
    </div>
  );
}

function MiniHorizBar({ data, color = BRAND }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {data.slice(0, 5).map((d, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 28px', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: B.gray700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.label}>{d.label}</span>
          <div style={{ width: '100%', height: 10, background: B.gray100, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: '100%', background: color }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 600, color: B.gray600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {Math.round((d.value / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniProgressBar({ label, actual, target, fmt = 'num' }: {
  label: string; actual: number; target: number; fmt?: 'num' | 'usd';
}) {
  const ratio = target ? actual / target : 0;
  const over = ratio >= 1;
  const f = (n: number) => fmt === 'usd' ? `$${n.toLocaleString()}` : n.toLocaleString();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, alignItems: 'baseline' }}>
        <span style={{ fontSize: 9, fontWeight: 500, color: B.gray700 }}>{label}</span>
        <span style={{ fontSize: 9, color: B.gray500, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: over ? B.success : B.gray800, fontWeight: 600 }}>{f(actual)}</span>
          <span style={{ color: B.gray400 }}> / {f(target)}</span>
        </span>
      </div>
      <div style={{ width: '100%', height: 8, background: B.gray100, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(ratio, 1) * 100}%`, height: '100%', background: over ? B.success : BRAND, borderRadius: 4 }} />
      </div>
      <div style={{ marginTop: 2, fontSize: 8, color: over ? B.success : B.gray500, fontWeight: 600 }}>
        {Math.round(ratio * 100)}% of target
      </div>
    </div>
  );
}

// ── Section tab views ─────────────────────────────────────────────────────────
// ── Analysis content — all sections, continuous scroll ────────────────────────
function AnalysisContent() {
  const p = '0 16px';
  const sh: React.CSSProperties = { fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: B.brand700, marginBottom: 2 };
  const ttl: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: B.gray900, lineHeight: 1.2, margin: '2px 0 2px' };
  const sub: React.CSSProperties = { fontSize: 9, color: B.gray500, marginBottom: 10 };
  const divider: React.CSSProperties = { height: 1, background: B.gray200, margin: '18px 16px 14px' };

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* Page title row */}
      <div style={{ padding: '12px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...sh, color: B.brand700 }}>Overview</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: B.gray900, lineHeight: 1.2 }}>Analysis</div>
          <div style={{ fontSize: 9, color: B.gray500, marginTop: 2 }}>Cross-call program metrics — applicants, projects, reach, delays, participants, and challenges.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...sh }}>Showing</div>
          <div style={{ fontSize: 9, color: B.gray700 }}><span style={{ fontWeight: 600 }}>2026S</span><span style={{ color: B.gray400 }}> · 2026-01-13 – 2026-05-09</span></div>
        </div>
      </div>

      {/* 01 Performance */}
      <div style={{ padding: p }}>
        <div style={sh}>01</div>
        <div style={ttl}>Performance metrics</div>
        <div style={sub}>Headline volume and yield of the current call relative to the previous call.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          <MiniChiplet label="Unique applicants" value="57" delta={8} history={[49, 57]} />
          <MiniChiplet label="Projects per call" value="22" delta={5} history={[17, 22]} />
          <MiniChiplet label="Acceptance rate" value="38%" delta={4} accent={BRAND} />
        </div>
        <div style={{ ...card, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: B.gray900, marginBottom: 2 }}>Acceptance breakdown — current call</div>
          <div style={{ fontSize: 9, color: B.gray500, marginBottom: 7 }}>Status of every submitted application in the timeframe.</div>
          <MiniStackedBar segments={[
            { label: 'Accepted',  value: 22, color: B.success },
            { label: 'Pending',   value: 17, color: B.warning },
            { label: 'Rejected',  value: 14, color: B.danger  },
            { label: 'Withdrawn', value: 4,  color: B.gray400 },
          ]} />
        </div>
      </div>

      <div style={divider} />

      {/* 02 Overall */}
      <div style={{ padding: p }}>
        <div style={sh}>02</div>
        <div style={ttl}>Overall metrics</div>
        <div style={sub}>Reach, staffing, budget, and target attainment across accepted projects.</div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: B.gray500, marginBottom: 6 }}>Cumulative</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          <MiniChiplet label="Audience" value="4,180" />
          <MiniChiplet label="Staffing" value="64" />
          <MiniChiplet label="Budget used" value="$31,610" />
        </div>
        <div style={{ ...card, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: B.gray900, marginBottom: 8 }}>% of initial target</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MiniProgressBar label="Participation"   actual={4180}  target={3900}  />
            <MiniProgressBar label="Projects started" actual={21}    target={22}    />
            <MiniProgressBar label="Budget utilised" actual={31610} target={38400} fmt="usd" />
          </div>
        </div>
      </div>

      <div style={divider} />

      {/* 03 Start & delays */}
      <div style={{ padding: p }}>
        <div style={sh}>03</div>
        <div style={ttl}>Start of project and delays</div>
        <div style={sub}>When projects start relative to plan and where standards were raised.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <MiniChiplet label="Projects start"  value="2 weeks after greenlight" />
          <MiniChiplet label="Median duration" value="42 days" />
        </div>
        <div style={{ ...card, padding: '10px 12px', marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: B.gray900, marginBottom: 6 }}>Project start delay</div>
          <MiniStackedBar segments={[
            { label: 'Early or on time', value: 8,  color: B.success },
            { label: 'Late',             value: 11, color: B.warning },
            { label: '>2 weeks',         value: 3,  color: B.danger  },
          ]} />
        </div>
        <div style={{ ...card, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: B.gray900, marginBottom: 6 }}>Applications by theme</div>
          <MiniDoubleBar
            label1="All applications" label2="Accepted"
            cats={['Education', 'Healthcare', 'Societal', 'Environment', 'Tech']}
            data1={[12, 14, 9, 11, 11]} data2={[3, 5, 2, 4, 3]}
          />
        </div>
      </div>

      <div style={divider} />

      {/* 04 Participants */}
      <div style={{ padding: p }}>
        <div style={sh}>04</div>
        <div style={ttl}>Participants</div>
        <div style={{ height: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div style={{ ...card, padding: '10px 12px' }}>
            <div style={eyebrow}>Diversity rating</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: BRAND, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, marginTop: 4 }}>78<span style={{ fontSize: 11, fontWeight: 400, color: B.gray500 }}> / 100</span></div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: B.gray500, marginBottom: 3 }}>Gender</div>
              <div style={{ display: 'flex', height: 11, borderRadius: 3, overflow: 'hidden', background: B.gray100 }}>
                <div style={{ width: '58%', background: '#ec4899', borderRight: '1px solid #fff' }} />
                <div style={{ width: '39%', background: '#3b82f6', borderRight: '1px solid #fff' }} />
                <div style={{ flex: 1, background: B.gray300 }} />
              </div>
              <div style={{ fontSize: 8, fontWeight: 600, color: B.gray500, marginBottom: 3, marginTop: 6 }}>Year of study</div>
              <div style={{ display: 'flex', height: 11, borderRadius: 3, overflow: 'hidden', background: B.gray100 }}>
                {[['11%','#16a34a'],['24%','#eab308'],['31%','#ef4444'],['22%','#3b82f6'],['12%','#991b1b']].map(([w,c],i,a) => (
                  <div key={i} style={{ width: w, background: c, borderRight: i < a.length-1 ? '1px solid #fff' : 'none' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ ...card, padding: '10px 12px' }}>
            <div style={eyebrow}>Reporting rating</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: BRAND, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, marginTop: 4 }}>64<span style={{ fontSize: 11, fontWeight: 400, color: B.gray500 }}> / 100</span></div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[{ l: 'On-cadence reports', v: 0.71 }, { l: 'Sections present', v: 0.58 }, { l: 'Quality rating', v: 0.62 }].map((it, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 8, color: B.gray700 }}>{it.l}</span>
                    <span style={{ fontSize: 8, color: B.gray500, fontVariantNumeric: 'tabular-nums' }}>{Math.round(it.v * 100)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: B.gray100, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${it.v * 100}%`, height: '100%', background: it.v >= 0.7 ? B.success : it.v >= 0.5 ? BRAND : B.warning }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ ...card, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: B.gray900, marginBottom: 8 }}>Departments vs selected</div>
          <MiniDoubleBar
            label1="Applications" label2="Accepted"
            cats={['Lib Arts', 'Anthro', 'Biz Admin', 'Psychology', 'ICT', 'Law', 'Environ', 'Econ']}
            data1={[11, 9, 8, 7, 6, 5, 5, 6]} data2={[4, 3, 3, 3, 2, 2, 3, 2]}
          />
        </div>
      </div>

      <div style={divider} />

      {/* 05 Experience */}
      <div style={{ padding: p }}>
        <div style={sh}>05</div>
        <div style={ttl}>Experience and challenges</div>
        <div style={sub}>Prior-grants context and what teams flagged as challenges.</div>
        <div style={{ ...card, padding: '10px 12px', marginBottom: 8 }}>
          <div style={eyebrow}>Proposal quality (avg across accepted)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            {[
              { label: 'Methodology innovation', score: 2.3 },
              { label: 'Extensive timeline',      score: 1.9 },
              { label: 'Conciseness',             score: 2.2 },
              { label: 'Thorough goals',          score: 2.5 },
            ].map((it, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: B.gray700 }}>{it.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: BRAND, fontVariantNumeric: 'tabular-nums' }}>{it.score.toFixed(1)}</span>
                </div>
                <div style={{ width: '100%', height: 5, background: B.gray100, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(it.score / 3) * 100}%`, height: '100%', background: BRAND }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...card, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: B.gray900, marginBottom: 8 }}>Challenges by category</div>
          <MiniHorizBar data={[
            { label: 'Recruitment & turnout',     value: 14 },
            { label: 'Logistics & venues',        value: 9  },
            { label: 'Funding gaps',              value: 7  },
            { label: 'Partner coordination',      value: 6  },
            { label: 'Timing / academic clashes', value: 5  },
          ]} />
        </div>
      </div>

    </div>
  );
}

// ── Browser window mockup — fixed 16:10 ───────────────────────────────────────
const WIN_W    = 800;
const WIN_H    = 500;   // 16:10
const CHROME_H = 36;
const APP_H    = WIN_H - CHROME_H;  // scrollable content area

function BrowserMockup({ scale = 1 }: { scale?: number }) {
  const [open, setOpen] = useState(true);

  return (
    <>
    <style>{`
      @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      .rtms-ticker-inner { animation: ticker 55s linear infinite; }
    `}</style>
    {/* zoom wrapper: scales the entire mockup to fit narrow viewports */}
    <div style={{ ...(scale < 1 ? { zoom: scale } : {}), display: 'inline-block' }}>
    <div style={{
      width: WIN_W,
      borderRadius: 10,
      overflow: 'hidden',
      border: `1px solid ${B.gray300}`,
      boxShadow: open
        ? '0 40px 60px -12px rgba(0,0,0,0.28)'
        : '0 10px 20px -6px rgba(0,0,0,0.12)',
      transition: 'box-shadow 350ms ease',
      flexShrink: 0,
    }}>

      {/* ── Chrome bar ── */}
      <div style={{
        height: CHROME_H,
        background: '#ececec',
        borderBottom: `1px solid ${B.gray300}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 12px',
        userSelect: 'none',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {/* Red — close */}
          <button
            onClick={() => setOpen(false)}
            title="Close"
            style={{
              width: 12, height: 12, borderRadius: '50%',
              background: open ? '#ff5f57' : '#d4d4d4',
              border: 'none', cursor: open ? 'pointer' : 'default', padding: 0,
              transition: 'background 200ms ease',
            }}
          />
          {/* Yellow — disabled */}
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: open ? '#ffbd2e' : '#d4d4d4', transition: 'background 200ms ease' }} />
          {/* Green — open */}
          <button
            onClick={() => setOpen(true)}
            title="Expand"
            style={{
              width: 12, height: 12, borderRadius: '50%',
              background: open ? '#28c840' : '#d4d4d4',
              border: 'none', cursor: !open ? 'pointer' : 'default', padding: 0,
              transition: 'background 200ms ease',
            }}
          />
        </div>

        {/* URL bar */}
        <div style={{
          flex: 1,
          background: '#fff',
          border: `1px solid ${B.gray300}`,
          borderRadius: 6,
          height: 22,
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: 6,
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={B.gray400} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ fontSize: 10, color: B.gray600, letterSpacing: '0.01em' }}>rtmsce.com/analysis</span>
        </div>
      </div>

      {/* ── Collapsible content ── */}
      <div style={{
        height: open ? APP_H : 0,
        overflow: 'hidden',
        transition: 'height 380ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ height: APP_H, overflowY: 'auto', background: B.gray100 }}>

          {/* Artemis app header — sticky inside scroll */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: BRAND,
            height: 38,
            display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 14,
          }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 400, color: '#fff', letterSpacing: '-0.005em' }}>SIDP</span>
            <div style={{ display: 'flex', gap: 1, fontSize: 10 }}>
              {['Dashboard', 'Reports ›', 'Applicants', 'Analysis', 'Options'].map(item => (
                <span key={item} style={{
                  color: item === 'Analysis' ? '#fff' : 'rgba(255,255,255,0.72)',
                  padding: '3px 7px', borderRadius: 3,
                  fontWeight: item === 'Analysis' ? 600 : 400,
                  background: item === 'Analysis' ? 'rgba(255,255,255,0.18)' : 'transparent',
                  userSelect: 'none',
                }}>{item}</span>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>LM</div>
          </div>

          {/* Dev ticker — below the app header */}
          <div style={{
            background: SCARLET, color: '#fff',
            fontSize: 14, fontWeight: 600,
            padding: '1px 0', overflow: 'hidden', whiteSpace: 'nowrap',
            userSelect: 'none',
          }}>
            <span className="rtms-ticker-inner" style={{ display: 'inline-block' }}>
              {TICKER_CHUNK}{TICKER_CHUNK}
            </span>
          </div>

          {/* Filter bar — sticky below header */}
          <div style={{
            position: 'sticky', top: 38, zIndex: 9,
            background: '#fff',
            borderBottom: `1px solid ${B.gray200}`,
            padding: '5px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: B.gray600 }}>Timeframe:</span>
            <div style={{ border: `1px solid ${B.gray300}`, borderRadius: 5, padding: '2px 7px', fontSize: 9, color: B.gray700 }}>2026S</div>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 9, fontWeight: 500, color: B.gray600 }}>Filter:</span>
            <div style={{ border: `1px solid ${B.gray300}`, borderRadius: 5, padding: '2px 7px', fontSize: 9, color: B.gray700, display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              Advanced
            </div>
          </div>

          {/* All analysis sections, continuous scroll */}
          <AnalysisContent />

        </div>
      </div>
    </div>
    </div>{/* end zoom wrapper */}
    </>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'But what is Artemis CE?', a: 'A Real-Time Management System for Civic Engagement (or aRTMSCE) is a set of approaches, policies, schemes, designs, and tools, and the logic that connects them. All elements of the system were tailored specifically for managing and analyzing Civic Engagement projects in order to support them with statistics.' },
  { q: 'Why focus on data?', a: 'Data allows us to make statements with certainty. If we reach a surprising conclusion, we can verify it with data.' },
  { q: 'If I don\'t study at AUCA, can I still use Artemis CE?', a: 'Absolutely! While the full toolset might not be available, we do have public resources (and are in the process of creating more!) to aid student leaders in collecting and analyzing quality data in order to continue their project!' },
  { q: 'If I want to implement Artemis CE at my home institution, how do I do that?', a: 'Reach out to Luna, preferably in person. We are always looking for new partners to expand this project!'},
];

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div style={{ borderBottom: `1px solid ${B.gray200}` }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', padding: '18px 0',
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: B.gray900, lineHeight: 1.4 }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SCARLET} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: 18 }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: B.gray600, lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    // Database / real-time sync
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v4c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 9v4c0 1.66 4.03 3 9 3s9-1.34 9-3V9" /><path d="M3 13v4c0 1.66 4.03 3 9 3s9-1.34 9-3v-4" /></svg>,
    title: 'Real-Time', desc: 'The system is accessible from any platform, at all times, and is centrally synchronized',
  },
  {
    // Pie chart
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>,
    title: 'Auto-Inferential', desc: 'Artemis CE performs a set of pre-made algorithmic analyses on any timeframe, taking care to clearly communicate results',
  },
  {
    // Laptop
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="2" y1="20" x2="22" y2="20" /></svg>,
    title: 'Fully Digital', desc: 'The system enables easy intermediate progress tracking through a centralized design',
  },
  {
    // Document
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
    title: 'Data-Oriented', desc: 'Artemis CE educates student leaders about best practices in data collection and analysis by example, enabling them to continue their projects',
  },
  {
    // List
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    title: 'Structured', desc: 'Artemis CE improves accessibility by making all forms structured, resulting in a greater amount of applications',
  },
  {
    // Rising line graph
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    title: '≥30% Improvement', desc: 'The system observed a consistent ≥30% improvement across all Key Performance Indicators',
  },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RtmsCE() {
  const isMobile = useIsMobile();
  const maxW = 900;
  const px = isMobile ? '1.25rem' : '2.5rem';
  const [viewW, setViewW] = useState(typeof window !== 'undefined' ? window.innerWidth : 900);
  useEffect(() => {
    const handler = () => setViewW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const pxNum = isMobile ? 20 : 40;
  const mockupScale = Math.min(1, (viewW - pxNum * 2) / WIN_W);

  return (
    <div style={{
      background: '#fff',
      minHeight: '100vh',
      fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <ThemedNavbar />

      <div style={{ paddingTop: 56 }}>
        <div style={{ maxWidth: maxW, margin: '0 auto', padding: isMobile ? `2.5rem ${px}` : `4rem ${px}` }}>

          {/* ── Quote ─────────────────────────────────────────────────────── */}
          <section style={{
            padding: isMobile ? '16px 18px' : '24px 28px',
            background: CALLOUT_BG,
            borderLeft: `4px solid ${SCARLET}`,
            borderRadius: '0 8px 8px 0',
            marginBottom: '3rem',
          }}>
            <p style={{ margin: 0, color: B.gray900, fontSize: isMobile ? 16 : 19, lineHeight: 1.55 }}>
              We have all of these amazing stories with no data to back them up.
            </p>
          </section>

          {/* ── Paragraph 1 ────────────────────────────────────────────────── */}
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: B.gray700, margin: '0 0 4rem' }}>
            Civic engagement is traditionally a narrative-based field, full of rich stories. 
            Yet, the world is becoming more and more data-oriented by the day.
            If only there existed a project which would combine the two...
          </p>

          {/* ── Intro heading ─────────────────────────────────────────────── */}
          <p style={{
            textAlign: 'center',
            fontSize: isMobile ? '1.6rem' : '2rem',
            fontWeight: 700,
            color: B.gray900,
            margin: '0 0 3rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Introducing Artemis CE
          </p>

          {/* ── Browser mockup ────────────────────────────────────────────── */}
          <div style={{ marginBottom: isMobile ? '3rem' : '5rem' }}>
            <BrowserMockup scale={mockupScale} />
          </div>

          {/* ── Paragraph 2 ───────────────────────────────────────────────── */}
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: B.gray700, margin: '0 0 4rem' }}>
            Artemis CE is a digital data-oriented grant management system, combining narratives with data to enable inferential decision making.
            Having spent nineteen months in development, it is built on the industry's best practices of grant management and data collection.
            It has been refined to prioritize ease of use, and has been deployed for two semesters at the AUCA Center for Civic Engagement.
            The system aims to have a full launch on React + Postgres in February of 2027.
          </p>
          
          <section style={{
            padding: isMobile ? '16px 18px' : '24px 28px',
            background: CALLOUT_BG,
            borderLeft: `4px solid ${SCARLET}`,
            borderRadius: '0 8px 8px 0',
            marginBottom: '3rem',
          }}>
            <p style={{ margin: 0, color: B.gray900, fontSize: isMobile ? 16 : 19, lineHeight: 1.55 }}>
              We believe that every project has the capacity to be data-oriented.
            </p>
          </section>


          {/* ── Features ──────────────────────────────────────────────────── */}
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ ...eyebrow, color: SCARLET, marginBottom: 8 }}>Features</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: B.gray900, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
                Artemis CE's Core Features
              </h2>
              <p style={{ fontSize: '0.95rem', color: B.gray500, margin: 0 }}>
                The system was designed to stack "wins" on all sides.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1rem',
            }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ ...card, padding: '1.25rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 9,
                    background: '#fff0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: SCARLET, marginBottom: '0.875rem',
                    border: `1px solid rgba(220,38,38,0.12)`,
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: B.gray900, marginBottom: '0.375rem' }}>{f.title}</div>
                  <p style={{ fontSize: '0.875rem', color: B.gray500, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ ...eyebrow, color: SCARLET, marginBottom: 8 }}>FAQ</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: B.gray900, margin: 0, letterSpacing: '-0.01em' }}>
                Frequently Asked Questions
              </h2>
            </div>
            <div style={{ borderTop: `1px solid ${B.gray200}` }}>
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} defaultOpen={true} />
              ))}
            </div>
          </div>

          {/* ── Contact ───────────────────────────────────────────────────── */}
          <div style={{
            padding: isMobile ? '1.75rem 1.25rem' : '3rem 2.5rem',
            background: CALLOUT_BG,
            borderLeft: `4px solid ${SCARLET}`,
            borderRadius: '0 8px 8px 0',
            marginBottom: '4rem',
          }}>
            <div style={{ ...eyebrow, color: SCARLET, marginBottom: 10 }}>Contact</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: B.gray900, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
              We would love to collaborate with you!
            </h2>
            <p style={{ fontSize: '0.95rem', color: B.gray600, margin: '0 0 1.75rem', lineHeight: 1.7 }}>
              Do not hesitate to reach out: that's what Get Engaged 2026 is for!
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              <a href="mailto:luna@lunamaltseva.dev" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: SCARLET, color: '#fff',
                padding: '0.6rem 1.25rem', borderRadius: 7,
                fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
                transition: 'background 150ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = SCARLET2)}
                onMouseLeave={e => (e.currentTarget.style.background = SCARLET)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                luna@lunamaltseva.dev
              </a>
              <a href="https://instagram.com/lunamaltseva" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: SCARLET,
                padding: '0.6rem 1.25rem', borderRadius: 7,
                fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
                border: `1.5px solid ${SCARLET}`,
                transition: 'background 150ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                @lunamaltseva
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
