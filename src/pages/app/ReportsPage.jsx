import { useState } from 'react'
import { Link } from 'react-router-dom'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: `1px solid ${bdr}`, ...style }}>{children}</div>
}
function STitle({ children }) {
  return <p style={{ ...serif, fontSize: 20, fontWeight: 300, color: dark, margin: '0 0 18px' }}>{children}</p>
}
function Kpi({ label, value, sub, accent }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: '18px 22px', flex: 1 }}>
      <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 8px' }}>{label}</p>
      <p style={{ ...serif, fontSize: 32, fontWeight: 300, color: accent || dark, margin: '0 0 4px' }}>{value}</p>
      {sub && <p style={{ ...sans, fontSize: 10, color: '#a8a29e', margin: 0 }}>{sub}</p>}
    </div>
  )
}

// ── Bar chart (CSS) ───────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color, fmtVal }) {
  const max = Math.max(...data.map(d => d[valueKey]))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(d => {
        const pct = (d[valueKey] / max) * 100
        return (
          <div key={d[labelKey]} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ ...sans, fontSize: 11, color: stone, width: 140, flexShrink: 0, textAlign: 'right' }}>{d[labelKey]}</span>
            <div style={{ flex: 1, height: 22, background: light }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color || gold, display: 'flex', alignItems: 'center', paddingLeft: 8, transition: 'width 0.5s', minWidth: 4 }}>
                {pct > 20 && <span style={{ ...sans, fontSize: 10, fontWeight: 700, color: '#000', whiteSpace: 'nowrap' }}>{fmtVal ? fmtVal(d[valueKey]) : d[valueKey]}</span>}
              </div>
            </div>
            {pct <= 20 && <span style={{ ...sans, fontSize: 10, color: dark }}>{fmtVal ? fmtVal(d[valueKey]) : d[valueKey]}</span>}
          </div>
        )
      })}
    </div>
  )
}

