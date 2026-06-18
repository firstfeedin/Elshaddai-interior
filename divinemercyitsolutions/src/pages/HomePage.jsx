const FEATURES = [
  { emoji:'🏗️', title:'Floor Planning',        pts:['Draw 2D floor plans from scratch','Import CAD/DWG/DXF files','Multi-floor & room measurement tools'] },
  { emoji:'🛋️', title:'3D Interior Design',    pts:['Drag-and-drop furniture placement','Kitchen, bathroom & office design','Commercial space design'] },
  { emoji:'📦', title:'Furniture Library',      pts:['Millions of 3D models','Materials & textures library','Appliance & lighting catalog'] },
  { emoji:'🎨', title:'Rendering',              pts:['Photorealistic 4K / 8K rendering','Cloud rendering queue','Real-time lighting simulation'] },
  { emoji:'🌐', title:'Virtual Experience',     pts:['360° panoramic views','Virtual tour & walkthrough mode','VR-ready presentations'] },
  { emoji:'🤖', title:'AI Features',            pts:['AI room generation from text','AI material & style suggestions','Smart furniture placement'] },
  { emoji:'🍳', title:'Kitchen & Wardrobe',     pts:['Modular kitchen configuration','Cabinet & wardrobe planning','Custom dimensions & storage'] },
  { emoji:'🗂️', title:'Catalog Management',    pts:['Upload your furniture catalog','Custom SKU management','Material & texture catalogs'] },
  { emoji:'🤝', title:'Business Features',      pts:['Team collaboration & sharing','Client project portal','Cloud project storage'] },
  { emoji:'💼', title:'Sales Features',         pts:['Customer presentation mode','Interactive design reviews','Design proposal & approvals'] },
]

const STATS = [
  { n:'500K+', l:'Designs Created' },
  { n:'10M+',  l:'Furniture Models' },
  { n:'150+',  l:'Countries' },
  { n:'99.9%', l:'Uptime' },
]

