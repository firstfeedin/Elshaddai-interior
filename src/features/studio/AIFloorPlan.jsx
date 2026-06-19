/**
 * AIFloorPlan — text-to-floor-plan using Gemini API.
 * User describes a room in natural language → Gemini returns wall coordinates
 * as JSON → walls are injected into the 2D canvas.
 */
import { useState } from 'react'

const GEMINI_KEY   = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.0-flash'
const SCALE        = 60  // px per metre

const T = {
  bg:'#08070a', panel:'#0f0e14', panel2:'#16141d', border:'rgba(255,255,255,0.07)',
  gold:'#c9a227', goldL:'#e8c84e', text:'#ede9e3', muted:'#6b6580', red:'#ef4444',
  F:"'DM Sans',system-ui,sans-serif", S:"'Cormorant Garamond',serif",
}

const EXAMPLES = [
  '20×15 ft living room with a bay window on the north wall and double door entrance',
  '12×10 ft bedroom with attached bathroom, two windows, walk-in closet',
  'Open-plan kitchen-dining 25×18 ft, island counter, 4 windows, sliding glass door',
  'Home office 10×12 ft with floor-to-ceiling bookshelf wall, one window',
  'L-shaped apartment — living room 18×14 ft + bedroom 12×10 ft connected',
]

const SYSTEM_PROMPT = `You are an architectural assistant. Given a room description, output ONLY a valid JSON array of wall segments.

Rules:
- Each wall: { "x1":number, "y1":number, "x2":number, "y2":number, "type":"wall"|"door"|"window" }
- Coordinates are in pixels where 1 metre = 60 pixels
- Origin (0,0) is top-left
- Place room starting at approximately (60, 60)
- Doors: 90cm wide (54px), type="door"
- Windows: 100-150cm wide (60-90px), type="window"
- Create proper closed room with corners
- Keep room within 800×600 px canvas
- Output ONLY raw JSON array, no markdown, no explanation`

