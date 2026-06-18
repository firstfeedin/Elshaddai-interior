import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications as notifApi } from '../../lib/api'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bdr   = '#e7e5e4'

const TYPES = {
  APPROVAL:   { icon:'✓', color:'#22c55e',  bg:'#f0fdf4',  label:'Approval' },
  PAYMENT:    { icon:'₹', color:gold,        bg:'#fffbeb',  label:'Payment' },
  TASK:       { icon:'▦', color:'#3b82f6',  bg:'#eff6ff',  label:'Task' },
  ALERT:      { icon:'!', color:'#ef4444',  bg:'#fef2f2',  label:'Alert' },
  MESSAGE:    { icon:'◎', color:'#8b5cf6',  bg:'#f5f3ff',  label:'Message' },
  MILESTONE:  { icon:'◈', color:stone,       bg:'#f5f4f2',  label:'Milestone' },
  SYSTEM:     { icon:'⚙', color:'#94a3b8',  bg:'#f8fafc',  label:'System' },
  DOCUMENT:   { icon:'📄', color:'#0ea5e9', bg:'#f0f9ff',  label:'Document' },
}

function relTime(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins/60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs/24)}d ago`
}

const NOW = new Date()
function minsAgo(m) { return new Date(NOW - m*60000).toISOString() }

const SEED = [
  { id:1,  type:'APPROVAL',  title:'Contract signed by Deepa Nair',          body:'CTR-0018 for Nair Residence has been fully executed by both parties.',              project:'Nair Residence',    time:minsAgo(3),    read:false, priority:'high' },
  { id:2,  type:'PAYMENT',   title:'Invoice INV-0023 marked paid',            body:'₹2,78,000 received. Balance outstanding: ₹1,11,000.',                              project:'Nair Residence',    time:minsAgo(18),   read:false, priority:'high' },
  { id:3,  type:'ALERT',     title:'PO-0047 is overdue by 15 days',           body:'Polished Stone Imports has not delivered Granite Counter Slab for Sundar Restaurant.', project:'Sundar Restaurant', time:minsAgo(42),   read:false, priority:'critical' },
  { id:4,  type:'TASK',      title:'QC checklist Phase 3 assigned to you',    body:'Kiran Sharma has assigned the QC Phase 3 inspection for Kapoor Office.',           project:'Kapoor Office',     time:minsAgo(95),   read:false, priority:'normal' },
  { id:5,  type:'MESSAGE',   title:'New message from Vinay Kapoor',           body:'"Can we move the boardroom partition to the right by 2 feet? Please confirm."',    project:'Kapoor Office',     time:minsAgo(130),  read:true,  priority:'normal' },
  { id:6,  type:'MILESTONE', title:'Kapoor Office reached QC Phase',          body:'Project PRJ-0009 advanced from INSTALLATION to QC. 90% complete.',                project:'Kapoor Office',     time:minsAgo(200),  read:true,  priority:'normal' },
  { id:7,  type:'DOCUMENT',  title:'New file uploaded: Elevation_East.dwg',  body:'Kiran Sharma uploaded a new drawing to Sharma Villa project folder.',              project:'Sharma Villa',      time:minsAgo(310),  read:true,  priority:'normal' },
  { id:8,  type:'APPROVAL',  title:'Material Change Request #MC-019 pending', body:'Change from Kajaria tiles to Somany tiles for Kapoor Office. Value: +₹18,000.',   project:'Kapoor Office',     time:minsAgo(450),  read:true,  priority:'high' },
  { id:9,  type:'SYSTEM',    title:'Audit log: New login from unknown device', body:'Login from IP 103.45.67.200 (Chrome / Windows). If this wasn\'t you, secure your account.', project:null, time:minsAgo(600),  read:true,  priority:'critical' },
  { id:10, type:'PAYMENT',   title:'Invoice INV-0021 overdue by 7 days',      body:'₹3,20,000 from Vinay Kapoor (Kapoor Office) is 7 days past due.',                project:'Kapoor Office',     time:minsAgo(720),  read:true,  priority:'high' },
  { id:11, type:'TASK',      title:'Site diary not submitted for 2 days',     body:'Mohammed Farook has not submitted a site diary for Nair Residence since 14 Jun.',  project:'Nair Residence',    time:minsAgo(900),  read:true,  priority:'normal' },
  { id:12, type:'MESSAGE',   title:'Deepa Nair replied to gallery comment',   body:'"I love the kitchen backsplash! Can we use the same tiles for the utility?" ',    project:'Nair Residence',    time:minsAgo(1200), read:true,  priority:'normal' },
  { id:13, type:'MILESTONE', title:'Nair Residence: INSTALLATION started',    body:'Phase advanced from MATERIALS_PROCURED to INSTALLATION. 72% complete.',           project:'Nair Residence',    time:minsAgo(1440), read:true,  priority:'normal' },
  { id:14, type:'DOCUMENT',  title:'Contract CTR-0020 sent to Rahul Sharma',  body:'Contract for Sharma Villa (₹56,00,000) sent for e-signature via platform.',       project:'Sharma Villa',      time:minsAgo(2100), read:true,  priority:'normal' },
  { id:15, type:'ALERT',     title:'Low stock: Teak Veneer Sheets',           body:'Current stock: 22 sqft. Reorder point: 50 sqft. Raise PO from Inventory.',        project:null,                time:minsAgo(2880), read:true,  priority:'high' },
]

const PRIORITY_COLOR = {
  critical: { bg:'#fef2f2', color:'#dc2626', label:'CRITICAL' },
  high:     { bg:'#fffbeb', color:'#d97706', label:'HIGH' },
  normal:   { bg:'#f5f4f2', color:stone,     label:'NORMAL' },
}

function mapApiNotif(n) {
  return {
    id: n.id,
    type: n.type || 'SYSTEM',
    title: n.title || 'Notification',
    body: n.message || '',
    project: n.project_name || null,
    time: n.created_at || new Date().toISOString(),
    read: !!n.is_read,
    priority: n.priority || 'normal',
  }
}

export default function NotificationsPage() {
  const nav = useNavigate()
  const [notifs, setNotifs] = useState(SEED)
  const [filter, setFilter] = useState('all')
  const [sel, setSel] = useState(null)

  useEffect(() => {
    notifApi.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (arr.length > 0) setNotifs(arr.map(mapApiNotif))
      })
      .catch(() => {})
  }, [])

  function markRead(id) {
    setNotifs(prev => prev.map(n => n.id===id ? {...n, read:true} : n))
    notifApi.markRead(id).catch(()=>{})
  }
  function markAllRead() {
    setNotifs(prev => prev.map(n => ({...n, read:true})))
    notifApi.markAllRead().catch(()=>{})
  }
  function dismiss(id) {
    setNotifs(prev => prev.filter(n => n.id!==id))
    if (sel?.id===id) setSel(null)
  }

  const filtered = notifs.filter(n => {
    if (filter==='unread') return !n.read
    if (filter==='all') return true
    return n.type===filter
  })

  const unreadCount = notifs.filter(n=>!n.read).length

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', ...sans }}>
      {/* Header */}
      <div style={{ background:dark, borderBottom:`2px solid ${gold}`, padding:'0 32px', display:'flex', alignItems:'center', height:56, gap:20 }}>
        <svg width="28" height="28" viewBox="0 0 40 40"><rect width="40" height="40" fill={gold}/><text x="8" y="27" fontSize="18" fontWeight="700" fill={dark} fontFamily="serif">ES</text></svg>
        <span style={{ ...serif, fontSize:18, color:'#fff', letterSpacing:'0.04em', fontWeight:600 }}>Notification Center</span>
        {unreadCount>0 && <span style={{ ...sans, fontSize:10, fontWeight:700, background:'#ef4444', color:'#fff', borderRadius:0, padding:'2px 8px', letterSpacing:'0.06em' }}>{unreadCount} UNREAD</span>}
        <div style={{ flex:1 }}/>
        <button onClick={markAllRead} style={{ ...sans, fontSize:11, color:'#a8a29e', background:'none', border:`1px solid #3a3330`, padding:'6px 14px', cursor:'pointer' }}>Mark All Read</button>
        <button onClick={()=>nav('/dashboard')} style={{ ...sans, fontSize:12, color:'#a8a29e', background:'none', border:'none', cursor:'pointer', marginLeft:8 }}>← Dashboard</button>
      </div>

      {/* KPI */}
      <div style={{ display:'flex', borderBottom:`1px solid ${bdr}`, background:'#fff' }}>
        {[
          ['Total', notifs.length],
          ['Unread', unreadCount],
          ['Critical', notifs.filter(n=>n.priority==='critical').length],
          ['High Priority', notifs.filter(n=>n.priority==='high').length],
          ['Today', notifs.filter(n=>relTime(n.time).includes('m ago')||relTime(n.time).includes('h ago')||n.time===minsAgo(0)).length],
        ].map(([l,v])=>(
          <div key={l} style={{ flex:1, padding:'12px 20px', borderRight:`1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{l}</p>
            <p style={{ ...serif, fontSize:24, color:dark, margin:0, fontWeight:600 }}>{v}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 112px)' }}>
        {/* Sidebar filters */}
        <div style={{ width:200, background:'#fff', borderRight:`1px solid ${bdr}`, padding:'16px 0', flexShrink:0 }}>
          <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a8a29e', padding:'0 16px 8px' }}>Filter</p>
          {[
            ['all', 'All Notifications', notifs.length],
            ['unread', 'Unread Only', unreadCount],
          ].map(([key, label, count])=>(
            <button key={key} onClick={()=>setFilter(key)}
              style={{ width:'100%', textAlign:'left', padding:'8px 16px', background: filter===key?`${gold}12`:'none', border:'none', borderLeft: filter===key?`3px solid ${gold}`:'3px solid transparent', ...sans, fontSize:12, color: filter===key?dark:stone, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{label}</span><span style={{ fontSize:10, color:'#a8a29e' }}>{count}</span>
            </button>
          ))}
          <div style={{ margin:'12px 0 8px', borderTop:`1px solid ${bdr}` }}/>
          <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a8a29e', padding:'0 16px 8px' }}>By Type</p>
          {Object.entries(TYPES).map(([key, t])=>{
            const count = notifs.filter(n=>n.type===key).length
            if (!count) return null
            return (
              <button key={key} onClick={()=>setFilter(key)}
                style={{ width:'100%', textAlign:'left', padding:'7px 16px', background: filter===key?`${gold}12`:'none', border:'none', borderLeft: filter===key?`3px solid ${gold}`:'3px solid transparent', ...sans, fontSize:11, color: filter===key?dark:stone, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:16, height:16, background:t.bg, border:`1px solid ${t.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:t.color }}>{t.icon}</span>
                  <span>{t.label}</span>
                </div>
                <span style={{ fontSize:10, color:'#a8a29e' }}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Feed */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.length===0 && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <p style={{ ...serif, fontSize:22, color:stone }}>No notifications</p>
            </div>
          )}
          {filtered.map(n => {
            const t = TYPES[n.type]||{}
            const pc = PRIORITY_COLOR[n.priority]||{}
            const active = sel?.id===n.id
            return (
              <div key={n.id} onClick={()=>{setSel(n);markRead(n.id)}}
                style={{ display:'flex', gap:14, padding:'16px 20px', borderBottom:`1px solid ${bdr}`, cursor:'pointer', background: active?`${gold}06`:n.read?'#fff':'#fffef9', borderLeft: !n.read?`3px solid ${gold}`:'3px solid transparent' }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.background=`${gold}04` }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background=n.read?'#fff':'#fffef9' }}>
                <div style={{ width:36, height:36, background:t.bg, border:`1px solid ${t.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>
                  <span style={{ color:t.color }}>{t.icon}</span>
                </div>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                    <p style={{ ...sans, fontSize:12, fontWeight: n.read?500:700, color:dark, margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.title}</p>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                      {n.priority!=='normal' && <span style={{ ...sans, fontSize:7, fontWeight:700, letterSpacing:'0.08em', padding:'1px 5px', background:pc.bg, color:pc.color }}>{pc.label}</span>}
                      <span style={{ ...sans, fontSize:9, color:'#a8a29e', whiteSpace:'nowrap' }}>{relTime(n.time)}</span>
                    </div>
                  </div>
                  <p style={{ ...sans, fontSize:11, color:stone, margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.body}</p>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    {n.project && <span style={{ ...sans, fontSize:9, color:stone, background:'#f5f4f2', border:`1px solid ${bdr}`, padding:'1px 8px' }}>{n.project}</span>}
                    <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.06em', color:t.color, background:t.bg, border:`1px solid ${t.color}20`, padding:'1px 6px' }}>{t.label.toUpperCase()}</span>
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();dismiss(n.id)}}
                  style={{ background:'none', border:'none', color:'#d4d0cc', cursor:'pointer', fontSize:16, flexShrink:0, alignSelf:'flex-start' }}>×</button>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ width:320, background:'#fff', borderLeft:`1px solid ${bdr}`, padding:24, overflowY:'auto', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <span style={{ ...serif, fontSize:16, color:dark, fontWeight:600 }}>Detail</span>
              <button onClick={()=>setSel(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>×</button>
            </div>
            {(() => {
              const t = TYPES[sel.type]||{}
              const pc = PRIORITY_COLOR[sel.priority]||{}
              return (
                <>
                  <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:16 }}>
                    <div style={{ width:40, height:40, background:t.bg, border:`1px solid ${t.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                      <span style={{ color:t.color }}>{t.icon}</span>
                    </div>
                    <div>
                      <p style={{ ...sans, fontSize:13, fontWeight:700, color:dark, margin:'0 0 4px' }}>{sel.title}</p>
                      <span style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.06em', padding:'1px 6px', background:t.bg, color:t.color }}>{t.label.toUpperCase()}</span>
                    </div>
                  </div>
                  <p style={{ ...sans, fontSize:12, color:stone, lineHeight:1.7, margin:'0 0 20px', background:'#fafaf9', border:`1px solid ${bdr}`, padding:12 }}>{sel.body}</p>
                  {[
                    ['Priority', <span style={{ ...sans, fontSize:10, fontWeight:700, padding:'1px 8px', background:pc.bg, color:pc.color }}>{pc.label}</span>],
                    ['Project', sel.project||'—'],
                    ['Time', relTime(sel.time)],
                    ['Status', sel.read?'Read':'Unread'],
                  ].map(([k,v])=>(
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                      <span style={{ ...sans, fontSize:10, color:stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>{k}</span>
                      <span style={{ ...sans, fontSize:11, color:dark }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
                    {sel.project && (
                      <button onClick={()=>nav('/pipeline')} style={{ ...sans, fontSize:11, fontWeight:700, background:gold, color:dark, border:'none', padding:'10px', cursor:'pointer', letterSpacing:'0.06em' }}>VIEW PROJECT</button>
                    )}
                    <button onClick={()=>dismiss(sel.id)} style={{ ...sans, fontSize:11, fontWeight:600, background:'#fff', color:'#ef4444', border:'1px solid #fecaca', padding:'10px', cursor:'pointer', letterSpacing:'0.06em' }}>DISMISS</button>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
