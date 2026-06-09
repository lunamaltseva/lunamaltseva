import { useMemo, useCallback } from 'react';
import type { Reaction, ReactionType, Isotope } from './nuclearData';
import { STARTER_ISOTOPES, temperatureToSliderPosition } from './nuclearData';

interface AtomControlsProps {
  currentIsotope: Isotope | null;
  availableReactions: Reaction[];
  allReactions: Reaction[];
  temperature: number;
  onReaction: (type: ReactionType) => void;
  onTemperatureChange: (t: number) => void;
  onSelectIsotope: (id: string) => void;
  onClear: () => void;
  isAnimating: boolean;
  isMobile: boolean;
  microwaving: boolean;
}

const REACTION_LABELS: Record<ReactionType, string> = {
  alpha: 'Alpha decay',
  beta: 'Beta decay',
  gamma: 'Gamma emission',
  'neutron-collision': 'Neutron collision',
  'deuterium-collision': 'Deuterium collision',
  fission: 'Fission',
  microwave: 'Microwave',
};

function MicrowaveIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <rect x="4" y="6" width="11" height="10" rx="1" fill="none" />
      <circle cx="18" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M7 16 C7 12, 8 10, 9 9" />
      <path d="M10 16 C10 13, 11 11, 12 10" />
    </svg>
  );
}

const REACTION_ORDER: ReactionType[] = [
  'alpha',
  'beta',
  'gamma',
  'neutron-collision',
  'deuterium-collision',
  'fission',
  'microwave',
];

function formatTemperature(t: number): string {
  if (t === 0) return '0 K';
  if (t < 1000) return `${Math.round(t)} K`;
  if (t < 1_000_000) return `${(t / 1000).toFixed(1)}k K`;
  if (t < 1_000_000_000) return `${(t / 1_000_000).toFixed(1)} MK`;
  return `${(t / 1_000_000_000).toFixed(1)} GK`;
}

function positionToTemperature(pos: number): number {
  if (pos <= 0) return 0;
  const minLog = 2;
  const maxLog = Math.log10(150_000_000);
  const logVal = minLog + pos * (maxLog - minLog);
  return Math.round(Math.pow(10, logVal));
}

const temperatureToPosition = temperatureToSliderPosition;

