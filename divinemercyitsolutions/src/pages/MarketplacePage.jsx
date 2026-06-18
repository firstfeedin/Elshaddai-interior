import { useState } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

// ── Catalogue ─────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Furniture', 'Flooring', 'Lighting', 'Hardware', 'Fabric', 'Décor', 'Kitchen']

const PRODUCTS = [
  { id:'p1',  name:'Chester Tufted Sofa — 3-Seater',     cat:'Furniture', brand:'Wooden Street',    price:185000, unit:'nos',   lead:'4 weeks',  rating:4.7, vendor:'v1', sku:'WS-SF-0014', desc:'Premium fabric upholstery with solid teak frame. Available in 12 fabric options.' },
  { id:'p2',  name:'Italian Carrara Marble — Honed',      cat:'Flooring',  brand:'Stone Palace',     price:650,    unit:'sqft', lead:'2 weeks',  rating:4.9, vendor:'v2', sku:'SP-MR-0022', desc:'600×600mm polished marble slabs. Book-matched slabs available on request.' },
  { id:'p3',  name:'Pendant Light — Antique Brass',       cat:'Lighting',  brand:'Fos Lighting',     price:18500,  unit:'nos',   lead:'1 week',   rating:4.5, vendor:'v3', sku:'FL-PD-0008', desc:'Hand-blown glass globe, E27, 40W max. IP44 rated. Dimmable compatible.' },
  { id:'p4',  name:'Marine Plywood — 18mm BWR',           cat:'Furniture', brand:'Century Ply',      price:1800,   unit:'sheet', lead:'3 days',   rating:4.8, vendor:'v4', sku:'CP-PW-0018', desc:'Boiling Water Resistant grade. 8×4ft sheet. ISI marked.' },
  { id:'p5',  name:'Herringbone Oak — Engineered Wood',   cat:'Flooring',  brand:'Pergo',            price:280,    unit:'sqft', lead:'3 weeks',  rating:4.6, vendor:'v5', sku:'PG-EW-0045', desc:'European oak veneer on HDF core. 12mm. 25 year warranty.' },
  { id:'p6',  name:'SS Cabinet Hardware Set — Satin',     cat:'Hardware',  brand:'Ebco',             price:3200,   unit:'set',  lead:'3 days',   rating:4.4, vendor:'v4', sku:'EB-HW-0091', desc:'Full kitchen hardware set. Soft-close hinges + tandem drawer systems. 50 unit set.' },
  { id:'p7',  name:'Linen Curtain Fabric — Natural',      cat:'Fabric',    brand:'Fabrics India',    price:380,    unit:'mtr',  lead:'1 week',   rating:4.3, vendor:'v6', sku:'FI-LN-0033', desc:'100% natural linen, 54" wide. Dry clean recommended. Sold per running metre.' },
  { id:'p8',  name:'Modular Kitchen — L-Shape 10ft',      cat:'Kitchen',   brand:'Häfele India',     price:485000, unit:'nos',   lead:'8 weeks',  rating:4.8, vendor:'v7', sku:'HF-KT-0007', desc:'Full modular kitchen with Häfele hardware. Acrylic shutters. Tandem baskets included.' },
  { id:'p9',  name:'Concrete Effect Tiles — Matt',        cat:'Flooring',  brand:'RAK Ceramics',     price:95,     unit:'sqft', lead:'1 week',   rating:4.5, vendor:'v8', sku:'RK-TL-0201', desc:'600×600mm. Rectified edge. R10 slip resistance. 5-shade random mix.' },
  { id:'p10', name:'Arc Floor Lamp — Brass & Black',      cat:'Lighting',  brand:'Urban Ladder',     price:24500,  unit:'nos',   lead:'2 weeks',  rating:4.6, vendor:'v5', sku:'UL-LP-0044', desc:'Matte black shade with antique brass pole. E27, 60W. Height 180cm.' },
  { id:'p11', name:'Wall Paint — Asian Royale Premium',   cat:'Décor',     brand:'Asian Paints',     price:310,    unit:'ltr',  lead:'2 days',   rating:4.9, vendor:'v9', sku:'AP-PT-0011', desc:'Washable interior emulsion. 14.4L covers ~90sqft two coats. 2000+ colour options.' },
  { id:'p12', name:'Teak Platform Bed — King 72×78',      cat:'Furniture', brand:'Pepperfry',        price:110000, unit:'nos',   lead:'3 weeks',  rating:4.7, vendor:'v1', sku:'PF-BD-0038', desc:'Solid sheesham wood. Low platform design. No box storage. Requires 8" mattress.' },
]

