import api from './client';

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreateSalePayload {
  customerId?: string;
  prescriptionId?: string;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'INSURANCE';
  discountAmount?: number;
  notes?: string;
  items: SaleItem[];
}

export const salesApi = {
  create: (data: CreateSalePayload) => api.post('/sales', data).then(r => r.data),
  list: (params?: Record<string, string>) => api.get('/sales', { params }).then(r => r.data),
  get: (id: string) => api.get(`/sales/${id}`).then(r => r.data),
  refund: (id: string, reason?: string) => api.post(`/sales/${id}/refund`, { reason }).then(r => r.data),
};
