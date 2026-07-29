import React, { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

/* ── Lazy-load the heavy 3D canvas so it never blocks first paint ────── */
const HeroCanvas = lazy(() =>
  import('../components/login/HeroCanvas').then((m) => ({ default: m.HeroCanvas }))
);

/* ── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: i * 0.12,
    },
  }),
};


/* ──────────────────────────────────────────────────────────────────────
   COLOR TOKENS — all values reference CSS variables defined in index.css
   Use these JS aliases so inline styles stay readable & one-source-of-truth.
   ────────────────────────────────────────────────────────────────────── */
const T = {
  /* Page */
  pageBg:        'var(--color-dark-bg)',          // #070B16
  pageBgMid:     'var(--color-dark-bg-mid)',      // #0C1424
  /* Surfaces */
  surface:       'var(--color-dark-surface)',     // #141C30
  surface2:      'var(--color-dark-surface-2)',   // #1B2540
  /* Primary (teal) — logo, CTA, one headline word ONLY */
  teal:          'var(--color-primary-mid)',      // #0d9488
  tealDark:      'var(--color-primary)',          // #0F6E5C
  tealLight:     'var(--color-primary-light)',    // #34d399
  /* Secondary accent — indigo/violet */
  indigo:        'var(--color-indigo)',           // #6366F1
  indigoLight:   'var(--color-indigo-light)',     // #818CF8
  indigoDim:     'var(--color-indigo-dim)',       // rgba(99,102,241,0.15)
  indigoGlow:    'var(--color-indigo-glow)',      // rgba(99,102,241,0.22)
  /* Amber — Smart Alerts ONLY */
  amber:         'var(--color-amber)',            // #F59E0B
  amberDim:      'var(--color-amber-dim)',        // rgba(245,158,11,0.15)
  amberBorder:   'var(--color-amber-border)',     // rgba(245,158,11,0.35)
  /* Text */
  heading:       'var(--color-dark-heading)',     // #F8FAFC
  body:          'var(--color-dark-body)',        // #94A3B8
  muted:         'var(--color-dark-muted)',       // #64748B
  /* Inputs */
  inputBg:       'var(--color-dark-input-bg)',    // #060A14
  inputBdr:      'var(--color-dark-input-bdr)',   // rgba(255,255,255,0.1)
} as const;

/* ── Custom SVG icon art — recolored per new accent system ───────────── */

/** FEFO: indigo chip, indigo capsule halves */
const FefoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="rgba(99,102,241,0.15)" />
    <rect x="10" y="13" width="7" height="10" rx="3.5" fill="#818CF8" />
    <rect x="19" y="13" width="7" height="10" rx="3.5" fill="#6366F1" />
    <path d="M8 26 L28 26" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M25 23 L28 26 L25 29" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Analytics: violet chip, violet bars + trend */
const AnalyticsIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="rgba(99,102,241,0.15)" />
    <rect x="9"  y="22" width="4" height="6" rx="1.5" fill="rgba(129,140,248,0.5)" />
    <rect x="15" y="17" width="4" height="11" rx="1.5" fill="#818CF8" />
    <rect x="21" y="13" width="4" height="15" rx="1.5" fill="#6366F1" />
    <path d="M11 21 L17 16 L23 12" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="23" cy="12" r="1.5" fill="#6366F1" />
  </svg>
);

/** Smart Alerts: amber chip, amber bell — semantic danger color */
const AlertIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="rgba(245,158,11,0.15)" />
    <path d="M18 8 C14 8 12 11 12 14 L12 20 L10 22 L26 22 L24 20 L24 14 C24 11 22 8 18 8 Z" fill="#F59E0B" />
    <rect x="16" y="23" width="4" height="2.5" rx="1.25" fill="#FCD34D" />
    <circle cx="24" cy="10" r="3" fill="#FCD34D" stroke="#070B16" strokeWidth="1.5" />
  </svg>
);

const features = [
  {
    Icon: FefoIcon,
    title: 'FEFO Dispensing',
    desc: 'First-Expired-First-Out batch tracking',
    /* Indigo accent bar */
    accentBar:   '#6366F1',
    hoverShadow: '0 20px 48px rgba(99,102,241,0.2)',
    innerGlow:   'rgba(99,102,241,0.06)',
  },
  {
    Icon: AnalyticsIcon,
    title: 'Live Analytics',
    desc: 'Real-time sales and inventory insights',
    /* Violet accent bar */
    accentBar:   '#818CF8',
    hoverShadow: '0 20px 48px rgba(129,140,248,0.2)',
    innerGlow:   'rgba(129,140,248,0.06)',
  },
  {
    Icon: AlertIcon,
    title: 'Smart Alerts',
    desc: 'Proactive low stock and expiry warnings',
    /* Amber accent bar */
    accentBar:   '#F59E0B',
    hoverShadow: '0 20px 48px rgba(245,158,11,0.2)',
    innerGlow:   'rgba(245,158,11,0.06)',
  },
];

