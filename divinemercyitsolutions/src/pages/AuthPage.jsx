import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

const API = 'http://localhost:3001'

const ROLES = [
  { id:'CLIENT',          label:'Client / Homeowner',  desc:'Track your home project & approvals',   icon:'🏠', fields:['name','phone','city','password'] },
  { id:'DESIGNER',        label:'Interior Designer',    desc:'Manage projects & design deliverables', icon:'✦',  fields:['name','phone','organisation_name','years_experience','password'] },
  { id:'BUILDER',         label:'Builder / Contractor', desc:'Execute on-site construction work',     icon:'🏗', fields:['name','phone','organisation_name','specialisation','password'] },
  { id:'WORKSHOP_WORKER', label:'Workshop Worker',      desc:'Manufacturing & fabrication tasks',     icon:'🔨', fields:['name','phone','specialisation','password'] },
  { id:'ADMIN',           label:'Admin',                desc:'Manage team, projects & platform',      icon:'⚙',  fields:['name','phone','organisation_name','password'] },
  { id:'SUPER_ADMIN',     label:'Super Admin',          desc:'Full platform access & control',        icon:'◈',  fields:['name','phone','password'] },
]

const FIELD_META = {
  name:              { label:'Full Name',               placeholder:'Rajesh Kumar',                type:'text'     },
  phone:             { label:'Phone Number',            placeholder:'+91 98765 43210',             type:'tel'      },
  password:          { label:'Password',                placeholder:'Min 8 characters',            type:'password' },
  city:              { label:'City',                    placeholder:'Hyderabad',                   type:'text'     },
  organisation_name: { label:'Organisation / Firm',     placeholder:'Studio or company name',      type:'text'     },
  years_experience:  { label:'Years of Experience',     placeholder:'5',                           type:'number'   },
  specialisation:    { label:'Specialisation / Trade',  placeholder:'Carpenter / Tiler / Plumber', type:'text'     },
}

const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bg    = '#0d0b09'
const bdr   = '#292524'
const serif = { fontFamily:"'Cormorant Garamond', Georgia, serif" }
const sans  = { fontFamily:"'DM Sans', system-ui, sans-serif" }

