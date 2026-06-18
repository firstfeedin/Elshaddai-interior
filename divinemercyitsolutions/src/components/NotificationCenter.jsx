import { useState, useEffect, useRef } from 'react'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const TYPE_ICON = {
  comment:  { icon:'💬', label:'Comment'  },
  status:   { icon:'→',  label:'Status'   },
  approval: { icon:'✓',  label:'Approval' },
  payment:  { icon:'₹',  label:'Payment'  },
  alert:    { icon:'⚠', label:'Alert'    },
  upload:   { icon:'↑',  label:'Upload'   },
}

const SEED = [
  { id:1, type:'comment',  text:'Priya K. replied to your comment on Floor Plan Rev 3',     time:'5 min ago',  read:false },
  { id:2, type:'status',   text:'Project ES-2025-0001 moved to EXECUTION phase',             time:'1 hr ago',   read:false },
  { id:3, type:'approval', text:'Deepak Mehta approved the Material Board',                  time:'2 hr ago',   read:false },
  { id:4, type:'upload',   text:'3D Render — Living Room.png has been shared with you',      time:'3 hr ago',   read:true  },
  { id:5, type:'payment',  text:'Payment milestone DUE: Mid-Execution (₹5,25,000)',          time:'1 day ago',  read:true  },
  { id:6, type:'alert',    text:'Task "Granite countertop" is BLOCKED — material delay',     time:'1 day ago',  read:true  },
]

export default function NotificationCenter() {
  const [open,  setOpen]  = useState(false)
  const [notes, setNotes] = useState(SEED)
  const ref = useRef(null)

  const unread = notes.filter(n => !n.read).length

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setNotes(prev => [{ id:Date.now(), type:'comment', read:false, time:'just now', text:'New comment on Mehta Villa — Living Room design' }, ...prev])
    }, 30000)
    return () => clearTimeout(t)
  }, [])

  const markAll = () => setNotes(n => n.map(x => ({ ...x, read:true })))
  const markOne = id => setNotes(n => n.map(x => x.id===id ? { ...x, read:true } : x))
  const dismiss = id => setNotes(n => n.filter(x => x.id!==id))

  return (
    <div ref={ref} style={{ position:'relative' }}>

      {/* Bell button */}
      <button onClick={()=>setOpen(o=>!o)} style={{ position:'relative', width:34, height:34, background: open ? light : 'transparent', border:`1px solid ${open ? bdr : 'transparent'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
        🔔
        {unread > 0 && (
          <span style={{ position:'absolute', top:2, right:2, width:14, height:14, background:'#ef4444', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#fff' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown — sharp, no border-radius */}
      {open && (
        <div style={{ position:'absolute', top:42, right:0, width:360, background:'#fff', boxShadow:'0 8px 40px rgba(0,0,0,0.12)', border:`1px solid ${bdr}`, zIndex:1000 }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:`1px solid ${bdr}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ ...serif, fontSize:16, fontWeight:300, color:dark }}>Notifications</span>
              {unread > 0 && (
                <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold, border:`1px solid ${gold}`, padding:'2px 8px' }}>{unread} new</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAll} style={{ ...sans, fontSize:10, color:stone, background:'none', border:'none', cursor:'pointer', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Mark all read</button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight:380, overflowY:'auto' }}>
            {notes.length === 0 && (
              <div style={{ padding:'40px 18px', textAlign:'center' }}>
                <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#a8a29e', margin:'0 0 4px' }}>All caught up</p>
                <p style={{ ...sans, fontSize:11, color:'#a8a29e', margin:0, fontWeight:300 }}>No new notifications</p>
              </div>
            )}
            {notes.map(n => {
              const t = TYPE_ICON[n.type] || TYPE_ICON.alert
              return (
                <div key={n.id} onClick={()=>markOne(n.id)}
                  style={{ display:'flex', gap:12, padding:'12px 18px', background: n.read ? '#fff' : `${gold}06`, borderBottom:`1px solid ${bdr}`, cursor:'pointer', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=light}
                  onMouseLeave={e=>e.currentTarget.style.background=n.read?'#fff':`${gold}06`}>

                  {/* Square icon */}
                  <div style={{ width:32, height:32, background: n.read ? light : dark, border:`1px solid ${n.read ? bdr : gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, color: n.read ? stone : gold }}>
                    {t.icon}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ ...sans, margin:'0 0 3px', fontSize:12, color:dark, lineHeight:1.45, fontWeight: n.read ? 300 : 500 }}>{n.text}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: n.read ? '#a8a29e' : gold }}>{t.label}</span>
                      <span style={{ color:bdr }}>·</span>
                      <span style={{ ...sans, fontSize:10, color:'#a8a29e', fontWeight:300 }}>{n.time}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
                    {!n.read && <div style={{ width:6, height:6, background:gold }} />}
                    <button onClick={e=>{ e.stopPropagation(); dismiss(n.id) }}
                      style={{ width:18, height:18, background:light, border:`1px solid ${bdr}`, cursor:'pointer', fontSize:10, color:'#a8a29e', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding:'10px 18px', borderTop:`1px solid ${bdr}`, textAlign:'center' }}>
            <button onClick={()=>setOpen(false)} style={{ ...sans, fontSize:10, color:stone, background:'none', border:'none', cursor:'pointer', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
