import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY

// ── Preset swatches ───────────────────────────────────────────────
const PALETTES = [
  { name: 'Ivory & Teak',       colours: ['#f5f0e8','#c4a882','#8b7355','#3d2b1f','#1c1917'] },
  { name: 'Midnight Gold',      colours: ['#1c1917','#292524','#57534e','#c9a227','#f5e6a3'] },
  { name: 'Sage & Stone',       colours: ['#d4e6d0','#8fad8a','#57534e','#e7e5e4','#fafaf9'] },
  { name: 'Terracotta Bloom',   colours: ['#c4723a','#e8956d','#f5dcc8','#8b4513','#2d1e0f'] },
  { name: 'Indigo Heritage',    colours: ['#1e3a5f','#2d5a8e','#7ba7bc','#c4b49a','#f5efe8'] },
  { name: 'Blush & Marble',     colours: ['#f7d6d0','#e8a89c','#c9877a','#8b5a52','#1c1917'] },
]

// ── Preset tiles ──────────────────────────────────────────────────
const TILES = [
  { id: 't1',  type: 'material', label: 'Italian Carrara Marble',  bg: '#e8e4e0', accent: '#a8a29e', w: 2, h: 1 },
  { id: 't2',  type: 'material', label: 'Golden Teak Veneer',      bg: '#8b6914', accent: '#c9a227', w: 1, h: 1 },
  { id: 't3',  type: 'material', label: 'Brushed Brass',           bg: '#c9a227', accent: '#8b6914', w: 1, h: 1 },
  { id: 't4',  type: 'colour',   label: '#1c1917',                 bg: '#1c1917', accent: '#c9a227', w: 1, h: 2 },
  { id: 't5',  type: 'material', label: 'Linen Upholstery',        bg: '#d4c4a0', accent: '#8b7355', w: 2, h: 1 },
  { id: 't6',  type: 'colour',   label: '#f5f0e8',                 bg: '#f5f0e8', accent: '#c4a882', w: 1, h: 1 },
  { id: 't7',  type: 'material', label: 'Rattan Weave',            bg: '#c4a260', accent: '#5c3d11', w: 1, h: 1 },
  { id: 't8',  type: 'material', label: 'Smoked Glass',            bg: '#2d3748', accent: '#718096', w: 2, h: 1 },
  { id: 't9',  type: 'colour',   label: '#c9a227',                 bg: '#c9a227', accent: '#1c1917', w: 1, h: 1 },
  { id: 't10', type: 'material', label: 'Jade Onyx Stone',         bg: '#2d6a4f', accent: '#52b788', w: 1, h: 1 },
  { id: 't11', type: 'material', label: 'Terracotta Tile',         bg: '#c4723a', accent: '#8b4513', w: 1, h: 1 },
  { id: 't12', type: 'material', label: 'Hammered Copper',         bg: '#b87333', accent: '#7a4a1e', w: 2, h: 1 },
]

const FURNITURE = [
  { id: 'f1',  label: 'Chester Sofa',         cat: 'Seating',  icon: '🛋', price: '₹1,85,000' },
  { id: 'f2',  label: 'Wardrobe — Shaker',    cat: 'Storage',  icon: '◧',  price: '₹2,20,000' },
  { id: 'f3',  label: 'Dining Table — Oval',  cat: 'Dining',   icon: '⬡',  price: '₹95,000'  },
  { id: 'f4',  label: 'Floor Lamp — Arc',     cat: 'Lighting', icon: '☼',  price: '₹18,000'  },
  { id: 'f5',  label: 'Accent Chair',         cat: 'Seating',  icon: '◉',  price: '₹48,000'  },
  { id: 'f6',  label: 'Bookshelf — Modular',  cat: 'Storage',  icon: '◈',  price: '₹65,000'  },
  { id: 'f7',  label: 'Platform Bed — King',  cat: 'Bedroom',  icon: '▭',  price: '₹1,10,000' },
  { id: 'f8',  label: 'Pendant Light',        cat: 'Lighting', icon: '◎',  price: '₹24,000'  },
]

