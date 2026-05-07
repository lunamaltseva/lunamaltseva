import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

type HKey = 'e' | 'p' | 'lh' | 'fsh' | 'test';
type HVals = Record<HKey, number>;

interface CycleDay { day: number; phase: string; estrogen: number; progesterone: number; lh: number; fsh: number; testosterone: number }
interface PoemData { text: string; author: string; contextAbove: string; contextBelow: string; source: string }

const CYCLE_DATA: CycleDay[] = [
  { day: 1,  phase: 'Menstrual',  estrogen: 40,  progesterone: 0.8, lh: 3,  fsh: 5.5, testosterone: 25 },
  { day: 2,  phase: 'Menstrual',  estrogen: 35,  progesterone: 0.6, lh: 3.25,  fsh: 6.5, testosterone: 26 },
  { day: 3,  phase: 'Menstrual',  estrogen: 32,  progesterone: 0.5, lh: 3.5,  fsh: 7.5, testosterone: 26 },
  { day: 4,  phase: 'Menstrual',  estrogen: 35,  progesterone: 0.4, lh: 3.75,  fsh: 8.0, testosterone: 27 },
  { day: 5,  phase: 'Menstrual',  estrogen: 40,  progesterone: 0.4, lh: 4,  fsh: 7.5, testosterone: 28 },
  { day: 6,  phase: 'Follicular', estrogen: 50,  progesterone: 0.5, lh: 4.25,  fsh: 6.8, testosterone: 29 },
  { day: 7,  phase: 'Follicular', estrogen: 65,  progesterone: 0.5, lh: 4.5,  fsh: 6.0, testosterone: 31 },
  { day: 8,  phase: 'Follicular', estrogen: 85,  progesterone: 0.6, lh: 4.75,  fsh: 5.5, testosterone: 33 },
  { day: 9,  phase: 'Follicular', estrogen: 110, progesterone: 0.6, lh: 5,  fsh: 5.2, testosterone: 35 },
  { day: 10, phase: 'Follicular', estrogen: 140, progesterone: 0.7, lh: 5.25,  fsh: 5.0, testosterone: 38 },
  { day: 11, phase: 'Follicular', estrogen: 180, progesterone: 0.8, lh: 6,  fsh: 5.5, testosterone: 40 },
  { day: 12, phase: 'Follicular', estrogen: 250, progesterone: 0.9, lh: 10, fsh: 7.0, testosterone: 43 },
  { day: 13, phase: 'Follicular', estrogen: 300, progesterone: 1.0, lh: 30, fsh: 12,  testosterone: 48 },
  { day: 14, phase: 'Fertility',  estrogen: 280, progesterone: 1.5, lh: 55, fsh: 18,  testosterone: 50 },
  { day: 15, phase: 'Fertility',  estrogen: 200, progesterone: 2.5, lh: 25, fsh: 10,  testosterone: 45 },
  { day: 16, phase: 'Fertility',  estrogen: 150, progesterone: 4,   lh: 10, fsh: 5.5, testosterone: 40 },
  { day: 17, phase: 'Luteal',     estrogen: 120, progesterone: 6,   lh: 5,  fsh: 4.0, testosterone: 36 },
  { day: 18, phase: 'Luteal',     estrogen: 110, progesterone: 9,   lh: 4.75,  fsh: 3.5, testosterone: 33 },
  { day: 19, phase: 'Luteal',     estrogen: 120, progesterone: 12,  lh: 4.5,  fsh: 3.2, testosterone: 31 },
  { day: 20, phase: 'Luteal',     estrogen: 140, progesterone: 15,  lh: 4.25,  fsh: 3.0, testosterone: 29 },
  { day: 21, phase: 'Luteal',     estrogen: 160, progesterone: 17,  lh: 4,  fsh: 2.8, testosterone: 28 },
  { day: 22, phase: 'Luteal',     estrogen: 150, progesterone: 16,  lh: 3.75,  fsh: 2.8, testosterone: 27 },
  { day: 23, phase: 'Luteal',     estrogen: 135, progesterone: 14,  lh: 3.5,  fsh: 3.0, testosterone: 27 },
  { day: 24, phase: 'Luteal',     estrogen: 120, progesterone: 11,  lh: 3.25,  fsh: 3.2, testosterone: 26 },
  { day: 25, phase: 'Luteal',     estrogen: 100, progesterone: 8,   lh: 3,  fsh: 3.5, testosterone: 26 },
  { day: 26, phase: 'Luteal',     estrogen: 80,  progesterone: 5,   lh: 2.75,  fsh: 4.0, testosterone: 25 },
  { day: 27, phase: 'Luteal',     estrogen: 55,  progesterone: 2.5, lh: 2.7,  fsh: 4.5, testosterone: 25 },
  { day: 28, phase: 'Luteal',     estrogen: 45,  progesterone: 1.2, lh: 2.75,  fsh: 5.0, testosterone: 25 },
];

const fieldMap: Record<HKey, keyof CycleDay> = { e: 'estrogen', p: 'progesterone', lh: 'lh', fsh: 'fsh', test: 'testosterone' };
const minmax = (v: number, lo: number, hi: number) => (v - lo) / (hi - lo);
const truezero = (v: number, hi: number) => v / hi;
const getBounds = (k: HKey) => { const v = CYCLE_DATA.map(d => d[fieldMap[k]] as number); return [Math.min(...v), Math.max(...v)] as const; };

