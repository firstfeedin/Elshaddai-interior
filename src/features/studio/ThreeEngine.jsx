/**
 * ThreeEngine — Real-time 3D extraction from 2D floor plan
 *
 * Architecture:
 *   • React Three Fiber (R3F) canvas
 *   • Dynamic wall extrusion: each 2D wall → BoxGeometry at correct position/rotation
 *   • Door openings: gap carved visually via a lighter box
 *   • Window openings: translucent glass box at mid-wall height
 *   • Room floor detection: convex polygon from connected wall endpoints
 *   • GLB furniture loader: useGLTF from @react-three/drei
 *   • Lighting: hemisphere + directional with shadow map + environment
 *   • Post-FX: tone mapping ACES, background sky
 *   • Screenshot: gl.domElement.toDataURL
 *   • OrbitControls with damping + auto-rotate option
 *
 * Coordinate mapping (canvas px → 3D metres):
 *   x3D =  (xPx - originX) / SCALE
 *   z3D =  (yPx - originY) / SCALE   (y is inverted in 3D — z is depth)
 *   y3D =  [0 … WALL_H]              (vertical)
 */

import {
  useRef, useMemo, useCallback, Suspense, useEffect, forwardRef, useImperativeHandle
} from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import {
  OrbitControls, Environment, ContactShadows,
  Grid, useGLTF, Html, PerspectiveCamera,
} from '@react-three/drei'
import * as THREE from 'three'
import { SCALE, WALL_H, WALL_PX_T } from './FloorPlanEngine'

/* ─── Materials (shared, stable refs) ─────────────────────────────────────── */
const MAT = {
  wall:    new THREE.MeshStandardMaterial({ color:'#d4cfc8', roughness:0.85, metalness:0 }),
  wallInt: new THREE.MeshStandardMaterial({ color:'#e8e2da', roughness:0.9,  metalness:0, side: THREE.BackSide }),
  floor:   new THREE.MeshStandardMaterial({ color:'#c8bc9a', roughness:0.9,  metalness:0 }),
  ceiling: new THREE.MeshStandardMaterial({ color:'#f0ece6', roughness:1,    metalness:0 }),
  door:    new THREE.MeshStandardMaterial({ color:'#8b6a3e', roughness:0.6,  metalness:0.1 }),
  glass:   new THREE.MeshStandardMaterial({ color:'#a8d4e8', roughness:0.05, metalness:0, transparent:true, opacity:0.35 }),
  doorFrame: new THREE.MeshStandardMaterial({ color:'#5a3e20', roughness:0.5, metalness:0.15 }),
}

/* ─── Utility ──────────────────────────────────────────────────────────────── */
const px2m = px => px / SCALE
const WALL_THICK_M = (WALL_PX_T / SCALE)   // wall thickness in metres ≈ 0.17m
const DOOR_H  = 2.1   // door height in metres
const DOOR_W  = 0.9   // default door width metres
const WIN_BOT = 0.9   // window bottom height
const WIN_H   = 1.1   // window height

function wallLength3D(w) {
  return Math.hypot(px2m(w.x2 - w.x1), px2m(w.y2 - w.y1))
}

function wallCenter3D(w) {
  return new THREE.Vector3(
    px2m((w.x1 + w.x2) / 2),
    WALL_H / 2,
    px2m((w.y1 + w.y2) / 2)
  )
}

function wallRotY(w) {
  return -Math.atan2(w.y2 - w.y1, w.x2 - w.x1)
}

/* detect closed rooms as convex hull centroids from wall endpoints */
function detectRoomPolygons(walls) {
  if (!walls.length) return []
  // Build point adjacency
  const eps = 2  // px tolerance for "same endpoint"
  const groups = {}
  const keyOf = (x, y) => `${Math.round(x/eps)*eps},${Math.round(y/eps)*eps}`

  walls.forEach(w => {
    const ka = keyOf(w.x1,w.y1), kb = keyOf(w.x2,w.y2)
    groups[ka] = groups[ka] || { x: w.x1, y: w.y1, neighbors:[] }
    groups[kb] = groups[kb] || { x: w.x2, y: w.y2, neighbors:[] }
    groups[ka].neighbors.push(kb)
    groups[kb].neighbors.push(ka)
  })

  // Find closed cycles of length >= 3 (simple DFS)
  const visited = new Set()
  const rooms = []

  function dfs(startKey, current, path, depth) {
    if (depth > 8) return  // limit cycle length
    const node = groups[current]
    if (!node) return
    for (const nb of node.neighbors) {
      if (nb === startKey && path.length >= 3) {
        // Found a cycle
        const poly = path.map(k => ({ x: groups[k].x, y: groups[k].y }))
        rooms.push(poly)
        return
      }
      if (!path.includes(nb)) {
        dfs(startKey, nb, [...path, nb], depth+1)
      }
    }
  }

  for (const key of Object.keys(groups)) {
    if (!visited.has(key)) {
      dfs(key, key, [key], 0)
      visited.add(key)
    }
  }

  // Deduplicate (same rooms found multiple times)
  const unique = []
  const seen = new Set()
  for (const r of rooms) {
    const sig = [...r].sort((a,b)=>`${a.x},${a.y}`.localeCompare(`${b.x},${b.y}`)).map(p=>`${p.x},${p.y}`).join('|')
    if (!seen.has(sig)) { seen.add(sig); unique.push(r) }
  }
  return unique.slice(0, 12)  // max 12 rooms
}

