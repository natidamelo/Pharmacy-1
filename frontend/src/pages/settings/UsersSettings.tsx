import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { usersApi } from '../../api/users';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'INVENTORY_CLERK', label: 'Inventory Clerk' },
];

export const UsersSettings: React.FC = () => {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deactivateUser, setDeactivateUser] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CASHIER', phone: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const data = await usersApi.list(); setUsers(data.data || []); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.create(form);
      toast.success(`User ${form.name} added`);
      setAddOpen(false);
      setForm({ name: '', email: '', password: '', role: 'CASHIER', phone: '' });
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to add user');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async () => {
    if (!deactivateUser) return;
    setSaving(true);
    try {
      await usersApi.update(deactivateUser.id as string, { active: false });
      toast.success(`${deactivateUser.name as string} deactivated`);
      setDeactivateUser(null);
      load();
    } catch { toast.error('Failed to deactivate user'); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-ink">Users</h2>
        <Button icon={<Plus size={14} />} size="sm" onClick={() => setAddOpen(true)} id="add-user-btn">Add user</Button>
      </div>

      {loading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id as string}>
                  <td className="font-medium text-ink">{u.name as string}</td>
                  <td className="text-ink-muted">{u.email as string}</td>
                  <td><Badge variant="info">{(u.role as string).replace(/_/g, ' ')}</Badge></td>
                  <td className="font-mono text-sm text-ink-muted">{(u.phone as string) || '—'}</td>
                  <td><Badge variant={u.active ? 'success' : 'neutral'}>{u.active ? 'Active' : 'Inactive'}</Badge></td>
                  <td>
                    {Boolean(u.active) && (
                      <button onClick={() => setDeactivateUser(u)} className="text-xs text-red-500 hover:underline" id={`deactivate-${u.id as string}`}>Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add user"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAdd} id="save-user-btn">Add user</Button>
          </>
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="user-name" className="text-sm font-medium text-ink">Full name</label>
            <input id="user-name" type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-email" className="text-sm font-medium text-ink">Email address</label>
            <input id="user-email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-password" className="text-sm font-medium text-ink">Password</label>
            <input id="user-password" type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-phone" className="text-sm font-medium text-ink">Phone</label>
            <input id="user-phone" type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-role" className="text-sm font-medium text-ink">Role</label>
            <select id="user-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white">
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deactivateUser} onClose={() => setDeactivateUser(null)} onConfirm={handleDeactivate} loading={saving}
        title="Deactivate user"
        message={deactivateUser ? `Deactivate "${deactivateUser.name as string}"? They will no longer be able to sign in.` : ''}
        confirmLabel="Deactivate user"
      />
    </div>
  );
};
