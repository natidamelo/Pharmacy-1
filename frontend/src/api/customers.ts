import api from './client';

export const customersApi = {
  list: (params?: Record<string, string>) => api.get('/customers', { params }).then(r => r.data),
  get: (id: string) => api.get(`/customers/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/customers', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/customers/${id}`, data).then(r => r.data),
};