const VENDORS = [
  { id:'v1', name:'Wooden Street Furniture',  city:'Jodhpur',     cat:'Furniture',       rating:4.7, orders:38, verified:true  },
  { id:'v2', name:'Stone Palace India',       city:'Rajasthan',   cat:'Natural Stone',   rating:4.9, orders:22, verified:true  },
  { id:'v3', name:'Fos Lighting',             city:'Mumbai',      cat:'Lighting',        rating:4.5, orders:14, verified:true  },
  { id:'v4', name:'Century Ply Distributors', city:'Chennai',     cat:'Plywood & HW',    rating:4.8, orders:56, verified:true  },
  { id:'v5', name:'Pergo & Urban Ladder',     city:'Bangalore',   cat:'Flooring & Decor',rating:4.6, orders:31, verified:true  },
  { id:'v6', name:'Fabrics India',            city:'Surat',       cat:'Textiles',        rating:4.3, orders:9,  verified:false },
  { id:'v7', name:'Häfele India Ltd.',        city:'Bangalore',   cat:'Hardware & Kitchens',rating:4.8,orders:17,verified:true },
  { id:'v8', name:'RAK Ceramics India',       city:'Chennai',     cat:'Tiles',           rating:4.5, orders:28, verified:true  },
  { id:'v9', name:'Asian Paints Ltd.',        city:'PAN India',   cat:'Paints',          rating:4.9, orders:74, verified:true  },
]

const MOCK_ORDERS = [
  { id:'PO-001', vendor:'Century Ply', product:'Marine Plywood 18mm', qty:200, unit:'sheets', amount:360000, status:'DELIVERED', date:'2025-06-03' },
  { id:'PO-002', vendor:'Stone Palace', product:'Italian Carrara Marble', qty:500, unit:'sqft', amount:325000, status:'IN_TRANSIT', date:'2025-06-14' },
  { id:'PO-003', vendor:'Wooden Street', product:'Chester Sofa', qty:1, unit:'nos', amount:185000, status:'ORDERED', date:'2025-06-10' },
]

// ── Star rating ───────────────────────────────────────────────────
function Stars({ r }) {
  return <span style={{ color: gold, fontSize: 11 }}>{Array.from({ length: 5 }, (_, i) => i < Math.round(r) ? '★' : '☆').join('')} <span style={{ ...sans, fontSize: 10, color: stone }}>{r}</span></span>
}

