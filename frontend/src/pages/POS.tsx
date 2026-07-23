import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, Plus, Minus, X, ShoppingCart, CreditCard,
  Printer, Package, CheckCircle, Loader2, Trash2,
  Tag, Zap, User, ReceiptText, Banknote,
  Smartphone, Building2, Hash, Grid3X3, List,
  FileText, ClipboardList,
} from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { productsApi } from '../api/products';
import type { Product } from '../api/products';
import { categoriesApi } from '../api/categories';
import type { Category } from '../api/categories';
import { salesApi } from '../api/sales';
import { prescriptionsApi } from '../api/prescriptions';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

/* ─── Payment options ─── */
const PaymentOptions = [
  { value: 'CASH',         label: 'Cash',         Icon: Banknote,    color: '#059669' },
  { value: 'CARD',         label: 'Card',          Icon: CreditCard,  color: '#6366F1' },
  { value: 'MOBILE_MONEY', label: 'Mobile',        Icon: Smartphone,  color: '#F59E0B' },
  { value: 'INSURANCE',    label: 'Insurance',     Icon: Building2,   color: '#0EA5E9' },
];

/* ─── Numpad keys ─── */
const numpadKeys = ['7','8','9','4','5','6','1','2','3','00','0','.'];

/* ─── helpers ─── */
const fmtPrice = (n: number) => `ETB ${n.toFixed(2)}`;

const StockBadge: React.FC<{ qty: number; reorder: number }> = ({ qty, reorder }) => {
  const oos  = qty === 0;
  const low  = !oos && qty <= reorder;
  const color = oos ? '#DC2626' : low ? '#D97706' : '#059669';
  const bg    = oos ? '#FEF2F2' : low ? '#FFFBEB' : '#F0FDF4';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
      backgroundColor: bg, color, letterSpacing: '0.3px',
    }}>
      {oos ? 'Out of stock' : low ? `Low · ${qty}` : `${qty} in stock`}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════ */
