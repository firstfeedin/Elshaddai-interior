import { useState, useEffect, useRef } from 'react'

const navLinks = [
  { label: 'Home',         href: '/'              },
  { label: 'Services',     href: '#services'      },
  { label: 'Portfolio',    href: '#portfolio'     },
  { label: 'Pricing',      href: '/pricing'       },
  { label: 'How It Works', href: '#how-it-works'  },
  { label: 'About Us',     href: '#about'         },
  { label: 'Contact',      href: '#contact'       },
]

const SEARCH_INDEX = [
  { label:'Dashboard',       sub:'Main overview',             route:'/dashboard'     },
  { label:'Projects',        sub:'All projects',              route:'/projects'      },
  { label:'Designer',        sub:'2D / 3D design studio',     route:'/designer'      },
  { label:'AI Design',       sub:'AI room generator',         route:'/ai-design'     },
  { label:'Tracking',        sub:'Site tracker',              route:'/tracking'      },
  { label:'Financial',       sub:'Quotes & invoices',         route:'/financial'     },
  { label:'Task Manager',    sub:'Tasks & deadlines',         route:'/tasks'         },
  { label:'Calendar',        sub:'Meetings & milestones',     route:'/calendar'      },
  { label:'Inventory',       sub:'Material stock',            route:'/inventory'     },
  { label:'Employees',       sub:'Staff directory',           route:'/employees'     },
  { label:'Vendor Portal',   sub:'POs & vendors',             route:'/vendor-portal' },
  { label:'Contracts',       sub:'E-sign contracts',          route:'/contracts'     },
  { label:'Documents',       sub:'Project files',             route:'/documents'     },
  { label:'Reports',         sub:'Analytics',                 route:'/reports'       },
  { label:'Settings',        sub:'Profile & company',         route:'/settings'      },
  { label:'Notifications',   sub:'Alerts & messages',         route:'/notifications' },
  { label:'Client Portal',   sub:'Client project view',       route:'/client-portal' },
  { label:'Pricing',         sub:'Plan & pricing',            route:'/pricing'       },
  { label:'Portfolio',       sub:'Our work gallery',          route:'/portfolio'     },
]

const gold = '#c9a227'
const dark = '#1c1917'
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" }