// ── Product Card ──────────────────────────────────────────────────
function ProductCard({ p, onAddToCart, inCart }) {
  const fmtINR = n => '₹' + n.toLocaleString('en-IN')
  return (
    <div style={{ background: '#fff', border: `1px solid ${inCart ? gold : bdr}`, display: 'flex', flexDirection: 'column', transition: 'border-color 0.15s' }}>
      {/* Image placeholder */}
      <div style={{ height: 160, background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, position: 'relative' }}>
        <span style={{ fontSize: 40, opacity: 0.3 }}>◉</span>
        <span style={{ ...sans, fontSize: 9, color: '#57534e', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{p.cat}</span>
        {inCart && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: gold, padding: '2px 8px' }}>
            <span style={{ ...sans, fontSize: 9, fontWeight: 700, color: '#000' }}>In Quote</span>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ ...sans, fontSize: 9, color: stone, margin: '0 0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.brand} · {p.sku}</p>
        <p style={{ ...serif, fontSize: 14, fontWeight: 300, color: dark, margin: '0 0 6px', lineHeight: 1.4 }}>{p.name}</p>
        <p style={{ ...sans, fontSize: 10, color: stone, margin: '0 0 8px', lineHeight: 1.5, flex: 1 }}>{p.desc}</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <Stars r={p.rating} />
          <span style={{ ...sans, fontSize: 9, color: stone }}>· Lead: {p.lead}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ ...serif, fontSize: 18, color: dark }}>{fmtINR(p.price)}</span>
            <span style={{ ...sans, fontSize: 10, color: stone }}> / {p.unit}</span>
          </div>
          <button onClick={() => onAddToCart(p)}
            style={{ ...sans, padding: '6px 14px', background: inCart ? light : gold, border: `1px solid ${inCart ? bdr : gold}`, color: inCart ? stone : '#000', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {inCart ? '✓ Added' : '+ Quote'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const [catFilter, setCatFilter]  = useState('All')
  const [search,    setSearch]     = useState('')
  const [view,      setView]       = useState('catalogue') // catalogue | vendors | orders
  const [cart,      setCart]       = useState([])
  const [cartOpen,  setCartOpen]   = useState(false)
  const [sideCol,   setSideCol]    = useState(false)
  const W = sideCol ? 60 : 220

  const user = JSON.parse(localStorage.getItem('es_user') || '{"name":"Admin","role":"ADMIN"}')
  const initials = (user.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const filtered = PRODUCTS.filter(p => {
    if (catFilter !== 'All' && p.cat !== catFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function addToCart(p) {
    setCart(c => c.find(x => x.id === p.id) ? c.filter(x => x.id !== p.id) : [...c, { ...p, qty: 1 }])
  }
  function updateQty(id, qty) { setCart(c => c.map(x => x.id === id ? { ...x, qty: Math.max(1, qty) } : x)) }
  function removeFromCart(id)  { setCart(c => c.filter(x => x.id !== id)) }

  const cartTotal = cart.reduce((s, x) => s + x.price * x.qty, 0)
  const fmtINR = n => '₹' + Math.round(n).toLocaleString('en-IN')

  const STATUS_C = { DELIVERED: '#22c55e', IN_TRANSIT: gold, ORDERED: '#94a3b8', PENDING: '#f59e0b' }

  const SIDEBAR = [
    { id: 'catalogue', icon: '◉', label: 'Catalogue'     },
    { id: 'vendors',   icon: '◈', label: 'Vendors'       },
    { id: 'orders',    icon: '◧', label: 'Orders'        },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', ...sans, background: light }}>
      {/* Sidebar */}
      <aside style={{ width: W, background: dark, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.22s', overflow: 'hidden' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: sideCol ? '0 15px' : '0 16px', borderBottom: '1px solid #292524', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none"/></svg>
          </div>
          {!sideCol && (
            <div>
              <p style={{ ...serif, margin: 0, fontSize: 15, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>El Shaddai</p>
              <p style={{ margin: 0, fontSize: 8, color: gold, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Marketplace</p>
            </div>
          )}
          <button onClick={() => setSideCol(c => !c)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#57534e', cursor: 'pointer', fontSize: 14, padding: 4 }}>{sideCol ? '»' : '«'}</button>
        </div>
        <nav style={{ flex: 1, padding: '10px 6px' }}>
          {SIDEBAR.map(t => {
            const active = view === t.id
            return (
              <button key={t.id} onClick={() => setView(t.id)} title={t.label}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: sideCol ? '10px 15px' : '9px 12px', background: active ? 'rgba(201,162,39,0.08)' : 'transparent', border: 'none', borderLeft: `2px solid ${active ? gold : 'transparent'}`, color: active ? gold : '#78716c', cursor: 'pointer', ...sans, fontSize: 11, fontWeight: active ? 600 : 400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                {!sideCol && <span>{t.label}</span>}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: sideCol ? '10px 6px' : '10px 8px', borderTop: '1px solid #292524' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sideCol ? '8px 15px' : '8px 12px', color: '#78716c', textDecoration: 'none', ...sans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <span>◁</span>{!sideCol && <span>Dashboards</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 60, background: '#fff', borderBottom: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14, flexShrink: 0 }}>
          <p style={{ ...serif, margin: 0, fontSize: 22, fontWeight: 300, color: dark }}>
            {view === 'catalogue' ? 'Product Catalogue' : view === 'vendors' ? 'Vendor Directory' : 'Purchase Orders'}
          </p>
          <div style={{ flex: 1 }} />

          {view === 'catalogue' && (
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                style={{ ...sans, padding: '7px 36px 7px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, width: 220 }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: stone, cursor: 'pointer', fontSize: 12 }}>✕</button>}
            </div>
          )}

          {/* Cart button */}
          <button onClick={() => setCartOpen(o => !o)} style={{ position: 'relative', ...sans, padding: '7px 16px', background: cart.length ? gold : 'transparent', border: `1px solid ${cart.length ? gold : bdr}`, color: cart.length ? '#000' : stone, fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            ◧ Quote ({cart.length})
          </button>
          <div style={{ width: 32, height: 32, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#000' }}>{initials}</div>
        </header>

        {/* Category filter */}
        {view === 'catalogue' && (
          <div style={{ background: '#fff', borderBottom: `1px solid ${bdr}`, display: 'flex', padding: '0 28px', overflowX: 'auto', flexShrink: 0 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ ...sans, padding: '12px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${catFilter === c ? gold : 'transparent'}`, color: catFilter === c ? gold : stone, fontWeight: catFilter === c ? 700 : 400, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {c}
              </button>
            ))}
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', padding: 28, position: 'relative' }}>
          {/* Catalogue */}
          {view === 'catalogue' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {filtered.map(p => (
                <ProductCard key={p.id} p={p} onAddToCart={addToCart} inCart={cart.some(c => c.id === p.id)} />
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
                  <p style={{ ...serif, fontSize: 24, fontWeight: 300, color: '#a8a29e' }}>No products found</p>
                </div>
              )}
            </div>
          )}

          {/* Vendors */}
          {view === 'vendors' && (
            <div>
              <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Verified Vendors', value: VENDORS.filter(v => v.verified).length, accent: gold },
                  { label: 'Total Vendors',    value: VENDORS.length },
                  { label: 'Total Orders',     value: VENDORS.reduce((s, v) => s + v.orders, 0) },
                  { label: 'Avg Rating',       value: (VENDORS.reduce((s, v) => s + v.rating, 0) / VENDORS.length).toFixed(1), accent: gold },
                ].map(k => (
                  <div key={k.label} style={{ flex: 1, background: '#fff', border: `1px solid ${bdr}`, padding: '16px 20px' }}>
                    <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 6px' }}>{k.label}</p>
                    <p style={{ ...serif, fontSize: 28, fontWeight: 300, color: k.accent || dark, margin: 0 }}>{k.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {VENDORS.map(v => (
                  <div key={v.id} style={{ background: '#fff', border: `1px solid ${bdr}`, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, background: dark, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ ...sans, fontSize: 11, fontWeight: 700, color: gold }}>{v.name.split(' ').map(w => w[0]).join('').slice(0,2)}</span>
                        </div>
                        <div>
                          <p style={{ ...serif, fontSize: 15, fontWeight: 300, color: dark, margin: '0 0 2px' }}>{v.name}</p>
                          <p style={{ ...sans, fontSize: 10, color: stone, margin: 0 }}>{v.city}</p>
                        </div>
                      </div>
                      {v.verified && (
                        <span style={{ ...sans, fontSize: 9, fontWeight: 700, color: '#22c55e', border: '1px solid #22c55e', padding: '1px 7px', letterSpacing: '0.1em' }}>✓ Verified</span>
                      )}
                    </div>
                    <p style={{ ...sans, fontSize: 10, color: stone, margin: '0 0 10px' }}>{v.cat}</p>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <Stars r={v.rating} />
                      <span style={{ ...sans, fontSize: 10, color: stone }}>{v.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {view === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ ...serif, fontSize: 24, fontWeight: 300, color: dark, margin: 0 }}>Purchase Orders</p>
                <Link to="/tracking" style={{ ...sans, padding: '8px 18px', background: gold, color: '#000', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>View in Tracking →</Link>
              </div>
              {MOCK_ORDERS.map(o => {
                const c = STATUS_C[o.status] || stone
                return (
                  <div key={o.id} style={{ background: '#fff', border: `1px solid ${bdr}`, padding: '18px 22px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 2, height: 50, background: c, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ ...sans, fontSize: 12, fontWeight: 700, color: dark }}>{o.id}</span>
                        <span style={{ ...sans, fontSize: 9, fontWeight: 700, color: c, border: `1px solid ${c}`, padding: '1px 7px', letterSpacing: '0.1em' }}>{o.status.replace(/_/g,' ')}</span>
                      </div>
                      <p style={{ ...serif, fontSize: 14, fontWeight: 300, color: dark, margin: '0 0 2px' }}>{o.product}</p>
                      <p style={{ ...sans, fontSize: 10, color: stone, margin: 0 }}>{o.vendor} · {o.qty} {o.unit} · Ordered: {o.date}</p>
                    </div>
                    <p style={{ ...serif, fontSize: 20, color: dark, margin: 0 }}>{fmtINR(o.amount)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Cart / Quote panel */}
      {cartOpen && (
        <div style={{ width: 360, background: '#fff', borderLeft: `1px solid ${bdr}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ ...serif, fontSize: 18, fontWeight: 300, color: dark, margin: 0 }}>Procurement Quote</p>
            <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: stone, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {cart.length === 0 ? (
              <p style={{ ...serif, fontSize: 16, fontWeight: 300, color: '#a8a29e', textAlign: 'center', marginTop: 40 }}>Add products to build your quote</p>
            ) : (
              cart.map(item => (
                <div key={item.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${bdr}` }}>
                  <p style={{ ...serif, fontSize: 13, fontWeight: 300, color: dark, margin: '0 0 4px' }}>{item.name}</p>
                  <p style={{ ...sans, fontSize: 10, color: stone, margin: '0 0 8px' }}>{item.brand} · Lead: {item.lead}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 24, height: 24, background: light, border: `1px solid ${bdr}`, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ ...sans, fontSize: 12, color: dark, minWidth: 30, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 24, height: 24, background: light, border: `1px solid ${bdr}`, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      <span style={{ ...sans, fontSize: 10, color: stone }}>{item.unit}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ ...serif, fontSize: 14, color: dark, margin: 0 }}>{fmtINR(item.price * item.qty)}</p>
                      <button onClick={() => removeFromCart(item.id)} style={{ ...sans, fontSize: 9, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${bdr}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ ...sans, fontSize: 11, color: stone }}>Subtotal</span>
                <span style={{ ...sans, fontSize: 11, color: dark }}>{fmtINR(cartTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${bdr}` }}>
                <span style={{ ...sans, fontSize: 11, color: stone }}>GST (18%)</span>
                <span style={{ ...sans, fontSize: 11, color: dark }}>{fmtINR(cartTotal * 0.18)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ ...serif, fontSize: 16, color: dark }}>Total</span>
                <span style={{ ...serif, fontSize: 20, color: gold }}>{fmtINR(cartTotal * 1.18)}</span>
              </div>
              <button style={{ ...sans, width: '100%', padding: '11px', background: gold, border: 'none', color: '#000', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 8 }}>
                Generate PO
              </button>
              <Link to="/financial" style={{ ...sans, display: 'block', width: '100%', padding: '10px', background: 'none', border: `1px solid ${bdr}`, color: stone, fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
                Add to Project Quote →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