const [E_MIN, E_MAX] = getBounds('e'), [P_MIN, P_MAX] = getBounds('p'), [LH_MIN, LH_MAX] = getBounds('lh');
const [FSH_MIN, FSH_MAX] = getBounds('fsh'), [T_MIN, T_MAX] = getBounds('test');

const poemNorm: Record<HKey, number[]> = {
  e: CYCLE_DATA.map(d => minmax(d.estrogen, E_MIN, E_MAX)), p: CYCLE_DATA.map(d => minmax(d.progesterone, P_MIN, P_MAX)),
  lh: CYCLE_DATA.map(d => minmax(d.lh, LH_MIN, LH_MAX)), fsh: CYCLE_DATA.map(d => minmax(d.fsh, FSH_MIN, FSH_MAX)),
  test: CYCLE_DATA.map(d => minmax(d.testosterone, T_MIN, T_MAX)),
};
const graphNorm: Record<HKey, number[]> = {
  e: CYCLE_DATA.map(d => truezero(d.estrogen, E_MAX)), p: CYCLE_DATA.map(d => truezero(d.progesterone, P_MAX)),
  lh: CYCLE_DATA.map(d => truezero(d.lh, LH_MAX)), fsh: CYCLE_DATA.map(d => truezero(d.fsh, FSH_MAX)),
  test: CYCLE_DATA.map(d => truezero(d.testosterone, T_MAX)),
};

function monotoneInterp(arr: number[], t: number): number {
  const n = arr.length, c = ((t % n) + n) % n, i = Math.floor(c), f = c - i;
  const y0 = arr[i], y1 = arr[(i + 1) % n];
  const d0 = (arr[(i + 1) % n] - arr[((i - 1) + n) % n]) / 2;
  const d1 = (arr[(i + 2) % n] - arr[i]) / 2;
  const delta = y1 - y0;
  let m0 = d0, m1 = d1;
  if (Math.abs(delta) < 1e-12) { m0 = 0; m1 = 0; }
  else {
    const a = m0 / delta, b = m1 / delta;
    if (a < 0) m0 = 0;
    if (b < 0) m1 = 0;
    const s = a * a + b * b;
    if (s > 9) { const tau = 3 / Math.sqrt(s); m0 = tau * a * delta; m1 = tau * b * delta; }
  }
  const h00 = (1 + 2*f) * (1-f) * (1-f), h10 = f * (1-f) * (1-f);
  const h01 = f * f * (3 - 2*f), h11 = f * f * (f - 1);
  return Math.max(0, h00 * y0 + h10 * m0 + h01 * y1 + h11 * m1);
}

const HKEYS: HKey[] = ['e', 'p', 'lh', 'fsh', 'test'];

