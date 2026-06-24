import { useState } from 'react'
const CARD='#1a1a26',B='#252535',GOLD='#c9a227',MUT='rgba(255,255,255,0.38)',SS="'DM Sans',system-ui,sans-serif",SF="'Cormorant Garamond',Georgia,serif"
const C='#34d399'

const PAGES=[
  {page:'Homepage (Homestyler)',status:'done',mobile:92,desktop:98,a11y:88,notes:'Cinematic hero, scan-line, letterbox added'},
  {page:'Studio Page',status:'active',mobile:60,desktop:82,a11y:72,notes:'Mobile layout needs work — panels stack awkwardly'},
  {page:'Dashboard Shell',status:'done',mobile:88,desktop:95,a11y:84,notes:'Sidebar collapses correctly on mobile'},
  {page:'Catalog Page',status:'active',mobile:70,desktop:78,a11y:76,notes:'Filter sidebar needs mobile drawer'},
  {page:'Render Page',status:'active',mobile:65,desktop:80,a11y:70,notes:'Progress modal not accessible'},
  {page:'Auth Page',status:'done',mobile:94,desktop:96,a11y:90,notes:'All inputs labelled, focus visible'},
  {page:'Project List',status:'done',mobile:86,desktop:92,a11y:85,notes:'Table scrolls horizontally on mobile'},
  {page:'Gallery',status:'done',mobile:90,desktop:95,a11y:82,notes:'Lazy loading images in place'},
]

