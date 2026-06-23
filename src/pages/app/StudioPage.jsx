import { useState, useRef, useCallback, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import WebGPUViewport from '../../features/designer/WebGPUViewport'
import ThreeViewport from '../../features/designer/ThreeViewport'

const supportsWebGPU = typeof navigator !== 'undefined' && !!navigator.gpu

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const C = {
  bg:     '#08070a',
  panel:  '#111018',
  panel2: '#18161f',
  border: '#2a2535',
  gold:   '#c9a227',
  goldL:  '#e8c84e',
  text:   '#ede9e3',
  muted:  '#6b6580',
  accent: '#c9a227',
}

const ROOM_TEMPLATES = [
  { id:'living',   label:'Living Room',  icon:'🛋',  area:'300–500 sq ft', color:'#3b82f6' },
  { id:'bedroom',  label:'Bedroom',      icon:'🛏',  area:'150–250 sq ft', color:'#8b5cf6' },
  { id:'kitchen',  label:'Kitchen',      icon:'🍳',  area:'100–200 sq ft', color:'#f59e0b' },
  { id:'bathroom', label:'Bathroom',     icon:'🚿',  area:'60–100 sq ft',  color:'#06b6d4' },
  { id:'office',   label:'Home Office',  icon:'💻',  area:'100–200 sq ft', color:'#10b981' },
  { id:'dining',   label:'Dining Room',  icon:'🍽',  area:'120–200 sq ft', color:'#ef4444' },
  { id:'pooja',    label:'Pooja Room',   icon:'🪔',  area:'40–80 sq ft',   color:'#f97316' },
  { id:'kids',     label:'Kids Room',    icon:'🧸',  area:'120–200 sq ft', color:'#ec4899' },
]

const AI_TEMPLATES = [
  { id:'nordic',    label:'Nordic Natural',    style:'Scandinavian',   img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=70', rooms:'Bedroom' },
  { id:'modern',    label:'Modern Luxury',     style:'Contemporary',   img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=70', rooms:'Living Room' },
  { id:'japandi',   label:'Japandi Calm',      style:'Japandi',        img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=400&q=70', rooms:'Living Room' },
  { id:'industrial',label:'Industrial Loft',   style:'Industrial',     img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=70', rooms:'Living Room' },
  { id:'boho',      label:'Bohemian Bliss',    style:'Bohemian',       img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=70', rooms:'Bedroom' },
  { id:'vastu',     label:'Vastu Modern',      style:'Traditional',    img:'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=400&q=70', rooms:'Whole Home' },
  { id:'luxury',    label:'Royal Luxury',      style:'Art Deco',       img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70', rooms:'Living Room' },
  { id:'minimal',   label:'Minimal White',     style:'Minimalist',     img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=70', rooms:'Bedroom' },
]

const FURNITURE_CATS = [
  { id:'seating',   label:'Seating',    icon:'🛋' },
  { id:'bedroom',   label:'Bedroom',    icon:'🛏' },
  { id:'dining',    label:'Dining',     icon:'🍽' },
  { id:'storage',   label:'Storage',    icon:'🗄' },
  { id:'lighting',  label:'Lighting',   icon:'💡' },
  { id:'decor',     label:'Decor',      icon:'🏺' },
  { id:'kitchen',   label:'Kitchen',    icon:'🍳' },
  { id:'outdoor',   label:'Outdoor',    icon:'🌿' },
]

/*
 * GLB/GLTF catalog — each item has a `glb` URL for loading in Three.js/BabylonJS.
 * Sources:
 *   • KhronosGroup/glTF-Sample-Assets  (GitHub raw, MIT licence)
 *   • threejs.org example models        (MIT licence)
 * For items without a free GLB, `glb:null` — BabylonDesigner falls back to a
 * procedural box mesh with the correct dimensions and colour.
 */
const CATALOG_ITEMS = [
  /* ─ Seating ─ */
  { id:1,  name:'Glam Velvet Sofa',     sku:'SOF-001', cat:'seating',  price:45000,
    img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=70',
    glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb',
    dims:{w:2.2,h:0.8,d:0.9}, color:'#7c6fa0', match:['living','office'] },
  { id:2,  name:'Sheen Accent Chair',   sku:'SOF-002', cat:'seating',  price:12000,
    img:'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=300&q=70',
    glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
    dims:{w:0.8,h:0.9,d:0.8}, color:'#a0855a', match:['living','bedroom','office'] },
  { id:3,  name:'3-Seater Linen Sofa',  sku:'SOF-003', cat:'seating',  price:38000,
    img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:2.0,h:0.75,d:0.85}, color:'#c5b99a', match:['living'] },
  /* ─ Bedroom ─ */
  { id:4,  name:'King Bed Frame',        sku:'BED-001', cat:'bedroom',  price:55000,
    img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:2.0,h:0.6,d:2.2}, color:'#8b7355', match:['bedroom'] },
  { id:5,  name:'Platform Bed Queen',    sku:'BED-002', cat:'bedroom',  price:38000,
    img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.6,h:0.45,d:2.1}, color:'#7a6a50', match:['bedroom','kids'] },
  { id:6,  name:'Bedside Table (Pair)',  sku:'BED-003', cat:'bedroom',  price:9500,
    img:'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.5,h:0.55,d:0.4}, color:'#c8a06a', match:['bedroom'] },
  /* ─ Dining ─ */
  { id:7,  name:'Dining Table 6-Seat',   sku:'DIN-001', cat:'dining',   price:38000,
    img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.8,h:0.76,d:0.9}, color:'#6b4c2a', match:['dining'] },
  { id:8,  name:'Dining Chair Set/4',    sku:'DIN-002', cat:'dining',   price:22000,
    img:'https://images.unsplash.com/photo-1549488344-cbb6c34184c8?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.45,h:0.9,d:0.45}, color:'#3d2b1a', match:['dining','kitchen'] },
  { id:9,  name:'Bar Stool Pair',        sku:'DIN-003', cat:'dining',   price:8500,
    img:'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.4,h:1.0,d:0.4}, color:'#2c2c2c', match:['kitchen','dining'] },
  /* ─ Storage ─ */
  { id:10, name:'Wardrobe 4-Door',       sku:'STR-001', cat:'storage',  price:75000,
    img:'https://images.unsplash.com/photo-1558997519-83ea9252eeb8?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:2.4,h:2.2,d:0.6}, color:'#e8e0d4', match:['bedroom'] },
  { id:11, name:'Bookshelf 5-Tier',      sku:'STR-002', cat:'storage',  price:18000,
    img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.9,h:2.0,d:0.3}, color:'#d4a96a', match:['living','office'] },
  { id:12, name:'TV Unit Minimal',       sku:'STR-003', cat:'storage',  price:22000,
    img:'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.8,h:0.45,d:0.45}, color:'#1c1c1c', match:['living'] },
  /* ─ Lighting ─ */
  { id:13, name:'Lantern Floor Lamp',    sku:'LIT-001', cat:'lighting', price:8500,
    img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=70',
    glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',
    dims:{w:0.3,h:1.6,d:0.3}, color:'#c9a227', match:['living','bedroom','office'] },
  { id:14, name:'Pendant Cluster',       sku:'LIT-002', cat:'lighting', price:15000,
    img:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.6,h:0.4,d:0.6}, color:'#e8c84e', match:['dining','kitchen','living'] },
  { id:15, name:'Wall Sconce Pair',      sku:'LIT-003', cat:'lighting', price:6500,
    img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.2,h:0.3,d:0.15}, color:'#b8860b', match:['bedroom','bathroom'] },
  /* ─ Decor ─ */
  { id:16, name:'Ceramic Vase Set',      sku:'DEC-001', cat:'decor',    price:4500,
    img:'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=300&q=70',
    glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb',
    dims:{w:0.15,h:0.35,d:0.15}, color:'#e8d5b5', match:['living','bedroom','dining'] },
  { id:17, name:'Wall Art Canvas',       sku:'DEC-002', cat:'decor',    price:6000,
    img:'https://images.unsplash.com/photo-1549887534-1541e9326578?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.0,h:0.8,d:0.04}, color:'#f0ede8', match:['living','bedroom','office'] },
  { id:18, name:'Area Rug 8×10',         sku:'DEC-003', cat:'decor',    price:12000,
    img:'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:2.4,h:0.01,d:3.0}, color:'#8b6a4a', match:['living','bedroom','dining'] },
  /* ─ Kitchen ─ */
  { id:19, name:'Kitchen Island Pro',    sku:'KIT-001', cat:'kitchen',  price:85000,
    img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.5,h:0.9,d:0.8}, color:'#f5f0e8', match:['kitchen'] },
  { id:20, name:'Modular Cabinet Set',   sku:'KIT-002', cat:'kitchen',  price:45000,
    img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:2.4,h:0.85,d:0.6}, color:'#ddd8d0', match:['kitchen'] },
  /* ─ Office ─ */
  { id:21, name:'Ergonomic Chair',       sku:'OFF-001', cat:'office',   price:22000,
    img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.65,h:1.2,d:0.65}, color:'#1a1a2e', match:['office'] },
  { id:22, name:'Standing Desk 1.6m',    sku:'OFF-002', cat:'office',   price:28000,
    img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.6,h:0.75,d:0.7}, color:'#2c2a24', match:['office'] },
  /* ─ Bathroom ─ */
  { id:23, name:'Freestanding Bathtub',  sku:'BTH-001', cat:'bathroom', price:65000,
    img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.7,h:0.6,d:0.8}, color:'#f5f2ee', match:['bathroom'] },
  /* ─ Decor / Pooja ─ */
  { id:24, name:'Pooja Mandir Teak',     sku:'POJ-001', cat:'decor',    price:35000,
    img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.9,h:1.8,d:0.4}, color:'#8b5e2a', match:['pooja'] },
  /* ─ Kids ─ */
  { id:25, name:'Kids Study Table',      sku:'KID-001', cat:'bedroom',  price:14000,
    img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.2,h:0.75,d:0.6}, color:'#4a9edd', match:['kids'] },
  /* ─ Extra premium items ─ */
  { id:26, name:'Antique Camera Shelf',  sku:'DEC-004', cat:'decor',    price:8000,
    img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=300&q=70',
    glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
    dims:{w:0.2,h:0.2,d:0.15}, color:'#8b6a4a', match:['office','living'] },
  { id:27, name:'Coffee Table Glass',    sku:'LIV-001', cat:'seating',  price:16000,
    img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.2,h:0.4,d:0.6}, color:'#c8c8c8', match:['living'] },
  { id:28, name:'Corset Mirror',         sku:'DEC-005', cat:'decor',    price:12000,
    img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=300&q=70',
    glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Corset/glTF-Binary/Corset.glb',
    dims:{w:0.4,h:0.8,d:0.05}, color:'#c9a227', match:['bedroom','bathroom','living'] },
  { id:29, name:'Water Bottle Display',  sku:'KIT-003', cat:'kitchen',  price:2500,
    img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=300&q=70',
    glb:'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb',
    dims:{w:0.08,h:0.25,d:0.08}, color:'#7db8c8', match:['kitchen','dining'] },
  { id:30, name:'Porcelain Teapot',      sku:'DEC-006', cat:'decor',    price:3500,
    img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.2,h:0.18,d:0.14}, color:'#e8e0d4', match:['dining','living'] },
]

