import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, ChevronLeft, ChevronRight, X, Loader2, Edit, Check } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/Badge';
import { productsApi } from '../../api/products';
import type { Product } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import type { Category } from '../../api/categories';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const DOSAGE_FORMS = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS', 'INHALER', 'OTHER'];

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #E8EDE9', borderRadius: 10,
  fontSize: 14, color: '#0D1117', backgroundColor: '#F9FAFB',
  padding: '10px 14px', outline: 'none', transition: 'all 0.15s',
  fontFamily: "'Inter', sans-serif",
};

const StockBadge: React.FC<{ stock: number; reorderLevel: number }> = ({ stock, reorderLevel }) => {
  if (stock === 0) return <Badge variant="danger">Out of stock</Badge>;
  if (stock <= reorderLevel) return <Badge variant="warning">Low stock</Badge>;
  return <Badge variant="success">In stock</Badge>;
};

interface ProductForm {
  name: string; genericName: string; categoryId: string; dosageForm: string;
  strength: string; barcode: string; unitOfMeasure: string; reorderLevel: number;
  defaultSellingPrice: number; defaultCostPrice: number; requiresPrescription: boolean; isControlledSubstance: boolean; taxRate: number;
}

const defaultForm: ProductForm = {
  name: '', genericName: '', categoryId: '', dosageForm: 'TABLET', strength: '',
  barcode: '', unitOfMeasure: 'Tablet', reorderLevel: 10, defaultSellingPrice: 0, defaultCostPrice: 0,
  requiresPrescription: false, isControlledSubstance: false, taxRate: 0,
};

