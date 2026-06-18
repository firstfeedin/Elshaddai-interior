import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Design Tokens ──────────────────────────────────────────────── */
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const bdr    = '#292524'
const bg     = '#0d0b09'
const serif  = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const sans   = { fontFamily:"'DM Sans',system-ui,sans-serif" }

/* ─── Constants ──────────────────────────────────────────────────── */
const SCALE   = 60   // px per meter
const SNAP    = 15   // snap grid (0.25m)
const WALL_H  = 2.8  // wall height meters
const WALL_T  = 0.15 // wall thickness meters
const NODE_R  = 8    // node snap radius px

/* ─── Furniture Library ──────────────────────────────────────────── */
const FURNITURE = [
  { type:'sofa',       label:'Sofa',         w:2.2, d:0.9, color:'#6b7280', icon:'🛋' },
  { type:'bed_double', label:'Double Bed',   w:1.8, d:2.0, color:'#8b5e3c', icon:'🛏' },
  { type:'bed_single', label:'Single Bed',   w:0.9, d:2.0, color:'#a0785a', icon:'🛏' },
  { type:'dining',     label:'Dining Table', w:1.4, d:0.8, color:'#92400e', icon:'🪑' },
  { type:'wardrobe',   label:'Wardrobe',     w:1.8, d:0.6, color:'#78350f', icon:'🗄' },
  { type:'kitchen',    label:'Kitchen Top',  w:2.4, d:0.6, color:'#374151', icon:'🍳' },
  { type:'bathtub',    label:'Bathtub',      w:1.7, d:0.8, color:'#e2e8f0', icon:'🛁' },
  { type:'toilet',     label:'Toilet',       w:0.5, d:0.7, color:'#f1f5f9', icon:'🚽' },
  { type:'desk',       label:'Study Desk',   w:1.2, d:0.6, color:'#d97706', icon:'🖥' },
  { type:'tv_unit',    label:'TV Unit',      w:1.8, d:0.4, color:'#1f2937', icon:'📺' },
  { type:'chair',      label:'Chair',        w:0.6, d:0.6, color:'#4b5563', icon:'🪑' },
  { type:'plant',      label:'Plant',        w:0.5, d:0.5, color:'#166534', icon:'🌿' },
]

/* ─── Snap Helpers ───────────────────────────────────────────────── */
function snapToGrid(v) { return Math.round(v / SNAP) * SNAP }
function dist(x1,y1,x2,y2) { return Math.sqrt((x2-x1)**2+(y2-y1)**2) }
function nearestNode(x, y, walls, threshold=NODE_R*1.5) {
  const pts = []
  walls.forEach(w => { pts.push({x:w.x1,y:w.y1}); pts.push({x:w.x2,y:w.y2}) })
  let best=null, bd=Infinity
  pts.forEach(p => { const d=dist(x,y,p.x,p.y); if(d<bd&&d<threshold){bd=d;best=p} })
  return best
}

/* ─── Room Detection ─────────────────────────────────────────────── */
function detectRooms(walls) {
  if (walls.length < 3) return []
  const adjMap = {}
  walls.forEach(w => {
    const k1=`${w.x1},${w.y1}`, k2=`${w.x2},${w.y2}`
    if (!adjMap[k1]) adjMap[k1]=[]
    if (!adjMap[k2]) adjMap[k2]=[]
    adjMap[k1].push({x:w.x2,y:w.y2,key:k2})
    adjMap[k2].push({x:w.x1,y:w.y1,key:k1})
  })
  const rooms=[], visited=new Set()
  Object.entries(adjMap).forEach(([startKey, neighbors]) => {
    if (neighbors.length < 2) return
    const [sx,sy] = startKey.split(',').map(Number)
    neighbors.forEach(nb => {
      const path=[{x:sx,y:sy,key:startKey}]
      const edgeVisited=new Set([`${startKey}->${nb.key}`])
      let cur=nb, prev={x:sx,y:sy,key:startKey}
      for(let i=0;i<20;i++){
        path.push({x:cur.x,y:cur.y,key:cur.key})
        if(cur.key===startKey&&path.length>3){
          const sortedKeys=[...path.map(p=>p.key)].sort().join('|')
          if(!visited.has(sortedKeys)){
            visited.add(sortedKeys)
            rooms.push(path.map(p=>({x:p.x,y:p.y})))
          }
          break
        }
        const nexts=(adjMap[cur.key]||[]).filter(n=>n.key!==prev.key)
        if(!nexts.length) break
        const next=nexts[0]
        const ek=`${cur.key}->${next.key}`
        if(edgeVisited.has(ek)) break
        edgeVisited.add(ek)
        prev=cur; cur=next
      }
    })
  })
  return rooms.filter(r=>r.length>=4)
}

