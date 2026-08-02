import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Package, BarChart3, Bell, FileText, Shield,
  Link2, ArrowRight, Star, CheckCircle2,
  Menu, X, AlertCircle, Zap, Headphones,
  Clock, ArrowUpRight, Sparkles, Check
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════
   APOTHECARY COLOR SYSTEM & STYLES
   Ink: #1C2029 | Porcelain: #EEF0EC | Amber Glass: #C1791F
   Apothecary Sage: #4C6357 | Alert Brick: #A23B2E | Mist: #D7DBD3
══════════════════════════════════════════════════════════════════════ */
const TOKENS = {
  ink: '#1C2029',
  porcelain: '#EEF0EC',
  amber: '#C1791F',
  amberDim: 'rgba(193, 121, 31, 0.12)',
  sage: '#4C6357',
  sageDim: 'rgba(76, 99, 87, 0.12)',
  brick: '#A23B2E',
  brickDim: 'rgba(162, 59, 46, 0.12)',
  mist: '#D7DBD3',
  white: '#FFFFFF',
};

const KEYFRAMES = `
  .fefo-scrollbar::-webkit-scrollbar { width: 5px; }
  .fefo-scrollbar::-webkit-scrollbar-track { background: rgba(215, 219, 211, 0.3); border-radius: 4px; }
  .fefo-scrollbar::-webkit-scrollbar-thumb { background: #4C6357; border-radius: 4px; }
`;

/* ══════════════════════════════════════════════════════════════════════
   NAVIGATION DATA
══════════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Security', href: '#trust' },
  { name: 'Pricing', href: '#pricing' },
];

const STATS = [
  { value: '500+', label: 'Active Pharmacies' },
  { value: '2M+', label: 'Prescriptions Dispensed' },
  { value: '99.99%', label: 'FEFO Compliance Rate' },
  { value: '0.00%', label: 'Expired Stock Waste' },
];

const FEATURES = [
  {
    icon: Package,
    tag: 'FEFO Queue System',
    title: 'First-Expired, First-Out Queueing',
    desc: 'Visually prioritizes medication by batch expiration date. Ensures shortest shelf-life stock is dispensed first at checkout automatically.',
    accent: TOKENS.amber,
    accentBg: TOKENS.amberDim,
    bullets: ['Automatic batch prioritization', 'Expiration countdown alerts', 'Barcode scan verification at POS'],
  },
  {
    icon: BarChart3,
    tag: 'Inventory Intelligence',
    title: 'Real-Time Revenue & Margins',
    desc: 'Live operational visibility across every branch. Track cost per dosage, profit margins, and peak turnover cycles effortlessly.',
    accent: TOKENS.sage,
    accentBg: TOKENS.sageDim,
    bullets: ['Daily & monthly gross margins', 'Category-level turnover velocity', 'Exportable audit & tax reports'],
  },
  {
    icon: Bell,
    tag: 'Automated Safeguards',
    title: 'Smart Stock & Reorder Warning',
    desc: 'Proactive threshold triggers alert staff before items hit critical levels. One-click purchase orders streamline supplier restocking.',
    accent: TOKENS.brick,
    accentBg: TOKENS.brickDim,
    bullets: ['Dynamic reorder point calculation', '30 / 60 / 90-day expiry warning', 'Automated PO generation'],
  },
  {
    icon: FileText,
    tag: 'Patient Safety',
    title: 'Digital Prescription Lifecycle',
    desc: 'Complete workflow from intake to dispensing. Track patient history, verify dosages, and maintain full compliance.',
    accent: TOKENS.sage,
    accentBg: TOKENS.sageDim,
    bullets: ['Digital Rx verification & logs', 'Controlled substance audit trails', 'Automated SMS refill reminders'],
  },
];

const TRUST_ITEMS = [
  { icon: Clock, title: '5-Minute Setup', desc: 'Instant cloud migration with legacy data import helpers.' },
  { icon: Shield, title: 'HIPAA & Regulatory Ready', desc: '256-bit encryption with immutable audit logs.' },
  { icon: Zap, title: '99.99% Uptime SLA', desc: 'Redundant cloud infrastructure built for uninterrupted dispensing.' },
  { icon: Headphones, title: '24/7 Pharmacy Support', desc: 'Direct support from certified pharmacy tech experts.' },
];

/* ══════════════════════════════════════════════════════════════════════
   NAVBAR COMPONENT
══════════════════════════════════════════════════════════════════════ */
interface NavbarProps { scrolled: boolean; menuOpen: boolean; setMenuOpen: (v: boolean) => void }