export const InventoryList: React.FC = () => {
  const isAdmin = useAuthStore(s => s.hasRole(['ADMIN', 'INVENTORY_CLERK']));
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [editForm, setEditForm] = useState<ProductForm>(defaultForm);
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
    if (!form.categoryId) { toast.error('Please select a category'); return; }
    setSaving(true);
    try {
      await productsApi.create(form);
      toast.success(`${form.name} added to inventory`);
      setAddOpen(false);
      setForm(defaultForm);
      loadProducts();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to add product');
    } finally { setSaving(false); }
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProductId(p.id);
    setEditForm({
      name: p.name,
      genericName: p.genericName || '',
      categoryId: p.categoryId || '',
      dosageForm: p.dosageForm || 'TABLET',
      strength: p.strength || '',
      barcode: p.barcode || '',
      unitOfMeasure: p.unitOfMeasure || 'Tablet',
      reorderLevel: p.reorderLevel || 10,
      defaultSellingPrice: p.defaultSellingPrice || 0,
      defaultCostPrice: p.defaultCostPrice || p.costPrice || 0,
      requiresPrescription: p.requiresPrescription || false,
      isControlledSubstance: p.isControlledSubstance || false,
      taxRate: p.taxRate || 0,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;
    setSaving(true);
    try {
      await productsApi.update(editingProductId, editForm);
      toast.success(`${editForm.name} updated`);
      setEditOpen(false);
      setEditingProductId(null);
      loadProducts();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to update product');
    } finally { setSaving(false); }
  };

  const addBtn = isAdmin ? (
    <button
      onClick={() => setAddOpen(true)}
      id="add-product-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
        color: '#fff', fontSize: 13, fontWeight: 600,
        padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
      }}
    >
      <Plus size={14} /> Add Product
    </button>
  ) : undefined;

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100%' }}>
      <TopBar title="Inventory" subtitle="Manage pharmacy products, categories, cost prices, and stock" actions={addBtn} />

      <div style={{ padding: '24px 28px' }}>

        {/* Filter Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap',
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: 260, maxWidth: 360 }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              id="product-search"
              placeholder="Search products by name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ ...inputStyle, paddingLeft: 38, backgroundColor: '#fff' }}
              onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#E8EDE9'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Category Filter */}
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: 'auto', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Stock Filter */}
          <select
            id="stock-filter"
            value={stockFilter}
            onChange={e => { setStockFilter(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: 'auto', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Products Table Card */}
        <div style={{
          backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0',
          overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, margin: 0 }}>Loading inventory…</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #EEF2F0, #DDE4E2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Package size={28} color="#94A3B8" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#4A5568', margin: '0 0 6px' }}>No products found</p>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                {search || categoryFilter || stockFilter ? 'Try clearing your search filters' : 'Add your first product to get started'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFBFA' }}>
                  {['Product Name', 'Category', 'Form & Strength', 'Cost Price', 'Selling Price', 'Margin', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                      color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const cost = p.costPrice ?? p.defaultCostPrice ?? 0;
                  const margin = p.grossMarginPct ?? (p.defaultSellingPrice > 0 ? ((p.defaultSellingPrice - cost) / p.defaultSellingPrice) * 100 : 0);
                  const marginColor = margin >= 30 ? '#0F6E5C' : margin >= 15 ? '#C17A1F' : '#C0392B';
                  const marginBg = margin >= 30 ? 'rgba(15,110,92,0.1)' : margin >= 15 ? 'rgba(193,122,31,0.1)' : 'rgba(192,57,43,0.1)';

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F8FAFA', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFA'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <Link to={`/inventory/${p.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F6E5C' }}>
                            {p.name}
                          </div>
                          {p.genericName && <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.genericName}</div>}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#4A5568' }}>
                        {p.category?.name || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748B' }}>
                        {p.dosageForm} {p.strength ? `· ${p.strength}` : ''}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", color: '#64748B' }}>
                        ETB {cost.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#0D1117' }}>
                        ETB {p.defaultSellingPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono', monospace",
                          color: marginColor, backgroundColor: marginBg,
                          padding: '3px 8px', borderRadius: 6, display: 'inline-block',
                        }}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, fontFamily: "'Space Mono', monospace", color: '#0D1117' }}>
                        {p.stockOnHand ?? 0} {p.unitOfMeasure}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StockBadge stock={p.stockOnHand ?? 0} reorderLevel={p.reorderLevel} />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Product"
                              style={{
                                fontSize: 12, fontWeight: 600, color: '#0F6E5C',
                                background: '#fff', padding: '5px 10px', borderRadius: 8,
                                border: '1px solid rgba(15,110,92,0.25)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              <Edit size={12} /> Edit
                            </button>
                          )}
                          <Link
                            to={`/inventory/${p.id}`}
                            style={{
                              fontSize: 12, fontWeight: 600, color: '#4A5568',
                              textDecoration: 'none', background: '#F1F5F9',
                              padding: '5px 10px', borderRadius: 8, display: 'inline-block',
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            Details →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px', borderTop: '1px solid #EEF2F0', backgroundColor: '#FAFAFA',
            }}>
              <span style={{ fontSize: 13, color: '#64748B' }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                    borderRadius: 8, border: '1.5px solid #E8EDE9', background: '#fff',
                    fontSize: 12, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1, color: '#4A5568',
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                    borderRadius: 8, border: '1.5px solid #E8EDE9', background: '#fff',
                    fontSize: 12, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.5 : 1, color: '#4A5568',
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {addOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setAddOpen(false)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>

            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #EEF2F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
            }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Add New Product</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>Enter product specification and selling info</p>
              </div>
              <button onClick={() => setAddOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="p-name" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Product Name *</label>
                <input id="p-name" required placeholder="e.g. Amoxicillin 500mg" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="p-generic" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Generic Name</label>
                  <input id="p-generic" placeholder="e.g. Amoxicillin Trihydrate" value={form.genericName} onChange={e => setForm(f => ({ ...f, genericName: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="p-barcode" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Barcode</label>
                  <input id="p-barcode" placeholder="e.g. 690123456789" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="p-category" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Category *</label>
                  <select id="p-category" required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="p-dosage" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Dosage Form *</label>
                  <select id="p-dosage" value={form.dosageForm} onChange={e => setForm(f => ({ ...f, dosageForm: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {DOSAGE_FORMS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="p-strength" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Strength</label>
                  <input id="p-strength" placeholder="e.g. 500mg, 10mg/ml" value={form.strength} onChange={e => setForm(f => ({ ...f, strength: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="p-unit" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Unit of Measure *</label>
                  <input id="p-unit" required placeholder="Tablet, Bottle, Box" value={form.unitOfMeasure} onChange={e => setForm(f => ({ ...f, unitOfMeasure: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="p-cost" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Cost Price (ETB) *</label>
                  <input id="p-cost" type="number" step="0.01" min="0" required value={form.defaultCostPrice} onChange={e => setForm(f => ({ ...f, defaultCostPrice: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="p-price" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Selling Price (ETB) *</label>
                  <input id="p-price" type="number" step="0.01" min="0" required value={form.defaultSellingPrice} onChange={e => setForm(f => ({ ...f, defaultSellingPrice: Number(e.target.value) }))} style={inputStyle} />
                </div>
              </div>

              {/* Profit & Margin Calculator Banner */}
              {form.defaultSellingPrice > 0 && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12,
                }}>
                  <span style={{ color: '#166534', fontWeight: 600 }}>
                    Estimated Unit Profit: <strong>ETB {Math.max(0, form.defaultSellingPrice - form.defaultCostPrice).toFixed(2)}</strong>
                  </span>
                  <span style={{
                    color: '#0F6E5C', fontWeight: 700, fontFamily: "'Space Mono', monospace",
                    backgroundColor: 'rgba(15,110,92,0.12)', padding: '2px 8px', borderRadius: 6,
                  }}>
                    Gross Margin: {(((form.defaultSellingPrice - form.defaultCostPrice) / form.defaultSellingPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <div>
                  <label htmlFor="p-reorder" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Reorder Level</label>
                  <input id="p-reorder" type="number" min="0" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: Number(e.target.value) }))} style={inputStyle} />
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" checked={form.requiresPrescription} onChange={e => setForm(f => ({ ...f, requiresPrescription: e.target.checked }))} style={{ accentColor: '#0F6E5C', width: 16, height: 16 }} />
                  Requires Prescription (Rx)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" checked={form.isControlledSubstance} onChange={e => setForm(f => ({ ...f, isControlledSubstance: e.target.checked }))} style={{ accentColor: '#0F6E5C', width: 16, height: 16 }} />
                  Controlled Substance
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} id="save-product-btn" style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Plus size={15} /> Add Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setEditOpen(false)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>

            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #EEF2F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
            }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Edit Product Details</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>Update product prices and specifications</p>
              </div>
              <button onClick={() => setEditOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="ep-name" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Product Name *</label>
                <input id="ep-name" required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="ep-generic" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Generic Name</label>
                  <input id="ep-generic" value={editForm.genericName} onChange={e => setEditForm(f => ({ ...f, genericName: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="ep-barcode" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Barcode</label>
                  <input id="ep-barcode" value={editForm.barcode} onChange={e => setEditForm(f => ({ ...f, barcode: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="ep-category" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Category *</label>
                  <select id="ep-category" required value={editForm.categoryId} onChange={e => setEditForm(f => ({ ...f, categoryId: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ep-dosage" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Dosage Form *</label>
                  <select id="ep-dosage" value={editForm.dosageForm} onChange={e => setEditForm(f => ({ ...f, dosageForm: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {DOSAGE_FORMS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="ep-strength" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Strength</label>
                  <input id="ep-strength" value={editForm.strength} onChange={e => setEditForm(f => ({ ...f, strength: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="ep-unit" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Unit of Measure *</label>
                  <input id="ep-unit" required value={editForm.unitOfMeasure} onChange={e => setEditForm(f => ({ ...f, unitOfMeasure: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="ep-cost" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Cost Price (ETB) *</label>
                  <input id="ep-cost" type="number" step="0.01" min="0" required value={editForm.defaultCostPrice} onChange={e => setEditForm(f => ({ ...f, defaultCostPrice: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="ep-price" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Selling Price (ETB) *</label>
                  <input id="ep-price" type="number" step="0.01" min="0" required value={editForm.defaultSellingPrice} onChange={e => setEditForm(f => ({ ...f, defaultSellingPrice: Number(e.target.value) }))} style={inputStyle} />
                </div>
              </div>

              {/* Profit & Margin Calculator Banner */}
              {editForm.defaultSellingPrice > 0 && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12,
                }}>
                  <span style={{ color: '#166534', fontWeight: 600 }}>
                    Estimated Unit Profit: <strong>ETB {Math.max(0, editForm.defaultSellingPrice - editForm.defaultCostPrice).toFixed(2)}</strong>
                  </span>
                  <span style={{
                    color: '#0F6E5C', fontWeight: 700, fontFamily: "'Space Mono', monospace",
                    backgroundColor: 'rgba(15,110,92,0.12)', padding: '2px 8px', borderRadius: 6,
                  }}>
                    Gross Margin: {(((editForm.defaultSellingPrice - editForm.defaultCostPrice) / editForm.defaultSellingPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <div>
                  <label htmlFor="ep-reorder" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Reorder Level</label>
                  <input id="ep-reorder" type="number" min="0" value={editForm.reorderLevel} onChange={e => setEditForm(f => ({ ...f, reorderLevel: Number(e.target.value) }))} style={inputStyle} />
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" checked={editForm.requiresPrescription} onChange={e => setEditForm(f => ({ ...f, requiresPrescription: e.target.checked }))} style={{ accentColor: '#0F6E5C', width: 16, height: 16 }} />
                  Requires Prescription (Rx)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" checked={editForm.isControlledSubstance} onChange={e => setEditForm(f => ({ ...f, isControlledSubstance: e.target.checked }))} style={{ accentColor: '#0F6E5C', width: 16, height: 16 }} />
                  Controlled Substance
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setEditOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} id="save-product-edit-btn" style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving Changes…</> : <><Check size={15} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
