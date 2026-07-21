import React, { useEffect, useState } from 'react';
import { Plus, UserPlus, Loader2, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { usersApi } from '../../api/users';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'INVENTORY_CLERK', label: 'Inventory Clerk' },
];

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #E8EDE9', borderRadius: 10,
  fontSize: 14, color: '#0D1117', backgroundColor: '#F9FAFB',
  padding: '10px 14px', outline: 'none', transition: 'all 0.15s',
  fontFamily: "'Inter', sans-serif",
};

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
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>System Users</h2>
          <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Manage staff access and roles</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          id="add-user-btn"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
          }}
        >
          <Plus size={14} /> Add Staff User
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, margin: 0 }}>Loading users…</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAFBFA' }}>
                {['Name', 'Email', 'Role', 'Phone', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id as string} style={{ borderBottom: '1px solid #F8FAFA' }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>{u.name as string}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#4A5568' }}>{u.email as string}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <Badge variant="info">{(u.role as string).replace(/_/g, ' ')}</Badge>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontFamily: "'Space Mono', monospace", color: '#64748B' }}>{(u.phone as string) || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <Badge variant={u.active ? 'success' : 'neutral'}>{u.active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {Boolean(u.active) && (
                      <button onClick={() => setDeactivateUser(u)} style={{ fontSize: 12, color: '#C0392B', background: 'rgba(192,57,43,0.1)', border: 'none', padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAddOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Add Staff User</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>Create account credentials for staff</p>
              </div>
              <button onClick={() => setAddOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="user-name" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Full Name *</label>
                <input id="user-name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="user-email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email Address *</label>
                <input id="user-email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="user-password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Password *</label>
                <input id="user-password" type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="user-phone" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Phone Number</label>
                <input id="user-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="user-role" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Role *</label>
                <select id="user-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} id="save-user-btn" style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><UserPlus size={15} /> Add User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deactivate Modal */}
      {deactivateUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setDeactivateUser(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden', padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#C0392B', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>Deactivate Staff User?</h3>
            <p style={{ fontSize: 14, color: '#4A5568', margin: '0 0 20px', lineHeight: 1.5 }}>
              Deactivate "{deactivateUser.name as string}"? They will no longer be able to sign in.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeactivateUser(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
              <button onClick={handleDeactivate} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: 'linear-gradient(135deg, #C0392B, #e74c3c)', color: '#fff', fontSize: 14, fontWeight: 700 }}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
