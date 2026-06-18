import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const gold = '#c9a227'

function Spinner() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, background: '#fafaf9' }}>
      <div style={{ width: 36, height: 36, border: `2px solid #e7e5e4`, borderTopColor: gold, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ ...sans, fontSize: 12, color: '#a8a29e', margin: 0 }}>Checking session…</p>
    </div>
  )
}

export default function ProtectedRoute({ children, roles }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/dashboard" replace />

  return children
}
