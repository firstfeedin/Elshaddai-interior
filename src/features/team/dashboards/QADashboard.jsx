import { useState } from 'react'
const CARD='#1a1a26',B='#252535',GOLD='#c9a227',MUT='rgba(255,255,255,0.38)',SS="'DM Sans',system-ui,sans-serif",SF="'Cormorant Garamond',Georgia,serif"
const C='#f87171'

const BUGS=[
  {id:'BUG-041',sev:'P1',title:'babylon-core bundle 5.8MB — blocks mobile LCP',component:'Build',status:'open',owner:'DevOps',reported:'Jun 22'},
  {id:'BUG-042',sev:'P2',title:'FloorPlan2D: drawing a wall off-canvas edge creates NaN coordinates',component:'Canvas',status:'open',owner:'FE Lead',reported:'Jun 23'},
  {id:'BUG-043',sev:'P2',title:'ThreeViewport: room not rebuilt when wall count drops to 0',component:'3D',status:'open',owner:'FE Lead',reported:'Jun 23'},
  {id:'BUG-044',sev:'P2',title:'StudioPage: undo does not reflect in 3D view until next render',component:'State',status:'investigating',owner:'FE Lead',reported:'Jun 24'},
  {id:'BUG-045',sev:'P3',title:'Mobile: left panel overlaps canvas in portrait mode',component:'Responsive',status:'open',owner:'FE UI',reported:'Jun 22'},
  {id:'BUG-046',sev:'P3',title:'Auth: password field shows plain text momentarily on iOS Safari',component:'Auth',status:'fixed',owner:'Backend',reported:'Jun 20'},
  {id:'BUG-047',sev:'P3',title:'Catalog: search debounce fires on every keypress (no delay)',component:'Catalog',status:'fixed',owner:'FE UI',reported:'Jun 19'},
  {id:'BUG-048',sev:'P4',title:'Footer newsletter: success toast visible behind cookie banner',component:'UI',status:'open',owner:'FE UI',reported:'Jun 21'},
]
const SEV_C={P1:'#f87171',P2:'#fb923c',P3:GOLD,P4:'#38bdf8'}
const ST_C={open:'#f87171',investigating:GOLD,fixed:'#34d399',closed:'#4b5563'}

const E2E=[
  {flow:'User registers + logs in',steps:5,status:'pass',time:'3.2s'},
  {flow:'Draw 2 walls → see in 3D',steps:8,status:'pass',time:'4.8s'},
  {flow:'Place door on wall',steps:4,status:'fail',time:'—',note:'Opens dialog but does not place'},
  {flow:'Save scene → reload → scene persists',steps:6,status:'pass',time:'2.1s'},
  {flow:'Submit render job → poll to done',steps:5,status:'pass',time:'10.4s'},
  {flow:'Upload floor plan image',steps:3,status:'pass',time:'1.8s'},
  {flow:'Add furniture from catalog',steps:4,status:'fail',time:'—',note:'Drag-drop not implemented yet'},
  {flow:'Export GLB file',steps:2,status:'skip',time:'—',note:'UI button not wired'},
]
const E2E_C={pass:'#34d399',fail:'#f87171',skip:MUT}

