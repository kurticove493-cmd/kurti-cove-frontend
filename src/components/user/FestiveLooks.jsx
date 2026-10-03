import Link from 'next/link'
import { staticImg } from '../../lib/staticImg.js'

const FESTIVE_CARDS = [
  { label:'Co-ords',    href:'/shop?category=co-ord',    image: staticImg('/festive look/co-ord.jpg')    },
  { label:'Embroidery', href:'/shop?category=embroidery', image: staticImg('/festive look/embroidery.jpg') },
  { label:'Printed',    href:'/shop?category=printed',    image: staticImg('/festive look/printed.jpg')   },
  { label:'Short',      href:'/shop?category=short',      image: staticImg('/festive look/short.jpg')     },
]

export default function FestiveLooks() {
  return (
    <section style={{ width:'100%', background:'#fff' }}>
      <style>{`
        /* ── Section heading ── */
        .kc-fl-head {
          text-align:center;
          padding:28px 0 20px;
        }
        .kc-fl-head h2 {
          font-family:Poppins,sans-serif;
          font-size:clamp(0.78rem,1.8vw,1rem);
          font-weight:700;
          letter-spacing:0.24em;
          text-transform:uppercase;
          color:#141414;
          margin:0;
        }

        /* ── Banner: full-width, NO fixed height, NO crop ── */
        .kc-fl-banner {
          display:block;
          width:100%;
          /* natural image height — same principle as the shop hero slider */
        }
        .kc-fl-banner img {
          width:100%;
          height:auto;          /* natural height — zero cropping */
          display:block;
          object-fit:unset;
        }

        /* ── 4-card portrait grid ── */
        .kc-fl-grid {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:0;
        }
        @media(min-width:1024px) {
          .kc-fl-grid { grid-template-columns:repeat(4,1fr); }
        }

        /* Portrait card — 120% padding-top keeps 5:6 ratio */
        .kc-fl-card {
          position:relative;
          overflow:hidden;
          display:block;
          background:#e8e2dc;
        }
        .kc-fl-card::before {
          content:'';
          display:block;
          padding-top:120%;
        }
        .kc-fl-card img {
          position:absolute;
          inset:0;
          width:100%; height:100%;
          object-fit:cover;
          transition:transform 0.45s ease;
        }
        .kc-fl-card:hover img { transform:scale(1.06); }

        /* bottom gradient for label */
        .kc-fl-card::after {
          content:'';
          position:absolute;
          inset:0;
          background:linear-gradient(to bottom,rgba(0,0,0,0) 45%,rgba(0,0,0,0.52) 100%);
          pointer-events:none;
        }

        /* Label */
        .kc-fl-label {
          position:absolute;
          bottom:16px; left:16px;
          z-index:2;
          font-family:Poppins,sans-serif;
          font-size:clamp(0.78rem,1.8vw,1rem);
          font-weight:700;
          letter-spacing:0.10em;
          text-transform:uppercase;
          color:#fff;
          line-height:1;
        }
        @media(max-width:480px) {
          .kc-fl-label { bottom:10px; left:10px; font-size:0.72rem; }
        }
      `}</style>

      {/* Heading */}
      <div className="kc-fl-head">
        <h2>Festive Looks We Love</h2>
      </div>

      {/* Full-width banner — natural height, zero crop */}
      <Link href="/shop?filter=isFeatured" className="kc-fl-banner" aria-label="Shop Festive Looks">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={staticImg('/festive look/landscape1.png')}
          alt="Festive Looks We Love"
          loading="lazy"
          draggable={false}
        />
      </Link>

      {/* 4 portrait cards */}
      <div className="kc-fl-grid">
        {FESTIVE_CARDS.map(card => (
          <Link key={card.label} href={card.href}
            className="kc-fl-card" aria-label={`Shop ${card.label}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.image} alt={card.label} loading="lazy" draggable={false} />
            <span className="kc-fl-label">{card.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
