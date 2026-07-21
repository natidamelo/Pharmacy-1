import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, Phone, Mail, AlertCircle, X, Loader2, User } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { customersApi } from '../api/customers';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #E8EDE9', borderRadius: 10,
  fontSize: 14, color: '#0D1117', backgroundColor: '#F9FAFB',
  padding: '10px 14px', outline: 'none', transition: 'all 0.15s',
  fontFamily: "'Inter', sans-serif",
};

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
      toast.success(`${form.name} added successfully`);
      setAddOpen(false);
      setForm({ name: '', phone: '', email: '', allergyNotes: '' });
      load();
    } catch { toast.error('Failed to add customer'); } finally { setSaving(false); }
  };

  const addBtn = (
    <button
      onClick={() => setAddOpen(true)}
      id="add-customer-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
        color: '#fff', fontSize: 13, fontWeight: 600,
        padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
      }}
    >
      <Plus size={14} /> Add Customer
    </button>
  );

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100%' }}>
      <TopBar title="Customers" subtitle={`${customers.length} registered customer${customers.length !== 1 ? 's' : ''}`} actions={addBtn} />

      <div style={{ padding: '24px 28px' }}>
        {/* Search */}
        <div style={{ marginBottom: 20, position: 'relative', maxWidth: 360 }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            id="customer-search"
            placeholder="Search customers by name, phone, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 38, paddingRight: 14, backgroundColor: '#fff', border: '1.5px solid #E8EDE9' }}
            onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#E8EDE9'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Table card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, margin: 0 }}>Loading customers…</p>
            </div>
          ) : customers.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Users size={28} color="#86EFAC" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#4A5568', margin: '0 0 6px' }}>No customers yet</p>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>
                {search ? `No results for "${search}"` : 'Add your first customer to get started'}
              </p>
              {!search && (
                <button onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,110,92,0.3)' }}>
                  <Plus size={14} /> Add first customer
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFBFA' }}>
                  {['Customer', 'Phone', 'Email', 'Allergy Notes', 'Registered'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id as string}
                    style={{ borderBottom: '1px solid #F8FAFA', transition: 'background 0.1s', cursor: 'default' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFA'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {(c.name as string)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1117' }}>{c.name as string}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {c.phone ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#4A5568', fontFamily: "'Space Mono', monospace" }}>
                          <Phone size={12} color="#94A3B8" /> {c.phone as string}
                        </span>
                      ) : <span style={{ color: '#CBD5E1', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {c.email ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#4A5568' }}>
                          <Mail size={12} color="#94A3B8" /> {c.email as string}
                        </span>
                      ) : <span style={{ color: '#CBD5E1', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 16px', maxWidth: 200 }}>
                      {c.allergyNotes ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#C17A1F', background: 'rgba(193,122,31,0.1)', borderRadius: 20, padding: '2px 10px', width: 'fit-content' }}>
                          <AlertCircle size={11} /> {(c.allergyNotes as string).slice(0, 40)}{(c.allergyNotes as string).length > 40 ? '…' : ''}
                        </span>
                      ) : <span style={{ color: '#CBD5E1', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: '#94A3B8' }}>
                      {format(new Date(c.createdAt as string), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAddOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8EDE9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Add Customer</h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '2px 0 0' }}>Register a new customer</p>
              </div>
              <button onClick={() => setAddOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { id: 'customer-name', label: 'Full Name *', key: 'name', type: 'text', required: true, placeholder: 'e.g. Abebe Bekele' },
                { id: 'customer-phone', label: 'Phone Number', key: 'phone', type: 'tel', required: false, placeholder: '+251 9xx xxx xxx' },
                { id: 'customer-email', label: 'Email Address', key: 'email', type: 'email', required: false, placeholder: 'example@email.com' },
              ].map(field => (
                <div key={field.id}>
                  <label htmlFor={field.id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{field.label}</label>
                  <input
                    id={field.id} type={field.type} required={field.required}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E8EDE9'; e.target.style.backgroundColor = '#F9FAFB'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="allergy-notes" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Allergy Notes</label>
                <textarea
                  id="allergy-notes"
                  placeholder="Known allergies or medical notes…"
                  value={form.allergyNotes}
                  onChange={e => setForm(f => ({ ...f, allergyNotes: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: 'none', minHeight: 80 }}
                  onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8EDE9'; e.target.style.backgroundColor = '#F9FAFB'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} id="save-customer-btn" style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><User size={14} /> Add Customer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
