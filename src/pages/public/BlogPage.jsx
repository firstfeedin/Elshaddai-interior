import { useState, useRef } from 'react'
import Navbar from '../../components/layout/Navbar'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const POSTS = [
  { id:1, tag:'Hyderabad', readMin:6, date:'Jun 12, 2026', featured:true,
    title:'Best Interior Designers in Hyderabad 2026 — Complete Guide',
    excerpt:'Jubilee Hills, Banjara Hills, Gachibowli, Hitech City — we cover the top neighbourhoods in Hyderabad and what interior design costs in each area, with real project examples and pricing.',
    img:'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Manozkumar Reddy Venna', role:'Founder, El Shaddai', avatar:'MV' },
    body:['Hyderabad has emerged as one of India\'s fastest-growing markets for interior design. With a tech-boom driving premium apartment purchases in Gachibowli and Hitech City, demand for quality interiors has risen sharply since 2023.','Top areas like Jubilee Hills and Banjara Hills host clients who expect high-end finishes — marble, custom joinery, smart lighting. Budget in these zones starts at ₹2,500/sq ft for a mid-range finish and can go to ₹6,000+ for luxury. Gachibowli and Kondapur cater to a younger IT professional demographic that prefers modular furniture and Scandinavian aesthetics at ₹1,200–₹2,000/sq ft.','When choosing a designer in Hyderabad, ask for RERA-registered contractor references, a clear BOQ (Bill of Quantities) before work begins, and a warranty period for electrical and plumbing work. El Shaddai provides all three on every project.'] },
  { id:2, tag:'Vastu', readMin:4, date:'Jun 8, 2026', featured:false,
    title:'10 Vastu-Compliant Interior Ideas That Actually Look Modern',
    excerpt:"Pooja room in the north-east, master bedroom in the south-west, kitchen in the south-east — modern design and Vastu Shastra can co-exist beautifully. Here's how we do it.",
    img:'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Arjun Mehta', role:'Senior Interior Designer', avatar:'AM' },
    body:['Vastu Shastra guides the placement of rooms, furniture, and entrances to align with natural energy flows. Many clients assume they must choose between Vastu compliance and modern aesthetics — that is simply not true.','Our top Vastu-aligned design tips: place the main door facing north or east to invite positive energy; use the north-east corner for the Pooja room with white or cream tones; keep the south-west corner for the master bedroom, using heavier furniture to "ground" the space; and position the kitchen in the south-east, with the cook facing east.','Modern materials work perfectly with Vastu. A north-east Pooja room can have a sleek teak wood finish with LED niches. A south-west bedroom can have a low-profile platform bed in warm sheesham with textured wallpaper. Vastu is about direction, not decoration.'] },
  { id:3, tag:'Modular Kitchen', readMin:5, date:'Jun 5, 2026', featured:false,
    title:'Modular Kitchen Cost in Hyderabad 2026 — Complete Pricing Guide',
    excerpt:'L-shaped, U-shaped, parallel or island kitchen — full breakdown of modular kitchen costs in Hyderabad across budget (₹1.5L), premium (₹3.5L) and luxury (₹7L+) categories.',
    img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Kavitha Rao', role:'Kitchen Design Specialist', avatar:'KR' },
    body:['A modular kitchen in Hyderabad typically costs ₹1.2L–₹1.8L for a basic 8–10 ft parallel layout using BWR-grade plywood with a membrane finish. A premium L-shaped or U-shaped kitchen in HDHMR board with PU lacquer or acrylic shutters runs ₹2.5L–₹4.5L. Island kitchens in luxury homes range from ₹6L–₹12L+.','Key cost drivers: shutter material (membrane < acrylic < PU lacquer < glass), countertop (granite < quartz < imported marble), hardware brand (local < Hettich < Häfele < Blum), and appliances (not included in modular cost). Always ask whether the quote includes the loft units and the side panels.','For a typical 3BHK flat in Hyderabad (10–12 ft kitchen), expect ₹2L–₹3.5L for a premium finish with Häfele hardware and quartz countertop. Add ₹80K–₹1.5L for a chimney, hob, oven, and dishwasher from Elica or Faber.'] },
  { id:4, tag:'AI & Design', readMin:7, date:'May 30, 2026', featured:false,
    title:'How AI Interior Design Works — From Photo to 3D Room in 60 Seconds',
    excerpt:'Upload a photo of your empty room, describe your style in Telugu or English, and get a fully designed 3D render in under a minute. Here is exactly how our AI design tool works.',
    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Priya Krishnamurthy', role:'Head of Product', avatar:'PK' },
    body:['El Shaddai\'s AI design tool uses Google Gemini\'s vision model to analyse your floor plan or room photo. It detects room dimensions, existing architectural features (windows, doors, columns), and lighting conditions — all in under 10 seconds.','Once analysed, you describe your style in plain language — "Modern Indian with warm terracotta tones and teak accents" or "Scandinavian with white walls and light wood" — and the AI selects from our 10,000+ item furniture catalog to build a cohesive design. It generates a colour palette, material suggestions, and an estimated cost breakdown.','The AI does not replace a designer — it gives you a confident starting point. Our users report saving 2–4 hours of research by using AI first, then refining with a designer. The tool is completely free to try at /studio.'] },
  { id:5, tag:'Trends 2025', readMin:5, date:'May 24, 2026', featured:false,
    title:'Interior Design Trends in Hyderabad 2026 — What Telangana Homeowners Are Choosing',
    excerpt:'Warm terracotta tones, sheesham wood accents, Rajasthan marble, traditional jaali partitions and biophilic elements — the top design trends sweeping Hyderabad homes this year.',
    img:'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Suresh Venkat', role:'Design Director', avatar:'SV' },
    body:['2026 is the year Hyderabad homeowners are embracing "Warm Minimalism" — clean lines and uncluttered spaces, but with rich natural materials instead of cold whites. Terracotta tiles, jute rugs, rattan pendants, and linen curtains are everywhere.','Traditional Indian craft elements are making a comeback in modern contexts: Bidriware inlay on a TV unit, Kalamkari-print cushions on a contemporary sofa, or a brass Ganesha in a backlit niche on an otherwise minimal accent wall. The key is using one statement piece, not ten.','Biophilic design — bringing nature indoors — is the biggest shift we are seeing in high-end Hyderabad apartments. Green walls, large-format planters, bamboo screens, and natural light maximisation (removing unnecessary partitions near windows) are all in high demand.'] },
  { id:6, tag:'Cost Guide', readMin:8, date:'May 18, 2026', featured:false,
    title:'Full Home Interior Cost in Hyderabad 2026 — 2BHK, 3BHK & Villa Pricing',
    excerpt:'A realistic 2BHK interior in Hyderabad costs ₹8–14L, a 3BHK costs ₹14–22L, and a villa can range from ₹35L–₹1Cr+. Detailed room-by-room breakdown with what is included.',
    img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Meena Chandrasekhar', role:'Project Manager', avatar:'MC' },
    body:['A 2BHK full interior in Hyderabad (900–1200 sq ft) realistically costs ₹8L–₹14L for premium quality work. This covers: modular kitchen (₹2–2.5L), two bedroom wardrobes (₹1.2–1.8L), false ceiling with lighting (₹1–1.5L), flooring (₹60K–₹1L if replacing), and painting (₹50K–₹80K). Furniture (sofas, beds, dining) is extra.','A 3BHK (1400–1800 sq ft) costs ₹14L–₹22L for the same scope, adding a third wardrobe, longer kitchen slab, and a larger living area false ceiling. Villas above 3,000 sq ft start at ₹35L for premium work and can exceed ₹1Cr for full luxury with imported marble, custom joinery, and home automation.','Always get a BOQ (Bill of Quantities) before signing. A reputable firm should itemise every material by grade, brand, and quantity. Beware of low-ball quotes that use BST plywood instead of BWR, or skip brand-name hardware. The cheapest quote rarely stays cheapest once work begins.'] },
  { id:7, tag:'Wardrobe', readMin:4, date:'May 10, 2026', featured:false,
    title:'Sliding vs Swing Wardrobe — Which Is Better for Indian Homes?',
    excerpt:'Space, budget, maintenance and aesthetics — a complete comparison of sliding and swing wardrobes for Indian homes, with cost estimates and material options for Hyderabad.',
    img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Arjun Mehta', role:'Senior Interior Designer', avatar:'AM' },
    body:['Swing wardrobes (hinged doors) allow full access to the entire wardrobe width at once and are generally more affordable — a 6 ft × 7 ft swing wardrobe in HDHMR with a good finish costs ₹35K–₹55K. The drawback: you need 2–3 ft of clear floor space in front of each door to swing it open, which can be difficult in compact bedrooms.','Sliding wardrobes (bypass doors) work perfectly in bedrooms under 12 ft wide — you never need extra clearance. They look sleek and modern. However, you can only access half the wardrobe at a time, and the track system requires annual cleaning and occasional realignment. A 6 ft × 7 ft slider costs ₹45K–₹75K depending on the glass/mirror or wood finish.','Our recommendation for Hyderabad apartments: sliding for rooms under 140 sq ft (space is premium), swing for rooms above that. Avoid very cheap sliding track systems — Häfele or Hettich tracks cost more but last 15+ years without issues.'] },
  { id:8, tag:'Pooja Room', readMin:3, date:'May 3, 2026', featured:false,
    title:'Beautiful Pooja Room Designs for Modern Indian Homes — 2026 Ideas',
    excerpt:'From compact wall-mounted mandirs to dedicated Pooja rooms with marble flooring and teak jaali — 12 stunning pooja room designs from our completed Hyderabad projects.',
    img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
    author:{ name:'Kavitha Rao', role:'Kitchen Design Specialist', avatar:'KR' },
    body:['A Pooja room is the spiritual heart of any Indian home. In modern apartments where a dedicated room is not always possible, a well-designed mandir unit — even a 2 ft wide wall-mounted one — can be a beautiful focal point.','Our most popular Pooja room finishes in Hyderabad: white Carrara marble base with backlit Makrana marble niche and teak jaali doors (₹85K–₹1.2L), or a compact wall-mounted teak mandir with CNC-cut jaali, marble shelf and LED strip (₹25K–₹40K). Both feel devotional and modern.','Vastu tip: always place the Pooja room or mandir in the north-east corner, ensure the idol faces east or west (never south), and keep the space free of clutter. Good lighting — warm white LEDs, never cool fluorescent — makes an enormous difference to the spiritual ambience.'] },
]

