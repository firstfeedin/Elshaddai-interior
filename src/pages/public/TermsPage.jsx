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

export default function TermsPage() {
  const nav = useNavigate()
  return (
    <div style={{ fontFamily:SS, background:CREAM, minHeight:'100vh' }}>
      <Navbar />
      <div style={{ paddingTop:96 }}>

        {/* Header */}
        <section style={{ background:DARK, padding:'80px clamp(40px,8vw,160px)' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:GOLD }}>Legal</span>
            <h1 style={{ fontFamily:SF, fontSize:'clamp(40px,5vw,72px)', fontWeight:300, color:WHITE, lineHeight:1.0, margin:'20px 0 16px' }}>Terms of Service</h1>
            <p style={{ fontFamily:SS, fontSize:13, fontWeight:300, color:'rgba(255,255,255,0.4)', margin:0 }}>Last updated: June 2025</p>
          </div>
        </section>

        {/* Content */}
        <section style={{ background:WHITE, padding:'80px clamp(40px,8vw,160px)' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>

            <Section title="1. Acceptance of Terms">
              <p>By accessing or using the El Shaddai interior design platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Service. These Terms apply to all visitors, registered users, and others who access the Service.</p>
            </Section>

            <Section title="2. Description of Service">
              <p>El Shaddai provides a browser-based interior design platform that allows users to:</p>
              <ul style={{ paddingLeft:24, marginTop:12 }}>
                <li style={{ marginBottom:8 }}>Draw 2D floor plans and visualise them in 3D</li>
                <li style={{ marginBottom:8 }}>Browse a furniture and material catalogue</li>
                <li style={{ marginBottom:8 }}>Save, export, and share design projects</li>
                <li style={{ marginBottom:8 }}>Access AI-assisted design tools</li>
                <li style={{ marginBottom:8 }}>Collaborate with team members on shared projects</li>
              </ul>
              <br />
              <p>The core Service is provided free of charge. Premium features may be offered in the future under a separate paid plan.</p>
            </Section>

            <Section title="3. User Accounts">
              <p>To access certain features you must register for an account. You are responsible for:</p>
              <ul style={{ paddingLeft:24, marginTop:12 }}>
                <li style={{ marginBottom:8 }}>Maintaining the confidentiality of your password</li>
                <li style={{ marginBottom:8 }}>All activity that occurs under your account</li>
                <li style={{ marginBottom:8 }}>Notifying us immediately of any unauthorised use</li>
              </ul>
              <br />
              <p>You must provide accurate, current, and complete information during registration. You may not use another person's account or transfer your account to someone else.</p>
            </Section>

            <Section title="4. Acceptable Use">
              <p>You agree not to use the Service to:</p>
              <ul style={{ paddingLeft:24, marginTop:12 }}>
                <li style={{ marginBottom:8 }}>Upload or share content that is illegal, offensive, or infringes third-party rights</li>
                <li style={{ marginBottom:8 }}>Attempt to reverse-engineer, decompile, or extract the source code of the platform</li>
                <li style={{ marginBottom:8 }}>Scrape, crawl, or use automated tools to extract data from the Service</li>
                <li style={{ marginBottom:8 }}>Use the Service in a way that could damage, disable, or impair our servers or networks</li>
                <li style={{ marginBottom:8 }}>Impersonate any person or entity</li>
                <li style={{ marginBottom:8 }}>Use the Service for any illegal purpose</li>
              </ul>
            </Section>

            <Section title="5. Your Content">
              <p>You retain ownership of all design projects and content you create using the Service ("Your Content"). By using the Service, you grant El Shaddai a limited, non-exclusive, royalty-free licence to store, process, and display Your Content solely for the purpose of providing the Service to you.</p>
              <br />
              <p>We will not use Your Content for advertising, share it publicly, or transfer it to third parties without your explicit consent.</p>
            </Section>

            <Section title="6. Intellectual Property">
              <p>The Service, including its design, interface, code, 3D models, textures, and all other materials (excluding Your Content), are the property of El Shaddai and are protected by copyright, trademark, and other applicable laws. You may not copy, reproduce, distribute, or create derivative works from any part of the Service without our prior written consent.</p>
            </Section>

            <Section title="7. Disclaimer of Warranties">
              <p>The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure. Design visualisations are for planning purposes only — actual results may vary based on lighting, materials, and construction.</p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>To the maximum extent permitted by applicable law, El Shaddai shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service. Our total liability for any claim arising from these Terms shall not exceed the amount you paid to us in the twelve months preceding the claim.</p>
            </Section>

            <Section title="9. Termination">
              <p>You may delete your account at any time from your account settings. We may suspend or terminate your access if you violate these Terms, with or without notice. Upon termination, your right to use the Service ceases immediately. We will retain your data for 30 days post-termination before permanent deletion, unless you request immediate deletion.</p>
            </Section>

            <Section title="10. Governing Law">
              <p>These Terms are governed by the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Hyderabad, Telangana, India.</p>
            </Section>

            <Section title="11. Changes to Terms">
              <p>We may update these Terms from time to time. We will notify registered users by email at least 14 days before material changes take effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.</p>
            </Section>

            <Section title="12. Contact">
              <p>Questions about these Terms? Contact us at <a href="mailto:legal@elshaddai.in" style={{ color:GOLD }}>legal@elshaddai.in</a> or write to us at the contact details on our <a href="/#contact" style={{ color:GOLD }}>Contact page</a>.</p>
            </Section>

            <div style={{ marginTop:8, padding:'32px 0', borderTop:'1px solid rgba(0,0,0,0.07)', display:'flex', gap:32, flexWrap:'wrap' }}>
              <button onClick={() => nav('/privacy-policy')} style={{ fontFamily:SS, fontSize:11, fontWeight:600, color:GOLD, background:'none', border:'none', cursor:'pointer', letterSpacing:'0.1em', textTransform:'uppercase', padding:0 }}>Privacy Policy →</button>
              <button onClick={() => nav('/')} style={{ fontFamily:SS, fontSize:11, fontWeight:600, color:MUTED, background:'none', border:'none', cursor:'pointer', letterSpacing:'0.1em', textTransform:'uppercase', padding:0 }}>Back to Home →</button>
            </div>
          </div>
        </section>

        <div style={{ background:'#0a0905', padding:'32px clamp(40px,8vw,160px)' }}>
          <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.3)', margin:0 }}>© 2025 El Shaddai Interior Design · <a href="mailto:legal@elshaddai.in" style={{ color:'rgba(255,255,255,0.35)', textDecoration:'none' }}>legal@elshaddai.in</a></p>
        </div>
      </div>
    </div>
  )
}
