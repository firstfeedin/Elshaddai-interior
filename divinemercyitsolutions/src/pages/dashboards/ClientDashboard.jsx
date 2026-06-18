import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import DashboardShell from '../../components/dashboard/DashboardShell'
import { projects as projectsApi } from '../../lib/api'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const PHASES = ['Inquiry','Concept','Design','Procurement','Execution','Handover','Completed']
const PHASE_MAP = { INQUIRY:0, CONCEPT:1, DESIGN:2, PROCUREMENT:3, EXECUTION:4, HANDOVER:5, COMPLETED:6 }

function Stat({ label, value, sub }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '18px 22px' }}>
      <p style={{ ...serif, margin: '0 0 4px', fontSize: 32, fontWeight: 300, color: dark }}>{value}</p>
      <p style={{ ...sans, margin: '0 0 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e' }}>{label}</p>
      {sub && <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{sub}</p>}
    </div>
  )
}

const MOCK_PROJECT = [{
  id:'1', project_number:'ES-2025-0001', projectNumber:'ES-2025-0001',
  name:'Master Bedroom + Living Room', status:'EXECUTION',
  property_type:'APARTMENT', city:'Chennai',
  total_area_sqft:1200, budget:1800000, quoted_amount:1750000,
  start_date:'2025-02-01', end_date:'2025-06-30',
  designer:{ name:'Architect Priya K.' }, progress:68,
}]

const CHAT_SEED = [
  { id:1, author:'Priya K.',    role:'DESIGNER', avatar:'PK', text:'Hi! Floor plan Rev 3 uploaded. Please review and approve.', time:'10:24 AM' },
  { id:2, author:'You',         role:'CLIENT',   avatar:'ME', text:'Looks great! Can we shift the dining table 2ft towards the window?', time:'10:31 AM' },
  { id:3, author:'Priya K.',    role:'DESIGNER', avatar:'PK', text:'Sure, I\'ll update the plan and re-share by evening.', time:'10:35 AM' },
]

