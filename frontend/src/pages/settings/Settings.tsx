import React, { useState } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { UsersSettings } from './UsersSettings';
import { CategoriesSettings } from './CategoriesSettings';
import { BranchSettings } from './BranchSettings';
import { Users, Tag, Building2 } from 'lucide-react';

const tabs = [
  { id: 'users',      label: 'Users',             icon: <Users size={15} /> },
  { id: 'categories', label: 'Categories',        icon: <Tag size={15} /> },
  { id: 'branch',     label: 'Branch & Currency', icon: <Building2 size={15} /> },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100%' }}>
      <TopBar title="Settings" subtitle="Manage users, categories, and system preferences" />

      <div style={{ padding: '24px 28px' }}>
        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, backgroundColor: '#fff',
          borderRadius: 12, padding: 4, width: 'fit-content',
          border: '1px solid #E8EDE9', marginBottom: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 9, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s',
                  background: isActive ? 'linear-gradient(135deg, #0F6E5C, #0d9488)' : 'transparent',
                  color: isActive ? '#fff' : '#64748B',
                  boxShadow: isActive ? '0 4px 12px rgba(15,110,92,0.3)' : 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {activeTab === 'users'      && <UsersSettings />}
          {activeTab === 'categories' && <CategoriesSettings />}
          {activeTab === 'branch'     && <BranchSettings />}
        </div>
      </div>
    </div>
  );
};
