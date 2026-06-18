import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendors as vendorsApi, purchaseOrders as purchaseOrdersApi } from '../../lib/api'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bdr   = '#e7e5e4'

const STATUS_COLOR = {
  'CONFIRMED':  { bg:'#f0fdf4', color:'#16a34a' },
  'PENDING':    { bg:'#fffbeb', color:'#d97706' },
  'SHIPPED':    { bg:'#eff6ff', color:'#2563eb' },
  'DELIVERED':  { bg:'#f0fdf4', color:'#16a34a' },
  'CANCELLED':  { bg:'#fef2f2', color:'#dc2626' },
  'OVERDUE':    { bg:'#fef2f2', color:'#dc2626' },
  'PAID':       { bg:'#f0fdf4', color:'#16a34a' },
  'UNPAID':     { bg:'#fffbeb', color:'#d97706' },
}

const VENDORS = [
  { id:'V01', name:'Rajesh Timbers & Ply',     cat:'Wood & Ply',        rating:4.6, contact:'Rajesh Kumar',    phone:'+91 98400 11122', city:'Chennai', joined:'2024-01-15', totalOrders:28, completedOrders:26 },
  { id:'V02', name:'National Paints Depot',    cat:'Paints & Finishes', rating:4.2, contact:'Sunil Mehta',     phone:'+91 98400 33344', city:'Mumbai',  joined:'2024-03-01', totalOrders:42, completedOrders:40 },
  { id:'V03', name:'Polished Stone Imports',   cat:'Stone & Tiles',     rating:4.8, contact:'Anwar Shaikh',    phone:'+91 98400 55566', city:'Jaipur',  joined:'2023-11-20', totalOrders:19, completedOrders:19 },
  { id:'V04', name:'Electra Wiring Solutions', cat:'Electrical',        rating:4.4, contact:'Geetha Pillai',   phone:'+91 98400 77788', city:'Bangalore',joined:'2024-02-10', totalOrders:34, completedOrders:31 },
  { id:'V05', name:'SteelCraft Fabricators',   cat:'Steel & Metal',     rating:4.7, contact:'Vinod Nair',      phone:'+91 98400 99900', city:'Pune',    joined:'2023-09-05', totalOrders:15, completedOrders:14 },
]

const POS = [
  { id:'PO-0041', vendor:'V01', project:'Nair Residence',    items:'Teak Veneer Sheets × 120 sqft',  value:48000,  status:'DELIVERED', ordered:'2026-05-10', due:'2026-05-20', delivered:'2026-05-19' },
  { id:'PO-0042', vendor:'V02', project:'Nair Residence',    items:'Asian Paints Premium Emulsion',   value:22500,  status:'CONFIRMED', ordered:'2026-05-28', due:'2026-06-05', delivered:null },
  { id:'PO-0043', vendor:'V03', project:'Kapoor Office',     items:'Carrara Marble Tiles 600×600',    value:135000, status:'SHIPPED',   ordered:'2026-05-15', due:'2026-05-30', delivered:null },
  { id:'PO-0044', vendor:'V04', project:'Kapoor Office',     items:'MCB Panel Board + Wiring Kit',    value:31000,  status:'DELIVERED', ordered:'2026-05-08', due:'2026-05-18', delivered:'2026-05-17' },
  { id:'PO-0045', vendor:'V05', project:'Sharma Villa',      items:'SS Railing 40 RFT + Handrail',    value:68000,  status:'PENDING',   ordered:'2026-06-01', due:'2026-06-15', delivered:null },
  { id:'PO-0046', vendor:'V01', project:'Mehta Penthouse',   items:'Marine Ply 18mm × 80 sheets',     value:56000,  status:'CONFIRMED', ordered:'2026-06-02', due:'2026-06-12', delivered:null },
  { id:'PO-0047', vendor:'V03', project:'Sundar Restaurant', items:'Granite Counter Slab × 3 slabs',  value:92000,  status:'OVERDUE',   ordered:'2026-05-20', due:'2026-06-01', delivered:null },
  { id:'PO-0048', vendor:'V02', project:'Sharma Villa',      items:'Berger Silk Luxury Paint 20L ×8', value:18400,  status:'DELIVERED', ordered:'2026-05-12', due:'2026-05-22', delivered:'2026-05-21' },
]

