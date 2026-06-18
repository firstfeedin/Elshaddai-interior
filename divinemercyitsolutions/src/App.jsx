import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './lib/AuthContext'
import AuthPage        from './pages/AuthPage'
import ProtectedRoute  from './components/ProtectedRoute'
import ChatbotAssistant from './components/ChatbotAssistant'
import GlobalSearch     from './components/GlobalSearch'

const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const DesignerPage       = lazy(() => import('./pages/DesignerPage'))
const HomePage           = lazy(() => import('./pages/HomestylerClone'))
const ProjectsPage       = lazy(() => import('./pages/ProjectsPage'))
const RenderingPage      = lazy(() => import('./pages/RenderingPage'))
const CatalogPage        = lazy(() => import('./pages/CatalogPage'))
const PresentationPage   = lazy(() => import('./pages/PresentationPage'))
const AIDesignPage       = lazy(() => import('./pages/AIDesignPage'))
const PricingPage        = lazy(() => import('./pages/PricingPage'))
const PortfolioPage      = lazy(() => import('./pages/PortfolioPage'))
const BlogPage           = lazy(() => import('./pages/BlogPage'))
const CollaborationPage  = lazy(() => import('./pages/CollaborationPage'))
const FloorPlanAIPage    = lazy(() => import('./pages/FloorPlanAIPage'))
const TrackingDashboard  = lazy(() => import('./pages/TrackingDashboard'))
const FinancialPage      = lazy(() => import('./pages/FinancialPage'))
const TaskManagerPage    = lazy(() => import('./pages/TaskManagerPage'))
const ReportsPage        = lazy(() => import('./pages/ReportsPage'))
const StyleQuizPage      = lazy(() => import('./pages/StyleQuizPage'))
const MoodBoardPage      = lazy(() => import('./pages/MoodBoardPage'))
const MarketplacePage    = lazy(() => import('./pages/MarketplacePage'))
const AISchedulePage     = lazy(() => import('./pages/AISchedulePage'))
const AuditLogPage       = lazy(() => import('./pages/AuditLogPage'))
const VoiceDailyLogPage  = lazy(() => import('./pages/VoiceDailyLogPage'))
const CostEstimatorPage  = lazy(() => import('./pages/CostEstimatorPage'))
const MFASetupPage       = lazy(() => import('./pages/MFASetupPage'))
const ClientPortalPage   = lazy(() => import('./pages/ClientPortalPage'))
const ApprovalsPage      = lazy(() => import('./pages/ApprovalsPage'))
const CalendarPage       = lazy(() => import('./pages/CalendarPage'))
const InventoryPage      = lazy(() => import('./pages/InventoryPage'))
const EmployeesPage      = lazy(() => import('./pages/EmployeesPage'))
const SettingsPage       = lazy(() => import('./pages/SettingsPage'))
const NewProjectPage     = lazy(() => import('./pages/NewProjectPage'))
const QCChecklistPage    = lazy(() => import('./pages/QCChecklistPage'))
const SiteDiaryPage      = lazy(() => import('./pages/SiteDiaryPage'))
const PipelinePage       = lazy(() => import('./pages/PipelinePage'))
const DocumentsPage      = lazy(() => import('./pages/DocumentsPage'))
const VendorPortalPage   = lazy(() => import('./pages/VendorPortalPage'))
const ContractsPage      = lazy(() => import('./pages/ContractsPage'))
const NotificationsPage  = lazy(() => import('./pages/NotificationsPage'))
const TimesheetPage      = lazy(() => import('./pages/TimesheetPage'))
const ProjectHealthPage  = lazy(() => import('./pages/ProjectHealthPage'))
const MaterialSpecPage   = lazy(() => import('./pages/MaterialSpecPage'))

