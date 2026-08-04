import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MarketingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'How it works', href: '#capabilities' },
    { label: 'Why PharmaSys', href: '#trust' },
    { label: 'Contact', href: '#cta' },
  ];

  return (
    <header
      className={`mkt-nav ${scrolled ? 'mkt-nav--scrolled' : ''}`}
      role="banner"
    >
      <div className="mkt-container mkt-nav__inner">
        {/* Logo */}
        <a href="#" className="mkt-nav__logo" aria-label="PharmaSys home">
          <span className="mkt-nav__logo-icon" aria-hidden="true">⬡</span>
          <span className="mkt-nav__logo-text">Pharma<strong>Sys</strong></span>
        </a>

        {/* Desktop nav */}
        <nav className="mkt-nav__links" aria-label="Primary navigation">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="mkt-nav__link">
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="mkt-nav__actions">
          <Link to="/login" className="mkt-btn mkt-btn-ghost mkt-nav__cta-ghost">
            Sign in
          </Link>
          <a href="#cta" className="mkt-btn mkt-btn-primary mkt-nav__cta">
            Request a demo
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mkt-nav__hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mkt-mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`mkt-nav__hamburger-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`mkt-nav__hamburger-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`mkt-nav__hamburger-bar ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mkt-mobile-menu"
        className={`mkt-nav__mobile ${menuOpen ? 'mkt-nav__mobile--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className="mkt-container mkt-nav__mobile-links" aria-label="Mobile navigation">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="mkt-nav__mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="mkt-nav__mobile-actions">
            <Link
              to="/login"
              className="mkt-btn mkt-btn-ghost"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
            <a
              href="#cta"
              className="mkt-btn mkt-btn-primary"
              onClick={() => setMenuOpen(false)}
            >
              Request a demo
            </a>
          </div>
        </nav>
      </div>

      <style>{`
        .mkt-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: background-color 0.3s var(--mkt-ease-in-out),
                      box-shadow 0.3s var(--mkt-ease-in-out),
                      backdrop-filter 0.3s;
        }

        .mkt-nav--scrolled {
          background-color: rgba(247,245,240,0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 var(--mkt-border-light), 0 4px 16px rgba(22,33,29,.06);
        }

        .mkt-nav__inner {
          display: flex;
          align-items: center;
          gap: 2rem;
          height: 68px;
        }

        .mkt-nav__logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--mkt-ink);
          flex-shrink: 0;
        }

        .mkt-nav__logo-icon {
          font-size: 1.25rem;
          color: var(--mkt-primary);
          line-height: 1;
        }

        .mkt-nav__logo-text {
          font-family: var(--mkt-font-body);
          font-size: 1.0625rem;
          letter-spacing: -0.01em;
          color: var(--mkt-ink);
        }

        .mkt-nav__logo-text strong {
          font-weight: 700;
          color: var(--mkt-primary);
        }

        .mkt-nav__links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-left: auto;
        }

        .mkt-nav__link {
          font-size: 0.9rem;
          color: var(--mkt-ink-muted);
          text-decoration: none;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          transition: color 0.15s, background-color 0.15s;
        }

        .mkt-nav__link:hover {
          color: var(--mkt-ink);
          background-color: rgba(27,75,67,.06);
        }

        .mkt-nav__actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .mkt-nav__cta-ghost {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .mkt-nav__cta {
          padding: 0.5rem 1.125rem;
          font-size: 0.875rem;
        }

        .mkt-nav__hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          margin-left: auto;
        }

        .mkt-nav__hamburger-bar {
          display: block;
          width: 22px;
          height: 2px;
          background-color: var(--mkt-ink);
          border-radius: 2px;
          transition: transform 0.25s var(--mkt-ease-out), opacity 0.2s;
        }

        .mkt-nav__mobile {
          display: none;
          overflow: hidden;
          max-height: 0;
          background-color: rgba(247,245,240,0.97);
          backdrop-filter: blur(12px);
          transition: max-height 0.35s var(--mkt-ease-out);
          border-top: 1px solid var(--mkt-border-light);
        }

        .mkt-nav__mobile--open {
          max-height: 400px;
        }

        .mkt-nav__mobile-links {
          display: flex;
          flex-direction: column;
          padding-block: 1rem;
          gap: 0.25rem;
        }

        .mkt-nav__mobile-link {
          display: block;
          padding: 0.75rem 0;
          font-size: 1rem;
          color: var(--mkt-ink-muted);
          text-decoration: none;
          border-bottom: 1px solid var(--mkt-border-light);
        }

        .mkt-nav__mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1.25rem;
        }

        @media (max-width: 860px) {
          .mkt-nav__links,
          .mkt-nav__actions {
            display: none;
          }
          .mkt-nav__hamburger {
            display: flex;
          }
          .mkt-nav__mobile {
            display: block;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mkt-nav,
          .mkt-nav__mobile,
          .mkt-nav__link,
          .mkt-nav__hamburger-bar { transition: none; }
        }
      `}</style>
    </header>
  );
};

export default MarketingNav;
