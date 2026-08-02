'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Data ───────────────────────────────────────────────────────────────────
const names = ['John K.', 'Mary W.', 'Ahmed S.', 'Fatma M.', 'Peter O.', 'Sarah K.', 'David M.', 'Amina H.', 'Joseph N.', 'Grace L.']
const phones = ['+254712345678', '+254722987654', '+254733456789', '+254744567890', '+254755678901', '+254766789012']
const amounts = ['2,450', '8,720', '15,300', '4,890', '22,100', '9,650', '31,200', '5,870', '68,500', '125,000', '89,300', '156,700', '243,000', '78,900', '198,500', '312,000', '445,000', '567,800', '78,200', '156,000']
const emojis = ['👨', '👩', '🧔', '🧕', '🕶️', '💄', '🎩', '👳', '🥳', '⭐']

const ROUND_MS = 12000

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function getRoundInfo(roundIndex: number) {
  const rand = mulberry32(roundIndex)
  const isRare = rand() < 0.1
  const crashMultiplier = isRare
    ? parseFloat((rand() * 950 + 80).toFixed(2))
    : parseFloat((rand() * 33 + 1.5).toFixed(2))
  const commonCrashMs = Math.floor(rand() * ROUND_MS) + Math.floor(0.6 * ROUND_MS)
  const crashMs = isRare
    ? Math.floor(rand() * ROUND_MS * 1.03) + 2300
    : commonCrashMs
  return { crashMultiplier, crashMs, isRare }
}

function getCurrentRoundState() {
  const now = Date.now()
  const currentRoundIndex = Math.floor(now / ROUND_MS)
  const roundStart = currentRoundIndex * ROUND_MS
  const elapsed = now - roundStart
  const info = getRoundInfo(currentRoundIndex)
  return { currentRoundIndex, roundStart, elapsed, ...info }
}

function computeLiveMultiplier(elapsed: number, crashMs: number, crashMultiplier: number) {
  if (elapsed >= crashMs) return crashMultiplier
  const progress = elapsed / crashMs
  return 1.01 + (crashMultiplier - 1.01) * Math.pow(progress, 0.82)
}

function generateSignals(count: number, currentRoundIndex: number) {
  const signals = []
  for (let i = count - 1; i >= 0; i--) {
    const idx = currentRoundIndex - i - 1
    if (idx < 0) continue
    const info = getRoundInfo(idx)
    const winRand = mulberry32(idx + 999999)()
    const status: 'live' | 'crashed' = winRand > 0.048 ? 'live' : 'crashed'
    const time = new Date(idx * ROUND_MS + info.crashMs).toLocaleTimeString('en-US', { hour12: false })
    signals.push({ multiplier: info.crashMultiplier.toFixed(2) + 'x', time, status })
  }
  return signals
}

function generateRecentWins(seedBase: number, count: number) {
  const wins = []
  const rand = mulberry32(seedBase)
  for (let i = 0; i < count; i++) {
    wins.push({
      name: names[Math.floor(rand() * names.length)],
      phone: phones[Math.floor(rand() * phones.length)],
      amount: amounts[Math.floor(rand() * amounts.length)],
      emoji: emojis[Math.floor(rand() * emojis.length)],
    })
  }
  return wins
}

function maskPhone(phone: string) {
  if (phone.length < 6) return phone
  return `${phone.slice(0, 7)}***${phone.slice(-3)}`
}

// ─── SVG Graph Component ────────────────────────────────────────────────────
interface GraphPoint { x: number; y: number }

