'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { emptycart } from '../../redux/features/CartSlice'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { MapPin, Plus, Check, Truck, AlertTriangle, Loader2, Trash2 } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'
const PLUM = '#7B1153'

const emptyAddr = { fullName:'', mobile:'', pincode:'', addressLine:'', city:'', state:'' }
const STORE_UPI  = process.env.NEXT_PUBLIC_STORE_UPI_ID || ''
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME   || 'Kurti Cove'

const calcDelivery = sub => sub < 300 ? 49 : 0

const buildUpiUrl = (amount, ref, app) => {
  const base = `upi://pay?pa=${encodeURIComponent(STORE_UPI)}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('KurtiCove-'+ref)}`
  /* deep-link each app to its own intent scheme */
  if (app === 'phonepe')   return `phonepe://pay?pa=${encodeURIComponent(STORE_UPI)}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('KurtiCove-'+ref)}`
  if (app === 'googlepay') return `tez://upi/pay?pa=${encodeURIComponent(STORE_UPI)}&pn=${encodeURIComponent(STORE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('KurtiCove-'+ref)}`
  return base
}

const PAGE_CSS = `
  .co { background:#fafafa; min-height:100vh; }
  .co *, .co *::before, .co *::after { box-sizing:border-box; }
  .co-card { background:#fff; border:1px solid ${RULE}; padding:24px; margin-bottom:16px; }
  .co-input {
    width:100%; padding:10px 14px;
    font-family:Poppins,sans-serif; font-size:13px; color:${INK};
    border:1px solid ${RULE}; background:${WHT};
    outline:none; border-radius:0;
    transition:border-color 0.15s;
  }
  .co-input:focus { border-color:${INK}; }
  .co-label {
    display:block; font-family:Poppins,sans-serif; font-size:10px; font-weight:600;
    letter-spacing:0.12em; text-transform:uppercase; color:${MUTE}; margin-bottom:5px;
  }
  .co-pay-card {
    display:flex; align-items:center; gap:14px;
    padding:14px 16px; border:1.5px solid ${RULE};
    cursor:pointer; transition:border-color 0.15s, background 0.15s;
    margin-bottom:10px;
  }
  .co-pay-card.active { border-color:${INK}; background:#fafafa; }
  .co-pay-card:hover  { border-color:#bbb; }
  .co-radio {
    width:18px; height:18px; border-radius:50%;
    border:1.5px solid #ccc; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    transition:border-color 0.15s;
  }
  .co-pay-card.active .co-radio { border-color:${INK}; }
  .co-addr-card {
    padding:14px 16px; border:1.5px solid ${RULE};
    cursor:pointer; transition:border-color 0.15s; margin-bottom:10px;
  }
  .co-addr-card.selected { border-color:${INK}; }
  .co-btn-primary {
    width:100%; padding:14px 0;
    background:${INK}; color:${WHT}; border:none; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:background 0.18s;
  }
  .co-btn-primary:disabled { background:#aaa; cursor:not-allowed; }
  .co-section-title {
    font-family:Poppins,sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase; color:${INK};
    margin-bottom:16px;
  }
`

function Field({ label, name, value, onChange, placeholder, type='text' }) {
  return (
    <div>
      <label className="co-label">{label}</label>
      <input className="co-input" name={name} value={value} onChange={onChange}
        placeholder={placeholder} type={type} />
    </div>
  )
}

/* Unused on desktop — mobile uses window.location.href directly */

/* Payment option with real app icon */
function PayOption({ value, label, logoSrc, active, onClick }) {
  return (
    <div className={`co-pay-card${active?' active':''}`} onClick={onClick}>
      <div className="co-radio">
        {active && <div style={{ width:8, height:8, borderRadius:'50%', background:INK }} />}
      </div>
      <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
        background:'#f5f5f5', flexShrink:0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={label} style={{ width:28, height:28, objectFit:'contain' }} />
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:500, color:INK, margin:0 }}>
          {label}
        </p>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, margin:0 }}>
          Pay via {label} UPI app
        </p>
      </div>
    </div>
  )
}

const PAY_OPTIONS = [
  { value:'phonepe',   label:'PhonePe',    logo:'/icons/phonepe-icon.webp'    },
  { value:'googlepay', label:'Google Pay', logo:'/icons/google-pay-icon.webp' },
  { value:'upi',       label:'UPI',        logo:'/icons/upi-icon.webp'        },
]

