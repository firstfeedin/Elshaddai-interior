/**
 * DualStudio — Synchronized dual-canvas interior design studio
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  TopBar: steps (Draw|Decorate|Render) + tool belt + actions     │
 *   ├──────────────────────────────┬──────────────────────────────────┤
 *   │  2D Floor Plan               │  3D Live Extraction              │
 *   │  FloorPlanEngine             │  ThreeEngine                     │
 *   │  (HTML Canvas)               │  (React Three Fiber)             │
 *   ├──────────────────────────────┴──────────────────────────────────┤
 *   │  Status bar: wall count | area | tool hint                      │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Shared state (lifted up here):
 *   walls[]     — array of {id,x1,y1,x2,y2,type}  (px coordinates)
 *   furniture[] — array of {id,x,y,z,rotY,catalogItem}
 *   tool        — active 2D drawing tool
 *   selectedId  — selected wall ID
 *   viewMode    — 'dual' | '2d' | '3d'
 *   autoSync    — 2D changes immediately reflected in 3D
 */

import { useState, useRef, useCallback, Suspense, lazy } from 'react'

const FloorPlanEngine = lazy(() => import('./FloorPlanEngine'))
const ThreeEngine     = lazy(() => import('./ThreeEngine'))

/* ─── Design tokens ─────────────────────────────────────────────────────────── */
const T = {
  bg:     '#08070a',
  panel:  '#111018',
  panel2: '#18161f',
  border: '#2a2535',
  gold:   '#c9a227',
  goldL:  '#e8c84e',
  text:   '#ede9e3',
  muted:  '#6b6580',
  red:    '#ef4444',
  green:  '#22c55e',
  blue:   '#3b82f6',
  F:      "'DM Sans',system-ui,sans-serif",
  S:      "'Cormorant Garamond',serif",
}

/* ─── Tool definitions ──────────────────────────────────────────────────────── */
const TOOLS = [
  { id:'select', icon:'↖',  label:'Select',    tip:'Click a wall to select / move',          shortcut:'V' },
  { id:'wall',   icon:'▬',  label:'Wall',      tip:'Click → click to draw walls (Dbl to end)', shortcut:'W' },
  { id:'door',   icon:'🚪', label:'Door',      tip:'Draw a door opening along a wall',         shortcut:'D' },
  { id:'window', icon:'🪟', label:'Window',    tip:'Draw a window opening along a wall',       shortcut:'N' },
  { id:'erase',  icon:'✕',  label:'Erase',     tip:'Click a wall to delete it (Del key)',      shortcut:'E' },
  { id:'measure',icon:'📏', label:'Measure',   tip:'Click two points to measure distance',     shortcut:'M' },
]

/* ─── Render mode presets ───────────────────────────────────────────────────── */
const RENDER_PRESETS = [
  { id:'photo',  label:'Photorealistic', icon:'📷' },
  { id:'sketch', label:'Sketch',         icon:'✏️' },
  { id:'water',  label:'Watercolour',    icon:'🎨' },
  { id:'night',  label:'Night Mode',     icon:'🌙' },
]

/* ─── Small components ──────────────────────────────────────────────────────── */
function ToolBtn({ t, active, onClick }) {
  return (
    <button onClick={onClick} title={`${t.label}  [${t.shortcut}]`}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3,
        padding:'8px 12px', background:active?`${T.gold}18`:'transparent',
        border:`1px solid ${active?T.gold:T.border}`,
        color:active?T.gold:T.muted, cursor:'pointer', transition:'all 0.2s', minWidth:56 }}>
      <span style={{ fontSize:16, lineHeight:1 }}>{t.icon}</span>
      <span style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>{t.label}</span>
      <span style={{ fontFamily:T.F, fontSize:8, color:T.muted, opacity:0.6 }}>[{t.shortcut}]</span>
    </button>
  )
}

