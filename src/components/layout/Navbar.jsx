import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Studio',    href: '/studio'    },
  { label: 'Gallery',   href: '/gallery'   },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing',   href: '/pricing'   },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Contact',   href: '/#contact'  },
]

const SEARCH_INDEX = [
  { label: 'Design Studio',  sub: '2D / 3D floor planner',  route: '/studio'         },
  { label: 'AI Design',      sub: 'AI room generator',      route: '/ai-design'      },
  { label: 'Portfolio',      sub: 'Our work gallery',       route: '/portfolio'      },
  { label: 'Pricing',        sub: 'Plan & pricing',         route: '/pricing'        },
  { label: 'Blog',           sub: 'Design articles',        route: '/blog'           },
  { label: 'Dashboard',      sub: 'Main overview',          route: '/dashboard'      },
  { label: 'Projects',       sub: 'All projects',           route: '/projects'       },
  { label: 'Tracking',       sub: 'Site progress tracker',  route: '/tracking'       },
]

const ROLE_LABEL = {
  CLIENT: 'Client', DESIGNER: 'Designer', BUILDER: 'Builder',
  WORKSHOP_WORKER: 'Worker', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
}

const GOLD = '#c4956a'
const F    = "'DM Sans',system-ui,sans-serif"
const FS   = "'Cormorant Garamond',serif"

