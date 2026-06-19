import { useState, useEffect, useRef } from 'react'

const NAV_LINKS = [
  { label: 'Studio',    href: '/studio'    },
  { label: 'Services',  href: '#services'  },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Contact',   href: '#contact'   },
]

const SEARCH_INDEX = [
  { label: 'Dashboard',     sub: 'Main overview',         route: '/dashboard'      },
  { label: 'Projects',      sub: 'All projects',          route: '/projects'       },
  { label: 'Designer',      sub: '2D / 3D design studio', route: '/designer'       },
  { label: 'AI Design',     sub: 'AI room generator',     route: '/ai-design'      },
  { label: 'Tracking',      sub: 'Site tracker',          route: '/tracking'       },
  { label: 'Financial',     sub: 'Quotes & invoices',     route: '/financial'      },
  { label: 'Task Manager',  sub: 'Tasks & deadlines',     route: '/tasks'          },
  { label: 'Calendar',      sub: 'Meetings & milestones', route: '/calendar'       },
  { label: 'Inventory',     sub: 'Material stock',        route: '/inventory'      },
  { label: 'Employees',     sub: 'Staff directory',       route: '/employees'      },
  { label: 'Vendor Portal', sub: 'POs & vendors',         route: '/vendor-portal'  },
  { label: 'Contracts',     sub: 'E-sign contracts',      route: '/contracts'      },
  { label: 'Pricing',       sub: 'Plan & pricing',        route: '/pricing'        },
  { label: 'Portfolio',     sub: 'Our work gallery',      route: '/portfolio'      },
  { label: 'Studio',        sub: 'Floor plan & 3D',       route: '/studio'         },
]

const ROLE_LABEL = {
  CLIENT: 'Client', DESIGNER: 'Designer', BUILDER: 'Builder',
  WORKSHOP_WORKER: 'Worker', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
}

const G = '#c9a227'
const D = '#0a0805'
const F = "'DM Sans',system-ui,sans-serif"

