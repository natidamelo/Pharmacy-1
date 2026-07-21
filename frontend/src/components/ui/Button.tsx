import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary:   { background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)', color: '#ffffff', border: 'none', boxShadow: '0 4px 12px rgba(15,110,92,0.3)' },
  secondary: { backgroundColor: '#ffffff', color: '#0D1117', border: '1.5px solid #E8EDE9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  danger:    { background: 'linear-gradient(135deg, #C0392B 0%, #e74c3c 100%)', color: '#ffffff', border: 'none', boxShadow: '0 4px 12px rgba(192,57,43,0.3)' },
  warning:   { background: 'linear-gradient(135deg, #C17A1F 0%, #f39c12 100%)', color: '#ffffff', border: 'none', boxShadow: '0 4px 12px rgba(193,122,31,0.3)' },
  ghost:     { backgroundColor: 'transparent', color: '#4A5568', border: 'none' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12, borderRadius: 8, gap: 6 },
  md: { padding: '9px 16px', fontSize: 13, borderRadius: 10, gap: 7 },
  lg: { padding: '12px 22px', fontSize: 15, borderRadius: 12, gap: 8 },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading = false, icon, children, disabled, style, ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
      opacity: (disabled || loading) ? 0.6 : 1, transition: 'all 0.15s ease',
      fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.1px',
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    }}
  >
    {loading ? <Loader2 size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
    {children}
  </button>
);
