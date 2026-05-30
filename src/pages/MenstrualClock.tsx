import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { NAV_ITEMS } from '../components/navData';
import { ICONS_BY_HREF } from '../components/navIcons';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type CycleType = 'typical' | 'pcos' | 'menopause' | 'hrt';
type DerivMode = 'raw' | 'first';

interface HSpec { key: string; label: string; color: string; sw: number; op: number; vscale: number; }
interface CycleProfile {
  type: CycleType; label: string; defaultDuration: number;
  hasRefDate: boolean; refDateLabel: string;
  hormones: HSpec[]; data: Record<string, number>[];
  phases: { name: string; start: number; end: number }[];
}
interface PoemData { text: string; author: string; contextAbove: string; contextBelow: string; source: string; }

// ─── CYCLE DATA ───────────────────────────────────────────────────────────────

const TYPICAL_PHASES = [
  { name: 'Menstrual', start: 1, end: 5 }, { name: 'Follicular', start: 6, end: 13 },
  { name: 'Fertility', start: 14, end: 16 }, { name: 'Luteal', start: 17, end: 28 },
];
const PCOS_PHASES = [
  { name: 'Menstrual', start: 1, end: 5 }, { name: 'Follicular', start: 6, end: 16 },
  { name: 'Fertility', start: 17, end: 20 }, { name: 'Luteal', start: 21, end: 35 },
];
const HRT_PHASES = [
  { name: 'Peak', start: 1, end: 2 }, { name: 'Declining', start: 3, end: 7 },
  { name: 'Trough', start: 8, end: 11 },
];

const PROFILES: Record<CycleType, CycleProfile> = {
  typical: {
    type: 'typical', label: 'Typical', defaultDuration: 28,
    hasRefDate: true, refDateLabel: 'Cycle start',
    phases: TYPICAL_PHASES,
    hormones: [
      { key: 'e',   label: 'Estrogen',      color: '#b85c7a', sw: 2.2, op: 0.90, vscale: 0.85 },
      { key: 'p',   label: 'Progesterone',  color: '#b8922e', sw: 2.2, op: 0.90, vscale: 0.70 },
      { key: 'lh',  label: 'LH',            color: '#4a7ab8', sw: 2.0, op: 0.85, vscale: 0.90 },
      { key: 'fsh', label: 'FSH',           color: '#a84848', sw: 1.8, op: 0.75, vscale: 0.60 },
      { key: 't',   label: 'Testosterone',  color: '#7a6e62', sw: 1.5, op: 0.50, vscale: 0.20 },
    ],
    data: [
      {e:40,p:0.8,lh:3,fsh:5.5,t:25},{e:35,p:0.6,lh:3.25,fsh:6.5,t:26},{e:32,p:0.5,lh:3.5,fsh:7.5,t:26},
      {e:35,p:0.4,lh:3.75,fsh:8.0,t:27},{e:40,p:0.4,lh:4,fsh:7.5,t:28},{e:50,p:0.5,lh:4.25,fsh:6.8,t:29},
      {e:65,p:0.5,lh:4.5,fsh:6.0,t:31},{e:85,p:0.6,lh:4.75,fsh:5.5,t:33},{e:110,p:0.6,lh:5,fsh:5.2,t:35},
      {e:140,p:0.7,lh:5.25,fsh:5.0,t:38},{e:180,p:0.8,lh:6,fsh:5.5,t:40},{e:250,p:0.9,lh:10,fsh:7.0,t:43},
      {e:300,p:1.0,lh:30,fsh:12,t:48},{e:280,p:1.5,lh:55,fsh:18,t:50},{e:200,p:2.5,lh:25,fsh:10,t:45},
      {e:150,p:4,lh:10,fsh:5.5,t:40},{e:120,p:6,lh:5,fsh:4.0,t:36},{e:110,p:9,lh:4.75,fsh:3.5,t:33},
      {e:120,p:12,lh:4.5,fsh:3.2,t:31},{e:140,p:15,lh:4.25,fsh:3.0,t:29},{e:160,p:17,lh:4,fsh:2.8,t:28},
      {e:150,p:16,lh:3.75,fsh:2.8,t:27},{e:135,p:14,lh:3.5,fsh:3.0,t:27},{e:120,p:11,lh:3.25,fsh:3.2,t:26},
      {e:100,p:8,lh:3,fsh:3.5,t:26},{e:80,p:5,lh:2.75,fsh:4.0,t:25},{e:55,p:2.5,lh:2.7,fsh:4.5,t:25},
      {e:45,p:1.2,lh:2.75,fsh:5.0,t:25},
    ],
  },
  pcos: {
    type: 'pcos', label: 'PCOS', defaultDuration: 35,
    hasRefDate: true, refDateLabel: 'Cycle start',
    phases: PCOS_PHASES,
    hormones: [
      { key: 'e',   label: 'Estrogen',     color: '#b85c7a', sw: 2.2, op: 0.90, vscale: 0.75 },
      { key: 'p',   label: 'Progesterone', color: '#b8922e', sw: 2.2, op: 0.90, vscale: 0.65 },
      { key: 'lh',  label: 'LH',           color: '#4a7ab8', sw: 2.0, op: 0.85, vscale: 0.85 },
      { key: 'fsh', label: 'FSH',          color: '#a84848', sw: 1.8, op: 0.75, vscale: 0.50 },
      { key: 't',   label: 'Testosterone', color: '#7a6e62', sw: 1.8, op: 0.65, vscale: 0.35 },
    ],
    data: [
      {e:35,p:0.5,lh:10,fsh:5.5,t:65},{e:30,p:0.4,lh:11,fsh:6.0,t:66},{e:28,p:0.3,lh:11.5,fsh:6.8,t:67},
      {e:32,p:0.3,lh:11,fsh:7.0,t:68},{e:38,p:0.4,lh:10.5,fsh:6.5,t:67},{e:45,p:0.4,lh:10,fsh:6.0,t:68},
      {e:55,p:0.5,lh:10.5,fsh:5.8,t:69},{e:70,p:0.5,lh:11,fsh:5.5,t:70},{e:90,p:0.6,lh:12,fsh:5.2,t:72},
      {e:115,p:0.7,lh:13,fsh:5.0,t:74},{e:140,p:0.8,lh:14,fsh:5.0,t:76},{e:165,p:0.9,lh:15,fsh:5.2,t:78},
      {e:185,p:1.0,lh:14,fsh:5.0,t:79},{e:200,p:1.1,lh:14.5,fsh:4.8,t:80},{e:210,p:1.2,lh:16,fsh:5.0,t:80},
      {e:215,p:1.3,lh:18,fsh:5.5,t:79},{e:210,p:1.5,lh:22,fsh:6.5,t:78},{e:200,p:2.0,lh:19,fsh:5.5,t:76},
      {e:190,p:3.0,lh:16,fsh:4.8,t:74},{e:175,p:4.5,lh:14,fsh:4.5,t:72},{e:160,p:6.0,lh:13,fsh:4.2,t:70},
      {e:150,p:7.0,lh:12,fsh:4.0,t:68},{e:140,p:7.5,lh:11.5,fsh:3.8,t:67},{e:130,p:7.0,lh:11,fsh:3.8,t:66},
      {e:120,p:6.0,lh:11,fsh:4.0,t:65},{e:110,p:5.0,lh:11,fsh:4.2,t:65},{e:100,p:4.0,lh:11,fsh:4.5,t:65},
      {e:90,p:3.0,lh:11.5,fsh:5.0,t:65},{e:80,p:2.0,lh:11,fsh:5.2,t:65},{e:70,p:1.5,lh:12,fsh:5.5,t:65},
      {e:60,p:1.0,lh:11.5,fsh:5.8,t:65},{e:52,p:0.7,lh:11,fsh:6.0,t:65},{e:45,p:0.5,lh:10.5,fsh:6.0,t:65},
      {e:38,p:0.4,lh:10,fsh:6.0,t:65},{e:35,p:0.4,lh:10,fsh:5.5,t:65},
    ],
  },
  menopause: {
    type: 'menopause', label: 'Menopause', defaultDuration: 30,
    hasRefDate: false, refDateLabel: '',
    phases: [],
    hormones: [
      { key: 'e',       label: 'Estrogen',    color: '#b85c7a', sw: 2.2, op: 0.85, vscale: 0.45 },
      { key: 'p',       label: 'Progesterone',color: '#b8922e', sw: 1.6, op: 0.65, vscale: 0.12 },
      { key: 'fsh',     label: 'FSH',         color: '#a84848', sw: 2.2, op: 0.90, vscale: 0.90 },
      { key: 'inhibin', label: 'Inhibin',     color: '#5a8a6a', sw: 1.5, op: 0.60, vscale: 0.20 },
      { key: 'tsh',     label: 'TSH',         color: '#7a6e62', sw: 1.5, op: 0.55, vscale: 0.35 },
    ],
    data: [
      {e:15,p:0.15,fsh:55,inhibin:3.0,tsh:1.8},{e:18,p:0.12,fsh:58,inhibin:2.8,tsh:1.9},
      {e:20,p:0.14,fsh:52,inhibin:2.5,tsh:2.0},{e:22,p:0.16,fsh:48,inhibin:2.2,tsh:1.9},
      {e:19,p:0.15,fsh:50,inhibin:2.0,tsh:1.8},{e:16,p:0.13,fsh:55,inhibin:1.8,tsh:1.7},
      {e:14,p:0.11,fsh:62,inhibin:1.6,tsh:1.6},{e:13,p:0.12,fsh:65,inhibin:1.5,tsh:1.8},
      {e:15,p:0.14,fsh:60,inhibin:1.6,tsh:2.0},{e:18,p:0.15,fsh:55,inhibin:1.8,tsh:2.2},
      {e:21,p:0.17,fsh:50,inhibin:2.0,tsh:2.1},{e:23,p:0.18,fsh:48,inhibin:2.2,tsh:2.0},
      {e:24,p:0.16,fsh:50,inhibin:2.0,tsh:1.9},{e:22,p:0.15,fsh:53,inhibin:1.8,tsh:1.8},
      {e:20,p:0.13,fsh:58,inhibin:1.6,tsh:1.7},{e:17,p:0.12,fsh:63,inhibin:1.5,tsh:1.6},
      {e:15,p:0.11,fsh:67,inhibin:1.4,tsh:1.5},{e:14,p:0.12,fsh:65,inhibin:1.3,tsh:1.6},
      {e:16,p:0.14,fsh:60,inhibin:1.4,tsh:1.8},{e:19,p:0.15,fsh:55,inhibin:1.5,tsh:2.0},
      {e:22,p:0.17,fsh:50,inhibin:1.7,tsh:2.1},{e:24,p:0.18,fsh:48,inhibin:1.8,tsh:2.0},
      {e:23,p:0.16,fsh:50,inhibin:2.0,tsh:1.9},{e:21,p:0.15,fsh:54,inhibin:1.8,tsh:1.8},
      {e:18,p:0.13,fsh:58,inhibin:1.6,tsh:1.7},{e:16,p:0.12,fsh:62,inhibin:1.4,tsh:1.6},
      {e:15,p:0.11,fsh:65,inhibin:1.3,tsh:1.5},{e:17,p:0.13,fsh:60,inhibin:1.4,tsh:1.7},
      {e:19,p:0.15,fsh:55,inhibin:1.5,tsh:1.9},{e:20,p:0.16,fsh:52,inhibin:1.6,tsh:2.0},
    ],
  },
  hrt: {
    type: 'hrt', label: 'Injection HRT', defaultDuration: 11,
    hasRefDate: true, refDateLabel: 'Injection date',
    phases: HRT_PHASES,
    hormones: [
      { key: 'e', label: 'Estradiol',    color: '#b85c7a', sw: 2.5, op: 0.95, vscale: 0.90 },
      { key: 'p', label: 'Progesterone', color: '#b8922e', sw: 2.0, op: 0.80, vscale: 0.50 },
    ],
    data: [
      {e:40,p:0.4},{e:345,p:0.5},{e:310,p:0.6},{e:270,p:0.8},{e:240,p:1.0},{e:215,p:1.2},
      {e:185,p:1.4},{e:165,p:1.5},{e:145,p:1.5},{e:115,p:1.4},{e:110,p:1.3},{e:115,p:1.2},
      {e:95,p:1.0},{e:75,p:0.9},{e:75,p:0.8},{e:65,p:0.7},{e:60,p:0.6},{e:55,p:0.6},
      {e:50,p:0.5},{e:48,p:0.5},{e:38,p:0.4},{e:42,p:0.4},{e:38,p:0.4},{e:36,p:0.3},
      {e:38,p:0.3},{e:50,p:0.3},{e:42,p:0.3},{e:48,p:0.3},{e:45,p:0.3},{e:58,p:0.3},
    ],
  },
};

