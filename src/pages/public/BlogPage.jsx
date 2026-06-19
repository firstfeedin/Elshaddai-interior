import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const POSTS = [
  { id:1, tag:'Hyderabad', readMin:6, date:'Jun 12, 2025', featured:true,
    title:'Best Interior Designers in Hyderabad 2025 — Complete Guide',
    excerpt:'Jubilee Hills, Banjara Hills, Gachibowli, Hitech City — we cover the top neighbourhoods in Hyderabad and what interior design costs in each area, with real project examples and pricing.',
    img:'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Ganesh Kumar', role:'Founder, El Shaddai', avatar:'GK' } },
  { id:2, tag:'Vastu', readMin:4, date:'Jun 8, 2025', featured:false,
    title:'10 Vastu-Compliant Interior Ideas That Actually Look Modern',
    excerpt:"Pooja room in the north-east, master bedroom in the south-west, kitchen in the south-east — modern design and Vastu Shastra can co-exist beautifully. Here's how we do it.",
    img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Arjun Mehta', role:'Senior Interior Designer', avatar:'AM' } },
  { id:3, tag:'Modular Kitchen', readMin:5, date:'Jun 5, 2025', featured:false,
    title:'Modular Kitchen Cost in Hyderabad 2025 — Complete Pricing Guide',
    excerpt:'L-shaped, U-shaped, parallel or island kitchen — full breakdown of modular kitchen costs in Hyderabad across budget (₹1.5L), premium (₹3.5L) and luxury (₹7L+) categories.',
    img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Kavitha Rao', role:'Kitchen Design Specialist', avatar:'KR' } },
  { id:4, tag:'AI & Design', readMin:7, date:'May 30, 2025', featured:false,
    title:'How AI Interior Design Works — From Photo to 3D Room in 60 Seconds',
    excerpt:'Upload a photo of your empty room, describe your style in Telugu or English, and get a fully designed 3D render in under a minute. Here is exactly how our AI design tool works.',
    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Priya Krishnamurthy', role:'Head of Product', avatar:'PK' } },
  { id:5, tag:'Trends 2025', readMin:5, date:'May 24, 2025', featured:false,
    title:'Interior Design Trends in Hyderabad 2025 — What Telangana Homeowners Are Choosing',
    excerpt:'Warm terracotta tones, sheesham wood accents, Rajasthan marble, traditional jaali partitions and biophilic elements — the top design trends sweeping Hyderabad homes this year.',
    img:'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Suresh Venkat', role:'Design Director', avatar:'SV' } },
  { id:6, tag:'Cost Guide', readMin:8, date:'May 18, 2025', featured:false,
    title:'Full Home Interior Cost in Hyderabad — 2BHK, 3BHK & Villa Pricing',
    excerpt:'A realistic 2BHK interior in Hyderabad costs ₹8–14L, a 3BHK costs ₹14–22L, and a villa can range from ₹35L–₹1Cr+. Detailed room-by-room breakdown with what is included.',
    img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Meena Chandrasekhar', role:'Project Manager', avatar:'MC' } },
  { id:7, tag:'Wardrobe', readMin:4, date:'May 10, 2025', featured:false,
    title:'Sliding vs Swing Wardrobe — Which Is Better for Indian Homes?',
    excerpt:'Space, budget, maintenance and aesthetics — a complete comparison of sliding and swing wardrobes for Indian homes, with cost estimates and material options for Hyderabad.',
    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Arjun Mehta', role:'Senior Interior Designer', avatar:'AM' } },
  { id:8, tag:'Pooja Room', readMin:3, date:'May 3, 2025', featured:false,
    title:'Beautiful Pooja Room Designs for Modern Indian Homes — 2025 Ideas',
    excerpt:'From compact wall-mounted mandirs to dedicated Pooja rooms with marble flooring and teak jaali — 12 stunning pooja room designs from our completed Hyderabad projects.',
    img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Kavitha Rao', role:'Kitchen Design Specialist', avatar:'KR' } },
]

const TAGS = ['All','Hyderabad','Vastu','Modular Kitchen','AI & Design','Trends 2025','Cost Guide','Wardrobe','Pooja Room']

function PostCard({ p }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: '#fff', border: `1px solid ${hov ? dark : border}`, cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column' }}>
      <div style={{ overflow: 'hidden', height: 200 }}>
        <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
      </div>
      <div style={{ padding: '20px 22px 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, border: `1px solid ${gold}`, padding: '3px 8px' }}>{p.tag}</span>
          <span style={{ ...sans, fontSize: 10, color: '#a8a29e' }}>{p.readMin} min read</span>
        </div>
        <h3 style={{ ...serif, margin: '0 0 10px', fontSize: 18, fontWeight: 400, color: dark, lineHeight: 1.35 }}>{p.title}</h3>
        <p style={{ ...sans, margin: '0 0 18px', fontSize: 12, color: stone, lineHeight: 1.7, fontWeight: 300, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: `1px solid ${border}` }}>
          <div style={{ width: 28, height: 28, background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: gold }}>{p.author.avatar}</div>
          <div>
            <p style={{ ...sans, margin: 0, fontSize: 11, fontWeight: 500, color: dark }}>{p.author.name}</p>
            <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{p.date}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState('All')
  const [search, setSearch]       = useState('')
  const [searchFocus, setSearchFocus] = useState(false)

  const filtered = POSTS.filter(p => {
    const matchTag    = activeTag === 'All' || p.tag === activeTag
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  const featured = filtered.find(p => p.featured)
  const rest     = filtered.filter(p => !p.featured || activeTag !== 'All' || search)

  return (
    <div style={{ ...sans, background: light, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 96 }}>

        {/* Header */}
        <div style={{ background: '#fff', padding: '64px 64px 52px', borderBottom: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#a8a29e' }}>El Shaddai Journal</p>
              <h1 style={{ ...serif, margin: '0 0 12px', fontSize: 52, fontWeight: 300, color: dark, lineHeight: 1, letterSpacing: '-0.01em' }}>Design. Craft. AI.</h1>
              <p style={{ margin: 0, fontSize: 14, color: stone, fontWeight: 300, lineHeight: 1.7, maxWidth: 420 }}>Insights, guides, and trends for Indian interior designers, homeowners and design enthusiasts.</p>
            </div>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
                placeholder="Search articles..."
                style={{ width: 240, padding: '10px 14px 10px 36px', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${searchFocus ? dark : border}`, fontSize: 13, color: dark, outline: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 300, transition: 'border-color 0.2s' }} />
              <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#a8a29e' }}>⌕</span>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 0, marginTop: 36, borderTop: `1px solid ${border}`, paddingTop: 24 }}>
            {TAGS.map(t => (
              <button key={t} onClick={() => setActiveTag(t)}
                style={{ ...sans, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: activeTag === t ? dark : '#a8a29e', padding: '0 20px 0 0', paddingBottom: 0, borderBottom: `2px solid ${activeTag === t ? dark : 'transparent'}`, transition: 'all 0.2s' }}
                onMouseEnter={e => { if (activeTag !== t) e.currentTarget.style.color = stone }}
                onMouseLeave={e => { if (activeTag !== t) e.currentTarget.style.color = '#a8a29e' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '52px 64px 80px' }}>

          {/* Featured */}
          {featured && activeTag === 'All' && !search && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${border}`, background: '#fff', marginBottom: 2, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = dark}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}>
              <div style={{ overflow: 'hidden', height: 420 }}>
                <img src={featured.img} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
              </div>
              <div style={{ padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, border: `1px solid ${gold}`, padding: '3px 8px' }}>{featured.tag}</span>
                  <span style={{ fontSize: 10, color: '#a8a29e' }}>Featured</span>
                </div>
                <h2 style={{ ...serif, margin: '0 0 16px', fontSize: 30, fontWeight: 300, color: dark, lineHeight: 1.3 }}>{featured.title}</h2>
                <p style={{ ...sans, margin: '0 0 32px', fontSize: 13, color: stone, lineHeight: 1.85, fontWeight: 300 }}>{featured.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${border}` }}>
                  <div style={{ width: 32, height: 32, background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: gold }}>{featured.author.avatar}</div>
                  <div>
                    <p style={{ ...sans, margin: 0, fontSize: 12, fontWeight: 500, color: dark }}>{featured.author.name}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{featured.date} · {featured.readMin} min read</p>
                  </div>
                </div>
                <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: dark, display: 'inline-flex', alignItems: 'center', gap: 8 }}>Read Article →</span>
              </div>
            </div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, marginTop: 2 }}>
              {rest.map(p => <PostCard key={p.id} p={p} />)}
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '96px 0' }}>
              <p style={{ ...serif, fontSize: 24, fontWeight: 300, color: stone }}>No articles found for "{search}"</p>
            </div>
          )}
        </div>

        {/* Newsletter */}
        <div style={{ background: dark, padding: '72px 64px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Newsletter</p>
          <h2 style={{ ...serif, margin: '0 0 14px', fontSize: 44, fontWeight: 300, color: '#fff' }}>Stay Inspired</h2>
          <p style={{ ...sans, margin: '0 0 36px', fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>Weekly design tips, AI updates, and market insights — straight to your inbox.</p>
          <div style={{ display: 'inline-flex', gap: 0, border: `1px solid rgba(255,255,255,0.12)` }}>
            <input placeholder="your@email.com" style={{ width: 260, padding: '13px 18px', background: 'transparent', border: 'none', color: '#fff', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
            <button style={{ ...sans, padding: '13px 22px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  )
}
