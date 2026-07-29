import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

/* ── Feature bullets shown on the left brand panel ──────────────────── */
const FEATURES = [
  'FEFO batch tracking — first-expired, first-dispensed',
  'Smart alerts for low-stock & near-expiry products',
  'Real-time analytics across all sales & inventory',
  'Full prescription lifecycle management',
];

/* ══════════════════════════════════════════════════════════════════════
   LOGIN PAGE  —  Fresh light design, matching landing page aesthetic
══════════════════════════════════════════════════════════════════════ */
export const Login: React.FC = () => {
  const navigate    = useNavigate();
  const setAuth     = useAuthStore((s) => s.setAuth);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

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

  /* ── Shared input style helpers ── */
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
    e.target.style.boxShadow   = '0 0 0 3px rgba(5,150,105,0.13)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E2E8F0';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>

      {/* ════════════════════════════════════════════════════════════════
          LEFT — Emerald brand panel  (hidden on mobile)
      ════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex"
        style={{
          width: '54%', flexShrink: 0, flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px 56px',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(155deg, #059669 0%, #0d9488 52%, #14b8a6 100%)',
        }}
      >
        {/* ── Decorative blurred circles ── */}
        {[
          { t: -80,  r: -80,  s: 340, o: 0.12 },
          { b: -100, l: -60,  s: 280, o: 0.08 },
          { t: '42%',r: '12%',s: 180, o: 0.07 },
        ].map((c, i) => (
          <div key={i} aria-hidden="true" style={{
            position: 'absolute',
            top: c.t, bottom: c.b, left: c.l, right: c.r,
            width: c.s, height: c.s, borderRadius: '50%',
            background: `rgba(255,255,255,${c.o})`,
            filter: 'blur(48px)', pointerEvents: 'none',
          }} />
        ))}

        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 15,
            background: 'rgba(255,255,255,0.22)',
            border: '1.5px solid rgba(255,255,255,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <Pill size={22} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.4px', lineHeight: 1.1 }}>
              PharmaSys
            </div>
            <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: 11, letterSpacing: '0.3px' }}>
              Pharmacy Management Platform
            </div>
          </div>
        </div>

        {/* ── Central content ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            color: '#fff', fontWeight: 800, letterSpacing: '-1.2px',
            fontSize: 'clamp(30px, 3.2vw, 44px)', lineHeight: 1.08, margin: '0 0 18px',
          }}>
            The smarter way<br />to run your pharmacy.
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7,
            margin: '0 0 36px', maxWidth: 420,
          }}>
            Join 500+ pharmacies managing inventory, dispensing, and
            prescriptions — all in one place.
          </p>

          {/* Feature checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: 'rgba(255,255,255,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.38)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={13} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.55 }}>
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Testimonial card ── */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            background: 'rgba(255,255,255,0.13)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 20, padding: '20px 24px',
            backdropFilter: 'blur(14px)',
          }}
        >
          <p style={{
            color: 'rgba(255,255,255,0.88)', fontSize: 14,
            lineHeight: 1.65, fontStyle: 'italic', margin: '0 0 16px',
          }}>
            "PharmaSys transformed how we manage our 3 locations. Inventory
            is always accurate, and we've eliminated stockouts completely."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.18) 100%)',
              border: '1.5px solid rgba(255,255,255,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>SM</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Dr. Sarah M., PharmD</div>
              <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11 }}>Owner, CityMed Pharmacy Group</div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          RIGHT — Clean login panel
      ════════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
        background: '#F8FAFC',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle emerald glow */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: -80, right: -80, width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
            }}>
              <Pill size={19} color="#fff" strokeWidth={2.2} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', letterSpacing: '-0.4px' }}>
              Pharma<span style={{ color: '#059669' }}>Sys</span>
            </span>
          </div>

          {/* Login card */}
          <div style={{
            background: '#fff',
            borderRadius: 24, padding: '36px 36px 32px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
          }}>
            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontSize: 26, fontWeight: 800, color: '#0F172A',
                letterSpacing: '-0.5px', margin: '0 0 6px', lineHeight: 1.1,
              }}>
                Welcome back 👋
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                Sign in to your PharmaSys account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} id="login-form" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Email */}
              <div>
                <label htmlFor="login-email" style={{
                  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7,
                }}>
                  Email address
                </label>
                <input
                  id="login-email" type="email" placeholder="admin@pharmacy.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoFocus autoComplete="email"
                  style={inputBase} onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" style={{
                  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7,
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password" type={show ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required autoComplete="current-password"
                    style={{ ...inputBase, paddingRight: 44 }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                  <button
                    type="button" onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#94A3B8', padding: 4,
                      display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#059669'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    marginTop: 9, padding: '9px 13px', borderRadius: 10,
                    background: '#FFF1F2', border: '1px solid #FECDD3',
                    fontSize: 12, color: '#E11D48', fontWeight: 500,
                  }}>
                    {error}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit" id="login-submit" disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                  background: loading
                    ? '#E2E8F0'
                    : 'linear-gradient(135deg, #059669 0%, #0d9488 60%, #14b8a6 100%)',
                  color: loading ? '#94A3B8' : '#fff',
                  fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(5,150,105,0.38)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  fontFamily: "'Inter', sans-serif",
                  marginTop: 4,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 28px rgba(5,150,105,0.50)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? 'none' : '0 6px 20px rgba(5,150,105,0.38)';
                }}
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                  : <>Sign in <ArrowRight size={16} /></>
                }
              </button>
            </form>
          </div>

          {/* Demo credentials */}
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 12,
            background: '#F1F5F9', border: '1px solid #E2E8F0',
          }}>
            <p style={{ fontSize: 12, color: '#64748B', margin: 0, textAlign: 'center' }}>
              <strong style={{ color: '#374151' }}>Demo:</strong>{' '}
              admin@pharmacy.com / Admin@1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
