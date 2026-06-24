/**
 * FLOOR PLAN 2D EDITOR
 * Canvas-based 2D drawing tool with:
 *  - Snap-to-grid (10 cm) + snap to wall endpoints
 *  - Wall drawing with live dimension labels
 *  - Door / window placement on walls
 *  - Pan (middle-click / Space+drag) + zoom (scroll wheel)
 *  - Select + delete walls/openings
 *  - Reads/writes the SceneStore scene data model
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useScene } from '../../store/sceneStore'
import { wallLength, snapToGrid, PIXELS_PER_METER, GRID_SIZE } from '../../lib/scene'

// ── Constants ──────────────────────────────────────────────────────────────
const MIN_ZOOM = 0.4
const MAX_ZOOM = 4.0
const ENDPOINT_SNAP_PX = 14   // px threshold for snapping to wall endpoints
const WALL_HIT_PX      = 8    // px threshold for clicking a wall

const TOOL_COLORS = {
  wall:   '#2563eb',
  door:   '#f59e0b',
  window: '#06b6d4',
  select: '#6366f1',
}

// ── Component ──────────────────────────────────────────────────────────────

export default function FloorPlan2D({ activeTool = 'select', style }) {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({
    zoom:    1,
    panX:    0,   // canvas-center offset in screen px
    panY:    0,
    drawing: null,       // { sx, sz } — wall start point in meters
    hover:   null,       // snapped cursor { x, z } in meters
    selectedId: null,
    panning: false,
    panStart: null,
  })

  const [, forceRedraw] = useState(0)
  const redraw = useCallback(() => forceRedraw(n => n + 1), [])

  const { activeFloor, addWall, removeWall, addOpening, clearWalls, canUndo, canRedo, undo, redo, addFurniture } = useScene()

  // ── Coordinate conversion ────────────────────────────────────────────────

  const ppm = useCallback(() => PIXELS_PER_METER * stateRef.current.zoom, [])

  const meterToCanvas = useCallback((mx, mz) => {
    const { panX, panY, zoom } = stateRef.current
    const canvas = canvasRef.current
    if (!canvas) return { cx: 0, cy: 0 }
    const ppmZ = PIXELS_PER_METER * zoom
    return {
      cx: canvas.width  / 2 + panX + mx * ppmZ,
      cy: canvas.height / 2 + panY + mz * ppmZ,
    }
  }, [])

  const canvasToMeter = useCallback((cx, cy) => {
    const { panX, panY, zoom } = stateRef.current
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, z: 0 }
    const ppmZ = PIXELS_PER_METER * zoom
    return {
      x: (cx - canvas.width  / 2 - panX) / ppmZ,
      z: (cy - canvas.height / 2 - panY) / ppmZ,
    }
  }, [])

  // Snap to nearest wall endpoint (in canvas px), else snap to grid
  const snapCursor = useCallback((cx, cy) => {
    const raw   = canvasToMeter(cx, cy)
    const walls = activeFloor?.walls ?? []
    const ppmZ  = ppm()

    let best = null, bestDist = ENDPOINT_SNAP_PX
    for (const w of walls) {
      for (const pt of [w.start, w.end]) {
        const { cx: px, cy: py } = meterToCanvas(pt.x, pt.z)
        const d = Math.hypot(cx - px, cy - py)
        if (d < bestDist) { bestDist = d; best = pt }
      }
    }
    if (best) return { x: best.x, z: best.z, snapped: 'endpoint' }

    return {
      x: snapToGrid(raw.x, GRID_SIZE),
      z: snapToGrid(raw.z, GRID_SIZE),
      snapped: 'grid',
    }
  }, [canvasToMeter, meterToCanvas, activeFloor, ppm])

  // ── Render ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { zoom, panX, panY, drawing, hover, selectedId } = stateRef.current
    const ppmZ = PIXELS_PER_METER * zoom
    const W = canvas.width, H = canvas.height
    const cx0 = W / 2 + panX, cy0 = H / 2 + panY

    const toC = (mx, mz) => ({ cx: cx0 + mx * ppmZ, cy: cy0 + mz * ppmZ })

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#f8f9fb'
    ctx.fillRect(0, 0, W, H)

    // ── Grid ──
    const minorStep = GRID_SIZE * ppmZ
    const majorStep = 1.0    * ppmZ   // 1 m major grid

    if (minorStep > 4) {
      ctx.strokeStyle = '#d4dde8'
      ctx.lineWidth   = 0.5
      const startX = ((cx0 % minorStep) + minorStep) % minorStep
      const startY = ((cy0 % minorStep) + minorStep) % minorStep
      for (let x = startX; x < W; x += minorStep) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = startY; y < H; y += minorStep) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    }

    ctx.strokeStyle = '#a8b8c8'
    ctx.lineWidth   = 1
    const startX2 = ((cx0 % majorStep) + majorStep) % majorStep
    const startY2 = ((cy0 % majorStep) + majorStep) % majorStep
    for (let x = startX2; x < W; x += majorStep) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = startY2; y < H; y += majorStep) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Origin crosshair
    if (cx0 > 0 && cx0 < W && cy0 > 0 && cy0 < H) {
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth   = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(cx0 - 12, cy0); ctx.lineTo(cx0 + 12, cy0); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx0, cy0 - 12); ctx.lineTo(cx0, cy0 + 12); ctx.stroke()
      ctx.setLineDash([])
    }

    const walls     = activeFloor?.walls    ?? []
    const openings  = activeFloor?.openings ?? []
    const furniture = activeFloor?.furniture ?? []

    // ── Walls ──
    for (const wall of walls) {
      const s = toC(wall.start.x, wall.start.z)
      const e = toC(wall.end.x,   wall.end.z)
      const selected = wall.id === selectedId
      const angle    = Math.atan2(e.cy - s.cy, e.cx - s.cx)
      const thick    = Math.max(2, wall.thickness * ppmZ)
      const nx = -Math.sin(angle) * thick / 2
      const ny =  Math.cos(angle) * thick / 2

      // Wall fill
      ctx.beginPath()
      ctx.moveTo(s.cx + nx, s.cy + ny); ctx.lineTo(e.cx + nx, e.cy + ny)
      ctx.lineTo(e.cx - nx, e.cy - ny); ctx.lineTo(s.cx - nx, s.cy - ny)
      ctx.closePath()
      ctx.fillStyle   = selected ? '#bfdbfe' : '#e8eaed'
      ctx.fill()
      ctx.strokeStyle = selected ? TOOL_COLORS.select : '#6b7280'
      ctx.lineWidth   = selected ? 2 : 1.5
      ctx.stroke()

      // Dimension label
      const len = wallLength(wall)
      if (len > 0.1 && ppmZ > 30) {
        const mx = (s.cx + e.cx) / 2, my = (s.cy + e.cy) / 2
        const label = len >= 1 ? `${len.toFixed(2)}m` : `${(len * 100).toFixed(0)}cm`
        ctx.save()
        ctx.translate(mx, my)
        ctx.rotate(angle)
        ctx.fillStyle    = '#374151'
        ctx.font         = `${Math.max(9, 11 * zoom)}px 'DM Sans',sans-serif`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(label, 0, -thick / 2 - 3)
        ctx.restore()
      }

      // Wall endpoints
      for (const pt of [wall.start, wall.end]) {
        const { cx, cy } = toC(pt.x, pt.z)
        ctx.beginPath()
        ctx.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx.fillStyle = selected ? TOOL_COLORS.select : '#374151'
        ctx.fill()
      }
    }

    // ── Openings (doors / windows) ──
    for (const op of openings) {
      const wall = walls.find(w => w.id === op.wallId)
      if (!wall) continue
      const angle  = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x)
      const wlen   = wallLength(wall)
      const midPos = op.position * wlen
      const midX   = wall.start.x + Math.cos(Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x)) * midPos
      const midZ   = wall.start.z + Math.sin(Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x)) * midPos
      const { cx: ocx, cy: ocy } = toC(midX, midZ)
      const halfW  = (op.width / 2) * ppmZ
      const thick  = Math.max(2, wall.thickness * ppmZ)

      ctx.save()
      ctx.translate(ocx, ocy)
      ctx.rotate(angle)

      if (op.type === 'door') {
        // Door arc
        ctx.fillStyle   = '#fff'
        ctx.fillRect(-halfW, -thick / 2, halfW * 2, thick)
        ctx.strokeStyle = TOOL_COLORS.door
        ctx.lineWidth   = 1.5
        ctx.strokeRect(-halfW, -thick / 2, halfW * 2, thick)
        ctx.beginPath()
        ctx.arc(-halfW, -thick / 2, halfW * 2, 0, Math.PI / 2)
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])
      } else {
        // Window triple line
        ctx.fillStyle = '#ddf0ff'
        ctx.fillRect(-halfW, -thick / 2, halfW * 2, thick)
        ctx.strokeStyle = TOOL_COLORS.window
        ctx.lineWidth   = 1.5
        ctx.strokeRect(-halfW, -thick / 2, halfW * 2, thick)
        for (const dx of [-halfW * 0.4, 0, halfW * 0.4]) {
          ctx.beginPath(); ctx.moveTo(dx, -thick / 2); ctx.lineTo(dx, thick / 2); ctx.stroke()
        }
      }
      ctx.restore()
    }

    // ── Furniture footprints ──
    for (const item of furniture) {
      const { cx, cy } = toC(item.position.x, item.position.z)
      const w = (item.dims?.w ?? 1) * ppmZ
      const d = (item.dims?.d ?? 1) * ppmZ
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(item.rotation ?? 0)
      ctx.fillStyle   = 'rgba(201,162,39,0.15)'
      ctx.strokeStyle = '#c9a227'
      ctx.lineWidth   = 1
      ctx.fillRect(-w / 2, -d / 2, w, d)
      ctx.strokeRect(-w / 2, -d / 2, w, d)
      if (ppmZ > 40) {
        ctx.fillStyle    = '#92400e'
        ctx.font         = `${Math.max(8, 9 * zoom)}px sans-serif`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.name.slice(0, 12), 0, 0)
      }
      ctx.restore()
    }

    // ── Live wall preview while drawing ──
    if (drawing && hover) {
      const s = toC(drawing.sx, drawing.sz)
      const e = toC(hover.x, hover.z)
      ctx.beginPath()
      ctx.moveTo(s.cx, s.cy)
      ctx.lineTo(e.cx, e.cy)
      ctx.strokeStyle = TOOL_COLORS.wall
      ctx.lineWidth   = 3
      ctx.setLineDash([6, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // Live length label
      const dx  = hover.x - drawing.sx, dz = hover.z - drawing.sz
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len > 0.05) {
        const label = len >= 1 ? `${len.toFixed(2)} m` : `${(len * 100).toFixed(0)} cm`
        ctx.fillStyle = TOOL_COLORS.wall
        ctx.font      = `bold ${Math.max(10, 12 * zoom)}px 'DM Sans',sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(label, (s.cx + e.cx) / 2, (s.cy + e.cy) / 2 - 10)
      }

      // Start dot
      ctx.beginPath()
      ctx.arc(s.cx, s.cy, 6, 0, Math.PI * 2)
      ctx.fillStyle = TOOL_COLORS.wall
      ctx.fill()
    }

    // ── Snap cursor indicator ──
    if (hover) {
      const { cx, cy } = toC(hover.x, hover.z)
      ctx.beginPath()
      ctx.arc(cx, cy, hover.snapped === 'endpoint' ? 8 : 5, 0, Math.PI * 2)
      ctx.strokeStyle = hover.snapped === 'endpoint' ? '#ef4444' : TOOL_COLORS[activeTool] ?? '#374151'
      ctx.lineWidth   = 2
      ctx.stroke()
    }

    // ── North arrow (top-left) ──
    ctx.save()
    ctx.translate(24, 24)
    ctx.font = 'bold 10px sans-serif'
    ctx.fillStyle = '#2563eb'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.beginPath()
    ctx.moveTo(0, -12); ctx.lineTo(4, 0); ctx.lineTo(0, -3); ctx.lineTo(-4, 0)
    ctx.closePath(); ctx.fill()
    ctx.fillText('N', 0, 10)
    ctx.restore()

    // ── Scale bar ──
    const barM  = zoom < 0.6 ? 5 : zoom < 1.2 ? 2 : zoom < 2.5 ? 1 : 0.5
    const barPx = barM * ppmZ
    const bx    = W - barPx - 16, by = H - 20
    ctx.fillStyle   = '#374151'
    ctx.fillRect(bx, by, barPx, 2)
    ctx.fillRect(bx, by - 4, 1.5, 6)
    ctx.fillRect(bx + barPx, by - 4, 1.5, 6)
    ctx.font         = '10px sans-serif'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${barM}m`, bx + barPx / 2, by - 4)

    // ── Zoom label ──
    ctx.fillStyle    = '#6b7280'
    ctx.font         = '10px sans-serif'
    ctx.textAlign    = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${Math.round(zoom * 100)}%`, W - 14, H - 6)
  })

  // ── Resize observer ───────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width  = width  * devicePixelRatio
      canvas.height = height * devicePixelRatio
      canvas.style.width  = `${width}px`
      canvas.style.height = `${height}px`
      const ctx = canvas.getContext('2d')
      ctx.scale(devicePixelRatio, devicePixelRatio)
      redraw()
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [redraw])

  // Redraw when scene changes
  useEffect(() => { redraw() }, [activeFloor, activeTool, redraw])

  // ── Hit testing ───────────────────────────────────────────────────────────

  const hitWall = useCallback((cx, cy) => {
    const walls = activeFloor?.walls ?? []
    const ppmZ  = PIXELS_PER_METER * stateRef.current.zoom
    const panX  = stateRef.current.panX
    const panY  = stateRef.current.panY
    const canvas = canvasRef.current
    if (!canvas) return null
    const ox = canvas.width / devicePixelRatio / 2 + panX
    const oy = canvas.height / devicePixelRatio / 2 + panY

    for (const wall of walls) {
      const sx = ox + wall.start.x * ppmZ, sy = oy + wall.start.z * ppmZ
      const ex = ox + wall.end.x   * ppmZ, ey = oy + wall.end.z   * ppmZ
      const dx = ex - sx, dy = ey - sy
      const len2 = dx * dx + dy * dy
      if (len2 < 1) continue
      const t   = Math.max(0, Math.min(1, ((cx - sx) * dx + (cy - sy) * dy) / len2))
      const px  = sx + t * dx, py = sy + t * dy
      if (Math.hypot(cx - px, cy - py) < WALL_HIT_PX) return wall.id
    }
    return null
  }, [activeFloor])

  // ── Pointer events ────────────────────────────────────────────────────────

  const getCanvasXY = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { cx: e.clientX - rect.left, cy: e.clientY - rect.top }
  }, [])

  const onPointerMove = useCallback((e) => {
    const { cx, cy } = getCanvasXY(e)
    const s = stateRef.current

    if (s.panning && s.panStart) {
      s.panX += cx - s.panStart.cx
      s.panY += cy - s.panStart.cy
      s.panStart = { cx, cy }
      redraw()
      return
    }

    s.hover = snapCursor(cx, cy)
    redraw()
  }, [getCanvasXY, snapCursor, redraw])

  const onPointerDown = useCallback((e) => {
    const { cx, cy } = getCanvasXY(e)
    const s = stateRef.current

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      s.panning  = true
      s.panStart = { cx, cy }
      e.preventDefault()
      return
    }

    if (e.button !== 0) return

    const pt = snapCursor(cx, cy)

    if (activeTool === 'wall') {
      if (!s.drawing) {
        s.drawing = { sx: pt.x, sz: pt.z }
      } else {
        const { sx, sz } = s.drawing
        const dx = pt.x - sx, dz = pt.z - sz
        if (Math.sqrt(dx * dx + dz * dz) > GRID_SIZE) {
          addWall(sx, sz, pt.x, pt.z)
          // Chain: next wall starts from this end
          s.drawing = { sx: pt.x, sz: pt.z }
        }
      }
      redraw()
      return
    }

    if (activeTool === 'select') {
      const wallId = hitWall(cx, cy)
      s.selectedId = wallId ?? null
      redraw()
      return
    }

    if (activeTool === 'door' || activeTool === 'window') {
      const wallId = hitWall(cx, cy)
      if (!wallId) return
      const wall = activeFloor.walls.find(w => w.id === wallId)
      if (!wall) return
      const wlen = wallLength(wall)
      const angle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x)
      const rel   = { x: pt.x - wall.start.x, z: pt.z - wall.start.z }
      const along = rel.x * Math.cos(angle) + rel.z * Math.sin(angle)
      const pos   = Math.max(0.1, Math.min(0.9, along / wlen))
      addOpening(activeTool, wallId, pos)
      redraw()
    }
  }, [getCanvasXY, activeTool, snapCursor, addWall, addOpening, hitWall, activeFloor, redraw])

  const onPointerUp = useCallback((e) => {
    if (e.button === 1 || stateRef.current.panning) {
      stateRef.current.panning  = false
      stateRef.current.panStart = null
    }
  }, [])

  const onDoubleClick = useCallback(() => {
    stateRef.current.drawing = null
    redraw()
  }, [redraw])

  const onContextMenu = useCallback((e) => {
    e.preventDefault()
    stateRef.current.drawing = null
    redraw()
  }, [redraw])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const { cx, cy } = getCanvasXY(e)
    const s = stateRef.current
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, s.zoom * factor))
    // Zoom toward cursor
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width / devicePixelRatio
    const H = canvas.height / devicePixelRatio
    const ox = cx - W / 2, oy = cy - H / 2
    s.panX = ox + (s.panX - ox) * (newZoom / s.zoom)
    s.panY = oy + (s.panY - oy) * (newZoom / s.zoom)
    s.zoom = newZoom
    redraw()
  }, [getCanvasXY, redraw])

  // ── Drag-drop from catalog panel ────────────────────────────────────────────

  const onDragOver = useCallback((e) => {
    if (e.dataTransfer.types.includes('application/x-furniture')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const onDrop = useCallback((e) => {
    const raw = e.dataTransfer.getData('application/x-furniture')
    if (!raw) return
    e.preventDefault()
    try {
      const item = JSON.parse(raw)
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const cx = (e.clientX - rect.left) * (canvas.width  / rect.width)
      const cy = (e.clientY - rect.top)  * (canvas.height / rect.height)
      const { x, z } = canvasToMeter(cx, cy)
      const sx = snapToGrid(x, GRID_SIZE)
      const sz = snapToGrid(z, GRID_SIZE)
      addFurniture(item, { x: sx, y: 0, z: sz })
      redraw()
    } catch {/* ignore malformed data */}
  }, [canvasToMeter, addFurniture, redraw])

  const onKeyDown = useCallback((e) => {
    if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
      e.shiftKey ? redo() : undo()
    }
    if (e.key === 'Escape') {
      stateRef.current.drawing    = null
      stateRef.current.selectedId = null
      redraw()
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const sid = stateRef.current.selectedId
      if (sid) { removeWall(sid); stateRef.current.selectedId = null; redraw() }
    }
  }, [undo, redo, removeWall, redraw])

  // Fit all walls on mount / when walls change
  const fitToContent = useCallback(() => {
    const walls = activeFloor?.walls ?? []
    if (!walls.length) { stateRef.current.panX = 0; stateRef.current.panY = 0; stateRef.current.zoom = 1; redraw(); return }
    const xs = walls.flatMap(w => [w.start.x, w.end.x])
    const zs = walls.flatMap(w => [w.start.z, w.end.z])
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minZ = Math.min(...zs), maxZ = Math.max(...zs)
    const cx   = (minX + maxX) / 2, cz = (minZ + maxZ) / 2
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width / devicePixelRatio
    const H = canvas.height / devicePixelRatio
    const wMeters = maxX - minX + 4, hMeters = maxZ - minZ + 4
    const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(W / (wMeters * PIXELS_PER_METER), H / (hMeters * PIXELS_PER_METER))))
    stateRef.current.zoom = zoom
    stateRef.current.panX = -cx * PIXELS_PER_METER * zoom
    stateRef.current.panY = -cz * PIXELS_PER_METER * zoom
    redraw()
  }, [activeFloor, redraw])

  useEffect(() => {
    if (activeFloor?.walls.length === 1) fitToContent()
  }, [activeFloor?.walls.length])

  // ── Render ─────────────────────────────────────────────────────────────────

  const cursor = activeTool === 'select' ? 'default'
    : activeTool === 'wall'   ? 'crosshair'
    : activeTool === 'door' || activeTool === 'window' ? 'cell'
    : 'default'

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', ...style }}
      tabIndex={0} onKeyDown={onKeyDown} onDragOver={onDragOver} onDrop={onDrop}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        onWheel={onWheel}
      />

      {/* Mini toolbar overlay */}
      <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, background:'rgba(255,255,255,0.92)', border:'1px solid #e8eaed', borderRadius:8, padding:'6px 10px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', pointerEvents:'auto' }}>
        {[
          { tip:'Fit view', icon:'⊡', action: fitToContent },
          { tip:'Undo (Ctrl+Z)', icon:'↩', action: undo, disabled: !canUndo },
          { tip:'Redo (Ctrl+Y)', icon:'↪', action: redo, disabled: !canRedo },
          { tip:'Clear all walls', icon:'🗑', action: clearWalls },
        ].map(b => (
          <button key={b.tip} title={b.tip} onClick={b.action} disabled={b.disabled}
            style={{ background:'none', border:'none', cursor: b.disabled ? 'not-allowed' : 'pointer', fontSize:16, opacity: b.disabled ? 0.35 : 1, padding:'2px 4px', borderRadius:4, lineHeight:1 }}>
            {b.icon}
          </button>
        ))}
        <span style={{ width:1, background:'#e8eaed', margin:'0 2px' }}/>
        <span style={{ fontSize:10, color:'#6b7280', alignSelf:'center', userSelect:'none' }}>
          Scroll to zoom · Alt+drag to pan · Esc to cancel
        </span>
      </div>
    </div>
  )
}
