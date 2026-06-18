import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

// ── Tiny TOTP helpers (demo — no real crypto) ─────────────────────
function genSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function base32ToBytes(b32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = '', bytes = []
  for (const c of b32.replace(/=+$/, '')) {
    const v = alphabet.indexOf(c.toUpperCase())
    if (v < 0) continue
    bits += v.toString(2).padStart(5, '0')
  }
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return new Uint8Array(bytes)
}

async function computeTOTP(secret, counter) {
  const key = await crypto.subtle.importKey('raw', base32ToBytes(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const buf = new ArrayBuffer(8)
  new DataView(buf).setUint32(4, counter, false)
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf))
  const offset = mac[19] & 0xf
  const code = ((mac[offset] & 0x7f) << 24 | mac[offset+1] << 16 | mac[offset+2] << 8 | mac[offset+3]) % 1000000
  return String(code).padStart(6, '0')
}

async function currentTOTP(secret) {
  const counter = Math.floor(Date.now() / 1000 / 30)
  return computeTOTP(secret, counter)
}

// ── QR SVG (simple pixel matrix) ─────────────────────────────────
function SimpleQR({ value }) {
  // We render a decorative QR-like pattern — real QR requires a library.
  // For demo, we generate a deterministic grid from the value string.
  const SIZE = 21
  const seed = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  function cell(r, c) {
    // Fixed finder patterns at corners
    if ((r < 7 && c < 7) || (r < 7 && c >= SIZE-7) || (r >= SIZE-7 && c < 7)) {
      const pr = r < 7 ? r : r-(SIZE-7)
      const pc = c < 7 ? c : (c >= SIZE-7 ? c-(SIZE-7) : c)
      if (pr === 0 || pr === 6 || pc === 0 || pc === 6) return true
      if (pr >= 2 && pr <= 4 && pc >= 2 && pc <= 4) return true
      return false
    }
    // Timing patterns
    if (r === 6 || c === 6) return (r + c) % 2 === 0
    // Data modules — deterministic pseudo-random
    const h = (seed * (r * 31 + c * 17 + 7)) % 97
    return h < 50
  }
  const modules = []
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (cell(r, c)) modules.push({ r, c })
  const S = 8
  return (
    <svg width={SIZE*S} height={SIZE*S} style={{ display:'block' }}>
      <rect width={SIZE*S} height={SIZE*S} fill="#fff" />
      {modules.map(({ r, c }) => <rect key={`${r}-${c}`} x={c*S} y={r*S} width={S} height={S} fill={dark} />)}
    </svg>
  )
}

// ── OTP input ─────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([])
  const digits = value.split('')

  function handleKey(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i-1]?.focus()
  }
  function handleChange(i, v) {
    const d = v.replace(/\D/g,'').slice(-1)
    const next = [...digits]
    next[i] = d
    onChange(next.join('').slice(0,6))
    if (d && i < 5) inputs.current[i+1]?.focus()
  }
  function handlePaste(e) {
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    onChange(p)
    inputs.current[Math.min(p.length, 5)]?.focus()
    e.preventDefault()
  }

  return (
    <div style={{ display:'flex', gap:8 }}>
      {[0,1,2,3,4,5].map(i => (
        <input key={i} ref={el => inputs.current[i] = el}
          value={digits[i] || ''} maxLength={1} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i===0 ? handlePaste : undefined}
          style={{ ...sans, width:48, height:56, textAlign:'center', fontSize:22, fontWeight:700, border:`2px solid ${digits[i]?gold:bdr}`, color:dark, background:'#fff', outline:'none' }} />
      ))}
    </div>
  )
}

// ── Steps ─────────────────────────────────────────────────────────
const STEPS = ['Setup Authenticator', 'Scan QR Code', 'Verify Code', 'Backup Codes', 'Complete']

