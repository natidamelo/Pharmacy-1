import React from 'react';
import { Link } from 'react-router-dom';

const MarketingFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mkt-footer" role="contentinfo">
      <div className="mkt-container mkt-footer__inner">

        {/* Brand */}
        <div className="mkt-footer__brand">
          <a href="#" className="mkt-footer__logo" aria-label="PharmaSys home">
            <span className="mkt-footer__logo-icon" aria-hidden="true">⬡</span>
            <span>Pharma<strong>Sys</strong></span>
          </a>
          <p className="mkt-mono mkt-footer__tagline">
            Pharmacy management software<br />
            designed for the dispensary floor.
          </p>
        </div>

        {/* Navigation columns */}
        <nav className="mkt-footer__nav" aria-label="Footer navigation">
          <div className="mkt-footer__col">
            <h3 className="mkt-footer__col-heading">Product</h3>
            <ul>
              <li><a href="#capabilities" className="mkt-footer__link">How it works</a></li>
              <li><a href="#trust" className="mkt-footer__link">Why PharmaSys</a></li>
              <li><a href="#cta" className="mkt-footer__link">Request a demo</a></li>
            </ul>
          </div>
          <div className="mkt-footer__col">
            <h3 className="mkt-footer__col-heading">Platform</h3>
            <ul>
              <li><Link to="/login" className="mkt-footer__link">Sign in</Link></li>
              <li><a href="#" className="mkt-footer__link">Documentation</a></li>
              <li><a href="#" className="mkt-footer__link">Status</a></li>
            </ul>
          </div>
          <div className="mkt-footer__col">
            <h3 className="mkt-footer__col-heading">Legal</h3>
            <ul>
              <li><a href="#" className="mkt-footer__link">Privacy policy</a></li>
              <li><a href="#" className="mkt-footer__link">Terms of service</a></li>
              <li><a href="#" className="mkt-footer__link">Data processing</a></li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="mkt-footer__bottom">
        <div className="mkt-container mkt-footer__bottom-inner">
          <p className="mkt-mono">© {year} PharmaSys. All rights reserved.</p>
          <p className="mkt-mono mkt-footer__built">
            Built for pharmacists, by pharmacists.
          </p>
        </div>
      </div>

      <style>{`
        .mkt-footer {
          background-color: var(--mkt-ink);
          border-top: 1px solid rgba(200,212,196,.1);
        }

        .mkt-footer__inner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4rem;
          padding-block: var(--mkt-space-2xl);
        }

        /* Brand */
        .mkt-footer__brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mkt-footer__logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #F7F5F0;
          font-family: var(--mkt-font-body);
          font-size: 1.0625rem;
          letter-spacing: -0.01em;
        }

        .mkt-footer__logo strong {
          font-weight: 700;
          color: var(--mkt-accent-light);
        }

        .mkt-footer__logo-icon {
          color: var(--mkt-accent-light);
          font-size: 1.2rem;
        }

        .mkt-footer__tagline {
          font-size: 0.8125rem;
          color: rgba(247,245,240,.4);
          line-height: 1.6;
          letter-spacing: 0.02em;
        }

        /* Nav grid */
        .mkt-footer__nav {
          display: flex;
          gap: 3.5rem;
        }

        .mkt-footer__col h3,
        .mkt-footer__col-heading {
          font-family: var(--mkt-font-body);
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(247,245,240,.4);
          margin-bottom: 1rem;
        }

        .mkt-footer__col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .mkt-footer__link {
          font-family: var(--mkt-font-body);
          font-size: 0.9rem;
          color: rgba(247,245,240,.65);
          text-decoration: none;
          transition: color 0.15s;
        }

        .mkt-footer__link:hover {
          color: #F7F5F0;
        }

        /* Bottom bar */
        .mkt-footer__bottom {
          border-top: 1px solid rgba(200,212,196,.08);
        }

        .mkt-footer__bottom-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-block: 1.25rem;
        }

        .mkt-footer__bottom .mkt-mono {
          font-size: 0.75rem;
          color: rgba(247,245,240,.3);
        }

        /* Responsive */
        @media (max-width: 860px) {
          .mkt-footer__inner {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .mkt-footer__nav {
            gap: 2rem;
          }
        }

        @media (max-width: 540px) {
          .mkt-footer__nav {
            flex-wrap: wrap;
            gap: 1.5rem 2.5rem;
          }
          .mkt-footer__bottom-inner {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default MarketingFooter;
