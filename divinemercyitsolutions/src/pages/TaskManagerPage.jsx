import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { tasks as tasksApi, projects as projectsApi } from '../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

// ── Shared ────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: `1px solid ${bdr}`, ...style }}>{children}</div>
}
function Btn({ children, onClick, variant = 'primary', disabled, small, style = {} }) {
  const bg  = variant === 'primary' ? gold : variant === 'danger' ? '#ef4444' : 'transparent'
  const col = variant === 'primary' ? '#000' : variant === 'danger' ? '#fff' : dark
  const bd  = variant === 'ghost' ? `1px solid ${bdr}` : 'none'
  const pad = small ? '5px 12px' : '8px 18px'
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...sans, padding: pad, background: bg, border: bd, color: col, fontWeight: 700, fontSize: small ? 10 : 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      {children}
    </button>
  )
}

// ── Data ──────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 'p1', name: 'Mehta Villa', client: 'Rajesh Mehta' },
  { id: 'p2', name: 'Sundar Apartment', client: 'Priya Sundar' },
  { id: 'p3', name: 'Kapoor Office', client: 'Anil Kapoor' },
]
const TASK_TYPES   = ['Design', 'Fabrication', 'Installation', 'Inspection', 'Procurement']
const PRIORITIES   = ['Critical', 'High', 'Medium', 'Low']
const STATUS_FLOW  = ['NOT_STARTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']
const MEMBERS      = ['Priya K.', 'Ravi Mohan', 'Anitha Selvam', 'Suresh Kumar', 'Arjun T.', 'Sneha M.']

const PRIORITY_C  = { Critical: '#ef4444', High: gold, Medium: '#f59e0b', Low: '#94a3b8' }
const STATUS_C    = { NOT_STARTED: '#94a3b8', IN_PROGRESS: gold, UNDER_REVIEW: '#f59e0b', COMPLETED: '#22c55e', ARCHIVED: '#64748b' }

let NEXT_ID = 100
const INIT_TASKS = [
  { id: 't1', project_id: 'p1', title: '3D Modelling — Master Bedroom', type: 'Design',     priority: 'High',     status: 'COMPLETED',   assignee: 'Priya K.',      deadline: '2025-06-10', estimated_hrs: 24, logged_hrs: 28, phase: 'Design', billable: true,
    subtasks: [{ id: 'st1', text: 'Measure & draft floor plan',  done: true }, { id: 'st2', text: '3D model wardrobe unit', done: true }, { id: 'st3', text: 'Render final lighting', done: true }],
    notes: 'Approved by client on 10th June.' },
  { id: 't2', project_id: 'p1', title: 'Material Board Finalisation',  type: 'Design',     priority: 'High',     status: 'IN_PROGRESS', assignee: 'Priya K.',      deadline: '2025-06-18', estimated_hrs: 8,  logged_hrs: 5,  phase: 'Design', billable: true,
    subtasks: [{ id: 'st4', text: 'Select fabric swatches',    done: true }, { id: 'st5', text: 'Get vendor samples',       done: false }, { id: 'st6', text: 'Client approval',       done: false }],
    notes: '' },
  { id: 't3', project_id: 'p1', title: 'Wardrobe Fabrication',         type: 'Fabrication', priority: 'Critical', status: 'IN_PROGRESS', assignee: 'Ravi Mohan',    deadline: '2025-07-01', estimated_hrs: 60, logged_hrs: 22, phase: 'Production', billable: true,
    subtasks: [{ id: 'st7', text: 'Cut MDF panels',            done: true }, { id: 'st8', text: 'Assembly & fitment',        done: false }, { id: 'st9', text: 'Polish & lacquer',      done: false }],
    notes: '' },
  { id: 't4', project_id: 'p1', title: 'Flooring Installation',        type: 'Installation', priority: 'High',    status: 'NOT_STARTED', assignee: 'Suresh Kumar',  deadline: '2025-07-15', estimated_hrs: 40, logged_hrs: 0,  phase: 'Execution', billable: true,
    subtasks: [{ id: 'st10', text: 'Surface preparation',      done: false }, { id: 'st11', text: 'Tile laying — living room', done: false }, { id: 'st12', text: 'Grouting & polish',   done: false }],
    notes: '' },
  { id: 't5', project_id: 'p2', title: 'Concept Presentation Deck',    type: 'Design',     priority: 'Medium',   status: 'UNDER_REVIEW',assignee: 'Arjun T.',      deadline: '2025-06-20', estimated_hrs: 12, logged_hrs: 10, phase: 'Design', billable: true,
    subtasks: [{ id: 'st13', text: 'Mood board',               done: true }, { id: 'st14', text: '2D layout',                done: true }, { id: 'st15', text: 'Cost estimate',        done: false }],
    notes: 'Sent to client for review.' },
  { id: 't6', project_id: 'p3', title: 'Office Layout Planning',       type: 'Design',     priority: 'High',     status: 'NOT_STARTED', assignee: 'Sneha M.',      deadline: '2025-06-25', estimated_hrs: 16, logged_hrs: 0,  phase: 'Design', billable: true,
    subtasks: [{ id: 'st16', text: 'Site visit & measurement', done: false }, { id: 'st17', text: 'Space planning options',   done: false }],
    notes: '' },
]

