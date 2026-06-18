import AppShell from '../../components/layout/AppShell'
import { useState } from 'react'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const QUEUE = [
  { id:1, project:'Sharma Residence',   res:'4K',  style:'Photorealistic', status:'Completed',  time:'4m 12s', progress:100, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=80&q=60' },
  { id:2, project:'Gupta Kitchen',      res:'8K',  style:'Photorealistic', status:'Processing', time:'~6m',    progress:67,  img:null },
  { id:3, project:'Master Bedroom',     res:'HD',  style:'Watercolor',     status:'Queued',     time:'—',      progress:0,   img:null },
  { id:4, project:'Corner Office',      res:'4K',  style:'Sketch',         status:'Completed',  time:'2m 48s', progress:100, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=80&q=60' },
  { id:5, project:'Cafe Interior',      res:'4K',  style:'Blueprint',      status:'Failed',     time:'—',      progress:0,   img:null },
]

const STATUS_DOT = { Completed: gold, Processing: '#f59e0b', Queued: border, Failed: '#ef4444' }

const PREVIEWS = [
  { title:'Sharma Residence', style:'4K · Photorealistic', img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=70' },
  { title:'Gupta Kitchen',    style:'4K · Photorealistic', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=300&q=70' },
  { title:'Corner Office',    style:'4K · Sketch',         img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=300&q=70' },
]

function Lbl({ children }) {
  return <p style={{ ...sans, margin: '0 0 7px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>{children}</p>
}

function Sel({ value, onChange, opts }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...sans, width: '100%', padding: '9px 0', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${border}`, fontSize: 13, color: dark, outline: 'none', marginBottom: 20, cursor: 'pointer', appearance: 'none', fontWeight: 300 }}>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}

export default function RenderingPage() {
  const [quality,   setQuality]   = useState('4K')
  const [lighting,  setLighting]  = useState('Daylight')
  const [style,     setStyle]     = useState('Photorealistic')
  const [camera,    setCamera]    = useState('Current view')
  const [rendering, setRendering] = useState(false)
  const credits = 847

  const startRender = () => { setRendering(true); setTimeout(() => setRendering(false), 3000) }

  return (
    <AppShell title="Render Studio">
      <div style={{ ...sans, padding: '32px 36px', display: 'flex', gap: 24, maxWidth: 1280 }}>

        {/* Settings panel */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '26px 26px' }}>
            <h3 style={{ ...serif, margin: '0 0 24px', fontSize: 22, fontWeight: 300, color: dark }}>Render Settings</h3>

            <Lbl>Quality</Lbl>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {[['HD','1920×1080 · Fast'],['4K','3840×2160 · Recommended'],['8K','7680×4320 · Premium']].map(([q, desc]) => (
                <button key={q} onClick={() => setQuality(q)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', border: `1px solid ${quality === q ? dark : border}`, background: quality === q ? dark : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ ...sans, margin: 0, fontSize: 12, fontWeight: 600, color: quality === q ? '#fff' : dark }}>{q}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 10, color: quality === q ? 'rgba(255,255,255,0.45)' : '#a8a29e', fontWeight: 300 }}>{desc}</p>
                  </div>
                  {quality === q && <div style={{ width: 6, height: 6, background: gold, borderRadius: '50%' }} />}
                </button>
              ))}
            </div>

            <Lbl>Lighting Preset</Lbl>
            <Sel value={lighting} onChange={setLighting} opts={['Daylight','Studio','Evening','Dramatic','Overcast']} />

            <Lbl>Render Style</Lbl>
            <Sel value={style}    onChange={setStyle}    opts={['Photorealistic','Sketch','Watercolor','Blueprint','Cartoon']} />

            <Lbl>Camera Angle</Lbl>
            <Sel value={camera}   onChange={setCamera}   opts={['Current view','Top view','Front view','Isometric','45° Corner']} />

            <div style={{ padding: '14px 16px', background: light, border: `1px solid ${border}`, marginBottom: 20 }}>
              <p style={{ ...sans, margin: '0 0 4px', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e' }}>Estimated Time</p>
              <p style={{ ...serif, margin: '0 0 2px', fontSize: 26, fontWeight: 300, color: dark }}>{quality === 'HD' ? '~2 min' : quality === '4K' ? '~6 min' : '~18 min'}</p>
              <p style={{ ...sans, margin: 0, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>Credits: {quality === 'HD' ? '5' : quality === '4K' ? '15' : '40'} / render</p>
            </div>

            <button onClick={startRender} disabled={rendering}
              style={{ ...sans, width: '100%', padding: '12px', background: rendering ? '#e7e5e4' : gold, color: rendering ? '#a8a29e' : '#000', border: 'none', cursor: rendering ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.2s' }}>
              {rendering ? 'Starting Render...' : 'Start Render →'}
            </button>
          </div>

          {/* Credits */}
          <div style={{ background: dark, padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
              <p style={{ ...sans, margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Cloud Credits</p>
              <p style={{ ...serif, margin: 0, fontSize: 26, fontWeight: 300, color: gold }}>{credits}</p>
            </div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', marginBottom: 6, overflow: 'hidden' }}>
              <div style={{ width: `${(credits / 1000) * 100}%`, height: '100%', background: gold }} />
            </div>
            <p style={{ ...sans, margin: '0 0 14px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>{credits} / 1000 remaining</p>
            <button style={{ ...sans, width: '100%', padding: '9px', background: 'transparent', border: `1px solid rgba(255,255,255,0.1)`, color: gold, cursor: 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Buy More Credits</button>
          </div>
        </div>

        {/* Queue + Gallery */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Queue table */}
          <div style={{ background: '#fff', border: `1px solid ${border}`, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ ...sans, margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Render Queue &amp; History</p>
              <button onClick={() => window.location.href = '/projects'} style={{ ...sans, padding: '6px 14px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>View All</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: light }}>
                  {['Project','Resolution','Style','Status','Time','Actions'].map(h => (
                    <th key={h} style={{ ...sans, padding: '11px 18px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e', borderBottom: `1px solid ${border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUEUE.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < QUEUE.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {r.img
                          ? <img src={r.img} alt="" style={{ width: 36, height: 36, objectFit: 'cover' }} />
                          : <div style={{ width: 36, height: 36, background: light, border: `1px solid ${border}` }} />}
                        <span style={{ ...sans, fontSize: 13, fontWeight: 400, color: dark }}>{r.project}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}><span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: dark }}>{r.res}</span></td>
                    <td style={{ ...sans, padding: '14px 18px', fontSize: 12, color: stone, fontWeight: 300 }}>{r.style}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT[r.status], flexShrink: 0 }} />
                        <span style={{ ...sans, fontSize: 11, color: r.status === 'Completed' ? gold : r.status === 'Failed' ? '#ef4444' : stone, fontWeight: 400 }}>{r.status}</span>
                      </div>
                      {r.status === 'Processing' && (
                        <div style={{ marginTop: 6, height: 2, background: border, width: 80, overflow: 'hidden' }}>
                          <div style={{ width: `${r.progress}%`, height: '100%', background: gold }} />
                        </div>
                      )}
                    </td>
                    <td style={{ ...sans, padding: '14px 18px', fontSize: 12, color: '#a8a29e', fontWeight: 300 }}>{r.time}</td>
                    <td style={{ padding: '14px 18px' }}>
                      {r.status === 'Completed' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ ...sans, padding: '5px 10px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>Download</button>
                          <button style={{ ...sans, padding: '5px 10px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>Share</button>
                        </div>
                      )}
                      {r.status === 'Failed' && <button style={{ ...sans, padding: '5px 10px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>Retry</button>}
                      {r.status === 'Queued' && <button style={{ ...sans, padding: '5px 10px', background: 'transparent', border: `1px solid ${border}`, color: '#a8a29e', cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>Cancel</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Completed renders */}
          <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '22px 24px' }}>
            <p style={{ ...sans, margin: '0 0 16px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Completed Renders</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
              {PREVIEWS.map((p, i) => (
                <div key={i} style={{ cursor: 'pointer', border: `1px solid ${border}`, overflow: 'hidden', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = dark}
                  onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                  <div style={{ height: 120, overflow: 'hidden' }}>
                    <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ ...sans, margin: '0 0 2px', fontSize: 12, fontWeight: 500, color: dark }}>{p.title}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{p.style}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