/* compute polygon centroid */
function centroid(pts) {
  const n = pts.length
  return { x: pts.reduce((a,p)=>a+p.x,0)/n, y: pts.reduce((a,p)=>a+p.y,0)/n }
}

/* polygon area (shoelace) */
function polygonArea(pts) {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i+1) % pts.length
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y
  }
  return Math.abs(a) / 2
}

/* ─── Wall Mesh ────────────────────────────────────────────────────────────── */
function WallMesh({ wall, selected }) {
  const len = wallLength3D(wall)
  if (len < 0.05) return null
  const center = wallCenter3D(wall)
  const rotY   = wallRotY(wall)

  return (
    <group position={center.toArray()} rotation={[0, rotY, 0]}>
      {/* Outer wall */}
      <mesh castShadow receiveShadow material={MAT.wall}>
        <boxGeometry args={[len, WALL_H, WALL_THICK_M]} />
      </mesh>
      {/* Selection highlight */}
      {selected && (
        <mesh>
          <boxGeometry args={[len + 0.02, WALL_H + 0.02, WALL_THICK_M + 0.02]} />
          <meshStandardMaterial color="#c9a227" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

/* ─── Door Mesh ────────────────────────────────────────────────────────────── */
function DoorMesh({ wall }) {
  const len = wallLength3D(wall)
  if (len < 0.05) return null
  const center = wallCenter3D(wall)
  const rotY   = wallRotY(wall)
  const doorW  = Math.min(len, DOOR_W)

  return (
    <group position={center.toArray()} rotation={[0, rotY, 0]}>
      {/* Left wall section */}
      {len > doorW && (
        <>
          <mesh castShadow receiveShadow material={MAT.wall} position={[-(len-doorW)/4 - doorW/4, 0, 0]}>
            <boxGeometry args={[(len-doorW)/2, WALL_H, WALL_THICK_M]} />
          </mesh>
          <mesh castShadow receiveShadow material={MAT.wall} position={[(len-doorW)/4 + doorW/4, 0, 0]}>
            <boxGeometry args={[(len-doorW)/2, WALL_H, WALL_THICK_M]} />
          </mesh>
        </>
      )}
      {/* Lintel above door */}
      <mesh castShadow receiveShadow material={MAT.wall} position={[0, DOOR_H + (WALL_H - DOOR_H)/2, 0]}>
        <boxGeometry args={[doorW, WALL_H - DOOR_H, WALL_THICK_M]} />
      </mesh>
      {/* Door frame */}
      <mesh receiveShadow material={MAT.doorFrame} position={[0, DOOR_H/2, WALL_THICK_M/2 + 0.02]}>
        <boxGeometry args={[doorW + 0.05, DOOR_H + 0.05, 0.04]} />
      </mesh>
      {/* Door leaf */}
      <mesh castShadow receiveShadow material={MAT.door} position={[-doorW/2 + 0.03, DOOR_H/2 - 0.05, WALL_THICK_M/2 + 0.04]} rotation={[0, -Math.PI/6, 0]}>
        <boxGeometry args={[doorW - 0.05, DOOR_H - 0.05, 0.04]} />
      </mesh>
    </group>
  )
}

/* ─── Window Mesh ──────────────────────────────────────────────────────────── */
function WindowMesh({ wall }) {
  const len    = wallLength3D(wall)
  if (len < 0.05) return null
  const center = wallCenter3D(wall)
  const rotY   = wallRotY(wall)
  const winW   = Math.min(len * 0.8, 1.2)

  return (
    <group position={center.toArray()} rotation={[0, rotY, 0]}>
      {/* Wall sections around window */}
      {/* Left sill */}
      <mesh castShadow receiveShadow material={MAT.wall} position={[-(len-winW)/4 - winW/4, 0, 0]}>
        <boxGeometry args={[(len-winW)/2, WALL_H, WALL_THICK_M]} />
      </mesh>
      {/* Right sill */}
      <mesh castShadow receiveShadow material={MAT.wall} position={[(len-winW)/4 + winW/4, 0, 0]}>
        <boxGeometry args={[(len-winW)/2, WALL_H, WALL_THICK_M]} />
      </mesh>
      {/* Below window */}
      <mesh castShadow receiveShadow material={MAT.wall} position={[0, WIN_BOT/2, 0]}>
        <boxGeometry args={[winW, WIN_BOT, WALL_THICK_M]} />
      </mesh>
      {/* Above window */}
      <mesh castShadow receiveShadow material={MAT.wall} position={[0, WIN_BOT + WIN_H + (WALL_H - WIN_BOT - WIN_H)/2, 0]}>
        <boxGeometry args={[winW, WALL_H - WIN_BOT - WIN_H, WALL_THICK_M]} />
      </mesh>
      {/* Glass pane */}
      <mesh material={MAT.glass} position={[0, WIN_BOT + WIN_H/2, 0]}>
        <boxGeometry args={[winW, WIN_H, 0.02]} />
      </mesh>
      {/* Window frame */}
      <mesh material={MAT.doorFrame} position={[0, WIN_BOT + WIN_H/2, WALL_THICK_M/2]}>
        <boxGeometry args={[winW + 0.06, WIN_H + 0.06, 0.03]} />
      </mesh>
    </group>
  )
}

/* ─── Room Floor Mesh ──────────────────────────────────────────────────────── */
function RoomFloor({ polygon }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    if (!polygon.length) return s
    s.moveTo(px2m(polygon[0].x), px2m(polygon[0].y))
    for (let i = 1; i < polygon.length; i++) {
      s.lineTo(px2m(polygon[i].x), px2m(polygon[i].y))
    }
    s.closePath()
    return s
  }, [polygon])

  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.001, 0]} receiveShadow material={MAT.floor}>
      <shapeGeometry args={[shape]} />
    </mesh>
  )
}

