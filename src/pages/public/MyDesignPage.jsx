/**
 * MyDesignPage — Public Room Designer
 * Anyone can drag furniture, pick colors, and design their own room.
 * Simple UI surface, powerful canvas engine underneath.
 */
import { useState, useRef, useEffect, useCallback, useId } from 'react'

// ─── Brand tokens ────────────────────────────────────────────────────────────
const B = {
  gold:    '#c4956a',
  goldD:   '#a87a52',
  bg:      '#faf9f7',
  white:   '#ffffff',
  border:  '#e8e3db',
  text:    '#1c1917',
  muted:   '#78716c',
  sidebar: '#f5f3f0',
  canvas:  '#f0ede8',
  select:  '#c4956a',
  grid:    'rgba(180,165,145,0.18)',
  wall:    '#3d3530',
}

// ─── Room types ───────────────────────────────────────────────────────────────
const ROOMS = [
  { id:'living',   label:'Living Room',  icon:'🛋',  area:'300–500 sq ft', w:500, h:400, color:'#dbeafe' },
  { id:'bedroom',  label:'Bedroom',      icon:'🛏',  area:'150–250 sq ft', w:400, h:360, color:'#ede9fe' },
  { id:'kitchen',  label:'Kitchen',      icon:'🍳',  area:'100–200 sq ft', w:360, h:300, color:'#fef3c7' },
  { id:'dining',   label:'Dining Room',  icon:'🍽',  area:'120–200 sq ft', w:360, h:320, color:'#fce7f3' },
  { id:'office',   label:'Home Office',  icon:'💼',  area:'100–200 sq ft', w:320, h:300, color:'#d1fae5' },
  { id:'kids',     label:'Kids Room',    icon:'🧸',  area:'120–200 sq ft', w:380, h:320, color:'#fef9c3' },
  { id:'bathroom', label:'Bathroom',     icon:'🚿',  area:'60–100 sq ft',  w:200, h:250, color:'#cffafe' },
  { id:'pooja',    label:'Pooja Room',   icon:'🪔',  area:'40–80 sq ft',   w:200, h:200, color:'#ffe4e6' },
]

// ─── Style themes ─────────────────────────────────────────────────────────────
const STYLES = [
  { id:'modern',      label:'Modern',      wallColor:'#f5f5f5', floorColor:'#c8b89a', accent:'#2d2d2d' },
  { id:'warm',        label:'Warm Beige',  wallColor:'#f5ede0', floorColor:'#b8956a', accent:'#8b4513' },
  { id:'nordic',      label:'Nordic',      wallColor:'#e8e8e8', floorColor:'#d4c4a8', accent:'#4a6fa5' },
  { id:'luxury',      label:'Luxury',      wallColor:'#1c1412', floorColor:'#8b7355', accent:'#c9a227' },
  { id:'mint',        label:'Fresh Mint',  wallColor:'#e8f5e9', floorColor:'#c8c8b8', accent:'#2e7d52' },
  { id:'terracotta',  label:'Terracotta',  wallColor:'#fde8dc', floorColor:'#c87941', accent:'#8b3a2a' },
]

