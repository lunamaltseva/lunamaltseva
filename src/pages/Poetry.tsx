import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

type HKey = 'e' | 'p' | 'lh';
type HVals = Record<HKey, number>;

interface CycleDay { day: number; phase: string; lh: number; estrogen: number; progesterone: number }
interface PoemData { text: string; author: string; contextAbove: string; contextBelow: string; source: string }

const CYCLE_DATA: CycleDay[] = [
  { day: 1,  phase: 'Menstrual',  lh: 4.53,  estrogen: 108.13, progesterone: 5.48  },
  { day: 2,  phase: 'Menstrual',  lh: 4.57,  estrogen: 97.49,  progesterone: 4.18  },
  { day: 3,  phase: 'Menstrual',  lh: 4.72,  estrogen: 91.07,  progesterone: 3.5   },
  { day: 4,  phase: 'Menstrual',  lh: 4.86,  estrogen: 89.16,  progesterone: 3.23  },
  { day: 5,  phase: 'Menstrual',  lh: 4.97,  estrogen: 89.7,   progesterone: 3.07  },
  { day: 6,  phase: 'Follicular', lh: 5.12,  estrogen: 91.39,  progesterone: 3.05  },
  { day: 7,  phase: 'Follicular', lh: 5.29,  estrogen: 94.16,  progesterone: 3.15  },
  { day: 8,  phase: 'Follicular', lh: 5.45,  estrogen: 98.59,  progesterone: 3.32  },
  { day: 9,  phase: 'Follicular', lh: 5.58,  estrogen: 104.06, progesterone: 3.57  },
  { day: 10, phase: 'Follicular', lh: 5.71,  estrogen: 109.7,  progesterone: 4.08  },
  { day: 11, phase: 'Follicular', lh: 6.09,  estrogen: 116.98, progesterone: 4.67  },
  { day: 12, phase: 'Follicular', lh: 6.86,  estrogen: 127.32, progesterone: 4.95  },
  { day: 13, phase: 'Follicular', lh: 7.97,  estrogen: 138.5,  progesterone: 4.78  },
  { day: 14, phase: 'Fertility',  lh: 9.2,   estrogen: 146.48, progesterone: 4.53  },
  { day: 15, phase: 'Fertility',  lh: 10.36, estrogen: 150.95, progesterone: 4.56  },
  { day: 16, phase: 'Fertility',  lh: 11.1,  estrogen: 152.55, progesterone: 4.91  },
  { day: 17, phase: 'Luteal',     lh: 11.02, estrogen: 151.31, progesterone: 5.44  },
  { day: 18, phase: 'Luteal',     lh: 10.1,  estrogen: 147.19, progesterone: 6.04  },
  { day: 19, phase: 'Luteal',     lh: 8.72,  estrogen: 142.91, progesterone: 6.71  },
  { day: 20, phase: 'Luteal',     lh: 7.49,  estrogen: 141.51, progesterone: 7.6   },
  { day: 21, phase: 'Luteal',     lh: 6.49,  estrogen: 145.17, progesterone: 8.93  },
  { day: 22, phase: 'Luteal',     lh: 5.78,  estrogen: 151.07, progesterone: 10.46 },
  { day: 23, phase: 'Luteal',     lh: 5.39,  estrogen: 153.21, progesterone: 11.5  },
  { day: 24, phase: 'Luteal',     lh: 5.32,  estrogen: 150.07, progesterone: 11.6  },
  { day: 25, phase: 'Luteal',     lh: 5.26,  estrogen: 145.41, progesterone: 11.05 },
  { day: 26, phase: 'Luteal',     lh: 5.1,   estrogen: 140.84, progesterone: 10.21 },
  { day: 27, phase: 'Luteal',     lh: 4.88,  estrogen: 132.98, progesterone: 8.97  },
  { day: 28, phase: 'Luteal',     lh: 4.66,  estrogen: 121.24, progesterone: 7.27  },
];

