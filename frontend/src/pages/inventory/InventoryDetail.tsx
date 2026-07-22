import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, X } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/Badge';
import { BlistarStrip } from '../../components/ui/BlistarStrip';
import { productsApi, batchesApi, stockMovementsApi } from '../../api/products';
import type { Product, Batch } from '../../api/products';
import { useAuthStore } from '../../store/authStore';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #E8EDE9', borderRadius: 10,
  fontSize: 14, color: '#0D1117', backgroundColor: '#F9FAFB',
  padding: '10px 14px', outline: 'none', transition: 'all 0.15s',
  fontFamily: "'Inter', sans-serif",
};

export const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const canManage = useAuthStore(s => s.hasRole(['ADMIN', 'INVENTORY_CLERK']));
  const [product, setProduct] = useState<(Product & { batches: Batch[] }) | null>(null);
  const [movements, setMovements] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [writeOffBatch, setWriteOffBatch] = useState<Batch | null>(null);
  const [batchForm, setBatchForm] = useState({ batchNumber: '', expiryDate: '', quantityOnHand: 0, costPrice: 0, sellingPrice: 0 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [prod, movs] = await Promise.all([
        productsApi.get(id),
        stockMovementsApi.list({ productId: id, pageSize: '20' }),
      ]);
      setProduct(prod);
      setMovements(movs.data || []);
    } catch {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <><TopBar title="Product Detail" /><div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />Loading product details…</div></>;
  if (!product) return <div style={{ padding: 40, color: '#64748B' }}>Product not found.</div>;

  const now = new Date();
  const validBatches = product.batches ? product.batches.filter(b => b.quantityOnHand > 0) : [];
  const stockOnHand = product.batches
    ? product.batches.filter(b => new Date(b.expiryDate) > now).reduce((s, b) => s + b.quantityOnHand, 0)
    : 0;

  const getBatchStatus = (b: Batch) => {
    const exp = new Date(b.expiryDate);
    if (exp <= now) return 'expired';
    const days = differenceInDays(exp, now);
    if (days <= 30) return 'danger';
    if (days <= 90) return 'warning';
    return 'valid';
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await batchesApi.create({
        productId: id,
        batchNumber: batchForm.batchNumber,
        expiryDate: batchForm.expiryDate,
        quantityOnHand: batchForm.quantityOnHand,
        costPrice: batchForm.costPrice,
        sellingPrice: batchForm.sellingPrice || undefined,
      });
      toast.success(`Batch ${batchForm.batchNumber} added`);
      setAddBatchOpen(false);
      setBatchForm({ batchNumber: '', expiryDate: '', quantityOnHand: 0, costPrice: 0, sellingPrice: 0 });
      load();
    } catch { toast.error('Failed to add batch'); } finally { setSaving(false); }
  };

  const handleWriteOff = async () => {
    if (!writeOffBatch || !id) return;
    setSaving(true);
    try {
      await stockMovementsApi.create({
        productId: id,
        batchId: writeOffBatch.id,
        type: 'EXPIRED_WRITEOFF',
        quantity: writeOffBatch.quantityOnHand,
        reason: 'Manual write-off of expired stock',
      });
      toast.success(`Batch ${writeOffBatch.batchNumber} written off`);
      setWriteOffBatch(null);
      load();
    } catch { toast.error('Failed to write off batch'); } finally { setSaving(false); }
  };

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100%' }}>
      <TopBar
        title={product.name}
        subtitle={[product.genericName, product.dosageForm, product.strength].filter(Boolean).join(' · ')}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/inventory" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: '#4A5568', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 10, border: '1.5px solid #E8EDE9', background: '#fff' }}>
              <ArrowLeft size={14} /> Back
            </Link>
            {canManage && (
              <button
                onClick={() => setAddBatchOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,110,92,0.3)' }}
              >
                <Plus size={14} /> Receive Batch
              </button>
            )}
          </div>
        }
      />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Product Meta Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Stock</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1117', fontFamily: "'Space Grotesk', sans-serif", marginTop: 4 }}>
                {stockOnHand} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>{product.unitOfMeasure}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Cost Price (Avg)</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#475569', fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
                ETB {(product.costPrice ?? product.defaultCostPrice ?? 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Selling Price</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F6E5C', fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
                ETB {product.defaultSellingPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Profit Margin</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: (product.grossMarginPct ?? 0) >= 30 ? '#0F6E5C' : '#C17A1F', fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
                {(product.grossMarginPct ?? 0).toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Category</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#4A5568', marginTop: 8 }}>
                {product.category?.name || '—'}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid #EEF2F0' }}>
            {product.requiresPrescription && <Badge variant="warning">Prescription Required (Rx)</Badge>}
            {product.isControlledSubstance && <Badge variant="danger">Controlled Substance</Badge>}
            {product.barcode && <Badge variant="neutral">Barcode: {product.barcode}</Badge>}
          </div>

          {/* FEFO Blister Strip */}
          {validBatches.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #EEF2F0' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                FEFO Batch Sequence (Soonest Expiry First)
              </div>
              <BlistarStrip batches={validBatches} />
            </div>
          )}
        </div>

        {/* Batches Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Batches</h3>
            <span style={{ fontSize: 12, color: '#64748B' }}>{product.batches?.length || 0} batches recorded</span>
          </div>

          {(!product.batches || product.batches.length === 0) ? (
            <div style={{ padding: 36, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No batches recorded for this product yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFBFA' }}>
                  {['Batch Number', 'Expiry Date', 'Qty on Hand', 'Cost Price', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.batches.map(b => {
                  const status = getBatchStatus(b);
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F8FAFA' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", fontWeight: 600, color: '#0D1117' }}>{b.batchNumber}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#4A5568' }}>{format(new Date(b.expiryDate), 'dd MMM yyyy')}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{b.quantityOnHand}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: "'Space Mono', monospace", color: '#64748B' }}>ETB {b.costPrice.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {status === 'expired' && <Badge variant="danger">Expired</Badge>}
                        {status === 'danger' && <Badge variant="danger">&lt; 30d expiry</Badge>}
                        {status === 'warning' && <Badge variant="warning">&lt; 90d expiry</Badge>}
                        {status === 'valid' && <Badge variant="success">Valid</Badge>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {canManage && status === 'expired' && b.quantityOnHand > 0 && (
                          <button onClick={() => setWriteOffBatch(b)} style={{ fontSize: 12, color: '#C0392B', background: 'rgba(192,57,43,0.1)', border: 'none', padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                            Write off
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Stock Movements Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF2F0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Stock Movement History</h3>
          </div>
          {movements.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No stock movement records for this product yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFBFA' }}>
                  {['Date', 'Type', 'Qty', 'Reason'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id as string} style={{ borderBottom: '1px solid #F8FAFA' }}>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#64748B' }}>{format(new Date(m.createdAt as string), 'dd MMM yyyy HH:mm')}</td>
                    <td style={{ padding: '11px 16px' }}><Badge variant="neutral">{m.type as string}</Badge></td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{m.quantity as number}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#64748B' }}>{(m.reason as string) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Batch Modal */}
      {addBatchOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAddBatchOpen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Receive New Batch</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '2px 0 0' }}>Add batch inventory for {product.name}</p>
              </div>
              <button onClick={() => setAddBatchOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddBatch} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="b-num" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Batch Number *</label>
                <input id="b-num" required placeholder="e.g. BATCH-2026-001" value={batchForm.batchNumber} onChange={e => setBatchForm(b => ({ ...b, batchNumber: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="b-exp" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Expiry Date *</label>
                <input id="b-exp" type="date" required value={batchForm.expiryDate} onChange={e => setBatchForm(b => ({ ...b, expiryDate: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="b-qty" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Quantity Received *</label>
                <input id="b-qty" type="number" min="1" required value={batchForm.quantityOnHand} onChange={e => setBatchForm(b => ({ ...b, quantityOnHand: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="b-cost" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Cost Price (ETB) *</label>
                <input id="b-cost" type="number" step="0.01" min="0" required value={batchForm.costPrice} onChange={e => setBatchForm(b => ({ ...b, costPrice: Number(e.target.value) }))} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setAddBatchOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Plus size={15} /> Save Batch</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Write Off Modal */}
      {writeOffBatch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setWriteOffBatch(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden', padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#C0392B', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>Write Off Batch?</h3>
            <p style={{ fontSize: 14, color: '#4A5568', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to write off batch <strong>{writeOffBatch.batchNumber}</strong> ({writeOffBatch.quantityOnHand} units)? This will remove it from inventory stock.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setWriteOffBatch(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568', fontSize: 14, fontWeight: 600 }}>Cancel</button>
              <button onClick={handleWriteOff} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', background: 'linear-gradient(135deg, #C0392B, #e74c3c)', color: '#fff', fontSize: 14, fontWeight: 700 }}>Write Off</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
