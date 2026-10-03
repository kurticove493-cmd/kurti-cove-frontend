'use client'
/*
  SHOP PAGE — Libas-style redesign v3 (complete, clean)
  ─────────────────────────────────────────────────────
  URL = single source of truth. All API/filter/URL logic
  preserved exactly. Presentation only is restyled.
*/
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, X, ChevronDown, ChevronLeft, ChevronRight,
  SlidersHorizontal, Check, ArrowUpDown,
} from 'lucide-react'
import ProductCard from '../../components/user/ProductCard'
import { staticImg } from '../../lib/staticImg.js'

/* ── Palette ── */
const INK  = '#141414'
const MUTE = '#888'
const ROSE = '#E05C88'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const BASE  = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

/* Sort: price only — Newest/BestSellers live in COLLECTION accordion */
const SORT_OPTS = [
  { label: 'Price: Low → High', value: 'asc'  },
  { label: 'Price: High → Low', value: 'desc' },
]

/* Collection options reuse the same ?filter= param as header nav */
const COLL_OPTS = [
  { label: 'New Arrivals', value: 'isNewArrival' },
  { label: 'Best Sellers', value: 'isBestSeller' },
  { label: 'On Sale',      value: 'onSale'       },
]

/* ── Global shop-page CSS (scoped by .sp prefix) ── */
const SHOP_CSS = `
  .sp { background:#fff; min-height:100vh; }
  .sp *,.sp *::before,.sp *::after { box-sizing:border-box; }

  /* sidebar: hidden <768, visible >=768 */
  .sp-aside {
    display:none;
    width:230px; flex-shrink:0;
    position:sticky; top:84px;
    max-height:calc(100vh - 100px);
    overflow-y:auto; overflow-x:hidden;
    scrollbar-width:none;
    padding:24px 24px 24px 0;
    border-right:1px solid ${RULE};
  }
  .sp-aside::-webkit-scrollbar { display:none; }
  @media (min-width:768px) { .sp-aside { display:block; } }

  /* mobile filter button: only <768 */
  .sp-mob-filter { display:inline-flex; }
  @media (min-width:768px) { .sp-mob-filter { display:none !important; } }

  /* right content column */
  .sp-content { flex:1; min-width:0; padding-top:24px; }
  @media (min-width:768px) { .sp-content { padding-left:32px; } }

  /* product grid */
  .sp-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  @media (min-width:480px) { .sp-grid { gap:14px; } }
  @media (min-width:640px) { .sp-grid { grid-template-columns:repeat(3,1fr); gap:16px; } }
  @media (min-width:1280px){ .sp-grid { grid-template-columns:repeat(4,1fr); gap:18px; } }

  /* mobile drawer */
  .sp-backdrop {
    position:fixed; inset:0; z-index:40;
    background:rgba(0,0,0,0.32);
    transition:opacity 0.26s;
  }
  .sp-drawer {
    position:fixed; top:0; left:0; bottom:0; z-index:50;
    width:300px; max-width:90vw;
    background:${WHT};
    box-shadow:4px 0 28px rgba(0,0,0,0.12);
    transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);
    display:flex; flex-direction:column; overflow:hidden;
  }

  /* hairline */
  .sp-hr { border:none; border-top:1px solid ${RULE}; margin:0; }

  /* pagination */
  .sp-page-btn {
    display:inline-flex; align-items:center; gap:4px;
    padding:8px 20px;
    font-family:Poppins,sans-serif; font-size:11px;
    font-weight:500; letter-spacing:0.08em; text-transform:uppercase;
    color:${INK}; background:none; border:1px solid ${RULE}; cursor:pointer;
    transition:border-color 0.15s;
  }
  .sp-page-btn:hover:not(:disabled) { border-color:${INK}; }
  .sp-page-btn:disabled { opacity:0.35; cursor:not-allowed; }

  /* banner slider */
  .sb-wrap { position:relative; width:100%; overflow:hidden; height:140px; }
  @media (min-width:480px) { .sb-wrap { height:180px; } }
  @media (min-width:640px) { .sb-wrap { height:220px; border-radius:8px; } }
  @media (min-width:768px) { .sb-wrap { height:260px; border-radius:10px; } }
  @media (min-width:1024px){ .sb-wrap { height:300px; border-radius:10px; } }
  .sb-slide { position:absolute; inset:0; transition:opacity 0.75s ease; }
  .sb-slide img {
    width:100%; height:100%; object-fit:cover; display:block;
    transition:transform 0.75s ease;
  }
  .sb-slide.entering img { transform:scale(1.025); }
  .sb-slide.active   img { transform:scale(1.0); }
  /* NO bottom-fade ::after */
  .sb-btn {
    position:absolute; top:50%; transform:translateY(-50%);
    z-index:20; display:flex; align-items:center; justify-content:center;
    width:30px; height:30px; border-radius:50%;
    background:rgba(255,255,255,0.82);
    border:1px solid rgba(0,0,0,0.08);
    box-shadow:0 1px 5px rgba(0,0,0,0.10);
    color:${INK}; cursor:pointer; backdrop-filter:blur(4px);
    transition:background 0.18s, transform 0.18s;
  }
  .sb-btn:hover { background:#fff; transform:translateY(-50%) scale(1.1); }

  /* accordion */
  .acc-body {
    overflow:hidden;
    transition:max-height 0.3s ease;
  }
`

