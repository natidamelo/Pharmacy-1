import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { productsApi } from '../../api/products';
import type { Product } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import type { Category } from '../../api/categories';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const DOSAGE_FORMS = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS', 'INHALER', 'OTHER'];

const StockBadge: React.FC<{ stock: number; reorderLevel: number }> = ({ stock, reorderLevel }) => {
  if (stock === 0) return <Badge variant="danger">Out of stock</Badge>;
  if (stock <= reorderLevel) return <Badge variant="warning">Low stock</Badge>;
  return <Badge variant="success">In stock</Badge>;
};

interface ProductForm {
  name: string; genericName: string; categoryId: string; dosageForm: string;
  strength: string; barcode: string; unitOfMeasure: string; reorderLevel: number;
  defaultSellingPrice: number; requiresPrescription: boolean; isControlledSubstance: boolean; taxRate: number;
}

const defaultForm: ProductForm = {
  name: '', genericName: '', categoryId: '', dosageForm: 'TABLET', strength: '',
  barcode: '', unitOfMeasure: 'Tablet', reorderLevel: 10, defaultSellingPrice: 0,
  requiresPrescription: false, isControlledSubstance: false, taxRate: 0,
};

export const InventoryList: React.FC = () => {
  const isAdmin = useAuthStore(s => s.hasRole(['ADMIN']));
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: '20' };
      if (search) params.search = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (stockFilter) params.stockStatus = stockFilter;
      const data = await productsApi.list(params);
      setProducts(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [search, categoryFilter, stockFilter, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { categoriesApi.list().then(setCategories).catch(() => setCategories([])); }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productsApi.create(form);
      toast.success('Product added');
      setAddOpen(false);
      setForm(defaultForm);
      loadProducts();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to add product');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <TopBar title="Inventory" subtitle={`${products.length} products`} />
      <div className="p-6">
        <div className="page-header">
          <div className="flex gap-3 flex-wrap flex-1">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <input id="inventory-search"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                placeholder="Search products..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select id="category-filter"
              className="rounded-lg border border-border text-sm px-3 py-2 bg-white focus:outline-none focus:border-primary"
              value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select id="stock-filter"
              className="rounded-lg border border-border text-sm px-3 py-2 bg-white focus:outline-none focus:border-primary"
              value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }}>
              <option value="">All stock levels</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </div>
          {isAdmin && <Button icon={<Plus size={14} />} onClick={() => setAddOpen(true)} id="add-product-btn">Add product</Button>}
        </div>

        <div className="card overflow-hidden">
          {loading ? <PageLoader /> : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-ink-muted font-medium">No products yet</p>
              {isAdmin && <Button icon={<Plus size={14} />} size="sm" className="mt-3" onClick={() => setAddOpen(true)}>Add your first product</Button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Form</th><th>Barcode</th><th>Stock</th><th>Price</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="font-medium text-ink">{product.name}</div>
                        {product.genericName && <div className="text-xs text-ink-subtle">{product.genericName}</div>}
                        {product.isControlledSubstance && <Badge variant="danger">Controlled</Badge>}
                      </td>
                      <td className="text-ink-muted">{product.category?.name}</td>
                      <td className="text-ink-muted">{product.dosageForm}</td>
                      <td className="font-mono text-xs text-ink-subtle">{product.barcode || '—'}</td>
                      <td className="tabular font-medium">{product.stockOnHand ?? 0}</td>
                      <td className="tabular">ETB {product.defaultSellingPrice.toFixed(2)}</td>
                      <td><StockBadge stock={product.stockOnHand ?? 0} reorderLevel={product.reorderLevel} /></td>
                      <td><Link to={`/inventory/${product.id}`} className="text-xs text-primary hover:underline">View →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="text-sm text-ink-muted">Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add product" size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAddProduct} id="save-product-btn">Add product</Button>
          </>
        }
      >
        <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="product-name" className="text-sm font-medium text-ink">Product name <span className="text-red-500">*</span></label>
            <input id="product-name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Amoxicillin 500mg" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="generic-name" className="text-sm font-medium text-ink">Generic name</label>
            <input id="generic-name" value={form.genericName} onChange={e => setForm(f => ({ ...f, genericName: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="barcode" className="text-sm font-medium text-ink">Barcode</label>
            <input id="barcode" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="product-category" className="text-sm font-medium text-ink">Category <span className="text-red-500">*</span></label>
            <select id="product-category" required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dosage-form" className="text-sm font-medium text-ink">Dosage form</label>
            <select id="dosage-form" value={form.dosageForm} onChange={e => setForm(f => ({ ...f, dosageForm: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white">
              {DOSAGE_FORMS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="strength" className="text-sm font-medium text-ink">Strength</label>
            <input id="strength" value={form.strength} onChange={e => setForm(f => ({ ...f, strength: e.target.value }))}
              placeholder="e.g. 500mg"
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="unit-of-measure" className="text-sm font-medium text-ink">Unit of measure <span className="text-red-500">*</span></label>
            <input id="unit-of-measure" required value={form.unitOfMeasure} onChange={e => setForm(f => ({ ...f, unitOfMeasure: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="reorder-level" className="text-sm font-medium text-ink">Reorder level</label>
            <input id="reorder-level" type="number" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: Number(e.target.value) }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="selling-price" className="text-sm font-medium text-ink">Selling price (ETB) <span className="text-red-500">*</span></label>
            <input id="selling-price" type="number" step="0.01" required value={form.defaultSellingPrice} onChange={e => setForm(f => ({ ...f, defaultSellingPrice: Number(e.target.value) }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.requiresPrescription} onChange={e => setForm(f => ({ ...f, requiresPrescription: e.target.checked }))} />
              Requires prescription
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.isControlledSubstance} onChange={e => setForm(f => ({ ...f, isControlledSubstance: e.target.checked }))} />
              Controlled substance
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
