import { Suspense, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, Text, Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Furniture catalogue (embed 3D primitives as proxies until real GLB assets loaded) ─── */
const FURNITURE_CATALOG = [
  { id:'sofa',    label:'Sofa',          color:'#8B7355', w:2.2,  h:0.8, d:0.9,  icon:'🛋️',  price:45000 },
  { id:'bed',     label:'Double Bed',    color:'#8B6914', w:1.8,  h:0.6, d:2.1,  icon:'🛏️',  price:35000 },
  { id:'table',   label:'Dining Table',  color:'#6B4226', w:1.6,  h:0.76,d:0.9,  icon:'🪑',  price:28000 },
  { id:'kitchen', label:'Kitchen Island',color:'#D4C5B0', w:2.4,  h:0.9, d:0.7,  icon:'🍳',  price:85000 },
  { id:'wardrobe',label:'Wardrobe',      color:'#5C4A32', w:1.8,  h:2.1, d:0.6,  icon:'🚪',  price:55000 },
  { id:'tvunit',  label:'TV Unit',       color:'#3A3A3A', w:1.8,  h:0.45,d:0.4,  icon:'📺',  price:22000 },
  { id:'lamp',    label:'Floor Lamp',    color:'#D4941F', w:0.2,  h:1.6, d:0.2,  icon:'💡',  price:8000  },
  { id:'plant',   label:'Indoor Plant',  color:'#2D6A4F', w:0.4,  h:1.2, d:0.4,  icon:'🪴',  price:3500  },
  { id:'desk',    label:'Work Desk',     color:'#8B7355', w:1.4,  h:0.75,d:0.7,  icon:'🖥️',  price:18000 },
  { id:'chair',   label:'Accent Chair',  color:'#8B4513', w:0.8,  h:0.9, d:0.8,  icon:'🪑',  price:12000 },
]

const MATERIALS = [
  { id:'marble',   label:'Italian Marble',  color:'#EDE8E0', roughness:0.1, metalness:0 },
  { id:'oak',      label:'Light Oak',       color:'#C4A97D', roughness:0.6, metalness:0 },
  { id:'concrete', label:'Concrete',        color:'#9E9E9E', roughness:0.9, metalness:0 },
  { id:'white',    label:'Matte White',     color:'#F5F5F0', roughness:0.8, metalness:0 },
  { id:'dark',     label:'Charcoal',        color:'#2D2D2D', roughness:0.7, metalness:0 },
  { id:'gold',     label:'Brushed Gold',    color:'#D4941F', roughness:0.3, metalness:0.9 },
]

/* ─── Room dimensions ─── */
const DEFAULT_ROOM = { width: 6, height: 3, depth: 5 }

/* ─── Furniture mesh ─── */
function FurnitureMesh({ item, selected, onClick, onTransformEnd }) {
  const meshRef    = useRef()
  const [hovered, setHovered] = useState(false)

  const mat = FURNITURE_CATALOG.find(f => f.id === item.furnitureId)

  useFrame(() => {
    if (meshRef.current && selected) {
      meshRef.current.material.emissive.set(hovered ? '#FFD700' : '#D4941F')
      meshRef.current.material.emissiveIntensity = 0.15
    } else if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = hovered ? 0.08 : 0
      meshRef.current.material.emissive.set('#D4941F')
    }
  })

  if (!mat) return null

  return (
    <group
      position={[item.x || 0, (mat.h / 2), item.z || 0]}
      rotation={[0, item.rotation || 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(item.instanceId) }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={()  => { setHovered(false); document.body.style.cursor = 'default' }}>

      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[mat.w, mat.h, mat.d]} />
        <meshStandardMaterial
          color={item.color || mat.color}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      {/* Label */}
      {(selected || hovered) && (
        <Html center position={[0, mat.h / 2 + 0.25, 0]}>
          <div style={{
            background: '#0f1c5c', color: '#fff', padding: '3px 8px',
            borderRadius: 3, fontSize: 11, fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600, whiteSpace: 'nowrap', pointerEvents: 'none',
            border: '1px solid #d4941f'
          }}>
            {mat.icon} {mat.label} — ₹{mat.price.toLocaleString('en-IN')}
          </div>
        </Html>
      )}
    </group>
  )
}

