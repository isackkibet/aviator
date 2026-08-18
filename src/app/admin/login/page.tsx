'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/5 blur-[120px] mesh-orb-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[120px] mesh-orb-2" />

      <div className="w-full max-w-md relative z-10">
        <div className="fade-up fade-up-1 glass-strong rounded-3xl p-10 border border-[#8b5cf6]/15">
          <div className="text-center mb-8">
            <div className="fade-up fade-up-2 w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#8b5cf6]/30">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="fade-up fade-up-2 text-3xl font-black text-white">Super Admin</h1>
            <p className="fade-up fade-up-3 text-gray-400 mt-2">Sign in to manage the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="fade-up fade-up-3">
              <label className="block text-sm font-bold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="isackkibet97@gmail.com"
                required
                className="w-full bg-black/30 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#8b5cf6] focus:shadow-lg focus:shadow-[#8b5cf6]/10 transition-all duration-300"
              />
            </div>

            <div className="fade-up fade-up-4">
              <label className="block text-sm font-bold text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-black/30 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#8b5cf6] focus:shadow-lg focus:shadow-[#8b5cf6]/10 transition-all duration-300"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-bold animate-slide-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="fade-up fade-up-5 w-full btn-glow btn-glow-purple bg-gradient-to-r from-[#8b5cf6] to-violet-600 text-white py-4 rounded-xl text-lg font-black shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
