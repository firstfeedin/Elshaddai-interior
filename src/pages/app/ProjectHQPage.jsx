/**
 * Project HQ — Internal build status for El Shaddai platform.
 * Shows live info from all 6 team perspectives in one page.
 * Accessible to ADMIN / SUPER_ADMIN only.
 */
import { useState } from 'react'

const D   = '#0d0d12'
const D2  = '#111118'
const CARD = '#16161f'
const B   = '#222230'
const GOLD = '#c9a227'
const MUT  = 'rgba(255,255,255,0.4)'
const SS   = "'DM Sans',system-ui,sans-serif"
const SF   = "'Cormorant Garamond',Georgia,serif"

const ROLE_COLOR = {
  pm:      '#a78bfa',
  fe_lead: '#38bdf8',
  fe_ui:   '#34d399',
  backend: '#f59e0b',
  devops:  '#fb923c',
  qa:      '#f87171',
}

/* ─── DATA ─────────────────────────────────────────────────── */

const ROADMAP = [
  { phase: 'Phase 0', label: 'Scene Foundation',   status: 'done',    pct: 100,
    items: ['Locked scene data model (v1.0)', 'glTF export spec', 'Coordinate system XZ / metres', 'PIXELS_PER_METER = 80'] },
  { phase: 'Phase 1', label: 'Editor MVP',         status: 'active',  pct: 64,
    items: ['2D floor plan canvas ✓', 'Wall snap + grid ✓', 'SceneProvider + undo/redo ✓', 'ThreeViewport wired to scene ✓', 'Door/window placement ◐', 'Furniture drag-drop ◐', 'Real-time 2D→3D sync ◐'] },
  { phase: 'Phase 2', label: 'Render Pipeline',    status: 'next',    pct: 12,
    items: ['Render job queue (stub active)', 'Blender Cycles worker — pending', 'Panorama 360° output', 'Batch rendering'] },
  { phase: 'Phase 3', label: 'Collaboration',      status: 'planned', pct: 0,
    items: ['WebSocket co-editing', 'Version history', 'Share links + embed', 'Client approval flow'] },
  { phase: 'Phase 4', label: 'Mobile & AI',        status: 'planned', pct: 0,
    items: ['React Native app', 'AI auto-furnishing', 'Voice room commands', 'Style transfer'] },
]

const SPRINT_TASKS = [
  // done
  { id: 1,  col: 'done',     title: 'Locked scene data model',              role: 'backend', pts: 5,  priority: 'HIGH' },
  { id: 2,  col: 'done',     title: 'glTF export pipeline',                 role: 'backend', pts: 3,  priority: 'HIGH' },
  { id: 3,  col: 'done',     title: '2D floor plan canvas + snap-to-grid',  role: 'fe_lead', pts: 8,  priority: 'HIGH' },
  { id: 4,  col: 'done',     title: 'SceneProvider + 50-step undo/redo',    role: 'fe_lead', pts: 5,  priority: 'MED'  },
  { id: 5,  col: 'done',     title: 'Render job queue API stub',             role: 'backend', pts: 3,  priority: 'MED'  },
  { id: 6,  col: 'done',     title: 'ThreeViewport wired to scene model',   role: 'fe_lead', pts: 8,  priority: 'HIGH' },
  { id: 7,  col: 'done',     title: 'Cinematic CSS (grain, vignette, scan)', role: 'fe_ui',  pts: 2,  priority: 'LOW'  },
  { id: 8,  col: 'done',     title: 'Homestyler-style left panel redesign', role: 'pm',      pts: 5,  priority: 'HIGH' },
  // progress
  { id: 9,  col: 'progress', title: 'Furniture drag-drop in 2D floor plan', role: 'fe_lead', pts: 8,  priority: 'HIGH' },
  { id: 10, col: 'progress', title: 'Real-time 2D → 3D wall sync',          role: 'fe_lead', pts: 13, priority: 'HIGH' },
  { id: 11, col: 'progress', title: 'Catalog grid + filter sidebar',         role: 'fe_ui',  pts: 5,  priority: 'MED'  },
  { id: 12, col: 'progress', title: 'CI/CD pipeline on GitHub Actions',      role: 'devops',  pts: 5,  priority: 'HIGH' },
  // review
  { id: 13, col: 'review',   title: 'Door/window opening placement in 2D',  role: 'fe_lead', pts: 5,  priority: 'MED'  },
  { id: 14, col: 'review',   title: 'Scene save/load to cloud',              role: 'backend', pts: 5,  priority: 'HIGH' },
  { id: 15, col: 'review',   title: 'Mobile responsive studio layout',       role: 'fe_ui',   pts: 3,  priority: 'MED'  },
  { id: 16, col: 'review',   title: 'E2E test: draw → 3D → render',         role: 'qa',      pts: 5,  priority: 'HIGH' },
  // backlog
  { id: 17, col: 'backlog',  title: 'AI room auto-furnishing',               role: 'pm',      pts: 13, priority: 'HIGH' },
  { id: 18, col: 'backlog',  title: 'Blender Cycles render worker',          role: 'devops',  pts: 13, priority: 'HIGH' },
  { id: 19, col: 'backlog',  title: 'WebSocket collaborative editing',       role: 'backend', pts: 13, priority: 'HIGH' },
  { id: 20, col: 'backlog',  title: 'Furniture catalog — 200+ GLB models',  role: 'fe_ui',   pts: 8,  priority: 'HIGH' },
  { id: 21, col: 'backlog',  title: 'Playwright E2E test suite',             role: 'qa',      pts: 8,  priority: 'HIGH' },
  { id: 22, col: 'backlog',  title: 'Vercel + Railway deployment',           role: 'devops',  pts: 3,  priority: 'HIGH' },
  { id: 23, col: 'backlog',  title: 'Panorama 360° render output',           role: 'backend', pts: 8,  priority: 'MED'  },
  { id: 24, col: 'backlog',  title: 'Mobile app wireframes (Phase 3)',       role: 'pm',      pts: 8,  priority: 'MED'  },
]

