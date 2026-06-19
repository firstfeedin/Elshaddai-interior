/**
 * Furniture & Object Catalog — 120+ items
 * Each item: { id, name, sku, cat, subcat, price, color, dims:{w,h,d}, glb, img, tags, brand, material }
 * GLB sources: KhronosGroup/glTF-Sample-Assets (MIT)
 * Procedural fallback: glb:null → BoxGeometry with dims+color
 */

const GLB = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models'

export const CATEGORIES = [
  { id:'all',       label:'All Items',    icon:'◈' },
  { id:'seating',   label:'Seating',      icon:'🛋' },
  { id:'bedroom',   label:'Bedroom',      icon:'🛏' },
  { id:'dining',    label:'Dining',       icon:'🍽' },
  { id:'storage',   label:'Storage',      icon:'🗄' },
  { id:'lighting',  label:'Lighting',     icon:'💡' },
  { id:'decor',     label:'Decor',        icon:'🏺' },
  { id:'kitchen',   label:'Kitchen',      icon:'🍳' },
  { id:'office',    label:'Office',       icon:'💻' },
  { id:'outdoor',   label:'Outdoor',      icon:'🌿' },
  { id:'bathroom',  label:'Bathroom',     icon:'🚿' },
  { id:'kids',      label:'Kids',         icon:'🧸' },
]

export const MATERIALS = {
  walls: [
    { id:'white-paint',   label:'White Paint',     color:'#f5f0e8', texture:null },
    { id:'cream-paint',   label:'Cream Paint',     color:'#faf5e4', texture:null },
    { id:'grey-paint',    label:'Light Grey',      color:'#d4d0cb', texture:null },
    { id:'charcoal',      label:'Charcoal',        color:'#3a3a3a', texture:null },
    { id:'navy',          label:'Navy Blue',       color:'#1e2d4a', texture:null },
    { id:'sage',          label:'Sage Green',      color:'#87a17c', texture:null },
    { id:'terracotta',    label:'Terracotta',      color:'#c4714a', texture:null },
    { id:'blush',         label:'Blush Pink',      color:'#e8c4b8', texture:null },
    { id:'brick',         label:'Exposed Brick',   color:'#a0522d', texture:'brick' },
    { id:'concrete',      label:'Polished Concrete',color:'#9e9e9e', texture:'concrete' },
    { id:'wood-panel',    label:'Wood Panelling',  color:'#c19a6b', texture:'wood' },
    { id:'marble-wall',   label:'Marble Cladding', color:'#f0ece6', texture:'marble' },
  ],
  floors: [
    { id:'oak-floor',     label:'Oak Hardwood',    color:'#c8a96e', texture:'wood' },
    { id:'walnut-floor',  label:'Walnut Wood',     color:'#7d5a3c', texture:'wood' },
    { id:'white-marble',  label:'White Marble',    color:'#f5f2ee', texture:'marble' },
    { id:'black-marble',  label:'Black Marble',    color:'#2a2a2a', texture:'marble' },
    { id:'grey-tile',     label:'Grey Tile',       color:'#b0aaa0', texture:'tile' },
    { id:'beige-tile',    label:'Beige Tile',      color:'#d4c5a9', texture:'tile' },
    { id:'terracotta-floor',label:'Terracotta Tile',color:'#c4714a',texture:'tile' },
    { id:'cement-floor',  label:'Cement Screed',   color:'#a8a39c', texture:'concrete' },
    { id:'carpet-grey',   label:'Grey Carpet',     color:'#8e8e8e', texture:'carpet' },
    { id:'carpet-beige',  label:'Beige Carpet',    color:'#d4b896', texture:'carpet' },
    { id:'vinyl-light',   label:'Light Vinyl',     color:'#e8dcc8', texture:'wood' },
    { id:'parquet',       label:'Parquet',         color:'#b8904a', texture:'wood' },
  ],
  ceilings: [
    { id:'white-ceiling', label:'Plain White',     color:'#ffffff', texture:null },
    { id:'off-white',     label:'Off White',       color:'#f8f5f0', texture:null },
    { id:'grey-ceiling',  label:'Light Grey',      color:'#e0dbd4', texture:null },
    { id:'black-ceiling', label:'Matte Black',     color:'#1a1a1a', texture:null },
    { id:'wood-ceiling',  label:'Wood Beams',      color:'#c19a6b', texture:'wood' },
    { id:'coffer',        label:'Coffered White',  color:'#f5f5f5', texture:null },
  ],
}

export const ROOM_TEMPLATES = [
  { id:'living-modern',  label:'Modern Living',    style:'Modern',       icon:'🛋', color:'#3b82f6', area:'300–500 sq ft' },
  { id:'living-luxury',  label:'Luxury Lounge',    style:'Art Deco',     icon:'✨', color:'#c9a227', area:'400–600 sq ft' },
  { id:'bedroom-nordic', label:'Nordic Bedroom',   style:'Scandinavian', icon:'🛏', color:'#8b5cf6', area:'200–300 sq ft' },
  { id:'bedroom-japandi',label:'Japandi Sleep',    style:'Japandi',      icon:'☯', color:'#64748b', area:'150–250 sq ft' },
  { id:'kitchen-island', label:'Island Kitchen',   style:'Contemporary', icon:'🍳', color:'#f59e0b', area:'150–250 sq ft' },
  { id:'bath-spa',       label:'Spa Bathroom',     style:'Luxury',       icon:'🚿', color:'#06b6d4', area:'80–150 sq ft' },
  { id:'office-exec',    label:'Executive Office', style:'Modern',       icon:'💼', color:'#10b981', area:'150–250 sq ft' },
  { id:'dining-formal',  label:'Formal Dining',    style:'Traditional',  icon:'🍽', color:'#ef4444', area:'150–250 sq ft' },
  { id:'kids-fun',       label:'Kids Playroom',    style:'Colorful',     icon:'🧸', color:'#ec4899', area:'120–200 sq ft' },
  { id:'pooja-vastu',    label:'Pooja Room',       style:'Traditional',  icon:'🪔', color:'#f97316', area:'40–80 sq ft' },
  { id:'studio-apt',     label:'Studio Apartment', style:'Minimalist',   icon:'🏠', color:'#6366f1', area:'300–500 sq ft' },
  { id:'balcony-garden', label:'Balcony Garden',   style:'Botanical',    icon:'🌿', color:'#22c55e', area:'50–120 sq ft' },
]

