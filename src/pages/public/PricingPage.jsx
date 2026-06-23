import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const border = '#e7e5e4'

const PLANS = [
  {
    name: 'Free', price: { monthly: 0, yearly: 0 }, desc: 'Explore El Shaddai at your own pace.',
    features: ['1 active project','2D floor plan editor','Basic 3D designer','500 furniture models','720p renders (2/month)','Community support'],
    missing: ['AI features','4K/8K rendering','Client presentations','Team collaboration','Priority support'],
    cta: 'Get Started Free', featured: false,
  },
  {
    name: 'Pro', price: { monthly: 1999, yearly: 1599 }, desc: 'Professional tools and AI assistance for freelancers.',
    features: ['10 active projects','2D + 3D designer (full)','10,000+ furniture models','4K renders (unlimited)','3 AI design generations/day','AI material suggestions','AI cost estimation (BOQ)','Client presentation mode','360° virtual tours','Email support (24h)'],
    missing: ['Custom branding','Team seats','API access'],
    cta: 'Start Pro Trial', featured: true,
  },
  {
    name: 'Studio', price: { monthly: 4999, yearly: 3999 }, desc: 'For design studios managing multiple clients.',
    features: ['Unlimited projects','Everything in Pro','5 team seats included','Unlimited AI generations','All 9 AI integrations','8K renders (unlimited)','Custom brand watermark','Client presentation portal','Multi-project management dashboard','Priority support (4h SLA)','Dedicated account manager'],
    missing: [],
    cta: 'Start Studio Trial', featured: false,
  },
  {
    name: 'Enterprise', price: { monthly: null, yearly: null }, desc: 'Custom solutions for large firms and builders.',
    features: ['Unlimited everything','Unlimited team seats','White-label platform','Custom AI model training','SSO / SAML integration','API access + webhooks','SLA 99.9% uptime','On-premise option','Custom onboarding','24/7 dedicated support'],
    missing: [],
    cta: 'Contact Sales', featured: false,
  },
]

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes. All plans are month-to-month with no lock-in. Cancel from your account settings and your plan stays active until the end of the billing period.' },
  { q: 'Do you offer a free trial for paid plans?', a: 'Pro and Studio plans include a 14-day free trial — no credit card required. You only pay when the trial ends.' },
  { q: 'What counts as an "AI generation"?', a: 'Each time you click "Generate AI Design" counts as one generation. Editing the result or regenerating the same prompt counts as a new generation.' },
  { q: 'Can I upgrade or downgrade at any time?', a: 'Yes. Upgrades take effect immediately and you are charged the pro-rated difference. Downgrades take effect at the next billing cycle.' },
  { q: 'Is there a student or NGO discount?', a: 'Yes — 60% discount for verified students and registered NGOs. Email contactus@divinemercyitsol.com with proof of enrolment or registration.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major UPI apps (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and EMI via major banks. All payments are processed securely via Razorpay.' },
  { q: 'How does team collaboration work?', a: 'Studio plans include 5 seats. Each team member gets their own login. You can share projects, assign tasks, and comment on designs in real time.' },
]

