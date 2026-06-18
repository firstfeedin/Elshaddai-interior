import { useState } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'
const GEMINI = import.meta.env.VITE_GEMINI_API_KEY

const PHASE_COLORS = {
  'Concept & Design':   '#c9a227',
  'Procurement':        '#8b7355',
  'Civil & Electrical': '#57534e',
  'Fabrication':        '#3d2b1f',
  'Execution':          '#1c1917',
  'Final & Handover':   '#22c55e',
}

const PROPERTY_TYPES = ['Apartment','Villa / Bungalow','Office / Commercial','Retail Store','Restaurant / Café','Hospital / Clinic']
const SCOPES = ['Full Interior','Living + Dining Only','Bedroom(s) Only','Kitchen Only','Bathrooms Only','Full + Exterior']
const CITIES = ['Hyderabad','Secunderabad','Warangal','Nizamabad','Bangalore','Mumbai','Delhi','Kochi']

// ── Demo schedule generator (no AI key) ──────────────────────────
function buildDemoSchedule(form) {
  const areaNum  = parseInt(form.area) || 1200
  const budgetL  = parseInt(form.budget) || 25
  const rooms    = parseInt(form.rooms)  || 3

  const baseWeeks = Math.max(12, Math.round(areaNum / 120))
  const startDate = new Date()

  function addWeeks(date, n) {
    const d = new Date(date)
    d.setDate(d.getDate() + n * 7)
    return d.toISOString().slice(0, 10)
  }

  let cursor = new Date(startDate)

  const phases = [
    {
      phase: 'Concept & Design',
      duration: Math.max(3, Math.round(rooms * 1.2)),
      tasks: [
        { task: 'Site visit & detailed measurement', assignee: 'Designer', days: 3 },
        { task: 'Concept presentation & mood board', assignee: 'Designer', days: 7 },
        { task: '2D floor plan & layout approval', assignee: 'Designer', days: 5 },
        { task: '3D visualisation — all rooms', assignee: 'Designer', days: 10 },
        { task: 'Material board & client approval', assignee: 'Designer', days: 5 },
        { task: 'Final quotation & contract sign-off', assignee: 'Admin', days: 3 },
      ],
    },
    {
      phase: 'Procurement',
      duration: Math.max(4, Math.round(budgetL * 0.12)),
      tasks: [
        { task: 'Raise purchase orders — furniture', assignee: 'Procurement', days: 2 },
        { task: 'Raise POs — flooring & tiles', assignee: 'Procurement', days: 2 },
        { task: 'Hardware & fittings procurement', assignee: 'Procurement', days: 2 },
        { task: 'Material delivery & inspection', assignee: 'Procurement', days: 7 },
        { task: 'Vendor coordination & follow-up', assignee: 'Procurement', days: 14 },
      ],
    },
    {
      phase: 'Civil & Electrical',
      duration: Math.max(3, Math.round(areaNum / 400)),
      tasks: [
        { task: 'Demolition & surface preparation', assignee: 'Site Team', days: 5 },
        { task: 'Plumbing rerouting (if applicable)', assignee: 'Plumber', days: 4 },
        { task: 'Electrical wiring & conduits', assignee: 'Electrician', days: 7 },
        { task: 'False ceiling frame installation', assignee: 'Site Team', days: 6 },
        { task: 'Waterproofing & tiling — wet areas', assignee: 'Tiler', days: 5 },
      ],
    },
    {
      phase: 'Fabrication',
      duration: Math.max(4, Math.round(rooms * 1.5)),
      tasks: [
        { task: `Wardrobe fabrication — ${rooms} units`, assignee: 'Factory', days: 18 },
        { task: 'TV unit & entertainment console', assignee: 'Factory', days: 10 },
        { task: 'Kitchen modular units', assignee: 'Factory', days: 14 },
        { task: 'Crockery unit & display shelves', assignee: 'Factory', days: 7 },
        { task: 'Upholstered furniture — fabric & foam', assignee: 'Factory', days: 12 },
        { task: 'Quality check & dispatch from factory', assignee: 'QC Team', days: 3 },
      ],
    },
    {
      phase: 'Execution',
      duration: Math.max(5, Math.round(areaNum / 250)),
      tasks: [
        { task: 'Flooring installation', assignee: 'Site Team', days: 8 },
        { task: 'Wall paint & texture application', assignee: 'Painter', days: 6 },
        { task: 'False ceiling finish & lighting fit', assignee: 'Site Team', days: 5 },
        { task: 'Furniture installation & placement', assignee: 'Site Team', days: 5 },
        { task: 'Kitchen installation & plumbing connect', assignee: 'Site Team', days: 4 },
        { task: 'Doors, hardware & accessories fit', assignee: 'Site Team', days: 3 },
        { task: 'Curtain & soft furnishings installation', assignee: 'Designer', days: 2 },
      ],
    },
    {
      phase: 'Final & Handover',
      duration: 2,
      tasks: [
        { task: 'Snagging & punch list walkthrough', assignee: 'Designer + Client', days: 2 },
        { task: 'Touch-ups & corrections', assignee: 'Site Team', days: 3 },
        { task: 'Deep cleaning & polishing', assignee: 'Housekeeping', days: 1 },
        { task: 'Final photography session', assignee: 'Photographer', days: 1 },
        { task: 'Client handover & keys', assignee: 'Designer', days: 1 },
      ],
    },
  ]

  let schedule = []
  let phaseStart = new Date(startDate)

  phases.forEach(p => {
    const pStart = new Date(phaseStart)
    let taskCursor = new Date(pStart)
    const taskList = p.tasks.map(t => {
      const start = taskCursor.toISOString().slice(0, 10)
      taskCursor.setDate(taskCursor.getDate() + t.days)
      return { ...t, start, end: taskCursor.toISOString().slice(0, 10), pct: 0, status: 'PENDING' }
    })
    const pEnd = new Date(taskCursor)
    schedule.push({ phase: p.phase, start: pStart.toISOString().slice(0, 10), end: pEnd.toISOString().slice(0, 10), tasks: taskList })
    phaseStart = new Date(taskCursor)
    phaseStart.setDate(phaseStart.getDate() + 2)
  })

  const totalWeeks = Math.round((phaseStart - startDate) / (7 * 86400000))
  return { schedule, totalWeeks, summary: `${rooms}BHK ${form.type} — ${form.area} sqft · Budget ₹${form.budget}L · ${form.city}` }
}