/* ═══════════════════════════════════════════
   BANNER SLIDER  (no bottom fade)
═══════════════════════════════════════════ */
const BANNERS = [
  { src: staticImg('/shop-banner/image1.webp'), alt: 'Shop Banner 1' },
  { src: staticImg('/shop-banner/image2.webp'), alt: 'Shop Banner 2' },
  { src: staticImg('/shop-banner/image3.webp'), alt: 'Shop Banner 3' },
]

function BannerSlider() {
  const [cur, setCur] = useState(0)
  const [prv, setPrv] = useState(null)
  const tmr = useRef(null)
  const tot = BANNERS.length

  const tick = useCallback(() => {
    clearInterval(tmr.current)
    tmr.current = setInterval(() => setCur(c => (c + 1) % tot), 4200)
  }, [tot])

  useEffect(() => { tick(); return () => clearInterval(tmr.current) }, [tick])

  const go = useCallback((i) => {
    const n = ((i % tot) + tot) % tot
    setCur(p => { setPrv(p); return n })
    tick()
  }, [tot, tick])

  return (
    <div className="sb-wrap">
      {BANNERS.map((b, i) => (
        <div key={b.src}
          className={`sb-slide${i === cur ? ' active' : i === prv ? ' entering' : ''}`}
          style={{ opacity: i === cur ? 1 : 0, zIndex: i === cur ? 2 : i === prv ? 1 : 0, pointerEvents: i === cur ? 'auto' : 'none' }}
          aria-hidden={i !== cur}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.src} alt={b.alt} loading="eager" decoding="async"
            fetchPriority={i === 0 ? 'high' : 'auto'} draggable={false} width={1500} height={650} />
        </div>
      ))}
      <button className="sb-btn" onClick={() => go(cur - 1)} aria-label="Prev" style={{ left: 10 }}>
        <ChevronLeft size={13} strokeWidth={2} />
      </button>
      <button className="sb-btn" onClick={() => go(cur + 1)} aria-label="Next" style={{ right: 10 }}>
        <ChevronRight size={13} strokeWidth={2} />
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SORT CONTROL  (price options only)
═══════════════════════════════════════════ */
function SortControl({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const cur = SORT_OPTS.find(o => o.value === value)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'Poppins,sans-serif', fontSize: 11, fontWeight: 500,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        color: open ? ROSE : INK, background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <ArrowUpDown size={12} strokeWidth={1.8} />
        <span style={{ color: MUTE }}>Sort</span>
        {cur ? <span>{cur.label}</span> : <span>Default</span>}
        <ChevronDown size={11} strokeWidth={2}
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)',
          background: WHT, minWidth: 200,
          border: `1px solid ${RULE}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.09)', zIndex: 40,
        }}>
          <button onClick={() => { onChange(''); setOpen(false) }} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
            fontFamily: 'Poppins,sans-serif', fontSize: 11, letterSpacing: '0.08em',
            textTransform: 'uppercase', fontWeight: !value ? 600 : 400,
            color: !value ? ROSE : INK, background: 'none', border: 'none',
            cursor: 'pointer', borderBottom: `1px solid ${RULE}`,
          }}>
            Default
          </button>
          {SORT_OPTS.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
              fontFamily: 'Poppins,sans-serif', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', fontWeight: o.value === value ? 600 : 400,
              color: o.value === value ? ROSE : INK, background: 'none', border: 'none',
              cursor: 'pointer', borderBottom: `1px solid ${RULE}`,
            }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   ACCORDION
═══════════════════════════════════════════ */
function Accordion({ label, open: controlledOpen, onToggle, children }) {
  return (
    <div style={{ borderBottom: `1px solid ${RULE}` }}>
      <button onClick={onToggle} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '14px 0',
        background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <span style={{
          fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 600,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: INK,
        }}>
          {label}
        </span>
        <ChevronDown size={14} strokeWidth={2} color={MUTE}
          style={{ transition: 'transform 0.22s', transform: controlledOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
      </button>
      <div className="acc-body" style={{ maxHeight: controlledOpen ? 800 : 0 }}>
        <div style={{ paddingBottom: 16 }}>{children}</div>
      </div>
    </div>
  )
}

/* Square checkbox row */
function CheckRow({ label, count, checked, onChange }) {
  return (
    <label onClick={onChange} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 0', cursor: 'pointer',
    }}>
      <span style={{
        width: 15, height: 15, flexShrink: 0,
        border: `1.5px solid ${checked ? ROSE : '#c8c8c8'}`,
        background: checked ? ROSE : WHT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, border-color 0.15s',
      }}>
        {checked && <Check size={9} color="#fff" strokeWidth={3} />}
      </span>
      <span style={{
        fontFamily: 'Poppins,sans-serif', fontSize: 13,
        color: checked ? INK : '#444', fontWeight: checked ? 500 : 400, flex: 1,
      }}>
        {label}
      </span>
      {count !== undefined && (
        <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 11, color: MUTE }}>({count})</span>
      )}
    </label>
  )
}

/* ═══════════════════════════════════════════
   FILTER SIDEBAR
   Desktop: always-visible inline, no toggle
   Mobile:  inside left-slide drawer only
═══════════════════════════════════════════ */
function FilterSidebar({ filters, updateFilter, clearFilters, hasActiveFilters, onClose, isDrawer }) {
  const [searchVal,  setSearchVal]  = useState(filters.search)
  const [minPx,      setMinPx]      = useState(filters.minPrice)
  const [maxPx,      setMaxPx]      = useState(filters.maxPrice)
  const [cats,       setCats]       = useState([])
  const [moreCats,   setMoreCats]   = useState(false)
  const debRef = useRef(null)

  /* open states for each accordion */
  const [openColl,  setOpenColl]  = useState(true)
  const [openSize,  setOpenSize]  = useState(true)
  const [openCat,   setOpenCat]   = useState(false)
  const [openPrice, setOpenPrice] = useState(false)

  useEffect(() => {
    fetch(`${BASE}product/categories`).then(r => r.json())
      .then(d => { if (d.success) setCats(d.data) }).catch(() => {})
  }, [])

  useEffect(() => { setSearchVal(filters.search)   }, [filters.search])
  useEffect(() => { setMinPx(filters.minPrice)     }, [filters.minPrice])
  useEffect(() => { setMaxPx(filters.maxPrice)     }, [filters.maxPrice])

  /* debounced search → URL */
  useEffect(() => {
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => {
      if (searchVal !== filters.search) updateFilter('search', searchVal)
    }, 320)
    return () => clearTimeout(debRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVal])

  const applyPrice = () => {
    updateFilter('minPrice', minPx)
    updateFilter('maxPrice', maxPx)
  }

  const visCats = moreCats ? cats : cats.slice(0, 6)

  return (
    <div style={{ height: isDrawer ? '100%' : undefined, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isDrawer ? '18px 20px 15px' : '0 0 15px',
        borderBottom: `1px solid ${RULE}`, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={15} strokeWidth={1.8} color={INK} />
          <span style={{
            fontFamily: 'Poppins,sans-serif', fontSize: 15,
            fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK,
          }}>
            Filter
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {hasActiveFilters && (
            <button onClick={() => { clearFilters(); onClose?.() }} style={{
              fontFamily: 'Poppins,sans-serif', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: ROSE, background: 'none', border: 'none', cursor: 'pointer',
            }}>
              Clear all
            </button>
          )}
          {isDrawer && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTE, display: 'flex' }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none',
        padding: isDrawer ? '0 20px 24px' : '0',
      }}>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid ${RULE}`, padding: '9px 12px', margin: '16px 0',
        }}>
          <Search size={13} color={MUTE} strokeWidth={1.8} />
          <input type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
            placeholder="Search kurtis…" style={{
              flex: 1, fontSize: 13, fontFamily: 'Poppins,sans-serif',
              background: 'transparent', outline: 'none', border: 'none', color: INK,
            }} />
          {searchVal && (
            <button onClick={() => setSearchVal('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTE, display: 'flex' }}>
              <X size={11} />
            </button>
          )}
        </div>

        {/* COLLECTION */}
        <Accordion label="Collection" open={openColl} onToggle={() => setOpenColl(v => !v)}>
          {COLL_OPTS.map(o => (
            <CheckRow key={o.value} label={o.label}
              checked={filters.filter === o.value}
              onChange={() => updateFilter('filter', filters.filter === o.value ? '' : o.value)}
            />
          ))}
        </Accordion>

        {/* SIZE */}
        <Accordion label="Size" open={openSize} onToggle={() => setOpenSize(v => !v)}>
          {SIZES.map(s => (
            <CheckRow key={s} label={s}
              checked={filters.size === s}
              onChange={() => updateFilter('size', filters.size === s ? '' : s)}
            />
          ))}
        </Accordion>

        {/* CATEGORY */}
        <Accordion label="Category" open={openCat} onToggle={() => setOpenCat(v => !v)}>
          {visCats.map(({ name, count }) => (
            <CheckRow key={name} label={name} count={count}
              checked={filters.category === name}
              onChange={() => updateFilter('category', filters.category === name ? '' : name)}
            />
          ))}
          {cats.length > 6 && (
            <button onClick={() => setMoreCats(v => !v)} style={{
              fontFamily: 'Poppins,sans-serif', fontSize: 12, color: ROSE,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', textDecoration: 'underline',
            }}>
              {moreCats ? 'Show less' : `Show ${cats.length - 6} more`}
            </button>
          )}
        </Accordion>

        {/* PRICE */}
        <Accordion label="Price" open={openPrice} onToggle={() => setOpenPrice(v => !v)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Min ₹', val: minPx, set: setMinPx, ph: '0'   },
              { label: 'Max ₹', val: maxPx, set: setMaxPx, ph: 'Any' },
            ].map((f, i) => (
              <div key={i} style={{ flex: 1, border: `1px solid ${RULE}`, padding: '8px 10px' }}>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTE, marginBottom: 4 }}>
                  {f.label}
                </p>
                <input type="number" min={0} value={f.val} placeholder={f.ph}
                  onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', fontSize: 13, fontFamily: 'Poppins,sans-serif', background: 'transparent', outline: 'none', border: 'none', color: INK }} />
              </div>
            ))}
          </div>
          <button onClick={applyPrice} style={{
            width: '100%', padding: '9px 0',
            fontFamily: 'Poppins,sans-serif', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: WHT, background: INK, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Check size={11} strokeWidth={3} /> Apply
          </button>
        </Accordion>

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════ */
function Skel() {
  return (
    <div>
      <div className="animate-pulse" style={{ aspectRatio: '3/4', background: '#f0f0f0', borderRadius: 6 }} />
      <div style={{ paddingTop: 10 }}>
        <div className="animate-pulse" style={{ height: 11, background: '#ebebeb', borderRadius: 2, marginBottom: 7, width: '80%' }} />
        <div className="animate-pulse" style={{ height: 11, background: '#ebebeb', borderRadius: 2, width: '55%' }} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   ACTIVE CHIP
═══════════════════════════════════════════ */
function Chip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      border: `1px solid ${RULE}`, padding: '3px 10px',
      fontFamily: 'Poppins,sans-serif', fontSize: 11,
      letterSpacing: '0.06em', color: INK,
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: MUTE }}>
        <X size={9} strokeWidth={2.5} />
      </button>
    </span>
  )
}

