/**
 * El Shaddai — Ultra-Premium Homepage
 * Design: Dark Luxury · Cinematic · Editorial · International Standard
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'

/* ── Tokens ──────────────────────────────────────────────────────────────── */
const G   = '#c9a227'
const GL  = '#e8c84e'
const BG  = '#08070a'
const BG2 = '#0d0c10'
const W   = '#ffffff'
const CR  = '#faf8f3'
const MU  = 'rgba(255,255,255,0.45)'
const SF  = "'Cormorant Garamond',Georgia,serif"
const SS  = "'DM Sans',system-ui,sans-serif"
const SY  = "'Syne',system-ui,sans-serif"

/* ── Data ────────────────────────────────────────────────────────────────── */
const HERO_IMGS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=90',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1920&q=90',
  'https://images.unsplash.com/photo-1560440021-33f9b867899d?auto=format&fit=crop&w=1920&q=90',
]

const STATS = [
  { num: 12, suffix: '+', label: 'Years of Excellence', sub: 'Designing spaces since 2012' },
  { num: 340, suffix: '+', label: 'Projects Completed', sub: 'Across South India' },
  { num: 98,  suffix: '%', label: 'Client Satisfaction', sub: 'Post-handover surveys' },
  { num: 50,  suffix: '+', label: 'Luxury Brands', sub: 'Vendor partnerships' },
]

const SERVICES = [
  { icon: '⬡', title: 'Interior Design',      desc: 'Full-spectrum design from concept to completion — residential, commercial, hospitality.', tag: '01' },
  { icon: '⬡', title: '3D Visualisation',     desc: 'Photorealistic renders that let you experience every space before a single wall is built.', tag: '02' },
  { icon: '⬡', title: 'Space Planning',       desc: 'Intelligent layouts that maximise flow, light, and purpose in any footprint.', tag: '03' },
  { icon: '⬡', title: 'Furniture Curation',   desc: 'Handpicked pieces from artisan workshops and global luxury vendors.', tag: '04' },
  { icon: '⬡', title: 'Site Execution',       desc: 'Precision construction oversight — on time, on budget, zero compromise.', tag: '05' },
  { icon: '⬡', title: 'Smart Home Integration', desc: 'Seamless automation — lighting, climate, security, entertainment.', tag: '06' },
  { icon: '⬡', title: 'Material Sourcing',    desc: 'Premium Italian marble, teak, brushed metals — curated for every project.', tag: '07' },
  { icon: '⬡', title: 'Project Management',   desc: 'End-to-end coordination: architects, contractors, vendors, timelines.', tag: '08' },
  { icon: '⬡', title: 'Vastu Consultation',   desc: 'Harmonising modern design with Vastu principles for holistic living.', tag: '09' },
]

const ROOMS = [
  {
    label: 'Living Room', style: 'Contemporary Luxe', n: '01',
    desc: 'A living room should feel curated and effortless — where every element has intention, yet nothing feels forced. We design spaces that breathe.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=90',
    tag: 'Residential',
  },
  {
    label: 'Master Bedroom', style: 'Serene Minimalism', n: '02',
    desc: 'The bedroom is not merely a place to sleep, but a sanctuary for restoration. Every surface, fabric, and light placed with intention.',
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1000&q=90',
    tag: 'Residential',
  },
  {
    label: 'Kitchen & Dining', style: 'Modern Warmth', n: '03',
    desc: 'Where form meets function in perfect balance. A kitchen that inspires cooking and a dining space that invites conversation, night after night.',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=90',
    tag: 'Residential',
  },
]

