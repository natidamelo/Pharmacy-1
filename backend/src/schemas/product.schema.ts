import { z } from 'zod';

const DosageFormEnum = z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS', 'INHALER', 'OTHER']);

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    genericName: z.string().optional(),
    brandName: z.string().optional(),
    categoryId: z.string().min(1),
    dosageForm: DosageFormEnum,
    strength: z.string().optional(),
    manufacturer: z.string().optional(),
    barcode: z.string().optional(),
    unitOfMeasure: z.string().min(1),
    packSize: z.number().int().positive().default(1),
    reorderLevel: z.number().int().min(0).default(10),
    isControlledSubstance: z.boolean().default(false),
    requiresPrescription: z.boolean().default(false),
    defaultSellingPrice: z.number().min(0),
    defaultCostPrice: z.number().min(0).default(0),
    taxRate: z.number().min(0).max(1).default(0),
    efdaRegistrationNo: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    genericName: z.string().optional(),
    brandName: z.string().optional(),
    categoryId: z.string().optional(),
    dosageForm: DosageFormEnum.optional(),
    strength: z.string().optional(),
    manufacturer: z.string().optional(),
    barcode: z.string().optional(),
    unitOfMeasure: z.string().optional(),
    packSize: z.number().int().positive().optional(),
    reorderLevel: z.number().int().min(0).optional(),
    isControlledSubstance: z.boolean().optional(),
    requiresPrescription: z.boolean().optional(),
    defaultSellingPrice: z.number().min(0).optional(),
    defaultCostPrice: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(1).optional(),
    efdaRegistrationNo: z.string().optional(),
    active: z.boolean().optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    barcode: z.string().optional(),
    stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
    page: z.string().optional(),
    pageSize: z.string().optional(),
  }),
});
