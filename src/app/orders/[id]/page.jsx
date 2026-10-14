'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import API from '../../../utils/Helper'
import toast from 'react-hot-toast'

/* ── Palette ── */
const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered']

const ORDER_STATUS = {
  placed:           { bg:'#fef9c3', text:'#92400e', border:'#fde68a' },
  confirmed:        { bg:'#dbeafe', text:'#1e40af', border:'#bfdbfe' },
  shipped:          { bg:'#e0e7ff', text:'#3730a3', border:'#c7d2fe' },
  out_for_delivery: { bg:'#ffedd5', text:'#9a3412', border:'#fed7aa' },
  delivered:        { bg:'#dcfce7', text:'#166534', border:'#bbf7d0' },
  cancelled:        { bg:'#fee2e2', text:'#991b1b', border:'#fecaca' },
}
const PAY_STATUS = {
  paid:                 { bg:'#dcfce7', text:'#166534', border:'#bbf7d0' },
  failed:               { bg:'#fee2e2', text:'#991b1b', border:'#fecaca' },
  pending:              { bg:'#fef9c3', text:'#92400e', border:'#fde68a' },
  pending_verification: { bg:'#fef9c3', text:'#92400e', border:'#fde68a' },
}

const PAGE_CSS = `
  .od { background:#fafafa; min-height:100vh; }
  .od *, .od *::before, .od *::after { box-sizing:border-box; }
  .od-card {
    background:#fff; border:1px solid ${RULE};
    padding:24px; margin-bottom:16px;
  }
  .od-section-title {
    font-family:Poppins,sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase; color:${INK};
    margin:0 0 16px;
  }
  .od-badge {
    display:inline-block; padding:3px 10px;
    font-family:Poppins,sans-serif; font-size:10px; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase;
    border-radius:0;
  }
  .od-btn-cancel {
    font-family:Poppins,sans-serif; font-size:10px; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase;
    color:#ef4444; background:none;
    border:1px solid #fecaca; padding:3px 10px; cursor:pointer;
    border-radius:0; transition:border-color 0.15s;
  }
  .od-btn-cancel:hover { border-color:#ef4444; }
`

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function OrderDetailPage() {
  const { id }    = useParams()
  const router    = useRouter()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/order/${id}`)
        if (res.data.success) setOrder(res.data.data)
      } catch { toast.error('Failed to load order.'); router.push('/orders') }
      finally { setLoading(false) }
    }
    if (id) fetchOrder()
  }, [id, router])

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    try {
      await API.patch(`/order/cancel/${id}`)
      setOrder(prev => ({ ...prev, orderStatus: 'cancelled', cancelledAt: new Date() }))
      toast.success('Order cancelled.')
    } catch (err) { toast.error(err.response?.data?.msg || 'Cannot cancel this order.') }
  }

  const currentStep = STATUS_STEPS.indexOf(order?.orderStatus)

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#fafafa' }}>
      <div style={{ width:28, height:28, borderRadius:'50%',
        border:`2.5px solid ${INK}`, borderTopColor:'transparent',
        animation:'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!order) return null

  const oSt = ORDER_STATUS[order.orderStatus] || { bg:'#f3f4f6', text:'#6b7280', border:'#e5e7eb' }

  return (
    <>
      <style>{PAGE_CSS}</style>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <main className="od">
        <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 16px 64px' }}>

          {/* Breadcrumb / back */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:24,
            fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>
            <button onClick={() => router.push('/orders')}
              style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>
              My Orders
            </button>
            <span>/</span>
            <span style={{ color:INK }}>Order Details</span>
          </div>

          {/* Header */}
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start',
            justifyContent:'space-between', gap:12, marginBottom:28 }}>
            <div>
              <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
                fontWeight:700, color:INK, margin:'0 0 4px' }}>
                Order Details
              </h1>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, margin:0 }}>
                #{order._id.slice(-12).toUpperCase()}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <span className="od-badge"
                style={{ background:oSt.bg, color:oSt.text, border:`1px solid ${oSt.border}` }}>
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
              {order.orderStatus === 'placed' && (
                <button className="od-btn-cancel" onClick={handleCancel}>
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Main two-column layout */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:24, alignItems:'flex-start' }}>

            {/* ── LEFT column ── */}
            <div style={{ flex:'1 1 480px', minWidth:0 }}>

              {/* Timeline */}
              {order.orderStatus !== 'cancelled' && (
                <div className="od-card">
                  <p className="od-section-title">Order Timeline</p>

                  {/* Mobile: vertical */}
                  <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    {STATUS_STEPS.map((step, i) => {
                      const done   = i <= currentStep
                      const isLast = i === STATUS_STEPS.length - 1
                      return (
                        <div key={step} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                          {/* dot + connector */}
                          <div style={{ display:'flex', flexDirection:'column',
                            alignItems:'center', flexShrink:0, width:20 }}>
                            <div style={{
                              width:20, height:20,
                              background: done ? INK : WHT,
                              border: `2px solid ${done ? INK : RULE}`,
                              borderRadius:0,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              flexShrink:0,
                            }}>
                              {done && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <polyline points="1.5,5 4,7.5 8.5,2.5"
                                    stroke={WHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            {!isLast && (
                              <div style={{
                                width:2, flex:1, minHeight:24,
                                background: i < currentStep ? INK : RULE,
                              }} />
                            )}
                          </div>
                          {/* label */}
                          <p style={{
                            fontFamily:'Poppins,sans-serif', fontSize:12,
                            color: done ? INK : MUTE,
                            fontWeight: done ? 600 : 400,
                            textTransform:'capitalize',
                            paddingBottom: isLast ? 0 : 20,
                            margin:0, paddingTop:1, lineHeight:'1.3',
                          }}>
                            {step.replace(/_/g, ' ')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="od-card">
                <p className="od-section-title">Items ({order.items.length})</p>
                <div>
                  {order.items.map((item, i) => (
                    <div key={i} style={{
                      display:'flex', gap:14, alignItems:'flex-start',
                      paddingBottom: i < order.items.length - 1 ? 16 : 0,
                      marginBottom: i < order.items.length - 1 ? 16 : 0,
                      borderBottom: i < order.items.length - 1 ? `1px solid ${RULE}` : 'none',
                    }}>
                      <div style={{ width:56, height:68, background:'#f5f5f5',
                        overflow:'hidden', flexShrink:0, borderRadius:0 }}>
                        {item.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={item.image} alt={item.name}
                              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                          : <div style={{ width:'100%', height:'100%', display:'flex',
                              alignItems:'center', justifyContent:'center', fontSize:22 }}>👗</div>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13,
                          fontWeight:600, color:INK, margin:'0 0 3px' }}>
                          {item.name}
                        </p>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12,
                          color:MUTE, margin:'0 0 2px' }}>
                          Qty: {item.qty}
                        </p>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, margin:0 }}>
                          ₹{item.price.toLocaleString()} each
                        </p>
                      </div>
                      <p style={{ fontFamily:'"Playfair Display",Georgia,serif',
                        fontSize:14, fontWeight:700, color:INK, flexShrink:0, margin:0 }}>
                        ₹{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT column ── */}
            <div style={{ width:300, flexShrink:0 }}>

              {/* Delivery Address */}
              <div className="od-card">
                <p className="od-section-title">Delivery Address</p>
                <div style={{ fontFamily:'Poppins,sans-serif', fontSize:13 }}>
                  <p style={{ fontWeight:600, color:INK, margin:'0 0 3px' }}>{order.address.fullName}</p>
                  <p style={{ color:MUTE, margin:'0 0 2px' }}>{order.address.mobile}</p>
                  <p style={{ color:MUTE, margin:'0 0 2px' }}>{order.address.addressLine}</p>
                  <p style={{ color:MUTE, margin:'0 0 2px' }}>{order.address.city}, {order.address.state}</p>
                  <p style={{ color:MUTE, margin:0 }}>Pincode: {order.address.pincode}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="od-card">
                <p className="od-section-title">Payment Info</p>
                <div style={{ fontFamily:'Poppins,sans-serif', fontSize:13 }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    marginBottom:8, color:MUTE }}>
                    <span>Method</span>
                    <span style={{ fontWeight:600, color:INK, textTransform:'uppercase' }}>
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    marginBottom:12, color:MUTE }}>
                    <span>Status</span>
                    {(() => {
                      const ps = PAY_STATUS[order.paymentStatus] || { bg:'#f3f4f6', text:'#6b7280', border:'#e5e7eb' }
                      return (
                        <span className="od-badge"
                          style={{ background:ps.bg, color:ps.text, border:`1px solid ${ps.border}` }}>
                          {(order.paymentStatus || 'pending').replace(/_/g,' ')}
                        </span>
                      )
                    })()}
                  </div>
                  <div style={{ borderTop:`1px solid ${RULE}`, paddingTop:12,
                    display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13,
                      fontWeight:600, color:INK }}>Total</span>
                    <span style={{ fontFamily:'"Playfair Display",Georgia,serif',
                      fontSize:20, fontWeight:700, color:INK }}>
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="od-card">
                <p className="od-section-title">Dates</p>
                <div style={{ fontFamily:'Poppins,sans-serif', fontSize:12,
                  display:'flex', flexDirection:'column', gap:6 }}>
                  <div>
                    <span style={{ color:MUTE }}>Placed on: </span>
                    <span style={{ color:INK, fontWeight:500 }}>{formatDate(order.createdAt)}</span>
                  </div>
                  {order.cancelledAt && (
                    <div>
                      <span style={{ color:MUTE }}>Cancelled on: </span>
                      <span style={{ color:'#ef4444', fontWeight:500 }}>{formatDate(order.cancelledAt)}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div>
                      <span style={{ color:MUTE }}>Delivered on: </span>
                      <span style={{ color:'#16a34a', fontWeight:500 }}>{formatDate(order.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
