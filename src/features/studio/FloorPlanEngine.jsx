/**
 * FloorPlanEngine — 2D floor plan drafting engine
 *
 * Architecture:
 *   • Pure HTML Canvas 2D (no Fabric dependency here — full control)
 *   • Scale: SCALE px = 1 metre  (default 60px/m)
 *   • Grid: every GRID px = 0.5m increments
 *   • Tools: wall | door | window | room-label | select | erase | measure
 *   • Chain drawing: click→move→click continues same wall chain;
 *     double-click or Esc ends chain
 *   • Snap: grid snap + endpoint snap (within SNAP_RADIUS px)
 *   • Undo / Redo: Ctrl+Z / Ctrl+Y (history of walls arrays)
 *   • Exports walls[] as metric JSON for ThreeEngine
 */

import { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react'

/* ─── Constants ────────────────────────────────────────────────────────────── */
export const SCALE      = 60    // px per metre
export const GRID       = 30    // px per grid line  (0.5m)
export const WALL_PX_T  = 10    // wall thickness in px  (~17cm)
export const SNAP_R     = 14    // snap-to-endpoint radius (px)
export const WALL_H     = 2.8   // metres (used by 3D engine)

const COLORS = {
  bg:          '#f4f1ec',
  grid:        '#e0dbd3',
  gridMajor:   '#cdc7bc',
  wall:        '#3d3830',
  wallFill:    '#6b6356',
  wallHover:   '#c9a227',
  wallSelect:  '#e8a020',
  door:        '#2563eb',
  doorFill:    'rgba(37,99,235,0.15)',
  window:      '#0891b2',
  windowFill:  'rgba(8,145,178,0.15)',
  dim:         '#78716c',
  snap:        '#c9a227',
  room:        'rgba(201,162,39,0.06)',
  roomLabel:   '#9c7a18',
  measure:     '#ef4444',
  compass:     '#555',
}

/* ─── Utility ──────────────────────────────────────────────────────────────── */
const snap = (v, g = GRID) => Math.round(v / g) * g

function dist(x1, y1, x2, y2) { return Math.hypot(x2-x1, y2-y1) }

function snapToGrid(x, y) { return { x: snap(x), y: snap(y) } }

function snapToEndpoint(x, y, walls, excludeId = null) {
  for (const w of walls) {
    if (w.id === excludeId) continue
    for (const [ex, ey] of [[w.x1,w.y1],[w.x2,w.y2]]) {
      if (dist(x, y, ex, ey) < SNAP_R) return { x: ex, y: ey, snapped: true }
    }
  }
  return { x, y, snapped: false }
}

function wallLength(w) {
  return dist(w.x1, w.y1, w.x2, w.y2) / SCALE  // metres
}

function wallMidpoint(w) {
  return { x: (w.x1+w.x2)/2, y: (w.y1+w.y2)/2 }
}

function wallAngle(w) {
  return Math.atan2(w.y2-w.y1, w.x2-w.x1)
}

function pointOnWall(px, py, w, tol = WALL_PX_T + 4) {
  const dx = w.x2-w.x1, dy = w.y2-w.y1
  const len = Math.hypot(dx, dy)
  if (len < 1) return false
  const t = ((px-w.x1)*dx + (py-w.y1)*dy) / (len*len)
  if (t < 0 || t > 1) return false
  const cx = w.x1 + t*dx, cy = w.y1 + t*dy
  return dist(px, py, cx, cy) < tol
}

/* detect closed rooms (simplified: find walls that form circuits) */
function detectRooms(walls) {
  // Build adjacency map: endpoint → connected endpoints
  const pts = {}
  const key = (x,y) => `${x},${y}`
  walls.forEach(w => {
    const ka = key(w.x1,w.y1), kb = key(w.x2,w.y2)
    if (!pts[ka]) pts[ka] = []
    if (!pts[kb]) pts[kb] = []
    pts[ka].push({k:kb,x:w.x2,y:w.y2})
    pts[kb].push({k:ka,x:w.x1,y:w.y1})
  })
  // Simple: return list of closed polygons (DFS cycle detection skipped for perf)
  // Instead, just return areas as centroid estimates for any wall set
  return []
}

/* ─── Drawing helpers ──────────────────────────────────────────────────────── */
function drawGrid(ctx, W, H, ox, oy) {
  ctx.save()
  ctx.lineWidth = 1

  const startX = (ox % GRID) - GRID
  const startY = (oy % GRID) - GRID

  for (let x = startX; x < W; x += GRID) {
    const isMajor = Math.round((x - startX) / GRID) % 2 === 0
    ctx.strokeStyle = isMajor ? COLORS.gridMajor : COLORS.grid
    ctx.globalAlpha = isMajor ? 0.7 : 0.4
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = startY; y < H; y += GRID) {
    const isMajor = Math.round((y - startY) / GRID) % 2 === 0
    ctx.strokeStyle = isMajor ? COLORS.gridMajor : COLORS.grid
    ctx.globalAlpha = isMajor ? 0.7 : 0.4
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  ctx.restore()
}

function drawWall(ctx, w, selected, hovered) {
  const dx = w.x2-w.x1, dy = w.y2-w.y1
  const len = Math.hypot(dx, dy)
  if (len < 2) return
  const nx = -dy/len * WALL_PX_T/2
  const ny =  dx/len * WALL_PX_T/2

  const fillColor = selected ? COLORS.wallSelect : hovered ? COLORS.wallHover : COLORS.wallFill
  const strokeColor = selected ? '#d4891a' : hovered ? '#b8902a' : COLORS.wall

  ctx.beginPath()
  ctx.moveTo(w.x1+nx, w.y1+ny)
  ctx.lineTo(w.x2+nx, w.y2+ny)
  ctx.lineTo(w.x2-nx, w.y2-ny)
  ctx.lineTo(w.x1-nx, w.y1-ny)
  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1.5
  ctx.stroke()

  // endpoint dots
  for (const [ex, ey] of [[w.x1,w.y1],[w.x2,w.y2]]) {
    ctx.beginPath()
    ctx.arc(ex, ey, 4, 0, Math.PI*2)
    ctx.fillStyle = selected ? COLORS.wallSelect : '#888'
    ctx.fill()
  }
}

function drawDoor(ctx, w) {
  const mx = (w.x1+w.x2)/2, my = (w.y1+w.y2)/2
  const angle = wallAngle(w)
  const len = dist(w.x1,w.y1,w.x2,w.y2)

  ctx.save()
  ctx.translate(mx, my)
  ctx.rotate(angle)

  // Door gap (white over wall)
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(-len/2, -WALL_PX_T/2-1, len, WALL_PX_T+2)

  // Door leaf arc
  ctx.beginPath()
  ctx.moveTo(-len/2, 0)
  ctx.arc(-len/2, 0, len, 0, Math.PI/2)
  ctx.strokeStyle = COLORS.door
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Door symbol rectangle
  ctx.strokeRect(-len/2, 0, len, len*0.05)
  ctx.restore()
}

function drawWindow(ctx, w) {
  const angle = wallAngle(w)
  const len = dist(w.x1,w.y1,w.x2,w.y2)

  ctx.save()
  ctx.translate(w.x1, w.y1)
  ctx.rotate(angle)

  // White gap over wall
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, -WALL_PX_T/2-1, len, WALL_PX_T+2)

  // Window lines (3 parallel)
  ctx.strokeStyle = COLORS.window
  ctx.lineWidth = 1.5
  for (const offset of [-WALL_PX_T*0.5, 0, WALL_PX_T*0.5]) {
    ctx.beginPath()
    ctx.moveTo(0, offset)
    ctx.lineTo(len, offset)
    ctx.stroke()
  }
  ctx.restore()
}

function drawDimension(ctx, w) {
  const m = wallMidpoint(w)
  const len = wallLength(w)
  if (len < 0.3) return
  const angle = wallAngle(w)

  const label = len < 10 ? `${len.toFixed(2)}m` : `${len.toFixed(1)}m`
  const offset = WALL_PX_T + 12

  ctx.save()
  ctx.translate(m.x, m.y)
  ctx.rotate(angle)
  // Keep text upright
  const flip = angle > Math.PI/2 || angle < -Math.PI/2

  ctx.fillStyle = COLORS.dim
  ctx.font = '10px "DM Sans",sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (flip) ctx.rotate(Math.PI)

  // dim line ticks
  ctx.strokeStyle = COLORS.dim
  ctx.lineWidth = 1
  const halfLen = (len * SCALE) / 2
  ctx.beginPath(); ctx.moveTo(-halfLen, -offset); ctx.lineTo(halfLen, -offset); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-halfLen, -offset-4); ctx.lineTo(-halfLen, -offset+4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo( halfLen, -offset-4); ctx.lineTo( halfLen, -offset+4); ctx.stroke()

  ctx.fillText(label, 0, -offset)
  ctx.restore()
}

function drawSnapIndicator(ctx, x, y) {
  ctx.save()
  ctx.strokeStyle = COLORS.snap
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, SNAP_R, 0, Math.PI*2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, 3, 0, Math.PI*2)
  ctx.fillStyle = COLORS.snap
  ctx.fill()
  ctx.restore()
}

