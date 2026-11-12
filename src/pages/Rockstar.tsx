import { Component, createRef, memo, type CSSProperties, type ReactNode } from 'react';

// ── Level Composer ────────────────────────────────────────────────────────────
// Web port of the Rockstar level recorder (practice → record → save/delete),
// with editing, quantizing and playtesting. Output matches the C++ track[] format.

type Phase = 'practice' | 'standby' | 'recording' | 'saving';
type Mode = 'keys' | 'music';
type KeyState = 'normal' | 'pressed' | 'blocked' | 'selected';
type KeyIcon = 'none' | 'record' | 'save' | 'trash' | 'play' | 'pause' | 'restart' | 'import';
type Ctrl = 'R' | 'S' | 'D' | 'I';

interface Note { id: number; lane: number; t: number; raw: number }
interface Box { x: number; y: number; w: number; h: number }
interface Str { off: number; amp: number; a: SVGPathElement | null; b: SVGPathElement | null; dirty: boolean }
interface Bubble { id: number; lane: number; born: number }
interface Picker { x: number; y: number; t: number }

interface State {
  phase: Phase; picks: Note[]; cur: number; playing: boolean;
  audioName: string | null; audioDur: number;
  bpm: string; offset: string; grid: string; mode: Mode;
  down: number[]; ctrlFlash: Ctrl | null; sels: number[];
  stageH: number; dragging: boolean; copied: boolean;
  reaction: number | null; reactDraft: string | null; editZ: number | null;
  box: Box | null; outOpen: boolean; picker: Picker | null; wantAudio: string | null;
  speed: number; speedDraft: string | null;
}

const REACTION = 123;   // default reaction window, ms
const BRIDGE = 0.92;    // bridge position as a fraction of stage height
const LANE = 86;        // lane width, px
const FONT = "'Open Sans',sans-serif";

const oct = (n: number) =>
  `polygon(${n}px 0,calc(100% - ${n}px) 0,100% ${n}px,100% calc(100% - ${n}px),calc(100% - ${n}px) 100%,${n}px 100%,0 calc(100% - ${n}px),0 ${n}px)`;

const CSS = `
.lc-root input[type=number]::-webkit-inner-spin-button,.lc-root input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
.lc-root input[type=number]{-moz-appearance:textfield}
.lc-root select option{background:#000}
.lc-face:hover{background:linear-gradient(#6a6a6a,#1e1e1e)!important}
.lc-face-light:hover{background:linear-gradient(#fff,#e2e2e2)!important}
.lc-thumb:hover{background:#4a4a4a!important}
.lc-handle:hover{background:#fff!important}
.lc-react:focus{border-bottom-color:#fff!important}
@keyframes lcMarq{0%,12%{transform:translateX(0)}88%,100%{transform:translateX(var(--d,0px))}}
@keyframes lcBubble{from{transform:scale(1);opacity:.45}to{transform:scale(3.93);opacity:0}}
`;

// ── Keycap ────────────────────────────────────────────────────────────────────
const KEY_STYLES: Record<KeyState, { rim: string; top: string; bot: string; pat: number; ink: string; scale: number }> = {
  normal:   { rim: '#fff', top: '#555', bot: '#111', pat: 0.12, ink: '#fff', scale: 1 },
  pressed:  { rim: 'oklch(0.66 0.22 25)', top: '#141414', bot: '#3a3a3a', pat: 0.05, ink: '#cfcfcf', scale: 0.92 },
  blocked:  { rim: '#333', top: '#1c1c1c', bot: '#0e0e0e', pat: 0.03, ink: '#3d3d3d', scale: 1 },
  selected: { rim: '#fff', top: '#fff', bot: '#c9c9c9', pat: 0, ink: '#000', scale: 1 },
};

const Keycap = memo(function Keycap({ label = '', state = 'normal', icon = 'none' }: { label?: string; state?: KeyState; icon?: KeyIcon }) {
  const s = KEY_STYLES[state];
  const ink = s.ink;
  const hole = state === 'blocked' ? '#161616' : state === 'selected' ? '#ddd' : '#2a2a2a';
  const dot = state === 'pressed' ? 'oklch(0.64 0.21 25)' : ink;
  const glow = state === 'pressed' ? 'drop-shadow(0 0 4cqw oklch(0.62 0.24 25)) drop-shadow(0 0 10cqw oklch(0.55 0.22 25 / 0.6))' : 'none';

  let glyph: ReactNode;
  if (icon === 'record') {
    glyph = <span style={{ width: '40cqw', height: '40cqw', borderRadius: '50%', background: dot }} />;
  } else if (icon === 'save') {
    glyph = (
      <span style={{ position: 'relative', display: 'block', width: '42cqw', height: '42cqw', background: ink, clipPath: 'polygon(0 0,80% 0,100% 20%,100% 100%,0 100%)' }}>
        <span style={{ position: 'absolute', top: 0, left: '24%', width: '46%', height: '32%', background: hole }} />
        <span style={{ position: 'absolute', top: 0, left: '54%', width: '10%', height: '24%', background: ink }} />
        <span style={{ position: 'absolute', bottom: '10%', left: '14%', width: '72%', height: '38%', background: hole }} />
      </span>
    );
  } else if (icon === 'trash') {
    glyph = (
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3cqw', width: '42cqw' }}>
        <span style={{ width: '30%', height: '5cqw', background: ink }} />
        <span style={{ width: '100%', height: '5cqw', background: ink }} />
        <span style={{ display: 'flex', justifyContent: 'center', gap: '5cqw', width: '80%', height: '32cqw', paddingTop: '5cqw', boxSizing: 'border-box', background: ink, clipPath: 'polygon(0 0,100% 0,92% 100%,8% 100%)' }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: '4cqw', height: '20cqw', background: hole }} />)}
        </span>
      </span>
    );
  } else if (icon === 'import') {
    glyph = (
      <svg viewBox="0 0 24 24" shapeRendering="geometricPrecision" style={{ display: 'block', width: '46cqw', height: '46cqw', fill: ink }}>
        <path d="M10.5 2h3v8.2h3.6L12 15.6 6.9 10.2h3.6z" />
        <path d="M2.5 13.5h3v4.5h13v-4.5h3V21h-19z" />
      </svg>
    );
  } else if (icon === 'play') {
    glyph = <span style={{ width: '36cqw', height: '42cqw', background: ink, clipPath: 'polygon(0 0,100% 50%,0 100%)', transform: 'translateX(8%)' }} />;
  } else if (icon === 'restart') {
    glyph = (
      <span style={{ display: 'flex', alignItems: 'center', gap: '3cqw', transform: 'translateX(-3%)' }}>
        <span style={{ width: '8cqw', height: '40cqw', background: ink }} />
        <span style={{ width: '32cqw', height: '40cqw', background: ink, clipPath: 'polygon(100% 0,0 50%,100% 100%)' }} />
      </span>
    );
  } else if (icon === 'pause') {
    glyph = (
      <span style={{ display: 'flex', gap: '10cqw' }}>
        <span style={{ width: '12cqw', height: '40cqw', background: ink }} />
        <span style={{ width: '12cqw', height: '40cqw', background: ink }} />
      </span>
    );
  } else {
    glyph = (
      <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: /^\d$/.test(label) ? '83cqw' : '60cqw', lineHeight: 1, color: ink, transform: 'translateY(-3%)' }}>
        {label}
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', containerType: 'size', transform: `scale(${s.scale})`, filter: glow, transition: 'transform 70ms ease-out,filter 90ms ease-out', userSelect: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(17.3% 0,82.7% 0,100% 17.3%,100% 82.7%,82.7% 100%,17.3% 100%,0 82.7%,0 17.3%)', background: s.rim }} />
      <div style={{ position: 'absolute', inset: '3.3%', clipPath: 'polygon(16.8% 0,83.2% 0,100% 16.8%,100% 83.2%,83.2% 100%,16.8% 100%,0 83.2%,0 16.8%)', background: `linear-gradient(${s.top},${s.bot})` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'url(/rockstar-keycap.svg) center / 100% 100% no-repeat', opacity: s.pat }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{glyph}</div>
    </div>
  );
});

