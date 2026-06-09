import { useIsMobile } from '../hooks/useIsMobile';

export default function NotFound() {
  const isMobile = useIsMobile();

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: 'calc(100vh - 120px)',
      padding: isMobile ? '1.5rem' : '3rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-title)',
        fontWeight: 700,
        fontSize: isMobile ? '4rem' : '6rem',
        color: '#ffffff',
        margin: '0 0 1rem 0',
        lineHeight: 1,
      }}>
        404
      </h1>
      <p style={{
        fontFamily: 'var(--font-primary)',
        fontSize: isMobile ? '1rem' : '1.15rem',
        color: '#d4d0c8',
        margin: '0 0 2rem 0',
        maxWidth: '32rem',
        lineHeight: 1.6,
      }}>
        This web page doesn't exist&hellip; yet.
      </p>
      <a
        href="/"
        style={{
          fontFamily: 'var(--font-primary)',
          color: '#ffffff',
          fontSize: '0.95rem',
          padding: '0.6rem 1.25rem',
          border: '1px solid #ffffff',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#000000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#ffffff';
        }}
      >
        Back home
      </a>
    </div>
  );
}
