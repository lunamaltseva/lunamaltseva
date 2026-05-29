import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useIsMobile } from '../hooks/useIsMobile';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

function PdfPreview({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdf = await pdfjsLib.getDocument(encodeURI(url)).promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const desiredWidth = 140;
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
        // PDF not found or failed to load — leave canvas blank
      }
    }

    render();
    return () => { cancelled = true; };
  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '70px',
        height: '90px',
        borderRadius: '0.25rem',
        border: '1px solid #333',
        backgroundColor: '#1e1e1e',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    />
  );
}

interface AcademicItem {
  title: string;
  language: string;
  publication: string;
  date: string;
  description: string;
  pdfUrl: string;
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
        title: 'PEDAGOGICAL FOUNDATIONS OF ENSURING CYBERSECURITY OF SCHOOLCHILDREN IN THE CONTEXT OF DIGITAL TRANSFORMATION OF EDUCATION',
        language: 'Russian',
        publication: 'ALATOO ACADEMIC STUDIES',
        date: 'January 2026',
        description: 'The article examines the theoretical and pedagogical foundations for developing a culture of cybersecurity among schoolchildren in the context of the digital transformation of education. It substantiates the need to incorporate issues of digital and information security into the content of general education. The key pedagogical approaches, methods, and conditions that ensure the formation of safe and responsible student behavior in the digital environment are analyzed. A model for ensuring students\' cybersecurity is presented, outlining the stages of cybersecurity development—from defining the goal to achieving the final outcome. Special attention is given to the role of pedagogical support, the improvement of teachers\' digital literacy, and the creation of an educational environment aimed at fostering students\' competence in the field of cybersecurity. Practical recommendations for improving the student cybersecurity system are provided. The material offers a conceptual analysis and synthesis of current pedagogical approaches.',
        pdfUrl: '/PEDAGOGICAL FOUNDATIONS OF ENSURING CYBERSECURITY.pdf',
      },
      {
        title: 'Grant Program Result Prediction: a Real-Time Management System to Estimate Results for a Given Budget',
        language: 'English',
        publication: 'AUCA Digital Repository',
        date: 'December 2026',
        description: 'The integration of ARTeMiS by AUCA\'s Center for Civic Engagement (CCE) as a management system for their Student Initiative Development Program (SIDP) grant program landmarks a steep increase in the SIDP Committee Members\' ability to make data-driven judgement calls. However, the system can be further improved by providing forecasts of the potential impact each project will have, wherefrom arises the need for a grant result program prediction. This paper will use regression, data mining, and dynamic programming to estimate the optimal allocation of budget to yield maximal impact.',
        pdfUrl: '/Grant Program Result Prediction.pdf',
      },
    ],
  },
  {
    title: 'Research Papers',
    description: 'In-depth research on various topics.',
    items: [
      {
        title: 'Harmony or Hegemony: A Study of the Overwhelming Approval of the Social Credit System by Chinese Citizens',
        language: 'English',
        publication: 'Course: China\'s Foreign Policy',
        date: 'December 2024',
        description: 'Despite the diabolical portrayal the Chinese Social Credit System (SCS) received in Western democratic media, recent surveys have shown that less than one percent of Chinese citizens disapprove of the SCS. To find the grassroots of this astounding statistic, this paper delves into Chinese culture, exploring its notion of privacy and civil ideals, as well as analyzing Chinese history, the Chinese crisis of trust, and the radical steps the Chinese Communist Party has taken to bring the situation under control. This paper will argue that Chinese citizens overwhelmingly approve of the SCS because of the Chinese Communist Party\'s media control, social deterrence, and authority.',
        pdfUrl: '/Harmony or Hegemony.pdf',
      },
      {
        title: 'Reception of Yeats’s “Sailing to Byzantium” Among College Students',
        language: 'English',
        publication: 'Course: Critical Approaches in Modern Media',
        date: 'May 2026',
        description: 'Per Lüdtke, poetry is traditionally a medium with a great amount of interpretative variability between readers (2014). The root cause of this phenomenon, often referred to by reception theorists as “hermeneutic depth,” is especially heightened in the case of “Sailing to Byzantium,” where the viscosity of the lines makes the task of interpretation almost insurmountable to an inexperienced reader. Because of that, it is sometimes said that poetry is an acquired pleasure, one which young people lack the introspective capacity to appreciate. The accuracy of this statement can be put to test. This paper will address the following question: How do college students understand such a complex work of poetry as “Sailing to Byzantium”? This paper will apply reception theory to a series of four interviews with college students to argue that while college students are able to make sense of complex texts, that limited understanding hinges on their familiarity with critical analysis and social institutions.',
        pdfUrl: '/STB Analysis.pdf',
      },
    ],
  },
  {
    title: 'Essays',
    description: 'Long-form analytical and expository writing.',
    items: [
      {
        title: 'Semiotic Analysis of Christopher Nolan’s “The Odyssey” Preliminary Movie Poster',
        language: 'English',
        publication: 'Course: Critical Approaches in Modern Media',
        date: 'March 2026',
        description: 'The Odyssey is a notoriously difficult work to capture on film. Said to have been orally composed around 7th century BCE by Homer, the epic is counted as one of the most influential works of literature of all time. The narrative is built around Odysseus, a hero of the Trojan war, and his 9-year-long journey back home. Yet it is not the volume of myths that renders the work gruesome to depict: it is the non-linear and asynchronous development of the storylines across its 24 books that makes it impossible to reinstate the epic in a big screen movie. In spite of that, Christopher Nolan, a director and Hollywood staple renowned for many of his exceptional films, will debut his “A-Budget Hollywood,” highly-anticipated rendition in cinemas across the world in the summer of 2026. Using semiotic analysis, this paper will argue that Christopher Nolan’s The Odyssey poster depicts a scene from Book 11 of Homer’s The Odyssey from the perspective of King Agamemnon.',
        pdfUrl: '/Odyssey Poster Analysis.pdf',
      },
      {
        title: 'The Antique and the Modern Promethies',
        language: 'English',
        publication: 'Course: First Year Seminar I',
        date: 'December 2023',
        description: 'Both Prometheus and Frankenstein were oblivious of their mortal status, and deserve punishment from their superiors precisely for their repeated, arrogant, and inconsiderate attempts of grandeur. The essay delves into the predicaments one is "funneled into" by fate, and whether the individuals themselves can be held accountable for their actions. With thorough and rigorous examination of the conditions Prometheus and Victor Frankenstein "discover" themselves in, this essay definitively asserts that encountering repercussions from others as a result of one\'s recklessness is not only justified, but deserved.',
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
    description: 'Opinion pieces, mock-journalistic articles, and misc.',
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
        publication: 'The Newstar - Rejected [Due to Being "Too Critical"]',
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

function ItemCard({ item, id, highlighted, expanded, onToggle, isMobile }: { item: AcademicItem; id?: string; highlighted?: boolean; expanded: boolean; onToggle: () => void; isMobile: boolean }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(24);

  useEffect(() => {
    if (contentRef.current) {
      if (expanded) {
        setContentHeight(contentRef.current.scrollHeight);
      } else {
        const fullHeight = contentRef.current.scrollHeight;
        setContentHeight(fullHeight);
        setTimeout(() => {
          setContentHeight(24);
        }, 10);
      }
    }
  }, [expanded]);

  return (
    <div id={id} style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      backgroundColor: highlighted ? '#1a1a1a' : '#141414',
      borderRadius: '0.75rem',
      border: highlighted ? '2px solid #888' : '1px solid #222',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: highlighted ? '0 0 20px rgba(136, 136, 136, 0.3)' : 'none',
    }}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: isMobile ? '1rem' : '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <h3 style={{
          fontFamily: 'CustomRegularBold, sans-serif',
          fontSize: isMobile ? '1rem' : '1.15rem',
          color: '#ffffff',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: expanded ? 'normal' : 'nowrap',
          transition: 'all 0.3s ease',
        }}>
          {item.title}
        </h3>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          color: '#888',
          fontSize: '0.85rem',
          flexWrap: 'wrap',
        }}>
          <span>{item.language}</span>
          <span style={{ color: '#444' }}>·</span>
          <span>{item.publication}</span>
          <span style={{ color: '#444' }}>·</span>
          <span>{item.date}</span>
        </div>
        <div
          ref={contentRef}
          style={{
            maxHeight: `${contentHeight}px`,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
          }}
        >
          <p style={{
            color: '#aaa',
            fontSize: '0.9rem',
            margin: '0.4rem 0 0 0',
            lineHeight: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: expanded ? 'normal' : 'nowrap',
          }}>
            {item.description}
          </p>
        </div>
      </div>

      {!isMobile && (
        <div style={{
          width: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 0.5rem',
          flexShrink: 0,
        }}>
          <PdfPreview url={item.pdfUrl} />
        </div>
      )}

      <a
        href={encodeURI(item.pdfUrl)}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: isMobile ? '0.75rem 1rem' : '0 1.5rem',
          borderLeft: isMobile ? 'none' : '1px solid #222',
          borderTop: isMobile ? '1px solid #222' : 'none',
          color: '#ffffff',
          fontSize: '0.95rem',
          textDecoration: 'none',
          flexShrink: 0,
          transition: 'background-color 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e1e1e'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        Read
      </a>
    </div>
  );
}

