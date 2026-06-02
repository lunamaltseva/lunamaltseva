import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface PoemExcerpt {
  before: string;
  highlight: string[];
  after: string;
}

interface FavoriteLink {
  label: string;
  url: string;
}

interface FavoriteEntry {
  rank: number;
  title: string;
  meta: { label: string; value: string }[];
  description: string;
  excerpt?: PoemExcerpt;
  spotify?: string;
  link?: FavoriteLink;
}

interface FavoriteSection {
  id: string;
  title: string;
  count: string;
  description: string;
  entries: FavoriteEntry[];
}

// Each entry below is fully explicit: fill in the strings, add/remove
// highlight lines, and set artwork image URLs as needed.

const sections: FavoriteSection[] = [
  {
    id: 'poetry',
    title: 'Poetry',
    count: 'Top 5',
    description: 'But such a form as grecian goldsmiths make...',
    entries: [
      {
        rank: 1,
        title: 'The Love Song of J. Alfred Prufrock',
        link: { label: 'Read the full poem', url: '' },
        meta: [
          { label: 'Poet', value: 'T. S. Eliot' },
          { label: 'Year', value: '1911' },
        ],
        excerpt: {
          before: 'Senza tema d’infamia ti rispondo.',
          highlight: [
            'Let us go then, you and I,',
            'When the evening is spread out against the sky',
            'Like a patient etherized upon a table;',
            'Let us go, through certain half-deserted streets,',
            'The muttering retreats',
            'Of restless nights in one-night cheap hotels',
            'And sawdust restaurants with oyster-shells:',
            'Streets that follow like a tedious argument',
            'Of insidious intent',
            'To lead you to an overwhelming question ...',
            ' ',
            'Oh, do not ask, “What is it?”',
            'Let us go and make our visit.',
          ],
          after: 'In the room the women come and go',
        },
        description: 'The Love Song of J. Alfred Prufork is the longest poem I know is the longest poem I know to date – all 1\'100 words. It takes 5m 30s to fully recite. Despite that, it only took me three days to fully memorize it. I reference the poem a lot—be that in discussions, lectures, or even Thezeraine. The poem to me symbolizes being torn between things, unable to separate extremity from reality, leaving the narrator forever at the crossroads until that place of indecision ceases to be.',
      },
      {
        rank: 2,
        title: 'Sailing to Byzantium',
        link: { label: 'Read the full poem', url: '' },
        meta: [
          { label: 'Poet', value: 'William Butler Yeats' },
          { label: 'Year', value: '1926' },
        ],
        excerpt: {
          before: 'Into the artifice of eternity.',
          highlight: [
            'IV',
            ' ',
            'Once out of nature I shall never take',
            'My bodily form from any natural thing,',
            'But such a form as Grecian goldsmiths make',
            'Of hammered gold and gold enamelling',
            'To keep a drowsy Emperor awake;',
            'Or set upon a golden bough to sing',
            'To lords and ladies of Byzantium',
            'Of what is past, or passing, or to come.',

          ],
          after: '',
        },
        description: 'Sailing to Byzantium is a complicated one. It is true that I love the poem very much, but it seems like that love for it is not something my peers can understand. The reason for that being the fourth stanza—if I ever were to be a valedictorian, that would be the stanza I would read. Yet it is, nonetheless, a case of insider baseball—I have even conducted interviews on the reception of STB, and not a single participant was able to fully infer the poem. You may, by the way, read the research paper in the Works > Academic section.',
      },
      {
        rank: 3,
        title: 'Ulysses',
        link: { label: 'Read the full poem', url: '' },
        meta: [
          { label: 'Poet', value: 'Alfred, Lord Tennyson' },
          { label: 'Year', value: '1833' },
        ],
        excerpt: {
          before: 'And see the great Achilles, whom we knew.',
          highlight: [
            'Tho\' much is taken, much abides; and tho\'',
            'We are not now that strength which in old days',
            'Moved earth and heaven, that which we are, we are;',
            'One equal temper of heroic hearts,',
            'Made weak by time and fate, but strong in will',
            'To strive, to seek, to find, and not to yield.',
          ],
          after: '',
        },
        description: 'I have first read The Odyssey when I was 18. Admittedly, I have memorized Ulysses before that. There was a time when Ulysses was my favorite poem, and a time when I would recite the prayer as the bible. The poem, to me, has always been a consolation in times when looking for a brighter future was a matter of survival. And though I have a soft spot for this poem in particular, I prefer to sideline it as of late.',
      },
      {
        rank: 4,
        title: 'Dulce et Decorum Est',
        link: { label: 'Read the full poem', url: '' },
        meta: [
          { label: 'Poet', value: 'Wilfred Owen' },
          { label: 'Year', value: '1920' },
        ],
        excerpt: {
          before: 'Of vile, incurable sores on innocent tongues,—',
          highlight: [
            'My friend, you would not tell with such high zest',
            'To children ardent for some desperate glory,',
            'The old Lie: Dulce et decorum est',
          ],
          after: 'Pro patria mori.',
        },
        description: 'There is some charm to unlocking an emotional telling of a particular poetry piece. The poems above this one all evoke an emotional response, in one form or another. What sets apart Dulce et Decorum Est from the rest, then, is that it is, in other senses, an ordinary poem. It is just that I, in reciting it, have realized that you can build up during the final stanza until you are screaming "To children ardent for some [!!!] desperate glory,".',
      },
      {
        rank: 5,
        title: 'Незнакомка',
        link: { label: 'Read the full poem', url: '' },
        meta: [
          { label: 'Poet', value: 'А. Блок' },
          { label: 'Year', value: '1906' },
        ],
        excerpt: {
          before: 'И очарованную даль.',
          highlight: [
            'Глухие тайны мне поручены,',
            'Мне чье-то солнце вручено,',
            'И все души моей излучины',
            'Пронзило терпкое вино.',
            ],
          after: 'И перья страуса склоненные',
        },
        description: 'I\'m not sure why I like Blok\'s Stranger so much. Might it be that I translated it, twice? Might it be I relate to the last three stanzas? One thing I can\'t deny, though; of all Russian poets, I love Blok most of all.',
      },
    ],
  },
  {
    id: 'books',
    title: 'Books',
    count: 'Top 3',
    description: 'The three books I adore most.',
    entries: [
      {
        rank: 1,
        title: 'Shōgun',
        link: { label: 'Find the book', url: '' },
        meta: [
          { label: 'Author', value: 'James Clavell' },
          { label: 'Year', value: '1975' },
          { label: 'Genre', value: 'Novel, Historical Fiction' },
          { label: 'Pages', value: '1125 pages' },
        ],
        description: 'I hate that Shōgun is my favorite book. I loved Shōgun so much I watched the TV series—it sucked. I loved Shōgun so much I read its tangential sequel, Gai-jin (which, by the way, is also 1100 pages)—it also sucked. The painful part of Shōgun is that whenever I mention it, no one has a clue what I\'m talking about—so I have to find a roundabout way of saying that I am not, contrary to the title, a nincompoop who cannot handle a thick paperback and so resort to manga and comics, or a combination of the two. The delightful part of Shōgun, however, is the plot. It is true that it has a slow start, but I do not think I have ever before cried because of what happened to a character. Shōgun made enamored with a cleaner, in some ways simpler, way of life. Yet I cannot recommend that anyone actually read this book, because then, you and I will be in the same predicament of others having no clue why we love this book about feudal Japan so much.',
      },
      {
        rank: 2,
        title: 'War and Peace',
        link: { label: 'Find the book', url: '' },
        meta: [
          { label: 'Author', value: 'Leo Tolstoy' },
          { label: 'Year', value: '1867' },
          { label: 'Genre', value: 'Novel, Historical Fiction, Romance, Philosophy' },
          { label: 'Pages', value: '2043 pages' },
        ],
        description: 'I know, I know. I am extremely original for having War and Peace as one of my favorite books of all time—but it is a great book. While I will always crash out that Tolstoy spends 60 pages talking about how Moscow is very much like a bee nest when Napoleon invades, I cannot deny that the narrative he built and the analysis that he performs is extremely sophisticated and worth reading just for that. I will admit, Shōgun is inferior to War and Peace, despite the two sharing overlapping similarities, but Shōgun is an easier and more enjoyable read than War and Peace.',
      },
      {
        rank: 3,
        title: 'The Glass Bead Game',
        link: { label: 'Find the book', url: '' },
        meta: [
          { label: 'Author', value: 'Hermann Hesse' },
          { label: 'Year', value: '1943' },
          { label: 'Genre', value: 'Novel, Science Fiction, Philosophy' },
          { label: 'Pages', value: '558 pages' },
        ],
        description: 'I promise I am not trying to cram the most sophisticated books that I have read into my favorites\' list. That said, The Glass Bead Game is known for being notoriously hard to understand. While it may be that the story of Knecht is not of extreme interest to many, Hesse\'s magnum opus is deeply self-reflective, and offers much guidance to a younger mind—which I was, at a time when I read it. Would I recommend it? Yeah, I would.',
      },
    ],
  },
  {
    id: 'movies',
    title: 'Movies',
    count: 'Top 3',
    description: 'Of all the movies, in all the times, in all the cultures, she chose these three.',
    entries: [
      {
        rank: 1,
        title: 'Project Hail Mary',
        link: { label: 'Learn more', url: '' },
        meta: [
          { label: 'Director', value: 'Phil Lord, Chris Miller' },
          { label: 'Year', value: '2026' },
          { label: 'Genre', value: 'Sci-fi, Drama, Adventure' },
          { label: 'Runtime', value: '2h 36m' },
        ],
        description: 'I\'m not fond of Harry Styles, but I have added Sign of the Times to my liked songs on Spotify. It is true that Project Hail Mary has flaws. Yet it is also quite funny and hopeful. When Ryan Gosling was doing his monologue on SNL a few weeks prior to the release of Project Hail Mary, he said that people compare it to Interstellar meets E.T.; I disagree. For I have seen both movies, and Project Hail Mary is, with certainty, my favorite between the two.',
      },
      {
        rank: 2,
        title: 'Casablanca',
        link: { label: 'Learn more', url: '' },
        meta: [
          { label: 'Director', value: 'Michael Curtiz' },
          { label: 'Year', value: '1942' },
          { label: 'Genre', value: 'Romance, War, Action, Drama' },
          { label: 'Runtime', value: '1h 42m' },
        ],
        description: 'What can I say about Casablanca? It used to be my favorite movie, before I went to see Project Hail Mary. It is tense, dramatic, iconic, yet also hopeful. Call me old fashioned (and here\'s your very good reason to) but they do not make movies like they used to.',
      },
      {
        rank: 3,
        title: 'Princess Bride',
        link: { label: 'Learn more', url: '' },
        meta: [
          { label: 'Director', value: 'Rob Reiner' },
          { label: 'Year', value: '1987' },
          { label: 'Year', value: 'Adventure, Romance, Comedy, Fantasy, Drama' },
          { label: 'Runtime', value: '1h 38m' },
        ],
        description: 'I recently found out that YKMFPTD is an actual acronym people use. But allow me to digress and explain how networking works. First, politely greet the other party: "Hello". Then, say who you are: "My name is Inigo Montoya". After that, establish a relevant connection with the other party: "You killed my father". Finally, crucially, manage expectations: "Prepare to die".',
      },
    ],
  },
  {
    id: 'songs',
    title: 'Songs',
    count: 'Top 1',
    description: 'My most loved song of all time.',
    entries: [
      {
        rank: 1,
        title: 'Phantom Liberty',
        link: { label: 'Open in Spotify', url: '' },
        meta: [
          { label: 'Artist', value: 'Dawid Podsiadło, P.T. Adamczyk' },
          { label: 'Album', value: 'Lada Dwudzieste z kawałkiem' },
          { label: 'Year', value: '2024' },
        ],
        spotify: 'https://open.spotify.com/track/2MImOJ8LOTQW8QKzcuQ91x',
        description: 'I remember finishing Cyberpunk 2077\'s "Phantom Liberty" DLC, and watching the credits with this song playing in the background. "Phantom Liberty," both the song and the game, have definetely left a trace on me. A lot of my decorations circa 2024-2025 feature Blackwall-like red vertical lines. I later discovered the French cover of this song, and, ever since, it has been pinned as the song that is on my profile. Simply put, it is my favorite song of all time.',
      },
    ],
  },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: 'transform 200ms ease',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PoemExcerptBlock({ excerpt, isMobile }: { excerpt: PoemExcerpt; isMobile: boolean }) {
  return (
    <blockquote style={{
      borderLeft: '2px solid #333',
      paddingLeft: '1rem',
      margin: '1rem 0',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap',
    }}>
      <span style={{ color: '#555', display: 'block' }}>{excerpt.before}</span>
      {excerpt.highlight.map((line, i) => (
        <span key={i} style={{ color: '#f0f0f0', display: 'block' }}>{line}</span>
      ))}
      <span style={{ color: '#555', display: 'block' }}>{excerpt.after}</span>
    </blockquote>
  );
}

// Accepts a full Spotify track URL (https://open.spotify.com/track/ID) or a
// bare track ID, and returns the embeddable player URL.
function spotifyEmbedUrl(input: string): string | null {
  if (!input) return null;
  const match = input.match(/track\/([A-Za-z0-9]+)/);
  const id = match ? match[1] : input;
  return `https://open.spotify.com/embed/track/${id}?utm_source=generator`;
}

function SpotifyPlayer({ source }: { source: string }) {
  const src = spotifyEmbedUrl(source);
  if (!src) {
    return (
      <div style={{
        width: '100%',
        height: '80px',
        borderRadius: '12px',
        margin: '1rem 0',
        backgroundColor: '#1c1c1c',
        border: '1px dashed #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#555',
        fontSize: '0.85rem',
      }}>
        [paste a Spotify track link to embed the player]
      </div>
    );
  }
  return (
    <iframe
      src={src}
      width="100%"
      height="152"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Spotify player"
      style={{ border: 0, borderRadius: '12px', margin: '1rem 0', display: 'block' }}
    />
  );
}

function ExternalLink({ link }: { link: FavoriteLink }) {
  if (!link.url) return null;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginTop: '1rem',
        padding: '0.4rem 0.85rem',
        border: '1px solid #333',
        borderRadius: '2rem',
        color: '#ddd',
        fontSize: '0.85rem',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ddd'; }}
    >
      {link.label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}

function EntryAccordion({ entry, defaultOpen, isMobile }: {
  entry: FavoriteEntry;
  defaultOpen: boolean;
  isMobile: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      border: '1px solid #222',
      borderRadius: '0.5rem',
      backgroundColor: open ? '#161616' : '#121212',
      overflow: 'hidden',
      transition: 'background-color 0.2s ease',
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.75rem' : '1rem',
          padding: isMobile ? '0.85rem 1rem' : '1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: '#fff',
        }}
      >
        <span style={{
          color: '#666',
          fontFamily: 'CustomTitle, sans-serif',
          fontSize: isMobile ? '1rem' : '1.15rem',
          minWidth: '1.5rem',
        }}>
          {entry.rank}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontFamily: 'CustomRegularBold, sans-serif',
            fontSize: isMobile ? '0.95rem' : '1.05rem',
            color: '#eee',
          }}>
            {entry.title}
          </span>
          <span style={{ display: 'block', color: '#777', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            {entry.meta.map((m) => m.value).join(' · ')}
          </span>
        </span>
        <span style={{ color: '#888' }}>
          <Chevron open={open} />
        </span>
      </button>

      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 250ms ease',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            padding: isMobile ? '0 1rem 1rem 1rem' : '0 1.25rem 1.25rem 1.25rem',
            borderTop: '1px solid #222',
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem 1.5rem',
              margin: '1rem 0',
            }}>
              {entry.meta.map((m) => (
                <span key={m.label} style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: '#666' }}>{m.label}: </span>
                  <span style={{ color: '#bbb' }}>{m.value}</span>
                </span>
              ))}
            </div>

            {entry.excerpt && <PoemExcerptBlock excerpt={entry.excerpt} isMobile={isMobile} />}
            {entry.spotify !== undefined && <SpotifyPlayer source={entry.spotify} />}

            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              {entry.description}
            </p>

            {entry.link && <ExternalLink link={entry.link} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Catalog({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.6rem',
      margin: '0 0 3rem 0',
    }}>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '0.45rem',
            padding: isMobile ? '0.5rem 0.85rem' : '0.55rem 1rem',
            border: '1px solid #222',
            borderRadius: '2rem',
            backgroundColor: '#121212',
            color: '#ddd',
            fontSize: '0.9rem',
            fontFamily: 'CustomRegularBold, sans-serif',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#ddd'; }}
        >
          {section.title}
          <span style={{ color: '#666', fontSize: '0.75rem' }}>{section.count}</span>
        </a>
      ))}
    </div>
  );
}

