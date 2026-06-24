import { useState } from 'react'
const CARD='#1a1a26',B='#252535',GOLD='#c9a227',MUT='rgba(255,255,255,0.38)',SS="'DM Sans',system-ui,sans-serif",SF="'Cormorant Garamond',Georgia,serif"
const C='#f59e0b'

const ENDPOINTS=[
  {method:'POST',path:'/api/auth/register',status:200,latency:'38ms',calls:142,notes:'Validates 6 role types'},
  {method:'POST',path:'/api/auth/login',status:200,latency:'22ms',calls:891,notes:'JWT 7d, bcrypt compare'},
  {method:'GET', path:'/api/auth/me',status:200,latency:'8ms', calls:2140,notes:'Token verify + user lookup'},
  {method:'GET', path:'/api/projects',status:200,latency:'14ms',calls:580,notes:'Paginated, role-filtered'},
  {method:'POST',path:'/api/projects',status:201,latency:'28ms',calls:38,notes:''},
  {method:'GET', path:'/api/scenes',status:200,latency:'12ms',calls:220,notes:'Per-user scenes'},
  {method:'POST',path:'/api/scenes',status:201,latency:'18ms',calls:64,notes:'JSON blob stored in SQLite'},
  {method:'POST',path:'/api/render/jobs',status:202,latency:'44ms',calls:22,notes:'Stub simulation — Blender pending'},
  {method:'GET', path:'/api/render/jobs/:id',status:200,latency:'6ms', calls:180,notes:'Poll for render status'},
  {method:'GET', path:'/api/catalog',status:200,latency:'10ms',calls:310,notes:'Stub — real GLBs pending'},
  {method:'POST',path:'/api/contact',status:200,latency:'320ms',calls:28,notes:'Nodemailer SMTP'},
  {method:'GET', path:'/api/leads',status:200,latency:'16ms',calls:142,notes:'Admin only'},
]
const MC={GET:'#38bdf8',POST:'#34d399',PUT:GOLD,DELETE:'#f87171',PATCH:'#a78bfa'}

