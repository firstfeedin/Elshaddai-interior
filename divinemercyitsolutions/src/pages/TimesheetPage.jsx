import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { timesheets as timesheetsApi } from '../lib/api'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bdr   = '#e7e5e4'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat']
const PROJECTS = ['Nair Residence','Kapoor Office','Sharma Villa','Mehta Penthouse','Sundar Restaurant']
const WORKERS = [
  { id:1, name:'Kiran Sharma',    role:'Lead Designer',    rate:1800, avatar:'KS' },
  { id:2, name:'Lakshmi Iyer',   role:'Lead Designer',    rate:1800, avatar:'LI' },
  { id:3, name:'Mohammed Farook',role:'Site Builder',     rate:900,  avatar:'MF' },
  { id:4, name:'Priya Menon',    role:'Project Manager',  rate:1600, avatar:'PM' },
  { id:5, name:'Suresh Pillai',  role:'Carpenter',        rate:800,  avatar:'SP' },
  { id:6, name:'Anitha Raj',     role:'Electrician',      rate:850,  avatar:'AR' },
  { id:7, name:'Ravi Kumar',     role:'Painter',          rate:750,  avatar:'RK' },
  { id:8, name:'Deepa Thomas',   role:'Interior Fitter',  rate:820,  avatar:'DT' },
]

function makeWeek(workerIdx) {
  const projects = PROJECTS
  return DAYS.map((day, di) => {
    const hrs = di === 5
      ? (workerIdx % 3 === 0 ? 4 : 0)
      : Math.floor(Math.random() * 3) + 7
    return {
      day,
      hrs,
      project: hrs > 0 ? projects[(workerIdx + di) % projects.length] : '',
      ot: hrs > 9 ? hrs - 9 : 0,
      status: hrs === 0 ? 'absent' : 'present',
    }
  })
}

const INITIAL_SHEETS = WORKERS.map((w, i) => ({
  ...w,
  days: makeWeek(i),
}))

const WEEK_LABEL = 'Week of 09 Jun – 14 Jun 2026'

function totalHrs(days) { return days.reduce((a, d) => a + d.hrs, 0) }
function totalOT(days)  { return days.reduce((a, d) => a + d.ot, 0) }
function pay(w, days)   { return totalHrs(days) * w.rate + totalOT(days) * w.rate * 0.5 }

