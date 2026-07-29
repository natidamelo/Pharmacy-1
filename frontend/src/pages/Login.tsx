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

const cardHover = {
  rest: { y: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' },
  hover: {
    y: -5,
    boxShadow: '0 16px 40px rgba(13,148,136,0.35)',
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
};

/* ── Custom SVG icon art for feature cards ──────────────────────────── */
const FefoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="rgba(13,148,136,0.15)" />
    {/* Capsule shape */}
    <rect x="10" y="13" width="7" height="10" rx="3.5" fill="#34d399" />
    <rect x="19" y="13" width="7" height="10" rx="3.5" fill="#0d9488" />
    {/* Arrow */}
    <path d="M8 26 L28 26" stroke="#5eead4" strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M25 23 L28 26 L25 29" stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="rgba(13,148,136,0.15)" />
    {/* Bar chart bars */}
    <rect x="9"  y="22" width="4" height="6" rx="1.5" fill="#5eead4" />
    <rect x="15" y="17" width="4" height="11" rx="1.5" fill="#34d399" />
    <rect x="21" y="13" width="4" height="15" rx="1.5" fill="#0d9488" />
    {/* Trend line */}
    <path d="M11 21 L17 16 L23 12" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="23" cy="12" r="1.5" fill="#0d9488" />
  </svg>
);

const AlertIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="rgba(13,148,136,0.15)" />
    {/* Bell */}
    <path d="M18 8 C14 8 12 11 12 14 L12 20 L10 22 L26 22 L24 20 L24 14 C24 11 22 8 18 8 Z" fill="#0d9488" />
    <rect x="16" y="23" width="4" height="2.5" rx="1.25" fill="#34d399" />
    {/* Dot */}
    <circle cx="24" cy="10" r="3" fill="#34d399" stroke="#0F1923" strokeWidth="1.5" />
  </svg>
);

const features = [
  {
    Icon: FefoIcon,
    title: 'FEFO Dispensing',
    desc: 'First-Expired-First-Out batch tracking',
    accent: '#34d399',
  },
  {
    Icon: AnalyticsIcon,
    title: 'Live Analytics',
    desc: 'Real-time sales and inventory insights',
    accent: '#0d9488',
  },
  {
    Icon: AlertIcon,
    title: 'Smart Alerts',
    desc: 'Proactive low stock and expiry warnings',
    accent: '#5eead4',
  },
];

