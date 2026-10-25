'use client'
import { useState, useEffect, useCallback } from 'react'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const STATUS_COLORS = {
  awaiting_payment: { bg:'#fef3c7', color:'#92400e' },
  placed:           { bg:'#fef9c3', color:'#854d0e' },
  confirmed:        { bg:'#dbeafe', color:'#1e40af' },
  processing:       { bg:'#dbeafe', color:'#1e40af' },
  shipped:          { bg:'#e0e7ff', color:'#3730a3' },
  out_for_delivery: { bg:'#ffedd5', color:'#9a3412' },
  delivered:        { bg:'#dcfce7', color:'#166534' },
  cancelled:        { bg:'#fee2e2', color:'#991b1b' },
}

const PAY_COLORS = {
  paid:                 { bg:'#dcfce7', color:'#166534' },
  failed:               { bg:'#fee2e2', color:'#991b1b' },
  rejected:             { bg:'#fee2e2', color:'#991b1b' },
  pending:              { bg:'#fef9c3', color:'#854d0e' },
  pending_verification: { bg:'#fef3c7', color:'#92400e' },
  awaiting_verification:{ bg:'#fef3c7', color:'#92400e' },
}

const STATUS_OPTIONS = [
  'awaiting_payment','placed','confirmed','processing',
  'shipped','out_for_delivery','delivered','cancelled',
]
const UPI_METHODS = ['upi','phonepe','googlepay']

const OT_CSS = `
  .ot-table { width:100%; border-collapse:collapse; font-family:Poppins,sans-serif; font-size:12px; }
  .ot-table th {
    text-align:left; padding:10px 14px;
    font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase;
    color:${MUTE}; background:#fafafa; border-bottom:1px solid ${RULE};
  }
  .ot-table td { padding:11px 14px; border-bottom:1px solid ${RULE}; color:${INK}; vertical-align:middle; }
  .ot-table tr:last-child td { border-bottom:none; }
  .ot-table tr:hover td { background:#fafafa; }
  .ot-badge {
    display:inline-block; padding:2px 8px;
    font-family:Poppins,sans-serif; font-size:10px; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase;
  }
  .ot-search {
    padding:9px 14px; border:1px solid ${RULE}; background:${WHT};
    font-family:Poppins,sans-serif; font-size:13px; color:${INK};
    outline:none; width:260px; border-radius:0; transition:border-color 0.15s;
  }
  .ot-search:focus { border-color:${INK}; }
  .ot-select {
    padding:6px 10px; border:1px solid ${RULE};
    font-family:Poppins,sans-serif; font-size:11px; color:${INK};
    background:${WHT}; outline:none; cursor:pointer; border-radius:0;
  }
  .ot-pgbtn {
    padding:7px 18px; background:none; color:${INK};
    border:1px solid ${RULE}; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:11px; font-weight:500;
    letter-spacing:0.08em; text-transform:uppercase; transition:border-color 0.15s;
  }
  .ot-pgbtn:hover:not(:disabled) { border-color:${INK}; }
  .ot-pgbtn:disabled { opacity:0.35; cursor:not-allowed; }
  .ot-action-btn {
    display:inline-flex; align-items:center; gap:4px;
    padding:5px 10px; border:none; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:10px; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase; transition:opacity 0.15s;
  }
  .ot-action-btn:hover { opacity:0.8; }
  .ot-action-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .ot-backdrop {
    position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:999;
    display:flex; align-items:center; justify-content:center; padding:16px;
  }
  .ot-modal {
    background:#fff; border:1px solid ${RULE};
    width:100%; max-width:480px; padding:28px 28px 24px;
  }
`

