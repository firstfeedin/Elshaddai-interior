const quickLinks = [
  { label: 'About Us',     href: '#about' },
  { label: 'Services',     href: '#services' },
  { label: 'Portfolio',    href: '#portfolio' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Cost Estimator', href: '#cost-estimator' },
  { label: 'Contact',      href: '#contact' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Refund Policy',   href: '#' },
  { label: 'Careers',         href: '#' },
]

const cities = ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Mumbai', 'Pune', 'Delhi NCR']

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 text-white">

      {/* Main footer body */}
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
              AI-powered interior design platform backed by 50+ years of engineering expertise. Design, manufacture and install — all under one roof.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { icon: 'f', label: 'Facebook' },
                { icon: 'in', label: 'LinkedIn' },
                { icon: '▶', label: 'YouTube' },
                { icon: '📸', label: 'Instagram' },
              ].map((s, i) => (
                <a key={i} href="#" aria-label={s.label}
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
          </div>

          {/* Services */}
          <div>
            <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mb-5">Our Services</p>
            <ul className="space-y-2.5">
              {['Modular Kitchen', 'Wardrobes', 'TV Units', 'False Ceiling', 'Living Room', 'Bedroom', 'Full Home Interiors'].map(s => (
                <li key={s}>
                  <a href="#services" className="font-body text-sm text-white/55 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2">
                    <span className="text-gold-500/40 text-[10px]">→</span> {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Cities */}
          <div>
            <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mb-5">Get In Touch</p>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="tel:+919876543210" className="font-body text-sm text-white/55 hover:text-gold-400 transition-colors flex items-center gap-2">
                  📞 +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:contactus@divinemercyitsol.com" className="font-body text-sm text-white/55 hover:text-gold-400 transition-colors flex items-center gap-2">
                  ✉️ contactus@divinemercyitsol.com
                </a>
              </li>
              <li className="font-body text-sm text-white/55 flex items-start gap-2">
                📍 Plot 42, Jubilee Hills Road No. 36,<br />Hyderabad — 500033, Telangana
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
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/8 pt-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-display text-lg text-white font-light">Get Design Inspiration in Your Inbox</p>
              <p className="font-body text-white/40 text-xs mt-0.5">Monthly project showcases, design tips and exclusive offers.</p>
            </div>
            <div className="flex w-full lg:w-auto gap-0">
              <input type="email" placeholder="your@email.com"
                className="flex-1 lg:w-64 px-4 py-2.5 text-sm font-body bg-white/8 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-gold-400 rounded-l-sm" />
              <button className="bg-gold-500 hover:bg-gold-600 text-white font-body font-semibold text-xs px-5 py-2.5 transition-colors duration-200 rounded-r-sm flex-shrink-0">
                Subscribe
              </button>
            </div>
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
