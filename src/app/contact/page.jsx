'use client'
/*
  CONTACT PAGE — Kurti Cove (Libas-style)
  ──────────────────────────────────────────────────────────────
  Palette  : cream bg (#FCFAE0), berry (#7B2447), rose (#E05C88),
             pink border (#F5C8D4), footer pink (#F9D8D8)
  Font     : Poppins (sans) + Playfair Display (headings)
  Sections :
    1. Hero banner
    2. Info cards  (Location / Phone / Hours)
    3. Contact form + Policy accordion
    4. Policies (About, T&C, Shipping, Return, Privacy, Refund)
  ──────────────────────────────────────────────────────────────
*/

import { useState } from 'react'
import Link from 'next/link'

/* ── Palette tokens ── */
const BERRY  = '#7B2447'
const ROSE   = '#E05C88'
const PINK   = '#F8A5B5'
const BORDER = '#F5C8D4'
const CREAM  = '#FCFAE0'
const PEACH  = '#FEF0E3'
const FOOTER_PINK = '#F9D8D8'

/* ── Policy content ── */
const POLICIES = [
  {
    id: 'about',
    title: 'About Us',
    content: `Kurti Cove is a celebration of Indian ethnic wear crafted for the modern woman. Founded with a love for handpicked fabrics and timeless silhouettes, we bring you kurtis, suits, co-ords, and more that blend tradition with contemporary elegance. Every piece in our collection is carefully selected to ensure quality, comfort, and style — so you can express yourself effortlessly, whether it's a festive occasion or a regular Tuesday.

Our team is passionate about sustainable, inclusive fashion. We work directly with artisans and fabric houses across India to bring you authentic designs at accessible prices.`,
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    content: `By accessing or placing an order on kurticove.in, you agree to be bound by these terms.

• All prices are inclusive of applicable taxes unless otherwise stated.
• Kurti Cove reserves the right to cancel any order in case of pricing errors or stock unavailability. A full refund will be processed immediately.
• You must be 18 years or older to make a purchase. By placing an order, you confirm this.
• Unauthorized use of this website, including data mining or framing, is strictly prohibited.
• Kurti Cove is not liable for delays caused by courier partners, natural events, or force majeure circumstances.
• These terms are governed by the laws of India and subject to the jurisdiction of courts in the registered city of Kurti Cove.`,
  },
  {
    id: 'shipping',
    title: 'Shipping Policy',
    content: `We offer shipping across India through trusted courier partners.

• Orders are processed within 1–2 business days of confirmed payment.
• Standard delivery takes 5–7 business days depending on your location.
• Expedited delivery (2–3 days) is available for select pin codes at an additional charge.
• Free shipping is available on orders above ₹999.
• You will receive a tracking link via email/SMS once your order is dispatched.
• Kurti Cove is not responsible for delays caused by courier partners after dispatch.
• For remote or restricted areas, additional delivery time may be required.`,
  },
  {
    id: 'return',
    title: 'Return Policy',
    content: `We want you to love every piece you receive. If something isn't right, we make it easy to return.

• Returns are accepted within 7 days of delivery.
• Items must be unworn, unwashed, and in original condition with all tags attached.
• Sale items, innerwear, and accessories are not eligible for return.
• To initiate a return, email us at support@kurticove.in with your order number and reason.
• Once we receive and inspect the item, a refund or store credit will be issued within 5–7 business days.
• Reverse pickup is available in most pin codes. In some cases, you may need to self-ship.`,
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: `Your privacy matters to us. Here's how we handle your data.

• We collect your name, email, phone number, and address solely to process and deliver your orders.
• We do not sell, trade, or rent your personal information to third parties.
• Payment details are processed through secure PCI-DSS compliant gateways. We do not store card information.
• We may use your email for order updates and occasional promotional communication. You can unsubscribe at any time.
• Cookies are used to improve your browsing experience and analyse site traffic. You can disable cookies in your browser settings.
• We may update this policy periodically. Continued use of the site after changes constitutes your acceptance.`,
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    content: `Refunds are processed once your return has been received and inspected.

• Approved refunds are credited to the original payment method within 5–7 business days.
• For COD orders, refunds are issued as store credit or via bank transfer (NEFT/IMPS).
• Shipping charges are non-refundable unless the return is due to a defect or wrong item sent.
• If your refund has not been received within 7 business days of approval, please contact us at support@kurticove.in.
• In case of a cancelled order (before dispatch), the full amount is refunded within 3–5 business days.`,
  },
]

/* ── Info card data ── */
const INFO_CARDS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: 'Our Location',
    lines: ['123, Ethnic Lane, Rajouri Garden', 'New Delhi – 110027, India'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
      </svg>
    ),
    title: 'Call / WhatsApp',
    lines: ['+91 98765 43210', 'Mon–Sat, 9 AM – 7 PM'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    title: 'Email Us',
    lines: ['support@kurticove.in', 'We reply within 24 hours'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Store Hours',
    lines: ['Monday – Saturday', '9:00 AM – 7:00 PM'],
  },
]

