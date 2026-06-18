import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardShell from '../../components/dashboard/DashboardShell'
import KanbanBoard from '../../components/dashboard/KanbanBoard'
import { projects as projectsApi, tasks as tasksApi } from '../../lib/api'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const MOCK_TASKS = {
  BACKLOG:     [{ id:'t1', title:'Concept moodboard — Singh Residence', priority:'HIGH',   type:'DESIGN',        assignee:'Priya K.' }],
  TODO:        [{ id:'t2', title:'Floor plan — Mehta Villa rev3',       priority:'URGENT', type:'DESIGN',        assignee:'Priya K.' }, { id:'t3', title:'Material specifications sheet', priority:'MEDIUM', type:'DOCUMENTATION', assignee:'Ravi M.' }],
  IN_PROGRESS: [{ id:'t4', title:'3D render — Master bedroom',          priority:'HIGH',   type:'RENDER_3D',     assignee:'Priya K.' }],
  REVIEW:      [{ id:'t5', title:'Kitchen elevation drawings',          priority:'MEDIUM', type:'DESIGN',        assignee:'Ravi M.' }],
  DONE:        [{ id:'t6', title:'Site measurement — Kapoor Apartment', priority:'LOW',    type:'OTHER',         assignee:'Priya K.' }],
  BLOCKED:     [],
}

const PROJECTS = [
  { name:'Singh Residence',  client:'Harjeet Singh',  status:'DESIGN',       area:2400, budget:3200000, progress:35 },
  { name:'Mehta Villa',      client:'Deepak Mehta',   status:'PROCUREMENT',  area:4200, budget:8500000, progress:62 },
  { name:'Kapoor Apartment', client:'Ritu Kapoor',    status:'EXECUTION',    area:1100, budget:1400000, progress:80 },
]

const STATUS_C = { INQUIRY:'#60a5fa', DESIGN:'#8b5cf6', PROCUREMENT:'#f59e0b', EXECUTION:'#fb923c', HANDOVER:'#4ade80', COMPLETED:'#4ade80' }