// ── Stopwatch hook ────────────────────────────────────────────────
function useStopwatch() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [taskId,  setTaskId]  = useState(null)
  const intervalRef = useRef(null)
  const startRef    = useRef(null)

  function start(id) {
    if (running && taskId === id) { stop(); return }
    if (running) stop()
    setTaskId(id)
    setRunning(true)
    setElapsed(0)
    startRef.current = Date.now()
    intervalRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
  }
  function stop() {
    clearInterval(intervalRef.current)
    setRunning(false)
    const hrs = elapsed / 3600
    return { taskId, hrs }
  }
  useEffect(() => () => clearInterval(intervalRef.current), [])

  const fmt = s => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  return { running, elapsed, taskId, start, stop, fmt }
}

// ── Task Card ─────────────────────────────────────────────────────
function TaskCard({ task, onUpdate, stopwatch, onStartTimer }) {
  const [expanded, setExpanded] = useState(false)
  const [note,     setNote]     = useState(task.notes || '')

  const pct      = task.subtasks.length ? Math.round((task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100) : (task.status === 'COMPLETED' ? 100 : 0)
  const over     = task.logged_hrs > task.estimated_hrs * 1.2
  const isActive = stopwatch.running && stopwatch.taskId === task.id
  const sc       = STATUS_C[task.status]
  const pc       = PRIORITY_C[task.priority]

  function toggleSub(id) {
    const updated = { ...task, subtasks: task.subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s) }
    const allDone = updated.subtasks.every(s => s.done)
    if (allDone && task.status !== 'COMPLETED') updated.status = 'UNDER_REVIEW'
    onUpdate(updated)
  }
  function nextStatus() {
    const idx = STATUS_FLOW.indexOf(task.status)
    if (idx < STATUS_FLOW.length - 1) onUpdate({ ...task, status: STATUS_FLOW[idx + 1] })
  }

  return (
    <Card style={{ marginBottom: 10, overflow: 'hidden' }}>
      {/* Priority stripe */}
      <div style={{ height: 2, background: pc }} />
      <div style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: pc, border: `1px solid ${pc}`, padding: '1px 6px' }}>{task.priority}</span>
              <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: sc, border: `1px solid ${sc}`, padding: '1px 6px' }}>{task.status.replace(/_/g, ' ')}</span>
              <span style={{ ...sans, fontSize: 9, color: stone, border: `1px solid ${bdr}`, padding: '1px 6px' }}>{task.type}</span>
              {task.billable && <span style={{ ...sans, fontSize: 9, color: gold, border: `1px solid ${gold}`, padding: '1px 6px' }}>Billable</span>}
              {over && <span style={{ ...sans, fontSize: 9, color: '#ef4444', border: '1px solid #ef4444', padding: '1px 6px' }}>⚠ Overtime</span>}
            </div>
            <p style={{ ...serif, fontSize: 16, fontWeight: 300, color: dark, margin: '0 0 4px' }}>{task.title}</p>
            <p style={{ ...sans, fontSize: 10, color: stone, margin: 0 }}>
              {task.assignee} · Due {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Phase: {task.phase}
            </p>
          </div>

          {/* Timer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <button onClick={() => onStartTimer(task.id)}
              style={{ ...sans, padding: '6px 12px', background: isActive ? dark : gold, border: `1px solid ${isActive ? gold : gold}`, color: isActive ? gold : '#000', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', minWidth: 90 }}>
              {isActive ? `⏹ ${stopwatch.fmt(stopwatch.elapsed)}` : '▶ Timer'}
            </button>
            <span style={{ ...sans, fontSize: 10, color: over ? '#ef4444' : stone }}>{task.logged_hrs}h / {task.estimated_hrs}h est.</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ ...sans, fontSize: 9, color: stone, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Progress</span>
            <span style={{ ...sans, fontSize: 10, fontWeight: 700, color: pct === 100 ? '#22c55e' : gold }}>{pct}%</span>
          </div>
          <div style={{ height: 3, background: bdr }}>
            <div style={{ height: 3, width: `${pct}%`, background: pct === 100 ? '#22c55e' : gold, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Expand */}
        <button onClick={() => setExpanded(e => !e)}
          style={{ ...sans, fontSize: 10, color: stone, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {expanded ? '▲ Hide details' : `▼ ${task.subtasks.length} sub-tasks`}
        </button>

        {expanded && (
          <div style={{ marginTop: 12 }}>
            {/* Sub-tasks */}
            <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 8px' }}>Sub-tasks</p>
            {task.subtasks.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, cursor: 'pointer' }}>
                <div onClick={() => toggleSub(s.id)}
                  style={{ width: 16, height: 16, border: `1px solid ${s.done ? gold : bdr}`, background: s.done ? gold : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.done && <span style={{ fontSize: 10, color: '#000' }}>✓</span>}
                </div>
                <span style={{ ...sans, fontSize: 12, color: s.done ? stone : dark, textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
              </label>
            ))}

            {/* Notes */}
            <div style={{ marginTop: 12 }}>
              <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 6px' }}>Notes</p>
              <textarea value={note} onChange={e => { setNote(e.target.value); onUpdate({ ...task, notes: e.target.value }) }} rows={2}
                style={{ ...sans, width: '100%', padding: '8px 10px', border: `1px solid ${bdr}`, fontSize: 11, color: dark, resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Add notes…" />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {task.status !== 'COMPLETED' && task.status !== 'ARCHIVED' && (
                <Btn small onClick={nextStatus}>→ Next Status</Btn>
              )}
              <Btn small variant="ghost" onClick={() => onUpdate({ ...task, status: 'ARCHIVED' })}>Archive</Btn>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Kanban Board ──────────────────────────────────────────────────
function KanbanView({ tasks, onUpdate }) {
  const COLS = [
    { id: 'NOT_STARTED', label: 'To Do' },
    { id: 'IN_PROGRESS',  label: 'In Progress' },
    { id: 'UNDER_REVIEW', label: 'Review' },
    { id: 'COMPLETED',    label: 'Done' },
  ]
  return (
    <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
      {COLS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id)
        const c = STATUS_C[col.id]
        return (
          <div key={col.id} style={{ minWidth: 240, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${c}` }}>
              <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: c }}>{col.label}</span>
              <span style={{ ...sans, fontSize: 11, fontWeight: 700, color: c, border: `1px solid ${c}`, padding: '1px 8px' }}>{colTasks.length}</span>
            </div>
            {colTasks.map(t => {
              const pc = PRIORITY_C[t.priority]
              return (
                <div key={t.id} style={{ background: '#fff', border: `1px solid ${bdr}`, borderLeft: `3px solid ${pc}`, padding: '12px 14px', marginBottom: 8 }}>
                  <p style={{ ...serif, fontSize: 13, fontWeight: 300, color: dark, margin: '0 0 4px', lineHeight: 1.4 }}>{t.title}</p>
                  <p style={{ ...sans, fontSize: 10, color: stone, margin: '0 0 8px' }}>{t.assignee}</p>
                  <div style={{ height: 2, background: bdr, marginBottom: 6 }}>
                    <div style={{ height: 2, width: `${t.subtasks.filter(s => s.done).length / Math.max(t.subtasks.length, 1) * 100}%`, background: gold }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ ...sans, fontSize: 9, color: stone }}>{t.subtasks.filter(s => s.done).length}/{t.subtasks.length} done</span>
                    <span style={{ ...sans, fontSize: 9, color: t.logged_hrs > t.estimated_hrs ? '#ef4444' : stone }}>{t.logged_hrs}h/{t.estimated_hrs}h</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── New Task Form ─────────────────────────────────────────────────
function NewTaskModal({ onSave, onClose, apiProj, defaultProject }) {
  const [form, setForm] = useState({ project_id: defaultProject || 'p1', title: '', type: 'Design', priority: 'High', assignee: MEMBERS[0], deadline: '', estimated_hrs: 8, phase: 'Design', billable: true })
  const [subtasks, setSubs] = useState([{ id: 'new1', text: '', done: false }])
  const [saving, setSaving] = useState(false)

  function addSub()  { setSubs(s => [...s, { id: `new${Date.now()}`, text: '', done: false }]) }
  function setSub(id, text) { setSubs(s => s.map(x => x.id === id ? { ...x, text } : x)) }
  function removeSub(id)    { setSubs(s => s.filter(x => x.id !== id)) }

  async function save() {
    if (!form.title || !form.deadline) return
    setSaving(true)
    const localTask = { id: `t${++NEXT_ID}`, ...form, status: 'NOT_STARTED', logged_hrs: 0, notes: '', subtasks: subtasks.filter(s => s.text.trim()) }
    if (apiProj.length > 0) {
      try {
        const created = await tasksApi.create({
          project_id: form.project_id,
          title: form.title,
          description: subtasks.filter(s => s.text.trim()).map(s => s.text).join(' | ') || '',
          status: STATUS_TO_API[form.status] || 'PENDING',
          priority: PRIORITY_TO_API[form.priority] || 'NORMAL',
          due_date: form.deadline,
        })
        onSave({ ...localTask, id: String(created.id), _fromApi: true })
      } catch { onSave(localTask) }
    } else {
      onSave(localTask)
    }
    setSaving(false)
    onClose()
  }

  const F = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
  const Input = ({ field, ...props }) => (
    <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{ ...sans, width: '100%', padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, boxSizing: 'border-box' }} {...props} />
  )
  const Select = ({ field, options }) => (
    <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{ ...sans, width: '100%', padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, background: '#fff' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', width: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ background: dark, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ ...serif, fontSize: 20, fontWeight: 300, color: '#fff', margin: 0 }}>New Task</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <F label="Task Title"><Input field="title" placeholder="e.g. Install false ceiling — Bedroom 1" /></F>
            </div>
            <F label="Project"><Select field="project_id" options={(apiProj.length > 0 ? apiProj.map(p => ({ id: String(p.id), name: p.name })) : PROJECTS).map(p => p.id || p)} /></F>
            <F label="Type"><Select field="type" options={TASK_TYPES} /></F>
            <F label="Priority"><Select field="priority" options={PRIORITIES} /></F>
            <F label="Assignee"><Select field="assignee" options={MEMBERS} /></F>
            <F label="Deadline"><Input field="deadline" type="date" /></F>
            <F label="Est. Hours"><input type="number" value={form.estimated_hrs} onChange={e => setForm(f => ({ ...f, estimated_hrs: +e.target.value }))} min={1}
              style={{ ...sans, width: '100%', padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, boxSizing: 'border-box' }} /></F>
            <F label="Phase"><Select field="phase" options={['Design', 'Procurement', 'Production', 'Execution', 'Handover']} /></F>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
              <div onClick={() => setForm(f => ({ ...f, billable: !f.billable }))}
                style={{ width: 18, height: 18, border: `1px solid ${form.billable ? gold : bdr}`, background: form.billable ? gold : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {form.billable && <span style={{ fontSize: 11, color: '#000' }}>✓</span>}
              </div>
              <span style={{ ...sans, fontSize: 11, color: dark }}>Billable task</span>
            </div>
          </div>

          <div style={{ marginTop: 4 }}>
            <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 8px' }}>Sub-tasks</p>
            {subtasks.map(s => (
              <div key={s.id} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input value={s.text} onChange={e => setSub(s.id, e.target.value)} placeholder={`Sub-task ${subtasks.indexOf(s) + 1}…`}
                  style={{ ...sans, flex: 1, padding: '6px 10px', border: `1px solid ${bdr}`, fontSize: 12, color: dark }} />
                <button onClick={() => removeSub(s.id)} style={{ width: 28, height: 28, background: light, border: `1px solid ${bdr}`, color: '#a8a29e', cursor: 'pointer', fontSize: 11 }}>✕</button>
              </div>
            ))}
            <button onClick={addSub} style={{ ...sans, fontSize: 10, color: gold, background: 'none', border: `1px dashed ${gold}`, padding: '5px 14px', cursor: 'pointer', marginTop: 4 }}>+ Add Sub-task</button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn onClick={save} disabled={!form.title || !form.deadline || saving}>{saving ? 'Saving…' : 'Create Task'}</Btn>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Status / priority mapping between backend and UI ─────────────
const STATUS_MAP   = { PENDING:'NOT_STARTED', IN_PROGRESS:'IN_PROGRESS', COMPLETED:'COMPLETED' }
const PRIORITY_MAP = { CRITICAL:'Critical', HIGH:'High', NORMAL:'Medium', LOW:'Low' }
const STATUS_TO_API = { NOT_STARTED:'PENDING', IN_PROGRESS:'IN_PROGRESS', UNDER_REVIEW:'IN_PROGRESS', COMPLETED:'COMPLETED', ARCHIVED:'COMPLETED' }
const PRIORITY_TO_API = { Critical:'CRITICAL', High:'HIGH', Medium:'NORMAL', Low:'LOW' }

function mapApiTask(t) {
  return {
    id: String(t.id),
    project_id: String(t.project_id),
    title: t.title || 'Untitled',
    type: 'Design',
    priority: PRIORITY_MAP[t.priority] || 'Medium',
    status: STATUS_MAP[t.status] || 'NOT_STARTED',
    assignee: t.assignee_name || 'Unassigned',
    deadline: t.due_date || '',
    estimated_hrs: 8,
    logged_hrs: 0,
    phase: 'Design',
    billable: true,
    subtasks: [],
    notes: t.description || '',
    _fromApi: true,
  }
}

// ── Main ──────────────────────────────────────────────────────────
export default function TaskManagerPage() {
  const [tasks,      setTasks]      = useState(INIT_TASKS)
  const [apiProj,    setApiProj]    = useState([])
  const [view,       setView]       = useState('list')
  const [filterP,    setFilterP]    = useState('p1')
  const [filterS,    setFilterS]    = useState('all')
  const [creating,   setCreating]   = useState(false)
  const [sideCol,    setSideCol]    = useState(false)
  const [loadingT,   setLoadingT]   = useState(false)
  const stopwatch = useStopwatch()

  // Load projects + tasks from backend on mount
  useEffect(() => {
    async function load() {
      try {
        const [proj, apiTasks] = await Promise.all([
          projectsApi.list().catch(() => []),
          tasksApi.listAll().catch(() => []),
        ])
        const projects = Array.isArray(proj) ? proj : []
        if (projects.length > 0) {
          setApiProj(projects)
          const firstId = String(projects[0].id)
          setFilterP(firstId)
          const mapped = Array.isArray(apiTasks) ? apiTasks.map(mapApiTask) : []
          setTasks(mapped.length > 0 ? mapped : INIT_TASKS)
        }
      } catch { /* keep mock data */ }
    }
    load()
  }, [])

  const user = JSON.parse(localStorage.getItem('es_user') || '{"name":"Admin","role":"ADMIN"}')
  const initials = (user.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const W = sideCol ? 60 : 220

  const filtered = tasks.filter(t => {
    if (t.project_id !== filterP) return false
    if (filterS !== 'all' && t.status !== filterS) return false
    return true
  })

  async function handleUpdate(updated) {
    setTasks(ts => ts.map(t => t.id === updated.id ? updated : t))
    if (updated._fromApi) {
      tasksApi.update(updated.id, {
        status:   STATUS_TO_API[updated.status]   || 'PENDING',
        priority: PRIORITY_TO_API[updated.priority] || 'NORMAL',
        title: updated.title,
        description: updated.notes,
        due_date: updated.deadline,
      }).catch(() => {})
    }
  }
  function handleAdd(task) { setTasks(ts => [...ts, task]) }

  function handleTimer(id) {
    if (stopwatch.running && stopwatch.taskId === id) {
      const { hrs } = stopwatch.stop()
      setTasks(ts => ts.map(t => t.id === id ? { ...t, logged_hrs: +(t.logged_hrs + hrs).toFixed(2) } : t))
    } else {
      stopwatch.start(id)
    }
  }

  const allProj = apiProj.length > 0 ? apiProj.map(p => ({ id: String(p.id), name: p.name })) : PROJECTS
  const proj = allProj.find(p => p.id === filterP)
  const totalHrs    = filtered.reduce((s, t) => s + t.logged_hrs, 0)
  const totalEstHrs = filtered.reduce((s, t) => s + t.estimated_hrs, 0)
  const completed   = filtered.filter(t => t.status === 'COMPLETED').length

  const SIDEBAR_ITEMS = [
    { id: 'list',   icon: '◧', label: 'List View' },
    { id: 'kanban', icon: '▦', label: 'Kanban Board' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', ...sans, background: light }}>
      {/* Sidebar */}
      <aside style={{ width: W, background: dark, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.22s ease', overflow: 'hidden' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: sideCol ? '0 15px' : '0 16px', borderBottom: '1px solid #292524', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none" /></svg>
          </div>
          {!sideCol && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ ...serif, margin: 0, fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>El Shaddai</p>
              <p style={{ margin: 0, fontSize: 8, color: gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 1 }}>Task Manager</p>
            </div>
          )}
          <button onClick={() => setSideCol(c => !c)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#57534e', cursor: 'pointer', fontSize: 14, padding: 4 }}>{sideCol ? '»' : '«'}</button>
        </div>

        {/* Project picker */}
        {!sideCol && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #292524' }}>
            <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#57534e', margin: '0 0 8px' }}>Project</p>
            {(apiProj.length > 0 ? apiProj.map(p => ({ id: String(p.id), name: p.name })) : PROJECTS).map(p => (
              <button key={p.id} onClick={() => setFilterP(p.id)}
                style={{ display: 'block', width: '100%', padding: '7px 10px', background: filterP === p.id ? `rgba(201,162,39,0.1)` : 'transparent', border: 'none', borderLeft: `2px solid ${filterP === p.id ? gold : 'transparent'}`, color: filterP === p.id ? gold : '#78716c', textAlign: 'left', cursor: 'pointer', ...sans, fontSize: 11, fontWeight: filterP === p.id ? 600 : 400, marginBottom: 2 }}>
                {p.name}
              </button>
            ))}
          </div>
        )}

        <nav style={{ flex: 1, padding: '10px 6px' }}>
          {SIDEBAR_ITEMS.map(t => {
            const active = view === t.id
            return (
              <button key={t.id} onClick={() => setView(t.id)} title={t.label}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: sideCol ? '10px 15px' : '9px 12px', background: active ? 'rgba(201,162,39,0.08)' : 'transparent', border: 'none', borderLeft: `2px solid ${active ? gold : 'transparent'}`, color: active ? gold : '#78716c', cursor: 'pointer', ...sans, fontSize: 11, fontWeight: active ? 600 : 400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                {!sideCol && <span>{t.label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: sideCol ? '10px 6px' : '10px 8px', borderTop: '1px solid #292524' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sideCol ? '8px 15px' : '8px 12px', color: '#78716c', textDecoration: 'none', ...sans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <span>◁</span>{!sideCol && <span>Dashboards</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ height: 60, background: '#fff', borderBottom: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0 }}>
          <p style={{ ...serif, margin: 0, fontSize: 22, fontWeight: 300, color: dark }}>Task Manager</p>
          <span style={{ ...sans, fontSize: 10, color: stone }}>— {proj?.name}</span>
          <div style={{ flex: 1 }} />

          {/* Filters */}
          <select value={filterS} onChange={e => setFilterS(e.target.value)}
            style={{ ...sans, fontSize: 11, padding: '5px 10px', border: `1px solid ${bdr}`, background: '#fff', color: dark }}>
            <option value="all">All Status</option>
            {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>

          {/* Live timer indicator */}
          {stopwatch.running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: dark, border: `1px solid ${gold}` }}>
              <div style={{ width: 7, height: 7, background: '#22c55e', animation: 'pulse 1s infinite' }} />
              <span style={{ ...sans, fontSize: 11, fontWeight: 700, color: gold }}>{stopwatch.fmt(stopwatch.elapsed)}</span>
            </div>
          )}

          <Btn onClick={() => setCreating(true)}>+ Task</Btn>
          <div style={{ width: 32, height: 32, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#000' }}>{initials}</div>
        </header>

        {/* KPI bar */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${bdr}`, display: 'flex', padding: '0 28px' }}>
          {[
            { label: 'Total Tasks', value: filtered.length },
            { label: 'Completed',   value: completed, accent: '#22c55e' },
            { label: 'In Progress', value: filtered.filter(t => t.status === 'IN_PROGRESS').length, accent: gold },
            { label: 'Overdue',     value: filtered.filter(t => new Date(t.deadline) < new Date() && t.status !== 'COMPLETED').length, accent: '#ef4444' },
            { label: 'Hours Logged',value: `${totalHrs.toFixed(0)}h / ${totalEstHrs}h` },
            { label: 'Completion',  value: `${Math.round((completed / Math.max(filtered.length, 1)) * 100)}%`, accent: gold },
          ].map(k => (
            <div key={k.label} style={{ padding: '10px 20px', borderRight: `1px solid ${bdr}` }}>
              <p style={{ ...sans, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 3px' }}>{k.label}</p>
              <p style={{ ...serif, fontSize: 18, fontWeight: 300, color: k.accent || dark, margin: 0 }}>{k.value}</p>
            </div>
          ))}
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {view === 'list' && (
            filtered.length === 0
              ? <p style={{ ...serif, fontSize: 18, fontWeight: 300, color: '#a8a29e', textAlign: 'center', marginTop: 60 }}>No tasks found for this filter.</p>
              : filtered.map(task => <TaskCard key={task.id} task={task} onUpdate={handleUpdate} stopwatch={stopwatch} onStartTimer={handleTimer} />)
          )}
          {view === 'kanban' && <KanbanView tasks={filtered} onUpdate={handleUpdate} />}
        </main>
      </div>

      {creating && <NewTaskModal onSave={handleAdd} onClose={() => setCreating(false)} apiProj={apiProj} defaultProject={filterP} />}
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
    </div>
  )
}
