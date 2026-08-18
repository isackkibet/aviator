'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', iconPath: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z' },
  { href: '/admin/payments', label: 'Payments', iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-400 font-bold">Loading...</div>
        </div>
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
        <aside className="w-64 min-h-screen glass-strong border-r border-[#8b5cf6]/10 p-6 hidden lg:block">
          <div className="mb-8">
            <Link href="/admin/dashboard">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-violet-700 flex items-center justify-center text-black font-black text-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#8b5cf6]/30">
                  A
                </div>
                <div>
                  <div className="text-lg font-black text-white">Admin</div>
                  <div className="text-xs text-gray-500">Control Panel</div>
                </div>
              </div>
            </Link>
          </div>

          <div className="divider-glow mb-6" />

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                      active
                        ? 'bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/25 shadow-lg shadow-[#8b5cf6]/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                    </svg>
                    <span>{item.label}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>

          <div className="mt-6">
            <Link href="/dashboard">
              <div className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Back to site
              </div>
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-[#8b5cf6]/10 p-4 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  active ? 'text-[#8b5cf6]' : 'text-gray-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                  </svg>
                  <span className="text-xs">{item.label}</span>
                </div>
              </Link>
            )
          })}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 px-4 py-2 text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
