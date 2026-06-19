export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, phone, message } = req.body || {}
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' })

  // ── Web3Forms → contactus@divinemercyitsol.com ──────────────────
  const web3 = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: '20e5a729-9a98-4234-b88a-470634b6d474',
      subject:    `New Enquiry from ${name} — El Shaddai Interiors`,
      from_name:  'El Shaddai Website',
      reply_to:   email,
      name, email,
      phone:   phone || 'Not provided',
      message,
    }),
  }).then(r => r.json()).catch(() => ({ success: false }))

  // ── SMS via Fast2SMS (fires if API key is set in Vercel env) ────
  if (process.env.FAST2SMS_API_KEY) {
    fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { authorization: process.env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route: 'q', flash: 0, language: 'english',
        numbers: process.env.COMPANY_PHONE || '9876543210',
        message: `El Shaddai: New enquiry from ${name} (${phone || email}). Message: ${message.slice(0, 80)}`,
      }),
    }).catch(() => {})
  }

  return res.status(200).json({ ok: true, web3 })
}
