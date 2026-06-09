import { useState, useEffect } from 'react';
import type { Isotope } from './nuclearData';

const CS_FREQUENCY = 9_192_631_770;

function formatCycles(cycles: number): string {
  return cycles.toLocaleString();
}

function MicrowaveCounter({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 16);
    return () => clearInterval(id);
  }, []);

  const elapsedMs = now - startedAt;
  const elapsedSec = elapsedMs / 1000;
  const cycles = Math.floor(elapsedSec * CS_FREQUENCY);
  const seconds = (cycles / CS_FREQUENCY).toFixed(9);

  return (
    <div
      style={{
        marginTop: '12px',
        padding: '10px 12px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.375rem',
        fontFamily: 'monospace',
        fontSize: '0.7rem',
        lineHeight: '1.6',
        color: '#c8c4bc',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-primary)',
        fontSize: '0.65rem',
        color: '#888',
        marginBottom: '4px',
      }}>
        Cs-133 hyperfine transition
      </div>
      <div>{formatCycles(cycles)} cycles</div>
      <div style={{ color: '#888' }}>= {seconds} s</div>
    </div>
  );
}

interface AtomInfoProps {
  isotope: Isotope | null;
  isExcited: boolean;
  isMobile: boolean;
  microwaveStartedAt?: number | null;
}

export default function AtomInfo({ isotope, isExcited, isMobile, microwaveStartedAt }: AtomInfoProps) {
  if (!isotope) {
    return (
      <div
        style={{
          position: 'absolute',
          top: isMobile ? 12 : 24,
          left: isMobile ? 12 : 24,
          zIndex: 10,
          backgroundColor: 'rgba(20, 20, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid #333',
          borderRadius: '0.75rem',
          padding: isMobile ? '12px 16px' : '16px 24px',
          color: '#888',
          fontFamily: 'var(--font-primary)',
          fontSize: isMobile ? '0.85rem' : '0.95rem',
        }}
      >
        Select an atom to begin
      </div>
    );
  }

  const massNumber = isotope.protons + isotope.neutrons;

  return (
    <div
      style={{
        position: 'absolute',
        top: isMobile ? 12 : 24,
        left: isMobile ? 12 : 24,
        zIndex: 10,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid #333',
        borderRadius: '0.75rem',
        padding: isMobile ? '12px 16px' : '20px 28px',
        color: '#ffffff',
        fontFamily: 'var(--font-primary)',
        minWidth: isMobile ? '140px' : '180px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-title)',
          fontWeight: 700,
          fontSize: isMobile ? '1.4rem' : '1.75rem',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isotope.name}
        {isExcited && (
          <span
            style={{
              fontSize: '0.7rem',
              color: '#d4d0c8',
              fontFamily: 'var(--font-primary)',
              fontStyle: 'italic',
            }}
          >
            excited
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: isMobile ? '0.75rem' : '0.85rem',
          color: '#c8c4bc',
          lineHeight: '1.6',
        }}
      >
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>
            <span style={{ color: '#888' }}>Z </span>
            {isotope.protons}
          </span>
          <span>
            <span style={{ color: '#888' }}>N </span>
            {isotope.neutrons}
          </span>
          <span>
            <span style={{ color: '#888' }}>A </span>
            {massNumber}
          </span>
        </div>
      </div>

      {isotope.isStable && (
        <div
          style={{
            marginTop: '8px',
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.65rem',
            color: '#c8c4bc',
          }}
        >
          Stable
        </div>
      )}

      {microwaveStartedAt && (
        <MicrowaveCounter startedAt={microwaveStartedAt} />
      )}
    </div>
  );
}
