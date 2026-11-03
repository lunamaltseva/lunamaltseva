import { Component, createRef, memo, type CSSProperties, type ReactNode } from 'react';

// ── Level Composer ────────────────────────────────────────────────────────────
// Web port of the Rockstar level recorder (practice → record → save/delete),
// with editing, quantizing and playtesting. Output matches the C++ track[] format.

type Phase = 'practice' | 'standby' | 'recording' | 'saving';
type Mode = 'keys' | 'music';
type KeyState = 'normal' | 'pressed' | 'blocked' | 'selected';
type KeyIcon = 'none' | 'record' | 'save' | 'trash' | 'play' | 'pause' | 'restart';
type Ctrl = 'R' | 'S' | 'D';

interface Note { id: number; lane: number; t: number; raw: number }
interface Box { x: number; y: number; w: number; h: number }
interface Str { off: number; amp: number; a: SVGPathElement | null; b: SVGPathElement | null; dirty: boolean }
interface Bubble { id: number; lane: number; born: number }

interface State {
  phase: Phase; picks: Note[]; cur: number; playing: boolean;
  audioName: string | null; audioDur: number;
  bpm: string; offset: string; grid: string; mode: Mode;
  down: number[]; ctrlFlash: Ctrl | null; sels: number[];
  stageH: number; dragging: boolean; copied: boolean;
  reaction: number | null; reactDraft: string | null; viewZoom: number;
  box: Box | null; outOpen: boolean;
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
    reaction: null, reactDraft: null, viewZoom: 1, box: null, outOpen: false,
  };

  lanesRef = createRef<HTMLDivElement>();
  fileRef = createRef<HTMLInputElement>();
  layerA = createRef<HTMLDivElement>();
  layerB = createRef<HTMLDivElement>();
  marqBox = createRef<HTMLButtonElement>();
  marqText = createRef<HTMLSpanElement>();

  nextId = 1; bubbleId = 1; bubblesArr: Bubble[] = [];
  auto = [0, 0, 0, 0]; t0 = 0; lastCur = 0; now = 0; liveCur = 0; lastRender = 0; lastFrame = 0;
  strs: Str[] = [0, 1, 2, 3].map(() => ({ off: 0, amp: 0, a: null, b: null, dirty: true }));
  strH = 0; strBy = 0;
  strRef: Record<string, (el: SVGPathElement | null) => void> = {};
  lastLane = 1; insHeld = false; litKey = '';
  marqKey = ''; marqEl: HTMLSpanElement | null = null;
  audio!: HTMLAudioElement; ac: AudioContext | null = null; url: string | null = null;
  raf = 0; audT = 0; cft = 0; cpt = 0;
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
    this.audio = new Audio();
    this.audio.addEventListener('ended', () => {
      if (this.state.phase === 'recording') this.stopRecording();
      else if (this.state.playing) this.t0 = performance.now() - this.liveCur;
    });
    this.audio.addEventListener('loadedmetadata', () => this.setState({ audioDur: this.audio.duration * 1000 }));
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
    if (this.url) URL.revokeObjectURL(this.url);
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
  baseZ() { return LANE / (2 * this.reaction()); }
  vz() { return this.state.phase === 'saving' && !this.state.playing ? this.state.viewZoom : 1; }
  zoomV() { return this.baseZ() * this.vz(); }
  barH() { return Math.max(120, this.stageH() - 76); }
  bridgeY() { return this.stageH() * BRIDGE; }
  geom() {
    const s = this.state, H = this.stageH(), by = this.bridgeY(), z = this.zoomV(), cur = this.live() ? this.liveCur : s.cur;
    const tLo = cur - (H - by) / z, tHi = cur + by / z;
    const last = s.picks.length ? s.picks[s.picks.length - 1].t : 0;
    const T0 = Math.min(0, tLo), T1 = Math.max(last + 2000, this.hasAudio() ? s.audioDur || 0 : 0, tHi, T0 + 1000);
    return { H, by, z, cur, tLo, tHi, T0, T1, span: T1 - T0, bh: this.barH() };
  }
  clampVZ(v: number) { return Math.min(8, Math.max(0.05, v)); }
  barDrag(e: React.PointerEvent, kind: 'thumb' | 'hi' | 'lo') {
    e.preventDefault(); e.stopPropagation();
    const g = this.geom(), y0 = e.clientY, k = g.span / g.bh, b = this.baseZ();
    this.drag(ev => {
      const dt = -(ev.clientY - y0) * k;
      if (kind === 'thumb') return this.setState({ cur: Math.max(-2000, g.cur + dt) });
      if (kind === 'hi') {
        const vz = this.clampVZ(g.H / Math.max(100, g.tHi + dt - g.tLo) / b), z = b * vz;
        return this.setState({ viewZoom: vz, cur: g.tLo + (g.H - g.by) / z });
      }
      const vz = this.clampVZ(g.H / Math.max(100, g.tHi - (g.tLo + dt)) / b), z = b * vz;
      this.setState({ viewZoom: vz, cur: g.tHi - g.by / z });
    });
  }
  barClick(e: React.PointerEvent) {
    const g = this.geom(), r = e.currentTarget.getBoundingClientRect();
    const t = g.T0 + (1 - (e.clientY - r.top) / r.height) * g.span;
    this.setState({ cur: Math.max(-2000, t - (2 * g.by - g.H) / (2 * g.z)) });
  }
  zoomView(f: number) { this.setState(s => ({ viewZoom: this.clampVZ(s.viewZoom * f) })); }
  zoomBy(f: number) { this.setState({ reactDraft: null, reaction: Math.round(Math.min(2000, Math.max(30, this.reaction() / f))) }); }

  // ── Transport ──
  hasAudio() { return this.state.mode === 'music' && !!this.state.audioName; }
  setMode(m: Mode) {
    const p = this.state.phase;
    if (p === 'standby' || p === 'recording' || this.state.playing) return;
    if (m === 'music' && (this.state.mode === 'music' || !this.state.audioName)) this.fileRef.current?.click();
    this.resnap({ mode: m });
  }
  // audio.currentTime only advances in coarse steps, so reading it directly makes
  // the lanes stutter. Run on the performance clock and steer it toward the audio:
  // ease out small drift, snap on real jumps (seeks, buffering stalls).
  clock() {
    const now = performance.now();
    if (this.hasAudio() && !this.audio.paused && this.audio.currentTime > 0) {
      const drift = (now - this.t0) - (this.audio.currentTime * 1000 - this.off());
      if (Math.abs(drift) > 120) this.t0 += drift;
      else this.t0 += drift * 0.05;
    }
    return now - this.t0;
  }
  startAudio(cur: number) {
    clearTimeout(this.audT); this.audio.pause(); this.t0 = performance.now() - cur;
    if (!this.hasAudio()) return;
    const at = cur + this.off();
    if (at >= 0) { this.audio.currentTime = at / 1000; this.audio.play(); }
    else { this.audio.currentTime = 0; this.audT = window.setTimeout(() => this.audio.play(), -at); }
  }
  stopAudio() { clearTimeout(this.audT); this.audio?.pause(); }
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
    const nb = this.bubblesArr.filter(b => now - b.born < 340);
    if (nb.length !== this.bubblesArr.length) { this.bubblesArr = nb; need = true; }
    const lit = this.auto.map(a => now - a < 140).join();
    if (lit !== this.litKey) { this.litKey = lit; need = true; }
    if (this.live()) {
      const c = this.clock();
      if (playing) {
        for (const p of picks) if (p.t > this.lastCur && p.t <= c) { this.hit(p.lane, true); need = true; }
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
      this.hit(lane, false);
      this.setState(s => ({ down, picks: [...s.picks, n].sort((a, b) => a.t - b.t) }));
      return;
    }
    if (phase !== 'standby' && phase !== 'recording') return;
    this.hit(lane, false);
    if (phase === 'standby') {
      this.t0 = performance.now(); this.lastCur = this.liveCur = 0;
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
    } else if (phase === 'saving') {
      this.click(); this.flashCtrl('D');
      if (this.state.sels.length) this.deleteSel(); else this.clearAll();
    }
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
  clearAll() { this.stopAudio(); this.setState({ phase: 'practice', picks: [], cur: 0, playing: false, sels: [] }); }
  deleteSel() { this.setState(s => ({ picks: s.picks.filter(p => !s.sels.includes(p.id)), sels: [] })); }
  togglePlay() {
    if (this.state.phase !== 'saving') return;
    if (this.state.playing) { this.stopAudio(); this.setState({ playing: false, cur: this.liveCur }); return; }
    const cur = Math.max(0, this.state.cur);
    this.startAudio(cur);
    this.lastCur = cur - 0.001; this.liveCur = cur;
    this.setState({ playing: true, cur });
  }

  // ── Quantize ──
  stepMs() { const b = parseFloat(this.state.bpm); return b > 0 ? 60000 / b / parseInt(this.state.grid) : 0; }
  off() { return this.state.mode === 'music' ? (parseFloat(this.state.offset) || 0) : 0; }
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
    if (m) { e.preventDefault(); if (!e.repeat) this.keyDown(+m[1]); return; }
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
        e.preventDefault(); this.insHeld = true;
        if (!this.state.playing) this.spawnNote(); else this.forceUpdate();
        break;
      case 'Escape': if (this.state.outOpen) this.setState({ outOpen: false }); else this.setState({ sels: [] }); break;
      case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight':
        if (this.state.sels.length && this.editable()) { e.preventDefault(); this.nudge(e.code); }
        break;
      case 'Equal': this.zoomBy(1.25); break;
      case 'Minus': this.zoomBy(0.8); break;
    }
  }
  onKeyUp(e: KeyboardEvent) {
    if (e.code === 'Insert') { this.insHeld = false; this.forceUpdate(); }
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
  onStageDown(e: React.PointerEvent) {
    if (!this.editable()) return;
    const r = this.lanesRef.current!.getBoundingClientRect(), x0 = e.clientX - r.left, ta = this.timeAt(e.clientY);
    const base = e.shiftKey ? this.state.sels : [];
    this.setState({ sels: base, box: null });
    this.edgeDrag(ev => {
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
    }, () => this.setState({ box: null }));
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
    const f = e.target.files?.[0]; if (!f) return;
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = URL.createObjectURL(f);
    this.stopAudio(); this.audio.src = this.url; this.audio.load();
    this.setState({ audioName: f.name, audioDur: 0, playing: false });
    e.target.value = '';
  }
  commitReact() {
    const v = parseFloat(this.state.reactDraft ?? '');
    this.setState({ reaction: v > 0 ? Math.round(Math.min(2000, Math.max(30, v))) : this.state.reaction, reactDraft: null });
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
    const ctrlKeys: { k: Ctrl; icon: KeyIcon; caption: string; state: KeyState }[] = [
      { k: 'R', icon: 'record', caption: 'R', state: cs('R', rec ? 'pressed' : sav ? 'blocked' : 'normal') },
      { k: 'S', icon: 'save', caption: 'S', state: cs('S', sav ? 'normal' : 'blocked') },
      { k: 'D', icon: 'trash', caption: 'DEL', state: cs('D', sav ? 'normal' : 'blocked') },
    ];
    const editKeys: { icon: KeyIcon; label: string; caption: string; title: string; state: KeyState; run: () => void }[] = [
      { icon: 'restart', label: '', caption: 'ENTER', title: 'Play from the beginning', state: 'normal', run: () => this.playFromStart() },
      { icon: s.playing ? 'pause' : 'play', label: '', caption: 'SPACE', title: 'Play / pause from here', state: 'normal', run: () => this.togglePlay() },
      { icon: 'none', label: '+', caption: 'INS', title: 'Add a note at the bridge in the last-used lane', state: this.insHeld ? 'pressed' : 'normal', run: () => this.spawnNote() },
    ];
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
                  <span ref={this.marqText} style={{ display: 'inline-block' }}>{s.audioName || 'Choose a file…'}</span>
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <input type="file" accept="audio/*" ref={this.fileRef} onChange={e => this.onFile(e)} style={{ display: 'none' }} />
              <Field label="BPM">
                <input type="number" min={1} placeholder="—" value={s.bpm} onChange={e => this.resnap({ bpm: e.target.value })} style={{ ...fieldInput, width: 48 }} />
              </Field>
              {isMusic && (
                <Field label="OFFSET">
                  <input type="number" value={s.offset} onChange={e => this.resnap({ offset: e.target.value })} style={{ ...fieldInput, width: 52 }} />
                  <span style={{ fontSize: 11, color: '#fff' }}>ms</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13 }}>
                <span style={label}>Reaction</span>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StepButton onClick={() => this.zoomBy(1.25)} size={24}>+</StepButton>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 3, minWidth: 64, justifyContent: 'center' }}>
                    <input
                      className="lc-react" type="number" min={30} max={2000}
                      value={s.reactDraft ?? String(this.reaction())}
                      onChange={e => this.setState({ reactDraft: e.target.value })}
                      onBlur={() => this.commitReact()}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          if (e.key === 'Escape') this.setState({ reactDraft: null });
                          e.currentTarget.blur();
                        }
                      }}
                      style={{ width: 42, padding: '2px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #3a3a3a', outline: 'none', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 13, textAlign: 'center' }}
                    />
                    <span style={value}>ms</span>
                  </span>
                  <StepButton onClick={() => this.zoomBy(0.8)} size={24}>−</StepButton>
                </span>
              </div>
            </div>

            <div
              ref={this.lanesRef}
              onPointerDown={e => this.onStageDown(e)}
              onDoubleClick={e => this.onStageDbl(e)}
              style={{ position: 'relative', flex: '0 0 344px', width: 344, minHeight: 420, background: '#070707', clipPath: 'inset(0 -64px)', cursor: ed ? 'crosshair' : 'default', touchAction: 'none', userSelect: 'none' }}
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
                        <span className="lc-face" style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 16px', background: 'linear-gradient(#555,#111)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: '.06em', clipPath: oct(7) }}>CLOSE · ESC</span>
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
