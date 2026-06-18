const items = [
  '✦ 50+ Years Engineering Expertise',
  '✦ AI-Powered 3D Design',
  '✦ 2400+ Projects Delivered',
  '✦ End-to-End Manufacturing',
  '✦ On-Site Installation',
  '✦ Real-Time Project Tracking',
  '✦ 98% Client Satisfaction',
  '✦ Warranty on All Work',
  '✦ 15 Cities Across India',
  '✦ Instant BOQ Generation',
]

export default function TrustTicker() {
  const doubled = [...items, ...items]
  return (
    <div className="bg-navy-950 py-3 overflow-hidden border-y border-gold-500/20">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-block px-8 font-body text-xs tracking-[0.2em] text-white/70 uppercase">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