/* ══════════════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════════════ */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── Auth logic — untouched ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(email, password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 1; }
          75%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes grain-move {
          0%   { transform: translate(0,   0); }
          10%  { transform: translate(-2%, -3%); }
          20%  { transform: translate(3%,  2%); }
          30%  { transform: translate(-1%, 4%); }
          40%  { transform: translate(4%, -1%); }
          50%  { transform: translate(-3%, 3%); }
          60%  { transform: translate(2%,  -4%); }
          70%  { transform: translate(-4%, 1%); }
          80%  { transform: translate(1%,  3%); }
          90%  { transform: translate(-2%, -2%); }
          100% { transform: translate(0,   0); }
        }
        @keyframes shimmer {
          0%   { transform: skewX(-20deg) translateX(-150%); }
          60%  { transform: skewX(-20deg) translateX(350%); }
          100% { transform: skewX(-20deg) translateX(350%); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ══ Root — layered gradient mesh: near-black base + teal glow (left) + indigo glow (right) ══ */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          background: `
            radial-gradient(ellipse 70% 55% at 10% 25%,  rgba(13,148,136,0.16)  0%, transparent 60%),
            radial-gradient(ellipse 65% 55% at 88% 78%,  rgba(99,102,241,0.20)  0%, transparent 58%),
            radial-gradient(ellipse 45% 38% at 55% 5%,   rgba(99,102,241,0.09)  0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 80% 40%,  rgba(129,140,248,0.07) 0%, transparent 45%),
            linear-gradient(158deg, ${T.pageBg} 0%, ${T.pageBgMid} 55%, #1A3258 100%)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated grain overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: '-50%',
            width: '200%',
            height: '200%',
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            animation: 'grain-move 8s steps(10) infinite',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* ════════════════════════════════════════
            LEFT — Hero panel
        ════════════════════════════════════════ */}
        <div
          className="hidden lg:flex"
          style={{
            width: '52%',
            flexShrink: 0,
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 48px',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 1,
            /* Hero panel: slightly translucent surface above page-bg */
            background: `
              radial-gradient(ellipse 65% 48% at 28% 28%, rgba(13,148,136,0.10) 0%, transparent 60%),
              radial-gradient(ellipse 45% 38% at 82% 72%, rgba(99,102,241,0.10) 0%, transparent 55%),
              rgba(22,43,82,0.40)
            `,
            backdropFilter: 'blur(2px)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Teal glow — top-left, near logo / molecule */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', top: -130, left: -130,
              width: 420, height: 420, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(13,148,136,0.20) 0%, transparent 68%)',
              animation: 'glow-pulse 7s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
          {/* Indigo glow — bottom-right, creates second color family */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: -90, right: -90,
              width: 340, height: 340, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 68%)',
              animation: 'glow-pulse 9s ease-in-out infinite 1.5s',
              pointerEvents: 'none',
            }}
          />

          {/* ── Logo — teal allowed: brand mark ── */}
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" animate="visible"
            style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}
          >
            <div style={{
              width: 46, height: 46,
              background: `linear-gradient(135deg, ${T.tealDark} 0%, ${T.teal} 100%)`,
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(15,110,92,0.5), 0 0 0 1px rgba(13,148,136,0.3)',
            }}>
              <Pill size={22} color="#fff" />
            </div>
            <div>
              <div style={{ color: T.heading, fontWeight: 700, fontSize: 20, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.4px' }}>
                PharmaSys
              </div>
              <div style={{ color: T.muted, fontSize: 11, letterSpacing: '0.6px' }}>
                Pharmacy Management Platform
              </div>
            </div>
          </motion.div>

          {/* ── 3D Canvas ── */}
          <div style={{ flex: 1, position: 'relative', zIndex: 2, margin: '16px -48px' }}>
            <Suspense fallback={<div style={{ height: '100%' }} />}>
              <HeroCanvas />
            </Suspense>
          </div>

          {/* ── Headline + cards ── */}
          <div style={{ position: 'relative', zIndex: 2 }}>

            {/* "Live System" badge — indigo/violet accent, NOT teal */}
            <motion.div
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: T.indigoDim,
                border: `1px solid rgba(99,102,241,0.40)`,
                borderRadius: 20, padding: '5px 14px',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  backgroundColor: T.indigoLight,
                  display: 'inline-block',
                  boxShadow: `0 0 7px ${T.indigoLight}`,
                }} />
                <span style={{ fontSize: 12, color: T.body, fontWeight: 500 }}>
                  Live System
                </span>
              </div>
            </motion.div>

            {/* Headline — teal allowed on "dispensing point." (the ONE reserved headline use) */}
            <motion.h2
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              style={{
                color: T.heading, fontWeight: 700, fontSize: 38,
                lineHeight: 1.15, fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '-1px', margin: '0 0 14px',
              }}
            >
              Precision at every<br />
              <span style={{
                background: `linear-gradient(135deg, ${T.tealDark} 0%, ${T.teal} 55%, ${T.tealLight} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                dispensing point.
              </span>
            </motion.h2>

            <motion.p
              custom={3} variants={fadeUp} initial="hidden" animate="visible"
              style={{ color: T.body, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}
            >
              Full-spectrum pharmacy management — inventory, FEFO dispensing,
              sales, prescriptions, and live alerts in one place.
            </motion.p>

            {/* ── Feature cards — surface raised above page bg ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  custom={4 + i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    variants={{
                      rest:  { y: 0,  boxShadow: '0 4px 16px rgba(0,0,0,0.4)' },
                      hover: { y: -5, boxShadow: f.hoverShadow,
                               transition: { duration: 0.25, ease: 'easeOut' as const } },
                    }}
                    initial="rest"
                    whileHover="hover"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      /* Visibly raised surface — clearly lighter than page bg */
                      background: `linear-gradient(135deg, ${T.surface} 0%, ${T.surface2} 100%)`,
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14, padding: '13px 16px',
                      backdropFilter: 'blur(16px)',
                      cursor: 'default',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Per-card inner glow tinted to its accent */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, transparent 40%, ${f.innerGlow} 100%)`,
                      borderRadius: 14, pointerEvents: 'none',
                    }} />

                    {/* Icon */}
                    <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                      <f.Icon />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ color: T.heading, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                        {f.title}
                      </div>
                      <div style={{ color: T.body, fontSize: 11 }}>
                        {f.desc}
                      </div>
                    </div>

                    {/* Per-card accent bar (indigo / violet / amber) */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 3, borderRadius: '14px 0 0 14px',
                      background: f.accentBar, opacity: 0.85,
                    }} />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* ── Stats — indigo/violet (teal is reserved for logo/CTA/headline) ── */}
            <motion.div
              custom={8} variants={fadeUp} initial="hidden" animate="visible"
              style={{
                display: 'flex', gap: 32, paddingTop: 24, marginTop: 20,
                borderTop: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {[['200+', 'Products tracked'], ['FEFO', 'Smart dispensing'], ['Live', 'Stock alerts']].map(([stat, label]) => (
                <div key={stat}>
                  <div style={{
                    color: T.indigoLight, fontWeight: 700, fontSize: 20,
                    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px',
                    textShadow: `0 0 20px ${T.indigoDim}`,
                  }}>
                    {stat}
                  </div>
                  <div style={{ color: T.muted, fontSize: 11 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT — Login panel
        ════════════════════════════════════════ */}
        <div
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 32px',
            position: 'relative', zIndex: 1,
            /* Right panel: indigo glow, no teal */
            background: `
              radial-gradient(ellipse 60% 50% at 72% 28%, rgba(99,102,241,0.10) 0%, transparent 60%),
              rgba(22,43,82,0.18)
            `,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{ width: '100%', maxWidth: 390 }}>

            {/* Mobile logo — teal allowed: brand mark */}
            <motion.div
              custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="flex lg:hidden"
              style={{ alignItems: 'center', gap: 12, marginBottom: 32 }}
            >
              <div style={{
                width: 38, height: 38,
                background: `linear-gradient(135deg, ${T.tealDark}, ${T.teal})`,
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(15,110,92,0.45)',
              }}>
                <Pill size={19} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: T.heading, fontFamily: "'Space Grotesk', sans-serif" }}>
                PharmaSys
              </span>
            </motion.div>

            {/* ── Login card — clearly raised surface: solid dark slate, not glass ambiguity ── */}
            <motion.div
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              style={{
                /* Solid raised surface — distinctly lighter than page background */
                background: `linear-gradient(148deg, ${T.surface} 0%, ${T.surface2} 100%)`,
                borderRadius: 24,
                padding: '40px 40px 36px',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(28px)',
                boxShadow: `
                  0 0 0 1px rgba(99,102,241,0.10),
                  0 2px 0 rgba(255,255,255,0.05) inset,
                  0 32px 80px rgba(0,0,0,0.65),
                  0 8px 24px rgba(0,0,0,0.45)
                `,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Indigo inner glow — top-right corner */}
              <div aria-hidden="true" style={{
                position: 'absolute', top: -70, right: -70,
                width: 220, height: 220, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 68%)',
                pointerEvents: 'none',
              }} />
              {/* Subtle teal glint — bottom-left, very dim */}
              <div aria-hidden="true" style={{
                position: 'absolute', bottom: -50, left: -50,
                width: 160, height: 160, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 65%)',
                pointerEvents: 'none',
              }} />

              {/* Heading */}
              <div style={{ marginBottom: 30, position: 'relative' }}>
                <h1 style={{
                  fontSize: 27, fontWeight: 700, color: T.heading,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.5px', margin: '0 0 7px',
                }}>
                  Welcome back 👋
                </h1>
                <p style={{ fontSize: 13, color: T.body, margin: 0, lineHeight: 1.5 }}>
                  Sign in to your PharmaSys account to continue
                </p>
              </div>

              {/* ── Form — logic completely untouched ── */}
              <form onSubmit={handleSubmit} id="login-form" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.body, marginBottom: 7 }}
                  >
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="admin@pharmacy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    style={{
                      display: 'block', width: '100%', borderRadius: 12,
                      border: `1.5px solid ${T.inputBdr}`,
                      fontSize: 14, color: T.heading,
                      /* Input bg is distinctly darker than card surface */
                      background: T.inputBg,
                      padding: '12px 15px',
                      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                      boxSizing: 'border-box',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0d9488';
                      e.target.style.background = 'rgba(13,148,136,0.08)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.18)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                      e.target.style.background = T.inputBg;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="login-password"
                    style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.body, marginBottom: 7 }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      style={{
                        display: 'block', width: '100%', borderRadius: 12,
                        border: `1.5px solid ${T.inputBdr}`,
                        fontSize: 14, color: T.heading,
                        background: T.inputBg,
                        padding: '12px 44px 12px 15px',
                        outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                        boxSizing: 'border-box',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0d9488';
                        e.target.style.background = 'rgba(13,148,136,0.08)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.18)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                        e.target.style.background = T.inputBg;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: T.muted, padding: 4,
                        display: 'flex', alignItems: 'center',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = T.body}
                      onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = T.muted}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <div style={{
                      marginTop: 9, padding: '9px 13px', borderRadius: 10,
                      background: 'rgba(192,57,43,0.15)',
                      border: '1px solid rgba(192,57,43,0.35)',
                      fontSize: 12, color: '#FC8181', fontWeight: 500,
                    }}>
                      {error}
                    </div>
                  )}
                </div>

                {/* Submit — teal allowed: primary CTA ── */}
                <motion.button
                  type="submit"
                  id="login-submit"
                  disabled={loading}
                  whileHover={loading ? {} : { scale: 1.02, boxShadow: '0 12px 40px rgba(13,148,136,0.65)' }}
                  whileTap={loading ? {} : { scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '14px 20px', borderRadius: 14, border: 'none',
                    background: loading
                      ? `${T.surface2}`
                      : `linear-gradient(135deg, ${T.tealDark} 0%, ${T.teal} 60%, ${T.tealLight} 100%)`,
                    color: loading ? T.muted : '#fff',
                    fontSize: 15, fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 6px 24px rgba(13,148,136,0.45)',
                    transition: 'background 0.25s, color 0.25s',
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: '-0.1px', marginTop: 4,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Shimmer sweep */}
                  {!loading && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                      transform: 'skewX(-20deg) translateX(-150%)',
                      animation: 'shimmer 3s ease-in-out infinite',
                    }} />
                  )}
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                    : <>Sign in <ArrowRight size={16} /></>
                  }
                </motion.button>
              </form>

              {/* Demo credentials — muted text, surface-2 bg */}
              <div style={{
                marginTop: 22, padding: '12px 15px', borderRadius: 12,
                background: T.surface2,
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <p style={{ fontSize: 11, color: T.muted, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                  <strong style={{ color: T.body }}>Demo:</strong>{' '}
                  admin@pharmacy.com / Admin@1234
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};
