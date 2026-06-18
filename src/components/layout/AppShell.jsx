import { useState, useRef, useEffect } from 'react'

const NAV = [
  { icon: '⌂',  label: 'Home',          path: '/'          },
  { icon: '▦',  label: 'Projects',      path: '/projects'  },
  { icon: '✦',  label: 'Designer',      path: '/designer'  },
  { icon: '◈',  label: 'AI Design',     path: '/ai-design' },
  { icon: '◉',  label: 'Render Studio', path: '/render'    },
  { icon: '▣',  label: 'Catalog',       path: '/catalog'   },
  { icon: '◫',  label: 'Presentation',  path: '/present'   },
  { icon: '◱',  label: 'Portfolio',     path: '/portfolio' },
  { icon: '≡',  label: 'Blog',          path: '/blog'      },
  { icon: '◈',  label: 'Pricing',       path: '/pricing'   },
  { icon: '▤',  label: 'Dashboard',     path: '/dashboard' },
]

const SEARCH_INDEX = [
  { label:'Dashboard',           sub:'Main overview',                  route:'/dashboard'        },
  { label:'Projects',            sub:'All projects list',              route:'/projects'         },
  { label:'New Project',         sub:'Create a project',               route:'/new-project'      },
  { label:'Task Manager',        sub:'Tasks with stopwatch',           route:'/tasks'            },
  { label:'Project Pipeline',    sub:'Kanban pipeline view',           route:'/pipeline'         },
  { label:'Tracking Dashboard',  sub:'Enterprise site tracker',        route:'/tracking'         },
  { label:'Financial Manager',   sub:'Quotes, invoices, P&L',          route:'/financial'        },
  { label:'Calendar',            sub:'Site visits & milestones',       route:'/calendar'         },
  { label:'Inventory',           sub:'Material stock management',      route:'/inventory'        },
  { label:'Employees',           sub:'Staff directory',                route:'/employees'        },
  { label:'Vendor Portal',       sub:'POs, invoices, vendors',         route:'/vendor-portal'    },
  { label:'Contracts',           sub:'Generate, send & e-sign',        route:'/contracts'        },
  { label:'Documents',           sub:'Project files & drawings',       route:'/documents'        },
  { label:'Site Diary',          sub:'Daily site progress logs',       route:'/site-diary'       },
  { label:'Reports',             sub:'Analytics & reports',            route:'/reports'          },
  { label:'Approvals',           sub:'Pending approvals workflow',     route:'/approvals'        },
  { label:'Client Portal',       sub:'Client-facing project view',     route:'/client-portal'    },
  { label:'Notifications',       sub:'Alerts & messages',              route:'/notifications'    },
  { label:'Audit Log',           sub:'Access event trail',             route:'/audit-log'        },
  { label:'Settings',            sub:'Profile & company settings',     route:'/settings'         },
  { label:'AI Design',           sub:'AI room design generator',       route:'/ai-design'        },
  { label:'Cost Estimator',      sub:'AI-powered room cost estimate',  route:'/cost-estimator'   },
  { label:'Floor Plan AI',       sub:'AI-generated floor plans',       route:'/floor-plan-ai'    },
  { label:'QC Checklist',        sub:'Phase inspection checklists',    route:'/qc-checklist'     },
  { label:'Timesheets',          sub:'Weekly timesheet approvals',     route:'/timesheets'       },
  { label:'MFA Setup',           sub:'Two-factor authentication',      route:'/mfa-setup'        },
]

const S = {
  serif: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  sans:  { fontFamily: "'DM Sans', system-ui, sans-serif" },
  gold:  '#c9a227',
  dark:  '#1c1917',
  stone: '#57534e',
  light: '#fafaf9',
  border: '#292524',
}

