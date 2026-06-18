import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { siteDiary as siteDiaryApi } from '../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const WEATHER = ['☀ Sunny','🌤 Partly Cloudy','☁ Overcast','🌧 Light Rain','⛈ Heavy Rain','🌫 Foggy']
const PROJECTS = [
  { id:'PRJ-0012', name:'Nair Residence' },
  { id:'PRJ-0009', name:'Kapoor Office' },
  { id:'PRJ-0015', name:'Sharma Villa' },
]

const TODAY = new Date().toISOString().slice(0,10)

const SEED = [
  { id:1, date:'2026-06-15', project:'PRJ-0012', projectName:'Nair Residence', weather:'☀ Sunny', workers:14, supervisors:'Mohammed Farook', hoursOnSite:9, workDone:['False ceiling installation completed in all 3 bedrooms','Living room FC frame work started — 60% done','Electrical points fitted in master bedroom'], materials:['Gypsum boards — 40 sheets','Main runners — 20 pcs','Hanger rods — 50 pcs'], issues:'None', safetyIncidents:'None', photos:3, nextDay:'Complete living room FC. Paint primer — bedroom 1.', submittedBy:'Mohammed Farook', submittedAt:'2026-06-15T18:30:00' },
  { id:2, date:'2026-06-14', project:'PRJ-0012', projectName:'Nair Residence', weather:'🌤 Partly Cloudy', workers:12, supervisors:'Mohammed Farook', hoursOnSite:8, workDone:['Wooden flooring — master bedroom complete','Study room flooring — 70% done','Hardware fitting on bedroom wardrobes'], materials:['Engineered wood planks — 180 sqft','Adhesive — 2 cans','Sandpaper rolls — 4 pcs'], issues:'Flooring adhesive took longer to set due to humidity. 2-hr delay.', safetyIncidents:'None', photos:5, nextDay:'Complete study room flooring. Start FC work — bedrooms.', submittedBy:'Mohammed Farook', submittedAt:'2026-06-14T17:45:00' },
  { id:3, date:'2026-06-13', project:'PRJ-0009', projectName:'Kapoor Office', weather:'☀ Sunny', workers:8, supervisors:'Ramesh Pillai', hoursOnSite:10, workDone:['Reception area furniture placed and fixed','Conference room AV cabling completed','Carpet tiles laid — open office area'], materials:['Carpet tiles — 200 nos','AV cables — 30 mtrs','Furniture anchors — 24 pcs'], issues:'None', safetyIncidents:'None', photos:4, nextDay:'Snagging inspection with designer.', submittedBy:'Ramesh Pillai', submittedAt:'2026-06-13T18:00:00' },
]

const EMPTY_ENTRY = { date:TODAY, project:'PRJ-0012', projectName:'Nair Residence', weather:'☀ Sunny', workers:'', supervisors:'Mohammed Farook', hoursOnSite:'8', workDone:[''], materials:[''], issues:'', safetyIncidents:'None', nextDay:'', submittedBy:JSON.parse(localStorage.getItem('es_user')||'{}').name||'Site Supervisor' }

