import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { materials as materialsApi, purchaseOrders as purchaseOrdersApi } from '../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const CATS = ['All','Flooring','Wall Finishes','Wood & Laminates','Hardware','Electrical','Plumbing','Adhesives & Chemicals','Glass & Mirrors','Upholstery']

const INIT = [
  { id:'MAT-001', name:'Italian Marble — Statuario',    cat:'Flooring',           unit:'sqft', qty:420,  minQty:100, maxQty:800,  rate:380,  supplier:'Rajasthan Marbles', location:'Warehouse A-1', lastReceived:'2026-05-28', reserved:120, pendingPO:200 },
  { id:'MAT-002', name:'Vitrified Tiles 800×800mm',     cat:'Flooring',           unit:'boxes',qty:84,   minQty:20,  maxQty:200,  rate:1200, supplier:'Asian Granito',     location:'Warehouse A-2', lastReceived:'2026-06-01', reserved:30,  pendingPO:0 },
  { id:'MAT-003', name:'Teak Wood — Premium Grade',     cat:'Wood & Laminates',   unit:'sqft', qty:340,  minQty:150, maxQty:600,  rate:420,  supplier:'Kerala Timber Co',  location:'Warehouse B-1', lastReceived:'2026-05-20', reserved:240, pendingPO:100 },
  { id:'MAT-004', name:'MDF Board 19mm',                cat:'Wood & Laminates',   unit:'sheets',qty:67,  minQty:30,  maxQty:150,  rate:1800, supplier:'Greenply',          location:'Warehouse B-2', lastReceived:'2026-06-05', reserved:20,  pendingPO:0 },
  { id:'MAT-005', name:'Laminate — Premium Walnut',     cat:'Wood & Laminates',   unit:'sheets',qty:12,  minQty:25,  maxQty:100,  rate:950,  supplier:'Merino Laminates',  location:'Warehouse B-3', lastReceived:'2026-05-15', reserved:0,   pendingPO:30 },
  { id:'MAT-006', name:'Asian Paints — Royale Matt',    cat:'Wall Finishes',      unit:'litres',qty:210, minQty:50,  maxQty:500,  rate:185,  supplier:'Asian Paints',      location:'Paint Store',   lastReceived:'2026-06-08', reserved:80,  pendingPO:0 },
  { id:'MAT-007', name:'Textured Paint — Sand Finish',  cat:'Wall Finishes',      unit:'kg',   qty:85,   minQty:40,  maxQty:200,  rate:220,  supplier:'Nerolac',           location:'Paint Store',   lastReceived:'2026-06-02', reserved:30,  pendingPO:0 },
  { id:'MAT-008', name:'Imported Wallpaper — Damask',   cat:'Wall Finishes',      unit:'rolls', qty:8,   minQty:15,  maxQty:60,   rate:4500, supplier:'Brewster',          location:'Warehouse C-1', lastReceived:'2026-04-10', reserved:8,   pendingPO:20 },
  { id:'MAT-009', name:'Brass Handles — Premium',       cat:'Hardware',           unit:'pcs',  qty:340,  minQty:100, maxQty:600,  rate:285,  supplier:'Ozone Overseas',    location:'Hardware Store',lastReceived:'2026-05-30', reserved:120, pendingPO:0 },
  { id:'MAT-010', name:'Soft-close Hinges',             cat:'Hardware',           unit:'pcs',  qty:480,  minQty:200, maxQty:1000, rate:125,  supplier:'Hettich India',     location:'Hardware Store',lastReceived:'2026-06-01', reserved:200, pendingPO:0 },
  { id:'MAT-011', name:'LED Strip Lights — CCT',        cat:'Electrical',         unit:'mtrs', qty:180,  minQty:80,  maxQty:400,  rate:320,  supplier:'Philips India',     location:'Electrical Bay',lastReceived:'2026-06-03', reserved:60,  pendingPO:100 },
  { id:'MAT-012', name:'CPVC Pipes 25mm',               cat:'Plumbing',           unit:'mtrs', qty:95,   minQty:50,  maxQty:300,  rate:145,  supplier:'Supreme Industries',location:'Warehouse D',   lastReceived:'2026-05-25', reserved:40,  pendingPO:0 },
  { id:'MAT-013', name:'Tile Adhesive — Laticrete',     cat:'Adhesives & Chemicals',unit:'bags',qty:18,  minQty:25,  maxQty:100,  rate:680,  supplier:'Laticrete India',   location:'Chemical Store',lastReceived:'2026-05-18', reserved:10,  pendingPO:30 },
  { id:'MAT-014', name:'Smoked Glass 8mm',              cat:'Glass & Mirrors',    unit:'sqft', qty:220,  minQty:80,  maxQty:400,  rate:290,  supplier:'Saint-Gobain',      location:'Glass Rack',    lastReceived:'2026-06-07', reserved:80,  pendingPO:0 },
  { id:'MAT-015', name:'Fabric — Velvet Charcoal',      cat:'Upholstery',         unit:'mtrs', qty:42,   minQty:20,  maxQty:120,  rate:1200, supplier:'Bombay Dyeing',     location:'Fabric Store',  lastReceived:'2026-05-22', reserved:18,  pendingPO:0 },
]

