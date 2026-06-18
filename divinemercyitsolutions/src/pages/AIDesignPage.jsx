import AppShell from '../components/AppShell'
import { useState } from 'react'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

async function callGemini(prompt, style, roomType, budget, area) {
  if (!GEMINI_KEY) return null
  const userPrompt = `You are an expert interior designer AI. Generate a detailed interior design concept for:
Room Type: ${roomType}, Style: ${style}, Budget: ₹${budget} Lakhs${area ? `, Area: ${area} sq ft` : ''}
Client: ${prompt}
Respond ONLY with valid JSON (no markdown):
{"style":"...","desc":"2-3 sentences","palette":["#HEX1","#HEX2","#HEX3","#HEX4","#HEX5"],"palette_names":["Name1","Name2","Name3","Name4","Name5"],"items":[{"name":"...","qty":1,"unit":25000,"total":25000}]}
Include 6-8 items. Keep total within budget. Use INR prices realistic for India.`
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: userPrompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }),
  })
  if (!res.ok) return null
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) } catch { return null }
}

const STYLES    = ['Modern','Scandinavian','Industrial','Bohemian','Luxury','Mid-Century','Japandi','Coastal']
const ROOM_TYPES= ['Living Room','Bedroom','Kitchen','Bathroom','Home Office','Dining Room','Commercial']

const MOCK_RESULT = {
  style: 'Modern Scandinavian',
  desc: 'A clean, light-filled space blending Scandinavian simplicity with warm Indian aesthetics. Featuring warm oak tones, white walls, and natural textures that create a serene yet functional living environment.',
  palette: ['#F5F0E8','#C8A86B','#4A4A40','#1B2A4A','#C9A227'],
  palette_names: ['Cream White','Light Oak','Charcoal','Navy','Gold'],
  items: [
    { name:'3-Seater Sofa', qty:1, unit:45000, total:45000 },
    { name:'Coffee Table — Oak', qty:1, unit:15000, total:15000 },
    { name:'Floor Lamp Arc', qty:2, unit:8500, total:17000 },
    { name:'Accent Chair', qty:1, unit:12000, total:12000 },
    { name:'Bookshelf 5-Tier', qty:1, unit:18000, total:18000 },
    { name:'Potted Plants (set of 3)', qty:1, unit:6000, total:6000 },
  ],
}

const HISTORY = [
  { title:'Modern Living Room — Sharma', style:'Modern', area:320, budget:'₹2.5L' },
  { title:'Scandinavian Kitchen — Gupta', style:'Scandinavian', area:180, budget:'₹3.2L' },
  { title:'Luxury Home Office', style:'Luxury', area:130, budget:'₹4.1L' },
]

