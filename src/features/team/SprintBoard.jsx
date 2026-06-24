/**
 * Sprint Board — Shared Kanban for the 6-person El Shaddai dev team
 * Columns: Backlog · In Progress · Review · Done
 */
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const DARK   = '#0d0d12'
const DARK2  = '#12121a'
const CARD   = '#1a1a26'
const BORDER = '#2a2a3a'
const GOLD   = '#c9a227'
const MUTED  = 'rgba(255,255,255,0.38)'
const SS     = "'DM Sans',system-ui,sans-serif"
const SF     = "'Cormorant Garamond',Georgia,serif"

const ROLE_COLOR = {
  PM_UX:          '#a78bfa',
  FRONTEND_LEAD:  '#38bdf8',
  FRONTEND_UI:    '#34d399',
  BACKEND_ENG:    '#f59e0b',
  DEVOPS:         '#fb923c',
  QA_ENGINEER:    '#f87171',
}
const ROLE_LABEL = {
  PM_UX:          'PM / UX',
  FRONTEND_LEAD:  'FE Lead',
  FRONTEND_UI:    'FE UI',
  BACKEND_ENG:    'Backend',
  DEVOPS:         'DevOps',
  QA_ENGINEER:    'QA',
}

const PRIORITY_COLOR = { HIGH: '#f87171', MED: '#f59e0b', LOW: '#34d399' }

const INIT_TASKS = [
  // DONE
  { id:1,  col:'done',    title:'Locked scene data model (Phase 0)',        role:'BACKEND_ENG',    priority:'HIGH', tag:'Architecture', pts:5 },
  { id:2,  col:'done',    title:'glTF export pipeline spec',                role:'BACKEND_ENG',    priority:'HIGH', tag:'Export',       pts:3 },
  { id:3,  col:'done',    title:'2D floor plan canvas with snap-to-grid',   role:'FRONTEND_LEAD',  priority:'HIGH', tag:'Canvas',       pts:8 },
  { id:4,  col:'done',    title:'SceneProvider context + useReducer undo',  role:'FRONTEND_LEAD',  priority:'MED',  tag:'State',        pts:5 },
  { id:5,  col:'done',    title:'Render job queue API (Phase 2 stub)',       role:'BACKEND_ENG',    priority:'MED',  tag:'API',          pts:3 },
  { id:6,  col:'done',    title:'Cinematic CSS — film grain, vignette, letterbox', role:'FRONTEND_UI', priority:'LOW', tag:'Design',   pts:2 },
  { id:7,  col:'done',    'title':'Homestyler-style left panel redesign',   role:'PM_UX',          priority:'HIGH', tag:'UX',           pts:5 },
  { id:8,  col:'done',    title:'ThreeViewport wired to scene model',       role:'FRONTEND_LEAD',  priority:'HIGH', tag:'3D',           pts:8 },

  // IN PROGRESS
  { id:9,  col:'progress',title:'Furniture drag-and-drop in 2D floor plan', role:'FRONTEND_LEAD',  priority:'HIGH', tag:'Canvas',       pts:8 },
  { id:10, col:'progress',title:'Real-time 3D sync from 2D edits',          role:'FRONTEND_LEAD',  priority:'HIGH', tag:'3D',           pts:13},
  { id:11, col:'progress',title:'Role-based team dashboards',               role:'PM_UX',          priority:'HIGH', tag:'Team',         pts:8 },
  { id:12, col:'progress',title:'Sprint / Kanban board for dev team',       role:'PM_UX',          priority:'MED',  tag:'Team',         pts:5 },
  { id:13, col:'progress',title:'CI/CD pipeline on GitHub Actions',         role:'DEVOPS',         priority:'HIGH', tag:'DevOps',       pts:5 },
  { id:14, col:'progress',title:'Responsive catalog grid + filter UX',      role:'FRONTEND_UI',    priority:'MED',  tag:'Catalog',      pts:5 },

  // REVIEW
  { id:15, col:'review',  title:'Door/window opening placement in 2D',      role:'FRONTEND_LEAD',  priority:'MED',  tag:'Canvas',       pts:5 },
  { id:16, col:'review',  title:'Scene save/load to cloud (SQLite)',        role:'BACKEND_ENG',    priority:'HIGH', tag:'Persistence',  pts:5 },
  { id:17, col:'review',  title:'Mobile responsive studio layout',          role:'FRONTEND_UI',    priority:'MED',  tag:'Responsive',   pts:3 },
  { id:18, col:'review',  title:'Render credits deduction on job submit',   role:'BACKEND_ENG',    priority:'MED',  tag:'Billing',      pts:3 },
  { id:19, col:'review',  title:'End-to-end test: draw → 3D → render',     role:'QA_ENGINEER',    priority:'HIGH', tag:'QA',           pts:5 },

  // BACKLOG
  { id:20, col:'backlog', title:'AI room auto-furnishing from floor plan',  role:'PM_UX',          priority:'HIGH', tag:'AI',           pts:13},
  { id:21, col:'backlog', title:'Blender Cycles render worker integration', role:'DEVOPS',         priority:'HIGH', tag:'Render',       pts:13},
  { id:22, col:'backlog', title:'Panorama 360° render output',              role:'BACKEND_ENG',    priority:'MED',  tag:'Render',       pts:8 },
  { id:23, col:'backlog', title:'Furniture catalog — 200+ GLB models',     role:'FRONTEND_UI',    priority:'HIGH', tag:'Catalog',      pts:8 },
  { id:24, col:'backlog', title:'WebSocket collaborative editing',          role:'BACKEND_ENG',    priority:'HIGH', tag:'Collab',       pts:13},
  { id:25, col:'backlog', title:'Performance audit — Lighthouse ≥ 90',     role:'QA_ENGINEER',    priority:'MED',  tag:'QA',           pts:5 },
  { id:26, col:'backlog', title:'Vercel deployment + CDN config',           role:'DEVOPS',         priority:'HIGH', tag:'DevOps',       pts:3 },
  { id:27, col:'backlog', title:'Mobile app wireframes (Phase 3)',          role:'PM_UX',          priority:'MED',  tag:'UX',           pts:8 },
  { id:28, col:'backlog', title:'E2E Playwright test suite',                role:'QA_ENGINEER',    priority:'HIGH', tag:'QA',           pts:8 },
]

