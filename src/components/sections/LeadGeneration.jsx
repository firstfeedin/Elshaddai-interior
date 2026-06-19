import { useState } from 'react'

const cities = ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Mumbai', 'Pune', 'Delhi NCR', 'Other']
const propertyTypes = ['Apartment', 'Villa', 'Independent House', 'Office', 'Other']
const budgets = ['₹3–5 Lakhs', '₹5–10 Lakhs', '₹10–20 Lakhs', '₹20–50 Lakhs', '₹50 Lakhs+']

export default function LeadGeneration() {
  const [form, setForm]         = useState({ name: '', phone: '', email: '', city: '', propertyType: '', budget: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1800)
  }

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-navy-950 hidden lg:block" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — info */}
          <div>
            <span className="section-label">Free Consultation</span>
            <h2 className="section-title mt-3 mb-5">
              Book Your Free <br />
              <span className="text-gold-gradient font-medium">Design Consultation</span>
            </h2>
            <p className="font-body text-stone-500 text-sm leading-relaxed mb-8 max-w-md">
              Speak directly with one of our senior designers — engineers with 50+ years of combined experience — and get a free design brief and cost estimate for your home.
            </p>

            {/* What you get */}
            <div className="space-y-4 mb-8">
              {[
                { icon: '🎨', title: 'Free AI Design Brief',         desc: 'A tailored design concept for your space, ready in 24 hours.' },
                { icon: '💰', title: 'Accurate Cost Estimate',       desc: 'Detailed BOQ with material and labour breakdowns.' },
                { icon: '👨‍🎨', title: 'Expert Designer Walkthrough', desc: '30-minute video call with a senior designer.' },
                { icon: '📐', title: 'Free Site Measurement',        desc: 'We visit and measure your space at no charge.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-body text-sm font-semibold text-navy-900">{item.title}</p>
                    <p className="font-body text-xs text-stone-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-2 text-sm font-body">
              <a href="mailto:contactus@divinemercyitsol.com" className="flex items-center gap-2 text-stone-600 hover:text-gold-600 transition-colors">
                ✉️ contactus@divinemercyitsol.com
              </a>
              <span className="flex items-center gap-2 text-stone-600">
                🕐 Mon–Sat, 9 AM – 7 PM IST
              </span>
            </div>
          </div>

          {/* Right — form */}
          <div className="relative">
            <div className="bg-white lg:bg-white rounded-sm shadow-2xl shadow-navy-950/10 border border-stone-100 p-8 lg:ml-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gold-400">
                    <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                      <path d="M2 11l8 8L26 2" stroke="#d4941f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl text-navy-950 font-medium mb-2">Consultation Booked!</h3>
                  <p className="font-body text-stone-500 text-sm leading-relaxed">
                    Our senior designer will call you within 2 hours. Check your email for confirmation and your free AI design brief.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-2xl text-navy-950 font-medium mb-6">
                    Get Started Today
                    <span className="block font-body text-sm font-normal text-stone-400 mt-1 tracking-normal">Free · No commitment</span>
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-body font-semibold text-stone-500 tracking-widest uppercase mb-1.5">Full Name *</label>
                        <input required className="input-field" placeholder="Rajesh Kumar" value={form.name} onChange={set('name')} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-body font-semibold text-stone-500 tracking-widest uppercase mb-1.5">Phone *</label>
                        <input required className="input-field" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-body font-semibold text-stone-500 tracking-widest uppercase mb-1.5">Email *</label>
                      <input required className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-[10px] font-body font-semibold text-stone-500 tracking-widest uppercase mb-1.5">City *</label>
                        <select required className="select-field" value={form.city} onChange={set('city')}>
                          <option value="">Select city</option>
                          {cities.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-[2.4rem]">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-[10px] font-body font-semibold text-stone-500 tracking-widest uppercase mb-1.5">Property Type *</label>
                        <select required className="select-field" value={form.propertyType} onChange={set('propertyType')}>
                          <option value="">Select type</option>
                          {propertyTypes.map(p => <option key={p}>{p}</option>)}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-[2.4rem]">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-body font-semibold text-stone-500 tracking-widest uppercase mb-1.5">Budget Range *</label>
                      <select required className="select-field" value={form.budget} onChange={set('budget')}>
                        <option value="">Select budget</option>
                        {budgets.map(b => <option key={b}>{b}</option>)}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-[2.4rem]">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </div>
                    </div>

                    <button type="submit" disabled={loading}
                      className="btn-gold w-full justify-center py-4 text-sm mt-2 disabled:opacity-70">
                      {loading
                        ? <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
                            </svg>
                            Booking your consultation...
                          </span>
                        : '✦ Book Free Consultation'
                      }
                    </button>

                    <p className="font-body text-xs text-stone-400 text-center">
                      By submitting you agree to our <a href="#" className="underline">Privacy Policy</a>. We never spam.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