// ── Small chamfered controls ──────────────────────────────────────────────────
function StepButton({ onClick, size, children }: { onClick: () => void; size: number; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: 2, border: 'none', background: '#fff', cursor: 'pointer', clipPath: oct(5) }}>
      <span className="lc-face" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, background: 'linear-gradient(#555,#111)', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 14, clipPath: oct(4) }}>
        {children}
      </span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', padding: 1, background: '#3a3a3a', clipPath: oct(8) }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px', background: '#0b0b0b', clipPath: oct(7) }}>
        <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: '.06em', color: '#fff' }}>{label}</span>
        {children}
      </span>
    </label>
  );
}

const fieldInput: CSSProperties = {
  background: 'transparent', border: 'none', outline: 'none', color: '#fff',
  fontFamily: FONT, fontWeight: 700, fontSize: 14,
};

const numInput: CSSProperties = {
  width: 42, padding: '2px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #3a3a3a', outline: 'none',
  color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 13, textAlign: 'center',
};

const modeBtn = (active: boolean): CSSProperties => ({
  height: 30, padding: '0 18px', border: 'none',
  background: active ? 'linear-gradient(#555,#111)' : 'transparent', color: '#fff',
  fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: '.08em', cursor: 'pointer', clipPath: oct(6),
});

// ── Composer ──────────────────────────────────────────────────────────────────
class Composer extends Component<object, State> {
  state: State = {
    phase: 'practice', picks: [], cur: 0, playing: false, audioName: null, audioDur: 0,
    bpm: '', offset: '0', grid: '2', mode: 'keys', down: [0, 0, 0, 0], ctrlFlash: null,
    sels: [], stageH: 520, dragging: false, copied: false,
    reaction: null, reactDraft: null, editZ: null, box: null, outOpen: false, picker: null, wantAudio: null,
    speed: 1, speedDraft: null,
  };

  lanesRef = createRef<HTMLDivElement>();
  fileRef = createRef<HTMLInputElement>();
  importRef = createRef<HTMLInputElement>();
  layerA = createRef<HTMLDivElement>();
  layerB = createRef<HTMLDivElement>();
  marqBox = createRef<HTMLButtonElement>();
  marqText = createRef<HTMLSpanElement>();

  nextId = 1; bubbleId = 1; bubblesArr: Bubble[] = [];
  auto = [0, 0, 0, 0]; c0 = 0; p0 = 0; a0 = 0; rate = 1; lastCur = 0; now = 0; liveCur = 0; lastRender = 0; lastFrame = 0;
  strs: Str[] = [0, 1, 2, 3].map(() => ({ off: 0, amp: 0, a: null, b: null, dirty: true }));
  strH = 0; strBy = 0;
  strRef: Record<string, (el: SVGPathElement | null) => void> = {};
  lastLane = 1; insHeld = false; litKey = '';
  marqKey = ''; marqEl: HTMLSpanElement | null = null;
  ac: AudioContext | null = null; buf: AudioBuffer | null = null; src: AudioBufferSourceNode | null = null; decodeId = 0;
  raf = 0; cft = 0; cpt = 0; holdT = 0; playFrom: number | null = null; heard = new Set<number>(); ladder: number[] | null = null;
  ro: ResizeObserver | null = null; stageEl: HTMLDivElement | null = null;
  outFor: Note[] | null = null; outOff = 0; outStr = '';

  kd = (e: KeyboardEvent) => this.onKeyDown(e);
  ku = (e: KeyboardEvent) => this.onKeyUp(e);
  wh = (e: WheelEvent) => this.onWheel(e);

  sref(k: string) {
    return this.strRef[k] || (this.strRef[k] = el => {
      const s = this.strs[+k[0]];
      if (k[1] === 'a') s.a = el; else s.b = el;
      s.dirty = true;
    });
  }

  fitMarquee() {
    const b = this.marqBox.current, t = this.marqText.current;
    if (!b || !t) { this.marqEl = null; return; }
    const key = this.state.audioName + '|' + b.clientWidth;
    if (key === this.marqKey && t === this.marqEl) return;
    this.marqKey = key; this.marqEl = t;
    const over = t.scrollWidth - b.clientWidth;
    if (over > 2) {
      t.style.setProperty('--d', -over + 'px');
      t.style.animation = `lcMarq ${Math.max(4, over / 25 + 3)}s ease-in-out infinite alternate`;
    } else { t.style.animation = 'none'; t.style.transform = 'none'; }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.kd); window.addEventListener('keyup', this.ku);
    this.attachStage();
    const loop = () => { this.tick(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  componentDidUpdate() { this.fitMarquee(); }
  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.kd); window.removeEventListener('keyup', this.ku);
    if (this.ro) this.ro.disconnect();
    if (this.stageEl) this.stageEl.removeEventListener('wheel', this.wh);
    this.stageEl = null;
    this.stopAudio();
    this.ac?.close(); this.ac = null;
  }
  attachStage() {
    const el = this.lanesRef.current;
    if (!el || el === this.stageEl) return;
    if (this.ro) this.ro.disconnect();
    if (this.stageEl) this.stageEl.removeEventListener('wheel', this.wh);
    this.stageEl = el;
    this.ro = new ResizeObserver(() => { if (el.clientHeight > 0) this.setState({ stageH: el.clientHeight }); });
    this.ro.observe(el);
    el.addEventListener('wheel', this.wh, { passive: false });
    if (el.clientHeight > 0) this.setState({ stageH: el.clientHeight });
  }

  // ── Geometry ──
  stageH() { return this.state.stageH > 100 ? this.state.stageH : 520; }
  reaction() { return this.state.reaction ?? REACTION; }
  // Recording scroll speed follows Reaction, capped at the 30 ms speed so frame-sized windows stay usable.
  baseZ() { return LANE / (2 * Math.max(30, this.reaction())); }
  // Edit/playtest zoom is absolute (px per ms) and independent of Reaction; only recording scrolls at the Reaction-based speed.
  editZ() { return this.state.editZ ?? this.baseZ(); }
  zoomV() { return this.state.phase === 'saving' ? this.editZ() : this.baseZ(); }
  clampZ(z: number) { return Math.min(3, Math.max(0.01, z)); }
  // The game accepts a hit within ±Reaction, so the hit window is 2 × Reaction.
  // Frame ladder for the Reaction +/− buttons, by window: 1f@240, 1f@120, then whole frames at 60 FPS up to 2 s.
  reactLadder() { return this.ladder || (this.ladder = [1000 / 240, 1000 / 120, ...Array.from({ length: 120 }, (_, i) => (i + 1) * 1000 / 60)].map(w => w / 2)); }
  stepReaction(dir: number) {
    const r = this.reaction(), L = this.reactLadder(), eps = 1e-3;
    const v = dir < 0 ? [...L].reverse().find(x => x < r - eps) : L.find(x => x > r + eps);
    if (v != null) this.setReaction(v);
  }
  setReaction(v: number) {
    // Freeze the edit zoom first so changing Reaction doesn't rescale the edit view.
    this.setState({ reaction: Math.min(2000, Math.max(2, v)), reactDraft: null, editZ: this.state.editZ ?? this.editZ() });
  }
  // Hit window (2 × Reaction) in frames.
  frameLabel(r: number) {
    const w = 2 * r, near = (a: number, b: number) => Math.abs(a - b) < 0.04;
    if (near(w, 1000 / 240)) return '1-frame @ 240 FPS';
    if (near(w, 1000 / 120)) return '1-frame @ 120 FPS';
    const f = w * 60 / 1000, n = Math.max(1, Math.round(f));
    return (near(f * 1000 / 60, n * 1000 / 60) ? '' : '≈') + n + '-frame @ 60 FPS';
  }
  msLabel(r: number) { return String(Math.round(r * 100) / 100); }
  barH() { return Math.max(120, this.stageH() - 76); }
  bridgeY() { return this.stageH() * BRIDGE; }
  geom() {
    const s = this.state, H = this.stageH(), by = this.bridgeY(), z = this.zoomV(), cur = this.live() ? this.liveCur : s.cur;
    const tLo = cur - (H - by) / z, tHi = cur + by / z;
    const last = s.picks.length ? s.picks[s.picks.length - 1].t : 0;
    const T0 = Math.min(0, tLo), T1 = Math.max(last + 2000, this.hasAudio() ? s.audioDur || 0 : 0, tHi, T0 + 1000);
    return { H, by, z, cur, tLo, tHi, T0, T1, span: T1 - T0, bh: this.barH() };
  }
  barDrag(e: React.PointerEvent, kind: 'thumb' | 'hi' | 'lo') {
    e.preventDefault(); e.stopPropagation();
    const g = this.geom(), y0 = e.clientY, k = g.span / g.bh;
    this.drag(ev => {
      const dt = -(ev.clientY - y0) * k;
      if (kind === 'thumb') return this.setState({ cur: Math.max(-2000, g.cur + dt) });
      if (kind === 'hi') {
        const z = this.clampZ(g.H / Math.max(100, g.tHi + dt - g.tLo));
        return this.setState({ editZ: z, cur: g.tLo + (g.H - g.by) / z });
      }
      const z = this.clampZ(g.H / Math.max(100, g.tHi - (g.tLo + dt)));
      this.setState({ editZ: z, cur: g.tHi - g.by / z });
    });
  }
  barClick(e: React.PointerEvent) {
    const g = this.geom(), r = e.currentTarget.getBoundingClientRect();
    const t = g.T0 + (1 - (e.clientY - r.top) / r.height) * g.span;
    this.setState({ cur: Math.max(-2000, t - (2 * g.by - g.H) / (2 * g.z)) });
  }
  zoomView(f: number) { this.setState({ editZ: this.clampZ(this.editZ() * f) }); }
  zoomBy(f: number) { this.stepReaction(f > 1 ? -1 : 1); }

