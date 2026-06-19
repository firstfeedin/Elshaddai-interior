import { useEffect, useRef, useState, useCallback } from 'react'

let _BABYLON = null
async function loadBabylon() {
  if (_BABYLON) return _BABYLON
  const core = await import('@babylonjs/core')
  await import('@babylonjs/loaders/glTF')
  _BABYLON = core
  return _BABYLON
}

// ─── Icons (inline SVG) ─────────────────────────────────────────────────────
const Ico = {
  search:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  undo:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
  redo:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>,
  grid2d:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  cube3d:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  camera:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  save:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  home:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  brush:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L3 14.67V21h6.33l10.06-10.06a5.5 5.5 0 0 0 0-7.78v0z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="6.5"/></svg>,
  house:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  copy:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  trash:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  cursor:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/></svg>,
  close:    '×',
}

// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id:'all',      emoji:'🏠', label:'All'       },
  { id:'seating',  emoji:'🛋️', label:'Seating'   },
  { id:'bedroom',  emoji:'🛏️', label:'Bedroom'   },
  { id:'dining',   emoji:'🍽️', label:'Dining'    },
  { id:'storage',  emoji:'📦', label:'Storage'   },
  { id:'lighting', emoji:'💡', label:'Lighting'  },
  { id:'decor',    emoji:'🌿', label:'Decor'     },
  { id:'kitchen',  emoji:'🍳', label:'Kitchen'   },
  { id:'office',   emoji:'💼', label:'Office'    },
  { id:'outdoor',  emoji:'🌳', label:'Outdoor'   },
]

const FURNITURE = [
  // Seating
  { id:'sofa',        name:'3-Seater Sofa',     cat:'seating', w:2.2, h:0.85,d:0.9,  price:45000, color:'#8B7355', emoji:'🛋️' },
  { id:'loveseat',    name:'Loveseat',           cat:'seating', w:1.4, h:0.82,d:0.85, price:28000, color:'#7B6345', emoji:'🛋️' },
  { id:'sectional',   name:'Sectional Sofa',     cat:'seating', w:3.0, h:0.85,d:1.6,  price:85000, color:'#A09080', emoji:'🛋️' },
  { id:'accent-ch',   name:'Accent Chair',       cat:'seating', w:0.8, h:0.9, d:0.8,  price:12000, color:'#C09060', emoji:'🪑' },
  { id:'recliner',    name:'Recliner Chair',     cat:'seating', w:0.9, h:1.0, d:0.9,  price:22000, color:'#8B5E3C', emoji:'🪑' },
  { id:'ottoman',     name:'Ottoman',            cat:'seating', w:0.7, h:0.4, d:0.7,  price:8000,  color:'#8B7050', emoji:'🪑' },
  { id:'coffee-tbl',  name:'Coffee Table',       cat:'seating', w:1.1, h:0.4, d:0.6,  price:15000, color:'#7B6040', emoji:'☕' },
  { id:'side-tbl',    name:'Side Table',         cat:'seating', w:0.5, h:0.55,d:0.5,  price:6000,  color:'#9B8060', emoji:'🪵' },
  // Bedroom
  { id:'dbl-bed',     name:'Double Bed',         cat:'bedroom', w:1.8, h:0.5, d:2.1,  price:35000, color:'#8B7355', emoji:'🛏️' },
  { id:'king-bed',    name:'King Bed',           cat:'bedroom', w:2.0, h:0.5, d:2.1,  price:55000, color:'#7A6345', emoji:'🛏️' },
  { id:'bunk-bed',    name:'Bunk Bed',           cat:'bedroom', w:1.0, h:1.8, d:2.0,  price:28000, color:'#D4A96A', emoji:'🛏️' },
  { id:'wardrobe',    name:'Wardrobe',           cat:'bedroom', w:1.8, h:2.2, d:0.6,  price:55000, color:'#D8CFC0', emoji:'🚪' },
  { id:'dresser',     name:'Dresser',            cat:'bedroom', w:1.2, h:0.85,d:0.5,  price:18000, color:'#C8B898', emoji:'🪞' },
  { id:'nightstand',  name:'Nightstand',         cat:'bedroom', w:0.5, h:0.55,d:0.4,  price:8000,  color:'#B8A888', emoji:'🪵' },
  { id:'vanity',      name:'Vanity Table',       cat:'bedroom', w:1.0, h:0.75,d:0.45, price:15000, color:'#E8D8C0', emoji:'🪞' },
  // Dining
  { id:'dining-tbl',  name:'Dining Table 4-Seat',cat:'dining',  w:1.6, h:0.75,d:0.9,  price:28000, color:'#6B4C30', emoji:'🍽️' },
  { id:'dining-tbl6', name:'Dining Table 6-Seat',cat:'dining',  w:2.2, h:0.75,d:0.9,  price:42000, color:'#5A3C22', emoji:'🍽️' },
  { id:'dining-ch',   name:'Dining Chair',       cat:'dining',  w:0.5, h:0.9, d:0.5,  price:6000,  color:'#4A3520', emoji:'🪑' },
  { id:'barstool',    name:'Bar Stool',          cat:'dining',  w:0.4, h:1.1, d:0.4,  price:5500,  color:'#2C2C2C', emoji:'🪑' },
  { id:'buffet',      name:'Buffet Cabinet',     cat:'dining',  w:1.6, h:0.85,d:0.45, price:35000, color:'#8B6040', emoji:'🗄️' },
  // Storage
  { id:'bookshelf',   name:'Bookshelf 5-Tier',   cat:'storage', w:1.0, h:2.0, d:0.3,  price:18000, color:'#D4A96A', emoji:'📚' },
  { id:'tv-unit',     name:'TV Unit',            cat:'storage', w:1.8, h:0.45,d:0.4,  price:22000, color:'#2C2C2C', emoji:'📺' },
  { id:'sideboard',   name:'Sideboard',          cat:'storage', w:1.6, h:0.75,d:0.4,  price:28000, color:'#7B5C38', emoji:'🗄️' },
  { id:'shoe-rack',   name:'Shoe Rack',          cat:'storage', w:1.0, h:1.5, d:0.35, price:8000,  color:'#C8A878', emoji:'👟' },
  { id:'storage-box', name:'Storage Ottoman',    cat:'storage', w:0.8, h:0.45,d:0.5,  price:6500,  color:'#9A8068', emoji:'📦' },
  // Lighting
  { id:'floor-lamp',  name:'Arc Floor Lamp',     cat:'lighting',w:0.3, h:1.8, d:0.3,  price:8000,  color:'#C8A050', emoji:'💡' },
  { id:'table-lamp',  name:'Table Lamp',         cat:'lighting',w:0.25,h:0.5, d:0.25, price:4500,  color:'#D0B870', emoji:'🕯️' },
  { id:'pendant',     name:'Pendant Light',      cat:'lighting',w:0.4, h:0.3, d:0.4,  price:6500,  color:'#F0C840', emoji:'💡' },
  { id:'wall-sconce', name:'Wall Sconce',        cat:'lighting',w:0.2, h:0.25,d:0.15, price:3500,  color:'#B09820', emoji:'🕯️' },
  // Decor
  { id:'plant-lg',    name:'Large Fiddle Leaf',  cat:'decor',   w:0.6, h:1.4, d:0.6,  price:5000,  color:'#2D6A4F', emoji:'🌿' },
  { id:'plant-sm',    name:'Potted Succulent',   cat:'decor',   w:0.3, h:0.6, d:0.3,  price:2500,  color:'#3A8C5C', emoji:'🪴' },
  { id:'plant-palm',  name:'Indoor Palm',        cat:'decor',   w:0.8, h:2.0, d:0.8,  price:7500,  color:'#226640', emoji:'🌴' },
  { id:'rug',         name:'Area Rug',           cat:'decor',   w:2.5, h:0.02,d:1.8,  price:12000, color:'#C8B098', emoji:'🪣' },
  { id:'mirror',      name:'Full-Length Mirror', cat:'decor',   w:0.6, h:1.8, d:0.05, price:9000,  color:'#C0C0C0', emoji:'🪞' },
  { id:'art-frame',   name:'Wall Art Frame',     cat:'decor',   w:1.0, h:0.8, d:0.05, price:7000,  color:'#8B7060', emoji:'🖼️' },
  // Kitchen
  { id:'kitchen-isl', name:'Kitchen Island',     cat:'kitchen', w:2.4, h:0.9, d:0.7,  price:85000, color:'#E8E0D0', emoji:'🍳' },
  { id:'fridge',      name:'Refrigerator',       cat:'kitchen', w:0.75,h:1.8, d:0.7,  price:45000, color:'#E0E0E0', emoji:'🧊' },
  { id:'oven',        name:'Oven / Microwave',   cat:'kitchen', w:0.6, h:0.45,d:0.5,  price:15000, color:'#D0D0D0', emoji:'🍳' },
  { id:'sink-unit',   name:'Kitchen Sink Unit',  cat:'kitchen', w:1.2, h:0.9, d:0.6,  price:25000, color:'#C8C8C8', emoji:'🚿' },
  // Office
  { id:'desk',        name:'Work Desk',          cat:'office',  w:1.4, h:0.75,d:0.7,  price:18000, color:'#D4A96A', emoji:'💼' },
  { id:'desk-chair',  name:'Ergonomic Chair',    cat:'office',  w:0.65,h:1.2, d:0.65, price:14000, color:'#1A1A2E', emoji:'🪑' },
  { id:'bookcase',    name:'Office Bookcase',    cat:'office',  w:1.2, h:2.2, d:0.35, price:22000, color:'#D8CFC0', emoji:'📚' },
  { id:'filing-cab',  name:'Filing Cabinet',     cat:'office',  w:0.45,h:1.35,d:0.6,  price:9500,  color:'#A0A0A8', emoji:'🗄️' },
  // Outdoor
  { id:'outdoor-sofa',name:'Garden Sofa',        cat:'outdoor', w:2.0, h:0.8, d:0.85, price:32000, color:'#8B9880', emoji:'🌳' },
  { id:'outdoor-tbl', name:'Garden Table',       cat:'outdoor', w:1.4, h:0.72,d:0.8,  price:18000, color:'#7A8878', emoji:'🌿' },
  { id:'hammock',     name:'Hammock Stand',      cat:'outdoor', w:2.8, h:1.2, d:1.0,  price:12000, color:'#C8B098', emoji:'🌴' },
]

