'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

/*
  CUSTOMER REVIEWS — Libas-style slider
  ────────────────────────────────────────────────────────
  • Light grey background
  • Heading: CUSTOMER REVIEWS (bold, centered, uppercase)
  • Cards: review text → polaroid photo → stars + name
  • Desktop : 4 visible cards
  • Tablet  : 2 visible cards
  • Mobile  : 1 visible card
  • Auto-slides every 4s, pauses on hover
  • Prev / Next arrow buttons on the sides
*/

import { staticImg } from '../../lib/staticImg.js'

const REVIEWS = [
  { id:1, text:'Absolutely love the quality! The fabric is so soft and the fit is perfect. Will definitely order again.', name:'_Priya Sharma',  image: staticImg('/customer review/cotton.jpg'),     rating:5 },
  { id:2, text:'Beautiful kurti, the embroidery detail is stunning. Got so many compliments at the function!',         name:'_Anjali Singh',  image: staticImg('/customer review/embroidery.png'), rating:5 },
  { id:3, text:'No words needed, the outfit says it all. Packaging was great and delivery was super fast.',            name:'_Meera Patel',   image: staticImg('/customer review/short.jpg'),      rating:5 },
  { id:4, text:'Getting ready felt like a whole Bollywood scene! The colors are so vibrant and true to the photos.',   name:'_Ritika Joshi',  image: staticImg('/customer review/printed.jpg'),    rating:5 },
  { id:5, text:'My festive wardrobe just got an upgrade. Breathable, breezy and oh-so-easy on the pocket!',           name:'_Kavya Nair',    image: staticImg('/customer review/festive.jpg'),    rating:5 },
  { id:6, text:'Ordered 3 kurtis and all of them fit perfectly. The stitching quality is excellent. Highly recommend!',name:'_Sneha Gupta',   image: staticImg('/customer review/combo.jpg'),      rating:5 },
]

function StarRating({ count = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="#1a1a1a">
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z" />
        </svg>
      ))}
    </div>
  )
}

export default function CustomerReviews() {
  const [current, setCurrent]   = useState(0)
  const [perView,  setPerView]  = useState(4)
  const timerRef = useRef(null)
  const trackRef = useRef(null)

  /* responsive perView */
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 4)
    }
    calc()
    window.addEventListener('resize', calc, { passive: true })
    return () => window.removeEventListener('resize', calc)
  }, [])

  const maxIdx = REVIEWS.length - perView

  const next = useCallback(() => {
    setCurrent(c => (c >= maxIdx ? 0 : c + 1))
  }, [maxIdx])

  const prev = useCallback(() => {
    setCurrent(c => (c <= 0 ? maxIdx : c - 1))
  }, [maxIdx])

  /* auto-slide */
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, 4000)
  }, [next])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  const pause = () => clearInterval(timerRef.current)
  const resume = () => startTimer()

  /* card width as % */
  const cardW = 100 / perView

  return (
    <section style={{ background: '#f2f2f2', padding: '56px 0' }}>
      <style>{`
        .kc-rv-track {
          display: flex;
          transition: transform 0.45s cubic-bezier(0.4,0,0.2,1);
          will-change: transform;
        }

        .kc-rv-card {
          flex-shrink: 0;
          padding: 0 12px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* review text */
        .kc-rv-text {
          font-family: Poppins, sans-serif;
          font-size: 0.8rem;
          line-height: 1.6;
          color: #1a1a1a;
          text-align: center;
          margin-bottom: 20px;
          min-height: 64px;
        }

        /* Polaroid-style photo */
        .kc-rv-photo {
          background: #fff;
          padding: 8px 8px 28px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          transform: rotate(-2deg);
          margin-bottom: 18px;
          width: 100%;
          max-width: 190px;
        }
        .kc-rv-card:nth-child(even) .kc-rv-photo {
          transform: rotate(1.5deg);
        }
        .kc-rv-photo img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          object-position: top;
          display: block;
        }

        /* stars + name row */
        .kc-rv-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: Poppins, sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        /* Arrow buttons */
        .kc-rv-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          transition: background 0.18s, box-shadow 0.18s;
          color: #1a1a1a;
        }
        .kc-rv-arrow:hover {
          background: #6B2D8B;
          color: #fff;
          box-shadow: 0 4px 14px rgba(107,45,139,0.22);
        }
        .kc-rv-arrow-left  { left: 8px; }
        .kc-rv-arrow-right { right: 8px; }
        @media (min-width: 768px) {
          .kc-rv-arrow-left  { left: 16px; }
          .kc-rv-arrow-right { right: 16px; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Heading */}
        <h2
          className="text-center mb-10"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#1a1a1a',
          }}
        >
          Customer Reviews
        </h2>

        {/* Slider */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          {/* Prev */}
          <button
            className="kc-rv-arrow kc-rv-arrow-left"
            onClick={() => { prev(); pause(); resume() }}
            aria-label="Previous reviews"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Track viewport */}
          <div style={{ overflow: 'hidden', margin: '0 44px' }}>
            <div
              ref={trackRef}
              className="kc-rv-track"
              style={{ transform: `translateX(-${current * cardW}%)` }}
            >
              {REVIEWS.map((r) => (
                <div
                  key={r.id}
                  className="kc-rv-card"
                  style={{ width: `${cardW}%` }}
                >
                  {/* Review text */}
                  <p className="kc-rv-text">{r.text}</p>

                  {/* Polaroid photo */}
                  <div className="kc-rv-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.image} alt={r.name} loading="lazy" draggable={false} />
                  </div>

                  {/* Stars + name */}
                  <div className="kc-rv-meta">
                    <StarRating count={r.rating} />
                    <span>{r.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next */}
          <button
            className="kc-rv-arrow kc-rv-arrow-right"
            onClick={() => { next(); pause(); resume() }}
            aria-label="Next reviews"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to review ${i + 1}`}
              style={{
                width: i === current ? 22 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === current ? '#6B2D8B' : 'rgba(0,0,0,0.18)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
