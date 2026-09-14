'use client'
import Link from 'next/link'

/*
  FEATURED CATEGORIES — Libas-style
  ──────────────────────────────────────────────────────────────
  Desktop : 5 columns × 2 rows = 10 cards
  Tablet  : 3 columns × wrapping
  Mobile  : 2 columns × wrapping (same as Libas)

  Each card is a portrait image with a category label badge at
  the top-left, just like the Libas reference screenshot.
──────────────────────────────────────────────────────────────*/

const CATEGORIES = [
  {
    label: 'Kurtis',
    href:  '/shop?category=kurtis',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80',
  },
  {
    label: 'Suits',
    href:  '/shop?category=suits',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
  },
  {
    label: 'Co-ords',
    href:  '/shop?category=co-ords',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
  },
  {
    label: 'Dresses',
    href:  '/shop?category=dresses',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80',
  },
  {
    label: 'Plus Sizes',
    href:  '/shop?category=plus-sizes',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80',
  },
  {
    label: 'Shirts',
    href:  '/shop?category=shirts',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80',
  },
  {
    label: 'Loungewear',
    href:  '/shop?category=loungewear',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
  },
  {
    label: 'Bottoms',
    href:  '/shop?category=bottoms',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4d8e?w=400&q=80',
  },
  {
    label: 'New Arrivals',
    href:  '/shop?filter=isNewArrival',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80',
  },
  {
    label: 'Sale',
    href:  '/shop?filter=onSale',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
  },
]

export default function CategoryGrid() {
  return (
    <section className="w-full py-10 md:py-14 bg-white">
      {/* Scoped styles */}
      <style>{`
        .kc-cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        @media (min-width: 640px) {
          .kc-cat-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
        }
        @media (min-width: 1024px) {
          .kc-cat-grid { grid-template-columns: repeat(5, 1fr); gap: 12px; }
        }

        /* Portrait card */
        .kc-cat-card {
          position: relative;
          overflow: hidden;
          background: #ece9e4;
          display: block;
        }
        /* 3:4 portrait ratio */
        .kc-cat-card::before {
          content: '';
          display: block;
          padding-top: 133%;
        }

        .kc-cat-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.45s ease;
        }
        .kc-cat-card:hover img {
          transform: scale(1.06);
        }

        /* label badge — top-left, Libas style */
        .kc-cat-label {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          font-family: Poppins, sans-serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1a1a1a;
          background: rgba(255, 255, 255, 0.92);
          padding: 4px 10px;
          line-height: 1.5;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Section heading */}
        <div className="text-center mb-8 md:mb-10">
          <h2
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#1a1a1a',
            }}
          >
            Featured Categories
          </h2>
        </div>

        {/* Grid */}
        <div className="kc-cat-grid">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="kc-cat-card"
              aria-label={`Shop ${cat.label}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.label}
                loading="lazy"
                draggable={false}
              />
              <span className="kc-cat-label">{cat.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