function interpolate(t: number): HVals {
  const r = {} as HVals;
  for (const k of HKEYS) r[k] = Math.max(0, Math.min(1, monotoneInterp(poemNorm[k], t)));
  return r;
}
function interpolateGraph(t: number): HVals {
  const r = {} as HVals;
  for (const k of HKEYS) r[k] = Math.max(0, monotoneInterp(graphNorm[k], t));
  return r;
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

const E_NOUNS   = ['stars', 'cities', 'tattoo', 'I', 'woman', 'love', 'grief', 'Hope', 'woman', 'Beauty', 'us', 'Death', 'night', 'incomplete female'];
const P_VERBS   = ['making', 'gleam', 'see', 'rise', 'wear', 'love', 'fear', 'is', 'let', 'hold', 'help', 'stop', 'approach', 'walking'];
const FSH_ADJS  = ['all', 'undimmed', 'inside', 'Still', 'old', 'Oh', 'shameless', 'thing', 'difficult', 'all', 'other', 'not', 'triumphant', 'incomplete'];
const LH_NOUNS  = ['love', 'tears', 'eyelid', 'Still', 'purple', 'how', 'sight', 'feathers', 'go', 'peace', 'die', 'Death', 'you', 'stage'];
const TEST_NOUNS = ['other', 'human', 'me', 'rise', 'shall', 'resoluteness', 'anger', 'thing', 'been', 'prate', 'somewhere', 'Because', 'know', 'gene'];

const ALL_WORDS = [E_NOUNS, P_VERBS, FSH_ADJS, LH_NOUNS, TEST_NOUNS];

const COLORS: Record<HKey, string> = { e: '#b85c7a', p: '#b8922e', lh: '#4a7ab8', fsh: '#a84848', test: '#7a6e62' };
const COLOR_LABELS: [HKey, string][] = [['e', 'Estrogen'], ['p', 'Progesterone'], ['lh', 'LH'], ['fsh', 'FSH'], ['test', 'Testosterone']];

function buildSentence(ei: number, pi: number, fi: number, li: number, ti: number) {
  return `${E_NOUNS[ei]} ${P_VERBS[pi]} ${FSH_ADJS[fi]} ${LH_NOUNS[li]} ${TEST_NOUNS[ti]}`;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function estimateRange(offsetDay: number, ei: number, pi: number, fi: number, li: number, ti: number, cycleDuration: number, cycleStartDate: Date): string {
  const H = 1 / 24, snapped = Math.round(offsetDay * 24) / 24;
  const sc = 28 / cycleDuration;
  const matches = (t: number) => { const v = interpolate((t - 1) * sc); return hormoneLine(v.e) === ei && hormoneLine(v.p) === pi && hormoneLine(v.fsh) === fi && hormoneLine(v.lh) === li && hormoneLine(v.test) === ti; };
  let lo = 0, hi = 0;
  for (let d = H; d <= cycleDuration; d += H) { if (!matches(snapped - d)) { lo = d; break; } }
  for (let d = H; d <= cycleDuration; d += H) { if (!matches(snapped + d)) { hi = d; break; } }
  const fmt = (frac: number) => {
    const totalHrs = Math.round(((frac % cycleDuration) + cycleDuration) % cycleDuration * 24);
    const dt = new Date(cycleStartDate.getTime() + totalHrs * 3600000);
    return `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}, ${String(dt.getHours()).padStart(2, '0')}:00`;
  };
  return `The time is between ${fmt(snapped - lo)} and ${fmt(snapped + hi)}`;
}

function renderLine(text: string, highlights: { phrase: string; color: string }[]): React.ReactNode {
  type Span = { start: number; end: number; color: string };
  const spans: Span[] = [];
  for (const { phrase, color } of highlights) { const idx = text.toLowerCase().indexOf(phrase.toLowerCase()); if (idx >= 0) spans.push({ start: idx, end: idx + phrase.length, color }); }
  if (!spans.length) return text;
  spans.sort((a, b) => a.start - b.start);
  const merged: Span[] = [];
  for (const s of spans) { if (!merged.length || s.start >= merged[merged.length - 1].end) merged.push(s); }
  const parts: React.ReactNode[] = [];
  let cur = 0;
  for (const { start, end, color } of merged) { if (start > cur) parts.push(text.slice(cur, start)); parts.push(<span key={start} style={{ color, fontWeight: 600 }}>{text.slice(start, end)}</span>); cur = end; }
  if (cur < text.length) parts.push(text.slice(cur));
  return parts;
}

function PoemTooltip({ poem, isMobile }: { poem: PoemData; isMobile: boolean }) {
  return (
    <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '0.75rem', background: 'rgba(250,248,245,0.97)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(196,168,136,0.18)', borderRadius: '6px', padding: isMobile ? '0.9rem 1.1rem' : '1.1rem 1.4rem', boxShadow: '0 8px 40px rgba(28,23,20,0.08), 0 1px 4px rgba(28,23,20,0.04)', zIndex: 10, maxWidth: isMobile ? '85vw' : '480px', minWidth: '200px', fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.6, pointerEvents: 'none' }}>
      {poem.contextAbove && <div style={{ fontSize: '0.9rem', color: '#8a7a6a', fontStyle: 'italic', marginBottom: '0.25rem', whiteSpace: 'pre-line' }}>{poem.contextAbove}</div>}
      <div style={{ fontSize: '0.95rem', color: '#1c1714', fontWeight: 400 }}>{poem.text}</div>
      {poem.contextBelow && <div style={{ fontSize: '0.9rem', color: '#8a7a6a', fontStyle: 'italic', marginTop: '0.25rem', whiteSpace: 'pre-line' }}>{poem.contextBelow}</div>}
      <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#a89888', borderTop: '1px solid rgba(196,168,136,0.15)', paddingTop: '0.4rem', letterSpacing: '0.02em' }}>
        {poem.author && <span>{poem.author}</span>}{poem.author && poem.source && <span> — </span>}{poem.source && <span style={{ fontStyle: 'italic' }}>{poem.source}</span>}
      </div>
    </div>
  );
}

const PHASES = [{ name: 'Menstrual', start: 1, end: 5 }, { name: 'Follicular', start: 6, end: 13 }, { name: 'Fertility', start: 14, end: 16 }, { name: 'Luteal', start: 17, end: 28 }];

const PAD_L = 2, PAD_R = 0, PAD_TOP = 12, PAD_PHASE = 18, PAD_DAYS = 30;
const GRAPH_SCALE: Record<HKey, number> = { e: 0.85, p: 0.7, lh: 0.9, fsh: 0.6, test: 0.2 };
const STROKE_W: Record<HKey, number> = { e: 2.2, p: 2.2, lh: 2, fsh: 1.8, test: 1.5 };
const STROKE_OP: Record<HKey, number> = { e: 0.9, p: 0.9, lh: 0.85, fsh: 0.75, test: 0.5 };

function makeHelpers(innerW: number, innerH: number, viewDays: number, scale: number) {
  const dayToX = (day: number, off: number) => PAD_L + ((day - off) / viewDays) * innerW;
  const valToY = (v: number) => PAD_TOP + innerH - v * innerH;
  const tracePath = (off: number, key: HKey, closed: boolean) => {
    const s0 = off - 0.5, s1 = off + viewDays + 0.5, steps = Math.ceil((s1 - s0) * 24);
    const baseY = PAD_TOP + innerH;
    let d = closed ? `M ${dayToX(s0, off).toFixed(2)},${baseY.toFixed(2)}` : '';
    for (let s = 0; s <= steps; s++) {
      const df = s0 + (s / steps) * (s1 - s0);
      const x = dayToX(df, off).toFixed(2), y = valToY(interpolateGraph((df - 1) * scale)[key] * GRAPH_SCALE[key]).toFixed(2);
      d += `${(!closed && s === 0) ? 'M' : ' L'} ${x},${y}`;
    }
    if (closed) d += ` L ${dayToX(s1, off).toFixed(2)},${baseY.toFixed(2)} Z`;
    return d;
  };
  return { dayToX, tracePath };
}

