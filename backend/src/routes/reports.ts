import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();
router.use(authenticate, requireRole('ADMIN', 'PHARMACIST'));

router.get('/sales', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { status: 'COMPLETED' };
    if (from || to) {
      const createdAtFilter: Record<string, Date> = {};
      if (from && !isNaN(Date.parse(from))) createdAtFilter.gte = new Date(from);
      if (to && !isNaN(Date.parse(to))) createdAtFilter.lte = new Date(to);
      if (Object.keys(createdAtFilter).length > 0) where.createdAt = createdAtFilter;
    }
    const sales = await prisma.sale.findMany({
      where,
      include: { items: { include: { product: true } }, customer: true },
      orderBy: { createdAt: 'desc' },
    });
    const totalRevenue = sales.reduce((s, sale) => s + sale.totalAmount, 0);
    const totalTax = sales.reduce((s, sale) => s + sale.taxAmount, 0);
    res.json({ sales, summary: { count: sales.length, totalRevenue, totalTax } });
  } catch (err) { next(err); }
});

router.get('/inventory-valuation', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const batches = await prisma.batch.findMany({
      where: { expiryDate: { gt: now }, quantityOnHand: { gt: 0 } },
      include: { product: { select: { id: true, name: true } } },
    });
    const totalValue = batches.reduce((s, b) => s + b.quantityOnHand * b.costPrice, 0);
    res.json({ batches, totalValue });
  } catch (err) { next(err); }
});

router.get('/expiry', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const batches = await prisma.batch.findMany({
      where: { quantityOnHand: { gt: 0 } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { expiryDate: 'asc' },
    });
    const expired = batches.filter(b => b.expiryDate <= now);
    const expiring30 = batches.filter(b => b.expiryDate > now && b.expiryDate <= new Date(now.getTime() + 30 * 86400000));
    const expiring60 = batches.filter(b => b.expiryDate > new Date(now.getTime() + 30 * 86400000) && b.expiryDate <= new Date(now.getTime() + 60 * 86400000));
    const expiring90 = batches.filter(b => b.expiryDate > new Date(now.getTime() + 60 * 86400000) && b.expiryDate <= new Date(now.getTime() + 90 * 86400000));
    res.json({ expired, expiring30, expiring60, expiring90 });
  } catch (err) { next(err); }
});

router.get('/profit-margin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { status: 'COMPLETED' };
    if (from || to) {
      const createdAtFilter: Record<string, Date> = {};
      if (from && !isNaN(Date.parse(from))) createdAtFilter.gte = new Date(from);
      if (to && !isNaN(Date.parse(to))) createdAtFilter.lte = new Date(to);
      if (Object.keys(createdAtFilter).length > 0) where.createdAt = createdAtFilter;
    }
    const sales = await prisma.sale.findMany({
      where,
      include: { items: { include: { batch: true } } },
    });
    let revenue = 0, cost = 0;
    for (const sale of sales) {
      revenue += sale.totalAmount;
      for (const item of sale.items) {
        cost += item.quantity * (item.batch?.costPrice || 0);
      }
    }
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    res.json({ revenue, cost, profit, marginPercent: Math.round(margin * 100) / 100 });
  } catch (err) { next(err); }
});

export default router;
