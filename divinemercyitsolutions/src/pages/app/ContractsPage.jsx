import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contracts as contractsApi } from '../../lib/api'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bdr   = '#e7e5e4'

const STATUS_COLOR = {
  DRAFT:   { bg:'#fffbeb', color:'#d97706' },
  SENT:    { bg:'#eff6ff', color:'#2563eb' },
  SIGNED:  { bg:'#f0fdf4', color:'#16a34a' },
  EXPIRED: { bg:'#fef2f2', color:'#dc2626' },
  VOIDED:  { bg:'#f5f4f2', color:stone },
}

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

const SEED_CONTRACTS = [
  {
    id:'CTR-0018', project:'Nair Residence', client:'Deepa Nair', value:1850000,
    scope:'Complete interior design, fabrication and execution of 3BHK apartment including false ceilings, modular kitchen, wardrobes, flooring and all civil works.',
    status:'SIGNED', created:'2026-04-02', sent:'2026-04-03', signed:'2026-04-05', expires:'2027-04-05',
    designer:'Kiran Sharma', pm:'Priya Menon',
    milestones:[{pct:30,label:'Mobilisation',amt:555000},{pct:20,label:'Design Approval',amt:370000},{pct:25,label:'Mid Execution',amt:462500},{pct:15,label:'Pre-Handover',amt:277500},{pct:10,label:'Final Handover',amt:185000}],
    clauses:['All materials as per approved BOQ only.','Any additions require written change order.','Client to ensure site access Mon–Sat 8am–6pm.','Force majeure clause applies for material delays beyond 30 days.'],
    sigClient:{ name:'Deepa Nair',    ip:'103.21.45.12', time:'2026-04-05 14:22:08' },
    sigDesigner:{ name:'Kiran Sharma', ip:'103.21.45.01', time:'2026-04-05 15:00:44' },
  },
  {
    id:'CTR-0019', project:'Kapoor Office', client:'Vinay Kapoor', value:3200000,
    scope:'Full commercial interior fit-out of 4,500 sqft office space including reception, boardrooms, workstations, server room, pantry and all services.',
    status:'SIGNED', created:'2026-03-15', sent:'2026-03-16', signed:'2026-03-18', expires:'2027-03-18',
    designer:'Lakshmi Iyer', pm:'Priya Menon',
    milestones:[{pct:30,label:'Mobilisation',amt:960000},{pct:20,label:'Design Approval',amt:640000},{pct:25,label:'Mid Execution',amt:800000},{pct:15,label:'Pre-Handover',amt:480000},{pct:10,label:'Final Handover',amt:320000}],
    clauses:['Work to be executed in shifts to avoid business disruption.','Approved brands list to be adhered strictly.','Penalty of 0.5% per week for delays beyond agreed timeline.'],
    sigClient:{ name:'Vinay Kapoor',  ip:'103.45.67.89', time:'2026-03-18 11:08:21' },
    sigDesigner:{ name:'Lakshmi Iyer', ip:'103.21.45.01', time:'2026-03-18 11:30:00' },
  },
  {
    id:'CTR-0020', project:'Sharma Villa', client:'Rahul Sharma', value:5600000,
    scope:'Luxury villa interior encompassing ground and first floor — bespoke joinery, Italian marble, imported fixtures, home automation, landscaping coordination.',
    status:'SENT', created:'2026-05-10', sent:'2026-05-11', signed:null, expires:'2026-06-11',
    designer:'Kiran Sharma', pm:'Priya Menon',
    milestones:[{pct:30,label:'Mobilisation',amt:1680000},{pct:20,label:'Design Approval',amt:1120000},{pct:25,label:'Mid Execution',amt:1400000},{pct:15,label:'Pre-Handover',amt:840000},{pct:10,label:'Final Handover',amt:560000}],
    clauses:['Home automation brand to be confirmed within 7 days of contract signing.','Imported material lead times excluded from project timeline.'],
    sigClient:null,
    sigDesigner:{ name:'Kiran Sharma', ip:'103.21.45.01', time:'2026-05-10 16:00:00' },
  },
  {
    id:'CTR-0021', project:'Mehta Penthouse', client:'Anil Mehta', value:2800000,
    scope:'Penthouse interior with panoramic views — open-plan living, chef kitchen, master suite with walk-in wardrobe and spa bathroom.',
    status:'DRAFT', created:'2026-06-01', sent:null, signed:null, expires:null,
    designer:'Lakshmi Iyer', pm:'Priya Menon',
    milestones:[{pct:30,label:'Mobilisation',amt:840000},{pct:20,label:'Design Approval',amt:560000},{pct:25,label:'Mid Execution',amt:700000},{pct:15,label:'Pre-Handover',amt:420000},{pct:10,label:'Final Handover',amt:280000}],
    clauses:['Penthouse specifications subject to structural engineer approval.'],
    sigClient:null, sigDesigner:null,
  },
]