const MATERIALS_CATALOG = [
  { name:'White Oak',       code:'#C8A86B', type:'Wood',   price:850,  unit:'sq ft', styles:['Scandinavian','Japandi','Minimalist'] },
  { name:'Dark Walnut',     code:'#4A3220', type:'Wood',   price:1200, unit:'sq ft', styles:['Contemporary','Industrial','Art Deco'] },
  { name:'Teak Natural',    code:'#B87333', type:'Wood',   price:1500, unit:'sq ft', styles:['Traditional','Bohemian'] },
  { name:'Marble Carrara',  code:'#F0EBE0', type:'Stone',  price:2200, unit:'sq ft', styles:['Luxury','Art Deco','Contemporary'] },
  { name:'Granite Black',   code:'#2C2C2C', type:'Stone',  price:1800, unit:'sq ft', styles:['Industrial','Contemporary'] },
  { name:'Kadappa Stone',   code:'#4A4A40', type:'Stone',  price:950,  unit:'sq ft', styles:['Traditional','Vastu'] },
  { name:'Velvet Navy',     code:'#1B2A4A', type:'Fabric', price:450,  unit:'m',     styles:['Luxury','Contemporary'] },
  { name:'Linen Cream',     code:'#F5F0E8', type:'Fabric', price:320,  unit:'m',     styles:['Scandinavian','Japandi','Minimalist'] },
  { name:'Brushed Gold',    code:'#B8860B', type:'Metal',  price:2800, unit:'piece', styles:['Luxury','Art Deco'] },
  { name:'Matte Black',     code:'#1C1C1C', type:'Metal',  price:1600, unit:'piece', styles:['Industrial','Contemporary','Minimalist'] },
]

const RENDER_STYLES = ['Photorealistic','Watercolor','Sketch','Blueprint','Night Mode']
const RESOLUTIONS   = ['HD (720p)','Full HD (1080p)','4K (2160p)','8K']
const LIGHTINGS     = ['Daylight','Soft Afternoon','Golden Hour','Evening','Night']
const CAMERAS       = ['Normal','Panorama','Aerial','Top View']

async function getAISuggestedCatalog(roomType, style) {
  const fallback = CATALOG_ITEMS.filter(i => i.match.includes(roomType?.id || 'living')).slice(0, 6)
  if (!GEMINI_KEY) return { items: fallback, materials: MATERIALS_CATALOG.slice(0, 4) }
  try {
    const prompt = `You are an interior design AI. For a ${roomType?.label || 'Living Room'} with ${style || 'Modern'} style, suggest the best furniture and materials from this catalog.
Catalog items (id, name, cat): ${CATALOG_ITEMS.map(i => `${i.id}:${i.name}(${i.cat})`).join(', ')}
Materials: ${MATERIALS_CATALOG.map(m => m.name).join(', ')}
Respond ONLY with valid JSON: {"itemIds":[1,2,3,4,5,6],"materialNames":["White Oak","Marble Carrara"],"tips":["tip1","tip2","tip3"]}`
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.5,maxOutputTokens:512} }) }
    )
    if (!res.ok) return { items: fallback, materials: MATERIALS_CATALOG.slice(0, 4) }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = JSON.parse(text.replace(/```json|```/g,'').trim())
    const items = (parsed.itemIds || []).map(id => CATALOG_ITEMS.find(i => i.id === id)).filter(Boolean)
    const materials = (parsed.materialNames || []).map(n => MATERIALS_CATALOG.find(m => m.name === n)).filter(Boolean)
    return { items: items.length ? items : fallback, materials: materials.length ? materials : MATERIALS_CATALOG.slice(0,4), tips: parsed.tips || [] }
  } catch {
    return { items: fallback, materials: MATERIALS_CATALOG.slice(0, 4) }
  }
}

