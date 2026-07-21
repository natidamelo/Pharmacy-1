import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { categoriesApi } from '../../api/categories';
import type { Category } from '../../api/categories';
import toast from 'react-hot-toast';

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-ink">Categories</h2>
        <Button icon={<Plus size={14} />} size="sm" onClick={() => setAddOpen(true)} id="add-category-btn">Add category</Button>
      </div>
      {loading ? <PageLoader /> : categories.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink-muted">No categories yet</p>
          <Button size="sm" icon={<Plus size={14} />} className="mt-3" onClick={() => setAddOpen(true)}>Add category</Button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Subcategories</th><th></th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td className="font-medium text-ink">{c.name}</td>
                  <td className="text-ink-muted">{c.children?.length || 0}</td>
                  <td><button onClick={() => setDeleteCategory(c)} className="text-xs text-red-500 hover:underline" id={`delete-cat-${c.id}`}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add category" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAdd} id="save-category-btn">Add category</Button>
          </>
        }
      >
        <form onSubmit={handleAdd}>
          <div className="flex flex-col gap-1">
            <label htmlFor="category-name" className="text-sm font-medium text-ink">Category name <span className="text-red-500">*</span></label>
            <input id="category-name" required value={name} onChange={e => setName(e.target.value)} autoFocus
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </form>
      </Modal>
      <ConfirmModal
        open={!!deleteCategory} onClose={() => setDeleteCategory(null)} onConfirm={handleDelete} loading={saving}
        title="Delete category"
        message={deleteCategory ? `Delete category "${deleteCategory.name}"? Products in this category will need to be reassigned.` : ''}
        confirmLabel="Delete category"
      />
    </div>
  );
};
