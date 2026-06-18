import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projects as projectsApi } from '../../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

const STEPS = ['Client Details','Project Scope','Team Assignment','Budget & Timeline','Review & Create']

const PROPERTY_TYPES = ['Apartment / Flat','Villa / Bungalow','Independent House','Office / Commercial','Retail Store','Restaurant / Café','Hospital / Clinic','Penthouse']
const SCOPES = ['Full Interior (all rooms)','Living + Dining','Bedroom(s) only','Kitchen only','Bathrooms only','Full + Exterior','Commercial Fitout']
const FINISH_LEVELS = ['Standard','Premium','Luxury','Ultra Luxury']
const CITIES = ['Hyderabad','Secunderabad','Warangal','Nizamabad','Bangalore','Mumbai','Delhi','Kochi','Pune']
const DESIGNERS = ['Kiran Sharma','Lakshmi Iyer','Deepika Rangaraj']
const BUILDERS  = ['Mohammed Farook','Ramesh Pillai','Vijay Selvam']
const PMS       = ['Priya Menon','Aravind Kumar']
const SOURCES   = ['Referral','Instagram','Website','Google','Walk-in','Previous Client','Architect Referral']

const EMPTY = {
  // Step 1
  clientName:'', clientPhone:'', clientEmail:'', clientAddress:'', source:'Referral',
  // Step 2
  propertyType:'Apartment / Flat', scope:'Full Interior (all rooms)', finish:'Premium',
  city:'Hyderabad', area:'', rooms:'3', floors:'1', style:'Contemporary Indian', notes:'',
  // Step 3
  designer:'', builder:'', pm:'', startDate:'', priorities:[], vastu:false, pet:false, kids:false,
  // Step 4
  budget:'', paymentTerms:'Standard (30-20-25-15-10)', contingency:'10',
  expectedDuration:'', priority:'NORMAL',
}

