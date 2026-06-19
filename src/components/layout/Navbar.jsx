import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/* ─── Nav link definitions ────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Studio',    href: '/studio'    },
  { label: 'Services',  href: '/#services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Contact',   href: '/#contact'  },
]

const SEARCH_INDEX = [
  { label: 'Dashboard',      sub: 'Main overview',          route: '/dashboard'      },
  { label: 'Projects',       sub: 'All projects',           route: '/projects'       },
  { label: 'Design Studio',  sub: '2D / 3D floor planner',  route: '/studio'         },
  { label: 'AI Design',      sub: 'AI room generator',      route: '/ai-design'      },
  { label: 'Tracking',       sub: 'Site progress tracker',  route: '/tracking'       },
  { label: 'Financial',      sub: 'Quotes & invoices',      route: '/financial'      },
  { label: 'Task Manager',   sub: 'Tasks & deadlines',      route: '/tasks'          },
  { label: 'Calendar',       sub: 'Meetings & milestones',  route: '/calendar'       },
  { label: 'Inventory',      sub: 'Material stock',         route: '/inventory'      },
  { label: 'Employees',      sub: 'Staff directory',        route: '/employees'      },
  { label: 'Vendor Portal',  sub: 'POs & vendors',          route: '/vendor-portal'  },
  { label: 'Contracts',      sub: 'E-sign contracts',       route: '/contracts'      },
  { label: 'Pricing',        sub: 'Plan & pricing',         route: '/pricing'        },
  { label: 'Portfolio',      sub: 'Our work gallery',       route: '/portfolio'      },
  { label: 'Blog',           sub: 'Design articles',        route: '/blog'           },
]

const ROLE_LABEL = {
  CLIENT: 'Client', DESIGNER: 'Designer', BUILDER: 'Builder',
  WORKSHOP_WORKER: 'Worker', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
}

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const G   = '#c9a227'
const G2  = '#e8c84e'
const D   = '#0a0805'
const F   = "'DM Sans',system-ui,sans-serif"
const FS  = "'Cormorant Garamond',serif"

/* ─── Search box ─────────────────────────────────────────────────────────── */
function SearchBox() {
  const [q,   setQ]   = useState('')
  const [res, setRes] = useState([])
  const [open,setOpen]= useState(false)
  const [idx, setIdx] = useState(-1)
  const wrap = useRef(null)

  useEffect(() => {
    const off = e => { if (!wrap.current?.contains(e.target)) { setOpen(false); setQ('') } }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [])

  function onChange(e) {
    const v = e.target.value; setQ(v); setIdx(-1)
    if (!v.trim()) { setRes([]); return }
    const lo = v.toLowerCase()
    setRes(SEARCH_INDEX.filter(i =>
      i.label.toLowerCase().includes(lo) || i.sub.toLowerCase().includes(lo)
    ).slice(0, 7))
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i+1, res.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i-1, -1)) }
    if (e.key === 'Enter' && idx >= 0) { window.location.href = res[idx].route; setOpen(false) }
    if (e.key === 'Escape') { setOpen(false); setQ('') }
  }

  return (
    <div ref={wrap} style={{ position:'relative' }} className="navbar-search">
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        background:'rgba(255,255,255,0.07)',
        border:`1px solid ${open ? G : 'rgba(255,255,255,0.15)'}`,
        padding:'7px 14px', transition:'border-color 0.2s', minWidth:186,
        backdropFilter:'blur(4px)',
      }}>
        <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke={open ? G : 'rgba(255,255,255,0.5)'} strokeWidth="1.5"/>
          <path d="M13 13l4 4" stroke={open ? G : 'rgba(255,255,255,0.5)'} strokeWidth="1.5" strokeLinecap="square"/>
        </svg>
        <input value={q} onChange={onChange} onFocus={()=>setOpen(true)} onKeyDown={onKey}
          placeholder="Search…  Ctrl+K"
          style={{
            fontFamily:F, background:'transparent', border:'none', outline:'none',
            fontSize:11, color:'rgba(255,255,255,0.85)', width:128, fontWeight:400, letterSpacing:'0.04em',
          }}
        />
        {q && (
          <button onClick={()=>{setQ('');setRes([])}}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:14, lineHeight:1, padding:0, cursor:'pointer' }}>
            ×
          </button>
        )}
      </div>

      {open && res.length > 0 && (
        <div style={{
          position:'absolute', top:'calc(100% + 10px)', left:0, width:280,
          background:'#1c1a24', border:`1px solid rgba(201,162,39,0.3)`,
          boxShadow:'0 24px 64px rgba(0,0,0,0.5)', zIndex:9999,
        }}>
          {res.map((r,i) => (
            <div key={r.route} onClick={()=>{window.location.href=r.route;setOpen(false)}}
              onMouseEnter={()=>setIdx(i)}
              style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'11px 16px',
                background:i===idx?`rgba(201,162,39,0.1)`:'transparent',
                cursor:'pointer',
                borderBottom:i<res.length-1?'1px solid rgba(255,255,255,0.05)':'none',
                transition:'background 0.15s',
              }}>
              <div>
                <p style={{ fontFamily:F, margin:0, fontSize:12, fontWeight:600, color:'#ede9e3' }}>{r.label}</p>
                <p style={{ fontFamily:F, margin:0, fontSize:10, color:'#6b6580' }}>{r.sub}</p>
              </div>
              <span style={{ fontFamily:F, fontSize:10, color:G, opacity:i===idx?1:0, transition:'opacity 0.15s' }}>↵</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Navbar ─────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [showUser,  setShowUser]  = useState(false)
  const [hovered,   setHovered]   = useState('')
  const userRef = useRef(null)
  const location = useLocation()

  const user     = JSON.parse(localStorage.getItem('es_user') || 'null')
  const initials = user ? (user.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const off = e => { if (!userRef.current?.contains(e.target)) setShowUser(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [])

  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey||e.metaKey) && e.key==='k') {
        e.preventDefault()
        document.querySelector('.navbar-search input')?.focus()
      }
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Close mobile menu on route change */
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  function doLogout() {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    window.location.href = '/'
  }

  const isActive = (href) => location.pathname === href || location.pathname === href.replace('/#','')

  return (
    <>
      {/* ── Announcement strip (top gold bar) ────────────────────────────── */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:9002,
        background: `linear-gradient(90deg, ${D} 0%, #1a1208 40%, #1a1208 60%, ${D} 100%)`,
        borderBottom:`1px solid rgba(201,162,39,0.3)`,
        padding:'6px 40px',
        display:'flex', alignItems:'center', justifyContent:'center', gap:32,
        transform: scrolled ? 'translateY(-100%)' : 'translateY(0)',
        transition:'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:G, fontSize:8 }}>◈</span>
          <span style={{ fontFamily:F, fontSize:10, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.75)' }}>
            Free Design Consultation — Limited slots this week
          </span>
          <span style={{ color:G, fontSize:8 }}>◈</span>
        </div>
        <a href="/#contact" style={{
          fontFamily:F, fontSize:9, fontWeight:800, color:G,
          textDecoration:'none', letterSpacing:'0.2em', textTransform:'uppercase',
          padding:'4px 14px', border:`1px solid ${G}`, transition:'all 0.2s',
        }}
          onMouseEnter={e=>{e.currentTarget.style.background=G;e.currentTarget.style.color=D}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=G}}>
          Book Now →
        </a>
      </div>

      {/* ── Main nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position:'fixed',
        top: scrolled ? 0 : 33,
        left:0, right:0,
        zIndex:9001,
        transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        background: scrolled
          ? 'rgba(10,8,5,0.97)'
          : 'rgba(10,8,5,0.82)',
        backdropFilter:'blur(28px)',
        WebkitBackdropFilter:'blur(28px)',
        borderBottom: scrolled
          ? `1px solid rgba(201,162,39,0.25)`
          : `1px solid rgba(255,255,255,0.07)`,
        boxShadow: scrolled ? '0 8px 48px rgba(0,0,0,0.5)' : 'none',
      }}>
        {/* Gold shimmer line on scroll */}
        {scrolled && (
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:1,
            background:`linear-gradient(90deg, transparent 0%, ${G} 30%, ${G2} 50%, ${G} 70%, transparent 100%)`,
            opacity:0.6,
          }} />
        )}

        <div style={{
          maxWidth:1400, margin:'0 auto', padding:'0 40px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          height:64, gap:24,
        }}>

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <a href="/" style={{ display:'flex', alignItems:'center', gap:13, textDecoration:'none', flexShrink:0 }}>
            {/* Icon mark */}
            <div style={{
              width:40, height:40,
              background:`linear-gradient(135deg, ${G} 0%, ${G2} 50%, ${G} 100%)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, position:'relative',
              boxShadow:`0 4px 20px rgba(201,162,39,0.35)`,
            }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L20 8.8V20H15V13H7V20H2V8.8L11 2Z" fill={D} opacity="0.9"/>
                <circle cx="11" cy="8.5" r="2" fill={D}/>
                <path d="M7 13H15" stroke={D} strokeWidth="0.8" opacity="0.5"/>
              </svg>
            </div>
            {/* Word mark */}
            <div style={{ lineHeight:1.15 }}>
              <span style={{
                display:'block', fontFamily:FS, fontSize:21, fontWeight:600,
                letterSpacing:'0.04em', color:'#fff',
                textShadow:`0 0 30px rgba(201,162,39,0.4)`,
              }}>
                El Shaddai
              </span>
              <span style={{
                display:'block', fontSize:7.5, letterSpacing:'0.38em', textTransform:'uppercase',
                fontWeight:800, color:G, fontFamily:F,
              }}>
                Interiors &amp; Design
              </span>
            </div>
          </a>

          {/* ── Desktop nav links ─────────────────────────────────────────── */}
          <div style={{ display:'flex', alignItems:'center', gap:0 }} className="desktop-nav">
            {NAV_LINKS.map(link => {
              const active = isActive(link.href)
              return (
                <a key={link.label} href={link.href}
                  onMouseEnter={()=>setHovered(link.label)}
                  onMouseLeave={()=>setHovered('')}
                  style={{
                    fontFamily:F, fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase',
                    fontWeight:700, color: active ? G : hovered===link.label ? G : 'rgba(255,255,255,0.72)',
                    transition:'color 0.2s', position:'relative', padding:'22px 16px',
                    textDecoration:'none', display:'block',
                  }}>
                  {link.label}
                  {/* Animated underline */}
                  <span style={{
                    position:'absolute', bottom:16, left:16, right:16, height:1,
                    background:`linear-gradient(90deg, ${G}, ${G2})`,
                    transform:`scaleX(${active || hovered===link.label ? 1 : 0})`,
                    transformOrigin:'left', transition:'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                  }}/>
                </a>
              )
            })}
          </div>

          {/* ── Right side ────────────────────────────────────────────────── */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            {/* Search — only when logged in on desktop */}
            {user && <div className="desktop-only"><SearchBox /></div>}

            {user ? (
              /* ── Logged-in user ───────────────────────────────────────── */
              <div ref={userRef} style={{ position:'relative', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ textAlign:'right' }} className="desktop-only">
                  <p style={{ margin:0, fontSize:11, fontWeight:700, color:'#fff', letterSpacing:'0.02em' }}>{user.name}</p>
                  <p style={{ margin:0, fontSize:9, color:G, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:F }}>{ROLE_LABEL[user.role]||user.role}</p>
                </div>
                <button onClick={()=>setShowUser(v=>!v)}
                  style={{
                    width:38, height:38, background:`linear-gradient(135deg,${G},${G2})`,
                    border:'none', fontFamily:F, fontWeight:900, fontSize:12, color:D,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    letterSpacing:'0.04em', cursor:'pointer',
                    boxShadow:`0 4px 16px rgba(201,162,39,0.4)`,
                    transition:'transform 0.2s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                  {initials}
                </button>

                {showUser && (
                  <div style={{
                    position:'absolute', top:'calc(100% + 14px)', right:0, width:230,
                    background:'#14121a', border:`1px solid rgba(201,162,39,0.25)`,
                    boxShadow:'0 24px 64px rgba(0,0,0,0.6)', zIndex:9999,
                  }}>
                    <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#fff', fontFamily:F }}>{user.name}</p>
                      <p style={{ margin:'3px 0 0', fontSize:10, color:'#6b6580', fontFamily:F }}>{user.email}</p>
                      <span style={{ display:'inline-block', marginTop:6, fontSize:8, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', color:G, background:`rgba(201,162,39,0.12)`, padding:'3px 8px', fontFamily:F }}>
                        {ROLE_LABEL[user.role]||user.role}
                      </span>
                    </div>
                    {[
                      { label:'⊞  Dashboard',    route:'/dashboard'     },
                      { label:'◈  Design Studio', route:'/studio'        },
                      { label:'◻  My Profile',    route:'/settings'      },
                      { label:'⊕  Notifications', route:'/notifications' },
                    ].map(item=>(
                      <a key={item.route} href={item.route}
                        style={{
                          display:'block', padding:'11px 18px', fontFamily:F, fontSize:11,
                          color:'rgba(255,255,255,0.75)', borderBottom:'1px solid rgba(255,255,255,0.04)',
                          transition:'all 0.15s', textDecoration:'none', letterSpacing:'0.04em',
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(201,162,39,0.08)';e.currentTarget.style.color=G}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.75)'}}>
                        {item.label}
                      </a>
                    ))}
                    <button onClick={doLogout}
                      style={{
                        display:'block', width:'100%', padding:'12px 18px', background:'none',
                        border:'none', textAlign:'left', fontFamily:F, fontSize:11, color:'#ef4444',
                        fontWeight:600, letterSpacing:'0.04em', cursor:'pointer', transition:'background 0.15s',
                      }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                      onMouseLeave={e=>e.currentTarget.style.background='none'}>
                      ⎋  Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest CTAs ────────────────────────────────────────────── */
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <a href="/login" className="desktop-only"
                  style={{
                    fontFamily:F, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:700,
                    padding:'9px 20px', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.75)',
                    transition:'all 0.2s', textDecoration:'none', display:'block',
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=G;e.currentTarget.style.color=G}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';e.currentTarget.style.color='rgba(255,255,255,0.75)'}}>
                  Sign In
                </a>
                <a href="/studio"
                  style={{
                    fontFamily:F, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:800,
                    padding:'9px 22px',
                    background:`linear-gradient(135deg, ${G} 0%, ${G2} 50%, ${G} 100%)`,
                    backgroundSize:'200% auto',
                    color:D, transition:'all 0.3s', whiteSpace:'nowrap', textDecoration:'none', display:'block',
                    boxShadow:`0 4px 20px rgba(201,162,39,0.4)`,
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.backgroundPosition='right';e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow=`0 8px 28px rgba(201,162,39,0.55)`}}
                  onMouseLeave={e=>{e.currentTarget.style.backgroundPosition='left';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=`0 4px 20px rgba(201,162,39,0.4)`}}>
                  ✦ Try Free
                </a>
              </div>
            )}

            {/* ── Mobile hamburger ──────────────────────────────────────── */}
            <button onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle menu"
              className="mobile-hamburger"
              style={{
                display:'flex', flexDirection:'column', justifyContent:'center',
                gap:5, background:'none', border:`1px solid rgba(255,255,255,0.12)`,
                padding:'10px 12px', cursor:'pointer', transition:'border-color 0.2s',
              }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=G}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'}>
              {[0,1,2].map(i=>(
                <span key={i} style={{
                  display:'block', width:20, height:1.5, background: menuOpen ? G : 'rgba(255,255,255,0.8)',
                  transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  transform:
                    i===0 && menuOpen ? 'rotate(45deg) translate(4.5px,4.5px)' :
                    i===1 && menuOpen ? 'scaleX(0)' :
                    i===2 && menuOpen ? 'rotate(-45deg) translate(4.5px,-4.5px)' : 'none',
                }}/>
              ))}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ───────────────────────────────────────────────── */}
        <div style={{
          maxHeight: menuOpen ? '600px' : '0',
          overflow:'hidden',
          transition:'max-height 0.45s cubic-bezier(0.4,0,0.2,1)',
          background:'rgba(10,8,5,0.98)',
          borderTop: menuOpen ? `1px solid rgba(201,162,39,0.15)` : 'none',
        }}>
          <div style={{ padding:'20px 28px 32px' }}>
            {/* Mobile search */}
            <div style={{ marginBottom:20 }}>
              <SearchBox />
            </div>

            {/* Nav links */}
            {NAV_LINKS.map((link, i) => (
              <a key={link.label} href={link.href} onClick={()=>setMenuOpen(false)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'15px 0', fontFamily:F, fontSize:13, letterSpacing:'0.18em',
                  textTransform:'uppercase', fontWeight:700,
                  color: isActive(link.href) ? G : 'rgba(255,255,255,0.8)',
                  borderBottom:`1px solid rgba(255,255,255,0.06)`,
                  textDecoration:'none',
                  animationDelay:`${i*40}ms`,
                }}>
                {link.label}
                <span style={{ color:G, fontSize:12, opacity:0.6 }}>→</span>
              </a>
            ))}

            {/* Mobile CTAs */}
            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <a href="/login" onClick={()=>setMenuOpen(false)}
                style={{
                  flex:1, textAlign:'center', padding:'13px', fontFamily:F,
                  border:`1px solid rgba(255,255,255,0.2)`, color:'rgba(255,255,255,0.8)',
                  fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', textDecoration:'none',
                }}>
                Sign In
              </a>
              <a href="/studio" onClick={()=>setMenuOpen(false)}
                style={{
                  flex:1, textAlign:'center', padding:'13px', fontFamily:F,
                  background:`linear-gradient(135deg,${G},${G2})`, color:D,
                  fontSize:10, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', textDecoration:'none',
                }}>
                ✦ Try Free
              </a>
            </div>

            {/* Mobile user info if logged in */}
            {user && (
              <div style={{ marginTop:20, padding:'16px', background:'rgba(201,162,39,0.07)', border:`1px solid rgba(201,162,39,0.2)` }}>
                <p style={{ fontFamily:F, color:'#fff', fontSize:12, margin:'0 0 4px', fontWeight:700 }}>{user.name}</p>
                <p style={{ fontFamily:F, color:G, fontSize:9, margin:'0 0 12px', letterSpacing:'0.18em', textTransform:'uppercase' }}>{ROLE_LABEL[user.role]||user.role}</p>
                <div style={{ display:'flex', gap:8 }}>
                  <a href="/dashboard" style={{ flex:1, textAlign:'center', padding:'9px', fontFamily:F, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none' }}>Dashboard</a>
                  <button onClick={doLogout} style={{ flex:1, padding:'9px', fontFamily:F, background:'rgba(239,68,68,0.12)', color:'#ef4444', border:'none', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
