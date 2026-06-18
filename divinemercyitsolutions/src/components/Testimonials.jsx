import { useState } from 'react'

const reviews = [
  {
    name:    'Priya Ramakrishnan',
    city:    'Chennai',
    project: 'Full Home — 1800 sq ft',
    rating:  5,
    text:    "El Shaddai transformed our apartment beyond imagination. The AI-generated design was spot on in the first iteration, and the engineering team's attention to structural details gave us complete confidence. Every measurement was perfect.",
    img:     'https://i.pravatar.cc/80?img=47',
    tag:     'Luxury Modern',
  },
  {
    name:    'Arun Selvam',
    city:    'Coimbatore',
    project: 'Villa — 3200 sq ft',
    rating:  5,
    text:    'Coming from an engineering background myself, I was amazed at the precision. The BOQ was accurate to within 3% of the final bill. The 50+ years of experience shows in every joint, every finish, every decision.',
    img:     'https://i.pravatar.cc/80?img=12',
    tag:     'Villa Luxury',
  },
  {
    name:    'Kavitha Nair',
    city:    'Bengaluru',
    project: 'Modular Kitchen + 2 Bedrooms',
    rating:  5,
    text:    "The 3D visualisation was so realistic that when the actual installation was done, it looked exactly like what I approved online. The tracking system kept me informed every single day — no surprises!",
    img:     'https://i.pravatar.cc/80?img=32',
    tag:     'Minimal Scandinavian',
  },
  {
    name:    'Suresh Venkataraman',
    city:    'Hyderabad',
    project: 'Office Interior — 2400 sq ft',
    rating:  5,
    text:    'Delivered 4 days ahead of schedule. The AI design captured our brand identity perfectly, and the cost estimator was transparent from day one. Worth every rupee. Our employees love the new space.',
    img:     'https://i.pravatar.cc/80?img=55',
    tag:     'Commercial Modern',
  },
  {
    name:    'Meena Chandrasekhar',
    city:    'Madurai',
    project: 'Living Room + Kitchen',
    rating:  5,
    text:    'As a first-time homeowner I was nervous. El Shaddai made the entire process effortless. The Quick Design Wizard took 5 minutes and the result was exactly my dream kitchen. Highly recommend!',
    img:     'https://i.pravatar.cc/80?img=45',
    tag:     'Contemporary',
  },
]

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={i < count ? '#d4941f' : '#e7e5e4'}>
          <path d="M7 1l1.8 3.8L13 5.6l-3 2.9.7 4.1L7 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.8z"/>
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const [active, setActive] = useState(0)

  return (
    <section id="testimonials" className="py-24 bg-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(212,148,31,0.3) 0%, transparent 60%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-label">Client Stories</span>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-white leading-tight mt-3 mb-3">
            2400+ Happy Families <br />
            <span className="text-gold-gradient font-medium">Can't Be Wrong</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Stars count={5} />
            <span className="font-body text-white/60 text-sm">4.9/5 average · 1,200+ verified reviews</span>
          </div>
        </div>

        {/* Main review */}
        <div className="bg-white/5 border border-white/8 rounded-sm p-8 lg:p-12 mb-8 max-w-3xl mx-auto text-center">
          <img src={reviews[active].img} alt={reviews[active].name}
            className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-2 border-gold-400" />
          <Stars count={reviews[active].rating} />
          <blockquote className="font-display text-xl lg:text-2xl text-white font-light leading-relaxed mt-4 mb-6 italic">
            "{reviews[active].text}"
          </blockquote>
          <div>
            <p className="font-body text-white font-semibold">{reviews[active].name}</p>
            <p className="font-body text-white/50 text-xs mt-0.5">{reviews[active].city} · {reviews[active].project}</p>
            <span className="inline-block mt-2 text-[10px] font-body font-semibold text-gold-400 bg-gold-400/10 px-2.5 py-1 rounded-sm border border-gold-400/20">
              {reviews[active].tag}
            </span>
          </div>
        </div>

        {/* Avatar strip */}
        <div className="flex justify-center gap-4 flex-wrap">
          {reviews.map((r, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`transition-all duration-200 ${active === i ? 'scale-110' : 'opacity-50 hover:opacity-75'}`}>
              <img src={r.img} alt={r.name}
                className={`w-12 h-12 rounded-full object-cover border-2 ${active === i ? 'border-gold-400' : 'border-white/20'}`} />
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-10 border-t border-white/10">
          {[
            { val: '2,400+', label: 'Projects Completed' },
            { val: '98%',    label: 'On-Time Delivery' },
            { val: '4.9 ★',  label: 'Average Rating' },
            { val: '5 Yrs',  label: 'Warranty on Work' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-4xl text-gold-400 font-light mb-1">{s.val}</div>
              <div className="font-body text-white/50 text-xs tracking-wide uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
