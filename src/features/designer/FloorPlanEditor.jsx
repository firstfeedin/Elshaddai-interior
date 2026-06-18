import { useEffect, useRef, useState, useCallback } from 'react'

// Pure Canvas 2D floor plan editor — draw walls, add rooms, export to 3D
const GRID = 20        // px per grid cell
const CELL_M = 0.5     // each cell = 0.5 metres

const TOOL_TYPES = ['select', 'wall', 'door', 'window', 'room-label', 'eraser']

const ROOM_COLORS = {
  'Living Room':  'rgba(99,102,241,0.15)',
  'Bedroom':      'rgba(16,185,129,0.15)',
  'Kitchen':      'rgba(245,158,11,0.15)',
  'Bathroom':     'rgba(59,130,246,0.15)',
  'Dining':       'rgba(239,68,68,0.15)',
  'Study':        'rgba(168,85,247,0.15)',
}

export default function FloorPlanEditor({ onExportTo3D }) {
  const canvasRef   = useRef(null)
  const overlayRef  = useRef(null)
  const stateRef    = useRef({
    walls: [],
    doors: [],
    windows: [],
    labels: [],
    drawing: false,
    startPt: null,
    mousePos: null,
    selected: null,
    pan: { x: 0, y: 0 },
    panning: false,
    panStart: null,
  })

  const [tool, setTool]       = useState('wall')
  const [zoom, setZoom]       = useState(1)
  const [wallCount, setWallCount]  = useState(0)
  const [showRoomMenu, setShowRoomMenu] = useState(null)
  const [totalArea, setTotalArea]   = useState(0)
  const [undoStack, setUndoStack]   = useState([])

  const snap = (v) => Math.round(v / GRID) * GRID

  const getCtx = () => canvasRef.current?.getContext('2d')

  const worldToCanvas = (x, y) => {
    const s = stateRef.current
    return { x: x * zoom + s.pan.x, y: y * zoom + s.pan.y }
  }
  const canvasToWorld = (x, y) => {
    const s = stateRef.current
    return { x: (x - s.pan.x) / zoom, y: (y - s.pan.y) / zoom }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = getCtx()
    const { walls, doors, windows, labels, drawing, startPt, mousePos, selected } = stateRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background — light like Homestyler 2D view
    ctx.fillStyle = '#f5f6f8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(stateRef.current.pan.x, stateRef.current.pan.y)
    ctx.scale(zoom, zoom)

    // Grid (light, subtle)
    const gridColor = '#e4e6ea'
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5
    const startX = -stateRef.current.pan.x / zoom
    const startY = -stateRef.current.pan.y / zoom
    const endX   = (canvas.width  - stateRef.current.pan.x) / zoom
    const endY   = (canvas.height - stateRef.current.pan.y) / zoom

    for (let x = Math.floor(startX / GRID) * GRID; x < endX; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke()
    }
    for (let y = Math.floor(startY / GRID) * GRID; y < endY; y += GRID) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke()
    }

    // Major grid (every 4 cells = 2m)
    ctx.strokeStyle = '#d0d3d8'
    ctx.lineWidth = 1
    for (let x = Math.floor(startX / (GRID*4)) * (GRID*4); x < endX; x += GRID*4) {
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke()
    }
    for (let y = Math.floor(startY / (GRID*4)) * (GRID*4); y < endY; y += GRID*4) {
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke()
    }

    // Walls — dark on light bg, architectural style
    walls.forEach((w, i) => {
      const isSelected = selected === `wall-${i}`
      // Wall fill (thick, architectural)
      ctx.strokeStyle = isSelected ? '#c9a227' : '#2d3748'
      ctx.lineWidth   = isSelected ? 8 : 7
      ctx.lineCap     = 'square'
      ctx.shadowColor = isSelected ? '#c9a227' : 'transparent'
      ctx.shadowBlur  = isSelected ? 8 : 0
      ctx.beginPath()
      ctx.moveTo(w.x1, w.y1)
      ctx.lineTo(w.x2, w.y2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Dimension label
      const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1)
      const metres = (len * CELL_M / GRID).toFixed(1)
      const mx = (w.x1 + w.x2) / 2
      const my = (w.y1 + w.y2) / 2
      ctx.fillStyle = '#6b7280'
      ctx.font = `${9 / zoom}px 'Segoe UI', sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(`${metres}m`, mx, my - 8 / zoom)
    })

    // Doors (arc)
    doors.forEach((d, i) => {
      const isSelected = selected === `door-${i}`
      ctx.strokeStyle = isSelected ? '#c9a227' : '#059669'
      ctx.lineWidth   = 1.5
      ctx.fillStyle   = 'rgba(5,150,105,0.08)'
      ctx.beginPath()
      ctx.arc(d.x, d.y, GRID * 1.5, d.angle, d.angle + Math.PI / 2)
      ctx.lineTo(d.x, d.y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    })

    // Windows (dashed line)
    windows.forEach((w) => {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth   = 4
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(w.x1, w.y1)
      ctx.lineTo(w.x2, w.y2)
      ctx.stroke()
      ctx.setLineDash([])
    })

    // Room labels
    labels.forEach((l) => {
      const bg = ROOM_COLORS[l.text] || 'rgba(99,102,241,0.1)'
      if (l.w && l.h) {
        ctx.fillStyle = bg
        ctx.fillRect(l.x - l.w / 2, l.y - l.h / 2, l.w, l.h)
      }
      ctx.fillStyle = '#374151'
      ctx.font      = `bold ${12 / zoom}px 'Segoe UI', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(l.text, l.x, l.y)
      if (l.area) {
        ctx.fillStyle = '#9ca3af'
        ctx.font      = `${9 / zoom}px 'Segoe UI', sans-serif`
        ctx.fillText(`${l.area} m²`, l.x, l.y + 14 / zoom)
      }
    })

    // Preview wall being drawn
    if (drawing && startPt && mousePos && tool === 'wall') {
      const ex = snap(mousePos.x), ey = snap(mousePos.y)
      // Orthogonal snap
      const dx = Math.abs(ex - startPt.x), dy = Math.abs(ey - startPt.y)
      const endX2 = dx > dy ? ex : startPt.x
      const endY2 = dx > dy ? startPt.y : ey
      ctx.strokeStyle = '#c9a227'
      ctx.lineWidth   = 4
      ctx.setLineDash([6, 4])
      ctx.lineCap     = 'round'
      ctx.beginPath()
      ctx.moveTo(startPt.x, startPt.y)
      ctx.lineTo(endX2, endY2)
      ctx.stroke()
      ctx.setLineDash([])
      // Snap dot
      ctx.fillStyle = '#c9a227'
      ctx.beginPath()
      ctx.arc(startPt.x, startPt.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }, [zoom, tool])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width  = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
      draw()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draw])

  useEffect(() => { draw() }, [draw])

  const getCanvasXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onMouseDown = (e) => {
    const s = stateRef.current
    const rawPt = getCanvasXY(e)
    const world  = canvasToWorld(rawPt.x, rawPt.y)
    const snapped = { x: snap(world.x), y: snap(world.y) }

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      s.panning   = true
      s.panStart  = { x: rawPt.x - s.pan.x, y: rawPt.y - s.pan.y }
      return
    }

    if (tool === 'wall') {
      s.drawing = true
      s.startPt = snapped
    } else if (tool === 'door') {
      pushUndo()
      s.doors.push({ x: snapped.x, y: snapped.y, angle: 0 })
      draw()
    } else if (tool === 'window') {
      if (!s.drawing) {
        s.drawing = true; s.startPt = snapped
      } else {
        pushUndo()
        const dx = Math.abs(snapped.x - s.startPt.x)
        const dy = Math.abs(snapped.y - s.startPt.y)
        const ex = dx > dy ? snapped.x : s.startPt.x
        const ey = dx > dy ? s.startPt.y : snapped.y
        s.windows.push({ x1: s.startPt.x, y1: s.startPt.y, x2: ex, y2: ey })
        s.drawing = false; s.startPt = null
        draw()
      }
    } else if (tool === 'room-label') {
      setShowRoomMenu({ x: rawPt.x, y: rawPt.y, wx: snapped.x, wy: snapped.y })
    } else if (tool === 'eraser') {
      // Find nearest wall and remove
      let nearest = -1, minDist = 20 / zoom
      s.walls.forEach((w, i) => {
        const d = ptToSegDist(world, w)
        if (d < minDist) { minDist = d; nearest = i }
      })
      if (nearest >= 0) {
        pushUndo()
        s.walls.splice(nearest, 1)
        setWallCount(s.walls.length)
        draw()
      }
    } else if (tool === 'select') {
      let found = null
      s.walls.forEach((w, i) => {
        if (ptToSegDist(world, w) < 15 / zoom) found = `wall-${i}`
      })
      s.selected = found
      draw()
    }
  }

  const onMouseMove = (e) => {
    const s = stateRef.current
    const rawPt = getCanvasXY(e)
    const world  = canvasToWorld(rawPt.x, rawPt.y)

    if (s.panning) {
      s.pan.x = rawPt.x - s.panStart.x
      s.pan.y = rawPt.y - s.panStart.y
      draw(); return
    }
    s.mousePos = { x: snap(world.x), y: snap(world.y) }
    if (s.drawing) draw()
  }

  const onMouseUp = (e) => {
    const s = stateRef.current
    if (s.panning) { s.panning = false; return }
    if (!s.drawing || !s.startPt) return

    const rawPt = getCanvasXY(e)
    const world  = canvasToWorld(rawPt.x, rawPt.y)
    const end    = { x: snap(world.x), y: snap(world.y) }

    if (tool === 'wall') {
      const dx = Math.abs(end.x - s.startPt.x)
      const dy = Math.abs(end.y - s.startPt.y)
      if (dx > 5 || dy > 5) {
        const ex = dx > dy ? end.x : s.startPt.x
        const ey = dx > dy ? s.startPt.y : end.y
        pushUndo()
        s.walls.push({ x1: s.startPt.x, y1: s.startPt.y, x2: ex, y2: ey })
        setWallCount(s.walls.length)
        calcArea()
      }
      s.drawing = false; s.startPt = null
      draw()
    }
  }

  const onWheel = (e) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setZoom(z => Math.min(3, Math.max(0.3, z * factor)))
  }

  const pushUndo = () => {
    const s = stateRef.current
    setUndoStack(prev => [...prev, {
      walls: [...s.walls], doors: [...s.doors],
      windows: [...s.windows], labels: [...s.labels],
    }])
  }

  const undo = () => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    const s = stateRef.current
    s.walls   = prev.walls
    s.doors   = prev.doors
    s.windows = prev.windows
    s.labels  = prev.labels
    setUndoStack(u => u.slice(0, -1))
    setWallCount(prev.walls.length)
    draw()
  }

  const addLabel = (text) => {
    if (!showRoomMenu) return
    const s = stateRef.current
    pushUndo()
    const area = (GRID * 6 * CELL_M / GRID * GRID * 5 * CELL_M / GRID).toFixed(0)
    s.labels.push({ text, x: showRoomMenu.wx, y: showRoomMenu.wy, area })
    setShowRoomMenu(null)
    draw()
  }

  const calcArea = () => {
    const walls = stateRef.current.walls
    if (walls.length < 3) return
    let area = 0
    const pts = walls.map(w => ({ x: w.x1, y: w.y1 }))
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length
      area += pts[i].x * pts[j].y - pts[j].x * pts[i].y
    }
    const sqPx   = Math.abs(area / 2)
    const sqMet  = sqPx * (CELL_M / GRID) ** 2
    setTotalArea(sqMet.toFixed(1))
  }

  const clearAll = () => {
    pushUndo()
    const s = stateRef.current
    s.walls = []; s.doors = []; s.windows = []; s.labels = []
    setWallCount(0); setTotalArea(0); draw()
  }

  const exportTo3D = () => {
    const s = stateRef.current
    const scale = CELL_M / GRID
    const exported = {
      walls: s.walls.map(w => ({
        x1: w.x1 * scale, y1: w.y1 * scale,
        x2: w.x2 * scale, y2: w.y2 * scale,
        thickness: 0.2, height: 2.8,
      })),
      doors: s.doors.map(d => ({ x: d.x * scale, y: d.y * scale })),
      windows: s.windows.map(w => ({
        x1: w.x1 * scale, y1: w.y1 * scale,
        x2: w.x2 * scale, y2: w.y2 * scale,
      })),
      labels: s.labels,
      totalArea,
    }
    if (onExportTo3D) onExportTo3D(exported)
  }

  // Preset rooms
  const loadPreset = (preset) => {
    pushUndo()
    const s = stateRef.current
    const cx = 200, cy = 200
    if (preset === '2bhk') {
      s.walls = [
        // Outer walls
        { x1: cx,       y1: cy,       x2: cx+280, y2: cy       },
        { x1: cx+280,   y1: cy,       x2: cx+280, y2: cy+200   },
        { x1: cx+280,   y1: cy+200,   x2: cx,     y2: cy+200   },
        { x1: cx,       y1: cy+200,   x2: cx,     y2: cy       },
        // Inner dividers
        { x1: cx+140,   y1: cy,       x2: cx+140, y2: cy+120   },
        { x1: cx,       y1: cy+120,   x2: cx+280, y2: cy+120   },
        { x1: cx+140,   y1: cy+120,   x2: cx+140, y2: cy+200   },
      ]
      s.labels = [
        { text: 'Living Room', x: cx+70,  y: cy+60,  area: '18' },
        { text: 'Bedroom',     x: cx+210, y: cy+60,  area: '14' },
        { text: 'Kitchen',     x: cx+70,  y: cy+160, area: '12' },
        { text: 'Bedroom',     x: cx+210, y: cy+160, area: '13' },
      ]
    } else if (preset === '3bhk') {
      s.walls = [
        { x1: cx,      y1: cy,      x2: cx+360, y2: cy       },
        { x1: cx+360,  y1: cy,      x2: cx+360, y2: cy+240   },
        { x1: cx+360,  y1: cy+240,  x2: cx,     y2: cy+240   },
        { x1: cx,      y1: cy+240,  x2: cx,     y2: cy       },
        { x1: cx+180,  y1: cy,      x2: cx+180, y2: cy+140   },
        { x1: cx,      y1: cy+140,  x2: cx+360, y2: cy+140   },
        { x1: cx+120,  y1: cy+140,  x2: cx+120, y2: cy+240   },
        { x1: cx+240,  y1: cy+140,  x2: cx+240, y2: cy+240   },
      ]
      s.labels = [
        { text: 'Living Room', x: cx+90,  y: cy+70,  area: '22' },
        { text: 'Bedroom',     x: cx+270, y: cy+70,  area: '16' },
        { text: 'Kitchen',     x: cx+60,  y: cy+190, area: '14' },
        { text: 'Bedroom',     x: cx+180, y: cy+190, area: '15' },
        { text: 'Bedroom',     x: cx+300, y: cy+190, area: '15' },
      ]
    }
    s.doors = []
    setWallCount(s.walls.length)
    draw()
  }

  const TOOLS = [
    { id: 'select',     icon: '↖',  label: 'Select'    },
    { id: 'wall',       icon: '▬',  label: 'Wall'      },
    { id: 'door',       icon: '🚪', label: 'Door'      },
    { id: 'window',     icon: '🪟', label: 'Window'    },
    { id: 'room-label', icon: '🏷',  label: 'Label'    },
    { id: 'eraser',     icon: '✕',  label: 'Erase'     },
  ]

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#f5f6f8', overflow:'hidden', userSelect:'none', fontFamily:"'Segoe UI',sans-serif" }}>

      {/* ── Toolbar (Homestyler-style light) ── */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:'#fff', borderBottom:'1px solid #e2e6ec', flexShrink:0, overflowX:'auto', overflowY:'hidden', whiteSpace:'nowrap', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>

        {/* Drawing Tools */}
        <div style={{ display:'flex', gap:4 }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.label} style={{
              display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
              background: tool===t.id ? '#1a1f2e' : '#f5f6f8',
              color: tool===t.id ? '#c9a227' : '#606878',
              border: `1px solid ${tool===t.id ? '#1a1f2e' : '#d8dde6'}`,
              borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700,
            }}>
              <span style={{ fontSize:13 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div style={{ width:1, height:22, background:'#e2e6ec', flexShrink:0, margin:'0 4px' }} />

        {/* Presets */}
        <span style={{ fontSize:10, color:'#9aa5b8', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Presets</span>
        {[['2bhk','2 BHK'],['3bhk','3 BHK']].map(([id,lb]) => (
          <button key={id} onClick={()=>loadPreset(id)} style={{
            padding:'4px 10px', background:'#f5f6f8', border:'1px solid #d8dde6',
            borderRadius:6, cursor:'pointer', fontSize:11, color:'#4a5568', fontWeight:600,
          }}>{lb}</button>
        ))}

        <div style={{ width:1, height:22, background:'#e2e6ec', flexShrink:0, margin:'0 4px' }} />

        <button onClick={undo} style={{ padding:'4px 10px', background:'#f5f6f8', border:'1px solid #d8dde6', borderRadius:6, cursor:'pointer', fontSize:11, color:'#4a5568' }}>↩ Undo</button>
        <button onClick={clearAll} style={{ padding:'4px 10px', background:'#f5f6f8', border:'1px solid #fca5a5', borderRadius:6, cursor:'pointer', fontSize:11, color:'#ef4444' }}>✕ Clear</button>

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:11, color:'#9aa5b8' }}>
            Walls: <b style={{ color:'#1a1f2e' }}>{wallCount}</b>
            {totalArea > 0 && <> · Area: <b style={{ color:'#c9a227' }}>{totalArea} m²</b></>}
          </span>
          <span style={{ fontSize:11, color:'#9aa5b8' }}>Zoom: <b style={{ color:'#1a1f2e' }}>{Math.round(zoom*100)}%</b></span>
          <button onClick={exportTo3D} style={{
            padding:'6px 16px', background:'#c9a227', color:'#fff', border:'none',
            borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700,
          }}>View in 3D →</button>
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', minHeight:0,
        cursor: tool==='wall'?'crosshair': tool==='eraser'?'cell': tool==='select'?'default':'crosshair' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onWheel={onWheel}
      >
        <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />

        {/* Tool hint – light pill */}
        <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', padding:'5px 16px', background:'rgba(255,255,255,0.92)', border:'1px solid #e2e6ec', borderRadius:20, fontSize:11, color:'#6b7280', pointerEvents:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', whiteSpace:'nowrap' }}>
          {tool==='wall'       && '▬ Click & drag to draw wall · Orthogonal snap · Alt+drag to pan · Scroll to zoom'}
          {tool==='door'       && '🚪 Click to place door arc'}
          {tool==='window'     && '🪟 Click two points to place window'}
          {tool==='room-label' && '🏷 Click inside a room to add a label'}
          {tool==='eraser'     && '✕ Click a wall to erase it'}
          {tool==='select'     && '↖ Click a wall to select · Alt+drag to pan'}
        </div>

        {/* Room label menu */}
        {showRoomMenu && (
          <div style={{ position:'absolute', background:'#fff', border:'1px solid #e2e6ec', borderRadius:10, padding:8, boxShadow:'0 4px 16px rgba(0,0,0,0.12)', zIndex:10, left: showRoomMenu.x+10, top: showRoomMenu.y-10 }}>
            <p style={{ margin:'0 0 6px', fontSize:10, color:'#9aa5b8', fontWeight:700, textTransform:'uppercase', letterSpacing:1, padding:'0 6px' }}>Room Type</p>
            {Object.keys(ROOM_COLORS).map(r => (
              <button key={r} onClick={() => addLabel(r)} style={{ display:'block', width:'100%', textAlign:'left', padding:'6px 12px', fontSize:12, color:'#374151', background:'transparent', border:'none', cursor:'pointer', borderRadius:6 }}
                onMouseEnter={e=>e.target.style.background='#f5f6f8'} onMouseLeave={e=>e.target.style.background='transparent'}>
                {r}
              </button>
            ))}
            <button onClick={()=>setShowRoomMenu(null)} style={{ display:'block', width:'100%', padding:'4px', fontSize:11, color:'#9aa5b8', background:'transparent', border:'none', cursor:'pointer', borderTop:'1px solid #f0f1f3', marginTop:4 }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 14px', background:'#fff', borderTop:'1px solid #e2e6ec', fontSize:10, color:'#9aa5b8' }}>
        <span>El Shaddai Floor Plan Editor · 1 grid cell = {CELL_M}m × {CELL_M}m</span>
        <span>Draw walls → label rooms → View in 3D</span>
      </div>
    </div>
  )
}

function ptToSegDist(pt, seg) {
  const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(pt.x - seg.x1, pt.y - seg.y1)
  const t = Math.max(0, Math.min(1, ((pt.x - seg.x1) * dx + (pt.y - seg.y1) * dy) / len2))
  return Math.hypot(pt.x - (seg.x1 + t * dx), pt.y - (seg.y1 + t * dy))
}
