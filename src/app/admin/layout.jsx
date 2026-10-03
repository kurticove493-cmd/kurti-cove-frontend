'use client'
import AdminGuard from '../../components/admin/AdminGuard'
import AdminSidebar from '../../components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <style>{`
        .kc-hdr    { display:none !important; }
        .kc-spacer { display:none !important; }
        footer     { display:none !important; }
        /* Admin scrollbar */
        .adm-main::-webkit-scrollbar { width:6px; }
        .adm-main::-webkit-scrollbar-track { background:#1a1a1a; }
        .adm-main::-webkit-scrollbar-thumb { background:#333; border-radius:3px; }
      `}</style>

      <div style={{ display:'flex', minHeight:'100vh', background:'#0f0f0f' }}>
        <AdminSidebar />
        <main className="adm-main" style={{
          flex:1, marginLeft:240, minHeight:'100vh',
          background:'#f7f7f7', overflowY:'auto',
        }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 28px 56px' }}>
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
