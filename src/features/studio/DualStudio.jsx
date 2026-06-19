/**
 * DualStudio v2 — Full-featured SpaceForge-style interior design studio
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  TopBar: project name | save | share | export | undo/redo | view toggle  │
 * ├──────────┬──────────────────────────────────────┬────────────────────────┤
 * │ LEFT     │ CENTER (dual canvas)                  │ RIGHT                  │
 * │ Toolbar  │  2D Floor Plan  │  3D Live 3D         │ Tab: Catalog/Materials │
 * │ Layers   │                 │                     │      Properties/AI     │
 * │          │◄── drag splitter ──►                  │                        │
 * ├──────────┴──────────────────────────────────────┴────────────────────────┤
 * │ Status bar                                                                │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useRef, useCallback, useEffect, Suspense, lazy } from 'react'
import CATALOG, { CATEGORIES, MATERIALS } from '../../data/furnitureCatalog'
import { saveProject, getProject, listProjects, encodeShareLink } from '../../utils/projectStorage'

const FloorPlanEngine = lazy(() => import('./FloorPlanEngine'))
const ThreeEngine     = lazy(() => import('./ThreeEngine'))

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const T = {
  bg:'#08070a', panel:'#0f0e14', panel2:'#16141d', panel3:'#1c1927',
  border:'rgba(255,255,255,0.07)', borderG:'rgba(201,162,39,0.3)',
  gold:'#c9a227', goldL:'#e8c84e', goldD:'#a07a18',
  text:'#ede9e3', muted:'#6b6580', faint:'#3a3550',
  red:'#ef4444', green:'#22c55e', blue:'#3b82f6',
  F:"'DM Sans',system-ui,sans-serif",
  S:"'Cormorant Garamond',serif",
}

/* ─── Tools ─────────────────────────────────────────────────────────────── */
const TOOLS = [
  { id:'select',  icon:'↖',  label:'Select',   tip:'Click to select / move',            key:'V' },
  { id:'wall',    icon:'▬',  label:'Wall',      tip:'Click→click to draw (dbl to end)',  key:'W' },
  { id:'door',    icon:'🚪', label:'Door',      tip:'Draw a door along a wall',          key:'D' },
  { id:'window',  icon:'🪟', label:'Window',    tip:'Draw a window along a wall',        key:'N' },
  { id:'erase',   icon:'✕',  label:'Erase',     tip:'Click a wall to delete it',         key:'E' },
  { id:'measure', icon:'📏', label:'Measure',   tip:'Click 2 points to measure',         key:'M' },
  { id:'room',    icon:'⬡',  label:'Room Tag',  tip:'Click to label a room',             key:'R' },
]

/* ─── Right panel tabs ──────────────────────────────────────────────────── */
const RIGHT_TABS = [
  { id:'catalog',    icon:'🛋', label:'Furniture' },
  { id:'materials',  icon:'🎨', label:'Materials' },
  { id:'properties', icon:'⚙', label:'Properties' },
  { id:'ai',         icon:'✦',  label:'AI Assist' },
]

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const px = n => `${n}px`
function Divider({ v }) {
  return <div style={v
    ? { width:1, height:24, background:T.border, margin:'0 4px', flexShrink:0 }
    : { height:1, background:T.border, margin:'4px 0' }} />
}
function Chip({ active, onClick, children, danger, small }) {
  return (
    <button onClick={onClick} style={{
      fontFamily:T.F, fontSize:small?8:9, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase',
      padding: small?'3px 8px':'5px 12px',
      background: active ? T.gold : 'transparent',
      border:`1px solid ${active?T.gold:danger?T.red:T.border}`,
      color: active ? T.bg : danger?T.red:T.muted, cursor:'pointer', transition:'all 0.15s',
    }}>{children}</button>
  )
}

