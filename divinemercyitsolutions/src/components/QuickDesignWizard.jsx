import { useState } from 'react'

const options = {
  propertyType: ['Apartment', 'Villa', 'Independent House', 'Office'],
  area:         ['800 sq ft', '1200 sq ft', '1500 sq ft', '2000 sq ft', '2500+ sq ft'],
  rooms:        ['Living Room', 'Kitchen', 'Bedroom', 'Dining', 'Master Bedroom', 'Kids Room'],
  budget:       ['₹3 Lakhs', '₹5 Lakhs', '₹10 Lakhs', '₹20 Lakhs', '₹20 Lakhs+'],
  style:        ['Modern', 'Luxury', 'Minimal', 'Scandinavian', 'Contemporary', 'Classic'],
}

/* Design images keyed by style */
const styleImages = {
  Modern:        'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=80',
  Luxury:        'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=900&q=80',
  Minimal:       'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
  Scandinavian:  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80',
  Contemporary:  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80',
  Classic:       'https://images.unsplash.com/photo-1593476087123-36d1de271f08?auto=format&fit=crop&w=900&q=80',
}

const materialMap = {
  Modern:       [{ name:'Matte White',   hex:'#F5F5F0' },{ name:'Graphite',     hex:'#4A4A4A' },{ name:'Chrome Steel',hex:'#B8B8C0' },{ name:'Light Oak',   hex:'#C4A97D' }],
  Luxury:       [{ name:'Italian Marble',hex:'#EDE8E0' },{ name:'Deep Navy',    hex:'#1E3A5F' },{ name:'Brushed Gold',hex:'#D4941F' },{ name:'Ivory Silk',  hex:'#FDF8F0' }],
  Minimal:      [{ name:'Warm White',    hex:'#FAFAF8' },{ name:'Stone Grey',   hex:'#9E9E9E' },{ name:'Natural Linen',hex:'#D4C4A8' },{ name:'Birch Wood',  hex:'#C8B89A' }],
  Scandinavian: [{ name:'Snow White',    hex:'#FFFFFF' },{ name:'Pine Wood',    hex:'#8B6343' },{ name:'Sage Green',  hex:'#8FAF8A' },{ name:'Warm Beige',  hex:'#E8DDD0' }],
  Contemporary: [{ name:'Charcoal',      hex:'#2D2D2D' },{ name:'Warm Taupe',   hex:'#B8A898' },{ name:'Terracotta',  hex:'#C4704A' },{ name:'Cream',       hex:'#F5F0E8' }],
  Classic:      [{ name:'Walnut Wood',   hex:'#6B4226' },{ name:'Forest Green', hex:'#2D5016' },{ name:'Antique Gold',hex:'#B8860B' },{ name:'Cream',       hex:'#FFFFF0' }],
}

const budgetCost = {
  '₹3 Lakhs': '₹2.8 – 3.2 Lakhs',
  '₹5 Lakhs': '₹4.6 – 5.4 Lakhs',
  '₹10 Lakhs':'₹9.2 – 10.8 Lakhs',
  '₹20 Lakhs':'₹18.5 – 21.5 Lakhs',
  '₹20 Lakhs+':'₹22 – 30 Lakhs',
}