// ─── NORMALIZATION ───────────────────────────────────────────────────────────

function buildNormData(profile: CycleProfile) {
  const poem: Record<string, number[]> = {};
  const graph: Record<string, number[]> = {};
  for (const h of profile.hormones) {
    const vals = profile.data.map(d => d[h.key] ?? 0);
    const mn = Math.min(...vals), mx = Math.max(...vals);
    poem[h.key] = vals.map(v => (mx === mn ? 0 : (v - mn) / (mx - mn)));
    graph[h.key] = vals.map(v => (mx === 0 ? 0 : v / mx));
  }
  return { poem, graph };
}

// ─── INTERPOLATION ───────────────────────────────────────────────────────────

function monotoneInterp(arr: number[], t: number): number {
  const n = arr.length;
  const c = ((t % n) + n) % n;
  const i = Math.floor(c), f = c - i;
  const y0 = arr[i], y1 = arr[(i + 1) % n];
  const d0 = (arr[(i + 1) % n] - arr[((i - 1) + n) % n]) / 2;
  const d1 = (arr[(i + 2) % n] - arr[i]) / 2;
  const delta = y1 - y0;
  let m0 = d0, m1 = d1;
  if (Math.abs(delta) < 1e-12) { m0 = 0; m1 = 0; }
  else {
    const a = m0 / delta, b = m1 / delta;
    if (a < 0) m0 = 0; if (b < 0) m1 = 0;
    const s = a * a + b * b;
    if (s > 9) { const tau = 3 / Math.sqrt(s); m0 = tau * a * delta; m1 = tau * b * delta; }
  }
  const h00 = (1 + 2*f)*(1-f)*(1-f), h10 = f*(1-f)*(1-f), h01 = f*f*(3-2*f), h11 = f*f*(f-1);
  return Math.max(0, h00*y0 + h10*m0 + h01*y1 + h11*m1);
}

function derivInterp(arr: number[], t: number): number {
  const dt = 0.05;
  return (monotoneInterp(arr, t + dt) - monotoneInterp(arr, t - dt)) / (2 * dt);
}

function computeMaxAbsDeriv(arr: number[]): number {
  let max = 1e-9;
  const steps = arr.length * 10;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * arr.length;
    const v = Math.abs(derivInterp(arr, t));
    if (v > max) max = v;
  }
  return max;
}

// interpolated value (0-1 clamp) at fractional day t using given norm data
function interpVal(normData: number[], t: number): number {
  return Math.max(0, Math.min(1, monotoneInterp(normData, t)));
}

// ─── POEM / SENTENCE DATA ────────────────────────────────────────────────────

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
  { text: 'And somewhere, each of us must help the other die.', author: 'Adrienne Rich', contextAbove: 'I touch you knowing we weren’t born tomorrow,\nand somehow, each of us will help the other live,', contextBelow: '', source: 'Twenty-One Love Poems, III' },
  { text: 'Because I could not stop for Death –', author: 'Emily Dickinson', contextAbove: '', contextBelow: 'He kindly stopped for me —', source: 'Poem 479' },
  { text: 'Do not approach my triumphant night. I don’t know you.', author: 'Anna Akhmatova', contextAbove: '', contextBelow: '', source: 'Anthology' },
  { text: 'Male is an incomplete female, a walking abortion, aborted at the gene stage.', author: 'Valerie Solanas', contextAbove: '', contextBelow: '', source: 'SCUM Manifesto' },
];

const POEMS = POEM_DATA.map(d => d.text);
const N_POEMS = POEMS.length;

