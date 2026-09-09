import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';

const TITLE = "'Fascinate Inline', 'Bungee', system-ui, cursive"; 
const SANS = "'Open Sans', system-ui, sans-serif";

const ROUND_TIME = 35; 
const POINTS_BY_ROUND = [1, 1, 2, 2, 3];
const FINAL_ROUND = 4; 
const FLAW_PROMPT = "What's Wrong with... This Graph?";

const C = {
  white: '#ffffff',
  blue: '#1f5fd0',       
  blueBright: '#4a8dff',
  curtain: '#1846b8',
  curtainDark: '#0e2f7a',
  gray: '#333333',       
  faint: '#9fb2d8',
  off: '#d1ddf2',        
  green: '#17a54a',
  red: '#e23b34',
};

interface RoundContent {
  tagline: string;
  explanation: string;
  flawedGraph?: ReactNode;
  betterGraph?: ReactNode;
}

const ROUNDS: RoundContent[] = [
  {
    flawedGraph: '/wwwtg/1b.png',
    betterGraph: '/wwwtg/1g.png',
    tagline: 'Never lie with data!',
    explanation:
      'It decimates all of your credibility and brings you into a fight.',
  },
  {
    flawedGraph: '/wwwtg/2b.png',
    betterGraph: '/wwwtg/2g.png',
    tagline: 'Clutter is your enemy!',
    explanation:
      'There is a finite amount of attention your viewers can give to the graph. Utilize it wisely to build a point.',
  },
  {
    flawedGraph: '/wwwtg/3b.png',
    betterGraph: '/wwwtg/3g.png',
    tagline: 'Different purposes, different graphs',
    explanation:
      'Selecting the right visual is paramount to enhancing viewer comprehension and retention.',
  },
  {
    flawedGraph: '/wwwtg/4b.png',
    betterGraph: '/wwwtg/4g.png',
    tagline: 'Structure your narrative!',
    explanation:
      'A graph is like a story. Institute a visual hierarchy to make it easy to follow.',
  },
  {
    flawedGraph: '/wwwtg/5b.png',
    betterGraph: '/wwwtg/5g.png',
    tagline: 'Always tell a story!',
    explanation:
      'Without a story, you are doing data analysis, not data communication. If you want people to have a takeaway: tell them what it is.',
  },
];

const PRELOAD_SRCS: string[] = ROUNDS.flatMap((r) =>
  [r.flawedGraph, r.betterGraph].filter((g): g is string => typeof g === 'string'),
);

const TITLE_WORDS = [
  { t: "What's", delay: 0.0,  dur: 0.5 },
  { t: 'Wrong',  delay: 0.5,  dur: 0.90 },
  { t: 'with',   delay: 1.4,  dur: 0.65 },
  { t: 'THAT',   delay: 1.9, dur: 0.1 },
];
const GRAPH_DELAY = 2;
const GRAPH_DUR = 1.5;
const CURTAIN_MS = 1300;
const TITLE_TIMELINE_MS = (GRAPH_DELAY + GRAPH_DUR) * 1000 + 150;

type LightMode = 'idle' | 'countdown' | 'flash' | 'celebrate' | 'answering' | 'result';

interface BulbPoint { x: number; y: number }

function buildPerimeter(nx: number, ny: number): BulbPoint[] {
  const pts: BulbPoint[] = [];
  for (let i = 0; i < nx; i++) pts.push({ x: i / nx, y: 0 });
  for (let i = 0; i < ny; i++) pts.push({ x: 1, y: i / ny });
  for (let i = 0; i < nx; i++) pts.push({ x: 1 - i / nx, y: 1 });
  for (let i = 0; i < ny; i++) pts.push({ x: 0, y: 1 - i / ny });
  const off = Math.round(nx / 2);
  return pts.slice(off).concat(pts.slice(0, off));
}