// ─── Furniture catalog ────────────────────────────────────────────────────────
const CATALOG = [
  // Seating
  { id:'sofa3',      cat:'seating',  label:'3-Seat Sofa',    icon:'🛋',  w:160, h:60,  color:'#94a3b8' },
  { id:'sofa2',      cat:'seating',  label:'2-Seat Sofa',    icon:'🛋',  w:120, h:55,  color:'#94a3b8' },
  { id:'armchair',   cat:'seating',  label:'Arm Chair',      icon:'🪑',  w:65,  h:65,  color:'#a78bfa' },
  { id:'lounger',    cat:'seating',  label:'Lounger',        icon:'🛋',  w:150, h:55,  color:'#86efac' },
  // Bedroom
  { id:'bed_king',   cat:'bedroom',  label:'King Bed',       icon:'🛏',  w:170, h:200, color:'#fbbf24' },
  { id:'bed_queen',  cat:'bedroom',  label:'Queen Bed',      icon:'🛏',  w:150, h:180, color:'#fcd34d' },
  { id:'wardrobe',   cat:'bedroom',  label:'Wardrobe',       icon:'🗄',  w:180, h:55,  color:'#a16207' },
  { id:'dresser',    cat:'bedroom',  label:'Dresser',        icon:'🪞',  w:100, h:45,  color:'#ca8a04' },
  { id:'nightstand', cat:'bedroom',  label:'Nightstand',     icon:'🪴',  w:45,  h:45,  color:'#d97706' },
  // Dining
  { id:'table4',     cat:'dining',   label:'Dining Table 4', icon:'🍽',  w:120, h:80,  color:'#84cc16' },
  { id:'table6',     cat:'dining',   label:'Dining Table 6', icon:'🍽',  w:160, h:90,  color:'#65a30d' },
  { id:'chair_d',    cat:'dining',   label:'Dining Chair',   icon:'🪑',  w:40,  h:40,  color:'#4d7c0f' },
  // Tables / Storage
  { id:'coffee',     cat:'tables',   label:'Coffee Table',   icon:'☕',  w:100, h:55,  color:'#f97316' },
  { id:'side_tbl',   cat:'tables',   label:'Side Table',     icon:'🪵',  w:45,  h:45,  color:'#ea580c' },
  { id:'tv_unit',    cat:'tables',   label:'TV Unit',        icon:'📺',  w:160, h:40,  color:'#374151' },
  { id:'bookshelf',  cat:'tables',   label:'Bookshelf',      icon:'📚',  w:120, h:35,  color:'#713f12' },
  // Lighting
  { id:'floor_lamp', cat:'lighting', label:'Floor Lamp',     icon:'💡',  w:30,  h:30,  color:'#fef08a' },
  { id:'pendant',    cat:'lighting', label:'Pendant Light',  icon:'🔦',  w:40,  h:40,  color:'#fde68a' },
  // Decor
  { id:'plant_lg',   cat:'decor',    label:'Large Plant',    icon:'🌿',  w:50,  h:50,  color:'#16a34a' },
  { id:'plant_sm',   cat:'decor',    label:'Small Plant',    icon:'🪴',  w:35,  h:35,  color:'#15803d' },
  { id:'rug',        cat:'decor',    label:'Area Rug',       icon:'🔲',  w:180, h:120, color:'#dc2626', alpha:.4 },
  // Kitchen
  { id:'counter',    cat:'kitchen',  label:'Counter',        icon:'🍳',  w:200, h:55,  color:'#9ca3af' },
  { id:'island',     cat:'kitchen',  label:'Kitchen Island', icon:'🍽',  w:150, h:70,  color:'#6b7280' },
  { id:'fridge',     cat:'kitchen',  label:'Refrigerator',  icon:'❄️', w:70,  h:70,  color:'#d1d5db' },
  // Office
  { id:'desk',       cat:'office',   label:'Work Desk',      icon:'💻',  w:140, h:60,  color:'#0ea5e9' },
  { id:'office_ch',  cat:'office',   label:'Office Chair',   icon:'🪑',  w:55,  h:55,  color:'#0284c7' },
  { id:'cabinet',    cat:'office',   label:'File Cabinet',   icon:'🗂',  w:50,  h:60,  color:'#64748b' },
]

