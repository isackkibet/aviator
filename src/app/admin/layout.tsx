'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    fetch('/api/admin/verify')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/admin/login')
          return
        }
        setAuthenticated(true)
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false))
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!authenticated) return null

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <div className="flex">
        <aside className="w-64 min-h-screen glass border-r border-gray-700/50 p-6 hidden lg:block">
          <div className="mb-8">
            <Link href="/admin/dashboard">
              <div className="text-2xl font-black text-[#22c55e]">⚙️ Admin</div>
            </Link>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    pathname === item.href
                      ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>

          <div className="mt-8">
            <Link href="/dashboard">
              <div className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                ← Back to site
              </div>
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-gray-700/50 p-4">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-bold transition-all ${
                pathname === item.href ? 'text-[#22c55e]' : 'text-gray-400'
              }`}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          ))}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 px-4 py-2 text-red-400">
            <span className="text-xl">🚪</span>
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
