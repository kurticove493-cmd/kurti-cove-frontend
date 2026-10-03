'use client'
import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import API from '../../utils/Helper'

const AdminUserContext = createContext(null)
export const useAdminUser = () => useContext(AdminUserContext)

export default function AdminGuard({ children }) {
  const [adminUser, setAdminUser] = useState(null)
  const [checking, setChecking]   = useState(true)
  const router = useRouter()

  useEffect(() => {
    API.get('/user/get').then(res => {
      if (res.data.success) {
        const u = res.data.data
        if (u.role === 'admin' || u.role === 'superAdmin') {
          setAdminUser(u)
        } else {
          router.replace('/login?error=unauthorized')
        }
      } else {
        router.replace('/login?error=unauthorized')
      }
    }).catch(() => router.replace('/login?error=unauthorized'))
      .finally(() => setChecking(false))
  }, [router])

  if (checking) return (
    <div style={{ minHeight:'100vh', background:'#141414', display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:28, height:28, borderRadius:'50%',
          border:'2.5px solid #fff', borderTopColor:'transparent',
          animation:'spin .7s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12,
          color:'#888', letterSpacing:'0.08em' }}>
          Verifying access…
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!adminUser) return null

  return (
    <AdminUserContext.Provider value={adminUser}>
      {children}
    </AdminUserContext.Provider>
  )
}
