import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { materials as materialsApi } from '../../lib/api'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bdr   = '#e7e5e4'

const PROJECTS = ['Nair Residence','Kapoor Office','Sharma Villa','Mehta Penthouse','Sundar Restaurant']
const AREAS    = ['Living Room','Master Bedroom','Kitchen','Bathrooms','Dining','Study','Lobby','All Areas']
const FINISHES = ['Matte','Gloss','Satin','Textured','Polished','Brushed','Natural']
const STATUSES = ['SPECIFIED','APPROVED','ORDERED','DELIVERED','INSTALLED','SUBSTITUTED']
const STATUS_C = {
  SPECIFIED:  { bg:'#f5f4f2', color:stone },
  APPROVED:   { bg:'#fffbeb', color:'#d97706' },
  ORDERED:    { bg:'#eff6ff', color:'#2563eb' },
  DELIVERED:  { bg:'#f0fdf4', color:'#16a34a' },
  INSTALLED:  { bg:'#f0fdf4', color:'#166534' },
  SUBSTITUTED:{ bg:'#fef2f2', color:'#dc2626' },
}

const SEED = {
  'Nair Residence': [
    { id:1,  area:'Living Room',   item:'Engineered Wood Flooring', brand:'Pergo',       model:'Sensation Oak',       finish:'Matte',    size:'1220×200×8mm', qty:'320 sqft', unit:'sqft', rate:185, vendor:'Rajesh Timbers',   status:'INSTALLED',  note:'Herringbone pattern' },
    { id:2,  area:'Living Room',   item:'False Ceiling Grid',       brand:'Armstrong',   model:'Ultima+ 600×600',     finish:'Matte',    size:'600×600mm',    qty:'290 sqft', unit:'sqft', rate:95,  vendor:'LocalFab Works',   status:'INSTALLED',  note:'' },
    { id:3,  area:'Living Room',   item:'Wall Paint',               brand:'Asian Paints',model:'Royale Luxury Emulsion',finish:'Matte',  size:'',             qty:'4 cans',   unit:'can',  rate:3800,vendor:'National Paints',  status:'INSTALLED',  note:'Colour: SW7015 Repose Gray' },
    { id:4,  area:'Kitchen',       item:'Quartz Countertop',        brand:'Silestone',   model:'Lyra Quartz White',   finish:'Polished', size:'25mm thick',   qty:'42 sqft',  unit:'sqft', rate:850, vendor:'Stone Imports',    status:'INSTALLED',  note:'Waterfall edge on island' },
    { id:5,  area:'Kitchen',       item:'Modular Cabinet',          brand:'Hettich',     model:'InnoTech Atira',      finish:'Gloss',    size:'18mm Marine Ply',qty:'1 set', unit:'set',  rate:185000,vendor:'Local Workshop', status:'INSTALLED',  note:'Lacquer finish doors' },
    { id:6,  area:'Master Bedroom',item:'Wallpaper',                brand:'Brewster',    model:'Shimmering Foliage',  finish:'Textured', size:'',             qty:'180 sqft', unit:'sqft', rate:120, vendor:'Decor House',      status:'APPROVED',   note:'Feature wall only' },
    { id:7,  area:'Master Bedroom',item:'Wardrobe Shutters',        brand:'Hafele',      model:'Matrix Box P',        finish:'Satin',    size:'2400H per unit',qty:'3 units',unit:'unit', rate:42000,vendor:'Local Workshop', status:'ORDERED',    note:'Sliding doors, soft-close' },
    { id:8,  area:'Bathrooms',     item:'Ceramic Wall Tiles',       brand:'Kajaria',     model:'Eternity Calacatta',  finish:'Gloss',    size:'600×900mm',    qty:'420 sqft', unit:'sqft', rate:145, vendor:'Tile World',       status:'DELIVERED',  note:'Master bath + 2 baths' },
    { id:9,  area:'Bathrooms',     item:'Sanitary Ware',            brand:'Kohler',      model:'Veil Suite',          finish:'Gloss',    size:'Wall-hung',    qty:'3 sets',   unit:'set',  rate:28000,vendor:'Kohler Showroom', status:'DELIVERED',  note:'' },
    { id:10, area:'Dining',        item:'Pendant Light',            brand:'Flos',        model:'Aim Small',           finish:'Brushed',  size:'Ø220mm',       qty:'3 nos',    unit:'no',   rate:18500,vendor:'Light Studio',    status:'ORDERED',    note:'3× cluster above dining table' },
  ],
  'Kapoor Office': [
    { id:11, area:'Lobby',         item:'Vitrified Tiles',          brand:'Somany',      model:'GVT Silkwood',        finish:'Polished', size:'800×800mm',    qty:'650 sqft', unit:'sqft', rate:165, vendor:'Tile World',       status:'INSTALLED',  note:'Double-loaded body' },
    { id:12, area:'All Areas',     item:'Suspended Ceiling',        brand:'Saint-Gobain',model:'Gyproc Activ Air',    finish:'Matte',    size:'1200×600mm',   qty:'3800 sqft',unit:'sqft', rate:88,  vendor:'LocalFab Works',   status:'INSTALLED',  note:'' },
    { id:13, area:'All Areas',     item:'Carpet Tiles',             brand:'Interface',   model:'Touch & Tones 101',   finish:'Textured', size:'500×500mm',    qty:'2200 sqft',unit:'sqft', rate:220, vendor:'Floor Depot',      status:'INSTALLED',  note:'Workstation zones' },
  ],
}

