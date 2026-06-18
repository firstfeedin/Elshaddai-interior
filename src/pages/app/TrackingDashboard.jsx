import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'
const _BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const API   = _BASE.replace('/api', '')

function api(path, opts = {}) {
  const token = localStorage.getItem('es_token')
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers }
  }).then(r => r.json())
}

// ── Shared UI ─────────────────────────────────────────────────────
function Tag({ children, gold: isGold }) {
  return (
    <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
      color: isGold ? gold : stone, border: `1px solid ${isGold ? gold : bdr}`, padding: '2px 8px' }}>
      {children}
    </span>
  )
}
function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: 20, ...style }}>{children}</div>
}
function SectionTitle({ children }) {
  return <p style={{ ...serif, fontSize: 22, fontWeight: 300, color: dark, margin: '0 0 18px' }}>{children}</p>
}
function StatBox({ label, value, sub, accent }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: '20px 24px', flex: 1 }}>
      <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 8px' }}>{label}</p>
      <p style={{ ...serif, fontSize: 34, fontWeight: 300, color: accent || dark, margin: '0 0 4px' }}>{value}</p>
      {sub && <p style={{ ...sans, fontSize: 10, color: '#a8a29e', margin: 0 }}>{sub}</p>}
    </div>
  )
}
function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 4, background: bdr, width: '100%' }}>
      <div style={{ height: 4, width: `${Math.min(pct, 100)}%`, background: color || gold, transition: 'width 0.4s' }} />
    </div>
  )
}
function PipelineStep({ label, done, active }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ width: 28, height: 28, background: done ? gold : active ? dark : '#fff',
        border: `1px solid ${done || active ? gold : bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {done ? <span style={{ color: '#000', fontSize: 13 }}>✓</span>
               : active ? <div style={{ width: 8, height: 8, background: gold }} />
               : null}
      </div>
      <span style={{ ...sans, fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: done ? gold : active ? dark : '#a8a29e', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </div>
  )
}
function PipelineRow({ steps, current }) {
  const idx = steps.indexOf(current)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center' }}>
          <PipelineStep label={s} done={i < idx} active={i === idx} />
          {i < steps.length - 1 && (
            <div style={{ position: 'absolute', top: 14, left: `${(i + 1) * (100 / steps.length)}%`, right: `${(steps.length - i - 2) * (100 / steps.length)}%`, height: 1, background: i < idx ? gold : bdr, zIndex: 0 }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Mock Data ─────────────────────────────────────────────────────
const PROJ_PIPELINE = ['CREATED','DESIGN','QUOTATION_APPROVED','PRODUCTION','MATERIALS_PROCURED','INSTALLATION','QC','COMPLETED']
const FACTORY_STAGES = ['DESIGN_APPROVED','CUTTING','ASSEMBLY','POLISHING','PACKING','DISPATCHED']

const MOCK_PROJECTS = [
  { id:'p1', name:'Nair Residence - 3BHK',     client_name:'Deepa Nair',    status:'INSTALLATION',       budget:1850000, city:'Hyderabad', created_at:'2026-04-02' },
  { id:'p2', name:'Kapoor Office - Fit-Out',   client_name:'Vinay Kapoor',  status:'QC',                 budget:3200000, city:'Secunderabad', created_at:'2026-03-15' },
  { id:'p3', name:'Sharma Villa - Luxury',     client_name:'Rahul Sharma',  status:'DESIGN',             budget:5600000, city:'Hyderabad', created_at:'2026-05-08' },
  { id:'p4', name:'Mehta Penthouse - Modern',  client_name:'Anil Mehta',    status:'CREATED',            budget:2800000, city:'Mumbai',    created_at:'2026-06-01' },
  { id:'p5', name:'Sundar Restaurant - Resto', client_name:'Sundar Rajan',  status:'MATERIALS_PROCURED', budget:1200000, city:'Hyderabad', created_at:'2026-04-20' },
]
const MOCK_ATTENDANCE = [
  { id:'a1', employee_name:'Kiran Sharma',     date:'2026-06-17', login_time:'08:30', logout_time:'18:00', status:'PRESENT', productivity_score:91 },
  { id:'a2', employee_name:'Lakshmi Iyer',     date:'2026-06-17', login_time:'09:00', logout_time:'18:30', status:'PRESENT', productivity_score:88 },
  { id:'a3', employee_name:'Mohammed Farook',  date:'2026-06-17', login_time:'08:15', logout_time:'17:45', status:'PRESENT', productivity_score:82 },
  { id:'a4', employee_name:'Priya Menon',      date:'2026-06-17', login_time:'09:30', logout_time:null,    status:'PRESENT', productivity_score:79 },
  { id:'a5', employee_name:'Suresh Pillai',    date:'2026-06-17', login_time:null,    logout_time:null,    status:'LEAVE',   productivity_score:null },
  { id:'a6', employee_name:'Anitha Raj',       date:'2026-06-17', login_time:'09:45', logout_time:null,    status:'LATE',    productivity_score:68 },
  { id:'a7', employee_name:'Ravi Kumar',       date:'2026-06-17', login_time:'08:50', logout_time:'18:00', status:'PRESENT', productivity_score:85 },
]
const MOCK_DESIGN_TASKS = [
  { id:'dt1', project_id:'p1', task_name:'Installation Supervision — Bedroom',  designer_name:'Kiran Sharma',  status:'IN_PROGRESS', revision_count:2, client_meetings:4, deadline:'2026-06-25', estimated_hrs:20, actual_hrs:14 },
  { id:'dt2', project_id:'p1', task_name:'Wardrobe Detail Drawing',             designer_name:'Kiran Sharma',  status:'COMPLETED',   revision_count:1, client_meetings:1, deadline:'2026-06-10', estimated_hrs:8,  actual_hrs:9  },
  { id:'dt3', project_id:'p2', task_name:'QC Phase 3 Punch List',               designer_name:'Lakshmi Iyer',  status:'REVIEW',      revision_count:0, client_meetings:2, deadline:'2026-06-20', estimated_hrs:12, actual_hrs:10 },
  { id:'dt4', project_id:'p3', task_name:'Concept Mood Board — Villa',          designer_name:'Lakshmi Iyer',  status:'IN_PROGRESS', revision_count:1, client_meetings:1, deadline:'2026-06-28', estimated_hrs:16, actual_hrs:6  },
  { id:'dt5', project_id:'p3', task_name:'3D Render — Living & Dining',         designer_name:'Kiran Sharma',  status:'PENDING',     revision_count:0, client_meetings:0, deadline:'2026-07-05', estimated_hrs:24, actual_hrs:0  },
  { id:'dt6', project_id:'p5', task_name:'Restaurant Layout Final Drawing',     designer_name:'Lakshmi Iyer',  status:'COMPLETED',   revision_count:3, client_meetings:3, deadline:'2026-06-01', estimated_hrs:18, actual_hrs:20 },
]
const MOCK_MATERIALS = [
  { id:'m1', name:'Teak Veneer Sheets',   category:'Wood',     quantity_ordered:200, quantity_available:22,  unit:'sqft',   unit_price:185,  vendor:'Rajesh Timbers',   status:'IN_WAREHOUSE', location:'Warehouse A — Bay 3' },
  { id:'m2', name:'Carrara Marble Tiles', category:'Flooring', quantity_ordered:420, quantity_available:420, unit:'sqft',   unit_price:145,  vendor:'Stone Imports',    status:'DELIVERED',    location:'Site — Kapoor Office' },
  { id:'m3', name:'Asian Paints Premium', category:'Paint',    quantity_ordered:32,  quantity_available:32,  unit:'ltr',    unit_price:380,  vendor:'National Paints',  status:'DELIVERED',    location:'Site — Nair Residence' },
  { id:'m4', name:'Hafele Sliding System',category:'Hardware', quantity_ordered:3,   quantity_available:0,   unit:'set',    unit_price:42000,vendor:'Local Workshop',   status:'ORDERED',      location:'Vendor — dispatch pending' },
  { id:'m5', name:'Marine Ply 18mm',      category:'Wood',     quantity_ordered:80,  quantity_available:80,  unit:'sheets', unit_price:1800, vendor:'Rajesh Timbers',   status:'IN_WAREHOUSE', location:'Warehouse A — Bay 1' },
  { id:'m6', name:'Granite Counter Slab', category:'Stone',    quantity_ordered:3,   quantity_available:0,   unit:'slabs',  unit_price:30667,vendor:'Stone Imports',    status:'IN_TRANSIT',   location:'In transit — ETA 20 Jun' },
]
const MOCK_POS = [
  { id:'po1', po_number:'PO-0041', vendor_name:'Rajesh Timbers',   total_amount:56640,  status:'DELIVERED',  expected_delivery:'2026-05-20', received_date:'2026-05-19', items:'[{"name":"Teak Veneer","qty":120}]' },
  { id:'po2', po_number:'PO-0043', vendor_name:'Stone Imports',    total_amount:159300, status:'IN_TRANSIT', expected_delivery:'2026-06-20', received_date:null,          items:'[{"name":"Carrara Marble","qty":420}]' },
  { id:'po3', po_number:'PO-0045', vendor_name:'SteelCraft Fab',   total_amount:80920,  status:'ORDERED',    expected_delivery:'2026-06-25', received_date:null,          items:'[{"name":"SS Railing 40 RFT","qty":1}]' },
  { id:'po4', po_number:'PO-0047', vendor_name:'Stone Imports',    total_amount:109340, status:'PENDING',    expected_delivery:'2026-06-01', received_date:null,          items:'[{"name":"Granite Counter","qty":3}]' },
]
const MOCK_FACTORY = [
  { id:'f1', job_number:'FAB-018', project_name:'Nair Residence — Wardrobe',     item_type:'Wardrobe',  stage:'POLISHING',  quality_check_passed:0, assigned_to:'Team A', notes:'Oak veneer — 2 door panels remaining' },
  { id:'f2', job_number:'FAB-019', project_name:'Nair Residence — TV Unit',      item_type:'TV Unit',   stage:'ASSEMBLY',   quality_check_passed:0, assigned_to:'Team B', notes:'Cable grommet & back panel pending' },
  { id:'f3', job_number:'FAB-020', project_name:'Kapoor Office — Workstations',  item_type:'Desk',      stage:'DISPATCHED', quality_check_passed:1, assigned_to:'Team A', notes:'8 units delivered to site 14 Jun' },
  { id:'f4', job_number:'FAB-021', project_name:'Sharma Villa — Kitchen',        item_type:'Kitchen',   stage:'CUTTING',    quality_check_passed:0, assigned_to:'Team C', notes:'Acrylic shutter cutting started' },
  { id:'f5', job_number:'FAB-022', project_name:'Sundar Restaurant — Bar Unit',  item_type:'Bar Counter',stage:'DESIGN_APPROVED',quality_check_passed:0,assigned_to:'Team B',notes:'Laminate samples approved by client' },
]
const MOCK_GPS = [
  { id:'g1', employee_name:'Mohammed Farook', latitude:13.0827, longitude:80.2707, activity:'WORKING',    timestamp:'2026-06-17T09:30:00Z' },
  { id:'g2', employee_name:'Ravi Kumar',      latitude:13.0650, longitude:80.2550, activity:'TRAVELLING', timestamp:'2026-06-17T10:15:00Z' },
  { id:'g3', employee_name:'Suresh Pillai',   latitude:13.0900, longitude:80.2800, activity:'ON_BREAK',   timestamp:'2026-06-17T10:00:00Z' },
  { id:'g4', employee_name:'Anitha Raj',      latitude:13.0780, longitude:80.2680, activity:'WORKING',    timestamp:'2026-06-17T09:45:00Z' },
]
const MOCK_TIMELINE = [
  { id:'tl1', project_name:'Nair Residence',  task:'Site Survey & Measurement',     owner:'Mohammed Farook', start:'2026-04-02', end:'2026-04-07', pct:100 },
  { id:'tl2', project_name:'Nair Residence',  task:'Concept Design & 3D',           owner:'Kiran Sharma',   start:'2026-04-08', end:'2026-04-30', pct:100 },
  { id:'tl3', project_name:'Nair Residence',  task:'Material Procurement',          owner:'Priya Menon',    start:'2026-04-25', end:'2026-05-20', pct:95  },
  { id:'tl4', project_name:'Nair Residence',  task:'Civil & Electrical Works',      owner:'Team A',         start:'2026-05-01', end:'2026-05-25', pct:100 },
  { id:'tl5', project_name:'Nair Residence',  task:'Furniture Fabrication',         owner:'Factory',        start:'2026-05-10', end:'2026-06-15', pct:80  },
  { id:'tl6', project_name:'Nair Residence',  task:'Site Installation',             owner:'Team B',         start:'2026-06-01', end:'2026-07-05', pct:45  },
  { id:'tl7', project_name:'Kapoor Office',   task:'Space Planning & Layout',       owner:'Lakshmi Iyer',   start:'2026-03-15', end:'2026-03-30', pct:100 },
  { id:'tl8', project_name:'Kapoor Office',   task:'Execution & Fit-Out',           owner:'Team C',         start:'2026-04-01', end:'2026-06-10', pct:100 },
  { id:'tl9', project_name:'Kapoor Office',   task:'QC & Snag Resolution',          owner:'Lakshmi Iyer',   start:'2026-06-10', end:'2026-06-25', pct:60  },
]
const MOCK_REPORTS = [
  { id:'r1', contractor_name:'Mohammed Farook', project_id:'p1', report_date:'2026-06-16', work_done:'Completed bedroom 2 wardrobe installation. Living room false ceiling 90% done. Painter started base coat on walls.', workers_count:7, issues:'Need 2 bags of POP material for ceiling joint finishing tomorrow.', photos_count:11 },
  { id:'r2', contractor_name:'Team C',          project_id:'p2', report_date:'2026-06-16', work_done:'QC punch list — 14 of 18 items cleared. 4 items pending client sign-off on touch-up paint.', workers_count:4, issues:'', photos_count:6 },
]
const MOCK_LOCATIONS = [
  { id:'l1', employee_name:'Mohammed Farook', latitude:13.0827, longitude:80.2707, activity:'ON_SITE',    timestamp:'2026-06-17T08:30:00Z' },
  { id:'l2', employee_name:'Ravi Kumar',      latitude:13.0650, longitude:80.2550, activity:'TRAVELLING', timestamp:'2026-06-17T09:10:00Z' },
]

const LIVE_ALERTS = [
  { level:'critical', msg:'PO-0047 overdue by 15 days — Granite Counter for Sundar Restaurant', time:'2h ago' },
  { level:'warning',  msg:'Teak Veneer stock at 22 sqft — below reorder point of 50 sqft', time:'4h ago' },
  { level:'warning',  msg:'Anitha Raj checked in 75 min late today', time:'9:45 AM' },
  { level:'info',     msg:'FAB-020 Kapoor Office Workstations dispatched — 8 units on site', time:'Yesterday' },
  { level:'info',     msg:'INV-0023 payment ₹2,78,000 received from Deepa Nair', time:'Yesterday' },
]

// ── STATUS STYLES ─────────────────────────────────────────────────
const STATUS_COLOR = {
  PRESENT:'#22c55e', LATE:'#f59e0b', LEAVE:'#64748b', ABSENT:'#ef4444',
  COMPLETED:'#22c55e', IN_PROGRESS:'#c9a227', PENDING:'#94a3b8', REVIEW:'#8b5cf6', BLOCKED:'#ef4444',
  DELIVERED:'#22c55e', IN_TRANSIT:'#f59e0b', IN_WAREHOUSE:'#3b82f6', ORDERED:'#94a3b8',
  DISPATCHED:'#22c55e', PACKING:'#c9a227', POLISHING:'#f59e0b', ASSEMBLY:'#3b82f6', CUTTING:'#94a3b8', DESIGN_APPROVED:'#6366f1',
  WORKING:'#22c55e', TRAVELLING:'#f59e0b', ON_BREAK:'#94a3b8', ON_SITE:'#c9a227',
}
function StatusChip({ s }) {
  const c = STATUS_COLOR[s] || stone
  return <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:c, border:`1px solid ${c}`, padding:'2px 8px', flexShrink:0 }}>{s.replace(/_/g,' ')}</span>
}

// ── TAB CONFIG ────────────────────────────────────────────────────
const TABS = [
  { id:'overview',   icon:'◈', label:'Overview' },
  { id:'projects',   icon:'⬡', label:'Projects' },
  { id:'employees',  icon:'◉', label:'Employees' },
  { id:'designers',  icon:'✦', label:'Designers' },
  { id:'pm',         icon:'▦', label:'Project Mgr' },
  { id:'contractor', icon:'⬚', label:'Contractor' },
  { id:'materials',  icon:'◧', label:'Materials' },
  { id:'factory',    icon:'◲', label:'Factory' },
  { id:'gps',        icon:'◎', label:'GPS' },
  { id:'timeline',   icon:'▤', label:'Timeline' },
]

// ── Overview Tab ──────────────────────────────────────────────────
const ALERT_COLOR = { critical:'#ef4444', warning:'#f59e0b', info: stone }
function OverviewTab() {
  const activeProjs   = MOCK_PROJECTS.filter(p => !['COMPLETED','CREATED'].includes(p.status)).length
  const onSiteToday   = MOCK_ATTENDANCE.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
  const pendingPOs    = MOCK_POS.filter(p => p.status !== 'DELIVERED').length
  const factoryActive = MOCK_FACTORY.filter(f => f.stage !== 'DISPATCHED').length
  const totalPortfolio = MOCK_PROJECTS.reduce((s, p) => s + p.budget, 0)
  const portfolioStr  = `₹${(totalPortfolio / 10000000).toFixed(2)} Cr`

  return (
    <div>
      <SectionTitle>Command Overview</SectionTitle>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:28 }}>
        <StatBox label="Active Projects"  value={activeProjs}   sub={`of ${MOCK_PROJECTS.length} total`} accent={gold} />
        <StatBox label="Staff On-Site"    value={onSiteToday}   sub={`${MOCK_ATTENDANCE.filter(a=>a.status==='LEAVE').length} on leave today`} />
        <StatBox label="Pending POs"      value={pendingPOs}    sub="awaiting delivery" />
        <StatBox label="Factory Active"   value={factoryActive} sub="jobs in production" />
        <StatBox label="Total Portfolio"  value={portfolioStr}  sub={`across ${MOCK_PROJECTS.length} projects`} accent={gold} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
        <Card>
          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Project Pipeline</p>
          {MOCK_PROJECTS.map(p => {
            const idx = PROJ_PIPELINE.indexOf(p.status)
            const pct = Math.round((idx / (PROJ_PIPELINE.length - 1)) * 100)
            return (
              <div key={p.id} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <span style={{ ...sans, fontSize:11, color:dark, fontWeight:500 }}>{p.name.split(' - ')[0]}</span>
                  <StatusChip s={p.status} />
                </div>
                <ProgressBar pct={pct} />
                <span style={{ ...sans, fontSize:9, color:stone, marginTop:3, display:'block' }}>{pct}% complete · {p.city}</span>
              </div>
            )
          })}
        </Card>

        <Card>
          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Today's Workforce</p>
          {MOCK_ATTENDANCE.map(a => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              <div style={{ width:30, height:30, background:dark, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ ...sans, fontSize:10, fontWeight:700, color:gold }}>{a.employee_name.split(' ').map(w=>w[0]).join('')}</span>
              </div>
              <div style={{ flex:1 }}>
                <span style={{ ...sans, fontSize:12, fontWeight:500, color:dark }}>{a.employee_name}</span>
                {a.login_time && <span style={{ ...sans, fontSize:10, color:stone, marginLeft:8 }}>In {a.login_time}</span>}
              </div>
              <StatusChip s={a.status} />
              {a.productivity_score && (
                <span style={{ ...sans, fontSize:11, fontWeight:700, color:a.productivity_score>=80?gold:stone }}>{a.productivity_score}%</span>
              )}
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Card>
          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Factory — Active Jobs</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {MOCK_FACTORY.map(f => (
              <div key={f.id} style={{ display:'flex', alignItems:'center', gap:12, border:`1px solid ${bdr}`, padding:12 }}>
                <div style={{ minWidth:36 }}>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, color:gold, margin:0, letterSpacing:'0.1em' }}>{f.job_number}</p>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ ...serif, fontSize:13, color:dark, margin:'0 0 2px' }}>{f.item_type}</p>
                  <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{f.project_name.split('—')[0].trim()}</p>
                </div>
                <StatusChip s={f.stage} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>
            Live Alerts
            <span style={{ marginLeft:8, background:'#ef4444', color:'#fff', fontSize:8, padding:'1px 6px', fontWeight:700 }}>
              {LIVE_ALERTS.filter(a=>a.level==='critical').length} CRITICAL
            </span>
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {LIVE_ALERTS.map((a, i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'10px 12px', border:`1px solid ${a.level==='critical'?'#ef4444':a.level==='warning'?'#f59e0b':bdr}`, background: a.level==='critical'?'#fef2f2':a.level==='warning'?'#fffbeb':'#fff' }}>
                <span style={{ fontSize:14, flexShrink:0 }}>
                  {a.level==='critical'?'🔴':a.level==='warning'?'🟡':'🔵'}
                </span>
                <div style={{ flex:1 }}>
                  <p style={{ ...sans, fontSize:11, color:dark, margin:'0 0 2px', lineHeight:1.4 }}>{a.msg}</p>
                  <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Projects Tab ──────────────────────────────────────────────────
function ProjectsTab() {
  const [selected, setSelected] = useState(MOCK_PROJECTS[0])
  const [log, setLog]           = useState([])
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes]       = useState('')
  const [saving, setSaving]     = useState(false)

  async function addStatus() {
    if (!newStatus) return
    setSaving(true)
    try {
      await api(`/api/tracking/project-timeline`, { method:'POST', body: JSON.stringify({ project_id: selected.id, status: newStatus, notes }) })
    } catch {}
    setLog(prev => [{ id:Date.now(), status:newStatus, notes, updated_by:'You', created_at:new Date().toISOString() }, ...prev])
    setNewStatus(''); setNotes(''); setSaving(false)
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
      {/* Project list */}
      <div>
        <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 10px' }}>All Projects</p>
        {MOCK_PROJECTS.map(p => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ padding:'12px 14px', border:`1px solid ${selected.id===p.id?gold:bdr}`, marginBottom:6, cursor:'pointer', background: selected.id===p.id?`${gold}08`:'#fff', transition:'all 0.15s' }}>
            <p style={{ ...serif, fontSize:14, color:dark, margin:'0 0 4px' }}>{p.name}</p>
            <p style={{ ...sans, fontSize:10, color:stone, margin:'0 0 6px' }}>{p.client_name} · {p.city}</p>
            <StatusChip s={p.status} />
          </div>
        ))}
      </div>

      {/* Project detail */}
      <div>
        <Card style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <p style={{ ...serif, fontSize:22, fontWeight:300, color:dark, margin:'0 0 4px' }}>{selected.name}</p>
              <p style={{ ...sans, fontSize:11, color:stone, margin:0 }}>{selected.client_name} · Budget: ₹{(selected.budget/100000).toFixed(1)}L · {selected.city}</p>
            </div>
            <StatusChip s={selected.status} />
          </div>
          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>8-Step Pipeline</p>
          <div style={{ display:'flex', position:'relative', paddingBottom:4 }}>
            {PROJ_PIPELINE.map((s, i) => {
              const idx = PROJ_PIPELINE.indexOf(selected.status)
              return (
                <div key={s} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, position:'relative' }}>
                  {i > 0 && <div style={{ position:'absolute', top:13, right:'50%', left:'-50%', height:1, background: i<=idx?gold:bdr, zIndex:0 }} />}
                  <div style={{ width:26, height:26, background: i<idx?gold:i===idx?dark:'#fff', border:`1px solid ${i<=idx?gold:bdr}`, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, flexShrink:0 }}>
                    {i<idx ? <span style={{ color:'#000', fontSize:11 }}>✓</span> : i===idx ? <div style={{ width:7, height:7, background:gold }} /> : null}
                  </div>
                  <span style={{ ...sans, fontSize:7.5, letterSpacing:'0.06em', textTransform:'uppercase', color:i<=idx?gold:'#a8a29e', textAlign:'center', lineHeight:1.3 }}>{s.replace(/_/g,'\n')}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Update Status</p>
          <div style={{ display:'flex', gap:10, marginBottom:10 }}>
            <select value={newStatus} onChange={e=>setNewStatus(e.target.value)}
              style={{ ...sans, flex:1, padding:'8px 12px', border:`1px solid ${bdr}`, background:'#fff', fontSize:12, color:dark }}>
              <option value="">— Select next status —</option>
              {PROJ_PIPELINE.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
            <button onClick={addStatus} disabled={saving} style={{ ...sans, padding:'8px 20px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
              {saving?'Saving…':'Update'}
            </button>
          </div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes / reason…"
            style={{ ...sans, width:'100%', padding:'8px 12px', border:`1px solid ${bdr}`, resize:'vertical', fontSize:12, color:dark, minHeight:60, boxSizing:'border-box' }} />

          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'18px 0 10px' }}>Status History</p>
          {[...log, { id:'seed1', status:'INSTALLATION', notes:'Site team deployed, installation started', updated_by:'Ravi Mohan', created_at:'2025-06-10T08:30:00Z' }].map(l => (
            <div key={l.id} style={{ display:'flex', gap:12, paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${bdr}` }}>
              <div style={{ width:2, background:gold, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:4 }}>
                  <StatusChip s={l.status} />
                  <span style={{ ...sans, fontSize:10, color:'#a8a29e' }}>{new Date(l.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                  <span style={{ ...sans, fontSize:10, color:stone }}>— {l.updated_by}</span>
                </div>
                {l.notes && <p style={{ ...sans, fontSize:11, color:stone, margin:0 }}>{l.notes}</p>}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ── Employees Tab ─────────────────────────────────────────────────
function EmployeesTab() {
  const [att, setAtt] = useState(MOCK_ATTENDANCE)

  return (
    <div>
      <SectionTitle>Employee Tracking</SectionTitle>

      {/* KPIs */}
      <div style={{ display:'flex', gap:14, marginBottom:24 }}>
        <StatBox label="Present Today"  value={att.filter(a=>a.status==='PRESENT').length} accent={gold} />
        <StatBox label="Late"           value={att.filter(a=>a.status==='LATE').length} />
        <StatBox label="On Leave"       value={att.filter(a=>a.status==='LEAVE').length} />
        <StatBox label="Avg Productivity" value={Math.round(att.filter(a=>a.productivity_score).reduce((s,a)=>s+a.productivity_score,0)/att.filter(a=>a.productivity_score).length)+'%'} accent={gold} />
      </div>

      <Card>
        <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Today — {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${dark}` }}>
              {['Employee','Check-In','Check-Out','Hours','Status','Productivity','Task'].map(h => (
                <th key={h} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, padding:'0 0 10px', textAlign:'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {att.map(a => {
              const hrs = a.login_time && a.logout_time
                ? ((new Date(`2025-06-14T${a.logout_time}`)-new Date(`2025-06-14T${a.login_time}`))/3600000).toFixed(1)
                : a.login_time ? '—' : '—'
              return (
                <tr key={a.id} style={{ borderBottom:`1px solid ${bdr}` }}>
                  <td style={{ padding:'12px 0' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:28, height:28, background:dark, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ ...sans, fontSize:9, fontWeight:700, color:gold }}>{a.employee_name.split(' ').map(w=>w[0]).join('')}</span>
                      </div>
                      <span style={{ ...sans, fontSize:12, fontWeight:500, color:dark }}>{a.employee_name}</span>
                    </div>
                  </td>
                  <td style={{ ...sans, fontSize:12, color:dark, padding:'12px 12px 12px 0' }}>{a.login_time || '—'}</td>
                  <td style={{ ...sans, fontSize:12, color:dark, padding:'12px 12px 12px 0' }}>{a.logout_time || '—'}</td>
                  <td style={{ ...sans, fontSize:12, color:dark, padding:'12px 12px 12px 0' }}>{hrs} hrs</td>
                  <td style={{ padding:'12px 12px 12px 0' }}><StatusChip s={a.status} /></td>
                  <td style={{ padding:'12px 12px 12px 0' }}>
                    {a.productivity_score ? (
                      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:80 }}>
                        <ProgressBar pct={a.productivity_score} color={a.productivity_score>=80?gold:stone} />
                        <span style={{ ...sans, fontSize:11, fontWeight:700, color:a.productivity_score>=80?gold:stone, flexShrink:0 }}>{a.productivity_score}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ ...sans, fontSize:11, color:stone, padding:'12px 0' }}>Site Work</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ── Designer Tab ──────────────────────────────────────────────────
function DesignersTab() {
  const [tasks, setTasks] = useState(MOCK_DESIGN_TASKS)

  async function updateStatus(id, status) {
    try { await api(`/api/tracking/design-tasks/${id}`, { method:'PATCH', body: JSON.stringify({ status }) }) } catch {}
    setTasks(t => t.map(x => x.id===id ? { ...x, status } : x))
  }

  const designers = [...new Set(tasks.map(t=>t.designer_name))]

  return (
    <div>
      <SectionTitle>Designer Monitor</SectionTitle>

      <div style={{ display:'flex', gap:14, marginBottom:24 }}>
        <StatBox label="Active Designers" value={designers.length} />
        <StatBox label="In Progress"      value={tasks.filter(t=>t.status==='IN_PROGRESS').length} accent={gold} />
        <StatBox label="Pending Review"   value={tasks.filter(t=>t.status==='REVIEW').length} />
        <StatBox label="Completed"        value={tasks.filter(t=>t.status==='COMPLETED').length} />
      </div>

      {designers.map(d => {
        const dTasks = tasks.filter(t => t.designer_name === d)
        const totalRevisions = dTasks.reduce((s,t)=>s+t.revision_count,0)
        const totalMeetings  = dTasks.reduce((s,t)=>s+t.client_meetings,0)
        return (
          <Card key={d} style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, background:dark, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ ...sans, fontSize:12, fontWeight:700, color:gold }}>{d.split(' ').map(w=>w[0]).join('')}</span>
                </div>
                <div>
                  <p style={{ ...serif, fontSize:18, fontWeight:300, color:dark, margin:'0 0 2px' }}>{d}</p>
                  <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{dTasks.length} projects · {totalRevisions} revisions · {totalMeetings} client meetings</p>
                </div>
              </div>
              <Tag gold>Active</Tag>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${dark}` }}>
                  {['Task','Project','Deadline','Est.Hrs','Act.Hrs','Revisions','Status','Action'].map(h => (
                    <th key={h} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:stone, padding:'0 8px 8px 0', textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dTasks.map(t => (
                  <tr key={t.id} style={{ borderBottom:`1px solid ${bdr}` }}>
                    <td style={{ ...sans, fontSize:12, color:dark, fontWeight:500, padding:'10px 8px 10px 0' }}>{t.task_name}</td>
                    <td style={{ ...sans, fontSize:11, color:stone, padding:'10px 8px 10px 0' }}>{MOCK_PROJECTS.find(p=>p.id===t.project_id)?.name.split(' - ')[0]}</td>
                    <td style={{ ...sans, fontSize:11, color: new Date(t.deadline)<new Date()?'#ef4444':dark, padding:'10px 8px 10px 0' }}>{new Date(t.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                    <td style={{ ...sans, fontSize:11, color:stone, padding:'10px 8px 10px 0' }}>{t.estimated_hrs}h</td>
                    <td style={{ ...sans, fontSize:11, color: t.actual_hrs>t.estimated_hrs?'#ef4444':dark, padding:'10px 8px 10px 0' }}>{t.actual_hrs}h</td>
                    <td style={{ ...sans, fontSize:11, color:stone, padding:'10px 8px 10px 0' }}>{t.revision_count}</td>
                    <td style={{ padding:'10px 8px 10px 0' }}><StatusChip s={t.status} /></td>
                    <td style={{ padding:'10px 0' }}>
                      <select value={t.status} onChange={e=>updateStatus(t.id,e.target.value)}
                        style={{ ...sans, fontSize:10, padding:'4px 8px', border:`1px solid ${bdr}`, background:'#fff', color:dark }}>
                        {['PENDING','IN_PROGRESS','REVIEW','COMPLETED','BLOCKED'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      })}
    </div>
  )
}

// ── Project Manager Tab ───────────────────────────────────────────
function PMTab() {
  const PM_DATA = MOCK_PROJECTS.map(p => ({
    ...p,
    budget_used: Math.round(p.budget * (0.4 + Math.random() * 0.4)),
    timeline_start: p.created_at,
    timeline_end: new Date(new Date(p.created_at).getTime() + 180 * 86400000).toISOString().slice(0,10),
    vendor_count: Math.floor(Math.random()*4)+2,
    issues_open: Math.floor(Math.random()*4),
    delay_days: Math.floor(Math.random()*12),
  }))

  return (
    <div>
      <SectionTitle>Project Manager Dashboard</SectionTitle>

      <div style={{ display:'flex', gap:14, marginBottom:24 }}>
        <StatBox label="Budget Utilised" value="₹68.4L"  sub="of ₹1.17 Cr" accent={gold} />
        <StatBox label="Avg Delay"       value="8 days"  sub="across active projects" />
        <StatBox label="Open Issues"     value="7"       sub="pending resolution" />
        <StatBox label="Active Vendors"  value="14"      sub="across all projects" />
      </div>

      {PM_DATA.map(p => {
        const budgetPct = Math.round((p.budget_used / p.budget) * 100)
        const start = new Date(p.timeline_start)
        const end   = new Date(p.timeline_end)
        const now   = new Date()
        const totalDays = (end - start) / 86400000
        const elapsedDays = Math.min((now - start) / 86400000, totalDays)
        const timelinePct = Math.round((elapsedDays / totalDays) * 100)

        return (
          <Card key={p.id} style={{ marginBottom:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:20 }}>
              <div>
                <p style={{ ...serif, fontSize:16, fontWeight:300, color:dark, margin:'0 0 4px' }}>{p.name}</p>
                <p style={{ ...sans, fontSize:10, color:stone, margin:'0 0 10px' }}>{p.client_name} · {p.city}</p>
                <StatusChip s={p.status} />
              </div>
              <div>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Budget</p>
                <p style={{ ...serif, fontSize:18, color:dark, margin:'0 0 4px' }}>₹{(p.budget_used/100000).toFixed(1)}L <span style={{ fontSize:12, color:stone }}>/ ₹{(p.budget/100000).toFixed(1)}L</span></p>
                <ProgressBar pct={budgetPct} color={budgetPct>85?'#ef4444':gold} />
                <span style={{ ...sans, fontSize:9, color:stone }}>{budgetPct}% used</span>
              </div>
              <div>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Timeline</p>
                <p style={{ ...sans, fontSize:11, color:dark, margin:'0 0 4px' }}>{new Date(p.timeline_start).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} → {new Date(p.timeline_end).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
                <ProgressBar pct={timelinePct} />
                <span style={{ ...sans, fontSize:9, color:p.delay_days>0?'#ef4444':stone }}>{p.delay_days>0?`${p.delay_days}d delay`:'On track'}</span>
              </div>
              <div>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Site Status</p>
                <p style={{ ...sans, fontSize:12, color:dark, margin:'0 0 4px' }}>{p.vendor_count} vendors active</p>
                <p style={{ ...sans, fontSize:11, color:p.issues_open>2?'#ef4444':stone, margin:0 }}>{p.issues_open} open issues</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ── Contractor Tab ────────────────────────────────────────────────
function ContractorTab() {
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [form, setForm] = useState({ project_id:'p1', work_done:'', workers_count:4, issues:'', photos_count:0 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function submitReport() {
    setSaving(true)
    try {
      await api('/api/tracking/daily-reports', { method:'POST', body: JSON.stringify({ ...form, contractor_name:'Site Team', report_date: new Date().toISOString().slice(0,10) }) })
    } catch {}
    setReports(prev => [{ id:Date.now(), contractor_name:'Site Team', ...form, report_date:new Date().toISOString().slice(0,10) }, ...prev])
    setForm({ project_id:'p1', work_done:'', workers_count:4, issues:'', photos_count:0 })
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),3000)
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20 }}>
      <div>
        <SectionTitle>Contractor Reports</SectionTitle>
        {reports.map(r => {
          const proj = MOCK_PROJECTS.find(p=>p.id===r.project_id)
          return (
            <Card key={r.id} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <p style={{ ...serif, fontSize:16, fontWeight:300, color:dark, margin:'0 0 2px' }}>{proj?.name || 'Project'}</p>
                  <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{r.contractor_name} · {new Date(r.report_date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long'})}</p>
                </div>
                <Tag gold>{r.workers_count} workers</Tag>
              </div>
              <p style={{ ...sans, fontSize:12, color:dark, margin:'0 0 10px', lineHeight:1.6 }}>{r.work_done}</p>
              {r.issues && (
                <div style={{ background:`${gold}08`, border:`1px solid ${gold}30`, padding:'8px 12px' }}>
                  <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold }}>Issue: </span>
                  <span style={{ ...sans, fontSize:11, color:dark }}>{r.issues}</span>
                </div>
              )}
              {r.photos_count > 0 && <p style={{ ...sans, fontSize:10, color:stone, margin:'8px 0 0' }}>📷 {r.photos_count} photos attached</p>}
            </Card>
          )
        })}
      </div>

      <div>
        <Card>
          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 16px' }}>Submit Daily Report</p>
          <div style={{ marginBottom:12 }}>
            <label style={{ ...sans, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>Project</label>
            <select value={form.project_id} onChange={e=>setForm(f=>({...f,project_id:e.target.value}))}
              style={{ ...sans, width:'100%', padding:'8px 12px', border:`1px solid ${bdr}`, background:'#fff', fontSize:12, color:dark }}>
              {MOCK_PROJECTS.map(p=><option key={p.id} value={p.id}>{p.name.split(' - ')[0]}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ ...sans, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>Work Done Today</label>
            <textarea value={form.work_done} onChange={e=>setForm(f=>({...f,work_done:e.target.value}))} rows={4}
              style={{ ...sans, width:'100%', padding:'8px 12px', border:`1px solid ${bdr}`, resize:'vertical', fontSize:12, color:dark, boxSizing:'border-box' }}
              placeholder="Describe today's completed work…" />
          </div>
          <div style={{ display:'flex', gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <label style={{ ...sans, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>Workers</label>
              <input type="number" value={form.workers_count} onChange={e=>setForm(f=>({...f,workers_count:+e.target.value}))}
                style={{ ...sans, width:'100%', padding:'8px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ ...sans, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>Photos</label>
              <input type="number" value={form.photos_count} onChange={e=>setForm(f=>({...f,photos_count:+e.target.value}))}
                style={{ ...sans, width:'100%', padding:'8px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ ...sans, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>Issues / Blockers</label>
            <textarea value={form.issues} onChange={e=>setForm(f=>({...f,issues:e.target.value}))} rows={2}
              style={{ ...sans, width:'100%', padding:'8px 12px', border:`1px solid ${bdr}`, resize:'vertical', fontSize:12, color:dark, boxSizing:'border-box' }}
              placeholder="Any material delays, safety concerns, or blockers…" />
          </div>
          <button onClick={submitReport} disabled={saving || !form.work_done}
            style={{ ...sans, width:'100%', padding:'11px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
            {saved ? '✓ Submitted' : saving ? 'Submitting…' : 'Submit Report'}
          </button>
        </Card>
      </div>
    </div>
  )
}

// ── Materials Tab ─────────────────────────────────────────────────
function MaterialsTab() {
  const [materials, setMaterials] = useState(MOCK_MATERIALS)
  const [pos, setPOs] = useState(MOCK_POS)

  const MAT_STATUS_FLOW = ['PENDING','ORDERED','IN_TRANSIT','IN_WAREHOUSE','DELIVERED']

  async function updateMatStatus(id, status) {
    try { await api(`/api/tracking/materials/${id}`, { method:'PATCH', body: JSON.stringify({ status }) }) } catch {}
    setMaterials(m => m.map(x => x.id===id ? { ...x, status } : x))
  }

  return (
    <div>
      <SectionTitle>Material Flow Tracker</SectionTitle>

      <div style={{ display:'flex', gap:14, marginBottom:24 }}>
        <StatBox label="Total Items"   value={materials.length} />
        <StatBox label="At Warehouse"  value={materials.filter(m=>m.status==='IN_WAREHOUSE').length} accent={gold} />
        <StatBox label="In Transit"    value={materials.filter(m=>m.status==='IN_TRANSIT').length} />
        <StatBox label="Pending Order" value={materials.filter(m=>['PENDING','ORDERED'].includes(m.status)).length} />
      </div>

      {/* Flow diagram */}
      <Card style={{ marginBottom:20 }}>
        <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 16px' }}>Procurement Flow</p>
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          {['PO Raised','Vendor Confirmed','Dispatched','In Transit','Warehouse','On Site'].map((s, i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', flex:1 }}>
              <div style={{ flex:1, padding:'10px 0', textAlign:'center', background: i<4?`${gold}10`:'#fff', border:`1px solid ${i<3?gold:bdr}`, borderRight:'none' }}>
                <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: i<4?gold:stone }}>{s}</span>
              </div>
              {i < 5 && <div style={{ width:0, height:0, borderTop:'16px solid transparent', borderBottom:'16px solid transparent', borderLeft:`10px solid ${i<3?gold:bdr}`, flexShrink:0 }} />}
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom:20 }}>
        <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Material Inventory</p>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${dark}` }}>
              {['Material','Category','Ordered','Available','Unit Price','Vendor','Location','Status','Update'].map(h => (
                <th key={h} style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, padding:'0 6px 10px 0', textAlign:'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.id} style={{ borderBottom:`1px solid ${bdr}` }}>
                <td style={{ ...sans, fontSize:12, color:dark, fontWeight:500, padding:'10px 6px 10px 0' }}>{m.name}</td>
                <td style={{ padding:'10px 6px 10px 0' }}><Tag>{m.category}</Tag></td>
                <td style={{ ...sans, fontSize:11, color:stone, padding:'10px 6px 10px 0' }}>{m.quantity_ordered} {m.unit}</td>
                <td style={{ ...sans, fontSize:11, color: m.quantity_available<10?'#ef4444':dark, padding:'10px 6px 10px 0', fontWeight: m.quantity_available<10?700:400 }}>{m.quantity_available} {m.unit}</td>
                <td style={{ ...sans, fontSize:11, color:dark, padding:'10px 6px 10px 0' }}>₹{m.unit_price.toLocaleString('en-IN')}</td>
                <td style={{ ...sans, fontSize:11, color:stone, padding:'10px 6px 10px 0' }}>{m.vendor}</td>
                <td style={{ ...sans, fontSize:10, color:stone, padding:'10px 6px 10px 0', maxWidth:120 }}>{m.location}</td>
                <td style={{ padding:'10px 6px 10px 0' }}><StatusChip s={m.status} /></td>
                <td style={{ padding:'10px 0' }}>
                  <select value={m.status} onChange={e=>updateMatStatus(m.id,e.target.value)}
                    style={{ ...sans, fontSize:10, padding:'3px 6px', border:`1px solid ${bdr}`, background:'#fff', color:dark }}>
                    {MAT_STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Purchase Orders</p>
        {pos.map(po => {
          const items = JSON.parse(po.items || '[]')
          return (
            <div key={po.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 0', borderBottom:`1px solid ${bdr}` }}>
              <div style={{ width:2, height:40, background: po.status==='DELIVERED'?gold:po.status==='IN_TRANSIT'?'#f59e0b':bdr, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:4 }}>
                  <span style={{ ...sans, fontSize:11, fontWeight:700, color:dark }}>{po.po_number}</span>
                  <StatusChip s={po.status} />
                </div>
                <p style={{ ...sans, fontSize:11, color:stone, margin:0 }}>{po.vendor_name} · {items.map(i=>i.name).join(', ')}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ ...serif, fontSize:16, color:dark, margin:'0 0 2px' }}>₹{po.total_amount.toLocaleString('en-IN')}</p>
                <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>Expected: {new Date(po.expected_delivery).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

// ── Factory Tab ───────────────────────────────────────────────────
function FactoryTab() {
  const [jobs, setJobs] = useState(MOCK_FACTORY)

  async function advanceStage(id) {
    const job  = jobs.find(j=>j.id===id)
    const idx  = FACTORY_STAGES.indexOf(job.stage)
    if (idx >= FACTORY_STAGES.length-1) return
    const next = FACTORY_STAGES[idx+1]
    try { await api(`/api/tracking/factory-jobs/${id}`, { method:'PATCH', body: JSON.stringify({ stage:next }) }) } catch {}
    setJobs(j => j.map(x => x.id===id ? { ...x, stage:next } : x))
  }

  const byStage = {}
  FACTORY_STAGES.forEach(s => { byStage[s] = jobs.filter(j=>j.stage===s) })

  return (
    <div>
      <SectionTitle>Factory Production Pipeline</SectionTitle>

      <div style={{ display:'flex', gap:14, marginBottom:24 }}>
        {FACTORY_STAGES.map(s => (
          <div key={s} style={{ flex:1, background:'#fff', border:`1px solid ${byStage[s].length>0?gold:bdr}`, padding:'14px 16px', textAlign:'center' }}>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:byStage[s].length>0?gold:stone, margin:'0 0 6px' }}>{s.replace(/_/g,' ')}</p>
            <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:0 }}>{byStage[s].length}</p>
          </div>
        ))}
      </div>

      {/* Pipeline view */}
      {jobs.map(job => {
        const stageIdx = FACTORY_STAGES.indexOf(job.stage)
        const pct = Math.round((stageIdx / (FACTORY_STAGES.length-1)) * 100)
        return (
          <Card key={job.id} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:stone }}>{job.job_number}</span>
                <p style={{ ...serif, fontSize:18, fontWeight:300, color:dark, margin:'2px 0 2px' }}>{job.project_name}</p>
                <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{job.item_type} · {job.assigned_to}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {job.quality_check_passed ? <Tag gold>QC Passed</Tag> : null}
                <button onClick={()=>advanceStage(job.id)} disabled={job.stage==='DISPATCHED'}
                  style={{ ...sans, padding:'6px 16px', background: job.stage==='DISPATCHED'?light:gold, border:`1px solid ${job.stage==='DISPATCHED'?bdr:gold}`, color: job.stage==='DISPATCHED'?stone:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor: job.stage==='DISPATCHED'?'default':'pointer' }}>
                  {job.stage==='DISPATCHED'?'Dispatched':'→ Advance'}
                </button>
              </div>
            </div>

            {/* Stage pipeline */}
            <div style={{ display:'flex', alignItems:'center', position:'relative', marginBottom:12 }}>
              {FACTORY_STAGES.map((s, i) => (
                <div key={s} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                  {i > 0 && <div style={{ position:'absolute', top:11, left:`${(i)*16.67}%`, width:'16.67%', height:1, background: i<=stageIdx?gold:bdr, zIndex:0 }} />}
                  <div style={{ width:22, height:22, background: i<stageIdx?gold:i===stageIdx?dark:'#fff', border:`1px solid ${i<=stageIdx?gold:bdr}`, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, flexShrink:0 }}>
                    {i<stageIdx ? <span style={{ color:'#000', fontSize:10 }}>✓</span> : i===stageIdx ? <div style={{ width:6, height:6, background:gold }} /> : null}
                  </div>
                  <span style={{ ...sans, fontSize:7, letterSpacing:'0.06em', textTransform:'uppercase', color:i<=stageIdx?gold:'#a8a29e', textAlign:'center', lineHeight:1.2 }}>{s.replace(/_/g,'\n')}</span>
                </div>
              ))}
            </div>

            <ProgressBar pct={pct} />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
              <span style={{ ...sans, fontSize:10, color:stone }}>{job.notes}</span>
              <span style={{ ...sans, fontSize:10, color:gold, fontWeight:700 }}>{pct}% complete</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ── GPS Tab ───────────────────────────────────────────────────────
function GPSTab() {
  const [locs, setLocs] = useState(MOCK_GPS)

  // SVG map — Hyderabad area, approximate
  const MAP_W = 600; const MAP_H = 380
  const LAT_MIN = 13.04; const LAT_MAX = 13.12
  const LNG_MIN = 80.22; const LNG_MAX = 80.32

  function toXY(lat, lng) {
    const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * MAP_W
    const y = MAP_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * MAP_H
    return { x, y }
  }

  const ACTIVITY_COLOR = { WORKING:'#22c55e', TRAVELLING:'#f59e0b', ON_BREAK:'#94a3b8', ON_SITE:'#c9a227' }

  return (
    <div>
      <SectionTitle>GPS Tracking — Live Locations</SectionTitle>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <Card style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${bdr}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone }}>Hyderabad — Field Tracking</span>
            <div style={{ display:'flex', gap:12 }}>
              {Object.entries(ACTIVITY_COLOR).map(([k,c]) => (
                <div key={k} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:8, height:8, background:c }} />
                  <span style={{ ...sans, fontSize:9, color:stone, textTransform:'uppercase', letterSpacing:'0.1em' }}>{k.replace('_',' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SVG map */}
          <svg width="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ display:'block', background:'#f0ede8' }}>
            {/* Grid lines */}
            {[0,1,2,3,4].map(i => (
              <line key={`h${i}`} x1={0} y1={i*(MAP_H/4)} x2={MAP_W} y2={i*(MAP_H/4)} stroke={bdr} strokeWidth={0.5} />
            ))}
            {[0,1,2,3,4,5].map(i => (
              <line key={`v${i}`} x1={i*(MAP_W/5)} y1={0} x2={i*(MAP_W/5)} y2={MAP_H} stroke={bdr} strokeWidth={0.5} />
            ))}
            {/* Road outlines */}
            <line x1={0} y1={MAP_H*0.5} x2={MAP_W} y2={MAP_H*0.5} stroke="#d6c89a" strokeWidth={4} strokeOpacity={0.6} />
            <line x1={MAP_W*0.4} y1={0} x2={MAP_W*0.4} y2={MAP_H} stroke="#d6c89a" strokeWidth={4} strokeOpacity={0.6} />
            <line x1={MAP_W*0.65} y1={0} x2={MAP_W*0.55} y2={MAP_H} stroke="#d6c89a" strokeWidth={2.5} strokeOpacity={0.5} />
            {/* Location pins */}
            {locs.map(loc => {
              const { x, y } = toXY(loc.latitude, loc.longitude)
              const c = ACTIVITY_COLOR[loc.activity] || stone
              return (
                <g key={loc.id}>
                  <circle cx={x} cy={y} r={14} fill={dark} fillOpacity={0.85} stroke={c} strokeWidth={2} />
                  <text x={x} y={y+4} textAnchor="middle" style={{ fontSize:9, fontWeight:700, fill:c }}>{loc.employee_name.split(' ').map(w=>w[0]).join('')}</text>
                  <circle cx={x} cy={y} r={22} fill={c} fillOpacity={0.12} />
                </g>
              )
            })}
            {/* Labels */}
            <text x={12} y={20} style={{ fontSize:10, fill:stone, fontFamily:'DM Sans, sans-serif', letterSpacing:'0.1em' }}>CHENNAI FIELD MAP</text>
          </svg>
        </Card>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>Field Personnel</p>
          {locs.map(loc => {
            const c = ACTIVITY_COLOR[loc.activity] || stone
            return (
              <Card key={loc.id} style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                  <div style={{ width:32, height:32, background:dark, border:`2px solid ${c}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ ...sans, fontSize:10, fontWeight:700, color:c }}>{loc.employee_name.split(' ').map(w=>w[0]).join('')}</span>
                  </div>
                  <div>
                    <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 2px' }}>{loc.employee_name}</p>
                    <StatusChip s={loc.activity} />
                  </div>
                </div>
                <p style={{ ...sans, fontSize:10, color:stone, margin:'0 0 4px' }}>Lat: {loc.latitude.toFixed(4)}, Lng: {loc.longitude.toFixed(4)}</p>
                <p style={{ ...sans, fontSize:10, color:'#a8a29e', margin:0 }}>Updated: {new Date(loc.timestamp).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Timeline Tab ──────────────────────────────────────────────────
function TimelineTab() {
  const dates = MOCK_TIMELINE.map(t => [new Date(t.start), new Date(t.end)]).flat()
  const minDate = new Date(Math.min(...dates.map(d=>d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d=>d.getTime())))
  const totalMs = maxDate - minDate

  function barLeft(start) { return ((new Date(start)-minDate)/totalMs*100).toFixed(2) }
  function barWidth(start, end) { return (((new Date(end)-new Date(start))/totalMs)*100).toFixed(2) }

  const projects = [...new Set(MOCK_TIMELINE.map(t=>t.project_name))]
  const now = new Date()
  const nowPct = ((now-minDate)/totalMs*100).toFixed(2)

  // Month labels
  const months = []
  let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  while (cur <= maxDate) {
    months.push({ date: new Date(cur), pct: ((cur-minDate)/totalMs*100).toFixed(2) })
    cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1)
  }

  return (
    <div>
      <SectionTitle>Project Timeline — Gantt View</SectionTitle>

      <Card style={{ padding:'20px 20px 24px', overflowX:'auto' }}>
        <div style={{ minWidth:700 }}>
          {/* Month axis */}
          <div style={{ display:'flex', marginLeft:200, marginBottom:8, position:'relative', height:20 }}>
            {months.map(m => (
              <div key={m.date.toISOString()} style={{ position:'absolute', left:`${m.pct}%`, transform:'translateX(-50%)' }}>
                <span style={{ ...sans, fontSize:9, color:stone, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                  {m.date.toLocaleDateString('en-IN',{month:'short',year:'2-digit'})}
                </span>
              </div>
            ))}
          </div>

          {/* Grid + bars */}
          {projects.map(proj => {
            const projTasks = MOCK_TIMELINE.filter(t=>t.project_name===proj)
            return (
              <div key={proj} style={{ marginBottom:20 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:gold, margin:'0 0 8px' }}>{proj}</p>
                {projTasks.map(t => (
                  <div key={t.id} style={{ display:'flex', alignItems:'center', gap:0, marginBottom:6 }}>
                    {/* Label */}
                    <div style={{ width:200, flexShrink:0, paddingRight:12 }}>
                      <p style={{ ...sans, fontSize:11, color:dark, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.task}</p>
                      <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{t.owner}</p>
                    </div>
                    {/* Bar area */}
                    <div style={{ flex:1, height:28, background:'#f5f4f2', position:'relative' }}>
                      {/* Month grid lines */}
                      {months.map(m => (
                        <div key={m.date.toISOString()} style={{ position:'absolute', top:0, bottom:0, left:`${m.pct}%`, width:1, background:bdr }} />
                      ))}
                      {/* Today line */}
                      {nowPct >= 0 && nowPct <= 100 && (
                        <div style={{ position:'absolute', top:0, bottom:0, left:`${nowPct}%`, width:1, background:'#ef4444', zIndex:2 }} />
                      )}
                      {/* Task bar */}
                      <div style={{ position:'absolute', top:4, bottom:4, left:`${barLeft(t.start)}%`, width:`${barWidth(t.start,t.end)}%`, background: t.pct===100?gold:`${gold}40`, border:`1px solid ${gold}`, zIndex:1 }}>
                        <div style={{ position:'absolute', top:0, left:0, bottom:0, width:`${t.pct}%`, background:gold }} />
                        <span style={{ position:'absolute', right:4, top:'50%', transform:'translateY(-50%)', ...sans, fontSize:8, fontWeight:700, color: t.pct===100?'#000':'#000', whiteSpace:'nowrap' }}>{t.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          <div style={{ display:'flex', marginLeft:200, gap:16, marginTop:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:16, height:8, background:gold }} /><span style={{ ...sans, fontSize:9, color:stone }}>Completed</span></div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:16, height:8, background:`${gold}40`, border:`1px solid ${gold}` }} /><span style={{ ...sans, fontSize:9, color:stone }}>In Progress</span></div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:1, height:14, background:'#ef4444' }} /><span style={{ ...sans, fontSize:9, color:stone }}>Today</span></div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function TrackingDashboard() {
  const [tab, setTab] = useState('overview')
  const [sideCollapsed, setSideCollapsed] = useState(false)
  const user = JSON.parse(localStorage.getItem('es_user') || '{"name":"Admin","role":"ADMIN"}')
  const initials = (user.name||'A').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  const W = sideCollapsed ? 60 : 220

  const CONTENT = {
    overview:   <OverviewTab />,
    projects:   <ProjectsTab />,
    employees:  <EmployeesTab />,
    designers:  <DesignersTab />,
    pm:         <PMTab />,
    contractor: <ContractorTab />,
    materials:  <MaterialsTab />,
    factory:    <FactoryTab />,
    gps:        <GPSTab />,
    timeline:   <TimelineTab />,
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', ...sans, background:light }}>

      {/* Sidebar */}
      <aside style={{ width:W, background:dark, display:'flex', flexDirection:'column', flexShrink:0, transition:'width 0.22s ease', overflow:'hidden' }}>
        <div style={{ height:64, display:'flex', alignItems:'center', gap:10, padding: sideCollapsed?'0 15px':'0 16px', borderBottom:`1px solid #292524`, flexShrink:0 }}>
          <div style={{ width:30, height:30, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none"/></svg>
          </div>
          {!sideCollapsed && (
            <div style={{ overflow:'hidden' }}>
              <p style={{ ...serif, margin:0, fontSize:15, fontWeight:500, color:'#fff', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>El Shaddai</p>
              <p style={{ margin:0, fontSize:8, color:gold, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:1 }}>Tracking System</p>
            </div>
          )}
          <button onClick={()=>setSideCollapsed(c=>!c)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#57534e', cursor:'pointer', fontSize:14, flexShrink:0, padding:4 }}>
            {sideCollapsed?'»':'«'}
          </button>
        </div>

        <nav style={{ flex:1, padding:'10px 6px', overflowY:'auto' }}>
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} title={t.label}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding: sideCollapsed?'10px 15px':'9px 12px', background: active?`rgba(201,162,39,0.08)`:'transparent', border:'none', borderLeft:`2px solid ${active?gold:'transparent'}`, color: active?gold:'#78716c', cursor:'pointer', textAlign:'left', ...sans, fontSize:11, fontWeight: active?600:400, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:1, whiteSpace:'nowrap' }}>
                <span style={{ fontSize:14, flexShrink:0 }}>{t.icon}</span>
                {!sideCollapsed && <span>{t.label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: sideCollapsed?'10px 6px':'10px 8px', borderTop:`1px solid #292524` }}>
          <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:10, padding: sideCollapsed?'8px 15px':'8px 12px', color:'#78716c', textDecoration:'none', ...sans, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap', marginBottom:2 }}>
            <span style={{ fontSize:13 }}>◁</span>{!sideCollapsed && <span>Dashboards</span>}
          </Link>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, padding: sideCollapsed?'8px 15px':'8px 12px', color:'#78716c', textDecoration:'none', ...sans, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
            <span style={{ fontSize:13 }}>⌂</span>{!sideCollapsed && <span>Home</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        {/* Header */}
        <header style={{ height:60, background:'#fff', borderBottom:`1px solid ${bdr}`, display:'flex', alignItems:'center', padding:'0 28px', gap:16, flexShrink:0 }}>
          <p style={{ ...serif, margin:0, fontSize:22, fontWeight:300, color:dark }}>
            {TABS.find(t=>t.id===tab)?.label || 'Tracking'}
          </p>
          <div style={{ flex:1 }} />
          <span style={{ ...sans, fontSize:10, color:'#a8a29e', fontWeight:300, letterSpacing:'0.08em', textTransform:'uppercase' }}>Enterprise Tracking System</span>
          <div style={{ width:6, height:6, background:'#22c55e' }} />
          <span style={{ ...sans, fontSize:10, color:'#22c55e', fontWeight:600 }}>Live</span>
          <div style={{ width:32, height:32, background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:'#000' }}>{initials}</div>
        </header>

        {/* Content */}
        <main style={{ flex:1, overflowY:'auto', padding:28 }}>
          {CONTENT[tab]}
        </main>
      </div>
    </div>
  )
}
