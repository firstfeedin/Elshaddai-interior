import { useState } from 'react'

const T = {
  bg:'#08070a', panel:'#0f0e14', panel2:'#16141d', border:'rgba(255,255,255,0.07)',
  gold:'#c9a227', goldL:'#e8c84e', text:'#ede9e3', muted:'#6b6580',
  F:"'DM Sans',system-ui,sans-serif", S:"'Cormorant Garamond',serif",
}

const STYLES = ['All','Modern','Scandinavian','Japandi','Luxury','Bohemian','Industrial','Traditional','Minimalist']
const ROOMS  = ['All Rooms','Living Room','Bedroom','Kitchen','Bathroom','Office','Dining Room','Kids Room']

const GALLERY = [
  { id:1,  title:'Nordic Light Living',       style:'Scandinavian', room:'Living Room',  author:'Priya S.',   likes:284, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=75',  featured:true },
  { id:2,  title:'Velvet Luxe Bedroom',        style:'Luxury',       room:'Bedroom',      author:'Arjun M.',   likes:421, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=75', featured:true },
  { id:3,  title:'Japandi Calm Studio',        style:'Japandi',      room:'Living Room',  author:'Kavya R.',   likes:198, img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=75' },
  { id:4,  title:'Industrial Loft Office',     style:'Industrial',   room:'Office',       author:'Rahul T.',   likes:156, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=75' },
  { id:5,  title:'Bohemian Master Suite',      style:'Bohemian',     room:'Bedroom',      author:'Sneha K.',   likes:312, img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=75', featured:true },
  { id:6,  title:'Modern White Kitchen',       style:'Modern',       room:'Kitchen',      author:'Vikram P.',  likes:245, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=75' },
  { id:7,  title:'Art Deco Dining Room',       style:'Luxury',       room:'Dining Room',  author:'Ananya L.',  likes:189, img:'https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=600&q=75' },
  { id:8,  title:'Spa-Like Bathroom',          style:'Minimalist',   room:'Bathroom',     author:'Rohan G.',   likes:367, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=75', featured:true },
  { id:9,  title:'Cozy Reading Nook',          style:'Traditional',  room:'Living Room',  author:'Meera V.',   likes:143, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=75' },
  { id:10, title:'Kids Rainbow Room',          style:'Modern',       room:'Kids Room',    author:'Deepa N.',   likes:276, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=75' },
  { id:11, title:'Executive Home Office',      style:'Modern',       room:'Office',       author:'Suresh B.',  likes:198, img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=75' },
  { id:12, title:'Marble & Brass Living',      style:'Luxury',       room:'Living Room',  author:'Pooja A.',   likes:445, img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=75', featured:true },
  { id:13, title:'Wabi-Sabi Bedroom',          style:'Japandi',      room:'Bedroom',      author:'Kiran J.',   likes:231, img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=75' },
  { id:14, title:'Open-Plan Scandi Kitchen',   style:'Scandinavian', room:'Kitchen',      author:'Nisha C.',   likes:167, img:'https://images.unsplash.com/photo-1495433324511-bf8e92934d90?auto=format&fit=crop&w=600&q=75' },
  { id:15, title:'Terracotta Boho Dining',     style:'Bohemian',     room:'Dining Room',  author:'Arun T.',    likes:289, img:'https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=600&q=75' },
  { id:16, title:'Midnight Blue Bedroom',      style:'Modern',       room:'Bedroom',      author:'Lakshmi P.', likes:334, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=75' },
  { id:17, title:'Warm Minimal Living',        style:'Minimalist',   room:'Living Room',  author:'Dev S.',     likes:212, img:'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=600&q=75' },
  { id:18, title:'Industrial Brick Kitchen',   style:'Industrial',   room:'Kitchen',      author:'Asha M.',    likes:178, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=75' },
]

function GalleryCard({ item, featured }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(item.likes)

  function toggle(e) {
    e.stopPropagation()
    setLiked(v=>!v)
    setCount(c=>liked?c-1:c+1)
  }

  return (
    <div style={{ background:T.panel2, border:`1px solid ${T.border}`, overflow:'hidden', position:'relative',
      gridColumn: featured?'span 2':'span 1', transition:'border-color 0.25s, transform 0.25s' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold; e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform='none'}}>
      {/* Image */}
      <div style={{ position:'relative', overflow:'hidden', height: featured?300:220 }}>
        <img src={item.img} alt={item.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s', display:'block' }}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} />
        {/* Overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', pointerEvents:'none' }} />
        {/* Featured badge */}
        {item.featured && (
          <div style={{ position:'absolute', top:12, left:12, background:T.gold, color:T.bg, padding:'3px 10px',
            fontFamily:T.F, fontSize:8, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase' }}>
            ✦ Featured
          </div>
        )}
        {/* Style badge */}
        <div style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)',
          color:'rgba(255,255,255,0.7)', padding:'3px 10px', fontFamily:T.F, fontSize:8, fontWeight:700,
          letterSpacing:'0.16em', textTransform:'uppercase', border:'1px solid rgba(255,255,255,0.1)' }}>
          {item.style}
        </div>
        {/* Like btn */}
        <button onClick={toggle}
          style={{ position:'absolute', bottom:12, right:12, background:liked?T.gold:'rgba(0,0,0,0.6)',
            backdropFilter:'blur(8px)', border:`1px solid ${liked?T.gold:'rgba(255,255,255,0.15)'}`,
            color:liked?T.bg:'rgba(255,255,255,0.8)', padding:'5px 12px', fontFamily:T.F, fontSize:10,
            fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
          ♥ {count}
        </button>
        {/* CTA overlay */}
        <a href="/studio"
          style={{ position:'absolute', bottom:12, left:12, background:T.gold, color:T.bg, padding:'6px 14px',
            fontFamily:T.F, fontSize:9, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase',
            textDecoration:'none', opacity:0, transition:'opacity 0.2s' }}
          className="gallery-cta">
          Remix Design →
        </a>
      </div>

      {/* Info */}
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{ fontFamily:T.S, fontSize:16, color:T.text, margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</h3>
          <p style={{ fontFamily:T.F, fontSize:9, color:T.muted, margin:0 }}>{item.room} · by {item.author}</p>
        </div>
        <a href="/studio"
          style={{ fontFamily:T.F, fontSize:9, fontWeight:700, color:T.gold, letterSpacing:'0.14em',
            textTransform:'uppercase', textDecoration:'none', flexShrink:0, whiteSpace:'nowrap',
            padding:'6px 12px', border:`1px solid ${T.gold}` }}>
          Open →
        </a>
      </div>

      <style>{`.gallery-cta:hover{opacity:1!important}`}</style>
    </div>
  )
}

export default function GalleryPage() {
  const [style, setStyle]   = useState('All')
  const [room, setRoom]     = useState('All Rooms')
  const [sort, setSort]     = useState('popular')
  const [q, setQ]           = useState('')

  const filtered = GALLERY.filter(i => {
    const matchStyle = style==='All' || i.style===style
    const matchRoom  = room==='All Rooms' || i.room===room
    const matchQ     = !q || i.title.toLowerCase().includes(q.toLowerCase()) || i.author.toLowerCase().includes(q.toLowerCase())
    return matchStyle && matchRoom && matchQ
  }).sort((a,b) => sort==='popular' ? b.likes-a.likes : a.title.localeCompare(b.title))

  return (
    <div style={{ minHeight:'100vh', background:T.bg, paddingTop:80, fontFamily:T.F }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(180deg, #100f18 0%, ${T.bg} 100%)`, padding:'64px 32px 48px', textAlign:'center' }}>
        <p style={{ fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:T.gold, margin:'0 0 12px' }}>◈ Community Designs</p>
        <h1 style={{ fontFamily:T.S, fontSize:'clamp(36px,5vw,64px)', color:T.text, margin:'0 0 16px', fontWeight:400, lineHeight:1.1 }}>
          Design Gallery
        </h1>
        <p style={{ fontFamily:T.F, fontSize:14, color:T.muted, margin:'0 auto 32px', maxWidth:560, lineHeight:1.7 }}>
          Explore beautiful interiors created by our community. Click any design to open it in the studio and make it your own.
        </p>
        {/* Search */}
        <div style={{ maxWidth:480, margin:'0 auto', display:'flex', gap:8 }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search designs, rooms, styles…"
            style={{ flex:1, background:'rgba(255,255,255,0.06)', border:`1px solid ${T.border}`, color:T.text,
              padding:'11px 16px', fontFamily:T.F, fontSize:12, outline:'none' }}
            onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border} />
          <a href="/studio"
            style={{ padding:'11px 24px', background:`linear-gradient(135deg,${T.gold},${T.goldL})`, color:T.bg,
              fontFamily:T.F, fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase',
              textDecoration:'none', display:'flex', alignItems:'center' }}>
            + Create
          </a>
        </div>
      </div>

      <div style={{ maxWidth:1300, margin:'0 auto', padding:'0 24px 80px' }}>
        {/* Stats */}
        <div style={{ display:'flex', gap:32, padding:'24px 0', borderBottom:`1px solid ${T.border}`, marginBottom:28, overflowX:'auto' }}>
          {[['2,400+','Designs Shared'],['18K+','Community Members'],['75+','Furniture Items'],['4.9','Average Rating']].map(([n,l])=>(
            <div key={l} style={{ flexShrink:0 }}>
              <p style={{ fontFamily:T.S, fontSize:28, color:T.gold, margin:'0 0 2px', fontWeight:400 }}>{n}</p>
              <p style={{ fontFamily:T.F, fontSize:9, color:T.muted, margin:0, letterSpacing:'0.14em', textTransform:'uppercase' }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
          {STYLES.map(s=>(
            <button key={s} onClick={()=>setStyle(s)}
              style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase',
                padding:'6px 14px', background:style===s?T.gold:'transparent',
                border:`1px solid ${style===s?T.gold:T.border}`, color:style===s?T.bg:T.muted, cursor:'pointer' }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:28, alignItems:'center' }}>
          {ROOMS.map(r=>(
            <button key={r} onClick={()=>setRoom(r)}
              style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                padding:'5px 12px', background:room===r?`rgba(201,162,39,0.15)`:'transparent',
                border:`1px solid ${room===r?T.gold:T.border}`, color:room===r?T.gold:T.muted, cursor:'pointer' }}>
              {r}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <span style={{ fontFamily:T.F, fontSize:10, color:T.muted }}>{filtered.length} designs</span>
          {[['popular','Popular'],['name','A–Z']].map(([s,l])=>(
            <button key={s} onClick={()=>setSort(s)}
              style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                padding:'5px 10px', background:sort===s?T.gold:'transparent',
                border:`1px solid ${sort===s?T.gold:T.border}`, color:sort===s?T.bg:T.muted, cursor:'pointer' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
          {filtered.map(item=>(
            <GalleryCard key={item.id} item={item} featured={false} />
          ))}
        </div>

        {filtered.length===0 && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>◈</div>
            <h2 style={{ fontFamily:T.S, fontSize:28, color:T.text, margin:'0 0 10px', fontWeight:400 }}>No designs found</h2>
            <p style={{ fontFamily:T.F, fontSize:13, color:T.muted }}>Try adjusting the filters or search term</p>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop:64, textAlign:'center', padding:'48px', background:T.panel2, border:`1px solid ${T.borderG}` }}>
          <p style={{ fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:T.gold, margin:'0 0 12px' }}>◈ Share Your Vision</p>
          <h2 style={{ fontFamily:T.S, fontSize:36, color:T.text, margin:'0 0 16px', fontWeight:400 }}>Create Your Design Today</h2>
          <p style={{ fontFamily:T.F, fontSize:13, color:T.muted, margin:'0 0 28px' }}>Use our 2D + 3D dual studio — no sign-up needed to start.</p>
          <a href="/studio"
            style={{ display:'inline-block', padding:'14px 40px', background:`linear-gradient(135deg,${T.gold},${T.goldL})`,
              color:T.bg, fontFamily:T.F, fontSize:11, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase',
              textDecoration:'none', boxShadow:`0 8px 32px rgba(201,162,39,0.45)` }}>
            ✦ Open Design Studio — Free
          </a>
        </div>
      </div>
    </div>
  )
}
