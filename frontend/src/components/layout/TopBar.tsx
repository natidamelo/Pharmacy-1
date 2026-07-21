import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { useAlertStore } from '../../store/alertStore';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  const { lowStockCount, expiringCount } = useAlertStore();
  const totalAlerts = lowStockCount + expiringCount;

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold font-display text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-ink-subtle">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {totalAlerts > 0 && (
          <div className="flex items-center gap-1.5 bg-warning-50 border border-warning-100 rounded-full px-3 py-1">
            <AlertTriangle size={12} className="text-warning" />
            <span className="text-xs font-medium text-warning">{totalAlerts} alert{totalAlerts !== 1 ? 's' : ''}</span>
          </div>
        )}
        <button
          className="relative p-2 rounded-xl hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Notifications"
          id="notifications-btn"
        >
          <Bell size={18} className="text-ink-muted" />
          {totalAlerts > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" aria-hidden />
          )}
        </button>
      </div>
    </header>
  );
};
