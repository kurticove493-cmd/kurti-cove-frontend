'use client'
/**
 * thank-you/[id]/page.jsx
 *
 * SOURCE OF TRUTH: backend order status — never URL params.
 *
 * States:
 *  loading           — fetching order from backend
 *  awaiting_payment  — UPI order placed, payment not yet verified
 *  confirmed/paid    — admin has verified and confirmed payment
 *  cancelled/rejected — payment rejected or order cancelled
 *  fallback          — order found but status unknown (shows pending)
 *  error             — order not found or network failure
 */

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingBag, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import API from '../../../utils/Helper'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const UPI_METHODS = ['upi', 'phonepe', 'googlepay']

// Poll interval while order is pending (ms)
const POLL_INTERVAL = 30_000

const PAGE_CSS = `
  .ty { background:#fafafa; min-height:100vh;
    display:flex; align-items:center; justify-content:center;
    padding:48px 16px; }
  .ty *, .ty *::before, .ty *::after { box-sizing:border-box; }

  @keyframes ty-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ty-scale-in {
    0%   { transform:scale(0.5); opacity:0; }
    70%  { transform:scale(1.05); opacity:1; }
    100% { transform:scale(1); }
  }
  @keyframes ty-draw {
    from { stroke-dashoffset:60; }
    to   { stroke-dashoffset:0; }
  }
  @keyframes ty-pulse-ring {
    0%   { transform:scale(1); opacity:0.6; }
    100% { transform:scale(1.55); opacity:0; }
  }
  @keyframes kc-spin { to { transform:rotate(360deg); } }
  @keyframes kc-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }

  .ty-fade { animation: ty-fade-up 0.45s ease both; }

  /* Confirmed tick */
  .ty-circle-wrap {
    position:relative; display:inline-flex;
    align-items:center; justify-content:center; margin-bottom:24px;
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
    stroke-dasharray:60; stroke-dashoffset:60;
    animation: ty-draw 0.45s ease 0.45s forwards;
  }

  .ty-btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:12px 32px; background:${INK}; color:${WHT};
    text-decoration:none; border:none; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase; transition:background 0.18s;
  }
  .ty-btn-primary:hover { background:#333; }
  .ty-btn-ghost {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:12px 32px; background:none; color:${INK};
    text-decoration:none; border:1px solid ${RULE}; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase; transition:border-color 0.18s;
  }
  .ty-btn-ghost:hover { border-color:${INK}; }
`

/* ── Status helpers ─────────────────────────────────────────── */
const isConfirmed = (order) =>
  order?.paymentStatus === 'paid' || order?.orderStatus === 'confirmed'

const isRejected = (order) =>
  order?.paymentStatus === 'rejected' || order?.paymentStatus === 'failed' ||
  order?.orderStatus === 'cancelled'

const isPending = (order) =>
  !isConfirmed(order) && !isRejected(order)

/* ── Views ──────────────────────────────────────────────────── */

function LoadingView() {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{
        width:36, height:36, borderRadius:'50%',
        border:`3px solid ${INK}`, borderTopColor:'transparent',
        animation:'kc-spin .7s linear infinite', margin:'0 auto 16px',
      }} />
      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE }}>
        Loading order status…
      </p>
    </div>
  )
}

