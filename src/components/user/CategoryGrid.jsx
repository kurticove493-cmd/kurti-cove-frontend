import Link from 'next/link'
import { staticImg } from '../../lib/staticImg.js'

const CATEGORIES = [
  { label: 'Cotton Kurties',      href: '/shop?category=cotton',     image: staticImg('/category grid/cotton.jpg')     },
  { label: 'Streight Kurties',    href: '/shop?category=suits',      image: staticImg('/category grid/streight.jpg')   },
  { label: 'A-line Kurties',      href: '/shop?category=a-line',     image: staticImg('/category grid/a-line.jpg')     },
  { label: 'Short Kurties',       href: '/shop?category=short',      image: staticImg('/category grid/short.jpg')      },
  { label: 'Embroidered Kurties', href: '/shop?category=embroidered',image: staticImg('/category grid/embroidery.jpg') },
  { label: 'Festive Kurtis',      href: '/shop?category=festive',    image: staticImg('/category grid/festive.jpg')    },
  { label: 'Rayon Kurtis',        href: '/shop?category=rayon',      image: staticImg('/category grid/rayon.jpg')      },
  { label: 'Printed Kurtis',      href: '/shop?category=printed',    image: staticImg('/category grid/printed.jpg')    },
  { label: 'Long Kurtis',         href: '/shop?filter=long',         image: staticImg('/category grid/long.jpg')       },
  { label: 'Co-Ord Kurti Sets',   href: '/shop?filter=co-ord',       image: staticImg('/category grid/co-ord.jpg')     },
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