export default function TimesheetPage() {
  const nav = useNavigate()
  const [sheets, setSheets] = useState(INITIAL_SHEETS)
  const [sel, setSel] = useState(null)
  const [editCell, setEditCell] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [filterProj, setFilterProj] = useState('All')
  const [approved, setApproved] = useState({})

  useEffect(() => {
    timesheetsApi.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (!arr.length) return
        // Group by employee
        const byEmp = {}
        arr.forEach(r => {
          if (!byEmp[r.employee_id]) {
            byEmp[r.employee_id] = {
              id: r.employee_id,
              name: r.employee_name || `Employee ${r.employee_id}`,
              role: r.employee_role || '—',
              rate: 1000,
              avatar: (r.employee_name || 'E').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
              days: DAYS.map(d => ({ day:d, hrs:0, project:'', ot:0, status:'absent' })),
            }
          }
          const sheet = byEmp[r.employee_id]
          const dmap = { Mon:r.mon_hrs, Tue:r.tue_hrs, Wed:r.wed_hrs, Thu:r.thu_hrs, Fri:r.fri_hrs, Sat:r.sat_hrs }
          sheet.days = DAYS.map(d => {
            const hrs = dmap[d] || 0
            return { day:d, hrs, project: r.project_name || '', ot: hrs>9?hrs-9:0, status:hrs>0?'present':'absent' }
          })
          if (r.status === 'APPROVED') {
            setApproved(a => ({ ...a, [r.employee_id]: true }))
          }
        })
        const list = Object.values(byEmp)
        if (list.length) setSheets(list)
      })
      .catch(() => {})
  }, [])

  function updateHrs(wid, dayIdx, val) {
    const hrs = Math.max(0, Math.min(14, Number(val)))
    setSheets(prev => prev.map(w => {
      if (w.id !== wid) return w
      const days = w.days.map((d, i) => i !== dayIdx ? d : {
        ...d, hrs, ot: hrs > 9 ? hrs - 9 : 0, status: hrs === 0 ? 'absent' : 'present'
      })
      return { ...w, days }
    }))
    setEditCell(null)
  }

  function approveSheet(wid) {
    setApproved(p => ({ ...p, [wid]: true }))
    timesheetsApi.approve(wid).catch(() => {})
  }

  const totalPayroll = sheets.reduce((a, w) => a + pay(w, w.days), 0)
  const totalPresent = sheets.reduce((a, w) => a + w.days.filter(d => d.status === 'present').length, 0)
  const totalAbsent  = sheets.reduce((a, w) => a + w.days.filter(d => d.status === 'absent').length, 0)
  const totalOTHrs   = sheets.reduce((a, w) => a + totalOT(w.days), 0)

  const filtered = filterProj === 'All' ? sheets
    : sheets.filter(w => w.days.some(d => d.project === filterProj))

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', ...sans }}>
      {/* Header */}
      <div style={{ background:dark, borderBottom:`2px solid ${gold}`, padding:'0 32px', display:'flex', alignItems:'center', height:56, gap:20 }}>
        <svg width="28" height="28" viewBox="0 0 40 40"><rect width="40" height="40" fill={gold}/><text x="8" y="27" fontSize="18" fontWeight="700" fill={dark} fontFamily="serif">ES</text></svg>
        <span style={{ ...serif, fontSize:18, color:'#fff', letterSpacing:'0.04em', fontWeight:600 }}>Timesheet Manager</span>
        <span style={{ ...sans, fontSize:11, color:'#a8a29e', background:'#292524', padding:'3px 12px', letterSpacing:'0.06em' }}>{WEEK_LABEL}</span>
        <div style={{ flex:1 }}/>
        <button onClick={()=>nav('/dashboard')} style={{ ...sans, fontSize:12, color:'#a8a29e', background:'none', border:'none', cursor:'pointer' }}>← Dashboard</button>
      </div>

      {/* KPI */}
      <div style={{ display:'flex', borderBottom:`1px solid ${bdr}`, background:'#fff' }}>
        {[
          ['Weekly Payroll', '₹'+Math.round(totalPayroll).toLocaleString('en-IN')],
          ['Staff', sheets.length],
          ['Present Days', totalPresent],
          ['Absent Days', totalAbsent],
          ['OT Hours', totalOTHrs],
          ['Approved', Object.keys(approved).length+'/'+sheets.length],
        ].map(([l,v])=>(
          <div key={l} style={{ flex:1, padding:'12px 18px', borderRight:`1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{l}</p>
            <p style={{ ...serif, fontSize:22, color:dark, margin:0, fontWeight:600 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${bdr}`, padding:'10px 24px', display:'flex', gap:8, alignItems:'center' }}>
        <span style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone }}>Filter by Project:</span>
        {['All',...PROJECTS].map(p=>(
          <button key={p} onClick={()=>setFilterProj(p)}
            style={{ ...sans, fontSize:11, padding:'4px 12px', background: filterProj===p?dark:'#fff', color: filterProj===p?'#fff':stone, border:`1px solid ${filterProj===p?dark:bdr}`, cursor:'pointer' }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 154px)' }}>
        {/* Main grid */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
          <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
            {/* Header row */}
            <div style={{ display:'grid', gridTemplateColumns:'200px 1fr 1fr 1fr 1fr 1fr 1fr 80px 80px 100px 120px', background:'#1c1917', padding:'8px 16px', gap:0 }}>
              <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#a8a29e' }}>Employee</span>
              {DAYS.map(d=><span key={d} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a8a29e', textAlign:'center' }}>{d}</span>)}
              <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a8a29e', textAlign:'center' }}>Total</span>
              <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a8a29e', textAlign:'center' }}>OT</span>
              <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:gold, textAlign:'center' }}>Pay</span>
              <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a8a29e', textAlign:'center' }}>Status</span>
            </div>

            {filtered.map((w, wi) => {
              const th = totalHrs(w.days)
              const ot = totalOT(w.days)
              const gross = pay(w, w.days)
              const isApproved = approved[w.id]
              return (
                <div key={w.id}
                  style={{ display:'grid', gridTemplateColumns:'200px 1fr 1fr 1fr 1fr 1fr 1fr 80px 80px 100px 120px', padding:'0 16px', borderBottom:`1px solid ${bdr}`, alignItems:'stretch', background: isApproved?'#f9fdf9':'#fff' }}>
                  {/* Name */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', cursor:'pointer' }} onClick={()=>setSel(sel?.id===w.id?null:w)}>
                    <div style={{ width:28, height:28, background: isApproved?'#dcfce7':gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color: isApproved?'#166534':dark, flexShrink:0 }}>{w.avatar}</div>
                    <div>
                      <p style={{ ...sans, fontSize:11, fontWeight:600, color:dark, margin:0 }}>{w.name}</p>
                      <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>₹{w.rate}/hr</p>
                    </div>
                  </div>

                  {/* Day cells */}
                  {w.days.map((d, di) => {
                    const isEdit = editCell?.wid===w.id && editCell?.dayIdx===di
                    return (
                      <div key={di} onClick={()=>{ if(!isApproved){setEditCell({wid:w.id,dayIdx:di}); setEditVal(String(d.hrs))} }}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'6px 4px', borderLeft:`1px solid ${bdr}`, cursor: isApproved?'default':'pointer', background: d.status==='absent'?'#fef2f220':d.hrs>9?`${gold}10`:'transparent' }}>
                        {isEdit ? (
                          <input autoFocus value={editVal}
                            onChange={e=>setEditVal(e.target.value)}
                            onBlur={()=>updateHrs(w.id,di,editVal)}
                            onKeyDown={e=>{ if(e.key==='Enter') updateHrs(w.id,di,editVal); if(e.key==='Escape') setEditCell(null) }}
                            style={{ width:36, textAlign:'center', border:`1px solid ${gold}`, outline:'none', fontSize:13, fontWeight:700, padding:'2px', ...sans }} />
                        ) : (
                          <>
                            <span style={{ ...sans, fontSize:13, fontWeight:700, color: d.status==='absent'?'#fca5a5':d.hrs>9?gold:dark }}>{d.hrs > 0 ? d.hrs : '—'}</span>
                            {d.ot > 0 && <span style={{ ...sans, fontSize:7, color:gold, fontWeight:700 }}>+{d.ot}OT</span>}
                          </>
                        )}
                      </div>
                    )
                  })}

                  {/* Totals */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', borderLeft:`1px solid ${bdr}` }}>
                    <span style={{ ...serif, fontSize:16, color:dark, fontWeight:600 }}>{th}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', borderLeft:`1px solid ${bdr}` }}>
                    <span style={{ ...sans, fontSize:12, color: ot>0?gold:stone, fontWeight: ot>0?700:400 }}>{ot > 0 ? ot : '—'}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', borderLeft:`1px solid ${bdr}` }}>
                    <span style={{ ...serif, fontSize:13, color:dark, fontWeight:600 }}>₹{Math.round(gross).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', borderLeft:`1px solid ${bdr}`, padding:'0 4px' }}>
                    {isApproved ? (
                      <span style={{ ...sans, fontSize:8, fontWeight:700, color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'2px 8px', letterSpacing:'0.06em' }}>APPROVED</span>
                    ) : (
                      <button onClick={()=>approveSheet(w.id)}
                        style={{ ...sans, fontSize:8, fontWeight:700, background:gold, color:dark, border:'none', padding:'4px 8px', cursor:'pointer', letterSpacing:'0.06em' }}>APPROVE</button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Totals row */}
            <div style={{ display:'grid', gridTemplateColumns:'200px 1fr 1fr 1fr 1fr 1fr 1fr 80px 80px 100px 120px', padding:'10px 16px', background:'#1c1917', alignItems:'center' }}>
              <span style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a8a29e' }}>TOTALS</span>
              {DAYS.map((d,di)=>(
                <span key={d} style={{ ...sans, fontSize:11, fontWeight:700, color:'#e7e5e4', textAlign:'center' }}>
                  {sheets.reduce((a,w)=>a+w.days[di].hrs,0)}h
                </span>
              ))}
              <span style={{ ...serif, fontSize:16, color:gold, textAlign:'center', fontWeight:600 }}>{sheets.reduce((a,w)=>a+totalHrs(w.days),0)}</span>
              <span style={{ ...sans, fontSize:12, color:gold, textAlign:'center' }}>{totalOTHrs}</span>
              <span style={{ ...serif, fontSize:14, color:gold, textAlign:'center', fontWeight:700 }}>₹{Math.round(totalPayroll).toLocaleString('en-IN')}</span>
              <span style={{ ...sans, fontSize:9, color:'#a8a29e', textAlign:'center' }}>{Object.keys(approved).length}/{sheets.length} approved</span>
            </div>
          </div>

          <p style={{ ...sans, fontSize:10, color:'#a8a29e', marginTop:10 }}>Click any hours cell to edit · OT rate = 1.5× for hours beyond 9/day · Click employee name to see detail</p>
        </div>

        {/* Worker Detail Panel */}
        {sel && (
          <div style={{ width:280, background:'#fff', borderLeft:`1px solid ${bdr}`, padding:24, overflowY:'auto', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <span style={{ ...serif, fontSize:16, color:dark, fontWeight:600 }}>Worker Detail</span>
              <button onClick={()=>setSel(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>×</button>
            </div>
            <div style={{ background:`${gold}10`, border:`1px solid ${gold}30`, padding:14, marginBottom:16 }}>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                <div style={{ width:36, height:36, background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:dark }}>{sel.avatar}</div>
                <div>
                  <p style={{ ...sans, fontSize:13, fontWeight:700, color:dark, margin:0 }}>{sel.name}</p>
                  <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{sel.role}</p>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['Rate','₹'+sel.rate+'/hr'],['Total Hours',totalHrs(sel.days)+'h'],['OT Hours',totalOT(sel.days)+'h'],['Gross Pay','₹'+Math.round(pay(sel,sel.days)).toLocaleString('en-IN')]].map(([k,v])=>(
                  <div key={k}>
                    <p style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:stone, margin:'0 0 1px' }}>{k}</p>
                    <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:0 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 10px' }}>Daily Breakdown</p>
            {sel.days.map((d,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                <div>
                  <p style={{ ...sans, fontSize:11, fontWeight:600, color:dark, margin:0 }}>{d.day}</p>
                  <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{d.project||'—'}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ ...sans, fontSize:12, fontWeight:700, color: d.status==='absent'?'#ef4444':dark, margin:0 }}>{d.hrs > 0 ? d.hrs+'h' : 'Absent'}</p>
                  {d.ot > 0 && <p style={{ ...sans, fontSize:9, color:gold, margin:0 }}>+{d.ot}h OT</p>}
                </div>
              </div>
            ))}

            <div style={{ marginTop:16, background:dark, padding:12 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a8a29e', margin:'0 0 6px' }}>Pay Breakdown</p>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ ...sans, fontSize:11, color:'#e7e5e4' }}>Regular ({totalHrs(sel.days)-totalOT(sel.days)}h × ₹{sel.rate})</span>
                <span style={{ ...sans, fontSize:11, color:'#e7e5e4' }}>₹{((totalHrs(sel.days)-totalOT(sel.days))*sel.rate).toLocaleString('en-IN')}</span>
              </div>
              {totalOT(sel.days)>0 && (
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ ...sans, fontSize:11, color:gold }}>OT ({totalOT(sel.days)}h × ₹{sel.rate*1.5})</span>
                  <span style={{ ...sans, fontSize:11, color:gold }}>₹{(totalOT(sel.days)*sel.rate*1.5).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, borderTop:'1px solid #3a3330', paddingTop:8 }}>
                <span style={{ ...sans, fontSize:11, fontWeight:700, color:'#fff' }}>GROSS PAY</span>
                <span style={{ ...serif, fontSize:16, color:gold, fontWeight:700 }}>₹{Math.round(pay(sel,sel.days)).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
