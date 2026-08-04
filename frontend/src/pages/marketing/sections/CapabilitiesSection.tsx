import React, { useRef, useEffect } from 'react';

interface Step {
  number: string;
  title: string;
  body: string;
  detail: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Intake',
    body: 'Patient presents a prescription — paper or electronic. You scan or enter it once; PharmaSys validates the drug, checks interactions, and flags insurance coverage gaps before you ever reach for the shelf.',
    detail: 'Avg. intake time: 45 s',
  },
  {
    number: '02',
    title: 'Dispense',
    body: 'Pull the right item, confirm the lot and expiry, print the label. The system holds stock count in real time — no separate stocktake mid-shift, no guessing when to reorder.',
    detail: 'Zero counting discrepancies',
  },
  {
    number: '03',
    title: 'Track',
    body: "Every dispensed unit is logged with patient, pharmacist, lot number, and timestamp. Audit reports take seconds — not a morning. Controlled substances tracked end to end with a single click.",
    detail: 'Full chain-of-custody log',
  },
];

const CapabilitiesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll('.mkt-cap__step');
    if (!items?.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('mkt-cap__step--visible');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    items.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <section
      className="mkt-section mkt-cap"
      id="capabilities"
      ref={sectionRef}
      aria-labelledby="cap-heading"
    >
      <div className="mkt-container">

        {/* Section header */}
        <header className="mkt-cap__header">
          <p className="mkt-eyebrow">How it works</p>
          <h2
            className="mkt-display mkt-cap__heading"
            id="cap-heading"
          >
            Intake to dispense<br />in one straight line.
          </h2>
          <p className="mkt-body mkt-cap__desc">
            Most pharmacy software adds steps. PharmaSys removes them. The
            sequence below is the actual workflow — no hidden screens, no
            module-jumping.
          </p>
        </header>

        {/* Steps — sequential 01/02/03 layout, because this IS a sequence */}
        <ol className="mkt-cap__steps" aria-label="Workflow steps">
          {steps.map((step, i) => (
            <li
              key={step.number}
              className="mkt-cap__step"
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <div className="mkt-cap__step-number">
                <span className="mkt-mono">{step.number}</span>
                <div className="mkt-cap__connector" aria-hidden="true" />
              </div>

              <div className="mkt-cap__step-body">
                <h3 className="mkt-cap__step-title">{step.title}</h3>
                <p className="mkt-body mkt-cap__step-text">{step.body}</p>
                <div className="mkt-cap__step-detail">
                  <span className="mkt-mono">{step.detail}</span>
                </div>
              </div>

              {/* Inline illustration — styled with CSS */}
              <div className="mkt-cap__step-illo" aria-hidden="true">
                <div className={`mkt-cap__illo-inner mkt-cap__illo-inner--${i + 1}`}>
                  {i === 0 && <RxIllo />}
                  {i === 1 && <DispenseIllo />}
                  {i === 2 && <TrackIllo />}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        .mkt-cap {
          background-color: var(--mkt-bg);
          position: relative;
        }

        /* Section header */
        .mkt-cap__header {
          max-width: 640px;
          margin-bottom: 4rem;
        }

        .mkt-cap__heading {
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 1rem;
        }

        .mkt-cap__desc {
          font-size: 1.0625rem;
          max-width: 480px;
        }

        /* Steps list */
        .mkt-cap__steps {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* One step */
        .mkt-cap__step {
          display: grid;
          grid-template-columns: 72px 1fr 320px;
          gap: 2.5rem;
          align-items: start;
          padding-block: 3rem;
          border-top: 1px solid var(--mkt-border-light);

          /* Scroll reveal */
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity 0.6s var(--mkt-ease-out),
            transform 0.6s var(--mkt-ease-out);
        }

        .mkt-cap__step--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .mkt-cap__steps li:last-child {
          border-bottom: 1px solid var(--mkt-border-light);
        }

        /* Number column */
        .mkt-cap__step-number {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding-top: 0.25rem;
        }

        .mkt-cap__step-number .mkt-mono {
          font-size: 1rem;
          font-weight: 600;
          color: var(--mkt-accent);
          letter-spacing: 0.08em;
        }

        .mkt-cap__connector {
          width: 1px;
          flex: 1;
          min-height: 60px;
          background: linear-gradient(to bottom, var(--mkt-border), transparent);
        }

        .mkt-cap__steps li:last-child .mkt-cap__connector {
          display: none;
        }

        /* Step body */
        .mkt-cap__step-title {
          font-family: var(--mkt-font-display);
          font-size: 1.625rem;
          font-weight: 600;
          color: var(--mkt-ink);
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }

        .mkt-cap__step-text {
          max-width: 440px;
          margin-bottom: 1.25rem;
        }

        .mkt-cap__step-detail {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.75rem;
          background-color: var(--mkt-accent-pale);
          border-radius: 4px;
          border: 1px solid rgba(156,107,46,.2);
        }

        .mkt-cap__step-detail .mkt-mono {
          color: var(--mkt-accent);
          font-weight: 500;
        }

        /* Illustration area */
        .mkt-cap__step-illo {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 0.25rem;
        }

        .mkt-cap__illo-inner {
          width: 100%;
          max-width: 280px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--mkt-border-light);
          box-shadow: 0 4px 24px rgba(22,33,29,.06);
        }

        /* ── Responsive */
        @media (max-width: 1024px) {
          .mkt-cap__step {
            grid-template-columns: 56px 1fr;
            grid-template-rows: auto auto;
          }
          .mkt-cap__step-illo {
            grid-column: 2;
            justify-content: flex-start;
          }
        }

        @media (max-width: 640px) {
          .mkt-cap__step {
            grid-template-columns: 40px 1fr;
            gap: 1.25rem;
          }
          .mkt-cap__step-illo {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mkt-cap__step {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
};

/* ── Step illustrations — pure CSS/SVG, no external deps ─────── */
const RxIllo: React.FC = () => (
  <div style={{
    background: 'var(--mkt-surface)',
    padding: '1.25rem',
    minHeight: '160px',
    fontFamily: 'var(--mkt-font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--mkt-ink-muted)',
    lineHeight: 1.6,
  }}>
    <div style={{ color: 'var(--mkt-accent)', fontWeight: 600, marginBottom: '0.5rem' }}>
      Rx #2847 — Verified
    </div>
    <div>Patient: J. Okafor</div>
    <div>Drug: Lisinopril 10mg</div>
    <div>Qty: 30 tablets</div>
    <div>Refills: 2</div>
    <div style={{ marginTop: '0.75rem', padding: '0.375rem 0.5rem', background: 'rgba(27,75,67,.08)', borderRadius: '4px', color: 'var(--mkt-primary)', fontWeight: 500 }}>
      ✓ No interactions found
    </div>
  </div>
);

const DispenseIllo: React.FC = () => (
  <div style={{
    background: 'var(--mkt-surface)',
    padding: '1.25rem',
    minHeight: '160px',
    fontFamily: 'var(--mkt-font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--mkt-ink-muted)',
    lineHeight: 1.6,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span style={{ color: 'var(--mkt-accent)', fontWeight: 600 }}>Shelf pick</span>
      <span style={{ color: 'var(--mkt-ink-subtle)' }}>LOT A4291</span>
    </div>
    <div>Lisinopril 10mg</div>
    <div>Exp: 2027-03</div>
    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
      <span>On-hand</span>
      <span style={{ color: 'var(--mkt-primary)', fontWeight: 600 }}>847 units</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>Reorder at</span>
      <span>200 units</span>
    </div>
    <div style={{ marginTop: '0.75rem', height: '6px', background: 'var(--mkt-border-light)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: '78%', height: '100%', background: 'var(--mkt-primary)', borderRadius: '3px' }} />
    </div>
  </div>
);

const TrackIllo: React.FC = () => (
  <div style={{
    background: 'var(--mkt-surface)',
    padding: '1.25rem',
    minHeight: '160px',
    fontFamily: 'var(--mkt-font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--mkt-ink-muted)',
    lineHeight: 1.6,
  }}>
    <div style={{ color: 'var(--mkt-accent)', fontWeight: 600, marginBottom: '0.5rem' }}>Audit log</div>
    {[
      { time: '09:14:02', action: 'Dispensed Rx #2847' },
      { time: '09:14:05', action: 'Stock updated → 817' },
      { time: '09:14:06', action: 'Label printed' },
      { time: '09:14:07', action: 'Bill generated' },
    ].map((row) => (
      <div key={row.time} style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--mkt-border-light)', paddingBlock: '0.2rem' }}>
        <span style={{ color: 'var(--mkt-ink-subtle)', flexShrink: 0 }}>{row.time}</span>
        <span>{row.action}</span>
      </div>
    ))}
  </div>
);

export default CapabilitiesSection;
