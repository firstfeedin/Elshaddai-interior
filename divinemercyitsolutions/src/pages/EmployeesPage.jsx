import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { employees as employeesApi } from '../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const ROLES = ['All','DESIGNER','BUILDER','WORKSHOP_WORKER','ADMIN','SUPER_ADMIN']
const DEPTS = ['Design','Site','Factory','Administration','Procurement']

const EMPLOYEES = [
  { id:'EMP-001', name:'Aravind Kumar',    role:'SUPER_ADMIN', dept:'Administration', phone:'+91 98400 12345', email:'aravind@elshaddai.in',   joined:'2015-03-01', salary:180000, status:'ACTIVE',  skills:['Leadership','Project Management','Client Relations'], projects:['PRJ-0012','PRJ-0009','PRJ-0015'], attendance:{ present:21, absent:1, leave:0, total:22 }, leaveBalance:{ casual:5, sick:3, annual:18 }, rating:5.0 },
  { id:'EMP-002', name:'Priya Menon',      role:'ADMIN',       dept:'Administration', phone:'+91 98401 23456', email:'priya@elshaddai.in',    joined:'2017-06-15', salary:120000, status:'ACTIVE',  skills:['Operations','Scheduling','Client Coordination'],    projects:['PRJ-0012','PRJ-0015','PRJ-0011'], attendance:{ present:20, absent:0, leave:2, total:22 }, leaveBalance:{ casual:3, sick:5, annual:14 }, rating:4.8 },
  { id:'EMP-003', name:'Kiran Sharma',     role:'DESIGNER',    dept:'Design',         phone:'+91 98402 34567', email:'kiran@elshaddai.in',    joined:'2019-08-20', salary:85000,  status:'ACTIVE',  skills:['AutoCAD','3ds Max','Space Planning','Vaastu'],      projects:['PRJ-0012','PRJ-0014'],            attendance:{ present:19, absent:2, leave:1, total:22 }, leaveBalance:{ casual:4, sick:7, annual:12 }, rating:4.6 },
  { id:'EMP-004', name:'Lakshmi Iyer',     role:'DESIGNER',    dept:'Design',         phone:'+91 98403 45678', email:'lakshmi@elshaddai.in',  joined:'2020-02-10', salary:78000,  status:'ACTIVE',  skills:['Revit','SketchUp','Material Selection','Lighting'], projects:['PRJ-0009','PRJ-0015'],            attendance:{ present:22, absent:0, leave:0, total:22 }, leaveBalance:{ casual:6, sick:8, annual:16 }, rating:4.9 },
  { id:'EMP-005', name:'Mohammed Farook',  role:'BUILDER',     dept:'Site',           phone:'+91 98404 56789', email:'farook@elshaddai.in',   joined:'2016-11-05', salary:55000,  status:'ACTIVE',  skills:['Site Supervision','Civil Work','QC','Safety'],      projects:['PRJ-0012','PRJ-0009'],            attendance:{ present:21, absent:1, leave:0, total:22 }, leaveBalance:{ casual:2, sick:4, annual:10 }, rating:4.5 },
  { id:'EMP-006', name:'Ramesh Pillai',    role:'BUILDER',     dept:'Site',           phone:'+91 98405 67890', email:'ramesh@elshaddai.in',   joined:'2018-04-22', salary:48000,  status:'ACTIVE',  skills:['Electrical','Plumbing','Tiling','False Ceiling'],   projects:['PRJ-0011','PRJ-0015'],            attendance:{ present:18, absent:3, leave:1, total:22 }, leaveBalance:{ casual:1, sick:6, annual:8 }, rating:4.2 },
  { id:'EMP-007', name:'Suresh Babu',      role:'WORKSHOP_WORKER',dept:'Factory',    phone:'+91 98406 78901', email:'suresh@elshaddai.in',   joined:'2021-07-18', salary:32000,  status:'ACTIVE',  skills:['Wood Carpentry','CNC Operation','Polish','Assembly'],projects:['PRJ-0012'],                       attendance:{ present:20, absent:2, leave:0, total:22 }, leaveBalance:{ casual:4, sick:5, annual:8 },  rating:4.3 },
  { id:'EMP-008', name:'Anitha Krishnan',  role:'WORKSHOP_WORKER',dept:'Factory',    phone:'+91 98407 89012', email:'anitha@elshaddai.in',   joined:'2022-01-10', salary:28000,  status:'ACTIVE',  skills:['Upholstery','Fabric Cutting','Quality Check'],      projects:['PRJ-0015'],                       attendance:{ present:16, absent:4, leave:2, total:22 }, leaveBalance:{ casual:3, sick:2, annual:6 },  rating:3.9 },
  { id:'EMP-009', name:'Vijay Selvam',     role:'BUILDER',     dept:'Site',           phone:'+91 98408 90123', email:'vijay@elshaddai.in',    joined:'2023-03-15', salary:38000,  status:'ON_LEAVE', skills:['Painting','Texture Application','Waterproofing'],  projects:['PRJ-0009'],                       attendance:{ present:17, absent:1, leave:4, total:22 }, leaveBalance:{ casual:0, sick:8, annual:12 }, rating:4.1 },
  { id:'EMP-010', name:'Deepika Rangaraj', role:'DESIGNER',    dept:'Design',         phone:'+91 98409 01234', email:'deepika@elshaddai.in',  joined:'2024-06-01', salary:65000,  status:'ACTIVE',  skills:['Photoshop','Lumion','Client Presentations'],        projects:['PRJ-0014'],                       attendance:{ present:22, absent:0, leave:0, total:22 }, leaveBalance:{ casual:6, sick:8, annual:18 }, rating:4.7 },
]

