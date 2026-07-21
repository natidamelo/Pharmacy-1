import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-ink p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Pill size={20} className="text-white" />
          </div>
          <span className="text-white font-display font-bold text-xl">PharmaSys</span>
        </div>
        <div>
          <h2 className="text-white font-display font-bold text-4xl leading-tight mb-4">
            Precision at every<br />dispensing point.
          </h2>
          <p className="text-white/50 text-base">
            Full-spectrum pharmacy management — inventory, sales, prescriptions, and insights in one place.
          </p>
        </div>
        <div className="flex gap-4">
          {[['200+', 'Products tracked'], ['FEFO', 'Smart dispensing'], ['Live', 'Stock alerts']].map(([stat, label]) => (
            <div key={stat}>
              <div className="text-primary font-display font-bold text-2xl">{stat}</div>
              <div className="text-white/40 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Pill size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-ink">PharmaSys</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-ink mb-1">Sign in</h1>
            <p className="text-ink-subtle text-sm">Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <Input
              label="Email address"
              type="email"
              id="login-email"
              placeholder="admin@pharmacy.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="login-password" className="text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border text-sm text-ink bg-white px-3 py-2.5 pr-10
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink focus-visible:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-xs text-danger">{error}</p>}
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg" id="login-submit">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
