import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'
const GEMINI = import.meta.env.VITE_GEMINI_API_KEY

// ── AI structuring ────────────────────────────────────────────────
async function structureLog(rawText) {
  if (!GEMINI) return demoParse(rawText)
  const prompt = `You are a construction site supervisor AI. A field worker has dictated their daily work log via voice. Parse it into a structured JSON report.

Raw transcript:
"${rawText}"

Return JSON only (no markdown):
{
  "date": "YYYY-MM-DD (today)",
  "summary": "2-sentence professional summary",
  "tasks_completed": ["task 1", "task 2", ...],
  "hours_worked": number,
  "materials_used": [{"item": "...", "qty": "..."}],
  "issues_encountered": ["issue 1", ...],
  "next_day_plan": ["planned task 1", ...],
  "mood_score": 1-5,
  "safety_incidents": "None" or description,
  "overtime": true/false
}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI}`,
    { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{ role:'user', parts:[{ text:prompt }] }], generationConfig:{ temperature:0.2, maxOutputTokens:800 } }) }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return JSON.parse(text.replace(/```json|```/g,'').trim())
}

function demoParse(raw) {
  const lower = raw.toLowerCase()
  const hours  = raw.match(/(\d+)\s*hour/i)
  const tasks  = []
  if (lower.includes('floor')) tasks.push('Flooring installation completed in bedroom area')
  if (lower.includes('paint')) tasks.push('Wall priming and base coat applied in living room')
  if (lower.includes('cement')||lower.includes('concrete')) tasks.push('Concrete pouring for column base')
  if (lower.includes('wir')  ||lower.includes('electric'))  tasks.push('Electrical conduit routing — 2nd floor')
  if (lower.includes('tile')) tasks.push('Tile fixing in master bathroom — 80% complete')
  if (tasks.length === 0) tasks.push('General site work as directed by supervisor')

  return {
    date: new Date().toISOString().slice(0,10),
    summary: `Worker completed ${tasks.length} primary tasks on site today. Progress is on schedule with minor material delays noted.`,
    tasks_completed: tasks,
    hours_worked: hours ? parseInt(hours[1]) : 8,
    materials_used: [
      { item:'Cement bags', qty:'4 bags' },
      { item:'M-Sand', qty:'2 cubic ft' },
    ],
    issues_encountered: lower.includes('delay') ? ['Material delivery delayed by 2 hours'] : ['No significant issues'],
    next_day_plan: ['Continue previous day work', 'Site cleanup before 9 AM', 'Supervisor checkpoint at 11 AM'],
    mood_score: 4,
    safety_incidents: 'None',
    overtime: (hours ? parseInt(hours[1]) : 8) > 8,
  }
}

// ── Past logs (demo) ──────────────────────────────────────────────
const DEMO_LOGS = [
  { id:1, date:'2026-06-15', worker:'Suresh Babu', summary:'Completed bedroom flooring and started wall primer.', hours_worked:9, overtime:true,  mood_score:4, safety_incidents:'None' },
  { id:2, date:'2026-06-14', worker:'Ramesh Pillai', summary:'Electrical conduit routed across 3 rooms. Minor delay at main panel.', hours_worked:8, overtime:false, mood_score:3, safety_incidents:'None' },
  { id:3, date:'2026-06-13', worker:'Mohammed Farook', summary:'Concrete pour for north column. Set and cured overnight.', hours_worked:10, overtime:true,  mood_score:5, safety_incidents:'None' },
  { id:4, date:'2026-06-12', worker:'Suresh Babu', summary:'Tile fixing 80% done in bathrooms. Adhesive shortage — reordered.', hours_worked:8, overtime:false, mood_score:3, safety_incidents:'None' },
]

function MoodDot({ score }) {
  const c = score >= 4 ? '#22c55e' : score === 3 ? gold : '#ef4444'
  return (
    <div style={{ display:'flex', gap:3 }}>
      {[1,2,3,4,5].map(i => <div key={i} style={{ width:8, height:8, background: i<=score ? c : '#e7e5e4' }} />)}
    </div>
  )
}

