import { useState } from 'react'
const D='#0d0d12',CARD='#1a1a26',B='#252535',GOLD='#c9a227',MUT='rgba(255,255,255,0.38)',SS="'DM Sans',system-ui,sans-serif",SF="'Cormorant Garamond',Georgia,serif"
const C='#38bdf8'

const COMPONENTS=[
  {name:'FloorPlan2D',file:'src/features/designer/FloorPlan2D.jsx',lines:578,status:'active',coverage:72,notes:'Wall draw + snap done. Furniture drag WIP.'},
  {name:'ThreeViewport',file:'src/features/designer/ThreeViewport.jsx',lines:550,status:'active',coverage:58,notes:'Now wired to scene model. Furniture sync WIP.'},
  {name:'SceneProvider',file:'src/store/sceneStore.jsx',lines:210,status:'stable',coverage:90,notes:'50-step undo/redo working.'},
  {name:'scene.js',file:'src/lib/scene.js',lines:180,status:'stable',coverage:95,notes:'Phase 0 locked spec — no changes needed.'},
  {name:'gltfExport.js',file:'src/lib/gltfExport.js',lines:120,status:'stable',coverage:70,notes:'Export + render job submit working.'},
  {name:'StudioPage',file:'src/pages/app/StudioPage.jsx',lines:1900,status:'active',coverage:44,notes:'Tool wiring complete. handleRender upgrade pending.'},
  {name:'DashboardShell',file:'src/features/dashboard/components/DashboardShell.jsx',lines:280,status:'stable',coverage:82,notes:'Sidebar + mobile nav working.'},
]
const PRS=[
  {id:'PR-28',title:'Wire ThreeViewport to scene model',status:'merged',author:'FE Lead',files:2,lines:'+89/-12'},
  {id:'PR-29',title:'Add furniture sync effect to viewport',status:'merged',author:'FE Lead',files:1,lines:'+38/-0'},
  {id:'PR-30',title:'Furniture drag-drop in 2D canvas',status:'open',author:'FE Lead',files:1,lines:'+120/-8'},
  {id:'PR-31',title:'Real-time 2D→3D sync on wall edit',status:'draft',author:'FE Lead',files:3,lines:'+55/-22'},
]
const SC={merged:'#34d399',open:GOLD,draft:'#a78bfa',review:'#38bdf8'}