const INVOICES = [
  { id:'INV-V001', poId:'PO-0041', vendor:'V01', amount:48000,  gst:8640,  total:56640,  status:'PAID',   date:'2026-05-22' },
  { id:'INV-V002', poId:'PO-0044', vendor:'V04', amount:31000,  gst:5580,  total:36580,  status:'PAID',   date:'2026-05-20' },
  { id:'INV-V003', poId:'PO-0048', vendor:'V02', amount:18400,  gst:3312,  total:21712,  status:'PAID',   date:'2026-05-24' },
  { id:'INV-V004', poId:'PO-0043', vendor:'V03', amount:135000, gst:24300, total:159300, status:'UNPAID', date:'2026-06-01' },
  { id:'INV-V005', poId:'PO-0042', vendor:'V02', amount:22500,  gst:4050,  total:26550,  status:'UNPAID', date:'2026-06-03' },
]

function fmt(n) { return '₹'+n.toLocaleString('en-IN') }
function stars(r) {
  return Array.from({length:5},(_,i)=>(
    <span key={i} style={{ color: i<Math.floor(r)?gold:'#d4d0cc', fontSize:11 }}>■</span>
  ))
}

function mapApiVendor(v) {
  return {
    id: String(v.id),
    _apiId: v.id,
    name: v.name,
    cat: v.category || 'General',
    rating: v.rating || 0,
    contact: v.contact_name || '',
    phone: v.phone || '',
    city: v.city || '',
    joined: v.created_at?.slice(0,10) || '',
    totalOrders: 0,
    completedOrders: 0,
  }
}

