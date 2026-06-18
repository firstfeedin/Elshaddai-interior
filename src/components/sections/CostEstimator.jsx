import { useState } from 'react'

const areaOptions    = [600, 800, 1000, 1200, 1500, 2000, 2500, 3000]
const roomOptions    = ['Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom', 'Dining', 'Bathroom', 'Study']
const materialTiers  = [
  { label: 'Economy',   multiplier: 1.0,  desc: 'Good quality laminates & standard fittings' },
  { label: 'Premium',   multiplier: 1.6,  desc: 'High-gloss finishes, branded hardware' },
  { label: 'Luxury',    multiplier: 2.5,  desc: 'Italian marble, imported fittings, custom furniture' },
]

const BASE_RATE = 1200  // ₹ per sq ft at economy tier

function formatInr(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} Lakh${n >= 200000 ? 's' : ''}`
  return `₹${n.toLocaleString('en-IN')}`
}

export default function CostEstimator() {
  const [area, setArea]         = useState(1200)
  const [rooms, setRooms]       = useState(['Living Room', 'Kitchen', 'Master Bedroom'])
  const [tier, setTier]         = useState(0)
  const [custom, setCustom]     = useState('')
  const [showForm, setShowForm] = useState(false)

  const effectiveArea = custom ? parseInt(custom) || area : area
  const roomCount     = rooms.length
  const estimate      = Math.round(effectiveArea * BASE_RATE * materialTiers[tier].multiplier * (1 + roomCount * 0.06))
  const breakdown     = {
    'Design & Planning':    Math.round(estimate * 0.08),
    'Material Cost':        Math.round(estimate * 0.48),
    'Manufacturing':        Math.round(estimate * 0.22),
    'Installation & Labour':Math.round(estimate * 0.16),
    'Project Management':   Math.round(estimate * 0.06),
  }

  const toggleRoom = (r) =>
    setRooms(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])

  return (
    <section id="cost-estimator" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-label">Instant Pricing</span>
          <h2 className="section-title mt-3 mb-4">
            Know Your Budget <br />Before You Begin
          </h2>
          <p className="font-body text-stone-500 text-sm max-w-lg mx-auto leading-relaxed">
            Our AI cost engine — calibrated by 50+ years of project data — gives you an accurate estimate in seconds, not days.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* Controls */}
          <div className="bg-white border border-stone-100 rounded-sm p-8 shadow-sm space-y-8">

            {/* Area slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-body font-semibold text-stone-500 tracking-[0.2em] uppercase">
                  House Area
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" placeholder="Custom"
                    value={custom}
                    onChange={e => setCustom(e.target.value)}
                    className="w-24 text-right text-sm font-body border border-stone-200 rounded-sm px-2 py-1 focus:outline-none focus:border-navy-400"
                  />
                  <span className="text-xs text-stone-400 font-body">sq ft</span>
                </div>
              </div>
              <input type="range" min="600" max="5000" step="100"
                value={custom ? (parseInt(custom) || 600) : area}
                onChange={e => { setCustom(''); setArea(parseInt(e.target.value)) }}
                className="w-full accent-navy-700 cursor-pointer"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-stone-400 font-body">600 sq ft</span>
                <span className="text-xs text-navy-700 font-body font-semibold">{effectiveArea} sq ft</span>
                <span className="text-[10px] text-stone-400 font-body">5000 sq ft</span>
              </div>
            </div>

            {/* Room selector */}
            <div>
              <label className="block text-xs font-body font-semibold text-stone-500 tracking-[0.2em] uppercase mb-3">
                Rooms to Include
              </label>
              <div className="flex flex-wrap gap-2">
                {roomOptions.map(r => (
                  <button key={r} onClick={() => toggleRoom(r)}
                    className={`tag-btn ${rooms.includes(r) ? 'tag-btn-active' : 'tag-btn-inactive'}`}>
                    {rooms.includes(r) && '✓ '}{r}
                  </button>
                ))}
              </div>
            </div>

            {/* Material tier */}
            <div>
              <label className="block text-xs font-body font-semibold text-stone-500 tracking-[0.2em] uppercase mb-3">
                Material Quality
              </label>
              <div className="space-y-2">
                {materialTiers.map((t, i) => (
                  <button key={i} onClick={() => setTier(i)}
                    className={`w-full text-left px-4 py-3 rounded-sm border text-sm font-body transition-all duration-200 ${
                      tier === i
                        ? 'bg-navy-900 border-navy-900 text-white'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-navy-300'
                    }`}>
                    <span className="font-semibold">{t.label}</span>
                    <span className={`block text-xs mt-0.5 ${tier === i ? 'text-white/60' : 'text-stone-400'}`}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result panel */}
          <div className="space-y-5">
            {/* Main estimate */}
            <div className="bg-navy-950 rounded-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
              <p className="font-body text-white/50 text-xs tracking-[0.25em] uppercase mb-2">Estimated Project Cost</p>
              <div className="font-display text-6xl lg:text-7xl text-gold-400 font-light my-4">
                {formatInr(estimate)}
              </div>
              <p className="font-body text-white/40 text-xs mb-6">
                {materialTiers[tier].label} finish · {effectiveArea} sq ft · {rooms.length} room{rooms.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowForm(true)} className="btn-gold text-xs px-6 py-3">
                  Get Exact Quote
                </button>
                <a href="#design-wizard" className="btn-outline-light text-xs px-6 py-3">
                  Design First
                </a>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white border border-stone-100 rounded-sm p-6 shadow-sm">
              <h3 className="font-display text-lg text-navy-950 font-medium mb-4">Cost Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(breakdown).map(([label, val]) => {
                  const pct = Math.round((val / estimate) * 100)
                  return (
                    <div key={label}>
                      <div className="flex justify-between mb-1">
                        <span className="font-body text-xs text-stone-600">{label}</span>
                        <span className="font-body text-xs font-semibold text-navy-800">{formatInr(val)}</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-navy-700 to-gold-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100 flex justify-between">
                <span className="font-body text-xs font-semibold text-stone-700">Total Estimate</span>
                <span className="font-body text-sm font-bold text-navy-900">{formatInr(estimate)}</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="font-body text-xs text-stone-400 text-center leading-relaxed">
              ± 10% variance based on site conditions. Exact quote after site visit by our engineering team.
            </p>
          </div>
        </div>

        {/* Quick form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-sm p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-display text-2xl text-navy-950 mb-1">Get Your Exact Quote</h3>
              <p className="font-body text-stone-400 text-sm mb-6">
                Estimate: <strong className="text-gold-600">{formatInr(estimate)}</strong>. Our team will call within 2 hours.
              </p>
              <div className="space-y-4">
                <input className="input-field" placeholder="Your Name" />
                <input className="input-field" placeholder="+91 Phone Number" type="tel" />
                <input className="input-field" placeholder="City" />
                <button className="btn-gold w-full justify-center py-4" onClick={() => setShowForm(false)}>
                  Book Free Site Visit
                </button>
              </div>
              <button className="absolute top-4 right-5 text-stone-400 hover:text-stone-600 text-xl" onClick={() => setShowForm(false)}>×</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
