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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/verify')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/admin/login')
          return
        }
        setAdmin(data.admin)
        return fetch('/api/admin/stats')
      })
      .then((r) => r?.json())
      .then((data) => {
        if (data) setStats(data)
      })
      .finally(() => setLoading(false))
  }, [router])

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
