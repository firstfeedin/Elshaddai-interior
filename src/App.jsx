import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import AuthPage        from './pages/public/AuthPage'
import ProtectedRoute  from './components/layout/ProtectedRoute'
import ChatbotAssistant from './components/layout/ChatbotAssistant'
import GlobalSearch     from './components/layout/GlobalSearch'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
})

const DashboardPage      = lazy(() => import('./pages/app/DashboardPage'))
const DesignerPage       = lazy(() => import('./pages/app/DesignerPage'))
const HomePage           = lazy(() => import('./pages/public/HomestylerClone'))
const ProjectsPage       = lazy(() => import('./pages/app/ProjectsPage'))
const RenderingPage      = lazy(() => import('./pages/app/RenderingPage'))
const CatalogPage        = lazy(() => import('./pages/app/CatalogPage'))
const PresentationPage   = lazy(() => import('./pages/app/PresentationPage'))
const AIDesignPage       = lazy(() => import('./pages/app/AIDesignPage'))
const PricingPage        = lazy(() => import('./pages/public/PricingPage'))
const PortfolioPage      = lazy(() => import('./pages/public/PortfolioPage'))
const BlogPage           = lazy(() => import('./pages/public/BlogPage'))
const CollaborationPage  = lazy(() => import('./pages/app/CollaborationPage'))
const FloorPlanAIPage    = lazy(() => import('./pages/app/FloorPlanAIPage'))
const TrackingDashboard  = lazy(() => import('./pages/app/TrackingDashboard'))
const FinancialPage      = lazy(() => import('./pages/app/FinancialPage'))
const TaskManagerPage    = lazy(() => import('./pages/app/TaskManagerPage'))
const ReportsPage        = lazy(() => import('./pages/app/ReportsPage'))
const StyleQuizPage      = lazy(() => import('./pages/app/StyleQuizPage'))
const MoodBoardPage      = lazy(() => import('./pages/app/MoodBoardPage'))
const MarketplacePage    = lazy(() => import('./pages/app/MarketplacePage'))
const AISchedulePage     = lazy(() => import('./pages/app/AISchedulePage'))
const AuditLogPage       = lazy(() => import('./pages/app/AuditLogPage'))
const VoiceDailyLogPage  = lazy(() => import('./pages/app/VoiceDailyLogPage'))
const CostEstimatorPage  = lazy(() => import('./pages/app/CostEstimatorPage'))
const MFASetupPage       = lazy(() => import('./pages/app/MFASetupPage'))
const ClientPortalPage   = lazy(() => import('./pages/app/ClientPortalPage'))
const ApprovalsPage      = lazy(() => import('./pages/app/ApprovalsPage'))
const CalendarPage       = lazy(() => import('./pages/app/CalendarPage'))
const InventoryPage      = lazy(() => import('./pages/app/InventoryPage'))
const EmployeesPage      = lazy(() => import('./pages/app/EmployeesPage'))
const SettingsPage       = lazy(() => import('./pages/app/SettingsPage'))
const NewProjectPage     = lazy(() => import('./pages/app/NewProjectPage'))
const QCChecklistPage    = lazy(() => import('./pages/app/QCChecklistPage'))
const SiteDiaryPage      = lazy(() => import('./pages/app/SiteDiaryPage'))
const PipelinePage       = lazy(() => import('./pages/app/PipelinePage'))
const DocumentsPage      = lazy(() => import('./pages/app/DocumentsPage'))
const VendorPortalPage   = lazy(() => import('./pages/app/VendorPortalPage'))
const ContractsPage      = lazy(() => import('./pages/app/ContractsPage'))
const NotificationsPage  = lazy(() => import('./pages/app/NotificationsPage'))
const TimesheetPage      = lazy(() => import('./pages/app/TimesheetPage'))
const ProjectHealthPage  = lazy(() => import('./pages/app/ProjectHealthPage'))
const MaterialSpecPage   = lazy(() => import('./pages/app/MaterialSpecPage'))
const NotFoundPage       = lazy(() => import('./pages/public/NotFoundPage'))
const StudioPage         = lazy(() => import('./pages/app/StudioPage'))
const GalleryPage        = lazy(() => import('./pages/public/GalleryPage'))
const MyDesignPage       = lazy(() => import('./pages/public/MyDesignPage'))
const AboutPage          = lazy(() => import('./pages/public/AboutPage'))
const PrivacyPage        = lazy(() => import('./pages/public/PrivacyPage'))
const TermsPage          = lazy(() => import('./pages/public/TermsPage'))

function CookieConsent() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!localStorage.getItem('es_cookie_ok')) setShow(true)
  }, [])
  if (!show) return null
  const accept = () => { localStorage.setItem('es_cookie_ok', '1'); setShow(false) }
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: '#1c1917', borderTop: '1px solid #292524',
      padding: '16px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      fontFamily: "'DM Sans',system-ui,sans-serif",
    }}>
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 680, lineHeight: 1.6 }}>
        We use cookies to enhance your experience and analyse site usage. By continuing, you agree to our{' '}
        <a href="/privacy-policy" style={{ color: '#c4956a', textDecoration: 'none' }}>Privacy Policy</a>.
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={() => setShow(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', padding: '8px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Decline</button>
        <button onClick={accept} style={{ background: '#c4956a', border: 'none', color: '#fff', padding: '8px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Accept</button>
      </div>
    </div>
  )
}

const Spinner = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9', flexDirection: 'column', gap: 14, fontFamily: "'DM Sans',sans-serif" }}>
    <div style={{ width: 36, height: 36, border: '2px solid #e7e5e4', borderTopColor: '#c4956a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <p style={{ margin: 0, fontSize: 12, color: '#a8a29e' }}>Loading…</p>
  </div>
)

function P({ children, roles }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
            <Route path="/studio"      element={<StudioPage />} />
            <Route path="/my-design"   element={<MyDesignPage />} />
            <Route path="/gallery"        element={<GalleryPage />} />
            <Route path="/about"          element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="/terms-of-service" element={<TermsPage />} />
            <Route path="/refund-policy" element={<TermsPage />} />
            <Route path="/my-projects"    element={<ProjectsPage />} />

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

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <ChatbotAssistant />
        <GlobalSearch />
        <CookieConsent />
      </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  )
}
