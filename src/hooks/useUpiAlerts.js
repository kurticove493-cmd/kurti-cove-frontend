'use client'
/**
 * useUpiAlerts.js
 *
 * Connects to the backend SSE stream (/api/order/admin/sse) and handles:
 *  - Real-time new_upi_order events
 *  - Deduplication by orderId
 *  - Web Audio API sound alerts (requires prior user gesture via enableSound())
 *  - Repeated alert every 90 s while order is unacknowledged
 *  - Browser Notification API fallback when tab is hidden
 *  - Missed-event recovery by polling pending orders on connect/reconnect
 *
 * Usage:
 *   const { alerts, pendingCount, soundEnabled, enableSound,
 *           volume, setVolume, testSound, acknowledgeAlert } = useUpiAlerts()
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'
// Strip trailing /api/ to get bare origin for SSE URL construction
const API_ORIGIN = BASE.replace(/\/api\/?$/, '')

const REPEAT_INTERVAL_MS = 90_000   // re-alert every 90 s if unacknowledged
const RECONNECT_DELAY_MS = 5_000    // wait before SSE reconnect
const MAX_ALERTS         = 50       // cap stored alerts to avoid memory growth

// ── Tiny Web Audio beep generator (no file needed) ───────────────────────────
function createBeep(audioCtx, volume = 0.6) {
  return () => {
    try {
      const gain = audioCtx.createGain()
      gain.gain.setValueAtTime(0, audioCtx.currentTime)
      gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6)
      gain.connect(audioCtx.destination)

      // Two-tone chime: 880 Hz then 1100 Hz
      ;[880, 1100].forEach((freq, i) => {
        const osc = audioCtx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.18)
        osc.connect(gain)
        osc.start(audioCtx.currentTime + i * 0.18)
        osc.stop(audioCtx.currentTime + i * 0.18 + 0.25)
      })
    } catch (err) {
      console.warn('Audio beep failed:', err.message)
    }
  }
}

export function useUpiAlerts() {
  const [alerts,       setAlerts]       = useState([])   // { id, orderId, amount, method, itemCount, createdAt, acked }
  const [pendingCount, setPendingCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [soundBlocked, setSoundBlocked] = useState(false)
  const [volume,       setVolumeState]  = useState(0.7)

  const audioCtxRef   = useRef(null)
  const beepRef       = useRef(null)
  const volumeRef     = useRef(0.7)
  const seenIds       = useRef(new Set())          // dedup across reconnects
  const repeatTimers  = useRef(new Map())          // orderId → intervalId
  const esRef         = useRef(null)               // EventSource
  const reconnectRef  = useRef(null)

  // ── Fetch pending UPI orders from backend (recovery on connect) ────────────
  const fetchPendingCount = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kc_token') : null
      if (!token) return
      const res  = await fetch(`${BASE}order/admin/all?limit=50&page=1`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      const data = await res.json()
      if (!data.success) return
      const pending = (data.data || []).filter(o =>
        ['upi','phonepe','googlepay'].includes(o.paymentMethod) &&
        ['pending','pending_verification','awaiting_verification'].includes(o.paymentStatus)
      )
      setPendingCount(pending.length)

      // Synthesize alert entries for any pending order not already seen
      pending.forEach(order => {
        if (!seenIds.current.has(order._id)) {
          addAlert({
            orderId:   order._id,
            amount:    order.totalAmount,
            method:    order.paymentMethod,
            itemCount: order.items?.length ?? 0,
            createdAt: order.createdAt,
          }, false /* don't play sound for recovered orders */)
        }
      })
    } catch { /* silent — network may be unavailable */ }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add a new alert entry ──────────────────────────────────────────────────
  const addAlert = useCallback((payload, playSound = true) => {
    const { orderId } = payload
    if (seenIds.current.has(orderId)) return   // deduplicate
    seenIds.current.add(orderId)

    const alert = { id: `${orderId}-${Date.now()}`, ...payload, acked: false }

    setAlerts(prev => [alert, ...prev].slice(0, MAX_ALERTS))
    setPendingCount(c => c + 1)

    if (playSound) {
      playBeep()
      scheduleRepeat(orderId)
    }

    // Browser Notification when tab is hidden
    if (typeof document !== 'undefined' && document.hidden) {
      sendBrowserNotification(payload)
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Play beep ──────────────────────────────────────────────────────────────
  const playBeep = useCallback(() => {
    if (audioCtxRef.current && beepRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().then(() => beepRef.current?.())
      } else {
        beepRef.current()
      }
    }
  }, [])

  // ── Repeat alert every 90 s while unacknowledged ──────────────────────────
  const scheduleRepeat = useCallback((orderId) => {
    if (repeatTimers.current.has(orderId)) return
    const id = setInterval(() => {
      // Check if still unacknowledged
      setAlerts(prev => {
        const still = prev.find(a => a.orderId === orderId && !a.acked)
        if (still) playBeep()
        else {
          clearInterval(id)
          repeatTimers.current.delete(orderId)
        }
        return prev
      })
    }, REPEAT_INTERVAL_MS)
    repeatTimers.current.set(orderId, id)
  }, [playBeep])

  // ── Acknowledge an alert (stops repeat; does NOT confirm payment) ──────────
  const acknowledgeAlert = useCallback((orderId) => {
    setAlerts(prev => prev.map(a => a.orderId === orderId ? { ...a, acked: true } : a))
    const id = repeatTimers.current.get(orderId)
    if (id) { clearInterval(id); repeatTimers.current.delete(orderId) }
  }, [])

  // ── Volume control ─────────────────────────────────────────────────────────
  const setVolume = useCallback((v) => {
    volumeRef.current = v
    setVolumeState(v)
    // Recreate beep with new volume
    if (audioCtxRef.current) {
      beepRef.current = createBeep(audioCtxRef.current, v)
    }
  }, [])

  // ── Enable sound (must be called from a user gesture) ─────────────────────
  const enableSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      beepRef.current = createBeep(audioCtxRef.current, volumeRef.current)
      setSoundEnabled(true)
      setSoundBlocked(false)
      // Play a test beep immediately so admin knows it works
      setTimeout(() => beepRef.current?.(), 100)
    } catch {
      setSoundBlocked(true)
    }
  }, [])

  // ── Test sound ─────────────────────────────────────────────────────────────
  const testSound = useCallback(() => {
    if (!soundEnabled) { enableSound(); return }
    playBeep()
  }, [soundEnabled, enableSound, playBeep])

  // ── Browser Notification ───────────────────────────────────────────────────
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const sendBrowserNotification = (payload) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    try {
      new Notification('🔔 New UPI Order — Kurti Cove', {
        body: `₹${payload.amount?.toLocaleString()} via ${(payload.method || 'UPI').toUpperCase()} · ${payload.itemCount} item(s)`,
        icon: '/logo.png',
        tag:  `upi-order-${payload.orderId}`,   // deduplicate in OS notification center
      })
    } catch { /* permission may have been revoked */ }
  }

  // ── SSE connection ─────────────────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('kc_token')
    if (!token) return

    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    const url = `${API_ORIGIN}/api/order/admin/sse?token=${encodeURIComponent(token)}`
    const es   = new EventSource(url)
    esRef.current = es

    es.addEventListener('connected', () => {
      console.log('📡 SSE connected to admin alert stream')
      // Recover any pending orders missed while disconnected
      fetchPendingCount()
    })

    es.addEventListener('new_upi_order', (e) => {
      try {
        const payload = JSON.parse(e.data)
        addAlert(payload, true)
      } catch { /* malformed event */ }
    })

    es.onerror = () => {
      es.close()
      esRef.current = null
      // Reconnect after delay — handles Render spin-down reconnects
      clearTimeout(reconnectRef.current)
      reconnectRef.current = setTimeout(connectSSE, RECONNECT_DELAY_MS)
    }
  }, [addAlert, fetchPendingCount])

  // ── Mount / unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    connectSSE()
    return () => {
      esRef.current?.close()
      clearTimeout(reconnectRef.current)
      repeatTimers.current.forEach(id => clearInterval(id))
    }
  }, [connectSSE])

  return {
    alerts,
    pendingCount,
    soundEnabled,
    soundBlocked,
    volume,
    setVolume,
    enableSound,
    testSound,
    acknowledgeAlert,
    requestNotificationPermission,
  }
}
