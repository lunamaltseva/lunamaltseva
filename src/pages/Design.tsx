import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { useIsMobile } from '../hooks/useIsMobile';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

interface DesignItem {
  title: string;
  date: string;
  description: string;
  type: 'image' | 'pdf' | 'mp4';
  url: string;
}

interface DesignSection {
  title: string;
  description: string;
  date: string;
  items: DesignItem[];
}

const THUMB_HEIGHT = 240;
const THUMB_HEIGHT_MOBILE = 220;

const sections: DesignSection[] = [
  {
    title: 'Thezeraine',
    description: 'Art for the Thezeraine Book Universe',
    date: '2018 — Present',
    items: [
      {
        title: 'Book Cover',
        date: 'April 2026',
        description: 'The book cover for Thezeraine featuring Experte. The front-facing shadow of Experte is split into two projections of disparate buildings.',
        type: 'image',
        url: '/design/ThezeraineCover.png',
      },
      {
        title: 'Chapter Art',
        date: 'May 2026',
        description: 'The chapter art for Thezeraine: Intermezzo-Chapter-Intermezzo-Chapter-Intermezzo...',
        type: 'image',
        url: '/design/ThezeraineChapters.png',
      },
      {
        title: 'Theoderau Map',
        date: 'November 2025',
        description: 'Digital, traced replica of Theoderau\'s map, as it is referenced in Chapter I of Thezeraine.',
        type: 'image',
        url: '/design/ThezeraineTheoderau.png',
      },
    ],
  },
  {
    title: 'Presentations',
    description: 'A selection of my favorite, authored slide decks.',
    date: '2026',
    items: [
      {
        title: 'SwS: Normality Tests in Python',
        date: 'April 2026',
        description: 'A presentation for the Storytelling w/ Statistics class re: Normality Tests',
        type: 'pdf',
        url: '/design/NormalityPresentation.pdf',
      },
      {
        title: 'Get Engaged 2026 - Artemis CE',
        date: 'May 2026',
        description: 'The presentation by Luna for the GE26 conference.',
        type: 'pdf',
        url: '/design/RTMSCEPresentation.pdf',
      },
      {
        title: 'CTLT AIB&H: Schedule When',
        date: 'May 2026',
        description: 'Presented by Liviia Ni for the CTLT AI Bootcamp & Hackathon. Available at schedulewhen.net',
        type: 'pdf',
        url: '/design/ScheduleWhenPresentation.pdf',
      },
    ],
  },
];

function PdfCanvas({ url, desiredWidth, style }: { url: string; desiredWidth: number; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const pdf = await pdfjsLib.getDocument(encodeURI(url)).promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({
          canvasContext: canvas.getContext('2d')!,
          viewport,
          canvas,
        } as any).promise;
      } catch {
        // PDF not found or failed to load
      }
    }
    render();
    return () => { cancelled = true; };
  }, [url, desiredWidth]);

  return <canvas ref={canvasRef} style={style} />;
}

function ItemCard({ item, onClick, highlighted, isMobile }: {
  item: DesignItem;
  onClick: () => void;
  highlighted?: boolean;
  isMobile: boolean;
}) {
  const thumbH = isMobile ? THUMB_HEIGHT_MOBILE : THUMB_HEIGHT;
  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: `${thumbH}px`,
    objectFit: 'cover',
    objectPosition: 'top',
    display: 'block',
    backgroundColor: '#1e1e1e',
  };

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: '0.5rem',
        overflow: 'hidden',
        border: highlighted ? '2px solid #888' : '1px solid #222',
        backgroundColor: highlighted ? '#1a1a1a' : '#141414',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: highlighted ? '0 0 16px rgba(136, 136, 136, 0.3)' : 'none',
      }}
      onMouseEnter={(e) => { if (!highlighted) e.currentTarget.style.borderColor = '#555'; }}
      onMouseLeave={(e) => { if (!highlighted) e.currentTarget.style.borderColor = '#222'; }}
    >
      {item.type === 'image' ? (
        <img src={item.url} alt={item.title} draggable={false} style={mediaStyle} />
      ) : item.type === 'mp4' ? (
        <video src={item.url} muted loop autoPlay playsInline draggable={false} style={mediaStyle} />
      ) : (
        <PdfCanvas url={item.url} desiredWidth={720} style={mediaStyle} />
      )}
      <div style={{ padding: '0.6rem 0.75rem 0.7rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '0.5rem',
        }}>
          <span style={{
            color: highlighted ? '#fff' : '#ddd',
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            fontFamily: 'var(--font-primary)',
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.title}
          </span>
          <span style={{ color: '#666', fontSize: '0.75rem', flexShrink: 0 }}>
            {item.date}
          </span>
        </div>
      </div>
    </div>
  );
}

