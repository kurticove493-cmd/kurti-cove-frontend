'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import {
  Truck, CreditCard, ShoppingBag,
  ChevronDown, ChevronLeft, ChevronRight,
  Star, Edit3, CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { addToCartWithSync } from '../../../utils/cartHelper'
import toast from 'react-hot-toast'
import SimilarProducts from '../../../components/user/SimilarProducts'
import { cldUrl } from '../../../lib/cloudinaryImage.js'
import { normalizeProductImages } from '../../../lib/cloudinaryImage.js'

/* ── Minimal theme: white bg, #1a1a1a text, #7B1153 accent ── */
const PLUM   = '#7B1153'  /* selected state, CTA button, links        */
const INK    = '#1a1a1a'  /* primary text                             */
const MUTE   = '#888'     /* muted / secondary text                   */
const ROSE   = '#E05C88'  /* % off text, star colour                  */
const RULE   = '#e8e8e8'  /* hairline dividers                        */
const PINK_S = '#F48FB1'  /* star fill in reviews                     */
const WHT    = '#fff'

const BASE   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
const WL_KEY = 'kc_wishlist'

const SIZE_CHART = [
  { size:'XS', chest:'32', waist:'26', length:'44' },
  { size:'S',  chest:'34', waist:'28', length:'45' },
  { size:'M',  chest:'36', waist:'30', length:'46' },
  { size:'L',  chest:'38', waist:'32', length:'47' },
  { size:'XL', chest:'40', waist:'34', length:'48' },
  { size:'XXL',chest:'42', waist:'36', length:'49' },
]

const getWL = () => { try { return JSON.parse(localStorage.getItem(WL_KEY)||'[]') } catch { return [] } }

/* ══ HTML DESCRIPTION ══ */
function HtmlDesc({ html }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    import('dompurify').then(({ default: D }) => {
      const clean = D.sanitize(html, {
        ALLOWED_TAGS: ['p','br','b','strong','i','em','u','h2','h3','ul','ol','li','span','a'],
        ALLOWED_ATTR: ['href','target','rel'],
      })
      if (ref.current) ref.current.innerHTML = clean
    })
  }, [html])
  return (
    <>
      <style>{`
        .pdesc p{font-size:14px;line-height:1.7;color:${MUTE};margin-bottom:8px;}
        .pdesc h2,.pdesc h3{font-size:15px;font-weight:600;color:${INK};margin:10px 0 4px;}
        .pdesc ul,.pdesc ol{padding-left:18px;margin-bottom:8px;}
        .pdesc li{font-size:14px;color:${MUTE};line-height:1.6;margin-bottom:2px;}
        .pdesc strong,.pdesc b{color:${INK};font-weight:600;}
        .pdesc a{color:${PLUM};text-decoration:underline;}
      `}</style>
      <div ref={ref} className="pdesc" />
    </>
  )
}

/* ══ PINCODE CHECKER ══ */
function PincodeCheck() {
  const [pin,  setPin]  = useState('')
  const [ok,   setOk]   = useState(false)
  const check = () => {
    if (pin.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return }
    setOk(true)
  }
  return (
    <div style={{ display:'flex', border:`1px solid ${RULE}`, overflow:'hidden' }}>
      <input type="text" value={pin} maxLength={6} placeholder="Enter pincode"
        onChange={e => { setPin(e.target.value.replace(/\D/g,'').slice(0,6)); setOk(false) }}
        style={{
          flex:1, padding:'10px 14px', fontSize:13, fontFamily:'Poppins,sans-serif',
          border:'none', outline:'none', color:INK, background:WHT,
        }}
      />
      <button onClick={check} style={{
        padding:'10px 18px', background:'none', border:'none',
        borderLeft:`1px solid ${RULE}`, cursor:'pointer',
        fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
        letterSpacing:'0.10em', textTransform:'uppercase',
        color: ok ? PLUM : MUTE,
      }}>
        {ok ? '✓ OK' : 'CHECK'}
      </button>
    </div>
  )
}

/* ══ ACCORDION ITEM ══ */
function AccordItem({ label, open, onToggle, children }) {
  return (
    <div style={{ borderBottom:`1px solid ${RULE}` }}>
      <button onClick={onToggle} style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        width:'100%', padding:'16px 0', background:'none', border:'none', cursor:'pointer',
      }}>
        <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
          letterSpacing:'0.14em', textTransform:'uppercase', color:INK }}>
          {label}
        </span>
        <ChevronDown size={14} strokeWidth={2} color={MUTE}
          style={{ transition:'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none', flexShrink:0 }} />
      </button>
      <div style={{ overflow:'hidden', maxHeight: open ? 1200 : 0, transition:'max-height 0.35s ease' }}>
        <div style={{ paddingBottom:18 }}>{children}</div>
      </div>
    </div>
  )
}

