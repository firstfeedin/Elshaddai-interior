import { useState, useEffect, useRef } from 'react'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY

const SYSTEM_PROMPT = `You are Priya, a senior interior design consultant at El Shaddai Interiors with 12 years of experience. You are warm, knowledgeable, and conversational — like a trusted expert friend, not a robot. You help with:
- Interior design advice (styles, materials, colour palettes, furniture selection)
- Project guidance (timelines, budgets, procurement, execution phases)
- Platform navigation (how to use dashboards, tracking, financial tools)
- Cost estimation and material recommendations for Indian homes
Keep answers concise, warm, and professional. Use Indian context (₹ pricing, Indian brands, Hyderabad/Bangalore/Mumbai markets). Speak naturally as Priya — first person, never robotic.`

const QUICK_PROMPTS = [
  'Cost per sqft for premium interiors?',
  'How long does a 3BHK project take?',
  'Best materials for coastal climate?',
  'Colour palette for minimalist living room?',
]

const MODELS = [
  ['gemini-2.0-flash',      'v1beta'],
  ['gemini-2.0-flash-lite', 'v1beta'],
  ['gemini-1.5-flash',      'v1'],
  ['gemini-1.5-flash-8b',   'v1'],
]

function demoReply(text) {
  const t = text.toLowerCase()
  if (t.includes('cost') || t.includes('price') || t.includes('budget') || t.includes('sqft'))
    return `Here's a realistic breakdown for South India:\n\n**Budget (₹1,200–₹1,800/sqft)** — Laminate furniture, vitrified tiles, basic false ceiling. Good for rentals.\n\n**Mid-range (₹1,800–₹2,800/sqft)** — Acrylic kitchen, engineered wood, concealed lighting. Most popular for 3BHK.\n\n**Premium (₹2,800–₹4,500/sqft)** — Imported stone, Italian lacquer, smart home. Custom joinery.\n\nFor a 1,200 sqft 3BHK, budget ₹22L–₹54L. Always keep a 10% contingency. Want a room-by-room breakdown?`
  if (t.includes('time') || t.includes('long') || t.includes('duration') || t.includes('month') || t.includes('finish'))
    return `Typical 3BHK timeline:\n\n**Week 1–3:** Site survey, concept design\n**Week 4–6:** Presentations, approvals\n**Week 7–10:** Procurement & fabrication\n**Week 11–18:** Civil + furniture installation\n**Week 19–21:** Finishing & handover\n\n**Total: 5–6 months** for a well-managed project. Delays usually come from slow client approvals or material lead times.`
  if (t.includes('colour') || t.includes('color') || t.includes('palette') || t.includes('paint'))
    return `My favourite palettes for Indian homes:\n\n**Modern Minimalist** — Off-White walls (Asian Paints 8178) + charcoal accent, natural oak, brushed brass\n\n**Warm Contemporary** — Greige walls + terracotta accents, rattan, antique brass\n\n**Classic Elegant** — Warm ivory + deep teal panel, walnut tones, velvet, polished gold\n\nFor Hyderabad's natural light, always go warmer whites. Want a specific room palette?`
  if (t.includes('material') || t.includes('coastal') || t.includes('humid') || t.includes('climate'))
    return `For Hyderabad's climate (hot summers, moderate humidity):\n\n**Always use** BWP (boiling waterproof) marine ply — Century or Greenply. Solid wood can warp in peak summer.\n\n**Flooring:** Vitrified tiles or engineered wood — Hyderabad granite is also a great local option\n\n**Kitchen:** PU-coated or acrylic shutters — Hyderabad summers can affect raw wood\n\n**Hardware:** SS or powder-coated — longevity in dusty conditions\n\n**Walls:** Use heat-reflective exterior paint on west-facing walls to reduce A/C load`
  if (t.includes('kitchen'))
    return `For Indian cooking, here's what works:\n\n**Layout:** L-shaped or parallel. Platform height 850–870mm.\n\n**Shutters:** Acrylic (₹650–₹900/sqft) · Membrane (₹550–₹750) · Lacquer (₹1,100–₹1,600)\n\n**Countertop:** Quartz — non-porous, stain-proof (Silestone or Calacatta)\n\n**Must-haves:** 90cm chimney · Masala drawers · Tall unit for oven+microwave\n\nBudget: ₹2.5L–₹6L for a full modular kitchen.`
  if (t.includes('hello') || t.includes('hi') || t.includes('hey') || t.includes('namaste'))
    return `Hello! I'm Priya from El Shaddai Interiors 👋\n\nI can help you with:\n• **Cost estimates** — room-by-room or whole-home\n• **Design styles** — modern, classic, contemporary\n• **Material selection** — flooring, kitchen, bathroom\n• **Project timelines** — phase by phase\n• **Platform navigation** — any dashboard or tool\n\nWhat are you working on today?`
  return `I'm Priya, your El Shaddai design consultant.\n\nI can help with:\n• **Design & Style** — palettes, furniture, layouts\n• **Cost & Budget** — ₹/sqft estimates\n• **Materials** — plywood, tiles, stone, paints\n• **Project Management** — timelines, phases\n• **Platform** — dashboards, tools, navigation\n\nCould you rephrase your question? For example: *"What's the cost for a modular kitchen?"*`
}

