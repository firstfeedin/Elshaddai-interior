import { useState, useEffect } from 'react'
import { listProjects, deleteProject, duplicateProject, exportProjectJSON } from '../../utils/projectStorage'

const T = {
  bg:'#08070a', panel:'#0f0e14', panel2:'#16141d', border:'rgba(255,255,255,0.07)',
  gold:'#c9a227', goldL:'#e8c84e', text:'#ede9e3', muted:'#6b6580',
  red:'#ef4444', green:'#22c55e',
  F:"'DM Sans',system-ui,sans-serif", S:"'Cormorant Garamond',serif",
}

function ProjectCard({ p, onOpen, onDuplicate, onDelete, onExport }) {
  const [menu, setMenu] = useState(false)
  return (
    <div style={{ background:T.panel2, border:`1px solid ${T.border}`, overflow:'hidden', position:'relative', transition:'border-color 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; setMenu(false) }}>
      {/* Thumbnail */}
      <div style={{ height:160, background:'#1a1520', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}
        onClick={()=>onOpen(p.id)}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="4" width="32" height="32" stroke={T.gold} strokeWidth="1" fill="none" opacity="0.3"/>
          {(p.walls||[]).slice(0,6).map((w,i)=>(
            <line key={i} x1={4+(w.x1||0)*0.04} y1={4+(w.y1||0)*0.04} x2={4+(w.x2||0)*0.04} y2={4+(w.y2||0)*0.04}
              stroke={T.gold} strokeWidth="1" opacity="0.6" />
          ))}
        </svg>
        <span style={{ fontFamily:T.F, fontSize:9, color:T.muted, letterSpacing:'0.14em', textTransform:'uppercase' }}>
          {p.walls?.length||0} walls · {p.furniture?.length||0} items
        </span>
      </div>

      <div style={{ padding:'12px 14px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontFamily:T.S, fontSize:16, color:T.text, margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</h3>
            <p style={{ fontFamily:T.F, fontSize:9, color:T.muted, margin:0 }}>
              Updated {new Date(p.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}
            </p>
          </div>
          <div style={{ position:'relative', flexShrink:0 }}>
            <button onClick={e=>{e.stopPropagation();setMenu(v=>!v)}}
              style={{ background:'transparent', border:`1px solid ${T.border}`, color:T.muted, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14 }}>
              ⋮
            </button>
            {menu && (
              <div style={{ position:'absolute', top:'calc(100% + 4px)', right:0, width:160, background:'#1c1927', border:`1px solid ${T.border}`, zIndex:50, boxShadow:'0 16px 48px rgba(0,0,0,0.5)' }}>
                {[
                  { l:'✏ Open & Edit',  f:()=>onOpen(p.id) },
                  { l:'⧉ Duplicate',    f:()=>onDuplicate(p.id) },
                  { l:'↓ Export JSON',  f:()=>onExport(p.id) },
                  { l:'🗑 Delete',       f:()=>onDelete(p.id), d:true },
                ].map(a=>(
                  <button key={a.l} onClick={()=>{ a.f(); setMenu(false) }}
                    style={{ display:'block', width:'100%', padding:'10px 14px', background:'none', border:'none',
                      textAlign:'left', fontFamily:T.F, fontSize:11, color:a.d?T.red:T.text, cursor:'pointer',
                      borderBottom:`1px solid ${T.border}` }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    {a.l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={()=>onOpen(p.id)}
          style={{ width:'100%', padding:'8px', background:'rgba(201,162,39,0.08)', border:`1px solid ${T.gold}`,
            color:T.gold, fontFamily:T.F, fontSize:9, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', cursor:'pointer' }}>
          ◈ Open in Studio →
        </button>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [q, setQ]               = useState('')
  const [sortBy, setSortBy]     = useState('updated')

  useEffect(() => { setProjects(listProjects()) }, [])

  function refresh() { setProjects(listProjects()) }

  function handleDelete(id) {
    if (!window.confirm('Delete this design permanently?')) return
    deleteProject(id); refresh()
  }
  function handleDuplicate(id) { duplicateProject(id); refresh() }
  function handleExport(id) {
    const json = exportProjectJSON(id); if (!json) return
    const a = document.createElement('a')
    a.href = 'data:application/json,' + encodeURIComponent(json); a.download = `design_${id}.json`; a.click()
  }
  function handleOpen(id) { window.location.href = `/studio?project=${id}` }

  const filtered = projects
    .filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b) => sortBy==='name' ? a.name.localeCompare(b.name) : new Date(b.updatedAt)-new Date(a.updatedAt))

  return (
    <div style={{ minHeight:'100vh', background:T.bg, paddingTop:80, fontFamily:T.F }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 32px 80px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:T.gold, margin:'0 0 8px' }}>◈ My Workspace</p>
            <h1 style={{ fontFamily:T.S, fontSize:48, color:T.text, margin:'0 0 8px', fontWeight:400 }}>Your Projects</h1>
            <p style={{ fontFamily:T.F, fontSize:13, color:T.muted, margin:0 }}>{projects.length} designs · Saved on this device</p>
          </div>
          <a href="/studio"
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 32px',
              background:`linear-gradient(135deg,${T.gold},${T.goldL})`, color:T.bg,
              fontFamily:T.F, fontSize:11, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase',
              textDecoration:'none', boxShadow:`0 6px 24px rgba(201,162,39,0.4)` }}>
            + New Design
          </a>
        </div>

        {/* Stats bar */}
        {projects.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
            {[
              { n:projects.length, l:'Total Designs' },
              { n:projects.reduce((s,p)=>s+(p.walls?.length||0),0), l:'Total Walls Drawn' },
              { n:projects.reduce((s,p)=>s+(p.furniture?.length||0),0), l:'Furniture Placed' },
              { n:projects.filter(p=>new Date(p.updatedAt)>new Date(Date.now()-7*86400000)).length, l:'Edited This Week' },
            ].map(s=>(
              <div key={s.l} style={{ background:T.panel2, border:`1px solid ${T.border}`, padding:'14px 16px', borderTop:`2px solid ${T.gold}` }}>
                <p style={{ fontFamily:T.S, fontSize:28, color:T.gold, margin:'0 0 4px', fontWeight:400 }}>{s.n}</p>
                <p style={{ fontFamily:T.F, fontSize:9, color:T.muted, margin:0, letterSpacing:'0.12em', textTransform:'uppercase' }}>{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, flexWrap:'wrap' }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search projects…"
            style={{ background:T.panel2, border:`1px solid ${T.border}`, color:T.text, padding:'9px 14px',
              fontFamily:T.F, fontSize:12, outline:'none', minWidth:220 }}
            onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border} />
          {[['updated','Recent'],['name','A–Z']].map(([s,l])=>(
            <button key={s} onClick={()=>setSortBy(s)}
              style={{ fontFamily:T.F, fontSize:9, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase',
                padding:'7px 14px', background:sortBy===s?T.gold:'transparent',
                border:`1px solid ${sortBy===s?T.gold:T.border}`, color:sortBy===s?T.bg:T.muted, cursor:'pointer' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:20 }}>
          {/* New card */}
          <a href="/studio" style={{ textDecoration:'none', display:'block' }}>
            <div style={{ background:T.panel, border:`2px dashed rgba(201,162,39,0.2)`, minHeight:280,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, cursor:'pointer',
              transition:'border-color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(201,162,39,0.2)'}>
              <div style={{ width:48, height:48, background:'rgba(201,162,39,0.1)', border:`1px solid ${T.gold}`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:T.gold }}>+</div>
              <span style={{ fontFamily:T.F, fontSize:11, fontWeight:700, color:T.gold, letterSpacing:'0.16em', textTransform:'uppercase' }}>New Design</span>
              <span style={{ fontFamily:T.F, fontSize:10, color:T.muted }}>2D floor plan + live 3D</span>
            </div>
          </a>

          {filtered.map(p=>(
            <ProjectCard key={p.id} p={p} onOpen={handleOpen} onDuplicate={handleDuplicate} onDelete={handleDelete} onExport={handleExport} />
          ))}
        </div>

        {filtered.length===0 && projects.length===0 && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:48, marginBottom:16, color:T.gold }}>◈</div>
            <h2 style={{ fontFamily:T.S, fontSize:32, color:T.text, margin:'0 0 12px', fontWeight:400 }}>No designs yet</h2>
            <p style={{ fontFamily:T.F, fontSize:13, color:T.muted, margin:'0 0 28px' }}>Create your first floor plan in the studio — it autosaves here.</p>
            <a href="/studio"
              style={{ display:'inline-block', padding:'13px 36px', background:`linear-gradient(135deg,${T.gold},${T.goldL})`,
                color:T.bg, fontFamily:T.F, fontSize:11, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase',
                textDecoration:'none', boxShadow:`0 6px 24px rgba(201,162,39,0.4)` }}>
              ◈ Open Studio
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