const STATUS_COLOR = { ACTIVE:'#22c55e', ON_LEAVE:'#f97316', INACTIVE:'#ef4444' }
const ROLE_COLOR   = { SUPER_ADMIN:gold, ADMIN:'#8b7355', DESIGNER:'#22c55e', BUILDER:'#57534e', WORKSHOP_WORKER:'#78716c' }

function RatingStars({ r }) {
  return (
    <div style={{ display:'flex', gap:2, alignItems:'center' }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width:10, height:10, background: i <= Math.floor(r) ? gold : i - 0.5 <= r ? `${gold}80` : bdr }} />
      ))}
      <span style={{ ...sans, fontSize:9, color:stone, marginLeft:4 }}>{r.toFixed(1)}</span>
    </div>
  )
}

function AttendanceDots({ att }) {
  const pct = Math.round(att.present / att.total * 100)
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ ...sans, fontSize:9, color:stone }}>Attendance</span>
        <span style={{ ...sans, fontSize:9, fontWeight:700, color:pct>=90?'#22c55e':pct>=75?gold:'#ef4444' }}>{pct}%</span>
      </div>
      <div style={{ height:4, background:bdr }}>
        <div style={{ height:'100%', width:`${pct}%`, background:pct>=90?'#22c55e':pct>=75?gold:'#ef4444' }} />
      </div>
    </div>
  )
}

function mapApiEmployee(e) {
  return {
    id: e.employee_id || `EMP-${String(e.id).padStart(3,'0')}`,
    name: e.name || 'Unknown',
    role: e.role || 'DESIGNER',
    dept: e.department || 'Design',
    phone: e.phone || '—',
    email: e.email || '—',
    joined: e.joined_date || e.created_at?.split('T')[0] || '—',
    salary: e.salary || 0,
    status: e.status || 'ACTIVE',
    skills: e.skills ? (Array.isArray(e.skills) ? e.skills : e.skills.split(',').map(s => s.trim())) : [],
    projects: [],
    attendance: { present: 20, absent: 2, leave: 0, total: 22 },
    leaveBalance: { casual: 5, sick: 5, annual: 10 },
    rating: e.rating || 4.0,
    _fromApi: true,
  }
}

