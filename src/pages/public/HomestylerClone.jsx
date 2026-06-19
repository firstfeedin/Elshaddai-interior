import { useState, useRef, useEffect } from 'react'

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
const G  = '#c9a227'
const D  = '#0a0805'
const D2 = '#111009'
const D3 = '#1c1810'
const CR = '#faf8f3'
const ST = '#78716c'
const SERIF = { fontFamily:"'Cormorant Garamond',serif" }
const SANS  = { fontFamily:"'DM Sans',sans-serif" }

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const SERVICES = [
  { n:'01', title:'Modular Kitchen',      icon:'🍳', desc:'Custom modular kitchens with premium shutters, granite tops, soft-close hardware and full electrical & plumbing integration.', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80' },
  { n:'02', title:'Wardrobe & Storage',   icon:'🚪', desc:'Floor-to-ceiling wardrobes with sliding or swing doors, internal organisers, mirrors and custom finishes to maximise space.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80' },
  { n:'03', title:'Living Room Design',   icon:'🛋️', desc:'TV units, entertainment walls, crockery cabinets, false ceilings and feature walls designed as one cohesive space.', img:'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80' },
  { n:'04', title:'Bedroom Design',       icon:'🛏️', desc:'Master, kids and guest bedrooms — bed backs, wardrobes and soft furnishings tailored to each occupant.', img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80' },
  { n:'05', title:'False Ceiling',        icon:'✨', desc:'Gypsum, POP and wooden false ceilings with cove lighting, recessed LEDs and AC integration.', img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  { n:'06', title:'Flooring',             icon:'🏠', desc:'Vitrified tiles, wooden flooring, epoxy, Kota stone and marble — supply, laying and finishing with precision.', img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80' },
  { n:'07', title:'Pooja Room',           icon:'🪔', desc:'Sacred spaces crafted with marble mandirs, teak wood jaalis, backlit niches and traditional carvings.', img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80' },
  { n:'08', title:'Kids Room',            icon:'🎨', desc:'Fun, safe and functional kids rooms with themed wall art, study zones and custom bunk beds.', img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=800&q=80' },
  { n:'09', title:'Bathroom Design',      icon:'🚿', desc:'Wet areas redesigned with anti-skid tiles, concealed cisterns, rain showers and premium sanitaryware.', img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80' },
  { n:'10', title:'Home Office',          icon:'💻', desc:'Ergonomic workstations, built-in bookshelves, acoustic panels and smart lighting for productivity.', img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=80' },
  { n:'11', title:'Commercial Interiors', icon:'🏢', desc:'Offices, retail stores, restaurants and clinics — brand-aligned interiors with full execution.', img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  { n:'12', title:'Turnkey Execution',    icon:'🔑', desc:'From concept to keys — design, materials, civil work, electrical and plumbing under one fixed price.', img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80' },
]

const PROJECTS = [
  { tag:'Featured', title:'Sharma Residence', sub:'Living & Dining · 2,400 sq ft · Jubilee Hills',
    img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85', style:'Contemporary' },
  { tag:'New',      title:'Mehta Villa',       sub:'Full Home · 4,200 sq ft · Banjara Hills',
    img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=85', style:'Modern Luxury' },
  { tag:null,       title:'Kapoor Office',     sub:'Corporate · 1,500 sq ft · Hitech City',
    img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85', style:'Corporate' },
]

const AI_FEATURES = [
  { icon:'✍️', title:'Text to Room',          desc:'Describe your room in plain English — get a complete 3D design in seconds.',             badge:'AI Generation'  },
  { icon:'📸', title:'Photo to Design',        desc:'Upload any room photo and get instant AI-generated redesign concepts.',                  badge:'AI Redesign'    },
  { icon:'🎨', title:'Smart Palette',          desc:'Click any surface and get harmonious material, texture and colour combos instantly.',    badge:'AI Materials'   },
  { icon:'📐', title:'AI Floor Plan',          desc:'Describe your home dimensions and lifestyle — AI draws the optimised floor plan.',        badge:'Plan Generator' },
  { icon:'🛋️', title:'Auto Furniture Arrange', desc:'Drop furniture and let AI auto-arrange for best flow, ergonomics and focal points.',    badge:'Smart Layout'   },
  { icon:'💰', title:'Instant BOQ',            desc:'Instant bill of quantities with live ₹ pricing and budget-friendly alternatives.',       badge:'Cost AI'        },
]

const STATS = [
  { n:'450+', label:'Projects Delivered' },
  { n:'12+',  label:'Years Experience'   },
  { n:'98%',  label:'Client Satisfaction'},
  { n:'8',    label:'Cities Served'      },
]

const TESTIMONIALS = [
  { quote:'El Shaddai transformed our 3BHK in 6 weeks. The 3D preview was spot-on — what we saw digitally is exactly what we got. Exceptional attention to detail.', author:'Priya Sharma', role:'Homeowner, Jubilee Hills', stars:5 },
  { quote:'Professional team, transparent pricing, zero surprises. The modular kitchen is absolutely stunning and the workmanship quality is unmatched at this price point.', author:'Rajesh Mehta', role:'Villa Owner, Banjara Hills', stars:5 },
  { quote:'From the AI design wizard to final handover, the process was seamless. The design team understood exactly what we needed without us having to repeat ourselves.', author:'Ananya Kapoor', role:'MD, Tech Startup, Hitech City', stars:5 },
]

const TEMPLATES = [
  { title:'Mommy\'s Kitchen',     author:'Emily Design',  img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=70', room:'Kitchen',    style:'Modern-Style'  },
  { title:'Colonial Living',      author:'Ashley G',      img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=70', room:'Living',     style:'Mid-Century'   },
  { title:'MK Bedroom Suite',     author:'Anastasia',     img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=70', room:'Bedroom',   style:'Minimalist'    },
  { title:'Nordic Living',        author:'Lena B',        img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=400&q=70', room:'Living',    style:'Scandinavian'  },
  { title:'Japandi Bedroom',      author:'Yuki M',        img:'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=400&q=70', room:'Bedroom',    style:'Japandi'       },
  { title:'Industrial Loft',      author:'Marco R',       img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=70', room:'Living',   style:'Industrial'    },
  { title:'Boho Sanctuary',       author:'Priya S',       img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=70', room:'Bedroom',  style:'Bohemian'      },
  { title:'Warm Dining',          author:'Carlos M',      img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=70', room:'Dining',   style:'Warm-Beige'    },
  { title:'Minimal Office',       author:'Riya K',        img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=400&q=70', room:'Office',   style:'Minimalist'    },
  { title:'Mid-Century Lounge',   author:'Tom H',         img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70', room:'Living',   style:'Mid-Century'   },
  { title:'Luxe Master Bath',     author:'Sofia R',       img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=70', room:'Bathroom',   style:'Modern-Style'  },
  { title:'Dark Mode Living',     author:'Dev K',         img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=70', room:'Living',   style:'Industrial'    },
  { title:'Japandi Home Office',  author:'Kenji T',       img:'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?auto=format&fit=crop&w=400&q=70', room:'Office',   style:'Japandi'       },
  { title:'French Country',       author:'Marie D',       img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=70', room:'Living',   style:'Warm-Beige'    },
  { title:'Scandinavian Kitchen', author:'Ingrid L',      img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=400&q=70', room:'Kitchen',    style:'Scandinavian'  },
  { title:'Vastu Bedroom',        author:'Meera R',       img:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&q=70', room:'Bedroom',    style:'Mid-Century'   },
  { title:'Smart Home Hub',       author:'Raj P',         img:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=70', room:'Living',     style:'Modern-Style'  },
  { title:'Marble Bath Luxury',   author:'Elena V',       img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=70', room:'Bathroom',   style:'Minimalist'    },
  { title:'Bohemian Kids Room',   author:'Nina P',        img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=70', room:'Kids',       style:'Bohemian'      },
  { title:'Warm Reading Nook',    author:'Arjun V',       img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=70', room:'Office',   style:'Warm-Beige'    },
]

const REFS_3D = [
  { room:'Living Room',  style:'Modern',       img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=75' },
  { room:'Bedroom',      style:'Minimalist',   img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=75' },
  { room:'Kitchen',      style:'Scandinavian', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=75' },
  { room:'Dining Room',  style:'Warm Beige',   img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=75' },
  { room:'Bathroom',     style:'Luxury',       img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=75' },
  { room:'Home Office',  style:'Industrial',   img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=75' },
  { room:'Living Room',  style:'Japandi',      img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=75' },
  { room:'Bedroom',      style:'Mid-Century',  img:'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=600&q=75' },
  { room:'Kids Room',    style:'Playful',      img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=75' },
  { room:'Terrace',      style:'Boho',         img:'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=600&q=75' },
  { room:'Pooja Room',   style:'Traditional',  img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=75' },
  { room:'Study Room',   style:'Classic',      img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=75' },
  { room:'Living Room',  style:'Dark Mode',    img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=75' },
  { room:'Master Suite', style:'Luxe',         img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=75' },
  { room:'Kitchen',      style:'Modular',      img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=600&q=75' },
  { room:'Office',       style:'Corporate',    img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=75' },
  { room:'Bedroom',      style:'Cozy',         img:'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?auto=format&fit=crop&w=600&q=75' },
  { room:'Dining',       style:'Modern',       img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=75' },
  { room:'Balcony',      style:'Garden',       img:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=600&q=75' },
  { room:'Living Room',  style:'Luxury',       img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=75' },
  { room:'Bedroom',      style:'Warm',         img:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=75' },
  { room:'Bathroom',     style:'Marble',       img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=75' },
  { room:'Living Room',  style:'French',       img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=75' },
]

const STYLE_TABS = ['Mid-Century','Modern-Style','Minimalist','Japandi','Warm-Beige','Industrial','Scandinavian','Bohemian']

/* ─── Scroll-reveal hook ─────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal,.reveal-left,.reveal-scale')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ─── Counter animation hook ─────────────────────────────────────────────────── */
function useCountUp(target, duration = 1800) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const numeric = parseInt(target.replace(/\D/g,''))
      const start = Date.now()
      const tick = () => {
        const p = Math.min((Date.now()-start)/duration, 1)
        setVal(Math.floor(p*numeric))
        if (p < 1) requestAnimationFrame(tick)
        else setVal(numeric)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])
  return { val, ref }
}

/* ─── Template Gallery ───────────────────────────────────────────────────────── */
function TemplateGallery() {
  const [tab,  setTab]  = useState('Mid-Century')
  const [mode, setMode] = useState('room')
  const display = TEMPLATES.filter(t => t.style === tab).slice(0,8)
  const shown = display.length > 0 ? display : TEMPLATES.slice(0,8)

  return (
    <section style={{ background:CR, padding:'100px 40px 80px' }}>
      <div style={{ maxWidth:1360, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:20, marginBottom:40 }}>
          <div>
            <p style={{ ...SANS, fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>500+ Free Templates</p>
            <h2 style={{ ...SERIF, fontSize:'clamp(28px,3.5vw,52px)', fontWeight:300, color:D, margin:0, lineHeight:1.05 }}>
              Start with a <em>template</em>
            </h2>
          </div>
          <div style={{ display:'flex', border:'1px solid #e5e0d8', overflow:'hidden' }}>
            {['room','whole'].map(m=>(
              <button key={m} onClick={()=>setMode(m)}
                style={{ ...SANS, fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', padding:'10px 22px', border:'none', cursor:'pointer', transition:'all 0.2s', background:mode===m?D:'transparent', color:mode===m?'#fff':ST }}>
                {m==='room'?'Room':'Whole House'}
              </button>
            ))}
          </div>
        </div>

        {/* Style Tabs */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:36 }}>
          {STYLE_TABS.map(s=>(
            <button key={s} onClick={()=>setTab(s)}
              style={{ ...SANS, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'8px 18px', border:`1px solid ${tab===s?G:'#ddd8d0'}`, cursor:'pointer', transition:'all 0.2s', background:tab===s?G:'transparent', color:tab===s?D:ST }}>
              {s}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:16 }}>
          {shown.map((t,i)=>(
            <a key={i} href="/studio" className="reveal" style={{ textDecoration:'none', display:'block', background:'#fff', border:'1px solid #ede9e3', animationDelay:`${i*50}ms`, transition:'all 0.3s' }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.12)';e.currentTarget.style.transform='translateY(-4px)'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}>
              <div style={{ position:'relative', paddingBottom:'66%', overflow:'hidden' }}>
                <img src={t.img} alt={t.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s ease' }} loading="lazy"
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} />
                <div style={{ position:'absolute', top:10, left:10, background:'#16a34a', color:'#fff', fontSize:9, fontWeight:800, padding:'3px 8px', letterSpacing:'0.1em' }}>FREE</div>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <p style={{ ...SANS, fontSize:12, fontWeight:700, color:D, margin:'0 0 3px' }}>{t.title}</p>
                <p style={{ ...SANS, fontSize:10, color:'#a8a29e', margin:'0 0 10px' }}>by {t.author} · {t.room}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ ...SANS, fontSize:9, color:ST, background:'#f5f2ed', padding:'3px 8px', letterSpacing:'0.06em' }}>{t.style}</span>
                  <span style={{ color:G, fontSize:13 }}>→</span>
                </div>
              </div>
            </a>
          ))}
          <a href="/studio"
            style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'transparent', border:'2px dashed #ddd8d0', minHeight:220, gap:12, textDecoration:'none', transition:'border-color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=G}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#ddd8d0'}>
            <div style={{ width:44, height:44, background:D, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:22 }}>+</div>
            <p style={{ ...SANS, fontSize:11, fontWeight:700, color:D, margin:0 }}>View All 500+ Templates</p>
            <p style={{ ...SANS, fontSize:10, color:'#a8a29e', margin:0 }}>All free · No sign-in needed</p>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── 3D Gallery ──────────────────────────────────────────────────────────────── */
function ThreeDGallery() {
  const [hov,   setHov]   = useState(null)
  const [filter,setFilter]= useState('All')
  const types = ['All','Living Room','Bedroom','Kitchen','Bathroom','Dining Room','Home Office']
  const shown = filter==='All' ? REFS_3D : REFS_3D.filter(r=>r.room===filter)
  return (
    <>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:32, justifyContent:'center' }}>
        {types.map(t=>(
          <button key={t} onClick={()=>setFilter(t)}
            style={{ ...SANS, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'7px 18px', border:`1px solid ${filter===t?G:'rgba(255,255,255,0.15)'}`, cursor:'pointer', transition:'all 0.2s', background:filter===t?G:'transparent', color:filter===t?D:'rgba(255,255,255,0.55)' }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:3 }}>
        {shown.map((r,i)=>(
          <a key={i} href="/studio"
            style={{ position:'relative', display:'block', paddingBottom:'75%', overflow:'hidden', textDecoration:'none' }}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <img src={r.img} alt={r.room} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease', transform:hov===i?'scale(1.07)':'scale(1)' }} loading="lazy"/>
            <div style={{ position:'absolute', inset:0, background:hov===i?'rgba(0,0,0,0.55)':'rgba(0,0,0,0.2)', transition:'background 0.3s', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:14 }}>
              <p style={{ ...SANS, fontSize:11, fontWeight:700, color:'#fff', margin:'0 0 2px', opacity:hov===i?1:0, transition:'opacity 0.3s' }}>{r.room}</p>
              <p style={{ ...SANS, fontSize:9, color:'rgba(255,255,255,0.6)', margin:0, opacity:hov===i?1:0, transition:'opacity 0.3s 0.04s' }}>{r.style} Style</p>
            </div>
            {hov===i && <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:G, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:D, fontWeight:700 }}>+</div>}
          </a>
        ))}
      </div>
      <div style={{ textAlign:'center', marginTop:48 }}>
        <a href="/studio" style={{ ...SANS, display:'inline-flex', alignItems:'center', gap:12, background:G, color:D, padding:'16px 48px', fontWeight:800, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', textDecoration:'none', transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#e8c84e';e.currentTarget.style.transform='translateY(-2px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background=G;e.currentTarget.style.transform='none'}}>
          Open Design Studio →
        </a>
      </div>
    </>
  )
}

/* ─── Stat counter card ──────────────────────────────────────────────────────── */
function StatCard({ n, label }) {
  const suffix = n.replace(/[0-9]/g,'')
  const { val, ref } = useCountUp(n)
  return (
    <div ref={ref} style={{ textAlign:'center', padding:'40px 20px' }}>
      <p style={{ ...SERIF, fontSize:'clamp(52px,5vw,80px)', fontWeight:300, color:'#fff', margin:'0 0 8px', lineHeight:1 }}>
        {val}{suffix}
      </p>
      <p style={{ ...SANS, fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', margin:0, fontWeight:600 }}>{label}</p>
    </div>
  )
}

/* ─── FAQ ─────────────────────────────────────────────────────────────────────── */
const FAQS = [
  { q:'How does the AI design work?', a:"Fill the Quick Design Wizard (2 min) with your property type, area, rooms, budget and style preference. Our AI generates multiple 3D concepts including furniture layout, material palette, lighting plan and cost estimate. A senior designer reviews and refines before presenting to you." },
  { q:'How much does an El Shaddai project cost?', a:"A typical 2BHK apartment (1000–1200 sq ft) with premium finishes ranges ₹8–14 Lakhs. Use our Cost Estimator for an instant personalised figure. All prices include design, manufacturing, installation and a 5-year warranty." },
  { q:'Can I modify the AI-generated design?', a:"Absolutely. The AI design is your starting point. After the initial generation you can change materials, swap furniture, adjust layouts and modify any room in our interactive 3D viewer. Our designer is available for video calls to walk through changes." },
  { q:'How long does the entire process take?', a:"AI generation: instant. Designer review & approval: 3–5 days. Manufacturing: 14–21 days. Installation: 5–10 days. Total: typically 4–6 weeks from approval to handover." },
  { q:'Do you manufacture your own furniture?', a:"Yes. Our in-house CNC manufacturing unit means zero middlemen, tighter quality control, faster delivery and direct warranty on every piece. Your design goes directly from our screen to our factory floor." },
  { q:'Is the initial AI design brief free?', a:"The Quick Design Wizard and initial AI brief are completely free. No credit card, no commitment. You only pay when you formally approve the final design and sign the project agreement." },
]

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function HomestylerClone() {
  useReveal()

  /* Contact form */
  const [form, setForm] = useState({ name:'', email:'', phone:'', city:'', message:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  /* Newsletter */
  const [email, setEmail] = useState('')
  const [nSent, setNSent] = useState(false)

  /* Cookie consent */
  const [cookie, setCookie] = useState(() => localStorage.getItem('es_cookie') === 'yes')

  /* Social proof popup */
  const POPUPS = [
    {name:'Priya S.',city:'Hyderabad',action:'booked a consultation'},{name:'Ravi K.',city:'Bangalore',action:'started their AI design'},
    {name:'Meena R.',city:'Mumbai',   action:'requested a quote'    },{name:'Ajay T.',city:'Pune',     action:'viewed floor plans'    },
    {name:'Lakshmi N.',city:'Hyderabad',action:'booked a consultation'},{name:'Suresh G.',city:'Delhi',action:'started their AI design'},
  ]
  const [popup, setPopup] = useState(null)
  useEffect(() => {
    const t1 = setTimeout(()=>setPopup(POPUPS[0]), 5000)
    const t2 = setTimeout(()=>setPopup(null),       9000)
    let idx = 1
    const iv = setInterval(()=>{ setPopup(POPUPS[idx%POPUPS.length]); idx++; setTimeout(()=>setPopup(null),3500); }, 14000)
    return ()=>{ clearTimeout(t1); clearTimeout(t2); clearInterval(iv) }
  }, [])

  /* FAQ */
  const [faqOpen, setFaqOpen] = useState(0)

  /* Hero image parallax (subtle) */
  const heroRef = useRef(null)
  useEffect(()=>{
    const el = heroRef.current; if (!el) return
    const onScroll = () => { el.style.backgroundPositionY = `${window.scrollY * 0.3}px` }
    window.addEventListener('scroll', onScroll, { passive:true })
    return ()=>window.removeEventListener('scroll', onScroll)
  },[])

  async function handleSubmit(e) {
    e.preventDefault(); setSending(true)
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ access_key:'20e5a729-9a98-4234-b88a-470634b6d474', ...form, subject:`New enquiry from ${form.name}` })
      })
      if (res.ok) setSent(true)
    } catch {}
    setSending(false)
  }

  async function handleNewsletter(e) {
    e.preventDefault()
    if (!email) return
    try { await fetch('/api/newsletter', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email}) }) } catch {}
    setNSent(true)
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", overflowX:'hidden' }}>

      {/* ══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', background:`url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=90) center/cover no-repeat`, paddingTop:130 }}>
        {/* Dark gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(120deg, rgba(10,8,5,0.92) 0%, rgba(10,8,5,0.7) 55%, rgba(10,8,5,0.4) 100%)' }} />

        <div style={{ position:'relative', zIndex:1, maxWidth:1360, margin:'0 auto', padding:'0 40px', display:'grid', gridTemplateColumns:'1fr auto', gap:60, alignItems:'center', width:'100%' }}>
          {/* Left — main copy */}
          <div>
            {/* Eyebrow */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
              <span style={{ display:'block', width:40, height:1, background:G }} />
              <p style={{ ...SANS, fontSize:10, letterSpacing:'0.38em', textTransform:'uppercase', fontWeight:700, color:G, margin:0 }}>
                Premium Interior Design Studio
              </p>
            </div>

            {/* Headline */}
            <h1 style={{ ...SERIF, fontSize:'clamp(52px,6.5vw,104px)', fontWeight:300, color:'#fff', lineHeight:1.0, margin:'0 0 28px' }}>
              Spaces designed<br/>
              to outlast<br/>
              <em style={{ color:G, fontStyle:'italic' }}>every trend.</em>
            </h1>

            <p style={{ ...SANS, fontSize:15, color:'rgba(255,255,255,0.55)', maxWidth:460, lineHeight:1.85, margin:'0 0 44px', fontWeight:300 }}>
              AI-powered 3D design studio meets 50+ years of craft. Draw your floor plan, visualise every detail in real-time 3D, and get it built — all in one platform.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <a href="/studio"
                style={{ ...SANS, display:'inline-flex', alignItems:'center', gap:10, background:G, color:D, padding:'16px 40px', fontWeight:800, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', textDecoration:'none', transition:'all 0.25s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='#e8c84e';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background=G;e.currentTarget.style.transform='none'}}>
                ✦ Open Studio Free
              </a>
              <a href="#contact"
                style={{ ...SANS, display:'inline-flex', alignItems:'center', gap:10, border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'16px 40px', fontWeight:600, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', textDecoration:'none', transition:'all 0.25s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=G;e.currentTarget.style.color=G}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.3)';e.currentTarget.style.color='#fff'}}>
                Book Free Consultation
              </a>
            </div>

            {/* Social proof line */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:40 }}>
              <div style={{ display:'flex' }}>
                {['👩','👨','👩','👨','👩'].map((e,i)=>(
                  <div key={i} style={{ width:32, height:32, background:`hsl(${30+i*15},50%,${55+i*5}%)`, border:'2px solid rgba(10,8,5,0.8)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, marginLeft:i>0?-10:0 }}>{e}</div>
                ))}
              </div>
              <div>
                <p style={{ ...SANS, margin:0, fontSize:12, color:'rgba(255,255,255,0.85)', fontWeight:600 }}>450+ happy homeowners</p>
                <p style={{ ...SANS, margin:0, fontSize:10, color:'rgba(255,255,255,0.4)' }}>across 8 Indian cities</p>
              </div>
              <div style={{ display:'flex', gap:2 }}>{'★★★★★'.split('').map((_,i)=><span key={i} style={{ color:G, fontSize:14 }}>★</span>)}</div>
            </div>
          </div>

          {/* Right — floating stats panel */}
          <div className="mobile-hide" style={{ display:'flex', flexDirection:'column', gap:12, minWidth:200 }}>
            {[
              { label:'Projects Delivered', val:'450+', icon:'🏠' },
              { label:'Years Experience',   val:'12+',  icon:'🎨' },
              { label:'Client Satisfaction',val:'98%',  icon:'⭐' },
              { label:'Cities Served',      val:'8',    icon:'📍' },
            ].map((s,i)=>(
              <div key={i} className="glass" style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:16 }}>
                <span style={{ fontSize:22 }}>{s.icon}</span>
                <div>
                  <p style={{ ...SERIF, fontSize:28, fontWeight:500, color:'#fff', margin:0, lineHeight:1 }}>{s.val}</p>
                  <p style={{ ...SANS, fontSize:10, color:'rgba(255,255,255,0.4)', margin:0, letterSpacing:'0.1em' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <p style={{ ...SANS, fontSize:9, letterSpacing:'0.3em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>Scroll</p>
          <div style={{ width:1, height:48, background:'linear-gradient(to bottom,rgba(255,255,255,0.3),transparent)' }} />
        </div>
      </section>

      {/* ══ MARQUEE ════════════════════════════════════════════════════════════ */}
      <div style={{ background:G, padding:'14px 0', overflow:'hidden' }}>
        <div style={{ display:'flex', whiteSpace:'nowrap', animation:'ticker 35s linear infinite' }}>
          {[...Array(3)].map((_,di)=>(
            <span key={di} style={{ display:'inline-flex', gap:0 }}>
              {['Modular Kitchen','Bedroom Design','Living Room','False Ceiling','Wardrobe','Home Office','Bathroom','Pooja Room','Turnkey Execution','Commercial Interiors'].map((s,i)=>(
                <span key={i} style={{ ...SANS, fontSize:11, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:D, padding:'0 32px' }}>
                  ✦ {s}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ CREATE FLOOR PLAN ══════════════════════════════════════════════════ */}
      <section style={{ background:D2, padding:'88px 40px' }}>
        <div style={{ maxWidth:1360, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 16px' }}>Design Studio</p>
            <h2 style={{ ...SERIF, fontSize:'clamp(28px,3.5vw,52px)', fontWeight:300, color:'#fff', margin:0, lineHeight:1.05 }}>
              Create a <em style={{ color:G }}>Floor Plan</em>
            </h2>
            <p style={{ ...SANS, fontSize:13, color:'rgba(255,255,255,0.35)', maxWidth:460, margin:'16px auto 0', lineHeight:1.8 }}>
              Five ways to start your interior journey — upload an existing plan or draw from scratch in 2D, then watch it come alive in 3D.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
            {[
              { icon:'🖼', label:'Import Image',  desc:'JPG, PNG floor plan', href:'/studio', badge:null        },
              { icon:'📐', label:'Import CAD',    desc:'DXF / DWG files',     href:'/studio', badge:null        },
              { icon:'✏️', label:'New Design',    desc:'Start from scratch',  href:'/studio', badge:null        },
              { icon:'📁', label:'My Designs',    desc:'Open saved projects', href:'/login',  badge:null        },
              { icon:'🤖', label:'AI Planner',    desc:'AI floor plan magic', href:'/studio', badge:'NEW'       },
            ].map((c,i)=>(
              <a key={c.label} href={c.href} className="glass reveal" style={{ textDecoration:'none', display:'block', padding:'32px 20px', textAlign:'center', position:'relative', transition:'all 0.3s', animationDelay:`${i*80}ms` }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(201,162,39,0.08)';e.currentTarget.style.borderColor='rgba(201,162,39,0.4)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}>
                {c.badge && <span style={{ position:'absolute', top:12, right:12, background:'#ef4444', color:'#fff', fontSize:8, fontWeight:800, padding:'3px 7px', letterSpacing:'0.1em' }}>{c.badge}</span>}
                <div style={{ fontSize:36, marginBottom:16 }}>{c.icon}</div>
                <p style={{ ...SANS, fontSize:13, fontWeight:700, color:'#fff', margin:'0 0 6px' }}>{c.label}</p>
                <p style={{ ...SANS, fontSize:10, color:'rgba(255,255,255,0.35)', margin:0 }}>{c.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════════════════════ */}
      <section style={{ background:D, position:'relative', overflow:'hidden' }}>
        {/* Decorative gold line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
        <div style={{ maxWidth:1360, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderLeft:`1px solid rgba(201,162,39,0.1)` }}>
          {STATS.map((s,i)=>(
            <div key={i} style={{ borderRight:`1px solid rgba(201,162,39,0.1)` }}>
              <StatCard n={s.n} label={s.label} />
            </div>
          ))}
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />
      </section>

      {/* ══ FEATURED PROJECTS ══════════════════════════════════════════════════ */}
      <section style={{ background:CR, padding:'100px 40px' }}>
        <div style={{ maxWidth:1360, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:56, flexWrap:'wrap', gap:16 }}>
            <div>
              <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>Our Work</p>
              <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(28px,3.5vw,54px)', fontWeight:300, color:D, margin:0, lineHeight:1.05 }}>
                Recent <em>Projects</em>
              </h2>
            </div>
            <a href="/portfolio" className="reveal" style={{ ...SANS, fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:D, textDecoration:'none', borderBottom:`1px solid ${D}`, paddingBottom:2, transition:'color 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G}}
              onMouseLeave={e=>{e.currentTarget.style.color=D;e.currentTarget.style.borderBottomColor=D}}>
              View All Portfolio →
            </a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:3 }}>
            {PROJECTS.map((p,i)=>(
              <div key={i} className="reveal img-zoom" style={{ position:'relative', paddingBottom:i===0?'60%':'80%', overflow:'hidden', background:'#1a1a1a' }}>
                <img src={p.img} alt={p.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} loading="lazy"/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(10,8,5,0.85) 0%,rgba(10,8,5,0.1) 60%)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:28 }}>
                  {p.tag && <span style={{ ...SANS, fontSize:9, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', color:G, marginBottom:8 }}>{p.tag}</span>}
                  <h3 style={{ ...SERIF, fontSize:i===0?'clamp(22px,2vw,32px)':'clamp(16px,1.5vw,22px)', fontWeight:400, color:'#fff', margin:'0 0 6px' }}>{p.title}</h3>
                  <p style={{ ...SANS, fontSize:10, color:'rgba(255,255,255,0.5)', margin:0 }}>{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEMPLATE GALLERY ═══════════════════════════════════════════════════ */}
      <TemplateGallery />

      {/* ══ SERVICES ═══════════════════════════════════════════════════════════ */}
      <section id="services" style={{ background:D, padding:'100px 40px' }}>
        <div style={{ maxWidth:1360, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:60, flexWrap:'wrap', gap:16 }}>
            <div>
              <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>What We Build</p>
              <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(28px,3.5vw,54px)', fontWeight:300, color:'#fff', margin:0, lineHeight:1.05 }}>
                12 Services,<br/><em style={{ color:G }}>One Fixed Price.</em>
              </h2>
            </div>
            <p className="reveal" style={{ ...SANS, fontSize:13, color:'rgba(255,255,255,0.35)', maxWidth:320, lineHeight:1.8, margin:0 }}>
              Every service is in-house designed, manufactured and installed. No subcontracting. No markup chain.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:2 }}>
            {SERVICES.map((s,i)=>(
              <ServiceCard key={i} s={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3D DESIGN REFERENCES ═══════════════════════════════════════════════ */}
      <section style={{ background:'#0a0c12', padding:'100px 40px' }}>
        <div style={{ maxWidth:1360, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>3D Design References</p>
            <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(28px,3.5vw,52px)', fontWeight:300, color:'#fff', margin:'0 0 12px', lineHeight:1.05 }}>
              23+ Photorealistic <em style={{ color:G }}>3D Rooms</em>
            </h2>
            <p className="reveal" style={{ ...SANS, fontSize:13, color:'rgba(255,255,255,0.35)', maxWidth:480, margin:'0 auto', lineHeight:1.8 }}>
              Browse curated 3D interior references. Click any image to open it in the studio.
            </p>
          </div>
          <ThreeDGallery />
        </div>
      </section>

      {/* ══ 3D CATALOG STRIP ═══════════════════════════════════════════════════ */}
      <section style={{ background:CR, padding:'88px 40px', borderBottom:'1px solid #e9e5de' }}>
        <div style={{ maxWidth:1360, margin:'0 auto', textAlign:'center' }}>
          <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>Furniture & 3D Models</p>
          <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(26px,3vw,50px)', fontWeight:300, color:D, margin:'0 0 12px', lineHeight:1.05 }}>
            Enhance Your Designs with<br/><em>10M+ Realistic 3D Models</em>
          </h2>
          <p className="reveal" style={{ ...SANS, fontSize:13, color:ST, maxWidth:480, margin:'0 auto 52px', lineHeight:1.8 }}>
            Drag and drop from our GLB/GLTF furniture catalog — sofas, beds, kitchens, lighting and more.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:2, marginBottom:44 }}>
            {[
              {icon:'🛋',label:'Sofas',     n:'1,240+'},{icon:'🛏',label:'Beds',      n:'840+' },
              {icon:'🍽',label:'Dining',    n:'620+' },{icon:'💡',label:'Lighting',  n:'980+' },
              {icon:'🚿',label:'Bathroom',  n:'430+' },{icon:'🍳',label:'Kitchen',   n:'560+' },
              {icon:'🪑',label:'Chairs',    n:'1,100+'},{icon:'🗄',label:'Storage',   n:'720+' },
              {icon:'🌿',label:'Plants',    n:'390+' },{icon:'🖼',label:'Wall Art',  n:'850+' },
              {icon:'🪞',label:'Mirrors',   n:'280+' },{icon:'🪟',label:'Windows',   n:'340+' },
            ].map((c,i)=>(
              <a key={c.label} href="/studio" className="reveal" style={{ textDecoration:'none', display:'block', padding:'22px 10px', background:'#fff', border:'1px solid #e9e5de', textAlign:'center', transition:'all 0.25s', animationDelay:`${i*40}ms` }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=G;e.currentTarget.style.boxShadow=`0 4px 24px rgba(201,162,39,0.12)`;e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e9e5de';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}>
                <div style={{ fontSize:26, marginBottom:10 }}>{c.icon}</div>
                <p style={{ ...SANS, fontSize:11, fontWeight:700, color:D, margin:'0 0 2px' }}>{c.label}</p>
                <p style={{ ...SANS, fontSize:9, color:'#a8a29e', margin:0 }}>{c.n}</p>
              </a>
            ))}
          </div>
          <a href="/studio" style={{ ...SANS, display:'inline-flex', alignItems:'center', gap:12, background:D, color:'#fff', padding:'16px 48px', fontWeight:700, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', textDecoration:'none', transition:'all 0.25s' }}
            onMouseEnter={e=>{e.currentTarget.style.background=G;e.currentTarget.style.color=D}}
            onMouseLeave={e=>{e.currentTarget.style.background=D;e.currentTarget.style.color='#fff'}}>
            Browse Full Catalog →
          </a>
        </div>
      </section>

      {/* ══ AI FEATURES ════════════════════════════════════════════════════════ */}
      <section style={{ background:D3, padding:'100px 40px' }}>
        <div style={{ maxWidth:1360, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>Powered by Gemini AI</p>
            <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(28px,3.5vw,52px)', fontWeight:300, color:'#fff', margin:0, lineHeight:1.05 }}>
              Six AI features,<br/><em style={{ color:G }}>zero learning curve.</em>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:2 }}>
            {AI_FEATURES.map((f,i)=>(
              <div key={i} className="reveal" style={{ padding:'36px 32px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', transition:'all 0.35s', animationDelay:`${i*80}ms` }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(201,162,39,0.05)';e.currentTarget.style.borderColor='rgba(201,162,39,0.2)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'}}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                  <span style={{ fontSize:28 }}>{f.icon}</span>
                  <span style={{ ...SANS, fontSize:9, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', color:G, background:'rgba(201,162,39,0.1)', padding:'4px 10px' }}>{f.badge}</span>
                </div>
                <h3 style={{ ...SERIF, fontSize:22, fontWeight:400, color:'#fff', margin:'0 0 10px' }}>{f.title}</h3>
                <p style={{ ...SANS, fontSize:12, color:'rgba(255,255,255,0.4)', margin:0, lineHeight:1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:52 }}>
            <a href="/studio" style={{ ...SANS, display:'inline-flex', alignItems:'center', gap:10, background:G, color:D, padding:'16px 48px', fontWeight:800, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', textDecoration:'none', transition:'all 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#e8c84e';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.background=G;e.currentTarget.style.transform='none'}}>
              Try All AI Features Free →
            </a>
          </div>
        </div>
      </section>

      {/* ══ HOW WE WORK ════════════════════════════════════════════════════════ */}
      <section style={{ background:CR, padding:'100px 40px' }}>
        <div style={{ maxWidth:1360, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>Our Process</p>
            <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(28px,3.5vw,52px)', fontWeight:300, color:D, margin:0, lineHeight:1.05 }}>
              Four steps to your <em>dream space</em>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, position:'relative' }}>
            {/* Connector line */}
            <div style={{ position:'absolute', top:32, left:'12.5%', right:'12.5%', height:1, background:`linear-gradient(90deg,${G},rgba(201,162,39,0.2))` }} className="mobile-hide" />
            {[
              { step:'01', title:'We Listen First',          desc:'Every project starts with understanding your lifestyle, budget and vision before a single line is drawn.' },
              { step:'02', title:'We Design Transparently',  desc:'Fixed-price proposals, 3D previews and a full material schedule before you commit. No surprises.' },
              { step:'03', title:'We Build & Track',         desc:'Our in-house team handles every contractor, every delivery and every milestone — live tracking visible to you.' },
              { step:'04', title:'We Stay After Handover',   desc:'Warranty support, touch-ups and annual check-ins are part of every project.' },
            ].map((s,i)=>(
              <div key={i} className="reveal" style={{ padding:'0 32px 0 0', animationDelay:`${i*100}ms` }}>
                <div style={{ width:64, height:64, border:`1px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28 }}>
                  <span style={{ ...SERIF, fontSize:26, fontWeight:300, color:G }}>{s.step}</span>
                </div>
                <h3 style={{ ...SERIF, fontSize:22, fontWeight:400, color:D, margin:'0 0 12px' }}>{s.title}</h3>
                <p style={{ ...SANS, fontSize:12, color:ST, margin:0, lineHeight:1.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═══════════════════════════════════════════════════════ */}
      <section style={{ background:D, padding:'100px 40px' }}>
        <div style={{ maxWidth:1360, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>Client Stories</p>
            <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(28px,3.5vw,52px)', fontWeight:300, color:'#fff', margin:0 }}>
              What homeowners say
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="reveal" style={{ padding:'40px 36px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', position:'relative', animationDelay:`${i*100}ms` }}>
                <div style={{ ...SERIF, fontSize:72, color:`rgba(201,162,39,0.15)`, lineHeight:1, position:'absolute', top:20, left:28 }}>"</div>
                <div style={{ display:'flex', gap:3, marginBottom:20, position:'relative' }}>
                  {'★★★★★'.split('').map((_,j)=><span key={j} style={{ color:G, fontSize:13 }}>★</span>)}
                </div>
                <p style={{ ...SERIF, fontSize:17, fontWeight:300, color:'rgba(255,255,255,0.8)', lineHeight:1.75, margin:'0 0 28px', fontStyle:'italic', position:'relative' }}>"{t.quote}"</p>
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:20 }}>
                  <p style={{ ...SANS, fontSize:12, fontWeight:700, color:'#fff', margin:'0 0 3px' }}>{t.author}</p>
                  <p style={{ ...SANS, fontSize:10, color:'rgba(255,255,255,0.35)', margin:0, letterSpacing:'0.04em' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ════════════════════════════════════════════════════════════ */}
      <section id="contact" style={{ background:CR, padding:'100px 40px' }}>
        <div style={{ maxWidth:1360, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'start' }}>
          {/* Left */}
          <div>
            <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 16px' }}>Free Consultation</p>
            <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(28px,3.2vw,52px)', fontWeight:300, color:D, margin:'0 0 20px', lineHeight:1.05 }}>
              Let's design your<br/><em>perfect space.</em>
            </h2>
            <p className="reveal" style={{ ...SANS, fontSize:13, color:ST, lineHeight:1.85, margin:'0 0 40px', maxWidth:400 }}>
              Speak directly with one of our senior designers and get a free design brief and cost estimate for your home — no commitment needed.
            </p>
            {/* Benefits */}
            <div style={{ display:'flex', flexDirection:'column', gap:18 }} className="reveal">
              {[
                { icon:'🎨', t:'Free AI Design Brief',    d:'A tailored design concept ready in 24 hours.'         },
                { icon:'💰', t:'Accurate Cost Estimate',  d:'Detailed BOQ with material & labour breakdowns.'      },
                { icon:'📞', t:'Designer Video Call',     d:'30-minute session with a senior designer.'            },
                { icon:'📐', t:'Free Site Measurement',  d:'We visit and measure your space at no charge.'        },
              ].map((b,i)=>(
                <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{b.icon}</span>
                  <div>
                    <p style={{ ...SANS, fontSize:12, fontWeight:700, color:D, margin:'0 0 2px' }}>{b.t}</p>
                    <p style={{ ...SANS, fontSize:11, color:ST, margin:0 }}>{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:36, paddingTop:28, borderTop:'1px solid #e5e0d8' }}>
              <a href="mailto:contactus@divinemercyitsol.com" style={{ ...SANS, fontSize:12, color:ST, textDecoration:'none', display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                ✉️ contactus@divinemercyitsol.com
              </a>
              <p style={{ ...SANS, fontSize:12, color:ST, margin:0 }}>🕐 Mon–Sat, 9 AM – 7 PM IST</p>
            </div>
          </div>
          {/* Right — form */}
          <div>
            {sent ? (
              <div style={{ background:'#fff', border:'1px solid #e5e0d8', padding:'60px 48px', textAlign:'center' }}>
                <div style={{ width:72, height:72, background:G, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:32 }}>✓</div>
                <h3 style={{ ...SERIF, fontSize:32, fontWeight:300, color:D, margin:'0 0 12px' }}>Consultation Booked!</h3>
                <p style={{ ...SANS, fontSize:13, color:ST, lineHeight:1.8 }}>Our senior designer will contact you within 2 hours. Check your email for your free AI design brief.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background:'#fff', border:'1px solid #e5e0d8', padding:'48px 40px', display:'flex', flexDirection:'column', gap:20 }}>
                <div>
                  <h3 style={{ ...SERIF, fontSize:26, fontWeight:300, color:D, margin:'0 0 6px' }}>Get Started Today</h3>
                  <p style={{ ...SANS, fontSize:11, color:'#a8a29e', margin:0, letterSpacing:'0.04em' }}>Free · No commitment</p>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label style={{ ...SANS, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:ST, display:'block', marginBottom:8 }}>Full Name *</label>
                    <input required className="input-field" placeholder="Rajesh Kumar" value={form.name} onChange={set('name')} />
                  </div>
                  <div>
                    <label style={{ ...SANS, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:ST, display:'block', marginBottom:8 }}>City *</label>
                    <input required className="input-field" placeholder="Hyderabad" value={form.city} onChange={set('city')} />
                  </div>
                </div>
                <div>
                  <label style={{ ...SANS, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:ST, display:'block', marginBottom:8 }}>Email *</label>
                  <input required type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label style={{ ...SANS, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:ST, display:'block', marginBottom:8 }}>Message</label>
                  <textarea className="input-field" rows={3} placeholder="Tell us about your project…" value={form.message} onChange={set('message')} style={{ resize:'vertical' }} />
                </div>
                <button type="submit" disabled={sending}
                  style={{ ...SANS, background:sending?ST:G, color:D, border:'none', padding:'16px', fontWeight:800, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', cursor:sending?'not-allowed':'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{if(!sending)e.currentTarget.style.background='#e8c84e'}}
                  onMouseLeave={e=>{if(!sending)e.currentTarget.style.background=G}}>
                  {sending ? 'Sending…' : '✦ Book Free Consultation'}
                </button>
                <p style={{ ...SANS, fontSize:10, color:'#a8a29e', textAlign:'center', margin:0 }}>By submitting you agree to our Privacy Policy. We never spam.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════════════════════ */}
      <section style={{ background:D, padding:'88px 40px' }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p className="reveal" style={{ ...SANS, fontSize:10, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:G, margin:'0 0 12px' }}>FAQ</p>
            <h2 className="reveal" style={{ ...SERIF, fontSize:'clamp(26px,3vw,46px)', fontWeight:300, color:'#fff', margin:0 }}>Questions we get asked</h2>
          </div>
          <div>
            {FAQS.map((f,i)=>(
              <div key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={()=>setFaqOpen(faqOpen===i?-1:i)}
                  style={{ width:'100%', background:'none', border:'none', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'22px 0', gap:20, cursor:'pointer' }}>
                  <span style={{ ...SANS, fontSize:13, fontWeight:600, color:faqOpen===i?G:'rgba(255,255,255,0.8)', textAlign:'left' }}>{f.q}</span>
                  <span style={{ color:G, fontSize:20, lineHeight:1, flexShrink:0, transition:'transform 0.25s', transform:faqOpen===i?'rotate(45deg)':'none' }}>+</span>
                </button>
                {faqOpen===i && (
                  <div style={{ paddingBottom:24 }}>
                    <p style={{ ...SANS, fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.85, margin:0 }}>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer style={{ background:'#050402', padding:'80px 40px 0', borderTop:'1px solid rgba(201,162,39,0.08)' }}>
        <div style={{ maxWidth:1360, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr', gap:60, marginBottom:64 }}>
            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <div style={{ width:36, height:36, background:G, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/>
                    <circle cx="10" cy="8" r="1.8" fill={D}/>
                  </svg>
                </div>
                <div>
                  <span style={{ ...SERIF, display:'block', fontSize:18, fontWeight:600, color:'#fff', letterSpacing:'0.04em' }}>El Shaddai</span>
                  <span style={{ ...SANS, display:'block', fontSize:8, letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:700, color:G }}>Interiors &amp; Design</span>
                </div>
              </div>
              <p style={{ ...SANS, fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.85, maxWidth:300, margin:'0 0 28px' }}>
                Premium interior design studio combining AI technology with 50+ years of craft — Hyderabad and beyond.
              </p>
              <div style={{ display:'flex', gap:12 }}>
                {[
                  { label:'Instagram', href:'https://instagram.com/elshaddaiinteriors', icon:'📸' },
                  { label:'Facebook',  href:'https://facebook.com/elshaddaiinteriors',  icon:'👥' },
                  { label:'YouTube',   href:'https://youtube.com',                       icon:'▶️' },
                ].map(s=>(
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ width:36, height:36, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, textDecoration:'none', transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`rgba(201,162,39,0.12)`;e.currentTarget.style.borderColor=G}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            {/* Services */}
            <div>
              <h4 style={{ ...SANS, fontSize:9, fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:G, margin:'0 0 20px' }}>Services</h4>
              {['Modular Kitchen','Bedroom Design','Living Room','Wardrobe & Storage','False Ceiling','Flooring','Bathroom','Home Office'].map(s=>(
                <a key={s} href="#services" style={{ ...SANS, display:'block', fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:10, textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.75)'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>{s}</a>
              ))}
            </div>
            {/* Links */}
            <div>
              <h4 style={{ ...SANS, fontSize:9, fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:G, margin:'0 0 20px' }}>Company</h4>
              {[{t:'Studio',h:'/studio'},{t:'Portfolio',h:'/portfolio'},{t:'Pricing',h:'/pricing'},{t:'Blog',h:'/blog'},{t:'Contact',h:'#contact'},{t:'Sign In',h:'/login'}].map(l=>(
                <a key={l.t} href={l.h} style={{ ...SANS, display:'block', fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:10, textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.75)'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>{l.t}</a>
              ))}
            </div>
            {/* Newsletter */}
            <div>
              <h4 style={{ ...SANS, fontSize:9, fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:G, margin:'0 0 20px' }}>Stay Inspired</h4>
              <p style={{ ...SANS, fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.8, marginBottom:20 }}>Get design ideas, before-after reveals and exclusive offers monthly.</p>
              {nSent ? (
                <p style={{ ...SANS, fontSize:12, color:G, fontWeight:600 }}>✓ You're subscribed!</p>
              ) : (
                <form onSubmit={handleNewsletter} style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ ...SANS, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'12px 16px', fontSize:12, outline:'none', transition:'border-color 0.2s' }}
                    onFocus={e=>e.currentTarget.style.borderColor=G}
                    onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'} />
                  <button type="submit" style={{ ...SANS, background:G, color:D, border:'none', padding:'12px', fontWeight:800, fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', transition:'background 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#e8c84e'}
                    onMouseLeave={e=>e.currentTarget.style.background=G}>
                    Subscribe →
                  </button>
                </form>
              )}
              <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ ...SANS, fontSize:11, color:'rgba(255,255,255,0.35)', margin:'0 0 6px' }}>📍 Hyderabad, Telangana 500001</p>
                <a href="mailto:contactus@divinemercyitsol.com" style={{ ...SANS, fontSize:11, color:'rgba(255,255,255,0.35)', textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.color=G}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
                  ✉️ contactus@divinemercyitsol.com
                </a>
              </div>
            </div>
          </div>

          {/* Footer bottom bar */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'20px 0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ ...SANS, fontSize:10, color:'rgba(255,255,255,0.2)', margin:0 }}>© {new Date().getFullYear()} El Shaddai Interiors & Design. All rights reserved.</p>
            <div style={{ display:'flex', gap:20 }}>
              {['Privacy Policy','Terms of Service','Sitemap'].map(l=>(
                <a key={l} href="#" style={{ ...SANS, fontSize:10, color:'rgba(255,255,255,0.2)', textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.2)'}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ══ WHATSAPP ═══════════════════════════════════════════════════════════ */}
      <a href="https://wa.me/919876543210?text=Hi%20El%20Shaddai%2C%20I%27m%20interested%20in%20your%20interior%20design%20services."
        target="_blank" rel="noopener noreferrer"
        style={{ position:'fixed', bottom:28, right:28, zIndex:9999, width:56, height:56, background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(37,211,102,0.45)', transition:'all 0.2s' }}
        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1)';e.currentTarget.style.boxShadow='0 8px 32px rgba(37,211,102,0.6)'}}
        onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 20px rgba(37,211,102,0.45)'}}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* ══ SOCIAL PROOF POPUP ═════════════════════════════════════════════════ */}
      {popup && (
        <div style={{ position:'fixed', bottom:100, left:20, zIndex:9998, background:'#fff', border:`1px solid ${G}20`, padding:'14px 18px', maxWidth:280, boxShadow:'0 12px 40px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:12, animation:'slideIn 0.4s ease' }}>
          <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}`}</style>
          <div style={{ width:34, height:34, background:G, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>🏠</div>
          <div>
            <p style={{ ...SANS, margin:0, fontSize:11, fontWeight:700, color:D }}>{popup.name} from {popup.city}</p>
            <p style={{ ...SANS, margin:'2px 0 0', fontSize:10, color:ST }}>{popup.action} · just now</p>
          </div>
        </div>
      )}

      {/* ══ COOKIE CONSENT ═════════════════════════════════════════════════════ */}
      {!cookie && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:9997, background:D, borderTop:`1px solid rgba(201,162,39,0.15)`, padding:'16px 40px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <p style={{ ...SANS, fontSize:11, color:'rgba(255,255,255,0.5)', margin:0, maxWidth:600 }}>
            We use cookies to improve your experience and personalise our design recommendations. See our <a href="#" style={{ color:G }}>Privacy Policy</a>.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>{setCookie(true);localStorage.setItem('es_cookie','yes')}}
              style={{ ...SANS, background:G, color:D, border:'none', padding:'10px 24px', fontWeight:800, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer' }}>
              Accept All
            </button>
            <button onClick={()=>{setCookie(true);localStorage.setItem('es_cookie','min')}}
              style={{ ...SANS, background:'transparent', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.15)', padding:'10px 24px', fontWeight:600, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer' }}>
              Essentials Only
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Service Card ─────────────────────────────────────────────────────────── */
function ServiceCard({ s }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ position:'relative', padding:'36px 28px', background:hov?'rgba(201,162,39,0.05)':'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderColor:hov?'rgba(201,162,39,0.2)':'rgba(255,255,255,0.05)', transition:'all 0.35s', overflow:'hidden', cursor:'default', minHeight:200 }}>
      {/* Background image on hover */}
      <div style={{ position:'absolute', inset:0, backgroundImage:`url(${s.img})`, backgroundSize:'cover', backgroundPosition:'center', opacity:hov?0.1:0, transition:'opacity 0.5s' }} />
      <div style={{ position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
          <span style={{ ...SANS, fontSize:9, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', color:`rgba(201,162,39,${hov?'0.9':'0.4'})`, transition:'color 0.3s' }}>{s.n}</span>
          <span style={{ fontSize:24 }}>{s.icon}</span>
        </div>
        <h3 style={{ ...SERIF, fontSize:22, fontWeight:400, color:hov?'#fff':'rgba(255,255,255,0.75)', margin:'0 0 12px', transition:'color 0.3s' }}>{s.title}</h3>
        <p style={{ ...SANS, fontSize:11, color:`rgba(255,255,255,${hov?'0.55':'0.25'})`, lineHeight:1.8, margin:0, transition:'color 0.3s' }}>{s.desc}</p>
        {hov && <p style={{ ...SANS, fontSize:10, color:G, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', margin:'18px 0 0' }}>Learn More →</p>}
      </div>
    </div>
  )
}