/* ─── Room shell ─── */
function Room({ dims, floorMaterial, wallMaterial }) {
  const floor = MATERIALS.find(m => m.id === floorMaterial) || MATERIALS[0]
  const wall  = MATERIALS.find(m => m.id === wallMaterial)  || MATERIALS[3]

  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[dims.width, dims.depth]} />
        <meshStandardMaterial color={floor.color} roughness={floor.roughness} metalness={floor.metalness} />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh receiveShadow position={[0, dims.height / 2, -dims.depth / 2]}>
        <planeGeometry args={[dims.width, dims.height]} />
        <meshStandardMaterial color={wall.color} roughness={wall.roughness} side={THREE.FrontSide} />
      </mesh>
      {/* Left wall */}
      <mesh receiveShadow rotation={[0, Math.PI / 2, 0]} position={[-dims.width / 2, dims.height / 2, 0]}>
        <planeGeometry args={[dims.depth, dims.height]} />
        <meshStandardMaterial color={wall.color} roughness={wall.roughness} side={THREE.FrontSide} />
      </mesh>
      {/* Right wall */}
      <mesh receiveShadow rotation={[0, -Math.PI / 2, 0]} position={[dims.width / 2, dims.height / 2, 0]}>
        <planeGeometry args={[dims.depth, dims.height]} />
        <meshStandardMaterial color={wall.color} roughness={wall.roughness} side={THREE.FrontSide} />
      </mesh>

      {/* Ceiling edge lines */}
      <lineSegments position={[0, dims.height, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(dims.width, 0.01, dims.depth)]} />
        <lineBasicMaterial color="#d4941f" linewidth={1} />
      </lineSegments>

      {/* Dimension labels */}
      <Text position={[0, 0.02, dims.depth / 2 + 0.3]} rotation={[-Math.PI/2, 0, 0]}
        fontSize={0.18} color="#d4941f" anchorX="center">
        {dims.width}m wide
      </Text>
      <Text position={[dims.width / 2 + 0.3, 0.02, 0]} rotation={[-Math.PI/2, 0, -Math.PI/2]}
        fontSize={0.18} color="#d4941f" anchorX="center">
        {dims.depth}m deep
      </Text>
    </group>
  )
}

