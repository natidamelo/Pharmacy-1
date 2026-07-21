import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const features = [
  { icon: '🔬', title: 'FEFO Dispensing', desc: 'First-Expired-First-Out batch tracking' },
  { icon: '📊', title: 'Live Analytics', desc: 'Real-time sales and inventory insights' },
  { icon: '🔔', title: 'Smart Alerts', desc: 'Proactive low stock and expiry warnings' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
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
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F5F7F6' }}>

      {/* ── Left: Dark brand panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '42%', flexShrink: 0,
          background: 'linear-gradient(160deg, #0D1117 0%, #111827 60%, #0a1628 100%)',
          flexDirection: 'column', justifyContent: 'space-between',
          padding: '40px 48px', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative glows */}
        <div style={{
          position: 'absolute', top: -80, left: -80, width: 320, height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,110,92,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 60, right: -60, width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(15,110,92,0.4)',
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
        </div>

        {/* Headline */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(15,110,92,0.15)', border: '1px solid rgba(15,110,92,0.3)',
            borderRadius: 20, padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9488', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Live System
            </span>
          </div>

          <h2 style={{
            color: '#ffffff', fontWeight: 700, fontSize: 38,
            lineHeight: 1.15, fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '-1px', margin: '0 0 16px',
          }}>
            Precision at every<br />
            <span style={{
              background: 'linear-gradient(135deg, #0d9488, #34d399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              dispensing point.
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            Full-spectrum pharmacy management — inventory, FEFO dispensing, sales, prescriptions, and live alerts in one place.
          </p>

          {/* Feature cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map(f => (
              <div key={f.title} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '13px 16px',
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{f.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 28, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
        }}>
          {[['200+', 'Products tracked'], ['FEFO', 'Smart dispensing'], ['Live', 'Stock alerts']].map(([stat, label]) => (
            <div key={stat}>
              <div style={{
                color: '#0d9488', fontWeight: 700, fontSize: 20,
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px',
              }}>
                {stat}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
        background: 'linear-gradient(135deg, #F5F7F6 0%, #EEF2F0 100%)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Pill size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#0D1117', fontFamily: "'Space Grotesk', sans-serif" }}>
              PharmaSys
            </span>
          </div>

          {/* Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: '36px 36px 32px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontSize: 26, fontWeight: 700, color: '#0D1117',
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '-0.5px', margin: '0 0 6px',
              }}>
                Welcome back 👋
              </h1>
              <p style={{ fontSize: 13, color: '#718096', margin: 0, lineHeight: 1.5 }}>
                Sign in to your PharmaSys account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} id="login-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email */}
              <div>
                <label htmlFor="login-email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@pharmacy.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  style={{
                    display: 'block', width: '100%', borderRadius: 10,
                    border: '1.5px solid #DDE4E2', fontSize: 14, color: '#0D1117',
                    backgroundColor: '#F9FAFB', padding: '11px 14px',
                    outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#0F6E5C';
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#DDE4E2';
                    e.target.style.backgroundColor = '#F9FAFB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{
                      display: 'block', width: '100%', borderRadius: 10,
                      border: '1.5px solid #DDE4E2', fontSize: 14, color: '#0D1117',
                      backgroundColor: '#F9FAFB', padding: '11px 44px 11px 14px',
                      outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#0F6E5C';
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.12)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#DDE4E2';
                      e.target.style.backgroundColor = '#F9FAFB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#94A3B8', padding: 4, display: 'flex', alignItems: 'center',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#4A5568'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && (
                  <div style={{
                    marginTop: 8, padding: '8px 12px', borderRadius: 8,
                    backgroundColor: 'rgba(192,57,43,0.08)',
                    border: '1px solid rgba(192,57,43,0.2)',
                    fontSize: 12, color: '#C0392B', fontWeight: 500,
                  }}>
                    {error}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                  background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(15,110,92,0.4)',
                  transition: 'all 0.2s', fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.1px', marginTop: 4,
                }}
                onMouseEnter={e => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(15,110,92,0.55)';
                }}
                onMouseLeave={e => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(15,110,92,0.4)';
                }}
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                  : <>Sign in <ArrowRight size={16} /></>
                }
              </button>
            </form>

            {/* Demo credentials hint */}
            <div style={{
              marginTop: 20, padding: '12px 14px', borderRadius: 10,
              backgroundColor: '#F8FAF9', border: '1px solid #EEF2F0',
            }}>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                <strong style={{ color: '#4A5568' }}>Demo:</strong>{' '}
                admin@pharmacy.com / Admin@1234
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