const mm = (v: number, lo: number, hi: number) => (v - lo) / (hi - lo);
const tz = (v: number, hi: number) => v / hi;
const field = (k: 'e' | 'p' | 'lh') => k === 'e' ? 'estrogen' : k === 'p' ? 'progesterone' : 'lh';
const bounds = (k: 'e' | 'p' | 'lh') => {
  const vals = CYCLE_DATA.map(d => d[field(k)]);
  return [Math.min(...vals), Math.max(...vals)] as const;
};

const [E_MIN, E_MAX] = bounds('e');
const [P_MIN, P_MAX] = bounds('p');
const [LH_MIN, LH_MAX] = bounds('lh');

const poemNorm  = { e: CYCLE_DATA.map(d => mm(d.estrogen, E_MIN, E_MAX)), p: CYCLE_DATA.map(d => mm(d.progesterone, P_MIN, P_MAX)), lh: CYCLE_DATA.map(d => mm(d.lh, LH_MIN, LH_MAX)) };
const graphNorm = { e: CYCLE_DATA.map(d => tz(d.estrogen, E_MAX)), p: CYCLE_DATA.map(d => tz(d.progesterone, P_MAX)), lh: CYCLE_DATA.map(d => tz(d.lh, LH_MAX)) };

function catmullRom(arr: number[], t: number): number {
  const n = arr.length, c = ((t % n) + n) % n, i = Math.floor(c), f = c - i;
  const [a, b, d, e] = [arr[((i - 1) + n) % n], arr[i], arr[(i + 1) % n], arr[(i + 2) % n]];
  return 0.5 * ((2*b) + (-a+d)*f + (2*a - 5*b + 4*d - e)*f*f + (-a + 3*b - 3*d + e)*f*f*f);
}

function interpolate(t: number): HVals {
  return { e: Math.max(0, Math.min(1, catmullRom(poemNorm.e, t))), p: Math.max(0, Math.min(1, catmullRom(poemNorm.p, t))), lh: Math.max(0, Math.min(1, catmullRom(poemNorm.lh, t))) };
}

function interpolateGraph(t: number): HVals {
  return { e: Math.max(0, catmullRom(graphNorm.e, t)), p: Math.max(0, catmullRom(graphNorm.p, t)), lh: Math.max(0, catmullRom(graphNorm.lh, t)) };
}

const POEM_DATA: PoemData[] = [
  { text: 'Now all the stars are making love with each other', author: 'Forough Farrokhzad', contextAbove: 'I sense\nI know\nthe moment of prayer, which moment it is', contextBelow: '', source: 'Border Walls' },
  { text: 'Thine alabaster cities gleam undimmed by human tears!', author: 'Katharine Lee Bates', contextAbove: 'America! America! God shed His grace on thee,', contextBelow: 'And crown thy good with brotherhood from sea to shining sea!', source: 'America the Beautiful' },
  { text: 'I need you to see me like a tattoo on the inside of your eyelid', author: 'Afona', contextAbove: 'I need\n that when you close your eyes against the sun', contextBelow: '', source: 'Natalia Medvedeva' },
  { text: 'Still, I rise.', author: 'Maya Angelou', contextAbove: 'Just like hopes springing high,', contextBelow: '\nDid you want to see me broken?', source: 'Still I Rise' },
  { text: 'When I am an old woman I shall wear purple', author: 'Jenny Joseph', contextAbove: '', contextBelow: 'With a red hat which doesn\'t go, and doesn\'t suit me.', source: 'Warning' },
  { text: 'Oh, how I love the resoluteness', author: 'Marilyn Chin', contextAbove: 'I am Marilyn Mei Ling Chin', contextBelow: 'of that first person singular', source: 'How I Got My Name' },
  { text: 'They fear when our shameless grief and anger flows in sight', author: 'Mirva Haltia', contextAbove: '', contextBelow: '', source: 'Contemporary Karelian poetry' },
  { text: '"Hope" is the thing with feathers', author: 'Emily Dickinson', contextAbove: '', contextBelow: 'That perches in the soul', source: 'Poem 314' },
  { text: 'I let go of how difficult it has been to be a woman', author: 'Bhanu Kapil', contextAbove: 'In the underground spring,', contextBelow: 'or an immigrant, or a mother, or a writer.', source: 'Seven Poems for Seven Flowers' },
  { text: 'Let all who prate of Beauty hold their peace', author: 'Edna St. Vincent Millay', contextAbove: '', contextBelow: 'And lay them prone upon the earth and cease', source: 'Euclid Alone Has Looked on Beauty Bare' },
  { text: 'And somewhere, each of us must help the other die.', author: 'Adrienne Rich', contextAbove: 'I touch you knowing we weren\u2019t born tomorrow,\nand somehow, each of us will help the other live,', contextBelow: '', source: 'Twenty-One Love Poems, III' },
  { text: 'Because I could not stop for Death \u2013', author: 'Emily Dickinson', contextAbove: '', contextBelow: 'He kindly stopped for me \u2014', source: 'Poem 479' },
  { text: 'Do not approach my triumphant night. I don\u2019t know you.', author: 'Anna Akhmatova', contextAbove: '', contextBelow: '', source: 'Anthology' },
  { text: 'Male is an incomplete female, a walking abortion, aborted at the gene stage.', author: 'Valerie Solanas', contextAbove: '', contextBelow: '', source: 'SCUM Manifesto' },
];

