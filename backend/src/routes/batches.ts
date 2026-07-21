import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createBatchSchema } from '../schemas/batch.schema';
import { emitAlerts } from '../services/alertEngine';

const router = Router();
router.use(authenticate);

router.post('/', requireRole('ADMIN', 'INVENTORY_CLERK'), validate(createBatchSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, batchNumber, expiryDate, quantityOnHand, costPrice, sellingPrice, supplierId } = req.body;

    const batch = await prisma.batch.create({
      data: {
        productId,
        batchNumber,
        expiryDate: new Date(expiryDate),
        quantityOnHand,
        costPrice,
        sellingPrice,
        supplierId,
      },
    });

    // Write stock movement
    await prisma.stockMovement.create({
      data: {
        productId,
        batchId: batch.id,
        type: 'PURCHASE_IN',
        quantity: quantityOnHand,
        performedBy: req.user!.userId,
        reason: `Batch ${batchNumber} received`,
      },
    });

    await emitAlerts();
    res.status(201).json(batch);
  } catch (err) { next(err); }
});

export default router;
