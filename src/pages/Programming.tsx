import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface Project {
  id: string;
  title: string;
  titleType: 'text' | 'image';
  titleFont?: string;
  titleSize?: string;
  titleImageUrl?: string;
  description: string;
  date: string;
  language: string;
  backgroundImage: string;
  githubUrl: string;
}

const projects: Project[] = [
  {
    id: 'artemis-data-science',
    title: 'ARTeMiS',
    titleType: 'image',
    titleImageUrl: 'https://i.postimg.cc/nzK4HBfr/artemis.png',
    description: 'A data science group project for the MAT-395 course at AUCA. Contains source code, data analysis pipelines, and visualizations including correlation analysis, distribution studies, diversity metrics, and polynomial regression models.',
    date: '2025',
    language: 'Python',
    backgroundImage: 'https://i.postimg.cc/mr1h4HFG/model-render.png',

    githubUrl: 'https://github.com/lunamaltseva/ARTeMiS-Data-Science',
  },
  {
    id: 'borderline',
    title: 'Borderline',
    titleType: 'image',
    titleImageUrl: 'https://i.postimg.cc/YCqbdpLF/borderline.png',
    description: 'A puzzle-esque dungeon crawler set on a chess board. Players complete five levels by collecting keys, avoiding enemies, and reaching exits before a move counter expires. Features three-life system, smooth animations, and a narrative with an opening sequence and climactic dialogue.',
    date: '2025',
    language: 'C++',
    backgroundImage: 'https://raw.githubusercontent.com/lunamaltseva/borderline/master/screenshots/game.png',

    githubUrl: 'https://github.com/lunamaltseva/borderline',
  },
  {
    id: 'catastrophic',
    title: 'Catastrophic',
    titleType: 'image',
    titleImageUrl: 'https://raw.githubusercontent.com/lunamaltseva/catastrophic/main/data/screenshots/title.png',
    description: 'An object-oriented Sokoban implementation featuring a post-apocalyptic narrative. Follow an undertaker\'s cat completing burial tasks across levels, with the story\'s ending determined by player performance. Features undo functionality, dynamic visual feedback, and three narrative endings.',
    date: '2025',
    language: 'C++',
    backgroundImage: 'https://raw.githubusercontent.com/lunamaltseva/catastrophic/main/data/screenshots/gameplay.png',

    githubUrl: 'https://github.com/lunamaltseva/catastrophic',
  },
  {
    id: 'rockstar-advanced',
    title: 'Rockstar',
    titleType: 'text',
    titleFont: 'var(--font-title)',
    description: 'A graphics application built with C++ featuring custom rendering, track design, and asset management. Utilizes raylib for graphics rendering and vcpkg for dependency management.',
    date: '2025',
    language: 'C++',
    backgroundImage: 'https://raw.githubusercontent.com/lunamaltseva/rockstar-advanced/master/data/textures/footage.png',
    githubUrl: 'https://github.com/lunamaltseva/rockstar-advanced',
  },
  {
    id: 'platformer-level-editor',
    title: 'Platformer Level Editor',
    titleType: 'text',
    titleFont: 'var(--font-title)',
    titleSize: '2.5rem',
    description: 'An interactive level editor for a platformer game built with Qt6 framework. Features grid-based editing with sprite tile placement, drag-placing, undo functionality, multi-level handling, and export to RLE-encoded level files.',
    date: '2025',
    language: 'C++',
    backgroundImage: 'https://i.imgur.com/UAmqni6.png',

    githubUrl: 'https://github.com/lunamaltseva/platformer-level-editor-final',
  },
];

function ProjectNavbar({
  projects: navProjects,
  activeIndex,
  onSelect,
  isMobile,
}: {
  projects: Project[];
  activeIndex: number;
  onSelect: (index: number) => void;
  isMobile: boolean;
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el && navRef.current) {
      const nav = navRef.current;
      const scrollLeft = el.offsetLeft - nav.offsetWidth / 2 + el.offsetWidth / 2;
      nav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeIndex]);

  return (
    <div style={{
      position: 'fixed',
      top: '5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      width: isMobile ? 'calc(100% - 1.5rem)' : 'calc(100% - 4rem)',
      maxWidth: '1200px',
    }}>
      <div
        ref={navRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: 'rgba(20, 20, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '0.75rem',
          border: '1px solid #333',
          padding: '0.35rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {/* Left arrow */}
        <button
          onClick={() => onSelect((activeIndex - 1 + navProjects.length) % navProjects.length)}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Project titles */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          gap: '0.25rem',
          overflowX: isMobile ? 'auto' : 'visible',
          scrollbarWidth: 'none',
        }}>
          {navProjects.map((project, index) => (
            <button
              key={project.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              onClick={() => onSelect(index)}
              style={{
                flexShrink: 0,
                padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: index === activeIndex ? '#333' : 'transparent',
                color: index === activeIndex ? '#fff' : '#888',
                fontFamily: 'var(--font-primary)',
                fontSize: isMobile ? '0.75rem' : '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (index !== activeIndex) {
                  e.currentTarget.style.color = '#ccc';
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== activeIndex) {
                  e.currentTarget.style.color = '#888';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {project.title}
            </button>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => onSelect((activeIndex + 1) % navProjects.length)}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ProjectPage({ project, isMobile }: { project: Project; isMobile: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
    setImageLoaded(false);
  }, [project.id]);

  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#000000',
      minHeight: 'calc(100vh - 150px)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: isMobile ? '1.5rem' : '3rem',
      overflow: 'hidden',
    }}>
      {/* Background image */}
      {project.backgroundImage && (
        <img
          src={project.backgroundImage}
          alt=""
          onLoad={() => setImageLoaded(true)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '95%' : '75%',
            height: isMobile ? '60%' : '75%',
            objectFit: 'contain',
            zIndex: 0,
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60%',
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 50%, transparent 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ maxWidth: isMobile ? '100%' : '600px', position: 'relative', zIndex: 2 }}>
        {/* Title */}
        {project.titleType === 'image' && project.titleImageUrl ? (
          <img
            src={project.titleImageUrl}
            alt={project.title}
            style={{
              maxHeight: isMobile ? '80px' : '120px',
              maxWidth: isMobile ? '250px' : '400px',
              marginBottom: '1.5rem',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
            }}
          />
        ) : (
          <h1 style={{
            fontFamily: project.titleFont || 'var(--font-title)',
            fontSize: isMobile ? '2rem' : (project.titleSize || '3.5rem'),
            color: '#ffffff',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
          }}>
            {project.title}
          </h1>
        )}

        {/* Meta info */}
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
            fontSize: isMobile ? '0.9rem' : '1rem',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d3d3d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{project.date}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#d3d3d3',
            fontSize: isMobile ? '0.9rem' : '1rem',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d3d3d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>{project.language}</span>
          </div>
        </div>

        {/* Description */}
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
            textOverflow: 'ellipsis',
          }}
        >
          {project.description}
        </p>

        {/* GitHub button */}
        <a
          href={project.githubUrl}
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
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );
}

export default function Programming() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();

  return (
    <div style={{ position: 'relative' }}>
      <ProjectNavbar
        projects={projects}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        isMobile={isMobile}
      />
      <ProjectPage project={projects[activeIndex]} isMobile={isMobile} />
    </div>
  );
}