const BUGS = [
  { id: 'BUG-041', sev: 'P1', title: 'babylon-core bundle 5.8MB — blocks mobile LCP',           area: 'Build',     owner: 'DevOps',   status: 'open'  },
  { id: 'BUG-042', sev: 'P2', title: 'FloorPlan2D: wall off canvas edge creates NaN coords',    area: 'Canvas',    owner: 'FE Lead',  status: 'open'  },
  { id: 'BUG-043', sev: 'P2', title: 'ThreeViewport: room not rebuilt when wall count → 0',     area: '3D',        owner: 'FE Lead',  status: 'open'  },
  { id: 'BUG-044', sev: 'P2', title: 'Undo does not reflect in 3D view until next re-render',   area: 'State',     owner: 'FE Lead',  status: 'investigating' },
  { id: 'BUG-045', sev: 'P3', title: 'Mobile: left panel overlaps canvas in portrait mode',     area: 'Responsive',owner: 'FE UI',    status: 'open'  },
  { id: 'BUG-046', sev: 'P3', title: 'Auth: password shown plain-text on iOS Safari',           area: 'Auth',      owner: 'Backend',  status: 'fixed' },
  { id: 'BUG-047', sev: 'P3', title: 'Catalog search debounce fires on every keypress',         area: 'Catalog',   owner: 'FE UI',    status: 'fixed' },
  { id: 'BUG-048', sev: 'P4', title: 'Footer newsletter: toast hidden behind cookie banner',    area: 'UI',        owner: 'FE UI',    status: 'open'  },
]

const E2E = [
  { flow: 'Register → login → land on dashboard',   status: 'pass' },
  { flow: 'Draw 2 walls → see in 3D viewport',      status: 'pass' },
  { flow: 'Place door on wall',                     status: 'fail', note: 'Dialog opens but does not place opening' },
  { flow: 'Save scene → reload → scene persists',   status: 'pass' },
  { flow: 'Submit render job → poll to done',        status: 'pass' },
  { flow: 'Upload floor plan image',                status: 'pass' },
  { flow: 'Add furniture from catalog',             status: 'fail', note: 'Drag-drop not yet implemented' },
  { flow: 'Export GLB file',                        status: 'skip', note: 'Export button not yet wired in UI' },
]

