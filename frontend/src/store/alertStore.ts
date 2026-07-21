import { create } from 'zustand';

interface AlertState {
  lowStockCount: number;
  expiringCount: number;
  lowStockItems: unknown[];
  expiringItems: unknown[];
  setLowStock: (items: unknown[]) => void;
  setExpiring: (items: unknown[]) => void;
}

export const useAlertStore = create<AlertState>(set => ({
  lowStockCount: 0,
  expiringCount: 0,
  lowStockItems: [],
  expiringItems: [],
  setLowStock: (items) => set({ lowStockItems: items, lowStockCount: items.length }),
  setExpiring: (items) => set({ expiringItems: items, expiringCount: items.length }),
}));