export const CATALOG = [
  /* ─── SEATING ─────────────────────────────────────────────────────────── */
  { id:1,   name:'Glam Velvet Sofa',      sku:'SOF-001', cat:'seating', subcat:'sofas',   price:45000,  brand:'Zuari',      material:'Velvet', color:'#7c6fa0', dims:{w:2.2,h:0.8,d:0.9}, glb:`${GLB}/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb`,   img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['living','luxury','purple'] },
  { id:2,   name:'Sheen Accent Chair',    sku:'SOF-002', cat:'seating', subcat:'chairs',  price:12000,  brand:'Godrej',     material:'Fabric', color:'#a0855a', dims:{w:0.8,h:0.9,d:0.8}, glb:`${GLB}/SheenChair/glTF-Binary/SheenChair.glb`,           img:'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300&q=70', tags:['accent','living','beige'] },
  { id:3,   name:'3-Seat Linen Sofa',     sku:'SOF-003', cat:'seating', subcat:'sofas',   price:38000,  brand:'Urban Ladder',material:'Linen',  color:'#c5b99a', dims:{w:2.0,h:0.75,d:0.85},glb:null, img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=300&q=70', tags:['living','neutral','linen'] },
  { id:4,   name:'L-Shape Corner Sofa',   sku:'SOF-004', cat:'seating', subcat:'sofas',   price:68000,  brand:'Wooden Street',material:'Fabric', color:'#8b7f6a', dims:{w:2.8,h:0.78,d:1.8},glb:null, img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300&q=70', tags:['living','corner','sectional'] },
  { id:5,   name:'Recliner Chair',        sku:'SOF-005', cat:'seating', subcat:'chairs',  price:22000,  brand:'Durian',     material:'Leather',color:'#3d2b1f',  dims:{w:0.85,h:1.05,d:0.95},glb:null, img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=70', tags:['relax','leather','living'] },
  { id:6,   name:'Dining Chair Set (4)',  sku:'SOF-006', cat:'seating', subcat:'chairs',  price:18000,  brand:'Pepperfry',  material:'Wood',   color:'#8b6914',  dims:{w:0.45,h:0.9,d:0.45},glb:null, img:'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&q=70', tags:['dining','wood','set'] },
  { id:7,   name:'Bar Stool',             sku:'SOF-007', cat:'seating', subcat:'stools',  price:6500,   brand:'IKEA',       material:'Metal',  color:'#1c1c1c',  dims:{w:0.4,h:0.75,d:0.4}, glb:null, img:'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300&q=70', tags:['kitchen','bar','black'] },
  { id:8,   name:'Pouf Ottoman',          sku:'SOF-008', cat:'seating', subcat:'ottomans',price:4500,   brand:'Chumbak',    material:'Jute',   color:'#c4a35a',  dims:{w:0.6,h:0.4,d:0.6},  glb:null, img:'https://images.unsplash.com/photo-1616627052149-5a7e2aee9350?w=300&q=70', tags:['living','accent','jute'] },
  { id:9,   name:'Wingback Chair',        sku:'SOF-009', cat:'seating', subcat:'chairs',  price:16000,  brand:'Fenesta',    material:'Velvet', color:'#1e3a5f',  dims:{w:0.78,h:1.1,d:0.82}, glb:null, img:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&q=70', tags:['classic','reading','blue'] },
  { id:10,  name:'Swing Chair (Indoor)',  sku:'SOF-010', cat:'seating', subcat:'chairs',  price:12000,  brand:'Urban Ladder',material:'Rattan', color:'#c8a878',  dims:{w:0.8,h:1.4,d:0.8},  glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['boho','hanging','rattan'] },

  /* ─── BEDROOM ─────────────────────────────────────────────────────────── */
  { id:11,  name:'King Bed Frame',        sku:'BED-001', cat:'bedroom', subcat:'beds',    price:55000,  brand:'Sleepwell',  material:'Teak',   color:'#8b7355',  dims:{w:2.0,h:0.6,d:2.2},  glb:null, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&q=70', tags:['master','teak','king'] },
  { id:12,  name:'Platform Bed Queen',    sku:'BED-002', cat:'bedroom', subcat:'beds',    price:38000,  brand:'Wooden Street',material:'Walnut',color:'#5c3d2e',  dims:{w:1.6,h:0.45,d:2.0}, glb:null, img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=300&q=70', tags:['modern','walnut','queen'] },
  { id:13,  name:'Upholstered Bed',       sku:'BED-003', cat:'bedroom', subcat:'beds',    price:42000,  brand:'Durian',     material:'Velvet', color:'#2d3561',  dims:{w:1.8,h:1.2,d:2.1},  glb:null, img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=300&q=70', tags:['luxury','headboard','navy'] },
  { id:14,  name:'Bedside Table (Pair)',  sku:'BED-004', cat:'bedroom', subcat:'tables',  price:8500,   brand:'IKEA',       material:'Oak',    color:'#c8a464',  dims:{w:0.5,h:0.55,d:0.4},  glb:null, img:'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=300&q=70', tags:['bedside','nightstand','oak'] },
  { id:15,  name:'Chest of Drawers',      sku:'BED-005', cat:'bedroom', subcat:'dressers',price:18000,  brand:'Godrej',     material:'MDF',    color:'#e8e0d4',  dims:{w:0.9,h:0.85,d:0.45}, glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['storage','dresser','white'] },
  { id:16,  name:'Dressing Table',        sku:'BED-006', cat:'bedroom', subcat:'dressers',price:14000,  brand:'Zuari',      material:'MDF',    color:'#f5f0e8',  dims:{w:1.2,h:1.4,d:0.45}, glb:null, img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=70', tags:['vanity','mirror','dressing'] },

  /* ─── DINING ──────────────────────────────────────────────────────────── */
  { id:17,  name:'6-Seater Dining Set',   sku:'DIN-001', cat:'dining',  subcat:'sets',    price:85000,  brand:'Wooden Street',material:'Teak',  color:'#6b4c2a',  dims:{w:1.8,h:0.76,d:0.9}, glb:null, img:'https://images.unsplash.com/photo-1549497538-303791108f95?w=300&q=70', tags:['family','teak','6-seater'] },
  { id:18,  name:'Round Dining Table',    sku:'DIN-002', cat:'dining',  subcat:'tables',  price:28000,  brand:'Pepperfry',  material:'Marble', color:'#f0ece6',  dims:{w:1.2,h:0.76,d:1.2},  glb:null, img:'https://images.unsplash.com/photo-1495433324511-bf8e92934d90?w=300&q=70', tags:['marble','round','modern'] },
  { id:19,  name:'Extendable Table',      sku:'DIN-003', cat:'dining',  subcat:'tables',  price:35000,  brand:'IKEA',       material:'Oak',    color:'#c8a464',  dims:{w:1.6,h:0.75,d:0.9},  glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['extendable','oak','flexible'] },
  { id:20,  name:'Bar Cart',              sku:'DIN-004', cat:'dining',  subcat:'accessories',price:8500, brand:'Chumbak',   material:'Metal',  color:'#c9a227',  dims:{w:0.7,h:0.9,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=300&q=70', tags:['gold','bar','cart'] },
  { id:21,  name:'China Cabinet',         sku:'DIN-005', cat:'dining',  subcat:'storage', price:32000,  brand:'Godrej',     material:'Wood',   color:'#4a3728',  dims:{w:1.2,h:1.9,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300&q=70', tags:['display','glass','wood'] },

  /* ─── STORAGE ─────────────────────────────────────────────────────────── */
  { id:22,  name:'4-Door Wardrobe',       sku:'STR-001', cat:'storage', subcat:'wardrobes',price:75000, brand:'Godrej Interio',material:'Engineered Wood',color:'#e8e0d4', dims:{w:2.4,h:2.2,d:0.6}, glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['bedroom','white','large'] },
  { id:23,  name:'Sliding Door Wardrobe', sku:'STR-002', cat:'storage', subcat:'wardrobes',price:95000, brand:'Hettich',    material:'Lacquered MDF',color:'#2a2a2a', dims:{w:3.0,h:2.4,d:0.65}, glb:null, img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=300&q=70', tags:['modern','dark','sliding'] },
  { id:24,  name:'Open Bookshelf',        sku:'STR-003', cat:'storage', subcat:'shelving', price:12000, brand:'Pepperfry',  material:'Oak',    color:'#c8a878',  dims:{w:0.9,h:1.8,d:0.3},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['books','study','display'] },
  { id:25,  name:'TV Unit (Modern)',       sku:'STR-004', cat:'storage', subcat:'tv-units', price:22000, brand:'Urban Ladder',material:'MDF',   color:'#1c1c1c',  dims:{w:1.8,h:0.45,d:0.45}, glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['tv','dark','living'] },
  { id:26,  name:'Floating Shelves (Set)',sku:'STR-005', cat:'storage', subcat:'shelving', price:4500,  brand:'IKEA',       material:'MDF',    color:'#f0ece6',  dims:{w:1.2,h:0.2,d:0.25},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['wall','display','minimal'] },
  { id:27,  name:'Sideboard',             sku:'STR-006', cat:'storage', subcat:'cabinets', price:28000, brand:'Wooden Street',material:'Teak', color:'#7b5e3a',  dims:{w:1.6,h:0.8,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300&q=70', tags:['dining','wood','classic'] },
  { id:28,  name:'Shoe Rack',             sku:'STR-007', cat:'storage', subcat:'racks',    price:6500,  brand:'Godrej',     material:'MDF',    color:'#e8e0d4',  dims:{w:0.9,h:0.9,d:0.3},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['entryway','white','shoes'] },

  /* ─── LIGHTING ─────────────────────────────────────────────────────────── */
  { id:29,  name:'Lantern Floor Lamp',    sku:'LIT-001', cat:'lighting',subcat:'floor',   price:8500,   brand:'Philips',    material:'Metal',  color:'#c9a227',  dims:{w:0.3,h:1.6,d:0.3},  glb:`${GLB}/Lantern/glTF-Binary/Lantern.glb`, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['gold','ambient','floor'] },
  { id:30,  name:'Pendant Cluster Light', sku:'LIT-002', cat:'lighting',subcat:'pendant', price:12000,  brand:'Flos',       material:'Glass',  color:'#f5f0e8',  dims:{w:0.6,h:0.8,d:0.6},  glb:null, img:'https://images.unsplash.com/photo-1513506003901-1e6a35ebe4be?w=300&q=70', tags:['dining','cluster','statement'] },
  { id:31,  name:'Arc Floor Lamp',        sku:'LIT-003', cat:'lighting',subcat:'floor',   price:9500,   brand:'Artemide',   material:'Metal',  color:'#e8e0d4',  dims:{w:0.4,h:1.8,d:0.8},  glb:null, img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&q=70', tags:['arc','reading','modern'] },
  { id:32,  name:'Table Lamp Ceramic',    sku:'LIT-004', cat:'lighting',subcat:'table',   price:3500,   brand:'Chumbak',    material:'Ceramic',color:'#4a7c59',  dims:{w:0.25,h:0.55,d:0.25},glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['ceramic','accent','green'] },
  { id:33,  name:'LED Strip Cove',        sku:'LIT-005', cat:'lighting',subcat:'cove',    price:2500,   brand:'Havells',    material:'LED',    color:'#fff5d6',  dims:{w:1.0,h:0.05,d:0.02}, glb:null, img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&q=70', tags:['cove','ambient','modern'] },
  { id:34,  name:'Chandelier Crystal',    sku:'LIT-006', cat:'lighting',subcat:'ceiling', price:35000,  brand:'Fendi Casa', material:'Crystal',color:'#ffd700',  dims:{w:0.8,h:0.9,d:0.8},  glb:null, img:'https://images.unsplash.com/photo-1513506003901-1e6a35ebe4be?w=300&q=70', tags:['luxury','crystal','dining'] },
  { id:35,  name:'Bedside Wall Sconce',   sku:'LIT-007', cat:'lighting',subcat:'wall',    price:4500,   brand:'Philips',    material:'Metal',  color:'#c9a227',  dims:{w:0.15,h:0.3,d:0.2},  glb:null, img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&q=70', tags:['bedroom','gold','wall'] },

  /* ─── DECOR ────────────────────────────────────────────────────────────── */
  { id:36,  name:'Antique Camera Display',sku:'DEC-001', cat:'decor',   subcat:'display', price:8000,   brand:'Curio',      material:'Brass',  color:'#8b6a4a',  dims:{w:0.2,h:0.2,d:0.15},  glb:`${GLB}/AntiqueCamera/glTF-Binary/AntiqueCamera.glb`, img:'https://images.unsplash.com/photo-1585399000684-d2f72d70d9a3?w=300&q=70', tags:['vintage','brass','shelf'] },
  { id:37,  name:'Corset Art Sculpture',  sku:'DEC-002', cat:'decor',   subcat:'art',     price:12000,  brand:'Studio Art', material:'Resin',  color:'#c9a227',  dims:{w:0.4,h:0.8,d:0.05},  glb:`${GLB}/Corset/glTF-Binary/Corset.glb`, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['art','gold','wall'] },
  { id:38,  name:'Water Bottle Display',  sku:'DEC-003', cat:'decor',   subcat:'display', price:2500,   brand:'Borosil',    material:'Glass',  color:'#a8d5e2',  dims:{w:0.1,h:0.3,d:0.1},   glb:`${GLB}/WaterBottle/glTF-Binary/WaterBottle.glb`, img:'https://images.unsplash.com/photo-1585399000684-d2f72d70d9a3?w=300&q=70', tags:['glass','kitchen','display'] },
  { id:39,  name:'Large Wall Mirror',     sku:'DEC-004', cat:'decor',   subcat:'mirrors', price:15000,  brand:'Pepperfry',  material:'Glass/MDF',color:'#1c1c1c',dims:{w:1.0,h:1.8,d:0.05},  glb:null, img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=70', tags:['mirror','large','bedroom'] },
  { id:40,  name:'Indoor Plant (Fiddle)', sku:'DEC-005', cat:'decor',   subcat:'plants',  price:2800,   brand:'Ugaoo',      material:'Natural',color:'#4a7c59',  dims:{w:0.5,h:1.4,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=300&q=70', tags:['plant','green','living'] },
  { id:41,  name:'Decorative Vase Set',   sku:'DEC-006', cat:'decor',   subcat:'vases',   price:3500,   brand:'Chumbak',    material:'Ceramic',color:'#4a6fa5',  dims:{w:0.2,h:0.4,d:0.2},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['blue','ceramic','living'] },
  { id:42,  name:'Abstract Canvas Art',   sku:'DEC-007', cat:'decor',   subcat:'art',     price:9500,   brand:'Artsy',      material:'Canvas', color:'#c8a464',  dims:{w:1.2,h:0.9,d:0.05},  glb:null, img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&q=70', tags:['art','wall','abstract'] },
  { id:43,  name:'Coffee Table Books Set',sku:'DEC-008', cat:'decor',   subcat:'display', price:1500,   brand:'Taschen',    material:'Paper',  color:'#e8dcc8',  dims:{w:0.3,h:0.15,d:0.25}, glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['books','coffee','display'] },
  { id:44,  name:'Throw Cushions (Set 4)',sku:'DEC-009', cat:'decor',   subcat:'textiles',price:3200,   brand:'Bombay Dyeing',material:'Velvet',color:'#8b5cf6', dims:{w:0.5,h:0.2,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=300&q=70', tags:['cushion','purple','sofa'] },
  { id:45,  name:'Area Rug (3×2m)',       sku:'DEC-010', cat:'decor',   subcat:'rugs',    price:12000,  brand:'Fabindia',   material:'Wool',   color:'#c4a882',  dims:{w:3.0,h:0.02,d:2.0},  glb:null, img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=70', tags:['rug','wool','living'] },

  /* ─── KITCHEN ─────────────────────────────────────────────────────────── */
  { id:46,  name:'Kitchen Island',        sku:'KIT-001', cat:'kitchen', subcat:'islands',  price:85000, brand:'Sleek',      material:'Quartz', color:'#f0ece6',  dims:{w:1.5,h:0.9,d:0.8},  glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['island','white','modern'] },
  { id:47,  name:'L-Shape Kitchen Unit',  sku:'KIT-002', cat:'kitchen', subcat:'units',    price:150000,brand:'Godrej',     material:'Laminates',color:'#2a2a2a',dims:{w:3.6,h:0.86,d:0.6},  glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['dark','modular','L-shape'] },
  { id:48,  name:'Open Kitchen Shelves',  sku:'KIT-003', cat:'kitchen', subcat:'shelving', price:8500,  brand:'IKEA',       material:'MDF',    color:'#e8e0d4',  dims:{w:1.2,h:0.5,d:0.3},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['open','white','display'] },
  { id:49,  name:'Kitchen Trolley',       sku:'KIT-004', cat:'kitchen', subcat:'accessories',price:6500,brand:'Prestige',   material:'Stainless Steel',color:'#c0c0c0',dims:{w:0.6,h:0.8,d:0.4},glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['steel','mobile','storage'] },

  /* ─── OFFICE ──────────────────────────────────────────────────────────── */
  { id:50,  name:'Executive Desk',        sku:'OFF-001', cat:'office',  subcat:'desks',    price:35000, brand:'Featherlite', material:'Teak', color:'#5c3d2e',  dims:{w:1.6,h:0.76,d:0.8},  glb:null, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=70', tags:['work','dark','executive'] },
  { id:51,  name:'Standing Desk',         sku:'OFF-002', cat:'office',  subcat:'desks',    price:28000, brand:'Ikea',        material:'Oak',  color:'#c8a878',  dims:{w:1.4,h:0.9,d:0.7},   glb:null, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=70', tags:['standup','ergonomic','modern'] },
  { id:52,  name:'Ergonomic Chair',       sku:'OFF-003', cat:'office',  subcat:'chairs',   price:22000, brand:'Herman Miller',material:'Mesh',color:'#1c1c1c',  dims:{w:0.67,h:1.1,d:0.7},  glb:null, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=70', tags:['mesh','ergonomic','black'] },
  { id:53,  name:'File Cabinet (3 Draw)', sku:'OFF-004', cat:'office',  subcat:'storage',  price:12000, brand:'Godrej',      material:'Steel',color:'#808080',  dims:{w:0.45,h:0.98,d:0.6},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['files','steel','grey'] },
  { id:54,  name:'Bookcase Floor-to-Ceil',sku:'OFF-005', cat:'office',  subcat:'shelving', price:18000, brand:'Wooden Street',material:'Walnut',color:'#5c3d2e',dims:{w:0.9,h:2.4,d:0.3},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['books','walnut','tall'] },
  { id:55,  name:'Conference Table',      sku:'OFF-006', cat:'office',  subcat:'tables',   price:65000, brand:'Featherlite', material:'Glass',color:'#1a2a3a',  dims:{w:2.4,h:0.75,d:1.2},  glb:null, img:'https://images.unsplash.com/photo-1549497538-303791108f95?w=300&q=70', tags:['meeting','glass','corporate'] },

  /* ─── OUTDOOR ─────────────────────────────────────────────────────────── */
  { id:56,  name:'Outdoor Sofa Set',      sku:'OUT-001', cat:'outdoor', subcat:'seating',  price:45000, brand:'Nilkamal',  material:'HDPE Rattan',color:'#8b7355',dims:{w:2.0,h:0.8,d:0.85}, glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['garden','rattan','beige'] },
  { id:57,  name:'Sun Lounger',           sku:'OUT-002', cat:'outdoor', subcat:'loungers', price:18000, brand:'Cane-line', material:'Teak',   color:'#c8a878',  dims:{w:0.7,h:0.38,d:2.0},  glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['pool','teak','lounger'] },
  { id:58,  name:'Garden Planter Box',    sku:'OUT-003', cat:'outdoor', subcat:'planters', price:4500,  brand:'Ugaoo',     material:'Wood',   color:'#4a3728',  dims:{w:0.6,h:0.5,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=300&q=70', tags:['garden','wood','plants'] },
  { id:59,  name:'Pergola (Small)',        sku:'OUT-004', cat:'outdoor', subcat:'structures',price:85000,brand:'Fenesta',   material:'Aluminium',color:'#c0c0c0',dims:{w:3.0,h:2.4,d:3.0},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['pergola','outdoor','shade'] },

  /* ─── BATHROOM ─────────────────────────────────────────────────────────── */
  { id:60,  name:'Freestanding Bathtub',  sku:'BAT-001', cat:'bathroom',subcat:'bathtubs', price:85000, brand:'Jaquar',    material:'Acrylic', color:'#f8f6f2', dims:{w:1.7,h:0.6,d:0.8},   glb:null, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70', tags:['spa','white','luxury'] },
  { id:61,  name:'Vanity with Basin',     sku:'BAT-002', cat:'bathroom',subcat:'vanity',   price:32000, brand:'Hindware',  material:'MDF',     color:'#e8e0d4', dims:{w:1.2,h:0.85,d:0.45},  glb:null, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70', tags:['vanity','basin','modern'] },
  { id:62,  name:'Towel Ladder Rack',     sku:'BAT-003', cat:'bathroom',subcat:'accessories',price:3500,brand:'Dorma',     material:'Brass',   color:'#c9a227', dims:{w:0.5,h:1.2,d:0.2},    glb:null, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70', tags:['towel','gold','bath'] },
  { id:63,  name:'Rainfall Shower',       sku:'BAT-004', cat:'bathroom',subcat:'shower',   price:25000, brand:'Jaquar',    material:'SS',      color:'#c0c0c0', dims:{w:0.3,h:2.2,d:0.3},    glb:null, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70', tags:['shower','steel','spa'] },

  /* ─── KIDS ────────────────────────────────────────────────────────────── */
  { id:64,  name:'Bunk Bed',              sku:'KID-001', cat:'kids',    subcat:'beds',     price:28000, brand:'Alex Daisy',material:'MDF',    color:'#4a90d9',  dims:{w:1.0,h:1.8,d:2.0},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['bunk','blue','kids'] },
  { id:65,  name:'Study Table Kids',      sku:'KID-002', cat:'kids',    subcat:'tables',   price:8500,  brand:'Alex Daisy',material:'MDF',    color:'#f9ca24',  dims:{w:1.0,h:0.65,d:0.5},  glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['study','yellow','kids'] },
  { id:66,  name:'Toy Storage Unit',      sku:'KID-003', cat:'kids',    subcat:'storage',  price:6500,  brand:'Nilkamal',  material:'Plastic',color:'#e84393',  dims:{w:1.2,h:0.9,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['toys','pink','storage'] },
  { id:67,  name:'Play Tent',             sku:'KID-004', cat:'kids',    subcat:'play',     price:4500,  brand:'R for Rabbit',material:'Fabric',color:'#ff7675', dims:{w:1.2,h:1.3,d:1.2},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['play','tent','colorful'] },

  /* ─── LIVING ROOM TABLES ──────────────────────────────────────────────── */
  { id:68,  name:'Marble Coffee Table',   sku:'TAB-001', cat:'seating', subcat:'tables',   price:32000, brand:'Wooden Street',material:'Marble',color:'#f0ece6',dims:{w:1.2,h:0.45,d:0.6},  glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['marble','white','living'] },
  { id:69,  name:'Nesting Tables (Set 3)',sku:'TAB-002', cat:'seating', subcat:'tables',   price:12000, brand:'Pepperfry',  material:'Oak',    color:'#c8a464',  dims:{w:0.5,h:0.5,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['nesting','oak','set'] },
  { id:70,  name:'Console Entry Table',   sku:'TAB-003', cat:'seating', subcat:'tables',   price:14000, brand:'Urban Ladder',material:'Iron',  color:'#1c1c1c',  dims:{w:1.2,h:0.85,d:0.35},  glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['entryway','black','narrow'] },

  /* ─── MORE DECOR ──────────────────────────────────────────────────────── */
  { id:71,  name:'Floor Vase (Tall)',      sku:'DEC-011', cat:'decor',   subcat:'vases',   price:5500,  brand:'Chumbak',   material:'Ceramic',color:'#2d3561',  dims:{w:0.3,h:1.0,d:0.3},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['tall','blue','living'] },
  { id:72,  name:'Macramé Wall Art',       sku:'DEC-012', cat:'decor',   subcat:'art',     price:3500,  brand:'Craft Corner',material:'Cotton',color:'#d4b896', dims:{w:0.8,h:1.2,d:0.05},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['boho','wall','cotton'] },
  { id:73,  name:'Himalayan Salt Lamp',    sku:'DEC-013', cat:'decor',   subcat:'lighting',price:1800,  brand:'Salt World', material:'Salt',  color:'#ff6b35',  dims:{w:0.2,h:0.35,d:0.2},  glb:null, img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&q=70', tags:['salt','orange','bedroom'] },
  { id:74,  name:'Photo Frame Gallery',   sku:'DEC-014', cat:'decor',   subcat:'frames',  price:2800,  brand:'IKEA',       material:'MDF',   color:'#1c1c1c',  dims:{w:1.2,h:0.9,d:0.05},   glb:null, img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&q=70', tags:['frames','black','wall'] },
  { id:75,  name:'Grandfather Clock',     sku:'DEC-015', cat:'decor',   subcat:'clocks',  price:28000, brand:'Ajanta',     material:'Teak',  color:'#5c3d2e',  dims:{w:0.55,h:1.9,d:0.3},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['clock','vintage','teak'] },

  /* ─── SEATING EXPANSION ──────────────────────────────────────────────── */
  { id:76,  name:'Chaise Longue',          sku:'SOF-011', cat:'seating', subcat:'sofas',   price:28000, brand:'Durian',     material:'Velvet', color:'#4a5568', dims:{w:1.6,h:0.8,d:0.7},   glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['lounge','grey','velvet'] },
  { id:77,  name:'Loveseat 2-Seater',      sku:'SOF-012', cat:'seating', subcat:'sofas',   price:22000, brand:'Wooden Street',material:'Linen', color:'#e8dcc8', dims:{w:1.4,h:0.75,d:0.8},  glb:null, img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=300&q=70', tags:['small','linen','beige'] },
  { id:78,  name:'Egg Chair',              sku:'SOF-013', cat:'seating', subcat:'chairs',  price:18000, brand:'Pepperfry',  material:'Fabric', color:'#f97316', dims:{w:0.9,h:1.2,d:0.9},   glb:null, img:'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300&q=70', tags:['retro','orange','statement'] },
  { id:79,  name:'Floor Cushion Set',      sku:'SOF-014', cat:'seating', subcat:'cushions',price:3500,  brand:'Fabindia',   material:'Cotton', color:'#c4a882', dims:{w:0.6,h:0.2,d:0.6},   glb:null, img:'https://images.unsplash.com/photo-1616627052149-5a7e2aee9350?w=300&q=70', tags:['boho','floor','meditation'] },
  { id:80,  name:'Bench with Storage',     sku:'SOF-015', cat:'seating', subcat:'benches', price:9500,  brand:'Godrej',     material:'MDF',    color:'#e8e0d4', dims:{w:1.2,h:0.5,d:0.45},  glb:null, img:'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300&q=70', tags:['entryway','storage','white'] },
  { id:81,  name:'Rattan Peacock Chair',   sku:'SOF-016', cat:'seating', subcat:'chairs',  price:14500, brand:'Urban Ladder',material:'Rattan',color:'#c8a878', dims:{w:1.1,h:1.5,d:1.0},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['bohemian','rattan','statement'] },
  { id:82,  name:'Futon Sofa Bed',         sku:'SOF-017', cat:'seating', subcat:'sofas',   price:16000, brand:'Nilkamal',   material:'Fabric', color:'#6b7280', dims:{w:1.9,h:0.7,d:0.85},  glb:null, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=70', tags:['sofa-bed','grey','guest'] },
  { id:83,  name:'Ergonomic Gaming Chair', sku:'SOF-018', cat:'seating', subcat:'chairs',  price:24000, brand:'Green Soul',  material:'Leather',color:'#1c1c1c', dims:{w:0.72,h:1.3,d:0.74}, glb:null, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=70', tags:['gaming','black','ergonomic'] },

  /* ─── BEDROOM EXPANSION ──────────────────────────────────────────────── */
  { id:84,  name:'4-Poster Canopy Bed',    sku:'BED-007', cat:'bedroom', subcat:'beds',    price:82000, brand:'Wooden Street',material:'Teak', color:'#5c3d2e', dims:{w:1.8,h:2.1,d:2.1},   glb:null, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&q=70', tags:['canopy','luxury','teak'] },
  { id:85,  name:'Murphy Wall Bed (Queen)',sku:'BED-008', cat:'bedroom', subcat:'beds',    price:65000, brand:'Spacewood',  material:'MDF',    color:'#e8e0d4', dims:{w:1.6,h:2.2,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&q=70', tags:['wall-bed','foldaway','space-saving'] },
  { id:86,  name:'Storage Bed with Boxes', sku:'BED-009', cat:'bedroom', subcat:'beds',    price:48000, brand:'Durian',     material:'Engineered Wood',color:'#8b7355',dims:{w:1.8,h:0.5,d:2.0},glb:null,img:'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=300&q=70',tags:['storage','hydraulic','king'] },
  { id:87,  name:'Bedside Lamp Pair',      sku:'BED-010', cat:'bedroom', subcat:'lighting',price:4500,  brand:'Philips',    material:'Metal',  color:'#c9a227', dims:{w:0.2,h:0.45,d:0.2},  glb:null, img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&q=70', tags:['lamp','gold','pair'] },
  { id:88,  name:'Under-Bed Storage Box',  sku:'BED-011', cat:'bedroom', subcat:'storage', price:2500,  brand:'IKEA',       material:'Plastic',color:'#e8e0d4', dims:{w:0.8,h:0.2,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['storage','white','hidden'] },
  { id:89,  name:'Bedroom Carpet (2×3m)',  sku:'BED-012', cat:'bedroom', subcat:'rugs',    price:8500,  brand:'Fabindia',   material:'Wool',   color:'#c4a882', dims:{w:3.0,h:0.02,d:2.0},  glb:null, img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=70', tags:['rug','wool','bedroom'] },

  /* ─── DINING EXPANSION ────────────────────────────────────────────────── */
  { id:90,  name:'Breakfast Bar Table',    sku:'DIN-006', cat:'dining',  subcat:'tables',  price:18000, brand:'Urban Ladder',material:'Oak',   color:'#c8a464', dims:{w:1.2,h:0.9,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1549497538-303791108f95?w=300&q=70', tags:['bar','breakfast','narrow'] },
  { id:91,  name:'Folding Dining Table',   sku:'DIN-007', cat:'dining',  subcat:'tables',  price:9500,  brand:'IKEA',       material:'MDF',    color:'#e8e0d4', dims:{w:1.0,h:0.75,d:0.6},  glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['folding','white','compact'] },
  { id:92,  name:'Padded Dining Chair',    sku:'DIN-008', cat:'dining',  subcat:'chairs',  price:5500,  brand:'Pepperfry',  material:'Leatherette',color:'#1c1c1c',dims:{w:0.48,h:0.92,d:0.5},glb:null,img:'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&q=70',tags:['dining','black','padded'] },
  { id:93,  name:'Buffet Sideboard',       sku:'DIN-009', cat:'dining',  subcat:'storage', price:35000, brand:'Wooden Street',material:'Sheesham',color:'#7b5e3a',dims:{w:1.8,h:0.85,d:0.45},glb:null,img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300&q=70',tags:['buffet','wood','storage'] },
  { id:94,  name:'Wine Rack (12-bottle)',  sku:'DIN-010', cat:'dining',  subcat:'accessories',price:6500,brand:'@Home',     material:'Iron',   color:'#1c1c1c', dims:{w:0.5,h:0.8,d:0.25},  glb:null, img:'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=300&q=70', tags:['wine','black','metal'] },

  /* ─── STORAGE EXPANSION ──────────────────────────────────────────────── */
  { id:95,  name:'Corner Wardrobe',        sku:'STR-008', cat:'storage', subcat:'wardrobes',price:55000,brand:'Godrej',    material:'MDF',    color:'#2a2a2a', dims:{w:1.2,h:2.2,d:1.2},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['corner','dark','space-saving'] },
  { id:96,  name:'Modular Kitchen Cabinet',sku:'STR-009', cat:'storage', subcat:'cabinets', price:12000, brand:'Sleek',     material:'MDF',    color:'#e8e0d4', dims:{w:0.6,h:0.72,d:0.55},  glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['kitchen','white','modular'] },
  { id:97,  name:'Ladder Bookshelf',       sku:'STR-010', cat:'storage', subcat:'shelving', price:8500,  brand:'Urban Ladder',material:'Iron+MDF',color:'#1c1c1c',dims:{w:0.6,h:1.8,d:0.3},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['ladder','black','industrial'] },
  { id:98,  name:'Cube Storage Organiser', sku:'STR-011', cat:'storage', subcat:'shelving', price:6500,  brand:'IKEA',       material:'MDF',    color:'#e8e0d4', dims:{w:1.5,h:1.5,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['cube','white','modular'] },
  { id:99,  name:'Trunk Storage Box',      sku:'STR-012', cat:'storage', subcat:'boxes',    price:7500,  brand:'Chumbak',    material:'Wood',   color:'#8b6914', dims:{w:1.0,h:0.5,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['trunk','vintage','wooden'] },
  { id:100, name:'Pegboard Wall Organiser',sku:'STR-013', cat:'storage', subcat:'wall',     price:3500,  brand:'IKEA',       material:'Metal',  color:'#c0c0c0', dims:{w:0.9,h:0.6,d:0.05},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['wall','metal','organiser'] },

  /* ─── LIGHTING EXPANSION ─────────────────────────────────────────────── */
  { id:101, name:'LED Panel Light',        sku:'LIT-008', cat:'lighting',subcat:'ceiling', price:3500,  brand:'Havells',    material:'Aluminium',color:'#f5f5f5',dims:{w:0.6,h:0.06,d:0.6},  glb:null, img:'https://images.unsplash.com/photo-1513506003901-1e6a35ebe4be?w=300&q=70', tags:['led','ceiling','modern'] },
  { id:102, name:'Neon Sign (Custom)',      sku:'LIT-009', cat:'lighting',subcat:'wall',    price:5500,  brand:'NeonArt',    material:'LED Neon',color:'#ff6b9d', dims:{w:0.6,h:0.3,d:0.05},  glb:null, img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&q=70', tags:['neon','pink','decorative'] },
  { id:103, name:'Track Lighting (3-Spot)',sku:'LIT-010', cat:'lighting',subcat:'ceiling', price:7500,  brand:'Philips',    material:'Metal',  color:'#1c1c1c', dims:{w:0.9,h:0.12,d:0.1},   glb:null, img:'https://images.unsplash.com/photo-1513506003901-1e6a35ebe4be?w=300&q=70', tags:['track','black','accent'] },
  { id:104, name:'Moroccan Pendant',        sku:'LIT-011', cat:'lighting',subcat:'pendant', price:8500,  brand:'Craftter',   material:'Brass',  color:'#c9a227', dims:{w:0.4,h:0.5,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1513506003901-1e6a35ebe4be?w=300&q=70', tags:['moroccan','gold','boho'] },
  { id:105, name:'Outdoor Wall Sconce',     sku:'LIT-012', cat:'lighting',subcat:'outdoor', price:4500,  brand:'Havells',    material:'IP44 Metal',color:'#1c1c1c',dims:{w:0.15,h:0.25,d:0.15},glb:null,img:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&q=70',tags:['outdoor','black','waterproof'] },

  /* ─── OFFICE EXPANSION ───────────────────────────────────────────────── */
  { id:106, name:'Drafting Table',          sku:'OFF-007', cat:'office',  subcat:'desks',    price:22000, brand:'Featherlite', material:'Steel+MDF',color:'#1c1c1c',dims:{w:1.2,h:0.9,d:0.7},  glb:null, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=70', tags:['drafting','architect','adjustable'] },
  { id:107, name:'L-Shape Office Desk',     sku:'OFF-008', cat:'office',  subcat:'desks',    price:45000, brand:'Godrej',      material:'Laminate',color:'#e8e0d4',dims:{w:2.4,h:0.76,d:1.4},  glb:null, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=70', tags:['L-shape','white','corner'] },
  { id:108, name:'Monitor Arm Stand',       sku:'OFF-009', cat:'office',  subcat:'accessories',price:4500,brand:'Ergotron',   material:'Aluminium',color:'#808080',dims:{w:0.1,h:0.5,d:0.3},   glb:null, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=70', tags:['monitor','ergonomic','stand'] },
  { id:109, name:'Office Storage Credenza', sku:'OFF-010', cat:'office',  subcat:'storage',  price:28000, brand:'Featherlite', material:'Laminate',color:'#2a2a2a',dims:{w:1.6,h:0.75,d:0.45}, glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['credenza','dark','storage'] },
  { id:110, name:'Acoustic Panel (Set 6)',  sku:'OFF-011', cat:'office',  subcat:'acoustic', price:8500,  brand:'SoundPro',    material:'Foam',   color:'#c4a882', dims:{w:0.6,h:0.9,d:0.05},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['acoustic','foam','office'] },

  /* ─── BATHROOM EXPANSION ─────────────────────────────────────────────── */
  { id:111, name:'Bathroom Mirror Cabinet', sku:'BAT-005', cat:'bathroom',subcat:'vanity',   price:14000, brand:'Jaquar',    material:'MDF+Mirror',color:'#e8e0d4',dims:{w:0.8,h:0.9,d:0.15},  glb:null, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70', tags:['mirror','cabinet','bathroom'] },
  { id:112, name:'Freestanding Toilet',     sku:'BAT-006', cat:'bathroom',subcat:'wc',       price:18000, brand:'Hindware',   material:'Ceramic',color:'#f8f8f8',  dims:{w:0.4,h:0.78,d:0.65},  glb:null, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70', tags:['toilet','white','ceramic'] },
  { id:113, name:'Corner Shower Enclosure', sku:'BAT-007', cat:'bathroom',subcat:'shower',   price:45000, brand:'Jaquar',    material:'Tempered Glass',color:'#a8d5e2',dims:{w:0.9,h:2.1,d:0.9},glb:null,img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70',tags:['glass','corner','shower'] },
  { id:114, name:'Heated Towel Rail',       sku:'BAT-008', cat:'bathroom',subcat:'accessories',price:8500,brand:'Jaquar',    material:'SS',     color:'#c0c0c0', dims:{w:0.55,h:0.9,d:0.1},   glb:null, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70', tags:['towel','heated','steel'] },
  { id:115, name:'Bathroom Stool',          sku:'BAT-009', cat:'bathroom',subcat:'seating',  price:3200,  brand:'Pepperfry',  material:'Teak',   color:'#c8a878', dims:{w:0.35,h:0.45,d:0.35}, glb:null, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&q=70', tags:['stool','teak','spa'] },

  /* ─── KITCHEN EXPANSION ──────────────────────────────────────────────── */
  { id:116, name:'Kitchen Chimney',         sku:'KIT-005', cat:'kitchen', subcat:'appliances',price:22000,brand:'Hindware',   material:'SS',     color:'#c0c0c0', dims:{w:0.6,h:0.5,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['chimney','steel','modern'] },
  { id:117, name:'Breakfast Counter + Stools',sku:'KIT-006',cat:'kitchen',subcat:'islands',  price:35000, brand:'Sleek',      material:'Quartz', color:'#f0ece6', dims:{w:1.2,h:0.9,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['breakfast','counter','bar'] },
  { id:118, name:'Spice Rack Wall',         sku:'KIT-007', cat:'kitchen', subcat:'storage',  price:2800,  brand:'IKEA',       material:'Steel',  color:'#c0c0c0', dims:{w:0.6,h:0.3,d:0.1},   glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['spice','wall','kitchen'] },
  { id:119, name:'Pull-Out Pantry Unit',    sku:'KIT-008', cat:'kitchen', subcat:'storage',  price:18000, brand:'Hettich',    material:'MDF',    color:'#e8e0d4', dims:{w:0.3,h:2.1,d:0.55},  glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['pantry','pull-out','white'] },

  /* ─── OUTDOOR EXPANSION ──────────────────────────────────────────────── */
  { id:120, name:'Swing Garden Bench',      sku:'OUT-005', cat:'outdoor', subcat:'seating',  price:28000, brand:'Nilkamal',   material:'Metal',  color:'#4a4a4a', dims:{w:1.4,h:1.6,d:0.55},  glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['swing','garden','metal'] },
  { id:121, name:'Outdoor Dining Set 4',    sku:'OUT-006', cat:'outdoor', subcat:'dining',   price:38000, brand:'Cane-line',  material:'Aluminium+HDPE',color:'#808080',dims:{w:1.2,h:0.75,d:0.8},glb:null,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70',tags:['outdoor','dining','4-seater'] },
  { id:122, name:'Hammock Stand',           sku:'OUT-007', cat:'outdoor', subcat:'seating',  price:12000, brand:'Zuperia',    material:'Steel',  color:'#c0c0c0', dims:{w:3.0,h:1.2,d:1.2},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['hammock','steel','relax'] },

  /* ─── KIDS EXPANSION ─────────────────────────────────────────────────── */
  { id:123, name:'Treehouse Loft Bed',      sku:'KID-005', cat:'kids',    subcat:'beds',     price:38000, brand:'Alex Daisy', material:'MDF',    color:'#4a90d9', dims:{w:1.0,h:1.9,d:2.2},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['loft','treehouse','blue'] },
  { id:124, name:'Kids Wardrobe (2-Door)',  sku:'KID-006', cat:'kids',    subcat:'storage',  price:18000, brand:'Alex Daisy', material:'MDF',    color:'#f9ca24', dims:{w:1.0,h:1.8,d:0.5},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['wardrobe','yellow','kids'] },
  { id:125, name:'Chalkboard Wall Panel',   sku:'KID-007', cat:'kids',    subcat:'decor',    price:3500,  brand:'Craft Corner',material:'MDF',   color:'#2a2a2a', dims:{w:1.2,h:1.8,d:0.02},  glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['chalkboard','black','creative'] },
  { id:126, name:'Toy Kitchen Set',         sku:'KID-008', cat:'kids',    subcat:'play',     price:8500,  brand:'Funskool',   material:'MDF',    color:'#e84393', dims:{w:0.8,h:0.8,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['play','kitchen','pink'] },

  /* ─── DECOR EXPANSION ────────────────────────────────────────────────── */
  { id:127, name:'Succulent Garden Tray',   sku:'DEC-016', cat:'decor',   subcat:'plants',   price:2200,  brand:'Ugaoo',      material:'Ceramic',color:'#4a7c59', dims:{w:0.5,h:0.15,d:0.2},  glb:null, img:'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=300&q=70', tags:['succulent','green','tray'] },
  { id:128, name:'Floating Bedside Shelf',  sku:'DEC-017', cat:'decor',   subcat:'shelving', price:1800,  brand:'IKEA',       material:'MDF',    color:'#e8e0d4', dims:{w:0.4,h:0.15,d:0.25}, glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['shelf','bedside','floating'] },
  { id:129, name:'Artisan Ceramic Bowl',    sku:'DEC-018', cat:'decor',   subcat:'display',  price:2800,  brand:'Good Earth',  material:'Ceramic',color:'#c4a882',dims:{w:0.3,h:0.15,d:0.3},  glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['ceramic','bowl','artisan'] },
  { id:130, name:'Aroma Diffuser',          sku:'DEC-019', cat:'decor',   subcat:'wellness', price:1500,  brand:'Muji',        material:'Ceramic',color:'#f5f5f5',dims:{w:0.12,h:0.2,d:0.12},  glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['diffuser','white','wellness'] },
  { id:131, name:'Framed Botanical Prints', sku:'DEC-020', cat:'decor',   subcat:'art',      price:4500,  brand:'Printlab',    material:'Paper+MDF',color:'#4a7c59',dims:{w:0.4,h:0.5,d:0.03}, glb:null, img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&q=70', tags:['botanical','green','prints'] },
  { id:132, name:'Throw Blanket (Chunky)',  sku:'DEC-021', cat:'decor',   subcat:'textiles', price:3800,  brand:'H&M Home',    material:'Wool',   color:'#c4a882', dims:{w:1.4,h:0.05,d:1.8},  glb:null, img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=300&q=70', tags:['blanket','wool','cozy'] },
  { id:133, name:'Woven Wall Tapestry',     sku:'DEC-022', cat:'decor',   subcat:'art',      price:6500,  brand:'Fabindia',    material:'Cotton', color:'#c8a878', dims:{w:1.0,h:1.4,d:0.02},  glb:null, img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&q=70', tags:['tapestry','boho','wall'] },
  { id:134, name:'Terracotta Planter Set',  sku:'DEC-023', cat:'decor',   subcat:'plants',   price:2200,  brand:'Ugaoo',       material:'Terracotta',color:'#c4714a',dims:{w:0.25,h:0.3,d:0.25},glb:null,img:'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=300&q=70',tags:['terracotta','plant','outdoor'] },
  { id:135, name:'Buddha Statue Décor',     sku:'DEC-024', cat:'decor',   subcat:'display',  price:3500,  brand:'Craftter',    material:'Resin',  color:'#c9a227', dims:{w:0.2,h:0.35,d:0.15}, glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['buddha','gold','spiritual'] },

  /* ─── STRUCTURAL ELEMENTS ─────────────────────────────────────────────── */
  { id:136, name:'Room Divider Screen',     sku:'STR-014', cat:'decor',   subcat:'dividers', price:12000, brand:'Pepperfry',   material:'Wood+Fabric',color:'#8b7355',dims:{w:1.8,h:1.8,d:0.05},glb:null,img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70',tags:['divider','partition','wood'] },
  { id:137, name:'Rattan Room Divider',     sku:'STR-015', cat:'decor',   subcat:'dividers', price:8500,  brand:'Urban Ladder', material:'Rattan', color:'#c8a878', dims:{w:1.5,h:1.7,d:0.05},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['rattan','divider','boho'] },
  { id:138, name:'False Ceiling Frame',     sku:'STR-016', cat:'decor',   subcat:'structural',price:25000,brand:'Armstrong',   material:'Gypsum',  color:'#f5f5f5', dims:{w:3.0,h:0.3,d:4.0},   glb:null, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&q=70', tags:['ceiling','gypsum','false'] },
  { id:139, name:'Feature Wall Panel',      sku:'STR-017', cat:'decor',   subcat:'wall',     price:15000, brand:'Pergo',       material:'3D Wall Panel',color:'#e8e0d4',dims:{w:0.6,h:0.6,d:0.05},glb:null,img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70',tags:['3D','wall','panel'] },
  { id:140, name:'Wooden Jali Partition',   sku:'STR-018', cat:'decor',   subcat:'dividers', price:22000, brand:'Woodcraft',   material:'Teak',    color:'#8b6914', dims:{w:1.2,h:2.2,d:0.05},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['jali','teak','traditional'] },

  /* ─── WELLNESS & POOJA ───────────────────────────────────────────────── */
  { id:141, name:'Pooja Mandir Unit',       sku:'POO-001', cat:'decor',   subcat:'pooja',    price:18000, brand:'Woodcraft',   material:'Teak',    color:'#8b6914', dims:{w:0.8,h:1.6,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['pooja','mandir','teak','traditional'] },
  { id:142, name:'Yoga Mat + Holder',       sku:'WEL-001', cat:'decor',   subcat:'wellness', price:2800,  brand:'Boldfit',     material:'TPE+Bamboo',color:'#4a7c59',dims:{w:0.65,h:0.05,d:1.8}, glb:null, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70', tags:['yoga','green','wellness'] },
  { id:143, name:'Meditation Cushion',      sku:'WEL-002', cat:'decor',   subcat:'wellness', price:1800,  brand:'Yogamat.in',  material:'Cotton',  color:'#c4a882', dims:{w:0.4,h:0.15,d:0.4},  glb:null, img:'https://images.unsplash.com/photo-1616627052149-5a7e2aee9350?w=300&q=70', tags:['meditation','zafu','beige'] },

  /* ─── SMART HOME / TECH ──────────────────────────────────────────────── */
  { id:144, name:'Smart TV 55"',            sku:'TEC-001', cat:'storage', subcat:'tv-units', price:65000, brand:'Samsung',     material:'Glass+Metal',color:'#1c1c1c',dims:{w:1.23,h:0.73,d:0.06},glb:null,img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70',tags:['tv','55inch','4K'] },
  { id:145, name:'Smart Speaker',           sku:'TEC-002', cat:'decor',   subcat:'tech',     price:8500,  brand:'Amazon',      material:'Fabric',  color:'#3a3a3a', dims:{w:0.1,h:0.2,d:0.1},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['alexa','smart','speaker'] },
  { id:146, name:'Home Theatre System',     sku:'TEC-003', cat:'storage', subcat:'tv-units', price:45000, brand:'Sony',        material:'ABS+Metal',color:'#1c1c1c',dims:{w:2.0,h:0.12,d:0.3},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['soundbar','home-theatre','black'] },

  /* ─── LAUNDRY & UTILITY ──────────────────────────────────────────────── */
  { id:147, name:'Washing Machine Front Load',sku:'UTL-001',cat:'kitchen',subcat:'appliances',price:38000,brand:'LG',          material:'Metal',   color:'#c0c0c0', dims:{w:0.6,h:0.85,d:0.6},  glb:null, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=70', tags:['washing','laundry','front-load'] },
  { id:148, name:'Cloth Drying Stand',       sku:'UTL-002', cat:'kitchen',subcat:'utility',  price:2500,  brand:'Parasnath',   material:'Steel',   color:'#c0c0c0', dims:{w:1.1,h:1.0,d:0.55},  glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['drying','steel','utility'] },
  { id:149, name:'Ironing Board + Iron',     sku:'UTL-003', cat:'kitchen',subcat:'utility',  price:3500,  brand:'Philips',     material:'Metal',   color:'#4a4a4a', dims:{w:1.2,h:0.9,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['ironing','utility','board'] },
  { id:150, name:'Utility Shelf Rack',       sku:'UTL-004', cat:'storage',subcat:'racks',    price:4500,  brand:'Parasnath',   material:'Steel',   color:'#c0c0c0', dims:{w:0.9,h:1.8,d:0.4},   glb:null, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70', tags:['utility','steel','rack'] },
]

export default CATALOG
