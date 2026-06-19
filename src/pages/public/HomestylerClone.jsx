import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'

/* ─── Data ──────────────────────────────────────────────────────────────── */

const PROJECTS = [
  {
    id: 1, tag: 'Featured',
    title: 'Sharma Residence — Living & Dining',
    desc: 'A complete transformation of a 2,400 sq ft apartment in Jubilee Hills. Warm teak tones, Rajasthan marble surfaces and layered lighting create a space that feels both grand and intimate.',
    img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85',
    area: '2,400', style: 'Contemporary', location: 'Jubilee Hills, Hyderabad',
  },
  {
    id: 2, tag: 'New',
    title: 'Mehta Villa — Full Home Interior',
    desc: 'Four-bedroom villa spanning 4,200 sq ft in Banjara Hills. Every room designed with a coherent material palette — antique brass fixtures, sheesham wood panels and rich silk upholstery throughout.',
    img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85',
    area: '4,200', style: 'Modern Luxury', location: 'Banjara Hills, Hyderabad',
  },
  {
    id: 3, tag: null,
    title: 'Kapoor Office — Corporate Interior',
    desc: 'A 1,500 sq ft corporate office redesigned for productivity and brand identity. Open-plan workstations, a glass-walled boardroom and a hospitality lounge for clients.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85',
    area: '1,500', style: 'Corporate', location: 'Hitech City, Hyderabad',
  },
]