function IconBtn({ onClick, holdable, disabled, children, title }: { onClick: () => void; holdable?: boolean; disabled?: boolean; children: React.ReactNode; title?: string }) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clear = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  const startHold = () => { if (!holdable || disabled) return; onClick(); intervalRef.current = setInterval(onClick, 400); };
  useEffect(() => clear, []);
  return (
    <button onClick={holdable ? undefined : onClick} onMouseDown={holdable ? startHold : undefined} onMouseUp={clear} onMouseLeave={clear}
      onTouchStart={holdable ? startHold : undefined} onTouchEnd={clear}
      disabled={disabled} title={title} style={{ background: 'none', border: '1px solid rgba(196,168,136,0.25)', borderRadius: '50%', padding: '9px', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.25 : 0.55, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0, width: '36px', height: '36px', transition: 'opacity 0.3s' }}>{children}</button>
  );
}

const SlowerIcon = () => <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><polygon points="8,1 1,7 8,13" fill="#9a8878" /><polygon points="15,1 8,7 15,13" fill="#9a8878" /></svg>;
const FasterIcon = () => <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><polygon points="1,1 8,7 1,13" fill="#9a8878" /><polygon points="8,1 15,7 8,13" fill="#9a8878" /></svg>;
const PlayIcon = () => <svg width="11" height="12" viewBox="0 0 12 14" fill="none"><polygon points="2,1 11,7 2,13" fill="#9a8878" /></svg>;
const PauseIcon = () => <svg width="11" height="12" viewBox="0 0 12 14" fill="none"><rect x="1" y="1" width="3.5" height="12" rx="0.5" fill="#9a8878" /><rect x="7.5" y="1" width="3.5" height="12" rx="0.5" fill="#9a8878" /></svg>;
const StopIcon = () => <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="9" rx="1" fill="#9a8878" /></svg>;
const ChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a89888" strokeWidth="1.5" strokeLinecap="round"><polyline points="7,10 12,15 17,10" /></svg>;