const POEMS = POEM_DATA.map(d => d.text);
const N = POEMS.length;

const hormoneLine = (v: number) => N - 1 - Math.min(N - 1, Math.floor(v * N));

const E_NPS  = ['all the stars', 'alabaster cities', 'a tattoo on the inside of your eyelid', 'I rise', 'an old woman', 'the resoluteness', 'our shameless grief and anger', 'the thing with feathers', 'a woman', 'Beauty', 'each of us', 'Death', 'my triumphant night', 'a walking abortion'];
const LH_NPS = ['love with each other', 'human tears', 'your eyelid', 'Still', 'purple', 'how I love', 'in sight', 'feathers', 'how difficult', 'their peace', 'the other die', 'for Death', 'I don\u2019t know you', 'the gene stage'];
const P_VERBS = ['are making', 'gleam undimmed', 'see me', 'rise', 'shall wear', 'love', 'fear', 'is', 'let go', 'hold their peace', 'must help', 'could not stop', 'Do not approach', 'aborted'];

function buildSentence(ei: number, pi: number, li: number) {
  return `${E_NPS[ei]} ${P_VERBS[pi]} ${LH_NPS[li]}`;
}

function estimateRange(offsetDay: number, ei: number, pi: number, li: number): string {
  const H = 1 / 24;
  const snapped = Math.round(offsetDay * 24) / 24;

  const matches = (t: number) => {
    const v = interpolate(t - 1);
    return hormoneLine(v.e) === ei && hormoneLine(v.p) === pi && hormoneLine(v.lh) === li;
  };

  let lo = 0, hi = 0;
  for (let d = H; d <= 28; d += H) { if (!matches(snapped - d)) { lo = d; break; } }
  for (let d = H; d <= 28; d += H) { if (!matches(snapped + d)) { hi = d; break; } }

  const fmt = (frac: number) => {
    const hrs = Math.round(frac * 24);
    return `Day ${Math.floor(hrs / 24) + 1}, ${String(hrs % 24).padStart(2, '0')}:00`;
  };

  const startFrac = (((snapped - lo) % 28) + 28) % 28;
  const endFrac   = (((snapped + hi) % 28) + 28) % 28;
  return `Translated: the time is between ${fmt(startFrac)} and ${fmt(endFrac)}`;
}

