'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, ShoppingBag, LogOut, Home, Tag, Star } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { resetCart } from '../../redux/features/CartSlice'
import API from '../../utils/Helper'
import { useAdminUser } from './AdminGuard'
import { useUpiAlertCtx } from './UpiAlertProvider'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#2a2a2a'
const WHT  = '#fff'

const NAV = [
  { label:'Products',      href:'/admin/products', Icon:Package     },
  { label:'Orders',        href:'/admin/orders',   Icon:ShoppingBag },
  { label:'Festival Sale', href:'/admin/sale',     Icon:Tag         },
  { label:'Reviews',       href:'/admin/reviews',  Icon:Star        },
]

const SIDEBAR_CSS = `
  .adm-aside { scrollbar-width:none; }
  .adm-aside::-webkit-scrollbar { display:none; }
  .adm-nav-link {
    display:flex; align-items:center; gap:10px;
    padding:10px 14px;
    font-family:Poppins,sans-serif; font-size:13px; font-weight:400;
    color:${MUTE}; text-decoration:none; border-radius:0;
    transition:color 0.15s, background 0.15s;
    letter-spacing:0.02em;
  }
  .adm-nav-link:hover { color:${WHT}; background:rgba(255,255,255,0.06); }
  .adm-nav-link.active { color:${WHT}; font-weight:600; background:rgba(255,255,255,0.10); }
  .adm-nav-link.active::before {
    content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
    width:3px; height:22px; background:${WHT};
  }
`

export default function AdminSidebar() {
  const pathname  = usePathname()
  const dispatch  = useDispatch()
  const adminUser = useAdminUser()
  const { pendingCount } = useUpiAlertCtx()

  const handleLogout = async () => {
    try { await API.post('/user/logout') } catch {}
    localStorage.removeItem('kc_token')
    localStorage.removeItem('kc_user')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    dispatch(resetCart())
    window.location.href = '/'
  }

  return (
    <>
      <style>{SIDEBAR_CSS}</style>
      <aside className="adm-aside" style={{
        width:240, minHeight:'100vh', background:INK,
        display:'flex', flexDirection:'column',
        position:'fixed', left:0, top:0, zIndex:30,
        borderRight:`1px solid ${RULE}`,
      }}>

        {/* Brand */}
        <div style={{ padding:'24px 20px 20px', borderBottom:`1px solid ${RULE}` }}>
          <Link href="/admin/products" style={{ textDecoration:'none' }}>
            <p style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:18,
              fontWeight:700, color:WHT, margin:0, lineHeight:1.2 }}>
              Kurti Cove
            </p>
          </Link>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:500,
            letterSpacing:'0.16em', textTransform:'uppercase', color:MUTE,
            marginTop:4, marginBottom:0 }}>
            Admin Panel
          </p>
        </div>

        {/* User */}
        {adminUser && (
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${RULE}`,
            display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:'50%',
              background:'rgba(255,255,255,0.10)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'Poppins,sans-serif', fontSize:14, fontWeight:600, color:WHT,
              flexShrink:0 }}>
              {adminUser.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:500,
                color:WHT, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {adminUser.name}
              </p>
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE,
                margin:0, textTransform:'capitalize' }}>
                {adminUser.role}
              </p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 0', overflowY:'auto' }}>
          {NAV.map(({ label, href, Icon }) => {
            const active = pathname.startsWith(href)
            const isOrders = href === '/admin/orders'
            return (
              <div key={href} style={{ position:'relative' }}>
                <Link href={href} className={`adm-nav-link${active?' active':''}`}>
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink:0 }} />
                  {label}
                  {isOrders && pendingCount > 0 && (
                    <span style={{
                      marginLeft:'auto', minWidth:18, height:18,
                      background:'#f59e0b', color:'#fff',
                      borderRadius:9, display:'inline-flex',
                      alignItems:'center', justifyContent:'center',
                      fontSize:10, fontWeight:700, padding:'0 5px',
                      flexShrink:0,
                    }}>
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'12px 0', borderTop:`1px solid ${RULE}` }}>
          <Link href="/" className="adm-nav-link">
            <Home size={16} strokeWidth={1.8} style={{ flexShrink:0 }} />
            View Store
          </Link>
          <button onClick={handleLogout} style={{
            display:'flex', alignItems:'center', gap:10,
            width:'100%', padding:'10px 14px',
            fontFamily:'Poppins,sans-serif', fontSize:13,
            color:'#ef4444', background:'none', border:'none', cursor:'pointer',
            transition:'color 0.15s, background 0.15s', borderRadius:0,
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogOut size={16} strokeWidth={1.8} style={{ flexShrink:0 }} />
            Logout
          </button>
        </div>

      </aside>
    </>
  )
}
