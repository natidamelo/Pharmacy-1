import React from 'react';
import { TopBar } from '../components/layout/TopBar';

export const Placeholder: React.FC = () => (
  <div className="flex-1 flex flex-col">
    <TopBar title="Coming Soon" />
    <div className="p-6 flex items-center justify-center h-full">
      <div className="text-center text-ink-subtle">
         <h2 className="text-xl font-display mb-2">Phase 2 Module</h2>
         <p>This module is under development and will be available soon.</p>
      </div>
    </div>
  </div>
);
