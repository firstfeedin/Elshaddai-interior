/**
 * ARViewer — WebXR AR preview using Google's <model-viewer> web component.
 * Loads a GLB model (or fallback procedural box) in AR via the camera.
 * Works on Android Chrome (WebXR) and iOS Safari (AR Quick Look via USDZ).
 */
import { useEffect, useRef, useState } from 'react'

const T = {
  bg:'#08070a', panel:'#0f0e14', panel2:'#16141d', border:'rgba(255,255,255,0.07)',
  gold:'#c9a227', goldL:'#e8c84e', text:'#ede9e3', muted:'#6b6580',
  F:"'DM Sans',system-ui,sans-serif", S:"'Cormorant Garamond',serif",
}

/* Inject model-viewer script once */
function useModelViewer() {
  useEffect(() => {
    if (document.querySelector('script[data-mv]')) return
    const s = document.createElement('script')
    s.type = 'module'
    s.setAttribute('data-mv', '1')
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
    document.head.appendChild(s)
  }, [])
}

/* Fallback cube GLB (publicly hosted) — used when no GLB url available */
const CUBE_GLB = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Box/glTF-Binary/Box.glb'

export default function ARViewer({ item, onClose }) {
  useModelViewer()
  const [arSupported, setArSupported] = useState(null)
  const mvRef = useRef(null)

  const glbUrl  = item?.catalogItem?.glb || item?.glb || CUBE_GLB
  const name    = item?.catalogItem?.name || item?.name || 'Furniture'
  const dims    = item?.catalogItem?.dims || item?.dims || { w:1, h:1, d:1 }

  useEffect(() => {
    if (typeof navigator.xr === 'undefined') { setArSupported(false); return }
    navigator.xr.isSessionSupported('immersive-ar')
      .then(ok => setArSupported(ok))
      .catch(() => setArSupported(false))
  }, [])

  if (!item) return null

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:T.F }}>
      {/* Header */}
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:T.panel, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:28, height:28, background:T.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>◈</div>
          <div>
            <p style={{ margin:0, fontFamily:T.S, fontSize:16, color:T.text }}>{name}</p>
            <p style={{ margin:0, fontSize:9, color:T.muted, letterSpacing:'0.16em', textTransform:'uppercase' }}>AR Preview</p>
          </div>
        </div>
        <button onClick={onClose}
          style={{ background:'transparent', border:`1px solid ${T.border}`, color:T.muted, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:18 }}>
          ✕
        </button>
      </div>

      {/* Main 3D / AR viewer */}
      <div style={{ width:'100%', maxWidth:640, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px 120px', gap:24 }}>

        {/* model-viewer web component */}
        <div style={{ width:'100%', maxWidth:560, height:360, background:T.panel2, border:`1px solid ${T.border}`, position:'relative', overflow:'hidden' }}>
          <model-viewer
            ref={mvRef}
            src={glbUrl}
            alt={name}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1.1"
            style={{ width:'100%', height:'100%', background:'transparent' }}
          >
            {/* AR button slot */}
            <button slot="ar-button"
              style={{
                position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)',
                background:`linear-gradient(135deg,${T.gold},${T.goldL})`, color:T.bg, border:'none',
                padding:'10px 28px', fontFamily:T.F, fontSize:11, fontWeight:800, letterSpacing:'0.18em',
                textTransform:'uppercase', cursor:'pointer', boxShadow:`0 6px 24px rgba(201,162,39,0.4)`,
              }}>
              📱 View in Your Room
            </button>
          </model-viewer>

          {/* Loading overlay */}
          <div id="mv-loader" style={{ position:'absolute', inset:0, background:T.panel2, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, pointerEvents:'none', transition:'opacity 0.3s' }}>
            <div style={{ width:32, height:32, border:`3px solid rgba(201,162,39,0.2)`, borderTopColor:T.gold, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <span style={{ fontSize:10, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>Loading 3D Model…</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} model-viewer{--poster-color:transparent}`}</style>
          </div>
        </div>

        {/* Item info */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, width:'100%', maxWidth:560 }}>
          {[['Width', `${dims.w}m`],['Height', `${dims.h}m`],['Depth', `${dims.d}m`]].map(([l,v])=>(
            <div key={l} style={{ background:T.panel2, border:`1px solid ${T.border}`, padding:'10px 14px', textAlign:'center' }}>
              <p style={{ fontFamily:T.F, fontSize:8, color:T.muted, margin:'0 0 4px', letterSpacing:'0.18em', textTransform:'uppercase' }}>{l}</p>
              <p style={{ fontFamily:T.S, fontSize:20, color:T.gold, margin:0 }}>{v}</p>
            </div>
          ))}
        </div>

        {/* AR support status */}
        {arSupported === false && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', padding:'12px 20px', textAlign:'center', maxWidth:480 }}>
            <p style={{ fontFamily:T.F, fontSize:11, color:'#ef4444', margin:0 }}>
              ⚠ WebXR AR is not supported in this browser. For AR, open on <strong>Android Chrome</strong> or <strong>iOS Safari</strong>.
            </p>
          </div>
        )}

        {arSupported === true && (
          <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.3)', padding:'12px 20px', textAlign:'center', maxWidth:480 }}>
            <p style={{ fontFamily:T.F, fontSize:11, color:'#22c55e', margin:0 }}>
              ✓ AR ready — tap <strong>"View in Your Room"</strong> to place this furniture in your space.
            </p>
          </div>
        )}

        <p style={{ fontFamily:T.F, fontSize:10, color:T.muted, textAlign:'center', margin:0, lineHeight:1.7 }}>
          Drag to rotate · Pinch to zoom · Use the AR button to place in your real room via camera
        </p>
      </div>

      {/* Bottom actions */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px 24px', background:T.panel, borderTop:`1px solid ${T.border}`, display:'flex', gap:10 }}>
        <a href={`https://www.amazon.in/s?k=${encodeURIComponent(name)}`} target="_blank" rel="noreferrer"
          style={{ flex:1, textAlign:'center', padding:'10px', background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`,
            color:T.text, fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none' }}>
          🛒 Shop This Item
        </a>
        <button onClick={onClose}
          style={{ flex:1, padding:'10px', background:`linear-gradient(135deg,${T.gold},${T.goldL})`, color:T.bg,
            border:'none', fontFamily:T.F, fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer' }}>
          Back to Studio
        </button>
      </div>
    </div>
  )
}
