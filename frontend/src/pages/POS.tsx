import React, { useState, useRef, useCallback } from 'react';
import {
  Search, Plus, Minus, X, ShoppingCart, CreditCard,
  Printer, Package, CheckCircle, Loader2
} from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { productsApi } from '../api/products';
import type { Product } from '../api/products';
import { salesApi } from '../api/sales';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PaymentOptions = [
  { value: 'CASH',         label: 'Cash',         icon: '💵' },
  { value: 'CARD',         label: 'Card',          icon: '💳' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money',  icon: '📱' },
  { value: 'INSURANCE',    label: 'Insurance',     icon: '🏥' },
];

/* ─── small helpers ─── */
const StockBadge: React.FC<{ qty: number; reorder: number }> = ({ qty, reorder }) => {
  const color = qty === 0 ? '#C0392B' : qty <= reorder ? '#C17A1F' : '#0F6E5C';
  const bg    = qty === 0 ? 'rgba(192,57,43,0.1)' : qty <= reorder ? 'rgba(193,122,31,0.1)' : 'rgba(15,110,92,0.1)';
  const label = qty === 0 ? 'Out of stock' : `${qty} in stock`;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: bg, color }}>
      {label}
    </span>
  );
};

export const POS: React.FC = () => {
  const { items, addItem, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();
  const [search, setSearch]           = useState('');
  const [results, setResults]         = useState<Product[]>([]);
  const [searching, setSearching]     = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastSale, setLastSale]       = useState<Record<string, unknown> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY' | 'INSURANCE'>('CASH');
  const [discount, setDiscount]       = useState(0);
  const [completing, setCompleting]   = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    if (!value.trim()) { setResults([]); return; }
    searchRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await productsApi.list({ search: value, pageSize: '8' });
        setResults(data.data || []);
      } catch { setResults([]); } finally { setSearching(false); }
    }, 300);
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!product.stockOnHand || product.stockOnHand <= 0) {
      toast.error('This product is out of stock');
      return;
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
    setSearch('');
    setResults([]);
    toast.success(`${product.name} added to cart`);
  };

  const tax   = subtotal() * 0.15;
  const total = Math.max(0, subtotal() + tax - discount);

  const handleCompleteSale = async () => {
    setCompleting(true);
    try {
      const sale = await salesApi.create({
        paymentMethod,
        discountAmount: discount,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
        })),
      });
      setLastSale(sale);
      clearCart();
      setCheckoutOpen(false);
      setReceiptOpen(true);
      setDiscount(0);
      toast.success('Sale completed successfully!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to complete sale');
    } finally { setCompleting(false); }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F7F6' }}>
      <TopBar title="Point of Sale" subtitle="Scan or search products to add to cart" />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ══════════════════════════════
            LEFT — Product search area
        ══════════════════════════════ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #E8EDE9', overflow: 'hidden',
          backgroundColor: '#F5F7F6',
        }}>

          {/* Search bar */}
          <div style={{ padding: '16px 20px', backgroundColor: '#fff', borderBottom: '1px solid #E8EDE9' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94A3B8" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
              {searching && (
                <Loader2 size={15} color="#0F6E5C" style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  animation: 'spin 1s linear infinite',
                }} />
              )}
              <input
                id="pos-search"
                type="text"
                placeholder="Search by product name or scan barcode…"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 40px',
                  borderRadius: 12, border: '1.5px solid #DDE4E2',
                  fontSize: 14, color: '#0D1117', backgroundColor: '#F8FAF9',
                  outline: 'none', transition: 'all 0.15s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#0F6E5C';
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#DDE4E2';
                  e.target.style.backgroundColor = '#F8FAF9';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Results / empty state */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

            {/* Empty state */}
            {!searching && results.length === 0 && !search && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EEF2F0, #DDE4E2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Search size={30} color="#94A3B8" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#4A5568', margin: '0 0 4px' }}>Search for products</p>
                  <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Type a name or scan a barcode to add items to cart</p>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['Amoxicillin', 'Paracetamol', 'Vitamin C'].map(hint => (
                    <button key={hint} onClick={() => handleSearch(hint)} style={{
                      fontSize: 12, color: '#0F6E5C', background: 'rgba(15,110,92,0.08)',
                      border: '1px solid rgba(15,110,92,0.2)', borderRadius: 20,
                      padding: '5px 14px', cursor: 'pointer', fontWeight: 500,
                    }}>
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!searching && results.length === 0 && search && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48, gap: 10 }}>
                <Package size={40} color="#CBD5E1" />
                <p style={{ fontSize: 14, color: '#64748B', margin: 0, fontWeight: 500 }}>No products found</p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>No results for "<strong>{search}</strong>"</p>
              </div>
            )}

            {/* Product grid */}
            {results.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {results.map(product => {
                  const outOfStock = !product.stockOnHand || product.stockOnHand <= 0;
                  return (
                    <button
                      key={product.id}
                      id={`product-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={outOfStock}
                      style={{
                        textAlign: 'left', padding: '16px', borderRadius: 14,
                        border: '1.5px solid #E8EDE9', backgroundColor: '#fff',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        opacity: outOfStock ? 0.6 : 1,
                        transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        if (!outOfStock) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F6E5C';
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(15,110,92,0.15)';
                          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8EDE9';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Top accent */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                        background: outOfStock ? '#E2E8F0' : 'linear-gradient(90deg, #0F6E5C, #0d9488)',
                        borderRadius: '14px 14px 0 0',
                      }} />

                      {/* Icon + price */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: outOfStock ? '#F1F5F9' : 'rgba(15,110,92,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Package size={17} color={outOfStock ? '#94A3B8' : '#0F6E5C'} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: 15, fontWeight: 700, color: '#0F6E5C',
                            fontFamily: "'Space Mono', monospace", lineHeight: 1,
                          }}>
                            ETB {product.defaultSellingPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0D1117', lineHeight: 1.3, marginBottom: 3 }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>
                          {[product.dosageForm, product.strength].filter(Boolean).join(' · ')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <StockBadge qty={product.stockOnHand ?? 0} reorder={product.reorderLevel} />
                          {product.requiresPrescription && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: '#C17A1F',
                              background: 'rgba(193,122,31,0.1)', borderRadius: 20, padding: '2px 7px',
                            }}>Rx</span>
                          )}
                        </div>
                      </div>

                      {/* Add indicator */}
                      {!outOfStock && (
                        <div style={{
                          position: 'absolute', bottom: 12, right: 12,
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0.7,
                        }}>
                          <Plus size={12} color="#fff" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT — Cart panel
        ══════════════════════════════ */}
        <div style={{
          width: 320, display: 'flex', flexDirection: 'column',
          backgroundColor: '#fff', borderLeft: '1px solid #E8EDE9',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.04)',
        }}>
          {/* Cart header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E8EDE9',
            background: items.length > 0
              ? 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)'
              : '#fff',
            transition: 'background 0.3s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={17} color={items.length > 0 ? '#fff' : '#4A5568'} />
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: items.length > 0 ? '#fff' : '#0D1117',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  Cart {items.length > 0 && `(${items.length})`}
                </span>
              </div>
              {items.length > 0 && (
                <button onClick={clearCart} id="clear-cart-btn" style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer', borderRadius: 20,
                  padding: '3px 10px', fontWeight: 500, transition: 'all 0.15s',
                }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShoppingCart size={24} color="#86EFAC" />
                </div>
                <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, textAlign: 'center' }}>
                  Your cart is empty.<br />Search for products on the left.
                </p>
              </div>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {items.map((item, idx) => (
                  <li key={item.productId} style={{
                    padding: '14px 18px',
                    borderBottom: idx < items.length - 1 ? '1px solid #F0F4F2' : 'none',
                    transition: 'background 0.1s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1117', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.productName}
                        </div>
                        <div style={{ fontSize: 11, color: '#0F6E5C', fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
                          ETB {item.unitPrice.toFixed(2)} each
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.productName}`}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#CBD5E1', padding: 4, borderRadius: 6, flexShrink: 0,
                          transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C0392B'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,57,43,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#CBD5E1'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Qty controls + line total */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        background: '#F5F7F6', borderRadius: 10, overflow: 'hidden',
                        border: '1px solid #E8EDE9',
                      }}>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          id={`dec-${item.productId}`}
                          style={{
                            width: 30, height: 30, border: 'none', background: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#4A5568', transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#E8EDE9'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{
                          width: 32, textAlign: 'center', fontSize: 13, fontWeight: 700,
                          color: '#0D1117', fontFamily: "'Space Mono', monospace",
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stockOnHand}
                          id={`inc-${item.productId}`}
                          style={{
                            width: 30, height: 30, border: 'none', background: 'none',
                            cursor: item.quantity >= item.stockOnHand ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: item.quantity >= item.stockOnHand ? '#CBD5E1' : '#4A5568',
                            transition: 'background 0.1s', opacity: item.quantity >= item.stockOnHand ? 0.5 : 1,
                          }}
                          onMouseEnter={e => { if (item.quantity < item.stockOnHand) (e.currentTarget as HTMLButtonElement).style.background = '#E8EDE9'; }}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0D1117', fontFamily: "'Space Mono', monospace" }}>
                        ETB {item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Totals + Checkout */}
          {items.length > 0 && (
            <div style={{ borderTop: '1px solid #E8EDE9', padding: '16px 18px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Subtotal', value: `ETB ${subtotal().toFixed(2)}` },
                  { label: 'Tax (15%)', value: `ETB ${tax.toFixed(2)}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B' }}>
                    <span>{row.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, backgroundColor: '#E8EDE9', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, color: '#0D1117' }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Total</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>ETB {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setCheckoutOpen(true)}
                id="checkout-btn"
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 6px 20px rgba(15,110,92,0.4)',
                  fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.2px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(15,110,92,0.55)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(15,110,92,0.4)'}
              >
                <CreditCard size={17} />
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════
          CHECKOUT MODAL
      ══════════════════════════════ */}
      {checkoutOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setCheckoutOpen(false)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden', animation: 'slideUp 0.2s ease',
          }} onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #E8EDE9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
            }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Complete Sale
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '2px 0 0' }}>
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button onClick={() => setCheckoutOpen(false)} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
                cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: '#fff',
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Payment method */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {PaymentOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPaymentMethod(opt.value as typeof paymentMethod)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        border: paymentMethod === opt.value ? '2px solid #0F6E5C' : '1.5px solid #E8EDE9',
                        background: paymentMethod === opt.value ? 'rgba(15,110,92,0.08)' : '#F8FAF9',
                        fontSize: 13, fontWeight: 600,
                        color: paymentMethod === opt.value ? '#0F6E5C' : '#4A5568',
                        display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div>
                <label htmlFor="discount-amount" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Discount (ETB)
                </label>
                <input
                  id="discount-amount"
                  type="number"
                  min={0}
                  max={subtotal()}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid #E8EDE9', borderRadius: 10,
                    padding: '10px 14px', fontSize: 14, color: '#0D1117',
                    backgroundColor: '#F8FAF9', outline: 'none', transition: 'all 0.15s',
                    fontFamily: "'Space Mono', monospace",
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; e.target.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8EDE9'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F8FAF9'; }}
                />
              </div>

              {/* Summary */}
              <div style={{ backgroundColor: '#F8FAF9', borderRadius: 12, padding: '14px 16px', border: '1px solid #E8EDE9' }}>
                {[
                  { label: 'Subtotal', value: `ETB ${subtotal().toFixed(2)}`, color: '#4A5568' },
                  { label: 'Tax (15%)', value: `ETB ${tax.toFixed(2)}`, color: '#4A5568' },
                  ...(discount > 0 ? [{ label: 'Discount', value: `− ETB ${discount.toFixed(2)}`, color: '#C17A1F' }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: row.color, marginBottom: 6 }}>
                    <span>{row.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: '#E8EDE9', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0D1117' }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Total Due</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>ETB {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={() => setCheckoutOpen(false)} disabled={completing} style={{
                flex: 1, padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568',
                fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
              }}>
                Cancel
              </button>
              <button onClick={handleCompleteSale} disabled={completing} id="complete-sale-btn" style={{
                flex: 2, padding: '11px 16px', borderRadius: 10, cursor: completing ? 'not-allowed' : 'pointer',
                border: 'none', background: completing ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C, #0d9488)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: completing ? 'none' : '0 4px 14px rgba(15,110,92,0.35)',
                fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.15s',
              }}>
                {completing ? <><Loader2 size={15} className="animate-spin" /> Processing…</> : <><CheckCircle size={15} /> Complete Sale</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          RECEIPT MODAL
      ══════════════════════════════ */}
      {lastSale && receiptOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setReceiptOpen(false)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 380,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>

            {/* Receipt success header */}
            <div style={{
              padding: '28px 24px 20px', textAlign: 'center',
              background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <CheckCircle size={28} color="#fff" />
              </div>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 4px', fontFamily: "'Space Grotesk', sans-serif" }}>
                Sale Complete!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0, fontFamily: "'Space Mono', monospace" }}>
                {lastSale.saleNumber as string}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: '4px 0 0' }}>
                {format(new Date(lastSale.createdAt as string), 'dd MMM yyyy · HH:mm')}
              </p>
            </div>

            {/* Receipt body */}
            <div style={{ padding: '16px 24px' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 8 }}>Items</div>
                {((lastSale.items as Record<string, unknown>[]) || []).map(item => (
                  <div key={item.id as string} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px dashed #F0F4F2',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1117' }}>
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

              <div style={{ backgroundColor: '#F8FAF9', borderRadius: 10, padding: '12px 14px', border: '1px solid #E8EDE9' }}>
                {[
                  { label: 'Subtotal', value: `ETB ${(lastSale.subtotal as number)?.toFixed(2)}` },
                  { label: 'Tax', value: `ETB ${(lastSale.taxAmount as number)?.toFixed(2)}` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                    <span>{r.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: '#E8EDE9', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#0D1117' }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>
                    ETB {(lastSale.totalAmount as number)?.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                  Paid via {lastSale.paymentMethod as string}
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '14px 0 0', fontSize: 12, color: '#94A3B8' }}>
                Thank you for your visit! 🙏
              </div>
            </div>

            {/* Receipt footer */}
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={() => setReceiptOpen(false)} style={{
                flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                border: '1.5px solid #E8EDE9', background: '#fff', color: '#4A5568',
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              }}>
                Close
              </button>
              <button onClick={() => window.print()} style={{
                flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                border: 'none', background: '#0F6E5C', color: '#fff',
                fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
              }}>
                <Printer size={13} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
