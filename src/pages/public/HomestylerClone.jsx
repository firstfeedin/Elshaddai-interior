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
          V. PROCESS — Editorial numbered steps
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:CREAM, padding:'140px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:100, alignItems:'end', marginBottom:80 }} className="col-sm">
            <div className="rl">
              <SectionLabel>How It Works</SectionLabel>
              <div style={{ width:36, height:1, background:GOLD, margin:'20px 0 44px' }} />
              <h2 style={{ fontFamily:SF, fontSize:'clamp(38px,4vw,66px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
                From blank room<br />to <em style={{ fontStyle:'italic', color:GOLD }}>finished design</em><br />in minutes.
              </h2>
            </div>
            <p className="rr" style={{ fontFamily:SS, fontSize:15, fontWeight:300, color:MUTED, lineHeight:1.95 }}>
              Our studio removes every barrier between your vision and a beautiful space. No training required. No software to install. No design degree needed — only imagination.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0 }} className="col-sm">
            {[
              { n:'01', title:'Draw Your Floor Plan', desc:'Sketch walls, doors, and windows with precision snap tools. Import a photo of your current room or start from one of 500+ templates.' },
              { n:'02', title:'Furnish & Style',       desc:'Browse 150+ curated furniture pieces, apply wall colours, flooring finishes, and ceiling materials. Every change reflects instantly in 3D.' },
              { n:'03', title:'Visualise & Share',     desc:'See your room in photorealistic 3D, view in AR, export a professional PDF report, or share a link directly with clients or family.' },
            ].map(({ n, title, desc }, i) => (
              <div key={i} className="r" style={{ animationDelay:`${i*100}ms`, borderLeft: i>0 ? `1px solid rgba(0,0,0,0.08)` : 'none', padding: i>0 ? '60px 0 60px 60px' : '60px 60px 60px 0', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontFamily:SF, fontSize:'clamp(56px,6vw,88px)', fontWeight:300, color:'rgba(0,0,0,0.06)', lineHeight:1, marginBottom:32 }}>{n}</div>
                <h3 style={{ fontFamily:SS, fontSize:15, fontWeight:600, color:DARK, marginBottom:16 }}>{title}</h3>
                <p style={{ fontFamily:SS, fontSize:13, fontWeight:300, color:MUTED, lineHeight:1.9 }}>{desc}</p>
              </div>
            ))}
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
