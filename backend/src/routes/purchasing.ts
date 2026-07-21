import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { generatePONumber } from '../utils/saleNumber';

const router = Router();
router.use(authenticate);

// Suppliers endpoints
router.get('/suppliers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
    res.json(suppliers);
  } catch (err) { next(err); }
});

router.post('/suppliers', requireRole('ADMIN', 'INVENTORY_CLERK'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, contactPerson, phone, email, address } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, contactPerson, phone, email, address },
    });
    res.status(201).json(supplier);
  } catch (err) { next(err); }
});

// Purchase Orders endpoints
router.get('/purchase-orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(pos);
  } catch (err) { next(err); }
});

router.post('/purchase-orders', requireRole('ADMIN', 'INVENTORY_CLERK'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { supplierId, expectedDate, items } = req.body;
    const poNumber = await generatePONumber();

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        createdBy: req.user!.userId,
        items: {
          create: (items || []).map((i: { productId: string; quantityOrdered: number; unitCost: number }) => ({
            productId: i.productId,
            quantityOrdered: i.quantityOrdered,
            unitCost: i.unitCost,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(po);
  } catch (err) { next(err); }
});

export default router;