function MultiplierGraph({
  progress,
  crashed,
  crashMultiplier,
  liveMultiplier,
}: {
  progress: number
  crashed: boolean
  crashMultiplier: number
  liveMultiplier: number
}) {
  const W = 560
  const H = 280
  const PAD = { top: 28, right: 44, bottom: 44, left: 54 }
  const gW = W - PAD.left - PAD.right
  const gH = H - PAD.top - PAD.bottom

  // The curve goes from bottom-left (1x) upward to the right as time passes.
  // X axis = time (0 → 1 across full width)
  // Y axis = multiplier height (bottom = 1x, top = crashMultiplier)
  const STEPS = 120
  const clampedP = Math.min(Math.max(progress, 0), 1)

  // Build ALL points for the full curve shape (used for ghost / undrawn part)
  const fullPoints: GraphPoint[] = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const mul = 1.01 + (crashMultiplier - 1.01) * Math.pow(t, 0.75)
    const x = PAD.left + t * gW
    const normY = (mul - 1.01) / Math.max(crashMultiplier - 1.01, 0.01)
    const y = PAD.top + gH - normY * gH
    fullPoints.push({ x, y })
  }

  // Live points — only up to current progress
  const liveCount = Math.max(2, Math.round(clampedP * STEPS) + 1)
  const points = fullPoints.slice(0, liveCount)

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD =
    pathD +
    ` L${points[points.length - 1].x.toFixed(1)},${(PAD.top + gH).toFixed(1)}` +
    ` L${PAD.left},${(PAD.top + gH).toFixed(1)} Z`

  // Rocket position = very last live point
  const tip = points[points.length - 1]

  // Tangent angle from last 4 points for smooth rotation
  let angle = -50
  if (points.length >= 4) {
    const prev = points[points.length - 4]
    const dx = tip.x - prev.x
    const dy = tip.y - prev.y
    // atan2 gives angle of travel direction; subtract 90 so rocket nose leads
    angle = (Math.atan2(dy, dx) * 180) / Math.PI - 90
  }

  const color = crashed ? '#ef4444' : liveMultiplier > 100 ? '#facc15' : '#22c55e'
  const glowColor = liveMultiplier > 100 ? 'rgba(250,204,21,0.5)' : 'rgba(34,197,94,0.5)'

  // Y-axis ticks
  const yTicks = [1, Math.round(crashMultiplier * 0.33), Math.round(crashMultiplier * 0.66), Math.round(crashMultiplier)]

  // Smoke trail — 8 fading dots just behind the rocket
  const trailPoints = crashed
    ? []
    : points.slice(Math.max(0, points.length - 18), points.length - 1).filter((_, i) => i % 2 === 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="gAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="gTrailFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
        <filter id="gLineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="gRocketGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="gBoom" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="graphClip">
          <rect x={PAD.left} y={PAD.top} width={gW} height={gH + 1} />
        </clipPath>
      </defs>

      {/* ── Grid ── */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={`h${f}`} x1={PAD.left} y1={PAD.top + gH * (1 - f)}
          x2={PAD.left + gW} y2={PAD.top + gH * (1 - f)}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 7" />
      ))}
      {[0.2, 0.4, 0.6, 0.8, 1].map((f) => (
        <line key={`v${f}`} x1={PAD.left + gW * f} y1={PAD.top}
          x2={PAD.left + gW * f} y2={PAD.top + gH}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 7" />
      ))}

      {/* ── Filled area under curve ── */}
      <path d={areaD} fill="url(#gAreaFill)" clipPath="url(#graphClip)" />

      {/* ── Glowing curve line ── */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#gLineGlow)" />

      {/* ── Axes ── */}
      <line x1={PAD.left} y1={PAD.top - 4} x2={PAD.left} y2={PAD.top + gH}
        stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <line x1={PAD.left} y1={PAD.top + gH} x2={PAD.left + gW + 4} y2={PAD.top + gH}
        stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

      {/* ── Y-axis labels ── */}
      {yTicks.map((v, i) => (
        <text key={i} x={PAD.left - 10} y={PAD.top + gH - (i / (yTicks.length - 1)) * gH + 4}
          textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="10"
          fontFamily="monospace" fontWeight="700">{v}x</text>
      ))}

      {/* ── Current multiplier callout on Y axis ── */}
      {!crashed && (
        <>
          <line x1={PAD.left - 3} y1={tip.y} x2={PAD.left} y2={tip.y}
            stroke={color} strokeWidth="1.5" />
          <rect x={0} y={tip.y - 9} width={PAD.left - 4} height={18} rx="3"
            fill={color} opacity="0.15" />
          <text x={PAD.left - 6} y={tip.y + 4} textAnchor="end"
            fill={color} fontSize="9" fontFamily="monospace" fontWeight="800">
            {liveMultiplier.toFixed(2)}x
          </text>
        </>
      )}

      {/* ── Smoke trail dots behind rocket ── */}
      {trailPoints.map((p, i) => {
        const frac = (i + 1) / trailPoints.length
        return (
          <circle key={i} cx={p.x} cy={p.y}
            r={frac * 4} fill={color} opacity={frac * 0.45} />
        )
      })}

      {/* ── Rocket (live) or Explosion (crashed) ── */}
      {!crashed ? (
        <g transform={`translate(${tip.x}, ${tip.y}) rotate(${angle.toFixed(1)})`}
          filter="url(#gRocketGlow)">
          {/* Ambient halo */}
          <circle cx="0" cy="0" r="20" fill={glowColor} opacity="0.12" />
          {/* Nose cone */}
          <polygon points="0,-20 -6,-7 6,-7" fill="#f1f5f9" />
          {/* Body */}
          <rect x="-6" y="-7" width="12" height="16" rx="3" fill="#e2e8f0" />
          {/* Stripe */}
          <rect x="-6" y="-1" width="12" height="3" rx="1" fill={color} opacity="0.85" />
          {/* Porthole */}
          <circle cx="0" cy="-3" r="3.5" fill="#0f172a" />
          <circle cx="0" cy="-3" r="2" fill={color} opacity="0.9" />
          {/* Left fin */}
          <polygon points="-6,9 -13,19 -6,14" fill="#94a3b8" />
          {/* Right fin */}
          <polygon points="6,9 13,19 6,14" fill="#94a3b8" />
          {/* Engine nozzle */}
          <rect x="-4" y="9" width="8" height="4" rx="1" fill="#64748b" />
          {/* Flame outer */}
          <ellipse cx="0" cy="17" rx="5" ry="8" fill="#fde047" opacity="0.95">
            <animate attributeName="ry" values="7;11;6;10;7" dur="0.28s" repeatCount="indefinite" />
            <animate attributeName="rx" values="5;4;6;4;5" dur="0.18s" repeatCount="indefinite" />
          </ellipse>
          {/* Flame mid */}
          <ellipse cx="0" cy="19" rx="3.5" ry="6" fill="#f97316" opacity="0.9">
            <animate attributeName="ry" values="5;9;4;8;5" dur="0.22s" repeatCount="indefinite" />
          </ellipse>
          {/* Flame core */}
          <ellipse cx="0" cy="21" rx="2" ry="4" fill="white" opacity="0.8">
            <animate attributeName="ry" values="3;6;2;5;3" dur="0.18s" repeatCount="indefinite" />
          </ellipse>
        </g>
      ) : (
        <g transform={`translate(${tip.x}, ${tip.y})`} filter="url(#gBoom)">
          {/* Outer shockwave */}
          <circle cx="0" cy="0" r="24" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.7">
            <animate attributeName="r" values="12;36;12" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="0.7s" repeatCount="indefinite" />
          </circle>
          {/* Inner ring */}
          <circle cx="0" cy="0" r="14" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="8;24;8" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" />
          </circle>
          {/* Hot core */}
          <circle cx="0" cy="0" r="9" fill="#ef4444" opacity="0.9">
            <animate attributeName="r" values="9;14;9" dur="0.35s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.4;0.9" dur="0.35s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="5" fill="#fde047" opacity="1">
            <animate attributeName="r" values="5;8;5" dur="0.25s" repeatCount="indefinite" />
          </circle>
          {/* Sparks */}
          {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
            const r = (deg * Math.PI) / 180
            const dist = 16 + (i % 3) * 5
            return (
              <circle key={i} cx={Math.cos(r)*dist} cy={Math.sin(r)*dist} r="2.5"
                fill={i % 2 === 0 ? '#fde047' : '#ef4444'} opacity="0.9">
                <animate attributeName="opacity" values="0.9;0;0.9" dur={`${0.3+i*0.04}s`} repeatCount="indefinite" />
                <animate attributeName="r" values="2.5;1;2.5" dur={`${0.3+i*0.04}s`} repeatCount="indefinite" />
              </circle>
            )
          })}
          <text x="0" y="-32" textAnchor="middle" fontSize="24">💥</text>
        </g>
      )}
    </svg>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [liveGame, setLiveGame] = useState(1.01)
  const [graphProgress, setGraphProgress] = useState(0)
  const [signals, setSignals] = useState<Array<{ multiplier: string; time: string; status: 'live' | 'crashed' }>>([])
  const [recentWins, setRecentWins] = useState<Array<{ name: string; phone: string; amount: string; emoji: string }>>([])
  const [roundState, setRoundState] = useState({
    crashed: false,
    crashMultiplier: 2.0,
    currentRoundIndex: 0,
  })
  const [accessGranted, setAccessGranted] = useState(false)
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null)
  const [accessMessage, setAccessMessage] = useState('')
  const [accessLoading, setAccessLoading] = useState(true)

  // Check access
  useEffect(() => {
    const storedPhone = localStorage.getItem('aviator_phone')
    if (!storedPhone) {
      setAccessLoading(false)
      setAccessMessage('Buy a package to view signals')
      return
    }
    fetch(`/api/verify-access?phone=${encodeURIComponent(storedPhone)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hasAccess) {
          setAccessGranted(true)
          setAccessExpiresAt(data.expires_at)
          setAccessMessage(data.message)
        } else {
          setAccessGranted(false)
          setAccessMessage(data.message || 'Buy a package to view signals')
        }
      })
      .catch(() => {
        setAccessGranted(false)
        setAccessMessage('Could not verify access')
      })
      .finally(() => setAccessLoading(false))
  }, [])

  // Real-time loop
  useEffect(() => {
    let lastRoundIndex = -1
    let lastWinBucket = -1
    let rafId: number

    const update = () => {
      const state = getCurrentRoundState()
      const multiplier = computeLiveMultiplier(state.elapsed, state.crashMs, state.crashMultiplier)
      const prog = Math.min(state.elapsed / state.crashMs, 1)

      setLiveGame(parseFloat(multiplier.toFixed(2)))
      setGraphProgress(prog)
      setRoundState({
        crashed: state.elapsed >= state.crashMs,
        crashMultiplier: state.crashMultiplier,
        currentRoundIndex: state.currentRoundIndex,
      })

      if (state.currentRoundIndex !== lastRoundIndex) {
        lastRoundIndex = state.currentRoundIndex
        setSignals(generateSignals(10, state.currentRoundIndex))
      }

      const winBucket = Math.floor(Date.now() / 5000)
      if (winBucket !== lastWinBucket) {
        lastWinBucket = winBucket
        setRecentWins(generateRecentWins(winBucket, 12))
      }

      rafId = requestAnimationFrame(update)
    }

    update()
    return () => cancelAnimationFrame(rafId)
  }, [])

  const { crashed, crashMultiplier } = roundState
  const isMega = liveGame > 100
  const accentColor = crashed ? 'text-red-400' : isMega ? 'text-yellow-400' : 'text-[#22c55e]'
  const borderColor = crashed ? 'border-red-500/40' : isMega ? 'border-yellow-400/40' : 'border-[#22c55e]/30'

  return (
    <div className="min-h-screen bg-[#080c14] aviator-grid-bg text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              ✈️ <span className="text-[#22c55e]">AVIATOR</span> SIGNALS
            </h1>
            <p className="text-gray-400 text-sm mt-1">Real-time predictions • 95.2% accuracy</p>
          </div>
          {!accessLoading && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${accessGranted ? 'border-[#22c55e]/40 text-[#22c55e] bg-[#22c55e]/10' : 'border-red-500/40 text-red-400 bg-red-500/10'}`}>
              <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: accessGranted ? '#22c55e' : '#ef4444' }} />
              {accessGranted ? `VIP ACTIVE${accessExpiresAt ? ' · expires ' + new Date(accessExpiresAt).toLocaleTimeString() : ''}` : 'NO ACCESS'}
            </div>
          )}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left: Graph + Multiplier ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Graph card */}
            <div className={`rounded-2xl border bg-[#0d1320] overflow-hidden ${borderColor}`}>
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${crashed ? 'bg-red-400' : 'bg-[#22c55e] animate-pulse'}`} />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {crashed ? 'CRASHED' : 'LIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isMega && !crashed && (
                    <span className="text-xs font-black bg-yellow-400 text-black px-2 py-0.5 rounded-full animate-bounce">🔥 MEGA</span>
                  )}
                  <span className="text-xs text-gray-500">Round #{roundState.currentRoundIndex}</span>
                </div>
              </div>

              {/* Multiplier display */}
              <div className="text-center pt-6 pb-2">
                <div className={`text-7xl font-black tracking-tighter transition-colors duration-300 ${accentColor} ${crashed ? '' : 'multiplier-glow'}`}>
                  {liveGame.toFixed(2)}<span className="text-4xl font-bold opacity-70">x</span>
                </div>
                <p className={`text-sm font-bold mt-1 ${crashed ? 'text-red-400' : isMega ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {crashed
                    ? `💥 CRASHED AT ${crashMultiplier.toFixed(2)}x — NEXT ROUND STARTING`
                    : isMega
                      ? '💰 RARE MEGA ROUND — CASH OUT NOW!'
                      : '⏰ CASH OUT BEFORE IT CRASHES'}
                </p>
              </div>

              {/* SVG Graph */}
              <div className="px-4 pb-4 h-[260px]">
                <MultiplierGraph
                  progress={graphProgress}
                  crashed={crashed}
                  crashMultiplier={crashMultiplier}
                  liveMultiplier={liveGame}
                />
              </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Win Rate', value: '95.2%', icon: '📈', color: 'text-[#22c55e]', border: 'border-[#22c55e]/20' },
                { label: 'Signals Today', value: '247', icon: '⚡', color: 'text-yellow-400', border: 'border-yellow-400/20' },
                { label: 'Total Profit', value: '12.7M', icon: '💰', color: 'text-[#22c55e]', border: 'border-[#22c55e]/20' },
              ].map((s) => (
                <div key={s.label} className={`bg-[#0d1320] rounded-xl border ${s.border} p-4 text-center`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-medium uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Signals list ── */}
            <div className="bg-[#0d1320] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <h3 className="font-black text-sm text-white uppercase tracking-widest">🔥 Live Signals</h3>
                <span className="text-xs text-[#22c55e] font-bold">95.2% ACCURATE</span>
              </div>
              {!accessGranted ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
                  <div className="text-5xl">🔒</div>
                  <p className="text-gray-400 text-sm">Purchase a package to unlock live signals</p>
                  <Link href="/packages">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl text-sm font-black hover:from-red-500 hover:to-red-600 transition-all hover:scale-105 inline-block border border-red-500/30">
                      Buy Package — from KSH 100
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {signals.map((signal, i) => {
                    const val = parseFloat(signal.multiplier)
                    const sigMega = val > 100
                    const win = signal.status === 'live'
                    return (
                      <div key={i} className={`flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${win ? (sigMega ? 'bg-yellow-400/20 text-yellow-400' : 'bg-[#22c55e]/20 text-[#22c55e]') : 'bg-red-500/20 text-red-400'}`}>
                            {win ? '✓' : '✗'}
                          </span>
                          <div>
                            <div className={`font-black text-lg leading-none ${win ? (sigMega ? 'text-yellow-400' : 'text-[#22c55e]') : 'text-red-400'}`}>
                              {signal.multiplier}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {win ? (sigMega ? '🔥 MEGA WIN' : '✅ Cashed Out') : '💥 Crashed'}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{signal.time}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Recent Wins ── */}
          <div className="space-y-6">
            {/* CTA if no access */}
            {!accessGranted && !accessLoading && (
              <Link href="/packages">
                <div className="bg-gradient-to-br from-red-700 to-red-900 border border-red-500/40 rounded-2xl p-5 text-center hover:scale-[1.02] transition-all cursor-pointer">
                  <div className="text-3xl mb-2">🚀</div>
                  <div className="text-white font-black text-lg mb-1">Get VIP Access</div>
                  <div className="text-red-300 text-sm">Unlock live signals + SMS alerts</div>
                  <div className="mt-3 bg-white/10 rounded-xl py-2 px-4 text-white font-black text-sm">
                    From KSH 100 →
                  </div>
                </div>
              </Link>
            )}

            {/* Recent wins card */}
            <div className="bg-[#0d1320] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <h3 className="font-black text-sm text-white uppercase tracking-widest">🏆 Recent Wins</h3>
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse inline-block" />
              </div>
              <div className="divide-y divide-white/5 max-h-[560px] overflow-y-auto scroll-smooth">
                {recentWins.map((win, i) => {
                  const amt = parseInt(win.amount.replace(/,/g, ''))
                  const big = amt >= 100000
                  return (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors ${big ? 'bg-yellow-400/5' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-black shrink-0 ${big ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' : 'bg-gradient-to-br from-[#22c55e] to-green-700 text-black'}`}>
                          {win.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white truncate">{win.name}</span>
                            {big && <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black shrink-0">BIG!</span>}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{maskPhone(win.phone)}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-black shrink-0 ml-2 ${big ? 'text-yellow-400' : 'text-[#22c55e]'}`}>
                        +{win.amount}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Platforms */}
            <div className="bg-[#0d1320] rounded-2xl border border-white/5 p-5">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest text-center mb-4">Works on all platforms</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'BETIKA', icon: '🏆', color: 'text-red-400' },
                  { name: 'PEPETA', icon: '⚡', color: 'text-[#22c55e]' },
                  { name: 'ODITBET', icon: '🎯', color: 'text-red-400' },
                  { name: 'MELBET', icon: '⭐', color: 'text-yellow-400' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors cursor-pointer">
                    <span className="text-lg">{p.icon}</span>
                    <span className={`text-xs font-black ${p.color}`}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