const SERVICES = [
  { n:'01', title:'Modular Kitchen',      icon:'🍳', desc:'Custom modular kitchens with premium shutters, granite tops, soft-close hardware and full electrical & plumbing integration.', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80' },
  { n:'02', title:'Wardrobe & Storage',   icon:'🚪', desc:'Floor-to-ceiling wardrobes with sliding or swing doors, internal organisers, mirrors and custom finishes to maximise space.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80' },
  { n:'03', title:'Living Room',          icon:'🛋️', desc:'TV units, entertainment walls, crockery cabinets, false ceilings and feature walls — every element designed as one cohesive space.', img:'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80' },
  { n:'04', title:'Bedroom Design',       icon:'🛏️', desc:'Master, kids and guest bedrooms — bed backs, side tables, study desks, wardrobes and soft furnishings tailored to each occupant.', img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80' },
  { n:'05', title:'False Ceiling',        icon:'✨', desc:'Gypsum, POP and wooden false ceilings with cove lighting, recessed LEDs and AC integration — transforming any room instantly.', img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  { n:'06', title:'Flooring',             icon:'🏠', desc:'Vitrified tiles, wooden flooring, epoxy, Kota stone and marble — supply, laying and finishing with precision across all areas.', img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80' },
  { n:'07', title:'Pooja Room',           icon:'🪔', desc:'Sacred spaces crafted with devotion — marble mandirs, teak wood jaalis, backlit niches, bell holders and traditional carvings.', img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80' },
  { n:'08', title:'Kids Room',            icon:'🎨', desc:'Fun, safe and functional kids rooms with themed wall art, study zones, custom bunk beds and smart storage for toys and books.', img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=800&q=80' },
  { n:'09', title:'Bathroom Design',      icon:'🚿', desc:'Wet areas redesigned with anti-skid tiles, concealed cisterns, rain showers, vanity units and premium sanitaryware.', img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80' },
  { n:'10', title:'Home Office',          icon:'💻', desc:'Ergonomic workstations, built-in bookshelves, acoustic panels and smart lighting designed for productivity from home.', img:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80' },
  { n:'11', title:'Commercial Interiors', icon:'🏢', desc:'Offices, retail stores, restaurants and clinics — brand-aligned interiors with space planning, signage and full execution.', img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  { n:'12', title:'Turnkey Execution',    icon:'🔑', desc:'From concept to keys — we manage design, materials, civil work, electrical, plumbing and handover under one fixed price.', img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80' },
]

const AI_FEATURES = [
  { icon: '✍️', title: 'AI Room Generation',     desc: 'Describe your room in plain English or Hindi — get a complete 3D design in seconds.',    badge: 'Text to Room'     },
  { icon: '📸', title: 'AI Room Redesign',        desc: 'Upload any room photo and get instant AI-generated redesign concepts.',                   badge: 'Photo to Design'  },
  { icon: '🎨', title: 'AI Material Suggestions', desc: 'Click any surface and get harmonious material, texture and colour combos instantly.',     badge: 'Smart Palette'    },
  { icon: '📐', title: 'AI Floor Plan',           desc: 'Describe your home dimensions and lifestyle — AI draws the optimised floor plan.',         badge: 'Plan Generator'   },
  { icon: '🛋️', title: 'AI Furniture Placement',  desc: 'Drop furniture and let AI auto-arrange for best flow, ergonomics and focal points.',      badge: 'Auto Arrange'     },
  { icon: '💰', title: 'AI Cost Estimation',      desc: 'Instant bill of quantities with live ₹ pricing and budget-friendly alternatives.',         badge: 'Smart BOQ'        },
]

const HOW_WE_WORK = [
  { step: '01', title: 'We Listen First',        desc: 'Every project starts with a conversation — understanding your lifestyle, budget and vision before a single line is drawn.' },
  { step: '02', title: 'We Design Transparently', desc: 'Fixed-price proposals, 3D previews and a full material schedule before you commit. No surprises. No hidden costs.' },
  { step: '03', title: 'We Build & Track',        desc: 'Our in-house team handles every contractor, every delivery and every milestone — live tracking visible to you at all times.' },
  { step: '04', title: 'We Stay After Handover',  desc: 'After we hand over the keys we remain reachable. Warranty support, touch-ups and annual check-ins are part of every project.' },
]

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  serif:  { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  sans:   { fontFamily: "'DM Sans', system-ui, sans-serif"    },
  label:  { fontSize: 11, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#78716c' },
  gold:   '#c9a227',
  dark:   '#1c1917',
  stone:  '#57534e',
  light:  '#fafaf9',
  border: '#e7e5e4',
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SectionLabel({ children, light }) {
  return (
    <p style={{ ...S.label, color: light ? 'rgba(255,255,255,0.45)' : '#78716c', margin: '0 0 20px' }}>{children}</p>
  )
}

function OutlineBtn({ children, light, onClick, style = {} }) {
  const [hov, setHov] = useState(false)
  const base = light
    ? { border: '1px solid rgba(255,255,255,0.7)', color: hov ? S.dark : '#fff', background: hov ? '#fff' : 'transparent' }
    : { border: `1px solid ${S.dark}`,              color: hov ? '#fff' : S.dark,   background: hov ? S.dark : 'transparent' }
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...S.sans, ...base, padding: '12px 30px', fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.25s', ...style }}>
      {children}
    </button>
  )
}

function GoldBtn({ children, onClick, style = {} }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...S.sans, background: hov ? '#b8902a' : S.gold, color: '#000', border: 'none', padding: '13px 32px', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s', ...style }}>
      {children}
    </button>
  )
}

/* ─── Platform Demo Component ────────────────────────────────────────────── */

const DEMO_TABS = [
  {
    id: 'blueprint',
    label: '2D Blueprint',
    icon: '◫',
    headline: 'Draw your floor plan in minutes',
    desc: 'Click to place walls, snap to a precision grid, and watch rooms auto-detect as you close each space. Add doors, windows and furniture with a single click.',
    features: ['Smart grid snapping to 0.25 m', 'Auto room detection', 'Live dimension labels', '12 furniture items'],
    color: '#c9a227',
    preview: <BlueprintPreview />,
  },
  {
    id: '3d',
    label: '3D View',
    icon: '⬡',
    headline: 'Instant 3D at every step',
    desc: 'Every wall you draw is instantly extruded to full 2.8 m height in the 3D viewport. Orbit, zoom and walk through your design before a single nail is hammered.',
    features: ['Real-time wall extrusion', 'Orbit / zoom / pan', 'Shadow & lighting', 'Floor auto-fill'],
    color: '#3b82f6',
    preview: <ThreeDPreview />,
  },
  {
    id: 'ai',
    label: 'AI Design',
    icon: '✦',
    headline: 'Ask AI, get a complete layout',
    desc: 'Describe your dream space in plain language — "3BHK with open kitchen, Hyderabad, ₹18L budget" — and our Gemini-powered AI generates the full floor plan with material recommendations.',
    features: ['Natural language input', 'Budget-aware layouts', 'Material suggestions', 'Style presets'],
    color: '#10b981',
    preview: <AIPreview />,
  },
]

function BlueprintPreview() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')
    let t = 0; let raf
    const W = c.width, H = c.height
    const OX = 60, OY = 50   // origin offset for the floor plan

    // Full apartment floor plan segments — scaled to canvas
    const WALLS = [
      // Outer perimeter
      {x1:OX,    y1:OY,    x2:OX+380, y2:OY,     label:null},
      {x1:OX+380,y1:OY,    x2:OX+380, y2:OY+260, label:null},
      {x1:OX+380,y1:OY+260,x2:OX,     y2:OY+260, label:null},
      {x1:OX,    y1:OY+260,x2:OX,     y2:OY,     label:null},
      // Inner walls — room dividers
      {x1:OX+160,y1:OY,    x2:OX+160, y2:OY+160, label:null},
      {x1:OX,    y1:OY+160,x2:OX+280, y2:OY+160, label:null},
      {x1:OX+280,y1:OY+160,x2:OX+280, y2:OY,     label:null},
      {x1:OX+160,y1:OY+100,x2:OX+280, y2:OY+100, label:null},
    ]

    const ROOMS = [
      {x:OX+4,    y:OY+4,   w:152, h:152, label:'Living Room',   color:'rgba(201,162,39,0.07)'},
      {x:OX+164,  y:OY+4,   w:112, h:92,  label:'Master Bed',    color:'rgba(59,130,246,0.07)'},
      {x:OX+164,  y:OY+104, w:112, h:52,  label:'Kitchen',       color:'rgba(16,185,129,0.07)'},
      {x:OX+284,  y:OY+4,   w:92,  h:152, label:'Bedroom 2',     color:'rgba(139,92,246,0.07)'},
      {x:OX+4,    y:OY+164, w:152, h:92,  label:'Dining',        color:'rgba(245,158,11,0.07)'},
      {x:OX+164,  y:OY+164, w:212, h:92,  label:'Bedroom 3',     color:'rgba(244,63,94,0.07)'},
    ]

    const FURNITURE = [
      // Living room
      {x:OX+12,  y:OY+60, w:90, h:30, label:'Sofa',     color:'rgba(201,162,39,0.28)'},
      {x:OX+12,  y:OY+95, w:40, h:20, label:'Coffee',   color:'rgba(201,162,39,0.18)'},
      // Master bed
      {x:OX+188, y:OY+20, w:68, h:58, label:'King Bed', color:'rgba(59,130,246,0.28)'},
      // Kitchen
      {x:OX+168, y:OY+108,w:60, h:18, label:'Counter',  color:'rgba(16,185,129,0.28)'},
      // Dining
      {x:OX+20,  y:OY+178,w:50, h:34, label:'Table',    color:'rgba(245,158,11,0.28)'},
      // Bed 3
      {x:OX+300, y:OY+178,w:54, h:48, label:'Bed',      color:'rgba(244,63,94,0.28)'},
    ]

    const DIM_LINES = [
      {x1:OX,y1:OY-18,x2:OX+380,y2:OY-18,label:'12.7 m'},
      {x1:OX-22,y1:OY,x2:OX-22,y2:OY+260,label:'8.7 m'},
    ]

    function tick() {
      t += 0.25
      ctx.clearRect(0,0,W,H)

      // Background — dark blueprint paper
      ctx.fillStyle = '#06080d'
      ctx.fillRect(0,0,W,H)

      // Fine grid
      ctx.strokeStyle = 'rgba(30,50,90,0.5)'
      ctx.lineWidth = 0.4
      for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      // Bold grid every 100px
      ctx.strokeStyle = 'rgba(40,70,120,0.4)'
      ctx.lineWidth = 0.6
      for(let x=0;x<W;x+=100){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=100){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

      // Animation phases over 400 frames then loops
      const cycle = t % 420
      const wallPhase    = Math.min(1, cycle / 180)
      const roomPhase    = Math.max(0, Math.min(1, (cycle - 190) / 60))
      const furnPhase    = Math.max(0, Math.min(1, (cycle - 260) / 80))
      const dimPhase     = Math.max(0, Math.min(1, (cycle - 350) / 40))

      // Room fills
      if(roomPhase > 0) {
        ROOMS.forEach((r, i) => {
          const a = Math.max(0, Math.min(1, roomPhase * ROOMS.length - i * 0.7))
          ctx.globalAlpha = a * 0.85
          ctx.fillStyle = r.color
          ctx.fillRect(r.x, r.y, r.w, r.h)
          ctx.globalAlpha = 1
        })
      }

      // Walls — draw progressively
      const totalWallLen = WALLS.reduce((s,w)=>s+Math.hypot(w.x2-w.x1,w.y2-w.y1),0)
      let drawnLen = 0
      const targetLen = wallPhase * totalWallLen
      WALLS.forEach(w => {
        const segLen = Math.hypot(w.x2-w.x1,w.y2-w.y1)
        if(drawnLen >= targetLen){return}
        const drawFrac = Math.min(1,(targetLen-drawnLen)/segLen)
        const ex = w.x1+(w.x2-w.x1)*drawFrac
        const ey = w.y1+(w.y2-w.y1)*drawFrac
        const isDrawing = drawnLen + segLen > targetLen

        // Wall body — double line (thick walls)
        const dx = w.y2-w.y1, dy = -(w.x2-w.x1)
        const n = Math.hypot(dx,dy)||1
        const nx=dx/n*3, ny=dy/n*3
        if(!isDrawing || drawFrac>0.01){
          ctx.beginPath(); ctx.moveTo(w.x1+nx,w.y1+ny); ctx.lineTo(ex+nx,ey+ny)
          ctx.strokeStyle = isDrawing ? '#c9a227' : '#4a7fa5'
          ctx.lineWidth = isDrawing ? 2 : 2.5; ctx.lineCap='round'; ctx.stroke()
          ctx.beginPath(); ctx.moveTo(w.x1-nx,w.y1-ny); ctx.lineTo(ex-nx,ey-ny)
          ctx.strokeStyle = isDrawing ? 'rgba(201,162,39,0.5)' : '#2d5a7a'
          ctx.lineWidth = isDrawing ? 1.5 : 2; ctx.stroke()
          // Wall hatch fill
          ctx.save()
          ctx.beginPath(); ctx.moveTo(w.x1+nx,w.y1+ny); ctx.lineTo(ex+nx,ey+ny); ctx.lineTo(ex-nx,ey-ny); ctx.lineTo(w.x1-nx,w.y1-ny); ctx.closePath()
          ctx.clip()
          ctx.strokeStyle = isDrawing ? 'rgba(201,162,39,0.12)' : 'rgba(74,127,165,0.15)'
          ctx.lineWidth = 1
          for(let hx=-20;hx<W+H;hx+=8){ctx.beginPath();ctx.moveTo(hx,0);ctx.lineTo(hx-H,H);ctx.stroke()}
          ctx.restore()
        }

        // Active cursor
        if(isDrawing && drawFrac<1) {
          const pulse = 0.6+0.4*Math.sin(t*0.25)
          ctx.beginPath(); ctx.arc(ex,ey,6*pulse,0,Math.PI*2)
          ctx.fillStyle='rgba(201,162,39,0.9)'; ctx.fill()
          ctx.beginPath(); ctx.arc(ex,ey,12*pulse,0,Math.PI*2)
          ctx.strokeStyle='rgba(201,162,39,0.3)'; ctx.lineWidth=1; ctx.stroke()
          // crosshair
          ctx.strokeStyle='rgba(201,162,39,0.7)'; ctx.lineWidth=0.8
          ctx.beginPath(); ctx.moveTo(ex-16,ey); ctx.lineTo(ex+16,ey); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(ex,ey-16); ctx.lineTo(ex,ey+16); ctx.stroke()
        }
        drawnLen += segLen
      })

      // Room labels (after walls)
      if(roomPhase > 0.5){
        ROOMS.forEach((r,i) => {
          const a = Math.max(0,Math.min(1,(roomPhase-0.5)*2*ROOMS.length - i*0.8))
          ctx.globalAlpha = a
          ctx.fillStyle='rgba(147,197,253,0.85)'; ctx.font='bold 8px DM Sans'; ctx.textAlign='center'
          ctx.fillText(r.label.toUpperCase(), r.x+r.w/2, r.y+r.h/2-4)
          ctx.fillStyle='rgba(147,197,253,0.5)'; ctx.font='7px DM Sans'
          ctx.fillText(`${(r.w/30).toFixed(1)}×${(r.h/30).toFixed(1)}m`, r.x+r.w/2, r.y+r.h/2+8)
          ctx.globalAlpha=1
        })
      }

      // Furniture
      if(furnPhase > 0){
        FURNITURE.forEach((f,i) => {
          const a = Math.max(0,Math.min(1,furnPhase*FURNITURE.length*0.7-i*0.5))
          if(a<=0) return
          ctx.globalAlpha = a
          ctx.fillStyle = f.color; ctx.fillRect(f.x,f.y,f.w,f.h)
          ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=0.8; ctx.strokeRect(f.x,f.y,f.w,f.h)
          ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='7.5px DM Sans'; ctx.textAlign='center'
          ctx.fillText(f.label, f.x+f.w/2, f.y+f.h/2+3)
          ctx.globalAlpha=1
        })
      }

      // Dimension lines
      if(dimPhase > 0){
        ctx.globalAlpha = dimPhase
        DIM_LINES.forEach(d => {
          ctx.strokeStyle='rgba(201,162,39,0.7)'; ctx.lineWidth=0.8; ctx.setLineDash([3,3])
          ctx.beginPath(); ctx.moveTo(d.x1,d.y1); ctx.lineTo(d.x2,d.y2); ctx.stroke()
          ctx.setLineDash([])
          // tick marks
          ;[[d.x1,d.y1],[d.x2,d.y2]].forEach(([tx,ty])=>{
            const isH = d.y1===d.y2
            ctx.beginPath(); ctx.moveTo(tx+(isH?0:-4),ty+(isH?-4:0)); ctx.lineTo(tx+(isH?0:4),ty+(isH?4:0)); ctx.stroke()
          })
          ctx.fillStyle='#c9a227'; ctx.font='bold 9px DM Sans'; ctx.textAlign='center'
          const mx=(d.x1+d.x2)/2, my=(d.y1+d.y2)/2
          ctx.fillStyle='#0a0d14'; ctx.fillRect(mx-18,my-9,36,13)
          ctx.fillStyle='#c9a227'; ctx.fillText(d.label, mx, my+1)
        })
        ctx.globalAlpha=1
      }

      // Top toolbar (UI chrome)
      ctx.fillStyle='rgba(6,8,13,0.95)'; ctx.fillRect(0,0,W,28)
      ctx.strokeStyle='rgba(74,127,165,0.3)'; ctx.lineWidth=1
      ctx.beginPath(); ctx.moveTo(0,28); ctx.lineTo(W,28); ctx.stroke()
      const tools=[['DRAW WALL','#c9a227',true],['SELECT','#4a7fa5',false],['FURNITURE','#4a7fa5',false],['ERASE','#4a7fa5',false]]
      tools.forEach(([l,cl,active],i)=>{
        const tx=10+i*90
        if(active){ctx.fillStyle='rgba(201,162,39,0.15)'; ctx.fillRect(tx-3,4,82,20)}
        ctx.fillStyle=cl; ctx.font=`${active?'bold ':''} 7.5px DM Sans`; ctx.textAlign='left'
        ctx.fillText(l, tx, 17)
      })
      ctx.fillStyle='rgba(74,127,165,0.7)'; ctx.font='7px DM Sans'; ctx.textAlign='right'
      ctx.fillText('GRID: 0.25m  |  SCALE: 1:50', W-10, 18)

      // Status bar
      ctx.fillStyle='rgba(6,8,13,0.9)'; ctx.fillRect(0,H-20,W,20)
      ctx.fillStyle='rgba(147,197,253,0.5)'; ctx.font='7px DM Sans'; ctx.textAlign='left'
      ctx.fillText(`Area: 110.5 m²  |  Rooms: ${ROOMS.length}  |  Walls: ${WALLS.length}  |  Furniture: ${FURNITURE.length}`, 10, H-7)

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} width={520} height={360} style={{width:'100%',height:'100%',display:'block'}} />
}

function ThreeDPreview() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')
    let t = 0; let raf

    // 3D projection with camera orbit
    function project(x, y, z, camAngle, camPitch, camDist) {
      const cosA = Math.cos(camAngle), sinA = Math.sin(camAngle)
      const rx = x * cosA - z * sinA
      const rz = x * sinA + z * cosA
      const cosP = Math.cos(camPitch), sinP = Math.sin(camPitch)
      const ry2 = y * cosP - rz * sinP
      const rz2 = y * sinP + rz * cosP
      const fov = 280
      const scale = fov / (rz2 + camDist)
      return { px: c.width/2 + rx * scale, py: c.height/2 - ry2 * scale, z: rz2, scale }
    }

    function sortedFaces(faces, verts) {
      return faces.map(f => ({
        ...f,
        avgZ: f.idx.reduce((s,i)=>s+verts[i].z,0) / f.idx.length
      })).sort((a,b) => b.avgZ - a.avgZ)
    }

    function drawPoly(pts, fill, stroke, alpha=1) {
      if(pts.length < 2) return
      ctx.globalAlpha = alpha
      ctx.beginPath(); ctx.moveTo(pts[0].px, pts[0].py)
      pts.slice(1).forEach(p => ctx.lineTo(p.px, p.py))
      ctx.closePath()
      if(fill){ ctx.fillStyle = fill; ctx.fill() }
      if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = 0.6; ctx.stroke() }
      ctx.globalAlpha = 1
    }

    // Room geometry: boxes [x1,z1,x2,z2, yBottom, yTop, r,g,b, name]
    const ROOM_BOXES = [
      // Floor
      [-6,-5, 6, 5, -0.06, 0,   220,210,195,'floor'],
      // Back wall
      [-6,-5, 6,-4.9, 0, 2.8,   210,200,188,'wall'],
      // Left wall
      [-6,-5,-5.9, 5, 0, 2.8,   195,185,175,'wall'],
      // Right wall
      [ 5.9,-5, 6, 5, 0, 2.8,   195,185,175,'wall'],
      // Ceiling (transparent)
      [-6,-5, 6, 5, 2.75,2.8,   230,225,215,'ceiling'],
      // Inner partition
      [ 0.9,-5, 1, 5, 0, 2.8,   205,196,184,'wall'],
      // Sofa
      [-4.5, 0,-1.8, 2.8, 0, 0.85, 101,80,55,'furn'],
      [-4.5, 0,-1.8, 2.8,0.85,1.1, 130,100,72,'furn'],
      // Sofa back cushion
      [-4.5, 2.5,-1.8,2.8, 0, 1.2,  115,90,62,'furn'],
      // Coffee table
      [-3.2, 0.6,-2, 1.8, 0, 0.42,  165,145,110,'furn'],
      // King bed (right side)
      [1.6, -4.5, 5.4, -1.2, 0, 0.5,  230,220,210,'furn'],
      [1.6, -4.5, 5.4, -1.2,0.5, 0.75, 248,242,235,'furn'],
      [1.6, -4.3, 5.4, -4.1,0.5, 1.1,  200,185,168,'furn'],
      // Bedside tables
      [1.6, -4.5, 2.2, -4.0, 0, 0.52,  155,135,108,'furn'],
      [4.8, -4.5, 5.4, -4.0, 0, 0.52,  155,135,108,'furn'],
      // Pendant lamp (ceiling fixture)
      [-1, 1.5, 1, 2.5, 2.5, 2.65,   180,150,60,'lamp'],
    ]

    // Lighting direction
    const LIGHT = {x:0.4, y:0.9, z:-0.2}
    const lLen = Math.hypot(LIGHT.x,LIGHT.y,LIGHT.z)
    LIGHT.x/=lLen; LIGHT.y/=lLen; LIGHT.z/=lLen

    function faceNormal(verts,f) {
      if(f.length<3) return {x:0,y:1,z:0}
      const v0=verts[f[0]], v1=verts[f[1]], v2=verts[f[2]]
      const ax=v1.ox-v0.ox, ay=v1.oy-v0.oy, az=v1.oz-v0.oz
      const bx=v2.ox-v0.ox, by=v2.oy-v0.oy, bz=v2.oz-v0.oz
      const nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx
      const nl=Math.hypot(nx,ny,nz)||1
      return {x:nx/nl,y:ny/nl,z:nz/nl}
    }

    function tick() {
      t += 0.006
      const W=c.width, H=c.height
      ctx.clearRect(0,0,W,H)

      // Slow orbit + gentle bob
      const camAngle = t * 0.5 + Math.PI * 0.15
      const camPitch = 0.34 + Math.sin(t*0.3)*0.04
      const camDist  = 5.5

      // Ambient sky
      const sky = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.7)
      sky.addColorStop(0,'#1a1510')
      sky.addColorStop(1,'#050403')
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H)

      // Floor reflection glow
      const grd = ctx.createRadialGradient(W/2,H*0.72,0,W/2,H*0.72,W*0.45)
      grd.addColorStop(0,'rgba(201,162,39,0.04)')
      grd.addColorStop(1,'transparent')
      ctx.fillStyle=grd; ctx.fillRect(0,0,W,H)

      // Build projected vertices for all boxes
      const allFaces = []
      ROOM_BOXES.forEach(([x1,z1,x2,z2,y0,y1,r,g,b,tag]) => {
        if(tag==='ceiling') return // skip for open feel
        const corners3D = [
          {ox:x1,oy:y0,oz:z1},{ox:x2,oy:y0,oz:z1},{ox:x2,oy:y0,oz:z2},{ox:x1,oy:y0,oz:z2},
          {ox:x1,oy:y1,oz:z1},{ox:x2,oy:y1,oz:z1},{ox:x2,oy:y1,oz:z2},{ox:x1,oy:y1,oz:z2},
        ]
        const verts = corners3D.map(v=>({...project(v.ox,v.oy,v.oz,camAngle,camPitch,camDist), ox:v.ox,oy:v.oy,oz:v.oz}))
        const boxFaces = [
          {idx:[4,5,6,7], normal:{x:0,y:1,z:0}},  // top
          {idx:[0,1,5,4], normal:{x:0,y:0,z:-1}},  // front
          {idx:[1,2,6,5], normal:{x:1,y:0,z:0}},   // right
          {idx:[3,2,6,7], normal:{x:0,y:0,z:1}},   // back
          {idx:[0,3,7,4], normal:{x:-1,y:0,z:0}},  // left
          {idx:[0,1,2,3], normal:{x:0,y:-1,z:0}},  // bottom
        ]
        boxFaces.forEach(f => {
          // Backface cull
          const avgZ = f.idx.reduce((s,i)=>s+verts[i].z,0)/f.idx.length
          const diff = LIGHT.x*f.normal.x + LIGHT.y*f.normal.y + LIGHT.z*f.normal.z
          const lit  = Math.max(0.08, diff) * (tag==='furn'?1.15:1)
          const ambient = tag==='floor' ? 0.3 : 0.18
          const bright = Math.min(1, ambient + lit * 0.9)
          const wallColor = tag==='lamp' ? `rgba(${Math.floor(r*bright+40)},${Math.floor(g*bright+30)},${Math.floor(b*bright)},0.95)` : `rgba(${Math.floor(r*bright)},${Math.floor(g*bright)},${Math.floor(b*bright)},0.92)`
          allFaces.push({ pts: f.idx.map(i=>verts[i]), fill:wallColor, avgZ, tag })
        })
      })

      // Painter's sort
      allFaces.sort((a,b)=>b.avgZ-a.avgZ).forEach(f=>{
        drawPoly(f.pts, f.fill, 'rgba(0,0,0,0.12)', f.tag==='floor'?0.6:0.9)
      })

      // Warm light pools on floor
      const floorLP = project(0,0,0,camAngle,camPitch,camDist)
      const floorLP2 = project(-2.5,0,1.5,camAngle,camPitch,camDist)
      ;[{p:floorLP,r:60,c:'rgba(201,162,39,0.12)'},{p:floorLP2,r:40,c:'rgba(255,220,130,0.07)'}].forEach(({p,r,c})=>{
        const lg = ctx.createRadialGradient(p.px,p.py,0,p.px,p.py,r)
        lg.addColorStop(0,c); lg.addColorStop(1,'transparent')
        ctx.fillStyle=lg; ctx.fillRect(0,0,W,H)
      })

      // Edge vignette
      const vig = ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.75)
      vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(0,0,0,0.55)')
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)

      // HUD overlay
      ctx.fillStyle='rgba(5,4,3,0.7)'; ctx.fillRect(0,0,W,26)
      ctx.fillStyle='rgba(201,162,39,0.9)'; ctx.font='bold 8px DM Sans'; ctx.textAlign='left'
      ctx.fillText('3D LIVE VIEW', 10, 16)
      ctx.fillStyle='rgba(147,197,253,0.5)'; ctx.font='7px DM Sans'
      ctx.fillText('ORBIT  ·  ZOOM  ·  PAN', 100, 16)
      ctx.fillStyle='rgba(100,180,100,0.7)'; ctx.textAlign='right'; ctx.font='7px DM Sans'
      ctx.fillText('● RENDERING', W-10, 16)

      // Corner legend
      ctx.fillStyle='rgba(5,4,3,0.6)'; ctx.fillRect(0,H-22,W,22)
      ;[['WALLS','rgba(210,200,188,0.7)'],['FURNITURE','rgba(155,120,80,0.7)'],['FLOOR','rgba(220,210,195,0.7)'],['LIGHTING','rgba(201,162,39,0.7)']].forEach(([l,cl],i)=>{
        const tx = 12 + i*110
        ctx.fillStyle=cl; ctx.beginPath(); ctx.arc(tx,H-10,3,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='rgba(200,190,180,0.5)'; ctx.font='7px DM Sans'; ctx.textAlign='left'
        ctx.fillText(l, tx+7, H-7)
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={canvasRef} width={520} height={360} style={{width:'100%',height:'100%',display:'block'}} />
}

function AIPreview() {
  const [lines, setLines] = useState([])
  const [typing, setTyping] = useState('')
  const CHAT = [
    { role:'user',  text:'Design a 3BHK flat, Hyderabad, ₹18L budget, modern style' },
    { role:'ai',    text:'Generating your floor plan…' },
    { role:'ai',    text:'✓  Living Room — 4.2 × 3.6 m (sofa, TV unit, coffee table)' },
    { role:'ai',    text:'✓  Master Bedroom — 3.6 × 3.0 m (king bed, wardrobe)' },
    { role:'ai',    text:'✓  Kitchen — 3.0 × 2.4 m (modular cabinets, island)' },
    { role:'ai',    text:'✓  Bedroom 2 — 3.0 × 2.7 m' },
    { role:'ai',    text:'✓  Bedroom 3 — 2.7 × 2.4 m' },
    { role:'ai',    text:'Materials: Rajasthan marble floors · Sheesham wood panels · ₹17.6L est.' },
  ]

  useEffect(() => {
    let i = 0, charIdx = 0, shown = []
    function next() {
      if (i >= CHAT.length) { setTimeout(() => { i=0; charIdx=0; shown=[]; setLines([]); setTyping('') }, 2000); return }
      const msg = CHAT[i]
      if (charIdx < msg.text.length) {
        charIdx++
        setTyping(msg.text.slice(0, charIdx))
        setTimeout(next, msg.role==='user' ? 40 : 18)
      } else {
        shown = [...shown, { ...msg, id: i }]
        setLines([...shown]); setTyping(''); i++; charIdx = 0
        setTimeout(next, i === 1 ? 600 : 300)
      }
    }
    const t = setTimeout(next, 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ width:'100%', height:'100%', background:'#0d0b09', display:'flex', flexDirection:'column', padding:'12px' }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:'#44403c', marginBottom:10, textTransform:'uppercase' }}>✦ AI Design Assistant</div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
        {lines.map(l => (
          <div key={l.id} style={{ display:'flex', justifyContent:l.role==='user'?'flex-end':'flex-start' }}>
            <div style={{ maxWidth:'85%', padding:'7px 10px', background:l.role==='user'?'rgba(201,162,39,0.15)':'#1c1917', border:`1px solid ${l.role==='user'?'rgba(201,162,39,0.3)':'#292524'}` }}>
              <span style={{ fontSize:10, color:l.role==='user'?'#c9a227':'#a8a29e', lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{l.text}</span>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display:'flex', justifyContent:'flex-start' }}>
            <div style={{ maxWidth:'85%', padding:'7px 10px', background:'#1c1917', border:'1px solid #292524' }}>
              <span style={{ fontSize:10, color:'#a8a29e', lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{typing}<span style={{ borderRight:'1px solid #c9a227', marginLeft:1, animation:'blink 1s step-end infinite' }}></span></span>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      <div style={{ marginTop:8, display:'flex', gap:6 }}>
        <div style={{ flex:1, padding:'6px 10px', background:'#1c1917', border:'1px solid #292524', fontSize:9, color:'#44403c', fontFamily:"'DM Sans',sans-serif" }}>Describe your space…</div>
        <div style={{ padding:'6px 12px', background:'#c9a227', fontSize:9, fontWeight:700, color:'#000', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Send</div>
      </div>
    </div>
  )
}

/* ─── Role Feature Cards shown when logged in ────────────────────────────── */

const ROLE_FEATURES = {
  CLIENT: {
    greeting: 'Welcome back',
    subtitle: 'Your home project at a glance',
    color: '#60a5fa',
    icon: '🏠',
    features: [
      { label:'My Projects',     icon:'▦', href:'/projects',     desc:'Track progress & milestones'    },
      { label:'Approvals',       icon:'✓', href:'/approvals',    desc:'Pending sign-offs & decisions'  },
      { label:'Client Portal',   icon:'◉', href:'/client-portal',desc:'Docs, invoices & updates'       },
      { label:'Floor Plan',      icon:'◫', href:'/floor-plan-ai',desc:'View & edit your floor plan'    },
      { label:'Mood Board',      icon:'◨', href:'/mood-board',   desc:'Inspiration & material picks'   },
      { label:'Style Quiz',      icon:'✦', href:'/style-quiz',   desc:'Discover your design style'     },
      { label:'Payments',        icon:'₹', href:'/financial',    desc:'Invoices & payment history'     },
      { label:'Calendar',        icon:'▦', href:'/calendar',     desc:'Site visits & appointments'     },
    ],
  },
  DESIGNER: {
    greeting: 'Good to see you',
    subtitle: 'Your design workspace',
    color: '#8b5cf6',
    icon: '✦',
    features: [
      { label:'Projects',        icon:'▦', href:'/projects',      desc:'All active design projects'    },
      { label:'Task Manager',    icon:'▦', href:'/tasks',         desc:'Deadlines & deliverables'      },
      { label:'Floor Plan',      icon:'◫', href:'/floor-plan-ai', desc:'2D/3D floor plan studio'       },
      { label:'3D Designer',     icon:'⬡', href:'/designer',      desc:'Full 3D room designer'         },
      { label:'Pipeline',        icon:'▦', href:'/pipeline',      desc:'Project pipeline & Kanban'      },
      { label:'Material Spec',   icon:'▦', href:'/material-spec', desc:'BOQ & material schedules'      },
      { label:'QC Checklist',    icon:'◫', href:'/qc-checklist',  desc:'Quality control checklists'    },
      { label:'Reports',         icon:'◈', href:'/reports',       desc:'Analytics & project reports'   },
    ],
  },
  BUILDER: {
    greeting: 'Ready to build',
    subtitle: 'Your site command centre',
    color: '#f59e0b',
    icon: '🏗',
    features: [
      { label:'Projects',        icon:'▦', href:'/projects',      desc:'Active construction projects'  },
      { label:'Tasks',           icon:'▦', href:'/tasks',         desc:'Daily task list & assignments' },
      { label:'Site Diary',      icon:'▦', href:'/site-diary',    desc:'Daily progress logs'           },
      { label:'Attendance',      icon:'▦', href:'/employees',     desc:'On-site crew attendance'       },
      { label:'Materials',       icon:'▦', href:'/inventory',     desc:'Stock & delivery tracking'     },
      { label:'QC Checklist',    icon:'◫', href:'/qc-checklist',  desc:'Quality control on-site'       },
      { label:'Tracking',        icon:'◉', href:'/tracking',      desc:'Live project timeline'         },
      { label:'Calendar',        icon:'▦', href:'/calendar',      desc:'Schedule & site visits'        },
    ],
  },
  WORKSHOP_WORKER: {
    greeting: 'Workshop active',
    subtitle: 'Your manufacturing queue',
    color: '#facc15',
    icon: '🔨',
    features: [
      { label:'Factory Jobs',    icon:'▦', href:'/tracking',      desc:'Job queue & production stages' },
      { label:'Tasks',           icon:'▦', href:'/tasks',         desc:'Assigned work orders'          },
      { label:'Timesheet',       icon:'▦', href:'/timesheet',     desc:'Log your hours daily'          },
      { label:'Materials',       icon:'▦', href:'/inventory',     desc:'Raw material inventory'        },
      { label:'QC Checklist',    icon:'◫', href:'/qc-checklist',  desc:'Quality sign-off on items'     },
      { label:'Calendar',        icon:'▦', href:'/calendar',      desc:'Production schedule'           },
    ],
  },
  ADMIN: {
    greeting: 'Command centre',
    subtitle: 'Platform administration',
    color: '#4ade80',
    icon: '⚙',
    features: [
      { label:'Dashboard',       icon:'◫', href:'/dashboard',     desc:'KPIs & platform overview'      },
      { label:'All Projects',    icon:'▦', href:'/projects',      desc:'Manage every project'          },
      { label:'Employees',       icon:'▦', href:'/employees',     desc:'Team & HR management'          },
      { label:'Financial',       icon:'₹', href:'/financial',     desc:'Revenue, costs & invoices'     },
      { label:'Leads',           icon:'▦', href:'/pipeline',      desc:'Sales pipeline & CRM'          },
      { label:'Vendors',         icon:'▦', href:'/vendor-portal', desc:'Supplier management'           },
      { label:'Reports',         icon:'◈', href:'/reports',       desc:'Full business analytics'       },
      { label:'Audit Log',       icon:'▦', href:'/audit-log',     desc:'Activity & access log'         },
    ],
  },
  SUPER_ADMIN: {
    greeting: 'Super Admin',
    subtitle: 'Full platform control',
    color: '#f87171',
    icon: '◈',
    features: [
      { label:'Dashboard',       icon:'◫', href:'/dashboard',     desc:'Platform KPIs & overview'      },
      { label:'All Projects',    icon:'▦', href:'/projects',      desc:'Every project across clients'  },
      { label:'Employees',       icon:'▦', href:'/employees',     desc:'All staff & permissions'       },
      { label:'Financial',       icon:'₹', href:'/financial',     desc:'Full P&L & invoicing'          },
      { label:'Reports',         icon:'◈', href:'/reports',       desc:'Deep analytics'                },
      { label:'Audit Log',       icon:'▦', href:'/audit-log',     desc:'Full system audit trail'       },
      { label:'Settings',        icon:'⚙', href:'/settings',      desc:'Platform configuration'        },
      { label:'Tracking',        icon:'◉', href:'/tracking',      desc:'Live all-project tracking'     },
    ],
  },
}

function LoggedInPanel({ user }) {
  const { logout } = useAuth()
  const config = ROLE_FEATURES[user.role] || ROLE_FEATURES.CLIENT
  const initials = (user.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  function handleLogout() { logout(); window.location.href = '/' }

  return (
    <section style={{ background:'#0a0806', padding:'56px 0', borderBottom:'1px solid #1c1917' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 48px' }}>

        {/* Header row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', gap:18 }}>
            <div style={{ width:52, height:52, background:config.color, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:18, color:'#000' }}>
              {initials}
            </div>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:config.color, fontFamily:"'DM Sans',sans-serif" }}>
                {config.greeting}
              </p>
              <h2 style={{ margin:'0 0 3px', fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:28, fontWeight:300, color:'#fff', lineHeight:1 }}>
                {user.name}
              </h2>
              <p style={{ margin:0, fontSize:10, color:'#57534e', fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.1em' }}>
                {config.subtitle}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => window.location.href = '/dashboard'}
              style={{ fontFamily:"'DM Sans',sans-serif", padding:'11px 24px', background:config.color, border:'none', color:'#000', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>
              Open Dashboard →
            </button>
            <button onClick={handleLogout}
              style={{ fontFamily:"'DM Sans',sans-serif", padding:'11px 20px', background:'transparent', border:'1px solid #292524', color:'#57534e', cursor:'pointer', fontSize:10, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#57534e';e.currentTarget.style.color='#e7e5e4'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#292524';e.currentTarget.style.color='#57534e'}}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', border:`1px solid ${config.color}30`, background:`${config.color}0a`, marginBottom:32 }}>
          <span style={{ fontSize:13 }}>{config.icon}</span>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:config.color }}>
            {user.role.replace('_',' ')}
          </span>
        </div>

        {/* Feature grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'#1c1917' }}>
          {config.features.map((f,i) => (
            <FeatureCard key={i} feature={f} color={config.color} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, color }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={() => window.location.href = feature.href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:'28px 24px', background: hov ? `${color}0d` : '#0a0806', border:'none', cursor:'pointer', textAlign:'left', transition:'background 0.2s', display:'block', width:'100%' }}>
      <div style={{ width:34, height:34, border:`1px solid ${hov?color:'#292524'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color: hov?color:'#44403c', marginBottom:14, transition:'all 0.2s' }}>
        {feature.icon}
      </div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", margin:'0 0 5px', fontSize:12, fontWeight:600, color: hov?'#fff':'#a8a29e', letterSpacing:'0.06em', transition:'color 0.2s' }}>{feature.label}</p>
      <p style={{ fontFamily:"'DM Sans',sans-serif", margin:0, fontSize:10, color:'#44403c', lineHeight:1.6 }}>{feature.desc}</p>
      {hov && <div style={{ marginTop:12, fontSize:9, color:color, fontWeight:700, letterSpacing:'0.2em', fontFamily:"'DM Sans',sans-serif" }}>OPEN →</div>}
    </button>
  )
}

function PlatformDemo() {
  const [active, setActive] = useState('blueprint')
  const tab = DEMO_TABS.find(t => t.id === active)

  return (
    <section style={{ background:'#0a0806', borderTop:'1px solid #1c1917', borderBottom:'1px solid #1c1917' }}>

      {/* Top label strip */}
      <div style={{ textAlign:'center', padding:'72px 64px 0', fontFamily:"'DM Sans',sans-serif" }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'#44403c', marginBottom:16 }}>Platform Features</p>
        <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(28px,3.5vw,52px)', fontWeight:300, color:'#fff', lineHeight:1.1, marginBottom:16 }}>
          Design. Visualise. <span style={{ color:'#c9a227' }}>Build.</span>
        </h2>
        <p style={{ fontSize:14, color:'#57534e', maxWidth:520, margin:'0 auto 48px', lineHeight:1.8, fontWeight:300 }}>
          The only interior design platform built for Indian homes — with 2D drafting, live 3D preview and AI layout generation, all in one browser tab.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', justifyContent:'center', gap:0, marginBottom:0, borderTop:'1px solid #1c1917' }}>
        {DEMO_TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            style={{ padding:'16px 40px', background:'none', border:'none', borderBottom:`2px solid ${active===t.id?t.color:'transparent'}`, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:active===t.id?t.color:'#44403c', transition:'all 0.2s', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Demo panel */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:440, borderTop:'1px solid #1c1917' }}>

        {/* Left: animated preview */}
        <div style={{ background:'#0d0b09', borderRight:'1px solid #1c1917', overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', top:12, left:12, zIndex:2, display:'flex', gap:6 }}>
            {['#ff5f56','#ffbd2e','#27c93f'].map(c=>(
              <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }} />
            ))}
          </div>
          <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0 }}>
            {active==='blueprint' && <BlueprintPreview key="bp" />}
            {active==='3d'        && <ThreeDPreview key="3d" />}
            {active==='ai'        && <AIPreview key="ai" />}
          </div>
          {/* Scan line overlay */}
          <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(0deg,rgba(0,0,0,0.03) 0px,rgba(0,0,0,0.03) 1px,transparent 1px,transparent 2px)', pointerEvents:'none' }} />
        </div>

        {/* Right: copy */}
        <div style={{ padding:'56px 64px', display:'flex', flexDirection:'column', justifyContent:'center', background:'#0a0806' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <span style={{ fontSize:22, color:tab.color }}>{tab.icon}</span>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:tab.color, fontFamily:"'DM Sans',sans-serif" }}>{tab.label}</span>
          </div>
          <h3 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'clamp(22px,2.5vw,36px)', fontWeight:300, color:'#fff', lineHeight:1.2, marginBottom:18 }}>
            {tab.headline}
          </h3>
          <p style={{ fontSize:14, color:'#57534e', lineHeight:1.9, marginBottom:32, fontWeight:300, fontFamily:"'DM Sans',sans-serif" }}>
            {tab.desc}
          </p>
          <ul style={{ listStyle:'none', padding:0, marginBottom:40, display:'flex', flexDirection:'column', gap:10 }}>
            {tab.features.map(f => (
              <li key={f} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#78716c', fontFamily:"'DM Sans',sans-serif" }}>
                <span style={{ width:18, height:18, background:`${tab.color}18`, border:`1px solid ${tab.color}40`, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:9, color:tab.color, flexShrink:0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <button onClick={() => window.location.href='/floor-plan-ai'}
              style={{ padding:'13px 28px', background:tab.color, border:'none', color:'#000', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:"'DM Sans',sans-serif", transition:'opacity 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Open Studio — Free
            </button>
            <button onClick={() => window.location.href='/login'}
              style={{ padding:'13px 24px', background:'transparent', border:'1px solid #292524', color:'#78716c', cursor:'pointer', fontSize:11, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#57534e';e.currentTarget.style.color='#fff'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#292524';e.currentTarget.style.color='#78716c'}}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Bottom trust bar */}
      <div style={{ borderTop:'1px solid #1c1917', padding:'24px 64px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <p style={{ fontSize:11, color:'#2d2926', fontFamily:"'DM Sans',sans-serif" }}>No credit card required · Works in any browser · Free forever for small projects</p>
        <div style={{ display:'flex', gap:32 }}>
          {[['2D Blueprint','Free'],['3D View','Free'],['AI Layouts','Free'],['Team Tracking','Pro']].map(([f,t])=>(
            <div key={f} style={{ textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, color:t==='Free'?'#c9a227':'#57534e', fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.08em' }}>{t==='Free'?'✓ Free':'⬡ Pro'}</div>
              <div style={{ fontSize:9, color:'#2d2926', fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{f}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function ElShaddaiHome() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [form, setForm]         = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent]         = useState(false)
  const [activeService, setActiveService] = useState(null)
  const [popup, setPopup]               = useState(null)
  const contactRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── Real-time social proof popups ── */
  useEffect(() => {
    const names = [
      { name: 'Priya R.', city: 'Jubilee Hills', action: 'requested a free quote' },
      { name: 'Arun K.', city: 'Banjara Hills', action: 'booked a design consultation' },
      { name: 'Meena S.', city: 'Gachibowli', action: 'started a 3D room design' },
      { name: 'Suresh V.', city: 'Kondapur', action: 'got a cost estimate' },
      { name: 'Kavitha N.', city: 'Madhapur', action: 'requested a free quote' },
      { name: 'Rajesh M.', city: 'Hitech City', action: 'booked a site visit' },
      { name: 'Divya P.', city: 'Secunderabad', action: 'started a 3D room design' },
      { name: 'Venkat R.', city: 'Kukatpally', action: 'requested a free quote' },
    ]
    let idx = 0
    const show = () => {
      setPopup(names[idx % names.length])
      idx++
      setTimeout(() => setPopup(null), 4000)
    }
    const t = setTimeout(() => { show(); setInterval(show, 18000) }, 8000)
    return () => clearTimeout(t)
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  /* ── Responsive helpers injected once ── */
  return (
    <div style={{ ...S.sans, background: '#fff', margin: 0, color: S.dark }}>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#c9a22722}
        img{display:block}
        @media(max-width:768px){
          .es-nav-links{display:none!important}
          .es-hero-headline{font-size:clamp(38px,9vw,68px)!important}
          .es-split{grid-template-columns:1fr!important}
          .es-split-rev .es-img{order:0!important}
          .es-split-rev .es-txt{order:1!important}
          .es-services-grid{grid-template-columns:1fr 1fr!important}
          .es-ai-grid{grid-template-columns:1fr 1fr!important}
          .es-stats-grid{grid-template-columns:1fr 1fr!important}
          .es-contact-grid{grid-template-columns:1fr!important}
          .es-footer-grid{grid-template-columns:1fr!important;gap:36px!important}
          .es-section{padding:72px 24px!important}
          .es-listings-hdr{padding:0 24px!important}
        }
        @media(max-width:480px){
          .es-services-grid{grid-template-columns:1fr!important}
          .es-ai-grid{grid-template-columns:1fr!important}
          .es-stats-grid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${S.border}` : 'none',
        transition: 'all 0.4s', padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, border: `1.5px solid ${scrolled ? S.dark : '#fff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.4s' }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={scrolled ? S.dark : '#fff'} strokeWidth="1.4" fill="none"/>
            </svg>
          </div>
          <div>
            <div style={{ ...S.serif, fontSize: 18, fontWeight: 600, color: scrolled ? S.dark : '#fff', letterSpacing: '0.04em', lineHeight: 1 }}>El Shaddai</div>
            <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: scrolled ? S.gold : 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 2 }}>Interior Design</div>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="es-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {[['About', 'about'], ['Work', 'listings'], ['Services', 'services'], ['AI Design', null], ['Contact', 'contact']].map(([label, id]) => (
            <button key={label} onClick={() => id ? scrollTo(id) : window.location.href = '/ai-design'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: scrolled ? S.stone : 'rgba(255,255,255,0.8)', padding: '4px 0', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = scrolled ? S.dark : '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = scrolled ? S.stone : 'rgba(255,255,255,0.8)'}>
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <span style={{ fontSize:11, color: scrolled ? S.stone : 'rgba(255,255,255,0.6)', letterSpacing:'0.05em', ...S.sans }}>
                {user.name?.split(' ')[0]}
              </span>
              <button onClick={() => window.location.href = '/dashboard'}
                style={{ ...S.sans, background: S.gold, border: 'none', color: '#000', padding: '10px 22px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Dashboard →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => window.location.href = '/login'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: scrolled ? S.stone : 'rgba(255,255,255,0.7)', padding: '4px 0', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = scrolled ? S.dark : '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = scrolled ? S.stone : 'rgba(255,255,255,0.7)'}>
                Sign In
              </button>
              <button onClick={() => window.location.href = '/floor-plan-ai'}
                style={{ ...S.sans, background: 'transparent', border: `1px solid ${scrolled ? S.gold : 'rgba(201,162,39,0.7)'}`, color: S.gold, padding: '9px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background=S.gold; e.currentTarget.style.color='#000' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=S.gold }}>
                Try Free
              </button>
              <button onClick={() => scrollTo('contact')}
                style={{ ...S.sans, background: S.gold, border: 'none', color: '#000', padding: '10px 22px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Inquire Now
              </button>
            </>
          )}
          {/* Mobile hamburger */}
          <button className="es-hamburger" onClick={() => setMenuOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, padding: 4 }}>
            {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 1.5, background: scrolled ? S.dark : '#fff' }} />)}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: S.dark }}>×</button>
          {[['About','about'],['Work','listings'],['Services','services'],['AI Design',null],['Contact','contact']].map(([l, id]) => (
            <button key={l} onClick={() => { setMenuOpen(false); id ? scrollTo(id) : window.location.href='/ai-design' }}
              style={{ ...S.serif, background: 'none', border: 'none', fontSize: 32, fontWeight: 300, color: S.dark, cursor: 'pointer', letterSpacing: '0.05em' }}>{l}</button>
          ))}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button onClick={() => { setMenuOpen(false); window.location.href='/login' }}
              style={{ ...S.sans, padding: '11px 28px', background: 'transparent', border: `1px solid ${S.gold}`, color: S.gold, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Sign In</button>
            <button onClick={() => { setMenuOpen(false); window.location.href='/register' }}
              style={{ ...S.sans, padding: '11px 28px', background: S.gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Register</button>
          </div>
        </div>
      )}

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=90"
          alt="Modern interior"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.58) 100%)' }} />

        {/* Bottom headline */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 64px 72px' }}>
          <h1 className="es-hero-headline" style={{ ...S.serif, fontSize: 'clamp(52px,6vw,96px)', fontWeight: 300, color: '#fff', lineHeight: 0.95, letterSpacing: '-0.01em', maxWidth: '55%', marginBottom: 36 }}>
            Spaces that tell<br />your story.
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button onClick={() => window.location.href = '/floor-plan-ai'}
              style={{ ...S.sans, background: S.gold, border: 'none', color: '#000', padding: '14px 32px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>✦</span> Try Floor Plan Studio — Free
            </button>
            <OutlineBtn light onClick={() => scrollTo('listings')}>See Our Work</OutlineBtn>
            <button onClick={() => scrollTo('about')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
              Learn More ↓
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 72, right: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 1, height: 56, background: 'rgba(255,255,255,0.35)' }} />
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.3em', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>Scroll</span>
        </div>
      </section>

      {/* ══ LOGGED-IN: Role Dashboard / LOGGED-OUT: Platform Demo ─────────── */}
      {user ? <LoggedInPanel user={user} /> : <PlatformDemo />}

      {/* ══ ABOUT / HOW WE WORK ──────────────────────────────────────────────── */}
      <section id="about" className="es-section" style={{ padding: '120px 64px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <SectionLabel>How We Work</SectionLabel>
            <p style={{ ...S.serif, fontSize: 'clamp(22px,2.8vw,38px)', fontWeight: 300, color: S.dark, lineHeight: 1.55, maxWidth: 760, margin: '0 auto', letterSpacing: '0.01em' }}>
              We design with honesty and build with commitment — staying by your side from the first sketch to the final nail.
            </p>
          </div>
          <div className="es-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, background: S.border }}>
            {HOW_WE_WORK.map(s => (
              <div key={s.step} style={{ background: '#fff', padding: '40px 32px' }}>
                <p style={{ ...S.serif, fontSize: 40, fontWeight: 300, color: S.gold, lineHeight: 1, marginBottom: 20 }}>{s.step}</p>
                <h3 style={{ ...S.sans, fontSize: 13, fontWeight: 600, color: S.dark, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: S.stone, lineHeight: 1.8, fontWeight: 300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          {/* Loyalty strip */}
          <div style={{ marginTop: 2, background: S.dark, padding: '36px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            {[
              ['✓', 'Fixed-price contracts'],
              ['◈', 'Live project tracking'],
              ['⬡', 'In-house team only'],
              ['✦', 'Post-handover support'],
            ].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, border: `1px solid ${S.gold}40`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: S.gold }}>{icon}</span>
                <span style={{ ...S.sans, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.06em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LISTINGS ────────────────────────────────────────────────────────── */}
      <section id="listings" style={{ background: S.light }}>
        <div className="es-listings-hdr" style={{ padding: '80px 64px 56px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <SectionLabel>Our Work</SectionLabel>
            <h2 style={{ ...S.serif, fontSize: 'clamp(28px,3.5vw,52px)', fontWeight: 300, color: S.dark, lineHeight: 1.1 }}>
              Interiors we have<br />brought to life.
            </h2>
          </div>
          <OutlineBtn onClick={() => scrollTo('contact')} style={{ flexShrink: 0 }}>View All</OutlineBtn>
        </div>

        {PROJECTS.map((l, i) => (
          <div key={l.id} className={`es-split${i % 2 ? ' es-split-rev' : ''}`}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${S.border}` }}>

            {/* Image */}
            <div className="es-img" style={{ overflow: 'hidden', height: 520, order: i % 2 ? 2 : 0 }}>
              <img src={l.img} alt={l.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
            </div>

            {/* Content */}
            <div className="es-txt" style={{ background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 72px', order: i % 2 ? 0 : 1 }}>
              {l.tag && <span style={{ ...S.label, color: S.gold, display: 'block', marginBottom: 16 }}>{l.tag}</span>}
              <h3 style={{ ...S.serif, fontSize: 'clamp(20px,2.2vw,32px)', fontWeight: 300, color: S.dark, lineHeight: 1.3, marginBottom: 18 }}>{l.title}</h3>
              <p style={{ fontSize: 14, color: '#78716c', lineHeight: 1.8, marginBottom: 28, fontWeight: 300 }}>{l.desc}</p>
              <p style={{ fontSize: 11, color: '#a8a29e', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 24 }}>📍 {l.location}</p>
              <div style={{ display: 'flex', gap: 32, marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${S.border}` }}>
                {[['Style', l.style], ['Area', `${l.area} sq.ft`]].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ ...S.label, color: '#a8a29e', marginBottom: 6 }}>{k}</p>
                    <p style={{ ...S.serif, fontSize: 24, fontWeight: 300, color: S.dark }}>{v}</p>
                  </div>
                ))}
              </div>
              <OutlineBtn onClick={() => scrollTo('contact')} style={{ alignSelf: 'flex-start' }}>Start a Project</OutlineBtn>
            </div>
          </div>
        ))}
      </section>

      {/* ══ SERVICES ────────────────────────────────────────────────────────── */}
      <section id="services" className="es-section" style={{ padding: '100px 64px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionLabel>What We Offer</SectionLabel>
          <h2 style={{ ...S.serif, fontSize: 'clamp(28px,3.5vw,52px)', fontWeight: 300, color: S.dark }}>What We Design</h2>
        </div>
        <div className="es-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, maxWidth: 1280, margin: '0 auto' }}>
          {SERVICES.map(s => (
            <div key={s.n} style={{ position: 'relative', cursor: 'default' }}
              onMouseEnter={() => setActiveService(s.n)}
              onMouseLeave={() => setActiveService(null)}>
              <div style={{ overflow: 'hidden', height: 200 }}>
                <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s', transform: activeService === s.n ? 'scale(1.07)' : 'scale(1)' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 22 }}>{s.icon}</div>
              </div>
              <div style={{ padding: '20px 20px 28px', background: S.light }}>
                <p style={{ ...S.label, color: '#c8c4be', marginBottom: 8 }}>{s.n}</p>
                <h3 style={{ ...S.sans, fontSize: 12, fontWeight: 700, color: S.dark, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: S.stone, lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: S.gold, transform: activeService === s.n ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ══ QUOTE CTA ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '140px 64px', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=85"
          alt="interior"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,17,15,0.68)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel light>El Shaddai Philosophy</SectionLabel>
          <blockquote style={{ ...S.serif, fontSize: 'clamp(24px,3.5vw,52px)', fontWeight: 300, fontStyle: 'italic', color: '#fff', lineHeight: 1.4, letterSpacing: '0.01em', marginBottom: 48 }}>
            "Good design is not about filling a room — it is about creating the feeling you want to live in."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <OutlineBtn light onClick={() => scrollTo('contact')}>Start Your Project</OutlineBtn>
            <button onClick={() => scrollTo('listings')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              View Our Work
            </button>
          </div>
        </div>
      </section>

      {/* ══ AI FEATURES ─────────────────────────────────────────────────────── */}
      <section id="ai" className="es-section" style={{ padding: '100px 64px', background: S.light }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
          <div>
            <SectionLabel>AI-Powered Design</SectionLabel>
            <h2 style={{ ...S.serif, fontSize: 'clamp(28px,3.5vw,52px)', fontWeight: 300, color: S.dark }}>
              Design smarter<br />with AI.
            </h2>
          </div>
          <GoldBtn onClick={() => window.location.href = '/ai-design'} style={{ flexShrink: 0 }}>Try AI Designer →</GoldBtn>
        </div>

        <div className="es-ai-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: S.border }}>
          {AI_FEATURES.map((f, i) => (
            <div key={i} style={{ background: '#fff', padding: '40px 36px', transition: 'background 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = S.light}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <div style={{ fontSize: 32, marginBottom: 20 }}>{f.icon}</div>
              <div style={{ display: 'inline-block', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, border: `1px solid ${S.gold}`, padding: '3px 9px', marginBottom: 16 }}>{f.badge}</div>
              <h3 style={{ ...S.sans, fontSize: 14, fontWeight: 600, color: S.dark, marginBottom: 10, letterSpacing: '0.02em' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: S.stone, lineHeight: 1.75, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* AI Demo strip */}
        <div style={{ marginTop: 2, background: '#fff', padding: '56px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', borderTop: `1px solid ${S.border}` }}>
          <div>
            <SectionLabel>Live Demo</SectionLabel>
            <h3 style={{ ...S.serif, fontSize: 'clamp(22px,2.5vw,36px)', fontWeight: 300, color: S.dark, lineHeight: 1.3, marginBottom: 16 }}>
              Describe it.<br />AI builds it in seconds.
            </h3>
            <p style={{ fontSize: 14, color: S.stone, lineHeight: 1.8, marginBottom: 28, fontWeight: 300 }}>
              Type your room idea in plain English or Hindi. Our AI generates a complete 3D design with furniture, materials, lighting and a full ₹ cost breakdown — instantly.
            </p>
            <GoldBtn onClick={() => window.location.href = '/ai-design'}>Generate Free Design →</GoldBtn>
          </div>
          {/* Mock terminal */}
          <div style={{ background: S.dark, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ background: '#2c2825', padding: '12px 16px', display: 'flex', gap: 6 }}>
              {['#ff5f57','#ffbd2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span style={{ marginLeft: 8, fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>AI Design Studio</span>
            </div>
            <div style={{ padding: '28px 24px' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: '0.1em' }}>YOUR PROMPT</p>
              <p style={{ fontSize: 13, color: '#a78bfa', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>
                "A warm contemporary Indian living room with wooden floors, cream walls, deep blue sofa and brass accents. Budget ₹3 lakhs."
              </p>
              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12, letterSpacing: '0.1em' }}>AI RESULT · 8.3s</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Warm Contemporary Indian Living Room</p>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {['#F5F0E8','#C8A86B','#4A4A40','#2D6A4F','#E8D5B0'].map(c => (
                  <div key={c} style={{ flex: 1, height: 18, background: c, borderRadius: 2 }} />
                ))}
              </div>
              {['3-seater sofa — ₹45,000','Coffee table — ₹15,000','Floor lamp × 2 — ₹17,000','Plant stand set — ₹6,000'].map(t => (
                <p key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.9 }}>✓ {t}</p>
              ))}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Total Estimate</span>
                <span style={{ ...S.serif, fontSize: 20, fontWeight: 400, color: S.gold }}>₹83,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INTERIOR DESIGN PLATFORM STRIP ─────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=85"
          alt="bedroom" style={{ width: '100%', height: 560, objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,8,6,0.75) 45%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 80px' }}>
          <div style={{ maxWidth: 480 }}>
            <SectionLabel light>3D Interior Design</SectionLabel>
            <h2 style={{ ...S.serif, fontSize: 'clamp(28px,3vw,48px)', fontWeight: 300, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
              Design your interiors before you build.
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 32, fontWeight: 300 }}>
              Professional 2D floor planning, photorealistic 3D rendering and 9 AI integrations — all in one platform built for Indian homes.
            </p>
            <div style={{ display: 'flex', gap: 14 }}>
              <GoldBtn onClick={() => window.location.href = '/designer'}>Open Designer</GoldBtn>
              <OutlineBtn light onClick={() => window.location.href = '/portfolio'}>View Portfolio</OutlineBtn>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ─────────────────────────────────────────────────────────── */}
      <section id="contact" ref={contactRef} className="es-section" style={{ padding: '100px 64px', background: '#fff' }}>
        <div className="es-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, maxWidth: 1100, margin: '0 auto', alignItems: 'flex-start' }}>
          {/* Left */}
          <div>
            <SectionLabel>Contact Us</SectionLabel>
            <h2 style={{ ...S.serif, fontSize: 'clamp(28px,3vw,48px)', fontWeight: 300, color: S.dark, lineHeight: 1.2, marginBottom: 20 }}>
              Let's design your<br />space together.
            </h2>
            <p style={{ fontSize: 14, color: S.stone, lineHeight: 1.85, marginBottom: 52, fontWeight: 300 }}>
              Whether you have a clear vision or are starting from scratch — our team listens, plans and delivers interiors that exceed expectations.
            </p>
            {[
              { label: 'Office Address', val: 'Hyderabad, Telangana, India', href: 'https://maps.google.com/?q=Hyderabad,Telangana,India' },
              { label: 'Phone Number',   val: '+91 98765 43210',       href: 'tel:+919876543210' },
              { label: 'Email',          val: 'contactus@divinemercyitsol.com', href: 'mailto:contactus@divinemercyitsol.com' },
              { label: 'WhatsApp',       val: 'Chat with us on WhatsApp', href: 'https://wa.me/919876543210?text=Hi%20El%20Shaddai%2C%20I%27m%20interested%20in%20your%20interior%20design%20services.' },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: `1px solid ${S.border}` }}>
                <p style={{ ...S.label, color: '#a8a29e', marginBottom: 8 }}>{row.label}</p>
                {row.href
                  ? <a href={row.href}
                      target={row.href.startsWith('http') ? '_blank' : undefined}
                      rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{ fontSize: 16, color: S.dark, textDecoration: 'none', fontWeight: 400, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = S.gold}
                      onMouseLeave={e => e.target.style.color = S.dark}>{row.val}</a>
                  : <p style={{ fontSize: 16, color: S.dark }}>{row.val}</p>}
              </div>
            ))}

            {/* Google Maps */}
            <iframe
              title="El Shaddai Location — Hyderabad"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3160051681!2d78.24323295!3d17.41291895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1718000000000!5m2!1sen!2sin"
              width="100%" height="200" style={{ border: 0, display: 'block', marginTop: 8 }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Form */}
          <div style={{ background: S.light, padding: '52px 48px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div style={{ width: 52, height: 52, border: `1.5px solid ${S.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.gold} strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ ...S.serif, fontSize: 28, fontWeight: 300, color: S.dark, marginBottom: 8 }}>Message Sent</p>
                <p style={{ fontSize: 13, color: S.stone, fontWeight: 300 }}>The El Shaddai team will be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={async e => {
                e.preventDefault()
                // Web3Forms — browser-side only, delivers to contactus@divinemercyitsol.com
                try {
                  await fetch('https://api.web3forms.com/submit', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                      access_key: '20e5a729-9a98-4234-b88a-470634b6d474',
                      subject:    `New Enquiry from ${form.name} — El Shaddai Interiors`,
                      from_name:  'El Shaddai Website',
                      reply_to:   form.email,
                      name:       form.name,
                      email:      form.email,
                      phone:      form.phone || 'Not provided',
                      message:    form.message,
                    }),
                  })
                } catch {}
                // Also ping backend for SMS alert
                try { await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, message: form.message }) }) } catch {}
                setSent(true)
              }} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  {[['Full Name', 'name', 'text', 'Your name'], ['Email', 'email', 'email', 'your@email.com']].map(([lbl, name, type, ph]) => (
                    <div key={name}>
                      <label style={{ ...S.label, display: 'block', marginBottom: 8, color: '#a8a29e' }}>{lbl}</label>
                      <input type={type} required placeholder={ph} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${S.border}`, padding: '10px 0', fontSize: 13, color: S.dark, outline: 'none', fontFamily: 'inherit', fontWeight: 300 }}
                        onFocus={e => e.target.style.borderColor = S.dark}
                        onBlur={e => e.target.style.borderColor = S.border} />
                    </div>
                  ))}
                </div>
                {[['Phone Number', 'phone', 'tel', '+91 98765 43210'], ['Message', 'message', 'textarea', 'Tell us about your design vision...']].map(([lbl, name, type, ph]) => (
                  <div key={name} style={{ marginBottom: 20 }}>
                    <label style={{ ...S.label, display: 'block', marginBottom: 8, color: '#a8a29e' }}>{lbl}</label>
                    {type === 'textarea'
                      ? <textarea rows={4} placeholder={ph} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}
                          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${S.border}`, padding: '10px 0', fontSize: 13, color: S.dark, outline: 'none', resize: 'none', fontFamily: 'inherit', fontWeight: 300 }}
                          onFocus={e => e.target.style.borderColor = S.dark}
                          onBlur={e => e.target.style.borderColor = S.border} />
                      : <input type={type} placeholder={ph} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}
                          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${S.border}`, padding: '10px 0', fontSize: 13, color: S.dark, outline: 'none', fontFamily: 'inherit', fontWeight: 300 }}
                          onFocus={e => e.target.style.borderColor = S.dark}
                          onBlur={e => e.target.style.borderColor = S.border} />}
                  </div>
                ))}
                <GoldBtn style={{ marginTop: 12, width: '100%', padding: '14px' }}>Send Message</GoldBtn>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: S.dark, padding: '72px 64px 36px' }}>
        <div className="es-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke="white" strokeWidth="1.2" fill="none"/></svg>
              </div>
              <div>
                <div style={{ ...S.serif, fontSize: 16, fontWeight: 400, color: '#fff', letterSpacing: '0.06em' }}>El Shaddai</div>
                <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: S.gold, marginTop: 2 }}>Interior Design</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.85, fontWeight: 300, maxWidth: 260 }}>
              Interior design built on transparency and trust. From concept to completion — we work with you, not just for you. Based in Hyderabad, Telangana.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {['𝕏', 'in', 'f', '📷'].map(s => (
                <div key={s} style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = S.gold; e.currentTarget.style.color = S.gold }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Cols */}
          {[
            { title: 'Navigate', links: [['About', () => scrollTo('about')], ['Our Work', () => scrollTo('listings')], ['Services', () => scrollTo('services')], ['Contact', () => scrollTo('contact')]] },
            { title: 'Platform', links: [['3D Designer', () => window.location.href='/designer'], ['AI Design', () => window.location.href='/ai-design'], ['Portfolio', () => window.location.href='/portfolio'], ['Pricing', () => window.location.href='/pricing']] },
            { title: 'Company',  links: [['Blog', () => window.location.href='/blog'], ['Dashboard', () => window.location.href='/dashboard'], ['contactus@divinemercyitsol.com', null], ['www.divinemercyitsol.com', null]] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ ...S.label, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>{col.title}</p>
              {col.links.map(([label, fn]) => (
                <p key={label} style={{ marginBottom: 12 }}>
                  {fn
                    ? <button onClick={fn} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 300, padding: 0, transition: 'color 0.2s', fontFamily: 'inherit' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>{label}</button>
                    : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>{label}</span>}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em', fontWeight: 300 }}>
            © {new Date().getFullYear()} El Shaddai Interior Design. All rights reserved.
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>Hyderabad, Telangana 🇮🇳</p>
        </div>
      </footer>

      {/* ══ WHATSAPP FLOATING BUTTON ─────────────────────────────────────── */}
      <a
        href="https://wa.me/919876543210?text=Hi%20El%20Shaddai%2C%20I%27m%20interested%20in%20your%20interior%20design%20services."
        target="_blank" rel="noopener noreferrer"
        title="Chat on WhatsApp"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 58, height: 58, background: '#25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)' }}
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* ══ SOCIAL PROOF POPUP ───────────────────────────────────────────── */}
      {popup && (
        <div style={{
          position: 'fixed', bottom: 100, left: 24, zIndex: 9998,
          background: '#fff', border: '1px solid #e7e5e4',
          padding: '14px 18px', maxWidth: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          animation: 'slideIn 0.4s ease',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}`}</style>
          <div style={{ width: 36, height: 36, background: '#c9a227', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🏠</div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#1c1917', fontFamily: "'DM Sans',sans-serif" }}>{popup.name} from {popup.city}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#78716c', fontFamily: "'DM Sans',sans-serif" }}>{popup.action} · just now</p>
          </div>
        </div>
      )}

    </div>
  )
}
