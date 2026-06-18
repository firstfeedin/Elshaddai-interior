import { useState, useEffect } from 'react'
import DashboardShell from '../components/DashboardShell'
import { admin as adminApi, leads as leadsApi } from '../../../lib/api'

const serif  = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const sans   = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold   = '#c9a227'
const dark   = '#1c1917'
const stone  = '#57534e'
const light  = '#fafaf9'
const border = '#e7e5e4'

const STATS = [
  { label:'Total Projects', value:'142', change:'+12 this month' },
  { label:'Active Users',   value:'89',  change:'+5 this week'   },
  { label:'Open Leads',     value:'34',  change:'8 new today'    },
  { label:'Revenue (Est.)', value:'₹2.4Cr', change:'+18% vs last yr' },
]

const MOCK_USERS = [
  { name:'Priya Krishnaswamy', email:'priya@elshaddai.in', role:'DESIGNER', projects:8 },
  { name:'Ravi Mohan',         email:'ravi@elshaddai.in',  role:'BUILDER',  projects:5 },
  { name:'Anitha Selvam',      email:'anitha@firm.com',    role:'ADMIN',    projects:0 },
  { name:'Suresh Kumar',       email:'suresh@client.com',  role:'CLIENT',   projects:1 },
]

const ROLE_COLOR = {
  DESIGNER: '#8b5cf6', BUILDER: '#f59e0b', ADMIN: '#4ade80',
  CLIENT: '#60a5fa', WORKSHOP_WORKER: '#facc15', SUPER_ADMIN: '#f87171',
}

const LEADS = [
  { name:'Rajesh Kumar',  phone:'+91 98765 43210', space:'Full Home · 1800 sq ft', budget:'₹15L–20L', city:'Hyderabad', status:'NEW',       time:'5 min ago' },
  { name:'Sunita Sharma', phone:'+91 87654 32109', space:'Villa · Living + Dining', budget:'₹40L–60L', city:'Secunderabad', status:'CONTACTED', time:'2 hr ago'  },
  { name:'Arun Patel',    phone:'+91 76543 21098', space:'Office · 1500 sq ft',     budget:'₹25L–35L', city:'Mumbai',    status:'QUALIFIED', time:'1 day ago'  },
]

const LEAD_SC = { NEW:'#60a5fa', CONTACTED:gold, QUALIFIED:'#4ade80', WON:'#4ade80', LOST:'#f87171' }

