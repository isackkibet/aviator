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
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-10 border-2 border-gray-700/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#22c55e]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-3xl font-black text-white">Super Admin</h1>
            <p className="text-gray-400 mt-2">Sign in to manage the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="isackkibet97@gmail.com"
                required
                className="w-full bg-black/30 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#22c55e]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-black/30 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#22c55e]"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#22c55e] to-green-600 text-white py-4 rounded-xl text-lg font-black shadow-2xl hover:from-[#22c55e]/90 hover:to-green-600/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
