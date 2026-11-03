import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GooeyNav from './GooeyNav';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setAvatarOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/devices', label: 'My Devices' },
    { path: '/insights', label: 'Cost Insights' },
    { path: '/profile', label: 'Profile' }
  ];
  const publicNavItems = [
    { path: '/', label: 'Home' },
    { path: '/login', label: 'Login' },
    { path: '/signup', label: 'Sign Up' }
  ];
  const visibleNavItems = isAuthenticated ? navItems : publicNavItems;
  const activeNavIndex = visibleNavItems.findIndex(item =>
    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  );
  const gooeyNavItems = visibleNavItems.map(item => ({
    label: item.label,
    onClick: () => navigate(item.path)
  }));

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} role="banner">
      <div className="header-inner container">
        <Link to="/" className="header-brand" aria-label="FixLedger Home">
          <span className="header-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          FixLedger
        </Link>

        <div className="header-nav">
          <GooeyNav
            items={gooeyNavItems}
            initialActiveIndex={Math.max(0, activeNavIndex)}
            activeIndex={Math.max(0, activeNavIndex)}
            theme="light"
            color="#2588ce"
            activeTextColor="#ffffff"
            colors={["#73c5f3", "#2588ce", "#4c83d3"]}
            size="sm"
            frame
            particleCount={12}
            spread={44}
            animationTime={560}
            timeVariance={180}
            gooeyness={0.58}
            wobble={0.38}
            hoverEffect
            className="fixledger-gooey-nav"
            style={{
              '--gn-frame': 'rgba(231, 244, 254, 0.94)',
              '--gn-frame-edge': '#d7e8f5',
              '--gn-frame-highlight': 'rgba(255,255,255,.98)',
              '--gn-frame-shadow': '0 8px 22px rgba(33,84,124,.09)',
              '--gn-ink': '#153b5b',
              '--gn-muted': 'rgba(23,52,77,.72)'
            }}
          />
        </div>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className={`dropdown${avatarOpen ? ' open' : ''}`}>
              <button
                className="btn btn-ghost"
                onClick={() => { setAvatarOpen(!avatarOpen); setMobileMenuOpen(false); }}
                aria-expanded={avatarOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <span className="avatar avatar-sm">{user?.name?.[0]?.toUpperCase()}</span>
              </button>
              {avatarOpen && (
                <div className="dropdown-menu" role="menu">
                  <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setAvatarOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" role="menuitem" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-header-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button
            className="mobile-menu-btn"
            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setAvatarOpen(false); }}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <line x1="18" y1="6" x2="6" y2="18" />
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Mobile Menu */}
      <aside
        id="mobile-menu"
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {isAuthenticated ? (
          navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))
        ) : (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/signup" className="btn btn-primary btn-lg mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
          </>
        )}
        {isAuthenticated && (
          <button className="btn btn-danger mobile-nav-link" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        )}
      </aside>
    </header>
  );
}
