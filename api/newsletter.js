const rateMap = new Map()
function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateMap.get(ip) || { count: 0, start: now }
  if (now - entry.start > 60_000) { rateMap.set(ip, { count: 1, start: now }); return false }
  if (entry.count >= 3) return true
  rateMap.set(ip, { ...entry, count: entry.count + 1 })
  return false
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

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests' })

  const email = String(req.body?.email || '').trim().slice(0, 200)
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required' })

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'El Shaddai Interiors <onboarding@resend.dev>',
        to:      ['contactus@divinemercyitsol.com'],
        subject: `New Newsletter Subscriber — ${email}`,
        html:    `<div style="font-family:sans-serif;padding:24px"><h3 style="color:#c9a227">New Subscriber</h3><p><strong>Email:</strong> ${email}</p></div>`,
      }),
    })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'El Shaddai Interiors <onboarding@resend.dev>',
        to:      [email],
        subject: 'Welcome to El Shaddai — Design Inspiration Every Month',
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <div style="background:#1c1917;padding:28px 32px">
              <span style="color:#c9a227;font-size:20px;font-family:Georgia,serif;font-weight:600">El Shaddai Interiors</span>
            </div>
            <div style="padding:36px 32px;border:1px solid #e7e5e4;border-top:none">
              <h2 style="font-family:Georgia,serif;font-weight:300;color:#1c1917;margin:0 0 16px">You're subscribed!</h2>
              <p style="color:#57534e;font-size:14px;line-height:1.8">Every month you'll get Hyderabad project showcases, Vastu tips, material guides and exclusive offers.</p>
              <div style="margin-top:28px">
                <a href="https://elshaddaiinterior.vercel.app" style="background:#c9a227;color:#000;padding:12px 28px;font-weight:700;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;display:inline-block">Explore Our Work →</a>
              </div>
            </div>
            <div style="padding:16px 32px;text-align:center">
              <p style="margin:0;font-size:11px;color:#a8a29e">El Shaddai Interiors · Hyderabad, Telangana, India</p>
            </div>
          </div>
        `,
      }),
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed' })
  }
}