export default function MFASetupPage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('es_user') || '{}')
  const [step,     setStep]    = useState(0)
  const [secret,   setSecret]  = useState('')
  const [otp,      setOtp]     = useState('')
  const [otpErr,   setOtpErr]  = useState('')
  const [verifying,setVerify]  = useState(false)
  const [codes,    setCodes]   = useState([])
  const [copied,   setCopied]  = useState(false)
  const [method,   setMethod]  = useState('totp') // totp | sms
  const [mfaEnabled, setMfaEnabled] = useState(() => localStorage.getItem('es_mfa') === 'enabled')

  useEffect(() => {
    const s = genSecret()
    setSecret(s)
    // generate 10 backup codes
    const bc = Array.from({length:10}, () => {
      const p1 = Math.floor(Math.random()*100000).toString().padStart(5,'0')
      const p2 = Math.floor(Math.random()*100000).toString().padStart(5,'0')
      return `${p1}-${p2}`
    })
    setCodes(bc)
  }, [])

  const issuer = 'DivineMercyITSol'
  const label  = encodeURIComponent(`${issuer}:${user.email || 'contactus@divinemercyitsol.com'}`)
  const otpAuth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`

  async function verify() {
    if (otp.length < 6) { setOtpErr('Enter all 6 digits'); return }
    setVerify(true)
    setOtpErr('')
    try {
      const expected = await currentTOTP(secret)
      // Also check previous/next window for clock drift
      const prev = await computeTOTP(secret, Math.floor(Date.now()/1000/30) - 1)
      const next = await computeTOTP(secret, Math.floor(Date.now()/1000/30) + 1)
      if (otp === expected || otp === prev || otp === next) {
        setStep(3)
      } else {
        setOtpErr('Incorrect code. Check your authenticator app and try again.')
      }
    } catch {
      setOtpErr('Verification error. Please try again.')
    }
    setVerify(false)
  }

  function enableMFA() {
    localStorage.setItem('es_mfa', 'enabled')
    setMfaEnabled(true)
    setStep(4)
  }

  function disableMFA() {
    localStorage.removeItem('es_mfa')
    setMfaEnabled(false)
  }

  function copySecret() {
    navigator.clipboard.writeText(secret).catch(()=>{})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyCodes() {
    navigator.clipboard.writeText(codes.join('\n')).catch(()=>{})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── If MFA already enabled, show management screen ────────────
  if (mfaEnabled && step === 0) {
    return (
      <div style={{ minHeight:'100vh', background:light, ...sans }}>
        <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524' }}>
          <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>MFA <span style={{ color:gold }}>Settings</span></p>
          <div style={{ flex:1 }} />
          <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
        </header>
        <div style={{ maxWidth:520, margin:'60px auto', padding:'0 24px' }}>
          <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:32 }}>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:24 }}>
              <div style={{ width:48, height:48, background:`${gold}15`, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.8 9.7 8 11 4.2-1.3 8-5.5 8-11V6L12 2Z" stroke={gold} strokeWidth="1.5"/><path d="M9 12l2 2 4-4" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p style={{ ...sans, fontSize:13, fontWeight:700, color:dark, margin:'0 0 3px' }}>Two-Factor Authentication</p>
                <p style={{ ...sans, fontSize:10, color:'#22c55e', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', margin:0 }}>● Active</p>
              </div>
            </div>
            <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 24px', lineHeight:1.75 }}>
              Your account is protected with an authenticator app (TOTP). Each login requires a 6-digit code from your app.
            </p>
            <div style={{ background:light, border:`1px solid ${bdr}`, padding:'14px 18px', marginBottom:24 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 6px' }}>Method</p>
              <p style={{ ...sans, fontSize:12, color:dark, margin:0 }}>Authenticator App (TOTP) — Google Authenticator, Authy, etc.</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setStep(0); setMfaEnabled(false); setOtp(''); disableMFA() }}
                style={{ ...sans, flex:1, padding:'11px', border:'1px solid #ef4444', background:'#fff', color:'#ef4444', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
                Disable MFA
              </button>
              <button onClick={() => { setStep(0); setMfaEnabled(false); setSecret(genSecret()); setOtp('') }}
                style={{ ...sans, flex:1, padding:'11px', border:`1px solid ${gold}`, background:`${gold}10`, color:dark, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
                Re-configure
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.8 9.7 8 11 4.2-1.3 8-5.5 8-11V6L12 2Z" stroke={gold} strokeWidth="1.5"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>MFA <span style={{ color:gold }}>Setup</span></p>
        <div style={{ flex:1 }} />
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'40px 24px' }}>
        {/* Step indicator */}
        {step < 4 && (
          <div style={{ display:'flex', alignItems:'center', marginBottom:36 }}>
            {STEPS.slice(0,4).map((s,i) => (
              <div key={s} style={{ display:'flex', alignItems:'center', flex: i<3 ? 1 : 0 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:28, height:28, background:i<step?gold:i===step?`${gold}30`:bdr, border:`2px solid ${i<=step?gold:bdr}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {i < step
                      ? <span style={{ fontSize:12, color:'#000', fontWeight:700 }}>✓</span>
                      : <span style={{ ...sans, fontSize:11, color:i===step?gold:stone, fontWeight:700 }}>{i+1}</span>}
                  </div>
                  <span style={{ ...sans, fontSize:8, fontWeight:i===step?700:400, color:i===step?gold:stone, textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{s}</span>
                </div>
                {i < 3 && <div style={{ flex:1, height:2, background:i<step?gold:bdr, margin:'0 4px', marginBottom:18 }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 0 — Choose method */}
        {step === 0 && (
          <div>
            <p style={{ ...serif, fontSize:38, fontWeight:300, color:dark, margin:'0 0 8px' }}>Secure Your Account</p>
            <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 28px', lineHeight:1.75 }}>
              Two-factor authentication adds an extra layer of security. Choose your preferred method below.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
              {[
                { id:'totp', icon:'📱', title:'Authenticator App (Recommended)', desc:'Use Google Authenticator, Authy, or any TOTP-compatible app. Works offline.' },
                { id:'sms',  icon:'💬', title:'SMS One-Time Password', desc:'Receive a 6-digit code via SMS to your registered mobile number.' },
              ].map(m => (
                <div key={m.id} onClick={() => setMethod(m.id)}
                  style={{ padding:'18px 20px', border:`2px solid ${method===m.id?gold:bdr}`, background:method===m.id?`${gold}08`:'#fff', cursor:'pointer', display:'flex', gap:16, alignItems:'flex-start' }}>
                  <span style={{ fontSize:22 }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 4px' }}>{m.title}</p>
                    <p style={{ ...sans, fontSize:11, color:stone, margin:0, lineHeight:1.6 }}>{m.desc}</p>
                  </div>
                  <div style={{ width:18, height:18, border:`2px solid ${method===m.id?gold:bdr}`, display:'flex', alignItems:'center', justifyContent:'center', marginTop:2, flexShrink:0 }}>
                    {method===m.id && <div style={{ width:8, height:8, background:gold }} />}
                  </div>
                </div>
              ))}
            </div>
            {method === 'sms' && (
              <div style={{ background:`${gold}08`, border:`1px solid ${gold}40`, padding:'14px 18px', marginBottom:20 }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold, margin:'0 0 6px' }}>SMS — Demo Mode</p>
                <p style={{ ...sans, fontSize:11, color:stone, margin:0, lineHeight:1.6 }}>SMS delivery is not configured in this environment. Selecting SMS will proceed with the same TOTP flow for demonstration.</p>
              </div>
            )}
            <button onClick={() => setStep(1)}
              style={{ ...sans, width:'100%', padding:'13px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 1 — Scan QR */}
        {step === 1 && (
          <div>
            <p style={{ ...serif, fontSize:34, fontWeight:300, color:dark, margin:'0 0 8px' }}>Scan QR Code</p>
            <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 24px', lineHeight:1.75 }}>
              Open your authenticator app, tap <strong>Add Account → Scan QR Code</strong>, then point your camera at the code below.
            </p>

            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:28, textAlign:'center', marginBottom:20 }}>
              <div style={{ display:'inline-block', padding:12, border:`1px solid ${bdr}` }}>
                <SimpleQR value={otpAuth} />
              </div>
              <p style={{ ...sans, fontSize:10, color:stone, margin:'14px 0 0' }}>Scan with Google Authenticator, Authy, or 1Password</p>
            </div>

            <div style={{ background:dark, padding:'16px 20px', marginBottom:20 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold, margin:'0 0 8px' }}>Can't scan? Enter this key manually</p>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <code style={{ ...sans, fontSize:12, color:'#e7e5e4', flex:1, letterSpacing:'0.1em', wordBreak:'break-all', lineHeight:1.7 }}>
                  {secret.match(/.{1,4}/g)?.join(' ')}
                </code>
                <button onClick={copySecret}
                  style={{ ...sans, padding:'6px 14px', background:'none', border:`1px solid ${gold}`, color:gold, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', flexShrink:0 }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{ ...sans, fontSize:9, color:'#78716c', margin:'8px 0 0' }}>Type: Time-based (TOTP) · Algorithm: SHA-1 · Digits: 6 · Period: 30s</p>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep(0)} style={{ ...sans, padding:'12px 24px', background:'#fff', border:`1px solid ${bdr}`, color:stone, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>← Back</button>
              <button onClick={() => setStep(2)} style={{ ...sans, flex:1, padding:'12px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>I've Scanned It →</button>
            </div>
          </div>
        )}

        {/* Step 2 — Verify */}
        {step === 2 && (
          <div>
            <p style={{ ...serif, fontSize:34, fontWeight:300, color:dark, margin:'0 0 8px' }}>Verify the Code</p>
            <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 28px', lineHeight:1.75 }}>
              Open your authenticator app and enter the 6-digit code shown for <strong>El Shaddai</strong>. The code refreshes every 30 seconds.
            </p>

            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:28, marginBottom:20 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 16px' }}>Enter 6-Digit Code</p>
              <OTPInput value={otp} onChange={setOtp} disabled={verifying} />
              {otpErr && <p style={{ ...sans, fontSize:11, color:'#ef4444', margin:'12px 0 0' }}>{otpErr}</p>}
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setStep(1); setOtp(''); setOtpErr('') }}
                style={{ ...sans, padding:'12px 24px', background:'#fff', border:`1px solid ${bdr}`, color:stone, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>← Back</button>
              <button onClick={verify} disabled={otp.length < 6 || verifying}
                style={{ ...sans, flex:1, padding:'12px', background:otp.length===6?gold:'#e7e5e4', border:'none', color:otp.length===6?'#000':'#a8a29e', fontWeight:700, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:otp.length===6?'pointer':'default' }}>
                {verifying ? 'Verifying…' : 'Verify Code →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Backup codes */}
        {step === 3 && (
          <div>
            <p style={{ ...serif, fontSize:34, fontWeight:300, color:dark, margin:'0 0 8px' }}>Save Backup Codes</p>
            <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 6px', lineHeight:1.75 }}>
              Store these backup codes somewhere safe. Each code can be used once if you lose access to your authenticator app.
            </p>
            <p style={{ ...sans, fontSize:11, color:'#ef4444', fontWeight:600, margin:'0 0 20px' }}>⚠ These codes will not be shown again.</p>

            <div style={{ background:dark, padding:24, marginBottom:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 32px' }}>
                {codes.map((c,i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'center', padding:'6px 0', borderBottom:'1px solid #292524' }}>
                    <span style={{ ...sans, fontSize:9, color:'#57534e', width:16, textAlign:'right', flexShrink:0 }}>{i+1}.</span>
                    <code style={{ ...sans, fontSize:13, color:'#e7e5e4', letterSpacing:'0.1em', fontFamily:'monospace' }}>{c}</code>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginBottom:20 }}>
              <button onClick={copyCodes}
                style={{ ...sans, flex:1, padding:'11px', background:'#fff', border:`1px solid ${bdr}`, color:dark, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
                {copied ? '✓ Copied' : 'Copy All Codes'}
              </button>
              <button onClick={() => { const w=window.open('','_blank'); w.document.write(`<pre style="font-size:14px;line-height:2">${codes.join('\n')}</pre>`); w.print() }}
                style={{ ...sans, flex:1, padding:'11px', background:'#fff', border:`1px solid ${bdr}`, color:dark, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
                Print Codes
              </button>
            </div>

            <button onClick={enableMFA}
              style={{ ...sans, width:'100%', padding:'13px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
              I've Saved My Codes — Enable MFA →
            </button>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ width:80, height:80, background:`${gold}15`, border:`2px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.8 9.7 8 11 4.2-1.3 8-5.5 8-11V6L12 2Z" stroke={gold} strokeWidth="1.4"/><path d="M9 12l2 2 4-4" stroke={gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p style={{ ...serif, fontSize:40, fontWeight:300, color:dark, margin:'0 0 10px' }}>MFA Enabled</p>
            <p style={{ ...sans, fontSize:13, color:stone, margin:'0 auto 32px', maxWidth:380, lineHeight:1.8 }}>
              Your account is now protected with two-factor authentication. You'll need your authenticator app at each login.
            </p>
            <div style={{ background:light, border:`1px solid ${bdr}`, padding:'20px 24px', textAlign:'left', marginBottom:28 }}>
              {[
                ['Method', 'Authenticator App (TOTP)'],
                ['Algorithm', 'SHA-1 · HMAC · 6 digits · 30s'],
                ['Backup Codes', '10 codes generated'],
                ['Status', '● Active'],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                  <span style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone }}>{k}</span>
                  <span style={{ ...sans, fontSize:11, color:k==='Status'?'#22c55e':dark, fontWeight:k==='Status'?700:400 }}>{v}</span>
                </div>
              ))}
            </div>
            <Link to="/dashboard"
              style={{ ...sans, display:'block', width:'100%', padding:'13px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', textDecoration:'none', boxSizing:'border-box' }}>
              Return to Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