// ── Donut chart (SVG) ─────────────────────────────────────────────
function DonutChart({ slices, size = 120 }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  let cumPct = 0
  const r = 44; const cx = 60; const cy = 60; const R = 2 * Math.PI * r

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={bdr} strokeWidth={14} />
        {slices.map(s => {
          const pct = s.value / total
          const offset = R - cumPct * R
          cumPct += pct
          return (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={14}
              strokeDasharray={`${pct * R} ${R}`} strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }} />
          )
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 13, fontFamily: "'Cormorant Garamond', Georgia, serif", fill: dark }}>{Math.round(slices[0].value / total * 100)}%</text>
      </svg>
      <div style={{ flex: 1 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, background: s.color, flexShrink: 0 }} />
            <span style={{ ...sans, fontSize: 11, color: stone, flex: 1 }}>{s.label}</span>
            <span style={{ ...sans, fontSize: 11, fontWeight: 600, color: dark }}>{Math.round(s.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Report tabs ───────────────────────────────────────────────────
const PROJECTS_DATA = [
  { name: 'Mehta Villa',    client: 'Rajesh Mehta', phase: 'Installation', pct: 68, budget: 2800000, spent: 1904000, tasks: 18, done: 12, delay_days: 5,  workers: 6, quality: 88 },
  { name: 'Sundar Apt',     client: 'Priya Sundar', phase: 'Design',       pct: 35, budget: 1200000, spent: 420000,  tasks: 9,  done: 3,  delay_days: 0,  workers: 3, quality: 92 },
  { name: 'Kapoor Office',  client: 'Anil Kapoor',  phase: 'Procurement',  pct: 22, budget: 3500000, spent: 770000,  tasks: 14, done: 3,  delay_days: 2,  workers: 4, quality: 85 },
  { name: 'Sharma Residence',client:'Deepa Sharma', phase: 'QC',           pct: 91, budget: 4200000, spent: 3822000, tasks: 22, done: 20, delay_days: 8,  workers: 7, quality: 94 },
]
const WORKERS_DATA = [
  { name: 'Ravi Mohan',     role: 'Site Lead',      tasks: 8, hrs: 168, quality: 88, projects: 2 },
  { name: 'Anitha Selvam',  role: 'Designer',       tasks: 12, hrs: 140, quality: 95, projects: 3 },
  { name: 'Suresh Kumar',   role: 'Civil Worker',   tasks: 6,  hrs: 152, quality: 79, projects: 2 },
  { name: 'Kavitha Raj',    role: 'Procurement',    tasks: 9,  hrs: 120, quality: 91, projects: 3 },
  { name: 'Deepan Murugan', role: 'Fabrication',    tasks: 11, hrs: 160, quality: 84, projects: 1 },
  { name: 'Arjun T.',       role: 'Designer',       tasks: 7,  hrs: 96,  quality: 90, projects: 2 },
]
const DELAY_DATA = [
  { task: 'Granite countertop installation', project: 'Mehta Villa',    reason: 'Material delay — vendor backorder', days: 8,  assignee: 'Suresh Kumar' },
  { task: 'Client approval — Phase 2',       project: 'Kapoor Office',  reason: 'Client unavailability',             days: 5,  assignee: 'Sneha M.' },
  { task: 'Final QC sign-off',               project: 'Sharma Res.',   reason: 'Punch list items pending',          days: 12, assignee: 'Ravi Mohan' },
  { task: 'PO-2025-003 delivery',            project: 'All Projects',   reason: 'Vendor logistics delay',            days: 4,  assignee: 'Kavitha Raj' },
]
const MONTHLY_REVENUE = [
  { month: 'Jan', value: 840000  },
  { month: 'Feb', value: 1200000 },
  { month: 'Mar', value: 980000  },
  { month: 'Apr', value: 1560000 },
  { month: 'May', value: 2100000 },
  { month: 'Jun', value: 1750000 },
]

function ProjectSummaryReport() {
  const fmtINR = n => '₹' + Math.round(n).toLocaleString('en-IN')
  return (
    <div>
      <STitle>Project Summary Report</STitle>
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <Kpi label="Active Projects"  value={4}         sub="in various phases" accent={gold} />
        <Kpi label="Avg Completion"   value="54%"       sub="portfolio average" />
        <Kpi label="Total Budget"     value="₹1.17 Cr"  sub="across 4 projects" />
        <Kpi label="Total Spent"      value="₹69.2L"    sub="59% of total budget" accent={gold} />
        <Kpi label="On-time Rate"     value="62%"       sub="projects on schedule" />
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${bdr}` }}>
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: 0 }}>Phase-wise Status</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${dark}` }}>
              {['Project', 'Client', 'Phase', 'Progress', 'Budget', 'Spent', 'Tasks', 'Quality', 'Delay'].map(h => (
                <th key={h} style={{ ...sans, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone, padding: '10px 16px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROJECTS_DATA.map((p, i) => {
              const budgetPct = ((p.spent / p.budget) * 100).toFixed(0)
              return (
                <tr key={p.name} style={{ borderBottom: `1px solid ${bdr}`, background: i % 2 === 0 ? '#fff' : light }}>
                  <td style={{ ...sans, fontSize: 12, fontWeight: 500, color: dark, padding: '12px 16px' }}>{p.name}</td>
                  <td style={{ ...sans, fontSize: 11, color: stone, padding: '12px 16px' }}>{p.client}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: gold, border: `1px solid ${gold}`, padding: '1px 6px' }}>{p.phase}</span>
                  </td>
                  <td style={{ padding: '12px 16px', width: 100 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: bdr }}>
                        <div style={{ height: 4, width: `${p.pct}%`, background: gold }} />
                      </div>
                      <span style={{ ...sans, fontSize: 10, color: dark }}>{p.pct}%</span>
                    </div>
                  </td>
                  <td style={{ ...sans, fontSize: 11, color: stone, padding: '12px 16px' }}>{fmtINR(p.budget)}</td>
                  <td style={{ ...sans, fontSize: 11, color: +budgetPct > 90 ? '#ef4444' : dark, padding: '12px 16px' }}>{fmtINR(p.spent)} ({budgetPct}%)</td>
                  <td style={{ ...sans, fontSize: 11, color: dark, padding: '12px 16px' }}>{p.done}/{p.tasks}</td>
                  <td style={{ ...sans, fontSize: 11, fontWeight: 700, color: p.quality >= 90 ? '#22c55e' : p.quality >= 80 ? gold : '#ef4444', padding: '12px 16px' }}>{p.quality}%</td>
                  <td style={{ ...sans, fontSize: 11, color: p.delay_days > 0 ? '#ef4444' : '#22c55e', fontWeight: 700, padding: '12px 16px' }}>{p.delay_days > 0 ? `+${p.delay_days}d` : '✓'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <Card style={{ padding: 20 }}>
        <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 16px' }}>Revenue — Monthly Trend (2025)</p>
        <BarChart data={MONTHLY_REVENUE} labelKey="month" valueKey="value" fmtVal={v => `₹${(v / 100000).toFixed(1)}L`} />
      </Card>
    </div>
  )
}

function WorkerProductivityReport() {
  const maxHrs = Math.max(...WORKERS_DATA.map(w => w.hrs))
  return (
    <div>
      <STitle>Worker Productivity Report — June 2025</STitle>
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <Kpi label="Total Staff"      value={WORKERS_DATA.length} />
        <Kpi label="Avg Quality"      value={Math.round(WORKERS_DATA.reduce((s, w) => s + w.quality, 0) / WORKERS_DATA.length) + '%'} accent={gold} />
        <Kpi label="Total Hrs Logged" value={WORKERS_DATA.reduce((s, w) => s + w.hrs, 0) + 'h'} />
        <Kpi label="Tasks Completed"  value={WORKERS_DATA.reduce((s, w) => s + w.tasks, 0)} accent={gold} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 20 }}>
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 14px' }}>Hours Logged This Month</p>
          <BarChart data={WORKERS_DATA} labelKey="name" valueKey="hrs" fmtVal={v => `${v}h`} />
        </Card>
        <Card style={{ padding: 20 }}>
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 14px' }}>Quality Ratings</p>
          <DonutChart slices={[
            { label: 'Excellent (90+)', value: WORKERS_DATA.filter(w => w.quality >= 90).length, color: '#22c55e' },
            { label: 'Good (80–90)',    value: WORKERS_DATA.filter(w => w.quality >= 80 && w.quality < 90).length, color: gold },
            { label: 'Needs Improvement',value: WORKERS_DATA.filter(w => w.quality < 80).length, color: '#f59e0b' },
          ]} />
        </Card>
      </div>

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${dark}` }}>
              {['Employee', 'Role', 'Tasks Done', 'Hours Logged', 'Projects', 'Quality Score', 'Rating'].map(h => (
                <th key={h} style={{ ...sans, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone, padding: '10px 16px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...WORKERS_DATA].sort((a, b) => b.quality - a.quality).map((w, i) => (
              <tr key={w.name} style={{ borderBottom: `1px solid ${bdr}`, background: i % 2 === 0 ? '#fff' : light }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: dark, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ ...sans, fontSize: 9, fontWeight: 700, color: gold }}>{w.name.split(' ').map(x => x[0]).join('')}</span>
                    </div>
                    <span style={{ ...sans, fontSize: 12, fontWeight: 500, color: dark }}>{w.name}</span>
                  </div>
                </td>
                <td style={{ ...sans, fontSize: 11, color: stone, padding: '12px 16px' }}>{w.role}</td>
                <td style={{ ...sans, fontSize: 11, color: dark, padding: '12px 16px' }}>{w.tasks}</td>
                <td style={{ ...sans, fontSize: 11, color: dark, padding: '12px 16px' }}>{w.hrs}h</td>
                <td style={{ ...sans, fontSize: 11, color: stone, padding: '12px 16px' }}>{w.projects}</td>
                <td style={{ padding: '12px 16px', width: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: bdr }}>
                      <div style={{ height: 4, width: `${w.quality}%`, background: w.quality >= 90 ? '#22c55e' : gold }} />
                    </div>
                    <span style={{ ...sans, fontSize: 10, fontWeight: 700, color: w.quality >= 90 ? '#22c55e' : gold }}>{w.quality}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ ...sans, fontSize: 11, fontWeight: 700, color: w.quality >= 90 ? '#22c55e' : w.quality >= 80 ? gold : '#f59e0b' }}>
                    {w.quality >= 90 ? '★★★★★' : w.quality >= 85 ? '★★★★' : '★★★'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function DelayAnalysisReport() {
  return (
    <div>
      <STitle>Delay Analysis Report</STitle>
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <Kpi label="Delayed Tasks"   value={DELAY_DATA.length}                                          accent="#ef4444" />
        <Kpi label="Total Delay Days" value={DELAY_DATA.reduce((s, d) => s + d.days, 0) + 'd'}          sub="cumulative" />
        <Kpi label="Longest Delay"   value={Math.max(...DELAY_DATA.map(d => d.days)) + 'd'}             accent="#ef4444" />
        <Kpi label="On-time Tasks"   value="34"                                                          sub="out of 38 total" accent={gold} />
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${bdr}` }}>
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: 0 }}>Delayed Items</p>
        </div>
        {DELAY_DATA.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: `1px solid ${bdr}`, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ ...sans, fontSize: 11, fontWeight: 700, color: '#ef4444' }}>+{d.days}d</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ ...serif, fontSize: 15, fontWeight: 300, color: dark, margin: '0 0 4px' }}>{d.task}</p>
              <p style={{ ...sans, fontSize: 11, color: stone, margin: '0 0 6px' }}>{d.project} · {d.assignee}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ef4444', border: '1px solid #fecaca', padding: '1px 7px' }}>Root Cause</span>
                <span style={{ ...sans, fontSize: 11, color: dark }}>{d.reason}</span>
              </div>
            </div>
            <div style={{ width: 80, height: 4, background: bdr, marginTop: 8 }}>
              <div style={{ height: 4, width: `${Math.min((d.days / 14) * 100, 100)}%`, background: '#ef4444' }} />
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 20 }}>
        <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 16px' }}>Delay by Root Cause</p>
        <BarChart
          data={[
            { label: 'Material delays',    value: 8 },
            { label: 'Client approvals',   value: 5 },
            { label: 'Labour shortage',    value: 3 },
            { label: 'Vendor logistics',   value: 4 },
            { label: 'Design revisions',   value: 2 },
          ]}
          labelKey="label" valueKey="value" color="#ef4444" fmtVal={v => `${v} days`}
        />
      </Card>
    </div>
  )
}