/* ─── Room Label ───────────────────────────────────────────────────────────── */
function RoomLabel({ polygon, index }) {
  const c = centroid(polygon)
  const area = polygonArea(polygon) / (SCALE * SCALE)  // m²
  return (
    <Html position={[px2m(c.x), 0.05, px2m(c.y)]} center distanceFactor={8}>
      <div style={{ background:'rgba(201,162,39,0.88)', color:'#0a0805', padding:'3px 8px', fontSize:10, fontWeight:700, letterSpacing:'0.06em', whiteSpace:'nowrap', pointerEvents:'none' }}>
        Room {index+1} · {area.toFixed(1)} m²
      </div>
    </Html>
  )
}

/* ─── Global Floor ─────────────────────────────────────────────────────────── */
function GlobalFloor() {
  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#b8b0a0" roughness={0.95} metalness={0} />
    </mesh>
  )
}

/* ─── Ceiling ──────────────────────────────────────────────────────────────── */
function Ceiling({ walls }) {
  if (!walls.length) return null
  return (
    <mesh position={[0, WALL_H + 0.01, 0]} rotation={[Math.PI/2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#f0ece6" roughness={1} side={THREE.BackSide} />
    </mesh>
  )
}

/* ─── Furniture item (GLB or fallback box) ─────────────────────────────────── */
function FurnitureItem({ item }) {
  const hasGlb = Boolean(item.catalogItem?.glb)
  const dims = item.catalogItem?.dims || { w:1, h:0.8, d:0.8 }

  if (hasGlb) {
    return <FurnitureGLB item={item} />
  }
  return (
    <mesh
      position={[item.x, dims.h/2, item.z]}
      rotation={[0, item.rotY || 0, 0]}
      castShadow receiveShadow>
      <boxGeometry args={[dims.w, dims.h, dims.d]} />
      <meshStandardMaterial
        color={item.catalogItem?.color || '#a08060'}
        roughness={0.7} metalness={0.05} />
    </mesh>
  )
}

function FurnitureGLB({ item }) {
  const { scene } = useGLTF(item.catalogItem.glb)
  const dims = item.catalogItem?.dims || { w:1, h:0.8, d:0.8 }

  const cloned = useMemo(() => {
    const c = scene.clone(true)
    // Auto-scale to fit dims
    const box = new THREE.Box3().setFromObject(c)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxS = Math.max(size.x, size.y, size.z)
    const targetS = Math.max(dims.w, dims.h, dims.d)
    const sf = maxS > 0 ? targetS / maxS : 1
    c.scale.setScalar(sf)
    c.traverse(child => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })
    return c
  }, [scene, dims])

  return (
    <primitive
      object={cloned}
      position={[item.x, 0, item.z]}
      rotation={[0, item.rotY || 0, 0]}
    />
  )
}

/* ─── Lighting Setup ───────────────────────────────────────────────────────── */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight skyColor="#e8d5b5" groundColor="#7a6a4a" intensity={0.6} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-4, WALL_H - 0.3, -4]} intensity={0.3} color="#ffe8c0" />
      <pointLight position={[ 4, WALL_H - 0.3,  4]} intensity={0.2} color="#c0d8ff" />
    </>
  )
}

