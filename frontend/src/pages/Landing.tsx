import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, BarChart3, Bell, FileText, Shield,
  Link2, ArrowRight, Star, CheckCircle2, TrendingUp,
  Menu, X, AlertCircle, Zap, Headphones,
  Clock, ChevronRight, ArrowUpRight, Lock
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   GLOBAL KEYFRAMES
══════════════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes orb-drift-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(40px, -30px) scale(1.08); }
    66%      { transform: translate(-25px, 20px) scale(0.95); }
  }
  @keyframes orb-drift-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(-35px, 25px) scale(0.92); }
    66%      { transform: translate(30px, -20px) scale(1.06); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
    70%  { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes float-badge {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-6px); }
  }
`;

/* ══════════════════════════════════════════════════════════════════════
   DATA & CONSTANTS
══════════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Security', href: '#trust' },
];

const STATS = [
  { value: '500+', label: 'Active Pharmacies' },
  { value: '2M+', label: 'Prescriptions Filled' },
  { value: '99.99%', label: 'Uptime Guarantee' },
  { value: '50+', label: 'Countries Supported' },
];

const FEATURES: {
  icon: React.FC<{ size?: number; className?: string }>;
  tag: string;
  title: string;
  desc: string;
  accent: string;
  accentBg: string;
  bullets: string[];
}[] = [
  {
    icon: Package,
    tag: 'Smart Inventory',
    title: 'FEFO Dispensing & Batch Tracking',
    desc: 'Automatically prioritize inventory by expiration. Eliminate waste with intelligent First-Expired-First-Out dispensing at every checkout.',
    accent: '#10B981',
    accentBg: 'rgba(16,185,129,0.07)',
    bullets: ['Auto batch selection at POS', 'Expiration countdown alerts', 'Barcode scan verification'],
  },
  {
    icon: BarChart3,
    tag: 'Business Intelligence',
    title: 'Real-Time Revenue Analytics',
    desc: 'Full visibility into sales, margins, and trends across all branches with live operational dashboards.',
    accent: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.07)',
    bullets: ['Daily / weekly / monthly views', 'Profit margin per product', 'Export-ready financial reports'],
  },
  {
    icon: Bell,
    tag: 'Automated Safeguards',
    title: 'Smart Stock & Expiry Alerts',
    desc: 'Never run out of critical medication. Automated notifications for low stock and approaching expirations.',
    accent: '#F59E0B',
    accentBg: 'rgba(245,158,11,0.07)',
    bullets: ['Custom reorder thresholds', '30 / 60 / 90-day warnings', 'One-click purchase orders'],
  },
  {
    icon: FileText,
    tag: 'Patient Care',
    title: 'Digital Prescription Lifecycle',
    desc: 'Streamline intake, verify dosages, track refills, and store patient histories in full regulatory compliance.',
    accent: '#8B5CF6',
    accentBg: 'rgba(139,92,246,0.07)',
    bullets: ['Digital Rx intake & notes', 'Automated refill reminders', 'Controlled substance logs'],
  },
];

const TRUST_ITEMS = [
  { icon: Clock, title: '5-Min Onboarding', desc: 'Instant cloud setup with automated legacy-data import.' },
  { icon: Shield, title: 'HIPAA & Audit Ready', desc: 'Bank-grade 256-bit encryption. Immutable audit trails.' },
  { icon: Zap, title: '99.99% Uptime SLA', desc: 'Multi-region cloud for uninterrupted dispensing.' },
  { icon: Headphones, title: '24/7 Expert Support', desc: 'Dedicated pharmacy IT specialists, always on call.' },
];

/* ══════════════════════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════════════════════ */
const GRAD = 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)';
const DARK = '#080D19';
const DARK2 = '#0C1222';

/* ══════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════ */
interface NavbarProps { scrolled: boolean; menuOpen: boolean; setMenuOpen: (v: boolean) => void }

const Navbar: React.FC<NavbarProps> = ({ scrolled, menuOpen, setMenuOpen }) => (
  <nav
    style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
      background: scrolled ? 'rgba(8,13,25,0.82)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
    }}
  >
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="flex items-center justify-between h-16 sm:h-20">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            style={{ background: GRAD, boxShadow: '0 0 20px rgba(16,185,129,0.25)' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <Link2 size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Pharma<span style={{ color: '#10B981' }}>Sys</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {l.name}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            style={{ background: GRAD, boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden py-4 space-y-1 rounded-b-2xl px-2"
          style={{ background: 'rgba(8,13,25,0.96)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              {l.name}
            </a>
          ))}
          <div className="pt-3 border-t border-white/5 space-y-2 mt-2">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white text-center rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{ background: GRAD }}
              className="block px-5 py-3 rounded-full text-sm font-bold text-center text-white shadow-lg"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </div>
  </nav>
);

/* ══════════════════════════════════════════════════════════════════════
   HERO DASHBOARD MOCKUP
══════════════════════════════════════════════════════════════════════ */
const DashboardMockup: React.FC = () => (
  <div className="relative w-full max-w-4xl mx-auto">
    {/* Glow behind card */}
    <div
      className="absolute inset-0 rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.10) 50%, rgba(139,92,246,0.08) 100%)',
        filter: 'blur(40px)',
        transform: 'scale(1.05)',
      }}
    />

    {/* Main card */}
    <div
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(15,22,41,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03) inset',
        transform: 'perspective(1400px) rotateX(4deg)',
      }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          <span className="text-[11px] text-slate-500 font-mono ml-3 hidden sm:inline">pharmasys-cloud v4.2</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse-ring 2s infinite' }} />
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-400">Live</span>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="p-4 sm:p-6 space-y-3">
        {/* Metric row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-[11px] text-slate-500">Revenue Today</span>
              <TrendingUp size={12} className="text-emerald-400" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-white">$4,829</p>
            <span className="text-[10px] font-bold text-emerald-400">+14.2%</span>
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-[11px] text-slate-500">Rx Verified</span>
              <CheckCircle2 size={12} className="text-blue-400" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-white">184/190</p>
            <span className="text-[10px] font-bold text-blue-400">96.8% FEFO</span>
          </div>

          <div className="hidden sm:block p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-500">Active Alerts</span>
              <Bell size={12} className="text-amber-400" />
            </div>
            <p className="text-lg font-extrabold text-white">3</p>
            <span className="text-[10px] font-bold text-amber-400">2 low stock</span>
          </div>
        </div>

        {/* FEFO chart */}
        <div className="p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-300">FEFO Stock Allocation</span>
            <span className="text-[10px] text-slate-500">Auto-prioritized</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Amoxicillin 500mg (Exp 10/26)</span>
                <span className="text-emerald-400 font-bold">First Out</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full w-[85%]" style={{ background: GRAD }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Metformin 850mg (Exp 04/27)</span>
                <span className="text-slate-500 font-medium">Queue #2</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full bg-teal-500/60 w-[60%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating alert badge */}
    <div
      className="absolute -top-3 -right-2 sm:right-4 z-10 hidden sm:block"
      style={{ animation: 'float-badge 3s ease-in-out infinite' }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(15,22,41,0.92)',
          border: '1px solid rgba(239,68,68,0.2)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div className="w-6 h-6 rounded-lg bg-red-500/15 flex items-center justify-center">
          <AlertCircle size={13} className="text-red-400" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-white leading-tight">Low Stock Alert</p>
          <p className="text-[10px] text-slate-500">Amoxicillin 500mg</p>
        </div>
      </div>
    </div>

    {/* Floating verified badge */}
    <div
      className="absolute -bottom-3 left-2 sm:left-6 z-10 hidden sm:block"
      style={{ animation: 'float-badge 3.5s ease-in-out infinite 0.8s' }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(15,22,41,0.92)',
          border: '1px solid rgba(16,185,129,0.2)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 size={13} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-emerald-400 leading-tight">FEFO Verified ✓</p>
          <p className="text-[10px] text-slate-500">Zero expired items</p>
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════════════ */
const HeroSection: React.FC = () => (
  <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ background: DARK }}>
    {/* Background layers */}
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'hidden' }}>
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
      {/* Gradient orbs */}
      <div
        className="absolute"
        style={{
          top: '-10%', left: '5%', width: '550px', height: '550px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'orb-drift-1 18s ease-in-out infinite',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '0%', right: '0%', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'orb-drift-2 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '40%', left: '50%', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'orb-drift-1 25s ease-in-out infinite 5s',
        }}
      />
      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: `linear-gradient(transparent, ${DARK})` }} />
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-28 sm:pt-36 pb-16">
      {/* Text block — centered */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
          style={{
            border: '1px solid rgba(16,185,129,0.25)',
            background: 'rgba(16,185,129,0.06)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: 'pulse-ring 2s infinite' }} />
          <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">Next-Gen Pharmacy Platform</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-extrabold tracking-tight leading-[1.08] text-white mb-6"
          style={{ fontSize: 'clamp(36px, 5.5vw, 72px)' }}
        >
          Pharmacy management,{' '}
          <span
            style={{
              background: GRAD,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            reimagined.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto"
        >
          Eliminate stockouts, automate FEFO dispensing, track prescriptions in real time, and scale multi-branch operations — all from one platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3.5 mb-10"
        >
          <Link
            to="/login"
            style={{ background: GRAD, boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-[15px] hover:scale-105 hover:shadow-xl transition-all duration-200"
          >
            Start Free Trial <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-full font-semibold text-slate-300 text-[15px] hover:text-white hover:bg-white/5 transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Sign In to Demo <ChevronRight size={16} className="text-slate-500" />
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center justify-center gap-3.5"
        >
          <div className="flex -space-x-2.5">
            {[
              'linear-gradient(135deg,#10B981,#14B8A6)',
              'linear-gradient(135deg,#3B82F6,#8B5CF6)',
              'linear-gradient(135deg,#F59E0B,#EF4444)',
              'linear-gradient(135deg,#6366F1,#06B6D4)',
            ].map((bg, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: bg, borderColor: DARK }}
              >
                {['DR', 'LM', 'RK', 'JP'][i]}
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} fill="#FBBF24" className="text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              <span className="font-bold text-slate-300">4.9/5</span> from 500+ pharmacists
            </p>
          </div>
        </motion.div>
      </div>

      {/* Dashboard mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <DashboardMockup />
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   STATS STRIP
══════════════════════════════════════════════════════════════════════ */
const StatsStrip: React.FC = () => (
  <section style={{ background: DARK2, borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <p
              className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1"
              style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {s.value}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   FEATURES — BENTO GRID
══════════════════════════════════════════════════════════════════════ */
const FeatureCard: React.FC<{ feature: typeof FEATURES[0]; index: number }> = ({ feature, index }) => {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Accent top border */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: feature.accent }}
      />

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: feature.accentBg }}
        >
          <Icon size={20} style={{ color: feature.accent }} />
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: feature.accent }}>
          {feature.tag}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2.5 leading-tight">
        {feature.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-5">
        {feature.desc}
      </p>

      <ul className="space-y-2.5 mb-5">
        {feature.bullets.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
            <CheckCircle2 size={15} style={{ color: feature.accent }} className="flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm font-bold hover:gap-2.5 transition-all duration-200"
        style={{ color: feature.accent }}
      >
        Learn more <ArrowUpRight size={14} />
      </Link>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => (
  <section id="features" className="py-20 sm:py-28" style={{ background: '#FAFBFC' }}>
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-14 sm:mb-20"
      >
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <Zap size={12} /> Purpose-Built
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Everything your pharmacy needs
        </h2>
        <p className="text-slate-500 text-sm sm:text-base">
          Four pillars of high-performance pharmacy software — designed to reduce errors and maximize efficiency.
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════════════════════ */
const TestimonialsSection: React.FC = () => (
  <section
    id="testimonials"
    className="py-20 sm:py-28 relative overflow-hidden"
    style={{ background: DARK }}
  >
    {/* Ambient glow */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
    />

    <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} fill="#FBBF24" className="text-amber-400" />
          ))}
        </div>

        <blockquote
          className="text-xl sm:text-2xl md:text-3xl font-medium text-slate-200 leading-relaxed mb-8 italic"
        >
          "PharmaSys transformed how we manage our multi-branch pharmacy group. FEFO batch tracking alone saved us over{' '}
          <span
            style={{
              background: GRAD,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            $14,000 in expired inventory
          </span>{' '}
          within our first quarter."
        </blockquote>

        <div className="flex items-center justify-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            SM
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm sm:text-base">Dr. Sarah M., PharmD</p>
            <p className="text-xs sm:text-sm text-slate-500">Chief Managing Pharmacist • CityMed Pharmacy Group</p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   TRUST & SECURITY
══════════════════════════════════════════════════════════════════════ */
const TrustSection: React.FC = () => (
  <section id="trust" className="py-20 sm:py-28" style={{ background: '#FAFBFC' }}>
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
      >
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <Lock size={12} /> Enterprise Security
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Built on trust
        </h2>
        <p className="text-slate-500 text-sm sm:text-base">
          Healthcare-grade infrastructure for pharmacies that can't afford downtime.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {TRUST_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white p-5 sm:p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{ border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(16,185,129,0.07)' }}
              >
                <Icon size={20} className="text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════════════════════════════ */
const CTABanner: React.FC = () => (
  <section className="py-20 sm:py-28" style={{ background: DARK }}>
    <div className="max-w-5xl mx-auto px-5 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
        className="relative rounded-3xl sm:rounded-[2rem] overflow-hidden p-8 sm:p-14 text-center"
        style={{
          background: GRAD,
          boxShadow: '0 24px 80px rgba(16,185,129,0.25)',
        }}
      >
        {/* Decorative inner glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        <div className="relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to modernize your pharmacy?
          </h2>
          <p className="text-emerald-100/80 text-sm sm:text-lg mb-8 max-w-lg mx-auto">
            Get started in 5 minutes with full demo access. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-full font-bold text-emerald-700 bg-white hover:bg-emerald-50 hover:scale-105 transition-all duration-200 shadow-lg text-sm"
            >
              Start Free Trial Now
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-full font-semibold text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 text-sm"
              style={{ border: '2px solid rgba(255,255,255,0.35)' }}
            >
              Sign In to Demo
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════════════ */
const Footer: React.FC = () => (
  <footer style={{ background: DARK, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div
            style={{ background: GRAD }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
          >
            <Link2 size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Pharma<span style={{ color: '#10B981' }}>Sys</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
          {NAV_LINKS.map((l) => (
            <a key={l.name} href={l.href} className="hover:text-emerald-400 transition-colors">
              {l.name}
            </a>
          ))}
          <Link to="/login" className="hover:text-emerald-400 transition-colors">
            Sign In
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} PharmaSys Inc. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════ */
export const Landing: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans text-slate-900 relative" style={{ background: DARK }}>
      <style>{KEYFRAMES}</style>
      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <TestimonialsSection />
      <TrustSection />
      <CTABanner />
      <Footer />
    </div>
  );
};
