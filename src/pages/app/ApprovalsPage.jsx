import { useState } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const INIT = [
  { id:'APR-001', type:'Design Change',      project:'PRJ-0012', projectName:'Nair Residence', client:'Deepa Nair',    submittedBy:'Kiran Sharma',  date:'2026-06-12', priority:'HIGH',   cost:45000,  status:'PENDING', desc:'Client requested marble finish on TV wall instead of timber veneer. Additional cost ₹45,000 due to premium material and extra labour.',  attachments:['tv_wall_marble_render.jpg','material_quote.pdf'], comments:[] },
  { id:'APR-002', type:'Quotation Approval', project:'PRJ-0015', projectName:'Sharma Villa',   client:'Rajesh Sharma', submittedBy:'Priya Menon',   date:'2026-06-11', priority:'HIGH',   cost:3850000,status:'PENDING', desc:'Final quotation for full interior — 5BHK, 3400 sqft, premium finish. Includes all rooms, civil, electrical, and furniture.', attachments:['quotation_v3.pdf','scope_document.pdf'], comments:[] },
  { id:'APR-003', type:'Material Change',    project:'PRJ-0009', projectName:'Kapoor Office',  client:'Vinay Kapoor',  submittedBy:'Lakshmi Iyer',  date:'2026-06-10', priority:'MEDIUM', cost:28000,  status:'PENDING', desc:'Request to substitute Italian marble (Statuario) with Spanish marble (Calacatta) in conference room. Small cost saving of ₹12,000.', attachments:['marble_comparison.pdf'], comments:[] },
  { id:'APR-004', type:'Timeline Extension', project:'PRJ-0012', projectName:'Nair Residence', client:'Deepa Nair',    submittedBy:'Mohammed Farook',date:'2026-06-08',priority:'MEDIUM', cost:0,      status:'PENDING', desc:'Requesting 10-day extension to handover date (30 Aug → 09 Sep) due to tile delivery delay from supplier.', attachments:['supplier_delay_notice.pdf'], comments:[] },
  { id:'APR-005', type:'Design Change',      project:'PRJ-0011', projectName:'Iyer Apartment', client:'Suresh Iyer',   submittedBy:'Kiran Sharma',  date:'2026-06-05', priority:'LOW',    cost:12000,  status:'APPROVED',desc:'Added shoe rack unit to entrance foyer. Minor addition, within contingency budget.', attachments:['foyer_revised.jpg'], comments:[{ by:'Suresh Iyer', text:'Approved — looks great!', ts:'2026-06-06' }] },
  { id:'APR-006', type:'PO Approval',        project:'PRJ-0015', projectName:'Sharma Villa',   client:'Rajesh Sharma', submittedBy:'Priya Menon',   date:'2026-06-03', priority:'HIGH',   cost:180000, status:'APPROVED',desc:'Purchase order for teak wood from Hyderabad supplier — 240 sqft for master bedroom wardrobes and study.', attachments:['PO-2026-088.pdf'], comments:[{ by:'Admin', text:'PO approved. Placed order.', ts:'2026-06-04' }] },
  { id:'APR-007', type:'Quotation Approval', project:'PRJ-0014', projectName:'Mehta Penthouse',client:'Anil Mehta',    submittedBy:'Lakshmi Iyer',  date:'2026-05-28', priority:'HIGH',   cost:7200000,status:'REJECTED',desc:'Phase 1 quotation for 6BHK penthouse — 5200 sqft luxury finish with home automation and imported marble throughout.', attachments:['penthouse_quote.pdf'], comments:[{ by:'Anil Mehta', text:'Budget too high. Please revise with standard+ finish instead of luxury.', ts:'2026-05-30' }] },
]

const TYPE_COLOR = {
  'Design Change':      gold,
  'Quotation Approval': '#22c55e',
  'Material Change':    '#8b7355',
  'Timeline Extension': '#f97316',
  'PO Approval':        '#57534e',
}
const PRIORITY_COLOR = { HIGH:'#ef4444', MEDIUM:'#f97316', LOW:'#78716c' }
const STATUS_COLOR   = { PENDING:gold, APPROVED:'#22c55e', REJECTED:'#ef4444' }

function fmt(n) { return n > 0 ? '₹' + Number(n).toLocaleString('en-IN') : 'No cost impact' }

