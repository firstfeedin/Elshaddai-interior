import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const sans  = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const serif = { fontFamily:"'Cormorant Garamond',Georgia,serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const bdr   = '#e7e5e4'

const PROJECTS = [
  { id:'PRJ-0012', name:'Nair Residence',    phase:'INSTALLATION', pct:72, budget:1850000, spent:1332000, days:120, elapsed:86,  team:3, issues:1, score:84 },
  { id:'PRJ-0009', name:'Kapoor Office',     phase:'QC',           pct:90, budget:3200000, spent:2880000, days:180, elapsed:162, team:4, issues:0, score:93 },
  { id:'PRJ-0015', name:'Sharma Villa',      phase:'DESIGN',       pct:15, budget:5600000, spent:840000,  days:270, elapsed:40,  team:3, issues:2, score:72 },
  { id:'PRJ-0014', name:'Mehta Penthouse',   phase:'CREATED',      pct:5,  budget:2800000, spent:140000,  days:150, elapsed:8,   team:2, issues:0, score:88 },
  { id:'PRJ-0013', name:'Sundar Restaurant', phase:'MATERIALS',    pct:55, budget:1200000, spent:660000,  days:90,  elapsed:50,  team:5, issues:3, score:61 },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun']
const REVENUE = [820000,1150000,940000,1380000,1620000,1890000]
const EXPENSES = [610000,820000,750000,980000,1100000,1290000]
const PROJ_STARTS = [2,1,3,2,1,0]

function healthColor(s) {
  if (s >= 85) return '#22c55e'
  if (s >= 70) return gold
  return '#ef4444'
}

function phaseColor(p) {
  const m = { CREATED:'#94a3b8', DESIGN:gold, QUOTATION_APPROVED:'#f97316', PRODUCTION:'#8b5cf6', MATERIALS:'#3b82f6', INSTALLATION:'#22c55e', QC:'#06b6d4', COMPLETED:'#16a34a' }
  return m[p] || stone
}

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

function Bar({ value, max, color, height=8 }) {
  return (
    <div style={{ height, background:'#f0ede9', width:'100%' }}>
      <div style={{ height:'100%', background:color, width:`${Math.min(100,(value/max)*100)}%`, transition:'width 0.4s' }}/>
    </div>
  )
}

function SparkLine({ data, color, width=120, height=40 }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v,i) => {
    const x = (i / (data.length-1)) * width
    const y = height - ((v - min) / range) * (height - 6) - 3
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} style={{ display:'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      {data.map((v,i)=>{
        const x = (i/(data.length-1))*width
        const y = height - ((v-min)/range)*(height-6) - 3
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color}/>
      })}
    </svg>
  )
}