export default function CheckoutPage() {
  const router   = useRouter()
  const dispatch = useDispatch()
  const { items, totalPrice } = useSelector(s => s.cart)

  const [savedAddresses,  setSavedAddresses]  = useState([])
  const [selectedAddrIdx, setSelectedAddrIdx] = useState(null)
  const [showNewForm,     setShowNewForm]      = useState(false)
  const [newAddr,         setNewAddr]          = useState(emptyAddr)
  const [payMethod,       setPayMethod]        = useState('phonepe')
  const [payError,        setPayError]         = useState('')
  const [addrTouched,     setAddrTouched]      = useState(false)
  const [deletingIdx,     setDeletingIdx]      = useState(null)
  const [placing,         setPlacing]          = useState(false)
  const pendingOrderRef = useRef(null)

  const deliveryCharge = calcDelivery(totalPrice)
  const finalTotal     = totalPrice + deliveryCharge

  useEffect(() => {
    API.get('/user/get').then(res => {
      if (res.data.success) {
        const addrs = res.data.data.addresses || []
        setSavedAddresses(addrs)
        if (addrs.length === 0) setShowNewForm(true)
      }
    }).catch(err => {
      if (err.response?.status === 401) { router.push('/login?redirect=/checkout'); return }
      setShowNewForm(true)
    })
  }, [router])

  /* Visibility: handle return from UPI app */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const pendingId     = sessionStorage.getItem('kc_pending_order_id')
        const pendingMethod = sessionStorage.getItem('kc_pending_order_method') || 'upi'
        const pendingAmount = sessionStorage.getItem('kc_pending_order_amount') || '0'
        if (pendingId) {
          sessionStorage.removeItem('kc_pending_order_id')
          sessionStorage.removeItem('kc_pending_order_method')
          sessionStorage.removeItem('kc_pending_order_amount')
          dispatch(emptycart())
          try { API.delete('/cart/clear') } catch { /* silent */ }
          router.push(`/thank-you/${pendingId}?method=${pendingMethod}&amount=${pendingAmount}`)
        }
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [dispatch, router])

  const getAddress = useCallback(() => {
    if (showNewForm || savedAddresses.length === 0) return newAddr
    if (selectedAddrIdx !== null) return savedAddresses[selectedAddrIdx]
    return null
  }, [showNewForm, savedAddresses, selectedAddrIdx, newAddr])

  const handleNewAddrChange = e => {
    const { name, value } = e.target
    setNewAddr(p => ({ ...p, [name]:value }))
    setAddrTouched(true)
  }

  const handleSelectSaved = i => {
    setSelectedAddrIdx(i); setShowNewForm(false); setAddrTouched(true)
  }

  const handleDeleteAddress = async (idx, e) => {
    e.stopPropagation()
    if (!confirm('Remove this address?')) return
    setDeletingIdx(idx)
    try {
      await API.put('/user/deleteaddress', { index:idx })
      setSavedAddresses(prev => prev.filter((_,i) => i!==idx))
      if (selectedAddrIdx === idx) { setSelectedAddrIdx(null); if (savedAddresses.length-1===0) setShowNewForm(true) }
      else if (selectedAddrIdx > idx) setSelectedAddrIdx(p => p-1)
    } catch {/* silent */} finally { setDeletingIdx(null) }
  }

  const validateSync = useCallback(() => {
    if (items.length === 0) { setPayError('Your cart is empty.'); return false }
    const token = typeof window !== 'undefined' ? localStorage.getItem('kc_token') : null
    if (!token) {
      setPayError('Please login to place an order.')
      setTimeout(() => router.push('/login?redirect=/checkout'), 1500)
      return false
    }
    const addr = getAddress()
    if (!addr?.fullName || !addr?.mobile || !addr?.pincode || !addr?.addressLine || !addr?.city || !addr?.state) {
      setPayError('Please complete all address fields.'); return false
    }
    return true
  }, [items, getAddress, router])

  /*
    PROCEED — direct UPI app redirect on mobile, QR on desktop.
    UPI URL must be set SYNCHRONOUSLY in the click handler.
  */
  const handleProceed = async () => {
    setPayError('')
    if (!validateSync()) return

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const ref      = 'REF' + Date.now()
    const upiUrl   = buildUpiUrl(finalTotal, ref, payMethod)
    const address  = getAddress()

    if (isMobile) {
      /* SYNCHRONOUS — must happen in same call stack as click */
      window.location.href = upiUrl

      /* Create order in background after redirect */
      try {
        const res = await API.post('/order/place', { address, paymentMethod:payMethod, paymentStatus:'pending_verification' })
        if (res.data.success) {
          sessionStorage.setItem('kc_pending_order_id',     res.data.data._id)
          sessionStorage.setItem('kc_pending_order_method', payMethod)
          sessionStorage.setItem('kc_pending_order_amount', String(finalTotal))
        }
      } catch { /* silent */ }

    } else {
      /* Desktop: create order then redirect straight to thank-you — no QR, no confirm button */
      setPlacing(true)
      try {
        const res = await API.post('/order/place', { address, paymentMethod:payMethod, paymentStatus:'pending_verification' })
        if (res.data.success) {
          dispatch(emptycart())
          try { await API.delete('/cart/clear') } catch { /* silent */ }
          router.push(`/thank-you/${res.data.data._id}?method=${payMethod}&amount=${finalTotal}`)
        } else {
          setPayError('Order could not be placed. Please try again.')
        }
      } catch (err) {
        const msg = err.response?.data?.msg || err.message || 'Something went wrong.'
        if (err.response?.status === 401) {
          setPayError('Session expired. Please login again.')
          setTimeout(() => router.push('/login?redirect=/checkout'), 1500)
        } else { setPayError(msg) }
      } finally { setPlacing(false) }
    }
  }

  return (
    <>
      <style>{PAGE_CSS}</style>
      <main className="co">
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 16px 64px' }}>

          {/* Breadcrumb */}
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE,
            marginBottom:24, display:'flex', gap:6 }}>
            <a href="/" style={{ color:MUTE, textDecoration:'none' }}>Home</a>
            <span>/</span>
            <a href="/cart" style={{ color:MUTE, textDecoration:'none' }}>Cart</a>
            <span>/</span>
            <span style={{ color:INK }}>Checkout</span>
          </div>

          <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
            fontWeight:700, color:INK, marginBottom:28 }}>
            Checkout
          </h1>

          <div style={{ display:'flex', gap:28, alignItems:'flex-start', flexWrap:'wrap' }}>

            {/* ── LEFT ── */}
            <div style={{ flex:'1 1 480px', minWidth:0 }}>

              {/* Delivery Address */}
              <div className="co-card">
                <p className="co-section-title">
                  <MapPin size={13} strokeWidth={1.8} style={{ verticalAlign:'middle', marginRight:6 }} />
                  Delivery Address
                </p>

                {savedAddresses.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    {savedAddresses.map((addr, i) => (
                      <div key={i}
                        className={`co-addr-card${selectedAddrIdx===i&&!showNewForm?' selected':''}`}
                        onClick={() => handleSelectSaved(i)}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                          <div>
                            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:600, color:INK, margin:'0 0 2px' }}>{addr.fullName}</p>
                            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, margin:'0 0 1px' }}>{addr.mobile}</p>
                            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, margin:0 }}>
                              {addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                            {selectedAddrIdx===i && !showNewForm && (
                              <div style={{ width:18, height:18, borderRadius:'50%', background:INK,
                                display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Check size={10} color={WHT} strokeWidth={3} />
                              </div>
                            )}
                            <button onClick={e => handleDeleteAddress(i,e)}
                              disabled={deletingIdx===i}
                              style={{ background:'none', border:'none', cursor:'pointer',
                                color:'#ccc', padding:4, transition:'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color='#ccc'}>
                              {deletingIdx===i
                                ? <Loader2 size={14} style={{ animation:'spin .7s linear infinite' }} />
                                : <Trash2 size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => { setShowNewForm(v=>!v); setSelectedAddrIdx(null) }}
                      style={{ display:'inline-flex', alignItems:'center', gap:5,
                        fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:500,
                        color:INK, background:'none', border:'none', cursor:'pointer',
                        textDecoration:'underline', padding:0 }}>
                      <Plus size={13} /> {showNewForm ? 'Cancel' : 'Add new address'}
                    </button>
                  </div>
                )}

                {(showNewForm || savedAddresses.length===0) && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[
                      { name:'fullName',    label:'Full Name',    placeholder:'Priya Sharma' },
                      { name:'mobile',      label:'Mobile',       placeholder:'9876543210' },
                      { name:'pincode',     label:'Pincode',      placeholder:'400001' },
                      { name:'addressLine', label:'Address Line', placeholder:'House / Street / Area', full:true },
                      { name:'city',        label:'City',         placeholder:'Mumbai' },
                      { name:'state',       label:'State',        placeholder:'Maharashtra' },
                    ].map(f => (
                      <div key={f.name} style={{ gridColumn: f.full ? 'span 2' : undefined }}>
                        <Field label={f.label} name={f.name} value={newAddr[f.name]}
                          onChange={handleNewAddrChange} placeholder={f.placeholder} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="co-card">
                <p className="co-section-title">Payment Method</p>
                {PAY_OPTIONS.map(opt => (
                  <PayOption key={opt.value}
                    value={opt.value} label={opt.label} logoSrc={opt.logo}
                    active={payMethod===opt.value}
                    onClick={() => { setPayMethod(opt.value); setPayError(''); setShowQr(false) }}
                  />
                ))}
                {/* COD disabled */}
                <div style={{ display:'flex', alignItems:'center', gap:14,
                  padding:'14px 16px', border:`1.5px solid ${RULE}`,
                  opacity:0.4, cursor:'not-allowed' }}>
                  <div className="co-radio" />
                  <div style={{ width:36, height:36, background:'#f5f5f5',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:18 }}>💵</span>
                  </div>
                  <div>
                    <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, margin:0 }}>
                      Cash on Delivery
                    </p>
                    <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, margin:0 }}>
                      Not available for this area
                    </p>
                  </div>
                </div>

                {payError && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:8,
                    background:'#fef2f2', border:'1px solid #fecaca',
                    padding:'10px 14px', marginTop:12 }}>
                    <AlertTriangle size={14} color="#dc2626" style={{ flexShrink:0, marginTop:1 }} />
                    <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'#dc2626', margin:0 }}>
                      {payError}
                    </p>
                  </div>
                )}
              </div>

              {/* QR panel removed — auto-redirect handles everything */}
            </div>

            {/* ── ORDER SUMMARY ── */}
            <div style={{ width:300, flexShrink:0, position:'sticky', top:84 }}>
              <div style={{ background:WHT, border:`1px solid ${RULE}`, padding:24 }}>
                <p className="co-section-title">Order Summary</p>

                <div style={{ maxHeight:180, overflowY:'auto', marginBottom:16,
                  scrollbarWidth:'none' }}>
                  {items.map(item => (
                    <div key={item._id} style={{ display:'flex', gap:10,
                      alignItems:'center', marginBottom:10 }}>
                      <div style={{ width:44, height:52, background:'#f5f5f5',
                        overflow:'hidden', flexShrink:0 }}>
                        {item.images?.[0]
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={item.images[0]} alt={item.name}
                              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                          : <div style={{ width:'100%', height:'100%' }} />}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:500,
                          color:INK, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {item.name}
                        </p>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, margin:0 }}>
                          Qty: {item.qty}
                        </p>
                      </div>
                      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
                        color:INK, flexShrink:0 }}>
                        ₹{((item.discountPrice||item.price)*item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <hr style={{ border:'none', borderTop:`1px solid ${RULE}`, marginBottom:14 }} />

                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    fontFamily:'Poppins,sans-serif', fontSize:13, color:INK }}>
                    <span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    fontFamily:'Poppins,sans-serif', fontSize:13, color:INK }}>
                    <span>Delivery</span>
                    <span style={{ color: deliveryCharge===0 ? '#22c55e' : INK }}>
                      {deliveryCharge===0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {totalPrice > 0 && totalPrice < 300 && (
                    <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>
                      Add ₹{(300-totalPrice).toLocaleString()} more for free delivery
                    </p>
                  )}
                </div>

                <hr style={{ border:'none', borderTop:`1px solid ${RULE}`, marginBottom:14 }} />

                <div style={{ display:'flex', justifyContent:'space-between',
                  fontFamily:'Poppins,sans-serif', fontSize:16, fontWeight:700,
                  color:INK, marginBottom:20 }}>
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>

                {/* Always show the proceed button — no QR fallback */}
                <button onClick={handleProceed} className="co-btn-primary"
                  disabled={placing || items.length===0}>
                  {placing
                    ? <><Loader2 size={15} style={{ animation:'spin .7s linear infinite' }} /> Preparing…</>
                    : `Proceed to Pay ₹${finalTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
