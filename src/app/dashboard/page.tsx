'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Data ───────────────────────────────────────────────────────────────────
const names = ['Brian K.', 'Wanjiku M.', 'Hassan A.', 'Nancy O.', 'Kevin N.', 'Aisha B.', 'Dennis M.', 'Rose W.', 'Samuel K.', 'Mercy L.', 'Victor O.', 'Jane P.', 'Martin K.', 'Lucy W.', 'James M.', 'Faith N.', 'Eric S.', 'Catherine M.', 'Daniel K.', 'Ann W.', 'Patrick O.', 'Beatrice N.', 'Andrew M.', 'Gladys K.']
const amounts = ['2,450', '8,720', '15,300', '4,890', '22,100', '9,650', '31,200', '5,870', '68,500', '125,000', '89,300', '156,700', '243,000', '78,900', '198,500']

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
  const crashMs = isRare ? Math.floor(rand() * ROUND_MS * 1.03) + 2300 : commonCrashMs
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

function generateSignals(count: number, currentRoundIndex: number, maxMul: number = 100) {
  const signals = []
  for (let i = count - 1; i >= 0; i--) {
    const idx = currentRoundIndex - i - 1
    if (idx < 0) continue
    const info = getRoundInfo(idx)
    const raw = info.crashMultiplier
    const capped = raw > maxMul ? maxMul : raw
    const winRand = mulberry32(idx + 999999)()
    const status: 'live' | 'crashed' = winRand > 0.048 ? 'live' : 'crashed'
    const time = new Date(idx * ROUND_MS + info.crashMs).toLocaleTimeString('en-US', { hour12: false })
    signals.push({ multiplier: capped.toFixed(2) + 'x', time, status })
  }
  return signals
}

function maskPhone(phone: string) {
  if (phone.length < 6) return phone
  return `${phone.slice(0, 7)}***${phone.slice(-3)}`
}

function generateRoundHistory(count: number, seed: number) {
  const history = []
  const rand = mulberry32(seed)
  for (let i = 0; i < count; i++) {
    const isRare = rand() < 0.1
    const mul = isRare
      ? parseFloat((rand() * 950 + 80).toFixed(2))
      : parseFloat((rand() * 33 + 1.5).toFixed(2))
    history.push(mul)
  }
  return history
}

// ─── SVG Graph ──────────────────────────────────────────────────────────────
interface GraphPoint { x: number; y: number }

