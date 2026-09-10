'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface GameSettings {
  max_multiplier: number
  signals_running: boolean
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)
  const [settings, setSettings] = useState<GameSettings>({ max_multiplier: 100, signals_running: false })
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
        const settingsData = await fetch('/api/admin/settings').then((r) => r.json())
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome{admin?.name ? `, ${admin.name}` : ''}</p>
      </div>

      {/* ── Game Controls ── */}
      <div className="mb-8 glass p-8 rounded-2xl border-2 border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-6">Demo Game Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Run / Stop Game */}
          <div className="bg-black/30 rounded-xl p-6 border border-gray-700/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Demo Game</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {settings.signals_running ? 'Running — visitors can play the demo' : 'Stopped — visitors see a paused state'}
                </p>
              </div>
              <div className={`w-14 h-8 rounded-full flex items-center transition-all cursor-pointer ${settings.signals_running ? 'bg-[#8b5cf6]' : 'bg-gray-600'}`}
                onClick={toggleSignals}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${settings.signals_running ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold text-center ${settings.signals_running ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {settings.signals_running ? 'RUNNING' : 'STOPPED'}
            </div>
          </div>

          {/* Max Multiplier */}
          <div className="bg-black/30 rounded-xl p-6 border border-gray-700/30">
            <h3 className="text-lg font-bold text-white mb-2">Max Multiplier</h3>
            <p className="text-sm text-gray-400 mb-4">Caps how high the demo multiplier can climb</p>
            <div className="flex gap-3">
              <input
                type="number"
                value={multiplierInput}
                onChange={(e) => setMultiplierInput(e.target.value)}
                className="flex-1 bg-black/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-2xl font-black text-center outline-none focus:border-[#8b5cf6]/50"
                min={1}
                max={10000}
              />
              <button
                onClick={saveMultiplier}
                disabled={savingMultiplier || multiplierInput === String(settings.max_multiplier)}
                className="bg-linear-to-r from-[#8b5cf6] to-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {savingMultiplier ? '...' : 'Save'}
              </button>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {[50, 100, 200, 500, 1000].map((v) => (
                <button
                  key={v}
                  onClick={() => { setMultiplierInput(String(v)); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${Number(multiplierInput) === v ? 'bg-[#8b5cf6] text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
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
    </div>
  )
}
