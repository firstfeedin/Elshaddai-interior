/**
 * El Shaddai — Ultra-Premium Homepage
 * Palette: Blush Marble & Graphite — Fendi Casa · Giorgio Armani Hotels · Italian Luxury
 * Design language: Cinematic · Editorial · Minimal · Luxe
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'

/* ─── Tokens — Blush Marble & Graphite ───────────────────────────────────── */
const CREAM  = '#f5ede8'   /* Blush marble — warm background */
const DARK   = '#2a0e14'   /* Deep Burgundy — primary dark */
const DARK2  = '#1e0a0e'   /* Wine — dark sections */
const WHITE  = '#ffffff'
const GOLD   = '#c4956a'   /* Terracotta — accent */
const TEXT   = '#2e2e2c'   /* Graphite text */
const MUTED  = '#9a8a82'   /* Warm grey muted */
const SF     = "'Cormorant Garamond',Georgia,serif"
const SS     = "'DM Sans',system-ui,sans-serif"

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:${CREAM};color:${TEXT};cursor:none}

/* Custom cursor */
.es-cursor{pointer-events:none;position:fixed;top:0;left:0;z-index:99999;mix-blend-mode:difference}
.es-cursor-dot{position:absolute;width:6px;height:6px;background:${WHITE};border-radius:50%;transform:translate(-50%,-50%);transition:width 0.2s,height 0.2s,opacity 0.2s}
.es-cursor-ring{position:absolute;width:36px;height:36px;border:1px solid rgba(255,255,255,0.6);border-radius:50%;transform:translate(-50%,-50%);transition:all 0.12s cubic-bezier(0.25,0.46,0.45,0.94);opacity:0.7}
body.cursor-hover .es-cursor-dot{width:10px;height:10px}
body.cursor-hover .es-cursor-ring{width:54px;height:54px;opacity:0.4}

/* Reveal */
.r{opacity:0;transform:translateY(32px);transition:opacity 0.9s cubic-bezier(0.22,1,0.36,1),transform 0.9s cubic-bezier(0.22,1,0.36,1)}
.rl{opacity:0;transform:translateX(-40px);transition:opacity 1s cubic-bezier(0.22,1,0.36,1),transform 1s cubic-bezier(0.22,1,0.36,1)}
.rr{opacity:0;transform:translateX(40px);transition:opacity 1s cubic-bezier(0.22,1,0.36,1),transform 1s cubic-bezier(0.22,1,0.36,1)}
.rs{opacity:0;transform:scale(0.96);transition:opacity 0.9s cubic-bezier(0.22,1,0.36,1),transform 0.9s cubic-bezier(0.22,1,0.36,1)}
.r.v,.rl.v,.rr.v,.rs.v{opacity:1;transform:none}

/* Animations */
@keyframes heroFade{0%{opacity:0;transform:scale(1.04)}8%{opacity:1;transform:scale(1)}33%{opacity:1}42%{opacity:0;transform:scale(0.98)}100%{opacity:0}}
@keyframes titleIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes lineGrow{from{width:0}to{width:100%}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes float3d{0%,100%{transform:perspective(1000px) rotateY(-6deg) translateY(0)}50%{transform:perspective(1000px) rotateY(-6deg) translateY(-10px)}}
@keyframes float3dR{0%,100%{transform:perspective(1000px) rotateY(6deg) translateY(0)}50%{transform:perspective(1000px) rotateY(6deg) translateY(-10px)}}
@keyframes arrowPulse{0%,100%{opacity:0.45;transform:translateX(0)}50%{opacity:1;transform:translateX(6px)}}

.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;animation:heroFade 18s ease-in-out infinite}
.hero-img:nth-child(1){animation-delay:0s}
.hero-img:nth-child(2){animation-delay:6s}
.hero-img:nth-child(3){animation-delay:12s}

/* Hover underline */
.hover-line{position:relative;display:inline-block}
.hover-line::after{content:'';position:absolute;bottom:0;left:0;height:1px;background:currentColor;width:0;transition:width 0.4s cubic-bezier(0.22,1,0.36,1)}
.hover-line:hover::after{width:100%}

/* Image zoom */
.img-wrap{overflow:hidden}
.img-wrap img{transition:transform 0.8s cubic-bezier(0.22,1,0.36,1)}
.img-wrap:hover img{transform:scale(1.04)}

/* Scrollbar */
.no-scroll::-webkit-scrollbar{display:none}
.no-scroll{-ms-overflow-style:none;scrollbar-width:none}

