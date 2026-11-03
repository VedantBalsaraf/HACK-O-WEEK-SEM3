import React, { useState, useEffect } from 'react';
import TechPageTitle from '../components/TechPageTitle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    // In a real app, this would call an API to update profile
    setErrors({});
    if (!formData.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }
    toast.success('Profile updated successfully');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!passwordData.currentPassword) {
      setErrors({ currentPassword: 'Current password is required' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setErrors({ newPassword: 'New password must be at least 6 characters' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    // In a real app, this would call an API to change password
    toast.success('Password changed successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (e.target.form === e.currentTarget) {
      // Determine which form based on name
      if (['name', 'email'].includes(name)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      } else {
        setPasswordData(prev => ({ ...prev, [name]: value }));
      }
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="stagger-children profile-page">
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <TechPageTitle text="Profile" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage your account settings</p>
      </div>

      <div className="card card-elevated profile-card">
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border-light)' }}>
          <span className="avatar avatar-xl" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', fontSize: 'var(--text-2xl)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </span>
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>{user?.name}</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-1)' }}>
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" role="tablist" aria-label="Profile sections">
          <button
            role="tab"
            aria-selected={activeTab === 'account'}
            aria-controls="account-panel"
            id="account-tab"
            className={`tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'security'}
            aria-controls="security-panel"
            id="security-tab"
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'danger'}
            aria-controls="danger-panel"
            id="danger-tab"
            className={`tab ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
            Danger Zone
          </button>
        </div>

        {/* Tab Panels */}
        <div role="tabpanel" id="account-panel" aria-labelledby="account-tab" hidden={activeTab !== 'account'} style={{ padding: 'var(--space-6)' }}>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && <p className="form-error" role="alert">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                disabled
                aria-describedby="email-hint"
              />
              <p id="email-hint" className="form-hint">Email cannot be changed. Contact support if needed.</p>
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div role="tabpanel" id="security-panel" aria-labelledby="security-tab" hidden={activeTab !== 'security'} style={{ padding: 'var(--space-6)' }}>
          <form onSubmit={handlePasswordSubmit}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>Change Password</h3>

            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                value={passwordData.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
                aria-invalid={errors.currentPassword ? 'true' : 'false'}
              />
              {errors.currentPassword && <p className="form-error" role="alert">{errors.currentPassword}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                value={passwordData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                aria-invalid={errors.newPassword ? 'true' : 'false'}
                aria-describedby="new-password-hint"
              />
              {errors.newPassword && <p className="form-error" role="alert">{errors.newPassword}</p>}
              <p id="new-password-hint" className="form-hint">Must be at least 6 characters.</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                value={passwordData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              {errors.confirmPassword && <p className="form-error" role="alert">{errors.confirmPassword}</p>}
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        <div role="tabpanel" id="danger-panel" aria-labelledby="danger-tab" hidden={activeTab !== 'danger'} style={{ padding: 'var(--space-6)' }}>
          <div style={{ border: '1px solid var(--color-error-200)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', background: 'oklch(0.98 0.02 25)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-error-600)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Danger Zone
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Once you delete your account, there is no going back. All your devices, repair history, and data will be permanently removed.
            </p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
                  // In a real app, call delete account API
                  toast.error('Account deletion would be implemented here');
                }
              }}
            >
              Delete Account
            </button>
          </div>

          <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border-light)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ width: '100%' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
