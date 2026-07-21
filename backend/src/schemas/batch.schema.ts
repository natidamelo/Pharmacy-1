import { z } from 'zod';

export const createBatchSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    batchNumber: z.string().min(1),
    expiryDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
    quantityOnHand: z.number().int().positive(),
    costPrice: z.number().positive(),
    sellingPrice: z.number().positive().optional(),
    supplierId: z.string().optional(),
  }),
});

export const stockMovementSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    batchId: z.string().optional(),
    type: z.enum(['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'EXPIRED_WRITEOFF']),
    quantity: z.number().int().positive(),
    reason: z.string().min(1, 'Reason is required for adjustments'),
  }),
});
