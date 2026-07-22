import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const router = Router();
router.use(authenticate);

// GET /api/products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, categoryId, barcode, stockStatus } = req.query;
    const pagination = parsePagination(req.query);

    const where: Record<string, unknown> = { active: true };

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { genericName: { contains: String(search), mode: 'insensitive' } },
        { brandName: { contains: String(search), mode: 'insensitive' } },
        { barcode: { contains: String(search) } },
      ];
    }
    if (categoryId) where.categoryId = String(categoryId);
    if (barcode) where.barcode = String(barcode);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          category: { select: { id: true, name: true } },
          batches: {
            where: { quantityOnHand: { gt: 0 }, expiryDate: { gt: new Date() } },
            select: { quantityOnHand: true, costPrice: true, expiryDate: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    const enriched = products.map(p => {
      const stockOnHand = p.batches.reduce((sum, b) => sum + b.quantityOnHand, 0);
      const totalCostValue = p.batches.reduce((sum, b) => sum + (b.costPrice * b.quantityOnHand), 0);
      const weightedCost = stockOnHand > 0 ? (totalCostValue / stockOnHand) : (p.defaultCostPrice || 0);
      const costPrice = weightedCost > 0 ? weightedCost : (p.defaultCostPrice || 0);
      const unitProfit = Math.max(0, p.defaultSellingPrice - costPrice);
      const grossMarginPct = p.defaultSellingPrice > 0 ? ((p.defaultSellingPrice - costPrice) / p.defaultSellingPrice) * 100 : 0;
      const { batches, ...rest } = p;
      void batches;
      return { ...rest, stockOnHand, costPrice, avgCostPrice: weightedCost, unitProfit, grossMarginPct };
    });

    let filtered = enriched;
    if (stockStatus === 'in_stock') filtered = enriched.filter(p => p.stockOnHand > p.reorderLevel);
    if (stockStatus === 'low_stock') filtered = enriched.filter(p => p.stockOnHand > 0 && p.stockOnHand <= p.reorderLevel);
    if (stockStatus === 'out_of_stock') filtered = enriched.filter(p => p.stockOnHand === 0);

    res.json(paginatedResponse(filtered, total, pagination));
  } catch (err) { next(err); }
});

// POST /api/products
router.post('/', requireRole('ADMIN', 'INVENTORY_CLERK'), validate(createProductSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.json(product);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') { res.status(409).json({ error: 'A product with this barcode already exists' }); return; }
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
      include: {
        category: true,
        batches: {
          orderBy: { expiryDate: 'asc' },
          include: { supplier: { select: { id: true, name: true } } },
        },
      },
    });
    if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
    const validBatches = product.batches.filter((b: { expiryDate: Date; quantityOnHand: number }) => b.expiryDate > now && b.quantityOnHand > 0);
    const stockOnHand = validBatches.reduce((s: number, b: { quantityOnHand: number }) => s + b.quantityOnHand, 0);
    const totalCost = validBatches.reduce((s: number, b: { costPrice: number; quantityOnHand: number }) => s + (b.costPrice * b.quantityOnHand), 0);
    const avgCostPrice = stockOnHand > 0 ? (totalCost / stockOnHand) : (product.defaultCostPrice || 0);
    const costPrice = avgCostPrice > 0 ? avgCostPrice : (product.defaultCostPrice || 0);
    const unitProfit = Math.max(0, product.defaultSellingPrice - costPrice);
    const grossMarginPct = product.defaultSellingPrice > 0 ? ((product.defaultSellingPrice - costPrice) / product.defaultSellingPrice) * 100 : 0;

    res.json({ ...product, stockOnHand, costPrice, avgCostPrice, unitProfit, grossMarginPct });
  } catch (err) { next(err); }
});

// PATCH /api/products/:id
router.patch('/:id', requireRole('ADMIN', 'INVENTORY_CLERK'), validate(updateProductSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id as string }, data: req.body });

    // Sync active batches' cost price if defaultCostPrice was updated
    if (typeof req.body.defaultCostPrice === 'number' && req.body.defaultCostPrice >= 0) {
      await prisma.batch.updateMany({
        where: { productId: req.params.id as string },
        data: { costPrice: req.body.defaultCostPrice },
      });
    }

    res.json(product);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') { res.status(409).json({ error: 'A product with this barcode already exists' }); return; }
    if (e.code === 'P2025') { res.status(404).json({ error: 'Product not found' }); return; }
    next(err);
  }
});

// DELETE /api/products/:id — soft delete
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.product.update({ where: { id: req.params.id as string }, data: { active: false } });
    res.json({ message: 'Product deactivated' });
  } catch (err) { next(err); }
});

export default router;
