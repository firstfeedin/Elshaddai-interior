import { useState, useRef, useCallback, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'

const FloorPlanEditor = lazy(() => import('../../features/designer/FloorPlanEditor'))
const BabylonDesigner = lazy(() => import('../../features/designer/BabylonDesigner'))

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const C = {
  bg:     '#0f1117',
  panel:  '#1a1f2e',
  panel2: '#1e2538',
  border: '#252c3f',
  gold:   '#c9a227',
  text:   '#e2e8f0',
  muted:  '#7a8499',
  accent: '#2563eb',
}

const ROOM_TEMPLATES = [
  { id:'living',   label:'Living Room',  icon:'🛋',  area:'300–500 sq ft', color:'#3b82f6' },
  { id:'bedroom',  label:'Bedroom',      icon:'🛏',  area:'150–250 sq ft', color:'#8b5cf6' },
  { id:'kitchen',  label:'Kitchen',      icon:'🍳',  area:'100–200 sq ft', color:'#f59e0b' },
  { id:'bathroom', label:'Bathroom',     icon:'🚿',  area:'60–100 sq ft',  color:'#06b6d4' },
  { id:'office',   label:'Home Office',  icon:'💻',  area:'100–200 sq ft', color:'#10b981' },
  { id:'dining',   label:'Dining Room',  icon:'🍽',  area:'120–200 sq ft', color:'#ef4444' },
  { id:'pooja',    label:'Pooja Room',   icon:'🪔',  area:'40–80 sq ft',   color:'#f97316' },
  { id:'kids',     label:'Kids Room',    icon:'🧸',  area:'120–200 sq ft', color:'#ec4899' },
]

const AI_TEMPLATES = [
  { id:'nordic',    label:'Nordic Natural',    style:'Scandinavian',   img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=70', rooms:'Bedroom' },
  { id:'modern',    label:'Modern Luxury',     style:'Contemporary',   img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=70', rooms:'Living Room' },
  { id:'japandi',   label:'Japandi Calm',      style:'Japandi',        img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=400&q=70', rooms:'Living Room' },
  { id:'industrial',label:'Industrial Loft',   style:'Industrial',     img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=70', rooms:'Living Room' },
  { id:'boho',      label:'Bohemian Bliss',    style:'Bohemian',       img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=70', rooms:'Bedroom' },
  { id:'vastu',     label:'Vastu Modern',      style:'Traditional',    img:'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=400&q=70', rooms:'Whole Home' },
  { id:'luxury',    label:'Royal Luxury',      style:'Art Deco',       img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70', rooms:'Living Room' },
  { id:'minimal',   label:'Minimal White',     style:'Minimalist',     img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=70', rooms:'Bedroom' },
]

const FURNITURE_CATS = [
  { id:'seating',   label:'Seating',    icon:'🛋' },
  { id:'bedroom',   label:'Bedroom',    icon:'🛏' },
  { id:'dining',    label:'Dining',     icon:'🍽' },
  { id:'storage',   label:'Storage',    icon:'🗄' },
  { id:'lighting',  label:'Lighting',   icon:'💡' },
  { id:'decor',     label:'Decor',      icon:'🏺' },
  { id:'kitchen',   label:'Kitchen',    icon:'🍳' },
  { id:'outdoor',   label:'Outdoor',    icon:'🌿' },
]

const RENDER_STYLES = ['Photorealistic','Watercolor','Sketch','Blueprint','Night Mode']
const RESOLUTIONS   = ['HD (720p)','Full HD (1080p)','4K (2160p)','8K']
const LIGHTINGS     = ['Daylight','Soft Afternoon','Golden Hour','Evening','Night']
const CAMERAS       = ['Normal','Panorama','Aerial','Top View']

async function analyzeFloorPlan(base64, mimeType) {
  if (!GEMINI_KEY) return null
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Analyze this 2D floor plan image. Identify all rooms, estimate each room\'s approximate area in sq ft, and suggest ideal furniture for each room. Respond ONLY with valid JSON (no markdown, no extra text): {"rooms":[{"name":"Living Room","area":300,"furniture":["Sofa","Coffee Table","TV Unit"]}],"totalArea":1200,"style":"Modern","suggestions":["Add statement lighting","Use light colors"],"estimatedCost":"₹8–12 Lakhs"}' },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
        })
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch { return null }
}

function TopBar({ step, setStep, mode, setMode, onSave, onExport }) {
  const navigate = useNavigate()
  const steps = [
    { id:1, label:'Draw',     icon:'✏️' },
    { id:2, label:'Decorate', icon:'🎨' },
    { id:3, label:'Render',   icon:'✨' },
  ]
  return (
    <div style={{ height:52, background:C.panel, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0, zIndex:100, position:'relative' }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginRight:8, flexShrink:0 }}>
        <div style={{ width:30, height:30, background:C.gold, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/></svg>
        </div>
        <div>
          <div style={{ color:'#fff', fontWeight:700, fontSize:13, lineHeight:1 }}>El Shaddai</div>
          <div style={{ color:C.gold, fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase' }}>Design Studio</div>
        </div>
      </div>

      <div style={{ width:1, height:28, background:C.border, marginRight:4 }} />

      {/* Step tabs */}
      <div style={{ display:'flex', gap:2 }}>
        {steps.map(s => (
          <button key={s.id} onClick={() => setStep(s.id)} style={{
            display:'flex', alignItems:'center', gap:6, padding:'5px 14px',
            background: step===s.id ? C.gold : 'transparent',
            color: step===s.id ? '#000' : C.muted,
            border:'none', cursor:'pointer', borderRadius:4, fontSize:12, fontWeight:700,
            transition:'all 0.15s',
          }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {step === 2 && (
        <>
          <div style={{ width:1, height:28, background:C.border }} />
          <div style={{ display:'flex', background:C.bg, borderRadius:6, padding:2, gap:1 }}>
            {[['2D','Floor Plan'],['3D','Room View']].map(([id,lb]) => (
              <button key={id} onClick={() => setMode(id.toLowerCase())} style={{
                padding:'4px 12px', background: mode===id.toLowerCase() ? '#fff' : 'transparent',
                color: mode===id.toLowerCase() ? '#000' : C.muted,
                border:'none', cursor:'pointer', borderRadius:4, fontSize:11, fontWeight:700,
              }}>{id} {lb}</button>
            ))}
          </div>
        </>
      )}

      <div style={{ flex:1 }} />

      {/* Toolbar */}
      {[
        { icon:'↩', tip:'Undo' }, { icon:'↪', tip:'Redo' },
      ].map(({ icon, tip }) => (
        <button key={tip} title={tip} style={{ width:30, height:30, background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:4, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</button>
      ))}

      <div style={{ width:1, height:28, background:C.border }} />

      <button onClick={onSave} style={{ padding:'6px 16px', background:'transparent', border:`1px solid ${C.border}`, color:C.text, borderRadius:4, cursor:'pointer', fontSize:11, fontWeight:600 }}>
        💾 Save
      </button>
      <button onClick={onExport} style={{ padding:'6px 16px', background:C.gold, border:'none', color:'#000', borderRadius:4, cursor:'pointer', fontSize:11, fontWeight:700 }}>
        ⬆ Export
      </button>
      <button onClick={() => navigate('/')} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:4, cursor:'pointer', fontSize:11 }}>
        ✕ Close
      </button>
    </div>
  )
}

/* ─── Step 1: Draw Panel ─── */
function DrawPanel({ onSelectRoom, uploadedPlan, onUpload, aiAnalysis, analyzing }) {
  const fileRef = useRef()
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Upload floor plan */}
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Upload 2D Floor Plan</p>
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border:`2px dashed ${uploadedPlan ? C.gold : C.border}`, borderRadius:8, padding:'20px 12px', textAlign:'center', cursor:'pointer', background: uploadedPlan ? 'rgba(201,162,39,0.05)' : C.bg, transition:'all 0.2s' }}>
          {uploadedPlan ? (
            <>
              <img src={uploadedPlan} alt="plan" style={{ width:'100%', maxHeight:120, objectFit:'contain', borderRadius:4, marginBottom:8 }} />
              <p style={{ color:C.gold, fontSize:10, margin:0, fontWeight:600 }}>✓ Plan uploaded</p>
            </>
          ) : (
            <>
              <div style={{ fontSize:28, marginBottom:8 }}>📐</div>
              <p style={{ color:C.text, fontSize:11, margin:'0 0 4px', fontWeight:600 }}>Upload Floor Plan</p>
              <p style={{ color:C.muted, fontSize:9, margin:0 }}>JPG, PNG, PDF · AI will analyze it</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onUpload} />
        {analyzing && (
          <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(201,162,39,0.1)', borderRadius:6 }}>
            <div style={{ width:14, height:14, border:`2px solid ${C.gold}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }} />
            <p style={{ color:C.gold, fontSize:10, margin:0, fontWeight:600 }}>AI analyzing floor plan…</p>
          </div>
        )}
      </div>

      {/* AI Analysis result */}
      {aiAnalysis && (
        <div style={{ background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:8, padding:12 }}>
          <p style={{ color:'#60a5fa', fontSize:10, fontWeight:700, margin:'0 0 8px', letterSpacing:'0.1em' }}>🤖 AI ANALYSIS</p>
          <p style={{ color:C.text, fontSize:11, margin:'0 0 6px' }}>Total Area: <strong>{aiAnalysis.totalArea} sq ft</strong></p>
          <p style={{ color:C.text, fontSize:11, margin:'0 0 6px' }}>Style: <strong>{aiAnalysis.style}</strong></p>
          <p style={{ color:C.text, fontSize:11, margin:'0 0 8px' }}>Est. Cost: <strong>{aiAnalysis.estimatedCost}</strong></p>
          <p style={{ color:C.muted, fontSize:9, fontWeight:700, textTransform:'uppercase', margin:'0 0 6px' }}>Rooms Detected</p>
          {aiAnalysis.rooms?.map((r, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ color:C.text, fontSize:10 }}>{r.name}</span>
              <span style={{ color:C.muted, fontSize:10 }}>{r.area} sq ft</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Start From Room Type</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
          {ROOM_TEMPLATES.map(r => (
            <button key={r.id} onClick={() => onSelectRoom(r)} style={{
              padding:'10px 6px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
              cursor:'pointer', textAlign:'center', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.background = `${r.color}10` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg }}>
              <span style={{ fontSize:18 }}>{r.icon}</span>
              <span style={{ color:C.text, fontSize:9, fontWeight:600 }}>{r.label}</span>
              <span style={{ color:C.muted, fontSize:8 }}>{r.area}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Drawing Tools</p>
        {[
          { icon:'⬜', label:'Wall' }, { icon:'🚪', label:'Door' },
          { icon:'🪟', label:'Window' }, { icon:'⬛', label:'Room' },
          { icon:'📐', label:'Measure' }, { icon:'🗑', label:'Erase' },
        ].map(t => (
          <button key={t.label} style={{
            width:'100%', display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
            background:'transparent', border:'none', color:C.text, cursor:'pointer', borderRadius:4, fontSize:11, marginBottom:2,
          }}
            onMouseEnter={e => e.currentTarget.style.background = C.border}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize:14 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Step 2: Decorate Panel ─── */
function DecoratePanel({ templateScope, setTemplateScope, onApplyTemplate, activeCat, setActiveCat }) {
  const [search, setSearch] = useState('')
  const filtered = AI_TEMPLATES.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.style.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:14 }}>
      {/* AI Decor Templates */}
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>AI Decor</p>
        <div style={{ display:'flex', gap:4, marginBottom:8 }}>
          {['Single Room','Whole House'].map(s => (
            <button key={s} onClick={() => setTemplateScope(s)} style={{
              flex:1, padding:'5px 4px', background: templateScope===s ? C.gold : C.bg,
              color: templateScope===s ? '#000' : C.muted, border:`1px solid ${templateScope===s ? C.gold : C.border}`,
              borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:700,
            }}>{s}</button>
          ))}
        </div>
        <input
          placeholder="Search styles…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'7px 10px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:4, color:C.text, fontSize:11, outline:'none', boxSizing:'border-box', marginBottom:8 }} />
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ position:'relative', borderRadius:6, overflow:'hidden', cursor:'pointer', border:`1px solid ${C.border}` }}
              onClick={() => onApplyTemplate(t)}>
              <img src={t.img} alt={t.label} style={{ width:'100%', height:80, objectFit:'cover', display:'block' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'6px 8px' }}>
                <p style={{ color:'#fff', fontSize:10, fontWeight:700, margin:0 }}>{t.label}</p>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:9, margin:0 }}>{t.style} · {t.rooms}</p>
              </div>
              <div style={{ position:'absolute', top:6, right:6, padding:'2px 6px', background:C.gold, borderRadius:3 }}>
                <span style={{ fontSize:8, fontWeight:700, color:'#000' }}>APPLY</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Furniture Categories */}
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Furniture & Decor</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {FURNITURE_CATS.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
              padding:'8px 6px', background: activeCat===c.id ? C.gold : C.bg,
              color: activeCat===c.id ? '#000' : C.text, border:`1px solid ${activeCat===c.id ? C.gold : C.border}`,
              borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:600, display:'flex', alignItems:'center', gap:4,
            }}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Step 3: Render Panel ─── */
function RenderPanel({ settings, setSettings, onRender, rendering, renderProgress }) {
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:14 }}>
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Camera</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {CAMERAS.map(c => (
            <button key={c} onClick={() => setSettings(s => ({ ...s, camera:c }))} style={{
              padding:'7px 4px', background: settings.camera===c ? C.gold : C.bg,
              color: settings.camera===c ? '#000' : C.text, border:`1px solid ${settings.camera===c ? C.gold : C.border}`,
              borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:600,
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Render Style</p>
        {RENDER_STYLES.map(s => (
          <button key={s} onClick={() => setSettings(r => ({ ...r, style:s }))} style={{
            width:'100%', display:'flex', alignItems:'center', gap:8, padding:'7px 10px', marginBottom:2,
            background: settings.style===s ? 'rgba(201,162,39,0.15)' : 'transparent',
            border: settings.style===s ? `1px solid ${C.gold}` : '1px solid transparent',
            color: settings.style===s ? C.gold : C.text, borderRadius:4, cursor:'pointer', fontSize:11,
          }}>
            {settings.style===s ? '●' : '○'} {s}
          </button>
        ))}
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Resolution</p>
        {RESOLUTIONS.map(r => (
          <button key={r} onClick={() => setSettings(s => ({ ...s, resolution:r }))} style={{
            width:'100%', display:'flex', alignItems:'center', gap:8, padding:'7px 10px', marginBottom:2,
            background: settings.resolution===r ? 'rgba(201,162,39,0.15)' : 'transparent',
            border: settings.resolution===r ? `1px solid ${C.gold}` : '1px solid transparent',
            color: settings.resolution===r ? C.gold : C.text, borderRadius:4, cursor:'pointer', fontSize:11,
          }}>
            {settings.resolution===r ? '●' : '○'} {r}
          </button>
        ))}
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Lighting</p>
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          {LIGHTINGS.map(l => (
            <button key={l} onClick={() => setSettings(s => ({ ...s, lighting:l }))} style={{
              padding:'7px 10px', background: settings.lighting===l ? 'rgba(201,162,39,0.15)' : 'transparent',
              border: settings.lighting===l ? `1px solid ${C.gold}` : '1px solid transparent',
              color: settings.lighting===l ? C.gold : C.text, borderRadius:4, cursor:'pointer', fontSize:11, textAlign:'left',
            }}>
              {settings.lighting===l ? '●' : '○'} {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        {rendering ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ width:48, height:48, border:`3px solid rgba(201,162,39,0.3)`, borderTopColor:C.gold, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
            <p style={{ color:C.gold, fontSize:12, fontWeight:600, margin:'0 0 4px' }}>Rendering…</p>
            <div style={{ background:C.bg, borderRadius:4, height:4, margin:'0 auto', width:'80%' }}>
              <div style={{ background:C.gold, height:'100%', borderRadius:4, width:`${renderProgress}%`, transition:'width 0.3s' }} />
            </div>
            <p style={{ color:C.muted, fontSize:10, margin:'6px 0 0' }}>{renderProgress}%</p>
          </div>
        ) : (
          <button onClick={onRender} style={{
            width:'100%', padding:'12px', background:C.gold, border:'none',
            color:'#000', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700, marginBottom:8,
          }}>
            ✨ Render Now
          </button>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:8 }}>
          {[{ label:'Export Image', icon:'🖼' }, { label:'Construction Drawings', icon:'📐' }, { label:'Bill of Quantities', icon:'📋' }, { label:'Share Design', icon:'🔗' }].map(a => (
            <button key={a.label} style={{
              padding:'8px 6px', background:C.bg, border:`1px solid ${C.border}`,
              color:C.text, borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:600,
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            }}>
              <span style={{ fontSize:16 }}>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent renders gallery */}
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Recent Renders</p>
        {[
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=200&q=60',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=200&q=60',
          'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=200&q=60',
        ].map((img, i) => (
          <img key={i} src={img} alt={`render ${i}`} style={{ width:'100%', borderRadius:4, marginBottom:6, display:'block', cursor:'pointer' }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Main Canvas Area ─── */
function MainCanvas({ step, mode, floorPlanData, uploadedPlan, selectedRoom, appliedTemplate }) {
  const navigate = useNavigate()

  if (step === 1) {
    return (
      <div style={{ flex:1, background:C.bg, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Embedded floor plan editor */}
        <div style={{ flex:1, overflow:'hidden' }}>
          <Suspense fallback={<Loading label="Loading Floor Plan Editor…" />}>
            <FloorPlanEditor onExportTo3D={(data) => { console.log('Floor plan data:', data) }} />
          </Suspense>
        </div>
        {/* Upload overlay if image uploaded */}
        {uploadedPlan && (
          <div style={{ position:'absolute', top:12, right:12, width:200, background:'rgba(26,31,46,0.9)', border:`1px solid ${C.gold}`, borderRadius:8, padding:8 }}>
            <p style={{ color:C.gold, fontSize:9, fontWeight:700, margin:'0 0 6px', textTransform:'uppercase' }}>📐 Reference Plan</p>
            <img src={uploadedPlan} alt="reference" style={{ width:'100%', borderRadius:4, opacity:0.8 }} />
          </div>
        )}
      </div>
    )
  }

  if (step === 2) {
    if (mode === '2d') {
      return (
        <div style={{ flex:1, background:C.bg, overflow:'hidden' }}>
          <Suspense fallback={<Loading label="Loading 2D Editor…" />}>
            <FloorPlanEditor onExportTo3D={(data) => { console.log('data:', data) }} />
          </Suspense>
        </div>
      )
    }
    return (
      <div style={{ flex:1, background:'#1a1f2e', overflow:'hidden', position:'relative' }}>
        <Suspense fallback={<Loading label="Loading 3D Engine…" sub="Babylon.js · PBR · WebGL 2" />}>
          <BabylonDesigner
            floorPlanData={floorPlanData}
            onSave={() => {}}
            onSwitch2D={() => {}}
          />
        </Suspense>
        {appliedTemplate && (
          <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.7)', border:`1px solid ${C.gold}`, borderRadius:20, padding:'6px 16px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12 }}>✨</span>
            <span style={{ color:C.gold, fontSize:11, fontWeight:600 }}>Applied: {appliedTemplate.label}</span>
          </div>
        )}
      </div>
    )
  }

  if (step === 3) {
    return (
      <div style={{ flex:1, background:'#0a0c12', overflow:'hidden', position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
        <img
          src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80"
          alt="render preview"
          style={{ width:'90%', maxHeight:'70%', objectFit:'cover', borderRadius:8, boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}
        />
        <div style={{ display:'flex', gap:8 }}>
          {['Normal','Panorama','Aerial','Top View'].map(v => (
            <button key={v} style={{ padding:'5px 14px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', borderRadius:20, cursor:'pointer', fontSize:10, fontWeight:600 }}>{v}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ padding:'8px 20px', background:C.gold, border:'none', color:'#000', borderRadius:4, cursor:'pointer', fontSize:11, fontWeight:700 }}>⬇ Download 4K</button>
          <button style={{ padding:'8px 20px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', borderRadius:4, cursor:'pointer', fontSize:11 }}>🔗 Share Link</button>
        </div>
      </div>
    )
  }
  return null
}

function Loading({ label, sub }) {
  return (
    <div style={{ height:'100%', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
      <div style={{ width:40, height:40, border:`3px solid rgba(201,162,39,0.3)`, borderTopColor:C.gold, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:C.text, fontSize:13, fontWeight:600, margin:0 }}>{label}</p>
      {sub && <p style={{ color:C.muted, fontSize:11, margin:0 }}>{sub}</p>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ─── Right Properties Panel ─── */
function RightPanel({ step, selectedRoom, appliedTemplate }) {
  if (step === 1) return (
    <div style={{ width:220, background:C.panel, borderLeft:`1px solid ${C.border}`, padding:16, overflowY:'auto' }}>
      <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 12px' }}>Layer Settings</p>
      {selectedRoom && (
        <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:12, marginBottom:12 }}>
          <p style={{ color:C.text, fontSize:12, fontWeight:700, margin:'0 0 8px' }}>{selectedRoom.icon} {selectedRoom.label}</p>
          <p style={{ color:C.muted, fontSize:10, margin:'0 0 4px' }}>Area: {selectedRoom.area}</p>
        </div>
      )}
      <div style={{ marginBottom:16 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Basic Parameters</p>
        {[['Wall Height','9\' 0"'],['Wall Thickness','0.5 in'],['Total Building','560 ft²']].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ color:C.muted, fontSize:10 }}>{k}</span>
            <span style={{ color:C.text, fontSize:10, fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Wall Settings</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ color:C.muted, fontSize:10 }}>Lock Walls</span>
          <div style={{ width:28, height:16, background:C.border, borderRadius:8, cursor:'pointer' }} />
        </div>
      </div>
    </div>
  )

  if (step === 2) return (
    <div style={{ width:220, background:C.panel, borderLeft:`1px solid ${C.border}`, padding:16, overflowY:'auto' }}>
      <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 12px' }}>Properties</p>
      {appliedTemplate && (
        <div style={{ background:'rgba(201,162,39,0.1)', border:`1px solid ${C.gold}`, borderRadius:6, padding:10, marginBottom:12 }}>
          <p style={{ color:C.gold, fontSize:10, fontWeight:700, margin:'0 0 4px' }}>Applied Template</p>
          <p style={{ color:C.text, fontSize:11, margin:0 }}>{appliedTemplate.label}</p>
          <p style={{ color:C.muted, fontSize:9, margin:'2px 0 0' }}>{appliedTemplate.style}</p>
        </div>
      )}
      <div style={{ marginBottom:14 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Materials</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {['#8B7355','#F5F0E8','#C0C0C0','#4A3728','#2C5F2E','#1B2A4A'].map(color => (
            <button key={color} style={{ width:28, height:28, background:color, borderRadius:4, border:`2px solid ${C.border}`, cursor:'pointer' }} />
          ))}
        </div>
      </div>
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Room Stats</p>
        {[['Total Area','560 ft²'],['Furniture','12 items'],['Est. Cost','₹8.4L']].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
            <span style={{ color:C.muted, fontSize:10 }}>{k}</span>
            <span style={{ color:C.text, fontSize:10, fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  if (step === 3) return (
    <div style={{ width:220, background:C.panel, borderLeft:`1px solid ${C.border}`, padding:16, overflowY:'auto' }}>
      <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 12px' }}>Camera Settings</p>
      {[['Clipping','Off'],['Camera Calibration','Off'],['FOV','70°'],['Height','2\' 7"'],['Pitch Angle','0°']].map(([k,v]) => (
        <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ color:C.muted, fontSize:10 }}>{k}</span>
          <span style={{ color:C.text, fontSize:10, fontWeight:600 }}>{v}</span>
        </div>
      ))}
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:4 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Views</p>
        {['Front','Left','Right','Top'].map(v => (
          <button key={v} style={{ width:'100%', padding:'6px 10px', background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:4, marginBottom:4, cursor:'pointer', fontSize:10, textAlign:'left' }}>{v} View</button>
        ))}
      </div>
    </div>
  )

  return null
}

/* ─── Main Export ─── */
export default function StudioPage() {
  const [step, setStep]                     = useState(1)
  const [mode, setMode]                     = useState('3d')
  const [templateScope, setTemplateScope]   = useState('Single Room')
  const [appliedTemplate, setAppliedTemplate] = useState(null)
  const [activeCat, setActiveCat]           = useState('seating')
  const [selectedRoom, setSelectedRoom]     = useState(null)
  const [uploadedPlan, setUploadedPlan]     = useState(null)
  const [aiAnalysis, setAiAnalysis]         = useState(null)
  const [analyzing, setAnalyzing]           = useState(false)
  const [floorPlanData, setFloorPlanData]   = useState(null)
  const [rendering, setRendering]           = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [renderSettings, setRenderSettings] = useState({
    camera:'Normal', style:'Photorealistic', resolution:'4K (2160p)', lighting:'Daylight',
  })

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      setUploadedPlan(dataUrl)
      setAnalyzing(true)
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type || 'image/jpeg'
      const result = await analyzeFloorPlan(base64, mimeType)
      setAiAnalysis(result || {
        rooms: [{ name:'Living Room', area:320 }, { name:'Bedroom', area:200 }, { name:'Kitchen', area:150 }, { name:'Bathroom', area:80 }],
        totalArea: 1100,
        style: 'Modern Indian',
        estimatedCost: '₹8–12 Lakhs',
        suggestions: ['Use light colors to make space feel larger', 'Add statement lighting'],
      })
      setAnalyzing(false)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRender = useCallback(() => {
    setRendering(true)
    setRenderProgress(0)
    const interval = setInterval(() => {
      setRenderProgress(p => {
        if (p >= 100) { clearInterval(interval); setRendering(false); return 100 }
        return p + 3
      })
    }, 150)
  }, [])

  const handleApplyTemplate = useCallback((t) => {
    setAppliedTemplate(t)
    setMode('3d')
  }, [])

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', background:C.bg, fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <TopBar
        step={step} setStep={setStep}
        mode={mode} setMode={setMode}
        onSave={() => alert('Design saved!')}
        onExport={() => alert('Exporting…')}
      />

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Left Sidebar */}
        <div style={{ width:260, background:C.panel, borderRight:`1px solid ${C.border}`, flexShrink:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {step === 1 && (
            <DrawPanel
              onSelectRoom={r => { setSelectedRoom(r); setStep(2) }}
              uploadedPlan={uploadedPlan}
              onUpload={handleUpload}
              aiAnalysis={aiAnalysis}
              analyzing={analyzing}
            />
          )}
          {step === 2 && (
            <DecoratePanel
              templateScope={templateScope}
              setTemplateScope={setTemplateScope}
              onApplyTemplate={handleApplyTemplate}
              activeCat={activeCat}
              setActiveCat={setActiveCat}
            />
          )}
          {step === 3 && (
            <RenderPanel
              settings={renderSettings}
              setSettings={setRenderSettings}
              onRender={handleRender}
              rendering={rendering}
              renderProgress={renderProgress}
            />
          )}
        </div>

        {/* Main Canvas */}
        <MainCanvas
          step={step}
          mode={mode}
          floorPlanData={floorPlanData}
          uploadedPlan={uploadedPlan}
          selectedRoom={selectedRoom}
          appliedTemplate={appliedTemplate}
        />

        {/* Right Panel */}
        <RightPanel
          step={step}
          selectedRoom={selectedRoom}
          appliedTemplate={appliedTemplate}
        />
      </div>

      {/* Bottom Status Bar */}
      <div style={{ height:28, background:C.panel, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 16px', gap:16 }}>
        {[
          { label:'Walls', val:'8' },
          { label:'Rooms', val: aiAnalysis ? aiAnalysis.rooms?.length || 4 : '4' },
          { label:'Area', val: aiAnalysis ? `${aiAnalysis.totalArea} ft²` : '560 ft²' },
          { label:'Furniture', val:'12' },
        ].map(({ label, val }) => (
          <div key={label} style={{ display:'flex', gap:4 }}>
            <span style={{ color:C.muted, fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}:</span>
            <span style={{ color:C.text, fontSize:9, fontWeight:600 }}>{val}</span>
          </div>
        ))}
        <div style={{ flex:1 }} />
        <span style={{ color:C.muted, fontSize:9 }}>Step {step}/3 · {['Draw Floor Plan','Decorate Your Space','Render & Export'][step-1]}</span>
      </div>
    </div>
  )
}
