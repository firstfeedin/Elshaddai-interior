import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { documents as documentsApi } from '../lib/api'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bdr   = '#e7e5e4'
const light = '#fafaf9'

const FILE_ICONS = {
  pdf:  { icon:'PDF', color:'#ef4444', bg:'#fef2f2' },
  dwg:  { icon:'DWG', color:'#f97316', bg:'#fff7ed' },
  jpg:  { icon:'IMG', color:'#8b5cf6', bg:'#f5f3ff' },
  png:  { icon:'IMG', color:'#8b5cf6', bg:'#f5f3ff' },
  xlsx: { icon:'XLS', color:'#22c55e', bg:'#f0fdf4' },
  docx: { icon:'DOC', color:'#3b82f6', bg:'#eff6ff' },
  mp4:  { icon:'VID', color:'#ec4899', bg:'#fdf2f8' },
  skp:  { icon:'3D',  color:gold,      bg:'#fffbeb' },
}
function fileInfo(name) {
  const ext = name.split('.').pop().toLowerCase()
  return FILE_ICONS[ext] || { icon: ext.toUpperCase().slice(0,3), color: stone, bg:'#f5f4f2' }
}
function fmtSize(kb) {
  if (kb >= 1024) return (kb/1024).toFixed(1)+' MB'
  return kb+' KB'
}

const PROJECTS = ['All Projects','Nair Residence','Kapoor Office','Sharma Villa','Mehta Penthouse','Sundar Restaurant']
const CATS = ['All','Drawings','Contracts','Invoices','Photos','Reports','3D Models','Specifications']

const SEED = [
  { id:1, name:'Floor_Plan_v3.dwg',           project:'Nair Residence',    cat:'Drawings',   size:1820, date:'2026-05-14', uploader:'Kiran Sharma',    tags:['approved'] },
  { id:2, name:'Client_Contract_Signed.pdf',  project:'Nair Residence',    cat:'Contracts',  size:412,  date:'2026-04-02', uploader:'Priya Menon',     tags:['signed'] },
  { id:3, name:'Invoice_INV-0023.pdf',        project:'Nair Residence',    cat:'Invoices',   size:198,  date:'2026-05-28', uploader:'Priya Menon',     tags:['paid'] },
  { id:4, name:'Site_Progress_May.jpg',       project:'Nair Residence',    cat:'Photos',     size:3200, date:'2026-05-30', uploader:'Mohammed Farook', tags:[] },
  { id:5, name:'Material_Spec_Sheet.xlsx',    project:'Nair Residence',    cat:'Specifications',size:550,date:'2026-05-10', uploader:'Kiran Sharma',    tags:['draft'] },
  { id:6, name:'Living_Room_Render_v2.png',   project:'Nair Residence',    cat:'3D Models',  size:5800, date:'2026-05-18', uploader:'Lakshmi Iyer',    tags:['approved'] },
  { id:7, name:'Structural_Drawing.dwg',      project:'Kapoor Office',     cat:'Drawings',   size:2100, date:'2026-04-22', uploader:'Kiran Sharma',    tags:[] },
  { id:8, name:'PO_Furniture_Batch1.pdf',     project:'Kapoor Office',     cat:'Invoices',   size:310,  date:'2026-05-05', uploader:'Priya Menon',     tags:['pending'] },
  { id:9, name:'3D_Walkthrough.mp4',          project:'Kapoor Office',     cat:'3D Models',  size:48000,date:'2026-04-30', uploader:'Lakshmi Iyer',    tags:[] },
  { id:10,'name':'QC_Report_Phase3.pdf',      project:'Kapoor Office',     cat:'Reports',    size:720,  date:'2026-05-25', uploader:'Priya Menon',     tags:['final'] },
  { id:11,'name':'Contract_v2_Draft.docx',    project:'Sharma Villa',      cat:'Contracts',  size:240,  date:'2026-05-12', uploader:'Priya Menon',     tags:['draft'] },
  { id:12,'name':'Elevation_East.dwg',        project:'Sharma Villa',      cat:'Drawings',   size:1600, date:'2026-05-08', uploader:'Kiran Sharma',    tags:[] },
  { id:13,'name':'Mood_Board_Final.pdf',      project:'Sharma Villa',      cat:'Reports',    size:8200, date:'2026-05-20', uploader:'Lakshmi Iyer',    tags:['approved'] },
  { id:14,'name':'Electrical_Layout.dwg',     project:'Mehta Penthouse',   cat:'Drawings',   size:1350, date:'2026-05-03', uploader:'Kiran Sharma',    tags:[] },
  { id:15,'name':'BOQ_Detailed.xlsx',         project:'Mehta Penthouse',   cat:'Specifications',size:690,date:'2026-04-28', uploader:'Priya Menon',     tags:['approved'] },
  { id:16,'name':'Site_Video_Week2.mp4',      project:'Sundar Restaurant', cat:'Photos',     size:92000,date:'2026-05-22', uploader:'Mohammed Farook', tags:[] },
  { id:17,'name':'FF&E_Specification.xlsx',   project:'Sundar Restaurant', cat:'Specifications',size:880,date:'2026-05-15', uploader:'Kiran Sharma',    tags:['draft'] },
  { id:18,'name':'SketchUp_Model_v4.skp',     project:'Sundar Restaurant', cat:'3D Models',  size:22000,date:'2026-05-27', uploader:'Lakshmi Iyer',    tags:[] },
]

