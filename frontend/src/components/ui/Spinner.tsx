import React from 'react';

export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    className={`animate-spin ${className}`}
    aria-label="Loading"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      strokeDasharray="31.416" strokeDashoffset="10" />
  </svg>
);

export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size={32} className="text-primary" />
  </div>
);
