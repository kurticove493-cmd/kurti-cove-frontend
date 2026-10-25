'use client'
import { useState } from 'react'
import Link from 'next/link'

/* ── Same minimal theme as login/register/checkout ── */
const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

/* ── Policy content (unchanged) ── */
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
    label: 'Location',
    value: '123, Ethnic Lane, Rajouri Garden',
    sub: 'New Delhi – 110027, India',
  },
  {
    label: 'Call / WhatsApp',
    value: '+91 98765 43210',
    sub: 'Mon–Sat, 9 AM – 7 PM',
  },
  {
    label: 'Email',
    value: 'support@kurticove.in',
    sub: 'We reply within 24 hours',
  },
  {
    label: 'Store Hours',
    value: 'Mon – Sat',
    sub: '9:00 AM – 7:00 PM',
  },
]

/* ── Policy accordion item ── */
function PolicyItem({ policy }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: `1px solid ${RULE}` }}>
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
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: INK,
          textAlign: 'left',
        }}
        aria-expanded={open}
      >
        {policy.title}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={MUTE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transition: 'transform 0.22s',
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
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{ paddingBottom: 20 }}>
          {policy.content.split('\n\n').map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 13,
                color: MUTE,
                lineHeight: 1.75,
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

/* ── Label style shared ── */
const labelStyle = {
  display: 'block',
  fontFamily: 'Poppins, sans-serif',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: MUTE,
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: `1px solid ${RULE}`,
  background: WHT,
  fontFamily: 'Poppins, sans-serif',
  fontSize: 13,
  color: INK,
  outline: 'none',
  borderRadius: 0,
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

/* ── Contact form ── */
function ContactForm() {
  const [form, setForm]           = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{
          width: 48, height: 48,
          background: INK,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={WHT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 20, fontWeight: 700, color: INK, marginBottom: 8,
        }}>
          Message Received
        </h3>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: MUTE, lineHeight: 1.65, marginBottom: 24 }}>
          Thank you for reaching out. Our team will get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
          style={{
            padding: '11px 28px',
            background: INK, color: WHT,
            border: 'none', cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 11, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}
        >
          Send Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        .kc-ci:focus { border-color: ${INK} !important; }
        .kc-ci::placeholder { color: #bbb; }
        @media(max-width:560px){ .kc-cr{ grid-template-columns:1fr !important; } }
      `}</style>

      {/* Name + Phone */}
      <div className="kc-cr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input className="kc-ci" style={inputStyle} type="text" name="name"
            value={form.name} onChange={handleChange} placeholder="Your name" required />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input className="kc-ci" style={inputStyle} type="tel" name="phone"
            value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" />
        </div>
      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>Email Address *</label>
        <input className="kc-ci" style={inputStyle} type="email" name="email"
          value={form.email} onChange={handleChange} placeholder="you@email.com" required />
      </div>

      {/* Subject */}
      <div>
        <label style={labelStyle}>Subject *</label>
        <select className="kc-ci" name="subject" value={form.subject}
          onChange={handleChange} required
          style={{
            ...inputStyle, cursor: 'pointer', appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40,
          }}>
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
        <label style={labelStyle}>Message *</label>
        <textarea className="kc-ci" name="message" value={form.message}
          onChange={handleChange} placeholder="Tell us how we can help…" required
          style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }} />
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} style={{
        padding: '13px 0',
        background: loading ? '#444' : INK,
        color: WHT, border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Poppins, sans-serif',
        fontSize: 12, fontWeight: 600,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 0.18s',
      }}>
        {loading ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: 'kc-spin 0.8s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Sending…
          </>
        ) : 'Send Message'}
      </button>
    </form>
  )
}

/* ══ MAIN PAGE ══ */
export default function ContactPage() {
  return (
    <main style={{ background: '#fafafa', minHeight: '100vh' }}>
      <style>{`
        @keyframes kc-spin { to { transform: rotate(360deg); } }
        .kc-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: ${RULE};
          border: 1px solid ${RULE};
        }
        @media (min-width: 768px) {
          .kc-info-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .kc-contact-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 900px) {
          .kc-contact-layout { grid-template-columns: 1.1fr 1fr; gap: 48px; }
        }
      `}</style>

      {/* ── 1. PAGE HEADER ── */}
      <div style={{
        background: WHT,
        borderBottom: `1px solid ${RULE}`,
        padding: '48px 16px 40px',
        textAlign: 'center',
      }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 16, fontFamily: 'Poppins, sans-serif', fontSize: 11, color: MUTE }}>
          <Link href="/" style={{ color: MUTE, textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: INK }}>Contact Us</span>
        </div>

        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
          fontWeight: 700, color: INK,
          marginBottom: 10, lineHeight: 1.2,
        }}>
          We&apos;d Love to Hear From You
        </h1>
        <p style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 13, color: MUTE,
          maxWidth: 440, margin: '0 auto', lineHeight: 1.7,
        }}>
          Whether it&apos;s a question about your order, a product query, or just a hello — our team is here for you.
        </p>
      </div>

      {/* ── 2. INFO CARDS ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 0' }}>
        <div className="kc-info-grid">
          {INFO_CARDS.map(card => (
            <div key={card.label} style={{
              background: WHT,
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 10, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: MUTE, marginBottom: 8,
              }}>
                {card.label}
              </p>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 13, fontWeight: 600, color: INK, marginBottom: 3,
              }}>
                {card.value}
              </p>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 12, color: MUTE,
              }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. FORM + MAP ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* Section heading */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
            fontWeight: 700, color: INK, marginBottom: 6,
          }}>
            Send Us a Message
          </h2>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: MUTE }}>
            Fill in the form and we&apos;ll get back to you within 24 hours on working days.
          </p>
        </div>

        <div className="kc-contact-layout">

          {/* Form card */}
          <div style={{
            background: WHT,
            border: `1px solid ${RULE}`,
            padding: 'clamp(20px, 4vw, 36px)',
          }}>
            <ContactForm />
          </div>

          {/* Right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Map */}
            <div style={{ border: `1px solid ${RULE}`, overflow: 'hidden', lineHeight: 0 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.4!2d77.1025!3d28.6592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM5JzMzLjEiTiA3N8KwMDYnMDkuMCJF!5e0!3m2!1sen!2sin!4v1700000000000"
                title="Kurti Cove Store Location"
                width="100%" height="240"
                style={{ display: 'block', border: 'none' }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Quick contact */}
            <div style={{ background: WHT, border: `1px solid ${RULE}`, padding: '24px' }}>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 10, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: MUTE, marginBottom: 16,
              }}>
                Quick Contact
              </p>

              {[
                { label: 'WhatsApp', value: '+91 98765 43210', href: 'https://wa.me/919876543210' },
                { label: 'Email',    value: 'support@kurticove.in', href: 'mailto:support@kurticove.in' },
                { label: 'Instagram',value: '@kurticove', href: 'https://instagram.com/kurticove' },
              ].map((item, i, arr) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: i < arr.length - 1 ? 12 : 0,
                  marginBottom: i < arr.length - 1 ? 12 : 0,
                  borderBottom: i < arr.length - 1 ? `1px solid ${RULE}` : 'none',
                }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: MUTE }}>
                    {item.label}
                  </span>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 12, fontWeight: 600, color: INK,
                    textDecoration: 'none',
                  }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {item.value}
                  </a>
                </div>
              ))}

              {/* Disclaimer */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${RULE}` }}>
                <p style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: MUTE, marginBottom: 6,
                }}>
                  Disclaimer
                </p>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: MUTE, lineHeight: 1.65 }}>
                  www.kurticove.in is the only official website of Kurti Cove. Any other site using a similar name or logo is not affiliated with us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. POLICIES ACCORDION ── */}
      <div style={{ borderTop: `1px solid ${RULE}`, background: WHT }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 64px' }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              fontWeight: 700, color: INK, marginBottom: 6,
            }}>
              Policies
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: MUTE }}>
              Everything you need to know about shopping with Kurti Cove.
            </p>
          </div>

          <div>
            {POLICIES.map(policy => (
              <PolicyItem key={policy.id} policy={policy} />
            ))}
          </div>
        </div>
      </div>

    </main>
  )
}
