import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import amberBottleImg from '../../../assets/amber_bottle.png';

// Lazy-load the 3D bottle so it never blocks the authenticated app bundle
const Bottle3D = lazy(() => import('../components/Bottle3D'));

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos]   = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY]     = useState(0);
  const [use3D, setUse3D]         = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check if 3D is wanted — respect user preference & perf budget
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);

    // Use 3D on desktop only (avoids mobile GPU overhead)
    const desktopOk = window.innerWidth >= 1024;
    if (desktopOk) {                      // 3D canvas even in reduced mode – just static
      const t = setTimeout(() => setUse3D(true), 400);
      return () => { clearTimeout(t); mq.removeEventListener('change', onChange); };
    }
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Mouse parallax for the bottle
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouse = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setMousePos({
        x: (e.clientX - cx) / (rect.width / 2),  // -1 .. 1
        y: (e.clientY - cy) / (rect.height / 2),
      });
    };

    hero.addEventListener('mousemove', handleMouse);
    return () => hero.removeEventListener('mousemove', handleMouse);
  }, []);

  // Scroll-tied shift
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // CSS 3D transform for the bottle image (lightweight path)
  const bottleTransform = `
    perspective(900px)
    rotateY(${mousePos.x * 12}deg)
    rotateX(${-mousePos.y * 6}deg)
    translateY(${-scrollY * 0.12}px)
  `;

  return (
    <section className="mkt-hero" ref={heroRef} id="hero" aria-label="Introduction">

      {/* Background texture */}
      <div className="mkt-hero__bg" aria-hidden="true">
        <div className="mkt-hero__bg-grid" />
        <div className="mkt-hero__bg-glow" />
      </div>

      <div className="mkt-container mkt-hero__inner">

        {/* Left column — copy */}
        <div className="mkt-hero__copy">
          <p className="mkt-eyebrow mkt-reveal mkt-delay-1">
            Pharmacy management software
          </p>

          <h1 className="mkt-display mkt-hero__headline mkt-reveal mkt-delay-2">
            Run your pharmacy.<br />
            Not the other<br className="mkt-hero__headline-br" /> way around.
          </h1>

          <p className="mkt-body mkt-hero__sub mkt-reveal mkt-delay-3">
            PharmaSys puts intake, dispensing, inventory, and billing in one
            flow — so you spend less time chasing paperwork and more time
            serving patients.
          </p>

          <div className="mkt-hero__actions mkt-reveal mkt-delay-4">
            <a href="#cta" className="mkt-btn mkt-btn-primary mkt-hero__cta">
              Request a demo
              <span aria-hidden="true">→</span>
            </a>
            <a href="#capabilities" className="mkt-btn mkt-btn-ghost">
              See how it works
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mkt-hero__proof mkt-reveal mkt-delay-5">
            <span className="mkt-mono">Trusted by</span>
            <div className="mkt-hero__stats">
              <div className="mkt-hero__stat">
                <span className="mkt-hero__stat-num">480+</span>
                <span className="mkt-mono">pharmacies</span>
              </div>
              <div className="mkt-hero__stat-divider" aria-hidden="true" />
              <div className="mkt-hero__stat">
                <span className="mkt-hero__stat-num">2.4M</span>
                <span className="mkt-mono">dispensed / month</span>
              </div>
              <div className="mkt-hero__stat-divider" aria-hidden="true" />
              <div className="mkt-hero__stat">
                <span className="mkt-hero__stat-num">99.7%</span>
                <span className="mkt-mono">uptime SLA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — 3D/visual signature moment */}
        <div className="mkt-hero__visual mkt-reveal-fade mkt-delay-2" aria-hidden="true">
          {/* Glow orb behind the bottle */}
          <div className="mkt-hero__orb" />

          {/* The bottle — CSS 3D when no R3F, R3F when loaded */}
          <div
            className="mkt-hero__bottle-wrap"
            ref={bottleRef}
            style={{
              transform: use3D ? undefined : bottleTransform,
              transition: use3D ? undefined : 'transform 0.12s linear',
            }}
          >
            {use3D ? (
              <Suspense fallback={
                <img
                  src={amberBottleImg}
                  alt=""
                  className="mkt-hero__bottle-img"
                  draggable={false}
                />
              }>
                <Bottle3D
                  mouseX={mousePos.x}
                  mouseY={mousePos.y}
                  scrollY={scrollY}
                  reduced={reducedMotion}
                />
              </Suspense>
            ) : (
              <img
                src={amberBottleImg}
                alt=""
                className="mkt-hero__bottle-img"
                draggable={false}
              />
            )}
          </div>

          {/* Floating prescription label chips */}
          <div className="mkt-hero__chip mkt-hero__chip--rx" role="presentation">
            <span className="mkt-mono">Rx 2847</span>
            <span className="mkt-hero__chip-label">Verified ✓</span>
          </div>
          <div className="mkt-hero__chip mkt-hero__chip--stock" role="presentation">
            <span className="mkt-mono">Stock</span>
            <span className="mkt-hero__chip-label">847 units</span>
          </div>
          <div className="mkt-hero__chip mkt-hero__chip--dose" role="presentation">
            <span className="mkt-mono">Dosage</span>
            <span className="mkt-hero__chip-label">500mg × 2/day</span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="mkt-hero__scroll-cue" aria-hidden="true">
        <div className="mkt-hero__scroll-line" />
      </div>

      <style>{`
        /* ── Hero section ─────────────────────────── */
        .mkt-hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: center;
          padding-top: 68px; /* nav height */
          overflow: hidden;
        }

        /* ── Background */
        .mkt-hero__bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .mkt-hero__bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--mkt-border-light) 1px, transparent 1px),
            linear-gradient(90deg, var(--mkt-border-light) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.45;
          mask-image: radial-gradient(ellipse 80% 80% at 60% 40%, black 30%, transparent 100%);
        }

        .mkt-hero__bg-glow {
          position: absolute;
          top: 15%;
          right: 5%;
          width: 520px;
          height: 520px;
          background: radial-gradient(ellipse, rgba(156,107,46,.12) 0%, transparent 70%);
          border-radius: 50%;
        }

        /* ── Inner layout */
        .mkt-hero__inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          padding-block: var(--mkt-space-3xl);
        }

        /* ── Copy column */
        .mkt-hero__copy {
          max-width: 560px;
        }

        .mkt-hero__headline {
          font-size: clamp(2.75rem, 5.5vw, 4.5rem);
          margin-bottom: 1.25rem;
        }

        .mkt-hero__headline-br {
          display: none;
        }

        .mkt-hero__sub {
          font-size: 1.0625rem;
          max-width: 440px;
          margin-bottom: 2rem;
        }

        .mkt-hero__actions {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex-wrap: wrap;
        }

        .mkt-hero__cta {
          font-size: 1rem;
          padding: 0.875rem 1.75rem;
        }

        /* ── Stats proof strip */
        .mkt-hero__proof {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--mkt-border-light);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mkt-hero__stats {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .mkt-hero__stat {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .mkt-hero__stat-num {
          font-family: var(--mkt-font-display);
          font-size: 1.625rem;
          font-weight: 600;
          color: var(--mkt-ink);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .mkt-hero__stat-divider {
          width: 1px;
          height: 32px;
          background-color: var(--mkt-border);
        }

        /* ── Visual column */
        .mkt-hero__visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 560px;
        }

        .mkt-hero__orb {
          position: absolute;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(156,107,46,.18) 0%, rgba(27,75,67,.08) 60%, transparent 100%);
          border-radius: 50%;
          filter: blur(40px);
        }

        /* ── Bottle 3D signature */
        .mkt-hero__bottle-wrap {
          position: relative;
          z-index: 2;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .mkt-hero__bottle-img {
          width: 220px;
          height: auto;
          display: block;
          filter: drop-shadow(0 30px 60px rgba(156,107,46,.35)) drop-shadow(0 4px 16px rgba(22,33,29,.18));
        }

        /* ── Floating prescription label chips */
        .mkt-hero__chip {
          position: absolute;
          background: rgba(247,245,240,0.88);
          border: 1px solid var(--mkt-border);
          backdrop-filter: blur(8px);
          border-radius: 8px;
          padding: 0.5rem 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 4px 16px rgba(22,33,29,.08);
          min-width: 110px;
          z-index: 3;
        }

        .mkt-hero__chip-label {
          font-family: var(--mkt-font-body);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--mkt-ink);
        }

        /* Chip positions */
        .mkt-hero__chip--rx {
          top: 15%;
          right: 5%;
          animation: mkt-float-a 6s ease-in-out infinite;
        }

        .mkt-hero__chip--stock {
          bottom: 25%;
          left: 2%;
          animation: mkt-float-b 7s ease-in-out infinite;
        }

        .mkt-hero__chip--dose {
          bottom: 10%;
          right: 8%;
          animation: mkt-float-c 5.5s ease-in-out infinite;
        }

        @keyframes mkt-float-a {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-10px); }
        }
        @keyframes mkt-float-b {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(8px); }
        }
        @keyframes mkt-float-c {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-6px); }
        }

        /* ── Scroll cue */
        .mkt-hero__scroll-cue {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mkt-hero__scroll-line {
          width: 1px;
          height: 48px;
          background: linear-gradient(to bottom, var(--mkt-accent), transparent);
          animation: mkt-scroll-line 2s ease-in-out infinite;
        }

        @keyframes mkt-scroll-line {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50%       { opacity: 0.4; transform: scaleY(0.6); }
        }

        /* ── Responsive ─────────────────────── */
        @media (max-width: 1024px) {
          .mkt-hero__inner {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .mkt-hero__copy {
            max-width: 100%;
          }
          .mkt-hero__visual {
            min-height: 360px;
            order: -1;
          }
          .mkt-hero__bottle-img {
            width: 180px;
          }
          .mkt-hero__scroll-cue {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .mkt-hero__stats {
            gap: 1rem;
          }
          .mkt-hero__stat-divider {
            display: none;
          }
          .mkt-hero__visual {
            min-height: 280px;
          }
          .mkt-hero__bottle-img {
            width: 140px;
          }
          .mkt-hero__chip {
            font-size: 0.6875rem;
            padding: 0.375rem 0.625rem;
          }
        }

        /* ── Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .mkt-hero__chip--rx,
          .mkt-hero__chip--stock,
          .mkt-hero__chip--dose,
          .mkt-hero__scroll-line {
            animation: none !important;
          }
          .mkt-hero__bottle-wrap {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
