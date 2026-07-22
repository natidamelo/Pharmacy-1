import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, FileText,
  Users, BarChart2, Settings, LogOut, Pill, Truck,
  ChevronRight, CreditCard
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAlertStore } from '../../store/alertStore';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
  { to: '/pos', icon: <ShoppingCart size={17} />, label: 'Point of Sale', roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
  { to: '/billing', icon: <CreditCard size={17} />, label: 'Billing & Financials', roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
  { to: '/inventory', icon: <Package size={17} />, label: 'Inventory' },
  { to: '/prescriptions', icon: <FileText size={17} />, label: 'Prescriptions', roles: ['ADMIN', 'PHARMACIST'] },
  { to: '/customers', icon: <Users size={17} />, label: 'Customers' },
  { to: '/purchasing', icon: <Truck size={17} />, label: 'Purchasing', roles: ['ADMIN', 'INVENTORY_CLERK'] },
  { to: '/reports', icon: <BarChart2 size={17} />, label: 'Reports', roles: ['ADMIN', 'PHARMACIST'] },
  { to: '/settings', icon: <Settings size={17} />, label: 'Settings', roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const { lowStockCount, expiringCount } = useAlertStore();
  const [hovered, setHovered] = useState<string | null>(null);

  const filteredNav = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrator',
    PHARMACIST: 'Pharmacist',
    CASHIER: 'Cashier',
    INVENTORY_CLERK: 'Inventory Clerk',
  };

  return (
    <aside style={{
      width: 240,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 30,
      background: 'linear-gradient(180deg, #0D1117 0%, #111827 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
    }}>

      {/* Logo area */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15,110,92,0.4)',
          }}>
            <Pill size={18} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.3px' }}>
              PharmaSys
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Management
            </div>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '16px 20px 8px' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Main Menu
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }} aria-label="Main navigation">
        {filteredNav.map(item => {
          const badge = item.to === '/inventory'
            ? lowStockCount + expiringCount
            : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => setHovered(item.to)}
              onMouseLeave={() => setHovered(null)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 2,
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#ffffff' : hovered === item.to ? '#e2e8f0' : 'rgba(255,255,255,0.55)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(15,110,92,0.9) 0%, rgba(13,148,136,0.8) 100%)'
                  : hovered === item.to
                    ? 'rgba(255,255,255,0.07)'
                    : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 12px rgba(15,110,92,0.35)' : 'none',
                letterSpacing: isActive ? '-0.1px' : '0',
              })}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.icon}
                {item.label}
              </span>
              {badge > 0
                ? <span style={{
                    background: '#C17A1F',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: 20,
                    minWidth: 18,
                    textAlign: 'center'
                  }}>{badge > 99 ? '99+' : badge}</span>
                : <ChevronRight size={12} style={{ opacity: 0.3 }} />
              }
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ margin: '0 20px', height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* User profile */}
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 8
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
            boxShadow: '0 2px 8px rgba(15,110,92,0.3)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, lineHeight: 1.3 }}>
              {roleLabel[user?.role ?? ''] ?? user?.role}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          id="logout-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'rgba(255,255,255,0.45)', fontSize: 12, width: '100%',
            padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none',
            cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            letterSpacing: '0.1px',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,57,43,0.15)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
};
