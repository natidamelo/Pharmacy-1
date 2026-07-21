import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary:   { backgroundColor: '#0F6E5C', color: '#ffffff', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  secondary: { backgroundColor: '#ffffff', color: '#15191C', border: '1px solid #DDE4E2', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  danger:    { backgroundColor: '#C0392B', color: '#ffffff', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  warning:   { backgroundColor: '#C17A1F', color: '#ffffff', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  ghost:     { backgroundColor: 'transparent', color: '#4A5568', border: 'none' },
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading = false, icon, children, className = '', disabled, style, ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    style={{ ...variantStyles[variant], ...style }}
    className={`
      inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[size]} ${className}
    `}
  >
    {loading ? <Loader2 className="animate-spin" size={14} /> : icon}
    {children}
  </button>
);
