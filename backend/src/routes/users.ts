import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireRole('ADMIN'));

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = parsePagination(req.query);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: pagination.skip,
        take: pagination.take,
        select: { id: true, name: true, email: true, role: true, phone: true, active: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    res.json(paginatedResponse(users, total, pagination));
  } catch (err) { next(err); }
});

router.post('/', validate(createUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, role, ...rest } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { ...rest, role: role as Role, passwordHash },
      select: { id: true, name: true, email: true, role: true, phone: true, active: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

router.patch('/:id', validate(updateUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, role, ...rest } = req.body;
    const updateData: Record<string, unknown> = { ...rest };
    if (role) updateData.role = role as Role;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phone: true, active: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
