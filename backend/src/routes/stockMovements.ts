import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { stockMovementSchema } from '../schemas/batch.schema';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { emitAlerts } from '../services/alertEngine';
import { writeAuditLog } from '../utils/auditLog';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, type } = req.query as Record<string, string>;
    const pagination = parsePagination(req.query);
    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true } },
          batch: { select: { id: true, batchNumber: true } },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    res.json(paginatedResponse(movements, total, pagination));
  } catch (err) { next(err); }
});

router.post('/', requireRole('ADMIN', 'INVENTORY_CLERK'), validate(stockMovementSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, batchId, type, quantity, reason } = req.body;

    // For OUT movements, validate stock availability
    if (['ADJUSTMENT_OUT', 'TRANSFER_OUT', 'EXPIRED_WRITEOFF'].includes(type)) {
      if (!batchId) {
        res.status(400).json({ error: 'batchId is required for stock-out movements' });
        return;
      }
      const batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (!batch || batch.quantityOnHand < quantity) {
        res.status(400).json({ error: `Insufficient batch stock. Available: ${batch?.quantityOnHand ?? 0}` });
        return;
      }
      // Decrement batch
      await prisma.batch.update({
        where: { id: batchId },
        data: { quantityOnHand: { decrement: quantity } },
      });
    } else if (['ADJUSTMENT_IN', 'TRANSFER_IN'].includes(type)) {
      if (batchId) {
        await prisma.batch.update({
          where: { id: batchId },
          data: { quantityOnHand: { increment: quantity } },
        });
      }
    }

    const movement = await prisma.stockMovement.create({
      data: { productId, batchId, type, quantity, reason, performedBy: req.user!.userId },
    });

    await writeAuditLog({
      userId: req.user!.userId,
      action: `STOCK_${type}`,
      entityType: 'Batch',
      entityId: batchId || productId,
      after: { quantity, reason },
      ipAddress: req.ip,
    });

    await emitAlerts();
    res.status(201).json(movement);
  } catch (err) { next(err); }
});

export default router;