export default function FrontendUIDashboard({user}){
  const [tab,setTab]=useState('pages')
  return(
    <div style={{fontFamily:SS,color:'#fff',padding:'28px 32px',maxWidth:1400}}>
      <div style={{marginBottom:28}}>
        <p style={{margin:'0 0 4px',fontSize:10,fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:C}}>Frontend Engineer — UI/UX</p>
        <h1 style={{margin:'0 0 4px',fontSize:30,fontFamily:SF,fontWeight:400}}>Dashboards · Catalog · <span style={{color:GOLD}}>Responsiveness</span></h1>
        <p style={{margin:0,fontSize:13,color:MUT}}>Design system, accessibility, mobile parity across 25+ pages</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
        {[
          {l:'Pages Tracked',v:'25',c:C,s:'8 fully responsive'},
          {l:'Avg Mobile Score',v:'81%',c:GOLD,s:'Target: 90%+'},
          {l:'A11y Compliance',v:'79%',c:'#f59e0b',s:'WCAG 2.1 AA target'},
          {l:'Design Tokens',v:'48',c:'#a78bfa',s:'Colors, type, spacing'},
          {l:'Components Built',v:'62',c:'#38bdf8',s:'Cross-page reusable'},
        ].map(k=>(
          <div key={k.l} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 18px'}}>
            <p style={{margin:'0 0 8px',fontSize:9,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:MUT}}>{k.l}</p>
            <p style={{margin:'0 0 4px',fontSize:24,fontWeight:700,color:k.c,fontFamily:SF}}>{k.v}</p>
            <p style={{margin:0,fontSize:10,color:MUT}}>{k.s}</p>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:`1px solid ${B}`}}>
        {['pages','design-system','catalog-ui','tasks'].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
              background:'transparent',border:'none',cursor:'pointer',padding:'10px 18px',
              color:tab===t?GOLD:MUT,borderBottom:tab===t?`2px solid ${GOLD}`:'2px solid transparent',fontFamily:SS}}>
            {t.replace('-',' ')}
          </button>
        ))}
      </div>

      {tab==='pages'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {PAGES.map(p=>(
            <div key={p.page} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'16px 20px',
              display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
              <div style={{minWidth:200}}>
                <p style={{margin:'0 0 2px',fontSize:13,fontWeight:600,color:'#fff'}}>{p.page}</p>
                <p style={{margin:0,fontSize:10,color:MUT}}>{p.notes}</p>
              </div>
              <div style={{display:'flex',gap:24,flex:1,flexWrap:'wrap'}}>
                {[{l:'Mobile',v:p.mobile},{l:'Desktop',v:p.desktop},{l:'A11y',v:p.a11y}].map(s=>(
                  <div key={s.l}>
                    <p style={{margin:'0 0 4px',fontSize:9,color:MUT,letterSpacing:'0.15em',textTransform:'uppercase'}}>{s.l}</p>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:60,height:4,background:'#1a1a2e',borderRadius:2}}>
                        <div style={{height:'100%',width:`${s.v}%`,background:s.v>=90?'#34d399':s.v>=75?GOLD:'#f87171',borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:s.v>=90?'#34d399':s.v>=75?GOLD:'#f87171'}}>{s.v}</span>
                    </div>
                  </div>
                ))}
              </div>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                color:p.status==='done'?'#34d399':GOLD,border:`1px solid currentColor`,padding:'3px 8px',borderRadius:3,flexShrink:0}}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab==='design-system'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {/* Color Palette */}
          <div style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'18px 20px',gridColumn:'span 3'}}>
            <p style={{margin:'0 0 14px',fontSize:10,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:MUT}}>Color Tokens</p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {[
                {name:'Gold Accent',hex:'#c9a227'},{name:'Terracotta',hex:'#c4956a'},{name:'Cream',hex:'#f8f6f3'},
                {name:'Dark Base',hex:'#0d0d12'},{name:'Dark 2',hex:'#12121a'},{name:'Card',hex:'#1a1a26'},
                {name:'Muted Text',hex:'rgba(255,255,255,0.38)'},{name:'Success',hex:'#34d399'},{name:'Danger',hex:'#f87171'},
                {name:'Info',hex:'#38bdf8'},{name:'Warning',hex:'#f59e0b'},{name:'PM Violet',hex:'#a78bfa'},
              ].map(c=>(
                <div key={c.name} style={{textAlign:'center'}}>
                  <div style={{width:52,height:52,borderRadius:6,background:c.hex,border:`1px solid ${B}`,marginBottom:6}}/>
                  <p style={{margin:0,fontSize:9,color:MUT,maxWidth:60}}>{c.name}</p>
                  <p style={{margin:0,fontSize:8,color:'rgba(255,255,255,0.25)',fontFamily:'monospace'}}>{c.hex}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Typography */}
          <div style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'18px 20px',gridColumn:'span 2'}}>
            <p style={{margin:'0 0 14px',fontSize:10,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:MUT}}>Typography</p>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {[
                {label:'Display / Hero',font:'Cormorant Garamond',weight:'300/400',size:'60–100px'},
                {label:'Section Titles',font:'Cormorant Garamond',weight:'400',size:'28–40px'},
                {label:'Body / UI',font:'DM Sans',weight:'300–500',size:'12–16px'},
                {label:'Labels / Caps',font:'DM Sans',weight:'700',size:'9–11px · 0.2em LS'},
              ].map(t=>(
                <div key={t.label} style={{display:'flex',alignItems:'baseline',gap:16,padding:'8px 0',borderBottom:`1px solid ${B}`}}>
                  <span style={{fontSize:10,color:MUT,minWidth:130}}>{t.label}</span>
                  <span style={{fontSize:13,color:'#fff',fontFamily:t.font==='Cormorant Garamond'?SF:SS}}>{t.font}</span>
                  <span style={{fontSize:10,color:MUT}}>{t.weight} · {t.size}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Spacing */}
          <div style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'18px 20px'}}>
            <p style={{margin:'0 0 14px',fontSize:10,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:MUT}}>Spacing Scale</p>
            {[4,8,12,16,20,24,32,48].map(s=>(
              <div key={s} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                <span style={{fontSize:10,color:MUT,minWidth:30,fontFamily:'monospace'}}>{s}px</span>
                <div style={{height:4,background:GOLD,opacity:0.6,width:s*1.5,borderRadius:2}}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='catalog-ui'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {[
            {task:'Mobile filter drawer',status:'In Progress',desc:'Slide-in filter panel for catalog on mobile. Uses React portal.', priority:'HIGH'},
            {task:'Infinite scroll catalog grid',status:'In Progress',desc:'Replace pagination with IntersectionObserver infinite load. 20 items/page.', priority:'MED'},
            {task:'3D model preview on hover',status:'Next',desc:'Thumbnail → mini Three.js preview on card hover (lazy init).', priority:'HIGH'},
            {task:'Wishlist / favorites UX',status:'Planned',desc:'Heart icon + local storage + sync to account.', priority:'LOW'},
            {task:'Category mega-menu',status:'Next',desc:'Nested category navigation with icons. Furniture → Sofa → L-Shape etc.', priority:'MED'},
            {task:'Price range slider',status:'Planned',desc:'Dual-handle range slider component for price filter.', priority:'LOW'},
          ].map(t=>(
            <div key={t.task} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'18px 20px',
              borderLeft:`3px solid ${t.status==='In Progress'?GOLD:t.status==='Next'?C:'#4b5563'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <p style={{margin:0,fontSize:14,fontWeight:600,color:'#fff'}}>{t.task}</p>
                <span style={{fontSize:8,fontWeight:700,color:t.priority==='HIGH'?'#f87171':t.priority==='MED'?GOLD:'#34d399'}}>{t.priority}</span>
              </div>
              <p style={{margin:'0 0 10px',fontSize:11,color:MUT,lineHeight:1.6}}>{t.desc}</p>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',
                color:t.status==='In Progress'?GOLD:t.status==='Next'?C:MUT,
                border:`1px solid currentColor`,padding:'3px 8px',borderRadius:3,opacity:0.8}}>{t.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab==='tasks'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[
            {task:'Fix studio mobile layout — panels stack awkwardly',priority:'HIGH',due:'Jun 28'},
            {task:'Add focus-visible styles to all interactive elements',priority:'HIGH',due:'Jun 30'},
            {task:'Catalog filter drawer — mobile slide-in',priority:'HIGH',due:'Jul 2'},
            {task:'Add loading skeletons to dashboard cards',priority:'MED',due:'Jul 5'},
            {task:'Dark mode toggle persistence across sessions',priority:'MED',due:'Jul 8'},
            {task:'Render page progress modal — ARIA roles',priority:'MED',due:'Jul 10'},
            {task:'Homepage — add video background option to hero',priority:'LOW',due:'Jul 15'},
          ].map(t=>(
            <div key={t.task} style={{background:CARD,border:`1px solid ${B}`,borderRadius:8,padding:'14px 20px',
              display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
              <p style={{flex:1,margin:0,fontSize:13,color:'rgba(255,255,255,0.88)',minWidth:200}}>{t.task}</p>
              <span style={{fontSize:10,color:MUT,flexShrink:0}}>Due {t.due}</span>
              <span style={{fontSize:9,fontWeight:700,color:t.priority==='HIGH'?'#f87171':t.priority==='MED'?GOLD:'#34d399',
                flexShrink:0,letterSpacing:'0.15em'}}>{t.priority}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