async function aiGenerateBoard(prompt) {
  if (!GEMINI_KEY) {
    return {
      board_name: 'Contemporary Indian Luxe',
      palette: ['#1c1917','#c9a227','#f5f0e8','#8b7355','#e8dcc8'],
      palette_names: ['Charcoal', 'Gold', 'Ivory', 'Teak', 'Linen'],
      description: 'A mood board anchored in warm neutrals with gold accents. Natural materials — teak, brass, linen — blend with contemporary silhouettes. The result is a space that feels curated but deeply comfortable.',
      keywords: ['Warm', 'Bespoke', 'Natural', 'Luxe', 'Grounded'],
      materials: ['Teak wood', 'Brushed brass', 'Italian marble', 'Linen upholstery'],
      tiles: ['t1','t2','t3','t6'],
      furniture: ['f1','f7','f4'],
    }
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{ role:'user', parts:[{ text:`Create an interior design mood board concept for: "${prompt}". Return JSON: { board_name, palette (5 hex codes), palette_names (5 names), description (2 sentences), keywords (5 words), materials (4 items), tiles (4 tile ids from: t1-t12), furniture (3 furniture ids from: f1-f8) }. No markdown.` }] }], generationConfig:{ temperature:0.8, maxOutputTokens:512 } }) }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return JSON.parse(text.replace(/```json|```/g,'').trim())
}

