import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bdr   = '#e7e5e4'

const INDEX = [
  // Pages
  { type:'Page', label:'Dashboard',           sub:'Main overview',                  route:'/dashboard',        icon:'⊞' },
  { type:'Page', label:'Project Pipeline',    sub:'All projects — kanban & list',   route:'/pipeline',         icon:'▦' },
  { type:'Page', label:'New Project',         sub:'Create a new project',           route:'/new-project',      icon:'+' },
  { type:'Page', label:'Tracking Dashboard',  sub:'10-module enterprise tracker',   route:'/tracking',         icon:'◈' },
  { type:'Page', label:'Financial Manager',   sub:'Quotes, invoices, P&L',          route:'/financial',        icon:'₹' },
  { type:'Page', label:'Task Manager',        sub:'Tasks with stopwatch',           route:'/tasks',            icon:'▦' },
  { type:'Page', label:'Reports & Analytics', sub:'Project and worker reports',     route:'/reports',          icon:'◈' },
  { type:'Page', label:'Calendar',            sub:'Site visits, meetings, milestones',route:'/calendar',       icon:'▦' },
  { type:'Page', label:'Approvals Workflow',  sub:'Pending design & PO approvals',  route:'/approvals',        icon:'✓' },
  { type:'Page', label:'Client Portal',       sub:'Client-facing project view',     route:'/client-portal',    icon:'◉' },
  { type:'Page', label:'Inventory',           sub:'Material stock management',      route:'/inventory',        icon:'⊞' },
  { type:'Page', label:'Employees',           sub:'Staff directory & attendance',   route:'/employees',        icon:'◎' },
  { type:'Page', label:'Marketplace',         sub:'Products, vendors, POs',         route:'/marketplace',      icon:'◉' },
  { type:'Page', label:'AI Schedule Builder', sub:'Generate Gantt from scope',      route:'/schedule-builder', icon:'◫' },
  { type:'Page', label:'Cost Estimator',      sub:'AI-powered room cost estimate',  route:'/cost-estimator',   icon:'₹' },
  { type:'Page', label:'Style Quiz',          sub:'Find your design style',         route:'/style-quiz',       icon:'✦' },
  { type:'Page', label:'Mood Board',          sub:'Build material mood boards',     route:'/mood-board',       icon:'◨' },
  { type:'Page', label:'Floor Plan AI',       sub:'AI-generated floor plans',       route:'/floor-plan-ai',    icon:'✦' },
  { type:'Page', label:'QC Checklist',        sub:'Phase inspection checklists',    route:'/qc-checklist',     icon:'◫' },
  { type:'Page', label:'Site Diary',          sub:'Daily site progress logs',       route:'/site-diary',       icon:'▦' },
  { type:'Page', label:'Voice Daily Log',     sub:'Dictate your work report',       route:'/voice-log',        icon:'◎' },
  { type:'Page', label:'Audit Log',           sub:'Login and access event trail',   route:'/audit-log',        icon:'⊟' },
  { type:'Page', label:'MFA Setup',           sub:'Two-factor authentication',      route:'/mfa-setup',        icon:'⊕' },
  { type:'Page', label:'Settings',            sub:'Profile, company, integrations', route:'/settings',         icon:'⚙' },
  { type:'Page', label:'Document Manager',   sub:'Project files, drawings, contracts', route:'/documents',      icon:'📁' },
  { type:'Page', label:'Vendor Portal',      sub:'POs, vendor invoices, deliveries', route:'/vendor-portal',   icon:'🏭' },
  { type:'Page', label:'Contract Manager',   sub:'Generate, send & e-sign contracts', route:'/contracts',      icon:'📄' },
  { type:'Page', label:'Notifications',      sub:'All alerts, approvals & messages',  route:'/notifications',  icon:'🔔' },
  { type:'Page', label:'Timesheet Manager',  sub:'Weekly hours, OT & payroll',         route:'/timesheet',      icon:'⏱' },
  { type:'Page', label:'Project Health',     sub:'Health scores, burn rate, analytics',route:'/project-health', icon:'◈' },
  { type:'Page', label:'Material Spec Sheet',sub:'Per-project material specifications', route:'/material-spec',  icon:'▦' },

  // Actions
  { type:'Action', label:'Create New Project',    sub:'Start the project wizard',    route:'/new-project',     icon:'✦' },
  { type:'Action', label:'Generate Cost Estimate',sub:'AI room-by-room estimator',   route:'/cost-estimator',  icon:'₹' },
  { type:'Action', label:'Build AI Schedule',     sub:'Generate Gantt timeline',     route:'/schedule-builder',icon:'◫' },
  { type:'Action', label:'Record Voice Log',      sub:'Dictate today\'s site work',  route:'/voice-log',       icon:'◎' },
  { type:'Action', label:'Take Style Quiz',       sub:'Discover your design style',  route:'/style-quiz',      icon:'✦' },
  { type:'Action', label:'View Audit Log',        sub:'Check recent platform events',route:'/audit-log',       icon:'⊟' },
]

