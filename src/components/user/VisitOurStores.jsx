import Link from 'next/link'

/*
  VISIT OUR STORES — Libas-style
  ──────────────────────────────────────────────────────────
  Desktop : 4 columns, store photo + name + "Visit Store" link
  Tablet  : 2 columns
  Mobile  : 2 columns (scroll if needed)
  Bottom  : "VIEW ALL →" centered link
*/

const STORES = [
  {
    name:    'Karachi Center',
    href:    '/contact',
    image:   'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',
  },
  {
    name:    'Lahore Mall',
    href:    '/contact',
    image:   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  },
  {
    name:    'Islamabad Plaza',
    href:    '/contact',
    image:   'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&q=80',
  },
  {
    name:    'Peshawar Square',
    href:    '/contact',
    image:   'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80',
  },
]

export default function VisitOurStores() {
  return (
    <section className="w-full bg-white py-12 md:py-16">
      <style>{`
        .kc-stores-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .kc-stores-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
        }

        /* Store image — landscape */
        .kc-store-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .kc-store-card:hover .kc-store-img {
          transform: scale(1.04);
        }
        .kc-store-card {
          overflow: hidden;
        }

        /* "Visit Store" underline link */
        .kc-store-link {
          font-family: Poppins, sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1a1a1a;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.18s;
        }
        .kc-store-link:hover { color: #6B2D8B; }

        /* View All link */
        .kc-store-view-all {
          font-family: Poppins, sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1a1a1a;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1.5px solid #1a1a1a;
          padding-bottom: 2px;
          transition: color 0.18s, border-color 0.18s;
        }
        .kc-store-view-all:hover {
          color: #6B2D8B;
          border-color: #6B2D8B;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Heading */}
        <h2
          className="text-center mb-8 md:mb-10"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#1a1a1a',
          }}
        >
          Visit Our Stores
        </h2>

        {/* 4-column grid */}
        <div className="kc-stores-grid">
          {STORES.map((store) => (
            <div key={store.name} className="kc-store-card">
              {/* Photo */}
              <div style={{ overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.image}
                  alt={store.name}
                  className="kc-store-img"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              {/* Name + link */}
              <div className="pt-3 pb-1 text-center">
                <p
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#1a1a1a',
                    marginBottom: 6,
                  }}
                >
                  {store.name}
                </p>
                <Link href={store.href} className="kc-store-link">
                  Visit Store
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="flex justify-center mt-8">
          <Link href="/contact" className="kc-store-view-all">
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}