const Navbar: React.FC<NavbarProps> = ({ scrolled, menuOpen, setMenuOpen }) => (
  <nav
    style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(28, 32, 41, 0.94)' : 'rgba(238, 240, 236, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: scrolled ? `1px solid rgba(215, 219, 211, 0.15)` : `1px solid ${TOKENS.mist}`,
    }}
  >
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="flex items-center justify-between h-16 sm:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div
            style={{ background: TOKENS.amber, boxShadow: '0 4px 12px rgba(193, 121, 31, 0.25)' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          >
            <Link2 size={18} color="#FFF" strokeWidth={2.5} />
          </div>
          <span
            className="text-lg sm:text-xl font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: scrolled ? TOKENS.porcelain : TOKENS.ink }}
          >
            Pharma<span style={{ color: TOKENS.amber }}>Sys</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="text-sm font-medium transition-colors hover:text-[#C1791F]"
              style={{ color: scrolled ? 'rgba(238, 240, 236, 0.8)' : TOKENS.ink }}
            >
              {l.name}
            </a>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link
            to="/login"
            className="text-sm font-semibold transition-colors px-3.5 py-2 rounded-lg"
            style={{ color: scrolled ? TOKENS.porcelain : TOKENS.ink }}
          >
            Sign In
          </Link>
          <Link
            to="/login"
            style={{
              background: TOKENS.amber,
              color: TOKENS.white,
              boxShadow: '0 4px 16px rgba(193, 121, 31, 0.28)',
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
          >
            Book a Demo
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: scrolled ? TOKENS.porcelain : TOKENS.ink }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden py-4 px-2 space-y-2 rounded-b-2xl border-t shadow-xl"
          style={{ background: TOKENS.ink, borderColor: 'rgba(215, 219, 211, 0.15)' }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium rounded-xl text-slate-200 hover:text-white hover:bg-white/10"
            >
              {l.name}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-slate-300 text-center rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{ background: TOKENS.amber, color: TOKENS.white }}
              className="block px-5 py-3 rounded-xl text-sm font-bold text-center shadow-lg"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      )}
    </div>
  </nav>
);