export const POS: React.FC = () => {
  const { items, addItem, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();

  /* search / products */
  const [search, setSearch]       = useState('');
  const [results, setResults]     = useState<Product[]>([]);
  const [allProducts, setAll]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState('ALL');
  const [searching, setSearching] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid');
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* checkout / receipt */
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen]   = useState(false);
  const [lastSale, setLastSale]         = useState<Record<string, unknown> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH'|'CARD'|'MOBILE_MONEY'|'INSURANCE'>('CASH');
  const [discount, setDiscount]   = useState(0);
  const [cashTendered, setCashTendered] = useState('');
  const [completing, setCompleting] = useState(false);
  const [customerNote, setCustomerNote] = useState('');

  /* Load Prescription (Rx) into cart */
  const [rxModalOpen, setRxModalOpen]       = useState(false);
  const [rxSearch, setRxSearch]             = useState('');
  const [rxResults, setRxResults]           = useState<Record<string, unknown>[]>([]);
  const [rxLoading, setRxLoading]           = useState(false);
  const [rxFilling, setRxFilling]           = useState(false);
  const [loadedRx, setLoadedRx]             = useState<Record<string, unknown> | null>(null);

  /* Load all products + categories on mount */
  useEffect(() => {
    setLoadingAll(true);
    Promise.all([
      productsApi.list({ pageSize: '100', stockStatus: '' }),
      categoriesApi.list(),
    ]).then(([prod, cats]) => {
      setAll(prod.data || []);
      setCategories(cats || []);
    }).catch(() => {}).finally(() => setLoadingAll(false));
  }, []);

  /* Live search */
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    if (!value.trim()) { setResults([]); return; }
    searchRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await productsApi.list({ search: value, pageSize: '20' });
        setResults(data.data || []);
      } catch { setResults([]); } finally { setSearching(false); }
    }, 280);
  }, []);

  /* Derived product list */
  const displayedProducts = search
    ? results
    : activeCat === 'ALL'
      ? allProducts
      : allProducts.filter(p => p.categoryId === activeCat);

  /* Cart actions */
  const handleAddToCart = (product: Product) => {
    if (!product.stockOnHand || product.stockOnHand <= 0) {
      toast.error('This product is out of stock'); return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.defaultSellingPrice,
      discount: 0,
      requiresPrescription: product.requiresPrescription,
      isControlledSubstance: product.isControlledSubstance,
      stockOnHand: product.stockOnHand,
    });
    toast.success(`${product.name} added`, { duration: 1500, icon: '✅' });
  };

  /* Totals */
  const tax      = subtotal() * 0.15;
  const total    = Math.max(0, subtotal() + tax - discount);
  const tendered = parseFloat(cashTendered) || 0;
  const change   = Math.max(0, tendered - total);

  /* Numpad handler */
  const handleNumpad = (key: string) => {
    setCashTendered(prev => {
      if (key === '.' && prev.includes('.')) return prev;
      if (key === '00') return prev === '0' ? '0' : prev + '00';
      if (prev === '0' && key !== '.') return key;
      return prev + key;
    });
  };

  /* Search pending prescriptions */
  const handleRxSearch = useCallback(async (value: string) => {
    setRxSearch(value);
    if (!value.trim()) { setRxResults([]); return; }
    setRxLoading(true);
    try {
      const res = await prescriptionsApi.list({ search: value, status: 'PENDING' });
      setRxResults(res.data || []);
    } catch { setRxResults([]); } finally { setRxLoading(false); }
  }, []);

  /* Load a prescription and fill the cart */
  const handleLoadRx = async (rx: Record<string, unknown>) => {
    setRxFilling(true);
    try {
      const full = await prescriptionsApi.get(rx.id as string);
      const rxItems = (full.items as Array<{
        productId: string;
        quantityPrescribed: number;
        dosageInstructions: string;
        product: { id: string; name: string; defaultSellingPrice: number;
          requiresPrescription: boolean; isControlledSubstance: boolean;
          stockOnHand?: number; reorderLevel: number; };
      }>);

      clearCart();
      for (const it of rxItems) {
        // Fetch live product data (for stockOnHand & current price)
        const prodData = await productsApi.list({ search: it.product.name, pageSize: '5' });
        const prod = (prodData.data as Product[])?.find((p: Product) => p.id === it.productId)
                     ?? it.product as unknown as Product;

        if ((prod.stockOnHand ?? 0) <= 0) {
          toast.error(`${prod.name} is out of stock — skipped`);
          continue;
        }
        addItem({
          productId: it.productId,
          productName: prod.name,
          quantity: it.quantityPrescribed,
          unitPrice: prod.defaultSellingPrice,
          discount: 0,
          requiresPrescription: prod.requiresPrescription,
          isControlledSubstance: prod.isControlledSubstance,
          stockOnHand: prod.stockOnHand ?? 0,
        });
      }

      setLoadedRx(full);
      setRxModalOpen(false);
      setRxSearch('');
      setRxResults([]);
      toast.success(`Prescription loaded — ${rxItems.length} medication(s) added to cart`, { icon: '📋' });
    } catch {
      toast.error('Failed to load prescription');
    } finally { setRxFilling(false); }
  };

  /* Complete sale */
  const handleCompleteSale = async () => {
    setCompleting(true);
    try {
      const payload: Parameters<typeof salesApi.create>[0] = {
        paymentMethod,
        discountAmount: discount,
        notes: customerNote || undefined,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
        })),
      };

      // Link prescription if one was loaded; otherwise use override
      if (loadedRx) {
        payload.prescriptionId = loadedRx.id as string;
      } else {
        payload.overridePrescription = true;
      }

      const sale = await salesApi.create(payload);
      setLastSale(sale);
      clearCart();
      setLoadedRx(null);
      setCheckoutOpen(false);
      setReceiptOpen(true);
      setDiscount(0);
      setCashTendered('');
      setCustomerNote('');
      toast.success('Sale completed!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to complete sale');
    } finally { setCompleting(false); }
  };

  /* ── STYLES ── */
  const inputS: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '1.5px solid #2D3748', borderRadius: 10,
    padding: '10px 14px', fontSize: 13, color: '#F7FAFC',
    backgroundColor: '#1A2332', outline: 'none', transition: 'all 0.15s',
    fontFamily: "'Inter', sans-serif",
  };

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1923' }}>
      <TopBar title="Point of Sale" subtitle="Fast, smart pharmacy checkout" />

      {/* Global keyframe */}
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .pos-product-card:hover { border-color:#0d9488 !important; box-shadow:0 8px 24px rgba(13,148,136,0.25) !important; transform:translateY(-2px) !important; }
        .pos-product-card:active { transform:scale(0.97) !important; }
        .pos-cat-btn:hover { background:rgba(13,148,136,0.15) !important; color:#5EEAD4 !important; }
        .numpad-key:hover { background:#1E3A5F !important; }
        .numpad-key:active { transform:scale(0.93); }
        .payment-opt:hover { border-color:#0d9488 !important; background:rgba(13,148,136,0.12) !important; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#2D3748; border-radius:99px; }
        @media print {
          body > *:not(#receipt-print) { display:none !important; }
          #receipt-print { display:block !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ══════════════════════════════════════════════
            LEFT — Product panel (dark)
        ══════════════════════════════════════════════ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          backgroundColor: '#0F1923', overflow: 'hidden',
        }}>

          {/* ── Search + view toggle bar ── */}
          <div style={{
            padding: '14px 20px 0',
            background: 'linear-gradient(180deg, #141E2B 0%, #0F1923 100%)',
          }}>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Search size={15} color="#4A5568" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
              }} />
              {searching && (
                <Loader2 size={14} color="#0d9488" style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  animation: 'spin 1s linear infinite',
                }} />
              )}
              <input
                id="pos-search"
                type="text"
                placeholder="Search products or scan barcode…"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 42px',
                  borderRadius: 12,
                  border: '1.5px solid #2D3748',
                  fontSize: 14, color: '#E2E8F0',
                  backgroundColor: '#1A2332',
                  outline: 'none', transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#0d9488';
                  e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.2)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#2D3748';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6, marginRight: 'auto' }}>
                <button
                  className="pos-cat-btn"
                  onClick={() => { setActiveCat('ALL'); setSearch(''); setResults([]); }}
                  style={{
                    flexShrink: 0, padding: '6px 14px', borderRadius: 20,
                    border: '1.5px solid',
                    borderColor: activeCat === 'ALL' ? '#0d9488' : '#2D3748',
                    background: activeCat === 'ALL' ? 'rgba(13,148,136,0.2)' : 'transparent',
                    color: activeCat === 'ALL' ? '#5EEAD4' : '#64748B',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className="pos-cat-btn"
                    onClick={() => { setActiveCat(cat.id); setSearch(''); setResults([]); }}
                    style={{
                      flexShrink: 0, padding: '6px 14px', borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: activeCat === cat.id ? '#0d9488' : '#2D3748',
                      background: activeCat === cat.id ? 'rgba(13,148,136,0.2)' : 'transparent',
                      color: activeCat === cat.id ? '#5EEAD4' : '#64748B',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div style={{
                display: 'flex', borderRadius: 8, overflow: 'hidden',
                border: '1.5px solid #2D3748', flexShrink: 0,
              }}>
                {([['grid', Grid3X3], ['list', List]] as const).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: '5px 9px', border: 'none', cursor: 'pointer',
                      background: viewMode === mode ? '#0d9488' : 'transparent',
                      color: viewMode === mode ? '#fff' : '#4A5568',
                      display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Product area ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px' }}>
            {/* Loading */}
            {loadingAll && !search && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: '#4A5568' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#0d9488' }} />
                <span style={{ fontSize: 13 }}>Loading products…</span>
              </div>
            )}

            {/* No results */}
            {!loadingAll && displayedProducts.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 12 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1A2332, #243040)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Package size={30} color="#4A5568" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#64748B', margin: '0 0 4px' }}>
                  {search ? `No results for "${search}"` : 'No products in this category'}
                </p>
                <p style={{ fontSize: 13, color: '#4A5568', margin: 0 }}>Try a different search or category</p>
                {search && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Amoxicillin', 'Paracetamol', 'Vitamin C'].map(hint => (
                      <button key={hint} onClick={() => handleSearch(hint)} style={{
                        fontSize: 12, color: '#0d9488', background: 'rgba(13,148,136,0.1)',
                        border: '1px solid rgba(13,148,136,0.25)', borderRadius: 20,
                        padding: '5px 14px', cursor: 'pointer', fontWeight: 500,
                      }}>{hint}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GRID view */}
            {!loadingAll && displayedProducts.length > 0 && viewMode === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: 12, paddingTop: 4,
              }}>
                {displayedProducts.map(product => {
                  const oos = !product.stockOnHand || product.stockOnHand <= 0;
                  const inCart = items.find(i => i.productId === product.id);
                  return (
                    <button
                      key={product.id}
                      className="pos-product-card"
                      id={`product-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={oos}
                      style={{
                        textAlign: 'left', padding: '14px',
                        borderRadius: 14,
                        border: `1.5px solid ${inCart ? '#0d9488' : '#1E2D3D'}`,
                        backgroundColor: inCart ? 'rgba(13,148,136,0.08)' : '#141E2B',
                        cursor: oos ? 'not-allowed' : 'pointer',
                        opacity: oos ? 0.5 : 1,
                        transition: 'all 0.18s', position: 'relative', overflow: 'hidden',
                        animation: 'fadeSlideIn 0.3s ease',
                      }}
                    >
                      {/* Top bar */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                        background: oos ? '#2D3748' : 'linear-gradient(90deg, #0F6E5C, #0d9488)',
                        borderRadius: '14px 14px 0 0',
                      }} />

                      {/* In-cart indicator */}
                      {inCart && (
                        <div style={{
                          position: 'absolute', top: 10, right: 10,
                          background: '#0d9488', color: '#fff', borderRadius: 20,
                          fontSize: 10, fontWeight: 700, padding: '1px 7px',
                        }}>
                          ×{inCart.quantity}
                        </div>
                      )}

                      {/* Icon + price */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 6 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: oos ? '#1E2D3D' : 'rgba(13,148,136,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Package size={16} color={oos ? '#4A5568' : '#0d9488'} />
                        </div>
                        <span style={{
                          fontSize: 14, fontWeight: 800, color: '#5EEAD4',
                          fontFamily: "'Space Mono', monospace",
                        }}>
                          {fmtPrice(product.defaultSellingPrice)}
                        </span>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3, marginBottom: 3 }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#4A5568', marginBottom: 8 }}>
                          {[product.dosageForm, product.strength, product.genericName].filter(Boolean).join(' · ')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                          <StockBadge qty={product.stockOnHand ?? 0} reorder={product.reorderLevel} />
                          {product.requiresPrescription && (
                            <span style={{
                              fontSize: 9, fontWeight: 800, color: '#F59E0B',
                              background: 'rgba(245,158,11,0.15)', borderRadius: 20, padding: '2px 6px',
                            }}>Rx</span>
                          )}
                        </div>
                      </div>

                      {!oos && (
                        <div style={{
                          position: 'absolute', bottom: 10, right: 10,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0.6,
                        }}>
                          <Plus size={11} color="#fff" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* LIST view */}
            {!loadingAll && displayedProducts.length > 0 && viewMode === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                {displayedProducts.map(product => {
                  const oos = !product.stockOnHand || product.stockOnHand <= 0;
                  const inCart = items.find(i => i.productId === product.id);
                  return (
                    <button
                      key={product.id}
                      className="pos-product-card"
                      id={`product-list-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={oos}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 12,
                        border: `1.5px solid ${inCart ? '#0d9488' : '#1E2D3D'}`,
                        backgroundColor: inCart ? 'rgba(13,148,136,0.08)' : '#141E2B',
                        cursor: oos ? 'not-allowed' : 'pointer',
                        opacity: oos ? 0.5 : 1,
                        transition: 'all 0.15s', textAlign: 'left',
                        animation: 'fadeSlideIn 0.25s ease',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: oos ? '#1E2D3D' : 'rgba(13,148,136,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Package size={15} color={oos ? '#4A5568' : '#0d9488'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 2 }}>
                          {product.name}
                          {product.requiresPrescription && (
                            <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, color: '#F59E0B', background: 'rgba(245,158,11,0.15)', borderRadius: 20, padding: '1px 5px' }}>Rx</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#4A5568' }}>
                          {[product.dosageForm, product.strength].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#5EEAD4', fontFamily: "'Space Mono', monospace" }}>
                          {fmtPrice(product.defaultSellingPrice)}
                        </div>
                        <StockBadge qty={product.stockOnHand ?? 0} reorder={product.reorderLevel} />
                      </div>
                      {inCart && (
                        <div style={{
                          background: '#0d9488', color: '#fff', borderRadius: 20,
                          fontSize: 11, fontWeight: 700, padding: '2px 9px', flexShrink: 0,
                        }}>×{inCart.quantity}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            RIGHT — Cart panel
        ══════════════════════════════════════════════ */}
        <div style={{
          width: 340, display: 'flex', flexDirection: 'column',
          backgroundColor: '#0D1620',
          borderLeft: '1px solid #1E2D3D',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
        }}>

          {/* Cart header */}
          <div style={{
            padding: '16px 18px',
            borderBottom: '1px solid #1E2D3D',
            background: items.length > 0
              ? 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)'
              : '#141E2B',
            transition: 'background 0.4s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={17} color={items.length > 0 ? '#fff' : '#4A5568'} />
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: items.length > 0 ? '#fff' : '#64748B',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  Cart {items.length > 0 && (
                    <span style={{
                      marginLeft: 4, background: 'rgba(255,255,255,0.2)',
                      borderRadius: 20, padding: '1px 8px', fontSize: 12,
                    }}>{items.length}</span>
                  )}
                </span>
              </div>
              {items.length > 0 && (
                <button onClick={() => { clearCart(); setLoadedRx(null); }} id="clear-cart-btn" style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', borderRadius: 20,
                  padding: '3px 10px', fontWeight: 600, transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Trash2 size={11} /> Clear
                </button>
              )}
            </div>

            {/* Loaded Rx badge OR Load Rx button */}
            {loadedRx ? (
              <div style={{
                marginTop: 10, padding: '7px 10px', borderRadius: 8,
                background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClipboardList size={13} color="#F59E0B" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>
                    Rx: {(loadedRx.id as string)?.slice(0, 8).toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(245,158,11,0.7)' }}>
                    · {(loadedRx.prescriberName as string)}
                  </span>
                </div>
                <button
                  onClick={() => { setLoadedRx(null); clearCart(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B', padding: 2, display: 'flex' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                id="load-rx-btn"
                onClick={() => setRxModalOpen(true)}
                style={{
                  marginTop: 10, width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1.5px dashed rgba(13,148,136,0.5)', background: 'rgba(13,148,136,0.07)',
                  color: '#5EEAD4', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,148,136,0.15)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d9488'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,148,136,0.07)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(13,148,136,0.5)'; }}
              >
                <FileText size={13} /> Load Prescription (Rx)
              </button>
            )}
          </div>

          {/* Cart items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', gap: 14,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #141E2B, #1E2D3D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 8px rgba(13,148,136,0.06)',
                }}>
                  <ShoppingCart size={26} color="#2D3748" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#4A5568', margin: '0 0 4px', fontWeight: 600 }}>Cart is empty</p>
                  <p style={{ fontSize: 12, color: '#2D3748', margin: 0 }}>Click or tap products to add them</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
                  {['Amoxicillin', 'Paracetamol', 'Ibuprofen'].map(hint => (
                    <button key={hint} onClick={() => handleSearch(hint)} style={{
                      fontSize: 11, color: '#0d9488', background: 'rgba(13,148,136,0.1)',
                      border: '1px solid rgba(13,148,136,0.2)', borderRadius: 20,
                      padding: '4px 12px', cursor: 'pointer', fontWeight: 600,
                    }}>{hint}</button>
                  ))}
                </div>
              </div>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {items.map((item, idx) => (
                  <li key={item.productId} style={{
                    padding: '12px 16px',
                    borderBottom: idx < items.length - 1 ? '1px solid #1A2332' : 'none',
                    animation: 'fadeSlideIn 0.2s ease',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12.5, fontWeight: 600, color: '#CBD5E1',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.productName}
                          {item.requiresPrescription && (
                            <span style={{ marginLeft: 5, fontSize: 9, color: '#F59E0B', background: 'rgba(245,158,11,0.15)', borderRadius: 20, padding: '1px 5px', fontWeight: 700 }}>Rx</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#0d9488', fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
                          {fmtPrice(item.unitPrice)} each
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#2D3748', padding: 4, borderRadius: 6, flexShrink: 0,
                          transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#2D3748'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                      >
                        <X size={13} />
                      </button>
                    </div>

                    {/* Qty controls + line total */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        background: '#141E2B', borderRadius: 8,
                        border: '1px solid #1E2D3D', overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          id={`dec-${item.productId}`}
                          style={{
                            width: 28, height: 28, border: 'none', background: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#4A5568', transition: 'all 0.1s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1E2D3D'; (e.currentTarget as HTMLButtonElement).style.color = '#F87171'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#4A5568'; }}
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{
                          width: 30, textAlign: 'center', fontSize: 13, fontWeight: 700,
                          color: '#E2E8F0', fontFamily: "'Space Mono', monospace",
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stockOnHand}
                          id={`inc-${item.productId}`}
                          style={{
                            width: 28, height: 28, border: 'none', background: 'none',
                            cursor: item.quantity >= item.stockOnHand ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: item.quantity >= item.stockOnHand ? '#1E2D3D' : '#4A5568',
                            transition: 'all 0.1s',
                          }}
                          onMouseEnter={e => { if (item.quantity < item.stockOnHand) { (e.currentTarget as HTMLButtonElement).style.background = '#1E2D3D'; (e.currentTarget as HTMLButtonElement).style.color = '#5EEAD4'; } }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = item.quantity >= item.stockOnHand ? '#1E2D3D' : '#4A5568'; }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 800, color: '#5EEAD4',
                        fontFamily: "'Space Mono', monospace",
                      }}>
                        {fmtPrice(item.lineTotal)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Totals + Checkout */}
          {items.length > 0 && (
            <div style={{ borderTop: '1px solid #1E2D3D', padding: '14px 16px 18px', background: '#0D1620' }}>
              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                {[
                  { label: 'Subtotal', value: fmtPrice(subtotal()) },
                  { label: 'Tax (15%)', value: fmtPrice(tax) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#4A5568' }}>
                    <span>{row.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", color: '#64748B' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: '#1E2D3D', margin: '2px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#E2E8F0' }}>Total</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", color: '#5EEAD4' }}>{fmtPrice(total)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <button
                onClick={() => setCheckoutOpen(true)}
                id="checkout-btn"
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 6px 24px rgba(13,148,136,0.45)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: 'all 0.15s', letterSpacing: '-0.2px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 32px rgba(13,148,136,0.6)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(13,148,136,0.45)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <Zap size={16} /> Checkout · {fmtPrice(total)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          CHECKOUT MODAL
      ══════════════════════════════════════════════ */}
      {checkoutOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setCheckoutOpen(false)}>
          <div style={{
            backgroundColor: '#0D1620', borderRadius: 20, width: '100%', maxWidth: 860,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden', animation: 'scaleIn 0.22s ease',
            border: '1px solid #1E2D3D',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh',
          }} onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #1E2D3D',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
            }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Complete Sale
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '2px 0 0' }}>
                  {items.length} item{items.length !== 1 ? 's' : ''} · {fmtPrice(total)} due
                </p>
              </div>
              <button onClick={() => setCheckoutOpen(false)} style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8, cursor: 'pointer', padding: 6,
                display: 'flex', alignItems: 'center', color: '#fff',
              }}>
                <X size={16} />
              </button>
            </div>

            {/* Two-column body */}
            <div style={{ display: 'flex', overflow: 'auto', flex: 1 }}>

              {/* LEFT: Payment options + discount + note */}
              <div style={{ flex: 1, padding: '20px 24px', borderRight: '1px solid #1E2D3D', overflowY: 'auto', minWidth: 0 }}>

                {/* Rx badge — shows whether a prescription is linked */}
                {loadedRx ? (
                  <div style={{
                    padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                    backgroundColor: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)',
                    fontSize: 12, color: '#5EEAD4', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <ClipboardList size={15} />
                    Prescription linked · Rx {(loadedRx.id as string)?.slice(0, 8).toUpperCase()} · {loadedRx.prescriberName as string}
                  </div>
                ) : items.some(i => i.requiresPrescription) ? (
                  <div style={{
                    padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                    backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                    fontSize: 12, color: '#F59E0B', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <ReceiptText size={15} /> Prescription items present — verify before completing sale.
                  </div>
                ) : null}

                {/* Payment method */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 10, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {PaymentOptions.map(opt => {
                      const active = paymentMethod === opt.value;
                      return (
                        <button
                          key={opt.value}
                          className="payment-opt"
                          onClick={() => setPaymentMethod(opt.value as typeof paymentMethod)}
                          style={{
                            padding: '12px', borderRadius: 12, cursor: 'pointer',
                            border: `2px solid ${active ? opt.color : '#1E2D3D'}`,
                            background: active ? `${opt.color}18` : '#141E2B',
                            color: active ? opt.color : '#4A5568',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                            transition: 'all 0.15s',
                          }}
                        >
                          <opt.Icon size={20} />
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Discount */}
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="discount-amount" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <Tag size={12} /> Discount (ETB)
                  </label>
                  <input
                    id="discount-amount"
                    type="number" min={0} max={subtotal()}
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    style={{ ...inputS }}
                    onFocus={e => { e.target.style.borderColor = '#0d9488'; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#2D3748'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Note */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <User size={12} /> Customer Note
                  </label>
                  <textarea
                    value={customerNote}
                    onChange={e => setCustomerNote(e.target.value)}
                    placeholder="Optional note (allergy, customer name…)"
                    rows={2}
                    style={{
                      ...inputS, resize: 'none', lineHeight: 1.5,
                    }}
                    onFocus={e => { e.target.style.borderColor = '#0d9488'; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = '#2D3748'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Summary */}
                <div style={{ background: '#141E2B', borderRadius: 12, padding: '14px 16px', border: '1px solid #1E2D3D' }}>
                  {[
                    { label: 'Subtotal', value: fmtPrice(subtotal()), color: '#64748B' },
                    { label: 'Tax (15%)', value: fmtPrice(tax), color: '#64748B' },
                    ...(discount > 0 ? [{ label: 'Discount', value: `− ${fmtPrice(discount)}`, color: '#F59E0B' }] : []),
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: row.color, marginBottom: 6 }}>
                      <span>{row.label}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace" }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: '#1E2D3D', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800 }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#E2E8F0' }}>Total Due</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", color: '#5EEAD4' }}>{fmtPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Cash numpad + change calculator */}
              <div style={{ width: 280, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <Banknote size={12} /> Cash Tendered
                  </label>
                  <div style={{
                    background: '#141E2B', border: '2px solid #1E2D3D', borderRadius: 12,
                    padding: '12px 16px', marginBottom: 12, textAlign: 'right',
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 2 }}>ETB</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: cashTendered ? '#E2E8F0' : '#2D3748' }}>
                      {cashTendered || '0.00'}
                    </div>
                  </div>

                  {/* Quick amounts */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {[Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100].filter((v, i, arr) => arr.indexOf(v) === i && v >= total).slice(0, 3).map(amt => (
                      <button key={amt} onClick={() => setCashTendered(String(amt))} style={{
                        flex: 1, padding: '6px 4px', borderRadius: 8, border: '1px solid #1E2D3D',
                        background: '#141E2B', color: '#5EEAD4', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Space Mono', monospace",
                        transition: 'all 0.12s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,148,136,0.15)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d9488'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#141E2B'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1E2D3D'; }}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>

                  {/* Numpad */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {numpadKeys.map(key => (
                      <button
                        key={key}
                        className="numpad-key"
                        onClick={() => handleNumpad(key)}
                        style={{
                          padding: '14px 0', borderRadius: 10, border: '1px solid #1E2D3D',
                          background: '#141E2B', color: '#CBD5E1',
                          fontSize: 16, fontWeight: 700, cursor: 'pointer',
                          fontFamily: "'Space Mono', monospace",
                          transition: 'all 0.1s',
                        }}
                      >{key}</button>
                    ))}
                    <button
                      className="numpad-key"
                      onClick={() => setCashTendered(prev => prev.slice(0, -1) || '')}
                      style={{
                        padding: '14px 0', borderRadius: 10, border: '1px solid #1E2D3D',
                        background: '#141E2B', color: '#F87171',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.1s', gridColumn: 'span 3',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <X size={13} /> Backspace
                    </button>
                  </div>
                </div>

                {/* Change display */}
                <div style={{
                  background: change > 0 ? 'rgba(5,150,105,0.12)' : '#141E2B',
                  border: `1px solid ${change > 0 ? '#059669' : '#1E2D3D'}`,
                  borderRadius: 12, padding: '14px 16px', textAlign: 'center',
                  transition: 'all 0.3s',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: change > 0 ? '#059669' : '#4A5568', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
                    Change Due
                  </div>
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    color: change > 0 ? '#34D399' : '#2D3748',
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {fmtPrice(change)}
                  </div>
                  {tendered > 0 && tendered < total && (
                    <div style={{ fontSize: 11, color: '#F87171', marginTop: 4 }}>
                      Short by {fmtPrice(total - tendered)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #1E2D3D', display: 'flex', gap: 10, background: '#0A1018' }}>
              <button onClick={() => setCheckoutOpen(false)} disabled={completing} style={{
                flex: 1, padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                border: '1.5px solid #1E2D3D', background: '#141E2B', color: '#64748B',
                fontSize: 14, fontWeight: 600,
              }}>Cancel</button>
              <button
                onClick={handleCompleteSale}
                disabled={completing || (paymentMethod === 'CASH' && !!cashTendered && tendered < total)}
                id="complete-sale-btn"
                style={{
                  flex: 2, padding: '11px 16px', borderRadius: 10,
                  cursor: completing ? 'not-allowed' : 'pointer',
                  border: 'none',
                  background: completing ? '#1E2D3D' : 'linear-gradient(135deg, #0F6E5C, #0d9488)',
                  color: completing ? '#4A5568' : '#fff', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: completing ? 'none' : '0 4px 16px rgba(13,148,136,0.4)',
                  fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.15s',
                }}
              >
                {completing
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                  : <><CheckCircle size={15} /> Complete Sale · {fmtPrice(total)}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          RECEIPT MODAL
      ══════════════════════════════════════════════ */}
      {lastSale && receiptOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setReceiptOpen(false)}>
          <div id="receipt-print" style={{
            backgroundColor: '#fff', borderRadius: 24, width: '100%', maxWidth: 400,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden', animation: 'scaleIn 0.25s ease',
          }} onClick={e => e.stopPropagation()}>

            {/* Success header */}
            <div style={{
              padding: '30px 24px 22px', textAlign: 'center',
              background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Background circles */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                boxShadow: '0 0 0 10px rgba(255,255,255,0.08)',
              }}>
                <CheckCircle size={28} color="#fff" />
              </div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 6px', fontFamily: "'Space Grotesk', sans-serif" }}>
                Sale Complete!
              </h2>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.15)', borderRadius: 20,
                padding: '4px 12px',
              }}>
                <Hash size={12} color="rgba(255,255,255,0.8)" />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>
                  {lastSale.saleNumber as string}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, margin: '8px 0 0' }}>
                {format(new Date(lastSale.createdAt as string), 'dd MMM yyyy · HH:mm')}
              </p>
            </div>

            {/* Receipt body */}
            <div style={{ padding: '18px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Items Purchased</div>
                {((lastSale.items as Record<string, unknown>[]) || []).map(item => (
                  <div key={item.id as string} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px dashed #EEF2F0',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1117' }}>
                        {(item.product as Record<string, unknown>)?.name as string}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        {item.quantity as number} × ETB {(item.unitPrice as number).toFixed(2)}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0D1117', fontFamily: "'Space Mono', monospace" }}>
                      ETB {(item.lineTotal as number).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ backgroundColor: '#F8FAF9', borderRadius: 12, padding: '12px 14px', border: '1px solid #EEF2F0' }}>
                {[
                  { label: 'Subtotal', value: `ETB ${(lastSale.subtotal as number)?.toFixed(2)}` },
                  { label: 'Tax', value: `ETB ${(lastSale.taxAmount as number)?.toFixed(2)}` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 5 }}>
                    <span>{r.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: '#EEF2F0', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0D1117' }}>
                  <span>Total Paid</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>
                    ETB {(lastSale.totalAmount as number)?.toFixed(2)}
                  </span>
                </div>
                <div style={{
                  marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 11, color: '#94A3B8',
                }}>
                  <CreditCard size={11} />
                  Paid via {lastSale.paymentMethod as string}
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '14px 0 0', fontSize: 12, color: '#94A3B8' }}>
                Thank you for choosing <strong style={{ color: '#0F6E5C' }}>PharmaSys</strong> 🙏
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '0 24px 22px', display: 'flex', gap: 10 }}>
              <button onClick={() => setReceiptOpen(false)} style={{
                flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                border: '1.5px solid #EEF2F0', background: '#fff', color: '#64748B',
                fontSize: 13, fontWeight: 600,
              }}>Close</button>
              <button onClick={() => window.print()} style={{
                flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                border: 'none', background: 'linear-gradient(135deg, #0F6E5C, #0d9488)', color: '#fff',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(15,110,92,0.35)',
              }}>
                <Printer size={13} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          LOAD PRESCRIPTION MODAL
      ══════════════════════════════════════════════ */}
      {rxModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => { setRxModalOpen(false); setRxSearch(''); setRxResults([]); }}>
          <div style={{
            backgroundColor: '#0D1620', borderRadius: 20, width: '100%', maxWidth: 540,
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)', border: '1px solid #1E2D3D',
            animation: 'scaleIn 0.2s ease', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{
              padding: '18px 22px', borderBottom: '1px solid #1E2D3D',
              background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClipboardList size={18} color="#fff" />
                <div>
                  <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Load Prescription
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, margin: '2px 0 0' }}>
                    Search pending prescriptions to auto-fill the cart
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setRxModalOpen(false); setRxSearch(''); setRxResults([]); }}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, display: 'flex', color: '#fff' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Search input */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #1A2332' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#4A5568" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                {rxLoading && <Loader2 size={14} color="#0d9488" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />}
                <input
                  id="rx-search-input"
                  autoFocus
                  placeholder="Search by prescriber name or license number…"
                  value={rxSearch}
                  onChange={e => handleRxSearch(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid #1E2D3D', borderRadius: 10,
                    padding: '10px 14px 10px 38px', fontSize: 13, color: '#E2E8F0',
                    backgroundColor: '#141E2B', outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0d9488'; }}
                  onBlur={e => { e.target.style.borderColor = '#1E2D3D'; }}
                />
              </div>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {!rxSearch.trim() ? (
                <div style={{ padding: '40px 22px', textAlign: 'center', color: '#4A5568' }}>
                  <FileText size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Type a prescriber name to search pending prescriptions</p>
                </div>
              ) : rxResults.length === 0 && !rxLoading ? (
                <div style={{ padding: '40px 22px', textAlign: 'center', color: '#4A5568' }}>
                  <p style={{ fontSize: 13, margin: 0 }}>No pending prescriptions found for "{rxSearch}"</p>
                </div>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {rxResults.map((rx, idx) => (
                    <li key={rx.id as string} style={{ borderBottom: idx < rxResults.length - 1 ? '1px solid #1A2332' : 'none' }}>
                      <button
                        onClick={() => handleLoadRx(rx)}
                        disabled={rxFilling}
                        style={{
                          width: '100%', padding: '14px 22px', background: 'none', border: 'none',
                          cursor: rxFilling ? 'wait' : 'pointer', textAlign: 'left',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#141E2B'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                            background: 'linear-gradient(135deg, rgba(15,110,92,0.2), rgba(13,148,136,0.2))',
                            border: '1px solid rgba(13,148,136,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <ClipboardList size={16} color="#0d9488" />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 2 }}>
                              {rx.prescriberName as string}
                            </div>
                            <div style={{ fontSize: 11, color: '#4A5568', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                              <span>Rx {(rx.id as string)?.slice(0, 8).toUpperCase()}</span>
                              {Boolean(rx.prescriberLicenseNo) && <span>· License: {rx.prescriberLicenseNo as string}</span>}
                              <span>· {((rx.items as unknown[])?.length ?? 0)} medication(s)</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          <div style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                            background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)',
                            marginBottom: 4,
                          }}>
                            PENDING
                          </div>
                          {rxFilling ? (
                            <Loader2 size={14} color="#0d9488" style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <div style={{ fontSize: 11, color: '#0d9488', fontWeight: 600 }}>Load →</div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

