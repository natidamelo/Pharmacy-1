import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Package, BarChart3, Bell, FileText, Shield,
  Link2, ArrowRight, Star, CheckCircle2,
  Menu, X, AlertCircle, Zap, Headphones,
  Clock, ArrowUpRight, Sparkles, Check, RotateCcw, Play
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
  amberDim: 'rgba(193, 121, 31, 0.10)',
  sage: '#4C6357',
  sageDim: 'rgba(76, 99, 87, 0.10)',
  brick: '#A23B2E',
  brickDim: 'rgba(162, 59, 46, 0.10)',
  mist: '#D7DBD3',
  mistLight: '#F3F5F1',
  white: '#FFFFFF',
};

const KEYFRAMES = `
  .fefo-scrollbar::-webkit-scrollbar { width: 6px; }
  .fefo-scrollbar::-webkit-scrollbar-track { background: rgba(215, 219, 211, 0.4); border-radius: 4px; }
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

const INITIAL_INVENTORY = [
  { lot: 'LOT-9824', name: 'Amoxicillin 500mg', exp: '10/2026', days: 45, status: 'DISPENSE NEXT', count: '120 caps', priority: 1, category: 'Antibiotic' },
  { lot: 'LOT-9871', name: 'Metformin 850mg', exp: '04/2027', days: 240, status: 'Queue #2', count: '500 tabs', priority: 2, category: 'Antidiabetic' },
  { lot: 'LOT-9902', name: 'Atorvastatin 20mg', exp: '11/2027', days: 450, status: 'Queue #3', count: '250 tabs', priority: 3, category: 'Statin' },
  { lot: 'LOT-9945', name: 'Lisinopril 10mg', exp: '03/2028', days: 580, status: 'Queue #4', count: '1000 tabs', priority: 4, category: 'ACE Inhibitor' },
  { lot: 'LOT-9988', name: 'Omeprazole 20mg', exp: '08/2028', days: 740, status: 'Queue #5', count: '300 caps', priority: 5, category: 'PPI' },
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
      background: scrolled ? 'rgba(28, 32, 41, 0.96)' : 'rgba(238, 240, 236, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: scrolled ? `1px solid rgba(215, 219, 211, 0.15)` : `1px solid ${TOKENS.mist}`,
    }}
  >
    <div className="max-w-7xl mx-auto px-6 sm:px-10">
      <div className="flex items-center justify-between h-20 sm:h-24">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div
            style={{ background: TOKENS.amber, boxShadow: '0 4px 14px rgba(193, 121, 31, 0.28)' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          >
            <Link2 size={20} color="#FFF" strokeWidth={2.5} />
          </div>
          <span
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: scrolled ? TOKENS.porcelain : TOKENS.ink }}
          >
            Pharma<span style={{ color: TOKENS.amber }}>Sys</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="text-base font-medium transition-colors hover:text-[#C1791F]"
              style={{ color: scrolled ? 'rgba(238, 240, 236, 0.85)' : TOKENS.ink }}
            >
              {l.name}
            </a>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <Link
            to="/login"
            className="text-base font-semibold transition-colors px-4 py-2.5 rounded-xl"
            style={{ color: scrolled ? TOKENS.porcelain : TOKENS.ink }}
          >
            Sign In
          </Link>
          <Link
            to="/login"
            style={{
              background: TOKENS.amber,
              color: TOKENS.white,
              boxShadow: '0 6px 20px rgba(193, 121, 31, 0.3)',
            }}
            className="px-6 py-3 rounded-xl text-base font-bold transition-all hover:scale-105 hover:shadow-lg"
          >
            Book a Demo
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2.5 rounded-xl transition-colors"
          style={{ color: scrolled ? TOKENS.porcelain : TOKENS.ink }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden py-5 px-4 space-y-3 rounded-b-2xl border-t shadow-2xl"
          style={{ background: TOKENS.ink, borderColor: 'rgba(215, 219, 211, 0.15)' }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-base font-medium rounded-xl text-slate-200 hover:text-white hover:bg-white/10"
            >
              {l.name}
            </a>
          ))}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-base font-semibold text-slate-300 text-center rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{ background: TOKENS.amber, color: TOKENS.white }}
              className="block px-6 py-3.5 rounded-xl text-base font-bold text-center shadow-lg"
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
   UPGRADED HERO CENTERPIECE: INTERACTIVE FEFO QUEUE & DISPENSE SIMULATOR
══════════════════════════════════════════════════════════════════════ */
const FEFOShelfComponent: React.FC = () => {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [dispensedCount, setDispensedCount] = useState(0);
  const [lastDispensed, setLastDispensed] = useState<string | null>(null);

  const handleSimulateDispense = () => {
    if (items.length <= 1) return;
    const dispatched = items[0];
    setLastDispensed(dispatched.name);
    setDispensedCount((prev) => prev + 1);

    const remaining = items.slice(1).map((item, idx) => ({
      ...item,
      priority: idx + 1,
      status: idx === 0 ? 'DISPENSE NEXT' : `Queue #${idx + 1}`,
    }));

    setItems(remaining);
  };

  const handleReset = () => {
    setItems(INITIAL_INVENTORY);
    setLastDispensed(null);
  };

  return (
    <div className="relative w-full">
      {/* Main Showcase Container */}
      <div
        className="relative rounded-3xl p-6 sm:p-8 transition-all"
        style={{
          background: TOKENS.white,
          border: `1.5px solid ${TOKENS.mist}`,
          boxShadow: '0 24px 60px rgba(28, 32, 41, 0.08), 0 4px 16px rgba(28, 32, 41, 0.03)',
        }}
      >
        {/* Header Bar with Interactive Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full animate-pulse" style={{ background: TOKENS.amber }} />
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase font-mono text-slate-800">
              Interactive FEFO Queue Simulator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateDispense}
              disabled={items.length <= 1}
              style={{ background: TOKENS.amber, color: TOKENS.white }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all hover:scale-105 disabled:opacity-50 shadow-sm"
            >
              <Play size={13} /> Simulate POS Dispense
            </button>
            <button
              onClick={handleReset}
              style={{ background: TOKENS.mistLight, color: TOKENS.ink }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors hover:bg-slate-200"
              title="Reset Queue"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Hero Image Showcase */}
        <div className="relative rounded-2xl overflow-hidden mb-6 bg-slate-900 shadow-md">
          <img
            src="/fefo_shelf_hero.jpg"
            alt="Pharmacy FEFO Shelf Queue"
            className="w-full h-60 sm:h-72 object-cover object-center"
          />

          {/* Dynamic Top Badge */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between flex-wrap gap-2">
            <span
              className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold tracking-wider uppercase font-mono shadow-md"
              style={{ background: TOKENS.amber, color: TOKENS.white }}
            >
              #1 Expiry Pulled Forward
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-black/70 text-white backdrop-blur-md">
              Dispensed: {dispensedCount} batches
            </span>
          </div>

          {/* Last Dispensed Toast Banner */}
          <AnimatePresence>
            {lastDispensed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-4 right-4 bg-emerald-900/90 text-emerald-100 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-between shadow-lg border border-emerald-500/30"
              >
                <span>✓ Successfully Dispatched: <strong className="text-white">{lastDispensed}</strong></span>
                <span className="text-[10px] text-emerald-300">FEFO Verified</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live FEFO Stock Queue Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase font-mono text-slate-700">
              Live Stock Queue ({items.length} Batches Active)
            </h4>
            <span className="text-xs font-mono text-amber-700 font-semibold">Soonest Expiry First</span>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={item.lot}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl transition-all border"
                    style={{
                      background: isFirst ? 'rgba(193, 121, 31, 0.06)' : TOKENS.white,
                      borderColor: isFirst ? TOKENS.amber : TOKENS.mist,
                      boxShadow: isFirst ? '0 4px 16px rgba(193, 121, 31, 0.12)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-[200px]">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                        style={{
                          background: isFirst ? TOKENS.amber : TOKENS.mist,
                          color: isFirst ? TOKENS.white : TOKENS.ink,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm sm:text-base font-bold text-slate-900">{item.name}</p>
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.lot}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Exp: <span className="font-bold text-slate-800">{item.exp}</span> ({item.days} days remaining)
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className="inline-block px-3 py-1 rounded-md text-xs font-bold font-mono uppercase"
                        style={{
                          background: isFirst ? TOKENS.amber : TOKENS.sageDim,
                          color: isFirst ? TOKENS.white : TOKENS.sage,
                        }}
                      >
                        {item.status}
                      </span>
                      <p className="text-xs font-mono text-slate-400 mt-1">{item.count}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Status Cards — Clean Grid Row Below */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="flex items-center gap-3.5 p-4 rounded-2xl border bg-white"
          style={{
            borderColor: 'rgba(162, 59, 46, 0.25)',
            boxShadow: '0 4px 16px rgba(162, 59, 46, 0.06)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: TOKENS.brickDim }}
          >
            <AlertCircle size={20} style={{ color: TOKENS.brick }} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Low Stock Trigger</p>
            <p className="text-xs font-mono text-slate-500">Amoxicillin 500mg (12 units left)</p>
          </div>
        </div>

        <div
          className="flex items-center gap-3.5 p-4 rounded-2xl border bg-white"
          style={{
            borderColor: 'rgba(76, 99, 87, 0.25)',
            boxShadow: '0 4px 16px rgba(76, 99, 87, 0.06)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: TOKENS.sageDim }}
          >
            <CheckCircle2 size={20} style={{ color: TOKENS.sage }} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">FEFO Verified</p>
            <p className="text-xs font-mono text-slate-500">Zero expired items in active stock</p>
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
      className="relative pt-32 sm:pt-40 pb-24 sm:pb-32 overflow-hidden"
      style={{ background: TOKENS.porcelain }}
    >
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${TOKENS.mist} 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Text & CTAs */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 text-center lg:text-left"
          >
            {/* Tag Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
              style={{
                background: TOKENS.sageDim,
                borderColor: 'rgba(76, 99, 87, 0.25)',
              }}
            >
              <Sparkles size={16} style={{ color: TOKENS.sage }} />
              <span
                className="text-xs sm:text-sm font-bold tracking-wider uppercase font-mono"
                style={{ color: TOKENS.sage }}
              >
                Apothecary-Grade Dispensing Engine
              </span>
            </div>

            {/* Display Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.15]"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Precision pharmacy software,{' '}
              <span style={{ color: TOKENS.amber, fontStyle: 'italic' }}>
                grounded in FEFO.
              </span>
            </h1>

            {/* Body Copy */}
            <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Eliminate expired stock loss automatically. PharmaSys prioritizes shortest expiry batches first at checkout, tracks controlled substances, and simplifies multi-branch operations.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-12">
              <Link
                to="/login"
                style={{
                  background: TOKENS.amber,
                  color: TOKENS.white,
                  boxShadow: '0 8px 24px rgba(193, 121, 31, 0.32)',
                }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                Book a Demo <ArrowRight size={20} />
              </Link>
              <a
                href="#pricing"
                style={{
                  background: TOKENS.white,
                  color: TOKENS.ink,
                  border: `1.5px solid ${TOKENS.mist}`,
                }}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all hover:bg-slate-50"
              >
                View Plans & Pricing
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-6 border-t border-slate-300/70">
              <div className="flex -space-x-2.5">
                {['#C1791F', '#4C6357', '#1C2029', '#A23B2E'].map((bg, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white font-mono shadow-sm"
                    style={{ background: bg }}
                  >
                    {['RX', 'MD', 'PH', 'CP'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#C1791F" style={{ color: TOKENS.amber }} />
                  ))}
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  Trusted by <span className="font-bold text-slate-900">500+ licensed pharmacies</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive FEFO Shelf Showcase */}
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
  <section style={{ background: TOKENS.ink }} className="py-16 sm:py-20 text-white border-y border-slate-800">
    <div className="max-w-7xl mx-auto px-6 sm:px-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p
              className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono mb-2"
              style={{ color: TOKENS.amber }}
            >
              {s.value}
            </p>
            <p className="text-sm sm:text-base text-slate-400 font-medium">{s.label}</p>
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
  <section id="features" className="py-24 sm:py-32" style={{ background: TOKENS.porcelain }}>
    <div className="max-w-7xl mx-auto px-6 sm:px-10">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-20">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider font-mono mb-5 border"
          style={{ background: TOKENS.sageDim, borderColor: 'rgba(76, 99, 87, 0.2)', color: TOKENS.sage }}
        >
          Built for Licensed Pharmacists
        </span>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-5"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Pharmacy operations, refined
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Four essential capabilities designed specifically for community, clinical, and retail pharmacies.
        </p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 gap-8 lg:gap-10">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="p-8 sm:p-10 rounded-3xl transition-all duration-300 border hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
              style={{
                background: TOKENS.white,
                borderColor: TOKENS.mist,
                boxShadow: '0 8px 30px rgba(28, 32, 41, 0.04)',
              }}
            >
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: feature.accentBg }}
                  >
                    <Icon size={26} style={{ color: feature.accent }} />
                  </div>
                  <span className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: feature.accent }}>
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {feature.title}
                </h3>
                <p className="text-base text-slate-600 mb-8 leading-relaxed">
                  {feature.desc}
                </p>

                <ul className="space-y-3 mb-8">
                  {feature.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm sm:text-base font-medium text-slate-700">
                      <CheckCircle2 size={18} style={{ color: feature.accent }} className="flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-bold font-mono uppercase tracking-wider hover:gap-3 transition-all pt-4 border-t border-slate-100"
                style={{ color: feature.accent }}
              >
                Explore Workflow <ArrowUpRight size={16} />
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
  <section id="testimonials" className="py-24 sm:py-32 text-white relative" style={{ background: TOKENS.ink }}>
    <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center relative z-10">
      <div className="flex items-center justify-center gap-1.5 mb-10">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={22} fill="#C1791F" style={{ color: TOKENS.amber }} />
        ))}
      </div>

      <blockquote
        className="text-2xl sm:text-4xl lg:text-5xl font-normal text-slate-100 leading-relaxed mb-12"
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
          className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold font-mono text-white"
          style={{ background: TOKENS.amber }}
        >
          SM
        </div>
        <div className="text-left">
          <p className="font-bold text-white text-lg">Dr. Sarah M., PharmD</p>
          <p className="text-sm text-slate-400 font-mono">Managing Pharmacist · CityMed Pharmacy Network</p>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   SECURITY & TRUST SECTION
══════════════════════════════════════════════════════════════════════ */
const TrustSection: React.FC = () => (
  <section id="trust" className="py-24 sm:py-32" style={{ background: TOKENS.porcelain }}>
    <div className="max-w-7xl mx-auto px-6 sm:px-10">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider font-mono mb-5 border"
          style={{ background: TOKENS.sageDim, borderColor: 'rgba(76, 99, 87, 0.2)', color: TOKENS.sage }}
        >
          Regulatory & Security
        </span>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-5"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Built for regulatory peace of mind
        </h2>
        <p className="text-slate-600 text-base sm:text-lg">
          Bank-grade encryption, immutable logs, and zero downtime architecture.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-7 rounded-2xl border bg-white transition-all hover:shadow-lg"
              style={{ borderColor: TOKENS.mist }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: TOKENS.sageDim }}
              >
                <Icon size={22} style={{ color: TOKENS.sage }} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2.5">{item.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   PRICING SECTION
══════════════════════════════════════════════════════════════════════ */
const PricingSection: React.FC = () => (
  <section id="pricing" className="py-24 sm:py-32 bg-white border-t border-slate-200">
    <div className="max-w-7xl mx-auto px-6 sm:px-10">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider font-mono mb-5 border"
          style={{ background: TOKENS.amberDim, borderColor: 'rgba(193, 121, 31, 0.2)', color: TOKENS.amber }}
        >
          Transparent Pricing
        </span>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-5"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Tailored to your pharmacy scale
        </h2>
        <p className="text-slate-600 text-base sm:text-lg">
          Simple monthly plans with no hidden license fees. Cancel or upgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Single Branch Plan */}
        <div
          className="p-10 rounded-3xl border bg-white flex flex-col justify-between"
          style={{ borderColor: TOKENS.mist }}
        >
          <div>
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">Single Location</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-2 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Standard Branch
            </h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-extrabold font-mono text-slate-900">$149</span>
              <span className="text-base font-mono text-slate-500">/ month / location</span>
            </div>
            <ul className="space-y-4 mb-10">
              {['Full FEFO Batch Prioritization', 'POS & Barcode Scanner Integration', 'Prescription Lifecycle Tracking', '2,500 Monthly Rx Capacity'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-base text-slate-700">
                  <Check size={18} style={{ color: TOKENS.sage }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/login"
            style={{ border: `1.5px solid ${TOKENS.ink}`, color: TOKENS.ink }}
            className="w-full py-4 rounded-xl font-bold text-base text-center block transition-all hover:bg-slate-100"
          >
            Book Standard Demo
          </Link>
        </div>

        {/* Multi-Branch Group Plan */}
        <div
          className="p-10 rounded-3xl border relative bg-white flex flex-col justify-between shadow-2xl"
          style={{ borderColor: TOKENS.amber }}
        >
          <div
            className="absolute -top-4 right-10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono text-white shadow-md"
            style={{ background: TOKENS.amber }}
          >
            Recommended for Groups
          </div>
          <div>
            <span className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: TOKENS.amber }}>
              Multi-Branch Network
            </span>
            <h3 className="text-3xl font-bold text-slate-900 mt-2 mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Enterprise Group
            </h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-extrabold font-mono text-slate-900">$299</span>
              <span className="text-base font-mono text-slate-500">/ month / network</span>
            </div>
            <ul className="space-y-4 mb-10">
              {['Unlimited Branch Synchronization', 'Centralized Purchasing & Supplier Orders', 'Custom Controlled Substance Auditing', 'Unlimited Rx Capacity & Dedicated Account Manager'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-base text-slate-700">
                  <Check size={18} style={{ color: TOKENS.amber }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/login"
            style={{ background: TOKENS.amber, color: TOKENS.white }}
            className="w-full py-4 rounded-xl font-bold text-base text-center block transition-all hover:scale-102 shadow-lg"
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
  <section className="py-24 sm:py-32" style={{ background: TOKENS.porcelain }}>
    <div className="max-w-6xl mx-auto px-6 sm:px-10">
      <div
        className="rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl"
        style={{ background: TOKENS.amber }}
      >
        <h2
          className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Ready to eliminate expired inventory?
        </h2>
        <p className="text-amber-100 text-base sm:text-xl mb-10 max-w-2xl mx-auto font-medium">
          Schedule a live walkthrough with our pharmacy solutions team. Setup takes under 5 minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          <Link
            to="/login"
            style={{ background: TOKENS.ink, color: TOKENS.white }}
            className="px-9 py-4 rounded-xl font-bold text-base sm:text-lg transition-all hover:scale-105 shadow-xl"
          >
            Book a Demo Now
          </Link>
          <Link
            to="/login"
            className="px-9 py-4 rounded-xl font-semibold text-base sm:text-lg border border-white/40 text-white hover:bg-white/10 transition-all"
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
  <footer style={{ background: TOKENS.ink }} className="text-slate-400 py-16 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6 sm:px-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: TOKENS.amber }}>
            <Link2 size={18} color="#FFF" />
          </div>
          <span className="font-bold text-white text-xl" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Pharma<span style={{ color: TOKENS.amber }}>Sys</span>
          </span>
        </Link>

        <div className="flex flex-wrap justify-center gap-8 text-base font-medium">
          {NAV_LINKS.map((l) => (
            <a key={l.name} href={l.href} className="hover:text-white transition-colors">
              {l.name}
            </a>
          ))}
          <Link to="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
        </div>

        <p className="text-sm font-mono text-slate-500">
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
