import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const CATEGORIES = ['All','Living Room','Bedroom','Kitchen','Office','Commercial','Exterior']

const PROJECTS = [
  { id:1, title:'Sharma Residence — Full Interior',      cat:'Living Room', style:'Modern Luxury',    sqft:3200, city:'Hyderabad', img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', designer:'Priya K.', year:2024, tag:'Featured' },
  { id:2, title:'Gupta Villa — Master Bedroom Suite',    cat:'Bedroom',     style:'Scandinavian',     sqft:420,  city:'Hitech City', img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', designer:'Arjun M.', year:2024, tag:null },
  { id:3, title:'Kapoor Kitchen Remodel',                cat:'Kitchen',     style:'Contemporary',     sqft:280,  city:'Mumbai',    img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80', designer:'Sneha R.', year:2023, tag:'Featured' },
  { id:4, title:'TechPark Co-Working Space',             cat:'Commercial',  style:'Industrial',       sqft:8000, city:'Pune',      img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', designer:'Raj S.',  year:2024, tag:null },
  { id:5, title:'Mehta Home Office',                     cat:'Office',      style:'Minimalist',       sqft:160,  city:'Jubilee Hills',   img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=80', designer:'Priya K.', year:2023, tag:null },
  { id:6, title:'Agarwal Penthouse — Living & Dining',   cat:'Living Room', style:'Luxury',           sqft:1800, city:'Delhi',     img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', designer:'Arjun M.', year:2024, tag:'Featured' },
  { id:7, title:'Reddy Villa — Kids Bedroom',            cat:'Bedroom',     style:'Playful Modern',   sqft:220,  city:'Hyderabad', img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', designer:'Sneha R.', year:2024, tag:null },
  { id:8, title:'Bose Restaurant Interior',              cat:'Commercial',  style:'Rustic Industrial',sqft:3500, city:'Kolkata',   img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', designer:'Raj S.',  year:2023, tag:null },
  { id:9, title:'Joshi Farmhouse — Exterior & Landscape',cat:'Exterior',   style:'Modern Farmhouse', sqft:5000, city:'Lonavala',  img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', designer:'Priya K.', year:2024, tag:'Featured' },
  { id:10,title:'Nair Open Kitchen — Island Design',     cat:'Kitchen',     style:'Contemporary',     sqft:320,  city:'Kochi',     img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', designer:'Arjun M.', year:2023, tag:null },
  { id:11,title:'Shah Corporate Office — 3 Floors',     cat:'Commercial',  style:'Modern Corporate', sqft:12000,city:'Ahmedabad', img:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', designer:'Raj S.',  year:2024, tag:null },
  { id:12,title:'Iyer Guest Bedroom — Boutique Style',  cat:'Bedroom',     style:'Boutique',         sqft:280,  city:'Mysore',    img:'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', designer:'Sneha R.', year:2024, tag:null },
]

const STATS = [
  { v:'150+',  l:'Furniture Items' },
  { v:'7',     l:'Room Categories' },
  { v:'30+',   l:'Material Finishes' },
  { v:'Free',  l:'To Get Started'  },
]

function ProjectCard({ p, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ cursor: 'pointer', border: `1px solid ${hov ? dark : border}`, transition: 'border-color 0.2s', background: '#fff' }}>
      <div style={{ overflow: 'hidden', height: 260 }}>
        <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s', transform: hov ? 'scale(1.05)' : 'scale(1)' }} />
      </div>
      <div style={{ padding: '18px 20px 22px' }}>
        {p.tag && <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, display: 'block', marginBottom: 8 }}>{p.tag}</span>}
        <h3 style={{ ...serif, margin: '0 0 8px', fontSize: 16, fontWeight: 400, color: dark, lineHeight: 1.3 }}>{p.title}</h3>
        <p style={{ ...sans, margin: 0, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>{p.style} · {p.sqft} sq.ft · {p.city}</p>
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  const [active, setActive]   = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = active === 'All' ? PROJECTS : PROJECTS.filter(p => p.cat === active)

  return (
    <div style={{ ...sans, background: light, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 96 }}>

        {/* Header */}
        <div style={{ background: '#fff', padding: '64px 64px 52px', borderBottom: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#a8a29e' }}>Our Work</p>
              <h1 style={{ ...serif, margin: 0, fontSize: 52, fontWeight: 300, color: dark, lineHeight: 1 }}>Design Portfolio</h1>
            </div>
            <p style={{ ...sans, margin: 0, fontSize: 14, color: stone, fontWeight: 300, lineHeight: 1.7, maxWidth: 360, textAlign: 'right' }}>Sample designs created with El Shaddai Studio — from cozy apartments to luxury villas and commercial spaces.</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: `1px solid ${border}`, borderLeft: `1px solid ${border}` }}>
            {STATS.map(s => (
              <div key={s.l} style={{ padding: '24px 28px', borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
                <p style={{ ...serif, margin: '0 0 4px', fontSize: 36, fontWeight: 300, color: dark }}>{s.v}</p>
                <p style={{ ...sans, margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e' }}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 36, paddingTop: 24, borderTop: `1px solid ${border}` }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActive(c)}
                style={{ ...sans, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: active === c ? dark : '#a8a29e', padding: '0 20px 0 0', borderBottom: `2px solid ${active === c ? dark : 'transparent'}`, transition: 'all 0.2s', paddingBottom: 0 }}
                onMouseEnter={e => { if (active !== c) e.currentTarget.style.color = stone }}
                onMouseLeave={e => { if (active !== c) e.currentTarget.style.color = '#a8a29e' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ padding: '2px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
            {filtered.map(p => <ProjectCard key={p.id} p={p} onClick={() => setSelected(p)} />)}
          </div>
        </div>

        {/* Lightbox */}
        {selected && (
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(20,15,10,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', maxWidth: 920, width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 1fr', overflow: 'hidden', maxHeight: '88vh' }}>
              <img src={selected.img} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <button onClick={() => setSelected(null)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 22, color: '#a8a29e', cursor: 'pointer', marginBottom: 24, padding: 0 }}>×</button>
                {selected.tag && <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, display: 'block', marginBottom: 14 }}>{selected.tag}</span>}
                <h2 style={{ ...serif, margin: '0 0 14px', fontSize: 26, fontWeight: 300, color: dark, lineHeight: 1.3 }}>{selected.title}</h2>
                <p style={{ ...sans, margin: '0 0 32px', fontSize: 13, color: stone, fontWeight: 300 }}>{selected.style}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
                  {[['Location', selected.city], ['Area', `${selected.sqft} sq.ft`], ['Designer', selected.designer], ['Year', selected.year]].map(([k, v]) => (
                    <div key={k} style={{ borderTop: `1px solid ${border}`, paddingTop: 12 }}>
                      <p style={{ ...sans, margin: '0 0 4px', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e' }}>{k}</p>
                      <p style={{ ...serif, margin: 0, fontSize: 20, fontWeight: 300, color: dark }}>{v}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => window.location.href = '/register'}
                  style={{ ...sans, padding: '12px', background: dark, border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  Inquire About This Project →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ background: '#fff', padding: '80px 64px', textAlign: 'center', borderTop: `1px solid ${border}` }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#a8a29e' }}>Start Your Project</p>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 44, fontWeight: 300, color: dark }}>Ready to transform your space?</h2>
          <p style={{ ...sans, margin: '0 0 36px', fontSize: 14, color: stone, fontWeight: 300 }}>Design your space free — no experience needed, no cost to start.</p>
          <button onClick={() => window.location.href = '/ai-design'}
            style={{ ...sans, padding: '13px 36px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Start AI Design →
          </button>
        </div>
      </div>
    </div>
  )
}
