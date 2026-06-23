import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader }    from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/* ─── Constants ─── */
const GOLD  = '#c9a227'
const WALL_COLOR   = 0xf5f0e8
const FLOOR_COLOR  = 0xc8b89a
const CEIL_COLOR   = 0xfafafa
const ACCENT_COLOR = 0xc9a227

/* ─── Build procedural room ─── */
function buildRoom(scene, { w = 6, d = 5, h = 3 } = {}) {
  const group = new THREE.Group()
  group.name = 'room'

  const floorMat = new THREE.MeshStandardMaterial({ color: FLOOR_COLOR, roughness: 0.85 })
  const wallMat  = new THREE.MeshStandardMaterial({ color: WALL_COLOR,  roughness: 0.9  })
  const ceilMat  = new THREE.MeshStandardMaterial({ color: CEIL_COLOR,  roughness: 1.0  })

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  floor.name = 'floor'
  group.add(floor)

  // Ceiling
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilMat)
  ceil.rotation.x = Math.PI / 2
  ceil.position.y = h
  group.add(ceil)

  // Walls
  const walls = [
    { geo: new THREE.PlaneGeometry(w, h), pos: [0, h/2, -d/2],  rot: [0, 0, 0] },
    { geo: new THREE.PlaneGeometry(d, h), pos: [-w/2, h/2, 0],  rot: [0,  Math.PI/2, 0] },
    { geo: new THREE.PlaneGeometry(d, h), pos: [ w/2, h/2, 0],  rot: [0, -Math.PI/2, 0] },
  ]
  walls.forEach(({ geo, pos, rot }) => {
    const m = new THREE.Mesh(geo, wallMat)
    m.position.set(...pos)
    m.rotation.set(...rot)
    m.receiveShadow = true
    group.add(m)
  })

  // Skirting boards
  const skirtMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d0 })
  const skirtGeo = new THREE.BoxGeometry(w + 0.01, 0.08, 0.04)
  const skirt1 = new THREE.Mesh(skirtGeo, skirtMat)
  skirt1.position.set(0, 0.04, -d/2 + 0.02)
  group.add(skirt1)

  // Floor grid (step 1 visible)
  const grid = new THREE.GridHelper(Math.max(w, d) + 1, (Math.max(w, d) + 1) * 2, 0xaaaaaa, 0xdddddd)
  grid.position.y = 0.002
  grid.name = 'grid'
  group.add(grid)

  scene.add(group)
  return group
}

/* ─── Furniture mesh management ─── */
const gltfLoader = new GLTFLoader()
const meshCache  = new Map()

function placeFurniture(scene, item, position, onDone) {
  const key = `furniture_${item.id}`
  if (scene.getObjectByName(key)) { onDone?.(); return }

  const { w = 1, h = 0.8, d: depth = 0.8 } = item.dims || {}

  const buildBox = () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, depth),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(item.color || '#8b7355'), roughness: 0.7 })
    )
    mesh.name = key
    mesh.userData = { furnitureId: item.id, item }
    mesh.position.set(position.x, h / 2, position.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    onDone?.()
  }

  if (!item.glb) { buildBox(); return }

  if (meshCache.has(item.glb)) {
    const clone = meshCache.get(item.glb).clone()
    clone.name = key
    clone.userData = { furnitureId: item.id, item }
    clone.position.set(position.x, 0, position.z)
    scene.add(clone)
    onDone?.()
    return
  }

  gltfLoader.load(
    item.glb,
    (gltf) => {
      const obj = gltf.scene
      const box = new THREE.Box3().setFromObject(obj)
      const sz  = new THREE.Vector3()
      box.getSize(sz)
      const scale = Math.min(w / sz.x, h / sz.y, depth / sz.z) * 0.9
      obj.scale.setScalar(scale)
      const b2 = new THREE.Box3().setFromObject(obj)
      obj.position.set(position.x, -b2.min.y, position.z)
      obj.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
      meshCache.set(item.glb, obj.clone())
      obj.name = key
      obj.userData = { furnitureId: item.id, item }
      scene.add(obj)
      onDone?.()
    },
    undefined,
    buildBox
  )
}