/* ── Policy accordion item ── */
function PolicyItem({ policy }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: BERRY,
          textAlign: 'left',
        }}
        aria-expanded={open}
      >
        {policy.title}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={ROSE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transition: 'transform 0.25s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '800px' : '0',
        transition: 'max-height 0.38s ease',
      }}>
        <div style={{ paddingBottom: 20 }}>
          {policy.content.split('\n\n').map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.78rem',
                color: '#3d1a1a',
                lineHeight: 1.8,
                marginBottom: i < policy.content.split('\n\n').length - 1 ? 12 : 0,
                whiteSpace: 'pre-line',
              }}
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Contact form ── */
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    /* Simulate async submission — replace with real API call */
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        style={{
          background: '#fff',
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        {/* Checkmark */}
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: '#FEF0E3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.35rem',
          fontWeight: 700,
          color: BERRY,
          marginBottom: 10,
        }}>
          Message Received!
        </h3>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.82rem', color: '#3d1a1a', lineHeight: 1.7 }}>
          Thank you for reaching out. Our team will get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
          style={{
            marginTop: 24,
            padding: '10px 28px',
            background: ROSE,
            color: '#fff',
            border: 'none',
            borderRadius: 50,
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Send Another
        </button>
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    fontFamily: 'Poppins, sans-serif',
    fontSize: '0.8rem',
    color: '#1a1a1a',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        .kc-contact-input:focus {
          border-color: ${ROSE} !important;
          box-shadow: 0 0 0 3px rgba(224,92,136,0.12) !important;
        }
        .kc-contact-input::placeholder { color: #bbb; }
      `}</style>

      {/* Name + Phone row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="kc-contact-row">
        <div>
          <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: BERRY, display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Full Name *
          </label>
          <input
            className="kc-contact-input"
            style={inputStyle}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: BERRY, display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Phone
          </label>
          <input
            className="kc-contact-input"
            style={inputStyle}
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 00000 00000"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: BERRY, display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Email Address *
        </label>
        <input
          className="kc-contact-input"
          style={inputStyle}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@email.com"
          required
        />
      </div>

      {/* Subject */}
      <div>
        <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: BERRY, display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Subject *
        </label>
        <select
          className="kc-contact-input"
          style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23E05C88' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40 }}
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select a topic</option>
          <option value="order">Order Enquiry</option>
          <option value="return">Return / Exchange</option>
          <option value="shipping">Shipping Issue</option>
          <option value="product">Product Question</option>
          <option value="feedback">Feedback</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: BERRY, display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Message *
        </label>
        <textarea
          className="kc-contact-input"
          style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }}
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us how we can help…"
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '13px 0',
          background: loading ? PINK : ROSE,
          color: '#fff',
          border: 'none',
          borderRadius: 50,
          fontFamily: 'Poppins, sans-serif',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s, transform 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#C94A74' }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = ROSE }}
      >
        {loading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'kc-spin 0.8s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Sending…
          </>
        ) : (
          <>
            Send Message
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </>
        )}
      </button>
    </form>
  )
}

/* ══════════════════════════════════════════════
   MAIN PAGE EXPORT
══════════════════════════════════════════════ */
export default function ContactPage() {
  return (
    <div style={{ background: CREAM }}>
      <style>{`
        @keyframes kc-spin { to { transform: rotate(360deg); } }

        /* Responsive name/phone row → stack on mobile */
        @media (max-width: 560px) {
          .kc-contact-row {
            grid-template-columns: 1fr !important;
          }
        }

        /* Info cards grid */
        .kc-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .kc-info-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Two-col content layout */
        .kc-contact-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 900px) {
          .kc-contact-layout {
            grid-template-columns: 1.1fr 1fr;
            gap: 48px;
          }
        }

        /* Map iframe */
        .kc-map iframe {
          width: 100%;
          height: 260px;
          border: none;
          display: block;
        }
        @media (min-width: 768px) {
          .kc-map iframe { height: 340px; }
        }
      `}</style>

      {/* ══ 1. HERO BANNER ══ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${FOOTER_PINK} 0%, #f5c0d0 50%, #f0b8cc 100%)`,
          padding: '64px 16px 56px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div aria-hidden="true" style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(224,92,136,0.08)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(123,36,71,0.07)', pointerEvents: 'none' }} />

        {/* Breadcrumb */}
        <div style={{ marginBottom: 18, position: 'relative' }}>
          <Link href="/" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', color: BERRY, opacity: 0.7, textDecoration: 'none', letterSpacing: '0.06em' }}>Home</Link>
          <span style={{ margin: '0 8px', color: ROSE, fontSize: '0.72rem' }}>›</span>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', color: BERRY, fontWeight: 600, letterSpacing: '0.06em' }}>Contact Us</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            fontWeight: 700,
            color: BERRY,
            marginBottom: 14,
            lineHeight: 1.2,
            position: 'relative',
          }}
        >
          We&apos;d Love to Hear From You
        </h1>
        <p
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(0.82rem, 2vw, 0.95rem)',
            color: '#5a2035',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.7,
            position: 'relative',
          }}
        >
          Whether it&apos;s a question about your order, a product query, or just a hello — our team is here for you.
        </p>

        {/* Decorative divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, position: 'relative' }}>
          <div style={{ height: 1, width: 48, background: ROSE, opacity: 0.5 }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill={ROSE} opacity={0.7}>
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          <div style={{ height: 1, width: 48, background: ROSE, opacity: 0.5 }} />
        </div>
      </div>

      {/* ══ 2. INFO CARDS ══ */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
          <div className="kc-info-grid">
            {INFO_CARDS.map((card) => (
              <div
                key={card.title}
                style={{
                  background: CREAM,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: '28px 20px',
                  textAlign: 'center',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(224,92,136,0.16)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: 60, height: 60,
                  borderRadius: '50%',
                  background: '#fff',
                  border: `1.5px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  {card.icon}
                </div>
                <p style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: ROSE,
                  marginBottom: 10,
                }}>
                  {card.title}
                </p>
                {card.lines.map((line, i) => (
                  <p key={i} style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.8rem',
                    color: i === 1 ? '#6B4553' : BERRY,
                    fontWeight: i === 0 ? 600 : 400,
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 3. CONTACT FORM + MAP ══ */}
      <div style={{ background: CREAM }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px' }}>

          {/* Section heading */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ROSE, marginBottom: 8 }}>
              Get In Touch
            </p>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
              fontWeight: 700,
              color: BERRY,
              marginBottom: 10,
            }}>
              Send Us a Message
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.82rem', color: '#5a2035', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
              Fill in the form and we&apos;ll get back to you within 24 hours on working days.
            </p>
          </div>

          <div className="kc-contact-layout">
            {/* Form */}
            <div style={{
              background: '#fff',
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 4px 20px rgba(224,92,136,0.08)',
            }}>
              <ContactForm />
            </div>

            {/* Right col — map + quick contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Map */}
              <div
                className="kc-map"
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 4px 20px rgba(224,92,136,0.08)',
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.4!2d77.1025!3d28.6592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM5JzMzLjEiTiA3N8KwMDYnMDkuMCJF!5e0!3m2!1sen!2sin!4v1700000000000"
                  title="Kurti Cove Store Location"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ filter: 'hue-rotate(290deg) saturate(0.9) brightness(0.95)' }}
                />
              </div>

              {/* Quick contact card */}
              <div style={{
                background: FOOTER_PINK,
                border: `1px solid ${BORDER}`,
                borderRadius: 20,
                padding: '28px 28px',
              }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ROSE, marginBottom: 14 }}>
                  Quick Contact
                </p>

                {[
                  { label: 'WhatsApp', value: '+91 98765 43210', href: 'https://wa.me/919876543210' },
                  { label: 'Email', value: 'support@kurticove.in', href: 'mailto:support@kurticove.in' },
                  { label: 'Instagram', value: '@kurticove', href: 'https://instagram.com/kurticove' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', color: '#5a2035', fontWeight: 500 }}>{item.label}</span>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.75rem',
                        color: BERRY,
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = ROSE}
                      onMouseLeave={e => e.currentTarget.style.color = BERRY}
                    >
                      {item.value}
                    </a>
                  </div>
                ))}

                {/* Disclaimer */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.68rem', fontWeight: 700, color: '#6B2D8B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Disclaimer
                  </p>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.68rem', color: '#3d1a1a', lineHeight: 1.7 }}>
                    www.kurticove.in is the only official website of Kurti Cove. Any other site using a similar name or logo is not affiliated with us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 4. POLICIES ACCORDION ══ */}
      <div style={{ background: '#fff', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px 64px' }}>

          {/* Section heading */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ROSE, marginBottom: 8 }}>
              Policies
            </p>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
              fontWeight: 700,
              color: BERRY,
            }}>
              Everything You Need to Know
            </h2>
          </div>

          {/* Accordion */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', background: CREAM }}>
            <div style={{ padding: '0 28px' }}>
              {POLICIES.map(policy => (
                <PolicyItem key={policy.id} policy={policy} />
              ))}
            </div>
          </div>

          {/* Back to shop CTA */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 32px',
                background: ROSE,
                color: '#fff',
                borderRadius: 50,
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#C94A74'}
              onMouseLeave={e => e.currentTarget.style.background = ROSE}
            >
              Shop Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