function ActionBtn({ icon, label, onClick, gold, danger }) {
  return (
    <button onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
        background: gold?T.gold : danger?'rgba(239,68,68,0.12)':'rgba(255,255,255,0.04)',
        border:`1px solid ${gold?T.gold : danger?T.red:T.border}`,
        color: gold?T.bg : danger?T.red:T.text,
        fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase',
        cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}
      onMouseEnter={e=>{if(!gold&&!danger)e.currentTarget.style.borderColor=T.gold}}
      onMouseLeave={e=>{if(!gold&&!danger)e.currentTarget.style.borderColor=T.border}}>
      <span style={{ fontSize:13 }}>{icon}</span>
      {label}
    </button>
  )
}

function Divider() {
  return <div style={{ width:1, height:28, background:T.border, margin:'0 4px', flexShrink:0 }} />
}

/* ─── DualStudio ─────────────────────────────────────────────────────────────── */
export default function DualStudio() {
  /* State */
  const [walls,      setWalls]      = useState([])
  const [furniture,  setFurniture]  = useState([])
  const [tool,       setTool]       = useState('wall')
  const [selectedId, setSelectedId] = useState(null)
  const [viewMode,   setViewMode]   = useState('dual')   // 'dual'|'2d'|'3d'
  const [autoRotate, setAutoRotate] = useState(false)
  const [renderMode, setRenderMode] = useState('photo')
  const [status,     setStatus]     = useState({ walls:0, doors:0, windows:0, totalLength:'0.0', tool:'wall' })
  const [renderResult,setRenderResult] = useState(null)
  const [rendering,  setRendering]  = useState(false)
  const [renderProg, setRenderProg] = useState(0)
  const [splitPos,   setSplitPos]   = useState(50)  // % for left panel
  const [draggingSplit, setDraggingSplit] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')

  const planRef   = useRef(null)
  const threeRef  = useRef(null)
  const splitRef  = useRef(null)

  /* Tool keyboard shortcuts */
  const handleToolKey = useCallback((e) => {
    if (e.target.tagName === 'INPUT') return
    const map = { v:'select', w:'wall', d:'door', n:'window', e:'erase', m:'measure' }
    const t = map[e.key.toLowerCase()]
    if (t) setTool(t)
  }, [])

  /* Import/export */
  function handleExportJSON() {
    const json = planRef.current?.exportJSON()
    if (!json) return
    const a = document.createElement('a')
    a.href = 'data:application/json,' + encodeURIComponent(json)
    a.download = 'floorplan.json'
    a.click()
  }

  function handleImportJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const text = await file.text()
      planRef.current?.importJSON(text)
    }
    input.click()
  }

  function handleExportPNG() {
    const url = planRef.current?.exportPNG()
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = 'floorplan.png'
    a.click()
  }

  function handleRender() {
    setRendering(true)
    setRenderProg(0)
    const interval = setInterval(() => {
      setRenderProg(p => {
        if (p >= 100) {
          clearInterval(interval)
          setRendering(false)
          const url = threeRef.current?.screenshot()
          if (url) setRenderResult(url)
          return 100
        }
        return p + Math.random() * 18
      })
    }, 140)
  }

  function handleDownloadRender() {
    if (!renderResult) return
    const a = document.createElement('a')
    a.href = renderResult
    a.download = `render_${Date.now()}.png`
    a.click()
  }

  /* Splitter drag */
  function onSplitMouseDown(e) {
    e.preventDefault()
    setDraggingSplit(true)
    const container = splitRef.current
    function onMove(ev) {
      if (!container) return
      const rect = container.getBoundingClientRect()
      const pct = Math.max(25, Math.min(75, (ev.clientX - rect.left) / rect.width * 100))
      setSplitPos(pct)
    }
    function onUp() {
      setDraggingSplit(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  /* Status bar */
  const totalArea = (() => {
    if (!walls.length) return '0'
    const xs = walls.flatMap(w=>[w.x1,w.x2])
    const ys = walls.flatMap(w=>[w.y1,w.y2])
    const W = (Math.max(...xs) - Math.min(...xs)) / 60
    const H = (Math.max(...ys) - Math.min(...ys)) / 60
    return (W * H).toFixed(1)
  })()

  const activeTool = TOOLS.find(t2 => t2.id === tool)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:T.bg, fontFamily:T.F, userSelect:draggingSplit?'none':'auto' }}
      onKeyDown={handleToolKey} tabIndex={-1}>

      {/* ═══ TOP BAR ═══════════════════════════════════════════════════════ */}
      <div style={{ background:T.panel, borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>

        {/* Row 1: title + view mode + global actions */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 16px', height:44, gap:12, borderBottom:`1px solid ${T.border}` }}>
          {/* Logo mark */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ width:24, height:24, background:T.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>◈</div>
            <span style={{ fontFamily:T.S, fontSize:15, color:T.text, fontWeight:400, letterSpacing:'0.06em' }}>Design Studio</span>
          </div>

          <Divider />

          {/* View mode toggle */}
          <div style={{ display:'flex', gap:2 }}>
            {[['dual','⊞ Dual'],['2d','⬛ 2D'],['3d','◈ 3D']].map(([m,l])=>(
              <button key={m} onClick={()=>setViewMode(m)}
                style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase',
                  padding:'5px 12px', background:viewMode===m?T.gold:'transparent',
                  border:`1px solid ${viewMode===m?T.gold:T.border}`,
                  color:viewMode===m?T.bg:T.muted, cursor:'pointer', transition:'all 0.15s' }}>
                {l}
              </button>
            ))}
          </div>

          <Divider />

          {/* Actions */}
          <ActionBtn icon="↩" label="Undo" onClick={()=>planRef.current?.undo()} />
          <ActionBtn icon="↪" label="Redo" onClick={()=>planRef.current?.redo()} />

          <Divider />

          <ActionBtn icon="📂" label="Import" onClick={handleImportJSON} />
          <ActionBtn icon="💾" label="Export" onClick={handleExportJSON} />
          <ActionBtn icon="🖼" label="PNG"    onClick={handleExportPNG} />

          <Divider />

          <ActionBtn icon="🗑" label="Clear All"
            danger onClick={()=>{ planRef.current?.clearAll(); setWalls([]); setSelectedId(null) }} />

          <div style={{ flex:1 }} />

          {/* 3D controls */}
          <button onClick={()=>setAutoRotate(v=>!v)}
            style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase',
              padding:'5px 12px', background:autoRotate?`${T.gold}22`:'transparent',
              border:`1px solid ${autoRotate?T.gold:T.border}`, color:autoRotate?T.gold:T.muted, cursor:'pointer' }}>
            {autoRotate?'⏹ Stop Rotate':'▶ Auto-Rotate'}
          </button>

          <ActionBtn icon="📷" label="Render" gold onClick={handleRender} />
        </div>

        {/* Row 2: tool belt */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 16px', gap:4, height:56, overflowX:'auto' }}>
          <span style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginRight:8, flexShrink:0 }}>Tools</span>
          {TOOLS.map(t2 => (
            <ToolBtn key={t2.id} t={t2} active={tool===t2.id} onClick={()=>setTool(t2.id)} />
          ))}

          <Divider />

          {/* Render presets */}
          <span style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginLeft:4, marginRight:8, flexShrink:0 }}>Render Mode</span>
          {RENDER_PRESETS.map(p => (
            <button key={p.id} onClick={()=>setRenderMode(p.id)}
              style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                padding:'6px 10px', background:renderMode===p.id?`${T.gold}20`:'transparent',
                border:`1px solid ${renderMode===p.id?T.gold:T.border}`,
                color:renderMode===p.id?T.gold:T.muted, cursor:'pointer', transition:'all 0.15s',
                display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              <span>{p.icon}</span>
              <span className="mobile-hide">{p.label}</span>
            </button>
          ))}

          <div style={{ flex:1 }} />

          {/* Furniture catalog toggle */}
          <button onClick={()=>setShowCatalog(v=>!v)}
            style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase',
              padding:'6px 14px', background:showCatalog?`${T.gold}20`:'transparent',
              border:`1px solid ${showCatalog?T.gold:T.border}`,
              color:showCatalog?T.gold:T.muted, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            🛋 Furniture Catalog
          </button>
        </div>
      </div>

      {/* ═══ MAIN CANVAS AREA ══════════════════════════════════════════════ */}
      <div ref={splitRef} style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>

        {/* ── 2D Panel ─────────────────────────────────────────────────── */}
        {(viewMode==='dual' || viewMode==='2d') && (
          <div style={{
            width: viewMode==='2d'?'100%':`${splitPos}%`,
            height:'100%', position:'relative', flexShrink:0,
            borderRight: viewMode==='dual'?`1px solid ${T.border}`:'none',
          }}>
            {/* Panel header */}
            <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, background:'rgba(8,7,10,0.85)', backdropFilter:'blur(8px)',
              padding:'6px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:10, color:T.gold, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase' }}>⬛ 2D Floor Plan</span>
              <span style={{ fontSize:9, color:T.muted, letterSpacing:'0.08em' }}>· Draw walls in 2D · Alt+drag to pan · Scroll to zoom</span>
              <div style={{ flex:1 }} />
              <span style={{ fontSize:9, color:T.muted }}>
                {status.walls} walls · {status.doors} doors · {status.windows} windows
              </span>
            </div>
            <div style={{ position:'absolute', inset:0, paddingTop:30 }}>
              <Suspense fallback={<EngineLoader label="Loading 2D Engine…" />}>
                <FloorPlanEngine
                  ref={planRef}
                  tool={tool}
                  walls={walls}
                  onWallsChange={setWalls}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onStatusChange={setStatus}
                />
              </Suspense>
            </div>

            {/* Tool tip bar */}
            {activeTool && (
              <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'6px 14px', background:'rgba(8,7,10,0.85)', backdropFilter:'blur(8px)', borderTop:`1px solid ${T.border}` }}>
                <span style={{ fontFamily:T.F, fontSize:10, color:T.muted }}>{activeTool.icon} <strong style={{ color:T.text }}>{activeTool.label}</strong> — {activeTool.tip}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Splitter handle ──────────────────────────────────────────── */}
        {viewMode==='dual' && (
          <div onMouseDown={onSplitMouseDown}
            style={{ width:6, background:T.border, cursor:'col-resize', flexShrink:0, position:'relative', zIndex:20,
              display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background=T.gold}
            onMouseLeave={e=>e.currentTarget.style.background=T.border}>
            <div style={{ width:2, height:32, background:'currentColor', borderRadius:1, opacity:0.5 }} />
          </div>
        )}

        {/* ── 3D Panel ─────────────────────────────────────────────────── */}
        {(viewMode==='dual' || viewMode==='3d') && (
          <div style={{ flex:1, height:'100%', position:'relative', minWidth:0 }}>
            {/* Panel header */}
            <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, background:'rgba(8,7,10,0.85)', backdropFilter:'blur(8px)',
              padding:'6px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:10, color:T.gold, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase' }}>◈ 3D Extraction</span>
              <span style={{ fontSize:9, color:T.muted }}>· Live sync from 2D · Orbit drag · Scroll zoom · Right-drag pan</span>
              <div style={{ flex:1 }} />
              <span style={{ fontSize:9, color:T.green }}>● Live</span>
            </div>
            <div style={{ position:'absolute', inset:0, paddingTop:30 }}>
              <Suspense fallback={<EngineLoader label="Loading 3D Engine…" />}>
                <ThreeEngine
                  ref={threeRef}
                  walls={walls}
                  furniture={furniture}
                  selectedId={selectedId}
                  autoRotate={autoRotate}
                />
              </Suspense>
            </div>

            {/* Render overlay */}
            {rendering && (
              <div style={{ position:'absolute', inset:0, background:'rgba(8,7,10,0.88)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, zIndex:50 }}>
                <div style={{ fontFamily:T.S, fontSize:28, color:'#fff', fontWeight:300 }}>Rendering…</div>
                <div style={{ width:240, height:4, background:T.border, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:T.gold, width:`${renderProg}%`, transition:'width 0.15s' }} />
                </div>
                <span style={{ fontFamily:T.F, fontSize:11, color:T.muted, letterSpacing:'0.2em' }}>{Math.round(renderProg)}% · {renderMode}</span>
              </div>
            )}

            {/* Render result */}
            {renderResult && !rendering && (
              <div style={{ position:'absolute', top:40, right:16, zIndex:30, background:T.panel2, border:`1px solid ${T.gold}`, padding:3 }}>
                <img src={renderResult} alt="render" style={{ width:180, display:'block' }} />
                <div style={{ display:'flex', gap:4, padding:'6px 3px 3px' }}>
                  <button onClick={handleDownloadRender}
                    style={{ flex:1, background:T.gold, color:T.bg, border:'none', padding:'6px', fontFamily:T.F, fontSize:9, fontWeight:800, letterSpacing:'0.14em', cursor:'pointer' }}>
                    ↓ Save
                  </button>
                  <button onClick={()=>setRenderResult(null)}
                    style={{ background:'transparent', color:T.muted, border:`1px solid ${T.border}`, padding:'6px 10px', fontFamily:T.F, fontSize:9, cursor:'pointer' }}>
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Furniture catalog drawer */}
            {showCatalog && (
              <CatalogDrawer
                search={catalogSearch}
                onSearch={setCatalogSearch}
                onPlace={(item) => {
                  const newItem = {
                    id: `fi_${Date.now()}`,
                    x: 2 + Math.random()*2, z: 2 + Math.random()*2,
                    rotY: 0,
                    catalogItem: item,
                  }
                  setFurniture(f => [...f, newItem])
                }}
                onClose={() => setShowCatalog(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* ═══ STATUS BAR ════════════════════════════════════════════════════ */}
      <div style={{ background:T.panel, borderTop:`1px solid ${T.border}`, padding:'5px 16px', display:'flex', alignItems:'center', gap:20, flexShrink:0 }}>
        <StatusItem icon="▬" label={`${status.walls} Walls`} />
        <StatusItem icon="🚪" label={`${status.doors} Doors`} />
        <StatusItem icon="🪟" label={`${status.windows} Windows`} />
        <StatusItem icon="📏" label={`${status.totalLength}m total`} />
        <StatusItem icon="📐" label={`~${totalArea} m² area`} />
        <StatusItem icon="🛋" label={`${furniture.length} furniture`} />
        <div style={{ flex:1 }} />
        <span style={{ fontFamily:T.F, fontSize:9, color:T.muted, letterSpacing:'0.1em' }}>
          Alt+Drag to pan  ·  Scroll to zoom  ·  Esc to stop drawing  ·  Del to erase selected
        </span>
      </div>
    </div>
  )
}

function StatusItem({ icon, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ fontSize:11 }}>{icon}</span>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:'#6b6580', letterSpacing:'0.06em' }}>{label}</span>
    </div>
  )
}

function EngineLoader({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:16 }}>
      <div style={{ width:36, height:36, border:`3px solid rgba(201,162,39,0.2)`, borderTopColor:'#c9a227', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'#6b6580', letterSpacing:'0.2em', textTransform:'uppercase' }}>{label}</span>
    </div>
  )
}

