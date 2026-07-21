import React, { useState } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { UsersSettings } from './UsersSettings';
import { CategoriesSettings } from './CategoriesSettings';
import { BranchSettings } from './BranchSettings';

const tabs = [
  { id: 'users', label: 'Users' },
  { id: 'categories', label: 'Categories' },
  { id: 'branch', label: 'Branch & Currency' },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  return (
    <div>
      <TopBar title="Settings" />
      <div className="p-6">
        <div className="flex gap-1 bg-surface-hover rounded-xl p-1 w-fit mb-6">
          {tabs.map(tab => (
            <button key={tab.id} id={`settings-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === tab.id ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'users' && <UsersSettings />}
        {activeTab === 'categories' && <CategoriesSettings />}
        {activeTab === 'branch' && <BranchSettings />}
      </div>
    </div>
  );
};
