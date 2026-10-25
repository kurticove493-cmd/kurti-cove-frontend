'use client'
/**
 * UpiAlertProvider.jsx
 *
 * Wraps the admin panel. Renders:
 *  - Sound-enable button (top-right of admin)
 *  - Toast-style alert popup for new UPI orders
 *  - Exports context so AdminSidebar can read pendingCount
 */

import { createContext, useContext, useState } from 'react'
import { useUpiAlerts } from '../../hooks/useUpiAlerts'
import { Bell, BellOff, Volume2, VolumeX, X, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const UpiAlertCtx = createContext({ pendingCount: 0 })
export const useUpiAlertCtx = () => useContext(UpiAlertCtx)

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

/* ── Small volume slider ── */
function VolumeSlider({ volume, setVolume }) {
  return (
    <input
      type="range" min={0} max={1} step={0.05}
      value={volume}
      onChange={e => setVolume(Number(e.target.value))}
      style={{ width: 80, accentColor: INK, cursor: 'pointer' }}
      aria-label="Alert volume"
    />
  )
}

/* ── Single alert card ── */
function AlertCard({ alert, onAck }) {
  const age = Math.round((Date.now() - new Date(alert.createdAt).getTime()) / 60000)
  return (
    <div style={{
      background: WHT, border: `1px solid #fde68a`,
      borderLeft: `4px solid #f59e0b`,
      padding: '12px 14px', marginBottom: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      fontFamily: 'Poppins,sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 700, color: '#92400e' }}>
            🔔 New UPI Order
          </p>
          <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: INK }}>
            ₹{alert.amount?.toLocaleString()} · {(alert.method || 'UPI').toUpperCase()}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: MUTE }}>
            {alert.itemCount} item(s) · {age < 1 ? 'just now' : `${age}m ago`}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 10, color: MUTE, fontFamily: 'monospace' }}>
            #{String(alert.orderId).slice(-8).toUpperCase()}
          </p>
        </div>
        <button
          onClick={() => onAck(alert.orderId)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTE, padding: 2, flexShrink: 0 }}
          aria-label="Dismiss alert"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <Link href="/admin/orders" onClick={() => onAck(alert.orderId)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '5px 10px', background: INK, color: WHT,
          textDecoration: 'none', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          <ExternalLink size={10} strokeWidth={2.5} /> View Orders
        </Link>
        <button onClick={() => onAck(alert.orderId)} style={{
          padding: '5px 10px', background: 'none', border: `1px solid ${RULE}`,
          cursor: 'pointer', fontSize: 11, color: INK, fontWeight: 500,
        }}>
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default function UpiAlertProvider({ children }) {
  const {
    alerts, pendingCount,
    soundEnabled, soundBlocked,
    volume, setVolume,
    enableSound, testSound,
    acknowledgeAlert,
    requestNotificationPermission,
  } = useUpiAlerts()

  const [showSoundPanel, setShowSoundPanel] = useState(false)

  // Only show unacknowledged alerts in the popup stack (max 3 at a time)
  const visibleAlerts = alerts.filter(a => !a.acked).slice(0, 3)

  return (
    <UpiAlertCtx.Provider value={{ pendingCount }}>
      {children}

      {/* ── Sound control bar (fixed top-right of admin area) ── */}
      <div style={{
        position: 'fixed', top: 12, right: 16, zIndex: 200,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Pending badge */}
        {pendingCount > 0 && (
          <Link href="/admin/orders" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', background: '#f59e0b', color: WHT,
            textDecoration: 'none', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            animation: 'kc-pulse 2s infinite',
          }}>
            {pendingCount} UPI pending
          </Link>
        )}

        {/* Sound toggle button */}
        <button
          onClick={() => {
            if (!soundEnabled) {
              enableSound()
              requestNotificationPermission()
            }
            setShowSoundPanel(v => !v)
          }}
          title={soundEnabled ? 'Sound alerts ON — click to adjust' : 'Click to enable sound alerts'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', border: `1px solid ${soundEnabled ? INK : RULE}`,
            background: soundEnabled ? INK : WHT,
            color: soundEnabled ? WHT : INK,
            cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}
        >
          {soundEnabled
            ? <><Volume2 size={12} strokeWidth={2} /> Sound ON</>
            : <><VolumeX size={12} strokeWidth={2} /> Enable Sound</>
          }
        </button>

        {/* Sound settings panel */}
        {showSoundPanel && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            background: WHT, border: `1px solid ${RULE}`,
            padding: '14px 16px', minWidth: 220,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            fontFamily: 'Poppins,sans-serif',
          }}>
            {soundBlocked && (
              <p style={{ margin: '0 0 10px', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                ⚠ Audio blocked by browser. Click "Enable Sound" again.
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: MUTE, flexShrink: 0 }}>Volume</span>
              <VolumeSlider volume={volume} setVolume={setVolume} />
              <span style={{ fontSize: 11, color: MUTE, minWidth: 28 }}>{Math.round(volume * 100)}%</span>
            </div>
            <button onClick={testSound} style={{
              width: '100%', padding: '8px 0', background: 'none',
              border: `1px solid ${RULE}`, cursor: 'pointer',
              fontSize: 11, fontWeight: 600, color: INK,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              🔔 Test Sound
            </button>
            <p style={{ margin: '10px 0 0', fontSize: 10, color: MUTE, lineHeight: 1.5 }}>
              Sound requires one browser interaction. Works in foreground only unless browser notifications are allowed.
            </p>
          </div>
        )}
      </div>

      {/* ── Alert popup stack (bottom-right) ── */}
      {visibleAlerts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 300,
          width: 300, maxWidth: 'calc(100vw - 32px)',
        }}>
          {visibleAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onAck={acknowledgeAlert} />
          ))}
          {alerts.filter(a => !a.acked).length > 3 && (
            <p style={{ textAlign: 'center', fontSize: 11, color: MUTE, margin: '4px 0 0' }}>
              +{alerts.filter(a => !a.acked).length - 3} more — <Link href="/admin/orders" style={{ color: INK }}>view all</Link>
            </p>
          )}
        </div>
      )}

      {/* ── Pulse animation ── */}
      <style>{`
        @keyframes kc-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.7; }
        }
      `}</style>
    </UpiAlertCtx.Provider>
  )
}