/* ══ STAR ROW (pink fill for reviews) ══ */
function PinkStars({ rating, size = 16 }) {
  return (
    <span style={{ display:'inline-flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size} strokeWidth={0}
          fill={n <= Math.round(rating) ? PINK_S : '#e0e0e0'} />
      ))}
    </span>
  )
}

/* ══ REVIEWS SECTION ══ */
function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day ago'
  if (diff < 30)  return `${diff} days ago`
  if (diff < 365) return `${Math.floor(diff/30)} months ago`
  return `${Math.floor(diff/365)} years ago`
}

function ReviewsSection({ productId, productImg }) {
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [sort,    setSort]      = useState('highest')
  const [sortOpen,setSortOpen]  = useState(false)
  const [slide,   setSlide]     = useState(0)
  const sortRef = useRef(null)

  useEffect(() => {
    if (!productId) return
    fetch(`${BASE}review?productId=${productId}`, { cache:'no-store' })
      .then(r => r.json()).then(d => { if (d.success) setReviews(d.data||[]) })
      .catch(()=>{}).finally(()=>setLoading(false))
  }, [productId])

  useEffect(() => {
    const h = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const sorted = [...reviews].sort((a,b) => {
    if (sort === 'highest') return b.rating - a.rating
    if (sort === 'lowest')  return a.rating - b.rating
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const total = reviews.length
  const avg   = total ? reviews.reduce((s,r)=>s+r.rating,0)/total : 0

  /* Carousel: 3-per-view desktop, 1-per-view mobile */
  const [perView, setPerView] = useState(3)
  useEffect(() => {
    const upd = () => setPerView(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3)
    upd(); window.addEventListener('resize', upd, { passive:true })
    return () => window.removeEventListener('resize', upd)
  }, [])

  const maxSlide = Math.max(0, sorted.length - perView)
  const prev = () => setSlide(s => Math.max(0, s-1))
  const next = () => setSlide(s => Math.min(maxSlide, s+1))
  useEffect(() => { setSlide(0) }, [sort, perView])

  const SORT_LABELS = { highest:'Highest Rating', lowest:'Lowest Rating', newest:'Newest' }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'48px 0' }}>
      <div style={{ width:28, height:28, borderRadius:'50%', border:`3px solid ${PLUM}`, borderTopColor:'transparent', animation:'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <section style={{ marginTop:64, paddingTop:40, borderTop:`1px solid ${RULE}` }}>
      {/* Heading */}
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:14, fontWeight:600,
          letterSpacing:'0.18em', textTransform:'uppercase', color:INK, marginBottom:12 }}>
          Customer Reviews
        </h2>
        <div style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
          <PinkStars rating={avg} size={22} />
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:15, fontWeight:600, color:INK }}>
            {avg > 0 ? avg.toFixed(1) : '—'}
          </span>
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE }}>
            ({total} {total===1?'review':'reviews'})
          </span>
        </div>
      </div>

      {/* Product thumbnail centered */}
      {productImg && (
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={productImg} alt="product"
            style={{ width:60, height:60, objectFit:'cover', border:`1px solid ${RULE}` }} />
        </div>
      )}

      {/* Write a review + sort row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:32, flexWrap:'wrap' }}>
        <button style={{
          fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:500,
          padding:'9px 24px', borderRadius:24, border:`1px solid ${PINK_S}`,
          background:'rgba(244,143,177,0.08)', color:PLUM, cursor:'pointer',
          letterSpacing:'0.06em',
        }}>
          <Edit3 size={13} style={{ marginRight:6, verticalAlign:'middle' }} />
          Write a review
        </button>

        {/* Sort dropdown — right-aligned */}
        <div ref={sortRef} style={{ position:'relative', marginLeft:'auto' }}>
          <button onClick={() => setSortOpen(v=>!v)} style={{
            display:'inline-flex', alignItems:'center', gap:6,
            fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:500,
            border:`1px solid ${RULE}`, padding:'8px 14px',
            background:WHT, cursor:'pointer', color:INK,
          }}>
            {SORT_LABELS[sort]}
            <ChevronDown size={12} strokeWidth={2} style={{ transition:'transform 0.2s', transform: sortOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          {sortOpen && (
            <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', background:WHT,
              border:`1px solid ${RULE}`, minWidth:160, zIndex:30, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
              {Object.entries(SORT_LABELS).map(([k,v]) => (
                <button key={k} onClick={() => { setSort(k); setSortOpen(false) }} style={{
                  display:'block', width:'100%', textAlign:'left', padding:'9px 14px',
                  fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight: k===sort ? 600 : 400,
                  color: k===sort ? PLUM : INK, background:'none', border:'none',
                  cursor:'pointer', borderBottom:`1px solid ${RULE}`,
                }}>
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {total === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0' }}>
          <PinkStars rating={0} size={28} />
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:INK, marginTop:12, marginBottom:4 }}>
            No reviews yet
          </p>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE }}>
            Be the first to review this product
          </p>
        </div>
      ) : (
        /* Carousel */
        <div style={{ position:'relative' }}>
          {/* Prev arrow */}
          <button onClick={prev} disabled={slide===0} style={{
            position:'absolute', left:-20, top:'50%', transform:'translateY(-50%)', zIndex:10,
            background:'none', border:'none', cursor: slide===0 ? 'not-allowed' : 'pointer',
            opacity: slide===0 ? 0.3 : 1, padding:4,
          }} aria-label="Previous reviews">
            <ChevronLeft size={28} strokeWidth={1.5} color={INK} />
          </button>

          {/* Cards viewport */}
          <div style={{ overflow:'hidden', margin:'0 20px' }}>
            <div style={{
              display:'flex', gap:12,
              transform:`translateX(calc(-${slide} * (100% / ${perView} + 12px / ${perView})))`,
              transition:'transform 0.38s ease',
            }}>
              {sorted.map(r => (
                <div key={r._id} style={{
                  flex:`0 0 calc(${100/perView}% - ${12*(perView-1)/perView}px)`,
                  background:'#F4F4F5', padding:20,
                  borderRadius:4,
                }}>
                  <PinkStars rating={r.rating} size={15} />
                  <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, fontWeight:700,
                    color:INK, marginTop:10, marginBottom:2 }}>
                    {r.customerName}
                  </p>
                  <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, marginBottom:10 }}>
                    {timeAgo(r.createdAt)}
                    {r.verifiedBuyer && (
                      <span style={{ marginLeft:8, color:'#27a06b', fontWeight:500 }}>
                        <CheckCircle size={10} style={{ verticalAlign:'middle', marginRight:3 }} />
                        Verified
                      </span>
                    )}
                  </p>
                  {r.title && (
                    <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:600, color:INK, marginBottom:6 }}>
                      {r.title}
                    </p>
                  )}
                  <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:'#444', lineHeight:1.6 }}>
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Next arrow */}
          <button onClick={next} disabled={slide>=maxSlide} style={{
            position:'absolute', right:-20, top:'50%', transform:'translateY(-50%)', zIndex:10,
            background:'none', border:'none', cursor: slide>=maxSlide ? 'not-allowed' : 'pointer',
            opacity: slide>=maxSlide ? 0.3 : 1, padding:4,
          }} aria-label="Next reviews">
            <ChevronRight size={28} strokeWidth={1.5} color={INK} />
          </button>
        </div>
      )}
    </section>
  )
}

