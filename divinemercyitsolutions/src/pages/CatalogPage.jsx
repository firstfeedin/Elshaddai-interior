import AppShell from '../components/AppShell'
import { useState } from 'react'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const ITEMS = [
  { id:1,  name:'Modern Sofa',          sku:'SOF-001', cat:'Seating',  price:45000, img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:2,  name:'King Bed Frame',        sku:'BED-002', cat:'Bedroom',  price:55000, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:3,  name:'Dining Table 6-Seat',   sku:'DIN-003', cat:'Dining',   price:38000, img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=300&q=70', stock:'Low Stock' },
  { id:4,  name:'Floor Lamp Arc',        sku:'LIT-004', cat:'Lighting', price:8500,  img:'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:5,  name:'Bookshelf 5-Tier',      sku:'STR-005', cat:'Storage',  price:18000, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:6,  name:'Kitchen Island Pro',    sku:'KIT-006', cat:'Kitchen',  price:85000, img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=300&q=70', stock:'Pre-Order' },
  { id:7,  name:'Office Ergonomic Chair',sku:'OFF-007', cat:'Office',   price:22000, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:8,  name:'Accent Chair',          sku:'SEA-010', cat:'Seating',  price:12000, img:'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:9,  name:'Wardrobe 4-Door',       sku:'STR-009', cat:'Storage',  price:75000, img:'https://images.unsplash.com/photo-1558997519-83ea9252eeb8?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:10, name:'TV Unit Minimal',       sku:'STR-011', cat:'Storage',  price:22000, img:'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:11, name:'Plant Stand Teak',      sku:'DEC-012', cat:'Decor',    price:3500,  img:'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
  { id:12, name:'Bathtub Freestanding',  sku:'BTH-008', cat:'Bathroom', price:65000, img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=300&q=70', stock:'In Stock'  },
]

const MATERIALS = [
  { name:'White Oak',      code:'#C8A86B', collection:'Wood'   },
  { name:'Dark Walnut',    code:'#4A3220', collection:'Wood'   },
  { name:'Teak Natural',   code:'#B87333', collection:'Wood'   },
  { name:'Pine Light',     code:'#DEB887', collection:'Wood'   },
  { name:'Marble Carrara', code:'#F0EBE0', collection:'Stone'  },
  { name:'Granite Black',  code:'#2C2C2C', collection:'Stone'  },
  { name:'Travertine',     code:'#D4C5A9', collection:'Stone'  },
  { name:'Slate Grey',     code:'#708090', collection:'Stone'  },
  { name:'Velvet Navy',    code:'#1B2A4A', collection:'Fabric' },
  { name:'Linen Cream',    code:'#F5F0E8', collection:'Fabric' },
  { name:'Wool Charcoal',  code:'#36454F', collection:'Fabric' },
  { name:'Cotton Sage',    code:'#8FAF8F', collection:'Fabric' },
  { name:'Brushed Gold',   code:'#B8860B', collection:'Metal'  },
  { name:'Polished Chrome',code:'#C0C0C0', collection:'Metal'  },
  { name:'Matte Black',    code:'#1C1C1C', collection:'Metal'  },
  { name:'Copper Aged',    code:'#B87333', collection:'Metal'  },
  { name:'Clear Glass',    code:'#E8F4F8', collection:'Glass'  },
  { name:'Frosted Glass',  code:'#D0E8EC', collection:'Glass'  },
  { name:'Smoked Glass',   code:'#607080', collection:'Glass'  },
  { name:'Bronze Tint',    code:'#8B6914', collection:'Glass'  },
]

const STOCK_STATUS = { 'In Stock': gold, 'Low Stock': '#f59e0b', 'Pre-Order': stone, 'Out of Stock': '#ef4444' }
const COLLECTIONS = [...new Set(MATERIALS.map(m => m.collection))]
const TABS = [['catalog','My Catalog'],['upload','Upload 3D'],['materials','Materials'],['sku','SKU Manager']]

function ItemCard({ item }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: '#fff', border: `1px solid ${hov ? dark : border}`, transition: 'border-color 0.2s', cursor: 'pointer' }}>
      <div style={{ height: 160, overflow: 'hidden' }}>
        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s', transform: hov ? 'scale(1.05)' : 'scale(1)' }} />
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ ...sans, margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: dark }}>{item.name}</p>
        <p style={{ ...sans, margin: '0 0 8px', fontSize: 10, color: '#a8a29e', fontFamily: 'monospace' }}>{item.sku} · {item.cat}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ ...serif, margin: 0, fontSize: 20, fontWeight: 300, color: dark }}>₹{item.price.toLocaleString()}</p>
          <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: STOCK_STATUS[item.stock] }}>{item.stock}</span>
        </div>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const [tab, setTab]     = useState('catalog')
  const [search, setSearch] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const uploads = [
    { name:'sofa_modern.glb',     size:'4.2 MB', date:'Today',      ok:true },
    { name:'kitchen_cabinet.obj', size:'2.8 MB', date:'Yesterday',  ok:true },
    { name:'wardrobe_3d.fbx',     size:'7.1 MB', date:'2 days ago', ok:false },
  ]
  const filtered = ITEMS.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <AppShell title="Product Catalog">
      <div style={{ ...sans, padding: '32px 36px' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${border}`, marginBottom: 32 }}>
          {TABS.map(([id, lb]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ ...sans, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: tab === id ? dark : '#a8a29e', padding: '0 24px 16px 0', borderBottom: `2px solid ${tab === id ? dark : 'transparent'}`, marginBottom: -1, transition: 'all 0.2s' }}>
              {lb}
            </button>
          ))}
        </div>

        {/* CATALOG */}
        {tab === 'catalog' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
                  placeholder="Search catalog..."
                  style={{ width: 220, padding: '8px 10px 8px 28px', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${searchFocus ? dark : border}`, fontSize: 12, color: dark, outline: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }} />
                <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#a8a29e' }}>⌕</span>
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={() => setTab('upload')} style={{ ...sans, padding: '8px 18px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Import 3D</button>
              <button style={{ ...sans, padding: '8px 18px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>+ Add Item</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 2 }}>
              {filtered.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {/* UPLOAD */}
        {tab === 'upload' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false) }}
                style={{ border: `1.5px dashed ${dragOver ? dark : border}`, padding: '56px 32px', textAlign: 'center', background: dragOver ? light : '#fff', transition: 'all 0.2s', marginBottom: 16 }}>
                <p style={{ ...serif, margin: '0 0 10px', fontSize: 26, fontWeight: 300, color: dark }}>Drop 3D Models Here</p>
                <p style={{ ...sans, margin: '0 0 20px', fontSize: 13, color: stone, fontWeight: 300 }}>or click to browse files</p>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                  {['.GLB','.GLTF','.OBJ','.FBX','.3DS'].map(f => (
                    <span key={f} style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', padding: '4px 8px', border: `1px solid ${border}`, color: stone }}>{f}</span>
                  ))}
                </div>
                <button style={{ ...sans, padding: '10px 24px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Browse Files</button>
              </div>
              <div style={{ background: dark, padding: '20px 24px' }}>
                <p style={{ ...sans, margin: '0 0 8px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Import CAD Files</p>
                <p style={{ ...sans, margin: '0 0 14px', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>Import floor plans and architectural drawings directly from CAD software.</p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {['.DWG','.DXF','.IFC','.RVT'].map(f => (
                    <span key={f} style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', padding: '4px 8px', border: '1px solid rgba(255,255,255,0.1)', color: gold }}>{f}</span>
                  ))}
                </div>
                <button style={{ ...sans, padding: '9px 18px', background: 'transparent', border: `1px solid rgba(255,255,255,0.1)`, color: gold, cursor: 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Import CAD / DWG File</button>
              </div>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '22px 24px' }}>
              <p style={{ ...sans, margin: '0 0 18px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Recent Uploads</p>
              {uploads.map((u, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, marginBottom: 16, borderBottom: i < uploads.length - 1 ? `1px solid ${border}` : 'none' }}>
                  <div style={{ width: 36, height: 36, background: light, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="1" stroke="#a8a29e" strokeWidth="1.2"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ ...sans, margin: '0 0 2px', fontSize: 12, fontWeight: 500, color: dark }}>{u.name}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{u.size} · {u.date}</p>
                  </div>
                  <span style={{ ...sans, fontSize: 10, fontWeight: 600, color: u.ok ? gold : '#f59e0b', letterSpacing: '0.1em' }}>{u.ok ? 'Processed' : 'Processing'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MATERIALS */}
        {tab === 'materials' && (
          <div>
            {COLLECTIONS.map(col => (
              <div key={col} style={{ marginBottom: 36 }}>
                <p style={{ ...sans, margin: '0 0 14px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>{col}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 2 }}>
                  {MATERIALS.filter(m => m.collection === col).map(m => (
                    <div key={m.name} style={{ background: '#fff', border: `1px solid ${border}`, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = dark}
                      onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                      <div style={{ height: 56, background: m.code }} />
                      <div style={{ padding: '10px 12px' }}>
                        <p style={{ ...sans, margin: '0 0 2px', fontSize: 11, fontWeight: 500, color: dark }}>{m.name}</p>
                        <p style={{ margin: '0 0 8px', fontSize: 9, color: '#a8a29e', fontFamily: 'monospace' }}>{m.code}</p>
                        <button onClick={() => window.location.href = '/designer'} style={{ ...sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 0', background: 'none', border: 'none', color: stone, cursor: 'pointer', textDecoration: 'none' }}>Apply to Scene →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SKU MANAGER */}
        {tab === 'sku' && (
          <div style={{ background: '#fff', border: `1px solid ${border}`, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ ...sans, margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>SKU Management</p>
              <div style={{ flex: 1 }} />
              <button style={{ ...sans, padding: '7px 14px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Import CSV</button>
              <button style={{ ...sans, padding: '7px 14px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>+ Add SKU</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: light }}>
                  {['Item','SKU','Category','Unit Price','Stock','Actions'].map(h => (
                    <th key={h} style={{ ...sans, padding: '12px 18px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e', borderBottom: `1px solid ${border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ITEMS.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: i < ITEMS.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={item.img} alt="" style={{ width: 32, height: 32, objectFit: 'cover' }} />
                        <span style={{ ...sans, fontSize: 13, fontWeight: 400, color: dark }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ ...sans, padding: '13px 18px', fontSize: 11, color: '#a8a29e', fontFamily: 'monospace' }}>{item.sku}</td>
                    <td style={{ padding: '13px 18px' }}><span style={{ ...sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone }}>{item.cat}</span></td>
                    <td style={{ ...serif, padding: '13px 18px', fontSize: 18, fontWeight: 300, color: dark }}>₹{item.price.toLocaleString()}</td>
                    <td style={{ padding: '13px 18px' }}><span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: STOCK_STATUS[item.stock] }}>{item.stock}</span></td>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ ...sans, padding: '5px 10px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>Edit</button>
                        <button style={{ ...sans, padding: '5px 10px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