const CATS = [
  { id:'seating',  label:'Seating',  icon:'🛋' },
  { id:'bedroom',  label:'Bedroom',  icon:'🛏' },
  { id:'dining',   label:'Dining',   icon:'🍽' },
  { id:'tables',   label:'Tables',   icon:'☕' },
  { id:'lighting', label:'Lights',   icon:'💡' },
  { id:'decor',    label:'Decor',    icon:'🌿' },
  { id:'kitchen',  label:'Kitchen',  icon:'🍳' },
  { id:'office',   label:'Office',   icon:'💼' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _uid = 0
const uid = () => `item_${++_uid}`

function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function rotatePoint(cx, cy, x, y, rad) {
  const cos = Math.cos(rad), sin = Math.sin(rad)
  return [
    cos * (x - cx) - sin * (y - cy) + cx,
    sin * (x - cx) + cos * (y - cy) + cy,
  ]
}

function pointInRotatedRect(px, py, item, scale) {
  const cx = item.x * scale, cy = item.y * scale
  const hw = (item.w * scale) / 2, hh = (item.h * scale) / 2
  const rad = -(item.rotation || 0)
  const [lx, ly] = rotatePoint(cx, cy, px, py, rad)
  return lx >= cx - hw && lx <= cx + hw && ly >= cy - hh && ly <= cy + hh
}

// ─── Canvas renderer ──────────────────────────────────────────────────────────
function drawCanvas(canvas, room, items, selectedId, wallColor, floorColor, scale, pan) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height

  // Background
  ctx.fillStyle = B.canvas
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.translate(pan.x, pan.y)

  const rw = room.w * scale, rh = room.h * scale

  // Floor
  ctx.fillStyle = floorColor
  ctx.fillRect(0, 0, rw, rh)

  // Floor grid (subtle planks)
  ctx.strokeStyle = B.grid
  ctx.lineWidth = 1
  const gs = 30 * scale
  for (let x = 0; x <= rw; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rh); ctx.stroke() }
  for (let y = 0; y <= rh; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rw, y); ctx.stroke() }

  // Walls
  ctx.strokeStyle = B.wall
  ctx.lineWidth = Math.max(8 * scale, 4)
  ctx.strokeRect(0, 0, rw, rh)

  // Wall color tint on top/left (depth illusion)
  ctx.fillStyle = hexToRgba(wallColor, 0.25)
  ctx.fillRect(0, 0, rw, rh)

  // Wall stripe at top
  const wt = Math.max(20 * scale, 10)
  ctx.fillStyle = wallColor
  ctx.fillRect(0, 0, rw, wt)
  ctx.fillRect(0, 0, wt, rh)
  ctx.fillRect(rw - wt, 0, wt, rh)

  // Dimension labels
  ctx.fillStyle = B.muted
  ctx.font = `${Math.max(11, 11 * scale)}px system-ui,sans-serif`
  ctx.textAlign = 'center'
  const ftW = Math.round(room.w / 30.48)  // cm → ft
  const ftH = Math.round(room.h / 30.48)
  ctx.fillText(`${ftW} ft`, rw / 2, -8)
  ctx.save()
  ctx.translate(-8, rh / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(`${ftH} ft`, 0, 0)
  ctx.restore()

  // Items (back to front by y)
  const sorted = [...items].sort((a, b) => a.y - b.y)
  sorted.forEach(item => {
    const cx = item.x * scale, cy = item.y * scale
    const iw = item.w * scale, ih = item.h * scale
    const rad = item.rotation || 0

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rad)

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.18)'
    ctx.shadowBlur = 8 * scale
    ctx.shadowOffsetY = 3 * scale

    // Body
    const alpha = item.alpha || 0.9
    ctx.fillStyle = hexToRgba(item.color, alpha)
    const r = Math.max(4 * scale, 2)
    ctx.beginPath()
    ctx.roundRect(-iw / 2, -ih / 2, iw, ih, r)
    ctx.fill()

    ctx.shadowColor = 'transparent'

    // Selection ring
    if (item.id === selectedId) {
      ctx.strokeStyle = B.select
      ctx.lineWidth = Math.max(2.5, 2.5 * scale)
      ctx.setLineDash([6 * scale, 3 * scale])
      ctx.beginPath()
      ctx.roundRect(-iw / 2 - 3, -ih / 2 - 3, iw + 6, ih + 6, r + 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Rotation handle
      ctx.fillStyle = B.gold
      ctx.beginPath()
      ctx.arc(0, -ih / 2 - 14 * scale, 6 * scale, 0, Math.PI * 2)
      ctx.fill()
    }

    // Stripe detail (depth)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.beginPath()
    ctx.roundRect(-iw / 2, -ih / 2, iw, ih * 0.15, [r, r, 0, 0])
    ctx.fill()

    // Icon
    ctx.font = `${Math.max(14, Math.min(iw, ih) * 0.35)}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'transparent'
    ctx.fillText(item.icon, 0, 0)

    // Label
    if (iw > 40 * scale) {
      ctx.font = `bold ${Math.max(8, 9 * scale)}px system-ui,sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(item.label, 0, ih / 2 - 6 * scale)
    }

    ctx.restore()
  })

  ctx.restore()
}

