import { useState } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const PHASE_CHECKLISTS = {
  'Civil & Electrical': [
    { section:'Flooring', items:['Sub-floor levelled and cleaned','Waterproofing applied in wet areas','Adhesive uniformly spread','Tiles/stone laid without lippage','Grout joints uniform and clean','No hollow tiles (tap test passed)','Skirting aligned and fixed'] },
    { section:'Wall Preparation', items:['Walls hacked and replastered where needed','Wall surface plumb and true','No cracks or blow-outs','Electrical chasing done before plaster','PVC conduits installed and covered'] },
    { section:'Electrical', items:['All conduits properly embedded','Junction boxes accessible','Earthing verified','Load distribution balanced','MCB ratings correct','Points tested with tester'] },
    { section:'Plumbing', items:['All pipelines pressure-tested','Hot/cold lines labelled','Waste lines at correct slope','No visible leaks','Water hammer arrestors installed where needed'] },
  ],
  'False Ceiling': [
    { section:'Structure', items:['Main runners level and true','Cross tees at correct centres','Perimeter channel secured to wall','All hangers at correct spacing','No visible sag or bow'] },
    { section:'Gypsum Boards', items:['Boards fixed without gaps','Screws countersunk, not over-driven','All joints taped and feathered','Corners reinforced with angle bead','No board cracks visible'] },
    { section:'Lighting', items:['Cutouts accurate and clean','Downlight boxes flush with board','Cove profile straight and level','Drivers accessible for maintenance','All lights tested and working'] },
  ],
  'Furniture & Joinery': [
    { section:'Wardrobes', items:['Carcass plumb and square','Shutters hang level, no twist','Soft-close hinges operate smoothly','Handles aligned to spec','Interior fittings installed correctly','Laminate/PU finish free of bubbles','No chip or scratch on visible surface'] },
    { section:'Kitchen', items:['All modules level and aligned','Countertop joints tight','Sink properly sealed','Under-sink drainage connected','Soft-close tandem drawers functioning','Overhead shutter clearance adequate','Backsplash tiles aligned with counter'] },
    { section:'TV Unit & Shelves', items:['Unit fixed to wall with anchors','Back panel aligned','Open shelves level','Cable management clean','Speaker cutouts accurate'] },
  ],
  'Painting & Finishes': [
    { section:'Wall Paint', items:['Surface primed before painting','No roller marks or brush lines','Even sheen across the surface','Cut lines at ceiling/skirting sharp','Colour matches approved swatch','No peel or flaking'] },
    { section:'Texture', items:['Texture pattern consistent','Depth of texture as sample','No cracking after drying','Protection applied on skirting during texture'] },
    { section:'Polish / Lacquer', items:['Wood surfaces sanded before polish','No runs or drips in finish','Sheen level matches sample','Edge coverage complete'] },
  ],
  'Final Handover': [
    { section:'Snagging', items:['All punch list items cleared','No scratches or marks on mirrors/glass','All door handles and locks working','All switches and sockets operational','AC units cooling and draining correctly','All lights on correct circuit','Plumbing fixtures leak-free'] },
    { section:'Cleanliness', items:['Deep clean of all surfaces','Floor polished or scrubbed','Grout cleaned and sealed','Windows cleaned inside and out','All protective tape removed','No construction debris remaining'] },
    { section:'Documentation', items:['As-built drawings provided','Material warranty cards handed over','Vendor contact list shared','Maintenance guide given','Professional photos taken','Client walkthrough completed','Handover certificate signed'] },
  ],
}

const PROJECTS = [
  { id:'PRJ-0012', name:'Nair Residence',   phase:'Furniture & Joinery' },
  { id:'PRJ-0009', name:'Kapoor Office',    phase:'Final Handover' },
  { id:'PRJ-0015', name:'Sharma Villa',     phase:'Civil & Electrical' },
  { id:'PRJ-0011', name:'Iyer Apartment',   phase:'Painting & Finishes' },
]

const STATUS_COLOR = { PASS:'#22c55e', FAIL:'#ef4444', NA:'#78716c', '':'#e7e5e4' }

