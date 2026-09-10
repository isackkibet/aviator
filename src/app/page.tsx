import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e17] overflow-hidden">

      {/* ── Hero Section ── */}
      <section className="relative text-white py-28 px-4 overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-500/8 blur-[120px] mesh-orb-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/8 blur-[120px] mesh-orb-2" />
          <div className="absolute top-[30%] left-[50%] w-[400px] h-[400px] rounded-full bg-red-400/5 blur-[100px] mesh-orb-3" />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 aviator-grid-bg opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17] via-transparent to-[#0a0e17]" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="plane absolute left-10 top-20 w-24 h-auto" style={{ animationDelay: '1s' }} />

          {/* Badge */}
          <div className="fade-up fade-up-1 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" />
            <span className="text-sm font-bold text-[#8b5cf6]">FREE DEMO — NO REAL MONEY, EVER</span>
          </div>

          <h1 className="fade-up fade-up-2 text-7xl md:text-8xl font-black mb-6">
            <span className="gradient-text-red">
              SKY
            </span>
            <span className="block text-4xl font-normal text-[#8b5cf6] multiplier-glow mt-2">CRASH</span>
          </h1>

          <p className="fade-up fade-up-3 text-3xl md:text-4xl mb-6 text-[#8b5cf6] font-semibold pulse">
            WATCH IT CLIMB &bull; CASH OUT IN TIME
          </p>

          <p className="fade-up fade-up-4 text-xl mb-12 max-w-2xl mx-auto text-gray-400">
            A free, open practice version of the classic{' '}
            <span className="font-black text-white">crash multiplier game</span>.
            Play with virtual credits, learn the mechanics, no sign-up and{' '}
            <span className="text-[#8b5cf6] font-bold">no real money involved</span>.
          </p>

          {/* CTA Buttons */}
          <div className="fade-up fade-up-5 flex flex-col lg:flex-row gap-5 justify-center items-center mb-20">
            <Link href="/dashboard" className="btn-glow bg-gradient-to-r from-red-600 to-red-700 text-white text-xl font-black px-14 py-5 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-900/40">
              PLAY THE DEMO
            </Link>
            <a href="#how-it-works" className="btn-glow btn-glow-purple bg-[#111827] text-[#8b5cf6] text-xl font-bold px-14 py-5 rounded-2xl border-2 border-[#8b5cf6]/40">
              HOW IT WORKS
            </a>
          </div>

          {/* Stats Grid */}
          <div className="fade-up fade-up-6 grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {[
              { value: '1.00x+', label: 'Multiplier range', variant: 'green' },
              { value: 'FREE', label: 'Always, no cost', variant: 'red' },
              { value: 'VIRTUAL', label: 'Demo credits only', variant: 'green' },
              { value: 'RANDOM', label: 'Fair, unpredictable', variant: 'red' },
            ].map((s, i) => {
              const cardClass = s.variant === 'green'
                ? 'card-glow border-[#8b5cf6]/15 bg-[#0d1320]'
                : 'card-glow card-glow-red border-red-500/15 bg-[#0d1320]'
              const textClass = s.variant === 'green' ? 'text-[#8b5cf6]' : 'text-red-400'
              return (
                <div key={i} className={`glass p-6 rounded-2xl border ${cardClass} shimmer${s.variant === 'red' ? '-red' : ''} text-center`}>
                  <span className={`text-3xl font-black block ${textClass}`}>{s.value}</span>
                  <span className="text-gray-500 text-sm font-medium mt-1 block">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider-glow" />

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-4 bg-[#0a0e17] relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-6 gradient-text-purple">
            HOW IT WORKS
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">Three simple steps — every round</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Place a Demo Bet', desc: 'Set a virtual bet amount before the round starts. No real money is ever charged.', color: 'green' },
              { step: '02', title: 'Watch the Multiplier Climb', desc: 'The plane flies and the multiplier rises in real time, until it randomly crashes.', color: 'red' },
              { step: '03', title: 'Cash Out Before It Crashes', desc: 'Cash out any time to lock in your multiplier. Wait too long and the round is lost.', color: 'green' },
            ].map((s, i) => (
              <div key={i} className={`fade-up fade-up-${i + 1} card-glow${s.color === 'red' ? ' card-glow-red' : ''} glass rounded-2xl p-8 border ${s.color === 'green' ? 'border-[#8b5cf6]/15' : 'border-red-500/15'}`}>
                <div className={`text-5xl font-black mb-4 ${s.color === 'green' ? 'text-[#8b5cf6]/20' : 'text-red-400/20'}`}>{s.step}</div>
                <h3 className={`text-xl font-black mb-3 ${s.color === 'green' ? 'text-[#8b5cf6]' : 'text-red-400'}`}>{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider-glow" />

      {/* ── Fair & Random Section ── */}
      <section className="py-24 px-4 bg-[#0a0e17]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-6 gradient-text-purple">
            FAIR, RANDOM, UNPREDICTABLE
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg max-w-2xl mx-auto">
            Every round&apos;s crash point is generated fresh and independently. Nobody — including us — knows
            it in advance, so no service can honestly sell you a &quot;signal&quot; or prediction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'New round, new outcome', desc: 'Each crash point is generated independently. Past rounds have no bearing on what happens next.' },
              { title: 'No predictions sold here', desc: 'This demo makes no accuracy claims and never asks you to pay for tips or "signals".' },
              { title: 'Practice, not gambling', desc: 'Balances are virtual and reset-only. There is no way to deposit, withdraw, or win real money.' },
            ].map((f, i) => (
              <div key={i} className="card-glow glass rounded-2xl w-full text-left py-8 px-6 border border-[#8b5cf6]/20">
                <h3 className="text-lg font-black text-[#8b5cf6] mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider-glow" />

      {/* ── Why Try It ── */}
      <section className="py-24 px-4 bg-[#0a0e17]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-6 gradient-text-purple">
            WHY TRY THE DEMO
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">No pressure, no cost, no catch</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'No sign-up required', text: 'Jump straight into the dashboard and start playing with virtual credits immediately.' },
              { title: 'Zero financial risk', text: 'Nothing here touches real money — no deposits, no withdrawals, no payment forms.' },
              { title: 'Learn the mechanics', text: 'Get a feel for how crash-multiplier games work before ever risking a cent elsewhere.' },
            ].map((t, i) => (
              <div key={i} className={`fade-up fade-up-${i + 1} card-glow glass rounded-2xl p-6 border border-[#8b5cf6]/10`}>
                <div className="font-bold text-white text-sm mb-3">{t.title}</div>
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
            READY TO <span className="gradient-text-red">GIVE IT A GO</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Free virtual credits. No account, no payment, no risk.
          </p>
          <Link href="/dashboard" className="btn-glow bg-gradient-to-r from-red-600 to-red-700 text-white text-xl font-black px-16 py-6 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-900/40 inline-block">
            PLAY THE DEMO
          </Link>
        </div>
      </section>
    </div>
  );
}
