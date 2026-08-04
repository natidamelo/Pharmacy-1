import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CtaSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // In production, wire to your backend
    setSubmitted(true);
  };

  return (
    <section
      className="mkt-section mkt-cta"
      id="cta"
      aria-labelledby="cta-heading"
    >
      {/* Background pattern */}
      <div className="mkt-cta__bg" aria-hidden="true">
        <div className="mkt-cta__bg-dots" />
      </div>

      <div className="mkt-container mkt-cta__inner">

        {/* Copy */}
        <div className="mkt-cta__copy">
          <p className="mkt-eyebrow mkt-eyebrow--light">Get started</p>
          <h2 className="mkt-display mkt-cta__heading" id="cta-heading">
            Your pharmacy deserves<br />
            software that keeps up.
          </h2>
          <p className="mkt-cta__sub">
            Book a 30-minute walkthrough with a pharmacist who uses PharmaSys
            daily — not a sales rep. We'll show you live data from your
            workflow, not slides.
          </p>

          {/* Email capture form */}
          {submitted ? (
            <div className="mkt-cta__success" role="status" aria-live="polite">
              <span className="mkt-cta__success-icon" aria-hidden="true">✓</span>
              <div>
                <strong>We'll be in touch.</strong>
                <p className="mkt-mono">Usually within one business day.</p>
              </div>
            </div>
          ) : (
            <form className="mkt-cta__form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="cta-email" className="mkt-cta__label">
                Your work email
              </label>
              <div className="mkt-cta__fieldrow">
                <input
                  id="cta-email"
                  type="email"
                  className="mkt-cta__input"
                  placeholder="pharmacist@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <button type="submit" className="mkt-btn mkt-btn-primary mkt-cta__submit">
                  Request demo
                </button>
              </div>
              <p className="mkt-mono mkt-cta__note">
                No credit card. No commitment. Cancel any time.
              </p>
            </form>
          )}

          {/* OR divider + direct login link */}
          <div className="mkt-cta__divider-row" aria-hidden="true">
            <span className="mkt-cta__divider-line" />
            <span className="mkt-mono mkt-cta__divider-text">or</span>
            <span className="mkt-cta__divider-line" />
          </div>

          <p className="mkt-cta__existing">
            Already have an account?{' '}
            <Link to="/login" className="mkt-cta__login-link">
              Sign in →
            </Link>
          </p>
        </div>

        {/* Mini feature callouts */}
        <aside className="mkt-cta__aside" aria-label="Quick features">
          {[
            { icon: '⚡', title: 'Setup in one day', body: 'Import your existing drug catalogue and patient records. We migrate the data for you.' },
            { icon: '👩‍⚕️', title: 'Onboarding with a pharmacist', body: 'A licensed pharmacist walks your team through the critical workflows, not a generic tutorial.' },
            { icon: '📞', title: 'Direct support line', body: 'Reach a pharmacist — not a tier-1 helpdesk — when something goes wrong on a busy shift.' },
          ].map((item) => (
            <div key={item.title} className="mkt-cta__callout">
              <span className="mkt-cta__callout-icon" aria-hidden="true">{item.icon}</span>
              <div>
                <h3 className="mkt-cta__callout-title">{item.title}</h3>
                <p className="mkt-cta__callout-body">{item.body}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>

      <style>{`
        .mkt-cta {
          background-color: var(--mkt-primary-dark);
          position: relative;
          overflow: hidden;
        }

        /* Background pattern */
        .mkt-cta__bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .mkt-cta__bg-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(247,245,240,.08) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* Inner layout */
        .mkt-cta__inner {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 5rem;
          align-items: start;
        }

        /* Copy */
        .mkt-cta__copy {
        }

        .mkt-eyebrow--light {
          color: rgba(247,245,240,.7);
        }

        .mkt-eyebrow--light::before {
          background-color: rgba(247,245,240,.7);
        }

        .mkt-cta__heading {
          font-size: clamp(2rem, 3.5vw, 3rem);
          color: #F7F5F0;
          margin-bottom: 1.25rem;
        }

        .mkt-cta__sub {
          font-family: var(--mkt-font-body);
          font-size: 1.0625rem;
          line-height: 1.65;
          color: rgba(247,245,240,.75);
          max-width: 480px;
          margin-bottom: 2.25rem;
        }

        /* Form */
        .mkt-cta__label {
          display: block;
          font-family: var(--mkt-font-body);
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(247,245,240,.85);
          margin-bottom: 0.5rem;
        }

        .mkt-cta__fieldrow {
          display: flex;
          gap: 0.75rem;
          max-width: 520px;
        }

        .mkt-cta__input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: rgba(247,245,240,.1);
          border: 1.5px solid rgba(247,245,240,.2);
          border-radius: 6px;
          color: #F7F5F0;
          font-family: var(--mkt-font-body);
          font-size: 0.9375rem;
          outline: none;
          transition: border-color 0.15s, background-color 0.15s;
        }

        .mkt-cta__input::placeholder {
          color: rgba(247,245,240,.35);
        }

        .mkt-cta__input:focus {
          border-color: var(--mkt-accent-light);
          background: rgba(247,245,240,.14);
        }

        .mkt-cta__submit {
          flex-shrink: 0;
          background-color: var(--mkt-accent);
          color: #fff;
        }

        .mkt-cta__submit:hover {
          background-color: var(--mkt-accent-light);
        }

        .mkt-cta__note {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: rgba(247,245,240,.45);
        }

        /* Success */
        .mkt-cta__success {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: rgba(247,245,240,.08);
          border: 1px solid rgba(247,245,240,.15);
          border-radius: 8px;
          max-width: 520px;
          color: #F7F5F0;
        }

        .mkt-cta__success-icon {
          font-size: 1.25rem;
          color: var(--mkt-accent-light);
          line-height: 1.4;
        }

        .mkt-cta__success strong {
          display: block;
          font-size: 0.9375rem;
          margin-bottom: 0.25rem;
        }

        .mkt-cta__success .mkt-mono {
          font-size: 0.75rem;
          color: rgba(247,245,240,.5);
        }

        /* OR divider */
        .mkt-cta__divider-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 520px;
          margin-block: 1.5rem;
        }

        .mkt-cta__divider-line {
          flex: 1;
          height: 1px;
          background: rgba(247,245,240,.15);
        }

        .mkt-cta__divider-text {
          font-size: 0.75rem;
          color: rgba(247,245,240,.4);
        }

        .mkt-cta__existing {
          font-family: var(--mkt-font-body);
          font-size: 0.9rem;
          color: rgba(247,245,240,.6);
        }

        .mkt-cta__login-link {
          color: var(--mkt-accent-light);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .mkt-cta__login-link:hover {
          color: #F7F5F0;
        }

        /* Aside callouts */
        .mkt-cta__aside {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          padding-top: 0.5rem;
        }

        .mkt-cta__callout {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .mkt-cta__callout-icon {
          font-size: 1.25rem;
          line-height: 1.4;
          flex-shrink: 0;
        }

        .mkt-cta__callout-title {
          font-family: var(--mkt-font-body);
          font-weight: 600;
          font-size: 0.9375rem;
          color: #F7F5F0;
          margin-bottom: 0.25rem;
        }

        .mkt-cta__callout-body {
          font-family: var(--mkt-font-body);
          font-size: 0.875rem;
          color: rgba(247,245,240,.6);
          line-height: 1.55;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .mkt-cta__inner {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        @media (max-width: 640px) {
          .mkt-cta__fieldrow {
            flex-direction: column;
          }
          .mkt-cta__submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};

export default CtaSection;