// ─── Sidebar Item (draggable card) ────────────────────────────────────────────
function FurnitureCard({ item, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, item)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '10px 8px', background: B.white, border: `1px solid ${B.border}`,
        borderRadius: 10, cursor: 'grab', userSelect: 'none', transition: 'all .15s',
        minWidth: 72,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = B.gold; e.currentTarget.style.transform = 'scale(1.04)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.transform = 'scale(1)' }}
    >
      <span style={{ fontSize: 22 }}>{item.icon}</span>
      <span style={{ fontSize: 10, color: B.muted, textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
    </div>
  )
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────
function Swatch({ color, active, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: '50%', border: active ? `3px solid ${B.gold}` : '2px solid transparent',
        background: color, cursor: 'pointer', outline: 'none', boxSizing: 'border-box',
        boxShadow: active ? `0 0 0 2px ${B.white}, 0 0 0 4px ${B.gold}` : '0 1px 3px rgba(0,0,0,.2)',
        transition: 'all .15s',
      }}
    />
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyDesignPage() {
  const [step, setStep] = useState(0) // 0=pick room, 1=style, 2=design
  const [roomType, setRoomType] = useState(null)
  const [style, setStyle] = useState(STYLES[0])
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activeCat, setActiveCat] = useState('seating')
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 60, y: 60 })
  const [draggingNew, setDraggingNew] = useState(null)
  const [draggingItem, setDraggingItem] = useState(null) // { id, offX, offY }
  const [rotatingItem, setRotatingItem] = useState(null)
  const [wallColor, setWallColor] = useState('#f5f5f5')
  const [floorColor, setFloorColor] = useState('#c8b89a')
  const [showSaved, setShowSaved] = useState(false)
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  const room = roomType || ROOMS[0]

  // ── Apply style theme ──────────────────────────────────────────────────────
  const applyStyle = useCallback(s => {
    setStyle(s)
    setWallColor(s.wallColor)
    setFloorColor(s.floorColor)
  }, [])

  // ── Redraw canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || step < 2) return
    const wrap = wrapRef.current
    const W = wrap?.clientWidth || 800
    const H = wrap?.clientHeight || 600
    canvas.width = W
    canvas.height = H
    drawCanvas(canvas, room, items, selectedId, wallColor, floorColor, scale, pan)
  }, [items, selectedId, scale, pan, wallColor, floorColor, room, step])

  // ── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (step < 2) return
    const obs = new ResizeObserver(() => {
      const canvas = canvasRef.current; const wrap = wrapRef.current
      if (!canvas || !wrap) return
      canvas.width = wrap.clientWidth; canvas.height = wrap.clientHeight
      drawCanvas(canvas, room, items, selectedId, wallColor, floorColor, scale, pan)
    })
    if (wrapRef.current) obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [step, items, selectedId, scale, pan, wallColor, floorColor, room])

  // ── Canvas coords from event ───────────────────────────────────────────────
  const canvasXY = useCallback(e => {
    const rect = canvasRef.current.getBoundingClientRect()
    return [
      (e.clientX - rect.left - pan.x) / scale,
      (e.clientY - rect.top  - pan.y) / scale,
    ]
  }, [pan, scale])

  // ── Mouse events on canvas ─────────────────────────────────────────────────
  const handleMouseDown = useCallback(e => {
    if (e.button !== 0) return
    const [mx, my] = canvasXY(e)

    // Check rotation handle of selected item
    if (selectedId) {
      const sel = items.find(i => i.id === selectedId)
      if (sel) {
        const cx = sel.x, cy = sel.y
        const rad = sel.rotation || 0
        const hx = cx, hy = cy - sel.h / 2 - 14
        const [rhx, rhy] = rotatePoint(cx, cy, hx, hy, rad)
        const dist = Math.hypot(mx - rhx, my - rhy)
        if (dist < 12 / scale) {
          setRotatingItem({ id: selectedId, cx, cy })
          return
        }
      }
    }

    // Hit test items (reverse order — top item first)
    const reversed = [...items].reverse()
    const hit = reversed.find(it => pointInRotatedRect(mx, my, it, 1))
    if (hit) {
      setSelectedId(hit.id)
      setDraggingItem({ id: hit.id, offX: mx - hit.x, offY: my - hit.y })
    } else {
      setSelectedId(null)
    }
  }, [canvasXY, items, selectedId])

  const handleMouseMove = useCallback(e => {
    if (draggingItem) {
      const [mx, my] = canvasXY(e)
      setItems(prev => prev.map(it =>
        it.id === draggingItem.id
          ? { ...it, x: Math.max(it.w/2, Math.min(room.w - it.w/2, mx - draggingItem.offX)),
                     y: Math.max(it.h/2, Math.min(room.h - it.h/2, my - draggingItem.offY)) }
          : it
      ))
    }
    if (rotatingItem) {
      const [mx, my] = canvasXY(e)
      const angle = Math.atan2(my - rotatingItem.cy, mx - rotatingItem.cx) + Math.PI / 2
      setItems(prev => prev.map(it => it.id === rotatingItem.id ? { ...it, rotation: angle } : it))
    }
  }, [draggingItem, rotatingItem, canvasXY, room])

  const handleMouseUp = useCallback(() => {
    setDraggingItem(null)
    setRotatingItem(null)
  }, [])

  // ── Drag from sidebar → canvas ─────────────────────────────────────────────
  const handleSidebarDragStart = useCallback((e, catalogItem) => {
    setDraggingNew(catalogItem)
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', catalogItem.id)
  }, [])

  const handleCanvasDrop = useCallback(e => {
    e.preventDefault()
    if (!draggingNew) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / scale
    const y = (e.clientY - rect.top  - pan.y) / scale
    const clamped = {
      x: Math.max(draggingNew.w / 2, Math.min(room.w - draggingNew.w / 2, x)),
      y: Math.max(draggingNew.h / 2, Math.min(room.h - draggingNew.h / 2, y)),
    }
    const newItem = { ...draggingNew, id: uid(), x: clamped.x, y: clamped.y, rotation: 0 }
    setItems(prev => [...prev, newItem])
    setSelectedId(newItem.id)
    setDraggingNew(null)
  }, [draggingNew, pan, scale, room])

  const handleDragOver = e => e.preventDefault()

  // ── Scroll to zoom ─────────────────────────────────────────────────────────
  const handleWheel = useCallback(e => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setScale(s => Math.max(0.3, Math.min(3, s * factor)))
  }, [])

  // ── Keyboard: delete, undo ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        if (document.activeElement.tagName === 'INPUT') return
        setItems(prev => prev.filter(i => i.id !== selectedId))
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId])

  // ── Save as PNG ────────────────────────────────────────────────────────────
  const saveDesign = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${room.label || 'my-room'}-design.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2500)
  }, [room])

  // ── Selected item helpers ──────────────────────────────────────────────────
  const selectedItem = items.find(i => i.id === selectedId)

  const updateSelected = useCallback(patch => {
    setItems(prev => prev.map(it => it.id === selectedId ? { ...it, ...patch } : it))
  }, [selectedId])

  const rotateSelected = useCallback(deg => {
    updateSelected({ rotation: ((selectedItem?.rotation || 0) + (deg * Math.PI / 180)) })
  }, [selectedItem, updateSelected])

  const deleteSelected = useCallback(() => {
    setItems(prev => prev.filter(i => i.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetCanvas = () => { setItems([]); setSelectedId(null) }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 0 — Pick Room
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={{ minHeight: '100vh', background: B.bg, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      {/* Nav */}
      <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${B.border}`, background: B.white }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: B.gold, letterSpacing: '-0.5px' }}>El Shaddai</span>
          <span style={{ fontSize: 12, color: B.muted, borderLeft: `1px solid ${B.border}`, paddingLeft: 10 }}>Room Designer</span>
        </a>
        <a href="/studio" style={{ fontSize: 13, color: B.gold, fontWeight: 600, textDecoration: 'none' }}>← Back to Studio</a>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <div style={{ display: 'inline-block', background: hexToRgba(B.gold, 0.12), color: B.gold,
          padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
          Free Room Designer — No Account Needed
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: B.text,
          margin: '0 0 16px', letterSpacing: '-1px', lineHeight: 1.1 }}>
          Design Your Dream Room<br />
          <span style={{ color: B.gold }}>In Minutes</span>
        </h1>
        <p style={{ fontSize: 16, color: B.muted, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Drag furniture, swap colors, and see your room come alive.
          No experience needed — just pick your room and start.
        </p>

        {/* Step pills */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
          {['1. Pick Room', '2. Choose Style', '3. Design & Arrange'].map((s, i) => (
            <div key={i} style={{ background: i === 0 ? B.gold : B.white, color: i === 0 ? B.white : B.muted,
              border: `1px solid ${B.border}`, padding: '8px 18px', borderRadius: 24,
              fontSize: 13, fontWeight: i === 0 ? 700 : 400 }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Room grid */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: B.text, marginBottom: 20, textAlign: 'center' }}>
          Which room do you want to design?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
          {ROOMS.map(r => (
            <button
              key={r.id}
              onClick={() => { setRoomType(r); setStep(1) }}
              style={{
                background: B.white, border: `2px solid ${B.border}`, borderRadius: 16,
                padding: '28px 16px', cursor: 'pointer', transition: 'all .2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = B.gold; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(196,149,106,.18)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: r.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {r.icon}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: B.text }}>{r.label}</span>
              <span style={{ fontSize: 11, color: B.muted }}>{r.area}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1 — Pick Style
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ minHeight: '100vh', background: B.bg, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      {/* Nav */}
      <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${B.border}`, background: B.white }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: B.gold }}>El Shaddai</span>
        <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: B.muted }}>← Back</button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{room.icon}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: B.text, margin: '0 0 8px' }}>
            {room.label}
          </h2>
          <p style={{ color: B.muted, margin: 0 }}>Choose a style theme to start with</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 40 }}>
          {STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => { applyStyle(s); setStyle(s) }}
              style={{
                background: B.white, border: `2px solid ${style.id === s.id ? B.gold : B.border}`,
                borderRadius: 14, padding: '20px 16px', cursor: 'pointer', transition: 'all .18s',
                display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left',
                boxShadow: style.id === s.id ? `0 4px 16px rgba(196,149,106,.25)` : 'none',
              }}
              onMouseEnter={e => { if (style.id !== s.id) e.currentTarget.style.borderColor = hexToRgba(B.gold, 0.4) }}
              onMouseLeave={e => { if (style.id !== s.id) e.currentTarget.style.borderColor = B.border }}
            >
              {/* Color preview bar */}
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ flex: 2, height: 36, borderRadius: 8, background: s.wallColor, border: `1px solid ${B.border}` }} />
                <div style={{ flex: 2, height: 36, borderRadius: 8, background: s.floorColor }} />
                <div style={{ flex: 1, height: 36, borderRadius: 8, background: s.accent }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: B.text }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Wall / Floor color pickers */}
        <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: B.text }}>Customise Colors</h3>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: B.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Wall Color</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['#f5f5f5','#f5ede0','#e8e8e8','#1c1412','#e8f5e9','#fde8dc','#e3f0ff','#fff8e1'].map(c => (
                  <Swatch key={c} color={c} active={wallColor === c} onClick={() => setWallColor(c)} title={c} />
                ))}
                <input type="color" value={wallColor} onChange={e => setWallColor(e.target.value)}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0 }} />
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: B.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Floor Color</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['#c8b89a','#8b7355','#d4c4a8','#b8956a','#c8c8b8','#c87941','#e8d8c0','#f0e8d0'].map(c => (
                  <Swatch key={c} color={c} active={floorColor === c} onClick={() => setFloorColor(c)} title={c} />
                ))}
                <input type="color" value={floorColor} onChange={e => setFloorColor(e.target.value)}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0 }} />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setStep(2); setScale(0.85); setPan({ x: 60, y: 60 }) }}
          style={{
            width: '100%', background: B.gold, border: 'none', borderRadius: 14,
            padding: '18px', fontSize: 17, fontWeight: 800, color: B.white,
            cursor: 'pointer', letterSpacing: '0.02em', transition: 'background .18s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = B.goldD}
          onMouseLeave={e => e.currentTarget.style.background = B.gold}
        >
          Start Designing →
        </button>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2 — Design Canvas
  // ─────────────────────────────────────────────────────────────────────────────
  const catItems = CATALOG.filter(c => c.cat === activeCat)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans',system-ui,sans-serif", background: B.bg, overflow: 'hidden' }}>

      {/* ── Top toolbar ──────────────────────────────────────────────────── */}
      <div style={{
        height: 54, background: B.white, borderBottom: `1px solid ${B.border}`,
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0,
      }}>
        <a href="/" style={{ fontSize: 18, fontWeight: 800, color: B.gold, textDecoration: 'none', marginRight: 8 }}>
          El Shaddai
        </a>
        <span style={{ color: B.border }}>|</span>
        <span style={{ fontSize: 13, color: B.text, fontWeight: 600 }}>{room.icon} {room.label}</span>
        <span style={{ color: B.border }}>|</span>

        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <ToolBtn icon="−" title="Zoom out" onClick={() => setScale(s => Math.max(0.3, s * 0.85))} />
          <span style={{ fontSize: 11, color: B.muted, minWidth: 38, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <ToolBtn icon="+" title="Zoom in" onClick={() => setScale(s => Math.min(3, s * 1.15))} />
          <ToolBtn icon="⊡" title="Fit to screen" onClick={() => { setScale(0.85); setPan({ x: 60, y: 60 }) }} />
        </div>

        <span style={{ color: B.border }}>|</span>

        {/* Wall / Floor color quick pickers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: B.muted }}>Wall</span>
          <input type="color" value={wallColor} onChange={e => setWallColor(e.target.value)}
            style={{ width: 24, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
          <span style={{ fontSize: 11, color: B.muted }}>Floor</span>
          <input type="color" value={floorColor} onChange={e => setFloorColor(e.target.value)}
            style={{ width: 24, height: 24, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
        </div>

        <span style={{ color: B.border }}>|</span>
        <ToolBtn icon="🗑" title="Clear all" onClick={resetCanvas} />

        <div style={{ flex: 1 }} />

        {/* Save */}
        <button
          onClick={saveDesign}
          style={{ background: B.gold, border: 'none', borderRadius: 8, padding: '8px 20px',
            fontSize: 13, fontWeight: 700, color: B.white, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6 }}>
          ⬇ Save Design
        </button>
        {showSaved && (
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Saved!</span>
        )}
      </div>

      {/* ── Body: sidebar + canvas + properties ──────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left sidebar: furniture catalog ──────────────────────────── */}
        <div style={{ width: 220, background: B.sidebar, borderRight: `1px solid ${B.border}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>

          {/* Category tabs */}
          <div style={{ padding: '10px 8px 8px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {CATS.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                style={{
                  flex: '1 0 calc(50% - 4px)', padding: '6px 4px', border: 'none', borderRadius: 8,
                  background: activeCat === c.id ? B.gold : B.white,
                  color: activeCat === c.id ? B.white : B.muted,
                  fontSize: 11, fontWeight: activeCat === c.id ? 700 : 400,
                  cursor: 'pointer', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <span>{c.icon}</span><span>{c.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '4px 8px 6px', fontSize: 10, color: B.muted, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Drag to add ↓
          </div>

          {/* Item grid */}
          <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {catItems.map(item => (
                <FurnitureCard key={item.id} item={item} onDragStart={handleSidebarDragStart} />
              ))}
            </div>
          </div>

          {/* Tip */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${B.border}`,
            fontSize: 11, color: B.muted, lineHeight: 1.5 }}>
            💡 Drag items onto the canvas. Click to select. Delete key removes selected.
          </div>
        </div>

        {/* ── Canvas area ────────────────────────────────────────────────── */}
        <div
          ref={wrapRef}
          style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: draggingItem || rotatingItem ? 'grabbing' : 'default' }}
          onDrop={handleCanvasDrop}
          onDragOver={handleDragOver}
          onWheel={handleWheel}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Empty state hint */}
          {items.length === 0 && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: .4 }}>🛋</div>
              <p style={{ fontSize: 14, color: B.muted, margin: 0 }}>
                Drag furniture from the left panel<br />and drop it into your room
              </p>
            </div>
          )}

          {/* Zoom hint */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 10,
            color: B.muted, background: 'rgba(255,255,255,.8)', padding: '4px 8px', borderRadius: 6 }}>
            Scroll to zoom
          </div>
        </div>

        {/* ── Right panel: properties ────────────────────────────────────── */}
        <div style={{ width: 200, background: B.white, borderLeft: `1px solid ${B.border}`,
          display: 'flex', flexDirection: 'column', overflow: 'auto', flexShrink: 0 }}>

          <div style={{ padding: '14px 14px 8px', borderBottom: `1px solid ${B.border}` }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: B.text,
              textTransform: 'uppercase', letterSpacing: '.08em' }}>Properties</p>
          </div>

          {selectedItem ? (
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>{selectedItem.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: B.text }}>{selectedItem.label}</div>
              </div>

              {/* Color */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: B.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Color</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['#94a3b8','#fbbf24','#34d399','#f87171','#a78bfa','#fb923c','#38bdf8','#f472b6','#84cc16','#6b7280','#a16207','#1e3a5f'].map(c => (
                    <Swatch key={c} color={c} active={selectedItem.color === c}
                      onClick={() => updateSelected({ color: c })} title={c} />
                  ))}
                  <input type="color" value={selectedItem.color}
                    onChange={e => updateSelected({ color: e.target.value })}
                    style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 0 }} />
                </div>
              </div>

              {/* Rotate */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: B.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Rotate</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <PropBtn onClick={() => rotateSelected(-90)}>↺ 90°</PropBtn>
                  <PropBtn onClick={() => rotateSelected(90)}>↻ 90°</PropBtn>
                </div>
                <div style={{ marginTop: 6 }}>
                  <PropBtn onClick={() => rotateSelected(-15)}>↺ 15°</PropBtn>
                  <PropBtn onClick={() => rotateSelected(15)} style={{ marginLeft: 6 }}>↻ 15°</PropBtn>
                </div>
              </div>

              {/* Size */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: B.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Size</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <PropBtn onClick={() => updateSelected({ w: selectedItem.w * 0.9, h: selectedItem.h * 0.9 })}>− Shrink</PropBtn>
                  <PropBtn onClick={() => updateSelected({ w: selectedItem.w * 1.1, h: selectedItem.h * 1.1 })}>+ Grow</PropBtn>
                </div>
              </div>

              {/* Opacity (for rugs) */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: B.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Opacity: {Math.round((selectedItem.alpha || 0.9) * 100)}%
                </p>
                <input type="range" min={20} max={100} value={Math.round((selectedItem.alpha || 0.9) * 100)}
                  onChange={e => updateSelected({ alpha: parseInt(e.target.value) / 100 })}
                  style={{ width: '100%', accentColor: B.gold }} />
              </div>

              {/* Delete */}
              <button
                onClick={deleteSelected}
                style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                  padding: '8px', fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
                🗑 Remove Item
              </button>
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: B.muted, fontSize: 12, lineHeight: 1.6, marginTop: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
              Click any item on the canvas to edit its color, size, and rotation
            </div>
          )}

          {/* Style quick switch */}
          <div style={{ marginTop: 'auto', borderTop: `1px solid ${B.border}`, padding: 12 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: B.muted, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '.06em' }}>Quick Style</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {STYLES.map(s => (
                <button key={s.id} onClick={() => applyStyle(s)}
                  style={{ background: style.id === s.id ? hexToRgba(B.gold, 0.12) : 'transparent',
                    border: `1px solid ${style.id === s.id ? B.gold : B.border}`,
                    borderRadius: 7, padding: '6px 10px', cursor: 'pointer', fontSize: 12,
                    fontWeight: style.id === s.id ? 700 : 400,
                    color: style.id === s.id ? B.gold : B.muted,
                    display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: s.wallColor, border: `1px solid ${B.border}` }} />
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: s.floorColor }} />
                    <div style={{ width: 6, height: 10, borderRadius: 2, background: s.accent }} />
                  </div>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Back button */}
          <div style={{ padding: '8px 12px 12px' }}>
            <button onClick={() => setStep(1)} style={{ width: '100%', background: 'none',
              border: `1px solid ${B.border}`, borderRadius: 8, padding: '7px',
              fontSize: 12, color: B.muted, cursor: 'pointer' }}>
              ← Change Style
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tiny shared button components ───────────────────────────────────────────
function ToolBtn({ icon, title, onClick }) {
  return (
    <button onClick={onClick} title={title}
      style={{ background: 'none', border: `1px solid ${B.border}`, borderRadius: 7,
        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 14, color: B.text, transition: 'all .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = B.gold}
      onMouseLeave={e => e.currentTarget.style.borderColor = B.border}
    >
      {icon}
    </button>
  )
}

function PropBtn({ children, onClick, style: s }) {
  return (
    <button onClick={onClick}
      style={{ flex: 1, background: B.sidebar, border: `1px solid ${B.border}`, borderRadius: 7,
        padding: '6px 4px', fontSize: 11, color: B.text, cursor: 'pointer',
        fontWeight: 600, ...s }}
      onMouseEnter={e => e.currentTarget.style.borderColor = B.gold}
      onMouseLeave={e => e.currentTarget.style.borderColor = B.border}
    >
      {children}
    </button>
  )
}
