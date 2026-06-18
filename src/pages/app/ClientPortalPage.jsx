import { useState } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const PHASES = ['CREATED','DESIGN','QUOTATION_APPROVED','PRODUCTION','MATERIALS_PROCURED','INSTALLATION','QC','COMPLETED']
const PHASE_LABEL = {
  CREATED:'Project Created', DESIGN:'Design Phase', QUOTATION_APPROVED:'Quote Approved',
  PRODUCTION:'Production', MATERIALS_PROCURED:'Materials Ready', INSTALLATION:'Installation',
  QC:'Quality Check', COMPLETED:'Completed & Handed Over',
}

const PROJECTS = [
  {
    id:'PRJ-0012', name:'Nair Residence — 4BHK', address:'Film Nagar, Jubilee Hills, Hyderabad', sqft:2800,
    phase:'INSTALLATION', pct:72, budget:4200000, spent:3024000,
    designer:'Kiran Sharma', pm:'Priya Menon', startDate:'2026-01-15', expectedEnd:'2026-08-30',
    milestones:[
      { label:'Contract Signed',     done:true,  date:'2026-01-15' },
      { label:'Concept Approved',    done:true,  date:'2026-02-18' },
      { label:'3D Design Approved',  done:true,  date:'2026-03-05' },
      { label:'Quote Signed',        done:true,  date:'2026-03-20' },
      { label:'Production Started',  done:true,  date:'2026-04-01' },
      { label:'Materials Delivered', done:true,  date:'2026-05-15' },
      { label:'Installation 50%',    done:true,  date:'2026-06-10' },
      { label:'Installation 100%',   done:false, date:'2026-07-20' },
      { label:'QC & Snagging',       done:false, date:'2026-08-05' },
      { label:'Handover',            done:false, date:'2026-08-30' },
    ],
    invoices:[
      { no:'INV-00028', date:'2026-01-15', amount:1260000, label:'On Agreement (30%)',    status:'PAID' },
      { no:'INV-00034', date:'2026-03-20', amount:840000,  label:'On Design Approval (20%)', status:'PAID' },
      { no:'INV-00041', date:'2026-04-01', amount:1050000, label:'On Site Start (25%)',   status:'PAID' },
      { no:'INV-00048', date:'2026-07-20', amount:630000,  label:'On 80% Completion (15%)', status:'PENDING' },
      { no:'INV-00052', date:'2026-08-30', amount:420000,  label:'On Handover (10%)',     status:'PENDING' },
    ],
    updates:[
      { date:'2026-06-14', by:'Kiran Sharma', msg:'False ceiling installation completed in all bedrooms. Living room ceiling pending.' },
      { date:'2026-06-10', by:'Site Team',    msg:'Wooden flooring laid in master bedroom and study. Adhesive curing for 48 hours.' },
      { date:'2026-06-05', by:'Priya Menon',  msg:'Kitchen modules installed and aligned. Countertop fitting scheduled for 8 June.' },
      { date:'2026-05-28', by:'Kiran Sharma', msg:'Furniture delivered from factory — 3 wardrobes, TV unit, crockery unit. Placement begins tomorrow.' },
    ],
    pendingApprovals:[
      { id:'APR-01', type:'Design Change', desc:'Client requested marble finish on TV wall instead of timber veneer. Additional cost: ₹45,000.', date:'2026-06-12' },
    ],
    images:[
      { room:'Living Room', phase:'Installation', caption:'False ceiling frame — in progress' },
      { room:'Master Bedroom', phase:'Flooring', caption:'Italian marble laid — curing' },
      { room:'Kitchen', phase:'Installation', caption:'Modular units installed' },
    ],
  },
  {
    id:'PRJ-0009', name:'Kapoor Office — Commercial', address:'Hitech City, Madhapur, Hyderabad', sqft:4200,
    phase:'QC', pct:90, budget:8500000, spent:7650000,
    designer:'Lakshmi Iyer', pm:'Priya Menon', startDate:'2025-10-01', expectedEnd:'2026-07-15',
    milestones:[
      { label:'Contract Signed',    done:true,  date:'2025-10-01' },
      { label:'Space Planning',     done:true,  date:'2025-11-10' },
      { label:'Design Finalised',   done:true,  date:'2025-12-05' },
      { label:'Execution Started',  done:true,  date:'2026-01-10' },
      { label:'Civil Completed',    done:true,  date:'2026-03-20' },
      { label:'Furniture Installed',done:true,  date:'2026-05-30' },
      { label:'QC in Progress',     done:false, date:'2026-06-30' },
      { label:'Handover',           done:false, date:'2026-07-15' },
    ],
    invoices:[
      { no:'INV-00019', date:'2025-10-01', amount:2550000, label:'On Agreement (30%)',    status:'PAID' },
      { no:'INV-00023', date:'2025-12-05', amount:1700000, label:'On Design Approval (20%)', status:'PAID' },
      { no:'INV-00029', date:'2026-01-10', amount:2125000, label:'On Site Start (25%)',   status:'PAID' },
      { no:'INV-00045', date:'2026-06-30', amount:1275000, label:'On 80% Completion (15%)', status:'PAID' },
      { no:'INV-00051', date:'2026-07-15', amount:850000,  label:'On Handover (10%)',     status:'PENDING' },
    ],
    updates:[
      { date:'2026-06-15', by:'Lakshmi Iyer', msg:'Snagging list issued — 12 minor touch-ups identified. All to be cleared by 20 June.' },
      { date:'2026-06-08', by:'QC Team',      msg:'QC inspection completed. Overall quality score: 94/100. Punch list generated.' },
    ],
    pendingApprovals:[],
    images:[
      { room:'Reception', phase:'Completed', caption:'Final look — reception desk installed' },
      { room:'Conference Room', phase:'Completed', caption:'AV setup and seating done' },
    ],
  },
]