  // ── Transport ──
  hasAudio() { return this.state.mode === 'music' && !!this.state.audioName && !!this.buf; }
  setMode(m: Mode) {
    const p = this.state.phase;
    if (p === 'standby' || p === 'recording' || this.state.playing) return;
    if (m === 'music' && (this.state.mode === 'music' || !this.state.audioName)) this.fileRef.current?.click();
    this.resnap({ mode: m });
  }
  // Music plays through Web Audio and the timeline reads the same hardware clock the sound comes from,
  // so the two can't drift apart. Without music the timeline runs on the performance clock.
  // Either way it advances at `rate` × real time from its anchor: c0 at a0 (audio) or p0 (performance).
  clock() {
    if (this.src) return this.c0 + Math.max(0, this.audioNow() - this.a0) * 1000 * this.rate;
    return this.c0 + (performance.now() - this.p0) * this.rate;
  }
  // Context time of the sample currently reaching the speakers.
  audioNow() {
    const ac = this.ac!, ts = ac.getOutputTimestamp?.();
    if (ts?.contextTime && ts.performanceTime) return ts.contextTime + (performance.now() - ts.performanceTime) / 1000;
    return ac.currentTime - (ac.outputLatency || ac.baseLatency || 0);
  }
  anchor(cur: number) { this.c0 = cur; this.p0 = performance.now(); }
  setSpeed(v: number) {
    v = Math.round(Math.min(2, Math.max(0.2, v)) * 100) / 100;
    if (this.src) {
      // Re-anchor at the moment the new rate takes effect; pitch follows the rate, like a tape.
      const t = this.ac!.currentTime;
      if (t > this.a0) { this.c0 += (t - this.a0) * 1000 * this.rate; this.a0 = t; }
      this.src.playbackRate.setValueAtTime(v, t);
    } else if (this.live()) this.anchor(this.clock());
    this.rate = v;
    this.setState({ speed: v });
  }
  startAudio(cur: number) {
    this.stopAudio(); this.anchor(cur);
    if (!this.hasAudio()) return;
    const ac = this.ctx(), at = (cur + this.off()) / 1000, t = ac.currentTime + 0.03;
    const src = ac.createBufferSource();
    src.buffer = this.buf; src.playbackRate.value = this.rate; src.connect(ac.destination);
    src.onended = () => {
      if (this.src !== src) return;
      // Track ran out: keep the timeline going on the performance clock.
      const c = this.clock(); this.src = null; this.anchor(c);
      if (this.state.phase === 'recording') this.stopRecording();
    };
    // A negative position (offset skips past 0:00) delays the start instead of seeking.
    src.start(t + Math.max(0, -at) / this.rate, Math.max(0, at));
    this.src = src; this.c0 = cur; this.a0 = t;
  }
  stopAudio() {
    const src = this.src; this.src = null;
    if (src) { src.onended = null; src.stop(); }
  }
  editable() { return this.state.phase === 'saving' && !this.state.playing; }
  live() { return this.state.phase === 'recording' || (this.state.phase === 'saving' && this.state.playing); }
  layerY(cur: number) {
    const dir = this.state.phase === 'recording' || this.state.phase === 'standby' ? -1 : 1;
    return this.bridgeY() + dir * cur * this.zoomV();
  }

  tick() {
    const now = performance.now(), dt = Math.min(0.05, (now - (this.lastFrame || now)) / 1000);
    this.now = now; this.lastFrame = now;
    this.attachStage();
    this.drawStrings(dt);
    const { playing, picks } = this.state;
    let need = false;
    if (this.insHeld && !playing) { this.insHeld = false; need = true; }
    const nb = this.bubblesArr.filter(b => now - b.born < 340);
    if (nb.length !== this.bubblesArr.length) { this.bubblesArr = nb; need = true; }
    const lit = this.auto.map(a => now - a < 140).join();
    if (lit !== this.litKey) { this.litKey = lit; need = true; }
    if (this.live()) {
      const c = this.clock();
      if (playing) {
        for (const p of picks) if (p.t > this.lastCur && p.t <= c && !this.heard.delete(p.id)) { this.hit(p.lane, true); need = true; }
      }
      this.lastCur = this.liveCur = c;
      const y = this.layerY(c) + 'px';
      for (const r of [this.layerA, this.layerB]) if (r.current) r.current.style.transform = 'translateY(' + y + ')';
      if (need || now - this.lastRender > 90) { this.lastRender = now; this.setState({ cur: c }); }
      return;
    }
    if (need) this.forceUpdate();
  }

  // String vibration, ported from rockstar-advanced sineWave + decay.
  drawStrings(dt: number) {
    const H = this.stageH(), by = this.bridgeY(), f = 60 * dt;
    const hChanged = H !== this.strH || by !== this.strBy; this.strH = H; this.strBy = by;
    this.strs.forEach((s, i) => {
      if (!s.a || !s.b) return;
      const moving = s.amp > 0.01;
      if (moving) {
        s.off += dt * 90; s.amp = Math.max(0, s.amp * Math.pow(0.97, f) - 0.1 * 1.43 * f);
      } else if (!s.dirty && !hChanged) return;
      s.dirty = moving;
      const x = LANE / 2 + i * LANE;
      if (!moving) {
        s.off = 0; s.amp = 0;
        s.a.setAttribute('d', `M${x} 0V${H}`); s.b.setAttribute('d', ''); s.a.setAttribute('stroke', '#2c2c2c');
        return;
      }
      const N = 32; let da = '', db = '';
      for (let k = 0; k < N; k++) {
        const t = k / (N - 1), y = by - t * by, w = Math.sin(t * 6 * 2 * Math.PI + s.off) * s.amp;
        da += (k ? 'L' : 'M') + (x + w).toFixed(1) + ' ' + y.toFixed(1);
        db += (k ? 'L' : 'M') + (x - w).toFixed(1) + ' ' + y.toFixed(1);
      }
      da += `M${x} ${by}V${H}`;
      const c = Math.round(44 + Math.min(1, s.amp / 5.7) * 160), col = `rgb(${c},${c},${c})`;
      s.a.setAttribute('d', da); s.b.setAttribute('d', db); s.a.setAttribute('stroke', col); s.b.setAttribute('stroke', col);
    });
  }