function status(m) {
  const available = m.qty - m.reserved
  if (available <= 0)          return { label:'OUT OF STOCK', color:'#ef4444' }
  if (m.qty <= m.minQty)       return { label:'LOW STOCK',    color:'#f97316' }
  if (m.qty >= m.maxQty * 0.9) return { label:'OVERSTOCKED',  color:'#8b7355' }
  return { label:'IN STOCK', color:'#22c55e' }
}

function StockBar({ m }) {
  const pct = Math.min(100, (m.qty / m.maxQty) * 100)
  const col = m.qty <= m.minQty ? '#ef4444' : m.qty <= m.minQty * 1.5 ? '#f97316' : gold
  return (
    <div style={{ width:'100%', height:4, background:bdr, marginTop:4 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:col }} />
    </div>
  )
}

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

function mapApiMaterial(m) {
  return {
    id: `MAT-${String(m.id).padStart(3,'0')}`,
    _apiId: m.id,
    name: m.name,
    cat: m.category || 'Other',
    unit: m.unit || 'pcs',
    qty: m.quantity_available || 0,
    minQty: Math.floor((m.quantity_ordered || 20) * 0.2),
    maxQty: m.quantity_ordered || 100,
    rate: m.unit_price || 0,
    supplier: m.vendor_name || 'Unknown',
    location: m.location || 'Warehouse',
    lastReceived: m.updated_at?.slice(0,10) || m.created_at?.slice(0,10) || '',
    reserved: 0,
    pendingPO: 0,
  }
}

