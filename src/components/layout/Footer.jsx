import { useState } from 'react'

const quickLinks = [
  { label: 'About Us',     href: '#about' },
  { label: 'Services',     href: '#services' },
  { label: 'Portfolio',    href: '#portfolio' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Cost Estimator', href: '#cost-estimator' },
  { label: 'Contact',      href: '#contact' },
]

const legalLinks = [
  { label: 'Privacy Policy',   href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Refund Policy',    href: '/refund-policy' },
  { label: 'Careers',          href: 'mailto:contactus@divinemercyitsol.com?subject=Career Enquiry — El Shaddai' },
]

const cities = ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Kukatpally']

const services = [
  'Modular Kitchen', 'Wardrobe & Storage', 'Living Room', 'Bedroom Design',
  'False Ceiling', 'Flooring', 'Pooja Room', 'Kids Room',
  'Bathroom Design', 'Home Office', 'Commercial Interiors', 'Turnkey Execution',
]

export default function Footer() {
  const year = new Date().getFullYear()
  const [form, setForm]       = useState({ name: '', email: '', message: '' })
  const [sent, setSent]       = useState(false)
  const [busy, setBusy]       = useState(false)
  const [subEmail, setSubEmail]   = useState('')
  const [subSent, setSubSent]     = useState(false)
  const [subBusy, setSubBusy]     = useState(false)

  async function handleSubscribe(e) {
    e.preventDefault()
    if (!subEmail) return
    setSubBusy(true)
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      })
    } catch {}
    setSubSent(true)
    setSubBusy(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '20e5a729-9a98-4234-b88a-470634b6d474',
          subject:    `New Enquiry from ${form.name} — El Shaddai Interiors`,
          from_name:  'El Shaddai Website',
          reply_to:   form.email,
          name:       form.name,
          email:      form.email,
          message:    form.message,
        }),
      })
    } catch {}
    setSent(true)
    setBusy(false)
  }

  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gold-500 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/>
                  <circle cx="10" cy="8" r="2" fill="#0f1c5c"/>
                </svg>
              </div>
              <div>
                <span className="block font-display text-lg font-semibold text-white">El Shaddai</span>
                <span className="block font-body text-[9px] tracking-[0.25em] uppercase text-gold-400">Interiors &amp; Design</span>
              </div>
            </div>
            <p className="font-body text-white/50 text-xs leading-relaxed mb-5">
              AI-powered interior design platform backed by engineering expertise. Design, manufacture and install — all under one roof.
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'f',  label: 'Facebook',  href: 'https://www.facebook.com/elshaddaiinteriors' },
                { icon: 'in', label: 'LinkedIn',  href: 'https://www.linkedin.com/company/elshaddaiinteriors' },
                { icon: '▶',  label: 'YouTube',   href: 'https://www.youtube.com/@elshaddaiinteriors' },
                { icon: '📸', label: 'Instagram', href: 'https://www.instagram.com/elshaddaiinteriors' },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-8 h-8 rounded-sm bg-white/8 hover:bg-gold-500 flex items-center justify-center text-white/60 hover:text-white text-[11px] font-body font-bold transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mb-5">Quick Links</p>
            <ul className="space-y-2.5">
              {quickLinks.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="font-body text-sm text-white/55 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2">
                    <span className="text-gold-500/40 text-[10px]">→</span> {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mt-8 mb-5">Our Services</p>
            <ul className="space-y-2">
              {services.map(s => (
                <li key={s}>
                  <a href="/#services" className="font-body text-xs text-white/45 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2">
                    <span className="text-gold-500/30 text-[9px]">→</span> {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mb-5">Get In Touch</p>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="mailto:contactus@divinemercyitsol.com" className="font-body text-sm text-white/55 hover:text-gold-400 transition-colors flex items-center gap-2">
                  ✉️ contactus@divinemercyitsol.com
                </a>
              </li>
              <li className="font-body text-sm text-white/55 flex items-start gap-2">
                📍 Hyderabad, Telangana, India
              </li>
              <li className="font-body text-xs text-white/40">Mon–Sat · 9 AM – 7 PM IST</li>
            </ul>
            <p className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-2">We Serve</p>
            <div className="flex flex-wrap gap-1.5">
              {cities.map(c => (
                <span key={c} className="text-[10px] font-body text-white/40 bg-white/5 px-2 py-0.5 rounded-sm border border-white/8">{c}</span>
              ))}
            </div>
          </div>

          {/* Mini contact form */}
          <div>
            <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mb-5">Send Us a Message</p>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-2xl mb-2">✅</div>
                <p className="font-body text-white/70 text-sm">Message sent!</p>
                <p className="font-body text-white/40 text-xs mt-1">We'll get back to you shortly.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}
                  className="mt-4 font-body text-[10px] text-gold-400 hover:text-gold-300 tracking-widest uppercase transition-colors">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text" placeholder="Your Name" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-xs font-body bg-white/8 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-gold-400 transition-colors"
                />
                <input
                  type="email" placeholder="Your Email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 text-xs font-body bg-white/8 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-gold-400 transition-colors"
                />
                <textarea
                  placeholder="Your Message" required rows={4} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2.5 text-xs font-body bg-white/8 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                />
                <button type="submit" disabled={busy}
                  className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white font-body font-semibold text-xs py-3 tracking-widest uppercase transition-colors duration-200">
                  {busy ? 'Sending…' : 'Send Message →'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/8 pt-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-display text-lg text-white font-light">Get Design Inspiration in Your Inbox</p>
              <p className="font-body text-white/40 text-xs mt-0.5">Monthly Hyderabad project showcases, Vastu tips & exclusive offers.</p>
            </div>
            {subSent ? (
              <p className="font-body text-gold-400 text-sm font-medium">✓ Subscribed! Check your inbox.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-0">
                <input
                  type="email" placeholder="your@email.com" required value={subEmail}
                  onChange={e => setSubEmail(e.target.value)}
                  className="flex-1 lg:w-64 px-4 py-2.5 text-sm font-body bg-white/8 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-gold-400"
                />
                <button type="submit" disabled={subBusy}
                  className="bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white font-body font-semibold text-xs px-5 py-2.5 transition-colors duration-200 flex-shrink-0">
                  {subBusy ? '…' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-white/35 text-xs">
            © {year} El Shaddai Interiors &amp; Design Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5">
            {legalLinks.map(l => (
              <a key={l.label} href={l.href} className="font-body text-white/35 text-xs hover:text-white/60 transition-colors">{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