/* ─── 3D Wall Mesh ───────────────────────────────────────────────── */
function Wall3D({ wall, selected }) {
  const x1=wall.x1/SCALE, z1=wall.y1/SCALE
  const x2=wall.x2/SCALE, z2=wall.y2/SCALE
  const cx=(x1+x2)/2, cz=(z1+z2)/2
  const len=Math.sqrt((x2-x1)**2+(z2-z1)**2)
  const angle=Math.atan2(z2-z1, x2-x1)
  return (
    <mesh position={[cx, WALL_H/2, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[len, WALL_H, WALL_T]} />
      <meshLambertMaterial color={selected?'#c9a227':'#d6d0c8'} />
    </mesh>
  )
}

/* ─── 3D Floor Mesh ──────────────────────────────────────────────── */
function Floor3D({ vertices }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    if (!vertices.length) return s
    s.moveTo(vertices[0].x/SCALE, vertices[0].y/SCALE)
    vertices.slice(1).forEach(v => s.lineTo(v.x/SCALE, v.y/SCALE))
    s.closePath()
    return s
  }, [vertices])
  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshLambertMaterial color="#f5f0e8" side={THREE.DoubleSide} />
    </mesh>
  )
}

/* ─── 3D Furniture ───────────────────────────────────────────────── */
function Furniture3D({ item }) {
  const x=item.x/SCALE, z=item.y/SCALE
  const w=item.fw, d=item.fd
  return (
    <mesh position={[x+w/2, 0.4, z+d/2]} rotation={[0, -(item.rot||0)*Math.PI/180, 0]} castShadow>
      <boxGeometry args={[w, 0.8, d]} />
      <meshLambertMaterial color={item.color} />
    </mesh>
  )
}

/* ─── 3D Scene ───────────────────────────────────────────────────── */
function Scene3D({ walls, furniture, rooms, selectedWall }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 10, 12]} fov={50} />
      <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI/2.1} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10,20,10]} intensity={1} castShadow shadow-mapSize={[2048,2048]} />
      <directionalLight position={[-10,10,-5]} intensity={0.3} />
      <Grid args={[30,30]} cellSize={1} cellColor="#44403c" sectionColor="#57534e" fadeDistance={40} position={[0,-0.01,0]} />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]} receiveShadow>
        <planeGeometry args={[60,60]} />
        <meshLambertMaterial color="#1a1713" />
      </mesh>
      {walls.map(w => <Wall3D key={w.id} wall={w} selected={w.id===selectedWall} />)}
      {rooms.map((r,i) => <Floor3D key={i} vertices={r} />)}
      {furniture.map(f => <Furniture3D key={f.id} item={f} />)}
    </>
  )
}

