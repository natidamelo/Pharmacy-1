import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, BarChart3, Bell, FileText, Shield,
  Link2, ArrowRight, Star, CheckCircle2, TrendingUp,
  Menu, X, AlertCircle, Activity, Zap, Headphones,
  Clock, ChevronRight, ArrowUpRight
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   DATA & CONSTANTS
══════════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'Solutions', href: '#solutions' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Trust & Security', href: '#trust' },
];

const TRUST_CALLOUTS = [
  {
    icon: Clock,
    title: '5-Min Onboarding',
    desc: 'Instant cloud setup with automated data import from legacy software.',
  },
  {
    icon: Shield,
    title: 'HIPAA & Audit Compliant',
    desc: 'Bank-grade 256-bit encryption with immutable digital audit trails.',
  },
  {
    icon: Activity,
    title: '99.99% Uptime SLA',
    desc: 'High-availability multi-region cloud for uninterrupted dispensing.',
  },
  {
    icon: Headphones,
    title: '24/7 Expert Support',
    desc: 'Direct access to dedicated pharmacy IT software specialists.',
  },
];

const STATS = [
  { value: '500+',   label: 'Active Pharmacies' },
  { value: '2M+',   label: 'Prescriptions Filled' },
  { value: '99.99%', label: 'Guaranteed Uptime' },
  { value: '50+',   label: 'Countries Supported' },
];

const AVATARS = [
  { initials: 'DR', from: 'from-emerald-400', to: 'to-teal-500' },
  { initials: 'LM', from: 'from-blue-400',    to: 'to-violet-500' },
  { initials: 'RK', from: 'from-amber-400',   to: 'to-rose-500' },
  { initials: 'JP', from: 'from-indigo-400',  to: 'to-cyan-500' },
];

/* ══════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════ */
interface NavbarProps {
  scrolled: boolean;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled, menuOpen, setMenuOpen }) => (
  <nav
    style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : '1px solid rgba(226,232,240,0.4)',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
    }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 sm:h-20">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            style={{ background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20"
          >
            <Link2 size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight leading-none">
            <span className="text-slate-900">Pharma</span>
            <span className="text-emerald-600">Sys</span>
          </span>
        </Link>

        {/* ── Center links (desktop) ── */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-150 whitespace-nowrap"
            >
              {l.name}
            </a>
          ))}
        </div>

        {/* ── Right CTAs (desktop) ── */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors px-3 py-2 whitespace-nowrap"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)',
              boxShadow: '0 4px 14px rgba(5,150,105,0.28)',
            }}
            className="px-4 lg:px-5 py-2.5 rounded-full text-xs lg:text-sm font-semibold text-white hover:scale-105 hover:shadow-lg transition-all duration-200 whitespace-nowrap"
          >
            Start Free Trial
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 py-4 space-y-2 bg-white/98 backdrop-blur-md rounded-b-2xl shadow-xl px-2">
          {NAV_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {l.name}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              to="/login"
              className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl text-center"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/login"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)' }}
              className="block px-5 py-3 rounded-full text-sm font-semibold text-center text-white shadow-md"
              onClick={() => setMenuOpen(false)}
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
   HERO DASHBOARD VISUAL MOCKUP
