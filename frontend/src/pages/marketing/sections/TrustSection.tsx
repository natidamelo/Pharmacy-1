import React, { useRef, useEffect } from 'react';

interface Credential {
  icon: string;
  label: string;
  detail: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
}

const credentials: Credential[] = [
  { icon: '🔒', label: 'HIPAA aligned', detail: 'Data-at-rest encrypted (AES-256). Role-based access. No PHI on logs.' },
  { icon: '🏥', label: 'Pharmacy-built', detail: 'Designed with licensed pharmacists, not general healthcare generalists.' },
  { icon: '📋', label: 'Full audit trail', detail: 'Every action timestamped, pharmacist-attributed, and reportable on demand.' },
  { icon: '🔄', label: '99.7% uptime', detail: 'Redundant infrastructure. Maintenance windows under 4 h/year.' },
  { icon: '🧪', label: 'Drug-interaction engine', detail: 'Checks against a continuously updated interaction database at intake.' },
  { icon: '📦', label: 'Supplier integrations', detail: 'Direct EDI links to major wholesalers. POs auto-generated at reorder threshold.' },
];

const testimonials: Testimonial[] = [
  {
    quote: "We cut our end-of-day stock reconciliation from 45 minutes to under five. That's an hour back every shift.",
    author: 'Amira Nasser',
    role: 'Owner-pharmacist, Al Shifa Pharmacy',
    initials: 'AN',
  },
  {
    quote: 'Insurance rejections dropped sharply in the first month. The coverage check at intake catches problems before dispense.',
    author: 'David Mensah',
    role: 'Head pharmacist, City Rx Group (4 locations)',
    initials: 'DM',
  },
  {
    quote: "Controlled-substance audits used to take two hours. Now I generate the report in thirty seconds and get back on the floor.",
    author: 'Priya Anand',
    role: 'Regulatory pharmacist, MedPharm Chain',
    initials: 'PA',
  },
];

const TrustSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll('.mkt-trust-card, .mkt-testimonial');
    if (!items?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('mkt-trust-card--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="mkt-section mkt-trust"
      id="trust"
      ref={sectionRef}
      aria-labelledby="trust-heading"
    >
      <div className="mkt-container">

        {/* Header */}
        <header className="mkt-trust__header">
          <p className="mkt-eyebrow">Why pharmacies choose PharmaSys</p>
          <h2 className="mkt-display mkt-trust__heading" id="trust-heading">
            Built for the work,<br />not the sales pitch.
          </h2>
        </header>

        {/* Credential grid */}
        <div className="mkt-trust__grid" role="list">
          {credentials.map((c, i) => (
            <article
              key={c.label}
              className="mkt-trust-card"
              role="listitem"
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className="mkt-trust-card__icon" aria-hidden="true">{c.icon}</div>
              <h3 className="mkt-trust-card__label">{c.label}</h3>
              <p className="mkt-body mkt-trust-card__detail">{c.detail}</p>
            </article>
          ))}
        </div>

        {/* Divider */}
        <div className="mkt-divider" />

        {/* Testimonials */}
        <div className="mkt-testimonials" aria-label="Customer testimonials">
          {testimonials.map((t, i) => (
            <blockquote
              key={t.author}
              className="mkt-testimonial"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <p className="mkt-testimonial__quote">"{t.quote}"</p>
              <footer className="mkt-testimonial__footer">
                <div className="mkt-testimonial__avatar" aria-hidden="true">
                  {t.initials}
                </div>
                <div>
                  <cite className="mkt-testimonial__author">{t.author}</cite>
                  <p className="mkt-mono mkt-testimonial__role">{t.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>

      </div>

      <style>{`
        .mkt-trust {
          background-color: var(--mkt-surface);
          position: relative;
        }

        .mkt-trust__header {
          max-width: 560px;
          margin-bottom: 3rem;
        }

        .mkt-trust__heading {
          font-size: clamp(1.875rem, 3.5vw, 2.75rem);
          margin-bottom: 0;
        }

        /* Credential grid */
        .mkt-trust__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .mkt-trust-card {
          background: var(--mkt-bg);
          border: 1px solid var(--mkt-border-light);
          border-radius: 10px;
          padding: 1.5rem;
          transition:
            opacity 0.55s var(--mkt-ease-out),
            transform 0.55s var(--mkt-ease-out),
            box-shadow 0.2s var(--mkt-ease-in-out);
          opacity: 0;
          transform: translateY(20px);
        }

        .mkt-trust-card--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .mkt-trust-card:hover {
          box-shadow: 0 6px 28px rgba(22,33,29,.08);
          transform: translateY(-2px);
        }

        .mkt-trust-card__icon {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1;
        }

        .mkt-trust-card__label {
          font-family: var(--mkt-font-body);
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--mkt-ink);
          margin-bottom: 0.5rem;
        }

        .mkt-trust-card__detail {
          font-size: 0.875rem;
          line-height: 1.55;
          color: var(--mkt-ink-muted);
        }

        /* Testimonials */
        .mkt-testimonials {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .mkt-testimonial {
          background: var(--mkt-bg);
          border: 1px solid var(--mkt-border-light);
          border-radius: 10px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 0.55s var(--mkt-ease-out),
            transform 0.55s var(--mkt-ease-out);
        }

        .mkt-trust-card--visible.mkt-testimonial {
          opacity: 1;
          transform: translateY(0);
        }

        .mkt-testimonial__quote {
          font-family: var(--mkt-font-display);
          font-size: 1.0625rem;
          line-height: 1.55;
          color: var(--mkt-ink);
          font-style: italic;
          flex: 1;
        }

        .mkt-testimonial__footer {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .mkt-testimonial__avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--mkt-primary);
          color: #fff;
          font-family: var(--mkt-font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mkt-testimonial__author {
          display: block;
          font-style: normal;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--mkt-ink);
        }

        .mkt-testimonial__role {
          font-size: 0.75rem;
          color: var(--mkt-ink-subtle);
        }

        /* ── Responsive */
        @media (max-width: 1024px) {
          .mkt-trust__grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .mkt-testimonials {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .mkt-trust__grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mkt-trust-card,
          .mkt-testimonial {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .mkt-trust-card:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
};

export default TrustSection;
