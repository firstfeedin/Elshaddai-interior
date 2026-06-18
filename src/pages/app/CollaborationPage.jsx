import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projects as projectsApi } from '../../lib/api'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const MOCK_PROJECT = {
  id:'demo', name:'Mehta Villa – Living Room', status:'DESIGN', client:'Deepak Mehta',
  designer:'Priya Krishnaswamy', area:420, style:'Contemporary',
  updatedAt: new Date().toISOString(),
}

const MOCK_COMMENTS = [
  { id:1, author:'Deepak Mehta',       role:'CLIENT',   avatar:'DM', text:'Can we use lighter shades for the sofa? Something in beige or off-white.', time:'2 hr ago',  likes:1, resolved:false },
  { id:2, author:'Priya Krishnaswamy', role:'DESIGNER', avatar:'PK', text:"Absolutely! I'll update the render with linen and warm ivory swatches. Will share by EOD.", time:'1 hr ago', likes:0, resolved:false },
  { id:3, author:'Ravi Mohan',         role:'BUILDER',  avatar:'RM', text:"Site measurement confirmed: 18' × 22'. Ready for execution drawings.", time:'45 min ago', likes:2, resolved:true },
]

const STATUS_STEPS = ['INQUIRY','DESIGN','PROCUREMENT','EXECUTION','HANDOVER']

// Square initials avatar — matches dashboard design
function Initials({ text, size=32 }) {
  return (
    <div style={{ width:size, height:size, background:dark, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ ...sans, fontSize:size*0.3, fontWeight:700, color:gold }}>{text}</span>
    </div>
  )
}

