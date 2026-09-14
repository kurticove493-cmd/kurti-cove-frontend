'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const HEADER_H = 68   // matches md:h-[68px]

const SLIDES = [
  {
    src:     '/hero/image1.png',
    alt:     'Kurti Cove Collection 1',
    href:    '/shop',
    title:   'Utsav',
    subtitle:'A Floral Celebration',
  },
  {
    src:     '/hero/image2.png',
    alt:     'Kurti Cove Collection 2',
    href:    '/shop?filter=isNewArrival',
    title:   'New Arrivals',
    subtitle:'Fresh Styles, Every Week',
  },
  {
    src:     '/hero/image3.png',
    alt:     'Kurti Cove Collection 3',
    href:    '/shop?filter=isBestSeller',
    title:   'Best Sellers',
    subtitle:'Loved by Thousands',
  },
  {
    src:     '/hero/image4.png',
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
          Hero fills the full viewport width.
          Height = 100vw * (9/21) — Libas wide-screen ratio ~21:9.
          On mobile switch to 4:3.
          Min/max clamps so it never looks weird.
        */
        .kc-hero-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          /* ~21:9 wide cinematic ratio */
          aspect-ratio: 21 / 9;
          background: #1a0a2e; /* deep purple fallback while image loads */
        }
        @media (max-width: 768px) {
          .kc-hero-wrap {
            /* 4:3 on mobile — taller so image is visible */
            aspect-ratio: 4 / 3;
          }
        }
        @media (max-width: 480px) {
          .kc-hero-wrap { aspect-ratio: 3 / 2.8; }
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
            width: 85%;
          }
        }
        .kc-slide-title {
          font-family: "Playfair Display", Georgia, serif;
          font-style: italic;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.0;
          letter-spacing: -0.01em;
          font-size: clamp(2.8rem, 7vw, 6.5rem);
          text-shadow: 0 2px 24px rgba(0,0,0,0.28);
        }
        .kc-slide-sub {
          font-family: Poppins, sans-serif;
          font-weight: 400;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.20em;
          text-transform: uppercase;
          font-size: clamp(0.58rem, 1.1vw, 0.82rem);
          margin-top: 0.5em;
          text-shadow: 0 1px 8px rgba(0,0,0,0.35);
        }
        .kc-explore-btn {
          pointer-events: auto;
          display: inline-block;
          margin-top: 1.5em;
          padding: 0.55em 2em;
          border: 1.5px solid rgba(255,255,255,0.88);
          color: #ffffff;
          font-family: Poppins, sans-serif;
          font-size: clamp(0.58rem, 0.9vw, 0.74rem);
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          background: transparent;
          cursor: pointer;
          transition: background 0.22s;
          text-decoration: none;
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

      {/* ── MARQUEE STRIP ── */}
      <div style={{ width: '100%', overflow: 'hidden', background: 'linear-gradient(90deg,#6B2D8B,#9B4DB5 50%,#6B2D8B)' }}>
        <div style={{ padding: '10px 0' }}>
          <div className="kc-marquee" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
            {[0, 1].map(rep => (
              <span key={rep} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 28px', fontSize: '0.72rem', fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#f3e8ff' }}>
                    <span style={{ color: 'rgba(243,232,255,0.45)', fontSize: 7 }}>✦</span>
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
