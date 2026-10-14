'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import Link from 'next/link'
import API from '../../utils/Helper'
import { syncAndLoadCart } from '../../utils/cartHelper'
import toast from 'react-hot-toast'

/* ── Same minimal theme as login/register ── */
const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

function VerifyOtpContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const dispatch     = useDispatch()
  const email        = searchParams.get('email') || ''

  const [otp,       setOtp]       = useState(['', '', '', '', '', ''])
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const newOtp = [...otp]
    newOtp[idx] = val
    setOtp(newOtp)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasted.split('').forEach((d, i) => { newOtp[i] = d })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) { toast.error('Please enter the complete 6-digit OTP.'); return }
    setLoading(true)
    try {
      const res = await API.post('/user/verify-otp', { email, otp: Number(otpString) })
      if (res.data.success) {
        const { token, user } = res.data.data
        localStorage.setItem('kc_token', token)
        localStorage.setItem('kc_user', JSON.stringify(user))
        document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 3600}`
        window.dispatchEvent(new Event('kc-auth-changed'))
        await syncAndLoadCart(dispatch)
        toast.success('Email verified! Welcome to Kurti Cove.')
        router.push('/')
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      await API.post('/user/reset-otp', { email })
      toast.success('New OTP sent to your email.')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  const filled = otp.join('').length

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#fafafa', padding: '48px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Kurti Cove"
              style={{ height: 42, objectFit: 'contain', margin: '0 auto 20px' }} />
          </Link>
          <h1 style={{
            fontFamily: '"Playfair Display",Georgia,serif', fontSize: 26,
            fontWeight: 700, color: INK, margin: '0 0 6px',
          }}>
            Verify Your Email
          </h1>
          <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 12, color: MUTE, margin: 0 }}>
            Enter the 6-digit code sent to
          </p>
          <p style={{
            fontFamily: 'Poppins,sans-serif', fontSize: 13,
            fontWeight: 600, color: INK, marginTop: 4,
          }}>
            {email}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: WHT, border: `1px solid ${RULE}`, padding: '32px 32px 28px' }}>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* OTP inputs */}
            <div>
              <label style={{
                display: 'block', fontFamily: 'Poppins,sans-serif', fontSize: 11,
                fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: MUTE, marginBottom: 14, textAlign: 'center',
              }}>
                One-Time Password
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}
                onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    style={{
                      width: 44, height: 52,
                      textAlign: 'center',
                      fontFamily: 'Poppins,sans-serif',
                      fontSize: 20, fontWeight: 700,
                      color: INK,
                      border: `1px solid ${digit ? INK : RULE}`,
                      background: WHT,
                      outline: 'none',
                      borderRadius: 0,
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = INK}
                    onBlur={e  => e.target.style.borderColor = digit ? INK : RULE}
                  />
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || filled !== 6}
              style={{
                width: '100%', padding: '13px 0',
                background: (loading || filled !== 6) ? '#ccc' : INK,
                color: WHT, border: 'none',
                cursor: (loading || filled !== 6) ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins,sans-serif', fontSize: 12,
                fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                transition: 'background 0.18s',
              }}
            >
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: RULE }} />
            <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 11, color: MUTE }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: RULE }} />
          </div>

          {/* Resend */}
          <div style={{ textAlign: 'center' }}>
            {countdown > 0 ? (
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 13, color: MUTE, margin: 0 }}>
                Resend code in{' '}
                <span style={{ color: INK, fontWeight: 600 }}>{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: 'none', border: 'none', cursor: resending ? 'not-allowed' : 'pointer',
                  fontFamily: 'Poppins,sans-serif', fontSize: 13,
                  color: INK, fontWeight: 600, textDecoration: 'underline',
                }}
              >
                {resending ? 'Sending…' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', fontFamily: 'Poppins,sans-serif',
          fontSize: 11, color: MUTE, marginTop: 16,
        }}>
          OTP is valid for 10 minutes · Check spam folder if not received
        </p>

      </div>
    </main>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: '#fafafa',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `2.5px solid ${INK}`, borderTopColor: 'transparent',
          animation: 'spin .7s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
