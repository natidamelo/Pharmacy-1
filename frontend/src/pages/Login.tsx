import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

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
      setError('Invalid email or password');
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F5F7F6' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12"
        style={{ backgroundColor: '#15191C' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, backgroundColor: '#0F6E5C',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Pill size={20} color="#ffffff" />
          </div>
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif" }}>
            PharmaSys
          </span>
        </div>

        <div>
          <h2 style={{
            color: '#ffffff', fontWeight: 700, fontSize: '2.25rem',
            lineHeight: 1.2, marginBottom: '1rem', fontFamily: "'Space Grotesk', sans-serif"
          }}>
            Precision at every<br />dispensing point.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
            Full-spectrum pharmacy management — inventory, sales, prescriptions, and insights in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['200+', 'Products tracked'], ['FEFO', 'Smart dispensing'], ['Live', 'Stock alerts']].map(([stat, label]) => (
            <div key={stat}>
              <div style={{ color: '#0F6E5C', fontWeight: 700, fontSize: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div style={{
              width: 32, height: 32, backgroundColor: '#0F6E5C',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Pill size={16} color="#ffffff" />
            </div>
            <span style={{ fontWeight: 700, color: '#15191C', fontFamily: "'Space Grotesk', sans-serif" }}>PharmaSys</span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 700, color: '#15191C',
              fontFamily: "'Space Grotesk', sans-serif", marginBottom: '0.25rem'
            }}>
              Sign in
            </h1>
            <p style={{ color: '#718096', fontSize: '0.875rem' }}>
              Enter your credentials to access the system
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="login-form">
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label
                htmlFor="login-email"
                style={{ fontSize: '0.875rem', fontWeight: 500, color: '#15191C' }}
              >
                Email address <span style={{ color: '#C0392B' }}>*</span>
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
                  width: '100%', borderRadius: 8, border: '1px solid #DDE4E2',
                  fontSize: '0.875rem', color: '#15191C', backgroundColor: '#ffffff',
                  padding: '0.625rem 0.75rem', outline: 'none', transition: 'border-color 0.15s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#DDE4E2'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label
                htmlFor="login-password"
                style={{ fontSize: '0.875rem', fontWeight: 500, color: '#15191C' }}
              >
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
                    width: '100%', borderRadius: 8, border: '1px solid #DDE4E2',
                    fontSize: '0.875rem', color: '#15191C', backgroundColor: '#ffffff',
                    padding: '0.625rem 2.5rem 0.625rem 0.75rem', outline: 'none',
                    transition: 'border-color 0.15s', boxSizing: 'border-box'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#DDE4E2'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#718096', padding: 0,
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p style={{ fontSize: '0.75rem', color: '#C0392B', marginTop: '0.25rem' }}>{error}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
              id="login-submit"
              style={{ width: '100%', borderRadius: 12 }}
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
