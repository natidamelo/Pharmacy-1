import api from './client';

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Category[];
}

export const categoriesApi = {
  list: () => api.get('/categories').then(r => r.data),
  create: (data: { name: string; parentId?: string }) => api.post('/categories', data).then(r => r.data),
  update: (id: string, data: Partial<Category>) => api.patch(`/categories/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/categories/${id}`).then(r => r.data),
};
