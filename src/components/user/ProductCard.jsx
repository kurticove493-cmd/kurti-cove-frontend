'use client'
import Link from 'next/link'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { Star } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { cldUrl, normalizeProductImages } from '../../lib/cloudinaryImage.js'

const WL_KEY = 'kc_wishlist'
const getWL  = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') } catch { return [] } }

export default function ProductCard({ product, priority = false, showNewTag = false }) {
  const [inWL, setInWL] = useState(false)

  useEffect(() => { setInWL(getWL().includes(product._id)) }, [product._id])

  const toggleWL = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    const wl   = getWL()
    const next = wl.includes(product._id) ? wl.filter(x => x !== product._id) : [...wl, product._id]
    localStorage.setItem(WL_KEY, JSON.stringify(next))
    setInWL(!inWL)
    window.dispatchEvent(new Event('kc-wishlist-changed'))
  }, [product._id, inWL])

  const cur    = product.discountPrice || product.price
  const hasDis = product.discountPrice && product.discountPrice < product.price
  const pct    = hasDis ? Math.round((1 - product.discountPrice / product.price) * 100) : 0
  const avgR   = product.avgRating   || product.rating    || 0
  const revCnt = product.reviewCount || product.numReviews || 0
  const showR  = avgR > 0 && revCnt > 0
  const sizes  = (Array.isArray(product.sizes) && product.sizes.length ? product.sizes
                 : Array.isArray(product.size)  && product.size.length  ? product.size : [])

  /* Normalize images — handles plain strings, objects, JSON strings safely */
  const normalizedImgs = normalizeProductImages(product.images, product.name)
  const rawSrc = normalizedImgs.length > 0 ? normalizedImgs[0].src : ''
  const imgSrc = rawSrc ? cldUrl(rawSrc, { width: 480 }) : ''

  return (
    <>
      <style>{`
        .pc { background:#fff; cursor:pointer; display:block; }
        .pc:hover .pc-img { transform:scale(1.04); }
        .pc-img {
          width:100%; height:100%; object-fit:cover;
          transition:transform 0.5s ease; display:block;
        }
        /* Fixed aspect-ratio wrapper — prevents blank vertical space on broken/missing images */
        .pc-img-wrap {
          position:relative; overflow:hidden;
          aspect-ratio:3/4; background:#f5f5f5;
        }
        .pc-heart {
          position:absolute; bottom:9px; right:9px; z-index:10;
          width:28px; height:28px;
          background:rgba(255,255,255,0.88);
          border-radius:50%; border:1px solid rgba(0,0,0,0.08);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:background 0.18s,transform 0.18s;
          backdrop-filter:blur(4px);
        }
        .pc-heart:hover { background:#fff; transform:scale(1.12); }
        .pc-pill {
          position:absolute; bottom:9px; left:9px; z-index:10;
          display:inline-flex; align-items:center; gap:3px;
          background:rgba(255,255,255,0.90); backdrop-filter:blur(4px);
          border-radius:20px; padding:2px 7px; font-size:10px;
          font-family:Poppins,sans-serif; font-weight:600; color:#141414;
          border:1px solid rgba(0,0,0,0.07); line-height:1.4;
        }
        .pc-new {
          position:absolute; top:8px; left:8px; z-index:10;
          background:#141414; color:#fff;
          font-family:Poppins,sans-serif; font-size:9px; font-weight:600;
          letter-spacing:0.12em; padding:3px 8px; text-transform:uppercase;
        }
        .pc-oos {
          position:absolute; inset:0; background:rgba(255,255,255,0.55);
          display:flex; align-items:center; justify-content:center;
        }
        .pc-oos span {
          background:#fff; font-size:10px; font-family:Poppins,sans-serif;
          font-weight:600; padding:3px 10px; color:#141414; letter-spacing:0.06em;
        }
        .pc-no-img {
          position:absolute; inset:0;
          display:flex; align-items:center; justify-content:center;
          font-size:40px; color:#ccc; background:#f5f5f5;
        }
      `}</style>

      <Link href={`/product/${product._id}`} className="pc">

        {/* IMAGE — aspect-ratio container prevents blank space when image missing */}
        <div className="pc-img-wrap">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              fetchPriority={priority ? 'high' : 'low'}
              className="pc-img"
              width={480}
              height={640}
              onError={e => {
                /* Try raw URL without Cloudinary transforms once */
                if (!e.currentTarget.dataset.triedRaw && rawSrc && rawSrc !== imgSrc) {
                  e.currentTarget.dataset.triedRaw = '1'
                  e.currentTarget.src = rawSrc
                } else {
                  /* Final fallback: hide broken img, show emoji placeholder */
                  e.currentTarget.style.display = 'none'
                  const wrap = e.currentTarget.closest('.pc-img-wrap')
                  if (wrap && !wrap.querySelector('.pc-no-img')) {
                    const d = document.createElement('div')
                    d.className = 'pc-no-img'
                    d.textContent = '👗'
                    wrap.appendChild(d)
                  }
                }
              }}
            />
          ) : (
            <div className="pc-no-img">👗</div>
          )}

          {product.stock === 0 && (
            <div className="pc-oos"><span>OUT OF STOCK</span></div>
          )}
          {showNewTag && product.isNewArrival && (
            <div className="pc-new">New</div>
          )}
          {showR && (
            <div className="pc-pill">
              <Star size={9} fill="#E05C88" color="#E05C88" />
              {avgR.toFixed(1)}
              <span style={{ color:'#888', fontWeight:400 }}>({revCnt})</span>
            </div>
          )}
          <button
            onClick={toggleWL}
            aria-label={inWL ? 'Remove from wishlist' : 'Add to wishlist'}
            className="pc-heart"
          >
            {inWL
              ? <AiFillHeart size={13} color="#E05C88" />
              : <AiOutlineHeart size={13} color="#555" />}
          </button>
        </div>

        {/* TEXT */}
        <div style={{ paddingTop:9, paddingBottom:4 }}>
          <p style={{
            fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:400,
            color:'#1a1a1a', lineHeight:1.4, marginBottom:5,
            overflow:'hidden', display:'-webkit-box',
            WebkitLineClamp:1, WebkitBoxOrient:'vertical',
          }}>
            {product.name}
          </p>

          <div style={{ display:'flex', alignItems:'baseline', gap:5, flexWrap:'wrap', marginBottom:5 }}>
            {hasDis && (
              <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:'#aaa', textDecoration:'line-through', fontWeight:400 }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:600, color:'#1a1a1a' }}>
              ₹{cur.toLocaleString()}
            </span>
            {pct > 0 && (
              <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, fontWeight:500, color:'#E05C88' }}>
                {pct}% off
              </span>
            )}
          </div>

          {sizes.length > 0 && (
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:10, letterSpacing:'0.10em', color:'#888', fontWeight:400, textTransform:'uppercase' }}>
              {sizes.join('  ')}
            </p>
          )}
        </div>

      </Link>
    </>
  )
}
