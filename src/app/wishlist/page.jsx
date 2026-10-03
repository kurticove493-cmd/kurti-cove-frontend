'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addToCartWithSync } from '../../utils/cartHelper'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'
const getWL  = () => { try { return JSON.parse(localStorage.getItem(WL_KEY)||'[]') } catch { return [] } }

const PAGE_CSS = `
  .wl { background:#fafafa; min-height:100vh; }
  .wl *, .wl *::before, .wl *::after { box-sizing:border-box; }
  .wl-card { background:#fff; cursor:pointer; }
  .wl-card:hover .wl-img { transform:scale(1.04); }
  .wl-img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; display:block; }
  .wl-grid {
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:10px;
  }
  @media(min-width:640px) { .wl-grid { grid-template-columns:repeat(3,1fr); gap:14px; } }
  @media(min-width:1024px){ .wl-grid { grid-template-columns:repeat(4,1fr); gap:16px; } }
`

function WishlistCard({ product, onRemove }) {
  const dispatch   = useDispatch()
  const [removing, setRemoving]   = useState(false)
  const [adding,   setAdding]     = useState(false)

  const cur     = product.discountPrice || product.price
  const hasDis  = product.discountPrice && product.discountPrice < product.price
  const pct     = hasDis ? Math.round((1-product.discountPrice/product.price)*100) : 0

  const handleRemove = useCallback(e => {
    e.preventDefault(); e.stopPropagation()
    setRemoving(true)
    setTimeout(() => {
      const wl = getWL().filter(id => id !== product._id)
      localStorage.setItem(WL_KEY, JSON.stringify(wl))
      onRemove(product._id)
      window.dispatchEvent(new Event('kc-wishlist-changed'))
    }, 280)
  }, [product._id, onRemove])

  const handleCart = useCallback(async e => {
    e.preventDefault(); e.stopPropagation()
    setAdding(true)
    await addToCartWithSync(product, 1, dispatch)
    setAdding(false)
  }, [product, dispatch])

  return (
    <div className="wl-card" style={{ opacity: removing ? 0 : 1, transform: removing ? 'scale(0.96)' : 'scale(1)', transition:'opacity 0.28s, transform 0.28s' }}>
      <Link href={`/product/${product._id}`} style={{ textDecoration:'none' }}>
        {/* Image */}
        <div style={{ position:'relative', overflow:'hidden', aspectRatio:'3/4', background:'#f5f5f5' }}>
          {product.images?.[0]
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={product.images[0]} alt={product.name} className="wl-img" loading="lazy" />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:40 }}>👗</div>}

          {pct > 0 && (
            <span style={{ position:'absolute', top:8, left:8, background:INK, color:WHT,
              fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600,
              padding:'2px 8px', letterSpacing:'0.06em' }}>
              {pct}% OFF
            </span>
          )}

          <button onClick={handleRemove} aria-label="Remove from wishlist"
            style={{ position:'absolute', top:8, right:8,
              width:28, height:28, borderRadius:'50%',
              background:'rgba(255,255,255,0.88)', border:'1px solid rgba(0,0,0,0.08)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'background 0.18s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.88)'}>
            <Heart size={13} fill="#ef4444" color="#ef4444" />
          </button>
        </div>

        {/* Details */}
        <div style={{ paddingTop:9, paddingBottom:4 }}>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:400,
            color:INK, lineHeight:1.4, marginBottom:5,
            overflow:'hidden', display:'-webkit-box',
            WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>
            {product.name}
          </p>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, flexWrap:'wrap', marginBottom:10 }}>
            {hasDis && (
              <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE,
                textDecoration:'line-through' }}>₹{product.price.toLocaleString()}</span>
            )}
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:600, color:INK }}>
              ₹{cur.toLocaleString()}
            </span>
            {pct > 0 && (
              <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:'#E05C88' }}>
                {pct}% off
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <button onClick={handleCart} disabled={adding}
        style={{ width:'100%', padding:'9px 0', marginBottom:4,
          background: adding ? '#444' : INK, color:WHT, border:'none',
          cursor: adding ? 'not-allowed' : 'pointer',
          fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
          letterSpacing:'0.12em', textTransform:'uppercase',
          display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          transition:'background 0.18s' }}>
        <ShoppingCart size={13} />
        {adding ? 'Adding…' : 'Add to Cart'}
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div>
      <div className="animate-pulse" style={{ aspectRatio:'3/4', background:'#f0f0f0' }} />
      <div style={{ paddingTop:9 }}>
        <div className="animate-pulse" style={{ height:11, background:'#ebebeb', borderRadius:2, marginBottom:7, width:'80%' }} />
        <div className="animate-pulse" style={{ height:11, background:'#ebebeb', borderRadius:2, width:'55%' }} />
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const ids = getWL()
    if (ids.length === 0) { setLoading(false); return }
    Promise.all(
      ids.map(id =>
        fetch(`${BASE}product/${id}`, { cache:'no-store' })
          .then(r => r.json()).then(d => d.success ? d.data : null).catch(()=>null)
      )
    ).then(results => setProducts(results.filter(Boolean)))
     .finally(() => setLoading(false))
  }, [])

  const handleRemove = useCallback(id => {
    setProducts(prev => prev.filter(p => p._id !== id))
  }, [])

  return (
    <>
      <style>{PAGE_CSS}</style>
      <main className="wl">
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'32px 16px 64px' }}>

          {/* Breadcrumb */}
          <div style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE,
            marginBottom:24, display:'flex', gap:6 }}>
            <Link href="/" style={{ color:MUTE, textDecoration:'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color:INK }}>Wishlist</span>
          </div>

          {/* Heading */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
            <Heart size={22} fill={INK} color={INK} />
            <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
              fontWeight:700, color:INK, margin:0 }}>
              My Wishlist
            </h1>
          </div>
          {!loading && (
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, marginBottom:28 }}>
              {products.length === 0 ? 'No items saved yet' : `${products.length} item${products.length!==1?'s':''} saved`}
            </p>
          )}

          {loading && (
            <div className="wl-grid" style={{ marginTop:8 }}>
              {Array.from({ length:8 }).map((_,i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div style={{ textAlign:'center', padding:'72px 0' }}>
              <Heart size={52} color={RULE} style={{ margin:'0 auto 16px' }} />
              <h2 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:22,
                fontWeight:700, color:INK, marginBottom:8 }}>
                Your wishlist is empty
              </h2>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, marginBottom:24 }}>
                Save items you love and come back to them anytime
              </p>
              <Link href="/shop?filter=isNewArrival" style={{
                display:'inline-block', padding:'11px 32px',
                background:INK, color:WHT, textDecoration:'none',
                fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:600,
                letterSpacing:'0.14em', textTransform:'uppercase',
              }}>
                Shop New Arrivals
              </Link>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="wl-grid">
              {products.map(p => (
                <WishlistCard key={p._id} product={p} onRemove={handleRemove} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
