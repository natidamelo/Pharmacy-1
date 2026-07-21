import React, { useState, useRef, useCallback } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Printer } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { productsApi } from '../api/products';
import type { Product } from '../api/products';
import { salesApi } from '../api/sales';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PaymentOptions = [
  { value: 'CASH', label: '💵 Cash' },
  { value: 'CARD', label: '💳 Card' },
  { value: 'MOBILE_MONEY', label: '📱 Mobile Money' },
  { value: 'INSURANCE', label: '🏥 Insurance' },
];

export const POS: React.FC = () => {
  const { items, addItem, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Record<string, unknown> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY' | 'INSURANCE'>('CASH');
  const [discount, setDiscount] = useState(0);
  const [completing, setCompleting] = useState(false);
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
    toast.success(`Added ${product.name} to cart`);
  };

  const tax = subtotal() * 0.15;
  const total = subtotal() + tax - discount;

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
      toast.success('Sale completed');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to complete sale');
    } finally { setCompleting(false); }
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar title="Point of Sale" />
      <div className="flex flex-1 overflow-hidden">

        {/* Product search panel */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <input
                id="pos-search"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Search by name or scan barcode..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {searching && <div className="text-center text-sm text-ink-subtle py-8">Searching...</div>}
            {!searching && results.length === 0 && search && (
              <div className="text-center text-sm text-ink-subtle py-8">No products found for "{search}"</div>
            )}
            {!searching && results.length === 0 && !search && (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto mb-4" style={{ color: '#cbd5e1' }} />
                <p className="text-sm text-ink-muted">Your cart is empty</p>
                <p className="text-xs text-ink-subtle mt-1">Search or scan a product to add it</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className="text-left p-4 bg-white rounded-xl border border-border hover:border-primary hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  id={`product-${product.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-ink truncate">{product.name}</div>
                      <div className="text-xs text-ink-subtle">{product.dosageForm} · {product.strength}</div>
                      {product.requiresPrescription && <Badge variant="warning">Rx required</Badge>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display font-bold text-primary tabular">ETB {product.defaultSellingPrice.toFixed(2)}</div>
                      <div className={`text-xs tabular ${!product.stockOnHand || product.stockOnHand === 0 ? 'text-red-500' : product.stockOnHand <= product.reorderLevel ? 'text-amber-500' : 'text-ink-subtle'}`}>
                        {product.stockOnHand ?? 0} in stock
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart panel */}
        <div className="w-80 xl:w-96 flex flex-col bg-white">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink">Cart ({items.length})</h2>
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-500 hover:underline" id="clear-cart-btn">Clear</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingCart size={32} className="mx-auto mb-3" style={{ color: '#cbd5e1' }} />
                <p className="text-xs text-ink-subtle">Add products to cart</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map(item => (
                  <li key={item.productId} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink truncate">{item.productName}</div>
                        <div className="tabular text-xs text-primary mt-0.5">ETB {item.unitPrice.toFixed(2)} ea</div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-ink-subtle hover:text-red-500 transition-colors p-1"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-ink-muted hover:bg-surface-hover transition-colors"
                          id={`dec-${item.productId}`}
                        ><Minus size={12} /></button>
                        <span className="w-8 text-center tabular text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stockOnHand}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-ink-muted hover:bg-surface-hover disabled:opacity-40 transition-colors"
                          id={`inc-${item.productId}`}
                        ><Plus size={12} /></button>
                      </div>
                      <span className="tabular font-semibold text-sm">ETB {item.lineTotal.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-border p-4 space-y-2">
              <div className="flex justify-between text-sm text-ink-muted">
                <span>Subtotal</span><span className="tabular">ETB {subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-muted">
                <span>Tax (15%)</span><span className="tabular">ETB {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-ink text-base pt-2 border-t border-border">
                <span>Total</span><span className="tabular">ETB {total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)} id="checkout-btn">
                <CreditCard size={16} className="mr-2" /> Checkout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Complete sale"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCheckoutOpen(false)} disabled={completing}>Cancel</Button>
            <Button onClick={handleCompleteSale} loading={completing} id="complete-sale-btn">Complete sale</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="payment-method" className="text-sm font-medium text-ink">Payment method</label>
            <select
              id="payment-method"
              className="w-full rounded-lg border border-border text-sm px-3 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as typeof paymentMethod)}
            >
              {PaymentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="discount-amount" className="text-sm font-medium text-ink">Discount (ETB)</label>
            <input
              id="discount-amount"
              type="number"
              min={0}
              max={subtotal()}
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
              className="w-full rounded-lg border border-border text-sm px-3 py-2.5 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span className="tabular">ETB {subtotal().toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Tax (15%)</span><span className="tabular">ETB {tax.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sm text-amber-600"><span>Discount</span><span className="tabular">- ETB {discount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
              <span>Total due</span><span className="tabular">ETB {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      {lastSale && (
        <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Sale receipt" size="md"
          footer={<Button variant="secondary" onClick={() => window.print()}><Printer size={14} className="mr-1" />Print receipt</Button>}
        >
          <div className="space-y-3">
            <div className="text-center border-b border-border pb-3">
              <div className="font-display font-bold text-ink">PharmaSys</div>
              <div className="font-mono text-xs text-ink-subtle mt-1">{lastSale.saleNumber as string}</div>
              <div className="text-xs text-ink-subtle">{format(new Date(lastSale.createdAt as string), 'dd MMM yyyy HH:mm')}</div>
            </div>
            <ul className="divide-y divide-border">
              {((lastSale.items as Record<string, unknown>[]) || []).map((item) => (
                <li key={item.id as string} className="py-2 flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{(item.product as Record<string, unknown>)?.name as string}</div>
                    <div className="text-xs text-ink-subtle">{item.quantity as number} × ETB {(item.unitPrice as number).toFixed(2)}</div>
                  </div>
                  <span className="tabular font-medium">ETB {(item.lineTotal as number).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-2 space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="tabular">ETB {(lastSale.subtotal as number)?.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>Tax</span><span className="tabular">ETB {(lastSale.taxAmount as number)?.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span className="tabular">ETB {(lastSale.totalAmount as number)?.toFixed(2)}</span></div>
              <div className="text-xs text-ink-subtle pt-1">Payment: {lastSale.paymentMethod as string}</div>
            </div>
            <div className="text-center text-xs text-ink-subtle border-t border-border pt-2">Thank you for your visit!</div>
          </div>
        </Modal>
      )}
    </div>
  );
};
