export default function BreakingNews() {
  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: 'calc(100vh - 150px)',
      color: '#ffffff',
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      padding: '2rem 0 4rem',
    }}>
      {/* Masthead */}
      <div style={{
        borderTop: '3px solid #ffffff',
        borderBottom: '1px solid #ffffff',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '960px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7 }}>
          Open Source · Technology · Satire
        </span>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.08em', opacity: 0.7 }}>
          May 10, 2026
        </span>
      </div>

      {/* Publication name */}
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '1.5rem 2rem 0',
        textAlign: 'center',
        borderBottom: '3px double #ffffff',
        paddingBottom: '1.25rem',
      }}>
        <div style={{
          fontFamily: 'var(--font-title, Georgia, serif)',
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 700,
          lineHeight: 1,
        }}>
          The Arch User Tribune
        </div>
        <div style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: '0.4rem',
          opacity: 0.6,
        }}>
          Est. 1991 &mdash; "we wrote this on arch, btw"
        </div>
      </div>

      {/* Section label */}
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0.6rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <span style={{
          background: '#ffffff',
          color: '#000000',
          fontSize: '0.65rem',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 700,
          padding: '0.2rem 0.55rem',
        }}>
          Breaking News
        </span>
        <span style={{ fontSize: '0.7rem', opacity: 0.5, fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          ARCH LINUX &bull; COMMUNITY FALLOUT
        </span>
      </div>

      {/* Headline block */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem 0' }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3.25rem)',
          lineHeight: 1.1,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          margin: '0 0 1rem',
          color: '#ffffff',
        }}>
          Arch Linux to Require a Monthly Subscription Fee;
          Users Declare the Distro "Spiritually Dead"
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.75)',
          margin: '0 0 1.25rem',
          fontStyle: 'italic',
          maxWidth: '700px',
        }}>
          The once-revered minimalist distribution upends its founding philosophy, triggering a mass exodus of
          the very users who built its legendary reputation.
        </p>

        {/* Byline */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.25)',
          padding: '0.6rem 0',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 600 }}>
            By Luna Maltseva
          </span>
          <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', opacity: 0.5 }}>|</span>
          <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', opacity: 0.6 }}>
            May 10, 2026, 08:43 UTC
          </span>
          <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', opacity: 0.5 }}>|</span>
          <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', opacity: 0.6 }}>
            2 min read
          </span>
        </div>
      </div>

      {/* Article body */}
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '2rem 2rem 0',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Main column */}
        <div>
          {/* — PARAGRAPH 1 — */}
          <p style={bodyText}>
            In a surprising move, the Arch Linux development team greenlit the inclusion of its
            <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem' }}>arch-monetize</code> 
            package in the base installation, introducing a mandatory monthly subscription fee of $7.99 to access baseline system functionality,
            such as system updates, access to the AUR, and desktop environment choice. The announcement, made on a Saturday evening with no prior community discussion, 
            has sent shockwaves through the Arch user base, many of whom have been vocal about their disapproval on forums and social media.
          </p>

          {/* — PARAGRAPH 2 — */}
          <p style={bodyText}>
            Many in the community are rightfully appaled and shocked: after all, Arch Linux's core principle has always been
            user-centricity. The motivation behind the move is still unclear, though it is suspected that Arch maintainers have
            drawn inspiration from other moves by giants in the tech industry.
          </p>

          {/* Pull quote */}
          <blockquote style={{
            borderLeft: '4px solid #ffffff',
            margin: '2rem 0',
            padding: '0.75rem 1.5rem',
          }}>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              lineHeight: 1.4,
              fontStyle: 'italic',
              margin: 0,
              color: '#ffffff',
            }}>
              "I did not spend seventeen years memorizing pacman flags so that a banner ad could
              tell me to buy deodorant."
            </p>
            <footer style={{
              fontSize: '0.75rem',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              marginTop: '0.6rem',
              opacity: 0.6,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              &mdash; Anonymous, Arch Linux forums
            </footer>
          </blockquote>

          {/* — PARAGRAPH 3 — */}
          <p style={bodyText}>
            The broader ramifications of this decision are yet unclear; it is, nonetheless, observed that many users have
            chosen to distance themselves from their former distribution of choice. Experts project that in the nearby future
            we will see a further increase in jumps to similar-to-Arch distributions, such as Gentoo and Void Linux. 
          </p>
        </div>

        {/* Sidebar */}
        <aside>
          {/* Context box */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontWeight: 700,
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              Context
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 0.75rem', opacity: 0.85 }}>
              Arch Linux, founded in 2002 by Judd Vinet, has long been the distro of choice for users
              who prefer to build their system from the ground up. Its guiding principle&mdash;simplicity,
              user-centrism, and zero hand-holding&mdash;attracted a fiercely loyal following.
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
              The new <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem' }}>arch-monetize</code> package
              and the bundled <em>ArchGPT-CE</em> assistant were pushed to the base install in the
              May 2026 ISO with no prior community vote.
            </p>
          </div>

          {/* Related links box */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '1.25rem',
          }}>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontWeight: 700,
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              Related
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                '"I Use Arch" Subreddit Changes Name to "I Used Arch"',
                'Gentoo Reports 800% Spike in New Installs',
                'void-linux.org Servers Buckle Under Traffic',
                'Linus Torvalds Seen Stress-Eating at a Kernel Summit',
              ].map((headline) => (
                <li key={headline} style={{
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  paddingBottom: '0.6rem',
                  opacity: 0.8,
                }}>
                  {headline}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Continued body — full width below the grid */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Second pull quote */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.3)',
          padding: '1.25rem 0',
          margin: '2rem 0',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            fontStyle: 'italic',
            lineHeight: 1.4,
            margin: '0 0 0.5rem',
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            "The chatbot suggested that 'Windows 11 is waiting.'
             Who thought this was a good idea?"
          </p>
          <span style={{
            fontSize: '0.7rem',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.55,
          }}>
            &mdash; Thread on the Arch Linux mailing list, May 9, 2026
          </span>
        </div>

        {/* — PARAGRAPH 5 — */}
        <p style={bodyText}>
          {/* Write your fifth paragraph here */}
        </p>

        {/* — PARAGRAPH 6 — */}
        <p style={bodyText}>
          {/* Write your sixth paragraph here */}
        </p>

        {/* Market share image */}
        <figure style={{ margin: '2.5rem 0' }}>
          <div style={{
            border: '1px solid rgba(255,255,255,0.25)',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
          }}>
            <img
              src="/linux_marketshare_slopegraph.png"
              alt="Linux desktop market share slope graph showing Arch Linux decline"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <figcaption style={{
            fontSize: '0.78rem',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.5,
            marginTop: '0.6rem',
            opacity: 0.6,
            fontStyle: 'italic',
          }}>
            Fig. 1 &mdash; Linux desktop market share by distribution, 2018&ndash;2026. Arch Linux's
            precipitous decline in May 2026 is visible at the far right of the graph.
            Source: StatCounter, DistroWatch weighted rankings.
          </figcaption>
        </figure>

        {/* — PARAGRAPH 7 — */}
        <p style={bodyText}>
          {/* Write your closing paragraph here */}
        </p>

        {/* Article footer */}
        <div style={{
          borderTop: '3px double #ffffff',
          marginTop: '3rem',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              opacity: 0.5,
              marginBottom: '0.35rem',
            }}>
              Filed under
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Arch Linux', 'Open Source', 'Satire', 'AI', 'Community'].map((tag) => (
                <span key={tag} style={{
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  opacity: 0.7,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            opacity: 0.4,
            fontStyle: 'italic',
            alignSelf: 'flex-end',
          }}>
            The Arch User Tribune is a satirical publication. Any resemblance to actual events is
            purely intentional and also extremely funny.
          </div>
        </div>
      </div>
    </div>
  );
}

const bodyText: React.CSSProperties = {
  fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
  lineHeight: 1.85,
  color: '#ffffff',
  margin: '0 0 1.4rem',
  textAlign: 'justify',
  hyphens: 'auto',
};
