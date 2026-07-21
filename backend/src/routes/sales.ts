import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createSaleSchema } from '../schemas/sale.schema';
import { resolveFEFO } from '../services/fefo';
import { generateSaleNumber } from '../utils/saleNumber';
import { writeAuditLog } from '../utils/auditLog';
import { emitAlerts } from '../services/alertEngine';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const router = Router();

// POST /api/sales — Create POS Sale with FEFO resolution
router.post('/', requireRole('ADMIN', 'PHARMACIST', 'CASHIER'), validate(createSaleSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, prescriptionId, paymentMethod, discountAmount = 0, notes, items } = req.body;
    const cashierId = req.user!.userId;

    // Resolve FEFO allocations for all items
    const allocations: Array<{
      item: { productId: string; quantity: number; unitPrice: number; discount: number };
      product: { id: string; name: string; requiresPrescription: boolean; isControlledSubstance: boolean; taxRate: number };
      batchAllocations: Array<{ batchId: string; batchNumber: string; quantity: number; unitPrice: number }>;
    }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.active) {
        res.status(400).json({ error: `Product not found or inactive: ${item.productId}` });
        return;
      }

      // Enforce Rx check if required
      if (product.requiresPrescription && !prescriptionId) {
        res.status(400).json({ error: `Product "${product.name}" requires a prescription` });
        return;
      }

      const batchAllocations = await resolveFEFO(item.productId, item.quantity, item.unitPrice);
      allocations.push({ item, product, batchAllocations });
    }

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    for (const { item, product } of allocations) {
      const lineSub = (item.unitPrice * item.quantity) - item.discount;
      subtotal += lineSub;
      taxAmount += lineSub * product.taxRate;
    }

    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);
    const saleNumber = await generateSaleNumber();

    // Prepare sale items and stock movement data
    const saleItemsData: Array<{
      productId: string;
      batchId: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      lineTotal: number;
    }> = [];

    const batchUpdates: Array<{ id: string; decrement: number }> = [];
    const movementData: Array<{
      productId: string;
      batchId: string;
      type: 'SALE_OUT';
      quantity: number;
      performedBy: string;
    }> = [];

    for (const { item, product, batchAllocations } of allocations) {
      void product;
      for (const alloc of batchAllocations) {
        const lineTotal = (alloc.unitPrice * alloc.quantity) - (item.discount * (alloc.quantity / item.quantity));
        saleItemsData.push({
          productId: item.productId,
          batchId: alloc.batchId,
          quantity: alloc.quantity,
          unitPrice: alloc.unitPrice,
          discount: item.discount * (alloc.quantity / item.quantity),
          lineTotal,
        });

        batchUpdates.push({ id: alloc.batchId, decrement: alloc.quantity });
        movementData.push({
          productId: item.productId,
          batchId: alloc.batchId,
          type: 'SALE_OUT',
          quantity: alloc.quantity,
          performedBy: cashierId,
        });
      }
    }

    // Create Sale
    const sale = await prisma.sale.create({
      data: {
        saleNumber,
        customerId: customerId || null,
        cashierId,
        prescriptionId: prescriptionId || null,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentMethod,
        notes,
        items: { create: saleItemsData },
      },
      include: {
        items: { include: { product: { select: { id: true, name: true } }, batch: { select: { batchNumber: true } } } },
        customer: { select: { id: true, name: true } },
      },
    });

    // Decrement batches
    await Promise.all(
      batchUpdates.map(u =>
        prisma.batch.update({ where: { id: u.id }, data: { quantityOnHand: { decrement: u.decrement } } })
      )
    );

    // Write stock movements
    await prisma.stockMovement.createMany({
      data: movementData.map(m => ({ ...m, referenceId: sale.id })),
    });

    // Audit controlled substances
    for (const { item, product } of allocations) {
      if (product.isControlledSubstance) {
        await writeAuditLog({
          userId: req.user!.userId,
          action: 'CONTROLLED_SUBSTANCE_SALE',
          entityType: 'Product',
          entityId: item.productId,
          after: { saleId: sale.id, quantity: item.quantity, saleNumber },
          ipAddress: req.ip,
        });
      }
    }

    await emitAlerts();
    res.status(201).json(sale);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message?.includes('Insufficient stock')) {
      res.status(400).json({ error: e.message });
      return;
    }
    next(err);
  }
});

// GET /api/sales
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = parsePagination(req.query);
    const { cashierId, status, from, to } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (cashierId) where.cashierId = cashierId;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, Date>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, Date>).lte = new Date(to);
    }

    if (req.user!.role === 'CASHIER') where.cashierId = req.user!.userId;

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: { customer: { select: { id: true, name: true } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sale.count({ where }),
    ]);

    res.json(paginatedResponse(sales, total, pagination));
  } catch (err) { next(err); }
});

// GET /api/sales/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id as string },
      include: {
        items: { include: { product: true, batch: true } },
        customer: true,
      },
    });
    if (!sale) { res.status(404).json({ error: 'Sale not found' }); return; }
    res.json(sale);
  } catch (err) { next(err); }
});

// POST /api/sales/:id/refund
router.post('/:id/refund', requireRole('ADMIN', 'PHARMACIST'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id as string },
      include: { items: true },
    });
    if (!sale) { res.status(404).json({ error: 'Sale not found' }); return; }
    if (sale.status !== 'COMPLETED') {
      res.status(400).json({ error: `Sale is already ${sale.status}` });
      return;
    }

    await prisma.sale.update({ where: { id: sale.id }, data: { status: 'REFUNDED' } });

    // Restore stock
    await Promise.all(
      sale.items.map((item: { batchId: string; quantity: number }) =>
        prisma.batch.update({ where: { id: item.batchId }, data: { quantityOnHand: { increment: item.quantity } } })
      )
    );

    // Write RETURN_IN movements
    await prisma.stockMovement.createMany({
      data: sale.items.map((item: { productId: string; batchId: string; quantity: number }) => ({
        productId: item.productId,
        batchId: item.batchId,
        type: 'RETURN_IN' as const,
        quantity: item.quantity,
        referenceId: sale.id,
        performedBy: req.user!.userId,
        reason: `Refund of ${sale.saleNumber}`,
      })),
    });

    await emitAlerts();
    res.json({ message: 'Sale refunded', saleId: sale.id });
  } catch (err) { next(err); }
});

export default router;