function getTemperatureColor(pos: number): string {
  if (pos < 0.3) {
    const t = pos / 0.3;
    const r = Math.round(50 + t * 50);
    const g = Math.round(100 + t * 50);
    const b = Math.round(200 - t * 50);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (pos < 0.7) {
    const t = (pos - 0.3) / 0.4;
    const r = Math.round(100 + t * 155);
    const g = Math.round(150 - t * 50);
    const b = Math.round(150 - t * 100);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (pos - 0.7) / 0.3;
    const r = 255;
    const g = Math.round(100 + t * 155);
    const b = Math.round(50 + t * 205);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export default function AtomControls({
  currentIsotope,
  availableReactions,
  allReactions,
  temperature,
  onReaction,
  onTemperatureChange,
  onSelectIsotope,
  onClear,
  isAnimating,
  isMobile,
  microwaving,
}: AtomControlsProps) {
  const availableTypes = useMemo(
    () => new Set(availableReactions.map((r) => r.type)),
    [availableReactions]
  );

  const allTypes = useMemo(
    () => new Set(allReactions.map((r) => r.type)),
    [allReactions]
  );

  const reactionDescriptions = useMemo(() => {
    const map = new Map<ReactionType, string>();
    for (const r of allReactions) {
      map.set(r.type, r.description);
    }
    return map;
  }, [allReactions]);

  const sliderPos = temperatureToPosition(temperature);
  const tempColor = getTemperatureColor(sliderPos);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const pos = parseFloat(e.target.value);
      onTemperatureChange(positionToTemperature(pos));
    },
    [onTemperatureChange]
  );

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #333',
        borderRadius: '0.75rem 0.75rem 0 0',
        padding: '16px',
        maxHeight: '45vh',
        overflowY: 'auto',
      }
    : {
        position: 'absolute',
        top: '50%',
        right: 24,
        transform: 'translateY(-50%)',
        zIndex: 10,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid #333',
        borderRadius: '0.75rem',
        padding: '20px',
        width: '230px',
      };

  return (
    <div style={panelStyle}>
      {/* Isotope pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '16px' }}>
        {STARTER_ISOTOPES.map((iso) => (
          <button
            key={iso.id}
            onClick={() => onSelectIsotope(iso.id)}
            disabled={isAnimating}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: currentIsotope?.id === iso.id
                ? '1px solid rgba(255,255,255,0.25)'
                : '1px solid rgba(255,255,255,0.08)',
              backgroundColor: currentIsotope?.id === iso.id
                ? 'rgba(255,255,255,0.07)'
                : 'transparent',
              color: currentIsotope?.id === iso.id ? '#fff' : '#c8c4bc',
              fontFamily: 'var(--font-primary)',
              fontSize: '0.75rem',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              opacity: isAnimating ? 0.4 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {iso.id}
          </button>
        ))}
      </div>

      {/* Reactions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
        {REACTION_ORDER.map((type) => {
          const isAvailable = availableTypes.has(type);
          const exists = allTypes.has(type);
          const isMicrowaveBtn = type === 'microwave';
          const gammaAvailable = availableTypes.has('gamma');
          const gammaBlocked = gammaAvailable && type !== 'gamma' && !isMicrowaveBtn;

          const disabled = isMicrowaveBtn
            ? !isAvailable || isAnimating || !currentIsotope
            : !isAvailable || isAnimating || !currentIsotope || microwaving || gammaBlocked;

          if (!exists && !currentIsotope) return null;

          const description = reactionDescriptions.get(type);
          const isActive = isMicrowaveBtn && microwaving;

          return (
            <button
              key={type}
              onClick={() => !disabled && onReaction(type)}
              disabled={disabled}
              title={description || type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: isActive
                  ? 'rgba(255,255,255,0.1)'
                  : disabled
                    ? 'transparent'
                    : 'transparent',
                color: isActive
                  ? '#fff'
                  : disabled
                    ? '#555'
                    : '#c8c4bc',
                fontFamily: 'var(--font-primary)',
                fontSize: '0.8rem',
                cursor: disabled && !isActive ? 'not-allowed' : 'pointer',
                transition: 'color 0.2s ease, background-color 0.2s ease',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <span style={{
                width: '20px',
                textAlign: 'center',
                flexShrink: 0,
                fontSize: isMicrowaveBtn ? '14px' : '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isMicrowaveBtn ? <MicrowaveIcon /> : (
                  type === 'alpha' ? 'α' :
                  type === 'beta' ? 'β' :
                  type === 'gamma' ? 'γ' :
                  type === 'neutron-collision' ? 'n' :
                  type === 'deuterium-collision' ? 'D' :
                  type === 'fission' ? '⚛' : ''
                )}
              </span>
              <span>
                {isMicrowaveBtn
                  ? (microwaving ? 'Stop' : REACTION_LABELS[type])
                  : REACTION_LABELS[type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Temperature */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontFamily: 'var(--font-primary)',
          fontSize: '0.75rem',
          color: '#888',
          marginBottom: '6px',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>Temperature</span>
          <span style={{ color: tempColor }}>{formatTemperature(temperature)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={sliderPos}
          onChange={handleSliderChange}
          style={{
            width: '100%',
            height: '4px',
            WebkitAppearance: 'none',
            appearance: 'none',
            background: `linear-gradient(to right, #333, ${tempColor})`,
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-primary)',
          fontSize: '0.6rem',
          color: '#555',
          marginTop: '4px',
        }}>
          <span>0 K</span>
          <span>150 MK</span>
        </div>
      </div>

      {/* Clear */}
      {currentIsotope && (
        <button
          onClick={onClear}
          disabled={isAnimating}
          style={{
            width: '100%',
            padding: '0.6rem 1.25rem',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '0.375rem',
            background: 'none',
            color: isAnimating ? '#555' : '#c8c4bc',
            fontFamily: 'var(--font-primary)',
            fontSize: '0.8rem',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s ease',
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
