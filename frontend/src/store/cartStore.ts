import { create } from 'zustand';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  requiresPrescription: boolean;
  isControlledSubstance: boolean;
  stockOnHand: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'lineTotal'>) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find(i => i.productId === item.productId);
    if (existing) {
      set(state => ({
        items: state.items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity, lineTotal: (i.quantity + item.quantity) * i.unitPrice * (1 - i.discount) }
            : i
        ),
      }));
    } else {
      const lineTotal = item.quantity * item.unitPrice * (1 - item.discount);
      set(state => ({ items: [...state.items, { ...item, lineTotal }] }));
    }
  },
  updateQuantity: (productId, quantity) => {
    set(state => ({
      items: state.items.map(i =>
        i.productId === productId
          ? { ...i, quantity, lineTotal: quantity * i.unitPrice * (1 - i.discount) }
          : i
      ).filter(i => i.quantity > 0),
    }));
  },
  removeItem: (productId) =>
    set(state => ({ items: state.items.filter(i => i.productId !== productId) })),
  clearCart: () => set({ items: [] }),
  subtotal: () => get().items.reduce((s, i) => s + i.lineTotal, 0),
}));
