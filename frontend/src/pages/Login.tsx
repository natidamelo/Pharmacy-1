import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  Activity,
  Zap,
  Check,
  LockKeyhole,
  Building2,
  AlertCircle
} from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

/* ── Demo Accounts Preset Data ── */
const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@pharmacy.com',
    pass: 'Admin@1234',
    badge: 'Full Access',
  },
  {
    role: 'Pharmacist',
    email: 'pharmacist@pharmacy.com',
    pass: 'Admin@1234',
    badge: 'Rx Operations',
  },
  {
    role: 'Cashier',
    email: 'cashier@pharmacy.com',
    pass: 'Admin@1234',
    badge: 'POS & Sales',
  },
];

const HERO_FEATURES = [
  {
    icon: Zap,
    title: 'High-Speed POS & Billing',
    desc: 'Lightning-fast checkout with barcode scanning, auto-receipts & multi-pay.',
  },
  {
    icon: Activity,
    title: 'Smart Inventory & Batch FEFO',
    desc: 'Real-time stock tracking with automated expiry alerts & supplier reordering.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security & Audit',
    desc: '256-bit SSL, role-based access controls & HIPAA compliance standards.',
  },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  // Dynamic greeting based on user local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleDemoFill = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedDemo(acc.role);
    setError('');
    toast.success(`Loaded credentials for ${acc.role}`, {
      icon: '⚡',
      duration: 2000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(email, password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user?.name || 'User'}!`);
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Invalid email or password. Please try again.';
      setError(msg);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* ══════════════════════════════════════════════════════════════════════
         LEFT HERO / BRAND SHOWCASE PANEL (Desktop)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-900 border-r border-slate-800/60">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Top Brand Banner */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1.5px] shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Pill size={22} className="text-emerald-400 -rotate-45" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                Pharma<span className="text-emerald-400">Sys</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.5
                </span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Healthcare Management Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-md">
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              Next-Generation Pharmacy Platform
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-4">
              Streamline operations, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                empower patient care.
              </span>
            </h1>

            <p className="text-slate-400 text-base max-w-lg font-normal leading-relaxed mb-8">
              All-in-one Intelligent Pharmacy Suite for POS sales, inventory control, prescription tracking, and compliance management.
            </p>

            {/* Feature Cards Grid */}
            <div className="space-y-4 max-w-lg">
              {HERO_FEATURES.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                        {feat.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom System Health & Trust Badge */}
        <div className="relative z-10 pt-6 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online • 99.98% Uptime
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <LockKeyhole size={13} className="text-emerald-400" /> 256-Bit SSL
            </span>
            <span className="flex items-center gap-1">
              <Building2 size={13} className="text-teal-400" /> HIPAA Ready
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         RIGHT AUTH FORM PANEL
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-slate-900/90 lg:bg-slate-950 relative min-h-screen lg:min-h-0">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-emerald-600/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Top Header (Mobile Brand + Link) */}
        <div className="flex items-center justify-between mb-8 lg:mb-4 relative z-10">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-[1px] shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Pill size={18} className="text-emerald-400 -rotate-45" />
              </div>
            </div>
            <span className="text-xl font-black text-white">
              Pharma<span className="text-emerald-400">Sys</span>
            </span>
          </div>

          <div className="ml-auto text-xs text-slate-400 flex items-center gap-2">
            <span>Need help?</span>
            <a
              href="mailto:support@pharmasys.com"
              className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Center Auth Card */}
        <div className="max-w-md w-full mx-auto my-auto relative z-10 py-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Titles */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                {getGreeting()} <span className="inline-block animate-bounce">👋</span>
              </h2>
              <p className="text-sm text-slate-400">
                Enter your credentials to access the PharmaSys portal.
              </p>
            </div>

            {/* ── DEMO CREDENTIALS QUICK FILL PILLS ── */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Sparkles size={13} className="text-amber-400" />
                  Quick Demo Login
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Click to auto-fill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = selectedDemo === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleDemoFill(acc)}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10 scale-[1.02]'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <Check size={12} className="text-emerald-400" />
                        </div>
                      )}
                      <span className="font-bold text-white text-xs mb-0.5">{acc.role}</span>
                      <span className="text-[10px] text-slate-400 tracking-tight">{acc.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── LOGIN FORM ── */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address Field */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@pharmacy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      toast('Please contact your administrator to reset credentials.', {
                        icon: 'ℹ️',
                      });
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-400 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-950 accent-emerald-600"
                  />
                  <span className="text-xs text-slate-300 font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Error Alert Box */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2.5"
                  >
                    <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Authenticating credentials…
                  </>
                ) : (
                  <>
                    Sign In to Portal <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-center pt-6 border-t border-slate-800/40 mt-6">
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} PharmaSys Inc. • Secure Health Data Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