async function callGemini(history) {
  const lastText = history[history.length - 1].parts[0].text
  if (!GEMINI_KEY || GEMINI_KEY.length < 20 || GEMINI_KEY.startsWith('your-')) return demoReply(lastText)
  for (const [model, ver] of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${GEMINI_KEY}`,
        { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ system_instruction:{parts:[{text:SYSTEM_PROMPT}]}, contents:history, generationConfig:{temperature:0.75,maxOutputTokens:512} }) }
      )
      const data = await res.json()
      if (data.error) { if (data.error.code===403) return 'API key not authorised.'; continue }
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (txt) return txt
    } catch { continue }
  }
  return demoReply(history[history.length - 1].parts[0].text)
}

/* ── Sparkle icon for FAB ─────────────────────────────────────── */
function SparkleIcon({ size = 20, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" fill={color} opacity="0.9"/>
      <path d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z" fill={color} opacity="0.5"/>
      <path d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z" fill={color} opacity="0.4"/>
    </svg>
  )
}

/* ── Assistant avatar initials ───────────────────────────────── */
function AiAvatar({ size = 28 }) {
  return (
    <div style={{ width:size, height:size, background:`linear-gradient(135deg, ${dark} 0%, #2d2420 100%)`, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <SparkleIcon size={size * 0.48} color={gold} />
    </div>
  )
}

export default function ChatbotAssistant() {
  const [open,      setOpen]     = useState(false)
  const [messages,  setMessages] = useState([
    { role:'model', text:"Hi! I'm Priya, your design consultant at El Shaddai.\n\nAsk me anything about interior design, costs, materials, timelines, or how to use the platform." }
  ])
  const [input,     setInput]    = useState('')
  const [loading,   setLoading]  = useState(false)
  const [minimised, setMin]      = useState(false)
  const [hovered,   setHovered]  = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const user = JSON.parse(localStorage.getItem('es_user') || 'null')
  const userInitials = user ? (user.name || 'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'U'

  useEffect(() => {
    if (open && !minimised) {
      bottomRef.current?.scrollIntoView({ behavior:'smooth' })
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [messages, open, minimised])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role:'user', text:msg }])
    setLoading(true)
    const history = messages.map(m => ({ role:m.role==='model'?'model':'user', parts:[{text:m.text}] }))
    history.push({ role:'user', parts:[{text:msg}] })
    try {
      const reply = await callGemini(history)
      setMessages(prev => [...prev, { role:'model', text:reply }])
    } catch {
      setMessages(prev => [...prev, { role:'model', text:'Something went wrong. Please try again!' }])
    }
    setLoading(false)
  }

  function handleKey(e) {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const WINDOW_W = 380
  const WINDOW_H = 560

  return (
    <>
      {/* ── FAB ─────────────────────────────────────────────── */}
      {!open && (
        <div style={{ position:'fixed', bottom:28, right:28, zIndex:9999 }}>
          {/* Pulsing ring */}
          <div style={{ position:'absolute', inset:-4, border:`1px solid ${gold}`, opacity: hovered ? 0.6 : 0.25, transition:'opacity 0.3s', animation:'ringPulse 2.5s ease-in-out infinite' }} />

          <button
            onClick={() => setOpen(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width:54, height:54,
              background: hovered ? `linear-gradient(135deg, #2d2420 0%, #1c1917 100%)` : dark,
              border:`1.5px solid ${hovered ? gold : '#3a3330'}`,
              cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: hovered ? `0 8px 32px rgba(201,162,39,0.25), 0 4px 16px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.35)',
              transition:'all 0.25s',
              position:'relative',
            }}>
            <SparkleIcon size={22} color={hovered ? gold : '#c4b89a'} />

            {/* AI badge */}
            <div style={{ position:'absolute', top:-5, right:-5, background:gold, padding:'2px 5px', ...sans, fontSize:7, fontWeight:800, color:dark, letterSpacing:'0.1em' }}>AI</div>
          </button>

          {/* Tooltip */}
          {hovered && (
            <div style={{ position:'absolute', bottom:'calc(100% + 10px)', right:0, background:dark, border:`1px solid #3a3330`, padding:'6px 12px', whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(0,0,0,0.3)' }}>
              <p style={{ ...sans, margin:0, fontSize:11, color:'#e7e5e4', fontWeight:500 }}>Chat with Priya</p>
              <p style={{ ...sans, margin:'2px 0 0', fontSize:9, color:gold, letterSpacing:'0.12em', textTransform:'uppercase' }}>Design Consultant</p>
              {/* Arrow */}
              <div style={{ position:'absolute', bottom:-5, right:18, width:8, height:8, background:dark, border:'1px solid #3a3330', transform:'rotate(45deg)', borderTop:'none', borderLeft:'none' }} />
            </div>
          )}
        </div>
      )}

      {/* ── Chat window ─────────────────────────────────────── */}
      {open && (
        <div style={{
          position:'fixed', bottom:28, right:28,
          width:WINDOW_W,
          height: minimised ? 'auto' : WINDOW_H,
          background:'#fff',
          border:`1px solid ${bdr}`,
          boxShadow:'0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)',
          zIndex:9999,
          display:'flex', flexDirection:'column',
          overflow:'hidden',
        }}>

          {/* ── Header ─────────────────────────────────────── */}
          <div style={{ background:`linear-gradient(135deg, #1c1917 0%, #2d2420 100%)`, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, flexShrink:0, borderBottom:`1px solid rgba(201,162,39,0.2)` }}>
            {/* Brand mark */}
            <div style={{ width:38, height:38, border:`1px solid rgba(201,162,39,0.5)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' }}>
              <SparkleIcon size={18} color={gold} />
              {/* Online dot */}
              <div style={{ position:'absolute', bottom:2, right:2, width:7, height:7, background:'#22c55e', border:'1.5px solid #1c1917' }} />
            </div>

            <div style={{ flex:1 }}>
              <p style={{ ...serif, margin:0, fontSize:15, fontWeight:400, color:'#fff', letterSpacing:'0.03em' }}>Priya</p>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:1 }}>
                <div style={{ width:5, height:5, background:'#22c55e' }} />
                <p style={{ ...sans, margin:0, fontSize:9, color:'rgba(201,162,39,0.8)', letterSpacing:'0.15em', textTransform:'uppercase' }}>Design Consultant · Online</p>
              </div>
            </div>

            <div style={{ display:'flex', gap:2 }}>
              <button onClick={() => setMin(m=>!m)}
                style={{ width:28, height:28, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'#a8a29e', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                {minimised ? '▲' : '▼'}
              </button>
              <button onClick={() => setOpen(false)}
                style={{ width:28, height:28, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'#a8a29e', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.15)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                ✕
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* ── Messages ──────────────────────────────── */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12, background:'#fafaf9' }}>
                {messages.map((m, i) => {
                  const isUser = m.role === 'user'
                  return (
                    <div key={i} style={{ display:'flex', flexDirection:isUser?'row-reverse':'row', gap:8, alignItems:'flex-end' }}>

                      {/* Avatar */}
                      {isUser ? (
                        <div style={{ width:26, height:26, background:dark, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, ...sans, fontSize:9, fontWeight:700, color:gold, letterSpacing:'0.05em' }}>
                          {userInitials}
                        </div>
                      ) : (
                        <AiAvatar size={26} />
                      )}

                      {/* Bubble */}
                      <div style={{
                        maxWidth:'76%',
                        padding:'10px 14px',
                        background: isUser ? dark : '#fff',
                        border: isUser ? 'none' : `1px solid ${bdr}`,
                        borderLeft: !isUser ? `3px solid ${gold}` : undefined,
                        boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                        position:'relative',
                      }}>
                        <p style={{ ...sans, fontSize:12.5, color:isUser?'#fff':dark, margin:0, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{m.text}</p>
                        {/* Timestamp */}
                        <p style={{ ...sans, fontSize:9, color:isUser?'rgba(255,255,255,0.35)':'#c4bfba', margin:'4px 0 0', textAlign:isUser?'right':'left' }}>
                          {new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* Loading indicator */}
                {loading && (
                  <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                    <AiAvatar size={26} />
                    <div style={{ padding:'12px 16px', background:'#fff', border:`1px solid ${bdr}`, borderLeft:`3px solid ${gold}`, display:'flex', gap:4, alignItems:'center' }}>
                      <span style={{ ...sans, fontSize:11, color:stone }}>Priya is typing</span>
                      <span style={{ display:'flex', gap:3, marginLeft:4 }}>
                        {[0,1,2].map(j => (
                          <span key={j} style={{ display:'inline-block', width:4, height:4, background:gold, animation:`dot 1.4s ${j*0.2}s ease-in-out infinite` }} />
                        ))}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* ── Quick prompts ─────────────────────────── */}
              {messages.length <= 1 && (
                <div style={{ padding:'10px 16px', background:'#fff', borderTop:`1px solid ${bdr}`, display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
                  <p style={{ ...sans, width:'100%', fontSize:9, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'#a8a29e', margin:'0 0 6px' }}>Suggested questions</p>
                  {QUICK_PROMPTS.map(q => (
                    <button key={q} onClick={() => send(q)}
                      style={{ ...sans, fontSize:10.5, color:stone, background:light, border:`1px solid ${bdr}`, padding:'5px 10px', cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background=`${gold}12`; e.currentTarget.style.borderColor=gold; e.currentTarget.style.color=dark }}
                      onMouseLeave={e=>{ e.currentTarget.style.background=light; e.currentTarget.style.borderColor=bdr; e.currentTarget.style.color=stone }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input ─────────────────────────────────── */}
              <div style={{ borderTop:`1px solid ${bdr}`, padding:'12px 14px', display:'flex', gap:8, alignItems:'center', flexShrink:0, background:'#fff' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Message Priya…"
                  style={{
                    ...sans, flex:1,
                    padding:'9px 13px',
                    border:`1px solid ${input.trim() ? gold+'80' : bdr}`,
                    fontSize:12.5, color:dark,
                    background:light,
                    outline:'none',
                    transition:'border-color 0.15s',
                  }} />
                <button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  style={{
                    width:38, height:38, flexShrink:0,
                    background: input.trim() ? gold : '#f0ede9',
                    border:'none',
                    cursor: input.trim() ? 'pointer' : 'default',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.15s',
                    boxShadow: input.trim() ? `0 2px 8px ${gold}40` : 'none',
                  }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M3 10L17 10M17 10L11 4M17 10L11 16" stroke={input.trim()?dark:'#a8a29e'} strokeWidth="1.8" strokeLinecap="square"/>
                  </svg>
                </button>
              </div>

              {/* ── Footer brand ──────────────────────────── */}
              <div style={{ background:'#f5f4f2', borderTop:`1px solid ${bdr}`, padding:'6px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                <p style={{ ...sans, margin:0, fontSize:9, color:'#a8a29e' }}>Powered by Gemini AI</p>
                <p style={{ ...serif, margin:0, fontSize:10, color:'#c4bfba' }}>El Shaddai · Divine Mercy IT Solutions</p>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.25} 50%{transform:scale(1.08);opacity:0.5} }
      `}</style>
    </>
  )
}
