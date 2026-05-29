import { useIsMobile } from '../hooks/useIsMobile';

export default function BreakingNews() {
  const isMobile = useIsMobile();
  const px = isMobile ? '1rem' : '2rem';

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
        padding: `0.75rem ${px}`,
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
        padding: `1.5rem ${px} 0`,
        textAlign: 'center',
        borderBottom: '3px double #ffffff',
        paddingBottom: '1.25rem',
      }}>
        <div style={{
          fontFamily: 'var(--font-title, Georgia, serif)',
          fontSize: 'clamp(1.75rem, 6vw, 3.5rem)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 700,
          lineHeight: 1,
        }}>
          Arch User Tribune
        </div>
        <div style={{
          fontSize: '0.7rem',
          letterSpacing: isMobile ? '0.1em' : '0.2em',
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
        padding: `0.6rem ${px}`,
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
          flexShrink: 0,
        }}>
          Breaking News
        </span>
        <span style={{ fontSize: '0.7rem', opacity: 0.5, fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          ARCH LINUX &bull; COMMUNITY FALLOUT
        </span>
      </div>

      {/* Headline block */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: `${isMobile ? '1.5rem' : '2rem'} ${px} 0` }}>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 5vw, 3.25rem)',
          lineHeight: 1.15,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          margin: '0 0 1rem',
          color: '#ffffff',
        }}>
          Arch Linux, Once a Citadel of Open-Source Principle,
          Introduces Subscription Fees and a Bundled A.I. Chatbot,
          Igniting a Sweeping User Exodus
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.75)',
          margin: '0 0 1.25rem',
          fontStyle: 'italic',
        }}>
          The venerable Linux distribution, long prized among practitioners for its radical configurability
          and philosophical austerity, has pivoted sharply toward a commercial model that its most devoted
          adherents are calling an act of institutional betrayal.
        </p>

        {/* Byline */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.6rem' : '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.25)',
          padding: '0.6rem 0',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 600 }}>
            By Luna Maltseva
          </span>
          {!isMobile && <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', opacity: 0.5 }}>|</span>}
          <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', opacity: 0.6 }}>
            May 10, 2026, 08:43 UTC
          </span>
          {!isMobile && <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', opacity: 0.5 }}>|</span>}
          <span style={{ fontSize: '0.8rem', fontFamily: '"Helvetica Neue", Arial, sans-serif', opacity: 0.6 }}>
            2 min read
          </span>
        </div>
      </div>

      {/* Article body */}
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: `${isMobile ? '1.5rem' : '2rem'} ${px} 0`,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: isMobile ? '0' : '2.5rem',
        alignItems: 'start',
      }}>
        {/* Main column */}
        <div>
          {/* — PARAGRAPH 1 — */}
          <p style={bodyText}>
            SAN FRANCISCO — Arch Linux, the two-decade-old Linux distribution long venerated by
            computing professionals for its exacting minimalism and uncompromising commitment to user
            agency, announced on Saturday that it would impose a mandatory recurring subscription of
            $7.99 per month beginning with its May 2026 installation image — a measure the project's
            core maintainers described, in a brief communiqué posted to its official mailing list, as
            "a necessary step toward financial sustainability." The fee gates access to what the
            distribution has historically furnished without charge: package updates delivered through
            the{' '}
            <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem' }}>pacman</code>
            {' '}command-line utility, the sprawling Arch User Repository — commonly
            abbreviated the A.U.R., a community-maintained catalogue encompassing more than 80,000
            software packages — and the ability to configure and initialize a graphical desktop
            environment.
          </p>

          {/* — PARAGRAPH 2 — */}
          <p style={bodyText}>
            The announcement — posted without prior consultation to the project's governance forums at
            approximately 11:40 p.m. Pacific time on a Saturday, a disclosure timing that several
            longtime contributors noted bore the hallmarks of a decision the maintainers did not wish
            to invite broad deliberation of — arrived alongside a second revelation that proved, by
            most measures, the more incendiary of the two: the inclusion, also bundled by default
            into the base installation, of{' '}
            <em>ArchGPT-CE</em>, a large-language-model-powered
            conversational assistant that the maintainers described as "a friendly guide for new and
            experienced users alike." The motivation behind the dual announcements remains publicly
            unacknowledged by project leadership; observers within the open-source community have
            speculated, with varying degrees of charity, that the Arch maintainers drew inspiration
            from monetization pivots undertaken in recent years by enterprises including Red Hat,
            Canonical and, more distantly, Mozilla.
          </p>

          {/* Pull quote */}
          <blockquote style={{
            borderLeft: '4px solid #ffffff',
            margin: '2rem 0',
            padding: '0.75rem 1.5rem',
          }}>
            <p style={{
              fontSize: 'clamp(1.05rem, 2.5vw, 1.5rem)',
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
            The broader ramifications of the decision are, as of this writing, still crystallizing —
            though early indicators suggest a significant realignment within the Linux desktop
            ecosystem. StatCounter, a Dublin-based web analytics firm that approximates
            operating-system adoption through aggregated browser telemetry, recorded a measurable
            contraction in Arch Linux traffic within 72 hours of the announcement. DistroWatch, an
            index that tracks distribution popularity through weighted page-view counts, reported
            that Gentoo Linux and Void Linux — both occupying a philosophical niche adjacent to
            Arch's own, prizing manual configuration and a lean default footprint — had surged to
            their highest rankings since the index's founding in 2001. "We have provisioned 14
            additional servers in the last 48 hours," a Void Linux infrastructure volunteer wrote in
            a message to the project's IRC channel, appending, in what appeared to be a note of dry
            amusement, "We were not prepared for this."
          </p>
        </div>

        {/* Sidebar */}
        <aside style={{ marginTop: isMobile ? '1.5rem' : 0 }}>
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
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: `0 ${px}` }}>

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
            padding: isMobile ? '0.5rem' : '1rem',
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
            Fig. 1 &mdash; Linux desktop distribution market share, 2023&ndash;2026, as approximated
            by DistroWatch weighted page-view rankings. The precipitous decline of Arch Linux and the
            concurrent ascent of Gentoo, visible at the graph's right terminus, correspond to the
            period immediately following the May 2026 announcement. Source: DistroWatch; StatCounter.
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
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
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
