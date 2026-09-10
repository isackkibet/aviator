'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ClientPaymentSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [countdown, setCountdown] = useState(10)
  const [paymentStatus, setPaymentStatus] = useState<string>('checking')

  const transactionId = searchParams.get('transaction') || ''
  const packageName = searchParams.get('package') || 'VIP'
  const amount = searchParams.get('amount') || '100'
  const phone = searchParams.get('phone') || ''

  useEffect(() => {
    if (!transactionId) {
      setPaymentStatus('unknown')
      return
    }

    let attempts = 0
    const maxAttempts = 15

    const poll = async () => {
      try {
        const res = await fetch(`/api/verify-payment?reference=${transactionId}`)
        const data = await res.json()
        setPaymentStatus(data.status || 'pending')

        if (data.status === 'paid') {
          return
        }

        attempts++
        if (attempts < maxAttempts && data.status !== 'paid') {
          setTimeout(poll, 3000)
        } else if (data.status !== 'paid') {
          setPaymentStatus('timeout')
        }
      } catch {
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000)
        }
      }
    }

    poll()
  }, [transactionId])

  useEffect(() => {
    if (paymentStatus !== 'paid') return
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
    return () => clearTimeout(timer)
  }, [paymentStatus, router])

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const statusColor =
    paymentStatus === 'paid'
      ? 'from-violet-400 to-violet-600'
      : paymentStatus === 'failed'
        ? 'from-red-400 to-red-600'
        : 'from-yellow-400 to-orange-500'

  const statusMessage =
    paymentStatus === 'paid'
      ? 'Payment Confirmed!'
      : paymentStatus === 'failed'
        ? 'Payment Failed'
        : paymentStatus === 'timeout'
          ? 'Payment Pending'
          : 'Waiting for STK Push confirmation...'

  return (
    <div className="min-h-screen py-24 px-4 bg-[#0a0e17] aviator-grid-bg flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center glass p-12 rounded-3xl shadow-2xl border border-[#8b5cf6]/30">
        <div className={`w-32 h-32 bg-gradient-to-r ${statusColor} rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl`}>
          {paymentStatus === 'paid' ? (
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : paymentStatus === 'failed' ? (
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          )}
        </div>

        <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-[#8b5cf6] to-violet-500 bg-clip-text text-transparent">
          {statusMessage}
        </h1>

        <div className="space-y-4 mb-8 text-xl text-gray-300">
          <p>
            <span className="font-mono text-violet-400">✓</span> {packageName} package
          </p>
          <p>
            <span className="font-mono text-violet-400">✓</span> KSH {amount} to {phone}
          </p>
          {transactionId && (
            <p>
              <span className="font-mono text-violet-400">✓</span> Ref:{' '}
              <code className="bg-black/30 px-2 py-1 rounded text-violet-400">{transactionId}</code>
            </p>
          )}
        </div>

        {paymentStatus === 'paid' && (
          <div className="glass p-8 rounded-2xl border border-violet-500/30 mb-8">
            <p className="text-2xl font-bold text-[#8b5cf6] mb-2">Aviator Signals Ready!</p>
            <p className="text-lg text-violet-300">
              Redirecting to dashboard in <span className="text-2xl font-black text-yellow-400">{countdown}</span>s
            </p>
          </div>
        )}

        {paymentStatus === 'paid' ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-105 border border-violet-500/50"
          >
            Go to Dashboard →
          </button>
        ) : paymentStatus === 'failed' ? (
          <button
            onClick={() => router.push('/packages')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-105 border border-red-500/50"
          >
            Try Again →
          </button>
        ) : (
          <p className="text-yellow-400 text-lg animate-pulse">
            Please check your phone for the M-Pesa STK push prompt
          </p>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl">Loading payment details...</div>}>
      <ClientPaymentSuccess />
    </Suspense>
  )
}