// Words highlighted per poem line per slot — chosen for maximum humor and surrealism
const SLOT_WORDS: string[][] = [
  // slot 0 (noun1, driven by E)
  ['stars','alabaster cities','eyelid','I','old woman','resoluteness','shameless grief','Hope','a woman','Beauty','each of us','Death','triumphant night','walking abortion'],
  // slot 1 (verb, driven by P)
  ['making love','gleam','see me','rise','wear purple','love','flows','is','let go','prate','must help','stop','approach','walking'],
  // slot 2 (adj, driven by hormone 3: FSH / FSH / FSH / [N/A for hrt])
  ['all','undimmed','inside','Still','shall','Oh','shameless','thing','difficult','all','each','not','triumphant','incomplete'],
  // slot 3 (noun2, driven by hormone 4: LH / LH / Inhibin / [N/A for hrt])
  ['with each other','by human tears','like a tattoo','Still','purple','how','in sight','thing with feathers','of how','hold their peace','the other','for Death',"I don't know you",'gene stage'],
  // slot 4 (noun3, driven by hormone 5: T / T / TSH / [N/A for hrt])
  ['each other','human','tattoo','rise','shall','resoluteness','anger','feathers','been','peace','somewhere','Because','know you','gene stage'],
];

// sqrt sensitivity: more variation at lower hormone levels
const hormoneLine = (v: number): number =>
  N_POEMS - 1 - Math.min(N_POEMS - 1, Math.floor(Math.sqrt(Math.max(0, Math.min(1, v))) * N_POEMS));

function buildSentence(cycleType: CycleType, indices: number[]): string {
  if (cycleType === 'hrt') return `${SLOT_WORDS[0][indices[0]]} ${SLOT_WORDS[1][indices[1]]}`;
  return `${SLOT_WORDS[0][indices[0]]} ${SLOT_WORDS[1][indices[1]]} ${SLOT_WORDS[2][indices[2]]} ${SLOT_WORDS[3][indices[3]]} ${SLOT_WORDS[4][indices[4]]}`;
}

function getActiveSlots(cycleType: CycleType, indices: number[]): { slotIdx: number; poemIdx: number }[] {
  const n = cycleType === 'hrt' ? 2 : 5;
  return Array.from({ length: n }, (_, s) => ({ slotIdx: s, poemIdx: indices[s] }));
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function parseDateInput(s: string): Date {
  if (!s) return new Date();
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}

function getPhase(profile: CycleProfile, day: number, cycleDuration: number): string {
  if (!profile.phases.length) return 'Postmenopause';
  const scaledDay = Math.round(day * profile.data.length / cycleDuration);
  for (const ph of profile.phases) {
    const s = Math.round(ph.start * profile.data.length / cycleDuration);
    const e = Math.round(ph.end * profile.data.length / cycleDuration);
    if (scaledDay >= s && scaledDay <= e) return ph.name;
  }
  return profile.phases[profile.phases.length - 1].name;
}

function getPhaseDesc(cycleType: CycleType, phase: string, normalizedVals: Record<string, number>): string {
  if (cycleType === 'typical' || cycleType === 'pcos') {
    const lhRatio = cycleType === 'pcos' ? ' LH:FSH ratio is elevated — a hallmark of PCOS.' : '';
    const testNote = cycleType === 'pcos' ? ' Androgens are persistently elevated throughout the cycle.' : '';
    if (phase === 'Menstrual') return `Estrogen and progesterone have withdrawn, triggering the shedding of the uterine lining. FSH is beginning to rise to recruit new follicles.${testNote}`;
    if (phase === 'Follicular') return `Estrogen is rising as follicles develop. The uterine lining is rebuilding. As estrogen approaches its peak, it will trigger an LH surge.${lhRatio}${testNote}`;
    if (phase === 'Fertility') return `You are at peak fertility. ${normalizedVals['lh'] > 0.5 ? 'The LH surge is underway — ovulation is imminent or just occurred.' : 'Ovulation is approaching.'} Progesterone is beginning its luteal rise.${lhRatio}`;
    if (phase === 'Luteal') return normalizedVals['p'] > 0.5
      ? `The corpus luteum is producing progesterone at near-peak levels, maintaining the uterine lining.${testNote}`
      : `Progesterone and estrogen are declining as the corpus luteum regresses. The next menstrual phase approaches.${testNote}`;
  }
  if (cycleType === 'menopause') return 'The ovaries have largely ceased hormonal production. FSH remains elevated — a persistent, unanswered signal from the pituitary. Estrogen and progesterone fluctuate at low baselines. Inhibin, once secreted by developing follicles, is nearly absent.';
  if (cycleType === 'hrt') {
    if (phase === 'Peak') return 'Estradiol levels are at their highest following the injection. This is the peak pharmacokinetic window.';
    if (phase === 'Declining') return 'Estradiol is declining from its peak as the ester is metabolized and released from the depot site.';
    if (phase === 'Mid-cycle') return 'Estradiol has settled into a lower mid-cycle range. Levels remain therapeutically active but are continuing to decline.';
    if (phase === 'Trough') return 'Estradiol is approaching its pre-injection baseline. Consider the timing of your next injection.';
  }
  return '';
}

function estimateTimeRange(
  offsetDay: number, indices: number[], cycleDuration: number,
  cycleStartDate: Date | null, profile: CycleProfile,
  poemNorm: Record<string, number[]>,
): string {
  if (!profile.hasRefDate || !cycleStartDate) {
    const d = ((offsetDay - 1) % cycleDuration + cycleDuration) % cycleDuration;
    if (profile.type === 'hrt') return `Day ${Math.floor(d)} post-injection`;
    return `Day ${Math.floor(d) + 1} of observation window`;
  }
  const H = 1/24;
  const scale = profile.data.length / cycleDuration;
  const keys = profile.hormones.map(h => h.key);
  const nSlots = profile.type === 'hrt' ? 2 : Math.min(5, keys.length);
  const snapped = Math.round(offsetDay * 24) / 24;
  const matches = (t: number) => {
    const scaled = (t - 1) * scale;
    return keys.slice(0, nSlots).every((k, si) => {
      const v = interpVal(poemNorm[k], scaled);
      return hormoneLine(v) === indices[si];
    });
  };
  let lo = 0, hi = 0;
  for (let d = H; d <= cycleDuration; d += H) { if (!matches(snapped - d)) { lo = d; break; } }
  for (let d = H; d <= cycleDuration; d += H) { if (!matches(snapped + d)) { hi = d; break; } }
  const fmt = (frac: number) => {
    const totalHrs = Math.round(((frac % cycleDuration) + cycleDuration) % cycleDuration * 24);
    const dt = new Date(cycleStartDate.getTime() + totalHrs * 3600000);
    return `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}, ${String(dt.getHours()).padStart(2,'0')}:00`;
  };
  return `${fmt(snapped - lo)} — ${fmt(snapped + hi)}`;
}

// ─── GRAPH CONSTANTS ──────────────────────────────────────────────────────────

const PAD_L = 2, PAD_R = 0, PAD_TOP = 12, PAD_PHASE = 18, PAD_DAYS = 28;
const SPEED_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20];

// ─── RENDER LINE ─────────────────────────────────────────────────────────────

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
  for (const s of spans) { if (!merged.length || s.start >= merged[merged.length-1].end) merged.push(s); }
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

// ─── STYLES ───────────────────────────────────────────────────────────────────