/* ── Grain SVG filter ───────────────────────────────────────────────── */
const GrainFilter = () => (
  <svg style={{ position: 'fixed', width: 0, height: 0 }}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feBlend in="SourceGraphic" mode="multiply" />
    </filter>
  </svg>
);

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
      <GrainFilter />

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 1; }
          75%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
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
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ══ Root ══ */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          /* Layered gradient mesh background */
          background: `
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(13,148,136,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 80%, rgba(15,110,92,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 10%, rgba(52,211,153,0.08) 0%, transparent 50%),
            linear-gradient(160deg, #060D12 0%, #0A1628 45%, #0D1F1A 100%)
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
            opacity: 0.045,
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
            /* Layered panel depth */
            background: `
              radial-gradient(ellipse 70% 50% at 30% 30%, rgba(13,148,136,0.12) 0%, transparent 65%),
              radial-gradient(ellipse 50% 40% at 80% 70%, rgba(52,211,153,0.07) 0%, transparent 55%),
              rgba(6,13,18,0.55)
            `,
            backdropFilter: 'blur(2px)',
            borderRight: '1px solid rgba(13,148,136,0.1)',
          }}
        >
          {/* Glowing orb top-left */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', top: -120, left: -120,
              width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 70%)',
              animation: 'glow-pulse 6s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
          {/* Glowing orb bottom-right */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: -80, right: -80,
              width: 320, height: 320, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 70%)',
              animation: 'glow-pulse 8s ease-in-out infinite 2s',
              pointerEvents: 'none',
            }}
          />

          {/* ── Logo ── */}
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" animate="visible"
            style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}
          >
            <div style={{
              width: 46, height: 46,
              background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(15,110,92,0.5), 0 0 0 1px rgba(13,148,136,0.3)',
            }}>
              <Pill size={22} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.4px' }}>
                PharmaSys
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '0.6px' }}>
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
            {/* Live badge */}
            <motion.div
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(13,148,136,0.15)',
                border: '1px solid rgba(13,148,136,0.35)',
                borderRadius: 20, padding: '5px 14px',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9488', display: 'inline-block', boxShadow: '0 0 6px #0d9488' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  Live System
                </span>
              </div>
            </motion.div>

            <motion.h2
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              style={{
                color: '#ffffff', fontWeight: 700, fontSize: 38,
                lineHeight: 1.15, fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '-1px', margin: '0 0 14px',
              }}
            >
              Precision at every<br />
              <span style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #34d399 60%, #5eead4 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                dispensing point.
              </span>
            </motion.h2>

            <motion.p
              custom={3} variants={fadeUp} initial="hidden" animate="visible"
              style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}
            >
              Full-spectrum pharmacy management — inventory, FEFO dispensing,
              sales, prescriptions, and live alerts in one place.
            </motion.p>

            {/* ── Feature cards ── */}
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
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(13,148,136,0.06) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 14, padding: '13px 16px',
                      backdropFilter: 'blur(12px)',
                      cursor: 'default',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Card inner glow on hover accent */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, transparent 40%, rgba(13,148,136,0.08) 100%)`,
                      borderRadius: 14, pointerEvents: 'none',
                    }} />

                    {/* Icon */}
                    <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                      <f.Icon />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                        {f.title}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11 }}>
                        {f.desc}
                      </div>
                    </div>

                    {/* Accent line */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 3, borderRadius: '14px 0 0 14px',
                      background: f.accent, opacity: 0.7,
                    }} />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* ── Stats bar ── */}
            <motion.div
              custom={8} variants={fadeUp} initial="hidden" animate="visible"
              style={{
                display: 'flex', gap: 32, paddingTop: 24, marginTop: 20,
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {[['200+', 'Products tracked'], ['FEFO', 'Smart dispensing'], ['Live', 'Stock alerts']].map(([stat, label]) => (
                <div key={stat}>
                  <div style={{
                    color: '#0d9488', fontWeight: 700, fontSize: 20,
                    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px',
                    textShadow: '0 0 20px rgba(13,148,136,0.5)',
                  }}>
                    {stat}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{label}</div>
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
            background: `
              radial-gradient(ellipse 60% 50% at 70% 30%, rgba(13,148,136,0.08) 0%, transparent 60%),
              rgba(10,22,40,0.35)
            `,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{ width: '100%', maxWidth: 390 }}>

            {/* Mobile logo */}
            <motion.div
              custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="flex lg:hidden"
              style={{ alignItems: 'center', gap: 12, marginBottom: 32 }}
            >
              <div style={{
                width: 38, height: 38,
                background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(15,110,92,0.45)',
              }}>
                <Pill size={19} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
                PharmaSys
              </span>
            </motion.div>

            {/* ── Glass login card ── */}
            <motion.div
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: 24,
                padding: '40px 40px 36px',
                border: '1px solid rgba(255,255,255,0.13)',
                backdropFilter: 'blur(24px)',
                boxShadow: `
                  0 0 0 1px rgba(13,148,136,0.12),
                  0 24px 60px rgba(0,0,0,0.45),
                  0 8px 20px rgba(0,0,0,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.12)
                `,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Card inner glow */}
              <div aria-hidden="true" style={{
                position: 'absolute', top: -60, right: -60,
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Heading */}
              <div style={{ marginBottom: 30, position: 'relative' }}>
                <h1 style={{
                  fontSize: 27, fontWeight: 700, color: '#fff',
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.5px', margin: '0 0 7px',
                }}>
                  Welcome back 👋
                </h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                  Sign in to your PharmaSys account to continue
                </p>
              </div>

              {/* ── Form — logic untouched ── */}
              <form onSubmit={handleSubmit} id="login-form" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 7 }}
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
                      border: '1.5px solid rgba(255,255,255,0.14)',
                      fontSize: 14, color: '#fff',
                      background: 'rgba(255,255,255,0.07)',
                      padding: '12px 15px',
                      outline: 'none', transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0d9488';
                      e.target.style.background = 'rgba(13,148,136,0.1)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.14)';
                      e.target.style.background = 'rgba(255,255,255,0.07)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="login-password"
                    style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 7 }}
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
                        border: '1.5px solid rgba(255,255,255,0.14)',
                        fontSize: 14, color: '#fff',
                        background: 'rgba(255,255,255,0.07)',
                        padding: '12px 44px 12px 15px',
                        outline: 'none', transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0d9488';
                        e.target.style.background = 'rgba(13,148,136,0.1)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.14)';
                        e.target.style.background = 'rgba(255,255,255,0.07)';
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
                        color: 'rgba(255,255,255,0.35)', padding: 4,
                        display: 'flex', alignItems: 'center',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'}
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

                {/* Submit */}
                <motion.button
                  type="submit"
                  id="login-submit"
                  disabled={loading}
                  whileHover={loading ? {} : { scale: 1.02, boxShadow: '0 10px 36px rgba(13,148,136,0.65)' }}
                  whileTap={loading ? {} : { scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '14px 20px', borderRadius: 14, border: 'none',
                    background: loading
                      ? 'rgba(255,255,255,0.12)'
                      : 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 60%, #34d399 100%)',
                    color: '#fff', fontSize: 15, fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 6px 24px rgba(13,148,136,0.45)',
                    transition: 'background 0.25s',
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: '-0.1px', marginTop: 4,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Shimmer */}
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

              {/* Demo credentials */}
              <div style={{
                marginTop: 22, padding: '12px 15px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
              }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                  <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Demo:</strong>{' '}
                  admin@pharmacy.com / Admin@1234
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: skewX(-20deg) translateX(-150%); }
          60%  { transform: skewX(-20deg) translateX(350%); }
          100% { transform: skewX(-20deg) translateX(350%); }
        }
      `}</style>
    </>
  );
};