export default function DesignerDashboard({ user }) {
  const [activeTab,    setActiveTab]    = useState('kanban')
  const [running,      setRunning]      = useState(false)
  const [liveProjects, setLiveProjects] = useState(null)
  const [liveKanban,   setLiveKanban]   = useState(null)

  useEffect(() => {
    projectsApi.list().then(d => {
      const arr = Array.isArray(d) ? d : d?.projects ?? null
      if (arr) setLiveProjects(arr)
    }).catch(()=>{})

    tasksApi.listAll().then(taskList => {
      const tasks = Array.isArray(taskList) ? taskList : []
      if (!tasks.length) return
      const STATUS_TO_COL = { PENDING:'TODO', IN_PROGRESS:'IN_PROGRESS', COMPLETED:'DONE' }
      const cols = { BACKLOG:[], TODO:[], IN_PROGRESS:[], REVIEW:[], DONE:[], BLOCKED:[] }
      tasks.forEach(t => {
        const col = STATUS_TO_COL[t.status] || 'TODO'
        if (cols[col]) cols[col].push({ id: String(t.id), title: t.title, priority: t.priority || 'MEDIUM', type: 'DESIGN', assignee: t.assignee_name || '—' })
      })
      setLiveKanban(cols)
    }).catch(()=>{})
  }, [])
  const [elapsed,   setElapsed]   = useState(0)

  const nav = [
    { id:'kanban',   label:'Kanban Board', icon:'▦' },
    { id:'projects', label:'My Projects',  icon:'⌂' },
    { id:'timeline', label:'Timeline',     icon:'◧' },
    { id:'assets',   label:'Assets',       icon:'◈' },
    { id:'timelog',  label:'Time Tracker', icon:'◎' },
  ]

  const toggleTimer = () => {
    if (!running) {
      const start = Date.now() - elapsed * 1000
      window._timerInterval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    } else {
      clearInterval(window._timerInterval)
    }
    setRunning(r => !r)
  }
  const fmt = s => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <DashboardShell user={user} nav={nav} activeTab={activeTab} onTabChange={setActiveTab}>

      {activeTab === 'kanban' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ ...serif, margin: 0, fontSize: 24, fontWeight: 300, color: dark }}>My Task Board</h2>
            <button style={{ ...sans, padding: '8px 18px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>+ New Task</button>
          </div>
          <KanbanBoard initialColumns={liveKanban || MOCK_TASKS} />
        </div>
      )}

      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ ...serif, margin: '0 0 8px', fontSize: 24, fontWeight: 300, color: dark }}>Active Projects</h2>
          {liveProjects && liveProjects.length === 0 && (
            <div style={{ background:'#fff', border:`1px solid ${border}`, padding:'40px', textAlign:'center' }}>
              <p style={{ ...sans, fontSize:13, color:'#a8a29e' }}>No projects yet. <Link to="/projects" style={{ color:gold }}>Create one →</Link></p>
            </div>
          )}
          {(liveProjects ?? PROJECTS).map((p, idx) => {
            const statusKey = p.status || 'DESIGN'
            const statusColor = STATUS_C[statusKey] || gold
            const progress = p.progress ?? [35,62,80,20,50][idx % 5]
            return (
            <div key={p.id || p.name} style={{ background: '#fff', border: `1px solid ${border}`, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <p style={{ ...sans, margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: dark }}>{p.name}</p>
                  <p style={{ ...sans, margin: 0, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>
                    {p.projectNumber && <span style={{ color:gold, fontWeight:600 }}>{p.projectNumber} · </span>}
                    {p.client || p.clientName || 'Client'}{p.area ? ` · ${p.area.toLocaleString()} sq ft` : ''}{p.budget ? ` · ₹${(p.budget / 100000).toFixed(0)}L` : ''}
                  </p>
                </div>
                <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 8px', border: `1px solid ${statusColor}`, color: statusColor }}>{statusKey}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 2, background: border, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: gold }} />
                </div>
                <span style={{ ...sans, fontSize: 11, color: stone, fontWeight: 400, flexShrink: 0 }}>{progress}%</span>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems:'center' }}>
                <Link to="/designer" style={{ ...sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: gold, textDecoration:'none', textTransform: 'uppercase' }}>Open Designer →</Link>
                <Link to={`/collaborate/${p.id || 'demo'}`} style={{ ...sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#60a5fa', textDecoration:'none', textTransform: 'uppercase' }}>Share with Client →</Link>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Project Timeline</h2>
          <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '40px 28px', textAlign: 'center' }}>
            <p style={{ ...sans, fontSize: 13, color: '#a8a29e', fontWeight: 300 }}>Gantt chart — connect backend at GET /api/projects/:id/tasks/timeline</p>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ ...serif, margin: 0, fontSize: 24, fontWeight: 300, color: dark }}>Design Assets</h2>
            <button style={{ ...sans, padding: '8px 18px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>↑ Upload</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 2 }}>
            {['Floor Plan','Elevation','Mood Board','3D Render','BOQ','Contract'].map(a => (
              <div key={a} style={{ background: '#fff', border: `1px solid ${border}`, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = dark}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                <div style={{ marginBottom: 10, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="12" height="18" rx="1" stroke="#a8a29e" strokeWidth="1.2"/><path d="M8 7h6M8 11h6M8 15h3" stroke="#a8a29e" strokeWidth="1.2" strokeLinecap="square"/></svg>
                </div>
                <p style={{ ...sans, margin: 0, fontSize: 11, fontWeight: 500, color: dark }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timelog' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Time Tracker</h2>
          <div style={{ background: dark, padding: '40px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <p style={{ ...serif, margin: 0, fontSize: 64, fontWeight: 300, color: '#fff', letterSpacing: '0.08em' }}>{fmt(elapsed)}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={toggleTimer}
                style={{ ...sans, padding: '11px 28px', background: running ? '#ef4444' : gold, border: 'none', color: running ? '#fff' : '#000', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {running ? '⏹ Stop' : '▶ Start Timer'}
              </button>
              <button onClick={() => { clearInterval(window._timerInterval); setRunning(false); setElapsed(0) }}
                style={{ ...sans, padding: '11px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Reset
              </button>
            </div>
            <select style={{ ...sans, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '10px 16px', fontSize: 12, outline: 'none', width: 260, fontWeight: 300 }}>
              <option>Select task to log against…</option>
              <option>3D render — Master bedroom</option>
              <option>Floor plan — Mehta Villa rev3</option>
            </select>
          </div>
        </div>
      )}

    </DashboardShell>
  )
}