const STYLE_ID = '__mc-styles';
function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,400&display=swap');
    @keyframes mc-glow { 0%,100%{opacity:.7}50%{opacity:1} }
    @keyframes mc-fadein { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
    @keyframes mc-pulse { 0%,100%{opacity:.2}50%{opacity:.5} }
    @keyframes mc-reveal { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
    .mc-input{background:none;border:none;border-bottom:1px solid rgba(196,168,136,.35);font-family:'Source Serif 4',Georgia,serif;font-size:.95rem;color:#3d3028;padding:.55rem .3rem;outline:none;transition:border-color .4s;letter-spacing:.01em;text-align:center;}
    .mc-input:focus{border-bottom-color:#b85c7a;}
    .mc-input::-webkit-calendar-picker-indicator{filter:opacity(.3);}
    .mc-select{background:none;border:none;border-bottom:1px solid rgba(196,168,136,.35);font-family:'Source Serif 4',Georgia,serif;font-size:.95rem;color:#3d3028;padding:.55rem .3rem;outline:none;cursor:pointer;text-align:center;appearance:none;-webkit-appearance:none;min-width:160px;transition:border-color .4s;}
    .mc-select:focus{border-bottom-color:#b85c7a;}
    .mc-start-btn{background:none;border:1px solid rgba(196,168,136,.5);border-radius:0;padding:.85rem 3rem;font-family:'Source Serif 4',Georgia,serif;font-size:.85rem;font-weight:400;color:#3d3028;cursor:pointer;letter-spacing:.12em;text-transform:uppercase;transition:all .4s;text-align:center;}
    .mc-start-btn:hover{background:rgba(196,168,136,.08);border-color:#c4a882;letter-spacing:.14em;}
    .mc-deriv-btn{background:none;border:none;font-family:'DM Mono',monospace;font-size:.6rem;color:#a89888;cursor:pointer;padding:.3rem .6rem;letter-spacing:.08em;text-transform:uppercase;transition:all .3s;border-bottom:1px solid transparent;}
    .mc-deriv-btn.active{color:#3d3028;border-bottom-color:rgba(196,168,136,.5);}
    .mc-deriv-btn:hover{color:#3d3028;}
    .mc-art-section{animation:mc-reveal .8s ease;}
  `;
  document.head.appendChild(el);
}

// ─── ICONS ────────────────────────────────────────────────────────────────────

const SlowerIcon = () => <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><polygon points="8,1 1,7 8,13" fill="#9a8878"/><polygon points="15,1 8,7 15,13" fill="#9a8878"/></svg>;
const FasterIcon = () => <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><polygon points="1,1 8,7 1,13" fill="#9a8878"/><polygon points="8,1 15,7 8,13" fill="#9a8878"/></svg>;
const PlayIcon = () => <svg width="11" height="12" viewBox="0 0 12 14" fill="none"><polygon points="2,1 11,7 2,13" fill="#9a8878"/></svg>;
const PauseIcon = () => <svg width="11" height="12" viewBox="0 0 12 14" fill="none"><rect x="1" y="1" width="3.5" height="12" rx=".5" fill="#9a8878"/><rect x="7.5" y="1" width="3.5" height="12" rx=".5" fill="#9a8878"/></svg>;
const StopIcon = () => <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="9" rx="1" fill="#9a8878"/></svg>;

// ─── ICON BUTTON ──────────────────────────────────────────────────────────────

function IconBtn({ onClick, holdable, disabled, children, title }: { onClick: () => void; holdable?: boolean; disabled?: boolean; children: React.ReactNode; title?: string }) {
  const iv = useRef<ReturnType<typeof setInterval>|null>(null);
  const clear = () => { if (iv.current) { clearInterval(iv.current); iv.current = null; } };
  const start = () => { if (!holdable || disabled) return; onClick(); iv.current = setInterval(onClick, 400); };
  useEffect(() => clear, []);
  return (
    <button onClick={holdable ? undefined : onClick} onMouseDown={holdable ? start : undefined}
      onMouseUp={clear} onMouseLeave={clear} onTouchStart={holdable ? start : undefined} onTouchEnd={clear}
      disabled={disabled} title={title}
      style={{ background:'none', border:'1px solid rgba(196,168,136,.25)', borderRadius:'50%', padding:'9px', cursor:disabled?'default':'pointer', opacity:disabled?.25:.55, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:0, width:36, height:36, transition:'opacity .3s' }}>
      {children}
    </button>
  );
}

// ─── POEM TOOLTIP ─────────────────────────────────────────────────────────────

function PoemTooltip({ poem, isMobile }: { poem: PoemData; isMobile: boolean }) {
  return (
    <div style={{ position:'absolute', bottom:'100%', left:0, marginBottom:'.75rem', background:'rgba(250,248,245,.97)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(196,168,136,.18)', borderRadius:'6px', padding:isMobile?'.9rem 1.1rem':'1.1rem 1.4rem', boxShadow:'0 8px 40px rgba(28,23,20,.08)', zIndex:10, maxWidth:isMobile?'85vw':'480px', minWidth:'200px', fontFamily:"'Source Serif 4',Georgia,serif", lineHeight:1.6, pointerEvents:'none' }}>
      {poem.contextAbove && <div style={{ fontSize:'.9rem', color:'#8a7a6a', fontStyle:'italic', marginBottom:'.25rem', whiteSpace:'pre-line' }}>{poem.contextAbove}</div>}
      <div style={{ fontSize:'.95rem', color:'#1c1714' }}>{poem.text}</div>
      {poem.contextBelow && <div style={{ fontSize:'.9rem', color:'#8a7a6a', fontStyle:'italic', marginTop:'.25rem', whiteSpace:'pre-line' }}>{poem.contextBelow}</div>}
      <div style={{ marginTop:'.6rem', fontSize:'.75rem', color:'#a89888', borderTop:'1px solid rgba(196,168,136,.15)', paddingTop:'.4rem', letterSpacing:'.02em' }}>
        {poem.author}{poem.author && poem.source && ' — '}{poem.source && <span style={{ fontStyle:'italic' }}>{poem.source}</span>}
      </div>
    </div>
  );
}

// ─── CYCLE GRAPH ──────────────────────────────────────────────────────────────

function CycleGraph({ profile, graphNorm, offsetDay, width, height, cycleStartDate, cycleDuration, derivMode, derivMaxes, onDragStart, onDragMove, onDragEnd }: {
  profile: CycleProfile; graphNorm: Record<string,number[]>;
  offsetDay: number; width: number; height: number; cycleStartDate: Date | null;
  cycleDuration: number; derivMode: DerivMode;
  derivMaxes: Record<string, number>;
  onDragStart: () => void; onDragMove: (v: number) => void; onDragEnd: () => void;
}) {
  const n = profile.data.length;
  const scale = n / cycleDuration;
  const innerW = width - PAD_L - PAD_R;
  const innerH = height - PAD_TOP - PAD_PHASE - PAD_DAYS;
  const yBase = PAD_TOP + innerH;

  const dayToX = (day: number, off: number) => PAD_L + ((day - off) / cycleDuration) * innerW;
  const valToY = (v: number) => PAD_TOP + innerH - Math.max(0, Math.min(1, v)) * innerH;

  const getVal = (key: string, tDay: number): number => {
    const t = (tDay - 1) * scale;
    const arr = graphNorm[key];
    if (!arr) return 0;
    if (derivMode === 'raw') return monotoneInterp(arr, t) * (profile.hormones.find(h => h.key === key)?.vscale ?? 1);
    const d = derivInterp(arr, t);
    const mx = derivMaxes[key] ?? 1;
    return 0.5 + (d / mx) * 0.45;
  };

  const midY = valToY(0.5);

  // Closed path that traces the curve then closes along the zero-midline — used for d/dt fills
  const traceDerivArea = (off: number, key: string): string => {
    const s0 = off - 0.5, s1 = off + cycleDuration + 0.5;
    const steps = Math.ceil((s1 - s0) * 24);
    let d = `M ${dayToX(s0, off).toFixed(2)},${midY.toFixed(2)}`;
    for (let s = 0; s <= steps; s++) {
      const df = s0 + (s / steps) * (s1 - s0);
      d += ` L ${dayToX(df, off).toFixed(2)},${valToY(getVal(key, df)).toFixed(2)}`;
    }
    d += ` L ${dayToX(s1, off).toFixed(2)},${midY.toFixed(2)} Z`;
    return d;
  };

  const tracePath = (off: number, key: string, closed: boolean) => {
    const s0 = off - 0.5, s1 = off + cycleDuration + 0.5;
    const steps = Math.ceil((s1 - s0) * 24);
    const baseY = yBase;
    let d = closed ? `M ${dayToX(s0, off).toFixed(2)},${baseY.toFixed(2)}` : '';
    for (let s = 0; s <= steps; s++) {
      const df = s0 + (s / steps) * (s1 - s0);
      const x = dayToX(df, off).toFixed(2);
      const y = valToY(getVal(key, df)).toFixed(2);
      d += `${(!closed && s === 0) ? 'M' : ' L'} ${x},${y}`;
    }
    if (closed) d += ` L ${dayToX(s1, off).toFixed(2)},${baseY.toFixed(2)} Z`;
    return d;
  };

  const repMin = Math.floor((offsetDay - 1) / cycleDuration) - 1;
  const repMax = Math.ceil((offsetDay + cycleDuration) / cycleDuration) + 1;

  // Ovulation line for typical/pcos
  const ovXs: number[] = [];
  if (profile.type === 'typical' || profile.type === 'pcos') {
    const ovDay = Math.round(14 * cycleDuration / 28);
    for (let r = repMin; r <= repMax; r++) {
      const x = dayToX(ovDay + r * cycleDuration, offsetDay);
      if (x >= PAD_L && x <= PAD_L + innerW) ovXs.push(x);
    }
  }

  // Phase labels
  const scaledPhases = profile.phases.map(ph => ({
    name: ph.name,
    start: Math.round(ph.start * cycleDuration / n),
    end: Math.round(ph.end * cycleDuration / n),
  }));
  const phaseItems: { name: string; cx: number; x1: number; clipX: number; clipW: number }[] = [];
  for (let r = repMin; r <= repMax; r++) {
    for (const ph of scaledPhases) {
      const x1 = dayToX(ph.start + r * cycleDuration, offsetDay);
      const x2 = dayToX(ph.end + 1 + r * cycleDuration, offsetDay);
      if (x2 > PAD_L && x1 < PAD_L + innerW) {
        const cx = Math.max(x1, PAD_L), cw = Math.min(x2, PAD_L + innerW) - cx;
        phaseItems.push({ name: ph.name, cx: cx + cw / 2, x1: cx, clipX: cx, clipW: cw });
      }
    }
  }

  // Day ticks
  const dayTicks: { label: string; x: number }[] = [];
  const tickInterval = cycleDuration <= 28 ? 7 : cycleDuration <= 35 ? 7 : 10;
  for (let r = repMin; r <= repMax; r++) {
    for (let d = tickInterval; d <= cycleDuration; d += tickInterval) {
      const x = dayToX(d + r * cycleDuration, offsetDay);
      if (x >= PAD_L && x <= PAD_L + innerW) {
        if (cycleStartDate) {
          const dt = new Date(cycleStartDate.getTime() + ((d - 1) + r * cycleDuration) * 86400000);
          dayTicks.push({ label: `${SHORT_MONTHS[dt.getMonth()]} ${dt.getDate()}`, x });
        } else {
          dayTicks.push({ label: `d${d}`, x });
        }
      }
    }
  }

  // Current position line
  const nowX = dayToX(offsetDay, offsetDay);

  const dragRef = useRef<{ startX: number; startOffset: number }|null>(null);
  const touchRef = useRef<{ startX: number; startOffset: number }|null>(null);
  const md = (e: React.MouseEvent) => { dragRef.current = { startX: e.clientX, startOffset: offsetDay }; onDragStart(); e.preventDefault(); };
  const mmv = (e: React.MouseEvent) => { if (dragRef.current) onDragMove(dragRef.current.startOffset - ((e.clientX - dragRef.current.startX) / innerW) * cycleDuration); };
  const mu = () => { if (dragRef.current) { dragRef.current = null; onDragEnd(); } };
  const ts = (e: React.TouchEvent) => { touchRef.current = { startX: e.touches[0].clientX, startOffset: offsetDay }; onDragStart(); };
  const tmv = (e: React.TouchEvent) => { if (touchRef.current) onDragMove(touchRef.current.startOffset - ((e.touches[0].clientX - touchRef.current.startX) / innerW) * cycleDuration); };
  const te = () => { if (touchRef.current) { touchRef.current = null; onDragEnd(); } };

  const hkeys = profile.hormones.map(h => h.key);

  return (
    <svg width={width} height={height} style={{ display:'block', fontFamily:"'DM Mono',monospace", cursor:'grab', userSelect:'none' }}
      onMouseDown={md} onMouseMove={mmv} onMouseUp={mu} onMouseLeave={mu}
      onTouchStart={ts} onTouchMove={tmv} onTouchEnd={te}>
      <defs>
        <clipPath id="g-clip"><rect x={PAD_L} y={PAD_TOP} width={innerW} height={innerH}/></clipPath>
        {derivMode === 'first' && <>
          <clipPath id="dc-pos"><rect x={PAD_L} y={PAD_TOP} width={innerW} height={Math.max(0, midY - PAD_TOP)}/></clipPath>
          <clipPath id="dc-neg"><rect x={PAD_L} y={midY} width={innerW} height={Math.max(0, yBase - midY)}/></clipPath>
          {hkeys.map(k => {
            const c = profile.hormones.find(h => h.key === k)!.color;
            return (
              <g key={k}>
                <linearGradient id={`dc-pos-grd-${k}`} x1="0" y1={PAD_TOP} x2="0" y2={midY} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={c} stopOpacity="0.18"/>
                  <stop offset="100%" stopColor={c} stopOpacity="0"/>
                </linearGradient>
                <linearGradient id={`dc-neg-grd-${k}`} x1="0" y1={midY} x2="0" y2={yBase} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={c} stopOpacity="0"/>
                  <stop offset="100%" stopColor={c} stopOpacity="0.11"/>
                </linearGradient>
              </g>
            );
          })}
        </>}
        {derivMode === 'raw' && hkeys.map(k => {
          const c = profile.hormones.find(h => h.key === k)!.color;
          return (
            <linearGradient key={k} id={`grd-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.09"/>
              <stop offset="100%" stopColor={c} stopOpacity="0"/>
            </linearGradient>
          );
        })}
      </defs>

      <rect x={PAD_L} y={PAD_TOP} width={innerW} height={innerH} fill="#faf8f5"/>

      {/* Zero / midline for derivative modes */}
      {derivMode !== 'raw' && (
        <line x1={PAD_L} y1={valToY(0.5)} x2={PAD_L + innerW} y2={valToY(0.5)}
          stroke="rgba(196,168,136,0.3)" strokeWidth={1} strokeDasharray="3,3" clipPath="url(#g-clip)"/>
      )}

      {ovXs.map((x, i) => (
        <g key={i} clipPath="url(#g-clip)">
          <line x1={x} y1={PAD_TOP} x2={x} y2={yBase} stroke="rgba(196,168,136,0.22)" strokeWidth={1} strokeDasharray="4,4"/>
          <text x={x+4} y={PAD_TOP+11} fontSize={7} fill="rgba(196,168,136,0.5)" fontStyle="italic" letterSpacing=".04em">ovulation</text>
        </g>
      ))}

      {derivMode === 'raw' && hkeys.map(k => (
        <path key={`a-${k}`} d={tracePath(offsetDay, k, true)} fill={`url(#grd-${k})`} clipPath="url(#g-clip)"/>
      ))}
      {derivMode === 'first' && hkeys.map(k => {
        const area = traceDerivArea(offsetDay, k);
        return (
          <g key={`da-${k}`}>
            <path d={area} fill={`url(#dc-pos-grd-${k})`} clipPath="url(#dc-pos)"/>
            <path d={area} fill={`url(#dc-neg-grd-${k})`} clipPath="url(#dc-neg)"/>
          </g>
        );
      })}
      {hkeys.map(k => {
        const h = profile.hormones.find(h => h.key === k)!;
        return <path key={`l-${k}`} d={tracePath(offsetDay, k, false)} fill="none" stroke={h.color} strokeWidth={h.sw} clipPath="url(#g-clip)" opacity={h.op}/>;
      })}

      {/* Current position line */}
      <line x1={nowX} y1={PAD_TOP} x2={nowX} y2={yBase} stroke="rgba(28,23,20,0.12)" strokeWidth={1} clipPath="url(#g-clip)"/>

      <line x1={PAD_L} y1={yBase} x2={PAD_L+innerW} y2={yBase} stroke="rgba(28,23,20,.07)" strokeWidth={1}/>
      <line x1={PAD_L} y1={PAD_TOP} x2={PAD_L} y2={yBase} stroke="rgba(28,23,20,.07)" strokeWidth={1}/>

      {phaseItems.map(({ name, cx, x1, clipX, clipW }, i) => (
        <g key={i}>
          <clipPath id={`pc-${i}`}><rect x={clipX} y={yBase} width={clipW} height={PAD_PHASE}/></clipPath>
          <line x1={x1} y1={yBase} x2={x1} y2={yBase+PAD_PHASE} stroke="rgba(196,168,136,.15)" strokeWidth={1}/>
          <text x={cx} y={yBase+PAD_PHASE-4} textAnchor="middle" fontSize={7} fill="rgba(28,23,20,.2)" letterSpacing=".04em" clipPath={`url(#pc-${i})`}>{name}</text>
        </g>
      ))}
      {dayTicks.map(({ label, x }, i) => (
        <text key={i} x={x} y={yBase+PAD_PHASE+PAD_DAYS-6} textAnchor="middle" fontSize={7} fill="rgba(28,23,20,.2)" letterSpacing=".02em">{label}</text>
      ))}

      {/* Legend */}
      <g transform={`translate(${PAD_L + innerW - 6}, 10)`}>
        {profile.hormones.map((h, i) => (
          <g key={h.key}>
            <line x1={-(8 + profile.hormones.length * 13)} y1={i*12} x2={-(8 + profile.hormones.length * 13) + 12} y2={i*12} stroke={h.color} strokeWidth={h.sw} opacity={h.op}/>
            <text x={-(8 + profile.hormones.length * 13) + 16} y={i*12+3.5} fontSize={7.5} fill={h.color} textAnchor="start" opacity={0.75} letterSpacing=".02em">{h.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─── INTERPRETATION BOX ───────────────────────────────────────────────────────

function InterpretBox({ profile, offsetDay, cycleDuration, normalizedVals, isMobile }: {
  profile: CycleProfile; offsetDay: number; cycleDuration: number;
  normalizedVals: Record<string, number>; isMobile: boolean;
}) {
  const dayInCycle = ((offsetDay - 1) % cycleDuration + cycleDuration) % cycleDuration + 1;
  const phase = getPhase(profile, dayInCycle, cycleDuration);
  const desc = getPhaseDesc(profile.type, phase, normalizedVals);
  const font = "'Source Serif 4', Georgia, serif";
  const mono = "'DM Mono', monospace";

  return (
    <div style={{ marginTop: isMobile ? '2rem' : '2.5rem', padding: isMobile ? '1.2rem 1.4rem' : '1.6rem 2rem', border: '1px solid rgba(196,168,136,0.18)', borderRadius: '4px', background: 'rgba(250,248,245,0.7)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: mono, fontSize: isMobile ? '0.62rem' : '0.65rem', color: '#a89888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {profile.type === 'hrt' ? `Day ${Math.floor(dayInCycle)} post-injection` : profile.type === 'menopause' ? `Day ${Math.floor(dayInCycle)} of window` : `Day ${Math.floor(dayInCycle)} · ${cycleDuration}-day cycle`}
        </span>
        <span style={{ fontFamily: font, fontSize: isMobile ? '0.9rem' : '1rem', color: '#1c1714', fontStyle: 'italic' }}>{phase}</span>
      </div>
      <p style={{ fontFamily: font, fontSize: isMobile ? '0.82rem' : '0.88rem', color: '#5a4a3a', lineHeight: 1.75, margin: '0 0 1.2rem 0', fontWeight: 300 }}>{desc}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {profile.hormones.map(h => {
          const v = normalizedVals[h.key] ?? 0;
          const pct = Math.round(v * 100);
          return (
            <div key={h.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontFamily: mono, fontSize: '0.6rem', color: h.color, letterSpacing: '0.06em', minWidth: isMobile ? 64 : 80, textAlign: 'right', opacity: 0.85 }}>{h.label}</span>
              <div style={{ flex: 1, height: 3, background: 'rgba(196,168,136,0.15)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: h.color, opacity: 0.7, borderRadius: 2, transition: 'width 0.3s ease' }}/>
              </div>
              <span style={{ fontFamily: mono, fontSize: '0.6rem', color: '#a89888', minWidth: 28, letterSpacing: '0.04em' }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ART DESCRIPTION ──────────────────────────────────────────────────────────

function ArtDescription({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const font = "'Source Serif 4', Georgia, serif";
  const mono = "'DM Mono', monospace";
  return (
    <div ref={ref} className={visible ? 'mc-art-section' : ''} style={{ opacity: visible ? 1 : 0, borderTop: '1px solid rgba(196,168,136,0.12)', marginTop: isMobile ? '4rem' : '6rem', paddingTop: isMobile ? '3rem' : '4rem', paddingBottom: isMobile ? '4rem' : '6rem' }}>
      <div>
        <div style={{ fontFamily: mono, fontSize: '0.62rem', color: '#a89888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2rem' }}>About the clock</div>
        <div style={{ fontFamily: font, fontSize: isMobile ? '0.92rem' : '1.05rem', color: '#3d3028', lineHeight: 2.1, fontWeight: 300 }}>
          <p style={{ margin: 0 }}>The Menstrual Clock makes use of the composite nature of the menstrual cycle to tell time. Based on hormonal levels attained from averaging a PhysioNet self-report sample, the clock selects words from 14 excerpts of poems written by female authors, composing a sentence that can be used to communicate time.</p>
          <p style={{ margin: '1.4rem 0 0' }}>Hormones are color-coded: Estrogen in pink, Progesterone in amber, LH in blue, FSH in red, Testosterone in warm grey. Each hormone level independently selects a word from one of the poem lines — higher levels draw from earlier, more charged lines; lower levels settle into the quieter ones at the bottom. The resulting sentence captures the emotional texture of that hormonal moment.</p>
          <p style={{ margin: '1.4rem 0 0' }}>Four cycle types are represented: a typical ovulatory cycle, Polycystic Ovary Syndrome (PCOS), postmenopause, and injectable HRT (estradiol cypionate).</p>
        </div>
        <div style={{ marginTop: '2.5rem', fontFamily: mono, fontSize: '0.65rem', color: '#a89888', letterSpacing: '0.06em' }}>
          by Luna Maltseva &amp; Daria Yurishcheva
        </div>
      </div>
    </div>
  );
}

// ─── THEMED NAVBAR ────────────────────────────────────────────────────────────

function MCDropdown({ label, items, isMobile }: { label: string; items: { label: string; href: string; external?: boolean }[]; isMobile: boolean }) {
  const [open, setOpen] = useState(false);
  const font = "'Source Serif 4', Georgia, serif";
  const mono = "'DM Mono', monospace";
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => !isMobile && setOpen(true)}
      onMouseLeave={() => !isMobile && setOpen(false)}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none',
          border: 'none',
          color: '#3d3028',
          fontFamily: font,
          fontSize: '0.85rem',
          padding: '0.45rem 0.6rem',
          cursor: 'pointer',
          letterSpacing: '0.04em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          opacity: open ? 1 : 0.78,
          transition: 'opacity 0.3s',
        }}
      >
        {label}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          minWidth: 220,
          width: 'max-content',
          background: 'rgba(250,248,245,0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(196,168,136,0.25)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(28,23,20,0.08)',
          padding: '0.5rem 0',
          zIndex: 1100,
        }}>
          {items.map((item) => {
            const Icon = ICONS_BY_HREF[item.href];
            return (
              <a
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.55rem 1rem',
                  color: '#3d3028',
                  fontFamily: font,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.02em',
                  transition: 'background 0.25s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(196,168,136,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {Icon && <Icon size={15} style={{ color: '#8a7a6a' }} />}
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      )}
      <span style={{ display: 'none', fontFamily: mono }} />
    </div>
  );
}

function MCNavbar({ isMobile }: { isMobile: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const font = "'Source Serif 4', Georgia, serif";
  const mono = "'DM Mono', monospace";
  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
      background: 'rgba(250,248,245,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(196,168,136,0.18)',
      padding: isMobile ? '0.65rem 1.25rem' : '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: isMobile ? '0.5rem' : '2rem',
    }}>
      <a href="/" style={{
        fontFamily: font,
        fontSize: isMobile ? '0.95rem' : '1rem',
        fontWeight: 400,
        color: '#3d3028',
        textDecoration: 'none',
        letterSpacing: '0.04em',
      }}>
        Luna Maltseva
      </a>

      {!isMobile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {NAV_ITEMS.map((item) => {
            if (item.dropdown) {
              return <MCDropdown key={item.label} label={item.label} items={item.dropdown} isMobile={isMobile} />;
            }
            const Icon = item.href ? ICONS_BY_HREF[item.href] : undefined;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: font,
                  fontSize: '0.85rem',
                  color: '#3d3028',
                  opacity: 0.78,
                  padding: '0.45rem 0.6rem',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'opacity 0.3s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.78')}
              >
                {Icon && <Icon size={14} style={{ color: '#8a7a6a' }} />}
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      ) : (
        <>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            style={{ background: 'none', border: 'none', color: '#3d3028', padding: '0.35rem', cursor: 'pointer', display: 'flex', marginLeft: 'auto' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'rgba(250,248,245,0.97)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(196,168,136,0.18)',
              boxShadow: '0 8px 32px rgba(28,23,20,0.08)',
              padding: '0.6rem 0',
              zIndex: 1099,
            }}>
              {NAV_ITEMS.flatMap((item) => {
                if (item.dropdown) {
                  return [
                    <div key={`cat-${item.label}`} style={{ padding: '0.7rem 1.25rem 0.3rem', fontFamily: mono, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a89888' }}>{item.label}</div>,
                    ...item.dropdown.map((sub) => {
                      const Icon = ICONS_BY_HREF[sub.href];
                      return (
                        <a
                          key={sub.href}
                          href={sub.href}
                          target={sub.external ? '_blank' : undefined}
                          rel={sub.external ? 'noopener noreferrer' : undefined}
                          onClick={() => setMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.55rem 1.25rem', color: '#3d3028', fontFamily: font, fontSize: '0.92rem', textDecoration: 'none' }}
                        >
                          {Icon && <Icon size={16} style={{ color: '#8a7a6a' }} />}
                          <span>{sub.label}</span>
                        </a>
                      );
                    }),
                  ];
                }
                const Icon = item.href ? ICONS_BY_HREF[item.href] : undefined;
                return [
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.7rem 1.25rem', color: '#3d3028', fontFamily: font, fontSize: '0.95rem', textDecoration: 'none' }}
                  >
                    {Icon && <Icon size={16} style={{ color: '#8a7a6a' }} />}
                    <span>{item.label}</span>
                  </a>,
                ];
              })}
            </div>
          )}
        </>
      )}
    </nav>
  );
}

// ─── SETUP SCREEN ─────────────────────────────────────────────────────────────

function SetupScreen({ onStart, isMobile }: {
  onStart: (type: CycleType, refDate: string, duration: number) => void;
  isMobile: boolean;
}) {
  const [cycleType, setCycleType] = useState<CycleType>('typical');
  const [refDate, setRefDate] = useState(() => formatLocalDate(new Date()));
  const [duration, setDuration] = useState(28);
  const profile = PROFILES[cycleType];
  const font = "'Source Serif 4', Georgia, serif";
  const mono = "'DM Mono', monospace";

  const handleTypeChange = (t: CycleType) => {
    setCycleType(t);
    setDuration(PROFILES[t].defaultDuration);
  };

  return (
    <div style={{ backgroundColor: '#faf8f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '5.5rem 1.5rem 3rem' : '6.5rem 5rem 3rem', animation: 'mc-fadein 0.8s ease' }}>
      <MCNavbar isMobile={isMobile} />
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '4rem' }}>
        <h1 style={{ fontFamily: font, fontSize: isMobile ? '3rem' : '4.5rem', fontWeight: 300, color: '#1c1714', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
          Menstrual Clock
        </h1>
        <div style={{ width: isMobile ? 40 : 60, height: 1, background: '#c4a882', margin: '1.4rem auto 0' }}/>
        <div style={{ marginTop: '1rem', fontFamily: font, fontSize: isMobile ? '0.78rem' : '0.85rem', color: '#8a7a6a', fontStyle: 'italic', letterSpacing: '0.06em' }}>
          by Luna Maltseva &amp; Daria Yurishcheva
        </div>
      </div>

      <div style={{ fontFamily: mono, fontSize: '0.62rem', color: '#a89888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
        Configure your cycle
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', alignItems: 'center', width: '100%', maxWidth: 520 }}>
        {/* Cycle type */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontFamily: mono, fontSize: '0.62rem', color: '#8a7a6a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cycle type</label>
          <div style={{ position: 'relative' }}>
            <select className="mc-select" value={cycleType} onChange={e => handleTypeChange(e.target.value as CycleType)}>
              <option value="typical">Typical</option>
              <option value="pcos">PCOS</option>
              <option value="menopause">Menopause</option>
              <option value="hrt">Injection HRT</option>
            </select>
            <span style={{ position: 'absolute', right: '0.3rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a89888', fontSize: '0.7rem' }}>▾</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '2rem' : '3.5rem', alignItems: 'center', justifyContent: 'center' }}>
          {/* Reference date */}
          {profile.hasRefDate && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontFamily: mono, fontSize: '0.62rem', color: '#8a7a6a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{profile.refDateLabel}</label>
              <input type="date" className="mc-input" value={refDate} onChange={e => setRefDate(e.target.value)} style={{ width: isMobile ? 180 : 200 }}/>
            </div>
          )}

          {/* Duration */}
          {cycleType !== 'menopause' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontFamily: mono, fontSize: '0.62rem', color: '#8a7a6a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {cycleType === 'hrt' ? 'Injection interval (days)' : 'Cycle length (days)'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setDuration(d => Math.max(cycleType === 'hrt' ? 3 : 21, d - 1))} style={{ background: 'none', border: '1px solid rgba(196,168,136,.35)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontFamily: font, fontSize: '1.1rem', color: '#8a7a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>−</button>
                <span style={{ fontFamily: font, fontSize: '1rem', color: '#3d3028', minWidth: '2.5rem', textAlign: 'center' }}>{duration}</span>
                <button onClick={() => setDuration(d => Math.min(cycleType === 'hrt' ? 21 : 42, d + 1))} style={{ background: 'none', border: '1px solid rgba(196,168,136,.35)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontFamily: font, fontSize: '1.1rem', color: '#8a7a6a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>+</button>
              </div>
            </div>
          )}
        </div>

        {cycleType === 'menopause' && (
          <div style={{ fontFamily: font, fontSize: '0.82rem', color: '#8a7a6a', fontStyle: 'italic', textAlign: 'center', maxWidth: 340, lineHeight: 1.7 }}>
            Postmenopause has no cycle start date. The clock shows a 30-day window of typical postmenopausal hormonal fluctuation.
          </div>
        )}

        <button className="mc-start-btn" onClick={() => onStart(cycleType, refDate, cycleType === 'menopause' ? 30 : duration)} style={{ marginTop: '1rem' }}>
          Start the clock
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MenstrualClock() {
  const isMobile = useIsMobile();
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'clock'>('setup');
  const [cycleType, setCycleType] = useState<CycleType>('typical');
  const [cycleStart, setCycleStart] = useState(() => formatLocalDate(new Date()));
  const [cycleDuration, setCycleDuration] = useState(28);
  const [derivMode, setDerivMode] = useState<DerivMode>('raw');
  const [dayFrac, setDayFrac] = useState(1.0);
  const [speedIdx, setSpeedIdx] = useState(4);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState<number|null>(null);
  const [hoveredLine, setHoveredLine] = useState<number|null>(null);
  const [clockVisible, setClockVisible] = useState(false);

  const wasPlayingRef = useRef(false);
  const lastTsRef = useRef<number|null>(null);
  const rafRef = useRef<number|null>(null);

  useEffect(() => {
    ensureStyles();
    if (typeof document === 'undefined') return;
    document.fonts.ready.then(() => setLoaded(true));
    const t = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const profile = PROFILES[cycleType];
  const cycleStartDate = useMemo(() => profile.hasRefDate ? parseDateInput(cycleStart) : null, [profile.hasRefDate, cycleStart]);

  const normData = useMemo(() => buildNormData(profile), [profile]);

  const derivMaxes = useMemo(() => {
    const out: Record<string, number> = {};
    for (const h of profile.hormones) out[h.key] = computeMaxAbsDeriv(normData.graph[h.key]);
    return out;
  }, [profile, normData]);

  const speed = SPEED_STEPS[speedIdx];
  const tick = useCallback((ts: number) => {
    if (lastTsRef.current !== null) setDayFrac(d => d + (ts - lastTsRef.current!) / 1000 / speed);
    lastTsRef.current = ts;
    rafRef.current = requestAnimationFrame(tick);
  }, [speed]);

  useEffect(() => {
    if (paused || phase !== 'clock') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null; lastTsRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [paused, tick, phase]);

  const handleDragStart = useCallback(() => { wasPlayingRef.current = !paused; setPaused(true); }, [paused]);
  const handleDragMove = useCallback((v: number) => setDragOffset(v), []);
  const handleDragEnd = useCallback(() => {
    if (dragOffset !== null) { setDayFrac(dragOffset); setDragOffset(null); }
    if (wasPlayingRef.current) setPaused(false);
  }, [dragOffset]);

  const handleStart = (type: CycleType, refDate: string, duration: number) => {
    setCycleType(type); setCycleStart(refDate); setCycleDuration(duration);
    setDayFrac(1.0); setPaused(false);
    setPhase('clock');
    setTimeout(() => setClockVisible(true), 50);
  };

  const offsetDay = dragOffset ?? dayFrac;
  const scaleT = (profile.data.length / cycleDuration);

  // Compute normalized poem vals for current time
  const normalizedPoemVals = useMemo(() => {
    const t = (offsetDay - 1) * scaleT;
    const out: Record<string, number> = {};
    for (const h of profile.hormones) out[h.key] = interpVal(normData.poem[h.key], t);
    return out;
  }, [offsetDay, scaleT, profile.hormones, normData.poem]);

  const slotIndices = useMemo(() => {
    const keys = profile.hormones.map(h => h.key);
    return keys.map(k => hormoneLine(normalizedPoemVals[k] ?? 0));
  }, [profile.hormones, normalizedPoemVals]);

  const sentence = useMemo(() => buildSentence(cycleType, slotIndices), [cycleType, slotIndices]);
  const activeSlots = useMemo(() => getActiveSlots(cycleType, slotIndices), [cycleType, slotIndices]);

  const timeRange = useMemo(() =>
    estimateTimeRange(offsetDay, slotIndices, cycleDuration, cycleStartDate, profile, normData.poem),
    [offsetDay, slotIndices, cycleDuration, cycleStartDate, profile, normData.poem]
  );

  // Next period (only for cyclic types)
  const nextPeriodDate = useMemo(() => {
    if (cycleType === 'menopause' || !cycleStartDate) return null;
    const dayInCycle = ((offsetDay - 1) % cycleDuration + cycleDuration) % cycleDuration;
    const daysLeft = cycleDuration - dayInCycle;
    const dt = new Date(cycleStartDate.getTime() + (dayInCycle + daysLeft) * 86400000);
    return `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}`;
  }, [cycleType, offsetDay, cycleDuration, cycleStartDate]);

  const poemLinesRef = useRef<HTMLDivElement>(null);
  const graphColRef = useRef<HTMLDivElement>(null);
  const [poemH, setPoemH] = useState(500);
  const [graphW, setGraphW] = useState(0);
  useEffect(() => { const el = poemLinesRef.current; if (!el) return; const ro = new ResizeObserver(e => setPoemH(e[0].contentRect.height)); ro.observe(el); return () => ro.disconnect(); }, [loaded, phase]);
  useEffect(() => { const el = graphColRef.current; if (!el) return; const ro = new ResizeObserver(e => setGraphW(e[0].contentRect.width)); ro.observe(el); return () => ro.disconnect(); }, [loaded, phase]);

  const graphH = isMobile ? 220 : poemH;
  const font = "'Source Serif 4', Georgia, serif";
  const fontSize = isMobile ? '1.05rem' : '1.3rem';
  const bg = '#faf8f5';
  const mono = "'DM Mono', monospace";

  if (!loaded) {
    return (
      <div style={{ backgroundColor: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MCNavbar isMobile={isMobile} />
        <div style={{ width: 60, height: 1, background: '#c4a882', animation: 'mc-pulse 2.5s ease-in-out infinite' }}/>
      </div>
    );
  }

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStart} isMobile={isMobile}/>;
  }

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', opacity: clockVisible ? 1 : 0, transition: 'opacity 0.6s ease', boxSizing: 'border-box', padding: isMobile ? '5rem 1.5rem 3rem' : '6rem 5rem 3.5rem' }}>
      <MCNavbar isMobile={isMobile} />
      {/* Sentence */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
        <div style={{ fontFamily: font, fontSize: isMobile ? '1.1rem' : '1.35rem', color: '#1c1714', fontStyle: 'italic', fontWeight: 300, lineHeight: 2, letterSpacing: '0.01em', animation: 'mc-glow 7s ease-in-out infinite' }}>
          {sentence}
        </div>
        <div style={{ fontFamily: mono, fontSize: isMobile ? '0.65rem' : '0.7rem', color: '#a89888', marginTop: '0.55rem', letterSpacing: '0.07em' }}>
          {timeRange}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '2rem' : '4rem', alignItems: 'flex-start' }}>
        {/* Poem lines */}
        <div style={{ flex: '0 0 auto', minWidth: 0, width: isMobile ? '100%' : undefined }}>
          <div ref={poemLinesRef}>
            {POEMS.map((line, i) => {
              const activeHere = activeSlots.filter(s => s.poemIdx === i);
              const active = activeHere.length > 0;
              const hl = activeHere.map(s => ({
                phrase: SLOT_WORDS[s.slotIdx][i],
                color: profile.hormones[s.slotIdx]?.color ?? '#888',
              }));
              return (
                <div key={i} style={{ marginBottom: isMobile ? '0.5rem' : '0.7rem', position: 'relative', cursor: 'default' }}
                  onMouseEnter={() => setHoveredLine(i)} onMouseLeave={() => setHoveredLine(null)}>
                  <span style={{ fontFamily: font, fontSize, color: '#1c1714', lineHeight: 1.9, opacity: active ? 1 : 0.07, fontWeight: active ? 400 : 300, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                    {renderLine(line, hl)}
                  </span>
                  {hoveredLine === i && <PoemTooltip poem={POEM_DATA[i]} isMobile={isMobile}/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph + controls */}
        <div ref={graphColRef} style={{ flex: '1 1 0', minWidth: 0, width: isMobile ? '100%' : undefined, overflow: 'hidden' }}>
          {/* Derivative mode toggle */}
          <div style={{ display: 'flex', gap: 0, marginBottom: '0.5rem', justifyContent: 'flex-end' }}>
            {(['raw', 'first'] as DerivMode[]).map(m => (
              <button key={m} className={`mc-deriv-btn${derivMode === m ? ' active' : ''}`} onClick={() => setDerivMode(m)}>
                {m === 'raw' ? 'Values' : 'd/dt'}
              </button>
            ))}
          </div>

          <CycleGraph
            profile={profile} graphNorm={normData.graph}
            offsetDay={offsetDay} width={graphW || 100} height={graphH}
            cycleStartDate={cycleStartDate} cycleDuration={cycleDuration}
            derivMode={derivMode} derivMaxes={derivMaxes}
            onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}
          />

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ flex: 1 }}/>
            <IconBtn holdable onClick={() => setSpeedIdx(i => Math.min(SPEED_STEPS.length-1, i+1))} disabled={speedIdx >= SPEED_STEPS.length-1} title="Slower"><SlowerIcon/></IconBtn>
            <IconBtn onClick={() => setPaused(p => !p)} title={paused ? 'Play' : 'Pause'}>{paused ? <PlayIcon/> : <PauseIcon/>}</IconBtn>
            <IconBtn holdable onClick={() => setSpeedIdx(i => Math.max(0, i-1))} disabled={speedIdx <= 0} title="Faster"><FasterIcon/></IconBtn>
            <div style={{ flex: 1 }}/>
            <IconBtn onClick={() => { setDayFrac(1); setPaused(true); }} title="Reset"><StopIcon/></IconBtn>
          </div>

          {nextPeriodDate && (
            <div style={{ marginTop: '1rem', fontFamily: mono, fontSize: isMobile ? '0.65rem' : '0.68rem', color: '#a89888', letterSpacing: '0.07em' }}>
              Next predicted {cycleType === 'hrt' ? 'injection' : 'menstrual phase'}: {nextPeriodDate}
            </div>
          )}
        </div>
      </div>

      {/* Interpretation box */}
      <InterpretBox
        profile={profile} offsetDay={offsetDay} cycleDuration={cycleDuration}
        normalizedVals={normalizedPoemVals} isMobile={isMobile}
      />

      {/* Art description at bottom */}
      <ArtDescription isMobile={isMobile}/>
    </div>
  );
}
