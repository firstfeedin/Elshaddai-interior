const features = [
  {
    icon: '🎨',
    title: 'AI Design Generation',
    desc: 'Describe your space and AI instantly creates multiple 3D design concepts — room layout, colour palette, furniture and décor included.',
    stat: '< 60 sec',
    statLabel: 'Design generated',
  },
  {
    icon: '💰',
    title: 'AI Cost Estimation',
    desc: 'Real-time material and labour cost breakdowns in Indian Rupees. Updated with live market pricing for 100% accurate BOQ.',
    stat: '±5%',
    statLabel: 'Estimation accuracy',
  },
  {
    icon: '🪑',
    title: 'AI Furniture Placement',
    desc: 'Ergonomics-first AI positions furniture for traffic flow, natural light and visual balance — validated by our senior designers.',
    stat: '3D',
    statLabel: 'Interactive layout',
  },
  {
    icon: '🪵',
    title: 'AI Material Selection',
    desc: 'AI suggests the best materials based on climate, usage, budget and aesthetic — from Italian marble to budget laminates.',
    stat: '500+',
    statLabel: 'Material options',
  },
  {
    icon: '🖥️',
    title: 'AI 3D Visualisation',
    desc: 'Photo-realistic renders with rotate, zoom, time-of-day lighting and material swap — see your home before a single nail is driven.',
    stat: 'Photo-real',
    statLabel: 'Render quality',
  },
  {
    icon: '📄',
    title: 'AI BOQ Generation',
    desc: 'Bill of Quantities auto-generated with line-item quantities, unit rates and total cost. Export to PDF for contractor comparison.',
    stat: 'Instant',
    statLabel: 'PDF export',
  },
]

export default function AIFeatures() {
  return (
    <section id="ai-features" className="py-24 bg-navy-950 relative overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-label">Technology</span>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-white leading-tight mt-3 mb-4">
            AI That Designs Like a <br />
            <span className="text-gold-gradient font-medium">50-Year Veteran</span>
          </h2>
          <p className="font-body text-white/55 text-sm max-w-xl mx-auto leading-relaxed">
            Our AI is trained on decades of engineering drawings, project data and design outcomes — then validated by our senior team before every deliverable.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-7 border border-white/8 rounded-sm bg-white/3 hover:bg-white/7 hover:border-gold-400/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <span className="text-4xl">{f.icon}</span>
                <div className="text-right">
                  <div className="font-display text-2xl font-light text-gold-400">{f.stat}</div>
                  <div className="font-body text-[10px] text-white/40 tracking-wide uppercase">{f.statLabel}</div>
                </div>
              </div>
              <h3 className="font-display text-xl text-white font-medium mb-2">{f.title}</h3>
              <p className="font-body text-sm text-white/55 leading-relaxed">{f.desc}</p>
              <div className="mt-5 h-px bg-gradient-to-r from-gold-400/0 via-gold-400/30 to-gold-400/0 group-hover:via-gold-400/60 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom banner */}
        <div className="mt-16 p-8 border border-gold-400/20 rounded-sm bg-gradient-to-r from-gold-500/10 to-transparent flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl text-white font-light mb-1">
              AI + Human Expertise = Zero Compromises
            </h3>
            <p className="font-body text-white/55 text-sm">
              Every AI output is reviewed by our 50+ year experienced engineering team before it reaches you.
            </p>
          </div>
          <a href="#design-wizard" className="btn-gold flex-shrink-0 px-8 py-4">
            Try AI Design Free ✦
          </a>
        </div>
      </div>
    </section>
  )
}