function PhotoPlaceholder({ n }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
      {[...Array(n)].map((_,i) => (
        <div key={i} style={{ aspectRatio:'4/3', background:'#f0ede9', border:`1px solid ${bdr}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity:0.35 }}><rect x="3" y="5" width="18" height="14" stroke={dark} strokeWidth="1.2"/><circle cx="8" cy="9" r="1.5" stroke={dark} strokeWidth="1.2"/><path d="M3 16l4-4 3 3 3-3 5 5" stroke={dark} strokeWidth="1.2"/></svg>
        </div>
      ))}
    </div>
  )
}

export default function SiteDiaryPage() {
  const [entries, setEntries] = useState(SEED)
  const [view, setView] = useState('list')
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState(EMPTY_ENTRY)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    siteDiaryApi.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (arr.length > 0) {
          setEntries(arr.map(d => ({
            id: d.id,
            date: d.report_date,
            project: String(d.project_id),
            projectName: d.project_name || '—',
            weather: d.weather || '☀ Sunny',
            workers: d.workers_count || 0,
            supervisors: d.reporter_name || '—',
            hoursOnSite: 8,
            workDone: d.work_done ? d.work_done.split('|').map(s => s.trim()).filter(Boolean) : [],
            materials: d.materials_used ? d.materials_used.split('|').map(s => s.trim()).filter(Boolean) : [],
            issues: d.issues || 'None',
            safetyIncidents: 'None',
            photos: 0,
            nextDay: '',
            submittedBy: d.reporter_name || '—',
            submittedAt: d.created_at,
          })))
        }
      })
      .catch(() => {})
  }, [])

  const filtered = entries.filter(e => filter === 'ALL' || e.project === filter)

  function addListItem(field, val) {
    setForm(f => ({ ...f, [field]: [...f[field], val] }))
  }
  function updateListItem(field, idx, val) {
    setForm(f => ({ ...f, [field]: f[field].map((v,i) => i===idx ? val : v) }))
  }
  function removeListItem(field, idx) {
    setForm(f => ({ ...f, [field]: f[field].filter((_,i) => i!==idx) }))
  }

  async function save() {
    const proj = PROJECTS.find(p => p.id === form.project)
    const newEntry = { ...form, id: Date.now(), projectName: proj?.name || form.project, submittedAt: new Date().toISOString(), photos: 0 }
    setEntries(e => [newEntry, ...e])
    setView('list')
    setForm(EMPTY_ENTRY)
    siteDiaryApi.create({
      project_id: form.project,
      report_date: form.date,
      work_done: form.workDone.filter(Boolean).join(' | '),
      workers_count: parseInt(form.workers) || 0,
      issues: form.issues || 'None',
      materials_used: form.materials.filter(Boolean).join(' | '),
      weather: form.weather,
    }).catch(() => {})
  }

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="15" stroke={gold} strokeWidth="1.2"/><path d="M6 3V1M14 3V1M2 8h16" stroke={gold} strokeWidth="1.2" strokeLinecap="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Site <span style={{ color:gold }}>Diary</span></p>
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', gap:2 }}>
          {['list','new'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ ...sans, padding:'6px 14px', background:view===v?gold:'transparent', border:`1px solid ${view===v?gold:'#57534e'}`, color:view===v?'#000':'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
              {v === 'new' ? '+ New Entry' : 'Diary'}
            </button>
          ))}
        </div>
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      {view === 'list' && (
        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', minHeight:'calc(100vh - 64px)' }}>
          <div style={{ padding:28, borderRight:selected?`1px solid ${bdr}`:'none' }}>
            {/* Stats strip */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
              {[
                { label:'Entries This Month', value:entries.filter(e => e.date.startsWith(TODAY.slice(0,7))).length },
                { label:'Total Workers Logged', value:entries.reduce((s,e)=>s+(parseInt(e.workers)||0),0) },
                { label:'Safety Incidents', value:entries.filter(e=>e.safetyIncidents!=='None').length, accent:'#ef4444' },
              ].map(k => (
                <div key={k.label} style={{ background:'#fff', border:`1px solid ${bdr}`, borderTop:`3px solid ${k.accent||gold}`, padding:'14px 18px' }}>
                  <p style={{ ...serif, fontSize:28, fontWeight:300, color:k.accent||dark, margin:'0 0 4px' }}>{k.value}</p>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:0 }}>{k.label}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {['ALL',...PROJECTS.map(p=>p.id)].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ ...sans, padding:'5px 12px', border:`1px solid ${filter===f?gold:bdr}`, background:filter===f?`${gold}12`:'#fff', color:filter===f?dark:stone, fontSize:10, fontWeight:filter===f?700:400, cursor:'pointer' }}>
                  {f === 'ALL' ? 'All Projects' : PROJECTS.find(p=>p.id===f)?.name}
                </button>
              ))}
            </div>

            {/* Entries */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filtered.map(entry => (
                <div key={entry.id} onClick={() => setSelected(selected?.id===entry.id ? null : entry)}
                  style={{ background:'#fff', border:`1px solid ${selected?.id===entry.id?gold:bdr}`, borderLeft:`3px solid ${gold}`, padding:'16px 20px', cursor:'pointer' }}
                  onMouseEnter={e => { if(selected?.id!==entry.id) e.currentTarget.style.borderColor=`${gold}60` }}
                  onMouseLeave={e => { if(selected?.id!==entry.id) e.currentTarget.style.borderColor=bdr; if(selected?.id!==entry.id) e.currentTarget.style.borderLeftColor=gold }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:4 }}>
                        <p style={{ ...sans, fontSize:12, fontWeight:700, color:dark, margin:0 }}>{new Date(entry.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
                        <span style={{ ...sans, fontSize:10, color:stone }}>{entry.weather}</span>
                      </div>
                      <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{entry.projectName} · {entry.supervisors}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ ...serif, fontSize:22, fontWeight:300, color:gold, margin:0 }}>{entry.workers}</p>
                      <p style={{ ...sans, fontSize:9, color:stone, margin:0, textTransform:'uppercase', letterSpacing:'0.08em' }}>workers</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:16 }}>
                    <span style={{ ...sans, fontSize:10, color:stone }}>📋 {entry.workDone.length} tasks</span>
                    <span style={{ ...sans, fontSize:10, color:stone }}>📦 {entry.materials.length} materials</span>
                    <span style={{ ...sans, fontSize:10, color:stone }}>📷 {entry.photos} photos</span>
                    {entry.safetyIncidents !== 'None' && <span style={{ ...sans, fontSize:10, color:'#ef4444', fontWeight:700 }}>⚠ Incident</span>}
                    {entry.issues !== 'None' && entry.issues && <span style={{ ...sans, fontSize:10, color:'#f97316' }}>⚡ Issue</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          {selected && (
            <div style={{ background:'#fff', overflowY:'auto', padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <p style={{ ...serif, fontSize:22, fontWeight:300, color:dark, margin:'0 0 4px' }}>{new Date(selected.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                  <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{selected.projectName} · {selected.weather}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>✕</button>
              </div>

              {/* KPIs */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
                {[['Workers',selected.workers,''],['Hours',selected.hoursOnSite,'h'],['Photos',selected.photos,'']].map(([l,v,u]) => (
                  <div key={l} style={{ background:light, border:`1px solid ${bdr}`, padding:'10px 12px', textAlign:'center' }}>
                    <p style={{ ...serif, fontSize:24, fontWeight:300, color:dark, margin:0 }}>{v}<span style={{ fontSize:11, color:stone }}>{u}</span></p>
                    <p style={{ ...sans, fontSize:8.5, color:stone, margin:'2px 0 0', textTransform:'uppercase', letterSpacing:'0.1em' }}>{l}</p>
                  </div>
                ))}
              </div>

              {/* Work done */}
              <div style={{ marginBottom:16 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Work Completed</p>
                {selected.workDone.map((w,i) => (
                  <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                    <div style={{ width:16, height:16, background:`${gold}20`, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <span style={{ fontSize:8, color:gold, fontWeight:700 }}>✓</span>
                    </div>
                    <p style={{ ...sans, fontSize:11.5, color:dark, margin:0, lineHeight:1.6 }}>{w}</p>
                  </div>
                ))}
              </div>

              {/* Materials */}
              <div style={{ marginBottom:16 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Materials Used</p>
                {selected.materials.map((m,i) => (
                  <div key={i} style={{ ...sans, fontSize:11, color:stone, padding:'5px 0', borderBottom:`1px solid ${bdr}` }}>◦ {m}</div>
                ))}
              </div>

              {/* Issues */}
              {selected.issues && selected.issues !== 'None' && (
                <div style={{ background:'#fff8f0', border:'1px solid #fed7aa', padding:'12px 14px', marginBottom:12 }}>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#f97316', margin:'0 0 6px' }}>⚡ Issue</p>
                  <p style={{ ...sans, fontSize:11.5, color:dark, margin:0, lineHeight:1.6 }}>{selected.issues}</p>
                </div>
              )}
              {selected.safetyIncidents !== 'None' && (
                <div style={{ background:'#fff5f5', border:'1px solid #fecaca', padding:'12px 14px', marginBottom:12 }}>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#ef4444', margin:'0 0 6px' }}>⚠ Safety Incident</p>
                  <p style={{ ...sans, fontSize:11.5, color:dark, margin:0, lineHeight:1.6 }}>{selected.safetyIncidents}</p>
                </div>
              )}

              {/* Tomorrow */}
              <div style={{ background:dark, padding:'12px 14px', marginBottom:16 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:gold, margin:'0 0 6px' }}>Tomorrow's Plan</p>
                <p style={{ ...sans, fontSize:11.5, color:'#a8a29e', margin:0, lineHeight:1.65 }}>{selected.nextDay}</p>
              </div>

              {/* Photos */}
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Site Photos</p>
              <PhotoPlaceholder n={selected.photos} />

              <p style={{ ...sans, fontSize:9, color:'#a8a29e', margin:'12px 0 0' }}>Submitted by {selected.submittedBy} · {new Date(selected.submittedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p>
            </div>
          )}
        </div>
      )}

      {view === 'new' && (
        <div style={{ maxWidth:680, margin:'0 auto', padding:'32px 24px' }}>
          <p style={{ ...serif, fontSize:36, fontWeight:300, color:dark, margin:'0 0 6px' }}>New Site Diary Entry</p>
          <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 28px' }}>Record today's site progress, materials used, and any issues.</p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            <div>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))}
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>Project</label>
              <select value={form.project} onChange={e => { const p=PROJECTS.find(pr=>pr.id===e.target.value); setForm(f=>({...f,project:e.target.value,projectName:p?.name||''})) }}
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, background:'#fff' }}>
                {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>Weather</label>
              <select value={form.weather} onChange={e => setForm(f=>({...f,weather:e.target.value}))}
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, background:'#fff' }}>
                {WEATHER.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>Workers on Site</label>
              <input type="number" value={form.workers} onChange={e => setForm(f=>({...f,workers:e.target.value}))} placeholder="e.g. 12"
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
            </div>
          </div>

          {/* Work done */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone }}>Work Completed Today</label>
              <button onClick={() => addListItem('workDone','')} style={{ ...sans, fontSize:9, color:gold, background:'none', border:`1px solid ${gold}`, padding:'3px 10px', cursor:'pointer' }}>+ Add</button>
            </div>
            {form.workDone.map((w,i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                <input value={w} onChange={e => updateListItem('workDone',i,e.target.value)} placeholder={`Task ${i+1}…`}
                  style={{ ...sans, flex:1, padding:'8px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, boxSizing:'border-box' }} />
                {form.workDone.length > 1 && <button onClick={() => removeListItem('workDone',i)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16 }}>×</button>}
              </div>
            ))}
          </div>

          {/* Materials */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone }}>Materials Used</label>
              <button onClick={() => addListItem('materials','')} style={{ ...sans, fontSize:9, color:gold, background:'none', border:`1px solid ${gold}`, padding:'3px 10px', cursor:'pointer' }}>+ Add</button>
            </div>
            {form.materials.map((m,i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                <input value={m} onChange={e => updateListItem('materials',i,e.target.value)} placeholder={`Material and quantity…`}
                  style={{ ...sans, flex:1, padding:'8px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, boxSizing:'border-box' }} />
                {form.materials.length > 1 && <button onClick={() => removeListItem('materials',i)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16 }}>×</button>}
              </div>
            ))}
          </div>

          {[['issues','Issues / Delays (or "None")','Describe any problems, delays, material shortages…'],['safetyIncidents','Safety Incidents (or "None")','Any near-miss, injury, or unsafe condition observed…'],['nextDay',"Tomorrow's Plan",'What will the team work on tomorrow?']].map(([field,label,ph]) => (
            <div key={field} style={{ marginBottom:16 }}>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>{label}</label>
              <textarea value={form[field]} onChange={e => setForm(f=>({...f,[field]:e.target.value}))} rows={2} placeholder={ph}
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, resize:'vertical', boxSizing:'border-box', lineHeight:1.65 }} />
            </div>
          ))}

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setView('list')} style={{ ...sans, padding:'12px 24px', background:'#fff', border:`1px solid ${bdr}`, color:stone, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>Cancel</button>
            <button onClick={save} style={{ ...sans, flex:1, padding:'12px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
              Save Diary Entry →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