export default function QCChecklistPage() {
  const [project,   setProject]   = useState(PROJECTS[0])
  const [phaseKey,  setPhaseKey]  = useState(PROJECTS[0].phase)
  const [checks,    setChecks]    = useState({})
  const [notes,     setNotes]     = useState({})
  const [signOff,   setSignOff]   = useState(false)
  const [signing,   setSigning]   = useState(false)
  const [inspector, setInspector] = useState('Priya Menon')
  const [showSummary, setShowSummary] = useState(false)

  const checklist = PHASE_CHECKLISTS[phaseKey] || []
  const allItems  = checklist.flatMap(s => s.items.map(item => `${s.section}::${item}`))
  const passed    = allItems.filter(k => checks[k] === 'PASS').length
  const failed    = allItems.filter(k => checks[k] === 'FAIL').length
  const na        = allItems.filter(k => checks[k] === 'NA').length
  const checked   = passed + failed + na
  const total     = allItems.length
  const score     = total > 0 ? Math.round(passed / (total - na || 1) * 100) : 0

  function setCheck(section, item, val) {
    const key = `${section}::${item}`
    setChecks(c => ({ ...c, [key]: c[key] === val ? '' : val }))
  }

  function signOffQC() {
    setSigning(true)
    setTimeout(() => { setSigning(false); setSignOff(true) }, 1400)
  }

  function selectProject(p) {
    setProject(p); setPhaseKey(p.phase); setChecks({}); setNotes({}); setSignOff(false)
  }

  const scoreColor = score >= 90 ? '#22c55e' : score >= 70 ? gold : '#ef4444'

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="17" stroke={gold} strokeWidth="1.2"/><path d="M7 7h6M7 10h6M7 13h4" stroke={gold} strokeWidth="1.2" strokeLinecap="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>QC <span style={{ color:gold }}>Checklist</span></p>
        <div style={{ flex:1 }} />
        <button onClick={() => setShowSummary(true)} style={{ ...sans, padding:'6px 16px', background:'none', border:`1px solid #57534e`, color:'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Summary</button>
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', minHeight:'calc(100vh - 64px)' }}>
        {/* Left panel */}
        <div style={{ background:dark, padding:20, borderRight:'1px solid #292524', display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#57534e', margin:'0 0 10px' }}>Project</p>
            {PROJECTS.map(p => (
              <button key={p.id} onClick={() => selectProject(p)}
                style={{ ...sans, display:'block', width:'100%', textAlign:'left', padding:'10px 12px', background:project.id===p.id?'rgba(201,162,39,0.1)':'none', border:'none', borderLeft:`2px solid ${project.id===p.id?gold:'transparent'}`, color:project.id===p.id?gold:'#78716c', fontSize:11, cursor:'pointer', marginBottom:2 }}>
                <p style={{ margin:'0 0 2px', fontWeight:project.id===p.id?700:400 }}>{p.name}</p>
                <p style={{ margin:0, fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:'#57534e' }}>{p.id}</p>
              </button>
            ))}
          </div>
          <div>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#57534e', margin:'0 0 10px' }}>Inspection Phase</p>
            {Object.keys(PHASE_CHECKLISTS).map(ph => (
              <button key={ph} onClick={() => { setPhaseKey(ph); setChecks({}); setNotes({}); setSignOff(false) }}
                style={{ ...sans, display:'block', width:'100%', textAlign:'left', padding:'8px 12px', background:phaseKey===ph?'rgba(201,162,39,0.1)':'none', border:'none', borderLeft:`2px solid ${phaseKey===ph?gold:'transparent'}`, color:phaseKey===ph?gold:'#78716c', fontSize:10.5, cursor:'pointer', marginBottom:2, fontWeight:phaseKey===ph?700:400 }}>
                {ph}
              </button>
            ))}
          </div>

          {/* Score */}
          <div style={{ background:'#292524', padding:'16px 14px', marginTop:'auto' }}>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#57534e', margin:'0 0 10px' }}>Inspection Score</p>
            <p style={{ ...serif, fontSize:44, fontWeight:300, color:scoreColor, margin:'0 0 4px', lineHeight:1 }}>{score}<span style={{ fontSize:18, color:'#57534e' }}>%</span></p>
            <p style={{ ...sans, fontSize:9, color:'#57534e', margin:'0 0 10px' }}>{checked}/{total} items checked</p>
            <div style={{ height:4, background:'#3a3330' }}>
              <div style={{ height:'100%', width:`${score}%`, background:scoreColor, transition:'width 0.4s' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
              <span style={{ ...sans, fontSize:9, color:'#22c55e' }}>✓ {passed} Pass</span>
              <span style={{ ...sans, fontSize:9, color:'#ef4444' }}>✕ {failed} Fail</span>
              <span style={{ ...sans, fontSize:9, color:'#78716c' }}>— {na} N/A</span>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ padding:28, overflowY:'auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
            <div>
              <p style={{ ...serif, fontSize:30, fontWeight:300, color:dark, margin:'0 0 4px' }}>{phaseKey} Inspection</p>
              <p style={{ ...sans, fontSize:11, color:stone, margin:0 }}>{project.name} · {project.id}</p>
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <select value={inspector} onChange={e => setInspector(e.target.value)}
                style={{ ...sans, padding:'7px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, background:'#fff' }}>
                {['Priya Menon','Kiran Sharma','Mohammed Farook','QC Team'].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {!signOff ? (
                <button onClick={signOffQC} disabled={checked < total * 0.5 || signing}
                  style={{ ...sans, padding:'8px 20px', background:checked>=total*0.5?gold:'#e7e5e4', border:'none', color:checked>=total*0.5?'#000':'#a8a29e', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:checked>=total*0.5?'pointer':'default' }}>
                  {signing ? 'Signing…' : 'Sign Off'}
                </button>
              ) : (
                <div style={{ background:`${gold}15`, border:`1px solid ${gold}`, padding:'7px 14px' }}>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, color:gold, margin:0, letterSpacing:'0.1em' }}>✓ SIGNED — {inspector}</p>
                </div>
              )}
            </div>
          </div>

          {checklist.map(section => (
            <div key={section.section} style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', background:dark, borderLeft:`3px solid ${gold}`, marginBottom:2 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:gold, margin:0 }}>{section.section}</p>
                <p style={{ ...sans, fontSize:9, color:'#57534e', margin:0 }}>
                  {section.items.filter(item => checks[`${section.section}::${item}`] === 'PASS').length}/{section.items.length} passed
                </p>
              </div>

              {section.items.map(item => {
                const key = `${section.section}::${item}`
                const val = checks[key] || ''
                return (
                  <div key={item} style={{ background:'#fff', border:`1px solid ${bdr}`, borderTop:'none', padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      {/* Status buttons */}
                      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                        {['PASS','FAIL','NA'].map(s => (
                          <button key={s} onClick={() => setCheck(section.section, item, s)}
                            style={{ ...sans, width:42, padding:'5px 0', border:`1px solid ${val===s?STATUS_COLOR[s]:bdr}`, background:val===s?STATUS_COLOR[s]:'#fff', color:val===s?'#fff':stone, fontSize:8.5, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', textAlign:'center' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                      <p style={{ ...sans, fontSize:11.5, color:dark, margin:0, flex:1, lineHeight:1.5 }}>{item}</p>
                      {/* Note toggle */}
                      <button onClick={() => setNotes(n => ({ ...n, [key]: n[key] === undefined ? '' : undefined }))}
                        style={{ ...sans, fontSize:9, color:notes[key]!==undefined?gold:stone, background:'none', border:`1px solid ${notes[key]!==undefined?gold:bdr}`, padding:'4px 8px', cursor:'pointer' }}>
                        {notes[key] !== undefined ? '📝' : '+ Note'}
                      </button>
                    </div>
                    {notes[key] !== undefined && (
                      <input value={notes[key]} onChange={e => setNotes(n => ({ ...n, [key]: e.target.value }))}
                        placeholder="Add inspection note…"
                        style={{ ...sans, marginTop:8, width:'100%', padding:'6px 10px', border:`1px solid ${bdr}`, fontSize:10.5, color:dark, boxSizing:'border-box' }} />
                    )}
                    {val === 'FAIL' && !notes[key] !== undefined && (
                      <input onChange={e => setNotes(n => ({ ...n, [key]: e.target.value }))}
                        placeholder="Describe the defect (required for FAIL)…"
                        style={{ ...sans, marginTop:8, width:'100%', padding:'6px 10px', border:`1px solid #ef4444`, fontSize:10.5, color:dark, boxSizing:'border-box' }} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary modal */}
      {showSummary && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if(e.target===e.currentTarget) setShowSummary(false) }}>
          <div style={{ background:'#fff', width:480, maxHeight:'80vh', overflowY:'auto', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <p style={{ ...serif, fontSize:24, fontWeight:300, color:dark, margin:0 }}>QC Summary</p>
              <button onClick={() => setShowSummary(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:stone }}>✕</button>
            </div>
            <div style={{ background:dark, padding:'16px 20px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ ...sans, fontSize:9, color:'#78716c', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px' }}>Overall Score</p>
                <p style={{ ...serif, fontSize:40, fontWeight:300, color:scoreColor, margin:0 }}>{score}%</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ ...sans, fontSize:10, color:'#22c55e', margin:'0 0 4px' }}>✓ {passed} Passed</p>
                <p style={{ ...sans, fontSize:10, color:'#ef4444', margin:'0 0 4px' }}>✕ {failed} Failed</p>
                <p style={{ ...sans, fontSize:10, color:'#78716c', margin:0 }}>— {na} N/A</p>
              </div>
            </div>
            {failed > 0 && (
              <div>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#ef4444', margin:'0 0 10px' }}>Failed Items</p>
                {allItems.filter(k => checks[k] === 'FAIL').map(k => {
                  const [sec, item] = k.split('::')
                  return (
                    <div key={k} style={{ display:'flex', gap:10, padding:'8px 12px', background:'#fff5f5', border:'1px solid #fecaca', marginBottom:4 }}>
                      <span style={{ ...sans, fontSize:10, color:'#ef4444', flexShrink:0 }}>✕</span>
                      <div>
                        <p style={{ ...sans, fontSize:10, color:'#ef4444', margin:'0 0 2px', fontWeight:600 }}>{sec}</p>
                        <p style={{ ...sans, fontSize:11, color:dark, margin:0 }}>{item}</p>
                        {notes[k] && <p style={{ ...sans, fontSize:9.5, color:stone, margin:'2px 0 0', fontStyle:'italic' }}>{notes[k]}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button onClick={() => { setShowSummary(false); signOffQC() }} disabled={signOff || checked < total * 0.5}
                style={{ ...sans, flex:1, padding:'10px', background:signOff?'#e7e5e4':gold, border:'none', color:signOff?'#a8a29e':'#000', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:signOff||checked<total*0.5?'default':'pointer' }}>
                {signOff ? '✓ Already Signed' : 'Sign Off →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