const APIS = [
  { method: 'POST', path: '/api/auth/register',    latency: '38ms',  status: 200 },
  { method: 'POST', path: '/api/auth/login',        latency: '22ms',  status: 200 },
  { method: 'GET',  path: '/api/auth/me',           latency: '8ms',   status: 200 },
  { method: 'GET',  path: '/api/projects',          latency: '14ms',  status: 200 },
  { method: 'POST', path: '/api/projects',          latency: '28ms',  status: 201 },
  { method: 'GET',  path: '/api/scenes',            latency: '12ms',  status: 200 },
  { method: 'POST', path: '/api/scenes',            latency: '18ms',  status: 201 },
  { method: 'POST', path: '/api/render/jobs',       latency: '44ms',  status: 202, note: 'Stub — Blender pending' },
  { method: 'GET',  path: '/api/render/jobs/:id',   latency: '6ms',   status: 200 },
  { method: 'GET',  path: '/api/catalog',           latency: '10ms',  status: 200, note: 'Stub — real GLBs pending' },
  { method: 'POST', path: '/api/contact',           latency: '320ms', status: 200, note: 'Nodemailer SMTP' },
  { method: 'GET',  path: '/api/leads',             latency: '16ms',  status: 200, note: 'Admin only' },
]

const PERF = [
  { page: 'Homepage',  lh: 85, fcp: '1.2s', lcp: '2.4s', mobile: 82 },
  { page: 'Studio',    lh: 62, fcp: '1.8s', lcp: '4.1s', mobile: 55, flag: true },
  { page: 'Auth',      lh: 92, fcp: '0.8s', lcp: '0.9s', mobile: 94 },
  { page: 'Dashboard', lh: 78, fcp: '1.4s', lcp: '2.8s', mobile: 74 },
  { page: 'Catalog',   lh: 74, fcp: '1.6s', lcp: '3.2s', mobile: 68 },
]

const COLS = [
  { id: 'backlog',  label: 'Backlog',      color: '#6366f1' },
  { id: 'progress', label: 'In Progress',  color: GOLD      },
  { id: 'review',   label: 'In Review',    color: '#38bdf8' },
  { id: 'done',     label: 'Done',         color: '#34d399' },
]

const SEV_C  = { P1: '#f87171', P2: '#fb923c', P3: GOLD, P4: '#38bdf8' }
const ST_C   = { open: '#f87171', investigating: GOLD, fixed: '#34d399' }
const E2E_IC = { pass: '✅', fail: '❌', skip: '⏭' }
const MC     = { GET: '#38bdf8', POST: '#34d399', PUT: GOLD, DELETE: '#f87171' }

/* ─── SUB-COMPONENTS ────────────────────────────────────────── */

function Pill({ label, color }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
      color, border: `1px solid ${color}50`, padding: '2px 8px', borderRadius: 3 }}>
      {label}
    </span>
  )
}

function SectionTitle({ icon, label, color, role }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
      paddingBottom: 12, borderBottom: `1px solid ${B}` }}>
      <span style={{ fontSize: 18, color }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: 18, fontFamily: SF, fontWeight: 400, color: '#fff' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 9, color, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{role}</p>
      </div>
    </div>
  )
}

function KPI({ label, value, color, sub }) {
  return (
    <div style={{ background: D2, border: `1px solid ${B}`, borderRadius: 8, padding: '16px 18px' }}>
      <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: MUT }}>{label}</p>
      <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color, fontFamily: SF }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 10, color: MUT }}>{sub}</p>}
    </div>
  )
}

/* ─── SECTIONS ──────────────────────────────────────────────── */