export default function ApprovalsPage() {
  const [items,    setItems]    = useState(INIT)
  const [filter,   setFilter]   = useState('PENDING')
  const [typeF,    setTypeF]    = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [comment,  setComment]  = useState('')
  const [signing,  setSigning]  = useState(false)
  const [signed,   setSigned]   = useState(false)

  const filtered = items.filter(i => {
    if (filter !== 'ALL' && i.status !== filter) return false
    if (typeF !== 'ALL' && i.type !== typeF) return false
    return true
  })

  const pending  = items.filter(i => i.status === 'PENDING').length
  const approved = items.filter(i => i.status === 'APPROVED').length
  const rejected = items.filter(i => i.status === 'REJECTED').length

  function action(id, status) {
    setItems(prev => prev.map(i => i.id === id ? {
      ...i, status,
      comments: [...i.comments, { by:'You', text: comment || `${status === 'APPROVED' ? 'Approved' : 'Rejected'}.`, ts: new Date().toISOString() }]
    } : i))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status, comments: [...prev.comments, { by:'You', text: comment || `${status}.`, ts: new Date().toISOString() }] }))
    setComment('')
    setSigned(false)
  }

  function signAndApprove(id) {
    setSigning(true)
    setTimeout(() => { setSigning(false); setSigned(true) }, 1200)
  }

  const types = [...new Set(INIT.map(i => i.type))]

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M5 10l4 4 7-7" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Approvals <span style={{ color:gold }}>Workflow</span></p>
        {pending > 0 && <span style={{ ...sans, fontSize:10, fontWeight:700, background:'#ef4444', color:'#fff', padding:'2px 8px', letterSpacing:'0.08em' }}>{pending} PENDING</span>}
        <div style={{ flex:1 }} />
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', minHeight:'calc(100vh - 64px)' }}>
        {/* List */}
        <div style={{ padding:28, borderRight: selected ? `1px solid ${bdr}` : 'none' }}>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
            {[['PENDING',pending,gold],['APPROVED',approved,'#22c55e'],['REJECTED',rejected,'#ef4444']].map(([s,n,c]) => (
              <button key={s} onClick={() => setFilter(s === filter ? 'ALL' : s)}
                style={{ background:filter===s?`${c}12`:'#fff', border:`${filter===s?2:1}px solid ${filter===s?c:bdr}`, padding:'14px 18px', cursor:'pointer', textAlign:'left' }}>
                <p style={{ ...serif, fontSize:32, fontWeight:300, color:c, margin:'0 0 4px' }}>{n}</p>
                <p style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:0 }}>{s}</p>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            {['ALL','PENDING','APPROVED','REJECTED'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{ ...sans, padding:'5px 14px', border:`1px solid ${filter===s?gold:bdr}`, background:filter===s?`${gold}12`:'#fff', color:filter===s?dark:stone, fontSize:10, fontWeight:filter===s?700:400, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>
                {s}
              </button>
            ))}
            <div style={{ marginLeft:'auto' }}>
              <select value={typeF} onChange={e => setTypeF(e.target.value)}
                style={{ ...sans, padding:'5px 10px', border:`1px solid ${bdr}`, fontSize:10, color:dark, background:'#fff' }}>
                <option value="ALL">All Types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Items */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(item => (
              <div key={item.id} onClick={() => { setSelected(item); setComment(''); setSigned(false) }}
                style={{ background:'#fff', border:`1px solid ${selected?.id===item.id?gold:bdr}`, borderLeft:`3px solid ${TYPE_COLOR[item.type]||gold}`, padding:'16px 20px', cursor:'pointer' }}
                onMouseEnter={e => { if(selected?.id!==item.id) e.currentTarget.style.borderColor=`${gold}60` }}
                onMouseLeave={e => { if(selected?.id!==item.id) e.currentTarget.style.borderColor=bdr }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:TYPE_COLOR[item.type]||gold, textTransform:'uppercase' }}>{item.type}</span>
                    <span style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.1em', color:PRIORITY_COLOR[item.priority], border:`1px solid ${PRIORITY_COLOR[item.priority]}`, padding:'1px 6px' }}>{item.priority}</span>
                  </div>
                  <span style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.1em', color:STATUS_COLOR[item.status], border:`1px solid ${STATUS_COLOR[item.status]}`, padding:'2px 8px' }}>{item.status}</span>
                </div>
                <p style={{ ...sans, fontSize:12, color:dark, margin:'0 0 4px', fontWeight:600 }}>{item.projectName}</p>
                <p style={{ ...sans, fontSize:11, color:stone, margin:'0 0 10px', lineHeight:1.6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{item.desc}</p>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ ...sans, fontSize:10, color:stone }}>{item.submittedBy} · {new Date(item.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                  {item.cost > 0 && <span style={{ ...sans, fontSize:10, color:dark, fontWeight:600 }}>{fmt(item.cost)}</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p style={{ ...sans, fontSize:12, color:stone, textAlign:'center', padding:'48px 0' }}>No items match the current filter.</p>}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ padding:28, overflowY:'auto', background:'#fff' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ ...sans, fontSize:9, color:stone, letterSpacing:'0.1em' }}>{selected.id}</span>
              <button onClick={() => { setSelected(null); setSigned(false) }} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:stone }}>✕</button>
            </div>

            <div style={{ borderLeft:`3px solid ${TYPE_COLOR[selected.type]||gold}`, paddingLeft:14, marginBottom:20 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:TYPE_COLOR[selected.type]||gold, margin:'0 0 4px' }}>{selected.type}</p>
              <p style={{ ...serif, fontSize:22, fontWeight:300, color:dark, margin:'0 0 4px' }}>{selected.projectName}</p>
              <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>Client: {selected.client}</p>
            </div>

            {/* Meta */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
              {[['Submitted By',selected.submittedBy],['Date',new Date(selected.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],['Priority',selected.priority],['Cost Impact',fmt(selected.cost)]].map(([k,v]) => (
                <div key={k} style={{ background:light, padding:'10px 12px', border:`1px solid ${bdr}` }}>
                  <p style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{k}</p>
                  <p style={{ ...sans, fontSize:11.5, color:dark, margin:0, fontWeight:600 }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background:light, border:`1px solid ${bdr}`, padding:'14px 16px', marginBottom:16 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Description</p>
              <p style={{ ...sans, fontSize:12, color:dark, margin:0, lineHeight:1.75 }}>{selected.desc}</p>
            </div>

            {/* Attachments */}
            {selected.attachments.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Attachments</p>
                {selected.attachments.map(a => (
                  <div key={a} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 12px', border:`1px solid ${bdr}`, background:'#fff', marginBottom:4 }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M6 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" stroke={stone} strokeWidth="1.2"/><path d="M14 2v5h5" stroke={stone} strokeWidth="1.2"/></svg>
                    <span style={{ ...sans, fontSize:11, color:dark, flex:1 }}>{a}</span>
                    <button style={{ ...sans, fontSize:9, color:gold, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>View</button>
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            {selected.comments.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Comments</p>
                {selected.comments.map((c,i) => (
                  <div key={i} style={{ padding:'10px 12px', background:light, border:`1px solid ${bdr}`, marginBottom:4 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ ...sans, fontSize:10, fontWeight:600, color:dark }}>{c.by}</span>
                      <span style={{ ...sans, fontSize:9, color:stone }}>{new Date(c.ts).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                    </div>
                    <p style={{ ...sans, fontSize:11, color:stone, margin:0, lineHeight:1.6 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action */}
            {selected.status === 'PENDING' && (
              <div style={{ marginTop:20, paddingTop:20, borderTop:`1px solid ${bdr}` }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Your Decision</p>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Add a comment (optional)…"
                  style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, resize:'none', boxSizing:'border-box', marginBottom:10, lineHeight:1.6 }} />

                {/* Digital signature for quotation */}
                {selected.type === 'Quotation Approval' && !signed && (
                  <button onClick={() => signAndApprove(selected.id)} disabled={signing}
                    style={{ ...sans, width:'100%', padding:'10px', background:dark, border:`1px solid ${gold}`, color:gold, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', marginBottom:8 }}>
                    {signing ? 'Generating Signature…' : '✦ Sign & Approve Quotation'}
                  </button>
                )}
                {signed && (
                  <div style={{ background:`${gold}12`, border:`1px solid ${gold}`, padding:'10px 14px', marginBottom:8, textAlign:'center' }}>
                    <p style={{ ...serif, fontSize:18, fontStyle:'italic', color:dark, margin:'0 0 4px' }}>Digitally signed by you</p>
                    <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{new Date().toLocaleString('en-IN')} · IP: 103.18.42.11</p>
                  </div>
                )}

                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => action(selected.id, 'APPROVED')}
                    style={{ ...sans, flex:1, padding:'11px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => action(selected.id, 'REJECTED')}
                    style={{ ...sans, flex:1, padding:'11px', background:'#fff', border:'1px solid #ef4444', color:'#ef4444', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            )}

            {selected.status !== 'PENDING' && (
              <div style={{ marginTop:20, padding:'14px 16px', background:selected.status==='APPROVED'?'#f0fdf4':'#fff5f5', border:`1px solid ${STATUS_COLOR[selected.status]}` }}>
                <p style={{ ...sans, fontSize:10, fontWeight:700, color:STATUS_COLOR[selected.status], margin:0 }}>{selected.status === 'APPROVED' ? '✓ This request has been approved.' : '✕ This request has been rejected.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
