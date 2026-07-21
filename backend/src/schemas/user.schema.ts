import { z } from 'zod';

const RoleEnum = z.enum(['ADMIN', 'PHARMACIST', 'CASHIER', 'INVENTORY_CLERK']);

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: RoleEnum,
    phone: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: RoleEnum.optional(),
    phone: z.string().optional(),
    active: z.boolean().optional(),
    password: z.string().min(8).optional(),
  }),
});
