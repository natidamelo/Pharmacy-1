import React, { useEffect, useState } from 'react';
import { Plus, Loader2, X, Tag } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import type { Category } from '../../api/categories';
import toast from 'react-hot-toast';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #E8EDE9', borderRadius: 10,
  fontSize: 14, color: '#0D1117', backgroundColor: '#F9FAFB',
  padding: '10px 14px', outline: 'none', transition: 'all 0.15s',
  fontFamily: "'Inter', sans-serif",
};

export const CategoriesSettings: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setCategories(await categoriesApi.list()); } catch { setCategories([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await categoriesApi.create({ name });
      toast.success(`Category "${name}" added`);
      setAddOpen(false); setName(''); load();
    } catch { toast.error('Failed to add category'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setSaving(true);
    try {
      await categoriesApi.delete(deleteCategory.id);
      toast.success(`Category "${deleteCategory.name}" deleted`);
      setDeleteCategory(null); load();
    } catch { toast.error('Failed to delete category'); } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Product Categories</h2>
          <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Organize products into categories</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          id="add-category-btn"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
          }}
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, margin: 0 }}>Loading categories…</p>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0' }}>
          <Tag size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 12px' }}>No categories yet</p>
          <button onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
            <Plus size={14} /> Add Category
          </button>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAFBFA' }}>
                {['Category Name', 'Subcategories', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F8FAFA' }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>{c.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#64748B' }}>{c.children?.length || 0}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => setDeleteCategory(c)} id={`delete-cat-${c.id}`} style={{ fontSize: 12, color: '#C0392B', background: 'rgba(192,57,43,0.1)', border: 'none', padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Category Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAddOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Add Category</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>Create a product category</p>
              </div>
              <button onClick={() => setAddOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="category-name" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Category Name *</label>
                <input id="category-name" required value={name} onChange={e => setName(e.target.value)} autoFocus style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} id="save-category-btn" style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Plus size={15} /> Add Category</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteCategory && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setDeleteCategory(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden', padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#C0392B', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>Delete Category?</h3>
            <p style={{ fontSize: 14, color: '#4A5568', margin: '0 0 20px', lineHeight: 1.5 }}>
              Delete category "<strong>{deleteCategory.name}</strong>"? Products in this category will need to be reassigned.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteCategory(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: 'linear-gradient(135deg, #C0392B, #e74c3c)', color: '#fff', fontSize: 14, fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
