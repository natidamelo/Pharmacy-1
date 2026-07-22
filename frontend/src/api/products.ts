import api from './client';

export interface Product {
  id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  categoryId: string;
  category?: { id: string; name: string };
  dosageForm: string;
  strength?: string;
  manufacturer?: string;
  barcode?: string;
  unitOfMeasure: string;
  packSize: number;
  reorderLevel: number;
  isControlledSubstance: boolean;
  requiresPrescription: boolean;
  defaultSellingPrice: number;
  defaultCostPrice?: number;
  costPrice?: number;
  avgCostPrice?: number;
  unitProfit?: number;
  grossMarginPct?: number;
  taxRate: number;
  active: boolean;
  stockOnHand?: number;
  batches?: Batch[];
  createdAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
  costPrice: number;
  sellingPrice?: number;
  supplierId?: string;
  receivedDate: string;
}

export const productsApi = {
  list: (params?: Record<string, string>) =>
    api.get('/products', { params }).then(r => r.data),
  get: (id: string) => api.get(`/products/${id}`).then(r => r.data),
  create: (data: Partial<Product>) => api.post('/products', data).then(r => r.data),
  update: (id: string, data: Partial<Product>) => api.patch(`/products/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/products/${id}`).then(r => r.data),
};

export const batchesApi = {
  create: (data: Partial<Batch> & { productId: string }) =>
    api.post('/batches', data).then(r => r.data),
};

export const stockMovementsApi = {
  list: (params?: Record<string, string>) =>
    api.get('/stock-movements', { params }).then(r => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/stock-movements', data).then(r => r.data),
};
