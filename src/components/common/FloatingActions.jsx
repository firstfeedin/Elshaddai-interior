import { useState, useEffect } from 'react'

export default function FloatingActions() {
  const [visible, setVisible]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Desktop / tablet floating cluster — bottom-right */}
      <div className={`fixed bottom-8 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>

        {/* Expandable sub-actions */}
        <div className={`flex flex-col items-end gap-2.5 transition-all duration-300 ${expanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

          {/* WhatsApp */}
          <a href="https://wa.me/919876543210?text=Hi%20El%20Shaddai%2C%20I%27m%20interested%20in%20interior%20design%20for%20my%20home."
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white shadow-xl shadow-black/15 border border-stone-100 rounded-full pl-4 pr-5 py-2.5 hover:shadow-2xl transition-all duration-200 group">
            <span className="text-xl">💬</span>
            <span className="font-body text-sm font-semibold text-stone-700 group-hover:text-green-600">WhatsApp Us</span>
          </a>

          {/* Call */}
          <a href="tel:+919876543210"
            className="flex items-center gap-3 bg-white shadow-xl shadow-black/15 border border-stone-100 rounded-full pl-4 pr-5 py-2.5 hover:shadow-2xl transition-all duration-200 group">
            <span className="text-xl">📞</span>
            <span className="font-body text-sm font-semibold text-stone-700 group-hover:text-navy-700">+91 98765 43210</span>
          </a>

          {/* Start Designing */}
          <a href="#design-wizard"
            className="flex items-center gap-3 bg-gold-500 shadow-xl shadow-gold-500/30 rounded-full pl-4 pr-5 py-2.5 hover:bg-gold-600 hover:shadow-2xl transition-all duration-200">
            <span className="text-xl">✦</span>
            <span className="font-body text-sm font-semibold text-white">Start Free Design</span>
          </a>
        </div>

        {/* Main toggle button */}
        <button onClick={() => setExpanded(p => !p)}
          className={`w-14 h-14 rounded-full shadow-2xl shadow-navy-900/30 flex items-center justify-center transition-all duration-300 ${expanded ? 'bg-stone-700 rotate-45' : 'bg-navy-900 hover:bg-navy-700'}`}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 4v14M4 11h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-all duration-500 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white border-t border-stone-200 shadow-2xl px-4 py-3 flex gap-2">
          <a href="tel:+919876543210"
            className="flex-1 flex items-center justify-center gap-2 border border-stone-300 rounded-sm py-3 text-xs font-body font-semibold text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors">
            📞 Call Now
          </a>
          <a href="https://wa.me/919876543210?text=Hi%20El%20Shaddai%2C%20I%27m%20interested%20in%20interior%20design."
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 border border-stone-300 rounded-sm py-3 text-xs font-body font-semibold text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors">
            💬 WhatsApp
          </a>
          <a href="#design-wizard"
            className="flex-[1.5] flex items-center justify-center gap-1.5 bg-gold-500 text-white rounded-sm py-3 text-xs font-body font-bold hover:bg-gold-600 active:bg-gold-700 transition-colors">
            ✦ Start Design
          </a>
        </div>
        {/* Safe area padding for phones with home indicator */}
        <div className="h-safe bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    </>
  )
}