══════════════════════════════════════════════════════════════════════ */
const HeroDashboardVisual: React.FC = () => (
  <div className="relative w-full max-w-full py-4">
    {/* Main glassmorphic container */}
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(226,232,240,0.85)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.07), 0 4px 20px rgba(5,150,105,0.05)',
      }}
      className="rounded-3xl p-5 sm:p-6 relative overflow-hidden"
    >
      {/* Top window controls */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-slate-400 font-mono ml-2 hidden sm:inline">pharmasys-cloud-v4.2</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700">Live Dispensing Active</span>
        </div>
      </div>

      {/* Main dashboard mockup content */}
      <div className="space-y-3.5">
        {/* Metric cards grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
              <span>Today's Revenue</span>
              <TrendingUp size={13} className="text-emerald-500" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">$4,829.50</p>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600">↑ +14.2% vs avg</span>
          </div>

          <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
              <span>Rx Verified</span>
              <CheckCircle2 size={13} className="text-blue-500" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900">184 / 190</p>
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600">96.8% FEFO</span>
          </div>
        </div>

        {/* Real-time inventory bar chart simulation */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800">FEFO Stock Allocation</span>
            <span className="text-[10px] font-medium text-slate-400">Auto-prioritized</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-medium text-slate-600 mb-1">
                <span className="truncate pr-2">Amoxicillin 500mg (Exp 10/26)</span>
                <span className="text-emerald-600 font-bold whitespace-nowrap">First Out</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-medium text-slate-600 mb-1">
                <span className="truncate pr-2">Metformin 850mg (Exp 04/27)</span>
                <span className="text-emerald-600 font-bold whitespace-nowrap">Queue #2</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full w-[62%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating Bubble Top Right */}
    <div
      className="absolute top-1 right-1 sm:right-3 z-10 hidden sm:block"
      style={{ animation: 'bubble-float 3.5s ease-in-out infinite' }}
    >
      <div className="bg-white/95 backdrop-blur-md border border-rose-200/90 shadow-md shadow-rose-500/10 rounded-2xl px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={13} className="text-rose-500" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-900 leading-tight">Low Stock Alert</p>
          <p className="text-[10px] text-slate-400">Amoxicillin 500mg</p>
        </div>
      </div>
    </div>

    {/* Floating Bubble Bottom Left */}
    <div
      className="absolute -bottom-1 left-1 sm:left-3 z-10 hidden sm:block"
      style={{ animation: 'bubble-float 4.2s ease-in-out infinite 1s' }}
    >
      <div className="bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-md shadow-emerald-500/10 rounded-2xl px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={13} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-emerald-700 leading-tight">FEFO Verified ✓</p>
          <p className="text-[10px] text-slate-400">Zero expired items</p>
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════════════ */
const HeroSection: React.FC = () => (
  <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
    {/* Soft background ambient gradient */}
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute"
        style={{
          top: '-15%', left: '-5%', width: '50%', height: '65%',
          background: 'radial-gradient(ellipse, rgba(167,243,208,0.28) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '15%', right: '-5%', width: '45%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(204,251,241,0.30) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
    </div>

    <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

        {/* Left Column */}
        <div>
          {/* Badge */}
          <div
            style={{ border: '1px solid rgba(167,243,208,0.9)', background: 'rgba(236,253,245,0.85)' }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 tracking-wide">Next-Gen Pharmacy SaaS</span>
          </div>

          {/* Main Headline */}
          <h1
            className="font-extrabold tracking-tight leading-[1.06] text-slate-900 mb-5"
            style={{ fontSize: 'clamp(34px, 4.5vw, 56px)' }}
          >
            Pharmacy management,{' '}
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

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-7 max-w-[500px]">
            Eliminate stockouts, automate FEFO dispensing, track prescriptions in real time, and scale multi-branch operations with confidence.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 mb-8">
            <Link
              to="/login"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)',
                boxShadow: '0 8px 24px rgba(5,150,105,0.30)',
              }}
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-full font-bold text-white text-sm sm:text-[15px] hover:scale-105 hover:shadow-xl transition-all duration-200 whitespace-nowrap"
            >
              Start Free Trial <ArrowRight size={16} />
            </Link>
            
            <Link
              to="/login"
              style={{ border: '1.5px solid rgba(203,213,225,0.9)', background: '#FFFFFF' }}
              className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-3.5 rounded-full font-semibold text-slate-700 text-sm sm:text-[15px] hover:bg-slate-50 hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              Sign In to Demo <ChevronRight size={16} className="text-slate-400" />
            </Link>
          </div>

          {/* Social Proof Stack */}
          <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
            <div className="flex -space-x-2">
              {AVATARS.map((a, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white bg-gradient-to-br ${a.from} ${a.to} flex items-center justify-center shadow-xs`}
                >
                  <span className="text-white text-[9px] font-bold">{a.initials}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="#fbbf24" className="text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">4.9/5</span> rated by 500+ pharmacists
              </p>
            </div>
          </div>
        </div>

        {/* Right Column Visual */}
        <div className="flex justify-center lg:justify-end w-full min-w-0">
          <div className="w-full max-w-lg">
            <HeroDashboardVisual />
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   TRUST & BENEFIT STRIP
══════════════════════════════════════════════════════════════════════ */
const TrustBenefitStrip: React.FC = () => (
  <section id="trust" className="py-10 sm:py-12 bg-slate-50/80 border-y border-slate-200/80">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {TRUST_CALLOUTS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex items-start gap-3.5 hover:shadow-md transition-shadow"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={18} className="text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1 truncate">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   DEDICATED FEATURE SECTIONS (FEFO, Analytics, Alerts, Rx)
══════════════════════════════════════════════════════════════════════ */
const FeatureSections: React.FC = () => (
  <section id="features" className="py-16 sm:py-24 space-y-20 sm:space-y-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

    {/* Section Intro */}
    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3.5">
        <Zap size={12} /> Purpose-Built Architecture
      </div>
      <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3.5">
        Four Pillars of High-Performance Pharmacy Software
      </h2>
      <p className="text-slate-500 text-sm sm:text-lg max-w-2xl mx-auto">
        Designed from the ground up for modern pharmacy workflows — reducing human error and maximizing efficiency.
      </p>
    </div>

    {/* FEATURE 1: FEFO Dispensing */}
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div>
        <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
          <Package size={22} />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">01. Smart Inventory</span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3.5">
          Automated FEFO Dispensing & Batch Precision
        </h3>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-5">
          Eliminate stock expiration losses completely. PharmaSys automatically prioritizes inventory batches based on <strong>First-Expired-First-Out</strong> (FEFO) principles during checkout.
        </p>
        <ul className="space-y-2.5 mb-6">
          {[
            'Automatic batch selection at POS checkout',
            'Real-time expiration countdown & audit logs',
            'Barcode scanning verification for zero-error dispensing',
          ].map((bullet) => (
            <li key={bullet} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-sm hover:text-emerald-700"
        >
          Explore FEFO Workflows <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* FEFO Mockup Visual */}
      <div className="w-full min-w-0 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-5 sm:p-7 rounded-3xl border border-emerald-100 shadow-xs">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-3 max-w-full overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-800">Batch Prioritization Queue</span>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">FEFO Enforced</span>
          </div>
          
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Paracetamol 500mg • Batch #P-881</p>
              <p className="text-[11px] text-slate-500">Expiring in 18 days (August 2026)</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-md shadow-xs whitespace-nowrap flex-shrink-0">DISPENSE FIRST</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2 opacity-75">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Paracetamol 500mg • Batch #P-902</p>
              <p className="text-[11px] text-slate-500">Expiring in 140 days (Dec 2026)</p>
            </div>
            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap flex-shrink-0">Queue #2</span>
          </div>
        </div>
      </div>
    </div>

    {/* FEATURE 2: Live Analytics */}
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div className="lg:order-2">
        <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
          <BarChart3 size={22} />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">02. Business Intelligence</span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3.5">
          Real-Time Sales & Revenue Analytics
        </h3>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-5">
          Gain full visibility into fast-moving pharmaceuticals, peak sales hours, branch revenues, and profit margins with live operational dashboards.
        </p>
        <ul className="space-y-2.5 mb-6">
          {[
            'Instant daily, weekly, and monthly sales breakdowns',
            'Automated profit margin calculations per product',
            'Exportable financial reports for tax & accounting',
          ].map((bullet) => (
            <li key={bullet} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
              <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:text-blue-700"
        >
          View Analytics Demo <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Analytics Mockup Visual */}
      <div className="lg:order-1 w-full min-w-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-5 sm:p-7 rounded-3xl border border-blue-100 shadow-xs">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-4 max-w-full overflow-hidden">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Revenue Today</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900">$6,410.00</p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">+18.5% Growth</span>
          </div>

          <div className="grid grid-cols-4 gap-2 items-end h-24 sm:h-28 pt-3 border-t border-slate-100">
            {[40, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div style={{ height: `${h}%` }} className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-md" />
                <span className="text-[10px] text-slate-400">Q{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* FEATURE 3: Smart Alerts */}
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div>
        <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
          <Bell size={22} />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">03. Automated Safeguards</span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3.5">
          Smart Low-Stock & Expiry Alerts
        </h3>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-5">
          Never let a critical medication go out of stock. PharmaSys sends automated notifications when stock drops below threshold levels or medicines near expiry.
        </p>
        <ul className="space-y-2.5 mb-6">
          {[
            'Customizable reorder thresholds per drug',
            'Near-expiry warnings 30, 60, and 90 days out',
            'One-click purchase order generation',
          ].map((bullet) => (
            <li key={bullet} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
              <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-sm hover:text-amber-700"
        >
          See Alert Systems <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Smart Alerts Visual */}
      <div className="w-full min-w-0 bg-gradient-to-br from-amber-50/80 to-rose-50/50 p-5 sm:p-7 rounded-3xl border border-amber-100 shadow-xs">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-3 max-w-full overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-800">Live Alert Stream</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <Bell size={17} className="text-amber-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-900 truncate">Reorder Threshold Reached</p>
              <p className="text-[11px] text-amber-700 truncate">Insulin Glargine — 4 units left</p>
            </div>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
            <AlertCircle size={17} className="text-rose-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-900 truncate">Critical Expiry Warning</p>
              <p className="text-[11px] text-rose-700 truncate">Ciprofloxacin 250mg — 12 days left</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* FEATURE 4: Prescription Management */}
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div className="lg:order-2">
        <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5">
          <FileText size={22} />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-violet-600">04. Patient Care</span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-3.5">
          Digital Prescription Lifecycle & Refills
        </h3>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-5">
          Streamline doctor intake, verify dosages, track refills, and store patient prescription histories securely in full compliance with healthcare regulations.
        </p>
        <ul className="space-y-2.5 mb-6">
          {[
            'Digital prescription intake & doctor notes',
            'Automated refill reminders & patient records',
            'Controlled substance tracking and audit logs',
          ].map((bullet) => (
            <li key={bullet} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
              <CheckCircle2 size={16} className="text-violet-500 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-violet-600 font-bold text-sm hover:text-violet-700"
        >
          Discover Prescription Tools <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Prescription Visual */}
      <div className="lg:order-1 w-full min-w-0 bg-gradient-to-br from-violet-50/80 to-purple-50/50 p-5 sm:p-7 rounded-3xl border border-violet-100 shadow-xs">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-3 max-w-full overflow-hidden">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-800">Digital Rx #89042</span>
            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md">VERIFIED</span>
          </div>

          <div className="text-xs space-y-1">
            <p className="text-slate-500">Patient: <strong className="text-slate-800">Johnathan Doe</strong></p>
            <p className="text-slate-500">Prescriber: <strong className="text-slate-800">Dr. E. Vance, MD</strong></p>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 mt-2 font-mono text-[11px] text-slate-700 break-words">
              Rx: Lisinopril 10mg — Take 1 tablet daily (30-day supply)
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   SOCIAL PROOF & TESTIMONIALS
══════════════════════════════════════════════════════════════════════ */
const TestimonialsSection: React.FC = () => (
  <section id="testimonials" className="py-16 sm:py-24 bg-slate-900 text-white overflow-hidden relative">
    {/* Subtle emerald gradient glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/10 rounded-full filter blur-[100px] pointer-events-none" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-14 sm:mb-20 text-center border-b border-slate-800 pb-12 sm:pb-16">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="text-2xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight mb-1">{s.value}</p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Testimonial */}
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1 mb-5 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill="currentColor" />
          ))}
        </div>

        <blockquote className="text-lg sm:text-2xl font-medium leading-relaxed mb-7 text-slate-200 italic px-2">
          "PharmaSys transformed how we manage our multi-branch pharmacy group. FEFO batch tracking alone saved us over $14,000 in expired inventory within our first quarter."
        </blockquote>

        <div className="flex items-center justify-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
            SM
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm sm:text-base">Dr. Sarah M., PharmD</p>
            <p className="text-xs text-slate-400">Chief Managing Pharmacist • CityMed Pharmacy Group</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════════════════════════════ */
const CTABanner: React.FC = () => (
  <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-slate-50">
    <div className="max-w-5xl mx-auto">
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #14b8a6 100%)',
          boxShadow: '0 20px 60px rgba(5,150,105,0.25)',
        }}
        className="rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-14 text-center text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3.5">
            Ready to Modernize Your Pharmacy Operations?
          </h2>
          <p className="text-emerald-100 text-sm sm:text-lg mb-8 max-w-xl mx-auto">
            Get started in 5 minutes with full demo access. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-full font-bold text-emerald-700 bg-white hover:bg-emerald-50 hover:scale-105 transition-all shadow-md text-sm whitespace-nowrap"
            >
              Start Free Trial Now
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-full font-semibold text-white border-2 border-white/40 hover:border-white hover:bg-white/10 hover:scale-105 transition-all text-sm whitespace-nowrap"
            >
              Sign In to Demo Account
            </Link>
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
  <footer className="bg-white border-t border-slate-200 py-10 sm:py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div
            style={{ background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)' }}
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
          >
            <Link2 size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-base tracking-tight">
            <span className="text-slate-900">Pharma</span>
            <span className="text-emerald-600">Sys</span>
          </span>
        </Link>

        {/* Footer Nav Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
          {NAV_LINKS.map((l) => (
            <a key={l.name} href={l.href} className="hover:text-emerald-600 transition-colors">
              {l.name}
            </a>
          ))}
          <Link to="/login" className="hover:text-emerald-600 transition-colors">
            Sign In
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} PharmaSys Inc. All rights reserved. B2B Pharmacy Platform.
        </p>
      </div>
    </div>
  </footer>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN EXPORT: LANDING PAGE
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
    <div className="min-h-screen font-sans bg-white text-slate-900 relative overflow-x-hidden w-full">
      <style>{`
        @keyframes bubble-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>

      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection />
      <TrustBenefitStrip />
      <FeatureSections />
      <TestimonialsSection />
      <CTABanner />
      <Footer />
    </div>
  );
};