/* ══════════════════════════════════════════════════════════════════════
   SIGNATURE ELEMENT: 3D FEFO SHELF COMPONENT
   Demonstrates "soonest-to-expire goes first" visually
══════════════════════════════════════════════════════════════════════ */
const FEFOShelfComponent: React.FC = () => {
  const [, setActiveItemIndex] = useState(0);

  const inventoryItems = [
    { lot: 'LOT-9824', name: 'Amoxicillin 500mg', exp: '10/2026', days: 45, status: 'DISPENSE NEXT', count: '120 caps', priority: 1, alert: true },
    { lot: 'LOT-9871', name: 'Metformin 850mg', exp: '04/2027', days: 240, status: 'Queue #2', count: '500 tabs', priority: 2, alert: false },
    { lot: 'LOT-9902', name: 'Atorvastatin 20mg', exp: '11/2027', days: 450, status: 'Queue #3', count: '250 tabs', priority: 3, alert: false },
    { lot: 'LOT-9945', name: 'Lisinopril 10mg', exp: '03/2028', days: 580, status: 'Queue #4', count: '1000 tabs', priority: 4, alert: false },
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 3D Shelf Container */}
      <div
        className="relative rounded-3xl p-5 sm:p-7 overflow-hidden transition-all"
        style={{
          background: TOKENS.white,
          border: `1.5px solid ${TOKENS.mist}`,
          boxShadow: '0 20px 50px rgba(28, 32, 41, 0.08), 0 2px 6px rgba(28, 32, 41, 0.04)',
        }}
      >
        {/* Top Status Header - No Overlap */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: TOKENS.amber }} />
            <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase font-mono">
              FEFO Shelf Queue · Real-time Priority
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono"
            style={{
              background: TOKENS.sageDim,
              borderColor: 'rgba(76, 99, 87, 0.25)',
              color: TOKENS.sage,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: TOKENS.sage }} />
            Live Inventory
          </div>
        </div>

        {/* Hero Image Showcase with 3D Bottle Queue Overlay */}
        <div className="relative rounded-2xl overflow-hidden mb-6 bg-slate-900 shadow-inner group">
          <img
            src="/fefo_shelf_hero.jpg"
            alt="Pharmacy FEFO Shelf Queue"
            className="w-full h-56 sm:h-64 object-cover object-center opacity-95 transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(28, 32, 41, 0.85) 0%, rgba(28, 32, 41, 0.1) 60%, transparent 100%)',
            }}
          />

          {/* Callout Overlay on Image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-white/40 shadow-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow"
                style={{ background: TOKENS.amber }}
              >
                #1
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  Soonest Expiry Pulled Forward
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  Amoxicillin (Exp 10/26) · Automatic POS Dispatch
                </p>
              </div>
            </div>
            <span
              className="px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wide uppercase font-mono hidden sm:inline-block"
              style={{ background: TOKENS.amberDim, color: TOKENS.amber }}
            >
              FEFO Priority
            </span>
          </div>
        </div>

        {/* FEFO Interactive Queue Panel (Fixes Overflow Bug with Scroll & Internal Container) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold tracking-wider uppercase font-mono text-slate-600">
              Active Stock Queue (Expiring First Priority)
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Scrollable queue</span>
          </div>

          <div
            className="fefo-scrollbar space-y-2 overflow-y-auto max-h-[175px] pr-1.5"
            style={{ scrollbarWidth: 'thin' }}
          >
            {inventoryItems.map((item, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={item.lot}
                  onClick={() => setActiveItemIndex(idx)}
                  className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border"
                  style={{
                    background: isFirst ? 'rgba(193, 121, 31, 0.05)' : TOKENS.white,
                    borderColor: isFirst ? TOKENS.amber : TOKENS.mist,
                    boxShadow: isFirst ? '0 4px 12px rgba(193, 121, 31, 0.1)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold"
                      style={{
                        background: isFirst ? TOKENS.amber : TOKENS.mist,
                        color: isFirst ? TOKENS.white : TOKENS.ink,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-900">{item.name}</p>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.lot}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Exp: <span className="font-bold text-slate-800">{item.exp}</span> ({item.days} days remaining)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase"
                      style={{
                        background: isFirst ? TOKENS.amber : TOKENS.sageDim,
                        color: isFirst ? TOKENS.white : TOKENS.sage,
                      }}
                    >
                      {item.status}
                    </span>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Alert Badges - Redesigned to avoid clipping at all breakpoints */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className="flex items-center gap-3 p-3 rounded-2xl border"
          style={{
            background: TOKENS.white,
            borderColor: 'rgba(162, 59, 46, 0.25)',
            boxShadow: '0 4px 12px rgba(162, 59, 46, 0.08)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: TOKENS.brickDim }}
          >
            <AlertCircle size={18} style={{ color: TOKENS.brick }} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Low Stock Alert</p>
            <p className="text-[11px] font-mono text-slate-500">Amoxicillin 500mg (12 units left)</p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-2xl border"
          style={{
            background: TOKENS.white,
            borderColor: 'rgba(76, 99, 87, 0.25)',
            boxShadow: '0 4px 12px rgba(76, 99, 87, 0.08)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: TOKENS.sageDim }}
          >
            <CheckCircle2 size={18} style={{ color: TOKENS.sage }} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">FEFO Verified</p>
            <p className="text-[11px] font-mono text-slate-500">Zero expired items in active stock</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════════════ */
const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden"
      style={{ background: TOKENS.porcelain }}
    >
      {/* Background Subtle Apothecary Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${TOKENS.mist} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & CTAs */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 text-center lg:text-left"
          >
            {/* Tag Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
              style={{
                background: TOKENS.sageDim,
                borderColor: 'rgba(76, 99, 87, 0.25)',
              }}
            >
              <Sparkles size={14} style={{ color: TOKENS.sage }} />
              <span
                className="text-xs font-bold tracking-wider uppercase font-mono"
                style={{ color: TOKENS.sage }}
              >
                Apothecary-Grade Dispensing Engine
              </span>
            </div>

            {/* Display Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Precision pharmacy software,{' '}
              <span style={{ color: TOKENS.amber, fontStyle: 'italic' }}>
                grounded in FEFO.
              </span>
            </h1>

            {/* Body Copy */}
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Eliminate expired stock loss automatically. PharmaSys prioritizes shortest expiry batches first at checkout, tracks controlled substances, and simplifies multi-branch operations.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
              <Link
                to="/login"
                style={{
                  background: TOKENS.amber,
                  color: TOKENS.white,
                  boxShadow: '0 8px 24px rgba(193, 121, 31, 0.3)',
                }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-105 hover:shadow-xl"
              >
                Book a Demo <ArrowRight size={18} />
              </Link>
              <a
                href="#pricing"
                style={{
                  background: TOKENS.white,
                  color: TOKENS.ink,
                  border: `1.5px solid ${TOKENS.mist}`,
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all hover:bg-slate-50"
              >
                View Plans & Pricing
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-3.5 pt-4 border-t border-slate-300/60">
              <div className="flex -space-x-2">
                {['#C1791F', '#4C6357', '#1C2029', '#A23B2E'].map((bg, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-sm"
                    style={{ background: bg }}
                  >
                    {['RX', 'MD', 'PH', 'CP'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#C1791F" style={{ color: TOKENS.amber }} />
                  ))}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Trusted by <span className="font-bold text-slate-900">500+ licensed pharmacies</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D FEFO Shelf Showcase */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <FEFOShelfComponent />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   STATS STRIP
══════════════════════════════════════════════════════════════════════ */
const StatsStrip: React.FC = () => (
  <section style={{ background: TOKENS.ink }} className="py-12 sm:py-16 text-white border-y border-slate-800">
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p
              className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mb-1"
              style={{ color: TOKENS.amber }}
            >
              {s.value}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">{s.label}</p>
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
  <section id="features" className="py-20 sm:py-28" style={{ background: TOKENS.porcelain }}>
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span
          className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono mb-4 border"
          style={{ background: TOKENS.sageDim, borderColor: 'rgba(76, 99, 87, 0.2)', color: TOKENS.sage }}
        >
          Built for Licensed Pharmacists
        </span>
        <h2
          className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Pharmacy operations, refined
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Four essential capabilities designed specifically for community, clinical, and retail pharmacies.
        </p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="p-7 sm:p-8 rounded-3xl transition-all duration-300 border hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: TOKENS.white,
                borderColor: TOKENS.mist,
                boxShadow: '0 4px 20px rgba(28, 32, 41, 0.04)',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: feature.accentBg }}
                >
                  <Icon size={22} style={{ color: feature.accent }} />
                </div>
                <span className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: feature.accent }}>
                  {feature.tag}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {feature.desc}
              </p>

              <ul className="space-y-2.5 mb-6">
                {feature.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                    <CheckCircle2 size={16} style={{ color: feature.accent }} className="flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold font-mono uppercase tracking-wider hover:gap-2 transition-all"
                style={{ color: feature.accent }}
              >
                Explore Workflow <ArrowUpRight size={15} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   TESTIMONIALS SECTION
══════════════════════════════════════════════════════════════════════ */
const TestimonialsSection: React.FC = () => (
  <section id="testimonials" className="py-20 sm:py-28 text-white relative" style={{ background: TOKENS.ink }}>
    <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
      <div className="flex items-center justify-center gap-1 mb-8">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={20} fill="#C1791F" style={{ color: TOKENS.amber }} />
        ))}
      </div>

      <blockquote
        className="text-2xl sm:text-3xl md:text-4xl font-normal text-slate-100 leading-relaxed mb-10"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        "PharmaSys transformed how our pharmacy group operates.{' '}
        <span style={{ color: TOKENS.amber, fontStyle: 'italic' }}>
          FEFO batch tracking alone saved us over $14,000 in expired medication
        </span>{' '}
        within our first quarter."
      </blockquote>

      <div className="flex items-center justify-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-mono text-white"
          style={{ background: TOKENS.amber }}
        >
          SM
        </div>
        <div className="text-left">
          <p className="font-bold text-white text-base">Dr. Sarah M., PharmD</p>
          <p className="text-xs text-slate-400 font-mono">Managing Pharmacist · CityMed Pharmacy Network</p>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   SECURITY & TRUST SECTION
══════════════════════════════════════════════════════════════════════ */
const TrustSection: React.FC = () => (
  <section id="trust" className="py-20 sm:py-28" style={{ background: TOKENS.porcelain }}>
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span
          className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono mb-4 border"
          style={{ background: TOKENS.sageDim, borderColor: 'rgba(76, 99, 87, 0.2)', color: TOKENS.sage }}
        >
          Regulatory & Security
        </span>
        <h2
          className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Built for regulatory peace of mind
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Bank-grade encryption, immutable logs, and zero downtime architecture.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-6 rounded-2xl border bg-white transition-all hover:shadow-md"
              style={{ borderColor: TOKENS.mist }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: TOKENS.sageDim }}
              >
                <Icon size={20} style={{ color: TOKENS.sage }} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   PRICING SECTION (Explicitly fixes missing Pricing link requirement)
══════════════════════════════════════════════════════════════════════ */
const PricingSection: React.FC = () => (
  <section id="pricing" className="py-20 sm:py-28 bg-white border-t border-slate-200">
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span
          className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono mb-4 border"
          style={{ background: TOKENS.amberDim, borderColor: 'rgba(193, 121, 31, 0.2)', color: TOKENS.amber }}
        >
          Transparent Pricing
        </span>
        <h2
          className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Tailored to your pharmacy scale
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Simple monthly plans with no hidden license fees. Cancel or upgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Single Branch Plan */}
        <div
          className="p-8 rounded-3xl border bg-white flex flex-col justify-between"
          style={{ borderColor: TOKENS.mist }}
        >
          <div>
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">Single Location</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Standard Branch
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold font-mono text-slate-900">$149</span>
              <span className="text-sm font-mono text-slate-500">/ month / location</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['Full FEFO Batch Prioritization', 'POS & Barcode Scanner Integration', 'Prescription Lifecycle Tracking', '2,500 Monthly Rx Capacity'].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check size={16} style={{ color: TOKENS.sage }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/login"
            style={{ border: `1.5px solid ${TOKENS.ink}`, color: TOKENS.ink }}
            className="w-full py-3 rounded-xl font-bold text-sm text-center block transition-all hover:bg-slate-100"
          >
            Book Standard Demo
          </Link>
        </div>

        {/* Multi-Branch Group Plan */}
        <div
          className="p-8 rounded-3xl border relative bg-white flex flex-col justify-between shadow-xl"
          style={{ borderColor: TOKENS.amber }}
        >
          <div
            className="absolute -top-3.5 right-8 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono text-white"
            style={{ background: TOKENS.amber }}
          >
            Recommended for Groups
          </div>
          <div>
            <span className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: TOKENS.amber }}>
              Multi-Branch Network
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Enterprise Group
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold font-mono text-slate-900">$299</span>
              <span className="text-sm font-mono text-slate-500">/ month / network</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['Unlimited Branch Synchronization', 'Centralized Purchasing & Supplier Orders', 'Custom Controlled Substance Auditing', 'Unlimited Rx Capacity & Dedicated Account Manager'].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Check size={16} style={{ color: TOKENS.amber }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/login"
            style={{ background: TOKENS.amber, color: TOKENS.white }}
            className="w-full py-3 rounded-xl font-bold text-sm text-center block transition-all hover:scale-102 shadow-md"
          >
            Book Enterprise Demo
          </Link>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════════════════════════════ */
const CTABanner: React.FC = () => (
  <section className="py-20 sm:py-28" style={{ background: TOKENS.porcelain }}>
    <div className="max-w-5xl mx-auto px-5 sm:px-8">
      <div
        className="rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden"
        style={{ background: TOKENS.amber, boxShadow: '0 20px 60px rgba(193, 121, 31, 0.35)' }}
      >
        <h2
          className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Ready to eliminate expired inventory?
        </h2>
        <p className="text-amber-100 text-sm sm:text-base mb-8 max-w-xl mx-auto font-medium">
          Schedule a live walkthrough with our pharmacy solutions team. Setup takes under 5 minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            style={{ background: TOKENS.ink, color: TOKENS.white }}
            className="px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-105 shadow-lg"
          >
            Book a Demo Now
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base border border-white/40 text-white hover:bg-white/10 transition-all"
          >
            Sign In to Demo
          </Link>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════════════ */
const Footer: React.FC = () => (
  <footer style={{ background: TOKENS.ink }} className="text-slate-400 py-12 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: TOKENS.amber }}>
            <Link2 size={16} color="#FFF" />
          </div>
          <span className="font-bold text-white text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Pharma<span style={{ color: TOKENS.amber }}>Sys</span>
          </span>
        </Link>

        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <a key={l.name} href={l.href} className="hover:text-white transition-colors">
              {l.name}
            </a>
          ))}
          <Link to="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
        </div>

        <p className="text-xs font-mono text-slate-500">
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
    <div className="min-h-screen font-sans text-slate-900 relative" style={{ background: TOKENS.porcelain }}>
      <style>{KEYFRAMES}</style>
      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <TestimonialsSection />
      <TrustSection />
      <PricingSection />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Landing;
