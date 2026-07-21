import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: { bg: 'rgba(15,110,92,0.1)',  color: '#0F6E5C', border: 'rgba(15,110,92,0.2)' },
  warning: { bg: 'rgba(193,122,31,0.1)', color: '#C17A1F', border: 'rgba(193,122,31,0.2)' },
  danger:  { bg: 'rgba(192,57,43,0.1)',  color: '#C0392B', border: 'rgba(192,57,43,0.2)' },
  info:    { bg: 'rgba(29,78,216,0.1)',  color: '#1d4ed8', border: 'rgba(29,78,216,0.2)' },
  neutral: { bg: '#F1F5F9',              color: '#64748B', border: '#E2E8F0' },
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, size = 'sm' }) => {
  const v = variantStyles[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: 20, border: `1px solid ${v.border}`,
      backgroundColor: v.bg, color: v.color,
      fontSize: size === 'sm' ? 11 : 12, fontWeight: 600,
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};
