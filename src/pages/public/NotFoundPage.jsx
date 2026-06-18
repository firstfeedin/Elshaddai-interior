export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#1c1917', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif", textAlign: 'center', padding: '40px 24px',
    }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(80px,18vw,160px)', fontWeight: 300, color: '#c9a227', lineHeight: 1, marginBottom: 8 }}>404</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(22px,4vw,36px)', fontWeight: 300, color: '#fff', marginBottom: 16 }}>Page Not Found</h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 360, lineHeight: 1.8, marginBottom: 40 }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back home.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/" style={{
          background: '#c9a227', color: '#000', padding: '13px 32px',
          fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          textDecoration: 'none', display: 'inline-block',
        }}>Go Home</a>
        <a href="/#contact" style={{
          background: 'transparent', color: '#c9a227', border: '1px solid #c9a227',
          padding: '13px 32px', fontWeight: 700, fontSize: 11,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          textDecoration: 'none', display: 'inline-block',
        }}>Contact Us</a>
      </div>
      <p style={{ marginTop: 60, fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        El Shaddai Interiors · Hyderabad, Telangana
      </p>
    </div>
  )
}