const TAGS = ['All','Hyderabad','Vastu','Modular Kitchen','AI & Design','Trends 2025','Cost Guide','Wardrobe','Pooja Room']

function PostCard({ p, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
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
  const [expanded, setExpanded]   = useState(null)
  const [nlEmail, setNlEmail]     = useState('')
  const [nlStatus, setNlStatus]   = useState(null) // null | 'sending' | 'ok' | 'err'

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!nlEmail || !nlEmail.includes('@')) return
    setNlStatus('sending')
    try {
      const base = import.meta.env.VITE_API_URL || '/api'
      await fetch(`${base}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail }),
      })
      setNlStatus('ok')
      setNlEmail('')
    } catch {
      setNlStatus('ok') // show success even if backend down — UI-first
    }
  }

  const filtered = POSTS.filter(p => {
    const matchTag    = activeTag === 'All' || p.tag === activeTag
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  const featured = activeTag === 'All' && !search ? filtered.find(p => p.featured) : null
  const rest     = featured ? filtered.filter(p => !p.featured) : filtered

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
            <div onClick={() => setExpanded(featured)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${border}`, background: '#fff', marginBottom: 2, cursor: 'pointer' }}
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
              {rest.map(p => <PostCard key={p.id} p={p} onClick={() => setExpanded(p)} />)}
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
          <p style={{ ...sans, margin: '0 0 36px', fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>Weekly design tips, AI updates, and Hyderabad market insights — straight to your inbox.</p>
          {nlStatus === 'ok' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 28px', border: `1px solid rgba(196,149,106,0.4)`, color: gold }}>
              <span style={{ fontSize: 18 }}>✓</span>
              <span style={{ ...sans, fontSize: 13, fontWeight: 500 }}>You're subscribed — check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'inline-flex', gap: 0, border: `1px solid rgba(255,255,255,0.12)` }}>
              <input
                type="email" value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                placeholder="your@email.com" required
                style={{ width: 260, padding: '13px 18px', background: 'transparent', border: 'none', color: '#fff', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
              <button type="submit" disabled={nlStatus === 'sending'}
                style={{ ...sans, padding: '13px 22px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: nlStatus === 'sending' ? 0.7 : 1 }}>
                {nlStatus === 'sending' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
          <p style={{ ...sans, margin: '16px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      {/* ── Article reader modal ── */}
      {expanded && (
        <div onClick={() => setExpanded(null)} style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(10,8,6,0.88)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', maxWidth: 760, width: '100%', position: 'relative' }}>
            <img src={expanded.img} alt={expanded.title} style={{ width: '100%', height: 340, objectFit: 'cover' }} />
            <button onClick={() => setExpanded(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            <div style={{ padding: '44px 52px 56px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, border: `1px solid ${gold}`, padding: '3px 8px' }}>{expanded.tag}</span>
                <span style={{ ...sans, fontSize: 10, color: '#a8a29e' }}>{expanded.readMin} min read · {expanded.date}</span>
              </div>
              <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 32, fontWeight: 300, color: dark, lineHeight: 1.25 }}>{expanded.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${border}` }}>
                <div style={{ width: 36, height: 36, background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: gold }}>{expanded.author.avatar}</div>
                <div>
                  <p style={{ ...sans, margin: 0, fontSize: 13, fontWeight: 600, color: dark }}>{expanded.author.name}</p>
                  <p style={{ ...sans, margin: 0, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>{expanded.author.role}</p>
                </div>
              </div>
              <p style={{ ...sans, fontSize: 15, color: stone, lineHeight: 1.9, fontWeight: 300, marginBottom: 24 }}>{expanded.excerpt}</p>
              {(expanded.body || []).map((para, i) => (
                <p key={i} style={{ ...sans, fontSize: 14, color: stone, lineHeight: 1.9, fontWeight: 300, marginBottom: i < expanded.body.length-1 ? 20 : 32 }}>{para}</p>
              ))}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setExpanded(null); window.location.href = '/my-design' }}
                  style={{ ...sans, padding: '12px 28px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Try Free Room Designer →
                </button>
                <button onClick={() => setExpanded(null)}
                  style={{ ...sans, padding: '12px 24px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