const PBR_MATS = [
  { id:'white',      label:'White Plaster',   hex:'#F5F5F0', r:0.9,  m:0    },
  { id:'beige',      label:'Warm Beige',      hex:'#EAD5B8', r:0.85, m:0    },
  { id:'cream',      label:'Cream',           hex:'#F8F2E6', r:0.88, m:0    },
  { id:'oak',        label:'Light Oak',       hex:'#C8A86B', r:0.7,  m:0    },
  { id:'walnut',     label:'Dark Walnut',     hex:'#4A3220', r:0.65, m:0    },
  { id:'pine',       label:'Pine Wood',       hex:'#E0B87A', r:0.75, m:0    },
  { id:'marble',     label:'Carrara Marble',  hex:'#F0EBE0', r:0.15, m:0.05 },
  { id:'black-mrbl', label:'Black Marble',    hex:'#1C1C1C', r:0.1,  m:0.1  },
  { id:'charcoal',   label:'Charcoal',        hex:'#2C2C2C', r:0.8,  m:0    },
  { id:'navy',       label:'Navy Blue',       hex:'#1B2A4A', r:0.95, m:0    },
  { id:'forest',     label:'Forest Green',    hex:'#2D5A3D', r:0.85, m:0    },
  { id:'terra',      label:'Terracotta',      hex:'#C17A4E', r:0.8,  m:0    },
  { id:'blush',      label:'Blush Pink',      hex:'#E8C4B8', r:0.88, m:0    },
  { id:'mustard',    label:'Mustard Yellow',  hex:'#D4A820', r:0.85, m:0    },
  { id:'gold',       label:'Brushed Gold',    hex:'#B8860B', r:0.2,  m:0.9  },
  { id:'copper',     label:'Aged Copper',     hex:'#8C4A30', r:0.25, m:0.85 },
  { id:'chrome',     label:'Chrome',          hex:'#C8C8C8', r:0.05, m:1.0  },
  { id:'concrete',   label:'Concrete',        hex:'#9CA3AF', r:0.5,  m:0.05 },
  { id:'emerald',    label:'Emerald',         hex:'#1A5C40', r:0.8,  m:0    },
  { id:'slate',      label:'Dark Slate',      hex:'#374151', r:0.6,  m:0.1  },
]

const ROOM_STYLES = [
  { id:'modern',      label:'Modern',         wall:'#F8F8F6', floor:'#D0D0CC', accent:'#2C2C2C' },
  { id:'warm',        label:'Warm Classic',   wall:'#F5E8D0', floor:'#C8A86B', accent:'#6B3A20' },
  { id:'scandi',      label:'Scandinavian',   wall:'#FAFAF8', floor:'#E8D5B0', accent:'#4A4A40' },
  { id:'dark-luxury', label:'Dark Luxury',    wall:'#1E2535', floor:'#2A2A2A', accent:'#B8860B' },
  { id:'industrial',  label:'Industrial',     wall:'#787878', floor:'#4A4A4A', accent:'#FF6B00' },
  { id:'japandi',     label:'Japandi',        wall:'#F0EDE8', floor:'#D8C8A8', accent:'#3A3228' },
  { id:'bohemian',    label:'Bohemian',       wall:'#F0E8D8', floor:'#C8A068', accent:'#8B2E2E' },
  { id:'coastal',     label:'Coastal',        wall:'#E8F4F8', floor:'#C8D8D0', accent:'#2A7B8C' },
  { id:'art-deco',    label:'Art Deco',       wall:'#1A1A2E', floor:'#2C2820', accent:'#C8A020' },
  { id:'minimalist',  label:'Minimalist',     wall:'#FFFFFF', floor:'#E8E8E8', accent:'#000000' },
]

const ENV_MODES = [
  { id:'bright',  label:'☀️ Bright',   hi:0.9,  di:1.5,  dc:'#fff8f0' },
  { id:'soft',    label:'🌤 Soft',     hi:0.5,  di:1.0,  dc:'#fff5e8' },
  { id:'evening', label:'🌆 Evening',  hi:0.15, di:0.6,  dc:'#ffb870' },
  { id:'night',   label:'🌙 Night',    hi:0.05, di:0.3,  dc:'#8060ff' },
]

// ─── Component ──────────────────────────────────────────────────────────────

// ── Material rate table (₹ per sq ft) for cost estimation ──────────────────
const MATERIAL_RATES = {
  floor: { tile:'₹80–120/sq ft', marble:'₹200–400/sq ft', wood:'₹150–250/sq ft', vinyl:'₹60–100/sq ft' },
  wall:  { paint:'₹18–25/sq ft', wallpaper:'₹60–120/sq ft', tile:'₹80–150/sq ft', panel:'₹200–350/sq ft' },
  ceil:  { paint:'₹15–20/sq ft', gypsum:'₹45–80/sq ft', pvc:'₹35–60/sq ft' },
}
const LABOR_RATE_PER_SQFT = 350  // ₹ per sq ft (Indian market avg)
const GST_RATE = 0.18

