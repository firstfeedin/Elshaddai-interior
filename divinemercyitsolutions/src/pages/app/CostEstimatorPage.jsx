import { useState } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'
const GEMINI = import.meta.env.VITE_GEMINI_API_KEY

// ── City cost multipliers (base: Chennai = 1.0) ───────────────────
const CITY_MULT = {
  Chennai: 1.0, Coimbatore: 0.88, Madurai: 0.84,
  Bangalore: 1.18, Hyderabad: 1.08, Kochi: 0.97,
  Mumbai: 1.45, Delhi: 1.35, Pune: 1.20,
}

// ── Room-type base rates (₹/sqft) ────────────────────────────────
const ROOM_RATES = {
  'Living Room':      { basic: 850, premium: 1600, luxury: 2800 },
  'Master Bedroom':   { basic: 950, premium: 1750, luxury: 3000 },
  'Kids Bedroom':     { basic: 750, premium: 1400, luxury: 2400 },
  'Kitchen':          { basic: 1200, premium: 2200, luxury: 3800 },
  'Bathroom / Toilet':{ basic: 900, premium: 1800, luxury: 3200 },
  'Dining Area':      { basic: 700, premium: 1200, luxury: 2000 },
  'Study / Office':   { basic: 800, premium: 1500, luxury: 2600 },
  'Pooja Room':       { basic: 600, premium: 1100, luxury: 1900 },
  'Balcony / Utility':{ basic: 400, premium: 700, luxury: 1200 },
}

const FINISH_LABELS = { basic: 'Standard', premium: 'Premium', luxury: 'Luxury' }
const FINISH_DESC   = {
  basic:   'Laminate wardrobes, vitrified tiles, standard paint, budget-friendly fittings',
  premium: 'PU-finish wardrobes, Italian marble options, textured paints, branded fittings',
  luxury:  'Lacquered glass, imported marble, wallpapers, designer lighting, bespoke furniture',
}

const CITIES = Object.keys(CITY_MULT)
const ROOM_TYPES = Object.keys(ROOM_RATES)

// ── Demo estimator ────────────────────────────────────────────────
function computeEstimate(rooms, finish, city, extras) {
  const mult = CITY_MULT[city] || 1.0
  let materialCost = 0, labourCost = 0, designCost = 0
  const breakdown = []

  rooms.forEach(r => {
    if (!r.type || !r.area) return
    const rate = ROOM_RATES[r.type]?.[finish] || 1000
    const roomTotal = rate * parseFloat(r.area) * mult
    const mat  = roomTotal * 0.55
    const lab  = roomTotal * 0.30
    const des  = roomTotal * 0.15
    materialCost += mat
    labourCost   += lab
    designCost   += des
    breakdown.push({ room: r.type, area: r.area, rate: Math.round(rate * mult), total: Math.round(roomTotal), mat: Math.round(mat), lab: Math.round(lab), des: Math.round(des) })
  })

  let extrasCost = 0
  const extrasBreakdown = []
  if (extras.falseCeiling) {
    const totalArea = rooms.reduce((s,r) => s + (parseFloat(r.area)||0), 0)
    const fc = totalArea * 180 * mult
    extrasCost += fc
    extrasBreakdown.push({ item:'False Ceiling (all rooms)', cost: Math.round(fc) })
  }
  if (extras.ac) {
    const acCost = rooms.length * 45000
    extrasCost += acCost
    extrasBreakdown.push({ item:`AC Points & Ducting (${rooms.length} rooms)`, cost: acCost })
  }
  if (extras.homeAutomation) {
    const haCost = 85000 * mult
    extrasCost += haCost
    extrasBreakdown.push({ item:'Home Automation — lights & curtains', cost: Math.round(haCost) })
  }
  if (extras.smartLighting) {
    const slCost = rooms.length * 18000
    extrasCost += slCost
    extrasBreakdown.push({ item:'Designer Lighting Package', cost: slCost })
  }

  const subtotal = materialCost + labourCost + designCost + extrasCost
  const gst      = subtotal * 0.18
  const total    = subtotal + gst

  const totalSqft = rooms.reduce((s,r) => s + (parseFloat(r.area)||0), 0)
  const perSqft   = totalSqft > 0 ? Math.round(total / totalSqft) : 0

  return {
    breakdown, extrasBreakdown,
    materialCost: Math.round(materialCost),
    labourCost:   Math.round(labourCost),
    designCost:   Math.round(designCost),
    extrasCost:   Math.round(extrasCost),
    subtotal:     Math.round(subtotal),
    gst:          Math.round(gst),
    total:        Math.round(total),
    totalSqft,
    perSqft,
    finish: FINISH_LABELS[finish],
    city,
  }
}

