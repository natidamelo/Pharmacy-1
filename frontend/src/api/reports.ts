import api from './client';

export const reportsApi = {
  salesReport: (params?: { from?: string; to?: string }) => api.get('/reports/sales', { params }).then(r => r.data),
  inventoryValuation: () => api.get('/reports/inventory-valuation').then(r => r.data),
  expiryReport: (days?: number) => api.get('/reports/expiry', { params: { days } }).then(r => r.data),
};
