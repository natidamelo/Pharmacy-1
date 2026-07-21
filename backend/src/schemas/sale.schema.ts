import { z } from 'zod';

export const createSaleSchema = z.object({
  body: z.object({
    customerId: z.string().optional(),
    prescriptionId: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'MOBILE_MONEY', 'INSURANCE']),
    discountAmount: z.number().min(0).default(0),
    notes: z.string().optional(),
    items: z.array(z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      discount: z.number().min(0).default(0),
    })).min(1, 'At least one item is required'),
  }),
});