function Field({ label, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:'block', fontSize:9, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:focused?gold:'#78716c', marginBottom:8, transition:'color 0.2s', ...sans }}>{label}</label>
      <input {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{ width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${focused?gold:'#44403c'}`, padding:'10px 0', fontSize:14, color:'#fff', outline:'none', ...sans, fontWeight:300, transition:'border-color 0.2s', boxSizing:'border-box' }} />
    </div>
  )
}

function SubmitBtn({ loading, label }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="submit" disabled={loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width:'100%', padding:'14px', background:loading?'#44403c':hov?'#b8902a':gold, color:'#000', border:'none', cursor:loading?'not-allowed':'pointer', ...sans, fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:10, transition:'background 0.2s' }}>
      {loading ? 'Please wait…' : label}
    </button>
  )
}

function Alert({ type, children }) {
  const c = type==='error'
    ? { bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.25)', text:'#f87171' }
    : { bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.25)', text:'#34d399' }
  return (
    <div style={{ padding:'12px 16px', background:c.bg, border:`1px solid ${c.border}`, marginBottom:20 }}>
      <p style={{ margin:0, fontSize:13, color:c.text, ...sans }}>{children}</p>
    </div>
  )
}

function RoleCard({ role, selected, onClick }) {
  const [hov, setHov] = useState(false)
  const active = selected || hov
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:'16px 14px', border:`1px solid ${active?gold:bdr}`, background:active?'rgba(201,162,39,0.06)':'transparent', cursor:'pointer', textAlign:'left', transition:'all 0.2s', display:'flex', gap:10, alignItems:'flex-start' }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{role.icon}</span>
      <div>
        <p style={{ margin:'0 0 3px', fontSize:12, fontWeight:600, color:active?gold:'#e7e5e4', ...sans, transition:'color 0.2s' }}>{role.label}</p>
        <p style={{ margin:0, fontSize:10, color:'#57534e', lineHeight:1.5, ...sans }}>{role.desc}</p>
      </div>
    </button>
  )
}

export default function AuthPage() {
  const navigate     = useNavigate()
  const location     = useLocation()
  const { user, login } = useAuth()

  const [mode, setMode]               = useState(location.pathname==='/register' ? 'register' : 'login')
  const [step, setStep]               = useState(1)
  const [selectedRole, setRole]       = useState(null)
  const [form, setForm]               = useState({})
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [googleCred, setGoogleCred]   = useState(null)   // pending Google credential
  const [googleRole, setGoogleRole]   = useState(null)   // role picked for new Google user

  const from = location.state?.from?.pathname || '/'
  useEffect(() => { if (user) navigate(from, { replace:true }) }, [user])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const roleConfig = ROLES.find(r => r.id === selectedRole)

  async function handleLogin(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res  = await fetch(`${API}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:form.email, password:form.password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      login(data.access_token, data.user)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleRegister(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (!form.password || form.password.length < 8) throw new Error('Password must be at least 8 characters')
      const res  = await fetch(`${API}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...form, role:selectedRole }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      login(data.access_token, data.user)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleGoogleSuccess(credentialResponse) {
    const credential = credentialResponse.credential
    // Decode to check if user exists first; then POST to backend
    setError(''); setLoading(true)
    try {
      const res  = await fetch(`${API}/api/auth/google`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ credential, role: googleRole || 'CLIENT' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Google sign-in failed')
      // If backend created a new user, we passed googleRole; clear modal
      setGoogleCred(null); setGoogleRole(null)
      login(data.access_token, data.user)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleGooglePending(credentialResponse) {
    // First check if user already exists by attempting sign-in without role
    setError(''); setLoading(true)
    try {
      const res  = await fetch(`${API}/api/auth/google`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ credential: credentialResponse.credential, role:'CLIENT' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Google sign-in failed')
      // If it succeeded this user already exists (or CLIENT default is fine)
      login(data.access_token, data.user)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  function switchMode(m) { setMode(m); setStep(1); setRole(null); setError(''); setSuccess(''); setForm({}); setGoogleCred(null); setGoogleRole(null) }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:bg, ...sans }}>

      {/* Left panel */}
      <div style={{ flex:'0 0 48%', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'52px 64px' }}>
        <img src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80" alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(10,8,6,0.92) 0%,rgba(10,8,6,0.72) 100%)' }} />

        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:40, height:40, border:`1.5px solid rgba(201,162,39,0.7)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.2" fill="none"/></svg>
          </div>
          <div>
            <p style={{ ...serif, margin:0, fontSize:20, fontWeight:500, color:'#fff', letterSpacing:'0.06em' }}>El Shaddai</p>
            <p style={{ margin:0, fontSize:8, color:gold, letterSpacing:'0.3em', textTransform:'uppercase', marginTop:2 }}>Interiors Platform</p>
          </div>
        </div>

        <div style={{ position:'relative' }}>
          <p style={{ margin:'0 0 16px', fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Enterprise Interior Design</p>
          <h2 style={{ ...serif, margin:'0 0 20px', fontSize:46, fontWeight:300, color:'#fff', lineHeight:1.1 }}>
            One platform.<br/>Every role.<br/><span style={{ color:gold }}>Zero chaos.</span>
          </h2>
          <p style={{ margin:'0 0 40px', fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.9, fontWeight:300, maxWidth:360 }}>
            Clients track their dream home. Designers manage deliverables. Builders log daily progress. All in real time.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {ROLES.slice(0,4).map(r => (
              <div key={r.id} style={{ border:'1px solid rgba(255,255,255,0.07)', padding:'14px 16px', background:'rgba(255,255,255,0.03)' }}>
                <p style={{ margin:'0 0 2px', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.75)' }}>{r.icon} {r.label}</p>
                <p style={{ margin:0, fontSize:9.5, color:'rgba(255,255,255,0.28)', lineHeight:1.5 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 40px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:420 }}>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
            <div style={{ width:32, height:32, border:`1.5px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.2" fill="none"/></svg>
            </div>
            <p style={{ ...serif, margin:0, fontSize:20, color:'#fff', fontWeight:500 }}>El Shaddai</p>
          </div>

          {/* Tab toggle */}
          <div style={{ display:'flex', borderBottom:`1px solid ${bdr}`, marginBottom:36 }}>
            {[['login','Sign In'],['register','Register']].map(([m,l]) => (
              <button key={m} type="button" onClick={() => switchMode(m)}
                style={{ flex:1, paddingBottom:14, background:'none', border:'none', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:mode===m?gold:'#57534e', borderBottom:`2px solid ${mode===m?gold:'transparent'}`, marginBottom:-1, transition:'all 0.2s', ...sans }}>
                {l}
              </button>
            ))}
          </div>

          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <h1 style={{ ...serif, fontSize:34, fontWeight:300, color:'#fff', margin:'0 0 6px' }}>Welcome back</h1>
              <p style={{ fontSize:13, color:'#78716c', margin:'0 0 32px', fontWeight:300 }}>Sign in to your El Shaddai account</p>
              <form onSubmit={handleLogin}>
                <Field label="Email Address" type="email" placeholder="you@example.com" value={form.email||''} onChange={set('email')} required autoComplete="email" />
                <Field label="Password" type="password" placeholder="Your password" value={form.password||''} onChange={set('password')} required autoComplete="current-password" />
                <SubmitBtn loading={loading} label="Sign In →" />
              </form>
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0 16px' }}>
                <div style={{ flex:1, height:1, background:bdr }} />
                <span style={{ fontSize:9, color:'#44403c', letterSpacing:'0.15em', textTransform:'uppercase' }}>or continue with</span>
                <div style={{ flex:1, height:1, background:bdr }} />
              </div>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
                <GoogleLogin
                  onSuccess={handleGooglePending}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                  theme="filled_black"
                  shape="square"
                  text="signin_with"
                  width="380"
                />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'8px 0 16px' }}>
                <div style={{ flex:1, height:1, background:bdr }} />
                <span style={{ fontSize:9, color:'#44403c', letterSpacing:'0.15em', textTransform:'uppercase' }}>quick demo access</span>
                <div style={{ flex:1, height:1, background:bdr }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {[
                  { label:'Admin',       email:'admin@elshaddai.in',       pw:'Admin@123',   color:gold         },
                  { label:'Super Admin', email:'superadmin@elshaddai.in',   pw:'Super@123',   color:'#f87171'    },
                  { label:'Designer',    email:'kiran@elshaddai.in',        pw:'Design@123',  color:'#8b5cf6'    },
                  { label:'Builder',     email:'farook@elshaddai.in',       pw:'Build@123',   color:'#f59e0b'    },
                  { label:'Worker',      email:'ravi@elshaddai.in',         pw:'Work@1234',   color:'#facc15'    },
                  { label:'Client',      email:'deepa.nair@gmail.com',      pw:'Client@123',  color:'#60a5fa'    },
                ].map(a => (
                  <button key={a.email} type="button" onClick={() => setForm({ email:a.email, password:a.pw })}
                    style={{ padding:'9px 6px', border:`1px solid ${bdr}`, background:'transparent', color:a.color, cursor:'pointer', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', ...sans, transition:'border-color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = bdr }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* REGISTER step 1 */}
          {mode === 'register' && step === 1 && (
            <>
              <h1 style={{ ...serif, fontSize:34, fontWeight:300, color:'#fff', margin:'0 0 6px' }}>Get started</h1>
              <p style={{ fontSize:13, color:'#78716c', margin:'0 0 24px', fontWeight:300 }}>Choose your role to continue</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {ROLES.map(r => (
                  <RoleCard key={r.id} role={r} selected={selectedRole===r.id} onClick={() => { setRole(r.id); setStep(2) }} />
                ))}
              </div>
            </>
          )}

          {/* REGISTER step 2 */}
          {mode === 'register' && step === 2 && roleConfig && (
            <>
              <button type="button" onClick={() => { setStep(1); setError('') }}
                style={{ background:'none', border:'none', color:'#78716c', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', marginBottom:24, padding:0, ...sans }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'} onMouseLeave={e => e.currentTarget.style.color='#78716c'}>
                ← Change Role
              </button>
              <h1 style={{ ...serif, fontSize:28, fontWeight:300, color:'#fff', margin:'0 0 4px' }}>Register as</h1>
              <p style={{ fontSize:14, color:gold, margin:'0 0 24px', fontWeight:500 }}>{roleConfig.icon} {roleConfig.label}</p>
              {(selectedRole==='ADMIN'||selectedRole==='SUPER_ADMIN') && (
                <div style={{ padding:'12px 16px', background:'rgba(201,162,39,0.07)', border:`1px solid rgba(201,162,39,0.2)`, marginBottom:20 }}>
                  <p style={{ margin:0, fontSize:12, color:gold, ...sans }}>⚠ Admin accounts require manual approval from a Super Admin.</p>
                </div>
              )}
              <form onSubmit={handleRegister}>
                <Field label="Email Address" type="email" placeholder="you@example.com" value={form.email||''} onChange={set('email')} required autoComplete="email" />
                {roleConfig.fields.map(f => (
                  <Field key={f} label={FIELD_META[f].label} type={FIELD_META[f].type} placeholder={FIELD_META[f].placeholder} value={form[f]||''} onChange={set(f)} required={['name','password'].includes(f)} />
                ))}
                <SubmitBtn loading={loading} label="Create Account →" />
              </form>
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0 16px' }}>
                <div style={{ flex:1, height:1, background:bdr }} />
                <span style={{ fontSize:9, color:'#44403c', letterSpacing:'0.15em', textTransform:'uppercase' }}>or sign up with Google</span>
                <div style={{ flex:1, height:1, background:bdr }} />
              </div>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <GoogleLogin
                  onSuccess={cred => { setGoogleCred(cred); setGoogleRole(selectedRole) }}
                  onError={() => setError('Google sign-up failed. Please try again.')}
                  theme="filled_black"
                  shape="square"
                  text="signup_with"
                  width="380"
                />
              </div>
            </>
          )}

          {/* Google role-picker modal — shown when a new Google user needs role confirmation */}
          {googleCred && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
              <div style={{ background:'#1c1917', border:`1px solid ${bdr}`, padding:'40px 36px', maxWidth:460, width:'90%' }}>
                <h2 style={{ ...serif, fontSize:28, fontWeight:300, color:'#fff', margin:'0 0 8px' }}>Almost there</h2>
                <p style={{ fontSize:13, color:'#78716c', margin:'0 0 28px', fontWeight:300 }}>Confirm your role — you are registering as:</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28 }}>
                  {ROLES.map(r => (
                    <RoleCard key={r.id} role={r} selected={googleRole===r.id} onClick={() => setGoogleRole(r.id)} />
                  ))}
                </div>
                {error && <Alert type="error">{error}</Alert>}
                <div style={{ display:'flex', gap:12 }}>
                  <button type="button" onClick={() => { setGoogleCred(null); setGoogleRole(null); setError('') }}
                    style={{ flex:1, padding:'12px', background:'transparent', border:`1px solid ${bdr}`, color:'#78716c', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', ...sans }}>
                    Cancel
                  </button>
                  <button type="button" disabled={!googleRole || loading}
                    onClick={() => handleGoogleSuccess(googleCred)}
                    style={{ flex:2, padding:'12px', background:googleRole?gold:'#44403c', color:'#000', border:'none', cursor:googleRole&&!loading?'pointer':'not-allowed', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', ...sans }}>
                    {loading ? 'Please wait…' : `Continue as ${ROLES.find(r=>r.id===googleRole)?.label || '…'} →`}
                  </button>
                </div>
              </div>
            </div>
          )}

          <p style={{ textAlign:'center', fontSize:10, color:'#2d2926', marginTop:28, letterSpacing:'0.05em' }}>
            By continuing you agree to our Terms of Service &amp; Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
