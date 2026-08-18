'use client'

import { useEffect, useState } from 'react'
import Toast from '@/components/toast'

interface Notification {
  message: string
  type: 'success' | 'error' | 'info'
}

function PhoneInputBlock({
  onPhoneSaved,
}: {
  onPhoneSaved: (value: string) => void
}) {
  const [value, setValue] = useState('')
  const canSave = value.trim().length >= 6

  return (
    <div id="phone-capture-block" className="max-w-xl mx-auto mb-16">
      <div className="fade-up fade-up-2 glass-strong rounded-3xl border border-[#22c55e]/15 p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22c55e] to-green-700 flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#22c55e]/30">
            <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <div className="text-xl font-black text-white mb-1">Enter Your Phone Number</div>
          <div className="text-gray-400 text-sm">Required for M-Pesa payment and signal delivery</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="tel"
            placeholder="e.g. 0712345678"
            className="flex-1 bg-black/30 border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-500 outline-none focus:border-[#22c55e] focus:shadow-lg focus:shadow-[#22c55e]/10 transition-all duration-300"
          />
          <button
            type="button"
            disabled={!canSave}
            onClick={() => {
              const phone = value.trim()
              onPhoneSaved(phone)
            }}
            className="btn-glow btn-glow-green bg-gradient-to-r from-[#22c55e] to-green-600 text-black px-8 py-3.5 rounded-xl text-sm font-black shadow-2xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Save Number
          </button>
        </div>
      </div>
    </div>
  )
}

function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission)
    })
  }
}

export default function Packages() {
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const packages = [
    {
      id: 'basic',
      name: 'BASIC',
      tagline: '30 MINUTES',
      price: 100,
      duration: 30,
      popular: false,
      features: ['All betting site signals', 'Instant signal access', 'Valid for 30 minutes'],
      color: 'green',
    },
    {
      id: 'pro',
      name: 'PRO',
      tagline: '2 HOURS',
      price: 500,
      duration: 120,
      popular: true,
      features: ['All betting site signals', 'Instant signal access', 'Priority notifications', 'Valid for 2 hours'],
      color: 'yellow',
    },
    {
      id: 'vip',
      name: 'VIP',
      tagline: '24 HOURS',
      price: 2000,
      duration: 1440,
      popular: false,
      features: ['All betting site signals', 'Instant signal access', 'Priority notifications', 'Direct WhatsApp alerts', 'Valid for 24 hours'],
      color: 'red',
    },
  ]

  const handlePay = async (pkg: { id: string; price: number }) => {
    const phone = localStorage.getItem('aviator_phone') || ''

    if (!phone) {
      setNotification({ message: 'Enter your phone number first.', type: 'error' })
      const target = document.getElementById('phone-capture-block')
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (loadingPkg) return
    setLoadingPkg(pkg.id)
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          packageId: pkg.id,
          amount: pkg.price,
          Provider: pkg.id,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setNotification({ message: data?.error || 'Payment creation failed', type: 'error' })
        return
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        const params = new URLSearchParams({
          transaction: data.checkoutId || '',
          package: pkg.id,
          amount: String(pkg.price),
          phone,
        })
        window.location.href = `/payment/success?${params.toString()}`
      }
    } finally {
      setLoadingPkg(null)
    }
  }

  return (
    <>
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="min-h-screen py-24 px-4 bg-[#0a0e17] aviator-grid-bg relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[120px] mesh-orb-1" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#22c55e]/5 blur-[120px] mesh-orb-2" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="fade-up fade-up-1 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-sm font-bold text-[#22c55e]">SECURE PAYMENT VIA PAYSTACK</span>
            </div>
            <h1 className="fade-up fade-up-2 text-6xl font-black mb-4">
              <span className="gradient-text-red">BUY AVIATOR</span>{' '}
              <span className="gradient-text-green">SIGNALS</span>
            </h1>
            <p className="fade-up fade-up-3 text-lg text-gray-400 max-w-lg mx-auto">
              Choose a package, pay via M-Pesa, and get instant access to live crash predictions
            </p>
          </div>

          {/* Phone Input */}
          <PhoneInputBlock
            onPhoneSaved={(value) => {
              localStorage.setItem('aviator_phone', value)
              setNotification({ message: 'Phone saved! Now pick a package.', type: 'success' })
            }}
          />

          {/* Packages Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            {packages.map((pkg, i) => {
              const isThis = loadingPkg === pkg.id
              const cardColors = {
                green: { border: 'border-[#22c55e]/15', glow: 'card-glow', text: 'text-[#22c55e]', bg: 'from-[#22c55e] to-green-700' },
                yellow: { border: 'border-yellow-400/25', glow: 'card-glow card-glow-yellow', text: 'text-yellow-400', bg: 'from-yellow-400 to-orange-500' },
                red: { border: 'border-red-500/15', glow: 'card-glow card-glow-red', text: 'text-red-400', bg: 'from-red-500 to-red-700' },
              }[pkg.color] ?? { border: 'border-gray-700/50', glow: 'card-glow', text: 'text-white', bg: 'from-gray-500 to-gray-700' }

              return (
                <div
                  key={pkg.id}
                  className={`fade-up fade-up-${i + 3} relative ${cardColors.glow} glass-strong rounded-3xl border ${cardColors.border} transition-all duration-300 ${pkg.popular ? 'md:-translate-y-4' : ''}`}
                >
                  {/* Popular badge */}
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-1.5 rounded-full font-black text-xs tracking-wider shadow-lg shadow-yellow-500/20">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  <div className="p-8 pt-10">
                    {/* Package name */}
                    <div className="text-center mb-6">
                      <h2 className={`text-3xl font-black ${cardColors.text} mb-1`}>{pkg.name}</h2>
                      <p className="text-gray-500 text-sm font-bold tracking-wider">{pkg.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-8">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-lg text-gray-400 font-bold">KSH</span>
                        <span className="text-6xl font-black text-white">{pkg.price}</span>
                      </div>
                      <div className="divider-glow mt-4" />
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((f, fi) => (
                        <li key={fi} className="flex items-center text-gray-300 text-sm">
                          <span className="w-5 h-5 bg-[#22c55e]/20 rounded-full flex items-center justify-center mr-3 shrink-0">
                            <svg className="w-3 h-3 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePay(pkg)}
                      disabled={loadingPkg !== null}
                      className={`w-full btn-glow py-5 rounded-2xl text-lg font-black shadow-2xl transition-all duration-300 border ${
                        pkg.popular
                          ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black border-yellow-400/30 shadow-yellow-500/20 hover:shadow-yellow-500/40'
                          : 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/30'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {isThis ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        `PAY KSH ${pkg.price}`
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* How it works */}
          <div className="fade-up fade-up-6 max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl border border-[#22c55e]/10 p-10">
              <h3 className="text-2xl font-black text-center text-[#22c55e] mb-8">HOW PAYMENT WORKS</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: '01', title: 'Enter Phone', desc: 'Your M-Pesa number', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                  { step: '02', title: 'Pick Package', desc: 'Basic, Pro or VIP', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
                  { step: '03', title: 'Pay via M-Pesa', desc: 'STK push to your phone', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                  { step: '04', title: 'Get Signals', desc: 'Instant dashboard access', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} /></svg>
                    </div>
                    <div className="text-xs text-[#22c55e] font-black mb-1">STEP {s.step}</div>
                    <div className="text-white font-bold text-sm mb-0.5">{s.title}</div>
                    <div className="text-gray-500 text-xs">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