/* ─── Highlight selected object ─── */
function applyHighlight(obj, on) {
  if (!obj) return
  obj.traverse(c => {
    if (!c.isMesh) return
    if (on) {
      if (!c.userData._savedEmissive) c.userData._savedEmissive = c.material.emissive?.getHex?.() ?? 0
      c.material = c.material.clone()
      c.material.emissive    = new THREE.Color(ACCENT_COLOR)
      c.material.emissiveIntensity = 0.35
    } else {
      if (c.material.emissive && c.userData._savedEmissive !== undefined) {
        c.material.emissive.setHex(c.userData._savedEmissive)
        c.material.emissiveIntensity = 0
      }
    }
  })
}

/* ─── 2D Wall-draw line helper ─── */
function Wall2D({ pts }) {
  // draws a closed polygon outline on the XZ plane
  const points = pts.map(p => new THREE.Vector3(p.x, 0.005, p.z))
  if (points.length > 1) points.push(points[0]) // close
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  const mat = new THREE.LineBasicMaterial({ color: ACCENT_COLOR, linewidth: 2 })
  return new THREE.Line(geo, mat)
}

/* ════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════ */
export default function ThreeViewport({ step = 1, mode = '3d', addedItems = [], appliedTemplate = null, onSelectFurniture }) {
  const mountRef    = useRef(null)
  const rendRef     = useRef(null)
  const sceneRef    = useRef(null)
  const camRef      = useRef(null)
  const ctrlRef     = useRef(null)
  const frameRef    = useRef(null)
  const lightsRef   = useRef({})
  const prevItemsRef = useRef([])
  const selectedRef  = useRef(null)
  const wallPtsRef   = useRef([])
  const wall2dRef    = useRef(null)
  const raycaster    = useRef(new THREE.Raycaster())
  const mouse        = useRef(new THREE.Vector2())

  const [drawMode, setDrawMode] = useState(false) // step 1 drawing active
  const [wallCount, setWallCount] = useState(0)
  const [hint, setHint] = useState('')

  /* ── init renderer + scene (once) ── */
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(Math.max(el.clientWidth, 1), Math.max(el.clientHeight, 1))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    rendRef.current = renderer

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a24)
    scene.fog = new THREE.FogExp2(0x1a1a24, 0.04)
    sceneRef.current = scene

    const cam = new THREE.PerspectiveCamera(55, Math.max(el.clientWidth, 1) / Math.max(el.clientHeight, 1), 0.1, 80)
    cam.position.set(4, 3.5, 5)
    camRef.current = cam

    const controls = new OrbitControls(cam, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.target.set(0, 1, 0)
    controls.minDistance = 0.8
    controls.maxDistance = 16
    controls.maxPolarAngle = Math.PI / 2.05
    ctrlRef.current = controls

    // Lights
    const ambient = new THREE.AmbientLight(0xfff8ec, 0.7)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xfff5e0, 2.2)
    sun.position.set(5, 8, 4)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 30
    sun.shadow.camera.left = -8
    sun.shadow.camera.right = 8
    sun.shadow.camera.top = 8
    sun.shadow.camera.bottom = -8
    sun.shadow.bias = -0.001
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0xdde8ff, 0.45)
    fill.position.set(-4, 3, -3)
    scene.add(fill)

    const ceiling = new THREE.PointLight(0xfff0d0, 1.8, 10)
    ceiling.position.set(0, 2.6, 0)
    ceiling.castShadow = true
    scene.add(ceiling)

    lightsRef.current = { sun, fill, ceiling, ambient }

    buildRoom(scene)

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, cam)
    }
    animate()

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) return
      cam.aspect = w / h
      cam.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(el)
    requestAnimationFrame(() => {
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) return
      cam.aspect = w / h
      cam.updateProjectionMatrix()
      renderer.setSize(w, h)
    })

    return () => {
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [])

  /* ── Step camera presets ── */
  useEffect(() => {
    const cam = camRef.current
    const ctrl = ctrlRef.current
    const scene = sceneRef.current
    if (!cam || !ctrl || !scene) return

    // Show/hide grid based on step
    const room = scene.getObjectByName('room')
    const grid = room?.getObjectByName('grid')
    if (grid) grid.visible = (step === 1)

    if (step === 1) {
      // Top-down 2D view
      cam.position.set(0, 9, 0.01)
      ctrl.target.set(0, 0, 0)
      ctrl.maxPolarAngle = 0.15
      ctrl.minDistance = 3
      ctrl.maxDistance = 14
      setHint('Click on floor to draw walls  ·  Right-click to finish room')
    } else if (step === 2) {
      // 3D perspective
      cam.position.set(4, 3.5, 5)
      ctrl.target.set(0, 1, 0)
      ctrl.maxPolarAngle = Math.PI / 2.05
      ctrl.minDistance = 0.8
      ctrl.maxDistance = 16
      setHint('Drag — Orbit  ·  Scroll — Zoom  ·  Click furniture to select')
    } else if (step === 3) {
      // Cinematic render angle
      cam.position.set(3.5, 2.2, 4)
      ctrl.target.set(-0.5, 1.2, 0)
      ctrl.maxPolarAngle = Math.PI / 2.2
      ctrl.update()
      setHint('Render preview  ·  Choose camera angle then export')
    }
    ctrl.update()
  }, [step])

  /* ── Render-quality lighting for Step 3 ── */
  useEffect(() => {
    const { sun, fill, ceiling, ambient } = lightsRef.current
    if (!sun) return
    if (step === 3) {
      if (rendRef.current) rendRef.current.toneMappingExposure = 1.55
      sun.intensity = 3.0
      ceiling.intensity = 2.4
      ambient.intensity = 0.5
    } else {
      if (rendRef.current) rendRef.current.toneMappingExposure = 1.15
      sun.intensity = 2.2
      ceiling.intensity = 1.8
      ambient.intensity = 0.7
    }
  }, [step])

  /* ── Applied template → change wall / floor color ── */
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const room = scene.getObjectByName('room')
    if (!room) return

    const palettes = {
      'Scandinavian': { wall: 0xf5f5f0, floor: 0xd4c5a9 },
      'Japandi':      { wall: 0xede9e0, floor: 0xb8a898 },
      'Contemporary': { wall: 0xf0ece8, floor: 0x9a8878 },
      'Industrial':   { wall: 0x6a6a6a, floor: 0x555555 },
      'Bohemian':     { wall: 0xf5e8d8, floor: 0xc4a882 },
      'Art Deco':     { wall: 0x2a2420, floor: 0x1a1208 },
      'Minimalist':   { wall: 0xffffff, floor: 0xe8e8e8 },
    }

    const pal = appliedTemplate ? palettes[appliedTemplate.style] || palettes['Contemporary'] : { wall: WALL_COLOR, floor: FLOOR_COLOR }

    room.traverse(c => {
      if (!c.isMesh || c.name === 'grid') return
      if (c.name === 'floor') {
        c.material = c.material.clone()
        c.material.color.setHex(pal.floor)
      } else if (c.geometry?.type === 'PlaneGeometry') {
        c.material = c.material.clone()
        c.material.color.setHex(pal.wall)
      }
    })
  }, [appliedTemplate])

  /* ── Sync furniture ── */
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const prev = prevItemsRef.current
    const currIds = new Set(addedItems.map(i => i.id))

    // Remove
    prev.filter(i => !currIds.has(i.id)).forEach(item => {
      const obj = scene.getObjectByName(`furniture_${item.id}`)
      if (obj) scene.remove(obj)
    })

    // Add
    const prevIds = new Set(prev.map(i => i.id))
    addedItems.filter(i => !prevIds.has(i.id)).forEach((item, idx) => {
      const total = addedItems.length
      const angle  = (idx / Math.max(total, 1)) * Math.PI * 1.5 - Math.PI * 0.25
      const radius = 1.0 + (idx % 4) * 0.7
      placeFurniture(scene, item, {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
      })
    })

    prevItemsRef.current = addedItems
  }, [addedItems])

  /* ── 2D wall drawing: click on floor to add point ── */
  const onFloorClick = useCallback((e) => {
    const el = mountRef.current
    const scene = sceneRef.current
    const cam = camRef.current
    if (!el || !scene || !cam) return

    const rect = el.getBoundingClientRect()
    mouse.current.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1
    mouse.current.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1

    raycaster.current.setFromCamera(mouse.current, cam)

    // Step 1: draw walls on floor
    if (step === 1) {
      const floor = scene.getObjectByName('floor')
      if (!floor) return
      const hits = raycaster.current.intersectObject(floor)
      if (!hits.length) return

      const pt = { x: hits[0].point.x, z: hits[0].point.z }
      wallPtsRef.current = [...wallPtsRef.current, pt]
      setWallCount(wallPtsRef.current.length)

      // Redraw wall outline
      if (wall2dRef.current) scene.remove(wall2dRef.current)
      if (wallPtsRef.current.length >= 2) {
        const line = Wall2D({ pts: wallPtsRef.current })
        line.name = 'wall2d'
        wall2dRef.current = line
        scene.add(line)
      }
      return
    }

    // Step 2/3: select furniture
    const hits = raycaster.current.intersectObjects(scene.children, true)
    let found = null
    for (const h of hits) {
      let obj = h.object
      while (obj.parent && !obj.userData.furnitureId) obj = obj.parent
      if (obj.userData.furnitureId) { found = obj; break }
    }
    if (selectedRef.current) applyHighlight(selectedRef.current, false)
    selectedRef.current = found
    if (found) {
      applyHighlight(found, true)
      onSelectFurniture?.(found.userData.item)
    } else {
      onSelectFurniture?.(null)
    }
  }, [step, onSelectFurniture])

  /* ── Right-click to close wall polygon ── */
  const onContextMenu = useCallback((e) => {
    e.preventDefault()
    if (step !== 1) return
    wallPtsRef.current = []
    setWallCount(0)
    const scene = sceneRef.current
    if (wall2dRef.current) { scene.remove(wall2dRef.current); wall2dRef.current = null }
  }, [step])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* WebGL canvas mount */}
      <div
        ref={mountRef}
        onClick={onFloorClick}
        onContextMenu={onContextMenu}
        style={{ position: 'absolute', inset: 0, cursor: step === 1 ? 'crosshair' : 'grab' }}
      />

      {/* Step badge */}
      <div style={{ position:'absolute', top:12, left:12, pointerEvents:'none',
        background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)',
        padding:'5px 12px', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:800, color:GOLD,
          letterSpacing:'0.22em', textTransform:'uppercase' }}>
          Step {String(step).padStart(2,'0')} — {step===1?'2D DRAW':step===2?'3D DESIGN':'RENDER'}
        </span>
      </div>

      {/* Hint bar */}
      <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)',
        pointerEvents:'none', background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)',
        padding:'5px 14px', whiteSpace:'nowrap',
        fontFamily:"'DM Sans',sans-serif", fontSize:9, color:'rgba(255,255,255,0.5)',
        letterSpacing:'0.08em' }}>
        {hint}
        {step === 1 && wallCount > 0 && <span style={{ color:GOLD, marginLeft:10 }}>{wallCount} points — right-click to clear</span>}
      </div>

      {/* Step 1: draw toolbar overlay */}
      {step === 1 && (
        <div style={{ position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:4 }}>
          {[['⬜','Wall'],['🚪','Door'],['🪟','Window'],['📐','Measure'],['🗑','Clear']].map(([icon,label]) => (
            <button key={label}
              onClick={label === 'Clear' ? (e) => { e.stopPropagation(); wallPtsRef.current=[]; setWallCount(0); const s=sceneRef.current; if(wall2dRef.current){s.remove(wall2dRef.current);wall2dRef.current=null} } : (e)=>e.stopPropagation()}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px',
                background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
                border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif", fontSize:10, color:'rgba(255,255,255,0.75)',
                textAlign:'left' }}>
              <span style={{ fontSize:14 }}>{icon}</span>{label}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: furniture count badge */}
      {step === 2 && addedItems.length > 0 && (
        <div style={{ position:'absolute', top:12, right:12, pointerEvents:'none',
          background:'rgba(201,162,39,0.18)', border:'1px solid rgba(201,162,39,0.4)',
          backdropFilter:'blur(6px)', padding:'6px 12px' }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, color:GOLD, letterSpacing:'0.12em' }}>
            {addedItems.length} ITEM{addedItems.length!==1?'S':''} IN ROOM
          </span>
        </div>
      )}

      {/* Step 3: render controls overlay */}
      {step === 3 && (
        <div style={{ position:'absolute', bottom:44, right:12, display:'flex', gap:6 }}>
          {['Front','Left','Top','Aerial'].map(v => (
            <button key={v}
              style={{ padding:'5px 12px', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
                border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)',
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700 }}
              onClick={(e) => {
                e.stopPropagation()
                const cam = camRef.current, ctrl = ctrlRef.current
                if (!cam || !ctrl) return
                const presets = {
                  Front: [[3.5, 2.2, 4],   [-0.5, 1.2, 0]],
                  Left:  [[-5,  2.0, 0],   [0,    1.0, 0]],
                  Top:   [[0,   9,   0.01],[0,    0,   0]],
                  Aerial:[[5,   5,   5],   [0,    0.5, 0]],
                }
                const [p, t] = presets[v]
                cam.position.set(...p)
                ctrl.target.set(...t)
                ctrl.update()
              }}>
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
