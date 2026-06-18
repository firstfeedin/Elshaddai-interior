import { useAuth } from '../lib/AuthContext'
import ClientDashboard   from './dashboards/ClientDashboard'
import DesignerDashboard from './dashboards/DesignerDashboard'
import AdminDashboard    from './dashboards/AdminDashboard'
import BuilderDashboard  from './dashboards/BuilderDashboard'
import WorkerDashboard   from './dashboards/WorkerDashboard'

const sans = { fontFamily:"'DM Sans',system-ui,sans-serif" }
const gold = '#c9a227'

function Spinner() {
  return (
    <div style={{ height:'100vh', background:'#1c1917', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14 }}>
      <div style={{ width:36, height:36, border:'2.5px solid rgba(201,162,39,0.25)', borderTopColor:gold, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ ...sans, fontSize:12, color:'#57534e', margin:0 }}>Loading dashboard…</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) return <Spinner />
  if (!user)   { window.location.href = '/login'; return null }

  const ROLE_MAP = {
    CLIENT:          <ClientDashboard   user={user} />,
    DESIGNER:        <DesignerDashboard user={user} />,
    BUILDER:         <BuilderDashboard  user={user} />,
    WORKSHOP_WORKER: <WorkerDashboard   user={user} />,
    ADMIN:           <AdminDashboard    user={user} />,
    SUPER_ADMIN:     <AdminDashboard    user={user} isSuperAdmin />,
  }

  return ROLE_MAP[user.role] || <ClientDashboard user={user} />
}
