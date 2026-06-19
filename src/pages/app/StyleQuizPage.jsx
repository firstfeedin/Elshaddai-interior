import { useState } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY

// ── Quiz questions ────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'q1', label: 'What draws you in?',
    subtitle: 'Choose the aesthetic that speaks to you most.',
    type: 'image-grid',
    options: [
      { id: 'modern',       label: 'Clean & Minimal',     emoji: '⬜', desc: 'White walls, hidden storage, breathing room' },
      { id: 'traditional',  label: 'Rich & Classical',    emoji: '🏛', desc: 'Carved wood, deep tones, timeless elegance' },
      { id: 'contemporary', label: 'Bold & Eclectic',     emoji: '◆', desc: 'Mix of eras, statement pieces, artful chaos' },
      { id: 'industrial',   label: 'Raw & Textured',      emoji: '⚙', desc: 'Exposed brick, metal, honest materials' },
      { id: 'scandinavian', label: 'Warm & Functional',   emoji: '🌿', desc: 'Natural wood, hygge, purposeful living' },
      { id: 'luxury',       label: 'Opulent & Curated',   emoji: '✦', desc: 'Marble, gold accents, bespoke everything' },
    ],
  },
  {
    id: 'q2', label: 'Your colour world',
    subtitle: 'Pick the palette that feels like home.',
    type: 'colour-grid',
    options: [
      { id: 'neutral',   label: 'Warm Neutrals',    colours: ['#f5f0e8','#e8dcc8','#c4a882','#8b7355'] },
      { id: 'earthy',    label: 'Earth & Terracotta',colours: ['#c4723a','#8b4513','#d4956a','#f0c080'] },
      { id: 'monochrome',label: 'Black & White',    colours: ['#1c1917','#57534e','#a8a29e','#fafaf9'] },
      { id: 'jewel',     label: 'Jewel Tones',      colours: ['#1e3a5f','#2d6a4f','#6b2d5e','#c9a227'] },
      { id: 'pastel',    label: 'Soft Pastels',     colours: ['#f8d7da','#d4edda','#d1ecf1','#fff3cd'] },
      { id: 'bold',      label: 'Bold & Dramatic',  colours: ['#1a1a2e','#c9a227','#e63946','#2d6a4f'] },
    ],
  },
  {
    id: 'q3', label: 'How do you live?',
    subtitle: 'Your lifestyle shapes your space.',
    type: 'multi-select',
    options: [
      { id: 'wfh',       label: 'Work from home',      icon: '💻' },
      { id: 'entertain', label: 'Love entertaining',   icon: '🥂' },
      { id: 'kids',      label: 'Children at home',    icon: '👶' },
      { id: 'pets',      label: 'Pets',                icon: '🐾' },
      { id: 'cook',      label: 'Serious cook',        icon: '🍳' },
      { id: 'minimal',   label: 'Minimalist at heart', icon: '○' },
      { id: 'collector', label: 'Art & collectibles',  icon: '🎨' },
      { id: 'reader',    label: 'Avid reader',         icon: '📚' },
    ],
  },
  {
    id: 'q4', label: 'What matters most in a room?',
    subtitle: 'Rank by dragging — or pick your top priority.',
    type: 'priority',
    options: [
      { id: 'light',    label: 'Natural light',   icon: '☀' },
      { id: 'storage',  label: 'Ample storage',   icon: '◧' },
      { id: 'comfort',  label: 'Comfort first',   icon: '♡' },
      { id: 'aesthetic',label: 'Visual beauty',   icon: '◈' },
      { id: 'tech',     label: 'Smart home tech', icon: '⚡' },
      { id: 'cost',     label: 'Value for money', icon: '◉' },
    ],
  },
  {
    id: 'q5', label: 'Budget range',
    subtitle: 'For a standard 3BHK interior (material + labour + design).',
    type: 'single-select',
    options: [
      { id: 'budget',   label: 'Under ₹10L',     desc: 'Modular furniture, standard finishes' },
      { id: 'mid',      label: '₹10L – ₹25L',    desc: 'Custom furniture, premium finishes' },
      { id: 'premium',  label: '₹25L – ₹50L',    desc: 'Bespoke design, Italian materials' },
      { id: 'luxury',   label: '₹50L+',          desc: 'No-limit luxury, fully curated' },
    ],
  },
  {
    id: 'q6', label: 'Inspiration images',
    subtitle: 'Which room makes your heart skip?',
    type: 'image-pick',
    options: [
      { id: 'r1', label: 'Japandi serenity',   bg: '#e8e0d4', accent: '#8b7355', pattern: 'bamboo'  },
      { id: 'r2', label: 'Art Deco glamour',   bg: '#1c1917', accent: '#c9a227', pattern: 'deco'    },
      { id: 'r3', label: 'Mediterranean blue', bg: '#c8d8e8', accent: '#1e3a5f', pattern: 'arch'    },
      { id: 'r4', label: 'Indian heritage',    bg: '#8b4513', accent: '#f0c080', pattern: 'heritage'},
    ],
  },
]