function PendingView({ order, onRefresh, refreshing }) {
  const method = (order?.paymentMethod || 'UPI').toUpperCase()
  const amount = order?.totalAmount

  return (
    <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
      {/* Amber clock icon */}
      <div style={{ marginBottom:24 }}>
        <div style={{
          width:88, height:88, borderRadius:'50%',
          background:'#fef3c7', border:'2px solid #fde68a',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto',
        }}>
          <Clock size={40} color="#d97706" strokeWidth={1.5} />
        </div>
      </div>

      <div className="ty-fade" style={{ animationDelay:'0.1s' }}>
        <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
          fontWeight:700, color:INK, marginBottom:8 }}>
          Waiting for Payment Confirmation
        </h1>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, marginBottom:28 }}>
          Your order has been received but payment is not yet verified.
        </p>
      </div>

      {/* Info card */}
      <div className="ty-fade" style={{
        animationDelay:'0.2s',
        background:WHT, border:`1px solid #fde68a`,
        borderLeft:'4px solid #f59e0b',
        padding:24, marginBottom:20, textAlign:'left',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#f59e0b', flexShrink:0,
            animation:'kc-pulse 1.5s ease infinite' }} />
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
            color:'#92400e', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Payment Pending Verification
          </span>
        </div>

        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:INK,
          lineHeight:1.65, margin:'0 0 14px' }}>
          Your {method} payment{amount ? ` of ₹${Number(amount).toLocaleString()}` : ''} is awaiting manual verification by our team. Your order will be confirmed once the payment is verified.
        </p>

        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE,
          lineHeight:1.6, margin:0 }}>
          This usually takes a few minutes during business hours. You will receive an email confirmation once your order is approved.
        </p>

        {order?._id && (
          <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${RULE}` }}>
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11,
              fontWeight:600, letterSpacing:'0.10em', textTransform:'uppercase', color:MUTE }}>
              Order Reference
            </span>
            <p style={{ fontFamily:'monospace', fontSize:13, fontWeight:700,
              color:INK, margin:'4px 0 0' }}>
              #{order._id.slice(-12).toUpperCase()}
            </p>
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div className="ty-fade" style={{ animationDelay:'0.3s', marginBottom:20 }}>
        <button onClick={onRefresh} disabled={refreshing} style={{
          display:'inline-flex', alignItems:'center', gap:6,
          padding:'9px 20px', background:'none', border:`1px solid ${RULE}`,
          cursor:refreshing?'not-allowed':'pointer', fontFamily:'Poppins,sans-serif',
          fontSize:11, fontWeight:600, letterSpacing:'0.10em', textTransform:'uppercase',
          color:INK, opacity:refreshing?0.5:1, transition:'border-color 0.15s',
        }}>
          <RefreshCw size={12} strokeWidth={2}
            style={{ animation:refreshing?'kc-spin .7s linear infinite':'none' }} />
          {refreshing ? 'Checking…' : 'Check Status'}
        </button>
      </div>

      {/* Actions */}
      <div className="ty-fade" style={{ animationDelay:'0.4s',
        display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <Link href={`/orders/${order?._id}`} className="ty-btn-primary">
          <Package size={14} /> View Order Status
        </Link>
        <Link href="/shop" className="ty-btn-ghost">
          <ShoppingBag size={14} /> Continue Shopping
        </Link>
      </div>
    </div>
  )
}

function ConfirmedView({ order }) {
  const method = (order?.paymentMethod || 'UPI').toUpperCase()

  return (
    <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
      {/* Animated tick */}
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

      <div className="ty-fade" style={{ animationDelay:'0.1s' }}>
        <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:32,
          fontWeight:700, color:INK, marginBottom:8 }}>
          Order Placed Successfully!
        </h1>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, marginBottom:28 }}>
          Thank you for shopping with Kurti Cove. Your payment has been verified.
        </p>
      </div>

      {/* Info card */}
      <div className="ty-fade" style={{
        animationDelay:'0.2s',
        background:WHT, border:`1px solid #bbf7d0`,
        borderLeft:'4px solid #16a34a',
        padding:24, marginBottom:20, textAlign:'left',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <CheckCircle size={16} color="#16a34a" strokeWidth={2} />
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
            color:'#166534', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Payment Verified
          </span>
        </div>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:INK,
          lineHeight:1.65, margin:'0 0 14px' }}>
          Your {method} payment has been confirmed. We will process and ship your order shortly.
        </p>
        {order?._id && (
          <div style={{ paddingTop:14, borderTop:`1px solid ${RULE}` }}>
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11,
              fontWeight:600, letterSpacing:'0.10em', textTransform:'uppercase', color:MUTE }}>
              Order Reference
            </span>
            <p style={{ fontFamily:'monospace', fontSize:13, fontWeight:700,
              color:INK, margin:'4px 0 0' }}>
              #{order._id.slice(-12).toUpperCase()}
            </p>
          </div>
        )}
      </div>

      {/* Grid cells */}
      <div className="ty-fade" style={{
        animationDelay:'0.3s',
        display:'grid', gridTemplateColumns:'repeat(3,1fr)',
        gap:1, background:RULE, border:`1px solid ${RULE}`, marginBottom:24,
      }}>
        {[
          { Icon:Package,      label:'Order',    value:'Confirmed' },
          { Icon:ShoppingBag,  label:'Shipping', value:'Express'   },
          { Icon:CheckCircle,  label:'Payment',  value:method      },
        ].map(({ Icon, label, value }) => (
          <div key={label} style={{ padding:16, background:WHT,
            display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
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

      <div className="ty-fade" style={{ animationDelay:'0.4s',
        display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <Link href={`/orders/${order?._id}`} className="ty-btn-primary">
          <Package size={14} /> View My Order
        </Link>
        <Link href="/shop" className="ty-btn-ghost">
          <ShoppingBag size={14} /> Continue Shopping
        </Link>
      </div>
    </div>
  )
}

function RejectedView({ order }) {
  const reason = order?.paymentRejectionReason

  return (
    <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
      <div style={{ marginBottom:24 }}>
        <div style={{
          width:88, height:88, borderRadius:'50%',
          background:'#fef2f2', border:'2px solid #fecaca',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto',
        }}>
          <XCircle size={40} color="#dc2626" strokeWidth={1.5} />
        </div>
      </div>

      <div className="ty-fade" style={{ animationDelay:'0.1s' }}>
        <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
          fontWeight:700, color:INK, marginBottom:8 }}>
          Payment Not Verified
        </h1>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, marginBottom:28 }}>
          We were unable to verify your payment for this order.
        </p>
      </div>

      <div className="ty-fade" style={{
        animationDelay:'0.2s',
        background:WHT, border:`1px solid #fecaca`,
        borderLeft:'4px solid #dc2626',
        padding:24, marginBottom:24, textAlign:'left',
      }}>
        {reason && (
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#991b1b',
            fontWeight:600, margin:'0 0 12px' }}>
            Reason: {reason}
          </p>
        )}
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:INK,
          lineHeight:1.65, margin:0 }}>
          If you believe this is an error, please contact our support team with your payment screenshot. Your order reference is{' '}
          <strong>#{order?._id?.slice(-12)?.toUpperCase()}</strong>.
        </p>
      </div>

      <div className="ty-fade" style={{ animationDelay:'0.3s',
        display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <Link href={`/orders/${order?._id}`} className="ty-btn-ghost">
          <Package size={14} /> View Order
        </Link>
        <Link href="/shop" className="ty-btn-ghost">
          <ShoppingBag size={14} /> Continue Shopping
        </Link>
      </div>
    </div>
  )
}