/* ─── Sub-panels ─────────────────────────────────────────────────────────── */
function CatalogPanel({ onAdd }) {
  const [cat, setCat]     = useState('all')
  const [q, setQ]         = useState('')
  const [sortBy, setSort] = useState('name')

  const items = CATALOG.filter(i => {
    const matchCat = cat === 'all' || i.cat === cat
    const matchQ   = !q || i.name.toLowerCase().includes(q.toLowerCase()) || (i.tags||[]).some(t=>t.includes(q.toLowerCase()))
    return matchCat && matchQ
  }).sort((a,b) => sortBy==='price' ? a.price-b.price : a.name.localeCompare(b.name))

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Search */}
      <div style={{ padding:'10px 12px', borderBottom:`1px solid ${T.border}` }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search 75+ items…"
          style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, color:T.text,
            padding:'7px 10px', fontFamily:T.F, fontSize:11, outline:'none', boxSizing:'border-box' }}
          onFocus={e=>e.target.style.borderColor=T.gold}
          onBlur={e=>e.target.style.borderColor=T.border} />
        <div style={{ display:'flex', gap:4, marginTop:6 }}>
          <Chip active={sortBy==='name'} small onClick={()=>setSort('name')}>A–Z</Chip>
          <Chip active={sortBy==='price'} small onClick={()=>setSort('price')}>Price</Chip>
          <span style={{ flex:1 }} />
          <span style={{ fontFamily:T.F, fontSize:9, color:T.muted, alignSelf:'center' }}>{items.length} items</span>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding:'8px 12px', borderBottom:`1px solid ${T.border}`, display:'flex', flexWrap:'wrap', gap:3 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={()=>setCat(c.id)}
            style={{ fontFamily:T.F, fontSize:8, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
              padding:'3px 7px', background:cat===c.id?T.gold:'transparent',
              border:`1px solid ${cat===c.id?T.gold:T.border}`, color:cat===c.id?T.bg:T.muted, cursor:'pointer' }}>
            {c.icon} {c.id==='all'?'All':c.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ flex:1, overflowY:'auto', padding:8 }}>
        {items.map(item => (
          <div key={item.id}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 8px', marginBottom:3,
              background:'rgba(255,255,255,0.025)', border:`1px solid ${T.border}`, cursor:'pointer',
              transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background='rgba(201,162,39,0.06)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background='rgba(255,255,255,0.025)'}}>
            {/* Swatch */}
            <div style={{ width:32, height:32, background:item.color, flexShrink:0, border:`1px solid rgba(255,255,255,0.08)`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>
              {item.glb?'3D':'⬛'}
            </div>
            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:T.F, fontSize:10, fontWeight:700, color:T.text, margin:'0 0 1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
              <p style={{ fontFamily:T.F, fontSize:8, color:T.muted, margin:0 }}>
                {item.brand} · ₹{item.price.toLocaleString('en-IN')}
                {item.glb && <span style={{ color:T.gold }}> · GLB</span>}
              </p>
            </div>
            {/* Add btn */}
            <button onClick={()=>onAdd(item)}
              style={{ background:T.gold, color:T.bg, border:'none', padding:'5px 9px', fontFamily:T.F,
                fontSize:10, fontWeight:900, cursor:'pointer', flexShrink:0 }}>
              +
            </button>
          </div>
        ))}
        {items.length===0 && <p style={{ textAlign:'center', color:T.muted, fontFamily:T.F, fontSize:11, marginTop:32 }}>No items found</p>}
      </div>
    </div>
  )
}

