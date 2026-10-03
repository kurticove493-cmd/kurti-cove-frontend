'use client'
import { useState } from 'react'
import Link from 'next/link'
import { staticImg } from '../../lib/staticImg.js'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#2a2a2a'
const WHT  = '#fff'

const NAV = {
  explore: {
    title: 'Explore',
    items: [
      { label: 'New Arrivals',  href: '/shop?filter=isNewArrival' },
      { label: 'Best Sellers',  href: '/shop?filter=isBestSeller' },
      { label: 'Sale',          href: '/shop?filter=onSale' },
      { label: 'Kurtis',        href: '/shop?category=kurtis' },
      { label: 'Co-ords',       href: '/shop?category=co-ords' },
      { label: 'Suits',         href: '/shop?category=suits' },
      { label: 'Dresses',       href: '/shop?category=dresses' },
    ],
  },
  help: {
    title: 'Help',
    items: [
      { label: 'Track Order',        href: '/orders' },
      { label: 'Return Policy',      href: '/contact' },
      { label: 'Shipping Policy',    href: '/contact' },
      { label: 'Privacy Policy',     href: '/contact' },
      { label: 'Terms & Conditions', href: '/contact' },
    ],
  },
  company: {
    title: 'Company',
    items: [
      { label: 'About Us',    href: '/contact' },
      { label: 'Contact Us',  href: '/contact' },
      { label: 'Careers',     href: '/contact' },
      { label: 'Sitemap',     href: '/' },
    ],
  },
}

const SOCIALS = [
  {
    label: 'Instagram', href: 'https://instagram.com',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>,
  },
  {
    label: 'Facebook', href: 'https://facebook.com',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  },
  {
    label: 'YouTube', href: 'https://youtube.com',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>,
  },
  {
    label: 'X', href: 'https://twitter.com',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
]

function ColTitle({ children }) {
  return (
    <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
      letterSpacing:'0.16em', textTransform:'uppercase', color:WHT,
      marginBottom:16, marginTop:0 }}>
      {children}
    </p>
  )
}

