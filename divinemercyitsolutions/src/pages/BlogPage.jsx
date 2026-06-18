import { useState } from 'react'
import AppShell from '../components/AppShell'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const POSTS = [
  { id:1, tag:'AI & Design', readMin:6, date:'Jun 12, 2025', featured:true, title:'How AI is Changing Interior Design in India in 2025', excerpt:'From text-to-room generation to AI-powered BOQ estimation, artificial intelligence is transforming how Indian designers work. We explore the top 9 AI tools reshaping the industry.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', author:{ name:'Priya Krishnamurthy', role:'Head of AI Product', avatar:'PK' } },
  { id:2, tag:'Design Tips', readMin:4, date:'Jun 8, 2025', featured:false, title:'10 Vastu-Compliant Interior Design Ideas That Actually Look Good', excerpt:"Modern design and Vastu Shastra don't have to conflict. Here are 10 beautiful design choices that honour both aesthetics and tradition.", img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80', author:{ name:'Arjun Mehta', role:'Senior Interior Designer', avatar:'AM' } },
  { id:3, tag:'Design Tips', readMin:5, date:'Jun 5, 2025', featured:false, title:'Small Space, Big Impact: How to Design a Compact Apartment That Feels Spacious', excerpt:'Clever zoning, multi-functional furniture, strategic mirrors and the right colour palette — six design principles that make small apartments look and feel twice their size.', img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', author:{ name:'Ananya Rao', role:'Senior Interior Designer', avatar:'AR' } },
  { id:4, tag:'3D Design', readMin:7, date:'May 30, 2025', featured:false, title:"A Beginner's Guide to 3D Interior Design: From Floor Plan to Render", excerpt:'Never used a 3D design tool before? This step-by-step guide walks you through drawing your first floor plan, adding furniture, and creating a photorealistic render.', img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', author:{ name:'Sneha Rao', role:'Design Educator', avatar:'SR' } },
  { id:5, tag:'Trends 2025', readMin:5, date:'May 24, 2025', featured:false, title:"Top Interior Design Trends in India for 2025: What's In, What's Out", excerpt:'Biophilic design, warm minimalism, japandi aesthetics, and terrazzo are dominating Indian homes. We break down the top trends with real examples.', img:'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', author:{ name:'Priya Krishnamurthy', role:'Head of AI Product', avatar:'PK' } },
  { id:6, tag:'Business', readMin:8, date:'May 18, 2025', featured:false, title:'How to Price Your Interior Design Services: A Complete Guide for Indian Freelancers', excerpt:'Hourly vs. flat fee vs. percentage of project cost — we break down every pricing model with real numbers, tips for negotiating, and contract templates.', img:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80', author:{ name:'Raj Sharma', role:'Interior Design Consultant', avatar:'RS' } },
]

const TAGS = ['All','AI & Design','Design Tips','3D Design','Trends 2025','Business','Materials']

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
    <AppShell title="Blog">
      <div style={{ ...sans, minHeight: '100vh', background: light }}>

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
    </AppShell>
  )
}