function MultiplierGraph({
  progress, crashed, crashMultiplier, liveMultiplier,
}: {
  progress: number; crashed: boolean; crashMultiplier: number; liveMultiplier: number
}) {
  const W = 700, H = 320
  const PAD = { top: 28, right: 44, bottom: 44, left: 54 }
  const gW = W - PAD.left - PAD.right
  const gH = H - PAD.top - PAD.bottom
  const STEPS = 120
  const clampedP = Math.min(Math.max(progress, 0), 1)

  const fullPoints: GraphPoint[] = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const mul = 1.01 + (crashMultiplier - 1.01) * Math.pow(t, 0.75)
    const x = PAD.left + t * gW
    const normY = (mul - 1.01) / Math.max(crashMultiplier - 1.01, 0.01)
    const y = PAD.top + gH - normY * gH
    fullPoints.push({ x, y })
  }

  const liveCount = Math.max(2, Math.round(clampedP * STEPS) + 1)
  const points = fullPoints.slice(0, liveCount)

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD = pathD +
    ` L${points[points.length - 1].x.toFixed(1)},${(PAD.top + gH).toFixed(1)}` +
    ` L${PAD.left},${(PAD.top + gH).toFixed(1)} Z`

  const tip = points[points.length - 1]
  let angle = -50
  if (points.length >= 4) {
    const prev = points[points.length - 4]
    const dx = tip.x - prev.x
    const dy = tip.y - prev.y
    angle = (Math.atan2(dy, dx) * 180) / Math.PI - 90
  }

  const color = crashed ? '#ef4444' : liveMultiplier > 100 ? '#facc15' : '#f97316'
  const glowColor = liveMultiplier > 100 ? 'rgba(250,204,21,0.5)' : 'rgba(249,115,22,0.5)'
  const trailColor = crashed ? '#ef4444' : '#f97316'

  const yTicks = [1, Math.round(crashMultiplier * 0.33), Math.round(crashMultiplier * 0.66), Math.round(crashMultiplier)]

  const trailPoints = crashed
    ? []
    : points.slice(Math.max(0, points.length - 18), points.length - 1).filter((_, i) => i % 2 === 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="gAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="gTrailGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="gPlaneBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <filter id="gLineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
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

      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={`h${f}`} x1={PAD.left} y1={PAD.top + gH * (1 - f)}
          x2={PAD.left + gW} y2={PAD.top + gH * (1 - f)}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 7" />
      ))}
      {[0.2, 0.4, 0.6, 0.8, 1].map((f) => (
        <line key={`v${f}`} x1={PAD.left + gW * f} y1={PAD.top}
          x2={PAD.left + gW * f} y2={PAD.top + gH}
          stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 7" />
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#gAreaFill)" clipPath="url(#graphClip)" />

      {/* Glowing curve */}
      <path d={pathD} fill="none" stroke={trailColor} strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#gLineGlow)" />

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top - 4} x2={PAD.left} y2={PAD.top + gH} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <line x1={PAD.left} y1={PAD.top + gH} x2={PAD.left + gW + 4} y2={PAD.top + gH} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

      {/* Y-axis labels */}
      {yTicks.map((v, i) => (
        <text key={i} x={PAD.left - 10} y={PAD.top + gH - (i / (yTicks.length - 1)) * gH + 4}
          textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="10"
          fontFamily="monospace" fontWeight="700">{v}x</text>
      ))}

      {/* Multiplier label above the plane */}
      {!crashed && (
        <g transform={`translate(${tip.x}, ${tip.y - 24})`}>
          <rect x="-28" y="-12" width="56" height="18" rx="6" fill={trailColor} opacity="0.2" />
          <text x="0" y="1" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" fontWeight="900">
            {liveMultiplier.toFixed(2)}x
          </text>
        </g>
      )}

      {/* Neon smoke trail — gradient from red (origin) to orange (plane) */}
      {trailPoints.map((p, i) => {
        const frac = (i + 1) / trailPoints.length
        return (
          <circle key={i} cx={p.x} cy={p.y} r={frac * 5.5} fill={trailColor} opacity={frac * 0.6}>
            <animate attributeName="r" values={`${frac * 4.5};${frac * 6};${frac * 4.5}`}
              dur="0.6s" repeatCount="indefinite" />
          </circle>
        )
      })}

      {/* Plane (live) or Crash (crashed) */}
      {!crashed ? (
        <g transform={`translate(${tip.x}, ${tip.y})`} filter="url(#gRocketGlow)">
          {/* Glow aura */}
          <circle cx="0" cy="0" r="18" fill={glowColor} opacity="0.12" />

          {/* Plane silhouette — classic Aviator style, nose up-right ~40° */}
          <g transform={`rotate(${angle.toFixed(1)}) scale(1.1)`}>
            {/* Subtle wobble */}
            <animateTransform attributeName="transform" type="rotate"
              values={`${angle - 1};${angle + 1};${angle - 1}`}
              dur="1.2s" repeatCount="indefinite" additive="replace" />
            {/* Red glow behind body */}
            <ellipse cx="0" cy="0" rx="10" ry="6" fill="#ef4444" opacity="0.15" />

            {/* Fuselage (body) — solid red */}
            <path d="M -3,-12 L 0,-18 L 3,-12 L 4,0 L 3,6 L -3,6 L -4,0 Z"
              fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />

            {/* Cockpit — dark glass */}
            <ellipse cx="0" cy="-10" rx="2" ry="3" fill="#1e1e2e" stroke="#0f0f1a" strokeWidth="0.5" />
            <ellipse cx="0" cy="-10" rx="1.2" ry="2" fill="#3b3b5c" opacity="0.6" />

            {/* Upper wing — white/yellow trim */}
            <path d="M -12,-4 L -2,-7 L 12,-4 L 2,-1 Z"
              fill="#dc2626" stroke="#fbbf24" strokeWidth="0.6" />
            {/* Wing highlight line */}
            <line x1="-10" y1="-4" x2="10" y2="-4" stroke="#fde047" strokeWidth="0.5" opacity="0.7" />

            {/* Lower wing */}
            <path d="M -10,2 L -1,0 L 10,2 L 1,4 Z"
              fill="#dc2626" stroke="#fbbf24" strokeWidth="0.5" />

            {/* Tail fin — vertical */}
            <path d="M -2,5 L -5,12 L 2,6 Z"
              fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" />
            {/* Tail fin — horizontal */}
            <path d="M -6,8 L -2,6 L -2,10 Z" fill="#b91c1c" stroke="#991b1b" strokeWidth="0.4" />

            {/* Engine exhaust */}
            <rect x="-1.5" y="5" width="3" height="2" rx="0.5" fill="#7f1d1d" />

            {/* Flame */}
            <ellipse cx="0" cy="9.5" rx="3" ry="5" fill="#fde047" opacity="0.95">
              <animate attributeName="ry" values="4;7;3.5;6;4" dur="0.22s" repeatCount="indefinite" />
              <animate attributeName="rx" values="3;2.2;3.5;2.5;3" dur="0.16s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="0" cy="11" rx="2" ry="3.5" fill="#f97316" opacity="0.9">
              <animate attributeName="ry" values="3;5;2.5;4.5;3" dur="0.18s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="0" cy="12.5" rx="1" ry="2" fill="white" opacity="0.8">
              <animate attributeName="ry" values="1.5;3;1;2.5;1.5" dur="0.15s" repeatCount="indefinite" />
            </ellipse>
          </g>
        </g>
      ) : (
        <g transform={`translate(${tip.x}, ${tip.y})`} filter="url(#gBoom)">
          {/* Expanding rings */}
          <circle cx="0" cy="0" r="20" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.7">
            <animate attributeName="r" values="10;40;10" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="12" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="6;28;6" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" />
          </circle>
          {/* Burst particles */}
          <circle cx="0" cy="0" r="8" fill="#ef4444" opacity="0.9">
            <animate attributeName="r" values="8;16;8" dur="0.35s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="4" fill="#fde047" opacity="1">
            <animate attributeName="r" values="4;8;4" dur="0.25s" repeatCount="indefinite" />
          </circle>
          {/* Debris sparks */}
          {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
            const r = (deg * Math.PI) / 180
            const dist = 14 + (i % 3) * 5
            return (
              <circle key={i} cx={Math.cos(r)*dist} cy={Math.sin(r)*dist} r="2"
                fill={i % 2 === 0 ? '#fde047' : '#ef4444'} opacity="0.9">
                <animate attributeName="opacity" values="0.9;0;0.9" dur={`${0.25+i*0.03}s`} repeatCount="indefinite" />
                <animate attributeName="r" values="2;0.8;2" dur={`${0.25+i*0.03}s`} repeatCount="indefinite" />
              </circle>
            )
          })}
          {/* CRASHED text */}
          <text x="0" y="-30" textAnchor="middle" fontSize="13" fill="#ef4444" fontWeight="900" letterSpacing="1">
            CRASHED
          </text>
        </g>
      )}
    </svg>
  )
}