function renderLine(text: string, highlights: { phrase: string; color: string }[]): React.ReactNode {
  type Span = { start: number; end: number; color: string };
  const spans: Span[] = [];
  for (const { phrase, color } of highlights) {
    const idx = text.toLowerCase().indexOf(phrase.toLowerCase());
    if (idx >= 0) spans.push({ start: idx, end: idx + phrase.length, color });
  }
  if (!spans.length) return text;
  spans.sort((a, b) => a.start - b.start);
  const merged: Span[] = [];
  for (const s of spans) { if (!merged.length || s.start >= merged[merged.length - 1].end) merged.push(s); }
  const parts: React.ReactNode[] = [];
  let cur = 0;
  for (const { start, end, color } of merged) {
    if (start > cur) parts.push(text.slice(cur, start));
    parts.push(<span key={start} style={{ color, fontWeight: 600 }}>{text.slice(start, end)}</span>);
    cur = end;
  }
  if (cur < text.length) parts.push(text.slice(cur));
  return parts;
}

function PoemTooltip({ poem, isMobile }: { poem: PoemData; isMobile: boolean }) {
  const base: React.CSSProperties = {
    position: 'absolute', bottom: '100%', left: 0, marginBottom: '0.5rem',
    background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px',
    padding: isMobile ? '0.7rem 0.9rem' : '0.85rem 1.1rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    zIndex: 10, maxWidth: isMobile ? '85vw' : '480px', minWidth: '200px',
    fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.6, pointerEvents: 'none',
  };
  return (
    <div style={base}>
      {poem.contextAbove && <div style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic', marginBottom: '0.25rem', whiteSpace: 'pre-line' }}>{poem.contextAbove}</div>}
      <div style={{ fontSize: '0.95rem', color: '#222', fontWeight: 500 }}>{poem.text}</div>
      {poem.contextBelow && <div style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic', marginTop: '0.25rem', whiteSpace: 'pre-line' }}>{poem.contextBelow}</div>}
      <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#bbb', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.4rem', letterSpacing: '0.02em' }}>
        {poem.author && <span>{poem.author}</span>}
        {poem.author && poem.source && <span> — </span>}
        {poem.source && <span style={{ fontStyle: 'italic' }}>{poem.source}</span>}
      </div>
    </div>
  );
}

const PHASES = [
  { name: 'Menstrual',  start: 1,  end: 5  },
  { name: 'Follicular', start: 6,  end: 13 },
  { name: 'Fertility',  start: 14, end: 16 },
  { name: 'Luteal',     start: 17, end: 28 },
];

const COLOR_E = '#c46b8f', COLOR_P = '#d4a843', COLOR_LH = '#5b8fd4';
const PAD_L = 2, PAD_R = 0, PAD_TOP = 12, PAD_PHASE = 18, PAD_DAYS = 18;
const PAD_BOT = PAD_PHASE + PAD_DAYS, VIEW_DAYS = 28;
const GRAPH_SCALE: Record<HKey, number> = { e: 0.82, p: 0.6, lh: 0.7 };

function makeHelpers(innerW: number, innerH: number) {
  const dayToX = (day: number, off: number) => PAD_L + ((day - off) / VIEW_DAYS) * innerW;
  const valToY = (v: number) => PAD_TOP + innerH - v * innerH;

  const tracePath = (off: number, key: HKey, closed: boolean) => {
    const s0 = off - 0.5, s1 = off + VIEW_DAYS + 0.5;
    const steps = Math.ceil((s1 - s0) * 12);
    const baseY = PAD_TOP + innerH;
    let d = closed ? `M ${dayToX(s0, off).toFixed(2)},${baseY.toFixed(2)}` : '';
    for (let s = 0; s <= steps; s++) {
      const df = s0 + (s / steps) * (s1 - s0);
      const x = dayToX(df, off).toFixed(2);
      const y = valToY(interpolateGraph(df - 1)[key] * GRAPH_SCALE[key]).toFixed(2);
      d += `${(!closed && s === 0) ? 'M' : ' L'} ${x},${y}`;
    }
    if (closed) d += ` L ${dayToX(s1, off).toFixed(2)},${baseY.toFixed(2)} Z`;
    return d;
  };

  return { dayToX, tracePath };
}

function IconBtn({ onClick, disabled, children, title }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      background: 'none', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '50%',
      padding: '8px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.3 : 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center',
      lineHeight: 0, width: '34px', height: '34px', transition: 'opacity 0.2s',
    }}>{children}</button>
  );
}