const TAG_COLOR = {
  approved: { bg:'#f0fdf4', color:'#16a34a' },
  signed:   { bg:'#eff6ff', color:'#2563eb' },
  paid:     { bg:'#f0fdf4', color:'#16a34a' },
  draft:    { bg:'#fffbeb', color:'#d97706' },
  pending:  { bg:'#fef2f2', color:'#dc2626' },
  final:    { bg:'#f5f3ff', color:'#7c3aed' },
}

export default function DocumentsPage() {
  const nav = useNavigate()
  const [docs, setDocs]     = useState(SEED)
  const [proj, setProj]     = useState('All Projects')

  useEffect(() => {
    documentsApi.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (arr.length > 0) {
          setDocs(arr.map(d => ({
            id: d.id,
            name: d.file_name || d.title || 'Untitled',
            project: d.project_name || '—',
            cat: d.document_type || 'Drawings',
            size: d.file_size_kb || 0,
            date: d.created_at?.split('T')[0] || '—',
            uploader: d.uploader_name || '—',
            tags: d.tags ? d.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          })))
        }
      })
      .catch(() => {})
  }, [])
  const [cat, setCat]       = useState('All')
  const [q, setQ]           = useState('')
  const [view, setView]     = useState('grid') // grid | list
  const [sel, setSel]       = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded]   = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [upForm, setUpForm] = useState({ name:'', project:'Nair Residence', cat:'Drawings' })

  const filtered = docs.filter(d => {
    if (proj !== 'All Projects' && d.project !== proj) return false
    if (cat !== 'All' && d.cat !== cat) return false
    if (q && !d.name.toLowerCase().includes(q.toLowerCase()) && !d.project.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  function simulateUpload() {
    if (!upForm.name) return
    setUploading(true)
    setTimeout(() => {
      const ext = upForm.name.split('.').pop() || 'pdf'
      setDocs(prev => [{
        id: prev.length+1,
        name: upForm.name,
        project: upForm.project,
        cat: upForm.cat,
        size: Math.floor(Math.random()*3000)+100,
        date: new Date().toISOString().slice(0,10),
        uploader: 'You',
        tags: ['draft']
      }, ...prev])
      setUploading(false)
      setUploaded(true)
      setShowUpload(false)
      setUpForm({ name:'', project:'Nair Residence', cat:'Drawings' })
      setTimeout(() => setUploaded(false), 2500)
    }, 1600)
  }

  const totalSize = docs.reduce((a,d)=>a+d.size,0)
  const totalDocs = docs.length

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', ...sans }}>
      {/* Header */}
      <div style={{ background:dark, borderBottom:`2px solid ${gold}`, padding:'0 32px', display:'flex', alignItems:'center', height:56, gap:20 }}>
        <svg width="28" height="28" viewBox="0 0 40 40"><rect width="40" height="40" fill={gold}/><text x="8" y="27" fontSize="18" fontWeight="700" fill={dark} fontFamily="serif">ES</text></svg>
        <span style={{ ...serif, fontSize:18, color:'#fff', letterSpacing:'0.04em', fontWeight:600 }}>Document Manager</span>
        <div style={{ flex:1 }}/>
        <button onClick={()=>nav('/dashboard')} style={{ ...sans, fontSize:12, color:'#a8a29e', background:'none', border:'none', cursor:'pointer' }}>← Dashboard</button>
      </div>

      {/* KPI */}
      <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${bdr}`, background:'#fff' }}>
        {[
          ['Total Files', totalDocs, ''],
          ['Storage Used', fmtSize(totalSize), ''],
          ['Projects', PROJECTS.length-1, ''],
          ['Pending Review', docs.filter(d=>d.tags.includes('draft')).length, 'gold'],
        ].map(([label, val, accent])=>(
          <div key={label} style={{ flex:1, padding:'14px 24px', borderRight:`1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{label}</p>
            <p style={{ ...serif, fontSize:28, color: accent==='gold'?gold:dark, margin:0, fontWeight:600 }}>{val}</p>
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', padding:'0 24px', gap:10 }}>
          {uploaded && <span style={{ ...sans, fontSize:11, color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'4px 12px' }}>✓ Uploaded</span>}
          <button onClick={()=>setShowUpload(true)} style={{ ...sans, fontSize:12, fontWeight:600, background:gold, color:dark, border:'none', padding:'8px 20px', cursor:'pointer', letterSpacing:'0.06em' }}>+ UPLOAD FILE</button>
        </div>
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 112px)' }}>
        {/* Sidebar */}
        <div style={{ width:220, background:'#fff', borderRight:`1px solid ${bdr}`, padding:'16px 0', flexShrink:0, overflowY:'auto' }}>
          <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a8a29e', padding:'0 16px 8px' }}>Projects</p>
          {PROJECTS.map(p=>(
            <button key={p} onClick={()=>setProj(p)}
              style={{ width:'100%', textAlign:'left', padding:'8px 16px', background: proj===p?`${gold}12`:'none', border:'none', borderLeft: proj===p?`3px solid ${gold}`:'3px solid transparent', ...sans, fontSize:12, color: proj===p?dark:stone, cursor:'pointer' }}>
              {p}
            </button>
          ))}
          <div style={{ margin:'16px 0 8px', borderTop:`1px solid ${bdr}` }}/>
          <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a8a29e', padding:'8px 16px 8px' }}>Categories</p>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{ width:'100%', textAlign:'left', padding:'8px 16px', background: cat===c?`${gold}12`:'none', border:'none', borderLeft: cat===c?`3px solid ${gold}`:'3px solid transparent', ...sans, fontSize:12, color: cat===c?dark:stone, cursor:'pointer' }}>
              {c} <span style={{ float:'right', fontSize:10, color:'#a8a29e' }}>{c==='All'?docs.length:docs.filter(d=>d.cat===c).length}</span>
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
          {/* toolbar */}
          <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'#fff', border:`1px solid ${bdr}`, padding:'8px 14px' }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke={stone} strokeWidth="1.5"/><path d="M14 14l4 4" stroke={stone} strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search files…"
                style={{ ...sans, flex:1, border:'none', outline:'none', fontSize:13, color:dark, background:'transparent' }}/>
            </div>
            <button onClick={()=>setView('grid')} style={{ padding:'8px 14px', background:view==='grid'?dark:'#fff', border:`1px solid ${bdr}`, color:view==='grid'?'#fff':stone, cursor:'pointer', ...sans, fontSize:11 }}>Grid</button>
            <button onClick={()=>setView('list')} style={{ padding:'8px 14px', background:view==='list'?dark:'#fff', border:`1px solid ${bdr}`, color:view==='list'?'#fff':stone, cursor:'pointer', ...sans, fontSize:11 }}>List</button>
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 0', color:stone }}>
              <p style={{ ...serif, fontSize:22 }}>No files found</p>
              <p style={{ ...sans, fontSize:12 }}>Try adjusting your filters</p>
            </div>
          )}

          {view==='grid' ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
              {filtered.map(doc => {
                const fi = fileInfo(doc.name)
                return (
                  <div key={doc.id} onClick={()=>setSel(doc)}
                    style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'16px', cursor:'pointer', transition:'box-shadow 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                    <div style={{ width:48, height:48, background:fi.bg, border:`1px solid ${fi.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                      <span style={{ ...sans, fontSize:10, fontWeight:800, color:fi.color, letterSpacing:'0.05em' }}>{fi.icon}</span>
                    </div>
                    <p style={{ ...sans, fontSize:12, fontWeight:500, color:dark, margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</p>
                    <p style={{ ...sans, fontSize:10, color:stone, margin:'0 0 8px' }}>{doc.project}</p>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {doc.tags.map(t=>{
                        const tc = TAG_COLOR[t]||{}
                        return <span key={t} style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.08em', padding:'1px 5px', background:tc.bg||'#f5f4f2', color:tc.color||stone, border:`1px solid ${tc.color||bdr}30` }}>{t.toUpperCase()}</span>
                      })}
                    </div>
                    <p style={{ ...sans, fontSize:9, color:'#a8a29e', margin:'8px 0 0' }}>{fmtSize(doc.size)} · {doc.date}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', padding:'8px 16px', borderBottom:`1px solid ${bdr}`, background:'#f9f8f6' }}>
                {['File Name','Project','Category','Uploaded By','Size','Date'].map(h=>(
                  <span key={h} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone }}>{h}</span>
                ))}
              </div>
              {filtered.map((doc,i)=>{
                const fi = fileInfo(doc.name)
                return (
                  <div key={doc.id} onClick={()=>setSel(doc)}
                    style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 80px', padding:'10px 16px', borderBottom: i<filtered.length-1?`1px solid ${bdr}`:'none', cursor:'pointer', alignItems:'center' }}
                    onMouseEnter={e=>e.currentTarget.style.background=`${gold}06`}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:28, height:28, background:fi.bg, border:`1px solid ${fi.color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ ...sans, fontSize:7, fontWeight:800, color:fi.color }}>{fi.icon}</span>
                      </div>
                      <div>
                        <p style={{ ...sans, fontSize:12, color:dark, margin:0, fontWeight:500 }}>{doc.name}</p>
                        <div style={{ display:'flex', gap:4, marginTop:2 }}>
                          {doc.tags.map(t=>{
                            const tc = TAG_COLOR[t]||{}
                            return <span key={t} style={{ ...sans, fontSize:7, fontWeight:700, padding:'1px 4px', background:tc.bg||'#f5f4f2', color:tc.color||stone }}>{t.toUpperCase()}</span>
                          })}
                        </div>
                      </div>
                    </div>
                    <span style={{ ...sans, fontSize:11, color:stone }}>{doc.project}</span>
                    <span style={{ ...sans, fontSize:11, color:stone }}>{doc.cat}</span>
                    <span style={{ ...sans, fontSize:11, color:stone }}>{doc.uploader}</span>
                    <span style={{ ...sans, fontSize:11, color:stone }}>{fmtSize(doc.size)}</span>
                    <span style={{ ...sans, fontSize:11, color:stone }}>{doc.date}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ width:300, background:'#fff', borderLeft:`1px solid ${bdr}`, padding:24, overflowY:'auto', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ ...serif, fontSize:16, color:dark, fontWeight:600 }}>File Details</span>
              <button onClick={()=>setSel(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>×</button>
            </div>
            {(() => {
              const fi = fileInfo(sel.name)
              return (
                <>
                  <div style={{ width:'100%', height:100, background:fi.bg, border:`1px solid ${fi.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                    <span style={{ ...sans, fontSize:24, fontWeight:800, color:fi.color, letterSpacing:'0.05em' }}>{fi.icon}</span>
                  </div>
                  <p style={{ ...sans, fontSize:13, fontWeight:600, color:dark, margin:'0 0 4px', wordBreak:'break-all' }}>{sel.name}</p>
                  <p style={{ ...sans, fontSize:11, color:stone, margin:'0 0 20px' }}>{sel.cat} · {fmtSize(sel.size)}</p>
                  {[
                    ['Project', sel.project],
                    ['Uploaded By', sel.uploader],
                    ['Date', sel.date],
                    ['Category', sel.cat],
                  ].map(([k,v])=>(
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                      <span style={{ ...sans, fontSize:10, color:stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>{k}</span>
                      <span style={{ ...sans, fontSize:11, color:dark }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:12, display:'flex', gap:4, flexWrap:'wrap' }}>
                    {sel.tags.map(t=>{
                      const tc = TAG_COLOR[t]||{}
                      return <span key={t} style={{ ...sans, fontSize:9, fontWeight:700, padding:'2px 8px', background:tc.bg||'#f5f4f2', color:tc.color||stone, border:`1px solid ${tc.color||bdr}30` }}>{t.toUpperCase()}</span>
                    })}
                  </div>
                  <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:8 }}>
                    <button style={{ ...sans, fontSize:11, fontWeight:600, background:gold, color:dark, border:'none', padding:'10px', cursor:'pointer', letterSpacing:'0.06em' }}>⬇ DOWNLOAD</button>
                    <button style={{ ...sans, fontSize:11, fontWeight:600, background:'#fff', color:dark, border:`1px solid ${bdr}`, padding:'10px', cursor:'pointer', letterSpacing:'0.06em' }}>SHARE LINK</button>
                    <button style={{ ...sans, fontSize:11, fontWeight:600, background:'#fff', color:'#ef4444', border:`1px solid #fecaca`, padding:'10px', cursor:'pointer', letterSpacing:'0.06em' }}>DELETE</button>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', width:440, padding:28, border:`1px solid ${bdr}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ ...serif, fontSize:20, color:dark, fontWeight:600 }}>Upload File</span>
              <button onClick={()=>setShowUpload(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:stone }}>×</button>
            </div>
            <div style={{ border:`2px dashed ${bdr}`, padding:'32px', textAlign:'center', marginBottom:16, background:'#fafaf9' }}>
              <p style={{ ...sans, fontSize:13, color:stone, margin:0 }}>Drag & drop or</p>
              <p style={{ ...serif, fontSize:18, color:gold, margin:'8px 0 0', cursor:'pointer' }}>Browse Files</p>
            </div>
            {[
              ['File Name (with extension)', 'name', 'text', 'e.g. Floor_Plan_v4.dwg'],
              ['Project', 'project', 'select', PROJECTS.slice(1)],
              ['Category', 'cat', 'select', CATS.slice(1)],
            ].map(([label,key,type,opts])=>(
              <div key={key} style={{ marginBottom:12 }}>
                <label style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, display:'block', marginBottom:4 }}>{label}</label>
                {type==='text' ? (
                  <input value={upForm[key]} onChange={e=>setUpForm(p=>({...p,[key]:e.target.value}))}
                    placeholder={opts} style={{ ...sans, width:'100%', padding:'8px 10px', border:`1px solid ${bdr}`, outline:'none', fontSize:13, boxSizing:'border-box' }}/>
                ) : (
                  <select value={upForm[key]} onChange={e=>setUpForm(p=>({...p,[key]:e.target.value}))}
                    style={{ ...sans, width:'100%', padding:'8px 10px', border:`1px solid ${bdr}`, outline:'none', fontSize:13, background:'#fff' }}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}
            <button onClick={simulateUpload} disabled={uploading}
              style={{ ...sans, width:'100%', padding:'11px', background: uploading?stone:gold, color:dark, border:'none', cursor: uploading?'not-allowed':'pointer', fontSize:12, fontWeight:700, letterSpacing:'0.1em', marginTop:8 }}>
              {uploading ? 'UPLOADING…' : 'UPLOAD FILE'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
