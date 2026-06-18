import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { admin as adminApi } from '../../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

// ── Demo seed data ────────────────────────────────────────────────
const ACTIONS = [
  'USER_LOGIN','USER_LOGOUT','USER_REGISTER','USER_LOGIN_FAILED',
  'PROJECT_CREATED','PROJECT_STATUS_CHANGED','PROJECT_DELETED',
  'INVOICE_CREATED','INVOICE_MARKED_PAID','QUOTE_APPROVED',
  'TASK_CREATED','TASK_STATUS_CHANGED','TASK_ASSIGNED',
  'MATERIAL_PO_CREATED','MATERIAL_RECEIVED',
  'ROLE_CHANGED','PERMISSION_GRANTED','PERMISSION_REVOKED',
  'REPORT_EXPORTED','FILE_UPLOADED','FILE_DELETED',
  'SETTING_CHANGED','API_KEY_CREATED','API_KEY_REVOKED',
  'COMMENT_ADDED','NOTE_EDITED','ATTENDANCE_MARKED',
]

const USERS = [
  { name:'Aravind Kumar',    role:'SUPER_ADMIN', email:'aravind@elshaddai.in' },
  { name:'Priya Menon',      role:'ADMIN',       email:'priya@elshaddai.in' },
  { name:'Kiran Sharma',     role:'DESIGNER',    email:'kiran@elshaddai.in' },
  { name:'Mohammed Farook',  role:'BUILDER',     email:'farook@elshaddai.in' },
  { name:'Lakshmi Iyer',     role:'DESIGNER',    email:'lakshmi@elshaddai.in' },
  { name:'Suresh Babu',      role:'WORKSHOP_WORKER', email:'suresh@elshaddai.in' },
  { name:'Deepa Nair',       role:'CLIENT',      email:'deepa.nair@gmail.com' },
  { name:'Ramesh Pillai',    role:'BUILDER',     email:'ramesh@elshaddai.in' },
]

const DEVICES = ['Chrome / Windows','Chrome / macOS','Safari / iPhone','Firefox / Ubuntu','Edge / Windows','Safari / iPad']

const RESOURCES = [
  'Project #PRJ-0012 — Nair Residence',
  'Project #PRJ-0009 — Commercial Tower',
  'Invoice #INV-00031',
  'Task #TSK-0088 — Kitchen Execution',
  'Material PO #PO-2024-119',
  'User Account — deepa.nair@gmail.com',
  'Report — Q4 2024 P&L',
  'System Settings — Email',
  'Floor Plan — Unit 4B',
  'Factory Job #FJ-0045',
]

const IPS = ['103.18.42.11','49.207.15.88','106.51.0.77','117.210.9.33','183.82.100.21','157.44.81.6','223.186.5.90','122.169.0.44']

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function seedLogs() {
  const logs = []
  const now = Date.now()
  for (let i = 0; i < 120; i++) {
    const u = randomFrom(USERS)
    const action = randomFrom(ACTIONS)
    const ts = new Date(now - Math.random() * 30 * 86400000)
    const success = Math.random() > 0.06
    logs.push({
      id: i + 1,
      ts: ts.toISOString(),
      user: u.name,
      role: u.role,
      email: u.email,
      action,
      resource: action.includes('LOGIN') || action.includes('REGISTER') ? 'Authentication' : randomFrom(RESOURCES),
      ip: randomFrom(IPS),
      device: randomFrom(DEVICES),
      status: success ? 'SUCCESS' : 'FAILED',
      detail: action === 'PROJECT_STATUS_CHANGED' ? 'DESIGN → QUOTATION_APPROVED'
            : action === 'ROLE_CHANGED' ? 'BUILDER → DESIGNER'
            : action === 'USER_LOGIN_FAILED' ? 'Invalid password (attempt 2/5)'
            : '',
    })
  }
  return logs.sort((a, b) => new Date(b.ts) - new Date(a.ts))
}

const ALL_LOGS = seedLogs()