function totalCost(items) {
  return items.reduce((a, m) => {
    const qty = parseFloat(m.qty) || 1
    return a + qty * m.rate
  }, 0)
}

function fmt(n) { return '₹' + Number(Math.round(n)).toLocaleString('en-IN') }

export default function MaterialSpecPage() {
  const nav = useNavigate()
  const [project, setProject] = useState('Nair Residence')
  const [specs, setSpecs]     = useState(SEED)

  useEffect(() => {
    materialsApi.list()
      .then(data => { if (Array.isArray(data) && data.length) setSpecs(prev => ({ ...prev, _api: data })) })
      .catch(() => {})
  }, [])
  const [areaFilter, setAreaFilter] = useState('All Areas')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sel, setSel]         = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ area:'Living Room', item:'', brand:'', model:'', finish:'Matte', size:'', qty:'', unit:'sqft', rate:'', vendor:'', status:'SPECIFIED', note:'' })
  const [exported, setExported] = useState(false)

  const items = specs[project] || []
  const areas = ['All Areas', ...new Set(items.map(m => m.area))]

  const filtered = items.filter(m => {
    if (areaFilter !== 'All Areas' && m.area !== areaFilter) return false
    if (statusFilter !== 'All' && m.status !== statusFilter) return false
    return true
  })

  function addItem() {
    if (!form.item || !form.brand) return
    const newItem = { ...form, id: Date.now(), rate: parseFloat(form.rate)||0 }
    setSpecs(prev => ({ ...prev, [project]: [...(prev[project]||[]), newItem] }))
    setShowAdd(false)
    setForm({ area:'Living Room', item:'', brand:'', model:'', finish:'Matte', size:'', qty:'', unit:'sqft', rate:'', vendor:'', status:'SPECIFIED', note:'' })
  }

  function updateStatus(id, status) {
    setSpecs(prev => ({
      ...prev,
      [project]: prev[project].map(m => m.id===id ? {...m, status} : m)
    }))
    if (sel?.id === id) setSel(prev => ({...prev, status}))
  }

  function simulateExport() {
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  const cost = totalCost(filtered)

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', ...sans }}>
      {/* Header */}
      <div style={{ background:dark, borderBottom:`2px solid ${gold}`, padding:'0 32px', display:'flex', alignItems:'center', height:56, gap:20 }}>
        <svg width="28" height="28" viewBox="0 0 40 40"><rect width="40" height="40" fill={gold}/><text x="8" y="27" fontSize="18" fontWeight="700" fill={dark} fontFamily="serif">ES</text></svg>
        <span style={{ ...serif, fontSize:18, color:'#fff', letterSpacing:'0.04em', fontWeight:600 }}>Material Specification Sheet</span>
        <div style={{ flex:1 }}/>
        {exported && <span style={{ ...sans, fontSize:11, color:'#86efac' }}>✓ Exported to PDF</span>}
        <button onClick={simulateExport} style={{ ...sans, fontSize:11, fontWeight:600, background:'none', border:`1px solid #3a3330`, color:'#a8a29e', padding:'6px 14px', cursor:'pointer', letterSpacing:'0.06em', marginRight:8 }}>⬇ EXPORT PDF</button>
        <button onClick={()=>nav('/dashboard')} style={{ ...sans, fontSize:12, color:'#a8a29e', background:'none', border:'none', cursor:'pointer' }}>← Dashboard</button>
      </div>

      {/* Project selector + KPI */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${bdr}`, padding:'12px 24px', display:'flex', gap:12, alignItems:'center' }}>
        <span style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone }}>Project:</span>
        <select value={project} onChange={e=>{setProject(e.target.value);setSel(null);setAreaFilter('All Areas')}}
          style={{ ...sans, fontSize:13, fontWeight:600, color:dark, border:`1px solid ${bdr}`, padding:'6px 12px', background:'#fff', outline:'none' }}>
          {PROJECTS.map(p=><option key={p}>{p}</option>)}
        </select>
        <div style={{ flex:1 }}/>
        {[
          ['Total Items', items.length],
          ['Approved', items.filter(m=>m.status==='APPROVED'||m.status==='ORDERED'||m.status==='DELIVERED'||m.status==='INSTALLED').length],
          ['Pending', items.filter(m=>m.status==='SPECIFIED').length],
          ['Total Value', fmt(totalCost(items))],
        ].map(([l,v])=>(
          <div key={l} style={{ textAlign:'right', paddingLeft:24, borderLeft:`1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'0 0 2px' }}>{l}</p>
            <p style={{ ...serif, fontSize:18, color:dark, margin:0, fontWeight:600 }}>{v}</p>
          </div>
        ))}
        <button onClick={()=>setShowAdd(true)} style={{ ...sans, fontSize:11, fontWeight:700, background:gold, color:dark, border:'none', padding:'8px 16px', cursor:'pointer', letterSpacing:'0.08em', marginLeft:16 }}>+ ADD ITEM</button>
      </div>

      {/* Filter bar */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${bdr}`, padding:'8px 24px', display:'flex', gap:8, alignItems:'center' }}>
        {areas.map(a=>(
          <button key={a} onClick={()=>setAreaFilter(a)}
            style={{ ...sans, fontSize:11, padding:'4px 12px', background: areaFilter===a?dark:'#fff', color: areaFilter===a?'#fff':stone, border:`1px solid ${areaFilter===a?dark:bdr}`, cursor:'pointer' }}>
            {a}
          </button>
        ))}
        <div style={{ width:1, height:20, background:bdr, margin:'0 4px' }}/>
        {['All',...STATUSES].map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)}
            style={{ ...sans, fontSize:10, padding:'3px 10px', background: statusFilter===s?`${gold}20`:'transparent', color: statusFilter===s?gold:stone, border:`1px solid ${statusFilter===s?gold:bdr}`, cursor:'pointer', letterSpacing:'0.06em' }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 154px)' }}>
        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <p style={{ ...serif, fontSize:20, color:stone }}>No items match the filter</p>
            </div>
          )}

          {/* Table */}
          {filtered.length > 0 && (
            <div style={{ background:'#fff', margin:'16px 24px', border:`1px solid ${bdr}` }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1.2fr 0.8fr 0.6fr 0.8fr 0.8fr 0.7fr 0.8fr 0.9fr', padding:'8px 16px', background:'#f9f8f6', borderBottom:`1px solid ${bdr}` }}>
                {['Area','Item','Brand / Model','Finish','Size','Qty','Unit Rate','Total','Vendor','Status'].map(h=>(
                  <span key={h} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone }}>{h}</span>
                ))}
              </div>

              {filtered.map((m,i)=>{
                const qty = parseFloat(m.qty)||1
                const total = qty * m.rate
                const sc = STATUS_C[m.status]||{}
                const active = sel?.id===m.id
                return (
                  <div key={m.id} onClick={()=>setSel(active?null:m)}
                    style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1.2fr 0.8fr 0.6fr 0.8fr 0.8fr 0.7fr 0.8fr 0.9fr', padding:'10px 16px', borderBottom:i<filtered.length-1?`1px solid ${bdr}`:'none', cursor:'pointer', background: active?`${gold}06`:'transparent', alignItems:'center' }}
                    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background=`${gold}04` }}
                    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent' }}>
                    <span style={{ ...sans, fontSize:10, color:stone, background:'#f5f4f2', padding:'1px 6px', display:'inline-block' }}>{m.area}</span>
                    <span style={{ ...sans, fontSize:11, fontWeight:600, color:dark }}>{m.item}</span>
                    <div>
                      <p style={{ ...sans, fontSize:11, fontWeight:500, color:dark, margin:0 }}>{m.brand}</p>
                      <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{m.model}</p>
                    </div>
                    <span style={{ ...sans, fontSize:10, color:stone }}>{m.finish}</span>
                    <span style={{ ...sans, fontSize:10, color:stone }}>{m.size||'—'}</span>
                    <span style={{ ...sans, fontSize:11, color:dark, fontWeight:500 }}>{m.qty} {m.unit}</span>
                    <span style={{ ...sans, fontSize:11, color:stone }}>₹{m.rate.toLocaleString('en-IN')}</span>
                    <span style={{ ...sans, fontSize:11, fontWeight:600, color:dark }}>{fmt(total)}</span>
                    <span style={{ ...sans, fontSize:10, color:stone }}>{m.vendor}</span>
                    <select value={m.status} onClick={e=>e.stopPropagation()} onChange={e=>updateStatus(m.id,e.target.value)}
                      style={{ ...sans, fontSize:9, fontWeight:700, padding:'2px 4px', background:sc.bg, color:sc.color, border:`1px solid ${sc.color}30`, cursor:'pointer', letterSpacing:'0.04em', outline:'none' }}>
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                )
              })}

              {/* Total row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1.2fr 0.8fr 0.6fr 0.8fr 0.8fr 0.7fr 0.8fr 0.9fr', padding:'10px 16px', background:'#1c1917', alignItems:'center' }}>
                <span style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a8a29e', gridColumn:'1/7' }}>Filtered Total ({filtered.length} items)</span>
                <span style={{ ...serif, fontSize:18, color:gold, fontWeight:700, gridColumn:'7/9', textAlign:'right' }}>{fmt(cost)}</span>
                <span style={{ gridColumn:'9/11' }}/>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ width:300, background:'#fff', borderLeft:`1px solid ${bdr}`, padding:24, overflowY:'auto', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <span style={{ ...serif, fontSize:16, color:dark, fontWeight:600 }}>Item Detail</span>
              <button onClick={()=>setSel(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>×</button>
            </div>
            <div style={{ background:`${gold}08`, border:`1px solid ${gold}30`, padding:14, marginBottom:16 }}>
              <p style={{ ...sans, fontSize:14, fontWeight:700, color:dark, margin:'0 0 2px' }}>{sel.item}</p>
              <p style={{ ...sans, fontSize:11, color:stone, margin:'0 0 6px' }}>{sel.brand} — {sel.model}</p>
              <span style={{ ...sans, fontSize:9, fontWeight:700, padding:'2px 8px', background:STATUS_C[sel.status]?.bg, color:STATUS_C[sel.status]?.color, letterSpacing:'0.06em' }}>{sel.status}</span>
            </div>
            {[
              ['Area', sel.area],
              ['Finish', sel.finish],
              ['Size / Spec', sel.size||'—'],
              ['Quantity', sel.qty+' '+sel.unit],
              ['Unit Rate', '₹'+sel.rate.toLocaleString('en-IN')],
              ['Total Cost', fmt((parseFloat(sel.qty)||1)*sel.rate)],
              ['Vendor', sel.vendor],
            ].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                <span style={{ ...sans, fontSize:10, color:stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>{k}</span>
                <span style={{ ...sans, fontSize:11, color:dark, textAlign:'right', maxWidth:160 }}>{v}</span>
              </div>
            ))}
            {sel.note && (
              <div style={{ marginTop:12, background:'#fafaf9', border:`1px solid ${bdr}`, padding:10 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>Note</p>
                <p style={{ ...sans, fontSize:11, color:dark, margin:0 }}>{sel.note}</p>
              </div>
            )}
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'16px 0 8px' }}>Update Status</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {STATUSES.map(s=>{
                const sc = STATUS_C[s]||{}
                return (
                  <button key={s} onClick={()=>updateStatus(sel.id,s)}
                    style={{ ...sans, fontSize:9, fontWeight:700, padding:'4px 10px', background: sel.status===s?sc.color:'#fff', color: sel.status===s?'#fff':sc.color, border:`1px solid ${sc.color}`, cursor:'pointer', letterSpacing:'0.06em' }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', width:520, padding:28, border:`1px solid ${bdr}`, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ ...serif, fontSize:20, color:dark, fontWeight:600 }}>Add Material Item</span>
              <button onClick={()=>setShowAdd(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:stone }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                ['Area', 'area', 'select', AREAS.slice(0,-1)],
                ['Status', 'status', 'select', STATUSES],
                ['Item Name *', 'item', 'text', 'e.g. Engineered Wood Flooring'],
                ['Brand *', 'brand', 'text', 'e.g. Pergo'],
                ['Model', 'model', 'text', 'e.g. Sensation Oak'],
                ['Finish', 'finish', 'select', FINISHES],
                ['Size / Spec', 'size', 'text', 'e.g. 1220×200×8mm'],
                ['Quantity', 'qty', 'text', 'e.g. 320'],
                ['Unit', 'unit', 'text', 'e.g. sqft, nos, set'],
                ['Unit Rate (₹)', 'rate', 'text', 'e.g. 185'],
                ['Vendor', 'vendor', 'text', 'Vendor name'],
                ['Note', 'note', 'text', 'Any remarks'],
              ].map(([label,key,type,opts])=>(
                <div key={key} style={{ gridColumn: key==='note'?'1/3':'auto' }}>
                  <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, display:'block', marginBottom:4 }}>{label}</label>
                  {type==='select' ? (
                    <select value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                      style={{ ...sans, width:'100%', padding:'7px 10px', border:`1px solid ${bdr}`, fontSize:12, background:'#fff', outline:'none' }}>
                      {opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                      placeholder={opts} style={{ ...sans, width:'100%', padding:'7px 10px', border:`1px solid ${bdr}`, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addItem} style={{ ...sans, width:'100%', marginTop:16, padding:11, background:gold, color:dark, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, letterSpacing:'0.1em' }}>ADD TO SPEC SHEET</button>
          </div>
        </div>
      )}
    </div>
  )
}