// ─── Bet Panel Component ────────────────────────────────────────────────────
function BetPanel({
  crashed, liveMultiplier, accessGranted, setNotification,
}: {
  crashed: boolean; liveMultiplier: number; accessGranted: boolean;
  setNotification: (n: { message: string; type: 'success' | 'error' | 'info' }) => void
}) {
  const [betAmount, setBetAmount] = useState('100')
  const [autoCashout, setAutoCashout] = useState('')
  const [betsPlaced, setBetsPlaced] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [wonAmount, setWonAmount] = useState(0)

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000]

  const handleBet = () => {
    if (!accessGranted) {
      setNotification({ message: 'Buy a package first to place bets', type: 'error' })
      return
    }
    setBetsPlaced(true)
    setCashedOut(false)
    setWonAmount(0)
    setNotification({ message: `Bet of KSH ${betAmount} placed!`, type: 'success' })
  }

  const handleCashout = () => {
    if (betsPlaced && !cashedOut) {
      const payout = (parseInt(betAmount) * liveMultiplier)
      setWonAmount(Math.floor(payout))
      setCashedOut(true)
      setNotification({ message: `Cashed out! Won KSH ${Math.floor(payout).toLocaleString()} at ${liveMultiplier.toFixed(2)}x`, type: 'success' })
    }
  }

  const handleReset = () => {
    setBetsPlaced(false)
    setCashedOut(false)
    setWonAmount(0)
  }

  useEffect(() => {
    if (crashed && betsPlaced && !cashedOut) {
      setBetsPlaced(false)
      setWonAmount(0)
    }
    if (crashed) {
      setTimeout(() => {
        setCashedOut(false)
        setBetsPlaced(false)
      }, 1500)
    }
  }, [crashed])

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bet Amount</span>
        <span className="text-xs text-[#8b5cf6] font-bold">KSH {betAmount}</span>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-bold outline-none focus:border-[#8b5cf6] transition-colors"
          min="50"
        />
        <button onClick={() => setBetAmount(String(Math.max(50, parseInt(betAmount) - 50)))}
          className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-colors">-</button>
        <button onClick={() => setBetAmount(String(parseInt(betAmount) + 50))}
          className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-colors">+</button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {quickAmounts.map((a) => (
          <button key={a} onClick={() => setBetAmount(String(a))}
            className="py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-bold hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 hover:text-[#8b5cf6] transition-all">
            {a.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Auto Cashout</span>
        <input
          type="number"
          value={autoCashout}
          onChange={(e) => setAutoCashout(e.target.value)}
          placeholder="e.g. 2.00"
          step="0.1"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#8b5cf6] transition-colors placeholder:text-gray-600"
        />
      </div>

      {!betsPlaced ? (
        <button onClick={handleBet}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-black text-sm shadow-lg shadow-[#8b5cf6]/20 hover:shadow-[#8b5cf6]/40 transition-all active:scale-95">
          BET
        </button>
      ) : !crashed && !cashedOut ? (
        <button onClick={handleCashout}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-black font-black text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all active:scale-95 animate-pulse">
          CASH OUT — {(parseInt(betAmount) * liveMultiplier).toFixed(0)} KSH
        </button>
      ) : cashedOut ? (
        <div className="w-full py-3.5 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] font-black text-sm text-center">
          WON KSH {wonAmount.toLocaleString()}!
        </div>
      ) : (
        <button onClick={handleReset}
          className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/10 transition-all">
          PLACE NEXT BET
        </button>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [liveGame, setLiveGame] = useState(1.01)
  const [graphProgress, setGraphProgress] = useState(0)
  const [signals, setSignals] = useState<Array<{ multiplier: string; time: string; status: 'live' | 'crashed' }>>([])
  const [roundHistory, setRoundHistory] = useState<number[]>([])
  const [roundState, setRoundState] = useState({ crashed: false, crashMultiplier: 2.0, currentRoundIndex: 0 })
  const [accessGranted, setAccessGranted] = useState(false)
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const [signalsRunning, setSignalsRunning] = useState(true)
  const [maxMultiplier, setMaxMultiplier] = useState(100)
  const [balance] = useState(10000)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [liveBets, setLiveBets] = useState<Array<{ name: string; initials: string; bet: number; mul: number; payout: number; cashed: boolean }>>([])

  // Fetch settings
  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((data) => {
      setSignalsRunning(data.signals_running)
      setMaxMultiplier(data.max_multiplier || 100)
    }).catch(() => {})
  }, [])

  // Check access
  useEffect(() => {
    const storedPhone = localStorage.getItem('aviator_phone')
    if (!storedPhone) { setAccessLoading(false); return }
    fetch(`/api/verify-access?phone=${encodeURIComponent(storedPhone)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hasAccess) { setAccessGranted(true); setAccessExpiresAt(data.expires_at) }
        else { setAccessGranted(false) }
      })
      .catch(() => setAccessGranted(false))
      .finally(() => setAccessLoading(false))
  }, [])

  // Generate live bets
  useEffect(() => {
    let id = 0
    const gen = () => {
      const rand = mulberry32(Date.now() + id++)
      const name = names[Math.floor(rand() * names.length)]
      const bet = [100, 200, 500, 1000, 2000, 5000][Math.floor(rand() * 6)]
      const mul = parseFloat((1 + rand() * 15).toFixed(2))
      const cashed = rand() > 0.15
      return { name, initials: name.split(' ').map(w => w[0]).join(''), bet, mul, payout: Math.floor(bet * mul), cashed }
    }
    setLiveBets(Array.from({ length: 8 }, gen))
    const interval = setInterval(() => {
      setLiveBets((prev) => [...prev.slice(-12), gen()])
    }, 2500 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  // Real-time loop
  useEffect(() => {
    let lastRoundIndex = -1
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
        setSignals(generateSignals(10, state.currentRoundIndex, maxMultiplier))
        setRoundHistory(generateRoundHistory(15, state.currentRoundIndex - 1))
      }

      rafId = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(rafId)
  }, [maxMultiplier])

  // Auto-dismiss notifications
  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 3000)
    return () => clearTimeout(t)
  }, [notification])

  const { crashed, crashMultiplier, currentRoundIndex } = roundState
  const clampedLive = Math.min(liveGame, maxMultiplier)
  const isMega = clampedLive > 100

  function getHistoryColor(mul: number) {
    if (mul >= 10) return 'bg-[#8b5cf6] text-white'
    if (mul >= 3) return 'bg-[#6d28d9] text-white'
    if (mul >= 2) return 'bg-blue-600 text-white'
    return 'bg-gray-600 text-gray-200'
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">

      {/* ── Top Bar ── */}
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/betika-logo.jpg" alt="Betika" className="w-8 h-8 rounded-full object-cover border border-[#8b5cf6]/50" />
              <span className="text-sm font-black"><span className="text-[#8b5cf6]">Aviator</span> Signals</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
              <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm font-bold text-white">KSH {balance.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 font-mono">#{currentRoundIndex}</div>
            {!accessLoading && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                accessGranted ? 'border-[#8b5cf6]/30 text-[#8b5cf6] bg-[#8b5cf6]/10' : 'border-red-500/30 text-red-400 bg-red-500/10'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accessGranted ? '#8b5cf6' : '#ef4444' }} />
                {accessGranted ? 'VIP ACTIVE' : 'NO ACCESS'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Notification Toast ── */}
      {notification && (
        <div className={`fixed top-16 right-4 z-50 animate-slide-in px-5 py-3 rounded-xl border shadow-2xl text-sm font-bold ${
          notification.type === 'success' ? 'bg-[#22c55e]/20 border-[#22c55e]/40 text-[#22c55e]' :
          notification.type === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-400' :
          'bg-[#8b5cf6]/20 border-[#8b5cf6]/40 text-[#8b5cf6]'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* ── Round History Bar ── */}
        <div className="mb-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs text-gray-500 font-bold shrink-0 mr-2">HISTORY</span>
          {roundHistory.map((mul, i) => (
            <div key={i} className={`px-2.5 py-1 rounded-md text-xs font-black shrink-0 ${getHistoryColor(mul)}`}>
              {mul.toFixed(2)}x
            </div>
          ))}
        </div>

        {/* ── Live Chart (full width, top) ── */}
        <div className={`rounded-2xl border bg-[#0d1320] overflow-hidden transition-all duration-500 mb-4 ${
          crashed ? 'border-red-500/40' : isMega ? 'border-yellow-400/40' : 'border-[#8b5cf6]/20'
        }`}>
          {/* Graph header */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${crashed ? 'bg-red-400' : 'bg-[#f97316] animate-pulse'}`} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{crashed ? 'CRASHED' : 'LIVE'}</span>
            </div>
            <div className="flex items-center gap-3">
              {isMega && !crashed && <span className="text-[10px] font-black bg-yellow-400 text-black px-2 py-0.5 rounded-full animate-bounce">MEGA</span>}
              <span className="text-xs text-gray-500 font-mono">Round #{currentRoundIndex}</span>
            </div>
          </div>

          {/* Multiplier + Graph */}
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-56 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-white/5">
              <div className={`text-7xl lg:text-8xl font-black tracking-tighter transition-colors duration-300 ${
                crashed ? 'text-red-400' : isMega ? 'text-yellow-400' : 'text-white'
              } ${crashed ? '' : 'multiplier-glow'}`}>
                {clampedLive.toFixed(2)}<span className="text-4xl font-bold opacity-50">x</span>
              </div>
              <p className={`text-sm font-bold mt-2 text-center ${crashed ? 'text-red-400' : isMega ? 'text-yellow-400' : 'text-gray-500'}`}>
                {crashed ? 'CRASHED' : isMega ? 'MEGA WIN' : 'CASH OUT'}
              </p>
            </div>
            <div className="flex-1 p-3" style={{ minHeight: '340px' }}>
              <MultiplierGraph
                progress={graphProgress}
                crashed={crashed}
                crashMultiplier={Math.min(crashMultiplier, maxMultiplier)}
                liveMultiplier={clampedLive}
              />
            </div>
          </div>
        </div>

        {/* ── Bottom: Bet Panels (left) + Live Bets/Cashouts (right) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* ── Bet Panels (2 cols) ── */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BetPanel crashed={crashed} liveMultiplier={clampedLive} accessGranted={accessGranted} setNotification={setNotification} />
              <BetPanel crashed={crashed} liveMultiplier={clampedLive} accessGranted={accessGranted} setNotification={setNotification} />
            </div>

            {/* Signals — below bet panels */}
            <div className="mt-4 bg-[#0d1320] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5">
                <h3 className="font-black text-xs text-white uppercase tracking-widest">Signal History</h3>
                <span className="text-xs text-[#8b5cf6] font-bold">95.2% ACCURATE</span>
              </div>
              {!accessGranted ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm">Purchase a package to unlock</p>
                  <Link href="/packages" className="btn-glow btn-glow-purple bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white px-6 py-2.5 rounded-xl text-sm font-black border border-[#8b5cf6]/30">
                    Buy from KSH 100
                  </Link>
                </div>
              ) : !signalsRunning ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 px-6 text-center">
                  <p className="text-yellow-400 font-bold text-sm">Signals Paused by Admin</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 max-h-[260px] overflow-y-auto scroll-smooth">
                  {signals.map((signal, i) => {
                    const val = parseFloat(signal.multiplier)
                    const win = signal.status === 'live'
                    const mega = val > 100
                    return (
                      <div key={i} className="signal-row flex items-center justify-between px-5 py-2 transition-all">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${win ? (mega ? 'bg-yellow-400/20 text-yellow-400' : 'bg-[#8b5cf6]/20 text-[#8b5cf6]') : 'bg-red-500/20 text-red-400'}`}>
                            {win ? '✓' : '✗'}
                          </span>
                          <span className={`font-black text-sm ${win ? (mega ? 'text-yellow-400' : 'text-[#8b5cf6]') : 'text-red-400'}`}>
                            {signal.multiplier}
                          </span>
                          <span className="text-[10px] text-gray-600">{win ? (mega ? 'MEGA' : 'WIN') : 'LOSS'}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{signal.time}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Live Bets / Cashouts (1 col, right) ── */}
          <div className="bg-[#0d1320] rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5">
              <h3 className="font-black text-xs text-white uppercase tracking-widest">Live Cashouts</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-xs text-[#22c55e] font-bold">{liveBets.length} online</span>
              </div>
            </div>
            <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto scroll-smooth">
              {liveBets.map((bet, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 animate-slide-in hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                      bet.cashed ? 'bg-gradient-to-br from-[#22c55e] to-green-700 text-white' : 'bg-white/10 text-gray-400'
                    }`}>
                      {bet.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[90px]">{bet.name}</div>
                      <div className="text-[10px] text-gray-500">Bet KSH {bet.bet.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {bet.cashed ? (
                      <div className="flex flex-col items-end">
                        <div className="text-[#22c55e] font-black text-sm">+{bet.payout.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-500">@ {bet.mul.toFixed(2)}x</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="text-yellow-400 font-black text-sm animate-pulse">{bet.mul.toFixed(2)}x</div>
                        <div className="text-[10px] text-gray-500">Playing</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