/* ── Main content component ─────────────────────────────────── */
function ThankYouContent() {
  const { id }       = useParams()
  const searchParams = useSearchParams()
  const method       = searchParams.get('method') || 'upi'

  const [order,      setOrder]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  const fetchOrder = useCallback(async (isRefresh = false) => {
    if (!id) return
    if (isRefresh) setRefreshing(true)
    try {
      const res = await API.get(`/order/${id}`)
      if (res.data.success) {
        setOrder(res.data.data)
        setFetchError(false)
      }
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  // Initial fetch
  useEffect(() => { fetchOrder(false) }, [fetchOrder])

  // Poll every 30 s while order is pending and UPI
  useEffect(() => {
    if (!order) return
    if (!UPI_METHODS.includes(order.paymentMethod)) return
    if (!isPending(order)) return  // stop polling once confirmed/rejected

    const id = setInterval(() => fetchOrder(false), POLL_INTERVAL)
    return () => clearInterval(id)
  }, [order, fetchOrder])

  // Re-fetch when tab becomes visible (user returns from UPI app)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && order && isPending(order)) {
        fetchOrder(true)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [order, fetchOrder])

  if (loading) {
    return (
      <>
        <style>{PAGE_CSS}</style>
        <main className="ty"><LoadingView /></main>
      </>
    )
  }

  // Order not found or network error
  if (fetchError || !order) {
    return (
      <>
        <style>{PAGE_CSS}</style>
        <main className="ty">
          <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
            <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
              fontWeight:700, color:INK, marginBottom:8 }}>
              Order Not Found
            </h1>
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, marginBottom:24 }}>
              We could not load this order. Please check your order history.
            </p>
            <Link href="/orders" className="ty-btn-primary">
              <Package size={14} /> My Orders
            </Link>
          </div>
        </main>
      </>
    )
  }

  // COD or non-UPI — always show confirmed (no manual verification needed)
  const isUpiOrder = UPI_METHODS.includes(order.paymentMethod)
  if (!isUpiOrder) {
    return (
      <>
        <style>{PAGE_CSS}</style>
        <main className="ty"><ConfirmedView order={order} /></main>
        <style>{`@keyframes kc-spin{to{transform:rotate(360deg)}}`}</style>
      </>
    )
  }

  // UPI — show state-based view
  const view = isConfirmed(order) ? 'confirmed'
             : isRejected(order)  ? 'rejected'
             : 'pending'

  return (
    <>
      <style>{PAGE_CSS}</style>
      <main className="ty">
        {view === 'confirmed' && <ConfirmedView order={order} />}
        {view === 'rejected'  && <RejectedView  order={order} />}
        {view === 'pending'   && (
          <PendingView
            order={order}
            onRefresh={() => fetchOrder(true)}
            refreshing={refreshing}
          />
        )}
      </main>
      <style>{`@keyframes kc-spin{to{transform:rotate(360deg)}}`}</style>
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
          animation:'kc-spin .7s linear infinite' }} />
        <style>{`@keyframes kc-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