const ACTION_COLOR = {
  USER_LOGIN: '#22c55e', USER_LOGOUT: '#78716c', USER_LOGIN_FAILED: '#ef4444',
  USER_REGISTER: '#22c55e', PROJECT_CREATED: gold, PROJECT_STATUS_CHANGED: gold,
  PROJECT_DELETED: '#ef4444', INVOICE_CREATED: gold, INVOICE_MARKED_PAID: '#22c55e',
  ROLE_CHANGED: '#f97316', PERMISSION_GRANTED: '#f97316', PERMISSION_REVOKED: '#ef4444',
  API_KEY_CREATED: '#f97316', API_KEY_REVOKED: '#ef4444', FILE_DELETED: '#ef4444',
}

const ROLE_SHORT = { SUPER_ADMIN:'SA', ADMIN:'AD', DESIGNER:'DS', BUILDER:'BL', WORKSHOP_WORKER:'WW', CLIENT:'CL' }

// ── Severity badge ────────────────────────────────────────────────
function SeverityBadge({ action, status }) {
  const critical = ['USER_LOGIN_FAILED','PERMISSION_REVOKED','PROJECT_DELETED','FILE_DELETED','API_KEY_REVOKED','ROLE_CHANGED']
  const high     = ['PERMISSION_GRANTED','API_KEY_CREATED','ROLE_CHANGED','INVOICE_MARKED_PAID']
  const color = status === 'FAILED' ? '#ef4444'
              : critical.includes(action) ? '#f97316'
              : high.includes(action)     ? gold
              : '#78716c'
  const label = status === 'FAILED' ? 'FAILED'
              : critical.includes(action) ? 'CRITICAL'
              : high.includes(action)     ? 'HIGH'
              : 'INFO'
  return (
    <span style={{ ...sans, fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color, border: `1px solid ${color}`, padding: '2px 6px' }}>
      {label}
    </span>
  )
}