export default function ProjectHealthPage() {
  const nav = useNavigate()
  const [sel, setSel] = useState(null)

  const totalBudget = PROJECTS.reduce((a,p)=>a+p.budget,0)
  const totalSpent  = PROJECTS.reduce((a,p)=>a+p.spent,0)
  const avgHealth   = Math.round(PROJECTS.reduce((a,p)=>a+p.score,0)/PROJECTS.length)
  const atRisk      = PROJECTS.filter(p=>p.score<70).length
  const totalRevThisMonth = REVENUE[5]
  const totalProfitThisMonth = REVENUE[5] - EXPENSES[5]

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', ...sans }}>
      {/* Header */}
      <div style={{ background:dark, borderBottom:`2px solid ${gold}`, padding:'0 32px', display:'flex', alignItems:'center', height:56, gap:20 }}>
        <svg width="28" height="28" viewBox="0 0 40 40"><rect width="40" height="40" fill={gold}/><text x="8" y="27" fontSize="18" fontWeight="700" fill={dark} fontFamily="serif">ES</text></svg>
        <span style={{ ...serif, fontSize:18, color:'#fff', letterSpacing:'0.04em', fontWeight:600 }}>Project Health Dashboard</span>
        <div style={{ flex:1 }}/>
        <button onClick={()=>nav('/dashboard')} style={{ ...sans, fontSize:12, color:'#a8a29e', background:'none', border:'none', cursor:'pointer' }}>← Dashboard</button>
      </div>

      {/* Top KPIs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${bdr}`, background:'#fff' }}>
        {[
          ['Portfolio Value', fmt(totalBudget)],
          ['Amount Spent', fmt(totalSpent)],
          ['Burn Rate', Math.round((totalSpent/totalBudget)*100)+'%'],
          ['Avg Health Score', avgHealth+'/100'],
          ['At Risk', atRisk+' projects'],
          ['Jun Revenue', fmt(totalRevThisMonth)],
          ['Jun Profit', fmt(totalProfitThisMonth)],
        ].map(([l,v],i)=>(
          <div key={l} style={{ flex:1, padding:'12px 16px', borderRight:`1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'0 0 3px' }}>{l}</p>
            <p style={{ ...serif, fontSize:20, color: l==='At Risk'&&atRisk>0?'#ef4444':l.includes('Health')?healthColor(avgHealth):dark, margin:0, fontWeight:600 }}>{v}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 112px)', overflowY:'auto' }}>
        <div style={{ flex:1, padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

          {/* Revenue vs Expense chart */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px' }}>
              <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 20px' }}>Revenue vs Expenses — 2026</p>
              <div style={{ display:'flex', gap:16, alignItems:'flex-end', height:160, borderBottom:`1px solid ${bdr}`, borderLeft:`1px solid ${bdr}`, padding:'0 8px 0 8px', position:'relative' }}>
                {MONTHS.map((m,i)=>{
                  const maxVal = Math.max(...REVENUE,...EXPENSES)
                  const rH = (REVENUE[i]/maxVal)*140
                  const eH = (EXPENSES[i]/maxVal)*140
                  return (
                    <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, justifyContent:'flex-end' }}>
                      <div style={{ display:'flex', gap:2, alignItems:'flex-end', width:'100%', justifyContent:'center' }}>
                        <div style={{ width:12, height:rH, background:gold, flexShrink:0 }} title={`Revenue: ${fmt(REVENUE[i])}`}/>
                        <div style={{ width:12, height:eH, background:'#e7e5e4', flexShrink:0 }} title={`Expenses: ${fmt(EXPENSES[i])}`}/>
                      </div>
                      <span style={{ ...sans, fontSize:9, color:stone }}>{m}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display:'flex', gap:20, marginTop:12 }}>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <div style={{ width:10, height:10, background:gold }}/>
                  <span style={{ ...sans, fontSize:10, color:stone }}>Revenue</span>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <div style={{ width:10, height:10, background:'#e7e5e4', border:`1px solid ${bdr}` }}/>
                  <span style={{ ...sans, fontSize:10, color:stone }}>Expenses</span>
                </div>
              </div>
            </div>

            {/* Profit trend */}
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px' }}>
              <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Profit Trend</p>
              <p style={{ ...serif, fontSize:28, color:'#22c55e', margin:'0 0 16px', fontWeight:600 }}>{fmt(totalProfitThisMonth)}</p>
              <SparkLine data={MONTHS.map((_,i)=>REVENUE[i]-EXPENSES[i])} color='#22c55e' width={200} height={60}/>
              <div style={{ marginTop:16 }}>
                {MONTHS.map((m,i)=>(
                  <div key={m} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:`1px solid ${bdr}` }}>
                    <span style={{ ...sans, fontSize:10, color:stone }}>{m}</span>
                    <span style={{ ...sans, fontSize:10, fontWeight:600, color:'#22c55e' }}>{fmt(REVENUE[i]-EXPENSES[i])}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project health cards */}
          <div style={{ background:'#fff', border:`1px solid ${bdr}` }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${bdr}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:0 }}>Project Health Scorecard</p>
              <span style={{ ...sans, fontSize:10, color:stone }}>Click row for detail</span>
            </div>
            {/* Table header */}
            <div style={{ display:'grid', gridTemplateColumns:'1.4fr 0.8fr 1fr 1fr 1fr 1fr 0.6fr 100px', padding:'8px 20px', background:'#f9f8f6', borderBottom:`1px solid ${bdr}` }}>
              {['Project','Phase','Budget','Spent','Timeline','Team','Issues','Health'].map(h=>(
                <span key={h} style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone }}>{h}</span>
              ))}
            </div>
            {PROJECTS.map((p,i)=>{
              const budgetPct = Math.round((p.spent/p.budget)*100)
              const timePct   = Math.round((p.elapsed/p.days)*100)
              const active    = sel?.id===p.id
              return (
                <div key={p.id} onClick={()=>setSel(active?null:p)}
                  style={{ display:'grid', gridTemplateColumns:'1.4fr 0.8fr 1fr 1fr 1fr 1fr 0.6fr 100px', padding:'12px 20px', borderBottom:i<PROJECTS.length-1?`1px solid ${bdr}`:'none', cursor:'pointer', background: active?`${gold}06`:'transparent', alignItems:'center' }}
                  onMouseEnter={e=>{ if(!active) e.currentTarget.style.background=`${gold}04` }}
                  onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent' }}>
                  <div>
                    <p style={{ ...sans, fontSize:12, fontWeight:600, color:dark, margin:'0 0 1px' }}>{p.name}</p>
                    <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>{p.id}</p>
                  </div>
                  <span style={{ ...sans, fontSize:9, fontWeight:700, padding:'2px 8px', background:phaseColor(p.phase)+'20', color:phaseColor(p.phase), letterSpacing:'0.06em' }}>{p.phase}</span>
                  <div>
                    <p style={{ ...sans, fontSize:11, color:dark, margin:'0 0 3px' }}>{fmt(p.budget)}</p>
                    <Bar value={p.spent} max={p.budget} color={budgetPct>90?'#ef4444':gold}/>
                    <p style={{ ...sans, fontSize:9, color:stone, margin:'2px 0 0' }}>{budgetPct}% used</p>
                  </div>
                  <span style={{ ...sans, fontSize:11, color:dark }}>{fmt(p.spent)}</span>
                  <div>
                    <p style={{ ...sans, fontSize:11, color:dark, margin:'0 0 3px' }}>{p.elapsed}/{p.days} days</p>
                    <Bar value={p.elapsed} max={p.days} color={timePct>90?'#ef4444':'#3b82f6'}/>
                    <p style={{ ...sans, fontSize:9, color:stone, margin:'2px 0 0' }}>{p.pct}% done</p>
                  </div>
                  <span style={{ ...sans, fontSize:11, color:dark }}>{p.team} members</span>
                  <span style={{ ...sans, fontSize:11, fontWeight:600, color:p.issues>0?'#ef4444':stone }}>{p.issues}</span>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ ...serif, fontSize:20, color:healthColor(p.score), fontWeight:700 }}>{p.score}</span>
                      <div style={{ width:32, height:32, border:`2px solid ${healthColor(p.score)}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:12 }}>{p.score>=85?'✓':p.score>=70?'~':'!'}</span>
                      </div>
                    </div>
                    <Bar value={p.score} max={100} color={healthColor(p.score)} height={3}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Team velocity */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px' }}>
              <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 16px' }}>Budget Utilization</p>
              {PROJECTS.map(p=>{
                const pct = Math.round((p.spent/p.budget)*100)
                return (
                  <div key={p.id} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ ...sans, fontSize:11, color:dark }}>{p.name}</span>
                      <span style={{ ...sans, fontSize:11, fontWeight:700, color:pct>90?'#ef4444':pct>75?'#d97706':stone }}>{pct}%</span>
                    </div>
                    <div style={{ height:6, background:'#f0ede9' }}>
                      <div style={{ height:'100%', background:pct>90?'#ef4444':pct>75?gold:'#22c55e', width:pct+'%', transition:'width 0.4s' }}/>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ background:'#fff', border:`1px solid ${bdr}`, padding:'20px 24px' }}>
              <p style={{ ...sans, fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:stone, margin:'0 0 16px' }}>Project Starts per Month</p>
              <div style={{ display:'flex', gap:12, alignItems:'flex-end', height:120, borderBottom:`1px solid ${bdr}` }}>
                {MONTHS.map((m,i)=>{
                  const h = PROJ_STARTS[i]*36
                  return (
                    <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, justifyContent:'flex-end' }}>
                      <span style={{ ...sans, fontSize:10, fontWeight:700, color:dark }}>{PROJ_STARTS[i]||''}</span>
                      <div style={{ width:'100%', height: h||4, background: h?gold:'#f0ede9' }}/>
                      <span style={{ ...sans, fontSize:9, color:stone }}>{m}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop:16, padding:12, background:'#f9f8f6', border:`1px solid ${bdr}` }}>
                <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>Average project value: <strong style={{ color:dark }}>{fmt(Math.round(totalBudget/PROJECTS.length))}</strong></p>
                <p style={{ ...sans, fontSize:10, color:stone, margin:'4px 0 0' }}>Average duration: <strong style={{ color:dark }}>{Math.round(PROJECTS.reduce((a,p)=>a+p.days,0)/PROJECTS.length)} days</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Project detail drawer */}
        {sel && (
          <div style={{ width:300, background:'#fff', borderLeft:`1px solid ${bdr}`, padding:24, overflowY:'auto', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <span style={{ ...serif, fontSize:16, color:dark, fontWeight:600 }}>Project Deep Dive</span>
              <button onClick={()=>setSel(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:stone }}>×</button>
            </div>
            <div style={{ background:`${healthColor(sel.score)}12`, border:`1px solid ${healthColor(sel.score)}30`, padding:16, marginBottom:16 }}>
              <p style={{ ...serif, fontSize:20, color:dark, margin:'0 0 2px', fontWeight:600 }}>{sel.name}</p>
              <p style={{ ...sans, fontSize:10, color:stone, margin:'0 0 8px' }}>{sel.id}</p>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ ...serif, fontSize:36, color:healthColor(sel.score), fontWeight:700 }}>{sel.score}</span>
                <div>
                  <p style={{ ...sans, fontSize:10, fontWeight:700, color:healthColor(sel.score), margin:0 }}>{sel.score>=85?'HEALTHY':sel.score>=70?'AT RISK':'CRITICAL'}</p>
                  <p style={{ ...sans, fontSize:9, color:stone, margin:0 }}>Health Score</p>
                </div>
              </div>
            </div>
            {[
              ['Phase', sel.phase],
              ['Completion', sel.pct+'%'],
              ['Budget', fmt(sel.budget)],
              ['Spent', fmt(sel.spent)],
              ['Remaining', fmt(sel.budget-sel.spent)],
              ['Timeline', sel.elapsed+' of '+sel.days+' days'],
              ['Team Size', sel.team+' members'],
              ['Open Issues', sel.issues],
            ].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${bdr}` }}>
                <span style={{ ...sans, fontSize:10, color:stone, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>{k}</span>
                <span style={{ ...sans, fontSize:11, color:dark, fontWeight: k==='Open Issues'&&sel.issues>0?700:400, ...(k==='Open Issues'&&sel.issues>0?{color:'#ef4444'}:{}) }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:16 }}>
              <p style={{ ...sans, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:stone, margin:'0 0 8px' }}>Budget Burn</p>
              <div style={{ height:8, background:'#f0ede9', marginBottom:4 }}>
                <div style={{ height:'100%', background:Math.round((sel.spent/sel.budget)*100)>90?'#ef4444':gold, width:Math.round((sel.spent/sel.budget)*100)+'%' }}/>
              </div>
              <p style={{ ...sans, fontSize:10, color:stone, margin:0 }}>{Math.round((sel.spent/sel.budget)*100)}% of budget consumed · {Math.round((sel.elapsed/sel.days)*100)}% of timeline elapsed</p>
            </div>
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={()=>nav('/pipeline')} style={{ ...sans, fontSize:11, fontWeight:700, background:gold, color:dark, border:'none', padding:10, cursor:'pointer', letterSpacing:'0.08em' }}>VIEW IN PIPELINE</button>
              <button onClick={()=>nav('/financial')} style={{ ...sans, fontSize:11, fontWeight:600, background:'#fff', color:dark, border:`1px solid ${bdr}`, padding:10, cursor:'pointer', letterSpacing:'0.08em' }}>FINANCIAL DETAILS</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