/* ─── Search ─────────────────────────────────────────────────────────────── */
function SearchBox({ dark }) {
  const [q,    setQ]    = useState('')
  const [res,  setRes]  = useState([])
  const [open, setOpen] = useState(false)
  const [idx,  setIdx]  = useState(-1)
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

  const textColor = dark ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)'
  const borderColor = open ? GOLD : (dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)')

  return (
    <div ref={wrap} style={{ position:'relative' }} className="navbar-search">
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        border:`1px solid ${borderColor}`,
        padding:'7px 13px', transition:'all 0.2s', minWidth:180, borderRadius:2,
      }}>
        <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke={open ? GOLD : textColor} strokeWidth="1.5"/>
          <path d="M13 13l4 4" stroke={open ? GOLD : textColor} strokeWidth="1.5" strokeLinecap="square"/>
        </svg>
        <input value={q} onChange={onChange} onFocus={()=>setOpen(true)} onKeyDown={onKey}
          placeholder="Search…  Ctrl+K"
          style={{
            fontFamily:F, background:'transparent', border:'none', outline:'none',
            fontSize:11, color: dark ? 'rgba(255,255,255,0.85)' : '#1a1a1a',
            width:130, fontWeight:400, letterSpacing:'0.04em',
          }}
        />
        {q && (
          <button onClick={()=>{setQ('');setRes([])}}
            style={{ background:'none', border:'none', color:textColor, fontSize:14, padding:0, cursor:'pointer' }}>×</button>
        )}
      </div>
      {open && res.length > 0 && (
        <div style={{
          position:'absolute', top:'calc(100% + 8px)', left:0, width:280,
          background:'#fff', border:'1px solid #e8e0d8',
          boxShadow:'0 16px 48px rgba(0,0,0,0.12)', zIndex:9999, borderRadius:4,
        }}>
          {res.map((r,i) => (
            <div key={r.route} onClick={()=>{window.location.href=r.route;setOpen(false)}}
              onMouseEnter={()=>setIdx(i)}
              style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'11px 16px',
                background: i===idx ? '#faf7f4' : 'transparent',
                cursor:'pointer',
                borderBottom: i<res.length-1 ? '1px solid #f0ebe6' : 'none',
                transition:'background 0.12s',
              }}>
              <div>
                <p style={{ fontFamily:F, margin:0, fontSize:12, fontWeight:600, color:'#1a1a1a' }}>{r.label}</p>
                <p style={{ fontFamily:F, margin:0, fontSize:10, color:'#888880' }}>{r.sub}</p>
              </div>
              <span style={{ fontSize:10, color:GOLD, opacity:i===idx?1:0, transition:'opacity 0.12s' }}>↵</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Navbar ─────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState('')
  const location = useLocation()

  const user     = JSON.parse(localStorage.getItem('es_user') || 'null')
  const initials = user ? (user.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : ''

  const isHero = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
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

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  function doLogout() {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    window.location.href = '/'
  }

  const isActive = href => location.pathname === href || location.pathname === href.replace('/#','')

  /* On hero: dark (transparent overlay) → becomes white on scroll */
  const dark    = isHero && !scrolled
  const linkClr = dark ? 'rgba(255,255,255,0.85)' : '#1a1a1a'
  const logoClr = dark ? '#ffffff' : '#0a0a0a'

  return (
    <>
      {/* ── Slim announcement strip ────────────────────────────────────────── */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:9002,
        background: '#0a0a0a',
        padding:'7px 40px',
        display:'flex', alignItems:'center', justifyContent:'center', gap:28,
        transform: scrolled ? 'translateY(-100%)' : 'translateY(0)',
        transition:'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <span style={{ fontFamily:F, fontSize:10, fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)' }}>
          Free Design Consultation — No signup required
        </span>
        <a href="/#contact" style={{
          fontFamily:F, fontSize:9, fontWeight:700, color:GOLD,
          textDecoration:'none', letterSpacing:'0.16em', textTransform:'uppercase',
          padding:'3px 12px', border:`1px solid ${GOLD}`, transition:'all 0.2s', borderRadius:1,
        }}
          onMouseEnter={e=>{e.currentTarget.style.background=GOLD;e.currentTarget.style.color='#0a0a0a'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=GOLD}}>
          Book Now →
        </a>
      </div>

      {/* ── Main nav ──────────────────────────────────────────────────────── */}
      <nav style={{
        position:'fixed',
        top: scrolled ? 0 : 33,
        left:0, right:0, zIndex:9001,
        transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        background: scrolled
          ? 'rgba(255,255,255,0.98)'
          : dark
            ? 'rgba(0,0,0,0.18)'
            : 'rgba(255,255,255,0.95)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(0,0,0,0.08)'
          : dark
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.06)',
        boxShadow: scrolled ? '0 2px 32px rgba(0,0,0,0.08)' : 'none',
      }}>

        <div style={{
          maxWidth:1400, margin:'0 auto', padding:'0 40px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          height:64, gap:24,
        }}>

          {/* ── Logo ───────────────────────────────────────────────────────── */}
          <a href="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', flexShrink:0 }}>
            <div style={{
              width:38, height:38,
              background: GOLD,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L20 8.8V20H15V13H7V20H2V8.8L11 2Z" fill="#fff"/>
                <circle cx="11" cy="8.5" r="1.8" fill="rgba(255,255,255,0.5)"/>
              </svg>
            </div>
            <div style={{ lineHeight:1.15 }}>
              <span style={{
                display:'block', fontFamily:FS, fontSize:20, fontWeight:500,
                letterSpacing:'0.03em', color: logoClr, transition:'color 0.3s',
              }}>El Shaddai</span>
              <span style={{
                display:'block', fontSize:7, letterSpacing:'0.32em', textTransform:'uppercase',
                fontWeight:700, color:GOLD, fontFamily:F,
              }}>Interiors &amp; Design</span>
            </div>
          </a>

          {/* ── Desktop nav links ──────────────────────────────────────────── */}
          <div style={{ display:'flex', alignItems:'center', gap:0 }} className="desktop-nav">
            {NAV_LINKS.map(link => {
              const active = isActive(link.href)
              return (
                <a key={link.label} href={link.href}
                  onMouseEnter={()=>setHovered(link.label)}
                  onMouseLeave={()=>setHovered('')}
                  style={{
                    fontFamily:F, fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase',
                    fontWeight:600,
                    color: active ? GOLD : hovered===link.label ? '#0a0a0a' : linkClr,
                    transition:'color 0.2s', position:'relative', padding:'22px 15px',
                    textDecoration:'none', display:'block',
                  }}>
                  {link.label}
                  <span style={{
                    position:'absolute', bottom:14, left:15, right:15, height:1,
                    background: GOLD,
                    transform:`scaleX(${active || hovered===link.label ? 1 : 0})`,
                    transformOrigin:'left', transition:'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                  }}/>
                </a>
              )
            })}
          </div>

          {/* ── Right side ─────────────────────────────────────────────────── */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div className="desktop-only"><SearchBox dark={dark} /></div>

            {user ? (
              <div style={{ display:'flex', alignItems:'center', gap:4 }} className="desktop-only">
                {[
                  { label:'Dashboard',     href:'/dashboard'     },
                  { label:'Studio',        href:'/studio'        },
                  { label:'Profile',       href:'/settings'      },
                  { label:'Notifications', href:'/notifications' },
                ].map(item => {
                  const active = isActive(item.href)
                  return (
                    <a key={item.href} href={item.href}
                      style={{
                        fontFamily:F, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase',
                        fontWeight:600, color: active ? GOLD : linkClr,
                        padding:'22px 12px', textDecoration:'none', position:'relative',
                        transition:'color 0.2s', display:'block',
                      }}
                      onMouseEnter={e=>e.currentTarget.style.color=GOLD}
                      onMouseLeave={e=>e.currentTarget.style.color=active?GOLD:linkClr}>
                      {item.label}
                      <span style={{
                        position:'absolute', bottom:14, left:12, right:12, height:1,
                        background:GOLD, transform:`scaleX(${active?1:0})`,
                        transformOrigin:'left', transition:'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                      }}/>
                    </a>
                  )
                })}
                <div style={{ width:1, height:18, background:'rgba(0,0,0,0.1)', margin:'0 4px' }} />
                <div style={{
                  width:30, height:30, background:GOLD,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:F, fontWeight:800, fontSize:10, color:'#fff', flexShrink:0,
                }}>{initials}</div>
                <button onClick={doLogout}
                  style={{
                    fontFamily:F, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase',
                    fontWeight:600, color:'#ef4444', background:'none',
                    border:'1px solid rgba(239,68,68,0.3)', cursor:'pointer',
                    padding:'7px 14px', marginLeft:4, transition:'all 0.2s', borderRadius:2,
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='none'}}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <a href="/login" className="desktop-only"
                  style={{
                    fontFamily:F, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:600,
                    padding:'8px 18px', border:`1px solid ${dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                    color: linkClr, transition:'all 0.2s', textDecoration:'none', display:'block', borderRadius:2,
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=GOLD;e.currentTarget.style.color=GOLD}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=dark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.2)';e.currentTarget.style.color=linkClr}}>
                  Sign In
                </a>
                <a href="/studio"
                  style={{
                    fontFamily:F, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700,
                    padding:'9px 22px', background:'#0a0a0a', color:'#fff',
                    transition:'all 0.2s', whiteSpace:'nowrap', textDecoration:'none', display:'block', borderRadius:2,
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background=GOLD;e.currentTarget.style.color='#0a0a0a'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#0a0a0a';e.currentTarget.style.color='#fff'}}>
                  Try Free →
                </a>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle menu"
              className="mobile-hamburger"
              style={{
                display:'flex', flexDirection:'column', justifyContent:'center',
                gap:5, background:'none', border:`1px solid ${dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'}`,
                padding:'10px 12px', cursor:'pointer', transition:'border-color 0.2s', borderRadius:2,
              }}>
              {[0,1,2].map(i=>(
                <span key={i} style={{
                  display:'block', width:18, height:1.5,
                  background: dark ? 'rgba(255,255,255,0.9)' : '#0a0a0a',
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

        {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
        <div style={{
          maxHeight: menuOpen ? '600px' : '0',
          overflow:'hidden',
          transition:'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
          background:'#fff',
          borderTop: menuOpen ? '1px solid #f0ebe6' : 'none',
        }}>
          <div style={{ padding:'20px 28px 32px' }}>
            <div style={{ marginBottom:20 }}><SearchBox dark={false} /></div>
            {NAV_LINKS.map((link, i) => (
              <a key={link.label} href={link.href} onClick={()=>setMenuOpen(false)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'14px 0', fontFamily:F, fontSize:13, letterSpacing:'0.14em',
                  textTransform:'uppercase', fontWeight:600,
                  color: isActive(link.href) ? GOLD : '#1a1a1a',
                  borderBottom:'1px solid #f0ebe6', textDecoration:'none',
                }}>
                {link.label}
                <span style={{ color:GOLD, fontSize:12 }}>→</span>
              </a>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <a href="/login" onClick={()=>setMenuOpen(false)}
                style={{
                  flex:1, textAlign:'center', padding:'12px', fontFamily:F,
                  border:'1px solid rgba(0,0,0,0.15)', color:'#1a1a1a',
                  fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none', borderRadius:2,
                }}>Sign In</a>
              <a href="/studio" onClick={()=>setMenuOpen(false)}
                style={{
                  flex:1, textAlign:'center', padding:'12px', fontFamily:F,
                  background:'#0a0a0a', color:'#fff',
                  fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none', borderRadius:2,
                }}>Try Free →</a>
            </div>
            {user && (
              <div style={{ marginTop:20, padding:'16px', background:'#faf7f4', border:'1px solid #e8e0d8', borderRadius:4 }}>
                <p style={{ fontFamily:F, color:'#0a0a0a', fontSize:12, margin:'0 0 2px', fontWeight:700 }}>{user.name}</p>
                <p style={{ fontFamily:F, color:GOLD, fontSize:9, margin:'0 0 12px', letterSpacing:'0.16em', textTransform:'uppercase' }}>{ROLE_LABEL[user.role]||user.role}</p>
                <div style={{ display:'flex', gap:8 }}>
                  <a href="/dashboard" style={{ flex:1, textAlign:'center', padding:'9px', fontFamily:F, background:'#f0ebe6', color:'#1a1a1a', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', borderRadius:2 }}>Dashboard</a>
                  <button onClick={doLogout} style={{ flex:1, padding:'9px', fontFamily:F, background:'rgba(239,68,68,0.08)', color:'#ef4444', border:'none', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', borderRadius:2 }}>Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