function LightFrame({
  mode, progress, tick, flashColor, resultColor, dim,
}: {
  mode: LightMode;
  progress: number;
  tick: number;
  flashColor: string;
  resultColor: string;
  dim: boolean;
}) {
  const bulbs = useMemo(() => buildPerimeter(12, 7), []);
  const total = bulbs.length;
  const size = 15;
  const litCount = Math.ceil(total * Math.max(0, Math.min(1, progress)));
  const offCount = total - litCount;
  const palette = [C.blue, C.green, C.red];

  return (
    <div style={{
      position: 'fixed', inset: 44, pointerEvents: 'none', zIndex: 5,
      opacity: dim ? 0.22 : 1, transition: 'opacity 700ms ease',
      animation: 'wwwtg-frame-in 1000ms ease both',
    }}>
      {bulbs.map((b, i) => {
        let on = false;
        let color = C.blue;
        let blink = false;
        let pulse = false;
        if (mode === 'flash') {
          on = true; color = flashColor; blink = true;
        } else if (mode === 'countdown') {
          on = i >= offCount; color = C.blue;
        } else if (mode === 'answering') {
          on = true; color = C.blue; pulse = true;
        } else if (mode === 'result') {
          on = true; color = resultColor;
        } else if (mode === 'celebrate') {
          on = (i + tick) % 3 !== 0; color = palette[(i + tick) % palette.length];
        } else {
          on = ((i + tick) % 4) < 2; color = C.blue;
        }
        return (
          <span
            key={i}
            className="wwwtg-bulb"
            style={{
              position: 'absolute',
              left: `${b.x * 100}%`,
              top: `${b.y * 100}%`,
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: '50%',
              background: on ? color : C.off,
              boxShadow: on
                ? `0 0 ${size * 1.7}px ${size * 0.9}px ${color}bb, 0 0 ${size * 3.2}px ${size * 1.5}px ${color}55, inset 0 0 ${size * 0.35}px #fff`
                : 'inset 0 0 4px rgba(30,60,120,0.25)',
              animation: blink
                ? 'wwwtg-blink 260ms steps(1) infinite'
                : pulse
                  ? 'wwwtg-slow 1.8s ease-in-out infinite'
                  : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function TopBar({
  roundIdx, scores, points, answering, teamNames, isFinal,
}: {
  roundIdx: number;
  scores: Record<1 | 2, number>;
  points: number;
  answering: 1 | 2 | null;
  teamNames: Record<1 | 2, string>;
  isFinal: boolean;
}) {
  if (isFinal) {
    return (
      <div style={{ width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: '1.3rem', color: C.blue, letterSpacing: '0.12em' }}>
        THE FINAL ROUND
      </div>
    );
  }
  const teamCell = (team: 1 | 2): CSSProperties => ({
    fontFamily: SANS, fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em',
    color: C.gray,
    opacity: answering && answering !== team ? 0.4 : 1,
    textShadow: answering === team ? `0 0 14px ${C.blueBright}` : 'none',
    transition: 'opacity 150ms ease',
  });
  const num = (team: 1 | 2): CSSProperties => ({
    fontFamily: SANS, fontWeight: 800, fontSize: '2.2rem', color: C.blue, lineHeight: 1,
    textShadow: answering === team ? `0 0 18px ${C.blueBright}` : 'none',
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
      <div style={{ justifySelf: 'start', fontFamily: SANS, fontWeight: 700, fontSize: '1.1rem', color: C.blue, letterSpacing: '0.04em' }}>
        ROUND {roundIdx + 1}<span style={{ color: C.faint }}>/{ROUNDS.length}</span>
      </div>
      <div style={{ justifySelf: 'center', display: 'inline-flex', alignItems: 'center', gap: '1.2rem' }}>
        <span style={teamCell(1)}>{teamNames[1].toUpperCase()}</span>
        <span style={num(1)}>{scores[1]}</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, color: C.faint, fontSize: '1.5rem' }}>–</span>
        <span style={num(2)}>{scores[2]}</span>
        <span style={teamCell(2)}>{teamNames[2].toUpperCase()}</span>
      </div>
      <div style={{ justifySelf: 'end', textAlign: 'right' }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: '1.45rem', color: C.blue }}>×{points}</span>
        <div style={{ fontFamily: SANS, fontSize: '0.65rem', letterSpacing: '0.16em', color: C.faint }}>
          {points === 1 ? 'POINT' : 'POINTS'}
        </div>
      </div>
    </div>
  );
}

function RoundGraph({
  graph, kind, round, maxHeight = '54vh',
}: {
  graph?: ReactNode;
  kind: 'flawed' | 'better';
  round: number;
  maxHeight?: string;
}) {
  if (graph == null) return <GraphPlaceholder kind={kind} round={round} />;
  if (typeof graph === 'string') {
    return (
      <img
        src={graph}
        alt={`${kind} graph for round ${round}`}
        style={{
          display: 'block', margin: '0 auto',
          maxWidth: '100%', maxHeight, objectFit: 'contain',
          background: C.white,
          border: '1px solid #e3e9f5',
          boxShadow: '0 8px 28px rgba(20,40,90,0.14)',
        }}
      />
    );
  }
  return <>{graph}</>;
}

function GraphPlaceholder({ kind, round }: { kind: 'flawed' | 'better'; round: number }) {
  const bars = kind === 'flawed' ? [40, 44, 41, 47, 43] : [22, 41, 33, 58, 47];
  return (
    <div style={{
      border: `2px dashed ${C.faint}`, background: '#fff',
      padding: '1.5rem', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '0.75rem', minHeight: 220, justifyContent: 'center',
    }}>
      <svg viewBox="0 0 200 100" width="100%" height="150" style={{ maxWidth: 380, opacity: 0.7 }} aria-hidden>
        <line x1="20" y1="90" x2="190" y2="90" stroke={C.faint} strokeWidth="1.5" />
        <line x1="20" y1="10" x2="20" y2="90" stroke={C.faint} strokeWidth="1.5" />
        {bars.map((h, i) => (
          <rect key={i} x={30 + i * 32} y={90 - h} width="20" height={h} fill={C.blue} opacity="0.7" />
        ))}
      </svg>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: '0.9rem', color: C.blue, letterSpacing: '0.04em' }}>
        {kind === 'flawed' ? 'FLAWED' : 'BETTER'} GRAPH · ROUND {round}
      </div>
      <div style={{ fontFamily: SANS, fontSize: '0.8rem', color: C.gray, textAlign: 'center' }}>
        Placeholder — drop the real chart into ROUNDS[{round - 1}].{kind === 'flawed' ? 'flawedGraph' : 'betterGraph'}
      </div>
    </div>
  );
}

function Btn({
  children, onClick, tone = 'blue', big, disabled, style,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'blue' | 'outline' | 'green' | 'red';
  big?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const tones: Record<string, { bg: string; fg: string; bd: string }> = {
    blue: { bg: C.blue, fg: '#fff', bd: C.blue },
    outline: { bg: '#fff', fg: C.blue, bd: C.blue },
    green: { bg: C.green, fg: '#fff', bd: C.green },
    red: { bg: C.red, fg: '#fff', bd: C.red },
  };
  const t = disabled ? { bg: '#cbd5ea', fg: '#eef2fb', bd: '#cbd5ea' } : tones[tone];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        fontFamily: SANS, fontWeight: 700,
        fontSize: big ? '1.2rem' : '0.95rem',
        letterSpacing: '0.02em',
        color: t.fg, background: t.bg,
        border: `2px solid ${t.bd}`, borderRadius: 999,
        padding: big ? '1rem 2.5rem' : '0.8rem 1.7rem',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'transform 120ms ease, background 200ms ease',
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(2px)'; }}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
    >
      {children}
    </button>
  );
}

function CircleBtn({ tone, onClick, children }: { tone: 'green' | 'red'; onClick: () => void; children: ReactNode }) {
  const c = tone === 'green' ? C.green : C.red;
  return (
    <button
      onClick={onClick}
      aria-label={tone === 'green' ? 'Accept' : 'Reject'}
      style={{
        width: 54, height: 54, borderRadius: '50%',
        border: '3px solid #fff', background: c, color: '#fff',
        fontFamily: SANS, fontSize: '1.6rem', fontWeight: 700, lineHeight: 1,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.22)',
        animation: 'wwwtg-pop 200ms ease both',
      }}
    >
      {children}
    </button>
  );
}

function EdgeDock({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', maxWidth: 940, margin: '0 auto', columnGap: '3rem', alignItems: 'end' }}>
      <div style={{ justifySelf: 'end' }}>{left}</div>
      <div style={{ justifySelf: 'start' }}>{right}</div>
    </div>
  );
}


function Paragraph({ text, style }: { text: string; style?: CSSProperties }) {
  const parts = text.match(/[^.]+\.?/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  return (
    <div style={{ fontFamily: SANS, color: C.gray, fontSize: '1.2rem', lineHeight: 1.7, textAlign: 'left', ...style }}>
      {parts.map((s, i) => (
        <span key={i} style={{ display: 'block' }}>{s}</span>
      ))}
    </div>
  );
}

type Phase = 'title' | 'teams' | 'rules' | 'question' | 'reflection' | 'winner';

export default function Wwwtg() {
  const [phase, setPhase] = useState<Phase>('title');
  const [roundIdx, setRoundIdx] = useState(0);
  const [scores, setScores] = useState<Record<1 | 2, number>>({ 1: 0, 2: 0 });
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [answering, setAnswering] = useState<1 | 2 | null>(null);
  const [flash, setFlash] = useState<null | 'red' | 'green' | 'timeup'>(null);
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [tick, setTick] = useState(0);
  const [roundResult, setRoundResult] = useState<'won' | 'lost' | null>(null);
  const [compare, setCompare] = useState(false);
  const [teamNames, setTeamNames] = useState<Record<1 | 2, string>>({ 1: 'Team 1', 2: 'Team 2' });
  const [nextLocked, setNextLocked] = useState(false);
  const [showStarted, setShowStarted] = useState(false); 
  const [revealed, setRevealed] = useState(false);        
  const [titleDone, setTitleDone] = useState(false);      
  const timeupHandled = useRef(false);

  const points = POINTS_BY_ROUND[roundIdx];
  const isFinalRound = roundIdx === FINAL_ROUND;
  const lightsLit = phase !== 'title' || titleDone;

  useEffect(() => {
    PRELOAD_SRCS.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 180);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!showStarted) return;
    const id = setTimeout(() => setRevealed(true), CURTAIN_MS);
    return () => clearTimeout(id);
  }, [showStarted]);
  useEffect(() => {
    if (!revealed) return;
    const id = setTimeout(() => setTitleDone(true), TITLE_TIMELINE_MS);
    return () => clearTimeout(id);
  }, [revealed]);

  const timerRunning = phase === 'question' && answering === null && !flash && !showAnnounce && !isFinalRound;
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, +(t - 0.1).toFixed(2))), 100);
    return () => clearInterval(id);
  }, [timerRunning, timeLeft <= 0]); 

  useEffect(() => {
    if (!nextLocked) return;
    const id = setTimeout(() => setNextLocked(false), 3000);
    return () => clearTimeout(id);
  }, [nextLocked]);

  const enterReflection = useCallback((result: 'won' | 'lost') => {
    setFlash(null);
    setAnswering(null);
    setRoundResult(result);
    setNextLocked(true);
    setPhase('reflection');
  }, []);

  const goToRound = useCallback((i: number) => {
    timeupHandled.current = false;
    setRoundIdx(i);
    setTimeLeft(ROUND_TIME);
    setAnswering(null);
    setFlash(null);
    setRoundResult(null);
    setCompare(false);
    setShowAnnounce(i === 2 || i === 4);
    setPhase('question');
  }, []);

  useEffect(() => {
    if (phase !== 'question' || showAnnounce || isFinalRound || timeLeft > 0 || timeupHandled.current) return;
    timeupHandled.current = true;
    const t1 = setTimeout(() => setFlash('timeup'), 0);
    const t2 = setTimeout(() => enterReflection('lost'), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase, showAnnounce, isFinalRound, timeLeft, enterReflection]);

  const acceptAnswer = () => {
    if (!answering) return;
    const team = answering;
    setScores((s) => ({ ...s, [team]: s[team] + points }));
    setFlash('green');
    setTimeout(() => enterReflection('won'), 1100);
  };

  const rejectAnswer = () => {
    setFlash('red');
    setAnswering(null);
    setTimeout(() => setFlash(null), 900);
  };

  const nextRound = () => {
    if (roundIdx < ROUNDS.length - 1) goToRound(roundIdx + 1);
    else setPhase('winner');
  };

  const flashColor = flash === 'green' ? C.green : C.red;
  const resultColor = roundResult === 'lost' ? C.red : C.green;
  const lightMode: LightMode = flash
    ? 'flash'
    : phase === 'winner'
      ? 'celebrate'
      : phase === 'reflection'
        ? 'result'
        : phase === 'question' && !showAnnounce && !isFinalRound && answering !== null
          ? 'answering'
          : phase === 'question' && !showAnnounce && !isFinalRound
            ? 'countdown'
            : 'idle';
  const dimLights = phase === 'question' && isFinalRound && !showAnnounce;

  const round = ROUNDS[roundIdx];

  const contentWrap: CSSProperties = {
    position: 'fixed', inset: 0,
    padding: '92px 116px',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    zIndex: 10,
  };

  
  const layout = (opts: { topBar?: ReactNode; body: ReactNode; dock?: ReactNode }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, gap: '1.25rem' }}>
      {opts.topBar}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, overflow: 'hidden', width: '100%' }}>
        <div style={{ width: '100%' }}>{opts.body}</div>
      </div>
      {opts.dock && <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{opts.dock}</div>}
    </div>
  );

  const renderTitle = () => layout({
    body: (
      <div style={{ textAlign: 'center', maxWidth: 1150, margin: '0 auto' }}>
        {revealed && (
          <h1 style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '0 0.35em', margin: 0,
            fontFamily: TITLE, color: C.blue, fontSize: '5.6rem', lineHeight: 1.06,
          }}>
            {TITLE_WORDS.map((w) => (
              <span key={w.t} style={{
                display: 'inline-block', opacity: 0, transformOrigin: 'center',
                animation: `wwwtg-word ${w.dur}s cubic-bezier(.2,1.35,.4,1) ${w.delay}s both`,
              }}>
                {w.t}
              </span>
            ))}
            <span style={{
              display: 'inline-block', opacity: 0, transformOrigin: 'center',
              animation: `wwwtg-word ${GRAPH_DUR}s cubic-bezier(.2,1.35,.4,1) ${GRAPH_DELAY}s both`,
            }}>
              Graph!?
            </span>
          </h1>
        )}
      </div>
    ),
    dock: titleDone ? <Btn big onClick={() => setPhase('teams')}>Meet the Teams ▶</Btn> : undefined,
  });

  const renderTeams = () => {
    const letterTile = (ch: string) => (
      <span key={ch} style={{
        fontFamily: SANS, fontWeight: 700, fontSize: '1.3rem',
        width: 52, height: 52,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${C.blue}`, color: C.blue, background: '#fff',
      }}>
        {ch}
      </span>
    );
    const team1 = 'ABCDEFGHIJK'.split('');
    const team2 = 'LMNOPQRSTUVWXYZ'.split('');
    const nameField = (team: 1 | 2) => (
      <input
        value={teamNames[team]}
        onChange={(e) => setTeamNames((n) => ({ ...n, [team]: e.target.value }))}
        maxLength={24}
        aria-label={`Team ${team} name`}
        spellCheck={false}
        style={{
          fontFamily: SANS, fontWeight: 700, color: C.blue, fontSize: '1.6rem', letterSpacing: '0.02em',
          textAlign: 'center', marginBottom: '1rem', background: 'transparent',
          border: 'none', borderBottom: `2px solid ${C.faint}`, padding: '0.2rem 0.4rem',
          maxWidth: '100%', outline: 'none',
        }}
        onFocus={(e) => (e.currentTarget.style.borderBottomColor = C.blue)}
        onBlur={(e) => (e.currentTarget.style.borderBottomColor = C.faint)}
      />
    );
    return layout({
      body: (
        <div style={{ maxWidth: '70vw', width: '100%', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: SANS, fontWeight: 800, color: C.blue, fontSize: '4rem', margin: '0 0 1.75rem' }}>The Teams</h2>
          <Paragraph text="There are two teams. They are decided based on the first letter of your name." style={{ maxWidth: '70vw', margin: '0 auto 2.5rem', fontSize: '2rem', lineHeight: 1.6 }} />
          <div style={{ marginBottom: '2.25rem' }}>
            <div>{nameField(1)}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>{team1.map(letterTile)}</div>
          </div>
          <div>
            <div>{nameField(2)}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>{team2.map(letterTile)}</div>
          </div>
        </div>
      ),
      dock: <Btn onClick={() => setPhase('rules')} big>NEXT ▶</Btn>,
    });
  };

  const renderRules = () => layout({
    body: (
      <div style={{ maxWidth: '70vw', width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: SANS, fontWeight: 800, color: C.blue, fontSize: '4rem', margin: '0 0 2rem' }}>The Rules</h2>
        <Paragraph
          text="Each round, a graph with an obvious flaw is presented. The first person to buzz in with a correct fix earns their team a point. The difficulty and point rewards increase over time. The team with the most points wins."
          style={{ maxWidth: '70vw', margin: '0 auto', fontSize: '2rem', lineHeight: 1.6 }}
        />
      </div>
    ),
    dock: <Btn onClick={() => goToRound(0)} big>LET'S PLAY ▶</Btn>,
  });

  const renderQuestion = () => {
    const teamButton = (team: 1 | 2) => {
      const active = answering === team;
      const dimd = answering !== null && !active;
      return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {active && (
            <div style={{ position: 'absolute', left: '50%', bottom: 'calc(100% + 0.7rem)', transform: 'translateX(-50%)', display: 'flex', gap: '0.9rem' }}>
              <CircleBtn tone="green" onClick={acceptAnswer}>✓</CircleBtn>
              <CircleBtn tone="red" onClick={rejectAnswer}>✗</CircleBtn>
            </div>
          )}
          <Btn
            tone={active ? 'blue' : 'outline'}
            big
            onClick={() => { if (answering === null) setAnswering(team); }}
            style={{
              minWidth: 240,
              opacity: dimd ? 0.4 : 1,
              transform: active ? 'scale(1.05)' : 'none',
              transition: 'opacity 160ms ease, transform 160ms ease',
            }}
          >
            {teamNames[team].toUpperCase()}
          </Btn>
        </div>
      );
    };
    return layout({
      topBar: <TopBar roundIdx={roundIdx} scores={scores} points={points} answering={answering} teamNames={teamNames} isFinal={isFinalRound} />,
      body: (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: SANS, fontWeight: 800, color: C.blue, fontSize: '2.4rem', margin: '0 0 1.4rem' }}>{FLAW_PROMPT}</h2>
          <div style={{ height: '56vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RoundGraph graph={round.flawedGraph} kind="flawed" round={roundIdx + 1} maxHeight="56vh" />
          </div>
          <div style={{ fontFamily: SANS, color: C.red, fontSize: '1.05rem', minHeight: '1.4rem', marginTop: '0.8rem' }}>
            {flash === 'timeup' ? "Time's up!" : ''}
          </div>
        </div>
      ),
      dock: <EdgeDock left={teamButton(1)} right={teamButton(2)} />,
    });
  };

  const renderReflection = () => layout({
    topBar: <TopBar roundIdx={roundIdx} scores={scores} points={points} answering={answering} teamNames={teamNames} isFinal={isFinalRound} />,
    body: (
      <div style={{ width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontFamily: SANS, fontWeight: 800, color: C.blue, fontSize: '2.2rem', margin: '0 0 0.9rem' }}>{round.tagline}</h2>
        <Paragraph text={round.explanation} style={{ maxWidth: 760, margin: '0 auto 1.4rem' }} />
        <div style={{ height: '46vh', display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
          {compare ? (
            <>
              <figure style={{ flex: 1, minWidth: 0, margin: 0 }}>
                <RoundGraph graph={round.flawedGraph} kind="flawed" round={roundIdx + 1} maxHeight="46vh" />
              </figure>
              <figure style={{ flex: 1, minWidth: 0, margin: 0 }}>
                <RoundGraph graph={round.betterGraph} kind="better" round={roundIdx + 1} maxHeight="46vh" />
              </figure>
            </>
          ) : (
            <RoundGraph graph={round.betterGraph} kind="better" round={roundIdx + 1} maxHeight="46vh" />
          )}
        </div>
      </div>
    ),
    dock: (
      <EdgeDock
        left={<Btn tone="outline" big onClick={() => setCompare((c) => !c)}>{compare ? 'BETTER ONLY ▣' : 'COMPARE ◧'}</Btn>}
        right={<Btn big disabled={nextLocked} onClick={nextRound}>{roundIdx < ROUNDS.length - 1 ? 'NEXT ROUND ▶' : 'REVEAL THE WINNER ▶'}</Btn>}
      />
    ),
  });

  const renderWinner = () => {
    const winner = scores[1] === scores[2] ? 0 : scores[1] > scores[2] ? 1 : 2;
    return layout({
      body: (
        <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, color: C.gray, letterSpacing: '0.25em', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            FINAL RESULTS
          </div>
          <h1 style={{
            fontFamily: SANS, fontWeight: 800, fontSize: '3.8rem', margin: '0.25rem 0 0',
            color: winner === 0 ? C.blue : C.green,
            textShadow: `0 0 26px ${winner === 0 ? C.blueBright : C.green}66`,
          }}>
            {winner === 0 ? "It's a tie!" : `${teamNames[winner as 1 | 2]} wins!`}
          </h1>
          <div style={{ display: 'flex', gap: '1.75rem', justifyContent: 'center', marginTop: '2.25rem', flexWrap: 'wrap' }}>
            {([1, 2] as const).map((team) => (
              <div key={team} style={{
                background: '#fff', border: `2px solid ${winner === team ? C.green : C.blue}`,
                padding: '1.5rem 2.2rem', minWidth: 180,
                transform: winner === team ? 'scale(1.06)' : 'none',
                boxShadow: winner === team ? `0 0 34px ${C.green}44` : 'none',
              }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, color: C.gray, textTransform: 'uppercase', fontSize: '0.9rem' }}>
                  {teamNames[team]}
                </div>
                <div style={{ fontFamily: SANS, fontWeight: 800, color: winner === team ? C.green : C.blue, fontSize: '3.2rem', lineHeight: 1.1 }}>{scores[team]}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.white, overflow: 'hidden' }}>
      <style>{`
        @keyframes wwwtg-blink { 0% { opacity: 1; } 50% { opacity: 0.12; } 100% { opacity: 1; } }
        @keyframes wwwtg-pop { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes wwwtg-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.32; } }
        @keyframes wwwtg-frame-in { from { opacity: 0; } to { opacity: 1; } }
        .wwwtg-bulb { transition: background 160ms ease, box-shadow 160ms ease; }

        
        @keyframes wwwtg-word {
          0%   { opacity: 0; transform: scale(0); }
          70%  { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        y sweeps at
           different periods trace a smooth screen-filling path. */
        @keyframes wwwtg-sweep-x { from { transform: translateX(-42vw); } to { transform: translateX(42vw); } }
        @keyframes wwwtg-sweep-y { from { transform: translateY(-40vh); } to { transform: translateY(40vh); } }
      `}</style>

      {lightsLit && (
        <LightFrame mode={lightMode} progress={timeLeft / ROUND_TIME} tick={tick} flashColor={flashColor} resultColor={resultColor} dim={dimLights} />
      )}

      <div style={contentWrap}>
        {phase === 'title' && renderTitle()}
        {phase === 'teams' && renderTeams()}
        {phase === 'rules' && renderRules()}
        {phase === 'question' && renderQuestion()}
        {phase === 'reflection' && renderReflection()}
        {phase === 'winner' && renderWinner()}
      </div>

      {phase === 'title' && (
        <>
          <div style={{
            position: 'fixed', top: 0, bottom: 0, left: 0, width: '52%', zIndex: 30, pointerEvents: 'none',
            background: `repeating-linear-gradient(90deg, ${C.curtain} 0, ${C.curtain} 34px, ${C.curtainDark} 34px, ${C.curtainDark} 68px)`,
            transform: showStarted ? 'translateX(-102%)' : 'none',
            transition: 'transform 1.3s cubic-bezier(.7,0,.3,1)',
          }} />
          <div style={{
            position: 'fixed', top: 0, bottom: 0, right: 0, width: '52%', zIndex: 30, pointerEvents: 'none',
            background: `repeating-linear-gradient(90deg, ${C.curtain} 0, ${C.curtain} 34px, ${C.curtainDark} 34px, ${C.curtainDark} 68px)`,
            transform: showStarted ? 'translateX(102%)' : 'none',
            transition: 'transform 1.3s cubic-bezier(.7,0,.3,1)',
          }} />

          {[
            { x: '7s', y: '5s', dx: '0s', dy: '-2s' },
            { x: '5s', y: '8s', dx: '-3s', dy: '-1s' },
          ].map((s, n) => (
            <div key={n} style={{
              position: 'fixed', top: '50%', left: '50%', width: 0, height: 0, zIndex: 35, pointerEvents: 'none',
              opacity: revealed ? 0 : 1, transition: 'opacity 700ms ease',
            }}>
              <div style={{ animation: `wwwtg-sweep-x ${s.x} ease-in-out ${s.dx} infinite alternate` }}>
                <div style={{ animation: `wwwtg-sweep-y ${s.y} ease-in-out ${s.dy} infinite alternate` }}>
                  <div style={{
                    width: '44vh', height: '44vh', transform: 'translate(-50%, -50%)',
                    borderRadius: '50%', background: 'rgba(255, 255, 255, 0.5)',
                  }} />
                </div>
              </div>
            </div>
          ))}

          {!showStarted && (
            <div
              onClick={() => setShowStarted(true)}
              style={{ position: 'fixed', inset: 0, zIndex: 40, cursor: 'pointer' }}
            />
          )}
        </>
      )}

      {showAnnounce && phase === 'question' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 20,
          background: 'rgba(14, 47, 122, 0.94)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ animation: 'wwwtg-pop 300ms ease both' }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, color: '#fff', fontSize: '2.5rem', textShadow: '0 0 24px rgba(120,170,255,0.9)', maxWidth: 840, lineHeight: 1.25 }}>
              Wo-oh! The difficulty and the point gain have been raised{isFinalRound ? ' again' : ''}!
            </div>
            <div style={{ marginTop: '2.2rem' }}>
              <Btn onClick={() => setShowAnnounce(false)} big>
                {isFinalRound ? 'START THE FINAL ROUND ▶' : `START ROUND ${roundIdx + 1} ▶`}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