function drawCompass(ctx, W, H) {
  const x = W - 36, y = 36, r = 18
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = '#ddd'; ctx.lineWidth=1; ctx.stroke()

  // N arrow
  ctx.beginPath(); ctx.moveTo(0,-r*0.7); ctx.lineTo(3,r*0.3); ctx.lineTo(0,r*0.1); ctx.closePath()
  ctx.fillStyle='#ef4444'; ctx.fill()
  ctx.beginPath(); ctx.moveTo(0,-r*0.7); ctx.lineTo(-3,r*0.3); ctx.lineTo(0,r*0.1); ctx.closePath()
  ctx.fillStyle='#555'; ctx.fill()
  ctx.fillStyle='#333'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.fillText('N', 0, -r*0.85)
  ctx.restore()
}

function drawScaleBar(ctx, W, H) {
  const x = 16, y = H - 24
  const barW = SCALE * 2  // = 2m
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillRect(x-4, y-10, barW+30, 20)
  ctx.strokeStyle = '#444'; ctx.lineWidth = 2
  ctx.strokeRect(x, y-4, barW, 8)
  // half fills
  ctx.fillStyle = '#444'
  ctx.fillRect(x, y-4, barW/2, 8)
  ctx.fillStyle = '#fff'
  ctx.fillRect(x+barW/2, y-4, barW/2, 8)
  ctx.strokeRect(x, y-4, barW, 8)
  ctx.fillStyle = '#333'; ctx.font = '9px sans-serif'; ctx.textAlign='right'; ctx.textBaseline='middle'
  ctx.fillText('2m', x+barW+6, y)
  ctx.restore()
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  FloorPlanEngine component                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
const FloorPlanEngine = forwardRef(function FloorPlanEngine(
  { tool, walls, onWallsChange, selectedId, onSelect, onStatusChange },
  ref
) {
  const canvasRef   = useRef(null)
  const stateRef    = useRef({
    drawing:   false,
    chainX:    null,
    chainY:    null,
    mouseX:    0,
    mouseY:    0,
    snapX:     0,
    snapY:     0,
    isSnapped: false,
    hovered:   null,
    history:   [[]],
    histIdx:   0,
    offset:    { x: 0, y: 0 },  // pan offset
    panning:   false,
    panStart:  null,
    zoom:      1,
  })

  /* ── imperative API ──────────────────────────────────────────────────────── */
  useImperativeHandle(ref, () => ({
    undo() {
      const s = stateRef.current
      if (s.histIdx > 0) {
        s.histIdx--
        onWallsChange([...s.history[s.histIdx]])
      }
    },
    redo() {
      const s = stateRef.current
      if (s.histIdx < s.history.length-1) {
        s.histIdx++
        onWallsChange([...s.history[s.histIdx]])
      }
    },
    clearAll() {
      pushHistory([])
      onWallsChange([])
    },
    exportJSON() {
      return JSON.stringify({ walls, scale: SCALE, wallHeight: WALL_H })
    },
    importJSON(json) {
      try {
        const data = JSON.parse(json)
        pushHistory(data.walls || [])
        onWallsChange(data.walls || [])
      } catch {}
    },
    exportPNG() {
      return canvasRef.current?.toDataURL('image/png')
    },
    cancelDrawing() {
      stateRef.current.drawing = false
      stateRef.current.chainX = null
      stateRef.current.chainY = null
      draw()
    },
  }))

  function pushHistory(newWalls) {
    const s = stateRef.current
    const trimmed = s.history.slice(0, s.histIdx+1)
    trimmed.push([...newWalls])
    s.history = trimmed
    s.histIdx = trimmed.length-1
  }

  /* ── draw loop ───────────────────────────────────────────────────────────── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const s = stateRef.current

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(s.offset.x, s.offset.y)

    drawGrid(ctx, W - s.offset.x, H - s.offset.y, s.offset.x, s.offset.y)

    // Draw existing walls
    for (const w of walls) {
      const hov = s.hovered === w.id
      const sel = selectedId === w.id
      if (w.type === 'door')   drawDoor(ctx, w)
      else if (w.type === 'window') drawWindow(ctx, w)
      else drawWall(ctx, w, sel, hov)
      drawDimension(ctx, w)
    }

    // Preview wall while drawing
    if (s.drawing && s.chainX !== null) {
      const preview = { id:'preview', x1:s.chainX, y1:s.chainY, x2:s.snapX, y2:s.snapY,
        type: tool === 'door' ? 'door' : tool === 'window' ? 'window' : 'wall' }
      if (preview.type === 'door') drawDoor(ctx, preview)
      else if (preview.type === 'window') drawWindow(ctx, preview)
      else {
        ctx.globalAlpha = 0.6
        drawWall(ctx, preview, false, true)
        ctx.globalAlpha = 1
      }
      drawDimension(ctx, preview)
    }

    // Snap indicator
    if (s.isSnapped) drawSnapIndicator(ctx, s.snapX, s.snapY)

    ctx.restore()

    // Decorative overlays (fixed, not panned)
    drawCompass(ctx, W, H)
    drawScaleBar(ctx, W, H)

    // Chain start indicator
    if (s.drawing && s.chainX !== null) {
      const sx = s.chainX + s.offset.x
      const sy = s.chainY + s.offset.y
      ctx.save()
      ctx.strokeStyle = COLORS.snap
      ctx.lineWidth = 2
      ctx.setLineDash([4, 3])
      ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI*2); ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }

    // Status
    const wallCount = walls.filter(w => w.type==='wall').length
    const totalLen = walls.filter(w=>w.type==='wall').reduce((a,w)=>a+wallLength(w),0)
    onStatusChange?.({
      walls: wallCount,
      doors: walls.filter(w=>w.type==='door').length,
      windows: walls.filter(w=>w.type==='window').length,
      totalLength: totalLen.toFixed(1),
      tool,
    })
  }, [walls, selectedId, tool, onStatusChange])

  useEffect(() => { draw() }, [draw])

  /* ── resize ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      draw()
    })
    ro.observe(canvas)
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    return () => ro.disconnect()
  }, [draw])

  /* ── keyboard ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey||e.metaKey) && e.key==='z') {
        const s = stateRef.current
        if (s.histIdx > 0) { s.histIdx--; onWallsChange([...s.history[s.histIdx]]) }
      }
      if ((e.ctrlKey||e.metaKey) && e.key==='y') {
        const s = stateRef.current
        if (s.histIdx < s.history.length-1) { s.histIdx++; onWallsChange([...s.history[s.histIdx]]) }
      }
      if (e.key === 'Escape') {
        stateRef.current.drawing = false
        stateRef.current.chainX = null
        stateRef.current.chainY = null
        draw()
      }
      if (e.key === 'Delete' && selectedId) {
        const newWalls = walls.filter(w => w.id !== selectedId)
        pushHistory(newWalls); onWallsChange(newWalls); onSelect(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [walls, selectedId, draw, onWallsChange, onSelect])

  /* ── mouse events ────────────────────────────────────────────────────────── */
  function getCanvasPos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const s = stateRef.current
    const rx = (e.clientX - rect.left) / s.zoom - s.offset.x
    const ry = (e.clientY - rect.top)  / s.zoom - s.offset.y
    return { rx, ry }
  }

  function resolveSnap(rx, ry) {
    const g = snapToGrid(rx, ry)
    const ep = snapToEndpoint(g.x, g.y, walls)
    return ep.snapped ? ep : g
  }

  function onMouseMove(e) {
    const s = stateRef.current
    const { rx, ry } = getCanvasPos(e)

    if (s.panning) {
      s.offset.x = e.clientX - s.panStart.x
      s.offset.y = e.clientY - s.panStart.y
      draw(); return
    }

    const sp = resolveSnap(rx, ry)
    s.mouseX = rx; s.mouseY = ry
    s.snapX = sp.x; s.snapY = sp.y
    s.isSnapped = sp.snapped || false

    // hover detection
    s.hovered = null
    for (const w of walls) {
      if (pointOnWall(rx, ry, w)) { s.hovered = w.id; break }
    }

    draw()
  }

  function onMouseDown(e) {
    const s = stateRef.current
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      s.panning = true
      s.panStart = { x: e.clientX - s.offset.x, y: e.clientY - s.offset.y }
      return
    }
    if (e.button !== 0) return

    const { rx, ry } = getCanvasPos(e)
    const sp = resolveSnap(rx, ry)

    if (tool === 'select') {
      let found = null
      for (const w of walls) { if (pointOnWall(rx, ry, w)) { found = w.id; break } }
      onSelect(found)
      draw()
      return
    }

    if (tool === 'erase') {
      let found = null
      for (const w of walls) { if (pointOnWall(rx, ry, w)) { found = w.id; break } }
      if (found) {
        const nw = walls.filter(w => w.id !== found)
        pushHistory(nw); onWallsChange(nw)
      }
      return
    }

    if (['wall','door','window'].includes(tool)) {
      if (!s.drawing) {
        s.drawing = true
        s.chainX = sp.x; s.chainY = sp.y
      } else {
        // Complete wall segment
        if (dist(s.chainX, s.chainY, sp.x, sp.y) < 4) return
        const newWall = {
          id: `w_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
          x1: s.chainX, y1: s.chainY,
          x2: sp.x,     y2: sp.y,
          type: tool,
          thickness: WALL_PX_T,
        }
        const nw = [...walls, newWall]
        pushHistory(nw); onWallsChange(nw)
        // Chain: new start = end of this wall
        s.chainX = sp.x; s.chainY = sp.y
        draw()
      }
    }
  }

  function onMouseUp(e) {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      stateRef.current.panning = false
    }
  }

  function onDblClick() {
    stateRef.current.drawing = false
    stateRef.current.chainX  = null
    stateRef.current.chainY  = null
    draw()
  }

  function onWheel(e) {
    e.preventDefault()
    const s = stateRef.current
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    s.zoom = Math.max(0.3, Math.min(4, s.zoom * delta))
    draw()
  }

  /* ── cursor style ────────────────────────────────────────────────────────── */
  const cursorMap = { wall:'crosshair', door:'cell', window:'cell', select:'default', erase:'not-allowed', measure:'crosshair' }
  const cursor = cursorMap[tool] || 'crosshair'

  return (
    <canvas
      ref={canvasRef}
      style={{ width:'100%', height:'100%', display:'block', cursor }}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onDoubleClick={onDblClick}
      onWheel={onWheel}
      onContextMenu={e => e.preventDefault()}
    />
  )
})

export default FloorPlanEngine