function NavSearch({ scrolled }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [open,    setOpen]    = useState(false)
  const [idx,     setIdx]     = useState(-1)
  const wrapRef   = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    function onClickOut(e) {
      if (!wrapRef.current?.contains(e.target)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  function onChange(e) {
    const q = e.target.value
    setQuery(q); setIdx(-1)
    if (!q.trim()) { setResults([]); return }
    const low = q.toLowerCase()
    setResults(SEARCH_INDEX.filter(i => i.label.toLowerCase().includes(low) || i.sub.toLowerCase().includes(low)).slice(0, 7))
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i+1, results.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i-1, -1)) }
    if (e.key === 'Enter' && idx >= 0) { window.location.href = results[idx].route; setOpen(false) }
    if (e.key === 'Escape')    { setOpen(false); setQuery('') }
  }

  const textColor  = scrolled ? '#44403c' : 'rgba(255,255,255,0.85)'
  const borderColor = scrolled ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'
  const bg         = scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)'

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: bg, border: `1px solid ${open ? gold : borderColor}`, padding: '6px 12px', transition: 'border-color 0.15s', minWidth: 200 }}>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke={open ? gold : textColor} strokeWidth="1.5"/>
          <path d="M13 13l4 4" stroke={open ? gold : textColor} strokeWidth="1.5" strokeLinecap="square"/>
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={onChange}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search… (Ctrl+K)"
          style={{ ...sans, background: 'transparent', border: 'none', outline: 'none', fontSize: 11, color: textColor, width: 150, fontWeight: 400 }} />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor, fontSize: 13, lineHeight: 1, padding: 0, opacity: 0.6 }}>×</button>
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '1px solid #e7e5e4', boxShadow: '0 8px 28px rgba(0,0,0,0.14)', zIndex: 9999 }}>
          {results.map((r, i) => (
            <div key={r.route} onClick={() => { window.location.href = r.route; setOpen(false) }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: i === idx ? `${gold}12` : 'transparent', cursor: 'pointer', borderBottom: i < results.length-1 ? '1px solid #f5f4f2' : 'none' }}
              onMouseEnter={() => setIdx(i)}>
              <div>
                <p style={{ ...sans, margin: 0, fontSize: 12, fontWeight: 600, color: dark }}>{r.label}</p>
                <p style={{ ...sans, margin: 0, fontSize: 10, color: '#78716c' }}>{r.sub}</p>
              </div>
              <span style={{ ...sans, fontSize: 9, color: '#a8a29e' }}>↵</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [showUser,  setShowUser]  = useState(false)
  const userRef = useRef(null)

  const user     = JSON.parse(localStorage.getItem('es_user') || 'null')
  const initials = user ? (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onClickOut(e) {
      if (!userRef.current?.contains(e.target)) setShowUser(false)
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  function doLogout() {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    window.location.href = '/'
  }

  const roleLabel = {
    CLIENT: 'Client', DESIGNER: 'Designer', BUILDER: 'Builder',
    WORKSHOP_WORKER: 'Worker', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9000,
      transition: 'all 0.35s',
      background: scrolled ? '#fff' : 'rgba(15,12,8,0.88)',
      backdropFilter: scrolled ? 'none' : 'blur(12px)',
      borderBottom: scrolled ? '1px solid #e7e5e4' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
      padding: scrolled ? '10px 0' : '14px 0',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

        {/* Logo — click to go homepage */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, background: scrolled ? dark : gold, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/>
              <circle cx="10" cy="8" r="2" fill={scrolled ? '#c9a227' : dark}/>
            </svg>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <span style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, letterSpacing: '0.04em', color: scrolled ? dark : '#fff', transition: 'color 0.3s' }}>El Shaddai</span>
            <span style={{ display: 'block', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600, color: scrolled ? gold : 'rgba(201,162,39,0.85)', transition: 'color 0.3s' }}>Interiors &amp; Design</span>
          </div>
        </a>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {navLinks.map(link => (
            <a key={link.label} href={link.href}
              style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none', color: scrolled ? '#57534e' : 'rgba(255,255,255,0.85)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = gold}
              onMouseLeave={e => e.currentTarget.style.color = scrolled ? '#57534e' : 'rgba(255,255,255,0.85)'}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side: search (only logged in) + user/auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {user && <NavSearch scrolled={scrolled} />}

          {user ? (
            /* Logged-in: avatar + name + dropdown */
            <div ref={userRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ ...sans, margin: 0, fontSize: 11, fontWeight: 600, color: scrolled ? dark : '#fff', letterSpacing: '0.02em' }}>{user.name}</p>
                <p style={{ ...sans, margin: 0, fontSize: 9, color: gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{roleLabel[user.role] || user.role}</p>
              </div>
              <button onClick={() => setShowUser(v => !v)}
                style={{ width: 36, height: 36, background: gold, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, color: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {initials}
              </button>

              {showUser && (
                <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 200, background: '#fff', border: '1px solid #e7e5e4', boxShadow: '0 8px 28px rgba(0,0,0,0.13)', zIndex: 9999 }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0ede9' }}>
                    <p style={{ ...sans, margin: 0, fontSize: 12, fontWeight: 600, color: dark }}>{user.name}</p>
                    <p style={{ ...sans, margin: '2px 0 0', fontSize: 10, color: '#78716c' }}>{user.email}</p>
                  </div>
                  {[
                    { label: 'Dashboard',    route: '/dashboard'     },
                    { label: 'My Profile',   route: '/settings'      },
                    { label: 'Notifications',route: '/notifications'  },
                  ].map(item => (
                    <a key={item.route} href={item.route}
                      style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', fontSize: 12, color: dark, borderBottom: '1px solid #f5f4f2', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {item.label}
                    </a>
                  ))}
                  <button onClick={doLogout}
                    style={{ ...sans, display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12, color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    ⎋ Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in: Login + Register buttons */
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <a href="/login"
                style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none', padding: '8px 16px', border: `1px solid ${scrolled ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)'}`, color: scrolled ? '#44403c' : 'rgba(255,255,255,0.85)', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = scrolled ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = scrolled ? '#44403c' : 'rgba(255,255,255,0.85)' }}>
                Sign In
              </a>
              <a href="/register"
                style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none', padding: '8px 18px', background: gold, color: dark, transition: 'background 0.2s', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.background = '#b8902a'}
                onMouseLeave={e => e.currentTarget.style.background = gold}>
                ✦ Get Started
              </a>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button style={{ display: 'none', padding: 8, flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn">
          {[0,1,2].map(i => (
            <span key={i} style={{ display: 'block', width: 22, height: 2, background: scrolled ? dark : '#fff', transition: 'all 0.3s', transform: i===0&&menuOpen?'rotate(45deg) translate(5px,5px)':i===1&&menuOpen?'scaleX(0)':i===2&&menuOpen?'rotate(-45deg) translate(5px,-5px)':'none' }} />
          ))}
        </button>
      </div>
    </nav>
  )
}
