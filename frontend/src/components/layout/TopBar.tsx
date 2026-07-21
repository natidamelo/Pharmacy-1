import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { useAlertStore } from '../../store/alertStore';
import { useAuthStore } from '../../store/authStore';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, actions }) => {
  const { lowStockCount, expiringCount } = useAlertStore();
  const { user } = useAuthStore();
  const totalAlerts = lowStockCount + expiringCount;

  return (
    <header style={{
      height: 64,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #EEF2F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
    }}>
      {/* Left: Title */}
      <div>
        <h1 style={{
          fontSize: 17, fontWeight: 700, color: '#0D1117',
          fontFamily: "'Space Grotesk', sans-serif",
          lineHeight: 1.2, letterSpacing: '-0.3px', margin: 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: '#718096', margin: 0, marginTop: 1 }}>{subtitle}</p>
        )}
      </div>

      {/* Right: actions + alerts + bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {actions}

        {totalAlerts > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            backgroundColor: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: 20, padding: '4px 12px',
          }}>
            <AlertTriangle size={12} color="#D97706" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#B45309' }}>
              {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <button
          style={{
            position: 'relative', padding: 8, borderRadius: 10,
            background: '#F8FAF9', border: '1px solid #EEF2F0',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#4A5568', transition: 'all 0.15s',
          }}
          aria-label="Notifications"
          id="notifications-btn"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EEF2F0'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAF9'; }}
        >
          <Bell size={17} />
          {totalAlerts > 0 && (
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: '#C17A1F',
              border: '2px solid #fff',
            }} aria-hidden />
          )}
        </button>

        {/* User avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(15,110,92,0.25)',
          cursor: 'default', flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
