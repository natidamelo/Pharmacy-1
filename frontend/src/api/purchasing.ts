import api from './client';

export const purchasingApi = {
  listSuppliers: () => api.get('/suppliers').then(r => r.data),
  createSupplier: (data: Record<string, unknown>) => api.post('/suppliers', data).then(r => r.data),
  listPurchaseOrders: (params?: Record<string, string>) => api.get('/purchase-orders', { params }).then(r => r.data),
  createPurchaseOrder: (data: Record<string, unknown>) => api.post('/purchase-orders', data).then(r => r.data),
  receivePO: (id: string, data: Record<string, unknown>) => api.patch(`/purchase-orders/${id}/receive`, data).then(r => r.data),
};