async function generateAISchedule(form) {
  if (!GEMINI) return buildDemoSchedule(form)

  const prompt = `You are an expert interior design project manager. Generate a detailed project schedule for:
- Property: ${form.type}, ${form.rooms} BHK / ${form.area} sqft
- Scope: ${form.scope}
- Budget: ₹${form.budget} Lakhs
- City: ${form.city}
- Special requirements: ${form.notes || 'None'}
- Start date: ${new Date().toISOString().slice(0,10)}

Return JSON with this structure:
{
  "totalWeeks": number,
  "summary": "one-line project summary",
  "schedule": [
    {
      "phase": "Phase Name",
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD",
      "tasks": [
        { "task": "Task name", "assignee": "Role", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "days": number, "pct": 0, "status": "PENDING" }
      ]
    }
  ]
}
Include 6 phases: Concept & Design, Procurement, Civil & Electrical, Fabrication, Execution, Final & Handover. 4-7 tasks per phase. Be realistic with timelines. No markdown.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI}`,
    { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{ role:'user', parts:[{ text: prompt }] }], generationConfig:{ temperature:0.4, maxOutputTokens:2048 } }) }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return JSON.parse(text.replace(/```json|```/g,'').trim())
}

// ── Gantt bar ─────────────────────────────────────────────────────
function GanttChart({ schedule }) {
  const allDates = schedule.flatMap(p => p.tasks.map(t => [new Date(t.start), new Date(t.end)])).flat()
  const minD = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxD = new Date(Math.max(...allDates.map(d => d.getTime())))
  const totalMs = maxD - minD

  function pct(d) { return ((new Date(d) - minD) / totalMs * 100).toFixed(1) }
  function width(s, e) { return ((new Date(e) - new Date(s)) / totalMs * 100).toFixed(1) }

  // Month labels
  const months = []
  let cur = new Date(minD.getFullYear(), minD.getMonth(), 1)
  while (cur <= maxD) {
    months.push({ label: cur.toLocaleDateString('en-IN', { month: 'short', year:'2-digit' }), pct: ((cur - minD) / totalMs * 100).toFixed(1) })
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  }

  const nowPct = ((new Date() - minD) / totalMs * 100).toFixed(1)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 700 }}>
        {/* Month axis */}
        <div style={{ marginLeft: 200, height: 24, position: 'relative', marginBottom: 4 }}>
          {months.map(m => (
            <div key={m.label} style={{ position: 'absolute', left: `${m.pct}%`, transform: 'translateX(-50%)' }}>
              <span style={{ ...sans, fontSize: 9, color: stone, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{m.label}</span>
            </div>
          ))}
        </div>

        {schedule.map(p => {
          const phaseColor = PHASE_COLORS[p.phase] || gold
          return (
            <div key={p.phase} style={{ marginBottom: 16 }}>
              <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: phaseColor, margin: '0 0 6px' }}>{p.phase}</p>
              {p.tasks.map(t => (
                <div key={t.task} style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 5 }}>
                  <div style={{ width: 200, flexShrink: 0, paddingRight: 10 }}>
                    <p style={{ ...sans, fontSize: 10, color: dark, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.task}</p>
                    <p style={{ ...sans, fontSize: 8.5, color: stone, margin: 0 }}>{t.assignee}</p>
                  </div>
                  <div style={{ flex: 1, height: 24, background: '#f5f4f2', position: 'relative' }}>
                    {/* Grid lines */}
                    {months.map(m => (
                      <div key={m.label} style={{ position: 'absolute', top: 0, bottom: 0, left: `${m.pct}%`, width: 1, background: bdr }} />
                    ))}
                    {/* Today */}
                    {nowPct > 0 && nowPct < 100 && (
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${nowPct}%`, width: 1, background: '#ef4444', zIndex: 2 }} />
                    )}
                    {/* Task bar */}
                    <div style={{ position: 'absolute', top: 3, bottom: 3, left: `${pct(t.start)}%`, width: `${width(t.start, t.end)}%`, background: t.pct === 100 ? phaseColor : `${phaseColor}50`, border: `1px solid ${phaseColor}`, zIndex: 1 }}>
                      <div style={{ height: '100%', width: `${t.pct}%`, background: phaseColor }} />
                    </div>
                  </div>
                  <div style={{ width: 30, textAlign: 'right', flexShrink: 0, paddingLeft: 6 }}>
                    <span style={{ ...sans, fontSize: 9, color: stone }}>{t.days}d</span>
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        <div style={{ display: 'flex', gap: 16, marginLeft: 200, marginTop: 8 }}>
          {Object.entries(PHASE_COLORS).slice(0,3).map(([ph,c]) => (
            <div key={ph} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <div style={{ width: 12, height: 8, background: c }} />
              <span style={{ ...sans, fontSize: 9, color: stone }}>{ph}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <div style={{ width: 1, height: 12, background: '#ef4444' }} />
            <span style={{ ...sans, fontSize: 9, color: stone }}>Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Task table ────────────────────────────────────────────────────
function TaskTable({ schedule, onUpdate }) {
  return (
    <div>
      {schedule.map(p => {
        const phaseColor = PHASE_COLORS[p.phase] || gold
        const done = p.tasks.filter(t => t.status === 'DONE').length
        return (
          <div key={p.phase} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: dark, borderLeft: `3px solid ${phaseColor}` }}>
              <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: phaseColor }}>{p.phase}</span>
              <span style={{ ...sans, fontSize: 10, color: '#78716c' }}>{done}/{p.tasks.length} tasks · {p.start} → {p.end}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${bdr}`, background: light }}>
                  {['Task','Assignee','Start','End','Days','Status'].map(h => (
                    <th key={h} style={{ ...sans, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone, padding: '8px 14px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.tasks.map((t, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${bdr}`, background: t.status === 'DONE' ? `${phaseColor}08` : '#fff' }}>
                    <td style={{ ...sans, fontSize: 12, color: dark, padding: '10px 14px', fontWeight: 500 }}>{t.task}</td>
                    <td style={{ ...sans, fontSize: 11, color: stone, padding: '10px 14px' }}>{t.assignee}</td>
                    <td style={{ ...sans, fontSize: 11, color: stone, padding: '10px 14px' }}>{new Date(t.start).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                    <td style={{ ...sans, fontSize: 11, color: stone, padding: '10px 14px' }}>{new Date(t.end).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                    <td style={{ ...sans, fontSize: 11, color: stone, padding: '10px 14px' }}>{t.days}d</td>
                    <td style={{ padding: '10px 14px' }}>
                      <select value={t.status} onChange={e => onUpdate(p.phase, i, e.target.value)}
                        style={{ ...sans, fontSize: 10, padding: '4px 8px', border: `1px solid ${bdr}`, background: '#fff', color: dark }}>
                        {['PENDING','IN_PROGRESS','DONE','BLOCKED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function AISchedulePage() {
  const [view,     setView]     = useState('form')  // form | gantt | table
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [form,     setForm]     = useState({
    type: 'Apartment', rooms: '3', area: '1200', scope: 'Full Interior',
    budget: '25', city: 'Hyderabad', notes: ''
  })

  async function generate() {
    setLoading(true)
    const r = await generateAISchedule(form).catch(() => buildDemoSchedule(form))
    setResult(r)
    setView('gantt')
    setLoading(false)
  }

  function updateTask(phase, taskIdx, status) {
    setResult(r => ({
      ...r,
      schedule: r.schedule.map(p => p.phase === phase
        ? { ...p, tasks: p.tasks.map((t, i) => i === taskIdx ? { ...t, status, pct: status === 'DONE' ? 100 : status === 'IN_PROGRESS' ? 50 : t.pct } : t) }
        : p)
    }))
  }

  function reset() { setResult(null); setView('form') }

  const F = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
  const Sel = ({ field, options }) => (
    <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{ ...sans, width: '100%', padding: '9px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, background: '#fff' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ minHeight: '100vh', background: light, ...sans }}>
      {/* Header */}
      <header style={{ height: 64, background: dark, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, borderBottom: '1px solid #292524', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ width: 28, height: 28, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none"/></svg>
        </div>
        <p style={{ ...serif, fontSize: 18, fontWeight: 300, color: '#fff', margin: 0 }}>AI <span style={{ color: gold }}>Schedule Builder</span></p>
        <div style={{ flex: 1 }} />
        {result && (
          <div style={{ display: 'flex', gap: 2 }}>
            {[['gantt','Gantt'],['table','Task List']].map(([id,label]) => (
              <button key={id} onClick={() => setView(id)}
                style={{ ...sans, padding: '6px 16px', background: view===id?gold:'transparent', border:`1px solid ${view===id?gold:'#57534e'}`, color:view===id?'#000':'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
                {label}
              </button>
            ))}
            <button onClick={reset} style={{ ...sans, padding:'6px 16px', background:'none', border:'1px solid #57534e', color:'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', marginLeft:8 }}>
              New Schedule
            </button>
          </div>
        )}
        <Link to="/dashboard" style={{ ...sans, fontSize: 10, color: '#78716c', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ padding: 32 }}>
        {/* Form */}
        {view === 'form' && (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <p style={{ ...serif, fontSize: 44, fontWeight: 300, color: dark, margin: '0 0 8px' }}>Generate Your Project Schedule</p>
            <p style={{ ...sans, fontSize: 13, color: stone, margin: '0 0 36px', lineHeight: 1.7 }}>
              Describe your project scope and our AI will generate a complete, phase-wise project schedule — ready to assign and track. {!GEMINI && <span style={{ color: gold }}>Running in demo mode.</span>}
            </p>

            <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <F label="Property Type"><Sel field="type" options={PROPERTY_TYPES} /></F>
                <F label="Configuration">
                  <select value={form.rooms} onChange={e => setForm(f => ({...f, rooms:e.target.value}))}
                    style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, background:'#fff' }}>
                    {['1','2','3','4','5','6+'].map(n=><option key={n} value={n}>{n} BHK / Rooms</option>)}
                  </select>
                </F>
                <F label="Total Area (sqft)">
                  <input type="number" value={form.area} onChange={e => setForm(f => ({...f, area:e.target.value}))} placeholder="e.g. 1200"
                    style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
                </F>
                <F label="Budget (₹ Lakhs)">
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({...f, budget:e.target.value}))} placeholder="e.g. 25"
                    style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
                </F>
                <F label="Scope of Work"><Sel field="scope" options={SCOPES} /></F>
                <F label="City"><Sel field="city" options={CITIES} /></F>
                <div style={{ gridColumn: '1/-1' }}>
                  <F label="Special Requirements / Notes">
                    <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} rows={3}
                      style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, resize:'vertical', boxSizing:'border-box', lineHeight:1.65 }}
                      placeholder="e.g. Client travelling — no site visits in July; festival gifting deadline by Diwali; imported marble lead time 8 weeks…" />
                  </F>
                </div>
              </div>
              <button onClick={generate} disabled={loading}
                style={{ ...sans, width:'100%', padding:'13px', background: gold, border:'none', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', marginTop:8 }}>
                {loading ? 'Generating Schedule…' : `✦ Generate AI Schedule →`}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ width:48, height:48, border:`2px solid ${bdr}`, borderTopColor:gold, borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 24px' }} />
            <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:'0 0 8px' }}>Building your schedule…</p>
            <p style={{ ...sans, fontSize:12, color:stone }}>AI is analysing scope, dependencies, and lead times</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Gantt */}
        {view === 'gantt' && result && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
              <div>
                <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 4px' }}>Project Schedule</p>
                <p style={{ ...sans, fontSize:11, color:stone, margin:0 }}>{result.summary}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ ...serif, fontSize:36, fontWeight:300, color:gold, margin:'0 0 2px' }}>{result.totalWeeks}<span style={{ fontSize:16, color:stone }}> weeks</span></p>
                <p style={{ ...sans, fontSize:9, color:stone, letterSpacing:'0.1em', textTransform:'uppercase' }}>Total duration</p>
              </div>
            </div>

            {/* Phase summary */}
            <div style={{ display:'flex', gap:10, marginBottom:24, overflowX:'auto', paddingBottom:4 }}>
              {result.schedule.map(p => {
                const c = PHASE_COLORS[p.phase] || gold
                return (
                  <div key={p.phase} style={{ minWidth:160, flex:1, background:'#fff', border:`1px solid ${bdr}`, borderTop:`3px solid ${c}`, padding:'14px 16px' }}>
                    <p style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:c, margin:'0 0 6px' }}>{p.phase}</p>
                    <p style={{ ...sans, fontSize:11, color:dark, margin:'0 0 2px' }}>{p.tasks.length} tasks</p>
                    <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{new Date(p.start).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} → {new Date(p.end).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
                  </div>
                )
              })}
            </div>

            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px' }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 16px' }}>Gantt Chart</p>
              <GanttChart schedule={result.schedule} />
            </div>
          </div>
        )}

        {/* Task list */}
        {view === 'table' && result && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:0 }}>Task List — {result.summary}</p>
              <span style={{ ...sans, fontSize:11, color:stone }}>{result.totalWeeks} weeks total</span>
            </div>
            <TaskTable schedule={result.schedule} onUpdate={updateTask} />
          </div>
        )}
      </div>
    </div>
  )
}
