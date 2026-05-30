import { useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useIsMobile } from '../hooks/useIsMobile';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

interface AcademicItem {
  title: string;
  language: string;
  publication: string;
  date: string;
  description: string;
  pdfUrl: string;
  featuredAt?: string;
}

interface AcademicSection {
  title: string;
  description: string;
  items: AcademicItem[];
}

const sections: AcademicSection[] = [
  {
    title: 'Publications',
    description: 'Published works in academic journals and repositories.',
    items: [
      {
        title: 'Pedagogical Foundations of Ensuring Cybersecurity of Schoolchildren in the Context of Digital Transformation of Education',
        language: 'Russian',
        publication: 'ALATOO ACADEMIC STUDIES',
        date: 'January 2026',
        description: 'The article examines the theoretical and pedagogical foundations for developing a culture of cybersecurity among schoolchildren in the context of the digital transformation of education. It substantiates the need to incorporate issues of digital and information security into the content of general education. The key pedagogical approaches, methods, and conditions that ensure the formation of safe and responsible student behavior in the digital environment are analyzed. A model for ensuring students\' cybersecurity is presented, outlining the stages of cybersecurity development—from defining the goal to achieving the final outcome. Special attention is given to the role of pedagogical support, the improvement of teachers\' digital literacy, and the creation of an educational environment aimed at fostering students\' competence in the field of cybersecurity. Practical recommendations for improving the student cybersecurity system are provided.',
        pdfUrl: '/PEDAGOGICAL FOUNDATIONS OF ENSURING CYBERSECURITY.pdf',
      },
      {
        title: 'Grant Program Result Prediction: a Real-Time Management System to Estimate Results for a Given Budget',
        language: 'English',
        publication: 'AUCA Digital Repository',
        date: 'December 2026',
        featuredAt: 'Get Engaged 2026',
        description: 'The integration of ARTeMiS by AUCA\'s Center for Civic Engagement (CCE) as a management system for their Student Initiative Development Program (SIDP) grant program landmarks a steep increase in the SIDP Committee Members\' ability to make data-driven judgement calls. However, the system can be further improved by providing forecasts of the potential impact each project will have, wherefrom arises the need for a grant result program prediction. This paper will use regression, data mining, and dynamic programming to estimate the optimal allocation of budget to yield maximal impact.',
        pdfUrl: '/Grant Program Result Prediction.pdf',
      },
    ],
  },
  {
    title: 'Research Papers',
    description: 'Papers for which I had to suffer through composing an annotated bibliography.',
    items: [
      {
        title: 'Harmony or Hegemony: A Study of the Overwhelming Approval of the Social Credit System by Chinese Citizens',
        language: 'English',
        publication: 'Course: China\'s Foreign Policy',
        date: 'December 2024',
        featuredAt: 'FYSem/SYSem 2025',
        description: 'Despite the diabolical portrayal the Chinese Social Credit System (SCS) received in Western democratic media, recent surveys have shown that less than one percent of Chinese citizens disapprove of the SCS. To find the grassroots of this astounding statistic, this paper delves into Chinese culture, exploring its notion of privacy and civil ideals, as well as analyzing Chinese history, the Chinese crisis of trust, and the radical steps the Chinese Communist Party has taken to bring the situation under control. This paper will argue that Chinese citizens overwhelmingly approve of the SCS because of the Chinese Communist Party\'s media control, social deterrence, and authority.',
        pdfUrl: '/Harmony or Hegemony.pdf',
      },
      {
        title: 'Reception of Yeats’s "Sailing to Byzantium" Among College Students',
        language: 'English',
        publication: 'Course: Critical Approaches in Modern Media',
        date: 'May 2026',
        description: 'Per Lüdtke, poetry is traditionally a medium with a great amount of interpretative variability between readers (2014). The root cause of this phenomenon, often referred to by reception theorists as "hermeneutic depth," is especially heightened in the case of "Sailing to Byzantium," where the viscosity of the lines makes the task of interpretation almost insurmountable to an inexperienced reader. Because of that, it is sometimes said that poetry is an acquired pleasure, one which young people lack the introspective capacity to appreciate. This paper will apply reception theory to a series of four interviews with college students to argue that while college students are able to make sense of complex texts, that limited understanding hinges on their familiarity with critical analysis and social institutions.',
        pdfUrl: '/STB Analysis.pdf',
      },
    ],
  },
  {
    title: 'Essays',
    description: 'Long-form prompt-based formal writing.',
    items: [
      {
        title: 'Semiotic Analysis of Christopher Nolan’s "The Odyssey" Preliminary Movie Poster',
        language: 'English',
        publication: 'Course: Critical Approaches in Modern Media',
        date: 'March 2026',
        description: 'The Odyssey is a notoriously difficult work to capture on film. Said to have been orally composed around 7th century BCE by Homer, the epic is counted as one of the most influential works of literature of all time. Using semiotic analysis, this paper will argue that Christopher Nolan’s The Odyssey poster depicts a scene from Book 11 of Homer’s The Odyssey from the perspective of King Agamemnon.',
        pdfUrl: '/Odyssey Poster Analysis.pdf',
      },
      {
        title: 'The Antique and the Modern Promethies',
        language: 'English',
        publication: 'Course: First Year Seminar I',
        date: 'December 2023',
        featuredAt: 'FYSem/SYSem 2024',
        description: 'Both Prometheus and Frankenstein were oblivious of their mortal status, and deserve punishment from their superiors precisely for their repeated, arrogant, and inconsiderate attempts of grandeur. The essay delves into the predicaments one is "funneled into" by fate, and whether the individuals themselves can be held accountable for their actions.',
        pdfUrl: '/The Antique and the Modern Prometheis.pdf',
      },
      {
        title: 'Individuals, Injustices, Coping Patterns',
        language: 'English',
        publication: 'Course: First Year Seminar II',
        date: 'May 2024',
        description: 'In an attempt to create a mental safespace from the injustice they suffered with coping mechanisms, individuals perpetrated their own doom precisely because they did not rationalize their emotions.',
        pdfUrl: '/Individuals, Injustices, Coping Patterns.pdf',
      },
    ],
  },
  {
    title: 'Articles',
    description: 'Opinion, mock-journalistic pieces & other things.',
    items: [
      {
        title: 'Beyond The Books: Project-Based Learning at AUCA',
        language: 'English',
        publication: 'The Newstar',
        date: 'March 2025',
        description: 'Is Project-Based Learning the superior form of learning? Why do some courses use it and others do not?',
        pdfUrl: '/Beyond the Books I.pdf',
      },
      {
        title: 'The New Advising System Is a Disaster',
        language: 'English',
        publication: 'The Newstar — Rejected [Due to Being "Too Critical"]',
        date: 'October 2024',
        description: 'In 2024, the administration of the American University of Central Asia removed student-to-student advising. What are the consequences of this decision?',
        pdfUrl: '/The New Advising System Is a Disaster.pdf',
      },
      {
        title: 'Delta One',
        language: 'English',
        publication: 'N/A',
        date: 'July 2023',
        description: 'A structured approach to English I put together in 2023.',
        pdfUrl: '/D1.pdf',
      },
    ],
  },
];