const SlowerIcon = () => <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><polygon points="8,1 1,7 8,13" fill="#555" /><polygon points="15,1 8,7 15,13" fill="#555" /></svg>;
const FasterIcon = () => <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><polygon points="1,1 8,7 1,13" fill="#555" /><polygon points="8,1 15,7 8,13" fill="#555" /></svg>;
const PlayIcon = () => <svg width="11" height="12" viewBox="0 0 12 14" fill="none"><polygon points="2,1 11,7 2,13" fill="#555" /></svg>;
const PauseIcon = () => <svg width="11" height="12" viewBox="0 0 12 14" fill="none"><rect x="1" y="1" width="3.5" height="12" rx="0.5" fill="#555" /><rect x="7.5" y="1" width="3.5" height="12" rx="0.5" fill="#555" /></svg>;

function CycleGraph({ offsetDay, width, height, onDragStart, onDragMove, onDragEnd }: {
  offsetDay: number; width: number; height: number;
  onDragStart: () => void; onDragMove: (v: number) => void; onDragEnd: () => void;
}) {
  const innerW = width - PAD_L - PAD_R, innerH = height - PAD_TOP - PAD_BOT;
  const { dayToX, tracePath } = makeHelpers(innerW, innerH);

  const repMin = Math.floor((offsetDay - 1) / 28) - 1;
  const repMax = Math.ceil((offsetDay + VIEW_DAYS) / 28) + 1;

  const ovulationXs: number[] = [];
  for (let r = repMin; r <= repMax; r++) {
    const x = dayToX(14 + r * 28, offsetDay);
    if (x >= PAD_L && x <= PAD_L + innerW) ovulationXs.push(x);
  }

  const phaseItems: { name: string; cx: number; x1: number; clipX: number; clipW: number }[] = [];
  for (let r = repMin; r <= repMax; r++) {
    for (const ph of PHASES) {
      const x1 = dayToX(ph.start + r * 28, offsetDay);
      const x2 = dayToX(ph.end + 1 + r * 28, offsetDay);
      if (x2 > PAD_L && x1 < PAD_L + innerW) {
        const cx = Math.max(x1, PAD_L), cw = Math.min(x2, PAD_L + innerW) - cx;
        phaseItems.push({ name: ph.name, cx: cx + cw / 2, x1: cx, clipX: cx, clipW: cw });
      }
    }
  }

  const dayTicks: { label: number; x: number }[] = [];
  for (let r = repMin; r <= repMax; r++) {
    for (const d of [1, 14, 28]) {
      const x = dayToX(d + r * 28, offsetDay);
      if (x >= PAD_L && x <= PAD_L + innerW) dayTicks.push({ label: d, x });
    }
  }

  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null);
  const touchRef = useRef<{ startX: number; startOffset: number } | null>(null);

  const md = (e: React.MouseEvent) => { dragRef.current = { startX: e.clientX, startOffset: offsetDay }; onDragStart(); e.preventDefault(); };
  const mm = (e: React.MouseEvent) => { if (dragRef.current) onDragMove(dragRef.current.startOffset - ((e.clientX - dragRef.current.startX) / innerW) * VIEW_DAYS); };
  const mu = () => { if (dragRef.current) { dragRef.current = null; onDragEnd(); } };
  const ts = (e: React.TouchEvent) => { touchRef.current = { startX: e.touches[0].clientX, startOffset: offsetDay }; onDragStart(); };
  const tmv = (e: React.TouchEvent) => { if (touchRef.current) onDragMove(touchRef.current.startOffset - ((e.touches[0].clientX - touchRef.current.startX) / innerW) * VIEW_DAYS); };
  const te = () => { if (touchRef.current) { touchRef.current = null; onDragEnd(); } };

  const yBase = PAD_TOP + innerH;

  return (
    <svg width={width} height={height} style={{ display: 'block', fontFamily: "'DM Mono', monospace", cursor: 'grab', userSelect: 'none' }}
      onMouseDown={md} onMouseMove={mm} onMouseUp={mu} onMouseLeave={mu}
      onTouchStart={ts} onTouchMove={tmv} onTouchEnd={te}>

      <defs>
        <clipPath id="graph-clip"><rect x={PAD_L} y={PAD_TOP} width={innerW} height={innerH} /></clipPath>
        {(['e', 'p', 'lh'] as HKey[]).map(k => (
          <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={{ e: COLOR_E, p: COLOR_P, lh: COLOR_LH }[k]} stopOpacity={k === 'e' ? '0.12' : '0.10'} />
            <stop offset="100%" stopColor={{ e: COLOR_E, p: COLOR_P, lh: COLOR_LH }[k]} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      <rect x={PAD_L} y={PAD_TOP} width={innerW} height={innerH} fill="#fff" />

      {ovulationXs.map((x, i) => (
        <g key={i} clipPath="url(#graph-clip)">
          <line x1={x} y1={PAD_TOP} x2={x} y2={yBase} stroke="rgba(0,0,0,0.06)" strokeWidth={1} strokeDasharray="4,4" />
          <text x={x + 4} y={PAD_TOP + 11} fontSize={7.5} fill="rgba(0,0,0,0.2)" fontStyle="italic" letterSpacing="0.04em">ovulation</text>
        </g>
      ))}

      {(['e', 'p', 'lh'] as HKey[]).map(k => <path key={`a-${k}`} d={tracePath(offsetDay, k, true)} fill={`url(#grad-${k})`} clipPath="url(#graph-clip)" />)}
      {(['e', 'p', 'lh'] as HKey[]).map(k => <path key={`l-${k}`} d={tracePath(offsetDay, k, false)} fill="none" stroke={{ e: COLOR_E, p: COLOR_P, lh: COLOR_LH }[k]} strokeWidth={2} clipPath="url(#graph-clip)" opacity={0.85} />)}

      <line x1={PAD_L} y1={yBase} x2={PAD_L + innerW} y2={yBase} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
      <line x1={PAD_L} y1={PAD_TOP} x2={PAD_L} y2={yBase} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />

      {phaseItems.map(({ name, cx, x1, clipX, clipW }, i) => (
        <g key={i}>
          <clipPath id={`pc-${i}`}><rect x={clipX} y={yBase} width={clipW} height={PAD_PHASE} /></clipPath>
          <line x1={x1} y1={yBase} x2={x1} y2={yBase + PAD_PHASE} stroke="rgba(0,0,0,0.05)" strokeWidth={1} />
          <text x={cx} y={yBase + PAD_PHASE - 4} textAnchor="middle" fontSize={7.5} fill="rgba(0,0,0,0.3)" letterSpacing="0.04em" clipPath={`url(#pc-${i})`}>{name}</text>
        </g>
      ))}

      {dayTicks.map(({ label, x }, i) => (
        <text key={i} x={x} y={yBase + PAD_PHASE + PAD_DAYS - 4} textAnchor="middle" fontSize={8} fill="rgba(0,0,0,0.25)">{label}</text>
      ))}

      <g transform={`translate(${PAD_L + innerW - 6}, 14)`}>
        {([['e', COLOR_E, 'Estrogen', 0], ['p', COLOR_P, 'Progesterone', 15], ['lh', COLOR_LH, 'LH', 30]] as const).map(([, c, label, y]) => (
          <g key={label}>
            <line x1={-100} y1={y} x2={-86} y2={y} stroke={c} strokeWidth={2} opacity={0.85} />
            <text x={-82} y={y + 4} fontSize={8.5} fill={c} textAnchor="start" opacity={0.8} letterSpacing="0.02em">{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

const SPEED_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20];

const STYLE_ID = '__poetry-styles';
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&display=swap');
    @keyframes poetry-fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes poetry-glow { 0%, 100% { opacity: 0.85; } 50% { opacity: 1; } }
  `;
  document.head.appendChild(el);
}

export default function Poetry() {
  const isMobile = useIsMobile();
  useEffect(() => { ensureStyles(); }, []);

  const [dayFrac, setDayFrac] = useState(1.0);
  const [speedIdx, setSpeedIdx] = useState(4);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const wasPlayingRef = useRef(false);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const speed = SPEED_STEPS[speedIdx];

  const tick = useCallback((ts: number) => {
    if (lastTsRef.current !== null) setDayFrac(d => d + (ts - lastTsRef.current!) / 1000 / speed);
    lastTsRef.current = ts;
    rafRef.current = requestAnimationFrame(tick);
  }, [speed]);

  useEffect(() => {
    if (paused) { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; lastTsRef.current = null; return; }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [paused, tick]);

  const handleDragStart = useCallback(() => { wasPlayingRef.current = !paused; setPaused(true); }, [paused]);
  const handleDragMove = useCallback((v: number) => setDragOffset(v), []);
  const handleDragEnd = useCallback(() => {
    if (dragOffset !== null) { setDayFrac(dragOffset); setDragOffset(null); }
    if (wasPlayingRef.current) setPaused(false);
  }, [dragOffset]);

  const offsetDay = dragOffset ?? dayFrac;
  const vals = interpolate(offsetDay - 1);
  const eIdx = hormoneLine(vals.e), pIdx = hormoneLine(vals.p), lhIdx = hormoneLine(vals.lh);
  const sentence = buildSentence(eIdx, pIdx, lhIdx);
  const timeRange = estimateRange(offsetDay, eIdx, pIdx, lhIdx);

  const poemLinesRef = useRef<HTMLDivElement>(null);
  const graphColRef = useRef<HTMLDivElement>(null);
  const [poemHeight, setPoemHeight] = useState(500);
  const [graphW, setGraphW] = useState(600);

  useEffect(() => {
    const el = poemLinesRef.current; if (!el) return;
    const ro = new ResizeObserver(entries => setPoemHeight(entries[0].contentRect.height));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = graphColRef.current; if (!el) return;
    const ro = new ResizeObserver(entries => setGraphW(entries[0].contentRect.width));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const graphH = isMobile ? 220 : poemHeight;
  const font = "'Source Serif 4', Georgia, serif";
  const fontSize = isMobile ? '1.05rem' : '1.3rem';
  const pad = isMobile ? '2rem 1.25rem' : '4rem 3.5rem';

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: pad, boxSizing: 'border-box', animation: 'poetry-fade-in 0.8s ease-out both' }}>

      <h1 style={{ fontFamily: font, fontSize: isMobile ? '1.6rem' : '2.4rem', fontWeight: 300, color: '#111', marginBottom: isMobile ? '0.3rem' : '0.4rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        Menstrual Cycle Clock
      </h1>
      <div style={{ width: isMobile ? 40 : 56, height: 2, background: `linear-gradient(90deg, ${COLOR_E}, ${COLOR_P}, ${COLOR_LH})`, marginBottom: isMobile ? '1.5rem' : '2.5rem', borderRadius: 1 }} />

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '2rem' : '3.5rem', alignItems: 'flex-start' }}>

        <div style={{ flex: '0 0 auto', minWidth: 0, width: isMobile ? '100%' : undefined }}>
          <div style={{ marginBottom: isMobile ? '1.25rem' : '2rem', maxWidth: 540 }}>
            <div style={{ fontFamily: font, fontSize: isMobile ? '1rem' : '1.15rem', color: '#333', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.8, animation: 'poetry-glow 4s ease-in-out infinite' }}>
              {sentence}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: isMobile ? '0.7rem' : '0.75rem', color: '#bbb', marginTop: '0.35rem', letterSpacing: '0.05em' }}>
              {timeRange}
            </div>
          </div>

          <div ref={poemLinesRef}>
            {POEMS.map((line, i) => {
              const active = i === eIdx || i === pIdx || i === lhIdx;
              const hl: { phrase: string; color: string }[] = [];
              if (i === eIdx)  hl.push({ phrase: E_NPS[i],  color: COLOR_E });
              if (i === pIdx)  hl.push({ phrase: P_VERBS[i], color: COLOR_P });
              if (i === lhIdx) hl.push({ phrase: LH_NPS[i],  color: COLOR_LH });
              return (
                <div key={i} style={{ marginBottom: isMobile ? '0.4rem' : '0.6rem', position: 'relative', cursor: 'default' }}
                  onMouseEnter={() => setHoveredLine(i)} onMouseLeave={() => setHoveredLine(null)}>
                  <span style={{ fontFamily: font, fontSize, color: '#111', lineHeight: 1.75, opacity: active ? 1 : 0.15, fontWeight: active ? 500 : 300, letterSpacing: '-0.01em' }}>
                    {renderLine(line, hl)}
                  </span>
                  {hoveredLine === i && <PoemTooltip poem={POEM_DATA[i]} isMobile={isMobile} />}
                </div>
              );
            })}
          </div>
        </div>

        <div ref={graphColRef} style={{ flex: isMobile ? '0 0 auto' : '1 1 0', minWidth: 0, width: isMobile ? '100%' : undefined }}>
          <CycleGraph offsetDay={offsetDay} width={graphW} height={graphH}
            onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} />
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}>
            <IconBtn onClick={() => setSpeedIdx(i => Math.min(SPEED_STEPS.length - 1, i + 1))} disabled={speedIdx >= SPEED_STEPS.length - 1} title="Slower"><SlowerIcon /></IconBtn>
            <IconBtn onClick={() => setPaused(p => !p)} title={paused ? 'Play' : 'Pause'}>{paused ? <PlayIcon /> : <PauseIcon />}</IconBtn>
            <IconBtn onClick={() => setSpeedIdx(i => Math.max(0, i - 1))} disabled={speedIdx <= 0} title="Faster"><FasterIcon /></IconBtn>
          </div>
        </div>
      </div>

      <div style={{ marginTop: isMobile ? '2.5rem' : '4rem', fontFamily: font, fontSize: isMobile ? '0.95rem' : '1.1rem', color: '#aaa', lineHeight: 1.8, fontWeight: 300, letterSpacing: '0.005em' }}>
        <p style={{ margin: 0 }}>
          Though it may at first seem complicated, the Menstrual Clock makes use of the composite nature of the menstrual cycle to tell time. Based on hormonal levels of Estrogen, Progesterone, and Luteinizing Hormone, attained from averaging a PhysioNet self-report sample, the clock selects parts of the 14 excerpts from poems written by female authors, composing a sentence that can be used to communicate time.
        </p>
        <p style={{ margin: '0.75rem 0 0 0' }}>
          Hormones are color-coded: Estrogen in pink, Progesterone in yellow, and Luteinizing Hormone in blue. Depending on the time of the cycle, levels of these hormones increase or decrease. The clock displays different quotes based on the levels of different hormones. The quote height is determined by the hormone level.
        </p>
        <p style={{ margin: '0.75rem 0 0 0' }}>
          The selected quotes vary in emotional intensity, as mood often depends on hormonal levels during different phases of the cycle.
        </p>
        <p style={{ margin: '1.25rem 0 0 0', fontStyle: 'italic', fontWeight: 400 }}>
          Authors: Luna Maltseva &amp; Daria Yurishcheva
        </p>
      </div>
    </div>
  );
}
