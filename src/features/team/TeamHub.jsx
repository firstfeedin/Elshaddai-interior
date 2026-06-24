/**
 * TeamHub — Central landing for all 6 dev team roles.
 * Routes to role-specific dashboard or shows the team overview.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PMDashboard          from './dashboards/PMDashboard'
import FrontendLeadDashboard from './dashboards/FrontendLeadDashboard'
import FrontendUIDashboard  from './dashboards/FrontendUIDashboard'
import BackendDashboard     from './dashboards/BackendDashboard'
import DevOpsDashboard      from './dashboards/DevOpsDashboard'
import QADashboard          from './dashboards/QADashboard'
import SprintBoard          from './SprintBoard'

const DARK='#0d0d12', DARK2='#12121a', CARD='#1a1a26', B='#252535'
const GOLD='#c9a227', MUT='rgba(255,255,255,0.38)'
const SS="'DM Sans',system-ui,sans-serif", SF="'Cormorant Garamond',Georgia,serif"

export const TEAM = [
  {
    role:'PM_UX', label:'Product Manager', sub:'/ UX Designer',
    color:'#a78bfa', icon:'◈',
    owns:['Feature roadmap','User stories','Wireframes','Sprint planning','Stakeholder comms'],
    email:'priya.pm@elshaddai.in', name:'Priya Anand', avatar:'PA',
    status:'online',
  },
  {
    role:'FRONTEND_LEAD', label:'Frontend Engineer', sub:'Lead',
    color:'#38bdf8', icon:'◉',
    owns:['Studio canvas tools','Three.js 3D view','Scene model wiring','PR reviews'],
    email:'arjun.fe@elshaddai.in', name:'Arjun Menon', avatar:'AM',
    status:'online',
  },
  {
    role:'FRONTEND_UI', label:'Frontend Engineer', sub:'UI / UX',
    color:'#34d399', icon:'◎',
    owns:['Dashboards','Catalog UI','Responsive layouts','Design system'],
    email:'meera.ui@elshaddai.in', name:'Meera Krishnan', avatar:'MK',
    status:'online',
  },
  {
    role:'BACKEND_ENG', label:'Backend Engineer', sub:'',
    color:'#f59e0b', icon:'◆',
    owns:['REST APIs','Auth (JWT/bcrypt)','SQLite schema','Render queue'],
    email:'sanjay.be@elshaddai.in', name:'Sanjay Rajan', avatar:'SR',
    status:'online',
  },
  {
    role:'DEVOPS', label:'DevOps Engineer', sub:'/ Cloud Infra',
    color:'#fb923c', icon:'◇',
    owns:['CI/CD pipeline','Vercel deploy','Render workers','Bundle optimization'],
    email:'karthik.devops@elshaddai.in', name:'Karthik Pillai', avatar:'KP',
    status:'away',
  },
  {
    role:'QA_ENGINEER', label:'QA Engineer', sub:'Full-Stack',
    color:'#f87171', icon:'◐',
    owns:['E2E test flows','Bug tracking','Perf audits','Regression sweeps'],
    email:'divya.qa@elshaddai.in', name:'Divya Nair', avatar:'DN',
    status:'online',
  },
]

const DASHBOARD_MAP = {
  PM_UX:          PMDashboard,
  FRONTEND_LEAD:  FrontendLeadDashboard,
  FRONTEND_UI:    FrontendUIDashboard,
  BACKEND_ENG:    BackendDashboard,
  DEVOPS:         DevOpsDashboard,
  QA_ENGINEER:    QADashboard,
}

function Avatar({initials,color,size=40}){
  return(
    <div style={{width:size,height:size,borderRadius:'50%',background:`${color}25`,
      border:`2px solid ${color}60`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <span style={{fontSize:size*0.3,fontWeight:700,color,fontFamily:SS}}>{initials}</span>
    </div>
  )
}

function StatusDot({status}){
  return <span style={{width:8,height:8,borderRadius:'50%',
    background:status==='online'?'#34d399':'#f59e0b',display:'inline-block',flexShrink:0}}/>
}

function Sidebar({active,setActive,setView,view}){
  const nav=useNavigate()
  return(
    <div style={{width:220,background:DARK2,borderRight:`1px solid ${B}`,
      display:'flex',flexDirection:'column',height:'100vh',flexShrink:0,overflow:'auto'}}>
      {/* Logo */}
      <div style={{padding:'20px 18px',borderBottom:`1px solid ${B}`}}>
        <p style={{margin:'0 0 2px',fontSize:9,fontWeight:700,letterSpacing:'0.28em',
          textTransform:'uppercase',color:GOLD}}>El Shaddai</p>
        <p style={{margin:0,fontSize:14,fontFamily:SF,color:'#fff',fontWeight:400}}>Team Hub</p>
      </div>

      {/* Views */}
      <div style={{padding:'12px 8px 6px'}}>
        <p style={{margin:'0 0 6px',padding:'0 10px',fontSize:9,color:MUT,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase'}}>Navigation</p>
        {[{id:'overview',label:'Team Overview',icon:'⊞'},
          {id:'sprint',label:'Sprint Board',icon:'⊟'}].map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)}
            style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 10px',
              background:view===v.id&&!active?`${GOLD}15`:'transparent',border:'none',cursor:'pointer',
              borderRadius:6,marginBottom:2,fontFamily:SS,
              color:view===v.id&&!active?GOLD:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:view===v.id&&!active?600:400,
              textAlign:'left',transition:'all 0.15s'}}>
            <span style={{fontSize:14}}>{v.icon}</span>{v.label}
          </button>
        ))}
      </div>

      {/* Roles */}
      <div style={{padding:'6px 8px',flex:1}}>
        <p style={{margin:'0 0 6px',padding:'0 10px',fontSize:9,color:MUT,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase'}}>Team Roles</p>
        {TEAM.map(t=>(
          <button key={t.role} onClick={()=>{setActive(t.role);setView('dashboard')}}
            style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 10px',
              background:active===t.role?`${t.color}15`:'transparent',border:'none',cursor:'pointer',
              borderRadius:6,marginBottom:2,fontFamily:SS,transition:'all 0.15s',textAlign:'left'}}>
            <StatusDot status={t.status}/>
            <span style={{flex:1,fontSize:11,fontWeight:active===t.role?600:400,
              color:active===t.role?t.color:'rgba(255,255,255,0.6)',lineHeight:1.3}}>
              {t.name}<br/>
              <span style={{fontSize:9,color:MUT,fontWeight:400}}>{t.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div style={{padding:'12px 16px',borderTop:`1px solid ${B}`}}>
        <button onClick={()=>nav('/')}
          style={{width:'100%',fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
            background:'transparent',border:`1px solid ${B}`,color:MUT,padding:'8px',cursor:'pointer',
            borderRadius:4,fontFamily:SS,transition:'all 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=GOLD}
          onMouseLeave={e=>e.currentTarget.style.borderColor=B}>
          ← Back to Site
        </button>
      </div>
    </div>
  )
}

function TeamOverview(){
  const [hov,setHov]=useState(null)
  return(
    <div style={{padding:'32px',maxWidth:1300}}>
      <div style={{marginBottom:32}}>
        <p style={{margin:'0 0 4px',fontSize:10,fontWeight:700,letterSpacing:'0.28em',
          textTransform:'uppercase',color:GOLD}}>El Shaddai Interior Platform</p>
        <h1 style={{margin:'0 0 8px',fontSize:36,fontFamily:SF,fontWeight:400,color:'#fff'}}>
          The Build Team <span style={{color:GOLD,fontStyle:'italic'}}>— 6 Roles, 1 Mission</span>
        </h1>
        <p style={{margin:0,fontSize:14,color:MUT,maxWidth:600,lineHeight:1.7}}>
          A lean, cross-functional team shipping a Homestyler/Coohom-class interior design platform for India.
          Each role owns a specific domain. Sprint 4, Phase 1 — editor MVP.
        </p>
      </div>

      {/* Sprint summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:32}}>
        {[
          {l:'Sprint',v:'4 of Phase 1',c:GOLD},
          {l:'Velocity',v:'34 pts / sprint',c:'#34d399'},
          {l:'Active Tasks',v:'6 in progress',c:'#38bdf8'},
          {l:'Blockers',v:'2 open',c:'#f87171'},
        ].map(s=>(
          <div key={s.l} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 20px'}}>
            <p style={{margin:'0 0 4px',fontSize:9,color:MUT,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase'}}>{s.l}</p>
            <p style={{margin:0,fontSize:20,fontWeight:700,color:s.c,fontFamily:SF}}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Team cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {TEAM.map(t=>(
          <div key={t.role}
            onMouseEnter={()=>setHov(t.role)} onMouseLeave={()=>setHov(null)}
            style={{background:CARD,border:`1px solid ${hov===t.role?t.color+'60':B}`,
              borderRadius:12,padding:'24px',transition:'all 0.25s',
              borderTop:`3px solid ${t.color}`,cursor:'default'}}>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
              <Avatar initials={t.avatar} color={t.color} size={48}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <p style={{margin:0,fontSize:14,fontWeight:700,color:'#fff'}}>{t.name}</p>
                  <StatusDot status={t.status}/>
                </div>
                <p style={{margin:0,fontSize:10,color:t.color,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase'}}>
                  {t.label} {t.sub}
                </p>
              </div>
              <span style={{fontSize:24,color:t.color,opacity:0.5}}>{t.icon}</span>
            </div>
            <p style={{margin:'0 0 12px',fontSize:10,color:MUT,fontFamily:'monospace'}}>{t.email}</p>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {t.owns.map(o=>(
                <div key={o} style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{width:3,height:3,borderRadius:'50%',background:t.color,display:'block',flexShrink:0}}/>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.65)'}}>{o}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div style={{marginTop:32,background:CARD,border:`1px solid ${B}`,borderRadius:12,padding:'24px'}}>
        <p style={{margin:'0 0 16px',fontSize:10,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:MUT}}>Technology Stack</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {['React 18','Vite','Three.js','Canvas 2D API','Express','SQLite','JWT/bcrypt','Nodemailer',
            'TanStack Query','React Router','OrbitControls','GLTFExporter','BullMQ (planned)','Blender 4.x (planned)',
            'Vercel','Railway','Cloudflare CDN'].map(t=>(
            <span key={t} style={{fontSize:11,color:'rgba(255,255,255,0.75)',background:'#12121a',
              border:`1px solid ${B}`,padding:'5px 12px',borderRadius:4}}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TeamHub(){
  const { user } = useAuth()
  const [activeRole, setActiveRole] = useState(
    user?.role && DASHBOARD_MAP[user.role] ? user.role : null
  )
  const [view, setView] = useState(
    user?.role && DASHBOARD_MAP[user.role] ? 'dashboard' : 'overview'
  )

  const Dashboard = activeRole ? DASHBOARD_MAP[activeRole] : null
  const member    = activeRole ? TEAM.find(t=>t.role===activeRole) : null

  return(
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:DARK,fontFamily:SS}}>
      <Sidebar active={activeRole} setActive={setActiveRole} view={view} setView={setView}/>

      <div style={{flex:1,overflow:'auto',background:DARK}}>
        {/* Top bar */}
        <div style={{height:52,background:DARK2,borderBottom:`1px solid ${B}`,
          display:'flex',alignItems:'center',padding:'0 24px',gap:16,flexShrink:0,
          position:'sticky',top:0,zIndex:10}}>
          {member?(
            <>
              <Avatar initials={member.avatar} color={member.color} size={28}/>
              <span style={{fontSize:13,fontWeight:600,color:'#fff'}}>{member.name}</span>
              <span style={{fontSize:10,color:member.color,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase'}}>
                {member.label} {member.sub}
              </span>
            </>
          ):(
            <span style={{fontSize:13,fontWeight:600,color:'#fff'}}>
              {view==='sprint'?'Sprint Board — Phase 1':'Team Overview'}
            </span>
          )}
          <div style={{flex:1}}/>
          <span style={{fontSize:10,color:MUT}}>Sprint 4 · Phase 1 · Jun 2026</span>
          {member&&(
            <button onClick={()=>{setActiveRole(null);setView('overview')}}
              style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                background:'transparent',border:`1px solid ${B}`,color:MUT,padding:'5px 12px',
                cursor:'pointer',borderRadius:3,fontFamily:SS}}>
              ← Team
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{minHeight:'calc(100vh - 52px)'}}>
          {view==='sprint'   && <SprintBoard/>}
          {view==='overview' && <TeamOverview/>}
          {view==='dashboard'&& Dashboard && <Dashboard user={member}/>}
        </div>
      </div>
    </div>
  )
}
