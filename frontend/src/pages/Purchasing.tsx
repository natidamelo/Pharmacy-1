import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Truck, Building2, Loader2, X, Phone, Mail } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { Badge } from '../components/ui/Badge';
import { purchasingApi } from '../api/purchasing';
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

export const Purchasing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'po' | 'suppliers'>('po');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);

  // Modals
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [addPoOpen, setAddPoOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Forms
  const [supplierForm, setSupplierForm] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });
  const [suppliers, setSuppliers] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [poForm, setPoForm] = useState({
    supplierId: '',
    expectedDate: '',
    items: [{ productId: '', quantityOrdered: 50, unitCost: 10 }],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'po') {
        const res = await purchasingApi.listPurchaseOrders();
        setData(res.data || (Array.isArray(res) ? res : []));
      } else {
        const res = await purchasingApi.listSuppliers();
        setData(res.data || (Array.isArray(res) ? res : []));
      }
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (addPoOpen) {
      purchasingApi.listSuppliers().then(res => setSuppliers(res.data || (Array.isArray(res) ? res : []))).catch(() => {});
      productsApi.list({ pageSize: '100' }).then(res => setProducts(res.data || [])).catch(() => {});
    }
  }, [addPoOpen]);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await purchasingApi.createSupplier(supplierForm);
      toast.success(`Supplier "${supplierForm.name}" added`);
      setAddSupplierOpen(false);
      setSupplierForm({ name: '', contactPerson: '', phone: '', email: '', address: '' });
      fetchData();
    } catch { toast.error('Failed to add supplier'); } finally { setSaving(false); }
  };

  const handleAddPo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.supplierId) { toast.error('Please select a supplier'); return; }
    if (poForm.items.some(i => !i.productId)) { toast.error('Please select a product for all order items'); return; }

    setSaving(true);
    try {
      await purchasingApi.createPurchaseOrder(poForm);
      toast.success('Purchase order created');
      setAddPoOpen(false);
      setPoForm({ supplierId: '', expectedDate: '', items: [{ productId: '', quantityOrdered: 50, unitCost: 10 }] });
      fetchData();
    } catch { toast.error('Failed to create purchase order'); } finally { setSaving(false); }
  };

  const actions = activeTab === 'po' ? (
    <button
      onClick={() => setAddPoOpen(true)}
      id="add-po-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
        color: '#fff', fontSize: 13, fontWeight: 600,
        padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
      }}
    >
      <Plus size={14} /> New Purchase Order
    </button>
  ) : (
    <button
      onClick={() => setAddSupplierOpen(true)}
      id="add-supplier-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
        color: '#fff', fontSize: 13, fontWeight: 600,
        padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
      }}
    >
      <Plus size={14} /> Add Supplier
    </button>
  );

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100%' }}>
      <TopBar title="Purchasing" subtitle="Manage suppliers, stock replenishment, and purchase orders" actions={actions} />

      <div style={{ padding: '24px 28px' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, backgroundColor: '#fff', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid #E8EDE9', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {[
            { id: 'po', label: 'Purchase Orders', icon: <Truck size={15} /> },
            { id: 'suppliers', label: 'Suppliers Directory', icon: <Building2 size={15} /> },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  background: isActive ? 'linear-gradient(135deg, #0F6E5C, #0d9488)' : 'transparent',
                  color: isActive ? '#fff' : '#64748B',
                  boxShadow: isActive ? '0 4px 12px rgba(15,110,92,0.3)' : 'none',
                  transition: 'all 0.15s', fontFamily: "'Inter', sans-serif",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8', backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, margin: 0 }}>Loading purchasing data…</p>
          </div>
        ) : (
          <>
            {/* Purchase Orders tab */}
            {activeTab === 'po' && (
              <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {data.length === 0 ? (
                  <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                    <Truck size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#4A5568', margin: '0 0 6px' }}>No purchase orders yet</p>
                    <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>Create a purchase order to receive new inventory stock</p>
                    <button onClick={() => setAddPoOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,110,92,0.3)' }}>
                      <Plus size={14} /> Create Purchase Order
                    </button>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FAFBFA' }}>
                        {['PO #', 'Supplier', 'Status', 'Expected Date', 'Items', 'Created Date'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((po) => {
                        const status = (po.status as string) || 'DRAFT';
                        return (
                          <tr key={po.id as string} style={{ borderBottom: '1px solid #F8FAFA' }}>
                            <td style={{ padding: '13px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: '#0F6E5C' }}>
                              {po.poNumber as string}
                            </td>
                            <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>
                              {(po.supplier as { name?: string })?.name || 'Supplier'}
                            </td>
                            <td style={{ padding: '13px 16px' }}>
                              {status === 'DRAFT' && <Badge variant="neutral">Draft</Badge>}
                              {status === 'ORDERED' && <Badge variant="info">Ordered</Badge>}
                              {status === 'PARTIALLY_RECEIVED' && <Badge variant="warning">Partially Received</Badge>}
                              {status === 'RECEIVED' && <Badge variant="success">Received</Badge>}
                              {status === 'CANCELLED' && <Badge variant="danger">Cancelled</Badge>}
                            </td>
                            <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748B' }}>
                              {po.expectedDate ? format(new Date(po.expectedDate as string), 'dd MMM yyyy') : '—'}
                            </td>
                            <td style={{ padding: '13px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", color: '#4A5568' }}>
                              {((po.items as unknown[])?.length || 0)} item(s)
                            </td>
                            <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748B' }}>
                              {format(new Date(po.createdAt as string), 'dd MMM yyyy')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Suppliers tab */}
            {activeTab === 'suppliers' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {data.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '56px 24px', textAlign: 'center', backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0' }}>
                    <Building2 size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#4A5568', margin: '0 0 6px' }}>No suppliers registered</p>
                    <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>Add pharmaceutical suppliers to manage orders</p>
                    <button onClick={() => setAddSupplierOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,110,92,0.3)' }}>
                      <Plus size={14} /> Add Supplier
                    </button>
                  </div>
                ) : (
                  data.map((s) => (
                    <div key={s.id as string} style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(15,110,92,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={18} color="#0F6E5C" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{s.name as string}</h3>
                          {Boolean(s.contactPerson) && <div style={{ fontSize: 11, color: '#64748B' }}>Contact: {s.contactPerson as string}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#4A5568', paddingTop: 10, borderTop: '1px solid #EEF2F0' }}>
                        {Boolean(s.phone) && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} color="#94A3B8" /> {s.phone as string}</div>}
                        {Boolean(s.email) && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} color="#94A3B8" /> {s.email as string}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Supplier Modal */}
      {addSupplierOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAddSupplierOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Add Supplier</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>Register a new pharmaceutical supplier</p>
              </div>
              <button onClick={() => setAddSupplierOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddSupplier} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="s-name" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Company / Supplier Name *</label>
                <input id="s-name" required placeholder="e.g. MediSupplies Ethiopia" value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="s-contact" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Contact Person</label>
                <input id="s-contact" placeholder="e.g. Ato Tadesse" value={supplierForm.contactPerson} onChange={e => setSupplierForm(f => ({ ...f, contactPerson: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label htmlFor="s-phone" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Phone Number</label>
                  <input id="s-phone" placeholder="+251 9xx xxx xxx" value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="s-email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email</label>
                  <input id="s-email" type="email" placeholder="sales@supplier.com" value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setAddSupplierOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} id="save-supplier-btn" style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Building2 size={15} /> Save Supplier</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add PO Modal */}
      {addPoOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAddPoOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>New Purchase Order</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>Order stock items from supplier</p>
              </div>
              <button onClick={() => setAddPoOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddPo} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="po-supplier" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Select Supplier *</label>
                <select id="po-supplier" required value={poForm.supplierId} onChange={e => setPoForm(f => ({ ...f, supplierId: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select a supplier…</option>
                  {suppliers.map(s => <option key={s.id as string} value={s.id as string}>{s.name as string}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="po-date" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Expected Delivery Date</label>
                <input id="po-date" type="date" value={poForm.expectedDate} onChange={e => setPoForm(f => ({ ...f, expectedDate: e.target.value }))} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Order Item *</label>
                <select
                  required
                  value={poForm.items[0]?.productId || ''}
                  onChange={e => {
                    const pid = e.target.value;
                    setPoForm(f => ({ ...f, items: [{ ...f.items[0], productId: pid }] }));
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select product to order…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.strength || p.dosageForm})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setAddPoOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} id="save-po-btn" style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Truck size={15} /> Create Purchase Order</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