function mapApiContract(c) {
  return {
    id: `CTR-${String(c.id).padStart(4,'0')}`,
    _apiId: c.id,
    project: c.project_name || c.title || 'Unknown',
    client: '',
    value: c.total_value || 0,
    scope: c.terms || '',
    status: c.status || 'DRAFT',
    created: c.created_at?.slice(0,10) || '',
    sent: c.sent_at?.slice(0,10) || null,
    signed: c.signed_at?.slice(0,10) || null,
    expires: null,
    designer: '', pm: '',
    milestones: [],
    clauses: [],
    sigClient: c.signed_at ? { name: c.signed_by || 'Client', ip: c.signature_ip || '', time: c.signed_at } : null,
    sigDesigner: null,
  }
}

export default function ContractsPage() {
  const nav = useNavigate()
  const [contracts, setContracts] = useState(SEED_CONTRACTS)
  const [sel, setSel] = useState(null)
  const [tab, setTab] = useState('overview')
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    contractsApi.list().then(data => {
      if (data?.length > 0) setContracts(data.map(mapApiContract))
    }).catch(() => {})
  }, [])

  function handleSend(id) {
    setSending(true)
    const today = new Date().toISOString().slice(0,10)
    const upd = { status:'SENT', sent: today }
    const apiId = contracts.find(c => c.id === id)?._apiId
    if (apiId) contractsApi.update(apiId, { status: 'SENT' }).catch(() => {})
    setTimeout(() => {
      setContracts(prev => prev.map(c => c.id===id ? {...c,...upd} : c))
      setSel(prev => ({...prev,...upd}))
      setSending(false)
    }, 400)
  }

  function handleSign(id) {
    setSigning(true)
    const now = new Date().toISOString().replace('T',' ').slice(0,19)
    const ip = '103.'+Math.floor(Math.random()*200+50)+'.'+Math.floor(Math.random()*200)+'.'+Math.floor(Math.random()*99+1)
    const upd = { status:'SIGNED', signed: new Date().toISOString().slice(0,10),
      sigClient:{ name: sel.client || 'Client', ip, time: now } }
    const apiId = contracts.find(c => c.id === id)?._apiId
    if (apiId) contractsApi.sign(apiId, { signed_by: sel.client || 'Client' }).catch(() => {})
    setTimeout(() => {
      setContracts(prev => prev.map(c => c.id===id ? {...c,...upd} : c))
      setSel(prev => ({...prev,...upd}))
      setSigning(false); setSigned(true)
      setTimeout(()=>setSigned(false), 3000)
    }, 800)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', ...sans }}>
      {/* Header */}
      <div style={{ background:dark, borderBottom:`2px solid ${gold}`, padding:'0 32px', display:'flex', alignItems:'center', height:56, gap:20 }}>
        <svg width="28" height="28" viewBox="0 0 40 40"><rect width="40" height="40" fill={gold}/><text x="8" y="27" fontSize="18" fontWeight="700" fill={dark} fontFamily="serif">ES</text></svg>
        <span style={{ ...serif, fontSize:18, color:'#fff', letterSpacing:'0.04em', fontWeight:600 }}>Contract Management</span>
        <div style={{ flex:1 }}/>
        <button onClick={()=>nav('/dashboard')} style={{ ...sans, fontSize:12, color:'#a8a29e', background:'none', border:'none', cursor:'pointer' }}>← Dashboard</button>
      </div>

      {/* KPI strip */}
      <div style={{ display:'flex', borderBottom:`1px solid ${bdr}`, background:'#fff' }}>
        {[
          ['Total Contracts', contracts.length],
          ['Signed', contracts.filter(c=>c.status==='SIGNED').length],
          ['Awaiting Signature', contracts.filter(c=>c.status==='SENT').length],
          ['Draft', contracts.filter(c=>c.status==='DRAFT').length],
          ['Signed Value', fmt(contracts.filter(c=>c.status==='SIGNED').reduce((a,c)=>a+c.value,0))],
        ].map(([l,v])=>(
          <div key={l} style={{ flex:1, padding:'14px 20px', borderRight:`1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{l}</p>
            <p style={{ ...serif, fontSize:24, color:dark, margin:0, fontWeight:600 }}>{v}</p>
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', padding:'0 20px' }}>
          <button onClick={()=>nav('/new-project')} style={{ ...sans, fontSize:11, fontWeight:700, background:gold, color:dark, border:'none', padding:'8px 18px', cursor:'pointer', letterSpacing:'0.08em' }}>+ NEW CONTRACT</button>
        </div>
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 112px)' }}>
        {/* List */}
        <div style={{ width:360, borderRight:`1px solid ${bdr}`, background:'#fff', overflowY:'auto', flexShrink:0 }}>
          {contracts.map(c=>{
            const sc = STATUS_COLOR[c.status]||{}
            const active = sel?.id===c.id
            return (
              <div key={c.id} onClick={()=>{setSel(c);setTab('overview')}}
                style={{ padding:'16px 20px', borderBottom:`1px solid ${bdr}`, cursor:'pointer', borderLeft: active?`3px solid ${gold}`:'3px solid transparent', background: active?`${gold}06`:'transparent' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div>
                    <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 2px' }}>{c.project}</p>
                    <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{c.client}</p>
                  </div>
                  <span style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.08em', padding:'2px 8px', background:sc.bg, color:sc.color }}>{c.status}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ ...serif, fontSize:16, color:gold, fontWeight:600 }}>{fmt(c.value)}</span>
                  <span style={{ ...sans, fontSize:9, color:'#a8a29e' }}>{c.id}</span>
                </div>
                <p style={{ ...sans, fontSize:9, color:'#a8a29e', margin:'6px 0 0' }}>
                  Created {c.created}{c.signed?' · Signed '+c.signed:c.sent?' · Sent '+c.sent:''}
                </p>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        {sel ? (
          <div style={{ flex:1, overflowY:'auto' }}>
            <div style={{ background:dark, padding:'20px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ ...serif, fontSize:22, color:'#fff', margin:'0 0 4px', fontWeight:600 }}>{sel.project}</p>
                <p style={{ ...sans, fontSize:11, color:'#a8a29e', margin:0 }}>{sel.id} · {sel.client}</p>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                {signed && <span style={{ ...sans, fontSize:11, color:'#86efac' }}>✓ Contract Signed!</span>}
                {sel.status==='DRAFT' && (
                  <button onClick={()=>handleSend(sel.id)} disabled={sending}
                    style={{ ...sans, fontSize:11, fontWeight:700, background:sending?stone:gold, color:dark, border:'none', padding:'8px 18px', cursor:'pointer', letterSpacing:'0.08em' }}>
                    {sending?'SENDING…':'SEND TO CLIENT'}
                  </button>
                )}
                <span style={{ ...sans, fontSize:10, fontWeight:700, padding:'6px 14px', background:STATUS_COLOR[sel.status]?.bg, color:STATUS_COLOR[sel.status]?.color, letterSpacing:'0.08em' }}>{sel.status}</span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ background:'#fff', borderBottom:`1px solid ${bdr}`, display:'flex', padding:'0 28px' }}>
              {[['overview','Overview'],['milestones','Milestones'],['clauses','Clauses & Terms'],['sign','E-Signature']].map(([key,label])=>(
                <button key={key} onClick={()=>setTab(key)}
                  style={{ ...sans, fontSize:11, fontWeight:600, padding:'10px 16px', background:'none', border:'none', borderBottom:tab===key?`2px solid ${gold}`:'2px solid transparent', color:tab===key?gold:stone, cursor:'pointer', letterSpacing:'0.06em', marginBottom:-1 }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding:'24px 28px' }}>
              {tab==='overview' && (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                    {[['Contract Value',fmt(sel.value)],['Designer',sel.designer],['Project Manager',sel.pm],['Created',sel.created],['Sent',sel.sent||'—'],['Signed',sel.signed||'Awaiting']].map(([k,v])=>(
                      <div key={k} style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'14px 16px' }}>
                        <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{k}</p>
                        <p style={{ ...serif, fontSize:16, color:dark, margin:0 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px' }}>
                    <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 10px' }}>Scope of Work</p>
                    <p style={{ ...sans, fontSize:13, color:dark, lineHeight:1.7, margin:0 }}>{sel.scope}</p>
                  </div>
                </>
              )}

              {tab==='milestones' && (
                <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 0.5fr 1fr', padding:'10px 20px', borderBottom:`1px solid ${bdr}`, background:'#f9f8f6' }}>
                    {['Milestone','%','Amount'].map(h=><span key={h} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone }}>{h}</span>)}
                  </div>
                  {sel.milestones.map((m,i)=>(
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 0.5fr 1fr', padding:'14px 20px', borderBottom:i<sel.milestones.length-1?`1px solid ${bdr}`:'none', alignItems:'center' }}>
                      <div>
                        <p style={{ ...sans, fontSize:12, fontWeight:500, color:dark, margin:'0 0 5px' }}>{m.label}</p>
                        <div style={{ height:3, background:'#f0ede9', width:'80%' }}>
                          <div style={{ height:'100%', background:gold, width:`${m.pct*3}%` }}/>
                        </div>
                      </div>
                      <span style={{ ...serif, fontSize:18, color:stone }}>{m.pct}%</span>
                      <span style={{ ...serif, fontSize:18, color:dark, fontWeight:600 }}>{fmt(m.amt)}</span>
                    </div>
                  ))}
                  <div style={{ padding:'14px 20px', background:'#f9f8f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ ...sans, fontSize:11, fontWeight:700, color:stone, letterSpacing:'0.08em', textTransform:'uppercase' }}>Total Contract Value</span>
                    <span style={{ ...serif, fontSize:22, color:gold, fontWeight:700 }}>{fmt(sel.value)}</span>
                  </div>
                </div>
              )}

              {tab==='clauses' && (
                <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'24px' }}>
                  <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 20px' }}>Standard & Project-Specific Clauses</p>
                  {[
                    'This agreement is entered into by Divine Mercy IT Solutions (www.divinemercyitsol.com) and the client named above.',
                    'All work shall be executed in accordance with the approved design drawings and specifications.',
                    'Payment milestones are binding and must be cleared before commencement of each phase.',
                    'Warranties: Fabrication — 5 years, Civil & Plumbing — 1 year, Electrical — 1 year.',
                    'Dispute resolution: Mediation first, then arbitration under Indian Arbitration Act 1996, Chennai jurisdiction.',
                    ...sel.clauses,
                  ].map((clause, i)=>(
                    <div key={i} style={{ display:'flex', gap:14, marginBottom:16, alignItems:'flex-start' }}>
                      <span style={{ ...sans, fontSize:9, fontWeight:700, color:gold, background:`${gold}12`, border:`1px solid ${gold}30`, padding:'2px 8px', flexShrink:0, marginTop:2 }}>{i+1}</span>
                      <p style={{ ...sans, fontSize:13, color:dark, margin:0, lineHeight:1.7 }}>{clause}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab==='sign' && (
                <div style={{ maxWidth:580 }}>
                  {/* Designer sig */}
                  <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'24px', marginBottom:12 }}>
                    <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>El Shaddai (Company) Signature</p>
                    {sel.sigDesigner ? (
                      <div style={{ background:`${gold}08`, border:`1px solid ${gold}30`, padding:16 }}>
                        <p style={{ ...serif, fontSize:28, color:dark, margin:'0 0 4px', fontStyle:'italic' }}>{sel.sigDesigner.name}</p>
                        <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>Signed at {sel.sigDesigner.time} · IP {sel.sigDesigner.ip}</p>
                      </div>
                    ) : <p style={{ ...sans, fontSize:12, color:stone }}>Not yet signed internally.</p>}
                  </div>

                  {/* Client sig */}
                  <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'24px', marginBottom:12 }}>
                    <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Client Signature</p>
                    {sel.sigClient ? (
                      <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', padding:16 }}>
                        <p style={{ ...serif, fontSize:28, color:dark, margin:'0 0 4px', fontStyle:'italic' }}>{sel.sigClient.name}</p>
                        <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>Signed at {sel.sigClient.time} · IP {sel.sigClient.ip}</p>
                      </div>
                    ) : (
                      <>
                        <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 12px' }}>Client has not yet signed this contract.</p>
                        {sel.status==='SENT' && (
                          <button onClick={()=>handleSign(sel.id)} disabled={signing}
                            style={{ ...sans, fontSize:11, fontWeight:700, background:signing?stone:gold, color:dark, border:'none', padding:'10px 24px', cursor:signing?'not-allowed':'pointer', letterSpacing:'0.08em' }}>
                            {signing?'PROCESSING E-SIGNATURE…':'SIMULATE CLIENT SIGNATURE'}
                          </button>
                        )}
                        {sel.status==='DRAFT' && <p style={{ ...sans, fontSize:11, color:'#d97706', margin:0 }}>Send the contract to client before e-signing is available.</p>}
                      </>
                    )}
                  </div>

                  {sel.status==='SIGNED' && (
                    <div style={{ background:dark, padding:'16px 20px', display:'flex', gap:14, alignItems:'center' }}>
                      <span style={{ fontSize:22 }}>✅</span>
                      <div style={{ flex:1 }}>
                        <p style={{ ...sans, fontSize:12, fontWeight:600, color:'#fff', margin:'0 0 2px' }}>Contract Fully Executed</p>
                        <p style={{ ...sans, fontSize:10, color:'#a8a29e', margin:0 }}>Both parties have signed. Valid until {sel.expires}.</p>
                      </div>
                      <button style={{ ...sans, fontSize:10, fontWeight:700, background:gold, color:dark, border:'none', padding:'8px 16px', cursor:'pointer', letterSpacing:'0.08em', flexShrink:0 }}>⬇ DOWNLOAD PDF</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
            <div style={{ width:64, height:64, background:`${gold}15`, border:`2px solid ${gold}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:28 }}>📄</span>
            </div>
            <p style={{ ...serif, fontSize:22, color:stone, margin:0 }}>Select a contract to view</p>
            <p style={{ ...sans, fontSize:12, color:'#a8a29e', margin:0 }}>Click any contract from the list</p>
          </div>
        )}
      </div>
    </div>
  )
}
