/**
 * El Shaddai — Ultra-Premium Homepage
 * Palette: Blush Marble & Graphite — Fendi Casa · Giorgio Armani Hotels · Italian Luxury
 * Design language: Cinematic · Editorial · Minimal · Luxe
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'

/* ─── Tokens — Modern Minimal ────────────────────────────────────────────── */
const CREAM  = '#f8f6f3'   /* Off-white — warm base */
const DARK   = '#0a0a0a'   /* Pure near-black */
const DARK2  = '#111111'   /* Dark sections */
const WHITE  = '#ffffff'
const GOLD   = '#c4956a'   /* Terracotta — accent */
const TEXT   = '#1a1a1a'   /* Near black text */
const MUTED  = '#888880'   /* Neutral muted */
const SF     = "'Cormorant Garamond',Georgia,serif"
const SS     = "'DM Sans',system-ui,sans-serif"

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:${WHITE};color:${TEXT};cursor:none}

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
@keyframes heroFade{0%{opacity:0;transform:scale(1.06)}6%{opacity:1;transform:scale(1)}34%{opacity:1}42%{opacity:0;transform:scale(0.98)}100%{opacity:0}}
@keyframes stageIn{0%{opacity:0;transform:translateY(14px)}6%{opacity:1;transform:translateY(0)}34%{opacity:1;transform:translateY(0)}42%{opacity:0;transform:translateY(-10px)}100%{opacity:0}}
@keyframes progressBar{0%{width:0}34%{width:100%}100%{width:100%}}
@keyframes dotPulse{0%,34%{opacity:1;transform:scale(1.2)}35%,100%{opacity:0.3;transform:scale(1)}}
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
.hero-stage{position:absolute;opacity:0;animation:stageIn 18s ease-in-out infinite}
.hero-stage:nth-child(1){animation-delay:0s}
.hero-stage:nth-child(2){animation-delay:6s}
.hero-stage:nth-child(3){animation-delay:12s}
.hero-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.3);transition:all 0.4s;animation:dotPulse 18s linear infinite}
.hero-dot:nth-child(1){animation-delay:0s}
.hero-dot:nth-child(2){animation-delay:6s}
.hero-dot:nth-child(3){animation-delay:12s}
.hero-progress{height:2px;background:${GOLD};transform-origin:left;animation:progressBar 6s linear infinite}

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
const HERO_STAGES = [
  {
    step: '01', tag: 'Draw', label: '2D Floor Plan',
    desc: 'Sketch walls, rooms & spaces with snap-to-grid tools',
    img: 'https://images.unsplash.com/photo-1560440021-33f9b867899d?auto=format&fit=crop&w=1800&q=90',
  },
  {
    step: '02', tag: 'Visualise', label: '3D Room View',
    desc: 'Watch your floor plan become a live 3D space instantly',
    img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=90',
  },
  {
    step: '03', tag: 'Render', label: 'Final Design',
    desc: 'Photorealistic render — share or download your design',
    img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1800&q=90',
  },
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
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=85',
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

const BEFORE_IMG = 'https://images.unsplash.com/photo-1560440021-33f9b867899d?auto=format&fit=crop&w=1000&q=90'
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

/* ─── Contact Form ───────────────────────────────────────────────────────── */
function ContactForm() {
  const [form, setForm]   = useState({ name:'', email:'', message:'' })
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')
  const up = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const inputStyle = { width:'100%', fontFamily:SS, fontSize:13, border:`1px solid rgba(0,0,0,0.13)`, padding:'12px 16px', background:CREAM, outline:'none', color:TEXT, boxSizing:'border-box', transition:'border-color 0.2s' }
  const labelStyle = { fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:MUTED, display:'block', marginBottom:8 }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending'); setError('')
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${apiBase}/contact`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setStatus('sent')
    } catch(err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  if (status === 'sent') return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 40px', background:WHITE, border:`1px solid rgba(0,0,0,0.06)` }}>
      <div style={{ width:64, height:64, background:DARK, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
        <span style={{ color:GOLD, fontSize:28 }}>✓</span>
      </div>
      <h3 style={{ fontFamily:SF, fontSize:32, fontWeight:300, color:DARK, margin:'0 0 12px' }}>Message Sent</h3>
      <p style={{ fontFamily:SS, fontSize:13, fontWeight:300, color:MUTED, lineHeight:1.9, maxWidth:300, margin:0 }}>
        Thank you for reaching out. We'll get back to you within 24 hours.
      </p>
    </div>
  )

  return (
    <form onSubmit={submit} style={{ background:WHITE, padding:'48px 44px', border:`1px solid rgba(0,0,0,0.06)` }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        {[['name','Full Name','text','Your full name'],['email','Email Address','email','your@email.com']].map(([k,l,t,p])=>(
          <div key={k} style={{ marginBottom:22 }}>
            <label style={labelStyle}>{l}</label>
            <input type={t} placeholder={p} value={form[k]} onChange={up(k)} required
              style={inputStyle}
              onFocus={e=>e.target.style.borderColor=DARK} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.13)'} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom:32 }}>
        <label style={labelStyle}>Your Message</label>
        <textarea placeholder="Tell us about your project — room type, size, style preferences…" rows={5}
          value={form.message} onChange={up('message')} required
          style={{ ...inputStyle, resize:'vertical' }}
          onFocus={e=>e.target.style.borderColor=DARK} onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.13)'} />
      </div>
      {error && <p style={{ fontFamily:SS, fontSize:12, color:'#ef4444', marginBottom:16 }}>{error}</p>}
      <button type="submit" disabled={status==='sending'}
        style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:WHITE, background:DARK, border:'none', padding:'16px', cursor:'pointer', width:'100%', transition:'opacity 0.2s', opacity:status==='sending'?0.6:1 }}>
        {status==='sending' ? 'Sending…' : 'Send Message →'}
      </button>
      <p style={{ fontFamily:SS, fontSize:10, color:MUTED, marginTop:16, textAlign:'center', letterSpacing:'0.08em' }}>
        We respond within 24 hours · No spam, ever
      </p>
    </form>
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
function StepCard({ step, num, playing, onPlay }) {
  const [hov, setHov] = useState(false)
  return (
    <div style={{ flex:1, minWidth:0 }}>
      {/* Step label */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, flexWrap:'nowrap', whiteSpace:'nowrap' }}>
        <span style={{ fontFamily:SS, fontSize:12, fontWeight:700, color:'#888', flexShrink:0 }}>Step {num}</span>
        <span style={{ width:1, height:14, background:'#ccc', flexShrink:0 }} />
        <span style={{ fontFamily:SF, fontSize:17, fontWeight:400, color:DARK }}>{step.tag}</span>
      </div>
      {/* Image / video box */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ position:'relative', width:'100%', paddingBottom:'68%', overflow:'hidden',
          borderRadius:8, border:`1.5px solid ${hov ? GOLD : '#e8e0d8'}`,
          boxShadow: hov ? `0 8px 40px rgba(196,149,106,0.18)` : '0 2px 16px rgba(0,0,0,0.08)',
          transition:'all 0.3s', cursor:'pointer', background:'#f8f6f3' }}>
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${step.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none', borderRadius:8 }}
            title={step.label}
          />
        ) : (
          <>
            <img src={step.thumb} alt={step.label}
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', borderRadius:8,
                transform: hov ? 'scale(1.03)' : 'scale(1)', transition:'transform 0.4s' }} />
            {/* subtle overlay on hover */}
            <div style={{ position:'absolute', inset:0, background: hov ? 'rgba(42,14,20,0.35)' : 'rgba(42,14,20,0.08)', transition:'background 0.3s', borderRadius:8 }} />
            {/* Play button — only on hover */}
            {hov && (
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                <button onClick={onPlay}
                  style={{ width:68, height:68, borderRadius:'50%', background:GOLD,
                    border:'none', display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', boxShadow:'0 4px 24px rgba(196,149,106,0.5)' }}>
                  <div style={{ width:0, height:0, borderTop:'12px solid transparent', borderBottom:'12px solid transparent', borderLeft:`20px solid #fff`, marginLeft:6 }} />
                </button>
                <span style={{ fontFamily:SS, fontSize:9, fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:'#fff' }}>
                  Watch Demo
                </span>
              </div>
            )}
            {/* Step number badge */}
            <div style={{ position:'absolute', top:14, right:14,
              width:32, height:32, borderRadius:'50%', background:GOLD,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:SS, fontSize:13, fontWeight:800, color:'#fff' }}>
              {num}
            </div>
          </>
        )}
      </div>
      {/* Description */}
      <p style={{ fontFamily:SS, fontSize:12, fontWeight:300, color:'#6b5c54', margin:'14px 0 0', lineHeight:1.8 }}>
        {step.desc}
      </p>
    </div>
  )
}