async function analyzeFloorPlan(base64, mimeType) {
  if (!GEMINI_KEY) return null
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Analyze this 2D floor plan image. Identify all rooms, estimate each room\'s approximate area in sq ft, and suggest ideal furniture for each room. Respond ONLY with valid JSON (no markdown, no extra text): {"rooms":[{"name":"Living Room","area":300,"furniture":["Sofa","Coffee Table","TV Unit"]}],"totalArea":1200,"style":"Modern","suggestions":["Add statement lighting","Use light colors"],"estimatedCost":"₹8–12 Lakhs"}' },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
        })
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch { return null }
}

/* ─── Studio Landing ─── */
const LANDING_TEMPLATES = [
  { id:'t1', label:"Modern Luxury Living",    author:"El Shaddai Studio", img:'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=500&q=80', type:'Project' },
  { id:'t2', label:"Scandinavian Bedroom",    author:"El Shaddai Studio", img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80', type:'Project' },
  { id:'t3', label:"Japandi Living Room",     author:"El Shaddai Studio", img:'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=500&q=80', type:'Project' },
  { id:'t4', label:"Dark Industrial Loft",    author:"El Shaddai Studio", img:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=80', type:'Project' },
  { id:'t5', label:"Warm Boho Bedroom",       author:"Design Studio",     img:'https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&w=500&q=80', type:'Room' },
  { id:'t6', label:"Vastu-Friendly Home",     author:"Vastu Expert",      img:'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=500&q=80', type:'Room' },
  { id:'t7', label:"Royal Luxury Suite",      author:"Luxury Designs",    img:'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80', type:'Room' },
  { id:'t8', label:"Minimal White Interior",  author:"Minimal Studio",    img:'https://images.unsplash.com/photo-1567016526105-22da7c13161a?auto=format&fit=crop&w=500&q=80', type:'Room' },
  { id:'t9', label:"Modular Kitchen",         author:"Kitchen Expert",    img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=500&q=80', type:'Project' },
  { id:'t10',label:"Kids Creative Room",      author:"Kids Design",       img:'https://images.unsplash.com/photo-1555816851-2b56c89bbc27?auto=format&fit=crop&w=500&q=80', type:'Room' },
]

const ACTION_ICONS = {
  'Import Image': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
  'Import CAD': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/>
    </svg>
  ),
  'New Design': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  'My Designs': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  'AI Planner': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
}

function StudioLanding({ onStart, fileInputRef, onUpload }) {
  const [tab, setTab] = useState('Project')
  const filtered = LANDING_TEMPLATES.filter(t => t.type === tab)
  const actions = [
    { label:'Import Image', desc:'Upload a floor plan photo',   onClick: () => fileInputRef.current?.click() },
    { label:'Import CAD',   desc:'Import .dwg or .dxf file',   onClick: () => alert('CAD import: upload your .dwg file') },
    { label:'New Design',   desc:'Start with a blank canvas',   onClick: () => onStart('new') },
    { label:'My Designs',   desc:'Continue a saved design',     onClick: () => onStart('my') },
    { label:'AI Planner',   desc:'Let AI plan your room',       isNew:true, onClick: () => onStart('ai') },
  ]
  return (
    <div style={{ flex:1, overflowY:'auto', background:'#f7f5f2', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 40px 64px' }}>
        {/* Heading */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:36 }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:34, fontWeight:400, color:C.bg, margin:0 }}>
            Create a Floor Plan
          </h1>
          <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#888', display:'flex', alignItems:'center', gap:4 }}>
            Beginner's Guide ›
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:48 }}>
          {actions.map(a => (
            <button key={a.label} onClick={a.onClick}
              style={{ position:'relative', background:'#fff', border:'1.5px solid #e8e0d8', borderRadius:10, padding:'22px 16px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.boxShadow=`0 4px 20px rgba(196,149,106,0.2)` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#e8e0d8'; e.currentTarget.style.boxShadow='none' }}>
              {a.isNew && (
                <span style={{ position:'absolute', top:10, right:10, background:'#ef4444', color:'#fff', fontSize:8, fontWeight:800, padding:'2px 6px', borderRadius:3, letterSpacing:'0.1em' }}>NEW</span>
              )}
              <span style={{ color: C.gold }}>{ACTION_ICONS[a.label]}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:12, color:C.bg, marginBottom:2 }}>{a.label}</div>
                <div style={{ fontSize:10, color:'#9a8a82' }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Template section */}
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:400, color:C.bg, margin:'0 0 20px' }}>
            Quickly start with a template
          </h2>

          {/* Tabs */}
          <div style={{ display:'flex', gap:0, marginBottom:24, borderBottom:'1px solid #e8e0d8' }}>
            {['Project','Room'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding:'8px 20px', background: tab===t ? C.bg : 'transparent', color: tab===t ? '#fff' : '#888',
                  border:'none', cursor:'pointer', fontSize:12, fontWeight:700, borderRadius: tab===t ? '6px 6px 0 0' : 0, transition:'all 0.15s' }}>
                {t} Templates
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
            {filtered.map(t => (
              <div key={t.id} onClick={() => onStart('template', t)}
                style={{ cursor:'pointer', borderRadius:8, overflow:'hidden', border:'1.5px solid #e8e0d8', background:'#fff', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 24px rgba(0,0,0,0.1)` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e8e0d8'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
                <div style={{ position:'relative', height:150 }}>
                  <img src={t.img} alt={t.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <span style={{ position:'absolute', top:8, left:8, background:'#22c55e', color:'#fff', fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:3 }}>Free</span>
                </div>
                <div style={{ padding:'10px 12px' }}>
                  <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:600, color:C.bg, lineHeight:1.3 }}>{t.label}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:14, height:14, borderRadius:'50%', background:C.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, color:'#fff', fontWeight:700 }}>ES</div>
                    <span style={{ fontSize:9, color:'#9a8a82' }}>{t.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Top Bar ─── */
function TopBar({ onSave, onExport, onClose, mode, setMode }) {
  const TOOLS = [
    { label:'File',         icon:'📄', onClick: () => {} },
    { label:'Save',         icon:'💾', onClick: onSave },
    { label:'Undo',         icon:'↩',  onClick: () => {} },
    { label:'Redo',         icon:'↪',  onClick: () => {} },
    { label:'Clear',        icon:'🗑',  onClick: () => {} },
    null,
    { label:'Construction', icon:'🔧', onClick: () => {} },
    { label:'Tools',        icon:'⚙️', onClick: () => {} },
    { label:'View',         icon:'👁',  onClick: () => {} },
    { label:'AI Tools',     icon:'✨',  isNew:true, onClick: () => {} },
    null,
    { label:'Export',       icon:'⬆', onClick: onExport },
    { label:'Images',       icon:'🖼', onClick: () => {} },
    { label:'Render',       icon:'🎬', isHighlight:true, onClick: () => {} },
  ]
  return (
    <div style={{ height:52, background:C.panel2, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 16px', gap:0, flexShrink:0, zIndex:100 }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginRight:16, flexShrink:0 }}>
        <div style={{ width:28, height:28, background:C.gold, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/></svg>
        </div>
        <div>
          <div style={{ color:'#fff', fontWeight:700, fontSize:12, lineHeight:1 }}>El Shaddai</div>
          <div style={{ color:C.gold, fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase' }}>Design Studio</div>
        </div>
      </div>
      <div style={{ width:1, height:28, background:C.border, marginRight:12 }} />

      {/* Toolbar buttons */}
      <div style={{ display:'flex', alignItems:'center', gap:1, flex:1 }}>
        {TOOLS.map((t, i) =>
          t === null ? (
            <div key={i} style={{ width:1, height:28, background:C.border, margin:'0 8px' }} />
          ) : (
            <button key={t.label} onClick={t.onClick} title={t.label}
              style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1,
                padding:'4px 10px', background: t.isHighlight ? C.gold : 'transparent',
                border:'none', borderRadius:4, cursor:'pointer', transition:'background 0.15s', minWidth:48 }}
              onMouseEnter={e => { if (!t.isHighlight) e.currentTarget.style.background='rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (!t.isHighlight) e.currentTarget.style.background='transparent' }}>
              {t.isNew && (
                <span style={{ position:'absolute', top:2, right:2, background:'#ef4444', color:'#fff', fontSize:6, fontWeight:800, padding:'1px 3px', borderRadius:2 }}>NEW</span>
              )}
              <span style={{ fontSize:13 }}>{t.icon}</span>
              <span style={{ fontSize:8, fontWeight:600, color: t.isHighlight ? '#000' : C.muted, letterSpacing:'0.05em' }}>{t.label}</span>
            </button>
          )
        )}
      </div>

      {/* 2D/3D toggle */}
      <div style={{ display:'flex', background:C.bg, borderRadius:6, padding:2, gap:1, marginLeft:8 }}>
        {['2D','3D'].map(m => (
          <button key={m} onClick={() => setMode(m.toLowerCase())} style={{
            padding:'4px 14px', background: mode===m.toLowerCase() ? '#fff' : 'transparent',
            color: mode===m.toLowerCase() ? '#000' : C.muted,
            border:'none', cursor:'pointer', borderRadius:4, fontSize:11, fontWeight:700,
          }}>{m}</button>
        ))}
      </div>

      <div style={{ width:1, height:28, background:C.border, margin:'0 12px' }} />
      <button onClick={onClose} style={{ padding:'5px 12px', background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:4, cursor:'pointer', fontSize:11 }}>
        ✕ Close
      </button>
    </div>
  )
}

/* ─── Step 1: Draw Panel ─── */
function DrawPanel({ onSelectRoom, uploadedPlan, onUpload, aiAnalysis, analyzing }) {
  const fileRef = useRef()
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Upload floor plan */}
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Upload 2D Floor Plan</p>
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border:`2px dashed ${uploadedPlan ? C.gold : C.border}`, borderRadius:8, padding:'20px 12px', textAlign:'center', cursor:'pointer', background: uploadedPlan ? 'rgba(201,162,39,0.05)' : C.bg, transition:'all 0.2s' }}>
          {uploadedPlan ? (
            <>
              <img src={uploadedPlan} alt="plan" style={{ width:'100%', maxHeight:120, objectFit:'contain', borderRadius:4, marginBottom:8 }} />
              <p style={{ color:C.gold, fontSize:10, margin:0, fontWeight:600 }}>✓ Plan uploaded</p>
            </>
          ) : (
            <>
              <div style={{ fontSize:28, marginBottom:8 }}>📐</div>
              <p style={{ color:C.text, fontSize:11, margin:'0 0 4px', fontWeight:600 }}>Upload Floor Plan</p>
              <p style={{ color:C.muted, fontSize:9, margin:0 }}>JPG, PNG, PDF · AI will analyze it</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onUpload} />
        {analyzing && (
          <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(201,162,39,0.1)', borderRadius:6 }}>
            <div style={{ width:14, height:14, border:`2px solid ${C.gold}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }} />
            <p style={{ color:C.gold, fontSize:10, margin:0, fontWeight:600 }}>AI analyzing floor plan…</p>
          </div>
        )}
      </div>

      {/* AI Analysis result */}
      {aiAnalysis && (
        <div style={{ background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:8, padding:12 }}>
          <p style={{ color:'#60a5fa', fontSize:10, fontWeight:700, margin:'0 0 8px', letterSpacing:'0.1em' }}>🤖 AI ANALYSIS</p>
          <p style={{ color:C.text, fontSize:11, margin:'0 0 6px' }}>Total Area: <strong>{aiAnalysis.totalArea} sq ft</strong></p>
          <p style={{ color:C.text, fontSize:11, margin:'0 0 6px' }}>Style: <strong>{aiAnalysis.style}</strong></p>
          <p style={{ color:C.text, fontSize:11, margin:'0 0 8px' }}>Est. Cost: <strong>{aiAnalysis.estimatedCost}</strong></p>
          <p style={{ color:C.muted, fontSize:9, fontWeight:700, textTransform:'uppercase', margin:'0 0 6px' }}>Rooms Detected</p>
          {aiAnalysis.rooms?.map((r, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ color:C.text, fontSize:10 }}>{r.name}</span>
              <span style={{ color:C.muted, fontSize:10 }}>{r.area} sq ft</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Start From Room Type</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
          {ROOM_TEMPLATES.map(r => (
            <button key={r.id} onClick={() => onSelectRoom(r)} style={{
              padding:'10px 6px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:6,
              cursor:'pointer', textAlign:'center', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.background = `${r.color}10` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg }}>
              <span style={{ fontSize:18 }}>{r.icon}</span>
              <span style={{ color:C.text, fontSize:9, fontWeight:600 }}>{r.label}</span>
              <span style={{ color:C.muted, fontSize:8 }}>{r.area}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Drawing Tools</p>
        {[
          { icon:'⬜', label:'Wall' }, { icon:'🚪', label:'Door' },
          { icon:'🪟', label:'Window' }, { icon:'⬛', label:'Room' },
          { icon:'📐', label:'Measure' }, { icon:'🗑', label:'Erase' },
        ].map(t => (
          <button key={t.label} style={{
            width:'100%', display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
            background:'transparent', border:'none', color:C.text, cursor:'pointer', borderRadius:4, fontSize:11, marginBottom:2,
          }}
            onMouseEnter={e => e.currentTarget.style.background = C.border}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize:14 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Catalog Item Card ─── */
function CatalogCard({ item, onAdd, added }) {
  return (
    <div style={{ background:C.bg, border:`1px solid ${added ? C.gold : C.border}`, borderRadius:6, overflow:'hidden', transition:'border-color 0.2s' }}>
      <div style={{ position:'relative', height:90, overflow:'hidden' }}>
        <img src={item.img} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        {added && (
          <div style={{ position:'absolute', inset:0, background:'rgba(201,162,39,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:20 }}>✓</span>
          </div>
        )}
      </div>
      <div style={{ padding:'8px 8px 6px' }}>
        <p style={{ color:C.text, fontSize:10, fontWeight:600, margin:'0 0 2px', lineHeight:1.3 }}>{item.name}</p>
        <p style={{ color:C.muted, fontSize:8, margin:'0 0 6px', fontFamily:'monospace' }}>{item.sku}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ color:C.gold, fontSize:11, fontWeight:700 }}>₹{item.price.toLocaleString()}</span>
          <button onClick={() => onAdd(item)} style={{
            padding:'3px 8px', background: added ? C.gold : 'transparent',
            border:`1px solid ${added ? C.gold : C.border}`, color: added ? '#000' : C.text,
            borderRadius:3, cursor:'pointer', fontSize:8, fontWeight:700,
          }}>{added ? '✓ Added' : '+ Add'}</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 2: Decorate Panel ─── */
function DecoratePanel({ templateScope, setTemplateScope, onApplyTemplate, activeCat, setActiveCat, aiCatalog, catalogLoading, addedItems, onAddItem }) {
  const [search, setSearch] = useState('')
  const [subTab, setSubTab] = useState('templates') // 'templates' | 'catalog' | 'materials'

  const filtered = AI_TEMPLATES.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.style.toLowerCase().includes(search.toLowerCase())
  )

  const catalogFiltered = activeCat === 'all'
    ? (aiCatalog?.items || [])
    : (aiCatalog?.items || []).filter(i => i.cat === activeCat)

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Sub-tab bar */}
      <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        {[['templates','🎨 Templates'],['catalog','🤖 AI Catalog'],['materials','🪨 Materials']].map(([id,label]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{
            flex:1, padding:'9px 4px', background:'transparent',
            color: subTab===id ? C.gold : C.muted,
            border:'none', borderBottom: subTab===id ? `2px solid ${C.gold}` : '2px solid transparent',
            cursor:'pointer', fontSize:9, fontWeight:700, letterSpacing:'0.05em',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 10px' }}>

        {/* ── Templates Tab ── */}
        {subTab === 'templates' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', gap:4 }}>
              {['Single Room','Whole House'].map(s => (
                <button key={s} onClick={() => setTemplateScope(s)} style={{
                  flex:1, padding:'5px 4px', background: templateScope===s ? C.gold : C.bg,
                  color: templateScope===s ? '#000' : C.muted, border:`1px solid ${templateScope===s ? C.gold : C.border}`,
                  borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:700,
                }}>{s}</button>
              ))}
            </div>
            <input
              placeholder="Search styles…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width:'100%', padding:'7px 10px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:4, color:C.text, fontSize:11, outline:'none', boxSizing:'border-box' }} />
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {filtered.map(t => (
                <div key={t.id} style={{ position:'relative', borderRadius:6, overflow:'hidden', cursor:'pointer', border:`1px solid ${C.border}` }}
                  onClick={() => onApplyTemplate(t)}>
                  <img src={t.img} alt={t.label} style={{ width:'100%', height:80, objectFit:'cover', display:'block' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)', pointerEvents:'none' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'6px 8px' }}>
                    <p style={{ color:'#fff', fontSize:10, fontWeight:700, margin:0 }}>{t.label}</p>
                    <p style={{ color:'rgba(255,255,255,0.6)', fontSize:9, margin:0 }}>{t.style} · {t.rooms}</p>
                  </div>
                  <div style={{ position:'absolute', top:6, right:6, padding:'2px 6px', background:C.gold, borderRadius:3 }}>
                    <span style={{ fontSize:8, fontWeight:700, color:'#000' }}>APPLY</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI Catalog Tab ── */}
        {subTab === 'catalog' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {/* AI Tips */}
            {aiCatalog?.tips?.length > 0 && (
              <div style={{ background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:6, padding:10 }}>
                <p style={{ color:'#60a5fa', fontSize:9, fontWeight:700, margin:'0 0 6px', letterSpacing:'0.1em' }}>🤖 AI DESIGN TIPS</p>
                {aiCatalog.tips.map((tip, i) => (
                  <p key={i} style={{ color:C.text, fontSize:10, margin:'0 0 4px', lineHeight:1.5 }}>· {tip}</p>
                ))}
              </div>
            )}

            {/* Category filter */}
            <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
              <button onClick={() => setActiveCat('all')} style={{
                padding:'3px 8px', background: activeCat==='all' ? C.gold : C.bg,
                color: activeCat==='all' ? '#000' : C.muted, border:`1px solid ${activeCat==='all' ? C.gold : C.border}`,
                borderRadius:3, cursor:'pointer', fontSize:8, fontWeight:700,
              }}>All</button>
              {FURNITURE_CATS.map(c => (
                <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
                  padding:'3px 8px', background: activeCat===c.id ? C.gold : C.bg,
                  color: activeCat===c.id ? '#000' : C.muted, border:`1px solid ${activeCat===c.id ? C.gold : C.border}`,
                  borderRadius:3, cursor:'pointer', fontSize:8, fontWeight:700,
                }}>{c.icon}</button>
              ))}
            </div>

            {catalogLoading ? (
              <div style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ width:32, height:32, border:`2px solid ${C.gold}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 10px' }} />
                <p style={{ color:C.muted, fontSize:11, margin:0 }}>AI picking best items…</p>
              </div>
            ) : catalogFiltered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', color:C.muted, fontSize:11 }}>
                <div style={{ fontSize:28, marginBottom:8 }}>🛋</div>
                Apply a template or select a room to see AI suggestions
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {catalogFiltered.map(item => (
                  <CatalogCard key={item.id} item={item} onAdd={onAddItem} added={addedItems.some(a => a.id === item.id)} />
                ))}
              </div>
            )}

            {aiCatalog?.items?.length > 0 && (
              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10, marginTop:4 }}>
                <p style={{ color:C.muted, fontSize:9, margin:'0 0 4px' }}>
                  {addedItems.length} item{addedItems.length !== 1 ? 's' : ''} added · Est. ₹{addedItems.reduce((s,i) => s+i.price, 0).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Materials Tab ── */}
        {subTab === 'materials' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', margin:'0 0 4px' }}>AI Recommended Materials</p>
            {(aiCatalog?.materials || MATERIALS_CATALOG.slice(0,4)).map(m => (
              <div key={m.name} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:C.bg, border:`1px solid ${C.border}`, borderRadius:6 }}>
                <div style={{ width:28, height:28, borderRadius:4, background:m.code, border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:C.text, fontSize:10, fontWeight:600, margin:0 }}>{m.name}</p>
                  <p style={{ color:C.muted, fontSize:8, margin:0 }}>{m.type} · ₹{m.price}/{m.unit}</p>
                </div>
                <button style={{ padding:'3px 8px', background:'transparent', border:`1px solid ${C.border}`, color:C.text, borderRadius:3, cursor:'pointer', fontSize:8, fontWeight:700, flexShrink:0 }}>+ Use</button>
              </div>
            ))}
            {!aiCatalog?.materials && (
              <p style={{ color:C.muted, fontSize:10, textAlign:'center', padding:'12px 0' }}>Apply a template to get AI material picks</p>
            )}

            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10, marginTop:4 }}>
              <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', margin:'0 0 8px' }}>All Materials</p>
              {MATERIALS_CATALOG.map(m => (
                <div key={m.name} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:4, cursor:'pointer', marginBottom:2 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.border}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width:20, height:20, borderRadius:3, background:m.code, border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }} />
                  <span style={{ color:C.text, fontSize:10, flex:1 }}>{m.name}</span>
                  <span style={{ color:C.muted, fontSize:8 }}>{m.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Step 3: Render Panel ─── */
function RenderPanel({ settings, setSettings, onRender, rendering, renderProgress }) {
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:14 }}>
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Camera</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {CAMERAS.map(c => (
            <button key={c} onClick={() => setSettings(s => ({ ...s, camera:c }))} style={{
              padding:'7px 4px', background: settings.camera===c ? C.gold : C.bg,
              color: settings.camera===c ? '#000' : C.text, border:`1px solid ${settings.camera===c ? C.gold : C.border}`,
              borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:600,
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Render Style</p>
        {RENDER_STYLES.map(s => (
          <button key={s} onClick={() => setSettings(r => ({ ...r, style:s }))} style={{
            width:'100%', display:'flex', alignItems:'center', gap:8, padding:'7px 10px', marginBottom:2,
            background: settings.style===s ? 'rgba(201,162,39,0.15)' : 'transparent',
            border: settings.style===s ? `1px solid ${C.gold}` : '1px solid transparent',
            color: settings.style===s ? C.gold : C.text, borderRadius:4, cursor:'pointer', fontSize:11,
          }}>
            {settings.style===s ? '●' : '○'} {s}
          </button>
        ))}
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Resolution</p>
        {RESOLUTIONS.map(r => (
          <button key={r} onClick={() => setSettings(s => ({ ...s, resolution:r }))} style={{
            width:'100%', display:'flex', alignItems:'center', gap:8, padding:'7px 10px', marginBottom:2,
            background: settings.resolution===r ? 'rgba(201,162,39,0.15)' : 'transparent',
            border: settings.resolution===r ? `1px solid ${C.gold}` : '1px solid transparent',
            color: settings.resolution===r ? C.gold : C.text, borderRadius:4, cursor:'pointer', fontSize:11,
          }}>
            {settings.resolution===r ? '●' : '○'} {r}
          </button>
        ))}
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 10px' }}>Lighting</p>
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          {LIGHTINGS.map(l => (
            <button key={l} onClick={() => setSettings(s => ({ ...s, lighting:l }))} style={{
              padding:'7px 10px', background: settings.lighting===l ? 'rgba(201,162,39,0.15)' : 'transparent',
              border: settings.lighting===l ? `1px solid ${C.gold}` : '1px solid transparent',
              color: settings.lighting===l ? C.gold : C.text, borderRadius:4, cursor:'pointer', fontSize:11, textAlign:'left',
            }}>
              {settings.lighting===l ? '●' : '○'} {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        {rendering ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ width:48, height:48, border:`3px solid rgba(201,162,39,0.3)`, borderTopColor:C.gold, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
            <p style={{ color:C.gold, fontSize:12, fontWeight:600, margin:'0 0 4px' }}>Rendering…</p>
            <div style={{ background:C.bg, borderRadius:4, height:4, margin:'0 auto', width:'80%' }}>
              <div style={{ background:C.gold, height:'100%', borderRadius:4, width:`${renderProgress}%`, transition:'width 0.3s' }} />
            </div>
            <p style={{ color:C.muted, fontSize:10, margin:'6px 0 0' }}>{renderProgress}%</p>
          </div>
        ) : (
          <button onClick={onRender} style={{
            width:'100%', padding:'12px', background:C.gold, border:'none',
            color:'#000', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700, marginBottom:8,
          }}>
            ✨ Render Now
          </button>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:8 }}>
          {[{ label:'Export Image', icon:'🖼' }, { label:'Construction Drawings', icon:'📐' }, { label:'Bill of Quantities', icon:'📋' }, { label:'Share Design', icon:'🔗' }].map(a => (
            <button key={a.label} style={{
              padding:'8px 6px', background:C.bg, border:`1px solid ${C.border}`,
              color:C.text, borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:600,
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            }}>
              <span style={{ fontSize:16 }}>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent renders gallery */}
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Recent Renders</p>
        {[
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=200&q=60',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=200&q=60',
          'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=200&q=60',
        ].map((img, i) => (
          <img key={i} src={img} alt={`render ${i}`} style={{ width:'100%', borderRadius:4, marginBottom:6, display:'block', cursor:'pointer' }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Step Progress Bar ─── */
function StepBar({ step, setSideTab }) {
  const steps = [
    { n:1, label:'2D Draw',   tab:'build'    },
    { n:2, label:'3D Design', tab:'decorate' },
    { n:3, label:'Render',    tab:'render'   },
  ]
  return (
    <div style={{ height:32, background:C.panel, borderBottom:`1px solid ${C.border}`,
      display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexShrink:0 }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display:'flex', alignItems:'center' }}>
          <button onClick={() => setSideTab(s.tab)} style={{
            display:'flex', alignItems:'center', gap:6, padding:'4px 16px',
            background: step===s.n ? 'rgba(201,162,39,0.12)' : 'transparent',
            border:'none', cursor:'pointer',
            borderBottom: step===s.n ? `2px solid ${C.gold}` : '2px solid transparent',
          }}>
            <span style={{ width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              background: step===s.n ? C.gold : step>s.n ? 'rgba(201,162,39,0.4)' : C.border,
              fontSize:8, fontWeight:800, color: step===s.n ? '#000' : step>s.n ? C.gold : C.muted }}>
              {step > s.n ? '✓' : s.n}
            </span>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
              color: step===s.n ? C.gold : step>s.n ? 'rgba(201,162,39,0.6)' : C.muted }}>
              {s.label}
            </span>
          </button>
          {i < steps.length-1 && (
            <div style={{ width:24, height:1, background: step>s.n ? C.gold : C.border }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Main Canvas Area ─── */
function MainCanvas({ step, mode, uploadedPlan, addedItems, appliedTemplate, onSelectFurniture }) {
  return (
    <div style={{ flex:1, minWidth:0, overflow:'hidden', position:'relative', display:'flex', flexDirection:'column' }}>
      {/* 3D viewport — WebGPU when available, Three.js fallback */}
      <div style={{ flex:1, minHeight:0, width:'100%', position:'relative' }}>
        {supportsWebGPU ? (
          <WebGPUViewport
            step={step}
            addedItems={addedItems}
            appliedTemplate={appliedTemplate}
            onSelectFurniture={onSelectFurniture}
          />
        ) : (
          <ThreeViewport
            step={step}
            addedItems={addedItems}
            appliedTemplate={appliedTemplate}
            onSelectFurniture={onSelectFurniture}
          />
        )}

        {/* Reference plan overlay */}
        {uploadedPlan && step === 1 && (
          <div style={{ position:'absolute', bottom:48, right:12, width:150, background:'rgba(8,7,10,0.92)', border:`1px solid ${C.gold}`, padding:8, zIndex:30, pointerEvents:'none' }}>
            <p style={{ color:C.gold, fontSize:9, fontWeight:700, margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.18em' }}>📐 Reference Plan</p>
            <img src={uploadedPlan} alt="reference" style={{ width:'100%', display:'block', opacity:0.85 }} />
          </div>
        )}
      </div>
    </div>
  )
}

function Loading({ label, sub }) {
  return (
    <div style={{ height:'100%', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
      <div style={{ width:40, height:40, border:`3px solid rgba(201,162,39,0.3)`, borderTopColor:C.gold, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:C.text, fontSize:13, fontWeight:600, margin:0 }}>{label}</p>
      {sub && <p style={{ color:C.muted, fontSize:11, margin:0 }}>{sub}</p>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ─── Right Properties Panel ─── */
function RightPanel({ step, selectedRoom, appliedTemplate, addedItems = [] }) {
  if (step === 1) return (
    <div style={{ width:220, background:C.panel, borderLeft:`1px solid ${C.border}`, padding:16, overflowY:'auto' }}>
      <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 12px' }}>Layer Settings</p>
      {selectedRoom && (
        <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:12, marginBottom:12 }}>
          <p style={{ color:C.text, fontSize:12, fontWeight:700, margin:'0 0 8px' }}>{selectedRoom.icon} {selectedRoom.label}</p>
          <p style={{ color:C.muted, fontSize:10, margin:'0 0 4px' }}>Area: {selectedRoom.area}</p>
        </div>
      )}
      <div style={{ marginBottom:16 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Basic Parameters</p>
        {[['Wall Height','9\' 0"'],['Wall Thickness','0.5 in'],['Total Building','560 ft²']].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ color:C.muted, fontSize:10 }}>{k}</span>
            <span style={{ color:C.text, fontSize:10, fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Wall Settings</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ color:C.muted, fontSize:10 }}>Lock Walls</span>
          <div style={{ width:28, height:16, background:C.border, borderRadius:8, cursor:'pointer' }} />
        </div>
      </div>
    </div>
  )

  if (step === 2) return (
    <div style={{ width:220, background:C.panel, borderLeft:`1px solid ${C.border}`, padding:16, overflowY:'auto' }}>
      <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 12px' }}>Properties</p>
      {appliedTemplate && (
        <div style={{ background:'rgba(201,162,39,0.1)', border:`1px solid ${C.gold}`, borderRadius:6, padding:10, marginBottom:12 }}>
          <p style={{ color:C.gold, fontSize:10, fontWeight:700, margin:'0 0 4px' }}>Applied Template</p>
          <p style={{ color:C.text, fontSize:11, margin:0 }}>{appliedTemplate.label}</p>
          <p style={{ color:C.muted, fontSize:9, margin:'2px 0 0' }}>{appliedTemplate.style}</p>
        </div>
      )}
      <div style={{ marginBottom:14 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Materials</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {['#8B7355','#F5F0E8','#C0C0C0','#4A3728','#2C5F2E','#1B2A4A'].map(color => (
            <button key={color} style={{ width:28, height:28, background:color, borderRadius:4, border:`2px solid ${C.border}`, cursor:'pointer' }} />
          ))}
        </div>
      </div>
      <div>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Room Stats</p>
        {[['Total Area','560 ft²'],['Furniture',`${addedItems.length} items`],['Est. Cost', addedItems.length ? `₹${(addedItems.reduce((s,i)=>s+i.price,0)/100000).toFixed(1)}L` : '—']].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
            <span style={{ color:C.muted, fontSize:10 }}>{k}</span>
            <span style={{ color:k==='Est. Cost'&&addedItems.length ? C.gold : C.text, fontSize:10, fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>

      {addedItems.length > 0 && (
        <div style={{ marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
          <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', margin:'0 0 8px' }}>Design Cart</p>
          {addedItems.map(item => (
            <div key={item.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:5, alignItems:'center' }}>
              <p style={{ color:C.text, fontSize:9, margin:0, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:4 }}>{item.name}</p>
              <span style={{ color:C.gold, fontSize:9, fontWeight:700, flexShrink:0 }}>₹{(item.price/1000).toFixed(0)}K</span>
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:8, marginTop:4, display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:C.text, fontSize:10, fontWeight:700 }}>Total</span>
            <span style={{ color:C.gold, fontSize:11, fontWeight:700 }}>₹{addedItems.reduce((s,i)=>s+i.price,0).toLocaleString()}</span>
          </div>
          <button style={{ width:'100%', marginTop:8, padding:'8px', background:C.gold, border:'none', color:'#000', borderRadius:4, cursor:'pointer', fontSize:10, fontWeight:700 }}>
            Request Quote →
          </button>
        </div>
      )}
    </div>
  )

  if (step === 3) return (
    <div style={{ width:220, background:C.panel, borderLeft:`1px solid ${C.border}`, padding:16, overflowY:'auto' }}>
      <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 12px' }}>Camera Settings</p>
      {[['Clipping','Off'],['Camera Calibration','Off'],['FOV','70°'],['Height','2\' 7"'],['Pitch Angle','0°']].map(([k,v]) => (
        <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ color:C.muted, fontSize:10 }}>{k}</span>
          <span style={{ color:C.text, fontSize:10, fontWeight:600 }}>{v}</span>
        </div>
      ))}
      <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:4 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Views</p>
        {['Front','Left','Right','Top'].map(v => (
          <button key={v} style={{ width:'100%', padding:'6px 10px', background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:4, marginBottom:4, cursor:'pointer', fontSize:10, textAlign:'left' }}>{v} View</button>
        ))}
      </div>
    </div>
  )

  return null
}

/* ─── Sidebar Icons ─── */
const SIDEBAR_TABS = [
  { id:'build',     label:'Build',     icon:'🏗' },
  { id:'decorate',  label:'Decorate',  icon:'🎨' },
  { id:'ai',        label:'AI Decor',  icon:'✨' },
  { id:'templates', label:'Templates', icon:'📋' },
  { id:'mine',      label:'Mine',      icon:'📁' },
  { id:'render',    label:'Render',    icon:'🎬' },
  { id:'my',        label:'My',        icon:'👤' },
]

/* ─── Main Export ─── */
export default function StudioPage() {
  const navigate                              = useNavigate()
  const [showLanding, setShowLanding]         = useState(true)
  const [sideTab, setSideTab]                 = useState('build')
  const [mode, setMode]                       = useState('3d')
  const [templateScope, setTemplateScope]     = useState('Single Room')
  const [appliedTemplate, setAppliedTemplate] = useState(null)
  const [activeCat, setActiveCat]             = useState('all')
  const [selectedRoom, setSelectedRoom]       = useState(null)
  const [uploadedPlan, setUploadedPlan]       = useState(null)
  const [aiAnalysis, setAiAnalysis]           = useState(null)
  const [analyzing, setAnalyzing]             = useState(false)
  const [rendering, setRendering]             = useState(false)
  const [renderProgress, setRenderProgress]   = useState(0)
  const [renderSettings, setRenderSettings]   = useState({
    camera:'Normal', style:'Photorealistic', resolution:'4K (2160p)', lighting:'Daylight',
  })
  const [aiCatalog, setAiCatalog]             = useState(null)
  const [catalogLoading, setCatalogLoading]   = useState(false)
  const [addedItems, setAddedItems]           = useState([])
  const fileInputRef                          = useRef()

  // Map sidebar tab → step
  const step = sideTab === 'build' || sideTab === 'templates' || sideTab === 'mine' ? 1
    : sideTab === 'decorate' || sideTab === 'ai' || sideTab === 'my' ? 2
    : 3

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setShowLanding(false)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      setUploadedPlan(dataUrl)
      setAnalyzing(true)
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type || 'image/jpeg'
      const result = await analyzeFloorPlan(base64, mimeType)
      setAiAnalysis(result || {
        rooms:[{name:'Living Room',area:320},{name:'Bedroom',area:200},{name:'Kitchen',area:150},{name:'Bathroom',area:80}],
        totalArea:1100, style:'Modern Indian', estimatedCost:'₹8–12 Lakhs',
      })
      setAnalyzing(false)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRender = useCallback(() => {
    setRendering(true); setRenderProgress(0)
    const iv = setInterval(() => setRenderProgress(p => {
      if (p >= 100) { clearInterval(iv); setRendering(false); return 100 }
      return p + 3
    }), 150)
  }, [])

  const handleAddItem = useCallback((item) => {
    setAddedItems(prev => prev.some(a=>a.id===item.id) ? prev.filter(a=>a.id!==item.id) : [...prev,item])
  }, [])

  const handleApplyTemplate = useCallback(async (t) => {
    setAppliedTemplate(t); setSideTab('decorate')
    setCatalogLoading(true)
    const result = await getAISuggestedCatalog(selectedRoom, t.style)
    setAiCatalog(result); setCatalogLoading(false)
  }, [selectedRoom])

  const handleSelectRoom = useCallback(async (r) => {
    setSelectedRoom(r); setSideTab('decorate')
    setCatalogLoading(true)
    const result = await getAISuggestedCatalog(r, appliedTemplate?.style)
    setAiCatalog(result); setCatalogLoading(false)
  }, [appliedTemplate])

  const handleLandingStart = useCallback((type, template) => {
    setShowLanding(false)
    if (type === 'template' && template) handleApplyTemplate({ label:template.label, style:'Modern', img:template.img })
    if (type === 'ai') setSideTab('ai')
    if (type === 'my') setSideTab('mine')
  }, [handleApplyTemplate])

  if (showLanding) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {/* Landing top bar */}
      <div style={{ height:52, background:C.panel, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 20px', gap:12, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, background:C.gold, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" fill="white"/></svg>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:12 }}>El Shaddai</div>
            <div style={{ color:C.gold, fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase' }}>Design Studio</div>
          </div>
        </div>
        <div style={{ flex:1 }} />
        <button onClick={() => navigate('/')} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:4, padding:'5px 14px', cursor:'pointer', fontSize:11 }}>
          ✕ Exit Studio
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleUpload} />
      <StudioLanding onStart={handleLandingStart} fileInputRef={fileInputRef} onUpload={handleUpload} />
    </div>
  )

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', background:C.bg, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleUpload} />

      <TopBar
        mode={mode} setMode={setMode}
        onSave={() => alert('Design saved!')}
        onExport={() => alert('Exporting…')}
        onClose={() => setShowLanding(true)}
      />

      <StepBar step={step} setSideTab={setSideTab} />

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Icon sidebar */}
        <div style={{ width:64, background:C.panel2, borderRight:`1px solid ${C.border}`, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:8, gap:2 }}>
          {SIDEBAR_TABS.map(t => (
            <button key={t.id} onClick={() => setSideTab(t.id)} title={t.label}
              style={{ width:54, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'8px 4px', borderRadius:6,
                background: sideTab===t.id ? 'rgba(196,149,106,0.18)' : 'transparent',
                border: sideTab===t.id ? `1px solid rgba(196,149,106,0.4)` : '1px solid transparent',
                cursor:'pointer', transition:'all 0.15s' }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <span style={{ fontSize:8, fontWeight:600, color: sideTab===t.id ? C.gold : C.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div style={{ width:252, background:C.panel, borderRight:`1px solid ${C.border}`, flexShrink:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {(sideTab==='build'||sideTab==='templates'||sideTab==='mine') && (
            <DrawPanel
              onSelectRoom={handleSelectRoom}
              uploadedPlan={uploadedPlan}
              onUpload={handleUpload}
              aiAnalysis={aiAnalysis}
              analyzing={analyzing}
            />
          )}
          {(sideTab==='decorate'||sideTab==='ai'||sideTab==='my') && (
            <DecoratePanel
              templateScope={templateScope}
              setTemplateScope={setTemplateScope}
              onApplyTemplate={handleApplyTemplate}
              activeCat={activeCat}
              setActiveCat={setActiveCat}
              aiCatalog={aiCatalog}
              catalogLoading={catalogLoading}
              addedItems={addedItems}
              onAddItem={handleAddItem}
            />
          )}
          {sideTab==='render' && (
            <RenderPanel
              settings={renderSettings}
              setSettings={setRenderSettings}
              onRender={handleRender}
              rendering={rendering}
              renderProgress={renderProgress}
            />
          )}
        </div>

        {/* Main Canvas — Three.js WebGL */}
        <MainCanvas
          step={step}
          mode={mode}
          uploadedPlan={uploadedPlan}
          addedItems={addedItems}
          appliedTemplate={appliedTemplate}
          onSelectFurniture={(item) => item && console.info('[Studio] selected:', item?.name)}
        />

        {/* Right Panel */}
        <RightPanel
          step={step}
          selectedRoom={selectedRoom}
          appliedTemplate={appliedTemplate}
          addedItems={addedItems}
        />
      </div>

      {/* Bottom Status Bar */}
      <div style={{ height:28, background:C.panel, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 16px', gap:16 }}>
        {[
          { label:'Walls', val:'8' },
          { label:'Rooms', val: aiAnalysis ? aiAnalysis.rooms?.length||4 : '4' },
          { label:'Area', val: aiAnalysis ? `${aiAnalysis.totalArea} ft²` : '560 ft²' },
          { label:'Furniture', val: addedItems.length||'12' },
        ].map(({ label, val }) => (
          <div key={label} style={{ display:'flex', gap:4 }}>
            <span style={{ color:C.muted, fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}:</span>
            <span style={{ color:C.text, fontSize:9, fontWeight:600 }}>{val}</span>
          </div>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', background:'rgba(0,0,0,0.3)', borderRadius:4, overflow:'hidden' }}>
          {['2D 1','3D 3'].map(v => (
            <button key={v} style={{ padding:'2px 10px', background: v.startsWith('3D') ? C.gold : 'transparent', border:'none', color: v.startsWith('3D') ? '#000' : C.muted, fontSize:9, fontWeight:700, cursor:'pointer' }}>
              {v}
            </button>
          ))}
        </div>
        <span style={{ color:C.muted, fontSize:9, marginLeft:8 }}>Floor 1 of 1</span>
      </div>
    </div>
  )
}
