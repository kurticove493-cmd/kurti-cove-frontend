'use client'
import { useEffect, useState } from 'react'
import { staticImg } from '../../lib/staticImg.js'

/*
  PRELOADER — dark minimal theme (matches new project design language)
  ─────────────────────────────────────────────────────────────
  • Pure white background — clean, no pastel
  • Logo image centred (same as header/login)
  • Thin near-black spinner ring below the logo
  • Muted uppercase tagline
  • Logo fades in, spinner appears after logo settles
  ─────────────────────────────────────────────────────────────
*/

if (typeof window !== 'undefined' && window.__KC_DATA_READY === undefined) {
  window.__KC_DATA_READY = false
}

export function markDataReady() {
  if (typeof window !== 'undefined') window.__KC_DATA_READY = true
}

export default function Preloader() {
  const [visible,   setVisible]   = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [logoIn,    setLogoIn]    = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('kc_preloader_shown')) return
    sessionStorage.setItem('kc_preloader_shown', '1')
    setVisible(true)
    /* Logo animates in after a short frame delay */
    requestAnimationFrame(() => setTimeout(() => setLogoIn(true), 60))

    const startTime  = Date.now()
    const MIN_MS     = 1000
    const HARD_LIMIT = 7000
    let   dismissed  = false

    const dismiss = () => {
      if (dismissed) return
      dismissed = true
      const remaining = Math.max(0, MIN_MS - (Date.now() - startTime))
      setTimeout(() => {
        setFadingOut(true)
        setTimeout(() => setVisible(false), 550)
      }, remaining)
    }

    const hardTimer = setTimeout(dismiss, HARD_LIMIT)

    const check = () => {
      if (document.readyState === 'complete' && window.__KC_DATA_READY) {
        clearTimeout(hardTimer)
        dismiss()
      }
    }

    const pollTimer = setInterval(check, 150)
    window.addEventListener('load', check, { once: false })

    return () => {
      clearInterval(pollTimer)
      clearTimeout(hardTimer)
      window.removeEventListener('load', check)
    }
  }, [])

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes kc-pre-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes kc-pre-logo-in {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes kc-pre-tag-in {
          from { opacity:0; }
          to   { opacity:1; }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9999,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            0,
          background:     '#ffffff',
          transition:     'opacity 0.55s ease',
          opacity:        fadingOut ? 0 : 1,
          pointerEvents:  fadingOut ? 'none' : 'auto',
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={staticImg('/logo.png')}
          alt="Kurti Cove"
          draggable={false}
          style={{
            height:    52,
            width:     'auto',
            objectFit: 'contain',
            marginBottom: 32,
            animation: logoIn
              ? 'kc-pre-logo-in 0.55s cubic-bezier(0.22,1,0.36,1) both'
              : 'none',
            opacity: logoIn ? undefined : 0,
          }}
        />

        {/* Thin spinner — near-black */}
        <div style={{
          width:          36,
          height:         36,
          borderRadius:   '50%',
          border:         '1.8px solid rgba(20,20,20,0.10)',
          borderTopColor: '#141414',
          animation:      'kc-pre-spin 0.85s linear infinite',
          marginBottom:   24,
        }} />

        {/* Tagline */}
        <p style={{
          fontFamily:    'Poppins, sans-serif',
          fontSize:      '0.62rem',
          color:         '#aaa',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          margin:        0,
          animation:     logoIn
            ? 'kc-pre-tag-in 0.6s ease 0.4s both'
            : 'none',
          opacity:       logoIn ? undefined : 0,
        }}>
          Ethnic Wear for Every Woman
        </p>
      </div>
    </>
  )
}
