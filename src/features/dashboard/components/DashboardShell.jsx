import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import NotificationCenter from '../../../components/common/NotificationCenter'

const sans   = { fontFamily:"'DM Sans', system-ui, sans-serif" }
const serif  = { fontFamily:"'Cormorant Garamond', Georgia, serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const border = '#292524'

const ROLE_LABEL = {
  CLIENT:'Client / Homeowner', DESIGNER:'Interior Designer',
  BUILDER:'Builder / Contractor', WORKSHOP_WORKER:'Workshop Worker',
  ADMIN:'Admin', SUPER_ADMIN:'Super Admin',
}

const ROLE_COLOR = {
  CLIENT:'#60a5fa', DESIGNER:'#8b5cf6', BUILDER:'#f59e0b',
  WORKSHOP_WORKER:'#facc15', ADMIN:'#4ade80', SUPER_ADMIN:'#f87171',
}

const ROLE_ICON = {
  CLIENT:'🏠', DESIGNER:'✦', BUILDER:'🏗',
  WORKSHOP_WORKER:'🔨', ADMIN:'⚙', SUPER_ADMIN:'◈',
}

/* ── Role-based nav items ─────────────────────────────────────── */
const NAV_BY_ROLE = {
  CLIENT: [
    { id:'overview', icon:'◫', label:'Overview' },
    { id:'projects', icon:'▦', label:'My Projects', href:'/projects' },
    { id:'approvals', icon:'✓', label:'Approvals', href:'/approvals' },
    { id:'documents', icon:'📁', label:'Documents', href:'/documents' },
    { id:'client-portal', icon:'◉', label:'Client Portal', href:'/client-portal' },
    { id:'payments', icon:'₹', label:'Payments', href:'/financial' },
    { id:'calendar', icon:'▦', label:'Calendar', href:'/calendar' },
    { id:'mood-board', icon:'◨', label:'Mood Board', href:'/mood-board' },
    { id:'style-quiz', icon:'✦', label:'Style Quiz', href:'/style-quiz' },
    { id:'floor-plan', icon:'◫', label:'Floor Plan Studio', href:'/floor-plan-ai' },
  ],
  DESIGNER: [
    { id:'overview', icon:'◫', label:'Overview' },
    { id:'projects', icon:'▦', label:'Projects', href:'/projects' },
    { id:'tasks', icon:'▦', label:'Task Manager', href:'/tasks' },
    { id:'pipeline', icon:'▦', label:'Pipeline', href:'/pipeline' },
    { id:'floor-plan', icon:'◫', label:'Floor Plan Studio', href:'/floor-plan-ai' },
    { id:'designer', icon:'✦', label:'3D Designer', href:'/designer' },
    { id:'mood-board', icon:'◨', label:'Mood Board', href:'/mood-board' },
    { id:'material-spec', icon:'▦', label:'Material Spec', href:'/material-spec' },
    { id:'qc', icon:'◫', label:'QC Checklist', href:'/qc-checklist' },
    { id:'calendar', icon:'▦', label:'Calendar', href:'/calendar' },
    { id:'documents', icon:'📁', label:'Documents', href:'/documents' },
    { id:'reports', icon:'◈', label:'Reports', href:'/reports' },
  ],
  BUILDER: [
    { id:'overview', icon:'◫', label:'Overview' },
    { id:'projects', icon:'▦', label:'Projects', href:'/projects' },
    { id:'tasks', icon:'▦', label:'Tasks', href:'/tasks' },
    { id:'site-diary', icon:'▦', label:'Site Diary', href:'/site-diary' },
    { id:'qc', icon:'◫', label:'QC Checklist', href:'/qc-checklist' },
    { id:'tracking', icon:'◈', label:'Tracking', href:'/tracking' },
    { id:'timesheet', icon:'⏱', label:'Timesheet', href:'/timesheet' },
    { id:'materials', icon:'▦', label:'Material Spec', href:'/material-spec' },
    { id:'documents', icon:'📁', label:'Documents', href:'/documents' },
    { id:'calendar', icon:'▦', label:'Calendar', href:'/calendar' },
  ],
  WORKSHOP_WORKER: [
    { id:'overview', icon:'◫', label:'Overview' },
    { id:'tasks', icon:'▦', label:'My Tasks', href:'/tasks' },
    { id:'tracking', icon:'◈', label:'Job Tracking', href:'/tracking' },
    { id:'timesheet', icon:'⏱', label:'Timesheet', href:'/timesheet' },
    { id:'materials', icon:'▦', label:'Materials', href:'/material-spec' },
    { id:'calendar', icon:'▦', label:'Calendar', href:'/calendar' },
  ],
  ADMIN: [
    { id:'overview', icon:'◫', label:'Overview' },
    { id:'projects', icon:'▦', label:'Projects', href:'/projects' },
    { id:'pipeline', icon:'▦', label:'Pipeline', href:'/pipeline' },
    { id:'employees', icon:'◎', label:'Employees', href:'/employees' },
    { id:'tracking', icon:'◈', label:'Tracking', href:'/tracking' },
    { id:'financial', icon:'₹', label:'Financial', href:'/financial' },
    { id:'tasks', icon:'▦', label:'Tasks', href:'/tasks' },
    { id:'reports', icon:'◈', label:'Reports', href:'/reports' },
    { id:'inventory', icon:'⊞', label:'Inventory', href:'/inventory' },
    { id:'vendors', icon:'🏭', label:'Vendor Portal', href:'/vendor-portal' },
    { id:'purchase-orders', icon:'📄', label:'Purchase Orders', href:'/contracts' },
    { id:'qc', icon:'◫', label:'QC Checklist', href:'/qc-checklist' },
    { id:'site-diary', icon:'▦', label:'Site Diary', href:'/site-diary' },
    { id:'calendar', icon:'▦', label:'Calendar', href:'/calendar' },
    { id:'documents', icon:'📁', label:'Documents', href:'/documents' },
    { id:'audit-log', icon:'⊟', label:'Audit Log', href:'/audit-log' },
    { id:'new-project', icon:'+', label:'New Project', href:'/new-project' },
  ],
}
NAV_BY_ROLE.SUPER_ADMIN = [...NAV_BY_ROLE.ADMIN, { id:'mfa', icon:'⊕', label:'MFA Setup', href:'/mfa-setup' }]

/* ── Profile Dropdown ─────────────────────────────────────────── */
function ProfileDropdown({ user, initials, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const roleColor = ROLE_COLOR[user.role] || gold
  const roleLabel = ROLE_LABEL[user.role] || user.role
  const roleIcon  = ROLE_ICON[user.role]  || '◈'

  const menuItems = [
    { icon:'◎', label:'My Profile',   action:() => { navigate('/settings'); setOpen(false) } },
    { icon:'⚙', label:'Settings',     action:() => { navigate('/settings'); setOpen(false) } },
    { icon:'🔔', label:'Notifications',action:() => { navigate('/notifications'); setOpen(false) } },
    { icon:'◫', label:'Floor Plan Studio', action:() => { navigate('/floor-plan-ai'); setOpen(false) } },
    ...(user.role==='CLIENT' ? [{ icon:'◉', label:'Client Portal', action:()=>{ navigate('/client-portal'); setOpen(false) } }] : []),
    ...(user.role==='ADMIN'||user.role==='SUPER_ADMIN' ? [{ icon:'⊟', label:'Audit Log', action:()=>{ navigate('/audit-log'); setOpen(false) } }] : []),
    { icon:'⌂', label:'Homepage',     action:() => { navigate('/'); setOpen(false) } },
  ]

  return (
    <div ref={ref} style={{ position:'relative' }}>
      {/* Avatar trigger */}
      <button onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', gap:8, background:'transparent', border:`1px solid ${open?gold:border}`, padding:'5px 10px 5px 6px', cursor:'pointer', transition:'all 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor=gold}
        onMouseLeave={e => { if(!open) e.currentTarget.style.borderColor=border }}>
        {/* Avatar */}
        <div style={{ width:28, height:28, background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11, color:'#000', flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ textAlign:'left' }}>
          <p style={{ margin:0, fontSize:11, fontWeight:600, color:'#e7e5e4', ...sans, lineHeight:1.2, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</p>
          <p style={{ margin:0, fontSize:8.5, color:roleColor, letterSpacing:'0.12em', textTransform:'uppercase', ...sans }}>{roleLabel}</p>
        </div>
        <span style={{ fontSize:9, color:'#57534e', marginLeft:2, transition:'transform 0.15s', display:'inline-block', transform:open?'rotate(180deg)':'rotate(0deg)' }}>▾</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, width:240, background:'#0d0b09', border:`1px solid ${border}`, zIndex:200, boxShadow:'0 12px 40px rgba(0,0,0,0.5)' }}>
          {/* Header */}
          <div style={{ padding:'16px 16px 12px', borderBottom:`1px solid ${border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:36, height:36, background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'#000', flexShrink:0 }}>{initials}</div>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#fff', ...sans }}>{user.name}</p>
                <p style={{ margin:'2px 0 0', fontSize:10, color:'#78716c', ...sans }}>{user.email}</p>
              </div>
            </div>
            {/* Role badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:`${roleColor}15`, border:`1px solid ${roleColor}30` }}>
              <span style={{ fontSize:11 }}>{roleIcon}</span>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:roleColor, ...sans }}>{roleLabel}</span>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding:'6px 0' }}>
            {menuItems.map(item => (
              <button key={item.label} onClick={item.action}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left', ...sans, fontSize:12, color:'#78716c', transition:'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#e7e5e4' }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#78716c' }}>
                <span style={{ fontSize:12, width:16, textAlign:'center', color:'#44403c' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div style={{ borderTop:`1px solid ${border}`, padding:'6px 0 8px' }}>
            <button onClick={() => { onLogout(); setOpen(false) }}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left', ...sans, fontSize:12, color:'#78716c', transition:'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.06)'; e.currentTarget.style.color='#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#78716c' }}>
              <span style={{ fontSize:12, width:16, textAlign:'center' }}>→</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Shell ────────────────────────────────────────────────────── */
export default function DashboardShell({ user, nav, activeTab, onTabChange, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const W = collapsed ? 60 : 220

  // Use role-based nav if none passed in
  const navItems = nav || NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.CLIENT

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', ...sans, background:'#fafaf9' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width:W, background:dark, display:'flex', flexDirection:'column', flexShrink:0, transition:'width 0.22s ease', overflow:'hidden' }}>
        {/* Logo */}
        <div style={{ height:64, display:'flex', alignItems:'center', gap:10, padding:collapsed?'0 15px':'0 16px', borderBottom:`1px solid ${border}`, flexShrink:0 }}>
          <div style={{ width:30, height:30, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none"/></svg>
          </div>
          {!collapsed && (
            <div style={{ overflow:'hidden' }}>
              <p style={{ ...serif, margin:0, fontSize:15, fontWeight:500, color:'#fff', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>El Shaddai</p>
              <p style={{ margin:0, fontSize:8.5, color:gold, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:1 }}>Dashboard</p>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#57534e', cursor:'pointer', fontSize:14, flexShrink:0, padding:4 }}>{collapsed?'»':'«'}</button>
        </div>

        {/* User profile strip in sidebar */}
        {!collapsed && (
          <div style={{ padding:'14px 16px', borderBottom:`1px solid ${border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11, color:'#000', flexShrink:0 }}>{initials}</div>
              <div style={{ overflow:'hidden', flex:1 }}>
                <p style={{ margin:'0 0 1px', fontSize:12, fontWeight:600, color:'#e7e5e4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
                <p style={{ margin:0, fontSize:8.5, color:ROLE_COLOR[user?.role]||gold, letterSpacing:'0.12em', textTransform:'uppercase' }}>{ROLE_LABEL[user?.role]||user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 6px', overflowY:'auto' }}>
          {navItems.map(item => {
            const active = activeTab === item.id
            if (item.href) {
              return (
                <Link key={item.id} to={item.href} title={item.label}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:collapsed?'10px 15px':'9px 12px', background:active?'rgba(201,162,39,0.08)':'transparent', borderLeft:`2px solid ${active?gold:'transparent'}`, color:active?gold:'#78716c', textDecoration:'none', ...sans, fontSize:11, fontWeight:active?600:400, letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 0.15s', marginBottom:1, whiteSpace:'nowrap' }}
                  onMouseEnter={e => { if(!active){ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#e7e5e4' }}}
                  onMouseLeave={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#78716c' }}}>
                  <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            }
            return (
              <button key={item.id} onClick={() => onTabChange?.(item.id)} title={item.label}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:collapsed?'10px 15px':'9px 12px', background:active?'rgba(201,162,39,0.08)':'transparent', border:'none', borderLeft:`2px solid ${active?gold:'transparent'}`, color:active?gold:'#78716c', cursor:'pointer', textAlign:'left', ...sans, fontSize:11, fontWeight:active?600:400, letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 0.15s', marginBottom:1, whiteSpace:'nowrap' }}
                onMouseEnter={e => { if(!active){ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#e7e5e4' }}}
                onMouseLeave={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#78716c' }}}>
                <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding:collapsed?'10px 6px':'10px 8px', borderTop:`1px solid ${border}` }}>
          <Link to="/" title="Homepage"
            style={{ display:'flex', alignItems:'center', gap:10, padding:collapsed?'8px 15px':'8px 12px', color:'#57534e', textDecoration:'none', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap', marginBottom:2 }}
            onMouseEnter={e=>e.currentTarget.style.color='#e7e5e4'} onMouseLeave={e=>e.currentTarget.style.color='#57534e'}>
            <span style={{ fontSize:13 }}>⌂</span>{!collapsed && <span>Homepage</span>}
          </Link>
          <button onClick={handleLogout} title="Sign Out"
            style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:collapsed?'8px 15px':'8px 12px', background:'none', border:'none', color:'#78716c', cursor:'pointer', ...sans, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}
            onMouseEnter={e=>e.currentTarget.style.color='#f87171'} onMouseLeave={e=>e.currentTarget.style.color='#78716c'}>
            <span style={{ fontSize:13 }}>→</span>{!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

        {/* Top bar */}
        <header style={{ height:60, background:'#fff', borderBottom:'1px solid #e7e5e4', display:'flex', alignItems:'center', padding:'0 24px', gap:16, flexShrink:0 }}>
          <p style={{ ...serif, margin:0, fontSize:22, fontWeight:300, color:dark }}>
            {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
          </p>
          <div style={{ flex:1 }} />
          <span style={{ ...sans, fontSize:11, color:'#c8c4be', fontWeight:300, letterSpacing:'0.05em' }}>50+ yrs Excellence</span>
          <NotificationCenter />
          {/* Profile dropdown */}
          <ProfileDropdown user={user} initials={initials} onLogout={handleLogout} />
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', padding:28 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
