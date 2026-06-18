const services = [
  {
    title: 'Modular Kitchen',
    icon: '🍳',
    desc: 'Custom modular kitchens designed for maximum efficiency. AI-optimised layouts with premium hardware and finishes.',
    features: ['Soft-close hardware', 'Quartz countertops', 'Smart storage', 'AI layout planning'],
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
    popular: true,
  },
  {
    title: 'Wardrobes',
    icon: '🚪',
    desc: 'Sliding, hinged or walk-in wardrobes. AI-generated storage analysis ensures every inch is utilised.',
    features: ['Sliding / hinged doors', 'Sensor lighting', 'Accessory trays', '3D visualised'],
    img: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'TV Units & Entertainment',
    icon: '📺',
    desc: 'Statement TV wall units with integrated storage, ambient lighting and cable management.',
    features: ['Ambient backlighting', 'Cable management', 'Display niches', 'Premium laminates'],
    img: 'https://images.unsplash.com/photo-1593476087123-36d1de271f08?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'False Ceiling',
    icon: '✨',
    desc: 'Gypsum, POP and stretch false ceilings with integrated lighting. Structural integrity certified by our engineers.',
    features: ['Cove lighting', 'POP / Gypsum', 'Engineer certified', 'Fire-rated options'],
    img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Living Room',
    icon: '🛋️',
    desc: 'Transform your living space with AI-curated furniture placement, wall treatments and accent lighting.',
    features: ['Furniture planning', 'Wall panelling', 'Accent lighting', 'Material harmony'],
    img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Bedroom',
    icon: '🛏️',
    desc: 'Personalised bedroom interiors — from bed back-panels to wardrobe walls, designed for calm and comfort.',
    features: ['Upholstered panels', 'Study nook', 'Custom wardrobe', 'Mood lighting'],
    img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Full Home Interiors',
    icon: '🏠',
    desc: 'Complete turnkey interior solutions — design, manufacture and install every room in your home end-to-end.',
    features: ['All rooms included', 'Single point of contact', 'On-time guarantee', '5-year warranty'],
    img: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80',
    featured: true,
  },
]

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <span className="section-label">What We Do</span>
            <h2 className="section-title mt-3">
              Interior Services <br />Built to Last
            </h2>
          </div>
          <p className="font-body text-stone-500 text-sm max-w-sm leading-relaxed lg:text-right">
            Every service is backed by 50+ years of engineering rigour and delivered through our AI-powered design platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <div key={i} className={`relative group rounded-sm overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              s.featured ? 'lg:col-span-2 border-gold-300' : 'border-stone-100'
            }`}>
              <div className={`img-zoom relative ${s.featured ? 'h-52' : 'h-40'}`}>
                <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
              </div>

              <div className="absolute top-3 right-3 flex gap-2">
                {s.popular  && <span className="bg-gold-500 text-white text-[10px] font-body font-semibold px-2 py-0.5 rounded-sm">Popular</span>}
                {s.featured && <span className="bg-navy-900 text-white text-[10px] font-body font-semibold px-2 py-0.5 rounded-sm">Best Value</span>}
              </div>

              <div className="p-5 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <h3 className="font-display text-xl text-navy-950 font-medium">{s.title}</h3>
                </div>
                <p className="font-body text-xs text-stone-500 leading-relaxed mb-3">{s.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {s.features.map((f, j) => (
                    <span key={j} className="text-[10px] font-body bg-stone-50 text-stone-600 border border-stone-100 px-2 py-0.5 rounded-sm">
                      {f}
                    </span>
                  ))}
                </div>
                <a href="#design-wizard" className="inline-flex items-center gap-1.5 text-xs font-body font-semibold text-gold-600 hover:text-gold-700 group-hover:gap-2.5 transition-all duration-200">
                  Get a Quote
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
