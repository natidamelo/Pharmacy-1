import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary shadow-sm',
  secondary: 'bg-white text-ink border border-border hover:bg-surface-hover focus-visible:ring-primary shadow-sm',
  danger: 'bg-danger text-white hover:bg-danger-light focus-visible:ring-danger shadow-sm',
  warning: 'bg-warning text-white hover:opacity-90 focus-visible:ring-warning shadow-sm',
  ghost: 'text-ink-muted hover:bg-surface-hover hover:text-ink focus-visible:ring-primary',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading = false, icon, children, className = '', disabled, ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center font-medium font-body transition-all duration-150
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]} ${sizeClasses[size]} ${className}
    `}
  >
    {loading ? <Loader2 className="animate-spin" size={14} /> : icon}
    {children}
  </button>
);
