import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e17] overflow-hidden">

      {/* ── Hero Section ── */}
      <section className="relative text-white py-28 px-4 overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-500/8 blur-[120px] mesh-orb-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#22c55e]/8 blur-[120px] mesh-orb-2" />
          <div className="absolute top-[30%] left-[50%] w-[400px] h-[400px] rounded-full bg-red-400/5 blur-[100px] mesh-orb-3" />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 aviator-grid-bg opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17] via-transparent to-[#0a0e17]" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="plane absolute left-10 top-20 w-24 h-auto" style={{ animationDelay: '1s' }} />

          {/* Badge */}
          <div className="fade-up fade-up-1 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-sm font-bold text-[#22c55e]">LIVE NOW — 95.2% ACCURACY</span>
          </div>

          <h1 className="fade-up fade-up-2 text-7xl md:text-8xl font-black mb-6">
            <span className="gradient-text-red">
              AVIATOR
            </span>
            <span className="block text-4xl font-normal text-[#22c55e] multiplier-glow mt-2">SIGNALS</span>
          </h1>

          <p className="fade-up fade-up-3 text-3xl md:text-4xl mb-6 text-[#22c55e] font-semibold pulse">
            95.2% WIN RATE &bull; LIVE CRASH PREDICTIONS
          </p>

          <p className="fade-up fade-up-4 text-xl mb-12 max-w-2xl mx-auto text-gray-400">
            Get instant cashout signals for{' '}
            <span className="font-black text-white">Betika, Pepeta, Odibet, Melbet</span>{' '}
            and every Aviator game. Start from <span className="text-[#22c55e] font-bold">KSH 100</span>!
          </p>

          {/* CTA Buttons */}
          <div className="fade-up fade-up-5 flex flex-col lg:flex-row gap-5 justify-center items-center mb-20">
            <Link href="/packages" className="btn-glow bg-gradient-to-r from-red-600 to-red-700 text-white text-xl font-black px-14 py-5 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-900/40">
              BUY SIGNALS NOW
            </Link>
            <Link href="/dashboard" className="btn-glow btn-glow-green bg-[#111827] text-[#22c55e] text-xl font-bold px-14 py-5 rounded-2xl border-2 border-[#22c55e]/40">
              LIVE DASHBOARD
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="fade-up fade-up-6 grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {[
              { value: '1.5x - 25x', label: 'Multipliers', variant: 'green' },
              { value: 'KSH 100', label: 'Min Package', variant: 'red' },
              { value: '24/7', label: 'Live Support', variant: 'green', link: '/admin/login' },
              { value: '15s AVG', label: 'Signal Delay', variant: 'red' },
            ].map((s, i) => {
              const cardClass = s.variant === 'green'
                ? 'card-glow border-[#22c55e]/15 bg-[#0d1320]'
                : 'card-glow card-glow-red border-red-500/15 bg-[#0d1320]'
              const textClass = s.variant === 'green' ? 'text-[#22c55e]' : 'text-red-400'
              const content = (
                <div className={`glass p-6 rounded-2xl border ${cardClass} shimmer${s.variant === 'red' ? '-red' : ''} text-center`}>
                  <span className={`text-3xl font-black block ${textClass}`}>{s.value}</span>
                  <span className="text-gray-500 text-sm font-medium mt-1 block">{s.label}</span>
                </div>
              )
              return s.link ? (
                <Link key={i} href={s.link}>{content}</Link>
              ) : (
                <div key={i}>{content}</div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider-glow" />

      {/* ── How It Works ── */}
      <section className="py-24 px-4 bg-[#0a0e17] relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-6 gradient-text-green">
            HOW IT WORKS
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">Three simple steps to start winning</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose Package', desc: 'Pick a plan that fits your budget. From KSH 100 to KSH 5,000.', color: 'green' },
              { step: '02', title: 'Get Signals', desc: 'Receive live Aviator crash predictions before each round starts.', color: 'red' },
              { step: '03', title: 'Cash Out Big', desc: 'Place bets using our signals and cash out before the crash.', color: 'green' },
            ].map((s, i) => (
              <div key={i} className={`fade-up fade-up-${i + 1} card-glow${s.color === 'red' ? ' card-glow-red' : ''} glass rounded-2xl p-8 border ${s.color === 'green' ? 'border-[#22c55e]/15' : 'border-red-500/15'}`}>
                <div className={`text-5xl font-black mb-4 ${s.color === 'green' ? 'text-[#22c55e]/20' : 'text-red-400/20'}`}>{s.step}</div>
                <h3 className={`text-xl font-black mb-3 ${s.color === 'green' ? 'text-[#22c55e]' : 'text-red-400'}`}>{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider-glow" />

      {/* ── Platforms Section ── */}
      <section className="py-24 px-4 bg-[#0a0e17]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-6 gradient-text-green">
            PROVEN ON ALL PLATFORMS
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">Works on every major betting platform</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 items-center justify-items-center">
            {[
              { name: 'BETIKA', color: 'red', glow: 'hover:shadow-red-500/20' },
              { name: 'PEPETA', color: 'green', glow: 'hover:shadow-[#22c55e]/20' },
              { name: 'ODIBET', color: 'red', glow: 'hover:shadow-red-500/20' },
              { name: 'MELBET', color: 'green', glow: 'hover:shadow-[#22c55e]/20' },
              { name: '1XBET', color: 'red', glow: 'hover:shadow-red-500/20' },
              { name: 'ALL SITES', color: 'green', glow: 'hover:shadow-[#22c55e]/20' },
            ].map((p, i) => {
              const textColor = p.color === 'red' ? 'text-red-400' : 'text-[#22c55e]'
              const borderColor = p.color === 'red' ? 'border-red-500/20' : 'border-[#22c55e]/20'
              const afterColor = p.color === 'red' ? 'bg-red-400' : 'bg-[#22c55e]'
              return (
                <div
                  key={p.name}
                  className={`platform-badge card-glow${p.color === 'red' ? ' card-glow-red' : ''} glass rounded-2xl w-full text-center py-7 px-4 border ${borderColor} cursor-default hover:shadow-lg ${p.glow}`}
                >
                  <span className={`text-xl font-black ${textColor}`}>{p.name}</span>
                  <style>{`.platform-badge:nth-child(${i + 1})::after { background: ${afterColor.replace('bg-', '')}; }`}</style>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider-glow" />

      {/* ── Testimonials / Trust ── */}
      <section className="py-24 px-4 bg-[#0a0e17]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-6 gradient-text-green">
            TRUSTED BY THOUSANDS
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">Real results from real users in Kenya</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Brian K.', text: 'Started with KSH 100 package. Made 15K in one week. The signals are legit!', amount: '+15,200', color: 'green' },
              { name: 'Wanjiku M.', text: 'Best prediction app I have used. The accuracy is insane. Keep it up!', amount: '+42,800', color: 'green' },
              { name: 'Hassan A.', text: 'VIP package is worth every coin. Signals are fast and accurate. Recommended.', amount: '+8,900', color: 'green' },
            ].map((t, i) => (
              <div key={i} className={`fade-up fade-up-${i + 1} card-glow glass rounded-2xl p-6 border border-[#22c55e]/10`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e] to-green-700 flex items-center justify-center text-black font-black text-sm">
                    {t.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-[#22c55e] font-black text-xs">{t.amount} KSH</div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 bg-[#0a0e17] relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-red-500/5 blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-black text-white mb-6">
            READY TO <span className="gradient-text-red">START WINNING</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join thousands of Kenyans making money with Aviator signals
          </p>
          <Link href="/packages" className="btn-glow bg-gradient-to-r from-red-600 to-red-700 text-white text-xl font-black px-16 py-6 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-900/40 inline-block">
            GET STARTED NOW
          </Link>
        </div>
      </section>
    </div>
  );
}
