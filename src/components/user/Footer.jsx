'use client'
import { useState } from 'react'
import Link from 'next/link'

/*
  FOOTER — Libas-style
  ──────────────────────────────────────────────────────────────
  Background : soft pink #F9D8D8
  Desktop    : 4 columns — Contact Us | Explore More | Customer Experience | Social+Subscribe+Payment
  Mobile     : Social icons + Subscribe on top, then accordion sections
  ──────────────────────────────────────────────────────────────
*/

const NAV = {
  contactUs: {
    title: 'Contact Us',
    items: [
      { label: 'Contact Support',    href: '/contact' },
      { label: '09:00 AM – 07:00 PM (Mon–Sat)', href: '/contact', muted: true },
      { label: 'Gift Cards',         href: '/shop' },
      { label: 'Sale',               href: '/shop?filter=onSale' },
    ],
    disclaimer: true,
  },
  exploreMore: {
    title: 'Explore More',
    items: [
      { label: 'New Arrivals',   href: '/shop?filter=isNewArrival' },
      { label: 'Suits',         href: '/shop?category=suits' },
      { label: 'Kurtis',        href: '/shop?category=kurtis' },
      { label: 'Dresses',       href: '/shop?category=dresses' },
      { label: 'Co-ords',       href: '/shop?category=co-ords' },
      { label: 'Loungewear',    href: '/shop?category=loungewear' },
      { label: 'Bottoms',       href: '/shop?category=bottoms' },
      { label: 'Best Sellers',  href: '/shop?filter=isBestSeller' },
      { label: 'Sale',          href: '/shop?filter=onSale' },
    ],
  },
  customerExp: {
    title: 'Customer Experience',
    items: [
      { label: 'About Us',          href: '/contact' },
      { label: 'Terms & Conditions',href: '/contact' },
      { label: 'Shipping Policy',   href: '/contact' },
      { label: 'Return Policy',     href: '/contact' },
      { label: 'Privacy Policy',    href: '/contact' },
      { label: 'Refund Policy',     href: '/contact' },
      { label: 'Track Order',       href: '/orders' },
      { label: 'Sitemap',           href: '/' },
    ],
  },
}

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    href: 'https://twitter.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://pinterest.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
  },
]