@media(max-width:900px){
  body{cursor:auto}
  .es-cursor{display:none}
  .hide-sm{display:none!important}
  .col-sm{flex-direction:column!important}
  .full-sm{width:100%!important}
}
`

/* ─── Data ───────────────────────────────────────────────────────────────── */
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=90',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=90',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1800&q=90',
]

const ROOMS = [
  {
    n: '01', room: 'Living Room', style: 'Contemporary Luxe',
    desc: 'A living room should feel both curated and effortless — the space where every element has intention yet nothing feels forced.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
  },
  {
    n: '02', room: 'Master Bedroom', style: 'Serene Minimalism',
    desc: 'The bedroom is not merely a place to sleep, but a sanctuary for restoration. Every surface, every fabric, every light deliberate.',
    img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=85',
  },
  {
    n: '03', room: 'Kitchen & Dining', style: 'Modern Warmth',
    desc: 'Where form meets function in perfect balance. A kitchen that inspires cooking and a dining space that invites conversation.',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=85',
  },
]

const GALLERY = [
  { img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=500&q=85', h:380 },
  { img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=500&q=85', h:260 },
  { img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=85', h:480 },
  { img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=500&q=85', h:320 },
  { img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=500&q=85', h:400 },
  { img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=500&q=85', h:300 },
]

const BEFORE_IMG = 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=1000&q=90'
const AFTER_IMG  = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=90'

/* ─── Custom Cursor ──────────────────────────────────────────────────────── */
function Cursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    let rx = 0, ry = 0, cx = 0, cy = 0
    let raf

    function onMove(e) {
      cx = e.clientX; cy = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = cx + 'px'
        dotRef.current.style.top  = cy + 'px'
      }
    }

    function loop() {
      rx += (cx - rx) * 0.12
      ry += (cy - ry) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px'
        ringRef.current.style.top  = ry + 'px'
      }
      raf = requestAnimationFrame(loop)
    }

    function onEnter() { document.body.classList.add('cursor-hover') }
    function onLeave() { document.body.classList.remove('cursor-hover') }

    window.addEventListener('mousemove', onMove)
    document.querySelectorAll('a,button,[role=button]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    raf = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="es-cursor">
      <div ref={dotRef}  className="es-cursor-dot" />
      <div ref={ringRef} className="es-cursor-ring" />
    </div>
  )
}

/* ─── Before/After ───────────────────────────────────────────────────────── */
function BeforeAfter() {
  const [pos, setPos]   = useState(50)
  const [drag, setDrag] = useState(false)
  const ref = useRef(null)

  const move = useCallback(x => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos(Math.max(4, Math.min(96, (x - r.left) / r.width * 100)))
  }, [])

  useEffect(() => {
    if (!drag) return
    const up = () => setDrag(false)
    const mv = e => move(e.touches ? e.touches[0].clientX : e.clientX)
    window.addEventListener('mousemove', mv)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', mv, { passive: true })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', mv)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', mv)
      window.removeEventListener('touchend', up)
    }
  }, [drag, move])

  return (
    <div ref={ref}
      onMouseDown={e => { setDrag(true); move(e.clientX) }}
      onTouchStart={e => { setDrag(true); move(e.touches[0].clientX) }}
      style={{ position:'relative', width:'100%', height:520, overflow:'hidden', cursor:'ew-resize', userSelect:'none' }}>
      <img src={BEFORE_IMG} alt="Before" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      <div style={{ position:'absolute', inset:0, width:`${pos}%`, overflow:'hidden' }}>
        <img src={AFTER_IMG} alt="After" style={{ position:'absolute', inset:0, width:`${10000/pos}%`, maxWidth:'none', height:'100%', objectFit:'cover' }} />
      </div>
      {/* Divider line */}
      <div style={{ position:'absolute', top:0, bottom:0, left:`${pos}%`, width:1, background:WHITE, transform:'translateX(-50%)', zIndex:10 }}>
        {/* Handle */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:48, height:48, background:DARK, border:`1px solid rgba(255,255,255,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <span style={{ color:WHITE, fontSize:10, fontFamily:SS }}>&#8592;</span>
          <span style={{ color:WHITE, fontSize:10, fontFamily:SS }}>&#8594;</span>
        </div>
      </div>
      {/* Labels */}
      <span style={{ position:'absolute', top:24, left:24, fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', background:'rgba(0,0,0,0.4)', padding:'5px 12px', backdropFilter:'blur(4px)' }}>Before</span>
      <span style={{ position:'absolute', top:24, right:24, fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:DARK, background:GOLD, padding:'5px 12px' }}>After</span>
    </div>
  )
}

/* ─── Style Templates ───────────────────────────────────────────────────── */
const STYLE_DATA = {
  'Mid-Century': [
    { img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80', room:'Living Room' },
    { img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=500&q=80', room:'Bedroom' },
    { img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=500&q=80', room:'Kitchen' },
    { img:'https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=500&q=80', room:'Dining Room' },
  ],
  'Modern': [
    { img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80', room:'Living Room' },
    { img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=500&q=80', room:'Bedroom' },
    { img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=500&q=80', room:'Kitchen' },
    { img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80', room:'Office' },
  ],
  'Minimalist': [
    { img:'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=500&q=80', room:'Living Room' },
    { img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=80', room:'Bedroom' },
    { img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=500&q=80', room:'Bathroom' },
    { img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=500&q=80', room:'Office' },
  ],
  'Japandi': [
    { img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=500&q=80', room:'Living Room' },
    { img:'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80', room:'Bedroom' },
    { img:'https://images.unsplash.com/photo-1495433324511-bf8e92934d90?auto=format&fit=crop&w=500&q=80', room:'Kitchen' },
    { img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80', room:'Reading Nook' },
  ],
  'Warm & Cosy': [
    { img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=500&q=80', room:'Living Room' },
    { img:'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80', room:'Bedroom' },
    { img:'https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=500&q=80', room:'Dining Room' },
    { img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=80', room:'Kids Room' },
  ],
}
const STYLE_TABS = Object.keys(STYLE_DATA)

function StyleTemplates() {
  const [active, setActive] = useState('Mid-Century')
  const rooms = STYLE_DATA[active]
  return (
    <div>
      {/* Tab strip */}
      <div style={{ display:'flex', gap:0, borderBottom:`1px solid rgba(0,0,0,0.08)`, marginBottom:40, overflowX:'auto' }} className="no-scroll">
        {STYLE_TABS.map(tab => (
          <button key={tab} onClick={() => setActive(tab)}
            style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
              color: active===tab ? DARK : MUTED,
              background:'none', border:'none', cursor:'pointer',
              padding:'0 28px 16px', whiteSpace:'nowrap',
              borderBottom: active===tab ? `2px solid ${DARK}` : '2px solid transparent',
              transition:'all 0.2s', marginBottom:-1,
            }}>
            {tab}
          </button>
        ))}
      </div>
      {/* Room grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:3 }} className="col-sm">
        {rooms.map((r, i) => (
          <div key={i} className="img-wrap" style={{ position:'relative', cursor:'none', overflow:'hidden' }}
            onClick={() => { window.location.href = '/studio' }}>
            <img src={r.img} alt={r.room} style={{ width:'100%', height:220, objectFit:'cover', display:'block' }} loading="lazy" />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(42,14,20,0.7) 0%, transparent 55%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:SS, fontSize:10, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:WHITE }}>{r.room}</span>
              <span style={{ fontFamily:SS, fontSize:9, color:GOLD }}>Use →</span>
            </div>
          </div>
        ))}
      </div>
      {/* Footer link */}
      <div style={{ textAlign:'center', marginTop:36 }}>
        <button onClick={() => { window.location.href='/studio' }}
          style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:MUTED, background:'none', border:'none', cursor:'pointer', transition:'color 0.2s' }}
          onMouseEnter={e=>e.currentTarget.style.color=DARK}
          onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
          Browse all styles in the Studio →
        </button>
      </div>
    </div>
  )
}

/* ─── Video Glimpse ──────────────────────────────────────────────────────── */
function VideoGlimpse() {
  const [frame, setFrame] = useState(0)
  const FRAMES = [
    { src:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=80', label:'Empty room — your starting point' },
    { src:'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', label:'Step 1 — Draw your 2D floor plan' },
    { src:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', label:'Step 2 — Add furniture & finishes' },
    { src:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', label:'Step 3 — Your 3D design is ready' },
  ]
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % FRAMES.length), 2800)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ position:'relative', height:520, overflow:'hidden', cursor:'pointer' }} onClick={() => { window.location.href = '/studio' }}>
      {FRAMES.map((f, i) => (
        <div key={i} style={{ position:'absolute', inset:0, opacity: frame===i ? 1 : 0, transition:'opacity 0.9s ease', zIndex: frame===i ? 1 : 0 }}>
          <img src={f.src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
        </div>
      ))}
      {/* Overlay */}
      <div style={{ position:'absolute', inset:0, zIndex:2, background:'rgba(30,10,14,0.48)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28 }}>
        {/* Play circle */}
        <div style={{ width:80, height:80, border:`2px solid rgba(255,255,255,0.75)`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s', backdropFilter:'blur(4px)' }}
          onMouseEnter={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.borderColor = GOLD }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.75)' }}>
          <div style={{ width:0, height:0, borderTop:'13px solid transparent', borderBottom:'13px solid transparent', borderLeft:`20px solid ${WHITE}`, marginLeft:6 }} />
        </div>
        <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:'rgba(255,255,255,0.9)', letterSpacing:'0.06em', textAlign:'center' }}>{FRAMES[frame].label}</p>
        <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:GOLD }}>Open Studio to Start →</span>
      </div>
      {/* Progress dots */}
      <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, zIndex:3 }}>
        {FRAMES.map((_,i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setFrame(i) }}
            style={{ width: frame===i ? 28 : 8, height:4, background: frame===i ? GOLD : 'rgba(255,255,255,0.35)', border:'none', padding:0, cursor:'pointer', transition:'all 0.35s', outline:'none' }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const nav = useNavigate()
  const [hovRoom, setHovRoom] = useState(null)

  /* Inject CSS */
  useEffect(() => {
    const id = 'es-premium-css'
    if (!document.getElementById(id)) {
      const s = document.createElement('style')
      s.id = id; s.textContent = CSS; document.head.appendChild(s)
    }
  }, [])

  /* Scroll reveal */
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('v'); io.unobserve(e.target) } })
    }, { threshold: 0.08 })
    setTimeout(() => {
      document.querySelectorAll('.r,.rl,.rr,.rs').forEach(el => io.observe(el))
    }, 100)
    return () => io.disconnect()
  }, [])

  /* Cursor hover delegation */
  useEffect(() => {
    function on(e) { if (e.target.closest('a,button,[role=button]')) document.body.classList.add('cursor-hover') }
    function off()  { document.body.classList.remove('cursor-hover') }
    document.addEventListener('mouseover', on)
    document.addEventListener('mouseout',  off)
    return () => { document.removeEventListener('mouseover', on); document.removeEventListener('mouseout', off) }
  }, [])

  const SectionLabel = ({ children }) => (
    <span style={{ fontFamily:SS, fontSize:9, fontWeight:600, letterSpacing:'0.38em', textTransform:'uppercase', color:GOLD }}>
      {children}
    </span>
  )

  const Rule = ({ light }) => (
    <div style={{ height:1, background: light ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', marginBottom: 0 }} />
  )

  return (
    <div style={{ fontFamily:SS, background:CREAM, overflowX:'hidden' }}>
      <Cursor />
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          I. CINEMATIC HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', height:'100svh', minHeight:680, overflow:'hidden', background:DARK }}>
        {/* Cycling images */}
        {HERO_IMAGES.map((src, i) => (
          <img key={i} src={src} alt="" className="hero-img" style={{ animationDelay:`${i*6}s` }} />
        ))}
        {/* Overlay gradient — very restrained */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(13,12,8,0.18) 0%, rgba(13,12,8,0.58) 100%)', zIndex:1 }} />

        {/* Content — centered, editorial */}
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 clamp(32px,8vw,180px)' }}>

          {/* Thin gold rule above headline */}
          <div style={{ width:48, height:1, background:GOLD, marginBottom:36, animation:'titleIn 1.2s ease 0.3s both' }} />

          <h1 style={{ fontFamily:SF, fontWeight:300, fontSize:'clamp(52px,7.5vw,118px)', color:WHITE, lineHeight:1.0, letterSpacing:'-0.02em', marginBottom:0, animation:'titleIn 1.2s ease 0.5s both' }}>
            The art of<br />
            <em style={{ fontStyle:'italic', color:GOLD }}>beautiful living.</em>
          </h1>

          <p style={{ fontFamily:SS, fontSize:'clamp(13px,1.1vw,15px)', fontWeight:300, color:'rgba(255,255,255,0.55)', letterSpacing:'0.12em', marginTop:36, maxWidth:500, lineHeight:1.9, animation:'titleIn 1.2s ease 0.8s both' }}>
            Design extraordinary interiors — from a blank floor plan to a photorealistic room — entirely in your browser. No experience required.
          </p>

          <div style={{ display:'flex', alignItems:'center', gap:48, marginTop:56, animation:'titleIn 1.2s ease 1.1s both' }}>
            <button onClick={() => nav('/studio')}
              style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.34em', textTransform:'uppercase', color:WHITE, background:'transparent', border:'none', cursor:'none', padding:0, transition:'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              <span className="hover-line">Begin Designing</span>
              &nbsp;&nbsp;&#8594;
            </button>

            <div style={{ width:1, height:32, background:'rgba(255,255,255,0.2)' }} />

            <button onClick={() => nav('/gallery')}
              style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.34em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', background:'transparent', border:'none', cursor:'none', padding:0, transition:'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              <span className="hover-line">View Gallery</span>
            </button>
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', zIndex:2, textAlign:'center', animation:'titleIn 1.5s ease 1.4s both' }}>
          <div style={{ width:1, height:60, background:'linear-gradient(to bottom,rgba(255,255,255,0.5),transparent)', margin:'0 auto' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          II. MANIFESTO
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:CREAM, padding:'140px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 2fr', gap:80, alignItems:'start' }} className="col-sm">
          <div className="rl" style={{ paddingTop:12 }}>
            <SectionLabel>Our Philosophy</SectionLabel>
            <div style={{ width:36, height:1, background:GOLD, marginTop:20 }} />
          </div>

          <div className="r">
            <blockquote style={{ fontFamily:SF, fontSize:'clamp(28px,3.2vw,52px)', fontWeight:300, color:DARK, lineHeight:1.25, fontStyle:'italic', marginBottom:48 }}>
              "We believe every room has the potential to be extraordinary. You simply need the tools to reveal it."
            </blockquote>
            <p style={{ fontFamily:SS, fontSize:15, fontWeight:300, color:MUTED, lineHeight:1.9, maxWidth:560 }}>
              El Shaddai is an interior design studio built for everyone — the homeowner reimagining their living room, the student furnishing their first apartment, the professional curating a premium workspace. Our platform provides photorealistic 3D design tools that were once available only to trained architects and designers.
            </p>
            <button onClick={() => nav('/studio')} style={{ marginTop:48, fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.34em', textTransform:'uppercase', color:DARK, background:'transparent', border:'none', cursor:'none', padding:0, transition:'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.45'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              <span className="hover-line">Explore the Studio &#8594;</span>
            </button>
          </div>
        </div>
      </section>

      <Rule />

      {/* ══════════════════════════════════════════════════════════════════
          II-B. STUDIO PREVIEW — 2D draft → 3D reality
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:DARK, padding:'120px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          <div className="r" style={{ textAlign:'center', marginBottom:72 }}>
            <SectionLabel>Studio Preview</SectionLabel>
            <div style={{ width:36, height:1, background:GOLD, margin:'20px auto 36px' }} />
            <h2 style={{ fontFamily:SF, fontSize:'clamp(38px,4.5vw,68px)', fontWeight:300, color:WHITE, lineHeight:1.05 }}>
              2D draft. <em style={{ fontStyle:'italic', color:GOLD }}>3D reality.</em>
            </h2>
            <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:'rgba(255,255,255,0.42)', marginTop:20, lineHeight:1.9 }}>
              Draw your floor plan — watch it become a walkable 3D room in real time.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 72px 1fr', alignItems:'center' }} className="col-sm">

            {/* 2D Panel */}
            <div className="rl" style={{ animation:'float3d 6s ease-in-out infinite' }}>
              <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid rgba(255,255,255,0.1)`, overflow:'hidden' }}>
                <div style={{ position:'relative' }}>
                  <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=80" alt="2D Floor Plan"
                    style={{ width:'100%', height:360, objectFit:'cover', display:'block', filter:'grayscale(0.15) brightness(0.88)' }} loading="lazy" />
                  <div style={{ position:'absolute', top:16, left:16, background:'rgba(0,0,0,0.72)', padding:'6px 14px', backdropFilter:'blur(4px)' }}>
                    <span style={{ fontFamily:SS, fontSize:8, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:WHITE }}>2D Floor Plan</span>
                  </div>
                </div>
                <div style={{ padding:'20px 24px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.42)', margin:0, lineHeight:1.7 }}>Snap grid · AI generation · 500+ templates</p>
                </div>
              </div>
            </div>

            {/* Arrow connector */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }} className="hide-sm">
              <div style={{ width:1, height:40, background:'rgba(196,149,106,0.25)' }} />
              <div style={{ width:40, height:40, border:`1px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'center', animation:'arrowPulse 1.8s ease-in-out infinite' }}>
                <span style={{ color:GOLD, fontSize:16, fontFamily:SS }}>→</span>
              </div>
              <div style={{ width:1, height:40, background:'rgba(196,149,106,0.25)' }} />
            </div>

            {/* 3D Panel */}
            <div className="rr" style={{ animation:'float3dR 6s ease-in-out 1s infinite' }}>
              <div style={{ border:`1px solid rgba(196,149,106,0.3)`, overflow:'hidden', boxShadow:`0 32px 80px rgba(196,149,106,0.12)` }}>
                <div style={{ position:'relative' }}>
                  <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80" alt="3D Render"
                    style={{ width:'100%', height:360, objectFit:'cover', display:'block' }} loading="lazy" />
                  <div style={{ position:'absolute', top:16, left:16, background:GOLD, padding:'6px 14px' }}>
                    <span style={{ fontFamily:SS, fontSize:8, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:DARK }}>3D Live View</span>
                  </div>
                </div>
                <div style={{ padding:'20px 24px', background:'rgba(196,149,106,0.06)', borderTop:`1px solid rgba(196,149,106,0.2)` }}>
                  <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.52)', margin:0, lineHeight:1.7 }}>Photorealistic render · AR preview · PDF export</p>
                </div>
              </div>
            </div>
          </div>

          <div className="r" style={{ textAlign:'center', marginTop:64 }}>
            <button onClick={() => nav('/studio')}
              style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:DARK, background:GOLD, border:'none', padding:'18px 60px', cursor:'none', transition:'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.82'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              ✦ Try the Studio — Free
            </button>
            <p style={{ fontFamily:SS, fontSize:10, color:'rgba(255,255,255,0.22)', marginTop:20, letterSpacing:'0.14em' }}>No signup · No download · Works in any browser</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          III. ROOM SHOWCASE — Alternating editorial blocks
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:WHITE, padding:'120px 0' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 clamp(40px,6vw,100px)' }}>

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:80, borderBottom:`1px solid rgba(0,0,0,0.07)`, paddingBottom:32 }} className="col-sm r">
            <h2 style={{ fontFamily:SF, fontSize:'clamp(40px,4.5vw,70px)', fontWeight:300, color:DARK, lineHeight:1.0 }}>
              Every room,<br /><em style={{ fontStyle:'italic', color:GOLD }}>perfected.</em>
            </h2>
            <SectionLabel>Featured Spaces</SectionLabel>
          </div>

          {/* Rooms */}
          {ROOMS.map((rm, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns: i%2===0 ? '1.1fr 0.9fr' : '0.9fr 1.1fr', gap:0, alignItems:'stretch', minHeight:500, marginBottom:2 }} className="col-sm">

              {/* Image — left for even, right for odd */}
              <div className={`img-wrap ${i%2===0?'rl':'rr'}`} style={{ order: i%2===0?1:2 }}>
                <img src={rm.img} alt={rm.room} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', minHeight:400 }} loading="lazy" />
              </div>

              {/* Text */}
              <div className={`r`} style={{ order: i%2===0?2:1, padding:'60px 64px', background: i===1 ? DARK2 : CREAM, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:36 }}>
                  <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.36em', color:GOLD }}>{rm.n}</span>
                  <div style={{ flex:1, height:1, background:'rgba(201,162,39,0.3)' }} />
                </div>
                <h3 style={{ fontFamily:SF, fontSize:'clamp(32px,3vw,50px)', fontWeight:300, color: i===1 ? WHITE : DARK, lineHeight:1.1, marginBottom:12 }}>{rm.room}</h3>
                <div style={{ fontFamily:SS, fontSize:9, fontWeight:600, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:28 }}>{rm.style}</div>
                <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color: i===1 ? 'rgba(255,255,255,0.55)' : MUTED, lineHeight:1.95 }}>{rm.desc}</p>
                <button onClick={() => nav('/studio')}
                  style={{ marginTop:44, fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.34em', textTransform:'uppercase', color: i===1 ? WHITE : DARK, background:'transparent', border:'none', cursor:'none', padding:0, alignSelf:'flex-start', transition:'opacity 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.4'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  <span className="hover-line">Design This Room &#8594;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          III-B. STYLE TEMPLATES — Tabbed design gallery
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:WHITE, padding:'100px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="r" style={{ textAlign:'center', marginBottom:52 }}>
            <SectionLabel>Style Templates</SectionLabel>
            <div style={{ width:36, height:1, background:GOLD, margin:'20px auto 36px' }} />
            <h2 style={{ fontFamily:SF, fontSize:'clamp(38px,4.5vw,66px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
              Design fast with <em style={{ fontStyle:'italic', color:GOLD }}>500+ templates.</em>
            </h2>
            <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:MUTED, marginTop:20, lineHeight:1.9 }}>
              Pick a style that speaks to you — every template opens instantly in the studio.
            </p>
          </div>
          <div className="r">
            <StyleTemplates />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          IV. THE STUDIO — Dark editorial
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:DARK, padding:'140px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px 100px', alignItems:'start' }} className="col-sm">

            {/* Left — headline */}
            <div className="rl">
              <SectionLabel>The Design Studio</SectionLabel>
              <div style={{ width:36, height:1, background:GOLD, margin:'20px 0 44px' }} />
              <h2 style={{ fontFamily:SF, fontSize:'clamp(40px,4.5vw,72px)', fontWeight:300, color:WHITE, lineHeight:1.0, marginBottom:32 }}>
                Professional<br />tools. <em style={{ fontStyle:'italic', color:GOLD }}>Zero<br />compromise.</em>
              </h2>
              <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:'rgba(255,255,255,0.45)', lineHeight:1.95, maxWidth:440, marginBottom:52 }}>
                Everything a professional interior designer uses — floor plan drawing, 3D visualisation, material selection, furniture catalogue, AR preview — consolidated into one elegant, browser-based studio. Free, always.
              </p>
              <button onClick={() => nav('/studio')}
                style={{ display:'inline-flex', alignItems:'center', gap:16, fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.34em', textTransform:'uppercase', color:DARK, background:GOLD, border:'none', padding:'18px 40px', cursor:'none', transition:'opacity 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                Open Studio
              </button>
            </div>

            {/* Right — numbered capability list */}
            <div className="rr">
              {[
                ['01', 'Precision Floor Plan', 'Draw walls, doors, and windows with snap-to-grid accuracy. Measurements display in real time.'],
                ['02', '3D Live Visualisation', 'Every wall you draw, every piece of furniture you place, instantly visible in a live 3D scene.'],
                ['03', 'Material & Finish Editor', 'Choose from 30+ wall, floor, and ceiling finishes. See your choices reflected in the 3D view immediately.'],
                ['04', 'AI Floor Plan Generator', 'Describe your room in natural language. Gemini AI draws the walls for you in seconds.'],
                ['05', 'AR Room Preview', 'Point your phone at any room to see your furniture placed in real physical space using WebXR.'],
                ['06', 'Export & Share', 'Generate a professional PDF design report, export PNG renders, or share a link for client review.'],
              ].map(([n, title, desc], i) => (
                <div key={i} className="r" style={{ animationDelay:`${i*80}ms`, borderTop:`1px solid rgba(255,255,255,0.07)`, padding:'28px 0' }}>
                  <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>
                    <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:GOLD, flexShrink:0, paddingTop:4 }}>{n}</span>
                    <div>
                      <div style={{ fontFamily:SS, fontSize:13, fontWeight:600, color:WHITE, marginBottom:6 }}>{title}</div>
                      <div style={{ fontFamily:SS, fontSize:12, fontWeight:300, color:'rgba(255,255,255,0.35)', lineHeight:1.8 }}>{desc}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          V. HOW IT WORKS — Draw · Decorate · Render
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:CREAM, padding:'140px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:72 }} className="r">
            <SectionLabel>How It Works</SectionLabel>
            <div style={{ width:36, height:1, background:GOLD, margin:'20px auto 40px' }} />
            <h2 style={{ fontFamily:SF, fontSize:'clamp(44px,5.5vw,82px)', fontWeight:300, color:DARK, lineHeight:1.0 }}>
              Three steps.<br /><em style={{ fontStyle:'italic', color:GOLD }}>Infinite possibilities.</em>
            </h2>
            <p style={{ fontFamily:SS, fontSize:15, fontWeight:300, color:MUTED, marginTop:28, lineHeight:1.9, maxWidth:500, margin:'28px auto 0' }}>
              No design degree. No software to install. Just open your browser and start creating.
            </p>
          </div>

          {/* Step cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:3, marginBottom:60 }} className="col-sm">
            {[
              {
                n:'01', title:'Draw', sub:'Your Floor Plan',
                desc:'Sketch walls, doors and windows with precision snap tools. Or describe your room in text — AI draws the floor plan for you instantly.',
                img:'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
                tag:'Snap grid · AI draft · 500+ templates',
              },
              {
                n:'02', title:'Decorate', sub:'Add Furniture & Finishes',
                desc:'Browse 150+ curated furniture pieces. Choose wall colours, flooring and ceiling finishes. Every selection reflects immediately in the live 3D view.',
                img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
                tag:'150+ furniture · 30+ finishes · Live 3D',
              },
              {
                n:'03', title:'Render', sub:'See & Share in 3D',
                desc:'View your completed room in photorealistic 3D, explore in AR on your phone, export a professional PDF report, or share a link.',
                img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
                tag:'3D render · AR preview · PDF export',
              },
            ].map(({ n, title, sub, desc, img, tag }, i) => (
              <div key={i} className="rs" style={{ animationDelay:`${i*110}ms`, background:WHITE, overflow:'hidden', cursor:'none', display:'flex', flexDirection:'column', transition:'transform 0.35s,box-shadow 0.35s', border:'1px solid rgba(0,0,0,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 32px 80px rgba(0,0,0,0.13)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}
                onClick={() => nav('/studio')}>
                {/* Image */}
                <div className="img-wrap" style={{ position:'relative', height:280 }}>
                  <img src={img} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} loading="lazy" />
                  <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom, transparent 50%, rgba(42,14,20,0.6) 100%)` }} />
                  <div style={{ position:'absolute', top:20, left:20, width:52, height:52, background:DARK, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid rgba(196,149,106,0.35)` }}>
                    <span style={{ fontFamily:SF, fontSize:22, fontWeight:300, color:GOLD }}>{n}</span>
                  </div>
                </div>
                {/* Text */}
                <div style={{ padding:'32px 28px 36px', flex:1, display:'flex', flexDirection:'column' }}>
                  <h3 style={{ fontFamily:SF, fontSize:40, fontWeight:300, color:DARK, lineHeight:1, margin:'0 0 4px' }}>{title}</h3>
                  <div style={{ fontFamily:SS, fontSize:8, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:20 }}>{sub}</div>
                  <p style={{ fontFamily:SS, fontSize:13, fontWeight:300, color:MUTED, lineHeight:1.9, margin:'0 0 24px', flex:1 }}>{desc}</p>
                  <p style={{ fontFamily:SS, fontSize:9, color:'rgba(0,0,0,0.28)', letterSpacing:'0.09em', margin:0 }}>{tag}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign:'center' }} className="r">
            <button onClick={() => nav('/studio')}
              style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:WHITE, background:DARK, border:`2px solid ${DARK}`, padding:'18px 60px', cursor:'none', transition:'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=DARK }}
              onMouseLeave={e => { e.currentTarget.style.background=DARK; e.currentTarget.style.color=WHITE }}>
              Start Designing — It's Free →
            </button>
          </div>
        </div>
      </section>

      <Rule />

      {/* ══════════════════════════════════════════════════════════════════
          VI. TRANSFORMATION — Before/After slider
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:WHITE }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'120px clamp(40px,6vw,100px)' }}>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:60 }} className="col-sm">
            <div className="rl">
              <SectionLabel>The Transformation</SectionLabel>
              <div style={{ width:36, height:1, background:GOLD, margin:'20px 0 36px' }} />
              <h2 style={{ fontFamily:SF, fontSize:'clamp(36px,4vw,62px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
                See what becomes<br />possible.
              </h2>
            </div>
            <p className="rr" style={{ fontFamily:SS, fontSize:13, fontWeight:300, color:MUTED, maxWidth:360, lineHeight:1.9, textAlign:'right', paddingBottom:4 }}>
              Drag the divider to compare an empty room against a fully realised El Shaddai design. This is what you create — free, today, in minutes.
            </p>
          </div>

          <div className="rs">
            <BeforeAfter />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          VII. INSPIRATION GALLERY — Editorial image grid
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:DARK2, padding:'120px clamp(40px,6vw,100px)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:64 }}>
            <div className="rl">
              <SectionLabel>Inspiration</SectionLabel>
              <div style={{ width:36, height:1, background:GOLD, margin:'20px 0 32px' }} />
              <h2 style={{ fontFamily:SF, fontSize:'clamp(36px,4vw,60px)', fontWeight:300, color:WHITE, lineHeight:1.05 }}>
                Rooms created<br />by our community.
              </h2>
            </div>
            <button onClick={() => nav('/gallery')} className="rr"
              style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.34em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', background:'transparent', border:'none', cursor:'none', alignSelf:'flex-end', marginBottom:8, transition:'color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.color=WHITE}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
              <span className="hover-line">View All &#8594;</span>
            </button>
          </div>

          {/* Masonry columns */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:3 }} className="r">
            {GALLERY.map((g, i) => (
              <div key={i} className="img-wrap" style={{ cursor:'none' }} onClick={() => nav('/gallery')}>
                <img src={g.img} alt="" style={{ width:'100%', height:g.h, objectFit:'cover', display:'block' }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          VII-B. STUDIO IN ACTION — Animated design walkthrough
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:DARK2 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'100px clamp(40px,6vw,100px)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:48 }} className="col-sm">
            <div className="rl">
              <SectionLabel>Studio in Action</SectionLabel>
              <div style={{ width:36, height:1, background:GOLD, margin:'20px 0 32px' }} />
              <h2 style={{ fontFamily:SF, fontSize:'clamp(34px,4vw,58px)', fontWeight:300, color:WHITE, lineHeight:1.05 }}>
                See the design<br />process unfold.
              </h2>
            </div>
            <p className="rr" style={{ fontFamily:SS, fontSize:13, fontWeight:300, color:'rgba(255,255,255,0.42)', maxWidth:320, lineHeight:1.9, textAlign:'right', paddingBottom:4 }}>
              From empty room to furnished 3D space — watch every step of the El Shaddai design workflow. Click to open the studio.
            </p>
          </div>
          <div className="rs">
            <VideoGlimpse />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          VIII. ROOM TYPES — Elegant horizontal navigation
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:CREAM, padding:'100px clamp(40px,6vw,100px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }} className="r">
            <SectionLabel>Design Every Space</SectionLabel>
            <h2 style={{ fontFamily:SF, fontSize:'clamp(32px,3.5vw,54px)', fontWeight:300, color:DARK, marginTop:20, lineHeight:1.05 }}>
              Every room in your home.
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:0, borderTop:`1px solid rgba(0,0,0,0.07)`, borderLeft:`1px solid rgba(0,0,0,0.07)` }}>
            {[
              ['Living Room','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&q=70'],
              ['Bedroom','https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&q=70'],
              ['Kitchen','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70'],
              ['Bathroom','https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70'],
              ['Home Office','https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=70'],
              ['Dining Room','https://images.unsplash.com/photo-1617806118233-18e1de247200?w=300&q=70'],
              ['Kids Room','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70'],
              ['Pooja Room','https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=300&q=70'],
              ['Outdoor','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=300&q=70'],
              ['Commercial','https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=70'],
            ].map(([label, img], i) => (
              <div key={i} className="r img-wrap" style={{ animationDelay:`${i*40}ms`, position:'relative', borderRight:`1px solid rgba(0,0,0,0.07)`, borderBottom:`1px solid rgba(0,0,0,0.07)`, cursor:'none', overflow:'hidden' }}
                onClick={() => nav('/studio')}>
                <img src={img} alt={label} style={{ width:'100%', height:140, objectFit:'cover', display:'block', filter:'brightness(0.7)', transition:'filter 0.4s ease, transform 0.6s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.filter='brightness(0.85)'; e.currentTarget.style.transform='scale(1.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter='brightness(0.7)'; e.currentTarget.style.transform='scale(1)' }} loading="lazy" />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                  <span style={{ fontFamily:SS, fontSize:10, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:WHITE, textShadow:'0 1px 12px rgba(0,0,0,0.5)', textAlign:'center' }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          IX. FINAL CTA — Ultra minimal
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', overflow:'hidden', background:DARK }}>
        <img src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1800&q=85" alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.15 }} />
        <div style={{ position:'relative', zIndex:1, padding:'160px clamp(40px,8vw,160px)', textAlign:'center', maxWidth:900, margin:'0 auto' }}>
          <div className="r">
            <SectionLabel>Begin Now</SectionLabel>
            <div style={{ width:36, height:1, background:GOLD, margin:'24px auto 52px' }} />
            <h2 style={{ fontFamily:SF, fontSize:'clamp(48px,7vw,110px)', fontWeight:300, color:WHITE, lineHeight:0.95, letterSpacing:'-0.02em', marginBottom:52 }}>
              Your dream<br />space starts<br /><em style={{ fontStyle:'italic', color:GOLD }}>here.</em>
            </h2>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:40, flexWrap:'wrap' }}>
              <button onClick={() => nav('/studio')}
                style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:DARK, background:GOLD, border:'none', padding:'20px 60px', cursor:'none', transition:'opacity 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                Begin Designing
              </button>
              <button onClick={() => nav('/gallery')}
                style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.34em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', background:'transparent', border:'none', cursor:'none', padding:0, transition:'color 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.color=WHITE}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
                <span className="hover-line">Explore Gallery &#8594;</span>
              </button>
            </div>
            <p style={{ fontFamily:SS, fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.2)', marginTop:48, letterSpacing:'0.12em' }}>
              Free forever &nbsp;·&nbsp; Works in any browser &nbsp;·&nbsp; No download required
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER — Refined minimal
      ══════════════════════════════════════════════════════════════════ */}
      <footer style={{ background:'#0a0905', padding:'80px clamp(40px,8vw,160px) 48px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Top */}
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap:60, marginBottom:72, borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:72 }} className="col-sm">

            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                <div style={{ width:36, height:36, background:GOLD, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SF, fontSize:16, fontWeight:400, color:DARK }}>ES</div>
                <div>
                  <div style={{ fontFamily:SF, fontSize:18, fontWeight:300, color:WHITE, letterSpacing:'0.04em' }}>El Shaddai</div>
                  <div style={{ fontFamily:SS, fontSize:8, color:'rgba(255,255,255,0.3)', letterSpacing:'0.28em', textTransform:'uppercase', marginTop:1 }}>Interior Design</div>
                </div>
              </div>
              <p style={{ fontFamily:SS, fontSize:12, fontWeight:300, color:'rgba(255,255,255,0.35)', lineHeight:1.9, maxWidth:260 }}>
                A free, browser-based interior design platform. Design extraordinary spaces — no experience required.
              </p>
            </div>

            {[
              { title:'Studio', links:[['Design Studio','/studio'],['Gallery','/gallery'],['My Projects','/my-projects'],['Pricing','/pricing']] },
              { title:'Company', links:[['Portfolio','/portfolio'],['Blog','/blog'],['Contact','#contact'],['About','#about']] },
              { title:'Legal', links:[['Privacy Policy','#'],['Terms of Use','#'],['Cookie Policy','#']] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontFamily:SS, fontSize:8, fontWeight:700, letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:24 }}>{col.title}</div>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} style={{ display:'block', fontFamily:SS, fontSize:12, fontWeight:300, color:'rgba(255,255,255,0.45)', textDecoration:'none', marginBottom:14, letterSpacing:'0.02em', transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color=WHITE}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
                    {label}
                  </a>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <p style={{ fontFamily:SS, fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.18)', letterSpacing:'0.04em' }}>
              &copy; 2025 El Shaddai Interior Design. All rights reserved.
            </p>
            <p style={{ fontFamily:SS, fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.18)', letterSpacing:'0.04em' }}>
              elshaddaiinterior.vercel.app
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
