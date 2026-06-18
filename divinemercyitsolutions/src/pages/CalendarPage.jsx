import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { calendar as calendarApi } from '../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const EVENT_TYPES = {
  'Site Visit':      { color:'#c9a227', bg:'#c9a22718' },
  'Client Meeting':  { color:'#22c55e', bg:'#22c55e18' },
  'Delivery':        { color:'#f97316', bg:'#f9731618' },
  'Design Review':   { color:'#8b7355', bg:'#8b735518' },
  'QC Inspection':   { color:'#57534e', bg:'#57534e18' },
  'Milestone':       { color:'#ef4444', bg:'#ef444418' },
  'Payment Due':     { color:'#a855f7', bg:'#a855f718' },
  'Factory Visit':   { color:'#0ea5e9', bg:'#0ea5e918' },
}

const TODAY = new Date()
const Y = TODAY.getFullYear()
const M = TODAY.getMonth()

const SEED_EVENTS = [
  { id:1,  date:`${Y}-${String(M+1).padStart(2,'0')}-02`, title:'Site Visit — Nair Residence',       type:'Site Visit',     project:'PRJ-0012', person:'Kiran Sharma',   time:'10:00', duration:90,  notes:'Check installation progress on bedrooms.' },
  { id:2,  date:`${Y}-${String(M+1).padStart(2,'0')}-04`, title:'Client Meeting — Sharma Villa',     type:'Client Meeting', project:'PRJ-0015', person:'Priya Menon',    time:'14:30', duration:60,  notes:'Present final quotation and timeline.' },
  { id:3,  date:`${Y}-${String(M+1).padStart(2,'0')}-06`, title:'Marble Delivery — Kapoor Office',   type:'Delivery',       project:'PRJ-0009', person:'Site Team',      time:'09:00', duration:180, notes:'Italian marble tiles — 420 sqft.' },
  { id:4,  date:`${Y}-${String(M+1).padStart(2,'0')}-08`, title:'Design Review — Mehta Penthouse',   type:'Design Review',  project:'PRJ-0014', person:'Lakshmi Iyer',   time:'11:00', duration:120, notes:'3D walkthrough with client team.' },
  { id:5,  date:`${Y}-${String(M+1).padStart(2,'0')}-10`, title:'QC Inspection — Kapoor Office',     type:'QC Inspection',  project:'PRJ-0009', person:'QC Team',        time:'09:30', duration:180, notes:'Full snagging walkthrough.' },
  { id:6,  date:`${Y}-${String(M+1).padStart(2,'0')}-12`, title:'Payment Due — Nair Residence',      type:'Payment Due',    project:'PRJ-0012', person:'Priya Menon',    time:'00:00', duration:0,   notes:'INV-00048 — ₹6,30,000 due.' },
  { id:7,  date:`${Y}-${String(M+1).padStart(2,'0')}-13`, title:'Site Visit — Sharma Villa',         type:'Site Visit',     project:'PRJ-0015', person:'Kiran Sharma',   time:'08:30', duration:120, notes:'Foundation and civil check before fitout.' },
  { id:8,  date:`${Y}-${String(M+1).padStart(2,'0')}-15`, title:'Factory Visit — Production Check',  type:'Factory Visit',  project:'PRJ-0015', person:'Mohammed Farook',time:'10:00', duration:240, notes:'Wardrobe fabrication QC before dispatch.' },
  { id:9,  date:`${Y}-${String(M+1).padStart(2,'0')}-16`, title:'Client Meeting — Iyer Apartment',   type:'Client Meeting', project:'PRJ-0011', person:'Priya Menon',    time:'16:00', duration:60,  notes:'Finalize accessory selections.' },
  { id:10, date:`${Y}-${String(M+1).padStart(2,'0')}-18`, title:'Furniture Delivery — Nair',         type:'Delivery',       project:'PRJ-0012', person:'Site Team',      time:'08:00', duration:300, notes:'All bedroom furniture and living room sofa.' },
  { id:11, date:`${Y}-${String(M+1).padStart(2,'0')}-20`, title:'Milestone — Installation 100%',     type:'Milestone',      project:'PRJ-0012', person:'All',            time:'00:00', duration:0,   notes:'Target: all installation complete.' },
  { id:12, date:`${Y}-${String(M+1).padStart(2,'0')}-22`, title:'Design Review — Kapoor Phase 2',    type:'Design Review',  project:'PRJ-0009', person:'Lakshmi Iyer',   time:'14:00', duration:90,  notes:'Phase 2 — training room and cafeteria.' },
  { id:13, date:`${Y}-${String(M+1).padStart(2,'0')}-24`, title:'Site Visit — Mehta Penthouse',      type:'Site Visit',     project:'PRJ-0014', person:'Kiran Sharma',   time:'11:00', duration:120, notes:'Post-approval site survey.' },
  { id:14, date:`${Y}-${String(M+1).padStart(2,'0')}-26`, title:'QC Final — Kapoor Office',          type:'QC Inspection',  project:'PRJ-0009', person:'Priya Menon',    time:'10:00', duration:180, notes:'Final handover inspection.' },
  { id:15, date:`${Y}-${String(M+1).padStart(2,'0')}-28`, title:'Client Handover — Kapoor Office',   type:'Milestone',      project:'PRJ-0009', person:'All',            time:'17:00', duration:60,  notes:'Keys handover ceremony.' },
  { id:16, date:`${Y}-${String(M+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, title:'Today: Site Visit — Nair Residence', type:'Site Visit', project:'PRJ-0012', person:'Kiran Sharma', time:'10:00', duration:90, notes:'Morning inspection.' },
  { id:17, date:`${Y}-${String(M+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`, title:'Team Sync — All Projects', type:'Client Meeting', project:'ALL', person:'Priya Menon', time:'15:00', duration:60, notes:'Weekly status update.' },
]

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function isSameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate() }

function EventPill({ ev, onClick }) {
  const t = EVENT_TYPES[ev.type] || { color:gold, bg:`${gold}18` }
  return (
    <div onClick={e => { e.stopPropagation(); onClick(ev) }}
      style={{ background:t.bg, borderLeft:`2px solid ${t.color}`, padding:'2px 5px', marginBottom:2, cursor:'pointer', overflow:'hidden' }}
      onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity='1'}>
      <p style={{ ...sans, fontSize:9, color:t.color, fontWeight:600, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {ev.time !== '00:00' && <span style={{ opacity:0.7 }}>{ev.time} </span>}{ev.title}
      </p>
    </div>
  )
}

export default function CalendarPage() {
  const [curYear,  setCurYear]  = useState(Y)
  const [curMonth, setCurMonth] = useState(M)
  const [view,     setView]     = useState('month') // month | week | list
  const [events,   setEvents]   = useState(SEED_EVENTS)
  const [selected, setSelected] = useState(null)
  const [showNew,  setShowNew]  = useState(false)
  const [newEv,    setNewEv]    = useState({ title:'', type:'Site Visit', project:'PRJ-0012', person:'', time:'09:00', date:'', duration:60, notes:'' })
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    calendarApi.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (arr.length > 0) {
          setEvents(arr.map(e => ({
            id: e.id,
            date: e.event_date || e.date || '',
            title: e.title || 'Event',
            type: e.event_type || 'Site Visit',
            project: String(e.project_id || 'PRJ-0012'),
            person: e.attendees || '',
            time: e.start_time || '09:00',
            duration: e.duration_mins || 60,
            notes: e.notes || '',
          })))
        }
      })
      .catch(() => {})
  }, [])

  function prevMonth() { if(curMonth===0){ setCurMonth(11); setCurYear(y=>y-1) } else setCurMonth(m=>m-1) }
  function nextMonth() { if(curMonth===11){ setCurMonth(0);  setCurYear(y=>y+1) } else setCurMonth(m=>m+1) }

  const firstDay = new Date(curYear, curMonth, 1).getDay()
  const daysInMonth = new Date(curYear, curMonth+1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)]
  while (cells.length % 7 !== 0) cells.push(null)

  function eventsOn(day) {
    if (!day) return []
    const dateStr = `${curYear}-${String(curMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.date === dateStr && (typeFilter==='ALL' || e.type===typeFilter))
  }

  function saveNewEvent() {
    if (!newEv.title || !newEv.date) return
    const saved = { ...newEv, id: Date.now() }
    setEvents(ev => [...ev, saved])
    setShowNew(false)
    setNewEv({ title:'', type:'Site Visit', project:'PRJ-0012', person:'', time:'09:00', date:'', duration:60, notes:'' })
    calendarApi.create({
      title: newEv.title,
      event_date: newEv.date,
      event_type: newEv.type,
      project_id: newEv.project || null,
      attendees: newEv.person,
      start_time: newEv.time,
      duration_mins: newEv.duration,
      notes: newEv.notes,
    }).catch(() => {})
  }

  const todayStr = `${Y}-${String(M+1).padStart(2,'0')}-${String(TODAY.getDate()).padStart(2,'0')}`
  const upcomingEvents = [...events]
    .filter(e => e.date >= todayStr && (typeFilter==='ALL'||e.type===typeFilter))
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const F = ({label,children}) => (
    <div style={{ marginBottom:12 }}>
      <label style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, display:'block', marginBottom:5 }}>{label}</label>
      {children}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      {/* Header */}
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="14" stroke={gold} strokeWidth="1.2"/><path d="M2 8h16M6 2v4M14 2v4" stroke={gold} strokeWidth="1.2" strokeLinecap="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Project <span style={{ color:gold }}>Calendar</span></p>
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', gap:2 }}>
          {['month','week','list'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ ...sans, padding:'6px 14px', background:view===v?gold:'transparent', border:`1px solid ${view===v?gold:'#57534e'}`, color:view===v?'#000':'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ ...sans, padding:'7px 16px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
          + New Event
        </button>
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', minHeight:'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <div style={{ background:dark, padding:'20px 16px', borderRight:'1px solid #292524' }}>
          {/* Mini calendar nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <button onClick={prevMonth} style={{ background:'none', border:'none', color:'#78716c', cursor:'pointer', fontSize:14 }}>‹</button>
            <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#e7e5e4', margin:0 }}>{MONTHS[curMonth].slice(0,3)} {curYear}</p>
            <button onClick={nextMonth} style={{ background:'none', border:'none', color:'#78716c', cursor:'pointer', fontSize:14 }}>›</button>
          </div>

          {/* Type filter */}
          <p style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#57534e', margin:'16px 0 8px' }}>Event Types</p>
          <button onClick={() => setTypeFilter('ALL')}
            style={{ ...sans, width:'100%', textAlign:'left', padding:'5px 8px', background:typeFilter==='ALL'?'rgba(201,162,39,0.12)':'none', border:'none', color:typeFilter==='ALL'?gold:'#78716c', fontSize:10, cursor:'pointer', marginBottom:2, fontWeight:typeFilter==='ALL'?700:400 }}>
            All Types
          </button>
          {Object.entries(EVENT_TYPES).map(([type, style]) => (
            <button key={type} onClick={() => setTypeFilter(typeFilter===type?'ALL':type)}
              style={{ ...sans, width:'100%', textAlign:'left', padding:'5px 8px', background:typeFilter===type?style.bg:'none', border:'none', color:typeFilter===type?style.color:'#78716c', fontSize:10, cursor:'pointer', marginBottom:2, display:'flex', gap:6, alignItems:'center', fontWeight:typeFilter===type?700:400 }}>
              <div style={{ width:8, height:8, background:style.color, flexShrink:0 }} />{type}
            </button>
          ))}

          {/* Today's events */}
          <p style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#57534e', margin:'20px 0 8px' }}>Today</p>
          {events.filter(e => e.date === todayStr).map(e => {
            const t = EVENT_TYPES[e.type]||{color:gold}
            return (
              <div key={e.id} onClick={() => setSelected(e)} style={{ marginBottom:6, cursor:'pointer', padding:'6px 8px', background:'rgba(255,255,255,0.04)', borderLeft:`2px solid ${t.color}` }}>
                <p style={{ ...sans, fontSize:9, color:t.color, fontWeight:600, margin:'0 0 2px' }}>{e.time !== '00:00' ? e.time : 'All day'}</p>
                <p style={{ ...sans, fontSize:9.5, color:'#e7e5e4', margin:0, lineHeight:1.4 }}>{e.title}</p>
              </div>
            )
          })}
          {events.filter(e => e.date === todayStr).length === 0 && (
            <p style={{ ...sans, fontSize:10, color:'#57534e' }}>No events today</p>
          )}
        </div>

        {/* Main area */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Nav bar */}
          <div style={{ padding:'14px 24px', background:'#fff', borderBottom:`1px solid ${bdr}`, display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={prevMonth} style={{ ...sans, padding:'5px 12px', border:`1px solid ${bdr}`, background:'#fff', color:stone, cursor:'pointer', fontSize:13 }}>‹</button>
            <button onClick={() => { setCurYear(Y); setCurMonth(M) }} style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', border:`1px solid ${bdr}`, padding:'5px 12px', background:'#fff', color:stone, cursor:'pointer' }}>Today</button>
            <button onClick={nextMonth} style={{ ...sans, padding:'5px 12px', border:`1px solid ${bdr}`, background:'#fff', color:stone, cursor:'pointer', fontSize:13 }}>›</button>
            <p style={{ ...serif, fontSize:24, fontWeight:300, color:dark, margin:0 }}>{MONTHS[curMonth]} {curYear}</p>
            <div style={{ flex:1 }} />
            <p style={{ ...sans, fontSize:10, color:stone }}>
              {events.filter(e => e.date.startsWith(`${curYear}-${String(curMonth+1).padStart(2,'0')}`)).length} events this month
            </p>
          </div>

          {/* Month view */}
          {view === 'month' && (
            <div style={{ flex:1, overflowY:'auto' }}>
              {/* Day headers */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:`1px solid ${bdr}`, background:'#fff' }}>
                {DAYS.map(d => (
                  <div key={d} style={{ padding:'8px 10px', textAlign:'center', ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Cells */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
                {cells.map((day, i) => {
                  const isToday = day && curYear===Y && curMonth===M && day===TODAY.getDate()
                  const dayEvents = eventsOn(day)
                  return (
                    <div key={i} style={{ minHeight:100, padding:'6px 6px 4px', border:`1px solid ${bdr}`, background: isToday ? `${gold}08` : '#fff', borderTop:'none', borderLeft: i%7===0 ? `1px solid ${bdr}` : 'none' }}>
                      {day && (
                        <>
                          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
                            <div style={{ width:22, height:22, background:isToday?gold:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <span style={{ ...sans, fontSize:11, fontWeight:isToday?700:400, color:isToday?'#000':stone }}>{day}</span>
                            </div>
                          </div>
                          {dayEvents.slice(0,3).map(ev => <EventPill key={ev.id} ev={ev} onClick={setSelected} />)}
                          {dayEvents.length > 3 && (
                            <p style={{ ...sans, fontSize:8.5, color:stone, margin:'2px 0 0', textAlign:'center' }}>+{dayEvents.length-3} more</p>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* List view */}
          {view === 'list' && (
            <div style={{ flex:1, overflowY:'auto', padding:24 }}>
              {(() => {
                const grouped = {}
                upcomingEvents.forEach(e => { if(!grouped[e.date]) grouped[e.date]=[]; grouped[e.date].push(e) })
                return Object.entries(grouped).map(([date,evs]) => {
                  const d = new Date(date)
                  const isToday = date === todayStr
                  return (
                    <div key={date} style={{ marginBottom:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                        <div style={{ width:40, height:40, background:isToday?gold:'#fff', border:`1px solid ${isToday?gold:bdr}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ ...sans, fontSize:16, fontWeight:700, color:isToday?'#000':dark, lineHeight:1 }}>{d.getDate()}</span>
                          <span style={{ ...sans, fontSize:7.5, color:isToday?'#333':stone, letterSpacing:'0.1em', textTransform:'uppercase' }}>{MONTHS[d.getMonth()].slice(0,3)}</span>
                        </div>
                        <div style={{ flex:1, height:1, background:bdr }} />
                        {isToday && <span style={{ ...sans, fontSize:9, fontWeight:700, color:gold, letterSpacing:'0.1em', textTransform:'uppercase' }}>Today</span>}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6, paddingLeft:52 }}>
                        {evs.map(ev => {
                          const t = EVENT_TYPES[ev.type]||{color:gold,bg:`${gold}18`}
                          return (
                            <div key={ev.id} onClick={() => setSelected(ev)}
                              style={{ background:'#fff', border:`1px solid ${bdr}`, borderLeft:`3px solid ${t.color}`, padding:'12px 16px', cursor:'pointer', display:'flex', gap:16, alignItems:'flex-start' }}
                              onMouseEnter={e => e.currentTarget.style.borderColor=t.color}
                              onMouseLeave={e => { e.currentTarget.style.borderColor=bdr; e.currentTarget.style.borderLeftColor=t.color }}>
                              <div style={{ width:50, flexShrink:0 }}>
                                <p style={{ ...sans, fontSize:12, fontWeight:700, color:dark, margin:0 }}>{ev.time !== '00:00' ? ev.time : 'All day'}</p>
                                {ev.duration > 0 && <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{ev.duration}m</p>}
                              </div>
                              <div style={{ flex:1 }}>
                                <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 2px' }}>{ev.title}</p>
                                <div style={{ display:'flex', gap:8 }}>
                                  <span style={{ ...sans, fontSize:9, color:t.color, fontWeight:600 }}>{ev.type}</span>
                                  <span style={{ ...sans, fontSize:9, color:stone }}>{ev.person}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {/* Week view */}
          {view === 'week' && (
            <div style={{ flex:1, overflowY:'auto', padding:24 }}>
              {(() => {
                const weekStart = new Date(curYear, curMonth, TODAY.getDate() - TODAY.getDay())
                return [...Array(7)].map((_,i) => {
                  const d = new Date(weekStart); d.setDate(d.getDate()+i)
                  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
                  const dayEvs = events.filter(e => e.date===dateStr && (typeFilter==='ALL'||e.type===typeFilter))
                  const isToday = isSameDay(d, TODAY)
                  return (
                    <div key={i} style={{ display:'flex', gap:0, marginBottom:0, borderBottom:`1px solid ${bdr}` }}>
                      <div style={{ width:72, flexShrink:0, padding:'12px 0', textAlign:'center', background:isToday?`${gold}08`:'#fff', borderRight:`1px solid ${bdr}` }}>
                        <p style={{ ...sans, fontSize:9, color:stone, margin:'0 0 2px', letterSpacing:'0.1em', textTransform:'uppercase' }}>{DAYS[d.getDay()]}</p>
                        <p style={{ ...serif, fontSize:22, fontWeight:300, color:isToday?gold:dark, margin:0 }}>{d.getDate()}</p>
                      </div>
                      <div style={{ flex:1, padding:'8px 16px', minHeight:64, background:isToday?`${gold}04`:'#fff' }}>
                        {dayEvs.length === 0 && <p style={{ ...sans, fontSize:10, color:'#d0cdc9', margin:'12px 0' }}>No events</p>}
                        {dayEvs.map(ev => <EventPill key={ev.id} ev={ev} onClick={setSelected} />)}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Event detail overlay */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if(e.target===e.currentTarget) setSelected(null) }}>
          <div style={{ background:'#fff', width:420, maxHeight:'80vh', overflowY:'auto', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:(EVENT_TYPES[selected.type]||{color:gold}).color, margin:'0 0 4px' }}>{selected.type}</p>
                <p style={{ ...serif, fontSize:22, fontWeight:300, color:dark, margin:0 }}>{selected.title}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:stone }}>✕</button>
            </div>
            {[
              ['Date',     new Date(selected.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})],
              ['Time',     selected.time !== '00:00' ? `${selected.time}${selected.duration>0?` (${selected.duration} min)`:''}` : 'All day'],
              ['Project',  selected.project],
              ['Assigned', selected.person],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:`1px solid ${bdr}` }}>
                <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, width:70, flexShrink:0 }}>{k}</span>
                <span style={{ ...sans, fontSize:12, color:dark }}>{v}</span>
              </div>
            ))}
            {selected.notes && (
              <div style={{ marginTop:16, background:light, padding:'12px 14px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'0 0 6px' }}>Notes</p>
                <p style={{ ...sans, fontSize:12, color:dark, margin:0, lineHeight:1.7 }}>{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New event modal */}
      {showNew && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if(e.target===e.currentTarget) setShowNew(false) }}>
          <div style={{ background:'#fff', width:440, padding:28, maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <p style={{ ...serif, fontSize:24, fontWeight:300, color:dark, margin:0 }}>New Event</p>
              <button onClick={() => setShowNew(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:stone }}>✕</button>
            </div>
            <F label="Title">
              <input value={newEv.title} onChange={e => setNewEv(n=>({...n,title:e.target.value}))} placeholder="Event title"
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
            </F>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <F label="Date">
                <input type="date" value={newEv.date} onChange={e => setNewEv(n=>({...n,date:e.target.value}))}
                  style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
              </F>
              <F label="Time">
                <input type="time" value={newEv.time} onChange={e => setNewEv(n=>({...n,time:e.target.value}))}
                  style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
              </F>
            </div>
            <F label="Type">
              <select value={newEv.type} onChange={e => setNewEv(n=>({...n,type:e.target.value}))}
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, background:'#fff' }}>
                {Object.keys(EVENT_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </F>
            <F label="Assigned To">
              <input value={newEv.person} onChange={e => setNewEv(n=>({...n,person:e.target.value}))} placeholder="Name or role"
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box' }} />
            </F>
            <F label="Notes">
              <textarea value={newEv.notes} onChange={e => setNewEv(n=>({...n,notes:e.target.value}))} rows={2}
                style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, resize:'vertical', boxSizing:'border-box' }} />
            </F>
            <button onClick={saveNewEvent} disabled={!newEv.title||!newEv.date}
              style={{ ...sans, width:'100%', padding:'12px', background:newEv.title&&newEv.date?gold:'#e7e5e4', border:'none', color:newEv.title&&newEv.date?'#000':'#a8a29e', fontWeight:700, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:newEv.title&&newEv.date?'pointer':'default' }}>
              Save Event
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