function AccordionSection({ title, items, disclaimer }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid rgba(107,45,139,0.18)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#6B2D8B',
        }}
        aria-expanded={open}
      >
        {title}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#6B2D8B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '600px' : '0',
        transition: 'max-height 0.35s ease',
      }}>
        <ul style={{ paddingBottom: 14, paddingLeft: 0, listStyle: 'none', margin: 0 }}>
          {items.map((item) => (
            <li key={item.label} style={{ marginBottom: 8 }}>
              {item.muted ? (
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: '#6B4553' }}>{item.label}</span>
              ) : (
                <Link href={item.href} style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: '#3d1a1a', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        {disclaimer && (
          <div style={{ paddingBottom: 14 }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#6B2D8B', textTransform: 'uppercase', marginBottom: 4 }}>Disclaimer</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.7rem', color: '#3d1a1a', lineHeight: 1.6 }}>
              www.kurticove.in is the only official website of Kurti Cove. Any other website using a similar name or logo is not affiliated with us.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SubscribeForm() {
  const [email, setEmail] = useState('')
  return (
    <form
      onSubmit={e => { e.preventDefault(); setEmail('') }}
      style={{
        display: 'flex',
        border: '1px solid rgba(107,45,139,0.25)',
        background: '#fff',
        overflow: 'hidden',
        marginTop: 8,
      }}
    >
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email Address"
        required
        style={{
          flex: 1,
          padding: '10px 14px',
          fontSize: '0.78rem',
          fontFamily: 'Poppins, sans-serif',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#1a1a1a',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '10px 14px',
          background: 'none',
          border: 'none',
          borderLeft: '1px solid rgba(107,45,139,0.2)',
          cursor: 'pointer',
          color: '#6B2D8B',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Subscribe"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </form>
  )
}

const payBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '5px 10px',
  background: '#fff',
  border: '1px solid rgba(107,45,139,0.18)',
  height: 32,
}

export default function Footer() {
  return (
    <footer style={{ background: '#F9D8D8', color: '#1a1a1a' }}>
      <style>{`
        .kc-footer-col-title {
          font-family: Poppins, sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 14px;
          display: block;
          letter-spacing: 0.01em;
        }
        .kc-footer-link {
          font-family: Poppins, sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          color: #2a2a2a;
          text-decoration: none;
          line-height: 1;
          transition: color 0.15s;
          display: block;
          margin-bottom: 10px;
        }
        .kc-footer-link:hover { color: #6B2D8B; }

        .kc-footer-muted {
          font-family: Poppins, sans-serif;
          font-size: 0.73rem;
          color: #5a3a3a;
          margin-bottom: 10px;
          display: block;
        }

        .kc-social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid #6B2D8B;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B2D8B;
          transition: background 0.18s, color 0.18s;
          text-decoration: none;
          flex-shrink: 0;
        }
        .kc-social-btn:hover {
          background: #6B2D8B;
          color: #fff;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* ══ MOBILE LAYOUT ══ */}
        <div className="md:hidden">
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                 className="kc-social-btn" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>

          {/* Subscribe */}
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#6B2D8B', marginBottom: 6 }}>
            Subscribe To Get Special Discount
          </p>
          <SubscribeForm />

          {/* Accordion sections */}
          <div style={{ marginTop: 20 }}>
            <AccordionSection title="Contact Us"           items={NAV.contactUs.items} disclaimer={true} />
            <AccordionSection title="Explore More"         items={NAV.exploreMore.items} />
            <AccordionSection title="Customer Experience"  items={NAV.customerExp.items} />
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#6B2D8B', textTransform: 'uppercase', marginBottom: 4 }}>Disclaimer</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.7rem', color: '#3d1a1a', lineHeight: 1.7 }}>
              www.kurticove.in is the only official website of Kurti Cove.
            </p>
          </div>

          {/* Copyright */}
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.7rem', color: '#6B4553', marginTop: 16 }}>
            © Kurti Cove 2025. All Rights Reserved.
          </p>
        </div>

        {/* ══ DESKTOP LAYOUT ══ */}
        <div className="hidden md:grid" style={{ gridTemplateColumns: '1fr 1.2fr 1.2fr 1.1fr', gap: 40 }}>

          {/* Col 1 — Contact Us + Discover + Disclaimer */}
          <div>
            <span className="kc-footer-col-title">Contact Us</span>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#3d1a1a', display: 'block', marginBottom: 4 }}>Contact Support</span>
            <span className="kc-footer-muted">09:00 AM – 07:00 PM (Monday–Saturday)</span>

            <span className="kc-footer-col-title" style={{ marginTop: 20 }}>Discover</span>
            <Link href="/shop" className="kc-footer-link">Gift Cards</Link>
            <Link href="/shop?filter=onSale" className="kc-footer-link">Sale</Link>

            <span className="kc-footer-col-title" style={{ marginTop: 20 }}>Disclaimer</span>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', color: '#3d1a1a', lineHeight: 1.7 }}>
              www.kurticove.in is the only official website of Kurti Cove. Any other website using a similar name, logo, or identity is not associated with, authorised by, or affiliated with Kurti Cove.
            </p>
          </div>

          {/* Col 2 — Explore More */}
          <div>
            <span className="kc-footer-col-title">Explore More</span>
            {NAV.exploreMore.items.map(item => (
              <Link key={item.label} href={item.href} className="kc-footer-link">{item.label}</Link>
            ))}
          </div>

          {/* Col 3 — Customer Experience */}
          <div>
            <span className="kc-footer-col-title">Customer Experience</span>
            {NAV.customerExp.items.map(item => (
              <Link key={item.label} href={item.href} className="kc-footer-link">{item.label}</Link>
            ))}
          </div>

          {/* Col 4 — Social + Subscribe + Payment */}
          <div>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                   className="kc-social-btn" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Subscribe */}
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
              Subscribe To Get Special Discount
            </p>
            <SubscribeForm />

            {/* Secure Payment */}
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#1a1a1a', marginTop: 20, marginBottom: 10 }}>
              Secure Payment
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Visa */}
              <span style={payBadgeStyle}>
                <svg width="38" height="13" viewBox="0 0 38 13" fill="none">
                  <text x="0" y="11" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="-0.5">VISA</text>
                </svg>
              </span>
              {/* Mastercard */}
              <span style={payBadgeStyle}>
                <svg width="32" height="20" viewBox="0 0 32 20">
                  <circle cx="12" cy="10" r="9" fill="#EB001B"/>
                  <circle cx="20" cy="10" r="9" fill="#F79E1B"/>
                  <path d="M16 3.17a9 9 0 0 1 0 13.66A9 9 0 0 1 16 3.17z" fill="#FF5F00"/>
                </svg>
              </span>
              {/* Google Pay */}
              <span style={{ ...payBadgeStyle, padding: '3px 6px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/google-pay-icon.webp" alt="Google Pay" style={{ height: 20, width: 'auto', display: 'block' }} />
              </span>
              {/* PhonePe */}
              <span style={{ ...payBadgeStyle, padding: '3px 6px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/phonepe-icon.webp" alt="PhonePe" style={{ height: 20, width: 'auto', display: 'block' }} />
              </span>
              {/* UPI */}
              <span style={{ ...payBadgeStyle, padding: '3px 6px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/upi-icon.webp" alt="UPI" style={{ height: 20, width: 'auto', display: 'block' }} />
              </span>
            </div>
          </div>
        </div>

        {/* ══ Copyright bar — both layouts ══ */}
        <div
          className="hidden md:block"
          style={{ borderTop: '1px solid rgba(107,45,139,0.18)', marginTop: 32, paddingTop: 16 }}
        >
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', color: '#6B4553', textAlign: 'center' }}>
            © Kurti Cove 2025. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