export default function AuditLogPage() {
  const storedUser = JSON.parse(localStorage.getItem('es_user') || '{}')
  const isPrivileged = ['ADMIN','SUPER_ADMIN'].includes(storedUser.role)

  const [search,   setSearch]   = useState('')
  const [roleF,    setRoleF]    = useState('ALL')
  const [actionF,  setActionF]  = useState('ALL')
  const [statusF,  setStatusF]  = useState('ALL')
  const [daysF,    setDaysF]    = useState('30')
  const [selected, setSelected] = useState(null)
  const [page,     setPage]     = useState(1)
  const [logs,     setLogs]     = useState(ALL_LOGS)
  const PER_PAGE = 20

  useEffect(() => {
    if (!isPrivileged) return
    adminApi.auditLog()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (arr.length > 0) {
          setLogs(arr.map(r => ({
            id: r.id,
            ts: r.created_at || new Date().toISOString(),
            user: r.user_name || r.user_email || 'System',
            role: r.user_role || 'SYSTEM',
            email: r.user_email || '',
            action: r.action || 'SYSTEM_EVENT',
            resource: r.resource || '—',
            ip: r.ip_address || '—',
            device: r.user_agent || '—',
            status: r.status || 'SUCCESS',
            details: r.details || '',
          })))
        }
      })
      .catch(() => {})
  }, [isPrivileged])

  const cutoff = new Date(Date.now() - parseInt(daysF) * 86400000)

  const filtered = logs.filter(l => {
    if (new Date(l.ts) < cutoff) return false
    if (roleF   !== 'ALL' && l.role   !== roleF)   return false
    if (actionF !== 'ALL' && l.action !== actionF)  return false
    if (statusF !== 'ALL' && l.status !== statusF)  return false
    if (search) {
      const q = search.toLowerCase()
      if (!l.user.toLowerCase().includes(q) && !l.action.toLowerCase().includes(q) && !l.resource.toLowerCase().includes(q) && !l.ip.includes(q)) return false
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  useEffect(() => { setPage(1) }, [search, roleF, actionF, statusF, daysF])

  // Stats
  const today = new Date(); today.setHours(0,0,0,0)
  const todayLogs  = logs.filter(l => new Date(l.ts) >= today)
  const failedLogs = logs.filter(l => l.status === 'FAILED' && new Date(l.ts) >= new Date(Date.now() - 86400000))
  const criticalCount = filtered.filter(l => ['USER_LOGIN_FAILED','PERMISSION_REVOKED','PROJECT_DELETED','ROLE_CHANGED'].includes(l.action)).length

  function fmt(ts) {
    const d = new Date(ts)
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) + ' ' +
           d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
  }

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      {/* Header */}
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={gold} strokeWidth="1.3"/><path d="M10 7v4l3 2" stroke={gold} strokeWidth="1.3" strokeLinecap="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Audit <span style={{ color:gold }}>Log</span></p>
        {!isPrivileged && (
          <span style={{ ...sans, fontSize:10, color:'#ef4444', border:'1px solid #ef4444', padding:'3px 10px', letterSpacing:'0.1em' }}>READ-ONLY — Limited View</span>
        )}
        <div style={{ flex:1 }} />
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ padding:28 }}>
        {/* KPI strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Events Today',     value:todayLogs.length,    accent:gold },
            { label:'Total (Filtered)', value:filtered.length,     accent:'#78716c' },
            { label:'Failed (24h)',     value:failedLogs.length,   accent:'#ef4444' },
            { label:'Critical Events',  value:criticalCount,       accent:'#f97316' },
          ].map(k => (
            <div key={k.label} style={{ background:'#fff', border:`1px solid ${bdr}`, borderTop:`3px solid ${k.accent}`, padding:'16px 20px' }}>
              <p style={{ ...serif, fontSize:34, fontWeight:300, color:dark, margin:'0 0 4px' }}>{k.value}</p>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:0 }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'16px 20px', marginBottom:16, display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ flex:2, minWidth:180 }}>
            <label style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="User, action, resource, IP…"
              style={{ ...sans, width:'100%', padding:'8px 10px', border:`1px solid ${bdr}`, fontSize:11, color:dark, boxSizing:'border-box' }} />
          </div>
          {[
            { label:'Role',    value:roleF,    set:setRoleF,    opts:['ALL','SUPER_ADMIN','ADMIN','DESIGNER','BUILDER','WORKSHOP_WORKER','CLIENT'] },
            { label:'Status',  value:statusF,  set:setStatusF,  opts:['ALL','SUCCESS','FAILED'] },
            { label:'Period',  value:daysF,    set:setDaysF,    opts:[['1','Last 24h'],['7','Last 7d'],['30','Last 30d'],['90','Last 90d']] },
          ].map(f => (
            <div key={f.label} style={{ minWidth:130 }}>
              <label style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>{f.label}</label>
              <select value={f.value} onChange={e => f.set(e.target.value)}
                style={{ ...sans, padding:'8px 10px', border:`1px solid ${bdr}`, fontSize:11, color:dark, width:'100%', background:'#fff' }}>
                {f.opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o === 'ALL' ? `All ${f.label}s` : o.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          ))}
          <div style={{ minWidth:160 }}>
            <label style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>Action Type</label>
            <select value={actionF} onChange={e => setActionF(e.target.value)}
              style={{ ...sans, padding:'8px 10px', border:`1px solid ${bdr}`, fontSize:11, color:dark, width:'100%', background:'#fff' }}>
              <option value="ALL">All Actions</option>
              {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:dark }}>
                {['Timestamp','User / Role','Action','Resource','IP / Device','Status','Severity'].map(h => (
                  <th key={h} style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#78716c', padding:'10px 14px', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(l => (
                <tr key={l.id} onClick={() => setSelected(l)}
                  style={{ borderBottom:`1px solid ${bdr}`, cursor:'pointer', background:l.status === 'FAILED' ? '#fff5f5' : '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = l.status === 'FAILED' ? '#fee2e2' : `${gold}06`}
                  onMouseLeave={e => e.currentTarget.style.background = l.status === 'FAILED' ? '#fff5f5' : '#fff'}>
                  <td style={{ ...sans, fontSize:10.5, color:stone, padding:'10px 14px', whiteSpace:'nowrap' }}>{fmt(l.ts)}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <p style={{ ...sans, fontSize:11, color:dark, margin:'0 0 2px', fontWeight:500 }}>{l.user}</p>
                    <span style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', color:gold, border:`1px solid ${gold}28`, padding:'1px 5px' }}>{ROLE_SHORT[l.role] || l.role}</span>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <p style={{ ...sans, fontSize:10.5, color:ACTION_COLOR[l.action] || dark, margin:0, fontWeight:600, letterSpacing:'0.03em' }}>{l.action.replace(/_/g,' ')}</p>
                    {l.detail && <p style={{ ...sans, fontSize:9.5, color:stone, margin:'2px 0 0' }}>{l.detail}</p>}
                  </td>
                  <td style={{ ...sans, fontSize:10.5, color:stone, padding:'10px 14px', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.resource}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <p style={{ ...sans, fontSize:10.5, color:dark, margin:'0 0 2px', fontFamily:'monospace' }}>{l.ip}</p>
                    <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{l.device}</p>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.1em', color:l.status==='SUCCESS'?'#22c55e':'#ef4444', border:`1px solid ${l.status==='SUCCESS'?'#22c55e':'#ef4444'}`, padding:'2px 8px' }}>{l.status}</span>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <SeverityBadge action={l.action} status={l.status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{ ...sans, fontSize:12, color:stone, textAlign:'center', padding:'48px 0' }}>No events match the current filters.</td></tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderTop:`1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize:11, color:stone, margin:0 }}>
              Showing {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} events
            </p>
            <div style={{ display:'flex', gap:4 }}>
              <button disabled={page===1} onClick={() => setPage(p => p-1)}
                style={{ ...sans, padding:'6px 14px', border:`1px solid ${bdr}`, background:'#fff', color:page===1?'#d0cdc9':dark, cursor:page===1?'default':'pointer', fontSize:11 }}>← Prev</button>
              {[...Array(Math.min(5,totalPages))].map((_,i) => {
                const pg = Math.max(1, Math.min(page-2, totalPages-4)) + i
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    style={{ ...sans, padding:'6px 12px', border:`1px solid ${pg===page?gold:bdr}`, background:pg===page?gold:'#fff', color:pg===page?'#000':dark, cursor:'pointer', fontSize:11, fontWeight:pg===page?700:400 }}>{pg}</button>
                )
              })}
              <button disabled={page===totalPages} onClick={() => setPage(p => p+1)}
                style={{ ...sans, padding:'6px 14px', border:`1px solid ${bdr}`, background:'#fff', color:page===totalPages?'#d0cdc9':dark, cursor:page===totalPages?'default':'pointer', fontSize:11 }}>Next →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:50, display:'flex', justifyContent:'flex-end' }}
          onClick={e => { if(e.target===e.currentTarget) setSelected(null) }}>
          <div style={{ width:400, background:'#fff', height:'100%', overflowY:'auto', padding:28, display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ ...serif, fontSize:22, fontWeight:300, color:dark, margin:0 }}>Event Detail</p>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:stone }}>✕</button>
            </div>

            <div style={{ background:dark, padding:'16px 18px', borderLeft:`3px solid ${ACTION_COLOR[selected.action]||gold}` }}>
              <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:ACTION_COLOR[selected.action]||gold, margin:'0 0 4px' }}>{selected.action.replace(/_/g,' ')}</p>
              <p style={{ ...sans, fontSize:11, color:'#a8a29e', margin:0 }}>{fmt(selected.ts)}</p>
            </div>

            {[
              ['User',     selected.user],
              ['Email',    selected.email],
              ['Role',     selected.role],
              ['IP Address', selected.ip],
              ['Device',   selected.device],
              ['Resource', selected.resource],
              ['Status',   selected.status],
              ['Detail',   selected.detail || '—'],
              ['Event ID', `#EVT-${String(selected.id).padStart(6,'0')}`],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', gap:12, paddingBottom:12, borderBottom:`1px solid ${bdr}` }}>
                <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, width:90, flexShrink:0, paddingTop:1 }}>{k}</span>
                <span style={{ ...sans, fontSize:12, color:dark }}>{v}</span>
              </div>
            ))}

            <SeverityBadge action={selected.action} status={selected.status} />
          </div>
        </div>
      )}
    </div>
  )
}
