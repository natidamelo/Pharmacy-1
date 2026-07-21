import { Server as SocketServer } from 'socket.io';
import prisma from '../lib/prisma';

let io: SocketServer | null = null;

export const initAlertEngine = (socketServer: SocketServer): void => {
  io = socketServer;
};

export interface LowStockAlert {
  productId: string;
  productName: string;
  stockOnHand: number;
  reorderLevel: number;
}

export interface ExpiringAlert {
  batchId: string;
  batchNumber: string;
  productId: string;
  productName: string;
  expiryDate: Date;
  daysToExpiry: number;
  quantityOnHand: number;
}

export const getLowStockProducts = async (): Promise<LowStockAlert[]> => {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { batches: { where: { expiryDate: { gt: new Date() }, quantityOnHand: { gt: 0 } } } },
  });

  const alerts: LowStockAlert[] = [];
  for (const product of products) {
    const stockOnHand = product.batches.reduce((sum, b) => sum + b.quantityOnHand, 0);
    if (stockOnHand <= product.reorderLevel) {
      alerts.push({
        productId: product.id,
        productName: product.name,
        stockOnHand,
        reorderLevel: product.reorderLevel,
      });
    }
  }
  return alerts;
};

export const getExpiringBatches = async (days: number = 30): Promise<ExpiringAlert[]> => {
  const now = new Date();
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const batches = await prisma.batch.findMany({
    where: {
      expiryDate: { gt: now, lte: threshold },
      quantityOnHand: { gt: 0 },
    },
    include: { product: true },
    orderBy: { expiryDate: 'asc' },
  });

  return batches.map(b => {
    const daysToExpiry = Math.ceil((b.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      batchId: b.id,
      batchNumber: b.batchNumber,
      productId: b.productId,
      productName: b.product.name,
      expiryDate: b.expiryDate,
      daysToExpiry,
      quantityOnHand: b.quantityOnHand,
    };
  });
};

export const emitAlerts = async (): Promise<void> => {
  if (!io) return;
  try {
    const [lowStock, expiring] = await Promise.all([
      getLowStockProducts(),
      getExpiringBatches(90),
    ]);
    io.emit('stock:low', lowStock);
    io.emit('stock:expiring', expiring);
  } catch (err) {
    console.error('[AlertEngine] Failed to emit alerts:', err);
  }
};
