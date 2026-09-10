'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './logo'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Play Demo' },
  ]

  return (
    <nav className="glass-strong sticky top-0 z-50 border-b border-[#8b5cf6]/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <Logo size={36} />
              <span className="hidden sm:inline text-xl font-black tracking-tight">
                <span className="text-[#8b5cf6] transition-colors">Sky</span>
                <span className="text-gray-400 font-bold">Crash</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-0.5 sm:space-x-1">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    className={`nav-link px-2.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                      active
                        ? 'text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8b5cf6]" />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