// ── Tile component ────────────────────────────────────────────────
function Tile({ tile, onRemove, dragging }) {
  return (
    <div style={{ gridColumn: `span ${tile.w}`, gridRow: `span ${tile.h}`, background: tile.bg, position: 'relative', cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 14, minHeight: tile.h === 2 ? 200 : 95, border: dragging ? `2px solid ${gold}` : '2px solid transparent', transition: 'border-color 0.15s' }}>
      <div style={{ position: 'absolute', top: 8, right: 8 }}>
        <button onClick={onRemove} style={{ width: 22, height: 22, background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      {tile.type === 'material' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 9px)` }} />
          <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tile.accent, position: 'relative', background: 'rgba(0,0,0,0.3)', padding: '3px 8px' }}>{tile.label}</span>
        </>
      )}
      {tile.type === 'colour' && (
        <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: tile.accent }}>{tile.label}</span>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function MoodBoardPage() {
  const [boardName,  setBoardName]  = useState('My Mood Board')
  const [boardTiles, setBoardTiles] = useState(['t1','t2','t3','t6','t5'])
  const [palette,    setPalette]    = useState(PALETTES[0].colours)
  const [paletteName,setPName]      = useState(PALETTES[0].name)
  const [furniture,  setFurniture]  = useState(['f1','f7'])
  const [notes,      setNotes]      = useState('')
  const [aiPrompt,   setAiPrompt]   = useState('')
  const [aiLoading,  setAiLoading]  = useState(false)
  const [aiPanel,    setAiPanel]    = useState(false)
  const [tab,        setTab]        = useState('board')  // board | library

  async function generateBoard() {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    const result = await aiGenerateBoard(aiPrompt).catch(() => null)
    if (result) {
      setBoardName(result.board_name || boardName)
      if (result.palette?.length) setPalette(result.palette)
      if (result.tiles?.length)   setBoardTiles(result.tiles.filter(id => TILES.find(t => t.id === id)))
      if (result.furniture?.length) setFurniture(result.furniture.filter(id => FURNITURE.find(f => f.id === id)))
      setNotes(result.description || '')
    }
    setAiLoading(false)
    setAiPanel(false)
  }

  function addTile(id) { if (!boardTiles.includes(id)) setBoardTiles(b => [...b, id]) }
  function removeTile(id) { setBoardTiles(b => b.filter(x => x !== id)) }
  function addFurni(id) { if (!furniture.includes(id)) setFurniture(f => [...f, id]) }
  function removeFurni(id) { setFurniture(f => f.filter(x => x !== id)) }

  const boardTileObjs  = boardTiles.map(id => TILES.find(t => t.id === id)).filter(Boolean)
  const boardFurniObjs = furniture.map(id => FURNITURE.find(f => f.id === id)).filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: light, ...sans }}>
      {/* Header */}
      <header style={{ height: 64, background: dark, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, borderBottom: '1px solid #292524', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ width: 28, height: 28, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none"/></svg>
        </div>
        <input value={boardName} onChange={e => setBoardName(e.target.value)}
          style={{ ...serif, fontSize: 18, fontWeight: 300, color: '#fff', background: 'none', border: 'none', outline: 'none', flex: 1, maxWidth: 340 }} />
        <div style={{ flex: 1 }} />
        <button onClick={() => setAiPanel(p => !p)}
          style={{ ...sans, padding: '7px 18px', background: `${gold}20`, border: `1px solid ${gold}`, color: gold, fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
          ✦ AI Generate
        </button>
        <button onClick={() => window.print()}
          style={{ ...sans, padding: '7px 18px', background: 'none', border: `1px solid #57534e`, color: '#78716c', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Export
        </button>
        <Link to="/dashboard" style={{ ...sans, fontSize: 10, color: '#78716c', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back</Link>
      </header>

      {/* AI panel */}
      {aiPanel && (
        <div style={{ background: dark, borderBottom: `1px solid #292524`, padding: '16px 28px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Describe your vision — e.g. 'cosy Japandi bedroom with warm neutrals and natural wood'…"
            style={{ ...sans, flex: 1, padding: '10px 16px', background: '#292524', border: `1px solid #3d3936`, color: '#e7e5e4', fontSize: 13 }} />
          <button onClick={generateBoard} disabled={aiLoading || !aiPrompt.trim()}
            style={{ ...sans, padding: '10px 24px', background: aiPrompt.trim() ? gold : '#3d3936', border: 'none', color: aiPrompt.trim() ? '#000' : '#78716c', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: aiPrompt.trim() ? 'pointer' : 'default' }}>
            {aiLoading ? 'Generating…' : 'Generate →'}
          </button>
          <button onClick={() => setAiPanel(false)} style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${bdr}`, display: 'flex', padding: '0 28px', gap: 0 }}>
        {[['board','Mood Board'],['library','Material Library']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ ...sans, padding: '14px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${tab===id?gold:'transparent'}`, color: tab===id?gold:stone, fontWeight: tab===id?700:400, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 'calc(100vh - 120px)' }}>

        {/* Main canvas */}
        <div style={{ padding: 28, borderRight: `1px solid ${bdr}` }}>
          {tab === 'board' && (
            <>
              {/* Colour palette strip */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone }}>{paletteName}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {PALETTES.map(p => (
                      <button key={p.name} onClick={() => { setPalette(p.colours); setPName(p.name) }}
                        style={{ display: 'flex', gap: 2, padding: 2, border: `1px solid ${p.name === paletteName ? gold : bdr}`, cursor: 'pointer', background: 'none' }}>
                        {p.colours.slice(0,3).map((c,i) => <div key={i} style={{ width: 12, height: 12, background: c }} />)}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', height: 48 }}>
                  {palette.map((c, i) => (
                    <div key={i} style={{ flex: 1, background: c, position: 'relative' }}>
                      <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', ...sans, fontSize: 8, color: i < 2 ? '#a8a29e' : '#57534e', whiteSpace: 'nowrap' }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material tiles grid */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 12px' }}>Materials & Textures</p>
                {boardTileObjs.length === 0 ? (
                  <div style={{ height: 200, border: `1px dashed ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ ...serif, fontSize: 18, fontWeight: 300, color: '#a8a29e' }}>Add tiles from the library →</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, gridAutoRows: '95px' }}>
                    {boardTileObjs.map(t => <Tile key={t.id} tile={t} onRemove={() => removeTile(t.id)} />)}
                  </div>
                )}
              </div>

              {/* Furniture items */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 12px' }}>Furniture Selection</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {boardFurniObjs.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', border: `1px solid ${bdr}` }}>
                      <span style={{ fontSize: 20 }}>{f.icon}</span>
                      <div>
                        <p style={{ ...sans, fontSize: 11, fontWeight: 600, color: dark, margin: '0 0 2px' }}>{f.label}</p>
                        <p style={{ ...sans, fontSize: 10, color: stone, margin: 0 }}>{f.cat} · {f.price}</p>
                      </div>
                      <button onClick={() => removeFurni(f.id)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>✕</button>
                    </div>
                  ))}
                  {boardFurniObjs.length === 0 && <p style={{ ...sans, fontSize: 12, color: '#a8a29e' }}>Add furniture from the library →</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 8px' }}>Design Notes</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add your design concept, client brief, or inspirational notes…" rows={4}
                  style={{ ...sans, width: '100%', padding: '10px 14px', border: `1px solid ${bdr}`, fontSize: 13, color: dark, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.65, background: '#fff' }} />
              </div>
            </>
          )}

          {tab === 'library' && (
            <div>
              <p style={{ ...serif, fontSize: 24, fontWeight: 300, color: dark, margin: '0 0 20px' }}>Material Library</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
                {TILES.map(t => {
                  const inBoard = boardTiles.includes(t.id)
                  return (
                    <div key={t.id} style={{ overflow: 'hidden', border: `1px solid ${inBoard ? gold : bdr}` }}>
                      <div style={{ height: 80, background: t.bg, position: 'relative' }}>
                        {inBoard && (
                          <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 10, color: '#000' }}>✓</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 7px)` }} />
                      </div>
                      <div style={{ padding: '8px 10px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ ...sans, fontSize: 10, color: dark }}>{t.label}</span>
                        <button onClick={() => inBoard ? removeTile(t.id) : addTile(t.id)}
                          style={{ ...sans, fontSize: 9, fontWeight: 700, color: inBoard ? '#ef4444' : gold, background: 'none', border: `1px solid ${inBoard ? '#ef4444' : gold}`, padding: '2px 8px', cursor: 'pointer', letterSpacing: '0.1em' }}>
                          {inBoard ? 'Remove' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p style={{ ...serif, fontSize: 24, fontWeight: 300, color: dark, margin: '0 0 16px' }}>Furniture Catalogue</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {FURNITURE.map(f => {
                  const inBoard = furniture.includes(f.id)
                  return (
                    <div key={f.id} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: '#fff', border: `1px solid ${inBoard ? gold : bdr}`, alignItems: 'center' }}>
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ ...sans, fontSize: 12, fontWeight: 500, color: dark, margin: '0 0 2px' }}>{f.label}</p>
                        <p style={{ ...sans, fontSize: 10, color: stone, margin: 0 }}>{f.cat} · {f.price}</p>
                      </div>
                      <button onClick={() => inBoard ? removeFurni(f.id) : addFurni(f.id)}
                        style={{ ...sans, fontSize: 9, fontWeight: 700, color: inBoard ? '#ef4444' : gold, background: 'none', border: `1px solid ${inBoard ? '#ef4444' : gold}`, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.1em', flexShrink: 0 }}>
                        {inBoard ? 'Remove' : '+ Add'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ padding: 20, background: '#fff' }}>
          <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 16px' }}>Board Summary</p>

          <div style={{ background: dark, padding: '16px 18px', marginBottom: 16 }}>
            <p style={{ ...serif, fontSize: 16, fontWeight: 300, color: '#fff', margin: '0 0 4px' }}>{boardName}</p>
            <p style={{ ...sans, fontSize: 10, color: '#57534e', margin: 0 }}>{boardTiles.length} materials · {furniture.length} furniture</p>
          </div>

          {/* Mini palette */}
          <div style={{ display: 'flex', height: 32, marginBottom: 16 }}>
            {palette.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
          </div>

          {/* Colour picker */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 10px' }}>Colour Swatches</p>
            {PALETTES.map(p => (
              <button key={p.name} onClick={() => { setPalette(p.colours); setPName(p.name) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', background: p.name === paletteName ? `${gold}12` : 'transparent', border: `1px solid ${p.name === paletteName ? gold : bdr}`, cursor: 'pointer', marginBottom: 6 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {p.colours.map((c, i) => <div key={i} style={{ width: 14, height: 14, background: c }} />)}
                </div>
                <span style={{ ...sans, fontSize: 10, color: dark }}>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Cost estimate */}
          <div style={{ borderTop: `1px solid ${bdr}`, paddingTop: 16, marginBottom: 16 }}>
            <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 10px' }}>Estimated Cost</p>
            {boardFurniObjs.map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ ...sans, fontSize: 11, color: stone }}>{f.label}</span>
                <span style={{ ...sans, fontSize: 11, color: dark }}>{f.price}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${bdr}`, paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ ...serif, fontSize: 14, color: dark }}>Furniture Total</span>
              <span style={{ ...serif, fontSize: 16, color: gold }}>
                ₹{boardFurniObjs.reduce((s, f) => s + parseInt(f.price.replace(/[₹,]/g, '')), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button style={{ ...sans, width: '100%', padding: '11px', background: gold, border: 'none', color: '#000', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => window.print()}>
            Export Board
          </button>
          <Link to="/financial" style={{ ...sans, display: 'block', width: '100%', padding: '10px', background: 'none', border: `1px solid ${bdr}`, color: stone, fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', textAlign: 'center', marginTop: 8 }}>
            Build Quote →
          </Link>
        </div>
      </div>
    </div>
  )
}
