import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThreeViewport from '../../features/designer/ThreeViewport'
import FloorPlan2D from '../../features/designer/FloorPlan2D'
import { SceneProvider, useScene } from '../../store/sceneStore'
import { exportSceneDescriptor, submitRenderJob, pollRenderJob } from '../../lib/gltfExport'

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
  /* ─ More Seating ─ */
  { id:31, name:'L-Shape Sectional',     sku:'SOF-004', cat:'seating',  price:72000,
    img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:2.8,h:0.85,d:1.8}, color:'#8a7a6a', match:['living'] },
  { id:32, name:'Recliner Sofa',         sku:'SOF-005', cat:'seating',  price:55000,
    img:'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.1,h:1.0,d:0.95}, color:'#4a3c30', match:['living','bedroom'] },
  { id:33, name:'Ottoman Pouf Large',    sku:'SOF-006', cat:'seating',  price:8500,
    img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.7,h:0.42,d:0.7}, color:'#c9a882', match:['living','bedroom'] },
  { id:34, name:'Swing Chair Hanging',   sku:'SOF-007', cat:'seating',  price:18000,
    img:'https://images.unsplash.com/photo-1544782720-75d5e8a18c21?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.9,h:1.8,d:0.9}, color:'#d4b896', match:['living','kids','outdoor'] },
  /* ─ More Bedroom ─ */
  { id:35, name:'Dressing Table Mirror', sku:'BED-004', cat:'bedroom',  price:22000,
    img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.0,h:1.5,d:0.4}, color:'#d4b896', match:['bedroom'] },
  { id:36, name:'Chest of Drawers 5D',   sku:'BED-005', cat:'bedroom',  price:28000,
    img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.8,h:1.0,d:0.45}, color:'#e8ddd2', match:['bedroom'] },
  { id:37, name:'Kids Bunk Bed',         sku:'BED-006', cat:'bedroom',  price:35000,
    img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.0,h:1.8,d:2.1}, color:'#3a7bd5', match:['kids','bedroom'] },
  /* ─ More Dining ─ */
  { id:38, name:'Round Dining Table 4S', sku:'DIN-004', cat:'dining',   price:28000,
    img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.2,h:0.76,d:1.2}, color:'#7a5c3a', match:['dining','kitchen'] },
  { id:39, name:'Buffet Sideboard',      sku:'DIN-005', cat:'dining',   price:42000,
    img:'https://images.unsplash.com/photo-1549488344-cbb6c34184c8?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.6,h:0.85,d:0.45}, color:'#5a3e28', match:['dining','living'] },
  /* ─ More Storage ─ */
  { id:40, name:'Shoe Rack Tall',        sku:'STR-004', cat:'storage',  price:12000,
    img:'https://images.unsplash.com/photo-1558997519-83ea9252eeb8?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.8,h:1.5,d:0.3}, color:'#c8c0b8', match:['bedroom','living'] },
  { id:41, name:'Filing Cabinet 3D',     sku:'STR-005', cat:'storage',  price:16000,
    img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.46,h:1.05,d:0.62}, color:'#808080', match:['office'] },
  { id:42, name:'Display Cabinet Glass', sku:'STR-006', cat:'storage',  price:32000,
    img:'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.9,h:1.9,d:0.35}, color:'#e8e8e8', match:['living','dining'] },
  /* ─ Outdoor ─ */
  { id:43, name:'Garden Lounge Set',     sku:'OUT-001', cat:'outdoor',  price:48000,
    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:2.2,h:0.75,d:1.4}, color:'#5a8a5a', match:['outdoor'] },
  { id:44, name:'Outdoor Dining Set',    sku:'OUT-002', cat:'outdoor',  price:36000,
    img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.6,h:0.76,d:0.9}, color:'#3a3a3a', match:['outdoor'] },
  { id:45, name:'Hammock with Stand',    sku:'OUT-003', cat:'outdoor',  price:12000,
    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:1.0,h:0.9,d:3.0}, color:'#c8a870', match:['outdoor'] },
  { id:46, name:'Planter Box Teak',      sku:'OUT-004', cat:'outdoor',  price:6500,
    img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.6,h:0.45,d:0.3}, color:'#8b6a3a', match:['outdoor','living'] },
  /* ─ More Lighting ─ */
  { id:47, name:'Chandelier 8-Arm',      sku:'LIT-004', cat:'lighting', price:35000,
    img:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.9,h:0.6,d:0.9}, color:'#c9a227', match:['dining','living'] },
  { id:48, name:'Track Light 3-Spot',    sku:'LIT-005', cat:'lighting', price:8000,
    img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.6,h:0.12,d:0.08}, color:'#2c2c2c', match:['kitchen','office','living'] },
  { id:49, name:'Table Lamp Marble',     sku:'LIT-006', cat:'lighting', price:5500,
    img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.25,h:0.45,d:0.25}, color:'#f0ede8', match:['bedroom','living','office'] },
  /* ─ More Decor ─ */
  { id:50, name:'Bookend Set Brass',     sku:'DEC-007', cat:'decor',    price:3200,
    img:'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.1,h:0.18,d:0.1}, color:'#c9a227', match:['office','living'] },
  { id:51, name:'Indoor Plant Fiddle',   sku:'DEC-008', cat:'decor',    price:2800,
    img:'https://images.unsplash.com/photo-1549887534-1541e9326578?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.5,h:1.4,d:0.5}, color:'#3a7a3a', match:['living','office','bedroom'] },
  { id:52, name:'Wall Clock Wooden',     sku:'DEC-009', cat:'decor',    price:4500,
    img:'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=300&q=70',
    glb:null, dims:{w:0.5,h:0.5,d:0.05}, color:'#8b6a3a', match:['living','kitchen','office'] },
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
    { label:'Import Plan',  desc:'JPG, PNG, PDF, SVG, DWG, DXF', onClick: () => fileInputRef.current?.click() },
    { label:'Import CAD',   desc:'DWG · DXF · RVT · SKP · IFC', onClick: () => fileInputRef.current?.click() },
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
          <button onClick={() => window.open('https://www.youtube.com/results?search_query=interior+design+floor+plan+tutorial', '_blank')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#888', display:'flex', alignItems:'center', gap:4 }}>
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
function TopBar({ onSave, onExport, onClose, mode, setMode, onUndo, onRedo, onClear, onFile, onSwitchTab, onTriggerRender }) {
  const TOOLS = [
    { label:'File',         icon:'📄', onClick: onFile },
    { label:'Save',         icon:'💾', onClick: onSave },
    { label:'Undo',         icon:'↩',  onClick: onUndo },
    { label:'Redo',         icon:'↪',  onClick: onRedo },
    { label:'Clear',        icon:'🗑',  onClick: onClear },
    null,
    { label:'Construction', icon:'🔧', onClick: () => onSwitchTab('build') },
    { label:'Tools',        icon:'⚙️', onClick: () => setMode(m => m==='2d'?'3d':'2d') },
    { label:'View',         icon:'👁',  onClick: () => onSwitchTab('render') },
    { label:'AI Tools',     icon:'✨',  isNew:true, onClick: () => onSwitchTab('ai') },
    null,
    { label:'Export',       icon:'⬆', onClick: onExport },
    { label:'Images',       icon:'🖼', onClick: onFile },
    { label:'Render',       icon:'🎬', isHighlight:true, onClick: onTriggerRender },
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

/* ─── Homestyler-style Draw Panel ─── */
const HS = { bg:'#fff', bg2:'#f5f6f8', border:'#e8eaed', text:'#1a1a2e', muted:'#888', accent:'#2563eb', gold:'#c9a227' }

function HSSection({ title, children }) {
  return (
    <div style={{ borderTop:`1px solid ${HS.border}`, paddingTop:12, marginTop:4 }}>
      <p style={{ fontSize:12, fontWeight:700, color:HS.text, margin:'0 0 10px 14px' }}>{title}</p>
      <div style={{ padding:'0 12px 4px' }}>{children}</div>
    </div>
  )
}

function HSTool({ svg, label, isNew, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#e8f0ff' : HS.bg2, border:`1.5px solid ${active ? HS.accent : HS.border}`, borderRadius:10, padding:'12px 6px 8px', cursor:'pointer', textAlign:'center', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:6, position:'relative' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = HS.accent; e.currentTarget.style.background='#eef3ff' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = active ? HS.accent : HS.border; e.currentTarget.style.background = active ? '#e8f0ff' : HS.bg2 }}>
      {isNew && <span style={{ position:'absolute', top:4, right:4, background:'#ef4444', color:'#fff', fontSize:6, fontWeight:800, padding:'1px 4px', borderRadius:2 }}>NEW</span>}
      <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center' }}>{svg}</div>
      <span style={{ fontSize:9, fontWeight:600, color: active ? HS.accent : HS.text, lineHeight:1.3, textAlign:'center' }}>{label}</span>
    </button>
  )
}

function DrawPanel({ onSelectRoom, uploadedPlan, onUpload, aiAnalysis, analyzing, setSideTab, fileInputRef, onAIPlanner, activeTool, setActiveTool }) {
  const tool = (id) => ({ active: activeTool===id, onClick: () => setActiveTool(t => t===id ? null : id) })

  return (
    <div style={{ height:'100%', overflowY:'auto', background:HS.bg, fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Create Room */}
      <div style={{ padding:'16px 12px 0' }}>
        <p style={{ fontSize:14, fontWeight:800, color:HS.text, margin:'0 0 12px' }}>Create Room</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          {/* Select Templates */}
          <button onClick={() => setSideTab('templates')} style={{ background:HS.bg2, border:`1.5px solid ${HS.border}`, borderRadius:10, padding:'12px 10px 10px', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor=HS.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor=HS.border}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
              <span style={{ fontSize:12, fontWeight:700, color:HS.text }}>Select</span>
              <span style={{ color:HS.muted, fontSize:12 }}>›</span>
            </div>
            <div style={{ fontSize:10, color:HS.muted, marginBottom:10 }}>Templates</div>
            <svg width="60" height="44" viewBox="0 0 60 44">
              <rect x="4" y="10" width="24" height="30" fill="#e8eaed" stroke="#bbb" strokeWidth="1.5" rx="1"/>
              <rect x="32" y="4" width="24" height="18" fill="#dde3ea" stroke="#bbb" strokeWidth="1.5" rx="1"/>
              <rect x="32" y="26" width="24" height="14" fill="#e8eaed" stroke="#bbb" strokeWidth="1.5" rx="1"/>
            </svg>
          </button>

          {/* Import Floor Plan */}
          <button onClick={() => fileInputRef?.current?.click()} style={{ background:HS.bg2, border:`1.5px solid ${uploadedPlan ? '#22c55e' : HS.border}`, borderRadius:10, padding:'12px 10px 10px', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor=HS.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor= uploadedPlan ? '#22c55e' : HS.border}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
              <span style={{ fontSize:12, fontWeight:700, color:HS.text }}>Import</span>
              <span style={{ color:HS.muted, fontSize:12 }}>›</span>
            </div>
            <div style={{ fontSize:10, color:uploadedPlan ? '#22c55e' : HS.muted, marginBottom:10 }}>{uploadedPlan ? '✓ Plan loaded' : 'Floor Plan'}</div>
            <svg width="60" height="44" viewBox="0 0 60 44">
              <rect x="8" y="2" width="44" height="40" fill="#e8eaed" stroke="#bbb" strokeWidth="1.5" rx="2"/>
              <line x1="14" y1="12" x2="46" y2="12" stroke="#aaa" strokeWidth="1"/>
              <line x1="14" y1="18" x2="46" y2="18" stroke="#aaa" strokeWidth="1"/>
              <line x1="14" y1="24" x2="36" y2="24" stroke="#aaa" strokeWidth="1"/>
              <path d="M 14 30 A 10 10 0 0 1 28 30" fill="none" stroke={HS.accent} strokeWidth="1.5"/>
              <line x1="14" y1="30" x2="28" y2="30" stroke={HS.accent} strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        {/* AI Planner */}
        <button onClick={() => setSideTab('ai')} style={{ width:'100%', background:HS.text, color:'#fff', border:'none', borderRadius:8, padding:'11px 16px', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:4 }}
          onMouseEnter={e => e.currentTarget.style.background='#2d2d3f'}
          onMouseLeave={e => e.currentTarget.style.background=HS.text}>
          <span style={{ fontSize:15 }}>✨</span>
          Ai Planner
          <span style={{ background:'#ef4444', color:'#fff', fontSize:8, fontWeight:800, padding:'2px 5px', borderRadius:3, letterSpacing:'0.05em' }}>NEW</span>
          <span style={{ marginLeft:'auto', opacity:0.6 }}>›</span>
        </button>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div style={{ margin:'10px 12px 0', background:'#f0f7ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 12px' }}>
          <p style={{ color:HS.accent, fontSize:10, fontWeight:700, margin:'0 0 6px', letterSpacing:'0.08em' }}>🤖 AI ANALYSIS</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:HS.text }}><strong>{aiAnalysis.totalArea}</strong> sq ft</span>
            <span style={{ fontSize:11, color:HS.text }}><strong>{aiAnalysis.rooms?.length}</strong> rooms</span>
            <span style={{ fontSize:11, color:'#c9a227', fontWeight:600 }}>{aiAnalysis.style}</span>
          </div>
          {aiAnalysis.estimatedCost && <p style={{ fontSize:10, color:'#16a34a', margin:'4px 0 4px', fontWeight:600 }}>{aiAnalysis.estimatedCost}</p>}
        </div>
      )}
      {analyzing && (
        <div style={{ margin:'8px 12px 0', display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:6 }}>
          <div style={{ width:12, height:12, border:'2px solid #f59e0b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }}/>
          <span style={{ color:'#92400e', fontSize:10, fontWeight:600 }}>AI analysing your floor plan…</span>
        </div>
      )}

      {/* Draw Walls */}
      <HSSection title="Draw Walls">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          <HSTool {...tool('wall')} label="Draw Straight Walls" svg={
            <svg width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="14" width="24" height="4" fill="none" stroke="#2563eb" strokeWidth="2"/><rect x="4" y="14" width="24" height="4" fill="#dde3ea"/></svg>
          }/>
          <HSTool {...tool('room')} label="Draw Rooms" svg={
            <svg width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2"/><rect x="6" y="6" width="20" height="20" fill="#eef3ff" opacity="0.6"/></svg>
          }/>
          <HSTool {...tool('outside')} isNew label="Outside Area" svg={
            <svg width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3,2"/></svg>
          }/>
        </div>
      </HSSection>

      {/* Door and Window */}
      <HSSection title="Door and Window">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          <HSTool {...tool('door')} label="Single Door" svg={
            <svg width="32" height="32" viewBox="0 0 32 32"><line x1="8" y1="8" x2="8" y2="24" stroke="#2563eb" strokeWidth="2"/><line x1="24" y1="8" x2="24" y2="24" stroke="#2563eb" strokeWidth="2"/><path d="M 8 8 A 16 16 0 0 1 24 8" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,2"/><line x1="8" y1="8" x2="24" y2="8" stroke="#2563eb" strokeWidth="1.5"/></svg>
          }/>
          <HSTool {...tool('window')} label="Window" svg={
            <svg width="32" height="32" viewBox="0 0 32 32"><line x1="4" y1="16" x2="28" y2="16" stroke="#2563eb" strokeWidth="2"/><line x1="4" y1="13" x2="28" y2="13" stroke="#2563eb" strokeWidth="1"/><line x1="4" y1="19" x2="28" y2="19" stroke="#2563eb" strokeWidth="1"/></svg>
          }/>
          <HSTool {...tool('baywin')} label="Corner Bay Window" svg={
            <svg width="32" height="32" viewBox="0 0 32 32"><polyline points="4,24 16,10 28,24" fill="none" stroke="#2563eb" strokeWidth="2"/><line x1="4" y1="21" x2="16" y2="7" stroke="#2563eb" strokeWidth="1" opacity="0.5"/><line x1="28" y1="21" x2="16" y2="7" stroke="#2563eb" strokeWidth="1" opacity="0.5"/></svg>
          }/>
        </div>
      </HSSection>

      {/* Structure */}
      <HSSection title="Structure">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { id:'stairs', label:'Staircase', svg:<svg width="32" height="32" viewBox="0 0 32 32"><path d="M4 28 L4 22 L10 22 L10 16 L16 16 L16 10 L22 10 L22 4 L28 4" fill="none" stroke="#2563eb" strokeWidth="2"/></svg> },
            { id:'column', label:'Column', svg:<svg width="32" height="32" viewBox="0 0 32 32"><rect x="12" y="4" width="8" height="24" fill="#dde3ea" stroke="#2563eb" strokeWidth="1.5"/></svg> },
            { id:'beam',   label:'Beam',   svg:<svg width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="14" width="24" height="4" fill="#dde3ea" stroke="#2563eb" strokeWidth="1.5"/></svg> },
          ].map(t => <HSTool key={t.id} {...tool(t.id)} label={t.label} svg={t.svg}/>)}
        </div>
      </HSSection>

      {/* Room Types */}
      <HSSection title="Start from Room Type">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
          {ROOM_TEMPLATES.map(r => (
            <button key={r.id} onClick={() => onSelectRoom(r)}
              style={{ padding:'9px 8px', background:HS.bg2, border:`1.5px solid ${HS.border}`, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=r.color; e.currentTarget.style.background=`${r.color}12` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=HS.border; e.currentTarget.style.background=HS.bg2 }}>
              <span style={{ fontSize:16 }}>{r.icon}</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:10, fontWeight:700, color:HS.text }}>{r.label}</div>
                <div style={{ fontSize:9, color:HS.muted }}>{r.area}</div>
              </div>
            </button>
          ))}
        </div>
      </HSSection>
      <div style={{ height:20 }}/>
    </div>
  )
}

/* ─── Catalog Item Card ─── */
function CatalogCard({ item, onAdd, added }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/x-furniture', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      title="Drag onto floor plan to place"
      style={{ background:C.bg, border:`1px solid ${added ? C.gold : C.border}`, borderRadius:6, overflow:'hidden', transition:'border-color 0.2s', cursor:'grab' }}
    >
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
function DecoratePanel({ sideTab, templateScope, setTemplateScope, onApplyTemplate, activeCat, setActiveCat, aiCatalog, catalogLoading, addedItems, onAddItem, onUseMaterial }) {
  const [search, setSearch] = useState('')
  const [subTab, setSubTab] = useState(sideTab === 'ai' ? 'catalog' : 'templates')

  useEffect(() => {
    if (sideTab === 'ai') setSubTab('catalog')
    else if (sideTab === 'templates') setSubTab('templates')
  }, [sideTab])

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
                <button onClick={() => onUseMaterial?.(m)} style={{ padding:'3px 8px', background:'transparent', border:`1px solid ${C.border}`, color:C.text, borderRadius:3, cursor:'pointer', fontSize:8, fontWeight:700, flexShrink:0, transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.color=C.gold}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text}}>+ Use</button>
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
function RenderPanel({ settings, setSettings, onRender, rendering, renderProgress, addedItems, aiAnalysis }) {
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
          {[
            { label:'Export Image', icon:'🖼', action: () => {
              const canvases = document.querySelectorAll('canvas')
              const canvas = Array.from(canvases).find(c => c.width > 100) || canvases[0]
              if (canvas) {
                const a = document.createElement('a')
                a.href = canvas.toDataURL('image/png')
                a.download = `elshaddai-render-${Date.now()}.png`
                a.click()
              } else {
                const el = document.createElement('div')
                el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1c1917;color:#fff;padding:20px 28px;border-radius:8px;border:1px solid #c9a227;z-index:99999;font-family:DM Sans,sans-serif;font-size:13px;text-align:center'
                el.innerHTML = '⚠️ No canvas found.<br><small style="color:#9a8a82">Switch to 3D mode and try again.</small>'
                document.body.appendChild(el)
                setTimeout(() => el.remove(), 2800)
              }
            }},
            { label:'Construction Drawings', icon:'📐', action: () => {
              const items = JSON.parse(localStorage.getItem('elshaddai_studio_design') || '{}')?.addedItems || []
              const lines = ['# El Shaddai — Construction Drawings', `Generated: ${new Date().toLocaleDateString('en-IN')}`, '', '## Room Layout', `Total Area: ${aiAnalysis?.totalArea || 560} sq ft`, `Rooms: ${aiAnalysis?.rooms?.map(r=>r.name).join(', ') || 'Living Room, Bedroom, Kitchen, Bathroom'}`, '', '## Furniture Schedule', ...items.map((i,n)=>`${n+1}. ${i.name} (${i.sku}) — ${i.dims?.w}m × ${i.dims?.d}m × ${i.dims?.h}m`), '', '## Notes', '- All dimensions in metres unless stated otherwise', '- Verify on site before fabrication', '', 'Contact: contactus@elshaddai.in']
              const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = 'elshaddai-construction-notes.txt'; a.click()
              URL.revokeObjectURL(url)
            }},
            { label:'Bill of Quantities', icon:'📋', action: () => {
              const items = JSON.parse(localStorage.getItem('elshaddai_studio_design') || '{}')?.addedItems || addedItems
              if (!items.length) {
                const el = document.createElement('div')
                el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1c1917;color:#fff;padding:20px 28px;border-radius:8px;border:1px solid #c9a227;z-index:99999;font-family:DM Sans,sans-serif;font-size:13px;text-align:center'
                el.innerHTML = 'ℹ️ Add furniture to your design first.'
                document.body.appendChild(el); setTimeout(() => el.remove(), 2500); return
              }
              const total = items.reduce((s,i)=>s+i.price,0)
              const csv = ['Item,SKU,Category,Price (₹)', ...items.map(i=>`"${i.name}","${i.sku}","${i.cat}","${i.price.toLocaleString()}"`), `"TOTAL","","","${total.toLocaleString()}"`].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = 'elshaddai-BOQ.csv'; a.click()
              URL.revokeObjectURL(url)
            }},
            { label:'Share Design', icon:'🔗', action: () => {
              navigator.clipboard.writeText(window.location.href).then(() => {
                const el = document.createElement('div')
                el.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:#22c55e;color:#fff;padding:10px 22px;border-radius:6px;z-index:99999;font-family:DM Sans,sans-serif;font-size:12px;font-weight:700'
                el.textContent = '✓ Studio link copied!'
                document.body.appendChild(el); setTimeout(() => el.remove(), 2200)
              })
            }},
          ].map(a => (
            <button key={a.label} onClick={a.action} style={{
              padding:'8px 6px', background:C.bg, border:`1px solid ${C.border}`,
              color:C.text, borderRadius:4, cursor:'pointer', fontSize:9, fontWeight:600,
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              transition:'border-color 0.15s',
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
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
          { url:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=200&q=60', label:'Modern Living' },
          { url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=200&q=60', label:'Kitchen Design' },
          { url:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=200&q=60', label:'Bedroom Suite' },
        ].map((r, i) => (
          <div key={i} style={{ position:'relative', marginBottom:6, cursor:'pointer' }}
            onClick={() => window.open(r.url.replace('w=200','w=1200'), '_blank')}>
            <img src={r.url} alt={r.label} style={{ width:'100%', borderRadius:4, display:'block' }} />
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0)', transition:'background 0.2s', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,0,0,0.4)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0)'}}>
              <span style={{ color:'#fff', fontSize:9, fontWeight:700, opacity:0, transition:'opacity 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                onMouseLeave={e=>e.currentTarget.style.opacity='0'}>
                View Full ↗
              </span>
            </div>
          </div>
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
async function renderPDFToDataURL(file) {
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      s.onload = resolve; s.onerror = reject
      document.head.appendChild(s)
    })
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  const ab = await file.arrayBuffer()
  const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise
  const page = await pdf.getPage(1)
  const vp = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = vp.width; canvas.height = vp.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
  return canvas.toDataURL('image/png')
}

function MainCanvas({ step, mode, setMode, activeTool, uploadedPlan, aiAnalysis, addedItems, appliedTemplate, activeView, activeMaterial, onSelectFurniture, onUpload, fileInputRef }) {
  return (
    <div style={{ flex:1, minWidth:0, overflow:'hidden', position:'relative', display:'flex', flexDirection:'column', background:C.bg }}>

      {/* 2D / 3D toggle bar — light Homestyler-style */}
      <div style={{ height:44, background:'#fff', borderBottom:'1px solid #e8eaed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:20, gap:12 }}>
        <div style={{ display:'flex', background:'#f0f2f5', borderRadius:8, padding:3, gap:2 }}>
          {[['2D', '2d', '2D Floor Plan'], ['3D', '3d', '3D View']].map(([, val, title]) => (
            <button key={val} onClick={() => setMode(val)}
              style={{ padding:'6px 24px', background: mode===val ? '#fff' : 'transparent',
                color: mode===val ? '#1a1a2e' : '#6b7280', border:'none', cursor:'pointer',
                borderRadius:6, fontSize:12, fontWeight:700, transition:'all 0.15s',
                boxShadow: mode===val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {title}
            </button>
          ))}
        </div>
        {uploadedPlan && <span style={{ fontSize:9, color:'#22c55e', fontWeight:700, letterSpacing:'0.08em', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'2px 8px', borderRadius:4 }}>✓ FLOOR PLAN LOADED</span>}
      </div>

      {/* Viewport area */}
      <div style={{ flex:1, minHeight:0, position:'relative' }}>

        {/* ── 3D — always mounted so WebGL context never dies ── */}
        <div style={{ position:'absolute', inset:0, opacity: mode==='3d' ? 1 : 0, pointerEvents: mode==='3d' ? 'auto' : 'none', transition:'opacity 0.3s' }}>
          <ThreeViewport
            step={step} mode={mode}
            addedItems={addedItems} appliedTemplate={appliedTemplate}
            activeView={activeView} activeMaterial={activeMaterial}
            onSelectFurniture={onSelectFurniture}
            uploadedPlan={uploadedPlan} aiAnalysis={aiAnalysis}
          />
        </div>

        {/* ── 2D — your actual floor plan ── */}
        <div style={{ position:'absolute', inset:0, opacity: mode==='2d' ? 1 : 0, pointerEvents: mode==='2d' ? 'auto' : 'none', transition:'opacity 0.3s', zIndex:5 }}>
          {uploadedPlan && uploadedPlan !== 'pdf' ? (
            /* Uploaded plan — show on light canvas like Homestyler */
            <div style={{ width:'100%', height:'100%', background:'#f8f9fb', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
              {/* Light grid */}
              <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
                <defs>
                  <pattern id="g2dm" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#c8d4e0" strokeWidth="0.5"/></pattern>
                  <pattern id="g2dM" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#g2dm)"/><path d="M 100 0 L 0 0 0 100" fill="none" stroke="#a8b8c8" strokeWidth="1"/></pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#g2dM)"/>
              </svg>
              {/* North arrow */}
              <div style={{ position:'absolute', top:12, left:12, display:'flex', flexDirection:'column', alignItems:'center', gap:1, zIndex:2 }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><polygon points="12,2 15,10 12,8 9,10" fill="#2563eb"/><polygon points="12,22 9,14 12,16 15,14" fill="#aab"/></svg>
                <span style={{ fontSize:8, fontWeight:800, color:'#2563eb' }}>N</span>
              </div>
              <img src={uploadedPlan} alt="Floor Plan"
                style={{ maxWidth:'82%', maxHeight:'82%', objectFit:'contain', borderRadius:4,
                  boxShadow:'0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(168,184,200,0.4)', background:'#fff', padding:8 }}/>
              {/* Top bar */}
              <div style={{ position:'absolute', top:0, left:0, right:0, padding:'8px 16px', background:'rgba(248,249,251,0.9)', borderBottom:'1px solid #e8eaed', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ background:'#2563eb', color:'#fff', fontSize:8, fontWeight:800, padding:'3px 8px', borderRadius:3, letterSpacing:'0.1em' }}>2D FLOOR PLAN</span>
                {aiAnalysis && <>
                  <span style={{ color:'#9ca3af', fontSize:10 }}>·</span>
                  <span style={{ color:'#1a1a2e', fontSize:10, fontWeight:600 }}>{aiAnalysis.totalArea} sq ft</span>
                  <span style={{ color:'#9ca3af', fontSize:10 }}>·</span>
                  <span style={{ color:'#c9a227', fontSize:10, fontWeight:600 }}>{aiAnalysis.style}</span>
                  <span style={{ color:'#9ca3af', fontSize:10 }}>·</span>
                  <span style={{ color:'#22c55e', fontSize:10 }}>{aiAnalysis.estimatedCost}</span>
                </>}
              </div>
              {/* Switch to 3D hint */}
              <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', background:'#fff', border:'1px solid #e8eaed', borderRadius:20, padding:'6px 18px', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}
                onClick={() => setMode('3d')}>
                <span style={{ color:'#2563eb', fontSize:10, fontWeight:700 }}>Switch to 3D View →</span>
              </div>
            </div>
          ) : (
            /* 2D Floor Plan Engine — draw walls, doors, windows */
            <FloorPlan2D
              activeTool={activeTool ?? 'select'}
              style={{ width:'100%', height:'100%' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Building Assembly Loading Screen ─── */
function StudioLoader({ onDone }) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)

  const PHASES = [
    { label: 'Laying foundation…',     icon: '▭', color: '#a07850' },
    { label: 'Raising walls…',         icon: '▯', color: '#c9a227' },
    { label: 'Installing windows…',    icon: '⊞', color: '#60c0f0' },
    { label: 'Fitting doors…',         icon: '⊓', color: '#e8c84e' },
    { label: 'Adding roof…',           icon: '⌂', color: '#c9a227' },
    { label: 'Furnishing rooms…',      icon: '⊡', color: '#10b981' },
    { label: 'Studio ready!',          icon: '✦', color: '#c9a227' },
  ]

  useEffect(() => {
    let p = 0
    const iv = setInterval(() => {
      p += 1.4
      setProgress(Math.min(p, 100))
      setPhase(Math.min(Math.floor(p / (100 / PHASES.length)), PHASES.length - 1))
      if (p >= 100) { clearInterval(iv); setTimeout(onDone, 600) }
    }, 40)
    return () => clearInterval(iv)
  }, [onDone])

  const ph = PHASES[phase]

  return (
    <div style={{ position:'fixed', inset:0, background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:9999, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @keyframes floatIn  { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp  { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }
        @keyframes roofDrop { from{transform:translateY(-40px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes winFade  { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(201,162,39,0.3)} 50%{box-shadow:0 0 40px rgba(201,162,39,0.7)} }
      `}</style>

      {/* Blueprint grid bg */}
      <div style={{ position:'absolute', inset:0, opacity:0.06 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="bp" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.gold} strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bp)"/>
        </svg>
      </div>

      {/* Building SVG animation */}
      <svg width="200" height="220" viewBox="0 0 200 220" style={{ marginBottom:32 }}>
        {/* Ground line */}
        <line x1="20" y1="190" x2="180" y2="190" stroke={C.border} strokeWidth="2"/>

        {/* Foundation */}
        <rect x="35" y="180" width="130" height="12"
          fill="#a07850" opacity={phase >= 0 ? 1 : 0}
          style={{ animation: phase >= 0 ? 'floatIn 0.5s ease' : 'none' }}/>

        {/* Left wall */}
        <rect x="35" y="90" width="18" height="90"
          fill={C.panel2} stroke={C.border} strokeWidth="1"
          opacity={phase >= 1 ? 1 : 0}
          style={{ animation: phase >= 1 ? 'slideUp 0.5s ease' : 'none', transformOrigin:'bottom' }}/>

        {/* Right wall */}
        <rect x="147" y="90" width="18" height="90"
          fill={C.panel2} stroke={C.border} strokeWidth="1"
          opacity={phase >= 1 ? 1 : 0}
          style={{ animation: phase >= 1 ? 'slideUp 0.5s ease 0.1s both' : 'none' }}/>

        {/* Middle floors */}
        <rect x="35" y="135" width="130" height="8"
          fill={C.border} opacity={phase >= 1 ? 1 : 0}
          style={{ animation: phase >= 1 ? 'floatIn 0.4s ease 0.2s both' : 'none' }}/>
        <rect x="35" y="88" width="130" height="8"
          fill={C.border} opacity={phase >= 1 ? 1 : 0}
          style={{ animation: phase >= 1 ? 'floatIn 0.4s ease 0.3s both' : 'none' }}/>

        {/* Windows ground floor */}
        {phase >= 2 && [60, 100, 125].map((x, i) => (
          <rect key={i} x={x} y="155" width="20" height="22"
            fill="#60c0f0" opacity="0.7" stroke={C.border} strokeWidth="1"
            style={{ animation: `winFade 0.3s ease ${i * 0.1}s both` }}/>
        ))}

        {/* Windows upper floor */}
        {phase >= 2 && [55, 95, 130].map((x, i) => (
          <rect key={i} x={x} y="103" width="18" height="18"
            fill="#60c0f0" opacity="0.6" stroke={C.border} strokeWidth="1"
            style={{ animation: `winFade 0.3s ease ${0.3 + i * 0.1}s both` }}/>
        ))}

        {/* Door */}
        {phase >= 3 && (
          <g style={{ animation:'floatIn 0.4s ease' }}>
            <rect x="88" y="158" width="24" height="32" fill={C.gold} opacity="0.8" rx="2"/>
            <circle cx="108" cy="174" r="2" fill="#000"/>
          </g>
        )}

        {/* Roof */}
        {phase >= 4 && (
          <polygon points="100,40 22,92 178,92"
            fill={C.gold} stroke="#a07820" strokeWidth="2"
            style={{ animation:'roofDrop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}/>
        )}

        {/* Chimney */}
        {phase >= 4 && (
          <rect x="140" y="50" width="12" height="30" fill={C.panel2} stroke={C.border} strokeWidth="1"
            style={{ animation:'slideUp 0.4s ease 0.2s both' }}/>
        )}

        {/* Stars/sparkles when ready */}
        {phase >= 6 && [
          [30,30],[170,25],[15,110],[185,115],[100,15],
        ].map(([x,y],i) => (
          <text key={i} x={x} y={y} fill={C.gold} fontSize="10"
            style={{ animation:`pulse 1s ease ${i*0.15}s infinite` }}>✦</text>
        ))}

        {/* Glow ring on done */}
        {phase >= 6 && (
          <circle cx="100" cy="120" r="90" fill="none" stroke={C.gold} strokeWidth="1" opacity="0.2"
            style={{ animation:'glow 1.5s ease infinite' }}/>
        )}
      </svg>

      {/* Phase label */}
      <div style={{ animation:'floatIn 0.3s ease', textAlign:'center' }}>
        <div style={{ fontSize:28, marginBottom:8, transition:'all 0.3s' }}>{ph.icon}</div>
        <p style={{ color:ph.color, fontSize:15, fontWeight:700, margin:'0 0 6px', letterSpacing:'0.02em', transition:'color 0.3s' }}>
          {ph.label}
        </p>
        <p style={{ color:C.muted, fontSize:11, margin:'0 0 28px' }}>El Shaddai Design Studio</p>
      </div>

      {/* Progress bar */}
      <div style={{ width:280, height:4, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg, ${C.gold}, #e8c84e)`, borderRadius:4, transition:'width 0.08s linear', boxShadow:`0 0 10px ${C.gold}` }}/>
      </div>
      <p style={{ color:C.muted, fontSize:10, marginTop:8 }}>{Math.round(progress)}%</p>

      {/* Parts list */}
      <div style={{ display:'flex', gap:16, marginTop:24, flexWrap:'wrap', justifyContent:'center', maxWidth:400 }}>
        {PHASES.slice(0, -1).map((p2, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:4, opacity: phase > i ? 1 : 0.25, transition:'opacity 0.3s' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background: phase > i ? '#22c55e' : C.border, transition:'background 0.3s' }}/>
            <span style={{ fontSize:9, color: phase > i ? C.text : C.muted }}>{p2.label.replace('…','')}</span>
          </div>
        ))}
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
function RightPanel({ step, selectedRoom, appliedTemplate, addedItems = [], selectedFurnitureItem, activeView, setActiveView, onUseMaterial }) {
  const [wallsLocked, setWallsLocked] = useState(false)

  if (step === 1) return (
    <div style={{ width:220, background:'#fff', borderLeft:`1px solid #e8eaed`, overflowY:'auto', fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* Mini 3D Preview */}
      <div style={{ background:'#1a1a2e', margin:'12px 12px 0', borderRadius:8, overflow:'hidden', position:'relative', height:96 }}>
        <svg viewBox="0 0 200 100" width="100%" height="100%" style={{ display:'block' }}>
          <defs>
            <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1a3e"/>
              <stop offset="100%" stopColor="#2d2d5e"/>
            </linearGradient>
          </defs>
          <rect width="200" height="100" fill="url(#skyG)"/>
          {/* floor */}
          <polygon points="20,80 180,80 160,65 40,65" fill="#2a2a4a"/>
          {/* back wall */}
          <rect x="40" y="20" width="120" height="45" fill="#333366"/>
          {/* left wall */}
          <polygon points="20,80 40,65 40,20 20,32" fill="#2b2b55"/>
          {/* ceiling */}
          <polygon points="20,32 40,20 160,20 180,28" fill="#3a3a66"/>
          {/* window */}
          <rect x="60" y="28" width="30" height="24" fill="#4a6fa5" opacity="0.7"/>
          <line x1="75" y1="28" x2="75" y2="52" stroke="#fff" strokeWidth="0.8" opacity="0.5"/>
          <line x1="60" y1="40" x2="90" y2="40" stroke="#fff" strokeWidth="0.8" opacity="0.5"/>
          {/* sofa hint */}
          <rect x="55" y="58" width="50" height="7" rx="2" fill="#c9a227" opacity="0.8"/>
          <rect x="55" y="54" width="8" height="11" rx="2" fill="#b08e20" opacity="0.8"/>
          <rect x="97" y="54" width="8" height="11" rx="2" fill="#b08e20" opacity="0.8"/>
        </svg>
        <div style={{ position:'absolute', bottom:6, left:8, fontSize:8, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>3D PREVIEW</div>
      </div>

      {/* Layer Settings */}
      <div style={{ borderBottom:'1px solid #e8eaed', padding:'12px 12px 10px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#1a1a2e' }}>Layer Settings</span>
          <span style={{ fontSize:10, color:'#2563eb', cursor:'pointer' }}>›</span>
        </div>
        {[
          { label:'Ground', color:'#6b7280', visible:true },
          { label:'Floor 1', color:'#2563eb', visible:true },
          { label:'Ceiling', color:'#9ca3af', visible:false },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:10, height:10, borderRadius:2, background: l.visible ? l.color : '#e5e7eb', flexShrink:0 }}/>
            <span style={{ fontSize:11, color:'#1a1a2e', flex:1 }}>{l.label}</span>
            <span style={{ fontSize:10, color: l.visible ? '#1a1a2e' : '#9ca3af' }}>{l.visible ? '●' : '○'}</span>
          </div>
        ))}
        {selectedRoom && (
          <div style={{ marginTop:6, padding:'6px 8px', background:'#f0f7ff', borderRadius:6, border:'1px solid #bfdbfe' }}>
            <span style={{ fontSize:10, color:'#2563eb', fontWeight:600 }}>{selectedRoom.icon} {selectedRoom.label}</span>
            <span style={{ fontSize:9, color:'#6b7280', marginLeft:6 }}>{selectedRoom.area}</span>
          </div>
        )}
      </div>

      {/* Basic Parameters */}
      <div style={{ borderBottom:'1px solid #e8eaed', padding:'12px 12px 10px' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'#1a1a2e', margin:'0 0 10px' }}>Basic Parameters</p>
        {[
          ['Total Building', '0.00 ft²'],
          ['Floors', '1'],
        ].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:11, color:'#6b7280' }}>{k}</span>
            <span style={{ fontSize:11, color:'#1a1a2e', fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Wall Settings */}
      <div style={{ padding:'12px 12px 16px' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'#1a1a2e', margin:'0 0 10px' }}>Wall Settings</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <span style={{ fontSize:11, color:'#6b7280' }}>Lock Walls</span>
          <div onClick={() => setWallsLocked(v=>!v)}
            style={{ width:32, height:18, background: wallsLocked ? '#2563eb' : '#d1d5db', borderRadius:9, cursor:'pointer', transition:'background 0.2s', position:'relative' }}>
            <div style={{ width:14, height:14, borderRadius:'50%', background:'#fff', position:'absolute', top:2, transition:'left 0.2s', left: wallsLocked ? 16 : 2, boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
        {[['Size', '–'],['Wall Height', "9' 2\""],['Wall Thickness', '0.45 in']].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:11, color:'#6b7280' }}>{k}</span>
            <span style={{ fontSize:11, color:'#1a1a2e', fontWeight:600 }}>{v}</span>
          </div>
        ))}
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
      {selectedFurnitureItem && (
        <div style={{ background:'rgba(201,162,39,0.08)', border:`1px solid ${C.gold}`, borderRadius:6, padding:10, marginBottom:12 }}>
          <p style={{ color:C.gold, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 6px' }}>Selected Item</p>
          <img src={selectedFurnitureItem.img} alt={selectedFurnitureItem.name} style={{ width:'100%', height:70, objectFit:'cover', borderRadius:4, marginBottom:6 }} />
          <p style={{ color:C.text, fontSize:11, fontWeight:700, margin:'0 0 2px' }}>{selectedFurnitureItem.name}</p>
          <p style={{ color:C.muted, fontSize:9, margin:'0 0 6px', fontFamily:'monospace' }}>{selectedFurnitureItem.sku}</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>₹{selectedFurnitureItem.price.toLocaleString()}</span>
            <span style={{ color:C.muted, fontSize:8 }}>{selectedFurnitureItem.cat}</span>
          </div>
          {selectedFurnitureItem.dims && (
            <p style={{ color:C.muted, fontSize:8, margin:'4px 0 0' }}>
              {selectedFurnitureItem.dims.w}m × {selectedFurnitureItem.dims.h}m × {selectedFurnitureItem.dims.d}m
            </p>
          )}
        </div>
      )}
      <div style={{ marginBottom:14 }}>
        <p style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Wall & Floor Colors</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {[
            { code:'#F5F0E8', name:'Warm White' },
            { code:'#E8E0D4', name:'Cream' },
            { code:'#C8B89A', name:'Sandstone' },
            { code:'#8B7355', name:'Walnut' },
            { code:'#4A3728', name:'Dark Oak' },
            { code:'#2C5F2E', name:'Forest' },
            { code:'#1B2A4A', name:'Navy' },
            { code:'#6A6A6A', name:'Concrete' },
          ].map(m => (
            <button key={m.code} title={m.name}
              onClick={() => onUseMaterial?.({ name: m.name, code: m.code, type: 'Wall/Floor' })}
              style={{ width:28, height:28, background:m.code, borderRadius:4, border:`2px solid ${C.border}`, cursor:'pointer', transition:'transform 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} />
          ))}
        </div>
        <p style={{ color:C.muted, fontSize:8, margin:'6px 0 0' }}>Click a color to apply to room walls</p>
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
          <button onClick={() => window.location.href='/?quote=1#contact'} style={{ width:'100%', marginTop:8, padding:'8px', background:C.gold, border:'none', color:'#000', borderRadius:4, cursor:'pointer', fontSize:10, fontWeight:700 }}>
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
          <button key={v} onClick={() => setActiveView(v)} style={{ width:'100%', padding:'6px 10px',
            background: activeView===v ? 'rgba(201,162,39,0.15)' : C.bg,
            border:`1px solid ${activeView===v ? C.gold : C.border}`,
            color: activeView===v ? C.gold : C.text, borderRadius:4, marginBottom:4, cursor:'pointer', fontSize:10, textAlign:'left', transition:'all 0.15s' }}>
            {activeView===v ? '▶ ' : ''}{v} View
          </button>
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
  return <SceneProvider><StudioPageInner /></SceneProvider>
}

function StudioPageInner() {
  const navigate                              = useNavigate()
  const [studioReady, setStudioReady]         = useState(false)
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
  const [activeTool, setActiveTool]           = useState('select') // 'select'|'wall'|'door'|'window'|'room'|'outside'
  const [aiCatalog, setAiCatalog]             = useState(null)
  const [catalogLoading, setCatalogLoading]   = useState(false)
  const [addedItems, setAddedItems]           = useState([])
  const [undoStack, setUndoStack]             = useState([])
  const [redoStack, setRedoStack]             = useState([])
  const [savedToast, setSavedToast]           = useState(false)
  const [toastMsg, setToastMsg]               = useState('')
  const [selectedFurnitureItem, setSelectedFurnitureItem] = useState(null)
  const [activeView, setActiveView]           = useState('Front')
  const [activeMaterial, setActiveMaterial]   = useState(null)
  const fileInputRef                          = useRef()

  // Map sidebar tab → step
  const step = sideTab === 'build' || sideTab === 'mine' ? 1
    : sideTab === 'decorate' || sideTab === 'ai' || sideTab === 'templates' || sideTab === 'my' ? 2
    : 3

  const showToast = useCallback((msg, color = '#22c55e') => {
    setToastMsg({ msg, color })
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }, [])

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected
    e.target.value = ''
    setShowLanding(false)
    setSideTab('build')

    const ext = file.name.split('.').pop().toLowerCase()
    const isImage = file.type.startsWith('image/')
    const isPDF   = file.type === 'application/pdf' || ext === 'pdf'
    const isCAD   = ['dwg','dxf','rvt','skp','ifc'].includes(ext)
    const isSVG   = ext === 'svg' || file.type === 'image/svg+xml'

    // For CAD / non-readable formats: skip preview, run AI with placeholder
    if (isCAD) {
      setUploadedPlan(null)
      setAnalyzing(true)
      setAiAnalysis({
        rooms:[{name:'Living Room',area:320},{name:'Bedroom',area:200},{name:'Kitchen',area:150},{name:'Bathroom',area:80}],
        totalArea:1100, style:'Modern Indian', estimatedCost:'₹8–12 Lakhs',
        note: `${file.name} uploaded. CAD files cannot be previewed in browser — AI analysis used default layout.`,
      })
      setAnalyzing(false)
      showToast(`${file.name} loaded — AI layout applied`, C.gold)
      return
    }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result

      if (isPDF) {
        setAnalyzing(true)
        // Render PDF page 1 to PNG for display, and send base64 to Gemini in parallel
        const base64 = dataUrl.split(',')[1]
        const [pngUrl, result] = await Promise.all([
          renderPDFToDataURL(file).catch(() => null),
          analyzeFloorPlan(base64, 'application/pdf').catch(() => null),
        ])
        setUploadedPlan(pngUrl || null)
        setAiAnalysis(result || {
          rooms:[{name:'Living Room',area:320},{name:'Bedroom',area:200},{name:'Kitchen',area:150},{name:'Bathroom',area:80}],
          totalArea:1100, style:'Modern Indian', estimatedCost:'₹8–12 Lakhs',
        })
        setMode('2d')
        setAnalyzing(false)
        showToast(`${file.name} analysed — viewing 2D plan`, C.gold)
        return
      }

      // Image / SVG — show preview + run AI
      setUploadedPlan(dataUrl)
      setAnalyzing(true)
      const base64 = dataUrl.split(',')[1]
      const mimeType = isImage ? (file.type || 'image/jpeg') : 'image/png'
      const result = await analyzeFloorPlan(base64, mimeType)
      setAiAnalysis(result || {
        rooms:[{name:'Living Room',area:320},{name:'Bedroom',area:200},{name:'Kitchen',area:150},{name:'Bathroom',area:80}],
        totalArea:1100, style:'Modern Indian', estimatedCost:'₹8–12 Lakhs',
      })
      setAnalyzing(false)
      showToast(`Floor plan analysed!`)
    }
    reader.readAsDataURL(file)
  }, [showToast])

  const handleRender = useCallback(() => {
    setRendering(true); setRenderProgress(0)
    const iv = setInterval(() => setRenderProgress(p => {
      if (p >= 100) { clearInterval(iv); setRendering(false); return 100 }
      return p + 3
    }), 150)
  }, [])

  const handleAddItem = useCallback((item) => {
    setAddedItems(prev => {
      const exists = prev.some(a => a.id === item.id)
      const next = exists ? prev.filter(a => a.id !== item.id) : [...prev, item]
      setUndoStack(u => [...u, prev])
      setRedoStack([])
      return next
    })
  }, [])

  // Scene store — read the structured scene for save/export
  const { scene, exportJSON, canUndo: sceneCanUndo, canRedo: sceneCanRedo, undo: sceneUndo, redo: sceneRedo } = useScene()

  const handleSave = useCallback(async () => {
    // 1. Save furniture/template (legacy)
    const design = { addedItems, appliedTemplate, selectedRoom, savedAt: new Date().toISOString() }
    localStorage.setItem('elshaddai_studio_design', JSON.stringify(design))
    // 2. Save scene data model
    const sceneJson = exportJSON()
    localStorage.setItem('elshaddai_scene_v1', sceneJson)
    // 3. Persist to backend if logged in
    try {
      const token = localStorage.getItem('es_token')
      if (token) {
        await fetch(`/api/scenes/${scene.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: scene.metadata.name, scene_json: sceneJson }),
        })
      }
    } catch { /* offline — local save is enough */ }
    showToast('Design saved!')
  }, [addedItems, appliedTemplate, selectedRoom, scene, exportJSON, showToast])

  const handleExport = useCallback(() => {
    const design = { addedItems, appliedTemplate, selectedRoom, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'elshaddai-design.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('Design exported!')
  }, [addedItems, appliedTemplate, selectedRoom, showToast])

  const handleUndo = useCallback(() => {
    setUndoStack(u => {
      if (!u.length) return u
      const prev = u[u.length - 1]
      setRedoStack(r => [...r, addedItems])
      setAddedItems(prev)
      return u.slice(0, -1)
    })
  }, [addedItems])

  const handleRedo = useCallback(() => {
    setRedoStack(r => {
      if (!r.length) return r
      const next = r[r.length - 1]
      setUndoStack(u => [...u, addedItems])
      setAddedItems(next)
      return r.slice(0, -1)
    })
  }, [addedItems])

  const handleClear = useCallback(() => {
    if (addedItems.length === 0) return
    if (window.confirm('Remove all furniture from the design?')) setAddedItems([])
  }, [addedItems])

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

  if (!studioReady) return <StudioLoader onDone={() => setStudioReady(true)} />

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
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.svg,.dwg,.dxf,.rvt,.skp,.ifc" style={{ display:'none' }} onChange={handleUpload} />
      <StudioLanding onStart={handleLandingStart} fileInputRef={fileInputRef} onUpload={handleUpload} />
    </div>
  )

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', background:C.bg, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.svg,.dwg,.dxf,.rvt,.skp,.ifc" style={{ display:'none' }} onChange={handleUpload} />

      {savedToast && (
        <div style={{ position:'fixed', top:64, right:24, zIndex:9999, background: toastMsg?.color || '#22c55e', color:'#fff', padding:'10px 20px', borderRadius:6, fontWeight:700, fontSize:12, boxShadow:'0 4px 16px rgba(0,0,0,0.3)' }}>
          ✓ {toastMsg?.msg || 'Saved!'}
        </div>
      )}
      <TopBar
        mode={mode} setMode={setMode}
        onSave={handleSave}
        onExport={handleExport}
        onClose={() => setShowLanding(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onFile={() => fileInputRef.current?.click()}
        onSwitchTab={setSideTab}
        onTriggerRender={() => { setSideTab('render'); handleRender() }}
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
          {(sideTab==='build'||sideTab==='mine') && (
            <DrawPanel
              onSelectRoom={handleSelectRoom}
              uploadedPlan={uploadedPlan}
              onUpload={handleUpload}
              aiAnalysis={aiAnalysis}
              analyzing={analyzing}
              setSideTab={setSideTab}
              fileInputRef={fileInputRef}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
            />
          )}
          {(sideTab==='decorate'||sideTab==='ai'||sideTab==='templates'||sideTab==='my') && (
            <DecoratePanel
              sideTab={sideTab}
              templateScope={templateScope}
              setTemplateScope={setTemplateScope}
              onApplyTemplate={handleApplyTemplate}
              activeCat={activeCat}
              setActiveCat={setActiveCat}
              aiCatalog={aiCatalog}
              catalogLoading={catalogLoading}
              addedItems={addedItems}
              onAddItem={handleAddItem}
              onUseMaterial={(m) => { setActiveMaterial(m); showToast(`${m.name} applied to room`) }}
            />
          )}
          {sideTab==='render' && (
            <RenderPanel
              settings={renderSettings}
              setSettings={setRenderSettings}
              onRender={handleRender}
              rendering={rendering}
              renderProgress={renderProgress}
              addedItems={addedItems}
              aiAnalysis={aiAnalysis}
            />
          )}
        </div>

        {/* Main Canvas — Three.js WebGL + 2D FloorPlan */}
        <MainCanvas
          step={step}
          mode={mode}
          setMode={setMode}
          activeTool={activeTool}
          uploadedPlan={uploadedPlan}
          aiAnalysis={aiAnalysis}
          addedItems={addedItems}
          appliedTemplate={appliedTemplate}
          activeView={activeView}
          activeMaterial={activeMaterial}
          onSelectFurniture={(item) => { setSelectedFurnitureItem(item || null) }}
          fileInputRef={fileInputRef}
          onUpload={handleUpload}
        />

        {/* Right Panel */}
        <RightPanel
          step={step}
          selectedRoom={selectedRoom}
          appliedTemplate={appliedTemplate}
          addedItems={addedItems}
          selectedFurnitureItem={selectedFurnitureItem}
          activeView={activeView}
          setActiveView={setActiveView}
          onUseMaterial={(m) => { setActiveMaterial(m); showToast(`${m.name} applied to room`) }}
        />
      </div>

      {/* Bottom Status Bar */}
      <div style={{ height:28, background:C.panel, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 16px', gap:16 }}>
        {[
          { label:'Walls', val:'8' },
          { label:'Rooms', val: aiAnalysis ? aiAnalysis.rooms?.length||4 : '4' },
          { label:'Area', val: aiAnalysis ? `${aiAnalysis.totalArea} ft²` : '560 ft²' },
          { label:'Furniture', val: addedItems.length },
        ].map(({ label, val }) => (
          <div key={label} style={{ display:'flex', gap:4 }}>
            <span style={{ color:C.muted, fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}:</span>
            <span style={{ color:C.text, fontSize:9, fontWeight:600 }}>{val}</span>
          </div>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', background:'rgba(0,0,0,0.3)', borderRadius:4, overflow:'hidden' }}>
          {[['2D','2d'],['3D','3d']].map(([label, val]) => (
            <button key={val} onClick={() => setMode(val)} style={{ padding:'2px 10px', background: mode===val ? C.gold : 'transparent', border:'none', color: mode===val ? '#000' : C.muted, fontSize:9, fontWeight:700, cursor:'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <span style={{ color:C.muted, fontSize:9, marginLeft:8 }}>Floor 1 of 1</span>
      </div>
    </div>
  )
}
