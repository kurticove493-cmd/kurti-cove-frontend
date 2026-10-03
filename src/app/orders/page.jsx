'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { Package, ChevronRight } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const ROSE = '#E05C88'
const WHT  = '#ffffff'

const ORDER_STATUS = {
  placed:           { bg:'#fef9c3', text:'#92400e', border:'#fde68a' },
  confirmed:        { bg:'#dbeafe', text:'#1e40af', border:'#bfdbfe' },
  shipped:          { bg:'#e0e7ff', text:'#3730a3', border:'#c7d2fe' },
  out_for_delivery: { bg:'#ffedd5', text:'#9a3412', border:'#fed7aa' },
  delivered:        { bg:'#dcfce7', text:'#166534', border:'#bbf7d0' },
  cancelled:        { bg:'#fee2e2', text:'#991b1b', border:'#fecaca' },
}
const PAY_STATUS = {
  paid:    { bg:'#dcfce7', text:'#166534', border:'#bbf7d0' },
  failed:  { bg:'#fee2e2', text:'#991b1b', border:'#fecaca' },
  pending: { bg:'#fef9c3', text:'#92400e', border:'#fde68a' },
  pending_verification: { bg:'#fef9c3', text:'#92400e', border:'#fde68a' },
}

function Badge({ status, map }) {
  const s = map[status] || { bg:'#f3f4f6', text:'#6b7280', border:'#e5e7eb' }
  return (
    <span style={{
      display:'inline-block', padding:'3px 10px',
      fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600,
      letterSpacing:'0.08em', textTransform:'uppercase',
      background:s.bg, color:s.text, border:`1px solid ${s.border}`,
    }}>
      {status.replace(/_/g,' ')}
    </span>
  )
}

const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })

const PAGE_CSS = `
  .ord { background:#fafafa; min-height:100vh; }
  .ord *, .ord *::before, .ord *::after { box-sizing:border-box; }
  .ord-card {
    background:#fff; border:1px solid ${RULE};
    padding:20px; margin-bottom:12px;
    transition:border-color 0.15s;
  }
  .ord-card:hover { border-color:#bbb; }
`

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/order/my-orders')
      .then(res => { if (res.data.success) setOrders(res.data.data) })
      .catch(() => toast.error('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return
    try {
      await API.patch(`/order/cancel/${orderId}`)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus:'cancelled' } : o))
      toast.success('Order cancelled.')
    } catch (err) { toast.error(err.response?.data?.msg || 'Cannot cancel this order.') }
  }

  return (
    <>
      <style>{PAGE_CSS}</style>
      <main className="ord">
        <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 16px 64px' }}>

          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:24,
            fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>
            <Link href="/profile" style={{ color:MUTE, textDecoration:'none' }}>Account</Link>
            <span>/</span>
            <span style={{ color:INK }}>My Orders</span>
          </div>

          <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
            fontWeight:700, color:INK, marginBottom:28 }}>
            My Orders
          </h1>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
              <div style={{ width:28, height:28, borderRadius:'50%',
                border:`2.5px solid ${INK}`, borderTopColor:'transparent',
                animation:'spin .7s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ background:WHT, border:`1px solid ${RULE}`, padding:'64px 24px', textAlign:'center' }}>
              <Package size={44} color={RULE} style={{ margin:'0 auto 16px' }} />
              <h2 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:22,
                fontWeight:700, color:INK, marginBottom:8 }}>
                No orders yet
              </h2>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, marginBottom:24 }}>
                Your orders will appear here once you shop
              </p>
              <Link href="/shop" style={{
                display:'inline-block', padding:'11px 32px',
                background:INK, color:WHT, textDecoration:'none',
                fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
                letterSpacing:'0.14em', textTransform:'uppercase',
              }}>
                Shop Now
              </Link>
            </div>
          ) : (
            <div>
              {orders.map(order => (
                <div key={order._id} className="ord-card">

                  {/* Top row: ID + date + status */}
                  <div style={{ display:'flex', alignItems:'flex-start',
                    justifyContent:'space-between', gap:12, marginBottom:16, flexWrap:'wrap' }}>
                    <div>
                      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11,
                        fontWeight:600, color:MUTE, letterSpacing:'0.08em',
                        textTransform:'uppercase', margin:'0 0 3px' }}>
                        Order #{order._id.slice(-10).toUpperCase()}
                      </p>
                      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11,
                        color:MUTE, margin:0 }}>
                        {fmtDate(order.createdAt)}
                      </p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <Badge status={order.orderStatus} map={ORDER_STATUS} />
                      {order.orderStatus === 'placed' && (
                        <button onClick={() => handleCancel(order._id)} style={{
                          fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600,
                          letterSpacing:'0.08em', textTransform:'uppercase',
                          color:'#ef4444', background:'none',
                          border:'1px solid #fecaca', padding:'3px 10px', cursor:'pointer',
                          transition:'border-color 0.15s',
                        }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product thumbnails */}
                  <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto',
                    paddingBottom:4, scrollbarWidth:'none' }}>
                    {order.items.slice(0,5).map((item, i) => (
                      <div key={i} style={{ flexShrink:0, width:52, height:60,
                        background:'#f5f5f5', overflow:'hidden' }}>
                        {item.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={item.image} alt={item.name}
                              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                          : <div style={{ width:'100%', height:'100%', display:'flex',
                              alignItems:'center', justifyContent:'center', fontSize:22 }}>👗</div>}
                      </div>
                    ))}
                    {order.items.length > 5 && (
                      <div style={{ flexShrink:0, width:52, height:60, background:'#f5f5f5',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>
                          +{order.items.length - 5}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom row: amount + payment + link */}
                  <div style={{ display:'flex', alignItems:'center',
                    justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <p style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:18,
                        fontWeight:700, color:INK, margin:'0 0 6px' }}>
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:10,
                          color:MUTE, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                          {(order.paymentMethod||'upi').toUpperCase()}
                        </span>
                        <Badge status={order.paymentStatus||'pending'} map={PAY_STATUS} />
                        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>
                          · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <Link href={`/orders/${order._id}`} style={{
                      display:'inline-flex', alignItems:'center', gap:4,
                      fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:500,
                      color:INK, textDecoration:'none', textTransform:'uppercase',
                      letterSpacing:'0.08em', borderBottom:`1px solid ${INK}`,
                      paddingBottom:1,
                    }}>
                      View Details <ChevronRight size={13} strokeWidth={2} />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