export default function Academic() {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState(sections[0].title);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ids = sections.map((s) => s.title.toLowerCase().replace(/\s+/g, '-'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const section = sections.find(
              (s) => s.title.toLowerCase().replace(/\s+/g, '-') === entry.target.id,
            );
            if (section) setActiveSection(section.title);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (!isNavigatingRef.current) {
        setHighlightedId(null);
        setActiveItemId(null);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function navigateTo(id: string, isSection: boolean = false) {
    isNavigatingRef.current = true;
    setHighlightedId(id);

    if (isSection) {
      setActiveItemId(null);
    } else {
      setActiveItemId(id);
    }

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  }

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      padding: isMobile ? '1.5rem' : '3rem 3rem 3rem 5rem',
      display: 'flex',
      gap: isMobile ? '0' : '3rem',
      flexDirection: isMobile ? 'column' : 'row',
    }}>
      {/* Sidebar nav - hidden on mobile */}
      {!isMobile && (
        <nav style={{
          position: 'fixed',
          top: '6rem',
          left: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          borderRight: '1px solid #222',
          paddingRight: '1.5rem',
          zIndex: 10,
          maxHeight: 'calc(100vh - 8rem)',
          overflowY: 'auto',
        }}>
          {sections.map((section) => {
            const sectionId = section.title.toLowerCase().replace(/\s+/g, '-');
            const isSectionActive = highlightedId
              ? (highlightedId === sectionId && !activeItemId)
              : (activeSection === section.title && !activeItemId);
            return (
              <div key={section.title} style={{ display: 'flex', flexDirection: 'column' }}>
                <a
                  href={`#${sectionId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(sectionId, true);
                  }}
                  style={{
                    color: isSectionActive ? '#ffffff' : '#666',
                    fontSize: '0.9rem',
                    fontFamily: 'CustomRegularBold, sans-serif',
                    textDecoration: 'none',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '0.25rem',
                    backgroundColor: isSectionActive ? '#1a1a1a' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSectionActive) e.currentTarget.style.color = '#aaa';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSectionActive) e.currentTarget.style.color = '#666';
                  }}
                >
                  {section.title}
                </a>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.15rem' }}>
                  {section.items.map((item) => {
                    const itemId = `${sectionId}-${item.title.toLowerCase().replace(/\s+/g, '-')}`;
                    const isItemActive = activeItemId === itemId;
                    return (
                      <a
                        key={item.title}
                        href={`#${itemId}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo(itemId);
                        }}
                        style={{
                          color: isItemActive ? '#ffffff' : '#555',
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          padding: '0.2rem 0.75rem 0.2rem 1.5rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '160px',
                          backgroundColor: isItemActive ? '#1a1a1a' : 'transparent',
                          borderRadius: '0.25rem',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isItemActive) e.currentTarget.style.color = '#aaa';
                        }}
                        onMouseLeave={(e) => {
                          if (!isItemActive) e.currentTarget.style.color = '#555';
                        }}
                      >
                        {item.title}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      )}

      <div style={{ flex: 1, minWidth: 0, marginLeft: isMobile ? '0' : '180px' }}>
        <h1 style={{
          fontFamily: 'CustomTitle, sans-serif',
          fontSize: isMobile ? '2rem' : '2.5rem',
          color: '#ffffff',
          margin: '0 0 0.5rem 0',
        }}>
          Academic Writing
        </h1>
        <p style={{
          color: '#888',
          fontSize: isMobile ? '0.95rem' : '1.05rem',
          margin: '0 0 3rem 0',
        }}>
          A collection of publications, research papers, essays, and opinions.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {sections.map((section) => (
            <div key={section.title} id={section.title.toLowerCase().replace(/\s+/g, '-')} style={{
              borderLeft: highlightedId === section.title.toLowerCase().replace(/\s+/g, '-') ? '3px solid #888' : '3px solid transparent',
              paddingLeft: '0.75rem',
              transition: 'all 0.3s ease',
              backgroundColor: highlightedId === section.title.toLowerCase().replace(/\s+/g, '-') ? 'rgba(136, 136, 136, 0.05)' : 'transparent',
              borderRadius: '0.5rem',
            }}>
              <h2 style={{
                fontFamily: 'CustomRegularBold, sans-serif',
                fontSize: '1.3rem',
                color: '#ffffff',
                margin: '0 0 0.25rem 0',
              }}>
                {section.title}
              </h2>
              <p style={{
                color: '#666',
                fontSize: '0.9rem',
                margin: '0 0 1rem 0',
              }}>
                {section.description}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '0.75rem',
              }}>
                {section.items.map((item, itemIndex) => {
                  const sectionId = section.title.toLowerCase().replace(/\s+/g, '-');
                  const itemId = `${sectionId}-${item.title.toLowerCase().replace(/\s+/g, '-')}`;
                  const rowIndex = isMobile ? itemIndex : Math.floor(itemIndex / 2);
                  const rowKey = `${sectionId}-row-${rowIndex}`;
                  const isExpanded = expandedRows.has(rowKey);

                  const toggleRow = () => {
                    setExpandedRows(prev => {
                      const next = new Set(prev);
                      if (next.has(rowKey)) {
                        next.delete(rowKey);
                      } else {
                        next.add(rowKey);
                      }
                      return next;
                    });
                  };

                  return (
                    <ItemCard
                      key={item.title}
                      item={item}
                      id={itemId}
                      highlighted={highlightedId === itemId}
                      expanded={isExpanded}
                      onToggle={toggleRow}
                      isMobile={isMobile}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
