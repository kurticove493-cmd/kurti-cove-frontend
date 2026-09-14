'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import {
  FiShoppingCart, FiMenu, FiX,
  FiLogOut, FiPackage, FiChevronRight,
  FiSearch, FiChevronDown,
} from 'react-icons/fi'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { User, Settings } from 'lucide-react'
import { resetCart } from '../../redux/features/CartSlice'
import API from '../../utils/Helper'

/* ── palette ─────────────────────────────────────── */
const C = {
  purple:    '#6B2D8B',
  purpleLt:  '#f3e8ff',
  text:      '#1a1a1a',
  muted:     'rgba(26,26,26,0.45)',
  border:    'rgba(0,0,0,0.09)',
  white:     '#ffffff',
}

/* ── drawer menu items — Libas style ─────────────── */
const MENU_SECTIONS = [
  {
    label: 'Shop by Categories',
    href:  '/shop',
    hasChevron: true,
  },
  {
    label: 'New Arrivals',
    href:  '/shop?filter=isNewArrival',
    hasChevron: true,
  },
  {
    label: 'Best Sellers',
    href:  '/shop?filter=isBestSeller',
    hasChevron: true,
  },
  {
    label: 'Sale',
    href:  '/shop?filter=onSale',
    hasChevron: true,
  },
  {
    label: 'All Products',
    href:  '/shop',
    hasChevron: false,
  },
]

const WL_KEY = 'kc_wishlist'

function AvatarInitial({ name }) {
  const initial = (name || 'U')[0].toUpperCase()
  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ background: C.purple, color: '#fff' }}
    >
      {initial}
    </span>
  )
}

