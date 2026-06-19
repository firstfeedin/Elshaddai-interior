/**
 * El Shaddai — Extraordinary Homepage
 * Industry-standard interior design platform UI
 * Inspired by: Houzz, Planner5D, Havenly, Homestyler, Canva
 * Design system: warm cream + deep charcoal + gold accent
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
const GOLD   = '#c9a227'
const GOLDD  = '#a07a18'
const GOLDL  = '#e8c84e'
const DARK   = '#0d0c08'
const DARK2  = '#1a1710'
const CREAM  = '#faf8f2'
const WHITE  = '#ffffff'
const TEXT   = '#1a1612'
const MUTED  = '#78726c'
const BORDER = 'rgba(0,0,0,0.07)'
const SF = "'Cormorant Garamond',Georgia,serif"
const SS = "'DM Sans',system-ui,sans-serif"

/* ─── Global CSS (injected once) ─────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${CREAM}; color: ${TEXT}; }

  /* Scroll animations */
  .reveal        { opacity:0; transform:translateY(40px);  transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal-left   { opacity:0; transform:translateX(-40px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal-right  { opacity:0; transform:translateX(40px);  transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal-scale  { opacity:0; transform:scale(0.93);       transition: opacity 0.6s ease, transform 0.6s ease; }
  .reveal.visible, .reveal-left.visible, .reveal-right.visible, .reveal-scale.visible { opacity:1; transform:none; }

  /* Animations */
  @keyframes ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes fadeIn    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
  @keyframes countUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes heroImg   { 0%{opacity:0;transform:scale(1.04)} 8%{opacity:1;transform:scale(1)} 33%{opacity:1;transform:scale(1)} 41%{opacity:0;transform:scale(0.98)} 100%{opacity:0} }
  @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }

  /* Hero image carousel */
  .hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; animation: heroImg 15s ease-in-out infinite; }
  .hero-img:nth-child(1) { animation-delay: 0s; }
  .hero-img:nth-child(2) { animation-delay: 5s; }
  .hero-img:nth-child(3) { animation-delay: 10s; }

  /* Hover utilities */
  .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .card-hover:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,0.12); }

  /* Before/after slider */
  .ba-slider { position:relative; overflow:hidden; cursor:ew-resize; user-select:none; }

  /* Scrollbar hide */
  .no-scrollbar::-webkit-scrollbar { display:none; }
  .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }

  /* Mobile */
  @media (max-width:768px) {
    .hide-mobile { display:none !important; }
    .stack-mobile { flex-direction:column !important; }
    .full-mobile  { width:100% !important; }
  }