export default function FrontendLeadDashboard({user}){
  const [tab,setTab]=useState('components')
  return(
    <div style={{fontFamily:SS,color:'#fff',padding:'28px 32px',maxWidth:1400}}>
      <div style={{marginBottom:28}}>
        <p style={{margin:'0 0 4px',fontSize:10,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:C}}>Frontend Engineer — Lead</p>
        <h1 style={{margin:'0 0 4px',fontSize:30,fontFamily:SF,fontWeight:400}}>Studio & 3D <span style={{color:GOLD}}>Engineering</span></h1>
        <p style={{margin:0,fontSize:13,color:MUT}}>Owns canvas tools, Three.js viewport, scene model, and studio UX</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
        {[
          {l:'Active Files',v:'6',c:C,s:'Under development'},
          {l:'Lines of Code',v:'3.5K',c:'#a78bfa',s:'Studio + designer'},
          {l:'Avg Coverage',v:'72%',c:'#34d399',s:'Target: 80%'},
          {l:'Open PRs',v:'2',c:GOLD,s:'1 draft, 1 open'},
          {l:'3D FPS',v:'58',c:'#34d399',s:'@1080p, M1 Mac'},
        ].map(k=>(
          <div key={k.l} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 18px'}}>
            <p style={{margin:'0 0 8px',fontSize:9,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:MUT}}>{k.l}</p>
            <p style={{margin:'0 0 4px',fontSize:24,fontWeight:700,color:k.c,fontFamily:SF}}>{k.v}</p>
            <p style={{margin:0,fontSize:10,color:MUT}}>{k.s}</p>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:`1px solid ${B}`}}>
        {['components','prs','canvas-tasks','perf'].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
              background:'transparent',border:'none',cursor:'pointer',padding:'10px 18px',
              color:tab===t?GOLD:MUT,borderBottom:tab===t?`2px solid ${GOLD}`:'2px solid transparent',
              fontFamily:SS}}>
            {t.replace('-',' ')}
          </button>
        ))}
      </div>

      {tab==='components'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {COMPONENTS.map(c=>(
            <div key={c.name} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 20px',
              display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
              <div style={{minWidth:160}}>
                <p style={{margin:'0 0 2px',fontSize:13,fontWeight:600,color:'#fff'}}>{c.name}</p>
                <p style={{margin:0,fontSize:10,color:MUT,fontFamily:'monospace'}}>{c.file}</p>
              </div>
              <div style={{flex:1,minWidth:200}}>
                <p style={{margin:'0 0 6px',fontSize:11,color:'rgba(255,255,255,0.7)'}}>{c.notes}</p>
                {/* Coverage bar */}
                <div style={{height:4,background:'#1a1a2e',borderRadius:2,width:'100%',maxWidth:200}}>
                  <div style={{height:'100%',width:`${c.coverage}%`,background:c.coverage>80?'#34d399':c.coverage>60?GOLD:'#f87171',borderRadius:2,transition:'width 1s'}}/>
                </div>
              </div>
              <div style={{display:'flex',gap:16,alignItems:'center',flexShrink:0}}>
                <span style={{fontSize:11,color:MUT}}>{c.lines} lines</span>
                <span style={{fontSize:11,color:MUT}}>{c.coverage}% cov</span>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                  color:c.status==='stable'?'#34d399':GOLD,border:`1px solid currentColor`,
                  padding:'3px 8px',borderRadius:3,opacity:0.9}}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='prs'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {PRS.map(p=>(
            <div key={p.id} style={{background:CARD,border:`1px solid ${B}`,borderLeft:`3px solid ${SC[p.status]||MUT}`,
              borderRadius:8,padding:'16px 20px',display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
              <span style={{fontSize:10,fontWeight:700,color:C,fontFamily:'monospace',flexShrink:0}}>{p.id}</span>
              <p style={{flex:1,margin:0,fontSize:13,color:'rgba(255,255,255,0.88)',minWidth:200}}>{p.title}</p>
              <div style={{display:'flex',gap:16,alignItems:'center',flexShrink:0}}>
                <span style={{fontSize:10,color:MUT}}>{p.files} files</span>
                <span style={{fontSize:10,color:'#34d399',fontFamily:'monospace'}}>{p.lines}</span>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                  color:SC[p.status],border:`1px solid ${SC[p.status]}50`,padding:'3px 8px',borderRadius:3}}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='canvas-tasks'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {[
            {task:'Furniture drag in 2D canvas',status:'In Progress',desc:'Drag from catalog panel → drop on floor plan. Auto-snap to grid. Show footprint.', priority:'HIGH'},
            {task:'2D→3D real-time sync',status:'In Progress',desc:'useEffect watching activeFloor.walls fires Three.js rebuild. Need debounce 200ms.', priority:'HIGH'},
            {task:'Opening cut-outs in 3D walls',status:'Next',desc:'Boolean subtract door/window openings from wall BoxGeometry using CSG.', priority:'MED'},
            {task:'Camera fly-to on room select',status:'Planned',desc:'Animate camera to look at selected wall or room. Lerp + OrbitControls.target.', priority:'LOW'},
            {task:'handleRender → real job queue',status:'Next',desc:'Replace setTimeout simulation in StudioPage with /api/render/jobs POST.', priority:'HIGH'},
            {task:'glTF export from studio UI',status:'Planned',desc:'Export button → exportSceneToGLTF(threeScene) → download .glb', priority:'MED'},
          ].map(t=>(
            <div key={t.task} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'18px 20px',
              borderLeft:`3px solid ${t.status==='In Progress'?GOLD:t.status==='Next'?C:'#4b5563'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:8}}>
                <p style={{margin:0,fontSize:14,fontWeight:600,color:'#fff'}}>{t.task}</p>
                <span style={{fontSize:8,fontWeight:700,letterSpacing:'0.18em',color:t.priority==='HIGH'?'#f87171':t.priority==='MED'?GOLD:'#34d399',flexShrink:0}}>{t.priority}</span>
              </div>
              <p style={{margin:'0 0 10px',fontSize:11,color:MUT,lineHeight:1.6}}>{t.desc}</p>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                color:t.status==='In Progress'?GOLD:t.status==='Next'?C:MUT,
                border:`1px solid currentColor`,padding:'3px 8px',borderRadius:3,opacity:0.8}}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab==='perf'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {[
            {metric:'First Contentful Paint',value:'1.2s',target:'< 1.5s',pass:true},
            {metric:'Time to Interactive',value:'2.8s',target:'< 3.0s',pass:true},
            {metric:'Studio Load Time',value:'4.1s',target:'< 3.0s',pass:false},
            {metric:'Three.js Init',value:'420ms',target:'< 500ms',pass:true},
            {metric:'FloorPlan2D Render',value:'8ms',target:'< 16ms',pass:true},
            {metric:'Scene JSON Parse',value:'12ms',target:'< 50ms',pass:true},
            {metric:'babylon-core chunk',value:'5.8MB',target:'< 2MB',pass:false,note:'Dynamic import candidate'},
            {metric:'three-vendor chunk',value:'803KB',target:'< 600KB',pass:false,note:'Tree-shake unused modules'},
            {metric:'60fps in 3D view',value:'58fps',target:'≥ 60fps',pass:true},
          ].map(m=>(
            <div key={m.metric} style={{background:CARD,border:`1px solid ${m.pass?B:'#f8717130'}`,borderRadius:8,padding:'16px 18px',
              borderLeft:`3px solid ${m.pass?'#34d399':'#f87171'}`}}>
              <p style={{margin:'0 0 8px',fontSize:12,color:'rgba(255,255,255,0.7)'}}>{m.metric}</p>
              <p style={{margin:'0 0 4px',fontSize:22,fontWeight:700,color:m.pass?'#34d399':'#f87171',fontFamily:SF}}>{m.value}</p>
              <p style={{margin:0,fontSize:10,color:MUT}}>Target: {m.target}</p>
              {m.note&&<p style={{margin:'6px 0 0',fontSize:10,color:'#f59e0b'}}>{m.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
