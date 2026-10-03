'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { staticImg } from '../../lib/staticImg.js'

const HEADER_H = 68

const SLIDES = [
  {
    src:     staticImg('/hero/image1.png'),
    alt:     'Kurti Cove Collection 1',
    href:    '/shop',
    title:   'Utsav',
    subtitle:'A Floral Celebration',
  },
  {
    src:     staticImg('/hero/image2.png'),
    alt:     'Kurti Cove Collection 2',
    href:    '/shop?filter=isNewArrival',
    title:   'New Arrivals',
    subtitle:'Fresh Styles, Every Week',
  },
  {
    src:     staticImg('/hero/image3.png'),
    alt:     'Kurti Cove Collection 3',
    href:    '/shop?filter=isBestSeller',
    title:   'Best Sellers',
    subtitle:'Loved by Thousands',
  },
  {
    src:     staticImg('/hero/image4.png'),
    alt:     'Kurti Cove Collection 4',
    href:    '/#deals60',
    title:   'Big Sale',
    subtitle:'Up to 60% Off',
    isHash:  true,
  },
]

const INTERVAL_MS = 4000

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef(null)
  const router      = useRouter()
  const pathname    = usePathname()
  const total       = SLIDES.length

  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % total), INTERVAL_MS)
  }, [total])

  useEffect(() => { startTimer(); return () => clearInterval(intervalRef.current) }, [startTimer])

  const goTo   = useCallback((idx) => { setCurrent(((idx % total) + total) % total); startTimer() }, [total, startTimer])
  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  const handleHashSlide = useCallback((e) => {
    e.preventDefault()
    const scrollToDeal = () => {
      const el = document.getElementById('deals60')
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }
    if (pathname === '/') {
      scrollToDeal()
    } else {
      sessionStorage.setItem('kc_scroll_to', 'deals60')
      router.push('/')
    }
  }, [pathname, router])

  useEffect(() => {
    if (pathname !== '/') return
    const target = sessionStorage.getItem('kc_scroll_to')
    if (!target) return
    sessionStorage.removeItem('kc_scroll_to')
    const timer = setTimeout(() => {
      const el = document.getElementById(target)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }, 350)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <style>{`
        /* ── Marquee ── */
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .kc-marquee { animation: marquee 30s linear infinite; }
        .kc-marquee:hover { animation-play-state: paused; }

        /*
          Hero slides under the fixed transparent header.
          negative margin-top = exact spacer height → hero starts at y:0

          Mobile aspect-ratio matches the shop banner slider exactly:
          shop uses 140px → 4:3 at ~375px ≈ same proportions.
          We use aspect-ratio so image is NEVER cropped — height is
          computed from width automatically.
        */
        .kc-hero-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          aspect-ratio: 21 / 9;
          background: #1a0a2e;
          margin-top: -56px;
        }
        @media (min-width: 768px) {
          .kc-hero-wrap { margin-top: -68px; }
        }
        /* Mobile: same ratio as shop banner slider (wider = less tall = no crop) */
        @media (max-width: 767px) {
          .kc-hero-wrap { aspect-ratio: 3 / 2; }
        }
        @media (max-width: 479px) {
          .kc-hero-wrap { aspect-ratio: 4 / 3; }
        }

        /* Each slide fills the container absolutely */
        .kc-slide {
          position: absolute;
          inset: 0;
          transition: opacity 0.75s ease;
        }
        .kc-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          user-select: none;
          pointer-events: none;
        }

        /* Right-side dark gradient for text legibility */
        .kc-vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(
            to left,
            rgba(0,0,0,0.42) 0%,
            rgba(0,0,0,0.20) 42%,
            transparent 66%
          );
        }
        @media (max-width: 640px) {
          .kc-vignette {
            background: linear-gradient(
              to top,
              rgba(0,0,0,0.50) 0%,
              rgba(0,0,0,0.18) 55%,
              transparent 80%
            );
          }
        }

        /* Text overlay */
        .kc-slide-text {
          position: absolute;
          z-index: 5;
          right: 7%;
          top: 50%;
          transform: translateY(-50%);
          text-align: center;
          pointer-events: none;
        }
        @media (max-width: 640px) {
          .kc-slide-text {
            right: auto;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 88%;
          }
        }
        .kc-slide-title {
          font-family: "Playfair Display", Georgia, serif;
          font-style: italic;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.05;
          letter-spacing: -0.01em;
          /* Desktop big, mobile comfortably smaller */
          font-size: clamp(1.6rem, 5vw, 6.5rem);
          text-shadow: 0 2px 24px rgba(0,0,0,0.28);
        }
        @media (max-width: 479px) {
          .kc-slide-title { font-size: clamp(1.4rem, 8vw, 2.2rem); }
        }
        .kc-slide-sub {
          font-family: Poppins, sans-serif;
          font-weight: 400;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-size: clamp(0.55rem, 1.1vw, 0.82rem);
          margin-top: 0.5em;
          text-shadow: 0 1px 8px rgba(0,0,0,0.35);
        }
        @media (max-width: 479px) {
          .kc-slide-sub { font-size: 0.62rem; letter-spacing: 0.12em; }
        }
        .kc-explore-btn {
          pointer-events: auto;
          display: inline-block;
          margin-top: 1.2em;
          padding: 0.5em 1.6em;
          border: 1.5px solid rgba(255,255,255,0.88);
          color: #ffffff;
          font-family: Poppins, sans-serif;
          font-size: clamp(0.52rem, 0.9vw, 0.74rem);
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: transparent;
          cursor: pointer;
          transition: background 0.22s;
          text-decoration: none;
        }
        @media (max-width: 479px) {
          .kc-explore-btn { font-size: 0.6rem; padding: 0.45em 1.3em; margin-top: 0.9em; }
        }
        .kc-explore-btn:hover { background: rgba(255,255,255,0.16); }

        /* Arrows */
        .kc-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 56px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.80);
          cursor: pointer;
          transition: color 0.18s, background 0.18s;
          border-radius: 3px;
          padding: 0;
        }
        .kc-arrow:hover {
          color: #fff;
          background: rgba(255,255,255,0.10);
        }
        .kc-arrow svg { filter: drop-shadow(0 1px 4px rgba(0,0,0,0.55)); }
        @media (max-width: 480px) {
          .kc-arrow { width: 28px; height: 44px; }
        }
      `}</style>

      {/* ── HERO SLIDER ── */}
      <section className="kc-hero-wrap" aria-label="Hero image slider">

        {SLIDES.map((slide, idx) => {
          const active = idx === current
          return (
            <div
              key={slide.src}
              className="kc-slide"
              style={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}
              aria-hidden={!active}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />

              {/* gradient vignette */}
              <div className="kc-vignette" />

              {/* text + button */}
              <div className="kc-slide-text">
                <div className="kc-slide-title">{slide.title}</div>
                <div className="kc-slide-sub">{slide.subtitle}</div>
                {slide.isHash ? (
                  <a href={slide.href} onClick={handleHashSlide} className="kc-explore-btn">
                    Explore &rsaquo;
                  </a>
                ) : (
                  <Link href={slide.href} className="kc-explore-btn">
                    Explore &rsaquo;
                  </Link>
                )}
              </div>
            </div>
          )
        })}

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, zIndex: 8,
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.08))',
          pointerEvents: 'none',
        }} />

        {/* Left arrow */}
        <button className="kc-arrow" style={{ left: 0 }} onClick={() => goPrev()} aria-label="Previous slide">
          <ChevronLeft size={24} strokeWidth={1.8} />
        </button>

        {/* Right arrow */}
        <button className="kc-arrow" style={{ right: 0 }} onClick={() => goNext()} aria-label="Next slide">
          <ChevronRight size={24} strokeWidth={1.8} />
        </button>

        {/* Dots */}
        <div
          style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: 8, alignItems: 'center' }}
          role="tablist"
          aria-label="Slide indicators"
        >
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              role="tab"
              aria-selected={idx === current}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s',
                background: idx === current ? '#ffffff' : 'rgba(255,255,255,0.45)',
                width:  idx === current ? 22 : 8,
                height: 8,
                boxShadow: idx === current ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
              }}
            />
          ))}
        </div>
      </section>

      {/* ── MARQUEE STRIP — dark minimal theme ── */}
      <div style={{ width:'100%', overflow:'hidden', background:'#141414' }}>
        <div style={{ padding:'9px 0' }}>
          <div className="kc-marquee" style={{ display:'flex', whiteSpace:'nowrap' }}>
            {[0,1].map(rep => (
              <span key={rep} style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
                {[
                  'Free Shipping on Orders Above ₹999',
                  'Cash on Delivery Available',
                  '15-Day Easy Returns',
                  '500+ Kurti Styles',
                  'Authentic Indian Ethnic Wear',
                  'Handcrafted with Love',
                  'New Arrivals Every Week',
                  'Secure & Encrypted Checkout',
                ].map((text, i) => (
                  <span key={`${rep}-${i}`}
                    style={{ display:'inline-flex', alignItems:'center', gap:6,
                      padding:'0 24px', fontSize:'0.7rem',
                      fontFamily:'Poppins, sans-serif', fontWeight:500,
                      color:'rgba(255,255,255,0.70)',
                      letterSpacing:'0.06em',
                    }}>
                    <span style={{ color:'rgba(255,255,255,0.25)', fontSize:6 }}>◆</span>
                    {text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
