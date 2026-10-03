'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { qtyChange, lstoCart } from '../../redux/features/CartSlice'
import { removeFromCartSync } from '../../utils/cartHelper'
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const PAGE_CSS = `
  .cart-pg { background:#fff; min-height:100vh; }
  .cart-pg *, .cart-pg *::before, .cart-pg *::after { box-sizing:border-box; }
  .cart-item {
    display:flex; gap:16px; padding:16px 0;
    border-bottom:1px solid ${RULE};
    align-items:flex-start;
  }
  .cart-item:last-child { border-bottom:none; }
  .cart-qty-btn {
    width:32px; height:32px; background:none; border:none;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    color:${INK}; transition:background 0.15s;
  }
  .cart-qty-btn:hover { background:#f5f5f5; }
`

export default function CartPage() {
  const dispatch = useDispatch()
  const { items, totalPrice } = useSelector(s => s.cart)
  const uniqueCount = items.length

  useEffect(() => { dispatch(lstoCart()) }, [dispatch])

  const handleQty = (id, flag) => {
    const item = items.find(i => i._id === id)
    dispatch(qtyChange({ id, flag }))
    if (item) {
      const newQty = flag === 'inc' ? item.qty + 1 : item.qty - 1
      if (newQty > 0) {
        const name = item.name.length > 28 ? item.name.slice(0,28)+'…' : item.name
        toast(`${name} — qty updated`, { icon: flag==='inc' ? '➕' : '➖', duration:1800 })
      }
    }
  }

  const handleRemove = id => removeFromCartSync(id, dispatch)

  const deliveryCharge = totalPrice >= 999 ? 0 : 99
  const grandTotal     = totalPrice + deliveryCharge

  return (
    <>
      <style>{PAGE_CSS}</style>
      <main className="cart-pg">
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 16px 64px' }}>

          {/* Breadcrumb */}
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE,
            marginBottom:24, display:'flex', alignItems:'center', gap:6 }}>
            <Link href="/" style={{ color:MUTE, textDecoration:'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color:INK }}>Cart</span>
          </div>

          <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
            fontWeight:700, color:INK, marginBottom:28 }}>
            Your Cart
            {uniqueCount > 0 && (
              <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:400,
                color:MUTE, marginLeft:10 }}>
                ({uniqueCount} {uniqueCount===1?'item':'items'})
              </span>
            )}
          </h1>

          {items.length === 0 ? (
            <div style={{ background:WHT, border:`1px solid ${RULE}`,
              padding:'64px 24px', textAlign:'center' }}>
              <ShoppingCart size={44} color={RULE} style={{ margin:'0 auto 16px' }} />
              <h2 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:22,
                fontWeight:700, color:INK, marginBottom:8 }}>
                Your cart is empty
              </h2>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, marginBottom:24 }}>
                Explore our beautiful kurtis and add something you love
              </p>
              <Link href="/shop" style={{
                display:'inline-block', padding:'11px 32px',
                background:INK, color:WHT, textDecoration:'none',
                fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
                letterSpacing:'0.14em', textTransform:'uppercase',
              }}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display:'flex', gap:32, alignItems:'flex-start', flexWrap:'wrap' }}>

              {/* Items */}
              <div style={{ flex:'1 1 480px', minWidth:0 }}>
                <div style={{ border:`1px solid ${RULE}`, padding:'0 20px' }}>
                  {items.map(item => (
                    <div key={item._id} className="cart-item">
                      {/* Image */}
                      <Link href={`/product/${item._id}`} style={{ flexShrink:0 }}>
                        <div style={{ width:72, height:86, background:'#f5f5f5', overflow:'hidden' }}>
                          {item.images?.length > 0
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={item.images[0]} alt={item.name}
                                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                                loading="lazy" />
                            : <div style={{ width:'100%', height:'100%', display:'flex',
                                alignItems:'center', justifyContent:'center', fontSize:28 }}>👗</div>}
                        </div>
                      </Link>

                      {/* Details */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <Link href={`/product/${item._id}`} style={{ textDecoration:'none' }}>
                          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:500,
                            color:INK, marginBottom:4, lineHeight:1.4,
                            overflow:'hidden', display:'-webkit-box',
                            WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                            {item.name}
                          </p>
                        </Link>
                        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:12 }}>
                          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14,
                            fontWeight:600, color:INK }}>
                            ₹{(item.discountPrice||item.price).toLocaleString()}
                          </span>
                          {item.discountPrice && item.discountPrice < item.price && (
                            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11,
                              color:MUTE, textDecoration:'line-through' }}>
                              ₹{item.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {/* Qty */}
                        <div style={{ display:'flex', alignItems:'center',
                          justifyContent:'space-between' }}>
                          <div style={{ display:'inline-flex', alignItems:'center',
                            border:`1px solid ${RULE}` }}>
                            <button className="cart-qty-btn"
                              onClick={() => handleQty(item._id,'dec')}>
                              <Minus size={12} strokeWidth={2} />
                            </button>
                            <span style={{ width:36, textAlign:'center',
                              fontFamily:'Poppins,sans-serif', fontSize:13,
                              fontWeight:500, color:INK }}>
                              {item.qty}
                            </span>
                            <button className="cart-qty-btn"
                              onClick={() => handleQty(item._id,'inc')}>
                              <Plus size={12} strokeWidth={2} />
                            </button>
                          </div>
                          <button onClick={() => handleRemove(item._id)}
                            style={{ background:'none', border:'none', cursor:'pointer',
                              color:'#ccc', padding:4, transition:'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color='#ccc'}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div style={{ flexShrink:0, textAlign:'right' }}>
                        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14,
                          fontWeight:600, color:INK }}>
                          ₹{((item.discountPrice||item.price)*item.qty).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div style={{ width:300, flexShrink:0, position:'sticky', top:84 }}>
                <div style={{ border:`1px solid ${RULE}`, padding:24 }}>
                  <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:600,
                    letterSpacing:'0.14em', textTransform:'uppercase', color:INK,
                    marginBottom:20 }}>
                    Order Summary
                  </h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      fontFamily:'Poppins,sans-serif', fontSize:13, color:INK }}>
                      <span>Subtotal ({uniqueCount} {uniqueCount===1?'item':'items'})</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      fontFamily:'Poppins,sans-serif', fontSize:13, color:INK }}>
                      <span>Shipping</span>
                      <span style={{ color: deliveryCharge===0 ? '#22c55e' : INK }}>
                        {deliveryCharge===0 ? 'FREE' : `₹${deliveryCharge}`}
                      </span>
                    </div>
                    {totalPrice < 999 && (
                      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>
                        Add ₹{(999-totalPrice).toLocaleString()} more for free shipping
                      </p>
                    )}
                  </div>
                  <hr style={{ border:'none', borderTop:`1px solid ${RULE}`, marginBottom:16 }} />
                  <div style={{ display:'flex', justifyContent:'space-between',
                    fontFamily:'Poppins,sans-serif', fontSize:15, fontWeight:700,
                    color:INK, marginBottom:20 }}>
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                  <Link href="/checkout" style={{
                    display:'block', width:'100%', padding:'13px 0',
                    background:INK, color:WHT, textDecoration:'none',
                    textAlign:'center',
                    fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
                    letterSpacing:'0.14em', textTransform:'uppercase',
                    marginBottom:12,
                  }}>
                    Proceed to Checkout
                  </Link>
                  <Link href="/shop" style={{
                    display:'block', textAlign:'center',
                    fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE,
                    textDecoration:'underline',
                  }}>
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