async function aiEstimate(rooms, finish, city, extras, notes) {
  if (!GEMINI) return computeEstimate(rooms, finish, city, extras)
  const prompt = `You are an interior design cost estimator for India. Provide a detailed, realistic cost estimate.

Project:
- City: ${city}
- Finish Level: ${FINISH_LABELS[finish]} (${FINISH_DESC[finish]})
- Rooms: ${rooms.map(r => `${r.type} — ${r.area} sqft`).join(', ')}
- Extras: ${Object.entries(extras).filter(([,v])=>v).map(([k])=>k).join(', ') || 'None'}
- Notes: ${notes || 'None'}

Return JSON only:
{
  "breakdown": [{ "room": "Room Name", "area": number, "rate": number, "total": number, "mat": number, "lab": number, "des": number }],
  "extrasBreakdown": [{ "item": "description", "cost": number }],
  "materialCost": number,
  "labourCost": number,
  "designCost": number,
  "extrasCost": number,
  "subtotal": number,
  "gst": number,
  "total": number,
  "totalSqft": number,
  "perSqft": number,
  "finish": "${FINISH_LABELS[finish]}",
  "city": "${city}",
  "ai_insight": "2-3 sentence insight on budget optimisation for this project"
}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI}`,
    { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{role:'user',parts:[{text:prompt}]}], generationConfig:{temperature:0.3,maxOutputTokens:1200} }) }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  const parsed = JSON.parse(text.replace(/```json|```/g,'').trim())
  return { ...computeEstimate(rooms, finish, city, extras), ...parsed }
}

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