const COLS = [
  { id:'backlog',  label:'Backlog',     color:'#6366f1' },
  { id:'progress', label:'In Progress', color:GOLD      },
  { id:'review',   label:'In Review',   color:'#38bdf8' },
  { id:'done',     label:'Done',        color:'#34d399' },
]

function Tag({ label, color = GOLD }) {
  return (
    <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
      color, border:`1px solid ${color}40`, padding:'2px 7px', borderRadius:2 }}>
      {label}
    </span>
  )
}

function Card({ task, onMove }) {
  const [drag, setDrag] = useState(false)
  const col = COLS.find(c => c.id === task.col)
  return (
    <div
      draggable
      onDragStart={() => setDrag(true)}
      onDragEnd={() => setDrag(false)}
      style={{
        background: drag ? '#22223a' : CARD,
        border: `1px solid ${drag ? GOLD+'60' : BORDER}`,
        borderLeft: `3px solid ${ROLE_COLOR[task.role] || GOLD}`,
        borderRadius: 6, padding:'12px 14px', marginBottom: 10,
        cursor:'grab', transition:'all 0.15s',
        opacity: drag ? 0.6 : 1,
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:8 }}>
        <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.88)', lineHeight:1.45, fontFamily:SS, fontWeight:500 }}>
          {task.title}
        </p>
        <span style={{ fontSize:10, color:PRIORITY_COLOR[task.priority], fontWeight:700, flexShrink:0, fontFamily:SS }}>
          {task.priority}
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <Tag label={task.tag} color={col?.color || GOLD} />
          <span style={{ fontSize:9, color:ROLE_COLOR[task.role], fontWeight:600, fontFamily:SS, letterSpacing:'0.1em' }}>
            {ROLE_LABEL[task.role]}
          </span>
        </div>
        <span style={{ fontSize:10, color:MUTED, fontFamily:SS }}>{task.pts} pts</span>
      </div>
      {/* Move buttons */}
      <div style={{ display:'flex', gap:4, marginTop:10 }}>
        {task.col !== 'backlog'  && <MoveBtn label="← Back"   onClick={() => onMove(task.id, prevCol(task.col))} />}
        {task.col !== 'done'     && <MoveBtn label="Forward →" onClick={() => onMove(task.id, nextCol(task.col))} accent />}
      </div>
    </div>
  )
}

function MoveBtn({ label, onClick, accent }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase',
        background: h ? (accent ? GOLD : '#2a2a3a') : 'transparent',
        color: accent ? (h ? '#000' : GOLD) : (h ? '#fff' : MUTED),
        border:`1px solid ${accent ? GOLD+'50' : BORDER}`,
        padding:'4px 10px', cursor:'pointer', borderRadius:3, transition:'all 0.15s', fontFamily:SS }}>
      {label}
    </button>
  )
}

