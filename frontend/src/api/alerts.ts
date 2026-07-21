import api from './client';

export const alertsApi = {
  lowStock: () => api.get('/alerts/low-stock').then(r => r.data),
  expiring: (days?: number) => api.get('/alerts/expiring', { params: { days } }).then(r => r.data),
};
