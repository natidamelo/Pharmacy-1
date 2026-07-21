import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-primary-50 text-primary-600 border-primary-100',
  warning: 'bg-warning-50 text-warning-500 border-warning-100',
  danger: 'bg-danger-50 text-danger-500 border-danger-100',
  info: 'bg-blue-50 text-blue-600 border-blue-100',
  neutral: 'bg-surface-hover text-ink-muted border-border',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, size = 'sm' }) => (
  <span className={`
    inline-flex items-center rounded-full border font-medium
    ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}
    ${variantClasses[variant]}
  `}>
    {children}
  </span>
);
