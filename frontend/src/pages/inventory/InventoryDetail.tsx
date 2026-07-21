import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { BlistarStrip } from '../../components/ui/BlistarStrip';
import { productsApi, batchesApi, stockMovementsApi } from '../../api/products';
import type { Product, Batch } from '../../api/products';
import { useAuthStore } from '../../store/authStore';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

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

  if (loading) return <><TopBar title="Product Detail" /><PageLoader /></>;
  if (!product) return <div className="p-6 text-ink-muted">Product not found.</div>;

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
    return 'good';
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await batchesApi.create({ ...batchForm, productId: product.id });
      toast.success(`Batch ${batchForm.batchNumber} received`);
      setAddBatchOpen(false);
      load();
    } catch { toast.error('Failed to add batch'); } finally { setSaving(false); }
  };

  const handleWriteOff = async () => {
    if (!writeOffBatch) return;
    setSaving(true);
    try {
      await stockMovementsApi.create({
        productId: product.id,
        batchId: writeOffBatch.id,
        type: 'EXPIRED_WRITEOFF',
        quantity: writeOffBatch.quantityOnHand,
        reason: `Write-off of expired batch ${writeOffBatch.batchNumber}`,
      });
      toast.success(`Batch ${writeOffBatch.batchNumber} written off`);
      setWriteOffBatch(null);
      load();
    } catch { toast.error('Failed to write off batch'); } finally { setSaving(false); }
  };

  return (
    <div>
      <TopBar title={product.name} subtitle={product.genericName || ''} />
      <div className="p-6 space-y-6">
        <div>
          <Link to="/inventory" className="flex items-center gap-1 text-sm text-ink-muted hover:text-primary mb-4">
            <ArrowLeft size={14} /> Back to inventory
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <h2 className="font-display font-semibold text-ink mb-4">Product details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {([
                ['Generic name', product.genericName || '—'],
                ['Brand name', product.brandName || '—'],
                ['Category', product.category?.name || '—'],
                ['Dosage form', product.dosageForm],
                ['Strength', product.strength || '—'],
                ['Barcode', product.barcode || '—'],
                ['Unit', product.unitOfMeasure],
                ['Reorder level', String(product.reorderLevel)],
                ['Selling price', `ETB ${product.defaultSellingPrice.toFixed(2)}`],
                ['Tax rate', `${(product.taxRate * 100).toFixed(0)}%`],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs text-ink-subtle">{label}</div>
                  <div className="font-medium text-ink font-mono">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              {product.requiresPrescription && <Badge variant="warning">Rx Required</Badge>}
              {product.isControlledSubstance && <Badge variant="danger">Controlled Substance</Badge>}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display font-semibold text-ink mb-4">Stock summary</h2>
            <div className="text-4xl font-display font-bold text-ink tabular mb-1">{stockOnHand}</div>
            <div className="text-sm text-ink-muted mb-4">units on hand</div>
            <BlistarStrip batches={validBatches} />
            {canManage && (
              <Button size="sm" className="mt-4 w-full" onClick={() => setAddBatchOpen(true)} id="add-batch-btn">
                Receive stock
              </Button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display font-semibold text-ink">Batches</h2>
          </div>
          {!product.batches || product.batches.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-muted">No batches — receive stock to add the first batch.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Batch #</th><th>Expiry</th><th>Qty on hand</th><th>Cost price</th><th>Selling price</th><th>Status</th>{canManage && <th></th>}</tr></thead>
                <tbody>
                  {product.batches.map(batch => {
                    const status = getBatchStatus(batch);
                    return (
                      <tr key={batch.id}>
                        <td className="font-mono text-xs">{batch.batchNumber}</td>
                        <td className="tabular text-sm">{format(new Date(batch.expiryDate), 'dd MMM yyyy')}</td>
                        <td className="tabular font-medium">{batch.quantityOnHand}</td>
                        <td className="tabular">ETB {batch.costPrice.toFixed(2)}</td>
                        <td className="tabular">ETB {(batch.sellingPrice ?? batch.costPrice).toFixed(2)}</td>
                        <td>
                          <Badge variant={status === 'expired' || status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : 'success'}>
                            {status === 'expired' ? 'Expired' : status === 'danger' ? '<30d' : status === 'warning' ? '<90d' : 'Good'}
                          </Badge>
                        </td>
                        {canManage && (
                          <td>
                            {batch.quantityOnHand > 0 && (
                              <button onClick={() => setWriteOffBatch(batch)}
                                className="flex items-center gap-1 text-xs text-red-500 hover:underline focus-visible:outline-none"
                                id={`writeoff-${batch.id}`}>
                                <AlertTriangle size={12} /> Write off
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="p-5 border-b border-border">
            <h2 className="font-display font-semibold text-ink">Stock movement history</h2>
          </div>
          {movements.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-muted">No stock movements recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Type</th><th>Qty</th><th>Batch</th><th>Reason</th></tr></thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id as string}>
                      <td className="tabular text-xs text-ink-muted">{format(new Date(m.createdAt as string), 'dd MMM yyyy HH:mm')}</td>
                      <td><Badge variant={String(m.type).includes('IN') || String(m.type).includes('RETURN') ? 'success' : 'danger'}>{m.type as string}</Badge></td>
                      <td className="tabular font-medium">{m.quantity as number}</td>
                      <td className="font-mono text-xs">{(m.batch as Record<string, unknown>)?.batchNumber as string || '—'}</td>
                      <td className="text-ink-muted">{(m.reason as string) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={addBatchOpen} onClose={() => setAddBatchOpen(false)} title="Receive stock" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddBatchOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAddBatch} id="save-batch-btn">Receive stock</Button>
          </>
        }
      >
        <form onSubmit={handleAddBatch} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="batch-number" className="text-sm font-medium text-ink">Batch number <span className="text-red-500">*</span></label>
            <input id="batch-number" required value={batchForm.batchNumber} onChange={e => setBatchForm(f => ({ ...f, batchNumber: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="expiry-date" className="text-sm font-medium text-ink">Expiry date <span className="text-red-500">*</span></label>
            <input id="expiry-date" type="date" required value={batchForm.expiryDate} onChange={e => setBatchForm(f => ({ ...f, expiryDate: e.target.value }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="batch-qty" className="text-sm font-medium text-ink">Quantity</label>
            <input id="batch-qty" type="number" value={batchForm.quantityOnHand} onChange={e => setBatchForm(f => ({ ...f, quantityOnHand: Number(e.target.value) }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="cost-price" className="text-sm font-medium text-ink">Cost price (ETB)</label>
            <input id="cost-price" type="number" step="0.01" min={0} value={batchForm.costPrice} onChange={e => setBatchForm(f => ({ ...f, costPrice: Number(e.target.value) }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="batch-selling-price" className="text-sm font-medium text-ink">Selling price (ETB)</label>
            <input id="batch-selling-price" type="number" step="0.01" min={0} value={batchForm.sellingPrice} onChange={e => setBatchForm(f => ({ ...f, sellingPrice: Number(e.target.value) }))}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!writeOffBatch}
        onClose={() => setWriteOffBatch(null)}
        onConfirm={handleWriteOff}
        loading={saving}
        title="Write off batch"
        message={writeOffBatch ? `Write off batch "${writeOffBatch.batchNumber}"? This will remove ${writeOffBatch.quantityOnHand} units from stock. This action cannot be undone.` : ''}
        confirmLabel="Write off batch"
        variant="danger"
      />
    </div>
  );
};