/* ══ MAIN PAGE ══ */
export default function ProductDetailPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const dispatch = useDispatch()

  const [product,      setProduct]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [selSize,      setSelSize]      = useState(null)
  const [qty,          setQty]          = useState(1)
  const [adding,       setAdding]       = useState(false)
  const [inWL,         setInWL]         = useState(false)
  const [mobileSlide,  setMobileSlide]  = useState(0)

  /* Accordions */
  const [aDesc,  setADesc]  = useState(true)
  const [aSize,  setASize]  = useState(false)
  const [aMat,   setAMat]   = useState(false)
  const [aSpec,  setASpec]  = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`${BASE}product/${id}`, { cache:'no-store' })
      .then(r=>r.json())
      .then(d => {
        if (d.success) {
          setProduct(d.data)
          setInWL(getWL().includes(d.data._id))
        }
      })
      .catch(()=>toast.error('Failed to load product.'))
      .finally(()=>setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (product.sizes?.length > 0 && !selSize) { toast.error('Please select a size.'); return }
    setAdding(true)
    await addToCartWithSync(product, qty, dispatch)
    setAdding(false)
  }

  const toggleWL = useCallback(() => {
    if (!product) return
    const wl   = getWL()
    const next = wl.includes(product._id) ? wl.filter(x=>x!==product._id) : [...wl,product._id]
    localStorage.setItem(WL_KEY, JSON.stringify(next))
    setInWL(!inWL)
    window.dispatchEvent(new Event('kc-wishlist-changed'))
  }, [product, inWL])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:WHT }}>
      <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid ${PLUM}`, borderTopColor:'transparent', animation:'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!product) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:WHT }}>
      <span style={{ fontSize:60 }}>👗</span>
      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:16, color:INK }}>Product not found</p>
      <button onClick={() => router.push('/shop')} style={{
        background:PLUM, color:WHT, border:'none', padding:'10px 28px',
        fontFamily:'Poppins,sans-serif', fontSize:13, cursor:'pointer',
      }}>
        Back to Shop
      </button>
    </div>
  )

  const cur      = product.discountPrice || product.price
  const hasDis   = product.discountPrice && product.discountPrice < product.price
  const pct      = hasDis ? Math.round((1-product.discountPrice/product.price)*100) : 0
  // Normalize images — handles plain strings, objects, JSON strings, legacy formats
  const normalizedImgs = normalizeProductImages(product.images, product.name)
  const images         = normalizedImgs.map(n => n.src)
  const skuStr   = product.sku || product._id?.slice(-10).toUpperCase()

  const PAGE_CSS = `
    .pdp{background:#fff;min-height:100vh;}
    .pdp *{box-sizing:border-box;}
    .pdp-gutter{max-width:1280px;margin:0 auto;padding:0 16px 64px;}
    /* mobile image strip */
    .pdp-mob-strip{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;}
    .pdp-mob-strip::-webkit-scrollbar{display:none;}
    .pdp-mob-strip-item{flex:0 0 100%;scroll-snap-align:start;}
    /* desktop gallery grid */
    .pdp-gallery{display:none;}
    @media(min-width:768px){
      .pdp-mob-strip-wrap{display:none;}
      .pdp-gallery{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
    }
    /* two-col layout */
    .pdp-cols{display:flex;flex-direction:column;gap:28px;}
    @media(min-width:768px){.pdp-cols{flex-direction:row;gap:40px;align-items:flex-start;}}
    .pdp-left{width:100%;}
    @media(min-width:768px){.pdp-left{width:55%;flex-shrink:0;}}
    .pdp-right{width:100%;}
    @media(min-width:768px){.pdp-right{flex:1;}}
  `

  return (
    <>
      <style>{PAGE_CSS}</style>
      <main className="pdp">
        <div className="pdp-gutter">

          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'18px 0 20px',
            fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE }}>
            <Link href="/" style={{ color:MUTE, textDecoration:'none' }}>Home</Link>
            <span>/</span>
            <Link href="/shop" style={{ color:MUTE, textDecoration:'none' }}>Shop</Link>
            <span>/</span>
            <span style={{ color:INK }}>{product.name}</span>
          </div>

          <div className="pdp-cols">

            {/* ── LEFT: IMAGE GALLERY ── */}
            <div className="pdp-left">

              {/* Mobile: swipeable strip */}
              <div className="pdp-mob-strip-wrap">
                <div className="pdp-mob-strip" style={{ aspectRatio:'3/4' }}
                  onScroll={e => {
                    const i = Math.round(e.currentTarget.scrollLeft / e.currentTarget.offsetWidth)
                    setMobileSlide(i)
                  }}>
                  {images.length > 0 ? images.map((img,i) => (
                    <div key={i} className="pdp-mob-strip-item" style={{ aspectRatio:'3/4' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cldUrl(img, { width: 800 })} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    </div>
                  )) : (
                    <div className="pdp-mob-strip-item" style={{ display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, background:'#f5f5f5', aspectRatio:'3/4' }}>👗</div>
                  )}
                </div>
                {images.length > 1 && (
                  <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:8 }}>
                    {images.map((_,i) => (
                      <span key={i} style={{ width: i===mobileSlide ? 18 : 7, height:7, borderRadius:9, background: i===mobileSlide ? PLUM : '#ccc', transition:'all 0.25s', display:'inline-block' }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: 2-col image grid, all images, square corners */}
              <div className="pdp-gallery">
                {images.length > 0 ? images.map((img,i) => (
                  <div key={i} style={{ aspectRatio:'3/4', overflow:'hidden', background:'#f5f5f5' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cldUrl(img, { width: 1000 })} alt={`${product.name} ${i+1}`}
                      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                      loading={i < 2 ? 'eager' : 'lazy'} />
                  </div>
                )) : (
                  <div style={{ aspectRatio:'3/4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, background:'#f5f5f5', gridColumn:'span 2' }}>👗</div>
                )}
              </div>
            </div>

            {/* ── RIGHT: PRODUCT INFO ── */}
            <div className="pdp-right">

              {/* Title + wishlist */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:6 }}>
                <h1 style={{ fontFamily:'Poppins,sans-serif', fontSize:22, fontWeight:600,
                  color:INK, lineHeight:1.3, flex:1, margin:0 }}>
                  {product.name}
                </h1>
                <button onClick={toggleWL} aria-label="Wishlist" style={{
                  background:'none', border:'none', cursor:'pointer', flexShrink:0, padding:4, marginTop:2,
                }}>
                  {inWL
                    ? <AiFillHeart size={22} color="#E05C88" />
                    : <AiOutlineHeart size={22} color={MUTE} />}
                </button>
              </div>

              {/* SKU */}
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE,
                letterSpacing:'0.06em', marginBottom:14 }}>
                Sku: {skuStr}
              </p>

              {/* Price line */}
              <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                {hasDis && (
                  <span style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:'#aaa', textDecoration:'line-through' }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
                <span style={{ fontFamily:'Poppins,sans-serif', fontSize:22, fontWeight:700, color:INK }}>
                  ₹{cur.toLocaleString()}
                </span>
                {pct > 0 && (
                  <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:600, color:ROSE }}>
                    {pct}% Off
                  </span>
                )}
              </div>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, marginBottom:20 }}>
                Inclusive Of All Taxes
              </p>

              <hr style={{ border:'none', borderTop:`1px solid ${RULE}`, marginBottom:20 }} />

              {/* Size selection */}
              {product.sizes?.length > 0 && (
                <div style={{ marginBottom:22 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
                      letterSpacing:'0.12em', textTransform:'uppercase', color:INK }}>
                      Size:
                    </span>
                    <button style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:500,
                      color:INK, background:'none', border:`1px solid ${INK}`,
                      padding:'3px 10px', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                      View Size Chart
                    </button>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                    {product.sizes.map(s => (
                      <button key={s} onClick={() => setSelSize(s === selSize ? null : s)}
                        style={{
                          width:42, height:42, borderRadius:'50%',
                          border:`1.5px solid ${s===selSize ? PLUM : '#ccc'}`,
                          background: s===selSize ? PLUM : WHT,
                          color: s===selSize ? WHT : INK,
                          fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight: s===selSize ? 600 : 400,
                          cursor:'pointer', transition:'all 0.18s', flexShrink:0,
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {!selSize && (
                    <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:ROSE, marginTop:8 }}>
                      Please select a size
                    </p>
                  )}
                </div>
              )}

              {/* Qty */}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
                  letterSpacing:'0.12em', textTransform:'uppercase', color:INK }}>Qty</span>
                <div style={{ display:'inline-flex', alignItems:'center', border:`1px solid ${RULE}`, userSelect:'none' }}>
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    style={{
                      width:40, height:40, background:'none', border:'none',
                      borderRight:`1px solid ${RULE}`,
                      cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                      fontSize:20, lineHeight:1, color: qty <= 1 ? '#ccc' : INK,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0,
                    }}>
                    −
                  </button>
                  <span style={{
                    minWidth:44, textAlign:'center',
                    fontFamily:'Poppins,sans-serif', fontSize:14, fontWeight:500, color:INK,
                    padding:'0 4px',
                  }}>
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.min(product.stock > 0 ? product.stock : 99, q + 1))}
                    disabled={product.stock > 0 && qty >= product.stock}
                    style={{
                      width:40, height:40, background:'none', border:'none',
                      borderLeft:`1px solid ${RULE}`,
                      cursor: (product.stock > 0 && qty >= product.stock) ? 'not-allowed' : 'pointer',
                      fontSize:20, lineHeight:1, color: (product.stock > 0 && qty >= product.stock) ? '#ccc' : INK,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0,
                    }}>
                    +
                  </button>
                </div>
              </div>

              {/* ADD TO CART — full width, plum, square corners, refined typography */}
              <button onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                style={{
                  width: '100%',
                  padding: '16px 0',
                  background: product.stock === 0 ? '#b0b0b0' : adding ? '#5a0d3e' : PLUM,
                  color: WHT,
                  border: 'none',
                  borderRadius: 0,
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                  transition: 'background 0.22s, transform 0.12s',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transform: adding ? 'scale(0.99)' : 'scale(1)',
                }}>
                {adding ? (
                  <>
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      display: 'inline-block',
                      animation: 'spin .65s linear infinite',
                    }} />
                    Adding to Cart…
                  </>
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </button>

              {/* Delivery / pincode */}
              <div style={{ marginBottom:20 }}>
                <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
                  letterSpacing:'0.10em', textTransform:'uppercase', color:INK, marginBottom:8 }}>
                  Delivery For
                </p>
                <PincodeCheck />
              </div>

              {/* Service rows */}
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
                {[
                  { Icon:Truck,       text:'Express Shipping'                         },
                  { Icon:CreditCard,  text:'Cash on Delivery Available'               },
                  { Icon:ShoppingBag, text:'Easy 7-Days Returns — convenience fee applies' },
                ].map(({ Icon, text }) => (
                  <div key={text} style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <Icon size={16} strokeWidth={1.5} color={MUTE} />
                    <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:INK }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <hr style={{ border:'none', borderTop:`1px solid ${RULE}`, marginBottom:0 }} />

              {/* Accordions */}
              <AccordItem label="Description" open={aDesc} onToggle={() => setADesc(v=>!v)}>
                {product.description
                  ? (/<[a-z][\s\S]*>/i.test(product.description)
                      ? <HtmlDesc html={product.description} />
                      : <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:MUTE, lineHeight:1.7 }}>{product.description}</p>)
                  : <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE }}>No description available.</p>}
              </AccordItem>

              <AccordItem label="Size & Fit" open={aSize} onToggle={() => setASize(v=>!v)}>
                <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, marginBottom:12 }}>
                  All measurements in inches. Size availability depends on stock.
                </p>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, fontFamily:'Poppins,sans-serif' }}>
                    <thead>
                      <tr style={{ background:'#f5f5f5' }}>
                        {['Size','Chest','Waist','Length'].map(h => (
                          <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11,
                            fontWeight:600, letterSpacing:'0.10em', textTransform:'uppercase',
                            color:INK, borderBottom:`1px solid ${RULE}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_CHART.map((row,i) => {
                        const avail = product.sizes?.includes(row.size)
                        return (
                          <tr key={row.size} style={{ background: i%2===0?WHT:'#fafafa' }}>
                            <td style={{ padding:'8px 12px', borderBottom:`1px solid ${RULE}`,
                              color: avail ? PLUM : INK, fontWeight: avail ? 600 : 400 }}>
                              {row.size}{avail && ' ✓'}
                            </td>
                            <td style={{ padding:'8px 12px', borderBottom:`1px solid ${RULE}`, color:MUTE }}>{row.chest}"</td>
                            <td style={{ padding:'8px 12px', borderBottom:`1px solid ${RULE}`, color:MUTE }}>{row.waist}"</td>
                            <td style={{ padding:'8px 12px', borderBottom:`1px solid ${RULE}`, color:MUTE }}>{row.length}"</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </AccordItem>

              <AccordItem label="Material & Care" open={aMat} onToggle={() => setAMat(v=>!v)}>
                <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:MUTE, lineHeight:1.7 }}>
                  {product.material || 'Please refer to the product label for material and care instructions.'}
                </p>
              </AccordItem>

              <AccordItem label="Specifications" open={aSpec} onToggle={() => setASpec(v=>!v)}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, fontFamily:'Poppins,sans-serif' }}>
                  <tbody>
                    {[
                      product.category && ['Category',  product.category],
                      product.sizes?.length && ['Available Sizes', product.sizes.join(', ')],
                      product.stock !== undefined && ['Stock', product.stock > 0 ? `${product.stock} available` : 'Out of Stock'],
                      ['SKU', skuStr],
                    ].filter(Boolean).map(([k,v]) => (
                      <tr key={k} style={{ borderBottom:`1px solid ${RULE}` }}>
                        <td style={{ padding:'9px 0', fontWeight:600, color:INK, width:'40%' }}>{k}</td>
                        <td style={{ padding:'9px 0', color:MUTE }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordItem>

            </div>
          </div>

          {/* Reviews */}
          <ReviewsSection productId={id} productImg={images[0]} />

          {/* Similar Products */}
          <SimilarProducts productId={id} />

        </div>
      </main>
    </>
  )
}