export default function HomePage() {
  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:'#f5f6f8', minHeight:'100vh' }}>

      {/* NAV */}
      <nav style={{ background:'#1e2433', height:60, display:'flex', alignItems:'center', padding:'0 40px', gap:20, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:24 }}>
          <div style={{ width:32,height:32,background:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/></svg>
          </div>
          <span style={{ color:'#fff',fontWeight:700,fontSize:15 }}>El Shaddai</span>
        </div>
        {['Features','Projects','Pricing'].map(l=>(
          <button key={l} onClick={()=>window.location.href=l==='Projects'?'/projects':'#'} style={{ background:'none',border:'none',color:'#8899aa',cursor:'pointer',fontSize:13,fontWeight:500,padding:'4px 8px' }}
            onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#8899aa'}>{l}</button>
        ))}
        <div style={{ flex:1 }} />
        <button onClick={()=>window.location.href='/dashboard'} style={{ background:'none',border:'1px solid #2e3650',color:'#8899aa',cursor:'pointer',fontSize:12,padding:'6px 14px',borderRadius:7 }}>Dashboard</button>
        <button onClick={()=>window.location.href='/designer'} style={{ background:'#c9a227',border:'none',color:'#000',cursor:'pointer',fontSize:12,fontWeight:700,padding:'7px 18px',borderRadius:7 }}>Open Designer</button>
      </nav>

      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg,#1e2433 0%,#252d42 50%,#1a1f2e 100%)', padding:'80px 40px 90px', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(201,162,39,0.12)', border:'1px solid rgba(201,162,39,0.3)', borderRadius:20, padding:'5px 16px', marginBottom:24 }}>
          <span style={{ fontSize:13, color:'#c9a227', fontWeight:600 }}>✨ AI-Powered Interior Design Platform</span>
        </div>
        <h1 style={{ color:'#fff', fontSize:52, fontWeight:800, margin:'0 0 16px', lineHeight:1.15 }}>
          Design Your Dream Interior<br/>
          <span style={{ color:'#c9a227' }}>in Minutes</span>
        </h1>
        <p style={{ color:'#8899aa', fontSize:18, maxWidth:580, margin:'0 auto 36px', lineHeight:1.7 }}>
          Professional 2D floor planning, photorealistic 3D rendering, AI room generation,
          and client collaboration — all in one platform.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:48 }}>
          <button onClick={()=>window.location.href='/designer'} style={{ background:'#c9a227',border:'none',color:'#000',cursor:'pointer',fontSize:15,fontWeight:700,padding:'14px 32px',borderRadius:10 }}>
            ✏️ Start Designing Free
          </button>
          <button onClick={()=>window.location.href='/ai-design'} style={{ background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.2)',color:'#fff',cursor:'pointer',fontSize:14,fontWeight:600,padding:'14px 28px',borderRadius:10 }}>
            🤖 Try AI Design
          </button>
          <button onClick={()=>window.location.href='/projects'} style={{ background:'transparent',border:'1px solid #2e3650',color:'#8899aa',cursor:'pointer',fontSize:14,padding:'14px 24px',borderRadius:10 }}>
            📐 View Projects
          </button>
        </div>
        {/* Feature pills */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          {['2D Floor Plans','3D Design','AI Generation','4K Rendering','360° Panorama','Virtual Tour','Team Collaboration'].map(f=>(
            <span key={f} style={{ background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8',fontSize:12,padding:'5px 12px',borderRadius:16 }}>✓ {f}</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ background:'#c9a227', padding:'28px 40px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {STATS.map(s=>(
            <div key={s.l} style={{ textAlign:'center' }}>
              <p style={{ margin:0, fontSize:32, fontWeight:800, color:'#000', lineHeight:1 }}>{s.n}</p>
              <p style={{ margin:'4px 0 0', fontSize:13, color:'rgba(0,0,0,0.65)', fontWeight:500 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES GRID */}
      <div style={{ padding:'72px 40px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <h2 style={{ margin:'0 0 12px', fontSize:36, fontWeight:800, color:'#1a202c' }}>Everything You Need</h2>
          <p style={{ margin:0, fontSize:16, color:'#64748b' }}>A complete platform for interior designers, builders, and homeowners</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f2', borderRadius:14, padding:'24px 24px 20px', transition:'all 0.15s', cursor:'default' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='#c9a227'; e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e8f2'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
                <div style={{ width:44, height:44, background:'rgba(201,162,39,0.1)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{f.emoji}</div>
                <div>
                  <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1a202c' }}>{f.title}</h3>
                </div>
              </div>
              <ul style={{ margin:0, padding:'0 0 0 18px', listStyle:'none' }}>
                {f.pts.map((p,j)=>(
                  <li key={j} style={{ fontSize:13, color:'#64748b', marginBottom:5, position:'relative', paddingLeft:14 }}>
                    <span style={{ position:'absolute', left:0, color:'#c9a227', fontWeight:700 }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACCESS */}
      <div style={{ background:'#1e2433', padding:'60px 40px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center', marginBottom:40 }}>
          <h2 style={{ color:'#fff', fontSize:30, fontWeight:800, margin:'0 0 10px' }}>Quick Access</h2>
          <p style={{ color:'#8899aa', fontSize:14, margin:0 }}>Jump directly into any module</p>
        </div>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
          {[
            { emoji:'✏️', label:'2D Floor Plan',   path:'/designer',  color:'#3b82f6' },
            { emoji:'🛋️', label:'3D Designer',     path:'/designer',  color:'#8b5cf6' },
            { emoji:'🤖', label:'AI Room Design',  path:'/ai-design', color:'#10b981' },
            { emoji:'🎨', label:'Render Studio',   path:'/render',    color:'#f59e0b' },
            { emoji:'📦', label:'Catalog',         path:'/catalog',   color:'#ef4444' },
            { emoji:'🎤', label:'Presentation',    path:'/present',   color:'#06b6d4' },
          ].map(m=>(
            <button key={m.path+m.label} onClick={()=>window.location.href=m.path} style={{
              background:'rgba(255,255,255,0.05)', border:'1px solid #2e3650', borderRadius:12,
              padding:'20px 12px', cursor:'pointer', textAlign:'center', transition:'all 0.15s',
            }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=m.color; e.currentTarget.style.background='rgba(255,255,255,0.08)' }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#2e3650'; e.currentTarget.style.background='rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{m.emoji}</div>
              <p style={{ margin:0, fontSize:12, color:'#fff', fontWeight:600 }}>{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'80px 40px', textAlign:'center', background:'#f5f6f8' }}>
        <h2 style={{ margin:'0 0 12px', fontSize:36, fontWeight:800, color:'#1a202c' }}>Ready to Start Designing?</h2>
        <p style={{ margin:'0 0 32px', fontSize:16, color:'#64748b' }}>Join 500,000+ designers already using El Shaddai</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={()=>window.location.href='/designer'} style={{ background:'#c9a227',border:'none',color:'#000',cursor:'pointer',fontSize:15,fontWeight:700,padding:'14px 36px',borderRadius:10 }}>
            Open 3D Designer →
          </button>
          <button onClick={()=>window.location.href='/register'} style={{ background:'#1e2433',border:'none',color:'#fff',cursor:'pointer',fontSize:14,fontWeight:600,padding:'14px 28px',borderRadius:10 }}>
            Create Free Account
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background:'#1e2433', padding:'28px 40px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:'#8899aa', fontSize:12 }}>© 2025 El Shaddai Design Platform. All rights reserved.</span>
        <div style={{ display:'flex', gap:16 }}>
          {['Privacy','Terms','Support'].map(l=>(
            <button key={l} style={{ background:'none',border:'none',color:'#8899aa',cursor:'pointer',fontSize:12 }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
