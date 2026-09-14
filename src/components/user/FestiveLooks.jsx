import Link from 'next/link'

/*
  FESTIVE LOOKS WE LOVE — Libas-style
  ─────────────────────────────────────────────────────────────
  1. Heading (centered, uppercase)
  2. Full-bleed wide banner image
  3. 4-card portrait grid below the banner
     Mobile  : 2 cols
     Desktop : 4 cols
  Label sits at bottom-left in white bold text (like Libas)
*/

const FESTIVE_CARDS = [
  {
    label: 'Co-ords',
    href:  '/shop?category=co-ords',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
  },
  {
    label: 'Kurtas',
    href:  '/shop?category=kurtis',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
  },
  {
    label: 'Suits',
    href:  '/shop?category=suits',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
  },
  {
    label: 'Sarees',
    href:  '/shop?category=sarees',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80',
  },
]

export default function FestiveLooks() {
  return (
    <section className="w-full bg-white">
      <style>{`
        /* ── Banner ── */
        .kc-festive-banner {
          width: 100%;
          overflow: hidden;
          position: relative;
          display: block;
          cursor: pointer;
        }
        .kc-festive-banner img {
          width: 100%;
          display: block;
          object-fit: cover;
          object-position: center center;
          height: 520px;
        }
        @media (max-width: 767px) {
          .kc-festive-banner img {
            height: 320px;
            object-position: center center;
          }
        }
        .kc-festive-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.0) 0%,
            rgba(0,0,0,0.0) 55%,
            rgba(0,0,0,0.30) 100%
          );
          pointer-events: none;
        }

        /* ── 4-card grid ── */
        .kc-festive-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
        }
        @media (min-width: 1024px) {
          .kc-festive-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* Portrait card — same ratio as the reference */
        .kc-festive-card {
          position: relative;
          overflow: hidden;
          display: block;
          background: #e8e2dc;
        }
        .kc-festive-card::before {
          content: '';
          display: block;
          padding-top: 120%; /* slightly squarer than category grid */
        }
        .kc-festive-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.45s ease;
        }
        .kc-festive-card:hover img {
          transform: scale(1.06);
        }

        /* Bottom gradient for label readability */
        .kc-festive-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.00) 45%,
            rgba(0,0,0,0.55) 100%
          );
          pointer-events: none;
        }

        /* Label — bottom-left, white bold, like Libas */
        .kc-festive-label {
          position: absolute;
          bottom: 18px;
          left: 18px;
          z-index: 2;
          font-family: Poppins, sans-serif;
          font-size: clamp(0.85rem, 2vw, 1.1rem);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffffff;
          line-height: 1;
        }
        @media (max-width: 480px) {
          .kc-festive-label {
            bottom: 12px;
            left: 12px;
            font-size: 0.78rem;
          }
        }
      `}</style>

      {/* ── Heading ── */}
      <div className="text-center py-6 md:py-8">
        <h2
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#1a1a1a',
          }}
        >
          Festive Looks We Love
        </h2>
      </div>

      {/* ── Full-width banner ── */}
      <Link href="/shop?filter=isFeatured" className="kc-festive-banner" aria-label="Shop Festive Looks">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&q=85"
          alt="Festive Looks We Love"
          loading="lazy"
          draggable={false}
        />
        <div className="kc-festive-overlay" aria-hidden="true" />
      </Link>

      {/* ── 4 portrait cards below banner ── */}
      <div className="kc-festive-grid">
        {FESTIVE_CARDS.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="kc-festive-card"
            aria-label={`Shop ${card.label}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image}
              alt={card.label}
              loading="lazy"
              draggable={false}
            />
            <span className="kc-festive-label">{card.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
