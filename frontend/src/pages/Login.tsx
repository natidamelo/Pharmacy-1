import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import toast from 'react-hot-toast';

/* ── Demo accounts ───────────────────────────────── */
const DEMO_ACCOUNTS = [
  { role: 'Admin',       email: 'admin@pharmacy.com',      pass: 'Admin@1234', badge: 'Full access' },
  { role: 'Pharmacist',  email: 'pharmacist@pharmacy.com', pass: 'Admin@1234', badge: 'Rx operations' },
  { role: 'Cashier',     email: 'cashier@pharmacy.com',    pass: 'Admin@1234', badge: 'POS & sales' },
];

/* ── Left-panel data points ──────────────────────── */
const STATS = [
  { value: '480+',  label: 'pharmacies' },
  { value: '2.4M',  label: 'dispensed / month' },
  { value: '99.7%', label: 'uptime SLA' },
];

const CAPABILITIES = [
  { num: '01', title: 'Intake',   body: 'Validate prescriptions and check interactions before you reach the shelf.' },
  { num: '02', title: 'Dispense', body: 'Pick, confirm lot and expiry, print label — stock updates in real time.' },
  { num: '03', title: 'Track',    body: 'Full chain-of-custody log. Audit reports in seconds, not a morning.' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const Login: React.FC = () => {
  const navigate  = useNavigate();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const { theme, toggleTheme } = useTheme();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(true);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const handleDemoFill = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedDemo(acc.role);
    setError('');
    toast.success(`Loaded ${acc.role} credentials`, { icon: '⚡', duration: 1800 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(email, password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user?.name || 'User'}!`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">

      {/* ══ LEFT — brand panel ══════════════════════════════════ */}
      <div className="login-left" aria-hidden="true">

        {/* Background texture */}
        <div className="login-left__bg">
          <div className="login-left__grid" />
          <div className="login-left__glow login-left__glow--a" />
          <div className="login-left__glow login-left__glow--b" />
        </div>

        {/* Logo */}
        <Link to="/" className="login-left__logo" tabIndex={-1}>
          <span className="login-left__logo-hex" aria-hidden="true">⬡</span>
          <span className="login-left__logo-text">Pharma<strong>Sys</strong></span>
        </Link>

        {/* Hero copy */}
        <div className="login-left__hero">
          <p className="login-left__eyebrow">
            <span className="login-left__eyebrow-line" />
            Pharmacy management
          </p>

          <h1 className="login-left__headline">
            Every dispensed<br />unit,<br />accounted for.
          </h1>

          <p className="login-left__sub">
            One system for intake, dispensing, inventory,
            billing and compliance — designed on the
            dispensary floor, not in a boardroom.
          </p>

          {/* Stats row */}
          <div className="login-left__stats">
            {STATS.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="login-left__stat-sep" aria-hidden="true" />}
                <div className="login-left__stat">
                  <span className="login-left__stat-num">{s.value}</span>
                  <span className="login-left__stat-label">{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Capability list */}
        <div className="login-left__caps">
          {CAPABILITIES.map((c) => (
            <div key={c.num} className="login-left__cap">
              <span className="login-left__cap-num">{c.num}</span>
              <div>
                <span className="login-left__cap-title">{c.title}</span>
                <span className="login-left__cap-body">{c.body}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer strip */}
        <div className="login-left__foot">
          <span className="login-left__online">
            <span className="login-left__dot" />
            System online · 99.7% uptime
          </span>
          <span>AES-256 · HIPAA aligned</span>
        </div>
      </div>

      {/* ══ RIGHT — auth form ══════════════════════════════════ */}
      <div className="login-right">

        {/* Top bar */}
        <div className="login-right__topbar">
          {/* Mobile logo */}
          <Link to="/" className="login-right__mobile-logo">
            <span aria-hidden="true">⬡</span>
            Pharma<strong>Sys</strong>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <button
              onClick={toggleTheme}
              className="login-theme-toggle"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
            <a href="mailto:support@pharmasys.com" className="login-right__support">
              Contact support
            </a>
          </div>
        </div>

        {/* Form card */}
        <motion.div
          className="login-form-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Greeting */}
          <div className="login-form__header">
            <h2 className="login-form__greeting">
              {getGreeting()} —<br />sign in below.
            </h2>
            <p className="login-form__sub">
              Access your PharmaSys portal.
            </p>
          </div>

          {/* Demo quick-fill */}
          <div className="login-demo">
            <div className="login-demo__header">
              <span className="login-demo__label">Quick demo login</span>
              <span className="login-demo__hint">click to fill</span>
            </div>
            <div className="login-demo__grid">
              {DEMO_ACCOUNTS.map((acc) => {
                const active = selectedDemo === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleDemoFill(acc)}
                    className={`login-demo__btn${active ? ' login-demo__btn--active' : ''}`}
                  >
                    {active && (
                      <span className="login-demo__check" aria-hidden="true">
                        <Check size={11} />
                      </span>
                    )}
                    <span className="login-demo__role">{acc.role}</span>
                    <span className="login-demo__badge">{acc.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email" className="login-field__label">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                className="login-field__input"
                placeholder="name@pharmacy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-field__row">
                <label htmlFor="login-password" className="login-field__label">
                  Password
                </label>
                <button
                  type="button"
                  className="login-field__forgot"
                  onClick={() => toast('Contact your administrator to reset credentials.', { icon: 'ℹ️' })}
                >
                  Forgot password?
                </button>
              </div>
              <div className="login-field__pw-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-field__input login-field__input--pw"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-field__eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="login-remember">
              <input
                type="checkbox"
                className="login-remember__check"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="login-remember__label">Keep me signed in</span>
            </label>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="login-error"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0,  height: 'auto' }}
                  exit={  { opacity: 0, y: -6, height: 0 }}
                >
                  <AlertCircle size={15} className="login-error__icon" aria-hidden="true" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="login-submit"
            >
              {loading ? (
                <><Loader2 size={17} className="login-submit__spinner" /> Authenticating…</>
              ) : (
                <>Sign in to portal <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Back to marketing */}
          <p className="login-back">
            <Link to="/" className="login-back__link">← Back to site</Link>
          </p>
        </motion.div>

        {/* Bottom copyright */}
        <div className="login-right__foot">
          <span>© {new Date().getFullYear()} PharmaSys · Secure Health Data Encryption</span>
        </div>
      </div>

      {/* ══ Scoped styles ══════════════════════════════════════ */}
      <style>{`
        /* ── Tokens (shadows the app's global vars only inside .login-root) */
        .login-root {
          --lk-primary:        #1B4B43;
          --lk-primary-dark:   #122e29;
          --lk-bg:             #F7F5F0;
          --lk-accent:         #9C6B2E;
          --lk-accent-light:   #C2873C;
          --lk-accent-pale:    #F2EAD8;
          --lk-ink:            #16211D;
          --lk-ink-muted:      #3D5A50;
          --lk-ink-subtle:     #6B8079;
          --lk-surface:        #DCE5DE;
          --lk-border:         #C8D4C4;
          --lk-border-light:   #E3EBE4;
          --lk-input-bg:       #FFFFFF;
          --lk-error:          #9B2335;

          --lk-font-display: 'Fraunces', Georgia, serif;
          --lk-font-body:    'Inter', system-ui, sans-serif;
          --lk-font-mono:    'IBM Plex Mono', monospace;

          --lk-ease: cubic-bezier(0.16, 1, 0.3, 1);

          min-height: 100svh;
          display: flex;
          font-family: var(--lk-font-body);
          background-color: var(--lk-bg);
          color: var(--lk-ink);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Dark Mode Overrides for Login ───────────────────── */
        .login-root[data-theme="dark"],
        .login-root.dark,
        [data-theme="dark"] .login-root,
        .dark .login-root {
          --lk-bg:              #0A1916;
          --lk-ink:             #F4F1EA;
          --lk-ink-muted:       #9EB5AD;
          --lk-ink-subtle:      #6D8B81;
          --lk-border:          #1E3F37;
          --lk-border-light:    #152E28;
          --lk-surface:         #122B25;
          --lk-surface-hover:   #1A3932;
          --lk-input-bg:        #0E211D;
        }

        .login-theme-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid var(--lk-border);
          color: var(--lk-ink);
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
        }

        .login-theme-toggle:hover {
          background-color: var(--lk-surface);
          border-color: var(--lk-accent);
          color: var(--lk-accent);
          transform: rotate(15deg);
        }

        .login-root * { box-sizing: border-box; }

        .login-root :focus-visible {
          outline: 2px solid var(--lk-accent);
          outline-offset: 3px;
          border-radius: 4px;
        }

        /* ══ LEFT PANEL ════════════════════════════════════════ */
        .login-left {
          position: relative;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 50%;
          min-height: 100svh;
          padding: 3rem 3.5rem;
          background-color: var(--lk-primary-dark);
          overflow: hidden;
        }

        @media (min-width: 1024px) { .login-left { display: flex; } }
        @media (min-width: 1280px) { .login-left { width: 55%; padding: 3.5rem 4rem; } }

        /* Background */
        .login-left__bg { position: absolute; inset: 0; pointer-events: none; }

        .login-left__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(247,245,240,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(247,245,240,.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 90% 90% at 30% 60%, black 20%, transparent 80%);
        }

        .login-left__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .login-left__glow--a {
          width: 480px; height: 480px;
          top: -100px; left: -100px;
          background: radial-gradient(circle, rgba(156,107,46,.18), transparent 70%);
        }
        .login-left__glow--b {
          width: 360px; height: 360px;
          bottom: -80px; right: -60px;
          background: radial-gradient(circle, rgba(27,75,67,.35), transparent 70%);
        }

        /* Logo */
        .login-left__logo {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #F7F5F0;
          font-family: var(--lk-font-body);
          font-size: 1.0625rem;
          letter-spacing: -0.01em;
        }
        .login-left__logo-hex { color: var(--lk-accent-light); font-size: 1.2rem; }
        .login-left__logo-text strong { color: var(--lk-accent-light); font-weight: 700; }

        /* Hero copy */
        .login-left__hero {
          position: relative;
          margin-block: auto;
          padding-block: 2rem;
        }

        .login-left__eyebrow {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-family: var(--lk-font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--lk-accent-light);
          margin-bottom: 1.25rem;
        }
        .login-left__eyebrow-line {
          display: block; width: 20px; height: 1.5px;
          background-color: var(--lk-accent-light);
        }

        .login-left__headline {
          font-family: var(--lk-font-display);
          font-size: clamp(2.5rem, 3.5vw, 3.5rem);
          font-weight: 700;
          color: #F7F5F0;
          letter-spacing: -0.025em;
          line-height: 1.1;
          margin-bottom: 1.25rem;
        }

        .login-left__sub {
          font-family: var(--lk-font-body);
          font-size: 0.9375rem;
          color: rgba(247,245,240,.6);
          line-height: 1.65;
          max-width: 380px;
          margin-bottom: 2rem;
        }

        /* Stats */
        .login-left__stats {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          padding: 1.25rem 1.5rem;
          background: rgba(247,245,240,.05);
          border: 1px solid rgba(247,245,240,.1);
          border-radius: 10px;
          backdrop-filter: blur(8px);
        }
        .login-left__stat { display: flex; flex-direction: column; gap: 2px; }
        .login-left__stat-num {
          font-family: var(--lk-font-display);
          font-size: 1.5rem;
          font-weight: 600;
          color: #F7F5F0;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .login-left__stat-label {
          font-family: var(--lk-font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.04em;
          color: rgba(247,245,240,.45);
        }
        .login-left__stat-sep {
          width: 1px; height: 32px;
          background: rgba(247,245,240,.12);
        }

        /* Capabilities */
        .login-left__caps {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border-top: 1px solid rgba(247,245,240,.1);
          padding-top: 1.75rem;
        }
        .login-left__cap {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .login-left__cap-num {
          font-family: var(--lk-font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--lk-accent-light);
          letter-spacing: 0.08em;
          flex-shrink: 0;
          padding-top: 2px;
          width: 28px;
        }
        .login-left__cap-title {
          display: block;
          font-family: var(--lk-font-body);
          font-weight: 600;
          font-size: 0.875rem;
          color: #F7F5F0;
          margin-bottom: 2px;
        }
        .login-left__cap-body {
          display: block;
          font-size: 0.8125rem;
          color: rgba(247,245,240,.5);
          line-height: 1.5;
        }

        /* Left foot */
        .login-left__foot {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(247,245,240,.08);
          font-family: var(--lk-font-mono);
          font-size: 0.6875rem;
          letter-spacing: 0.04em;
          color: rgba(247,245,240,.3);
        }
        .login-left__online {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .login-left__dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 2px rgba(74,222,128,.25);
        }

        /* ══ RIGHT PANEL ═══════════════════════════════════════ */
        .login-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100svh;
          background-color: var(--lk-bg);
          padding: 1.75rem 1.5rem;
          position: relative;
        }

        @media (min-width: 640px)  { .login-right { padding: 2.5rem; } }
        @media (min-width: 1024px) { .login-right { padding: 3rem 3.5rem; } }

        /* Top bar */
        .login-right__topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .login-right__mobile-logo {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-family: var(--lk-font-body);
          font-size: 1rem; letter-spacing: -0.01em;
          color: var(--lk-ink); text-decoration: none;
        }
        .login-right__mobile-logo strong { color: var(--lk-primary); font-weight: 700; }
        .login-right__mobile-logo span   { color: var(--lk-primary); font-size: 1.1rem; }

        @media (min-width: 1024px) { .login-right__mobile-logo { display: none; } }

        .login-right__support {
          margin-left: auto;
          font-size: 0.8125rem;
          color: var(--lk-ink-subtle);
          text-decoration: none;
          transition: color 0.15s;
        }
        .login-right__support:hover { color: var(--lk-primary); }

        /* Form wrap */
        .login-form-wrap {
          max-width: 420px;
          width: 100%;
          margin: auto;
          padding-block: 1rem;
        }

        /* Header */
        .login-form__header { margin-bottom: 1.75rem; }

        .login-form__greeting {
          font-family: var(--lk-font-display);
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 600;
          color: var(--lk-ink);
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 0.5rem;
        }

        .login-form__sub {
          font-size: 0.9rem;
          color: var(--lk-ink-subtle);
        }

        /* Demo quick-fill */
        .login-demo {
          background: var(--lk-surface);
          border: 1px solid var(--lk-border-light);
          border-radius: 10px;
          padding: 1rem 1.125rem;
          margin-bottom: 1.5rem;
        }
        .login-demo__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .login-demo__label {
          font-family: var(--lk-font-mono);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--lk-ink-muted);
        }
        .login-demo__hint {
          font-family: var(--lk-font-mono);
          font-size: 0.6875rem;
          color: var(--lk-ink-subtle);
        }
        .login-demo__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.625rem;
        }
        .login-demo__btn {
          position: relative;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 2px;
          padding: 0.625rem 0.5rem;
          background: var(--lk-bg);
          border: 1.5px solid var(--lk-border);
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.15s, background-color 0.15s, transform 0.15s;
          font-family: var(--lk-font-body);
        }
        .login-demo__btn:hover {
          border-color: var(--lk-primary);
          background-color: rgba(27,75,67,.04);
        }
        .login-demo__btn--active {
          border-color: var(--lk-primary);
          background-color: rgba(27,75,67,.07);
          transform: scale(1.02);
        }
        .login-demo__check {
          position: absolute; top: 4px; right: 5px;
          color: var(--lk-primary);
        }
        .login-demo__role {
          font-size: 0.8125rem; font-weight: 600;
          color: var(--lk-ink);
        }
        .login-demo__badge {
          font-family: var(--lk-font-mono);
          font-size: 0.625rem;
          color: var(--lk-ink-subtle);
          letter-spacing: 0.02em;
        }

        /* Fields */
        .login-form { display: flex; flex-direction: column; gap: 1rem; }

        .login-field { display: flex; flex-direction: column; gap: 0.375rem; }

        .login-field__row {
          display: flex; align-items: center; justify-content: space-between;
        }

        .login-field__label {
          font-family: var(--lk-font-body);
          font-size: 0.8125rem; font-weight: 600;
          color: var(--lk-ink-muted);
        }

        .login-field__forgot {
          font-family: var(--lk-font-body);
          font-size: 0.8rem; font-weight: 500;
          color: var(--lk-accent);
          background: none; border: none; cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }
        .login-field__forgot:hover { color: var(--lk-accent-light); }

        .login-field__input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--lk-input-bg);
          border: 1.5px solid var(--lk-border);
          border-radius: 8px;
          font-family: var(--lk-font-body);
          font-size: 0.9375rem;
          color: var(--lk-ink);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-field__input::placeholder { color: var(--lk-ink-subtle); opacity: 0.6; }
        .login-field__input:focus {
          border-color: var(--lk-primary);
          box-shadow: 0 0 0 3px rgba(27,75,67,.12);
        }

        .login-field__pw-wrap { position: relative; }
        .login-field__input--pw { padding-right: 2.75rem; }

        .login-field__eye {
          position: absolute; inset-y: 0; right: 0;
          display: flex; align-items: center;
          padding: 0 0.875rem;
          background: none; border: none; cursor: pointer;
          color: var(--lk-ink-subtle);
          transition: color 0.15s;
        }
        .login-field__eye:hover { color: var(--lk-primary); }

        /* Remember */
        .login-remember {
          display: flex; align-items: center; gap: 0.625rem;
          cursor: pointer; user-select: none;
        }
        .login-remember__check {
          width: 16px; height: 16px;
          border-radius: 4px;
          accent-color: var(--lk-primary);
          cursor: pointer;
        }
        .login-remember__label {
          font-size: 0.875rem; font-weight: 500;
          color: var(--lk-ink-muted);
        }

        /* Error */
        .login-error {
          display: flex; align-items: flex-start; gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: rgba(155,35,53,.07);
          border: 1px solid rgba(155,35,53,.25);
          border-radius: 8px;
          font-size: 0.8125rem; font-weight: 500;
          color: var(--lk-error);
          overflow: hidden;
        }
        .login-error__icon { flex-shrink: 0; margin-top: 1px; }

        /* Submit */
        .login-submit {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.5rem;
          margin-top: 0.25rem;
          background-color: var(--lk-primary);
          color: #fff;
          font-family: var(--lk-font-body);
          font-size: 0.9375rem; font-weight: 600;
          border: none; border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(27,75,67,.25), 0 4px 12px rgba(27,75,67,.18);
          transition: background-color 0.15s, box-shadow 0.15s, transform 0.12s;
        }
        .login-submit:hover:not(:disabled) {
          background-color: #246059;
          box-shadow: 0 2px 8px rgba(27,75,67,.3), 0 8px 24px rgba(27,75,67,.18);
          transform: translateY(-1px);
        }
        .login-submit:active:not(:disabled) { transform: translateY(0); }
        .login-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .login-submit__spinner { animation: spin 0.9s linear infinite; }

        /* Back link */
        .login-back {
          margin-top: 1.25rem;
          text-align: center;
          font-size: 0.875rem;
        }
        .login-back__link {
          color: var(--lk-ink-subtle);
          text-decoration: none;
          transition: color 0.15s;
        }
        .login-back__link:hover { color: var(--lk-primary); }

        /* Right foot */
        .login-right__foot {
          text-align: center;
          font-family: var(--lk-font-mono);
          font-size: 0.6875rem;
          letter-spacing: 0.03em;
          color: var(--lk-ink-subtle);
          padding-top: 1.5rem;
          border-top: 1px solid var(--lk-border-light);
          margin-top: 1.5rem;
        }

        /* ── Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .login-submit,
          .login-field__input,
          .login-demo__btn,
          .login-left__dot {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
