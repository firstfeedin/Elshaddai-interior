import { useState, useEffect } from 'react'
const CARD='#1a1a26',B='#252535',GOLD='#c9a227',MUT='rgba(255,255,255,0.38)',SS="'DM Sans',system-ui,sans-serif",SF="'Cormorant Garamond',Georgia,serif"
const C='#fb923c'

function Uptime({pct}){
  const bars=Array.from({length:90},(_,i)=>({ok:i<Math.round(pct*90/100)}))
  return(
    <div style={{display:'flex',gap:2,flexWrap:'wrap'}}>
      {bars.map((b,i)=>(
        <div key={i} style={{width:6,height:16,borderRadius:1,background:b.ok?'#34d399':'#f87171',opacity:b.ok?0.7:1}}/>
      ))}
    </div>
  )
}

export default function DevOpsDashboard({user}){
  const [tab,setTab]=useState('infra')
  const [uptime,setUptime]=useState({api:99.8,cdn:100,db:99.9})

  return(
    <div style={{fontFamily:SS,color:'#fff',padding:'28px 32px',maxWidth:1400}}>
      <div style={{marginBottom:28}}>
        <p style={{margin:'0 0 4px',fontSize:10,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:C}}>DevOps / Cloud Infrastructure</p>
        <h1 style={{margin:'0 0 4px',fontSize:30,fontFamily:SF,fontWeight:400}}>Servers · Pipelines · <span style={{color:GOLD}}>Rendering</span></h1>
        <p style={{margin:0,fontSize:13,color:MUT}}>Vite + Vercel frontend · Express + Railway backend · Render workers</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
        {[
          {l:'API Uptime',v:'99.8%',c:'#34d399',s:'Last 90 days'},
          {l:'Build Time',v:'35.7s',c:GOLD,s:'Vite prod build'},
          {l:'Bundle (gzip)',v:'1.6MB',c:'#f87171',s:'babylon too large'},
          {l:'Deploy Frequency',v:'4/day',c:C,s:'avg this sprint'},
          {l:'Render Workers',v:'0 active',c:'#a78bfa',s:'Stub — Blender pending'},
        ].map(k=>(
          <div key={k.l} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 18px'}}>
            <p style={{margin:'0 0 8px',fontSize:9,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:MUT}}>{k.l}</p>
            <p style={{margin:'0 0 4px',fontSize:24,fontWeight:700,color:k.c,fontFamily:SF}}>{k.v}</p>
            <p style={{margin:0,fontSize:10,color:MUT}}>{k.s}</p>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:`1px solid ${B}`}}>
        {['infra','pipeline','bundle','render-workers'].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
              background:'transparent',border:'none',cursor:'pointer',padding:'10px 18px',
              color:tab===t?GOLD:MUT,borderBottom:tab===t?`2px solid ${GOLD}`:'2px solid transparent',fontFamily:SS}}>
            {t.replace('-',' ')}
          </button>
        ))}
      </div>

      {tab==='infra'&&(
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {[
            {service:'Frontend (Vite → Vercel)',status:'operational',uptime:99.8,region:'Mumbai + Global CDN',note:'Auto-deploy on push to main'},
            {service:'Backend API (Express)',status:'operational',uptime:99.9,region:'Railway — ap-south-1',note:'Port 3001 · JWT auth · CORS configured'},
            {service:'Database (SQLite)',status:'operational',uptime:99.9,region:'Co-located with API',note:'better-sqlite3 · WAL mode'},
            {service:'Asset CDN',status:'operational',uptime:100,region:'Cloudflare',note:'Static assets, GLB models'},
            {service:'Blender Render Worker',status:'not-deployed',uptime:0,region:'—',note:'Pending: BullMQ + Blender 4.x headless'},
            {service:'WebSocket Server',status:'not-deployed',uptime:0,region:'—',note:'Pending: Socket.io for collaborative editing'},
          ].map(s=>(
            <div key={s.service} style={{background:CARD,border:`1px solid ${s.status==='not-deployed'?'#4b556330':B}`,borderRadius:8,padding:'18px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,flexWrap:'wrap',gap:8}}>
                <div>
                  <p style={{margin:'0 0 2px',fontSize:14,fontWeight:600,color:s.status==='not-deployed'?MUT:'#fff'}}>{s.service}</p>
                  <p style={{margin:0,fontSize:11,color:MUT}}>{s.region} · {s.note}</p>
                </div>
                <div style={{display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:700,color:s.status==='operational'?'#34d399':MUT}}>{s.uptime}%</span>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                    color:s.status==='operational'?'#34d399':MUT,
                    border:`1px solid currentColor`,padding:'3px 8px',borderRadius:3}}>
                    {s.status.replace('-',' ')}
                  </span>
                </div>
              </div>
              {s.status==='operational'&&<Uptime pct={s.uptime}/>}
            </div>
          ))}
        </div>
      )}

      {tab==='pipeline'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 20px',marginBottom:6}}>
            <p style={{margin:'0 0 4px',fontSize:10,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:MUT}}>CI/CD Pipeline — GitHub Actions (planned)</p>
            <p style={{margin:0,fontSize:12,color:MUT}}>Currently: manual deploy via Vercel CLI / Railway. GitHub Actions config in progress.</p>
          </div>
          {[
            {step:'1. Trigger',detail:'Push to main or PR merge',status:'configured',time:'—'},
            {step:'2. Install',detail:'npm ci --prefer-offline',status:'configured',time:'28s avg'},
            {step:'3. Type Check',detail:'tsc --noEmit',status:'pending',time:'—'},
            {step:'4. Lint',detail:'eslint src/ --ext .jsx,.js',status:'pending',time:'—'},
            {step:'5. Build',detail:'vite build → dist/',status:'configured',time:'36s avg'},
            {step:'6. Test',detail:'vitest run (placeholder)',status:'pending',time:'—'},
            {step:'7. Deploy Frontend',detail:'vercel --prod --token $VERCEL_TOKEN',status:'configured',time:'45s avg'},
            {step:'8. Deploy Backend',detail:'railway up --service api',status:'pending',time:'—'},
            {step:'9. Smoke Test',detail:'curl /api/health → 200',status:'pending',time:'—'},
          ].map(s=>(
            <div key={s.step} style={{background:`${CARD}cc`,border:`1px solid ${B}`,borderRadius:6,
              padding:'12px 20px',display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
              <span style={{fontSize:11,fontWeight:700,color:GOLD,minWidth:70,flexShrink:0}}>{s.step}</span>
              <code style={{flex:1,fontSize:11,color:'rgba(255,255,255,0.8)',minWidth:200}}>{s.detail}</code>
              <span style={{fontSize:10,color:MUT,flexShrink:0}}>{s.time}</span>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                color:s.status==='configured'?'#34d399':MUT,
                border:`1px solid currentColor`,padding:'3px 8px',borderRadius:3,flexShrink:0}}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab==='bundle'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:'#1a120a',border:`1px solid #f5973030`,borderRadius:8,padding:'14px 20px',marginBottom:4}}>
            <p style={{margin:0,fontSize:12,color:'#f59e0b'}}>⚠ babylon-core chunk is 5.8MB (gzip: 1.3MB). Action: lazy-load BabylonJS via dynamic import() only on pages that use it. Saves ~60% initial bundle.</p>
          </div>
          {[
            {chunk:'babylon-core',size:'5,877 KB',gz:'1,308 KB',action:'Dynamic import — only load on /designer route',priority:'HIGH'},
            {chunk:'three-vendor',size:'803 KB',gz:'212 KB',action:'Tree-shake: only import used Three.js modules',priority:'MED'},
            {chunk:'react-vendor',size:'279 KB',gz:'90 KB',action:'Already optimal',priority:'OK'},
            {chunk:'StudioPage',size:'115 KB',gz:'31 KB',action:'Split scene editor into sub-chunks',priority:'MED'},
            {chunk:'HomestylerClone',size:'71 KB',gz:'17 KB',action:'Lazy-load hero images via IntersectionObserver',priority:'LOW'},
            {chunk:'DashboardPage',size:'77 KB',gz:'17 KB',action:'Split widget components into async chunks',priority:'LOW'},
            {chunk:'babylon-extras',size:'220 KB',gz:'50 KB',action:'Lazy-load alongside babylon-core',priority:'MED'},
            {chunk:'three-vendor',size:'803 KB',gz:'212 KB',action:'Import only: BoxGeometry, MeshStandardMaterial etc.',priority:'MED'},
          ].map((c,i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${c.priority==='HIGH'?'#f8717130':B}`,borderRadius:6,
              padding:'12px 20px',display:'flex',alignItems:'center',gap:20,flexWrap:'wrap',
              borderLeft:`3px solid ${c.priority==='HIGH'?'#f87171':c.priority==='MED'?GOLD:c.priority==='OK'?'#34d399':'#4b5563'}`}}>
              <code style={{fontSize:12,color:C,minWidth:150,flexShrink:0,fontFamily:'monospace'}}>{c.chunk}</code>
              <div style={{display:'flex',gap:16,flexShrink:0}}>
                <span style={{fontSize:11,color:'#fff',fontFamily:'monospace'}}>{c.size}</span>
                <span style={{fontSize:11,color:'#34d399',fontFamily:'monospace'}}>gz: {c.gz}</span>
              </div>
              <p style={{flex:1,margin:0,fontSize:11,color:MUT,minWidth:180}}>{c.action}</p>
              <span style={{fontSize:9,fontWeight:700,color:c.priority==='HIGH'?'#f87171':c.priority==='MED'?GOLD:c.priority==='OK'?'#34d399':MUT,flexShrink:0}}>{c.priority}</span>
            </div>
          ))}
        </div>
      )}

      {tab==='render-workers'&&(
        <div>
          <div style={{background:'#120d1a',border:`1px solid #a78bfa30`,borderRadius:8,padding:'20px 24px',marginBottom:16}}>
            <p style={{margin:'0 0 8px',fontSize:14,fontWeight:600,color:'#a78bfa'}}>Render Worker Architecture (Phase 2)</p>
            <p style={{margin:0,fontSize:12,color:MUT,lineHeight:1.7}}>
              POST /api/render/jobs → BullMQ queue → Worker pod picks job → Downloads scene GLB → Runs Blender 4.x --background --python render.py → Uploads output PNG to S3 → Updates job status via WebSocket
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[
              {component:'BullMQ Job Queue',status:'Planned',note:'Redis-backed job queue. Retry on failure, priority lanes.'},
              {component:'Blender 4.x Headless',status:'Planned',note:'--background mode. Python script for scene import + ACES render.'},
              {component:'S3 Asset Storage',status:'Planned',note:'GLB input + PNG/EXR output. Signed URL for client download.'},
              {component:'Worker Auto-scaling',status:'Planned',note:'Kubernetes HPA based on queue depth. Min 0, max 10 workers.'},
              {component:'Current Stub (simulateRender)',status:'Active',note:'In-memory simulation. 2s → rendering, 8s → done. SQLite persistence.'},
              {component:'Render Credits API',status:'Active',note:'RENDER_CREDITS map: 720p=1, 1080p=2, 4K=8, 8K=16 credits.'},
            ].map(c=>(
              <div key={c.component} style={{background:CARD,border:`1px solid ${c.status==='Active'?GOLD+'40':B}`,borderRadius:8,padding:'16px 18px',
                borderTop:`3px solid ${c.status==='Active'?GOLD:'#4b5563'}`}}>
                <p style={{margin:'0 0 6px',fontSize:13,fontWeight:600,color:'#fff'}}>{c.component}</p>
                <p style={{margin:'0 0 10px',fontSize:11,color:MUT,lineHeight:1.5}}>{c.note}</p>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                  color:c.status==='Active'?GOLD:MUT,border:`1px solid currentColor`,padding:'3px 8px',borderRadius:3}}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