const THUMB_WIDTH_DESKTOP = 360;
const THUMB_WIDTH_MOBILE = 260;
// US Letter: 8.5 x 11 in → height = width * 11/8.5
const LETTER_RATIO = 11 / 8.5;
const TITLE_BAR_HEIGHT = 96;
const PANEL_WIDTH_DESKTOP = 460;
const PANEL_MIN = 220;
const VIEWPORT_PADDING = 48;

function useViewportWidth() {
  const [w, setW] = useState<number>(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));
  useEffect(() => {
    function onResize() { setW(window.innerWidth); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function PdfThumbnail({ url, width, height }: { url: string; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const pdf = await pdfjsLib.getDocument(encodeURI(url)).promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const unscaled = page.getViewport({ scale: 1 });
        // Enforce Letter sizing: fit page width to widget width.
        // Container is Letter-ratio; letterbox or clip excess height.
        const scale = (width * dpr) / unscaled.width;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${(viewport.height / dpr).toFixed(2)}px`;

        await page.render({
          canvasContext: canvas.getContext('2d')!,
          viewport,
          canvas,
        } as any).promise;
        if (!cancelled) setLoaded(true);
      } catch {
        // leave canvas blank
      }
    }
    render();
    return () => { cancelled = true; };
  }, [url, width]);

  return (
    <div style={{
      position: 'relative',
      width,
      height,
      overflow: 'hidden',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      />
    </div>
  );
}

function FeaturedBadge({ venue }: { venue: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '14px',
        right: '14px',
        maxWidth: 'calc(100% - 28px)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.4rem 0.65rem',
        background: '#efbf04',
        color: '#0a0a0a',
        fontFamily: 'CustomRegularBold, sans-serif',
        fontSize: '0.65rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        borderRadius: '2px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
      title={`Featured: ${venue}`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M12 2l2.39 6.96H22l-6.19 4.5L18.18 22 12 17.27 5.82 22l2.37-8.54L2 8.96h7.61z" />
      </svg>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Featured · {venue}
      </span>
    </div>
  );
}

function PaperWidget({
  item,
  expanded,
  onToggle,
  isMobile,
}: {
  item: AcademicItem;
  expanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
}) {
  const viewportWidth = useViewportWidth();
  const thumbWidth = isMobile ? THUMB_WIDTH_MOBILE : THUMB_WIDTH_DESKTOP;
  const thumbHeight = Math.round(thumbWidth * LETTER_RATIO);
  const widgetHeight = thumbHeight + TITLE_BAR_HEIGHT;
  // Panel width adapts to viewport so an expanded widget never overflows the screen.
  const panelWidth = Math.max(
    PANEL_MIN,
    Math.min(PANEL_WIDTH_DESKTOP, viewportWidth - thumbWidth - VIEWPORT_PADDING),
  );
  return (
    <div
      id={slug(item.title)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        flexShrink: 0,
        width: expanded ? thumbWidth + panelWidth : thumbWidth,
        height: widgetHeight,
        transition: 'width 450ms cubic-bezier(0.22, 1, 0.36, 1), transform 250ms ease, box-shadow 250ms ease',
        transform: expanded ? 'translateY(-4px)' : 'none',
        boxShadow: expanded
          ? '0 20px 36px -16px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12)'
          : '0 10px 20px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
        borderRadius: '2px',
        background: '#0a0a0a',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={onToggle}
    >
      {/* left column: PDF thumbnail (Letter ratio) + distinct title bar below */}
      <div style={{
        width: thumbWidth,
        height: widgetHeight,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        <PdfThumbnail url={item.pdfUrl} width={thumbWidth} height={thumbHeight} />
        {item.featuredAt && <FeaturedBadge venue={item.featuredAt} />}
        {/* title bar — its own region, separated by a hairline */}
        <div style={{
          flex: 1,
          minHeight: 0,
          padding: '0.75rem 0.95rem',
          background: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          color: '#f5f5f5',
          fontFamily: 'CustomRegularBold, serif',
          fontSize: '0.85rem',
          lineHeight: 1.3,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}>
          <span style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.title}
          </span>
        </div>
      </div>

      {/* expansion panel */}
      <div style={{
        width: expanded ? panelWidth : 0,
        height: widgetHeight,
        overflow: 'hidden',
        background: '#0a0a0a',
        borderLeft: expanded ? '1px solid rgba(255,255,255,0.12)' : 'none',
        transition: 'width 450ms cubic-bezier(0.22, 1, 0.36, 1)',
        position: 'relative',
      }}>
        <div style={{
          width: panelWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: expanded ? 1 : 0,
          transition: 'opacity 250ms ease',
          transitionDelay: expanded ? '160ms' : '0ms',
          boxSizing: 'border-box',
        }}>
          {/* scrollable region: title + meta + description */}
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              padding: '1.25rem 1.4rem 1rem 1.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              cursor: 'default',
            }}
          >
            <div style={{
              fontFamily: 'CustomRegularBold, serif',
              fontSize: '1.05rem',
              color: '#f5f5f5',
              lineHeight: 1.3,
            }}>
              {item.title}
            </div>
            <div style={{
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              color: '#888',
              fontSize: '0.72rem',
              fontFamily: 'CustomRegular, sans-serif',
              letterSpacing: '0.04em',
            }}>
              <span>{item.language}</span>
              <span style={{ color: '#444' }}>·</span>
              <span>{item.publication}</span>
              <span style={{ color: '#444' }}>·</span>
              <span>{item.date}</span>
            </div>
            <p style={{
              color: '#bbb',
              fontSize: '0.85rem',
              fontFamily: 'CustomRegular, serif',
              margin: '0.3rem 0 0 0',
              lineHeight: 1.6,
            }}>
              {item.description}
            </p>
          </div>

          {/* Read button — anchored, not part of scroll */}
          <div style={{
            flexShrink: 0,
            padding: '0.85rem 1.4rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: '#0a0a0a',
          }}>
            <a
              href={encodeURI(item.pdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                fontSize: '0.8rem',
                fontFamily: 'CustomRegularBold, sans-serif',
                letterSpacing: '0.04em',
                color: '#0a0a0a',
                background: '#f5f5f5',
                border: '1px solid #f5f5f5',
                borderRadius: '2px',
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Read
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Shelf({ section, expandedIds, toggleExpanded, isMobile }: {
  section: AcademicSection;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  isMobile: boolean;
}) {
  const sectionId = slug(section.title);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id={sectionId} style={{ scrollMarginTop: '5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.75rem',
        marginBottom: '0.4rem',
        padding: '0 0.25rem',
      }}>
        <h2 style={{
          fontFamily: 'CustomTitle, serif',
          fontSize: isMobile ? '1.4rem' : '1.7rem',
          color: '#f5f5f5',
          margin: 0,
        }}>
          {section.title}
        </h2>
        <span style={{
          color: '#777',
          fontSize: '0.72rem',
          fontFamily: 'CustomRegular, sans-serif',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {section.items.length} {section.items.length === 1 ? 'volume' : 'volumes'}
        </span>
      </div>
      <p style={{
        color: '#888',
        fontSize: '0.88rem',
        fontFamily: 'CustomRegular, serif',
        margin: '0 0 0.6rem 0.25rem',
      }}>
        {section.description}
      </p>

      {/* the shelf: scrolling row of widgets + thin white line underneath */}
      <div style={{ position: 'relative' }}>
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '1.25rem',
            overflowX: 'auto',
            overflowY: 'visible',
            padding: '12px 2px 18px 2px',
            scrollbarWidth: 'thin',
          }}
        >
          {section.items.map((item) => {
            const id = slug(item.title);
            return (
              <PaperWidget
                key={item.title}
                item={item}
                expanded={expandedIds.has(id)}
                onToggle={() => toggleExpanded(id)}
                isMobile={isMobile}
              />
            );
          })}
        </div>
        {/* thin white shelf line */}
        <div style={{
          height: '1px',
          background: '#ffffff',
          opacity: 0.55,
        }} />
      </div>
    </section>
  );
}

function Catalogue({ isMobile, onJump }: { isMobile: boolean; onJump: (id: string) => void }) {
  const total = useMemo(() => sections.reduce((s, x) => s + x.items.length, 0), []);
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '2px',
      padding: isMobile ? '1rem' : '1.25rem 1.5rem',
      marginBottom: '2.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '0.95rem',
      }}>
        <div style={{
          fontFamily: 'CustomTitle, serif',
          fontSize: isMobile ? '0.95rem' : '1.05rem',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: '#f5f5f5',
        }}>
          The Catalogue
        </div>
        <div style={{
          fontFamily: 'CustomRegular, sans-serif',
          fontSize: '0.7rem',
          color: '#777',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {total} entries · {sections.length} shelves
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : `repeat(${sections.length}, 1fr)`,
        gap: '0.5rem',
      }}>
        {sections.map((s) => {
          const id = slug(s.title);
          return (
            <button
              key={s.title}
              onClick={() => {
                onJump(id);
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                textAlign: 'left',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '2px',
                padding: '0.65rem 0.8rem',
                cursor: 'pointer',
                color: '#ddd',
                fontFamily: 'CustomRegular, serif',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.15rem',
                transition: 'background-color 0.18s ease, border-color 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <span style={{
                fontFamily: 'CustomRegularBold, serif',
                fontSize: '0.9rem',
                color: '#f5f5f5',
              }}>
                {s.title}
              </span>
              <span style={{
                fontSize: '0.68rem',
                color: '#777',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {s.items.length} {s.items.length === 1 ? 'volume' : 'volumes'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Academic() {
  const isMobile = useIsMobile();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{
      background: '#000000',
      minHeight: '100vh',
      padding: isMobile ? '1.5rem 1rem' : '3rem 3rem 6rem 3rem',
      color: '#f5f5f5',
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'CustomTitle, serif',
          fontSize: isMobile ? '2rem' : '2.6rem',
          color: '#f5f5f5',
          margin: 0,
        }}>
          Academic Writing Library
        </h1>
        <p style={{
          color: '#888',
          fontSize: isMobile ? '0.9rem' : '1rem',
          margin: '0.4rem 0 0 0',
          fontFamily: 'CustomRegular, serif',
        }}>
          A curated list of my publications, research, essays, articles, &c.
        </p>
      </header>

      <Catalogue isMobile={isMobile} onJump={() => {}} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {sections.map((section) => (
          <Shelf
            key={section.title}
            section={section}
            expandedIds={expandedIds}
            toggleExpanded={toggleExpanded}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}
