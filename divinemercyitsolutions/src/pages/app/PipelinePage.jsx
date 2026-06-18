import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projects as projectsApi } from '../../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const PHASES = ['CREATED','DESIGN','QUOTATION_APPROVED','PRODUCTION','MATERIALS_PROCURED','INSTALLATION','QC','COMPLETED']
const PHASE_LABEL = { CREATED:'Created', DESIGN:'Design', QUOTATION_APPROVED:'Quote Approved', PRODUCTION:'Production', MATERIALS_PROCURED:'Materials Ready', INSTALLATION:'Installation', QC:'QC', COMPLETED:'Completed' }
const PHASE_COLOR = { CREATED:'#57534e', DESIGN:gold, QUOTATION_APPROVED:'#8b7355', PRODUCTION:'#c9a227', MATERIALS_PROCURED:'#f97316', INSTALLATION:'#22c55e', QC:'#0ea5e9', COMPLETED:'#22c55e' }

const INIT_PROJECTS = [
  { id:'PRJ-0012', name:'Nair Residence',     client:'Deepa Nair',      type:'4BHK Apartment', sqft:2800, budget:42, phase:'INSTALLATION',        pct:72, designer:'Kiran Sharma',   priority:'HIGH',   daysLeft:75 },
  { id:'PRJ-0009', name:'Kapoor Office',      client:'Vinay Kapoor',    type:'Commercial',     sqft:4200, budget:85, phase:'QC',                  pct:90, designer:'Lakshmi Iyer',   priority:'HIGH',   daysLeft:30 },
  { id:'PRJ-0015', name:'Sharma Villa',       client:'Rajesh Sharma',   type:'5BHK Villa',     sqft:5400, budget:120,phase:'DESIGN',               pct:15, designer:'Kiran Sharma',   priority:'NORMAL', daysLeft:180 },
  { id:'PRJ-0011', name:'Iyer Apartment',     client:'Suresh Iyer',     type:'3BHK Apartment', sqft:1600, budget:22, phase:'PRODUCTION',           pct:45, designer:'Deepika Rangaraj',priority:'NORMAL', daysLeft:90 },
  { id:'PRJ-0014', name:'Mehta Penthouse',    client:'Anil Mehta',      type:'6BHK Penthouse', sqft:6200, budget:180,phase:'CREATED',              pct:5,  designer:'Lakshmi Iyer',   priority:'HIGH',   daysLeft:240 },
  { id:'PRJ-0016', name:'Rajan Bungalow',     client:'K. Rajan',        type:'4BHK Bungalow',  sqft:3800, budget:65, phase:'QUOTATION_APPROVED',   pct:28, designer:'Kiran Sharma',   priority:'NORMAL', daysLeft:150 },
  { id:'PRJ-0013', name:'Sundar Restaurant',  client:'Sundar & Co',     type:'Restaurant',     sqft:2200, budget:55, phase:'MATERIALS_PROCURED',   pct:55, designer:'Deepika Rangaraj',priority:'URGENT', daysLeft:45 },
  { id:'PRJ-0010', name:'Balaji Apartment',   client:'T. Balaji',       type:'2BHK Apartment', sqft:1100, budget:14, phase:'COMPLETED',            pct:100,designer:'Lakshmi Iyer',   priority:'NORMAL', daysLeft:0  },
]

const PRIORITY_COLOR = { HIGH:gold, NORMAL:stone, URGENT:'#ef4444' }

