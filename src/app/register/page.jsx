'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

function InputField({ label, type: initialType = 'text', name, value, onChange, placeholder, required, autoComplete }) {
  const [show, setShow] = useState(false)
  const isPwd = initialType === 'password'
  const fType = isPwd ? (show ? 'text' : 'password') : initialType

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

export default function RegisterPage() {
  const router = useRouter()
  const [form,    setForm]    = useState({ name:'', email:'', password:'', mobile:'' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Name, email and password are required.'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const res = await API.post('/user/create', form)
      if (res.data.success) {
        toast.success('Account created! Check your email for OTP.')
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed.')
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
            Create Account
          </h1>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE }}>
            Join Kurti Cove and start shopping
          </p>
        </div>

        {/* Card */}
        <div style={{ background:WHT, border:`1px solid ${RULE}`, padding:'32px 32px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <InputField label="Full Name" name="name" value={form.name}
              onChange={handleChange} placeholder="Enter your full name"
              autoComplete="name" required />
            <InputField label="Email" type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="your@email.com"
              autoComplete="email" required />
            <InputField label="Mobile (optional)" type="tel" name="mobile" value={form.mobile}
              onChange={handleChange} placeholder="10-digit mobile number"
              autoComplete="tel" />
            <InputField label="Password" type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="Min 6 characters"
              autoComplete="new-password" required />

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px 0', background: loading ? '#444' : INK,
              color:WHT, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600,
              letterSpacing:'0.14em', textTransform:'uppercase',
              transition:'background 0.18s', marginTop:4,
            }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:RULE }} />
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE }}>or</span>
            <div style={{ flex:1, height:1, background:RULE }} />
          </div>

          <p style={{ textAlign:'center', fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, margin:0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color:INK, fontWeight:600, textDecoration:'underline' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign:'center', fontFamily:'Poppins,sans-serif', fontSize:11,
          color:MUTE, marginTop:16 }}>
          Join 10,000+ women celebrating Indian ethnic wear
        </p>
      </div>
    </main>
  )
}