function Label({ children }) {
  return <p style={{ ...sans, margin: '0 0 7px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>{children}</p>
}

function InputRow({ label, children }) {
  return <div style={{ marginBottom: 20 }}><Label>{label}</Label>{children}</div>
}

export default function AIDesignPage() {
  const [prompt, setPrompt]   = useState('')
  const [style, setStyle]     = useState('Modern')
  const [roomType, setRoom]   = useState('Living Room')
  const [budget, setBudget]   = useState(10)
  const [area, setArea]       = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [aiError, setAiError] = useState(null)
  const [promptFocus, setPromptFocus] = useState(false)

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true); setResult(null); setAiError(null)
    try {
      const aiResult = await callGemini(prompt, style, roomType, budget, area)
      if (aiResult?.style && aiResult?.items?.length) { setResult(aiResult) }
      else {
        await new Promise(r => setTimeout(r, 1200))
        setResult(MOCK_RESULT)
        if (GEMINI_KEY) setAiError('AI response was invalid — showing example design.')
      }
    } catch {
      await new Promise(r => setTimeout(r, 800))
      setResult(MOCK_RESULT)
      setAiError('Could not reach AI — showing example design.')
    }
    setLoading(false)
  }

  const total = result ? result.items.reduce((s, i) => s + i.total, 0) : 0

  const inputStyle = (focused) => ({
    width: '100%', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${focused ? dark : border}`,
    padding: '9px 0', fontSize: 13, color: dark, outline: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 300,
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  })

  return (
    <AppShell title="AI Design">
      <div style={{ ...sans, padding: '32px 36px', display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, maxWidth: 1280, minHeight: 'calc(100vh - 60px)' }}>

        {/* LEFT panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Input card */}
          <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ ...serif, margin: '0 0 3px', fontSize: 22, fontWeight: 300, color: dark }}>AI Interior Designer</h2>
                <p style={{ ...sans, margin: 0, fontSize: 12, color: '#a8a29e', fontWeight: 300 }}>Describe your room, get a complete design</p>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GEMINI_KEY ? gold : stone, border: `1px solid ${GEMINI_KEY ? gold : border}`, padding: '4px 10px' }}>
                {GEMINI_KEY ? '✓ Gemini AI' : 'Demo Mode'}
              </div>
            </div>

            {!GEMINI_KEY && (
              <div style={{ padding: '10px 14px', background: 'rgba(201,162,39,0.04)', border: `1px solid rgba(201,162,39,0.2)`, marginBottom: 20 }}>
                <p style={{ ...sans, margin: 0, fontSize: 11, color: stone, lineHeight: 1.7, fontWeight: 300 }}>Add <code>VITE_GEMINI_API_KEY</code> to your <code>.env</code> file to enable real AI generation. Running in demo mode.</p>
              </div>
            )}
            {aiError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}>
                <p style={{ ...sans, margin: 0, fontSize: 11, color: '#ef4444', fontWeight: 300 }}>{aiError}</p>
              </div>
            )}

            <InputRow label="Describe your room">
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                onFocus={() => setPromptFocus(true)} onBlur={() => setPromptFocus(false)}
                placeholder="e.g. A bright, airy living room for a young couple. Modern look with natural materials, good storage, and a home workspace corner. Budget around ₹3 lakhs."
                style={{ ...inputStyle(promptFocus), resize: 'vertical', height: 108, lineHeight: 1.7, borderBottom: 'none', border: `1.5px solid ${promptFocus ? dark : border}`, padding: '10px 12px' }} />
            </InputRow>

            <InputRow label="Interior Style">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STYLES.map(s => (
                  <button key={s} onClick={() => setStyle(s)} style={{ ...sans, padding: '5px 14px', border: `1px solid ${style === s ? dark : border}`, background: style === s ? dark : 'transparent', color: style === s ? '#fff' : stone, cursor: 'pointer', fontSize: 11, fontWeight: style === s ? 600 : 300, letterSpacing: '0.05em', transition: 'all 0.15s' }}>{s}</button>
                ))}
              </div>
            </InputRow>

            <InputRow label="Room Type">
              <select value={roomType} onChange={e => setRoom(e.target.value)} style={{ ...inputStyle(false), cursor: 'pointer', appearance: 'none', paddingRight: 20 }}>
                {ROOM_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </InputRow>

            <InputRow label={`Budget — ₹${budget} Lakhs`}>
              <input type="range" min={1} max={50} value={budget} onChange={e => setBudget(+e.target.value)} style={{ width: '100%', accentColor: gold, marginBottom: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: '#a8a29e' }}>₹1L</span>
                <span style={{ ...serif, fontSize: 18, fontWeight: 300, color: gold }}>₹{budget}L</span>
                <span style={{ fontSize: 10, color: '#a8a29e' }}>₹50L</span>
              </div>
            </InputRow>

            <InputRow label="Room Area (sq ft)">
              <input value={area} onChange={e => setArea(e.target.value)} type="number" placeholder="e.g. 320" style={inputStyle(false)} />
            </InputRow>

            <button onClick={generate} disabled={loading || !prompt.trim()}
              style={{ ...sans, width: '100%', padding: '13px', background: loading || !prompt.trim() ? '#e7e5e4' : gold, color: loading || !prompt.trim() ? '#a8a29e' : '#000', border: 'none', cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.2s', marginTop: 4 }}>
              {loading ? 'Generating Design...' : 'Generate AI Design →'}
            </button>
          </div>

          {/* History */}
          <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '20px 24px' }}>
            <p style={{ ...sans, margin: '0 0 16px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Recent Generations</p>
            {HISTORY.map((h, i) => (
              <button key={i} onClick={() => setResult(MOCK_RESULT)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 0', borderBottom: i < HISTORY.length - 1 ? `1px solid ${border}` : 'none', background: 'none', border: 'none', borderBottom: `1px solid ${i < HISTORY.length - 1 ? border : 'transparent'}`, cursor: 'pointer', textAlign: 'left', ...sans }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 500, color: dark }}>{h.title}</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{h.style} · {h.area} sq ft · {h.budget}</p>
                </div>
                <span style={{ fontSize: 10, color: '#a8a29e' }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT panel */}
        <div>
          {!result && !loading && (
            <div style={{ background: '#fff', border: `1px solid ${border}`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 60 }}>
              <div style={{ width: 64, height: 64, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 4L24 10.5V21H18V15.5H10V21H4V10.5L14 4Z" stroke={gold} strokeWidth="1.2" fill="none"/>
                </svg>
              </div>
              <h3 style={{ ...serif, margin: '0 0 12px', fontSize: 28, fontWeight: 300, color: dark }}>Your AI Design Will Appear Here</h3>
              <p style={{ ...sans, margin: 0, fontSize: 13, color: stone, fontWeight: 300, maxWidth: 380, lineHeight: 1.85 }}>Describe your dream room, choose a style, set your budget and click Generate. The AI will create a complete design with furniture, colour palette, and cost breakdown.</p>
            </div>
          )}

          {loading && (
            <div style={{ background: '#fff', border: `1px solid ${border}`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 60, textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 10, height: 10, background: gold, animation: `pulse${i} 0.8s ease-in-out infinite alternate` }} />
                ))}
              </div>
              <style>{`@keyframes pulse0{to{opacity:0.2;transform:scaleY(0.5)}}@keyframes pulse1{to{opacity:0.2;transform:scaleY(0.5);animation-delay:0.1s}}@keyframes pulse2{to{opacity:0.2;transform:scaleY(0.5);animation-delay:0.2s}}`}</style>
              <p style={{ ...serif, margin: 0, fontSize: 24, fontWeight: 300, color: dark }}>Generating your {style} {roomType}...</p>
              <p style={{ ...sans, margin: 0, fontSize: 12, color: '#a8a29e', fontWeight: 300 }}>Analysing style · Selecting furniture · Calculating costs</p>
            </div>
          )}

          {result && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Concept */}
              <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, border: `1px solid ${gold}`, padding: '3px 8px', marginBottom: 12, display: 'inline-block' }}>AI Generated</span>
                    <h3 style={{ ...serif, margin: '10px 0 0', fontSize: 28, fontWeight: 300, color: dark }}>{result.style}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => window.location.href = '/designer'} style={{ ...sans, padding: '10px 18px', background: dark, border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Open in Designer →</button>
                    <button style={{ ...sans, padding: '10px 14px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>Save</button>
                  </div>
                </div>
                <p style={{ ...sans, margin: 0, fontSize: 13, color: stone, lineHeight: 1.85, fontWeight: 300 }}>{result.desc}</p>
              </div>

              {/* Palette */}
              <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '24px 32px' }}>
                <p style={{ ...sans, margin: '0 0 16px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Colour Palette</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {result.palette.map((c, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: 52, background: c, border: `1px solid ${border}`, marginBottom: 8 }} />
                      <p style={{ ...sans, margin: '0 0 2px', fontSize: 10, fontWeight: 500, color: dark }}>{result.palette_names[i]}</p>
                      <p style={{ margin: 0, fontSize: 9, color: '#a8a29e', fontFamily: 'monospace' }}>{c}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOQ */}
              <div style={{ background: '#fff', border: `1px solid ${border}`, overflow: 'hidden' }}>
                <div style={{ padding: '20px 32px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ ...sans, margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Bill of Quantities</p>
                  <span style={{ ...sans, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>{result.items.length} items</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: light }}>
                      {['Item', 'Qty', 'Unit Price', 'Total'].map((h, j) => (
                        <th key={h} style={{ ...sans, padding: '11px 20px', textAlign: j === 0 ? 'left' : 'right', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e', borderBottom: `1px solid ${border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ ...sans, padding: '13px 20px', fontSize: 13, color: dark, fontWeight: 400 }}>{item.name}</td>
                        <td style={{ ...sans, padding: '13px 20px', fontSize: 12, color: stone, textAlign: 'right', fontWeight: 300 }}>{item.qty}</td>
                        <td style={{ ...sans, padding: '13px 20px', fontSize: 12, color: stone, textAlign: 'right', fontWeight: 300 }}>₹{item.unit.toLocaleString()}</td>
                        <td style={{ ...sans, padding: '13px 20px', fontSize: 13, color: dark, textAlign: 'right', fontWeight: 500 }}>₹{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr style={{ background: light }}>
                      <td colSpan={3} style={{ ...sans, padding: '16px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone }}>Total Investment</td>
                      <td style={{ ...serif, padding: '16px 20px', fontSize: 28, fontWeight: 300, color: gold, textAlign: 'right' }}>₹{total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
