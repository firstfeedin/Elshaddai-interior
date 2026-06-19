import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'

const SF = "'Cormorant Garamond',Georgia,serif"
const SS = "'DM Sans',system-ui,sans-serif"
const CREAM = '#f5ede8'
const DARK  = '#2a0e14'
const WHITE = '#ffffff'
const GOLD  = '#c4956a'
const MUTED = '#9a8a82'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:52, paddingBottom:52, borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
      <h2 style={{ fontFamily:SF, fontSize:28, fontWeight:300, color:DARK, margin:'0 0 20px' }}>{title}</h2>
      <div style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:MUTED, lineHeight:2.0 }}>{children}</div>
    </div>
  )
}

export default function PrivacyPage() {
  const nav = useNavigate()
  return (
    <div style={{ fontFamily:SS, background:CREAM, minHeight:'100vh' }}>
      <Navbar />
      <div style={{ paddingTop:96 }}>

        {/* Header */}
        <section style={{ background:DARK, padding:'80px clamp(40px,8vw,160px)' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:GOLD }}>Legal</span>
            <h1 style={{ fontFamily:SF, fontSize:'clamp(40px,5vw,72px)', fontWeight:300, color:WHITE, lineHeight:1.0, margin:'20px 0 16px' }}>Privacy Policy</h1>
            <p style={{ fontFamily:SS, fontSize:13, fontWeight:300, color:'rgba(255,255,255,0.4)', margin:0 }}>Last updated: June 2025</p>
          </div>
        </section>

        {/* Content */}
        <section style={{ background:WHITE, padding:'80px clamp(40px,8vw,160px)' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>

            <Section title="1. Who We Are">
              <p>El Shaddai Interior Design ("El Shaddai", "we", "us", "our") operates the design platform available at this website. We are committed to protecting your personal information and your right to privacy. If you have any questions, contact us at <a href="mailto:privacy@elshaddai.in" style={{ color:GOLD }}>privacy@elshaddai.in</a>.</p>
            </Section>

            <Section title="2. Information We Collect">
              <p><strong style={{ color:DARK }}>Account information:</strong> When you register, we collect your name, email address, and password (hashed — never stored in plain text).</p>
              <br />
              <p><strong style={{ color:DARK }}>Design data:</strong> Floor plans, room configurations, furniture choices, and other content you create in the studio are stored on our servers so you can access them across sessions.</p>
              <br />
              <p><strong style={{ color:DARK }}>Usage data:</strong> We collect anonymised data about how features are used (page views, button clicks, feature adoption) to improve the product. This data is aggregated and cannot identify you individually.</p>
              <br />
              <p><strong style={{ color:DARK }}>Device data:</strong> Browser type, operating system, screen resolution, and IP address. Used to diagnose technical issues and protect against abuse.</p>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul style={{ paddingLeft:24, marginTop:12 }}>
                <li style={{ marginBottom:8 }}>Provide, maintain, and improve the El Shaddai platform</li>
                <li style={{ marginBottom:8 }}>Authenticate you and keep your account secure</li>
                <li style={{ marginBottom:8 }}>Save your design projects and preferences</li>
                <li style={{ marginBottom:8 }}>Send you service-related emails (account confirmation, password reset)</li>
                <li style={{ marginBottom:8 }}>Respond to your support requests</li>
                <li style={{ marginBottom:8 }}>Detect and prevent fraud and abuse</li>
              </ul>
              <br />
              <p>We do <strong style={{ color:DARK }}>not</strong> sell, rent, or share your personal data with third parties for marketing purposes.</p>
            </Section>

            <Section title="4. Cookies">
              <p>We use essential cookies to keep you logged in and remember your session preferences. We use analytics cookies (opt-in) to understand how users interact with the platform. You can decline non-essential cookies via the cookie banner when you first visit.</p>
            </Section>

            <Section title="5. Data Storage and Security">
              <p>Your data is stored on servers in India. We use industry-standard encryption (TLS in transit, AES-256 at rest) and follow OWASP security practices. Passwords are hashed using bcrypt and are never stored in plain text. While we take every reasonable precaution, no system is perfectly secure — please choose a strong password and keep it confidential.</p>
            </Section>

            <Section title="6. Your Rights">
              <p>You have the right to:</p>
              <ul style={{ paddingLeft:24, marginTop:12 }}>
                <li style={{ marginBottom:8 }}><strong style={{ color:DARK }}>Access</strong> — request a copy of your personal data</li>
                <li style={{ marginBottom:8 }}><strong style={{ color:DARK }}>Correction</strong> — request that inaccurate data be corrected</li>
                <li style={{ marginBottom:8 }}><strong style={{ color:DARK }}>Deletion</strong> — request deletion of your account and all associated data</li>
                <li style={{ marginBottom:8 }}><strong style={{ color:DARK }}>Portability</strong> — request an export of your design projects in a standard format</li>
                <li style={{ marginBottom:8 }}><strong style={{ color:DARK }}>Objection</strong> — opt out of analytics tracking at any time from your settings</li>
              </ul>
              <br />
              <p>To exercise any of these rights, email <a href="mailto:privacy@elshaddai.in" style={{ color:GOLD }}>privacy@elshaddai.in</a>. We will respond within 30 days.</p>
            </Section>

            <Section title="7. Third-Party Services">
              <p>We integrate with the following third-party services, each governed by their own privacy policies:</p>
              <ul style={{ paddingLeft:24, marginTop:12 }}>
                <li style={{ marginBottom:8 }}>Google OAuth — for optional sign-in with Google</li>
                <li style={{ marginBottom:8 }}>Unsplash — for room inspiration images (no personal data shared)</li>
              </ul>
            </Section>

            <Section title="8. Children's Privacy">
              <p>El Shaddai is not directed at children under 13 years of age. We do not knowingly collect personal data from children. If you believe we have collected information from a child, please contact us immediately.</p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>We may update this policy from time to time. We will notify registered users by email if we make material changes. Continued use of the platform after a policy update constitutes acceptance of the updated terms.</p>
            </Section>

            <div style={{ marginTop:8, padding:'32px 0', borderTop:'1px solid rgba(0,0,0,0.07)', display:'flex', gap:32, flexWrap:'wrap' }}>
              <button onClick={() => nav('/terms-of-service')} style={{ fontFamily:SS, fontSize:11, fontWeight:600, color:GOLD, background:'none', border:'none', cursor:'pointer', letterSpacing:'0.1em', textTransform:'uppercase', padding:0 }}>Terms of Service →</button>
              <button onClick={() => nav('/')} style={{ fontFamily:SS, fontSize:11, fontWeight:600, color:MUTED, background:'none', border:'none', cursor:'pointer', letterSpacing:'0.1em', textTransform:'uppercase', padding:0 }}>Back to Home →</button>
            </div>
          </div>
        </section>

        <div style={{ background:'#0a0905', padding:'32px clamp(40px,8vw,160px)' }}>
          <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.3)', margin:0 }}>© 2025 El Shaddai Interior Design · <a href="mailto:privacy@elshaddai.in" style={{ color:'rgba(255,255,255,0.35)', textDecoration:'none' }}>privacy@elshaddai.in</a></p>
        </div>
      </div>
    </div>
  )
}
