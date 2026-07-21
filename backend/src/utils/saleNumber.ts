import prisma from '../lib/prisma';

export const generateSaleNumber = async (): Promise<string> => {
  const today = new Date();
  const prefix = `SAL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const count = await prisma.sale.count({
    where: {
      saleNumber: { startsWith: prefix },
    },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};

export const generatePONumber = async (): Promise<string> => {
  const today = new Date();
  const prefix = `PO-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.purchaseOrder.count({
    where: { poNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};