export default function CollaborationPage() {
  const { id } = useParams()
  const [project,    setProject]    = useState(MOCK_PROJECT)
  const [comments,   setComments]   = useState(MOCK_COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [activeTab,  setActiveTab]  = useState('comments')
  const [copied,     setCopied]     = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [approved,   setApproved]   = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (id && id !== 'demo') {
      projectsApi.get(id).then(p => p && setProject(p)).catch(()=>{})
    }
  }, [id])

  const shareUrl = `${window.location.origin}/collaborate/${project.id}`
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false), 2000) })
  }

  const postComment = () => {
    if (!newComment.trim()) return
    const user = JSON.parse(localStorage.getItem('es_user') || '{}')
    const initials = (user.name||'You').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
    setComments(prev => [...prev, {
      id: Date.now(), author: user.name||'You', role: user.role||'CLIENT',
      avatar: initials, text: newComment.trim(), time: 'just now', likes:0, resolved:false,
    }])
    setNewComment('')
  }

  const toggleResolved = cid => setComments(prev => prev.map(c => c.id===cid ? { ...c, resolved:!c.resolved } : c))
  const likeCmt        = cid => setComments(prev => prev.map(c => c.id===cid ? { ...c, likes:c.likes+1 } : c))
  const stepIdx        = STATUS_STEPS.indexOf(project.status ?? 'DESIGN')

  const BtnPrimary = ({ onClick, children }) => (
    <button onClick={onClick} style={{ ...sans, padding:'7px 16px', background:'transparent', border:`1px solid ${bdr}`, color:stone, cursor:'pointer', fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=dark; e.currentTarget.style.color=dark }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=bdr;  e.currentTarget.style.color=stone }}>
      {children}
    </button>
  )

  return (
    <div style={{ ...sans, minHeight:'100vh', background:light, color:dark }}>

      {/* Top bar */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${bdr}`, padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Link to="/dashboard" style={{ textDecoration:'none', color:stone, fontSize:12, letterSpacing:'0.05em' }}>← Dashboard</Link>
          <span style={{ color:bdr }}>|</span>
          <span style={{ ...serif, fontSize:20, fontWeight:300, color:dark }}>{project.name}</span>
          <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:gold, border:`1px solid ${gold}`, padding:'3px 10px' }}>{project.status}</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={copyLink} style={{ ...sans, display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background: copied ? light : '#fff', border:`1px solid ${copied ? '#4ade80' : bdr}`, color: copied ? '#4ade80' : stone, cursor:'pointer', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            {copied ? '✓ Copied' : '⎘ Share Link'}
          </button>
          <button onClick={()=>setReviewMode(r=>!r)} style={{ ...sans, padding:'7px 14px', background: reviewMode ? dark : '#fff', border:`1px solid ${dark}`, color: reviewMode ? '#fff' : dark, cursor:'pointer', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            {reviewMode ? '✕ Exit Review' : '◉ Client Review'}
          </button>
        </div>
      </div>

      {/* Client Review banner */}
      {reviewMode && (
        <div style={{ background:dark, padding:'12px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid #2a2520` }}>
          <div>
            <p style={{ ...sans, margin:0, fontSize:10, fontWeight:700, color:gold, letterSpacing:'0.18em', textTransform:'uppercase' }}>Client Review Mode</p>
            <p style={{ ...sans, margin:'3px 0 0', fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:300 }}>Your client sees this view — they can comment and approve the design.</p>
          </div>
          {!approved ? (
            <button onClick={()=>setApproved(true)} style={{ ...sans, padding:'8px 20px', background:gold, border:'none', color:'#000', cursor:'pointer', fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase' }}>
              ✓ Approve Design
            </button>
          ) : (
            <span style={{ ...sans, fontSize:10, fontWeight:700, color:'#4ade80', letterSpacing:'0.18em', textTransform:'uppercase' }}>✓ Design Approved</span>
          )}
        </div>
      )}

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px', display:'grid', gridTemplateColumns:'1fr 360px', gap:24 }}>

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Progress stepper — sharp squares */}
          <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'22px 26px' }}>
            <p style={{ ...sans, margin:'0 0 18px', fontSize:9, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'#a8a29e' }}>Project Progress</p>
            <div style={{ display:'flex', alignItems:'center' }}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} style={{ display:'flex', alignItems:'center', flex: i < STATUS_STEPS.length-1 ? 1 : 0 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <div style={{ width:28, height:28, background: i < stepIdx ? gold : i===stepIdx ? dark : 'transparent', border:`1.5px solid ${i<=stepIdx ? gold : bdr}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {i < stepIdx
                        ? <span style={{ ...sans, fontSize:11, color:'#000', fontWeight:700 }}>✓</span>
                        : i===stepIdx
                          ? <div style={{ width:8, height:8, background:gold }} />
                          : null}
                    </div>
                    <span style={{ ...sans, fontSize:8, fontWeight: i===stepIdx ? 700 : 400, color: i===stepIdx ? gold : '#a8a29e', textTransform:'uppercase', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{step}</span>
                  </div>
                  {i < STATUS_STEPS.length-1 && (
                    <div style={{ flex:1, height:1, background: i < stepIdx ? gold : bdr, margin:'0 6px', marginTop:-18 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Design preview */}
          <div style={{ background:'#fff', border:`1px solid ${bdr}`, overflow:'hidden' }}>
            <div style={{ height:320, background:dark, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <div style={{ textAlign:'center', color:'#fff' }}>
                <p style={{ ...serif, fontSize:26, fontWeight:300, margin:'0 0 8px' }}>3D Design Preview</p>
                <p style={{ ...sans, fontSize:11, color:'rgba(255,255,255,0.35)', margin:0, letterSpacing:'0.08em' }}>Interactive render · {project.area} sq ft · {project.style}</p>
              </div>
              <Link to="/designer" style={{ ...sans, position:'absolute', bottom:16, right:16, padding:'8px 18px', background:gold, color:'#000', textDecoration:'none', fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                Open in Designer →
              </Link>
            </div>
            <div style={{ padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, borderTop:`1px solid ${bdr}` }}>
              {[
                { label:'Designer', value: project.designer||'—' },
                { label:'Client',   value: project.client||project.clientName||'—' },
                { label:'Area',     value: `${project.area??'—'} sq ft` },
              ].map(r => (
                <div key={r.label}>
                  <p style={{ ...sans, margin:'0 0 2px', fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#a8a29e' }}>{r.label}</p>
                  <p style={{ ...sans, margin:0, fontSize:13, color:dark, fontWeight:500 }}>{r.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ ...sans, margin:0, fontSize:9, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'#a8a29e' }}>Shared Files</p>
              <button style={{ ...sans, padding:'5px 14px', background:gold, border:'none', color:'#000', cursor:'pointer', fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase' }}>+ Upload</button>
            </div>
            {[
              { name:'Floor Plan — Rev 3.pdf',       size:'2.4 MB', icon:'📄', date:'Today'     },
              { name:'Material Board.jpg',            size:'8.1 MB', icon:'🖼️', date:'Yesterday' },
              { name:'3D Render — Living Room.png',  size:'12.3 MB',icon:'🖼️', date:'2 days ago' },
              { name:'BOQ Estimate.xlsx',             size:'340 KB', icon:'📊', date:'3 days ago' },
            ].map(f => (
              <div key={f.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${bdr}` }}>
                <span style={{ fontSize:18 }}>{f.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ ...sans, margin:'0 0 1px', fontSize:12, fontWeight:500, color:dark }}>{f.name}</p>
                  <p style={{ ...sans, margin:0, fontSize:10, color:'#a8a29e', fontWeight:300 }}>{f.size} · {f.date}</p>
                </div>
                <button style={{ ...sans, padding:'4px 12px', background:'transparent', border:`1px solid ${bdr}`, color:stone, cursor:'pointer', fontSize:10, fontWeight:600 }}>↓</button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — comments panel */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          <div style={{ background:'#fff', border:`1px solid ${bdr}`, display:'flex', flexDirection:'column', height:'100%', maxHeight:720 }}>

            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:`1px solid ${bdr}` }}>
              {[['comments','💬 Comments'],['activity','◎ Activity'],['approvals','✓ Approvals']].map(([tid,lb])=>(
                <button key={tid} onClick={()=>setActiveTab(tid)} style={{ ...sans, flex:1, padding:'12px 6px', border:'none', background:'none', cursor:'pointer', fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: activeTab===tid ? dark : '#a8a29e', borderBottom:`2px solid ${activeTab===tid ? gold : 'transparent'}`, marginBottom:-1 }}>
                  {lb}
                </button>
              ))}
            </div>

            {activeTab==='comments' && (
              <>
                <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ marginBottom:20, opacity: c.resolved ? 0.5 : 1 }}>
                      <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                        <Initials text={c.avatar} size={32} />
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                            <span style={{ ...sans, fontSize:12, fontWeight:700, color:dark }}>{c.author}</span>
                            <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold }}>{c.role}</span>
                            {c.resolved && <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'#4ade80', textTransform:'uppercase' }}>✓ Resolved</span>}
                          </div>
                          <p style={{ ...sans, margin:'0 0 8px', fontSize:12, color:stone, lineHeight:1.65, fontWeight:300 }}>{c.text}</p>
                          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                            <span style={{ ...sans, fontSize:10, color:'#a8a29e', fontWeight:300 }}>{c.time}</span>
                            <button onClick={()=>likeCmt(c.id)} style={{ ...sans, fontSize:10, color:stone, background:'none', border:'none', cursor:'pointer', fontWeight:400 }}>♡ {c.likes}</button>
                            <button onClick={()=>toggleResolved(c.id)} style={{ ...sans, fontSize:10, color: c.resolved ? '#4ade80' : stone, background:'none', border:'none', cursor:'pointer', fontWeight:600, letterSpacing:'0.08em' }}>
                              {c.resolved ? '↩ Reopen' : '✓ Resolve'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:'12px 16px', borderTop:`1px solid ${bdr}`, display:'flex', gap:8 }}>
                  <textarea ref={inputRef} value={newComment} onChange={e=>setNewComment(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); postComment() } }}
                    placeholder="Add a comment… (Enter to post)"
                    style={{ ...sans, flex:1, resize:'none', height:56, padding:'8px 10px', border:`1px solid ${bdr}`, fontSize:12, color:dark, outline:'none', fontWeight:300 }} />
                  <button onClick={postComment} style={{ padding:'0 14px', background:gold, border:'none', color:'#000', cursor:'pointer', fontSize:16, fontWeight:700 }}>↑</button>
                </div>
              </>
            )}

            {activeTab==='activity' && (
              <div style={{ padding:'16px', overflowY:'auto', flex:1 }}>
                {[
                  { text:'Priya K. uploaded 3D render', time:'2 hr ago',  icon:'🖼️' },
                  { text:'Floor plan Rev 3 shared',     time:'5 hr ago',  icon:'📄' },
                  { text:'Project moved to DESIGN',     time:'1 day ago', icon:'→'  },
                  { text:'Deepak M. approved concept',  time:'2 day ago', icon:'✓'  },
                  { text:'Project created',             time:'3 day ago', icon:'◎'  },
                ].map((a,i) => (
                  <div key={i} style={{ display:'flex', gap:14, paddingBottom:14, marginBottom:14, borderBottom:`1px solid ${bdr}` }}>
                    <span style={{ ...sans, fontSize:14, width:20, flexShrink:0, color:gold }}>{a.icon}</span>
                    <div>
                      <p style={{ ...sans, margin:'0 0 2px', fontSize:12, color:dark, fontWeight:300 }}>{a.text}</p>
                      <p style={{ ...sans, margin:0, fontSize:10, color:'#a8a29e', fontWeight:300 }}>{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='approvals' && (
              <div style={{ padding:'16px', overflowY:'auto', flex:1 }}>
                {[
                  { stage:'Concept Design', status:'APPROVED', by:'Deepak Mehta', date:'3 days ago' },
                  { stage:'Floor Plan',     status:'APPROVED', by:'Deepak Mehta', date:'1 day ago'  },
                  { stage:'Material Board', status:'PENDING',  by:'—',            date:'—'          },
                  { stage:'3D Render',      status:'PENDING',  by:'—',            date:'—'          },
                  { stage:'Final BOQ',      status:'PENDING',  by:'—',            date:'—'          },
                ].map((a,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:`1px solid ${bdr}` }}>
                    <div>
                      <p style={{ ...sans, margin:'0 0 2px', fontSize:12, fontWeight:600, color:dark }}>{a.stage}</p>
                      {a.by!=='—' && <p style={{ ...sans, margin:0, fontSize:10, color:'#a8a29e', fontWeight:300 }}>by {a.by} · {a.date}</p>}
                    </div>
                    <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: a.status==='APPROVED' ? '#4ade80' : gold }}>
                      {a.status==='APPROVED' ? '✓ ' : '— '}{a.status}
                    </span>
                  </div>
                ))}
                {approved && (
                  <div style={{ marginTop:16, padding:'14px 16px', background:dark, border:`1px solid ${gold}` }}>
                    <p style={{ ...sans, margin:0, fontSize:11, fontWeight:700, color:gold, letterSpacing:'0.1em', textTransform:'uppercase' }}>✓ Design Approved by Client</p>
                    <p style={{ ...sans, margin:'4px 0 0', fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:300 }}>Ready to proceed to procurement phase.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