export default function BackendDashboard({user}){
  const [tab,setTab]=useState('endpoints')
  return(
    <div style={{fontFamily:SS,color:'#fff',padding:'28px 32px',maxWidth:1400}}>
      <div style={{marginBottom:28}}>
        <p style={{margin:'0 0 4px',fontSize:10,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:C}}>Backend Engineer</p>
        <h1 style={{margin:'0 0 4px',fontSize:30,fontFamily:SF,fontWeight:400}}>API · Database · <span style={{color:GOLD}}>Auth</span></h1>
        <p style={{margin:0,fontSize:13,color:MUT}}>Express + SQLite · JWT Auth · bcrypt · Nodemailer · Render Queue</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
        {[
          {l:'API Endpoints',v:'28',c:C,s:'12 auth-protected'},
          {l:'DB Tables',v:'14',c:'#a78bfa',s:'SQLite + better-sqlite3'},
          {l:'Users (Demo)',v:'10',c:'#34d399',s:'6 roles seeded'},
          {l:'Avg API Latency',v:'21ms',c:'#38bdf8',s:'Local dev'},
          {l:'Auth Success Rate',v:'99.2%',c:'#34d399',s:'Last 7 days'},
        ].map(k=>(
          <div key={k.l} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 18px'}}>
            <p style={{margin:'0 0 8px',fontSize:9,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:MUT}}>{k.l}</p>
            <p style={{margin:'0 0 4px',fontSize:24,fontWeight:700,color:k.c,fontFamily:SF}}>{k.v}</p>
            <p style={{margin:0,fontSize:10,color:MUT}}>{k.s}</p>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:`1px solid ${B}`}}>
        {['endpoints','schema','auth-log','tasks'].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
              background:'transparent',border:'none',cursor:'pointer',padding:'10px 18px',
              color:tab===t?GOLD:MUT,borderBottom:tab===t?`2px solid ${GOLD}`:'2px solid transparent',fontFamily:SS}}>
            {t.replace('-',' ')}
          </button>
        ))}
      </div>

      {tab==='endpoints'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {ENDPOINTS.map((e,i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${B}`,borderRadius:6,padding:'12px 20px',
              display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              <span style={{fontSize:9,fontWeight:700,background:`${MC[e.method]}20`,color:MC[e.method],
                border:`1px solid ${MC[e.method]}50`,padding:'3px 8px',borderRadius:3,minWidth:48,textAlign:'center',flexShrink:0}}>{e.method}</span>
              <code style={{flex:1,fontSize:12,color:'rgba(255,255,255,0.88)',fontFamily:'monospace',minWidth:220}}>{e.path}</code>
              <span style={{fontSize:11,color:'#34d399',fontFamily:'monospace',flexShrink:0}}>{e.status}</span>
              <span style={{fontSize:11,color:'#38bdf8',fontFamily:'monospace',flexShrink:0}}>{e.latency}</span>
              <span style={{fontSize:10,color:MUT,flexShrink:0}}>{e.calls} calls</span>
              {e.notes&&<span style={{fontSize:10,color:MUT,fontStyle:'italic'}}>{e.notes}</span>}
            </div>
          ))}
        </div>
      )}

      {tab==='schema'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {table:'users',cols:['id','name','email','password_hash','role','phone','city','organisation_name','years_experience','specialisation','is_active','created_at','updated_at'],pk:'id'},
            {table:'projects',cols:['id','project_number','name','client_id','client_name','status','budget','city','start_date','expected_end','progress_pct','created_at'],pk:'id'},
            {table:'scenes',cols:['id','user_id','name','scene_json','created_at','updated_at'],pk:'id'},
            {table:'render_jobs',cols:['id','scene_id','status','resolution','samples','format','type','progress','result_url','error','created_at','updated_at'],pk:'id'},
            {table:'leads',cols:['id','name','email','phone','message','space','budget','status','city','source','created_at','updated_at'],pk:'id'},
            {table:'audit_log',cols:['id','user_id','action','entity_type','entity_id','ip_address','created_at'],pk:'id'},
            {table:'employees',cols:['id','name','role','department','phone','email','salary','join_date','status'],pk:'id'},
            {table:'factory_jobs',cols:['id','project_id','job_number','item_type','stage','assigned_to'],pk:'id'},
          ].map(t=>(
            <div key={t.table} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 18px'}}>
              <p style={{margin:'0 0 10px',fontSize:13,fontWeight:700,color:GOLD,fontFamily:'monospace'}}>{t.table}</p>
              {t.cols.map(c=>(
                <div key={c} style={{display:'flex',alignItems:'center',gap:8,padding:'3px 0',borderBottom:`1px solid ${B}`}}>
                  {c===t.pk&&<span style={{fontSize:8,color:'#f59e0b',fontWeight:700}}>PK</span>}
                  {c.endsWith('_id')&&c!==t.pk&&<span style={{fontSize:8,color:'#38bdf8',fontWeight:700}}>FK</span>}
                  {c!==t.pk&&!c.endsWith('_id')&&<span style={{fontSize:8,color:'transparent'}}>__</span>}
                  <code style={{fontSize:10,color:c===t.pk?GOLD:c.endsWith('_id')?'#38bdf8':'rgba(255,255,255,0.7)'}}>{c}</code>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab==='auth-log'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            {time:'2026-06-24 09:12',action:'LOGIN',role:'PM_UX',email:'priya.pm@elshaddai.in',ip:'192.168.1.10',result:'OK'},
            {time:'2026-06-24 09:08',action:'LOGIN',role:'FRONTEND_LEAD',email:'arjun.fe@elshaddai.in',ip:'192.168.1.11',result:'OK'},
            {time:'2026-06-24 08:55',action:'LOGIN',role:'DEVOPS',email:'karthik.devops@elshaddai.in',ip:'192.168.1.15',result:'OK'},
            {time:'2026-06-24 08:50',action:'LOGIN',role:'BACKEND_ENG',email:'sanjay.be@elshaddai.in',ip:'192.168.1.12',result:'OK'},
            {time:'2026-06-24 08:45',action:'LOGIN',role:'QA_ENGINEER',email:'divya.qa@elshaddai.in',ip:'192.168.1.16',result:'OK'},
            {time:'2026-06-24 08:30',action:'LOGIN',role:'FRONTEND_UI',email:'meera.ui@elshaddai.in',ip:'192.168.1.13',result:'OK'},
            {time:'2026-06-23 22:10',action:'LOGIN',role:'CLIENT',email:'deepa.nair@gmail.com',ip:'49.204.x.x',result:'OK'},
            {time:'2026-06-23 19:45',action:'LOGIN_FAIL',role:'—',email:'unknown@hacker.com',ip:'185.220.x.x',result:'FAIL'},
          ].map((l,i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${l.result==='FAIL'?'#f8717130':B}`,borderRadius:6,
              padding:'11px 20px',display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
              <code style={{fontSize:10,color:MUT,flexShrink:0}}>{l.time}</code>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',
                color:l.action==='LOGIN'?'#34d399':'#f87171',
                background:l.action==='LOGIN'?'#34d39920':'#f8717120',
                padding:'3px 8px',borderRadius:3,flexShrink:0}}>{l.action}</span>
              <code style={{fontSize:11,color:'rgba(255,255,255,0.8)',flex:1,minWidth:180}}>{l.email}</code>
              <span style={{fontSize:10,color:'#a78bfa',flexShrink:0}}>{l.role}</span>
              <code style={{fontSize:10,color:MUT,flexShrink:0}}>{l.ip}</code>
            </div>
          ))}
        </div>
      )}

      {tab==='tasks'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {[
            {task:'Add PM_UX/FRONTEND_LEAD/QA etc roles to validRoles[]',status:'Done',priority:'HIGH'},
            {task:'Seed 6 dev team accounts with @elshaddai.in emails',status:'Done',priority:'HIGH'},
            {task:'WebSocket server for collaborative editing',status:'Backlog',priority:'HIGH'},
            {task:'Blender Cycles render worker — POST /api/render/jobs',status:'Backlog',priority:'HIGH'},
            {task:'Rate limiting on auth endpoints (express-rate-limit)',status:'Next',priority:'HIGH'},
            {task:'Refresh token flow (7d → 30d with rotation)',status:'Planned',priority:'MED'},
            {task:'Scene versioning — save snapshots on change',status:'Planned',priority:'MED'},
            {task:'Render credits deduction on job submit',status:'Next',priority:'MED'},
          ].map(t=>(
            <div key={t.task} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 20px',
              borderLeft:`3px solid ${t.status==='Done'?'#34d399':t.status==='Next'?GOLD:t.status==='Backlog'?'#6366f1':'#4b5563'}`}}>
              <p style={{margin:'0 0 8px',fontSize:13,fontWeight:500,color:'#fff'}}>{t.task}</p>
              <div style={{display:'flex',gap:10}}>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                  color:t.status==='Done'?'#34d399':t.status==='Next'?GOLD:MUT,
                  border:`1px solid currentColor`,padding:'3px 8px',borderRadius:3,opacity:0.8}}>{t.status}</span>
                <span style={{fontSize:9,fontWeight:700,color:t.priority==='HIGH'?'#f87171':GOLD,letterSpacing:'0.1em'}}>{t.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
