import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import GlassIcons from './components/GlassIcons';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import DevicePassportPage from './pages/DevicePassportPage';
import CostInsightsPage from './pages/CostInsightsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function PublicLayout() {
  const location = useLocation();
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content"><Outlet /></main>
      {location.pathname !== '/' && <Footer />}
    </div>
  );
}

function PrivateLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: '8px' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content"><Outlet /></main>
      <Footer />
    </div>
  );
}

function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: '8px' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Header />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content"><Outlet /></div>
      </div>
      <Footer />
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, color: 'blue' },
    { path: '/devices', label: 'My Devices', icon: <DevicesIcon />, color: 'teal' },
    { path: '/insights', label: 'Cost Insights', icon: <InsightsIcon />, color: 'indigo' },
    { path: '/profile', label: 'Profile', icon: <ProfileIcon />, color: 'blue' }
  ];

  return (
    <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`} aria-label="Main navigation">
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        aria-expanded={!collapsed}
        title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        onClick={() => setCollapsed(value => !value)}
      >
        <span /><span /><span />
      </button>
      <nav className="sidebar-nav" aria-label="Dashboard sections">
        <GlassIcons
          className="sidebar-glass-nav"
          items={navItems.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return {
              label: item.label,
              icon: item.icon,
              color: item.color,
              current: active,
              className: active ? 'is-current' : '',
              onClick: () => navigate(item.path)
            };
          })}
          size={62}
          gap={12}
          columns={1}
          roundness={0.52}
          refraction={0.8}
          bevel={0.58}
          dispersion={0}
          frost={0.18}
          shine={0.82}
          tint="#dcefff"
          tintOpacity={0.16}
          iconColor="#ffffff"
          plate="tilt"
          tilt={24}
          spread={0.46}
          hover="press"
          parallax={0.65}
          labels="hover"
          intro
          theme="light"
          style={{ '--glass-icons-row-gap': '34px' }}
        />
      </nav>
    </aside>
  );
}

/* ---- SVG Icons ---- */
function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="12" y1="10" x2="12" y2="18" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Private Routes with Sidebar */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/devices/:id" element={<DevicePassportPage />} />
        <Route path="/insights" element={<CostInsightsPage />} />
        <Route path="/insights/:id" element={<CostInsightsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
