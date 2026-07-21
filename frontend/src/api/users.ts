import api from './client';

export const usersApi = {
  list: (params?: Record<string, string>) => api.get('/users', { params }).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/users', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data).then(r => r.data),
};

export const settingsApi = {
  get: () => api.get('/settings').then(r => r.data),
  update: (data: Record<string, string>) => api.patch('/settings', data).then(r => r.data),
};

export const reportsApi = {
  sales: (params?: Record<string, string>) => api.get('/reports/sales', { params }).then(r => r.data),
  inventoryValuation: () => api.get('/reports/inventory-valuation').then(r => r.data),
  expiry: () => api.get('/reports/expiry').then(r => r.data),
  profitMargin: (params?: Record<string, string>) => api.get('/reports/profit-margin', { params }).then(r => r.data),
};
