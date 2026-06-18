import { useState, useEffect } from 'react'

const stats = [
  { value: '50+', label: 'Years Engineering Expertise' },
  { value: '2400+', label: 'Projects Delivered' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '15', label: 'Cities Served' },
]

const slides = [
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=80',
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="home" className="relative h-screen min-h-[680px] overflow-hidden">

      {/* Slideshow Background */}
      {slides.map((src, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
          <img src={src} alt="Interior" className="w-full h-full object-cover" />
        </div>
      ))}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/92 via-navy-950/70 to-navy-950/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-0.5 transition-all duration-500 ${i === current ? 'bg-gold-400 w-8' : 'bg-white/30 w-4'}`} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-16 max-w-7xl mx-auto">

        {/* Trust badge */}
        <div className="opacity-0 animate-fade-in delay-100 mb-6 flex items-center gap-3">
          <div className="w-8 h-0.5 bg-gold-400" />
          <span className="text-gold-400 font-body text-xs tracking-[0.3em] uppercase font-semibold">
            50+ Years of Engineering Excellence
          </span>
        </div>

        {/* Headline */}
        <div className="opacity-0 animate-fade-up delay-200 mb-4">
          <h1 className="font-display text-5xl lg:text-7xl xl:text-8xl font-light text-white leading-[0.95] tracking-tight max-w-3xl">
            Design Your
            <span className="block text-gold-gradient font-medium">Dream Home</span>
            with AI
          </h1>
        </div>

        {/* Subheadline */}
        <div className="opacity-0 animate-fade-up delay-300 mb-8">
          <p className="text-white/70 font-body text-base lg:text-lg max-w-xl leading-relaxed">
            Get AI-generated 3D Designs, Instant Cost Estimates,
            <br className="hidden lg:block" />
            Manufacturing & Installation — all in one platform.
          </p>
        </div>

        {/* CTAs */}
        <div className="opacity-0 animate-fade-up delay-400 flex flex-wrap items-center gap-4 mb-14">
          <a href="#design-wizard" className="btn-gold text-sm px-8 py-4">
            ✦ Start Free Design
          </a>
          <button onClick={() => setShowVideo(true)}
            className="btn-outline-light text-sm px-8 py-4 gap-3">
            <span className="w-7 h-7 rounded-full border border-white/60 flex items-center justify-center">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M0 0l10 6-10 6V0z"/></svg>
            </span>
            Watch Demo
          </button>
        </div>

        {/* Stats bar */}
        <div className="opacity-0 animate-fade-up delay-600">
          <div className="flex flex-wrap gap-8 lg:gap-12">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-display text-3xl lg:text-4xl font-light text-gold-400">{s.value}</span>
                <span className="font-body text-[11px] text-white/55 tracking-wide mt-0.5 uppercase">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 right-10 hidden lg:flex flex-col items-center gap-2 opacity-0 animate-fade-in delay-800">
        <div className="w-px h-12 bg-white/25 animate-pulse" />
        <span className="text-white/40 font-body text-[9px] tracking-[0.4em] uppercase">Scroll</span>
      </div>

      {/* Video modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="bg-navy-950 rounded-sm w-full max-w-3xl aspect-video flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <div className="text-center text-white/60">
              <div className="w-20 h-20 rounded-full border-2 border-gold-400 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="28" viewBox="0 0 24 28" fill="#d4941f"><path d="M0 0l24 14L0 28V0z"/></svg>
              </div>
              <p className="font-body text-sm">El Shaddai — AI Design Platform Demo</p>
              <p className="font-body text-xs text-white/40 mt-1">Video coming soon</p>
            </div>
          </div>
          <button onClick={() => setShowVideo(false)} className="absolute top-6 right-8 text-white/60 hover:text-white text-3xl">×</button>
        </div>
      )}
    </section>
  )
}
