import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const READING_RULES: { title: string; body: string }[] = [
  { title: 'Section, intermezzo, chapter, intermezzo, chapter...', body: 'Every section opens and closes with an intermezzo. Chapters always have intermezzoes between them.' },
  { title: 'Sections', body: 'Every section has (n) chapters and (n+1) intermezzoes. Every section of the book switches the theme of intermezzoes. Every section has an odd number of chapters.' },
  { title: 'Intermezzoes', body: 'All intermezzoes reference past events. Intermezzoes target >500 words. All intermezzoes in one section refer to a common theme. Intermezzoes connect chapters, with exception to the first and last intermezzoes of the section. The first intermezzo foreshadows the theme of the section. The final intermezzo reveals an event that happened shortly before or sometime after the events of the final chapter in the section.' },
  { title: 'Chapters', body: 'Every chapter must start and finish with the same character. Every chapter must feature the starting character for longer than any other character. Every chapter targets around 8\'000-10\'000 words.' },
  { title: 'Once published, never overwritten', body: 'Once the story of a chapter or an intermezzo has been published, it cannot be changed. The last published chapter and intermezzo can receive one half-time revision, but that revision cannot change core events.' },
];

export default function Fiction() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const isMobile = useIsMobile();

  const fullSummary = "A bereft young woman agrees to venture into an emerging civil war for the promise of a resurrection device.";

  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#000000',
      minHeight: 'calc(100vh - 150px)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'flex-end',
      justifyContent: isMobile ? 'space-between' : undefined,
      padding: isMobile ? '1.5rem' : '3rem',
      gap: isMobile ? '1.5rem' : 0,
      overflow: 'hidden'
    }}>
      {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      )}
      {isMobile ? (
        <img
          src="/design/Chapter II preview.png"
          alt="Chapter II preview"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            margin: 'auto 0'
          }}
        />
      ) : (
        <img
          src="/design/Chapter II preview.png"
          alt="Chapter II preview"
          style={{
            position: 'absolute',
            top: '50%',
            right: '12rem',
            transform: 'translateY(-50%)',
            maxHeight: '95%',
            maxWidth: '55%',
            objectFit: 'contain',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />
      )}
      <div style={{ maxWidth: isMobile ? '100%' : '600px', position: 'relative', zIndex: 2 }}>
        <h1 style={{
          fontFamily: 'Thezeraine, serif',
          fontSize: isMobile ? '2.5rem' : '4rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          lineHeight: '1.2'
        }}>
          Thezeraine.
        </h1>

        <div style={{
          display: 'flex',
          gap: isMobile ? '1rem' : '1.5rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#d3d3d3',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d3d3d3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>2025-20XX</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#d3d3d3',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d3d3d3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>~44m</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <span style={{
            backgroundColor: '#888888',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            borderRadius: '0.375rem'
          }}>
            Sci-fi
          </span>
          <span style={{
            backgroundColor: '#888888',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            borderRadius: '0.375rem'
          }}>
            Drama
          </span>
        </div>

        <p
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            color: '#ffffff',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            maxWidth: '600px',
            cursor: 'pointer',
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {fullSummary}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href="/Thezeraine.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              textDecoration: 'none',
              border: 'none',
              borderRadius: '0.375rem',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Read
          </a>

          <button
            onClick={() => setShowGuide(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              border: '1px solid #ffffff',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ffffff'; }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Guide to Reading
          </button>
        </div>
      </div>

      {showGuide && (
        <ReadingGuideModal onClose={() => setShowGuide(false)} isMobile={isMobile} />
      )}
    </div>
  );
}

function ReadingGuideModal({ onClose, isMobile }: { onClose: () => void; isMobile: boolean }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '1rem' : '2rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#111111',
          border: '1px solid #2a2a2a',
          borderRadius: isMobile ? '0.75rem' : '1rem',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.9rem',
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '1.6rem',
            lineHeight: 1,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
        >
          {'×'}
        </button>

        <div style={{ padding: isMobile ? '1.5rem' : '2.5rem' }}>
          <h2 style={{
            fontFamily: 'Thezeraine, serif',
            fontSize: isMobile ? '1.8rem' : '2.2rem',
            color: '#ffffff',
            margin: '0 0 0.4rem',
          }}>
            Thezeraine.
          </h2>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
            The word "Thezeraine" is allegedly derived from "Heaven". Thezeraine is a rolling-release novel, which abides by the following rules, which were handcrafted to encourage thoughtful writing, engagement, and anticipation:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {READING_RULES.map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.9rem' }}>
                <span style={{
                  fontFamily: 'Thezeraine, serif',
                  color: '#666',
                  fontSize: '1.2rem',
                  minWidth: '1.5rem',
                }}>
                  {i + 1}
                </span>
                <div>
                  <h3 style={{ color: '#eee', fontSize: '1rem', margin: '0 0 0.3rem' }}>
                    {rule.title}
                  </h3>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    {rule.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
