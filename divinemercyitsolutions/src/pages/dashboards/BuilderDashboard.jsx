import { useState, useEffect } from 'react'
import DashboardShell from '../../components/dashboard/DashboardShell'
import KanbanBoard from '../../components/dashboard/KanbanBoard'
import { tasks as tasksApi } from '../../lib/api'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const MOCK_TASKS = {
  BACKLOG:     [],
  TODO:        [{ id:'b1', title:'Civil work — Kitchen slab',          priority:'HIGH',   type:'FABRICATION'  }, { id:'b2', title:'Tile fixing — Master bathroom', priority:'MEDIUM', type:'INSTALLATION' }],
  IN_PROGRESS: [{ id:'b3', title:'False ceiling — Living room',        priority:'HIGH',   type:'INSTALLATION' }],
  REVIEW:      [{ id:'b4', title:'Electrical rough-in — Bedroom 2',    priority:'MEDIUM', type:'INSPECTION'   }],
  DONE:        [{ id:'b5', title:'Waterproofing — Terrace',            priority:'LOW',    type:'OTHER'        }],
  BLOCKED:     [{ id:'b6', title:'Granite countertop — Awaiting material delivery', priority:'URGENT', type:'PROCUREMENT' }],
}

export default function BuilderDashboard({ user }) {
  const [activeTab,  setActiveTab]  = useState('tasks')
  const [summary,    setSummary]    = useState('')
  const [workers,    setWorkers]    = useState('')
  const [issues,     setIssues]     = useState('')
  const [liveColumns,setLiveColumns]= useState(null)
  const [logSaved,   setLogSaved]   = useState(false)

  useEffect(() => {
    tasksApi.listAll().then(taskList => {
      const tasks = Array.isArray(taskList) ? taskList : []
      if (!tasks.length) return
      const STATUS_TO_COL = { PENDING:'TODO', IN_PROGRESS:'IN_PROGRESS', COMPLETED:'DONE' }
      const cols = { BACKLOG:[], TODO:[], IN_PROGRESS:[], REVIEW:[], DONE:[], BLOCKED:[] }
      tasks.forEach(t => {
        const col = STATUS_TO_COL[t.status] || 'TODO'
        if (cols[col]) cols[col].push({ id: String(t.id), title: t.title, priority: t.priority || 'MEDIUM', type: 'OTHER' })
      })
      setLiveColumns(cols)
    }).catch(()=>{})
  }, [])

  const submitLog = () => {
    setLogSaved(true)
    setTimeout(()=>setLogSaved(false), 2000)
  }

  const nav = [
    { id:'tasks',    label:'My Tasks',    icon:'▦' },
    { id:'daily',    label:'Daily Log',   icon:'◧' },
    { id:'expenses', label:'Expenses',    icon:'◈' },
    { id:'photos',   label:'Site Photos', icon:'◎' },
  ]

  const EXPENSES = [
    { desc:'Sand & aggregate (10 loads)', cat:'MATERIAL',  amt:85000,  date:'Jun 10', status:'APPROVED' },
    { desc:'Mason wages (5 days)',        cat:'LABOUR',    amt:35000,  date:'Jun 12', status:'APPROVED' },
    { desc:'Tile adhesive (200 bags)',    cat:'MATERIAL',  amt:48000,  date:'Jun 13', status:'PENDING'  },
    { desc:'JCB rental (2 days)',         cat:'EQUIPMENT', amt:22000,  date:'Jun 14', status:'PENDING'  },
  ]

  return (
    <DashboardShell user={user} nav={nav} activeTab={activeTab} onTabChange={setActiveTab}>

      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ ...serif, margin: '0 0 4px', fontSize: 24, fontWeight: 300, color: dark }}>Site Tasks</h2>
              <p style={{ ...sans, margin: 0, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>Mehta Villa — Execution Phase</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '5px 10px', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', textTransform: 'uppercase' }}>8 Active</span>
              <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '5px 10px', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', textTransform: 'uppercase' }}>1 Blocked</span>
            </div>
          </div>
          <KanbanBoard initialColumns={liveColumns ?? MOCK_TASKS} />
        </div>
      )}

      {activeTab === 'daily' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Daily Progress Log</h2>
          <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '26px 28px', maxWidth: 600 }}>
            <p style={{ ...sans, margin: '0 0 20px', fontSize: 12, fontWeight: 600, color: gold, letterSpacing: '0.05em' }}>Today — {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            <div style={{ marginBottom: 16 }}>
              <p style={{ ...sans, margin: '0 0 7px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Work Summary</p>
              <textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Describe today's work progress…"
                style={{ ...sans, width: '100%', padding: '12px 14px', background: light, border: `1px solid ${border}`, fontSize: 12, color: dark, outline: 'none', resize: 'none', fontWeight: 300, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <p style={{ ...sans, margin: '0 0 7px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Workers Present</p>
                <input type="number" value={workers} onChange={e => setWorkers(e.target.value)} placeholder="8"
                  style={{ ...sans, width: '100%', padding: '10px 0', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${border}`, fontSize: 13, color: dark, outline: 'none', fontWeight: 300 }} />
              </div>
              <div>
                <p style={{ ...sans, margin: '0 0 7px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Issues / Blockers</p>
                <input type="text" value={issues} onChange={e => setIssues(e.target.value)} placeholder="Material delay, etc."
                  style={{ ...sans, width: '100%', padding: '10px 0', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${border}`, fontSize: 13, color: dark, outline: 'none', fontWeight: 300 }} />
              </div>
            </div>
            <button onClick={submitLog} style={{ ...sans, padding: '11px 24px', background: logSaved ? '#4ade80' : gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {logSaved ? '✓ Submitted!' : 'Submit Daily Log'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ ...serif, margin: 0, fontSize: 24, fontWeight: 300, color: dark }}>Expense Tracker</h2>
            <button style={{ ...sans, padding: '8px 18px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>+ Add Expense</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, border: `1px solid ${border}`, marginBottom: 20 }}>
            {[{ label:'This Month', value:'₹4,28,000', color: dark }, { label:'Approved', value:'₹3,50,000', color:'#4ade80' }, { label:'Pending', value:'₹78,000', color:gold }].map((s, i) => (
              <div key={s.label} style={{ padding: '20px 22px', borderRight: i < 2 ? `1px solid ${border}` : 'none', background: '#fff', textAlign: 'center' }}>
                <p style={{ ...serif, margin: '0 0 4px', fontSize: 28, fontWeight: 300, color: s.color }}>{s.value}</p>
                <p style={{ ...sans, margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', border: `1px solid ${border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: light }}>
                  {['Description','Category','Amount','Date','Status'].map(h => (
                    <th key={h} style={{ ...sans, padding: '12px 20px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e', borderBottom: `1px solid ${border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXPENSES.map((r, i) => (
                  <tr key={r.desc} style={{ borderBottom: i < EXPENSES.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <td style={{ ...sans, padding: '14px 20px', fontSize: 13, color: dark, fontWeight: 300 }}>{r.desc}</td>
                    <td style={{ ...sans, padding: '14px 20px', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone }}>{r.cat}</td>
                    <td style={{ ...serif, padding: '14px 20px', fontSize: 18, fontWeight: 300, color: dark }}>₹{r.amt.toLocaleString()}</td>
                    <td style={{ ...sans, padding: '14px 20px', fontSize: 12, color: '#a8a29e', fontWeight: 300 }}>{r.date}</td>
                    <td style={{ padding: '14px 20px' }}><span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: r.status === 'APPROVED' ? '#4ade80' : gold }}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ ...serif, margin: 0, fontSize: 24, fontWeight: 300, color: dark }}>Site Photo Log</h2>
            <button style={{ ...sans, padding: '8px 18px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>↑ Upload Photos</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '1', background: '#fff', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = dark}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="#e7e5e4" strokeWidth="1.2"/><rect x="3" y="6" width="18" height="14" rx="1" stroke="#e7e5e4" strokeWidth="1.2"/><path d="M3 9h18" stroke="#e7e5e4" strokeWidth="1.2"/></svg>
              </div>
            ))}
          </div>
        </div>
      )}

    </DashboardShell>
  )
}
