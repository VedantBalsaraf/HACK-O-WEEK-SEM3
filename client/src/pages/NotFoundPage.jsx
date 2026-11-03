import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8) var(--space-4)' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ 
          fontSize: '12rem', 
          fontWeight: 700, 
          fontFamily: 'var(--font-display)', 
          color: 'var(--color-neutral-200)',
          lineHeight: 1,
          marginBottom: 'var(--space-4)'
        }}>
          404
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>Page Not Found</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', lineHeight: 'var(--leading-relaxed)' }}>
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12" />
            </svg>
            Go Home
          </Link>
          <Link to="/devices" className="btn btn-secondary">
            My Devices
          </Link>
        </div>
      </div>
    </div>
  );
}