export default function EmployeesPage() {
  const [roleF,    setRoleF]    = useState('All')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [tab,      setTab]      = useState('profile')
  const [empList,  setEmpList]  = useState(EMPLOYEES)

  useEffect(() => {
    employeesApi.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (arr.length > 0) setEmpList(arr.map(mapApiEmployee))
      })
      .catch(() => {})
  }, [])

  const filtered = empList.filter(e => {
    if (roleF !== 'All' && e.role !== roleF) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.dept.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalSalary = empList.reduce((s,e) => s+e.salary, 0)
  const active      = empList.filter(e => e.status==='ACTIVE').length
  const onLeave     = empList.filter(e => e.status==='ON_LEAVE').length

  const e = selected

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke={gold} strokeWidth="1.2"/><path d="M3 18c0-4 3.1-7 7-7s7 3 7 7" stroke={gold} strokeWidth="1.2" strokeLinecap="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Employee <span style={{ color:gold }}>Directory</span></p>
        <div style={{ flex:1 }} />
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', minHeight:'calc(100vh - 64px)' }}>
        <div style={{ padding:28, borderRight:selected?`1px solid ${bdr}`:'none' }}>
          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
            {[
              { label:'Total Staff',    value:empList.length,                        accent:'#78716c' },
              { label:'Active',         value:active,                                accent:'#22c55e' },
              { label:'On Leave',       value:onLeave,                               accent:'#f97316' },
              { label:'Monthly Payroll',value:'₹'+totalSalary.toLocaleString('en-IN'),accent:gold },
            ].map(k => (
              <div key={k.label} style={{ background:'#fff', border:`1px solid ${bdr}`, borderTop:`3px solid ${k.accent}`, padding:'14px 18px' }}>
                <p style={{ ...serif, fontSize:28, fontWeight:300, color:dark, margin:'0 0 4px' }}>{k.value}</p>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:0 }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or department…"
              style={{ ...sans, padding:'7px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, width:210 }} />
            {ROLES.map(r => (
              <button key={r} onClick={() => setRoleF(r)}
                style={{ ...sans, padding:'5px 12px', border:`1px solid ${roleF===r?gold:bdr}`, background:roleF===r?`${gold}12`:'#fff', color:roleF===r?dark:stone, fontSize:9.5, fontWeight:roleF===r?700:400, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>
                {r === 'All' ? 'All' : r.replace('_',' ')}
              </button>
            ))}
          </div>

          {/* Employee cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
            {filtered.map(emp => (
              <div key={emp.id} onClick={() => { setSelected(emp); setTab('profile') }}
                style={{ background:'#fff', border:`1px solid ${selected?.id===emp.id?gold:bdr}`, padding:'18px 20px', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor=`${gold}60`}
                onMouseLeave={e => { if(selected?.id!==emp.id) e.currentTarget.style.borderColor=bdr }}>
                <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ width:44, height:44, background:ROLE_COLOR[emp.role]||gold, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#000', flexShrink:0 }}>
                    {emp.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <p style={{ ...sans, fontSize:13, fontWeight:600, color:dark, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.name}</p>
                    <p style={{ ...sans, fontSize:9.5, color:stone, margin:'0 0 4px', letterSpacing:'0.06em', textTransform:'uppercase' }}>{emp.role.replace('_',' ')} · {emp.dept}</p>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <span style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:STATUS_COLOR[emp.status], border:`1px solid ${STATUS_COLOR[emp.status]}`, padding:'1px 6px' }}>{emp.status.replace('_',' ')}</span>
                      <RatingStars r={emp.rating} />
                    </div>
                  </div>
                </div>
                <AttendanceDots att={emp.attendance} />
                <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                  {emp.skills.slice(0,3).map(s => (
                    <span key={s} style={{ ...sans, fontSize:8.5, color:stone, background:light, border:`1px solid ${bdr}`, padding:'2px 7px' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {e && (
          <div style={{ background:'#fff', overflowY:'auto' }}>
            {/* Header */}
            <div style={{ background:dark, padding:'24px 24px 0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div style={{ display:'flex', gap:14 }}>
                  <div style={{ width:56, height:56, background:ROLE_COLOR[e.role]||gold, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, color:'#000' }}>
                    {e.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p style={{ ...serif, fontSize:22, fontWeight:300, color:'#fff', margin:'0 0 3px' }}>{e.name}</p>
                    <p style={{ ...sans, fontSize:9.5, color:'#78716c', margin:0, letterSpacing:'0.1em', textTransform:'uppercase' }}>{e.role.replace('_',' ')} · {e.dept}</p>
                    <span style={{ ...sans, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:STATUS_COLOR[e.status], border:`1px solid ${STATUS_COLOR[e.status]}`, padding:'1px 6px', display:'inline-block', marginTop:4 }}>{e.status.replace('_',' ')}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'#57534e', cursor:'pointer', fontSize:18 }}>✕</button>
              </div>
              {/* Tabs */}
              <div style={{ display:'flex', gap:0 }}>
                {['profile','attendance','leave'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ ...sans, padding:'8px 16px', background:'none', border:'none', borderBottom:`2px solid ${tab===t?gold:'transparent'}`, color:tab===t?gold:'#78716c', fontWeight:tab===t?700:400, fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding:22 }}>
              {tab === 'profile' && (
                <div>
                  {[
                    ['Employee ID', e.id],
                    ['Email',       e.email],
                    ['Phone',       e.phone],
                    ['Department',  e.dept],
                    ['Joined',      new Date(e.joined).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
                    ['Monthly CTC', '₹'+e.salary.toLocaleString('en-IN')],
                    ['Projects',    e.projects.join(', ')],
                    ['Rating',      `${e.rating}/5.0`],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:`1px solid ${bdr}` }}>
                      <span style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, width:90, flexShrink:0 }}>{k}</span>
                      <span style={{ ...sans, fontSize:11.5, color:dark }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:16 }}>
                    <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 10px' }}>Skills</p>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {e.skills.map(s => (
                        <span key={s} style={{ ...sans, fontSize:11, color:dark, background:light, border:`1px solid ${bdr}`, padding:'4px 10px' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'attendance' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:20 }}>
                    {[
                      ['Present', e.attendance.present, '#22c55e'],
                      ['Absent',  e.attendance.absent,  '#ef4444'],
                      ['On Leave',e.attendance.leave,   '#f97316'],
                      ['Total Working Days', e.attendance.total, stone],
                    ].map(([l,v,c]) => (
                      <div key={l} style={{ background:light, border:`1px solid ${bdr}`, padding:'12px 14px' }}>
                        <p style={{ ...serif, fontSize:26, fontWeight:300, color:c, margin:'0 0 2px' }}>{v}</p>
                        <p style={{ ...sans, fontSize:9, color:stone, margin:0, textTransform:'uppercase', letterSpacing:'0.1em' }}>{l}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:dark, padding:'16px 18px' }}>
                    <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold, margin:'0 0 8px' }}>Attendance Rate</p>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ flex:1, height:8, background:'#292524' }}>
                        <div style={{ height:'100%', width:`${Math.round(e.attendance.present/e.attendance.total*100)}%`, background:gold }} />
                      </div>
                      <span style={{ ...serif, fontSize:22, fontWeight:300, color:gold }}>{Math.round(e.attendance.present/e.attendance.total*100)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'leave' && (
                <div>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 12px' }}>Leave Balance</p>
                  {[
                    ['Casual Leave',  e.leaveBalance.casual,  12],
                    ['Sick Leave',    e.leaveBalance.sick,    12],
                    ['Annual Leave',  e.leaveBalance.annual,  24],
                  ].map(([type,bal,max]) => (
                    <div key={type} style={{ marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ ...sans, fontSize:11.5, color:dark }}>{type}</span>
                        <span style={{ ...sans, fontSize:13, color:dark, fontWeight:700 }}>{bal} <span style={{ fontSize:10, color:stone, fontWeight:400 }}>/ {max} days</span></span>
                      </div>
                      <div style={{ height:6, background:bdr }}>
                        <div style={{ height:'100%', width:`${(bal/max)*100}%`, background:bal<=2?'#ef4444':bal<=5?'#f97316':gold }} />
                      </div>
                    </div>
                  ))}
                  <button style={{ ...sans, width:'100%', padding:'10px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', marginTop:8 }}>
                    Request Leave
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