export default function BabylonDesigner({ onSave, onSwitch2D, floorPlanData }) {
  const canvasRef  = useRef(null)
  const engineRef  = useRef(null)
  const sceneRef   = useRef(null)
  const shadowRef  = useRef(null)
  const gizmoRef   = useRef(null)
  const meshMapRef = useRef({})
  const selectedId = useRef(null)

  const [ready,       setReady]       = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [cat,         setCat]         = useState('all')
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState(null)
  const [items,       setItems]       = useState([])
  const [totalCost,   setTotalCost]   = useState(0)
  const [roomStyle,   setRoomStyle]   = useState(ROOM_STYLES[0])
  const [envMode,     setEnvMode]     = useState(ENV_MODES[0])
  const [roomW,       setRoomW]       = useState(6)
  const [roomD,       setRoomD]       = useState(5)
  const [roomH,       setRoomH]       = useState(2.8)
  const [rightTab,    setRightTab]    = useState('props')
  const [propPos,     setPropPos]     = useState({ x:0, y:0, z:0 })
  const [fpImported,  setFpImported]  = useState(false)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [aiSuggestion,setAiSuggestion]= useState('')
  const [saveStatus,  setSaveStatus]  = useState('')
  const [floorMat,    setFloorMat]    = useState('tile')
  const [wallFinish,  setWallFinish]  = useState('paint')
  const [ceilFinish,  setCeilFinish]  = useState('paint')

  // ── Init Babylon ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      const B = await loadBabylon()
      if (cancelled) return
      const canvas = canvasRef.current
      const engine = new B.Engine(canvas, true, { preserveDrawingBuffer:true, stencil:true, adaptToDeviceRatio:true })
      engineRef.current = engine

      const scene = new B.Scene(engine)
      scene.clearColor = new B.Color4(0.94, 0.94, 0.92, 1)
      sceneRef.current = scene

      const cam = new B.ArcRotateCamera('cam', -Math.PI/5, Math.PI/3.2, 11, B.Vector3.Zero(), scene)
      cam.attachControl(canvas, true)
      cam.lowerRadiusLimit = 2; cam.upperRadiusLimit = 25
      cam.upperBetaLimit   = Math.PI/2.05
      cam.wheelDeltaPercentage = 0.008

      const hemi = new B.HemisphericLight('hemi', new B.Vector3(0,1,0), scene)
      hemi.intensity = 0.9; hemi.diffuse = new B.Color3(1,0.98,0.95)
      hemi.groundColor = new B.Color3(0.7,0.7,0.65)

      const dir = new B.DirectionalLight('dir', new B.Vector3(-1,-2,-0.8), scene)
      dir.position = new B.Vector3(5,8,4); dir.intensity = 1.5

      const shadow = new B.ShadowGenerator(2048, dir)
      shadow.useBlurExponentialShadowMap = true; shadow.blurKernel = 12; shadow.bias = 0.001
      shadowRef.current = shadow

      const gm = new B.GizmoManager(scene)
      gm.positionGizmoEnabled = true; gm.usePointerToAttachGizmos = false
      gizmoRef.current = gm

      scene.onPointerDown = (evt, pick) => {
        if (evt.button !== 0) return
        if (pick.hit && pick.pickedMesh) {
          let root = pick.pickedMesh
          while (root.parent && root.parent !== scene) root = root.parent
          if (root.metadata?.fid) {
            selectedId.current = root.metadata.fid
            setSelected(root.metadata)
            gm.attachToMesh(root)
            setPropPos({ x:+root.position.x.toFixed(2), y:+root.position.y.toFixed(2), z:+root.position.z.toFixed(2) })
            setRightTab('props')
            return
          }
        }
        gm.attachToMesh(null); selectedId.current = null; setSelected(null)
      }

      engine.runRenderLoop(() => scene.render())
      window.addEventListener('resize', () => engine.resize())
      if (!cancelled) { setReady(true); setLoading(false) }
    }
    boot().catch(e => { setLoading(false); console.error(e) })
    return () => { cancelled = true; engineRef.current?.dispose() }
  }, [])

  useEffect(() => {
    if (!ready) return
    loadBabylon().then(B => {
      const scene = sceneRef.current
      scene.meshes.filter(m => m.metadata?.isRoom).forEach(m => m.dispose())
      buildRoom(scene, B, roomW, roomD, roomH, roomStyle)
    })
  }, [ready, roomW, roomD, roomH, roomStyle])

  // ── 2D → 3D: Import floor plan walls ────────────────────────────────────────
  useEffect(() => {
    if (!ready || !floorPlanData?.walls?.length) return
    loadBabylon().then(B => {
      const scene = sceneRef.current
      // Remove previous floor-plan-generated meshes
      scene.meshes.filter(m => m.metadata?.isFloorPlan).forEach(m => m.dispose())

      const walls = floorPlanData.walls
      const h = roomH

      // Find bounding box to center the floor plan in the scene
      const xs = walls.flatMap(w => [w.x1, w.x2])
      const zs = walls.flatMap(w => [w.y1, w.y2])
      const minX = Math.min(...xs), maxX = Math.max(...xs)
      const minZ = Math.min(...zs), maxZ = Math.max(...zs)
      const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2
      const sceneW = maxX - minX, sceneD = maxZ - minZ

      // Floor
      const floorMesh = B.MeshBuilder.CreateBox('fp_floor', { width: sceneW, height: 0.02, depth: sceneD }, scene)
      floorMesh.position = new B.Vector3(cx - cx, -0.01, cz - cz)
      const fm = new B.PBRMetallicRoughnessMaterial('fp_floor_mat', scene)
      fm.baseColor = B.Color3.FromHexString(roomStyle.floor); fm.roughness = 0.45; fm.metallic = 0
      floorMesh.material = fm; floorMesh.receiveShadows = true; floorMesh.metadata = { isFloorPlan: true, isRoom: true }

      // Ceiling
      const ceilMesh = B.MeshBuilder.CreateBox('fp_ceil', { width: sceneW, height: 0.04, depth: sceneD }, scene)
      ceilMesh.position = new B.Vector3(0, h + 0.02, 0)
      const cm = new B.PBRMetallicRoughnessMaterial('fp_ceil_mat', scene)
      cm.baseColor = B.Color3.FromHexString('#FFFFFF'); cm.roughness = 0.9; cm.metallic = 0
      ceilMesh.material = cm; ceilMesh.metadata = { isFloorPlan: true, isRoom: true }

      // Walls — extrude each 2D wall segment into a 3D wall box
      const THICKNESS = 0.15
      walls.forEach((w, i) => {
        const x1 = w.x1 - cx, z1 = w.y1 - cz
        const x2 = w.x2 - cx, z2 = w.y2 - cz
        const length = Math.hypot(x2 - x1, z2 - z1)
        if (length < 0.01) return

        const angle = Math.atan2(z2 - z1, x2 - x1)
        const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2

        const wallMesh = B.MeshBuilder.CreateBox(`fp_wall_${i}`, { width: length + THICKNESS, height: h, depth: THICKNESS }, scene)
        wallMesh.position = new B.Vector3(mx, h / 2, mz)
        wallMesh.rotation.y = -angle
        wallMesh.receiveShadows = true
        shadowRef.current?.addShadowCaster(wallMesh)

        const wm = new B.PBRMetallicRoughnessMaterial(`fp_wall_mat_${i}`, scene)
        wm.baseColor = B.Color3.FromHexString(roomStyle.wall); wm.roughness = 0.85; wm.metallic = 0
        wallMesh.material = wm; wallMesh.metadata = { isFloorPlan: true, isRoom: true }
      })

      // Update room dimensions from floor plan data
      setRoomW(+sceneW.toFixed(1)); setRoomD(+sceneD.toFixed(1))
      setFpImported(true)
    })
  }, [ready, floorPlanData, roomH, roomStyle])

  useEffect(() => {
    if (!ready) return
    loadBabylon().then(B => {
      const scene = sceneRef.current
      const hemi = scene.getLightByName('hemi'); const dir = scene.getLightByName('dir')
      if (hemi) hemi.intensity = envMode.hi
      if (dir)  { dir.intensity = envMode.di; dir.diffuse = B.Color3.FromHexString(envMode.dc) }
    })
  }, [ready, envMode])

  const addItem = useCallback(async item => {
    const B = await loadBabylon()
    const root = buildMesh(sceneRef.current, B, item)
    shadowRef.current?.addShadowCaster(root)
    meshMapRef.current[root.metadata.fid] = root
    setItems(prev => { const n=[...prev,{...item,fid:root.metadata.fid}]; setTotalCost(n.reduce((s,i)=>s+i.price,0)); return n })
  }, [])

  const removeSelected = useCallback(() => {
    const id = selectedId.current; if (!id) return
    meshMapRef.current[id]?.dispose(); delete meshMapRef.current[id]
    gizmoRef.current?.attachToMesh(null); selectedId.current = null; setSelected(null)
    setItems(prev => { const n=prev.filter(i=>i.fid!==id); setTotalCost(n.reduce((s,i)=>s+i.price,0)); return n })
  }, [])

  const rotateSelected = useCallback((deg=90) => {
    const m = meshMapRef.current[selectedId.current]
    if (m) m.rotation.y += deg * Math.PI / 180
  }, [])

  const applyPos = useCallback((axis, val) => {
    const m = meshMapRef.current[selectedId.current]; if (!m) return
    m.position[axis] = parseFloat(val)||0; setPropPos(p=>({...p,[axis]:val}))
  }, [])

  const applyMaterial = useCallback(async mat => {
    const m = meshMapRef.current[selectedId.current]; if (!m) return
    const B = await loadBabylon()
    const pbr = new B.PBRMetallicRoughnessMaterial(`mat_${Date.now()}`, sceneRef.current)
    pbr.baseColor = B.Color3.FromHexString(mat.hex); pbr.metallic = mat.m; pbr.roughness = mat.r
    m.getChildMeshes(false).forEach(c => c.material = pbr); m.material = pbr
  }, [])

  const duplicate = useCallback(async () => {
    const id = selectedId.current; if (!id) return
    const original = items.find(i=>i.fid===id); if (!original) return
    const B = await loadBabylon()
    const root = buildMesh(sceneRef.current, B, original)
    root.position.x += 0.6; root.position.z += 0.6
    shadowRef.current?.addShadowCaster(root)
    meshMapRef.current[root.metadata.fid] = root
    setItems(prev => { const n=[...prev,{...original,fid:root.metadata.fid}]; setTotalCost(n.reduce((s,i)=>s+i.price,0)); return n })
  }, [items])

  const takeShot = useCallback(async () => {
    const B = await loadBabylon()
    B.Tools.CreateScreenshot(engineRef.current, sceneRef.current.activeCamera, {width:1920,height:1080})
  }, [])

  const save = useCallback(async () => {
    const sceneData = { items, room:{w:roomW,d:roomD,h:roomH}, style:roomStyle.id, totalCost, floorPlanData }
    if (onSave) onSave(sceneData)

    // Save to backend if project ID is in URL
    const projectId = new URLSearchParams(window.location.search).get('project')
    if (projectId) {
      setSaveStatus('saving')
      try {
        const token = localStorage.getItem('es_token')
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/projects/${projectId}`, {
          method:'PATCH', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
          body: JSON.stringify({ scene_data: sceneData })
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus(''), 2000)
      } catch { setSaveStatus('error') }
    } else {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }
  }, [items, roomW, roomD, roomH, roomStyle, totalCost, onSave, floorPlanData])

  // ── Video Walkthrough ─────────────────────────────────────────────────────
  const [walkActive, setWalkActive] = useState(false)
  const walkRef = useRef(null)

  const startWalkthrough = useCallback(() => {
    const scene = sceneRef.current; if (!scene) return
    const cam = scene.activeCamera; if (!cam) return
    if (walkActive) {
      clearInterval(walkRef.current); setWalkActive(false); return
    }
    setWalkActive(true)
    let t = 0
    walkRef.current = setInterval(() => {
      t += 0.012
      cam.alpha  = -Math.PI/5 + Math.sin(t) * Math.PI
      cam.beta   = Math.PI/3.5 + Math.sin(t * 0.6) * 0.18
      cam.radius = 9 + Math.sin(t * 0.4) * 2
      if (t > Math.PI * 2) { clearInterval(walkRef.current); setWalkActive(false) }
    }, 40)
  }, [walkActive])

  // ── AI Design Suggestions ─────────────────────────────────────────────────
  const getAiSuggestions = useCallback(async () => {
    setAiLoading(true); setRightTab('ai')
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) { setAiSuggestion('Add VITE_GEMINI_API_KEY to .env to enable AI suggestions.'); setAiLoading(false); return }

    const roomArea = (roomW * roomD).toFixed(1)
    const existingFurniture = items.map(i => i.name).join(', ') || 'none'
    const prompt = `You are an expert Indian interior designer. Suggest 5 specific furniture pieces for a ${roomStyle.label} style room of ${roomArea} m² (${roomW}m × ${roomD}m, ${roomH}m height). Currently placed: ${existingFurniture}. Suggest items that complement the ${roomStyle.label} aesthetic. Format each suggestion as: "Item Name — brief reason (₹price range)". Focus on practical Indian market items.`

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{ parts:[{ text:prompt }] }] })
      })
      const data = await res.json()
      setAiSuggestion(data.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestions returned.')
    } catch (e) { setAiSuggestion('AI error: ' + e.message) }
    setAiLoading(false)
  }, [roomW, roomD, roomH, roomStyle, items])

  // ── Cost Breakdown ────────────────────────────────────────────────────────
  const costBreakdown = (() => {
    const area = roomW * roomD
    const sqft = area * 10.764
    const wallArea = 2 * (roomW + roomD) * roomH
    const furnitureCost = items.reduce((s, i) => s + i.price, 0)
    const floorCost    = Math.round(sqft * (floorMat==='marble'?300 : floorMat==='wood'?200 : floorMat==='vinyl'?80 : 100))
    const wallCost     = Math.round(wallArea * 10.764 * (wallFinish==='wallpaper'?90 : wallFinish==='tile'?115 : wallFinish==='panel'?275 : 22))
    const ceilCost     = Math.round(sqft * (ceilFinish==='gypsum'?62 : ceilFinish==='pvc'?48 : 18))
    const materialCost = floorCost + wallCost + ceilCost
    const laborCost    = Math.round(sqft * LABOR_RATE_PER_SQFT)
    const subtotal     = furnitureCost + materialCost + laborCost
    const gst          = Math.round(subtotal * GST_RATE)
    return { area: area.toFixed(1), sqft: Math.round(sqft), furnitureCost, floorCost, wallCost, ceilCost, materialCost, laborCost, subtotal, gst, total: subtotal + gst }
  })()

  const filtered = FURNITURE.filter(f =>
    (cat==='all' || f.cat===cat) &&
    (search==='' || f.name.toLowerCase().includes(search.toLowerCase()))
  )

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', fontFamily:"'Segoe UI',system-ui,sans-serif", overflow:'hidden', background:'#e8e9ec' }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header style={{ height:50, background:'#1e2433', display:'flex', alignItems:'center', padding:'0 14px', gap:8, flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.35)' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginRight:12 }}>
          <div style={{ width:30, height:30, background:'#c9a227', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:4 }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/></svg>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:13, lineHeight:1 }}>El Shaddai</div>
            <div style={{ color:'#8899aa', fontSize:10 }}>3D Room Designer</div>
          </div>
        </div>

        <div style={{ width:1, height:28, background:'#2e3650', margin:'0 4px' }} />

        {/* Undo / Redo */}
        <HBtn onClick={()=>{}} title="Undo">{Ico.undo}</HBtn>
        <HBtn onClick={()=>{}} title="Redo">{Ico.redo}</HBtn>

        <div style={{ width:1, height:28, background:'#2e3650', margin:'0 4px' }} />

        {/* 2D / 3D toggle */}
        <div style={{ display:'flex', background:'#151923', borderRadius:7, padding:3, gap:2 }}>
          <button onClick={() => onSwitch2D ? onSwitch2D() : null} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 12px', background:'transparent', color:'#8899aa', border:'none', cursor:'pointer', borderRadius:5, fontSize:11, fontWeight:600 }}>
            {Ico.grid2d} 2D
          </button>
          <button style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 12px', background:'#c9a227', color:'#000', border:'none', cursor:'pointer', borderRadius:5, fontSize:11, fontWeight:700 }}>
            {Ico.cube3d} 3D
          </button>
        </div>

        <div style={{ width:1, height:28, background:'#2e3650', margin:'0 4px' }} />

        {/* Camera presets */}
        {['Perspective','Top','Front','Side'].map(v => (
          <button key={v} onClick={() => setCameraPreset(v, sceneRef.current)} style={{ padding:'4px 9px', background:'transparent', color:'#8899aa', border:'none', cursor:'pointer', fontSize:11, borderRadius:5, fontWeight:500 }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#252c3f'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8899aa' }}>
            {v}
          </button>
        ))}

        <div style={{ flex:1 }} />

        {/* Cost */}
        {totalCost > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(201,162,39,0.12)', border:'1px solid rgba(201,162,39,0.3)', borderRadius:6, padding:'4px 12px' }}>
            <span style={{ color:'#c9a227', fontSize:11 }}>Total</span>
            <span style={{ color:'#c9a227', fontWeight:700, fontSize:13 }}>₹{totalCost.toLocaleString()}</span>
          </div>
        )}

        {fpImported && (
          <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:6, padding:'4px 10px' }}>
            <span style={{ color:'#4ade80', fontSize:10, fontWeight:700 }}>FLOOR PLAN LOADED</span>
          </div>
        )}
        <HBtn onClick={takeShot} title="Screenshot" label="Screenshot">{Ico.camera}</HBtn>
        <button onClick={getAiSuggestions} disabled={aiLoading} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 14px', background:'rgba(139,92,246,0.15)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.35)', cursor:'pointer', borderRadius:7, fontWeight:700, fontSize:12 }}>
          {aiLoading ? '...' : '✦'} AI Suggest
        </button>
        <button onClick={startWalkthrough} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 14px', background: walkActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)', color: walkActive ? '#f87171' : '#34d399', border:`1px solid ${walkActive ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, cursor:'pointer', borderRadius:7, fontWeight:700, fontSize:12 }}>
          {walkActive ? '■ Stop' : '▶ Walkthrough'}
        </button>
        <a href="/collaborate/demo" target="_blank" rel="noopener" style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'rgba(96,165,250,0.12)', color:'#60a5fa', border:'1px solid rgba(96,165,250,0.3)', cursor:'pointer', borderRadius:7, fontWeight:700, fontSize:12, textDecoration:'none' }}>
          ⎘ Share
        </a>
        <button onClick={save} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 16px', background: saveStatus==='saved'?'#4ade80':saveStatus==='error'?'#f87171':'#c9a227', color:'#000', border:'none', cursor:'pointer', borderRadius:7, fontWeight:700, fontSize:12 }}>
          {Ico.save} {saveStatus==='saved'?'Saved!':saveStatus==='saving'?'Saving...':saveStatus==='error'?'Error':'Save Design'}
        </button>
        <HBtn onClick={() => window.location.href='/'} title="Home">{Ico.home}</HBtn>
      </header>

      {/* ══ BODY ══════════════════════════════════════════════════════════ */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <aside style={{ width:272, background:'#fff', borderRight:'1px solid #dde1e8', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden', boxShadow:'1px 0 4px rgba(0,0,0,0.06)' }}>

          {/* Search */}
          <div style={{ padding:'10px 10px 8px', borderBottom:'1px solid #edf0f5' }}>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#a0aec0', display:'flex' }}>{Ico.search}</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search furniture & decor..."
                style={{ width:'100%', padding:'7px 10px 7px 34px', background:'#f7f8fa', border:'1.5px solid #e2e6ec', borderRadius:8, fontSize:12, color:'#1a202c', outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' }}
                onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#e2e6ec'} />
              {search && <button onClick={()=>setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#a0aec0', cursor:'pointer', fontSize:16, lineHeight:1 }}>×</button>}
            </div>
          </div>

          {/* Category chips */}
          <div style={{ padding:'8px 8px 6px', borderBottom:'1px solid #edf0f5', display:'flex', flexWrap:'wrap', gap:4 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={()=>setCat(c.id)} style={{
                display:'flex', alignItems:'center', gap:4, padding:'4px 9px',
                background: cat===c.id ? '#1e2433' : '#f7f8fa',
                color: cat===c.id ? '#c9a227' : '#64748b',
                border: `1.5px solid ${cat===c.id ? '#1e2433' : '#e2e6ec'}`,
                borderRadius:20, cursor:'pointer', fontSize:11, fontWeight: cat===c.id ? 700 : 500,
                transition:'all 0.12s',
              }}>
                <span style={{ fontSize:14 }}>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div style={{ flex:1, overflowY:'auto', padding:'8px 8px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding:32, textAlign:'center', color:'#a0aec0' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                <p style={{ margin:0, fontSize:12 }}>No items found</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                {filtered.map(item => (
                  <button key={item.id} onClick={()=>addItem(item)}
                    style={{ background:'#fff', border:'1.5px solid #e8edf5', borderRadius:10, padding:0, cursor:'pointer', textAlign:'left', overflow:'hidden', transition:'all 0.15s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='#c9a227'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)' }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e8edf5'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
                    {/* Thumbnail */}
                    <div style={{ height:76, background:'linear-gradient(135deg,#f7f8fb 0%,#edf0f5 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, position:'relative' }}>
                      {item.emoji}
                      <div style={{ position:'absolute', bottom:5, right:6, background:'#1e2433', color:'#c9a227', fontSize:9, padding:'2px 6px', borderRadius:4, fontWeight:700 }}>+ ADD</div>
                    </div>
                    {/* Info */}
                    <div style={{ padding:'6px 8px 8px' }}>
                      <p style={{ margin:0, fontSize:11, fontWeight:700, color:'#1a202c', lineHeight:1.3 }}>{item.name}</p>
                      <p style={{ margin:'2px 0 0', fontSize:10, color:'#94a3b8' }}>{item.w}m × {item.d}m</p>
                      <p style={{ margin:'3px 0 0', fontSize:12, fontWeight:700, color:'#c9a227' }}>₹{item.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Placed items mini list */}
          {items.length > 0 && (
            <div style={{ borderTop:'1px solid #edf0f5', padding:'6px 10px', background:'#fafbfc', maxHeight:90, overflowY:'auto' }}>
              <p style={{ margin:'0 0 5px', fontSize:9, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>In Room ({items.length})</p>
              {items.map((it,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:13 }}>{it.emoji}</span>
                  <span style={{ fontSize:10, color:'#374151', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{it.name}</span>
                  <span style={{ fontSize:10, color:'#c9a227', fontWeight:700, flexShrink:0 }}>₹{(it.price/1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── CANVAS ─────────────────────────────────────────────────────── */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block', touchAction:'none' }} />

          {loading && (
            <div style={{ position:'absolute', inset:0, background:'#f0f1f4', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
              <div style={{ width:44, height:44, border:'3px solid #e2e6ec', borderTopColor:'#c9a227', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <p style={{ color:'#1a202c', fontSize:14, fontWeight:700, margin:0 }}>Loading 3D Engine...</p>
              <p style={{ color:'#94a3b8', fontSize:11, margin:0 }}>Babylon.js · PBR Materials · WebGL 2</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* Controls hint */}
          {ready && (
            <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', background:'rgba(30,36,51,0.82)', backdropFilter:'blur(6px)', borderRadius:24, padding:'5px 18px', display:'flex', gap:16, pointerEvents:'none' }}>
              {[['Left drag','Orbit'],['Right drag','Pan'],['Scroll','Zoom'],['Click','Select']].map(([k,v])=>(
                <span key={k} style={{ fontSize:10, color:'rgba(255,255,255,0.65)' }}><b style={{ color:'#c9a227' }}>{k}</b> {v}</span>
              ))}
            </div>
          )}

          {/* Item badge */}
          {items.length > 0 && (
            <div style={{ position:'absolute', top:12, left:12, background:'rgba(30,36,51,0.85)', borderRadius:8, padding:'4px 12px', fontSize:11, color:'#fff', backdropFilter:'blur(4px)' }}>
              <b style={{ color:'#c9a227' }}>{items.length}</b> item{items.length!==1?'s':''} · <b style={{ color:'#c9a227' }}>₹{totalCost.toLocaleString()}</b>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <aside style={{ width:248, background:'#fff', borderLeft:'1px solid #dde1e8', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden', boxShadow:'-1px 0 4px rgba(0,0,0,0.06)' }}>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #edf0f5', flexShrink:0 }}>
            {[['props','⚙️','Props'],['style','🎨','Style'],['room','🏠','Room'],['cost','₹','Cost'],['ai','✦','AI']].map(([id,ic,lb])=>(
              <button key={id} onClick={()=>setRightTab(id)} style={{
                flex:1, padding:'10px 4px', border:'none', cursor:'pointer', fontSize:10,
                background: rightTab===id ? '#fff' : '#f7f8fa',
                color: rightTab===id ? '#1a202c' : '#94a3b8',
                borderBottom: `2px solid ${rightTab===id ? '#c9a227' : 'transparent'}`,
                fontWeight: rightTab===id ? 700 : 500,
                display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all 0.12s',
              }}>
                <span style={{ fontSize:16 }}>{ic}</span>{lb}
              </button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:'auto' }}>

            {/* PROPERTIES */}
            {rightTab==='props' && (
              <div style={{ padding:12 }}>
                {selected ? (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'10px 12px', background:'#f7f8fa', borderRadius:10, border:'1px solid #edf0f5' }}>
                      <span style={{ fontSize:24 }}>{selected.emoji}</span>
                      <div>
                        <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#1a202c' }}>{selected.name}</p>
                        <p style={{ margin:'2px 0 0', fontSize:11, color:'#c9a227', fontWeight:600 }}>₹{selected.price?.toLocaleString()}</p>
                      </div>
                    </div>

                    <PLbl>Position</PLbl>
                    {['x','y','z'].map(ax=>(
                      <div key={ax} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                        <span style={{ width:16, fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase' }}>{ax}</span>
                        <input type="number" step="0.1" value={propPos[ax]} onChange={e=>applyPos(ax,e.target.value)}
                          style={{ flex:1, padding:'5px 8px', background:'#f7f8fa', border:'1.5px solid #e2e6ec', borderRadius:7, fontSize:12, color:'#1a202c', outline:'none' }}
                          onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#e2e6ec'} />
                      </div>
                    ))}

                    <PLbl>Rotate</PLbl>
                    <div style={{ display:'flex', gap:5, marginBottom:14 }}>
                      {[45,90,180].map(deg=>(
                        <button key={deg} onClick={()=>rotateSelected(deg)} style={{ flex:1, padding:'6px 0', background:'#f7f8fa', border:'1.5px solid #e2e6ec', borderRadius:7, fontSize:11, cursor:'pointer', color:'#374151', fontWeight:600 }}
                          onMouseEnter={e=>{ e.currentTarget.style.borderColor='#c9a227'; e.currentTarget.style.color='#c9a227' }}
                          onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e6ec'; e.currentTarget.style.color='#374151' }}>
                          +{deg}°
                        </button>
                      ))}
                    </div>

                    <PLbl>Actions</PLbl>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      <PAct icon={Ico.copy}  label="Duplicate" color="#3b82f6" onClick={duplicate} />
                      <PAct icon={Ico.trash} label="Remove"    color="#ef4444" onClick={removeSelected} />
                    </div>
                  </>
                ) : (
                  <div style={{ padding:'40px 16px', textAlign:'center', color:'#a0aec0' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#dde1e8', marginBottom:10 }}>{Ico.cursor}</div>
                    <p style={{ fontSize:12, margin:0, lineHeight:1.6 }}>Click any furniture item in the 3D view to select and edit it</p>
                  </div>
                )}
              </div>
            )}

            {/* MATERIALS */}
            {rightTab==='style' && (
              <div style={{ padding:12 }}>
                {selected ? (
                  <>
                    <p style={{ margin:'0 0 10px', fontSize:11, color:'#94a3b8' }}>Apply to: <b style={{ color:'#1a202c' }}>{selected.name}</b></p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                      {PBR_MATS.map(mat => (
                        <button key={mat.id} onClick={()=>applyMaterial(mat)} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 9px', background:'#f7f8fa', border:'1.5px solid #e2e6ec', borderRadius:8, cursor:'pointer' }}
                          onMouseEnter={e=>{ e.currentTarget.style.borderColor='#c9a227'; e.currentTarget.style.background='#fff' }}
                          onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e6ec'; e.currentTarget.style.background='#f7f8fa' }}>
                          <div style={{ width:22, height:22, borderRadius:5, background:mat.hex, border:'1px solid rgba(0,0,0,0.1)', flexShrink:0 }} />
                          <span style={{ fontSize:10, color:'#374151', lineHeight:1.2 }}>{mat.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ padding:20, fontSize:12, color:'#94a3b8', textAlign:'center', margin:0 }}>Select a furniture item first to change its material</p>
                )}
              </div>
            )}

            {/* ROOM */}
            {rightTab==='room' && (
              <div style={{ padding:12 }}>
                <PLbl>Room Size</PLbl>
                {[
                  { label:'Width',  val:roomW, set:setRoomW, min:3, max:15, step:0.5 },
                  { label:'Depth',  val:roomD, set:setRoomD, min:3, max:15, step:0.5 },
                  { label:'Height', val:roomH, set:setRoomH, min:2, max:5,  step:0.1 },
                ].map(r => (
                  <div key={r.label} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:11, color:'#64748b' }}>{r.label}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:'#c9a227' }}>{r.val}m</span>
                    </div>
                    <input type="range" min={r.min} max={r.max} step={r.step} value={r.val} onChange={e=>r.set(+e.target.value)}
                      style={{ width:'100%', accentColor:'#c9a227' }} />
                  </div>
                ))}
                <div style={{ padding:'8px 12px', background:'#f7f8fa', borderRadius:9, marginBottom:14, border:'1px solid #edf0f5' }}>
                  <p style={{ margin:0, fontSize:10, color:'#94a3b8' }}>Floor Area</p>
                  <p style={{ margin:'2px 0 0', fontSize:18, fontWeight:700, color:'#1a202c' }}>{(roomW*roomD).toFixed(1)} m²</p>
                  <p style={{ margin:0, fontSize:10, color:'#94a3b8' }}>{(roomW*roomD*10.764).toFixed(0)} sq ft</p>
                </div>

                <PLbl>Room Style</PLbl>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14 }}>
                  {ROOM_STYLES.map(s => (
                    <button key={s.id} onClick={()=>setRoomStyle(s)} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'8px 10px', cursor:'pointer', borderRadius:8,
                      background: roomStyle.id===s.id ? '#1e2433' : '#f7f8fa',
                      border: `1.5px solid ${roomStyle.id===s.id ? '#c9a227' : '#e2e6ec'}`,
                    }}>
                      <div style={{ display:'flex', gap:3 }}>
                        {[s.wall,s.floor,s.accent].map((c,i) => (
                          <div key={i} style={{ width:16, height:16, borderRadius:4, background:c, border:'1px solid rgba(0,0,0,0.12)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color: roomStyle.id===s.id ? '#c9a227' : '#374151' }}>{s.label}</span>
                    </button>
                  ))}
                </div>

                <PLbl>Lighting Mood</PLbl>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                  {ENV_MODES.map(e => (
                    <button key={e.id} onClick={()=>setEnvMode(e)} style={{
                      padding:'7px 4px', borderRadius:8, cursor:'pointer', fontSize:11, fontWeight:600,
                      border: `1.5px solid ${envMode.id===e.id ? '#c9a227' : '#e2e6ec'}`,
                      background: envMode.id===e.id ? '#1e2433' : '#f7f8fa',
                      color: envMode.id===e.id ? '#c9a227' : '#64748b',
                    }}>{e.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* COST ESTIMATOR */}
            {rightTab==='cost' && (
              <div style={{ padding:12 }}>
                <PLbl>Finish Type</PLbl>
                {[
                  { label:'Floor', key:'floorMat', val:floorMat, set:setFloorMat, opts:['Vitrified Tile','Marble','Hardwood','Polished Concrete'] },
                  { label:'Wall',  key:'wallFinish', val:wallFinish, set:setWallFinish, opts:['Paint','Wallpaper','Stone Cladding','Veneer Panel'] },
                  { label:'Ceil.', key:'ceilFinish', val:ceilFinish, set:setCeilFinish, opts:['POP Flat','Grid False Ceil.','Wooden Panel','Bare Plaster'] },
                ].map(r=>(
                  <div key={r.key} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:11, color:'#64748b' }}>{r.label}</span>
                    </div>
                    <select value={r.val} onChange={e=>r.set(e.target.value)} style={{ width:'100%', padding:'5px 8px', background:'#f7f8fa', border:'1.5px solid #e2e6ec', borderRadius:7, fontSize:11, color:'#374151', outline:'none' }}>
                      {r.opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}

                <PLbl>Breakdown</PLbl>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14 }}>
                  {[
                    { label:'Furniture', val:costBreakdown.furnitureCost },
                    { label:'Flooring',  val:costBreakdown.floorCost },
                    { label:'Walls',     val:costBreakdown.wallCost },
                    { label:'Ceiling',   val:costBreakdown.ceilCost },
                    { label:'Labour',    val:costBreakdown.laborCost },
                    { label:'GST 18%',   val:costBreakdown.gst },
                  ].map(r=>(
                    <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 10px', background:'#f7f8fa', borderRadius:7, border:'1px solid #edf0f5' }}>
                      <span style={{ fontSize:11, color:'#64748b' }}>{r.label}</span>
                      <span style={{ fontSize:11, fontWeight:600, color:'#374151' }}>₹{r.val.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 10px', background:'#1e2433', borderRadius:8, marginTop:4 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#c9a227' }}>Total</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>₹{costBreakdown.total.toLocaleString()}</span>
                  </div>
                </div>

                <button onClick={()=>{
                  const lines = [
                    `El Shaddai — BOQ Estimate`,
                    `Room: ${roomW}m × ${roomD}m × ${roomH}m  |  ${(roomW*roomD).toFixed(1)} m²`,
                    `Floor Finish: ${floorMat}`,
                    `Wall Finish: ${wallFinish}`,
                    `Ceiling: ${ceilFinish}`,
                    ``,
                    `Furniture       ₹${costBreakdown.furnitureCost.toLocaleString()}`,
                    `Flooring        ₹${costBreakdown.floorCost.toLocaleString()}`,
                    `Walls           ₹${costBreakdown.wallCost.toLocaleString()}`,
                    `Ceiling         ₹${costBreakdown.ceilCost.toLocaleString()}`,
                    `Labour          ₹${costBreakdown.laborCost.toLocaleString()}`,
                    `GST 18%         ₹${costBreakdown.gst.toLocaleString()}`,
                    `──────────────────────────`,
                    `TOTAL           ₹${costBreakdown.total.toLocaleString()}`,
                  ].join('\n')
                  const blob = new Blob([lines], { type:'text/plain' })
                  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='BOQ-ElShaddai.txt'; a.click()
                }} style={{ width:'100%', padding:'8px', background:'#1e2433', color:'#c9a227', border:'1.5px solid #c9a227', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                  ⬇ Export BOQ
                </button>
              </div>
            )}

            {/* AI SUGGESTIONS */}
            {rightTab==='ai' && (
              <div style={{ padding:12 }}>
                <div style={{ padding:'10px 12px', background:'linear-gradient(135deg,#1e2433,#2d1b69)', borderRadius:10, marginBottom:14, border:'1px solid #3730a3' }}>
                  <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#c9a227' }}>✦ AI Design Assistant</p>
                  <p style={{ margin:0, fontSize:10, color:'#94a3b8', lineHeight:1.5 }}>
                    Click "AI Suggest" in the toolbar. I'll recommend furniture and décor based on your room style and area.
                  </p>
                </div>

                {aiLoading && (
                  <div style={{ padding:'24px 0', textAlign:'center' }}>
                    <div style={{ display:'inline-block', width:24, height:24, border:'3px solid #e2e6ec', borderTopColor:'#c9a227', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                    <p style={{ margin:'10px 0 0', fontSize:11, color:'#94a3b8' }}>Thinking…</p>
                  </div>
                )}

                {!aiLoading && aiSuggestion && (
                  <div>
                    <PLbl>Suggestions</PLbl>
                    <div style={{ fontSize:12, color:'#374151', lineHeight:1.7, whiteSpace:'pre-wrap', background:'#f7f8fa', borderRadius:9, padding:'10px 12px', border:'1px solid #edf0f5', marginBottom:12 }}>
                      {aiSuggestion}
                    </div>

                    <PLbl>Quick-Add Items</PLbl>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {[
                        { name:'Accent Chair',  emoji:'🪑', cat:'seating',  price:12000 },
                        { name:'Side Table',    emoji:'🪵', cat:'tables',   price:5500 },
                        { name:'Floor Lamp',    emoji:'💡', cat:'lighting', price:4200 },
                        { name:'Bookshelf',     emoji:'📚', cat:'storage',  price:9800 },
                        { name:'Wall Art',      emoji:'🖼️', cat:'decor',    price:3500 },
                        { name:'Indoor Plant',  emoji:'🌿', cat:'decor',    price:1800 },
                        { name:'Area Rug',      emoji:'🟫', cat:'decor',    price:7500 },
                        { name:'Coffee Table',  emoji:'☕', cat:'tables',   price:15000 },
                      ].map(item=>(
                        <button key={item.name} onClick={async ()=>{
                          if (!sceneRef.current) return
                          const B = await loadBabylon(); const scene = sceneRef.current
                          const mesh = B.MeshBuilder.CreateBox(item.name, { width:0.5, height:0.5, depth:0.5 }, scene)
                          mesh.position = new B.Vector3((Math.random()-0.5)*3, 0.25, (Math.random()-0.5)*3)
                          const mat = new B.PBRMetallicRoughnessMaterial(`ai_${item.name}`, scene)
                          mat.baseColor = B.Color3.FromHexString('#c9a227'); mat.metallic=0.1; mat.roughness=0.7
                          mesh.material = mat
                          mesh.metadata = { id:`ai_${Date.now()}`, name:item.name, emoji:item.emoji, price:item.price, cat:item.cat }
                          setItems(prev=>[...prev, { ...item, id:`ai_${Date.now()}`, mesh }])
                        }} style={{ padding:'5px 9px', background:'#f7f8fa', border:'1.5px solid #e2e6ec', borderRadius:8, cursor:'pointer', fontSize:10, fontWeight:600, color:'#374151', display:'flex', alignItems:'center', gap:4 }}
                          onMouseEnter={e=>{ e.currentTarget.style.borderColor='#c9a227'; e.currentTarget.style.background='#fff' }}
                          onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e6ec'; e.currentTarget.style.background='#f7f8fa' }}>
                          <span>{item.emoji}</span>{item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!aiLoading && !aiSuggestion && (
                  <div style={{ padding:'30px 16px', textAlign:'center', color:'#a0aec0' }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>✦</div>
                    <p style={{ fontSize:12, margin:0, lineHeight:1.6 }}>Click the <b>AI Suggest</b> button in the toolbar to get personalised design recommendations</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </aside>
      </div>
    </div>
  )
}

// ─── Small helpers ───────────────────────────────────────────────────────────
function HBtn({ children, onClick, title, label }) {
  return (
    <button title={title} onClick={onClick} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 9px', background:'transparent', border:'none', color:'#8899aa', cursor:'pointer', borderRadius:6, fontSize:11 }}
      onMouseEnter={e=>{ e.currentTarget.style.background='#252c3f'; e.currentTarget.style.color='#fff' }}
      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8899aa' }}>
      {children}{label && <span style={{ marginLeft:2 }}>{label}</span>}
    </button>
  )
}

function PLbl({ children }) {
  return <p style={{ margin:'10px 0 6px', fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1 }}>{children}</p>
}

function PAct({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#f7f8fa', border:'1.5px solid #e2e6ec', borderRadius:8, cursor:'pointer', width:'100%' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=color; e.currentTarget.style.background='#fff' }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e6ec'; e.currentTarget.style.background='#f7f8fa' }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize:12, fontWeight:600, color }}>{label}</span>
    </button>
  )
}

// ─── Camera preset ───────────────────────────────────────────────────────────
function setCameraPreset(preset, scene) {
  if (!scene) return
  const cam = scene.activeCamera; if (!cam) return
  switch (preset) {
    case 'Top':          cam.alpha=-Math.PI/2; cam.beta=0.01;        cam.radius=14; break
    case 'Front':        cam.alpha=-Math.PI/2; cam.beta=Math.PI/2;   cam.radius=10; break
    case 'Side':         cam.alpha=0;          cam.beta=Math.PI/2;   cam.radius=10; break
    default:             cam.alpha=-Math.PI/5; cam.beta=Math.PI/3.2; cam.radius=11
  }
}

// ─── Build room ──────────────────────────────────────────────────────────────
function buildRoom(scene, B, w, d, h, style) {
  scene.meshes.filter(m => m.metadata?.isRoom).forEach(m => m.dispose())
  const mk = (hex, r=0.8, m=0) => {
    const mat = new B.PBRMetallicRoughnessMaterial(`rm_${Math.random()}`, scene)
    mat.baseColor = B.Color3.FromHexString(hex); mat.metallic=m; mat.roughness=r; return mat
  }
  const floor = B.MeshBuilder.CreateBox('floor', {width:w,height:0.02,depth:d}, scene)
  floor.position.y=-0.01; floor.receiveShadows=true; floor.material=mk(style.floor,0.45); floor.metadata={isRoom:true}
  const back = B.MeshBuilder.CreateBox('wall_b', {width:w,height:h,depth:0.08}, scene)
  back.position=new B.Vector3(0,h/2,d/2); back.receiveShadows=true; back.material=mk(style.wall,0.85); back.metadata={isRoom:true}
  const left = B.MeshBuilder.CreateBox('wall_l', {width:0.08,height:h,depth:d}, scene)
  left.position=new B.Vector3(-w/2,h/2,0); left.receiveShadows=true; left.material=mk(style.wall,0.85); left.metadata={isRoom:true}
  const right = B.MeshBuilder.CreateBox('wall_r', {width:0.08,height:h,depth:d}, scene)
  right.position=new B.Vector3(w/2,h/2,0); right.receiveShadows=true; right.material=mk(style.wall,0.85); right.metadata={isRoom:true}
  const ceil = B.MeshBuilder.CreateBox('ceil', {width:w,height:0.04,depth:d}, scene)
  ceil.position.y=h+0.02; ceil.material=mk('#FFFFFF',0.95); ceil.metadata={isRoom:true}
  const am = mk(style.accent,0.6,style.accent.startsWith('#B8')||style.accent.startsWith('#C9')?0.7:0)
  ;['b','l','r'].forEach(s => {
    const sb = B.MeshBuilder.CreateBox(`sb_${s}`, {width:s==='b'?w:0.06,height:0.07,depth:s==='b'?0.06:d}, scene)
    sb.position=new B.Vector3(s==='l'?-w/2+0.03:s==='r'?w/2-0.03:0,0.035,s==='b'?d/2-0.03:0)
    sb.material=am; sb.metadata={isRoom:true}
  })
}

// ─── Build furniture mesh ────────────────────────────────────────────────────
function buildMesh(scene, B, item) {
  const uid = `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
  const root = new B.TransformNode(uid, scene)
  root.metadata = { fid:uid, name:item.name, emoji:item.emoji, price:item.price }
  const mat = new B.PBRMetallicRoughnessMaterial(`m_${uid}`, scene)
  mat.baseColor=B.Color3.FromHexString(item.color); mat.metallic=0.05; mat.roughness=0.7
  const box = (name,opts,pos,mo) => {
    const m=B.MeshBuilder.CreateBox(name,opts,scene); m.position=pos||B.Vector3.Zero()
    m.material=mo||mat; m.parent=root; m.receiveShadows=true; m.metadata={fid:uid}; return m
  }
  box(`body_${uid}`,{width:item.w,height:item.h,depth:item.d},new B.Vector3(0,item.h/2,0))
  if (item.id==='sofa'||item.id==='loveseat') {
    box(`back_${uid}`,{width:item.w,height:0.45,depth:0.12},new B.Vector3(0,item.h+0.22,item.d/2-0.06))
    ;[-1,1].forEach(s=>box(`arm_${s}_${uid}`,{width:0.1,height:0.35,depth:item.d},new B.Vector3(s*(item.w/2-0.05),item.h+0.12,0)))
    const lm=new B.PBRMetallicRoughnessMaterial(`lm_${uid}`,scene); lm.baseColor=B.Color3.FromHexString('#1A1A1A'); lm.metallic=0.6; lm.roughness=0.3
    ;[[-1,1],[-1,-1],[1,1],[1,-1]].forEach(([lx,lz])=>{
      const leg=B.MeshBuilder.CreateCylinder(`leg_${uid}_${lx}${lz}`,{height:0.08,diameter:0.06},scene)
      leg.position=new B.Vector3(lx*(item.w/2-0.1),0.04,lz*(item.d/2-0.1)); leg.material=lm; leg.parent=root; leg.metadata={fid:uid}
    })
  }
  if (item.id==='dbl-bed'||item.id==='king-bed') {
    const hm=new B.PBRMetallicRoughnessMaterial(`hm_${uid}`,scene); hm.baseColor=B.Color3.FromHexString('#6B5035'); hm.roughness=0.7; hm.metallic=0
    box(`head_${uid}`,{width:item.w,height:0.8,depth:0.1},new B.Vector3(0,0.9,item.d/2),hm)
    const pm=new B.PBRMetallicRoughnessMaterial(`pm_${uid}`,scene); pm.baseColor=B.Color3.FromHexString('#F0EDE8'); pm.roughness=0.95; pm.metallic=0
    ;[-0.35,0.35].forEach(px=>box(`pil_${uid}_${px}`,{width:0.55,height:0.12,depth:0.4},new B.Vector3(px,item.h+0.06,item.d*0.2),pm))
  }
  if (item.id==='floor-lamp') {
    const pm=new B.PBRMetallicRoughnessMaterial(`pm_${uid}`,scene); pm.baseColor=B.Color3.FromHexString('#1A1A1A'); pm.metallic=0.8; pm.roughness=0.2
    const pole=B.MeshBuilder.CreateCylinder(`pole_${uid}`,{height:1.5,diameter:0.025},scene)
    pole.position.y=0.75; pole.material=pm; pole.parent=root; pole.metadata={fid:uid}
    const shade=B.MeshBuilder.CreateCylinder(`shade_${uid}`,{height:0.28,diameterTop:0.45,diameterBottom:0.18,tessellation:16},scene)
    shade.position.y=1.64; shade.material=mat; shade.parent=root; shade.metadata={fid:uid}
  }
  if (item.id==='plant-lg'||item.id==='plant-sm') {
    const potm=new B.PBRMetallicRoughnessMaterial(`pot_${uid}`,scene); potm.baseColor=B.Color3.FromHexString('#C17A4E'); potm.roughness=0.85
    const pot=B.MeshBuilder.CreateCylinder(`pot_${uid}`,{height:item.h*0.25,diameterTop:item.w*0.8,diameterBottom:item.w*0.55},scene)
    pot.position.y=item.h*0.12; pot.material=potm; pot.parent=root; pot.metadata={fid:uid}
    const fol=B.MeshBuilder.CreateSphere(`fol_${uid}`,{diameter:item.w*1.2,segments:8},scene)
    fol.position.y=item.h*0.78; fol.material=mat; fol.parent=root; fol.receiveShadows=true; fol.metadata={fid:uid}
  }
  root.position.y=0; return root
}
