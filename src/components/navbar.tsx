'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/packages', label: 'Packages' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <nav className="glass-strong sticky top-0 z-50 border-b border-[#22c55e]/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/betika-logo.jpg"
                alt="Betika"
                className="h-10 w-10 rounded-full object-cover border-2 border-[#22c55e] transition-all duration-300 group-hover:border-[#22c55e]/80 group-hover:shadow-lg group-hover:shadow-[#22c55e]/20"
              />
              <span className="text-xl font-black tracking-tight">
                <span className="text-[#22c55e] transition-colors">Aviator</span>
                <span className="text-gray-400 font-bold ml-1">Signals</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    className={`nav-link px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      active
                        ? 'text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#22c55e]" />
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