/* ═══════════════════════════════════════════
   PAGE HEADING
═══════════════════════════════════════════ */
function Heading({ filters }) {
  let t = 'Shop All Kurtis', s = 'Handpicked ethnic wear for every occasion'
  if      (filters.category)                  { t = filters.category;   s = `Explore our ${filters.category} collection` }
  else if (filters.filter === 'isNewArrival') { t = 'New Arrivals';     s = 'Fresh styles, updated every week' }
  else if (filters.filter === 'isBestSeller') { t = 'Best Sellers';     s = 'Loved by thousands of customers' }
  else if (filters.filter === 'onSale')       { t = 'On Sale';          s = 'Curated deals — limited time' }
  else if (filters.search)                    { t = `"${filters.search}"`; s = 'Search results' }
  return (
    <div style={{ marginBottom: 18 }}>
      <h1 style={{
        fontFamily: '"Playfair Display",Georgia,serif',
        fontSize: 28, fontWeight: 700, color: INK,
        letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 5,
      }}>
        {t}
      </h1>
      <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: MUTE, letterSpacing: '0.04em' }}>
        {s}
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN SHOP CONTENT
═══════════════════════════════════════════ */
function ShopContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* URL is single source of truth */
  const filters = {
    sort:     searchParams.get('sort')     ?? '',
    size:     searchParams.get('size')     ?? '',
    filter:   searchParams.get('filter')   ?? '',
    category: searchParams.get('category') ?? '',
    search:   searchParams.get('search')   ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    page:     Number(searchParams.get('page')) || 1,
  }

  const queryKey = [
    filters.sort, filters.size, filters.filter, filters.category,
    filters.search, filters.minPrice, filters.maxPrice, filters.page,
  ].join('|')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (filters.sort)     p.set('sort',          filters.sort)
      if (filters.size)     p.set('size',          filters.size)
      if (filters.search)   p.set('search',        filters.search)
      if (filters.filter)   p.set(filters.filter,  'true')   /* isNewArrival=true etc */
      if (filters.category) p.set('category',      filters.category)
      if (filters.minPrice) p.set('minPrice',      filters.minPrice)
      if (filters.maxPrice) p.set('maxPrice',      filters.maxPrice)
      p.set('page',  String(filters.page))
      p.set('limit', '20')

      const res  = await fetch(`${BASE}product?${p}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setProducts(data.data ?? [])
        setPagination(data.pagination ?? { total: 0, pages: 1, page: 1 })
      } else {
        setProducts([])
        setPagination({ total: 0, pages: 1, page: 1 })
      }
    } catch {
      setProducts([])
      setPagination({ total: 0, pages: 1, page: 1 })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateFilter = useCallback((key, value) => {
    const cur = new URLSearchParams(searchParams.toString())
    if (value) { cur.set(key, value) } else { cur.delete(key) }
    cur.delete('page')
    const qs = cur.toString()
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false })
  }, [searchParams, router])

  const clearFilters = useCallback(() => {
    router.replace('/shop', { scroll: false })
  }, [router])

  const hasActive = !!(
    filters.sort || filters.size || filters.filter ||
    filters.search || filters.category || filters.minPrice || filters.maxPrice
  )

  const goPage = useCallback((p) => {
    const cur = new URLSearchParams(searchParams.toString())
    if (p > 1) { cur.set('page', String(p)) } else { cur.delete('page') }
    const qs = cur.toString()
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false })
  }, [searchParams, router])

  const sidebarProps = { filters, updateFilter, clearFilters, hasActiveFilters: hasActive }

  return (
    <>
      <style>{SHOP_CSS}</style>

      <main className="sp">
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 16px 56px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>

            {/* ── DESKTOP SIDEBAR: always visible on ≥768, hidden below ── */}
            <aside className="sp-aside">
              <FilterSidebar {...sidebarProps} isDrawer={false} />
            </aside>

            {/* ── RIGHT COLUMN ── */}
            <div className="sp-content">

              {/* Heading */}
              <Heading filters={filters} />

              {/* Banner slider — under the heading, no bottom fade */}
              <div style={{ marginBottom: 22 }}>
                <BannerSlider />
              </div>

              {/* Toolbar: mobile filter btn + count + chips | sort */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 10, flexWrap: 'wrap', marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

                  {/* Mobile filter toggle — CSS hides on ≥768 */}
                  <button
                    className="sp-mob-filter"
                    onClick={() => setDrawerOpen(true)}
                    style={{
                      alignItems: 'center', gap: 6,
                      fontFamily: 'Poppins,sans-serif', fontSize: 12, fontWeight: 600,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: INK, background: 'none',
                      border: `1px solid ${RULE}`, padding: '7px 16px', cursor: 'pointer',
                    }}
                  >
                    <SlidersHorizontal size={12} strokeWidth={1.8} />
                    Filter
                    {hasActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: ROSE, display: 'inline-block' }} />}
                  </button>

                  <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: MUTE }}>
                    {pagination.total} Products
                  </span>

                  {/* Active chips */}
                  {filters.filter && (
                    <Chip label={COLL_OPTS.find(c => c.value === filters.filter)?.label ?? filters.filter}
                      onRemove={() => updateFilter('filter', '')} />
                  )}
                  {filters.category && (
                    <Chip label={filters.category} onRemove={() => updateFilter('category', '')} />
                  )}
                  {filters.size && (
                    <Chip label={`Size: ${filters.size}`} onRemove={() => updateFilter('size', '')} />
                  )}
                  {filters.search && (
                    <Chip label={`"${filters.search}"`} onRemove={() => updateFilter('search', '')} />
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <Chip
                      label={`₹${filters.minPrice || 0}–₹${filters.maxPrice || '∞'}`}
                      onRemove={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', '') }}
                    />
                  )}
                </div>

                <SortControl value={filters.sort} onChange={v => updateFilter('sort', v)} />
              </div>

              <hr className="sp-hr" style={{ marginBottom: 20 }} />

              {/* Grid / empty / skeleton */}
              {loading ? (
                <div className="sp-grid">
                  {Array.from({ length: 12 }).map((_, i) => <Skel key={i} />)}
                </div>
              ) : products.length === 0 ? (
                /* Empty state — NO clear-filters button here */
                <div style={{ textAlign: 'center', padding: '72px 0' }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    border: `1px solid ${RULE}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 18px',
                  }}>
                    <Search size={20} strokeWidth={1.2} color={MUTE} />
                  </div>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 500, color: INK, marginBottom: 6 }}>
                    {filters.search
                      ? `No results for "${filters.search}"`
                      : filters.category
                        ? `No products in "${filters.category}"`
                        : 'No products found'}
                  </p>
                  <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: MUTE }}>
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <>
                  <div className="sp-grid">
                    {products.map((p, i) => (
                      <ProductCard key={p._id} product={p} priority={i < 4} />
                    ))}
                  </div>

                  {pagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 48 }}>
                      <button className="sp-page-btn"
                        onClick={() => goPage(Math.max(1, filters.page - 1))}
                        disabled={filters.page === 1}>
                        <ChevronLeft size={13} /> Prev
                      </button>
                      <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: MUTE, padding: '0 8px' }}>
                        {filters.page} / {pagination.pages}
                      </span>
                      <button className="sp-page-btn"
                        onClick={() => goPage(Math.min(pagination.pages, filters.page + 1))}
                        disabled={filters.page === pagination.pages}>
                        Next <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── MOBILE DRAWER ── */}
      <div className="sp-backdrop"
        style={{ opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'auto' : 'none' }}
        onClick={() => setDrawerOpen(false)}
      />
      <div className="sp-drawer"
        style={{ transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <FilterSidebar {...sidebarProps} isDrawer={true} onClose={() => setDrawerOpen(false)} />
      </div>
    </>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: WHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `2.5px solid ${ROSE}`, borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
