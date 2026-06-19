/**
 * CustomModelUpload — drag-and-drop GLB/GLTF/OBJ file upload.
 * Creates a blob URL and adds the model to the studio catalog as a custom item.
 */
import { useState, useRef } from 'react'

const T = {
  bg:'#08070a', panel:'#0f0e14', panel2:'#16141d', border:'rgba(255,255,255,0.07)',
  gold:'#c9a227', goldL:'#e8c84e', text:'#ede9e3', muted:'#6b6580',
  red:'#ef4444', green:'#22c55e',
  F:"'DM Sans',system-ui,sans-serif", S:"'Cormorant Garamond',serif",
}

const ACCEPTED = ['.glb','.gltf','.obj']
const MAX_MB   = 50

export default function CustomModelUpload({ onUpload, onClose }) {
  const [dragging, setDragging]   = useState(false)
  const [file,     setFile]       = useState(null)
  const [name,     setName]       = useState('')
  const [dims,     setDims]       = useState({ w:'1.0', h:'1.0', d:'1.0' })
  const [error,    setError]      = useState('')
  const [preview,  setPreview]    = useState(null)
  const inputRef = useRef(null)

  function validateFile(f) {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ACCEPTED.includes(ext)) { setError(`Unsupported format. Use: ${ACCEPTED.join(', ')}`); return false }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File too large. Max ${MAX_MB} MB.`); return false }
    return true
  }

  function handleFile(f) {
    setError('')
    if (!validateFile(f)) return
    setFile(f)
    setName(f.name.replace(/\.[^.]+$/, ''))
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function onDimChange(key, val) {
    if (!/^\d*\.?\d*$/.test(val)) return
    setDims(d => ({ ...d, [key]: val }))
  }

  function handleAdd() {
    if (!file || !name.trim()) { setError('Please provide a name for the model.'); return }
    const w = parseFloat(dims.w) || 1
    const h = parseFloat(dims.h) || 1
    const d = parseFloat(dims.d) || 1
    onUpload({
      id:       `custom_${Date.now()}`,
      name:     name.trim(),
      sku:      'CUSTOM',
      cat:      'custom',
      subcat:   'uploaded',
      price:    0,
      brand:    'Custom Upload',
      material: file.name.split('.').pop().toUpperCase(),
      color:    '#c9a227',
      dims:     { w, h, d },
      glb:      preview,
      img:      null,
      tags:     ['custom','upload'],
      isCustom: true,
    })
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, fontFamily:T.F }}>
      <div style={{ background:T.panel2, border:`1px solid rgba(201,162,39,0.3)`, width:480, maxWidth:'94vw', maxHeight:'90vh', overflowY:'auto' }}>
        {/* Header */}
        <div style={{ padding:'18px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontFamily:T.S, fontSize:18, color:T.text, margin:0 }}>Upload 3D Model</p>
            <p style={{ fontFamily:T.F, fontSize:9, color:T.muted, margin:'3px 0 0', letterSpacing:'0.16em', textTransform:'uppercase' }}>GLB · GLTF · OBJ · Max {MAX_MB}MB</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
          {/* Drop zone */}
          <div
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={onDrop}
            onClick={()=>inputRef.current?.click()}
            style={{
              border:`2px dashed ${dragging?T.gold:'rgba(201,162,39,0.25)'}`,
              padding:'36px 20px', textAlign:'center', cursor:'pointer',
              background: dragging ? 'rgba(201,162,39,0.06)' : 'rgba(255,255,255,0.02)',
              transition:'all 0.2s',
            }}>
            <input ref={inputRef} type="file" accept=".glb,.gltf,.obj" style={{ display:'none' }}
              onChange={e=>e.target.files[0] && handleFile(e.target.files[0])} />
            {file ? (
              <div>
                <div style={{ fontSize:32, marginBottom:8 }}>✓</div>
                <p style={{ color:T.gold, fontWeight:700, margin:'0 0 4px', fontSize:13 }}>{file.name}</p>
                <p style={{ color:T.muted, fontSize:10, margin:0 }}>{(file.size/1024/1024).toFixed(2)} MB · Click to replace</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:40, marginBottom:12, opacity:0.5 }}>⬆</div>
                <p style={{ color:T.text, fontWeight:600, margin:'0 0 6px', fontSize:13 }}>Drop your 3D file here</p>
                <p style={{ color:T.muted, fontSize:10, margin:0 }}>or click to browse · GLB, GLTF, OBJ</p>
              </div>
            )}
          </div>

          {/* Model-viewer preview */}
          {preview && (
            <div style={{ height:200, background:T.panel, border:`1px solid ${T.border}`, overflow:'hidden' }}>
              <model-viewer
                src={preview} alt={name} camera-controls auto-rotate shadow-intensity="1"
                environment-image="neutral" exposure="1.1"
                style={{ width:'100%', height:'100%' }}
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label style={{ fontSize:9, color:T.muted, letterSpacing:'0.18em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Model Name *</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Custom Wardrobe"
              style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`, color:T.text, padding:'9px 12px', fontFamily:T.F, fontSize:12, outline:'none', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border} />
          </div>

          {/* Dimensions */}
          <div>
            <label style={{ fontSize:9, color:T.muted, letterSpacing:'0.18em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Real-World Dimensions (metres)</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {[['w','Width'],['h','Height'],['d','Depth']].map(([k,l])=>(
                <div key={k}>
                  <label style={{ fontSize:8, color:T.muted, display:'block', marginBottom:4 }}>{l}</label>
                  <input value={dims[k]} onChange={e=>onDimChange(k,e.target.value)} placeholder="1.0"
                    style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`, color:T.text, padding:'7px 10px', fontFamily:T.F, fontSize:12, outline:'none', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border} />
                </div>
              ))}
            </div>
            <p style={{ fontSize:9, color:T.muted, margin:'6px 0 0' }}>These control the model's scale in the 3D view. Measure your furniture in real life.</p>
          </div>

          {/* Error */}
          {error && <p style={{ color:T.red, fontSize:11, margin:0 }}>⚠ {error}</p>}

          {/* Actions */}
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button onClick={onClose}
              style={{ flex:1, padding:'11px', background:'transparent', border:`1px solid ${T.border}`, color:T.muted, fontFamily:T.F, fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer' }}>
              Cancel
            </button>
            <button onClick={handleAdd} disabled={!file}
              style={{ flex:2, padding:'11px', background:file?`linear-gradient(135deg,${T.gold},${T.goldL})`:'rgba(255,255,255,0.05)',
                color:file?T.bg:T.muted, border:'none', fontFamily:T.F, fontSize:10, fontWeight:800,
                letterSpacing:'0.16em', textTransform:'uppercase', cursor:file?'pointer':'not-allowed',
                boxShadow:file?`0 4px 20px rgba(201,162,39,0.4)`:'none' }}>
              + Add to Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