function ProjectCard({ p, onMove, onClick }) {
  const col = PHASE_COLOR[p.phase] || gold
  return (
    <div onClick={() => onClick(p)}
      style={{ background:'#fff', border:`1px solid ${bdr}`, borderTop:`2px solid ${col}`, padding:'12px 14px', cursor:'pointer', marginBottom:8 }}
      onMouseEnter={e => e.currentTarget.style.borderColor=col}
      onMouseLeave={e => { e.currentTarget.style.borderTopColor=col; e.currentTarget.style.borderRightColor=bdr; e.currentTarget.style.borderBottomColor=bdr; e.currentTarget.style.borderLeftColor=bdr }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <p style={{ ...sans, fontSize:8.5, color:stone, margin:0, letterSpacing:'0.08em' }}>{p.id}</p>
        <span style={{ ...sans, fontSize:7.5, fontWeight:700, color:PRIORITY_COLOR[p.priority], border:`1px solid ${PRIORITY_COLOR[p.priority]}`, padding:'1px 5px', letterSpacing:'0.08em' }}>{p.priority}</span>
      </div>
      <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 2px', lineHeight:1.3 }}>{p.name}</p>
      <p style={{ ...sans, fontSize:10, color:stone, margin:'0 0 10px' }}>{p.client}</p>
      <div style={{ height:3, background:bdr, marginBottom:8 }}>
        <div style={{ height:'100%', width:`${p.pct}%`, background:col }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <span style={{ ...sans, fontSize:9, color:stone }}>{p.sqft.toLocaleString()} sqft</span>
        <span style={{ ...sans, fontSize:9, color:stone }}>₹{p.budget}L</span>
        <span style={{ ...sans, fontSize:9, color:p.daysLeft<=30&&p.phase!=='COMPLETED'?'#ef4444':stone }}>{p.phase==='COMPLETED'?'Done':`${p.daysLeft}d left`}</span>
      </div>
      {p.phase !== 'COMPLETED' && (
        <div style={{ display:'flex', gap:4, marginTop:8 }}>
          <button onClick={e => { e.stopPropagation(); onMove(p.id, -1) }}
            style={{ ...sans, flex:1, padding:'4px', border:`1px solid ${bdr}`, background:'#fff', color:stone, fontSize:8.5, cursor:'pointer' }}>← Back</button>
          <button onClick={e => { e.stopPropagation(); onMove(p.id, 1) }}
            style={{ ...sans, flex:1, padding:'4px', background:col, border:'none', color:'#fff', fontSize:8.5, fontWeight:700, cursor:'pointer' }}>Advance →</button>
        </div>
      )}
    </div>
  )
}

export default function PipelinePage() {
  const [projects, setProjects] = useState(INIT_PROJECTS)
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('kanban')

  useEffect(() => {
    projectsApi.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (arr.length > 0) {
          setProjects(arr.map(p => ({
            id: String(p.id),
            name: p.name,
            client: p.client_name || '—',
            type: p.notes?.match(/Scope:\s*([^|]+)/)?.[1]?.trim() || 'Project',
            sqft: p.total_area_sqft || 0,
            budget: p.budget ? Math.round(p.budget / 100000) : 0,
            phase: p.status || 'CREATED',
            pct: p.progress_pct || 0,
            designer: '—',
            priority: p.priority || 'NORMAL',
            daysLeft: p.expected_end ? Math.max(0, Math.ceil((new Date(p.expected_end) - new Date()) / 86400000)) : 0,
          })))
        }
      })
      .catch(() => {})
  }, [])

  function movePhase(id, dir) {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p
      const idx = PHASES.indexOf(p.phase)
      const newIdx = Math.max(0, Math.min(PHASES.length-1, idx + dir))
      const newPhase = PHASES[newIdx]
      const newPct = Math.round(newIdx / (PHASES.length-1) * 100)
      projectsApi.update(id, { status: newPhase, progress_pct: newPct }).catch(() => {})
      return { ...p, phase: newPhase, pct: newPct }
    }))
  }

  const totalBudget = projects.reduce((s,p) => s + p.budget, 0)
  const active      = projects.filter(p => p.phase !== 'COMPLETED').length
  const urgent      = projects.filter(p => p.priority === 'URGENT' || (p.daysLeft <= 30 && p.phase !== 'COMPLETED')).length

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><rect x="1" y="4" width="4" height="12" stroke={gold} strokeWidth="1.2"/><rect x="8" y="2" width="4" height="16" stroke={gold} strokeWidth="1.2"/><rect x="15" y="6" width="4" height="10" stroke={gold} strokeWidth="1.2"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Project <span style={{ color:gold }}>Pipeline</span></p>
        {urgent > 0 && <span style={{ ...sans, fontSize:10, fontWeight:700, background:'#ef4444', color:'#fff', padding:'2px 8px' }}>{urgent} URGENT</span>}
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', gap:2 }}>
          {['kanban','list'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ ...sans, padding:'6px 14px', background:view===v?gold:'transparent', border:`1px solid ${view===v?gold:'#57534e'}`, color:view===v?'#000':'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
        <Link to="/new-project" style={{ ...sans, padding:'7px 14px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', textDecoration:'none' }}>+ New Project</Link>
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      {/* KPI strip */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${bdr}`, padding:'14px 28px', display:'flex', gap:32 }}>
        {[
          { label:'Total Projects', value:projects.length },
          { label:'Active',         value:active },
          { label:'Urgent / Overdue', value:urgent, color:'#ef4444' },
          { label:'Total Pipeline Value', value:`₹${totalBudget}L` },
          { label:'Completed This Year', value:projects.filter(p=>p.phase==='COMPLETED').length },
        ].map(k => (
          <div key={k.label}>
            <p style={{ ...serif, fontSize:24, fontWeight:300, color:k.color||dark, margin:0 }}>{k.value}</p>
            <p style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'2px 0 0' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {view === 'kanban' && (
        <div style={{ overflowX:'auto', padding:'20px 24px' }}>
          <div style={{ display:'flex', gap:12, minWidth:PHASES.length*200 }}>
            {PHASES.map(phase => {
              const phaseProjects = projects.filter(p => p.phase === phase)
              const col = PHASE_COLOR[phase] || gold
              return (
                <div key={phase} style={{ width:200, flexShrink:0 }}>
                  <div style={{ padding:'8px 12px', background:dark, borderTop:`3px solid ${col}`, marginBottom:8 }}>
                    <p style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:col, margin:'0 0 2px' }}>{PHASE_LABEL[phase]}</p>
                    <p style={{ ...sans, fontSize:10, color:'#57534e', margin:0 }}>{phaseProjects.length} project{phaseProjects.length!==1?'s':''}</p>
                  </div>
                  <div style={{ minHeight:200 }}>
                    {phaseProjects.map(p => <ProjectCard key={p.id} p={p} onMove={movePhase} onClick={setSelected} />)}
                    {phaseProjects.length === 0 && (
                      <div style={{ border:`1px dashed ${bdr}`, height:60, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <p style={{ ...sans, fontSize:9, color:'#a8a29e', margin:0 }}>No projects</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List */}
      {view === 'list' && (
        <div style={{ padding:'20px 28px' }}>
          <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:dark }}>
                  {['Project','Client','Type','Area','Budget','Designer','Phase','Progress','Priority','Days Left',''].map(h => (
                    <th key={h} style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#78716c', padding:'10px 12px', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  const col = PHASE_COLOR[p.phase] || gold
                  return (
                    <tr key={p.id} onClick={() => setSelected(p)} style={{ borderBottom:`1px solid ${bdr}`, cursor:'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background=`${gold}06`}
                      onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                      <td style={{ padding:'10px 12px' }}>
                        <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 2px' }}>{p.name}</p>
                        <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{p.id}</p>
                      </td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'10px 12px' }}>{p.client}</td>
                      <td style={{ ...sans, fontSize:10, color:stone, padding:'10px 12px' }}>{p.type}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'10px 12px' }}>{p.sqft.toLocaleString()}</td>
                      <td style={{ ...sans, fontSize:11, color:dark, padding:'10px 12px', fontWeight:600 }}>₹{p.budget}L</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'10px 12px' }}>{p.designer}</td>
                      <td style={{ padding:'10px 12px' }}>
                        <span style={{ ...sans, fontSize:8.5, fontWeight:700, color:col, border:`1px solid ${col}`, padding:'2px 7px', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{PHASE_LABEL[p.phase]}</span>
                      </td>
                      <td style={{ padding:'10px 12px', width:80 }}>
                        <div style={{ height:4, background:bdr }}>
                          <div style={{ height:'100%', width:`${p.pct}%`, background:col }} />
                        </div>
                        <p style={{ ...sans, fontSize:9, color:stone, margin:'3px 0 0' }}>{p.pct}%</p>
                      </td>
                      <td style={{ padding:'10px 12px' }}>
                        <span style={{ ...sans, fontSize:8.5, fontWeight:700, color:PRIORITY_COLOR[p.priority], border:`1px solid ${PRIORITY_COLOR[p.priority]}`, padding:'2px 7px' }}>{p.priority}</span>
                      </td>
                      <td style={{ ...sans, fontSize:11, color:p.daysLeft<=30&&p.phase!=='COMPLETED'?'#ef4444':stone, padding:'10px 12px', fontWeight:p.daysLeft<=30&&p.phase!=='COMPLETED'?700:400 }}>
                        {p.phase==='COMPLETED'?'Done':`${p.daysLeft}d`}
                      </td>
                      <td style={{ padding:'10px 12px' }}>
                        {p.phase !== 'COMPLETED' && (
                          <button onClick={e => { e.stopPropagation(); movePhase(p.id, 1) }}
                            style={{ ...sans, padding:'4px 10px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>Advance</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div style={{ position:'fixed', top:64, right:0, bottom:0, width:340, background:'#fff', borderLeft:`1px solid ${bdr}`, overflowY:'auto', padding:24, zIndex:20, boxShadow:'-4px 0 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <p style={{ ...sans, fontSize:9, color:stone, margin:0, letterSpacing:'0.1em' }}>{selected.id}</p>
            <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>✕</button>
          </div>
          <div style={{ borderLeft:`3px solid ${PHASE_COLOR[selected.phase]||gold}`, paddingLeft:14, marginBottom:20 }}>
            <p style={{ ...serif, fontSize:24, fontWeight:300, color:dark, margin:'0 0 4px' }}>{selected.name}</p>
            <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{selected.client} · {selected.type}</p>
          </div>

          {/* Phase progress */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', gap:3, marginBottom:8 }}>
              {PHASES.map((ph,i) => {
                const done  = PHASES.indexOf(selected.phase) > i
                const active= selected.phase === ph
                return <div key={ph} title={PHASE_LABEL[ph]} style={{ flex:1, height:5, background:done?PHASE_COLOR[ph]||gold:active?`${PHASE_COLOR[ph]||gold}60`:bdr }} />
              })}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ ...sans, fontSize:9, color:PHASE_COLOR[selected.phase]||gold, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>{PHASE_LABEL[selected.phase]}</span>
              <span style={{ ...sans, fontSize:9, color:stone }}>{selected.pct}%</span>
            </div>
          </div>

          {[
            ['Designer', selected.designer],
            ['Sqft',     selected.sqft.toLocaleString() + ' sqft'],
            ['Budget',   '₹' + selected.budget + ' Lakhs'],
            ['Priority', selected.priority],
            ['Days Left', selected.phase==='COMPLETED'?'Completed':`${selected.daysLeft} days`],
          ].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
              <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone }}>{k}</span>
              <span style={{ ...sans, fontSize:11.5, color:dark }}>{v}</span>
            </div>
          ))}

          {selected.phase !== 'COMPLETED' && (
            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              <button onClick={() => movePhase(selected.id, -1)}
                style={{ ...sans, flex:1, padding:'10px', background:'#fff', border:`1px solid ${bdr}`, color:stone, fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>← Back</button>
              <button onClick={() => { movePhase(selected.id, 1); setSelected(p => ({ ...p, phase: PHASES[Math.min(PHASES.indexOf(p.phase)+1, PHASES.length-1)] })) }}
                style={{ ...sans, flex:1, padding:'10px', background:PHASE_COLOR[selected.phase]||gold, border:'none', color:selected.phase==='INSTALLATION'?'#000':'#fff', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Advance →</button>
            </div>
          )}
          <div style={{ marginTop:12 }}>
            <Link to="/client-portal" style={{ ...sans, display:'block', width:'100%', padding:'10px', background:'#fff', border:`1px solid ${bdr}`, color:dark, fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', textDecoration:'none', textAlign:'center', boxSizing:'border-box' }}>
              Client Portal →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