const GALLERY = [
  { img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=700&q=85', h:'480px', label:'Master Suite — Chennai' },
  { img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=85', h:'320px', label:'Living Space — Bangalore' },
  { img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=85', h:'400px', label:'Pooja Room — Kochi' },
  { img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=700&q=85', h:'320px', label:'Spa Bathroom — Hyderabad' },
  { img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=700&q=85', h:'360px', label:'Modular Kitchen — Mumbai' },
  { img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=700&q=85', h:'440px', label:'Dining Area — Chennai' },
]

const PROCESS = [
  { n:'01', title:'Discovery',     desc:'We listen deeply — your lifestyle, aspirations, constraints. A thorough brief shapes everything that follows.' },
  { n:'02', title:'Concept',       desc:'Mood boards, space concepts, material palettes — three distinct directions for you to explore and refine.' },
  { n:'03', title:'Design',        desc:'Full working drawings, 3D visualisations, material schedules. Nothing is left to imagination.' },
  { n:'04', title:'Procurement',   desc:'Every item sourced, every vendor briefed. We manage quality from factory to site.' },
  { n:'05', title:'Execution',     desc:'Daily site management, weekly walkthroughs, zero-compromise craftsmanship.' },
  { n:'06', title:'Handover',      desc:'White-glove delivery — snag-free, styled, photographed. Your dream, realised.' },
]

const TESTIMONIALS = [
  { quote: 'El Shaddai transformed our 3BHK into something we would see in a European architecture magazine. Every detail was considered. The handover was tearfully beautiful.', name: 'Deepa & Arun Nair', loc: 'Boat Club Road, Chennai', proj: 'Luxury Residence — ₹58L' },
  { quote: 'Our office was designed and executed in 11 weeks without a single delay. The client feedback has been outstanding — people walk in and stop talking mid-sentence.', name: 'Vinay Kapoor', loc: 'Indiranagar, Bangalore', proj: 'Corporate Fitout — ₹32L' },
  { quote: 'I gave them a brief on a Tuesday. By Friday they had a 3D walkthrough that made me emotional. The Vastu integration was invisible yet profound.', name: 'Anila Menon', loc: 'Thrissur, Kerala', proj: 'Villa Interiors — ₹1.2Cr' },
]

const BEFORE_IMG = 'https://images.unsplash.com/photo-1560440021-33f9b867899d?auto=format&fit=crop&w=1200&q=90'
const AFTER_IMG  = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=90'

const TICKER_WORDS = ['Interior Design','Space Planning','3D Rendering','Luxury Furniture','Vastu Harmony','Smart Homes','Italian Marble','Bespoke Carpentry','Material Curation','Lighting Design','Site Execution','Project Management']

/* ══════════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════════ */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale,.reveal-fast')
    if (!els.length) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
    }, { threshold: 0.08, rootMargin: '0px 0px 0px 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let frame = 0
    const steps = 60
    const inc = target / steps
    const timer = setInterval(() => {
      frame++
      setCount(Math.min(Math.round(inc * frame), target))
      if (frame >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target, duration, start])
  return count
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

/* Custom Cursor */
function Cursor() {
  const dot  = useRef(null)
  const ring = useRef(null)
  useEffect(() => {
    let rx = 0, ry = 0, cx = 0, cy = 0, raf
    const onMove = e => {
      cx = e.clientX; cy = e.clientY
      if (dot.current) { dot.current.style.left = cx+'px'; dot.current.style.top = cy+'px' }
    }
    const loop = () => {
      rx += (cx - rx) * 0.1; ry += (cy - ry) * 0.1
      if (ring.current) { ring.current.style.left = rx+'px'; ring.current.style.top = ry+'px' }
      raf = requestAnimationFrame(loop)
    }
    const on  = () => document.body.classList.add('cursor-hover')
    const off = () => document.body.classList.remove('cursor-hover')
    window.addEventListener('mousemove', onMove)
    document.querySelectorAll('a,button,[role=button]').forEach(el => {
      el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off)
    })
    raf = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div style={{ pointerEvents:'none', position:'fixed', top:0, left:0, zIndex:999999, mixBlendMode:'difference' }}>
      <div ref={dot} style={{ position:'absolute', width:6, height:6, background:W, borderRadius:'50%', transform:'translate(-50%,-50%)', transition:'width 0.2s,height 0.2s', pointerEvents:'none' }} />
      <div ref={ring} style={{ position:'absolute', width:36, height:36, border:'1px solid rgba(255,255,255,0.5)', borderRadius:'50%', transform:'translate(-50%,-50%)', transition:'all 0.12s', pointerEvents:'none' }} />
    </div>
  )
}

/* Page Loader */
function Loader({ done }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    let v = 0
    const t = setInterval(() => {
      v += Math.random() * 18 + 4
      if (v >= 100) { v = 100; clearInterval(t) }
      setPct(Math.round(v))
    }, 60)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, background:BG, zIndex:99998,
      display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column',
      opacity: done ? 0 : 1, pointerEvents: done ? 'none' : 'all',
      transition:'opacity 0.7s ease 0.2s',
    }}>
      {/* Orbs */}
      <div style={{ position:'absolute', top:'20%', left:'10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,162,39,0.15),transparent 70%)', filter:'blur(40px)', animation:'orbFloat1 12s ease-in-out infinite' }} />
      <div style={{ position:'absolute', bottom:'10%', right:'5%',  width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(100,60,200,0.08),transparent 70%)', filter:'blur(60px)', animation:'orbFloat2 16s ease-in-out infinite' }} />

      <div style={{ textAlign:'center', zIndex:2 }}>
        <p style={{ fontFamily:SY, fontSize:9, letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(201,162,39,0.7)', marginBottom:40 }}>El Shaddai Interiors</p>
        <div style={{ fontFamily:SF, fontSize:'clamp(48px,8vw,120px)', fontWeight:300, color:W, lineHeight:1, marginBottom:48, letterSpacing:'-0.02em' }}>
          {pct}<span style={{ fontSize:'0.4em', color:G }}>%</span>
        </div>
        <div style={{ width:200, height:1, background:'rgba(255,255,255,0.08)', margin:'0 auto', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg,${G},${GL})`, transform:`scaleX(${pct/100})`, transformOrigin:'left', transition:'transform 0.1s' }} />
        </div>
        <p style={{ fontFamily:SS, fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginTop:20 }}>Curating Excellence</p>
      </div>
    </div>
  )
}

/* Orb Background */
function Orbs({ style }) {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', ...style }}>
      <div className="orb orb-1" style={{ width:600, height:600, top:'10%', left:'-5%', background:'radial-gradient(circle,rgba(201,162,39,0.12),transparent 70%)' }} />
      <div className="orb orb-2" style={{ width:800, height:800, bottom:'-10%', right:'-10%', background:'radial-gradient(circle,rgba(80,40,160,0.08),transparent 70%)' }} />
      <div className="orb orb-3" style={{ width:400, height:400, top:'40%', right:'20%', background:'radial-gradient(circle,rgba(201,162,39,0.06),transparent 70%)' }} />
    </div>
  )
}

/* Stat Card with animated counter */
function StatCard({ stat, index }) {
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  const count = useCounter(stat.num, 1800, started)

  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect() } }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${index * 120}ms` }}>
      <div style={{ padding:'40px 32px', borderTop:`1px solid rgba(255,255,255,0.08)`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:1, background:`linear-gradient(90deg,${G},transparent)`, opacity: started ? 1 : 0, transition:'opacity 0.6s' }} />
        <div style={{ fontFamily:SF, fontSize:'clamp(52px,5vw,80px)', fontWeight:300, color:W, lineHeight:1, letterSpacing:'-0.02em', marginBottom:8 }}>
          {count}<span style={{ color:G, fontSize:'0.5em' }}>{stat.suffix}</span>
        </div>
        <p style={{ fontFamily:SY, fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:W, margin:'0 0 6px' }}>{stat.label}</p>
        <p style={{ fontFamily:SS, fontSize:12, color:'rgba(255,255,255,0.4)', margin:0 }}>{stat.sub}</p>
      </div>
    </div>
  )
}

/* Service Card with 3D tilt */
function ServiceCard({ svc, index }) {
  const ref = useRef(null)
  const onMove = e => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 14
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -14
    ref.current.style.setProperty('--rx', y+'deg')
    ref.current.style.setProperty('--ry', x+'deg')
    ref.current.style.boxShadow = `${-x*1.5}px ${y*1.5}px 40px rgba(201,162,39,0.12)`
  }
  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.setProperty('--rx','0deg')
    ref.current.style.setProperty('--ry','0deg')
    ref.current.style.boxShadow = 'none'
  }
  return (
    <div ref={ref}
      onMouseMove={onMove} onMouseLeave={onLeave}
      className="card-tilt reveal"
      style={{
        transitionDelay:`${index*80}ms`,
        padding:'36px 28px',
        background:'rgba(255,255,255,0.03)',
        border:'1px solid rgba(255,255,255,0.06)',
        cursor:'default',
        position:'relative', overflow:'hidden',
        transition:'border-color 0.4s,background 0.4s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,162,39,0.3)'; e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { onLeave(e); e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.background='rgba(255,255,255,0.03)' }}
    >
      {/* Corner number */}
      <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.3em', color:'rgba(201,162,39,0.4)', position:'absolute', top:24, right:24 }}>{svc.tag}</span>
      {/* Gold accent top */}
      <div style={{ width:32, height:2, background:`linear-gradient(90deg,${G},${GL})`, marginBottom:24 }} />
      <p style={{ fontFamily:SF, fontSize:22, fontWeight:300, color:W, margin:'0 0 12px', lineHeight:1.2 }}>{svc.title}</p>
      <p style={{ fontFamily:SS, fontSize:12, lineHeight:1.8, color:'rgba(255,255,255,0.45)', margin:0 }}>{svc.desc}</p>
      {/* Hover glow */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 100%,rgba(201,162,39,0.05),transparent 70%)', pointerEvents:'none' }} />
    </div>
  )
}

/* Before / After slider */
function BeforeAfter() {
  const [pos, setPos] = useState(50)
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
    window.addEventListener('touchmove', mv, { passive:true })
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
      style={{ position:'relative', width:'100%', height:'clamp(320px,50vw,600px)', overflow:'hidden', cursor:'ew-resize', userSelect:'none' }}>
      <img src={BEFORE_IMG} alt="Before" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      <div style={{ position:'absolute', inset:0, width:`${pos}%`, overflow:'hidden' }}>
        <img src={AFTER_IMG}  alt="After" style={{ position:'absolute', inset:0, width:`${10000/pos}%`, maxWidth:'none', height:'100%', objectFit:'cover' }} />
      </div>
      {/* Divider */}
      <div style={{ position:'absolute', top:0, bottom:0, left:`${pos}%`, width:2, background:'linear-gradient(180deg,transparent,rgba(201,162,39,0.8),transparent)', transform:'translateX(-50%)', zIndex:10 }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:52, height:52, borderRadius:'50%', background:'rgba(10,8,5,0.9)', border:`1px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', gap:8, backdropFilter:'blur(8px)', boxShadow:`0 0 24px rgba(201,162,39,0.3)` }}>
          <span style={{ color:G, fontSize:12 }}>◀</span>
          <span style={{ color:G, fontSize:12 }}>▶</span>
        </div>
      </div>
      <span style={{ position:'absolute', top:20, left:20, fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', background:'rgba(0,0,0,0.5)', padding:'6px 14px', backdropFilter:'blur(8px)' }}>Before</span>
      <span style={{ position:'absolute', top:20, right:20, fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:BG, background:G, padding:'6px 14px' }}>After</span>
    </div>
  )
}

/* Contact Form */
function ContactForm() {
  const [form, setForm]   = useState({ name:'', email:'', phone:'', message:'', city:'Chennai', service:'Interior Design' })
  const [status, setStatus] = useState('idle')
  const up = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const inputStyle = {
    width:'100%', fontFamily:SS, fontSize:13,
    border:'1px solid rgba(255,255,255,0.1)',
    padding:'14px 18px', background:'rgba(255,255,255,0.04)',
    outline:'none', color:W, boxSizing:'border-box',
    transition:'border-color 0.2s', borderRadius:2,
  }
  const labelStyle = { fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(201,162,39,0.8)', display:'block', marginBottom:8 }
  const focusStyle = { borderColor: G }
  const blurStyle  = { borderColor: 'rgba(255,255,255,0.1)' }

  async function submit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method:'POST',
        headers:{'Content-Type':'application/json', Accept:'application/json'},
        body: JSON.stringify({
          access_key: '20e5a729-9a98-4234-b88a-470634b6d474',
          subject: `New Enquiry — ${form.service} — ${form.name} — El Shaddai`,
          from_name: 'El Shaddai Website',
          reply_to: form.email,
          ...form,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setStatus('sent')
    } catch { setStatus('error') }
  }

  if (status === 'sent') return (
    <div style={{ textAlign:'center', padding:'80px 40px' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:`rgba(201,162,39,0.15)`, border:`1px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', animation:'glowPulse 2s ease-in-out 3' }}>
        <span style={{ color:G, fontSize:28 }}>✓</span>
      </div>
      <h3 style={{ fontFamily:SF, fontSize:36, fontWeight:300, color:W, margin:'0 0 14px' }}>Message Received</h3>
      <p style={{ fontFamily:SS, fontSize:13, color:MU, lineHeight:1.9, maxWidth:340, margin:'0 auto' }}>
        Thank you for reaching out. Our design team will contact you within 24 hours.
      </p>
    </div>
  )

  return (
    <form onSubmit={submit}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        {[['name','Full Name','text','Your name'],['email','Email Address','email','your@email.com']].map(([k,l,t,p]) => (
          <div key={k}>
            <label style={labelStyle}>{l}</label>
            <input type={t} placeholder={p} value={form[k]} onChange={up(k)} required
              style={inputStyle} onFocus={e=>Object.assign(e.target.style,focusStyle)} onBlur={e=>Object.assign(e.target.style,blurStyle)} />
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={up('phone')}
            style={inputStyle} onFocus={e=>Object.assign(e.target.style,focusStyle)} onBlur={e=>Object.assign(e.target.style,blurStyle)} />
        </div>
        <div>
          <label style={labelStyle}>Service</label>
          <select value={form.service} onChange={up('service')} style={{ ...inputStyle, cursor:'pointer', appearance:'none' }}>
            {['Interior Design','Space Planning','3D Visualisation','Furniture Curation','Site Execution','Smart Home','Vastu Consultation'].map(s => (
              <option key={s} value={s} style={{ background:'#0d0c10' }}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom:24 }}>
        <label style={labelStyle}>Tell Us About Your Project</label>
        <textarea rows={5} placeholder="Describe your space, style preferences, budget range, timeline..." value={form.message} onChange={up('message')} required
          style={{ ...inputStyle, resize:'vertical', fontFamily:SS }} onFocus={e=>Object.assign(e.target.style,focusStyle)} onBlur={e=>Object.assign(e.target.style,blurStyle)} />
      </div>
      <button type="submit" disabled={status==='sending'} style={{
        width:'100%', padding:'18px 0', background:`linear-gradient(135deg,${G},${GL})`,
        border:'none', color:'#0a0805', fontFamily:SY, fontSize:11, fontWeight:700,
        letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer',
        transition:'all 0.3s', opacity: status==='sending' ? 0.7 : 1,
        boxShadow:'0 8px 32px rgba(201,162,39,0.3)',
      }}
        onMouseEnter={e=>{ e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow=`0 16px 48px rgba(201,162,39,0.4)` }}
        onMouseLeave={e=>{ e.target.style.transform='translateY(0)'; e.target.style.boxShadow=`0 8px 32px rgba(201,162,39,0.3)` }}
      >
        {status==='sending' ? 'Sending…' : 'Start Your Project →'}
      </button>
      {status==='error' && <p style={{ fontFamily:SS, fontSize:12, color:'#ef4444', textAlign:'center', marginTop:12 }}>Something went wrong. Please try again.</p>}
    </form>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function HomestylerClone() {
  const nav = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [testIdx, setTestIdx] = useState(0)
  useReveal()

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2400)
    return () => clearTimeout(t)
  }, [])

  // Auto-advance testimonials
  useEffect(() => {
    const t = setInterval(() => setTestIdx(i => (i + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(t)
  }, [])

  const btnHover = e => {
    e.currentTarget.style.transform = 'translateY(-3px)'
    e.currentTarget.style.boxShadow = '0 20px 60px rgba(201,162,39,0.35)'
  }
  const btnLeave = e => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div style={{ background:BG, color:W, minHeight:'100vh', overflowX:'hidden' }}>
      <Loader done={loaded} />
      <Cursor />
      <div className="scan-line" />

      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO — Full Cinematic
      ══════════════════════════════════════════════════════ */}
      <section className="letterbox cinematic-vignette" style={{ position:'relative', height:'100svh', minHeight:600, overflow:'hidden' }}>
        {/* Background images cycling */}
        {HERO_IMGS.map((img,i) => (
          <img key={i} src={img} alt="" className="hero-img" style={{ filter:'brightness(0.35) saturate(0.8)' }} />
        ))}

        {/* Gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,rgba(8,7,10,0.9) 0%,rgba(8,7,10,0.4) 60%,rgba(8,7,10,0.8) 100%)`, zIndex:1, pointerEvents:'none' }} />

        {/* Animated orbs */}
        <Orbs style={{ zIndex:1 }} />

        {/* Grid lines decoration */}
        <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', backgroundImage:`linear-gradient(rgba(201,162,39,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,162,39,0.04) 1px,transparent 1px)`, backgroundSize:'80px 80px' }} />

        {/* Content */}
        <div style={{ position:'relative', zIndex:5, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 clamp(24px,6vw,120px)' }}>
          {/* Label */}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32, animation:'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 2.6s both' }}>
            <div style={{ width:32, height:1, background:G }} />
            <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>South India's Premier Design Studio</span>
          </div>

          {/* Main headline */}
          <h1 className="cin-appear" style={{ fontFamily:SF, fontWeight:300, fontSize:'clamp(48px,7.5vw,120px)', color:W, lineHeight:0.95, letterSpacing:'-0.02em', maxWidth:'14ch', marginBottom:0 }}>
            Spaces That<br />
            <em style={{ fontStyle:'italic', color:G }}>Tell Your</em><br />
            Story
          </h1>

          <div style={{ width:80, height:1, background:`linear-gradient(90deg,${G},transparent)`, margin:'32px 0', animation:'drawLine 1.2s cubic-bezier(0.22,1,0.36,1) 3.5s both' }} />

          {/* Subheadline */}
          <p style={{ fontFamily:SS, fontSize:'clamp(13px,1.5vw,18px)', fontWeight:300, color:'rgba(255,255,255,0.6)', maxWidth:'42ch', lineHeight:1.8, marginBottom:48, animation:'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 3.8s both' }}>
            We design, curate, and build interiors that are unmistakably yours — from a single room to an entire estate.
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', animation:'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 4s both' }}>
            <button onClick={() => nav('/studio')} onMouseEnter={btnHover} onMouseLeave={btnLeave}
              style={{ padding:'17px 36px', background:`linear-gradient(135deg,${G},${GL})`, border:'none', color:'#0a0805', fontFamily:SY, fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s' }}>
              Explore Studio →
            </button>
            <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior:'smooth' })} onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.1)' }} onMouseLeave={e=>{ e.currentTarget.style.background='transparent' }}
              style={{ padding:'17px 36px', background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:W, fontFamily:SY, fontSize:10, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s', backdropFilter:'blur(8px)' }}>
              Start a Project
            </button>
          </div>

          {/* Bottom info bar */}
          <div style={{ position:'absolute', bottom:'clamp(48px,7vh,80px)', left:'clamp(24px,6vw,120px)', right:'clamp(24px,6vw,120px)', display:'flex', justifyContent:'space-between', alignItems:'flex-end', animation:'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 4.2s both' }}>
            <div style={{ display:'flex', gap:24 }}>
              {['Chennai','Bangalore','Kochi','Mumbai'].map(c => (
                <span key={c} style={{ fontFamily:SS, fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'0.15em' }}>{c}</span>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12 }}>
              <div style={{ display:'flex', gap:8 }}>
                {HERO_IMGS.map((_,i) => (
                  <div key={i} className="hero-dot" style={{ width:6, height:6, borderRadius:'50%' }} />
                ))}
              </div>
              <div style={{ width:160, height:1, background:'rgba(255,255,255,0.1)', position:'relative', overflow:'hidden' }}>
                <div className="hero-progress" style={{ position:'absolute', top:0, left:0, height:'100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:6, display:'flex', flexDirection:'column', alignItems:'center', gap:8, animation:'fadeIn 1s ease 5s both' }}>
          <span style={{ fontFamily:SS, fontSize:9, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Scroll</span>
          <div style={{ width:1, height:48, background:`linear-gradient(180deg,rgba(255,255,255,0.3),transparent)`, animation:'floatY 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TICKER MARQUEE
      ══════════════════════════════════════════════════════ */}
      <div style={{ background:`linear-gradient(90deg,${G},${GL})`, overflow:'hidden', padding:'14px 0', position:'relative', zIndex:10 }}>
        <div className="ticker-inner" style={{ gap:0 }}>
          {[...TICKER_WORDS,...TICKER_WORDS].map((w,i) => (
            <span key={i} style={{ fontFamily:SY, fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'#0a0805', padding:'0 32px', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:32 }}>
              {w} <span style={{ opacity:0.4 }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ABOUT / INTRO
      ══════════════════════════════════════════════════════ */}
      <section style={{ background:BG, padding:'120px clamp(24px,6vw,120px)', position:'relative', overflow:'hidden' }}>
        <Orbs />
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center', position:'relative', zIndex:2 }}>
          <div>
            <div className="reveal" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
              <div style={{ width:24, height:1, background:G }} />
              <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>About Us</span>
            </div>
            <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(36px,4.5vw,70px)', fontWeight:300, color:W, lineHeight:1.0, letterSpacing:'-0.02em', marginBottom:28 }}>
              Designed with<br /><em style={{ fontStyle:'italic', color:G }}>Purpose.</em><br />Built with Soul.
            </h2>
            <p className="reveal" style={{ fontFamily:SS, fontSize:14, lineHeight:2, color:'rgba(255,255,255,0.55)', maxWidth:'46ch', marginBottom:16 }}>
              Founded in Chennai, El Shaddai Interiors has been shaping spaces for over a decade — from intimate apartments to sprawling villas, from boutique hotels to corporate campuses.
            </p>
            <p className="reveal" style={{ fontFamily:SS, fontSize:14, lineHeight:2, color:'rgba(255,255,255,0.55)', maxWidth:'46ch', marginBottom:40 }}>
              Our philosophy is simple: great interiors are not decorated — they are designed. Every project begins with a deep understanding of the people who will live and work within it.
            </p>
            <div className="reveal" style={{ display:'flex', gap:16 }}>
              <button onClick={() => nav('/about')} onMouseEnter={btnHover} onMouseLeave={btnLeave}
                style={{ padding:'14px 32px', background:`linear-gradient(135deg,${G},${GL})`, border:'none', color:'#0a0805', fontFamily:SY, fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s' }}>
                Our Story →
              </button>
              <button onClick={() => nav('/portfolio')} onMouseEnter={e=>{ e.currentTarget.style.borderColor=G }} onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.2)' }}
                style={{ padding:'14px 32px', background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:W, fontFamily:SY, fontSize:10, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s' }}>
                View Work
              </button>
            </div>
          </div>

          {/* Image stack */}
          <div className="reveal-right" style={{ position:'relative', height:520 }}>
            <div className="img-zoom" style={{ position:'absolute', top:0, right:0, width:'75%', height:380, border:`1px solid rgba(201,162,39,0.2)` }}>
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=90" alt="Interior" className="img-premium" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'saturate(0.85) contrast(1.05)' }} />
            </div>
            <div className="img-zoom" style={{ position:'absolute', bottom:0, left:0, width:'55%', height:280, border:`1px solid rgba(201,162,39,0.2)` }}>
              <img src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=500&q=90" alt="Bedroom" className="img-premium" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'saturate(0.85) contrast(1.05)' }} />
            </div>
            {/* Gold badge */}
            <div style={{ position:'absolute', bottom:40, right:20, width:110, height:110, borderRadius:'50%', background:`conic-gradient(from 0deg,${G},${GL},${G})`, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', animation:'floatYSlow 8s ease-in-out infinite', zIndex:5 }}>
              <span style={{ fontFamily:SF, fontSize:24, fontWeight:700, color:'#0a0805', lineHeight:1 }}>12</span>
              <span style={{ fontFamily:SY, fontSize:8, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#0a0805' }}>Years</span>
            </div>
            {/* Year badge */}
            <div style={{ position:'absolute', top:20, left:20, padding:'8px 18px', background:'rgba(10,8,5,0.85)', border:`1px solid rgba(201,162,39,0.3)`, backdropFilter:'blur(8px)' }}>
              <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:G }}>Est. 2012 · Chennai</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section style={{ background:'#0d0b08', position:'relative', overflow:'hidden', padding:'80px clamp(24px,6vw,120px)' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,rgba(255,255,255,0.015) 0px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,rgba(255,255,255,0.015) 0px,transparent 1px,transparent 80px)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, position:'relative', zIndex:2 }}>
          {STATS.map((s,i) => <StatCard key={i} stat={s} index={i} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ROOMS — Alternating Full-Width
      ══════════════════════════════════════════════════════ */}
      <section style={{ background:BG2, padding:'120px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(24px,6vw,120px)', marginBottom:80 }}>
          <div className="reveal" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
            <div style={{ width:24, height:1, background:G }} />
            <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>Signature Spaces</span>
          </div>
          <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(36px,4.5vw,72px)', fontWeight:300, color:W, lineHeight:1.0, letterSpacing:'-0.02em' }}>
            Where Design<br /><em style={{ fontStyle:'italic', color:G }}>Meets Life</em>
          </h2>
        </div>

        {ROOMS.map((room, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns: i%2===0 ? '55% 45%' : '45% 55%', minHeight:560, overflow:'hidden' }}>
            {i%2===1 && (
              <div style={{ padding:'clamp(48px,6vw,100px) clamp(24px,6vw,100px)', display:'flex', flexDirection:'column', justifyContent:'center', background: i===1 ? '#0a0905' : BG2 }}>
                <RoomText room={room} nav={nav} G={G} GL={GL} SF={SF} SS={SS} SY={SY} />
              </div>
            )}
            <div className={`img-zoom reveal-${i%2===0?'left':'right'}`} style={{ position:'relative', overflow:'hidden' }}>
              <img src={room.img} alt={room.label} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'saturate(0.85) contrast(1.08) brightness(0.9)' }} />
              <div style={{ position:'absolute', inset:0, background:`linear-gradient(${i%2===0?'270':'90'}deg,rgba(8,7,10,0.4),transparent)` }} />
              <div style={{ position:'absolute', bottom:28, [i%2===0?'right':'left']:28, padding:'8px 18px', background:'rgba(10,8,5,0.75)', backdropFilter:'blur(8px)', border:`1px solid rgba(201,162,39,0.25)` }}>
                <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:G }}>{room.tag}</span>
              </div>
            </div>
            {i%2===0 && (
              <div style={{ padding:'clamp(48px,6vw,100px) clamp(24px,6vw,100px)', display:'flex', flexDirection:'column', justifyContent:'center', background: BG2 }}>
                <RoomText room={room} nav={nav} G={G} GL={GL} SF={SF} SS={SS} SY={SY} />
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════
          SERVICES GRID
      ══════════════════════════════════════════════════════ */}
      <section style={{ background:BG, padding:'120px clamp(24px,6vw,120px)', position:'relative', overflow:'hidden' }}>
        <Orbs />
        <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:64, flexWrap:'wrap', gap:24 }}>
            <div>
              <div className="reveal" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                <div style={{ width:24, height:1, background:G }} />
                <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>What We Do</span>
              </div>
              <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(36px,4.5vw,72px)', fontWeight:300, color:W, lineHeight:1.0, letterSpacing:'-0.02em' }}>
                Nine Ways We<br /><em style={{ fontStyle:'italic', color:G }}>Transform Spaces</em>
              </h2>
            </div>
            <button className="reveal" onClick={() => nav('/studio')} onMouseEnter={btnHover} onMouseLeave={btnLeave}
              style={{ padding:'14px 32px', background:'transparent', border:`1px solid rgba(201,162,39,0.4)`, color:G, fontFamily:SY, fontSize:10, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s', whiteSpace:'nowrap', alignSelf:'flex-end' }}>
              All Services →
            </button>
          </div>

          <div className="stagger-children" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(255,255,255,0.04)' }}>
            {SERVICES.map((s,i) => <ServiceCard key={i} svc={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          GALLERY — Bento Grid
      ══════════════════════════════════════════════════════ */}
      <section style={{ background:'#0a0905', padding:'120px clamp(24px,6vw,120px)', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:60, flexWrap:'wrap', gap:20 }}>
            <div>
              <div className="reveal" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                <div style={{ width:24, height:1, background:G }} />
                <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>Portfolio</span>
              </div>
              <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(36px,4.5vw,72px)', fontWeight:300, color:W, lineHeight:1.0, letterSpacing:'-0.02em' }}>
                Selected<br /><em style={{ fontStyle:'italic', color:G }}>Works</em>
              </h2>
            </div>
            <button className="reveal" onClick={() => nav('/gallery')} onMouseEnter={btnHover} onMouseLeave={btnLeave}
              style={{ padding:'14px 32px', background:`linear-gradient(135deg,${G},${GL})`, border:'none', color:'#0a0805', fontFamily:SY, fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s' }}>
              Full Gallery →
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'auto auto', gap:12 }}>
            {GALLERY.map((g,i) => (
              <div key={i} className={`img-zoom reveal`} style={{ transitionDelay:`${i*100}ms`, height:g.h, position:'relative', overflow:'hidden', cursor:'pointer', gridRow: i===0 || i===2 ? 'span 1' : 'span 1' }}
                onClick={() => nav('/gallery')}>
                <img src={g.img} alt={g.label} className="img-cinematic" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(8,7,10,0.7) 0%,transparent 50%)', opacity:0, transition:'opacity 0.4s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.opacity=1 }}
                  onMouseLeave={e=>{ e.currentTarget.style.opacity=0 }} />
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 20px', transform:'translateY(100%)', transition:'transform 0.4s cubic-bezier(0.22,1,0.36,1)', background:'linear-gradient(0deg,rgba(8,7,10,0.9),transparent)' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(0)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(100%)' }}>
                  <p style={{ fontFamily:SS, fontSize:11, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:G, margin:'0 0 4px' }}>{g.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery hover fix — use CSS instead */}
      <style>{`
        .gallery-item:hover .gallery-overlay { opacity:1!important }
        .gallery-item:hover .gallery-label   { transform:translateY(0)!important }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          PROCESS
      ══════════════════════════════════════════════════════ */}
      <section style={{ background:BG, padding:'120px clamp(24px,6vw,120px)', position:'relative', overflow:'hidden' }}>
        <Orbs />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ textAlign:'center', marginBottom:80 }}>
            <div className="reveal" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:24, height:1, background:G }} />
              <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>How We Work</span>
              <div style={{ width:24, height:1, background:G }} />
            </div>
            <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(36px,4.5vw,72px)', fontWeight:300, color:W, lineHeight:1.0, letterSpacing:'-0.02em' }}>
              Our <em style={{ fontStyle:'italic', color:G }}>Six-Step</em> Process
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:40 }}>
            {PROCESS.map((p,i) => (
              <div key={i} className="reveal" style={{ transitionDelay:`${i*100}ms`, padding:'0', position:'relative' }}>
                {/* Connector line */}
                {i % 3 !== 2 && (
                  <div style={{ position:'absolute', top:24, left:'calc(100% - 20px)', width:'calc(100% - 60px)', height:1, background:`linear-gradient(90deg,${G},rgba(201,162,39,0.1))`, zIndex:0, display:'none' }} />
                )}
                <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20 }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:`rgba(201,162,39,0.1)`, border:`1px solid rgba(201,162,39,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:SY, fontSize:11, fontWeight:700, color:G }}>{p.n}</span>
                  </div>
                  <div style={{ flex:1, height:1, background:`linear-gradient(90deg,rgba(201,162,39,0.3),transparent)` }} />
                </div>
                <h3 style={{ fontFamily:SF, fontSize:26, fontWeight:300, color:W, margin:'0 0 14px', letterSpacing:'-0.01em' }}>{p.title}</h3>
                <p style={{ fontFamily:SS, fontSize:13, lineHeight:1.9, color:'rgba(255,255,255,0.45)', margin:0 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ textAlign:'center', marginTop:72 }}>
            <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior:'smooth' })} onMouseEnter={btnHover} onMouseLeave={btnLeave}
              style={{ padding:'18px 48px', background:`linear-gradient(135deg,${G},${GL})`, border:'none', color:'#0a0805', fontFamily:SY, fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s', boxShadow:`0 8px 32px rgba(201,162,39,0.25)` }}>
              Start Your Journey →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section style={{ background:'linear-gradient(135deg,#0d0b08 0%,#12100a 100%)', padding:'120px clamp(24px,6vw,120px)', position:'relative', overflow:'hidden' }}>
        <Orbs />
        {/* Large quote mark */}
        <div style={{ position:'absolute', top:60, left:'50%', transform:'translateX(-50%)', fontFamily:SF, fontSize:'32vw', color:'rgba(201,162,39,0.03)', lineHeight:1, userSelect:'none', pointerEvents:'none', zIndex:0 }}>"</div>

        <div style={{ maxWidth:860, margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 }}>
          <div className="reveal" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:20 }}>
            <div style={{ width:24, height:1, background:G }} />
            <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>Client Stories</span>
            <div style={{ width:24, height:1, background:G }} />
          </div>
          <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(30px,4vw,56px)', fontWeight:300, color:W, lineHeight:1.05, letterSpacing:'-0.01em', marginBottom:64 }}>
            What Our Clients Say
          </h2>

          <div style={{ position:'relative', minHeight:280 }}>
            {TESTIMONIALS.map((t,i) => (
              <div key={i} style={{
                position: i===0?'relative':'absolute', top:0, left:0, right:0,
                opacity: testIdx===i ? 1 : 0,
                transform: `translateY(${testIdx===i?0:20}px)`,
                transition:'opacity 0.8s cubic-bezier(0.22,1,0.36,1),transform 0.8s cubic-bezier(0.22,1,0.36,1)',
                pointerEvents: testIdx===i?'all':'none',
              }}>
                <p style={{ fontFamily:SF, fontSize:'clamp(18px,2.5vw,28px)', fontWeight:300, fontStyle:'italic', color:W, lineHeight:1.6, marginBottom:32 }}>
                  "{t.quote}"
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16 }}>
                  <div style={{ width:40, height:1, background:G }} />
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontFamily:SY, fontSize:11, fontWeight:700, color:W, margin:0, letterSpacing:'0.1em' }}>{t.name}</p>
                    <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.4)', margin:'4px 0 0' }}>{t.loc}</p>
                    <p style={{ fontFamily:SS, fontSize:10, color:G, margin:'2px 0 0', letterSpacing:'0.1em' }}>{t.proj}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:48 }}>
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={()=>setTestIdx(i)} style={{
                width: testIdx===i ? 32 : 8,
                height:8, borderRadius:4,
                background: testIdx===i ? `linear-gradient(90deg,${G},${GL})` : 'rgba(255,255,255,0.15)',
                border:'none', cursor:'pointer', transition:'all 0.4s cubic-bezier(0.22,1,0.36,1)', padding:0,
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BEFORE / AFTER
      ══════════════════════════════════════════════════════ */}
      <section style={{ background:BG, padding:'120px clamp(24px,6vw,120px)', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div className="reveal" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:24, height:1, background:G }} />
              <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>Transformation</span>
              <div style={{ width:24, height:1, background:G }} />
            </div>
            <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(36px,4.5vw,72px)', fontWeight:300, color:W, lineHeight:1.0, letterSpacing:'-0.02em', marginBottom:16 }}>
              See the <em style={{ fontStyle:'italic', color:G }}>Difference</em>
            </h2>
            <p className="reveal" style={{ fontFamily:SS, fontSize:14, color:'rgba(255,255,255,0.45)', maxWidth:'40ch', margin:'0 auto' }}>Drag to reveal the before and after of a recent Chennai residence.</p>
          </div>
          <div className="reveal">
            <BeforeAfter />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STUDIO CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', overflow:'hidden', minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0905' }}>
        {/* Background */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
          <img src="https://images.unsplash.com/photo-1560440021-33f9b867899d?auto=format&fit=crop&w=1920&q=80" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.15) saturate(0.5)' }} />
          <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at center,rgba(201,162,39,0.12) 0%,rgba(8,7,10,0.95) 70%)` }} />
        </div>
        <Orbs style={{ zIndex:1 }} />

        <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'80px clamp(24px,6vw,80px)' }}>
          <p className="reveal" style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.5em', textTransform:'uppercase', color:G, marginBottom:24 }}>Interactive Design Studio</p>
          <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(40px,6vw,100px)', fontWeight:300, color:W, lineHeight:0.95, letterSpacing:'-0.02em', marginBottom:28 }}>
            Design Your<br /><em style={{ fontStyle:'italic' }} className="text-shimmer">Dream Space</em><br />Right Now
          </h2>
          <p className="reveal" style={{ fontFamily:SS, fontSize:14, color:'rgba(255,255,255,0.5)', maxWidth:'42ch', margin:'0 auto 48px', lineHeight:1.9 }}>
            Draw floor plans, place furniture, visualise in 3D — all in your browser. No download, no login required.
          </p>
          <div className="reveal" style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => nav('/studio')} onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 24px 80px rgba(201,162,39,0.5)` }} onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`0 8px 32px rgba(201,162,39,0.3)` }}
              style={{ padding:'20px 52px', background:`linear-gradient(135deg,${G},${GL})`, border:'none', color:'#0a0805', fontFamily:SY, fontSize:11, fontWeight:700, letterSpacing:'0.35em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.4s cubic-bezier(0.22,1,0.36,1)', boxShadow:`0 8px 32px rgba(201,162,39,0.3)` }}>
              Launch Studio Free →
            </button>
          </div>
          {/* Feature tags */}
          <div className="reveal" style={{ display:'flex', gap:20, justifyContent:'center', marginTop:36, flexWrap:'wrap' }}>
            {['No Login Required','2D Floor Plan','3D Viewer','AI Suggestions','Export to PDF'].map(f => (
              <span key={f} style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:G }}>✓</span> {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════════ */}
      <section id="contact" style={{ background:BG, padding:'120px clamp(24px,6vw,120px)', position:'relative', overflow:'hidden' }}>
        <Orbs />
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'start', position:'relative', zIndex:2 }}>
          {/* Left */}
          <div>
            <div className="reveal" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
              <div style={{ width:24, height:1, background:G }} />
              <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>Let's Talk</span>
            </div>
            <h2 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(36px,4.5vw,72px)', fontWeight:300, color:W, lineHeight:1.0, letterSpacing:'-0.02em', marginBottom:24 }}>
              Begin Your<br /><em style={{ fontStyle:'italic', color:G }}>Transformation</em>
            </h2>
            <p className="reveal" style={{ fontFamily:SS, fontSize:14, lineHeight:2, color:'rgba(255,255,255,0.5)', maxWidth:'40ch', marginBottom:56 }}>
              Every great interior begins with a conversation. Tell us about your space, your aspirations, your timeline — we'll take it from there.
            </p>

            {/* Contact info */}
            <div className="reveal stagger-children" style={{ display:'flex', flexDirection:'column', gap:28 }}>
              {[
                { label:'Studio', val:'Nugambakkam, Chennai — 600034' },
                { label:'Email', val:'hello@elshaddai.in' },
                { label:'Phone', val:'+91 98765 43210' },
                { label:'Hours', val:'Mon – Sat, 9:30 AM – 7:00 PM' },
              ].map(({ label, val }) => (
                <div key={label} style={{ display:'flex', gap:20, alignItems:'flex-start' }} className="reveal">
                  <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:G, minWidth:60, paddingTop:2 }}>{label}</span>
                  <span style={{ fontFamily:SS, fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="reveal" style={{ display:'flex', gap:16, marginTop:48 }}>
              {['Instagram','LinkedIn','YouTube','Houzz'].map(s => (
                <a key={s} href="#" style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', padding:'8px 14px', border:'1px solid rgba(255,255,255,0.08)', transition:'all 0.3s', display:'block' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=G; e.currentTarget.style.color=G }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.3)' }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="reveal-right">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{ background:'#06050a', borderTop:'1px solid rgba(255,255,255,0.04)', padding:'64px clamp(24px,6vw,120px) 32px', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:64 }}>
            {/* Brand */}
            <div>
              <div style={{ fontFamily:SF, fontSize:28, fontWeight:300, letterSpacing:'0.06em', color:W, marginBottom:16 }}>
                El Shaddai<span style={{ color:G }}> Interiors</span>
              </div>
              <p style={{ fontFamily:SS, fontSize:12, lineHeight:2, color:'rgba(255,255,255,0.35)', maxWidth:'32ch', marginBottom:24 }}>
                Crafting exceptional interiors across South India since 2012. Architecture for the way you live.
              </p>
              <div style={{ display:'flex', gap:6 }}>
                {[G,'rgba(201,162,39,0.5)','rgba(201,162,39,0.2)'].map((c,i) => (
                  <div key={i} style={{ width: i===0?32:i===1?20:12, height:2, background:c, borderRadius:1 }} />
                ))}
              </div>
            </div>
            {/* Links */}
            {[
              { title:'Studio', links:['Floor Plan Editor','3D Viewer','Furniture Catalog','AI Design','Render Engine'] },
              { title:'Company', links:['About Us','Portfolio','Blog','Pricing','Contact'] },
              { title:'Services', links:['Interior Design','Space Planning','3D Renders','Site Execution','Vastu'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontFamily:SY, fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:G, marginBottom:20 }}>{col.title}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontFamily:SS, fontSize:12, color:'rgba(255,255,255,0.35)', transition:'color 0.2s' }}
                      onMouseEnter={e=>{e.target.style.color=W}} onMouseLeave={e=>{e.target.style.color='rgba(255,255,255,0.35)'}}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:28, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.2)', margin:0 }}>© 2026 El Shaddai Interiors Pvt. Ltd. All rights reserved.</p>
            <div style={{ display:'flex', gap:24 }}>
              {['Privacy Policy','Terms of Service','Refund Policy'].map(l => (
                <a key={l} href={`/${l.toLowerCase().replace(/ /g,'-')}`} style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.2)', transition:'color 0.2s' }}
                  onMouseEnter={e=>{e.target.style.color='rgba(255,255,255,0.5)'}} onMouseLeave={e=>{e.target.style.color='rgba(255,255,255,0.2)'}}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* Extracted room text block */
function RoomText({ room, nav, G, GL, SF, SS, SY }) {
  return (
    <>
      <div className="reveal" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
        <div style={{ width:24, height:1, background:G }} />
        <span style={{ fontFamily:SY, fontSize:9, fontWeight:600, letterSpacing:'0.4em', textTransform:'uppercase', color:G }}>{room.style}</span>
      </div>
      <div className="reveal" style={{ fontFamily:SY, fontSize:11, fontWeight:600, letterSpacing:'0.3em', color:'rgba(255,255,255,0.2)', marginBottom:12 }}>{room.n}</div>
      <h3 className="reveal" style={{ fontFamily:SF, fontSize:'clamp(28px,3.5vw,56px)', fontWeight:300, color:'#ffffff', lineHeight:1.05, letterSpacing:'-0.01em', marginBottom:20 }}>{room.label}</h3>
      <p className="reveal" style={{ fontFamily:SS, fontSize:13, lineHeight:2, color:'rgba(255,255,255,0.45)', maxWidth:'38ch', marginBottom:32 }}>{room.desc}</p>
      <button className="reveal" onClick={() => nav('/portfolio')}
        style={{ padding:'14px 32px', background:'transparent', border:`1px solid rgba(201,162,39,0.4)`, color:G, fontFamily:SY, fontSize:10, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.3s' }}
        onMouseEnter={e=>{ e.currentTarget.style.background=`linear-gradient(135deg,${G},${GL})`; e.currentTarget.style.color='#0a0805'; e.currentTarget.style.borderColor='transparent' }}
        onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=G; e.currentTarget.style.borderColor='rgba(201,162,39,0.4)' }}>
        View Project →
      </button>
    </>
  )
}
