const stages = [
  { label: 'Design Complete',     icon: '🎨', done: true,  date: 'Jun 01',  detail: 'AI design approved by client + senior designer sign-off' },
  { label: 'Production Started',  icon: '📦', done: true,  date: 'Jun 04',  detail: 'Materials procured, factory work order raised' },
  { label: 'Manufacturing',       icon: '🏭', done: true,  date: 'Jun 09',  detail: 'Modular units 80% complete — precision CNC machining' },
  { label: 'Quality Check',       icon: '🔍', done: false, date: 'Jun 14',  detail: 'Senior engineer 25-point quality inspection', active: true },
  { label: 'Dispatch',            icon: '🚚', done: false, date: 'Jun 16',  detail: 'Packaged and dispatched to your address' },
  { label: 'Installation',        icon: '🔧', done: false, date: 'Jun 20',  detail: 'On-site installation by certified team' },
  { label: 'Handover',            icon: '🏠', done: false, date: 'Jun 22',  detail: 'Final walkthrough, warranty card & after-care guide' },
]

export default function ProjectTracking() {
  return (
    <section id="tracking" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <span className="section-label">Live Tracking</span>
            <h2 className="section-title mt-3">
              Always Know Where <br />Your Project Stands
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="font-body text-stone-500 text-sm leading-relaxed">
              Real-time SMS, email and dashboard updates from design to installation. No more chasing contractors.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-stone-200" />
            <div className="absolute left-6 top-8 w-0.5 bg-gradient-to-b from-gold-500 to-gold-300 transition-all duration-700"
              style={{ height: `${(stages.filter(s => s.done).length / stages.length) * 100}%` }} />

            <div className="space-y-0">
              {stages.map((s, i) => (
                <div key={i} className={`relative flex gap-5 pb-7 ${i === stages.length - 1 ? 'pb-0' : ''}`}>
                  {/* Node */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${
                    s.done
                      ? 'bg-gold-500 border-gold-500 shadow-lg shadow-gold-500/30'
                      : s.active
                      ? 'bg-white border-navy-700 shadow-lg shadow-navy-700/20 animate-pulse'
                      : 'bg-white border-stone-200'
                  }`}>
                    {s.done
                      ? <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 7l5 5L17 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <span className="text-lg">{s.icon}</span>
                    }
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pt-2 pb-2 px-4 rounded-sm border transition-all duration-300 ${
                    s.active
                      ? 'bg-navy-50 border-navy-200'
                      : s.done
                      ? 'bg-white border-stone-100'
                      : 'bg-white border-stone-100 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-body text-sm font-semibold ${s.done ? 'text-navy-900' : s.active ? 'text-navy-700' : 'text-stone-400'}`}>
                        {s.label}
                        {s.done   && <span className="ml-2 text-gold-500 text-xs">✔</span>}
                        {s.active && <span className="ml-2 text-navy-600 text-xs animate-pulse">● In Progress</span>}
                      </h4>
                      <span className={`font-body text-[10px] font-medium ${s.done ? 'text-gold-600' : 'text-stone-400'}`}>{s.date}</span>
                    </div>
                    <p className="font-body text-xs text-stone-500 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="bg-navy-950 rounded-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-body text-white/50 text-xs tracking-widest uppercase">El Shaddai Dashboard</p>
                <h4 className="font-display text-xl text-white mt-0.5">Project #ES-2024-087</h4>
              </div>
              <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-body text-white/60 text-xs">Overall Progress</span>
                <span className="font-body text-gold-400 text-xs font-semibold">43%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full" style={{ width: '43%' }} />
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Started', val: 'Jun 01' },
                { label: 'Est. Finish', val: 'Jun 22' },
                { label: 'Days Left', val: '10' },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 rounded-sm p-3 text-center">
                  <div className="font-body text-white text-sm font-semibold">{s.val}</div>
                  <div className="font-body text-white/40 text-[10px] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Notification log */}
            <div className="space-y-2.5">
              <p className="font-body text-white/40 text-[10px] tracking-widest uppercase mb-3">Recent Updates</p>
              {[
                { msg: 'Manufacturing 80% complete', time: '2h ago',  color: 'text-gold-400' },
                { msg: 'Material quality check passed', time: '1d ago', color: 'text-green-400' },
                { msg: 'Design approved by client',  time: '10d ago', color: 'text-blue-400' },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between bg-white/3 px-3 py-2 rounded-sm">
                  <span className={`font-body text-xs ${n.color}`}>● {n.msg}</span>
                  <span className="font-body text-white/30 text-[10px]">{n.time}</span>
                </div>
              ))}
            </div>

            <a href="/#contact" className="btn-gold w-full justify-center mt-6 text-xs py-3">
              Track My Project
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