function CostBar({ label, value, total, color }) {
  const pct = total > 0 ? (value / total * 100).toFixed(1) : 0
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ ...sans, fontSize:11, color:dark }}>{label}</span>
        <span style={{ ...sans, fontSize:11, color:dark, fontWeight:600 }}>{fmt(value)} <span style={{ color:stone, fontWeight:400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height:6, background:bdr }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, transition:'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export default function CostEstimatorPage() {
  const [rooms,   setRooms]   = useState([{ type:'Living Room', area:'300' }, { type:'Master Bedroom', area:'180' }, { type:'Kitchen', area:'120' }])
  const [finish,  setFinish]  = useState('premium')
  const [city,    setCity]    = useState('Chennai')
  const [extras,  setExtras]  = useState({ falseCeiling:false, ac:false, homeAutomation:false, smartLighting:false })
  const [notes,   setNotes]   = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  function addRoom() { setRooms(r => [...r, { type:'Bedroom', area:'' }]) }
  function removeRoom(i) { setRooms(r => r.filter((_,idx) => idx !== i)) }
  function updateRoom(i, field, val) { setRooms(r => r.map((rm, idx) => idx===i ? {...rm,[field]:val} : rm)) }

  async function estimate() {
    const validRooms = rooms.filter(r => r.type && parseFloat(r.area) > 0)
    if (!validRooms.length) return
    setLoading(true)
    const res = await aiEstimate(validRooms, finish, city, extras, notes).catch(() => computeEstimate(validRooms, finish, city, extras))
    setResult(res)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M3 17L8 7l4 6 3-4 3 5" stroke={gold} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Smart Cost <span style={{ color:gold }}>Estimator</span></p>
        <div style={{ flex:1 }} />
        {result && <button onClick={() => setResult(null)} style={{ ...sans, padding:'6px 16px', background:'none', border:`1px solid #57534e`, color:'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Reset</button>}
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ padding:32, display:'grid', gridTemplateColumns: result ? '380px 1fr' : '1fr', gap:24, maxWidth:1280, margin:'0 auto' }}>
        {/* Form */}
        <div>
          <p style={{ ...serif, fontSize: result ? 24 : 44, fontWeight:300, color:dark, margin:'0 0 6px' }}>
            {result ? 'Estimate Parameters' : 'Get Your Project Cost Estimate'}
          </p>
          {!result && <p style={{ ...sans, fontSize:13, color:stone, margin:'0 0 28px', lineHeight:1.7 }}>
            Enter your room details and preferences. AI predicts material, labour, and design costs — instantly. {!GEMINI && <span style={{ color:gold }}>Demo mode.</span>}
          </p>}

          {/* Finish level */}
          <div style={{ marginBottom:20 }}>
            <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:8 }}>Finish Level</label>
            <div style={{ display:'flex', gap:0 }}>
              {Object.entries(FINISH_LABELS).map(([key,label]) => (
                <button key={key} onClick={() => setFinish(key)}
                  style={{ flex:1, padding:'10px', border:`1px solid ${finish===key?gold:bdr}`, background:finish===key?`${gold}12`:'#fff', color:finish===key?dark:stone, ...sans, fontSize:11, fontWeight:finish===key?700:400, cursor:'pointer', letterSpacing:'0.05em' }}>
                  {label}
                </button>
              ))}
            </div>
            <p style={{ ...sans, fontSize:10, color:stone, margin:'6px 0 0', lineHeight:1.6 }}>{FINISH_DESC[finish]}</p>
          </div>

          {/* City */}
          <div style={{ marginBottom:20 }}>
            <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>City</label>
            <select value={city} onChange={e => setCity(e.target.value)}
              style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, background:'#fff' }}>
              {CITIES.map(c => <option key={c} value={c}>{c} {CITY_MULT[c] !== 1.0 ? `(${CITY_MULT[c] > 1 ? '+' : ''}${Math.round((CITY_MULT[c]-1)*100)}%)` : '(base)'}</option>)}
            </select>
          </div>

          {/* Rooms */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone }}>Rooms</label>
              <button onClick={addRoom} style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', background:'none', border:`1px solid ${gold}`, color:gold, padding:'4px 12px', cursor:'pointer' }}>+ Add Room</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {rooms.map((r, i) => (
                <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <select value={r.type} onChange={e => updateRoom(i,'type',e.target.value)}
                    style={{ ...sans, flex:2, padding:'8px 10px', border:`1px solid ${bdr}`, fontSize:11, color:dark, background:'#fff' }}>
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div style={{ position:'relative', flex:1 }}>
                    <input type="number" value={r.area} onChange={e => updateRoom(i,'area',e.target.value)} placeholder="sqft"
                      style={{ ...sans, width:'100%', padding:'8px 36px 8px 10px', border:`1px solid ${bdr}`, fontSize:11, color:dark, boxSizing:'border-box' }} />
                    <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', ...sans, fontSize:9, color:stone }}>sqft</span>
                  </div>
                  <button onClick={() => removeRoom(i)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16, padding:'0 4px', flexShrink:0 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div style={{ marginBottom:20 }}>
            <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:8 }}>Add-Ons</label>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                ['falseCeiling',   'False Ceiling (all rooms)',        '~₹180/sqft'],
                ['ac',             'AC Points & Ducting',              '~₹45,000/room'],
                ['homeAutomation', 'Home Automation (lights, curtains)', '~₹85,000'],
                ['smartLighting',  'Designer Lighting Package',        '~₹18,000/room'],
              ].map(([key,label,hint]) => (
                <label key={key} style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer', padding:'9px 12px', border:`1px solid ${extras[key]?gold:bdr}`, background:extras[key]?`${gold}08`:'#fff' }}>
                  <div onClick={() => setExtras(e => ({...e,[key]:!e[key]}))}
                    style={{ width:16, height:16, border:`2px solid ${extras[key]?gold:bdr}`, background:extras[key]?gold:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {extras[key] && <span style={{ fontSize:10, color:'#000', fontWeight:700, lineHeight:1 }}>✓</span>}
                  </div>
                  <span style={{ ...sans, fontSize:11, color:dark, flex:1 }}>{label}</span>
                  <span style={{ ...sans, fontSize:10, color:stone }}>{hint}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom:20 }}>
            <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>Special Requirements</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              style={{ ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:11, color:dark, resize:'vertical', boxSizing:'border-box', lineHeight:1.6 }}
              placeholder="e.g. imported marble only in living room; existing civil work done; vastu-compliant layout…" />
          </div>

          <button onClick={estimate} disabled={loading || !rooms.some(r => parseFloat(r.area)>0)}
            style={{ ...sans, width:'100%', padding:'13px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
            {loading ? 'Calculating…' : '✦ Estimate Cost →'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div>
            {/* Total hero */}
            <div style={{ background:dark, padding:'28px 32px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:gold, margin:'0 0 6px' }}>Estimated Total</p>
                <p style={{ ...serif, fontSize:52, fontWeight:300, color:'#fff', margin:0, lineHeight:1 }}>{fmt(result.total)}</p>
                <p style={{ ...sans, fontSize:11, color:'#78716c', margin:'6px 0 0' }}>incl. 18% GST · {result.finish} finish · {result.city}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ ...serif, fontSize:32, fontWeight:300, color:gold, margin:0 }}>{fmt(result.perSqft)}<span style={{ fontSize:14, color:stone }}>/sqft</span></p>
                <p style={{ ...sans, fontSize:10, color:'#78716c', margin:'4px 0 0' }}>{result.totalSqft} sqft total</p>
              </div>
            </div>

            {/* Cost breakdown bars */}
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px', marginBottom:16 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 16px' }}>Cost Breakdown</p>
              <CostBar label="Materials & Products" value={result.materialCost} total={result.total} color={gold} />
              <CostBar label="Labour & Installation" value={result.labourCost}  total={result.total} color='#8b7355' />
              <CostBar label="Design Fees"           value={result.designCost}  total={result.total} color='#57534e' />
              {result.extrasCost > 0 && <CostBar label="Add-Ons"             value={result.extrasCost} total={result.total} color='#3d2b1f' />}
              <CostBar label="GST (18%)"             value={result.gst}         total={result.total} color='#292524' />
            </div>

            {/* Payment milestones */}
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px', marginBottom:16 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 16px' }}>Suggested Payment Milestones</p>
              {[
                ['On Agreement', 0.30, 'Design commencement + procurement start'],
                ['On Design Approval', 0.20, 'Before material procurement'],
                ['On Site Start', 0.25, 'Civil & fabrication work begins'],
                ['On 80% Completion', 0.15, 'Furniture installation starts'],
                ['On Handover', 0.10, 'Final snagging cleared'],
              ].map(([stage, pct, note]) => (
                <div key={stage} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 0', borderBottom:`1px solid ${bdr}` }}>
                  <div>
                    <p style={{ ...sans, fontSize:11.5, color:dark, margin:'0 0 2px', fontWeight:600 }}>{stage}</p>
                    <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{note}</p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, marginLeft:16 }}>
                    <p style={{ ...sans, fontSize:13, color:dark, margin:'0 0 2px', fontWeight:700 }}>{fmt(Math.round(result.total * pct))}</p>
                    <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{(pct*100).toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Room breakdown table */}
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px', marginBottom:16 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 12px' }}>Room-wise Breakdown</p>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${bdr}` }}>
                    {['Room','Area','Rate/sqft','Materials','Labour','Design','Total'].map(h => (
                      <th key={h} style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, padding:'6px 10px', textAlign:h==='Room'?'left':'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((r,i) => (
                    <tr key={i} style={{ borderBottom:`1px solid ${bdr}` }}>
                      <td style={{ ...sans, fontSize:11, color:dark, padding:'9px 10px' }}>{r.room}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'9px 10px', textAlign:'right' }}>{r.area}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'9px 10px', textAlign:'right' }}>₹{r.rate.toLocaleString('en-IN')}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'9px 10px', textAlign:'right' }}>{fmt(r.mat)}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'9px 10px', textAlign:'right' }}>{fmt(r.lab)}</td>
                      <td style={{ ...sans, fontSize:11, color:stone, padding:'9px 10px', textAlign:'right' }}>{fmt(r.des)}</td>
                      <td style={{ ...sans, fontSize:12, color:dark, padding:'9px 10px', textAlign:'right', fontWeight:700 }}>{fmt(r.total)}</td>
                    </tr>
                  ))}
                  {result.extrasBreakdown.map((e,i) => (
                    <tr key={`ex-${i}`} style={{ borderBottom:`1px solid ${bdr}`, background:`${gold}06` }}>
                      <td colSpan={6} style={{ ...sans, fontSize:11, color:stone, padding:'9px 10px', fontStyle:'italic' }}>{e.item}</td>
                      <td style={{ ...sans, fontSize:12, color:dark, padding:'9px 10px', textAlign:'right', fontWeight:700 }}>{fmt(e.cost)}</td>
                    </tr>
                  ))}
                  <tr style={{ background:dark }}>
                    <td colSpan={6} style={{ ...sans, fontSize:11, fontWeight:700, color:'#e7e5e4', padding:'10px 10px', letterSpacing:'0.05em', textTransform:'uppercase' }}>Total (incl. GST)</td>
                    <td style={{ ...serif, fontSize:16, fontWeight:300, color:gold, padding:'10px 10px', textAlign:'right' }}>{fmt(result.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI insight */}
            {result.ai_insight && (
              <div style={{ background:`${gold}10`, border:`1px solid ${gold}40`, padding:'16px 20px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:gold, margin:'0 0 8px' }}>✦ AI Insight</p>
                <p style={{ ...sans, fontSize:12, color:dark, margin:0, lineHeight:1.75 }}>{result.ai_insight}</p>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              <Link to="/financial" style={{ ...sans, flex:1, padding:'12px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', textDecoration:'none', textAlign:'center' }}>
                Create Quote →
              </Link>
              <Link to="/schedule-builder" style={{ ...sans, flex:1, padding:'12px', background:'#fff', border:`1px solid ${bdr}`, color:dark, fontWeight:700, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', textDecoration:'none', textAlign:'center' }}>
                Build Schedule →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