function CycleGraph({ offsetDay, width, height, cycleStartDate, cycleDuration, onDragStart, onDragMove, onDragEnd }: {
  offsetDay: number; width: number; height: number; cycleStartDate: Date; cycleDuration: number;
  onDragStart: () => void; onDragMove: (v: number) => void; onDragEnd: () => void;
}) {
  const viewDays = cycleDuration;
  const scale = 28 / cycleDuration;
  const innerW = width - PAD_L - PAD_R, innerH = height - PAD_TOP - PAD_PHASE - PAD_DAYS;
  const { dayToX, tracePath } = makeHelpers(innerW, innerH, viewDays, scale);
  const repMin = Math.floor((offsetDay - 1) / viewDays) - 1, repMax = Math.ceil((offsetDay + viewDays) / viewDays) + 1;

  const cd = viewDays;
  const ovulationDay = Math.round(14 * cd / 28);
  const ovulationXs: number[] = [];
  for (let r = repMin; r <= repMax; r++) { const x = dayToX(ovulationDay + r * cd, offsetDay); if (x >= PAD_L && x <= PAD_L + innerW) ovulationXs.push(x); }

  const scaledPhases = PHASES.map(ph => ({ name: ph.name, start: Math.round(ph.start * cd / 28), end: Math.round(ph.end * cd / 28) }));
  const phaseItems: { name: string; cx: number; x1: number; clipX: number; clipW: number }[] = [];
  for (let r = repMin; r <= repMax; r++) for (const ph of scaledPhases) {
    const x1 = dayToX(ph.start + r * cd, offsetDay), x2 = dayToX(ph.end + 1 + r * cd, offsetDay);
    if (x2 > PAD_L && x1 < PAD_L + innerW) { const cx = Math.max(x1, PAD_L), cw = Math.min(x2, PAD_L + innerW) - cx; phaseItems.push({ name: ph.name, cx: cx + cw / 2, x1: cx, clipX: cx, clipW: cw }); }
  }

  const dayTicks: { label: string; x: number }[] = [];
  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let r = repMin; r <= repMax; r++) for (const d of [7, 14, 21, 28].filter(d => d <= cd)) {
    const x = dayToX(d + r * cd, offsetDay);
    if (x >= PAD_L && x <= PAD_L + innerW) {
      const dt = new Date(cycleStartDate.getTime() + ((d - 1) + r * cd) * 86400000);
      dayTicks.push({ label: `${SHORT_MONTHS[dt.getMonth()]} ${dt.getDate()}`, x });
    }
  }

  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null);
  const touchRef = useRef<{ startX: number; startOffset: number } | null>(null);
  const md = (e: React.MouseEvent) => { dragRef.current = { startX: e.clientX, startOffset: offsetDay }; onDragStart(); e.preventDefault(); };
  const mmv = (e: React.MouseEvent) => { if (dragRef.current) onDragMove(dragRef.current.startOffset - ((e.clientX - dragRef.current.startX) / innerW) * viewDays); };
  const mu = () => { if (dragRef.current) { dragRef.current = null; onDragEnd(); } };
  const ts = (e: React.TouchEvent) => { touchRef.current = { startX: e.touches[0].clientX, startOffset: offsetDay }; onDragStart(); };
  const tmv = (e: React.TouchEvent) => { if (touchRef.current) onDragMove(touchRef.current.startOffset - ((e.touches[0].clientX - touchRef.current.startX) / innerW) * viewDays); };
  const te = () => { if (touchRef.current) { touchRef.current = null; onDragEnd(); } };
  const yBase = PAD_TOP + innerH;

  return (
    <svg width={width} height={height} style={{ display: 'block', fontFamily: "'DM Mono', monospace", cursor: 'grab', userSelect: 'none' }}
      onMouseDown={md} onMouseMove={mmv} onMouseUp={mu} onMouseLeave={mu} onTouchStart={ts} onTouchMove={tmv} onTouchEnd={te}>
      <defs>
        <clipPath id="graph-clip"><rect x={PAD_L} y={PAD_TOP} width={innerW} height={innerH} /></clipPath>
        {HKEYS.map(k => (
          <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS[k]} stopOpacity={k === 'test' ? '0.04' : k === 'fsh' ? '0.06' : '0.10'} />
            <stop offset="100%" stopColor={COLORS[k]} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      <rect x={PAD_L} y={PAD_TOP} width={innerW} height={innerH} fill="#faf8f5" />
      {ovulationXs.map((x, i) => (
        <g key={i} clipPath="url(#graph-clip)">
          <line x1={x} y1={PAD_TOP} x2={x} y2={yBase} stroke="rgba(196,168,136,0.25)" strokeWidth={1} strokeDasharray="4,4" />
          <text x={x + 4} y={PAD_TOP + 11} fontSize={7.5} fill="rgba(196,168,136,0.55)" fontStyle="italic" letterSpacing="0.04em">ovulation</text>
        </g>
      ))}
      {HKEYS.map(k => <path key={`a-${k}`} d={tracePath(offsetDay, k, true)} fill={`url(#grad-${k})`} clipPath="url(#graph-clip)" />)}
      {HKEYS.map(k => <path key={`l-${k}`} d={tracePath(offsetDay, k, false)} fill="none" stroke={COLORS[k]} strokeWidth={STROKE_W[k]} clipPath="url(#graph-clip)" opacity={STROKE_OP[k]} />)}
      <line x1={PAD_L} y1={yBase} x2={PAD_L + innerW} y2={yBase} stroke="rgba(28,23,20,0.07)" strokeWidth={1} />
      <line x1={PAD_L} y1={PAD_TOP} x2={PAD_L} y2={yBase} stroke="rgba(28,23,20,0.07)" strokeWidth={1} />
      {phaseItems.map(({ name, cx, x1, clipX, clipW }, i) => (
        <g key={i}>
          <clipPath id={`pc-${i}`}><rect x={clipX} y={yBase} width={clipW} height={PAD_PHASE} /></clipPath>
          <line x1={x1} y1={yBase} x2={x1} y2={yBase + PAD_PHASE} stroke="rgba(196,168,136,0.18)" strokeWidth={1} />
          <text x={cx} y={yBase + PAD_PHASE - 4} textAnchor="middle" fontSize={7.5} fill="rgba(28,23,20,0.22)" letterSpacing="0.04em" clipPath={`url(#pc-${i})`}>{name}</text>
        </g>
      ))}
      {dayTicks.map(({ label, x }, i) => <text key={i} x={x} y={yBase + PAD_PHASE + PAD_DAYS - 6} textAnchor="middle" fontSize={7.5} fill="rgba(28,23,20,0.22)" letterSpacing="0.02em">{label}</text>)}
      <g transform={`translate(${PAD_L + innerW - 6}, 10)`}>
        {COLOR_LABELS.map(([k, label], i) => (
          <g key={k}><line x1={-108} y1={i * 13} x2={-94} y2={i * 13} stroke={COLORS[k]} strokeWidth={STROKE_W[k]} opacity={STROKE_OP[k]} /><text x={-90} y={i * 13 + 3.5} fontSize={8} fill={COLORS[k]} textAnchor="start" opacity={0.7} letterSpacing="0.02em">{label}</text></g>
        ))}
      </g>
    </svg>
  );
}

const SPEED_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20];

