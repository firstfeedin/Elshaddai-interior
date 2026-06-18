export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, phone, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     'El Shaddai Interiors <onboarding@resend.dev>',
        to:       ['ganeshkumarmamidisetti99@gmail.com', 'contactus@divinemercyitsol.com'],
        reply_to: email,
        subject:  `New Enquiry from ${name} — El Shaddai`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#c9a227;margin-bottom:20px">New Contact Enquiry — El Shaddai Interiors</h2>
            <table style="width:100%;border-collapse:collapse;font-size:15px">
              <tr><td style="padding:10px;font-weight:bold;background:#f5f5f5;width:120px">Name</td><td style="padding:10px;background:#f5f5f5">${name}</td></tr>
              <tr><td style="padding:10px;font-weight:bold">Email</td><td style="padding:10px"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:10px;font-weight:bold;background:#f5f5f5">Phone</td><td style="padding:10px;background:#f5f5f5">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding:10px;font-weight:bold;vertical-align:top">Message</td><td style="padding:10px">${message.replace(/\n/g, '<br>')}</td></tr>
            </table>
            <p style="color:#999;font-size:12px;margin-top:24px">Sent from elshaddaiinterior.vercel.app</p>
          </div>
        `,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend error:', data)
      return res.status(500).json({ error: data.message || 'Failed to send email' })
    }

    return res.status(200).json({ ok: true, id: data.id })
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