`

/* ─── Data ───────────────────────────────────────────────────────────────── */
const HERO_IMGS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1600&q=85',
]

const STATS = [
  { val:'20K+', label:'Rooms Designed',     sub:'by our community'       },
  { val:'150+', label:'Furniture Items',    sub:'in the free catalog'    },
  { val:'500+', label:'Room Templates',     sub:'ready to customize'     },
  { val:'100%', label:'Free to Use',        sub:'no credit card needed'  },
]

const STYLE_QUIZ = [
  { id:'modern',    label:'Modern & Minimal',  sub:'Clean lines, neutral tones, less is more',       img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80', color:'#2d2d2d' },
  { id:'luxe',      label:'Classic & Luxe',    sub:'Rich textures, gold accents, timeless elegance', img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80', color:'#8b6914' },
  { id:'boho',      label:'Boho & Natural',    sub:'Plants, rattan, earthy colours and warmth',      img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80', color:'#5a7c4a' },
  { id:'japandi',   label:'Japandi Calm',       sub:'Japanese simplicity meets Scandinavian warmth',  img:'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=600&q=80', color:'#6b5b45' },
]

const HOW_STEPS = [
  { n:'01', icon:'🏠', title:'Draw Your Room',     desc:'Sketch walls, add doors and windows. Use our snap grid for precision — no experience needed.',  img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { n:'02', icon:'🛋',  title:'Style & Furnish',   desc:'Browse 150+ furniture items, choose wall colours, flooring and ceiling finishes from our catalog.', img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
  { n:'03', icon:'✨', title:'Visualise in 3D',    desc:'See your room come alive in real-time 3D. View in AR, export renders, or share with a link.',      img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80' },
]

const FEATURES = [
  { icon:'📐', title:'Snap-to-Grid Drawing',     desc:'Precise wall drawing with measurement display and auto-snap alignment', badge:'Studio', color:'#eef2ff' },
  { icon:'🚪', title:'Doors & Windows Library',  desc:'Dedicated library for single, double, sliding doors and all window types', badge:'Studio', color:'#fef9ee' },
  { icon:'🛋',  title:'150+ Furniture Catalog',   desc:'Seating, beds, dining, storage, lighting, decor, kitchen and bathroom', badge:'Free', color:'#f0fdf4' },
  { icon:'🎨', title:'Material Editor',           desc:'Walls, floors and ceilings — choose from 30+ surface materials per layer', badge:'Studio', color:'#fdf4ff' },
  { icon:'📱', title:'AR Room Preview',           desc:'Point your phone at any room and see the furniture placed in real space', badge:'New', color:'#fff1f1' },
  { icon:'✦',  title:'AI Floor Plan',            desc:'Describe your room in words — Gemini AI draws the floor plan instantly', badge:'AI', color:'#f0fdf4' },
  { icon:'📄', title:'PDF Design Report',         desc:'Export a professional 2-page PDF with floor plan, 3D view and furniture schedule', badge:'Export', color:'#fef9ee' },
  { icon:'⬆',  title:'Custom 3D Model Upload',   desc:'Upload your own GLB/GLTF models to place real brand furniture in your design', badge:'Pro', color:'#eef2ff' },
  { icon:'💾', title:'Save & Share Designs',      desc:'Auto-save to browser, share with a link, or export as JSON for later', badge:'Free', color:'#f0fdf4' },
  { icon:'↩',  title:'Undo / Redo History',       desc:'Full 50-step undo/redo stack so you can explore without fear', badge:'Studio', color:'#fff1f1' },
  { icon:'🛒', title:'Shop the Look',             desc:'Every furniture item links directly to Amazon.in to purchase', badge:'Commerce', color:'#fef9ee' },
  { icon:'🏷',  title:'Named Version Saves',       desc:'Save design snapshots with names and restore them any time', badge:'Studio', color:'#fdf4ff' },
]

const COMMUNITY = [
  { title:'Scandinavian Living',    user:'Priya R.',  likes:2841, img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80',  tall:true  },
  { title:'Japandi Bedroom',        user:'Kenji T.',  likes:1924, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=500&q=80',  tall:false },
  { title:'Boho Reading Nook',      user:'Anya K.',   likes:3102, img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=500&q=80',  tall:false },
  { title:'Dark Luxe Master Suite', user:'Raj M.',    likes:4289, img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=80',  tall:true  },
  { title:'Nordic Kitchen',         user:'Lena B.',   likes:1563, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=500&q=80',  tall:false },
  { title:'Warm Dining Room',       user:'Sofia R.',  likes:2190, img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=500&q=80',  tall:false },
  { title:'Industrial Home Office', user:'Dev S.',    likes:1748, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=500&q=80',  tall:true  },
  { title:'Artisan Bathroom',       user:'Marie D.',  likes:2934, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=500&q=80',  tall:false },
  { title:'Kids Treehouse Room',    user:'Nina P.',   likes:5012, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=80',  tall:false },
]

const TEMPLATES = [
  { title:'Modern Living Room',  style:'Modern',      img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=75', room:'Living' },
  { title:'Japandi Bedroom',     style:'Japandi',     img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=75', room:'Bedroom' },
  { title:'Nordic Kitchen',      style:'Scandi',      img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=75', room:'Kitchen' },
  { title:'Warm Dining',         style:'Classic',     img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=75', room:'Dining' },
  { title:'Luxe Bathroom',       style:'Luxury',      img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=75', room:'Bathroom' },
  { title:'Minimal Home Office', style:'Minimalist',  img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=400&q=75', room:'Office' },
  { title:'Boho Sanctuary',      style:'Bohemian',    img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=75', room:'Bedroom' },
  { title:'Dark Luxe Living',    style:'Industrial',  img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=75', room:'Living' },
  { title:'Kids Playroom',       style:'Playful',     img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=75', room:'Kids' },
  { title:'Pooja Room',          style:'Traditional', img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=75', room:'Pooja' },
]

const BEFORE_IMG = 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=900&q=85'
const AFTER_IMG  = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85'

const TICKER_ITEMS = ['Floor Plan','3D Visualization','AR Preview','AI Floor Plan','Furniture Catalog','Material Editor','PDF Export','Custom Models','Version History','Room Templates','Shop the Look','Snap Grid','Doors & Windows']

/* ─── Hooks ──────────────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const sel = '.reveal,.reveal-left,.reveal-right,.reveal-scale'
    function run() {
      const els = document.querySelectorAll(sel)
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
      }, { threshold: 0.1 })
      els.forEach(el => io.observe(el))
      return io
    }
    const io = run()
    return () => io.disconnect()
  }, [])
}

function useCountUp(end, inView) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const num = parseInt(end.replace(/\D/g,''))
    let start = null
    function step(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1600, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setN(Math.round(ease * num))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, end])
  return n
}

/* ─── Before/After Slider ────────────────────────────────────────────────── */
function BeforeAfterSlider() {
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const ref = useRef(null)

  const move = useCallback(clientX => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos(Math.max(5, Math.min(95, ((clientX - r.left) / r.width) * 100)))
  }, [])

  useEffect(() => {
    if (!dragging) return
    const up = () => setDragging(false)
    const mv = e => move(e.touches ? e.touches[0].clientX : e.clientX)
    window.addEventListener('mousemove', mv)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', mv, { passive: true })
    window.addEventListener('touchend', up)
    return () => { window.removeEventListener('mousemove',mv); window.removeEventListener('mouseup',up); window.removeEventListener('touchmove',mv); window.removeEventListener('touchend',up) }
  }, [dragging, move])

  return (
    <div ref={ref} className="ba-slider"
      onMouseDown={e=>{ setDragging(true); move(e.clientX) }}
      onTouchStart={e=>{ setDragging(true); move(e.touches[0].clientX) }}
      style={{ width:'100%', height:480, position:'relative', borderRadius:2, overflow:'hidden' }}>

      {/* Before (base) */}
      <img src={BEFORE_IMG} alt="Before" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />

      {/* After (clipped) */}
      <div style={{ position:'absolute', inset:0, width:`${pos}%`, overflow:'hidden' }}>
        <img src={AFTER_IMG} alt="After" style={{ position:'absolute', inset:0, width:`${100/pos*100}%`, maxWidth:'unset', height:'100%', objectFit:'cover' }} />
      </div>

      {/* Divider */}
      <div style={{ position:'absolute', top:0, bottom:0, left:`${pos}%`, width:2, background:WHITE, transform:'translateX(-50%)', zIndex:10 }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:44, height:44, background:WHITE, borderRadius:'50%', boxShadow:'0 4px 24px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:2 }}>
          <span style={{ fontSize:11, color:DARK }}>◀</span>
          <span style={{ fontSize:11, color:DARK }}>▶</span>
        </div>
      </div>

      {/* Labels */}
      <div style={{ position:'absolute', top:16, left:16, background:'rgba(0,0,0,0.6)', color:WHITE, padding:'5px 14px', fontFamily:SS, fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', backdropFilter:'blur(4px)' }}>Before</div>
      <div style={{ position:'absolute', top:16, right:16, background:GOLD, color:DARK, padding:'5px 14px', fontFamily:SS, fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase' }}>After</div>
    </div>
  )
}

/* ─── Stat Counter Card ──────────────────────────────────────────────────── */
function StatCard({ val, label, sub, inView }) {
  const num = useCountUp(val, inView)
  const suffix = val.replace(/[\d]/g,'')
  return (
    <div style={{ flex:1, minWidth:140, textAlign:'center', padding:'28px 16px' }}>
      <div style={{ fontFamily:SF, fontSize:'clamp(40px,4vw,62px)', fontWeight:400, color:GOLD, lineHeight:1, letterSpacing:'-0.02em' }}>
        {num}{suffix}
      </div>
      <div style={{ fontFamily:SS, fontSize:13, fontWeight:700, color:TEXT, marginTop:6 }}>{label}</div>
      <div style={{ fontFamily:SS, fontSize:11, color:MUTED, marginTop:2 }}>{sub}</div>
    </div>
  )
}

/* ─── Main Export ────────────────────────────────────────────────────────── */
export default function HomePage() {
  useReveal()
  const nav = useNavigate()
  const [quizSel,    setQuizSel]    = useState(null)
  const [statsVis,   setStatsVis]   = useState(false)
  const [likedCards, setLikedCards] = useState({})
  const [hovTemplate, setHovTemplate] = useState(null)
  const statsRef = useRef(null)

  /* Inject global CSS once */
  useEffect(() => {
    const id = 'hs-global'
    if (!document.getElementById(id)) {
      const s = document.createElement('style'); s.id = id; s.textContent = GLOBAL_CSS; document.head.appendChild(s)
    }
  }, [])

  /* Stats visibility */
  useEffect(() => {
    if (!statsRef.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVis(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(statsRef.current)
    return () => io.disconnect()
  }, [])

  /* Re-run reveal after mount for any late renders */
  useEffect(() => {
    setTimeout(() => {
      const els = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale')
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
      }, { threshold: 0.08 })
      els.forEach(el => io.observe(el))
    }, 200)
  }, [])

  function toggleLike(i) { setLikedCards(p => ({ ...p, [i]: !p[i] })) }

  return (
    <div style={{ fontFamily:SS, background:CREAM, minHeight:'100vh', overflowX:'hidden' }}>
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Immersive fullscreen with cycling photography
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', height:'100svh', minHeight:600, background:DARK, overflow:'hidden' }}>

        {/* Background cycling images */}
        {HERO_IMGS.map((src,i) => (
          <img key={i} src={src} alt="" className="hero-img" style={{ animationDelay:`${i*5}s` }} />
        ))}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(13,12,8,0.88) 40%, rgba(13,12,8,0.2))', zIndex:1 }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(13,12,8,0.6) 0%, transparent 50%)', zIndex:1 }} />

        {/* Content */}
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', alignItems:'center', padding:'0 clamp(24px,6vw,100px)', maxWidth:1300, margin:'0 auto' }}>
          <div style={{ maxWidth:700, animation:'fadeIn 1s ease 0.2s both' }}>

            {/* Eyebrow */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, border:'1px solid rgba(201,162,39,0.35)', padding:'6px 14px', marginBottom:28, backdropFilter:'blur(8px)', background:'rgba(201,162,39,0.06)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:GOLD, animation:'pulseDot 1.8s ease-in-out infinite' }} />
              <span style={{ fontFamily:SS, fontSize:10, fontWeight:700, color:GOLD, letterSpacing:'0.28em', textTransform:'uppercase' }}>Free Interior Design Tool</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily:SF, fontSize:'clamp(42px,6.5vw,96px)', fontWeight:300, color:WHITE, lineHeight:1.0, letterSpacing:'-0.02em', marginBottom:24 }}>
              Design your<br />
              <em style={{ color:GOLD, fontStyle:'italic' }}>dream space</em><br />
              in minutes.
            </h1>

            {/* Sub */}
            <p style={{ fontFamily:SS, fontSize:'clamp(15px,1.5vw,18px)', color:'rgba(255,255,255,0.65)', lineHeight:1.8, maxWidth:520, marginBottom:40 }}>
              Anyone can design a beautiful home. No experience needed — just pick a style, place furniture, and see it in 3D instantly.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button onClick={()=>nav('/studio')}
                style={{ fontFamily:SS, fontSize:12, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase',
                  padding:'16px 40px', background:`linear-gradient(135deg,${GOLD},${GOLDL})`, color:DARK,
                  border:'none', cursor:'pointer', transition:'all 0.25s', boxShadow:`0 8px 32px rgba(201,162,39,0.4)` }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 16px 48px rgba(201,162,39,0.5)` }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`0 8px 32px rgba(201,162,39,0.4)` }}>
                Start Designing Free →
              </button>
              <button onClick={()=>nav('/gallery')}
                style={{ fontFamily:SS, fontSize:12, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase',
                  padding:'16px 32px', background:'transparent', color:'rgba(255,255,255,0.8)',
                  border:'1px solid rgba(255,255,255,0.2)', cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(8px)' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'; e.currentTarget.style.color=WHITE }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='rgba(255,255,255,0.8)' }}>
                Browse Inspiration
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:36, flexWrap:'wrap' }}>
              <div style={{ display:'flex' }}>
                {['🧑','👩','🧑','👩','🧑'].map((e,i) => (
                  <div key={i} style={{ width:34, height:34, borderRadius:'50%', background:`hsl(${25+i*20},45%,${48+i*5}%)`, border:'2px solid rgba(13,12,8,0.8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, marginLeft:i>0?-10:0 }}>{e}</div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily:SS, fontSize:12, fontWeight:700, color:WHITE }}>Loved by 20,000+ designers</div>
                <div style={{ fontFamily:SS, fontSize:10, color:'rgba(255,255,255,0.4)' }}>homeowners, architects &amp; students</div>
              </div>
              <div style={{ display:'flex', gap:2, marginLeft:4 }}>
                {'★★★★★'.split('').map((_,i) => <span key={i} style={{ color:GOLD, fontSize:16 }}>★</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Floating feature pills */}
        <div className="hide-mobile" style={{ position:'absolute', right:'5%', top:'50%', transform:'translateY(-50%)', zIndex:2, display:'flex', flexDirection:'column', gap:10, animation:'slideDown 1s ease 0.6s both' }}>
          {[['📐','Snap Grid'],['🚪','Doors & Windows'],['📱','AR Preview'],['✦','AI Floor Plan'],['🛋','150+ Furniture']].map(([ic,lb],i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.12)', padding:'10px 18px', display:'flex', alignItems:'center', gap:10, animation:`float ${3+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.3}s` }}>
              <span style={{ fontSize:16 }}>{ic}</span>
              <span style={{ fontFamily:SS, fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.85)', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{lb}</span>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:2, textAlign:'center' }}>
          <div style={{ fontFamily:SS, fontSize:9, letterSpacing:'0.28em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:10 }}>Discover</div>
          <div style={{ width:1, height:52, background:'linear-gradient(to bottom,rgba(255,255,255,0.4),transparent)', margin:'0 auto' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TICKER — Scrolling feature names
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ background:GOLD, padding:'13px 0', overflow:'hidden' }}>
        <div style={{ display:'flex', whiteSpace:'nowrap', animation:'ticker 30s linear infinite' }}>
          {[0,1,2].map(d => (
            <span key={d} style={{ display:'inline-flex' }}>
              {TICKER_ITEMS.map((s,i) => (
                <span key={i} style={{ fontFamily:SS, fontSize:10, fontWeight:800, letterSpacing:'0.26em', textTransform:'uppercase', color:DARK, padding:'0 28px' }}>
                  ✦ {s}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS — Animated counters
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={statsRef} style={{ background:DARK, borderTop:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexWrap:'wrap', justifyContent:'center', gap:0 }}>
          {STATS.map((s,i) => (
            <StatCard key={i} {...s} inView={statsVis} />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS — 3 visual steps
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:'110px clamp(24px,6vw,80px)', background:CREAM }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          <div style={{ textAlign:'center', marginBottom:70 }} className="reveal">
            <div style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:14 }}>Simple 3-Step Process</div>
            <h2 style={{ fontFamily:SF, fontSize:'clamp(36px,4.5vw,68px)', fontWeight:300, color:DARK, lineHeight:1.05, letterSpacing:'-0.01em' }}>
              From blank room to<br /><em style={{ fontStyle:'italic', color:GOLD }}>stunning design</em>
            </h2>
            <p style={{ fontFamily:SS, fontSize:16, color:MUTED, maxWidth:560, margin:'20px auto 0', lineHeight:1.8 }}>
              No architecture degree. No design software. No expensive consultants. Just you and your imagination.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:32 }}>
            {HOW_STEPS.map((s,i) => (
              <div key={i} className="reveal card-hover" style={{ background:WHITE, border:`1px solid ${BORDER}`, overflow:'hidden', animationDelay:`${i*120}ms` }}>
                <div style={{ position:'relative', height:240, overflow:'hidden' }}>
                  <img src={s.img} alt={s.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} loading="lazy" />
                  <div style={{ position:'absolute', top:0, left:0, width:60, height:60, background:GOLD, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:SS, fontSize:22, fontWeight:800, color:DARK }}>{s.n}</span>
                  </div>
                </div>
                <div style={{ padding:'28px 28px 32px' }}>
                  <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                  <h3 style={{ fontFamily:SF, fontSize:28, fontWeight:400, color:DARK, marginBottom:10 }}>{s.title}</h3>
                  <p style={{ fontFamily:SS, fontSize:14, color:MUTED, lineHeight:1.8 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:56 }} className="reveal">
            <button onClick={()=>nav('/studio')}
              style={{ fontFamily:SS, fontSize:11, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase',
                padding:'15px 48px', background:DARK, color:WHITE, border:'none', cursor:'pointer', transition:'all 0.25s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=GOLD; e.currentTarget.style.color=DARK }}
              onMouseLeave={e=>{ e.currentTarget.style.background=DARK; e.currentTarget.style.color=WHITE }}>
              Try It Now — It's Free →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STYLE QUIZ — Discover your design personality
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:'100px clamp(24px,6vw,80px)', background:DARK2 }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }} className="reveal">
            <div style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:14 }}>Design Style Quiz</div>
            <h2 style={{ fontFamily:SF, fontSize:'clamp(32px,4vw,60px)', fontWeight:300, color:WHITE, lineHeight:1.1 }}>
              What's your design<br /><em style={{ color:GOLD }}>personality?</em>
            </h2>
            <p style={{ fontFamily:SS, fontSize:15, color:'rgba(255,255,255,0.5)', marginTop:18 }}>Pick your vibe — we'll open the studio styled just for you</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
            {STYLE_QUIZ.map((s,i) => {
              const sel = quizSel === s.id
              return (
                <div key={i} className="reveal" style={{ animationDelay:`${i*80}ms` }}>
                  <button onClick={() => { setQuizSel(s.id); setTimeout(() => nav('/studio'), 600) }}
                    style={{ width:'100%', textAlign:'left', cursor:'pointer', border:`2px solid ${sel ? GOLD : 'transparent'}`,
                      outline:'none', background:'none', padding:0, position:'relative', overflow:'hidden', transition:'border-color 0.2s' }}>
                    <div style={{ position:'relative', paddingBottom:'80%', overflow:'hidden' }}>
                      <img src={s.img} alt={s.label} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
                        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
                        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} loading="lazy" />
                      <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)` }} />
                      {sel && <div style={{ position:'absolute', inset:0, background:'rgba(201,162,39,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ width:52, height:52, border:`3px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', fontSize:22, color:GOLD }}>✓</div>
                      </div>}
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 20px 22px' }}>
                        <div style={{ fontFamily:SF, fontSize:22, fontWeight:400, color:WHITE, marginBottom:4 }}>{s.label}</div>
                        <div style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>{s.sub}</div>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          <p style={{ textAlign:'center', fontFamily:SS, fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:32 }}>
            Click any style to open the Studio — or{' '}
            <button onClick={()=>nav('/studio')} style={{ background:'none', border:'none', color:GOLD, fontFamily:SS, fontSize:12, cursor:'pointer', textDecoration:'underline' }}>start from scratch</button>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TEMPLATE GALLERY — Horizontal scroll
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:'100px 0 80px', background:CREAM, overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(24px,6vw,80px)' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:20, marginBottom:48 }} className="reveal">
            <div>
              <div style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:14 }}>500+ Free Templates</div>
              <h2 style={{ fontFamily:SF, fontSize:'clamp(32px,4vw,58px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
                Start from a<br /><em style={{ fontStyle:'italic', color:GOLDD }}>beautiful room</em>
              </h2>
            </div>
            <button onClick={()=>nav('/studio')}
              style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', padding:'12px 28px', background:'transparent', border:`1px solid ${DARK}`, color:DARK, cursor:'pointer', transition:'all 0.2s', flexShrink:0 }}
              onMouseEnter={e=>{ e.currentTarget.style.background=DARK; e.currentTarget.style.color=WHITE }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=DARK }}>
              View All Templates →
            </button>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div className="no-scrollbar" style={{ display:'flex', gap:20, overflowX:'auto', padding:'4px clamp(24px,6vw,80px) 20px' }}>
          {TEMPLATES.map((t,i) => (
            <div key={i} className="card-hover" style={{ flexShrink:0, width:280, cursor:'pointer', position:'relative', background:WHITE, border:`1px solid ${BORDER}`, overflow:'hidden' }}
              onClick={()=>nav('/studio')}
              onMouseEnter={()=>setHovTemplate(i)}
              onMouseLeave={()=>setHovTemplate(null)}>
              <div style={{ position:'relative', height:200, overflow:'hidden' }}>
                <img src={t.img} alt={t.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease', transform:hovTemplate===i?'scale(1.08)':'scale(1)' }} loading="lazy" />
                <div style={{ position:'absolute', inset:0, background:`rgba(13,12,8,${hovTemplate===i?0.45:0.1})`, transition:'background 0.3s', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {hovTemplate===i && (
                    <div style={{ background:GOLD, color:DARK, padding:'9px 22px', fontFamily:SS, fontSize:10, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                      Use Template →
                    </div>
                  )}
                </div>
                <div style={{ position:'absolute', top:10, right:10, background:'#16a34a', color:WHITE, padding:'3px 8px', fontFamily:SS, fontSize:9, fontWeight:800, letterSpacing:'0.1em' }}>FREE</div>
              </div>
              <div style={{ padding:'16px 18px' }}>
                <div style={{ fontFamily:SF, fontSize:17, fontWeight:400, color:DARK, marginBottom:4 }}>{t.title}</div>
                <div style={{ fontFamily:SS, fontSize:10, color:MUTED }}>{t.style} · {t.room}</div>
              </div>
            </div>
          ))}
          {/* "See all" card */}
          <div style={{ flexShrink:0, width:240, border:`2px dashed ${BORDER}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, cursor:'pointer', padding:32, transition:'border-color 0.2s' }}
            onClick={()=>nav('/studio')}
            onMouseEnter={e=>e.currentTarget.style.borderColor=GOLD}
            onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
            <div style={{ width:52, height:52, background:DARK, display:'flex', alignItems:'center', justifyContent:'center', color:WHITE, fontSize:24, fontWeight:300 }}>+</div>
            <div style={{ fontFamily:SS, fontSize:12, fontWeight:700, color:DARK, textAlign:'center' }}>500+ More Templates</div>
            <div style={{ fontFamily:SS, fontSize:10, color:MUTED, textAlign:'center' }}>All free · No sign-in</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES GRID — What you can do
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:'100px clamp(24px,6vw,80px)', background:WHITE }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:70 }} className="reveal">
            <div style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:14 }}>Every Tool You Need</div>
            <h2 style={{ fontFamily:SF, fontSize:'clamp(34px,4.5vw,64px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
              Professional-grade tools.<br /><em style={{ fontStyle:'italic', color:GOLD }}>Zero cost.</em>
            </h2>
            <p style={{ fontFamily:SS, fontSize:16, color:MUTED, maxWidth:520, margin:'20px auto 0', lineHeight:1.8 }}>
              Everything Homestyler has — and features they don't — all in your browser, free forever.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {FEATURES.map((f,i) => (
              <div key={i} className="reveal card-hover" style={{ background:f.color, border:`1px solid rgba(0,0,0,0.05)`, padding:'28px 26px', animationDelay:`${i*50}ms` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <span style={{ fontSize:32 }}>{f.icon}</span>
                  <span style={{ fontFamily:SS, fontSize:8, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', background:DARK, color:WHITE, padding:'3px 8px' }}>{f.badge}</span>
                </div>
                <h3 style={{ fontFamily:SS, fontSize:14, fontWeight:700, color:DARK, marginBottom:8 }}>{f.title}</h3>
                <p style={{ fontFamily:SS, fontSize:12, color:MUTED, lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BEFORE/AFTER — Transformation showcase
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:'100px clamp(24px,6vw,80px)', background:DARK, overflow:'hidden' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }} className="stack-mobile">
            <div className="reveal-left">
              <div style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:18 }}>Transformation</div>
              <h2 style={{ fontFamily:SF, fontSize:'clamp(34px,4vw,58px)', fontWeight:300, color:WHITE, lineHeight:1.1, marginBottom:22 }}>
                See the<br /><em style={{ color:GOLD }}>difference</em><br />it makes.
              </h2>
              <p style={{ fontFamily:SS, fontSize:15, color:'rgba(255,255,255,0.55)', lineHeight:1.8, marginBottom:36 }}>
                Drag the slider to compare an empty room against a fully designed space. This is what you can create — for free, today, in your browser.
              </p>
              <button onClick={()=>nav('/studio')}
                style={{ fontFamily:SS, fontSize:11, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', padding:'14px 40px', background:GOLD, color:DARK, border:'none', cursor:'pointer', transition:'all 0.25s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=GOLDL; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background=GOLD; e.currentTarget.style.transform='none' }}>
                Design Your Room →
              </button>
            </div>
            <div className="reveal-right">
              <BeforeAfterSlider />
              <p style={{ fontFamily:SS, fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:12, textAlign:'center', letterSpacing:'0.1em' }}>← Drag the slider to compare</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          COMMUNITY — Masonry inspiration wall
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:'100px clamp(24px,6vw,80px)', background:CREAM }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }} className="reveal">
            <div style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:14 }}>Community Creations</div>
            <h2 style={{ fontFamily:SF, fontSize:'clamp(32px,4vw,58px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
              Real rooms designed<br /><em style={{ fontStyle:'italic', color:GOLD }}>by real people</em>
            </h2>
            <p style={{ fontFamily:SS, fontSize:15, color:MUTED, marginTop:18 }}>Every design you see was made by someone with no prior design experience — just curiosity.</p>
          </div>

          {/* Masonry-style grid (CSS columns) */}
          <div style={{ columns:'repeat(3, 1fr)', columnGap:16, gap:16 }}>
            {COMMUNITY.map((c,i) => (
              <div key={i} className="reveal card-hover" style={{ breakInside:'avoid', marginBottom:16, background:WHITE, border:`1px solid ${BORDER}`, overflow:'hidden', animationDelay:`${i*60}ms`, position:'relative', cursor:'pointer' }}
                onClick={()=>nav('/gallery')}>
                <div style={{ position:'relative', paddingBottom:c.tall?'120%':'75%', overflow:'hidden' }}>
                  <img src={c.img} alt={c.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='none'} loading="lazy" />
                </div>
                <div style={{ padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontFamily:SS, fontSize:12, fontWeight:700, color:DARK }}>{c.title}</div>
                    <div style={{ fontFamily:SS, fontSize:10, color:MUTED, marginTop:2 }}>by {c.user}</div>
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); toggleLike(i) }}
                    style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:5, padding:'4px 6px' }}>
                    <span style={{ fontSize:16, color:likedCards[i]?'#ef4444':MUTED, transition:'all 0.2s', transform:likedCards[i]?'scale(1.2)':'scale(1)' }}>
                      {likedCards[i]?'♥':'♡'}
                    </span>
                    <span style={{ fontFamily:SS, fontSize:10, color:MUTED }}>
                      {(c.likes + (likedCards[i]?1:0)).toLocaleString('en-IN')}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:52 }} className="reveal">
            <button onClick={()=>nav('/gallery')}
              style={{ fontFamily:SS, fontSize:11, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', padding:'14px 44px', background:'transparent', color:DARK, border:`2px solid ${DARK}`, cursor:'pointer', transition:'all 0.25s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=DARK; e.currentTarget.style.color=WHITE }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=DARK }}>
              Explore Gallery →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ROOM TYPES — Quick entry points by room
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:'80px clamp(24px,6vw,80px)', background:WHITE }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }} className="reveal">
            <h2 style={{ fontFamily:SF, fontSize:'clamp(28px,3.5vw,50px)', fontWeight:300, color:DARK }}>
              Design every room in your home
            </h2>
          </div>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              ['🛋','Living Room'],['🛏','Bedroom'],['🍳','Kitchen'],['🍽','Dining'],
              ['🛁','Bathroom'],['💻','Home Office'],['👶','Kids Room'],['🪔','Pooja Room'],
              ['🌿','Balcony'],['🏢','Commercial'],
            ].map(([ic,lb],i)=>(
              <button key={i} onClick={()=>nav('/studio')} className="reveal" style={{ animationDelay:`${i*40}ms`, display:'flex', alignItems:'center', gap:10, padding:'14px 24px', border:`1px solid ${BORDER}`, background:CREAM, cursor:'pointer', fontFamily:SS, fontSize:12, fontWeight:600, color:TEXT, transition:'all 0.2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=GOLD; e.currentTarget.style.color=DARK; e.currentTarget.style.borderColor=GOLD }}
                onMouseLeave={e=>{ e.currentTarget.style.background=CREAM; e.currentTarget.style.color=TEXT; e.currentTarget.style.borderColor=BORDER }}>
                <span style={{ fontSize:20 }}>{ic}</span>
                {lb}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA — Full-width emotional push
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', overflow:'hidden', background:DARK, padding:'100px clamp(24px,6vw,80px)' }}>
        <img src="https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=80" alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.12 }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:22 }} className="reveal">Start Today</div>
          <h2 style={{ fontFamily:SF, fontSize:'clamp(40px,6vw,88px)', fontWeight:300, color:WHITE, lineHeight:1.0, marginBottom:24, letterSpacing:'-0.02em' }} className="reveal">
            Your dream space<br />starts with<br /><em style={{ color:GOLD }}>one click.</em>
          </h2>
          <p style={{ fontFamily:SS, fontSize:16, color:'rgba(255,255,255,0.5)', lineHeight:1.8, marginBottom:48, maxWidth:480, margin:'0 auto 48px' }} className="reveal">
            No downloads. No signup required. No design experience needed. Just start designing right now.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }} className="reveal">
            <button onClick={()=>nav('/studio')}
              style={{ fontFamily:SS, fontSize:13, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', padding:'18px 56px', background:`linear-gradient(135deg,${GOLD},${GOLDL})`, color:DARK, border:'none', cursor:'pointer', boxShadow:`0 10px 40px rgba(201,162,39,0.4)`, transition:'all 0.25s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 20px 60px rgba(201,162,39,0.55)` }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`0 10px 40px rgba(201,162,39,0.4)` }}>
              Start Designing Free
            </button>
            <button onClick={()=>nav('/gallery')}
              style={{ fontFamily:SS, fontSize:12, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', padding:'18px 36px', background:'transparent', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.2)', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'; e.currentTarget.style.color=WHITE }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='rgba(255,255,255,0.7)' }}>
              Browse Inspiration
            </button>
          </div>
          <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:28 }}>Free forever · Works in your browser · No credit card</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer style={{ background:'#0a0905', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'60px clamp(24px,6vw,80px) 36px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr repeat(3, 1fr)', gap:48, marginBottom:52 }} className="stack-mobile">
            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                <div style={{ width:34, height:34, background:GOLD, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SF, fontSize:16, fontWeight:500, color:DARK }}>ES</div>
                <div>
                  <div style={{ fontFamily:SF, fontSize:20, color:WHITE, letterSpacing:'0.04em' }}>El Shaddai</div>
                  <div style={{ fontFamily:SS, fontSize:9, color:'rgba(255,255,255,0.35)', letterSpacing:'0.2em', textTransform:'uppercase' }}>Interior Design</div>
                </div>
              </div>
              <p style={{ fontFamily:SS, fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.8, maxWidth:260 }}>
                A free, browser-based interior design tool for everyone — no experience or download required.
              </p>
              <div style={{ display:'flex', gap:8, marginTop:22 }}>
                {[['Instagram','📷'],['Facebook','📘'],['YouTube','▶'],['Pinterest','📌']].map(([n,ic])=>(
                  <a key={n} href="#" style={{ width:36, height:36, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, textDecoration:'none', transition:'background 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.background=GOLD}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                    {ic}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title:'Tool', links:[['Studio','/studio'],['Gallery','/gallery'],['My Projects','/my-projects'],['Pricing','/pricing']] },
              { title:'Company', links:[['Portfolio','/portfolio'],['Blog','/blog'],['Contact','#contact'],['About','#about']] },
              { title:'Support', links:[['How to Use','/blog'],['FAQ','/pricing'],['Privacy Policy','#'],['Terms','#']] },
            ].map((col,i)=>(
              <div key={i}>
                <div style={{ fontFamily:SS, fontSize:9, fontWeight:800, letterSpacing:'0.26em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:20 }}>{col.title}</div>
                {col.links.map(([label,href])=>(
                  <a key={label} href={href} style={{ display:'block', fontFamily:SS, fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'none', marginBottom:12, transition:'color 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.color=GOLD}
                    onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                    {label}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:28, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.2)' }}>© 2025 El Shaddai Interior Design. Made with ♥ in India.</p>
            <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.2)' }}>elshaddaiinterior.vercel.app</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
