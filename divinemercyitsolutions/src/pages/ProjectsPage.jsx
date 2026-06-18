import AppShell from '../components/AppShell'
import { useState, useEffect } from 'react'
import { projects as projectsApi } from '../lib/api'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const STATUS_DOT = { 'Draft':'#a8a29e', 'In Progress':gold, 'Complete':'#4ade80' }

const PROJECTS = [
  { id:1, name:'Sharma Residence — Living Room',  type:'Living Room',  status:'In Progress', date:'2 days ago',   area:320, renders:3, shared:true,  img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=70' },
  { id:2, name:'Gupta Kitchen Remodel',           type:'Kitchen',      status:'Complete',    date:'1 week ago',   area:180, renders:5, shared:true,  img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=70' },
  { id:3, name:'Master Bedroom Suite',            type:'Bedroom',      status:'Draft',       date:'3 days ago',   area:240, renders:0, shared:false, img:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=70' },
  { id:4, name:'Corner Office Setup',             type:'Office',       status:'In Progress', date:'5 days ago',   area:150, renders:1, shared:false, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=400&q=70' },
  { id:5, name:'Modern Bathroom Design',          type:'Bathroom',     status:'Complete',    date:'2 weeks ago',  area:95,  renders:4, shared:true,  img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=70' },
  { id:6, name:'Luxury Dining Room',              type:'Dining Room',  status:'Draft',       date:'1 day ago',    area:200, renders:0, shared:false, img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=70' },
  { id:7, name:'Cafe Interior — Commercial',      type:'Commercial',   status:'In Progress', date:'4 days ago',   area:800, renders:2, shared:true,  img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=70' },
  { id:8, name:'Home Office + Library',           type:'Office',       status:'Complete',    date:'3 weeks ago',  area:130, renders:7, shared:false, img:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=70' },
]

const ACTIVITY = [
  { time:'2h ago',  text:'Gupta Kitchen render completed'          },
  { time:'5h ago',  text:'Sharma Residence shared with client'     },
  { time:'1d ago',  text:'Bathroom Design marked Complete'         },
  { time:'2d ago',  text:'New project: Corner Office Setup'        },
  { time:'3d ago',  text:'Cafe Interior — 3D model updated'        },
]

const TABS = ['All','Living Room','Kitchen','Bedroom','Office','Commercial']

function ProjectCard({ p }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: '#fff', border: `1px solid ${hov ? dark : border}`, transition: 'border-color 0.2s', cursor: 'pointer' }}>
      <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
        <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
        {p.renders > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(20,15,10,0.72)', color: '#fff', fontSize: 10, padding: '3px 8px', ...sans, fontWeight: 500 }}>{p.renders} renders</div>
        )}
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT[p.status] || '#a8a29e', flexShrink: 0 }} />
          <span style={{ ...sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a8a29e' }}>{p.status}</span>
          {p.shared && <span style={{ ...sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a8a29e', marginLeft: 'auto' }}>Shared</span>}
        </div>
        <h3 style={{ ...serif, margin: '0 0 6px', fontSize: 16, fontWeight: 400, color: dark, lineHeight: 1.3 }}>{p.name}</h3>
        <p style={{ ...sans, margin: '0 0 14px', fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>
          {[p.client, p.city, p.area ? `${p.area} sq ft` : null, `edited ${p.date}`].filter(Boolean).join(' · ')}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); window.location.href = '/designer' }}
            style={{ ...sans, flex: 1, padding: '8px', background: dark, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Open
          </button>
          <button onClick={e => e.stopPropagation()}
            style={{ ...sans, padding: '8px 14px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>
            Share
          </button>
        </div>
      </div>
    </div>
  )
}

// Status label mapping between API values and display
const STATUS_LABEL = {
  INQUIRY:'Inquiry', QUOTATION:'Quotation', CONCEPT:'Concept',
  DESIGN:'In Progress', PROCUREMENT:'In Progress', EXECUTION:'In Progress',
  HANDOVER:'In Progress', COMPLETED:'Complete', ON_HOLD:'Draft', CANCELLED:'Draft',
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)
  const [apiProjects, setApiProjects] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    projectsApi.list()
      .then(data => setApiProjects(Array.isArray(data) ? data : data?.projects ?? []))
      .catch(() => setApiProjects(null))
  }, [])

  const ROOM_IMGS = [
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=70',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=70',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=70',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=70',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=70',
  ]

  // Use API data if available, otherwise fall back to mock
  const source = apiProjects !== null
    ? apiProjects.map((p, i) => ({
        id: p.id,
        name: p.name,
        type: p.notes?.match(/Scope:\s*([^|]+)/)?.[1]?.trim() || 'Project',
        status: STATUS_LABEL[p.status] || p.status || 'Draft',
        date: p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-IN') : '—',
        area: p.total_area_sqft || 0,
        budget: p.budget,
        city: p.city || '',
        client: p.client_name || '',
        renders: 0,
        shared: false,
        img: ROOM_IMGS[i % ROOM_IMGS.length],
      }))
    : PROJECTS

  const filtered = source.filter(p =>
    (filter === 'All' || p.type === filter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: 'Total Projects', value: source.length },
    { label: 'In Progress',    value: source.filter(p => p.status === 'In Progress').length },
    { label: 'Completed',      value: source.filter(p => p.status === 'Complete').length },
    { label: 'Shared',         value: source.filter(p => p.shared).length },
  ]

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await projectsApi.create({ name: newName.trim(), property_type: 'APARTMENT' })
      const data = await projectsApi.list()
      setApiProjects(data.data || [])
      setNewName(''); setCreating(false)
    } catch (err) {
      alert('Could not create project: ' + err.message)
    }
  }

  return (
    <AppShell title="Projects">
      <div style={{ ...sans, padding: '32px 36px' }}>

        {/* API status banner */}
        {apiProjects !== null && (
          <div style={{ ...sans, marginBottom: 16, padding: '10px 16px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#4ade80', fontWeight: 300 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>LIVE</span>
            <span style={{ color: '#57534e' }}>Connected to database — {apiProjects.length} project{apiProjects.length !== 1 ? 's' : ''} loaded</span>
          </div>
        )}

        {/* New project modal */}
        {creating && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,15,10,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => { if (e.target === e.currentTarget) setCreating(false) }}>
            <div style={{ background: '#fff', padding: '36px 40px', width: 420, border: '1px solid #e7e5e4' }}>
              <p style={{ ...sans, margin: '0 0 24px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>New Project</p>
              <h2 style={{ ...serif, margin: '0 0 24px', fontSize: 26, fontWeight: 300, color: dark }}>Name your project</h2>
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
                placeholder="e.g. Sharma Residence — Living Room"
                style={{ width: '100%', padding: '12px 0', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${dark}`, fontSize: 14, color: dark, outline: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 300, marginBottom: 28, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCreate}
                  style={{ ...sans, flex: 1, padding: '12px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  Create Project
                </button>
                <button onClick={() => setCreating(false)}
                  style={{ ...sans, padding: '12px 18px', background: 'transparent', border: `1px solid #e7e5e4`, color: '#57534e', cursor: 'pointer', fontSize: 10, fontWeight: 500 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, border: `1px solid ${border}`, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ padding: '20px 24px', borderRight: i < 3 ? `1px solid ${border}` : 'none', background: '#fff' }}>
              <p style={{ ...serif, margin: '0 0 4px', fontSize: 36, fontWeight: 300, color: dark }}>{s.value}</p>
              <p style={{ ...sans, margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Main area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${border}` }}>
              <div style={{ position: 'relative' }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
                  placeholder="Search projects..."
                  style={{ width: 200, padding: '8px 10px 8px 30px', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${searchFocus ? dark : border}`, fontSize: 12, color: dark, outline: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 300, transition: 'border-color 0.2s' }} />
                <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#a8a29e' }}>⌕</span>
              </div>
              <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${border}`, flex: 1 }}>
                {TABS.map(t => (
                  <button key={t} onClick={() => setFilter(t)} style={{ ...sans, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: filter === t ? dark : '#a8a29e', padding: '0 16px 12px 0', borderBottom: `2px solid ${filter === t ? dark : 'transparent'}`, marginBottom: -1, transition: 'all 0.2s' }}>{t}</button>
                ))}
              </div>
              <button onClick={() => window.location.href = '/new-project'}
                style={{ ...sans, padding: '9px 18px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                + New Project
              </button>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 2 }}>
              {filtered.map(p => <ProjectCard key={p.id} p={p} />)}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '80px 0', textAlign: 'center' }}>
                  <p style={{ ...serif, fontSize: 22, fontWeight: 300, color: stone }}>No projects found</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Activity */}
            <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '20px 22px' }}>
              <p style={{ ...sans, margin: '0 0 16px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Recent Activity</p>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${border}` : 'none' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: border, flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <p style={{ ...sans, margin: '0 0 2px', fontSize: 12, color: dark, fontWeight: 300 }}>{a.text}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Storage */}
            <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '20px 22px' }}>
              <p style={{ ...sans, margin: '0 0 16px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Storage &amp; Usage</p>
              {[{ label: 'Cloud Storage', used: 2.4, total: 10, unit: 'GB' }, { label: 'Renders This Month', used: 12, total: 50, unit: '' }].map(s => (
                <div key={s.label} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ ...sans, fontSize: 11, color: stone, fontWeight: 300 }}>{s.label}</span>
                    <span style={{ ...sans, fontSize: 11, color: dark, fontWeight: 500 }}>{s.used}{s.unit} / {s.total}{s.unit}</span>
                  </div>
                  <div style={{ height: 3, background: border, overflow: 'hidden' }}>
                    <div style={{ width: `${(s.used / s.total) * 100}%`, height: '100%', background: gold }} />
                  </div>
                </div>
              ))}
              <button onClick={() => window.location.href = '/render'}
                style={{ ...sans, width: '100%', padding: '9px', background: 'transparent', border: `1px solid ${dark}`, color: dark, cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
                Open Render Studio →
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
