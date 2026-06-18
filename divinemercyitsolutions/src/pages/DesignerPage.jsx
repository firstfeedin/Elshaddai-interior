import { Suspense, lazy, useState } from 'react'
import FloorPlanEditor from '../designer/FloorPlanEditor'

const BabylonDesigner = lazy(() => import('../designer/BabylonDesigner'))

export default function DesignerPage() {
  const [mode, setMode]             = useState('3d')
  const [floorPlanData, setFloorPlanData] = useState(null)

  const handleExportTo3D = (data) => {
    setFloorPlanData(data)
    setMode('3d')
  }

  const handleSave = (scene) => {
    console.log('Scene saved:', scene)
  }

  if (mode === '2d') {
    return (
      <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', background:'#f5f6f8' }}>
        {/* Minimal top bar matching BabylonDesigner header style */}
        <div style={{ height:48, background:'#1a1f2e', borderBottom:'1px solid #2e3650', display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginRight:12 }}>
            <div style={{ width:28, height:28, background:'#c9a227', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/></svg>
            </div>
            <span style={{ color:'#fff', fontWeight:600, fontSize:13 }}>El Shaddai</span>
            <span style={{ color:'#4a5568', fontSize:11 }}>Floor Plan Editor</span>
          </div>

          {/* Mode toggle */}
          <div style={{ display:'flex', background:'#252c3f', borderRadius:6, padding:2, gap:2 }}>
            {[['2D','Floor Plan'],['3D','Room Designer']].map(([id,lb]) => (
              <button key={id} onClick={()=>setMode(id.toLowerCase())} style={{
                display:'flex', alignItems:'center', gap:5, padding:'3px 12px',
                background: mode===id.toLowerCase() ? '#c9a227' : 'transparent',
                color: mode===id.toLowerCase() ? '#000' : '#8899aa',
                border:'none', cursor:'pointer', borderRadius:4, fontSize:11, fontWeight:700,
              }}>{id} {lb}</button>
            ))}
          </div>

          <div style={{ flex:1 }} />
          <button onClick={()=>window.location.href='/'} style={{ padding:'4px 12px', background:'#252c3f', color:'#8899aa', border:'1px solid #2e3650', borderRadius:6, cursor:'pointer', fontSize:11 }}>
            ← Home
          </button>
        </div>
        <div style={{ flex:1, overflow:'hidden' }}>
          <FloorPlanEditor onExportTo3D={handleExportTo3D} />
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div style={{ height:'100vh', background:'#1a1f2e', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
        <div style={{ width:44, height:44, border:'3px solid rgba(201,162,39,0.3)', borderTopColor:'#c9a227', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <p style={{ color:'#fff', fontSize:14, fontWeight:600, margin:0 }}>Loading 3D Engine...</p>
        <p style={{ color:'#4a5568', fontSize:12, margin:0 }}>Babylon.js · PBR · WebGL 2</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <BabylonDesigner
        floorPlanData={floorPlanData}
        onSave={handleSave}
        onSwitch2D={() => setMode('2d')}
      />
    </Suspense>
  )
}