async function generateStyleProfile(answers) {
  const summary = QUESTIONS.map(q => {
    const ans = answers[q.id]
    if (!ans) return ''
    const opts = Array.isArray(ans) ? ans : [ans]
    const labels = opts.map(id => q.options.find(o => o.id === id)?.label).filter(Boolean).join(', ')
    return `${q.label}: ${labels}`
  }).filter(Boolean).join('\n')

  const prompt = `You are an expert interior design consultant. Based on this client style quiz:
${summary}

Generate a detailed personalised style profile in this exact JSON format:
{
  "primary_style": "One style name",
  "style_description": "2 sentences describing their aesthetic",
  "colour_palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "colour_names": ["Name1", "Name2", "Name3", "Name4", "Name5"],
  "key_materials": ["Material 1", "Material 2", "Material 3", "Material 4"],
  "furniture_style": "2 sentences about recommended furniture",
  "lighting": "1 sentence about lighting approach",
  "do_list": ["Do 1", "Do 2", "Do 3", "Do 4"],
  "dont_list": ["Don't 1", "Don't 2", "Don't 3"],
  "designer_note": "A warm, personal 2-sentence note from a designer to this client",
  "budget_guidance": "1 sentence budget allocation advice",
  "inspiration_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
Return only valid JSON, no markdown.`

  if (!GEMINI_KEY) {
    return {
      primary_style: 'Contemporary Indian Luxury',
      style_description: 'Your space celebrates the richness of Indian craftsmanship reimagined for the modern home — where bespoke joinery meets curated art and every corner tells a story. You value beauty that is liveable, spaces that breathe, and materials that age with grace.',
      colour_palette: ['#1c1917', '#c9a227', '#e8dcc8', '#8b4513', '#f5f0e8'],
      colour_names: ['Charcoal Black', 'Antique Gold', 'Warm Linen', 'Teak Brown', 'Ivory Cream'],
      key_materials: ['Solid teak wood', 'Handmade ceramic tiles', 'Antique brass fixtures', 'Natural stone (Kota / Jaisalmer)'],
      furniture_style: 'Low-profile custom furniture with clean silhouettes and hand-carved accents. Think charpai-inspired daybeds, jali-screen room dividers, and stone-topped dining tables.',
      lighting: 'Warm amber pendants at key focal points, concealed LED coves for ambience, and abundant natural light filtered through sheer cotton drapes.',
      do_list: ['Invest in one statement handcrafted piece per room', 'Use natural materials wherever possible', 'Layer textures — rough jute with smooth marble', 'Allow negative space to breathe'],
      dont_list: ['Avoid synthetic materials that age poorly', 'Don\'t overcrowd with furniture', 'Skip overly trendy pieces that date quickly'],
      designer_note: 'Your instinct for quality over quantity will serve you beautifully. We\'d love to help you build a home that is deeply personal, entirely yours, and still standing strong 30 years from now.',
      budget_guidance: 'Allocate 40% to furniture & joinery, 25% to flooring & finishes, 20% to civil & electrical, 15% to décor & lighting.',
      inspiration_keywords: ['Curated', 'Heritage', 'Warmth', 'Bespoke', 'Timeless'],
    }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 1024 } }) }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── UI components ─────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = (current / total) * 100
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone }}>Question {current} of {total}</span>
        <span style={{ ...sans, fontSize: 10, color: stone }}>{Math.round(pct)}% complete</span>
      </div>
      <div style={{ height: 2, background: bdr }}>
        <div style={{ height: 2, width: `${pct}%`, background: gold, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function ImageGridQ({ q, value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {q.options.map(o => {
        const sel = value === o.id
        return (
          <button key={o.id} onClick={() => onChange(q.id, o.id)}
            style={{ padding: '24px 18px', background: sel ? `${gold}12` : '#fff', border: `2px solid ${sel ? gold : bdr}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{o.emoji}</span>
            <p style={{ ...serif, fontSize: 16, fontWeight: 300, color: dark, margin: '0 0 4px' }}>{o.label}</p>
            <p style={{ ...sans, fontSize: 11, color: stone, margin: 0, lineHeight: 1.5 }}>{o.desc}</p>
            {sel && <div style={{ width: 18, height: 18, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}><span style={{ fontSize: 11, color: '#000' }}>✓</span></div>}
          </button>
        )
      })}
    </div>
  )
}

function ColourGridQ({ q, value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {q.options.map(o => {
        const sel = value === o.id
        return (
          <button key={o.id} onClick={() => onChange(q.id, o.id)}
            style={{ padding: 0, background: 'none', border: `2px solid ${sel ? gold : bdr}`, cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s' }}>
            <div style={{ display: 'flex', height: 60 }}>
              {o.colours.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
            </div>
            <div style={{ padding: '10px 14px', background: sel ? `${gold}12` : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...sans, fontSize: 11, color: dark, fontWeight: sel ? 600 : 400 }}>{o.label}</span>
              {sel && <span style={{ fontSize: 12, color: gold }}>✓</span>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function MultiSelectQ({ q, value = [], onChange }) {
  function toggle(id) {
    const cur = Array.isArray(value) ? value : []
    onChange(q.id, cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id])
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {q.options.map(o => {
        const sel = Array.isArray(value) && value.includes(o.id)
        return (
          <button key={o.id} onClick={() => toggle(o.id)}
            style={{ padding: '18px 14px', background: sel ? `${gold}12` : '#fff', border: `2px solid ${sel ? gold : bdr}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{o.icon}</span>
            <span style={{ ...sans, fontSize: 11, color: sel ? dark : stone, fontWeight: sel ? 600 : 400 }}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PriorityQ({ q, value = [], onChange }) {
  function pick(id) {
    const cur = Array.isArray(value) ? value : []
    const next = cur.includes(id) ? cur.filter(x => x !== id) : cur.length < 3 ? [...cur, id] : cur
    onChange(q.id, next)
  }
  return (
    <div>
      <p style={{ ...sans, fontSize: 10, color: stone, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Select your top 3 priorities</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {q.options.map((o, i) => {
          const rank = Array.isArray(value) ? value.indexOf(o.id) + 1 : 0
          const sel  = rank > 0
          return (
            <button key={o.id} onClick={() => pick(o.id)}
              style={{ padding: '20px 16px', background: sel ? `${gold}12` : '#fff', border: `2px solid ${sel ? gold : bdr}`, cursor: 'pointer', textAlign: 'left', position: 'relative', transition: 'all 0.15s' }}>
              {sel && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...sans, fontSize: 11, fontWeight: 700, color: '#000' }}>{rank}</span>
                </div>
              )}
              <span style={{ fontSize: 22, display: 'block', marginBottom: 8 }}>{o.icon}</span>
              <span style={{ ...sans, fontSize: 12, color: dark, fontWeight: sel ? 600 : 400 }}>{o.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SingleSelectQ({ q, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {q.options.map(o => {
        const sel = value === o.id
        return (
          <button key={o.id} onClick={() => onChange(q.id, o.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: sel ? `${gold}12` : '#fff', border: `2px solid ${sel ? gold : bdr}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${sel ? gold : bdr}`, background: sel ? gold : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {sel && <span style={{ fontSize: 11, color: '#000' }}>✓</span>}
            </div>
            <div>
              <p style={{ ...serif, fontSize: 16, fontWeight: 300, color: dark, margin: '0 0 2px' }}>{o.label}</p>
              {o.desc && <p style={{ ...sans, fontSize: 11, color: stone, margin: 0 }}>{o.desc}</p>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ImagePickQ({ q, value, onChange }) {
  const PATTERNS = {
    bamboo:  <><line x1="10" y1="0" x2="10" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/><line x1="30" y1="0" x2="30" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/><line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/><line x1="70" y1="0" x2="70" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/></>,
    deco:    <><polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/><polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/></>,
    arch:    <><path d="M30,80 L30,40 Q50,20 70,40 L70,80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/></>,
    heritage:<><path d="M10,10 L90,10 M10,90 L90,90 M50,10 L50,90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/><circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/></>,
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      {q.options.map(o => {
        const sel = value === o.id
        return (
          <button key={o.id} onClick={() => onChange(q.id, o.id)}
            style={{ padding: 0, border: `3px solid ${sel ? gold : 'transparent'}`, cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'border-color 0.15s' }}>
            <div style={{ height: 140, background: o.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                {PATTERNS[o.pattern]}
              </svg>
              <div style={{ width: 50, height: 50, border: `2px solid ${o.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, background: o.accent }} />
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: sel ? `${gold}12` : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...serif, fontSize: 14, fontWeight: 300, color: dark }}>{o.label}</span>
              {sel && <span style={{ ...sans, fontSize: 12, color: gold }}>✓</span>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Result panel ──────────────────────────────────────────────────
function StyleResult({ profile, onRetake }) {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ background: dark, padding: '36px 40px', marginBottom: 24 }}>
        <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, margin: '0 0 10px' }}>Your Style Profile</p>
        <p style={{ ...serif, fontSize: 36, fontWeight: 300, color: '#fff', margin: '0 0 8px' }}>{profile.primary_style}</p>
        <p style={{ ...sans, fontSize: 13, color: '#a8a29e', margin: 0, lineHeight: 1.7 }}>{profile.style_description}</p>
      </div>

      {/* Colour palette */}
      <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: 24, marginBottom: 16 }}>
        <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 14px' }}>Your Colour Palette</p>
        <div style={{ display: 'flex', gap: 0, marginBottom: 12, height: 60 }}>
          {profile.colour_palette.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {profile.colour_names.map((n, i) => (
            <div key={i} style={{ flex: 1, padding: '6px 0', borderRight: `1px solid ${bdr}`, textAlign: 'center' }}>
              <span style={{ ...sans, fontSize: 9, color: stone, letterSpacing: '0.08em' }}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: 20 }}>
          <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 12px' }}>Key Materials</p>
          {profile.key_materials.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, background: gold, flexShrink: 0 }} />
              <span style={{ ...sans, fontSize: 12, color: dark }}>{m}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: 20 }}>
          <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 12px' }}>Keywords</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.inspiration_keywords.map(k => (
              <span key={k} style={{ ...sans, fontSize: 10, color: gold, border: `1px solid ${gold}`, padding: '3px 10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: 24, marginBottom: 16 }}>
        <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 12px' }}>Furniture & Lighting</p>
        <p style={{ ...sans, fontSize: 12, color: dark, margin: '0 0 8px', lineHeight: 1.7 }}>{profile.furniture_style}</p>
        <p style={{ ...sans, fontSize: 12, color: stone, margin: 0, lineHeight: 1.7 }}>{profile.lighting}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: `${gold}08`, border: `1px solid ${gold}40`, padding: 20 }}>
          <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: gold, margin: '0 0 12px' }}>✓ Design Do's</p>
          {profile.do_list.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 16, height: 16, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <span style={{ fontSize: 9, color: '#000' }}>✓</span>
              </div>
              <span style={{ ...sans, fontSize: 12, color: dark, lineHeight: 1.5 }}>{d}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 20 }}>
          <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ef4444', margin: '0 0 12px' }}>✕ Avoid These</p>
          {profile.dont_list.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 16, height: 16, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <span style={{ fontSize: 9, color: '#fff' }}>✕</span>
              </div>
              <span style={{ ...sans, fontSize: 12, color: dark, lineHeight: 1.5 }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: dark, padding: '24px 28px', marginBottom: 24 }}>
        <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, margin: '0 0 8px' }}>Designer's Note</p>
        <p style={{ ...serif, fontSize: 16, fontWeight: 300, color: '#e7e5e4', margin: '0 0 12px', lineHeight: 1.7, fontStyle: 'italic' }}>"{profile.designer_note}"</p>
        <p style={{ ...sans, fontSize: 10, color: stone, margin: '0 0 16px' }}>Budget guidance: {profile.budget_guidance}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/dashboard" style={{ ...sans, padding: '10px 24px', background: gold, color: '#000', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Start My Project
          </Link>
          <button onClick={onRetake} style={{ ...sans, padding: '10px 24px', background: 'none', border: `1px solid ${stone}`, color: '#e7e5e4', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function StyleQuizPage() {
  const [step,     setStep]     = useState(0)   // 0 = intro
  const [answers,  setAnswers]  = useState({})
  const [loading,  setLoading]  = useState(false)
  const [profile,  setProfile]  = useState(null)

  const currentQ  = QUESTIONS[step - 1]
  const answer    = currentQ ? answers[currentQ.id] : null
  const canNext   = answer && (Array.isArray(answer) ? answer.length > 0 : true)

  function handleAnswer(qId, val) { setAnswers(a => ({ ...a, [qId]: val })) }

  async function next() {
    if (step < QUESTIONS.length) { setStep(s => s + 1); return }
    setLoading(true)
    const result = await generateStyleProfile(answers).catch(() => null)
    setProfile(result)
    setLoading(false)
  }

  function reset() { setStep(0); setAnswers({}); setProfile(null) }

  function renderQ(q) {
    const props = { q, value: answers[q.id], onChange: handleAnswer }
    switch (q.type) {
      case 'image-grid':    return <ImageGridQ   {...props} />
      case 'colour-grid':   return <ColourGridQ  {...props} />
      case 'multi-select':  return <MultiSelectQ {...props} />
      case 'priority':      return <PriorityQ    {...props} />
      case 'single-select': return <SingleSelectQ{...props} />
      case 'image-pick':    return <ImagePickQ   {...props} />
      default: return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: light, ...sans }}>
      {/* Header */}
      <header style={{ height: 64, background: dark, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16, borderBottom: `1px solid #292524` }}>
        <div style={{ width: 28, height: 28, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none" /></svg>
        </div>
        <p style={{ ...serif, fontSize: 16, fontWeight: 300, color: '#fff', margin: 0 }}>El Shaddai <span style={{ color: gold }}>Style Quiz</span></p>
        <div style={{ flex: 1 }} />
        <Link to="/dashboard" style={{ ...sans, fontSize: 10, color: '#78716c', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        {/* Intro screen */}
        {step === 0 && !profile && (
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, border: `1px solid ${gold}`, padding: '3px 12px' }}>AI Style Analysis</span>
            <p style={{ ...serif, fontSize: 52, fontWeight: 300, color: dark, margin: '24px 0 16px', lineHeight: 1.1 }}>Discover Your Signature Style</p>
            <p style={{ ...sans, fontSize: 14, color: stone, margin: '0 0 40px', lineHeight: 1.7 }}>6 questions · 3 minutes · A personalised design profile built by AI, tailored for your home and how you live in it.</p>
            <button onClick={() => setStep(1)}
              style={{ ...sans, padding: '14px 40px', background: gold, border: 'none', color: '#000', fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Begin the Quiz →
            </button>
          </div>
        )}

        {/* Quiz steps */}
        {step > 0 && !profile && !loading && currentQ && (
          <div>
            <ProgressBar current={step} total={QUESTIONS.length} />
            <p style={{ ...serif, fontSize: 38, fontWeight: 300, color: dark, margin: '0 0 6px' }}>{currentQ.label}</p>
            <p style={{ ...sans, fontSize: 13, color: stone, margin: '0 0 32px' }}>{currentQ.subtitle}</p>
            {renderQ(currentQ)}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
              <button onClick={() => setStep(s => s - 1)} style={{ ...sans, padding: '10px 24px', background: 'none', border: `1px solid ${bdr}`, color: stone, fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={next} disabled={!canNext}
                style={{ ...sans, padding: '10px 32px', background: canNext ? gold : bdr, border: 'none', color: canNext ? '#000' : '#a8a29e', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: canNext ? 'pointer' : 'default' }}>
                {step === QUESTIONS.length ? 'Generate My Profile →' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 48, height: 48, border: `2px solid ${bdr}`, borderTopColor: gold, borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 24px' }} />
            <p style={{ ...serif, fontSize: 28, fontWeight: 300, color: dark, margin: '0 0 8px' }}>Analysing your style…</p>
            <p style={{ ...sans, fontSize: 12, color: stone }}>Our AI is crafting your personalised design profile</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Result */}
        {profile && <StyleResult profile={profile} onRetake={reset} />}
      </div>
    </div>
  )
}
