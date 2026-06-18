import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const SECTIONS = ['Profile','Company','Notifications','Integrations','Billing','Security','Appearance']

const INTEGRATIONS = [
  { name:'Google Workspace',  desc:'Sync calendar, Drive files, and email',          connected:true,  icon:'G' },
  { name:'WhatsApp Business', desc:'Send project updates and invoices via WhatsApp',  connected:true,  icon:'W' },
  { name:'Tally Prime',       desc:'Sync invoices and P&L to accounting software',    connected:false, icon:'T' },
  { name:'AWS S3',            desc:'Store project files and renders in the cloud',    connected:true,  icon:'S' },
  { name:'Razorpay',          desc:'Accept online payments from clients',             connected:false, icon:'R' },
  { name:'Slack',             desc:'Team notifications and project alerts',           connected:false, icon:'S' },
  { name:'Zoom',              desc:'Schedule and join client meetings from portal',   connected:true,  icon:'Z' },
  { name:'Shiprocket',        desc:'Track material deliveries and shipments',         connected:false, icon:'S' },
]

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width:40, height:22, background:value?gold:bdr, cursor:'pointer', position:'relative', flexShrink:0 }}>
      <div style={{ width:16, height:16, background:'#fff', position:'absolute', top:3, left:value?21:3, transition:'left 0.15s ease' }} />
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>{label}</label>
      {children}
      {hint && <p style={{ ...sans, fontSize:10, color:'#a8a29e', margin:'5px 0 0' }}>{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const { user, login } = useAuth()
  const storedUser = user || JSON.parse(localStorage.getItem('es_user') || '{}')
  const [section,    setSection]    = useState('Profile')
  const [saved,      setSaved]      = useState(false)
  const [saveError,  setSaveError]  = useState('')
  const [saving,     setSaving]     = useState(false)
  const [integrations, setIntegrations] = useState(INTEGRATIONS)

  // Profile state
  const [profile, setProfile] = useState({
    name:    storedUser.name  || 'Aravind Kumar',
    email:   storedUser.email || '',
    phone:   '+91 98400 12345',
    role:    storedUser.role  || 'SUPER_ADMIN',
    avatar:  storedUser.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || 'AK',
    bio:     '50+ years of engineering excellence. Founded El Shaddai Design Studio in 2004.',
    timezone:'Asia/Kolkata (IST +5:30)',
    language:'English (India)',
  })

  // Company state
  const [company, setCompany] = useState({
    name:       'El Shaddai Design Studio',
    tagline:    '50+ Years of Engineering Excellence',
    address:    'Plot 42, Jubilee Hills Road No. 36, Hyderabad — 500033, Telangana',
    phone:      '+91 40 2345 6789',
    email:      'contactus@divinemercyitsol.com',
    website:    'www.divinemercyitsol.com',
    gst:        '33AAACE2781H1ZP',
    pan:        'AAACE2781H',
    founded:    '1974',
    employees:  '48',
  })

  // Notification state
  const [notifs, setNotifs] = useState({
    projectUpdates:  true,  taskAssigned:    true,  invoicePaid:     true,
    newMessage:      true,  approvalPending: true,  deliveryAlert:   false,
    lowStock:        true,  weeklyReport:    true,  loginAlert:      true,
    emailDigest:     false, whatsapp:        true,  browserPush:     false,
  })

  // Appearance
  const [appearance, setAppearance] = useState({ accentColor:'#c9a227', compactMode:false, sidebarCollapsed:false, showBreadcrumbs:true })

  async function save() {
    setSaving(true); setSaveError('')
    try {
      const token = localStorage.getItem('es_token')
      const res = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, phone: profile.phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      // Update auth context and localStorage
      const updated = { ...storedUser, name: profile.name, phone: profile.phone }
      login(token, updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const InputStyle = { ...sans, width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box', background:'#fff' }

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke={gold} strokeWidth="1.3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" stroke={gold} strokeWidth="1.3" strokeLinecap="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Platform <span style={{ color:gold }}>Settings</span></p>
        <div style={{ flex:1 }} />
        {saved     && <span style={{ ...sans, fontSize:10, color:'#22c55e', fontWeight:700, letterSpacing:'0.1em' }}>✓ SAVED</span>}
        {saveError && <span style={{ ...sans, fontSize:10, color:'#f87171', fontWeight:500 }}>{saveError}</span>}
        <button onClick={save} disabled={saving} style={{ ...sans, padding:'7px 20px', background:saving?'#a8a29e':gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', minHeight:'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <div style={{ background:dark, padding:'20px 0', borderRight:'1px solid #292524' }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setSection(s)}
              style={{ ...sans, display:'block', width:'100%', textAlign:'left', padding:'10px 20px', background:s===section?'rgba(201,162,39,0.1)':'none', border:'none', borderLeft:`2px solid ${s===section?gold:'transparent'}`, color:s===section?gold:'#78716c', fontSize:11, fontWeight:s===section?700:400, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', marginBottom:2 }}>
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding:36, maxWidth:660 }}>
          {/* Profile */}
          {section === 'Profile' && (
            <div>
              <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 24px' }}>Profile Settings</p>
              <div style={{ display:'flex', gap:20, alignItems:'center', marginBottom:28, padding:'20px 24px', background:'#fff', border:`1px solid ${bdr}` }}>
                <div style={{ width:64, height:64, background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:22, color:'#000', flexShrink:0 }}>{profile.avatar}</div>
                <div>
                  <p style={{ ...sans, fontSize:13, fontWeight:600, color:dark, margin:'0 0 4px' }}>{profile.name}</p>
                  <p style={{ ...sans, fontSize:10, color:stone, margin:'0 0 8px', letterSpacing:'0.08em', textTransform:'uppercase' }}>{profile.role.replace('_',' ')}</p>
                  <button style={{ ...sans, padding:'5px 14px', background:`${gold}12`, border:`1px solid ${gold}`, color:dark, fontSize:9.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Change Photo</button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <Field label="Full Name">
                  <input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} style={InputStyle} />
                </Field>
                <Field label="Email">
                  <input value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} style={InputStyle} />
                </Field>
                <Field label="Phone">
                  <input value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} style={InputStyle} />
                </Field>
                <Field label="Timezone">
                  <select value={profile.timezone} onChange={e=>setProfile(p=>({...p,timezone:e.target.value}))} style={{ ...InputStyle }}>
                    <option>Asia/Kolkata (IST +5:30)</option>
                    <option>UTC+0 (GMT)</option>
                  </select>
                </Field>
                <div style={{ gridColumn:'1/-1' }}>
                  <Field label="Bio">
                    <textarea value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} rows={2}
                      style={{ ...InputStyle, resize:'vertical', lineHeight:1.65 }} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Company */}
          {section === 'Company' && (
            <div>
              <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 24px' }}>Company Settings</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <Field label="Company Name">
                    <input value={company.name} onChange={e=>setCompany(c=>({...c,name:e.target.value}))} style={InputStyle} />
                  </Field>
                </div>
                <Field label="Tagline">
                  <input value={company.tagline} onChange={e=>setCompany(c=>({...c,tagline:e.target.value}))} style={InputStyle} />
                </Field>
                <Field label="Founded Year">
                  <input value={company.founded} onChange={e=>setCompany(c=>({...c,founded:e.target.value}))} style={InputStyle} />
                </Field>
                <div style={{ gridColumn:'1/-1' }}>
                  <Field label="Address">
                    <input value={company.address} onChange={e=>setCompany(c=>({...c,address:e.target.value}))} style={InputStyle} />
                  </Field>
                </div>
                <Field label="Phone"><input value={company.phone} onChange={e=>setCompany(c=>({...c,phone:e.target.value}))} style={InputStyle} /></Field>
                <Field label="Email"><input value={company.email} onChange={e=>setCompany(c=>({...c,email:e.target.value}))} style={InputStyle} /></Field>
                <Field label="GST Number"><input value={company.gst} onChange={e=>setCompany(c=>({...c,gst:e.target.value}))} style={InputStyle} /></Field>
                <Field label="PAN"><input value={company.pan} onChange={e=>setCompany(c=>({...c,pan:e.target.value}))} style={InputStyle} /></Field>
              </div>
            </div>
          )}

          {/* Notifications */}
          {section === 'Notifications' && (
            <div>
              <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 24px' }}>Notification Settings</p>
              {[
                { heading:'Project & Tasks', items:[
                  ['projectUpdates','Project status updates'],
                  ['taskAssigned','New task assignments'],
                  ['approvalPending','Approval requests pending'],
                ]},
                { heading:'Finance', items:[
                  ['invoicePaid','Invoice paid by client'],
                  ['lowStock','Low stock alert'],
                  ['deliveryAlert','Material delivery alerts'],
                ]},
                { heading:'Communication', items:[
                  ['newMessage','New client messages'],
                  ['weeklyReport','Weekly summary report'],
                  ['loginAlert','Login from new device'],
                ]},
                { heading:'Channels', items:[
                  ['emailDigest','Daily email digest'],
                  ['whatsapp','WhatsApp notifications'],
                  ['browserPush','Browser push notifications'],
                ]},
              ].map(group => (
                <div key={group.heading} style={{ marginBottom:24 }}>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 12px' }}>{group.heading}</p>
                  <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
                    {group.items.map(([key,label],i) => (
                      <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:i<group.items.length-1?`1px solid ${bdr}`:'none' }}>
                        <span style={{ ...sans, fontSize:12, color:dark }}>{label}</span>
                        <Toggle value={notifs[key]} onChange={v => setNotifs(n=>({...n,[key]:v}))} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Integrations */}
          {section === 'Integrations' && (
            <div>
              <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 8px' }}>Integrations</p>
              <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 24px' }}>Connect El Shaddai with your existing tools and services.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {integrations.map((intg,i) => (
                  <div key={intg.name} style={{ background:'#fff', border:`1px solid ${intg.connected?gold:bdr}`, padding:'16px 20px', display:'flex', gap:16, alignItems:'center' }}>
                    <div style={{ width:40, height:40, background:intg.connected?`${gold}18`:light, border:`1px solid ${intg.connected?gold:bdr}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:intg.connected?dark:stone, flexShrink:0 }}>{intg.icon}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 3px' }}>{intg.name}</p>
                      <p style={{ ...sans, fontSize:10.5, color:stone, margin:0 }}>{intg.desc}</p>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      {intg.connected && <span style={{ ...sans, fontSize:8.5, fontWeight:700, color:'#22c55e', letterSpacing:'0.1em' }}>● CONNECTED</span>}
                      <button onClick={() => setIntegrations(prev => prev.map((it,j) => j===i ? {...it,connected:!it.connected} : it))}
                        style={{ ...sans, padding:'6px 14px', background:intg.connected?'#fff':gold, border:`1px solid ${intg.connected?bdr:gold}`, color:intg.connected?stone:'#000', fontWeight:700, fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
                        {intg.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {section === 'Security' && (
            <div>
              <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 24px' }}>Security</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { label:'Change Password', desc:'Update your login password', btn:'Change', link:null },
                  { label:'Two-Factor Authentication', desc:'Add an extra layer of security with TOTP', btn:'Setup MFA', link:'/mfa-setup' },
                  { label:'Active Sessions', desc:'2 active sessions — Hyderabad (current) · Mumbai', btn:'Revoke All', link:null },
                  { label:'API Keys', desc:'Manage API keys for third-party integrations', btn:'Manage', link:null },
                  { label:'Audit Log', desc:'View all login events and account activity', btn:'View Log', link:'/audit-log' },
                ].map(item => (
                  <div key={item.label} style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 3px' }}>{item.label}</p>
                      <p style={{ ...sans, fontSize:10.5, color:stone, margin:0 }}>{item.desc}</p>
                    </div>
                    {item.link
                      ? <Link to={item.link} style={{ ...sans, padding:'7px 16px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', textDecoration:'none' }}>{item.btn}</Link>
                      : <button style={{ ...sans, padding:'7px 16px', background:'#fff', border:`1px solid ${bdr}`, color:dark, fontWeight:700, fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>{item.btn}</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance */}
          {section === 'Appearance' && (
            <div>
              <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 24px' }}>Appearance</p>
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px', marginBottom:20 }}>
                <Field label="Accent Colour">
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <input type="color" value={appearance.accentColor} onChange={e=>setAppearance(a=>({...a,accentColor:e.target.value}))}
                      style={{ width:48, height:36, border:`1px solid ${bdr}`, padding:2, cursor:'pointer' }} />
                    <span style={{ ...sans, fontSize:12, color:dark }}>{appearance.accentColor}</span>
                    <button onClick={() => setAppearance(a=>({...a,accentColor:'#c9a227'}))} style={{ ...sans, fontSize:9, color:stone, background:'none', border:`1px solid ${bdr}`, padding:'4px 10px', cursor:'pointer' }}>Reset to Gold</button>
                  </div>
                </Field>
                {[
                  ['compactMode',       'Compact Mode',       'Reduce padding for higher information density'],
                  ['sidebarCollapsed',  'Collapse Sidebar',   'Start with sidebar collapsed by default'],
                  ['showBreadcrumbs',   'Show Breadcrumbs',   'Display navigation path in page headers'],
                ].map(([key,label,hint]) => (
                  <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderTop:`1px solid ${bdr}` }}>
                    <div>
                      <p style={{ ...sans, fontSize:12, fontWeight:500, color:dark, margin:'0 0 2px' }}>{label}</p>
                      <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{hint}</p>
                    </div>
                    <Toggle value={appearance[key]} onChange={v => setAppearance(a=>({...a,[key]:v}))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing */}
          {section === 'Billing' && (
            <div>
              <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 8px' }}>Billing & Plan</p>
              <div style={{ background:dark, padding:'24px 28px', marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:gold, margin:'0 0 6px' }}>Current Plan</p>
                    <p style={{ ...serif, fontSize:28, fontWeight:300, color:'#fff', margin:'0 0 4px' }}>Enterprise</p>
                    <p style={{ ...sans, fontSize:11, color:'#78716c', margin:0 }}>Unlimited projects · 50 users · All features</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ ...serif, fontSize:32, fontWeight:300, color:gold, margin:0 }}>₹24,999<span style={{ fontSize:13, color:'#78716c' }}>/mo</span></p>
                    <p style={{ ...sans, fontSize:9, color:'#78716c', margin:'4px 0 0' }}>Next renewal: Aug 01, 2026</p>
                  </div>
                </div>
              </div>
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 14px' }}>Recent Invoices</p>
                {[
                  { date:'Jul 01, 2026', amount:'₹24,999', status:'Upcoming' },
                  { date:'Jun 01, 2026', amount:'₹24,999', status:'Paid' },
                  { date:'May 01, 2026', amount:'₹24,999', status:'Paid' },
                ].map(inv => (
                  <div key={inv.date} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${bdr}` }}>
                    <span style={{ ...sans, fontSize:11.5, color:dark }}>{inv.date}</span>
                    <span style={{ ...sans, fontSize:12, color:dark, fontWeight:700 }}>{inv.amount}</span>
                    <span style={{ ...sans, fontSize:8.5, fontWeight:700, color:inv.status==='Paid'?'#22c55e':gold, border:`1px solid ${inv.status==='Paid'?'#22c55e':gold}`, padding:'2px 8px', letterSpacing:'0.1em' }}>{inv.status.toUpperCase()}</span>
                    <button style={{ ...sans, fontSize:9, color:stone, background:'none', border:`1px solid ${bdr}`, padding:'4px 10px', cursor:'pointer' }}>Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