export default function VoiceDailyLogPage() {
  const [recording,  setRecording]  = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result,     setResult]     = useState(null)
  const [logs,       setLogs]       = useState(DEMO_LOGS)
  const [view,       setView]       = useState('record')  // record | result | history
  const [supported,  setSupported]  = useState(true)
  const [timer,      setTimer]      = useState(0)
  const recRef  = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) setSupported(false)
  }, [])

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [recording])

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SpeechRecognition()
    rec.lang = 'en-IN'
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    let finalText = ''
    rec.onresult = e => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t + ' '
        else interim = t
      }
      setTranscript(finalText + interim)
    }
    rec.onerror = () => { setRecording(false); setTimer(0) }
    rec.onend = () => { setRecording(false); setTimer(0) }

    rec.start()
    recRef.current = rec
    setRecording(true)
    setTranscript('')
    setTimer(0)
  }

  function stopRecording() {
    if (recRef.current) recRef.current.stop()
    setRecording(false)
  }

  async function processLog() {
    if (!transcript.trim()) return
    setProcessing(true)
    const parsed = await structureLog(transcript).catch(() => demoParse(transcript))
    setResult({ ...parsed, raw: transcript, worker: JSON.parse(localStorage.getItem('es_user')||'{}').name || 'Field Worker' })
    setProcessing(false)
    setView('result')
  }

  function saveLog() {
    setLogs(l => [{ id:l.length+1, date:result.date, worker:result.worker, summary:result.summary, hours_worked:result.hours_worked, overtime:result.overtime, mood_score:result.mood_score, safety_incidents:result.safety_incidents }, ...l])
    setResult(null)
    setTranscript('')
    setView('history')
  }

  const fmtTimer = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      {/* Header */}
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="4" stroke={gold} strokeWidth="1.3"/><path d="M6 8a4 4 0 008 0M10 12v5M7 17h6" stroke={gold} strokeWidth="1.3" strokeLinecap="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>Voice <span style={{ color:gold }}>Daily Log</span></p>
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', gap:2 }}>
          {[['record','Record'],['history','History']].map(([id,label]) => (
            <button key={id} onClick={() => { setView(id); if(id==='record') setResult(null) }}
              style={{ ...sans, padding:'6px 16px', background:view===id?gold:'transparent', border:`1px solid ${view===id?gold:'#57534e'}`, color:view===id?'#000':'#78716c', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ padding:32, maxWidth:860, margin:'0 auto' }}>
        {/* Record view */}
        {view === 'record' && (
          <div>
            <p style={{ ...serif, fontSize:44, fontWeight:300, color:dark, margin:'0 0 8px' }}>Daily Work Log</p>
            <p style={{ ...sans, fontSize:13, color:stone, margin:'0 0 36px', lineHeight:1.7 }}>
              Speak your daily work report — tasks done, materials used, issues, and tomorrow's plan. AI structures it automatically.
              {!GEMINI && <span style={{ color:gold }}> Running in demo mode.</span>}
            </p>

            {!supported && (
              <div style={{ background:'#fff5f5', border:'1px solid #fecaca', padding:'16px 20px', marginBottom:24 }}>
                <p style={{ ...sans, fontSize:12, color:'#ef4444', margin:0, fontWeight:600 }}>Voice recording is not supported in this browser.</p>
                <p style={{ ...sans, fontSize:11, color:stone, margin:'4px 0 0' }}>Use Google Chrome or Microsoft Edge for the best experience. You can also type your log directly below.</p>
              </div>
            )}

            {/* Recorder */}
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:32, textAlign:'center', marginBottom:20 }}>
              {/* Animated rings */}
              <div style={{ width:120, height:120, margin:'0 auto 24px', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {recording && (
                  <>
                    <div style={{ position:'absolute', width:110, height:110, border:`2px solid ${gold}30`, animation:'pulse 1.5s ease-out infinite' }} />
                    <div style={{ position:'absolute', width:90,  height:90,  border:`2px solid ${gold}60`, animation:'pulse 1.5s ease-out 0.3s infinite' }} />
                  </>
                )}
                <button
                  onClick={recording ? stopRecording : (supported ? startRecording : undefined)}
                  disabled={!supported}
                  style={{ width:72, height:72, background:recording?'#ef4444':gold, border:'none', cursor:supported?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:1 }}>
                  {recording
                    ? <span style={{ width:18, height:18, background:'#fff', display:'block' }} />
                    : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="5" stroke="#000" strokeWidth="1.8"/><path d="M8 9a4 4 0 008 0M12 13v6M9 19h6" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  }
                </button>
              </div>

              {recording ? (
                <div>
                  <p style={{ ...sans, fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#ef4444', margin:'0 0 4px' }}>Recording in progress</p>
                  <p style={{ ...serif, fontSize:36, fontWeight:300, color:dark, margin:'0 0 4px', fontVariantNumeric:'tabular-nums' }}>{fmtTimer(timer)}</p>
                  <p style={{ ...sans, fontSize:10, color:stone }}>Speak clearly — click the stop button when done</p>
                </div>
              ) : (
                <div>
                  <p style={{ ...sans, fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{supported ? 'Click to start recording' : 'Voice not supported'}</p>
                  <p style={{ ...sans, fontSize:10, color:'#a8a29e' }}>Say: tasks done today, materials used, any issues, and tomorrow's plan</p>
                </div>
              )}
            </div>

            <style>{`@keyframes pulse{0%{transform:scale(0.95);opacity:0.8}100%{transform:scale(1.3);opacity:0}}`}</style>

            {/* Transcript box */}
            <div style={{ marginBottom:20 }}>
              <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:8 }}>
                Transcript / Manual Entry
              </label>
              <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={7}
                placeholder="Your speech appears here automatically… or type your daily log manually."
                style={{ ...sans, width:'100%', padding:'14px', border:`1px solid ${bdr}`, fontSize:12.5, color:dark, resize:'vertical', boxSizing:'border-box', lineHeight:1.75, background:transcript?'#fff':'#fafaf9' }} />
            </div>

            {/* Tips */}
            <div style={{ background:`${gold}08`, border:`1px solid ${gold}30`, padding:'14px 18px', marginBottom:24 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold, margin:'0 0 10px' }}>What to include in your daily log</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 24px' }}>
                {[
                  'Tasks you completed today','Hours you worked','Materials used with quantities',
                  'Any problems or delays','Safety incidents (if any)','Plan for tomorrow',
                ].map(tip => (
                  <p key={tip} style={{ ...sans, fontSize:11, color:dark, margin:0 }}>✓ {tip}</p>
                ))}
              </div>
            </div>

            {/* Example prompt */}
            <div style={{ background:dark, padding:'14px 18px', marginBottom:24 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold, margin:'0 0 8px' }}>Example</p>
              <p style={{ ...sans, fontSize:11, color:'#a8a29e', margin:0, lineHeight:1.8, fontStyle:'italic' }}>
                "Today I completed flooring in two bedrooms, used about 40 tiles and 4 bags of adhesive. I worked 9 hours with a 1-hour lunch break. We had a minor delay because the grouting material arrived late at 2 PM. Tomorrow I plan to finish the living room tiles and start on the bathroom walls."
              </p>
            </div>

            <button onClick={processLog} disabled={!transcript.trim() || processing}
              style={{ ...sans, width:'100%', padding:'14px', background:transcript.trim()?gold:'#e7e5e4', border:'none', color:transcript.trim()?'#000':'#a8a29e', fontWeight:700, fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', cursor:transcript.trim()?'pointer':'default' }}>
              {processing ? 'AI Structuring Log…' : '✦ Structure with AI →'}
            </button>
          </div>
        )}

        {/* Result view */}
        {view === 'result' && result && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
              <div>
                <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 4px' }}>Structured Log</p>
                <p style={{ ...sans, fontSize:11, color:stone, margin:0 }}>{result.worker} · {result.date}</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setView('record')} style={{ ...sans, padding:'8px 20px', background:'#fff', border:`1px solid ${bdr}`, color:stone, fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Re-record</button>
                <button onClick={saveLog} style={{ ...sans, padding:'8px 20px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Save Log →</button>
              </div>
            </div>

            {/* Summary card */}
            <div style={{ background:dark, borderLeft:`3px solid ${gold}`, padding:'20px 24px', marginBottom:20 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:gold, margin:'0 0 8px' }}>AI Summary</p>
              <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#e7e5e4', margin:0, lineHeight:1.75 }}>{result.summary}</p>
            </div>

            {/* KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Hours Worked', value:result.hours_worked, unit:'h' },
                { label:'Overtime',     value:result.overtime ? 'Yes' : 'No', unit:'' },
                { label:'Safety',       value:result.safety_incidents === 'None' ? '✓ Clear' : '⚠ Incident', unit:'' },
              ].map(k => (
                <div key={k.label} style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'16px 20px' }}>
                  <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:'0 0 4px' }}>{k.value}<span style={{ fontSize:14, color:stone }}>{k.unit}</span></p>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:0 }}>{k.label}</p>
                </div>
              ))}
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'16px 20px' }}>
                <MoodDot score={result.mood_score} />
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'8px 0 0' }}>Mood Score</p>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
              {/* Tasks completed */}
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'18px 20px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 12px' }}>Tasks Completed</p>
                {result.tasks_completed.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
                    <div style={{ width:16, height:16, background:`${gold}20`, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <span style={{ fontSize:8, color:gold, fontWeight:700 }}>✓</span>
                    </div>
                    <p style={{ ...sans, fontSize:11.5, color:dark, margin:0, lineHeight:1.6 }}>{t}</p>
                  </div>
                ))}
              </div>

              {/* Materials used */}
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'18px 20px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 12px' }}>Materials Used</p>
                {result.materials_used.length > 0 ? result.materials_used.map((m,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${bdr}` }}>
                    <span style={{ ...sans, fontSize:11.5, color:dark }}>{m.item}</span>
                    <span style={{ ...sans, fontSize:11, color:stone, fontWeight:600 }}>{m.qty}</span>
                  </div>
                )) : <p style={{ ...sans, fontSize:11, color:stone }}>No materials logged</p>}
              </div>

              {/* Issues */}
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'18px 20px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 12px' }}>Issues / Blockers</p>
                {result.issues_encountered.map((iss,i) => (
                  <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
                    <span style={{ color:'#f97316', fontSize:12, flexShrink:0 }}>⚠</span>
                    <p style={{ ...sans, fontSize:11.5, color:dark, margin:0, lineHeight:1.6 }}>{iss}</p>
                  </div>
                ))}
              </div>

              {/* Tomorrow plan */}
              <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'18px 20px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, margin:'0 0 12px' }}>Tomorrow's Plan</p>
                {result.next_day_plan.map((p,i) => (
                  <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
                    <div style={{ width:16, height:16, border:`1px solid ${bdr}`, flexShrink:0, marginTop:1 }} />
                    <p style={{ ...sans, fontSize:11.5, color:dark, margin:0, lineHeight:1.6 }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw transcript */}
            <details style={{ marginTop:12 }}>
              <summary style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, cursor:'pointer', padding:'10px 0' }}>Raw Transcript</summary>
              <div style={{ background:dark, padding:'14px 18px', marginTop:8 }}>
                <p style={{ ...sans, fontSize:11, color:'#a8a29e', margin:0, lineHeight:1.8, fontStyle:'italic' }}>"{result.raw}"</p>
              </div>
            </details>
          </div>
        )}

        {/* History */}
        {view === 'history' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <p style={{ ...serif, fontSize:32, fontWeight:300, color:dark, margin:0 }}>Log History</p>
              <button onClick={() => setView('record')} style={{ ...sans, padding:'9px 20px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
                + New Log
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {logs.map(l => (
                <div key={l.id} style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'18px 22px', borderLeft:`3px solid ${l.overtime?'#f97316':gold}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <p style={{ ...sans, fontSize:11, fontWeight:700, color:dark, margin:'0 0 3px' }}>{l.worker}</p>
                      <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{new Date(l.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      {l.overtime && <span style={{ ...sans, fontSize:8.5, fontWeight:700, letterSpacing:'0.12em', color:'#f97316', border:'1px solid #f97316', padding:'2px 8px' }}>OVERTIME</span>}
                      <span style={{ ...sans, fontSize:9, color:stone }}>{l.hours_worked}h worked</span>
                      <MoodDot score={l.mood_score} />
                    </div>
                  </div>
                  <p style={{ ...sans, fontSize:12, color:stone, margin:0, lineHeight:1.7 }}>{l.summary}</p>
                  {l.safety_incidents !== 'None' && (
                    <p style={{ ...sans, fontSize:10, color:'#ef4444', margin:'8px 0 0', fontWeight:600 }}>⚠ {l.safety_incidents}</p>
                  )}
                </div>
              ))}
              {logs.length === 0 && (
                <p style={{ ...sans, fontSize:13, color:stone, textAlign:'center', padding:'60px 0' }}>No logs yet. Record your first daily log above.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
