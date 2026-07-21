import api from './client';

export const prescriptionsApi = {
  list: (params?: Record<string, string>) => api.get('/prescriptions', { params }).then(r => r.data),
  get: (id: string) => api.get(`/prescriptions/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/prescriptions', data).then(r => r.data),
};