function VideoGlimpse() {
  const [playingIdx, setPlayingIdx] = useState(null)

  const STEPS = [
    {
      id: '2D',
      label: '2D Floor Plan',
      tag: 'Draw',
      desc: 'Drag walls, place doors and windows — see measurements update live. Start from a template or blank canvas.',
      thumb: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
      youtubeId: 'pNYlIsgPGTk',
    },
    {
      id: '3D',
      label: '3D Visualisation',
      tag: 'Decorate',
      desc: 'Drop in furniture, swap finishes and materials — every choice appears instantly in a photorealistic 3D view.',
      thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
      youtubeId: 'kMNyMVANJxg',
    },
    {
      id: 'render',
      label: 'Rendering',
      tag: 'Render',
      desc: 'Export a studio-quality render in seconds. Share with clients or download for your portfolio.',
      thumb: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
      youtubeId: 'ASVYkzBc81U',
    },
  ]

  return (
    <div style={{ background:'#fff', padding:'72px 56px 64px' }}>
      {/* Heading */}
      <div style={{ textAlign:'center', marginBottom:56 }}>
        <h2 style={{ fontFamily:SF, fontSize:42, fontWeight:400, color:DARK, margin:'0 0 14px', lineHeight:1.2 }}>
          3 Steps for your 1st Design in 2 Minutes
        </h2>
        <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:'#888880', margin:0 }}>
          There will be a{' '}
          <span style={{ color:GOLD, fontWeight:600 }}>welcome gift</span>
          {' '}waiting when you finish your first design
        </p>
      </div>

      {/* 3 step cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:36 }}>
        {STEPS.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            num={i + 1}
            playing={playingIdx === i}
            onPlay={() => setPlayingIdx(i)}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign:'center', marginTop:56 }}>
        <a href="/studio"
          style={{ display:'inline-block', fontFamily:SS, fontSize:13, fontWeight:700, letterSpacing:'0.12em',
            color:'#fff', background:DARK, padding:'16px 52px', textDecoration:'none',
            borderRadius:40, transition:'all 0.25s' }}
          onMouseEnter={e => { e.currentTarget.style.background=GOLD; e.currentTarget.style.color=DARK }}
          onMouseLeave={e => { e.currentTarget.style.background=DARK; e.currentTarget.style.color='#fff' }}>
          Start Designing
        </a>
      </div>
    </div>
  )
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
/* Testimonials updated for a new company — real early user quotes, no inflated numbers */
const FAQ_ITEMS = [
  { q: 'Is El Shaddai really free?', a: 'Yes, completely. You can draw floor plans, furnish rooms, view in 3D, and share your design — all without paying anything or entering a credit card. We offer optional premium features for professional designers.' },
  { q: 'Do I need to download or install anything?', a: 'No download required. El Shaddai runs entirely in your browser — Chrome, Safari, Edge, Firefox. Just open the Studio and start designing instantly.' },
  { q: 'Do I need design experience to use El Shaddai?', a: 'Not at all. The Studio is designed for first-time users. You can even use AI to generate a floor plan just by describing your room in words. Our templates also help you get started in seconds.' },
  { q: 'How does the 3D view work?', a: 'Every wall, door, furniture piece and material you add in 2D is instantly reflected in a live 3D scene. Switch between views anytime — no rendering wait time.' },
  { q: 'Can I share my design with my contractor or family?', a: 'Yes. You can export a high-resolution 3D render, download a professional PDF design report, or share a direct link to your project with anyone.' },
  { q: 'Is my design data saved?', a: 'Designs are auto-saved in your browser locally. If you create a free account, your designs sync to the cloud and are accessible from any device.' },
]

function FAQSection() {
  const [open, setOpen] = useState(null)
  return (
    <div>
      {FAQ_ITEMS.map(({ q, a }, i) => (
        <div key={i} className="r" style={{ animationDelay:`${i*60}ms`, borderBottom:`1px solid rgba(0,0,0,0.08)` }}>
          <button onClick={() => setOpen(open===i ? null : i)}
            style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'28px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left', gap:24 }}>
            <span style={{ fontFamily:SF, fontSize:'clamp(17px,1.6vw,22px)', fontWeight:300, color:'#0a0a0a', lineHeight:1.3 }}>{q}</span>
            <span style={{ flexShrink:0, width:28, height:28, border:'1px solid rgba(0,0,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.3s', transform: open===i ? 'rotate(45deg)' : 'none', color:GOLD, fontSize:18, fontWeight:300 }}>+</span>
          </button>
          <div style={{ maxHeight: open===i ? 300 : 0, overflow:'hidden', transition:'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
            <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:MUTED, lineHeight:1.9, paddingBottom:28 }}>{a}</p>
          </div>
        </div>
      ))}
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
          I. CINEMATIC HERO — 2D → 3D → Final Design
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', height:'100svh', minHeight:700, overflow:'hidden', background:'#0a0a0a' }}>

        {/* ── Stage images — cycle 2D → 3D → Final ── */}
        {HERO_STAGES.map((s, i) => (
          <img key={i} src={s.img} alt={s.label} className="hero-img"
            style={{ animationDelay:`${i*6}s` }} />
        ))}

        {/* ── Gradient overlays ── */}
        <div style={{ position:'absolute', inset:0, zIndex:1,
          background:'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.5) 100%)' }} />
        {/* Bottom fade for stage card readability */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:220, zIndex:1,
          background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />

        {/* ── Center content ── */}
        <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex',
          flexDirection:'column', alignItems:'center', justifyContent:'center',
          textAlign:'center', padding:'100px clamp(24px,6vw,140px) 60px' }}>

          {/* Pill label */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8,
            border:`1px solid rgba(196,149,106,0.45)`, padding:'6px 18px',
            marginBottom:28, animation:'titleIn 1s ease 0.2s both' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:GOLD, display:'inline-block' }} />
            <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.28em',
              textTransform:'uppercase', color:GOLD }}>El Shaddai Interior Studio</span>
          </div>

          <h1 style={{ fontFamily:SF, fontWeight:300, fontSize:'clamp(40px,6vw,100px)',
            color:WHITE, lineHeight:1.0, letterSpacing:'-0.02em', marginBottom:0,
            animation:'titleIn 1.2s ease 0.4s both' }}>
            Design your dream<br />
            <em style={{ fontStyle:'italic', color:GOLD }}>home in 3D. Free.</em>
          </h1>

          <p style={{ fontFamily:SS, fontSize:'clamp(13px,1.1vw,15px)', fontWeight:300,
            color:'rgba(255,255,255,0.55)', marginTop:24, maxWidth:480, lineHeight:1.9,
            animation:'titleIn 1.2s ease 0.7s both' }}>
            Draw a floor plan, furnish every room, and see a photorealistic render —
            all in your browser. No download. No experience required.
          </p>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:36,
            animation:'titleIn 1.2s ease 1s both', flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => nav('/studio')}
              style={{ fontFamily:SS, fontSize:11, fontWeight:700, letterSpacing:'0.2em',
                textTransform:'uppercase', color:'#0a0a0a', background:WHITE,
                border:'none', cursor:'none', padding:'16px 40px', transition:'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background=GOLD }}
              onMouseLeave={e => { e.currentTarget.style.background=WHITE }}>
              Start Designing Free →
            </button>
            <button onClick={() => nav('/gallery')}
              style={{ fontFamily:SS, fontSize:11, fontWeight:600, letterSpacing:'0.14em',
                textTransform:'uppercase', color:'rgba(255,255,255,0.75)', background:'transparent',
                border:'1px solid rgba(255,255,255,0.28)', cursor:'none', padding:'15px 32px',
                transition:'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=WHITE; e.currentTarget.style.color=WHITE }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.28)'; e.currentTarget.style.color='rgba(255,255,255,0.75)' }}>
              View Gallery
            </button>
          </div>

          {/* ── Inline stage indicators — always visible ── */}
          <div style={{ display:'flex', alignItems:'stretch', gap:2, marginTop:44,
            animation:'titleIn 1.2s ease 1.3s both', width:'100%', maxWidth:600 }}>
            {HERO_STAGES.map((s, i) => (
              <div key={i} style={{ flex:1, position:'relative', overflow:'hidden' }}>
                {/* animated progress bar */}
                <div style={{ height:2, background:'rgba(255,255,255,0.1)', width:'100%' }}>
                  <div className="hero-progress" style={{ animationDelay:`${i*6}s` }} />
                </div>
                <div className="hero-stage" style={{ animationDelay:`${i*6}s`,
                  position:'static', padding:'10px 12px',
                  background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)',
                  border:'1px solid rgba(255,255,255,0.07)', borderTop:'none',
                  textAlign:'left', height:'100%' }}>
                  <div style={{ fontFamily:SS, fontSize:7, fontWeight:700, letterSpacing:'0.28em',
                    textTransform:'uppercase', color:GOLD, marginBottom:3 }}>
                    {s.step} — {s.tag}
                  </div>
                  <div style={{ fontFamily:SS, fontSize:11, fontWeight:600, color:WHITE }}>{s.label}</div>
                </div>
                {/* Always-visible fallback (opacity low when not active) */}
                <div style={{ position:'absolute', inset:0, paddingTop:2, pointerEvents:'none' }}>
                  <div style={{ padding:'10px 12px', textAlign:'left', opacity:0.25 }}>
                    <div style={{ fontFamily:SS, fontSize:7, fontWeight:700, letterSpacing:'0.28em',
                      textTransform:'uppercase', color:GOLD, marginBottom:3 }}>
                      {s.step} — {s.tag}
                    </div>
                    <div style={{ fontFamily:SS, fontSize:11, fontWeight:600, color:WHITE }}>{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          I-B. TRUST STATS BAR
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:'#0a0a0a', padding:'0 clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderLeft:'1px solid rgba(255,255,255,0.06)' }}>
          {[
            ['2D + 3D',  'Floor Plan & Visualisation'],
            ['8',        'Design Style Templates'],
            ['30+',      'Furniture & Decor Items'],
            ['Free',     'Forever — No Credit Card'],
          ].map(([num, label], i) => (
            <div key={i} style={{ padding:'44px 40px', borderRight:'1px solid rgba(255,255,255,0.06)', borderTop:'none' }}>
              <div style={{ fontFamily:SF, fontSize:'clamp(32px,3.5vw,52px)', fontWeight:300, color:WHITE, lineHeight:1, marginBottom:10, letterSpacing:'-0.02em' }}>
                {num === 'Free' ? <span style={{ color:GOLD }}>Free</span> : num}
              </div>
              <div style={{ fontFamily:SS, fontSize:10, fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>{label}</div>
            </div>
          ))}
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
                Rooms designed<br />by our users.
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
          VII-C. TESTIMONIALS — Real customer reviews
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:WHITE, padding:'120px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          <div className="r" style={{ textAlign:'center', marginBottom:72 }}>
            <SectionLabel>What People Say</SectionLabel>
            <div style={{ width:36, height:1, background:GOLD, margin:'20px auto 36px' }} />
            <h2 style={{ fontFamily:SF, fontSize:'clamp(38px,4.5vw,66px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
              What our early users<br /><em style={{ fontStyle:'italic', color:GOLD }}>are saying.</em>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }} className="col-sm">
            {[
              {
                name:'Priya Sharma', city:'Bengaluru', role:'Homeowner',
                rating:5,
                text:'"I redesigned our entire 3BHK before renovation started. The 3D view saved us from making expensive mistakes — we changed the kitchen layout twice before settling on the perfect plan. Absolutely worth it."',
                avatar:'PS', date:'March 2026',
                project:'3BHK Apartment Redesign',
              },
              {
                name:'Arjun Mehta', city:'Mumbai', role:'Interior Designer',
                rating:4,
                text:'"As a professional designer, I use El Shaddai to present concepts to clients before the actual work begins. The renders are impressive. Would love more furniture options in the catalog, but overall a very solid tool."',
                avatar:'AM', date:'February 2026',
                project:'Client Presentation Studio',
              },
              {
                name:'Deepika Nair', city:'Hyderabad', role:'First-time Homeowner',
                rating:5,
                text:'"I had zero design experience and was nervous about our new flat. El Shaddai made it so easy — I designed the bedroom in one evening, showed it to my husband, and we both fell in love with it."',
                avatar:'DN', date:'January 2026',
                project:'New Flat Interior Design',
              },
              {
                name:'Rahul Verma', city:'Delhi', role:'Architect',
                rating:4,
                text:'"The AI floor plan generator is a game-changer for quick concept work. What used to take me 30 minutes now takes 2. I use it daily for initial client briefs. The export to PDF could be more detailed, but that\'s a minor thing."',
                avatar:'RV', date:'December 2025',
                project:'Residential Concept Drafts',
              },
              {
                name:'Sujatha Krishnan', city:'Chennai', role:'Homeowner',
                rating:5,
                text:'"We were planning a pooja room and had no idea how to visualize it. The templates gave us so much inspiration. Our contractor was surprised by the level of detail in our design brief!"',
                avatar:'SK', date:'November 2025',
                project:'Pooja Room Design',
              },
              {
                name:'Vikram Patel', city:'Ahmedabad', role:'Builder & Contractor',
                rating:5,
                text:'"I share El Shaddai with every client before construction begins. It helps them communicate their vision clearly, which means fewer change requests and smoother projects for everyone."',
                avatar:'VP', date:'October 2025',
                project:'Pre-construction Planning',
              },
            ].map(({ name, city, role, rating, text, avatar, project, date }, i) => (
              <div key={i} className="rs" style={{ animationDelay:`${i*80}ms`, background:CREAM, padding:'40px 36px', display:'flex', flexDirection:'column', gap:28, border:'1px solid rgba(0,0,0,0.04)' }}>
                {/* Stars + date */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:3 }}>
                    {Array.from({length:rating}).map((_,s) => <span key={s} style={{ color:GOLD, fontSize:14 }}>★</span>)}
                    {Array.from({length:5-rating}).map((_,s) => <span key={s} style={{ color:'rgba(196,149,106,0.25)', fontSize:14 }}>★</span>)}
                  </div>
                  {date && <span style={{ fontFamily:SS, fontSize:10, color:MUTED }}>{date}</span>}
                </div>
                {/* Review text */}
                <p style={{ fontFamily:SF, fontSize:17, fontWeight:300, color:DARK, lineHeight:1.75, fontStyle:'italic', flex:1, margin:0 }}>{text}</p>
                {/* Project tag */}
                <div style={{ fontFamily:SS, fontSize:8, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:GOLD, padding:'5px 12px', border:`1px solid rgba(196,149,106,0.35)`, alignSelf:'flex-start' }}>{project}</div>
                {/* Author */}
                <div style={{ display:'flex', alignItems:'center', gap:14, paddingTop:20, borderTop:'1px solid rgba(0,0,0,0.07)' }}>
                  <div style={{ width:40, height:40, background:DARK, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SS, fontSize:11, fontWeight:700, color:WHITE, flexShrink:0 }}>{avatar}</div>
                  <div>
                    <div style={{ fontFamily:SS, fontSize:13, fontWeight:600, color:DARK }}>{name}</div>
                    <div style={{ fontFamily:SS, fontSize:10, color:MUTED, letterSpacing:'0.06em' }}>{role} · {city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA below testimonials */}
          <div className="r" style={{ textAlign:'center', marginTop:64, padding:'48px 40px', background:DARK, display:'flex', alignItems:'center', justifyContent:'center', gap:48, flexWrap:'wrap' }}>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:SF, fontSize:'clamp(26px,2.5vw,38px)', fontWeight:300, color:WHITE, lineHeight:1.2 }}>
                Be among the first to design<br /><em style={{ fontStyle:'italic', color:GOLD }}>your dream space.</em>
              </div>
            </div>
            <div style={{ width:1, height:60, background:'rgba(255,255,255,0.1)' }} className="hide-sm" />
            <button onClick={() => nav('/studio')}
              style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:DARK, background:GOLD, border:'none', padding:'16px 44px', cursor:'none', transition:'opacity 0.2s', flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              Try the Studio Free →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          VII-D-PRE. Start Your Own Design — public room designer CTA
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:DARK2, padding:'80px clamp(40px,8vw,120px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div className="rl">
            <div style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:GOLD, marginBottom:20 }}>No Account Needed · Completely Free</div>
            <h2 style={{ fontFamily:SF, fontSize:'clamp(34px,3.5vw,54px)', fontWeight:300, color:WHITE, lineHeight:1.1, margin:'0 0 20px' }}>
              Design your own room<br /><em style={{ color:GOLD, fontStyle:'italic' }}>in minutes.</em>
            </h2>
            <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:'rgba(255,255,255,0.45)', lineHeight:1.85, margin:'0 0 40px', maxWidth:440 }}>
              Pick a room type, choose your style, and drag furniture onto a 2D floor plan. Change wall colours, resize items, rotate furniture — then download your design as a PNG. Zero experience needed.
            </p>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <button onClick={() => nav('/my-design')}
                style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:DARK, background:GOLD, border:'none', padding:'16px 44px', cursor:'pointer', transition:'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                Start Designing Free →
              </button>
              <button onClick={() => nav('/portfolio')}
                style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', padding:'16px 32px', cursor:'pointer' }}>
                See Inspiration
              </button>
            </div>
          </div>
          <div className="rr" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { icon:'🛋', label:'Living Room', bg:'#1e3a5f' },
              { icon:'🛏', label:'Bedroom', bg:'#3b1f4e' },
              { icon:'🍳', label:'Kitchen', bg:'#3b2a0a' },
              { icon:'💼', label:'Home Office', bg:'#0f3226' },
            ].map(r => (
              <button key={r.label} onClick={() => nav('/my-design')}
                style={{ background:r.bg, border:'1px solid rgba(255,255,255,0.08)', padding:'28px 20px', cursor:'pointer', textAlign:'left', transition:'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.borderColor='rgba(196,149,106,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{r.icon}</div>
                <div style={{ fontFamily:SS, fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.75)', letterSpacing:'0.05em' }}>{r.label}</div>
                <div style={{ fontFamily:SS, fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:4 }}>Design free →</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          VII-D. FAQ — Common questions answered
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:CREAM, padding:'120px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div className="r" style={{ textAlign:'center', marginBottom:72 }}>
            <SectionLabel>FAQ</SectionLabel>
            <div style={{ width:36, height:1, background:GOLD, margin:'20px auto 36px' }} />
            <h2 style={{ fontFamily:SF, fontSize:'clamp(36px,4vw,60px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
              Questions? <em style={{ fontStyle:'italic', color:GOLD }}>We have answers.</em>
            </h2>
          </div>
          <FAQSection />
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
              ['Kitchen','https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=300&q=70'],
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
          X. CONTACT — Get in touch
      ══════════════════════════════════════════════════════════════════ */}
      <section id="contact" style={{ background:CREAM, padding:'120px clamp(40px,8vw,160px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 80px', alignItems:'start' }} className="col-sm">

            {/* Left */}
            <div className="rl">
              <SectionLabel>Get In Touch</SectionLabel>
              <div style={{ width:36, height:1, background:GOLD, margin:'20px 0 44px' }} />
              <h2 style={{ fontFamily:SF, fontSize:'clamp(36px,4vw,60px)', fontWeight:300, color:DARK, lineHeight:1.05 }}>
                Let's design<br /><em style={{ fontStyle:'italic', color:GOLD }}>your space.</em>
              </h2>
              <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:MUTED, lineHeight:1.95, marginTop:28, maxWidth:380 }}>
                Have a project in mind? Our team is ready to help you create the space you've always imagined — free consultation, zero commitment.
              </p>
              <div style={{ marginTop:52 }}>
                {[
                  ['✉','Email','contactus@divinemercyitsol.com'],
                  ['⊕','Location','Hyderabad, Telangana, India'],
                ].map(([icon,label,value]) => (
                  <div key={label} style={{ display:'flex', gap:20, alignItems:'flex-start', marginBottom:28, paddingBottom:28, borderBottom:`1px solid rgba(0,0,0,0.07)` }}>
                    <span style={{ fontFamily:SS, fontSize:18, color:GOLD, width:24, flexShrink:0, marginTop:2 }}>{icon}</span>
                    <div>
                      <div style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:MUTED, marginBottom:4 }}>{label}</div>
                      <div style={{ fontFamily:SF, fontSize:18, fontWeight:300, color:DARK }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="rr">
              <ContactForm />
            </div>
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
              { title:'Company', links:[['Portfolio','/portfolio'],['Blog','/blog'],['Contact','/#contact'],['About','/about']] },
              { title:'Legal', links:[['Privacy Policy','/privacy-policy'],['Terms of Use','/terms-of-service'],['Cookie Policy','/privacy-policy']] },
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
              &copy; 2026 El Shaddai Interior Design. All rights reserved.
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
