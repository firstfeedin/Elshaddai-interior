import { useState, useEffect } from 'react'
import DashboardShell from '../../components/dashboard/DashboardShell'
import { tasks as tasksApi } from '../../lib/api'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const TASKS = [
  { id:'w1', title:'Fabricate modular kitchen carcass — 12 units', priority:'URGENT', due:'Jun 17', project:'Mehta Villa',    status:'IN_PROGRESS' },
  { id:'w2', title:'Wardrobes — Bedroom 1 & 2 shutters',          priority:'HIGH',   due:'Jun 20', project:'Mehta Villa',    status:'TODO'        },
  { id:'w3', title:'TV unit assembly — Living room',              priority:'MEDIUM', due:'Jun 22', project:'Singh Residence', status:'TODO'        },
]

const DONE_TASKS = ['Drawer slides installation — 24 units', 'Surface sanding — Kitchen panels', 'Quality check — Bedroom wardrobe']

const TIMELOG = [
  { task:'Fabricate modular kitchen carcass', start:'09:00', end:'12:30', hrs:3.5 },
  { task:'Lunch break',                        start:'12:30', end:'13:30', hrs:1.0 },
  { task:'Wardrobes — cutting & edging',       start:'13:30', end:'17:00', hrs:3.5 },
]

const PRIORITY_STYLE = {
  URGENT: { color:'#f87171', border:'rgba(248,113,113,0.3)' },
  HIGH:   { color:'#fb923c', border:'rgba(251,146,60,0.3)'  },
  MEDIUM: { color:gold,      border:`rgba(201,162,39,0.3)`  },
  LOW:    { color:stone,     border:`rgba(87,83,78,0.3)`    },
}

export default function WorkerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('tasks')
  const [tasks,     setTasks]     = useState(TASKS)
  const [timeStart, setTimeStart] = useState(null)
  const [timeLogs,  setTimeLogs]  = useState(TIMELOG)
  const [noteModal, setNoteModal] = useState(null)
  const [noteText,  setNoteText]  = useState('')

  useEffect(() => {
    tasksApi.listAll().then(taskList => {
      const apiTasks = Array.isArray(taskList) ? taskList : []
      if (!apiTasks.length) return
      setTasks(apiTasks.map(t => ({
        id: String(t.id), title: t.title, priority: t.priority || 'MEDIUM',
        due: t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : 'TBD',
        project: t.project_name || '—', status: t.status || 'TODO',
      })))
    }).catch(()=>{})
  }, [])

  const startTask = id => {
    setTasks(t => t.map(x => x.id === id ? { ...x, status:'IN_PROGRESS' } : x))
    setTimeStart(Date.now())
    tasksApi.update(id, { status:'IN_PROGRESS' }).catch(()=>{})
  }

  const markDone = id => {
    const task = tasks.find(t => t.id === id)
    if (task && timeStart) {
      const hrs = ((Date.now() - timeStart) / 3600000).toFixed(1)
      setTimeLogs(prev => [...prev, { task: task.title, start: new Date(timeStart).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}), end: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}), hrs: parseFloat(hrs) }])
    }
    setTasks(t => t.map(x => x.id === id ? { ...x, status:'DONE' } : x))
    setTimeStart(null)
    tasksApi.update(id, { status:'DONE' }).catch(()=>{})
  }

  const submitNote = () => {
    if (!noteText.trim()) { setNoteModal(null); return }
    tasksApi.update(noteModal, { notes: noteText }).catch(()=>{})
    setNoteModal(null); setNoteText('')
  }

  const nav = [
    { id:'tasks',   label:'My Tasks',  icon:'▦' },
    { id:'timelog', label:'Time Log',  icon:'◎' },
    { id:'done',    label:'Completed', icon:'✓'  },
  ]


  return (
    <DashboardShell user={user} nav={nav} activeTab={activeTab} onTabChange={setActiveTab}>

      {activeTab === 'tasks' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Workshop Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.filter(t => t.status !== 'DONE').map(task => {
              const ps = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.LOW
              return (
                <div key={task.id} style={{ background: '#fff', border: `1px solid ${border}`, padding: '18px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <p style={{ ...sans, margin: '0 0 4px', fontSize: 13, fontWeight: 500, color: dark }}>{task.title}</p>
                      <p style={{ ...sans, margin: 0, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>Project: {task.project} · Due: {task.due}</p>
                    </div>
                    <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 8px', border: `1px solid ${ps.border}`, color: ps.color, flexShrink: 0, marginLeft: 12 }}>{task.priority}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {task.status === 'TODO' && (
                      <button onClick={() => startTask(task.id)} style={{ ...sans, padding: '7px 16px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>▶ Start Task</button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button onClick={() => markDone(task.id)} style={{ ...sans, padding: '7px 16px', background: '#4ade80', border: 'none', color: dark, cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>✓ Mark Complete</button>
                    )}
                    <button onClick={()=>setNoteModal(task.id)} style={{ ...sans, padding: '7px 14px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>Add Note</button>
                    {task.status === 'IN_PROGRESS' && <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px 0', color: gold, marginLeft: 4 }}>● In Progress</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'timelog' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Today's Time Log</h2>
          <div style={{ background: '#fff', border: `1px solid ${border}`, overflow: 'hidden' }}>
            {timeLogs.map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderBottom: i < timeLogs.length - 1 ? `1px solid ${border}` : 'none' }}>
                <span style={{ ...sans, fontSize: 11, color: '#a8a29e', fontWeight: 300, width: 110, flexShrink: 0 }}>{entry.start} – {entry.end}</span>
                <span style={{ ...sans, flex: 1, fontSize: 13, color: dark, fontWeight: 300 }}>{entry.task}</span>
                <span style={{ ...serif, fontSize: 20, fontWeight: 300, color: gold, flexShrink: 0 }}>{entry.hrs}h</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 22px', background: light }}>
              <span style={{ ...sans, fontSize: 12, color: stone, fontWeight: 400 }}>Total today</span>
              <span style={{ ...serif, fontSize: 22, fontWeight: 300, color: dark }}>{timeLogs.reduce((s,e)=>s+e.hrs,0).toFixed(1)} hrs</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'done' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Completed Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...DONE_TASKS, ...tasks.filter(t => t.status === 'DONE').map(t => t.title)].map((t, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${border}`, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 14, opacity: 0.6 }}>
                <span style={{ color: '#4ade80', fontSize: 14, flexShrink: 0 }}>✓</span>
                <p style={{ ...sans, margin: 0, fontSize: 13, color: stone, fontWeight: 300, textDecoration: 'line-through' }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'#fff', padding:'28px', maxWidth:400, width:'90%' }}>
            <p style={{ ...serif, margin:'0 0 16px', fontSize:20, fontWeight:300, color:dark }}>Add Task Note</p>
            <textarea rows={4} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Describe progress, issues, or observations…"
              style={{ ...sans, width:'100%', padding:'10px 12px', border:`1px solid ${border}`, fontSize:12, outline:'none', resize:'none', fontWeight:300, boxSizing:'border-box', marginBottom:14 }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={submitNote} style={{ ...sans, flex:1, padding:'10px', background:gold, border:'none', color:'#000', cursor:'pointer', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' }}>Save Note</button>
              <button onClick={()=>setNoteModal(null)} style={{ ...sans, padding:'10px 16px', background:'none', border:`1px solid ${border}`, color:stone, cursor:'pointer', fontSize:10 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </DashboardShell>
  )
}
