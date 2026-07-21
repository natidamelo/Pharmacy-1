import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { InventoryList } from './pages/inventory/InventoryList';
import { InventoryDetail } from './pages/inventory/InventoryDetail';
import { Customers } from './pages/Customers';
import { Settings } from './pages/settings/Settings';
import { Placeholder } from './pages/Placeholder';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'font-body text-sm', style: { background: '#15191C', color: '#fff' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="inventory/:id" element={<InventoryDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="prescriptions" element={<Placeholder />} />
          <Route path="purchasing" element={<Placeholder />} />
          <Route path="reports" element={<Placeholder />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