/* ── Confirm Payment Modal ── */
function ConfirmModal({ order, onClose, onSuccess }) {
  const [ref,     setRef]     = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      await API.patch(`/order/admin/confirm-payment/${order._id}`, { paymentReference: ref })
      toast.success('Payment confirmed!')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to confirm payment.')
    } finally { setLoading(false) }
  }

  return (
    <div className="ot-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ot-modal">
        <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:18, fontWeight:700, color:INK, margin:'0 0 16px' }}>
          Confirm UPI Payment
        </h3>
        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'12px 14px', marginBottom:16 }}>
          <p style={{ margin:0, fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600, color:'#166534' }}>
            Order #{String(order._id).slice(-8).toUpperCase()} — ₹{order.totalAmount?.toLocaleString()}
          </p>
          <p style={{ margin:'4px 0 0', fontFamily:'Poppins,sans-serif', fontSize:11, color:'#166534' }}>
            {order.user?.name} · {order.user?.email}
          </p>
        </div>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, margin:'0 0 16px' }}>
          Only confirm if you have verified the payment of{' '}
          <strong>₹{order.totalAmount?.toLocaleString()}</strong> in your UPI app or bank statement.
        </p>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:MUTE, marginBottom:5 }}>
            UPI Transaction Reference (optional)
          </label>
          <input value={ref} onChange={e => setRef(e.target.value)}
            placeholder="e.g. 407171234567"
            style={{ width:'100%', padding:'10px 12px', border:`1px solid ${RULE}`, fontFamily:'Poppins,sans-serif', fontSize:13, color:INK, outline:'none', borderRadius:0, boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={handle} disabled={loading} style={{
            flex:1, padding:'11px 0', background:'#166534', color:'#fff', border:'none',
            cursor:loading?'not-allowed':'pointer', fontFamily:'Poppins,sans-serif',
            fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
          }}>
            {loading ? 'Confirming…' : '✓ Confirm Payment'}
          </button>
          <button onClick={onClose} style={{
            padding:'11px 20px', background:'none', border:`1px solid ${RULE}`,
            cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:12, color:INK,
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Reject Payment Modal ── */
function RejectModal({ order, onClose, onSuccess }) {
  const [reason,  setReason]  = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!reason.trim()) { toast.error('Please provide a rejection reason.'); return }
    setLoading(true)
    try {
      await API.patch(`/order/admin/reject-payment/${order._id}`, { rejectionReason: reason })
      toast.success('Payment rejected.')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to reject payment.')
    } finally { setLoading(false) }
  }

  return (
    <div className="ot-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ot-modal">
        <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:18, fontWeight:700, color:INK, margin:'0 0 16px' }}>
          Reject Payment
        </h3>
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', padding:'12px 14px', marginBottom:16 }}>
          <p style={{ margin:0, fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600, color:'#991b1b' }}>
            Order #{String(order._id).slice(-8).toUpperCase()} — ₹{order.totalAmount?.toLocaleString()}
          </p>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:MUTE, marginBottom:5 }}>
            Rejection Reason (required)
          </label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder="e.g. Payment not received in UPI account"
            style={{ width:'100%', padding:'10px 12px', border:`1px solid ${RULE}`, fontFamily:'Poppins,sans-serif', fontSize:13, color:INK, outline:'none', borderRadius:0, resize:'vertical', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={handle} disabled={loading} style={{
            flex:1, padding:'11px 0', background:'#991b1b', color:'#fff', border:'none',
            cursor:loading?'not-allowed':'pointer', fontFamily:'Poppins,sans-serif',
            fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
          }}>
            {loading ? 'Rejecting…' : '✕ Reject Payment'}
          </button>
          <button onClick={onClose} style={{
            padding:'11px 20px', background:'none', border:`1px solid ${RULE}`,
            cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:12, color:INK,
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main OrderTable ── */
export default function OrderTable() {
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [pagination,   setPagination]   = useState({ total:0, pages:1 })
  const [confirmOrder, setConfirmOrder] = useState(null)
  const [rejectOrder,  setRejectOrder]  = useState(null)
  const LIMIT = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit:LIMIT })
      if (search) params.append('search', search)
      const res = await API.get(`/order/admin/all?${params}`)
      if (res.data.success) {
        setOrders(res.data.data)
        setPagination(res.data.pagination)
      }
    } catch { toast.error('Failed to load orders.') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.patch(`/order/admin/status/${orderId}`, { orderStatus: newStatus })
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      toast.success('Status updated.')
    } catch { toast.error('Failed to update status.') }
  }

  const pendingUpiCount = orders.filter(o =>
    UPI_METHODS.includes(o.paymentMethod) &&
    ['pending','pending_verification','awaiting_verification'].includes(o.paymentStatus)
  ).length

  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })

  return (
    <>
      <style>{OT_CSS}</style>

      {/* Pending UPI alert banner */}
      {pendingUpiCount > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:12, background:'#fef9c3', border:'1px solid #fde68a', padding:'12px 16px', marginBottom:20 }}>
          <AlertTriangle size={16} color="#854d0e" strokeWidth={2} style={{ flexShrink:0 }} />
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:600, color:'#854d0e' }}>
            {pendingUpiCount} UPI order{pendingUpiCount > 1 ? 's' : ''} pending payment verification — verify manually in your UPI app
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <input className="ot-search" type="text" placeholder="Search by Order ID…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <button onClick={fetchOrders} style={{
          display:'inline-flex', alignItems:'center', gap:6,
          padding:'9px 16px', background:'none', border:`1px solid ${RULE}`,
          cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:11,
          fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase',
          color:INK, transition:'border-color 0.15s',
        }}>
          <RefreshCw size={13} strokeWidth={2} /> Refresh
        </button>
        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, marginLeft:'auto' }}>
          {pagination.total} orders
        </span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:`2.5px solid ${INK}`, borderTopColor:'transparent', animation:'spin .7s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:'64px 0', fontFamily:'Poppins,sans-serif', fontSize:14, color:MUTE }}>
          No orders found.
        </div>
      ) : (
        <>
          <div style={{ background:WHT, border:`1px solid ${RULE}`, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table className="ot-table">
                <thead>
                  <tr>
                    {['Order ID','Customer','Date','Items','Total','Method','Payment','Status','Update','Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const sc = STATUS_COLORS[order.orderStatus] || { bg:'#f0f0f0', color:INK }
                    const pc = PAY_COLORS[order.paymentStatus]  || { bg:'#f0f0f0', color:INK }
                    const isPendingUpi =
                      UPI_METHODS.includes(order.paymentMethod) &&
                      ['pending','pending_verification','awaiting_verification'].includes(order.paymentStatus)

                    return (
                      <tr key={order._id}>
                        <td style={{ fontFamily:'monospace', fontSize:11, color:MUTE }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td>
                          <p style={{ fontWeight:500, margin:'0 0 2px' }}>{order.user?.name || 'N/A'}</p>
                          <p style={{ fontSize:11, color:MUTE, margin:0 }}>{order.user?.email || ''}</p>
                        </td>
                        <td style={{ color:MUTE, whiteSpace:'nowrap' }}>{fmtDate(order.createdAt)}</td>
                        <td>{order.items?.length || 0}</td>
                        <td style={{ fontWeight:600, whiteSpace:'nowrap' }}>
                          ₹{order.totalAmount?.toLocaleString()}
                          {order.deliveryCharge > 0 && (
                            <span style={{ display:'block', fontSize:10, color:MUTE, fontWeight:400 }}>
                              +₹{order.deliveryCharge} del.
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="ot-badge" style={{ background:'#f0f0f0', color:INK }}>
                            {(order.paymentMethod || 'cod').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="ot-badge" style={{ background:pc.bg, color:pc.color }}>
                            {(order.paymentStatus || 'pending').replace(/_/g,' ')}
                          </span>
                        </td>
                        <td>
                          <span className="ot-badge" style={{ background:sc.bg, color:sc.color }}>
                            {order.orderStatus.replace(/_/g,' ')}
                          </span>
                        </td>
                        <td>
                          <select className="ot-select" value={order.orderStatus}
                            onChange={e => handleStatusChange(order._id, e.target.value)}>
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {isPendingUpi ? (
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              <button className="ot-action-btn"
                                style={{ background:'#166534', color:'#fff' }}
                                onClick={() => setConfirmOrder(order)}>
                                <CheckCircle size={11} strokeWidth={2.5} /> Verify
                              </button>
                              <button className="ot-action-btn"
                                style={{ background:'#991b1b', color:'#fff' }}
                                onClick={() => setRejectOrder(order)}>
                                <XCircle size={11} strokeWidth={2.5} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.pages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:24 }}>
              <button className="ot-pgbtn" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>← Prev</button>
              <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, padding:'0 8px' }}>
                {page} / {pagination.pages}
              </span>
              <button className="ot-pgbtn" onClick={() => setPage(p => Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {confirmOrder && (
        <ConfirmModal
          order={confirmOrder}
          onClose={() => setConfirmOrder(null)}
          onSuccess={() => { setConfirmOrder(null); fetchOrders() }}
        />
      )}
      {rejectOrder && (
        <RejectModal
          order={rejectOrder}
          onClose={() => setRejectOrder(null)}
          onSuccess={() => { setRejectOrder(null); fetchOrders() }}
        />
      )}
    </>
  )
}