export default function InventoryPage() {
  const [items,    setItems]    = useState(INIT)
  const [cat,      setCat]      = useState('All')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [view,     setView]     = useState('grid')  // grid | table
  const [showAdj,  setShowAdj]  = useState(false)
  const [adjQty,   setAdjQty]   = useState('')
  const [adjNote,  setAdjNote]  = useState('')
  const [adjType,  setAdjType]  = useState('ADD')
  const [history,  setHistory]  = useState({})

  useEffect(() => {
    materialsApi.list().then(data => {
      if (data?.length > 0) setItems(data.map(mapApiMaterial))
    }).catch(() => {})
  }, [])

  const filtered = items.filter(m => {
    if (cat !== 'All' && m.cat !== cat) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const lowStock = items.filter(m => m.qty <= m.minQty).length
  const outStock = items.filter(m => m.qty <= m.reserved).length
  const totalValue = items.reduce((s,m) => s + m.qty * m.rate, 0)

  function adjust() {
    const qty = parseInt(adjQty)
    if (!qty || qty <= 0 || !selected) return
    const newQty = adjType === 'ADD' ? selected.qty + qty : Math.max(0, selected.qty - qty)
    setItems(prev => prev.map(m => m.id === selected.id ? { ...m, qty: newQty } : m))
    setHistory(h => ({ ...h, [selected.id]: [{ type:adjType, qty, note:adjNote, ts:new Date().toISOString() }, ...(h[selected.id]||[])] }))
    setSelected(s => ({ ...s, qty: newQty }))
    setAdjQty(''); setAdjNote(''); setShowAdj(false)
  }

  function raisePO(m) {
    const reorderQty = m.maxQty - m.qty
    const poPayload = {
      po_number: `PO-${Date.now()}`,
      project_id: null,
      items: `${m.name} × ${reorderQty} ${m.unit}`,
      total_amount: reorderQty * m.rate,
      status: 'PENDING',
      notes: `Auto-reorder: stock at ${m.qty} (min ${m.minQty})`,
    }
    purchaseOrdersApi.create(poPayload).catch(() => {})
    setHistory(h => ({ ...h, [m.id]: [{ type:'PO', qty: reorderQty, note:`PO raised to ${m.supplier}`, ts: new Date().toISOString() }, ...(h[m.id]||[])] }))
  }

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><rect x="2" y="8" width="16" height="10" stroke={gold} strokeWidth="1.2"/><path d="M5 8V5a5 5 0 0110 0v3" stroke={gold} strokeWidth="1.2"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Inventory <span style={{ color:gold }}>Management</span></p>
        {lowStock > 0 && <span style={{ ...sans, fontSize:10, fontWeight:700, background:'#f97316', color:'#fff', padding:'2px 8px', letterSpacing:'0.08em' }}>{lowStock} LOW</span>}
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', gap:2 }}>
          {['grid','table'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ ...sans, padding:'6px 14px', background:view===v?gold:'transparent', border:`1px solid ${view===v?gold:'#57534e'}`, color:view===v?'#000':'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ padding:28 }}>
        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Total SKUs',      value:items.length,     accent:'#78716c' },
            { label:'Low Stock Items', value:lowStock,         accent:'#f97316' },
            { label:'Out of Stock',    value:outStock,         accent:'#ef4444' },
            { label:'Inventory Value', value:fmt(totalValue),  accent:gold },
          ].map(k => (
            <div key={k.label} style={{ background:'#fff', border:`1px solid ${bdr}`, borderTop:`3px solid ${k.accent}`, padding:'16px 20px' }}>
              <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:'0 0 4px' }}>{k.value}</p>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:0 }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials…"
            style={{ ...sans, padding:'8px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, width:220 }} />
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ ...sans, padding:'5px 12px', border:`1px solid ${cat===c?gold:bdr}`, background:cat===c?`${gold}12`:'#fff', color:cat===c?dark:stone, fontSize:10, fontWeight:cat===c?700:400, letterSpacing:'0.08em', cursor:'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid view */}
        {view === 'grid' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
            {filtered.map(m => {
              const s = status(m)
              const available = m.qty - m.reserved
              return (
                <div key={m.id} onClick={() => setSelected(m)}
                  style={{ background:'#fff', border:`1px solid ${selected?.id===m.id?gold:bdr}`, padding:'18px 18px 14px', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=`${gold}60`}
                  onMouseLeave={e => { if(selected?.id!==m.id) e.currentTarget.style.borderColor=bdr }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <p style={{ ...sans, fontSize:8.5, color:stone, margin:0, letterSpacing:'0.08em' }}>{m.id} · {m.cat}</p>
                    <span style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:s.color, border:`1px solid ${s.color}`, padding:'1px 6px' }}>{s.label}</span>
                  </div>
                  <p style={{ ...sans, fontSize:12.5, color:dark, fontWeight:600, margin:'0 0 12px', lineHeight:1.4 }}>{m.name}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ ...sans, fontSize:11, color:stone }}>In stock</span>
                    <span style={{ ...sans, fontSize:13, color:dark, fontWeight:700 }}>{m.qty} <span style={{ fontSize:9, color:stone, fontWeight:400 }}>{m.unit}</span></span>
                  </div>
                  <StockBar m={m} />
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:10 }}>
                    <span style={{ ...sans, fontSize:9.5, color:stone }}>Available: {available} {m.unit}</span>
                    <span style={{ ...sans, fontSize:9.5, color:stone }}>{fmt(m.rate)}/{m.unit}</span>
                  </div>
                  {m.qty <= m.minQty && (
                    <button onClick={e => { e.stopPropagation(); raisePO(m) }}
                      style={{ ...sans, width:'100%', marginTop:10, padding:'7px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
                      Raise PO →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Table view */}
        {view === 'table' && (
          <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:dark }}>
                  {['ID','Material','Category','Qty','Reserved','Available','Min','Rate','Status',''].map(h => (
                    <th key={h} style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#78716c', padding:'10px 12px', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const s = status(m)
                  const avail = m.qty - m.reserved
                  return (
                    <tr key={m.id} onClick={() => setSelected(m)} style={{ borderBottom:`1px solid ${bdr}`, cursor:'pointer', background:m.qty<=m.minQty?'#fff8f0':'#fff' }}
                      onMouseEnter={e => e.currentTarget.style.background=`${gold}06`}
                      onMouseLeave={e => e.currentTarget.style.background=m.qty<=m.minQty?'#fff8f0':'#fff'}>
                      <td style={{ ...sans, fontSize:10, color:stone, padding:'9px 12px', fontFamily:'monospace' }}>{m.id}</td>
                      <td style={{ ...sans, fontSize:11.5, color:dark, padding:'9px 12px', fontWeight:500 }}>{m.name}</td>
                      <td style={{ ...sans, fontSize:10, color:stone, padding:'9px 12px' }}>{m.cat}</td>
                      <td style={{ ...sans, fontSize:12, color:dark, padding:'9px 12px', fontWeight:700 }}>{m.qty}<span style={{ fontSize:9, color:stone, fontWeight:400 }}> {m.unit}</span></td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'9px 12px' }}>{m.reserved}</td>
                      <td style={{ ...sans, fontSize:11, color:avail<=0?'#ef4444':avail<=m.minQty?'#f97316':dark, padding:'9px 12px', fontWeight:600 }}>{avail}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'9px 12px' }}>{m.minQty}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'9px 12px' }}>{fmt(m.rate)}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <span style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:s.color, border:`1px solid ${s.color}`, padding:'2px 6px' }}>{s.label}</span>
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        {m.qty <= m.minQty && (
                          <button onClick={e => { e.stopPropagation(); raisePO(m) }}
                            style={{ ...sans, padding:'4px 10px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>PO</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail side panel */}
      {selected && (
        <div style={{ position:'fixed', top:64, right:0, bottom:0, width:360, background:'#fff', borderLeft:`1px solid ${bdr}`, overflowY:'auto', padding:24, zIndex:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <p style={{ ...sans, fontSize:9, color:stone, margin:'0 0 4px', letterSpacing:'0.1em' }}>{selected.id}</p>
              <p style={{ ...serif, fontSize:20, fontWeight:300, color:dark, margin:0 }}>{selected.name}</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>✕</button>
          </div>

          {/* Stock gauge */}
          <div style={{ background:dark, padding:'16px 18px', marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ ...sans, fontSize:9, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.1em' }}>Stock Level</span>
              <span style={{ ...sans, fontSize:9, color:'#78716c' }}>Max: {selected.maxQty} {selected.unit}</span>
            </div>
            <div style={{ height:8, background:'#292524' }}>
              <div style={{ height:'100%', width:`${Math.min(100,(selected.qty/selected.maxQty)*100)}%`, background:selected.qty<=selected.minQty?'#ef4444':gold }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              <span style={{ ...sans, fontSize:10, color:'#78716c' }}>Min: {selected.minQty}</span>
              <span style={{ ...serif, fontSize:22, fontWeight:300, color:gold }}>{selected.qty} <span style={{ fontSize:12, color:'#78716c' }}>{selected.unit}</span></span>
            </div>
          </div>

          {/* Details */}
          {[
            ['Category',      selected.cat],
            ['Supplier',      selected.supplier],
            ['Location',      selected.location],
            ['Unit Rate',     fmt(selected.rate) + '/' + selected.unit],
            ['Reserved',      `${selected.reserved} ${selected.unit}`],
            ['Available',     `${selected.qty - selected.reserved} ${selected.unit}`],
            ['Pending PO',    selected.pendingPO ? `${selected.pendingPO} ${selected.unit}` : 'None'],
            ['Last Received', new Date(selected.lastReceived).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
            ['Stock Value',   fmt(selected.qty * selected.rate)],
          ].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
              <span style={{ ...sans, fontSize:9.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:stone }}>{k}</span>
              <span style={{ ...sans, fontSize:11, color:dark }}>{v}</span>
            </div>
          ))}

          {/* Adjustment history */}
          {history[selected.id]?.length > 0 && (
            <div style={{ marginTop:16 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Adjustment History</p>
              {history[selected.id].map((h,i) => (
                <div key={i} style={{ padding:'8px 10px', background:light, border:`1px solid ${bdr}`, marginBottom:4 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ ...sans, fontSize:10, color:h.type==='ADD'?'#22c55e':'#ef4444', fontWeight:700 }}>{h.type === 'ADD' ? `+${h.qty}` : `-${h.qty}`} {selected.unit}</span>
                    <span style={{ ...sans, fontSize:9, color:stone }}>{new Date(h.ts).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                  </div>
                  {h.note && <p style={{ ...sans, fontSize:10, color:stone, margin:'2px 0 0' }}>{h.note}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            <button onClick={() => setShowAdj(true)}
              style={{ ...sans, flex:1, padding:'10px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
              Adjust Stock
            </button>
            <button onClick={() => raisePO(selected)}
              style={{ ...sans, flex:1, padding:'10px', background:'#fff', border:`1px solid ${bdr}`, color:dark, fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
              Raise PO
            </button>
          </div>
        </div>
      )}

      {/* Adjustment modal */}
      {showAdj && selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:60, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', width:380, padding:28 }}>
            <p style={{ ...serif, fontSize:22, fontWeight:300, color:dark, margin:'0 0 4px' }}>Adjust Stock</p>
            <p style={{ ...sans, fontSize:11, color:stone, margin:'0 0 20px' }}>{selected.name} · Current: {selected.qty} {selected.unit}</p>
            <div style={{ display:'flex', gap:0, marginBottom:16 }}>
              {['ADD','REMOVE'].map(t => (
                <button key={t} onClick={() => setAdjType(t)}
                  style={{ ...sans, flex:1, padding:'10px', border:`1px solid ${adjType===t?gold:bdr}`, background:adjType===t?gold:'#fff', color:adjType===t?'#000':stone, fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
                  {t === 'ADD' ? '+ Add Stock' : '− Remove Stock'}
                </button>
              ))}
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>Quantity ({selected.unit})</label>
              <input type="number" value={adjQty} onChange={e => setAdjQty(e.target.value)} placeholder="Enter quantity"
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>Reason / Note</label>
              <input value={adjNote} onChange={e => setAdjNote(e.target.value)} placeholder="e.g. Used in PRJ-0012 installation"
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowAdj(false)} style={{ ...sans, flex:1, padding:'10px', background:'#fff', border:`1px solid ${bdr}`, color:stone, fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Cancel</button>
              <button onClick={adjust} disabled={!adjQty||parseInt(adjQty)<=0}
                style={{ ...sans, flex:1, padding:'10px', background:adjQty?gold:'#e7e5e4', border:'none', color:adjQty?'#000':'#a8a29e', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:adjQty?'pointer':'default' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