function mapApiPO(p) {
  const items = typeof p.items === 'string' ? p.items : JSON.stringify(p.items || [])
  return {
    id: `PO-${String(p.id).padStart(4,'0')}`,
    _apiId: p.id,
    vendor: String(p.vendor_id),
    project: p.project_name || '',
    items: items.replace(/^\[|]$/g,'').replace(/"/g,'') || 'Order items',
    value: p.total_amount || 0,
    status: p.status || 'PENDING',
    ordered: p.created_at?.slice(0,10) || '',
    due: p.expected_delivery?.slice(0,10) || '',
    delivered: p.status === 'DELIVERED' ? p.updated_at?.slice(0,10) : null,
  }
}

export default function VendorPortalPage() {
  const nav = useNavigate()
  const [tab, setTab] = useState('vendors')
  const [selV, setSelV] = useState(null)
  const [selPO, setSelPO] = useState(null)
  const [vendors, setVendors] = useState(VENDORS)
  const [pos, setPOs] = useState(POS)
  const [updateMsg, setUpdateMsg] = useState(null)

  useEffect(() => {
    vendorsApi.list().then(data => {
      if (data?.length > 0) setVendors(data.map(mapApiVendor))
    }).catch(() => {})
    purchaseOrdersApi.list().then(data => {
      if (data?.length > 0) setPOs(data.map(mapApiPO))
    }).catch(() => {})
  }, [])

  function advanceStatus(poId) {
    const flow = ['PENDING','CONFIRMED','SHIPPED','DELIVERED']
    const po = pos.find(p => p.id === poId)
    const idx = flow.indexOf(po?.status)
    const next = idx < flow.length-1 ? flow[idx+1] : po?.status
    if (po?._apiId) purchaseOrdersApi.updateStatus(po._apiId, next).catch(() => {})
    setPOs(prev => prev.map(p => {
      if (p.id !== poId) return p
      return {...p, status: next, delivered: next==='DELIVERED'?new Date().toISOString().slice(0,10):p.delivered}
    }))
    setUpdateMsg('Status updated')
    setTimeout(()=>setUpdateMsg(null), 2000)
  }

  const vMap = Object.fromEntries(vendors.map(v=>[v.id,v]))
  const activePos = pos.filter(p=>p.status!=='DELIVERED'&&p.status!=='CANCELLED')
  const overduePos = pos.filter(p=>p.status==='OVERDUE')
  const totalSpend = INVOICES.filter(i=>i.status==='PAID').reduce((a,i)=>a+i.total,0)

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', ...sans }}>
      {/* Header */}
      <div style={{ background:dark, borderBottom:`2px solid ${gold}`, padding:'0 32px', display:'flex', alignItems:'center', height:56, gap:20 }}>
        <svg width="28" height="28" viewBox="0 0 40 40"><rect width="40" height="40" fill={gold}/><text x="8" y="27" fontSize="18" fontWeight="700" fill={dark} fontFamily="serif">ES</text></svg>
        <span style={{ ...serif, fontSize:18, color:'#fff', letterSpacing:'0.04em', fontWeight:600 }}>Vendor Portal</span>
        <div style={{ flex:1 }}/>
        {updateMsg && <span style={{ ...sans, fontSize:11, color:'#86efac', background:'rgba(34,197,94,0.1)', padding:'4px 12px', border:'1px solid rgba(134,239,172,0.3)' }}>{updateMsg}</span>}
        <button onClick={()=>nav('/dashboard')} style={{ ...sans, fontSize:12, color:'#a8a29e', background:'none', border:'none', cursor:'pointer' }}>← Dashboard</button>
      </div>

      {/* KPI */}
      <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${bdr}`, background:'#fff' }}>
        {[
          ['Active Vendors', vendors.length],
          ['Open POs', activePos.length],
          ['Overdue POs', overduePos.length],
          ['Total Paid', fmt(totalSpend)],
          ['Pending Payment', fmt(INVOICES.filter(i=>i.status==='UNPAID').reduce((a,i)=>a+i.total,0))],
        ].map(([l,v])=>(
          <div key={l} style={{ flex:1, padding:'14px 20px', borderRight:`1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{l}</p>
            <p style={{ ...serif, fontSize:24, color:dark, margin:0, fontWeight:600 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${bdr}`, display:'flex', padding:'0 24px', gap:0 }}>
        {[['vendors','Vendors'],['pos','Purchase Orders'],['invoices','Invoices']].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)}
            style={{ ...sans, fontSize:12, fontWeight:600, padding:'12px 20px', background:'none', border:'none', borderBottom: tab===key?`2px solid ${gold}`:'2px solid transparent', color: tab===key?gold:stone, cursor:'pointer', letterSpacing:'0.06em', marginBottom:-1 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 162px)' }}>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>

          {/* VENDORS TAB */}
          {tab==='vendors' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
              {vendors.map(v=>(
                <div key={v.id} onClick={()=>setSelV(v)}
                  style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px', cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=gold}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=bdr}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <p style={{ ...sans, fontSize:13, fontWeight:600, color:dark, margin:'0 0 2px' }}>{v.name}</p>
                      <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{v.cat} · {v.city}</p>
                    </div>
                    <span style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:stone, border:`1px solid ${bdr}`, padding:'2px 8px' }}>{v.id}</span>
                  </div>
                  <div style={{ display:'flex', gap:2, marginBottom:10 }}>{stars(v.rating)}<span style={{ ...sans, fontSize:10, color:stone, marginLeft:4 }}>{v.rating}</span></div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['Contact',v.contact],['Phone',v.phone],['Total POs',v.totalOrders],['Completed',v.completedOrders]].map(([k,val])=>(
                      <div key={k}>
                        <p style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#a8a29e', margin:'0 0 1px' }}>{k}</p>
                        <p style={{ ...sans, fontSize:11, color:dark, margin:0 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:12, height:4, background:'#f0ede9' }}>
                    <div style={{ height:'100%', background:gold, width:`${(v.completedOrders/v.totalOrders)*100}%` }}/>
                  </div>
                  <p style={{ ...sans, fontSize:9, color:stone, margin:'4px 0 0', textAlign:'right' }}>{Math.round((v.completedOrders/v.totalOrders)*100)}% on-time</p>
                </div>
              ))}
            </div>
          )}

          {/* POS TAB */}
          {tab==='pos' && (
            <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1.5fr 1fr 0.8fr 0.8fr 100px', padding:'8px 16px', borderBottom:`1px solid ${bdr}`, background:'#f9f8f6' }}>
                {['PO No.','Vendor','Items','Value','Status','Due Date','Action'].map(h=>(
                  <span key={h} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone }}>{h}</span>
                ))}
              </div>
              {pos.map((p,i)=>{
                const sc = STATUS_COLOR[p.status]||{}
                return (
                  <div key={p.id} onClick={()=>setSelPO(p)}
                    style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1.5fr 1fr 0.8fr 0.8fr 100px', padding:'12px 16px', borderBottom: i<pos.length-1?`1px solid ${bdr}`:'none', alignItems:'center', cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.style.background=`${gold}06`}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{ ...sans, fontSize:11, fontWeight:600, color:gold }}>{p.id}</span>
                    <span style={{ ...sans, fontSize:11, color:dark }}>{vMap[p.vendor]?.name.split(' ')[0]} {vMap[p.vendor]?.name.split(' ')[1]}</span>
                    <span style={{ ...sans, fontSize:11, color:stone, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.items}</span>
                    <span style={{ ...sans, fontSize:11, color:dark, fontWeight:500 }}>{fmt(p.value)}</span>
                    <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.06em', padding:'2px 8px', background:sc.bg, color:sc.color }}>{p.status}</span>
                    <span style={{ ...sans, fontSize:11, color: p.status==='OVERDUE'?'#dc2626':stone }}>{p.due}</span>
                    <button onClick={e=>{e.stopPropagation();advanceStatus(p.id)}}
                      disabled={p.status==='DELIVERED'||p.status==='OVERDUE'}
                      style={{ ...sans, fontSize:9, fontWeight:700, padding:'4px 8px', background: (p.status==='DELIVERED'||p.status==='OVERDUE')?'#f5f4f2':gold, color: (p.status==='DELIVERED'||p.status==='OVERDUE')?stone:dark, border:'none', cursor: (p.status==='DELIVERED'||p.status==='OVERDUE')?'default':'pointer', letterSpacing:'0.06em' }}>
                      {p.status==='DELIVERED'?'DONE':p.status==='OVERDUE'?'CHASE':'ADVANCE'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* INVOICES TAB */}
          {tab==='invoices' && (
            <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 80px', padding:'8px 16px', borderBottom:`1px solid ${bdr}`, background:'#f9f8f6' }}>
                {['Invoice','PO Ref','Vendor','Amount','GST','Total','Status','Action'].map(h=>(
                  <span key={h} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone }}>{h}</span>
                ))}
              </div>
              {INVOICES.map((inv,i)=>{
                const sc = STATUS_COLOR[inv.status]||{}
                return (
                  <div key={inv.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 80px', padding:'12px 16px', borderBottom: i<INVOICES.length-1?`1px solid ${bdr}`:'none', alignItems:'center' }}>
                    <span style={{ ...sans, fontSize:11, fontWeight:600, color:gold }}>{inv.id}</span>
                    <span style={{ ...sans, fontSize:11, color:stone }}>{inv.poId}</span>
                    <span style={{ ...sans, fontSize:11, color:dark }}>{vMap[inv.vendor]?.name.split(' ').slice(0,2).join(' ')}</span>
                    <span style={{ ...sans, fontSize:11, color:dark }}>{fmt(inv.amount)}</span>
                    <span style={{ ...sans, fontSize:11, color:stone }}>{fmt(inv.gst)}</span>
                    <span style={{ ...sans, fontSize:11, fontWeight:600, color:dark }}>{fmt(inv.total)}</span>
                    <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.06em', padding:'2px 8px', background:sc.bg, color:sc.color }}>{inv.status}</span>
                    <button style={{ ...sans, fontSize:9, fontWeight:700, padding:'4px 8px', background: inv.status==='PAID'?'#f5f4f2':gold, color: inv.status==='PAID'?stone:dark, border:'none', cursor:'pointer', letterSpacing:'0.06em' }}>
                      {inv.status==='PAID'?'RECEIPT':'PAY NOW'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Vendor Detail Panel */}
        {selV && (
          <div style={{ width:300, background:'#fff', borderLeft:`1px solid ${bdr}`, padding:24, overflowY:'auto', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <span style={{ ...serif, fontSize:16, color:dark, fontWeight:600 }}>Vendor Profile</span>
              <button onClick={()=>setSelV(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>×</button>
            </div>
            <div style={{ background:`${gold}12`, border:`1px solid ${gold}40`, padding:16, marginBottom:16 }}>
              <p style={{ ...serif, fontSize:18, color:dark, margin:'0 0 4px', fontWeight:600 }}>{selV.name}</p>
              <p style={{ ...sans, fontSize:11, color:stone, margin:0 }}>{selV.cat}</p>
              <div style={{ display:'flex', gap:2, marginTop:8 }}>{stars(selV.rating)}<span style={{ ...sans, fontSize:10, color:stone, marginLeft:4 }}>{selV.rating}/5.0</span></div>
            </div>
            {[['Contact Person',selV.contact],['Phone',selV.phone],['City',selV.city],['Member Since',selV.joined],['Total POs',selV.totalOrders],['Completed',selV.completedOrders]].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                <span style={{ ...sans, fontSize:10, color:stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>{k}</span>
                <span style={{ ...sans, fontSize:11, color:dark }}>{v}</span>
              </div>
            ))}
            <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'16px 0 8px' }}>Their POs</p>
            {pos.filter(p=>p.vendor===selV.id).map(p=>{
              const sc = STATUS_COLOR[p.status]||{}
              return (
                <div key={p.id} style={{ border:`1px solid ${bdr}`, padding:'8px 10px', marginBottom:6 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ ...sans, fontSize:11, fontWeight:600, color:gold }}>{p.id}</span>
                    <span style={{ ...sans, fontSize:8, fontWeight:700, padding:'1px 6px', background:sc.bg, color:sc.color }}>{p.status}</span>
                  </div>
                  <p style={{ ...sans, fontSize:10, color:stone, margin:'4px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.items}</p>
                  <p style={{ ...sans, fontSize:10, color:dark, margin:'2px 0 0', fontWeight:500 }}>{fmt(p.value)}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* PO Detail Panel */}
        {selPO && tab==='pos' && (
          <div style={{ width:300, background:'#fff', borderLeft:`1px solid ${bdr}`, padding:24, overflowY:'auto', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <span style={{ ...serif, fontSize:16, color:dark, fontWeight:600 }}>PO Details</span>
              <button onClick={()=>setSelPO(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>×</button>
            </div>
            <div style={{ background:`${gold}08`, border:`1px solid ${gold}30`, padding:12, marginBottom:16 }}>
              <p style={{ ...serif, fontSize:22, color:gold, margin:0, fontWeight:600 }}>{selPO.id}</p>
              <p style={{ ...sans, fontSize:11, color:stone, margin:'4px 0 0' }}>{selPO.project}</p>
            </div>
            {[['Vendor',vMap[selPO.vendor]?.name],['Items',selPO.items],['Value',fmt(selPO.value)],['Ordered',selPO.ordered],['Due',selPO.due],['Delivered',selPO.delivered||'—']].map(([k,v])=>(
              <div key={k} style={{ padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'0 0 2px' }}>{k}</p>
                <p style={{ ...sans, fontSize:12, color:dark, margin:0 }}>{v}</p>
              </div>
            ))}
            <div style={{ marginTop:16 }}>
              {(() => {
                const sc = STATUS_COLOR[selPO.status]||{}
                return <span style={{ ...sans, fontSize:11, fontWeight:700, padding:'6px 16px', background:sc.bg, color:sc.color, letterSpacing:'0.08em' }}>{selPO.status}</span>
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
