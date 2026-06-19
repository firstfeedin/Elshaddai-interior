import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'

const SF = "'Cormorant Garamond',Georgia,serif"
const SS = "'DM Sans',system-ui,sans-serif"
const CREAM = '#f5ede8'
const DARK  = '#2a0e14'
const DARK2 = '#1e0a0e'
const WHITE = '#ffffff'
const GOLD  = '#c4956a'
const MUTED = '#9a8a82'
const TEXT  = '#2e2e2c'

export default function AboutPage() {
  const nav = useNavigate()
  return (
    <div style={{ fontFamily:SS, background:CREAM, minHeight:'100vh' }}>
      <Navbar />
      <div style={{ paddingTop:96 }}>

        {/* Hero */}
        <section style={{ background:DARK, padding:'120px clamp(40px,8vw,160px)' }}>
          <div style={{ maxWidth:1000, margin:'0 auto', textAlign:'center' }}>
            <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:GOLD }}>About El Shaddai</span>
            <div style={{ width:36, height:1, background:GOLD, margin:'20px auto 44px' }} />
            <h1 style={{ fontFamily:SF, fontSize:'clamp(48px,6vw,90px)', fontWeight:300, color:WHITE, lineHeight:1.0, margin:'0 0 36px' }}>
              Design for <em style={{ fontStyle:'italic', color:GOLD }}>everyone.</em>
            </h1>
            <p style={{ fontFamily:SS, fontSize:16, fontWeight:300, color:'rgba(255,255,255,0.55)', lineHeight:1.95, maxWidth:660, margin:'0 auto' }}>
              El Shaddai is a free, browser-based interior design platform built to put professional-grade design tools in the hands of every homeowner, renter, and aspiring designer — without the price tag, the software downloads, or the design degree.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section style={{ background:CREAM, padding:'100px clamp(40px,8vw,160px)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:80, alignItems:'start' }}>
            <div>
              <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:GOLD }}>Our Mission</span>
              <div style={{ width:36, height:1, background:GOLD, margin:'20px 0 0' }} />
            </div>
            <div>
              <blockquote style={{ fontFamily:SF, fontSize:'clamp(24px,2.8vw,42px)', fontWeight:300, color:DARK, lineHeight:1.3, fontStyle:'italic', margin:'0 0 36px' }}>
                "We believe every room has the potential to be extraordinary. You simply need the tools to reveal it."
              </blockquote>
              <p style={{ fontFamily:SS, fontSize:15, fontWeight:300, color:MUTED, lineHeight:1.95, margin:'0 0 20px' }}>
                Interior design has always been expensive and inaccessible. 3D visualisation software costs thousands. Hiring a designer costs even more. We built El Shaddai to change that — to give every homeowner access to the same photorealistic design tools that professionals use, completely free.
              </p>
              <p style={{ fontFamily:SS, fontSize:15, fontWeight:300, color:MUTED, lineHeight:1.95 }}>
                From a blank floor plan to a fully furnished, photorealistic 3D space — entirely in your browser. No downloads. No experience required. No cost to start.
              </p>
            </div>
          </div>
        </section>

        {/* What we offer */}
        <section style={{ background:WHITE, padding:'100px clamp(40px,8vw,160px)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:GOLD }}>What We Offer</span>
              <h2 style={{ fontFamily:SF, fontSize:'clamp(36px,4vw,60px)', fontWeight:300, color:DARK, marginTop:20, lineHeight:1.05 }}>
                A complete design platform,<br /><em style={{ fontStyle:'italic', color:GOLD }}>free forever.</em>
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
              {[
                { n:'01', title:'2D Floor Planning', desc:'Draw your space with precision snap tools. Import photos of your room or start from 500+ templates. AI can generate a floor plan from a text description.' },
                { n:'02', title:'3D Live Visualisation', desc:'Every wall, furniture piece, and material choice appears instantly in a live 3D scene. No rendering wait — real-time design feedback.' },
                { n:'03', title:'150+ Furniture Catalogue', desc:'Browse curated furniture from top Indian and global brands. Sofa, bed, kitchen island, bathroom vanity — all drag-and-drop.' },
                { n:'04', title:'30+ Material Finishes', desc:'Choose wall colours, flooring textures, ceiling styles. See every finish decision reflected in your 3D view immediately.' },
                { n:'05', title:'AR Room Preview', desc:'Point your phone at any room and see your furniture placed in your actual physical space using WebXR augmented reality.' },
                { n:'06', title:'Export & Share', desc:'Generate a professional PDF design report, export PNG renders, or share a live link for client or family review.' },
              ].map(({ n, title, desc }) => (
                <div key={n} style={{ background:CREAM, padding:'40px 32px', borderBottom:`1px solid rgba(0,0,0,0.05)` }}>
                  <div style={{ fontFamily:SF, fontSize:44, fontWeight:300, color:'rgba(0,0,0,0.07)', lineHeight:1, marginBottom:20 }}>{n}</div>
                  <h3 style={{ fontFamily:SS, fontSize:14, fontWeight:700, color:DARK, margin:'0 0 12px' }}>{title}</h3>
                  <p style={{ fontFamily:SS, fontSize:13, fontWeight:300, color:MUTED, lineHeight:1.9, margin:0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ background:DARK2, padding:'100px clamp(40px,8vw,160px)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:GOLD }}>Our Values</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:40 }}>
              {[
                { icon:'◻', title:'Free Forever', desc:'The core studio — floor plan, 3D designer, furniture, materials — will always be free. No hidden fees.' },
                { icon:'◈', title:'No Experience Needed', desc:'Built for homeowners and renters, not architects. If you can drag and drop, you can design.' },
                { icon:'⊞', title:'Privacy First', desc:'Your designs are yours. We never sell your data or share your projects without permission.' },
                { icon:'✦', title:'Indian-First Design', desc:'Built with Indian room sizes, material preferences, and furniture brands in mind from day one.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ textAlign:'center', padding:'32px 24px', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontFamily:SS, fontSize:28, color:GOLD, marginBottom:20 }}>{icon}</div>
                  <h3 style={{ fontFamily:SS, fontSize:13, fontWeight:700, color:WHITE, margin:'0 0 12px' }}>{title}</h3>
                  <p style={{ fontFamily:SS, fontSize:12, fontWeight:300, color:'rgba(255,255,255,0.45)', lineHeight:1.8, margin:0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background:CREAM, padding:'100px clamp(40px,8vw,160px)', textAlign:'center' }}>
          <span style={{ fontFamily:SS, fontSize:9, fontWeight:700, letterSpacing:'0.38em', textTransform:'uppercase', color:GOLD }}>Start Today</span>
          <h2 style={{ fontFamily:SF, fontSize:'clamp(40px,5vw,72px)', fontWeight:300, color:DARK, margin:'24px 0 20px', lineHeight:1.0 }}>
            Your space is waiting.
          </h2>
          <p style={{ fontFamily:SS, fontSize:14, fontWeight:300, color:MUTED, lineHeight:1.9, maxWidth:480, margin:'0 auto 44px' }}>
            Open the studio and start designing — no signup, no download, no cost.
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:32, flexWrap:'wrap' }}>
            <button onClick={() => nav('/studio')}
              style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:WHITE, background:DARK, border:'none', padding:'16px 52px', cursor:'pointer', transition:'opacity 0.3s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Open Studio — Free →
            </button>
            <button onClick={() => nav('/#contact')}
              style={{ fontFamily:SS, fontSize:10, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:MUTED, background:'transparent', border:'none', cursor:'pointer', padding:0 }}>
              Contact Us →
            </button>
          </div>
        </section>

        {/* Footer strip */}
        <div style={{ background:'#0a0905', padding:'32px clamp(40px,8vw,160px)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <p style={{ fontFamily:SS, fontSize:11, color:'rgba(255,255,255,0.3)', margin:0 }}>© 2025 El Shaddai Interior Design</p>
          <div style={{ display:'flex', gap:24 }}>
            {[['Home','/'],['Studio','/studio'],['Gallery','/gallery'],['Pricing','/pricing'],['Contact','/#contact']].map(([l,h])=>(
              <a key={l} href={h} style={{ fontFamily:SS, fontSize:10, color:'rgba(255,255,255,0.35)', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}
                onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
