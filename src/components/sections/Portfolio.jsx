import { useState } from 'react'

const filters = ['All', 'Modern', 'Luxury', 'Minimal', 'Contemporary']

const projects = [
  {
    title: 'Reddy Residence, Jubilee Hills',
    category: 'Modern',
    room: 'Living Rooms',
    area: '1800 sq ft',
    cost: '₹12.5 L',
    img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=700&q=80',
    tags: ['Living Room', 'False Ceiling', 'TV Unit'],
  },
  {
    title: 'Sharma Villa, Banjara Hills',
    category: 'Luxury',
    room: 'Villas',
    area: '3200 sq ft',
    cost: '₹48 L',
    img: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=700&q=80',
    tags: ['Full Home', 'Indian Marble', 'Smart Lighting'],
    featured: true,
  },
  {
    title: 'Rao Kitchen, Gachibowli',
    category: 'Minimal',
    room: 'Kitchens',
    area: '220 sq ft',
    cost: '₹6.8 L',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=700&q=80',
    tags: ['Modular Kitchen', 'Handleless', 'Granite Top'],
  },
  {
    title: 'Mehta Master Bedroom, Kondapur',
    category: 'Contemporary',
    room: 'Bedrooms',
    area: '320 sq ft',
    cost: '₹4.2 L',
    img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=700&q=80',
    tags: ['Bedroom', 'Wardrobe', 'Pooja Corner'],
  },
  {
    title: 'Kumar Penthouse, Hitech City',
    category: 'Luxury',
    room: 'Living Rooms',
    area: '4100 sq ft',
    cost: '₹92 L',
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80',
    tags: ['Full Home', 'Kadappa Stone', 'Teak Wood'],
    featured: true,
  },
  {
    title: 'Verma Home, Madhapur',
    category: 'Modern',
    room: 'Kitchens',
    area: '950 sq ft',
    cost: '₹8.1 L',
    img: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=700&q=80',
    tags: ['Kitchen', 'Dining', 'Open Plan'],
  },
]

export default function Portfolio() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active)

  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div>
            <span className="section-label">Our Work</span>
            <h2 className="section-title mt-3">
              Projects That Speak <br />for Themselves
            </h2>
          </div>
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button key={f} onClick={() => setActive(f)}
                className={`tag-btn ${active === f ? 'tag-btn-active' : 'tag-btn-inactive'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <div key={i} className={`relative group rounded-sm overflow-hidden border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${p.featured ? 'lg:col-span-1' : ''}`}>
              <div className="img-zoom relative h-56">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#design-wizard"
                    className="bg-gold-500 text-white font-body font-semibold text-xs px-5 py-2.5 rounded-sm hover:bg-gold-600 transition-colors">
                    Get Similar Design
                  </a>
                </div>

                {/* Category */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] font-body font-semibold px-2.5 py-1 rounded-sm border border-white/20">
                    {p.category}
                  </span>
                </div>

                {/* Cost */}
                <div className="absolute top-3 right-3">
                  <span className="bg-gold-500 text-white text-[10px] font-body font-semibold px-2.5 py-1 rounded-sm">
                    {p.cost}
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white">
                <h3 className="font-display text-lg text-navy-950 font-medium mb-1">{p.title}</h3>
                <p className="font-body text-xs text-stone-400 mb-3">{p.room} • {p.area}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t, j) => (
                    <span key={j} className="text-[10px] font-body bg-navy-50 text-navy-700 border border-navy-100 px-2 py-0.5 rounded-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/#contact" className="btn-outline px-10 py-4">
            View All 2400+ Projects →
          </a>
        </div>
      </div>
    </section>
  )
}
