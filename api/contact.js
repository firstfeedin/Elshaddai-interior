export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, phone, message } = req.body || {}
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' })

  // ── Email via Resend ────────────────────────────────────────────
  const emailPromise = fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:     'El Shaddai Interiors <onboarding@resend.dev>',
      to:       ['contactus@divinemercyitsol.com'],
      reply_to: email,
      subject:  `New Enquiry from ${name} — El Shaddai`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e7e5e4">
          <div style="background:#1c1917;padding:24px 32px;display:flex;align-items:center;gap:12px">
            <span style="color:#c9a227;font-size:22px;font-family:Georgia,serif;font-weight:600">El Shaddai</span>
            <span style="color:#c9a227;font-size:10px;letter-spacing:0.2em;text-transform:uppercase">Interiors & Design</span>
          </div>
          <div style="padding:32px">
            <h2 style="color:#1c1917;margin:0 0 24px;font-family:Georgia,serif;font-weight:400;font-size:22px">New Contact Enquiry</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;font-family:sans-serif">
              <tr style="background:#fafaf9"><td style="padding:12px 16px;font-weight:600;color:#57534e;width:130px">Name</td><td style="padding:12px 16px;color:#1c1917">${name}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:600;color:#57534e">Email</td><td style="padding:12px 16px"><a href="mailto:${email}" style="color:#c9a227">${email}</a></td></tr>
              <tr style="background:#fafaf9"><td style="padding:12px 16px;font-weight:600;color:#57534e">Phone</td><td style="padding:12px 16px;color:#1c1917">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:600;color:#57534e;vertical-align:top">Message</td><td style="padding:12px 16px;color:#1c1917;line-height:1.7">${message.replace(/\n/g, '<br>')}</td></tr>
            </table>
            <div style="margin-top:28px;padding:16px;background:#fafaf9;border-left:3px solid #c9a227">
              <p style="margin:0;font-size:12px;color:#78716c">Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
          <div style="padding:16px 32px;background:#f5f5f4;text-align:center">
            <p style="margin:0;font-size:11px;color:#a8a29e">Sent from elshaddaiinterior.vercel.app · Hyderabad, Telangana</p>
          </div>
        </div>
      `,
    }),
  }).catch(() => null)

  // ── SMS via Fast2SMS (Indian SMS gateway) ───────────────────────
  const smsPromise = process.env.FAST2SMS_API_KEY
    ? fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route:    'q',
          message:  `El Shaddai: New enquiry from ${name} (${phone || email}). Message: ${message.slice(0, 100)}`,
          language: 'english',
          flash:    0,
          numbers:  process.env.COMPANY_PHONE || '9876543210',
        }),
      }).catch(() => null)
    : Promise.resolve(null)

  await Promise.allSettled([emailPromise, smsPromise])

  return res.status(200).json({ ok: true })
}
