'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Payment {
  id: string
  phone: string
  package_id: string
  amount: number
  status: string
  created_at: string
  checkout_id: string | null
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [phoneSearch, setPhoneSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), status: statusFilter })
      if (phoneSearch) params.set('phone', phoneSearch)

      const res = await fetch(`/api/admin/payments?${params}`)
      const data = await res.json()

      if (!res.ok && data.error === 'Unauthorized') {
        router.push('/admin/login')
        return
      }

      setPayments(data.payments || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPayments()
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      }
    } finally {
      setUpdating(null)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    paid: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30',
    failed: 'text-red-400 bg-red-400/10 border-red-400/30',
    cancelled: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Payments</h1>
        <p className="text-gray-400 mt-1">{total} total payments</p>
      </div>

      <div className="glass p-6 rounded-2xl border-2 border-gray-700/50 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1">Search Phone</label>
              <input
                type="text"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                placeholder="0712..."
                className="bg-black/30 border border-gray-700/50 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 outline-none focus:border-[#22c55e]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#22c55e] text-black px-5 py-2 rounded-xl font-bold hover:bg-[#22c55e]/90"
            >
              Search
            </button>
          </form>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1">Filter Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="bg-black/30 border border-gray-700/50 rounded-xl px-4 py-2 text-white outline-none focus:border-[#22c55e]"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No payments found</div>
      ) : (
        <div className="glass rounded-2xl border-2 border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400 text-sm">
                  <th className="px-6 py-4 font-bold">Phone</th>
                  <th className="px-6 py-4 font-bold">Package</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-700/30 hover:bg-white/5">
                    <td className="px-6 py-4 text-white font-mono">{p.phone}</td>
                    <td className="px-6 py-4 text-white capitalize">{p.package_id}</td>
                    <td className="px-6 py-4 text-yellow-400 font-bold">KSH {Number(p.amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusColors[p.status] || ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {p.status !== 'paid' && (
                          <button
                            onClick={() => updateStatus(p.id, 'paid')}
                            disabled={updating === p.id}
                            className="bg-[#22c55e]/20 text-[#22c55e] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#22c55e]/30 disabled:opacity-50 border border-[#22c55e]/30"
                          >
                            Approve
                          </button>
                        )}
                        {p.status !== 'failed' && (
                          <button
                            onClick={() => updateStatus(p.id, 'failed')}
                            disabled={updating === p.id}
                            className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-500/30 disabled:opacity-50 border border-red-500/30"
                          >
                            Fail
                          </button>
                        )}
                        {p.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(p.id, 'cancelled')}
                            disabled={updating === p.id}
                            className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-500/30 disabled:opacity-50 border border-gray-500/30"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="glass px-6 py-3 rounded-xl text-white font-bold hover:bg-white/10 disabled:opacity-50 border border-gray-700/50"
          >
            Previous
          </button>
          <span className="flex items-center text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="glass px-6 py-3 rounded-xl text-white font-bold hover:bg-white/10 disabled:opacity-50 border border-gray-700/50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
