import { useState } from 'react'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const border = '#292524'

const COLUMNS = [
  { id: 'BACKLOG',     label: 'Backlog',     dot: '#57534e'  },
  { id: 'TODO',        label: 'To Do',       dot: '#60a5fa'  },
  { id: 'IN_PROGRESS', label: 'In Progress', dot: gold       },
  { id: 'REVIEW',      label: 'In Review',   dot: '#a78bfa'  },
  { id: 'DONE',        label: 'Done',        dot: '#4ade80'  },
  { id: 'BLOCKED',     label: 'Blocked',     dot: '#f87171'  },
]

const PRIORITY_STYLE = {
  URGENT: { color: '#f87171', border: 'rgba(248,113,113,0.25)' },
  HIGH:   { color: '#fb923c', border: 'rgba(251,146,60,0.25)'  },
  MEDIUM: { color: gold,      border: 'rgba(201,162,39,0.25)'  },
  LOW:    { color: '#57534e', border: 'rgba(87,83,78,0.25)'    },
}

const TYPE_ICON = {
  DESIGN: '✏', PROCUREMENT: '◈', FABRICATION: '⚒',
  INSTALLATION: '⬡', INSPECTION: '◎', DOCUMENTATION: '≡',
  MEETING: '⬭', OTHER: '◆',
}

export default function KanbanBoard({ initialColumns = {} }) {
  const [columns, setColumns] = useState(() => {
    const base = { BACKLOG: [], TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [], BLOCKED: [] }
    return { ...base, ...initialColumns }
  })
  const [dragTask, setDragTask] = useState(null)
  const [dragFrom, setDragFrom] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [addingIn, setAddingIn] = useState(null)
  const [newTitle, setNewTitle] = useState('')

  const onDragStart = (task, colId) => { setDragTask(task); setDragFrom(colId) }

  const onDrop = (toColId) => {
    if (!dragTask || dragFrom === toColId) { setDragOver(null); return }
    setColumns(prev => {
      const from = prev[dragFrom].filter(t => t.id !== dragTask.id)
      const to   = [...prev[toColId], dragTask]
      return { ...prev, [dragFrom]: from, [toColId]: to }
    })
    setDragTask(null); setDragFrom(null); setDragOver(null)
  }

  const addTask = (colId) => {
    if (!newTitle.trim()) return
    const task = { id: `t_${Date.now()}`, title: newTitle.trim(), priority: 'MEDIUM', type: 'OTHER' }
    setColumns(prev => ({ ...prev, [colId]: [...prev[colId], task] }))
    setNewTitle(''); setAddingIn(null)
  }

  const removeTask = (colId, taskId) => {
    setColumns(prev => ({ ...prev, [colId]: prev[colId].filter(t => t.id !== taskId) }))
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
        {COLUMNS.map(col => (
          <div key={col.id}
            onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => onDrop(col.id)}
            style={{ width: 240, display: 'flex', flexDirection: 'column', background: dragOver === col.id ? '#27201d' : '#1e1916', border: `1px solid ${dragOver === col.id ? gold : border}`, transition: 'all 0.15s' }}>

            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
                <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: col.dot }}>{col.label}</span>
                <span style={{ ...sans, fontSize: 10, color: '#57534e', fontWeight: 300 }}>{columns[col.id]?.length || 0}</span>
              </div>
              <button onClick={() => setAddingIn(col.id)}
                style={{ background: 'none', border: 'none', color: '#57534e', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = gold}
                onMouseLeave={e => e.currentTarget.style.color = '#57534e'}>+</button>
            </div>

            {/* Tasks */}
            <div style={{ flex: 1, padding: 8, minHeight: 80, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(columns[col.id] || []).map(task => {
                const ps = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.MEDIUM
                return (
                  <div key={task.id} draggable onDragStart={() => onDragStart(task, col.id)}
                    style={{ background: '#150f0c', border: `1px solid ${border}`, padding: '10px 12px', cursor: 'grab', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,162,39,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1, color: '#57534e' }}>{TYPE_ICON[task.type] || '◆'}</span>
                        <p style={{ ...sans, margin: 0, fontSize: 11, color: '#e7e5e4', lineHeight: 1.5, fontWeight: 300 }}>{task.title}</p>
                      </div>
                      <button onClick={() => removeTask(col.id, task.id)}
                        style={{ background: 'none', border: 'none', color: '#57534e', cursor: 'pointer', fontSize: 11, flexShrink: 0, padding: 0, opacity: 0, transition: 'opacity 0.15s, color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = '#57534e'}>✕</button>
                    </div>
                    {task.priority && (
                      <span style={{ ...sans, display: 'inline-block', fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 6px', border: `1px solid ${ps.border}`, color: ps.color }}>{task.priority}</span>
                    )}
                    {task.assignee && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <div style={{ width: 16, height: 16, background: 'rgba(201,162,39,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: gold, fontWeight: 700 }}>{task.assignee.charAt(0)}</div>
                        <span style={{ ...sans, fontSize: 9, color: '#57534e', fontWeight: 300 }}>{task.assignee}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add task form */}
            {addingIn === col.id && (
              <div style={{ padding: 8, borderTop: `1px solid ${border}` }}>
                <input autoFocus type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTask(col.id); if (e.key === 'Escape') setAddingIn(null) }}
                  placeholder="Task title…"
                  style={{ ...sans, width: '100%', background: '#150f0c', border: `1px solid ${border}`, color: '#e7e5e4', padding: '7px 10px', fontSize: 11, outline: 'none', fontWeight: 300, boxSizing: 'border-box', marginBottom: 6 }}
                  onFocus={e => e.target.style.borderColor = gold}
                  onBlur={e => e.target.style.borderColor = border} />
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => addTask(col.id)}
                    style={{ ...sans, flex: 1, padding: '6px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Add</button>
                  <button onClick={() => setAddingIn(null)}
                    style={{ ...sans, padding: '6px 10px', background: 'transparent', border: `1px solid ${border}`, color: '#57534e', cursor: 'pointer', fontSize: 9 }}>✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