const Spinner = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9', flexDirection: 'column', gap: 14, fontFamily: "'DM Sans',sans-serif" }}>
    <div style={{ width: 36, height: 36, border: '2px solid #e7e5e4', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <p style={{ margin: 0, fontSize: 12, color: '#a8a29e' }}>Loading…</p>
  </div>
)

function P({ children, roles }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/"            element={<HomePage />} />
            <Route path="/login"       element={<AuthPage />} />
            <Route path="/register"    element={<AuthPage />} />
            <Route path="/pricing"     element={<PricingPage />} />
            <Route path="/portfolio"   element={<PortfolioPage />} />
            <Route path="/blog"        element={<BlogPage />} />

            {/* ── Protected — all authenticated users ── */}
            <Route path="/dashboard"        element={<P><DashboardPage /></P>} />
            <Route path="/designer"         element={<P><DesignerPage /></P>} />
            <Route path="/projects"         element={<P><ProjectsPage /></P>} />
            <Route path="/render"           element={<P><RenderingPage /></P>} />
            <Route path="/catalog"          element={<P><CatalogPage /></P>} />
            <Route path="/present"          element={<P><PresentationPage /></P>} />
            <Route path="/ai-design"        element={<P><AIDesignPage /></P>} />
            <Route path="/collaborate/:id"  element={<P><CollaborationPage /></P>} />
            <Route path="/collaborate"      element={<P><CollaborationPage /></P>} />
            <Route path="/floor-plan-ai"    element={<P><FloorPlanAIPage /></P>} />
            <Route path="/tracking"         element={<P><TrackingDashboard /></P>} />
            <Route path="/financial"        element={<P><FinancialPage /></P>} />
            <Route path="/tasks"            element={<P><TaskManagerPage /></P>} />
            <Route path="/reports"          element={<P><ReportsPage /></P>} />
            <Route path="/style-quiz"       element={<P><StyleQuizPage /></P>} />
            <Route path="/mood-board"       element={<P><MoodBoardPage /></P>} />
            <Route path="/marketplace"      element={<P><MarketplacePage /></P>} />
            <Route path="/schedule-builder" element={<P><AISchedulePage /></P>} />
            <Route path="/voice-log"        element={<P><VoiceDailyLogPage /></P>} />
            <Route path="/cost-estimator"   element={<P><CostEstimatorPage /></P>} />
            <Route path="/mfa-setup"        element={<P><MFASetupPage /></P>} />
            <Route path="/client-portal"    element={<P><ClientPortalPage /></P>} />
            <Route path="/approvals"        element={<P><ApprovalsPage /></P>} />
            <Route path="/calendar"         element={<P><CalendarPage /></P>} />
            <Route path="/inventory"        element={<P><InventoryPage /></P>} />
            <Route path="/employees"        element={<P><EmployeesPage /></P>} />
            <Route path="/settings"         element={<P><SettingsPage /></P>} />
            <Route path="/new-project"      element={<P><NewProjectPage /></P>} />
            <Route path="/qc-checklist"     element={<P><QCChecklistPage /></P>} />
            <Route path="/site-diary"       element={<P><SiteDiaryPage /></P>} />
            <Route path="/pipeline"         element={<P><PipelinePage /></P>} />
            <Route path="/documents"        element={<P><DocumentsPage /></P>} />
            <Route path="/vendor-portal"    element={<P><VendorPortalPage /></P>} />
            <Route path="/contracts"        element={<P><ContractsPage /></P>} />
            <Route path="/notifications"    element={<P><NotificationsPage /></P>} />
            <Route path="/timesheet"        element={<P><TimesheetPage /></P>} />
            <Route path="/project-health"   element={<P><ProjectHealthPage /></P>} />
            <Route path="/material-spec"    element={<P><MaterialSpecPage /></P>} />

            {/* ── Admin only ── */}
            <Route path="/audit-log" element={<P roles={['ADMIN','SUPER_ADMIN']}><AuditLogPage /></P>} />
          </Routes>
        </Suspense>
        <ChatbotAssistant />
        <GlobalSearch />
      </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  )
}