function PlanCard({ plan, billing }) {
  const [hov, setHov] = useState(false)
  const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: plan.featured ? dark : '#fff', border: `1px solid ${plan.featured ? dark : (hov ? dark : border)}`, padding: '36px 28px', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'border-color 0.2s' }}>
      {plan.featured && <div style={{ position: 'absolute', top: -1, left: 28, background: gold, color: '#000', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px' }}>Most Popular</div>}
      <p style={{ ...sans, margin: '0 0 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: plan.featured ? 'rgba(255,255,255,0.4)' : '#a8a29e' }}>{plan.name}</p>
      <div style={{ margin: '12px 0 8px' }}>
        {price === null ? (
          <span style={{ ...serif, fontSize: 40, fontWeight: 300, color: plan.featured ? '#fff' : dark }}>Custom</span>
        ) : price === 0 ? (
          <span style={{ ...serif, fontSize: 40, fontWeight: 300, color: plan.featured ? '#fff' : dark }}>Free</span>
        ) : (
          <div>
            <span style={{ ...serif, fontSize: 40, fontWeight: 300, color: plan.featured ? '#fff' : dark }}>₹{price.toLocaleString()}</span>
            <span style={{ ...sans, fontSize: 12, color: plan.featured ? 'rgba(255,255,255,0.35)' : '#a8a29e', marginLeft: 4 }}>/mo</span>
          </div>
        )}
        {billing === 'yearly' && price > 0 && (
          <p style={{ ...sans, margin: '4px 0 0', fontSize: 11, color: gold }}>Save ₹{((plan.price.monthly - plan.price.yearly) * 12).toLocaleString()}/yr</p>
        )}
      </div>
      <p style={{ ...sans, margin: '0 0 24px', fontSize: 13, color: plan.featured ? 'rgba(255,255,255,0.5)' : stone, lineHeight: 1.7, fontWeight: 300 }}>{plan.desc}</p>
      <div style={{ flex: 1 }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 9, alignItems: 'flex-start' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="2,7 5,10 12,3" stroke={gold} strokeWidth="1.5" fill="none"/></svg>
            <span style={{ ...sans, fontSize: 12, color: plan.featured ? 'rgba(255,255,255,0.7)' : stone, lineHeight: 1.6, fontWeight: 300 }}>{f}</span>
          </div>
        ))}
        {plan.missing.map(f => (
          <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 9, alignItems: 'flex-start', opacity: 0.3 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: 1 }}><line x1="3" y1="7" x2="11" y2="7" stroke="#a8a29e" strokeWidth="1.5"/></svg>
            <span style={{ ...sans, fontSize: 12, color: '#a8a29e', lineHeight: 1.6, fontWeight: 300 }}>{f}</span>
          </div>
        ))}
      </div>
      <button onClick={() => window.location.href = plan.name === 'Enterprise' ? '/#contact' : '/register'}
        style={{ ...sans, marginTop: 28, padding: '12px', background: plan.featured ? gold : 'transparent', color: plan.featured ? '#000' : dark, border: `1px solid ${plan.featured ? gold : dark}`, cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'all 0.2s' }}
        onMouseEnter={e => { if (!plan.featured) { e.currentTarget.style.background = dark; e.currentTarget.style.color = '#fff' } }}
        onMouseLeave={e => { if (!plan.featured) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = dark } }}>
        {plan.cta}
      </button>
    </div>
  )
}

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div style={{ ...sans, background: light, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 96 }}>

        {/* Header */}
        <div style={{ padding: '72px 64px 64px', background: '#fff', borderBottom: `1px solid ${border}` }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#a8a29e' }}>Transparent Pricing</p>
          <h1 style={{ ...serif, margin: '0 0 16px', fontSize: 54, fontWeight: 300, color: dark, lineHeight: 1 }}>Choose Your Plan</h1>
          <p style={{ margin: '0 0 36px', fontSize: 15, color: stone, fontWeight: 300, lineHeight: 1.7, maxWidth: 460 }}>Start free. Scale as you grow. All plans include the core El Shaddai designer.</p>
          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', border: `1px solid ${border}` }}>
            {[['monthly','Monthly'],['yearly','Yearly — save 20%']].map(([b, l]) => (
              <button key={b} onClick={() => setBilling(b)} style={{ ...sans, padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: billing === b ? dark : 'transparent', color: billing === b ? '#fff' : stone, transition: 'all 0.2s' }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderBottom: `1px solid ${border}` }}>
          {PLANS.map(p => <PlanCard key={p.name} plan={p} billing={billing} />)}
        </div>

        {/* Feature comparison */}
        <div style={{ padding: '80px 64px', background: '#fff' }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#a8a29e', textAlign: 'center' }}>Compare</p>
          <h2 style={{ ...serif, margin: '0 0 48px', fontSize: 42, fontWeight: 300, color: dark, textAlign: 'center' }}>Full Feature Comparison</h2>
          <div style={{ maxWidth: 880, margin: '0 auto', border: `1px solid ${border}` }}>
            {[
              ['Feature','Free','Pro','Studio','Enterprise'],
              ['Active projects','1','10','Unlimited','Unlimited'],
              ['3D furniture models','500','10,000+','10,000+','10,000+'],
              ['Render quality','720p','4K','8K','8K'],
              ['Monthly renders','2','Unlimited','Unlimited','Unlimited'],
              ['AI design generations','—','3/day','Unlimited','Unlimited'],
              ['AI integrations','—','3 of 9','All 9','All 9 + custom'],
              ['Client presentations','—','✓','✓','✓'],
              ['Team seats','1','1','5','Unlimited'],
              ['Custom branding','—','—','✓','✓'],
              ['API access','—','—','—','✓'],
              ['Support','Community','Email 24h','Priority 4h','Dedicated 24/7'],
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', background: i % 2 === 0 ? '#fff' : light, borderBottom: i < 12 ? `1px solid ${border}` : 'none' }}>
                {row.map((cell, j) => (
                  <div key={j} style={{ padding: '14px 18px', ...sans, fontSize: i === 0 ? 9 : 12, fontWeight: i === 0 ? 600 : (j === 0 ? 500 : 300), color: i === 0 ? '#a8a29e' : j === 0 ? dark : cell === '—' ? '#d6d3d1' : cell === '✓' ? gold : stone, textTransform: i === 0 ? 'uppercase' : 'none', letterSpacing: i === 0 ? '0.15em' : 0, textAlign: j === 0 ? 'left' : 'center', borderLeft: j === 2 && i > 0 ? `2px solid rgba(201,162,39,0.15)` : 'none' }}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding: '0 64px 80px', background: light }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#a8a29e', textAlign: 'center', paddingTop: 80 }}>FAQ</p>
          <h2 style={{ ...serif, margin: '0 0 48px', fontSize: 42, fontWeight: 300, color: dark, textAlign: 'center' }}>Questions &amp; Answers</h2>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${border}` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', ...sans }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: dark }}>{faq.q}</span>
                  <span style={{ fontSize: 18, color: gold, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 16 }}>+</span>
                </button>
                {openFaq === i && <p style={{ margin: '0 0 20px', fontSize: 13, color: stone, lineHeight: 1.85, fontWeight: 300 }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80" alt="" style={{ width: '100%', height: 340, objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,10,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: 32 }}>
            <h2 style={{ ...serif, margin: '0 0 12px', fontSize: 44, fontWeight: 300, color: '#fff' }}>Still deciding? Start free.</h2>
            <p style={{ ...sans, margin: '0 0 32px', fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>No credit card. No commitment. Upgrade whenever you're ready.</p>
            <button onClick={() => window.location.href = '/register'} style={{ ...sans, padding: '13px 36px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Create Free Account →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
