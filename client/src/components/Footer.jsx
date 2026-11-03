import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'Changelog', href: '#changelog' }
    ],
    company: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' }
    ],
    legal: [
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' },
      { label: 'Security', href: '#security' },
      { label: 'Cookies', href: '#cookies' }
    ]
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-grid container">
        <div className="footer-brand">
          <Link to="/" className="footer-brand-link" aria-label="FixLedger Home">
            <span className="header-brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            FixLedger
          </Link>
          <p className="footer-brand-text">
            Your device's digital repair passport. Track history, analyze costs, and make smarter repair decisions.
          </p>
        </div>

        <div className="footer-section">
          <h4>Product</h4>
          <nav className="footer-links" aria-label="Product links">
            {footerLinks.product.map(link => (
              <a key={link.href} href={link.href} className="footer-link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <nav className="footer-links" aria-label="Company links">
            {footerLinks.company.map(link => (
              <a key={link.href} href={link.href} className="footer-link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <nav className="footer-links" aria-label="Legal links">
            {footerLinks.legal.map(link => (
              <a key={link.href} href={link.href} className="footer-link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-bottom container">
        <p className="footer-copyright">
          &copy; {currentYear} FixLedger. All rights reserved.
        </p>
        <div className="footer-social" aria-label="Social media">
          <a href="#" className="social-link" aria-label="Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
            </svg>
          </a>
          <a href="#" className="social-link" aria-label="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="#" className="social-link" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}