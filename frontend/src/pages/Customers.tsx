import React, { useEffect, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import { customersApi } from '../api/customers';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', allergyNotes: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await customersApi.list(search ? { search } : undefined);
      setCustomers(data.data || []);
    } catch { setCustomers([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]); // eslint-disable-line

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await customersApi.create(form);
      toast.success(`Customer ${form.name} added`);
      setAddOpen(false);
      setForm({ name: '', phone: '', email: '', allergyNotes: '' });
      load();
    } catch { toast.error('Failed to add customer'); } finally { setSaving(false); }
  };

  return (
    <div>
      <TopBar title="Customers" />
      <div className="p-6">
        <div className="page-header">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              id="customer-search"
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button icon={<Plus size={14} />} onClick={() => setAddOpen(true)} id="add-customer-btn">Add customer</Button>
        </div>

        <div className="card overflow-hidden">
          {loading ? <PageLoader /> : customers.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto mb-4" style={{ color: '#cbd5e1' }} />
              <p className="text-ink-muted font-medium">No customers yet</p>
              <Button icon={<Plus size={14} />} size="sm" className="mt-3" onClick={() => setAddOpen(true)}>Add your first customer</Button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Email</th><th>Allergy notes</th><th>Registered</th></tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id as string}>
                    <td className="font-medium text-ink">{c.name as string}</td>
                    <td className="font-mono text-sm text-ink-muted">{(c.phone as string) || '—'}</td>
                    <td className="text-ink-muted">{(c.email as string) || '—'}</td>
                    <td className="text-xs text-ink-muted max-w-[200px] truncate">{(c.allergyNotes as string) || '—'}</td>
                    <td className="text-ink-muted text-sm">{format(new Date(c.createdAt as string), 'dd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add customer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAdd} id="save-customer-btn">Add customer</Button>
          </>
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="customer-name" className="text-sm font-medium text-ink">Full name <span className="text-red-500">*</span></label>
            <input id="customer-name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="customer-phone" className="text-sm font-medium text-ink">Phone number</label>
            <input id="customer-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="customer-email" className="text-sm font-medium text-ink">Email</label>
            <input id="customer-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="allergy-notes" className="text-sm font-medium text-ink">Allergy notes</label>
            <textarea id="allergy-notes" value={form.allergyNotes} onChange={e => setForm(f => ({ ...f, allergyNotes: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
              placeholder="Known allergies..." />
          </div>
        </form>
      </Modal>
    </div>
  );
};
