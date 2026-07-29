import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, BarChart3, Bell, FileText, Shield, Building2,
  Link2, ArrowRight, Play, Star, CheckCircle2, TrendingUp,
  Menu, X, AlertCircle, Activity, Zap,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════════════ */
const NAV_LINKS = ['Features', 'Pricing', 'About', 'Contact'];

const FEATURES = [
  {
    Icon: Package,
    label: 'FEFO Dispensing',
    desc: 'Automatically track batch expiry dates and enforce First-Expired-First-Out dispensing across your entire inventory.',
    chipBase: 'bg-emerald-100',
    chipHover: 'group-hover:bg-emerald-500',
    iconBase: 'text-emerald-600',
    iconHover: 'group-hover:text-white',
    hoverBorder: 'hover:border-emerald-100',
  },
  {
    Icon: BarChart3,
    label: 'Live Analytics',
    desc: 'Real-time dashboards surfacing sales trends, inventory turnover, and revenue insights at a glance.',
    chipBase: 'bg-blue-100',
    chipHover: 'group-hover:bg-blue-500',
    iconBase: 'text-blue-600',
    iconHover: 'group-hover:text-white',
    hoverBorder: 'hover:border-blue-100',
  },
  {
    Icon: Bell,
    label: 'Smart Alerts',
    desc: 'Proactive low-stock, near-expiry, and reorder-point notifications delivered before stockouts happen.',
    chipBase: 'bg-amber-100',
    chipHover: 'group-hover:bg-amber-500',
    iconBase: 'text-amber-500',
    iconHover: 'group-hover:text-white',
    hoverBorder: 'hover:border-amber-100',
  },
  {
    Icon: FileText,
    label: 'Prescriptions',
    desc: 'Full prescription lifecycle — intake, validation, dispensing history, and digital refill management.',
    chipBase: 'bg-violet-100',
    chipHover: 'group-hover:bg-violet-500',
    iconBase: 'text-violet-600',
    iconHover: 'group-hover:text-white',
    hoverBorder: 'hover:border-violet-100',
  },
  {
    Icon: Shield,
    label: 'Compliance',
    desc: 'Built-in controlled substance tracking, audit logs, and regulatory reporting for stress-free inspections.',
    chipBase: 'bg-rose-100',
    chipHover: 'group-hover:bg-rose-500',
    iconBase: 'text-rose-500',
    iconHover: 'group-hover:text-white',
    hoverBorder: 'hover:border-rose-100',
  },
  {
    Icon: Building2,
    label: 'Multi-Location',
    desc: 'Manage an entire pharmacy chain from one dashboard — stock transfers, unified reporting, role-based access.',
    chipBase: 'bg-cyan-100',
    chipHover: 'group-hover:bg-cyan-500',
    iconBase: 'text-cyan-600',
    iconHover: 'group-hover:text-white',
    hoverBorder: 'hover:border-cyan-100',
  },
];