function PhaseBar({ phase, pct }) {
  const idx = PHASES.indexOf(phase)
  return (
    <div>
      <div style={{ display:'flex', gap:0, marginBottom:8 }}>
        {PHASES.map((p,i) => {
          const done  = i < idx
          const active= i === idx
          return (
            <div key={p} title={PHASE_LABEL[p]} style={{ flex:1, height:6, background:done?gold:active?`${gold}60`:bdr, marginRight:2, position:'relative' }}>
              {active && <div style={{ position:'absolute', top:-3, left:'50%', transform:'translateX(-50%)', width:12, height:12, background:gold }} />}
            </div>
          )
        })}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <span style={{ ...sans, fontSize:9, color:stone, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>{PHASE_LABEL[phase]}</span>
        <span style={{ ...sans, fontSize:9, color:stone }}>{pct}% complete</span>
      </div>
    </div>
  )
}

function ImagePlaceholder({ room, phase, caption }) {
  const colors = { 'Living Room':'#e7e0d6','Master Bedroom':'#ddd5c8','Kitchen':'#d8cfc0','Reception':'#ccc4b8','Conference Room':'#c8c0b4' }
  return (
    <div style={{ background:colors[room]||'#e0d9d0', aspectRatio:'16/9', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:16, position:'relative' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ opacity:0.4 }}><rect x="3" y="5" width="18" height="14" rx="0" stroke={dark} strokeWidth="1.2"/><circle cx="8" cy="9" r="1.5" stroke={dark} strokeWidth="1.2"/><path d="M3 16l4-4 3 3 3-3 5 5" stroke={dark} strokeWidth="1.2" strokeLinejoin="round"/></svg>
      <p style={{ ...sans, fontSize:9, color:stone, margin:'8px 0 0', textAlign:'center' }}>{room}</p>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(28,25,23,0.55)', padding:'6px 10px' }}>
        <p style={{ ...sans, fontSize:9, color:'#e7e5e4', margin:0 }}>{caption}</p>
      </div>
    </div>
  )
}

export default function ClientPortalPage() {
  const [activeProject, setActiveProject] = useState(PROJECTS[0])
  const [tab, setTab] = useState('overview')
  const [msgText, setMsgText] = useState('')
  const [messages, setMessages] = useState([
    { from:'Team', text:'Welcome to your project portal! You can track progress, view invoices, and send us messages here.', ts:'2026-01-15T10:00:00' }
  ])

  function sendMsg() {
    if (!msgText.trim()) return
    setMessages(m => [...m, { from:'You', text:msgText, ts:new Date().toISOString() }])
    setMsgText('')
    setTimeout(() => {
      setMessages(m => [...m, { from:'Team', text:'Thank you for your message. Your designer will respond within 24 hours.', ts:new Date().toISOString() }])
    }, 1200)
  }

  const p = activeProject
  const paidTotal   = p.invoices.filter(i => i.status === 'PAID').reduce((s,i) => s+i.amount, 0)
  const pendingTotal= p.invoices.filter(i => i.status === 'PENDING').reduce((s,i) => s+i.amount, 0)
  const doneCount   = p.milestones.filter(m => m.done).length
  const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

  const TABS = ['overview','progress','invoices','gallery','messages']

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      {/* Header */}
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none"/></svg>
        </div>
        <div>
          <p style={{ ...serif, fontSize:16, fontWeight:300, color:'#fff', margin:0 }}>Client <span style={{ color:gold }}>Portal</span></p>
          <p style={{ ...sans, fontSize:8.5, color:'#57534e', margin:0, letterSpacing:'0.1em', textTransform:'uppercase' }}>El Shaddai Design Studio</p>
        </div>
        <div style={{ flex:1 }} />
        {/* Project switcher */}
        {PROJECTS.length > 1 && (
          <select value={p.id} onChange={e => { setActiveProject(PROJECTS.find(pr => pr.id === e.target.value)); setTab('overview') }}
            style={{ ...sans, padding:'7px 12px', border:`1px solid #57534e`, background:'#292524', color:'#e7e5e4', fontSize:11 }}>
            {PROJECTS.map(pr => <option key={pr.id} value={pr.id}>{pr.id} — {pr.name.slice(0,20)}</option>)}
          </select>
        )}
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      {/* Project hero */}
      <div style={{ background:dark, padding:'28px 32px 0', borderBottom:`1px solid #292524` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:gold, margin:'0 0 6px' }}>{p.id} · {p.sqft.toLocaleString()} sqft</p>
            <p style={{ ...serif, fontSize:36, fontWeight:300, color:'#fff', margin:'0 0 4px' }}>{p.name}</p>
            <p style={{ ...sans, fontSize:11, color:'#78716c', margin:'0 0 20px' }}>{p.address}</p>
            <PhaseBar phase={p.phase} pct={p.pct} />
          </div>
          <div style={{ textAlign:'right', flexShrink:0, marginLeft:32 }}>
            <p style={{ ...serif, fontSize:48, fontWeight:300, color:gold, margin:0, lineHeight:1 }}>{p.pct}%</p>
            <p style={{ ...sans, fontSize:9, color:'#78716c', letterSpacing:'0.1em', textTransform:'uppercase', margin:'4px 0 0' }}>Completion</p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...sans, padding:'10px 20px', background:'none', border:'none', borderBottom:`2px solid ${t===tab?gold:'transparent'}`, color:t===tab?gold:'#78716c', fontWeight:t===tab?700:400, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', whiteSpace:'nowrap' }}>
              {t === 'messages' ? `Messages${p.pendingApprovals.length?` (${p.pendingApprovals.length})`:''}` : t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'28px 32px' }}>
        {/* Overview */}
        {tab === 'overview' && (
          <div>
            {/* KPI strip */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
              {[
                { label:'Total Budget',    value:fmt(p.budget),      sub:'Project contract value' },
                { label:'Paid to Date',    value:fmt(paidTotal),     sub:`${Math.round(paidTotal/p.budget*100)}% of total` },
                { label:'Balance Due',     value:fmt(pendingTotal),  sub:`${p.invoices.filter(i=>i.status==='PENDING').length} pending invoices` },
                { label:'Milestones Done', value:`${doneCount}/${p.milestones.length}`, sub:'Project milestones' },
              ].map(k => (
                <div key={k.label} style={{ background:'#fff', border:`1px solid ${bdr}`, borderTop:`3px solid ${gold}`, padding:'16px 20px' }}>
                  <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:'0 0 4px' }}>{k.value}</p>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 3px' }}>{k.label}</p>
                  <p style={{ ...sans, fontSize:9.5, color:'#a8a29e', margin:0 }}>{k.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Team */}
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'18px 20px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Your Project Team</p>
                {[
                  { role:'Lead Designer',     name:p.designer, initials:p.designer.split(' ').map(w=>w[0]).join('') },
                  { role:'Project Manager',   name:p.pm, initials:p.pm.split(' ').map(w=>w[0]).join('') },
                  { role:'Site Supervisor',   name:'Mohammed Farook', initials:'MF' },
                ].map(m => (
                  <div key={m.name} style={{ display:'flex', gap:12, alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${bdr}` }}>
                    <div style={{ width:34, height:34, background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11, color:'#000', flexShrink:0 }}>{m.initials}</div>
                    <div>
                      <p style={{ ...sans, fontSize:12, color:dark, margin:'0 0 2px', fontWeight:600 }}>{m.name}</p>
                      <p style={{ ...sans, fontSize:9.5, color:stone, margin:0, letterSpacing:'0.08em', textTransform:'uppercase' }}>{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Latest updates */}
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'18px 20px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Latest Updates</p>
                {p.updates.slice(0,3).map((u,i) => (
                  <div key={i} style={{ padding:'10px 0', borderBottom:`1px solid ${bdr}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ ...sans, fontSize:10, fontWeight:600, color:dark }}>{u.by}</span>
                      <span style={{ ...sans, fontSize:9.5, color:stone }}>{new Date(u.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                    </div>
                    <p style={{ ...sans, fontSize:11, color:stone, margin:0, lineHeight:1.6 }}>{u.msg}</p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'18px 20px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Key Dates</p>
                {[
                  ['Project Start',   p.startDate],
                  ['Expected Handover', p.expectedEnd],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                    <span style={{ ...sans, fontSize:11, color:stone }}>{k}</span>
                    <span style={{ ...sans, fontSize:11, color:dark, fontWeight:600 }}>{new Date(v).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
                  </div>
                ))}
              </div>

              {/* Pending approvals */}
              {p.pendingApprovals.length > 0 && (
                <div style={{ background:'#fff', border:`2px solid #f97316`, padding:'18px 20px' }}>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#f97316', margin:'0 0 14px' }}>⚠ Action Required</p>
                  {p.pendingApprovals.map(ap => (
                    <div key={ap.id}>
                      <p style={{ ...sans, fontSize:11, fontWeight:600, color:dark, margin:'0 0 4px' }}>{ap.type}</p>
                      <p style={{ ...sans, fontSize:11, color:stone, margin:'0 0 14px', lineHeight:1.6 }}>{ap.desc}</p>
                      <div style={{ display:'flex', gap:8 }}>
                        <button style={{ ...sans, flex:1, padding:'9px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Approve</button>
                        <button style={{ ...sans, flex:1, padding:'9px', background:'#fff', border:'1px solid #ef4444', color:'#ef4444', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress */}
        {tab === 'progress' && (
          <div>
            <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:'0 0 20px' }}>Project Milestones</p>
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'24px 28px' }}>
              {p.milestones.map((m, i) => {
                const isLast = i === p.milestones.length - 1
                const next   = !m.done && (i === 0 || p.milestones[i-1].done)
                return (
                  <div key={i} style={{ display:'flex', gap:20, paddingBottom:isLast?0:24, position:'relative' }}>
                    {!isLast && <div style={{ position:'absolute', left:15, top:30, bottom:0, width:2, background:m.done?gold:bdr }} />}
                    <div style={{ width:30, height:30, flexShrink:0, background:m.done?gold:next?`${gold}20`:'#fff', border:`2px solid ${m.done?gold:next?gold:bdr}`, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
                      {m.done
                        ? <span style={{ fontSize:12, color:'#000', fontWeight:700 }}>✓</span>
                        : next
                          ? <div style={{ width:8, height:8, background:gold }} />
                          : <div style={{ width:8, height:8, background:bdr }} />}
                    </div>
                    <div style={{ flex:1, paddingTop:4 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <p style={{ ...sans, fontSize:12.5, fontWeight:m.done?600:400, color:m.done?dark:stone, margin:0 }}>{m.label}</p>
                        <span style={{ ...sans, fontSize:10, color:m.done?stone:'#a8a29e' }}>{new Date(m.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                      </div>
                      {next && <p style={{ ...sans, fontSize:10, color:gold, margin:'3px 0 0', fontWeight:600 }}>Current milestone</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Invoices */}
        {tab === 'invoices' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:0 }}>Invoices & Payments</p>
              <div style={{ display:'flex', gap:20 }}>
                <div style={{ textAlign:'right' }}>
                  <p style={{ ...serif, fontSize:22, fontWeight:300, color:'#22c55e', margin:0 }}>{fmt(paidTotal)}</p>
                  <p style={{ ...sans, fontSize:9, color:stone, margin:'2px 0 0', textTransform:'uppercase', letterSpacing:'0.1em' }}>Paid</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ ...serif, fontSize:22, fontWeight:300, color:'#f97316', margin:0 }}>{fmt(pendingTotal)}</p>
                  <p style={{ ...sans, fontSize:9, color:stone, margin:'2px 0 0', textTransform:'uppercase', letterSpacing:'0.1em' }}>Due</p>
                </div>
              </div>
            </div>
            <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:dark }}>
                    {['Invoice','Date','Description','Amount','Status',''].map(h => (
                      <th key={h} style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#78716c', padding:'10px 16px', textAlign:h==='Amount'?'right':'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.invoices.map(inv => (
                    <tr key={inv.no} style={{ borderBottom:`1px solid ${bdr}`, background:inv.status==='PENDING'?'#fffbf0':'#fff' }}>
                      <td style={{ ...sans, fontSize:11.5, color:dark, padding:'12px 16px', fontWeight:600 }}>{inv.no}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'12px 16px' }}>{new Date(inv.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'12px 16px' }}>{inv.label}</td>
                      <td style={{ ...sans, fontSize:12, color:dark, padding:'12px 16px', textAlign:'right', fontWeight:700 }}>{fmt(inv.amount)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.1em', color:inv.status==='PAID'?'#22c55e':'#f97316', border:`1px solid ${inv.status==='PAID'?'#22c55e':'#f97316'}`, padding:'2px 8px' }}>{inv.status}</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        {inv.status === 'PENDING' && (
                          <button style={{ ...sans, padding:'6px 14px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Pay Now</button>
                        )}
                        {inv.status === 'PAID' && (
                          <button style={{ ...sans, padding:'6px 14px', background:'#fff', border:`1px solid ${bdr}`, color:stone, fontWeight:700, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Download</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gallery */}
        {tab === 'gallery' && (
          <div>
            <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:'0 0 20px' }}>Site Progress Gallery</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {p.images.map((img,i) => <ImagePlaceholder key={i} {...img} />)}
              {[...Array(Math.max(0, 6-p.images.length))].map((_,i) => (
                <div key={`empty-${i}`} style={{ background:'#f0ede9', aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', border:`1px dashed ${bdr}` }}>
                  <p style={{ ...sans, fontSize:10, color:'#a8a29e', margin:0 }}>Photo coming soon</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {tab === 'messages' && (
          <div>
            <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:'0 0 20px' }}>Messages with Your Team</p>
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, height:400, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12, marginBottom:12 }}>
              {messages.map((m,i) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:m.from==='You'?'flex-end':'flex-start' }}>
                  <p style={{ ...sans, fontSize:9, color:stone, margin:'0 0 4px', letterSpacing:'0.08em' }}>{m.from} · {new Date(m.ts).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                  <div style={{ maxWidth:'75%', padding:'10px 14px', background:m.from==='You'?gold:'#f5f4f2', borderLeft:m.from!=='You'?`3px solid ${gold}`:'none' }}>
                    <p style={{ ...sans, fontSize:12, color:m.from==='You'?'#000':dark, margin:0, lineHeight:1.65 }}>{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMsg()} placeholder="Type a message to your project team…"
                style={{ ...sans, flex:1, padding:'11px 14px', border:`1px solid ${bdr}`, fontSize:12, color:dark }} />
              <button onClick={sendMsg} style={{ ...sans, padding:'11px 22px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