function MaterialsPanel({ materials, onChange }) {
  const [tab, setTab] = useState('walls')

  const list = MATERIALS[tab] || []
  const current = materials[tab] || list[0]?.id

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Tabs: walls / floors / ceilings */}
      <div style={{ display:'flex', borderBottom:`1px solid ${T.border}` }}>
        {['walls','floors','ceilings'].map(t => (
          <button key={t} onClick={()=>setTab(t)}
            style={{ flex:1, fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase',
              padding:'10px 0', background:'transparent', border:'none', color:tab===t?T.gold:T.muted,
              borderBottom:`2px solid ${tab===t?T.gold:'transparent'}`, cursor:'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {list.map(m => (
            <div key={m.id} onClick={()=>onChange(tab, m.id)}
              style={{ cursor:'pointer', border:`2px solid ${current===m.id?T.gold:T.border}`,
                transition:'border-color 0.15s', padding:0, overflow:'hidden' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
              onMouseLeave={e=>e.currentTarget.style.borderColor=current===m.id?T.gold:T.border}>
              {/* Swatch */}
              <div style={{ height:48, background:m.color, position:'relative' }}>
                {current===m.id && (
                  <div style={{ position:'absolute', top:4, right:4, width:14, height:14, background:T.gold,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:T.bg, fontWeight:900 }}>✓</div>
                )}
              </div>
              <div style={{ padding:'6px 7px', background:T.panel3 }}>
                <p style={{ fontFamily:T.F, fontSize:9, color:T.text, margin:0, fontWeight:600, lineHeight:1.3 }}>{m.label}</p>
                {m.texture && <p style={{ fontFamily:T.F, fontSize:8, color:T.muted, margin:'2px 0 0' }}>{m.texture}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PropertiesPanel({ selected, walls, furniture, onDeleteWall, onUpdateFurniture, onDeleteFurniture }) {
  if (!selected) {
    return (
      <div style={{ padding:24, textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>↖</div>
        <p style={{ fontFamily:T.F, fontSize:11, color:T.muted }}>Select a wall or furniture item to see its properties</p>
      </div>
    )
  }

  const wall = walls.find(w => w.id === selected)
  const fi   = furniture.find(f => f.id === selected)

  if (wall) {
    const len = (Math.hypot(wall.x2-wall.x1, wall.y2-wall.y1)/60).toFixed(2)
    return (
      <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
        <p style={{ fontFamily:T.S, fontSize:15, color:T.text, margin:'0 0 4px' }}>Wall Properties</p>
        <PropRow label="Type" value={wall.type||'wall'} />
        <PropRow label="Length" value={`${len} m`} />
        <PropRow label="Height" value="2.8 m" />
        <PropRow label="Thickness" value="0.17 m" />
        <PropRow label="ID" value={wall.id?.slice(-6)} mono />
        <Divider />
        <button onClick={()=>onDeleteWall(wall.id)}
          style={{ background:'rgba(239,68,68,0.1)', border:`1px solid ${T.red}`, color:T.red,
            fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase',
            padding:'8px', cursor:'pointer' }}>
          🗑 Delete Wall
        </button>
      </div>
    )
  }

  if (fi) {
    const item = fi.catalogItem
    return (
      <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
        <p style={{ fontFamily:T.S, fontSize:15, color:T.text, margin:'0 0 4px' }}>{item.name}</p>
        <div style={{ width:'100%', height:80, background:item.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'rgba(255,255,255,0.6)', fontFamily:T.F }}>
          {item.glb ? '3D Model' : 'Procedural'}
        </div>
        <PropRow label="Brand" value={item.brand} />
        <PropRow label="Material" value={item.material} />
        <PropRow label="Price" value={`₹${item.price.toLocaleString('en-IN')}`} />
        <PropRow label="Size W" value={`${item.dims.w}m`} />
        <PropRow label="Size H" value={`${item.dims.h}m`} />
        <PropRow label="Size D" value={`${item.dims.d}m`} />
        <Divider />
        <label style={{ fontFamily:T.F, fontSize:9, color:T.muted, letterSpacing:'0.14em', textTransform:'uppercase' }}>Rotation Y</label>
        <input type="range" min={0} max={360} step={15}
          value={Math.round((fi.rotY||0) * 180/Math.PI)}
          onChange={e=>onUpdateFurniture(fi.id, { rotY: parseFloat(e.target.value)*Math.PI/180 })}
          style={{ width:'100%' }} />
        <Divider />
        <button onClick={()=>onDeleteFurniture(fi.id)}
          style={{ background:'rgba(239,68,68,0.1)', border:`1px solid ${T.red}`, color:T.red,
            fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase',
            padding:'8px', cursor:'pointer' }}>
          🗑 Remove Item
        </button>
        <a href={`https://www.amazon.in/s?k=${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer"
          style={{ display:'block', textAlign:'center', padding:'8px', background:`rgba(201,162,39,0.1)`,
            border:`1px solid ${T.gold}`, color:T.gold, fontFamily:T.F, fontSize:10, fontWeight:700,
            letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none' }}>
          🛒 Shop This
        </a>
      </div>
    )
  }

  return null
}

function PropRow({ label, value, mono }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontFamily:T.F, fontSize:9, color:T.muted, letterSpacing:'0.12em', textTransform:'uppercase' }}>{label}</span>
      <span style={{ fontFamily:mono?'monospace':T.F, fontSize:11, color:T.text, fontWeight:600 }}>{value}</span>
    </div>
  )
}

function AIPanel({ walls, furniture, onSuggest }) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [prompt, setPrompt] = useState('')

  async function ask() {
    if (!prompt.trim()) return
    setLoading(true)
    await new Promise(r=>setTimeout(r,1200))
    setSuggestions([
      { icon:'💡', text:`Try warm gold pendant lighting over the dining area to create a focal point.` },
      { icon:'🎨', text:`Sage green accent wall behind the sofa will contrast beautifully with cream flooring.` },
      { icon:'🛋', text:`An L-shape sectional sofa maximises seating without crowding the ${walls.length>0?'room':'space'}.` },
      { icon:'🪴', text:`Add a tall fiddle-leaf fig plant in the corner to bring life and height to the space.` },
      { icon:'🪞', text:`A large floor mirror on the shorter wall will visually double the room width.` },
    ])
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'12px 12px 8px', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
          <span style={{ color:T.gold, fontSize:14 }}>✦</span>
          <span style={{ fontFamily:T.S, fontSize:14, color:T.text }}>AI Design Assistant</span>
        </div>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
          placeholder="Describe your style… e.g. 'modern Japandi bedroom for young couple'"
          rows={3}
          style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`, color:T.text,
            padding:'8px 10px', fontFamily:T.F, fontSize:11, outline:'none', resize:'none', boxSizing:'border-box' }}
          onFocus={e=>e.target.style.borderColor=T.gold}
          onBlur={e=>e.target.style.borderColor=T.border} />
        <button onClick={ask} disabled={loading}
          style={{ marginTop:6, width:'100%', background:`linear-gradient(135deg,${T.gold},${T.goldL})`,
            color:T.bg, border:'none', padding:'9px', fontFamily:T.F, fontSize:10, fontWeight:800,
            letterSpacing:'0.16em', textTransform:'uppercase', cursor:'pointer', opacity:loading?0.6:1 }}>
          {loading ? '✦ Thinking…' : '✦ Get AI Suggestions'}
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
        {suggestions.map((s,i) => (
          <div key={i} style={{ display:'flex', gap:10, padding:'10px 10px', marginBottom:6,
            background:'rgba(201,162,39,0.06)', border:`1px solid rgba(201,162,39,0.15)` }}>
            <span style={{ fontSize:16, flexShrink:0 }}>{s.icon}</span>
            <p style={{ fontFamily:T.F, fontSize:11, color:T.text, margin:0, lineHeight:1.6 }}>{s.text}</p>
          </div>
        ))}
        {suggestions.length===0 && !loading && (
          <div style={{ textAlign:'center', paddingTop:24 }}>
            <div style={{ fontSize:32 }}>✦</div>
            <p style={{ fontFamily:T.F, fontSize:11, color:T.muted, lineHeight:1.6 }}>
              Describe your vision and the AI will suggest furniture, colours, and layout tips for your space.
            </p>
          </div>
        )}
      </div>

      {/* Quick prompt chips */}
      <div style={{ padding:'8px 12px', borderTop:`1px solid ${T.border}`, display:'flex', flexWrap:'wrap', gap:4 }}>
        {['Modern minimalist','Luxury Art Deco','Japandi calm','Boho colorful','Vastu-compliant'].map(s => (
          <button key={s} onClick={()=>setPrompt(s)}
            style={{ fontFamily:T.F, fontSize:8, fontWeight:700, padding:'4px 8px', letterSpacing:'0.1em', textTransform:'uppercase',
              background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`, color:T.muted, cursor:'pointer' }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Layers panel ──────────────────────────────────────────────────────── */
function LayersPanel({ walls, furniture, selectedId, onSelect }) {
  return (
    <div style={{ flex:1, overflowY:'auto' }}>
      {/* Walls group */}
      <div style={{ borderBottom:`1px solid ${T.border}` }}>
        <div style={{ padding:'6px 10px', fontFamily:T.F, fontSize:8, fontWeight:700, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase', background:T.panel2 }}>
          WALLS ({walls.length})
        </div>
        {walls.map((w,i) => (
          <div key={w.id} onClick={()=>onSelect(w.id===selectedId?null:w.id)}
            style={{ padding:'5px 10px', display:'flex', alignItems:'center', gap:6, cursor:'pointer',
              background:selectedId===w.id?'rgba(201,162,39,0.08)':'transparent',
              borderLeft:`2px solid ${selectedId===w.id?T.gold:'transparent'}` }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
            onMouseLeave={e=>e.currentTarget.style.background=selectedId===w.id?'rgba(201,162,39,0.08)':'transparent'}>
            <span style={{ fontSize:9 }}>{w.type==='door'?'🚪':w.type==='window'?'🪟':'▬'}</span>
            <span style={{ fontFamily:T.F, fontSize:10, color:T.text }}>{w.type||'Wall'} {i+1}</span>
          </div>
        ))}
      </div>
      {/* Furniture group */}
      <div>
        <div style={{ padding:'6px 10px', fontFamily:T.F, fontSize:8, fontWeight:700, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase', background:T.panel2 }}>
          FURNITURE ({furniture.length})
        </div>
        {furniture.map((f,i) => (
          <div key={f.id} onClick={()=>onSelect(f.id===selectedId?null:f.id)}
            style={{ padding:'5px 10px', display:'flex', alignItems:'center', gap:6, cursor:'pointer',
              background:selectedId===f.id?'rgba(201,162,39,0.08)':'transparent',
              borderLeft:`2px solid ${selectedId===f.id?T.gold:'transparent'}` }}>
            <div style={{ width:12, height:12, background:f.catalogItem.color, flexShrink:0 }} />
            <span style={{ fontFamily:T.F, fontSize:10, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.catalogItem.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Save/Share modal ──────────────────────────────────────────────────── */
function SaveModal({ project, walls, furniture, materials, onSaved, onClose }) {
  const [name, setName] = useState(project?.name || 'My Design')
  const [saved, setSaved] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  function doSave() {
    const p = saveProject({ id:project?.id, name, walls, furniture, materials })
    setSaved(true)
    const link = `${window.location.origin}/studio?share=${encodeShareLink(p)}`
    setShareUrl(link)
    onSaved(p)
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(()=>{})
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <div style={{ background:T.panel2, border:`1px solid ${T.borderG}`, padding:28, width:420, maxWidth:'90vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontFamily:T.S, fontSize:20, color:T.text }}>Save Design</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        {!saved ? (
          <>
            <label style={{ fontFamily:T.F, fontSize:9, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Project Name</label>
            <input value={name} onChange={e=>setName(e.target.value)}
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, color:T.text,
                padding:'10px 12px', fontFamily:T.F, fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:16 }}
              onFocus={e=>e.target.style.borderColor=T.gold}
              onBlur={e=>e.target.style.borderColor=T.border} />
            <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginBottom:12, padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}` }}>
              <span style={{ fontFamily:T.F, fontSize:10, color:T.muted }}>{walls.length} walls · {furniture.length} furniture items</span>
            </div>
            <button onClick={doSave}
              style={{ width:'100%', background:`linear-gradient(135deg,${T.gold},${T.goldL})`, color:T.bg, border:'none',
                padding:'12px', fontFamily:T.F, fontSize:11, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer' }}>
              💾 Save Project
            </button>
          </>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>✓</div>
              <p style={{ fontFamily:T.S, fontSize:18, color:T.gold, margin:'0 0 4px' }}>Saved!</p>
              <p style={{ fontFamily:T.F, fontSize:11, color:T.muted, margin:0 }}>"{name}" saved to your projects</p>
            </div>
            <label style={{ fontFamily:T.F, fontSize:9, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>Share Link</label>
            <div style={{ display:'flex', gap:6 }}>
              <input readOnly value={shareUrl}
                style={{ flex:1, background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`, color:T.muted,
                  padding:'8px 10px', fontFamily:'monospace', fontSize:10, outline:'none' }} />
              <button onClick={copyLink}
                style={{ background:T.gold, color:T.bg, border:'none', padding:'8px 14px', fontFamily:T.F, fontSize:9, fontWeight:800, letterSpacing:'0.12em', cursor:'pointer' }}>
                Copy
              </button>
            </div>
            <button onClick={onClose}
              style={{ padding:'10px', background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, color:T.text, fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.14em', cursor:'pointer' }}>
              Continue Editing
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main DualStudio ────────────────────────────────────────────────────── */
export default function DualStudio({ initialProjectId }) {
  const [walls,      setWalls]      = useState([])
  const [furniture,  setFurniture]  = useState([])
  const [materials,  setMaterials]  = useState({ walls:'white-paint', floors:'oak-floor', ceilings:'white-ceiling' })
  const [tool,       setTool]       = useState('wall')
  const [selectedId, setSelectedId] = useState(null)
  const [viewMode,   setViewMode]   = useState('dual')
  const [rightTab,   setRightTab]   = useState('catalog')
  const [autoRotate, setAutoRotate] = useState(false)
  const [showSave,   setShowSave]   = useState(false)
  const [project,    setProject]    = useState(null)
  const [projectName,setPName]      = useState('Untitled Design')
  const [splitPos,   setSplitPos]   = useState(50)
  const [dragging,   setDragging]   = useState(false)
  const [status,     setStatus]     = useState({ walls:0, doors:0, windows:0, totalLength:'0.0' })
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const splitRef  = useRef(null)
  const planRef   = useRef(null)
  const threeRef  = useRef(null)

  /* Load project on mount */
  useEffect(() => {
    if (initialProjectId) {
      const p = getProject(initialProjectId)
      if (p) { setProject(p); setPName(p.name); setWalls(p.walls||[]); setFurniture(p.furniture||[]); setMaterials(p.materials||materials) }
    }
    // Load from share param
    const params = new URLSearchParams(window.location.search)
    const share = params.get('share')
    if (share) {
      const { decodeShareLink } = require('../../utils/projectStorage')
      const d = decodeShareLink(share)
      if (d) { setPName(d.name||'Shared Design'); setWalls(d.walls||[]); setFurniture(d.furniture||[]); setMaterials(d.materials||materials) }
    }
  }, [])

  /* Keyboard shortcuts */
  useEffect(() => {
    const map = { v:'select',w:'wall',d:'door',n:'window',e:'erase',m:'measure',r:'room' }
    function onKey(e) {
      if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return
      if ((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); setShowSave(true); return }
      if ((e.ctrlKey||e.metaKey) && e.key==='z') { planRef.current?.undo(); return }
      if ((e.ctrlKey||e.metaKey) && e.key==='y') { planRef.current?.redo(); return }
      if (e.key==='Escape') { setSelectedId(null); planRef.current?.cancelDrawing(); return }
      if ((e.key==='Delete'||e.key==='Backspace') && selectedId) {
        setWalls(w=>w.filter(x=>x.id!==selectedId)); setSelectedId(null); return
      }
      const t = map[e.key.toLowerCase()]
      if (t) setTool(t)
    }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  }, [selectedId])

  /* Splitter drag */
  function onSplitDown(e) {
    e.preventDefault(); setDragging(true)
    const cont = splitRef.current
    const onMove = ev => {
      if (!cont) return
      const r = cont.getBoundingClientRect()
      setSplitPos(Math.max(25, Math.min(75, (ev.clientX-r.left)/r.width*100)))
    }
    const onUp = () => { setDragging(false); window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp) }
    window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp)
  }

  function addFurniture(item) {
    setFurniture(f => [...f, {
      id:`fi_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      x: 2+Math.random()*3, z: 2+Math.random()*3, rotY:0,
      catalogItem: item,
    }])
    setRightTab('properties')
  }

  function updateMaterial(layer, id) { setMaterials(m=>({...m,[layer]:id})) }

  const totalArea = (() => {
    if (!walls.length) return '0'
    const xs=walls.flatMap(w=>[w.x1,w.x2]), ys=walls.flatMap(w=>[w.y1,w.y2])
    return ((Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys))/3600).toFixed(0)
  })()

  const activeTool = TOOLS.find(t=>t.id===tool)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:T.bg, fontFamily:T.F, userSelect:dragging?'none':'auto', overflow:'hidden' }}>

      {/* ═══ TOP BAR ══════════════════════════════════════════════════════ */}
      <div style={{ background:T.panel, borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        {/* Row 1: project name + global actions */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 14px', height:46, gap:10, borderBottom:`1px solid ${T.border}` }}>
          {/* Logo mark */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginRight:4 }}>
            <div style={{ width:26, height:26, background:T.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>◈</div>
            <span style={{ fontFamily:T.S, fontSize:14, color:T.text, letterSpacing:'0.04em' }}>Studio</span>
          </div>

          {/* Editable project name */}
          <input value={projectName} onChange={e=>setPName(e.target.value)}
            style={{ background:'transparent', border:'none', outline:'none', fontFamily:T.F, fontSize:12, fontWeight:600,
              color:T.text, minWidth:120, maxWidth:200 }}
            onFocus={e=>e.target.style.borderBottom=`1px solid ${T.gold}`}
            onBlur={e=>e.target.style.borderBottom='none'} />

          <div style={{ flex:1 }} />

          {/* View toggle */}
          <div style={{ display:'flex', gap:2 }}>
            {[['dual','⊞','Dual'],['2d','⬛','2D'],['3d','◈','3D']].map(([m,ic,l])=>(
              <button key={m} onClick={()=>setViewMode(m)}
                style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.12em', padding:'5px 11px',
                  background:viewMode===m?T.gold:'transparent', border:`1px solid ${viewMode===m?T.gold:T.border}`,
                  color:viewMode===m?T.bg:T.muted, cursor:'pointer', transition:'all 0.15s' }}>
                {ic} {l}
              </button>
            ))}
          </div>

          {/* Divider */}
          <Divider v />

          {/* Undo / Redo */}
          <TinyBtn icon="↩" tip="Undo (Ctrl+Z)" onClick={()=>planRef.current?.undo()} />
          <TinyBtn icon="↪" tip="Redo (Ctrl+Y)" onClick={()=>planRef.current?.redo()} />

          <Divider v />

          {/* Import / Export */}
          <TinyBtn icon="📂" tip="Import JSON" onClick={()=>{ const i=document.createElement('input'); i.type='file'; i.accept='.json'; i.onchange=async e=>{ const t=await e.target.files[0].text(); const d=JSON.parse(t); setWalls(d.walls||[]); setFurniture(d.furniture||[]) }; i.click() }} />
          <TinyBtn icon="💾" tip="Export JSON" onClick={()=>{ const a=document.createElement('a'); a.href='data:application/json,'+encodeURIComponent(JSON.stringify({walls,furniture,materials},null,2)); a.download='design.json'; a.click() }} />
          <TinyBtn icon="🖼" tip="Export PNG" onClick={()=>planRef.current?.exportPNG()?.then?.(u=>{const a=document.createElement('a');a.href=u;a.download='floorplan.png';a.click()})} />
          <TinyBtn icon="📷" tip="3D Screenshot" onClick={()=>{ const u=threeRef.current?.screenshot(); if(u){const a=document.createElement('a');a.href=u;a.download='render.png';a.click()} }} />

          <Divider v />

          {/* Auto-rotate */}
          <button onClick={()=>setAutoRotate(v=>!v)}
            style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
              padding:'5px 10px', background:autoRotate?`${T.gold}22`:'transparent',
              border:`1px solid ${autoRotate?T.gold:T.border}`, color:autoRotate?T.gold:T.muted, cursor:'pointer' }}>
            {autoRotate?'⏹ Stop':'▶ Rotate'}
          </button>

          {/* Save & Share */}
          <TinyBtn icon="🗑" tip="Clear all" danger onClick={()=>{ if(confirm('Clear all walls and furniture?')){ setWalls([]); setFurniture([]); setSelectedId(null) } }} />
          <button onClick={()=>setShowSave(true)}
            style={{ background:`linear-gradient(135deg,${T.gold},${T.goldL})`, color:T.bg, border:'none',
              padding:'7px 18px', fontFamily:T.F, fontSize:10, fontWeight:800, letterSpacing:'0.16em',
              textTransform:'uppercase', cursor:'pointer', boxShadow:`0 4px 16px rgba(201,162,39,0.35)` }}>
            Save &amp; Share
          </button>
        </div>

        {/* Row 2: tools */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 14px', gap:2, height:52, overflowX:'auto' }}>
          <span style={{ fontFamily:T.F, fontSize:8, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:T.muted, marginRight:8, flexShrink:0 }}>Draw</span>
          {TOOLS.map(t2 => (
            <button key={t2.id} onClick={()=>setTool(t2.id)} title={`${t2.label} [${t2.key}]`}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'6px 11px',
                background:tool===t2.id?`${T.gold}18`:'transparent', border:`1px solid ${tool===t2.id?T.gold:T.border}`,
                color:tool===t2.id?T.gold:T.muted, cursor:'pointer', transition:'all 0.15s', minWidth:50, flexShrink:0 }}>
              <span style={{ fontSize:14, lineHeight:1 }}>{t2.icon}</span>
              <span style={{ fontFamily:T.F, fontSize:8, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>{t2.label}</span>
            </button>
          ))}
          <Divider v />
          <span style={{ fontFamily:T.F, fontSize:8, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:T.muted, margin:'0 8px', flexShrink:0 }}>Templates</span>
          {[{l:'Blank',i:'⬜'},{l:'Living Room',i:'🛋'},{l:'Bedroom',i:'🛏'},{l:'Kitchen',i:'🍳'},{l:'Office',i:'💻'}].map(({l,i})=>(
            <button key={l} onClick={()=>{}}
              style={{ fontFamily:T.F, fontSize:8, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                padding:'6px 10px', background:'transparent', border:`1px solid ${T.border}`,
                color:T.muted, cursor:'pointer', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              {i} {l}
            </button>
          ))}
          <div style={{ flex:1 }} />
          {activeTool && <span style={{ fontFamily:T.F, fontSize:9, color:T.muted, whiteSpace:'nowrap', flexShrink:0 }}>💡 {activeTool.tip}</span>}
        </div>
      </div>

      {/* ═══ MAIN AREA ════════════════════════════════════════════════════ */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {/* ── LEFT: Layers ──────────────────────────────────────────────── */}
        <div style={{ width:leftCollapsed?32:200, background:T.panel, borderRight:`1px solid ${T.border}`, flexShrink:0, display:'flex', flexDirection:'column', transition:'width 0.2s', overflow:'hidden' }}>
          <div style={{ padding:'7px 8px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {!leftCollapsed && <span style={{ fontFamily:T.F, fontSize:8, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted }}>Layers</span>}
            <button onClick={()=>setLeftCollapsed(v=>!v)} title="Collapse"
              style={{ background:'none', border:'none', color:T.muted, fontSize:12, cursor:'pointer', padding:2, marginLeft:'auto' }}>
              {leftCollapsed?'▶':'◀'}
            </button>
          </div>
          {!leftCollapsed && <LayersPanel walls={walls} furniture={furniture} selectedId={selectedId} onSelect={setSelectedId} />}
        </div>

        {/* ── CENTER: Dual Canvas ───────────────────────────────────────── */}
        <div ref={splitRef} style={{ flex:1, display:'flex', overflow:'hidden', position:'relative', minWidth:0 }}>

          {/* 2D panel */}
          {(viewMode==='dual'||viewMode==='2d') && (
            <div style={{ width:viewMode==='2d'?'100%':`${splitPos}%`, height:'100%', position:'relative', flexShrink:0, borderRight:viewMode==='dual'?`1px solid ${T.border}`:'none' }}>
              <PanelHeader label="⬛ 2D Floor Plan" sub="Alt+drag pan · Scroll zoom · Esc stop">
                <span style={{ fontSize:9, color:T.muted }}>{status.walls}W · {status.doors}D · {status.windows}Win</span>
              </PanelHeader>
              <div style={{ position:'absolute', inset:0, paddingTop:30 }}>
                <Suspense fallback={<Spinner label="2D Engine…" />}>
                  <FloorPlanEngine ref={planRef} tool={tool} walls={walls} onWallsChange={setWalls}
                    selectedId={selectedId} onSelect={setSelectedId} onStatusChange={setStatus} />
                </Suspense>
              </div>
            </div>
          )}

          {/* Splitter */}
          {viewMode==='dual' && (
            <div onMouseDown={onSplitDown} style={{ width:5, background:T.border, cursor:'col-resize', flexShrink:0, zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=T.gold}
              onMouseLeave={e=>e.currentTarget.style.background=T.border}>
              <div style={{ width:2, height:28, background:'currentColor', borderRadius:1, opacity:0.4 }} />
            </div>
          )}

          {/* 3D panel */}
          {(viewMode==='dual'||viewMode==='3d') && (
            <div style={{ flex:1, height:'100%', position:'relative', minWidth:0 }}>
              <PanelHeader label="◈ 3D Live View" sub="Orbit · Scroll zoom · Right-drag pan">
                <span style={{ fontSize:9, color:T.green }}>● Live</span>
              </PanelHeader>
              <div style={{ position:'absolute', inset:0, paddingTop:30 }}>
                <Suspense fallback={<Spinner label="3D Engine…" />}>
                  <ThreeEngine ref={threeRef} walls={walls} furniture={furniture}
                    selectedId={selectedId} autoRotate={autoRotate} materials={materials} />
                </Suspense>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Panels ─────────────────────────────────────────────── */}
        <div style={{ width:260, background:T.panel, borderLeft:`1px solid ${T.border}`, flexShrink:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Tab bar */}
          <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
            {RIGHT_TABS.map(tab => (
              <button key={tab.id} onClick={()=>setRightTab(tab.id)} title={tab.label}
                style={{ flex:1, padding:'10px 4px', background:'transparent', border:'none',
                  borderBottom:`2px solid ${rightTab===tab.id?T.gold:'transparent'}`,
                  color:rightTab===tab.id?T.gold:T.muted, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                <span style={{ fontSize:13 }}>{tab.icon}</span>
                <span style={{ fontFamily:T.F, fontSize:7, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>{tab.label}</span>
              </button>
            ))}
          </div>
          {/* Panel content */}
          <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            {rightTab==='catalog'    && <CatalogPanel onAdd={addFurniture} />}
            {rightTab==='materials'  && <MaterialsPanel materials={materials} onChange={updateMaterial} />}
            {rightTab==='properties' && <PropertiesPanel selected={selectedId} walls={walls} furniture={furniture}
              onDeleteWall={id=>setWalls(w=>w.filter(x=>x.id!==id))}
              onUpdateFurniture={(id,upd)=>setFurniture(f=>f.map(x=>x.id===id?{...x,...upd}:x))}
              onDeleteFurniture={id=>setFurniture(f=>f.filter(x=>x.id!==id))} />}
            {rightTab==='ai'         && <AIPanel walls={walls} furniture={furniture} />}
          </div>
        </div>
      </div>

      {/* ═══ STATUS BAR ════════════════════════════════════════════════════ */}
      <div style={{ background:T.panel, borderTop:`1px solid ${T.border}`, padding:'4px 14px', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <SBar icon="▬" label={`${status.walls} Walls`} />
        <SBar icon="🚪" label={`${status.doors} Doors`} />
        <SBar icon="🪟" label={`${status.windows} Win`} />
        <SBar icon="📐" label={`~${totalArea} m²`} />
        <SBar icon="🛋" label={`${furniture.length} Furniture`} />
        <div style={{ flex:1 }} />
        <span style={{ fontFamily:T.F, fontSize:8, color:T.faint, letterSpacing:'0.1em' }}>
          Ctrl+S save · Ctrl+Z undo · Del erase selected · [W/D/N/E] tools
        </span>
      </div>

      {/* ═══ MODALS ════════════════════════════════════════════════════════ */}
      {showSave && (
        <SaveModal project={project} walls={walls} furniture={furniture} materials={materials}
          onSaved={p=>setProject(p)} onClose={()=>setShowSave(false)} />
      )}
    </div>
  )
}

/* ─── Tiny helpers ──────────────────────────────────────────────────────── */
function TinyBtn({ icon, tip, onClick, danger }) {
  return (
    <button onClick={onClick} title={tip}
      style={{ background:'transparent', border:`1px solid ${danger?T.red:T.border}`, color:danger?T.red:T.muted,
        padding:'6px 9px', fontSize:12, cursor:'pointer', transition:'all 0.15s', lineHeight:1 }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=danger?T.red:T.gold;e.currentTarget.style.color=danger?T.red:T.gold}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=danger?T.red:T.border;e.currentTarget.style.color=danger?T.red:T.muted}}>
      {icon}
    </button>
  )
}

function PanelHeader({ label, sub, children }) {
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, background:'rgba(8,7,10,0.88)', backdropFilter:'blur(8px)',
      padding:'5px 12px', display:'flex', alignItems:'center', gap:8, borderBottom:`1px solid ${T.border}`, height:30 }}>
      <span style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:T.gold, flexShrink:0 }}>{label}</span>
      <span style={{ fontFamily:T.F, fontSize:8, color:T.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</span>
      <div style={{ flex:1 }} />
      {children}
    </div>
  )
}

function SBar({ icon, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      <span style={{ fontSize:9 }}>{icon}</span>
      <span style={{ fontFamily:T.F, fontSize:9, color:T.muted }}>{label}</span>
    </div>
  )
}

function Spinner({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:14 }}>
      <div style={{ width:32, height:32, border:`3px solid rgba(201,162,39,0.15)`, borderTopColor:T.gold, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontFamily:T.F, fontSize:10, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>{label}</span>
    </div>
  )
}
