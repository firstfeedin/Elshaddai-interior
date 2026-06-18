import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()

/* ── Generate AI design brief (calls OpenAI) ── */
router.post('/generate-design', authenticate, asyncHandler(async (req, res) => {
  const { propertyType, area, rooms, budget, style, name } = req.body

  /*
   * Production: call OpenAI DALL-E 3 + GPT-4 here
   * POST https://api.openai.com/v1/images/generations
   *   model: "dall-e-3"
   *   prompt: buildPrompt(style, propertyType, rooms)
   *   size: "1792x1024"
   *   quality: "hd"
   *
   * For now: return structured design brief with estimated values
   */
  const budgetNum   = parseFloat(String(budget).replace(/[^0-9.]/g, ''))
  const areaNum     = parseFloat(String(area).replace(/[^0-9]/g, ''))
  const costPerSqft = { Modern: 1800, Luxury: 3500, Minimal: 1500, Scandinavian: 2000, Contemporary: 2200, Classic: 2800 }
  const rate        = costPerSqft[style] || 2000
  const estimate    = areaNum * rate

  const materials = {
    Modern:       ['Matte White', 'Graphite Grey', 'Chrome Steel', 'Light Oak'],
    Luxury:       ['Italian Marble', 'Deep Navy', 'Brushed Gold', 'Ivory Silk'],
    Minimal:      ['Warm White', 'Stone Grey', 'Natural Linen', 'Birch Wood'],
    Scandinavian: ['Snow White', 'Pine Wood', 'Sage Green', 'Warm Beige'],
    Contemporary: ['Charcoal', 'Warm Taupe', 'Terracotta', 'Cream'],
    Classic:      ['Walnut Wood', 'Forest Green', 'Antique Gold', 'Cream'],
  }

  const designBrief = {
    projectRef:    `ES-${Math.floor(Math.random() * 90000 + 10000)}`,
    clientName:    name,
    style,
    propertyType,
    area:          `${area} sqft`,
    rooms:         Array.isArray(rooms) ? rooms : [rooms],
    budget:        `₹${(estimate / 100000).toFixed(1)} Lakhs`,
    costEstimate: {
      min: Math.round(estimate * 0.9),
      max: Math.round(estimate * 1.1),
      perSqft: rate,
    },
    materialPalette: (materials[style] || materials['Modern']).map(m => ({ name: m })),
    timeline: { design: '3-5 days', manufacturing: '3-4 weeks', installation: '5-7 days', total: '4-6 weeks' },
    boqPreview: [
      { item: 'Modular Kitchen',    qty: rooms.includes('Kitchen') ? 1 : 0, rate: 85000 },
      { item: 'Wardrobe',           qty: rooms.filter(r => r.toLowerCase().includes('bedroom')).length, rate: 45000 },
      { item: 'TV Unit',            qty: rooms.includes('Living Room') ? 1 : 0, rate: 35000 },
      { item: 'False Ceiling',      qty: Math.round(areaNum * 0.7), unit: 'sqft', rate: 95 },
      { item: 'Flooring',           qty: areaNum, unit: 'sqft', rate: 150 },
      { item: 'Electrical & Lights',qty: 1, rate: 45000 },
      { item: 'Design & PM',        qty: 1, rate: 35000 },
    ].filter(i => i.qty > 0),
    generatedAt:   new Date().toISOString(),
  }

  res.json({ designBrief })
}))

/* ── AI room layout suggestion ── */
router.post('/suggest-layout', authenticate, asyncHandler(async (req, res) => {
  const { roomType, width, height, style } = req.body

  /* Production: call GPT-4 with a structured prompt to get furniture placement */
  const suggestions = {
    furniturePlacements: [
      { item: 'Sofa',          x: 2,   z: 1,   rotation: 0   },
      { item: 'Coffee Table',  x: 2,   z: 2.5, rotation: 0   },
      { item: 'TV Unit',       x: 2,   z: -1,  rotation: Math.PI },
      { item: 'Armchair',      x: 0.5, z: 1.5, rotation: Math.PI / 4 },
      { item: 'Floor Lamp',    x: 0.5, z: 3,   rotation: 0   },
    ],
    colorScheme: ['#F5F5F0', '#4A4A4A', '#C4A97D'],
    notes: `Optimised for natural light entry. Sofa faces the main view. Traffic flow maintained at 900mm minimum.`
  }

  res.json({ suggestions })
}))

/* ── Material recommendation ── */
router.post('/recommend-materials', authenticate, asyncHandler(async (req, res) => {
  const { style, budget, rooms } = req.body

  const recommendations = {
    flooring:   style === 'Luxury' ? 'Italian Marble — Statuario' : style === 'Modern' ? 'Engineered Wood — Oak' : 'Vitrified Tiles — 800×800mm',
    walls:      style === 'Luxury' ? 'Italian Texture Paint + Wallpaper Accent' : 'Matte Emulsion — Asian Paints Royale',
    ceiling:    'POP False Ceiling with Cove Lighting',
    kitchen:    'Acrylic Finish Shutters + Quartz Countertop',
    bathroom:   style === 'Luxury' ? 'Book-matched Marble' : 'Premium Ceramic Tiles',
    hardware:   style === 'Luxury' ? 'SS Brushed Gold' : 'SS Matt Chrome',
  }

  res.json({ recommendations })
}))

export default router
