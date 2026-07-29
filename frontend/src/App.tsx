import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { InventoryList } from './pages/inventory/InventoryList';
import { InventoryDetail } from './pages/inventory/InventoryDetail';
import { Customers } from './pages/Customers';
import { Settings } from './pages/settings/Settings';
import { Reports } from './pages/Reports';
import { Prescriptions } from './pages/Prescriptions';
import { Purchasing } from './pages/Purchasing';
import { Billing } from './pages/Billing';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'font-body text-sm', style: { background: '#15191C', color: '#fff' } }} />
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/"      element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* ── Protected app routes — pathless AppLayout wrapper ── */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard"        element={<Dashboard />} />
          <Route path="/pos"              element={<POS />} />
          <Route path="/billing"          element={<Billing />} />
          <Route path="/inventory"        element={<InventoryList />} />
          <Route path="/inventory/:id"    element={<InventoryDetail />} />
          <Route path="/customers"        element={<Customers />} />
          <Route path="/prescriptions"    element={<Prescriptions />} />
          <Route path="/purchasing"       element={<Purchasing />} />
          <Route path="/reports"          element={<Reports />} />
          <Route path="/settings"         element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
