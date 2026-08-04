import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { Calendar, User, CheckCircle2 } from 'lucide-react';

// Lazy-load the 3D WebGL Pill Scene so it never blocks the main bundle
const Bottle3D = lazy(() => import('../components/Bottle3D'));

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [use3D, setUse3D] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);

    const desktopOk = window.innerWidth >= 1024;
    if (desktopOk) {
      const t = setTimeout(() => setUse3D(true), 300);
      return () => { clearTimeout(t); mq.removeEventListener('change', onChange); };
    }
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Mouse parallax tracker
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouse = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setMousePos({
        x: (e.clientX - cx) / (rect.width / 2),
        y: (e.clientY - cy) / (rect.height / 2),
      });
    };

    hero.addEventListener('mousemove', handleMouse);
    return () => hero.removeEventListener('mousemove', handleMouse);
  }, []);

  // Scroll listener for 3D transformation
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate dynamic glass card floating offsets on scroll
  const scrollRatio = Math.min(scrollY / 1200, 1);
  const card1Transform = `translate3d(${mousePos.x * 12}px, ${-scrollY * 0.15 + mousePos.y * 8}px, 0) scale(${1 - scrollRatio * 0.05})`;
  const card2Transform = `translate3d(${mousePos.x * -10}px, ${-scrollY * 0.22 + mousePos.y * -6}px, 0)`;

  return (
    <section className="mkt-hero" ref={heroRef} id="hero" aria-label="Introduction">
      {/* Background grid texture & ambient glow */}
      <div className="mkt-hero__bg" aria-hidden="true">
        <div className="mkt-hero__bg-grid" />
        <div className="mkt-hero__bg-glow" />
      </div>

      <div className="mkt-container mkt-hero__inner">
        {/* Left Column: Content & Feature Highlights */}
        <div className="mkt-hero__copy">
          <div className="mkt-hero__eyebrow-row mkt-reveal mkt-delay-1">
            <span className="mkt-hero__dash">—</span>
            <span className="mkt-hero__eyebrow-text">PharmaSys</span>
          </div>

          <h1 className="mkt-hero__headline mkt-reveal mkt-delay-2">
            Intelligent workflow for pharmacies.{' '}
            <span className="mkt-hero__headline-sub">Simplified for efficiency.</span>
          </h1>

          <p className="mkt-hero__sub mkt-reveal mkt-delay-3">
            Transform your pharmacy management with autonomous tracking, real-time prescription analytics, and zero-friction automated inventory.
          </p>

          {/* Feature Highlights List */}
          <div className="mkt-hero__features mkt-reveal mkt-delay-4">
            <div className="mkt-hero__feature-item">
              <div className="mkt-hero__feature-icon">
                <Calendar size={18} />
              </div>
              <div className="mkt-hero__feature-text">
                <strong>Smart Scheduling</strong> (AI Prescription Analysis)
              </div>
            </div>

            <div className="mkt-hero__feature-item">
              <div className="mkt-hero__feature-icon">
                <User size={18} />
              </div>
              <div className="mkt-hero__feature-text">
                <strong>Integrated CRM</strong> (Patient Profiles)
              </div>
            </div>

            <div className="mkt-hero__feature-item">
              <div className="mkt-hero__feature-icon">
                <CheckCircle2 size={18} />
              </div>
              <div className="mkt-hero__feature-text">
                <strong>Automated Inventory</strong> (Predictive Stock & Compliance)
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="mkt-hero__actions mkt-reveal mkt-delay-5">
            <a href="#cta" className="mkt-hero__btn-primary">
              SEE HOW IT WORKS
            </a>
            <a href="#capabilities" className="mkt-hero__btn-secondary">
              TALK TO AN EXPERT
            </a>
          </div>
        </div>

        {/* Right Column: 3D Capsule Pill & Anchored Glassmorphic Analytics Cards */}
        <div className="mkt-hero__visual" aria-hidden="true">
          {/* 3D WebGL Canvas */}
          <div className="mkt-hero__pill-canvas-wrap">
            {use3D ? (
              <Suspense fallback={<div className="mkt-hero__pill-placeholder" />}>
                <Bottle3D
                  mouseX={mousePos.x}
                  mouseY={mousePos.y}
                  scrollY={scrollY}
                  reduced={reducedMotion}
                />
              </Suspense>
            ) : (
              <div className="mkt-hero__pill-placeholder" />
            )}
          </div>

          {/* Floating Glassmorphic UI Card 1: Monthly Prescriptions Dispensed */}
          <div
            className="mkt-hero__glass-card mkt-hero__glass-card--dispensed"
            style={{ transform: card1Transform }}
          >
            <div className="mkt-glass-card__header">
              <span className="mkt-glass-card__title">Monthly Prescriptions Dispensed</span>
              <span className="mkt-glass-card__metric">2,4M</span>
            </div>
            {/* Pill Bar Chart Visual */}
            <div className="mkt-glass-card__chart">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="mkt-glass-card__bar-pill"
                  style={{
                    height: `${28 + Math.sin(i * 0.8) * 22 + (i % 3) * 12}%`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <span className="mkt-glass-card__bar-cap" />
                </div>
              ))}
            </div>
          </div>

          {/* Stock Badge Tag */}
          <div className="mkt-hero__badge-tag mkt-hero__badge-tag--stock">
            <span className="mkt-badge-tag__label">Stock: 847 units</span>
          </div>

          {/* Floating Glassmorphic UI Card 2: Active Deliveries Drone Map */}
          <div
            className="mkt-hero__glass-card mkt-hero__glass-card--map"
            style={{ transform: card2Transform }}
          >
            <div className="mkt-glass-card__map-bg">
              {/* Curved Dashed Route Path */}
              <svg viewBox="0 0 240 100" className="mkt-glass-card__route-svg">
                <path
                  d="M 20 80 Q 90 10 160 70 T 220 20"
                  fill="none"
                  stroke="rgba(13,92,63,0.6)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
                <circle cx="160" cy="70" r="4" fill="#0D5C3F" />
                <circle cx="220" cy="20" r="4" fill="#0D5C3F" />
              </svg>
            </div>
            <div className="mkt-glass-card__map-footer">
              <span className="mkt-glass-card__title">Active Deliveries: 3</span>
            </div>
          </div>

          {/* Bottom Badge Tags */}
          <div className="mkt-hero__badge-tag mkt-hero__badge-tag--rx">
            <span className="mkt-badge-tag__label">Rx Secure</span>
          </div>

          <div className="mkt-hero__badge-tag mkt-hero__badge-tag--dosage">
            <span className="mkt-badge-tag__label">Dosage 500mg × 2/day</span>
          </div>
        </div>
      </div>

      <style>{`
        .mkt-hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: center;
          padding-top: 72px;
          overflow: hidden;
          background-color: var(--mkt-bg, #EEF0EC);
          transition: background-color 0.3s ease;
        }

        .mkt-hero__bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .mkt-hero__bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(13,92,63,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,92,63,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.7;
          mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%);
        }

        .mkt-hero__bg-glow {
          position: absolute;
          top: 10%;
          right: 8%;
          width: 580px;
          height: 580px;
          background: radial-gradient(ellipse, rgba(13,92,63,0.15) 0%, transparent 70%);
          border-radius: 50%;
        }

        .mkt-hero__inner {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3rem;
          align-items: center;
          padding-block: 3.5rem;
          position: relative;
          z-index: 2;
        }

        /* Eyebrow */
        .mkt-hero__eyebrow-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .mkt-hero__dash { color: #0D5C3F; font-weight: 700; }
        .mkt-hero__eyebrow-text {
          font-family: var(--mkt-font-body, system-ui);
          font-size: 0.9375rem;
          font-weight: 600;
          color: #0D5C3F;
          letter-spacing: 0.02em;
        }

        /* Headline */
        .mkt-hero__headline {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(2.5rem, 4.2vw, 3.75rem);
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1.5rem;
        }
        .mkt-hero__headline-sub {
          color: #4B5563;
          font-weight: 600;
        }

        /* Subtitle */
        .mkt-hero__sub {
          font-size: 1.0625rem;
          color: #4B5563;
          line-height: 1.6;
          max-width: 520px;
          margin-bottom: 2rem;
        }

        /* Feature Highlights */
        .mkt-hero__features {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          margin-bottom: 2.25rem;
        }
        .mkt-hero__feature-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        .mkt-hero__feature-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(13,92,63,0.1);
          color: #0D5C3F;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .mkt-hero__feature-text {
          font-size: 0.9375rem;
          color: #374151;
        }
        .mkt-hero__feature-text strong {
          color: #111827;
          font-weight: 600;
        }

        /* CTA Buttons */
        .mkt-hero__actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .mkt-hero__btn-primary {
          background: #0D5C3F;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.875rem;
          letter-spacing: 0.04em;
          padding: 1rem 1.75rem;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 10px 25px -5px rgba(13,92,63,0.3);
          transition: all 0.2s ease;
        }
        .mkt-hero__btn-primary:hover {
          background: #08422d;
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -5px rgba(13,92,63,0.4);
        }
        .mkt-hero__btn-secondary {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(209,213,219,0.8);
          color: #1F2937;
          font-weight: 700;
          font-size: 0.875rem;
          letter-spacing: 0.04em;
          padding: 1rem 1.75rem;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .mkt-hero__btn-secondary:hover {
          background: #ffffff;
          border-color: #9CA3AF;
          transform: translateY(-2px);
        }

        /* Right Visual Column */
        .mkt-hero__visual {
          position: relative;
          width: 100%;
          height: 540px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mkt-hero__pill-canvas-wrap {
          position: absolute;
          inset: -40px;
          z-index: 1;
        }
        .mkt-hero__pill-placeholder {
          width: 100%;
          height: 100%;
        }

        /* Glassmorphic UI Cards */
        .mkt-hero__glass-card {
          position: absolute;
          z-index: 3;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 18px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          padding: 1.25rem 1.5rem;
          transition: transform 0.2s ease-out;
        }

        .mkt-hero__glass-card--dispensed {
          top: 14%;
          right: 2%;
          width: 270px;
        }

        .mkt-glass-card__header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }
        .mkt-glass-card__title {
          font-size: 0.8125rem;
          color: #4B5563;
          font-weight: 500;
        }
        .mkt-glass-card__metric {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1.875rem;
          font-weight: 800;
          color: #0D5C3F;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .mkt-glass-card__chart {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 54px;
        }
        .mkt-glass-card__bar-pill {
          flex: 1;
          background: linear-gradient(180deg, #0D5C3F 0%, #1B4B43 100%);
          border-radius: 10px;
          position: relative;
          min-height: 12px;
          transition: height 0.3s ease;
        }
        .mkt-glass-card__bar-cap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: rgba(255,255,255,0.6);
          border-radius: 10px 10px 0 0;
        }

        .mkt-hero__glass-card--map {
          bottom: 14%;
          right: 4%;
          width: 270px;
          padding: 0;
          overflow: hidden;
        }
        .mkt-glass-card__map-bg {
          height: 110px;
          background: linear-gradient(135deg, #e4ede8 0%, #d8e6df 100%);
          position: relative;
        }
        .mkt-glass-card__route-svg {
          width: 100%;
          height: 100%;
        }
        .mkt-glass-card__map-footer {
          padding: 0.875rem 1.25rem;
          background: rgba(255,255,255,0.85);
        }

        /* Badge Tags */
        .mkt-hero__badge-tag {
          position: absolute;
          z-index: 4;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.9);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.04);
        }
        .mkt-badge-tag__label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1F2937;
        }

        .mkt-hero__badge-tag--stock {
          top: 42%;
          right: 32%;
        }
        .mkt-hero__badge-tag--rx {
          bottom: 10%;
          left: 36%;
        }
        .mkt-hero__badge-tag--dosage {
          bottom: 10%;
          right: 4%;
        }

        /* Dark mode overrides for Hero section */
        [data-theme="dark"] .mkt-hero,
        .dark .mkt-hero {
          background-color: #0A1916;
        }
        [data-theme="dark"] .mkt-hero__headline,
        .dark .mkt-hero__headline {
          color: #F4F1EA;
        }
        [data-theme="dark"] .mkt-hero__headline-sub,
        .dark .mkt-hero__headline-sub {
          color: #9EB5AD;
        }
        [data-theme="dark"] .mkt-hero__sub,
        .dark .mkt-hero__sub,
        [data-theme="dark"] .mkt-hero__feature-text,
        .dark .mkt-hero__feature-text {
          color: #9EB5AD;
        }
        [data-theme="dark"] .mkt-hero__feature-text strong,
        .dark .mkt-hero__feature-text strong {
          color: #F4F1EA;
        }
        [data-theme="dark"] .mkt-hero__glass-card,
        .dark .mkt-hero__glass-card,
        [data-theme="dark"] .mkt-hero__badge-tag,
        .dark .mkt-hero__badge-tag {
          background: rgba(18,43,37,0.75);
          border-color: rgba(30,63,55,0.8);
        }
        [data-theme="dark"] .mkt-glass-card__title,
        .dark .mkt-glass-card__title,
        [data-theme="dark"] .mkt-badge-tag__label,
        .dark .mkt-badge-tag__label {
          color: #E2E8F0;
        }
        [data-theme="dark"] .mkt-glass-card__map-footer,
        .dark .mkt-glass-card__map-footer {
          background: rgba(18,43,37,0.9);
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