function ClientProgressReport() {
  const [selected, setSelected] = useState(PROJECTS_DATA[0])

  return (
    <div>
      <STitle>Client Progress Reports</STitle>
      <p style={{ ...sans, fontSize: 11, color: stone, margin: '-14px 0 20px' }}>Client-facing, branded summary — shareable link or PDF</p>

      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {PROJECTS_DATA.map(p => (
          <button key={p.name} onClick={() => setSelected(p)}
            style={{ flex: 1, padding: '12px 16px', background: selected.name === p.name ? `${gold}10` : '#fff', border: `1px solid ${selected.name === p.name ? gold : bdr}`, cursor: 'pointer', textAlign: 'left' }}>
            <p style={{ ...serif, fontSize: 14, color: dark, margin: '0 0 2px' }}>{p.name}</p>
            <p style={{ ...sans, fontSize: 10, color: stone, margin: 0 }}>{p.client}</p>
          </button>
        ))}
      </div>

      {/* Client report card */}
      <div style={{ background: '#fff', border: `1px solid ${bdr}`, overflow: 'hidden' }}>
        {/* Report header */}
        <div style={{ background: dark, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ ...serif, fontSize: 10, fontWeight: 300, color: gold, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 6px' }}>El Shaddai Interiors</p>
            <p style={{ ...serif, fontSize: 28, fontWeight: 300, color: '#fff', margin: '0 0 4px' }}>{selected.name}</p>
            <p style={{ ...sans, fontSize: 11, color: '#78716c', margin: 0 }}>Client Report · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ ...serif, fontSize: 48, fontWeight: 300, color: gold, margin: '0 0 2px', lineHeight: 1 }}>{selected.pct}%</p>
            <p style={{ ...sans, fontSize: 9, color: '#78716c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Overall Complete</p>
          </div>
        </div>

        <div style={{ padding: '28px 32px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ height: 8, background: bdr, marginBottom: 8 }}>
              <div style={{ height: 8, width: `${selected.pct}%`, background: gold, transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ ...sans, fontSize: 10, color: stone }}>Project Start</span>
              <span style={{ ...sans, fontSize: 10, fontWeight: 700, color: gold }}>{selected.pct}% done</span>
              <span style={{ ...sans, fontSize: 10, color: stone }}>Handover</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Current Phase', value: selected.phase },
              { label: 'Tasks Done', value: `${selected.done} of ${selected.tasks}` },
              { label: 'Quality Score', value: `${selected.quality}%`, accent: selected.quality >= 90 ? '#22c55e' : gold },
              { label: 'Budget Used', value: `₹${(selected.spent / 100000).toFixed(1)}L`, sub: `of ₹${(selected.budget / 100000).toFixed(0)}L` },
              { label: 'Schedule', value: selected.delay_days > 0 ? `+${selected.delay_days}d delay` : 'On Track', accent: selected.delay_days > 0 ? '#ef4444' : '#22c55e' },
              { label: 'Satisfaction', value: '★★★★★', accent: gold },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '14px 16px', border: `1px solid ${bdr}`, background: light }}>
                <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone, margin: '0 0 6px' }}>{stat.label}</p>
                <p style={{ ...serif, fontSize: 20, color: stat.accent || dark, margin: '0 0 2px', fontWeight: 300 }}>{stat.value}</p>
                {stat.sub && <p style={{ ...sans, fontSize: 10, color: stone, margin: 0 }}>{stat.sub}</p>}
              </div>
            ))}
          </div>

          {/* Milestones */}
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 14px' }}>Project Milestones</p>
          {[
            { label: 'Concept Design Approved',   done: true,  date: 'Mar 2025' },
            { label: 'Material Board Finalised',  done: true,  date: 'Apr 2025' },
            { label: 'Fabrication Complete',      done: selected.pct > 60, date: 'Jun 2025' },
            { label: 'Site Execution',            done: selected.pct > 80, date: 'Jul 2025' },
            { label: 'Final Handover',            done: selected.pct === 100, date: 'Aug 2025' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, background: m.done ? gold : '#fff', border: `1px solid ${m.done ? gold : bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {m.done && <span style={{ fontSize: 11, color: '#000' }}>✓</span>}
              </div>
              <span style={{ ...sans, fontSize: 12, color: m.done ? dark : '#a8a29e', flex: 1 }}>{m.label}</span>
              <span style={{ ...sans, fontSize: 10, color: stone }}>{m.date}</span>
            </div>
          ))}

          <div style={{ marginTop: 24, padding: '14px 18px', border: `1px solid ${gold}`, background: `${gold}08`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ ...serif, fontSize: 14, fontWeight: 300, color: dark, margin: 0 }}>Estimated Completion: <strong>August 2025</strong></p>
            <button style={{ ...sans, padding: '8px 20px', background: gold, border: 'none', color: '#000', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
              onClick={() => window.print()}>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'summary',    icon: '◈', label: 'Project Summary' },
  { id: 'workers',    icon: '◉', label: 'Worker Productivity' },
  { id: 'delays',     icon: '⚠', label: 'Delay Analysis' },
  { id: 'client',     icon: '◎', label: 'Client Report' },
]

export default function ReportsPage() {
  const [tab, setTab]   = useState('summary')
  const [sideC, setSideC] = useState(false)
  const user = JSON.parse(localStorage.getItem('es_user') || '{"name":"Admin","role":"ADMIN"}')
  const initials = (user.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const W = sideC ? 60 : 220

  const CONTENT = { summary: <ProjectSummaryReport />, workers: <WorkerProductivityReport />, delays: <DelayAnalysisReport />, client: <ClientProgressReport /> }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', ...sans, background: light }}>
      <aside style={{ width: W, background: dark, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.22s ease', overflow: 'hidden' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: sideC ? '0 15px' : '0 16px', borderBottom: '1px solid #292524', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none" /></svg>
          </div>
          {!sideC && (
            <div>
              <p style={{ ...serif, margin: 0, fontSize: 15, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>El Shaddai</p>
              <p style={{ margin: 0, fontSize: 8, color: gold, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Reports</p>
            </div>
          )}
          <button onClick={() => setSideC(c => !c)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#57534e', cursor: 'pointer', fontSize: 14, padding: 4 }}>{sideC ? '»' : '«'}</button>
        </div>
        <nav style={{ flex: 1, padding: '10px 6px' }}>
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} title={t.label}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: sideC ? '10px 15px' : '9px 12px', background: active ? 'rgba(201,162,39,0.08)' : 'transparent', border: 'none', borderLeft: `2px solid ${active ? gold : 'transparent'}`, color: active ? gold : '#78716c', cursor: 'pointer', ...sans, fontSize: 11, fontWeight: active ? 600 : 400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                {!sideC && <span>{t.label}</span>}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: sideC ? '10px 6px' : '10px 8px', borderTop: '1px solid #292524' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sideC ? '8px 15px' : '8px 12px', color: '#78716c', textDecoration: 'none', ...sans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <span>◁</span>{!sideC && <span>Dashboards</span>}
          </Link>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ height: 60, background: '#fff', borderBottom: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0 }}>
          <p style={{ ...serif, margin: 0, fontSize: 22, fontWeight: 300, color: dark }}>{TABS.find(t => t.id === tab)?.label}</p>
          <div style={{ flex: 1 }} />
          <span style={{ ...sans, fontSize: 10, color: '#a8a29e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Analytics & Reports</span>
          <button onClick={() => window.print()} style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 16px', background: 'none', border: `1px solid ${bdr}`, color: stone, cursor: 'pointer' }}>Export PDF</button>
          <div style={{ width: 32, height: 32, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#000' }}>{initials}</div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {CONTENT[tab]}
        </main>
      </div>
    </div>
  )
}
