import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, Loader2, X } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { Badge } from '../components/ui/Badge';
import { prescriptionsApi } from '../api/prescriptions';
import { customersApi } from '../api/customers';
import { productsApi } from '../api/products';
import type { Product } from '../api/products';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #E8EDE9', borderRadius: 10,
  fontSize: 14, color: '#0D1117', backgroundColor: '#F9FAFB',
  padding: '10px 14px', outline: 'none', transition: 'all 0.15s',
  fontFamily: "'Inter', sans-serif",
};

interface ItemForm {
  productId: string;
  dosageInstructions: string;
  quantityPrescribed: number;
}

export const Prescriptions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Record<string, unknown> | null>(null);

  // Form states
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customerId: '',
    prescriberName: '',
    prescriberLicenseNo: '',
    notes: '',
  });

  const [items, setItems] = useState<ItemForm[]>([
    { productId: '', dosageInstructions: '1 tablet 3x daily after meals', quantityPrescribed: 10 },
  ]);

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await prescriptionsApi.list(params);
      setData(res.data || (Array.isArray(res) ? res : []));
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadPrescriptions(); }, [loadPrescriptions]);

  useEffect(() => {
    if (addOpen) {
      customersApi.list().then(r => setCustomers(r.data || [])).catch(() => {});
      productsApi.list({ pageSize: '100' }).then(r => setProducts(r.data || [])).catch(() => {});
    }
  }, [addOpen]);

  const handleAddItem = () => {
    setItems(prev => [...prev, { productId: '', dosageInstructions: '1 tablet 3x daily after meals', quantityPrescribed: 10 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) { toast.error('Please select a customer'); return; }
    if (items.some(i => !i.productId)) { toast.error('Please select a product for all prescription items'); return; }

    setSaving(true);
    try {
      await prescriptionsApi.create({
        ...form,
        items,
      });
      toast.success('Prescription created successfully');
      setAddOpen(false);
      setForm({ customerId: '', prescriberName: '', prescriberLicenseNo: '', notes: '' });
      setItems([{ productId: '', dosageInstructions: '1 tablet 3x daily after meals', quantityPrescribed: 10 }]);
      loadPrescriptions();
    } catch {
      toast.error('Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  const addBtn = (
    <button
      onClick={() => setAddOpen(true)}
      id="add-prescription-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
        color: '#fff', fontSize: 13, fontWeight: 600,
        padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
      }}
    >
      <Plus size={14} /> New Prescription
    </button>
  );

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100%' }}>
      <TopBar title="Prescriptions" subtitle="Manage doctor prescriptions, dispensing, and customer Rx tracking" actions={addBtn} />

      <div style={{ padding: '24px 28px' }}>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 360 }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              id="rx-search"
              placeholder="Search by prescriber or license #…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 38, backgroundColor: '#fff' }}
              onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#E8EDE9'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, width: 'auto', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIALLY_DISPENSED">Partially Dispensed</option>
            <option value="FULLY_DISPENSED">Fully Dispensed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Table card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, margin: 0 }}>Loading prescriptions…</p>
            </div>
          ) : data.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FileText size={28} color="#0F6E5C" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0D1117', margin: '0 0 6px', fontFamily: "'Space Grotesk', sans-serif" }}>No prescriptions found</p>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>
                {search || statusFilter ? 'Try adjusting your search filters' : 'Create your first prescription to start tracking'}
              </p>
              <button
                onClick={() => setAddOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
                }}
              >
                <Plus size={14} /> Add First Prescription
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFBFA' }}>
                  {['Rx ID', 'Prescriber', 'License #', 'Items', 'Date Issued', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((rx) => {
                  const status = (rx.status as string) || 'PENDING';
                  const isFully = status === 'FULLY_DISPENSED';
                  const isPart = status === 'PARTIALLY_DISPENSED';
                  return (
                    <tr key={rx.id as string} style={{ borderBottom: '1px solid #F8FAFA', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFA'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '13px 16px', fontSize: 12, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#0F6E5C' }}>
                        {(rx.id as string)?.slice(0, 8).toUpperCase()}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>
                        {rx.prescriberName as string}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, fontFamily: "'Space Mono', monospace", color: '#64748B' }}>
                        {(rx.prescriberLicenseNo as string) || '—'}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#4A5568' }}>
                        {((rx.items as unknown[])?.length || 0)} medication(s)
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748B' }}>
                        {rx.dateIssued ? format(new Date(rx.dateIssued as string), 'dd MMM yyyy') : '—'}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {isFully && <Badge variant="success">Fully Dispensed</Badge>}
                        {isPart && <Badge variant="info">Partially Dispensed</Badge>}
                        {status === 'PENDING' && <Badge variant="warning">Pending</Badge>}
                        {status === 'CANCELLED' && <Badge variant="neutral">Cancelled</Badge>}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <button
                          onClick={() => setViewItem(rx)}
                          style={{
                            fontSize: 12, fontWeight: 600, color: '#0F6E5C',
                            textDecoration: 'none', background: 'rgba(15,110,92,0.08)',
                            padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(15,110,92,0.2)',
                            cursor: 'pointer',
                          }}
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create Prescription Modal ── */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAddOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

            <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', flexShrink: 0 }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Create Prescription</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>Record doctor prescription for dispensing</p>
              </div>
              <button onClick={() => setAddOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {/* Customer */}
              <div>
                <label htmlFor="rx-customer" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Select Customer *</label>
                <select id="rx-customer" required value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select a registered customer…</option>
                  {customers.map(c => <option key={c.id as string} value={c.id as string}>{c.name as string} ({(c.phone as string) || 'No phone'})</option>)}
                </select>
              </div>

              {/* Prescriber */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="rx-prescriber" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Prescriber Doctor Name *</label>
                  <input id="rx-prescriber" required placeholder="Dr. Abebe Tadesse" value={form.prescriberName} onChange={e => setForm(f => ({ ...f, prescriberName: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="rx-license" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>License Number</label>
                  <input id="rx-license" placeholder="MD-2026-99" value={form.prescriberLicenseNo} onChange={e => setForm(f => ({ ...f, prescriberLicenseNo: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Prescription Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0D1117' }}>Prescribed Medications *</label>
                  <button type="button" onClick={handleAddItem} style={{ fontSize: 12, color: '#0F6E5C', background: 'rgba(15,110,92,0.08)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={12} /> Add Medicine
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ padding: 12, borderRadius: 12, border: '1px solid #E8EDE9', backgroundColor: '#F8FAF9', position: 'relative' }}>
                      {items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(idx)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer' }}>
                          <X size={14} />
                        </button>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 8 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Product</label>
                          <select
                            required
                            value={item.productId}
                            onChange={e => {
                              const val = e.target.value;
                              setItems(prev => prev.map((it, i) => i === idx ? { ...it, productId: val } : it));
                            }}
                            style={{ ...inputStyle, padding: '8px 10px', fontSize: 13, cursor: 'pointer' }}
                          >
                            <option value="">Select medication…</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.strength})</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Qty Prescribed</label>
                          <input
                            type="number" min="1" required
                            value={item.quantityPrescribed}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantityPrescribed: val } : it));
                            }}
                            style={{ ...inputStyle, padding: '8px 10px', fontSize: 13 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Dosage Instructions</label>
                        <input
                          placeholder="e.g. 1 tablet every 8 hours after meals"
                          value={item.dosageInstructions}
                          onChange={e => {
                            const val = e.target.value;
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, dosageInstructions: val } : it));
                          }}
                          style={{ ...inputStyle, padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="rx-notes" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Prescription Notes</label>
                <textarea id="rx-notes" rows={2} placeholder="Optional instructions or diagnosis notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setAddOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} id="save-rx-btn" style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><FileText size={15} /> Save Prescription</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Prescription Modal ── */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setViewItem(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Prescription Details</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0', fontFamily: "'Space Mono', monospace" }}>{(viewItem.id as string)?.slice(0, 12).toUpperCase()}</p>
              </div>
              <button onClick={() => setViewItem(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}><X size={16} /></button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, backgroundColor: '#F8FAF9', padding: 14, borderRadius: 12, border: '1px solid #E8EDE9' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Prescriber</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1117', marginTop: 2 }}>{viewItem.prescriberName as string}</div>
                  {Boolean(viewItem.prescriberLicenseNo) && <div style={{ fontSize: 11, color: '#64748B' }}>License: {String(viewItem.prescriberLicenseNo)}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Date Issued</div>
                  <div style={{ fontSize: 13, color: '#0D1117', marginTop: 2 }}>{viewItem.dateIssued ? format(new Date(viewItem.dateIssued as string), 'dd MMM yyyy') : '—'}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0D1117', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Prescribed Items</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {((viewItem.items as Record<string, unknown>[]) || []).map((it, idx) => (
                    <div key={idx} style={{ padding: 12, borderRadius: 10, border: '1px solid #E8EDE9', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1117' }}>{(it.product as { name?: string })?.name || 'Medication'}</div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Instructions: {it.dosageInstructions as string}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>
                        {it.quantityPrescribed as number} units
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setViewItem(null)} style={{ padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
