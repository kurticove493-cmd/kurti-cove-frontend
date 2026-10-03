'use client'
import { useState, useEffect, useCallback } from 'react'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const STATUS_COLORS = {
  placed:           { bg:'#fef9c3', color:'#854d0e' },
  confirmed:        { bg:'#dbeafe', color:'#1e40af' },
  shipped:          { bg:'#e0e7ff', color:'#3730a3' },
  out_for_delivery: { bg:'#ffedd5', color:'#9a3412' },
  delivered:        { bg:'#dcfce7', color:'#166534' },
  cancelled:        { bg:'#fee2e2', color:'#991b1b' },
}

const PAY_COLORS = {
  paid:    { bg:'#dcfce7', color:'#166534' },
  failed:  { bg:'#fee2e2', color:'#991b1b' },
  pending: { bg:'#fef9c3', color:'#854d0e' },
  pending_verification: { bg:'#fef9c3', color:'#854d0e' },
}

const STATUS_OPTIONS = ['placed','confirmed','shipped','out_for_delivery','delivered','cancelled']

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
    outline:none; width:260px; border-radius:0;
    transition:border-color 0.15s;
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
`

export default function OrderTable() {
  const [orders,     setOrders]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [pagination, setPagination] = useState({ total:0, pages:1 })
  const LIMIT = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit:LIMIT })
      if (search) params.append('search', search)
      const res = await API.get(`/order/admin/all?${params}`)
      if (res.data.success) { setOrders(res.data.data); setPagination(res.data.pagination) }
    } catch { toast.error('Failed to load orders.') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.patch(`/order/admin/status/${orderId}`, { orderStatus: newStatus })
      setOrders(prev => prev.map(o => o._id===orderId ? { ...o, orderStatus:newStatus } : o))
      toast.success('Status updated.')
    } catch { toast.error('Failed to update status.') }
  }

  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })

  return (
    <>
      <style>{OT_CSS}</style>

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
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = INK}
          onMouseLeave={e => e.currentTarget.style.borderColor = RULE}
        >
          <RefreshCw size={13} strokeWidth={2} />
          Refresh
        </button>
        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, marginLeft:'auto' }}>
          {pagination.total} orders
        </span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%',
            border:`2.5px solid ${INK}`, borderTopColor:'transparent',
            animation:'spin .7s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:'64px 0',
          fontFamily:'Poppins,sans-serif', fontSize:14, color:MUTE }}>
          No orders found.
        </div>
      ) : (
        <>
          <div style={{ background:WHT, border:`1px solid ${RULE}`, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table className="ot-table">
                <thead>
                  <tr>
                    {['Order ID','Customer','Date','Items','Total','Method','Payment','Status','Update'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const sc = STATUS_COLORS[order.orderStatus] || { bg:'#f0f0f0', color:INK }
                    const pc = PAY_COLORS[order.paymentStatus]  || { bg:'#f0f0f0', color:INK }
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
                            {(order.paymentStatus || 'pending').replace('_verification','').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="ot-badge" style={{ background:sc.bg, color:sc.color }}>
                            {order.orderStatus.replace('_',' ')}
                          </span>
                        </td>
                        <td>
                          <select className="ot-select" value={order.orderStatus}
                            onChange={e => handleStatusChange(order._id, e.target.value)}>
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s.replace('_',' ')}</option>
                            ))}
                          </select>
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
    </>
  )
}
