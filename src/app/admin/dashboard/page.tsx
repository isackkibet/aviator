'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  totalPayments: number
  totalRevenue: number
  todayPayments: number
  revenueToday: number
  pendingPayments: number
  uniqueUsers: number
}

interface SignalSettings {
  max_multiplier: number
  signals_running: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)
  const [settings, setSettings] = useState<SignalSettings>({ max_multiplier: 100, signals_running: false })
  const [savingMultiplier, setSavingMultiplier] = useState(false)
  const [multiplierInput, setMultiplierInput] = useState('100')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/verify')
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.authenticated) {
          router.push('/admin/login')
          return
        }
        setAdmin(data.admin)
        const [statsData, settingsData] = await Promise.all([
          fetch('/api/admin/stats').then((r) => r.json()),
          fetch('/api/admin/settings').then((r) => r.json()),
        ])
        if (statsData) setStats(statsData)
        if (settingsData) {
          setSettings(settingsData)
          setMultiplierInput(String(settingsData.max_multiplier))
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const toggleSignals = async () => {
    const newState = !settings.signals_running
    setSettings((s) => ({ ...s, signals_running: newState }))
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signals_running: newState }),
    })
  }

  const saveMultiplier = async () => {
    const val = Number(multiplierInput)
    if (!val || val < 1) return
    setSavingMultiplier(true)
    setSettings((s) => ({ ...s, max_multiplier: val }))
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_multiplier: val }),
    })
    setSavingMultiplier(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    )
  }

  const cards = [
    { label: 'Total Payments', value: stats?.totalPayments || 0, color: 'text-[#22c55e]' },
    { label: 'Total Revenue', value: `KSH ${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'text-yellow-400' },
    { label: 'Today Payments', value: stats?.todayPayments || 0, color: 'text-blue-400' },
    { label: 'Revenue Today', value: `KSH ${(stats?.revenueToday || 0).toLocaleString()}`, color: 'text-green-400' },
    { label: 'Pending Approvals', value: stats?.pendingPayments || 0, color: 'text-orange-400' },
    { label: 'Unique Users', value: stats?.uniqueUsers || 0, color: 'text-purple-400' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome{admin?.name ? `, ${admin.name}` : ''}</p>
      </div>

      {/* ── Signal Controls ── */}
      <div className="mb-8 glass p-8 rounded-2xl border-2 border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-6">Signal Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Run / Stop Signals */}
          <div className="bg-black/30 rounded-xl p-6 border border-gray-700/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Live Signals</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {settings.signals_running ? 'Signals are running — users see live data' : 'Signals stopped — users see paused state'}
                </p>
              </div>
              <div className={`w-14 h-8 rounded-full flex items-center transition-all cursor-pointer ${settings.signals_running ? 'bg-[#22c55e]' : 'bg-gray-600'}`}
                onClick={toggleSignals}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${settings.signals_running ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold text-center ${settings.signals_running ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {settings.signals_running ? 'RUNNING' : 'STOPPED'}
            </div>
          </div>

          {/* Max Multiplier */}
          <div className="bg-black/30 rounded-xl p-6 border border-gray-700/30">
            <h3 className="text-lg font-bold text-white mb-2">Max Multiplier</h3>
            <p className="text-sm text-gray-400 mb-4">Signals won&apos;t show beyond this value</p>
            <div className="flex gap-3">
              <input
                type="number"
                value={multiplierInput}
                onChange={(e) => setMultiplierInput(e.target.value)}
                className="flex-1 bg-black/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-2xl font-black text-center outline-none focus:border-[#22c55e]/50"
                min={1}
                max={10000}
              />
              <button
                onClick={saveMultiplier}
                disabled={savingMultiplier || multiplierInput === String(settings.max_multiplier)}
                className="bg-gradient-to-r from-[#22c55e] to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {savingMultiplier ? '...' : 'Save'}
              </button>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {[50, 100, 200, 500, 1000].map((v) => (
                <button
                  key={v}
                  onClick={() => { setMultiplierInput(String(v)); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${Number(multiplierInput) === v ? 'bg-[#22c55e] text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                >
                  {v}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Current: {settings.signals_running ? '🟢 Running' : '🔴 Stopped'} · Max {settings.max_multiplier}x
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="glass p-8 rounded-2xl border-2 border-gray-700/50">
            <div className="text-sm font-bold text-gray-400 mb-2">{card.label}</div>
            <div className={`text-4xl font-black ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 glass p-8 rounded-2xl border-2 border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="/admin/payments"
            className="bg-gradient-to-r from-[#22c55e] to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Manage Payments
          </a>
        </div>
      </div>
    </div>
  )
}
