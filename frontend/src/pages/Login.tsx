import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════════════════
   SIMPLIFIED LOGIN PAGE (/login)
   Focuses purely on authentication: brand logo + centered login card.
   Sign-in state, submit logic, validation & demo credentials note intact.
══════════════════════════════════════════════════════════════════════ */
export const Login: React.FC = () => {
  const navigate    = useNavigate();
  const setAuth     = useAuthStore((s) => s.setAuth);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  /* ── Auth submission logic — completely untouched ── */
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

  /* ── Form field style helpers ── */
  const inputBase: React.CSSProperties = {
    display: 'block', width: '100%', boxSizing: 'border-box',
    borderRadius: 12, border: '1.5px solid #E2E8F0',
    fontSize: 14, color: '#0F172A', background: '#FFFFFF',
    padding: '12px 15px', outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#059669';
    e.target.style.boxShadow   = '0 0 0 3px rgba(5,150,105,0.14)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E2E8F0';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">

      {/* ── Soft background radial glows ── */}
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(167,243,208,0.30) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 right-10 w-[400px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(204,251,241,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      {/* ── Header: Brand logo + Link back to home ── */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between relative z-10 pt-2 pb-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            style={{ background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20"
          >
            <Pill size={18} color="#fff" strokeWidth={2.4} />
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-slate-900">Pharma</span>
            <span className="text-emerald-600">Sys</span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>

      {/* ── Center: Focused Sign-In Card ── */}
      <div className="max-w-md w-full mx-auto relative z-10 my-auto">
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xl shadow-slate-200/50">
          
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">
              Welcome back 👋
            </h1>
            <p className="text-sm text-slate-500">
              Sign in to your PharmaSys account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} id="login-form" className="space-y-4">

            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                style={inputBase}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ ...inputBase, paddingRight: 44 }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Validation Error Alert */}
              {error && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold">
                  {error}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              style={{
                background: loading
                  ? '#CBD5E1'
                  : 'linear-gradient(135deg, #059669 0%, #0d9488 60%, #14b8a6 100%)',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(5,150,105,0.35)',
              }}
              className="w-full py-3.5 px-5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-200 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Note */}
          <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <p className="text-xs text-slate-600 margin-0">
              <strong className="text-slate-900 font-bold">Demo:</strong> admin@pharmacy.com / Admin@1234
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="max-w-md w-full mx-auto text-center relative z-10 pt-6 pb-2">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} PharmaSys Inc. • Secure Healthcare Portal
        </p>
      </div>
    </div>
  );
};