function SearchBar() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [focused, setFocused]   = useState(false)
  const [idx, setIdx]           = useState(-1)
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setFocused(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClickOut(e) {
      if (!wrapRef.current?.contains(e.target)) { setFocused(false); setQuery('') }
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  function onChange(e) {
    const q = e.target.value
    setQuery(q); setIdx(-1)
    if (!q.trim()) { setResults([]); return }
    const low = q.toLowerCase()
    setResults(SEARCH_INDEX.filter(i => i.label.toLowerCase().includes(low) || i.sub.toLowerCase().includes(low)).slice(0, 8))
  }

  function onKeyDown(e) {
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, -1)) }
    if (e.key === 'Enter' && idx >= 0) { go(results[idx].route) }
    if (e.key === 'Escape')    { setFocused(false); setQuery('') }
  }

  function go(route) {
    window.location.href = route
    setQuery(''); setFocused(false); setResults([])
  }

  const showDrop = focused && results.length > 0

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: 280 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: S.light, border: `1px solid ${focused ? S.gold : '#e7e5e4'}`, padding: '7px 12px', transition: 'border-color 0.15s' }}>
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
          <circle cx="8.5" cy="8.5" r="5.5" stroke={S.dark} strokeWidth="1.5"/>
          <path d="M13 13l4 4" stroke={S.dark} strokeWidth="1.5" strokeLinecap="square"/>
        </svg>
        <input ref={inputRef} value={query} onChange={onChange} onFocus={() => setFocused(true)} onKeyDown={onKeyDown}
          placeholder="Search pages… (Ctrl+K)"
          style={{ ...S.sans, flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: S.dark, outline: 'none', fontWeight: 400 }} />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
        )}
      </div>
      {showDrop && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: `1px solid #e7e5e4`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 999 }}>
          {results.map((r, i) => (
            <div key={r.route} onClick={() => go(r.route)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: i === idx ? `${S.gold}10` : 'transparent', cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid #f5f4f2' : 'none' }}
              onMouseEnter={() => setIdx(i)}>
              <div>
                <p style={{ ...S.sans, margin: 0, fontSize: 12, fontWeight: 600, color: S.dark }}>{r.label}</p>
                <p style={{ ...S.sans, margin: 0, fontSize: 10, color: S.stone }}>{r.sub}</p>
              </div>
              <span style={{ ...S.sans, fontSize: 9, color: '#a8a29e', letterSpacing: '0.1em' }}>↵</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AppShell({ children, title }) {
  const [collapsed, setCollapsed] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)
  const current = window.location.pathname
  const user = JSON.parse(localStorage.getItem('es_user') || '{}')
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const W = collapsed ? 60 : 216

  function doLogout() {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    window.location.href = '/'
  }

  useEffect(() => {
    function onClickOut(e) {
      if (!profileRef.current?.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  const roleLabel = {
    CLIENT: 'Client', DESIGNER: 'Designer', BUILDER: 'Builder',
    WORKSHOP_WORKER: 'Worker', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', ...S.sans, background: S.light }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{ width: W, background: S.dark, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.22s ease', overflow: 'hidden', position: 'relative' }}>

        {/* Logo — click to go home */}
        <div
          onClick={() => window.location.href = '/'}
          style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '0 14px' : '0 16px', borderBottom: `1px solid ${S.border}`, flexShrink: 0, cursor: 'pointer' }}
          title="Go to homepage">
          <div style={{ width: 30, height: 30, border: `1px solid ${S.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={S.gold} strokeWidth="1.3" fill="none"/>
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ ...S.serif, margin: 0, fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>El Shaddai</p>
              <p style={{ margin: 0, fontSize: 8.5, color: S.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 1 }}>Design Platform</p>
            </div>
          )}
          <button onClick={e => { e.stopPropagation(); setCollapsed(c => !c) }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#57534e', cursor: 'pointer', fontSize: 14, lineHeight: 1, flexShrink: 0, padding: 4 }}>
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 6px', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(n => {
            const active = current === n.path || (n.path !== '/' && current.startsWith(n.path))
            return (
              <button key={n.path} onClick={() => window.location.href = n.path} title={n.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: collapsed ? '10px 15px' : '9px 12px',
                  background: active ? 'rgba(201,162,39,0.08)' : 'transparent',
                  border: 'none', borderLeft: `2px solid ${active ? S.gold : 'transparent'}`,
                  color: active ? S.gold : '#78716c', cursor: 'pointer',
                  marginBottom: 1, textAlign: 'left', ...S.sans, fontSize: 12, fontWeight: active ? 600 : 400,
                  letterSpacing: '0.06em', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e7e5e4' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716c' } }}>
                <span style={{ fontSize: 13, flexShrink: 0, opacity: active ? 1 : 0.7 }}>{n.icon}</span>
                {!collapsed && <span style={{ textTransform: 'uppercase', fontSize: 11 }}>{n.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User section */}
        {user.name ? (
          <div style={{ padding: collapsed ? '12px 10px' : '12px', borderTop: `1px solid ${S.border}`, flexShrink: 0 }}>
            {collapsed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, background: S.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 11, cursor: 'pointer' }} title={user.name}>
                  {initials}
                </div>
                <button onClick={doLogout} title="Sign out"
                  style={{ background: 'none', border: `1px solid #3a3734`, color: '#78716c', cursor: 'pointer', fontSize: 10, padding: '4px 6px', width: 30 }}>⎋</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 30, height: 30, background: S.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#e7e5e4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: 8.5, color: S.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{roleLabel[user.role] || user.role}</p>
                </div>
                <button onClick={doLogout} title="Sign out"
                  style={{ background: 'none', border: 'none', color: '#57534e', cursor: 'pointer', fontSize: 13, padding: 4, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#57534e'}>⎋</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: collapsed ? '12px 10px' : '12px', borderTop: `1px solid ${S.border}`, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            {collapsed ? (
              <button onClick={() => window.location.href = '/login'}
                style={{ background: S.gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 12, fontWeight: 700, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Sign In">→</button>
            ) : (
              <>
                <button onClick={() => window.location.href = '/login'}
                  style={{ ...S.sans, padding: '9px', background: S.gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Sign In →
                </button>
                <button onClick={() => window.location.href = '/register'}
                  style={{ ...S.sans, padding: '9px', background: 'transparent', border: `1px solid ${S.border}`, color: '#78716c', cursor: 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ height: 60, background: '#fff', borderBottom: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0 }}>
          <h1 style={{ ...S.serif, margin: 0, fontSize: 20, fontWeight: 400, color: S.dark, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{title}</h1>

          <div style={{ flex: 1 }} />

          {/* Search — only when logged in */}
          {user.name && <SearchBar />}

          {/* User area */}
          {user.name ? (
            <div ref={profileRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* name + role */}
              <div style={{ textAlign: 'right' }}>
                <p style={{ ...S.sans, margin: 0, fontSize: 12, fontWeight: 600, color: S.dark }}>{user.name}</p>
                <p style={{ ...S.sans, margin: 0, fontSize: 9, color: S.stone, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{roleLabel[user.role] || user.role}</p>
              </div>

              {/* Avatar — click to show logout dropdown */}
              <button onClick={() => setShowProfile(v => !v)}
                style={{ width: 34, height: 34, background: S.gold, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#000', flexShrink: 0 }}>
                {initials}
              </button>

              {/* Profile dropdown */}
              {showProfile && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: '#fff', border: '1px solid #e7e5e4', boxShadow: '0 8px 28px rgba(0,0,0,0.12)', zIndex: 999 }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0ede9' }}>
                    <p style={{ ...S.sans, margin: 0, fontSize: 12, fontWeight: 600, color: S.dark }}>{user.name}</p>
                    <p style={{ ...S.sans, margin: '2px 0 0', fontSize: 10, color: S.stone }}>{user.email}</p>
                  </div>
                  {[
                    { label: 'My Profile', route: '/settings' },
                    { label: 'Dashboard',  route: '/dashboard' },
                    { label: 'Notifications', route: '/notifications' },
                  ].map(item => (
                    <button key={item.route} onClick={() => { window.location.href = item.route; setShowProfile(false) }}
                      style={{ ...S.sans, display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12, color: S.dark, cursor: 'pointer', borderBottom: '1px solid #f5f4f2' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      {item.label}
                    </button>
                  ))}
                  <button onClick={doLogout}
                    style={{ ...S.sans, display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12, color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    ⎋ Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => window.location.href = '/login'}
              style={{ ...S.sans, padding: '8px 18px', background: S.gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Sign In →
            </button>
          )}
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