const STATS = [
  { value: '500+',   label: 'Pharmacies' },
  { value: '2M+',   label: 'Prescriptions Filled' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50+',   label: 'Countries' },
];

const AVATARS = [
  { initials: 'SA', from: 'from-emerald-400', to: 'to-teal-500' },
  { initials: 'LM', from: 'from-blue-400',    to: 'to-violet-500' },
  { initials: 'RK', from: 'from-orange-400',  to: 'to-rose-500' },
  { initials: 'JP', from: 'from-amber-400',   to: 'to-orange-500' },
];

/* ══════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════ */
interface NavbarProps { scrolled: boolean; menuOpen: boolean; setMenuOpen: (v: boolean) => void; }

const Navbar: React.FC<NavbarProps> = ({ scrolled, menuOpen, setMenuOpen }) => (
  <nav
    style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : '1px solid transparent',
      boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
    }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            style={{ background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)' }}
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
          >
            <Link2 size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight leading-none">
            <span className="text-slate-900">Pharma</span>
            <span className="text-emerald-600">Sys</span>
          </span>
        </Link>

        {/* ── Center links (desktop) ── */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-150"
            >
              {l}
            </a>
          ))}
        </div>

        {/* ── Right CTAs (desktop) ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2">
            Log in
          </Link>
          <Link
            to="/login"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)', boxShadow: '0 4px 16px rgba(5,150,105,0.35)' }}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 py-4 space-y-1 bg-white/95">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {l}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link to="/login" className="block px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
              Log in
            </Link>
            <Link
              to="/login"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)' }}
              className="block px-5 py-3 rounded-full text-sm font-semibold text-center text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </div>
  </nav>
);

/* ══════════════════════════════════════════════════════════════════════
   DASHBOARD PREVIEW CARD
══════════════════════════════════════════════════════════════════════ */
const DashboardCard: React.FC = () => (
  <div className="relative px-4 py-6">
    {/* Main glassmorphic card */}
    <div
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(226,232,240,0.7)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.06)',
      }}
      className="rounded-3xl p-6 relative overflow-hidden"
    >
      {/* Soft inner gradient */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(236,253,245,0.4) 0%, rgba(255,255,255,0) 50%, rgba(204,251,241,0.2) 100%)' }}
      />

      {/* ── Card header ── */}
      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Package size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Inventory Status</p>
            <p className="text-xs text-slate-400">2,847 Products</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600">Live</span>
        </div>
      </div>

      {/* ── Progress bars ── */}
      <div className="space-y-4 mb-5 relative">
        {/* In Stock */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-600">In Stock</span>
            <span className="text-xs font-bold text-emerald-600">92%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: '92%',
                background: 'linear-gradient(90deg, #059669 0%, #14b8a6 100%)',
                animation: 'bar-grow-92 1.4s cubic-bezier(0.22,1,0.36,1) 0.3s both',
              }}
            />
          </div>
        </div>
        {/* Near Expiry */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-600">Near Expiry</span>
            <span className="text-xs font-bold text-amber-500">12 items</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: '15%',
                background: 'linear-gradient(90deg, #f59e0b 0%, #fb923c 100%)',
                animation: 'bar-grow-15 1.4s cubic-bezier(0.22,1,0.36,1) 0.5s both',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Mini stat chips ── */}
      <div className="grid grid-cols-2 gap-3 relative">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sales Today</span>
            <TrendingUp size={12} className="text-emerald-500" />
          </div>
          <p className="text-lg font-extrabold text-slate-800 tracking-tight">$4,280</p>
          <p className="text-[11px] font-semibold text-emerald-500 mt-0.5">↑ 12% vs yesterday</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rx Today</span>
            <Activity size={12} className="text-blue-500" />
          </div>
          <p className="text-lg font-extrabold text-slate-800 tracking-tight">156</p>
          <p className="text-[11px] font-semibold text-blue-500 mt-0.5">↑ 8% vs yesterday</p>
        </div>
      </div>
    </div>

    {/* ── Floating bubble: Low Stock Alert (rose) — top-right ── */}
    <div
      className="absolute top-2 right-0 z-10"
      style={{ animation: 'bubble-float 3s ease-in-out infinite' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(254,205,211,0.9)',
          boxShadow: '0 8px 28px rgba(244,63,94,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
        className="rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5"
      >
        <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={13} className="text-rose-500" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-800 leading-tight">Low Stock Alert</p>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Amoxicillin 500mg</p>
        </div>
      </div>
    </div>

    {/* ── Floating bubble: FEFO Verified (emerald) — bottom-left ── */}
    <div
      className="absolute bottom-2 left-0 z-10"
      style={{ animation: 'bubble-float 4s ease-in-out infinite 0.8s' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(167,243,208,0.9)',
          boxShadow: '0 8px 28px rgba(5,150,105,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
        className="rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5"
      >
        <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={13} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-emerald-700 leading-tight">FEFO Verified ✓</p>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">All batches checked</p>
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════════════ */
const HeroSection: React.FC = () => (
  <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
    {/* Decorative background blobs */}
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute"
        style={{
          top: '-10%', left: '-5%', width: '45%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(167,243,208,0.35) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '10%', right: '-8%', width: '40%', height: '55%',
          background: 'radial-gradient(ellipse, rgba(204,251,241,0.4) 0%, transparent 65%)',
          filter: 'blur(48px)',
        }}
      />
    </div>

    <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

        {/* ── Left column ── */}
        <div>
          {/* Badge */}
          <div
            style={{ border: '1px solid rgba(167,243,208,0.8)', background: 'rgba(236,253,245,0.8)' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 tracking-wide">Trusted by 500+ Pharmacies</span>
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold tracking-tight leading-[1.04] text-slate-900 mb-6"
            style={{ fontSize: 'clamp(40px, 5.5vw, 62px)' }}
          >
            Pharmacy<br />management,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              reimagined.
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-[500px]">
            From FEFO dispensing to live sales analytics, smart low-stock alerts,
            and full prescription management — everything beautifully unified in one platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              to="/login"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)',
                boxShadow: '0 8px 24px rgba(5,150,105,0.40)',
              }}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-white text-[15px] hover:scale-105 hover:shadow-xl transition-all duration-200"
            >
              Start Free Trial <ArrowRight size={17} />
            </Link>
            <button
              style={{ border: '1.5px solid rgba(203,213,225,0.9)', background: 'rgba(255,255,255,0.9)' }}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full font-semibold text-slate-700 text-[15px] hover:scale-105 hover:shadow-md transition-all duration-200"
            >
              <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <Play size={10} className="text-slate-600 ml-0.5" fill="currentColor" />
              </span>
              Watch Demo
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4">
            {/* Avatar stack */}
            <div className="flex -space-x-2.5">
              {AVATARS.map((a, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br ${a.from} ${a.to} flex items-center justify-center shadow-sm`}
                >
                  <span className="text-white text-[9px] font-bold tracking-tight">{a.initials}</span>
                </div>
              ))}
            </div>
            {/* Rating */}
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="#fbbf24" className="text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-800">4.9/5</span> from 200+ reviews
              </p>
            </div>
          </div>
        </div>

        {/* ── Right column: Dashboard card ── */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <DashboardCard />
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════════════════════════════ */
const StatsBar: React.FC = () => (
  <section
    id="about"
    style={{
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(226,232,240,0.8)',
      borderBottom: '1px solid rgba(226,232,240,0.8)',
    }}
    className="py-12"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((s) => (
          <div key={s.value}>
            <p
              className="font-extrabold tracking-tight text-slate-900 mb-1"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}
            >
              {s.value}
            </p>
            <p className="text-sm text-slate-400 font-medium tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   FEATURES SECTION
══════════════════════════════════════════════════════════════════════ */
const FeaturesSection: React.FC = () => (
  <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">

      {/* Section header */}
      <div className="text-center mb-16">
        <div
          style={{ border: '1px solid rgba(167,243,208,0.7)', background: 'rgba(236,253,245,0.7)' }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-5"
        >
          <Zap size={11} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">Features</span>
        </div>
        <h2
          className="font-extrabold tracking-tight text-slate-900 mb-4"
          style={{ fontSize: 'clamp(30px, 4vw, 48px)' }}
        >
          Everything your pharmacy needs
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          One platform to manage your entire pharmacy — no more juggling spreadsheets,
          legacy software, or manual processes.
        </p>
      </div>

      {/* Feature cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => {
          const Icon = f.Icon;
          return (
            <div
              key={f.label}
              className={`group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default ${f.hoverBorder}`}
            >
              {/* Icon chip */}
              <div className={`w-14 h-14 rounded-2xl ${f.chipBase} ${f.chipHover} flex items-center justify-center mb-6 transition-colors duration-300`}>
                <Icon size={22} className={`${f.iconBase} ${f.iconHover} transition-colors duration-300`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.label}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
            </div>
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
  <section id="pricing" className="px-4 sm:px-6 lg:px-8 pb-24">
    <div className="max-w-7xl mx-auto">
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #14b8a6 100%)',
          borderRadius: '3rem',
          boxShadow: '0 24px 80px rgba(5,150,105,0.35)',
        }}
        className="relative overflow-hidden px-8 py-16 sm:py-20 text-center"
      >
        {/* Decorative white circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-32 w-32 h-32 rounded-full bg-white/[0.07] blur-2xl pointer-events-none" />
        <div className="absolute bottom-8 left-24 w-24 h-24 rounded-full bg-white/[0.06] blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <h2
            className="font-extrabold text-white tracking-tight mb-4"
            style={{ fontSize: 'clamp(26px, 4vw, 48px)' }}
          >
            Ready to modernize<br className="hidden sm:block" /> your pharmacy?
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join 500+ pharmacies already using PharmaSys to deliver better
            patient care and run smarter operations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 rounded-full font-bold text-emerald-700 bg-white hover:bg-emerald-50 hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-200 text-[15px]"
            >
              Start 14-Day Free Trial
            </Link>
            <button
              style={{ border: '2px solid rgba(255,255,255,0.45)' }}
              className="px-8 py-4 rounded-full font-semibold text-white hover:bg-white/15 hover:border-white/70 hover:scale-105 transition-all duration-200 text-[15px]"
            >
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════════════ */
const Footer: React.FC = () => (
  <footer
    id="contact"
    style={{ borderTop: '1px solid rgba(226,232,240,0.8)', background: 'rgba(255,255,255,0.7)' }}
    className="py-10"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            style={{ background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)' }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
          >
            <Link2 size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-sm tracking-tight">
            <span className="text-slate-900">Pharma</span>
            <span className="text-emerald-600">Sys</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400 font-medium">
          © 2026 PharmaSys. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Support'].map((l) => (
            <a
              key={l}
              href="#"
              className="text-xs text-slate-400 hover:text-emerald-600 font-medium transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════ */
export const Landing: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 35%, rgba(236,253,245,0.25) 100%)',
        position: 'relative',
      }}
    >
      {/* Global keyframes for this page */}
      <style>{`
        @keyframes bubble-float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-9px); }
        }
        @keyframes bar-grow-92 {
          from { width: 0%; } to { width: 92%; }
        }
        @keyframes bar-grow-15 {
          from { width: 0%; } to { width: 15%; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <CTABanner />
      <Footer />
    </div>
  );
};
