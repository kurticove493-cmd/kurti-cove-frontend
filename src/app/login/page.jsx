'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import API from '../../utils/Helper'
import { syncAndLoadCart } from '../../utils/cartHelper'
import toast from 'react-hot-toast'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

/* ── New minimal theme ── */
const INK    = '#141414'
const MUTE   = '#888'
const RULE   = '#e8e8e8'
const PLUM   = '#7B1153'
const ROSE   = '#E05C88'
const WHT    = '#ffffff'

function InputField({ label, type: initialType = 'text', name, value, onChange, placeholder, required, autoComplete }) {
  const [show, setShow] = useState(false)
  const isPwd  = initialType === 'password'
  const fType  = isPwd ? (show ? 'text' : 'password') : initialType

  return (
    <div>
      <label style={{ display:'block', fontFamily:'Poppins,sans-serif', fontSize:11,
        fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:MUTE, marginBottom:6 }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <input type={fType} name={name} value={value} onChange={onChange}
          placeholder={placeholder} required={required} autoComplete={autoComplete}
          style={{
            width:'100%', padding: isPwd ? '11px 42px 11px 14px' : '11px 14px',
            fontFamily:'Poppins,sans-serif', fontSize:13, color:INK,
            border:`1px solid ${RULE}`, background:WHT,
            outline:'none', borderRadius:0, boxSizing:'border-box',
          }}
          onFocus={e => e.target.style.borderColor = INK}
          onBlur={e  => e.target.style.borderColor = RULE}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(v=>!v)}
            style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', color: show ? INK : MUTE,
              display:'flex', padding:0 }}>
            {show ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
          </button>
        )}
      </div>
    </div>
  )
}

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const dispatch     = useDispatch()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const errorParam = searchParams.get('error')

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields.'); return }
    setLoading(true)
    try {
      const res = await API.post('/user/login', form)
      if (res.data.success) {
        const { token, user } = res.data.data
        localStorage.setItem('kc_token', token)
        localStorage.setItem('kc_user', JSON.stringify(user))
        document.cookie = `auth_token=${token}; path=/; max-age=${30*24*3600}`
        window.dispatchEvent(new Event('kc-auth-changed'))
        await syncAndLoadCart(dispatch)
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
        router.push(searchParams.get('redirect') || '/')
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#fafafa', padding:'48px 16px' }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Kurti Cove" style={{ height:42, objectFit:'contain', margin:'0 auto 20px' }} />
          </Link>
          <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:26, fontWeight:700,
            color:INK, margin:'0 0 6px' }}>
            Welcome Back
          </h1>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div style={{ background:WHT, border:`1px solid ${RULE}`, padding:'32px 32px 28px' }}>

          {errorParam === 'unauthorized' && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:8,
              background:'#fef2f2', border:'1px solid #fecaca',
              padding:'10px 14px', marginBottom:20 }}>
              <AlertCircle size={14} color="#dc2626" style={{ flexShrink:0, marginTop:1 }} />
              <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'#dc2626', margin:0 }}>
                Admin access required. Please use an admin account.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <InputField label="Email" type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="your@email.com"
              autoComplete="email" required />
            <InputField label="Password" type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="Enter your password"
              autoComplete="current-password" required />

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px 0', background: loading ? '#444' : INK,
              color:WHT, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
              letterSpacing:'0.14em', textTransform:'uppercase',
              transition:'background 0.18s', marginTop:4,
            }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:RULE }} />
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>or</span>
            <div style={{ flex:1, height:1, background:RULE }} />
          </div>

          <p style={{ textAlign:'center', fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, margin:0 }}>
            New here?{' '}
            <Link href="/register" style={{ color:INK, fontWeight:600, textDecoration:'underline' }}>
              Create account
            </Link>
          </p>
        </div>

        <p style={{ textAlign:'center', fontFamily:'Poppins,sans-serif', fontSize:11,
          color:MUTE, marginTop:16 }}>
          Trusted by 10,000+ women across India
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa' }}>
        <div style={{ width:28, height:28, borderRadius:'50%', border:`2.5px solid ${INK}`, borderTopColor:'transparent', animation:'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
