// Simple in-memory rate limiter (resets on cold start)
const rateMap = new Map()
function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateMap.get(ip) || { count: 0, start: now }
  if (now - entry.start > 60_000) { rateMap.set(ip, { count: 1, start: now }); return false }
  if (entry.count >= 5) return true
  rateMap.set(ip, { ...entry, count: entry.count + 1 })
  return false
}

function sanitize(str = '') {
  return String(str).replace(/[\r\n\t]/g, ' ').trim().slice(0, 1000)
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

const ALLOWED_ORIGINS = [
  'https://elshaddaiinterior.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
]

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests. Please wait a minute.' })

  // Input validation
  const name    = sanitize(req.body?.name)
  const email   = sanitize(req.body?.email)
  const phone   = sanitize(req.body?.phone)
  const message = sanitize(req.body?.message)

  if (!name || name.length < 2)        return res.status(400).json({ error: 'Name is required' })
  if (!isValidEmail(email))            return res.status(400).json({ error: 'Valid email is required' })
  if (!message || message.length < 5)  return res.status(400).json({ error: 'Message is required' })

  // SMS via Fast2SMS (optional — only fires if FAST2SMS_API_KEY is set)
  if (process.env.FAST2SMS_API_KEY) {
    fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { authorization: process.env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route: 'q', flash: 0, language: 'english',
        numbers: process.env.COMPANY_PHONE || '9876543210',
        message: `El Shaddai enquiry: ${name} (${phone || email}): ${message.slice(0, 80)}`,
      }),
    }).catch(() => {})
  }

  return res.status(200).json({ ok: true })
}