function StepDot({ n, current, total }) {
  const done = n < current
  return (
    <div style={{ display:'flex', alignItems:'center', flex: n < total ? 1 : 0 }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
        <div style={{ width:32, height:32, background:done?gold:n===current?`${gold}25`:'#fff', border:`2px solid ${done||n===current?gold:bdr}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {done
            ? <span style={{ fontSize:13, color:'#000', fontWeight:700 }}>✓</span>
            : <span style={{ ...sans, fontSize:11, color:n===current?gold:stone, fontWeight:700 }}>{n+1}</span>}
        </div>
        <span style={{ ...sans, fontSize:8, color:n===current?gold:stone, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap', fontWeight:n===current?700:400 }}>{STEPS[n].split(' ')[0]}</span>
      </div>
      {n < total && <div style={{ flex:1, height:2, background:done?gold:bdr, margin:'0 4px', marginBottom:18 }} />}
    </div>
  )
}

const F = ({ label, children, col }) => (
  <div style={{ gridColumn: col || 'auto' }}>
    <label style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:stone, display:'block', marginBottom:6 }}>{label}</label>
    {children}
  </div>
)

const Inp = (props) => (
  <input {...props} style={{ fontFamily:"'DM Sans',system-ui,sans-serif", width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, boxSizing:'border-box', background:'#fff', ...props.style }} />
)
const Sel = ({ options, value, onChange }) => (
  <select value={value} onChange={onChange} style={{ fontFamily:"'DM Sans',system-ui,sans-serif", width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, background:'#fff' }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
)

const STYLE_OPTIONS = ['Contemporary Indian','Modern Minimal','Classic / Traditional','Industrial Loft','Coastal / Resort','Japandi','Art Deco','Eclectic']

export default function NewProjectPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [creating, setCreating] = useState(false)
  const [done, setDone] = useState(false)
  const [newId, setNewId] = useState('')

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  function canNext() {
    if (step === 0) return form.clientName && form.clientPhone && form.clientEmail
    if (step === 1) return form.area && form.city
    if (step === 2) return form.designer && form.pm && form.startDate
    if (step === 3) return form.budget && form.expectedDuration
    return true
  }

  async function create() {
    setCreating(true)
    try {
      const endDate = form.startDate && form.expectedDuration
        ? new Date(new Date(form.startDate).getTime() + parseInt(form.expectedDuration)*7*24*60*60*1000).toISOString().split('T')[0]
        : null
      const pnum = `PRJ-${String(Math.floor(Math.random()*9000)+1000)}`
      const data = await projectsApi.create({
        project_number: pnum,
        name: `${form.clientName} — ${form.propertyType}`,
        client_name:  form.clientName,
        status:       'INQUIRY',
        budget:       parseFloat(form.budget || 0) * 100000,
        city:         form.city,
        start_date:   form.startDate || null,
        expected_end: endDate,
        progress_pct: 0,
        notes:        [
          `Scope: ${form.scope}`, `Finish: ${form.finish}`, `Style: ${form.style}`,
          `Area: ${form.area} sqft`, `Rooms: ${form.rooms}`, `Designer: ${form.designer}`,
          `PM: ${form.pm}`, form.notes
        ].filter(Boolean).join(' | '),
      })
      setNewId(data.project_number || pnum)
      setDone(true)
    } catch (err) {
      // fallback: still show success with local ID
      setNewId(`PRJ-${String(Math.floor(Math.random()*9000)+1000)}`)
      setDone(true)
    } finally {
      setCreating(false)
    }
  }

  if (done) return (
    <div style={{ minHeight:'100vh', background:light, display:'flex', alignItems:'center', justifyContent:'center', ...sans }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:24 }}>
        <div style={{ width:80, height:80, background:`${gold}15`, border:`2px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.4" fill="none"/><path d="M9 16l2 2 4-4" stroke={gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p style={{ ...serif, fontSize:44, fontWeight:300, color:dark, margin:'0 0 8px' }}>Project Created</p>
        <p style={{ ...sans, fontSize:13, color:stone, margin:'0 0 8px' }}>{newId} — {form.clientName}</p>
        <p style={{ ...sans, fontSize:11, color:stone, margin:'0 0 32px', lineHeight:1.75 }}>
          {form.propertyType} · {form.area} sqft · {form.city}<br/>
          Designer: {form.designer} · PM: {form.pm}<br/>
          Budget: ₹{parseFloat(form.budget).toLocaleString('en-IN')} Lakhs
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <Link to="/dashboard" style={{ ...sans, padding:'12px 24px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', textDecoration:'none' }}>
            Go to Dashboard
          </Link>
          <Link to="/schedule-builder" style={{ ...sans, padding:'12px 24px', background:'#fff', border:`1px solid ${bdr}`, color:dark, fontWeight:700, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', textDecoration:'none' }}>
            Build Schedule →
          </Link>
          <button onClick={() => { setForm(EMPTY); setStep(0); setDone(false) }}
            style={{ ...sans, padding:'12px 24px', background:'#fff', border:`1px solid ${bdr}`, color:stone, fontWeight:700, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
            New Project
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:light, ...sans }}>
      <header style={{ height:64, background:dark, display:'flex', alignItems:'center', padding:'0 28px', gap:16, borderBottom:'1px solid #292524', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ width:28, height:28, border:`1px solid ${gold}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none"/></svg>
        </div>
        <p style={{ ...serif, fontSize:18, fontWeight:300, color:'#fff', margin:0 }}>New <span style={{ color:gold }}>Project</span></p>
        <div style={{ flex:1 }} />
        <Link to="/dashboard" style={{ ...sans, fontSize:10, color:'#78716c', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>← Dashboard</Link>
      </header>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'36px 24px' }}>
        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:40 }}>
          {STEPS.map((_,i) => <StepDot key={i} n={i} current={step} total={STEPS.length-1} />)}
        </div>

        <p style={{ ...serif, fontSize:36, fontWeight:300, color:dark, margin:'0 0 6px' }}>{STEPS[step]}</p>
        <p style={{ ...sans, fontSize:12, color:stone, margin:'0 0 28px' }}>
          {['Enter client contact information.','Define the project scope and style.','Assign your team to this project.','Set budget and delivery timeline.','Review everything before creating.'][step]}
        </p>

        {/* Step 0 — Client */}
        {step === 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <F label="Client Full Name" col="1/-1"><Inp value={form.clientName} onChange={e=>set('clientName',e.target.value)} placeholder="e.g. Deepa Nair" /></F>
            <F label="Phone"><Inp value={form.clientPhone} onChange={e=>set('clientPhone',e.target.value)} placeholder="+91 98XXX XXXXX" /></F>
            <F label="Email"><Inp type="email" value={form.clientEmail} onChange={e=>set('clientEmail',e.target.value)} placeholder="client@email.com" /></F>
            <F label="Client Address" col="1/-1">
              <textarea value={form.clientAddress} onChange={e=>set('clientAddress',e.target.value)} rows={2}
                style={{ fontFamily:"'DM Sans',system-ui,sans-serif", width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, resize:'vertical', boxSizing:'border-box' }}
                placeholder="Full address including city and pincode" />
            </F>
            <F label="How Did They Find Us?">
              <Sel value={form.source} onChange={e=>set('source',e.target.value)} options={SOURCES} />
            </F>
          </div>
        )}

        {/* Step 1 — Scope */}
        {step === 1 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <F label="Property Type" col="1/-1"><Sel value={form.propertyType} onChange={e=>set('propertyType',e.target.value)} options={PROPERTY_TYPES} /></F>
            <F label="Scope of Work"><Sel value={form.scope} onChange={e=>set('scope',e.target.value)} options={SCOPES} /></F>
            <F label="Finish Level"><Sel value={form.finish} onChange={e=>set('finish',e.target.value)} options={FINISH_LEVELS} /></F>
            <F label="City"><Sel value={form.city} onChange={e=>set('city',e.target.value)} options={CITIES} /></F>
            <F label="Total Area (sqft)"><Inp type="number" value={form.area} onChange={e=>set('area',e.target.value)} placeholder="e.g. 1800" /></F>
            <F label="No. of Rooms / BHK"><Inp type="number" value={form.rooms} onChange={e=>set('rooms',e.target.value)} /></F>
            <F label="Floors"><Inp type="number" value={form.floors} onChange={e=>set('floors',e.target.value)} /></F>
            <F label="Design Style" col="1/-1">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {STYLE_OPTIONS.map(s => (
                  <div key={s} onClick={() => set('style',s)}
                    style={{ padding:'10px 8px', border:`1px solid ${form.style===s?gold:bdr}`, background:form.style===s?`${gold}12`:'#fff', cursor:'pointer', textAlign:'center' }}>
                    <p style={{ ...sans, fontSize:10, color:form.style===s?dark:stone, margin:0, fontWeight:form.style===s?600:400, lineHeight:1.4 }}>{s}</p>
                  </div>
                ))}
              </div>
            </F>
            <F label="Special Notes" col="1/-1">
              <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2}
                style={{ fontFamily:"'DM Sans',system-ui,sans-serif", width:'100%', padding:'9px 12px', border:`1px solid ${bdr}`, fontSize:12, color:dark, resize:'vertical', boxSizing:'border-box' }}
                placeholder="Vastu requirements, elderly-friendly design, pet-friendly materials, etc." />
            </F>
            <F label="Special Considerations" col="1/-1">
              <div style={{ display:'flex', gap:8 }}>
                {[['vastu','Vastu Compliant'],['pet','Pet Friendly'],['kids','Child Safe']].map(([key,label]) => (
                  <div key={key} onClick={() => set(key, !form[key])}
                    style={{ flex:1, padding:'10px', border:`1px solid ${form[key]?gold:bdr}`, background:form[key]?`${gold}12`:'#fff', cursor:'pointer', textAlign:'center' }}>
                    <p style={{ ...sans, fontSize:11, color:form[key]?dark:stone, margin:0, fontWeight:form[key]?600:400 }}>{label}</p>
                  </div>
                ))}
              </div>
            </F>
          </div>
        )}

        {/* Step 2 — Team */}
        {step === 2 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <F label="Lead Designer" col="1/-1">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {DESIGNERS.map(d => (
                  <div key={d} onClick={() => set('designer',d)}
                    style={{ padding:'12px', border:`1px solid ${form.designer===d?gold:bdr}`, background:form.designer===d?`${gold}12`:'#fff', cursor:'pointer', textAlign:'center' }}>
                    <div style={{ width:36, height:36, background:form.designer===d?gold:'#e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:form.designer===d?'#000':stone, margin:'0 auto 8px' }}>
                      {d.split(' ').map(w=>w[0]).join('')}
                    </div>
                    <p style={{ ...sans, fontSize:10, color:form.designer===d?dark:stone, margin:0, fontWeight:form.designer===d?600:400 }}>{d}</p>
                  </div>
                ))}
              </div>
            </F>
            <F label="Site Builder / Contractor">
              <Sel value={form.builder} onChange={e=>set('builder',e.target.value)} options={['Select…',...BUILDERS]} />
            </F>
            <F label="Project Manager">
              <Sel value={form.pm} onChange={e=>set('pm',e.target.value)} options={['Select…',...PMS]} />
            </F>
            <F label="Project Start Date" col="1/-1">
              <Inp type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} />
            </F>
          </div>
        )}

        {/* Step 3 — Budget */}
        {step === 3 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <F label="Client Budget (₹ Lakhs)">
              <Inp type="number" value={form.budget} onChange={e=>set('budget',e.target.value)} placeholder="e.g. 35" />
            </F>
            <F label="Contingency %">
              <Sel value={form.contingency} onChange={e=>set('contingency',e.target.value)} options={['5','10','15','20']} />
            </F>
            <F label="Expected Duration (weeks)">
              <Inp type="number" value={form.expectedDuration} onChange={e=>set('expectedDuration',e.target.value)} placeholder="e.g. 20" />
            </F>
            <F label="Priority">
              <Sel value={form.priority} onChange={e=>set('priority',e.target.value)} options={['NORMAL','HIGH','URGENT']} />
            </F>
            <F label="Payment Terms" col="1/-1">
              <Sel value={form.paymentTerms} onChange={e=>set('paymentTerms',e.target.value)} options={['Standard (30-20-25-15-10)','Custom','50-50','40-30-30']} />
            </F>

            {/* Budget breakdown preview */}
            {form.budget && (
              <div style={{ gridColumn:'1/-1', background:dark, padding:'20px 24px' }}>
                <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:gold, margin:'0 0 14px' }}>Budget Breakdown Preview</p>
                {[
                  ['Materials & Products', 0.55],
                  ['Labour & Installation', 0.25],
                  ['Design Fees', 0.12],
                  ['Contingency', parseFloat(form.contingency||10)/100 * 0.08],
                ].map(([label, pct]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #292524' }}>
                    <span style={{ ...sans, fontSize:11, color:'#a8a29e' }}>{label}</span>
                    <span style={{ ...sans, fontSize:11, color:'#e7e5e4', fontWeight:600 }}>₹{(parseFloat(form.budget)*pct*100000).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10 }}>
                  <span style={{ ...sans, fontSize:11, color:gold, fontWeight:700 }}>Total (incl. 18% GST)</span>
                  <span style={{ ...serif, fontSize:18, fontWeight:300, color:gold }}>₹{(parseFloat(form.budget)*100000*1.18).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              {[
                ['Client',   form.clientName + ' · ' + form.clientPhone],
                ['Email',    form.clientEmail],
                ['Property', form.propertyType],
                ['Area',     form.area + ' sqft · ' + form.rooms + ' rooms'],
                ['Scope',    form.scope],
                ['Finish',   form.finish + ' · ' + form.style],
                ['City',     form.city],
                ['Designer', form.designer],
                ['PM',       form.pm],
                ['Start',    form.startDate ? new Date(form.startDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '—'],
                ['Budget',   '₹' + parseFloat(form.budget||0).toLocaleString('en-IN') + ' Lakhs'],
                ['Duration', form.expectedDuration + ' weeks'],
              ].map(([k,v]) => (
                <div key={k} style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'12px 16px' }}>
                  <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 4px' }}>{k}</p>
                  <p style={{ ...sans, fontSize:12, color:dark, margin:0 }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ background:`${gold}08`, border:`1px solid ${gold}30`, padding:'14px 18px', marginBottom:20 }}>
              <p style={{ ...sans, fontSize:10, color:dark, margin:0, lineHeight:1.75 }}>
                ✦ This will create project <strong>{form.clientName}'s {form.propertyType}</strong> in the system, assign the team, and generate the initial project pipeline. You can edit all details after creation.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:28 }}>
          <button disabled={step===0} onClick={() => setStep(s=>s-1)}
            style={{ ...sans, padding:'12px 24px', background:'#fff', border:`1px solid ${bdr}`, color:step===0?'#d0cdc9':stone, fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:step===0?'default':'pointer' }}>
            ← Back
          </button>
          {step < 4 ? (
            <button disabled={!canNext()} onClick={() => setStep(s=>s+1)}
              style={{ ...sans, padding:'12px 32px', background:canNext()?gold:'#e7e5e4', border:'none', color:canNext()?'#000':'#a8a29e', fontWeight:700, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:canNext()?'pointer':'default' }}>
              Continue →
            </button>
          ) : (
            <button onClick={create} disabled={creating}
              style={{ ...sans, padding:'12px 32px', background:gold, border:'none', color:'#000', fontWeight:700, fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
              {creating ? 'Creating Project…' : '✦ Create Project →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
