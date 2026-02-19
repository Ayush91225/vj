import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NewProjectPage } from './components/pages/NewProjectPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { DeploymentsPage } from './components/pages/DeploymentsPage';
import { ComingSoon } from './components/pages/ComingSoon';
import { VajraInfPage } from './components/pages/VajraInfPage';
import { AuthPage } from './components/pages/AuthPage';
import ProductionDeployment from './components/pages/ProductionDeployment';
import { useResponsive } from './hooks/useResponsive';
import { useUIStore, useAuthStore } from './store';
import { backendApi } from './services/backendApi';
import { SIDEBAR_WIDE, SIDEBAR_SLIM, PAGE_META } from './constants';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useResponsive();
  const { validateAuth, logout } = useAuthStore();

  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    devOpen,
    searchQuery,
    setSidebarCollapsed,
    setMobileOpen,
    setDevOpen,
    setSearchQuery
  } = useUIStore();

  const slim = !isMobile && sidebarCollapsed;
  const sidebarWidth = slim ? SIDEBAR_SLIM : SIDEBAR_WIDE;
  const activePage = location.pathname.split('/')[1] || 'project';

  const handleMobileReposOpen = () => {
    const event = new CustomEvent('openMobileRepos');
    window.dispatchEvent(event);
  };

  // Validate auth on mount and route changes
  useEffect(() => {
    const isValid = validateAuth();
    if (!isValid) {
      navigate('/auth', { replace: true });
    }
  }, [location.pathname, validateAuth, navigate]);

  // Check if user is authenticated
  if (!backendApi.isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="app">
      <Sidebar
        slim={slim}
        isMobile={isMobile}
        mobileOpen={sidebarMobileOpen}
        setMobileOpen={setMobileOpen}
        setCollapsed={setSidebarCollapsed}
        activePage={activePage}
        setActivePage={(page) => navigate(`/${page}`)}
        devOpen={devOpen}
        setDevOpen={setDevOpen}
      />

      <div className="main-content" style={{ marginLeft: isMobile ? 0 : sidebarWidth }}>
        <Header
          activePage={activePage}
          isMobile={isMobile}
          setMobileOpen={setMobileOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMobileReposOpen={handleMobileReposOpen}
        />

        <div className="page-body">
          <Routes>
            <Route path="/" element={<Navigate to="/project" replace />} />
            <Route path="/project" element={<ProjectsPage searchQuery={searchQuery} />} />
            <Route path="/add" element={<NewProjectPage />} />
            <Route path="/home" element={<Navigate to="/project" replace />} />
            <Route path="/deploy" element={<DeploymentsPage searchQuery={searchQuery} />} />
            <Route path="/deploy/:projectId" element={<ProductionDeployment />} />
            <Route path="/vision" element={<Navigate to="/deploy" replace />} />
            <Route path="/stt" element={<ComingSoon label={PAGE_META.stt?.title || ""} />} />
            <Route path="/trans" element={<ComingSoon label={PAGE_META.trans?.title || ""} />} />
            <Route path="/agents" element={<ComingSoon label={PAGE_META.agents?.title || ""} />} />
            <Route path="/video" element={<ComingSoon label={PAGE_META.video?.title || ""} />} />
            <Route path="/api" element={<ComingSoon label={PAGE_META.api?.title || ""} />} />
            <Route path="/usage" element={<ComingSoon label={PAGE_META.usage?.title || ""} />} />
            <Route path="/pricing" element={<ComingSoon label={PAGE_META.pricing?.title || ""} />} />
            <Route path="/docs" element={<ComingSoon label={PAGE_META.docs?.title || ""} />} />
            <Route path="/vajrainf" element={<VajraInfPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthPage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