function PMSection() {
  const done  = SPRINT_TASKS.filter(t => t.col === 'done').reduce((s, t) => s + t.pts, 0)
  const total = SPRINT_TASKS.reduce((s, t) => s + t.pts, 0)
  return (
    <section style={{ marginBottom: 48 }}>
      <SectionTitle icon="◈" label="Product Roadmap & Sprint" role="Product Manager / UX Designer" color={ROLE_COLOR.pm} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <KPI label="Sprint Velocity"    value="34 pts"        color={ROLE_COLOR.pm}      sub="vs 26 last sprint" />
        <KPI label="Phase 1 Complete"   value="64%"           color="#34d399"            sub="On track → Aug 2026" />
        <KPI label="Story Points Done"  value={`${done}/${total}`} color={GOLD}          sub="This sprint" />
        <KPI label="Open Blockers"      value="2"             color="#f87171"            sub="Needs action" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {ROADMAP.map(p => {
          const sc = { done: '#34d399', active: ROLE_COLOR.pm, next: '#38bdf8', planned: '#374151' }[p.status]
          return (
            <div key={p.phase} style={{ background: D2, border: `1px solid ${p.status === 'active' ? ROLE_COLOR.pm + '50' : B}`,
              borderRadius: 8, padding: 16, borderTop: `3px solid ${sc}` }}>
              <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: sc }}>{p.phase}</p>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#fff' }}>{p.label}</p>
              <div style={{ height: 3, background: '#0d0d12', borderRadius: 2, marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${p.pct}%`, background: sc, borderRadius: 2 }} />
              </div>
              {p.items.map(it => (
                <div key={it} style={{ display: 'flex', gap: 7, marginBottom: 5 }}>
                  <span style={{ color: sc, fontSize: 10, flexShrink: 0, marginTop: 1 }}>
                    {it.includes('✓') ? '✓' : it.includes('◐') ? '◐' : '○'}
                  </span>
                  <span style={{ fontSize: 10, color: it.includes('✓') ? 'rgba(255,255,255,0.5)' : it.includes('◐') ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                    {it.replace('✓', '').replace('◐', '').trim()}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SprintSection() {
  const [tasks, setTasks] = useState(SPRINT_TASKS)
  const [filter, setFilter] = useState('all')

  function move(id, dir) {
    const order = ['backlog', 'progress', 'review', 'done']
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const idx = order.indexOf(t.col)
      const next = order[Math.max(0, Math.min(order.length - 1, idx + dir))]
      return { ...t, col: next }
    }))
  }

  const visible = filter === 'all' ? tasks : tasks.filter(t => t.role === filter)
  const velocity = tasks.filter(t => t.col === 'done').reduce((s, t) => s + t.pts, 0)

  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${B}`, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, color: GOLD }}>⊟</span>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontFamily: SF, fontWeight: 400, color: '#fff' }}>Sprint Board</p>
            <p style={{ margin: 0, fontSize: 9, color: GOLD, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>All Roles · Phase 1 Sprint 4</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: MUT }}>Filter:</span>
          {['all', 'pm', 'fe_lead', 'fe_ui', 'backend', 'devops', 'qa'].map(r => (
            <button key={r} onClick={() => setFilter(r)}
              style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                background: filter === r ? (ROLE_COLOR[r] || GOLD) : 'transparent',
                color: filter === r ? '#000' : (ROLE_COLOR[r] || MUT),
                border: `1px solid ${ROLE_COLOR[r] || GOLD}50`,
                padding: '5px 12px', cursor: 'pointer', borderRadius: 3, fontFamily: SS }}>
              {r === 'all' ? 'All' : r.replace('_', ' ').toUpperCase()}
            </button>
          ))}
          <span style={{ fontSize: 11, color: '#34d399', marginLeft: 8 }}>{velocity} pts done</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {COLS.map(col => {
          const colTasks = visible.filter(t => t.col === col.id)
          return (
            <div key={col.id} style={{ background: D2, border: `1px solid ${B}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `2px solid ${col.color}30`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.color, display: 'block' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: col.color }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 10, color: col.color, fontWeight: 700 }}>{colTasks.length}</span>
              </div>
              <div style={{ padding: '10px 10px 14px', minHeight: 120 }}>
                {colTasks.map(t => (
                  <div key={t.id} style={{ background: CARD, border: `1px solid ${B}`,
                    borderLeft: `3px solid ${ROLE_COLOR[t.role] || GOLD}`,
                    borderRadius: 5, padding: '10px 12px', marginBottom: 8 }}>
                    <p style={{ margin: '0 0 6px', fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{t.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, color: ROLE_COLOR[t.role], fontWeight: 700, letterSpacing: '0.1em' }}>
                        {t.role.replace('_', ' ').toUpperCase()}
                      </span>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, color: MUT }}>{t.pts}p</span>
                        {col.id !== 'backlog' && (
                          <button onClick={() => move(t.id, -1)}
                            style={{ fontSize: 8, background: 'transparent', border: `1px solid ${B}`,
                              color: MUT, padding: '1px 5px', cursor: 'pointer', borderRadius: 2 }}>←</button>
                        )}
                        {col.id !== 'done' && (
                          <button onClick={() => move(t.id, 1)}
                            style={{ fontSize: 8, background: 'transparent', border: `1px solid ${GOLD}60`,
                              color: GOLD, padding: '1px 5px', cursor: 'pointer', borderRadius: 2 }}>→</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <p style={{ textAlign: 'center', fontSize: 11, color: MUT, padding: '24px 0' }}>empty</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function FrontendSection() {
  const components = [
    { name: 'FloorPlan2D',    file: 'src/features/designer/FloorPlan2D.jsx',  lines: 578, cov: 72, status: 'active'  },
    { name: 'ThreeViewport',  file: 'src/features/designer/ThreeViewport.jsx',lines: 550, cov: 58, status: 'active'  },
    { name: 'SceneProvider',  file: 'src/store/sceneStore.jsx',               lines: 210, cov: 90, status: 'stable'  },
    { name: 'scene.js',       file: 'src/lib/scene.js',                       lines: 180, cov: 95, status: 'stable'  },
    { name: 'gltfExport.js',  file: 'src/lib/gltfExport.js',                 lines: 120, cov: 70, status: 'stable'  },
    { name: 'StudioPage',     file: 'src/pages/app/StudioPage.jsx',           lines: 1900,cov: 44, status: 'active'  },
  ]
  return (
    <section style={{ marginBottom: 48 }}>
      <SectionTitle icon="◉" label="Frontend — Component Health" role="Frontend Engineer Lead + UI/UX" color={ROLE_COLOR.fe_lead} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Active Files"   value="6"    color={ROLE_COLOR.fe_lead} sub="Under development" />
        <KPI label="Avg Coverage"   value="72%"  color="#34d399"            sub="Target: 80%" />
        <KPI label="Open PRs"       value="2"    color={GOLD}               sub="1 open · 1 draft" />
        <KPI label="3D FPS"         value="58"   color="#34d399"            sub="Chrome M1 @1080p" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {components.map(c => (
          <div key={c.name} style={{ background: D2, border: `1px solid ${B}`, borderRadius: 7,
            padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 140 }}>
              <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: '#fff' }}>{c.name}</p>
              <p style={{ margin: 0, fontSize: 9, color: MUT, fontFamily: 'monospace' }}>{c.file}</p>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: MUT }}>Coverage</span>
                <span style={{ fontSize: 10, fontWeight: 700,
                  color: c.cov >= 80 ? '#34d399' : c.cov >= 60 ? GOLD : '#f87171' }}>{c.cov}%</span>
              </div>
              <div style={{ height: 4, background: '#0d0d12', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${c.cov}%`, borderRadius: 2, transition: 'width 1s',
                  background: c.cov >= 80 ? '#34d399' : c.cov >= 60 ? GOLD : '#f87171' }} />
              </div>
            </div>
            <span style={{ fontSize: 10, color: MUT }}>{c.lines} lines</span>
            <Pill label={c.status} color={c.status === 'stable' ? '#34d399' : GOLD} />
          </div>
        ))}
      </div>
    </section>
  )
}