function prevCol(id) { const i = COLS.findIndex(c=>c.id===id); return COLS[Math.max(0,i-1)].id }
function nextCol(id) { const i = COLS.findIndex(c=>c.id===id); return COLS[Math.min(COLS.length-1,i+1)].id }

export default function SprintBoard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState(INIT_TASKS)
  const [filterRole, setFilterRole] = useState('ALL')
  const [search, setSearch] = useState('')

  function moveTask(id, newCol) {
    setTasks(t => t.map(tk => tk.id === id ? { ...tk, col: newCol } : tk))
  }

  const filtered = tasks.filter(t => {
    if (filterRole !== 'ALL' && t.role !== filterRole) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const velocity = tasks.filter(t => t.col === 'done').reduce((s,t) => s + t.pts, 0)
  const inFlight = tasks.filter(t => t.col === 'progress').reduce((s,t) => s + t.pts, 0)

  return (
    <div style={{ minHeight:'100vh', background:DARK, fontFamily:SS, color:'#fff', padding:'0' }}>
      {/* Header */}
      <div style={{ background:DARK2, borderBottom:`1px solid ${BORDER}`, padding:'20px 32px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ margin:'0 0 4px', fontSize:10, fontWeight:700, letterSpacing:'0.28em',
              textTransform:'uppercase', color:GOLD }}>El Shaddai · Dev Sprint</p>
            <h1 style={{ margin:0, fontSize:22, fontFamily:SF, fontWeight:400, color:'#fff' }}>
              Sprint Board — Phase 2 <span style={{ color:GOLD }}>Q3 2026</span>
            </h1>
          </div>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            <Stat label="Velocity" value={`${velocity} pts`} color='#34d399' />
            <Stat label="In Flight" value={`${inFlight} pts`} color={GOLD} />
            <Stat label="Total Tasks" value={tasks.length} color='#a78bfa' />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap', alignItems:'center' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            style={{ background:'#1a1a26', border:`1px solid ${BORDER}`, color:'#fff',
              padding:'8px 14px', fontSize:12, borderRadius:4, outline:'none',
              fontFamily:SS, minWidth:200 }}
          />
          {['ALL','PM_UX','FRONTEND_LEAD','FRONTEND_UI','BACKEND_ENG','DEVOPS','QA_ENGINEER'].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase',
                background: filterRole===r ? (ROLE_COLOR[r]||GOLD) : 'transparent',
                color: filterRole===r ? '#000' : (ROLE_COLOR[r] || MUTED),
                border:`1px solid ${ROLE_COLOR[r]||GOLD}50`,
                padding:'6px 14px', cursor:'pointer', borderRadius:3, transition:'all 0.15s', fontFamily:SS }}>
              {r === 'ALL' ? 'All Roles' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, height:'calc(100vh - 168px)', overflow:'hidden' }}>
        {COLS.map(col => {
          const colTasks = filtered.filter(t => t.col === col.id)
          const pts = colTasks.reduce((s,t)=>s+t.pts,0)
          return (
            <div key={col.id}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const id = parseInt(e.dataTransfer.getData('text/plain') || '0')
                if (id) moveTask(id, col.id)
              }}
              style={{ background: col.id==='progress' ? '#13131e' : DARK2,
                borderRight:`1px solid ${BORDER}`, display:'flex', flexDirection:'column' }}>
              {/* Column header */}
              <div style={{ padding:'14px 16px', borderBottom:`2px solid ${col.color}30`,
                display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:col.color, display:'block' }} />
                  <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:col.color }}>
                    {col.label}
                  </span>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:10, color:MUTED }}>{pts} pts</span>
                  <span style={{ fontSize:11, color:col.color, fontWeight:700, background:`${col.color}20`,
                    width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {colTasks.length}
                  </span>
                </div>
              </div>
              {/* Cards */}
              <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 24px',
                scrollbarWidth:'thin', scrollbarColor:`${BORDER} transparent` }}>
                {colTasks.map(t => (
                  <Card key={t.id} task={t} onMove={moveTask} />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ textAlign:'center', padding:'40px 16px', color:MUTED, fontSize:12 }}>
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign:'right' }}>
      <p style={{ margin:0, fontSize:18, fontWeight:700, color, fontFamily:SF }}>{value}</p>
      <p style={{ margin:0, fontSize:9, color:MUTED, letterSpacing:'0.2em', textTransform:'uppercase' }}>{label}</p>
    </div>
  )
}