export default function ClientDashboard({ user }) {
  const [projects,    setProjects]    = useState(MOCK_PROJECT)
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('overview')
  const [chatMsgs,    setChatMsgs]    = useState(CHAT_SEED)
  const [chatInput,   setChatInput]   = useState('')
  const [payModal,    setPayModal]    = useState(false)
  const [paySuccess,  setPaySuccess]  = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    projectsApi.list()
      .then(d => {
        const arr = Array.isArray(d) ? d : d?.projects ?? null
        if (arr && arr.length) setProjects(arr.map(p => ({ ...p, progress: p.progress ?? 68 })))
      })
      .catch(()=>{})
      .finally(()=> setLoading(false))
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [chatMsgs])

  const sendChat = () => {
    if (!chatInput.trim()) return
    setChatMsgs(m => [...m, { id:Date.now(), author:'You', role:'CLIENT', avatar:'ME', text:chatInput.trim(), time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) }])
    setChatInput('')
    setTimeout(()=>{
      setChatMsgs(m => [...m, { id:Date.now()+1, author:'Priya K.', role:'DESIGNER', avatar:'PK', text:'Thanks for the message! I\'ll get back to you shortly.', time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) }])
    }, 1200)
  }

  const simulatePay = () => {
    setPayModal(false)
    setTimeout(()=>setPaySuccess(true), 600)
    setTimeout(()=>setPaySuccess(false), 3500)
  }

  const nav = [
    { id: 'overview', label: 'Overview',  icon: '⌂' },
    { id: 'progress', label: 'Progress',  icon: '◎' },
    { id: 'designs',  label: 'Designs',   icon: '⬡' },
    { id: 'payments', label: 'Payments',  icon: '◈' },
    { id: 'messages', label: 'Messages',  icon: '◉' },
  ]

  const firstName = user.name?.split(' ')[0] || 'there'

  return (
    <DashboardShell user={user} nav={nav} activeTab={activeTab} onTabChange={setActiveTab}>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Welcome */}
          <div style={{ background: dark, padding: '24px 28px' }}>
            <p style={{ ...sans, margin: '0 0 4px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Client Portal</p>
            <h2 style={{ ...serif, margin: '0 0 6px', fontSize: 28, fontWeight: 300, color: '#fff' }}>
              Welcome back, <span style={{ color: gold }}>{firstName}</span>
            </h2>
            <p style={{ ...sans, margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
              Your project is {loading ? '…' : `${projects[0]?.progress || 0}%`} complete
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, border: `1px solid ${border}` }}>
            {[
              { label: 'Active Projects',   value: projects.length, sub: 'currently running'  },
              { label: 'Days to Completion',value: '42',            sub: 'estimated'           },
              { label: 'Budget Used',       value: '68%',           sub: '₹12.24L of ₹18L'   },
              { label: 'Design Files',      value: '12',            sub: 'shared with you'    },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '20px 22px', borderRight: i < 3 ? `1px solid ${border}` : 'none', background: '#fff' }}>
                <p style={{ ...serif, margin: '0 0 4px', fontSize: 32, fontWeight: 300, color: dark }}>{s.value}</p>
                <p style={{ ...sans, margin: '0 0 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e' }}>{s.label}</p>
                <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Project card */}
          {loading ? (
            <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '28px 28px', opacity: 0.5 }}>
              <div style={{ height: 14, width: 120, background: border, marginBottom: 12 }} />
              <div style={{ height: 22, width: 280, background: border, marginBottom: 20 }} />
              <div style={{ height: 4, background: border }} />
            </div>
          ) : projects.map(p => (
            <div key={p.id} style={{ background: '#fff', border: `1px solid ${border}`, padding: '26px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ ...sans, margin: '0 0 4px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: gold }}>{p.project_number}</p>
                  <h3 style={{ ...serif, margin: '0 0 4px', fontSize: 22, fontWeight: 300, color: dark }}>{p.name}</h3>
                  <p style={{ ...sans, margin: 0, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>{p.city} · {p.total_area_sqft?.toLocaleString()} sq ft · {p.property_type}</p>
                </div>
                <span style={{ ...sans, padding: '4px 10px', border: `1px solid ${gold}`, color: gold, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{p.status}</span>
              </div>

              {/* Phase tracker */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  {PHASES.map((ph, i) => {
                    const cur = PHASE_MAP[p.status] || 0
                    const done = i < cur, active = i === cur
                    return (
                      <div key={ph} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ width: 22, height: 22, border: `1.5px solid ${done || active ? gold : border}`, background: done ? gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: done ? '#000' : active ? gold : '#a8a29e', marginBottom: 5 }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span style={{ ...sans, fontSize: 8, color: active ? gold : '#a8a29e', textAlign: 'center', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{ph}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ height: 2, background: border, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: gold, width: `${p.progress}%`, transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* Designer */}
              {p.designer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: light, border: `1px solid ${border}` }}>
                  <div style={{ width: 32, height: 32, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#000', flexShrink: 0 }}>{p.designer.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ ...sans, margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: dark }}>{p.designer.name}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>Your Assigned Designer · 50+ yrs engineering team</p>
                  </div>
                  <button style={{ ...sans, fontSize: 10, fontWeight: 600, color: gold, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}>Message →</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'designs' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Design Assets</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 2 }}>
            {['Floor Plan v2','Elevation — North','Mood Board','3D Render — Living','BOQ Sheet','Lighting Plan'].map(asset => (
              <div key={asset} style={{ background: '#fff', border: `1px solid ${border}`, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = dark}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                <div style={{ height: 100, background: light, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${border}` }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="12" height="18" rx="1" stroke="#a8a29e" strokeWidth="1.2"/><path d="M8 7h6M8 11h6M8 15h3" stroke="#a8a29e" strokeWidth="1.2" strokeLinecap="square"/></svg>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ ...sans, margin: '0 0 3px', fontSize: 12, fontWeight: 500, color: dark }}>{asset}</p>
                  <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>PDF · 2.4 MB · Jun 2025</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Payment Schedule</h2>
          <div style={{ background: '#fff', border: `1px solid ${border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: light }}>
                  {['Milestone','Amount','Due Date','Status'].map(h => (
                    <th key={h} style={{ ...sans, padding: '13px 20px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e', borderBottom: `1px solid ${border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Design Advance (30%)',   amount: 525000, date: 'Feb 10, 2025', status: 'PAID'    },
                  { name: 'Procurement Start (30%)', amount: 525000, date: 'Mar 15, 2025', status: 'PAID'    },
                  { name: 'Mid-Execution (30%)',     amount: 525000, date: 'May 1, 2025',  status: 'DUE'     },
                  { name: 'Handover Balance (10%)',  amount: 175000, date: 'Jun 30, 2025', status: 'PENDING' },
                ].map((row, i) => {
                  const sc = row.status === 'PAID' ? '#4ade80' : row.status === 'DUE' ? gold : '#a8a29e'
                  return (
                    <tr key={row.name} style={{ borderBottom: i < 3 ? `1px solid ${border}` : 'none' }}>
                      <td style={{ ...sans, padding: '16px 20px', fontSize: 13, color: dark, fontWeight: 400 }}>{row.name}</td>
                      <td style={{ ...serif, padding: '16px 20px', fontSize: 20, fontWeight: 300, color: dark }}>₹{row.amount.toLocaleString()}</td>
                      <td style={{ ...sans, padding: '16px 20px', fontSize: 12, color: stone, fontWeight: 300 }}>{row.date}</td>
                      <td style={{ padding: '16px 20px' }}>
                        {row.status === 'DUE' ? (
                          <button onClick={()=>setPayModal(true)} style={{ ...sans, padding:'6px 14px', background:gold, border:'none', color:'#000', cursor:'pointer', fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' }}>Pay Now</button>
                        ) : (
                          <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: sc }}>{row.status}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div style={{ display:'flex', flexDirection:'column', height:520, background:'#fff', border:`1px solid ${border}` }}>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:34, height:34, background:dark, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:gold, flexShrink:0 }}>PK</div>
            <div>
              <p style={{ ...sans, margin:0, fontSize:13, fontWeight:600, color:dark }}>Priya Krishnaswamy</p>
              <p style={{ ...sans, margin:0, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#4ade80' }}>● Online · Designer</p>
            </div>
            <Link to={`/collaborate/${projects[0]?.id||'demo'}`} style={{ ...sans, marginLeft:'auto', fontSize:9, fontWeight:700, color:gold, textDecoration:'none', letterSpacing:'0.12em', textTransform:'uppercase' }}>View Collaboration →</Link>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
            {chatMsgs.map(m => {
              const isMe = m.author === 'You'
              return (
                <div key={m.id} style={{ display:'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:28, height:28, background: isMe ? gold : dark, border:`1px solid ${isMe ? gold : '#2a2520'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color: isMe ? '#000' : gold, flexShrink:0 }}>{m.avatar}</div>
                  <div style={{ maxWidth:'72%' }}>
                    <div style={{ padding:'10px 14px', background: isMe ? dark : light, border:`1px solid ${isMe ? '#2a2520' : border}`, color: isMe ? '#fff' : dark }}>
                      <p style={{ ...sans, margin:0, fontSize:12, fontWeight:300, lineHeight:1.55 }}>{m.text}</p>
                    </div>
                    <p style={{ ...sans, margin:'4px 2px 0', fontSize:9, color:'#a8a29e', textAlign: isMe ? 'right' : 'left', fontWeight:300 }}>{m.time}</p>
                  </div>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding:'12px 16px', borderTop:`1px solid ${border}`, display:'flex', gap:8 }}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') sendChat() }}
              placeholder="Type a message… (Enter to send)"
              style={{ ...sans, flex:1, padding:'10px 14px', border:`1px solid ${border}`, fontSize:12, outline:'none', color:dark, fontWeight:300 }} />
            <button onClick={sendChat} style={{ width:40, height:40, background:gold, border:'none', cursor:'pointer', fontSize:16, color:'#000', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>↑</button>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {payModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(28,25,23,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'#fff', padding:'36px', maxWidth:420, width:'90%', border:`1px solid ${border}`, boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
            <p style={{ ...sans, margin:'0 0 2px', fontSize:9, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:gold }}>Secure Payment</p>
            <h2 style={{ ...serif, margin:'0 0 20px', fontSize:26, fontWeight:300, color:dark }}>Pay Milestone</h2>
            <div style={{ background:light, padding:'16px 18px', marginBottom:20, border:`1px solid ${border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${border}` }}>
                <span style={{ ...sans, fontSize:11, color:stone, fontWeight:300 }}>Milestone</span>
                <span style={{ ...sans, fontSize:11, fontWeight:600, color:dark }}>Mid-Execution (30%)</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${border}` }}>
                <span style={{ ...sans, fontSize:11, color:stone, fontWeight:300 }}>Project</span>
                <span style={{ ...sans, fontSize:11, fontWeight:600, color:dark }}>ES-2025-0001</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ ...sans, fontSize:11, color:stone, fontWeight:300 }}>Amount Due</span>
                <span style={{ ...serif, fontSize:22, fontWeight:300, color:dark }}>₹5,25,000</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={simulatePay} style={{ ...sans, padding:'13px', background:gold, border:'none', color:'#000', cursor:'pointer', fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                💳  Pay via Razorpay
              </button>
              <button onClick={simulatePay} style={{ ...sans, padding:'13px', background:dark, border:`1px solid ${dark}`, color:'#fff', cursor:'pointer', fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                📱  UPI / PhonePe / GPay
              </button>
              <button onClick={()=>setPayModal(false)} style={{ ...sans, padding:'11px', background:'none', border:`1px solid ${border}`, color:stone, cursor:'pointer', fontSize:10, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment success toast */}
      {paySuccess && (
        <div style={{ position:'fixed', bottom:32, right:32, background:dark, border:`1px solid ${gold}`, padding:'16px 24px', zIndex:999, display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ ...sans, fontSize:16, color:gold }}>✓</span>
          <div>
            <p style={{ ...sans, margin:0, fontSize:12, fontWeight:700, color:gold, letterSpacing:'0.1em', textTransform:'uppercase' }}>Payment Successful</p>
            <p style={{ ...sans, margin:'3px 0 0', fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:300 }}>₹5,25,000 received · Receipt sent to email</p>
          </div>
        </div>
      )}

    </DashboardShell>
  )
}
