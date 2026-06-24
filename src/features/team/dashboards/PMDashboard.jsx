import { useState } from 'react'
const D='#0d0d12',D2='#12121a',CARD='#1a1a26',B='#252535',GOLD='#c9a227',MUT='rgba(255,255,255,0.38)',SS="'DM Sans',system-ui,sans-serif",SF="'Cormorant Garamond',Georgia,serif"

const ROADMAP=[
  {phase:'Phase 0',label:'Scene Foundation',status:'done',items:['Locked scene data model','glTF export spec','Coordinate system (XZ/meters)']},
  {phase:'Phase 1',label:'Editor MVP',status:'active',items:['2D floor plan canvas ✓','Wall snap + dimension labels ✓','Door/window placement ✓','Real-time 3D sync ◐','Project save/load ✓']},
  {phase:'Phase 2',label:'Render Pipeline',status:'next',items:['Blender Cycles worker','Render queue + credits','Panorama 360° output','Batch rendering']},
  {phase:'Phase 3',label:'Collaboration',status:'planned',items:['WebSocket co-editing','Version history','Share links + embed','Client approval flow']},
  {phase:'Phase 4',label:'Mobile & AI',status:'planned',items:['React Native app','AI auto-furnishing','Voice room commands','Style transfer']},
]
const STORIES=[
  {id:'US-041',role:'Designer',story:'draw walls freely and see them snap to a 10cm grid so my floor plan is accurate',pts:8,status:'done'},
  {id:'US-042',role:'Designer',story:'place doors and windows on walls so I can plan openings correctly',pts:5,status:'review'},
  {id:'US-043',role:'Designer',story:'see my 2D floor plan update the 3D view in real time so I can visualise instantly',pts:13,status:'progress'},
  {id:'US-044',role:'Client',story:'receive a photorealistic render link without needing to install anything',pts:8,status:'backlog'},
  {id:'US-045',role:'Designer',story:'drag furniture from a catalog onto my floor plan so I can decorate quickly',pts:8,status:'progress'},
  {id:'US-046',role:'Admin',story:'see render credit balance and top up without leaving the studio',pts:3,status:'backlog'},
]
const SC={done:'#34d399',review:'#38bdf8',progress:GOLD,backlog:MUT,active:'#a78bfa',next:'#38bdf8',planned:'#4b5563'}

export default function PMDashboard({user}){
  const [tab,setTab]=useState('roadmap')
  return(
    <div style={{fontFamily:SS,color:'#fff',padding:'28px 32px',maxWidth:1400}}>
      {/* Header */}
      <div style={{marginBottom:28}}>
        <p style={{margin:'0 0 4px',fontSize:10,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#a78bfa'}}>Product Manager / UX Designer</p>
        <h1 style={{margin:'0 0 4px',fontSize:30,fontFamily:SF,fontWeight:400}}>Good morning, <span style={{color:GOLD}}>{user?.name?.split(' ')[0]||'PM'}</span></h1>
        <p style={{margin:0,fontSize:13,color:MUT}}>Sprint 4 of Phase 1 — 3 items in review, 2 blockers to clear</p>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
        {[
          {l:'Sprint Velocity',v:'34 pts',c:'#34d399',s:'↑ +8 vs Sprint 3'},
          {l:'Stories Done',v:'18 / 28',c:'#a78bfa',s:'Phase 1'},
          {l:'Blockers',v:'2',c:'#f87171',s:'Needs PM action'},
          {l:'Designs Approved',v:'12',c:GOLD,s:'This sprint'},
          {l:'Phase 1 Complete',v:'64%',c:'#38bdf8',s:'On track → Aug 2026'},
        ].map(k=>(
          <div key={k.l} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 18px'}}>
            <p style={{margin:'0 0 8px',fontSize:9,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:MUT}}>{k.l}</p>
            <p style={{margin:'0 0 4px',fontSize:24,fontWeight:700,color:k.c,fontFamily:SF}}>{k.v}</p>
            <p style={{margin:0,fontSize:10,color:MUT}}>{k.s}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:`1px solid ${B}`,paddingBottom:0}}>
        {['roadmap','stories','wireframes'].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
              background:'transparent',border:'none',cursor:'pointer',padding:'10px 18px',
              color:tab===t?GOLD:MUT,borderBottom:tab===t?`2px solid ${GOLD}`:'2px solid transparent',
              transition:'all 0.2s',fontFamily:SS}}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab==='roadmap'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
          {ROADMAP.map(p=>(
            <div key={p.phase} style={{background:CARD,border:`1px solid ${p.status==='active'?'#a78bfa50':B}`,
              borderRadius:8,padding:'16px',borderTop:`3px solid ${SC[p.status]}`}}>
              <p style={{margin:'0 0 2px',fontSize:9,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:SC[p.status]}}>{p.phase}</p>
              <p style={{margin:'0 0 14px',fontSize:14,fontWeight:600,color:'#fff'}}>{p.label}</p>
              {p.items.map(it=>(
                <div key={it} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8}}>
                  <span style={{color:SC[p.status],marginTop:2,fontSize:10,flexShrink:0}}>
                    {it.includes('✓')?'✓':it.includes('◐')?'◐':'○'}
                  </span>
                  <span style={{fontSize:11,color:it.includes('✓')?'rgba(255,255,255,0.6)':it.includes('◐')?'rgba(255,255,255,0.88)':'rgba(255,255,255,0.4)',lineHeight:1.4}}>
                    {it.replace('✓','').replace('◐','')}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab==='stories'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {STORIES.map(s=>(
            <div key={s.id} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 20px',
              display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
              <span style={{fontSize:10,fontWeight:700,color:GOLD,flexShrink:0,fontFamily:'monospace'}}>{s.id}</span>
              <div style={{flex:1,minWidth:200}}>
                <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.5}}>
                  As a <strong style={{color:'#a78bfa'}}>{s.role}</strong>, I want to {s.story}
                </p>
              </div>
              <div style={{display:'flex',gap:12,alignItems:'center',flexShrink:0}}>
                <span style={{fontSize:10,color:MUT}}>{s.pts} pts</span>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                  color:SC[s.status]||MUT,border:`1px solid ${SC[s.status]||MUT}50`,padding:'3px 8px',borderRadius:3}}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='wireframes'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {[
            {screen:'Studio — Draw Mode',status:'Approved',notes:'Left panel matches Homestyler spec'},
            {screen:'Studio — 3D View',status:'In Review',notes:'Need feedback on right panel layout'},
            {screen:'Render Dialog',status:'Draft',notes:'Credits UX needs iteration'},
            {screen:'Catalog Browser',status:'Draft',notes:'Filter panel flow TBD'},
            {screen:'Client Share Link',status:'Planned',notes:'—'},
            {screen:'Mobile Studio',status:'Planned',notes:'Phase 3 scope'},
          ].map(w=>(
            <div key={w.screen} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'18px 20px'}}>
              <div style={{width:'100%',height:100,background:'#0d0d1a',borderRadius:4,marginBottom:12,
                display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${B}`}}>
                <span style={{fontSize:10,color:MUT}}>[ wireframe ]</span>
              </div>
              <p style={{margin:'0 0 4px',fontSize:13,fontWeight:600,color:'#fff'}}>{w.screen}</p>
              <p style={{margin:'0 0 8px',fontSize:11,color:MUT}}>{w.notes}</p>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
                color:w.status==='Approved'?'#34d399':w.status==='In Review'?'#38bdf8':w.status==='Draft'?GOLD:MUT,
                border:`1px solid currentColor`,padding:'3px 8px',borderRadius:3,opacity:0.9}}>
                {w.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