/* ─── Furniture Catalog Drawer ──────────────────────────────────────────────── */
const CATALOG_ITEMS_PREVIEW = [
  { id:1,  name:'Velvet Sofa',         sku:'SOF-001', cat:'seating',  price:45000, color:'#7c6fa0', glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb',   dims:{w:2.2,h:0.8,d:0.9} },
  { id:2,  name:'Accent Chair',        sku:'SOF-002', cat:'seating',  price:12000, color:'#a0855a', glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',             dims:{w:0.8,h:0.9,d:0.8} },
  { id:13, name:'Lantern Floor Lamp',  sku:'LIT-001', cat:'lighting', price:8500,  color:'#c9a227', glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',                   dims:{w:0.3,h:1.6,d:0.3} },
  { id:4,  name:'King Bed',            sku:'BED-001', cat:'bedroom',  price:55000, color:'#8b7355', glb:null, dims:{w:2.0,h:0.6,d:2.2} },
  { id:7,  name:'Dining Table',        sku:'DIN-001', cat:'dining',   price:38000, color:'#6b4c2a', glb:null, dims:{w:1.8,h:0.76,d:0.9} },
  { id:10, name:'Wardrobe 4-Door',     sku:'STR-001', cat:'storage',  price:75000, color:'#e8e0d4', glb:null, dims:{w:2.4,h:2.2,d:0.6} },
  { id:11, name:'Bookshelf',           sku:'STR-002', cat:'storage',  price:18000, color:'#d4a96a', glb:null, dims:{w:0.9,h:2.0,d:0.3} },
  { id:12, name:'TV Unit',             sku:'STR-003', cat:'storage',  price:22000, color:'#1c1c1c', glb:null, dims:{w:1.8,h:0.45,d:0.45} },
  { id:19, name:'Kitchen Island',      sku:'KIT-001', cat:'kitchen',  price:85000, color:'#f5f0e8', glb:null, dims:{w:1.5,h:0.9,d:0.8} },
  { id:26, name:'Antique Camera',      sku:'DEC-004', cat:'decor',    price:8000,  color:'#8b6a4a', glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',       dims:{w:0.2,h:0.2,d:0.15} },
  { id:28, name:'Corset Mirror',       sku:'DEC-005', cat:'decor',    price:12000, color:'#c9a227', glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Corset/glTF-Binary/Corset.glb',                     dims:{w:0.4,h:0.8,d:0.05} },
  { id:3,  name:'3-Seat Linen Sofa',   sku:'SOF-003', cat:'seating',  price:38000, color:'#c5b99a', glb:null, dims:{w:2.0,h:0.75,d:0.85} },
]

const CATS = ['All','seating','bedroom','dining','storage','lighting','kitchen','decor']

function CatalogDrawer({ search, onSearch, onPlace, onClose }) {
  const [cat, setCat] = useState('All')
  const filtered = CATALOG_ITEMS_PREVIEW.filter(i => {
    const matchCat = cat==='All' || i.cat===cat
    const matchQ   = !search || i.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <div style={{ position:'absolute', right:0, top:30, bottom:0, width:280, background:T.panel2, borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column', zIndex:40 }}>
      {/* Header */}
      <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontFamily:T.S, fontSize:16, color:T.text, flex:1 }}>Furniture Catalog</span>
        <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:16, cursor:'pointer' }}>✕</button>
      </div>

      {/* Search */}
      <div style={{ padding:'8px 14px', borderBottom:`1px solid ${T.border}` }}>
        <input value={search} onChange={e=>onSearch(e.target.value)}
          placeholder="Search furniture…"
          style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, color:T.text, padding:'7px 12px', fontFamily:T.F, fontSize:11, outline:'none', boxSizing:'border-box' }}
          onFocus={e=>e.target.style.borderColor=T.gold}
          onBlur={e=>e.target.style.borderColor=T.border} />
      </div>

      {/* Category chips */}
      <div style={{ display:'flex', gap:4, padding:'8px 14px', flexWrap:'wrap', borderBottom:`1px solid ${T.border}` }}>
        {CATS.map(c => (
          <button key={c} onClick={()=>setCat(c)}
            style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
              padding:'4px 10px', background:cat===c?T.gold:'transparent', border:`1px solid ${cat===c?T.gold:T.border}`,
              color:cat===c?T.bg:T.muted, cursor:'pointer' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
        {filtered.map(item => (
          <div key={item.id}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', marginBottom:4,
              background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}`, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background='rgba(201,162,39,0.07)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background='rgba(255,255,255,0.03)'}}>
            {/* Color swatch */}
            <div style={{ width:36, height:36, background:item.color, borderRadius:2, flexShrink:0, border:`1px solid rgba(255,255,255,0.1)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>
              {item.glb ? '3D' : '⬛'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:T.F, fontSize:11, fontWeight:700, color:T.text, margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</p>
              <p style={{ fontFamily:T.F, fontSize:9, color:T.muted, margin:0 }}>
                {item.sku} · ₹{item.price.toLocaleString('en-IN')}
                {item.glb && <span style={{ color:T.gold, marginLeft:4 }}>· GLB</span>}
              </p>
            </div>
            <button onClick={()=>onPlace(item)}
              style={{ background:T.gold, color:T.bg, border:'none', padding:'5px 10px', fontFamily:T.F, fontSize:9, fontWeight:800, letterSpacing:'0.1em', cursor:'pointer', flexShrink:0 }}>
              + Add
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontFamily:T.F, fontSize:11, color:T.muted, textAlign:'center', marginTop:32 }}>No items found</p>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:'10px 14px', borderTop:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:T.F, fontSize:9, color:T.muted }}>GLB = real 3D model · ⬛ = procedural mesh</span>
      </div>
    </div>
  )
}