/* ─── Screenshot helper (ref-based) ──────────────────────────────────────── */
function ScreenshotHelper({ onReady }) {
  const { gl } = useThree()
  useEffect(() => {
    onReady(() => {
      gl.render(gl.scene, gl.camera)
      return gl.domElement.toDataURL('image/png')
    })
  }, [gl, onReady])
  return null
}

/* ─── AutoFit camera when walls change ────────────────────────────────────── */
function AutoFit({ walls }) {
  const { camera } = useThree()
  const prevLen = useRef(0)

  useEffect(() => {
    if (!walls.length || walls.length === prevLen.current) return
    prevLen.current = walls.length

    // Compute bounding box of all walls in 3D
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
    for (const w of walls) {
      const x1 = px2m(w.x1), z1 = px2m(w.y1)
      const x2 = px2m(w.x2), z2 = px2m(w.y2)
      minX = Math.min(minX, x1, x2); maxX = Math.max(maxX, x1, x2)
      minZ = Math.min(minZ, z1, z2); maxZ = Math.max(maxZ, z1, z2)
    }
    const cx = (minX+maxX)/2, cz = (minZ+maxZ)/2
    const span = Math.max(maxX-minX, maxZ-minZ, 4)

    camera.position.set(cx + span*0.7, span*0.8, cz + span*1.0)
    camera.lookAt(cx, 0, cz)
  }, [walls, camera])

  return null
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  ThreeEngine — main export                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
const ThreeEngine = forwardRef(function ThreeEngine(
  { walls = [], furniture = [], selectedId = null, autoRotate = false },
  ref
) {
  const screenshotFnRef = useRef(null)

  useImperativeHandle(ref, () => ({
    screenshot() {
      return screenshotFnRef.current?.()
    },
    resetCamera() {
      // triggers re-fit on next render
    },
  }))

  const wallSegments   = walls.filter(w => w.type === 'wall')
  const doorSegments   = walls.filter(w => w.type === 'door')
  const windowSegments = walls.filter(w => w.type === 'window')

  const rooms = useMemo(() => detectRoomPolygons(wallSegments), [wallSegments])

  return (
    <Canvas
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      style={{ width:'100%', height:'100%', background:'#1a1a2e' }}
    >
      <PerspectiveCamera makeDefault fov={55} position={[8, 10, 12]} near={0.1} far={200} />

      <Lighting />

      {/* Environment (soft image-based lighting) */}
      <Environment preset="apartment" background={false} />

      {/* Grid overlay (subtle) */}
      <Grid
        args={[40, 40]}
        position={[0, -0.002, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#c8b896"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#a09060"
        fadeDistance={35}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Global floor + ceiling */}
      <GlobalFloor />
      <Ceiling walls={wallSegments} />

      {/* Contact shadows */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={30}
        blur={2}
        far={WALL_H}
      />

      {/* Room floors (detected closed polygons) */}
      {rooms.map((poly, i) => (
        <RoomFloor key={i} polygon={poly} />
      ))}

      {/* Room labels */}
      {rooms.map((poly, i) => (
        <RoomLabel key={i} polygon={poly} index={i} />
      ))}

      {/* Walls */}
      {wallSegments.map(w => (
        <WallMesh key={w.id} wall={w} selected={w.id === selectedId} />
      ))}

      {/* Doors */}
      {doorSegments.map(w => (
        <DoorMesh key={w.id} wall={w} />
      ))}

      {/* Windows */}
      {windowSegments.map(w => (
        <WindowMesh key={w.id} wall={w} />
      ))}

      {/* Furniture */}
      <Suspense fallback={null}>
        {furniture.map(item => (
          <FurnitureItem key={item.id} item={item} />
        ))}
      </Suspense>

      {/* Camera auto-fit */}
      <AutoFit walls={wallSegments} />

      {/* Orbit controls */}
      <OrbitControls
        makeDefault
        dampingFactor={0.08}
        enableDamping
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />

      {/* Screenshot helper */}
      <ScreenshotHelper onReady={fn => { screenshotFnRef.current = fn }} />
    </Canvas>
  )
})

export default ThreeEngine