function FootLink({ href, children }) {
  return (
    <Link href={href} style={{ display:'block', fontFamily:'Poppins,sans-serif',
      fontSize:13, color:MUTE, textDecoration:'none', marginBottom:9,
      transition:'color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.color = WHT}
      onMouseLeave={e => e.currentTarget.style.color = MUTE}>
      {children}
    </Link>
  )
}

function AccordMobile({ title, items }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom:`1px solid ${RULE}` }}>
      <button onClick={() => setOpen(v=>!v)} style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 0', background:'none', border:'none', cursor:'pointer',
        fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
        letterSpacing:'0.14em', textTransform:'uppercase', color:WHT,
      }}>
        {title}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition:'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none', flexShrink:0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div style={{ overflow:'hidden', maxHeight: open ? 600 : 0, transition:'max-height 0.3s ease' }}>
        <div style={{ paddingBottom:14 }}>
          {items.map(item => (
            <Link key={item.label} href={item.href} style={{
              display:'block', fontFamily:'Poppins,sans-serif', fontSize:13,
              color:MUTE, textDecoration:'none', marginBottom:8,
            }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function SubscribeForm() {
  const [email, setEmail] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); setEmail('') }}
      style={{ display:'flex', border:`1px solid ${RULE}`, overflow:'hidden', marginTop:8 }}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Your email address" required
        style={{ flex:1, padding:'10px 14px', fontSize:12, fontFamily:'Poppins,sans-serif',
          background:'transparent', border:'none', outline:'none', color:WHT }} />
      <button type="submit" style={{
        padding:'10px 14px', background:'none', border:'none',
        borderLeft:`1px solid ${RULE}`, cursor:'pointer',
        color:MUTE, display:'flex', alignItems:'center', transition:'color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = WHT}
        onMouseLeave={e => e.currentTarget.style.color = MUTE}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </form>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: INK, color: WHT }}>
      <style>{`
        .ft-pay-badge {
          display:inline-flex; align-items:center; justify-content:center;
          padding:4px 10px; background:#1e1e1e;
          border:1px solid #333; height:32px;
        }
      `}</style>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'48px 20px 32px' }}>

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden md:grid" style={{ gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1.2fr', gap:40, marginBottom:40 }}>

          {/* Brand col */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={staticImg('/logo.png')} alt="Kurti Cove" style={{ height:36, objectFit:'contain', marginBottom:16, filter:'brightness(0) invert(1)' }} />
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, lineHeight:1.7, marginBottom:20 }}>
              Handpicked ethnic wear for every woman. Authentic Indian fashion delivered to your door.
            </p>
            {/* Social */}
            <div style={{ display:'flex', gap:10 }}>
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ width:34, height:34, borderRadius:'50%', border:`1px solid ${RULE}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:MUTE, textDecoration:'none', transition:'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = WHT; e.currentTarget.style.color = WHT }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = RULE; e.currentTarget.style.color = MUTE }}
                  aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav cols */}
          {Object.values(NAV).map(col => (
            <div key={col.title}>
              <ColTitle>{col.title}</ColTitle>
              {col.items.map(item => <FootLink key={item.label} href={item.href}>{item.label}</FootLink>)}
            </div>
          ))}

          {/* Newsletter + Payment */}
          <div>
            <ColTitle>Newsletter</ColTitle>
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, marginBottom:0 }}>
              Get special discounts and new arrivals straight to your inbox.
            </p>
            <SubscribeForm />

            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
              letterSpacing:'0.14em', textTransform:'uppercase', color:WHT,
              marginTop:24, marginBottom:10 }}>
              We Accept
            </p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
              {/* UPI */}
              <span className="ft-pay-badge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={staticImg('/icons/upi-icon.webp')} alt="UPI" style={{ height:18, width:'auto' }} />
              </span>
              {/* PhonePe */}
              <span className="ft-pay-badge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={staticImg('/icons/phonepe-icon.webp')} alt="PhonePe" style={{ height:18, width:'auto' }} />
              </span>
              {/* Google Pay */}
              <span className="ft-pay-badge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={staticImg('/icons/google-pay-icon.webp')} alt="Google Pay" style={{ height:18, width:'auto' }} />
              </span>
              {/* Visa */}
              <span className="ft-pay-badge">
                <svg width="36" height="12" viewBox="0 0 36 12">
                  <text x="0" y="11" fontFamily="Arial" fontSize="13" fontWeight="900" fontStyle="italic" fill="#fff" letterSpacing="-0.5">VISA</text>
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT ── */}
        <div className="md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={staticImg('/logo.png')} alt="Kurti Cove" style={{ height:30, objectFit:'contain', marginBottom:20, filter:'brightness(0) invert(1)' }} />
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${RULE}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:MUTE, textDecoration:'none' }}
                aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
            letterSpacing:'0.14em', textTransform:'uppercase', color:WHT, marginBottom:6 }}>
            Newsletter
          </p>
          <SubscribeForm />
          <div style={{ marginTop:20 }}>
            {Object.values(NAV).map(col => <AccordMobile key={col.title} title={col.title} items={col.items} />)}
          </div>
          {/* Payment */}
          <div style={{ marginTop:20, display:'flex', gap:6, flexWrap:'wrap' }}>
            {[
              { src: staticImg('/icons/upi-icon.webp'),        alt:'UPI'        },
              { src: staticImg('/icons/phonepe-icon.webp'),    alt:'PhonePe'    },
              { src: staticImg('/icons/google-pay-icon.webp'), alt:'Google Pay' },
            ].map(p => (
              <span key={p.alt} className="ft-pay-badge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.alt} style={{ height:16, width:'auto' }} />
              </span>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ borderTop:`1px solid ${RULE}`, marginTop:32, paddingTop:20,
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, margin:0 }}>
            © 2025 Kurti Cove. All Rights Reserved.
          </p>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, margin:0 }}>
            kurticove.in is the only official website of Kurti Cove.
          </p>
        </div>
      </div>
    </footer>
  )
}
