'use client'
import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Package, Truck, CreditCard, ShoppingBag, Check } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const UPI_METHODS = ['upi', 'phonepe', 'googlepay', 'online']

const PAGE_CSS = `
  .ty { background:#fafafa; min-height:100vh;
    display:flex; align-items:center; justify-content:center;
    padding:48px 16px; }
  .ty *, .ty *::before, .ty *::after { box-sizing:border-box; }

  /* Tick circle animation */
  @keyframes ty-scale-in {
    0%   { transform:scale(0.4); opacity:0; }
    60%  { transform:scale(1.08); opacity:1; }
    100% { transform:scale(1); }
  }
  @keyframes ty-draw {
    from { stroke-dashoffset:60; }
    to   { stroke-dashoffset:0; }
  }
  @keyframes ty-fade-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ty-pulse-ring {
    0%   { transform:scale(1); opacity:0.6; }
    100% { transform:scale(1.55); opacity:0; }
  }

  .ty-circle-wrap {
    position:relative; display:inline-flex;
    align-items:center; justify-content:center;
    margin-bottom:28px;
  }
  .ty-ring {
    position:absolute; inset:0; border-radius:50%;
    border:2px solid ${INK};
    animation: ty-pulse-ring 1.6s ease-out 0.3s infinite;
  }
  .ty-circle {
    width:88px; height:88px; border-radius:50%;
    background:${INK};
    display:flex; align-items:center; justify-content:center;
    animation: ty-scale-in 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .ty-tick {
    stroke-dasharray:60;
    stroke-dashoffset:60;
    animation: ty-draw 0.45s ease 0.45s forwards;
  }

  .ty-content { animation: ty-fade-up 0.5s ease 0.3s both; }
  .ty-card    { animation: ty-fade-up 0.5s ease 0.5s both; }
  .ty-info    { animation: ty-fade-up 0.5s ease 0.65s both; }
  .ty-actions { animation: ty-fade-up 0.5s ease 0.8s both; }

  .ty-info-cell {
    padding:16px; border:1px solid ${RULE}; background:${WHT};
    display:flex; flex-direction:column; align-items:center; gap:6px;
  }

  .ty-btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:12px 32px; background:${INK}; color:${WHT};
    text-decoration:none; border:none; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase;
    transition:background 0.18s;
  }
  .ty-btn-primary:hover { background:#333; }
  .ty-btn-ghost {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:12px 32px; background:none; color:${INK};
    text-decoration:none; border:1px solid ${RULE}; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase;
    transition:border-color 0.18s;
  }
  .ty-btn-ghost:hover { border-color:${INK}; }
`

function ThankYouContent() {
  const { id }       = useParams()
  const searchParams = useSearchParams()
  const method       = searchParams.get('method') || 'upi'
  const amount       = searchParams.get('amount') || ''
  const isUpi        = UPI_METHODS.includes(method)

  const [show, setShow] = useState(false)
  useEffect(() => {
    /* Small delay so animations feel deliberate */
    const t = setTimeout(() => setShow(true), 80)
    return () => clearTimeout(t)
  }, [])

  const methodLabel = method === 'phonepe'   ? 'PhonePe'
                    : method === 'googlepay' ? 'Google Pay'
                    : method === 'upi'       ? 'UPI'
                    : method === 'cod'       ? 'Cash on Delivery'
                    : 'UPI'

  if (!show) return null

  return (
    <>
      <style>{PAGE_CSS}</style>
      <main className="ty">
        <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>

          {/* Animated tick circle */}
          <div className="ty-circle-wrap">
            <div className="ty-ring" />
            <div className="ty-circle">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <polyline className="ty-tick"
                  points="8,18 15,25 28,11"
                  stroke="#fff" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="ty-content">
            <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:32,
              fontWeight:700, color:INK, marginBottom:8 }}>
              Order Placed!
            </h1>
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, marginBottom:28 }}>
              Thank you for shopping with Kurti Cove
            </p>
          </div>

          {/* Order ID card */}
          <div className="ty-card" style={{ background:WHT, border:`1px solid ${RULE}`,
            padding:24, marginBottom:20, textAlign:'left' }}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              marginBottom:16 }}>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600,
                letterSpacing:'0.14em', textTransform:'uppercase', color:MUTE, margin:0 }}>
                Order ID
              </p>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:700,
                color:INK, margin:0, letterSpacing:'0.04em' }}>
                #{id?.slice(-12)?.toUpperCase()}
              </p>
            </div>

            <hr style={{ border:'none', borderTop:`1px solid ${RULE}`, marginBottom:16 }} />

            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE,
              lineHeight:1.65, margin:0 }}>
              {isUpi
                ? `Your order has been placed. We will verify your ${methodLabel} payment${amount ? ` of ₹${Number(amount).toLocaleString()}` : ''} and confirm it shortly.`
                : 'Your order has been placed and will be delivered via Cash on Delivery.'}
            </p>

            {isUpi && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14,
                padding:'10px 14px', background:'#f5f5f5' }}>
                <div style={{ width:8, height:8, borderRadius:'50%',
                  background:'#f59e0b', flexShrink:0,
                  animation:'pulse 1.5s ease infinite' }} />
                <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:INK, margin:0 }}>
                  Awaiting payment verification
                </p>
              </div>
            )}
          </div>

          {/* Info cells */}
          <div className="ty-info" style={{ display:'grid',
            gridTemplateColumns:'repeat(3,1fr)', gap:1,
            background:RULE, border:`1px solid ${RULE}`, marginBottom:24 }}>
            {[
              { Icon:Package,    label:'Order',    value:'Placed'                 },
              { Icon:Truck,      label:'Shipping', value:'Express'                },
              { Icon:CreditCard, label:'Payment',  value: isUpi ? methodLabel : 'COD' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="ty-info-cell">
                <Icon size={18} strokeWidth={1.5} color={INK} />
                <p style={{ fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600,
                  letterSpacing:'0.10em', textTransform:'uppercase', color:MUTE, margin:0 }}>
                  {label}
                </p>
                <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
                  color:INK, margin:0 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="ty-actions" style={{ display:'flex', gap:10,
            justifyContent:'center', flexWrap:'wrap' }}>
            <Link href={`/orders/${id}`} className="ty-btn-primary">
              <Package size={14} /> View My Order
            </Link>
            <Link href="/shop" className="ty-btn-ghost">
              <ShoppingBag size={14} /> Continue Shopping
            </Link>
          </div>

        </div>
      </main>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
        justifyContent:'center', background:'#fafafa' }}>
        <div style={{ width:28, height:28, borderRadius:'50%',
          border:'2.5px solid #141414', borderTopColor:'transparent',
          animation:'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