/* ─── Sub-component: Option group ─────────────────────────────── */
function OptionGroup({ label, choices, selected, multi, onSelect, error }) {
  const toggle = (val) => {
    if (multi) {
      const next = selected.includes(val)
        ? selected.filter(v => v !== val)
        : [...selected, val]
      onSelect(next)
    } else {
      onSelect(val === selected ? '' : val)
    }
  }
  const isActive = (val) => multi ? (selected || []).includes(val) : selected === val

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-xs font-body font-bold text-stone-500 tracking-[0.2em] uppercase">
          {label}
          {multi && <span className="text-gold-500 normal-case tracking-normal font-normal ml-1">(pick all that apply)</span>}
        </label>
        {error && <span className="text-red-500 text-[10px] font-body font-semibold">Required ↑</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {choices.map(c => (
          <button key={c} type="button" onClick={() => toggle(c)}
            className={`tag-btn ${isActive(c) ? 'tag-btn-active' : 'tag-btn-inactive'}`}>
            {isActive(c) && <span className="mr-1">✓</span>}
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Sub-component: Design Result ────────────────────────────── */
function DesignResult({ form, onReset }) {
  const style    = form.style
  const img      = styleImages[style] || styleImages['Modern']
  const mats     = materialMap[style] || materialMap['Modern']
  const costRange= budgetCost[form.budget] || form.budget
  const projectId= `ES-${Math.floor(Math.random()*90000)+10000}`

  const boqItems = [
    { item: form.rooms.includes('Living Room') ? 'Living Room Package'     : null, qty: 1,  unit: 'Pkg',  rate: '₹1,20,000' },
    { item: form.rooms.includes('Kitchen')     ? 'Modular Kitchen Package'  : null, qty: 1,  unit: 'Pkg',  rate: '₹85,000'  },
    { item: form.rooms.includes('Bedroom')     ? 'Bedroom Package'          : null, qty: form.rooms.filter(r=>r.includes('Bedroom')).length, unit:'Pkg', rate:'₹65,000' },
    { item: 'False Ceiling (POP)',  qty: 120, unit: 'sqft', rate: '₹95' },
    { item: 'Electrical & Lighting', qty: 1, unit: 'Lump', rate: '₹45,000' },
    { item: 'Design & Project Mgmt', qty: 1, unit: 'Lump', rate: '₹35,000' },
  ].filter(r => r.item)

  return (
    <div className="bg-white rounded-sm shadow-2xl shadow-navy-900/20 overflow-hidden">

      {/* ── Success header ── */}
      <div className="bg-gradient-to-r from-navy-950 to-navy-800 px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            <span className="font-body text-xs text-gold-400 tracking-widest uppercase font-semibold">AI Design Generated</span>
          </div>
          <h3 className="font-display text-xl text-white font-light">
            Your {style} Design Brief
          </h3>
          <p className="font-body text-white/50 text-xs mt-0.5">Project Ref: {projectId}</p>
        </div>
        <button onClick={onReset}
          className="text-white/40 hover:text-white/80 text-xs font-body underline transition-colors">
          ← Redesign
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* ── 3D Design Preview ── */}
        <div>
          <p className="text-[10px] font-body font-bold text-stone-400 tracking-[0.25em] uppercase mb-2">AI-Generated 3D Concept</p>
          <div className="relative rounded-sm overflow-hidden h-52 group">
            <img src={img} alt={`${style} design`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-gold-500 text-white text-[10px] font-body font-bold px-2.5 py-1 rounded-sm">✦ {style}</span>
              <span className="bg-navy-900/80 text-white text-[10px] font-body px-2.5 py-1 rounded-sm backdrop-blur-sm">{form.area}</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-body text-white text-xs font-semibold">{form.propertyType} — {form.rooms.slice(0,3).join(', ')}{form.rooms.length > 3 ? ` +${form.rooms.length-3} more` : ''}</p>
              <p className="font-body text-white/60 text-[10px] mt-0.5">Reviewed by Senior Designer · El Shaddai Engineering Team</p>
            </div>
            {/* Corner watermark */}
            <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-sm border border-white/20">
              <p className="font-body text-white text-[9px] font-semibold tracking-wide">EL SHADDAI AI</p>
            </div>
          </div>
        </div>

        {/* ── Project Summary ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Property Type', value: form.propertyType },
            { label: 'Total Area',    value: form.area },
            { label: 'Design Style',  value: form.style },
            { label: 'Budget Range',  value: form.budget },
          ].map((s, i) => (
            <div key={i} className="bg-stone-50 border border-stone-100 rounded-sm px-4 py-3">
              <p className="font-body text-[10px] text-stone-400 tracking-widest uppercase">{s.label}</p>
              <p className="font-body text-sm font-bold text-navy-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Rooms included ── */}
        <div>
          <p className="text-[10px] font-body font-bold text-stone-400 tracking-[0.25em] uppercase mb-2">Rooms Covered</p>
          <div className="flex flex-wrap gap-2">
            {form.rooms.map((r, i) => (
              <span key={i} className="bg-navy-50 text-navy-800 border border-navy-100 text-xs font-body font-semibold px-3 py-1 rounded-sm">
                ✓ {r}
              </span>
            ))}
          </div>
        </div>

        {/* ── Material Palette ── */}
        <div>
          <p className="text-[10px] font-body font-bold text-stone-400 tracking-[0.25em] uppercase mb-2">AI-Selected Material Palette</p>
          <div className="flex gap-3">
            {mats.map((m, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="h-10 rounded-sm border border-stone-200 mb-1.5 shadow-sm" style={{ backgroundColor: m.hex }} />
                <p className="font-body text-[9px] text-stone-500 leading-tight">{m.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cost Estimate ── */}
        <div className="bg-navy-950 rounded-sm px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-body text-white/50 text-[10px] tracking-widest uppercase">Estimated Project Cost</p>
            <p className="font-display text-2xl text-gold-400 font-light mt-0.5">{costRange}</p>
            <p className="font-body text-white/40 text-[10px] mt-0.5">± 10% after site measurement</p>
          </div>
          <div className="text-right">
            <p className="font-body text-white/50 text-[10px] tracking-widest uppercase">Timeline</p>
            <p className="font-body text-white text-sm font-bold mt-0.5">4 – 6 Weeks</p>
            <p className="font-body text-white/40 text-[10px]">Design to Handover</p>
          </div>
        </div>

        {/* ── BOQ Preview ── */}
        <div>
          <p className="text-[10px] font-body font-bold text-stone-400 tracking-[0.25em] uppercase mb-2">Bill of Quantities (Preview)</p>
          <div className="border border-stone-100 rounded-sm overflow-hidden">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-3 py-2 text-stone-500 font-semibold tracking-wide">Item</th>
                  <th className="text-center px-2 py-2 text-stone-500 font-semibold">Qty</th>
                  <th className="text-center px-2 py-2 text-stone-500 font-semibold">Unit</th>
                  <th className="text-right px-3 py-2 text-stone-500 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody>
                {boqItems.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                    <td className="px-3 py-2 text-stone-700">{r.item}</td>
                    <td className="px-2 py-2 text-center text-stone-600">{r.qty}</td>
                    <td className="px-2 py-2 text-center text-stone-500">{r.unit}</td>
                    <td className="px-3 py-2 text-right text-navy-800 font-semibold">{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-navy-50 border-t border-navy-100 px-3 py-2 flex justify-between">
              <span className="font-body text-xs font-bold text-navy-800">Full BOQ available after consultation</span>
              <span className="font-body text-xs font-bold text-gold-600">{costRange}</span>
            </div>
          </div>
        </div>

        {/* ── Designer assigned ── */}
        <div className="flex items-center gap-4 p-4 border border-gold-200 bg-gold-50 rounded-sm">
          <img src="https://i.pravatar.cc/60?img=12" alt="Designer" className="w-12 h-12 rounded-full object-cover border-2 border-gold-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-body text-xs text-gold-700 font-bold tracking-wide uppercase">Your Assigned Designer</p>
            <p className="font-body text-sm font-bold text-navy-900 mt-0.5">Ar. Suresh Venkatraman</p>
            <p className="font-body text-xs text-stone-500">28 yrs experience · Specialised in {style} Interiors</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-body text-[10px] text-stone-400 uppercase tracking-wide">Will call in</p>
            <p className="font-body text-sm font-bold text-navy-900">2 Hours</p>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="flex flex-col gap-3 pt-1">
          <a href="#contact" className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-white font-body font-bold text-sm rounded-sm text-center transition-colors duration-200 shadow-lg shadow-gold-500/30">
            ✦ Book Free Site Visit & Exact Quote
          </a>
          <div className="flex gap-3">
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
              className="flex-1 py-3 border border-stone-200 rounded-sm text-xs font-body font-semibold text-stone-600 text-center hover:bg-stone-50 transition-colors">
              💬 WhatsApp Designer
            </a>
            <button onClick={onReset}
              className="flex-1 py-3 border border-stone-200 rounded-sm text-xs font-body font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
              ↺ Try Different Style
            </button>
          </div>
        </div>

        <p className="text-center font-body text-[10px] text-stone-400">
          Design brief valid for 7 days · Project Ref: {projectId}
        </p>
      </div>
    </div>
  )
}

/* ─── Main Wizard Component ────────────────────────────────────── */
export default function QuickDesignWizard() {
  const [form, setForm] = useState({
    propertyType: '',
    area:         '',
    rooms:        [],
    budget:       '',
    style:        '',
    name:         '',
    phone:        '',
  })
  const [errors, setErrors]     = useState({})
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)

  const setField = (key) => (val) => setForm(p => ({ ...p, [key]: val }))
  // rooms uses direct array value from OptionGroup toggle
  const setRooms = (val) => setForm(p => ({ ...p, rooms: val }))

  /* Validate every field */
  const validate = () => {
    const e = {}
    if (!form.propertyType)     e.propertyType = true
    if (!form.area)             e.area = true
    if (!form.rooms.length)     e.rooms = true
    if (!form.budget)           e.budget = true
    if (!form.style)            e.style = true
    if (!form.name.trim())      e.name = true
    if (!form.phone.trim())     e.phone = true
    return e
  }

  const allFilled =
    form.propertyType && form.area && form.rooms.length &&
    form.budget && form.style && form.name.trim() && form.phone.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setLoading(true)
    setTimeout(() => { setLoading(false); setResult(form) }, 2800)
  }

  if (result) {
    return (
      <section id="design-wizard" className="py-16 bg-navy-950">
        <div className="max-w-2xl mx-auto px-6">
          <DesignResult form={result} onReset={() => { setResult(null); setForm({ propertyType:'', area:'', rooms:[], budget:'', style:'', name:'', phone:'' }) }} />
        </div>
      </section>
    )
  }

  return (
    <section id="design-wizard" className="py-0 bg-navy-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy-700/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* Left — copy */}
          <div className="lg:pt-6">
            <span className="section-label">Quick Design Wizard</span>
            <h2 className="font-display text-5xl lg:text-6xl font-light text-white leading-tight mt-3 mb-5">
              Tell Us Your <br />
              <span className="text-gold-gradient font-medium">Dream Space</span>
            </h2>
            <p className="font-body text-white/60 text-base leading-relaxed mb-8 max-w-md">
              Fill all 7 fields and our AI — guided by 50+ years of engineering expertise — generates your personalised 3D design concept instantly.
            </p>

            {[
              'Instant AI 3D Design Concept',
              'Accurate Cost Estimate in ₹',
              'Material Palette & BOQ Preview',
              'Expert Designer Review (50+ yrs exp.)',
              'No commitment required',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#d4941f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-body text-sm text-white/70">{f}</span>
              </div>
            ))}

            {/* Progress tracker */}
            <div className="mt-10 p-5 border border-white/10 rounded-sm bg-white/3">
              <p className="font-body text-white/50 text-[10px] tracking-widest uppercase mb-3">Fields Completed</p>
              <div className="flex gap-1.5 mb-2">
                {['propertyType','area','rooms','budget','style','name','phone'].map((k, i) => {
                  const done = k === 'rooms' ? form.rooms.length > 0 : !!form[k].trim?.() || !!form[k]
                  return <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${done ? 'bg-gold-400' : 'bg-white/15'}`} />
                })}
              </div>
              <p className="font-body text-white/40 text-[10px]">
                {['propertyType','area','rooms','budget','style','name','phone'].filter(k => k==='rooms' ? form.rooms.length>0 : !!form[k]).length} / 7 complete
              </p>
            </div>

            <div className="mt-6 p-5 border border-gold-500/20 rounded-sm bg-gold-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3 6.3L22 9.3l-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8L2 9.3l7-1z" fill="#d4941f"/>
                  </svg>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-white">50+ Years Combined Expertise</p>
                  <p className="font-body text-xs text-white/50">Every design reviewed by our senior engineering team before delivery.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-sm p-8 shadow-2xl shadow-navy-950/50">
            <h3 className="font-display text-2xl text-navy-950 font-medium mb-1">
              Generate Your AI Design
            </h3>
            <p className="font-body text-xs text-stone-400 mb-6">All 7 fields required — Free · Takes 2 minutes</p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              <OptionGroup label="1. Property Type" choices={options.propertyType}
                selected={form.propertyType} onSelect={setField('propertyType')} error={errors.propertyType} />

              <OptionGroup label="2. Area" choices={options.area}
                selected={form.area} onSelect={setField('area')} error={errors.area} />

              <OptionGroup label="3. Rooms to Design" choices={options.rooms}
                selected={form.rooms} multi onSelect={setRooms} error={errors.rooms} />

              <OptionGroup label="4. Budget" choices={options.budget}
                selected={form.budget} onSelect={setField('budget')} error={errors.budget} />

              <OptionGroup label="5. Design Style" choices={options.style}
                selected={form.style} onSelect={setField('style')} error={errors.style} />

              {/* Contact fields */}
              <div className="pt-3 border-t border-stone-100 space-y-4">
                <p className="font-body text-xs font-bold text-stone-500 tracking-[0.2em] uppercase">6 & 7. Your Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-body font-semibold text-stone-500 tracking-widest uppercase mb-1.5">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      className={`input-field ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
                      placeholder="Rajesh Kumar"
                      value={form.name}
                      onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: false })) }}
                    />
                    {errors.name && <p className="text-red-500 text-[10px] mt-1 font-body">Please enter your name</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-body font-semibold text-stone-500 tracking-widest uppercase mb-1.5">
                      Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                      className={`input-field ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}
                      placeholder="+91 98765 43210"
                      type="tel"
                      value={form.phone}
                      onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: false })) }}
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-body">Please enter your phone</p>}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                {!allFilled && (
                  <p className="text-center font-body text-xs text-stone-400 mb-3">
                    Complete all {7 - ['propertyType','area','rooms','budget','style','name','phone'].filter(k => k==='rooms'?form.rooms.length>0:!!form[k]).length} remaining field{7-['propertyType','area','rooms','budget','style','name','phone'].filter(k=>k==='rooms'?form.rooms.length>0:!!form[k]).length!==1?'s':''} to unlock
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-sm font-body font-bold text-sm tracking-wide transition-all duration-300 ${
                    allFilled && !loading
                      ? 'bg-gold-500 text-white hover:bg-gold-600 shadow-lg shadow-gold-500/30 cursor-pointer'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
                      </svg>
                      AI Generating Your 3D Design...
                    </span>
                  ) : allFilled
                    ? '✦ Generate My AI Design — Free'
                    : '✦ Generate AI Design (Complete All Fields)'
                  }
                </button>
              </div>

              <p className="text-center font-body text-xs text-stone-400">
                No credit card · No spam · 100% free design brief
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  )
}