async function generateFloorPlan(description) {
  if (!GEMINI_KEY) throw new Error('VITE_GEMINI_API_KEY not set')

  const prompt = `Room description: "${description}"\n\nGenerate the floor plan wall coordinates as JSON.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role:'user', parts:[{ text: SYSTEM_PROMPT }] },
          { role:'model', parts:[{ text:'Understood. I will output only a raw JSON array of wall segments.' }] },
          { role:'user', parts:[{ text: prompt }] },
        ],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Gemini API error')

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  // Strip markdown code fences if present
  const clean = raw.replace(/```json?\n?/g,'').replace(/```/g,'').trim()
  const walls = JSON.parse(clean)

  if (!Array.isArray(walls)) throw new Error('Invalid response format')

  // Assign unique IDs
  return walls.map((w, i) => ({
    id: `ai_${Date.now()}_${i}`,
    x1: Math.round(w.x1),
    y1: Math.round(w.y1),
    x2: Math.round(w.x2),
    y2: Math.round(w.y2),
    type: w.type || 'wall',
  }))
}

export default function AIFloorPlan({ onGenerate, onClose }) {
  const [prompt,   setPrompt]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [preview,  setPreview]  = useState(null)   // generated walls for preview

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true); setError(''); setPreview(null)
    try {
      const walls = await generateFloorPlan(prompt)
      setPreview(walls)
    } catch (e) {
      setError(e.message || 'Generation failed. Try rephrasing.')
    } finally { setLoading(false) }
  }

  function handleApply() {
    if (preview) { onGenerate(preview); onClose() }
  }

  // Simple SVG preview of generated walls
  function WallPreview({ walls }) {
    if (!walls?.length) return null
    const xs = walls.flatMap(w=>[w.x1,w.x2])
    const ys = walls.flatMap(w=>[w.y1,w.y2])
    const minX = Math.min(...xs), minY = Math.min(...ys)
    const maxX = Math.max(...xs), maxY = Math.max(...ys)
    const W = maxX - minX + 40, H = maxY - minY + 40
    const scale = Math.min(360/W, 200/H, 1)
    return (
      <svg width={W*scale} height={H*scale} viewBox={`${minX-20} ${minY-20} ${W} ${H}`}
        style={{ display:'block', margin:'0 auto' }}>
        <rect x={minX-20} y={minY-20} width={W} height={H} fill="#0f0e14"/>
        {walls.map(w=>(
          <line key={w.id} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
            stroke={w.type==='door'?'#c9a227':w.type==='window'?'#3b82f6':'#ede9e3'}
            strokeWidth={w.type==='wall'?8:4} strokeLinecap="round" />
        ))}
      </svg>
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, fontFamily:T.F }}>
      <div style={{ background:T.panel2, border:`1px solid rgba(201,162,39,0.3)`, width:540, maxWidth:'96vw', maxHeight:'92vh', overflowY:'auto' }}>
        {/* Header */}
        <div style={{ padding:'18px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ color:T.gold, fontSize:20 }}>✦</span>
            <div>
              <p style={{ fontFamily:T.S, fontSize:18, color:T.text, margin:0 }}>AI Floor Plan Generator</p>
              <p style={{ fontFamily:T.F, fontSize:9, color:T.muted, margin:'3px 0 0', letterSpacing:'0.16em', textTransform:'uppercase' }}>Powered by Gemini 2.0</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
          {/* Prompt */}
          <div>
            <label style={{ fontSize:9, color:T.muted, letterSpacing:'0.18em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Describe Your Room</label>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={4}
              placeholder="e.g. 20×15 ft living room with a large window on the north wall, double door on the south, open towards kitchen..."
              style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`, color:T.text,
                padding:'10px 12px', fontFamily:T.F, fontSize:12, outline:'none', resize:'vertical', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border} />
          </div>

          {/* Example prompts */}
          <div>
            <p style={{ fontSize:9, color:T.muted, letterSpacing:'0.16em', textTransform:'uppercase', margin:'0 0 8px' }}>Quick Examples</p>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {EXAMPLES.map((ex,i)=>(
                <button key={i} onClick={()=>setPrompt(ex)}
                  style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}`, color:T.muted,
                    padding:'7px 12px', fontFamily:T.F, fontSize:10, textAlign:'left', cursor:'pointer', lineHeight:1.4,
                    transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.text}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted}}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Generate btn */}
          <button onClick={handleGenerate} disabled={!prompt.trim()||loading}
            style={{ padding:'13px', background:prompt.trim()&&!loading?`linear-gradient(135deg,${T.gold},${T.goldL})`:'rgba(255,255,255,0.05)',
              color:prompt.trim()&&!loading?T.bg:T.muted, border:'none', fontFamily:T.F, fontSize:11, fontWeight:800,
              letterSpacing:'0.18em', textTransform:'uppercase', cursor:prompt.trim()&&!loading?'pointer':'not-allowed' }}>
            {loading ? '✦ Generating Floor Plan…' : '✦ Generate with AI'}
          </button>

          {/* Error */}
          {error && (
            <div style={{ background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.3)`, padding:'12px 14px' }}>
              <p style={{ color:T.red, fontSize:11, margin:0 }}>⚠ {error}</p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div>
              <div style={{ background:T.panel, border:`1px solid ${T.border}`, padding:16, marginBottom:12 }}>
                <p style={{ fontFamily:T.F, fontSize:9, color:T.gold, letterSpacing:'0.18em', textTransform:'uppercase', margin:'0 0 12px' }}>
                  Preview — {preview.length} elements generated
                </p>
                <WallPreview walls={preview} />
                <div style={{ display:'flex', gap:16, marginTop:12, justifyContent:'center' }}>
                  {[['Wall','#ede9e3'],['Door','#c9a227'],['Window','#3b82f6']].map(([l,c])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:24, height:3, background:c }} />
                      <span style={{ fontFamily:T.F, fontSize:9, color:T.muted }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleGenerate}
                  style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, color:T.muted, fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer' }}>
                  ↺ Regenerate
                </button>
                <button onClick={handleApply}
                  style={{ flex:2, padding:'10px', background:`linear-gradient(135deg,${T.gold},${T.goldL})`, color:T.bg, border:'none', fontFamily:T.F, fontSize:10, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', cursor:'pointer', boxShadow:`0 4px 20px rgba(201,162,39,0.4)` }}>
                  ✓ Apply to Studio
                </button>
              </div>
            </div>
          )}

          {!GEMINI_KEY && (
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', padding:'12px 14px' }}>
              <p style={{ color:T.red, fontSize:10, margin:0 }}>
                ⚠ Add <code style={{ background:'rgba(255,255,255,0.08)', padding:'1px 5px' }}>VITE_GEMINI_API_KEY</code> to your .env file to enable AI generation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