export default function QADashboard({user}){
  const [tab,setTab]=useState('bugs')
  const open=BUGS.filter(b=>b.status!=='fixed'&&b.status!=='closed').length
  const fixed=BUGS.filter(b=>b.status==='fixed'||b.status==='closed').length
  const passed=E2E.filter(e=>e.status==='pass').length

  return(
    <div style={{fontFamily:SS,color:'#fff',padding:'28px 32px',maxWidth:1400}}>
      <div style={{marginBottom:28}}>
        <p style={{margin:'0 0 4px',fontSize:10,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:C}}>Full-Stack QA Engineer</p>
        <h1 style={{margin:'0 0 4px',fontSize:30,fontFamily:SF,fontWeight:400}}>Tests · Bugs · <span style={{color:GOLD}}>Quality</span></h1>
        <p style={{margin:0,fontSize:13,color:MUT}}>End-to-end flows, bug tracking, performance audits, regression sweeps</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
        {[
          {l:'Open Bugs',v:open,c:C,s:`${BUGS.filter(b=>b.sev==='P1').length} P1 critical`},
          {l:'Fixed This Sprint',v:fixed,c:'#34d399',s:'Verified + closed'},
          {l:'E2E Pass Rate',v:`${passed}/${E2E.length}`,c:GOLD,s:'Critical user flows'},
          {l:'Test Coverage',v:'44%',c:'#f59e0b',s:'Target: 70%'},
          {l:'Lighthouse Score',v:'78',c:'#38bdf8',s:'Avg across pages'},
        ].map(k=>(
          <div key={k.l} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 18px'}}>
            <p style={{margin:'0 0 8px',fontSize:9,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:MUT}}>{k.l}</p>
            <p style={{margin:'0 0 4px',fontSize:24,fontWeight:700,color:k.c,fontFamily:SF}}>{k.v}</p>
            <p style={{margin:0,fontSize:10,color:MUT}}>{k.s}</p>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:`1px solid ${B}`}}>
        {['bugs','e2e','coverage','perf-audit'].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
              background:'transparent',border:'none',cursor:'pointer',padding:'10px 18px',
              color:tab===t?GOLD:MUT,borderBottom:tab===t?`2px solid ${GOLD}`:'2px solid transparent',fontFamily:SS}}>
            {t.replace('-',' ')}
          </button>
        ))}
      </div>

      {tab==='bugs'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {BUGS.map(b=>(
            <div key={b.id} style={{background:CARD,border:`1px solid ${b.status==='open'||b.status==='investigating'?'#f8717120':B}`,
              borderRadius:6,padding:'14px 20px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              <code style={{fontSize:10,color:'#38bdf8',flexShrink:0,fontFamily:'monospace'}}>{b.id}</code>
              <span style={{fontSize:9,fontWeight:700,background:`${SEV_C[b.sev]}20`,color:SEV_C[b.sev],
                border:`1px solid ${SEV_C[b.sev]}50`,padding:'3px 8px',borderRadius:3,flexShrink:0}}>{b.sev}</span>
              <p style={{flex:1,margin:0,fontSize:12,color:'rgba(255,255,255,0.88)',minWidth:200}}>{b.title}</p>
              <span style={{fontSize:10,color:'#a78bfa',flexShrink:0}}>{b.component}</span>
              <span style={{fontSize:10,color:MUT,flexShrink:0}}>{b.owner}</span>
              <span style={{fontSize:10,color:MUT,flexShrink:0}}>{b.reported}</span>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                color:ST_C[b.status],border:`1px solid ${ST_C[b.status]}50`,padding:'3px 8px',borderRadius:3,flexShrink:0}}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab==='e2e'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'14px 20px',marginBottom:4,
            display:'flex',gap:24}}>
            <div><span style={{fontSize:24,fontWeight:700,color:'#34d399',fontFamily:SF}}>{passed}</span><span style={{fontSize:11,color:MUT}}> passed</span></div>
            <div><span style={{fontSize:24,fontWeight:700,color:'#f87171',fontFamily:SF}}>{E2E.filter(e=>e.status==='fail').length}</span><span style={{fontSize:11,color:MUT}}> failed</span></div>
            <div><span style={{fontSize:24,fontWeight:700,color:MUT,fontFamily:SF}}>{E2E.filter(e=>e.status==='skip').length}</span><span style={{fontSize:11,color:MUT}}> skipped</span></div>
          </div>
          {E2E.map((e,i)=>(
            <div key={i} style={{background:CARD,border:`1px solid ${e.status==='fail'?'#f8717130':B}`,
              borderRadius:6,padding:'12px 20px',display:'flex',alignItems:'center',gap:20,flexWrap:'wrap',
              borderLeft:`3px solid ${E2E_C[e.status]}`}}>
              <span style={{fontSize:16,flexShrink:0}}>{e.status==='pass'?'✅':e.status==='fail'?'❌':'⏭'}</span>
              <p style={{flex:1,margin:0,fontSize:13,color:'rgba(255,255,255,0.88)',minWidth:200}}>{e.flow}</p>
              <span style={{fontSize:10,color:MUT,flexShrink:0}}>{e.steps} steps</span>
              <span style={{fontSize:10,color:'#38bdf8',flexShrink:0,fontFamily:'monospace'}}>{e.time}</span>
              {e.note&&<span style={{fontSize:10,color:'#f59e0b',fontStyle:'italic',flexShrink:0}}>{e.note}</span>}
            </div>
          ))}
        </div>
      )}

      {tab==='coverage'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {[
            {area:'Auth flows (register/login/me)',coverage:88,tests:12,status:'good'},
            {area:'Scene model (create/serialize/deserialize)',coverage:90,tests:18,status:'good'},
            {area:'API endpoints (CRUD)',coverage:74,tests:28,status:'ok'},
            {area:'FloorPlan2D canvas logic',coverage:40,tests:6,status:'low'},
            {area:'ThreeViewport render',coverage:22,tests:3,status:'low'},
            {area:'StudioPage integration',coverage:18,tests:2,status:'low'},
            {area:'DashboardShell navigation',coverage:65,tests:8,status:'ok'},
            {area:'Auth context + ProtectedRoute',coverage:80,tests:10,status:'good'},
          ].map(c=>(
            <div key={c.area} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <p style={{margin:0,fontSize:13,color:'rgba(255,255,255,0.88)'}}>{c.area}</p>
                <span style={{fontSize:18,fontWeight:700,color:c.coverage>=80?'#34d399':c.coverage>=60?GOLD:'#f87171',fontFamily:SF}}>{c.coverage}%</span>
              </div>
              <div style={{height:6,background:'#0d0d12',borderRadius:3,marginBottom:8}}>
                <div style={{height:'100%',width:`${c.coverage}%`,borderRadius:3,
                  background:c.coverage>=80?'#34d399':c.coverage>=60?GOLD:'#f87171',transition:'width 1s'}}/>
              </div>
              <p style={{margin:0,fontSize:10,color:MUT}}>{c.tests} tests · target: 80%</p>
            </div>
          ))}
        </div>
      )}

      {tab==='perf-audit'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {[
            {page:'Homepage',lh:85,fcp:'1.2s',lcp:'2.4s',cls:'0.02',tbt:'180ms',status:'good'},
            {page:'Studio (/studio)',lh:62,fcp:'1.8s',lcp:'4.1s',cls:'0.05',tbt:'720ms',status:'needs-work'},
            {page:'Auth (/login)',lh:92,fcp:'0.8s',lcp:'0.9s',cls:'0.01',tbt:'60ms',status:'good'},
            {page:'Dashboard',lh:78,fcp:'1.4s',lcp:'2.8s',cls:'0.03',tbt:'340ms',status:'ok'},
            {page:'Catalog',lh:74,fcp:'1.6s',lcp:'3.2s',cls:'0.04',tbt:'420ms',status:'ok'},
            {page:'Gallery',lh:80,fcp:'1.3s',lcp:'2.1s',cls:'0.01',tbt:'210ms',status:'good'},
          ].map(p=>(
            <div key={p.page} style={{background:CARD,border:`1px solid ${p.status==='needs-work'?'#f8717130':B}`,borderRadius:8,padding:'16px 18px',
              borderTop:`3px solid ${p.lh>=85?'#34d399':p.lh>=70?GOLD:'#f87171'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <p style={{margin:0,fontSize:14,fontWeight:600,color:'#fff'}}>{p.page}</p>
                <span style={{fontSize:22,fontWeight:700,color:p.lh>=85?'#34d399':p.lh>=70?GOLD:'#f87171',fontFamily:SF}}>{p.lh}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[{l:'FCP',v:p.fcp},{l:'LCP',v:p.lcp},{l:'CLS',v:p.cls},{l:'TBT',v:p.tbt}].map(m=>(
                  <div key={m.l} style={{background:'#0d0d12',borderRadius:4,padding:'6px 10px'}}>
                    <p style={{margin:'0 0 2px',fontSize:8,color:MUT,letterSpacing:'0.15em',textTransform:'uppercase'}}>{m.l}</p>
                    <p style={{margin:0,fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.8)',fontFamily:'monospace'}}>{m.v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