/* ─── 2D Canvas Component ────────────────────────────────────────── */
function Canvas2D({ walls, furniture, rooms, tool, selectedItem, onWallAdd, onWallSelect, onFurnitureAdd, onFurnitureSelect, onFurnitureMove, pendingFurniture }) {
  const canvasRef = useRef(null)
  const drawing   = useRef({ active:false, x1:0, y1:0, mx:0, my:0 })
  const dragging  = useRef({ active:false, id:null, ox:0, oy:0 })
  const [mousePos, setMousePos] = useState({x:0,y:0})
  const [snapNode, setSnapNode]  = useState(null)

  function getPos(e) {
    const r = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    ctx.clearRect(0,0,W,H)
    ctx.fillStyle = '#13110e'
    ctx.fillRect(0,0,W,H)

    // Grid
    ctx.strokeStyle = '#1f1c18'; ctx.lineWidth = 0.5
    for (let x=0; x<W; x+=SNAP) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
    for (let y=0; y<H; y+=SNAP) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

    // Grid labels (meters)
    ctx.fillStyle='#2d2926'; ctx.font='9px DM Sans'; ctx.textAlign='center'
    for (let x=0;x<W;x+=SCALE) ctx.fillText(`${x/SCALE}m`, x+SCALE/2, 12)
    for (let y=0;y<H;y+=SCALE) { ctx.textAlign='left'; ctx.fillText(`${y/SCALE}m`, 4, y+SCALE/2) }

    // Detected room fills
    rooms.forEach(room => {
      ctx.beginPath()
      ctx.moveTo(room[0].x, room[0].y)
      room.slice(1).forEach(v => ctx.lineTo(v.x, v.y))
      ctx.closePath()
      ctx.fillStyle = 'rgba(201,162,39,0.06)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(201,162,39,0.15)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    })

    // Walls
    walls.forEach(w => {
      const sel = w.id === selectedItem
      ctx.beginPath()
      ctx.moveTo(w.x1, w.y1)
      ctx.lineTo(w.x2, w.y2)
      ctx.strokeStyle = sel ? gold : '#a8a29e'
      ctx.lineWidth   = sel ? 5 : 4
      ctx.lineCap     = 'round'
      ctx.stroke()

      // Dimension label
      const len = dist(w.x1,w.y1,w.x2,w.y2)/SCALE
      const mx=(w.x1+w.x2)/2, my=(w.y1+w.y2)/2
      ctx.save()
      ctx.translate(mx, my)
      ctx.fillStyle = '#78716c'; ctx.font='10px DM Sans'; ctx.textAlign='center'
      ctx.fillText(`${len.toFixed(1)}m`, 0, -8)
      ctx.restore()

      // End nodes
      ;[[w.x1,w.y1],[w.x2,w.y2]].forEach(([nx,ny]) => {
        ctx.beginPath(); ctx.arc(nx,ny,4,0,Math.PI*2)
        ctx.fillStyle=sel?gold:'#57534e'; ctx.fill()
      })
    })

    // Active drawing preview
    if (drawing.current.active && tool==='wall') {
      const sn = snapNode
      const ex = sn ? sn.x : mousePos.x
      const ey = sn ? sn.y : mousePos.y
      ctx.beginPath()
      ctx.moveTo(drawing.current.x1, drawing.current.y1)
      ctx.lineTo(ex, ey)
      ctx.strokeStyle = gold; ctx.lineWidth = 3
      ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([])
      const len=dist(drawing.current.x1,drawing.current.y1,ex,ey)/SCALE
      ctx.fillStyle=gold; ctx.font='11px DM Sans'; ctx.textAlign='center'
      ctx.fillText(`${len.toFixed(1)}m`, (drawing.current.x1+ex)/2, (drawing.current.y1+ey)/2-10)
    }

    // Furniture items
    furniture.forEach(f => {
      const sel = f.id===selectedItem
      const pw=f.fw*SCALE, pd=f.fd*SCALE
      ctx.save()
      ctx.translate(f.x + pw/2, f.y + pd/2)
      ctx.rotate((f.rot||0)*Math.PI/180)
      ctx.fillStyle = sel ? 'rgba(201,162,39,0.25)' : 'rgba(255,255,255,0.06)'
      ctx.strokeStyle = sel ? gold : '#57534e'
      ctx.lineWidth = sel ? 2 : 1.5
      ctx.fillRect(-pw/2, -pd/2, pw, pd)
      ctx.strokeRect(-pw/2, -pd/2, pw, pd)
      ctx.fillStyle = sel ? gold : '#a8a29e'
      ctx.font=`${Math.min(pw,pd)*0.3}px DM Sans`; ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText(f.icon, 0, -4)
      ctx.font='9px DM Sans'; ctx.fillStyle='#78716c'
      ctx.fillText(f.label, 0, pd/2-12)
      ctx.restore()
    })

    // Pending furniture ghost
    if (pendingFurniture && tool==='furniture') {
      const pf = pendingFurniture
      const pw=pf.w*SCALE, pd=pf.d*SCALE
      ctx.save()
      ctx.translate(mousePos.x, mousePos.y)
      ctx.fillStyle='rgba(201,162,39,0.15)'
      ctx.strokeStyle=gold; ctx.lineWidth=1.5; ctx.setLineDash([4,3])
      ctx.fillRect(-pw/2,-pd/2,pw,pd)
      ctx.strokeRect(-pw/2,-pd/2,pw,pd)
      ctx.setLineDash([])
      ctx.fillStyle=gold; ctx.font=`${Math.min(pw,pd)*0.3}px DM Sans`; ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText(pf.icon, 0, 0)
      ctx.restore()
    }

    // Snap node highlight
    if (snapNode) {
      ctx.beginPath(); ctx.arc(snapNode.x,snapNode.y,NODE_R,0,Math.PI*2)
      ctx.strokeStyle=gold; ctx.lineWidth=2; ctx.stroke()
    }
  }

  useEffect(() => { draw() }, [walls, furniture, rooms, mousePos, snapNode, selectedItem, pendingFurniture, tool])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; draw() }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  function onMouseDown(e) {
    const {x,y} = getPos(e)
    const sg = snapToGrid

    if (tool==='wall') {
      const sn = nearestNode(x,y,walls)
      const sx = sn ? sn.x : sg(x)
      const sy = sn ? sn.y : sg(y)
      drawing.current = { active:true, x1:sx, y1:sy, mx:x, my:y }
      return
    }

    if (tool==='furniture' && pendingFurniture) {
      onFurnitureAdd({ x:sg(x)-pendingFurniture.w*SCALE/2, y:sg(y)-pendingFurniture.d*SCALE/2 })
      return
    }

    if (tool==='select') {
      // Check furniture first
      const hitF = [...furniture].reverse().find(f => {
        const pw=f.fw*SCALE, pd=f.fd*SCALE
        return x>=f.x && x<=f.x+pw && y>=f.y && y<=f.y+pd
      })
      if (hitF) { onFurnitureSelect(hitF.id); dragging.current={active:true,id:hitF.id,ox:x-hitF.x,oy:y-hitF.y}; return }
      // Check walls
      const hitW = walls.find(w => {
        const d=pointToLineDist(x,y,w.x1,w.y1,w.x2,w.y2)
        return d < 8
      })
      onWallSelect(hitW?.id || null)
    }

    if (tool==='erase') {
      const hitW = walls.find(w => pointToLineDist(x,y,w.x1,w.y1,w.x2,w.y2) < 8)
      if (hitW) onWallSelect('erase:'+hitW.id)
    }
  }

  function onMouseMove(e) {
    const {x,y} = getPos(e)
    const sn = nearestNode(x,y,walls)
    setSnapNode(sn)
    setMousePos({ x: sn?.x||snapToGrid(x), y: sn?.y||snapToGrid(y) })

    if (dragging.current.active && tool==='select') {
      onFurnitureMove(dragging.current.id, snapToGrid(x-dragging.current.ox), snapToGrid(y-dragging.current.oy))
    }
  }

  function onMouseUp(e) {
    const {x,y} = getPos(e)
    if (drawing.current.active && tool==='wall') {
      const sn = nearestNode(x,y,walls)
      const ex = sn ? sn.x : snapToGrid(x)
      const ey = sn ? sn.y : snapToGrid(y)
      if (dist(drawing.current.x1,drawing.current.y1,ex,ey)>SNAP) {
        onWallAdd({ x1:drawing.current.x1, y1:drawing.current.y1, x2:ex, y2:ey })
      }
      drawing.current.active = false
    }
    dragging.current.active = false
  }

  return (
    <canvas ref={canvasRef}
      style={{ width:'100%', height:'100%', display:'block', cursor: tool==='wall'?'crosshair':tool==='furniture'?'copy':'default' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { drawing.current.active=false; dragging.current.active=false }}
    />
  )
}

function pointToLineDist(px,py,x1,y1,x2,y2) {
  const dx=x2-x1, dy=y2-y1, len2=dx*dx+dy*dy
  if (!len2) return dist(px,py,x1,y1)
  const t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/len2))
  return dist(px,py,x1+t*dx,y1+t*dy)
}

