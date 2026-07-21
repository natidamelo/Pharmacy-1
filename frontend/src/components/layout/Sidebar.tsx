import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, FileText,
  Users, BarChart2, Settings, LogOut, Pill, Truck
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
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/pos', icon: <ShoppingCart size={18} />, label: 'Sell', roles: ['ADMIN', 'PHARMACIST', 'CASHIER'] },
  { to: '/inventory', icon: <Package size={18} />, label: 'Inventory' },
  { to: '/prescriptions', icon: <FileText size={18} />, label: 'Prescriptions', roles: ['ADMIN', 'PHARMACIST'] },
  { to: '/customers', icon: <Users size={18} />, label: 'Customers' },
  { to: '/purchasing', icon: <Truck size={18} />, label: 'Purchasing', roles: ['ADMIN', 'INVENTORY_CLERK'] },
  { to: '/reports', icon: <BarChart2 size={18} />, label: 'Reports', roles: ['ADMIN', 'PHARMACIST'] },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings', roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const { lowStockCount, expiringCount } = useAlertStore();

  const filteredNav = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <aside className="w-60 bg-[#15191C] text-white flex flex-col h-screen sticky top-0 flex-shrink-0 shadow-lg">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0F6E5C] rounded-lg flex items-center justify-center shadow">
            <Pill size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-sm leading-tight">PharmaSys</div>
            <div className="text-white/40 text-[10px]">Management System</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Main navigation">
        {filteredNav.map(item => {
          const badge = item.to === '/inventory'
            ? lowStockCount + expiringCount
            : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm
                transition-all duration-150 group font-medium
                ${isActive
                  ? 'bg-[#0F6E5C] text-white shadow'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              {badge > 0 && (
                <span className="bg-[#C17A1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#0F6E5C] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-sm font-medium truncate">{user?.name}</div>
            <div className="text-white/50 text-[11px] capitalize">{user?.role?.replace(/_/g, ' ').toLowerCase()}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/60 hover:text-white text-xs w-full px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E5C]"
          id="logout-btn"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
};