const TYPE_COLOR = { Page:gold, Project:'#22c55e', Client:'#8b7355', Employee:'#57534e', Action:'#f97316' }

export default function GlobalSearch() {
  const [open,   setOpen]   = useState(false)
  const [query,  setQuery]  = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Only show for logged-in users
  const isLoggedIn = !!localStorage.getItem('es_token')
  if (!isLoggedIn) return null

  // Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); setQuery(''); setCursor(0) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])

  const results = query.trim()
    ? INDEX.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.sub.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : INDEX.filter(i => i.type === 'Action' || i.type === 'Page').slice(0, 8)

  function go(item) {
    setOpen(false)
    setQuery('')
    navigate(item.route)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c+1, results.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c-1, 0)) }
    if (e.key === 'Enter' && results[cursor]) go(results[cursor])
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ position:'fixed', bottom:28, left:28, zIndex:40, display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:dark, border:`1px solid #292524`, color:'#78716c', cursor:'pointer', ...sans, fontSize:11 }}>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#57534e" strokeWidth="1.4"/><path d="M14 14l4 4" stroke="#57534e" strokeWidth="1.4" strokeLinecap="round"/></svg>
      Search
      <span style={{ fontSize:9, color:'#3a3330', background:'#292524', padding:'2px 6px', letterSpacing:'0.06em' }}>⌘K</span>
    </button>
  )

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:80 }}
      onClick={e => { if(e.target===e.currentTarget) setOpen(false) }}>
      <div style={{ width:'100%', maxWidth:580, background:'#fff', boxShadow:'0 24px 60px rgba(0,0,0,0.28)', border:`1px solid ${bdr}` }}>
        {/* Input */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderBottom:`1px solid ${bdr}` }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke={stone} strokeWidth="1.4"/><path d="M14 14l4 4" stroke={stone} strokeWidth="1.4" strokeLinecap="round"/></svg>
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setCursor(0) }} onKeyDown={onKeyDown}
            placeholder="Search pages, projects, clients, actions…"
            style={{ ...sans, flex:1, border:'none', outline:'none', fontSize:14, color:dark, background:'transparent' }} />
          <span style={{ ...sans, fontSize:9, color:'#a8a29e', background:'#f5f4f2', padding:'3px 8px', letterSpacing:'0.06em' }}>ESC</span>
        </div>

        {/* Results */}
        <div style={{ maxHeight:380, overflowY:'auto' }}>
          {results.length === 0 && (
            <p style={{ ...sans, fontSize:12, color:stone, textAlign:'center', padding:'32px 0' }}>No results for "{query}"</p>
          )}
          {!query && <p style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a8a29e', padding:'10px 18px 4px' }}>Quick Actions</p>}
          {results.map((item, i) => (
            <div key={i} onClick={() => go(item)}
              style={{ display:'flex', gap:12, alignItems:'center', padding:'10px 18px', background:i===cursor?`${gold}08`:'transparent', cursor:'pointer', borderBottom:`1px solid ${i===results.length-1?'transparent':bdr}` }}
              onMouseEnter={() => setCursor(i)}>
              <div style={{ width:28, height:28, background:i===cursor?`${gold}15`:'#f5f4f2', border:`1px solid ${i===cursor?gold:bdr}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:11 }}>{item.icon}</span>
              </div>
              <div style={{ flex:1, overflow:'hidden' }}>
                <p style={{ ...sans, fontSize:12.5, fontWeight:500, color:dark, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</p>
                <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{item.sub}</p>
              </div>
              <span style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:TYPE_COLOR[item.type]||stone, border:`1px solid ${TYPE_COLOR[item.type]||bdr}`, padding:'1px 6px', flexShrink:0 }}>{item.type.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display:'flex', gap:16, padding:'8px 18px', borderTop:`1px solid ${bdr}`, background:'#fafaf9' }}>
          {[['↑↓','Navigate'],['↵','Open'],['esc','Dismiss']].map(([key,label]) => (
            <div key={key} style={{ display:'flex', gap:5, alignItems:'center' }}>
              <span style={{ ...sans, fontSize:9, color:'#a8a29e', background:'#f0ede9', border:`1px solid ${bdr}`, padding:'2px 6px' }}>{key}</span>
              <span style={{ ...sans, fontSize:9, color:'#a8a29e' }}>{label}</span>
            </div>
          ))}
          <div style={{ flex:1 }} />
          <span style={{ ...serif, fontSize:11, color:'#c9c5c0' }}>El Shaddai</span>
        </div>
      </div>
    </div>
  )
}