export default function AdminDashboard({ user, isSuperAdmin = false }) {
  const [activeTab,  setActiveTab]  = useState('overview')
  const [mfaSetup,   setMfaSetup]   = useState(!user.mfa_enabled)
  const [leadFilter, setLeadFilter] = useState('All')
  const [liveStats,  setLiveStats]  = useState(null)
  const [liveUsers,  setLiveUsers]  = useState(null)
  const [liveLeads,  setLiveLeads]  = useState(null)

  useEffect(() => {
    adminApi.stats().then(setLiveStats).catch(()=>{})
    adminApi.users().then(setLiveUsers).catch(()=>{})
    leadsApi.list().then(d => setLiveLeads(Array.isArray(d) ? d : d?.leads ?? null)).catch(()=>{})
  }, [])

  const stats = liveStats ? [
    { label:'Total Projects', value: String(liveStats.projects ?? 0),      change: `${liveStats.projects ?? 0} total` },
    { label:'Active Users',   value: String(liveStats.users ?? 0),          change: `${liveStats.users ?? 0} registered` },
    { label:'Open Leads',     value: String(liveStats.leads ?? 0),          change: 'from database' },
    { label:'Revenue (Est.)', value: `₹${((liveStats.projects??0)*2.4).toFixed(1)}L`, change: 'estimated' },
  ] : STATS

  const displayUsers = liveUsers ?? MOCK_USERS
  const displayLeads = liveLeads ?? LEADS

  const nav = [
    { id:'overview', label:'Overview',  icon:'◎' },
    { id:'users',    label:'Users',     icon:'⬡' },
    { id:'projects', label:'Projects',  icon:'⌂' },
    { id:'leads',    label:'Leads',     icon:'◧' },
    { id:'settings', label:'Settings',  icon:'◈' },
    ...(isSuperAdmin ? [{ id:'platform', label:'Platform', icon:'⊛' }] : []),
  ]

  return (
    <DashboardShell user={user} nav={nav} activeTab={activeTab} onTabChange={setActiveTab}>

      {/* MFA Banner */}
      {mfaSetup && (
        <div style={{ ...sans, marginBottom: 20, padding: '14px 20px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <p style={{ ...sans, margin: '0 0 3px', fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>Set up Two-Factor Authentication</p>
            <p style={{ ...sans, margin: 0, fontSize: 11, color: stone, fontWeight: 300 }}>Required for Admin accounts. Scan QR code with an authenticator app.</p>
          </div>
          <button onClick={() => setMfaSetup(false)} style={{ ...sans, padding: '8px 16px', background: '#f59e0b', border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0 }}>Set Up MFA</button>
        </div>
      )}

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ ...serif, margin: 0, fontSize: 28, fontWeight: 300, color: dark }}>{isSuperAdmin ? 'Platform Overview' : 'Admin Dashboard'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, border: `1px solid ${border}` }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ padding: '20px 22px', borderRight: i < 3 ? `1px solid ${border}` : 'none', background: '#fff' }}>
                <p style={{ ...serif, margin: '0 0 4px', fontSize: 32, fontWeight: 300, color: dark }}>{s.value}</p>
                <p style={{ ...sans, margin: '0 0 3px', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a8a29e' }}>{s.label}</p>
                <p style={{ ...sans, margin: 0, fontSize: 10, color: gold, fontWeight: 300 }}>{s.change}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '22px 24px' }}>
            <p style={{ ...sans, margin: '0 0 18px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Recent Activity</p>
            {[
              { text:'New lead: Rajesh Kumar (Full Home, Hyderabad)',    time:'5 min ago' },
              { text:'Project ES-2025-0041 moved to EXECUTION',      time:'1 hr ago'  },
              { text:'Designer Priya uploaded floor plan',           time:'2 hr ago'  },
              { text:'Payment received: ₹5,25,000 (Mehta Villa)',   time:'3 hr ago'  },
              { text:'New user registered: Client role',             time:'4 hr ago'  },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 14, marginBottom: 14, borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                <div style={{ width: 5, height: 5, background: border, borderRadius: '50%', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <p style={{ ...sans, margin: '0 0 2px', fontSize: 13, color: dark, fontWeight: 300 }}>{item.text}</p>
                  <p style={{ ...sans, margin: 0, fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ ...serif, margin: 0, fontSize: 24, fontWeight: 300, color: dark }}>User Management</h2>
            <button style={{ ...sans, padding: '8px 18px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>+ Invite User</button>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: light }}>
                  {['Name','Email','Role','Projects','Status','Actions'].map(h => (
                    <th key={h} style={{ ...sans, padding: '12px 20px', textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e', borderBottom: `1px solid ${border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((u, i) => (
                  <tr key={u.email || i} style={{ borderBottom: i < displayUsers.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <td style={{ ...sans, padding: '14px 20px', fontSize: 13, fontWeight: 500, color: dark }}>{u.name}</td>
                    <td style={{ ...sans, padding: '14px 20px', fontSize: 12, color: stone, fontWeight: 300 }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}><span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ROLE_COLOR[u.role] || stone }}>{u.role.replace('_', ' ')}</span></td>
                    <td style={{ ...sans, padding: '14px 20px', fontSize: 13, color: stone, fontWeight: 300 }}>{u.projects}</td>
                    <td style={{ padding: '14px 20px' }}><span style={{ ...sans, fontSize: 9, fontWeight: 700, color: '#4ade80', letterSpacing: '0.12em' }}>ACTIVE</span></td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button style={{ ...sans, fontSize: 10, fontWeight: 600, color: gold, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}>Edit</button>
                        <button style={{ ...sans, fontSize: 10, fontWeight: 600, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}>Deactivate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Lead Management</h2>
          <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${border}`, marginBottom: 20 }}>
            {['All','New','Contacted','Qualified','Won','Lost'].map(s => (
              <button key={s} onClick={() => setLeadFilter(s)}
                style={{ ...sans, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: leadFilter === s ? dark : '#a8a29e', padding: '0 20px 14px 0', borderBottom: `2px solid ${leadFilter === s ? dark : 'transparent'}`, marginBottom: -1, transition: 'all 0.2s' }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayLeads.map(lead => (
              <div key={lead.name} style={{ background: '#fff', border: `1px solid ${border}`, padding: '18px 22px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = dark}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <p style={{ ...sans, margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: dark }}>{lead.name}</p>
                    <p style={{ ...sans, margin: '0 0 3px', fontSize: 11, color: stone, fontWeight: 300 }}>{lead.phone} · {lead.city}</p>
                    <p style={{ ...sans, margin: 0, fontSize: 11, color: '#a8a29e', fontWeight: 300 }}>{lead.space} · Budget: {lead.budget}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: LEAD_SC[lead.status] }}>{lead.status}</span>
                    <p style={{ ...sans, margin: '6px 0 0', fontSize: 10, color: '#a8a29e', fontWeight: 300 }}>{lead.time}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...sans, padding: '7px 16px', background: gold, border: 'none', color: '#000', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Call Now</button>
                  <button style={{ ...sans, padding: '7px 14px', background: 'transparent', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>WhatsApp</button>
                  <button style={{ ...sans, padding: '7px 14px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500, marginLeft: 'auto', letterSpacing: '0.1em' }}>Convert to Project →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Account Settings</h2>
          <div style={{ background: '#fff', border: `1px solid ${border}`, padding: '28px 28px', maxWidth: 520 }}>
            <p style={{ ...sans, margin: '0 0 20px', fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e' }}>Admin Preferences</p>
            {['Notification Emails','Two-Factor Authentication','API Access Keys','Audit Log Retention'].map((item, i, arr) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                <p style={{ ...sans, margin: 0, fontSize: 13, color: dark, fontWeight: 300 }}>{item}</p>
                <button style={{ ...sans, padding: '5px 12px', background: 'transparent', border: `1px solid ${border}`, color: stone, cursor: 'pointer', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Configure</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'platform' && isSuperAdmin && (
        <div>
          <h2 style={{ ...serif, margin: '0 0 20px', fontSize: 24, fontWeight: 300, color: dark }}>Platform Controls</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2 }}>
            {[
              { title:'Subscription Plans',       desc:'Manage FREE / STARTER / PRO / ENTERPRISE tiers' },
              { title:'Organisation Management',  desc:'View, approve, suspend organisations'           },
              { title:'System Health',            desc:'API latency, DB connections, Redis status'      },
              { title:'Audit Logs',               desc:'Full audit trail of all admin actions'          },
            ].map(item => (
              <div key={item.title} style={{ background: '#fff', border: `1px solid ${border}`, padding: '22px 24px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = dark}
                onMouseLeave={e => e.currentTarget.style.borderColor = border}>
                <p style={{ ...sans, margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: dark }}>{item.title}</p>
                <p style={{ ...sans, margin: 0, fontSize: 12, color: '#a8a29e', fontWeight: 300 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </DashboardShell>
  )
}