  // ── Sound ──
  ctx() {
    if (!this.ac) this.ac = new AudioContext();
    if (this.ac.state === 'suspended') this.ac.resume();
    return this.ac;
  }
  pluck(lane: number) {
    const ac = this.ctx(), t = ac.currentTime, f = [196, 246.94, 293.66, 392][lane - 1];
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    g.connect(ac.destination);
    ([[f, 'triangle'], [f * 2, 'sine']] as const).forEach(([fr, ty]) => {
      const o = ac.createOscillator(); o.type = ty; o.frequency.value = fr; o.connect(g); o.start(t); o.stop(t + 0.42);
    });
  }
  click() {
    const ac = this.ctx(), t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square'; o.frequency.value = 1600;
    g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.04);
  }
  hit(lane: number, auto: boolean) {
    if (auto) this.auto[lane - 1] = performance.now();
    if (this.state.mode === 'keys') this.pluck(lane);
    this.bubblesArr.push({ id: this.bubbleId++, lane, born: performance.now() });
    const s = this.strs[lane - 1]; s.amp = 4 * 1.43; s.dirty = true;
    if (!auto) this.forceUpdate();
  }
  mk(lane: number, t: number): Note { return { id: this.nextId++, lane, t, raw: t }; }

  // ── Recording ──
  keyDown(lane: number) {
    const { phase } = this.state;
    this.lastLane = lane;
    const down = this.state.down.slice(); down[lane - 1] = 1;
    if (phase === 'saving' && this.state.playing && this.insHeld) {
      const n = this.mk(lane, this.snapT(Math.max(0, this.clock())));
      // Already sounded on the keypress; don't let playback trigger it again when the cursor passes it.
      if (n.t > this.lastCur) this.heard.add(n.id);
      this.hit(lane, false);
      this.setState(s => ({ down, picks: [...s.picks, n].sort((a, b) => a.t - b.t) }));
      return;
    }
    if (phase !== 'standby' && phase !== 'recording') return;
    this.hit(lane, false);
    if (phase === 'standby') {
      this.anchor(0); this.lastCur = this.liveCur = 0;
      this.setState({ phase: 'recording', down, picks: [this.mk(lane, 0)], cur: 0 });
      return;
    }
    const raw = Math.max(0, Math.round(this.clock())), n = this.mk(lane, this.snapT(raw)); n.raw = raw;
    this.setState(s => ({ down, picks: [...s.picks, n] }));
  }
  keyUp(lane: number) { const down = this.state.down.slice(); down[lane - 1] = 0; this.setState({ down }); }

  flashCtrl(k: Ctrl) {
    this.setState({ ctrlFlash: k }); clearTimeout(this.cft);
    this.cft = window.setTimeout(() => this.setState({ ctrlFlash: null }), 130);
  }
  ctrl(k: Ctrl) {
    const { phase } = this.state;
    if (k === 'R') {
      if (phase === 'practice') { this.click(); this.startRecording(); }
      else if (phase === 'standby' || phase === 'recording') { this.click(); this.stopRecording(); }
    } else if (k === 'S') {
      if (phase === 'saving') { this.click(); this.flashCtrl('S'); this.setState({ outOpen: true }); }
    } else if (k === 'D') {
      if (phase === 'saving') {
        this.click(); this.flashCtrl('D');
        if (this.state.sels.length) this.deleteSel(); else this.clearAll();
      }
    } else if (this.canImport()) {
      this.click(); this.flashCtrl('I'); this.importRef.current?.click();
    }
  }
  canImport() { const p = this.state.phase; return p !== 'standby' && p !== 'recording' && !this.state.playing; }
  // Reads back a track saved by download(): the C++ picks plus the Audio/Offset/BPM/Reaction header.
  onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    f.text().then(txt => {
      const picks: Note[] = [], re = /KeyboardKey>\s*\(\s*(\d+)\s*\)\s*,\s*(-?\d+(?:\.\d+)?)\s*\}/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(txt))) {
        const lane = +m[1] - 48;
        if (lane >= 1 && lane <= 4) picks.push(this.mk(lane, Math.max(0, Math.round(+m[2]))));
      }
      if (!picks.length) { console.warn('Import: no picks found in', f.name); return; }
      const num = (rx: RegExp) => { const r = txt.match(rx); return r ? parseFloat(r[1]) : NaN; };
      const off = num(/\*\*Offset:\*\*\s*(-?[\d.]+)/i), bpm = num(/\*\*BPM:\*\*\s*([\d.]+)/i), react = num(/\*\*Reaction:\*\*\s*([\d.]+)/i);
      const patch: Partial<State> = { phase: 'saving', picks: picks.sort((a, b) => a.t - b.t), cur: 0, playing: false, sels: [], outOpen: false };
      if (!isNaN(off)) patch.offset = String(off);
      if (!isNaN(bpm)) patch.bpm = String(bpm);
      if (!isNaN(react) && react > 0) { patch.reaction = Math.min(2000, Math.max(2, react)); patch.reactDraft = null; patch.editZ = null; }
      const audio = txt.match(/\*\*Audio:\*\*\s*(.+?)\s*$/im)?.[1] ?? null;
      if (audio) {
        patch.mode = 'music';
        if (this.state.audioName !== audio) {
          patch.audioName = null; patch.audioDur = 0; patch.wantAudio = audio;
          this.decodeId++; this.buf = null;
        } else patch.wantAudio = null;
      }
      this.stopAudio(); this.setState(patch as State);
    });
  }
  playFromStart() {
    if (this.state.phase !== 'saving') return;
    if (this.state.playing) { this.stopAudio(); this.setState({ playing: false }); }
    this.setState({ cur: 0 }, () => this.togglePlay());
  }
  spawnNote() {
    if (!this.editable()) return;
    const lane = this.lastLane, n = this.mk(lane, this.snapT(this.state.cur));
    this.hit(lane, false);
    this.setState(s => ({ picks: [...s.picks, n].sort((a, b) => a.t - b.t), sels: [n.id] }));
  }
  startRecording() {
    this.stopAudio();
    if (this.hasAudio()) {
      this.startAudio(0); this.lastCur = this.liveCur = 0;
      this.setState({ phase: 'recording', picks: [], cur: 0, sels: [] });
    } else this.setState({ phase: 'standby', picks: [], cur: 0, sels: [] });
  }
  stopRecording() {
    this.stopAudio();
    this.setState(s => ({ phase: 'saving', cur: 0, playing: false, picks: [...s.picks].sort((a, b) => a.t - b.t) }));
  }
  clearAll() { this.stopAudio(); this.setState({ phase: 'practice', picks: [], cur: 0, playing: false, sels: [], editZ: null, picker: null }); }
  deleteSel() { this.setState(s => ({ picks: s.picks.filter(p => !s.sels.includes(p.id)), sels: [] })); }
  togglePlay() {
    if (this.state.phase !== 'saving') return;
    if (this.state.playing) { this.stopAudio(); this.setState({ playing: false, cur: this.liveCur }); return; }
    const cur = Math.max(0, this.state.cur);
    this.playFrom = cur;
    this.startAudio(cur);
    this.lastCur = cur - 0.001; this.liveCur = cur; this.heard.clear();
    this.setState({ playing: true, cur, picker: null });
  }
  // F12: resume from the bridge; pressed again, pause and jump back to where playback was resumed.
  resumeToggle() {
    if (this.state.phase !== 'saving') return;
    if (this.state.playing) { this.stopAudio(); this.setState({ playing: false, cur: this.playFrom ?? this.liveCur }); return; }
    this.togglePlay();
  }

  // ── Quantize ──
  stepMs() { const b = parseFloat(this.state.bpm); return b > 0 ? 60000 / b / parseInt(this.state.grid) : 0; }
  off() { return this.state.mode === 'music' ? (parseFloat(this.state.offset) || 0) * 1000 : 0; }
  snapT(t: number) {
    const st = this.stepMs();
    if (!st) return Math.max(0, Math.round(t));
    const o = this.off();
    return Math.max(0, Math.round(Math.round((t + o) / st) * st - o));
  }
  resnap(patch: Partial<State>) {
    this.setState(patch as State, () => this.setState(s => ({
      picks: s.picks.map(p => ({ ...p, t: this.snapT(p.raw ?? p.t) })).sort((a, b) => a.t - b.t),
    })));
  }
  nudge(code: string) {
    const st = this.stepMs() || 10;
    this.setState(s => ({
      picks: s.picks.map(p => {
        if (!s.sels.includes(p.id)) return p;
        if (code === 'ArrowUp') { const t = Math.round(p.t + st); return { ...p, t, raw: t }; }
        if (code === 'ArrowDown') { const t = Math.max(0, Math.round(p.t - st)); return { ...p, t, raw: t }; }
        return { ...p, lane: Math.min(4, Math.max(1, p.lane + (code === 'ArrowRight' ? 1 : -1))) };
      }).sort((a, b) => a.t - b.t),
    }));
  }

  // ── Input ──
  onKeyDown(e: KeyboardEvent) {
    if (this.state.outOpen && e.code !== 'Escape') return;
    const tag = ((e.target as HTMLElement).tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    const m = e.code.match(/^(?:Digit|Numpad)([1-4])$/);
    if (m && this.state.picker) { e.preventDefault(); if (!e.repeat) this.pickLane(+m[1]); return; }
    if (m) { e.preventDefault(); if (!e.repeat) this.keyDown(+m[1]); return; }
    if (e.code === 'F12') { e.preventDefault(); if (!e.repeat) this.resumeToggle(); return; }
    if ((e.metaKey || e.ctrlKey) && e.code === 'KeyA' && this.editable()) {
      e.preventDefault(); this.setState(s => ({ sels: s.picks.map(p => p.id) })); return;
    }
    if (e.metaKey || e.ctrlKey) return;
    if (e.repeat && !/^Arrow/.test(e.code)) return;
    switch (e.code) {
      case 'KeyR': this.ctrl('R'); break;
      case 'KeyS': this.ctrl('S'); break;
      case 'Delete': e.preventDefault(); this.ctrl('D'); break;
      case 'Space': e.preventDefault(); this.togglePlay(); break;
      case 'Enter': case 'NumpadEnter': e.preventDefault(); this.playFromStart(); break;
      case 'Insert':
        e.preventDefault();
        if (this.state.phase !== 'saving') this.ctrl('I'); else this.insertKey();
        break;
      case 'Escape':
        if (this.state.outOpen) this.setState({ outOpen: false });
        else if (this.state.picker) this.setState({ picker: null });
        else this.setState({ sels: [] });
        break;
      case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight':
        if (this.state.sels.length && this.editable()) { e.preventDefault(); this.nudge(e.code); }
        break;
      case 'BracketLeft': this.setSpeed(this.rate - 0.1); break;
      case 'BracketRight': this.setSpeed(this.rate + 0.1); break;
      case 'Equal': this.zoomBy(1.25); break;
      case 'Minus': this.zoomBy(0.8); break;
    }
  }
  // INS in edit: paused → add a note at the bridge; playing → toggle live-insert mode (1–4 add notes) on/off.
  insertKey() {
    if (this.state.playing) { this.insHeld = !this.insHeld; this.forceUpdate(); }
    else this.spawnNote();
  }
  onKeyUp(e: KeyboardEvent) {
    const m = e.code.match(/^(?:Digit|Numpad)([1-4])$/);
    if (m) this.keyUp(+m[1]);
  }
  onWheel(e: WheelEvent) {
    if (!this.editable()) return;
    e.preventDefault();
    const z = this.zoomV();
    this.setState(s => ({ cur: Math.max(-2000, s.cur - e.deltaY / z) }));
  }

  drag(move: (ev: PointerEvent) => void, end?: () => void) {
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      this.setState({ dragging: false }); if (end) end();
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    this.setState({ dragging: true });
  }
  // Drag that auto-scrolls the timeline when the pointer nears the stage edges.
  edgeDrag(move: (ev: PointerEvent) => void, end?: () => void) {
    const el = this.lanesRef.current; let last: PointerEvent | null = null, raf = 0, prev = performance.now();
    const step = () => {
      const now = performance.now(), dt = Math.min(50, now - prev); prev = now;
      if (last && el) {
        const r = el.getBoundingClientRect(), E = 48;
        let v = 0;
        if (last.clientY < r.top + E) v = (r.top + E - last.clientY) / E;
        else if (last.clientY > r.bottom - E) v = -(last.clientY - (r.bottom - E)) / E;
        v = Math.max(-3, Math.min(3, v));
        if (v) {
          // Mutate in place so move() sees the new position before React re-renders.
          const cur = Math.max(-2000, this.state.cur + v * 0.9 * dt / this.zoomV());
          (this.state as State).cur = cur;
          this.setState({ cur }); move(last);
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    this.drag(ev => { last = ev; move(ev); }, () => { cancelAnimationFrame(raf); if (end) end(); });
  }
  timeAt(clientY: number) {
    const r = this.lanesRef.current!.getBoundingClientRect();
    return this.state.cur + (this.bridgeY() - (clientY - r.top)) / this.zoomV();
  }
  pickLane(lane: number) {
    const pk = this.state.picker; if (!pk) return;
    const n = this.mk(lane, pk.t); this.lastLane = lane; this.hit(lane, false);
    this.setState(s => ({ picker: null, picks: [...s.picks, n].sort((a, b) => a.t - b.t), sels: [n.id] }));
  }
  onStageDown(e: React.PointerEvent) {
    if (!this.editable()) return;
    if (this.state.picker) { this.setState({ picker: null }); return; }
    const r = this.lanesRef.current!.getBoundingClientRect(), x0 = e.clientX - r.left, ta = this.timeAt(e.clientY);
    const base = e.shiftKey ? this.state.sels : [];
    this.setState({ sels: base, box: null });
    // Click-and-hold still on an empty spot opens a 1–4 picker; moving first starts a box-select instead.
    let held = false; const cx0 = e.clientX, cy0 = e.clientY, py = e.clientY - r.top;
    clearTimeout(this.holdT);
    this.holdT = window.setTimeout(() => { held = true; this.setState({ box: null, sels: base, picker: { x: x0, y: py, t: this.snapT(Math.max(0, ta)) } }); }, 350);
    this.edgeDrag(ev => {
      if (held) return;
      if (Math.abs(ev.clientX - cx0) > 4 || Math.abs(ev.clientY - cy0) > 4) clearTimeout(this.holdT);
      const z = this.zoomV(), by = this.bridgeY(), cur = this.state.cur, H = r.height;
      const x1 = Math.max(0, Math.min(r.width, ev.clientX - r.left)), tb = this.timeAt(Math.max(r.top, Math.min(r.bottom, ev.clientY)));
      const ya = by + (cur - ta) * z, yb = by + (cur - tb) * z;
      if (Math.abs(x1 - x0) < 3 && Math.abs(yb - ya) < 3) return;
      const top = Math.max(0, Math.min(ya, yb)), bot = Math.min(H, Math.max(ya, yb));
      const box = { x: Math.min(x0, x1), y: top, w: Math.abs(x1 - x0), h: Math.max(0, bot - top) };
      const tLo = Math.min(ta, tb), tHi = Math.max(ta, tb), pad = 29 / z;
      const hit = this.state.picks.filter(p => {
        const cx = (p.lane - 1) * LANE + LANE / 2;
        return cx + 29 >= box.x && cx - 29 <= box.x + box.w && p.t + pad >= tLo && p.t - pad <= tHi;
      }).map(p => p.id);
      this.setState({ box, sels: [...new Set([...base, ...hit])] });
    }, () => { clearTimeout(this.holdT); this.setState({ box: null }); });
  }
  noteDown(e: React.PointerEvent, id: number) {
    e.stopPropagation();
    if (!this.editable()) return;
    const p = this.state.picks.find(q => q.id === id); if (!p) return;
    let sels = this.state.sels;
    if (e.shiftKey) { sels = sels.includes(id) ? sels.filter(x => x !== id) : [...sels, id]; this.setState({ sels }); return; }
    if (!sels.includes(id)) sels = [id];
    this.setState({ sels });
    const orig = new Map(this.state.picks.filter(q => sels.includes(q.id)).map(q => [q.id, { t: q.t, lane: q.lane }]));
    const lanes = [...orig.values()].map(o => o.lane), lMin = Math.min(...lanes), lMax = Math.max(...lanes);
    const x0 = e.clientX, tp0 = this.timeAt(e.clientY);
    this.edgeDrag(ev => {
      const dt = this.snapT(p.t + this.timeAt(ev.clientY) - tp0) - p.t;
      const dl = Math.min(4 - lMax, Math.max(1 - lMin, Math.round((ev.clientX - x0) / LANE)));
      this.lastLane = p.lane + dl;
      this.setState(s => ({
        picks: s.picks.map(q => {
          const o = orig.get(q.id); if (!o) return q;
          const t = Math.max(0, Math.round(o.t + dt));
          return { ...q, t, raw: t, lane: o.lane + dl };
        }).sort((a, b) => a.t - b.t),
      }));
    });
  }
  onStageDbl(e: React.MouseEvent) {
    if (!this.editable() || (e.target as HTMLElement).closest?.('[data-note]')) return;
    const r = this.lanesRef.current!.getBoundingClientRect();
    const lane = Math.min(4, Math.max(1, Math.floor((e.clientX - r.left) / LANE) + 1));
    const t = this.snapT(this.state.cur + (this.bridgeY() - (e.clientY - r.top)) / this.zoomV());
    const n = this.mk(lane, t); this.lastLane = lane;
    this.setState(s => ({ picks: [...s.picks, n].sort((a, b) => a.t - b.t), sels: [n.id] }));
  }

  // ── Output ──
  output() {
    if (this.outFor === this.state.picks && this.outOff === this.off()) return this.outStr;
    this.outFor = this.state.picks; this.outOff = this.off();
    const seen = new Set<string>();
    const ps = [...this.state.picks].sort((a, b) => a.t - b.t).filter(p => {
      const k = p.lane + ':' + Math.round(p.t);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
    const items = ps.map(p => `{static_cast<KeyboardKey>(${48 + p.lane}),${Math.round(p.t)}}`);
    return this.outStr = `inline const size_t trackSize = ${ps.length};\ninline Pick track[trackSize] = {\n    ${items.join(', ')}\n};`;
  }
  download() {
    const s = this.state, song = s.audioName ? s.audioName.replace(/\.[^.]+$/, '') : 'Untitled';
    const offS = s.mode === 'music' ? (parseFloat(s.offset) || 0) : 0;
    const bpm = parseFloat(s.bpm) > 0 ? String(parseFloat(s.bpm)) : '—', rx = this.msLabel(this.reaction()), rxF = this.frameLabel(this.reaction());
    const audioLine = s.audioName ? `**Audio:** ${s.audioName}  \n` : '';
    const md = `# ${song}\n\n${audioLine}**Offset:** ${offS} s  \n**BPM:** ${bpm}  \n**Reaction:** ${rx} ms (${rxF})\n\n\`\`\`cpp\n${this.output()}\n\`\`\`\n`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    a.download = song.replace(/[\\/:*?"<>|]+/g, '_') + '.md';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  copy() {
    const done = () => {
      this.setState({ copied: true }); clearTimeout(this.cpt);
      this.cpt = window.setTimeout(() => this.setState({ copied: false }), 1400);
    };
    const fallback = () => {
      const ta = document.createElement('textarea'); ta.value = this.output(); document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch { /* ignore */ }
      ta.remove();
    };
    if (!navigator.clipboard) return fallback();
    navigator.clipboard.writeText(this.output()).then(done, fallback);
  }
  onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    const ac = this.ctx(), id = ++this.decodeId;
    this.stopAudio(); this.buf = null;
    this.setState({ audioName: f.name, audioDur: 0, playing: false, wantAudio: null });
    f.arrayBuffer().then(b => ac.decodeAudioData(b)).then(buf => {
      if (id !== this.decodeId) return;
      this.buf = buf; this.setState({ audioDur: buf.duration * 1000 });
    }, err => {
      if (id !== this.decodeId) return;
      console.warn('Could not decode', f.name, err); this.setState({ audioName: null });
    });
  }
  commitReact() {
    const v = parseFloat(this.state.reactDraft ?? '');
    if (v > 0) this.setReaction(v); else this.setState({ reactDraft: null });
  }

  fmt(ms: number) { ms = Math.max(0, Math.round(ms)); return Math.floor(ms / 1000) + '.' + Math.floor((ms % 1000) / 100) + 's'; }
  clockFmt(ms: number) { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  // ── Render ──
  render() {
    const s = this.state, H = this.stageH(), z = this.zoomV(), by = this.bridgeY(), cur = this.live() ? this.liveCur : s.cur;
    const now = this.now || performance.now(), ed = this.editable(), ph = s.phase;
    const dir = ph === 'recording' || ph === 'standby' ? -1 : 1;
    const Y = (t: number) => -dir * t * z;
    const base = Math.floor(cur / 500) * 500, tMax = base + H / z + 800, tMin = base - H / z - 800;
    const isMusic = s.mode === 'music', rec = ph === 'standby' || ph === 'recording', sav = ph === 'saving';
    const layerY = this.layerY(cur);

    const selSet = new Set(s.sels);
    const notes = s.picks.filter(p => p.t >= tMin && p.t <= tMax);

    const gridLines: { y: number; h: number; c: string }[] = [], st = this.stepMs(), per = parseInt(s.grid);
    if (st) {
      const off = -this.off(), k0 = Math.ceil((tMin - off) / st), k1 = Math.floor((tMax - off) / st);
      if (k1 - k0 < 800) for (let k = k0; k <= k1; k++) {
        const beat = ((k % per) + per) % per === 0, bi = Math.round(k / per), bar = beat && ((bi % 4) + 4) % 4 === 0;
        if (!beat && st * z < 6) continue;
        gridLines.push({ y: Y(off + k * st), h: bar ? 2 : 1, c: bar ? '#4a4a4a' : beat ? '#2a2a2a' : '#161616' });
      }
    }
    const rs = z * 1000 < 40 ? 5000 : 1000, ruler: { y: number; label: string }[] = [];
    for (let t = Math.ceil(Math.max(0, tMin) / rs) * rs; t <= tMax; t += rs) ruler.push({ y: Y(t), label: t / 1000 + 's' });

    const keyState = (l: number): KeyState =>
      s.down[l - 1] || now - this.auto[l - 1] < 140 ? 'pressed' : rec ? 'normal' : 'blocked';
    const cs = (k: Ctrl, b: KeyState): KeyState => (s.ctrlFlash === k ? 'pressed' : b);
    // Edit shows Save/Delete; everything else shows Record/Import.
    const ctrlKeys: { k: Ctrl; icon: KeyIcon; caption: string; state: KeyState }[] = sav ? [
      { k: 'S', icon: 'save', caption: 'S', state: cs('S', 'normal') },
      { k: 'D', icon: 'trash', caption: 'DEL', state: cs('D', 'normal') },
    ] : [
      { k: 'R', icon: 'record', caption: 'R', state: cs('R', rec ? 'pressed' : 'normal') },
      { k: 'I', icon: 'import', caption: 'INS', state: cs('I', this.canImport() ? 'normal' : 'blocked') },
    ];
    const editKeys: { icon: KeyIcon; label: string; caption: string; title: string; state: KeyState; run: () => void }[] = [
      { icon: 'restart', label: '', caption: 'ENTER', title: 'Play from the beginning', state: 'normal', run: () => this.playFromStart() },
      { icon: s.playing ? 'pause' : 'play', label: '', caption: 'F12', title: 'Resume from the bridge; again to pause and jump back', state: 'normal', run: () => this.resumeToggle() },
      { icon: 'none', label: '+', caption: 'INS', title: 'Paused: add a note at the bridge. Playing: toggle live insert.', state: this.insHeld ? 'pressed' : 'normal', run: () => this.insertKey() },
    ];

    // Reaction window around every note (playtest + edit): lit band ±Reaction, lanes dimmed outside it;
    // when the window is taller than half the view, error-bar whiskers instead.
    const reactEls: CSSProperties[] = [];
    if (sav && s.picks.length) {
      const R = this.reaction(), whisk = R * z > H * 0.5, lo = tMin - R, hi = tMax + R;
      const bar: CSSProperties = { position: 'absolute', background: 'rgba(255,255,255,.4)', pointerEvents: 'none' };
      for (let l = 1; l <= 4; l++) {
        const ws = s.picks.filter(p => p.lane === l && p.t + R >= tMin && p.t - R <= tMax).map(p => [p.t - R, p.t + R]);
        const x = (l - 1) * LANE;
        if (!whisk) {
          let at = lo; const gaps: number[][] = [];
          for (const [a, b] of ws) { if (a > at) gaps.push([at, a]); at = Math.max(at, b); }
          if (at < hi) gaps.push([at, hi]);
          for (const [a, b] of gaps) reactEls.push({ position: 'absolute', left: x, width: LANE, top: Y(b), height: (b - a) * z, background: 'rgba(0,0,0,.55)', pointerEvents: 'none' });
          for (const [a, b] of ws) {
            // Top and bottom edges of the window, plus a pillar on each side of the lane.
            for (const yy of [Y(b), Y(a)]) reactEls.push({ ...bar, left: x + 6, width: 74, top: yy - 0.5, height: 1 });
            for (const px of [x + 6, x + 78]) reactEls.push({ ...bar, left: px, width: 2, top: Y(b), height: (b - a) * z });
          }
        } else {
          for (const [a, b] of ws) {
            const yc = Y(a + R), cx = x + LANE / 2, cap: CSSProperties = { ...bar, left: cx - 12, width: 24, height: 2, background: 'rgba(255,255,255,.6)' };
            for (const dx of [-9, 9]) {
              reactEls.push({ ...bar, left: cx - 1 + dx, width: 2, top: Y(b), height: Math.max(0, yc - 29 - Y(b)) });
              reactEls.push({ ...bar, left: cx - 1 + dx, width: 2, top: yc + 29, height: Math.max(0, Y(a) - yc - 29) });
            }
            reactEls.push({ ...cap, top: Y(b) - 1 }, { ...cap, top: Y(a) - 1 });
          }
        }
      }
    }
    const pk = s.picker && ed ? s.picker : null;
    const emptyBy: Partial<Record<Phase, string>> = {
      practice: isMusic && !this.hasAudio() ? 'Choose an audio file to record against.' : 'Press R to start recording',
      standby: 'Waiting for your first key…',
      saving: 'Press DEL to start over',
    };
    const last = s.picks.length ? s.picks[s.picks.length - 1].t : 0;
    const lengthLabel = s.picks.length ? this.fmt(last) : '—';
    const g = this.geom(), px = (t: number) => g.bh * (1 - (t - g.T0) / g.span);
    const thumbTop = Math.max(0, px(g.tHi)), thumbH = Math.max(22, Math.min(g.bh, px(g.tLo)) - thumbTop);

    const label: CSSProperties = { fontWeight: 600, color: '#fff' };
    const value: CSSProperties = { fontWeight: 700, color: '#fff' };
    const layer: CSSProperties = { position: 'absolute', left: 0, top: 0, width: '100%', height: 0, transform: `translateY(${layerY}px)`, willChange: 'transform' };

    return (
      <div className="lc-root" style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: FONT }}>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" precedence="default" />
        <style>{CSS}</style>
        <title>Rockstar Level Generator</title>
        <div style={{ maxWidth: 1200, minHeight: '100dvh', margin: '0 auto', padding: '32px 32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', fontVariantNumeric: 'tabular-nums' }}>

          <header style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid #1e1e1e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ padding: 2, background: '#fff', clipPath: oct(8) }}>
                <div style={{ display: 'flex', gap: 2, padding: 2, background: '#0b0b0b', clipPath: oct(7) }}>
                  <button onClick={() => this.setMode('keys')} style={modeBtn(s.mode === 'keys')}>KEYS</button>
                  <button onClick={() => this.setMode('music')} style={modeBtn(isMusic)}>MUSIC</button>
                </div>
              </div>
              {isMusic && (
                <button onClick={() => this.fileRef.current?.click()} ref={this.marqBox} style={{ maxWidth: 220, padding: 0, border: 'none', background: 'none', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  <span ref={this.marqText} style={{ display: 'inline-block' }}>{s.audioName || (s.wantAudio ? 'Load ' + s.wantAudio + '…' : 'Choose a file…')}</span>
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <input type="file" accept="audio/*" ref={this.fileRef} onChange={e => this.onFile(e)} style={{ display: 'none' }} />
              <input type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" ref={this.importRef} onChange={e => this.onImport(e)} style={{ display: 'none' }} />
              <Field label="BPM">
                <input type="number" min={1} placeholder="—" value={s.bpm} onChange={e => this.resnap({ bpm: e.target.value })} style={{ ...fieldInput, width: 48 }} />
              </Field>
              {isMusic && (
                <Field label="OFFSET">
                  <input type="number" step={0.01} value={s.offset} onChange={e => this.resnap({ offset: e.target.value })} style={{ ...fieldInput, width: 52 }} />
                  <span style={{ fontSize: 11, color: '#fff' }}>s</span>
                </Field>
              )}
            </div>
          </header>

          <div style={{ flex: '1 1 auto', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginTop: 40 }}>
            <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24, paddingBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 18px', alignItems: 'center', fontSize: 13 }}>
                <span style={label}>Picks</span><span style={value}>{s.picks.length}</span>
                <span style={label}>Length</span><span style={value}>{lengthLabel}</span>
                {isMusic && <><span style={label}>Audio</span><span style={value}>{s.audioDur ? this.clockFmt(s.audioDur) : '—'}</span></>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', justifyContent: 'start', alignItems: 'center', gap: '10px 18px', fontSize: 13 }}>
                <span style={label}>Speed</span>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StepButton onClick={() => this.setSpeed(this.rate + 0.1)} size={24}>+</StepButton>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 3, minWidth: 64, justifyContent: 'center' }}>
                    <input
                      className="lc-react" type="number" min={0.2} max={2} step={0.1} title="Playback speed; pitch follows. [ and ] adjust."
                      value={s.speedDraft ?? s.speed.toFixed(Math.round(s.speed * 100) % 10 ? 2 : 1)}
                      onChange={e => {
                        this.setState({ speedDraft: e.target.value });
                        const v = parseFloat(e.target.value);
                        if (v >= 0.2 && v <= 2) this.setSpeed(v);
                      }}
                      onBlur={() => this.setState({ speedDraft: null })}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur(); }}
                      style={numInput}
                    />
                    <span style={value}>×</span>
                  </span>
                  <StepButton onClick={() => this.setSpeed(this.rate - 0.1)} size={24}>−</StepButton>
                </span>
                <span style={label}>Reaction</span>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StepButton onClick={() => this.zoomBy(1.25)} size={24}>+</StepButton>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 3, minWidth: 64, justifyContent: 'center' }}>
                    <input
                      className="lc-react" type="number" min={2} max={2000} step="any"
                      value={s.reactDraft ?? this.msLabel(this.reaction())}
                      onChange={e => this.setState({ reactDraft: e.target.value })}
                      onBlur={() => this.commitReact()}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          if (e.key === 'Escape') this.setState({ reactDraft: null });
                          e.currentTarget.blur();
                        }
                      }}
                      style={numInput}
                    />
                    <span style={value}>ms</span>
                  </span>
                  <StepButton onClick={() => this.zoomBy(0.8)} size={24}>−</StepButton>
                </span>
                <span title="Hit window (2 × Reaction) in frames at 60 FPS" style={{ gridColumn: '1 / -1', marginTop: -6, fontSize: 11, fontWeight: 600, color: '#9a9a9a', whiteSpace: 'nowrap' }}>{this.frameLabel(this.reaction())}</span>
              </div>
            </div>

            <div
              ref={this.lanesRef}
              onPointerDown={e => this.onStageDown(e)}
              onDoubleClick={e => this.onStageDbl(e)}
              style={{ position: 'relative', flex: '0 0 344px', width: 344, minHeight: 420, background: '#070707', clipPath: 'inset(0 -64px)', overflowX: 'visible', overflowY: 'clip', cursor: ed ? 'crosshair' : 'default', touchAction: 'none', userSelect: 'none' }}
            >
              <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', pointerEvents: 'none' }}>
                <div style={{ borderRight: '1px solid #141414' }} />
                <div style={{ borderRight: '1px solid #141414' }} />
                <div style={{ borderRight: '1px solid #141414' }} />
                <div />
              </div>
              <div ref={this.layerA} style={{ ...layer, pointerEvents: 'none' }}>
                {gridLines.map((l, i) => (
                  <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: l.y, height: l.h, background: l.c }} />
                ))}
                {ruler.map(r => (
                  <div key={r.label} style={{ position: 'absolute', left: -56, width: 46, top: r.y, transform: 'translateY(-50%)', textAlign: 'right', fontWeight: 600, fontSize: 11, color: '#fff' }}>{r.label}</div>
                ))}
                {reactEls.map((st, i) => <div key={i} style={st} />)}
              </div>
              <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
                {['0a', '0b', '1a', '1b', '2a', '2b', '3a', '3b'].map(k => (
                  <path key={k} ref={this.sref(k)} fill="none" stroke="#2c2c2c" strokeWidth={3} />
                ))}
              </svg>
              <div style={{ position: 'absolute', left: -6, right: -6, top: by, height: 4, marginTop: -2, background: '#fff', pointerEvents: 'none' }} />
              {this.bubblesArr.map(b => (
                <div key={b.id} style={{ position: 'absolute', left: (b.lane - 1) * LANE + 31, top: by - 12, width: 24, height: 24, borderRadius: '50%', background: '#fff', opacity: 0, pointerEvents: 'none', animation: 'lcBubble 320ms linear forwards' }} />
              ))}
              <div ref={this.layerB} style={layer}>
                {notes.map(p => (
                  <div
                    key={p.id} data-note="1"
                    onPointerDown={e => this.noteDown(e, p.id)}
                    style={{ position: 'absolute', left: (p.lane - 1) * LANE + 14, top: Y(p.t) - 29, width: 58, height: 58, opacity: p.t < cur - 1 && dir > 0 ? 0.35 : 1, cursor: ed ? 'grab' : 'default' }}
                  >
                    <Keycap label={String(p.lane)} state={selSet.has(p.id) ? 'selected' : 'normal'} />
                  </div>
                ))}
              </div>
              {pk && (
                <>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: pk.y, height: 1, background: 'rgba(255,255,255,.5)', pointerEvents: 'none' }} />
                  <div onPointerDown={e => e.stopPropagation()} style={{ position: 'absolute', left: Math.max(4, Math.min(344 - 4 - 172, pk.x - LANE)), top: Math.max(4, Math.min(H - 48, pk.y - 52)), zIndex: 5, display: 'flex', gap: 4, padding: 4, background: '#fff', clipPath: oct(8) }}>
                    {[1, 2, 3, 4].map(l => (
                      <div key={l} onPointerDown={e => { e.preventDefault(); e.stopPropagation(); this.pickLane(l); }} style={{ width: 38, height: 38, cursor: 'pointer' }}>
                        <Keycap label={String(l)} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {s.box && (
                <div style={{ position: 'absolute', left: s.box.x, top: s.box.y, width: s.box.w, height: s.box.h, boxShadow: 'inset 0 0 0 1px #fff', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
              )}
              {!s.picks.length && ph !== 'recording' && (
                <div style={{ position: 'absolute', left: 20, right: 20, top: '32%', textAlign: 'center', fontWeight: 600, fontSize: 13, lineHeight: 1.6, color: '#fff', pointerEvents: 'none', textWrap: 'pretty' }}>{emptyBy[ph] || ''}</div>
              )}
            </div>

            <aside style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sav && (
                <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <StepButton onClick={() => this.zoomView(1.25)} size={22}>+</StepButton>
                    <div onPointerDown={e => this.barClick(e)} style={{ position: 'relative', width: 18, height: g.bh, background: '#0b0b0b', boxShadow: 'inset 0 0 0 1px #222', cursor: 'pointer', touchAction: 'none', userSelect: 'none' }}>
                      <div className="lc-thumb" onPointerDown={e => this.barDrag(e, 'thumb')} style={{ position: 'absolute', left: 3, right: 3, top: thumbTop, height: thumbH, background: '#3a3a3a', borderRadius: 6, cursor: 'grab' }}>
                        <div className="lc-handle" onPointerDown={e => this.barDrag(e, 'hi')} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 9, borderRadius: 6, background: '#9a9a9a', cursor: 'ns-resize' }} />
                        <div className="lc-handle" onPointerDown={e => this.barDrag(e, 'lo')} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 9, borderRadius: 6, background: '#9a9a9a', cursor: 'ns-resize' }} />
                      </div>
                    </div>
                    <StepButton onClick={() => this.zoomView(0.8)} size={22}>−</StepButton>
                  </div>
                  <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                      {editKeys.map(c => (
                        <div key={c.caption} title={c.title} onPointerDown={e => { e.preventDefault(); c.run(); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <div style={{ width: 56, height: 56 }}><Keycap label={c.label} state={c.state} icon={c.icon} /></div>
                          <span style={{ fontWeight: 800, fontSize: 12, color: '#fff' }}>{c.caption}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'flex-start', marginTop: 32 }}>
            <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', gap: 10 }}>
              {ctrlKeys.map(c => (
                <div key={c.k} onPointerDown={e => { e.preventDefault(); this.ctrl(c.k); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <div style={{ width: 56, height: 56 }}><Keycap label={c.k} state={c.state} icon={c.icon} /></div>
                  <span style={{ fontWeight: 800, fontSize: 12, color: c.state === 'blocked' ? '#444' : '#fff' }}>{c.caption}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: '0 0 344px', display: 'grid', gridTemplateColumns: `repeat(4,${LANE}px)`, justifyItems: 'center' }}>
              {[1, 2, 3, 4].map(l => (
                <div
                  key={l}
                  onPointerDown={e => {
                    e.preventDefault(); this.keyDown(l);
                    const up = () => { this.keyUp(l); window.removeEventListener('pointerup', up); };
                    window.addEventListener('pointerup', up);
                  }}
                  style={{ width: 72, height: 72, cursor: 'pointer' }}
                >
                  <Keycap label={String(l)} state={keyState(l)} />
                </div>
              ))}
            </div>
            <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 168, height: 56, padding: 2, boxSizing: 'border-box', background: '#fff', clipPath: oct(10) }}>
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(#222,#000)', fontWeight: 800, fontSize: 26, color: '#fff', clipPath: oct(9) }}>{this.fmt(cur)}</div>
              </div>
            </div>
          </div>

          {s.outOpen && (
            <div onPointerDown={e => { if (e.target === e.currentTarget) this.setState({ outOpen: false }); }} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'rgba(0,0,0,.78)' }}>
              <div style={{ width: '100%', maxWidth: 720, padding: 2, background: '#fff', clipPath: oct(12) }}>
                <div style={{ background: '#0b0b0b', clipPath: oct(11) }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1e1e1e' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                      <span style={{ fontSize: 15, color: '#fff', fontWeight: 800 }}>Track</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{s.picks.length} picks · {lengthLabel}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => this.setState({ outOpen: false })} style={{ padding: 2, border: 'none', background: '#fff', cursor: 'pointer', clipPath: oct(8) }}>
                        <span className="lc-face" style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 16px', background: 'linear-gradient(#555,#111)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: '.06em', clipPath: oct(7) }}>ESC</span>
                      </button>
                      <button onClick={() => this.download()} style={{ padding: 2, border: 'none', background: '#fff', cursor: 'pointer', clipPath: oct(8) }}>
                        <span className="lc-face" style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 16px', background: 'linear-gradient(#555,#111)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: '.06em', clipPath: oct(7) }}>SAVE</span>
                      </button>
                      <button onClick={() => this.copy()} style={{ padding: 2, border: 'none', background: '#fff', cursor: 'pointer', clipPath: oct(8) }}>
                        <span className="lc-face-light" style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 16px', background: 'linear-gradient(#fff,#c9c9c9)', color: '#000', fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: '.06em', clipPath: oct(7) }}>{s.copied ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>
                  <pre
                    onPointerDown={e => {
                      const r = document.createRange(); r.selectNodeContents(e.currentTarget);
                      const sl = getSelection(); sl?.removeAllRanges(); sl?.addRange(r);
                    }}
                    style={{ margin: 0, padding: 18, maxHeight: '60vh', overflow: 'auto', fontFamily: FONT, fontWeight: 600, fontSize: 12, lineHeight: 1.7, color: '#fff', whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'text' }}
                  >
                    {this.output()}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default function Rockstar() {
  return <Composer />;
}