/* ─── Main Page ──────────────────────────────────────────────────── */
let _id = 1
function uid() { return _id++ }

export default function FloorPlanAIPage() {
  const [walls,      setWalls]       = useState([])
  const [furniture,  setFurniture]   = useState([])
  const [rooms,      setRooms]       = useState([])
  const [tool,       setTool]        = useState('wall')
  const [view,       setView]        = useState('2d')
  const [selectedId, setSelectedId]  = useState(null)
  const [pending,    setPending]     = useState(null)   // furniture being placed
  const [showLib,    setShowLib]     = useState(true)
  const [selFurn,    setSelFurn]     = useState(null)   // selected furniture meta

  const selectedWall = typeof selectedId==='string' && !selectedId.startsWith('erase:')
    ? walls.find(w=>w.id===selectedId) : null
  const selectedFurn = furniture.find(f=>f.id===selectedId)

  function addWall(w) {
    const newWall = { ...w, id: uid() }
    setWalls(prev => {
      const next = [...prev, newWall]
      setRooms(detectRooms(next))
      return next
    })
  }

  function handleWallSelect(idOrCmd) {
    if (!idOrCmd) { setSelectedId(null); return }
    if (typeof idOrCmd==='string' && idOrCmd.startsWith('erase:')) {
      const rid = parseInt(idOrCmd.split(':')[1])
      setWalls(prev => { const next=prev.filter(w=>w.id!==rid); setRooms(detectRooms(next)); return next })
      setSelectedId(null)
    } else {
      setSelectedId(idOrCmd)
    }
  }

  function addFurniture(pos) {
    if (!pending) return
    setFurniture(prev => [...prev, {
      id: uid(), type:pending.type, label:pending.label,
      x:pos.x, y:pos.y, fw:pending.w, fd:pending.d,
      color:pending.color, icon:pending.icon, rot:0
    }])
    setPending(null); setTool('select')
  }

  function moveFurniture(id, x, y) {
    setFurniture(prev => prev.map(f => f.id===id ? {...f,x,y} : f))
  }

  function rotateFurniture(id) {
    setFurniture(prev => prev.map(f => f.id===id ? {...f, rot:(f.rot||0)+90} : f))
  }

  function deleteFurniture(id) {
    setFurniture(prev => prev.filter(f => f.id!==id))
    setSelectedId(null)
  }

  function deleteWall(id) {
    setWalls(prev => { const next=prev.filter(w=>w.id!==id); setRooms(detectRooms(next)); return next })
    setSelectedId(null)
  }

  function clearAll() { setWalls([]); setFurniture([]); setRooms([]); setSelectedId(null) }

  const TOOLS = [
    { id:'wall',      icon:'✦',  label:'Draw Wall',     shortcut:'W' },
    { id:'select',    icon:'↖',  label:'Select / Move', shortcut:'V' },
    { id:'furniture', icon:'🪑', label:'Place Furniture',shortcut:'F' },
    { id:'erase',     icon:'✕',  label:'Erase',         shortcut:'E' },
  ]

  // Keyboard shortcuts
  useEffect(() => {
    const handler = e => {
      if (e.target.tagName==='INPUT') return
      if (e.key==='w'||e.key==='W') setTool('wall')
      if (e.key==='v'||e.key==='V') setTool('select')
      if (e.key==='f'||e.key==='F') setTool('furniture')
      if (e.key==='e'||e.key==='E') setTool('erase')
      if (e.key==='Delete'&&selectedId) {
        if (selectedFurn) deleteFurniture(selectedId)
        else if (selectedWall) deleteWall(selectedId)
      }
      if (e.key==='r'&&selectedFurn) rotateFurniture(selectedId)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, selectedFurn, selectedWall])

  const totalArea = useMemo(() => {
    return rooms.reduce((sum,room) => {
      let area=0
      for(let i=0,j=room.length-1;i<room.length;j=i++) {
        area+=(room[j].x+room[i].x)*(room[j].y-room[i].y)
      }
      return sum + Math.abs(area/2)/(SCALE*SCALE)
    },0)
  },[rooms])

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:bg, ...sans, overflow:'hidden' }}>

      {/* ── TOP BAR ── */}
      <div style={{ flexShrink:0, height:52, background:'#0a0806', borderBottom:`1px solid ${bdr}`, display:'flex', alignItems:'center', paddingInline:16, gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:8 }}>
          <div style={{ width:28,height:28,border:`1.5px solid ${gold}`,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.4" fill="none"/></svg>
          </div>
          <span style={{ ...serif, color:'#fff', fontSize:16, fontWeight:500 }}>Floor Plan Studio</span>
        </div>

        {/* Tool buttons */}
        <div style={{ display:'flex', gap:4 }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); if(t.id!=='furniture') setPending(null) }}
              title={`${t.label} (${t.shortcut})`}
              style={{ padding:'6px 12px', background:tool===t.id?'rgba(201,162,39,0.15)':'transparent', border:`1px solid ${tool===t.id?gold:bdr}`, color:tool===t.id?gold:'#78716c', cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.08em', ...sans, display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        <div style={{ flex:1 }} />

        {/* Stats */}
        <div style={{ display:'flex', gap:20, marginRight:16 }}>
          {[
            { label:'Walls', val:walls.length },
            { label:'Rooms', val:rooms.length },
            { label:'Area',  val:`${totalArea.toFixed(1)} m²` },
            { label:'Items', val:furniture.length },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:700, color:gold }}>{s.val}</div>
              <div style={{ fontSize:9, color:'#44403c', letterSpacing:'0.12em', textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display:'flex', border:`1px solid ${bdr}` }}>
          {[['2d','2D Blueprint'],['3d','3D View']].map(([v,l]) => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding:'8px 16px', background:view===v?gold:'transparent', color:view===v?'#000':'#78716c', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.1em', ...sans, transition:'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Clear */}
        <button onClick={clearAll}
          style={{ padding:'8px 14px', background:'transparent', border:`1px solid #44403c`, color:'#78716c', cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.1em', ...sans }}>
          Clear
        </button>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* ── FURNITURE LIBRARY (Left) ── */}
        <div style={{ flexShrink:0, width:showLib?200:40, background:'#0a0806', borderRight:`1px solid ${bdr}`, display:'flex', flexDirection:'column', transition:'width 0.2s', overflow:'hidden' }}>
          <div style={{ padding:'10px 12px', borderBottom:`1px solid ${bdr}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {showLib && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#44403c' }}>Furniture</span>}
            <button onClick={() => setShowLib(p=>!p)} style={{ background:'none', border:'none', color:'#57534e', cursor:'pointer', fontSize:14, padding:0 }}>{showLib?'◀':'▶'}</button>
          </div>
          {showLib && (
            <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
              {FURNITURE.map(f => (
                <button key={f.type}
                  onClick={() => { setPending(f); setTool('furniture') }}
                  style={{ width:'100%', padding:'8px 10px', background:pending?.type===f.type?'rgba(201,162,39,0.12)':'transparent', border:`1px solid ${pending?.type===f.type?gold:'#1c1917'}`, marginBottom:4, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=gold }}
                  onMouseLeave={e => { if(pending?.type!==f.type) e.currentTarget.style.borderColor='#1c1917' }}>
                  <span style={{ fontSize:16 }}>{f.icon}</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontSize:11, fontWeight:600, color:pending?.type===f.type?gold:'#e7e5e4', ...sans }}>{f.label}</div>
                    <div style={{ fontSize:9, color:'#57534e' }}>{f.w}×{f.d}m</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── CANVAS AREA ── */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          {view==='2d' && (
            <Canvas2D
              walls={walls} furniture={furniture} rooms={rooms}
              tool={tool} selectedItem={selectedId}
              onWallAdd={addWall} onWallSelect={handleWallSelect}
              onFurnitureAdd={addFurniture}
              onFurnitureSelect={id => setSelectedId(id)}
              onFurnitureMove={moveFurniture}
              pendingFurniture={pending}
            />
          )}
          {view==='3d' && (
            <Canvas shadows style={{ width:'100%', height:'100%', background:'#0a0806' }}>
              <Scene3D walls={walls} furniture={furniture} rooms={rooms} selectedWall={selectedId} />
            </Canvas>
          )}

          {/* Hint bar */}
          <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', background:'rgba(10,8,6,0.85)', border:`1px solid ${bdr}`, padding:'6px 16px', display:'flex', gap:24 }}>
            {view==='2d' ? [
              tool==='wall'    && '✦ Click to start wall · Click to end wall · Snap to existing corners',
              tool==='select'  && '↖ Click to select · Drag to move · Del to delete · R to rotate',
              tool==='furniture'&&pending ? `🪑 Click canvas to place ${pending.label}` : tool==='furniture'&&'← Choose furniture from panel',
              tool==='erase'   && '✕ Click a wall to erase it',
            ].filter(Boolean).map((h,i) => <span key={i} style={{ fontSize:10, color:'#57534e', ...sans }}>{h}</span>)
            : <span style={{ fontSize:10, color:'#57534e', ...sans }}>Drag to orbit · Scroll to zoom · Right-drag to pan</span>}
          </div>
        </div>

        {/* ── PROPERTIES PANEL (Right) ── */}
        <div style={{ flexShrink:0, width:200, background:'#0a0806', borderLeft:`1px solid ${bdr}`, padding:16, overflowY:'auto' }}>
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#44403c', marginBottom:16 }}>Properties</p>

          {!selectedId && (
            <div>
              <p style={{ fontSize:12, color:'#44403c', marginBottom:20 }}>Select an object to edit its properties.</p>
              <div style={{ borderTop:`1px solid ${bdr}`, paddingTop:16, marginTop:4 }}>
                <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#44403c', marginBottom:12 }}>Summary</p>
                {[['Total Walls',walls.length],['Detected Rooms',rooms.length],['Floor Area',`${totalArea.toFixed(1)} m²`],['Furniture Items',furniture.length]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:11, color:'#57534e' }}>{l}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:gold }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:`1px solid ${bdr}`, paddingTop:16, marginTop:8 }}>
                <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#44403c', marginBottom:12 }}>Shortcuts</p>
                {[['W','Draw Wall'],['V','Select'],['F','Furniture'],['E','Erase'],['Del','Delete'],['R','Rotate']].map(([k,l]) => (
                  <div key={k} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                    <span style={{ padding:'2px 6px', background:'#1c1917', border:`1px solid ${bdr}`, fontSize:9, fontWeight:700, color:gold, fontFamily:'monospace' }}>{k}</span>
                    <span style={{ fontSize:10, color:'#57534e' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedWall && (
            <div>
              <p style={{ fontSize:11, fontWeight:600, color:'#e7e5e4', marginBottom:16 }}>Wall</p>
              {[
                ['Length', `${(dist(selectedWall.x1,selectedWall.y1,selectedWall.x2,selectedWall.y2)/SCALE).toFixed(2)} m`],
                ['Start',  `${(selectedWall.x1/SCALE).toFixed(1)}, ${(selectedWall.y1/SCALE).toFixed(1)}`],
                ['End',    `${(selectedWall.x2/SCALE).toFixed(1)}, ${(selectedWall.y2/SCALE).toFixed(1)}`],
                ['Height', `${WALL_H} m`],
                ['Thickness', `${WALL_T*100} cm`],
              ].map(([l,v]) => (
                <div key={l} style={{ marginBottom:12 }}>
                  <p style={{ fontSize:9, color:'#44403c', letterSpacing:'0.15em', textTransform:'uppercase', margin:'0 0 3px' }}>{l}</p>
                  <p style={{ fontSize:12, color:'#e7e5e4', margin:0 }}>{v}</p>
                </div>
              ))}
              <button onClick={() => deleteWall(selectedId)}
                style={{ width:'100%', marginTop:8, padding:'10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', ...sans }}>
                Delete Wall
              </button>
            </div>
          )}

          {selectedFurn && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <span style={{ fontSize:20 }}>{selectedFurn.icon}</span>
                <p style={{ fontSize:12, fontWeight:600, color:'#e7e5e4', margin:0 }}>{selectedFurn.label}</p>
              </div>
              {[
                ['Position', `${(selectedFurn.x/SCALE).toFixed(1)}, ${(selectedFurn.y/SCALE).toFixed(1)} m`],
                ['Width',    `${selectedFurn.fw} m`],
                ['Depth',    `${selectedFurn.fd} m`],
                ['Rotation', `${selectedFurn.rot||0}°`],
              ].map(([l,v]) => (
                <div key={l} style={{ marginBottom:12 }}>
                  <p style={{ fontSize:9, color:'#44403c', letterSpacing:'0.15em', textTransform:'uppercase', margin:'0 0 3px' }}>{l}</p>
                  <p style={{ fontSize:12, color:'#e7e5e4', margin:0 }}>{v}</p>
                </div>
              ))}
              <button onClick={() => rotateFurniture(selectedId)}
                style={{ width:'100%', marginBottom:6, padding:'9px', background:'transparent', border:`1px solid ${bdr}`, color:'#e7e5e4', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', ...sans }}>
                ↻ Rotate 90°
              </button>
              <button onClick={() => deleteFurniture(selectedId)}
                style={{ width:'100%', padding:'9px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', ...sans }}>
                Delete Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
