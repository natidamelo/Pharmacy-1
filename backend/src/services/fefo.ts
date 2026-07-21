import prisma from '../lib/prisma';

export interface BatchAllocation {
  batchId: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Resolves FEFO (First Expired, First Out) allocation for a product.
 * Returns an array of batch allocations summing to `quantity`.
 * Throws if total valid (non-expired) stock < requested quantity.
 */
export const resolveFEFO = async (
  productId: string,
  quantity: number,
  sellingPrice?: number
): Promise<BatchAllocation[]> => {
  const now = new Date();

  // Get all non-expired batches with stock, ordered FEFO (soonest expiry first)
  const batches = await prisma.batch.findMany({
    where: {
      productId,
      quantityOnHand: { gt: 0 },
      expiryDate: { gt: now }, // Never include expired stock
    },
    orderBy: { expiryDate: 'asc' },
  });

  const totalAvailable = batches.reduce((sum, b) => sum + b.quantityOnHand, 0);
  if (totalAvailable < quantity) {
    throw new Error(
      `Insufficient stock. Requested: ${quantity}, available: ${totalAvailable}`
    );
  }

  const allocations: BatchAllocation[] = [];
  let remaining = quantity;

  for (const batch of batches) {
    if (remaining <= 0) break;
    const take = Math.min(batch.quantityOnHand, remaining);
    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      quantity: take,
      unitPrice: sellingPrice ?? batch.sellingPrice ?? batch.costPrice,
    });
    remaining -= take;
  }

  return allocations;
};