function HeaderInner() {
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [userMenu,    setUserMenu]    = useState(false)
  const [user,        setUser]        = useState(null)
  const [wishlist,    setWishlist]    = useState([])
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const cartItems = useSelector((s) => s.cart.items)
  const cartBadge = cartItems.length
  const dispatch  = useDispatch()
  const pathname  = usePathname()
  const router    = useRouter()
  const searchParams = useSearchParams()

  const userMenuRef = useRef(null)
  const searchInput = useRef(null)

  /* auth */
  useEffect(() => {
    const read = () => {
      const token = localStorage.getItem('kc_token')
      const data  = localStorage.getItem('kc_user')
      if (token && data) { try { setUser(JSON.parse(data)) } catch {} }
      else setUser(null)
    }
    read()
    window.addEventListener('kc-auth-changed', read)
    window.addEventListener('storage', read)
    return () => {
      window.removeEventListener('kc-auth-changed', read)
      window.removeEventListener('storage', read)
    }
  }, [])

  /* wishlist */
  useEffect(() => {
    const read = () => {
      try { const s = localStorage.getItem(WL_KEY); setWishlist(s ? JSON.parse(s) : []) }
      catch { setWishlist([]) }
    }
    read()
    window.addEventListener('kc-wishlist-changed', read)
    window.addEventListener('storage', read)
    return () => {
      window.removeEventListener('kc-wishlist-changed', read)
      window.removeEventListener('storage', read)
    }
  }, [])

  /* lock body scroll when menu/drawer open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  /* outside click — user dropdown */
  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* focus search input */
  useEffect(() => {
    if (searchOpen && searchInput.current) searchInput.current.focus()
  }, [searchOpen])

  /* logout */
  const handleLogout = async () => {
    try { await API.post('/user/logout') } catch {}
    localStorage.removeItem('kc_token')
    localStorage.removeItem('kc_user')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    dispatch(resetCart())
    window.dispatchEvent(new Event('kc-auth-changed'))
    window.location.href = '/'
  }

  /* search */
  const handleSearch = useCallback((e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    setSearchQuery('')
    router.push(`/shop?search=${encodeURIComponent(q)}`)
  }, [searchQuery, router])

  return (
    <>
      <style>{`
        /* ── Header always fixed, flat, white ── */
        .kc-hdr {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: #ffffff;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          height: 56px;
        }
        @media (min-width: 768px) {
          .kc-hdr { height: 68px; }
        }

        /* ── Logo — Playfair italic centered ── */
        .kc-logo img {
          height: 36px;
        }
        @media (min-width: 768px) {
          .kc-logo img { height: 46px; }
        }

        /* ── Left / right text items (MENU, SEARCH, CONTACT US) ── */
        .kc-txt-btn {
          font-family: Poppins, sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1a1a1a;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px 2px;
          transition: color 0.18s;
          text-decoration: none;
          white-space: nowrap;
        }
        .kc-txt-btn:hover { color: #6B2D8B; }

        /* ── Icon buttons ── */
        .kc-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          color: #1a1a1a;
          border-radius: 50%;
          border: none;
          background: none;
          cursor: pointer;
          transition: color 0.18s;
        }
        .kc-icon-btn:hover { color: #6B2D8B; }

        /* ── Badge ── */
        .kc-badge {
          position: absolute;
          top: 0; right: 0;
          font-size: 8px;
          font-weight: 700;
          border-radius: 9999px;
          min-width: 15px;
          height: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 2px;
          line-height: 1;
          background: #6B2D8B;
          color: #fff;
        }

        /* ── Search bar dropdown ── */
        .kc-search-drop {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          width: 100%;
          background: #fff;
          border-bottom: 1px solid rgba(107,45,139,0.18);
          box-shadow: 0 8px 24px rgba(107,45,139,0.12);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          z-index: 200;
        }
        @media (min-width: 768px) {
          .kc-search-drop {
            position: absolute;
            top: calc(100% + 8px);
            left: 50%;
            right: auto;
            width: 360px;
            transform: translateX(-50%);
            border-bottom: none;
            border: 1px solid rgba(107,45,139,0.18);
            border-radius: 40px;
            box-shadow: 0 8px 24px rgba(107,45,139,0.12);
          }
        }

        /* ── Full-screen menu overlay ── */
        .kc-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 150;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.28s ease;
        }
        .kc-menu-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* ── Drawer panel — Libas: slides from LEFT, white, full height ── */
        .kc-drawer {
          position: fixed;
          top: 0; left: 0;
          height: 100%;
          width: 320px;
          max-width: 88vw;
          background: #ffffff;
          z-index: 160;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.12);
        }
        .kc-drawer.open { transform: translateX(0); }

        /* ── Drawer: top user strip ── */
        .kc-drawer-user {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .kc-drawer-login-label {
          font-family: Poppins, sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1a1a1a;
        }

        /* ── Drawer nav rows ── */
        .kc-drawer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          font-family: Poppins, sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #1a1a1a;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          transition: background 0.15s, color 0.15s;
        }
        .kc-drawer-row:hover {
          background: #f9f0ff;
          color: #6B2D8B;
        }
        .kc-drawer-row.active {
          color: #6B2D8B;
        }

        /* Spacer below header */
        .kc-spacer {
          height: 56px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .kc-spacer { height: 68px; }
        }

        /* Hide contact-us and user/login on mobile */
        .kc-desktop-only {
          display: none !important;
        }
        @media (min-width: 768px) {
          .kc-desktop-only {
            display: inline-flex !important;
          }
        }
        .kc-desktop-only-block {
          display: none !important;
        }
        @media (min-width: 768px) {
          .kc-desktop-only-block {
            display: block !important;
          }
        }
      `}</style>

      {/* ══════════ HEADER BAR ══════════ */}
      <header className="kc-hdr">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
            {/* Single MENU button — desktop shows text, mobile shows icon only */}
            <button
              onClick={() => setMenuOpen(true)}
              className="kc-txt-btn"
              aria-label="Open menu"
            >
              <FiMenu size={15} strokeWidth={1.9} />
              <span className="hidden sm:inline">Menu</span>
            </button>

            {/* SEARCH — desktop: text+icon; mobile: icon only */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSearchOpen(v => !v)}
                className="kc-txt-btn"
                aria-label="Search"
              >
                <FiSearch size={14} strokeWidth={1.9} />
                <span className="hidden sm:inline">Search</span>
              </button>

              {/* Search dropdown */}
              {searchOpen && (
                <form onSubmit={handleSearch} className="kc-search-drop">
                  <FiSearch size={14} style={{ color: C.purple, flexShrink: 0 }} />
                  <input
                    ref={searchInput}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search kurtis..."
                    style={{ flex: 1, fontSize: '0.85rem', background: 'transparent', outline: 'none', color: '#1a1a1a', fontFamily: 'Poppins, sans-serif' }}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} style={{ color: C.purple }}>
                      <FiX size={12} />
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* ── CENTER — Logo ── */}
          <div className="kc-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '0 12px' }}>
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Kurti Cove" draggable={false} loading="eager" style={{ objectFit: 'contain' }} />
            </Link>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
            {/* CONTACT US — desktop only */}
            <Link href="/contact" className="kc-txt-btn kc-desktop-only" style={{ marginRight: 4 }}>
              Contact Us
            </Link>

            {/* Profile / Login — desktop only, right after Contact Us */}
            {user ? (
              <div className="kc-desktop-only-block" style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="kc-icon-btn"
                  aria-label="Profile"
                  style={{ gap: 4 }}
                >
                  <AvatarInitial name={user.name} />
                </button>

                {userMenu && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 220, background: '#fff', borderRadius: 14, overflow: 'hidden',
                    boxShadow: '0 8px 28px rgba(107,45,139,0.14)',
                    border: '1px solid rgba(107,45,139,0.12)', zIndex: 200,
                  }}>
                    <div style={{ padding: '12px 16px', background: '#f9f0ff', borderBottom: '1px solid rgba(107,45,139,0.10)' }}>
                      <p style={{ fontSize: '0.7rem', color: C.purple, fontFamily: 'Poppins, sans-serif' }}>Signed in as</p>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3d1557', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Poppins, sans-serif' }}>{user.email}</p>
                    </div>
                    {[
                      { href: '/profile', Icon: User,      label: 'My Profile' },
                      { href: '/orders',  Icon: FiPackage, label: 'My Orders' },
                    ].map(({ href, Icon, label }) => (
                      <Link key={href} href={href} onClick={() => setUserMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', fontSize: '0.82rem', color: '#1a1a1a', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9f0ff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon size={14} style={{ color: C.purple }} />{label}
                        </span>
                        <FiChevronRight size={12} style={{ color: C.purple, opacity: 0.5 }} />
                      </Link>
                    ))}
                    {(user.role === 'admin' || user.role === 'superAdmin') && (
                      <Link href="/admin/products" onClick={() => setUserMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: '0.82rem', color: C.purple, textDecoration: 'none', fontFamily: 'Poppins, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9f0ff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Settings size={14} style={{ color: C.purple }} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', fontSize: '0.82rem', color: '#ef4444', background: 'none', border: 'none', borderTop: '1px solid rgba(107,45,139,0.10)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <FiLogOut size={13} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="kc-icon-btn kc-desktop-only" aria-label="Login">
                <User size={19} strokeWidth={1.8} />
              </Link>
            )}

            {/* Wishlist — always visible on all screen sizes */}
            <Link href="/wishlist" className="kc-icon-btn" aria-label="Wishlist">
              {wishlist.length > 0
                ? <AiFillHeart size={20} style={{ color: C.purple }} />
                : <AiOutlineHeart size={20} />}
              {wishlist.length > 0 && (
                <span className="kc-badge">{wishlist.length > 9 ? '9+' : wishlist.length}</span>
              )}
            </Link>

            {/* Cart — always visible on all screen sizes */}
            <Link href="/cart" className="kc-icon-btn" aria-label="Cart">
              <FiShoppingCart size={19} strokeWidth={1.8} />
              {cartBadge > 0 && (
                <span className="kc-badge">{cartBadge > 99 ? '99+' : cartBadge}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="kc-spacer" aria-hidden="true" />

      {/* ══════════ MENU OVERLAY ══════════ */}
      <div
        className={`kc-menu-overlay${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ══════════ DRAWER ══════════ */}
      <aside className={`kc-drawer${menuOpen ? ' open' : ''}`} aria-label="Navigation menu">

        {/* Top: user strip */}
        <div className="kc-drawer-user">
          {/* Avatar / login icon */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: C.purple,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={22} color="#fff" strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            {user ? (
              <>
                <div style={{ fontSize: '0.7rem', color: C.muted, fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hello</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Poppins, sans-serif' }}>{user.name || user.email}</div>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <span className="kc-drawer-login-label">Log In</span>
              </Link>
            )}
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{ padding: 6, color: '#1a1a1a', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Nav rows — scrollable */}
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {MENU_SECTIONS.map((item) => {
            const currentFilter = searchParams.get('filter') || ''
            let isActive = false
            if (item.href === '/') isActive = pathname === '/'
            else if (item.href === '/shop') isActive = pathname === '/shop' && currentFilter === ''
            else {
              const filterVal = new URLSearchParams(item.href.split('?')[1] || '').get('filter')
              isActive = pathname === '/shop' && currentFilter === filterVal
            }

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`kc-drawer-row${isActive ? ' active' : ''}`}
              >
                <span>{item.label}</span>
                {item.hasChevron && <FiChevronDown size={14} style={{ color: isActive ? C.purple : C.muted, transform: 'rotate(-90deg)' }} />}
              </Link>
            )
          })}

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '4px 0' }} />

          {/* Extra links */}
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="kc-drawer-row">
            <span>Contact Us</span>
          </Link>

          {/* Auth in drawer */}
          {user && (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="kc-drawer-row">
                <span>My Profile</span>
                <FiChevronDown size={14} style={{ color: C.muted, transform: 'rotate(-90deg)' }} />
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)} className="kc-drawer-row">
                <span>My Orders</span>
                <FiChevronDown size={14} style={{ color: C.muted, transform: 'rotate(-90deg)' }} />
              </Link>
              {(user.role === 'admin' || user.role === 'superAdmin') && (
                <Link href="/admin/products" onClick={() => setMenuOpen(false)} className="kc-drawer-row" style={{ color: C.purple }}>
                  <span>Admin Panel</span>
                  <FiChevronDown size={14} style={{ color: C.purple, transform: 'rotate(-90deg)' }} />
                </Link>
              )}
              <button onClick={() => { setMenuOpen(false); handleLogout() }} className="kc-drawer-row" style={{ color: '#ef4444', borderBottom: 'none' }}>
                <span>Log Out</span>
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}

export default function Header() {
  return (
    <Suspense fallback={<div style={{ height: 56 }} aria-hidden="true" />}>
      <HeaderInner />
    </Suspense>
  )
}