export default function Favorites() {
  const isMobile = useIsMobile();

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      padding: isMobile ? '1.5rem' : '3rem',
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'CustomTitle, sans-serif',
          fontSize: isMobile ? '2rem' : '2.5rem',
          color: '#ffffff',
          margin: '0 0 0.5rem 0',
        }}>
          Favorites
        </h1>
        <p style={{
          color: '#888',
          fontSize: isMobile ? '0.95rem' : '1.05rem',
          margin: '0 0 2.5rem 0',
        }}>
          You can tell a lot about a particular person based on what they like.
        </p>

        <Catalog isMobile={isMobile} />

        {sections.map((section) => (
          <section key={section.id} id={section.id} style={{
            marginBottom: isMobile ? '3rem' : '4rem',
            scrollMarginTop: '5rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '0.5rem',
              marginBottom: '0.25rem',
            }}>
              <h2 style={{
                fontFamily: 'CustomRegularBold, sans-serif',
                fontSize: isMobile ? '1.3rem' : '1.5rem',
                color: '#ffffff',
                margin: 0,
              }}>
                {section.title}
              </h2>
              <span style={{ color: '#666', fontSize: '0.85rem', flexShrink: 0 }}>
                {section.count}
              </span>
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1.25rem 0' }}>
              {section.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {section.entries.map((entry) => (
                <EntryAccordion
                  key={entry.rank}
                  entry={entry}
                  defaultOpen={entry.rank === 1}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