const STYLE_ID = '__mc-styles';
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&display=swap');
    @keyframes mc-glow { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
    @keyframes mc-bounce { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(4px); opacity: 0.55; } }
    @keyframes mc-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes mc-pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.5; } }
    .mc-input { background: none; border: none; border-bottom: 1px solid rgba(196,168,136,0.35); font-family: 'Source Serif 4', Georgia, serif; font-size: 0.95rem; color: #3d3028; padding: 0.55rem 0.3rem; outline: none; transition: border-color 0.5s ease; letter-spacing: 0.01em; text-align: center; }
    .mc-input:focus { border-bottom-color: #b85c7a; }
    .mc-input::-webkit-calendar-picker-indicator { filter: opacity(0.3); }
    .mc-start-btn { background: none; border: 1px solid rgba(196,168,136,0.5); border-radius: 0; padding: 0.85rem 3rem; font-family: 'Source Serif 4', Georgia, serif; font-size: 0.85rem; font-weight: 400; color: #3d3028; cursor: pointer; letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.5s ease; text-align: center; }
    .mc-start-btn:hover { background: rgba(196,168,136,0.08); border-color: #c4a882; color: #1c1714; letter-spacing: 0.14em; }
  `;
  document.head.appendChild(el);
}

function formatLocalDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDateInput(s: string): Date {
  if (!s) return new Date();
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function useScrollStage(maxProgress: number) {
  const [, forceRender] = useState(0);
  const scrollRef = useRef(0);
  const vhRef = useRef(typeof window !== 'undefined' ? window.innerHeight : 800);
  const rafPending = useRef(false);

  useEffect(() => {
    const update = () => { rafPending.current = false; forceRender(n => n + 1); };
    const onScroll = () => { scrollRef.current = window.scrollY; if (!rafPending.current) { rafPending.current = true; requestAnimationFrame(update); } };
    const onResize = () => { vhRef.current = window.innerHeight; forceRender(n => n + 1); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); };
  }, []);

  const raw = scrollRef.current / vhRef.current;
  const progress = Math.min(raw, maxProgress);
  return { progress, vh: vhRef.current };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

export default function MenstrualClock() {
  const isMobile = useIsMobile();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    ensureStyles();
    if (typeof document === 'undefined') return;
    document.fonts.ready.then(() => setLoaded(true));
    const fallback = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(fallback);
  }, []);

  const [clockUnlocked, setClockUnlocked] = useState(false);
  const [clockSettled, setClockSettled] = useState(false);
  const maxProgress = clockUnlocked ? 999 : 3.5;
  const { progress, vh } = useScrollStage(maxProgress);

  const [cycleStart, setCycleStart] = useState(() => formatLocalDate(new Date()));
  const [cycleDuration, setCycleDuration] = useState(28);
  const [dayFrac, setDayFrac] = useState(1.0);
  const [speedIdx, setSpeedIdx] = useState(4);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const wasPlayingRef = useRef(false);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const cycleStartDate = parseDateInput(cycleStart);

  const speed = SPEED_STEPS[speedIdx];
  const tick = useCallback((ts: number) => {
    if (lastTsRef.current !== null) setDayFrac(d => d + (ts - lastTsRef.current!) / 1000 / speed);
    lastTsRef.current = ts;
    rafRef.current = requestAnimationFrame(tick);
  }, [speed]);

  useEffect(() => {
    if (paused || !clockUnlocked) { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; lastTsRef.current = null; return; }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [paused, tick, clockUnlocked]);

  const handleDragStart = useCallback(() => { wasPlayingRef.current = !paused; setPaused(true); }, [paused]);
  const handleDragMove = useCallback((v: number) => setDragOffset(v), []);
  const handleDragEnd = useCallback(() => {
    if (dragOffset !== null) { setDayFrac(dragOffset); setDragOffset(null); }
    if (wasPlayingRef.current) setPaused(false);
  }, [dragOffset]);

  const offsetDay = dragOffset ?? dayFrac;
  const cycleScale = 28 / cycleDuration;
  const vals = interpolate((offsetDay - 1) * cycleScale);
  const eIdx = hormoneLine(vals.e), pIdx = hormoneLine(vals.p), fshIdx = hormoneLine(vals.fsh), lhIdx = hormoneLine(vals.lh), testIdx = hormoneLine(vals.test);
  const sentence = buildSentence(eIdx, pIdx, fshIdx, lhIdx, testIdx);
  const timeRange = estimateRange(offsetDay, eIdx, pIdx, fshIdx, lhIdx, testIdx, cycleDuration, cycleStartDate);

  const nextPeriodDate = (() => {
    const dayInCycle = ((offsetDay - 1) % cycleDuration + cycleDuration) % cycleDuration;
    const daysLeft = cycleDuration - dayInCycle;
    const dt = new Date(cycleStartDate.getTime() + (dayInCycle + daysLeft) * 86400000);
    return `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}`;
  })();

  const poemLinesRef = useRef<HTMLDivElement>(null);
  const graphColRef = useRef<HTMLDivElement>(null);
  const [poemHeight, setPoemHeight] = useState(500);
  const [graphW, setGraphW] = useState(600);

  useEffect(() => { const el = poemLinesRef.current; if (!el) return; const ro = new ResizeObserver(e => setPoemHeight(e[0].contentRect.height)); ro.observe(el); return () => ro.disconnect(); }, [loaded]);
  useEffect(() => { const el = graphColRef.current; if (!el) return; const ro = new ResizeObserver(e => setGraphW(e[0].contentRect.width)); ro.observe(el); return () => ro.disconnect(); }, [loaded]);

  const graphH = isMobile ? 220 : poemHeight;
  const font = "'Source Serif 4', Georgia, serif";
  const fontSize = isMobile ? '1.1rem' : '1.35rem';
  const bg = '#faf8f5';
  const gradientBar = '#c4a882';

  const p = progress;

  const titleY = lerp(0, -20, (p - 0.3) / 0.7);
  const titleOp = lerp(1, 0, (p - 2) / 0.5);
  const titleScale = lerp(1, 0.72, (p - 0.2) / 0.8);

  const descOp = isMobile
    ? (p < 1 ? 0 : p < 1.5 ? lerp(0, 1, (p - 1) / 0.5) : p < 2 ? 1 : lerp(1, 0, (p - 2) / 0.5))
    : (p < 0.5 ? 0 : p < 1 ? lerp(0, 1, (p - 0.5) / 0.5) : p < 2 ? 1 : lerp(1, 0, (p - 2) / 0.5));
  const descY = isMobile
    ? (p < 1 ? 20 : p < 1.5 ? lerp(20, 0, (p - 1) / 0.5) : p < 2 ? 0 : lerp(0, -15, (p - 2) / 0.5))
    : (p < 0.5 ? 20 : p < 1 ? lerp(20, 0, (p - 0.5) / 0.5) : p < 2 ? 0 : lerp(0, -15, (p - 2) / 0.5));

  const settingsOp = p < 2 ? 0 : p < 2.5 ? lerp(0, 1, (p - 2) / 0.5) : p < 3.5 ? 1 : lerp(1, 0, (p - 3.5) / 0.5);
  const settingsY = p < 2 ? 20 : p < 2.5 ? lerp(20, 0, (p - 2) / 0.5) : p < 3.5 ? 0 : lerp(0, -15, (p - 3.5) / 0.5);

  const clockOp = p < 3.5 ? 0 : lerp(0, 1, (p - 3.5) / 0.5);
  const clockY = p < 3.5 ? 20 : lerp(20, 0, (p - 3.5) / 0.5);

  const chevronOp = lerp(1, 0, (p - 0.1) / 0.3);

  const isClockPhase = p >= 4;

  useEffect(() => {
    if (clockUnlocked && isClockPhase && !clockSettled) {
      setClockSettled(true);
      window.scrollTo(0, 0);
    }
  }, [clockUnlocked, isClockPhase, clockSettled]);

  const handleStart = () => {
    setClockUnlocked(true);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }));
  };

  if (!loaded) {
    return (
      <div style={{ backgroundColor: bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: isMobile ? 40 : 60, height: 1, background: gradientBar, borderRadius: 0, animation: 'mc-pulse 2.5s ease-in-out infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', boxSizing: 'border-box', animation: 'mc-fadein 1s ease' }}>
      {!clockSettled && <div style={{ height: `${(clockUnlocked ? 6 : 4.5) * vh}px`, pointerEvents: 'none' }} />}

      {!clockSettled && !isClockPhase && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: bg, zIndex: 1, padding: isMobile ? '3rem 1.5rem' : '5rem 5rem', overflow: 'hidden' }}>

          {titleOp > 0.01 && (
            <div style={{ opacity: Math.max(0, titleOp), transform: `translateY(${titleY}vh) scale(${titleScale})`, textAlign: 'center', position: 'absolute', top: '40%', left: '50%', marginLeft: '-50%', width: '100%', padding: isMobile ? '0 1rem' : '0 3rem' }}>
              <h1 style={{ fontFamily: font, fontSize: isMobile ? '3.2rem' : '5rem', fontWeight: 300, color: '#1c1714', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
                Menstrual Clock
              </h1>
              <div style={{ width: isMobile ? 48 : 72, height: 1, background: gradientBar, margin: '1.6rem auto 0', borderRadius: 0 }} />
              <div style={{ marginTop: '1.4rem', fontFamily: font, fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#8a7a6a', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.06em' }}>
                by Luna Maltseva &amp; Daria Yurishcheva
              </div>
            </div>
          )}

          {chevronOp > 0 && (
            <div style={{ position: 'absolute', bottom: '3rem', opacity: Math.max(0, chevronOp), animation: 'mc-bounce 3.5s ease-in-out infinite' }}>
              <ChevronDown />
            </div>
          )}

          {descOp > 0.01 && (
            <div style={{ opacity: descOp, position: 'absolute', top: isMobile ? '32%' : '40%', left: '50%', width: '100%', maxWidth: 820, padding: isMobile ? '0 1.5rem' : '0 3rem', transform: `translate(-50%, 0) translateY(${descY}px)`, textAlign: 'left' }}>
              <div style={{ fontFamily: font, fontSize: isMobile ? '0.95rem' : '1.1rem', color: '#3d3028', lineHeight: 2.1, fontWeight: 300 }}>
                <p style={{ margin: 0 }}>
                  Though it may at first seem complicated, the Menstrual Clock makes use of the composite nature of the menstrual cycle to tell time. Based on hormonal levels of Estrogen, Progesterone, and Luteinizing Hormone, attained from averaging a PhysioNet self-report sample, the clock selects parts of the 14 excerpts from poems written by female authors, composing a sentence that can be used to communicate time.
                </p>
                <p style={{ margin: '1.5rem 0 0 0' }}>
                  Hormones are color-coded: Estrogen in pink, Progesterone in yellow, and Luteinizing Hormone in blue. Depending on the time of the cycle, levels of these hormones increase or decrease. The clock displays different quotes based on the levels of different hormones. The quote height is determined by the hormone level.
                </p>
                <p style={{ margin: '1.5rem 0 0 0' }}>
                The selected quotes vary in emotional intensity, as mood often depends on hormonal levels during different phases of the cycle.
                </p>
              </div>
            </div>
          )}

          {settingsOp > 0.01 && (
            <div style={{ opacity: settingsOp, position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) translateY(${settingsY}px)`, textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: isMobile ? '0.65rem' : '0.65rem', fontWeight: 300, color: '#1c1714', marginBottom: '2.5rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Configure your cycle
              </div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '2.5rem' : '4rem', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#8a7a6a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cycle start</label>
                  <input type="date" className="mc-input" value={cycleStart} onChange={e => setCycleStart(e.target.value)} style={{ fontFamily: font, fontSize: '0.95rem', color: '#3d3028', width: isMobile ? '180px' : '200px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#8a7a6a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cycle length (days)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => setCycleDuration(d => Math.max(21, d - 1))} style={{ background: 'none', border: '1px solid rgba(196,168,136,0.35)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontFamily: font, fontSize: '1.1rem', color: '#8a7a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>−</button>
                    <span style={{ fontFamily: font, fontSize: '1rem', color: '#3d3028', minWidth: '2.5rem', textAlign: 'center', display: 'inline-block' }}>{cycleDuration}</span>
                    <button onClick={() => setCycleDuration(d => Math.min(35, d + 1))} style={{ background: 'none', border: '1px solid rgba(196,168,136,0.35)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontFamily: font, fontSize: '1.1rem', color: '#8a7a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>+</button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '3.5rem' }}>
                <button className="mc-start-btn" onClick={handleStart}>
                  Start the clock
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={clockSettled ? {
        position: 'relative',
        left: 0, right: 0,
        opacity: 1,
        backgroundColor: bg,
        zIndex: 0,
        pointerEvents: 'auto',
        minHeight: '100vh',
        padding: isMobile ? '3rem 1.5rem 3rem' : '4.5rem 5rem 3.5rem',
        boxSizing: 'border-box',
      } : {
        position: isClockPhase ? 'relative' : 'fixed',
        top: isClockPhase ? 'auto' : 0,
        left: 0, right: 0,
        marginTop: isClockPhase ? `-${vh}px` : 0,
        opacity: clockOp,
        transform: isClockPhase ? 'none' : `translateY(${clockY}px)`,
        backgroundColor: bg,
        zIndex: isClockPhase ? 0 : 1,
        pointerEvents: isClockPhase ? 'auto' : 'none',
        minHeight: '100vh',
        padding: isMobile ? '3rem 1.5rem 3rem' : '4.5rem 5rem 3.5rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.8rem' : '4rem' }}>
          <div style={{ fontFamily: font, fontSize: isMobile ? '1.15rem' : '1.4rem', color: '#1c1714', fontStyle: 'italic', fontWeight: 300, lineHeight: 2, letterSpacing: '0.01em', animation: 'mc-glow 7s ease-in-out infinite' }}>
            {sentence}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: isMobile ? '0.68rem' : '0.72rem', color: '#a89888', marginTop: '0.6rem', letterSpacing: '0.08em' }}>
            {timeRange}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '2.5rem' : '5rem', alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 auto', minWidth: 0, width: isMobile ? '100%' : undefined }}>
            <div ref={poemLinesRef}>
              {POEMS.map((line, i) => {
                const active = i === eIdx || i === pIdx || i === fshIdx || i === lhIdx || i === testIdx;
                const hl: { phrase: string; color: string }[] = [];
                const keys: HKey[] = ['e', 'p', 'fsh', 'lh', 'test'];
                const indices = [eIdx, pIdx, fshIdx, lhIdx, testIdx];
                for (let j = 0; j < 5; j++) { if (indices[j] === i) hl.push({ phrase: ALL_WORDS[j][i], color: COLORS[keys[j]] }); }
                return (
                  <div key={i} style={{ marginBottom: isMobile ? '0.55rem' : '0.75rem', position: 'relative', cursor: 'default' }}
                    onMouseEnter={() => setHoveredLine(i)} onMouseLeave={() => setHoveredLine(null)}>
                    <span style={{ fontFamily: font, fontSize, color: '#1c1714', lineHeight: 1.9, opacity: active ? 1 : 0.08, fontWeight: active ? 400 : 300, letterSpacing: '-0.01em' }}>
                      {renderLine(line, hl)}
                    </span>
                    {hoveredLine === i && <PoemTooltip poem={POEM_DATA[i]} isMobile={isMobile} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={graphColRef} style={{ flex: isMobile ? '0 0 auto' : '1 1 0', minWidth: 0, width: isMobile ? '100%' : undefined }}>
            <CycleGraph offsetDay={offsetDay} width={graphW} height={graphH} cycleStartDate={cycleStartDate} cycleDuration={cycleDuration}
              onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} />
            <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ flex: 1 }} />
              <IconBtn holdable onClick={() => setSpeedIdx(i => Math.min(SPEED_STEPS.length - 1, i + 1))} disabled={speedIdx >= SPEED_STEPS.length - 1} title="Slower"><SlowerIcon /></IconBtn>
              <IconBtn onClick={() => setPaused(p => !p)} title={paused ? 'Play' : 'Pause'}>{paused ? <PlayIcon /> : <PauseIcon />}</IconBtn>
              <IconBtn holdable onClick={() => setSpeedIdx(i => Math.max(0, i - 1))} disabled={speedIdx <= 0} title="Faster"><FasterIcon /></IconBtn>
              <div style={{ flex: 1 }} />
              <IconBtn onClick={() => { setDayFrac(1); setPaused(true); }} title="Reset to day 1"><StopIcon /></IconBtn>
            </div>
          </div>
        </div>
        <div style={{ marginTop: isMobile ? '1.8rem' : '2rem', fontFamily: "'DM Mono', monospace", fontSize: isMobile ? '0.68rem' : '0.72rem', color: '#a89888', letterSpacing: '0.07em', marginBottom: 0 }}>
          Next predicted menstrual phase: {nextPeriodDate}
        </div>
      </div>
    </div>
  );
}