function SearchBox({ scrolled }) {
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
    setRes(SEARCH_INDEX.filter(i => i.label.toLowerCase().includes(lo) || i.sub.toLowerCase().includes(lo)).slice(0, 7))
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i+1, res.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i-1, -1)) }
    if (e.key === 'Enter' && idx >= 0) { window.location.href = res[idx].route; setOpen(false) }
    if (e.key === 'Escape') { setOpen(false); setQ('') }
  }

  const tc = scrolled ? '#57534e' : 'rgba(255,255,255,0.7)'
  const bc = open ? G : (scrolled ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)')
  const bg = scrolled ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'

  return (
    <div ref={wrap} style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, background:bg, border:`1px solid ${bc}`, padding:'7px 14px', transition:'border-color 0.2s', minWidth:190 }}>
        <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke={open?G:tc} strokeWidth="1.5"/>
          <path d="M13 13l4 4" stroke={open?G:tc} strokeWidth="1.5" strokeLinecap="square"/>
        </svg>
        <input value={q} onChange={onChange} onFocus={()=>setOpen(true)} onKeyDown={onKey}
          placeholder="Search… (Ctrl+K)"
          style={{ fontFamily:F, background:'transparent', border:'none', outline:'none', fontSize:11, color:tc, width:140, fontWeight:400, letterSpacing:'0.02em' }} />
        {q && <button onClick={()=>{setQ('');setRes([])}} style={{ background:'none', border:'none', color:tc, fontSize:14, lineHeight:1, padding:0, opacity:0.5 }}>×</button>}
      </div>
      {open && res.length > 0 && (
        <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:'#fff', border:'1px solid #e7e5e4', boxShadow:'0 16px 48px rgba(0,0,0,0.14)', zIndex:9999 }}>
          {res.map((r,i) => (
            <div key={r.route} onClick={()=>{window.location.href=r.route;setOpen(false)}}
              onMouseEnter={()=>setIdx(i)}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:i===idx?`${G}10`:'transparent', cursor:'pointer', borderBottom:i<res.length-1?'1px solid #f5f4f2':'none' }}>
              <div>
                <p style={{ fontFamily:F, margin:0, fontSize:12, fontWeight:600, color:D }}>{r.label}</p>
                <p style={{ fontFamily:F, margin:0, fontSize:10, color:'#78716c' }}>{r.sub}</p>
              </div>
              <span style={{ fontFamily:F, fontSize:9, color:'#a8a29e' }}>↵</span>
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
  const [activeLink,setActiveLink]= useState('')
  const userRef = useRef(null)

  const user     = JSON.parse(localStorage.getItem('es_user') || 'null')
  const initials = user ? (user.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const off = e => { if (!userRef.current?.contains(e.target)) setShowUser(false) }
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [])

  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); document.querySelector('.navbar-search input')?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function doLogout() {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    window.location.href = '/'
  }

  const linkColor = scrolled ? '#44403c' : 'rgba(255,255,255,0.8)'

  return (
    <>
      {/* ── Top bar announcement strip ─────────────────────────────────────── */}
      {!scrolled && (
        <div style={{ background:G, padding:'7px 40px', textAlign:'center', position:'fixed', top:0, left:0, right:0, zIndex:9001, display:'flex', alignItems:'center', justifyContent:'center', gap:20 }}>
          <span style={{ fontFamily:F, fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:D }}>
            ✦ Free Design Consultation — Limited slots this week
          </span>
          <a href="#contact" style={{ fontFamily:F, fontSize:10, fontWeight:700, color:D, textDecoration:'underline', letterSpacing:'0.12em', textTransform:'uppercase' }}>Book Now →</a>
        </div>
      )}

      <nav style={{
        position: 'fixed',
        top: scrolled ? 0 : 33,
        left: 0, right: 0,
        zIndex: 9000,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(10,8,5,0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid #e7e5e4' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.08)' : 'none',
        fontFamily: F,
      }}>
        {/* Gold accent line at very bottom of nav on scroll */}
        {scrolled && <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:1, background:`linear-gradient(90deg,transparent,${G},transparent)` }} />}

        <div style={{ maxWidth:1360, margin:'0 auto', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64, gap:24 }}>

          {/* Logo */}
          <a href="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', flexShrink:0 }}>
            <div style={{ width:38, height:38, background:scrolled?D:G, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.3s', flexShrink:0, position:'relative' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/>
                <circle cx="10" cy="8" r="1.8" fill={scrolled?G:D}/>
              </svg>
            </div>
            <div style={{ lineHeight:1.2 }}>
              <span style={{ display:'block', fontFamily:"'Cormorant Garamond',serif", fontSize:19, fontWeight:600, letterSpacing:'0.06em', color:scrolled?D:'#fff', transition:'color 0.3s' }}>El Shaddai</span>
              <span style={{ display:'block', fontSize:8, letterSpacing:'0.32em', textTransform:'uppercase', fontWeight:700, color:scrolled?G:'rgba(201,162,39,0.8)', transition:'color 0.3s' }}>Interiors &amp; Design</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div style={{ display:'flex', alignItems:'center', gap:30 }} className="mobile-hide">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href}
                onMouseEnter={e=>{e.currentTarget.style.color=G; setActiveLink(link.label)}}
                onMouseLeave={e=>{e.currentTarget.style.color=linkColor; setActiveLink('')}}
                style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:700, color:linkColor, transition:'color 0.2s', position:'relative' }}>
                {link.label}
                <span style={{ position:'absolute', bottom:-4, left:0, width:'100%', height:1, background:G, transform:`scaleX(${activeLink===link.label?1:0})`, transformOrigin:'left', transition:'transform 0.2s' }} />
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            {user && <div className="navbar-search mobile-hide"><SearchBox scrolled={scrolled} /></div>}

            {user ? (
              <div ref={userRef} style={{ position:'relative', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ textAlign:'right' }} className="mobile-hide">
                  <p style={{ margin:0, fontSize:11, fontWeight:600, color:scrolled?D:'#fff', letterSpacing:'0.02em' }}>{user.name}</p>
                  <p style={{ margin:0, fontSize:9, color:G, letterSpacing:'0.14em', textTransform:'uppercase' }}>{ROLE_LABEL[user.role]||user.role}</p>
                </div>
                <button onClick={()=>setShowUser(v=>!v)}
                  style={{ width:36, height:36, background:G, border:'none', fontWeight:800, fontSize:12, color:D, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, letterSpacing:'0.04em' }}>
                  {initials}
                </button>

                {showUser && (
                  <div style={{ position:'absolute', top:'calc(100% + 12px)', right:0, width:210, background:'#fff', border:'1px solid #e7e5e4', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', zIndex:9999 }}>
                    <div style={{ padding:'16px 18px', borderBottom:'1px solid #f0ede9' }}>
                      <p style={{ margin:0, fontSize:12, fontWeight:700, color:D }}>{user.name}</p>
                      <p style={{ margin:'2px 0 0', fontSize:10, color:'#78716c' }}>{user.email}</p>
                    </div>
                    {[{label:'Dashboard',route:'/dashboard'},{label:'My Profile',route:'/settings'},{label:'Notifications',route:'/notifications'}].map(item=>(
                      <a key={item.route} href={item.route}
                        style={{ display:'block', padding:'10px 18px', fontSize:12, color:D, borderBottom:'1px solid #f5f4f2', transition:'background 0.15s', letterSpacing:'0.01em' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#fafaf9'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        {item.label}
                      </a>
                    ))}
                    <button onClick={doLogout}
                      style={{ display:'block', width:'100%', padding:'11px 18px', background:'none', border:'none', textAlign:'left', fontSize:12, color:'#ef4444', fontWeight:600 }}
                      onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'}
                      onMouseLeave={e=>e.currentTarget.style.background='none'}>
                      ⎋ Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <a href="/login" className="mobile-hide"
                  style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:700, padding:'9px 18px', border:`1px solid ${scrolled?'rgba(0,0,0,0.18)':'rgba(255,255,255,0.25)'}`, color:scrolled?'#44403c':'rgba(255,255,255,0.8)', transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=G;e.currentTarget.style.color=G}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=scrolled?'rgba(0,0,0,0.18)':'rgba(255,255,255,0.25)';e.currentTarget.style.color=scrolled?'#44403c':'rgba(255,255,255,0.8)'}}>
                  Sign In
                </a>
                <a href="/studio"
                  style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:800, padding:'9px 22px', background:G, color:D, transition:'all 0.2s', whiteSpace:'nowrap' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#e8c84e';e.currentTarget.style.transform='translateY(-1px)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background=G;e.currentTarget.style.transform='none'}}>
                  ✦ Try Free
                </a>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={()=>setMenuOpen(!menuOpen)} aria-label="Menu"
              style={{ display:'none', flexDirection:'column', gap:5, background:'none', border:'none', padding:8 }}
              className="mobile-menu-btn">
              {[0,1,2].map(i=>(
                <span key={i} style={{ display:'block', width:22, height:2, background:scrolled?D:'#fff', transition:'all 0.3s',
                  transform:i===0&&menuOpen?'rotate(45deg) translate(5px,5px)':i===1&&menuOpen?'scaleX(0)':i===2&&menuOpen?'rotate(-45deg) translate(5px,-5px)':'none'
                }}/>
              ))}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ background:scrolled?'#fff':D, borderTop:`1px solid ${scrolled?'#f0ede8':'rgba(255,255,255,0.06)'}`, padding:'24px 28px 32px' }}>
            {NAV_LINKS.map(link=>(
              <a key={link.label} href={link.href} onClick={()=>setMenuOpen(false)}
                style={{ display:'block', padding:'13px 0', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:700, color:scrolled?D:'rgba(255,255,255,0.8)', borderBottom:`1px solid ${scrolled?'#f0ede8':'rgba(255,255,255,0.06)'}` }}>
                {link.label}
              </a>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <a href="/login" style={{ flex:1, textAlign:'center', padding:'12px', border:`1px solid ${scrolled?'#e0ddd8':G}`, color:scrolled?D:'#fff', fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>Sign In</a>
              <a href="/studio" style={{ flex:1, textAlign:'center', padding:'12px', background:G, color:D, fontSize:10, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase' }}>✦ Try Free</a>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