/* ─── Main 3D Designer ─── */
export default function RoomDesigner({ projectId, onSave }) {
  const [dims,          setDims]         = useState(DEFAULT_ROOM)
  const [placedItems,   setPlacedItems]  = useState([])
  const [selectedId,    setSelectedId]   = useState(null)
  const [floorMat,      setFloorMat]     = useState('marble')
  const [wallMat,       setWallMat]      = useState('white')
  const [viewMode,      setViewMode]     = useState('3d')   // '3d' | 'top'
  const [activePanel,   setActivePanel]  = useState('furniture') // 'furniture' | 'materials' | 'dimensions'
  const [totalCost,     setTotalCost]    = useState(0)
  const [saved,         setSaved]        = useState(false)

  const addFurniture = useCallback((furnitureId) => {
    const mat = FURNITURE_CATALOG.find(f => f.id === furnitureId)
    const instanceId = `${furnitureId}_${Date.now()}`
    const newItem = {
      instanceId,
      furnitureId,
      x: (Math.random() - 0.5) * (dims.width - mat.w - 0.5),
      z: (Math.random() - 0.5) * (dims.depth - mat.d - 0.5),
      rotation: 0,
      color: mat.color,
    }
    setPlacedItems(prev => {
      const updated = [...prev, newItem]
      setTotalCost(updated.reduce((s, i) => s + (FURNITURE_CATALOG.find(f => f.id === i.furnitureId)?.price || 0), 0))
      return updated
    })
    setSelectedId(instanceId)
  }, [dims])

  const removeSelected = useCallback(() => {
    setPlacedItems(prev => {
      const updated = prev.filter(i => i.instanceId !== selectedId)
      setTotalCost(updated.reduce((s, i) => s + (FURNITURE_CATALOG.find(f => f.id === i.furnitureId)?.price || 0), 0))
      return updated
    })
    setSelectedId(null)
  }, [selectedId])

  const rotateSelected = useCallback((dir) => {
    setPlacedItems(prev => prev.map(i =>
      i.instanceId === selectedId
        ? { ...i, rotation: (i.rotation || 0) + dir * (Math.PI / 2) }
        : i
    ))
  }, [selectedId])

  const changeColor = useCallback((color) => {
    setPlacedItems(prev => prev.map(i =>
      i.instanceId === selectedId ? { ...i, color } : i
    ))
  }, [selectedId])

  const handleSave = () => {
    const scene = { dims, placedItems, floorMat, wallMat, totalCost }
    onSave?.(scene)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const selectedItem = placedItems.find(i => i.instanceId === selectedId)
  const selectedMeta = selectedItem ? FURNITURE_CATALOG.find(f => f.id === selectedItem.furnitureId) : null

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden font-body">

      {/* ── Left sidebar: Catalog / Materials / Dimensions ── */}
      <div className="w-64 flex-shrink-0 bg-navy-900 border-r border-navy-800 flex flex-col">

        {/* Panel tabs */}
        <div className="flex border-b border-navy-800">
          {[['furniture','🛋️ Furniture'],['materials','🎨 Materials'],['dimensions','📐 Room']].map(([k,l]) => (
            <button key={k} onClick={() => setActivePanel(k)}
              className={`flex-1 text-[10px] font-bold tracking-wide py-3 transition-colors ${
                activePanel === k ? 'bg-gold-500 text-white' : 'text-stone-400 hover:text-white'
              }`}>
              {l}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {/* ── Furniture panel ── */}
          {activePanel === 'furniture' && (
            <>
              <p className="text-[10px] text-stone-500 tracking-widest uppercase mb-3">Click to add to room</p>
              {FURNITURE_CATALOG.map(f => (
                <button key={f.id} onClick={() => addFurniture(f.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-sm bg-navy-800 hover:bg-navy-700 border border-navy-700 hover:border-gold-500 transition-all text-left group">
                  <span className="text-xl">{f.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white group-hover:text-gold-300 truncate">{f.label}</p>
                    <p className="text-[10px] text-stone-500">{f.w}×{f.d}m · ₹{f.price.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="text-gold-500 text-sm opacity-0 group-hover:opacity-100">+</span>
                </button>
              ))}
            </>
          )}

          {/* ── Materials panel ── */}
          {activePanel === 'materials' && (
            <>
              <p className="text-[10px] text-stone-500 tracking-widest uppercase mb-3">Floor Material</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {MATERIALS.map(m => (
                  <button key={m.id} onClick={() => setFloorMat(m.id)}
                    title={m.label}
                    className={`flex flex-col items-center gap-1 p-2 rounded-sm border transition-all ${
                      floorMat === m.id ? 'border-gold-500 bg-gold-500/10' : 'border-navy-700 bg-navy-800 hover:border-navy-600'
                    }`}>
                    <div className="w-8 h-8 rounded-sm border border-navy-600" style={{ backgroundColor: m.color }} />
                    <p className="text-[9px] text-stone-400 text-center leading-tight">{m.label}</p>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-stone-500 tracking-widest uppercase mb-3">Wall Material</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {MATERIALS.map(m => (
                  <button key={m.id} onClick={() => setWallMat(m.id)}
                    title={m.label}
                    className={`flex flex-col items-center gap-1 p-2 rounded-sm border transition-all ${
                      wallMat === m.id ? 'border-gold-500 bg-gold-500/10' : 'border-navy-700 bg-navy-800 hover:border-navy-600'
                    }`}>
                    <div className="w-8 h-8 rounded-sm border border-navy-600" style={{ backgroundColor: m.color }} />
                    <p className="text-[9px] text-stone-400 text-center leading-tight">{m.label}</p>
                  </button>
                ))}
              </div>

              {/* Furniture color (selected item) */}
              {selectedMeta && (
                <>
                  <p className="text-[10px] text-stone-500 tracking-widest uppercase mb-2">
                    {selectedMeta.icon} {selectedMeta.label} Color
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['#8B7355','#5C4A32','#3A3A3A','#D4C5B0','#2D6A4F','#8B4513','#D4941F','#F5F5F0','#1e3a5f'].map(c => (
                      <button key={c} onClick={() => changeColor(c)}
                        title={c}
                        className={`w-8 h-8 rounded-sm border-2 transition-all ${selectedItem?.color === c ? 'border-gold-400 scale-110' : 'border-navy-700'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Dimensions panel ── */}
          {activePanel === 'dimensions' && (
            <>
              <p className="text-[10px] text-stone-500 tracking-widest uppercase mb-3">Room Size</p>
              {[['width','Width (m)',2,12],['depth','Depth (m)',2,12],['height','Height (m)',2.4,4]].map(([key,label,min,max]) => (
                <div key={key} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <label className="text-[10px] text-stone-400">{label}</label>
                    <span className="text-[10px] text-gold-400 font-bold">{dims[key]}m</span>
                  </div>
                  <input type="range" min={min} max={max} step={0.5} value={dims[key]}
                    onChange={e => setDims(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
                    className="w-full accent-gold-500" />
                </div>
              ))}
              <div className="bg-navy-800 rounded-sm p-3 mt-2">
                <p className="text-[10px] text-stone-400">Room Area</p>
                <p className="text-lg font-bold text-gold-400">{(dims.width * dims.depth).toFixed(1)} m²</p>
                <p className="text-[10px] text-stone-500">{Math.round(dims.width * dims.depth * 10.764)} sq ft</p>
              </div>
            </>
          )}
        </div>

        {/* ── Cost summary ── */}
        <div className="border-t border-navy-800 p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-stone-500 uppercase tracking-wide">Furniture Cost</span>
            <span className="text-xs font-bold text-gold-400">₹{totalCost.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wide">Items</span>
            <span className="text-xs font-bold text-white">{placedItems.length}</span>
          </div>
        </div>
      </div>

      {/* ── Main 3D canvas ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-navy-900 border-b border-navy-800">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm font-display">🏠 3D Room Designer</span>
            <span className="text-stone-500 text-xs">· El Shaddai AI Platform</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-navy-800 rounded-sm overflow-hidden border border-navy-700">
              {[['3d','3D'],['top','Top']].map(([v,l]) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                    viewMode === v ? 'bg-gold-500 text-white' : 'text-stone-400 hover:text-white'
                  }`}>{l}</button>
              ))}
            </div>

            {/* Selected item actions */}
            {selectedId && (
              <div className="flex items-center gap-1 border-l border-navy-700 pl-2">
                <button onClick={() => rotateSelected(-1)} title="Rotate left"
                  className="p-1.5 rounded-sm bg-navy-800 hover:bg-navy-700 text-white text-sm">↺</button>
                <button onClick={() => rotateSelected(1)} title="Rotate right"
                  className="p-1.5 rounded-sm bg-navy-800 hover:bg-navy-700 text-white text-sm">↻</button>
                <button onClick={removeSelected} title="Remove"
                  className="p-1.5 rounded-sm bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white text-sm">✕</button>
              </div>
            )}

            <button onClick={handleSave}
              className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all ${
                saved ? 'bg-green-600 text-white' : 'bg-gold-500 hover:bg-gold-600 text-white'
              }`}>
              {saved ? '✓ Saved!' : '💾 Save Design'}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas
            shadows
            camera={viewMode === 'top'
              ? { position: [0, 12, 0], fov: 50, near: 0.1, far: 100 }
              : { position: [8, 6, 8],  fov: 50, near: 0.1, far: 100 }
            }
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null) }}>

            <color attach="background" args={['#0a0f1e']} />
            <fog attach="fog" args={['#0a0f1e', 15, 40]} />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              castShadow position={[5, 10, 5]} intensity={1.5}
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={50} shadow-camera-near={0.1}
              shadow-camera-left={-10} shadow-camera-right={10}
              shadow-camera-top={10} shadow-camera-bottom={-10}
            />
            <pointLight position={[-3, 3, -3]} intensity={0.5} color="#d4941f" />
            <pointLight position={[3, 3, 3]}   intensity={0.3} color="#ffffff" />

            <Suspense fallback={null}>
              <Environment preset="apartment" />

              {/* Room shell */}
              <Room dims={dims} floorMaterial={floorMat} wallMaterial={wallMat} />

              {/* Grid */}
              <Grid
                position={[0, 0.001, 0]}
                args={[20, 20]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#1e3a5f"
                sectionSize={3}
                sectionThickness={1}
                sectionColor="#d4941f"
                fadeDistance={20}
                fadeStrength={1}
                followCamera={false}
                infiniteGrid
              />

              {/* Placed furniture */}
              {placedItems.map(item => (
                <FurnitureMesh
                  key={item.instanceId}
                  item={item}
                  selected={item.instanceId === selectedId}
                  onClick={setSelectedId}
                />
              ))}
            </Suspense>

            <OrbitControls
              makeDefault
              enablePan
              enableZoom
              enableRotate={viewMode === '3d'}
              minPolarAngle={viewMode === 'top' ? 0 : 0}
              maxPolarAngle={viewMode === 'top' ? 0.01 : Math.PI / 2.2}
              target={[0, 0, 0]}
            />
          </Canvas>

          {/* Overlay instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-950/80 backdrop-blur-sm border border-navy-800 rounded-sm px-4 py-2 flex gap-6">
            {[['🖱️ Drag','Orbit / Pan'],['📐 Add','Click catalog'],['✓ Select','Click furniture'],['🎨 Material','Left panel']].map(([icon,label]) => (
              <div key={label} className="text-center">
                <p className="text-[11px] font-bold text-white">{icon}</p>
                <p className="text-[9px] text-stone-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Selected info overlay */}
          {selectedMeta && (
            <div className="absolute top-3 right-3 bg-navy-950/90 border border-gold-500/30 rounded-sm px-4 py-3 min-w-40">
              <p className="text-gold-400 text-xs font-bold mb-1">{selectedMeta.icon} {selectedMeta.label}</p>
              <p className="text-[10px] text-stone-400">{selectedMeta.w}m × {selectedMeta.d}m × {selectedMeta.h}m</p>
              <p className="text-xs font-bold text-white mt-1">₹{selectedMeta.price.toLocaleString('en-IN')}</p>
              <div className="flex gap-1 mt-2">
                <button onClick={() => rotateSelected(-1)} className="flex-1 text-[10px] bg-navy-800 hover:bg-navy-700 text-white py-1 rounded-sm">↺ Rotate</button>
                <button onClick={removeSelected} className="flex-1 text-[10px] bg-red-900/40 hover:bg-red-900/70 text-red-400 py-1 rounded-sm">✕ Remove</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