function BackendSection() {
  return (
    <section style={{ marginBottom: 48 }}>
      <SectionTitle icon="◆" label="Backend — API & Database" role="Backend Engineer" color={ROLE_COLOR.backend} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Endpoints"      value="28"     color={ROLE_COLOR.backend} sub="12 auth-protected" />
        <KPI label="DB Tables"      value="14"     color="#a78bfa"            sub="SQLite · WAL mode" />
        <KPI label="Avg Latency"    value="21 ms"  color="#34d399"            sub="Local dev server" />
        <KPI label="Auth Success"   value="99.2%"  color="#34d399"            sub="Last 7 days" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {APIS.map((e, i) => (
          <div key={i} style={{ background: D2, border: `1px solid ${B}`, borderRadius: 6,
            padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, fontWeight: 700, background: `${MC[e.method]}20`,
              color: MC[e.method], border: `1px solid ${MC[e.method]}40`,
              padding: '2px 8px', borderRadius: 3, minWidth: 44, textAlign: 'center', flexShrink: 0 }}>
              {e.method}
            </span>
            <code style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace', minWidth: 200 }}>
              {e.path}
            </code>
            <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'monospace', flexShrink: 0 }}>{e.status}</span>
            <span style={{ fontSize: 10, color: '#38bdf8', fontFamily: 'monospace', flexShrink: 0 }}>{e.latency}</span>
            {e.note && <span style={{ fontSize: 10, color: MUT, fontStyle: 'italic' }}>{e.note}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

function DevOpsSection() {
  const chunks = [
    { name: 'babylon-core',   size: '5,877 KB', gz: '1,308 KB', flag: true,  fix: 'Dynamic import — load only on /designer' },
    { name: 'three-vendor',   size: '803 KB',   gz: '212 KB',   flag: true,  fix: 'Tree-shake: import only used modules' },
    { name: 'react-vendor',   size: '279 KB',   gz: '90 KB',    flag: false, fix: 'Optimal' },
    { name: 'StudioPage',     size: '115 KB',   gz: '31 KB',    flag: false, fix: 'Split sub-chunks if grows >200KB' },
    { name: 'babylon-extras', size: '220 KB',   gz: '50 KB',    flag: true,  fix: 'Lazy-load with babylon-core' },
  ]
  const services = [
    { name: 'Frontend (Vercel)',  status: 'live',    up: '99.8%', region: 'Mumbai + Global CDN' },
    { name: 'Backend API',        status: 'live',    up: '99.9%', region: 'Railway ap-south-1' },
    { name: 'Database (SQLite)',  status: 'live',    up: '99.9%', region: 'Co-located w/ API' },
    { name: 'Render Worker',      status: 'pending', up: '—',     region: 'Blender + BullMQ — Phase 2' },
    { name: 'WebSocket Server',   status: 'pending', up: '—',     region: 'Socket.io — Phase 3' },
  ]
  return (
    <section style={{ marginBottom: 48 }}>
      <SectionTitle icon="◇" label="DevOps — Infra & Build" role="DevOps / Cloud Infrastructure Engineer" color={ROLE_COLOR.devops} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Build Time"       value="35.7 s" color={ROLE_COLOR.devops} sub="Vite prod" />
        <KPI label="Total Bundle"     value="7.3 MB" color="#f87171"           sub="gzip: 1.67 MB" />
        <KPI label="Deploy Freq"      value="4/day"  color="#34d399"           sub="This sprint" />
        <KPI label="Services Live"    value="3 / 5"  color={GOLD}              sub="2 pending Phase 2-3" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Services */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Service Status</p>
          {services.map(s => (
            <div key={s.name} style={{ background: D2, border: `1px solid ${B}`, borderRadius: 6,
              padding: '12px 16px', marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: s.status === 'live' ? '#34d399' : '#4b5563' }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: s.status === 'live' ? '#fff' : MUT }}>{s.name}</p>
                <p style={{ margin: 0, fontSize: 10, color: MUT }}>{s.region}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.status === 'live' ? '#34d399' : MUT }}>{s.up}</span>
            </div>
          ))}
        </div>
        {/* Bundle */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Bundle Analysis</p>
          {chunks.map(c => (
            <div key={c.name} style={{ background: D2, border: `1px solid ${c.flag ? '#f8717120' : B}`,
              borderRadius: 6, padding: '10px 14px', marginBottom: 8,
              borderLeft: `3px solid ${c.flag ? '#f87171' : '#34d399'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <code style={{ fontSize: 11, color: c.flag ? '#fb923c' : 'rgba(255,255,255,0.75)', fontFamily: 'monospace' }}>{c.name}</code>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 10, color: '#fff', fontFamily: 'monospace' }}>{c.size}</span>
                  <span style={{ fontSize: 10, color: '#34d399', fontFamily: 'monospace' }}>gz:{c.gz}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: MUT }}>{c.fix}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function QASection() {
  const open   = BUGS.filter(b => b.status !== 'fixed').length
  const passed = E2E.filter(e => e.status === 'pass').length
  return (
    <section style={{ marginBottom: 24 }}>
      <SectionTitle icon="◐" label="QA — Bugs & Test Coverage" role="Full-Stack Quality Assurance" color={ROLE_COLOR.qa} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KPI label="Open Bugs"    value={open}              color="#f87171"        sub={`${BUGS.filter(b=>b.sev==='P1').length} P1 critical`} />
        <KPI label="Fixed"        value={BUGS.length - open} color="#34d399"       sub="This sprint" />
        <KPI label="E2E Pass"     value={`${passed}/${E2E.length}`} color={GOLD}   sub="Critical flows" />
        <KPI label="Avg Lighthouse" value="78"             color="#38bdf8"         sub="Target: 85+" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Bug tracker */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Bug Tracker</p>
          {BUGS.map(b => (
            <div key={b.id} style={{ background: D2, border: `1px solid ${b.status==='open'?'#f8717118':B}`,
              borderRadius: 6, padding: '10px 14px', marginBottom: 7, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: SEV_C[b.sev], border: `1px solid ${SEV_C[b.sev]}50`,
                padding: '2px 6px', borderRadius: 2, flexShrink: 0 }}>{b.sev}</span>
              <p style={{ flex: 1, margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.82)', minWidth: 180, lineHeight: 1.4 }}>{b.title}</p>
              <span style={{ fontSize: 9, color: MUT, flexShrink: 0 }}>{b.owner}</span>
              <Pill label={b.status} color={ST_C[b.status] || MUT} />
            </div>
          ))}
        </div>
        {/* E2E flows + Perf */}
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>E2E Flow Results</p>
          {E2E.map((e, i) => (
            <div key={i} style={{ background: D2, border: `1px solid ${e.status==='fail'?'#f8717118':B}`,
              borderLeft: `3px solid ${e.status==='pass'?'#34d399':e.status==='fail'?'#f87171':MUT}`,
              borderRadius: 6, padding: '9px 14px', marginBottom: 7, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>{E2E_IC[e.status]}</span>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 11, color: 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}>{e.flow}</p>
                {e.note && <p style={{ margin: 0, fontSize: 10, color: '#f59e0b' }}>{e.note}</p>}
              </div>
            </div>
          ))}
          <p style={{ margin: '16px 0 10px', fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Lighthouse per Page</p>
          {PERF.map(p => (
            <div key={p.page} style={{ background: D2, border: `1px solid ${p.flag?'#f8717118':B}`, borderRadius: 6,
              padding: '9px 14px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ minWidth: 80, fontSize: 12, color: '#fff' }}>{p.page}</span>
              <div style={{ flex: 1, height: 4, background: '#0d0d12', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${p.lh}%`, borderRadius: 2,
                  background: p.lh >= 85 ? '#34d399' : p.lh >= 70 ? GOLD : '#f87171' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, minWidth: 28,
                color: p.lh >= 85 ? '#34d399' : p.lh >= 70 ? GOLD : '#f87171' }}>{p.lh}</span>
              <span style={{ fontSize: 10, color: MUT, minWidth: 36 }}>FCP {p.fcp}</span>
              <span style={{ fontSize: 10, color: MUT }}>mob {p.mobile}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── PAGE ──────────────────────────────────────────────────── */

const TABS = [
  { id: 'overview', label: 'Overview'  },
  { id: 'sprint',   label: 'Sprint'    },
  { id: 'frontend', label: 'Frontend'  },
  { id: 'backend',  label: 'Backend'   },
  { id: 'devops',   label: 'DevOps'    },
  { id: 'qa',       label: 'QA'        },
]

export default function ProjectHQPage() {
  const [tab, setTab] = useState('overview')

  return (
    <div style={{ minHeight: '100vh', background: D, fontFamily: SS, color: '#fff' }}>
      {/* Top bar */}
      <div style={{ background: D2, borderBottom: `1px solid ${B}`, padding: '0 32px',
        display: 'flex', alignItems: 'stretch', gap: 0, position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ padding: '14px 24px 14px 0', borderRight: `1px solid ${B}`, marginRight: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, color: GOLD }}>⬡</span>
          <div>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD }}>El Shaddai</p>
            <p style={{ margin: 0, fontSize: 13, fontFamily: SF, color: '#fff', fontWeight: 400 }}>Project HQ</p>
          </div>
        </div>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 18px',
              color: tab === t.id ? GOLD : MUT,
              borderBottom: tab === t.id ? `2px solid ${GOLD}` : '2px solid transparent',
              fontFamily: SS, transition: 'color 0.2s' }}>
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'block' }} />
          <span style={{ fontSize: 10, color: MUT }}>Sprint 4 · Phase 1 · Jun 2026</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        {tab === 'overview' && <><PMSection /><SprintSection /></>}
        {tab === 'sprint'   && <SprintSection />}
        {tab === 'frontend' && <FrontendSection />}
        {tab === 'backend'  && <BackendSection />}
        {tab === 'devops'   && <DevOpsSection />}
        {tab === 'qa'       && <QASection />}
        {tab === 'overview' && <><FrontendSection /><BackendSection /><DevOpsSection /><QASection /></>}
      </div>
    </div>
  )
}
