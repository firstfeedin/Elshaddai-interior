import { useState } from 'react'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const border = '#21262d'

const SLIDES = [
  { id:1, title:'Living Room Overview',  sub:'Modern Scandinavian style with warm oak tones',              img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80' },
  { id:2, title:'Kitchen Design',        sub:'Open plan kitchen with island and premium appliances',       img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80' },
  { id:3, title:'Master Bedroom Suite',  sub:'Luxury bedroom with walk-in wardrobe',                      img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80' },
  { id:4, title:'Material Palette',      sub:'White Oak, Carrara Marble, Brushed Gold',                   img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80' },
  { id:5, title:'Investment Summary',    sub:'Complete bill of quantities and breakdown',                  img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
]

const COMMENTS = [
  { author:'Priya Sharma', role:'Client',   time:'2h ago',  text:'Love the living room! Can we see the kitchen with darker cabinets?', initials:'PS', mine:false },
  { author:'You',          role:'Designer', time:'1h ago',  text:'Sure — I\'ll generate an alternate with charcoal cabinets by tomorrow.', initials:'ME', mine:true },
  { author:'Priya Sharma', role:'Client',   time:'30m ago', text:'Perfect, thank you! The bedroom looks amazing.', initials:'PS', mine:false },
]

function Lbl({ children }) {
  return <p style={{ ...sans, margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{children}</p>
}

export default function PresentationPage() {
  const [slide,      setSlide]      = useState(0)
  const [clientMode, setClientMode] = useState(false)
  const [comment,    setComment]    = useState('')
  const [playing,    setPlaying]    = useState(false)
  const [copied,     setCopied]     = useState(false)

  const cur = SLIDES[slide]

  const copyLink = () => {
    navigator.clipboard.writeText('https://www.divinemercyitsol.com/present/sharma-residence-2025')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0b09', ...sans, overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ height: 52, background: '#110f0e', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none"/></svg>
          </div>
          <span style={{ ...serif, fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: '0.04em' }}>El Shaddai</span>
        </div>
        <div style={{ width: 1, height: 20, background: border }} />
        <span style={{ ...sans, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>Design Proposal</span>
        <span style={{ color: border, fontSize: 12 }}>›</span>
        <span style={{ ...sans, fontSize: 12, fontWeight: 500, color: '#fff' }}>Sharma Residence — Full Interior</span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
          <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '3px 8px', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>APPROVED</span>
          <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '3px 8px', border: `1px solid rgba(201,162,39,0.3)`, color: gold }}>5 SLIDES</span>
        </div>
        <div style={{ flex: 1 }} />
        {clientMode && <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', padding: '4px 10px', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}>CLIENT VIEW</span>}
        <button onClick={() => window.location.href = '/projects'}
          style={{ ...sans, padding: '6px 14px', background: 'transparent', border: `1px solid ${border}`, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ← Exit
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Slide list (designer only) */}
        {!clientMode && (
          <div style={{ width: 220, background: '#110f0e', borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${border}` }}>
              <p style={{ ...sans, margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Slides ({SLIDES.length})</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
              {SLIDES.map((s, i) => (
                <button key={s.id} onClick={() => setSlide(i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', marginBottom: 2, background: slide === i ? 'rgba(201,162,39,0.07)' : 'transparent', border: `1px solid ${slide === i ? gold : 'transparent'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: 40, height: 28, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ ...sans, margin: '0 0 2px', fontSize: 10, fontWeight: 500, color: slide === i ? gold : 'rgba(255,255,255,0.7)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 300 }}>Slide {i + 1}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main slide view */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 32px', position: 'relative' }}>
            <div style={{ width: '100%', maxWidth: 860, position: 'relative' }}>
              {/* Slide image */}
              <div style={{ aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                <img src={cur.img} alt={cur.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {/* Overlay text */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,8,6,0.9) 0%, rgba(10,8,6,0.1) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '28px 32px' }}>
                  <p style={{ ...sans, margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: gold }}>Slide {slide + 1} / {SLIDES.length}</p>
                  <h2 style={{ ...serif, margin: '0 0 8px', fontSize: 36, fontWeight: 300, color: '#fff', lineHeight: 1.1 }}>{cur.title}</h2>
                  <p style={{ ...sans, margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 300, maxWidth: 480 }}>{cur.sub}</p>
                </div>
                <div style={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', gap: 8 }}>
                  <button onClick={() => window.location.href = '/designer'} style={{ ...sans, padding: '8px 16px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Open in Designer</button>
                  <button onClick={() => window.location.href = '/render'} style={{ ...sans, padding: '8px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>4K Render</button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ height: 58, background: '#110f0e', borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
              style={{ ...sans, padding: '7px 18px', background: 'transparent', border: `1px solid ${slide === 0 ? border : 'rgba(255,255,255,0.15)'}`, color: slide === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)', cursor: slide === 0 ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }}>
              ← PREV
            </button>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  style={{ width: slide === i ? 22 : 6, height: 6, background: slide === i ? gold : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
              ))}
            </div>
            <button onClick={() => setPlaying(p => !p)}
              style={{ ...sans, padding: '7px 14px', background: playing ? `rgba(201,162,39,0.1)` : 'transparent', border: `1px solid ${playing ? gold : 'rgba(255,255,255,0.15)'}`, color: playing ? gold : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }}>
              {playing ? '⏸ PAUSE' : '▶ PLAY'}
            </button>
            <button onClick={() => setSlide(s => Math.min(SLIDES.length - 1, s + 1))} disabled={slide === SLIDES.length - 1}
              style={{ ...sans, padding: '7px 18px', background: 'transparent', border: `1px solid ${slide === SLIDES.length - 1 ? border : 'rgba(255,255,255,0.15)'}`, color: slide === SLIDES.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)', cursor: slide === SLIDES.length - 1 ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }}>
              NEXT →
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 230, background: '#110f0e', borderLeft: `1px solid ${border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Options */}
          <div style={{ padding: '16px 16px', borderBottom: `1px solid ${border}` }}>
            <Lbl>Presentation Options</Lbl>
            {/* Client Mode toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}` }}>
              <span style={{ ...sans, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>Client Mode</span>
              <button onClick={() => setClientMode(c => !c)}
                style={{ width: 34, height: 18, background: clientMode ? gold : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: clientMode ? 16 : 2, width: 14, height: 14, background: '#fff', transition: 'left 0.2s' }} />
              </button>
            </div>
            {[
              { text: copied ? 'Link Copied!' : 'Copy Share Link', action: copyLink },
              { text: 'Download PDF',       action: () => {} },
              { text: 'Request Approval →', action: () => {}, highlight: true },
            ].map((b, i) => (
              <button key={i} onClick={b.action}
                style={{ ...sans, width: '100%', padding: '9px 12px', marginBottom: 6, background: b.highlight ? gold : 'transparent', border: `1px solid ${b.highlight ? gold : border}`, color: b.highlight ? '#000' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 10, fontWeight: b.highlight ? 700 : 400, letterSpacing: '0.1em', textAlign: 'left', transition: 'all 0.15s' }}>
                {b.text}
              </button>
            ))}
          </div>

          {/* Comments */}
          <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto' }}>
            <Lbl>Client Comments</Lbl>
            {COMMENTS.map((c, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 24, height: 24, background: c.mine ? gold : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: c.mine ? '#000' : 'rgba(255,255,255,0.7)', flexShrink: 0 }}>{c.initials}</div>
                  <div>
                    <p style={{ ...sans, margin: 0, fontSize: 10, fontWeight: 600, color: c.mine ? gold : 'rgba(255,255,255,0.7)' }}>{c.author}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>{c.time}</p>
                  </div>
                </div>
                <p style={{ ...sans, margin: '0 0 0 32px', fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, fontWeight: 300 }}>{c.text}</p>
              </div>
            ))}
          </div>

          {/* Reply */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}` }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Reply..."
                style={{ ...sans, flex: 1, padding: '7px 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, color: 'rgba(255,255,255,0.7)', fontSize: 11, outline: 'none', fontWeight: 300 }} />
              <button onClick={() => setComment('')} style={{ padding: '7px 10px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