function ItemModal({ item, onClose, isMobile }: { item: DesignItem; onClose: () => void; isMobile: boolean }) {
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
          backgroundColor: '#141414',
          borderRadius: isMobile ? '0.75rem' : '1rem',
          border: '1px solid #222',
          maxWidth: isMobile ? '100%' : '900px',
          maxHeight: '90vh',
          width: '100%',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: 1,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
        >
          {'×'}
        </button>

        <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt={item.title}
              style={{ width: '100%', borderRadius: '0.5rem', maxHeight: '60vh', objectFit: 'contain' }}
            />
          ) : item.type === 'mp4' ? (
            <video
              src={item.url}
              controls
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', borderRadius: '0.5rem', maxHeight: '60vh', objectFit: 'contain' }}
            />
          ) : (
            <div>
              <PdfCanvas url={item.url} desiredWidth={800} style={{ width: '100%', borderRadius: '0.5rem' }} />
              <a
                href={encodeURI(item.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  color: '#888',
                  fontSize: '0.85rem',
                  textDecoration: 'underline',
                }}
              >
                Open full PDF
              </a>
            </div>
          )}

          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontWeight: 700,
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            color: '#ffffff',
            margin: '1.5rem 0 0.5rem 0',
          }}>
            {item.title}
          </h2>
          <span style={{ color: '#666', fontSize: '0.85rem' }}>
            {item.date}
          </span>
          <p style={{
            color: '#aaa',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            marginTop: '0.75rem',
          }}>
            {item.description}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SectionBlock({ section, id, onItemClick, isMobile }: {
  section: DesignSection;
  id: string;
  onItemClick: (item: DesignItem) => void;
  isMobile: boolean;
}) {
  return (
    <div id={id} style={{ marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '0.25rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-primary)',
          fontWeight: 700,
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          color: '#ffffff',
          margin: 0,
        }}>
          {section.title}
        </h2>
        <span style={{
          color: '#666',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-primary)',
          flexShrink: 0,
        }}>
          {section.date}
        </span>
      </div>
      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1.25rem 0' }}>
        {section.description}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '1rem' : '1.25rem',
      }}>
        {section.items.map((item) => (
          <ItemCard
            key={item.title}
            item={item}
            onClick={() => onItemClick(item)}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}

export default function Design() {
  const isMobile = useIsMobile();
  const [selectedItem, setSelectedItem] = useState<DesignItem | null>(null);

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      padding: isMobile ? '1.5rem' : '3rem',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-title)',
          fontWeight: 700,
          fontSize: isMobile ? '2rem' : '2.5rem',
          color: '#ffffff',
          margin: '0 0 0.5rem 0',
        }}>
          Design
        </h1>
        <p style={{
          color: '#888',
          fontSize: isMobile ? '0.95rem' : '1.05rem',
          margin: '0 0 3rem 0',
        }}>
          A selection of designs I take pride in.
        </p>

        {sections.map((section) => {
          const sectionId = section.title.toLowerCase().replace(/\s+/g, '-');
          return (
            <SectionBlock
              key={section.title}
              section={section}
              id={sectionId}
              onItemClick={(item) => setSelectedItem(item)}
              isMobile={isMobile}
            />
          );
        })}

        <p style={{
          color: '#555',
          fontSize: '0.9rem',
          fontStyle: 'italic',
          margin: '0',
          paddingTop: '1rem',
          borderTop: '1px solid #1a1a1a',
        }}>
          More sections coming soon.
        </p>
      </div>

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} isMobile={isMobile} />
      )}
    </div>
  );
}
